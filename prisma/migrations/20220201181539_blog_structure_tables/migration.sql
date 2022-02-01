-- CreateTable
CREATE TABLE `block` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blockattributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `blockId` INTEGER NOT NULL,

    UNIQUE INDEX `key`(`key`),
    UNIQUE INDEX `value`(`value`),
    UNIQUE INDEX `blockattributes_key_value_key`(`key`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blockattributes` ADD CONSTRAINT `blockattributes_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `block`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
