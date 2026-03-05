/**
 * Custom Messages Router - APIs para gerenciamento de mensagens personalizadas
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import * as customMessagesScheduler from "../modules/customMessagesScheduler";

export const customMessagesRouter = router({
  // Listar todas as mensagens
  list: protectedProcedure.query(async () => {
    try {
      const messages = await customMessagesScheduler.getAllMessages();
      return { success: true, data: messages };
    } catch (error) {
      console.error("[Custom Messages API] Erro ao listar:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao listar mensagens" });
    }
  }),

  // Obter mensagem por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const message = await customMessagesScheduler.getMessageById(input.id);
        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mensagem não encontrada" });
        }
        return { success: true, data: message };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Custom Messages API] Erro ao buscar:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar mensagem" });
      }
    }),

  // Criar nova mensagem
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Título é obrigatório"),
      content: z.string().min(1, "Conteúdo é obrigatório"),
      scheduleTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido (HH:mm)"),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      sendToTelegram: z.boolean().default(true),
      sendToWhatsApp: z.boolean().default(true),
      telegramGroupId: z.string().optional(),
      whatsappGroupId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Validar que pelo menos uma plataforma está selecionada
        if (!input.sendToTelegram && !input.sendToWhatsApp) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Selecione pelo menos uma plataforma" });
        }

        // Validar que se WhatsApp está ativo, tem um grupo selecionado
        if (input.sendToWhatsApp && !input.whatsappGroupId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Selecione um grupo do WhatsApp" });
        }

        const message = await customMessagesScheduler.createMessage({
          title: input.title,
          content: input.content,
          scheduleTime: input.scheduleTime,
          daysOfWeek: input.daysOfWeek,
          sendToTelegram: input.sendToTelegram,
          sendToWhatsApp: input.sendToWhatsApp,
          telegramGroupId: input.telegramGroupId,
          whatsappGroupId: input.whatsappGroupId,
        });

        if (!message) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar mensagem" });
        }

        return { success: true, data: message };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Custom Messages API] Erro ao criar:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar mensagem" });
      }
    }),

  // Atualizar mensagem
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      scheduleTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).nullable().optional(),
      sendToTelegram: z.boolean().optional(),
      sendToWhatsApp: z.boolean().optional(),
      telegramGroupId: z.string().nullable().optional(),
      whatsappGroupId: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        const message = await customMessagesScheduler.updateMessage(id, updateData);

        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mensagem não encontrada" });
        }

        return { success: true, data: message };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Custom Messages API] Erro ao atualizar:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar mensagem" });
      }
    }),

  // Excluir mensagem
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const success = await customMessagesScheduler.deleteMessage(input.id);

        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao excluir mensagem" });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Custom Messages API] Erro ao excluir:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao excluir mensagem" });
      }
    }),

  // Ativar/Desativar mensagem
  toggle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const message = await customMessagesScheduler.toggleMessage(input.id);

        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mensagem não encontrada" });
        }

        return { success: true, data: message };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Custom Messages API] Erro ao alternar status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao alternar status" });
      }
    }),

  // Enviar mensagem manualmente (teste)
  sendNow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await customMessagesScheduler.sendMessageManually(input.id);

        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar mensagem" });
        }

        return {
          success: true,
          telegram: result.telegram,
          whatsapp: result.whatsapp,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Custom Messages API] Erro ao enviar:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar mensagem" });
      }
    }),

  // Status do scheduler
  schedulerStatus: protectedProcedure.query(() => {
    return customMessagesScheduler.getSchedulerStatus();
  }),

  // Iniciar scheduler
  startScheduler: protectedProcedure.mutation(async () => {
    try {
      const started = await customMessagesScheduler.startScheduler();
      return { success: started };
    } catch (error) {
      console.error("[Custom Messages API] Erro ao iniciar scheduler:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao iniciar scheduler" });
    }
  }),

  // Parar scheduler
  stopScheduler: protectedProcedure.mutation(() => {
    try {
      const stopped = customMessagesScheduler.stopScheduler();
      return { success: stopped };
    } catch (error) {
      console.error("[Custom Messages API] Erro ao parar scheduler:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao parar scheduler" });
    }
  }),

  // Recarregar scheduler
  refreshScheduler: protectedProcedure.mutation(async () => {
    try {
      const result = await customMessagesScheduler.refreshScheduler();
      return result;
    } catch (error) {
      console.error("[Custom Messages API] Erro ao recarregar scheduler:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao recarregar scheduler" });
    }
  }),
});
