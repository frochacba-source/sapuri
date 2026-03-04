import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';
import { gotStrategies } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

describe('GoT Strategies - Save Functionality', () => {
  beforeAll(async () => {
    // Clean up test data
    const database = await getDb();
    if (database) {
      await database.delete(gotStrategies).where(sql`createdBy = 999`);
    }
  });

  afterAll(async () => {
    // Clean up after tests
    const database = await getDb();
    if (database) {
      await database.delete(gotStrategies).where(sql`createdBy = 999`);
    }
  });

  it('should successfully create a GoT strategy with all formations', async () => {
    const strategy = await db.createGotStrategy({
      name: 'Estratégia Teste Completa',
      attackFormation1: 'Seiya',
      attackFormation2: 'Shiryu',
      attackFormation3: 'Hyoga',
      defenseFormation1: 'Shun',
      defenseFormation2: 'Ikki',
      defenseFormation3: 'Mu',
      createdBy: 999,
      usageCount: 0,
    });

    expect(strategy).toBeDefined();
    expect(strategy?.name).toBe('Estratégia Teste Completa');
    expect(strategy?.attackFormation1).toBe('Seiya');
    expect(strategy?.attackFormation2).toBe('Shiryu');
    expect(strategy?.attackFormation3).toBe('Hyoga');
    expect(strategy?.defenseFormation1).toBe('Shun');
    expect(strategy?.defenseFormation2).toBe('Ikki');
    expect(strategy?.defenseFormation3).toBe('Mu');
    expect(strategy?.createdBy).toBe(999);
  });

  it('should create another strategy without errors', async () => {
    const strategy = await db.createGotStrategy({
      name: 'Estratégia Recuperação',
      attackFormation1: 'Atena',
      attackFormation2: 'Poseidon',
      attackFormation3: 'Hades',
      defenseFormation1: 'Ares',
      defenseFormation2: 'Afrodite',
      defenseFormation3: 'Apolo',
      createdBy: 999,
      usageCount: 0,
    });

    expect(strategy).toBeDefined();
    expect(strategy?.name).toBe('Estratégia Recuperação');
    expect(strategy?.attackFormation1).toBe('Atena');
  });

  it('should list all strategies', async () => {
    const strategy = await db.createGotStrategy({
      name: 'Estratégia Lista 1',
      attackFormation1: 'Cavaleiro 1',
      attackFormation2: 'Cavaleiro 2',
      attackFormation3: 'Cavaleiro 3',
      defenseFormation1: 'Defensor 1',
      defenseFormation2: 'Defensor 2',
      defenseFormation3: 'Defensor 3',
      createdBy: 999,
      usageCount: 0,
    });

    const strategies = await db.getAllGotStrategies();
    expect(strategies).toBeDefined();
    expect(Array.isArray(strategies)).toBe(true);
    expect(strategies.length).toBeGreaterThan(0);
  });
});
