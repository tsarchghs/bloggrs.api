/*
  Warnings:

  - You are about to drop the `block` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `blockattributes` DROP FOREIGN KEY `blockattributes_blockId_fkey`;

-- DropTable
DROP TABLE `block`;

-- CreateTable
CREATE TABLE `blocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blockattributes` ADD CONSTRAINT `blockattributes_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `blocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
