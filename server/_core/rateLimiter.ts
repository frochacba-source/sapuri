/**
 * Rate limiting para o Bot do Telegram
 * Evita abuso limitando o número de comandos por usuário/chat
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number; // Número máximo de requisições
  windowMs: number; // Janela de tempo em ms
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10, // 10 comandos
  windowMs: 60 * 1000, // por minuto
};

const rateLimitMap = new Map<string, RateLimitEntry>();

export function setRateLimitConfig(config: Partial<RateLimitConfig>): void {
  Object.assign(DEFAULT_CONFIG, config);
  console.log('[RateLimit] Configuração atualizada:', DEFAULT_CONFIG);
}

export function checkRateLimit(chatId: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const key = `chat:${chatId}`;
  const now = Date.now();
  let entry = rateLimitMap.get(key);

  // Se não existe entrada ou a janela expirou, criar nova
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + DEFAULT_CONFIG.windowMs,
    };
    rateLimitMap.set(key, entry);
  }

  entry.count++;

  const allowed = entry.count <= DEFAULT_CONFIG.maxRequests;
  const remaining = Math.max(0, DEFAULT_CONFIG.maxRequests - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);

  if (!allowed) {
    console.log(
      `[RateLimit] Limite excedido para chat ${chatId}: ${entry.count}/${DEFAULT_CONFIG.maxRequests}`
    );
  }

  return { allowed, remaining, resetIn };
}

export function resetRateLimit(chatId: string): void {
  const key = `chat:${chatId}`;
  rateLimitMap.delete(key);
  console.log(`[RateLimit] Rate limit resetado para chat ${chatId}`);
}

export function getRateLimitStats(chatId: string): {
  count: number;
  limit: number;
  window: number;
  resetIn: number;
} | null {
  const key = `chat:${chatId}`;
  const entry = rateLimitMap.get(key);

  if (!entry) {
    return null;
  }

  const resetIn = Math.max(0, entry.resetTime - Date.now());

  return {
    count: entry.count,
    limit: DEFAULT_CONFIG.maxRequests,
    window: DEFAULT_CONFIG.windowMs,
    resetIn,
  };
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleaned = 0;
  const keysToDelete: string[] = [];

  rateLimitMap.forEach((entry, key) => {
    if (now >= entry.resetTime) {
      keysToDelete.push(key);
      cleaned++;
    }
  });

  keysToDelete.forEach(key => rateLimitMap.delete(key));

  if (cleaned > 0) {
    console.log(`[RateLimit] Limpeza: ${cleaned} entradas expiradas removidas`);
  }
}

// Limpar entradas expiradas a cada 5 minutos
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

export function getAllRateLimitStats(): {
  activeChats: number;
  totalRequests: number;
} {
  let totalRequests = 0;

  rateLimitMap.forEach((entry) => {
    totalRequests += entry.count;
  });

  return {
    activeChats: rateLimitMap.size,
    totalRequests,
  };
}
