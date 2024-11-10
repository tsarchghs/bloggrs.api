/*
  Warnings:

  - Added the required column `content` to the `jsclassmethods` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `blogpermissions` DROP FOREIGN KEY `blogpermissions_teammemberId_fkey`;

-- AlterTable
ALTER TABLE `jsclassmethods` ADD COLUMN `content` TEXT NOT NULL,
    ADD COLUMN `isAsync` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `blogpermissions` ADD CONSTRAINT `blogpermissions_teammemberId_fkey` FOREIGN KEY (`teammemberId`) REFERENCES `teammembers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
