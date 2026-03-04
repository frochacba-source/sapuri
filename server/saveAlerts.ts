/**
 * Serviço de Alertas de Salvamento
 * Notifica o usuário sobre status de salvamento automático
 */

interface SaveAlert {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration?: number; // em ms
}

const alerts: SaveAlert[] = [];
const alertListeners: Set<(alert: SaveAlert) => void> = new Set();
const MAX_ALERTS = 50;

export function createAlert(type: SaveAlert['type'], message: string, duration?: number): SaveAlert {
  const alert: SaveAlert = {
    id: `alert-${Date.now()}-${Math.random()}`,
    type,
    message,
    timestamp: Date.now(),
    duration,
  };
  
  alerts.push(alert);
  
  // Manter apenas os últimos MAX_ALERTS
  if (alerts.length > MAX_ALERTS) {
    alerts.shift();
  }
  
  // Notificar listeners
  alertListeners.forEach(listener => {
    try {
      listener(alert);
    } catch (error) {
      console.error('[SaveAlerts] Erro ao notificar listener:', error);
    }
  });
  
  console.log(`[SaveAlerts] ${type.toUpperCase()}: ${message}`);
  
  return alert;
}

export function registerAlertListener(callback: (alert: SaveAlert) => void): () => void {
  alertListeners.add(callback);
  
  return () => {
    alertListeners.delete(callback);
  };
}

export function getAlertHistory(): SaveAlert[] {
  return [...alerts];
}

export function clearAlerts(): void {
  alerts.length = 0;
  console.log('[SaveAlerts] Histórico de alertas limpo');
}

export function getAlertStats(): Record<string, number> {
  return {
    total: alerts.length,
    success: alerts.filter(a => a.type === 'success').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    error: alerts.filter(a => a.type === 'error').length,
  };
}

// Alertas padrão para salvamento
export function alertSaveSuccess(itemCount: number): void {
  createAlert('success', `✅ Salvamento automático concluído: ${itemCount} itens sincronizados`, 5000);
}

export function alertSaveWarning(message: string): void {
  createAlert('warning', `⚠️ Aviso de salvamento: ${message}`, 7000);
}

export function alertSaveError(error: string): void {
  createAlert('error', `❌ Erro ao salvar: ${error}`, 10000);
}
