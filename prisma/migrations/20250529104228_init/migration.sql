/*
  Warnings:

  - Added the required column `year` to the `Phone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Phone" ADD COLUMN     "year" INTEGER NOT NULL;
