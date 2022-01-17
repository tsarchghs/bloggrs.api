-- CreateTable
CREATE TABLE `publickeys` (
    `id` CHAR(36) NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `BlogId` INTEGER NOT NULL,

    INDEX `BlogId`(`BlogId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `publickeys` ADD CONSTRAINT `publickeys_ibfk_1` FOREIGN KEY (`BlogId`) REFERENCES `blogs`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
