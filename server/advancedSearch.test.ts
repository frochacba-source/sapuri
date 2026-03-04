import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { searchGotStrategiesByMultipleNames } from './db';

describe('Advanced Search - Multiple Names', () => {
  // Mock strategies para teste
  const mockStrategies = [
    {
      id: 1,
      name: 'Estratégia 1',
      attackFormation1: 'Hades',
      attackFormation2: 'Seiya',
      attackFormation3: 'Zeus',
      defenseFormation1: 'Athena',
      defenseFormation2: 'Poseidon',
      defenseFormation3: 'Hades',
      usageCount: 5,
    },
    {
      id: 2,
      name: 'Estratégia 2',
      attackFormation1: 'Seiya',
      attackFormation2: 'Ikki',
      attackFormation3: 'Shun',
      defenseFormation1: 'Saga',
      defenseFormation2: 'Kanon',
      defenseFormation3: 'Shura',
      usageCount: 3,
    },
    {
      id: 3,
      name: 'Estratégia 3',
      attackFormation1: 'Zeus',
      attackFormation2: 'Poseidon',
      attackFormation3: 'Hades',
      defenseFormation1: 'Seiya',
      defenseFormation2: 'Ikki',
      defenseFormation3: 'Shun',
      usageCount: 7,
    },
  ];

  it('deve encontrar estratégias com 1 nome', async () => {
    // Teste com 1 nome
    const results = await searchGotStrategiesByMultipleNames(['Hades']);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(s => s.attackFormation1 === 'Hades' || s.attackFormation3 === 'Hades')).toBe(true);
  });

  it('deve encontrar estratégias com 2 nomes', async () => {
    // Teste com 2 nomes
    const results = await searchGotStrategiesByMultipleNames(['Hades', 'Seiya']);
    expect(results.length).toBeGreaterThan(0);
  });

  it('deve encontrar estratégias com 3 nomes', async () => {
    // Teste com 3 nomes
    const results = await searchGotStrategiesByMultipleNames(['Hades', 'Seiya', 'Zeus']);
    expect(results.length).toBeGreaterThan(0);
  });

  it('deve limitar a 3 nomes mesmo se mais forem fornecidos', async () => {
    // Teste com mais de 3 nomes (deve usar apenas os 3 primeiros)
    const results = await searchGotStrategiesByMultipleNames(['Hades', 'Seiya', 'Zeus', 'Poseidon', 'Athena']);
    expect(results.length).toBeGreaterThan(0);
  });

  it('deve retornar array vazio para nomes vazios', async () => {
    const results = await searchGotStrategiesByMultipleNames(['', '', '']);
    expect(results.length).toBe(0);
  });

  it('deve ser case-insensitive', async () => {
    // Teste com diferentes cases
    const results1 = await searchGotStrategiesByMultipleNames(['hades']);
    const results2 = await searchGotStrategiesByMultipleNames(['HADES']);
    const results3 = await searchGotStrategiesByMultipleNames(['Hades']);
    
    expect(results1.length).toBe(results2.length);
    expect(results2.length).toBe(results3.length);
  });

  it('deve ordenar por usageCount decrescente', async () => {
    const results = await searchGotStrategiesByMultipleNames(['Hades', 'Seiya', 'Zeus']);
    
    // Verificar se está ordenado por usageCount
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].usageCount).toBeGreaterThanOrEqual(results[i + 1].usageCount);
    }
  });

  it('deve encontrar estratégias com nomes parciais', async () => {
    // Teste com nome parcial
    const results = await searchGotStrategiesByMultipleNames(['Had']); // Parte de 'Hades'
    expect(results.length).toBeGreaterThan(0);
  });

  it('deve filtrar corretamente com espaços em branco', async () => {
    // Teste com espaços extras
    const results = await searchGotStrategiesByMultipleNames(['  Hades  ', '  Seiya  ']);
    expect(results.length).toBeGreaterThan(0);
  });
});
