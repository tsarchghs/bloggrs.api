/*
  Warnings:

  - Added the required column `BlogId` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `blocks` ADD COLUMN `BlogId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `BlogId` ON `blocks`(`BlogId`);
