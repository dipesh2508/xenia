import { Request, Response } from "express";
import { prisma } from "@/utils/prisma";
import { deleteImage, getPublicIdFromUrl } from "@/utils/cloudinary";

export const createCommunity = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      res.status(400).json({ message: "Community name is required" });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({ message: "Community name must be less than 100 characters" });
      return;
    }

    // Check for existing community with same name
    const existingCommunity = await prisma.community.findFirst({
      where: { name }
    });

    if (existingCommunity) {
      res.status(400).json({ message: "Community name already exists" });
      return;
    }

    // Create community and automatically create a chat room for it
    const community = await prisma.$transaction(async (tx) => {
      // Create the community
      const newCommunity = await tx.community.create({
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
      
      // Create a default chat room for the community
      await tx.chat.create({
        data: {
          communityId: newCommunity.id
        }
      });
      
      return newCommunity;
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    if (req.query.page || req.query.limit || req.query.search) {
      // Return paginated response when query params are present
      const [communities, total] = await Promise.all([
        prisma.community.findMany({
          where,
          skip,
          take: limit,
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
        }),
        prisma.community.count({ where })
      ]);

      res.status(200).json({
        communities,
        total,
        hasMore: total > skip + limit
      });
    } else {
      // Return all communities when no query params are present
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
    }
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

    if (name) {
      const existingCommunity = await prisma.community.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (existingCommunity) {
        res.status(400).json({ message: "Community name already exists" });
        return;
      }
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
      where: { id },
      include: {
        members: true
      }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    const existingMembership = community.members.find(m => m.userId === userId);
    if (existingMembership) {
      res.status(400).json({ message: "User is already a member of this community" });
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
      where: { id },
      include: {
        members: true
      }
    });

    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    if (community.ownerId === userId) {
      res.status(400).json({ message: "Owner cannot leave the community" });
      return;
    }

    const membership = community.members.find(m => m.userId === userId);
    if (!membership) {
      res.status(400).json({ message: "User is not a member of this community" });
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
    
    if (req.query.page || req.query.limit) {
      // Paginated response when page/limit is specified
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [members, total] = await Promise.all([
        prisma.communitiesOnUsers.findMany({
          where: { communityId: id },
          skip,
          take: limit,
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
        }),
        prisma.communitiesOnUsers.count({
          where: { communityId: id }
        })
      ]);

      res.status(200).json({
        members: members.map(member => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
          role: member.role
        })),
        total,
        hasMore: total > skip + limit
      });
    } else {
      // Simple array response for non-paginated requests (what the test expects)
      const members = await prisma.communitiesOnUsers.findMany({
        where: { communityId: id },
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

      // Format the response as a flat array of user objects with roles
      const formattedMembers = members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: member.role
      }));

      res.status(200).json(formattedMembers);
    }
  } catch (error) {
    console.error("Get Community Members Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
