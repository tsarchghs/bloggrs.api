/*
  Warnings:

  - A unique constraint covering the columns `[id,key]` on the table `blockattributes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `blockattributes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `blockattributes_key_value_key` ON `blockattributes`;

-- DropIndex
DROP INDEX `key` ON `blockattributes`;

-- DropIndex
DROP INDEX `value` ON `blockattributes`;

-- AlterTable
ALTER TABLE `blockattributes` ADD COLUMN `type` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `blockattributes_id_key_key` ON `blockattributes`(`id`, `key`);
