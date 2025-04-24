import { Server, Socket } from "socket.io";
import { getIO } from "./socket";

// Store canvas data in memory (temporary storage)
const canvasData: Record<string, any> = {};

// Store active users for each canvas
const activeUsers: Record<string, Map<string, { id: string; name: string; cursor?: { x: number; y: number } }>> = {};

export const initCanvasService = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;

    // Handle joining a community canvas
    socket.on("join:canvas", (communityId: string) => {
      const canvasRoom = `canvas:${communityId}`;
      socket.join(canvasRoom);
      
      // Make sure we have user info, even if it's a guest
      const userName = user?.name || `Guest-${socket.id.substring(0, 5)}`;
      // Use socket.id as the user ID for proper cursor tracking
      const userId = socket.id;

      // Initialize the active users map for this community if it doesn't exist
      if (!activeUsers[communityId]) {
        activeUsers[communityId] = new Map();
      }

      // Add user to active users
      const userData = {
        id: userId, // Using socket.id for tracking
        name: userName,
      };
      
      activeUsers[communityId].set(socket.id, userData);

      // Send existing canvas data to the new user
      if (canvasData[communityId]) {
        socket.emit("canvas:data", canvasData[communityId]);
      }

      // Send the current active users list to the new user
      const usersList = Array.from(activeUsers[communityId].values());
      socket.emit("canvas:users", usersList);

      // Broadcast to other users that a new user has joined
      socket.to(canvasRoom).emit("canvas:user-joined", userData);
    });

    // Handle leaving a community canvas
    socket.on("leave:canvas", (communityId: string) => {
      const canvasRoom = `canvas:${communityId}`;
      socket.leave(canvasRoom);
      
      const userId = socket.id;

      // Remove user from active users
      if (activeUsers[communityId]) {
        activeUsers[communityId].delete(socket.id);

        // Broadcast to other users that this user has left
        socket.to(canvasRoom).emit("canvas:user-left", { id: userId });
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