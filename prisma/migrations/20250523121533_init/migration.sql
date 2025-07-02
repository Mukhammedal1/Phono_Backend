/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `Archives` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Archives" DROP COLUMN "archivedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
