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

// Perform initial database connection check with retry
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

const connectWithRetry = async (retryCount = 0): Promise<void> => {
  try {
    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
      console.log('Database connection successful');
      // Start the server only after successful DB connection
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Socket.IO server running alongside HTTP server`);
      });
    } else {
      throw new Error('Database connection check failed');
    }
  } catch (error) {
    console.error(`Database connection attempt ${retryCount + 1} failed:`, error);
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_INTERVAL/1000} seconds...`);
      setTimeout(() => connectWithRetry(retryCount + 1), RETRY_INTERVAL);
    } else {
      console.error('Max connection attempts reached. Starting server in offline mode...');
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Database unavailable)`);
      });
    }
  }
};

// Start connection process
connectWithRetry();

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
