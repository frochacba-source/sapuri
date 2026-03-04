import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("subAdmins", () => {
  describe("list", () => {
    it("allows admin to list sub-admins", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should not throw for admin
      const result = await caller.subAdmins.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("denies non-admin access to list sub-admins", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.subAdmins.list()).rejects.toThrow();
    });
  });

  describe("create validation", () => {
    it("validates required fields for sub-admin creation", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should throw for empty name
      await expect(caller.subAdmins.create({
        name: "",
        username: "testuser",
        password: "1234",
        canManageGvg: true,
        canManageGot: false,
        canManageReliquias: false,
      })).rejects.toThrow();
      
      // Should throw for short password
      await expect(caller.subAdmins.create({
        name: "Test Admin",
        username: "testuser",
        password: "123", // Too short
        canManageGvg: true,
        canManageGot: false,
        canManageReliquias: false,
      })).rejects.toThrow();
    });
  });
});

describe("members", () => {
  describe("listByEvent", () => {
    it("returns members filtered by event participation", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should return array for valid event name
      const gvgMembers = await caller.members.listByEvent({ eventName: "gvg" });
      expect(Array.isArray(gvgMembers)).toBe(true);
      
      const gotMembers = await caller.members.listByEvent({ eventName: "got" });
      expect(Array.isArray(gotMembers)).toBe(true);
      
      const reliquiasMembers = await caller.members.listByEvent({ eventName: "reliquias" });
      expect(Array.isArray(reliquiasMembers)).toBe(true);
    });
  });

  describe("create validation", () => {
    it("validates member creation input", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should throw for empty name
      await expect(caller.members.create({
        name: "",
        participatesGvg: true,
        participatesGot: true,
        participatesReliquias: true,
      })).rejects.toThrow();
    });
  });
});

describe("eventTypes", () => {
  it("lists all event types", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const eventTypes = await caller.eventTypes.list();
    expect(Array.isArray(eventTypes)).toBe(true);
  });
});

describe("announcements", () => {
  describe("create validation", () => {
    it("validates announcement creation input", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should throw for empty title
      await expect(caller.announcements.create({
        eventTypeId: 1,
        title: "",
        message: "Test message",
        memberIds: [1],
        sendNow: true,
      })).rejects.toThrow();
      
      // Should throw for empty message
      await expect(caller.announcements.create({
        eventTypeId: 1,
        title: "Test Title",
        message: "",
        memberIds: [1],
        sendNow: true,
      })).rejects.toThrow();
      
      // Note: Empty memberIds is allowed by the router but should be validated in UI
    });
  });
});
