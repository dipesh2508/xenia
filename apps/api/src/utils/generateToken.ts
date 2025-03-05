import jwt from "jsonwebtoken";
import { User } from "@repo/database/types";
import { Response } from "express";

/**
 * Generates a JWT token and sets it as a cookie in the response
 * 
 * @param userId The ID of the user to generate a token for
 * @param res Express response object to set the cookie on
 */
export const generateJwtToken = (userId: User["id"], res: Response): void => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};
