import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/utils/prisma';
import { initCanvasService } from './canvas.service';

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

  // Initialize canvas service
  initCanvasService(io);

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

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${(socket as any).user?.id}`);
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
