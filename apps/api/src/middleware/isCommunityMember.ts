import { Request, Response, NextFunction } from "express";
import { prisma } from "@/utils/prisma";

export const isCommunityMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get communityId from either params or query parameters
    const communityId = req.params.communityId || req.params.id || req.query.communityId as string;
    const userId = (req as any).user.id;

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    // Check if user is a member of the community
    const membership = await prisma.communitiesOnUsers.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: "You are not a member of this community" });
    }

    next();
  } catch (error) {
    console.error("Community membership check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};