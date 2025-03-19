import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
class PrismaManager {
  private static instance: PrismaClient;
  private static isConnecting: boolean = false;
  private static reconnectAttempts: number = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_INTERVAL = 5000; // 5 seconds

  static getInstance(): PrismaClient {
    if (!PrismaManager.instance) {
      console.log('Initializing PrismaClient...');
      PrismaManager.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        errorFormat: 'pretty'
      });

      // Add middleware for connection error handling
      PrismaManager.instance.$use(async (params, next) => {
        try {
          return await next(params);
        } catch (error: any) {
          // Check if it's a connection error
          if (
            error.message.includes('Can\'t reach database server') ||
            error.message.includes('Connection refused') ||
            error.message.includes('Connection lost') ||
            error.message.includes('ECONNREFUSED')
          ) {
            console.error(`Database connection error: ${error.message}`);
            
            // Only attempt reconnection if we're not already trying
            if (!PrismaManager.isConnecting) {
              PrismaManager.attemptReconnection();
            }
          }
          
          throw error;
        }
      });

      // Connect on initialization
      PrismaManager.connect();
    }
    
    return PrismaManager.instance;
  }

  private static async connect() {
    try {
      await PrismaManager.instance.$connect();
      console.log('Database connection established successfully');
      PrismaManager.reconnectAttempts = 0;
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      PrismaManager.attemptReconnection();
    }
  }

  private static attemptReconnection() {
    if (PrismaManager.reconnectAttempts >= PrismaManager.MAX_RECONNECT_ATTEMPTS) {
      console.error(`Maximum reconnection attempts (${PrismaManager.MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
      return;
    }

    PrismaManager.isConnecting = true;
    PrismaManager.reconnectAttempts++;
    
    console.log(`Attempting to reconnect to database (attempt ${PrismaManager.reconnectAttempts} of ${PrismaManager.MAX_RECONNECT_ATTEMPTS})...`);
    
    setTimeout(async () => {
      try {
        await PrismaManager.instance.$disconnect();
        await PrismaManager.instance.$connect();
        console.log('Successfully reconnected to the database');
        PrismaManager.isConnecting = false;
        PrismaManager.reconnectAttempts = 0;
      } catch (error) {
        console.error('Failed to reconnect:', error);
        PrismaManager.isConnecting = false;
        PrismaManager.attemptReconnection();
      }
    }, PrismaManager.RECONNECT_INTERVAL);
  }

  static async disconnect() {
    if (PrismaManager.instance) {
      await PrismaManager.instance.$disconnect();
      console.log('Database connection closed');
    }
  }
}

// Create a single instance to export
const prisma = PrismaManager.getInstance();

// Export the health check function for the database
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to check if the database is responsive
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export { prisma, PrismaClient };