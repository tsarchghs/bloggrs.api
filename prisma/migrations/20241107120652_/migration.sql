-- CreateTable
CREATE TABLE `property` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeBlockId` INTEGER NOT NULL,
    `propertyName` VARCHAR(191) NOT NULL,
    `propertyType` VARCHAR(191) NOT NULL,
    `isStatic` BOOLEAN NOT NULL DEFAULT false,
    `visibility` VARCHAR(191) NOT NULL DEFAULT 'public',
    `initialValue` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `property` ADD CONSTRAINT `property_codeBlockId_fkey` FOREIGN KEY (`codeBlockId`) REFERENCES `jscodeblocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
