import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as db from './db';
import { Card, InsertCard } from '../drizzle/schema';

describe('Card Database Functions', () => {
  let testCardId: number | null = null;
  const testCardData: InsertCard = {
    name: 'Test Card - Poder Supremo',
    imageUrl: 'https://example.com/test-card.jpg',
    referenceLink: 'https://example.com/reference',
    usageLimit: 'Todos',
    bonusDmg: '10',
    bonusDef: '5',
    bonusVid: '0',
    bonusPress: '0',
    bonusEsquiva: '0',
    bonusVelAtaq: '0',
    bonusTenacidade: '0',
    bonusSanguessuga: '0',
    bonusRedDano: '0',
    bonusCrit: '0',
    skillEffect: 'Aumenta o dano em 10%',
    createdBy: 1,
  };

  describe('createCard', () => {
    it('should create a new card', async () => {
      const card = await db.createCard(testCardData);
      
      expect(card).toBeDefined();
      expect(card?.name).toBe(testCardData.name);
      expect(card?.bonusDmg).toBe('10');
      expect(card?.skillEffect).toBe('Aumenta o dano em 10%');
      
      if (card) {
        testCardId = card.id;
      }
    });

    it('should create a card with minimal data', async () => {
      const minimalCard: InsertCard = {
        name: 'Minimal Card',
        usageLimit: 'Leão',
        createdBy: 1,
      };
      
      const card = await db.createCard(minimalCard);
      
      expect(card).toBeDefined();
      expect(card?.name).toBe('Minimal Card');
      expect(card?.usageLimit).toBe('Leão');
    });
  });

  describe('getAllCards', () => {
    it('should return all cards', async () => {
      const cards = await db.getAllCards();
      
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should return cards sorted by name', async () => {
      const cards = await db.getAllCards();
      
      if (cards.length > 1) {
        for (let i = 0; i < cards.length - 1; i++) {
          expect(cards[i].name.localeCompare(cards[i + 1].name)).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('getCardById', () => {
    it('should get a card by ID', async () => {
      if (!testCardId) {
        expect(testCardId).toBeDefined();
        return;
      }
      
      const card = await db.getCardById(testCardId);
      
      expect(card).toBeDefined();
      expect(card?.id).toBe(testCardId);
      expect(card?.name).toBe(testCardData.name);
    });

    it('should return null for non-existent card', async () => {
      const card = await db.getCardById(999999);
      
      expect(card).toBeNull();
    });
  });

  describe('searchCards', () => {
    it('should search cards by name', async () => {
      const results = await db.searchCards('Test Card');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.name.includes('Test Card'))).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await db.searchCards('NonExistentCard12345');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should be case-insensitive', async () => {
      const resultsLower = await db.searchCards('test');
      const resultsUpper = await db.searchCards('TEST');
      
      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
    });
  });

  describe('updateCard', () => {
    it('should update a card', async () => {
      if (!testCardId) {
        expect(testCardId).toBeDefined();
        return;
      }
      
      const updatedData = {
        bonusDmg: '15',
        skillEffect: 'Aumenta o dano em 15%',
      };
      
      const card = await db.updateCard(testCardId, updatedData);
      
      expect(card).toBeDefined();
      expect(card?.bonusDmg).toBe('15');
      expect(card?.skillEffect).toBe('Aumenta o dano em 15%');
    });

    it('should partially update a card', async () => {
      if (!testCardId) {
        expect(testCardId).toBeDefined();
        return;
      }
      
      const card = await db.updateCard(testCardId, { bonusDef: '20' });
      
      expect(card?.bonusDef).toBe('20');
      // Original values should remain
      expect(card?.bonusDmg).toBe('15');
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      // Create a card to delete
      const cardToDelete = await db.createCard({
        name: 'Card to Delete',
        usageLimit: 'Todos',
        createdBy: 1,
      });
      
      if (!cardToDelete?.id) {
        expect(cardToDelete?.id).toBeDefined();
        return;
      }
      
      const success = await db.deleteCard(cardToDelete.id);
      
      expect(success).toBe(true);
      
      // Verify it's deleted
      const deletedCard = await db.getCardById(cardToDelete.id);
      expect(deletedCard).toBeNull();
    });
  });

  describe('exportCardsAsJson', () => {
    it('should export cards as JSON string', async () => {
      const jsonData = await db.exportCardsAsJson();
      
      expect(typeof jsonData).toBe('string');
      
      const parsed = JSON.parse(jsonData);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should export valid JSON', async () => {
      const jsonData = await db.exportCardsAsJson();
      
      expect(() => JSON.parse(jsonData)).not.toThrow();
    });
  });

  describe('importCardsFromJson', () => {
    it('should import cards from JSON', async () => {
      const cardsToImport = [
        {
          name: 'Imported Card 1',
          usageLimit: 'Todos',
          bonusDmg: '5',
          bonusDef: '5',
          bonusVid: '0',
          bonusPress: '0',
          bonusEsquiva: '0',
          bonusVelAtaq: '0',
          bonusTenacidade: '0',
          bonusSanguessuga: '0',
          bonusRedDano: '0',
          bonusCrit: '0',
        },
        {
          name: 'Imported Card 2',
          usageLimit: 'Leão|Fênix',
          bonusDmg: '10',
          bonusDef: '0',
          bonusVid: '0',
          bonusPress: '0',
          bonusEsquiva: '0',
          bonusVelAtaq: '0',
          bonusTenacidade: '0',
          bonusSanguessuga: '0',
          bonusRedDano: '0',
          bonusCrit: '0',
        },
      ];
      
      const jsonData = JSON.stringify(cardsToImport);
      const importedCount = await db.importCardsFromJson(jsonData, 1);
      
      expect(importedCount).toBeGreaterThan(0);
      
      // Verify imported cards exist
      const imported1 = await db.searchCards('Imported Card 1');
      expect(imported1.length).toBeGreaterThan(0);
    });

    it('should handle invalid JSON gracefully', async () => {
      const invalidJson = 'not valid json';
      
      expect(async () => {
        await db.importCardsFromJson(invalidJson, 1);
      }).rejects.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle cards with special characters in name', async () => {
      const specialCard: InsertCard = {
        name: 'Card with Special Chars: @#$%^&*()',
        usageLimit: 'Todos',
        createdBy: 1,
      };
      
      const card = await db.createCard(specialCard);
      
      expect(card?.name).toBe(specialCard.name);
    });

    it('should handle very long description', async () => {
      const longDescription = 'A'.repeat(500);
      const cardWithLongDesc: InsertCard = {
        name: 'Card with Long Description',
        usageLimit: 'Todos',
        skillEffect: longDescription,
        createdBy: 1,
      };
      
      const card = await db.createCard(cardWithLongDesc);
      
      expect(card?.skillEffect).toBe(longDescription);
    });

    it('should handle empty bonus values', async () => {
      const cardWithEmptyBonuses: InsertCard = {
        name: 'Card with Empty Bonuses',
        usageLimit: 'Todos',
        bonusDmg: '0',
        bonusDef: '0',
        bonusVid: '0',
        bonusPress: '0',
        bonusEsquiva: '0',
        bonusVelAtaq: '0',
        bonusTenacidade: '0',
        bonusSanguessuga: '0',
        bonusRedDano: '0',
        bonusCrit: '0',
        createdBy: 1,
      };
      
      const card = await db.createCard(cardWithEmptyBonuses);
      
      expect(card).toBeDefined();
      expect(card?.bonusDmg).toBe('0');
    });
  });
});
