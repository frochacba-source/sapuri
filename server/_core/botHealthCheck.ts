/**
 * Bot Health Check & Monitoring
 * Implementa validação de token, monitoramento de webhook e auto-recovery
 */

import axios from "axios";

const TELEGRAM_API = "https://api.telegram.org";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
const WEBHOOK_URL = "https://teamsapuri.manus.space/api/telegram/webhook";

interface BotHealthStatus {
  tokenValid: boolean;
  webhookRegistered: boolean;
  webhookUrl?: string;
  lastCheck: Date;
  status: "healthy" | "warning" | "critical";
  message: string;
}

/**
 * Validar token do bot
 */
export async function validateBotToken(): Promise<boolean> {
  try {
    const response = await axios.get(`${TELEGRAM_API}/bot${BOT_TOKEN}/getMe`);
    if (response.data.ok && response.data.result.is_bot) {
      console.log("[Bot Health] ✅ Token válido - Bot:", response.data.result.first_name);
      return true;
    }
    console.error("[Bot Health] ❌ Token inválido");
    return false;
  } catch (error) {
    console.error("[Bot Health] ❌ Erro ao validar token:", error);
    return false;
  }
}

/**
 * Verificar se webhook está registrado no Telegram
 */
export async function checkWebhookRegistration(): Promise<boolean> {
  try {
    const response = await axios.get(`${TELEGRAM_API}/bot${BOT_TOKEN}/getWebhookInfo`);
    if (response.data.ok) {
      const webhookInfo = response.data.result;
      const isRegistered = webhookInfo.url === WEBHOOK_URL;
      
      if (isRegistered) {
        console.log("[Bot Health] ✅ Webhook registrado:", webhookInfo.url);
        return true;
      } else {
        console.warn("[Bot Health] ⚠️ Webhook URL mismatch. Registrado:", webhookInfo.url, "Esperado:", WEBHOOK_URL);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("[Bot Health] ❌ Erro ao verificar webhook:", error);
    return false;
  }
}

/**
 * Registrar webhook no Telegram
 */
export async function registerWebhook(): Promise<boolean> {
  try {
    const response = await axios.post(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        drop_pending_updates: true, // Descartar mensagens antigas
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.ok) {
      console.log("[Bot Health] ✅ Webhook registrado com sucesso:", WEBHOOK_URL);
      return true;
    }
    console.error("[Bot Health] ❌ Erro ao registrar webhook:", response.data);
    return false;
  } catch (error) {
    console.error("[Bot Health] ❌ Erro ao registrar webhook:", error);
    return false;
  }
}

/**
 * Verificar saúde geral do bot
 */
export async function checkBotHealth(): Promise<BotHealthStatus> {
  const tokenValid = await validateBotToken();
  const webhookRegistered = await checkWebhookRegistration();

  let status: "healthy" | "warning" | "critical" = "healthy";
  let message = "✅ Bot operacional";

  if (!tokenValid) {
    status = "critical";
    message = "❌ Token inválido";
  } else if (!webhookRegistered) {
    status = "warning";
    message = "⚠️ Webhook não registrado ou URL incorreta";
  }

  return {
    tokenValid,
    webhookRegistered,
    lastCheck: new Date(),
    status,
    message,
  };
}

/**
 * Inicializar health check na startup
 */
export async function initializeBotHealthCheck(): Promise<void> {
  console.log("[Bot Health] Iniciando verificação de saúde do bot...");

  const health = await checkBotHealth();
  console.log("[Bot Health] Status:", health);

  if (!health.tokenValid) {
    console.error("[Bot Health] ❌ CRÍTICO: Token do bot inválido!");
    process.exit(1);
  }

  if (!health.webhookRegistered) {
    console.warn("[Bot Health] ⚠️ Webhook não está registrado. Tentando registrar...");
    const registered = await registerWebhook();
    if (!registered) {
      console.error("[Bot Health] ❌ Falha ao registrar webhook");
    }
  }

  // Agendar verificações periódicas (a cada 5 minutos)
  setInterval(async () => {
    const currentHealth = await checkBotHealth();
    if (currentHealth.status !== "healthy") {
      console.warn("[Bot Health] ⚠️ Problema detectado:", currentHealth.message);

      // Tentar recuperar se webhook não está registrado
      if (!currentHealth.webhookRegistered) {
        console.log("[Bot Health] Tentando re-registrar webhook...");
        await registerWebhook();
      }
    }
  }, 5 * 60 * 1000); // 5 minutos
}

/**
 * Endpoint de status para monitoramento externo
 */
export async function getBotStatusForDashboard(): Promise<BotHealthStatus> {
  return checkBotHealth();
}
