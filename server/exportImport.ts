/**
 * Serviço de Export/Import de Estratégias GoT
 * Permite download e restauração de estratégias em formato JSON
 */

export interface StrategyExport {
  version: string;
  exportDate: string;
  strategies: Array<{
    id: string;
    name: string | null;
    attackFormation: string;
    defenseFormation: string;
    observation: string | null;
    createdBy: string;
    createdAt: number;
  }>;
  metadata: {
    totalStrategies: number;
    checksum: string;
  };
}

function calculateChecksum(data: any): string {
  const json = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function exportStrategies(strategies: any[]): StrategyExport {
  const export_data: StrategyExport = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    strategies: strategies.map(s => ({
      id: s.id,
      name: s.name || null,
      attackFormation: s.attackFormation,
      defenseFormation: s.defenseFormation,
      observation: s.observation || null,
      createdBy: s.createdBy,
      createdAt: s.createdAt,
    })),
    metadata: {
      totalStrategies: strategies.length,
      checksum: '',
    },
  };

  // Calcular checksum
  export_data.metadata.checksum = calculateChecksum(export_data.strategies);

  return export_data;
}

export function validateImportFile(data: any): { valid: boolean; error?: string } {
  try {
    // Validar estrutura básica
    if (!data.version || !data.strategies || !Array.isArray(data.strategies)) {
      return { valid: false, error: 'Formato de arquivo inválido' };
    }

    // Validar versão
    if (data.version !== '1.0') {
      return { valid: false, error: `Versão não suportada: ${data.version}` };
    }

    // Validar cada estratégia
    for (const strategy of data.strategies) {
      if (!strategy.attackFormation || !strategy.defenseFormation) {
        return { valid: false, error: 'Estratégia com campos obrigatórios faltando' };
      }
    }

    // Validar checksum
    if (data.metadata?.checksum) {
      const calculatedChecksum = calculateChecksum(data.strategies);
      if (calculatedChecksum !== data.metadata.checksum) {
        return { valid: false, error: 'Checksum inválido - arquivo pode estar corrompido' };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Erro ao validar arquivo: ${error}` };
  }
}

export function generateDownloadFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `estrategias-got-${timestamp}.json`;
}

export function parseImportFile(fileContent: string): { data?: StrategyExport; error?: string } {
  try {
    const data = JSON.parse(fileContent);
    const validation = validateImportFile(data);
    
    if (!validation.valid) {
      return { error: validation.error };
    }

    return { data };
  } catch (error) {
    return { error: `Erro ao processar arquivo JSON: ${error}` };
  }
}

export function getImportStats(data: StrategyExport): Record<string, any> {
  return {
    totalStrategies: data.strategies.length,
    exportDate: data.exportDate,
    version: data.version,
    strategies: data.strategies.map(s => ({
      name: s.name || '(sem nome)',
      attackFormation: s.attackFormation,
      defenseFormation: s.defenseFormation,
    })),
  };
}
