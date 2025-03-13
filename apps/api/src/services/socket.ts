import { Server } from "socket.io";
import http from "http";
import { verifyJWT } from "@/utils/jwt";
import { prisma } from "@repo/database";
import { User } from "@prisma/client";

// Export socket.io server instance
export let io: Server;

export const initSocketServer = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket middleware to authenticate users
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      const decoded = verifyJWT(token);
      
      if (!decoded || !decoded.id) {
        return next(new Error("Authentication error: Invalid token"));
      }
      
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      
      // Attach user to socket
      socket.data.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      };
      
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    const user = socket.data.user as Partial<User>;
    console.log(`User connected: ${user.name} (${user.id})`);
    
    // Join a chat room
    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${user.id} joined chat: ${chatId}`);
    });
    
    // Leave a chat room
    socket.on("leaveChat", (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${user.id} left chat: ${chatId}`);
    });
    
    // Handle message typing status
    socket.on("typing", ({ chatId, isTyping }: { chatId: string, isTyping: boolean }) => {
      socket.to(chatId).emit("userTyping", {
        userId: user.id,
        userName: user.name,
        isTyping
      });
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.name} (${user.id})`);
    });
  });

  return io;
};
