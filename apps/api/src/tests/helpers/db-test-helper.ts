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
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
}

/**
 * Helper to clean up test users
 */
export async function cleanupTestUsers(emails: string[]) {
  try {
    // First clean up communities and memberships
    await prisma.communitiesOnUsers.deleteMany({
      where: {
        user: {
          email: {
            in: emails
          }
        }
      }
    });

    await prisma.community.deleteMany({
      where: {
        owner: {
          email: {
            in: emails
          }
        }
      }
    });

    // Then delete users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: emails
        }
      }
    });
  } catch (error) {
    console.error("Error cleaning up test users:", error);
    throw error;
  }
}

/**
 * Helper to create a test community in the database
 */
export async function createTestCommunity(data: {
  name: string;
  description?: string;
  image?: string;
  ownerId: string;
}) {
  return prisma.community.create({
    data: {
      ...data,
      members: {
        create: {
          userId: data.ownerId,
          role: "OWNER"
        }
      }
    }
  });
}

/**
 * Helper to clean up test communities
 */
export async function cleanupTestCommunities(communityIds: string[]) {
  await prisma.community.deleteMany({
    where: {
      id: {
        in: communityIds
      }
    }
  });
}

/**
 * Helper to create a member in a community
 */
export async function addMemberToCommunity(communityId: string, userId: string, role: "MEMBER" | "ADMIN" = "MEMBER") {
  return prisma.communitiesOnUsers.create({
    data: {
      communityId,
      userId,
      role
    }
  });
}

/**
 * Helper to clean up test data
 */
export async function cleanupTestData() {
  try {
    // Clean up in correct order to avoid foreign key constraints
    await prisma.communitiesOnUsers.deleteMany({});
    await prisma.community.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error("Error cleaning up test data:", error);
    throw error;
  }
}
