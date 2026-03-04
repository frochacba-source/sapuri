import { describe, it, expect, beforeAll } from "vitest";
import { searchGotStrategiesByMultipleNamesInDefense } from "./db";

describe("searchGotStrategiesByMultipleNamesInDefense", () => {
  it("should return strategies with BOTH names when searching for 2 names", async () => {
    // Buscar estratégias que contêm AMBOS "milod" E "mu"
    const results = await searchGotStrategiesByMultipleNamesInDefense(["miloD", "mu"]);
    
    // Verificar que TODAS as estratégias retornadas contêm AMBOS os nomes
    for (const strategy of results) {
      const defenseText = `${strategy.defenseFormation1} ${strategy.defenseFormation2} ${strategy.defenseFormation3}`.toLowerCase();
      const hasMiloD = defenseText.includes("milod");
      const hasMu = defenseText.includes("mu");
      
      // Se a estratégia foi retornada, deve ter AMBOS os nomes
      expect(hasMiloD && hasMu).toBe(true);
    }
  });

  it("should return empty array if names don't exist together", async () => {
    // Buscar combinação que provavelmente não existe
    const results = await searchGotStrategiesByMultipleNamesInDefense(["zzzzzzz", "yyyyyyy"]);
    expect(results.length).toBe(0);
  });

  it("should return all strategies with single name", async () => {
    // Buscar estratégias com um único nome
    const results = await searchGotStrategiesByMultipleNamesInDefense(["mu"]);
    
    // Todas as estratégias retornadas devem conter "mu"
    for (const strategy of results) {
      const defenseText = `${strategy.defenseFormation1} ${strategy.defenseFormation2} ${strategy.defenseFormation3}`.toLowerCase();
      expect(defenseText).toContain("mu");
    }
  });

  it("should NOT return strategies with only one of the two names", async () => {
    // Buscar por "miloD" e "mu"
    const results = await searchGotStrategiesByMultipleNamesInDefense(["miloD", "mu"]);
    
    // Nenhuma estratégia deve ter APENAS "milod" sem "mu"
    for (const strategy of results) {
      const defenseText = `${strategy.defenseFormation1} ${strategy.defenseFormation2} ${strategy.defenseFormation3}`.toLowerCase();
      const hasMiloD = defenseText.includes("milod");
      const hasMu = defenseText.includes("mu");
      
      // Deve ter AMBOS, não apenas um
      expect(hasMiloD && hasMu).toBe(true);
    }
  });
});
