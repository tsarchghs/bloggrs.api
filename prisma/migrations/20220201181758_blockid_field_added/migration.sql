/*
  Warnings:

  - Added the required column `blockId` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `blocks` ADD COLUMN `blockId` INTEGER NOT NULL;
