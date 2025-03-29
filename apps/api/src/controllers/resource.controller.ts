import { Request, Response } from "express";
import { prisma } from "@/utils/prisma";

export const createResource = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, communityId } = req.body;
    const userId = req.user.id;

    if (!title || !communityId) {
      res.status(400).json({ message: "Title and community ID are required" });
      return;
    }

    // Verify the community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { members: true }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    // Verify user is a member of the community
    const isMember = community.members.some(member => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this community" });
      return;
    }

    // Create the resource
    const resource = await prisma.resource.create({
      data: {
        title,
        ...(req.file?.path && { content: req.file.path }),
        ownerId: userId,
        communityId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error("Create Resource Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getResource = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        community: {
          include: {
            members: true
          }
        }
      }
    });

    if (!resource) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }

    // Verify user is a member of the community
    const isMember = resource.community.members.some(member => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not authorized to view this resource" });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error("Get Resource Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommunityResources = async (req: any, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Verify the community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { members: true }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    // Verify user is a member of the community
    const isMember = community.members.some(member => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this community" });
      return;
    }

    // Get total count of resources
    const total = await prisma.resource.count({
      where: { communityId }
    });

    // Get resources with pagination (most recent first)
    const resources = await prisma.resource.findMany({
      where: { communityId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    res.status(200).json({
      resources,
      total,
      hasMore: total > skip + limit,
      page,
      limit
    });
  } catch (error) {
    console.error("Get Community Resources Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateResource = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const content = req.file.path;
    const userId = req.user.id;

    // Find the resource
    const resource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }

    // Verify the user is the owner
    if (resource.ownerId !== userId) {
      res.status(403).json({ message: "You can only update your own resources" });
      return;
    }

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content })
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    res.status(200).json(updatedResource);
  } catch (error) {
    console.error("Update Resource Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteResource = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the resource
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { community: true }
    });

    if (!resource) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }

    // Allow deletion if the user is the owner or the community owner
    const isOwner = resource.ownerId === userId;
    const isCommunityOwner = resource.community.ownerId === userId;
    
    if (!isOwner && !isCommunityOwner) {
      res.status(403).json({ 
        message: "You must be the resource owner or community owner to delete this resource" 
      });
      return;
    }

    // Delete the resource
    await prisma.resource.delete({
      where: { id }
    });

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserResources = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get total count of resources created by the user
    const total = await prisma.resource.count({
      where: { ownerId: userId }
    });

    // Get resources with pagination (most recent first)
    const resources = await prisma.resource.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        community: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    res.status(200).json({
      resources,
      total,
      hasMore: total > skip + limit,
      page,
      limit
    });
  } catch (error) {
    console.error("Get User Resources Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
