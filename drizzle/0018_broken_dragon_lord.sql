CREATE TABLE `announcementRecipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`announcementId` int NOT NULL,
	`memberId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcementRecipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`createdBy` int NOT NULL,
	`sentAt` timestamp,
	`isGeneral` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `botConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegramBotToken` varchar(255),
	`telegramGroupId` varchar(100),
	`isActive` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `botConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`maxPlayers` int NOT NULL,
	`eventTime` varchar(5) NOT NULL,
	`reminderMinutes` int NOT NULL DEFAULT 30,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `eventTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `gotAttacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`memberId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`attackVictories` int NOT NULL DEFAULT 0,
	`attackDefeats` int NOT NULL DEFAULT 0,
	`defenseVictories` int NOT NULL DEFAULT 0,
	`defenseDefeats` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	`previousPoints` int NOT NULL DEFAULT 0,
	`pointsDifference` int NOT NULL DEFAULT 0,
	`ranking` int,
	`didNotAttack` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gotAttacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gotStrategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`observation` text,
	`attackFormation1` varchar(50) NOT NULL,
	`attackFormation2` varchar(50) NOT NULL,
	`attackFormation3` varchar(50) NOT NULL,
	`defenseFormation1` varchar(50) NOT NULL,
	`defenseFormation2` varchar(50) NOT NULL,
	`defenseFormation3` varchar(50) NOT NULL,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gotStrategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gotStrategyBackups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`strategyId` int NOT NULL,
	`backupType` enum('create','update','delete','manual') NOT NULL,
	`strategyData` text NOT NULL,
	`backupReason` varchar(255),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gotStrategyBackups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gvgAttacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`memberId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`attack1Stars` int NOT NULL DEFAULT 0,
	`attack1Missed` boolean NOT NULL DEFAULT false,
	`attack1Opponent` varchar(100),
	`attack2Stars` int NOT NULL DEFAULT 0,
	`attack2Missed` boolean NOT NULL DEFAULT false,
	`attack2Opponent` varchar(100),
	`didNotAttack` boolean NOT NULL DEFAULT false,
	`previousValidStars` int NOT NULL DEFAULT 0,
	`currentValidStars` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gvgAttacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gvgMatchInfo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`opponentGuild` varchar(100),
	`ourScore` int NOT NULL DEFAULT 0,
	`opponentScore` int NOT NULL DEFAULT 0,
	`validStars` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gvgMatchInfo_id` PRIMARY KEY(`id`),
	CONSTRAINT `gvgMatchInfo_eventDate_unique` UNIQUE(`eventDate`)
);
--> statement-breakpoint
CREATE TABLE `gvgSeasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`status` enum('active','paused','ended') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`returnDate` timestamp,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gvgSeasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gvgStrategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`observation` text,
	`attackFormation1` varchar(50) NOT NULL,
	`attackFormation2` varchar(50) NOT NULL,
	`attackFormation3` varchar(50) NOT NULL,
	`attackFormation4` varchar(50) NOT NULL,
	`attackFormation5` varchar(50) NOT NULL,
	`defenseFormation1` varchar(50) NOT NULL,
	`defenseFormation2` varchar(50) NOT NULL,
	`defenseFormation3` varchar(50) NOT NULL,
	`defenseFormation4` varchar(50) NOT NULL,
	`defenseFormation5` varchar(50) NOT NULL,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gvgStrategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gvgStrategyBackups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`strategyId` int NOT NULL,
	`backupType` enum('create','update','delete','manual') NOT NULL,
	`strategyData` text NOT NULL,
	`backupReason` varchar(255),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gvgStrategyBackups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`telegramId` varchar(100),
	`telegramUsername` varchar(100),
	`telegramChatId` varchar(100),
	`phoneNumber` varchar(20),
	`participatesGvg` boolean NOT NULL DEFAULT true,
	`participatesGot` boolean NOT NULL DEFAULT true,
	`participatesReliquias` boolean NOT NULL DEFAULT true,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nonAttackerAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`memberId` int NOT NULL,
	`alertSent` boolean NOT NULL DEFAULT false,
	`adminNotified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nonAttackerAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`memberId` int NOT NULL,
	`attacked` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reliquiasBossProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`bossName` varchar(50) NOT NULL,
	`bossOrder` int NOT NULL,
	`guardsRequired` int NOT NULL,
	`guardsDefeated` int NOT NULL DEFAULT 0,
	`bossDefeatedCount` int NOT NULL DEFAULT 0,
	`bossMaxDefeats` int NOT NULL DEFAULT 1,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reliquiasBossProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reliquiasDamage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`memberId` int NOT NULL,
	`cumulativeDamage` varchar(50) NOT NULL,
	`damageNumeric` int NOT NULL DEFAULT 0,
	`ranking` int,
	`power` varchar(20),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reliquiasDamage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reliquiasMemberAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`memberId` int NOT NULL,
	`bossName` varchar(50) NOT NULL,
	`attackNumber` int NOT NULL DEFAULT 1,
	`role` enum('guards','boss') NOT NULL DEFAULT 'guards',
	`guard1Number` int,
	`guard2Number` int,
	`performance` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reliquiasMemberAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reliquiasMemberRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`memberId` int NOT NULL,
	`role` enum('guards','boss') NOT NULL DEFAULT 'guards',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reliquiasMemberRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reliquiasSeasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`startDate` varchar(10) NOT NULL,
	`endDate` varchar(10),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reliquiasSeasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduleEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`memberId` int NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduleEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`createdBy` int NOT NULL,
	`notificationSent` boolean NOT NULL DEFAULT false,
	`reminderSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screenshotUploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`imageKey` varchar(255) NOT NULL,
	`extractedData` text,
	`processed` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `screenshotUploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subAdmins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`canManageGvg` boolean NOT NULL DEFAULT false,
	`canManageGot` boolean NOT NULL DEFAULT false,
	`canManageReliquias` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subAdmins_id` PRIMARY KEY(`id`),
	CONSTRAINT `subAdmins_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `systemBackups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupName` varchar(255) NOT NULL,
	`description` text,
	`backupData` text NOT NULL,
	`backupSize` int NOT NULL,
	`backupType` enum('manual','auto') NOT NULL DEFAULT 'manual',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemBackups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','subadmin') NOT NULL DEFAULT 'user';