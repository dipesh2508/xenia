import { prisma } from "@repo/database";
import bcrypt from "bcrypt";

/**
 * Helper to create a test user in the database
 */
export async function createTestUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword
    }
  });
}

/**
 * Helper to clean up test users
 */
export async function cleanupTestUsers(emails: string[]) {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: emails
      }
    }
  });
}
