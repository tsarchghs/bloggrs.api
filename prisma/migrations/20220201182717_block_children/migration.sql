/*
  Warnings:

  - You are about to drop the column `blockId` on the `blocks` table. All the data in the column will be lost.
  - Added the required column `childrenId` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `blocks` DROP COLUMN `blockId`,
    ADD COLUMN `childrenId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `children` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blockId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `children` ADD CONSTRAINT `children_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `blocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
