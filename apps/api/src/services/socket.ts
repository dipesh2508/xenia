import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/utils/prisma';

let io: Server;

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
      console.log(`User ${user.id} joined canvas room ${roomId}`);
      
      // Store user data in cache
      userDataCache.set(user.id, user);
      
      // Add user to active users for this room
      if (!canvasActiveUsers.has(roomId)) {
        canvasActiveUsers.set(roomId, new Set());
      }
      canvasActiveUsers.get(roomId)?.add(user.id);
      
      // Broadcast to all clients in the room that a new user joined
      io.to(roomId).emit("canvas:userJoined", user);
      
      // Log active users in this room
      console.log(`Active users in ${roomId}:`, 
        Array.from(canvasActiveUsers.get(roomId) || []).length);
    });
    
    // User leaves canvas
    socket.on("canvas:leave", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`User ${userId} left canvas room ${roomId}`);
      
      // Remove user from active users for this room
      canvasActiveUsers.get(roomId)?.delete(userId);
      
      // If room is empty, remove it from the map
      if (canvasActiveUsers.get(roomId)?.size === 0) {
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
        
        // Send the active users data to the requesting client
        socket.emit("canvas:activeUsers", activeUsersData);
      }
    });
    
    // User mouse movement
    socket.on("canvas:userMovement", ({ roomId, userId, position }) => {
      // Broadcast the user's cursor position to other users in the room
      socket.to(roomId).emit("canvas:userMovement", { userId, position });
    });
    
    // Drawing events
    socket.on("canvas:draw", (drawingData) => {
      const { roomId, ...rest } = drawingData;
      
      // Log drawing events for debugging
      console.log(`Drawing event from ${(socket as any).user?.id} in ${roomId}:`, rest.type);
      
      try {
        // Ensure reliable delivery by broadcasting to all clients in the room
        io.to(roomId).emit("canvas:draw", rest);
      } catch (error) {
        console.error("Error broadcasting drawing event:", error);
      }
    });
    
    // Request for canvas sync (when a user joins late)
    socket.on("canvas:requestSync", ({ roomId }) => {
      // Broadcast a request for the current canvas state
      socket.to(roomId).emit("canvas:requestSync", { userId: (socket as any).user?.id });
    });
    
    // Provide canvas sync
    socket.on("canvas:provideSync", ({ roomId, canvasData }) => {
      // Forward the canvas data to all users in the room
      io.to(roomId).emit("canvas:sync", canvasData);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = (socket as any).user?.id;
      console.log(`User disconnected: ${userId}`);
      
      // Remove user from all canvas rooms they were in
      canvasActiveUsers.forEach((users, roomId) => {
        if (users.has(userId)) {
          users.delete(userId);
          if (users.size === 0) {
            canvasActiveUsers.delete(roomId);
          }
          io.to(roomId).emit("canvas:userLeft", userId);
        }
      });
      
      // Clear user data from cache
      userDataCache.delete(userId);
    });
  });

  console.log('Socket.IO server initialized successfully');
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
