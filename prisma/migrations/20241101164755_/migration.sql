/*
  Warnings:

  - A unique constraint covering the columns `[name,tenantId]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[action,resource,roleId,tenantId]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,tenantId]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `roles_name_key` ON `roles`;

-- AlterTable
ALTER TABLE `permissions` ADD COLUMN `action` VARCHAR(255) NOT NULL,
    ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `resource` VARCHAR(255) NOT NULL,
    ADD COLUMN `tenantId` INTEGER NULL;

-- AlterTable
ALTER TABLE `postcomments` ADD COLUMN `moderationStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `moderationStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tenantId` INTEGER NULL,
    ADD COLUMN `value` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `resource_policies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resourceType` VARCHAR(255) NOT NULL,
    `resourceId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,
    `permissions` JSON NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `resource_policies_resourceType_resourceId_idx`(`resourceType`, `resourceId`),
    UNIQUE INDEX `resource_policies_resourceType_resourceId_roleId_key`(`resourceType`, `resourceId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `permissions_name_tenantId_key` ON `permissions`(`name`, `tenantId`);

-- CreateIndex
CREATE UNIQUE INDEX `permissions_action_resource_roleId_tenantId_key` ON `permissions`(`action`, `resource`, `roleId`, `tenantId`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_name_tenantId_key` ON `roles`(`name`, `tenantId`);

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_parentRoleId_fkey` FOREIGN KEY (`parentRoleId`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_policies` ADD CONSTRAINT `resource_policies_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
