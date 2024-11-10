/*
  Warnings:

  - You are about to drop the column `userId` on the `blogpermissions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `temporaryaccesses` table. All the data in the column will be lost.
  - You are about to drop the `user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teammemberId,resourceId,resourceType,action]` on the table `blogpermissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[UserId,BlogId]` on the table `teammembers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teammemberId,resourceId,resourceType]` on the table `temporaryaccesses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teammemberId` to the `blogpermissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teammemberId` to the `temporaryaccesses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `blogpermissions` DROP FOREIGN KEY `blogpermissions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `temporaryaccesses` DROP FOREIGN KEY `temporaryaccesses_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_permissions` DROP FOREIGN KEY `user_permissions_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `user_permissions` DROP FOREIGN KEY `user_permissions_userId_fkey`;

-- DropIndex
DROP INDEX `blogpermissions_userId_resourceId_resourceType_action_key` ON `blogpermissions`;

-- DropIndex
DROP INDEX `temporaryaccesses_userId_resourceId_resourceType_key` ON `temporaryaccesses`;

-- AlterTable
ALTER TABLE `blogpermissions` DROP COLUMN `userId`,
    ADD COLUMN `teammemberId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `temporaryaccesses` DROP COLUMN `userId`,
    ADD COLUMN `teammemberId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `user_permissions`;

-- CreateTable
CREATE TABLE `teammemberspermissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teammemberId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `teammemberspermissions_teammemberId_permissionId_key`(`teammemberId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsfiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jscodeblocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` INTEGER NOT NULL,
    `blockType` VARCHAR(50) NOT NULL,
    `blockName` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `startLine` INTEGER NOT NULL,
    `endLine` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jscodeblocks_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsfunctionparams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeBlockId` INTEGER NOT NULL,
    `paramName` VARCHAR(255) NOT NULL,
    `paramType` VARCHAR(50) NULL,
    `defaultValue` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsfunctionparams_codeBlockId_idx`(`codeBlockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsclassproperties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeBlockId` INTEGER NOT NULL,
    `propertyName` VARCHAR(255) NOT NULL,
    `propertyType` VARCHAR(50) NULL,
    `isStatic` BOOLEAN NOT NULL DEFAULT false,
    `visibility` VARCHAR(20) NOT NULL DEFAULT 'public',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsclassproperties_codeBlockId_idx`(`codeBlockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsclassmethods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeBlockId` INTEGER NOT NULL,
    `methodName` VARCHAR(255) NOT NULL,
    `isStatic` BOOLEAN NOT NULL DEFAULT false,
    `visibility` VARCHAR(20) NOT NULL DEFAULT 'public',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsclassmethods_codeBlockId_idx`(`codeBlockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsvariables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeBlockId` INTEGER NOT NULL,
    `variableName` VARCHAR(255) NOT NULL,
    `variableType` VARCHAR(50) NULL,
    `isConst` BOOLEAN NOT NULL DEFAULT false,
    `initialValue` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsvariables_codeBlockId_idx`(`codeBlockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsimports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` INTEGER NOT NULL,
    `importSource` VARCHAR(255) NOT NULL,
    `importType` VARCHAR(50) NOT NULL,
    `importedName` VARCHAR(255) NULL,
    `alias` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsimports_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsexports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` INTEGER NOT NULL,
    `exportType` VARCHAR(50) NOT NULL,
    `exportedName` VARCHAR(255) NULL,
    `alias` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsexports_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jscomments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeBlockId` INTEGER NOT NULL,
    `commentType` VARCHAR(20) NOT NULL,
    `content` TEXT NOT NULL,
    `startLine` INTEGER NOT NULL,
    `endLine` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jscomments_codeBlockId_idx`(`codeBlockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jsdependencies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` INTEGER NOT NULL,
    `dependencyName` VARCHAR(255) NOT NULL,
    `version` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jsdependencies_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `blogpermissions_teammemberId_resourceId_resourceType_action_key` ON `blogpermissions`(`teammemberId`, `resourceId`, `resourceType`, `action`);

-- CreateIndex
CREATE UNIQUE INDEX `teammembers_UserId_BlogId_key` ON `teammembers`(`UserId`, `BlogId`);

-- CreateIndex
CREATE UNIQUE INDEX `temporaryaccesses_teammemberId_resourceId_resourceType_key` ON `temporaryaccesses`(`teammemberId`, `resourceId`, `resourceType`);

-- AddForeignKey
ALTER TABLE `blogpermissions` ADD CONSTRAINT `blogpermissions_teammemberId_fkey` FOREIGN KEY (`teammemberId`) REFERENCES `teammembers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teammemberspermissions` ADD CONSTRAINT `teammemberspermissions_teammemberId_fkey` FOREIGN KEY (`teammemberId`) REFERENCES `teammembers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teammemberspermissions` ADD CONSTRAINT `teammemberspermissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `temporaryaccesses` ADD CONSTRAINT `temporaryaccesses_teammemberId_fkey` FOREIGN KEY (`teammemberId`) REFERENCES `teammembers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jscodeblocks` ADD CONSTRAINT `jscodeblocks_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `jsfiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsfunctionparams` ADD CONSTRAINT `jsfunctionparams_codeBlockId_fkey` FOREIGN KEY (`codeBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsclassproperties` ADD CONSTRAINT `jsclassproperties_codeBlockId_fkey` FOREIGN KEY (`codeBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsclassmethods` ADD CONSTRAINT `jsclassmethods_codeBlockId_fkey` FOREIGN KEY (`codeBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsvariables` ADD CONSTRAINT `jsvariables_codeBlockId_fkey` FOREIGN KEY (`codeBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsimports` ADD CONSTRAINT `jsimports_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `jsfiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsexports` ADD CONSTRAINT `jsexports_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `jsfiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jscomments` ADD CONSTRAINT `jscomments_codeBlockId_fkey` FOREIGN KEY (`codeBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jsdependencies` ADD CONSTRAINT `jsdependencies_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `jsfiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
