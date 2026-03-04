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
