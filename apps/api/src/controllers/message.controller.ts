import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { io } from "@/services/socket";

export const createMessage = async (req: any, res: Response): Promise<void> => {
  try {
    const { content, chatId } = req.body;
    const userId = req.user.id;

    if (!content || !chatId) {
      res.status(400).json({ message: "Content and chat ID are required" });
      return;
    }

    // Verify the chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { community: { include: { members: true } } }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Verify user is a member of the community
    const isMember = chat.community.members.some(member => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this community" });
      return;
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
        communityId: chat.communityId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Emit the new message to all clients in the chat room
    io.to(chatId).emit("newMessage", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("Create Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByChat = async (req: any, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify the chat exists and user has access
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { community: { include: { members: true } } }
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const isMember = chat.community.members.some(member => member.userId === userId);
    if (!isMember) {
      res.status(403).json({ message: "You are not a member of this community" });
      return;
    }

    // Get total count of messages
    const total = await prisma.message.count({
      where: { chatId }
    });

    // Get messages with pagination (most recent first)
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    res.status(200).json({
      messages,
      total,
      hasMore: total > skip + limit,
      page,
      limit
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMessage = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      res.status(400).json({ message: "Content is required" });
      return;
    }

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id },
      include: { chat: true }
    });

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    // Verify the user is the sender
    if (message.senderId !== userId) {
      res.status(403).json({ message: "You can only edit your own messages" });
      return;
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Emit the updated message to all clients in the chat room
    if (message.chatId) {
      io.to(message.chatId).emit("messageUpdated", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Update Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id },
      include: { chat: true }
    });

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    // Verify the user is the sender
    if (message.senderId !== userId) {
      res.status(403).json({ message: "You can only delete your own messages" });
      return;
    }

    // Save the chatId before deleting
    const chatId = message.chatId;

    // Delete the message
    await prisma.message.delete({
      where: { id }
    });

    // Emit deletion event to all clients in the chat room
    if (chatId) {
      io.to(chatId).emit("messageDeleted", { id });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
