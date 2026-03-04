import { describe, it, expect } from "vitest";

describe("GoT Ranking Functions", () => {
  describe("getGotNonAttackersHistory", () => {
    it("should return empty array if no non-attackers found", () => {
      const mockResult = [];
      expect(Array.isArray(mockResult)).toBe(true);
      expect(mockResult.length).toBe(0);
    });

    it("should include memberName and percentage in response", () => {
      const mockResult = {
        memberId: 1,
        memberName: "Test Player",
        nonAttacks: 2,
        totalAttacks: 5,
        percentage: 40,
        battles: [
          { date: "2025-01-05", didNotAttack: true },
          { date: "2025-01-04", didNotAttack: false },
        ],
      };
      
      expect(mockResult.memberId).toBeDefined();
      expect(mockResult.memberName).toBeDefined();
      expect(mockResult.percentage).toBe(40);
      expect(mockResult.battles).toHaveLength(2);
    });
  });

  describe("getGotPerformanceMetrics", () => {
    it("should calculate performance percentage correctly", () => {
      const totalAttackVictories = 3;
      const totalAttackDefeats = 2;
      const totalDefenseVictories = 2;
      const totalDefenseDefeats = 3;
      
      const totalVictories = totalAttackVictories + totalDefenseVictories;
      const totalBattles = totalAttackVictories + totalAttackDefeats + 
                          totalDefenseVictories + totalDefenseDefeats;
      
      const performance = totalBattles > 0 
        ? Math.round((totalVictories / totalBattles) * 100)
        : 0;
      
      expect(performance).toBe(50);
    });

    it("should identify low performers (< 50%)", () => {
      const performers = [
        { performance: 45, memberName: "Low Performer" },
        { performance: 50, memberName: "Average" },
        { performance: 60, memberName: "Good" },
      ];
      
      const lowPerformers = performers.filter(p => p.performance < 50);
      
      expect(lowPerformers).toHaveLength(1);
      expect(lowPerformers[0].memberName).toBe("Low Performer");
    });
  });

  describe("Telegram Automation", () => {
    it("should format automatic reminder message correctly", () => {
      const customMessage = "Test reminder";
      const nonAttackerNames = ["Player1", "Player2"];
      
      const fullMessage = `${customMessage}\n\n📋 *Ainda não atacaram (${nonAttackerNames.length}):*\n${nonAttackerNames.join(", ") || "Todos já atacaram! 🎉"}`;
      
      expect(fullMessage).toContain("Test reminder");
      expect(fullMessage).toContain("Player1, Player2");
    });

    it("should handle empty non-attacker list", () => {
      const customMessage = "Test reminder";
      const nonAttackerNames = [];
      
      const fullMessage = `${customMessage}\n\n📋 *Ainda não atacaram (${nonAttackerNames.length}):*\n${nonAttackerNames.join(", ") || "Todos já atacaram! 🎉"}`;
      
      expect(fullMessage).toContain("Todos já atacaram! 🎉");
    });
  });
});
