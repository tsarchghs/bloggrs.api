/*
  Warnings:

  - You are about to drop the column `BlogId` on the `blocks` table. All the data in the column will be lost.
  - Added the required column `PageId` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `blocks` DROP FOREIGN KEY `blocks_BlogId_fkey`;

-- AlterTable
ALTER TABLE `blocks` DROP COLUMN `BlogId`,
    ADD COLUMN `PageId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `PageId` ON `blocks`(`PageId`);

-- AddForeignKey
ALTER TABLE `blocks` ADD CONSTRAINT `blocks_PageId_fkey` FOREIGN KEY (`PageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
