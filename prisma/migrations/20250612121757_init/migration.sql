/*
  Warnings:

  - Added the required column `user_phone_number` to the `Phone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Phone" ADD COLUMN     "user_phone_number" TEXT NOT NULL;
