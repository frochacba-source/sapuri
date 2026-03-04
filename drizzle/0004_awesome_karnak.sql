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
	`ranking` int,
	`didNotAttack` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gotAttacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gvgAttacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`memberId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`attack1Stars` int NOT NULL DEFAULT 0,
	`attack1Opponent` varchar(100),
	`attack2Stars` int NOT NULL DEFAULT 0,
	`attack2Opponent` varchar(100),
	`didNotAttack` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gvgAttacks_id` PRIMARY KEY(`id`)
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
ALTER TABLE `announcements` MODIFY COLUMN `eventTypeId` int;--> statement-breakpoint
ALTER TABLE `announcements` ADD `isGeneral` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `members` ADD `telegramChatId` varchar(100);