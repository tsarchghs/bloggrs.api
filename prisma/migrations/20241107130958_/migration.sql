/*
  Warnings:

  - The `position` column on the `jsimports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `jsimports` DROP COLUMN `position`,
    ADD COLUMN `position` JSON NULL;
