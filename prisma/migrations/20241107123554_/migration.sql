/*
  Warnings:

  - Added the required column `methodId` to the `jsfunctionparams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jsfunctionparams` ADD COLUMN `methodId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `jsfunctionparams_methodId_idx` ON `jsfunctionparams`(`methodId`);

-- AddForeignKey
ALTER TABLE `jsfunctionparams` ADD CONSTRAINT `jsfunctionparams_methodId_fkey` FOREIGN KEY (`methodId`) REFERENCES `jsclassmethods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
