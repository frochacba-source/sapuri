CREATE TABLE `characterCloth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_id` int NOT NULL,
	`level` int,
	`description` text,
	`hp_boost` decimal(5,2),
	`atk_boost` decimal(5,2),
	`def_boost` decimal(5,2),
	`haste` int,
	CONSTRAINT `characterCloth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characterConstellations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_id` int NOT NULL,
	`constellation_name` varchar(100),
	`description` text,
	`level` varchar(10),
	`hp_boost` decimal(5,2),
	`dodge` int,
	`atk_boost` decimal(5,2),
	`crit` decimal(5,2),
	`def_boost` decimal(5,2),
	`hit` int,
	CONSTRAINT `characterConstellations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characterLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_id` int NOT NULL,
	`link_name` varchar(100),
	`description` text,
	`level` int,
	CONSTRAINT `characterLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characterSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_id` int NOT NULL,
	`skill_name` varchar(100),
	`skill_type` varchar(50),
	`description` text,
	`start_time` decimal(5,3),
	`end_time` decimal(5,3),
	`delay` decimal(5,2),
	`cooldown` decimal(5,2),
	`cosmos_gain_atk` int,
	`cosmos_gain_dmg` int,
	CONSTRAINT `characterSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`class` varchar(50),
	`type` varchar(50),
	`summon_type` varchar(50),
	`release_date` varchar(10),
	`stars` int,
	`level` int,
	`hp` int,
	`atk` int,
	`def` int,
	`attack_rate` decimal(5,2),
	`tenacity` decimal(5,2),
	`cosmos_gain_atk` int,
	`cosmos_gain_dmg` int,
	`image_url` varchar(500),
	`ssloj_url` varchar(500),
	`last_updated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
