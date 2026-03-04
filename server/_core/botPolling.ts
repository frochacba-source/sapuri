import { handleTelegramWebhook } from "./botWebhook";

// Mock Request/Response para polling
class MockRequest {
  body: any;
  constructor(body: any) {
    this.body = body;
  }
}

class MockResponse {
  statusCode = 200;
  status(code: number) {
    this.statusCode = code;
    return this;
  }
  json(data: any) {
    return data;
  }
}

let pollingActive = false;
let pollingStarting = false; // Flag para evitar múltiplas tentativas de inicialização
let lastUpdateId = 0;
let lastSuccessfulPoll = Date.now();
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 10;
const HEALTH_CHECK_INTERVAL = 30000;
let pollTimeout: ReturnType<typeof setTimeout> | null = null; // Armazenar timeout para limpeza

// Deduplicação robusta: guardar hash de comandos processados
const processedCommands = new Map<string, number>(); // hash -> timestamp
const COMMAND_CACHE_TTL = 3000; // 3 segundos - tempo suficiente para evitar duplicatas

function getCommandHash(update: any): string {
  const msg = update.message;
  if (!msg) return '';
  // Hash baseado APENAS em: chat_id + texto do comando (sem message_id ou timestamp)
  return `${msg.chat?.id}:${msg.text}`;
}

function isCommandProcessed(hash: string): boolean {
  if (!hash) return false;
  
  const lastProcessed = processedCommands.get(hash);
  if (!lastProcessed) return false;
  
  // Se foi processado há menos de 3 segundos, considerar duplicado
  const age = Date.now() - lastProcessed;
  return age < COMMAND_CACHE_TTL;
}

function markCommandProcessed(hash: string): void {
  if (!hash) return;
  processedCommands.set(hash, Date.now());
  
  // Limpar cache antigo
  if (processedCommands.size > 1000) {
    const now = Date.now();
    const keysToDelete: string[] = [];
    processedCommands.forEach((timestamp, key) => {
      if (now - timestamp > COMMAND_CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => processedCommands.delete(key));
  }
}

export async function startBotPolling() {
  // Se polling já está ativo ou iniciando, não iniciar novamente
  if (pollingActive || pollingStarting) {
    console.log('[Telegram Polling] Polling já está ativo ou iniciando, ignorando nova tentativa');
    return;
  }

  pollingStarting = true;
  pollingActive = true;
  lastSuccessfulPoll = Date.now();
  consecutiveErrors = 0;

  console.log("[Telegram Polling] Iniciando polling de mensagens...");

  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";

  const poll = async () => {
    if (!pollingActive) return;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`,
        { method: "GET" }
      );

      const data = (await response.json()) as any;

      if (data.ok && data.result && Array.isArray(data.result)) {
        lastSuccessfulPoll = Date.now();
        consecutiveErrors = 0;

        for (const update of data.result) {
          // Atualizar lastUpdateId ANTES de processar
          if (update.update_id > lastUpdateId) {
            lastUpdateId = update.update_id;
          }

          // Deduplicação robusta
          const commandHash = getCommandHash(update);
          if (isCommandProcessed(commandHash)) {
            console.log("[Telegram Polling] ⚠️ Comando duplicado ignorado:", commandHash);
            continue;
          }
          console.log("[Telegram Polling] ✅ Processando comando único:", commandHash);

          if (update.message && update.message.text) {
            try {
              // Marcar como processado ANTES de processar
              markCommandProcessed(commandHash);

              const mockReq = new MockRequest({ message: update.message });
              const mockRes = new MockResponse() as any;

              // Processar mensagem
              await handleTelegramWebhook(mockReq as any, mockRes);
            } catch (error) {
              console.error("[Telegram Polling] Erro ao processar mensagem:", error);
            }
          }
        }
      } else if (!data.ok) {
        consecutiveErrors++;
        console.error("[Telegram Polling] Erro na API:", data.description);

        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.error('[Telegram Polling] Muitos erros consecutivos! Parando polling...');
          stopBotPolling();
          pollingStarting = false;
          // Aguardar antes de reiniciar
          pollTimeout = setTimeout(() => {
            if (!pollingActive && !pollingStarting) {
              startBotPolling().catch(err => console.error('[Telegram Polling] Erro ao reiniciar:', err));
            }
          }, 5000);
          return;
        }
      }

      if (pollingActive) {
        pollTimeout = setTimeout(poll, 100);
      }
    } catch (error) {
      consecutiveErrors++;
      console.error("[Telegram Polling] Erro no polling:", error);

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('[Telegram Polling] Muitos erros! Parando...');
        stopBotPolling();
        pollingStarting = false;
        // Aguardar antes de reiniciar
        pollTimeout = setTimeout(() => {
          if (!pollingActive && !pollingStarting) {
            startBotPolling().catch(err => console.error('[Telegram Polling] Erro ao reiniciar:', err));
          }
        }, 5000);
        return;
      }

      if (pollingActive) {
        pollTimeout = setTimeout(poll, 5000);
      }
    }
  };

  pollingStarting = false; // Marcar como iniciado com sucesso
  poll();

  // Health check periódico
  const healthCheckInterval = setInterval(() => {
    if (!pollingActive) {
      clearInterval(healthCheckInterval);
      return;
    }

    const timeSinceLastPoll = Date.now() - lastSuccessfulPoll;

    if (timeSinceLastPoll > 60000) {
      console.warn('[Telegram Polling] Sem polls bem-sucedidos por mais de 60s! Parando...');
      stopBotPolling();
      pollingStarting = false;
      // Aguardar antes de reiniciar
      pollTimeout = setTimeout(() => {
        if (!pollingActive && !pollingStarting) {
          startBotPolling().catch(err => console.error('[Telegram Polling] Erro ao reiniciar:', err));
        }
      }, 5000);
    }
  }, HEALTH_CHECK_INTERVAL);
}

export function stopBotPolling() {
  pollingActive = false;
  pollingStarting = false;
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
  console.log('[Telegram Polling] Polling parado');
}

export function getBotPollingHealth() {
  const timeSinceLastPoll = Date.now() - lastSuccessfulPoll;
  const isHealthy = timeSinceLastPoll < 60000 && pollingActive;

  return {
    isActive: pollingActive,
    isHealthy,
    timeSinceLastPoll,
    lastUpdateId,
    consecutiveErrors,
    processedCommandCount: processedCommands.size,
  };
}
