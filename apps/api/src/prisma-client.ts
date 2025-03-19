import { PrismaClient } from '@prisma/client';

// Create a singleton instance of the PrismaClient
let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    // Add middleware for connection error handling
    prismaInstance.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error: any) {
        // Check if it's a connection error
        if (
          error.message.includes('Connection refused') ||
          error.message.includes('Connection lost') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('database is not reachable')
        ) {
          console.error('Database connection error detected, attempting to reconnect...');
          
          try {
            // Try to reconnect
            await prismaInstance?.$disconnect();
            await prismaInstance?.$connect();
            
            // Retry the operation
            return await next(params);
          } catch (reconnectError) {
            console.error('Failed to reconnect to database:', reconnectError);
            throw error; // Re-throw the original error if reconnection fails
          }
        }
        
        throw error;
      }
    });
  }
  
  return prismaInstance;
};

// Handle graceful shutdown of Prisma
export const disconnectPrisma = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
};
