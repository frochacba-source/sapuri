import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  handleAttackCommand, 
  handleDefenseCommand,
  sendGotAttackStrategies,
  sendGotDefenseStrategies,
  handleTipDefenseCommand,
  sendGotDefenseTips,
  handleGvgAttackCommandNew,
  handleGvgDefenseCommandNew,
  handleGvgDicaCommand
} from "./gotBotIntegration";
import * as db from "./db";
import * as telegram from "./telegram";

// Mock dos módulos
vi.mock("./db");
vi.mock("./telegram");

describe("GoT Bot Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleAttackCommand", () => {
    it("deve rejeitar comando sem parâmetros", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      
      await handleAttackCommand("123", "");
      
      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("até 3 cavaleiros")
      );
    });

    it("deve aceitar até 3 nomes", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "Estratégia 1",
          attackFormation1: "Kanon",
          attackFormation2: "Aikos",
          attackFormation3: "Hyoga",
          defenseFormation1: "Ikki",
          defenseFormation2: "Taça",
          defenseFormation3: "ShunD",
        }
      ];

      vi.spyOn(db, "getGotStrategiesByAttackFormation").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleAttackCommand("123", "Kanon Aikos Hyoga");

      expect(db.getGotStrategiesByAttackFormation).toHaveBeenCalledTimes(3);
      expect(db.getGotStrategiesByAttackFormation).toHaveBeenCalledWith("Kanon");
      expect(db.getGotStrategiesByAttackFormation).toHaveBeenCalledWith("Aikos");
      expect(db.getGotStrategiesByAttackFormation).toHaveBeenCalledWith("Hyoga");
    });

    it("deve limitar a 3 nomes mesmo se receber mais", async () => {
      const mockStrategies = [];
      vi.spyOn(db, "getGotStrategiesByAttackFormation").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleAttackCommand("123", "Kanon Aikos Hyoga Mu Shijima");

      // Deve chamar apenas 3 vezes (Kanon, Aikos, Hyoga)
      expect(db.getGotStrategiesByAttackFormation).toHaveBeenCalledTimes(3);
    });

    it("deve remover estratégias duplicadas", async () => {
      const mockStrategy = {
        id: 1,
        name: "Estratégia 1",
        attackFormation1: "Kanon",
        attackFormation2: "Aikos",
        attackFormation3: "Hyoga",
        defenseFormation1: "Ikki",
        defenseFormation2: "Taça",
        defenseFormation3: "ShunD",
      };

      // Retorna a mesma estratégia para todos os nomes
      vi.spyOn(db, "getGotStrategiesByAttackFormation").mockResolvedValue([mockStrategy]);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleAttackCommand("123", "Kanon Aikos");

      // Deve ser chamado 2 vezes
      expect(db.getGotStrategiesByAttackFormation).toHaveBeenCalledTimes(2);
    });
  });

  describe("handleDefenseCommand", () => {
    it("deve rejeitar comando sem parâmetros", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      
      await handleDefenseCommand("123", "");
      
      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("até 3 cavaleiros")
      );
    });

    it("deve aceitar até 3 nomes", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "Estratégia 1",
          attackFormation1: "Kanon",
          attackFormation2: "Aikos",
          attackFormation3: "Hyoga",
          defenseFormation1: "Ikki",
          defenseFormation2: "Taça",
          defenseFormation3: "ShunD",
        }
      ];

      vi.spyOn(db, "getGotStrategiesByDefenseFormation").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleDefenseCommand("123", "Ikki Taça ShunD");

      expect(db.getGotStrategiesByDefenseFormation).toHaveBeenCalledTimes(3);
      expect(db.getGotStrategiesByDefenseFormation).toHaveBeenCalledWith("Ikki");
      expect(db.getGotStrategiesByDefenseFormation).toHaveBeenCalledWith("Taça");
      expect(db.getGotStrategiesByDefenseFormation).toHaveBeenCalledWith("ShunD");
    });
  });

  describe("sendGotAttackStrategies", () => {
    it("deve enviar mensagem com formato correto", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "Estratégia 1",
          attackFormation1: "Kanon",
          attackFormation2: "Aikos",
          attackFormation3: "Hyoga",
          defenseFormation1: "Ikki",
          defenseFormation2: "Taça",
          defenseFormation3: "ShunD",
        }
      ];

      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await sendGotAttackStrategies("123", "Kanon", mockStrategies);

      expect(sendDirectMock).toHaveBeenCalled();
      const message = sendDirectMock.mock.calls[0][2];
      
      expect(message).toContain("🤖 Estratégias de Ataque - Kanon");
      expect(message).toContain("Ataque⚔️ x 🛡️Defesa");
      expect(message).toContain("Kanon x Ikki");
    });

    it("deve mostrar mensagem de mais estratégias quando houver mais de 5", async () => {
      const mockStrategies = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        name: `Estratégia ${i}`,
        attackFormation1: "Kanon",
        attackFormation2: "Aikos",
        attackFormation3: "Hyoga",
        defenseFormation1: "Ikki",
        defenseFormation2: "Taça",
        defenseFormation3: "ShunD",
      }));

      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await sendGotAttackStrategies("123", "Kanon", mockStrategies);

      const message = sendDirectMock.mock.calls[0][2];
      expect(message).toContain("... e mais 3 estratégias disponíveis.");
    });

    it("deve retornar false se não houver estratégias", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await sendGotAttackStrategies("123", "Kanon", []);

      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("Nenhuma estratégia")
      );
    });
  });

  describe("sendGotDefenseStrategies", () => {
    it("deve enviar mensagem com formato correto", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "Estratégia 1",
          attackFormation1: "Kanon",
          attackFormation2: "Aikos",
          attackFormation3: "Hyoga",
          defenseFormation1: "Ikki",
          defenseFormation2: "Taça",
          defenseFormation3: "ShunD",
        }
      ];

      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await sendGotDefenseStrategies("123", "Ikki", mockStrategies);

      expect(sendDirectMock).toHaveBeenCalled();
      const message = sendDirectMock.mock.calls[0][2];
      
      expect(message).toContain("🤖 Estratégias de Defesa - Ikki");
      expect(message).toContain("Ataque⚔️ x 🛡️Defesa");
      expect(message).toContain("Kanon x Ikki");
    });

    it("deve mostrar mensagem de mais estratégias quando houver mais de 5", async () => {
      const mockStrategies = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Estratégia ${i}`,
        attackFormation1: "Kanon",
        attackFormation2: "Aikos",
        attackFormation3: "Hyoga",
        defenseFormation1: "Ikki",
        defenseFormation2: "Taça",
        defenseFormation3: "ShunD",
      }));

      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await sendGotDefenseStrategies("123", "Ikki", mockStrategies);

      const message = sendDirectMock.mock.calls[0][2];
      expect(message).toContain("... e mais 5 estratégias disponíveis.");
    });
  });

  describe("handleTipDefenseCommand", () => {
    it("deve rejeitar comando sem parâmetros", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      
      await handleTipDefenseCommand("123", "");
      
      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("até 3 cavaleiros")
      );
    });

    it("deve aceitar até 3 nomes", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "Estratégia 1",
          attackFormation1: "Kanon",
          attackFormation2: "Aikos",
          attackFormation3: "Hyoga",
          defenseFormation1: "Ikki",
          defenseFormation2: "Taça",
          defenseFormation3: "ShunD",
        }
      ];

      vi.spyOn(db, "getGotStrategiesByDefenseFormation").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleTipDefenseCommand("123", "Ikki Taça ShunD");

      expect(db.getGotStrategiesByDefenseFormation).toHaveBeenCalledTimes(3);
    });

    it("deve limitar a 3 nomes mesmo se receber mais", async () => {
      const mockStrategies = [];
      vi.spyOn(db, "getGotStrategiesByDefenseFormation").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleTipDefenseCommand("123", "Ikki Taça ShunD Kanon Aikos");

      // Deve chamar apenas 3 vezes
      expect(db.getGotStrategiesByDefenseFormation).toHaveBeenCalledTimes(3);
    });
  });

  describe("sendGotDefenseTips", () => {
    it("deve enviar APENAS defesa sem ataque", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "Estratégia 1",
          attackFormation1: "Kanon",
          attackFormation2: "Aikos",
          attackFormation3: "Hyoga",
          defenseFormation1: "Ikki",
          defenseFormation2: "Taça",
          defenseFormation3: "ShunD",
        }
      ];

      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await sendGotDefenseTips("123", "Ikki", mockStrategies);

      expect(sendDirectMock).toHaveBeenCalled();
      const message = sendDirectMock.mock.calls[0][2];
      
      expect(message).toContain("🛡️ Defesa");
      expect(message).toContain("Ikki");
      // Não deve conter ataque
      expect(message).not.toContain("Ataque⚔️");
    });
  });

  describe("handleGvgAttackCommandNew", () => {
    it("deve rejeitar comando sem parâmetros", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      
      await handleGvgAttackCommandNew("123", "");
      
      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("até 5 cavaleiros")
      );
    });

    it("deve aceitar até 5 nomes", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "GVG Estratégia 1",
          attackFormation1: "Seiya",
          attackFormation2: "Shiryu",
          attackFormation3: "Hyoga",
          attackFormation4: "Shun",
          attackFormation5: "Ikki",
          defenseFormation1: "Kanon",
          defenseFormation2: "Aikos",
          defenseFormation3: "Mu",
          defenseFormation4: "Camus",
          defenseFormation5: "Milo",
        }
      ];

      vi.spyOn(db, "searchGvgStrategiesByMultipleNamesInAttack").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleGvgAttackCommandNew("123", "Seiya Shiryu Hyoga Shun Ikki");

      expect(db.searchGvgStrategiesByMultipleNamesInAttack).toHaveBeenCalledWith(
        ["Seiya", "Shiryu", "Hyoga", "Shun", "Ikki"]
      );
    });

    it("deve limitar a 5 nomes mesmo se receber mais", async () => {
      const mockStrategies = [];
      vi.spyOn(db, "searchGvgStrategiesByMultipleNamesInAttack").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleGvgAttackCommandNew("123", "Seiya Shiryu Hyoga Shun Ikki Kanon Aikos");

      expect(db.searchGvgStrategiesByMultipleNamesInAttack).toHaveBeenCalledWith(
        ["Seiya", "Shiryu", "Hyoga", "Shun", "Ikki"]
      );
    });
  });

  describe("handleGvgDefenseCommandNew", () => {
    it("deve rejeitar comando sem parâmetros", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      
      await handleGvgDefenseCommandNew("123", "");
      
      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("até 5 cavaleiros")
      );
    });

    it("deve aceitar até 5 nomes", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "GVG Estratégia 1",
          attackFormation1: "Seiya",
          attackFormation2: "Shiryu",
          attackFormation3: "Hyoga",
          attackFormation4: "Shun",
          attackFormation5: "Ikki",
          defenseFormation1: "Kanon",
          defenseFormation2: "Aikos",
          defenseFormation3: "Mu",
          defenseFormation4: "Camus",
          defenseFormation5: "Milo",
        }
      ];

      vi.spyOn(db, "searchGvgStrategiesByMultipleNamesInDefense").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleGvgDefenseCommandNew("123", "Kanon Aikos Mu Camus Milo");

      expect(db.searchGvgStrategiesByMultipleNamesInDefense).toHaveBeenCalledWith(
        ["Kanon", "Aikos", "Mu", "Camus", "Milo"]
      );
    });

    it("deve limitar a 5 nomes mesmo se receber mais", async () => {
      const mockStrategies = [];
      vi.spyOn(db, "searchGvgStrategiesByMultipleNamesInDefense").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleGvgDefenseCommandNew("123", "Kanon Aikos Mu Camus Milo Shijima Deathmask");

      expect(db.searchGvgStrategiesByMultipleNamesInDefense).toHaveBeenCalledWith(
        ["Kanon", "Aikos", "Mu", "Camus", "Milo"]
      );
    });
  });

  describe("handleGvgDicaCommand", () => {
    it("deve rejeitar comando sem parâmetros", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      
      await handleGvgDicaCommand("123", "");
      
      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("até 5 cavaleiros")
      );
    });

    it("deve aceitar até 5 nomes", async () => {
      const mockStrategies = [
        {
          id: 1,
          name: "GVG Dica 1",
          attackFormation1: "Seiya",
          attackFormation2: "Shiryu",
          attackFormation3: "Hyoga",
          attackFormation4: "Shun",
          attackFormation5: "Ikki",
          defenseFormation1: "Kanon",
          defenseFormation2: "Aikos",
          defenseFormation3: "Mu",
          defenseFormation4: "Camus",
          defenseFormation5: "Milo",
          observation: "Cuidado com o Kanon no centro"
        }
      ];

      vi.spyOn(db, "searchGvgDefenseTips").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleGvgDicaCommand("123", "Kanon Aikos Mu Camus Milo");

      expect(db.searchGvgDefenseTips).toHaveBeenCalledWith(
        ["Kanon", "Aikos", "Mu", "Camus", "Milo"]
      );
    });

    it("deve limitar a 5 nomes mesmo se receber mais", async () => {
      const mockStrategies = [];
      vi.spyOn(db, "searchGvgDefenseTips").mockResolvedValue(mockStrategies);
      vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);

      await handleGvgDicaCommand("123", "Kanon Aikos Mu Camus Milo Shijima Deathmask");

      expect(db.searchGvgDefenseTips).toHaveBeenCalledWith(
        ["Kanon", "Aikos", "Mu", "Camus", "Milo"]
      );
    });

    it("deve retornar false se não houver dicas", async () => {
      const sendDirectMock = vi.spyOn(telegram, "sendTelegramMessageDirect").mockResolvedValue(true);
      vi.spyOn(db, "searchGvgDefenseTips").mockResolvedValue([]);

      await handleGvgDicaCommand("123", "Kanon Aikos");

      expect(sendDirectMock).toHaveBeenCalledWith(
        expect.any(String),
        "123",
        expect.stringContaining("Nenhuma dica")
      );
    });
  });
});
