-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_tenantId_fkey`;

-- AlterTable
ALTER TABLE `users` MODIFY `tenantId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
