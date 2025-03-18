import dotenv from "dotenv";
import path from "path";
import http from "http";
import app from "./app";
import { initSocketServer } from "./services/socket";
import { prisma, checkDatabaseConnection } from "./utils/prisma";

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

// Initialize Socket.IO with the server
initSocketServer(server);

// Perform initial database connection check
checkDatabaseConnection()
  .then(isConnected => {
    if (!isConnected) {
      console.warn("Warning: Initial database connection check failed. Will retry automatically.");
    }
    
    // Start the server regardless of DB status (it will retry connecting)
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`REST API available at http://localhost:${PORT}`);
      console.log(`Socket.IO server running alongside HTTP server`);
    });
  })
  .catch(error => {
    console.error("Failed to perform initial database connection check:", error);
    // Start server anyway, the connection management will handle reconnection
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`REST API available at http://localhost:${PORT}`);
      console.log(`Socket.IO server running alongside HTTP server`);
    });
  });

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Close the HTTP server first
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Then disconnect from the database
    prisma.$disconnect()
      .then(() => {
        console.log('Database connection closed.');
        process.exit(0);
      })
      .catch(error => {
        console.error('Error during database disconnection:', error);
        process.exit(1);
      });
  });
  
  // If server hasn't closed within 10 seconds, force shutdown
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason.message);
});

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
