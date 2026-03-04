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
	`eventTypeId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`createdBy` int NOT NULL,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
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
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','subadmin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `members` ADD `participatesGvg` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `members` ADD `participatesGot` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `members` ADD `participatesReliquias` boolean DEFAULT true NOT NULL;