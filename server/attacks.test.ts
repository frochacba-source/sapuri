import { describe, expect, it } from "vitest";
import { z } from "zod";

// Test schemas for GvG attacks
const gvgAttackSchema = z.object({
  memberId: z.number().positive(),
  attack1Stars: z.number().min(0).max(3),
  attack2Stars: z.number().min(0).max(3),
  attack1Opponent: z.string().optional(),
  attack2Opponent: z.string().optional(),
  didNotAttack: z.boolean().default(false),
});

// Test schemas for GoT attacks
const gotAttackSchema = z.object({
  memberId: z.number().positive(),
  ranking: z.number().min(1).optional(),
  power: z.string().optional(),
  attackVictories: z.number().min(0).default(0),
  attackDefeats: z.number().min(0).default(0),
  defenseVictories: z.number().min(0).default(0),
  defenseDefeats: z.number().min(0).default(0),
  points: z.number().min(0).default(0),
  didNotAttack: z.boolean().default(false),
});

describe("GvG Attacks Schema", () => {
  it("validates valid GvG attack data", () => {
    const validAttack = {
      memberId: 1,
      attack1Stars: 3,
      attack2Stars: 2,
      attack1Opponent: "Poseidon",
      attack2Opponent: "Tatsuy",
      didNotAttack: false,
    };

    const result = gvgAttackSchema.safeParse(validAttack);
    expect(result.success).toBe(true);
  });

  it("rejects stars greater than 3", () => {
    const invalidAttack = {
      memberId: 1,
      attack1Stars: 4,
      attack2Stars: 2,
    };

    const result = gvgAttackSchema.safeParse(invalidAttack);
    expect(result.success).toBe(false);
  });

  it("rejects negative stars", () => {
    const invalidAttack = {
      memberId: 1,
      attack1Stars: -1,
      attack2Stars: 2,
    };

    const result = gvgAttackSchema.safeParse(invalidAttack);
    expect(result.success).toBe(false);
  });

  it("calculates total stars correctly", () => {
    const attack = {
      memberId: 1,
      attack1Stars: 3,
      attack2Stars: 2,
    };

    const result = gvgAttackSchema.safeParse(attack);
    expect(result.success).toBe(true);
    if (result.success) {
      const totalStars = result.data.attack1Stars + result.data.attack2Stars;
      expect(totalStars).toBe(5);
      expect(totalStars).toBeLessThanOrEqual(6); // Max possible
    }
  });

  it("identifies non-attackers correctly", () => {
    const nonAttacker = {
      memberId: 1,
      attack1Stars: 0,
      attack2Stars: 0,
      didNotAttack: true,
    };

    const result = gvgAttackSchema.safeParse(nonAttacker);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.didNotAttack).toBe(true);
    }
  });
});

describe("GoT Attacks Schema", () => {
  it("validates valid GoT attack data", () => {
    const validAttack = {
      memberId: 1,
      ranking: 1,
      power: "920M",
      attackVictories: 7,
      attackDefeats: 1,
      defenseVictories: 1,
      defenseDefeats: 0,
      points: 110,
      didNotAttack: false,
    };

    const result = gotAttackSchema.safeParse(validAttack);
    expect(result.success).toBe(true);
  });

  it("rejects negative victories", () => {
    const invalidAttack = {
      memberId: 1,
      attackVictories: -1,
      attackDefeats: 0,
      defenseVictories: 0,
      defenseDefeats: 0,
      points: 0,
    };

    const result = gotAttackSchema.safeParse(invalidAttack);
    expect(result.success).toBe(false);
  });

  it("rejects negative points", () => {
    const invalidAttack = {
      memberId: 1,
      attackVictories: 0,
      attackDefeats: 0,
      defenseVictories: 0,
      defenseDefeats: 0,
      points: -10,
    };

    const result = gotAttackSchema.safeParse(invalidAttack);
    expect(result.success).toBe(false);
  });

  it("identifies non-attackers correctly", () => {
    const nonAttacker = {
      memberId: 1,
      attackVictories: 0,
      attackDefeats: 0,
      defenseVictories: 0,
      defenseDefeats: 0,
      points: 0,
      didNotAttack: true,
    };

    const result = gotAttackSchema.safeParse(nonAttacker);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.didNotAttack).toBe(true);
      expect(result.data.attackVictories).toBe(0);
    }
  });

  it("calculates total victories correctly", () => {
    const attack = {
      memberId: 1,
      attackVictories: 5,
      attackDefeats: 1,
      defenseVictories: 4,
      defenseDefeats: 2,
      points: 95,
    };

    const result = gotAttackSchema.safeParse(attack);
    expect(result.success).toBe(true);
    if (result.success) {
      const totalVictories = result.data.attackVictories + result.data.defenseVictories;
      expect(totalVictories).toBe(9);
    }
  });
});

describe("Non-Attacker Detection", () => {
  it("detects GvG non-attackers (0 stars both attacks)", () => {
    const attacks = [
      { memberId: 1, attack1Stars: 3, attack2Stars: 2, didNotAttack: false },
      { memberId: 2, attack1Stars: 0, attack2Stars: 0, didNotAttack: true },
      { memberId: 3, attack1Stars: 1, attack2Stars: 0, didNotAttack: false },
    ];

    const nonAttackers = attacks.filter(a => a.didNotAttack || (a.attack1Stars === 0 && a.attack2Stars === 0));
    expect(nonAttackers.length).toBe(1);
    expect(nonAttackers[0].memberId).toBe(2);
  });

  it("detects GoT non-attackers (0 attack victories)", () => {
    const attacks = [
      { memberId: 1, attackVictories: 7, points: 110, didNotAttack: false },
      { memberId: 2, attackVictories: 0, points: 0, didNotAttack: true },
      { memberId: 3, attackVictories: 5, points: 95, didNotAttack: false },
    ];

    const nonAttackers = attacks.filter(a => a.didNotAttack || a.attackVictories === 0);
    expect(nonAttackers.length).toBe(1);
    expect(nonAttackers[0].memberId).toBe(2);
  });
});

describe("Announcement Schema", () => {
  const announcementSchema = z.object({
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(2000),
    isGeneral: z.boolean().default(false),
    sendNow: z.boolean().default(true),
  });

  it("validates general announcement", () => {
    const announcement = {
      title: "Atenção membros!",
      message: "Lembrem-se de atacar na GvG hoje às 13:00",
      isGeneral: true,
      sendNow: true,
    };

    const result = announcementSchema.safeParse(announcement);
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const announcement = {
      title: "",
      message: "Mensagem válida",
      isGeneral: true,
    };

    const result = announcementSchema.safeParse(announcement);
    expect(result.success).toBe(false);
  });

  it("rejects title too long", () => {
    const announcement = {
      title: "a".repeat(201),
      message: "Mensagem válida",
      isGeneral: true,
    };

    const result = announcementSchema.safeParse(announcement);
    expect(result.success).toBe(false);
  });
});
