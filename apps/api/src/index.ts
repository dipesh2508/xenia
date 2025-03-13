import dotenv from "dotenv";
import path from "path";
import http from "http";
import app from "./app";
import { initSocketServer } from "./services/socket";

// Configure dotenv to load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.JWT_SECRET) {
  console.error("Critical environment variable JWT_SECRET is missing!");
  console.error("Please check your .env file");
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || "8000", 10);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason.message);
});
