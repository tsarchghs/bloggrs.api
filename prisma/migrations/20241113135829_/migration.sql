-- AlterTable
ALTER TABLE `users` ADD COLUMN `bloggrs_v_instancesId` VARCHAR(255) NULL,
    ADD COLUMN `customer_id` VARCHAR(255) NULL,
    ADD COLUMN `fc_image_id` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `apikeys` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `ProjectId` VARCHAR(255) NOT NULL,

    INDEX `ProjectId`(`ProjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `application_logo_url` VARCHAR(255) NULL,
    `application_name` VARCHAR(255) NOT NULL,
    `homepage_url` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `authorization_callback_url` VARCHAR(255) NOT NULL,
    `charge_callback_url` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `ProjectId` VARCHAR(255) NOT NULL,

    INDEX `ProjectId`(`ProjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authorizationcodes` (
    `id` VARCHAR(255) NOT NULL,
    `revokedAt` DATETIME(0) NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(255) NOT NULL DEFAULT 'user::basic',
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `OAuthClientId` VARCHAR(255) NOT NULL,
    `UserId` INTEGER NOT NULL,

    INDEX `OAuthClientId`(`OAuthClientId`),
    INDEX `UserId`(`UserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authorizedjavascriptorigins` (
    `id` VARCHAR(255) NOT NULL,
    `deletedAt` DATETIME(0) NULL,
    `value` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `OAuthClientId` VARCHAR(255) NOT NULL,

    INDEX `OAuthClientId`(`OAuthClientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authorizedredirecturis` (
    `id` VARCHAR(255) NOT NULL,
    `deletedAt` DATETIME(0) NULL,
    `value` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `OAuthClientId` VARCHAR(255) NOT NULL,

    INDEX `OAuthClientId`(`OAuthClientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charges` (
    `id` VARCHAR(255) NOT NULL,
    `app_id` VARCHAR(255) NOT NULL,
    `v_user_id` INTEGER NOT NULL,
    `v_user_address_id` VARCHAR(255) NULL,
    `customer_id` VARCHAR(255) NOT NULL,
    `amount` BIGINT NOT NULL,
    `stripe_charge_id` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comprefacesettings` (
    `id` VARCHAR(255) NOT NULL,
    `recognition_key` VARCHAR(150) NOT NULL,
    `verification_key` VARCHAR(150) NOT NULL,
    `detection_key` VARCHAR(150) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`, `recognition_key`, `verification_key`, `detection_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identitydocuments` (
    `id` VARCHAR(255) NOT NULL,
    `documentNumber` VARCHAR(255) NULL,
    `firstName` VARCHAR(255) NULL,
    `lastName` VARCHAR(255) NULL,
    `fullName` VARCHAR(255) NULL,
    `sex` VARCHAR(255) NULL,
    `age` VARCHAR(255) NULL,
    `dob` VARCHAR(255) NULL,
    `dob_day` VARCHAR(255) NULL,
    `dob_month` VARCHAR(255) NULL,
    `dob_year` VARCHAR(255) NULL,
    `expiry` VARCHAR(255) NULL,
    `expiry_day` VARCHAR(255) NULL,
    `expiry_month` VARCHAR(255) NULL,
    `expiry_year` VARCHAR(255) NULL,
    `daysToExpiry` VARCHAR(255) NULL,
    `placeOfBirth` VARCHAR(255) NULL,
    `optionalData` VARCHAR(255) NULL,
    `documentType` VARCHAR(255) NULL,
    `documentSide` VARCHAR(255) NULL,
    `issuerOrg_region_full` VARCHAR(255) NULL,
    `issuerOrg_region_abbr` VARCHAR(255) NULL,
    `issuerOrg_full` VARCHAR(255) NULL,
    `issuerOrg_iso2` VARCHAR(255) NULL,
    `issuerOrg_iso3` VARCHAR(255) NULL,
    `nationality_full` VARCHAR(255) NULL,
    `nationality_iso2` VARCHAR(255) NULL,
    `nationality_iso3` VARCHAR(255) NULL,
    `internalId` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `UserId` INTEGER NULL,

    INDEX `UserId`(`UserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bloggrs_v_instances` (
    `id` VARCHAR(255) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `ComprefaceSettingId` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instanceusers` (
    `id` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metadata` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauthclients` (
    `id` VARCHAR(255) NOT NULL,
    `type` ENUM('WebApplication') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `deletedAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `project_id` VARCHAR(255) NULL,

    INDEX `project_id`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauthclientsecrets` (
    `id` VARCHAR(255) NOT NULL,
    `deletedAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `OAuthClientId` VARCHAR(255) NULL,

    INDEX `OAuthClientId`(`OAuthClientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentproviders` (
    `id` CHAR(36) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `ApplicationId` VARCHAR(255) NOT NULL,
    `MetadatumId` CHAR(36) NOT NULL,

    INDEX `ApplicationId`(`ApplicationId`),
    INDEX `MetadatumId`(`MetadatumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `instanceuser_id` VARCHAR(255) NULL,

    INDEX `instanceuser_id`(`instanceuser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `useraddresses` (
    `id` VARCHAR(255) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(255) NOT NULL,
    `zipCode` VARCHAR(255) NOT NULL,
    `addressType` VARCHAR(255) NOT NULL DEFAULT 'private',
    `companyName` VARCHAR(255) NULL,
    `country` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(255) NOT NULL,
    `UserId` INTEGER NOT NULL,
    `instance_id` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `UserId`(`UserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_bloggrs_v_instancesId_fkey` FOREIGN KEY (`bloggrs_v_instancesId`) REFERENCES `bloggrs_v_instances`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apikeys` ADD CONSTRAINT `apikeys_ibfk_1` FOREIGN KEY (`ProjectId`) REFERENCES `projects`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`ProjectId`) REFERENCES `projects`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorizationcodes` ADD CONSTRAINT `authorizationcodes_ibfk_1` FOREIGN KEY (`OAuthClientId`) REFERENCES `oauthclients`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorizationcodes` ADD CONSTRAINT `authorizationcodes_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorizedjavascriptorigins` ADD CONSTRAINT `authorizedjavascriptorigins_ibfk_1` FOREIGN KEY (`OAuthClientId`) REFERENCES `oauthclients`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorizedredirecturis` ADD CONSTRAINT `authorizedredirecturis_ibfk_1` FOREIGN KEY (`OAuthClientId`) REFERENCES `oauthclients`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `identitydocuments` ADD CONSTRAINT `identitydocuments_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauthclients` ADD CONSTRAINT `oauthclients_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauthclientsecrets` ADD CONSTRAINT `oauthclientsecrets_ibfk_1` FOREIGN KEY (`OAuthClientId`) REFERENCES `oauthclients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentproviders` ADD CONSTRAINT `paymentproviders_ibfk_1` FOREIGN KEY (`ApplicationId`) REFERENCES `applications`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentproviders` ADD CONSTRAINT `paymentproviders_ibfk_2` FOREIGN KEY (`MetadatumId`) REFERENCES `metadata`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`instanceuser_id`) REFERENCES `instanceusers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `useraddresses` ADD CONSTRAINT `useraddresses_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
