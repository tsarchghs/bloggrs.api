-- CreateTable
CREATE TABLE `instances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `BlogId` INTEGER NULL,
    `UserId` INTEGER NULL,

    INDEX `instances_BlogId_idx`(`BlogId`),
    INDEX `instances_UserId_idx`(`UserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `instances` ADD CONSTRAINT `instances_BlogId_fkey` FOREIGN KEY (`BlogId`) REFERENCES `blogs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instances` ADD CONSTRAINT `instances_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
