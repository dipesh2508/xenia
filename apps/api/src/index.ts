import dotenv from "dotenv";
import path from "path";

// Configure dotenv to load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.JWT_SECRET) {
  console.error("Critical environment variable JWT_SECRET is missing!");
  console.error("Please check your .env file");
  process.exit(1);
}

import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import userRouter from "@/routes/user.route";
import cors from "cors";


const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONTEND_URL,
  credentials: true
}));

// Health check route
app.get("/", (_, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/user", userRouter);

// Error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason.message);
});
