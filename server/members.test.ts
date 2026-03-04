import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getAllMembers: vi.fn().mockResolvedValue([
    { id: 1, name: "Player1", telegramId: "123", telegramUsername: "player1", isActive: true },
    { id: 2, name: "Player2", telegramId: "456", telegramUsername: "player2", isActive: true },
  ]),
  getActiveMembers: vi.fn().mockResolvedValue([
    { id: 1, name: "Player1", telegramId: "123", telegramUsername: "player1", isActive: true },
  ]),
  getMemberById: vi.fn().mockResolvedValue({ id: 1, name: "Player1", isActive: true }),
  createMember: vi.fn().mockResolvedValue(undefined),
  updateMember: vi.fn().mockResolvedValue(undefined),
  deleteMember: vi.fn().mockResolvedValue(undefined),
  getMemberCount: vi.fn().mockResolvedValue(5),
  getAllEventTypes: vi.fn().mockResolvedValue([
    { id: 1, name: "gvg", displayName: "GvG", maxPlayers: 20, eventTime: "13:00", reminderMinutes: 30, isActive: true },
  ]),
  getEventTypeById: vi.fn().mockResolvedValue({ id: 1, name: "gvg", displayName: "GvG", maxPlayers: 20 }),
  seedDefaultEventTypes: vi.fn().mockResolvedValue(undefined),
  getScheduleByEventAndDate: vi.fn().mockResolvedValue(null),
  createSchedule: vi.fn().mockResolvedValue(1),
  removeScheduleEntries: vi.fn().mockResolvedValue(undefined),
  addScheduleEntry: vi.fn().mockResolvedValue(undefined),
  getEntriesBySchedule: vi.fn().mockResolvedValue([]),
  getScheduleHistory: vi.fn().mockResolvedValue([]),
  getMemberStats: vi.fn().mockResolvedValue([]),
  getBotConfig: vi.fn().mockResolvedValue(null),
  upsertBotConfig: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("members router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists all members for authenticated user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.members.list();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Player1");
  });

  it("lists active members for authenticated user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.members.listActive();

    expect(result).toHaveLength(1);
    expect(result[0].isActive).toBe(true);
  });

  it("allows admin to create member", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.members.create({
      name: "New Player",
      telegramUsername: "newplayer",
    });

    expect(result.success).toBe(true);
  });

  it("prevents non-admin from creating member", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.members.create({ name: "New Player" })
    ).rejects.toThrow("Apenas administradores podem realizar esta ação");
  });

  it("allows admin to update member", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.members.update({
      id: 1,
      name: "Updated Name",
    });

    expect(result.success).toBe(true);
  });

  it("allows admin to delete member", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.members.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  it("returns member count", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.members.count();

    expect(result).toBe(5);
  });
});

describe("eventTypes router", () => {
  it("lists event types for authenticated user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.eventTypes.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("gvg");
  });
});

describe("schedules router", () => {
  it("allows admin to save schedule", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.schedules.save({
      eventTypeId: 1,
      eventDate: "2024-12-28",
      memberIds: [1, 2],
    });

    expect(result.success).toBe(true);
    expect(result.scheduleId).toBe(1);
  });

  it("prevents non-admin from saving schedule", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.schedules.save({
        eventTypeId: 1,
        eventDate: "2024-12-28",
        memberIds: [1, 2],
      })
    ).rejects.toThrow("Acesso restrito a administradores");
  });
});

describe("stats router", () => {
  it("returns member participation stats", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stats.memberParticipation({});

    expect(Array.isArray(result)).toBe(true);
  });
});
