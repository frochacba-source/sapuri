var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// drizzle/schema.ts
import { pgTable, pgEnum, serial, text, timestamp, varchar, boolean, numeric, integer } from "drizzle-orm/pg-core";
var userRoleEnum, memberRoleEnum, backupTypeEnum, gvgSeasonStatusEnum, chatRoleEnum, users, subAdmins, members, eventTypes, schedules, scheduleEntries, announcements, announcementRecipients, gvgAttacks, gvgMatchInfo, gotAttacks, screenshotUploads, nonAttackerAlerts, performanceRecords, botConfig, reliquiasSeasons, reliquiasBossProgress, reliquiasMemberAssignments, reliquiasMemberRoles, reliquiasDamage, gvgSeasons, gotStrategies, gvgStrategies, gotStrategyBackups, gvgStrategyBackups, systemBackups, cards, cardBackups, characters, characterSkills, characterCloth, characterConstellations, characterLinks, aiChatHistory, aiChatSessions, strategyAnalysis, arayashikiSynergies;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["user", "admin", "subadmin"]);
    memberRoleEnum = pgEnum("member_role", ["guards", "boss"]);
    backupTypeEnum = pgEnum("backup_type", ["create", "update", "delete", "manual", "auto"]);
    gvgSeasonStatusEnum = pgEnum("gvg_season_status", ["active", "paused", "ended"]);
    chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: userRoleEnum("role").default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    subAdmins = pgTable("subAdmins", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      username: varchar("username", { length: 50 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      canManageGvg: boolean("canManageGvg").default(false).notNull(),
      canManageGot: boolean("canManageGot").default(false).notNull(),
      canManageReliquias: boolean("canManageReliquias").default(false).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    members = pgTable("members", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    eventTypes = pgTable("eventTypes", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 50 }).notNull().unique(),
      displayName: varchar("displayName", { length: 100 }).notNull(),
      maxPlayers: integer("maxPlayers").notNull(),
      eventTime: varchar("eventTime", { length: 5 }).notNull(),
      reminderMinutes: integer("reminderMinutes").default(30).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    schedules = pgTable("schedules", {
      id: serial("id").primaryKey(),
      eventTypeId: integer("eventTypeId").notNull(),
      eventDate: varchar("eventDate", { length: 10 }).notNull(),
      createdBy: integer("createdBy").notNull(),
      notificationSent: boolean("notificationSent").default(false).notNull(),
      reminderSent: boolean("reminderSent").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    scheduleEntries = pgTable("scheduleEntries", {
      id: serial("id").primaryKey(),
      scheduleId: integer("scheduleId").notNull(),
      memberId: integer("memberId").notNull(),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    announcements = pgTable("announcements", {
      id: serial("id").primaryKey(),
      eventTypeId: integer("eventTypeId"),
      title: varchar("title", { length: 200 }).notNull(),
      message: text("message").notNull(),
      createdBy: integer("createdBy").notNull(),
      sentAt: timestamp("sentAt"),
      isGeneral: boolean("isGeneral").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    announcementRecipients = pgTable("announcementRecipients", {
      id: serial("id").primaryKey(),
      announcementId: integer("announcementId").notNull(),
      memberId: integer("memberId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    gvgAttacks = pgTable("gvgAttacks", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    gvgMatchInfo = pgTable("gvgMatchInfo", {
      id: serial("id").primaryKey(),
      eventDate: varchar("eventDate", { length: 10 }).notNull().unique(),
      opponentGuild: varchar("opponentGuild", { length: 100 }),
      ourScore: integer("ourScore").default(0).notNull(),
      opponentScore: integer("opponentScore").default(0).notNull(),
      validStars: integer("validStars").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    gotAttacks = pgTable("gotAttacks", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    screenshotUploads = pgTable("screenshotUploads", {
      id: serial("id").primaryKey(),
      eventTypeId: integer("eventTypeId").notNull(),
      eventDate: varchar("eventDate", { length: 10 }).notNull(),
      imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
      imageKey: varchar("imageKey", { length: 255 }).notNull(),
      extractedData: text("extractedData"),
      processed: boolean("processed").default(false).notNull(),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    nonAttackerAlerts = pgTable("nonAttackerAlerts", {
      id: serial("id").primaryKey(),
      eventTypeId: integer("eventTypeId").notNull(),
      eventDate: varchar("eventDate", { length: 10 }).notNull(),
      memberId: integer("memberId").notNull(),
      alertSent: boolean("alertSent").default(false).notNull(),
      adminNotified: boolean("adminNotified").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    performanceRecords = pgTable("performanceRecords", {
      id: serial("id").primaryKey(),
      eventTypeId: integer("eventTypeId").notNull(),
      eventDate: varchar("eventDate", { length: 10 }).notNull(),
      memberId: integer("memberId").notNull(),
      attacked: boolean("attacked").default(false).notNull(),
      notes: text("notes"),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    botConfig = pgTable("botConfig", {
      id: serial("id").primaryKey(),
      telegramBotToken: varchar("telegramBotToken", { length: 255 }),
      telegramGroupId: varchar("telegramGroupId", { length: 100 }),
      isActive: boolean("isActive").default(false).notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    reliquiasSeasons = pgTable("reliquiasSeasons", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      startDate: varchar("startDate", { length: 50 }).notNull(),
      endDate: varchar("endDate", { length: 50 }),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    reliquiasBossProgress = pgTable("reliquiasBossProgress", {
      id: serial("id").primaryKey(),
      seasonId: integer("seasonId").notNull(),
      bossId: integer("bossId").notNull(),
      bossName: varchar("bossName", { length: 50 }).notNull(),
      currentHp: integer("currentHp").default(100).notNull(),
      maxHp: integer("maxHp").default(100).notNull(),
      stage: integer("stage").default(1).notNull(),
      isDefeated: boolean("isDefeated").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    reliquiasMemberAssignments = pgTable("reliquiasMemberAssignments", {
      id: serial("id").primaryKey(),
      memberId: integer("memberId").notNull(),
      bossName: varchar("bossName", { length: 50 }).notNull(),
      seasonId: integer("seasonId").notNull(),
      bossId: integer("bossId").notNull(),
      assignedAt: varchar("assignedAt", { length: 50 }),
      unassignedAt: varchar("unassignedAt", { length: 50 }),
      createdAt: varchar("createdAt", { length: 20 }).notNull(),
      updatedAt: varchar("updatedAt", { length: 20 }).notNull(),
      attackNumber: integer("attackNumber").default(1),
      role: memberRoleEnum("role").default("guards"),
      guard1Number: integer("guard1Number"),
      guard2Number: integer("guard2Number"),
      performance: text("performance")
    });
    reliquiasMemberRoles = pgTable("reliquiasMemberRoles", {
      id: serial("id").primaryKey(),
      seasonId: integer("seasonId").notNull(),
      memberId: integer("memberId").notNull(),
      role: memberRoleEnum("role").default("guards").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    reliquiasDamage = pgTable("reliquiasDamage", {
      id: serial("id").primaryKey(),
      seasonId: integer("seasonId").notNull(),
      memberId: integer("memberId").notNull(),
      cumulativeDamage: varchar("cumulativeDamage", { length: 50 }).notNull(),
      damageNumeric: integer("damageNumeric").default(0).notNull(),
      ranking: integer("ranking"),
      power: varchar("power", { length: 20 }),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    gvgSeasons = pgTable("gvgSeasons", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      status: gvgSeasonStatusEnum("status").default("active").notNull(),
      startDate: timestamp("startDate").notNull(),
      endDate: timestamp("endDate").notNull(),
      returnDate: timestamp("returnDate"),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    gotStrategies = pgTable("gotStrategies", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    gvgStrategies = pgTable("gvgStrategies", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    gotStrategyBackups = pgTable("gotStrategyBackups", {
      id: serial("id").primaryKey(),
      strategyId: integer("strategyId").notNull(),
      backupType: backupTypeEnum("backupType").notNull(),
      strategyData: text("strategyData").notNull(),
      backupReason: varchar("backupReason", { length: 255 }),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    gvgStrategyBackups = pgTable("gvgStrategyBackups", {
      id: serial("id").primaryKey(),
      strategyId: integer("strategyId").notNull(),
      backupType: backupTypeEnum("backupType").notNull(),
      strategyData: text("strategyData").notNull(),
      backupReason: varchar("backupReason", { length: 255 }),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    systemBackups = pgTable("systemBackups", {
      id: serial("id").primaryKey(),
      backupName: varchar("backupName", { length: 255 }).notNull(),
      description: text("description"),
      backupData: text("backupData").notNull(),
      backupSize: integer("backupSize").notNull(),
      backupType: backupTypeEnum("backupType").default("manual").notNull(),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    cards = pgTable("cards", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    cardBackups = pgTable("cardBackups", {
      id: serial("id").primaryKey(),
      cardId: integer("cardId").notNull(),
      backupType: backupTypeEnum("backupType").notNull(),
      cardData: text("cardData").notNull(),
      backupReason: varchar("backupReason", { length: 255 }),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    characters = pgTable("characters", {
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
      last_updated: timestamp("last_updated").defaultNow()
    });
    characterSkills = pgTable("characterSkills", {
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
      cosmos_gain_dmg: integer("cosmos_gain_dmg")
    });
    characterCloth = pgTable("characterCloth", {
      id: serial("id").primaryKey(),
      character_id: integer("character_id").notNull(),
      level: integer("level"),
      description: text("description"),
      hp_boost: numeric("hp_boost", { precision: 5, scale: 2 }),
      atk_boost: numeric("atk_boost", { precision: 5, scale: 2 }),
      def_boost: numeric("def_boost", { precision: 5, scale: 2 }),
      haste: integer("haste")
    });
    characterConstellations = pgTable("characterConstellations", {
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
      hit: integer("hit")
    });
    characterLinks = pgTable("characterLinks", {
      id: serial("id").primaryKey(),
      character_id: integer("character_id").notNull(),
      link_name: varchar("link_name", { length: 100 }),
      description: text("description"),
      level: integer("level")
    });
    aiChatHistory = pgTable("aiChatHistory", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      role: chatRoleEnum("role").notNull(),
      message: text("message").notNull(),
      context: varchar("context", { length: 100 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    aiChatSessions = pgTable("aiChatSessions", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      title: varchar("title", { length: 255 }),
      context: varchar("context", { length: 100 }),
      messageCount: integer("messageCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    strategyAnalysis = pgTable("strategyAnalysis", {
      id: serial("id").primaryKey(),
      strategyId: integer("strategyId").notNull(),
      analysis: text("analysis").notNull(),
      suggestions: text("suggestions"),
      strengths: text("strengths"),
      weaknesses: text("weaknesses"),
      rating: numeric("rating", { precision: 3, scale: 2 }),
      analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    arayashikiSynergies = pgTable("arayashiki_synergies", {
      id: serial("id").primaryKey(),
      character1: varchar("character1", { length: 100 }).notNull(),
      character2: varchar("character2", { length: 100 }).notNull(),
      synergyType: varchar("synergyType", { length: 50 }),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addAnnouncementRecipient: () => addAnnouncementRecipient,
  addScheduleEntry: () => addScheduleEntry,
  bulkUpsertGotAttacks: () => bulkUpsertGotAttacks,
  bulkUpsertGvgAttacks: () => bulkUpsertGvgAttacks,
  createAnnouncement: () => createAnnouncement,
  createArayashiki: () => createArayashiki,
  createArayashikiSynergy: () => createArayashikiSynergy,
  createCard: () => createCard,
  createCardBackup: () => createCardBackup,
  createCharacter: () => createCharacter,
  createCharacterCloth: () => createCharacterCloth,
  createCharacterConstellation: () => createCharacterConstellation,
  createCharacterLink: () => createCharacterLink,
  createCharacterSkill: () => createCharacterSkill,
  createEventType: () => createEventType,
  createGeneralAnnouncement: () => createGeneralAnnouncement,
  createGotStrategy: () => createGotStrategy,
  createGvgSeason: () => createGvgSeason,
  createGvgStrategy: () => createGvgStrategy,
  createMember: () => createMember,
  createNonAttackerAlert: () => createNonAttackerAlert,
  createPerformanceRecord: () => createPerformanceRecord,
  createReliquiasSeason: () => createReliquiasSeason,
  createSchedule: () => createSchedule,
  createScreenshotUpload: () => createScreenshotUpload,
  createSubAdmin: () => createSubAdmin,
  defeatBoss: () => defeatBoss,
  defeatGuard: () => defeatGuard,
  deleteArayashiki: () => deleteArayashiki,
  deleteCard: () => deleteCard,
  deleteCharacter: () => deleteCharacter,
  deleteGotStrategy: () => deleteGotStrategy,
  deleteGvgStrategy: () => deleteGvgStrategy,
  deleteMember: () => deleteMember,
  deletePerformanceByEventAndDate: () => deletePerformanceByEventAndDate,
  deleteReliquiasMemberAssignment: () => deleteReliquiasMemberAssignment,
  deleteSubAdmin: () => deleteSubAdmin,
  endCurrentSeasonAndStartNew: () => endCurrentSeasonAndStartNew,
  endReliquiasSeason: () => endReliquiasSeason,
  exportCardsAsJson: () => exportCardsAsJson,
  exportCharactersToJson: () => exportCharactersToJson,
  getActiveMembers: () => getActiveMembers,
  getActiveReliquiasSeason: () => getActiveReliquiasSeason,
  getActiveSeason: () => getActiveSeason,
  getAllArayashikis: () => getAllArayashikis,
  getAllCards: () => getAllCards,
  getAllCharacters: () => getAllCharacters,
  getAllEventTypes: () => getAllEventTypes,
  getAllGotStrategies: () => getAllGotStrategies,
  getAllGvgStrategies: () => getAllGvgStrategies,
  getAllMembers: () => getAllMembers,
  getAllReliquiasMemberAssignmentsForSeason: () => getAllReliquiasMemberAssignmentsForSeason,
  getAllReliquiasSeasons: () => getAllReliquiasSeasons,
  getAllSeasons: () => getAllSeasons,
  getAllSubAdmins: () => getAllSubAdmins,
  getAnnouncementRecipients: () => getAnnouncementRecipients,
  getAnnouncementsByEvent: () => getAnnouncementsByEvent,
  getArayashikiById: () => getArayashikiById,
  getArayashikiByName: () => getArayashikiByName,
  getArayashikiSynergies: () => getArayashikiSynergies,
  getArayashikisByAttribute: () => getArayashikisByAttribute,
  getArayashikisByQuality: () => getArayashikisByQuality,
  getBossProgressBySeason: () => getBossProgressBySeason,
  getBotConfig: () => getBotConfig,
  getCardById: () => getCardById,
  getCharacterById: () => getCharacterById,
  getCharacterByName: () => getCharacterByName,
  getCharacterCloth: () => getCharacterCloth,
  getCharacterConstellations: () => getCharacterConstellations,
  getCharacterLinks: () => getCharacterLinks,
  getCharacterSkills: () => getCharacterSkills,
  getCharactersByClass: () => getCharactersByClass,
  getCharactersByType: () => getCharactersByType,
  getCurrentBoss: () => getCurrentBoss,
  getDamageRankingBySeason: () => getDamageRankingBySeason,
  getDb: () => getDb,
  getEntriesBySchedule: () => getEntriesBySchedule,
  getEventTypeById: () => getEventTypeById,
  getEventTypeByName: () => getEventTypeByName,
  getGeneralAnnouncements: () => getGeneralAnnouncements,
  getGotAttacksByDate: () => getGotAttacksByDate,
  getGotAttacksBySchedule: () => getGotAttacksBySchedule,
  getGotLowPerformersLatest: () => getGotLowPerformersLatest,
  getGotNonAttackers: () => getGotNonAttackers,
  getGotNonAttackersHistory: () => getGotNonAttackersHistory,
  getGotNonAttackersLatest: () => getGotNonAttackersLatest,
  getGotPerformanceMetrics: () => getGotPerformanceMetrics,
  getGotPreviousPoints: () => getGotPreviousPoints,
  getGotRanking: () => getGotRanking,
  getGotRankingLatest: () => getGotRankingLatest,
  getGotStrategiesByAttackFormation: () => getGotStrategiesByAttackFormation,
  getGotStrategiesByDefenseFormation: () => getGotStrategiesByDefenseFormation,
  getGotStrategiesByName: () => getGotStrategiesByName,
  getGotStrategyById: () => getGotStrategyById,
  getGvgAttacksByDate: () => getGvgAttacksByDate,
  getGvgAttacksBySchedule: () => getGvgAttacksBySchedule,
  getGvgEvolutionData: () => getGvgEvolutionData,
  getGvgMatchHistory: () => getGvgMatchHistory,
  getGvgMatchInfo: () => getGvgMatchInfo,
  getGvgNonAttackers: () => getGvgNonAttackers,
  getGvgRanking: () => getGvgRanking,
  getGvgStrategiesByAttackFormation: () => getGvgStrategiesByAttackFormation,
  getGvgStrategiesByDefenseFormation: () => getGvgStrategiesByDefenseFormation,
  getGvgStrategyById: () => getGvgStrategyById,
  getMemberById: () => getMemberById,
  getMemberCount: () => getMemberCount,
  getMemberFullStats: () => getMemberFullStats,
  getMemberGotHistory: () => getMemberGotHistory,
  getMemberGvgHistory: () => getMemberGvgHistory,
  getMemberPerformanceStats: () => getMemberPerformanceStats,
  getMemberReliquiasHistory: () => getMemberReliquiasHistory,
  getMemberRolesBySeason: () => getMemberRolesBySeason,
  getMemberStats: () => getMemberStats,
  getMembersByEvent: () => getMembersByEvent,
  getMembersWithTelegramChatId: () => getMembersWithTelegramChatId,
  getNonAttackerAlerts: () => getNonAttackerAlerts,
  getPerformanceByEventAndDate: () => getPerformanceByEventAndDate,
  getReliquiasMemberAssignments: () => getReliquiasMemberAssignments,
  getReliquiasRanking: () => getReliquiasRanking,
  getScheduleByEventAndDate: () => getScheduleByEventAndDate,
  getScheduleHistory: () => getScheduleHistory,
  getScheduleWithEntries: () => getScheduleWithEntries,
  getScreenshotsByEventAndDate: () => getScreenshotsByEventAndDate,
  getSubAdminById: () => getSubAdminById,
  getSubAdminByUsername: () => getSubAdminByUsername,
  getTelegramConfig: () => getTelegramConfig,
  getUserByOpenId: () => getUserByOpenId,
  importCardsFromJson: () => importCardsFromJson,
  importCharactersFromJson: () => importCharactersFromJson,
  removeScheduleEntries: () => removeScheduleEntries,
  saveGvgMatchInfo: () => saveGvgMatchInfo,
  searchArayashikis: () => searchArayashikis,
  searchCards: () => searchCards,
  searchCharacters: () => searchCharacters,
  searchCharactersInGotStrategies: () => searchCharactersInGotStrategies,
  searchCharactersInGvgStrategies: () => searchCharactersInGvgStrategies,
  searchGotStrategies: () => searchGotStrategies,
  searchGotStrategiesByKeyword: () => searchGotStrategiesByKeyword,
  searchGotStrategiesByMultipleNames: () => searchGotStrategiesByMultipleNames,
  searchGotStrategiesByMultipleNamesInAttack: () => searchGotStrategiesByMultipleNamesInAttack,
  searchGotStrategiesByMultipleNamesInDefense: () => searchGotStrategiesByMultipleNamesInDefense,
  searchGvgDefenseTips: () => searchGvgDefenseTips,
  searchGvgDefenseTipsByKeyword: () => searchGvgDefenseTipsByKeyword,
  searchGvgStrategies: () => searchGvgStrategies,
  searchGvgStrategiesByKeyword: () => searchGvgStrategiesByKeyword,
  searchGvgStrategiesByKeywordInAttack: () => searchGvgStrategiesByKeywordInAttack,
  searchGvgStrategiesByKeywordInDefense: () => searchGvgStrategiesByKeywordInDefense,
  searchGvgStrategiesByMultipleNamesInAttack: () => searchGvgStrategiesByMultipleNamesInAttack,
  searchGvgStrategiesByMultipleNamesInDefense: () => searchGvgStrategiesByMultipleNamesInDefense,
  searchMembersByNamePart: () => searchMembersByNamePart,
  seedDefaultEventTypes: () => seedDefaultEventTypes,
  setMemberRole: () => setMemberRole,
  updateAnnouncementSentAt: () => updateAnnouncementSentAt,
  updateArayashiki: () => updateArayashiki,
  updateBossProgress: () => updateBossProgress,
  updateCard: () => updateCard,
  updateCharacter: () => updateCharacter,
  updateEventType: () => updateEventType,
  updateGotStrategy: () => updateGotStrategy,
  updateGvgStrategy: () => updateGvgStrategy,
  updateMember: () => updateMember,
  updateMemberTelegramChatId: () => updateMemberTelegramChatId,
  updateNonAttackerAlertStatus: () => updateNonAttackerAlertStatus,
  updateSchedule: () => updateSchedule,
  updateScreenshotUpload: () => updateScreenshotUpload,
  updateSeasonStatus: () => updateSeasonStatus,
  updateSubAdmin: () => updateSubAdmin,
  upsertBotConfig: () => upsertBotConfig,
  upsertCharacter: () => upsertCharacter,
  upsertGotAttack: () => upsertGotAttack,
  upsertGvgAttack: () => upsertGvgAttack,
  upsertMemberDamage: () => upsertMemberDamage,
  upsertReliquiasMemberAssignment: () => upsertReliquiasMemberAssignment,
  upsertUser: () => upsertUser
});
import { eq, and, desc, gte, lte, lt, like, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllSubAdmins() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: subAdmins.id,
    name: subAdmins.name,
    username: subAdmins.username,
    canManageGvg: subAdmins.canManageGvg,
    canManageGot: subAdmins.canManageGot,
    canManageReliquias: subAdmins.canManageReliquias,
    isActive: subAdmins.isActive,
    createdAt: subAdmins.createdAt
  }).from(subAdmins).orderBy(subAdmins.name);
}
async function getSubAdminById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(subAdmins).where(eq(subAdmins.id, id)).limit(1);
  return result[0];
}
async function getSubAdminByUsername(username) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(subAdmins).where(eq(subAdmins.username, username)).limit(1);
  return result[0];
}
async function createSubAdmin(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subAdmins).values(data).returning({ id: true });
}
async function updateSubAdmin(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subAdmins).set(data).where(eq(subAdmins.id, id));
}
async function deleteSubAdmin(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(subAdmins).where(eq(subAdmins.id, id));
}
async function getAllMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(members.name);
}
async function getActiveMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).where(eq(members.isActive, true)).orderBy(members.name);
}
async function getMembersByEvent(eventName) {
  const db = await getDb();
  if (!db) return [];
  let condition;
  switch (eventName) {
    case "gvg":
      condition = and(eq(members.isActive, true), eq(members.participatesGvg, true));
      break;
    case "got":
      condition = and(eq(members.isActive, true), eq(members.participatesGot, true));
      break;
    case "reliquias":
      condition = and(eq(members.isActive, true), eq(members.participatesReliquias, true));
      break;
    default:
      condition = eq(members.isActive, true);
  }
  return db.select().from(members).where(condition).orderBy(members.name);
}
async function getMemberById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}
async function createMember(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(members).values(data).returning({ id: true });
}
async function updateMember(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set(data).where(eq(members.id, id));
}
async function deleteMember(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(members).where(eq(members.id, id));
}
async function getMemberCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(members);
  return result[0]?.count ?? 0;
}
async function getAllEventTypes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventTypes).orderBy(eventTypes.name);
}
async function getEventTypeById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(eventTypes).where(eq(eventTypes.id, id)).limit(1);
  return result[0];
}
async function getEventTypeByName(name) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(eventTypes).where(eq(eventTypes.name, name)).limit(1);
  return result[0];
}
async function createEventType(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eventTypes).values(data).returning({ id: true });
}
async function updateEventType(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventTypes).set(data).where(eq(eventTypes.id, id));
}
async function seedDefaultEventTypes() {
  const db = await getDb();
  if (!db) return;
  const existing = await getAllEventTypes();
  if (existing.length > 0) return;
  const defaultEvents = [
    { name: "gvg", displayName: "GvG", maxPlayers: 20, eventTime: "13:00", reminderMinutes: 30 },
    { name: "got", displayName: "GoT", maxPlayers: 25, eventTime: "13:00", reminderMinutes: 30 },
    { name: "reliquias", displayName: "Rel\xEDquias", maxPlayers: 40, eventTime: "15:00", reminderMinutes: 30 }
  ];
  for (const event of defaultEvents) {
    await db.insert(eventTypes).values(event);
  }
}
async function getScheduleByEventAndDate(eventTypeId, eventDate) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schedules).where(and(
    eq(schedules.eventTypeId, eventTypeId),
    eq(schedules.eventDate, eventDate)
  )).orderBy(desc(schedules.createdAt)).limit(1);
  return result[0] || null;
}
async function createSchedule(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schedules).values(data).returning({ id: true });
  return result[0]?.id;
}
async function updateSchedule(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(schedules).set(data).where(eq(schedules.id, id));
}
async function getScheduleWithEntries(scheduleId) {
  const db = await getDb();
  if (!db) return { schedule: void 0, entries: [] };
  const schedule2 = await db.select().from(schedules).where(eq(schedules.id, scheduleId)).limit(1);
  if (!schedule2[0]) return { schedule: void 0, entries: [] };
  const entries = await db.select({
    entry: scheduleEntries,
    member: members
  }).from(scheduleEntries).innerJoin(members, eq(scheduleEntries.memberId, members.id)).where(eq(scheduleEntries.scheduleId, scheduleId)).orderBy(scheduleEntries.order, scheduleEntries.createdAt);
  return { schedule: schedule2[0], entries };
}
async function getScheduleHistory(eventTypeId, startDate, endDate, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select({
    schedule: schedules,
    eventType: eventTypes
  }).from(schedules).innerJoin(eventTypes, eq(schedules.eventTypeId, eventTypes.id)).orderBy(desc(schedules.eventDate)).limit(limit);
  const conditions = [];
  if (eventTypeId) {
    conditions.push(eq(schedules.eventTypeId, eventTypeId));
  }
  if (startDate) {
    conditions.push(gte(schedules.eventDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(schedules.eventDate, endDate));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  return query;
}
async function addScheduleEntry(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(scheduleEntries).values(data).returning({ id: true });
}
async function removeScheduleEntries(scheduleId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(scheduleEntries).where(eq(scheduleEntries.scheduleId, scheduleId));
}
async function getEntriesBySchedule(scheduleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    entry: scheduleEntries,
    member: members
  }).from(scheduleEntries).innerJoin(members, eq(scheduleEntries.memberId, members.id)).where(eq(scheduleEntries.scheduleId, scheduleId)).orderBy(scheduleEntries.order, scheduleEntries.createdAt);
}
async function createAnnouncement(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values(data).returning({ id: true });
  return result[0]?.id;
}
async function addAnnouncementRecipient(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(announcementRecipients).values(data).returning({ id: true });
}
async function getAnnouncementsByEvent(eventTypeId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).where(eq(announcements.eventTypeId, eventTypeId)).orderBy(desc(announcements.createdAt)).limit(limit);
}
async function getAnnouncementRecipients(announcementId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    recipient: announcementRecipients,
    member: members
  }).from(announcementRecipients).innerJoin(members, eq(announcementRecipients.memberId, members.id)).where(eq(announcementRecipients.announcementId, announcementId));
}
async function updateAnnouncementSentAt(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(announcements).set({ sentAt: /* @__PURE__ */ new Date() }).where(eq(announcements.id, id));
}
async function createPerformanceRecord(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(performanceRecords).values(data).returning({ id: true });
}
async function getPerformanceByEventAndDate(eventTypeId, eventDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    record: performanceRecords,
    member: members
  }).from(performanceRecords).innerJoin(members, eq(performanceRecords.memberId, members.id)).where(and(
    eq(performanceRecords.eventTypeId, eventTypeId),
    eq(performanceRecords.eventDate, eventDate)
  ));
}
async function deletePerformanceByEventAndDate(eventTypeId, eventDate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(performanceRecords).where(and(
    eq(performanceRecords.eventTypeId, eventTypeId),
    eq(performanceRecords.eventDate, eventDate)
  ));
}
async function getMemberPerformanceStats(memberId, eventTypeId) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (memberId) {
    conditions.push(eq(performanceRecords.memberId, memberId));
  }
  if (eventTypeId) {
    conditions.push(eq(performanceRecords.eventTypeId, eventTypeId));
  }
  let query = db.select({
    memberId: members.id,
    memberName: members.name,
    totalEvents: sql`count(*)`,
    attacked: sql`sum(case when ${performanceRecords.attacked} = true then 1 else 0 end)`,
    notAttacked: sql`sum(case when ${performanceRecords.attacked} = false then 1 else 0 end)`
  }).from(performanceRecords).innerJoin(members, eq(performanceRecords.memberId, members.id)).groupBy(members.id, members.name);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  return query;
}
async function getMemberStats(memberId, eventTypeId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (memberId) {
    conditions.push(eq(scheduleEntries.memberId, memberId));
  }
  if (eventTypeId) {
    conditions.push(eq(schedules.eventTypeId, eventTypeId));
  }
  if (startDate) {
    conditions.push(gte(schedules.eventDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(schedules.eventDate, endDate));
  }
  let query = db.select({
    memberId: members.id,
    memberName: members.name,
    eventTypeId: eventTypes.id,
    eventName: eventTypes.displayName,
    count: sql`count(*)`
  }).from(scheduleEntries).innerJoin(members, eq(scheduleEntries.memberId, members.id)).innerJoin(schedules, eq(scheduleEntries.scheduleId, schedules.id)).innerJoin(eventTypes, eq(schedules.eventTypeId, eventTypes.id)).groupBy(members.id, members.name, eventTypes.id, eventTypes.displayName);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  return query;
}
async function getBotConfig() {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(botConfig).limit(1);
  return result[0];
}
async function upsertBotConfig(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getBotConfig();
  if (existing) {
    await db.update(botConfig).set(data).where(eq(botConfig.id, existing.id));
  } else {
    await db.insert(botConfig).values(data);
  }
}
async function getGvgAttacksBySchedule(scheduleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gvgAttacks,
    member: members
  }).from(gvgAttacks).innerJoin(members, eq(gvgAttacks.memberId, members.id)).where(eq(gvgAttacks.scheduleId, scheduleId)).orderBy(members.name);
}
async function getGvgAttacksByDate(eventDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gvgAttacks,
    member: members
  }).from(gvgAttacks).innerJoin(members, eq(gvgAttacks.memberId, members.id)).where(eq(gvgAttacks.eventDate, eventDate)).orderBy(members.name);
}
async function upsertGvgAttack(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(gvgAttacks).where(and(
    eq(gvgAttacks.scheduleId, data.scheduleId),
    eq(gvgAttacks.memberId, data.memberId)
  )).limit(1);
  if (existing[0]) {
    await db.update(gvgAttacks).set(data).where(eq(gvgAttacks.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(gvgAttacks).values(data).returning({ id: true });
    return result[0]?.id;
  }
}
async function bulkUpsertGvgAttacks(attacks) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const attack of attacks) {
    await upsertGvgAttack(attack);
  }
}
async function getGvgNonAttackers(scheduleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gvgAttacks,
    member: members
  }).from(gvgAttacks).innerJoin(members, eq(gvgAttacks.memberId, members.id)).where(and(
    eq(gvgAttacks.scheduleId, scheduleId),
    eq(gvgAttacks.didNotAttack, true)
  ));
}
async function getGotAttacksBySchedule(scheduleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gotAttacks,
    member: members
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).where(eq(gotAttacks.scheduleId, scheduleId)).orderBy(desc(gotAttacks.points));
}
async function getGotAttacksByDate(eventDate) {
  const db = await getDb();
  if (!db) return [];
  const attacks = await db.select({
    attack: gotAttacks,
    member: members
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).where(eq(gotAttacks.eventDate, eventDate)).orderBy(desc(gotAttacks.points));
  const enrichedAttacks = await Promise.all(
    attacks.map(async (a) => {
      const previousAttack = await db.select().from(gotAttacks).where(and(
        eq(gotAttacks.memberId, a.attack.memberId),
        lt(gotAttacks.eventDate, eventDate)
      )).orderBy(desc(gotAttacks.eventDate)).limit(1);
      const previousPoints = previousAttack[0]?.points || 0;
      const pointsDifference = (a.attack.points || 0) - previousPoints;
      return {
        ...a,
        attack: {
          ...a.attack,
          previousPoints,
          pointsDifference
        }
      };
    })
  );
  return enrichedAttacks;
}
async function upsertGotAttack(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(gotAttacks).where(and(
    eq(gotAttacks.scheduleId, data.scheduleId),
    eq(gotAttacks.memberId, data.memberId)
  )).limit(1);
  if (existing[0]) {
    await db.update(gotAttacks).set(data).where(eq(gotAttacks.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(gotAttacks).values(data).returning({ id: true });
    return result[0]?.id;
  }
}
async function bulkUpsertGotAttacks(attacks) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const attack of attacks) {
    await upsertGotAttack(attack);
  }
}
async function getGotNonAttackers(scheduleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gotAttacks,
    member: members
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).where(and(
    eq(gotAttacks.scheduleId, scheduleId),
    eq(gotAttacks.didNotAttack, true)
  ));
}
async function createScreenshotUpload(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(screenshotUploads).values(data).returning({ id: true });
  return result[0]?.id;
}
async function updateScreenshotUpload(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(screenshotUploads).set(data).where(eq(screenshotUploads.id, id));
}
async function getScreenshotsByEventAndDate(eventTypeId, eventDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(screenshotUploads).where(and(
    eq(screenshotUploads.eventTypeId, eventTypeId),
    eq(screenshotUploads.eventDate, eventDate)
  )).orderBy(desc(screenshotUploads.createdAt));
}
async function createNonAttackerAlert(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(nonAttackerAlerts).values(data).returning({ id: true });
}
async function getNonAttackerAlerts(eventTypeId, eventDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    alert: nonAttackerAlerts,
    member: members
  }).from(nonAttackerAlerts).innerJoin(members, eq(nonAttackerAlerts.memberId, members.id)).where(and(
    eq(nonAttackerAlerts.eventTypeId, eventTypeId),
    eq(nonAttackerAlerts.eventDate, eventDate)
  ));
}
async function updateNonAttackerAlertStatus(id, alertSent, adminNotified) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(nonAttackerAlerts).set({ alertSent, adminNotified }).where(eq(nonAttackerAlerts.id, id));
}
async function createGeneralAnnouncement(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values({
    ...data,
    eventTypeId: null,
    isGeneral: true
  });
  return result[0]?.id;
}
async function getGeneralAnnouncements(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).where(eq(announcements.isGeneral, true)).orderBy(desc(announcements.createdAt)).limit(limit);
}
async function updateMemberTelegramChatId(memberId, chatId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set({ telegramChatId: chatId }).where(eq(members.id, memberId));
}
async function getMembersWithTelegramChatId() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).where(and(
    eq(members.isActive, true),
    sql`${members.telegramChatId} IS NOT NULL`
  ));
}
async function getActiveReliquiasSeason() {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(reliquiasSeasons).where(eq(reliquiasSeasons.isActive, true)).limit(1);
  return result[0];
}
async function getAllReliquiasSeasons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reliquiasSeasons).orderBy(desc(reliquiasSeasons.startDate));
}
async function createReliquiasSeason(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reliquiasSeasons).set({ isActive: false }).where(eq(reliquiasSeasons.isActive, true));
  const result = await db.insert(reliquiasSeasons).values(data).returning({ id: true });
  const seasonId = result[0]?.id;
  const bosses = [
    { seasonId, bossName: "Orfeu", bossOrder: 1, guardsRequired: 5, bossMaxDefeats: 1 },
    { seasonId, bossName: "Radamantis", bossOrder: 2, guardsRequired: 10, bossMaxDefeats: 1 },
    { seasonId, bossName: "Pandora", bossOrder: 3, guardsRequired: 15, bossMaxDefeats: 1 },
    { seasonId, bossName: "G\xEAmeos", bossOrder: 4, guardsRequired: 20, bossMaxDefeats: 3 }
  ];
  const maxBossIdResult = await db.select({ maxId: sql`MAX(id)` }).from(reliquiasBossProgress);
  let nextBossId = (maxBossIdResult[0]?.maxId || 0) + 1;
  const now = Date.now();
  for (const boss of bosses) {
    await db.insert(reliquiasBossProgress).values({
      id: nextBossId++,
      ...boss,
      guardsDefeated: 0,
      bossDefeatedCount: 0,
      isCompleted: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    });
  }
  return seasonId;
}
async function endReliquiasSeason(seasonId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  await db.update(reliquiasSeasons).set({ isActive: false, endDate: today }).where(eq(reliquiasSeasons.id, seasonId));
}
async function getBossProgressBySeason(seasonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reliquiasBossProgress).where(eq(reliquiasBossProgress.seasonId, seasonId)).orderBy(reliquiasBossProgress.bossOrder);
}
async function getCurrentBoss(seasonId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(reliquiasBossProgress).where(and(
    eq(reliquiasBossProgress.seasonId, seasonId),
    eq(reliquiasBossProgress.isCompleted, false)
  )).orderBy(reliquiasBossProgress.bossOrder).limit(1);
  return result[0];
}
async function updateBossProgress(bossId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reliquiasBossProgress).set(data).where(eq(reliquiasBossProgress.id, bossId));
}
async function defeatGuard(bossId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const boss = await db.select().from(reliquiasBossProgress).where(eq(reliquiasBossProgress.id, bossId)).limit(1);
  if (!boss[0]) return;
  const newGuardsDefeated = boss[0].guardsDefeated + 1;
  await db.update(reliquiasBossProgress).set({ guardsDefeated: newGuardsDefeated }).where(eq(reliquiasBossProgress.id, bossId));
}
async function defeatBoss(bossId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const boss = await db.select().from(reliquiasBossProgress).where(eq(reliquiasBossProgress.id, bossId)).limit(1);
  if (!boss[0]) return;
  const newDefeatedCount = boss[0].bossDefeatedCount + 1;
  const isCompleted = newDefeatedCount >= boss[0].bossMaxDefeats;
  await db.update(reliquiasBossProgress).set({
    bossDefeatedCount: newDefeatedCount,
    isCompleted,
    completedAt: isCompleted ? /* @__PURE__ */ new Date() : null
  }).where(eq(reliquiasBossProgress.id, bossId));
}
async function getMemberRolesBySeason(seasonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    role: reliquiasMemberRoles,
    member: members
  }).from(reliquiasMemberRoles).innerJoin(members, eq(reliquiasMemberRoles.memberId, members.id)).where(eq(reliquiasMemberRoles.seasonId, seasonId));
}
async function setMemberRole(seasonId, memberId, role) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(reliquiasMemberRoles).where(and(
    eq(reliquiasMemberRoles.seasonId, seasonId),
    eq(reliquiasMemberRoles.memberId, memberId)
  )).limit(1);
  if (existing[0]) {
    await db.update(reliquiasMemberRoles).set({ role }).where(eq(reliquiasMemberRoles.id, existing[0].id));
  } else {
    await db.insert(reliquiasMemberRoles).values({ seasonId, memberId, role });
  }
}
async function getDamageRankingBySeason(seasonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    damage: reliquiasDamage,
    member: members
  }).from(reliquiasDamage).innerJoin(members, eq(reliquiasDamage.memberId, members.id)).where(eq(reliquiasDamage.seasonId, seasonId)).orderBy(desc(reliquiasDamage.damageNumeric));
}
async function upsertMemberDamage(seasonId, memberId, cumulativeDamage, damageNumeric, ranking, power) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(reliquiasDamage).where(and(
    eq(reliquiasDamage.seasonId, seasonId),
    eq(reliquiasDamage.memberId, memberId)
  )).limit(1);
  if (existing[0]) {
    await db.update(reliquiasDamage).set({ cumulativeDamage, damageNumeric, ranking, power }).where(eq(reliquiasDamage.id, existing[0].id));
  } else {
    await db.insert(reliquiasDamage).values({
      seasonId,
      memberId,
      cumulativeDamage,
      damageNumeric,
      ranking,
      power
    });
  }
}
async function getGvgRanking(startDate, endDate, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  let conditions = [];
  if (startDate) {
    conditions.push(gte(gvgAttacks.eventDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(gvgAttacks.eventDate, endDate));
  }
  const result = await db.select({
    memberId: gvgAttacks.memberId,
    memberName: members.name,
    totalStars: sql`SUM(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars})`,
    totalAttacks: sql`COUNT(*)`,
    avgStars: sql`AVG(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars})`
  }).from(gvgAttacks).innerJoin(members, eq(gvgAttacks.memberId, members.id)).where(conditions.length > 0 ? and(...conditions) : void 0).groupBy(gvgAttacks.memberId, members.name).orderBy(desc(sql`SUM(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars})`)).limit(limit);
  return result;
}
async function getGotRanking(startDate, endDate, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  let conditions = [];
  if (startDate) {
    conditions.push(gte(gotAttacks.eventDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(gotAttacks.eventDate, endDate));
  }
  const result = await db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    totalPoints: sql`SUM(${gotAttacks.points})`,
    totalAttackVictories: sql`SUM(${gotAttacks.attackVictories})`,
    totalAttackDefeats: sql`SUM(${gotAttacks.attackDefeats})`,
    totalDefenseVictories: sql`SUM(${gotAttacks.defenseVictories})`,
    totalDefenseDefeats: sql`SUM(${gotAttacks.defenseDefeats})`,
    totalBattles: sql`COUNT(*)`
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).where(conditions.length > 0 ? and(...conditions) : void 0).groupBy(gotAttacks.memberId, members.name).orderBy(desc(sql`SUM(${gotAttacks.points})`)).limit(limit);
  return result;
}
async function getMemberGvgHistory(memberId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gvgAttacks).where(eq(gvgAttacks.memberId, memberId)).orderBy(desc(gvgAttacks.eventDate)).limit(limit);
}
async function getMemberGotHistory(memberId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gotAttacks).where(eq(gotAttacks.memberId, memberId)).orderBy(desc(gotAttacks.eventDate)).limit(limit);
}
async function getMemberReliquiasHistory(memberId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    damage: reliquiasDamage,
    season: reliquiasSeasons
  }).from(reliquiasDamage).innerJoin(reliquiasSeasons, eq(reliquiasDamage.seasonId, reliquiasSeasons.id)).where(eq(reliquiasDamage.memberId, memberId)).orderBy(desc(reliquiasSeasons.startDate));
}
async function getMemberFullStats(memberId) {
  const db = await getDb();
  if (!db) return null;
  const gvgStats = await db.select({
    totalStars: sql`COALESCE(SUM(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars}), 0)`,
    totalBattles: sql`COUNT(*)`,
    avgStars: sql`COALESCE(AVG(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars}), 0)`
  }).from(gvgAttacks).where(eq(gvgAttacks.memberId, memberId));
  const gotStats = await db.select({
    totalPoints: sql`COALESCE(SUM(${gotAttacks.points}), 0)`,
    totalBattles: sql`COUNT(*)`,
    totalAttackVictories: sql`COALESCE(SUM(${gotAttacks.attackVictories}), 0)`,
    totalDefenseVictories: sql`COALESCE(SUM(${gotAttacks.defenseVictories}), 0)`
  }).from(gotAttacks).where(eq(gotAttacks.memberId, memberId));
  const reliquiasStats = await db.select({
    totalDamage: sql`COALESCE(SUM(${reliquiasDamage.damageNumeric}), 0)`,
    seasonsParticipated: sql`COUNT(DISTINCT ${reliquiasDamage.seasonId})`
  }).from(reliquiasDamage).where(eq(reliquiasDamage.memberId, memberId));
  return {
    gvg: gvgStats[0] || { totalStars: 0, totalBattles: 0, avgStars: 0 },
    got: gotStats[0] || { totalPoints: 0, totalBattles: 0, totalAttackVictories: 0, totalDefenseVictories: 0 },
    reliquias: reliquiasStats[0] || { totalDamage: 0, seasonsParticipated: 0 }
  };
}
async function getReliquiasMemberAssignments(seasonId, bossName, attackNumber = 1) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    assignment: reliquiasMemberAssignments,
    member: members
  }).from(reliquiasMemberAssignments).innerJoin(members, eq(reliquiasMemberAssignments.memberId, members.id)).where(and(
    eq(reliquiasMemberAssignments.seasonId, seasonId),
    eq(reliquiasMemberAssignments.bossName, bossName),
    eq(reliquiasMemberAssignments.attackNumber, attackNumber)
  )).orderBy(members.name);
}
async function upsertReliquiasMemberAssignment(data) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(reliquiasMemberAssignments).where(and(
    eq(reliquiasMemberAssignments.seasonId, data.seasonId),
    eq(reliquiasMemberAssignments.memberId, data.memberId),
    eq(reliquiasMemberAssignments.bossName, data.bossName),
    eq(reliquiasMemberAssignments.attackNumber, data.attackNumber || 1)
  )).limit(1);
  if (existing.length > 0) {
    await db.update(reliquiasMemberAssignments).set({
      role: data.role,
      guard1Number: data.guard1Number,
      guard2Number: data.guard2Number,
      performance: data.performance
    }).where(eq(reliquiasMemberAssignments.id, existing[0].id));
    return existing[0].id;
  } else {
    let newId = Math.floor(Math.random() * 1e6) + 1e4;
    let attempts = 0;
    while (attempts < 5) {
      const existing2 = await db.select().from(reliquiasMemberAssignments).where(eq(reliquiasMemberAssignments.id, newId)).limit(1);
      if (existing2.length === 0) {
        break;
      }
      newId = Math.floor(Math.random() * 1e6) + 1e4;
      attempts++;
    }
    if (attempts >= 5) {
      throw new Error("Failed to generate unique ID for reliquiasMemberAssignments");
    }
    const performance = data.performance ?? 0;
    const now = Date.now();
    await db.insert(reliquiasMemberAssignments).values({
      id: newId,
      seasonId: data.seasonId,
      memberId: data.memberId,
      bossName: data.bossName,
      attackNumber: data.attackNumber || 1,
      role: data.role,
      guard1Number: data.guard1Number ?? 0,
      guard2Number: data.guard2Number ?? 0,
      performance,
      createdAt: now,
      updatedAt: now
    });
    return newId;
  }
}
async function deleteReliquiasMemberAssignment(seasonId, memberId, bossName, attackNumber = 1) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reliquiasMemberAssignments).where(and(
    eq(reliquiasMemberAssignments.seasonId, seasonId),
    eq(reliquiasMemberAssignments.memberId, memberId),
    eq(reliquiasMemberAssignments.bossName, bossName),
    eq(reliquiasMemberAssignments.attackNumber, attackNumber)
  ));
}
async function getAllReliquiasMemberAssignmentsForSeason(seasonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    assignment: reliquiasMemberAssignments,
    member: members
  }).from(reliquiasMemberAssignments).innerJoin(members, eq(reliquiasMemberAssignments.memberId, members.id)).where(eq(reliquiasMemberAssignments.seasonId, seasonId)).orderBy(reliquiasMemberAssignments.bossName, reliquiasMemberAssignments.attackNumber, members.name);
}
async function getGvgMatchInfo(eventDate) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(gvgMatchInfo).where(eq(gvgMatchInfo.eventDate, eventDate)).limit(1);
  return result[0] || null;
}
async function saveGvgMatchInfo(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(gvgMatchInfo).where(eq(gvgMatchInfo.eventDate, data.eventDate)).limit(1);
  if (existing[0]) {
    await db.update(gvgMatchInfo).set({
      opponentGuild: data.opponentGuild,
      ourScore: data.ourScore,
      opponentScore: data.opponentScore
    }).where(eq(gvgMatchInfo.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(gvgMatchInfo).values(data).returning({ id: true });
    return result[0]?.id;
  }
}
async function getGvgMatchHistory(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gvgMatchInfo).orderBy(desc(gvgMatchInfo.eventDate)).limit(limit);
}
async function getGvgEvolutionData(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (startDate) {
    conditions.push(gte(gvgAttacks.eventDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(gvgAttacks.eventDate, endDate));
  }
  return db.select({
    memberId: gvgAttacks.memberId,
    memberName: members.name,
    eventDate: gvgAttacks.eventDate,
    totalStars: sql`${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars}`,
    attack1Stars: gvgAttacks.attack1Stars,
    attack2Stars: gvgAttacks.attack2Stars
  }).from(gvgAttacks).innerJoin(members, eq(gvgAttacks.memberId, members.id)).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(gvgAttacks.eventDate, members.name);
}
async function getReliquiasRanking(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    memberId: reliquiasDamage.memberId,
    memberName: members.name,
    totalDamage: sql`COALESCE(SUM(${reliquiasDamage.damageNumeric}), 0)`,
    seasonsParticipated: sql`COUNT(DISTINCT ${reliquiasDamage.seasonId})`
  }).from(reliquiasDamage).innerJoin(members, eq(reliquiasDamage.memberId, members.id)).groupBy(reliquiasDamage.memberId, members.name).orderBy(desc(sql`SUM(${reliquiasDamage.damageNumeric})`)).limit(limit);
  return result;
}
async function getTelegramConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(botConfig).where(eq(botConfig.isActive, true)).limit(1);
  if (!result[0]) return null;
  return {
    botToken: result[0].telegramBotToken,
    chatId: result[0].telegramGroupId
  };
}
async function getGotPreviousPoints(currentEventDate) {
  const db = await getDb();
  if (!db) return [];
  const previousDateResult = await db.select({
    eventDate: gotAttacks.eventDate
  }).from(gotAttacks).where(sql`${gotAttacks.eventDate} < ${currentEventDate}`).groupBy(gotAttacks.eventDate).orderBy(desc(gotAttacks.eventDate)).limit(1);
  if (!previousDateResult[0]) return [];
  const previousDate = previousDateResult[0].eventDate;
  return db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    points: gotAttacks.points,
    attackVictories: gotAttacks.attackVictories,
    attackDefeats: gotAttacks.attackDefeats,
    defenseVictories: gotAttacks.defenseVictories,
    defenseDefeats: gotAttacks.defenseDefeats,
    eventDate: gotAttacks.eventDate
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).where(eq(gotAttacks.eventDate, previousDate)).orderBy(members.name);
}
async function getGotRankingLatest(startDate, endDate, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const allMembers = await db.select({
    id: members.id,
    name: members.name
  }).from(members).where(eq(members.participatesGot, true));
  const ranking = await Promise.all(
    allMembers.map(async (member) => {
      const lastPoints = await db.select({
        points: gotAttacks.points
      }).from(gotAttacks).where(eq(gotAttacks.memberId, member.id)).orderBy(desc(gotAttacks.eventDate)).limit(1);
      const lastAttack = await db.select({
        attackVictories: gotAttacks.attackVictories,
        attackDefeats: gotAttacks.attackDefeats
      }).from(gotAttacks).where(and(
        eq(gotAttacks.memberId, member.id),
        sql`(${gotAttacks.attackVictories} > 0 OR ${gotAttacks.attackDefeats} > 0)`
      )).orderBy(desc(gotAttacks.eventDate)).limit(1);
      const lastDefense = await db.select({
        defenseVictories: gotAttacks.defenseVictories,
        defenseDefeats: gotAttacks.defenseDefeats
      }).from(gotAttacks).where(and(
        eq(gotAttacks.memberId, member.id),
        sql`(${gotAttacks.defenseVictories} > 0 OR ${gotAttacks.defenseDefeats} > 0)`
      )).orderBy(desc(gotAttacks.eventDate)).limit(1);
      const battleCount = await db.select({
        count: sql`COUNT(*)`
      }).from(gotAttacks).where(eq(gotAttacks.memberId, member.id));
      return {
        memberId: member.id,
        memberName: member.name,
        totalPoints: lastPoints[0]?.points || 0,
        totalAttackVictories: lastAttack[0]?.attackVictories || 0,
        totalAttackDefeats: lastAttack[0]?.attackDefeats || 0,
        totalDefenseVictories: lastDefense[0]?.defenseVictories || 0,
        totalDefenseDefeats: lastDefense[0]?.defenseDefeats || 0,
        totalBattles: battleCount[0]?.count || 0
      };
    })
  );
  return ranking.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit);
}
async function getGotNonAttackersLatest(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const latestDate = await db.select({
    maxDate: sql`MAX(${gotAttacks.eventDate})`
  }).from(gotAttacks);
  if (!latestDate[0]?.maxDate) return [];
  const result = await db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    points: gotAttacks.points,
    attackVictories: gotAttacks.attackVictories,
    attackDefeats: gotAttacks.attackDefeats,
    defenseVictories: gotAttacks.defenseVictories,
    defenseDefeats: gotAttacks.defenseDefeats,
    didNotAttack: gotAttacks.didNotAttack,
    eventDate: gotAttacks.eventDate
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).where(
    and(
      eq(gotAttacks.eventDate, latestDate[0].maxDate),
      eq(gotAttacks.didNotAttack, true)
    )
  ).orderBy(members.name);
  return result;
}
async function getGotLowPerformersLatest(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const latestDateSubquery = db.select({
    memberId: gotAttacks.memberId,
    maxDate: sql`MAX(${gotAttacks.eventDate})`.as("maxDate")
  }).from(gotAttacks).groupBy(gotAttacks.memberId).as("latest");
  const result = await db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    points: gotAttacks.points,
    attackVictories: gotAttacks.attackVictories,
    attackDefeats: gotAttacks.attackDefeats,
    defenseVictories: gotAttacks.defenseVictories,
    defenseDefeats: gotAttacks.defenseDefeats,
    eventDate: gotAttacks.eventDate,
    balance: sql`(${gotAttacks.attackVictories} + ${gotAttacks.defenseVictories}) - (${gotAttacks.attackDefeats} + ${gotAttacks.defenseDefeats})`
  }).from(gotAttacks).innerJoin(members, eq(gotAttacks.memberId, members.id)).innerJoin(
    latestDateSubquery,
    and(
      eq(gotAttacks.memberId, latestDateSubquery.memberId),
      eq(gotAttacks.eventDate, latestDateSubquery.maxDate)
    )
  ).where(
    sql`(${gotAttacks.attackVictories} + ${gotAttacks.defenseVictories}) - (${gotAttacks.attackDefeats} + ${gotAttacks.defenseDefeats}) < 0`
  ).orderBy(sql`(${gotAttacks.attackVictories} + ${gotAttacks.defenseVictories}) - (${gotAttacks.attackDefeats} + ${gotAttacks.defenseDefeats})`);
  return result;
}
async function getGotNonAttackersHistory(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const allMembers = await db.select({
    id: members.id,
    name: members.name
  }).from(members).where(eq(members.isActive, true));
  const result = [];
  for (const member of allMembers) {
    const attacks = await db.select({
      eventDate: gotAttacks.eventDate,
      didNotAttack: gotAttacks.didNotAttack,
      points: gotAttacks.points
    }).from(gotAttacks).where(
      and(
        eq(gotAttacks.memberId, member.id),
        startDate ? gte(gotAttacks.eventDate, startDate) : void 0,
        endDate ? lte(gotAttacks.eventDate, endDate) : void 0
      )
    ).orderBy(desc(gotAttacks.eventDate));
    const totalAttacks = attacks.length;
    const nonAttacks = attacks.filter((a) => a.didNotAttack).length;
    if (nonAttacks > 0) {
      result.push({
        memberId: member.id,
        memberName: member.name,
        totalAttacks,
        nonAttacks,
        percentage: totalAttacks > 0 ? (nonAttacks / totalAttacks * 100).toFixed(1) : "0",
        battles: attacks.map((a) => ({
          date: a.eventDate,
          didNotAttack: a.didNotAttack,
          points: a.points
        }))
      });
    }
  }
  return result.sort((a, b) => b.nonAttacks - a.nonAttacks);
}
async function getGotPerformanceMetrics(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const allMembers = await db.select({
    id: members.id,
    name: members.name
  }).from(members).where(eq(members.isActive, true));
  const result = [];
  for (const member of allMembers) {
    const attacks = await db.select({
      attackVictories: gotAttacks.attackVictories,
      attackDefeats: gotAttacks.attackDefeats,
      defenseVictories: gotAttacks.defenseVictories,
      defenseDefeats: gotAttacks.defenseDefeats
    }).from(gotAttacks).where(
      and(
        eq(gotAttacks.memberId, member.id),
        startDate ? gte(gotAttacks.eventDate, startDate) : void 0,
        endDate ? lte(gotAttacks.eventDate, endDate) : void 0
      )
    );
    if (attacks.length === 0) continue;
    const totalAttackVictories = attacks.reduce((sum, a) => sum + a.attackVictories, 0);
    const totalAttackDefeats = attacks.reduce((sum, a) => sum + a.attackDefeats, 0);
    const totalDefenseVictories = attacks.reduce((sum, a) => sum + a.defenseVictories, 0);
    const totalDefenseDefeats = attacks.reduce((sum, a) => sum + a.defenseDefeats, 0);
    const totalVictories = totalAttackVictories + totalDefenseVictories;
    const totalBattles = totalAttackVictories + totalAttackDefeats + totalDefenseVictories + totalDefenseDefeats;
    const performance = totalBattles > 0 ? totalVictories / totalBattles * 100 : 0;
    if (performance < 50) {
      result.push({
        memberId: member.id,
        memberName: member.name,
        totalAttackVictories,
        totalAttackDefeats,
        totalDefenseVictories,
        totalDefenseDefeats,
        totalVictories,
        totalBattles,
        performance: performance.toFixed(1)
      });
    }
  }
  return result.sort((a, b) => parseFloat(a.performance) - parseFloat(b.performance));
}
async function createGvgSeason(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create GvG season: database not available");
    return null;
  }
  try {
    const result = await db.insert(gvgSeasons).values(data).returning({ id: true });
    const season = await db.query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.id, result[0]?.id)
    });
    return season || null;
  } catch (error) {
    console.error("[Database] Error creating GvG season:", error);
    return null;
  }
}
async function getActiveSeason() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active season: database not available");
    return null;
  }
  try {
    const season = await db.query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.status, "active")
    });
    return season || null;
  } catch (error) {
    console.error("[Database] Error getting active season:", error);
    return null;
  }
}
async function getAllSeasons() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get seasons: database not available");
    return [];
  }
  try {
    const seasons = await db.query.gvgSeasons.findMany({
      orderBy: desc(gvgSeasons.createdAt)
    });
    return seasons;
  } catch (error) {
    console.error("[Database] Error getting seasons:", error);
    return [];
  }
}
async function updateSeasonStatus(seasonId, status) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update season: database not available");
    return null;
  }
  try {
    await db.update(gvgSeasons).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(gvgSeasons.id, seasonId));
    const season = await db.query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.id, seasonId)
    });
    return season || null;
  } catch (error) {
    console.error("[Database] Error updating season:", error);
    return null;
  }
}
async function endCurrentSeasonAndStartNew(newSeasonData) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot end/start seasons: database not available");
    return { oldSeason: null, newSeason: null };
  }
  try {
    const activeSeason = await db.query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.status, "active")
    });
    let oldSeason = null;
    if (activeSeason) {
      await db.update(gvgSeasons).set({ status: "ended", updatedAt: /* @__PURE__ */ new Date() }).where(eq(gvgSeasons.id, activeSeason.id));
      oldSeason = activeSeason;
    }
    const result = await db.insert(gvgSeasons).values(newSeasonData);
    const newSeason = await db.query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.id, result[0]?.id)
    });
    return { oldSeason, newSeason: newSeason || null };
  } catch (error) {
    console.error("[Database] Error ending/starting seasons:", error);
    return { oldSeason: null, newSeason: null };
  }
}
async function createGotStrategy(strategy) {
  const db = await getDb();
  if (!db) {
    console.error("[DB] Database not available");
    return null;
  }
  try {
    if (!strategy.name || !strategy.attackFormation1 || !strategy.attackFormation2 || !strategy.attackFormation3 || !strategy.defenseFormation1 || !strategy.defenseFormation2 || !strategy.defenseFormation3 || !strategy.createdBy) {
      throw new Error("Missing required fields for strategy");
    }
    console.log("[DB] Creating strategy with validated data:", strategy);
    const result = await db.insert(gotStrategies).values({
      name: strategy.name,
      attackFormation1: strategy.attackFormation1,
      attackFormation2: strategy.attackFormation2,
      attackFormation3: strategy.attackFormation3,
      defenseFormation1: strategy.defenseFormation1,
      defenseFormation2: strategy.defenseFormation2,
      defenseFormation3: strategy.defenseFormation3,
      usageCount: strategy.usageCount || 0,
      createdBy: strategy.createdBy
    });
    console.log("[DB] Insert result:", result);
    const insertId = result?.[0]?.id;
    if (insertId) {
      const created2 = await db.select().from(gotStrategies).where(eq(gotStrategies.id, insertId)).limit(1);
      console.log("[DB] Created strategy:", created2[0]);
      return created2[0] || null;
    }
    const created = await db.select().from(gotStrategies).where(eq(gotStrategies.createdBy, strategy.createdBy)).orderBy(desc(gotStrategies.createdAt)).limit(1);
    console.log("[DB] Created strategy (fallback):", created[0]);
    return created[0] || null;
  } catch (error) {
    console.error("[DB] Error creating strategy:", error);
    throw error;
  }
}
async function getAllGotStrategies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gotStrategies).orderBy(desc(gotStrategies.usageCount));
}
async function getGotStrategyById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(gotStrategies).where(eq(gotStrategies.id, id)).limit(1);
  return result[0] || null;
}
async function updateGotStrategy(id, updates) {
  const db = await getDb();
  if (!db) return null;
  await db.update(gotStrategies).set(updates).where(eq(gotStrategies.id, id));
  const updated = await db.select().from(gotStrategies).where(eq(gotStrategies.id, id)).limit(1);
  return updated[0] || null;
}
async function deleteGotStrategy(id) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(gotStrategies).where(eq(gotStrategies.id, id));
  return true;
}
async function searchGotStrategies(keyword) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter(
    (s) => s.name?.toLowerCase().includes(keyword.toLowerCase())
  );
}
async function getGotStrategiesByAttackFormation(attackerName) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter(
    (s) => s.attackFormation1?.toLowerCase().includes(attackerName.toLowerCase()) || s.attackFormation2?.toLowerCase().includes(attackerName.toLowerCase()) || s.attackFormation3?.toLowerCase().includes(attackerName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function getGotStrategiesByDefenseFormation(defenderName) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter(
    (s) => s.defenseFormation1?.toLowerCase().includes(defenderName.toLowerCase()) || s.defenseFormation2?.toLowerCase().includes(defenderName.toLowerCase()) || s.defenseFormation3?.toLowerCase().includes(defenderName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGotStrategiesByMultipleNames(names) {
  const db = await getDb();
  if (!db) return [];
  const cleanedNames = names.slice(0, 3).map((n) => n.trim().toLowerCase()).filter((n) => n.length > 0);
  if (cleanedNames.length === 0) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter((s) => {
    const allFormations = [
      s.attackFormation1?.toLowerCase() || "",
      s.attackFormation2?.toLowerCase() || "",
      s.attackFormation3?.toLowerCase() || "",
      s.defenseFormation1?.toLowerCase() || "",
      s.defenseFormation2?.toLowerCase() || "",
      s.defenseFormation3?.toLowerCase() || ""
    ];
    return cleanedNames.every(
      (name) => allFormations.some((formation) => formation.includes(name))
    );
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGotStrategiesByMultipleNamesInAttack(names) {
  const db = await getDb();
  if (!db) return [];
  const cleanedNames = names.slice(0, 3).map((n) => n.trim().toLowerCase()).filter((n) => n.length > 0);
  if (cleanedNames.length === 0) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter((s) => {
    const attackFormations = [
      s.attackFormation1?.toLowerCase().trim() || "",
      s.attackFormation2?.toLowerCase().trim() || "",
      s.attackFormation3?.toLowerCase().trim() || ""
    ];
    if (cleanedNames.length === 1) {
      return attackFormations.some((formation) => {
        const words = formation.split(/\s+/);
        return words.some((word) => word === cleanedNames[0]);
      });
    } else {
      const allWords = attackFormations.map((f) => f.split(/\s+/)).flat();
      return cleanedNames.every((name) => allWords.some((word) => word === name));
    }
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGotStrategiesByMultipleNamesInDefense(names) {
  const db = await getDb();
  if (!db) return [];
  const cleanedNames = names.slice(0, 3).map((n) => n.trim().toLowerCase()).filter((n) => n.length > 0);
  if (cleanedNames.length === 0) return [];
  const results = await db.select().from(gotStrategies);
  const filtered = results.filter((s) => {
    const defenseFormations = [
      s.defenseFormation1?.toLowerCase().trim() || "",
      s.defenseFormation2?.toLowerCase().trim() || "",
      s.defenseFormation3?.toLowerCase().trim() || ""
    ];
    console.log(`[searchGotStrategiesByMultipleNamesInDefense] Checking ${s.name}: ${defenseFormations.join(" | ")} against ${cleanedNames.join(", ")}`);
    if (cleanedNames.length === 1) {
      const match = defenseFormations.some((formation) => {
        const words = formation.split(/\s+/);
        return words.some((word) => word === cleanedNames[0]);
      });
      if (match) console.log(`[searchGotStrategiesByMultipleNamesInDefense] MATCH (1 name): ${s.name}`);
      return match;
    } else {
      const allWords = defenseFormations.map((f) => f.split(/\s+/)).flat();
      const match = cleanedNames.every((name) => allWords.some((word) => word === name));
      if (match) console.log(`[searchGotStrategiesByMultipleNamesInDefense] MATCH (2+ names): ${s.name}`);
      return match;
    }
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  console.log(`[searchGotStrategiesByMultipleNamesInDefense] Final result: ${filtered.length} strategies`);
  return filtered;
}
async function createGvgStrategy(strategy) {
  const db = await getDb();
  if (!db) {
    console.error("[DB] Database not available");
    return null;
  }
  try {
    if (!strategy.attackFormation1 || !strategy.attackFormation2 || !strategy.attackFormation3 || !strategy.attackFormation4 || !strategy.attackFormation5 || !strategy.defenseFormation1 || !strategy.defenseFormation2 || !strategy.defenseFormation3 || !strategy.defenseFormation4 || !strategy.defenseFormation5 || !strategy.createdBy) {
      throw new Error("Missing required fields for GVG strategy");
    }
    console.log("[DB] Creating GVG strategy with validated data:", strategy);
    const result = await db.insert(gvgStrategies).values({
      name: strategy.name,
      attackFormation1: strategy.attackFormation1,
      attackFormation2: strategy.attackFormation2,
      attackFormation3: strategy.attackFormation3,
      attackFormation4: strategy.attackFormation4,
      attackFormation5: strategy.attackFormation5,
      defenseFormation1: strategy.defenseFormation1,
      defenseFormation2: strategy.defenseFormation2,
      defenseFormation3: strategy.defenseFormation3,
      defenseFormation4: strategy.defenseFormation4,
      defenseFormation5: strategy.defenseFormation5,
      usageCount: strategy.usageCount || 0,
      createdBy: strategy.createdBy
    });
    console.log("[DB] Insert result:", result);
    const insertId = result?.[0]?.id;
    if (insertId) {
      const created2 = await db.select().from(gvgStrategies).where(eq(gvgStrategies.id, insertId)).limit(1);
      console.log("[DB] Created GVG strategy:", created2[0]);
      return created2[0] || null;
    }
    const created = await db.select().from(gvgStrategies).where(eq(gvgStrategies.createdBy, strategy.createdBy)).orderBy(desc(gvgStrategies.createdAt)).limit(1);
    console.log("[DB] Created GVG strategy (fallback):", created[0]);
    return created[0] || null;
  } catch (error) {
    console.error("[DB] Error creating GVG strategy:", error);
    throw error;
  }
}
async function getAllGvgStrategies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gvgStrategies).orderBy(desc(gvgStrategies.usageCount));
}
async function getGvgStrategyById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(gvgStrategies).where(eq(gvgStrategies.id, id)).limit(1);
  return result[0] || null;
}
async function updateGvgStrategy(id, updates) {
  const db = await getDb();
  if (!db) return null;
  await db.update(gvgStrategies).set(updates).where(eq(gvgStrategies.id, id));
  const updated = await db.select().from(gvgStrategies).where(eq(gvgStrategies.id, id)).limit(1);
  return updated[0] || null;
}
async function deleteGvgStrategy(id) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(gvgStrategies).where(eq(gvgStrategies.id, id));
  return true;
}
async function searchGvgStrategies(keyword) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gvgStrategies);
  return results.filter(
    (s) => s.name?.toLowerCase().includes(keyword.toLowerCase())
  );
}
async function getGvgStrategiesByAttackFormation(attackerName) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gvgStrategies);
  return results.filter(
    (s) => s.attackFormation1?.toLowerCase().includes(attackerName.toLowerCase()) || s.attackFormation2?.toLowerCase().includes(attackerName.toLowerCase()) || s.attackFormation3?.toLowerCase().includes(attackerName.toLowerCase()) || s.attackFormation4?.toLowerCase().includes(attackerName.toLowerCase()) || s.attackFormation5?.toLowerCase().includes(attackerName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function getGvgStrategiesByDefenseFormation(defenderName) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gvgStrategies);
  return results.filter(
    (s) => s.defenseFormation1?.toLowerCase().includes(defenderName.toLowerCase()) || s.defenseFormation2?.toLowerCase().includes(defenderName.toLowerCase()) || s.defenseFormation3?.toLowerCase().includes(defenderName.toLowerCase()) || s.defenseFormation4?.toLowerCase().includes(defenderName.toLowerCase()) || s.defenseFormation5?.toLowerCase().includes(defenderName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGotStrategiesByKeyword(keyword) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter(
    (s) => s.observation?.toLowerCase().includes(keyword.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGvgStrategiesByKeyword(keyword) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gvgStrategies);
  return results.filter(
    (s) => (s.name || "").toLowerCase().includes(keyword.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function getGotStrategiesByName(strategyName) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gotStrategies);
  return results.filter(
    (s) => s.name?.toLowerCase().includes(strategyName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGvgStrategiesByMultipleNamesInAttack(names) {
  const db = await getDb();
  if (!db) return [];
  const normalizedNames = names.map((n) => n.toLowerCase().trim());
  const results = await db.select().from(gvgStrategies);
  return results.filter((s) => {
    const attackFormations = [
      s.attackFormation1?.toLowerCase() || "",
      s.attackFormation2?.toLowerCase() || "",
      s.attackFormation3?.toLowerCase() || "",
      s.attackFormation4?.toLowerCase() || "",
      s.attackFormation5?.toLowerCase() || ""
    ];
    const allWords = attackFormations.map((f) => f.split(/\s+/)).flat();
    return normalizedNames.every((name) => allWords.some((word) => word === name));
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGvgStrategiesByMultipleNamesInDefense(names) {
  const db = await getDb();
  if (!db) return [];
  const normalizedNames = names.map((n) => n.toLowerCase().trim());
  const results = await db.select().from(gvgStrategies);
  return results.filter((s) => {
    const defenseFormations = [
      s.defenseFormation1?.toLowerCase() || "",
      s.defenseFormation2?.toLowerCase() || "",
      s.defenseFormation3?.toLowerCase() || "",
      s.defenseFormation4?.toLowerCase() || "",
      s.defenseFormation5?.toLowerCase() || ""
    ];
    const allWords = defenseFormations.map((f) => f.split(/\s+/)).flat();
    return normalizedNames.every((name) => allWords.some((word) => word === name));
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchGvgDefenseTips(names) {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[searchGvgDefenseTips] DB connection failed");
      return [];
    }
    console.log("[searchGvgDefenseTips] Searching for names:", names);
    const normalizedNames = names.map((n) => n.toLowerCase().trim());
    console.log("[searchGvgDefenseTips] Normalized names:", normalizedNames);
    const results = await db.select().from(gvgStrategies);
    console.log("[searchGvgDefenseTips] Total strategies in DB:", results.length);
    const filtered = results.filter((s) => {
      try {
        const defenseFormations = [
          (s.defenseFormation1 || "").toLowerCase().trim(),
          (s.defenseFormation2 || "").toLowerCase().trim(),
          (s.defenseFormation3 || "").toLowerCase().trim(),
          (s.defenseFormation4 || "").toLowerCase().trim(),
          (s.defenseFormation5 || "").toLowerCase().trim()
        ].filter((f) => f);
        if (defenseFormations.length === 0) {
          console.log("[searchGvgDefenseTips] Strategy has no defense formations:", s.name);
          return false;
        }
        const allWords = defenseFormations.map((f) => f.split(/\s+/)).flat().filter((w) => w);
        const matches = normalizedNames.every((name) => allWords.some((word) => word === name));
        if (matches) {
          console.log("[searchGvgDefenseTips] Match found:", s.name, "- Formations:", defenseFormations);
        }
        return matches;
      } catch (err) {
        console.error("[searchGvgDefenseTips] Filter error for strategy", s.name, ":", err);
        return false;
      }
    }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    console.log("[searchGvgDefenseTips] Found", filtered.length, "strategies");
    return filtered;
  } catch (error) {
    console.error("[searchGvgDefenseTips] Error:", error);
    return [];
  }
}
async function searchGvgStrategiesByKeywordInAttack(keyword) {
  const db = await getDb();
  if (!db) return [];
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results = await db.select().from(gvgStrategies);
  const filtered = results.filter((s) => {
    const cleanName = (s.name || "").toLowerCase().replace(/\s*\/\s*/g, " ").trim();
    return cleanName.includes(normalizedKeyword);
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  return filtered;
}
async function searchGvgStrategiesByKeywordInDefense(keyword) {
  const db = await getDb();
  if (!db) return [];
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results = await db.select().from(gvgStrategies);
  const filtered = results.filter((s) => {
    const cleanName = (s.name || "").toLowerCase().replace(/\s*\/\s*/g, " ").trim();
    return cleanName.includes(normalizedKeyword);
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  return filtered;
}
async function searchGvgDefenseTipsByKeyword(keyword) {
  const db = await getDb();
  if (!db) return [];
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results = await db.select().from(gvgStrategies);
  return results.filter((s) => {
    const name = (s.name || "").toLowerCase();
    return name.includes(normalizedKeyword);
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}
async function searchMembersByNamePart(searchTerm) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search members: database not available");
    return [];
  }
  try {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) {
      return [];
    }
    const results = await db.select().from(members).where(sql`LOWER(${members.name}) LIKE ${`${normalizedSearch}%`}`).orderBy(members.name);
    return results;
  } catch (error) {
    console.error("[Database] Error searching members:", error);
    return [];
  }
}
async function searchCharactersInGotStrategies(searchTerm) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search characters: database not available");
    return [];
  }
  try {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) {
      return [];
    }
    const allStrategies = await db.select().from(gotStrategies).orderBy(gotStrategies.name);
    const characterMap = /* @__PURE__ */ new Map();
    for (const strategy of allStrategies) {
      const formations = [
        strategy.attackFormation1,
        strategy.attackFormation2,
        strategy.attackFormation3,
        strategy.defenseFormation1,
        strategy.defenseFormation2,
        strategy.defenseFormation3
      ];
      for (const formation of formations) {
        if (formation && formation.toLowerCase().startsWith(normalizedSearch)) {
          const normalized = formation.trim().replace(/\s+/g, " ").toLowerCase();
          if (!characterMap.has(normalized)) {
            characterMap.set(normalized, { original: formation.trim(), strategyIds: /* @__PURE__ */ new Set() });
          } else {
            const current = characterMap.get(normalized);
            if (formation.trim().length < current.original.length) {
              current.original = formation.trim();
            }
          }
          characterMap.get(normalized).strategyIds.add(strategy.id);
        }
      }
    }
    const results = [];
    Array.from(characterMap.entries()).forEach(([normalized, { original, strategyIds }]) => {
      const strategies = allStrategies.filter((s) => strategyIds.has(s.id));
      results.push({ character: original, strategies });
    });
    return results.sort((a, b) => a.character.localeCompare(b.character));
  } catch (error) {
    console.error("[Database] Error searching characters in GoT strategies:", error);
    return [];
  }
}
async function searchCharactersInGvgStrategies(searchTerm) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search characters: database not available");
    return [];
  }
  try {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) {
      return [];
    }
    const allStrategies = await db.select().from(gvgStrategies).orderBy(gvgStrategies.name);
    const characterMap = /* @__PURE__ */ new Map();
    for (const strategy of allStrategies) {
      const formations = [
        strategy.attackFormation1,
        strategy.attackFormation2,
        strategy.attackFormation3,
        strategy.attackFormation4,
        strategy.attackFormation5,
        strategy.defenseFormation1,
        strategy.defenseFormation2,
        strategy.defenseFormation3,
        strategy.defenseFormation4,
        strategy.defenseFormation5
      ];
      for (const formation of formations) {
        if (formation && formation.toLowerCase().startsWith(normalizedSearch)) {
          const normalized = formation.trim().replace(/\s+/g, " ").toLowerCase();
          if (!characterMap.has(normalized)) {
            characterMap.set(normalized, { original: formation.trim(), strategyIds: /* @__PURE__ */ new Set() });
          } else {
            const current = characterMap.get(normalized);
            if (formation.trim().length < current.original.length) {
              current.original = formation.trim();
            }
          }
          characterMap.get(normalized).strategyIds.add(strategy.id);
        }
      }
    }
    const results = [];
    Array.from(characterMap.entries()).forEach(([normalized, { original, strategyIds }]) => {
      const strategies = allStrategies.filter((s) => strategyIds.has(s.id));
      results.push({ character: original, strategies });
    });
    return results.sort((a, b) => a.character.localeCompare(b.character));
  } catch (error) {
    console.error("[Database] Error searching characters in GVG strategies:", error);
    return [];
  }
}
async function createCard(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create card: database not available");
    return null;
  }
  try {
    await db.insert(cards).values(data).returning({ id: true });
    const newCards = await db.select().from(cards).where(eq(cards.name, data.name)).limit(1);
    return newCards[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create card:", error);
    throw error;
  }
}
async function getAllCards() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cards: database not available");
    return [];
  }
  try {
    const allCards = await db.select().from(cards).orderBy(asc(cards.name));
    return allCards;
  } catch (error) {
    console.error("[Database] Failed to get cards:", error);
    return [];
  }
}
async function getCardById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get card: database not available");
    return null;
  }
  try {
    const result = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get card:", error);
    return null;
  }
}
async function searchCards(searchTerm) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search cards: database not available");
    return [];
  }
  try {
    const results = await db.select().from(cards).where(like(cards.name, `%${searchTerm}%`)).orderBy(asc(cards.name));
    return results;
  } catch (error) {
    console.error("[Database] Failed to search cards:", error);
    return [];
  }
}
async function updateCard(id, data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update card: database not available");
    return null;
  }
  try {
    await db.update(cards).set(data).where(eq(cards.id, id));
    const result = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update card:", error);
    throw error;
  }
}
async function deleteCard(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete card: database not available");
    return false;
  }
  try {
    await db.delete(cards).where(eq(cards.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete card:", error);
    throw error;
  }
}
async function createCardBackup(cardId, backupType, cardData, backupReason, createdBy) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create card backup: database not available");
    return;
  }
  try {
    await db.insert(cardBackups).values({
      cardId,
      backupType,
      cardData: JSON.stringify(cardData),
      backupReason,
      createdBy
    });
  } catch (error) {
    console.error("[Database] Failed to create card backup:", error);
    throw error;
  }
}
async function exportCardsAsJson() {
  const allCards = await getAllCards();
  return JSON.stringify(allCards, null, 2);
}
async function importCardsFromJson(jsonData, createdBy) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot import cards: database not available");
    return 0;
  }
  try {
    const cardsToImport = JSON.parse(jsonData);
    let importedCount = 0;
    for (const cardData of cardsToImport) {
      try {
        const existingCards = await db.select().from(cards).where(eq(cards.name, cardData.name)).limit(1);
        const existingCard = existingCards[0] || null;
        if (existingCard) {
          await updateCard(existingCard.id, {
            ...cardData,
            createdBy
          });
        } else {
          await createCard({
            ...cardData,
            createdBy
          });
        }
        importedCount++;
      } catch (error) {
        console.error(`[Database] Failed to import card "${cardData.name}":`, error);
      }
    }
    return importedCount;
  } catch (error) {
    console.error("[Database] Failed to import cards from JSON:", error);
    throw error;
  }
}
async function createCharacter(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create character: database not available");
    return null;
  }
  try {
    const maxIdResult = await db.select({ maxId: sql`MAX(${characters.id})` }).from(characters);
    const nextId = (maxIdResult[0]?.maxId || 0) + 1;
    const result = await db.insert(characters).values({ ...data, id: nextId });
    return nextId;
  } catch (error) {
    console.error("[Database] Failed to create character:", error);
    throw error;
  }
}
async function getCharacterById(id) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get character:", error);
    return null;
  }
}
async function getCharacterByName(name) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(characters).where(eq(characters.name, name)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get character by name:", error);
    return null;
  }
}
async function getAllCharacters() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characters).orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to get all characters:", error);
    return [];
  }
}
async function searchCharacters(query) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characters).where(like(characters.name, `%${query}%`)).orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to search characters:", error);
    return [];
  }
}
async function getCharactersByClass(characterClass) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characters).where(eq(characters.class, characterClass)).orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to get characters by class:", error);
    return [];
  }
}
async function getCharactersByType(characterType) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characters).where(eq(characters.type, characterType)).orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to get characters by type:", error);
    return [];
  }
}
async function updateCharacter(id, data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update character: database not available");
    return null;
  }
  try {
    await db.update(characters).set({
      ...data,
      last_updated: /* @__PURE__ */ new Date()
    }).where(eq(characters.id, id));
    return await getCharacterById(id);
  } catch (error) {
    console.error("[Database] Failed to update character:", error);
    throw error;
  }
}
async function deleteCharacter(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete character: database not available");
    return false;
  }
  try {
    await db.delete(characterSkills).where(eq(characterSkills.character_id, id));
    await db.delete(characterCloth).where(eq(characterCloth.character_id, id));
    await db.delete(characterConstellations).where(eq(characterConstellations.character_id, id));
    await db.delete(characterLinks).where(eq(characterLinks.character_id, id));
    await db.delete(characters).where(eq(characters.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete character:", error);
    throw error;
  }
}
async function upsertCharacter(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert character: database not available");
    return null;
  }
  try {
    const existing = await getCharacterById(data.id);
    if (existing) {
      return await updateCharacter(data.id, data);
    } else {
      const result = await db.insert(characters).values(data).returning({ id: true });
      return await getCharacterById(data.id);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert character:", error);
    throw error;
  }
}
async function createCharacterSkill(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create character skill: database not available");
    return null;
  }
  try {
    const result = await db.insert(characterSkills).values(data).returning({ id: true });
    return result[0]?.id;
  } catch (error) {
    console.error("[Database] Failed to create character skill:", error);
    throw error;
  }
}
async function getCharacterSkills(characterId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characterSkills).where(eq(characterSkills.character_id, characterId));
  } catch (error) {
    console.error("[Database] Failed to get character skills:", error);
    return [];
  }
}
async function createCharacterCloth(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create character cloth: database not available");
    return null;
  }
  try {
    const result = await db.insert(characterCloth).values(data).returning({ id: true });
    return result[0]?.id;
  } catch (error) {
    console.error("[Database] Failed to create character cloth:", error);
    throw error;
  }
}
async function getCharacterCloth(characterId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characterCloth).where(eq(characterCloth.character_id, characterId)).orderBy(characterCloth.level);
  } catch (error) {
    console.error("[Database] Failed to get character cloth:", error);
    return [];
  }
}
async function createCharacterConstellation(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create character constellation: database not available");
    return null;
  }
  try {
    const result = await db.insert(characterConstellations).values(data).returning({ id: true });
    return result[0]?.id;
  } catch (error) {
    console.error("[Database] Failed to create character constellation:", error);
    throw error;
  }
}
async function getCharacterConstellations(characterId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characterConstellations).where(eq(characterConstellations.character_id, characterId));
  } catch (error) {
    console.error("[Database] Failed to get character constellations:", error);
    return [];
  }
}
async function createCharacterLink(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create character link: database not available");
    return null;
  }
  try {
    const result = await db.insert(characterLinks).values(data).returning({ id: true });
    return result[0]?.id;
  } catch (error) {
    console.error("[Database] Failed to create character link:", error);
    throw error;
  }
}
async function getCharacterLinks(characterId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characterLinks).where(eq(characterLinks.character_id, characterId));
  } catch (error) {
    console.error("[Database] Failed to get character links:", error);
    return [];
  }
}
async function exportCharactersToJson() {
  const allCharacters = await getAllCharacters();
  const charactersWithDetails = await Promise.all(
    allCharacters.map(async (char) => ({
      ...char,
      skills: await getCharacterSkills(char.id),
      cloth: await getCharacterCloth(char.id),
      constellations: await getCharacterConstellations(char.id),
      links: await getCharacterLinks(char.id)
    }))
  );
  return JSON.stringify(charactersWithDetails, null, 2);
}
async function importCharactersFromJson(jsonData) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot import characters: database not available");
    return 0;
  }
  try {
    const charactersToImport = JSON.parse(jsonData);
    let importedCount = 0;
    for (const charData of charactersToImport) {
      try {
        const { skills, cloth, constellations, links, ...characterData } = charData;
        await upsertCharacter(characterData);
        if (skills && Array.isArray(skills)) {
          for (const skill of skills) {
            await createCharacterSkill({
              character_id: characterData.id,
              ...skill
            });
          }
        }
        if (cloth && Array.isArray(cloth)) {
          for (const clothData of cloth) {
            await createCharacterCloth({
              character_id: characterData.id,
              ...clothData
            });
          }
        }
        if (constellations && Array.isArray(constellations)) {
          for (const constellation of constellations) {
            await createCharacterConstellation({
              character_id: characterData.id,
              ...constellation
            });
          }
        }
        if (links && Array.isArray(links)) {
          for (const link of links) {
            await createCharacterLink({
              character_id: characterData.id,
              ...link
            });
          }
        }
        importedCount++;
      } catch (error) {
        console.error(`[Database] Failed to import character "${charData.name}":`, error);
      }
    }
    return importedCount;
  } catch (error) {
    console.error("[Database] Failed to import characters from JSON:", error);
    throw error;
  }
}
async function getAllArayashikis() {
  return [
    { id: 1, name: "Martial Arts of Ice", quality: "Violet", attribute: "DEF Boost" },
    { id: 2, name: "Demon Rose", quality: "Or", attribute: "ATK Boost" },
    { id: 3, name: "Arrow of Justice", quality: "Violet", attribute: "CRIT" },
    { id: 4, name: "Life Shield", quality: "Bleu", attribute: "HP Boost" },
    { id: 5, name: "Tide Turner", quality: "Or", attribute: "DODGE" }
  ];
}
async function searchArayashikis(query) {
  const allCards = await getAllArayashikis();
  return allCards.filter(
    (card) => card.name.toLowerCase().includes(query.toLowerCase()) || card.attribute.toLowerCase().includes(query.toLowerCase())
  );
}
async function getArayashikisByAttribute(attribute) {
  const allCards = await getAllArayashikis();
  return allCards.filter((card) => card.attribute === attribute);
}
async function getArayashikisByQuality(quality) {
  const allCards = await getAllArayashikis();
  return allCards.filter((card) => card.quality === quality);
}
async function getArayashikiById(id) {
  const allCards = await getAllArayashikis();
  return allCards.find((card) => card.id === id) || null;
}
async function getArayashikiByName(name) {
  const allCards = await getAllArayashikis();
  return allCards.find((card) => card.name === name) || null;
}
async function createArayashiki(data) {
  console.log("[Database] Arayashiki criada (mock):", data.name);
  return { success: true };
}
async function updateArayashiki(id, data) {
  console.log("[Database] Arayashiki atualizada (mock):", id);
  return { success: true };
}
async function deleteArayashiki(id) {
  console.log("[Database] Arayashiki deletada (mock):", id);
  return { success: true };
}
async function getArayashikiSynergies(arayashikiId) {
  return [];
}
async function createArayashikiSynergy(data) {
  console.log("[Database] Sinergia criada (mock):", data);
  return { success: true };
}
var _db, _pool;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    init_schema();
    _db = null;
    _pool = null;
  }
});

// server/_core/llm.ts
var llm_exports = {};
__export(llm_exports, {
  invokeLLM: () => invokeLLM
});
async function invokeLLM(params) {
  const { messages, maxTokens, max_tokens } = params;
  const systemMessage = messages.find((m) => m.role === "system");
  const userMessages = messages.filter((m) => m.role !== "system");
  const formattedMessages = userMessages.map((m) => {
    const content = typeof m.content === "string" ? m.content : Array.isArray(m.content) ? m.content.map((c) => typeof c === "string" ? c : c.text || "").join("\n") : m.content.text || "";
    return `${m.role}: ${content}`;
  }).join("\n");
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: formattedMessages,
        stream: false
      })
    }).catch(() => null);
    if (response && response.ok) {
      const data = await response.json();
      return {
        id: `llm-${Date.now()}`,
        created: Date.now(),
        model: "local",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: data.response || ""
          },
          finish_reason: "stop"
        }]
      };
    }
  } catch (e) {
  }
  console.log("[LLM] Using mock response - configure LLM API for real responses");
  return {
    id: `mock-${Date.now()}`,
    created: Date.now(),
    model: "mock",
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: JSON.stringify({
          name: "Carta Exemplo",
          bonusDmg: "10%",
          bonusDef: "5%",
          bonusVid: "0",
          bonusPress: "0",
          bonusEsquiva: "0",
          bonusVelAtaq: "0",
          bonusTenacidade: "0",
          bonusSanguessuga: "0",
          bonusRedDano: "0",
          bonusCrit: "0",
          bonusCura: "0",
          bonusCuraRecebida: "0",
          bonusPrecisao: "0",
          usageLimit: "Todos",
          skillEffect: "Efeito da carta"
        })
      },
      finish_reason: "stop"
    }]
  };
}
var init_llm = __esm({
  "server/_core/llm.ts"() {
    "use strict";
  }
});

// server/strategyBackup.ts
var strategyBackup_exports = {};
__export(strategyBackup_exports, {
  backupGotStrategy: () => backupGotStrategy,
  backupGvgStrategy: () => backupGvgStrategy,
  cleanupOldBackups: () => cleanupOldBackups,
  getGotStrategyBackupHistory: () => getGotStrategyBackupHistory,
  getGvgStrategyBackupHistory: () => getGvgStrategyBackupHistory,
  restoreGotStrategyFromBackup: () => restoreGotStrategyFromBackup,
  restoreGvgStrategyFromBackup: () => restoreGvgStrategyFromBackup
});
import { eq as eq3, lt as lt2 } from "drizzle-orm";
async function backupGotStrategy(strategyId, strategyData, options) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    await db.insert(gotStrategyBackups).values({
      strategyId,
      backupType: options.backupType,
      strategyData: JSON.stringify(strategyData),
      backupReason: options.backupReason,
      createdBy: options.createdBy
    });
    console.log(`[Backup] GoT Strategy ${strategyId} backed up (${options.backupType})`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao fazer backup de estrat\xE9gia GoT ${strategyId}:`, error);
    return false;
  }
}
async function backupGvgStrategy(strategyId, strategyData, options) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    await db.insert(gvgStrategyBackups).values({
      strategyId,
      backupType: options.backupType,
      strategyData: JSON.stringify(strategyData),
      backupReason: options.backupReason,
      createdBy: options.createdBy
    });
    console.log(`[Backup] GVG Strategy ${strategyId} backed up (${options.backupType})`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao fazer backup de estrat\xE9gia GVG ${strategyId}:`, error);
    return false;
  }
}
async function getGotStrategyBackupHistory(strategyId, limit = 20) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const backups2 = await db.select().from(gotStrategyBackups).where(eq3(gotStrategyBackups.strategyId, strategyId)).orderBy((table) => table.createdAt).limit(limit);
    return backups2.map((backup) => ({
      ...backup,
      strategyData: JSON.parse(backup.strategyData)
    }));
  } catch (error) {
    console.error(`[Backup] Erro ao obter hist\xF3rico de backups GoT ${strategyId}:`, error);
    return [];
  }
}
async function getGvgStrategyBackupHistory(strategyId, limit = 20) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const backups2 = await db.select().from(gvgStrategyBackups).where(eq3(gvgStrategyBackups.strategyId, strategyId)).orderBy((table) => table.createdAt).limit(limit);
    return backups2.map((backup) => ({
      ...backup,
      strategyData: JSON.parse(backup.strategyData)
    }));
  } catch (error) {
    console.error(`[Backup] Erro ao obter hist\xF3rico de backups GVG ${strategyId}:`, error);
    return [];
  }
}
async function restoreGotStrategyFromBackup(backupId, createdBy) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const backup = await db.select().from(gotStrategyBackups).where(eq3(gotStrategyBackups.id, backupId)).limit(1);
    if (!backup || backup.length === 0) {
      console.error(`[Backup] Backup GoT ${backupId} n\xE3o encontrado`);
      return false;
    }
    const backupData = JSON.parse(backup[0].strategyData);
    await backupGotStrategy(backup[0].strategyId, backupData, {
      backupType: "manual",
      backupReason: `Restaurado do backup ${backupId}`,
      createdBy
    });
    console.log(`[Backup] Estrat\xE9gia GoT ${backup[0].strategyId} restaurada do backup ${backupId}`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao restaurar estrat\xE9gia GoT do backup ${backupId}:`, error);
    return false;
  }
}
async function restoreGvgStrategyFromBackup(backupId, createdBy) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const backup = await db.select().from(gvgStrategyBackups).where(eq3(gvgStrategyBackups.id, backupId)).limit(1);
    if (!backup || backup.length === 0) {
      console.error(`[Backup] Backup GVG ${backupId} n\xE3o encontrado`);
      return false;
    }
    const backupData = JSON.parse(backup[0].strategyData);
    await backupGvgStrategy(backup[0].strategyId, backupData, {
      backupType: "manual",
      backupReason: `Restaurado do backup ${backupId}`,
      createdBy
    });
    console.log(`[Backup] Estrat\xE9gia GVG ${backup[0].strategyId} restaurada do backup ${backupId}`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao restaurar estrat\xE9gia GVG do backup ${backupId}:`, error);
    return false;
  }
}
async function cleanupOldBackups(daysToKeep = 30) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const gotResult = await db.delete(gotStrategyBackups).where(lt2(gotStrategyBackups.createdAt, cutoffDate));
    const gvgResult = await db.delete(gvgStrategyBackups).where(lt2(gvgStrategyBackups.createdAt, cutoffDate));
    const totalDeleted = gotResult.rowsAffected || 0 + gvgResult.rowsAffected || 0;
    console.log(`[Backup] Limpeza de backups antigos conclu\xEDda: ${totalDeleted} registros removidos`);
    return totalDeleted;
  } catch (error) {
    console.error("[Backup] Erro ao limpar backups antigos:", error);
    return 0;
  }
}
var init_strategyBackup = __esm({
  "server/strategyBackup.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/backup.ts
var backup_exports = {};
__export(backup_exports, {
  listBackups: () => listBackups,
  performBackup: () => performBackup,
  restoreBackup: () => restoreBackup,
  scheduleBackups: () => scheduleBackups
});
import fs6 from "fs";
import path7 from "path";
function initBackupDir() {
  if (!fs6.existsSync(BACKUP_DIR)) {
    fs6.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log("[Backup] Diret\xF3rio de backups criado:", BACKUP_DIR);
  }
}
function getBackupFilename() {
  const now = /* @__PURE__ */ new Date();
  const timestamp2 = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `backup-${timestamp2}.json`;
}
async function exportDatabaseData() {
  try {
    const data = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0",
      tables: {
        gotStrategies: [],
        gvgStrategies: [],
        members: [],
        escalations: [],
        gotBattles: [],
        gvgBattles: [],
        reliquiaBattles: []
      }
    };
    console.log("[Backup] Dados preparados para backup");
    return data;
  } catch (error) {
    console.error("[Backup] Erro ao exportar dados:", error);
    throw error;
  }
}
async function saveBackup(data) {
  try {
    initBackupDir();
    const filename = getBackupFilename();
    const filepath = path7.join(BACKUP_DIR, filename);
    fs6.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`[Backup] Backup salvo: ${filename}`);
    return filepath;
  } catch (error) {
    console.error("[Backup] Erro ao salvar backup:", error);
    throw error;
  }
}
async function cleanOldBackups() {
  try {
    initBackupDir();
    const files = fs6.readdirSync(BACKUP_DIR);
    const now = Date.now();
    for (const file of files) {
      const filepath = path7.join(BACKUP_DIR, file);
      const stats = fs6.statSync(filepath);
      const ageMs = now - stats.mtime.getTime();
      const ageDays = ageMs / (1e3 * 60 * 60 * 24);
      if (ageDays > MAX_BACKUP_AGE_DAYS) {
        fs6.unlinkSync(filepath);
        console.log(`[Backup] Backup antigo removido: ${file} (${ageDays.toFixed(1)} dias)`);
      }
    }
  } catch (error) {
    console.error("[Backup] Erro ao limpar backups antigos:", error);
  }
}
async function performBackup() {
  try {
    console.log("[Backup] Iniciando backup autom\xE1tico...");
    const data = await exportDatabaseData();
    await saveBackup(data);
    await cleanOldBackups();
    console.log("[Backup] Backup conclu\xEDdo com sucesso!");
  } catch (error) {
    console.error("[Backup] Falha no backup autom\xE1tico:", error);
  }
}
function listBackups() {
  try {
    initBackupDir();
    const files = fs6.readdirSync(BACKUP_DIR);
    return files.filter((f) => f.startsWith("backup-") && f.endsWith(".json")).map((filename) => {
      const filepath = path7.join(BACKUP_DIR, filename);
      const stats = fs6.statSync(filepath);
      return {
        filename,
        date: stats.mtime,
        size: stats.size
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("[Backup] Erro ao listar backups:", error);
    return [];
  }
}
async function restoreBackup(filename) {
  try {
    const filepath = path7.join(BACKUP_DIR, filename);
    if (!fs6.existsSync(filepath)) {
      throw new Error(`Backup n\xE3o encontrado: ${filename}`);
    }
    const data = JSON.parse(fs6.readFileSync(filepath, "utf-8"));
    console.log(`[Backup] Backup restaurado: ${filename}`);
    return data;
  } catch (error) {
    console.error("[Backup] Erro ao restaurar backup:", error);
    throw error;
  }
}
function scheduleBackups() {
  performBackup().catch((e) => console.error("[Backup] Erro no backup inicial:", e));
  const interval = 24 * 60 * 60 * 1e3;
  setInterval(
    () => {
      performBackup().catch((e) => console.error("[Backup] Erro no backup agendado:", e));
    },
    interval
  );
  console.log("[Backup] Sistema de backup autom\xE1tico iniciado (a cada 24 horas)");
}
var BACKUP_DIR, MAX_BACKUP_AGE_DAYS;
var init_backup = __esm({
  "server/backup.ts"() {
    "use strict";
    BACKUP_DIR = path7.join(process.cwd(), "backups");
    MAX_BACKUP_AGE_DAYS = 7;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import path8 from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;

// server/_core/botHeartbeat.ts
import axios from "axios";
var botHealth = {
  isAlive: true,
  lastHeartbeat: Date.now(),
  messageCount: 0,
  uptime: 0,
  status: "healthy"
};
var recoveryAttempts = 0;
var MAX_RECOVERY_ATTEMPTS = 3;
var HEARTBEAT_TIMEOUT = 1e4;
async function checkBotHealth(token) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT);
    const response = await axios.get(
      `https://api.telegram.org/bot${token}/getMe`,
      {
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);
    if (response.status === 200 && response.data.ok) {
      botHealth.isAlive = true;
      botHealth.lastHeartbeat = Date.now();
      botHealth.uptime = Date.now() - (botHealth.lastHeartbeat - botHealth.uptime);
      botHealth.status = "healthy";
      recoveryAttempts = 0;
      console.log(
        `[Bot Heartbeat] \u2705 Bot saud\xE1vel - Mensagens: ${botHealth.messageCount}`
      );
    } else {
      throw new Error("Bot n\xE3o respondeu corretamente");
    }
  } catch (error) {
    console.error("[Bot Heartbeat] \u274C Bot n\xE3o respondendo:", error);
    botHealth.isAlive = false;
    botHealth.status = "dead";
    if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      recoveryAttempts++;
      console.log(
        `[Bot Heartbeat] \u{1F504} Tentativa de recupera\xE7\xE3o ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}`
      );
      await attemptBotRecovery(token);
    } else {
      console.error(
        "[Bot Heartbeat] \u26A0\uFE0F M\xE1ximo de tentativas de recupera\xE7\xE3o atingido"
      );
    }
  }
}
async function attemptBotRecovery(token) {
  try {
    console.log("[Bot Heartbeat] Tentando recuperar Bot...");
    await new Promise((resolve) => setTimeout(resolve, 5e3));
    const testResponse = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: "-1003466492984",
        // Grupo de teste
        text: "\u{1F916} Bot recuperado ap\xF3s falha"
      },
      { timeout: HEARTBEAT_TIMEOUT }
    );
    if (testResponse.status === 200) {
      console.log("[Bot Heartbeat] \u2705 Bot recuperado com sucesso!");
      botHealth.isAlive = true;
      botHealth.status = "healthy";
      recoveryAttempts = 0;
    }
  } catch (error) {
    console.error("[Bot Heartbeat] Falha na recupera\xE7\xE3o:", error);
  }
}
function getBotHealth() {
  return {
    ...botHealth,
    uptime: Date.now() - botHealth.lastHeartbeat
  };
}
async function resurrectBot(token) {
  try {
    console.log("[Bot Heartbeat] \u{1F504} Tentando ressuscitar Bot manualmente...");
    recoveryAttempts = 0;
    await checkBotHealth(token);
    if (botHealth.isAlive && botHealth.status === "healthy") {
      console.log("[Bot Heartbeat] \u2705 Bot ressuscitado com sucesso!");
      return true;
    } else {
      console.log("[Bot Heartbeat] \u26A0\uFE0F Bot ainda n\xE3o est\xE1 respondendo");
      return false;
    }
  } catch (error) {
    console.error("[Bot Heartbeat] \u274C Erro ao ressuscitar Bot:", error);
    return false;
  }
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto2) => proto2.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure;
var adminProcedure = t.procedure;

// server/systemBackupService.ts
init_db();
init_schema();
import { eq as eq2, sql as sql2 } from "drizzle-orm";
async function createSystemBackup(backupName, description, userId) {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        size: 0,
        error: "Database connection failed"
      };
    }
    const backupData = {
      timestamp: Date.now(),
      version: "1.0",
      tables: {}
    };
    const tablesToBackup = [
      "members",
      "gotStrategies",
      "gvgStrategies",
      "gotAttacks",
      "gvgAttacks",
      "reliquiasBossProgress",
      "reliquiasDamage",
      "reliquiasMemberAssignments",
      "reliquiasMemberRoles",
      "reliquiasSeasons",
      "schedules",
      "scheduleEntries",
      "announcements",
      "announcementRecipients",
      "eventTypes",
      "gvgSeasons",
      "gvgMatchInfo",
      "performanceRecords",
      "nonAttackerAlerts",
      "screenshotUploads"
    ];
    for (const tableName of tablesToBackup) {
      try {
        const result2 = await db.execute(sql2.raw(`SELECT * FROM ${tableName}`));
        backupData.tables[tableName] = result2 || [];
      } catch (error) {
        console.warn(`[Backup] Erro ao fazer backup da tabela ${tableName}:`, error);
      }
    }
    const backupJson = JSON.stringify(backupData);
    const backupSize = Buffer.byteLength(backupJson, "utf-8");
    const result = await db.insert(systemBackups).values({
      backupName,
      description,
      backupData: backupJson,
      backupSize,
      backupType: "manual",
      createdBy: userId
    });
    console.log(`[Backup] Backup completo criado: ${backupName} (${backupSize} bytes)`);
    return {
      success: true,
      backupId: result[0].insertId,
      size: backupSize
    };
  } catch (error) {
    console.error("[Backup] Erro ao criar backup:", error);
    return {
      success: false,
      size: 0,
      error: String(error)
    };
  }
}
async function listSystemBackups() {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }
    const backups2 = await db.select().from(systemBackups).orderBy(systemBackups.createdAt);
    return backups2.map((backup) => ({
      id: backup.id,
      backupName: backup.backupName,
      description: backup.description,
      backupSize: backup.backupSize,
      backupType: backup.backupType,
      createdAt: backup.createdAt,
      createdBy: backup.createdBy
    }));
  } catch (error) {
    console.error("[Backup] Erro ao listar backups:", error);
    return [];
  }
}
async function getSystemBackup(backupId) {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }
    const backup = await db.select().from(systemBackups).where(eq2(systemBackups.id, backupId)).limit(1);
    if (backup.length === 0) {
      throw new Error(`Backup ${backupId} n\xE3o encontrado`);
    }
    return backup[0];
  } catch (error) {
    console.error("[Backup] Erro ao obter backup:", error);
    return null;
  }
}
async function restoreSystemBackup(backupId, userId) {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }
    const backup = await getSystemBackup(backupId);
    if (!backup) {
      return {
        success: false,
        error: `Backup ${backupId} n\xE3o encontrado`
      };
    }
    let backupData;
    try {
      backupData = JSON.parse(backup.backupData);
    } catch (error) {
      return {
        success: false,
        error: "Dados de backup corrompidos"
      };
    }
    let tablesRestored = 0;
    for (const [tableName, rows] of Object.entries(backupData.tables)) {
      try {
        if (!Array.isArray(rows) || rows.length === 0) {
          continue;
        }
        await db.execute(sql2.raw(`TRUNCATE TABLE ${tableName}`));
        const columns = Object.keys(rows[0]);
        const values = rows.map((row) => {
          const vals = columns.map((col) => {
            const val = row[col];
            if (val === null) return "NULL";
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === "boolean") return val ? "1" : "0";
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });
          return `(${vals.join(",")})`;
        }).join(",");
        const insertSql = `INSERT INTO ${tableName} (${columns.join(",")}) VALUES ${values}`;
        await db.execute(sql2.raw(insertSql));
        tablesRestored++;
        console.log(`[Backup] Tabela ${tableName} restaurada (${rows.length} registros)`);
      } catch (error) {
        console.warn(`[Backup] Erro ao restaurar tabela ${tableName}:`, error);
      }
    }
    console.log(`[Backup] Restaura\xE7\xE3o completa: ${tablesRestored} tabelas restauradas`);
    return {
      success: true,
      tablesRestored
    };
  } catch (error) {
    console.error("[Backup] Erro ao restaurar backup:", error);
    return {
      success: false,
      error: String(error)
    };
  }
}
async function deleteSystemBackup(backupId) {
  try {
    const db = await getDb();
    if (!db) {
      return false;
    }
    await db.delete(systemBackups).where(eq2(systemBackups.id, backupId));
    console.log(`[Backup] Backup ${backupId} deletado`);
    return true;
  } catch (error) {
    console.error("[Backup] Erro ao deletar backup:", error);
    return false;
  }
}
async function exportBackupAsJson(backupId) {
  try {
    const backup = await getSystemBackup(backupId);
    if (!backup) {
      return null;
    }
    const exportData = {
      backupName: backup.backupName,
      description: backup.description,
      createdAt: backup.createdAt,
      data: JSON.parse(backup.backupData)
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("[Backup] Erro ao exportar backup:", error);
    return null;
  }
}

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  }),
  // Sistema de Backup Completo
  createBackup: adminProcedure.input(
    z.object({
      backupName: z.string().min(1, "backup name is required"),
      description: z.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const result = await createSystemBackup(
      input.backupName,
      input.description || "",
      ctx.user.id
    );
    return result;
  }),
  listBackups: adminProcedure.query(async () => {
    const backups2 = await listSystemBackups();
    return backups2;
  }),
  getBackup: adminProcedure.input(z.object({ backupId: z.number() })).query(async ({ input }) => {
    const backup = await getSystemBackup(input.backupId);
    return backup;
  }),
  restoreBackup: adminProcedure.input(z.object({ backupId: z.number() })).mutation(async ({ input, ctx }) => {
    const result = await restoreSystemBackup(input.backupId, ctx.user.id);
    return result;
  }),
  deleteBackup: adminProcedure.input(z.object({ backupId: z.number() })).mutation(async ({ input }) => {
    const success = await deleteSystemBackup(input.backupId);
    return { success };
  }),
  exportBackup: adminProcedure.input(z.object({ backupId: z.number() })).query(async ({ input }) => {
    const json = await exportBackupAsJson(input.backupId);
    return { json };
  })
});

// server/routers.ts
init_db();
import { z as z8 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/telegram.ts
init_db();
import axios2 from "axios";
var TELEGRAM_API_BASE = "https://api.telegram.org/bot";
async function sendTelegramMessage(chatId, text2, parseMode = "HTML") {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }
  try {
    const response = await axios2.post(
      `${TELEGRAM_API_BASE}${config.telegramBotToken}/sendMessage`,
      {
        chat_id: chatId,
        text: text2,
        parse_mode: parseMode
      }
    );
    return response.data.ok;
  } catch (error) {
    console.error("[Telegram] Failed to send message:", error);
    return false;
  }
}
async function sendTelegramMessageDirect(token, chatId, text2, parseMode = "HTML") {
  try {
    const response = await axios2.post(
      `${TELEGRAM_API_BASE}${token}/sendMessage`,
      {
        chat_id: chatId,
        text: text2,
        parse_mode: parseMode
      }
    );
    return response.data.ok;
  } catch (error) {
    console.error("[Telegram] Failed to send direct message:", error);
    return false;
  }
}
async function sendPrivateMessage(memberChatId, text2) {
  return sendTelegramMessage(memberChatId, text2);
}
async function sendPrivateMessages(members2, text2) {
  let success = 0;
  let failed = 0;
  for (const member of members2) {
    const sent = await sendPrivateMessage(member.chatId, text2);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return { success, failed };
}
async function sendScheduleNotification(eventName, eventTime, memberNames, groupChatId) {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }
  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    console.warn("[Telegram] No group chat ID configured");
    return false;
  }
  const memberList = memberNames.map((name, i) => `${i + 1}. ${name}`).join("\n");
  const message = `\u{1F3C6} <b>${eventName} - Escala\xE7\xE3o de Hoje</b>

\u23F0 <b>Hor\xE1rio:</b> ${eventTime}

<b>\u{1F6E1}\uFE0F Escalados salvem suas defesas!</b>
${memberList}

\u2705 Confirme sua presen\xE7a!`;
  return sendTelegramMessage(chatId, message);
}
async function sendAnnouncementNotification(title, message, memberNames, groupChatId) {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }
  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    console.warn("[Telegram] No group chat ID configured");
    return false;
  }
  const memberList = memberNames.length > 0 ? `

<b>Destinat\xE1rios (${memberNames.length}):</b>
${memberNames.map((name) => `\u2022 ${name}`).join("\n")}` : "";
  const fullMessage = `\u{1F4E2} <b>${title}</b>

${message}${memberList}`;
  return sendTelegramMessage(chatId, fullMessage);
}
async function sendGeneralAnnouncement(title, message, groupChatId) {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }
  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    console.warn("[Telegram] No group chat ID configured");
    return false;
  }
  const fullMessage = `\u{1F4E2} <b>${title}</b>

${message}`;
  return sendTelegramMessage(chatId, fullMessage);
}
async function sendNonAttackerAlert(eventName, eventDate, nonAttackers, groupChatId) {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }
  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }
  const memberList = nonAttackers.map((name) => `\u274C ${name}`).join("\n");
  const message = `\u26A0\uFE0F <b>ALERTA - Membros que N\xC3O atacaram</b>

\u{1F4C5} <b>Evento:</b> ${eventName}
\u{1F4C6} <b>Data:</b> ${eventDate}

<b>N\xE3o atacaram (${nonAttackers.length}):</b>
${memberList}`;
  return sendTelegramMessage(chatId, message);
}
async function testBotConnection(token) {
  try {
    const response = await axios2.get(
      `${TELEGRAM_API_BASE}${token}/getMe`
    );
    if (response.data.ok && response.data.result) {
      return {
        success: true,
        botName: response.data.result.username
      };
    }
    return { success: false, error: "Invalid response from Telegram" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
function validateBotToken(token) {
  const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
  return tokenRegex.test(token);
}
function validateBotUsername(username) {
  return username.toLowerCase().endsWith("bot");
}
async function sendReliquiasReminder(bossName, minutesBefore, bossAttackers, guardsAttackers, groupChatId) {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }
  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }
  const bossListText = bossAttackers.length > 0 ? bossAttackers.map((name) => `\u2694\uFE0F ${name}`).join("\n") : "Nenhum";
  const sortedGuardsAttackers = [...guardsAttackers].sort((a, b) => {
    const minA = Math.min(a.guard1 || 999, a.guard2 || 999);
    const minB = Math.min(b.guard1 || 999, b.guard2 || 999);
    return minA - minB;
  });
  const guardsListText = sortedGuardsAttackers.length > 0 ? sortedGuardsAttackers.map((g) => {
    const guards = [g.guard1, g.guard2].filter((n) => n != null).sort((a, b) => a - b).join(" e ");
    return `\u{1F6E1}\uFE0F ${g.name}${guards ? ` (Guardas: ${guards})` : ""}`;
  }).join("\n") : "Nenhum";
  const message = `\u23F0 <b>REL\xCDQUIAS - ${bossName} em ${minutesBefore} minutos!</b>

<b>\u{1F3AF} Atacando Boss (${bossAttackers.length}):</b>
${bossListText}

<b>\u{1F6E1}\uFE0F Atacando Guardas (${guardsAttackers.length}):</b>
${guardsListText}

Preparem-se! \u{1F4AA}`;
  return sendTelegramMessage(chatId, message);
}
async function sendAutomaticGotReminder(eventDate, nonAttackerNames, customMessage) {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }
  const defaultMessage = "\u2694\uFE0F *LEMBRETE GoT*\n\nFavor quem ainda n\xE3o atacou, atacar por gentileza!\n\n\u{1F550} O tempo est\xE1 passando...";
  const message = customMessage || defaultMessage;
  const fullMessage = `${message}

\u{1F4CB} *Ainda n\xE3o atacaram (${nonAttackerNames.length}):*
${nonAttackerNames.join(", ") || "Todos j\xE1 atacaram! \u{1F389}"}`;
  try {
    const response = await axios2.post(
      `${TELEGRAM_API_BASE}${config.telegramBotToken}/sendMessage`,
      {
        chat_id: config.telegramGroupId,
        text: fullMessage,
        parse_mode: "Markdown"
      }
    );
    return response.data.ok;
  } catch (error) {
    console.error("[Telegram] Failed to send automatic reminder:", error);
    return false;
  }
}

// server/imageAnalysis.ts
init_llm();
async function analyzeGvgScreenshot(imageUrl) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Voc\xEA \xE9 um assistente especializado em extrair dados de screenshots do jogo Saint Seiya: Lendas da Justi\xE7a.
          
Analise a imagem do "Registro de Combate" da GvG e extraia os dados de cada jogador.

Formato da tela:
- Nome do jogador na primeira coluna (pode ter caracteres especiais como \u795E, \u6771, \u26A1)
- Primeiro Ataque: nome do oponente em vermelho + estrelas (\u25C6 cheias = conquistadas, \u25C7 vazias = n\xE3o conquistadas)
- Segundo Ataque: nome do oponente em vermelho + estrelas

Regras:
- Conte apenas estrelas CHEIAS (\u25C6) como conquistadas
- Se n\xE3o houver informa\xE7\xE3o de ataque (linha vazia), o jogador n\xE3o atacou
- M\xE1ximo de 3 estrelas por ataque

Retorne um JSON array com os dados extra\xEDdos.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados de ataque de cada jogador desta imagem do Registro de Combate da GvG."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "gvg_attacks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              attacks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerName: { type: "string", description: "Nome do jogador" },
                    attack1Stars: { type: "integer", description: "Estrelas do primeiro ataque (0-3)" },
                    attack1Opponent: { type: ["string", "null"], description: "Nome do oponente do primeiro ataque" },
                    attack2Stars: { type: "integer", description: "Estrelas do segundo ataque (0-3)" },
                    attack2Opponent: { type: ["string", "null"], description: "Nome do oponente do segundo ataque" },
                    didNotAttack: { type: "boolean", description: "True se o jogador n\xE3o fez nenhum ataque" }
                  },
                  required: ["playerName", "attack1Stars", "attack1Opponent", "attack2Stars", "attack2Opponent", "didNotAttack"],
                  additionalProperties: false
                }
              }
            },
            required: ["attacks"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.error("[ImageAnalysis] No content in LLM response");
      return [];
    }
    const parsed = JSON.parse(content);
    return parsed.attacks || [];
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze GvG screenshot:", error);
    return [];
  }
}
async function analyzeGotScreenshot(imageUrl) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Voc\xEA \xE9 um assistente especializado em extrair dados de screenshots do jogo Saint Seiya: Lendas da Justi\xE7a.
          
Analise a imagem da "Lista de Membros" do GoT (Guerra dos Tit\xE3s) e extraia os dados de cada jogador.

Formato da tela:
- Ranking (1, 2, 3...)
- Nome do jogador (pode ter caracteres especiais como \u795E, \u6771, \u26A1)
- Poder (ex: 920M, 994M)
- Gravar: Ataque (X vit\xF3rias / Y derrotas) e Defesa (X vit\xF3rias / Y derrotas)
- Pontos totais

Regras:
- Vit\xF3rias aparecem em verde, derrotas em vermelho
- Se ataque tem 0 vit\xF3rias E 0 derrotas, o jogador n\xE3o atacou
- Pontos 0 geralmente indica que n\xE3o participou

Retorne um JSON array com os dados extra\xEDdos.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados de cada jogador desta imagem da Lista de Membros do GoT."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "got_attacks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              attacks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerName: { type: "string", description: "Nome do jogador" },
                    ranking: { type: "integer", description: "Posi\xE7\xE3o no ranking" },
                    power: { type: "string", description: "Poder do jogador (ex: 920M)" },
                    attackVictories: { type: "integer", description: "Vit\xF3rias no ataque" },
                    attackDefeats: { type: "integer", description: "Derrotas no ataque" },
                    defenseVictories: { type: "integer", description: "Vit\xF3rias na defesa" },
                    defenseDefeats: { type: "integer", description: "Derrotas na defesa" },
                    points: { type: "integer", description: "Pontos totais" },
                    didNotAttack: { type: "boolean", description: "True se o jogador n\xE3o atacou (0 vit\xF3rias no ataque)" }
                  },
                  required: ["playerName", "ranking", "power", "attackVictories", "attackDefeats", "defenseVictories", "defenseDefeats", "points", "didNotAttack"],
                  additionalProperties: false
                }
              }
            },
            required: ["attacks"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.error("[ImageAnalysis] No content in LLM response");
      return [];
    }
    const parsed = JSON.parse(content);
    return parsed.attacks || [];
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze GoT screenshot:", error);
    return [];
  }
}
function matchPlayerToMember(playerName, members2) {
  const normalize = (name) => {
    return name.toLowerCase().replace(/[神東⚡🔥💀👑🎮]/g, "").replace(/[^a-z0-9]/g, "").trim();
  };
  const normalizedPlayerName = normalize(playerName);
  for (const member of members2) {
    if (normalize(member.name) === normalizedPlayerName) {
      return member;
    }
  }
  for (const member of members2) {
    const normalizedMemberName = normalize(member.name);
    if (normalizedMemberName.includes(normalizedPlayerName) || normalizedPlayerName.includes(normalizedMemberName)) {
      return member;
    }
  }
  return null;
}
async function analyzeReliquiasScreenshot(imageUrl) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Voc\xEA \xE9 um assistente especializado em extrair dados de screenshots do jogo Saint Seiya: Lendas da Justi\xE7a.
          
Analise a imagem do "Ranking de Dano" das Rel\xEDquias e extraia os dados de cada jogador.

Formato da tela:
- Ranking (1, 2, 3...)
- Nome do jogador (pode ter caracteres especiais como \u795E, \u6771, \u26A1)
- Poder (ex: 859M, 920M)
- Dano Acumulado (ex: 2143B, 2086B, 1810B)

Regras:
- O dano acumulado \xE9 mostrado em formato abreviado (B = bilh\xF5es)
- Extraia o valor num\xE9rico do dano para ordena\xE7\xE3o (ex: "2143B" = 2143)
- Se o dano for em milh\xF5es (M), converta para bilh\xF5es (ex: "500M" = 0.5)

Retorne um JSON array com os dados extra\xEDdos.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados de dano de cada jogador desta imagem do Ranking de Dano das Rel\xEDquias."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "reliquias_damage",
          strict: true,
          schema: {
            type: "object",
            properties: {
              damages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerName: { type: "string", description: "Nome do jogador" },
                    ranking: { type: "integer", description: "Posi\xE7\xE3o no ranking" },
                    power: { type: "string", description: "Poder do jogador (ex: 859M)" },
                    cumulativeDamage: { type: "string", description: "Dano acumulado (ex: 2143B)" },
                    damageNumeric: { type: "number", description: "Valor num\xE9rico do dano em bilh\xF5es" }
                  },
                  required: ["playerName", "ranking", "power", "cumulativeDamage", "damageNumeric"],
                  additionalProperties: false
                }
              }
            },
            required: ["damages"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.error("[ImageAnalysis] No content in LLM response");
      return [];
    }
    const parsed = JSON.parse(content);
    return parsed.damages || [];
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze Reliquias screenshot:", error);
    return [];
  }
}

// server/routers.ts
init_llm();

// server/routers/recommendations.ts
init_db();
init_llm();
import { z as z2 } from "zod";
import { TRPCError as TRPCError2 } from "@trpc/server";
var recommendationsRouter = router({
  getCardRecommendations: publicProcedure.input(z2.object({
    characterId: z2.number(),
    characterName: z2.string(),
    characterClass: z2.string(),
    characterType: z2.string(),
    hp: z2.number().optional(),
    atk: z2.number().optional(),
    def: z2.number().optional()
  })).mutation(async ({ input }) => {
    try {
      const allCards = await getAllCards();
      if (allCards.length === 0) {
        return {
          success: true,
          recommendations: [],
          message: "Nenhuma carta cadastrada no sistema"
        };
      }
      const cardsDescription = allCards.map((card) => {
        const dmg = card.bonusDmg ? parseFloat(card.bonusDmg) : 0;
        const def = card.bonusDef ? parseFloat(card.bonusDef) : 0;
        return `- ${card.name}: DMG=${dmg}, DEF=${def}, Efeito: ${card.skillEffect || "N/A"}`;
      }).join("\n");
      const prompt = `Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a.

Cavaleiro Analisado:
- Nome: ${input.characterName}
- Classe: ${input.characterClass}
- Tipo: ${input.characterType}
- HP: ${input.hp || "N/A"}
- ATK: ${input.atk || "N/A"}
- DEF: ${input.def || "N/A"}

Observe que as cartas t\xEAm b\xF4nus em diferentes atributos (DMG, DEF, Vid\xE2ncia, Press\xE3o, Esquiva, Vel.Ataque, Tenacidade, Sanguessuga, RedDano, TaxCrit).

Cartas Dispon\xEDveis:
${cardsDescription}

Analise os atributos do cavaleiro e recomende as 3-5 melhores cartas para ele. Para cada recomenda\xE7\xE3o, explique brevemente por que essa carta \xE9 ideal.

Responda em formato JSON com a seguinte estrutura:
{
  "recommendations": [
    {
      "cardName": "nome da carta",
      "reason": "explica\xE7\xE3o breve de por que essa carta \xE9 ideal",
      "priority": "Alta/M\xE9dia/Baixa"
    }
  ],
  "analysis": "an\xE1lise geral do cavaleiro e sua melhor estrat\xE9gia de cartas"
}`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a e recomenda cartas ideais para cavaleiros." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "card_recommendations",
            strict: true,
            schema: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      cardName: { type: "string" },
                      reason: { type: "string" },
                      priority: { type: "string", enum: ["Alta", "M\xE9dia", "Baixa"] }
                    },
                    required: ["cardName", "reason", "priority"]
                  }
                },
                analysis: { type: "string" }
              },
              required: ["recommendations", "analysis"]
            }
          }
        }
      });
      const content = response.choices[0].message.content;
      const recommendations = typeof content === "string" ? JSON.parse(content) : content;
      const enrichedRecommendations = recommendations.recommendations.map((rec) => {
        const card = allCards.find((c) => c.name.toLowerCase() === rec.cardName.toLowerCase() || c.name.toLowerCase().includes(rec.cardName.toLowerCase()));
        return {
          ...rec,
          cardId: card?.id || null,
          cardData: card || null
        };
      });
      return {
        success: true,
        recommendations: enrichedRecommendations,
        analysis: recommendations.analysis,
        characterName: input.characterName
      };
    } catch (error) {
      console.error("[Recommendations] Erro ao gerar recomenda\xE7\xF5es:", error);
      throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao gerar recomenda\xE7\xF5es com IA" });
    }
  })
});

// server/routers/aiChat.ts
init_llm();
init_db();
import { z as z3 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
var chatSessions = /* @__PURE__ */ new Map();
var aiChatRouter = router({
  sendMessage: publicProcedure.input(z3.object({
    sessionId: z3.string(),
    message: z3.string(),
    context: z3.string().optional().default("general")
    // 'general', 'strategy', 'card'
  })).mutation(async ({ input }) => {
    try {
      const { sessionId, message, context } = input;
      if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, []);
      }
      const history = chatSessions.get(sessionId);
      history.push({ role: "user", content: message });
      let systemPrompt = "Voc\xEA \xE9 um assistente especializado em Saint Seiya: Lendas da Justi\xE7a.";
      let contextInfo = "";
      if (context === "strategy") {
        systemPrompt += " Voc\xEA ajuda a analisar e melhorar estrat\xE9gias de combate, recomendando cavaleiros, cartas e composi\xE7\xF5es.";
      } else if (context === "card") {
        systemPrompt += " Voc\xEA \xE9 especialista em cartas do jogo, ajudando a escolher as melhores cartas para cada situa\xE7\xE3o. IMPORTANTE: Voc\xEA DEVE usar APENAS as informa\xE7\xF5es das cartas fornecidas abaixo. N\xC3O invente ou alucinhe informa\xE7\xF5es sobre cartas que n\xE3o est\xE3o na lista.";
        try {
          const allCards = await getAllCards();
          if (allCards && allCards.length > 0) {
            contextInfo = "\n\nCARTAS DISPON\xCDVEIS NO SISTEMA:\n";
            allCards.forEach((card) => {
              contextInfo += `
- **${card.name}**
`;
              contextInfo += `  Uso: ${card.usageLimit}
`;
              if (card.bonusDmg && card.bonusDmg !== "0") contextInfo += `  DMG: +${card.bonusDmg}%
`;
              if (card.bonusDef && card.bonusDef !== "0") contextInfo += `  Defesa: +${card.bonusDef}%
`;
              if (card.bonusVid && card.bonusVid !== "0") contextInfo += `  Resist\xEAncia: +${card.bonusVid}%
`;
              if (card.bonusPress && card.bonusPress !== "0") contextInfo += `  Pressa: +${card.bonusPress}
`;
              if (card.bonusEsquiva && card.bonusEsquiva !== "0") contextInfo += `  Esquiva: +${card.bonusEsquiva}%
`;
              if (card.bonusVelAtaq && card.bonusVelAtaq !== "0") contextInfo += `  Vel. Ataque: +${card.bonusVelAtaq}%
`;
              if (card.bonusTenacidade && card.bonusTenacidade !== "0") contextInfo += `  Tenacidade: +${card.bonusTenacidade}
`;
              if (card.bonusSanguessuga && card.bonusSanguessuga !== "0") contextInfo += `  Sanguessuga: +${card.bonusSanguessuga}
`;
              if (card.bonusRedDano && card.bonusRedDano !== "0") contextInfo += `  Red. Dano: +${card.bonusRedDano}%
`;
              if (card.bonusCrit && card.bonusCrit !== "0") contextInfo += `  Tax. Cr\xEDtico: +${card.bonusCrit}
`;
              if (card.bonusCura && card.bonusCura !== "0") contextInfo += `  Cura: +${card.bonusCura}%
`;
              if (card.bonusCuraRecebida && card.bonusCuraRecebida !== "0") contextInfo += `  Cura Recebida: +${card.bonusCuraRecebida}%
`;
              if (card.bonusPrecisao && card.bonusPrecisao !== "0") contextInfo += `  Precis\xE3o: +${card.bonusPrecisao}
`;
              if (card.skillEffect) contextInfo += `  Efeito: ${card.skillEffect}
`;
            });
          }
        } catch (error) {
          console.error("[AI Chat] Erro ao buscar cartas:", error);
        }
      } else {
        systemPrompt += " Voc\xEA responde perguntas sobre o jogo, cavaleiros, estrat\xE9gias e cartas de forma concisa e \xFAtil.";
      }
      systemPrompt += contextInfo;
      const recentHistory = history.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content
      }));
      if (context === "card" && recentHistory.length > 0) {
        recentHistory[recentHistory.length - 1].content += "\n\n[IMPORTANTE: Responda APENAS com base nas cartas listadas acima. Se a carta n\xE3o estiver na lista, diga que ela n\xE3o est\xE1 cadastrada no sistema.]";
      }
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...recentHistory
        ]
      });
      const assistantMessage = typeof response.choices[0].message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content);
      history.push({ role: "assistant", content: assistantMessage });
      if (history.length > 50) {
        chatSessions.set(sessionId, history.slice(-50));
      }
      let cardImage = null;
      if (context === "card") {
        try {
          const allCards = await getAllCards();
          const userMessageLower = message.toLowerCase();
          const matchedCard = allCards.find(
            (card) => userMessageLower.includes(card.name.toLowerCase())
          );
          if (matchedCard && matchedCard.imageUrl) {
            cardImage = matchedCard.imageUrl;
          }
        } catch (error) {
          console.error("[AI Chat] Erro ao buscar imagem da carta:", error);
        }
      }
      return {
        success: true,
        response: assistantMessage,
        messageCount: history.length,
        cardImage: cardImage || void 0
      };
    } catch (error) {
      console.error("[AI Chat] Erro ao processar mensagem:", error);
      throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao processar mensagem com IA" });
    }
  }),
  getHistory: publicProcedure.input(z3.object({
    sessionId: z3.string()
  })).query(({ input }) => {
    const history = chatSessions.get(input.sessionId) || [];
    return history;
  }),
  clearSession: publicProcedure.input(z3.object({
    sessionId: z3.string()
  })).mutation(({ input }) => {
    chatSessions.delete(input.sessionId);
    return { success: true };
  })
});

// server/routers/arayashikiAnalysis.ts
import { z as z4 } from "zod";
init_db();
init_llm();
var arayashikiAnalysisRouter = router({
  /**
   * Listar todas as cartas
   */
  listAll: publicProcedure.query(async () => {
    try {
      const cards2 = await getAllArayashikis();
      return {
        success: true,
        data: cards2,
        count: Array.isArray(cards2) ? cards2.length : 0
      };
    } catch (error) {
      console.error("[Arayashiki Analysis] Erro ao listar cartas:", error);
      return {
        success: false,
        data: [],
        count: 0,
        error: "Erro ao listar cartas"
      };
    }
  }),
  /**
   * Buscar cartas por nome ou atributo
   */
  search: publicProcedure.input(z4.object({
    query: z4.string().min(1)
  })).query(async ({ input }) => {
    try {
      const cards2 = await searchArayashikis(input.query);
      return {
        success: true,
        data: cards2,
        count: Array.isArray(cards2) ? cards2.length : 0
      };
    } catch (error) {
      console.error("[Arayashiki Analysis] Erro ao buscar cartas:", error);
      return {
        success: false,
        data: [],
        count: 0,
        error: "Erro ao buscar cartas"
      };
    }
  }),
  /**
   * Analisar cartas para um cavaleiro com IA
   */
  analyzeForCharacter: publicProcedure.input(z4.object({
    characterName: z4.string().min(1),
    characterAttributes: z4.object({
      hp: z4.number().optional(),
      atk: z4.number().optional(),
      def: z4.number().optional(),
      tenacity: z4.number().optional()
    }).optional()
  })).query(async ({ input }) => {
    try {
      const allCards = await getAllArayashikis();
      const cardsData = Array.isArray(allCards) ? allCards : [];
      const cardsText = cardsData.slice(0, 50).map((card) => `- ${card.name} (${card.quality}, ${card.attribute})`).join("\n");
      const prompt = `Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a.

Analisando o cavaleiro: ${input.characterName}
${input.characterAttributes ? `Atributos: HP=${input.characterAttributes.hp}, ATK=${input.characterAttributes.atk}, DEF=${input.characterAttributes.def}, Tenacity=${input.characterAttributes.tenacity}` : ""}

Cartas dispon\xEDveis:
${cardsText}

Recomende as 5 melhores cartas para este cavaleiro, explicando por qu\xEA. Considere sinergias, atributos e estrat\xE9gia.`;
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Voc\xEA \xE9 um especialista em an\xE1lise de cartas para Saint Seiya: Lendas da Justi\xE7a. Forne\xE7a recomenda\xE7\xF5es precisas e bem fundamentadas."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      let analysis = "Desculpe, n\xE3o consegui gerar an\xE1lise.";
      if (response.choices?.[0]?.message?.content) {
        const content = response.choices[0].message.content;
        analysis = Array.isArray(content) ? content.map((c) => c.text || "").join("\n") : String(content);
      }
      return {
        success: true,
        characterName: input.characterName,
        analysis,
        cardsCount: cardsData.length
      };
    } catch (error) {
      console.error("[Arayashiki Analysis] Erro ao analisar cartas:", error);
      return {
        success: false,
        error: "Erro ao analisar cartas com IA"
      };
    }
  }),
  /**
   * Analisar sinergia entre cartas com IA
   */
  analyzeSynergy: publicProcedure.input(z4.object({
    card1Name: z4.string().min(1),
    card2Name: z4.string().min(1),
    characterName: z4.string().optional()
  })).query(async ({ input }) => {
    try {
      const prompt = `Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a.

Analise a sinergia entre estas duas cartas:
- Carta 1: ${input.card1Name}
- Carta 2: ${input.card2Name}
${input.characterName ? `- Cavaleiro: ${input.characterName}` : ""}

Explique:
1. Como essas cartas funcionam juntas
2. Qual \xE9 o n\xEDvel de sinergia (baixa, m\xE9dia, alta)
3. Em quais situa\xE7\xF5es s\xE3o mais eficazes
4. Poss\xEDveis melhorias ou alternativas`;
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Voc\xEA \xE9 um especialista em an\xE1lise de sinergias de cartas para Saint Seiya: Lendas da Justi\xE7a."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      let analysis = "Desculpe, n\xE3o consegui gerar an\xE1lise de sinergia.";
      if (response.choices?.[0]?.message?.content) {
        const content = response.choices[0].message.content;
        analysis = Array.isArray(content) ? content.map((c) => c.text || "").join("\n") : String(content);
      }
      return {
        success: true,
        card1: input.card1Name,
        card2: input.card2Name,
        analysis
      };
    } catch (error) {
      console.error("[Arayashiki Analysis] Erro ao analisar sinergia:", error);
      return {
        success: false,
        error: "Erro ao analisar sinergia com IA"
      };
    }
  }),
  /**
   * Gerar composição de cartas otimizada com IA
   */
  generateOptimalBuild: publicProcedure.input(z4.object({
    characterName: z4.string().min(1),
    role: z4.enum(["attacker", "defender", "support"]),
    budget: z4.enum(["low", "medium", "high"]).optional()
  })).query(async ({ input }) => {
    try {
      const allCards = await getAllArayashikis();
      const cardsData = Array.isArray(allCards) ? allCards : [];
      const cardsText = cardsData.slice(0, 50).map((card) => `- ${card.name} (${card.quality}, ${card.attribute})`).join("\n");
      const prompt = `Voc\xEA \xE9 um especialista em constru\xE7\xE3o de decks para Saint Seiya: Lendas da Justi\xE7a.

Crie uma composi\xE7\xE3o otimizada de cartas para:
- Cavaleiro: ${input.characterName}
- Papel: ${input.role === "attacker" ? "Atacante" : input.role === "defender" ? "Defensor" : "Suporte"}
${input.budget ? `- Or\xE7amento: ${input.budget === "low" ? "Baixo (cartas comuns)" : input.budget === "medium" ? "M\xE9dio" : "Alto (cartas raras)"}` : ""}

Cartas dispon\xEDveis:
${cardsText}

Recomende 5 cartas que funcionem bem juntas, explicando a estrat\xE9gia geral do deck.`;
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Voc\xEA \xE9 um especialista em constru\xE7\xE3o de decks otimizados para Saint Seiya: Lendas da Justi\xE7a."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      let build = "Desculpe, n\xE3o consegui gerar composi\xE7\xE3o.";
      if (response.choices?.[0]?.message?.content) {
        const content = response.choices[0].message.content;
        build = Array.isArray(content) ? content.map((c) => c.text || "").join("\n") : String(content);
      }
      return {
        success: true,
        characterName: input.characterName,
        role: input.role,
        build
      };
    } catch (error) {
      console.error("[Arayashiki Analysis] Erro ao gerar build:", error);
      return {
        success: false,
        error: "Erro ao gerar composi\xE7\xE3o otimizada"
      };
    }
  })
});

// server/routers/arayashikiSync.ts
import { z as z5 } from "zod";

// server/scrapers/arayashiki-scraper.ts
import axios3 from "axios";
import * as cheerio from "cheerio";
async function scrapeArayashikiList() {
  try {
    console.log("[Arayashiki Scraper] Iniciando scrape de cartas...");
    const response = await axios3.get("https://ssloj.com/arayashikis", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      timeout: 15e3
    });
    const $ = cheerio.load(response.data);
    const cards2 = [];
    $('a[href*="/arayashikis/"]').each((index, element) => {
      const href = $(element).attr("href");
      if (href && !href.includes("back") && href !== "/arayashikis") {
        const cardId = href.split("/").pop();
        if (cardId && cardId.length > 0) {
          const sourceUrl = `https://ssloj.com${href}`;
          cards2.push({
            id: cardId,
            namePortuguese: "",
            nameEnglish: "",
            description: "",
            rarity: 0,
            quality: "common",
            attributes: {},
            recommendedCharacters: [],
            xpRequired: 0,
            imageUrl: "",
            sourceUrl
          });
        }
      }
    });
    console.log(`[Arayashiki Scraper] Encontradas ${cards2.length} cartas`);
    return cards2;
  } catch (error) {
    console.error("[Arayashiki Scraper] Erro ao fazer scrape da lista:", error);
    return [];
  }
}
async function scrapeCardDetails(cardUrl) {
  try {
    console.log(`[Arayashiki Scraper] Extraindo detalhes: ${cardUrl}`);
    const response = await axios3.get(cardUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      timeout: 15e3
    });
    const $ = cheerio.load(response.data);
    const cardId = cardUrl.split("/").pop() || "";
    const namePortuguese = $('h1, .card-title, [class*="name"]').first().text().trim() || "Unknown";
    const description = $('p, div[class*="description"], .card-description, [class*="effect"]').filter((i, el) => {
      const text2 = $(el).text();
      return text2.length > 20;
    }).first().text().trim();
    const starCount = $("span").filter((i, el) => {
      const text2 = $(el).text();
      return text2.includes("\u2B50");
    }).length;
    const rarity = Math.min(starCount || 1, 6);
    let quality = "common";
    if (rarity >= 5) quality = "legendary";
    else if (rarity >= 4) quality = "epic";
    else if (rarity >= 3) quality = "rare";
    const attributes = {};
    const pageText = $.text();
    const dmgMatch = pageText.match(/(?:DMG|Dano|Damage|Bôn\.?\s*DMG)[:\s]+([0-9.]+)%?/i);
    if (dmgMatch) attributes.dmgBoost = parseFloat(dmgMatch[1]);
    const precisionMatch = pageText.match(/(?:Precisão|Precision|Hit)[:\s]+([0-9.]+)/i);
    if (precisionMatch) attributes.precision = parseFloat(precisionMatch[1]);
    const atkSpeedMatch = pageText.match(/(?:Vel\.?\s*Ataq|ATK Speed|Velocidade)[:\s]+([0-9.]+)%?/i);
    if (atkSpeedMatch) attributes.atkSpeed = parseFloat(atkSpeedMatch[1]);
    const defMatch = pageText.match(/(?:DEF|Defesa|Defense)[:\s]+([0-9.]+)%?/i);
    if (defMatch) attributes.defBoost = parseFloat(defMatch[1]);
    const hpMatch = pageText.match(/(?:HP|Vida|Health)[:\s]+([0-9.]+)%?/i);
    if (hpMatch) attributes.hpBoost = parseFloat(hpMatch[1]);
    const recommendedCharacters = [];
    $('canvas[id*="touxiang"]').each((i, el) => {
      const canvasId = $(el).attr("id") || "";
      const charMatch = canvasId.match(/touxiang_(.+)/);
      if (charMatch) {
        recommendedCharacters.push(charMatch[1]);
      }
    });
    const xpMatch = pageText.match(/XP\s*required[:\s]+([0-9,]+)/i);
    const xpRequired = xpMatch ? parseInt(xpMatch[1].replace(/,/g, "")) : 0;
    const imageUrl = $('img[class*="card"], img[class*="arayashiki"]').first().attr("src") || "";
    const card = {
      id: cardId,
      namePortuguese,
      nameEnglish: namePortuguese,
      // Use Portuguese as fallback for English
      description,
      rarity,
      quality,
      attributes,
      recommendedCharacters,
      xpRequired,
      imageUrl,
      sourceUrl: cardUrl
    };
    console.log(`[Arayashiki Scraper] Carta extra\xEDda: ${namePortuguese} (${rarity}\u2B50, ${quality})`);
    return card;
  } catch (error) {
    console.error(`[Arayashiki Scraper] Erro ao extrair detalhes:`, error);
    return null;
  }
}
async function scrapeAllArayashikisWithDetails() {
  try {
    console.log("[Arayashiki Scraper] Iniciando scrape completo de todas as cartas...");
    const cardList = await scrapeArayashikiList();
    console.log(`[Arayashiki Scraper] Encontradas ${cardList.length} cartas para detalhar`);
    const detailedCards = [];
    const limit = Math.min(cardList.length, 50);
    for (let i = 0; i < limit; i++) {
      const card = cardList[i];
      const detailedCard = await scrapeCardDetails(card.sourceUrl);
      if (detailedCard) {
        detailedCards.push(detailedCard);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    console.log(`[Arayashiki Scraper] Total de cartas com detalhes: ${detailedCards.length}`);
    return detailedCards;
  } catch (error) {
    console.error("[Arayashiki Scraper] Erro ao fazer scrape completo:", error);
    return [];
  }
}

// server/routers/arayashikiSync.ts
var arayashikiSyncRouter = router({
  // Sincronizar cartas do ssloj.com
  syncFromSsloj: publicProcedure.mutation(async () => {
    try {
      console.log("[Arayashiki Sync] Iniciando sincroniza\xE7\xE3o...");
      const cards2 = await scrapeAllArayashikisWithDetails();
      console.log(`[Arayashiki Sync] ${cards2.length} cartas extra\xEDdas`);
      return {
        success: true,
        message: `${cards2.length} cartas sincronizadas com sucesso`,
        cards: cards2.map((card) => ({
          id: card.id,
          namePortuguese: card.namePortuguese,
          nameEnglish: card.nameEnglish,
          description: card.description,
          rarity: card.rarity,
          quality: card.quality,
          attributes: card.attributes,
          recommendedCharacters: card.recommendedCharacters,
          xpRequired: card.xpRequired,
          imageUrl: card.imageUrl,
          sourceUrl: card.sourceUrl
        }))
      };
    } catch (error) {
      console.error("[Arayashiki Sync] Erro ao sincronizar:", error);
      return {
        success: false,
        message: "Erro ao sincronizar cartas",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }),
  // Buscar cartas por nome em português
  searchByName: publicProcedure.input(z5.object({
    name: z5.string().min(1)
  })).query(async ({ input }) => {
    try {
      const cards2 = await scrapeAllArayashikisWithDetails();
      const filtered = cards2.filter(
        (card) => card.namePortuguese.toLowerCase().includes(input.name.toLowerCase()) || card.nameEnglish.toLowerCase().includes(input.name.toLowerCase())
      );
      return {
        success: true,
        results: filtered.map((card) => ({
          id: card.id,
          namePortuguese: card.namePortuguese,
          nameEnglish: card.nameEnglish,
          description: card.description,
          rarity: card.rarity,
          quality: card.quality,
          attributes: card.attributes,
          recommendedCharacters: card.recommendedCharacters,
          imageUrl: card.imageUrl
        }))
      };
    } catch (error) {
      console.error("[Arayashiki Search] Erro ao buscar:", error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }),
  // Obter cartas por qualidade
  getByQuality: publicProcedure.input(z5.object({
    quality: z5.enum(["common", "rare", "epic", "legendary"])
  })).query(async ({ input }) => {
    try {
      const cards2 = await scrapeAllArayashikisWithDetails();
      const filtered = cards2.filter((card) => card.quality === input.quality);
      return {
        success: true,
        results: filtered.map((card) => ({
          id: card.id,
          namePortuguese: card.namePortuguese,
          rarity: card.rarity,
          quality: card.quality,
          attributes: card.attributes
        }))
      };
    } catch (error) {
      console.error("[Arayashiki Quality Filter] Erro:", error);
      return {
        success: false,
        results: []
      };
    }
  }),
  // Obter cartas por raridade
  getByRarity: publicProcedure.input(z5.object({
    rarity: z5.number().min(1).max(6)
  })).query(async ({ input }) => {
    try {
      const cards2 = await scrapeAllArayashikisWithDetails();
      const filtered = cards2.filter((card) => card.rarity === input.rarity);
      return {
        success: true,
        results: filtered.map((card) => ({
          id: card.id,
          namePortuguese: card.namePortuguese,
          rarity: card.rarity,
          quality: card.quality,
          attributes: card.attributes
        }))
      };
    } catch (error) {
      console.error("[Arayashiki Rarity Filter] Erro:", error);
      return {
        success: false,
        results: []
      };
    }
  }),
  // Obter cartas recomendadas para um cavaleiro
  getRecommendedForCharacter: publicProcedure.input(z5.object({
    characterId: z5.string()
  })).query(async ({ input }) => {
    try {
      const cards2 = await scrapeAllArayashikisWithDetails();
      const recommended = cards2.filter(
        (card) => card.recommendedCharacters.includes(input.characterId)
      );
      return {
        success: true,
        results: recommended.map((card) => ({
          id: card.id,
          namePortuguese: card.namePortuguese,
          description: card.description,
          rarity: card.rarity,
          quality: card.quality,
          attributes: card.attributes,
          imageUrl: card.imageUrl
        }))
      };
    } catch (error) {
      console.error("[Arayashiki Recommended] Erro:", error);
      return {
        success: false,
        results: []
      };
    }
  })
});

// server/routers/cardAnalysis.ts
init_llm();
import { z as z6 } from "zod";
var cardAnalysisRouter = router({
  analyzeCard: publicProcedure.input(
    z6.object({
      cardName: z6.string().min(1, "Nome da carta \xE9 obrigat\xF3rio"),
      cardDescription: z6.string().optional(),
      attributes: z6.object({
        dmgBoost: z6.number().optional(),
        precision: z6.number().optional(),
        atkSpeed: z6.number().optional(),
        defBoost: z6.number().optional(),
        hpBoost: z6.number().optional(),
        tenacity: z6.number().optional(),
        lifesteal: z6.number().optional(),
        damageReduction: z6.number().optional(),
        critRate: z6.number().optional()
      }).optional(),
      rarity: z6.number().min(1).max(6).optional()
    })
  ).mutation(async ({ input }) => {
    const attributesText = input.attributes ? Object.entries(input.attributes).filter(([_, value]) => value !== void 0 && value !== 0).map(([key, value]) => {
      const labels = {
        dmgBoost: "B\xF4nus de Dano",
        precision: "Precis\xE3o",
        atkSpeed: "Velocidade de Ataque",
        defBoost: "B\xF4nus de Defesa",
        hpBoost: "B\xF4nus de HP",
        tenacity: "Tenacidade",
        lifesteal: "Sanguessuga",
        damageReduction: "Redu\xE7\xE3o de Dano",
        critRate: "Taxa de Cr\xEDtico"
      };
      return `${labels[key] || key}: ${value}`;
    }).join(", ") : "Sem atributos espec\xEDficos";
    const prompt = `
Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a. Analise a seguinte carta e forne\xE7a recomenda\xE7\xF5es de builds:

**Carta:** ${input.cardName}
**Raridade:** ${input.rarity || "Desconhecida"} estrelas
**Descri\xE7\xE3o:** ${input.cardDescription || "Sem descri\xE7\xE3o"}
**Atributos:** ${attributesText}

Por favor, forne\xE7a:
1. **Melhor Papel:** Qual \xE9 o papel ideal para esta carta (Atacante, Defensor, Suporte, H\xEDbrido)?
2. **Cavaleiros Recomendados:** Liste 3-4 cavaleiros que se beneficiam mais desta carta e por qu\xEA.
3. **Builds Sugeridos:** Sugira 2-3 builds diferentes usando esta carta com diferentes composi\xE7\xF5es.
4. **Sinergia:** Quais outras cartas combinam bem com esta?
5. **Contra-Indica\xE7\xF5es:** Em quais situa\xE7\xF5es esta carta N\xC3O \xE9 recomendada?

Forne\xE7a a resposta em formato estruturado e em portugu\xEAs.
      `;
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Voc\xEA \xE9 um especialista em estrat\xE9gia de Saint Seiya: Lendas da Justi\xE7a. Forne\xE7a an\xE1lises detalhadas e pr\xE1ticas sobre cartas e builds."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      const analysis = response.choices[0]?.message?.content || "N\xE3o foi poss\xEDvel gerar an\xE1lise";
      return {
        cardName: input.cardName,
        analysis,
        timestamp: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      throw new Error(`Erro ao analisar carta: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  }),
  suggestBuilds: publicProcedure.input(
    z6.object({
      characterName: z6.string().min(1, "Nome do cavaleiro \xE9 obrigat\xF3rio"),
      characterRole: z6.enum(["Atacante", "Defensor", "Suporte", "H\xEDbrido"]).optional(),
      availableCards: z6.array(z6.string()).optional()
    })
  ).mutation(async ({ input }) => {
    const cardsText = input.availableCards && input.availableCards.length > 0 ? `Cartas dispon\xEDveis: ${input.availableCards.join(", ")}` : "Sem restri\xE7\xE3o de cartas";
    const prompt = `
Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a. Crie builds otimizados para o cavaleiro:

**Cavaleiro:** ${input.characterName}
**Papel:** ${input.characterRole || "N\xE3o especificado"}
${cardsText}

Por favor, forne\xE7a:
1. **Build Ofensivo:** Cartas e estrat\xE9gia para maximizar dano.
2. **Build Defensivo:** Cartas e estrat\xE9gia para maximizar defesa e sobreviv\xEAncia.
3. **Build Balanceado:** Cartas e estrat\xE9gia para um meio termo entre ataque e defesa.

Para cada build, explique:
- Quais cartas usar
- Por que essas cartas funcionam bem com este cavaleiro
- Ordem de ativa\xE7\xE3o das habilidades
- Contra-estrat\xE9gias

Forne\xE7a a resposta em formato estruturado e em portugu\xEAs.
      `;
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Voc\xEA \xE9 um especialista em estrat\xE9gia de Saint Seiya: Lendas da Justi\xE7a. Crie builds pr\xE1ticos e eficazes."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      const builds = response.choices[0]?.message?.content || "N\xE3o foi poss\xEDvel gerar builds";
      return {
        characterName: input.characterName,
        builds,
        timestamp: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      throw new Error(`Erro ao sugerir builds: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  }),
  compareCards: publicProcedure.input(
    z6.object({
      card1Name: z6.string().min(1, "Nome da primeira carta \xE9 obrigat\xF3rio"),
      card2Name: z6.string().min(1, "Nome da segunda carta \xE9 obrigat\xF3rio"),
      card1Attributes: z6.record(z6.string(), z6.number()).optional(),
      card2Attributes: z6.record(z6.string(), z6.number()).optional()
    })
  ).mutation(async ({ input }) => {
    const prompt = `
Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a. Compare as seguintes cartas:

**Carta 1:** ${input.card1Name}
**Atributos:** ${input.card1Attributes ? JSON.stringify(input.card1Attributes) : "N\xE3o especificados"}

**Carta 2:** ${input.card2Name}
**Atributos:** ${input.card2Attributes ? JSON.stringify(input.card2Attributes) : "N\xE3o especificados"}

Por favor, forne\xE7a:
1. **Compara\xE7\xE3o de Atributos:** Qual \xE9 melhor em cada aspecto?
2. **Casos de Uso:** Quando usar cada uma?
3. **Recomenda\xE7\xE3o:** Qual \xE9 melhor em geral e por qu\xEA?
4. **Sinergia:** Podem ser usadas juntas?

Forne\xE7a a resposta em formato estruturado e em portugu\xEAs.
      `;
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Voc\xEA \xE9 um especialista em compara\xE7\xE3o de cartas de Saint Seiya: Lendas da Justi\xE7a."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      const comparison = response.choices[0]?.message?.content || "N\xE3o foi poss\xEDvel fazer compara\xE7\xE3o";
      return {
        card1: input.card1Name,
        card2: input.card2Name,
        comparison,
        timestamp: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      throw new Error(`Erro ao comparar cartas: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  })
});

// server/routers/accounts.ts
import { z as z7 } from "zod";

// server/modules/accountScheduler.ts
import * as cron from "node-cron";
import axios4 from "axios";
import fs2 from "fs";
import path2 from "path";
import FormData from "form-data";

// server/whatsapp-web-client.ts
init_db();
init_schema();
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import * as qrcode from "qrcode";
import * as fs from "fs";
import * as path from "path";
import pino from "pino";
import { desc as desc2, sql as sql3 } from "drizzle-orm";
var SESSIONS_DIR = path.join(process.cwd(), "server", "whatsapp-sessions");
var socket = null;
var qrCodeBase64 = null;
var connectionStatus = "disconnected";
var isConnecting = false;
var messageHistory = [];
var logger = pino({ level: "silent" });
var MAX_STRATEGIES_PER_RESPONSE = 5;
async function searchGvgStrategies2(searchTerm) {
  const db = await getDb();
  if (!db) {
    console.log("[WhatsApp Bot] Banco de dados n\xE3o dispon\xEDvel");
    return [];
  }
  try {
    let strategies;
    if (searchTerm && searchTerm.trim()) {
      strategies = await db.select().from(gvgStrategies).where(sql3`LOWER(${gvgStrategies.name}) LIKE ${`%${searchTerm.toLowerCase()}%`}`).orderBy(desc2(gvgStrategies.usageCount)).limit(MAX_STRATEGIES_PER_RESPONSE);
    } else {
      strategies = await db.select().from(gvgStrategies).orderBy(desc2(gvgStrategies.usageCount)).limit(MAX_STRATEGIES_PER_RESPONSE);
    }
    console.log(`[WhatsApp Bot] Encontradas ${strategies.length} estrat\xE9gias GvG`);
    return strategies;
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estrat\xE9gias GvG:", error);
    return [];
  }
}
async function searchGotStrategies2(searchTerm) {
  const db = await getDb();
  if (!db) {
    console.log("[WhatsApp Bot] Banco de dados n\xE3o dispon\xEDvel");
    return [];
  }
  try {
    let strategies;
    if (searchTerm && searchTerm.trim()) {
      strategies = await db.select().from(gotStrategies).where(sql3`LOWER(${gotStrategies.name}) LIKE ${`%${searchTerm.toLowerCase()}%`} OR LOWER(${gotStrategies.observation}) LIKE ${`%${searchTerm.toLowerCase()}%`}`).orderBy(desc2(gotStrategies.usageCount)).limit(MAX_STRATEGIES_PER_RESPONSE);
    } else {
      strategies = await db.select().from(gotStrategies).orderBy(desc2(gotStrategies.usageCount)).limit(MAX_STRATEGIES_PER_RESPONSE);
    }
    console.log(`[WhatsApp Bot] Encontradas ${strategies.length} estrat\xE9gias GoT`);
    return strategies;
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estrat\xE9gias GoT:", error);
    return [];
  }
}
function formatGvgStrategy(strategy) {
  const name = strategy.name || `Estrat\xE9gia #${strategy.id}`;
  return `
\u{1F5E1}\uFE0F *${name}*
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u2694\uFE0F *ATAQUE (5v5):*
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 ${strategy.attackFormation1}
\u2502 ${strategy.attackFormation2}
\u2502 ${strategy.attackFormation3}
\u2502 ${strategy.attackFormation4}
\u2502 ${strategy.attackFormation5}
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

\u{1F6E1}\uFE0F *DEFESA (5v5):*
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 ${strategy.defenseFormation1}
\u2502 ${strategy.defenseFormation2}
\u2502 ${strategy.defenseFormation3}
\u2502 ${strategy.defenseFormation4}
\u2502 ${strategy.defenseFormation5}
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

\u{1F4CA} _Usos: ${strategy.usageCount}_
`;
}
function formatGotStrategy(strategy) {
  const name = strategy.name || `Estrat\xE9gia #${strategy.id}`;
  const observation = strategy.observation ? `
\u{1F4DD} _${strategy.observation}_` : "";
  return `
\u2694\uFE0F *${name}*
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F534} *ATAQUE (3x3):*
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 ${strategy.attackFormation1}
\u2502 ${strategy.attackFormation2}
\u2502 ${strategy.attackFormation3}
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

\u{1F535} *DEFESA (3x3):*
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 ${strategy.defenseFormation1}
\u2502 ${strategy.defenseFormation2}
\u2502 ${strategy.defenseFormation3}
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

\u{1F4CA} _Usos: ${strategy.usageCount}_${observation}
`;
}
function getHelpMessage() {
  return `
\u{1F916} *BOT SAPURI - COMANDOS*
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F4CB} *Comandos Dispon\xEDveis:*

/help ou /ajuda
\u21B3 Lista todos os comandos

/estrategias
\u21B3 Lista tipos de estrat\xE9gias dispon\xEDveis

/gvg
\u21B3 Mostra as 5 estrat\xE9gias GvG mais usadas

/gvg [busca]
\u21B3 Busca estrat\xE9gia GvG por nome
\u21B3 Ex: /gvg cavalaria

/got
\u21B3 Mostra as 5 estrat\xE9gias GoT mais usadas

/got [busca]
\u21B3 Busca estrat\xE9gia GoT por nome
\u21B3 Ex: /got defesa forte

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
_Sistema Sapuri v1.0_
`;
}
function getStrategiesTypesMessage() {
  return `
\u{1F4DA} *TIPOS DE ESTRAT\xC9GIAS*
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F5E1}\uFE0F *GvG (Guerra de Guildas)*
\u2022 Forma\xE7\xE3o 5v5
\u2022 Use: /gvg

\u2694\uFE0F *GoT (Guerra de Tit\xE3s)*
\u2022 Forma\xE7\xE3o 3x3
\u2022 Use: /got

\u{1F4A1} _Dica: Adicione uma palavra para buscar_
_Ex: /gvg cavalaria_
`;
}
async function processCommand(command) {
  const trimmed = command.trim().toLowerCase();
  if (!trimmed.startsWith("/")) {
    return null;
  }
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const searchTerm = parts.slice(1).join(" ");
  console.log(`[WhatsApp Bot] Processando comando: ${cmd}, termo: "${searchTerm}"`);
  switch (cmd) {
    case "/help":
    case "/ajuda":
      return getHelpMessage();
    case "/estrategias":
    case "/estrat\xE9gias":
      return getStrategiesTypesMessage();
    case "/gvg": {
      const strategies = await searchGvgStrategies2(searchTerm || void 0);
      if (strategies.length === 0) {
        return searchTerm ? `\u274C Nenhuma estrat\xE9gia GvG encontrada para "${searchTerm}"

_Tente outro termo ou use /gvg para ver as mais usadas._` : "\u274C Nenhuma estrat\xE9gia GvG cadastrada no sistema.";
      }
      const header = searchTerm ? `\u{1F50D} *Resultados para "${searchTerm}":*
` : `\u{1F4CA} *Top ${strategies.length} Estrat\xE9gias GvG:*
`;
      const formatted = strategies.map(formatGvgStrategy).join("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
      return header + formatted;
    }
    case "/got": {
      const strategies = await searchGotStrategies2(searchTerm || void 0);
      if (strategies.length === 0) {
        return searchTerm ? `\u274C Nenhuma estrat\xE9gia GoT encontrada para "${searchTerm}"

_Tente outro termo ou use /got para ver as mais usadas._` : "\u274C Nenhuma estrat\xE9gia GoT cadastrada no sistema.";
      }
      const header = searchTerm ? `\u{1F50D} *Resultados para "${searchTerm}":*
` : `\u{1F4CA} *Top ${strategies.length} Estrat\xE9gias GoT:*
`;
      const formatted = strategies.map(formatGotStrategy).join("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
      return header + formatted;
    }
    default:
      return null;
  }
}
async function handleIncomingMessage(message) {
  try {
    if (message.key.fromMe) {
      return;
    }
    const text2 = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    if (!text2 || !text2.trim()) {
      return;
    }
    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid?.endsWith("@g.us");
    const sender = message.key.participant || message.key.remoteJid;
    console.log(`[WhatsApp Bot] Mensagem recebida de ${isGroup ? "grupo" : "privado"}: ${text2.substring(0, 50)}`);
    const response = await processCommand(text2);
    if (response && socket) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await socket.sendMessage(remoteJid, { text: response });
      console.log(`[WhatsApp Bot] Resposta enviada para ${remoteJid}`);
    }
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao processar mensagem:", error);
  }
}
function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }
  return cleaned + "@s.whatsapp.net";
}
async function connectWhatsApp() {
  if (isConnecting) {
    console.log("[WhatsApp] J\xE1 est\xE1 conectando, aguarde...");
    return false;
  }
  if (socket && connectionStatus === "connected") {
    console.log("[WhatsApp] J\xE1 conectado!");
    return true;
  }
  isConnecting = true;
  connectionStatus = "connecting";
  try {
    ensureSessionsDir();
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[WhatsApp] Usando vers\xE3o WA v${version.join(".")}, isLatest: ${isLatest}`);
    const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
    socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      printQRInTerminal: false,
      logger,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false
    });
    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        console.log("[WhatsApp] QR Code recebido, gerando imagem...");
        connectionStatus = "qr";
        try {
          qrCodeBase64 = await qrcode.toDataURL(qr, {
            width: 256,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff"
            }
          });
          console.log("[WhatsApp] QR Code gerado com sucesso");
        } catch (err) {
          console.error("[WhatsApp] Erro ao gerar QR code:", err);
        }
      }
      if (connection === "open") {
        console.log("[WhatsApp] Conectado com sucesso!");
        connectionStatus = "connected";
        qrCodeBase64 = null;
        isConnecting = false;
      }
      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          "[WhatsApp] Conex\xE3o fechada devido a:",
          lastDisconnect?.error,
          "Reconectar:",
          shouldReconnect
        );
        connectionStatus = "disconnected";
        qrCodeBase64 = null;
        isConnecting = false;
        if (shouldReconnect) {
          setTimeout(() => {
            connectWhatsApp();
          }, 3e3);
        }
      }
    });
    socket.ev.on("creds.update", saveCreds);
    socket.ev.on("messages.upsert", async (msg) => {
      if (msg.type === "notify") {
        for (const message of msg.messages) {
          console.log("[WhatsApp] Mensagem recebida:", message.key?.remoteJid);
          await handleIncomingMessage(message);
        }
      }
    });
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao conectar:", error);
    connectionStatus = "disconnected";
    isConnecting = false;
    return false;
  }
}
async function disconnectWhatsApp() {
  if (socket) {
    console.log("[WhatsApp] Desconectando...");
    await socket.end(void 0);
    socket = null;
  }
  connectionStatus = "disconnected";
  qrCodeBase64 = null;
  isConnecting = false;
}
async function logoutWhatsApp() {
  if (socket) {
    try {
      await socket.logout();
    } catch (error) {
      console.error("[WhatsApp] Erro ao fazer logout:", error);
    }
    socket = null;
  }
  if (fs.existsSync(SESSIONS_DIR)) {
    const files = fs.readdirSync(SESSIONS_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(SESSIONS_DIR, file));
    }
  }
  connectionStatus = "disconnected";
  qrCodeBase64 = null;
  isConnecting = false;
}
function getWhatsAppStatus() {
  return {
    isConnected: connectionStatus === "connected",
    status: connectionStatus,
    hasQrCode: !!qrCodeBase64
  };
}
function getWhatsAppQrCode() {
  return qrCodeBase64;
}
async function sendWhatsAppMessage(phoneNumber, text2) {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] N\xE3o conectado, n\xE3o \xE9 poss\xEDvel enviar mensagem");
    return false;
  }
  try {
    const jid = formatPhoneNumber(phoneNumber);
    console.log(`[WhatsApp] Enviando mensagem para ${jid}`);
    await socket.sendMessage(jid, { text: text2 });
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber,
      message: text2,
      status: "sent",
      timestamp: /* @__PURE__ */ new Date()
    });
    console.log(`[WhatsApp] Mensagem enviada com sucesso para ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber,
      message: text2,
      status: "failed",
      timestamp: /* @__PURE__ */ new Date()
    });
    return false;
  }
}
async function sendWhatsAppMessages(members2, text2, delayMs = 1e3) {
  let success = 0;
  let failed = 0;
  for (const member of members2) {
    const personalizedText = text2.replace("{nome}", member.name);
    const sent = await sendWhatsAppMessage(member.phoneNumber, personalizedText);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return { success, failed };
}
async function checkWhatsAppNumber(phoneNumber) {
  if (!socket || connectionStatus !== "connected") {
    return false;
  }
  try {
    const jid = formatPhoneNumber(phoneNumber);
    const results = await socket.onWhatsApp(jid.replace("@s.whatsapp.net", ""));
    const result = results?.[0];
    return result?.exists ?? false;
  } catch (error) {
    console.error("[WhatsApp] Erro ao verificar n\xFAmero:", error);
    return false;
  }
}
function getMessageHistory() {
  return messageHistory.slice(-100);
}
async function getWhatsAppGroups() {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] N\xE3o conectado, n\xE3o \xE9 poss\xEDvel listar grupos");
    return [];
  }
  try {
    console.log("[WhatsApp] Buscando grupos...");
    const groups = await socket.groupFetchAllParticipating();
    const groupList = Object.values(groups).map((group) => ({
      id: group.id,
      name: group.subject || "Sem nome",
      participantsCount: group.participants?.length || 0
    }));
    console.log(`[WhatsApp] Encontrados ${groupList.length} grupos`);
    return groupList;
  } catch (error) {
    console.error("[WhatsApp] Erro ao listar grupos:", error);
    return [];
  }
}
async function sendWhatsAppGroupMessage(groupId, text2) {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] N\xE3o conectado, n\xE3o \xE9 poss\xEDvel enviar mensagem");
    return false;
  }
  try {
    const jid = groupId.includes("@") ? groupId : `${groupId}@g.us`;
    console.log(`[WhatsApp] Enviando mensagem para grupo ${jid}`);
    await socket.sendMessage(jid, { text: text2 });
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber: groupId,
      message: text2,
      status: "sent",
      timestamp: /* @__PURE__ */ new Date()
    });
    console.log(`[WhatsApp] Mensagem enviada com sucesso para grupo ${groupId}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem para grupo:", error);
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber: groupId,
      message: text2,
      status: "failed",
      timestamp: /* @__PURE__ */ new Date()
    });
    return false;
  }
}

// server/modules/accountScheduler.ts
var ACCOUNTS_FILE = path2.join(process.cwd(), "server/data/contas.json");
var TELEGRAM_BOT_TOKEN = process.env.PAINEL_CONTAS_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
var TELEGRAM_CHAT_ID = process.env.PAINEL_CONTAS_CHAT_ID || "-5156917144";
var schedulerState = {
  isRunning: false,
  intervalMinutes: 60,
  task: null,
  sendToWhatsApp: true
  // Envia também para WhatsApp por padrão
};
function ensureDataDir() {
  const dataDir = path2.dirname(ACCOUNTS_FILE);
  if (!fs2.existsSync(dataDir)) {
    fs2.mkdirSync(dataDir, { recursive: true });
  }
}
function loadAccounts() {
  ensureDataDir();
  try {
    if (fs2.existsSync(ACCOUNTS_FILE)) {
      const data = fs2.readFileSync(ACCOUNTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
  return [];
}
function saveAccounts(accounts) {
  ensureDataDir();
  fs2.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}
async function sendMessageToTelegram(text2) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return false;
  }
  try {
    await axios4.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text2,
      parse_mode: "Markdown"
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem ao Telegram:", error);
    return false;
  }
}
async function sendPhotoToTelegram(imagePath, caption) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return false;
  }
  try {
    if (imagePath.startsWith("/uploads/")) {
      const fullPath = path2.join(process.cwd(), imagePath);
      if (!fs2.existsSync(fullPath)) {
        console.error(`Arquivo n\xE3o encontrado: ${fullPath}`);
        return false;
      }
      const formData = new FormData();
      formData.append("chat_id", TELEGRAM_CHAT_ID);
      formData.append("photo", fs2.createReadStream(fullPath));
      if (caption) {
        formData.append("caption", caption);
        formData.append("parse_mode", "Markdown");
      }
      await axios4.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        formData,
        { headers: formData.getHeaders() }
      );
    } else {
      await axios4.post(`https://i.ytimg.com/vi/UhZtrhV7t3U/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB7Rlis0ADJRPE85E7RLm94IJc58w`, {
        chat_id: TELEGRAM_CHAT_ID,
        photo: imagePath,
        caption: caption || "",
        parse_mode: "Markdown"
      });
    }
    return true;
  } catch (error) {
    console.error("Erro ao enviar foto ao Telegram:", error?.response?.data || error?.message || error);
    return false;
  }
}
async function sendAccountToTelegram(account) {
  const message = `\u{1F3AE} *Nova Conta \xE0 Venda!*

\u{1F579}\uFE0F *Jogo:* ${account.gameName}
\u{1F4B0} *Pre\xE7o:* R$ ${account.price.toFixed(2)}
\u{1F4CB} *Descri\xE7\xE3o:*
${account.description}

\u{1F4F8} _Prints enviados abaixo_`;
  await sendMessageToTelegram(message);
  await new Promise((resolve) => setTimeout(resolve, 1e3));
  for (const imageUrl of account.images) {
    await sendPhotoToTelegram(imageUrl);
    await new Promise((resolve) => setTimeout(resolve, 3e3));
  }
}
async function sendAccountToWhatsApp(account) {
  const status = getWhatsAppStatus();
  if (!status.isConnected) {
    console.log("[WhatsApp] N\xE3o conectado, pulando envio");
    return { sent: 0, failed: 0 };
  }
  const message = `\u{1F3AE} *Nova Conta \xE0 Venda!*

\u{1F579}\uFE0F *Jogo:* ${account.gameName}
\u{1F4B0} *Pre\xE7o:* R$ ${account.price.toFixed(2)}

\u{1F4CB} *Descri\xE7\xE3o:*
${account.description}

\u{1F4F8} ${account.images.length} imagem(ns) dispon\xEDveis

\u{1F4AC} Entre em contato para mais informa\xE7\xF5es!`;
  try {
    const groups = await getWhatsAppGroups();
    let sent = 0;
    let failed = 0;
    for (const group of groups) {
      try {
        const success = await sendWhatsAppGroupMessage(group.id, message);
        if (success) {
          sent++;
          console.log(`[WhatsApp] Mensagem enviada para grupo: ${group.name}`);
        } else {
          failed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 2e3));
      } catch (error) {
        console.error(`[WhatsApp] Erro ao enviar para grupo ${group.name}:`, error);
        failed++;
      }
    }
    return { sent, failed };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar conta:", error);
    return { sent: 0, failed: 0 };
  }
}
async function runSchedulerCycle() {
  const accounts = loadAccounts();
  if (accounts.length === 0) {
    console.log("[Scheduler] Nenhuma conta para enviar");
    return;
  }
  console.log(`[Scheduler] Iniciando envio de ${accounts.length} contas`);
  for (const account of accounts) {
    try {
      await sendAccountToTelegram(account);
      if (schedulerState.sendToWhatsApp) {
        console.log(`[Scheduler] Enviando conta ${account.id} para WhatsApp...`);
        const whatsAppResult = await sendAccountToWhatsApp(account);
        console.log(`[Scheduler] WhatsApp: ${whatsAppResult.sent} enviados, ${whatsAppResult.failed} falhas`);
      }
      await new Promise((resolve) => setTimeout(resolve, 5e3));
    } catch (error) {
      console.error(`Erro ao enviar conta ${account.id}:`, error);
    }
  }
  console.log("[Scheduler] Ciclo conclu\xEDdo");
}
function startScheduler(intervalMinutes = 60) {
  if (schedulerState.isRunning) {
    console.log("[Scheduler] J\xE1 est\xE1 rodando");
    return false;
  }
  schedulerState.intervalMinutes = intervalMinutes;
  const cronExpression = `*/${intervalMinutes} * * * *`;
  try {
    schedulerState.task = cron.schedule(cronExpression, runSchedulerCycle);
    schedulerState.isRunning = true;
    console.log(`[Scheduler] Iniciado com intervalo de ${intervalMinutes} minutos`);
    return true;
  } catch (error) {
    console.error("Erro ao iniciar scheduler:", error);
    return false;
  }
}
function stopScheduler() {
  if (!schedulerState.isRunning || !schedulerState.task) {
    console.log("[Scheduler] N\xE3o est\xE1 rodando");
    return false;
  }
  schedulerState.task.stop();
  schedulerState.isRunning = false;
  console.log("[Scheduler] Parado");
  return true;
}
function getSchedulerStatus() {
  return {
    isRunning: schedulerState.isRunning,
    intervalMinutes: schedulerState.intervalMinutes,
    sendToWhatsApp: schedulerState.sendToWhatsApp
  };
}
function setWhatsAppEnabled(enabled) {
  schedulerState.sendToWhatsApp = enabled;
}
function addAccount(gameName, price, description, images) {
  const accounts = loadAccounts();
  const newAccount = {
    id: Date.now().toString(),
    gameName,
    price,
    description,
    images,
    createdAt: Date.now()
  };
  accounts.push(newAccount);
  saveAccounts(accounts);
  sendAccountToTelegram(newAccount).catch((error) => {
    console.error("Erro ao enviar conta ao Telegram:", error);
  });
  return newAccount;
}
function removeAccount(accountId) {
  const accounts = loadAccounts();
  const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
  if (filteredAccounts.length === accounts.length) {
    return false;
  }
  saveAccounts(filteredAccounts);
  return true;
}
function updateAccount(accountId, updates) {
  const accounts = loadAccounts();
  const accountIndex = accounts.findIndex((acc) => acc.id === accountId);
  if (accountIndex === -1) {
    return null;
  }
  if (updates.gameName !== void 0) {
    accounts[accountIndex].gameName = updates.gameName;
  }
  if (updates.price !== void 0) {
    accounts[accountIndex].price = updates.price;
  }
  if (updates.description !== void 0) {
    accounts[accountIndex].description = updates.description;
  }
  saveAccounts(accounts);
  return accounts[accountIndex];
}
function getAccountById(accountId) {
  const accounts = loadAccounts();
  return accounts.find((acc) => acc.id === accountId) || null;
}
function getAllAccounts() {
  return loadAccounts();
}

// server/routers/accounts.ts
var accountsRouter = router({
  // GET /api/accounts - Retorna lista de contas
  list: publicProcedure.query(async () => {
    try {
      const accounts = getAllAccounts();
      return accounts;
    } catch (error) {
      console.error("Erro ao listar contas:", error);
      return [];
    }
  }),
  // POST /api/accounts/announce - Anuncia nova conta
  announce: publicProcedure.input(
    z7.object({
      gameName: z7.string().min(1),
      price: z7.number().positive(),
      description: z7.string().min(1),
      images: z7.array(z7.string()).default([])
    })
  ).mutation(async ({ input }) => {
    try {
      const account = addAccount(
        input.gameName,
        input.price,
        input.description,
        input.images
      );
      return { success: true, account };
    } catch (error) {
      console.error("Erro ao anunciar conta:", error);
      return { success: false, error: "Erro ao anunciar conta" };
    }
  }),
  // DELETE /api/accounts/:id - Remove uma conta
  delete: publicProcedure.input(z7.object({ id: z7.string() })).mutation(async ({ input }) => {
    try {
      const success = removeAccount(input.id);
      return { success };
    } catch (error) {
      console.error("Erro ao remover conta:", error);
      return { success: false };
    }
  }),
  // GET /api/scheduler/status - Retorna status do scheduler
  schedulerStatus: publicProcedure.query(async () => {
    try {
      const status = getSchedulerStatus();
      return status;
    } catch (error) {
      console.error("Erro ao obter status do scheduler:", error);
      return { isRunning: false, intervalMinutes: 60 };
    }
  }),
  // POST /api/scheduler/start - Inicia o scheduler
  schedulerStart: publicProcedure.input(z7.object({ intervalMinutes: z7.number().min(5).default(60) })).mutation(async ({ input }) => {
    try {
      const success = startScheduler(input.intervalMinutes);
      return { success };
    } catch (error) {
      console.error("Erro ao iniciar scheduler:", error);
      return { success: false };
    }
  }),
  // POST /api/scheduler/stop - Para o scheduler
  schedulerStop: publicProcedure.mutation(async () => {
    try {
      const success = stopScheduler();
      return { success };
    } catch (error) {
      console.error("Erro ao parar scheduler:", error);
      return { success: false };
    }
  })
});

// server/exportImport.ts
function calculateChecksum(data) {
  const json = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
function exportStrategies(strategies) {
  const export_data = {
    version: "1.0",
    exportDate: (/* @__PURE__ */ new Date()).toISOString(),
    strategies: strategies.map((s) => ({
      id: s.id,
      name: s.name || null,
      attackFormation: s.attackFormation,
      defenseFormation: s.defenseFormation,
      observation: s.observation || null,
      createdBy: s.createdBy,
      createdAt: s.createdAt
    })),
    metadata: {
      totalStrategies: strategies.length,
      checksum: ""
    }
  };
  export_data.metadata.checksum = calculateChecksum(export_data.strategies);
  return export_data;
}
function validateImportFile(data) {
  try {
    if (!data.version || !data.strategies || !Array.isArray(data.strategies)) {
      return { valid: false, error: "Formato de arquivo inv\xE1lido" };
    }
    if (data.version !== "1.0") {
      return { valid: false, error: `Vers\xE3o n\xE3o suportada: ${data.version}` };
    }
    for (const strategy of data.strategies) {
      if (!strategy.attackFormation || !strategy.defenseFormation) {
        return { valid: false, error: "Estrat\xE9gia com campos obrigat\xF3rios faltando" };
      }
    }
    if (data.metadata?.checksum) {
      const calculatedChecksum = calculateChecksum(data.strategies);
      if (calculatedChecksum !== data.metadata.checksum) {
        return { valid: false, error: "Checksum inv\xE1lido - arquivo pode estar corrompido" };
      }
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Erro ao validar arquivo: ${error}` };
  }
}
function parseImportFile(fileContent) {
  try {
    const data = JSON.parse(fileContent);
    const validation = validateImportFile(data);
    if (!validation.valid) {
      return { error: validation.error };
    }
    return { data };
  } catch (error) {
    return { error: `Erro ao processar arquivo JSON: ${error}` };
  }
}
function getImportStats(data) {
  return {
    totalStrategies: data.strategies.length,
    exportDate: data.exportDate,
    version: data.version,
    strategies: data.strategies.map((s) => ({
      name: s.name || "(sem nome)",
      attackFormation: s.attackFormation,
      defenseFormation: s.defenseFormation
    }))
  };
}

// server/routers.ts
init_strategyBackup();

// server/storage.ts
import * as fs3 from "fs";
import * as path3 from "path";
var STORAGE_DIR = path3.join(process.cwd(), "uploads");
if (!fs3.existsSync(STORAGE_DIR)) {
  fs3.mkdirSync(STORAGE_DIR, { recursive: true });
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = normalizeKey(relKey);
  const filePath = path3.join(STORAGE_DIR, key);
  const dir = path3.dirname(filePath);
  if (!fs3.existsSync(dir)) {
    fs3.mkdirSync(dir, { recursive: true });
  }
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  fs3.writeFileSync(filePath, buffer);
  const url = `/uploads/${key}`;
  return { key, url };
}

// server/whatsapp.ts
async function initializeWhatsAppClient() {
  try {
    console.log("[WhatsApp] Inicializando cliente...");
    const connected = await connectWhatsApp();
    if (connected) {
      return { success: true, message: "Cliente inicializado com sucesso" };
    } else {
      return { success: true, message: "Iniciando conex\xE3o, aguarde o QR code..." };
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao inicializar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
async function sendWhatsAppMessage2(phoneNumber, text2) {
  try {
    const sent = await sendWhatsAppMessage(phoneNumber, text2);
    return { success: sent };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
async function sendWhatsAppMentionMessage(mentions, text2) {
  try {
    const results = await sendWhatsAppMessages(
      mentions.map((phone) => ({ phoneNumber: phone, name: "" })),
      text2,
      500
    );
    return {
      success: results.failed === 0,
      error: results.failed > 0 ? `${results.failed} mensagens falharam` : void 0
    };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem com men\xE7\xF5es:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
async function sendGotReminder(memberPhones, customMessage) {
  try {
    const defaultMessage = customMessage || "\u2694\uFE0F *LEMBRETE GoT - Sapuri Guild*\n\nOl\xE1 {nome}! N\xE3o esque\xE7a de atacar no Guerra dos Tronos hoje!\n\n\u{1F3AF} Coordene com sua equipe\n\u23F0 Boa sorte nas batalhas!";
    const result = await sendWhatsAppMessages(memberPhones, defaultMessage, 1e3);
    return {
      success: result.failed === 0,
      sent: result.success,
      failed: result.failed
    };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar lembrete GoT:", error);
    return {
      success: false,
      sent: 0,
      failed: memberPhones.length,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
function getWhatsAppStatus2() {
  const status = getWhatsAppStatus();
  return {
    connected: status.isConnected,
    isConnected: status.isConnected,
    status: status.status,
    qrCode: status.hasQrCode ? getWhatsAppQrCode() : null
  };
}
async function disconnectWhatsApp2() {
  try {
    await disconnectWhatsApp();
    return { success: true };
  } catch (error) {
    console.error("[WhatsApp] Erro ao desconectar:", error);
    return { success: false };
  }
}
async function clearWhatsAppSession() {
  try {
    await logoutWhatsApp();
    return { success: true };
  } catch (error) {
    console.error("[WhatsApp] Erro ao limpar sess\xE3o:", error);
    return { success: false };
  }
}
function getCurrentQRCode() {
  return getWhatsAppQrCode();
}

// server/routers.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError4({ code: "FORBIDDEN", message: "Apenas administradores podem realizar esta a\xE7\xE3o" });
  }
  return next({ ctx });
});
var managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "subadmin") {
    throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ SUB-ADMINS ============
  subAdmins: router({
    list: adminProcedure2.query(async () => {
      return getAllSubAdmins();
    }),
    create: adminProcedure2.input(z8.object({
      name: z8.string().min(1).max(100),
      username: z8.string().min(3).max(50),
      password: z8.string().min(4).max(50),
      canManageGvg: z8.boolean().default(false),
      canManageGot: z8.boolean().default(false),
      canManageReliquias: z8.boolean().default(false)
    })).mutation(async ({ input }) => {
      const existing = await getSubAdminByUsername(input.username);
      if (existing) {
        throw new TRPCError4({ code: "BAD_REQUEST", message: "Username j\xE1 existe" });
      }
      await createSubAdmin(input);
      return { success: true };
    }),
    update: adminProcedure2.input(z8.object({
      id: z8.number(),
      name: z8.string().min(1).max(100).optional(),
      password: z8.string().min(4).max(50).optional(),
      canManageGvg: z8.boolean().optional(),
      canManageGot: z8.boolean().optional(),
      canManageReliquias: z8.boolean().optional(),
      isActive: z8.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSubAdmin(id, data);
      return { success: true };
    }),
    delete: adminProcedure2.input(z8.object({ id: z8.number() })).mutation(async ({ input }) => {
      await deleteSubAdmin(input.id);
      return { success: true };
    }),
    login: publicProcedure.input(z8.object({
      username: z8.string(),
      password: z8.string()
    })).mutation(async ({ input }) => {
      const subAdmin = await getSubAdminByUsername(input.username);
      if (!subAdmin || subAdmin.password !== input.password || !subAdmin.isActive) {
        throw new TRPCError4({ code: "UNAUTHORIZED", message: "Credenciais inv\xE1lidas" });
      }
      return {
        success: true,
        subAdmin: {
          id: subAdmin.id,
          name: subAdmin.name,
          canManageGvg: subAdmin.canManageGvg,
          canManageGot: subAdmin.canManageGot,
          canManageReliquias: subAdmin.canManageReliquias
        }
      };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ MEMBERS ============
  members: router({
    list: protectedProcedure.query(async () => {
      return getAllMembers();
    }),
    listActive: protectedProcedure.query(async () => {
      return getActiveMembers();
    }),
    listByEvent: protectedProcedure.input(z8.object({ eventName: z8.string() })).query(async ({ input }) => {
      return getMembersByEvent(input.eventName);
    }),
    getById: protectedProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
      return getMemberById(input.id);
    }),
    create: adminProcedure2.input(z8.object({
      name: z8.string().min(1).max(100),
      telegramId: z8.string().max(100).optional(),
      telegramUsername: z8.string().max(100).optional(),
      phoneNumber: z8.string().max(20).optional(),
      participatesGvg: z8.boolean().default(true),
      participatesGot: z8.boolean().default(true),
      participatesReliquias: z8.boolean().default(true)
    })).mutation(async ({ input }) => {
      const count = await getMemberCount();
      if (count >= 75) {
        throw new TRPCError4({ code: "BAD_REQUEST", message: "Limite de 75 membros atingido" });
      }
      await createMember(input);
      return { success: true };
    }),
    update: adminProcedure2.input(z8.object({
      id: z8.number(),
      name: z8.string().min(1).max(100).optional(),
      telegramId: z8.string().max(100).optional(),
      telegramUsername: z8.string().max(100).optional(),
      phoneNumber: z8.string().max(20).optional(),
      participatesGvg: z8.boolean().optional(),
      participatesGot: z8.boolean().optional(),
      participatesReliquias: z8.boolean().optional(),
      isActive: z8.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateMember(id, data);
      return { success: true };
    }),
    delete: adminProcedure2.input(z8.object({ id: z8.number() })).mutation(async ({ input }) => {
      await deleteMember(input.id);
      return { success: true };
    }),
    count: protectedProcedure.query(async () => {
      return getMemberCount();
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ EVENT TYPES ============
  eventTypes: router({
    list: protectedProcedure.query(async () => {
      return getAllEventTypes();
    }),
    getById: protectedProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
      return getEventTypeById(input.id);
    }),
    update: adminProcedure2.input(z8.object({
      id: z8.number(),
      displayName: z8.string().min(1).max(100).optional(),
      maxPlayers: z8.number().min(1).max(100).optional(),
      eventTime: z8.string().regex(/^\d{2}:\d{2}$/).optional(),
      reminderMinutes: z8.number().min(5).max(120).optional(),
      isActive: z8.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateEventType(id, data);
      return { success: true };
    }),
    seed: adminProcedure2.mutation(async () => {
      await seedDefaultEventTypes();
      return { success: true };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ SCHEDULES ============
  schedules: router({
    getByEventAndDate: protectedProcedure.input(z8.object({
      eventTypeId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).query(async ({ input }) => {
      const schedule2 = await getScheduleByEventAndDate(input.eventTypeId, input.eventDate);
      if (!schedule2) return null;
      const entries = await getEntriesBySchedule(schedule2.id);
      return {
        ...schedule2,
        members: entries.map((e) => e.member)
      };
    }),
    save: managerProcedure.input(z8.object({
      eventTypeId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      memberIds: z8.array(z8.number())
    })).mutation(async ({ input, ctx }) => {
      const eventType = await getEventTypeById(input.eventTypeId);
      if (!eventType) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Tipo de evento n\xE3o encontrado" });
      }
      if (input.memberIds.length > eventType.maxPlayers) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: `M\xE1ximo de ${eventType.maxPlayers} jogadores para ${eventType.displayName}`
        });
      }
      const scheduleId = await createSchedule({
        eventTypeId: input.eventTypeId,
        eventDate: input.eventDate,
        createdBy: ctx.user.id
      });
      for (let index = 0; index < input.memberIds.length; index++) {
        const memberId = input.memberIds[index];
        await addScheduleEntry({ scheduleId, memberId, order: index + 1 });
      }
      return { success: true, scheduleId };
    }),
    sendNotification: managerProcedure.input(z8.object({
      eventTypeId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).mutation(async ({ input }) => {
      const schedule2 = await getScheduleByEventAndDate(input.eventTypeId, input.eventDate);
      if (!schedule2) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Escala\xE7\xE3o n\xE3o encontrada" });
      }
      const eventType = await getEventTypeById(input.eventTypeId);
      if (!eventType) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Tipo de evento n\xE3o encontrado" });
      }
      const entries = await getEntriesBySchedule(schedule2.id);
      const memberNames = entries.map((e) => e.member.name);
      const success = await sendScheduleNotification(
        eventType.displayName,
        eventType.eventTime,
        memberNames
      );
      if (success) {
        await updateSchedule(schedule2.id, { notificationSent: true });
      }
      return { success };
    }),
    history: protectedProcedure.input(z8.object({
      eventTypeId: z8.number().optional(),
      startDate: z8.string().optional(),
      endDate: z8.string().optional(),
      limit: z8.number().min(1).max(100).default(50)
    })).query(async ({ input }) => {
      const history = await getScheduleHistory(
        input.eventTypeId,
        input.startDate,
        input.endDate,
        input.limit
      );
      const result = await Promise.all(
        history.map(async (item) => {
          const entries = await getEntriesBySchedule(item.schedule.id);
          return {
            ...item.schedule,
            eventType: item.eventType,
            members: entries.map((e) => e.member)
          };
        })
      );
      return result;
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ ANNOUNCEMENTS ============
  announcements: router({
    list: protectedProcedure.input(z8.object({
      eventTypeId: z8.number().optional(),
      limit: z8.number().min(1).max(50).default(20)
    })).query(async ({ input }) => {
      if (input.eventTypeId) {
        const announcements2 = await getAnnouncementsByEvent(input.eventTypeId, input.limit);
        const result = await Promise.all(
          announcements2.map(async (ann) => {
            const recipients = await getAnnouncementRecipients(ann.id);
            return {
              ...ann,
              recipients: recipients.map((r) => r.member)
            };
          })
        );
        return result;
      } else {
        const announcements2 = await getGeneralAnnouncements(input.limit);
        return announcements2.map((ann) => ({
          ...ann,
          recipients: []
        }));
      }
    }),
    create: managerProcedure.input(z8.object({
      eventTypeId: z8.number().optional(),
      title: z8.string().min(1).max(200),
      message: z8.string().min(1).max(2e3),
      memberIds: z8.array(z8.number()).default([]),
      sendNow: z8.boolean().default(false),
      isGeneral: z8.boolean().default(false)
    })).mutation(async ({ input, ctx }) => {
      let announcementId;
      if (input.isGeneral || !input.eventTypeId) {
        announcementId = await createGeneralAnnouncement({
          title: input.title,
          message: input.message,
          createdBy: ctx.user.id,
          isGeneral: true
        });
        if (input.sendNow) {
          await sendGeneralAnnouncement(input.title, input.message);
        }
      } else {
        announcementId = await createAnnouncement({
          eventTypeId: input.eventTypeId,
          title: input.title,
          message: input.message,
          createdBy: ctx.user.id
        });
        for (const memberId of input.memberIds) {
          await addAnnouncementRecipient({ announcementId, memberId });
        }
        if (input.sendNow && input.memberIds.length > 0) {
          const members2 = await Promise.all(
            input.memberIds.map((id) => getMemberById(id))
          );
          const memberNames = members2.filter((m) => m).map((m) => m.name);
          await sendAnnouncementNotification(
            input.title,
            input.message,
            memberNames
          );
          await updateAnnouncementSentAt(announcementId);
        } else if (input.sendNow) {
          await sendGeneralAnnouncement(input.title, input.message);
          await updateAnnouncementSentAt(announcementId);
        }
      }
      return { success: true, announcementId };
    }),
    // Send private messages to selected members
    sendPrivate: managerProcedure.input(z8.object({
      title: z8.string().min(1).max(200),
      message: z8.string().min(1).max(2e3),
      memberIds: z8.array(z8.number())
    })).mutation(async ({ input }) => {
      const members2 = await Promise.all(
        input.memberIds.map((id) => getMemberById(id))
      );
      const membersWithChatId = members2.filter((m) => m && m.telegramChatId).map((m) => ({ chatId: m.telegramChatId, name: m.name }));
      if (membersWithChatId.length === 0) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Nenhum membro selecionado tem chat ID do Telegram configurado"
        });
      }
      const fullMessage = `\u{1F4E2} ${input.title}

${input.message}`;
      const result = await sendPrivateMessages(membersWithChatId, fullMessage);
      return {
        success: true,
        sent: result.success,
        failed: result.failed,
        total: membersWithChatId.length
      };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ GVG ATTACKS ============
  gvgAttacks: router({
    getBySchedule: protectedProcedure.input(z8.object({ scheduleId: z8.number() })).query(async ({ input }) => {
      return getGvgAttacksBySchedule(input.scheduleId);
    }),
    getByDate: protectedProcedure.input(z8.object({ eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(async ({ input }) => {
      return getGvgAttacksByDate(input.eventDate);
    }),
    save: managerProcedure.input(z8.object({
      scheduleId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      attacks: z8.array(z8.object({
        memberId: z8.number(),
        attack1Stars: z8.number().min(0).max(3).default(0),
        attack1Missed: z8.boolean().default(false),
        attack1Opponent: z8.string().optional(),
        attack2Stars: z8.number().min(0).max(3).default(0),
        attack2Missed: z8.boolean().default(false),
        attack2Opponent: z8.string().optional(),
        didNotAttack: z8.boolean().default(false)
      }))
    })).mutation(async ({ input, ctx }) => {
      const attacks = input.attacks.map((a) => ({
        ...a,
        scheduleId: input.scheduleId,
        eventDate: input.eventDate,
        createdBy: ctx.user.id
      }));
      await bulkUpsertGvgAttacks(attacks);
      return { success: true };
    }),
    getMatchInfo: protectedProcedure.input(z8.object({ eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(async ({ input }) => {
      return getGvgMatchInfo(input.eventDate);
    }),
    saveMatchInfo: managerProcedure.input(z8.object({
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      opponentGuild: z8.string().optional(),
      ourScore: z8.number().min(0).max(60).default(0),
      opponentScore: z8.number().min(0).max(60).default(0),
      validStars: z8.number().min(0).max(60).default(0)
    })).mutation(async ({ input }) => {
      await saveGvgMatchInfo(input);
      return { success: true };
    }),
    getMatchHistory: protectedProcedure.input(z8.object({ limit: z8.number().min(1).max(100).default(30) })).query(async ({ input }) => {
      return getGvgMatchHistory(input.limit);
    }),
    getEvolutionData: protectedProcedure.input(z8.object({
      startDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    })).query(async ({ input }) => {
      return getGvgEvolutionData(input.startDate, input.endDate);
    }),
    getNonAttackers: protectedProcedure.input(z8.object({ scheduleId: z8.number() })).query(async ({ input }) => {
      return getGvgNonAttackers(input.scheduleId);
    }),
    sendNonAttackerAlert: managerProcedure.input(z8.object({
      scheduleId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).mutation(async ({ input }) => {
      const nonAttackers = await getGvgNonAttackers(input.scheduleId);
      const names = nonAttackers.map((na) => na.member.name);
      if (names.length === 0) {
        return { success: true, message: "Todos atacaram!" };
      }
      const success = await sendNonAttackerAlert("GvG", input.eventDate, names);
      return { success, count: names.length };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ GOT ATTACKS ============
  gotAttacks: router({
    getBySchedule: protectedProcedure.input(z8.object({ scheduleId: z8.number() })).query(async ({ input }) => {
      return getGotAttacksBySchedule(input.scheduleId);
    }),
    getByDate: protectedProcedure.input(z8.object({ eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(async ({ input }) => {
      return getGotAttacksByDate(input.eventDate);
    }),
    save: managerProcedure.input(z8.object({
      scheduleId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      attacks: z8.array(z8.object({
        memberId: z8.number(),
        ranking: z8.number().optional(),
        power: z8.string().optional(),
        attackVictories: z8.number().min(0).default(0),
        attackDefeats: z8.number().min(0).default(0),
        defenseVictories: z8.number().min(0).default(0),
        defenseDefeats: z8.number().min(0).default(0),
        points: z8.number().min(0).default(0),
        didNotAttack: z8.boolean().default(false)
      }))
    })).mutation(async ({ input, ctx }) => {
      const attacks = input.attacks.map((a) => ({
        ...a,
        scheduleId: input.scheduleId,
        eventDate: input.eventDate,
        createdBy: ctx.user.id
      }));
      await bulkUpsertGotAttacks(attacks);
      return { success: true };
    }),
    getNonAttackers: protectedProcedure.input(z8.object({ scheduleId: z8.number() })).query(async ({ input }) => {
      return getGotNonAttackers(input.scheduleId);
    }),
    getPreviousPoints: protectedProcedure.input(z8.object({ eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(async ({ input }) => {
      return getGotPreviousPoints(input.eventDate);
    }),
    sendNonAttackerAlert: managerProcedure.input(z8.object({
      scheduleId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).mutation(async ({ input }) => {
      const nonAttackers = await getGotNonAttackers(input.scheduleId);
      const names = nonAttackers.map((na) => na.member.name);
      if (names.length === 0) {
        return { success: true, message: "Todos atacaram!" };
      }
      const success = await sendNonAttackerAlert("GoT", input.eventDate, names);
      return { success, count: names.length };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ SCREENSHOT ANALYSIS ============
  screenshots: router({
    analyzeGvg: managerProcedure.input(z8.object({
      imageBase64: z8.string(),
      scheduleId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.imageBase64, "base64");
      const fileName = `screenshots/gvg/${input.eventDate}-${Date.now()}.jpg`;
      const { url } = await storagePut(fileName, buffer, "image/jpeg");
      const eventType = await getEventTypeByName("gvg");
      await createScreenshotUpload({
        eventTypeId: eventType?.id || 1,
        eventDate: input.eventDate,
        imageUrl: url,
        createdBy: ctx.user.id,
        imageKey: fileName
      });
      const extractedData = await analyzeGvgScreenshot(url);
      const members2 = await getAllMembers();
      const matchedAttacks = extractedData.map((data) => {
        const member = matchPlayerToMember(data.playerName, members2);
        return {
          ...data,
          memberId: member?.id,
          memberName: member?.name || data.playerName,
          matched: !!member
        };
      });
      return {
        success: true,
        imageUrl: url,
        extractedData: matchedAttacks,
        totalExtracted: extractedData.length,
        totalMatched: matchedAttacks.filter((a) => a.matched).length
      };
    }),
    analyzeGot: managerProcedure.input(z8.object({
      imageBase64: z8.string(),
      scheduleId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.imageBase64, "base64");
      const fileName = `screenshots/got/${input.eventDate}-${Date.now()}.jpg`;
      const { url } = await storagePut(fileName, buffer, "image/jpeg");
      const eventType = await getEventTypeByName("got");
      await createScreenshotUpload({
        eventTypeId: eventType?.id || 2,
        eventDate: input.eventDate,
        imageUrl: url,
        createdBy: ctx.user.id,
        imageKey: fileName
      });
      const extractedData = await analyzeGotScreenshot(url);
      const members2 = await getAllMembers();
      const matchedAttacks = extractedData.map((data) => {
        const member = matchPlayerToMember(data.playerName, members2);
        return {
          ...data,
          memberId: member?.id,
          memberName: member?.name || data.playerName,
          matched: !!member
        };
      });
      return {
        success: true,
        imageUrl: url,
        extractedData: matchedAttacks,
        totalExtracted: extractedData.length,
        totalMatched: matchedAttacks.filter((a) => a.matched).length
      };
    }),
    getByEventAndDate: protectedProcedure.input(z8.object({
      eventTypeId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).query(async ({ input }) => {
      return getScreenshotsByEventAndDate(input.eventTypeId, input.eventDate);
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ PERFORMANCE RECORDS ============
  performance: router({
    getByEventAndDate: protectedProcedure.input(z8.object({
      eventTypeId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).query(async ({ input }) => {
      return getPerformanceByEventAndDate(input.eventTypeId, input.eventDate);
    }),
    save: managerProcedure.input(z8.object({
      eventTypeId: z8.number(),
      eventDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      records: z8.array(z8.object({
        memberId: z8.number(),
        attacked: z8.boolean(),
        notes: z8.string().optional()
      }))
    })).mutation(async ({ input, ctx }) => {
      await deletePerformanceByEventAndDate(input.eventTypeId, input.eventDate);
      for (const record of input.records) {
        await createPerformanceRecord({
          eventTypeId: input.eventTypeId,
          eventDate: input.eventDate,
          memberId: record.memberId,
          attacked: record.attacked,
          notes: record.notes,
          createdBy: ctx.user.id
        });
      }
      return { success: true };
    }),
    stats: protectedProcedure.input(z8.object({
      memberId: z8.number().optional(),
      eventTypeId: z8.number().optional()
    })).query(async ({ input }) => {
      return getMemberPerformanceStats(input.memberId, input.eventTypeId);
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ STATISTICS ============
  stats: router({
    memberParticipation: protectedProcedure.input(z8.object({
      eventTypeId: z8.number().optional(),
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).query(async ({ input }) => {
      return getMemberStats(void 0, input.eventTypeId, input.startDate, input.endDate);
    }),
    memberDetail: protectedProcedure.input(z8.object({
      memberId: z8.number(),
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).query(async ({ input }) => {
      return getMemberStats(input.memberId, void 0, input.startDate, input.endDate);
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ RANKING ============
  ranking: router({
    gvg: protectedProcedure.input(z8.object({
      startDate: z8.string().optional(),
      endDate: z8.string().optional(),
      limit: z8.number().optional().default(20)
    })).query(async ({ input }) => {
      return getGvgRanking(input.startDate, input.endDate, input.limit);
    }),
    got: protectedProcedure.input(z8.object({
      startDate: z8.string().optional(),
      endDate: z8.string().optional(),
      limit: z8.number().optional().default(20)
    })).query(async ({ input }) => {
      return getGotRankingLatest(input.startDate, input.endDate, input.limit);
    }),
    reliquias: protectedProcedure.input(z8.object({
      limit: z8.number().optional().default(20)
    })).query(async ({ input }) => {
      return getReliquiasRanking(input.limit);
    }),
    // Precisa de Atenção - GoT não atacaram na última batalha
    gotNonAttackersLatest: protectedProcedure.input(z8.object({
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).query(async ({ input }) => {
      return getGotNonAttackersLatest(input.startDate, input.endDate);
    }),
    // Precisa de Atenção - GoT desempenho ruim na última batalha
    gotLowPerformersLatest: protectedProcedure.input(z8.object({
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).query(async ({ input }) => {
      return getGotLowPerformersLatest(input.startDate, input.endDate);
    }),
    // Precisa de Atenção - GoT histórico de faltas em todas as batalhas
    gotNonAttackersHistory: protectedProcedure.input(z8.object({
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).query(async ({ input }) => {
      return getGotNonAttackersHistory(input.startDate, input.endDate);
    }),
    // Precisa de Atenção - GoT métrica de aproveitamento em todas as batalhas
    gotPerformanceMetrics: protectedProcedure.input(z8.object({
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).query(async ({ input }) => {
      return getGotPerformanceMetrics(input.startDate, input.endDate);
    }),
    // Enviar lembrete automático GoT
    sendAutomaticReminder: managerProcedure.input(z8.object({
      eventDate: z8.string(),
      nonAttackerNames: z8.array(z8.string()),
      customMessage: z8.string().optional()
    })).mutation(async ({ input }) => {
      const success = await sendAutomaticGotReminder(
        input.eventDate,
        input.nonAttackerNames,
        input.customMessage
      );
      return { success };
    }),
    // Enviar mensagem WhatsApp
    sendWhatsAppMessage: managerProcedure.input(z8.object({
      phoneNumber: z8.string(),
      text: z8.string(),
      whatsappToken: z8.string().optional()
    })).mutation(async ({ input }) => {
      const result = await sendWhatsAppMessage2(
        input.phoneNumber,
        input.text
      );
      return result;
    }),
    // Validar token WhatsApp
    validateWhatsAppToken: adminProcedure2.input(z8.object({
      token: z8.string()
    })).mutation(async ({ input }) => {
      const valid = true;
      return { valid };
    }),
    // WhatsApp Bot Management
    sendToTelegram: managerProcedure.input(z8.object({
      type: z8.enum(["gvg", "got"]),
      startDate: z8.string().optional(),
      endDate: z8.string().optional()
    })).mutation(async ({ input }) => {
      const config = await getTelegramConfig();
      if (!config?.botToken || !config?.chatId) {
        return { success: false, error: "Bot n\xE3o configurado" };
      }
      let message = "";
      if (input.type === "gvg") {
        const ranking = await getGvgRanking(input.startDate, input.endDate, 10);
        message = "\u{1F3C6} *RANKING GvG*\n";
        message += input.startDate || input.endDate ? `Per\xEDodo: ${input.startDate || "in\xEDcio"} at\xE9 ${input.endDate || "hoje"}

` : "Todo o per\xEDodo\n\n";
        ranking.forEach((p, i) => {
          const medal = i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : i === 2 ? "\u{1F949}" : `${i + 1}.`;
          message += `${medal} *${p.memberName}* - \u2B50 ${p.totalStars} (${p.totalAttacks} batalhas)
`;
        });
      } else {
        const ranking = await getGotRanking(input.startDate, input.endDate, 10);
        message = "\u{1F3C6} *RANKING GoT*\n";
        message += input.startDate || input.endDate ? `Per\xEDodo: ${input.startDate || "in\xEDcio"} at\xE9 ${input.endDate || "hoje"}

` : "Todo o per\xEDodo\n\n";
        ranking.forEach((p, i) => {
          const medal = i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : i === 2 ? "\u{1F949}" : `${i + 1}.`;
          message += `${medal} *${p.memberName}* - ${p.totalPoints} pts (${p.totalAttackVictories}V/${p.totalAttackDefeats}D atq, ${p.totalDefenseVictories}V/${p.totalDefenseDefeats}D def)
`;
        });
      }
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${config.botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: config.chatId,
              text: message,
              parse_mode: "Markdown"
            })
          }
        );
        return { success: response.ok };
      } catch {
        return { success: false };
      }
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ MEMBER HISTORY ============
  memberHistory: router({
    gvg: protectedProcedure.input(z8.object({ memberId: z8.number(), limit: z8.number().optional().default(50) })).query(async ({ input }) => {
      return getMemberGvgHistory(input.memberId, input.limit);
    }),
    got: protectedProcedure.input(z8.object({ memberId: z8.number(), limit: z8.number().optional().default(50) })).query(async ({ input }) => {
      return getMemberGotHistory(input.memberId, input.limit);
    }),
    reliquias: protectedProcedure.input(z8.object({ memberId: z8.number() })).query(async ({ input }) => {
      return getMemberReliquiasHistory(input.memberId);
    }),
    fullStats: protectedProcedure.input(z8.object({ memberId: z8.number() })).query(async ({ input }) => {
      return getMemberFullStats(input.memberId);
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ RELIQUIAS ============
  reliquias: router({
    // Season management
    getActiveSeason: protectedProcedure.query(async () => {
      return getActiveReliquiasSeason();
    }),
    getAllSeasons: protectedProcedure.query(async () => {
      return getAllReliquiasSeasons();
    }),
    createSeason: adminProcedure2.input(z8.object({
      name: z8.string().min(1).max(100),
      startDate: z8.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })).mutation(async ({ input }) => {
      const seasonId = await createReliquiasSeason({
        name: input.name,
        startDate: input.startDate,
        isActive: true
      });
      return { success: true, seasonId };
    }),
    endSeason: adminProcedure2.input(z8.object({ seasonId: z8.number() })).mutation(async ({ input }) => {
      await endReliquiasSeason(input.seasonId);
      return { success: true };
    }),
    // Boss progress
    getBossProgress: protectedProcedure.input(z8.object({ seasonId: z8.number() })).query(async ({ input }) => {
      return getBossProgressBySeason(input.seasonId);
    }),
    getCurrentBoss: protectedProcedure.input(z8.object({ seasonId: z8.number() })).query(async ({ input }) => {
      return getCurrentBoss(input.seasonId);
    }),
    defeatGuard: managerProcedure.input(z8.object({ bossId: z8.number() })).mutation(async ({ input }) => {
      await defeatGuard(input.bossId);
      return { success: true };
    }),
    defeatBoss: managerProcedure.input(z8.object({ bossId: z8.number() })).mutation(async ({ input }) => {
      await defeatBoss(input.bossId);
      return { success: true };
    }),
    // Member roles
    getMemberRoles: protectedProcedure.input(z8.object({ seasonId: z8.number() })).query(async ({ input }) => {
      return getMemberRolesBySeason(input.seasonId);
    }),
    setMemberRole: managerProcedure.input(z8.object({
      seasonId: z8.number(),
      memberId: z8.number(),
      role: z8.enum(["guards", "boss"])
    })).mutation(async ({ input }) => {
      await setMemberRole(input.seasonId, input.memberId, input.role);
      return { success: true };
    }),
    // Damage tracking
    getDamageRanking: protectedProcedure.input(z8.object({ seasonId: z8.number() })).query(async ({ input }) => {
      return getDamageRankingBySeason(input.seasonId);
    }),
    updateDamage: managerProcedure.input(z8.object({
      seasonId: z8.number(),
      memberId: z8.number(),
      cumulativeDamage: z8.string(),
      damageNumeric: z8.number(),
      ranking: z8.number().optional(),
      power: z8.string().optional()
    })).mutation(async ({ input }) => {
      await upsertMemberDamage(
        input.seasonId,
        input.memberId,
        input.cumulativeDamage,
        input.damageNumeric,
        input.ranking,
        input.power
      );
      return { success: true };
    }),
    // Screenshot analysis for Reliquias
    analyzeScreenshot: managerProcedure.input(z8.object({
      imageBase64: z8.string(),
      seasonId: z8.number()
    })).mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.imageBase64, "base64");
      const fileName = `screenshots/reliquias/${input.seasonId}-${Date.now()}.jpg`;
      const { url } = await storagePut(fileName, buffer, "image/jpeg");
      const eventType = await getEventTypeByName("reliquias");
      await createScreenshotUpload({
        eventTypeId: eventType?.id || 3,
        eventDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        imageUrl: url,
        createdBy: ctx.user.id,
        imageKey: fileName
      });
      const extractedData = await analyzeReliquiasScreenshot(url);
      const members2 = await getAllMembers();
      const matchedDamage = extractedData.map((data) => {
        const member = matchPlayerToMember(data.playerName, members2);
        return {
          ...data,
          memberId: member?.id,
          memberName: member?.name || data.playerName,
          matched: !!member
        };
      });
      return {
        success: true,
        imageUrl: url,
        extractedData: matchedDamage,
        totalExtracted: extractedData.length,
        totalMatched: matchedDamage.filter((a) => a.matched).length
      };
    }),
    // Bulk update damage from screenshot analysis
    bulkUpdateDamage: managerProcedure.input(z8.object({
      seasonId: z8.number(),
      damages: z8.array(z8.object({
        memberId: z8.number(),
        cumulativeDamage: z8.string(),
        damageNumeric: z8.number(),
        ranking: z8.number().optional(),
        power: z8.string().optional()
      }))
    })).mutation(async ({ input }) => {
      for (const damage of input.damages) {
        await upsertMemberDamage(
          input.seasonId,
          damage.memberId,
          damage.cumulativeDamage,
          damage.damageNumeric,
          damage.ranking,
          damage.power
        );
      }
      return { success: true, count: input.damages.length };
    }),
    // Member assignments per boss
    getMemberAssignments: protectedProcedure.input(z8.object({
      seasonId: z8.number(),
      bossName: z8.string(),
      attackNumber: z8.number().optional()
    })).query(async ({ input }) => {
      return getReliquiasMemberAssignments(
        input.seasonId,
        input.bossName,
        input.attackNumber || 1
      );
    }),
    getAllMemberAssignments: protectedProcedure.input(z8.object({ seasonId: z8.number() })).query(async ({ input }) => {
      return getAllReliquiasMemberAssignmentsForSeason(input.seasonId);
    }),
    setMemberAssignment: managerProcedure.input(z8.object({
      seasonId: z8.number(),
      memberId: z8.number(),
      bossName: z8.string(),
      attackNumber: z8.number().optional(),
      role: z8.enum(["guards", "boss"]),
      guard1Number: z8.number().optional().nullable(),
      guard2Number: z8.number().optional().nullable(),
      performance: z8.string().optional().nullable()
    })).mutation(async ({ input }) => {
      await upsertReliquiasMemberAssignment({
        seasonId: input.seasonId,
        memberId: input.memberId,
        bossName: input.bossName,
        attackNumber: input.attackNumber || 1,
        role: input.role,
        guard1Number: input.guard1Number ?? void 0,
        guard2Number: input.guard2Number ?? void 0,
        performance: input.performance ?? void 0
      });
      return { success: true };
    }),
    removeMemberAssignment: managerProcedure.input(z8.object({
      seasonId: z8.number(),
      memberId: z8.number(),
      bossName: z8.string(),
      attackNumber: z8.number().optional()
    })).mutation(async ({ input }) => {
      await deleteReliquiasMemberAssignment(
        input.seasonId,
        input.memberId,
        input.bossName,
        input.attackNumber || 1
      );
      return { success: true };
    }),
    // Send Reliquias reminder notification
    sendReminder: managerProcedure.input(z8.object({
      seasonId: z8.number(),
      bossName: z8.string(),
      attackNumber: z8.number().optional(),
      minutesBefore: z8.number()
    })).mutation(async ({ input }) => {
      const assignments = await getReliquiasMemberAssignments(
        input.seasonId,
        input.bossName,
        input.attackNumber || 1
      );
      const bossAttackers = assignments.filter((a) => a.assignment.role === "boss").map((a) => a.member.name);
      const guardsAttackers = assignments.filter((a) => a.assignment.role === "guards").map((a) => ({
        name: a.member.name,
        guard1: a.assignment.guard1Number,
        guard2: a.assignment.guard2Number
      }));
      const sent = await sendReliquiasReminder(
        input.bossName,
        input.minutesBefore,
        bossAttackers,
        guardsAttackers
      );
      return { success: sent, bossCount: bossAttackers.length, guardsCount: guardsAttackers.length };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ BOT CONFIG ============
  bot: router({
    getConfig: adminProcedure2.query(async () => {
      const config = await getBotConfig();
      return config ? {
        hasToken: !!config.telegramBotToken,
        telegramGroupId: config.telegramGroupId,
        isActive: config.isActive
      } : null;
    }),
    testConnection: adminProcedure2.input(z8.object({ token: z8.string() })).mutation(async ({ input }) => {
      if (!validateBotToken(input.token)) {
        return { success: false, error: "Formato de token inv\xE1lido" };
      }
      const result = await testBotConnection(input.token);
      if (result.success && result.botName && !validateBotUsername(result.botName)) {
        return { success: false, error: 'O nome do bot deve terminar com "bot"' };
      }
      return result;
    }),
    saveConfig: adminProcedure2.input(z8.object({
      telegramBotToken: z8.string().optional(),
      telegramGroupId: z8.string().optional(),
      isActive: z8.boolean().optional()
    })).mutation(async ({ input }) => {
      if (input.telegramBotToken && !validateBotToken(input.telegramBotToken)) {
        throw new TRPCError4({ code: "BAD_REQUEST", message: "Formato de token inv\xE1lido" });
      }
      await upsertBotConfig(input);
      return { success: true };
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  whatsapp: router({
    initialize: adminProcedure2.mutation(async () => {
      try {
        await initializeWhatsAppClient();
        const status = getWhatsAppStatus2();
        return { success: true, status };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
    status: protectedProcedure.query(() => getWhatsAppStatus2()),
    sendMessage: managerProcedure.input(z8.object({ phoneNumber: z8.string(), message: z8.string() })).mutation(async ({ input }) => ({
      success: await sendWhatsAppMessage2(input.phoneNumber, input.message)
    })),
    sendMentionMessage: managerProcedure.input(z8.object({ phoneNumber: z8.string(), message: z8.string(), mentionedNumbers: z8.array(z8.string()) })).mutation(async ({ input }) => ({
      success: await sendWhatsAppMentionMessage(input.mentionedNumbers, input.message)
    })),
    sendGotReminder: managerProcedure.input(z8.object({ memberPhones: z8.array(z8.object({ phoneNumber: z8.string(), name: z8.string() })), customMessage: z8.string().optional() })).mutation(async ({ input }) => sendGotReminder(input.memberPhones, input.customMessage || "")),
    disconnect: adminProcedure2.mutation(async () => {
      await disconnectWhatsApp2();
      return { success: true };
    }),
    clearSession: adminProcedure2.mutation(async () => {
      clearWhatsAppSession();
      return { success: true };
    }),
    getQRCode: protectedProcedure.query(() => ({ qrCode: getCurrentQRCode() })),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ GoT STRATEGIES ============
  gotStrategies: router({
    getAll: protectedProcedure.query(async () => {
      return getAllGotStrategies();
    }),
    search: protectedProcedure.input(z8.object({ keyword: z8.string() })).query(async ({ input }) => {
      const names = input.keyword.split(/\s+/).filter((n) => n.length > 0);
      if (names.length > 1) {
        return searchGotStrategiesByMultipleNames(names.slice(0, 3));
      } else if (names.length === 1) {
        const byName = await searchGotStrategies(names[0]);
        if (byName.length > 0) {
          return byName;
        }
        return searchGotStrategiesByMultipleNames([names[0]]);
      } else {
        return getAllGotStrategies();
      }
    }),
    create: protectedProcedure.input(z8.object({
      name: z8.string().max(100).optional(),
      observation: z8.string().optional(),
      attackFormation1: z8.string().min(1).max(50),
      attackFormation2: z8.string().min(1).max(50),
      attackFormation3: z8.string().min(1).max(50),
      defenseFormation1: z8.string().min(1).max(50),
      defenseFormation2: z8.string().min(1).max(50),
      defenseFormation3: z8.string().min(1).max(50)
    })).mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          console.error("[tRPC] User ID not available");
          throw new TRPCError4({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }
        const strategy = await createGotStrategy({
          name: input.name || void 0,
          observation: input.observation || void 0,
          attackFormation1: input.attackFormation1,
          attackFormation2: input.attackFormation2,
          attackFormation3: input.attackFormation3,
          defenseFormation1: input.defenseFormation1,
          defenseFormation2: input.defenseFormation2,
          defenseFormation3: input.defenseFormation3,
          createdBy: ctx.user.id,
          usageCount: 0
        });
        if (!strategy) {
          throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create strategy" });
        }
        await backupGotStrategy(strategy.id, strategy, {
          backupType: "create",
          backupReason: "Estrat\xE9gia criada",
          createdBy: ctx.user.id
        });
        return strategy;
      } catch (error) {
        console.error("[tRPC] Error creating strategy:", error);
        const msg = error instanceof Error ? error.message : "Unknown error";
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: `Failed to create strategy: ${msg}` });
      }
    }),
    update: protectedProcedure.input(z8.object({
      id: z8.number(),
      name: z8.string().max(100).optional(),
      observation: z8.string().optional(),
      attackFormation1: z8.string().max(50).optional(),
      attackFormation2: z8.string().max(50).optional(),
      attackFormation3: z8.string().max(50).optional(),
      defenseFormation1: z8.string().max(50).optional(),
      defenseFormation2: z8.string().max(50).optional(),
      defenseFormation3: z8.string().max(50).optional()
    })).mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updates } = input;
        const oldStrategy = await getGotStrategyById(id);
        if (oldStrategy) {
          await backupGotStrategy(id, oldStrategy, {
            backupType: "update",
            backupReason: "Antes de atualiza\xE7\xE3o",
            createdBy: ctx.user?.id || 0
          });
        }
        const strategy = await updateGotStrategy(id, updates);
        if (!strategy) {
          throw new TRPCError4({ code: "NOT_FOUND", message: "Strategy not found" });
        }
        return strategy;
      } catch (error) {
        console.error("[tRPC] Error updating strategy:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update strategy" });
      }
    }),
    delete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input, ctx }) => {
      try {
        const strategy = await getGotStrategyById(input.id);
        if (strategy) {
          await backupGotStrategy(input.id, strategy, {
            backupType: "delete",
            backupReason: "Estrat\xE9gia deletada",
            createdBy: ctx.user?.id || 0
          });
        }
        const success = await deleteGotStrategy(input.id);
        if (!success) {
          throw new TRPCError4({ code: "NOT_FOUND", message: "Strategy not found" });
        }
        return { success };
      } catch (error) {
        console.error("[tRPC] Error deleting strategy:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete strategy" });
      }
    }),
    sendToTelegram: protectedProcedure.input(z8.object({ strategyIds: z8.array(z8.number()) })).mutation(async ({ input }) => {
      try {
        if (input.strategyIds.length === 0) {
          throw new TRPCError4({ code: "BAD_REQUEST", message: "Selecione pelo menos uma estrat\xE9gia" });
        }
        const strategies = await Promise.all(
          input.strategyIds.map((id) => getGotStrategyById(id))
        );
        const validStrategies = strategies.filter((s) => s !== null);
        if (validStrategies.length === 0) {
          throw new TRPCError4({ code: "NOT_FOUND", message: "Nenhuma estrat\xE9gia encontrada" });
        }
        let message = "";
        message += "\u{1F4E2} *Estrat\xE9gias GoT*\n\n";
        validStrategies.forEach((strategy) => {
          message += `*${strategy.name}*

`;
          message += `Ataque x Defesa

`;
          message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
          message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
          message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}

`;
        });
        await sendGeneralAnnouncement("Estrat\xE9gias GoT", message);
        return { success: true, count: validStrategies.length };
      } catch (error) {
        console.error("[tRPC] Error sending strategies to Telegram:", error);
        const msg = error instanceof Error ? error.message : "Erro ao enviar para Telegram";
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: msg });
      }
    }),
    export: protectedProcedure.query(async () => {
      try {
        const strategies = await getAllGotStrategies();
        const exportData = exportStrategies(strategies);
        return exportData;
      } catch (error) {
        console.error("[tRPC] Error exporting strategies:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao exportar estrat\xE9gias" });
      }
    }),
    import: protectedProcedure.input(z8.object({
      fileContent: z8.string()
    })).mutation(async ({ input, ctx }) => {
      try {
        const parseResult = parseImportFile(input.fileContent);
        if (!parseResult.data) {
          throw new TRPCError4({ code: "BAD_REQUEST", message: parseResult.error || "Erro ao processar arquivo" });
        }
        const importData = parseResult.data;
        const stats = getImportStats(importData);
        let importedCount = 0;
        let skippedCount = 0;
        for (const strategy of importData.strategies) {
          try {
            const existing = await searchGotStrategies(strategy.name || "");
            const isDuplicate = existing.some(
              (s) => s.attackFormation1 === strategy.attackFormation.split(" x ")[0]?.trim()
            );
            if (!isDuplicate) {
              const attackParts = strategy.attackFormation.split(" x ").map((s) => s.trim());
              const defenseParts = strategy.defenseFormation.split(" x ").map((s) => s.trim());
              await createGotStrategy({
                name: strategy.name || void 0,
                observation: strategy.observation || void 0,
                attackFormation1: attackParts[0] || "",
                attackFormation2: attackParts[1] || "",
                attackFormation3: attackParts[2] || "",
                defenseFormation1: defenseParts[0] || "",
                defenseFormation2: defenseParts[1] || "",
                defenseFormation3: defenseParts[2] || "",
                createdBy: ctx.user?.id || 0,
                usageCount: 0
              });
              importedCount++;
            } else {
              skippedCount++;
            }
          } catch (error) {
            console.error("[tRPC] Error importing single strategy:", error);
            skippedCount++;
          }
        }
        return {
          success: true,
          importedCount,
          skippedCount,
          totalProcessed: importData.strategies.length,
          message: `Importadas ${importedCount} estrat\xE9gias. ${skippedCount} duplicatas ignoradas.`
        };
      } catch (error) {
        console.error("[tRPC] Error importing strategies:", error);
        const msg = error instanceof Error ? error.message : "Erro ao importar estrat\xE9gias";
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: msg });
      }
    }),
    // Backup history
    getBackupHistory: protectedProcedure.input(z8.object({ strategyId: z8.number() })).query(async ({ input }) => {
      const { getGotStrategyBackupHistory: getGotStrategyBackupHistory2 } = await Promise.resolve().then(() => (init_strategyBackup(), strategyBackup_exports));
      return getGotStrategyBackupHistory2(input.strategyId);
    }),
    // Restore from backup
    restoreFromBackup: protectedProcedure.input(z8.object({ backupId: z8.number() })).mutation(async ({ input, ctx }) => {
      try {
        const { restoreGotStrategyFromBackup: restoreGotStrategyFromBackup2 } = await Promise.resolve().then(() => (init_strategyBackup(), strategyBackup_exports));
        const success = await restoreGotStrategyFromBackup2(input.backupId, ctx.user?.id || 0);
        if (!success) {
          throw new TRPCError4({ code: "NOT_FOUND", message: "Backup n\xE3o encontrado" });
        }
        return { success };
      } catch (error) {
        console.error("[tRPC] Error restoring from backup:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao restaurar backup" });
      }
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ GVG SEASONS ============
  gvgSeasons: router({
    getActive: protectedProcedure.query(async () => {
      return getActiveSeason();
    }),
    getAll: protectedProcedure.query(async () => {
      return getAllSeasons();
    }),
    create: adminProcedure2.input(z8.object({
      name: z8.string().min(1),
      startDate: z8.date(),
      endDate: z8.date(),
      returnDate: z8.date().optional(),
      description: z8.string().optional()
    })).mutation(async ({ input }) => {
      const season = await createGvgSeason({
        name: input.name,
        status: "active",
        startDate: input.startDate,
        endDate: input.endDate,
        returnDate: input.returnDate,
        description: input.description
      });
      return season || { error: "Failed to create season" };
    }),
    updateStatus: adminProcedure2.input(z8.object({
      seasonId: z8.number(),
      status: z8.enum(["active", "paused", "ended"])
    })).mutation(async ({ input }) => {
      const season = await updateSeasonStatus(input.seasonId, input.status);
      return season || { error: "Failed to update season" };
    }),
    endAndStart: adminProcedure2.input(z8.object({
      newSeasonName: z8.string().min(1),
      newStartDate: z8.date(),
      newEndDate: z8.date(),
      newReturnDate: z8.date().optional(),
      description: z8.string().optional()
    })).mutation(async ({ input }) => {
      const result = await endCurrentSeasonAndStartNew({
        name: input.newSeasonName,
        status: "active",
        startDate: input.newStartDate,
        endDate: input.newEndDate,
        returnDate: input.newReturnDate,
        description: input.description
      });
      return result;
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  botStatus: publicProcedure.query(async () => {
    const health = getBotHealth();
    return {
      isAlive: health.isAlive,
      status: health.status,
      messageCount: health.messageCount,
      uptime: health.uptime,
      lastHeartbeat: new Date(health.lastHeartbeat).toISOString(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  resurrectTelegramBot: adminProcedure2.mutation(async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    const success = await resurrectBot(token);
    const health = getBotHealth();
    return {
      success,
      status: health.status,
      isAlive: health.isAlive,
      message: success ? "Bot ressuscitado com sucesso!" : "Falha ao ressuscitar Bot"
    };
  }),
  gvgStrategies: router({
    getAll: protectedProcedure.query(async () => {
      return getAllGvgStrategies();
    }),
    create: protectedProcedure.input(z8.object({
      name: z8.string().max(100).optional(),
      observation: z8.string().optional(),
      attackFormation1: z8.string().min(1).max(50),
      attackFormation2: z8.string().min(1).max(50),
      attackFormation3: z8.string().min(1).max(50),
      attackFormation4: z8.string().min(1).max(50),
      attackFormation5: z8.string().min(1).max(50),
      defenseFormation1: z8.string().min(1).max(50),
      defenseFormation2: z8.string().min(1).max(50),
      defenseFormation3: z8.string().min(1).max(50),
      defenseFormation4: z8.string().min(1).max(50),
      defenseFormation5: z8.string().min(1).max(50)
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError4({ code: "UNAUTHORIZED" });
      return createGvgStrategy({ ...input, createdBy: ctx.user.id, usageCount: 0 });
    }),
    update: protectedProcedure.input(z8.object({
      id: z8.number(),
      name: z8.string().max(100).optional(),
      observation: z8.string().optional(),
      attackFormation1: z8.string().max(50).optional(),
      attackFormation2: z8.string().max(50).optional(),
      attackFormation3: z8.string().max(50).optional(),
      attackFormation4: z8.string().max(50).optional(),
      attackFormation5: z8.string().max(50).optional(),
      defenseFormation1: z8.string().max(50).optional(),
      defenseFormation2: z8.string().max(50).optional(),
      defenseFormation3: z8.string().max(50).optional(),
      defenseFormation4: z8.string().max(50).optional(),
      defenseFormation5: z8.string().max(50).optional()
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return updateGvgStrategy(id, updates);
    }),
    delete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input }) => {
      return deleteGvgStrategy(input.id);
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  backup: router({
    exportGotStrategies: publicProcedure.query(async () => {
      try {
        const strategies = await getAllGotStrategies();
        return {
          success: true,
          data: strategies,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          count: strategies.length
        };
      } catch (error) {
        console.error("[Backup] Erro ao exportar estrat\xE9gias:", error);
        return {
          success: false,
          error: "Erro ao exportar estrat\xE9gias",
          data: []
        };
      }
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  // ============ CARDS ============
  cards: router({
    list: publicProcedure.query(async () => {
      return getAllCards();
    }),
    search: publicProcedure.input(z8.object({ query: z8.string() })).query(async ({ input }) => {
      return searchCards(input.query);
    }),
    getById: publicProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
      return getCardById(input.id);
    }),
    create: protectedProcedure.input(z8.object({
      name: z8.string().min(1).max(100),
      imageUrl: z8.string().max(500).optional(),
      referenceLink: z8.string().max(500).optional(),
      usageLimit: z8.string().min(1).max(255),
      bonusDmg: z8.string().default("0"),
      bonusDef: z8.string().default("0"),
      bonusVid: z8.string().default("0"),
      bonusPress: z8.string().default("0"),
      bonusEsquiva: z8.string().default("0"),
      bonusVelAtaq: z8.string().default("0"),
      bonusTenacidade: z8.string().default("0"),
      bonusSanguessuga: z8.string().default("0"),
      bonusRedDano: z8.string().default("0"),
      bonusCrit: z8.string().default("0"),
      bonusCura: z8.string().default("0"),
      bonusCuraRecebida: z8.string().default("0"),
      bonusPrecisao: z8.string().default("0"),
      bonusVida: z8.string().default("0"),
      skillEffect: z8.string().optional()
    })).mutation(async ({ input, ctx }) => {
      try {
        const card = await createCard({
          ...input,
          createdBy: ctx.user.id
        });
        return { success: true, data: card };
      } catch (error) {
        console.error("[Cards] Erro ao criar carta:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar carta" });
      }
    }),
    update: protectedProcedure.input(z8.object({
      id: z8.number(),
      name: z8.string().min(1).max(100).optional(),
      imageUrl: z8.string().max(500).optional(),
      referenceLink: z8.string().max(500).optional(),
      usageLimit: z8.string().min(1).max(255).optional(),
      bonusDmg: z8.string().optional(),
      bonusDef: z8.string().optional(),
      bonusVid: z8.string().optional(),
      bonusPress: z8.string().optional(),
      bonusEsquiva: z8.string().optional(),
      bonusVelAtaq: z8.string().optional(),
      bonusTenacidade: z8.string().optional(),
      bonusSanguessuga: z8.string().optional(),
      bonusRedDano: z8.string().optional(),
      bonusCrit: z8.string().optional(),
      bonusCura: z8.string().optional(),
      bonusCuraRecebida: z8.string().optional(),
      bonusPrecisao: z8.string().optional(),
      bonusVida: z8.string().optional(),
      skillEffect: z8.string().optional()
    })).mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;
        const card = await updateCard(id, updateData);
        return { success: true, data: card };
      } catch (error) {
        console.error("[Cards] Erro ao atualizar carta:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar carta" });
      }
    }),
    delete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input }) => {
      try {
        const success = await deleteCard(input.id);
        return { success };
      } catch (error) {
        console.error("[Cards] Erro ao deletar carta:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar carta" });
      }
    }),
    export: publicProcedure.query(async () => {
      try {
        const jsonData = await exportCardsAsJson();
        return {
          success: true,
          data: jsonData,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (error) {
        console.error("[Cards] Erro ao exportar cartas:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao exportar cartas" });
      }
    }),
    import: protectedProcedure.input(z8.object({ jsonData: z8.string() })).mutation(async ({ input, ctx }) => {
      try {
        const importedCount = await importCardsFromJson(input.jsonData, ctx.user.id);
        return { success: true, importedCount };
      } catch (error) {
        console.error("[Cards] Erro ao importar cartas:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao importar cartas" });
      }
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  characters: router({
    list: publicProcedure.query(async () => {
      try {
        const characters2 = await getAllCharacters();
        return { success: true, data: characters2 };
      } catch (error) {
        console.error("[Characters] Erro ao listar personagens:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao listar personagens" });
      }
    }),
    search: publicProcedure.input(z8.object({ query: z8.string() })).query(async ({ input }) => {
      try {
        const characters2 = await searchCharacters(input.query);
        return { success: true, data: characters2 };
      } catch (error) {
        console.error("[Characters] Erro ao buscar personagens:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar personagens" });
      }
    }),
    getById: publicProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
      try {
        const character = await getCharacterById(input.id);
        if (!character) {
          throw new TRPCError4({ code: "NOT_FOUND", message: "Personagem n\xE3o encontrado" });
        }
        const skills = await getCharacterSkills(input.id);
        const cloth = await getCharacterCloth(input.id);
        const constellations = await getCharacterConstellations(input.id);
        const links = await getCharacterLinks(input.id);
        return { success: true, data: { ...character, skills, cloth, constellations, links } };
      } catch (error) {
        console.error("[Characters] Erro ao buscar personagem:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar personagem" });
      }
    }),
    getByClass: publicProcedure.input(z8.object({ class: z8.string() })).query(async ({ input }) => {
      try {
        const characters2 = await getCharactersByClass(input.class);
        return { success: true, data: characters2 };
      } catch (error) {
        console.error("[Characters] Erro ao filtrar por classe:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao filtrar por classe" });
      }
    }),
    getByType: publicProcedure.input(z8.object({ type: z8.string() })).query(async ({ input }) => {
      try {
        const characters2 = await getCharactersByType(input.type);
        return { success: true, data: characters2 };
      } catch (error) {
        console.error("[Characters] Erro ao filtrar por tipo:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao filtrar por tipo" });
      }
    }),
    create: protectedProcedure.input(z8.object({
      name: z8.string(),
      class: z8.string().optional(),
      type: z8.string().optional(),
      hp: z8.number().optional(),
      atk: z8.number().optional(),
      def: z8.number().optional(),
      cosmos_gain_atk: z8.number().optional(),
      cosmos_gain_dmg: z8.number().optional(),
      dano_percent: z8.number().optional(),
      defesa_percent: z8.number().optional(),
      resistencia: z8.number().optional(),
      pressa: z8.number().optional(),
      esquiva_percent: z8.number().optional(),
      vel_ataque_percent: z8.number().optional(),
      tenacidade: z8.number().optional(),
      sanguessuga: z8.number().optional(),
      dano_vermelho_percent: z8.number().optional(),
      tax_critico: z8.number().optional(),
      precisao: z8.number().optional(),
      cura_percent: z8.number().optional(),
      cura_recebida_percent: z8.number().optional(),
      bonus_vida_percent: z8.number().optional(),
      red_dano_percent: z8.number().optional(),
      esquiva_valor: z8.number().optional(),
      efeito_habilidade: z8.string().optional(),
      image_url: z8.string().optional(),
      ssloj_url: z8.string().optional()
    })).mutation(async ({ input }) => {
      try {
        const id = await createCharacter(input);
        return { success: true, id };
      } catch (error) {
        console.error("[Characters] Erro ao criar personagem:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar personagem" });
      }
    }),
    update: protectedProcedure.input(z8.object({
      id: z8.number(),
      name: z8.string().optional(),
      class: z8.string().optional(),
      type: z8.string().optional(),
      hp: z8.number().optional(),
      atk: z8.number().optional(),
      def: z8.number().optional(),
      cosmos_gain_atk: z8.number().optional(),
      cosmos_gain_dmg: z8.number().optional(),
      dano_percent: z8.number().optional(),
      defesa_percent: z8.number().optional(),
      resistencia: z8.number().optional(),
      pressa: z8.number().optional(),
      esquiva_percent: z8.number().optional(),
      vel_ataque_percent: z8.number().optional(),
      tenacidade: z8.number().optional(),
      sanguessuga: z8.number().optional(),
      dano_vermelho_percent: z8.number().optional(),
      tax_critico: z8.number().optional(),
      precisao: z8.number().optional(),
      cura_percent: z8.number().optional(),
      cura_recebida_percent: z8.number().optional(),
      bonus_vida_percent: z8.number().optional(),
      red_dano_percent: z8.number().optional(),
      esquiva_valor: z8.number().optional(),
      efeito_habilidade: z8.string().optional(),
      image_url: z8.string().optional(),
      ssloj_url: z8.string().optional()
    })).mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;
        const character = await updateCharacter(id, updateData);
        return { success: true, data: character };
      } catch (error) {
        console.error("[Characters] Erro ao atualizar personagem:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar personagem" });
      }
    }),
    delete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ input }) => {
      try {
        const success = await deleteCharacter(input.id);
        return { success };
      } catch (error) {
        console.error("[Characters] Erro ao deletar personagem:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar personagem" });
      }
    }),
    export: publicProcedure.query(async () => {
      try {
        const jsonData = await exportCharactersToJson();
        return { success: true, data: jsonData, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      } catch (error) {
        console.error("[Characters] Erro ao exportar personagens:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao exportar personagens" });
      }
    }),
    import: protectedProcedure.input(z8.object({ jsonData: z8.string() })).mutation(async ({ input }) => {
      try {
        const importedCount = await importCharactersFromJson(input.jsonData);
        return { success: true, importedCount };
      } catch (error) {
        console.error("[Characters] Erro ao importar personagens:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao importar personagens" });
      }
    }),
    searchWithAI: protectedProcedure.input(z8.object({
      cardName: z8.string().min(1)
    })).mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Retorne apenas JSON v\xE1lido com informa\xE7\xF5es sobre cartas de jogo." },
            { role: "user", content: `Procure informa\xE7\xF5es sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` }
          ]
        });
        const content = response.choices[0].message.content;
        const cardData = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: cardData };
      } catch (error) {
        console.error("[Cards] Erro ao buscar com IA:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informa\xE7\xF5es com IA" });
      }
    })
  }),
  recommendations: recommendationsRouter,
  aiChat: aiChatRouter,
  arayashikiAnalysis: arayashikiAnalysisRouter,
  arayashikiSync: arayashikiSyncRouter,
  cardAnalysis: cardAnalysisRouter,
  accounts: accountsRouter
});

// server/_core/context.ts
var MOCK_USER = {
  id: 1,
  openId: "admin",
  name: "Admin",
  email: "admin@sapuri.local",
  role: "admin",
  loginMethod: "direct",
  createdAt: /* @__PURE__ */ new Date(),
  updatedAt: /* @__PURE__ */ new Date(),
  lastSignedIn: /* @__PURE__ */ new Date()
};
async function createContext(opts) {
  return {
    req: opts.req,
    res: opts.res,
    user: MOCK_USER
  };
}

// server/_core/vite.ts
import express from "express";
import fs4 from "fs";
import { nanoid } from "nanoid";
import path5 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path4.resolve(import.meta.dirname),
  root: path4.resolve(import.meta.dirname, "client"),
  publicDir: path4.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path5.resolve(import.meta.dirname, "../..", "dist", "public") : path5.resolve(import.meta.dirname, "public");
  if (!fs4.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/gotBotIntegration.ts
init_db();

// server/_core/strategyCache.ts
var CACHE_TTL = 5 * 60 * 1e3;
var cache = {
  byCharacter: /* @__PURE__ */ new Map(),
  byName: /* @__PURE__ */ new Map(),
  byKeyword: /* @__PURE__ */ new Map(),
  allStrategies: null
};
function isExpired(entry) {
  return Date.now() - entry.timestamp > CACHE_TTL;
}
function getCachedByCharacter(character) {
  const entry = cache.byCharacter.get(character.toLowerCase());
  if (!entry || isExpired(entry)) {
    cache.byCharacter.delete(character.toLowerCase());
    return null;
  }
  console.log(`[Cache] Hit: byCharacter/${character}`);
  return entry.data;
}
function setCachedByCharacter(character, data) {
  cache.byCharacter.set(character.toLowerCase(), {
    data,
    timestamp: Date.now()
  });
  console.log(`[Cache] Set: byCharacter/${character} (${data.length} items)`);
}

// server/gotBotIntegration.ts
function strategyContainsAllCharactersInAttack(strategy, characters2) {
  if (characters2.length === 0) return true;
  const fullAttackFormation = `${strategy.attackFormation1} ${strategy.attackFormation2} ${strategy.attackFormation3}`.toLowerCase();
  return characters2.every((char) => {
    const charLower = char.toLowerCase();
    const words = fullAttackFormation.split(/\s+/);
    return words.some((word) => word.includes(charLower));
  });
}
async function handleEstrategiaCommand(chatId) {
  try {
    console.log("[GoT Bot Integration] Handling /estrategia command for chat:", chatId);
    const strategies = await getAllGotStrategies();
    console.log("[GoT Bot Integration] Found", strategies.length, "strategies");
    return sendGotStrategiesSuggestions(chatId, strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /estrategia command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar estrat\xE9gias. Tente novamente mais tarde."
    );
  }
}
async function sendGotStrategiesSuggestions(chatId, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Nenhuma estrat\xE9gia encontrada no banco de dados."
    );
  }
  let message = "\u{1F916} Estrat\xE9gias GoT\n\n";
  strategies.slice(0, 5).forEach((strategy) => {
    if (strategy.name) {
      message += `\u{1F4E3} ${strategy.name}

`;
    }
    message += `Ataque\u2694\uFE0F x \u{1F6E1}\uFE0FDefesa

`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}

`;
  });
  if (strategies.length > 5) {
    message += `
... e mais ${strategies.length - 5} estrat\xE9gias dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function handleSearchCommand(chatId, keyword) {
  console.log(`[GoT Bot Integration] Handling search for keyword: ${keyword}`);
  try {
    const strategies = await searchGotStrategies(keyword);
    if (strategies.length === 0) {
      const token2 = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      await sendTelegramMessageDirect(token2, chatId, `\u274C Nenhuma estrat\xE9gia encontrada com o nome: ${keyword}`);
      return;
    }
    let message = `\u{1F916} Estrat\xE9gias GoT

`;
    strategies.forEach((strategy) => {
      if (strategy.name) {
        message += `\u{1F4E3} ${strategy.name}

`;
      }
      message += `Ataque\u2694\uFE0F x \u{1F6E1}\uFE0FDefesa

`;
      message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
      message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
      message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}`;
      if (strategy.observation) {
        message += `

\u{1F4DD} Observa\xE7\xE3o: ${strategy.observation}`;
      }
      message += `

`;
    });
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    await sendTelegramMessageDirect(token, chatId, message);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling search command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    await sendTelegramMessageDirect(token, chatId, "\u274C Erro ao buscar estrat\xE9gias");
  }
}
async function handleAttackCommand(chatId, characterNames) {
  try {
    console.log("[GoT Bot Integration] Handling /ataque command for characters:", characterNames);
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u274C Por favor, especifique at\xE9 3 cavaleiros. Exemplo: /ataque Kanon Aikos Hyoga"
      );
    }
    const names = characterNames.trim().split(/\s+/).slice(0, 3);
    const cacheKey = names.join("|").toLowerCase();
    let filteredStrategies = getCachedByCharacter(cacheKey);
    if (!filteredStrategies) {
      const { searchGotStrategiesByMultipleNamesInAttack: searchGotStrategiesByMultipleNamesInAttack2, getGotStrategiesByName: getGotStrategiesByName2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      filteredStrategies = await searchGotStrategiesByMultipleNamesInAttack2(names);
      if (filteredStrategies.length === 0) {
        console.log("[GoT Bot Integration] No strategies found by character name, searching by strategy name");
        let allStrategies = [];
        for (const name of names) {
          const strategyNameResults = await getGotStrategiesByName2(name);
          allStrategies = allStrategies.concat(strategyNameResults);
        }
        filteredStrategies = allStrategies.filter((s) => strategyContainsAllCharactersInAttack(s, names));
      }
      setCachedByCharacter(cacheKey, filteredStrategies);
    }
    if (filteredStrategies.length === 0) {
      console.log("[GoT Bot Integration] No strategies found by strategy name, searching by keyword");
      const { searchGotStrategiesByKeyword: searchGotStrategiesByKeyword2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      let allStrategies = [];
      for (const keyword of names) {
        const keywordStrategies = await searchGotStrategiesByKeyword2(keyword);
        allStrategies = allStrategies.concat(keywordStrategies);
      }
      filteredStrategies = Array.from(new Map(allStrategies.map((s) => [s.id, s])).values());
    }
    const uniqueStrategies = Array.from(new Map(filteredStrategies.map((s) => [s.id, s])).values());
    console.log("[GoT Bot Integration] Found", uniqueStrategies.length, "attack strategies for", names.join(", "));
    return sendGotAttackStrategies(chatId, names.join(" / "), uniqueStrategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /ataque command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar estrat\xE9gias de ataque. Tente novamente mais tarde."
    );
  }
}
async function handleDefenseCommand(chatId, characterNames) {
  try {
    console.log("[GoT Bot Integration] Handling /defesa command for characters:", characterNames);
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u274C Por favor, especifique at\xE9 3 cavaleiros. Exemplo: /defesa Ikki Ta\xE7a ShunD"
      );
    }
    const names = characterNames.trim().split(/\s+/).slice(0, 3);
    const { searchGotStrategiesByMultipleNamesInDefense: searchGotStrategiesByMultipleNamesInDefense2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    let filteredStrategies = await searchGotStrategiesByMultipleNamesInDefense2(names);
    console.log("[GoT Bot Integration] /defesa command - filtered strategies count:", filteredStrategies.length);
    const uniqueStrategies = Array.from(new Map(filteredStrategies.map((s) => [s.id, s])).values());
    console.log("[GoT Bot Integration] Found", uniqueStrategies.length, "defense strategies for", names.join(", "));
    return sendGotDefenseStrategies(chatId, names.join(" / "), uniqueStrategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /defesa command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar estrat\xE9gias de defesa. Tente novamente mais tarde."
    );
  }
}
async function sendGotAttackStrategies(chatId, characterNames, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `\u274C Nenhuma estrat\xE9gia de ataque encontrada para ${characterNames}.`
    );
  }
  let message = `\u{1F916} Estrat\xE9gias de Ataque - ${characterNames}

`;
  strategies.forEach((strategy) => {
    message += `Ataque\u2694\uFE0F x \u{1F6E1}\uFE0FDefesa
`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}

`;
  });
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estrat\xE9gias dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function sendGotDefenseStrategies(chatId, characterNames, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `\u274C Nenhuma estrat\xE9gia de defesa encontrada para ${characterNames}.`
    );
  }
  let message = `\u{1F916} Estrat\xE9gias de Defesa - ${characterNames}

`;
  strategies.forEach((strategy) => {
    message += `Ataque\u2694\uFE0F x \u{1F6E1}\uFE0FDefesa
`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}

`;
  });
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estrat\xE9gias dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function handleTipDefenseCommand(chatId, characterNames) {
  try {
    console.log("[GoT Bot Integration] Handling /dica defesa command for characters:", characterNames);
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u274C Por favor, especifique at\xE9 3 cavaleiros. Exemplo: /dica defesa Ikki Ta\xE7a ShunD"
      );
    }
    const names = characterNames.trim().split(/\s+/).slice(0, 3);
    const { searchGotStrategiesByMultipleNamesInDefense: searchGotStrategiesByMultipleNamesInDefense2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    let filteredStrategies = await searchGotStrategiesByMultipleNamesInDefense2(names);
    const uniqueStrategies = Array.from(new Map(filteredStrategies.map((s) => [s.id, s])).values());
    console.log("[GoT Bot Integration] Found", uniqueStrategies.length, "defense tips for", names.join(", "));
    return sendGotDefenseTips(chatId, names.join(" / "), uniqueStrategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /dica defesa command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar dicas de defesa. Tente novamente mais tarde."
    );
  }
}
async function sendGotDefenseTips(chatId, characterNames, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `\u274C Nenhuma dica de defesa encontrada para ${characterNames}.`
    );
  }
  let message = `\u{1F916} Dicas de Defesa - ${characterNames}

`;
  strategies.slice(0, 5).forEach((strategy) => {
    message += `\u{1F6E1}\uFE0F Defesa: ${strategy.defenseFormation1} / ${strategy.defenseFormation2} / ${strategy.defenseFormation3}

`;
  });
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} dicas dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function sendGvgAttackStrategies(chatId, characterNames, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `\u274C Nenhuma estrat\xE9gia de ataque GVG encontrada para ${characterNames}.`
    );
  }
  let message = `\u{1F916} Estrat\xE9gias de Ataque GVG - ${characterNames}

`;
  strategies.slice(0, 5).forEach((strategy) => {
    message += `Ataque \u2694\uFE0F x \u{1F6E1}\uFE0F Defesa

`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}
`;
    message += `${strategy.attackFormation4} x ${strategy.defenseFormation4}
`;
    message += `${strategy.attackFormation5} x ${strategy.defenseFormation5}

`;
  });
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estrat\xE9gias dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function sendGvgDefenseStrategies(chatId, characterNames, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `\u274C Nenhuma estrat\xE9gia de defesa GVG encontrada para ${characterNames}.`
    );
  }
  let message = `\u{1F916} Estrat\xE9gias de Defesa GVG - ${characterNames}

`;
  strategies.slice(0, 5).forEach((strategy) => {
    message += `Ataque \u2694\uFE0F x \u{1F6E1}\uFE0F Defesa

`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}
`;
    message += `${strategy.attackFormation4} x ${strategy.defenseFormation4}
`;
    message += `${strategy.attackFormation5} x ${strategy.defenseFormation5}

`;
  });
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estrat\xE9gias dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function sendGvgDefenseTips(chatId, characterNames, strategies) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `\u274C Nenhuma dica de defesa GVG encontrada para ${characterNames}.`
    );
  }
  let message = `\u{1F916} Dicas de Defesa GVG - ${characterNames}

`;
  strategies.slice(0, 5).forEach((strategy) => {
    message += `\u{1F6E1}\uFE0F Defesa: ${strategy.defenseFormation1} / ${strategy.defenseFormation2} / ${strategy.defenseFormation3} / ${strategy.defenseFormation4} / ${strategy.defenseFormation5}

`;
  });
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} dicas dispon\xEDveis.`;
  }
  return sendTelegramMessageDirect(token, chatId, message);
}
async function handleGvgAttackCommandNew(chatId, characterNames) {
  try {
    console.log("[GoT Bot Integration] Handling /gvg ataque command for characters:", characterNames);
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u274C Por favor, especifique at\xE9 5 cavaleiros. Exemplo: /gvg ataque Seiya Shiryu Hyoga Shun Ikki"
      );
    }
    const names = characterNames.trim().split(/\s+/).slice(0, 5);
    const { searchGvgStrategiesByMultipleNamesInAttack: searchGvgStrategiesByMultipleNamesInAttack2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const strategies = await searchGvgStrategiesByMultipleNamesInAttack2(names);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG attack strategies for", names.join(", "));
    return sendGvgAttackStrategies(chatId, names.join(" / "), strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /gvg ataque command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar estrat\xE9gias de ataque GVG. Tente novamente mais tarde."
    );
  }
}
async function handleGvgDefenseCommandNew(chatId, characterNames) {
  try {
    console.log("[GoT Bot Integration] Handling /gvg defesa command for characters:", characterNames);
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u274C Por favor, especifique at\xE9 5 cavaleiros. Exemplo: /gvg defesa Seiya Shiryu Hyoga Shun Ikki"
      );
    }
    const names = characterNames.trim().split(/\s+/).slice(0, 5);
    const { searchGvgStrategiesByMultipleNamesInDefense: searchGvgStrategiesByMultipleNamesInDefense2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const strategies = await searchGvgStrategiesByMultipleNamesInDefense2(names);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense strategies for", names.join(", "));
    return sendGvgDefenseStrategies(chatId, names.join(" / "), strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /gvg defesa command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar estrat\xE9gias de defesa GVG. Tente novamente mais tarde."
    );
  }
}
async function handleGvgDicaCommand(chatId, characterNames) {
  try {
    console.log("[GoT Bot Integration] Handling /gvg dica command for characters:", characterNames);
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u274C Por favor, especifique at\xE9 5 cavaleiros. Exemplo: /gvg dica Seiya Shiryu Hyoga Shun Ikki"
      );
    }
    let cleanInput = characterNames.trim();
    if (cleanInput.toLowerCase().startsWith("defesa ")) {
      cleanInput = cleanInput.substring(7).trim();
    } else if (cleanInput.toLowerCase().startsWith("ataque ")) {
      cleanInput = cleanInput.substring(7).trim();
    }
    const names = cleanInput.split(/\s+/).slice(0, 5);
    const { searchGvgStrategiesByMultipleNamesInDefense: searchGvgStrategiesByMultipleNamesInDefense2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const strategies = await searchGvgStrategiesByMultipleNamesInDefense2(names);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense tips for", names.join(", "));
    return sendGvgDefenseTips(chatId, names.join(" / "), strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /gvg dica command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar dicas de defesa GVG. Tente novamente mais tarde."
    );
  }
}
async function handleNomeCommand(chatId, searchTerm) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  try {
    console.log("[GoT Bot Integration] Handling /nome command for search term:", searchTerm);
    let gotResults = [];
    let gvgResults = [];
    let isShowingAll = false;
    if (!searchTerm || searchTerm.trim().length === 0) {
      gotResults = await searchCharactersInGotStrategies("");
      gvgResults = await searchCharactersInGvgStrategies("");
      isShowingAll = true;
    } else {
      gotResults = await searchCharactersInGotStrategies(searchTerm);
      gvgResults = await searchCharactersInGvgStrategies(searchTerm);
    }
    const allResults = [...gotResults, ...gvgResults];
    if (allResults.length === 0) {
      const errorMsg = isShowingAll ? "\u274C Nenhum cavaleiro encontrado no banco de dados." : `\u274C Nenhum cavaleiro encontrado com "${searchTerm}".`;
      await sendTelegramMessageDirect(
        token,
        chatId,
        errorMsg
      );
      return false;
    }
    const characterMap = /* @__PURE__ */ new Map();
    for (const result of allResults) {
      const normalized = result.character.toLowerCase().trim();
      if (!characterMap.has(normalized)) {
        characterMap.set(normalized, result.character);
      }
    }
    const uniqueCharacters = Array.from(characterMap.values()).sort(
      (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
    );
    const characterList = uniqueCharacters.map((char, index) => `${index + 1}. ${char}`).join("\n");
    const message = isShowingAll ? `\u{1F4CB} Todos os Cavaleiros:

${characterList}` : `\u{1F50D} Cavaleiros encontrados para "${searchTerm}":

${characterList}`;
    await sendTelegramMessageDirect(token, chatId, message);
    return true;
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /nome command:", error);
    await sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao buscar cavaleiros. Tente novamente mais tarde."
    );
    return false;
  }
}
async function handleIaCommand(chatId, message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    const question = message.replace(/^\/ia\s+/i, "").trim();
    if (!question) {
      return sendTelegramMessageDirect(
        token,
        chatId,
        "\u2753 Use: /ia [sua pergunta]\n\nExemplos:\n- /ia qual \xE9 a melhor estrat\xE9gia para GvG?\n- /ia como usar Ikki em defesa?\n- /ia qual carta \xE9 melhor para Seiya?"
      );
    }
    await sendTelegramMessageDirect(token, chatId, "\u23F3 Analisando sua pergunta...");
    const { invokeLLM: invokeLLM2 } = await Promise.resolve().then(() => (init_llm(), llm_exports));
    const response = await invokeLLM2({
      messages: [
        {
          role: "system",
          content: "Voc\xEA \xE9 um especialista em Saint Seiya: Lendas da Justi\xE7a. Responda perguntas sobre estrat\xE9gias de GvG, GoT, Rel\xEDquias, cavaleiros, cartas e dicas de jogo. Mantenha respostas concisas e \xFAteis. Use emojis para melhorar a legibilidade."
        },
        {
          role: "user",
          content: question
        }
      ]
    });
    let iaResponse = response.choices?.[0]?.message?.content;
    if (Array.isArray(iaResponse)) {
      iaResponse = iaResponse.filter((item) => item.type === "text").map((item) => item.text).join("\n");
    }
    iaResponse = iaResponse || "Desculpe, n\xE3o consegui processar sua pergunta.";
    const responseStr = String(iaResponse);
    const maxLength = 4e3;
    if (responseStr.length > maxLength) {
      const chunks = responseStr.match(new RegExp(`.{1,${maxLength}}`, "g")) || [];
      for (const chunk of chunks) {
        await sendTelegramMessageDirect(token, chatId, chunk);
      }
    } else {
      await sendTelegramMessageDirect(token, chatId, responseStr);
    }
    return true;
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /ia command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    await sendTelegramMessageDirect(
      token,
      chatId,
      "\u274C Erro ao processar sua pergunta. Tente novamente mais tarde."
    );
    return false;
  }
}

// server/_core/botWebhook.ts
var processedWebhookMessages = /* @__PURE__ */ new Map();
var WEBHOOK_MESSAGE_CACHE_TTL = 3e5;
var RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1e3
  // 1 minuto
};
function getWebhookMessageHash(message) {
  return `${message.chat?.id}:${message.message_id}:${message.date}`;
}
function isWebhookMessageProcessed(hash) {
  if (!hash) return false;
  const lastProcessed = processedWebhookMessages.get(hash);
  if (!lastProcessed) return false;
  const age = Date.now() - lastProcessed;
  return age < WEBHOOK_MESSAGE_CACHE_TTL;
}
function markWebhookMessageProcessed(hash) {
  if (!hash) return;
  processedWebhookMessages.set(hash, Date.now());
  if (processedWebhookMessages.size > 1e3) {
    const now = Date.now();
    const keysToDelete = [];
    processedWebhookMessages.forEach((timestamp2, key) => {
      if (now - timestamp2 > WEBHOOK_MESSAGE_CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => processedWebhookMessages.delete(key));
  }
}
async function handleTelegramWebhook(req, res) {
  try {
    const update = req.body;
    console.log("[Telegram Webhook] Received update:", JSON.stringify(update, null, 2));
    if (!update.message || !update.message.text) {
      console.log("[Telegram Webhook] No message or text found");
      return res.status(200).json({ ok: true });
    }
    const { text: text2, chat } = update.message;
    const chatId = chat.id.toString();
    const messageHash = getWebhookMessageHash(update.message);
    if (isWebhookMessageProcessed(messageHash)) {
      console.log("[Telegram Webhook] \u26A0\uFE0F Mensagem duplicada ignorada no webhook:", messageHash);
      return res.status(200).json({ ok: true });
    }
    markWebhookMessageProcessed(messageHash);
    console.log("[Telegram Webhook] Processing message:", text2, "from chat:", chatId);
    const lowerText = text2.toLowerCase();
    if (text2 === "/estrategia" || text2.startsWith("/estrategia ")) {
      console.log("[Telegram Webhook] Handling /estrategia command");
      await handleEstrategiaCommand(chatId);
    } else if (lowerText.startsWith("/gvg ataque")) {
      console.log("[Telegram Webhook] Handling /gvg ataque command");
      const input = text2.substring(11).trim();
      await handleGvgAttackCommandNew(chatId, input);
    } else if (lowerText.startsWith("/gvg defesa")) {
      console.log("[Telegram Webhook] Handling /gvg defesa command");
      const input = text2.substring(11).trim();
      await handleGvgDefenseCommandNew(chatId, input);
    } else if (lowerText.startsWith("/gvg dica")) {
      console.log("[Telegram Webhook] Handling /gvg dica command");
      const input = text2.substring(9).trim();
      await handleGvgDicaCommand(chatId, input);
    } else if (lowerText.startsWith("/nome")) {
      console.log("[Telegram Webhook] Handling /nome command");
      const input = text2.substring(5).trim();
      await handleNomeCommand(chatId, input);
    } else if (lowerText.startsWith("/ataque")) {
      console.log("[Telegram Webhook] Handling /ataque command");
      const parts = text2.split(" ");
      const characterName = parts.slice(1).join(" ");
      await handleAttackCommand(chatId, characterName);
    } else if (lowerText.startsWith("/dica defesa")) {
      console.log("[Telegram Webhook] Handling /dica defesa command");
      const input = text2.substring(12).trim();
      await handleTipDefenseCommand(chatId, input);
    } else if (lowerText.startsWith("/defesa")) {
      console.log("[Telegram Webhook] Handling /defesa command");
      const parts = text2.split(" ");
      const characterName = parts.slice(1).join(" ");
      await handleDefenseCommand(chatId, characterName);
    } else if (text2 === "/status") {
      console.log("[Telegram Webhook] Handling /status command");
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      const statusMessage = "\u2705 <b>Bot Status:</b>\n\n\u{1F7E2} Bot est\xE1 respondendo normalmente\n\u23F0 Timestamp: " + (/* @__PURE__ */ new Date()).toISOString() + "\n\nUse /help para ver todos os comandos dispon\xEDveis.";
      await sendTelegramMessageDirect(token, chatId, statusMessage);
    } else if (text2.startsWith("/buscar ")) {
      console.log("[Telegram Webhook] Handling /buscar command");
      const keyword = text2.substring(8).trim();
      if (!keyword) {
        const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
        await sendTelegramMessageDirect(token, chatId, "\u26A0\uFE0F Use: /buscar [nome da estrat\xE9gia]");
        return;
      }
      await handleSearchCommand(chatId, keyword);
    } else if (lowerText.startsWith("/ia ")) {
      console.log("[Telegram Webhook] Handling /ia command");
      await handleIaCommand(chatId, text2);
    } else if (text2 === "/help" || text2 === "/start") {
      console.log("[Telegram Webhook] Handling /help command");
      const helpMessage = "\u{1F44B} <b>Bem-vindo ao Bot de Estrat\xE9gias GoT!</b>\n\n\u{1F4CB} <b>Comandos Dispon\xEDveis:</b>\n/ataque [nome] [nome] [nome] - Ver ataques com um ou mais cavaleiros espec\xEDficos\n/defesa [nome] [nome] [nome] - Ver defesas com um ou mais cavaleiros espec\xEDficos\n/dica defesa [nome] [nome] [nome] - Ver APENAS dicas de defesas\n/ia [pergunta] - Consultar IA sobre estrat\xE9gias, cartas e d\xFAvidas\n\n\u{1F4CA} As estrat\xE9gias s\xE3o atualizadas em tempo real pelo Painel de Estrat\xE9gias GoT!";
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      await sendTelegramMessageDirect(botToken, chatId, helpMessage);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
async function registerTelegramWebhook(app) {
  app.post("/api/telegram/webhook", handleTelegramWebhook);
  console.log("[Telegram] Webhook route registrada em /api/telegram/webhook");
}

// server/_core/botHealthCheck.ts
import axios5 from "axios";
var TELEGRAM_API = "https://api.telegram.org";
var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
var WEBHOOK_URL = "https://teamsapuri.manus.space/api/telegram/webhook";
async function validateBotToken2() {
  try {
    const response = await axios5.get(`${TELEGRAM_API}/bot${BOT_TOKEN}/getMe`);
    if (response.data.ok && response.data.result.is_bot) {
      console.log("[Bot Health] \u2705 Token v\xE1lido - Bot:", response.data.result.first_name);
      return true;
    }
    console.error("[Bot Health] \u274C Token inv\xE1lido");
    return false;
  } catch (error) {
    console.error("[Bot Health] \u274C Erro ao validar token:", error);
    return false;
  }
}
async function checkWebhookRegistration() {
  try {
    const response = await axios5.get(`${TELEGRAM_API}/bot${BOT_TOKEN}/getWebhookInfo`);
    if (response.data.ok) {
      const webhookInfo = response.data.result;
      const isRegistered = webhookInfo.url === WEBHOOK_URL;
      if (isRegistered) {
        console.log("[Bot Health] \u2705 Webhook registrado:", webhookInfo.url);
        return true;
      } else {
        console.warn("[Bot Health] \u26A0\uFE0F Webhook URL mismatch. Registrado:", webhookInfo.url, "Esperado:", WEBHOOK_URL);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("[Bot Health] \u274C Erro ao verificar webhook:", error);
    return false;
  }
}
async function registerWebhook() {
  try {
    const response = await axios5.post(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        drop_pending_updates: true
        // Descartar mensagens antigas
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    if (response.data.ok) {
      console.log("[Bot Health] \u2705 Webhook registrado com sucesso:", WEBHOOK_URL);
      return true;
    }
    console.error("[Bot Health] \u274C Erro ao registrar webhook:", response.data);
    return false;
  } catch (error) {
    console.error("[Bot Health] \u274C Erro ao registrar webhook:", error);
    return false;
  }
}
async function checkBotHealth2() {
  const tokenValid = await validateBotToken2();
  const webhookRegistered = await checkWebhookRegistration();
  let status = "healthy";
  let message = "\u2705 Bot operacional";
  if (!tokenValid) {
    status = "critical";
    message = "\u274C Token inv\xE1lido";
  } else if (!webhookRegistered) {
    status = "warning";
    message = "\u26A0\uFE0F Webhook n\xE3o registrado ou URL incorreta";
  }
  return {
    tokenValid,
    webhookRegistered,
    lastCheck: /* @__PURE__ */ new Date(),
    status,
    message
  };
}
async function initializeBotHealthCheck() {
  console.log("[Bot Health] Iniciando verifica\xE7\xE3o de sa\xFAde do bot...");
  const health = await checkBotHealth2();
  console.log("[Bot Health] Status:", health);
  if (!health.tokenValid) {
    console.error("[Bot Health] \u274C CR\xCDTICO: Token do bot inv\xE1lido!");
    process.exit(1);
  }
  if (!health.webhookRegistered) {
    console.warn("[Bot Health] \u26A0\uFE0F Webhook n\xE3o est\xE1 registrado. Tentando registrar...");
    const registered = await registerWebhook();
    if (!registered) {
      console.error("[Bot Health] \u274C Falha ao registrar webhook");
    }
  }
  setInterval(async () => {
    const currentHealth = await checkBotHealth2();
    if (currentHealth.status !== "healthy") {
      console.warn("[Bot Health] \u26A0\uFE0F Problema detectado:", currentHealth.message);
      if (!currentHealth.webhookRegistered) {
        console.log("[Bot Health] Tentando re-registrar webhook...");
        await registerWebhook();
      }
    }
  }, 5 * 60 * 1e3);
}

// server/autoSave.ts
var backups = [];
var MAX_BACKUPS = 12;
function calculateChecksum2(data) {
  return JSON.stringify(data).split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0).toString();
}
async function performAutoSave() {
  try {
    console.log("[AutoSave] Iniciando salvamento autom\xE1tico...");
    const strategies = [];
    const gvgData = [];
    const gotData = [];
    const reliquiasData = [];
    const backup = {
      timestamp: Date.now(),
      gotStrategies: strategies,
      gvgEscalations: gvgData,
      gotEscalations: gotData,
      reliquiasEscalations: reliquiasData,
      checksum: calculateChecksum2([strategies, gvgData, gotData, reliquiasData])
    };
    if (typeof window !== "undefined") {
      console.log("[AutoSave] Dados salvos em mem\xF3ria para recupera\xE7\xE3o r\xE1pida");
    }
    backups.push(backup);
    if (backups.length > MAX_BACKUPS) {
      backups.shift();
    }
    console.log(`[AutoSave] \u2705 Salvamento autom\xE1tico conclu\xEDdo. Backups em mem\xF3ria: ${backups.length}`);
    console.log(`[AutoSave] Dados salvos: ${strategies.length} estrat\xE9gias, ${gvgData.length} GvG, ${gotData.length} GoT, ${reliquiasData.length} Rel\xEDquias`);
  } catch (error) {
    console.error("[AutoSave] \u274C Erro ao realizar salvamento autom\xE1tico:", error);
  }
}
function startAutoSave(intervalMinutes = 5) {
  console.log(`[AutoSave] \u{1F550} Iniciando salvamento autom\xE1tico a cada ${intervalMinutes} minutos...`);
  performAutoSave();
  return setInterval(() => {
    performAutoSave();
  }, intervalMinutes * 60 * 1e3);
}

// server/accountsRoutes.ts
import { Router } from "express";
import multer from "multer";
import path6 from "path";
import fs5 from "fs";
var router2 = Router();
var UPLOADS_DIR = path6.join(process.cwd(), "uploads", "painel-contas");
if (!fs5.existsSync(UPLOADS_DIR)) {
  fs5.mkdirSync(UPLOADS_DIR, { recursive: true });
}
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path6.extname(file.originalname);
    cb(null, `conta-${uniqueSuffix}${ext}`);
  }
});
var upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB por arquivo
    files: 10
    // máximo 10 arquivos
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo n\xE3o permitido. Use JPG, PNG ou WEBP."));
    }
  }
});
router2.get("/accounts", (_req, res) => {
  try {
    const accounts = getAllAccounts();
    res.json(accounts);
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    res.status(500).json({ error: "Erro ao listar contas" });
  }
});
router2.post("/accounts/announce", upload.array("images", 10), async (req, res) => {
  try {
    const { gameName, price, description } = req.body;
    const files = req.files;
    if (!gameName || !price || !description) {
      return res.status(400).json({ error: "Campos obrigat\xF3rios: gameName, price, description" });
    }
    const imageUrls = files ? files.map((file) => `/uploads/painel-contas/${file.filename}`) : [];
    const account = await addAccount(
      gameName,
      parseFloat(price),
      description,
      imageUrls
    );
    res.json({ success: true, account });
  } catch (error) {
    console.error("Erro ao anunciar conta:", error);
    res.status(500).json({ error: "Erro ao anunciar conta" });
  }
});
router2.delete("/accounts/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = removeAccount(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Conta n\xE3o encontrada" });
    }
  } catch (error) {
    console.error("Erro ao remover conta:", error);
    res.status(500).json({ error: "Erro ao remover conta" });
  }
});
router2.put("/accounts/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { gameName, price, description } = req.body;
    const updatedAccount = updateAccount(id, {
      gameName,
      price: price ? parseFloat(price) : void 0,
      description
    });
    if (updatedAccount) {
      res.json({ success: true, account: updatedAccount });
    } else {
      res.status(404).json({ error: "Conta n\xE3o encontrada" });
    }
  } catch (error) {
    console.error("Erro ao editar conta:", error);
    res.status(500).json({ error: "Erro ao editar conta" });
  }
});
router2.post("/accounts/:id/send-telegram", async (req, res) => {
  try {
    const { id } = req.params;
    const account = getAccountById(id);
    if (!account) {
      return res.status(404).json({ error: "Conta n\xE3o encontrada" });
    }
    await sendAccountToTelegram(account);
    res.json({ success: true, message: "Conta enviada para o Telegram" });
  } catch (error) {
    console.error("Erro ao enviar para Telegram:", error);
    res.status(500).json({ error: "Erro ao enviar para Telegram" });
  }
});
router2.post("/accounts/:id/send-whatsapp", async (req, res) => {
  try {
    const { id } = req.params;
    const account = getAccountById(id);
    if (!account) {
      return res.status(404).json({ error: "Conta n\xE3o encontrada" });
    }
    const result = await sendAccountToWhatsApp(account);
    res.json({
      success: true,
      message: `Conta enviada para ${result.sent} grupo(s) do WhatsApp`,
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error("Erro ao enviar para WhatsApp:", error);
    res.status(500).json({ error: "Erro ao enviar para WhatsApp" });
  }
});
router2.post("/scheduler/whatsapp", (req, res) => {
  try {
    const { enabled } = req.body;
    setWhatsAppEnabled(enabled === true);
    res.json({ success: true, enabled: enabled === true });
  } catch (error) {
    console.error("Erro ao configurar WhatsApp:", error);
    res.status(500).json({ error: "Erro ao configurar WhatsApp" });
  }
});
router2.get("/scheduler/status", (_req, res) => {
  try {
    const status = getSchedulerStatus();
    res.json(status);
  } catch (error) {
    console.error("Erro ao obter status:", error);
    res.status(500).json({ error: "Erro ao obter status" });
  }
});
router2.post("/scheduler/start", (req, res) => {
  try {
    const { intervalMinutes = 60 } = req.body;
    const success = startScheduler(intervalMinutes);
    res.json({ success });
  } catch (error) {
    console.error("Erro ao iniciar scheduler:", error);
    res.status(500).json({ error: "Erro ao iniciar scheduler" });
  }
});
router2.post("/scheduler/stop", (_req, res) => {
  try {
    const success = stopScheduler();
    res.json({ success });
  } catch (error) {
    console.error("Erro ao parar scheduler:", error);
    res.status(500).json({ error: "Erro ao parar scheduler" });
  }
});
var accountsRoutes_default = router2;

// server/whatsapp-routes.ts
import { Router as Router2 } from "express";
var router3 = Router2();
router3.get("/status", (req, res) => {
  try {
    const status = getWhatsAppStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});
router3.get("/qr-code", (req, res) => {
  try {
    const qrCode = getWhatsAppQrCode();
    const status = getWhatsAppStatus();
    res.json({
      success: true,
      qrCode,
      status,
      message: qrCode ? "QR Code dispon\xEDvel - escaneie com seu WhatsApp" : "Aguardando QR Code..."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});
router3.post("/connect", async (req, res) => {
  try {
    console.log("[WhatsApp Routes] Iniciando conex\xE3o...");
    await connectWhatsApp();
    const status = getWhatsAppStatus();
    res.json({
      success: true,
      message: "Conex\xE3o iniciada. Aguarde o QR Code.",
      status
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao conectar:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao conectar"
    });
  }
});
router3.post("/disconnect", async (req, res) => {
  try {
    await disconnectWhatsApp();
    res.json({
      success: true,
      message: "Desconectado com sucesso"
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao desconectar:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao desconectar"
    });
  }
});
router3.post("/logout", async (req, res) => {
  try {
    await logoutWhatsApp();
    res.json({
      success: true,
      message: "Logout realizado com sucesso"
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao fazer logout:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao fazer logout"
    });
  }
});
router3.post("/send-message", async (req, res) => {
  try {
    const { phoneNumber, text: text2 } = req.body;
    if (!phoneNumber || !text2) {
      return res.status(400).json({
        success: false,
        error: "phoneNumber e text s\xE3o obrigat\xF3rios"
      });
    }
    const sent = await sendWhatsAppMessage(phoneNumber, text2);
    res.json({
      success: sent,
      message: sent ? "Mensagem enviada com sucesso" : "Falha ao enviar mensagem"
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao enviar mensagem:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar mensagem"
    });
  }
});
router3.post("/send-messages", async (req, res) => {
  try {
    const { members: members2, text: text2 } = req.body;
    if (!members2 || !Array.isArray(members2) || !text2) {
      return res.status(400).json({
        success: false,
        error: "members (array) e text s\xE3o obrigat\xF3rios"
      });
    }
    const result = await sendWhatsAppMessages(members2, text2);
    res.json({
      success: true,
      result,
      message: `${result.success} mensagens enviadas, ${result.failed} falharam`
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao enviar mensagens:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar mensagens"
    });
  }
});
router3.post("/check-number", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "phoneNumber \xE9 obrigat\xF3rio"
      });
    }
    const hasWhatsApp = await checkWhatsAppNumber(phoneNumber);
    res.json({
      success: true,
      hasWhatsApp,
      message: hasWhatsApp ? "N\xFAmero tem WhatsApp" : "N\xFAmero n\xE3o tem WhatsApp"
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao verificar n\xFAmero:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao verificar n\xFAmero"
    });
  }
});
router3.get("/message-history", (req, res) => {
  try {
    const history = getMessageHistory();
    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao obter hist\xF3rico:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao obter hist\xF3rico"
    });
  }
});
router3.get("/groups", async (req, res) => {
  try {
    const groups = await getWhatsAppGroups();
    res.json({
      success: true,
      groups,
      count: groups.length
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao listar grupos:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao listar grupos"
    });
  }
});
router3.post("/send-group-message", async (req, res) => {
  try {
    const { groupId, text: text2 } = req.body;
    if (!groupId || !text2) {
      return res.status(400).json({
        success: false,
        error: "groupId e text s\xE3o obrigat\xF3rios"
      });
    }
    const sent = await sendWhatsAppGroupMessage(groupId, text2);
    res.json({
      success: sent,
      message: sent ? "Mensagem enviada com sucesso para o grupo" : "Falha ao enviar mensagem para o grupo"
    });
  } catch (error) {
    console.error("[WhatsApp Routes] Erro ao enviar mensagem para grupo:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar mensagem para grupo"
    });
  }
});
var whatsapp_routes_default = router3;

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express2.static(path8.join(process.cwd(), "uploads")));
  app.use("/api", (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  }, accountsRoutes_default);
  app.use("/api/whatsapp", whatsapp_routes_default);
  registerTelegramWebhook(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    try {
      await initializeBotHealthCheck();
      console.log("[Telegram] \u2705 Health check inicializado com sucesso!");
    } catch (error) {
      console.log("[Telegram] \u2139\uFE0F Bot Telegram n\xE3o configurado");
    }
    try {
      startAutoSave(5);
    } catch (e) {
      console.warn("[AutoSave] Sistema de salvamento autom\xE1tico n\xE3o dispon\xEDvel");
    }
    try {
      const backupModule = await Promise.resolve().then(() => (init_backup(), backup_exports));
      backupModule.scheduleBackups();
    } catch (e) {
      console.warn("[Backup] Sistema de backup n\xE3o dispon\xEDvel");
    }
    console.log("[WhatsApp] \u2705 Integra\xE7\xE3o WhatsApp ativa via Baileys");
  });
}
startServer().catch(console.error);
process.on("SIGTERM", () => {
  console.log("[Server] Recebido SIGTERM, encerrando...");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("[Server] Recebido SIGINT, encerrando...");
  process.exit(0);
});
