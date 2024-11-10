/*
  Warnings:

  - Added the required column `content` to the `jsclassmethods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jsclassmethods` ADD COLUMN `content` TEXT NOT NULL,
    ADD COLUMN `documentation` TEXT NULL,
    ADD COLUMN `isArrowFunction` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isAsync` BOOLEAN NOT NULL DEFAULT false;
