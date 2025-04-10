/*
  Warnings:

  - Made the column `content` on table `Resource` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Resource" ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
