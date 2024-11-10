/*
  Warnings:

  - You are about to drop the column `isTypeOnly` on the `jsexports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `jsexports` DROP COLUMN `isTypeOnly`,
    ADD COLUMN `typeOnly` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jsimports` ADD COLUMN `isTypeScript` BOOLEAN NOT NULL DEFAULT false;
