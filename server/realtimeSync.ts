/**
 * Serviço de Sincronização em Tempo Real
 * Monitora mudanças no banco de dados e notifica clientes
 */

interface SyncEvent {
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const syncListeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();
const lastSyncTimestamp: Map<string, number> = new Map();

export function registerSyncListener(table: string, callback: (event: SyncEvent) => void): () => void {
  if (!syncListeners.has(table)) {
    syncListeners.set(table, new Set());
  }
  
  syncListeners.get(table)!.add(callback);
  console.log(`[RealtimeSync] Listener registrado para tabela: ${table}`);
  
  // Retornar função para desregistrar
  return () => {
    syncListeners.get(table)?.delete(callback);
    console.log(`[RealtimeSync] Listener removido para tabela: ${table}`);
  };
}

export function notifySync(event: SyncEvent): void {
  const listeners = syncListeners.get(event.table);
  if (listeners && listeners.size > 0) {
    console.log(`[RealtimeSync] Notificando ${listeners.size} listener(s) para ${event.table}`);
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[RealtimeSync] Erro ao notificar listener:', error);
      }
    });
  }
  
  // Atualizar timestamp da última sincronização
  lastSyncTimestamp.set(event.table, event.timestamp);
}

export function getLastSyncTimestamp(table: string): number {
  return lastSyncTimestamp.get(table) || 0;
}

export function getSyncStatus(): Record<string, any> {
  return {
    tables: Array.from(syncListeners.keys()),
    listenerCount: Array.from(syncListeners.entries()).reduce((acc, [table, listeners]) => {
      acc[table] = listeners.size;
      return acc;
    }, {} as Record<string, number>),
    lastSync: Object.fromEntries(lastSyncTimestamp),
  };
}

// Exemplo de uso em uma mutation:
// notifySync({
//   type: 'create',
//   table: 'gotStrategies',
//   data: newStrategy,
//   timestamp: Date.now(),
// });
