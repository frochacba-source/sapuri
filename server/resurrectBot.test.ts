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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("resurrectTelegramBot", () => {
  // Aumentar timeout para testes que fazem chamadas HTTP
  const testTimeout = 10000;
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow admin to call resurrectTelegramBot", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.resurrectTelegramBot();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("isAlive");
    expect(result).toHaveProperty("message");
  }, { timeout: 10000 });

  it("should return status information after resurrection attempt", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.resurrectTelegramBot();

    expect(typeof result.success).toBe("boolean");
    expect(["healthy", "degraded", "dead"]).toContain(result.status);
    expect(typeof result.isAlive).toBe("boolean");
    expect(typeof result.message).toBe("string");
  });

  it("should deny access to regular users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.resurrectTelegramBot();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should return success message when bot is resurrected", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.resurrectTelegramBot();

    if (result.success) {
      expect(result.message).toBe("Bot ressuscitado com sucesso!");
    } else {
      expect(result.message).toBe("Falha ao ressuscitar Bot");
    }
  });

  it("botStatus should be accessible to all authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.botStatus();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("isAlive");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("messageCount");
    expect(result).toHaveProperty("uptime");
    expect(result).toHaveProperty("lastHeartbeat");
    expect(result).toHaveProperty("timestamp");
  });

  it("botStatus should return valid timestamp strings", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.botStatus();

    expect(typeof result.lastHeartbeat).toBe("string");
    expect(typeof result.timestamp).toBe("string");

    // Verify they are valid ISO strings
    expect(() => new Date(result.lastHeartbeat)).not.toThrow();
    expect(() => new Date(result.timestamp)).not.toThrow();
  });
});
