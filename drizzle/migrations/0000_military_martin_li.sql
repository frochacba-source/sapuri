CREATE TYPE "public"."backup_type" AS ENUM('create', 'update', 'delete', 'manual', 'auto');--> statement-breakpoint
CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."gvg_season_status" AS ENUM('active', 'paused', 'ended');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('guards', 'boss');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'subadmin');--> statement-breakpoint
CREATE TABLE "aiChatHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"role" "chat_role" NOT NULL,
	"message" text NOT NULL,
	"context" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiChatSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(255),
	"context" varchar(100),
	"messageCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcementRecipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcementId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventTypeId" integer,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"createdBy" integer NOT NULL,
	"sentAt" timestamp,
	"isGeneral" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arayashiki_synergies" (
	"id" serial PRIMARY KEY NOT NULL,
	"character1" varchar(100) NOT NULL,
	"character2" varchar(100) NOT NULL,
	"synergyType" varchar(50),
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "botConfig" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegramBotToken" varchar(255),
	"telegramGroupId" varchar(100),
	"isActive" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardBackups" (
	"id" serial PRIMARY KEY NOT NULL,
	"cardId" integer NOT NULL,
	"backupType" "backup_type" NOT NULL,
	"cardData" text NOT NULL,
	"backupReason" varchar(255),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"imageUrl" varchar(500),
	"referenceLink" varchar(500),
	"usageLimit" varchar(255) NOT NULL,
	"bonusDmg" varchar(10) DEFAULT '0',
	"bonusDef" varchar(10) DEFAULT '0',
	"bonusVid" varchar(10) DEFAULT '0',
	"bonusPress" varchar(10) DEFAULT '0',
	"bonusEsquiva" varchar(10) DEFAULT '0',
	"bonusVelAtaq" varchar(10) DEFAULT '0',
	"bonusTenacidade" varchar(10) DEFAULT '0',
	"bonusSanguessuga" varchar(10) DEFAULT '0',
	"bonusRedDano" varchar(10) DEFAULT '0',
	"bonusCrit" varchar(10) DEFAULT '0',
	"bonusCura" varchar(10) DEFAULT '0',
	"bonusCuraRecebida" varchar(10) DEFAULT '0',
	"bonusPrecisao" varchar(10) DEFAULT '0',
	"bonusVida" varchar(10) DEFAULT '0',
	"skillEffect" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cards_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "characterCloth" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"level" integer,
	"description" text,
	"hp_boost" numeric(5, 2),
	"atk_boost" numeric(5, 2),
	"def_boost" numeric(5, 2),
	"haste" integer
);
--> statement-breakpoint
CREATE TABLE "characterConstellations" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"constellation_name" varchar(100),
	"description" text,
	"level" varchar(10),
	"hp_boost" numeric(5, 2),
	"dodge" integer,
	"atk_boost" numeric(5, 2),
	"crit" numeric(5, 2),
	"def_boost" numeric(5, 2),
	"hit" integer
);
--> statement-breakpoint
CREATE TABLE "characterLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"link_name" varchar(100),
	"description" text,
	"level" integer
);
--> statement-breakpoint
CREATE TABLE "characterSkills" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"skill_name" varchar(100),
	"skill_type" varchar(50),
	"description" text,
	"start_time" numeric(5, 3),
	"end_time" numeric(5, 3),
	"delay" numeric(5, 2),
	"cooldown" numeric(5, 2),
	"cosmos_gain_atk" integer,
	"cosmos_gain_dmg" integer
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"class" varchar(50),
	"type" varchar(50),
	"summon_type" varchar(50),
	"release_date" varchar(10),
	"stars" integer,
	"level" integer,
	"hp" integer,
	"atk" integer,
	"def" integer,
	"attack_rate" numeric(5, 2),
	"tenacity" numeric(5, 2),
	"cosmos_gain_atk" integer,
	"cosmos_gain_dmg" integer,
	"dano_percent" numeric(5, 2),
	"defesa_percent" numeric(5, 2),
	"resistencia" numeric(5, 2),
	"pressa" numeric(5, 2),
	"esquiva_percent" numeric(5, 2),
	"vel_ataque_percent" numeric(5, 2),
	"tenacidade" numeric(5, 2),
	"sanguessuga" numeric(5, 2),
	"dano_vermelho_percent" numeric(5, 2),
	"tax_critico" numeric(5, 2),
	"precisao" numeric(5, 2),
	"cura_percent" numeric(5, 2),
	"cura_recebida_percent" numeric(5, 2),
	"bonus_vida_percent" numeric(5, 2),
	"red_dano_percent" numeric(5, 2),
	"esquiva_valor" numeric(5, 2),
	"efeito_habilidade" text,
	"image_url" varchar(500),
	"ssloj_url" varchar(500),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eventTypes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"displayName" varchar(100) NOT NULL,
	"maxPlayers" integer NOT NULL,
	"eventTime" varchar(5) NOT NULL,
	"reminderMinutes" integer DEFAULT 30 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "eventTypes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gotAttacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheduleId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"attackVictories" integer DEFAULT 0 NOT NULL,
	"attackDefeats" integer DEFAULT 0 NOT NULL,
	"defenseVictories" integer DEFAULT 0 NOT NULL,
	"defenseDefeats" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"previousPoints" integer DEFAULT 0 NOT NULL,
	"pointsDifference" integer DEFAULT 0 NOT NULL,
	"ranking" integer,
	"didNotAttack" boolean DEFAULT false NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gotStrategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"observation" text,
	"attackFormation1" varchar(50) NOT NULL,
	"attackFormation2" varchar(50) NOT NULL,
	"attackFormation3" varchar(50) NOT NULL,
	"defenseFormation1" varchar(50) NOT NULL,
	"defenseFormation2" varchar(50) NOT NULL,
	"defenseFormation3" varchar(50) NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gotStrategyBackups" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategyId" integer NOT NULL,
	"backupType" "backup_type" NOT NULL,
	"strategyData" text NOT NULL,
	"backupReason" varchar(255),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gvgAttacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheduleId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"attack1Stars" integer DEFAULT 0 NOT NULL,
	"attack1Missed" boolean DEFAULT false NOT NULL,
	"attack1Opponent" varchar(100),
	"attack2Stars" integer DEFAULT 0 NOT NULL,
	"attack2Missed" boolean DEFAULT false NOT NULL,
	"attack2Opponent" varchar(100),
	"didNotAttack" boolean DEFAULT false NOT NULL,
	"previousValidStars" integer DEFAULT 0 NOT NULL,
	"currentValidStars" integer DEFAULT 0 NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gvgMatchInfo" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"opponentGuild" varchar(100),
	"ourScore" integer DEFAULT 0 NOT NULL,
	"opponentScore" integer DEFAULT 0 NOT NULL,
	"validStars" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gvgMatchInfo_eventDate_unique" UNIQUE("eventDate")
);
--> statement-breakpoint
CREATE TABLE "gvgSeasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" "gvg_season_status" DEFAULT 'active' NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"returnDate" timestamp,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gvgStrategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"attackFormation1" varchar(50) NOT NULL,
	"attackFormation2" varchar(50) NOT NULL,
	"attackFormation3" varchar(50) NOT NULL,
	"attackFormation4" varchar(50) NOT NULL,
	"attackFormation5" varchar(50) NOT NULL,
	"defenseFormation1" varchar(50) NOT NULL,
	"defenseFormation2" varchar(50) NOT NULL,
	"defenseFormation3" varchar(50) NOT NULL,
	"defenseFormation4" varchar(50) NOT NULL,
	"defenseFormation5" varchar(50) NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gvgStrategyBackups" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategyId" integer NOT NULL,
	"backupType" "backup_type" NOT NULL,
	"strategyData" text NOT NULL,
	"backupReason" varchar(255),
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"telegramId" varchar(100),
	"telegramUsername" varchar(100),
	"telegramChatId" varchar(100),
	"phoneNumber" varchar(20),
	"participatesGvg" boolean DEFAULT true NOT NULL,
	"participatesGot" boolean DEFAULT true NOT NULL,
	"participatesReliquias" boolean DEFAULT true NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nonAttackerAlerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventTypeId" integer NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"memberId" integer NOT NULL,
	"alertSent" boolean DEFAULT false NOT NULL,
	"adminNotified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performanceRecords" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventTypeId" integer NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"memberId" integer NOT NULL,
	"attacked" boolean DEFAULT false NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reliquiasBossProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"seasonId" integer NOT NULL,
	"bossName" varchar(50) NOT NULL,
	"bossOrder" integer NOT NULL,
	"guardsRequired" integer NOT NULL,
	"guardsDefeated" integer DEFAULT 0 NOT NULL,
	"bossDefeatedCount" integer DEFAULT 0 NOT NULL,
	"bossMaxDefeats" integer DEFAULT 1 NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reliquiasDamage" (
	"id" serial PRIMARY KEY NOT NULL,
	"seasonId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"cumulativeDamage" varchar(50) NOT NULL,
	"damageNumeric" integer DEFAULT 0 NOT NULL,
	"ranking" integer,
	"power" varchar(20),
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reliquiasMemberAssignments" (
	"id" integer PRIMARY KEY NOT NULL,
	"seasonId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"bossName" varchar(50) NOT NULL,
	"attackNumber" integer DEFAULT 1 NOT NULL,
	"role" "member_role" DEFAULT 'guards' NOT NULL,
	"guard1Number" integer,
	"guard2Number" integer,
	"performance" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reliquiasMemberRoles" (
	"id" serial PRIMARY KEY NOT NULL,
	"seasonId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"role" "member_role" DEFAULT 'guards' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reliquiasSeasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"startDate" varchar(10) NOT NULL,
	"endDate" varchar(10),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduleEntries" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheduleId" integer NOT NULL,
	"memberId" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventTypeId" integer NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"createdBy" integer NOT NULL,
	"notificationSent" boolean DEFAULT false NOT NULL,
	"reminderSent" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screenshotUploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventTypeId" integer NOT NULL,
	"eventDate" varchar(10) NOT NULL,
	"imageUrl" varchar(500) NOT NULL,
	"imageKey" varchar(255) NOT NULL,
	"extractedData" text,
	"processed" boolean DEFAULT false NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategyAnalysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategyId" integer NOT NULL,
	"analysis" text NOT NULL,
	"suggestions" text,
	"strengths" text,
	"weaknesses" text,
	"rating" numeric(3, 2),
	"analyzedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subAdmins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"canManageGvg" boolean DEFAULT false NOT NULL,
	"canManageGot" boolean DEFAULT false NOT NULL,
	"canManageReliquias" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subAdmins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "systemBackups" (
	"id" serial PRIMARY KEY NOT NULL,
	"backupName" varchar(255) NOT NULL,
	"description" text,
	"backupData" text NOT NULL,
	"backupSize" integer NOT NULL,
	"backupType" "backup_type" DEFAULT 'manual' NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
