/*
  Warnings:

  - You are about to drop the column `cohortId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_cohortId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "cohortId",
DROP COLUMN "status",
DROP COLUMN "title";
