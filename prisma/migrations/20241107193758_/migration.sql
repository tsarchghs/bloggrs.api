-- AlterTable
ALTER TABLE `jscodeblocks` ADD COLUMN `parentBlockId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `jscodeblocks_parentBlockId_idx` ON `jscodeblocks`(`parentBlockId`);

-- AddForeignKey
ALTER TABLE `jscodeblocks` ADD CONSTRAINT `jscodeblocks_parentBlockId_fkey` FOREIGN KEY (`parentBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
