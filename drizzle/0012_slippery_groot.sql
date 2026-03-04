CREATE TABLE `gotStrategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`attackFormation` varchar(50) NOT NULL,
	`defenseFormation` varchar(50) NOT NULL,
	`keywords` text NOT NULL,
	`description` text,
	`winRate` int NOT NULL DEFAULT 0,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gotStrategies_id` PRIMARY KEY(`id`)
);
