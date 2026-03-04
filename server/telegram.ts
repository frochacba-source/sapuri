import axios from "axios";
import { getBotConfig } from "./db";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML"
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }

  try {
    const response = await axios.post<TelegramResponse>(
      `${TELEGRAM_API_BASE}${config.telegramBotToken}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }
    );
    return response.data.ok;
  } catch (error) {
    console.error("[Telegram] Failed to send message:", error);
    return false;
  }
}

// Send message directly with token (for testing)
export async function sendTelegramMessageDirect(
  token: string,
  chatId: string,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML"
): Promise<boolean> {
  try {
    const response = await axios.post<TelegramResponse>(
      `${TELEGRAM_API_BASE}${token}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }
    );
    return response.data.ok;
  } catch (error) {
    console.error("[Telegram] Failed to send direct message:", error);
    return false;
  }
}

// Send private message to a member
export async function sendPrivateMessage(
  memberChatId: string,
  text: string
): Promise<boolean> {
  return sendTelegramMessage(memberChatId, text);
}

// Send private messages to multiple members
export async function sendPrivateMessages(
  members: { chatId: string; name: string }[],
  text: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const member of members) {
    const sent = await sendPrivateMessage(member.chatId, text);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { success, failed };
}

export async function sendScheduleNotification(
  eventName: string,
  eventTime: string,
  memberNames: string[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    console.warn("[Telegram] No group chat ID configured");
    return false;
  }

  const memberList = memberNames.map((name, i) => `${i + 1}. ${name}`).join("\n");
  
  const message = `🏆 <b>${eventName} - Escalação de Hoje</b>

⏰ <b>Horário:</b> ${eventTime}

<b>🛡️ Escalados salvem suas defesas!</b>
${memberList}

✅ Confirme sua presença!`;

  return sendTelegramMessage(chatId, message);
}

export async function sendAnnouncementNotification(
  title: string,
  message: string,
  memberNames: string[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    console.warn("[Telegram] No group chat ID configured");
    return false;
  }

  const memberList = memberNames.length > 0 
    ? `\n\n<b>Destinatários (${memberNames.length}):</b>\n${memberNames.map(name => `• ${name}`).join("\n")}`
    : "";
  
  const fullMessage = `📢 <b>${title}</b>

${message}${memberList}`;

  return sendTelegramMessage(chatId, fullMessage);
}

// Send general announcement to all (no member list)
export async function sendGeneralAnnouncement(
  title: string,
  message: string,
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    console.warn("[Telegram] No group chat ID configured");
    return false;
  }

  const fullMessage = `📢 <b>${title}</b>

${message}`;

  return sendTelegramMessage(chatId, fullMessage);
}

export async function sendReminderNotification(
  eventName: string,
  eventTime: string,
  minutesBefore: number,
  memberNames: string[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }

  const message = `⏰ <b>LEMBRETE - ${eventName} em ${minutesBefore} minutos!</b>

🕐 Horário: ${eventTime}
👥 ${memberNames.length} escalados

Preparem-se! 🎮`;

  return sendTelegramMessage(chatId, message);
}

// Send non-attacker alert to admins
export async function sendNonAttackerAlert(
  eventName: string,
  eventDate: string,
  nonAttackers: string[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }

  const memberList = nonAttackers.map(name => `❌ ${name}`).join("\n");
  
  const message = `⚠️ <b>ALERTA - Membros que NÃO atacaram</b>

📅 <b>Evento:</b> ${eventName}
📆 <b>Data:</b> ${eventDate}

<b>Não atacaram (${nonAttackers.length}):</b>
${memberList}`;

  return sendTelegramMessage(chatId, message);
}

// Send GvG results summary
export async function sendGvgResultsSummary(
  eventDate: string,
  results: { name: string; attack1Stars: number; attack2Stars: number; total: number }[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }

  const totalStars = results.reduce((sum, r) => sum + r.total, 0);
  const resultList = results
    .sort((a, b) => b.total - a.total)
    .map((r, i) => `${i + 1}. ${r.name}: ${'⭐'.repeat(r.total)} (${r.total})`)
    .join("\n");
  
  const message = `🏆 <b>GvG - Resultado do Dia</b>

📆 <b>Data:</b> ${eventDate}
⭐ <b>Total de Estrelas:</b> ${totalStars}

<b>Desempenho:</b>
${resultList}`;

  return sendTelegramMessage(chatId, message);
}

// Send GoT results summary
export async function sendGotResultsSummary(
  eventDate: string,
  results: { name: string; points: number; attackVictories: number; defenseVictories: number }[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }

  const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
  const resultList = results
    .sort((a, b) => b.points - a.points)
    .slice(0, 10) // Top 10
    .map((r, i) => `${i + 1}. ${r.name}: ${r.points} pts (⚔️${r.attackVictories} 🛡️${r.defenseVictories})`)
    .join("\n");
  
  const message = `🏆 <b>GoT - Resultado do Dia</b>

📆 <b>Data:</b> ${eventDate}
🎯 <b>Total de Pontos:</b> ${totalPoints}

<b>Top 10:</b>
${resultList}`;

  return sendTelegramMessage(chatId, message);
}

export async function testBotConnection(token: string): Promise<{ success: boolean; botName?: string; error?: string }> {
  try {
    const response = await axios.get<TelegramResponse & { result?: { username?: string } }>(
      `${TELEGRAM_API_BASE}${token}/getMe`
    );
    
    if (response.data.ok && response.data.result) {
      return { 
        success: true, 
        botName: response.data.result.username 
      };
    }
    return { success: false, error: "Invalid response from Telegram" };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export function validateBotToken(token: string): boolean {
  // Telegram bot tokens follow the format: <bot_id>:<hash>
  const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
  return tokenRegex.test(token);
}

export function validateBotUsername(username: string): boolean {
  // Bot usernames must end with "bot" (case insensitive)
  return username.toLowerCase().endsWith("bot");
}


// Send Reliquias reminder with boss/guards assignments
export async function sendReliquiasReminder(
  bossName: string,
  minutesBefore: number,
  bossAttackers: string[],
  guardsAttackers: { name: string; guard1?: number | null; guard2?: number | null }[],
  groupChatId?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    return false;
  }

  const chatId = groupChatId || config.telegramGroupId;
  if (!chatId) {
    return false;
  }

  // Format boss attackers
  const bossListText = bossAttackers.length > 0 
    ? bossAttackers.map(name => `⚔️ ${name}`).join("\n")
    : "Nenhum";

  // Format guards attackers with their guard numbers, sorted by guard number
  const sortedGuardsAttackers = [...guardsAttackers].sort((a, b) => {
    const minA = Math.min(a.guard1 || 999, a.guard2 || 999);
    const minB = Math.min(b.guard1 || 999, b.guard2 || 999);
    return minA - minB;
  });
  
  const guardsListText = sortedGuardsAttackers.length > 0 
    ? sortedGuardsAttackers.map(g => {
        const guards = [g.guard1, g.guard2].filter(n => n != null).sort((a, b) => a - b).join(" e ");
        return `🛡️ ${g.name}${guards ? ` (Guardas: ${guards})` : ""}`;
      }).join("\n")
    : "Nenhum";

  const message = `⏰ <b>RELÍQUIAS - ${bossName} em ${minutesBefore} minutos!</b>

<b>🎯 Atacando Boss (${bossAttackers.length}):</b>
${bossListText}

<b>🛡️ Atacando Guardas (${guardsAttackers.length}):</b>
${guardsListText}

Preparem-se! 💪`;

  return sendTelegramMessage(chatId, message);
}


// ============ AUTOMAÇÃO DE MENSAGENS ============

/**
 * Enviar lembrete automático GoT para membros que não atacaram
 * Usado pelo agendamento automático (cron job)
 */
export async function sendAutomaticGotReminder(
  eventDate: string,
  nonAttackerNames: string[],
  customMessage?: string
): Promise<boolean> {
  const config = await getBotConfig();
  if (!config?.telegramBotToken || !config.isActive) {
    console.warn("[Telegram] Bot not configured or inactive");
    return false;
  }

  const defaultMessage = "⚔️ *LEMBRETE GoT*\n\nFavor quem ainda não atacou, atacar por gentileza!\n\n🕐 O tempo está passando...";
  const message = customMessage || defaultMessage;

  const fullMessage = `${message}\n\n📋 *Ainda não atacaram (${nonAttackerNames.length}):*\n${nonAttackerNames.join(", ") || "Todos já atacaram! 🎉"}`;

  try {
    const response = await axios.post<TelegramResponse>(
      `${TELEGRAM_API_BASE}${config.telegramBotToken}/sendMessage`,
      {
        chat_id: config.telegramGroupId,
        text: fullMessage,
        parse_mode: "Markdown",
      }
    );
    return response.data.ok;
  } catch (error) {
    console.error("[Telegram] Failed to send automatic reminder:", error);
    return false;
  }
}

/**
 * Enviar mensagem via WhatsApp (integração com API)
 * Requer configuração de token WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  text: string,
  whatsappToken?: string
): Promise<boolean> {
  if (!whatsappToken) {
    console.warn("[WhatsApp] Token not configured");
    return false;
  }

  try {
    const response = await axios.post(
      "https://graph.instagram.com/v18.0/YOUR_PHONE_NUMBER_ID/messages",
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error("[WhatsApp] Failed to send message:", error);
    return false;
  }
}

/**
 * Enviar mensagens em lote via WhatsApp
 */
export async function sendWhatsAppMessages(
  members: { phoneNumber: string; name: string }[],
  text: string,
  whatsappToken?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const member of members) {
    const sent = await sendWhatsAppMessage(member.phoneNumber, text, whatsappToken);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { success, failed };
}

/**
 * Validar token WhatsApp
 */
export async function validateWhatsAppToken(token: string): Promise<boolean> {
  try {
    const response = await axios.get(
      "https://graph.instagram.com/v18.0/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error("[WhatsApp] Invalid token:", error);
    return false;
  }
}


/**
 * Enviar sugestões de estratégias GoT via Telegram
 * Usado pelo comando /estrategia do bot
 */
export async function sendGotStrategiesSuggestions(
  chatId: string,
  strategies: Array<{
    name: string;
    attackFormation1: string;
    attackFormation2: string;
    attackFormation3: string;
    defenseFormation1: string;
    defenseFormation2: string;
    defenseFormation3: string;
    winRate: number;
  }>
): Promise<boolean> {
  if (strategies.length === 0) {
    return sendTelegramMessage(
      chatId,
      "❌ Nenhuma estratégia encontrada no banco de dados."
    );
  }

  let message = "📋 <b>Estratégias GoT Disponíveis</b>\n\n";

  strategies.slice(0, 5).forEach((strategy, index) => {
    message += `<b>${index + 1}. ${strategy.name}</b>\n`;
    message += `🎯 Ataque: ${strategy.attackFormation1} × ${strategy.attackFormation2} × ${strategy.attackFormation3}\n`;
    message += `🛡️ Defesa: ${strategy.defenseFormation1} × ${strategy.defenseFormation2} × ${strategy.defenseFormation3}\n`;
    message += `📊 Taxa de Vitória: ${strategy.winRate}%\n\n`;
  });

  if (strategies.length > 5) {
    message += `\n... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  return sendTelegramMessage(chatId, message);
}
