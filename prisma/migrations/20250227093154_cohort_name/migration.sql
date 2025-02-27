/*
  Warnings:

  - Added the required column `name` to the `Cohort` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cohort" ADD COLUMN     "name" TEXT NOT NULL;
