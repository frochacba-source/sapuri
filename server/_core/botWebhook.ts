/**
 * Webhook handler para Bot Telegram
 * Processa comandos e mensagens do bot
 */

import { Request, Response } from "express";
import { handleEstrategiaCommand, handleAttackCommand, handleDefenseCommand, handleSearchCommand, handleTipDefenseCommand, handleGvgAttackCommand, handleGvgDefenseCommand, handleGvgTipDefenseCommand, handleGvgAttackCommandNew, handleGvgDefenseCommandNew, handleGvgDicaCommand, handleNomeCommand, handleIaCommand } from "../gotBotIntegration";
import { sendTelegramMessageDirect } from "../telegram";
import { checkRateLimit, getRateLimitStats } from "./rateLimiter";


// Deduplicação de mensagens no webhook
const processedWebhookMessages = new Map<string, number>(); // hash -> timestamp
const WEBHOOK_MESSAGE_CACHE_TTL = 300000; // 5 minutos
const processingMessages = new Set<string>(); // Mensagens sendo processadas (mutex)
const MAX_PROCESSING_TIME = 10000; // 10 segundos máximo

// Configurar rate limiting: 10 comandos por minuto
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minuto
};

function getWebhookMessageHash(message: any): string {
  return `${message.chat?.id}:${message.message_id}:${message.date}`;
}

function isWebhookMessageProcessed(hash: string): boolean {
  if (!hash) return false;
  const lastProcessed = processedWebhookMessages.get(hash);
  if (!lastProcessed) return false;
  const age = Date.now() - lastProcessed;
  return age < WEBHOOK_MESSAGE_CACHE_TTL;
}

function markWebhookMessageProcessed(hash: string): void {
  if (!hash) return;
  processedWebhookMessages.set(hash, Date.now());
  // Limpar cache antigo
  if (processedWebhookMessages.size > 1000) {
    const now = Date.now();
    const keysToDelete: string[] = [];
    processedWebhookMessages.forEach((timestamp, key) => {
      if (now - timestamp > WEBHOOK_MESSAGE_CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => processedWebhookMessages.delete(key));
  }
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      first_name?: string;
    };
    date: number;
    text?: string;
    entities?: Array<{
      offset: number;
      length: number;
      type: string;
    }>;
  };
}

/**
 * Processar webhook do Telegram
 */
export async function handleTelegramWebhook(req: Request, res: Response) {
  try {
    const update: TelegramUpdate = req.body;
    console.log("[Telegram Webhook] Received update:", JSON.stringify(update, null, 2));

    // Verificar se é uma mensagem válida
    if (!update.message || !update.message.text) {
      console.log("[Telegram Webhook] No message or text found");
      return res.status(200).json({ ok: true });
    }

    const { text, chat } = update.message;
    const chatId = chat.id.toString();
    
    // Deduplicação e mutex: verificar se a mensagem já foi processada
    const messageHash = getWebhookMessageHash(update.message);
    if (isWebhookMessageProcessed(messageHash)) {
      console.log("[Telegram Webhook] ⚠️ Mensagem duplicada ignorada no webhook:", messageHash);
      return res.status(200).json({ ok: true });
    }

    markWebhookMessageProcessed(messageHash);
    
    // Rate limiting desativado - permitir requisições ilimitadas de usuários
    // O foco agora é evitar respostas duplicadas, não limitar usuários
    
    console.log("[Telegram Webhook] Processing message:", text, "from chat:", chatId);

    // Processar comandos - Versão Simplificada
    // Usar toLowerCase() para case-insensitive matching
    const lowerText = text.toLowerCase();
    
    if (text === "/estrategia" || text.startsWith("/estrategia ")) {
      console.log("[Telegram Webhook] Handling /estrategia command");
      await handleEstrategiaCommand(chatId);
    } else if (lowerText.startsWith("/gvg ataque")) {
      console.log("[Telegram Webhook] Handling /gvg ataque command");
      const input = text.substring(11).trim();
      await handleGvgAttackCommandNew(chatId, input);
    } else if (lowerText.startsWith("/gvg defesa")) {
      console.log("[Telegram Webhook] Handling /gvg defesa command");
      const input = text.substring(11).trim();
      await handleGvgDefenseCommandNew(chatId, input);
    } else if (lowerText.startsWith("/gvg dica")) {
      console.log("[Telegram Webhook] Handling /gvg dica command");
      const input = text.substring(9).trim();
      await handleGvgDicaCommand(chatId, input);
    } else if (lowerText.startsWith("/nome")) {
      console.log("[Telegram Webhook] Handling /nome command");
      const input = text.substring(5).trim();
      await handleNomeCommand(chatId, input);
    } else if (lowerText.startsWith("/ataque")) {
      console.log("[Telegram Webhook] Handling /ataque command");
      const parts = text.split(" ");
      const characterName = parts.slice(1).join(" ");
      await handleAttackCommand(chatId, characterName);
    } else if (lowerText.startsWith("/dica defesa")) {
      console.log("[Telegram Webhook] Handling /dica defesa command");
      const input = text.substring(12).trim();
      await handleTipDefenseCommand(chatId, input);
    } else if (lowerText.startsWith("/defesa")) {
      console.log("[Telegram Webhook] Handling /defesa command");
      const parts = text.split(" ");
      const characterName = parts.slice(1).join(" ");
      await handleDefenseCommand(chatId, characterName);
    } else if (text === "/status") {
      console.log("[Telegram Webhook] Handling /status command");
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      const statusMessage = "✅ <b>Bot Status:</b>\n\n" +
        "🟢 Bot está respondendo normalmente\n" +
        "⏰ Timestamp: " + new Date().toISOString() + "\n\n" +
        "Use /help para ver todos os comandos disponíveis.";
      await sendTelegramMessageDirect(token, chatId, statusMessage);
    } else if (text.startsWith("/buscar ")) {
      console.log("[Telegram Webhook] Handling /buscar command");
      const keyword = text.substring(8).trim();
      if (!keyword) {
        const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
        await sendTelegramMessageDirect(token, chatId, "⚠️ Use: /buscar [nome da estratégia]");
        return;
      }
      await handleSearchCommand(chatId, keyword);
    } else if (lowerText.startsWith("/ia ")) {
      console.log("[Telegram Webhook] Handling /ia command");
      await handleIaCommand(chatId, text);
    } else if (text === "/help" || text === "/start") {
      console.log("[Telegram Webhook] Handling /help command");
      const helpMessage =
        "👋 <b>Bem-vindo ao Bot de Estratégias GoT!</b>\n\n" +
        "📋 <b>Comandos Disponíveis:</b>\n" +
        "/ataque [nome] [nome] [nome] - Ver ataques com um ou mais cavaleiros específicos\n" +
        "/defesa [nome] [nome] [nome] - Ver defesas com um ou mais cavaleiros específicos\n" +
        "/dica defesa [nome] [nome] [nome] - Ver APENAS dicas de defesas\n" +
        "/ia [pergunta] - Consultar IA sobre estratégias, cartas e dúvidas\n\n" +
        "📊 As estratégias são atualizadas em tempo real pelo Painel de Estratégias GoT!";

      const botToken = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      await sendTelegramMessageDirect(botToken, chatId, helpMessage);
    }
    // Não enviar resposta para mensagens sem comando

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}

/**
 * Registrar webhook do Telegram (desabilitado quando polling está ativo)
 */
export async function registerTelegramWebhook(app: any) {
  // Registrar rota webhook para receber mensagens do Telegram
  app.post('/api/telegram/webhook', handleTelegramWebhook);
  console.log("[Telegram] Webhook route registrada em /api/telegram/webhook");
}

/**
 * Deletar webhook do Telegram
 */
export async function deleteTelegramWebhook(): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    if (!token) {
      console.warn("[Telegram] Bot token not configured");
      return false;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/deleteWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json() as any;
    if (data.ok) {
      console.log("[Telegram] Webhook deleted successfully");
      return true;
    } else {
      console.error("[Telegram] Failed to delete webhook:", data.description);
      return false;
    }
  } catch (error) {
    console.error("[Telegram] Error deleting webhook:", error);
    return false;
  }
}

/**
 * Configurar webhook no servidor Telegram
 * Deve ser chamado uma vez para registrar o webhook
 */
export async function setupTelegramWebhookUrl(webhookUrl: string): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    if (!token) {
      console.warn("[Telegram] Bot token not configured");
      return false;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      }
    );

    const data = await response.json() as any;
    if (data.ok) {
      console.log("[Telegram] Webhook registered successfully:", webhookUrl);
      return true;
    } else {
      console.error("[Telegram] Failed to register webhook:", data.description);
      return false;
    }
  } catch (error) {
    console.error("[Telegram] Error setting webhook:", error);
    return false;
  }
}
