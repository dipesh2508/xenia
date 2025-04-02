import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/utils/prisma';

let io: Server;

// Add a new map to store the current canvas state in memory
const canvasStates = new Map<string, string>();

// Function to save canvas state to database when room is empty
const saveCanvasStateToDB = async (roomId: string, canvasData: string) => {
  try {
    // Extract communityId from roomId (format: canvas:{communityId})
    const communityId = roomId.replace('canvas:', '');
    
    console.log(`Saving canvas state to DB for community ${communityId}`);
    
    // Find existing canvas for this community
    const canvas = await prisma.canvas.findFirst({
      where: { communityId }
    });
    
    if (canvas) {
      // Update existing canvas
      await prisma.canvas.update({
        where: { id: canvas.id },
        data: { snapshot: canvasData }
      });
      console.log(`Updated canvas ${canvas.id} with new snapshot`);
    } else {
      // Create new canvas
      const newCanvas = await prisma.canvas.create({
        data: {
          communityId,
          snapshot: canvasData
        }
      });
      console.log(`Created new canvas ${newCanvas.id} with snapshot`);
    }
  } catch (error) {
    console.error('Error saving canvas state to DB:', error);
  }
};

// Socket middleware to authenticate connections
const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Get cookies from handshake
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error('Authentication failed: No cookies provided'));
    }
    
    // Parse cookies to get the JWT token
    const cookieArray = cookies.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookieArray.find(cookie => cookie.startsWith('token='));
    
    if (!tokenCookie) {
      return next(new Error('Authentication failed: No token cookie'));
    }
    
    const token = tokenCookie.split('=')[1];
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      return next(new Error('JWT_SECRET is not configured'));
    }

    if(!token) {
      return next(new Error('Authentication failed: No token provided'));
    }
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET) as unknown as { id: string };
    
    if (!decoded || !decoded.id) {
      return next(new Error('Authentication failed: Invalid token'));
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return next(new Error('Authentication failed: User not found'));
    }
    
    // Attach user to socket for later use
    (socket as any).user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

export const initSocketServer = (server: HttpServer): void => {
  // Ensure io isn't already initialized
  if (io) {
    console.warn('Socket.IO server already initialized');
    return;
  }

  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.FRONTEND_URL || 'https://xenia-web.vercel.app',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    // Increase ping timeout to prevent premature disconnections
    pingTimeout: 60000,
    // Add additional configurations for serverless environment
    allowEIO3: true,
    connectTimeout: 45000
  });

  console.log('Socket.IO initialized with CORS origin:', 
    process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.FRONTEND_URL || 'https://xenia-web.vercel.app'
  );

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Keep track of active users in each canvas room
  const canvasActiveUsers = new Map<string, Set<string>>();
  const userDataCache = new Map<string, any>();

  // Keep track of when we last requested a sync for each room
  const lastSyncRequestTime = new Map<string, number>();

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${(socket as any).user?.id}`);
    
    // Join a specific chat room
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${(socket as any).user?.id} joined room ${roomId}`);
    });
    
    // Leave a specific chat room
    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${(socket as any).user?.id} left room ${roomId}`);
    });
    
    // Handle joining community rooms
    socket.on("join:community", (communityId: string) => {
      socket.join(`community:${communityId}`);
      console.log(`Socket ${socket.id} joined community:${communityId}`);
    });

    // Handle leaving community rooms
    socket.on("leave:community", (communityId: string) => {
      socket.leave(`community:${communityId}`);
      console.log(`Socket ${socket.id} left community:${communityId}`);
    });

    // Canvas events
    // User joins canvas
    socket.on("canvas:join", ({ roomId, user }) => {
      socket.join(roomId);
      console.log(`User ${user.id} (${user.name}) joined canvas room ${roomId}`);
      
      // Store user data in cache
      userDataCache.set(user.id, user);
      
      // Add user to active users for this room
      if (!canvasActiveUsers.has(roomId)) {
        canvasActiveUsers.set(roomId, new Set());
      }
      canvasActiveUsers.get(roomId)?.add(user.id);
      
      // Log active users before emitting
      const activeUsers = Array.from(canvasActiveUsers.get(roomId) || []);
      console.log(`Active users in ${roomId} before emitting join:`, 
        activeUsers.length,
        activeUsers.map(id => ({ id, name: userDataCache.get(id)?.name }))
      );
      
      // Broadcast to all clients in the room that a new user joined
      io.to(roomId).emit("canvas:userJoined", user);
    });
    
    // User leaves canvas
    socket.on("canvas:leave", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`User ${userId} left canvas room ${roomId}`);
      
      // Remove user from active users for this room
      canvasActiveUsers.get(roomId)?.delete(userId);
      
      // Get current count of users in the room
      const usersCount = canvasActiveUsers.get(roomId)?.size || 0;
      console.log(`Remaining users in ${roomId}: ${usersCount}`);
      
      // If room is empty and we have a canvas state, save it to the database
      if (usersCount === 0 && canvasStates.has(roomId)) {
        const canvasData = canvasStates.get(roomId);
        if (canvasData) {
          saveCanvasStateToDB(roomId, canvasData);
          // Clear the canvas state from memory after saving
          canvasStates.delete(roomId);
        }
        
        // Remove the room from active users tracking
        canvasActiveUsers.delete(roomId);
      }
      
      // Broadcast to all clients in the room that a user left
      io.to(roomId).emit("canvas:userLeft", userId);
    });
    
    // Handle request for active users in a room
    socket.on("canvas:requestActiveUsers", ({ roomId }) => {
      if (canvasActiveUsers.has(roomId)) {
        const activeUserIds = Array.from(canvasActiveUsers.get(roomId) || []);
        const activeUsersData = activeUserIds
          .map(id => userDataCache.get(id))
          .filter(Boolean);
        
        console.log(`Sending active users data for ${roomId}:`, 
          activeUsersData.length,
          activeUsersData.map(u => ({ id: u.id, name: u.name }))
        );
        
        // Send the active users data to the requesting client
        socket.emit("canvas:activeUsers", activeUsersData);
      } else {
        console.log(`No active users in ${roomId}`);
        socket.emit("canvas:activeUsers", []);
      }
    });
    
    // User mouse movement
    socket.on("canvas:userMovement", ({ roomId, userId, position }) => {
      // Broadcast the user's cursor position to other users in the room
      socket.to(roomId).emit("canvas:userMovement", { userId, position });
    });
    
    // Drawing events
    socket.on("canvas:draw", (drawingData) => {
      const { roomId, type, ...rest } = drawingData;
      
      // Log drawing events for debugging
      console.log(`Drawing event from ${(socket as any).user?.id} in ${roomId}: ${type}`);
      
      try {
        // Broadcast only to other clients in the room, not back to the sender
        socket.to(roomId).emit("canvas:draw", { type, ...rest });
        
        // For significant drawing events, we want to ensure we have the latest state in memory
        // But we need to debounce this to avoid too many sync requests
        const significantEvents = ['clear', 'circle', 'rectangle', 'line'];
        if (significantEvents.includes(type)) {
          const now = Date.now();
          const lastSync = lastSyncRequestTime.get(roomId) || 0;
          
          // Only request a sync if we haven't requested one in the last 2 seconds
          if (now - lastSync > 2000) {
            lastSyncRequestTime.set(roomId, now);
            
            // Use a timeout to let the drawing be applied first
            setTimeout(() => {
              // Request the current drawer to send the full canvas state
              socket.emit("canvas:requestSync", { userId: (socket as any).user?.id });
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error broadcasting drawing event:", error);
      }
    });
    
    // Request for canvas sync (when a user joins late)
    socket.on("canvas:requestSync", ({ roomId }) => {
      const userId = (socket as any).user?.id;
      console.log(`Canvas sync requested by ${userId} in room ${roomId}`);
      
      // Broadcast a request for the current canvas state
      socket.to(roomId).emit("canvas:requestSync", { userId });
    });
    
    // Provide canvas sync
    socket.on("canvas:provideSync", ({ roomId, canvasData }) => {
      // Log sync event (without full data URL for brevity)
      console.log(`Canvas sync provided in room ${roomId}, data length: ${canvasData ? canvasData.length : 0}`);
      
      // Save the canvas state in memory
      if (canvasData) {
        canvasStates.set(roomId, canvasData);
      }
      
      // Forward the canvas data to all users in the room
      io.to(roomId).emit("canvas:sync", canvasData);
    });

    // User activity heartbeat
    socket.on("canvas:userActivity", ({ roomId, userId, timestamp }) => {
      console.log(`User activity heartbeat from ${userId} in ${roomId}`);
      
      // Update the user's last active timestamp without triggering join events
      if (canvasActiveUsers.has(roomId)) {
        if (!canvasActiveUsers.get(roomId)?.has(userId)) {
          canvasActiveUsers.get(roomId)?.add(userId);
        }
      } else {
        canvasActiveUsers.set(roomId, new Set([userId]));
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = (socket as any).user?.id;
      console.log(`User disconnected: ${userId}`);
      
      // Remove user from all canvas rooms they were in
      canvasActiveUsers.forEach((users, roomId) => {
        if (users.has(userId)) {
          users.delete(userId);
          
          // Get current count of users in the room
          const usersCount = users.size;
          console.log(`After disconnect: Remaining users in ${roomId}: ${usersCount}`);
          
          // If room is empty and we have a canvas state, save it to the database
          if (usersCount === 0 && canvasStates.has(roomId)) {
            const canvasData = canvasStates.get(roomId);
            if (canvasData) {
              saveCanvasStateToDB(roomId, canvasData);
              // Clear the canvas state from memory after saving
              canvasStates.delete(roomId);
            }
            
            // Remove the room from active users tracking
            canvasActiveUsers.delete(roomId);
          } else {
            // Notify others that this user left
            io.to(roomId).emit("canvas:userLeft", userId);
          }
        }
      });
      
      // Clear user data from cache
      userDataCache.delete(userId);
    });
  });

  console.log('Socket.IO server initialized successfully');
  
  // Setup periodic canvas sync to ensure we have the latest state in memory
  setInterval(() => {
    // For each active canvas room, request a sync from one of the users
    canvasActiveUsers.forEach((users, roomId) => {
      if (users.size > 0) {
        // Get the first user in the room
        const userId = Array.from(users)[0];
        console.log(`Requesting periodic canvas sync for ${roomId} from user ${userId}`);
        
        // Find a socket for this user and request a sync
        const sockets = Array.from(io.sockets.sockets.values());
        for (const socket of sockets) {
          if ((socket as any).user?.id === userId) {
            socket.emit("canvas:requestSync", { userId });
            break;
          }
        }
      }
    });
  }, 60000); // Every minute
};

// Function to get the io instance
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Please call initSocketServer first.');
  }
  return io;
};

// Function to get the Socket.IO instance
export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Please call initSocketServer first.");
  }
  return io;
};

// Export the socket server
export { io };
