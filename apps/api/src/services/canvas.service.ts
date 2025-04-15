import { Server, Socket } from "socket.io";
import { getIO } from "./socket";

// Store canvas data in memory (temporary storage)
const canvasData: Record<string, any> = {};

// Store active users for each canvas
const activeUsers: Record<string, Map<string, { id: string; name: string; cursor?: { x: number; y: number } }>> = {};

export const initCanvasService = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected to canvas:", socket.id);
    const user = (socket as any).user;

    // Handle joining a community canvas
    socket.on("join:canvas", (communityId: string) => {
      const canvasRoom = `canvas:${communityId}`;
      socket.join(canvasRoom);
      console.log(`User ${user?.name || socket.id} joined ${canvasRoom}`);

      // Initialize the active users map for this community if it doesn't exist
      if (!activeUsers[communityId]) {
        activeUsers[communityId] = new Map();
      }

      // Add user to active users
      const userData = {
        id: user?.id || socket.id,
        name: user?.name || `Guest-${socket.id.substring(0, 5)}`,
      };
      
      activeUsers[communityId].set(socket.id, userData);

      // Send existing canvas data to the new user
      if (canvasData[communityId]) {
        socket.emit("canvas:data", canvasData[communityId]);
      }

      // Send the current active users list to the new user
      socket.emit("canvas:users", Array.from(activeUsers[communityId].values()));

      // Broadcast to other users that a new user has joined
      socket.to(canvasRoom).emit("canvas:user-joined", userData);
    });

    // Handle leaving a community canvas
    socket.on("leave:canvas", (communityId: string) => {
      const canvasRoom = `canvas:${communityId}`;
      socket.leave(canvasRoom);
      console.log(`User ${user?.name || socket.id} left ${canvasRoom}`);

      // Remove user from active users
      if (activeUsers[communityId]) {
        activeUsers[communityId].delete(socket.id);

        // Broadcast to other users that this user has left
        socket.to(canvasRoom).emit("canvas:user-left", { id: user?.id || socket.id });
      }
    });

    // Handle cursor position updates
    socket.on("canvas:cursor-position", (data: { communityId: string; x: number; y: number }) => {
      const { communityId, x, y } = data;
      
      // Update user's cursor position
      if (activeUsers[communityId] && activeUsers[communityId].has(socket.id)) {
        const userData = activeUsers[communityId].get(socket.id)!;
        userData.cursor = { x, y };
        activeUsers[communityId].set(socket.id, userData);
        
        // Broadcast the cursor position to other users
        socket.to(`canvas:${communityId}`).emit("canvas:cursor-update", {
          id: userData.id,
          name: userData.name,
          cursor: { x, y }
        });
      }
    });

    // Handle canvas updates
    socket.on("canvas:update", (data: { communityId: string; elements: any[] }) => {
      const { communityId, elements } = data;
      
      // Update the canvas data
      canvasData[communityId] = elements;
      
      // Broadcast the update to all users in the community canvas room except the sender
      socket.to(`canvas:${communityId}`).emit("canvas:update", elements);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected from canvas: ${user?.name || socket.id}`);
      
      // Remove the user from all active canvases they were part of
      Object.keys(activeUsers).forEach(communityId => {
        if (activeUsers[communityId]?.has(socket.id)) {
          const userData = activeUsers[communityId].get(socket.id);
          activeUsers[communityId].delete(socket.id);
          
          // Notify others that this user has left
          if (userData) {
            socket.to(`canvas:${communityId}`).emit("canvas:user-left", { id: userData.id });
          }
        }
      });
    });
  });
};

// Function to get canvas data for a community
export const getCanvasData = (communityId: string) => {
  return canvasData[communityId] || [];
};

// Function to get active users for a community
export const getActiveUsers = (communityId: string) => {
  return Array.from((activeUsers[communityId] || new Map()).values());
}; 