/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_communityMembers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_communityMembers" DROP CONSTRAINT "_communityMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_communityMembers" DROP CONSTRAINT "_communityMembers_B_fkey";

-- DropIndex
DROP INDEX "Chat_communityId_idx";

-- DropIndex
DROP INDEX "Community_name_idx";

-- DropIndex
DROP INDEX "Message_chatId_idx";

-- DropIndex
DROP INDEX "Message_senderId_idx";

-- DropIndex
DROP INDEX "Resource_communityId_idx";

-- DropIndex
DROP INDEX "Resource_ownerId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "description" TEXT,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "communityId" TEXT,
ALTER COLUMN "chatId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "_communityMembers";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "CommunitiesOnUsers" (
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunitiesOnUsers_pkey" PRIMARY KEY ("communityId","userId")
);

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunitiesOnUsers" ADD CONSTRAINT "CommunitiesOnUsers_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunitiesOnUsers" ADD CONSTRAINT "CommunitiesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
