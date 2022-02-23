/*
  Warnings:

  - You are about to drop the column `blockId` on the `blockattributes` table. All the data in the column will be lost.
  - Added the required column `BlockId` to the `blockattributes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `blockattributes` DROP FOREIGN KEY `blockattributes_blockId_fkey`;

-- AlterTable
ALTER TABLE `blockattributes` DROP COLUMN `blockId`,
    ADD COLUMN `BlockId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `blockattributes` ADD CONSTRAINT `blockattributes_BlockId_fkey` FOREIGN KEY (`BlockId`) REFERENCES `blocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
