import { Request, Response } from "express";
import { prisma } from "@repo/database";

// Create a new chat room in a community
export const createChat = async (req: any, res: Response): Promise<void> => {
  try {
    const { communityId } = req.body;
    const userId = req.user.id;

    if (!communityId) {
      res.status(400).json({ message: "Community ID is required" });
      return;
    }

    // Check if community exists
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

    // Ensure user is a member of the community
    if (community.members.length === 0) {
      res.status(403).json({ message: "You must be a member of the community to create a chat" });
      return;
    }

    // Create chat room
    const newChat = await prisma.chat.create({
      data: {
        communityId
      }
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Create Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all chat rooms for a community
export const getCommunityChats = async (req: any, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    // Verify community exists
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
      res.status(403).json({ message: "You must be a member of the community to view chats" });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: {
        communityId
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Get Community Chats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific chat room by ID
export const getChatById = async (req: any, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        community: {
          include: {
            members: {
              where: { userId }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat room not found" });
      return;
    }

    // Check if user is a member of the community
    const isMember = chat.community.members.length > 0 || chat.community.ownerId === userId;
    if (!isMember) {
      res.status(403).json({ message: "You must be a member of the community to view this chat" });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Get Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a chat room
export const deleteChat = async (req: any, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        community: true
      }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat room not found" });
      return;
    }

    // Only community owner or admin can delete chats
    const userRole = await prisma.communitiesOnUsers.findUnique({
      where: {
        communityId_userId: {
          communityId: chat.communityId,
          userId
        }
      }
    });

    if (chat.community.ownerId !== userId && (!userRole || userRole.role !== "ADMIN")) {
      res.status(403).json({ message: "Not authorized to delete this chat room" });
      return;
    }

    // Delete the chat
    await prisma.chat.delete({
      where: { id: chatId }
    });

    res.status(200).json({ message: "Chat room deleted successfully" });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
