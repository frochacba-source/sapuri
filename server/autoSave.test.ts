import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  performAutoSave, 
  getLastBackup, 
  getBackupHistory, 
  startAutoSave, 
  stopAutoSave 
} from './autoSave';

describe('Sistema de Salvamento Automático', () => {
  beforeEach(() => {
    // Limpar backups antes de cada teste
    vi.clearAllMocks();
  });

  it('deve realizar salvamento automático', async () => {
    await performAutoSave();
    
    const backup = getLastBackup();
    expect(backup).toBeDefined();
    expect(backup?.timestamp).toBeGreaterThan(0);
    expect(backup?.checksum).toBeDefined();
  });

  it('deve manter histórico de backups', async () => {
    await performAutoSave();
    await new Promise(resolve => setTimeout(resolve, 100));
    await performAutoSave();
    
    const history = getBackupHistory();
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  it('deve limitar quantidade de backups em memória', async () => {
    // Fazer múltiplos salvamentos
    for (let i = 0; i < 15; i++) {
      await performAutoSave();
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const history = getBackupHistory();
    // Deve manter no máximo 12 backups
    expect(history.length).toBeLessThanOrEqual(12);
  });

  it('deve iniciar e parar salvamento automático', async () => {
    const timer = startAutoSave(1); // 1 minuto
    expect(timer).toBeDefined();
    
    stopAutoSave(timer);
    // Se chegou aqui, não houve erro
    expect(true).toBe(true);
  });

  it('deve ter checksum válido', async () => {
    await performAutoSave();
    
    const backup = getLastBackup();
    expect(backup?.checksum).toBeTruthy();
    expect(typeof backup?.checksum).toBe('string');
  });

  it('deve registrar timestamp correto', async () => {
    const beforeTime = Date.now();
    await performAutoSave();
    const afterTime = Date.now();
    
    const backup = getLastBackup();
    expect(backup?.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(backup?.timestamp).toBeLessThanOrEqual(afterTime);
  });
});
