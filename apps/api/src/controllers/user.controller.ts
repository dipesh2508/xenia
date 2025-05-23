import { Request, Response } from "express";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcrypt";
import { generateJwtToken } from "@/utils/generateToken";

export const userSignup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please provide all fields.",
      });
      return;
    }

    if (password?.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    // Check for existing user first
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        message: "User with the provided email already exist.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Updated cookie settings
    const token = generateJwtToken(newUser.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/"
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide all fields.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      res.status(400).json({
        message: "Invalid credentials.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        message: "Invalid credentials.",
      });
      return;
    }

    // Generate token first
    const token = generateJwtToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/"
    });

    // Then send response without password
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });
    res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const checkAuth = async (req: any, res: Response): Promise<void> => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("CheckAuth Error:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    if (!deletedUser) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const getCurrentUser = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
