/*
  Warnings:

  - You are about to drop the `property` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `jsfiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `property` DROP FOREIGN KEY `property_codeBlockId_fkey`;

-- AlterTable
ALTER TABLE `jsclassmethods` ADD COLUMN `parameters` TEXT NULL,
    ADD COLUMN `returnType` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `jsclassproperties` ADD COLUMN `documentation` TEXT NULL;

-- AlterTable
ALTER TABLE `jscodeblocks` ADD COLUMN `documentation` TEXT NULL,
    ADD COLUMN `isExported` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jscomments` ADD COLUMN `tags` JSON NULL;

-- AlterTable
ALTER TABLE `jsexports` ADD COLUMN `isTypeOnly` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jsfiles` ADD COLUMN `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `jsfunctionparams` ADD COLUMN `documentation` TEXT NULL,
    ADD COLUMN `isOptional` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jsimports` ADD COLUMN `isTypeOnly` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jsvariables` ADD COLUMN `documentation` TEXT NULL,
    ADD COLUMN `isLet` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `property`;
