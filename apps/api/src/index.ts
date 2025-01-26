import express, { Request, Response, NextFunction } from 'express';
import { prisma } from "@repo/database";
import {User} from '@repo/database/types'

const app = express();
const port = process.env.PORT || 8000;


type RequestHandler<T> = (
  req: Request<{}, {}, T>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

// User controller
class UserController {
  static async createUser(name: string, email: string) {
    return prisma.user.create({
      data: { name, email },
    });
  }
}

// Route handler
const createUserHandler: RequestHandler<User> = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const user = await UserController.createUser(name, email);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Middleware
app.use(express.json());

// Routes
app.post('/users', createUserHandler);

// Error middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});