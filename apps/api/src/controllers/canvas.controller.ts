import { Request, Response } from "express";
import { prisma } from "@/utils/prisma";
import { getIO } from "@/services/socket";

// Create a new canvas
export const createCanvas = async (req: any, res: Response): Promise<void> => {
  try {
    const { communityId } = req.body;
    const userId = req.user.id;

    if (!communityId) {
      res.status(400).json({ message: "Community ID is required" });
      return;
    }

    // Check if community exists and user is a member
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: { userId }
        }
      }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    // Check if user is a member of the community
    const isMember = community.members.length > 0 || community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to create a canvas" });
      return;
    }

    // Create a new canvas
    const canvas = await prisma.canvas.create({
      data: {
        communityId
      }
    });

    res.status(201).json(canvas);
  } catch (error) {
    console.error("Create Canvas Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a canvas by ID or create one if it doesn't exist
export const getCanvasByIdOrCreate = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // If ID is a community ID (need to find or create a canvas for this community)
    if (id.startsWith('community:')) {
      const communityId = id.replace('community:', '');
      
      // Check if community exists and user is a member
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          members: {
            where: { userId }
          }
        }
      });

      if (!community) {
        res.status(404).json({ message: "Community not found" });
        return;
      }

      // Check if user is a member of the community
      const isMember = community.members.length > 0 || community.ownerId === userId;
      if (!isMember) {
        res.status(403).json({ message: "You must be a member of the community to access the canvas" });
        return;
      }

      // Find existing canvas or create a new one
      let canvas = await prisma.canvas.findFirst({
        where: { communityId }
      });

      if (!canvas) {
        canvas = await prisma.canvas.create({
          data: { communityId }
        });
      }

      res.status(200).json(canvas);
      return;
    }

    // If ID is a canvas ID
    const canvas = await prisma.canvas.findUnique({
      where: { id },
      include: {
        community: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!canvas) {
      res.status(404).json({ message: "Canvas not found" });
      return;
    }

    // Check if user is a member of the community
    const isMember = canvas.community.members.length > 0 || canvas.community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to access this canvas" });
      return;
    }

    res.status(200).json(canvas);
  } catch (error) {
    console.error("Get Canvas Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update canvas snapshot
export const updateCanvasSnapshot = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { snapshot } = req.body;
    const userId = req.user.id;

    if (!snapshot) {
      res.status(400).json({ message: "Canvas snapshot is required" });
      return;
    }

    // Find the canvas
    const canvas = await prisma.canvas.findUnique({
      where: { id },
      include: {
        community: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!canvas) {
      res.status(404).json({ message: "Canvas not found" });
      return;
    }

    // Check if user is a member of the community
    const isMember = canvas.community.members.length > 0 || canvas.community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to update this canvas" });
      return;
    }

    // Update the canvas snapshot
    const updatedCanvas = await prisma.canvas.update({
      where: { id },
      data: { snapshot }
    });

    // Notify all connected clients about the updated canvas
    const io = getIO();
    const roomId = `canvas:${canvas.communityId}`;
    io.to(roomId).emit('canvas:sync', snapshot);

    res.status(200).json(updatedCanvas);
  } catch (error) {
    console.error("Update Canvas Snapshot Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all canvases for a community
export const getAllCanvasesByCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    // Check if community exists and user is a member
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: { userId }
        }
      }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    // Check if user is a member of the community
    const isMember = community.members.length > 0 || community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to view canvases" });
      return;
    }

    // Get all canvases for the community
    const canvases = await prisma.canvas.findMany({
      where: { communityId },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(canvases);
  } catch (error) {
    console.error("Get Community Canvases Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}; 