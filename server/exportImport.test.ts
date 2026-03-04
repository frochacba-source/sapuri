import { describe, it, expect } from 'vitest';
import {
  exportStrategies,
  validateImportFile,
  parseImportFile,
  generateDownloadFilename,
  getImportStats,
  StrategyExport,
} from './exportImport';

describe('Export/Import Strategies', () => {
  const mockStrategies = [
    {
      id: 1,
      name: 'Hades vs Hades',
      attackFormation: 'Hades x Kanon x Saga',
      defenseFormation: 'Hades x Kanon x Saga',
      observation: 'Estratégia defensiva',
      createdBy: 1,
      createdAt: Date.now(),
      attackFormation1: 'Hades',
      attackFormation2: 'Kanon',
      attackFormation3: 'Saga',
      defenseFormation1: 'Hades',
      defenseFormation2: 'Kanon',
      defenseFormation3: 'Saga',
      usageCount: 5,
    },
    {
      id: 2,
      name: 'Poseidon vs Poseidon',
      attackFormation: 'Poseidon x Amphitrite x Tethys',
      defenseFormation: 'Poseidon x Amphitrite x Tethys',
      observation: null,
      createdBy: 1,
      createdAt: Date.now(),
      attackFormation1: 'Poseidon',
      attackFormation2: 'Amphitrite',
      attackFormation3: 'Tethys',
      defenseFormation1: 'Poseidon',
      defenseFormation2: 'Amphitrite',
      defenseFormation3: 'Tethys',
      usageCount: 3,
    },
  ];

  describe('exportStrategies', () => {
    it('deve exportar estratégias com formato correto', () => {
      const exported = exportStrategies(mockStrategies);

      expect(exported.version).toBe('1.0');
      expect(exported.strategies).toHaveLength(2);
      expect(exported.metadata.totalStrategies).toBe(2);
      expect(exported.metadata.checksum).toBeDefined();
      expect(exported.exportDate).toBeDefined();
    });

    it('deve incluir todos os campos necessários na exportação', () => {
      const exported = exportStrategies(mockStrategies);
      const firstStrategy = exported.strategies[0];

      expect(firstStrategy).toHaveProperty('id');
      expect(firstStrategy).toHaveProperty('name');
      expect(firstStrategy).toHaveProperty('attackFormation');
      expect(firstStrategy).toHaveProperty('defenseFormation');
      expect(firstStrategy).toHaveProperty('observation');
      expect(firstStrategy).toHaveProperty('createdBy');
      expect(firstStrategy).toHaveProperty('createdAt');
    });

    it('deve exportar lista vazia sem erro', () => {
      const exported = exportStrategies([]);

      expect(exported.strategies).toHaveLength(0);
      expect(exported.metadata.totalStrategies).toBe(0);
    });
  });

  describe('validateImportFile', () => {
    it('deve validar arquivo com formato correto', () => {
      const exported = exportStrategies(mockStrategies);
      const result = validateImportFile(exported);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar arquivo sem versão', () => {
      const invalid = {
        strategies: [],
        metadata: { totalStrategies: 0, checksum: '' },
      };

      const result = validateImportFile(invalid);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de arquivo inválido');
    });

    it('deve rejeitar arquivo com versão não suportada', () => {
      const exported = exportStrategies(mockStrategies);
      exported.version = '2.0';

      const result = validateImportFile(exported);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Versão não suportada');
    });

    it('deve rejeitar arquivo com estratégia sem campos obrigatórios', () => {
      const exported = exportStrategies(mockStrategies);
      exported.strategies[0].attackFormation = '';

      const result = validateImportFile(exported);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('campos obrigatórios');
    });

    it('deve validar checksum corretamente', () => {
      const exported = exportStrategies(mockStrategies);
      const originalChecksum = exported.metadata.checksum;

      // Modificar dados sem atualizar checksum
      exported.strategies[0].name = 'Modificado';

      const result = validateImportFile(exported);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Checksum inválido');
    });
  });

  describe('parseImportFile', () => {
    it('deve fazer parse de arquivo JSON válido', () => {
      const exported = exportStrategies(mockStrategies);
      const jsonString = JSON.stringify(exported);

      const result = parseImportFile(jsonString);

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.data?.strategies).toHaveLength(2);
    });

    it('deve retornar erro para JSON inválido', () => {
      const result = parseImportFile('{ invalid json }');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    it('deve retornar erro para arquivo inválido', () => {
      const invalid = {
        version: '2.0',
        strategies: [],
      };

      const result = parseImportFile(JSON.stringify(invalid));

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('generateDownloadFilename', () => {
    it('deve gerar nome de arquivo com data', () => {
      const filename = generateDownloadFilename();

      expect(filename).toMatch(/^estrategias-got-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('getImportStats', () => {
    it('deve retornar estatísticas de importação', () => {
      const exported = exportStrategies(mockStrategies);
      const stats = getImportStats(exported);

      expect(stats.totalStrategies).toBe(2);
      expect(stats.exportDate).toBeDefined();
      expect(stats.version).toBe('1.0');
      expect(stats.strategies).toHaveLength(2);
    });

    it('deve incluir informações de cada estratégia nas estatísticas', () => {
      const exported = exportStrategies(mockStrategies);
      const stats = getImportStats(exported);

      expect(stats.strategies[0]).toHaveProperty('name');
      expect(stats.strategies[0]).toHaveProperty('attackFormation');
      expect(stats.strategies[0]).toHaveProperty('defenseFormation');
    });
  });
});
