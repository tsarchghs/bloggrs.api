-- CreateTable
CREATE TABLE `blockchildrens` (
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `BlockId` INTEGER NOT NULL,
    `ChildrenId` INTEGER NOT NULL,

    INDEX `BlockId`(`BlockId`),
    PRIMARY KEY (`BlockId`, `ChildrenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blockchildrens` ADD CONSTRAINT `blockchildrens_ibfk_2` FOREIGN KEY (`ChildrenId`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blockchildrens` ADD CONSTRAINT `blockchildrens_ibfk_1` FOREIGN KEY (`BlockId`) REFERENCES `blocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
