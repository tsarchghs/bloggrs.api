/*
  Warnings:

  - You are about to drop the column `content` on the `jsclassmethods` table. All the data in the column will be lost.
  - You are about to drop the column `isAsync` on the `jsclassmethods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `jsclassmethods` DROP COLUMN `content`,
    DROP COLUMN `isAsync`;

-- AlterTable
ALTER TABLE `jsclassproperties` ADD COLUMN `initialValue` TEXT NULL;
