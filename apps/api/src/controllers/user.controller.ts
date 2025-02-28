import { Request, Response } from "express";
import { prisma } from "@repo/database";
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

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
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
    });

    if (!newUser) {
      res.status(400).json({
        message: "Unable to create user. Try again!",
      });
      return;
    }

    generateJwtToken(newUser.id, res);

    res.status(201).json({
      id: newUser.id,
      name,
      email,
    });
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
      where: {
        email,
      },
    });

    if (!user) {
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

    generateJwtToken(user.id, res);

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
    res.clearCookie("token");
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
