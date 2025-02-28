import jwt from "jsonwebtoken";
import { User } from "@repo/database/types";
import { Response } from "express";

export const generateJwtToken = (userId: User["id"], res: Response) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const options = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV !== "development",
      path: "/",
    };

    res.cookie("token", token, options);
    return token;
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw new Error("Failed to generate authentication token");
  }
};
