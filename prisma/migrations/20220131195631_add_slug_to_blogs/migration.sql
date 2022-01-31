/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `blogs` ADD COLUMN `slug` VARCHAR(255) NOT NULL DEFAULT 'carinova';

-- CreateIndex
CREATE UNIQUE INDEX `slug` ON `blogs`(`slug`);
