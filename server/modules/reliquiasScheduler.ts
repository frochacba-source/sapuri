/**
 * Relíquias Scheduler - Sistema de avisos automáticos para Relíquias
 * Envia mensagens no Telegram e WhatsApp em intervalos específicos antes do evento
 */

import * as cron from "node-cron";
import { sendTelegramMessage } from "../telegram";
import { sendWhatsAppGroupMessage, getWhatsAppStatus } from "../whatsapp-web-client";
import { getDb, getBotConfig } from "../db";
import { reliquiasSeasons, reliquiasMemberAssignments, members } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { format, addMinutes, differenceInMinutes, parse, setHours, setMinutes } from "date-fns";

// Estado do scheduler
interface SchedulerState {
  isRunning: boolean;
  jobs: cron.ScheduledTask[];
  lastExecution: Date | null;
  whatsappGroupId: string | null;
  eventTime: string; // Formato HH:mm
  alertIntervals: number[]; // Minutos antes do evento
}

const state: SchedulerState = {
  isRunning: false,
  jobs: [],
  lastExecution: null,
  whatsappGroupId: null,
  eventTime: "15:00", // Horário padrão do evento
  alertIntervals: [60, 30, 15, 10, 5, 1], // 1h, 30min, 15min, 10min, 5min, 1min
};

// Boss configuration
const BOSSES = [
  { name: "Orfeu", icon: "🎸" },
  { name: "Radamantis", icon: "⚔️" },
  { name: "Pandora", icon: "🎭" },
  { name: "Gêmeos", icon: "♊" },
];

/**
 * Buscar temporada ativa
 */
async function getActiveSeason(): Promise<{ id: number; name: string } | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const activeSeason = await db
      .select()
      .from(reliquiasSeasons)
      .where(eq(reliquiasSeasons.isActive, true))
      .limit(1);

    return activeSeason.length > 0 ? { id: activeSeason[0].id, name: activeSeason[0].name } : null;
  } catch (error) {
    console.error("[Relíquias Scheduler] Erro ao buscar temporada ativa:", error);
    return null;
  }
}

/**
 * Buscar atribuições de membros para um boss
 */
async function getMemberAssignments(seasonId: number, bossName: string): Promise<{
  bossAttackers: string[];
  guardsAttackers: Array<{ name: string; guards: number[] }>;
}> {
  const db = await getDb();
  if (!db) return { bossAttackers: [], guardsAttackers: [] };

  try {
    const assignments = await db
      .select({
        memberName: members.name,
        role: reliquiasMemberAssignments.role,
        guard1: reliquiasMemberAssignments.guard1Number,
        guard2: reliquiasMemberAssignments.guard2Number,
      })
      .from(reliquiasMemberAssignments)
      .innerJoin(members, eq(reliquiasMemberAssignments.memberId, members.id))
      .where(
        and(
          eq(reliquiasMemberAssignments.seasonId, seasonId),
          eq(reliquiasMemberAssignments.bossName, bossName)
        )
      );

    const bossAttackers = assignments
      .filter((a) => a.role === "boss")
      .map((a) => a.memberName);

    const guardsAttackers = assignments
      .filter((a) => a.role === "guards")
      .map((a) => ({
        name: a.memberName,
        guards: [a.guard1, a.guard2].filter((g): g is number => g != null),
      }));

    return { bossAttackers, guardsAttackers };
  } catch (error) {
    console.error("[Relíquias Scheduler] Erro ao buscar atribuições:", error);
    return { bossAttackers: [], guardsAttackers: [] };
  }
}

/**
 * Enviar mensagem para Telegram e/ou WhatsApp
 */
async function sendReliquiasAlert(
  message: string,
  platform: "telegram" | "whatsapp" | "both"
): Promise<{ telegram: boolean; whatsapp: boolean }> {
  const result = { telegram: false, whatsapp: false };

  // Enviar para Telegram
  if (platform === "telegram" || platform === "both") {
    try {
      const botConfig = await getBotConfig();
      if (botConfig?.telegramGroupId && botConfig.isActive) {
        result.telegram = await sendTelegramMessage(botConfig.telegramGroupId, message, "HTML");
        console.log(`[Relíquias Scheduler] Telegram: ${result.telegram ? "enviado" : "falhou"}`);
      }
    } catch (error) {
      console.error("[Relíquias Scheduler] Erro ao enviar para Telegram:", error);
    }
  }

  // Enviar para WhatsApp
  if (platform === "whatsapp" || platform === "both") {
    try {
      const whatsappStatus = getWhatsAppStatus();
      if (whatsappStatus.status === "connected" && state.whatsappGroupId) {
        result.whatsapp = await sendWhatsAppGroupMessage(state.whatsappGroupId, message);
        console.log(`[Relíquias Scheduler] WhatsApp: ${result.whatsapp ? "enviado" : "falhou"}`);
      }
    } catch (error) {
      console.error("[Relíquias Scheduler] Erro ao enviar para WhatsApp:", error);
    }
  }

  state.lastExecution = new Date();
  return result;
}

/**
 * Gerar mensagem de aviso de relíquias
 */
function gerarMensagemReliquias(
  bossName: string,
  minutesBefore: number,
  bossAttackers: string[],
  guardsAttackers: Array<{ name: string; guards: number[] }>
): string {
  const bossConfig = BOSSES.find((b) => b.name === bossName);
  const icon = bossConfig?.icon || "👹";

  const timeLabel = minutesBefore === 60 
    ? "1 hora" 
    : minutesBefore === 1 
      ? "1 minuto" 
      : `${minutesBefore} minutos`;

  let message = `⏰ *RELÍQUIAS - ${icon} ${bossName} em ${timeLabel}!*\n\n`;

  // Boss attackers
  message += `🎯 *Atacando Boss (${bossAttackers.length}):*\n`;
  if (bossAttackers.length > 0) {
    message += bossAttackers.map((n) => `⚔️ ${n}`).join("\n");
  } else {
    message += "Nenhum";
  }

  message += "\n\n";

  // Guards attackers
  message += `🛡️ *Atacando Guardas (${guardsAttackers.length}):*\n`;
  if (guardsAttackers.length > 0) {
    message += guardsAttackers
      .map((m) => {
        const guardsList = m.guards.length > 0 ? ` (Guardas: ${m.guards.join(", ")})` : "";
        return `🛡️ ${m.name}${guardsList}`;
      })
      .join("\n");
  } else {
    message += "Nenhum";
  }

  message += "\n\n💪 Preparem-se!";

  return message;
}

/**
 * Calcular horários de alerta baseados no horário do evento
 */
function calculateAlertTimes(eventTime: string, intervals: number[]): Date[] {
  const today = new Date();
  const [hours, minutes] = eventTime.split(":").map(Number);
  const eventDate = setMinutes(setHours(today, hours), minutes);

  return intervals.map((interval) => addMinutes(eventDate, -interval));
}

/**
 * Criar jobs de cron para os intervalos
 */
function createCronJobs(bossName: string, seasonId: number): void {
  // Limpar jobs existentes
  state.jobs.forEach((job) => job.stop());
  state.jobs = [];

  const alertTimes = calculateAlertTimes(state.eventTime, state.alertIntervals);
  const now = new Date();

  alertTimes.forEach((alertTime, index) => {
    const interval = state.alertIntervals[index];
    
    // Só criar job se o horário ainda não passou
    if (alertTime > now) {
      const cronExpression = `${alertTime.getMinutes()} ${alertTime.getHours()} * * *`;
      
      const job = cron.schedule(cronExpression, async () => {
        console.log(`[Relíquias Scheduler] Executando aviso ${interval} minutos antes`);
        const { bossAttackers, guardsAttackers } = await getMemberAssignments(seasonId, bossName);
        const message = gerarMensagemReliquias(bossName, interval, bossAttackers, guardsAttackers);
        await sendReliquiasAlert(message, "both");
      });

      state.jobs.push(job);
      console.log(`[Relíquias Scheduler] Job criado para ${format(alertTime, "HH:mm")} (${interval}min antes)`);
    }
  });
}

/**
 * Iniciar avisos automáticos
 */
export async function startAutomaticAlerts(
  bossName: string,
  eventTime: string,
  whatsappGroupId?: string
): Promise<boolean> {
  const season = await getActiveSeason();
  if (!season) {
    console.log("[Relíquias Scheduler] Nenhuma temporada ativa");
    return false;
  }

  if (state.isRunning) {
    stopAlerts();
  }

  state.eventTime = eventTime;
  state.whatsappGroupId = whatsappGroupId || null;

  createCronJobs(bossName, season.id);

  state.isRunning = true;
  console.log(`[Relíquias Scheduler] Avisos automáticos iniciados para ${bossName} às ${eventTime}`);
  return true;
}

/**
 * Parar avisos automáticos
 */
export function stopAlerts(): boolean {
  if (!state.isRunning && state.jobs.length === 0) {
    console.log("[Relíquias Scheduler] Não está em execução");
    return false;
  }

  state.jobs.forEach((job) => job.stop());
  state.jobs = [];
  state.isRunning = false;

  console.log("[Relíquias Scheduler] Avisos automáticos parados");
  return true;
}

/**
 * Enviar aviso manual
 */
export async function sendManualAlert(
  bossName: string,
  minutesBefore: number,
  platform: "telegram" | "whatsapp" | "both" = "both"
): Promise<{ success: boolean; telegram: boolean; whatsapp: boolean }> {
  const season = await getActiveSeason();
  if (!season) {
    return { success: false, telegram: false, whatsapp: false };
  }

  const { bossAttackers, guardsAttackers } = await getMemberAssignments(season.id, bossName);
  const message = gerarMensagemReliquias(bossName, minutesBefore, bossAttackers, guardsAttackers);

  const result = await sendReliquiasAlert(message, platform);
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
  eventTime: string;
  alertIntervals: number[];
  activeJobs: number;
} {
  return {
    isRunning: state.isRunning,
    lastExecution: state.lastExecution,
    whatsappGroupId: state.whatsappGroupId,
    eventTime: state.eventTime,
    alertIntervals: state.alertIntervals,
    activeJobs: state.jobs.length,
  };
}

/**
 * Configurar grupo do WhatsApp
 */
export function setWhatsAppGroup(groupId: string): void {
  state.whatsappGroupId = groupId;
  console.log(`[Relíquias Scheduler] WhatsApp Group configurado: ${groupId}`);
}

/**
 * Configurar intervalos de alerta
 */
export function setAlertIntervals(intervals: number[]): void {
  state.alertIntervals = intervals.sort((a, b) => b - a);
  console.log(`[Relíquias Scheduler] Intervalos configurados: ${intervals.join(", ")} minutos`);
}
