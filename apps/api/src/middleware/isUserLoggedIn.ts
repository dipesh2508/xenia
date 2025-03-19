import { prisma } from "@/utils/prisma";
import { User } from "@/types";
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
      id: User["id"];
    };

    if (!decoded.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
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
    } catch (dbError) {
      console.error("Database error during authentication:", dbError);
      return res.status(503).json({
        message: "Service temporarily unavailable. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({
      message: "Authentication failed. Please log in again.",
    });
  }
};
