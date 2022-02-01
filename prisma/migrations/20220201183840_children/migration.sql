/*
  Warnings:

  - You are about to drop the column `childrenId` on the `blocks` table. All the data in the column will be lost.
  - You are about to drop the column `blockId` on the `children` table. All the data in the column will be lost.
  - Added the required column `BlockId` to the `children` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `children` DROP FOREIGN KEY `children_blockId_fkey`;

-- AlterTable
ALTER TABLE `blocks` DROP COLUMN `childrenId`;

-- AlterTable
ALTER TABLE `children` DROP COLUMN `blockId`,
    ADD COLUMN `BlockId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `BlockId` ON `children`(`BlockId`);

-- AddForeignKey
ALTER TABLE `children` ADD CONSTRAINT `children_BlockId_fkey` FOREIGN KEY (`BlockId`) REFERENCES `blocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
