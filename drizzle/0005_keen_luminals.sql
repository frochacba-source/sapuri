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
