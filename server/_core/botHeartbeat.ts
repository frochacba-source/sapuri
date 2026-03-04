/**
 * Sistema de Heartbeat e Auto-Recovery para Bot Telegram
 * Monitora a saúde do Bot e reinicia automaticamente se necessário
 */

import axios from "axios";

interface BotHealth {
  isAlive: boolean;
  lastHeartbeat: number;
  messageCount: number;
  uptime: number;
  status: "healthy" | "degraded" | "dead";
}

let botHealth: BotHealth = {
  isAlive: true,
  lastHeartbeat: Date.now(),
  messageCount: 0,
  uptime: 0,
  status: "healthy",
};

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;
const HEARTBEAT_INTERVAL = 30000; // 30 segundos
const HEARTBEAT_TIMEOUT = 10000; // 10 segundos de timeout

/**
 * Inicia o sistema de heartbeat
 */
export function startBotHeartbeat(token: string) {
  console.log("[Bot Heartbeat] Iniciando sistema de heartbeat...");

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(async () => {
    try {
      await checkBotHealth(token);
    } catch (error) {
      console.error("[Bot Heartbeat] Erro ao verificar saúde do Bot:", error);
      botHealth.status = "degraded";
    }
  }, HEARTBEAT_INTERVAL);

  console.log("[Bot Heartbeat] ✅ Sistema de heartbeat iniciado");
}

/**
 * Para o sistema de heartbeat
 */
export function stopBotHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log("[Bot Heartbeat] Sistema de heartbeat parado");
  }
}

/**
 * Verifica a saúde do Bot Telegram
 */
async function checkBotHealth(token: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT);

    const response = await axios.get(
      `https://api.telegram.org/bot${token}/getMe`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.status === 200 && response.data.ok) {
      botHealth.isAlive = true;
      botHealth.lastHeartbeat = Date.now();
      botHealth.uptime = Date.now() - (botHealth.lastHeartbeat - botHealth.uptime);
      botHealth.status = "healthy";
      recoveryAttempts = 0;

      console.log(
        `[Bot Heartbeat] ✅ Bot saudável - Mensagens: ${botHealth.messageCount}`
      );
    } else {
      throw new Error("Bot não respondeu corretamente");
    }
  } catch (error) {
    console.error("[Bot Heartbeat] ❌ Bot não respondendo:", error);
    botHealth.isAlive = false;
    botHealth.status = "dead";

    // Tentar recuperar o Bot
    if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      recoveryAttempts++;
      console.log(
        `[Bot Heartbeat] 🔄 Tentativa de recuperação ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}`
      );
      await attemptBotRecovery(token);
    } else {
      console.error(
        "[Bot Heartbeat] ⚠️ Máximo de tentativas de recuperação atingido"
      );
    }
  }
}

/**
 * Tenta recuperar o Bot
 */
async function attemptBotRecovery(token: string) {
  try {
    console.log("[Bot Heartbeat] Tentando recuperar Bot...");

    // Aguardar um pouco antes de tentar novamente
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Tentar enviar uma mensagem de teste
    const testResponse = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: "-1003466492984", // Grupo de teste
        text: "🤖 Bot recuperado após falha",
      },
      { timeout: HEARTBEAT_TIMEOUT }
    );

    if (testResponse.status === 200) {
      console.log("[Bot Heartbeat] ✅ Bot recuperado com sucesso!");
      botHealth.isAlive = true;
      botHealth.status = "healthy";
      recoveryAttempts = 0;
    }
  } catch (error) {
    console.error("[Bot Heartbeat] Falha na recuperação:", error);
  }
}

/**
 * Retorna o status de saúde do Bot
 */
export function getBotHealth(): BotHealth {
  return {
    ...botHealth,
    uptime: Date.now() - botHealth.lastHeartbeat,
  };
}

/**
 * Incrementa contador de mensagens
 */
export function incrementMessageCount() {
  botHealth.messageCount++;
}

/**
 * Reseta o contador de mensagens
 */
export function resetMessageCount() {
  botHealth.messageCount = 0;
}

/**
 * Retorna se o Bot está saudável
 */
export function isBotHealthy(): boolean {
  return botHealth.status === "healthy" && botHealth.isAlive;
}

/**
 * Ressuscita o Bot manualmente
 */
export async function resurrectBot(token: string): Promise<boolean> {
  try {
    console.log("[Bot Heartbeat] 🔄 Tentando ressuscitar Bot manualmente...");
    
    // Resetar contador de tentativas
    recoveryAttempts = 0;
    
    // Verificar saúde do Bot
    await checkBotHealth(token);
    
    if (botHealth.isAlive && botHealth.status === "healthy") {
      console.log("[Bot Heartbeat] ✅ Bot ressuscitado com sucesso!");
      return true;
    } else {
      console.log("[Bot Heartbeat] ⚠️ Bot ainda não está respondendo");
      return false;
    }
  } catch (error) {
    console.error("[Bot Heartbeat] ❌ Erro ao ressuscitar Bot:", error);
    return false;
  }
}
