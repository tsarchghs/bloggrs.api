/*
  Warnings:

  - A unique constraint covering the columns `[methodId]` on the table `jscodeblocks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `jscodeblocks` ADD COLUMN `methodId` INTEGER NULL;

-- CreateTable
CREATE TABLE `_BlockMethods` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BlockMethods_AB_unique`(`A`, `B`),
    INDEX `_BlockMethods_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `jscodeblocks_methodId_key` ON `jscodeblocks`(`methodId`);

-- CreateIndex
CREATE INDEX `jscodeblocks_methodId_idx` ON `jscodeblocks`(`methodId`);

-- AddForeignKey
ALTER TABLE `jscodeblocks` ADD CONSTRAINT `jscodeblocks_methodId_fkey` FOREIGN KEY (`methodId`) REFERENCES `jsclassmethods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlockMethods` ADD CONSTRAINT `_BlockMethods_A_fkey` FOREIGN KEY (`A`) REFERENCES `jsclassmethods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlockMethods` ADD CONSTRAINT `_BlockMethods_B_fkey` FOREIGN KEY (`B`) REFERENCES `jscodeblocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
