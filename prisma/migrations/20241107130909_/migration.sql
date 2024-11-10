-- DropForeignKey
ALTER TABLE `blogpermissions` DROP FOREIGN KEY `blogpermissions_teammemberId_fkey`;

-- AlterTable
ALTER TABLE `jsfiles` ADD COLUMN `metadata` JSON NULL;

-- AddForeignKey
ALTER TABLE `blogpermissions` ADD CONSTRAINT `blogpermissions_teammemberId_fkey` FOREIGN KEY (`teammemberId`) REFERENCES `teammembers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
