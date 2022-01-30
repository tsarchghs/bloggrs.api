/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `slug` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `posts` MODIFY `status` ENUM('ARCHIVED', 'DRAFT', 'PUBLISHED', 'UNPUBLISHED') NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX `slug` ON `categories`(`slug`);
