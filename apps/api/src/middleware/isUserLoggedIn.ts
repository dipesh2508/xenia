import { prisma } from "@repo/database";
import { User } from "@repo/database/types";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isLoggedIn = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: User["id"];
    };

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Internal server error.",
    });
  }
};
