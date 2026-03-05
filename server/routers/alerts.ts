/**
 * Alerts Router - Rotas para gerenciamento de alertas automáticos
 * GvG e Relíquias com suporte a Telegram e WhatsApp
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as gvgScheduler from "../modules/gvgScheduler";
import * as reliquiasScheduler from "../modules/reliquiasScheduler";
import { sendWhatsAppGroupMessage, getWhatsAppGroups, getWhatsAppStatus } from "../whatsapp-web-client";
import { sendTelegramMessage } from "../telegram";
import { getBotConfig } from "../db";

// Admin-only check
const adminCheck = (role?: string) => {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem realizar esta ação" });
  }
};

export const alertsRouter = router({
  // ============ GvG ALERTS ============
  gvg: router({
    // Obter status do scheduler
    status: protectedProcedure.query(() => {
      return gvgScheduler.getSchedulerStatus();
    }),

    // Iniciar alertas automáticos
    start: protectedProcedure
      .input(z.object({
        whatsappGroupId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        const success = gvgScheduler.startHourlyAlerts(input.whatsappGroupId);
        return { success };
      }),

    // Parar alertas automáticos
    stop: protectedProcedure.mutation(async ({ ctx }) => {
      adminCheck(ctx.user.role);
      const success = gvgScheduler.stopAlerts();
      return { success };
    }),

    // Enviar alerta manual
    sendManual: protectedProcedure
      .input(z.object({
        type: z.enum(["escalacao", "escolha_adversarios", "custom"]),
        customMessage: z.string().optional(),
        platform: z.enum(["telegram", "whatsapp", "both"]).default("both"),
      }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        return gvgScheduler.sendManualAlert(input.type, input.customMessage, input.platform);
      }),

    // Configurar grupo do WhatsApp
    setWhatsAppGroup: protectedProcedure
      .input(z.object({ groupId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        gvgScheduler.setWhatsAppGroup(input.groupId);
        return { success: true };
      }),
  }),

  // ============ RELÍQUIAS ALERTS ============
  reliquias: router({
    // Obter status do scheduler
    status: protectedProcedure.query(() => {
      return reliquiasScheduler.getSchedulerStatus();
    }),

    // Iniciar alertas automáticos
    start: protectedProcedure
      .input(z.object({
        bossName: z.string(),
        eventTime: z.string().regex(/^\d{2}:\d{2}$/),
        whatsappGroupId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        const success = await reliquiasScheduler.startAutomaticAlerts(
          input.bossName,
          input.eventTime,
          input.whatsappGroupId
        );
        return { success };
      }),

    // Parar alertas automáticos
    stop: protectedProcedure.mutation(async ({ ctx }) => {
      adminCheck(ctx.user.role);
      const success = reliquiasScheduler.stopAlerts();
      return { success };
    }),

    // Enviar alerta manual
    sendManual: protectedProcedure
      .input(z.object({
        bossName: z.string(),
        minutesBefore: z.number().min(1).max(60),
        platform: z.enum(["telegram", "whatsapp", "both"]).default("both"),
      }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        return reliquiasScheduler.sendManualAlert(input.bossName, input.minutesBefore, input.platform);
      }),

    // Configurar grupo do WhatsApp
    setWhatsAppGroup: protectedProcedure
      .input(z.object({ groupId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        reliquiasScheduler.setWhatsAppGroup(input.groupId);
        return { success: true };
      }),

    // Configurar intervalos de alerta
    setIntervals: protectedProcedure
      .input(z.object({ intervals: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        reliquiasScheduler.setAlertIntervals(input.intervals);
        return { success: true };
      }),
  }),

  // ============ WHATSAPP GROUPS ============
  whatsappGroups: router({
    // Listar grupos do WhatsApp
    list: protectedProcedure.query(async () => {
      const status = getWhatsAppStatus();
      if (status.status !== "connected") {
        return { groups: [], connected: false };
      }
      
      const groups = await getWhatsAppGroups();
      return { groups, connected: true };
    }),

    // Enviar mensagem para grupo
    sendMessage: protectedProcedure
      .input(z.object({
        groupId: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        adminCheck(ctx.user.role);
        const success = await sendWhatsAppGroupMessage(input.groupId, input.message);
        return { success };
      }),
  }),

  // ============ SEND TO BOTH PLATFORMS ============
  sendToBoth: protectedProcedure
    .input(z.object({
      message: z.string(),
      whatsappGroupId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      adminCheck(ctx.user.role);
      
      const result = { telegram: false, whatsapp: false };

      // Telegram
      try {
        const botConfig = await getBotConfig();
        if (botConfig?.telegramGroupId && botConfig.isActive) {
          result.telegram = await sendTelegramMessage(botConfig.telegramGroupId, input.message, "HTML");
        }
      } catch (error) {
        console.error("[Alerts] Erro Telegram:", error);
      }

      // WhatsApp
      if (input.whatsappGroupId) {
        try {
          const status = getWhatsAppStatus();
          if (status.status === "connected") {
            result.whatsapp = await sendWhatsAppGroupMessage(input.whatsappGroupId, input.message);
          }
        } catch (error) {
          console.error("[Alerts] Erro WhatsApp:", error);
        }
      }

      return {
        success: result.telegram || result.whatsapp,
        ...result,
      };
    }),
});
