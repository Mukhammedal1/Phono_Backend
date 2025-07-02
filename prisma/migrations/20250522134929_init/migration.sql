/*
  Warnings:

  - A unique constraint covering the columns `[activation_link]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "activation_link" TEXT,
ALTER COLUMN "is_active" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_activation_link_key" ON "Admin"("activation_link");
