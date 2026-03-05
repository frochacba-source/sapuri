/**
 * GvG Scheduler - Sistema de avisos automáticos para GvG
 * Envia mensagens no Telegram e WhatsApp em intervalos configurados
 */

import * as cron from "node-cron";
import { sendTelegramMessage } from "../telegram";
import { sendWhatsAppGroupMessage, getWhatsAppStatus } from "../whatsapp-web-client";
import { getDb, getBotConfig } from "../db";
import { schedules, members, scheduleEntries, eventTypes } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

// Estado do scheduler
interface SchedulerState {
  isRunning: boolean;
  hourlyJob: cron.ScheduledTask | null;
  message1330Job: cron.ScheduledTask | null;
  lastExecution: Date | null;
  whatsappGroupId: string | null;
}

const state: SchedulerState = {
  isRunning: false,
  hourlyJob: null,
  message1330Job: null,
  lastExecution: null,
  whatsappGroupId: null,
};

/**
 * Buscar membros escalados para GvG no dia atual
 */
async function getEscaladosHoje(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const today = format(new Date(), "yyyy-MM-dd");
    
    // Buscar evento GvG
    const gvgEvent = await db
      .select()
      .from(eventTypes)
      .where(eq(eventTypes.name, "gvg"))
      .limit(1);
    
    if (!gvgEvent.length) return [];

    // Buscar escalação do dia
    const todaySchedule = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.eventTypeId, gvgEvent[0].id),
          eq(schedules.eventDate, today)
        )
      )
      .limit(1);

    if (!todaySchedule.length) return [];

    // Buscar membros da escalação
    const scheduledMembers = await db
      .select({
        memberName: members.name,
      })
      .from(scheduleEntries)
      .innerJoin(members, eq(scheduleEntries.memberId, members.id))
      .where(eq(scheduleEntries.scheduleId, todaySchedule[0].id));

    return scheduledMembers.map((m) => m.memberName);
  } catch (error) {
    console.error("[GvG Scheduler] Erro ao buscar escalados:", error);
    return [];
  }
}

/**
 * Enviar mensagem de aviso para Telegram e WhatsApp
 */
async function sendGvgAlert(message: string, platform: "telegram" | "whatsapp" | "both"): Promise<{ telegram: boolean; whatsapp: boolean }> {
  const result = { telegram: false, whatsapp: false };

  // Enviar para Telegram
  if (platform === "telegram" || platform === "both") {
    try {
      const botConfig = await getBotConfig();
      if (botConfig?.telegramGroupId && botConfig.isActive) {
        result.telegram = await sendTelegramMessage(botConfig.telegramGroupId, message, "HTML");
        console.log(`[GvG Scheduler] Telegram: ${result.telegram ? "enviado" : "falhou"}`);
      }
    } catch (error) {
      console.error("[GvG Scheduler] Erro ao enviar para Telegram:", error);
    }
  }

  // Enviar para WhatsApp
  if (platform === "whatsapp" || platform === "both") {
    try {
      const whatsappStatus = getWhatsAppStatus();
      if (whatsappStatus.status === "connected" && state.whatsappGroupId) {
        result.whatsapp = await sendWhatsAppGroupMessage(state.whatsappGroupId, message);
        console.log(`[GvG Scheduler] WhatsApp: ${result.whatsapp ? "enviado" : "falhou"}`);
      }
    } catch (error) {
      console.error("[GvG Scheduler] Erro ao enviar para WhatsApp:", error);
    }
  }

  state.lastExecution = new Date();
  return result;
}

/**
 * Gerar mensagem de escalação
 */
function gerarMensagemEscalacao(escalados: string[]): string {
  const hora = format(new Date(), "HH:mm");
  
  if (escalados.length === 0) {
    return `⚔️ *GvG - AVISO* ⚔️\n\n⏰ ${hora}\n\n❌ Nenhum membro escalado para hoje.`;
  }

  return `⚔️ *GvG - ESCALAÇÃO DE HOJE* ⚔️\n\n⏰ Horário: ${hora}\n\n👥 *Membros escalados (${escalados.length}):*\n${escalados.map((n) => `• ${n}`).join("\n")}\n\n💪 Preparem-se para a guerra!`;
}

/**
 * Gerar mensagem de 13:30 para escolha de adversários
 */
function gerarMensagem1330(): string {
  return `⚔️ *GvG - ESCOLHA DE ADVERSÁRIOS* ⚔️

Pessoal, escolham seus adversários e arrumem as defesas para teste.

📝 *Coloque os números um abaixo do outro, do 1 ao 20:*

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20

⏰ Horário: 13:30`;
}

/**
 * Iniciar avisos automáticos de hora em hora
 */
export function startHourlyAlerts(whatsappGroupId?: string): boolean {
  if (state.isRunning) {
    console.log("[GvG Scheduler] Já está em execução");
    return false;
  }

  state.whatsappGroupId = whatsappGroupId || null;

  // Aviso de hora em hora (das 13:00 às 22:00)
  state.hourlyJob = cron.schedule("0 13-22 * * *", async () => {
    console.log("[GvG Scheduler] Executando aviso de hora em hora");
    const escalados = await getEscaladosHoje();
    const message = gerarMensagemEscalacao(escalados);
    await sendGvgAlert(message, "both");
  });

  // Mensagem especial às 13:30
  state.message1330Job = cron.schedule("30 13 * * *", async () => {
    console.log("[GvG Scheduler] Executando aviso das 13:30");
    const message = gerarMensagem1330();
    await sendGvgAlert(message, "both");
  });

  state.isRunning = true;
  console.log("[GvG Scheduler] Avisos automáticos iniciados");
  return true;
}

/**
 * Parar avisos automáticos
 */
export function stopAlerts(): boolean {
  if (!state.isRunning) {
    console.log("[GvG Scheduler] Não está em execução");
    return false;
  }

  if (state.hourlyJob) {
    state.hourlyJob.stop();
    state.hourlyJob = null;
  }

  if (state.message1330Job) {
    state.message1330Job.stop();
    state.message1330Job = null;
  }

  state.isRunning = false;
  console.log("[GvG Scheduler] Avisos automáticos parados");
  return true;
}

/**
 * Enviar aviso manual
 */
export async function sendManualAlert(
  type: "escalacao" | "escolha_adversarios" | "custom",
  customMessage?: string,
  platform: "telegram" | "whatsapp" | "both" = "both"
): Promise<{ success: boolean; telegram: boolean; whatsapp: boolean }> {
  let message: string;

  switch (type) {
    case "escalacao":
      const escalados = await getEscaladosHoje();
      message = gerarMensagemEscalacao(escalados);
      break;
    case "escolha_adversarios":
      message = gerarMensagem1330();
      break;
    case "custom":
      message = customMessage || "";
      break;
    default:
      return { success: false, telegram: false, whatsapp: false };
  }

  if (!message) {
    return { success: false, telegram: false, whatsapp: false };
  }

  const result = await sendGvgAlert(message, platform);
  return {
    success: result.telegram || result.whatsapp,
    ...result,
  };
}

/**
 * Obter status do scheduler
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  lastExecution: Date | null;
  whatsappGroupId: string | null;
} {
  return {
    isRunning: state.isRunning,
    lastExecution: state.lastExecution,
    whatsappGroupId: state.whatsappGroupId,
  };
}

/**
 * Configurar grupo do WhatsApp
 */
export function setWhatsAppGroup(groupId: string): void {
  state.whatsappGroupId = groupId;
  console.log(`[GvG Scheduler] WhatsApp Group configurado: ${groupId}`);
}
