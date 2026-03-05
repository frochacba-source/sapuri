/**
 * Custom Messages Scheduler - Sistema de mensagens personalizadas agendadas
 * Permite criar, editar e agendar mensagens para envio automático
 */

import * as cron from "node-cron";
import { sendTelegramMessage } from "../telegram";
import { sendWhatsAppGroupMessage, getWhatsAppStatus } from "../whatsapp-web-client";
import { getDb, getBotConfig } from "../db";
import { customMessages, CustomMessage } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Interface para jobs agendados
interface ScheduledJob {
  messageId: number;
  cronJob: cron.ScheduledTask;
}

// Estado do scheduler
interface SchedulerState {
  isRunning: boolean;
  jobs: ScheduledJob[];
  lastRefresh: Date | null;
}

const state: SchedulerState = {
  isRunning: false,
  jobs: [],
  lastRefresh: null,
};

/**
 * Carregar mensagens ativas do banco de dados
 */
export async function loadMessagesFromDB(): Promise<CustomMessage[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const messages = await db
      .select()
      .from(customMessages)
      .where(eq(customMessages.isActive, true));
    
    return messages;
  } catch (error) {
    console.error("[Custom Messages] Erro ao carregar mensagens:", error);
    return [];
  }
}

/**
 * Verificar se o dia atual está nos dias configurados
 */
function shouldSendToday(daysOfWeek: string | null): boolean {
  if (!daysOfWeek) return true; // null significa todos os dias
  
  try {
    const days = JSON.parse(daysOfWeek) as number[];
    const today = new Date().getDay(); // 0 = Domingo, 6 = Sábado
    return days.includes(today);
  } catch {
    return true; // Se erro no parse, envia sempre
  }
}

/**
 * Enviar mensagem para as plataformas configuradas
 */
async function sendMessage(message: CustomMessage): Promise<{ telegram: boolean; whatsapp: boolean }> {
  const result = { telegram: false, whatsapp: false };

  // Verificar se deve enviar hoje
  if (!shouldSendToday(message.daysOfWeek)) {
    console.log(`[Custom Messages] Mensagem "${message.title}" não enviada - dia não configurado`);
    return result;
  }

  // Enviar para Telegram
  if (message.sendToTelegram) {
    try {
      const botConfig = await getBotConfig();
      const groupId = message.telegramGroupId || botConfig?.telegramGroupId;
      
      if (groupId) {
        result.telegram = await sendTelegramMessage(groupId, message.content, "Markdown");
        console.log(`[Custom Messages] Telegram "${message.title}": ${result.telegram ? "enviado" : "falhou"}`);
      }
    } catch (error) {
      console.error(`[Custom Messages] Erro ao enviar "${message.title}" para Telegram:`, error);
    }
  }

  // Enviar para WhatsApp
  if (message.sendToWhatsApp) {
    try {
      const whatsappStatus = getWhatsAppStatus();
      if (whatsappStatus.status === "connected" && message.whatsappGroupId) {
        result.whatsapp = await sendWhatsAppGroupMessage(message.whatsappGroupId, message.content);
        console.log(`[Custom Messages] WhatsApp "${message.title}": ${result.whatsapp ? "enviado" : "falhou"}`);
      }
    } catch (error) {
      console.error(`[Custom Messages] Erro ao enviar "${message.title}" para WhatsApp:`, error);
    }
  }

  // Atualizar último envio no banco
  if (result.telegram || result.whatsapp) {
    try {
      const db = await getDb();
      if (db) {
        await db
          .update(customMessages)
          .set({ lastSentAt: new Date() })
          .where(eq(customMessages.id, message.id));
      }
    } catch (error) {
      console.error(`[Custom Messages] Erro ao atualizar lastSentAt:`, error);
    }
  }

  return result;
}

/**
 * Agendar uma mensagem específica
 */
function scheduleMessage(message: CustomMessage): ScheduledJob | null {
  try {
    // Validar formato do horário (HH:mm)
    const [hours, minutes] = message.scheduleTime.split(":");
    if (!hours || !minutes) {
      console.error(`[Custom Messages] Horário inválido para "${message.title}": ${message.scheduleTime}`);
      return null;
    }

    // Criar expressão cron (minuto hora * * *)
    const cronExpression = `${parseInt(minutes)} ${parseInt(hours)} * * *`;
    
    const cronJob = cron.schedule(cronExpression, async () => {
      console.log(`[Custom Messages] Executando mensagem agendada: "${message.title}"`);
      await sendMessage(message);
    });

    console.log(`[Custom Messages] Agendada "${message.title}" para ${message.scheduleTime}`);
    
    return {
      messageId: message.id,
      cronJob,
    };
  } catch (error) {
    console.error(`[Custom Messages] Erro ao agendar "${message.title}":`, error);
    return null;
  }
}

/**
 * Parar todos os jobs
 */
function stopAllJobs(): void {
  for (const job of state.jobs) {
    job.cronJob.stop();
  }
  state.jobs = [];
}

/**
 * Recarregar todos os agendamentos
 */
export async function refreshScheduler(): Promise<{ success: boolean; count: number }> {
  console.log("[Custom Messages] Recarregando scheduler...");
  
  // Parar jobs existentes
  stopAllJobs();
  
  // Carregar mensagens do banco
  const messages = await loadMessagesFromDB();
  
  // Agendar cada mensagem
  for (const message of messages) {
    const job = scheduleMessage(message);
    if (job) {
      state.jobs.push(job);
    }
  }
  
  state.lastRefresh = new Date();
  console.log(`[Custom Messages] ${state.jobs.length} mensagens agendadas`);
  
  return {
    success: true,
    count: state.jobs.length,
  };
}

/**
 * Iniciar o scheduler
 */
export async function startScheduler(): Promise<boolean> {
  if (state.isRunning) {
    console.log("[Custom Messages] Scheduler já está rodando");
    return false;
  }
  
  await refreshScheduler();
  state.isRunning = true;
  console.log("[Custom Messages] Scheduler iniciado");
  return true;
}

/**
 * Parar o scheduler
 */
export function stopScheduler(): boolean {
  if (!state.isRunning) {
    console.log("[Custom Messages] Scheduler não está rodando");
    return false;
  }
  
  stopAllJobs();
  state.isRunning = false;
  console.log("[Custom Messages] Scheduler parado");
  return true;
}

/**
 * Obter status do scheduler
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  activeJobs: number;
  lastRefresh: Date | null;
  scheduledMessages: number[];
} {
  return {
    isRunning: state.isRunning,
    activeJobs: state.jobs.length,
    lastRefresh: state.lastRefresh,
    scheduledMessages: state.jobs.map(j => j.messageId),
  };
}

/**
 * Enviar mensagem manualmente (teste)
 */
export async function sendMessageManually(messageId: number): Promise<{ success: boolean; telegram: boolean; whatsapp: boolean }> {
  const db = await getDb();
  if (!db) {
    return { success: false, telegram: false, whatsapp: false };
  }

  try {
    const [message] = await db
      .select()
      .from(customMessages)
      .where(eq(customMessages.id, messageId))
      .limit(1);

    if (!message) {
      return { success: false, telegram: false, whatsapp: false };
    }

    // Ignorar verificação de dias para envio manual
    const originalDaysOfWeek = message.daysOfWeek;
    message.daysOfWeek = null;
    
    const result = await sendMessage(message);
    
    // Restaurar configuração original
    message.daysOfWeek = originalDaysOfWeek;

    return {
      success: result.telegram || result.whatsapp,
      ...result,
    };
  } catch (error) {
    console.error("[Custom Messages] Erro ao enviar mensagem manualmente:", error);
    return { success: false, telegram: false, whatsapp: false };
  }
}

// CRUD Operations

/**
 * Criar nova mensagem
 */
export async function createMessage(data: {
  title: string;
  content: string;
  scheduleTime: string;
  daysOfWeek?: number[];
  sendToTelegram?: boolean;
  sendToWhatsApp?: boolean;
  telegramGroupId?: string;
  whatsappGroupId?: string;
}): Promise<CustomMessage | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [newMessage] = await db
      .insert(customMessages)
      .values({
        title: data.title,
        content: data.content,
        scheduleTime: data.scheduleTime,
        daysOfWeek: data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : null,
        sendToTelegram: data.sendToTelegram ?? true,
        sendToWhatsApp: data.sendToWhatsApp ?? true,
        telegramGroupId: data.telegramGroupId || null,
        whatsappGroupId: data.whatsappGroupId || null,
        isActive: true,
        createdBy: 1,
      })
      .returning();

    // Recarregar scheduler se estiver rodando
    if (state.isRunning) {
      await refreshScheduler();
    }

    return newMessage;
  } catch (error) {
    console.error("[Custom Messages] Erro ao criar mensagem:", error);
    return null;
  }
}

/**
 * Atualizar mensagem
 */
export async function updateMessage(id: number, data: {
  title?: string;
  content?: string;
  scheduleTime?: string;
  daysOfWeek?: number[] | null;
  sendToTelegram?: boolean;
  sendToWhatsApp?: boolean;
  telegramGroupId?: string | null;
  whatsappGroupId?: string | null;
}): Promise<CustomMessage | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.scheduleTime !== undefined) updateData.scheduleTime = data.scheduleTime;
    if (data.daysOfWeek !== undefined) {
      updateData.daysOfWeek = data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : null;
    }
    if (data.sendToTelegram !== undefined) updateData.sendToTelegram = data.sendToTelegram;
    if (data.sendToWhatsApp !== undefined) updateData.sendToWhatsApp = data.sendToWhatsApp;
    if (data.telegramGroupId !== undefined) updateData.telegramGroupId = data.telegramGroupId;
    if (data.whatsappGroupId !== undefined) updateData.whatsappGroupId = data.whatsappGroupId;

    const [updatedMessage] = await db
      .update(customMessages)
      .set(updateData)
      .where(eq(customMessages.id, id))
      .returning();

    // Recarregar scheduler se estiver rodando
    if (state.isRunning) {
      await refreshScheduler();
    }

    return updatedMessage;
  } catch (error) {
    console.error("[Custom Messages] Erro ao atualizar mensagem:", error);
    return null;
  }
}

/**
 * Excluir mensagem
 */
export async function deleteMessage(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(customMessages)
      .where(eq(customMessages.id, id));

    // Recarregar scheduler se estiver rodando
    if (state.isRunning) {
      await refreshScheduler();
    }

    return true;
  } catch (error) {
    console.error("[Custom Messages] Erro ao excluir mensagem:", error);
    return false;
  }
}

/**
 * Ativar/Desativar mensagem
 */
export async function toggleMessage(id: number): Promise<CustomMessage | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar mensagem atual
    const [message] = await db
      .select()
      .from(customMessages)
      .where(eq(customMessages.id, id))
      .limit(1);

    if (!message) return null;

    // Inverter status
    const [updatedMessage] = await db
      .update(customMessages)
      .set({
        isActive: !message.isActive,
        updatedAt: new Date(),
      })
      .where(eq(customMessages.id, id))
      .returning();

    // Recarregar scheduler se estiver rodando
    if (state.isRunning) {
      await refreshScheduler();
    }

    return updatedMessage;
  } catch (error) {
    console.error("[Custom Messages] Erro ao alternar status:", error);
    return null;
  }
}

/**
 * Listar todas as mensagens
 */
export async function getAllMessages(): Promise<CustomMessage[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const messages = await db
      .select()
      .from(customMessages)
      .orderBy(customMessages.scheduleTime);
    
    return messages;
  } catch (error) {
    console.error("[Custom Messages] Erro ao listar mensagens:", error);
    return [];
  }
}

/**
 * Obter mensagem por ID
 */
export async function getMessageById(id: number): Promise<CustomMessage | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [message] = await db
      .select()
      .from(customMessages)
      .where(eq(customMessages.id, id))
      .limit(1);
    
    return message || null;
  } catch (error) {
    console.error("[Custom Messages] Erro ao buscar mensagem:", error);
    return null;
  }
}
