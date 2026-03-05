import { eq, and, desc, gte, lte, lt, like, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { 
  InsertUser, users, 
  members, InsertMember, Member,
  eventTypes, InsertEventType, EventType,
  schedules, InsertSchedule, Schedule,
  scheduleEntries, InsertScheduleEntry,
  botConfig, InsertBotConfig,
  subAdmins, InsertSubAdmin,
  announcements, InsertAnnouncement,
  announcementRecipients, InsertAnnouncementRecipient,
  performanceRecords, InsertPerformanceRecord,
  reliquiasSeasons, InsertReliquiasSeason,
  reliquiasBossProgress, InsertReliquiasBossProgress,
  reliquiasMemberRoles, InsertReliquiasMemberRole,
  reliquiasMemberAssignments, InsertReliquiasMemberAssignment,
  reliquiasDamage, InsertReliquiasDamage,
  gvgMatchInfo, InsertGvgMatchInfo,
  gvgSeasons, InsertGvgSeason, GvgSeason,
  gotStrategies, InsertGotStrategy, GotStrategy,
  gvgStrategies, InsertGvgStrategy, GvgStrategy,
  cards, InsertCard, Card,
  cardBackups, InsertCardBackup,
  characters,
  characterSkills,
  characterCloth,
  characterConstellations,
  characterLinks
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ SUB-ADMIN FUNCTIONS ============

export async function getAllSubAdmins() {
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
    createdAt: subAdmins.createdAt,
  }).from(subAdmins).orderBy(subAdmins.name);
}

export async function getSubAdminById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subAdmins).where(eq(subAdmins.id, id)).limit(1);
  return result[0];
}

export async function getSubAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subAdmins).where(eq(subAdmins.username, username)).limit(1);
  return result[0];
}

export async function createSubAdmin(data: InsertSubAdmin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subAdmins).values(data).returning({ id: true });
}

export async function updateSubAdmin(id: number, data: Partial<InsertSubAdmin>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subAdmins).set(data).where(eq(subAdmins.id, id));
}

export async function deleteSubAdmin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(subAdmins).where(eq(subAdmins.id, id));
}

// ============ MEMBER FUNCTIONS ============

export async function getAllMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(members.name);
}

export async function getActiveMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).where(eq(members.isActive, true)).orderBy(members.name);
}

export async function getMembersByEvent(eventName: string) {
  const db = await getDb();
  if (!db) return [];
  
  let condition;
  switch (eventName) {
    case 'gvg':
      condition = and(eq(members.isActive, true), eq(members.participatesGvg, true));
      break;
    case 'got':
      condition = and(eq(members.isActive, true), eq(members.participatesGot, true));
      break;
    case 'reliquias':
      condition = and(eq(members.isActive, true), eq(members.participatesReliquias, true));
      break;
    default:
      condition = eq(members.isActive, true);
  }
  
  return db.select().from(members).where(condition).orderBy(members.name);
}

export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}

export async function createMember(data: InsertMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(members).values(data).returning({ id: true });
}

export async function updateMember(id: number, data: Partial<InsertMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set(data).where(eq(members.id, id));
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(members).where(eq(members.id, id));
}

export async function getMemberCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(members);
  return result[0]?.count ?? 0;
}

// ============ EVENT TYPE FUNCTIONS ============

export async function getAllEventTypes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventTypes).orderBy(eventTypes.name);
}

export async function getEventTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(eventTypes).where(eq(eventTypes.id, id)).limit(1);
  return result[0];
}

export async function getEventTypeByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(eventTypes).where(eq(eventTypes.name, name)).limit(1);
  return result[0];
}

export async function createEventType(data: InsertEventType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eventTypes).values(data).returning({ id: true });
}

export async function updateEventType(id: number, data: Partial<InsertEventType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventTypes).set(data).where(eq(eventTypes.id, id));
}

export async function seedDefaultEventTypes() {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getAllEventTypes();
  if (existing.length > 0) return;

  const defaultEvents: InsertEventType[] = [
    { name: "gvg", displayName: "GvG", maxPlayers: 20, eventTime: "13:00", reminderMinutes: 30 },
    { name: "got", displayName: "GoT", maxPlayers: 25, eventTime: "13:00", reminderMinutes: 30 },
    { name: "reliquias", displayName: "Relíquias", maxPlayers: 40, eventTime: "15:00", reminderMinutes: 30 },
  ];

  for (const event of defaultEvents) {
    await db.insert(eventTypes).values(event);
  }
}

// ============ SCHEDULE FUNCTIONS ============

export async function getScheduleByEventAndDate(eventTypeId: number, eventDate: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schedules)
    .where(and(
      eq(schedules.eventTypeId, eventTypeId),
      eq(schedules.eventDate, eventDate)
    ))
    .orderBy(desc(schedules.createdAt))
    .limit(1);
  return result[0] || null;
}

export async function createSchedule(data: InsertSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schedules).values(data).returning({ id: schedules.id });
  return result[0]?.id;
}

export async function updateSchedule(id: number, data: Partial<InsertSchedule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(schedules).set(data).where(eq(schedules.id, id));
}

export async function getScheduleWithEntries(scheduleId: number) {
  const db = await getDb();
  if (!db) return { schedule: undefined, entries: [] };
  
  const schedule = await db.select().from(schedules).where(eq(schedules.id, scheduleId)).limit(1);
  if (!schedule[0]) return { schedule: undefined, entries: [] };
  
  const entries = await db.select({
    entry: scheduleEntries,
    member: members
  })
    .from(scheduleEntries)
    .innerJoin(members, eq(scheduleEntries.memberId, members.id))
    .where(eq(scheduleEntries.scheduleId, scheduleId))
    .orderBy(scheduleEntries.order, scheduleEntries.createdAt);
  
  return { schedule: schedule[0], entries };
}

export async function getScheduleHistory(eventTypeId?: number, startDate?: string, endDate?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    schedule: schedules,
    eventType: eventTypes
  })
    .from(schedules)
    .innerJoin(eventTypes, eq(schedules.eventTypeId, eventTypes.id))
    .orderBy(desc(schedules.eventDate))
    .limit(limit);

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
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return query;
}

// ============ SCHEDULE ENTRY FUNCTIONS ============

export async function addScheduleEntry(data: InsertScheduleEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(scheduleEntries).values(data).returning({ id: true });
}

export async function removeScheduleEntries(scheduleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(scheduleEntries).where(eq(scheduleEntries.scheduleId, scheduleId));
}

export async function getEntriesBySchedule(scheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    entry: scheduleEntries,
    member: members
  })
    .from(scheduleEntries)
    .innerJoin(members, eq(scheduleEntries.memberId, members.id))
    .where(eq(scheduleEntries.scheduleId, scheduleId))
    .orderBy(scheduleEntries.order, scheduleEntries.createdAt);
}

// ============ ANNOUNCEMENT FUNCTIONS ============

export async function createAnnouncement(data: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values(data).returning({ id: true });
  return result[0]?.id;
}

export async function addAnnouncementRecipient(data: InsertAnnouncementRecipient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(announcementRecipients).values(data).returning({ id: true });
}

export async function getAnnouncementsByEvent(eventTypeId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(announcements)
    .where(eq(announcements.eventTypeId, eventTypeId))
    .orderBy(desc(announcements.createdAt))
    .limit(limit);
}

export async function getAnnouncementRecipients(announcementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    recipient: announcementRecipients,
    member: members
  })
    .from(announcementRecipients)
    .innerJoin(members, eq(announcementRecipients.memberId, members.id))
    .where(eq(announcementRecipients.announcementId, announcementId));
}

export async function updateAnnouncementSentAt(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(announcements).set({ sentAt: new Date() }).where(eq(announcements.id, id));
}

// ============ PERFORMANCE RECORD FUNCTIONS ============

export async function createPerformanceRecord(data: InsertPerformanceRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(performanceRecords).values(data).returning({ id: true });
}

export async function getPerformanceByEventAndDate(eventTypeId: number, eventDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    record: performanceRecords,
    member: members
  })
    .from(performanceRecords)
    .innerJoin(members, eq(performanceRecords.memberId, members.id))
    .where(and(
      eq(performanceRecords.eventTypeId, eventTypeId),
      eq(performanceRecords.eventDate, eventDate)
    ));
}

export async function deletePerformanceByEventAndDate(eventTypeId: number, eventDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(performanceRecords).where(and(
    eq(performanceRecords.eventTypeId, eventTypeId),
    eq(performanceRecords.eventDate, eventDate)
  ));
}

export async function getMemberPerformanceStats(memberId?: number, eventTypeId?: number) {
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
    totalEvents: sql<number>`count(*)`,
    attacked: sql<number>`sum(case when ${performanceRecords.attacked} = true then 1 else 0 end)`,
    notAttacked: sql<number>`sum(case when ${performanceRecords.attacked} = false then 1 else 0 end)`,
  })
    .from(performanceRecords)
    .innerJoin(members, eq(performanceRecords.memberId, members.id))
    .groupBy(members.id, members.name);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  return query;
}

// ============ STATISTICS FUNCTIONS ============

export async function getMemberStats(memberId?: number, eventTypeId?: number, startDate?: string, endDate?: string) {
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
    count: sql<number>`count(*)`,
  })
    .from(scheduleEntries)
    .innerJoin(members, eq(scheduleEntries.memberId, members.id))
    .innerJoin(schedules, eq(scheduleEntries.scheduleId, schedules.id))
    .innerJoin(eventTypes, eq(schedules.eventTypeId, eventTypes.id))
    .groupBy(members.id, members.name, eventTypes.id, eventTypes.displayName);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  return query;
}

// ============ BOT CONFIG FUNCTIONS ============

export async function getBotConfig() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(botConfig).limit(1);
  return result[0];
}

export async function upsertBotConfig(data: Partial<InsertBotConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getBotConfig();
  if (existing) {
    await db.update(botConfig).set(data).where(eq(botConfig.id, existing.id));
  } else {
    await db.insert(botConfig).values(data as InsertBotConfig);
  }
}


// ============ GVG ATTACK FUNCTIONS ============

import { 
  gvgAttacks, InsertGvgAttack, GvgAttack,
  gotAttacks, InsertGotAttack, GotAttack,
  screenshotUploads, InsertScreenshotUpload,
  nonAttackerAlerts, InsertNonAttackerAlert
} from "../drizzle/schema";

export async function getGvgAttacksBySchedule(scheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gvgAttacks,
    member: members
  })
    .from(gvgAttacks)
    .innerJoin(members, eq(gvgAttacks.memberId, members.id))
    .where(eq(gvgAttacks.scheduleId, scheduleId))
    .orderBy(members.name);
}

export async function getGvgAttacksByDate(eventDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gvgAttacks,
    member: members
  })
    .from(gvgAttacks)
    .innerJoin(members, eq(gvgAttacks.memberId, members.id))
    .where(eq(gvgAttacks.eventDate, eventDate))
    .orderBy(members.name);
}

export async function upsertGvgAttack(data: InsertGvgAttack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if exists
  const existing = await db.select().from(gvgAttacks)
    .where(and(
      eq(gvgAttacks.scheduleId, data.scheduleId),
      eq(gvgAttacks.memberId, data.memberId)
    ))
    .limit(1);
  
  if (existing[0]) {
    await db.update(gvgAttacks).set(data).where(eq(gvgAttacks.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(gvgAttacks).values(data).returning({ id: true });
    return result[0]?.id;
  }
}

export async function bulkUpsertGvgAttacks(attacks: InsertGvgAttack[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const attack of attacks) {
    await upsertGvgAttack(attack);
  }
}

export async function getGvgNonAttackers(scheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    attack: gvgAttacks,
    member: members
  })
    .from(gvgAttacks)
    .innerJoin(members, eq(gvgAttacks.memberId, members.id))
    .where(and(
      eq(gvgAttacks.scheduleId, scheduleId),
      eq(gvgAttacks.didNotAttack, true)
    ));
}

// ============ GOT ATTACK FUNCTIONS ============

export async function getGotAttacksBySchedule(scheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    attack: gotAttacks,
    member: members
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .where(eq(gotAttacks.scheduleId, scheduleId))
    .orderBy(desc(gotAttacks.points));
}

export async function getGotAttacksByDate(eventDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar ataques da data atual
  const attacks = await db.select({
    attack: gotAttacks,
    member: members
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .where(eq(gotAttacks.eventDate, eventDate))
    .orderBy(desc(gotAttacks.points));
  
  // Para cada ataque, buscar o ataque anterior do mesmo membro
  const enrichedAttacks = await Promise.all(
    attacks.map(async (a) => {
      // Buscar ataque anterior do membro (data anterior)
      const previousAttack = await db.select()
        .from(gotAttacks)
        .where(and(
          eq(gotAttacks.memberId, a.attack.memberId),
          lt(gotAttacks.eventDate, eventDate)
        ))
        .orderBy(desc(gotAttacks.eventDate))
        .limit(1);
      
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

export async function upsertGotAttack(data: InsertGotAttack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if exists
  const existing = await db.select().from(gotAttacks)
    .where(and(
      eq(gotAttacks.scheduleId, data.scheduleId),
      eq(gotAttacks.memberId, data.memberId)
    ))
    .limit(1);
  
  if (existing[0]) {
    await db.update(gotAttacks).set(data).where(eq(gotAttacks.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(gotAttacks).values(data).returning({ id: true });
    return result[0]?.id;
  }
}

export async function bulkUpsertGotAttacks(attacks: InsertGotAttack[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const attack of attacks) {
    await upsertGotAttack(attack);
  }
}

export async function getGotNonAttackers(scheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    attack: gotAttacks,
    member: members
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .where(and(
      eq(gotAttacks.scheduleId, scheduleId),
      eq(gotAttacks.didNotAttack, true)
    ));
}

// ============ SCREENSHOT UPLOAD FUNCTIONS ============

export async function createScreenshotUpload(data: InsertScreenshotUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(screenshotUploads).values(data).returning({ id: true });
  return result[0]?.id;
}

export async function updateScreenshotUpload(id: number, data: Partial<InsertScreenshotUpload>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(screenshotUploads).set(data).where(eq(screenshotUploads.id, id));
}

export async function getScreenshotsByEventAndDate(eventTypeId: number, eventDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(screenshotUploads)
    .where(and(
      eq(screenshotUploads.eventTypeId, eventTypeId),
      eq(screenshotUploads.eventDate, eventDate)
    ))
    .orderBy(desc(screenshotUploads.createdAt));
}

// ============ NON-ATTACKER ALERT FUNCTIONS ============

export async function createNonAttackerAlert(data: InsertNonAttackerAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(nonAttackerAlerts).values(data).returning({ id: true });
}

export async function getNonAttackerAlerts(eventTypeId: number, eventDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    alert: nonAttackerAlerts,
    member: members
  })
    .from(nonAttackerAlerts)
    .innerJoin(members, eq(nonAttackerAlerts.memberId, members.id))
    .where(and(
      eq(nonAttackerAlerts.eventTypeId, eventTypeId),
      eq(nonAttackerAlerts.eventDate, eventDate)
    ));
}

export async function updateNonAttackerAlertStatus(id: number, alertSent: boolean, adminNotified: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(nonAttackerAlerts).set({ alertSent, adminNotified }).where(eq(nonAttackerAlerts.id, id));
}

// ============ GENERAL ANNOUNCEMENT FUNCTIONS ============

export async function createGeneralAnnouncement(data: Omit<InsertAnnouncement, 'eventTypeId'> & { isGeneral: true }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values({
    ...data,
    eventTypeId: null,
    isGeneral: true,
  } as InsertAnnouncement);
  return result[0]?.id;
}

export async function getGeneralAnnouncements(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(announcements)
    .where(eq(announcements.isGeneral, true))
    .orderBy(desc(announcements.createdAt))
    .limit(limit);
}

// ============ MEMBER TELEGRAM CHAT ID ============

export async function updateMemberTelegramChatId(memberId: number, chatId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set({ telegramChatId: chatId }).where(eq(members.id, memberId));
}

export async function getMembersWithTelegramChatId() {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(members)
    .where(and(
      eq(members.isActive, true),
      sql`${members.telegramChatId} IS NOT NULL`
    ));
}


// ============ RELIQUIAS SEASON FUNCTIONS ============

export async function getActiveReliquiasSeason() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(reliquiasSeasons)
    .where(eq(reliquiasSeasons.isActive, true))
    .limit(1);
  return result[0];
}

export async function getAllReliquiasSeasons() {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(reliquiasSeasons)
    .orderBy(desc(reliquiasSeasons.startDate));
}

export async function createReliquiasSeason(data: InsertReliquiasSeason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Deactivate any existing active season
  await db.update(reliquiasSeasons)
    .set({ isActive: false })
    .where(eq(reliquiasSeasons.isActive, true));
  
  const result = await db.insert(reliquiasSeasons).values(data).returning({ id: true });
  const seasonId = result[0]?.id;
  
  // Create default boss progression
  const bosses: InsertReliquiasBossProgress[] = [
    { seasonId, bossName: "Orfeu", bossOrder: 1, guardsRequired: 5, bossMaxDefeats: 1 },
    { seasonId, bossName: "Radamantis", bossOrder: 2, guardsRequired: 10, bossMaxDefeats: 1 },
    { seasonId, bossName: "Pandora", bossOrder: 3, guardsRequired: 15, bossMaxDefeats: 1 },
    { seasonId, bossName: "Gêmeos", bossOrder: 4, guardsRequired: 20, bossMaxDefeats: 3 },
  ];
  
  // Get max ID for boss progress
  const maxBossIdResult = await db.select({ maxId: sql`MAX(id)` }).from(reliquiasBossProgress);
  let nextBossId = ((maxBossIdResult[0]?.maxId as any as number) || 0) + 1;
  
  const now = Date.now(); // Unix timestamp in milliseconds
  for (const boss of bosses) {
    await db.insert(reliquiasBossProgress).values({
      id: nextBossId++,
      ...boss,
      guardsDefeated: 0,
      bossDefeatedCount: 0,
      isCompleted: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return seasonId;
}

export async function endReliquiasSeason(seasonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = new Date().toISOString().split('T')[0];
  await db.update(reliquiasSeasons)
    .set({ isActive: false, endDate: today })
    .where(eq(reliquiasSeasons.id, seasonId));
}

// ============ RELIQUIAS BOSS PROGRESS FUNCTIONS ============

export async function getBossProgressBySeason(seasonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(reliquiasBossProgress)
    .where(eq(reliquiasBossProgress.seasonId, seasonId))
    .orderBy(reliquiasBossProgress.bossOrder);
}

export async function getCurrentBoss(seasonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(reliquiasBossProgress)
    .where(and(
      eq(reliquiasBossProgress.seasonId, seasonId),
      eq(reliquiasBossProgress.isCompleted, false)
    ))
    .orderBy(reliquiasBossProgress.bossOrder)
    .limit(1);
  return result[0];
}

export async function updateBossProgress(bossId: number, data: Partial<InsertReliquiasBossProgress>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reliquiasBossProgress)
    .set(data)
    .where(eq(reliquiasBossProgress.id, bossId));
}

export async function defeatGuard(bossId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const boss = await db.select().from(reliquiasBossProgress).where(eq(reliquiasBossProgress.id, bossId)).limit(1);
  if (!boss[0]) return;
  
  const newGuardsDefeated = boss[0].guardsDefeated + 1;
  await db.update(reliquiasBossProgress)
    .set({ guardsDefeated: newGuardsDefeated })
    .where(eq(reliquiasBossProgress.id, bossId));
}

export async function defeatBoss(bossId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const boss = await db.select().from(reliquiasBossProgress).where(eq(reliquiasBossProgress.id, bossId)).limit(1);
  if (!boss[0]) return;
  
  const newDefeatedCount = boss[0].bossDefeatedCount + 1;
  const isCompleted = newDefeatedCount >= boss[0].bossMaxDefeats;
  
  await db.update(reliquiasBossProgress)
    .set({ 
      bossDefeatedCount: newDefeatedCount,
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    })
    .where(eq(reliquiasBossProgress.id, bossId));
}

// ============ RELIQUIAS MEMBER ROLE FUNCTIONS ============

export async function getMemberRolesBySeason(seasonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    role: reliquiasMemberRoles,
    member: members
  })
    .from(reliquiasMemberRoles)
    .innerJoin(members, eq(reliquiasMemberRoles.memberId, members.id))
    .where(eq(reliquiasMemberRoles.seasonId, seasonId));
}

export async function setMemberRole(seasonId: number, memberId: number, role: "guards" | "boss") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select()
    .from(reliquiasMemberRoles)
    .where(and(
      eq(reliquiasMemberRoles.seasonId, seasonId),
      eq(reliquiasMemberRoles.memberId, memberId)
    ))
    .limit(1);
  
  if (existing[0]) {
    await db.update(reliquiasMemberRoles)
      .set({ role })
      .where(eq(reliquiasMemberRoles.id, existing[0].id));
  } else {
    await db.insert(reliquiasMemberRoles).values({ seasonId, memberId, role });
  }
}

// ============ RELIQUIAS DAMAGE FUNCTIONS ============

export async function getDamageRankingBySeason(seasonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    damage: reliquiasDamage,
    member: members
  })
    .from(reliquiasDamage)
    .innerJoin(members, eq(reliquiasDamage.memberId, members.id))
    .where(eq(reliquiasDamage.seasonId, seasonId))
    .orderBy(desc(reliquiasDamage.damageNumeric));
}

export async function upsertMemberDamage(seasonId: number, memberId: number, cumulativeDamage: string, damageNumeric: number, ranking?: number, power?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select()
    .from(reliquiasDamage)
    .where(and(
      eq(reliquiasDamage.seasonId, seasonId),
      eq(reliquiasDamage.memberId, memberId)
    ))
    .limit(1);
  
  if (existing[0]) {
    await db.update(reliquiasDamage)
      .set({ cumulativeDamage, damageNumeric, ranking, power })
      .where(eq(reliquiasDamage.id, existing[0].id));
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

// ============ RANKING FUNCTIONS ============

export async function getGvgRanking(startDate?: string, endDate?: string, limit = 20) {
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
    totalStars: sql<number>`SUM(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars})`,
    totalAttacks: sql<number>`COUNT(*)`,
    avgStars: sql<number>`AVG(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars})`,
  })
    .from(gvgAttacks)
    .innerJoin(members, eq(gvgAttacks.memberId, members.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(gvgAttacks.memberId, members.name)
    .orderBy(desc(sql`SUM(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars})`))
    .limit(limit);
  
  return result;
}

export async function getGotRanking(startDate?: string, endDate?: string, limit = 20) {
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
    totalPoints: sql<number>`SUM(${gotAttacks.points})`,
    totalAttackVictories: sql<number>`SUM(${gotAttacks.attackVictories})`,
    totalAttackDefeats: sql<number>`SUM(${gotAttacks.attackDefeats})`,
    totalDefenseVictories: sql<number>`SUM(${gotAttacks.defenseVictories})`,
    totalDefenseDefeats: sql<number>`SUM(${gotAttacks.defenseDefeats})`,
    totalBattles: sql<number>`COUNT(*)`,
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(gotAttacks.memberId, members.name)
    .orderBy(desc(sql`SUM(${gotAttacks.points})`))
    .limit(limit);
  
  return result;
}

// ============ MEMBER HISTORY FUNCTIONS ============

export async function getMemberGvgHistory(memberId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(gvgAttacks)
    .where(eq(gvgAttacks.memberId, memberId))
    .orderBy(desc(gvgAttacks.eventDate))
    .limit(limit);
}

export async function getMemberGotHistory(memberId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(gotAttacks)
    .where(eq(gotAttacks.memberId, memberId))
    .orderBy(desc(gotAttacks.eventDate))
    .limit(limit);
}

export async function getMemberReliquiasHistory(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    damage: reliquiasDamage,
    season: reliquiasSeasons
  })
    .from(reliquiasDamage)
    .innerJoin(reliquiasSeasons, eq(reliquiasDamage.seasonId, reliquiasSeasons.id))
    .where(eq(reliquiasDamage.memberId, memberId))
    .orderBy(desc(reliquiasSeasons.startDate));
}

export async function getMemberFullStats(memberId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // GvG stats
  const gvgStats = await db.select({
    totalStars: sql<number>`COALESCE(SUM(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars}), 0)`,
    totalBattles: sql<number>`COUNT(*)`,
    avgStars: sql<number>`COALESCE(AVG(${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars}), 0)`,
  })
    .from(gvgAttacks)
    .where(eq(gvgAttacks.memberId, memberId));
  
  // GoT stats
  const gotStats = await db.select({
    totalPoints: sql<number>`COALESCE(SUM(${gotAttacks.points}), 0)`,
    totalBattles: sql<number>`COUNT(*)`,
    totalAttackVictories: sql<number>`COALESCE(SUM(${gotAttacks.attackVictories}), 0)`,
    totalDefenseVictories: sql<number>`COALESCE(SUM(${gotAttacks.defenseVictories}), 0)`,
  })
    .from(gotAttacks)
    .where(eq(gotAttacks.memberId, memberId));
  
  // Reliquias stats
  const reliquiasStats = await db.select({
    totalDamage: sql<number>`COALESCE(SUM(${reliquiasDamage.damageNumeric}), 0)`,
    seasonsParticipated: sql<number>`COUNT(DISTINCT ${reliquiasDamage.seasonId})`,
  })
    .from(reliquiasDamage)
    .where(eq(reliquiasDamage.memberId, memberId));
  
  return {
    gvg: gvgStats[0] || { totalStars: 0, totalBattles: 0, avgStars: 0 },
    got: gotStats[0] || { totalPoints: 0, totalBattles: 0, totalAttackVictories: 0, totalDefenseVictories: 0 },
    reliquias: reliquiasStats[0] || { totalDamage: 0, seasonsParticipated: 0 },
  };
}


// ============ RELIQUIAS MEMBER ASSIGNMENTS FUNCTIONS ============

export async function getReliquiasMemberAssignments(seasonId: number, bossName: string, attackNumber: number = 1) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    assignment: reliquiasMemberAssignments,
    member: members,
  })
    .from(reliquiasMemberAssignments)
    .innerJoin(members, eq(reliquiasMemberAssignments.memberId, members.id))
    .where(and(
      eq(reliquiasMemberAssignments.seasonId, seasonId),
      eq(reliquiasMemberAssignments.bossName, bossName),
      eq(reliquiasMemberAssignments.attackNumber, attackNumber)
    ))
    .orderBy(members.name);
}

export async function upsertReliquiasMemberAssignment(data: InsertReliquiasMemberAssignment) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if assignment exists
  const existing = await db.select()
    .from(reliquiasMemberAssignments)
    .where(and(
      eq(reliquiasMemberAssignments.seasonId, data.seasonId),
      eq(reliquiasMemberAssignments.memberId, data.memberId),
      eq(reliquiasMemberAssignments.bossName, data.bossName),
      eq(reliquiasMemberAssignments.attackNumber, data.attackNumber || 1)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db.update(reliquiasMemberAssignments)
      .set({
        role: data.role,
        guard1Number: data.guard1Number,
        guard2Number: data.guard2Number,
        performance: data.performance != null ? String(data.performance) : null,
        updatedAt: String(Date.now()),
      })
      .where(eq(reliquiasMemberAssignments.id, existing[0].id));
    return existing[0].id;
  } else {
    // Insert new with default values for optional fields
    // Generate ID using a large random number to avoid collisions in concurrent inserts
    // TiDB doesn't support auto-increment modification, so we use random IDs
    let newId = Math.floor(Math.random() * 1000000) + 10000;
    
    // Check if ID already exists and retry if needed
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.select().from(reliquiasMemberAssignments)
        .where(eq(reliquiasMemberAssignments.id, newId))
        .limit(1);
      
      if (existing.length === 0) {
        break; // ID is unique
      }
      
      // ID exists, try another
      newId = Math.floor(Math.random() * 1000000) + 10000;
      attempts++;
    }
    
    if (attempts >= 5) {
      throw new Error('Failed to generate unique ID for reliquiasMemberAssignments');
    }
    
    const performance = data.performance != null ? String(data.performance) : null;
    const now = String(Date.now()); // Unix timestamp as string for varchar field
    await db.insert(reliquiasMemberAssignments).values({
      id: newId,
      seasonId: data.seasonId,
      memberId: data.memberId,
      bossName: data.bossName,
      bossId: data.bossId ?? 0,
      attackNumber: data.attackNumber || 1,
      role: data.role,
      guard1Number: data.guard1Number ?? 0,
      guard2Number: data.guard2Number ?? 0,
      performance,
      createdAt: now,
      updatedAt: now,
    });
    return newId;
  }
}

export async function deleteReliquiasMemberAssignment(seasonId: number, memberId: number, bossName: string, attackNumber: number = 1) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(reliquiasMemberAssignments)
    .where(and(
      eq(reliquiasMemberAssignments.seasonId, seasonId),
      eq(reliquiasMemberAssignments.memberId, memberId),
      eq(reliquiasMemberAssignments.bossName, bossName),
      eq(reliquiasMemberAssignments.attackNumber, attackNumber)
    ));
}

export async function getAllReliquiasMemberAssignmentsForSeason(seasonId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    assignment: reliquiasMemberAssignments,
    member: members,
  })
    .from(reliquiasMemberAssignments)
    .innerJoin(members, eq(reliquiasMemberAssignments.memberId, members.id))
    .where(eq(reliquiasMemberAssignments.seasonId, seasonId))
    .orderBy(reliquiasMemberAssignments.bossName, reliquiasMemberAssignments.attackNumber, members.name);
}

// ============ GVG MATCH INFO FUNCTIONS ============

export async function getGvgMatchInfo(eventDate: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select()
    .from(gvgMatchInfo)
    .where(eq(gvgMatchInfo.eventDate, eventDate))
    .limit(1);
  return result[0] || null;
}

export async function saveGvgMatchInfo(data: InsertGvgMatchInfo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select()
    .from(gvgMatchInfo)
    .where(eq(gvgMatchInfo.eventDate, data.eventDate))
    .limit(1);
  
  if (existing[0]) {
    await db.update(gvgMatchInfo)
      .set({
        opponentGuild: data.opponentGuild,
        ourScore: data.ourScore,
        opponentScore: data.opponentScore,
      })
      .where(eq(gvgMatchInfo.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(gvgMatchInfo).values(data).returning({ id: true });
    return result[0]?.id;
  }
}

export async function getGvgMatchHistory(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(gvgMatchInfo)
    .orderBy(desc(gvgMatchInfo.eventDate))
    .limit(limit);
}

// ============ GVG EVOLUTION FUNCTIONS ============

export async function getGvgEvolutionData(startDate?: string, endDate?: string) {
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
    totalStars: sql<number>`${gvgAttacks.attack1Stars} + ${gvgAttacks.attack2Stars}`,
    attack1Stars: gvgAttacks.attack1Stars,
    attack2Stars: gvgAttacks.attack2Stars,
  })
    .from(gvgAttacks)
    .innerJoin(members, eq(gvgAttacks.memberId, members.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(gvgAttacks.eventDate, members.name);
}

// ============ RELIQUIAS RANKING FUNCTIONS ============

export async function getReliquiasRanking(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    memberId: reliquiasDamage.memberId,
    memberName: members.name,
    totalDamage: sql<number>`COALESCE(SUM(${reliquiasDamage.damageNumeric}), 0)`,
    seasonsParticipated: sql<number>`COUNT(DISTINCT ${reliquiasDamage.seasonId})`,
  })
    .from(reliquiasDamage)
    .innerJoin(members, eq(reliquiasDamage.memberId, members.id))
    .groupBy(reliquiasDamage.memberId, members.name)
    .orderBy(desc(sql`SUM(${reliquiasDamage.damageNumeric})`))
    .limit(limit);
  
  return result;
}

// ============ TELEGRAM CONFIG FUNCTIONS ============

export async function getTelegramConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select()
    .from(botConfig)
    .where(eq(botConfig.isActive, true))
    .limit(1);
  if (!result[0]) return null;
  return {
    botToken: result[0].telegramBotToken,
    chatId: result[0].telegramGroupId,
  };
}

// ============ GOT PREVIOUS POINTS FUNCTIONS ============

export async function getGotPreviousPoints(currentEventDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Find the previous event date
  const previousDateResult = await db.select({
    eventDate: gotAttacks.eventDate,
  })
    .from(gotAttacks)
    .where(sql`${gotAttacks.eventDate} < ${currentEventDate}`)
    .groupBy(gotAttacks.eventDate)
    .orderBy(desc(gotAttacks.eventDate))
    .limit(1);
  
  if (!previousDateResult[0]) return [];
  
  const previousDate = previousDateResult[0].eventDate;
  
  // Get all attacks from the previous date
  return db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    points: gotAttacks.points,
    attackVictories: gotAttacks.attackVictories,
    attackDefeats: gotAttacks.attackDefeats,
    defenseVictories: gotAttacks.defenseVictories,
    defenseDefeats: gotAttacks.defenseDefeats,
    eventDate: gotAttacks.eventDate,
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .where(eq(gotAttacks.eventDate, previousDate))
    .orderBy(members.name);
}

// ============ GOT RANKING - ÚLTIMA BATALHA ============

export async function getGotRankingLatest(startDate?: string, endDate?: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  // Pegar todos os membros que participam de GoT
  const allMembers = await db.select({
    id: members.id,
    name: members.name,
  })
    .from(members)
    .where(eq(members.participatesGot, true));
  
  // Para cada membro, buscar dados de diferentes batalhas
  const ranking = await Promise.all(
    allMembers.map(async (member) => {
      // Ultimo registro com pontos
      const lastPoints = await db.select({
        points: gotAttacks.points,
      })
        .from(gotAttacks)
        .where(eq(gotAttacks.memberId, member.id))
        .orderBy(desc(gotAttacks.eventDate))
        .limit(1);
      
      // Ultimo registro com dados de ataque (onde tem vitoria ou derrota em ataque)
      const lastAttack = await db.select({
        attackVictories: gotAttacks.attackVictories,
        attackDefeats: gotAttacks.attackDefeats,
      })
        .from(gotAttacks)
        .where(and(
          eq(gotAttacks.memberId, member.id),
          sql`(${gotAttacks.attackVictories} > 0 OR ${gotAttacks.attackDefeats} > 0)`
        ))
        .orderBy(desc(gotAttacks.eventDate))
        .limit(1);
      
      // Ultimo registro com dados de defesa (onde tem vitoria ou derrota em defesa)
      const lastDefense = await db.select({
        defenseVictories: gotAttacks.defenseVictories,
        defenseDefeats: gotAttacks.defenseDefeats,
      })
        .from(gotAttacks)
        .where(and(
          eq(gotAttacks.memberId, member.id),
          sql`(${gotAttacks.defenseVictories} > 0 OR ${gotAttacks.defenseDefeats} > 0)`
        ))
        .orderBy(desc(gotAttacks.eventDate))
        .limit(1);
      
      // Contar total de batalhas (quantas vezes foi escalado)
      const battleCount = await db.select({
        count: sql<number>`COUNT(*)`,
      })
        .from(gotAttacks)
        .where(eq(gotAttacks.memberId, member.id));
      
      return {
        memberId: member.id,
        memberName: member.name,
        totalPoints: lastPoints[0]?.points || 0,
        totalAttackVictories: lastAttack[0]?.attackVictories || 0,
        totalAttackDefeats: lastAttack[0]?.attackDefeats || 0,
        totalDefenseVictories: lastDefense[0]?.defenseVictories || 0,
        totalDefenseDefeats: lastDefense[0]?.defenseDefeats || 0,
        totalBattles: battleCount[0]?.count || 0,
      };
    })
  );
  
  // Ordenar por pontos e limitar
  return ranking
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

// ============ GOT PRECISA DE ATENÇÃO - NÃO ATACARAM NA ÚLTIMA BATALHA ============

export async function getGotNonAttackersLatest(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Pegar a última data de batalha
  const latestDate = await db.select({
    maxDate: sql<string>`MAX(${gotAttacks.eventDate})`,
  })
    .from(gotAttacks);
  
  if (!latestDate[0]?.maxDate) return [];
  
  // Pegar membros que não atacaram na última batalha
  const result = await db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    points: gotAttacks.points,
    attackVictories: gotAttacks.attackVictories,
    attackDefeats: gotAttacks.attackDefeats,
    defenseVictories: gotAttacks.defenseVictories,
    defenseDefeats: gotAttacks.defenseDefeats,
    didNotAttack: gotAttacks.didNotAttack,
    eventDate: gotAttacks.eventDate,
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .where(
      and(
        eq(gotAttacks.eventDate, latestDate[0].maxDate),
        eq(gotAttacks.didNotAttack, true)
      )
    )
    .orderBy(members.name);
  
  return result;
}

// ============ GOT DESEMPENHO RUIM - ÚLTIMA BATALHA ============

export async function getGotLowPerformersLatest(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Subquery para pegar a última data de cada membro
  const latestDateSubquery = db
    .select({
      memberId: gotAttacks.memberId,
      maxDate: sql<string>`MAX(${gotAttacks.eventDate})`.as('maxDate'),
    })
    .from(gotAttacks)
    .groupBy(gotAttacks.memberId)
    .as('latest');
  
  // Pegar membros com saldo negativo na última batalha
  const result = await db.select({
    memberId: gotAttacks.memberId,
    memberName: members.name,
    points: gotAttacks.points,
    attackVictories: gotAttacks.attackVictories,
    attackDefeats: gotAttacks.attackDefeats,
    defenseVictories: gotAttacks.defenseVictories,
    defenseDefeats: gotAttacks.defenseDefeats,
    eventDate: gotAttacks.eventDate,
    balance: sql<number>`(${gotAttacks.attackVictories} + ${gotAttacks.defenseVictories}) - (${gotAttacks.attackDefeats} + ${gotAttacks.defenseDefeats})`,
  })
    .from(gotAttacks)
    .innerJoin(members, eq(gotAttacks.memberId, members.id))
    .innerJoin(
      latestDateSubquery,
      and(
        eq(gotAttacks.memberId, latestDateSubquery.memberId),
        eq(gotAttacks.eventDate, latestDateSubquery.maxDate)
      )
    )
    .where(
      sql`(${gotAttacks.attackVictories} + ${gotAttacks.defenseVictories}) - (${gotAttacks.attackDefeats} + ${gotAttacks.defenseDefeats}) < 0`
    )
    .orderBy(sql`(${gotAttacks.attackVictories} + ${gotAttacks.defenseVictories}) - (${gotAttacks.attackDefeats} + ${gotAttacks.defenseDefeats})`);
  
  return result;
}

// ============ GOT HISTÓRICO DE FALTAS - TODOS OS ATAQUES ============

export async function getGotNonAttackersHistory(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Pegar todos os escalados
  const allMembers = await db.select({
    id: members.id,
    name: members.name,
  })
    .from(members)
    .where(eq(members.isActive, true));
  
  // Para cada membro, buscar histórico de faltas
  const result = [];
  
  for (const member of allMembers) {
    const attacks = await db.select({
      eventDate: gotAttacks.eventDate,
      didNotAttack: gotAttacks.didNotAttack,
      points: gotAttacks.points,
    })
      .from(gotAttacks)
      .where(
        and(
          eq(gotAttacks.memberId, member.id),
          startDate ? gte(gotAttacks.eventDate, startDate) : undefined,
          endDate ? lte(gotAttacks.eventDate, endDate) : undefined
        )
      )
      .orderBy(desc(gotAttacks.eventDate));
    
    const totalAttacks = attacks.length;
    const nonAttacks = attacks.filter(a => a.didNotAttack).length;
    
    if (nonAttacks > 0) {
      result.push({
        memberId: member.id,
        memberName: member.name,
        totalAttacks,
        nonAttacks,
        percentage: totalAttacks > 0 ? ((nonAttacks / totalAttacks) * 100).toFixed(1) : '0',
        battles: attacks.map(a => ({
          date: a.eventDate,
          didNotAttack: a.didNotAttack,
          points: a.points,
        })),
      });
    }
  }
  
  return result.sort((a, b) => b.nonAttacks - a.nonAttacks);
}

// ============ GOT MÉTRICA DE APROVEITAMENTO - TODAS AS BATALHAS ============

export async function getGotPerformanceMetrics(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Pegar todos os escalados
  const allMembers = await db.select({
    id: members.id,
    name: members.name,
  })
    .from(members)
    .where(eq(members.isActive, true));
  
  const result = [];
  
  for (const member of allMembers) {
    const attacks = await db.select({
      attackVictories: gotAttacks.attackVictories,
      attackDefeats: gotAttacks.attackDefeats,
      defenseVictories: gotAttacks.defenseVictories,
      defenseDefeats: gotAttacks.defenseDefeats,
    })
      .from(gotAttacks)
      .where(
        and(
          eq(gotAttacks.memberId, member.id),
          startDate ? gte(gotAttacks.eventDate, startDate) : undefined,
          endDate ? lte(gotAttacks.eventDate, endDate) : undefined
        )
      );
    
    if (attacks.length === 0) continue;
    
    // Calcular totais
    const totalAttackVictories = attacks.reduce((sum, a) => sum + a.attackVictories, 0);
    const totalAttackDefeats = attacks.reduce((sum, a) => sum + a.attackDefeats, 0);
    const totalDefenseVictories = attacks.reduce((sum, a) => sum + a.defenseVictories, 0);
    const totalDefenseDefeats = attacks.reduce((sum, a) => sum + a.defenseDefeats, 0);
    
    const totalVictories = totalAttackVictories + totalDefenseVictories;
    const totalBattles = totalAttackVictories + totalAttackDefeats + totalDefenseVictories + totalDefenseDefeats;
    
    const performance = totalBattles > 0 ? ((totalVictories / totalBattles) * 100) : 0;
    
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
        performance: performance.toFixed(1),
      });
    }
  }
  
  return result.sort((a, b) => parseFloat(a.performance) - parseFloat(b.performance));
}


// ============ GVG SEASONS FUNCTIONS ============

export async function createGvgSeason(data: InsertGvgSeason): Promise<GvgSeason | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create GvG season: database not available");
    return null;
  }

  try {
    const result = await (db as any).insert(gvgSeasons).values(data).returning({ id: true });
    const season = await (db as any).query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.id, result[0]?.id),
    });
    return season || null;
  } catch (error) {
    console.error("[Database] Error creating GvG season:", error);
    return null;
  }
}

export async function getActiveSeason(): Promise<GvgSeason | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active season: database not available");
    return null;
  }

  try {
    const season = await (db as any).query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.status, "active"),
    });
    return season || null;
  } catch (error) {
    console.error("[Database] Error getting active season:", error);
    return null;
  }
}

export async function getAllSeasons(): Promise<GvgSeason[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get seasons: database not available");
    return [];
  }

  try {
    const seasons = await (db as any).query.gvgSeasons.findMany({
      orderBy: desc(gvgSeasons.createdAt),
    });
    return seasons;
  } catch (error) {
    console.error("[Database] Error getting seasons:", error);
    return [];
  }
}

export async function updateSeasonStatus(seasonId: number, status: "active" | "paused" | "ended"): Promise<GvgSeason | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update season: database not available");
    return null;
  }

  try {
    await (db as any).update(gvgSeasons)
      .set({ status, updatedAt: new Date() })
      .where(eq(gvgSeasons.id, seasonId));
    
    const season = await (db as any).query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.id, seasonId),
    });
    return season || null;
  } catch (error) {
    console.error("[Database] Error updating season:", error);
    return null;
  }
}

export async function endCurrentSeasonAndStartNew(newSeasonData: InsertGvgSeason): Promise<{ oldSeason: GvgSeason | null; newSeason: GvgSeason | null }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot end/start seasons: database not available");
    return { oldSeason: null, newSeason: null };
  }

  try {
    // End current active season
    const activeSeason = await (db as any).query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.status, "active"),
    });

    let oldSeason = null;
    if (activeSeason) {
      await (db as any).update(gvgSeasons)
        .set({ status: "ended", updatedAt: new Date() })
        .where(eq(gvgSeasons.id, activeSeason.id));
      oldSeason = activeSeason;
    }

    // Create new season
    const result = await (db as any).insert(gvgSeasons).values(newSeasonData);
    const newSeason = await (db as any).query.gvgSeasons.findFirst({
      where: eq(gvgSeasons.id, result[0]?.id),
    });

    return { oldSeason, newSeason: newSeason || null };
  } catch (error) {
    console.error("[Database] Error ending/starting seasons:", error);
    return { oldSeason: null, newSeason: null };
  }
}


// ============ GoT STRATEGIES ============

export async function createGotStrategy(strategy: InsertGotStrategy): Promise<GotStrategy | null> {
  const db = await getDb();
  if (!db) {
    console.error('[DB] Database not available');
    return null;
  }
  
  try {
    // Validar campos obrigatórios
    if (!strategy.name || !strategy.attackFormation1 || !strategy.attackFormation2 || 
        !strategy.attackFormation3 || !strategy.defenseFormation1 || !strategy.defenseFormation2 || 
        !strategy.defenseFormation3 || !strategy.createdBy) {
      throw new Error('Missing required fields for strategy');
    }
    
    console.log('[DB] Creating strategy with validated data:', strategy);
    
    const result = await db.insert(gotStrategies).values({
      name: strategy.name,
      attackFormation1: strategy.attackFormation1,
      attackFormation2: strategy.attackFormation2,
      attackFormation3: strategy.attackFormation3,
      defenseFormation1: strategy.defenseFormation1,
      defenseFormation2: strategy.defenseFormation2,
      defenseFormation3: strategy.defenseFormation3,
      usageCount: strategy.usageCount || 0,
      createdBy: strategy.createdBy,
    });
    
    console.log('[DB] Insert result:', result);
    
    // Extrair o ID inserido
    const insertId = (result as any)?.[0]?.id;
    if (insertId) {
      // Buscar a estratégia criada pelo ID
      const created = await db.select().from(gotStrategies)
        .where(eq(gotStrategies.id, insertId))
        .limit(1);
      console.log('[DB] Created strategy:', created[0]);
      return created[0] || null;
    }
    
    // Fallback: buscar por createdBy e createdAt
    const created = await db.select().from(gotStrategies)
      .where(eq(gotStrategies.createdBy, strategy.createdBy))
      .orderBy(desc(gotStrategies.createdAt))
      .limit(1);
    
    console.log('[DB] Created strategy (fallback):', created[0]);
    return created[0] || null;
  } catch (error) {
    console.error('[DB] Error creating strategy:', error);
    throw error;
  }
}

export async function getAllGotStrategies(): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(gotStrategies).orderBy(desc(gotStrategies.usageCount));
}

export async function getGotStrategyById(id: number): Promise<GotStrategy | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(gotStrategies).where(eq(gotStrategies.id, id)).limit(1);
  return result[0] || null;
}

export async function updateGotStrategy(id: number, updates: Partial<InsertGotStrategy>): Promise<GotStrategy | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(gotStrategies).set(updates).where(eq(gotStrategies.id, id));
  
  const updated = await db.select().from(gotStrategies).where(eq(gotStrategies.id, id)).limit(1);
  return updated[0] || null;
}

export async function deleteGotStrategy(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(gotStrategies).where(eq(gotStrategies.id, id));
  return true;
}

export async function searchGotStrategies(keyword: string): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Search by name only
  const results = await db.select().from(gotStrategies);
  return results.filter(s => 
    s.name?.toLowerCase().includes(keyword.toLowerCase())
  );
}

export async function getGotStrategiesByAttackFormation(attackerName: string): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gotStrategies);
  return results.filter(s => 
    s.attackFormation1?.toLowerCase().includes(attackerName.toLowerCase()) ||
    s.attackFormation2?.toLowerCase().includes(attackerName.toLowerCase()) ||
    s.attackFormation3?.toLowerCase().includes(attackerName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

export async function getGotStrategiesByDefenseFormation(defenderName: string): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gotStrategies);
  return results.filter(s => 
    s.defenseFormation1?.toLowerCase().includes(defenderName.toLowerCase()) ||
    s.defenseFormation2?.toLowerCase().includes(defenderName.toLowerCase()) ||
    s.defenseFormation3?.toLowerCase().includes(defenderName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

// Busca avançada por até 3 nomes de cavaleiros (AMBOS os lados)
export async function searchGotStrategiesByMultipleNames(names: string[]): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Limpar e normalizar nomes (máximo 3)
  const cleanedNames = names
    .slice(0, 3)
    .map(n => n.trim().toLowerCase())
    .filter(n => n.length > 0);
  
  if (cleanedNames.length === 0) return [];
  
  const results = await db.select().from(gotStrategies);
  
  // Filtrar estratégias que contenham TODOS os nomes (em qualquer formação)
  return results.filter(s => {
    const allFormations = [
      s.attackFormation1?.toLowerCase() || '',
      s.attackFormation2?.toLowerCase() || '',
      s.attackFormation3?.toLowerCase() || '',
      s.defenseFormation1?.toLowerCase() || '',
      s.defenseFormation2?.toLowerCase() || '',
      s.defenseFormation3?.toLowerCase() || '',
    ];
    
    // Cada nome deve estar em pelo menos uma formação
    return cleanedNames.every(name => 
      allFormations.some(formation => formation.includes(name))
    );
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

// Busca avançada por até 3 nomes de cavaleiros APENAS no ATAQUE
export async function searchGotStrategiesByMultipleNamesInAttack(names: string[]): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Limpar e normalizar nomes (máximo 3)
  const cleanedNames = names
    .slice(0, 3)
    .map(n => n.trim().toLowerCase())
    .filter(n => n.length > 0);
  
  if (cleanedNames.length === 0) return [];
  
  const results = await db.select().from(gotStrategies);
  
  // Logica diferente dependendo do numero de nomes:
  // - 1 nome: retorna ataques que contem esse nome em QUALQUER formacao
  // - 2+ nomes: retorna APENAS ataques que contem TODOS os nomes na MESMA formacao
  return results.filter(s => {
    const attackFormations = [
      s.attackFormation1?.toLowerCase().trim() || '',
      s.attackFormation2?.toLowerCase().trim() || '',
      s.attackFormation3?.toLowerCase().trim() || ''
    ];
    
    if (cleanedNames.length === 1) {
      // 1 nome: busca em qualquer formacao
      return attackFormations.some(formation => {
        const words = formation.split(/\s+/);
        return words.some(word => word === cleanedNames[0]);
      });
    } else {
      // 2+ nomes: TODOS devem estar em QUALQUER formacao (não necessariamente na mesma)
      const allWords = attackFormations.map(f => f.split(/\s+/)).flat();
      return cleanedNames.every(name => allWords.some(word => word === name));
    }
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

// Busca avançada por até 3 nomes de cavaleiros APENAS na DEFESA
export async function searchGotStrategiesByMultipleNamesInDefense(names: string[]): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Limpar e normalizar nomes (máximo 3)
  const cleanedNames = names
    .slice(0, 3)
    .map(n => n.trim().toLowerCase())
    .filter(n => n.length > 0);
  
  if (cleanedNames.length === 0) return [];
  
  const results = await db.select().from(gotStrategies);
  
  // Logica diferente dependendo do numero de nomes:
  // - 1 nome: retorna defesas que contem esse nome em QUALQUER formacao
  // - 2+ nomes: retorna APENAS defesas que contem TODOS os nomes na MESMA formacao
  const filtered = results.filter(s => {
    const defenseFormations = [
      s.defenseFormation1?.toLowerCase().trim() || '',
      s.defenseFormation2?.toLowerCase().trim() || '',
      s.defenseFormation3?.toLowerCase().trim() || ''
    ];
    
    console.log(`[searchGotStrategiesByMultipleNamesInDefense] Checking ${s.name}: ${defenseFormations.join(' | ')} against ${cleanedNames.join(', ')}`);
    
    if (cleanedNames.length === 1) {
      // 1 nome: busca em qualquer formacao
      const match = defenseFormations.some(formation => {
        const words = formation.split(/\s+/);
        return words.some(word => word === cleanedNames[0]);
      });
      if (match) console.log(`[searchGotStrategiesByMultipleNamesInDefense] MATCH (1 name): ${s.name}`);
      return match;
    } else {
      // 2+ nomes: TODOS devem estar em QUALQUER formacao (não necessariamente na mesma)
      const allWords = defenseFormations.map(f => f.split(/\s+/)).flat();
      const match = cleanedNames.every(name => allWords.some(word => word === name));
      if (match) console.log(`[searchGotStrategiesByMultipleNamesInDefense] MATCH (2+ names): ${s.name}`);
      return match;
    }
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  
  console.log(`[searchGotStrategiesByMultipleNamesInDefense] Final result: ${filtered.length} strategies`);
  return filtered;
}

// ============ GVG STRATEGIES (5v5) ============

export async function createGvgStrategy(strategy: InsertGvgStrategy): Promise<GvgStrategy | null> {
  const db = await getDb();
  if (!db) {
    console.error('[DB] Database not available');
    return null;
  }
  
  try {
    // Validar campos obrigatórios (5 cavaleiros em cada lado)
    if (!strategy.attackFormation1 || !strategy.attackFormation2 || 
        !strategy.attackFormation3 || !strategy.attackFormation4 || !strategy.attackFormation5 ||
        !strategy.defenseFormation1 || !strategy.defenseFormation2 || 
        !strategy.defenseFormation3 || !strategy.defenseFormation4 || !strategy.defenseFormation5 ||
        !strategy.createdBy) {
      throw new Error('Missing required fields for GVG strategy');
    }
    
    console.log('[DB] Creating GVG strategy with validated data:', strategy);
    
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
      createdBy: strategy.createdBy,
    });
    
    console.log('[DB] Insert result:', result);
    
    // Extrair o ID inserido
    const insertId = (result as any)?.[0]?.id;
    if (insertId) {
      // Buscar a estratégia criada pelo ID
      const created = await db.select().from(gvgStrategies)
        .where(eq(gvgStrategies.id, insertId))
        .limit(1);
      console.log('[DB] Created GVG strategy:', created[0]);
      return created[0] || null;
    }
    
    // Fallback: buscar por createdBy e createdAt
    const created = await db.select().from(gvgStrategies)
      .where(eq(gvgStrategies.createdBy, strategy.createdBy))
      .orderBy(desc(gvgStrategies.createdAt))
      .limit(1);
    
    console.log('[DB] Created GVG strategy (fallback):', created[0]);
    return created[0] || null;
  } catch (error) {
    console.error('[DB] Error creating GVG strategy:', error);
    throw error;
  }
}

export async function getAllGvgStrategies(): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(gvgStrategies).orderBy(desc(gvgStrategies.usageCount));
}

export async function getGvgStrategyById(id: number): Promise<GvgStrategy | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(gvgStrategies).where(eq(gvgStrategies.id, id)).limit(1);
  return result[0] || null;
}

export async function updateGvgStrategy(id: number, updates: Partial<InsertGvgStrategy>): Promise<GvgStrategy | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(gvgStrategies).set(updates).where(eq(gvgStrategies.id, id));
  
  const updated = await db.select().from(gvgStrategies).where(eq(gvgStrategies.id, id)).limit(1);
  return updated[0] || null;
}

export async function deleteGvgStrategy(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(gvgStrategies).where(eq(gvgStrategies.id, id));
  return true;
}

export async function searchGvgStrategies(keyword: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Search by name only
  const results = await db.select().from(gvgStrategies);
  return results.filter(s => 
    s.name?.toLowerCase().includes(keyword.toLowerCase())
  );
}

export async function getGvgStrategiesByAttackFormation(attackerName: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gvgStrategies);
  return results.filter(s => 
    s.attackFormation1?.toLowerCase().includes(attackerName.toLowerCase()) ||
    s.attackFormation2?.toLowerCase().includes(attackerName.toLowerCase()) ||
    s.attackFormation3?.toLowerCase().includes(attackerName.toLowerCase()) ||
    s.attackFormation4?.toLowerCase().includes(attackerName.toLowerCase()) ||
    s.attackFormation5?.toLowerCase().includes(attackerName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

export async function getGvgStrategiesByDefenseFormation(defenderName: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gvgStrategies);
  return results.filter(s => 
    s.defenseFormation1?.toLowerCase().includes(defenderName.toLowerCase()) ||
    s.defenseFormation2?.toLowerCase().includes(defenderName.toLowerCase()) ||
    s.defenseFormation3?.toLowerCase().includes(defenderName.toLowerCase()) ||
    s.defenseFormation4?.toLowerCase().includes(defenderName.toLowerCase()) ||
    s.defenseFormation5?.toLowerCase().includes(defenderName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}


export async function searchGotStrategiesByKeyword(keyword: string): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gotStrategies);
  return results.filter(s => 
    s.observation?.toLowerCase().includes(keyword.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

export async function searchGvgStrategiesByKeyword(keyword: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gvgStrategies);
  return results.filter(s => 
    (s.name || '').toLowerCase().includes(keyword.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}


export async function getGotStrategiesByName(strategyName: string): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(gotStrategies);
  return results.filter(s => 
    s.name?.toLowerCase().includes(strategyName.toLowerCase())
  ).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}


// Buscar estratégias GVG de ataque com até 5 nomes de cavaleiros
export async function searchGvgStrategiesByMultipleNamesInAttack(names: string[]): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const normalizedNames = names.map(n => n.toLowerCase().trim());
  const results = await db.select().from(gvgStrategies);
  
  return results.filter(s => {
    const attackFormations = [
      s.attackFormation1?.toLowerCase() || '',
      s.attackFormation2?.toLowerCase() || '',
      s.attackFormation3?.toLowerCase() || '',
      s.attackFormation4?.toLowerCase() || '',
      s.attackFormation5?.toLowerCase() || '',
    ];
    
    // Verificar se TODOS os nomes estão presentes no ataque (em qualquer formacao)
    const allWords = attackFormations.map(f => f.split(/\s+/)).flat();
    return normalizedNames.every(name => allWords.some(word => word === name));
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

// Buscar estratégias GVG de defesa com até 5 nomes de cavaleiros
export async function searchGvgStrategiesByMultipleNamesInDefense(names: string[]): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const normalizedNames = names.map(n => n.toLowerCase().trim());
  const results = await db.select().from(gvgStrategies);
  
  return results.filter(s => {
    const defenseFormations = [
      s.defenseFormation1?.toLowerCase() || '',
      s.defenseFormation2?.toLowerCase() || '',
      s.defenseFormation3?.toLowerCase() || '',
      s.defenseFormation4?.toLowerCase() || '',
      s.defenseFormation5?.toLowerCase() || '',
    ];
    
    // Verificar se TODOS os nomes estão presentes na defesa (em qualquer formacao)
    const allWords = defenseFormations.map(f => f.split(/\s+/)).flat();
    return normalizedNames.every(name => allWords.some(word => word === name));
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}

// Buscar dicas de defesa GVG com até 5 nomes de cavaleiros
export async function searchGvgDefenseTips(names: string[]): Promise<GvgStrategy[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[searchGvgDefenseTips] DB connection failed");
      return [];
    }
    
    console.log("[searchGvgDefenseTips] Searching for names:", names);
    const normalizedNames = names.map(n => n.toLowerCase().trim());
    console.log("[searchGvgDefenseTips] Normalized names:", normalizedNames);
    
    const results = await db.select().from(gvgStrategies);
    console.log("[searchGvgDefenseTips] Total strategies in DB:", results.length);
    
    const filtered = results.filter(s => {
      try {
        const defenseFormations = [
          (s.defenseFormation1 || '').toLowerCase().trim(),
          (s.defenseFormation2 || '').toLowerCase().trim(),
          (s.defenseFormation3 || '').toLowerCase().trim(),
          (s.defenseFormation4 || '').toLowerCase().trim(),
          (s.defenseFormation5 || '').toLowerCase().trim(),
        ].filter(f => f);
        
        if (defenseFormations.length === 0) {
          console.log("[searchGvgDefenseTips] Strategy has no defense formations:", s.name);
          return false;
        }
        
        const allWords = defenseFormations.map(f => f.split(/\s+/)).flat().filter(w => w);
        const matches = normalizedNames.every(name => allWords.some(word => word === name));
        
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


// Buscar estratégias GVG de ataque por palavra-chave (busca no nome)
export async function searchGvgStrategiesByKeywordInAttack(keyword: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results = await db.select().from(gvgStrategies);
  
  const filtered = results.filter(s => {
    // Remover barra e espaços extras do nome
    const cleanName = (s.name || '').toLowerCase().replace(/\s*\/\s*/g, ' ').trim();
    
    // Buscar a palavra-chave no nome limpo
    return cleanName.includes(normalizedKeyword);
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  
  return filtered;
}

// Buscar estratégias GVG de defesa por palavra-chave (busca no nome)
export async function searchGvgStrategiesByKeywordInDefense(keyword: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results = await db.select().from(gvgStrategies);
  
  const filtered = results.filter(s => {
    // Remover barra e espaços extras do nome
    const cleanName = (s.name || '').toLowerCase().replace(/\s*\/\s*/g, ' ').trim();
    
    // Buscar a palavra-chave no nome limpo
    return cleanName.includes(normalizedKeyword);
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  
  return filtered;
}

// Buscar dicas de defesa GVG por palavra-chave (busca no nome com observation)
export async function searchGvgDefenseTipsByKeyword(keyword: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) return [];
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  const results = await db.select().from(gvgStrategies);
  
  return results.filter(s => {
    const name = (s.name || '').toLowerCase();
    
    // Buscar a palavra-chave no nome
    return name.includes(normalizedKeyword);
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
}


// ============ MEMBER SEARCH FUNCTIONS ============

export async function searchMembersByNamePart(searchTerm: string): Promise<Member[]> {
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

    // Busca case-insensitive por membros que COMEÇAM com a parte do nome
    const results = await db
      .select()
      .from(members)
      .where(sql`LOWER(${members.name}) LIKE ${`${normalizedSearch}%`}`)
      .orderBy(members.name);

    return results;
  } catch (error) {
    console.error("[Database] Error searching members:", error);
    return [];
  }
}



// Buscar cavaleiros nas estratégias GoT por letra ou parte do nome
export async function searchCharactersInGotStrategies(searchTerm: string): Promise<{character: string, strategies: GotStrategy[]}[]> {
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

    // Buscar todas as estratégias GoT
    const allStrategies = await db
      .select()
      .from(gotStrategies)
      .orderBy(gotStrategies.name);

    // Extrair todos os cavaleiros únicos que começam com o termo de busca
    // Usar Map com chave normalizada para evitar duplicatas
    const characterMap = new Map<string, {original: string, strategyIds: Set<number>}>();
    
    for (const strategy of allStrategies) {
      const formations = [
        strategy.attackFormation1,
        strategy.attackFormation2,
        strategy.attackFormation3,
        strategy.defenseFormation1,
        strategy.defenseFormation2,
        strategy.defenseFormation3,
      ];

      for (const formation of formations) {
        if (formation && formation.toLowerCase().startsWith(normalizedSearch)) {
          // Normalizar: remover TODOS os espaços extras e converter para lowercase
          const normalized = formation.trim().replace(/\s+/g, ' ').toLowerCase();
          
          if (!characterMap.has(normalized)) {
            characterMap.set(normalized, { original: formation.trim(), strategyIds: new Set() });
          } else {
            // Manter a versão original mais curta
            const current = characterMap.get(normalized)!;
            if (formation.trim().length < current.original.length) {
              current.original = formation.trim();
            }
          }
          characterMap.get(normalized)!.strategyIds.add(strategy.id);
        }
      }
    }

    // Converter para array de objetos com estratégias
    const results: {character: string, strategies: GotStrategy[]}[] = [];
    Array.from(characterMap.entries()).forEach(([normalized, {original, strategyIds}]) => {
      const strategies = allStrategies.filter(s => strategyIds.has(s.id));
      // Usar a versão original com maiúsculas corretas
      results.push({ character: original, strategies });
    });

    return results.sort((a, b) => a.character.localeCompare(b.character));
  } catch (error) {
    console.error("[Database] Error searching characters in GoT strategies:", error);
    return [];
  }
}

// Buscar cavaleiros nas estratégias GVG por letra ou parte do nome
export async function searchCharactersInGvgStrategies(searchTerm: string): Promise<{character: string, strategies: GvgStrategy[]}[]> {
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

    // Buscar todas as estratégias GVG
    const allStrategies = await db
      .select()
      .from(gvgStrategies)
      .orderBy(gvgStrategies.name);

    // Extrair todos os cavaleiros únicos que começam com o termo de busca
    // Usar Map com chave normalizada para evitar duplicatas
    const characterMap = new Map<string, {original: string, strategyIds: Set<number>}>();
    
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
        strategy.defenseFormation5,
      ];

      for (const formation of formations) {
        if (formation && formation.toLowerCase().startsWith(normalizedSearch)) {
          // Normalizar: remover TODOS os espaços extras e converter para lowercase
          const normalized = formation.trim().replace(/\s+/g, ' ').toLowerCase();
          
          if (!characterMap.has(normalized)) {
            characterMap.set(normalized, { original: formation.trim(), strategyIds: new Set() });
          } else {
            // Manter a versão original mais curta
            const current = characterMap.get(normalized)!;
            if (formation.trim().length < current.original.length) {
              current.original = formation.trim();
            }
          }
          characterMap.get(normalized)!.strategyIds.add(strategy.id);
        }
      }
    }

    // Converter para array de objetos com estratégias
    const results: {character: string, strategies: GvgStrategy[]}[] = [];
    Array.from(characterMap.entries()).forEach(([normalized, {original, strategyIds}]) => {
      const strategies = allStrategies.filter(s => strategyIds.has(s.id));
      results.push({ character: original, strategies });
    });

    return results.sort((a, b) => a.character.localeCompare(b.character));
  } catch (error) {
    console.error("[Database] Error searching characters in GVG strategies:", error);
    return [];
  }
}


// ============ CARD FUNCTIONS ============

/**
 * Criar uma nova carta
 */
export async function createCard(data: InsertCard): Promise<Card | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create card: database not available");
    return null;
  }

  try {
    await db.insert(cards).values(data).returning({ id: true });
    
    // Buscar a carta criada pelo nome
    const newCards = await db.select().from(cards).where(eq(cards.name, data.name)).limit(1);
    return newCards[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create card:", error);
    throw error;
  }
}

/**
 * Buscar todas as cartas
 */
export async function getAllCards(): Promise<Card[]> {
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

/**
 * Buscar carta por ID
 */
export async function getCardById(id: number): Promise<Card | null> {
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

/**
 * Buscar cartas por nome (busca parcial)
 */
export async function searchCards(searchTerm: string): Promise<Card[]> {
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

/**
 * Atualizar uma carta
 */
export async function updateCard(id: number, data: Partial<InsertCard>): Promise<Card | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update card: database not available");
    return null;
  }

  try {
    await db.update(cards).set(data).where(eq(cards.id, id));
    
    // Buscar a carta atualizada
    const result = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update card:", error);
    throw error;
  }
}

/**
 * Deletar uma carta
 */
export async function deleteCard(id: number): Promise<boolean> {
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

/**
 * Criar backup de uma carta
 */
export async function createCardBackup(
  cardId: number,
  backupType: "create" | "update" | "delete" | "manual",
  cardData: Card,
  backupReason: string | null,
  createdBy: number
): Promise<void> {
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
      createdBy,
    });
  } catch (error) {
    console.error("[Database] Failed to create card backup:", error);
    throw error;
  }
}

/**
 * Exportar todas as cartas como JSON
 */
export async function exportCardsAsJson(): Promise<string> {
  const allCards = await getAllCards();
  return JSON.stringify(allCards, null, 2);
}

/**
 * Importar cartas de JSON
 */
export async function importCardsFromJson(jsonData: string, createdBy: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot import cards: database not available");
    return 0;
  }

  try {
    const cardsToImport = JSON.parse(jsonData) as Array<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>;
    let importedCount = 0;

    for (const cardData of cardsToImport) {
      try {
        // Verificar se a carta já existe pelo nome
        const existingCards = await db.select().from(cards).where(eq(cards.name, cardData.name)).limit(1);
        const existingCard = existingCards[0] || null;

        if (existingCard) {
          // Atualizar carta existente
          await updateCard(existingCard.id, {
            ...cardData,
            createdBy,
          });
        } else {
          // Criar nova carta
          await createCard({
            ...cardData,
            createdBy,
          });
        }
        importedCount++;
      } catch (error) {
        console.error(`[Database] Failed to import card "${cardData.name}":`, error);
        // Continuar com a próxima carta
      }
    }

    return importedCount;
  } catch (error) {
    console.error("[Database] Failed to import cards from JSON:", error);
    throw error;
  }
}


// ============ CHARACTER FUNCTIONS ============

export async function createCharacter(data: any) {
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

export async function getCharacterById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select()
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get character:", error);
    return null;
  }
}

export async function getCharacterByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select()
      .from(characters)
      .where(eq(characters.name, name))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get character by name:", error);
    return null;
  }
}

export async function getAllCharacters() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(characters).orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to get all characters:", error);
    return [];
  }
}

export async function searchCharacters(query: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characters)
      .where(like(characters.name, `%${query}%`))
      .orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to search characters:", error);
    return [];
  }
}

export async function getCharactersByClass(characterClass: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characters)
      .where(eq(characters.class, characterClass))
      .orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to get characters by class:", error);
    return [];
  }
}

export async function getCharactersByType(characterType: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characters)
      .where(eq(characters.type, characterType))
      .orderBy(characters.name);
  } catch (error) {
    console.error("[Database] Failed to get characters by type:", error);
    return [];
  }
}

export async function updateCharacter(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update character: database not available");
    return null;
  }
  try {
    await db.update(characters)
      .set({
        ...data,
        last_updated: new Date()
      })
      .where(eq(characters.id, id));
    return await getCharacterById(id);
  } catch (error) {
    console.error("[Database] Failed to update character:", error);
    throw error;
  }
}

export async function deleteCharacter(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete character: database not available");
    return false;
  }
  try {
    // Deletar habilidades, armadura, constelações e ligações associadas
    await db.delete(characterSkills).where(eq(characterSkills.character_id, id));
    await db.delete(characterCloth).where(eq(characterCloth.character_id, id));
    await db.delete(characterConstellations).where(eq(characterConstellations.character_id, id));
    await db.delete(characterLinks).where(eq(characterLinks.character_id, id));
    
    // Deletar o personagem
    await db.delete(characters).where(eq(characters.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete character:", error);
    throw error;
  }
}

export async function upsertCharacter(data: any) {
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

// ============ CHARACTER SKILLS FUNCTIONS ============

export async function createCharacterSkill(data: any) {
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

export async function getCharacterSkills(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characterSkills)
      .where(eq(characterSkills.character_id, characterId));
  } catch (error) {
    console.error("[Database] Failed to get character skills:", error);
    return [];
  }
}

// ============ CHARACTER CLOTH FUNCTIONS ============

export async function createCharacterCloth(data: any) {
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

export async function getCharacterCloth(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characterCloth)
      .where(eq(characterCloth.character_id, characterId))
      .orderBy(characterCloth.level);
  } catch (error) {
    console.error("[Database] Failed to get character cloth:", error);
    return [];
  }
}

// ============ CHARACTER CONSTELLATIONS FUNCTIONS ============

export async function createCharacterConstellation(data: any) {
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

export async function getCharacterConstellations(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characterConstellations)
      .where(eq(characterConstellations.character_id, characterId));
  } catch (error) {
    console.error("[Database] Failed to get character constellations:", error);
    return [];
  }
}

// ============ CHARACTER LINKS FUNCTIONS ============

export async function createCharacterLink(data: any) {
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

export async function getCharacterLinks(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(characterLinks)
      .where(eq(characterLinks.character_id, characterId));
  } catch (error) {
    console.error("[Database] Failed to get character links:", error);
    return [];
  }
}

// ============ CHARACTER EXPORT/IMPORT FUNCTIONS ============

export async function exportCharactersToJson(): Promise<string> {
  const allCharacters = await getAllCharacters();
  
  const charactersWithDetails = await Promise.all(
    allCharacters.map(async (char: any) => ({
      ...char,
      skills: await getCharacterSkills(char.id),
      cloth: await getCharacterCloth(char.id),
      constellations: await getCharacterConstellations(char.id),
      links: await getCharacterLinks(char.id),
    }))
  );
  
  return JSON.stringify(charactersWithDetails, null, 2);
}

export async function importCharactersFromJson(jsonData: string): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot import characters: database not available");
    return 0;
  }
  try {
    const charactersToImport = JSON.parse(jsonData) as any[];
    let importedCount = 0;
    
    for (const charData of charactersToImport) {
      try {
        const { skills, cloth, constellations, links, ...characterData } = charData;
        
        // Upsert personagem
        await upsertCharacter(characterData);
        
        // Inserir habilidades
        if (skills && Array.isArray(skills)) {
          for (const skill of skills) {
            await createCharacterSkill({
              character_id: characterData.id,
              ...skill
            });
          }
        }
        
        // Inserir armadura
        if (cloth && Array.isArray(cloth)) {
          for (const clothData of cloth) {
            await createCharacterCloth({
              character_id: characterData.id,
              ...clothData
            });
          }
        }
        
        // Inserir constelações
        if (constellations && Array.isArray(constellations)) {
          for (const constellation of constellations) {
            await createCharacterConstellation({
              character_id: characterData.id,
              ...constellation
            });
          }
        }
        
        // Inserir ligações
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




// ============ ARAYASHIKI (CARTAS) FUNCTIONS ============
// Nota: Funções simplificadas que retornam dados mockados para análise com IA
// As tabelas foram criadas no banco de dados mas usaremos dados de exemplo

export async function getAllArayashikis() {
  // Retornar lista de exemplo de cartas
  return [
    { id: 1, name: 'Martial Arts of Ice', quality: 'Violet', attribute: 'DEF Boost' },
    { id: 2, name: 'Demon Rose', quality: 'Or', attribute: 'ATK Boost' },
    { id: 3, name: 'Arrow of Justice', quality: 'Violet', attribute: 'CRIT' },
    { id: 4, name: 'Life Shield', quality: 'Bleu', attribute: 'HP Boost' },
    { id: 5, name: 'Tide Turner', quality: 'Or', attribute: 'DODGE' },
  ];
}

export async function searchArayashikis(query: string) {
  const allCards = await getAllArayashikis();
  return allCards.filter(card => 
    card.name.toLowerCase().includes(query.toLowerCase()) ||
    card.attribute.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getArayashikisByAttribute(attribute: string) {
  const allCards = await getAllArayashikis();
  return allCards.filter(card => card.attribute === attribute);
}

export async function getArayashikisByQuality(quality: string) {
  const allCards = await getAllArayashikis();
  return allCards.filter(card => card.quality === quality);
}

export async function getArayashikiById(id: number) {
  const allCards = await getAllArayashikis();
  return allCards.find(card => card.id === id) || null;
}

export async function getArayashikiByName(name: string) {
  const allCards = await getAllArayashikis();
  return allCards.find(card => card.name === name) || null;
}

export async function createArayashiki(data: any) {
  console.log('[Database] Arayashiki criada (mock):', data.name);
  return { success: true };
}

export async function updateArayashiki(id: number, data: any) {
  console.log('[Database] Arayashiki atualizada (mock):', id);
  return { success: true };
}

export async function deleteArayashiki(id: number) {
  console.log('[Database] Arayashiki deletada (mock):', id);
  return { success: true };
}

export async function getArayashikiSynergies(arayashikiId: number) {
  return [];
}

export async function createArayashikiSynergy(data: any) {
  console.log('[Database] Sinergia criada (mock):', data);
  return { success: true };
}
