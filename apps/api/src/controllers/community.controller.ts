import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { deleteImage, getPublicIdFromUrl } from "@/utils/cloudinary";

export const createCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      res.status(400).json({ message: "Community name is required" });
      return;
    }

    const community = await prisma.community.create({
      data: {
        name,
        description,
        ...(req.file?.path && { image: req.file.path }),
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER"
          }
        }
      }
    });

    res.status(201).json(community);
  } catch (error) {
    console.error("Create Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    res.status(200).json(community);
  } catch (error) {
    console.error("Get Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const communities = await prisma.community.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    res.status(200).json(communities);
  } catch (error) {
    console.error("Get All Communities Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    if (community.ownerId !== userId) {
      res.status(403).json({ message: "Not authorized to update this community" });
      return;
    }

    // Only handle image deletion if a new image is being uploaded
    if (req.file?.path && community.image) {
      const publicId = getPublicIdFromUrl(community.image);
      await deleteImage(publicId);
    }

    const updatedCommunity = await prisma.community.update({
      where: { id },
      data: {
        name,
        description,
        ...(req.file?.path && { image: req.file.path })
      }
    });

    res.status(200).json(updatedCommunity);
  } catch (error) {
    console.error("Update Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    if (community.ownerId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this community" });
      return;
    }

    // Delete community image from Cloudinary
    if (community.image) {
      const publicId = getPublicIdFromUrl(community.image);
      await deleteImage(publicId);
    }

    await prisma.community.delete({
      where: { id }
    });

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Delete Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    const membership = await prisma.communitiesOnUsers.create({
      data: {
        communityId: id,
        userId,
        role: "MEMBER"
      }
    });

    res.status(200).json(membership);
  } catch (error) {
    console.error("Join Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    if (community.ownerId === userId) {
      res.status(400).json({ message: "Owner cannot leave the community" });
      return;
    }

    await prisma.communitiesOnUsers.delete({
      where: {
        communityId_userId: {
          communityId: id,
          userId
        }
      }
    });

    res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    console.error("Leave Community Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommunityMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const members = await prisma.communitiesOnUsers.findMany({
      where: {
        communityId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    res.status(200).json(members);
  } catch (error) {
    console.error("Get Community Members Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
