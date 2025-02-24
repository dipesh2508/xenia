import { Request, Response } from "express";
import { prisma } from "@repo/database";
import bcrypt from "bcrypt";
import { generateJwtToken } from "../utils/generateToken";
// import { User } from "@repo/database/types";

export const userSignup = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all fields.",
      });
    }

    if (password?.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).json({
        message: "User with the provided email already exist.",
      });
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
      return res.status(400).json({
        message: "Unable to create user. Try again!",
      });
    }

    generateJwtToken(newUser.id, res);

    res.status(201).json({
      id: newUser.id,
      name,
      email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all fields.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    generateJwtToken(user.id, res);

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const checkAuth = async (req: any, res: Response): Promise<any> => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
