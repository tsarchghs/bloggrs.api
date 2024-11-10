/*
  Warnings:

  - Added the required column `dependencies` to the `jscodeblocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `importOrder` to the `jsfiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `jsimports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jscodeblocks` ADD COLUMN `dependencies` JSON NOT NULL,
    ADD COLUMN `scope` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `jsfiles` ADD COLUMN `contextPath` VARCHAR(255) NULL,
    ADD COLUMN `fileType` VARCHAR(10) NOT NULL DEFAULT 'js',
    ADD COLUMN `hash` VARCHAR(64) NULL,
    ADD COLUMN `importOrder` JSON NOT NULL,
    ADD COLUMN `isGenerated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isModule` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `sourceMap` JSON NULL,
    ADD COLUMN `structure` JSON NULL,
    MODIFY `content` TEXT NULL;

-- AlterTable
ALTER TABLE `jsimports` ADD COLUMN `group` VARCHAR(50) NULL,
    ADD COLUMN `position` INTEGER NOT NULL;
