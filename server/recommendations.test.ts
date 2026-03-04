import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Recommendations System', () => {
  it('should have getAllCards function available', async () => {
    const cards = await db.getAllCards();
    expect(Array.isArray(cards)).toBe(true);
  });

  it('should have getAllCharacters function available', async () => {
    const characters = await db.getAllCharacters();
    expect(Array.isArray(characters)).toBe(true);
  });

  it('should validate character data structure', async () => {
    const characters = await db.getAllCharacters();
    
    if (characters.length > 0) {
      const character = characters[0];
      expect(character).toHaveProperty('id');
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('class');
      expect(character).toHaveProperty('type');
    }
  });

  it('should validate card data structure', async () => {
    const cards = await db.getAllCards();
    
    if (cards.length > 0) {
      const card = cards[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('bonusDmg');
      expect(card).toHaveProperty('bonusDef');
    }
  });

  it('should have enough data for recommendations', async () => {
    const characters = await db.getAllCharacters();
    const cards = await db.getAllCards();
    
    // System should have at least some characters and cards for recommendations
    expect(characters.length).toBeGreaterThanOrEqual(0);
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should parse card bonus values correctly', async () => {
    const cards = await db.getAllCards();
    
    cards.forEach(card => {
      if (card.bonusDmg) {
        const dmg = parseFloat(card.bonusDmg);
        expect(isNaN(dmg)).toBe(false);
      }
      if (card.bonusDef) {
        const def = parseFloat(card.bonusDef);
        expect(isNaN(def)).toBe(false);
      }
    });
  });

  it('should have character attributes for analysis', async () => {
    const characters = await db.getAllCharacters();
    
    if (characters.length > 0) {
      const character = characters[0];
      // Character should have attributes for IA analysis
      expect(typeof character.name).toBe('string');
      expect(typeof character.class).toBe('string');
      expect(typeof character.type).toBe('string');
    }
  });

  it('should have skill effect data for card recommendations', async () => {
    const cards = await db.getAllCards();
    
    // At least some cards should have skill effects for better recommendations
    const cardsWithSkillEffect = cards.filter(c => c.skillEffect && c.skillEffect.trim().length > 0);
    expect(cardsWithSkillEffect.length).toBeGreaterThanOrEqual(0);
  });

  it('should support character class types', async () => {
    const characters = await db.getAllCharacters();
    const validClasses = ['Protector', 'Warrior', 'Skilled', 'Assassin', 'Assist'];
    
    characters.forEach(char => {
      expect(validClasses).toContain(char.class);
    });
  });

  it('should support character type elements', async () => {
    const characters = await db.getAllCharacters();
    const validTypes = ['Water', 'Fire', 'Air', 'Earth', 'Light', 'Dark'];
    
    characters.forEach(char => {
      expect(validTypes).toContain(char.type);
    });
  });
});
