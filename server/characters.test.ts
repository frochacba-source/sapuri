import { describe, it, expect } from 'vitest';
import * as db from './db';

// Helper para gerar IDs únicos
function generateUniqueId() {
  return Math.floor(Math.random() * 1000000) + 1000000;
}

describe('Characters CRUD Operations', () => {
  it('should list all characters', async () => {
    const characters = await db.getAllCharacters();
    expect(Array.isArray(characters)).toBe(true);
  });

  it('should search characters by name', async () => {
    const results = await db.searchCharacters('ikki');
    // Should return array (might be empty if no matches)
    expect(Array.isArray(results)).toBe(true);
  });

  it('should get characters by class', async () => {
    const results = await db.getCharactersByClass('Warrior');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should get characters by type', async () => {
    const results = await db.getCharactersByType('Fire');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should create and retrieve a character', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Test Character ${testId}`,
      class: 'Warrior',
      type: 'Fire',
      hp: 1000,
      atk: 500,
      def: 300,
    };

    // Create
    const id = await db.createCharacter(testData);
    expect(id).toBeDefined();

    // Retrieve
    const character = await db.getCharacterById(testId);
    expect(character).toBeDefined();
    expect(character?.name).toBe(testData.name);
    expect(character?.class).toBe('Warrior');

    // Clean up
    await db.deleteCharacter(testId);
  });

  it('should update a character', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Update Test ${testId}`,
      class: 'Protector',
      type: 'Water',
    };

    // Create
    await db.createCharacter(testData);

    // Update
    const updated = await db.updateCharacter(testId, {
      name: `Updated ${testId}`,
      hp: 2000,
    });

    expect(updated?.name).toBe(`Updated ${testId}`);
    expect(updated?.hp).toBe(2000);

    // Clean up
    await db.deleteCharacter(testId);
  });

  it('should delete a character', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Delete Test ${testId}`,
      class: 'Skilled',
      type: 'Air',
    };

    // Create
    await db.createCharacter(testData);

    // Delete
    const success = await db.deleteCharacter(testId);
    expect(success).toBe(true);

    // Verify deletion
    const character = await db.getCharacterById(testId);
    expect(character).toBeNull();
  });

  it('should export characters to JSON', async () => {
    const jsonData = await db.exportCharactersToJson();
    expect(typeof jsonData).toBe('string');
    const parsed = JSON.parse(jsonData);
    expect(Array.isArray(parsed)).toBe(true);
  });
});

describe('Character Skills Operations', () => {
  it('should create and retrieve character skills', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Skill Test ${testId}`,
      class: 'Assassin',
      type: 'Dark',
    };

    // Create character
    await db.createCharacter(testData);

    // Create skill
    const skillData = {
      character_id: testId,
      skill_name: 'Test Skill',
      skill_type: 'Might',
      description: 'A test skill',
      start_time: 1.5,
      end_time: 2.5,
      delay: 0.5,
      cooldown: 3.0,
    };

    const skillId = await db.createCharacterSkill(skillData);
    expect(skillId).toBeDefined();

    // Retrieve skills
    const skills = await db.getCharacterSkills(testId);
    expect(Array.isArray(skills)).toBe(true);

    // Clean up
    await db.deleteCharacter(testId);
  });
});

describe('Character Cloth Operations', () => {
  it('should create and retrieve character cloth', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Cloth Test ${testId}`,
      class: 'Protector',
      type: 'Water',
    };

    // Create character
    await db.createCharacter(testData);

    // Create cloth
    const clothData = {
      character_id: testId,
      level: 1,
      description: 'Test Cloth',
      hp_boost: 10.5,
      atk_boost: 5.0,
      def_boost: 15.0,
      haste: 100,
    };

    const clothId = await db.createCharacterCloth(clothData);
    expect(clothId).toBeDefined();

    // Retrieve cloth
    const cloths = await db.getCharacterCloth(testId);
    expect(Array.isArray(cloths)).toBe(true);

    // Clean up
    await db.deleteCharacter(testId);
  });
});

describe('Character Constellations Operations', () => {
  it('should create and retrieve character constellations', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Constellation Test ${testId}`,
      class: 'Skilled',
      type: 'Air',
    };

    // Create character
    await db.createCharacter(testData);

    // Create constellation
    const constellationData = {
      character_id: testId,
      constellation_name: 'Test Constellation',
      description: 'A test constellation',
      level: 'C9',
      hp_boost: 5.0,
      dodge: 50,
      atk_boost: 10.0,
      crit: 3.5,
      def_boost: 8.0,
      hit: 100,
    };

    const constId = await db.createCharacterConstellation(constellationData);
    expect(constId).toBeDefined();

    // Retrieve constellations
    const constellations = await db.getCharacterConstellations(testId);
    expect(Array.isArray(constellations)).toBe(true);

    // Clean up
    await db.deleteCharacter(testId);
  });
});

describe('Character Links Operations', () => {
  it('should create and retrieve character links', async () => {
    const testId = generateUniqueId();
    const testData = {
      id: testId,
      name: `Link Test ${testId}`,
      class: 'Assist',
      type: 'Light',
    };

    // Create character
    await db.createCharacter(testData);

    // Create link
    const linkData = {
      character_id: testId,
      link_name: 'Test Link',
      description: 'A test link',
      level: 1,
    };

    const linkId = await db.createCharacterLink(linkData);
    expect(linkId).toBeDefined();

    // Retrieve links
    const links = await db.getCharacterLinks(testId);
    expect(Array.isArray(links)).toBe(true);

    // Clean up
    await db.deleteCharacter(testId);
  });
});
