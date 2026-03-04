CREATE TABLE `gvgMatchInfo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`opponentGuild` varchar(100),
	`ourScore` int NOT NULL DEFAULT 0,
	`opponentScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gvgMatchInfo_id` PRIMARY KEY(`id`),
	CONSTRAINT `gvgMatchInfo_eventDate_unique` UNIQUE(`eventDate`)
);
--> statement-breakpoint
ALTER TABLE `gvgAttacks` ADD `attack1Missed` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `gvgAttacks` ADD `attack2Missed` boolean DEFAULT false NOT NULL;