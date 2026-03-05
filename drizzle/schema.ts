import { pgTable, pgEnum, serial, text, timestamp, varchar, boolean, numeric, bigint, integer } from "drizzle-orm/pg-core";

// Enums for PostgreSQL
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "subadmin"]);
export const memberRoleEnum = pgEnum("member_role", ["guards", "boss"]);
export const backupTypeEnum = pgEnum("backup_type", ["create", "update", "delete", "manual", "auto"]);
export const gvgSeasonStatusEnum = pgEnum("gvg_season_status", ["active", "paused", "ended"]);
export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sub-admin accounts with simple password auth
 */
export const subAdmins = pgTable("subAdmins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  canManageGvg: boolean("canManageGvg").default(false).notNull(),
  canManageGot: boolean("canManageGot").default(false).notNull(),
  canManageReliquias: boolean("canManageReliquias").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SubAdmin = typeof subAdmins.$inferSelect;
export type InsertSubAdmin = typeof subAdmins.$inferInsert;

/**
 * Guild members - players that can be scheduled for events
 */
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  telegramId: varchar("telegramId", { length: 100 }),
  telegramUsername: varchar("telegramUsername", { length: 100 }),
  telegramChatId: varchar("telegramChatId", { length: 100 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  participatesGvg: boolean("participatesGvg").default(true).notNull(),
  participatesGot: boolean("participatesGot").default(true).notNull(),
  participatesReliquias: boolean("participatesReliquias").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

/**
 * Event types configuration
 */
export const eventTypes = pgTable("eventTypes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  maxPlayers: integer("maxPlayers").notNull(),
  eventTime: varchar("eventTime", { length: 5 }).notNull(),
  reminderMinutes: integer("reminderMinutes").default(30).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventType = typeof eventTypes.$inferSelect;
export type InsertEventType = typeof eventTypes.$inferInsert;

/**
 * Daily schedules - one record per event per day
 */
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("eventTypeId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(),
  createdBy: integer("createdBy").notNull(),
  notificationSent: boolean("notificationSent").default(false).notNull(),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

/**
 * Schedule entries - members assigned to a schedule
 */
export const scheduleEntries = pgTable("scheduleEntries", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId").notNull(),
  memberId: integer("memberId").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
export type InsertScheduleEntry = typeof scheduleEntries.$inferInsert;

/**
 * Announcements/Alerts for specific events
 */
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("eventTypeId"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  createdBy: integer("createdBy").notNull(),
  sentAt: timestamp("sentAt"),
  isGeneral: boolean("isGeneral").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Announcement recipients - which members received an announcement
 */
export const announcementRecipients = pgTable("announcementRecipients", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcementId").notNull(),
  memberId: integer("memberId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnnouncementRecipient = typeof announcementRecipients.$inferSelect;
export type InsertAnnouncementRecipient = typeof announcementRecipients.$inferInsert;

/**
 * GvG Attack Records - 2 attacks per member, 0-3 stars each
 */
export const gvgAttacks = pgTable("gvgAttacks", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId").notNull(),
  memberId: integer("memberId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(),
  attack1Stars: integer("attack1Stars").default(0).notNull(),
  attack1Missed: boolean("attack1Missed").default(false).notNull(),
  attack1Opponent: varchar("attack1Opponent", { length: 100 }),
  attack2Stars: integer("attack2Stars").default(0).notNull(),
  attack2Missed: boolean("attack2Missed").default(false).notNull(),
  attack2Opponent: varchar("attack2Opponent", { length: 100 }),
  didNotAttack: boolean("didNotAttack").default(false).notNull(),
  previousValidStars: integer("previousValidStars").default(0).notNull(),
  currentValidStars: integer("currentValidStars").default(0).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GvgAttack = typeof gvgAttacks.$inferSelect;
export type InsertGvgAttack = typeof gvgAttacks.$inferInsert;

/**
 * GvG Match Info - opponent guild and score per day
 */
export const gvgMatchInfo = pgTable("gvgMatchInfo", {
  id: serial("id").primaryKey(),
  eventDate: varchar("eventDate", { length: 10 }).notNull().unique(),
  opponentGuild: varchar("opponentGuild", { length: 100 }),
  ourScore: integer("ourScore").default(0).notNull(),
  opponentScore: integer("opponentScore").default(0).notNull(),
  validStars: integer("validStars").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GvgMatchInfo = typeof gvgMatchInfo.$inferSelect;
export type InsertGvgMatchInfo = typeof gvgMatchInfo.$inferInsert;

/**
 * GoT Attack Records - victories/defeats in attack and defense + points
 */
export const gotAttacks = pgTable("gotAttacks", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId").notNull(),
  memberId: integer("memberId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(),
  attackVictories: integer("attackVictories").default(0).notNull(),
  attackDefeats: integer("attackDefeats").default(0).notNull(),
  defenseVictories: integer("defenseVictories").default(0).notNull(),
  defenseDefeats: integer("defenseDefeats").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  previousPoints: integer("previousPoints").default(0).notNull(),
  pointsDifference: integer("pointsDifference").default(0).notNull(),
  ranking: integer("ranking"),
  didNotAttack: boolean("didNotAttack").default(false).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GotAttack = typeof gotAttacks.$inferSelect;
export type InsertGotAttack = typeof gotAttacks.$inferInsert;

/**
 * Screenshot uploads for automatic data extraction
 */
export const screenshotUploads = pgTable("screenshotUploads", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("eventTypeId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  imageKey: varchar("imageKey", { length: 255 }).notNull(),
  extractedData: text("extractedData"),
  processed: boolean("processed").default(false).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScreenshotUpload = typeof screenshotUploads.$inferSelect;
export type InsertScreenshotUpload = typeof screenshotUploads.$inferInsert;

/**
 * Non-attacker alerts - track who didn't attack
 */
export const nonAttackerAlerts = pgTable("nonAttackerAlerts", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("eventTypeId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(),
  memberId: integer("memberId").notNull(),
  alertSent: boolean("alertSent").default(false).notNull(),
  adminNotified: boolean("adminNotified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NonAttackerAlert = typeof nonAttackerAlerts.$inferSelect;
export type InsertNonAttackerAlert = typeof nonAttackerAlerts.$inferInsert;

/**
 * Performance records from GoT screenshots (legacy - keeping for compatibility)
 */
export const performanceRecords = pgTable("performanceRecords", {
  id: serial("id").primaryKey(),
  eventTypeId: integer("eventTypeId").notNull(),
  eventDate: varchar("eventDate", { length: 10 }).notNull(),
  memberId: integer("memberId").notNull(),
  attacked: boolean("attacked").default(false).notNull(),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceRecord = typeof performanceRecords.$inferSelect;
export type InsertPerformanceRecord = typeof performanceRecords.$inferInsert;

/**
 * Bot configuration
 */
export const botConfig = pgTable("botConfig", {
  id: serial("id").primaryKey(),
  telegramBotToken: varchar("telegramBotToken", { length: 255 }),
  telegramGroupId: varchar("telegramGroupId", { length: 100 }),
  isActive: boolean("isActive").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BotConfig = typeof botConfig.$inferSelect;
export type InsertBotConfig = typeof botConfig.$inferInsert;

/**
 * Reliquias Seasons - each season has a sequence of bosses
 */
export const reliquiasSeasons = pgTable("reliquiasSeasons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: varchar("startDate", { length: 50 }).notNull(),
  endDate: varchar("endDate", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ReliquiasSeason = typeof reliquiasSeasons.$inferSelect;
export type InsertReliquiasSeason = typeof reliquiasSeasons.$inferInsert;

/**
 * Reliquias Boss Progress - track which boss the guild is fighting
 */
export const reliquiasBossProgress = pgTable("reliquiasBossProgress", {
  id: serial("id").primaryKey(),
  seasonId: integer("seasonId").notNull(),
  bossId: integer("bossId").notNull(),
  bossName: varchar("bossName", { length: 50 }).notNull(),
  currentHp: integer("currentHp").default(100).notNull(),
  maxHp: integer("maxHp").default(100).notNull(),
  stage: integer("stage").default(1).notNull(),
  isDefeated: boolean("isDefeated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ReliquiasBossProgress = typeof reliquiasBossProgress.$inferSelect;
export type InsertReliquiasBossProgress = typeof reliquiasBossProgress.$inferInsert;

/**
 * Reliquias Member Assignments - member role per boss with guard numbers and performance
 */
export const reliquiasMemberAssignments = pgTable("reliquiasMemberAssignments", {
  id: serial("id").primaryKey(),
  memberId: integer("memberId").notNull(),
  bossName: varchar("bossName", { length: 50 }).notNull(),
  seasonId: integer("seasonId").notNull(),
  bossId: integer("bossId").default(0),
  assignedAt: varchar("assignedAt", { length: 50 }),
  unassignedAt: varchar("unassignedAt", { length: 50 }),
  createdAt: varchar("createdAt", { length: 20 }).notNull(),
  updatedAt: varchar("updatedAt", { length: 20 }).notNull(),
  attackNumber: integer("attackNumber").default(1),
  role: memberRoleEnum("role").default("guards"),
  guard1Number: integer("guard1Number"),
  guard2Number: integer("guard2Number"),
  performance: text("performance"),
});

export type ReliquiasMemberAssignment = typeof reliquiasMemberAssignments.$inferSelect;
export type InsertReliquiasMemberAssignment = typeof reliquiasMemberAssignments.$inferInsert;

/**
 * Reliquias Member Role - legacy table for backwards compatibility
 */
export const reliquiasMemberRoles = pgTable("reliquiasMemberRoles", {
  id: serial("id").primaryKey(),
  seasonId: integer("seasonId").notNull(),
  memberId: integer("memberId").notNull(),
  role: memberRoleEnum("role").default("guards").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ReliquiasMemberRole = typeof reliquiasMemberRoles.$inferSelect;
export type InsertReliquiasMemberRole = typeof reliquiasMemberRoles.$inferInsert;

/**
 * Reliquias Damage Records - cumulative damage per member per season
 */
export const reliquiasDamage = pgTable("reliquiasDamage", {
  id: serial("id").primaryKey(),
  seasonId: integer("seasonId").notNull(),
  memberId: integer("memberId").notNull(),
  cumulativeDamage: varchar("cumulativeDamage", { length: 50 }).notNull(),
  damageNumeric: integer("damageNumeric").default(0).notNull(),
  ranking: integer("ranking"),
  power: varchar("power", { length: 20 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReliquiasDamage = typeof reliquiasDamage.$inferSelect;
export type InsertReliquiasDamage = typeof reliquiasDamage.$inferInsert;

/**
 * GvG Seasons - control temporadas de 2 semanas (seg-sab)
 */
export const gvgSeasons = pgTable("gvgSeasons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  status: gvgSeasonStatusEnum("status").default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  returnDate: timestamp("returnDate"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GvgSeason = typeof gvgSeasons.$inferSelect;
export type InsertGvgSeason = typeof gvgSeasons.$inferInsert;

/**
 * GoT Strategies - formações 3x3 (Ataque x Defesa)
 */
export const gotStrategies = pgTable("gotStrategies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  observation: text("observation"),
  attackFormation1: varchar("attackFormation1", { length: 50 }).notNull(),
  attackFormation2: varchar("attackFormation2", { length: 50 }).notNull(),
  attackFormation3: varchar("attackFormation3", { length: 50 }).notNull(),
  defenseFormation1: varchar("defenseFormation1", { length: 50 }).notNull(),
  defenseFormation2: varchar("defenseFormation2", { length: 50 }).notNull(),
  defenseFormation3: varchar("defenseFormation3", { length: 50 }).notNull(),
  usageCount: integer("usageCount").default(0).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GotStrategy = typeof gotStrategies.$inferSelect;
export type InsertGotStrategy = typeof gotStrategies.$inferInsert;

/**
 * GVG Strategies - 5v5 formations
 */
export const gvgStrategies = pgTable("gvgStrategies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  attackFormation1: varchar("attackFormation1", { length: 50 }).notNull(),
  attackFormation2: varchar("attackFormation2", { length: 50 }).notNull(),
  attackFormation3: varchar("attackFormation3", { length: 50 }).notNull(),
  attackFormation4: varchar("attackFormation4", { length: 50 }).notNull(),
  attackFormation5: varchar("attackFormation5", { length: 50 }).notNull(),
  defenseFormation1: varchar("defenseFormation1", { length: 50 }).notNull(),
  defenseFormation2: varchar("defenseFormation2", { length: 50 }).notNull(),
  defenseFormation3: varchar("defenseFormation3", { length: 50 }).notNull(),
  defenseFormation4: varchar("defenseFormation4", { length: 50 }).notNull(),
  defenseFormation5: varchar("defenseFormation5", { length: 50 }).notNull(),
  usageCount: integer("usageCount").default(0).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GvgStrategy = typeof gvgStrategies.$inferSelect;
export type InsertGvgStrategy = typeof gvgStrategies.$inferInsert;

/**
 * Backup de Estratégias GoT
 */
export const gotStrategyBackups = pgTable("gotStrategyBackups", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategyId").notNull(),
  backupType: backupTypeEnum("backupType").notNull(),
  strategyData: text("strategyData").notNull(),
  backupReason: varchar("backupReason", { length: 255 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GotStrategyBackup = typeof gotStrategyBackups.$inferSelect;
export type InsertGotStrategyBackup = typeof gotStrategyBackups.$inferInsert;

/**
 * Backup de Estratégias GVG
 */
export const gvgStrategyBackups = pgTable("gvgStrategyBackups", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategyId").notNull(),
  backupType: backupTypeEnum("backupType").notNull(),
  strategyData: text("strategyData").notNull(),
  backupReason: varchar("backupReason", { length: 255 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GvgStrategyBackup = typeof gvgStrategyBackups.$inferSelect;
export type InsertGvgStrategyBackup = typeof gvgStrategyBackups.$inferInsert;

/**
 * Backup Completo do Sistema
 */
export const systemBackups = pgTable("systemBackups", {
  id: serial("id").primaryKey(),
  backupName: varchar("backupName", { length: 255 }).notNull(),
  description: text("description"),
  backupData: text("backupData").notNull(),
  backupSize: integer("backupSize").notNull(),
  backupType: backupTypeEnum("backupType").default("manual").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemBackup = typeof systemBackups.$inferSelect;
export type InsertSystemBackup = typeof systemBackups.$inferInsert;

/**
 * Cards - Cartas do jogo
 */
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  referenceLink: varchar("referenceLink", { length: 500 }),
  usageLimit: varchar("usageLimit", { length: 255 }).notNull(),
  bonusDmg: varchar("bonusDmg", { length: 10 }).default("0"),
  bonusDef: varchar("bonusDef", { length: 10 }).default("0"),
  bonusVid: varchar("bonusVid", { length: 10 }).default("0"),
  bonusPress: varchar("bonusPress", { length: 10 }).default("0"),
  bonusEsquiva: varchar("bonusEsquiva", { length: 10 }).default("0"),
  bonusVelAtaq: varchar("bonusVelAtaq", { length: 10 }).default("0"),
  bonusTenacidade: varchar("bonusTenacidade", { length: 10 }).default("0"),
  bonusSanguessuga: varchar("bonusSanguessuga", { length: 10 }).default("0"),
  bonusRedDano: varchar("bonusRedDano", { length: 10 }).default("0"),
  bonusCrit: varchar("bonusCrit", { length: 10 }).default("0"),
  bonusCura: varchar("bonusCura", { length: 10 }).default("0"),
  bonusCuraRecebida: varchar("bonusCuraRecebida", { length: 10 }).default("0"),
  bonusPrecisao: varchar("bonusPrecisao", { length: 10 }).default("0"),
  bonusVida: varchar("bonusVida", { length: 10 }).default("0"),
  skillEffect: text("skillEffect"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

/**
 * Backup de Cartas
 */
export const cardBackups = pgTable("cardBackups", {
  id: serial("id").primaryKey(),
  cardId: integer("cardId").notNull(),
  backupType: backupTypeEnum("backupType").notNull(),
  cardData: text("cardData").notNull(),
  backupReason: varchar("backupReason", { length: 255 }),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CardBackup = typeof cardBackups.$inferSelect;
export type InsertCardBackup = typeof cardBackups.$inferInsert;

/**
 * Characters - Cavaleiros do jogo
 */
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  class: varchar("class", { length: 50 }),
  type: varchar("type", { length: 50 }),
  summon_type: varchar("summon_type", { length: 50 }),
  release_date: varchar("release_date", { length: 10 }),
  stars: integer("stars"),
  level: integer("level"),
  hp: integer("hp"),
  atk: integer("atk"),
  def: integer("def"),
  attack_rate: numeric("attack_rate", { precision: 5, scale: 2 }),
  tenacity: numeric("tenacity", { precision: 5, scale: 2 }),
  cosmos_gain_atk: integer("cosmos_gain_atk"),
  cosmos_gain_dmg: integer("cosmos_gain_dmg"),
  dano_percent: numeric("dano_percent", { precision: 5, scale: 2 }),
  defesa_percent: numeric("defesa_percent", { precision: 5, scale: 2 }),
  resistencia: numeric("resistencia", { precision: 5, scale: 2 }),
  pressa: numeric("pressa", { precision: 5, scale: 2 }),
  esquiva_percent: numeric("esquiva_percent", { precision: 5, scale: 2 }),
  vel_ataque_percent: numeric("vel_ataque_percent", { precision: 5, scale: 2 }),
  tenacidade: numeric("tenacidade", { precision: 5, scale: 2 }),
  sanguessuga: numeric("sanguessuga", { precision: 5, scale: 2 }),
  dano_vermelho_percent: numeric("dano_vermelho_percent", { precision: 5, scale: 2 }),
  tax_critico: numeric("tax_critico", { precision: 5, scale: 2 }),
  precisao: numeric("precisao", { precision: 5, scale: 2 }),
  cura_percent: numeric("cura_percent", { precision: 5, scale: 2 }),
  cura_recebida_percent: numeric("cura_recebida_percent", { precision: 5, scale: 2 }),
  bonus_vida_percent: numeric("bonus_vida_percent", { precision: 5, scale: 2 }),
  red_dano_percent: numeric("red_dano_percent", { precision: 5, scale: 2 }),
  esquiva_valor: numeric("esquiva_valor", { precision: 5, scale: 2 }),
  efeito_habilidade: text("efeito_habilidade"),
  image_url: varchar("image_url", { length: 500 }),
  ssloj_url: varchar("ssloj_url", { length: 500 }),
  last_updated: timestamp("last_updated").defaultNow(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Character Skills
 */
export const characterSkills = pgTable("characterSkills", {
  id: serial("id").primaryKey(),
  character_id: integer("character_id").notNull(),
  skill_name: varchar("skill_name", { length: 100 }),
  skill_type: varchar("skill_type", { length: 50 }),
  description: text("description"),
  start_time: numeric("start_time", { precision: 5, scale: 3 }),
  end_time: numeric("end_time", { precision: 5, scale: 3 }),
  delay: numeric("delay", { precision: 5, scale: 2 }),
  cooldown: numeric("cooldown", { precision: 5, scale: 2 }),
  cosmos_gain_atk: integer("cosmos_gain_atk"),
  cosmos_gain_dmg: integer("cosmos_gain_dmg"),
});

export type CharacterSkill = typeof characterSkills.$inferSelect;
export type InsertCharacterSkill = typeof characterSkills.$inferInsert;

/**
 * Character Cloth
 */
export const characterCloth = pgTable("characterCloth", {
  id: serial("id").primaryKey(),
  character_id: integer("character_id").notNull(),
  level: integer("level"),
  description: text("description"),
  hp_boost: numeric("hp_boost", { precision: 5, scale: 2 }),
  atk_boost: numeric("atk_boost", { precision: 5, scale: 2 }),
  def_boost: numeric("def_boost", { precision: 5, scale: 2 }),
  haste: integer("haste"),
});

export type CharacterClothData = typeof characterCloth.$inferSelect;
export type InsertCharacterCloth = typeof characterCloth.$inferInsert;

/**
 * Character Constellations
 */
export const characterConstellations = pgTable("characterConstellations", {
  id: serial("id").primaryKey(),
  character_id: integer("character_id").notNull(),
  constellation_name: varchar("constellation_name", { length: 100 }),
  description: text("description"),
  level: varchar("level", { length: 10 }),
  hp_boost: numeric("hp_boost", { precision: 5, scale: 2 }),
  dodge: integer("dodge"),
  atk_boost: numeric("atk_boost", { precision: 5, scale: 2 }),
  crit: numeric("crit", { precision: 5, scale: 2 }),
  def_boost: numeric("def_boost", { precision: 5, scale: 2 }),
  hit: integer("hit"),
});

export type CharacterConstellation = typeof characterConstellations.$inferSelect;
export type InsertCharacterConstellation = typeof characterConstellations.$inferInsert;

/**
 * Character Links
 */
export const characterLinks = pgTable("characterLinks", {
  id: serial("id").primaryKey(),
  character_id: integer("character_id").notNull(),
  link_name: varchar("link_name", { length: 100 }),
  description: text("description"),
  level: integer("level"),
});

export type CharacterLink = typeof characterLinks.$inferSelect;
export type InsertCharacterLink = typeof characterLinks.$inferInsert;

/**
 * AI Chat History
 */
export const aiChatHistory = pgTable("aiChatHistory", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  role: chatRoleEnum("role").notNull(),
  message: text("message").notNull(),
  context: varchar("context", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIChatMessage = typeof aiChatHistory.$inferSelect;
export type InsertAIChatMessage = typeof aiChatHistory.$inferInsert;

/**
 * AI Chat Sessions
 */
export const aiChatSessions = pgTable("aiChatSessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }),
  context: varchar("context", { length: 100 }),
  messageCount: integer("messageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AIChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAIChatSession = typeof aiChatSessions.$inferInsert;

/**
 * Strategy Analysis
 */
export const strategyAnalysis = pgTable("strategyAnalysis", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategyId").notNull(),
  analysis: text("analysis").notNull(),
  suggestions: text("suggestions"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StrategyAnalysis = typeof strategyAnalysis.$inferSelect;
export type InsertStrategyAnalysis = typeof strategyAnalysis.$inferInsert;

/**
 * Arayashiki Synergies - table for character synergies
 */
export const arayashikiSynergies = pgTable("arayashiki_synergies", {
  id: serial("id").primaryKey(),
  character1: varchar("character1", { length: 100 }).notNull(),
  character2: varchar("character2", { length: 100 }).notNull(),
  synergyType: varchar("synergyType", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArayashikiSynergy = typeof arayashikiSynergies.$inferSelect;
export type InsertArayashikiSynergy = typeof arayashikiSynergies.$inferInsert;

/**
 * Custom Messages - Mensagens personalizadas agendadas para GvG
 */
export const customMessages = pgTable("customMessages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  scheduleTime: varchar("scheduleTime", { length: 5 }).notNull(), // HH:mm
  daysOfWeek: varchar("daysOfWeek", { length: 50 }), // JSON array: [0,1,2,3,4,5,6] ou null para todos os dias
  isActive: boolean("isActive").default(true).notNull(),
  sendToTelegram: boolean("sendToTelegram").default(true).notNull(),
  sendToWhatsApp: boolean("sendToWhatsApp").default(true).notNull(),
  telegramGroupId: varchar("telegramGroupId", { length: 100 }),
  whatsappGroupId: varchar("whatsappGroupId", { length: 100 }),
  lastSentAt: timestamp("lastSentAt"),
  createdBy: integer("createdBy").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CustomMessage = typeof customMessages.$inferSelect;
export type InsertCustomMessage = typeof customMessages.$inferInsert;
