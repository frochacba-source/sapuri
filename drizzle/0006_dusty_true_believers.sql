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
