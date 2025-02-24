import jwt from "jsonwebtoken";
import { User } from "@repo/database/types";
import { Response } from "express";

export const generateJwtToken = (userId: User["id"], res: Response) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const options = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV != "development",
  };

  res.cookie("token", token, options);
};
