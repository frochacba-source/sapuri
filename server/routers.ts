import { COOKIE_NAME } from "@shared/const";
import { getBotHealth, resurrectBot } from "./_core/botHeartbeat";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { 
  sendScheduleNotification, 
  sendAnnouncementNotification, 
  sendGeneralAnnouncement,
  sendPrivateMessages,
  sendNonAttackerAlert,
  sendGvgResultsSummary,
  sendGotResultsSummary,
  sendReliquiasReminder,
  testBotConnection, 
  validateBotToken, 
  validateBotUsername,
  sendAutomaticGotReminder,
  sendWhatsAppMessages,
  validateWhatsAppToken
} from "./telegram";
import { analyzeGvgScreenshot, analyzeGotScreenshot, analyzeReliquiasScreenshot, matchPlayerToMember } from "./imageAnalysis";
import { sendWhatsAppGroupMessage, getWhatsAppStatus as getWhatsAppStatusReal, getWhatsAppGroups } from "./whatsapp-web-client";
import { invokeLLM } from "./_core/llm";
import { recommendationsRouter } from "./routers/recommendations";
import { aiChatRouter } from "./routers/aiChat";
import { arayashikiAnalysisRouter } from "./routers/arayashikiAnalysis";
import { arayashikiSyncRouter } from "./routers/arayashikiSync";
import { cardAnalysisRouter } from "./routers/cardAnalysis";
import { accountsRouter } from "./routers/accounts";
import { alertsRouter } from "./routers/alerts";
import { customMessagesRouter } from "./routers/customMessages";
import { exportStrategies, validateImportFile, parseImportFile, getImportStats } from "./exportImport";
import { backupGotStrategy, backupGvgStrategy } from "./strategyBackup";
import { storagePut } from "./storage";
import {
  initializeWhatsAppClient,
  sendWhatsAppMessage,
  sendWhatsAppMentionMessage,
  sendGotReminder,
  getWhatsAppStatus,
  disconnectWhatsApp,
  clearWhatsAppSession,
  getCurrentQRCode,
} from "./whatsapp";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores podem realizar esta ação' });
  }
  return next({ ctx });
});

// Admin or SubAdmin procedure (can manage schedules and announcements)
const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'subadmin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  alerts: alertsRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ SUB-ADMINS ============
  subAdmins: router({
    list: adminProcedure.query(async () => {
      return db.getAllSubAdmins();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        username: z.string().min(3).max(50),
        password: z.string().min(4).max(50),
        canManageGvg: z.boolean().default(false),
        canManageGot: z.boolean().default(false),
        canManageReliquias: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getSubAdminByUsername(input.username);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Username já existe' });
        }
        await db.createSubAdmin(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        password: z.string().min(4).max(50).optional(),
        canManageGvg: z.boolean().optional(),
        canManageGot: z.boolean().optional(),
        canManageReliquias: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSubAdmin(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSubAdmin(input.id);
        return { success: true };
      }),
    
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const subAdmin = await db.getSubAdminByUsername(input.username);
        if (!subAdmin || subAdmin.password !== input.password || !subAdmin.isActive) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
        }
        return {
          success: true,
          subAdmin: {
            id: subAdmin.id,
            name: subAdmin.name,
            canManageGvg: subAdmin.canManageGvg,
            canManageGot: subAdmin.canManageGot,
            canManageReliquias: subAdmin.canManageReliquias,
          },
        };
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ MEMBERS ============
  members: router({
    list: protectedProcedure.query(async () => {
      return db.getAllMembers();
    }),
    
    listActive: protectedProcedure.query(async () => {
      return db.getActiveMembers();
    }),
    
    listByEvent: protectedProcedure
      .input(z.object({ eventName: z.string() }))
      .query(async ({ input }) => {
        return db.getMembersByEvent(input.eventName);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMemberById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        telegramId: z.string().max(100).optional(),
        telegramUsername: z.string().max(100).optional(),
        phoneNumber: z.string().max(20).optional(),
        participatesGvg: z.boolean().default(true),
        participatesGot: z.boolean().default(true),
        participatesReliquias: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const count = await db.getMemberCount();
        if (count >= 75) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Limite de 75 membros atingido' });
        }
        await db.createMember(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        telegramId: z.string().max(100).optional(),
        telegramUsername: z.string().max(100).optional(),
        phoneNumber: z.string().max(20).optional(),
        participatesGvg: z.boolean().optional(),
        participatesGot: z.boolean().optional(),
        participatesReliquias: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMember(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMember(input.id);
        return { success: true };
      }),
    
    count: protectedProcedure.query(async () => {
      return db.getMemberCount();
    }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ EVENT TYPES ============
  eventTypes: router({
    list: protectedProcedure.query(async () => {
      return db.getAllEventTypes();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getEventTypeById(input.id);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        displayName: z.string().min(1).max(100).optional(),
        maxPlayers: z.number().min(1).max(100).optional(),
        eventTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        reminderMinutes: z.number().min(5).max(120).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEventType(id, data);
        return { success: true };
      }),
    
    seed: adminProcedure.mutation(async () => {
      await db.seedDefaultEventTypes();
      return { success: true };
    }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ SCHEDULES ============
  schedules: router({
    getByEventAndDate: protectedProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .query(async ({ input }) => {
        const schedule = await db.getScheduleByEventAndDate(input.eventTypeId, input.eventDate);
        if (!schedule) return null;
        
        const entries = await db.getEntriesBySchedule(schedule.id);
        return {
          ...schedule,
          members: entries.map(e => e.member),
        };
      }),
    
    save: managerProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        memberIds: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        const eventType = await db.getEventTypeById(input.eventTypeId);
        if (!eventType) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Tipo de evento não encontrado' });
        }
        
        if (input.memberIds.length > eventType.maxPlayers) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: `Máximo de ${eventType.maxPlayers} jogadores para ${eventType.displayName}` 
          });
        }
        
        // Criar escalacao simples
        const scheduleId = await db.createSchedule({
          eventTypeId: input.eventTypeId,
          eventDate: input.eventDate,
          createdBy: ctx.user.id,
        });
        
        for (let index = 0; index < input.memberIds.length; index++) {
          const memberId = input.memberIds[index];
          await db.addScheduleEntry({ scheduleId, memberId, order: index + 1 });
        }
        
        return { success: true, scheduleId };
      }),
    
    sendNotification: managerProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ input }) => {
        const schedule = await db.getScheduleByEventAndDate(input.eventTypeId, input.eventDate);
        if (!schedule) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Escalação não encontrada' });
        }
        
        const eventType = await db.getEventTypeById(input.eventTypeId);
        if (!eventType) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Tipo de evento não encontrado' });
        }
        
        const entries = await db.getEntriesBySchedule(schedule.id);
        const memberNames = entries.map(e => e.member.name);
        
        const success = await sendScheduleNotification(
          eventType.displayName,
          eventType.eventTime,
          memberNames
        );
        
        if (success) {
          await db.updateSchedule(schedule.id, { notificationSent: true });
        }
        
        return { success };
      }),
    
    sendWhatsAppNotification: managerProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        groupId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const schedule = await db.getScheduleByEventAndDate(input.eventTypeId, input.eventDate);
        if (!schedule) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Escalação não encontrada' });
        }
        
        const eventType = await db.getEventTypeById(input.eventTypeId);
        if (!eventType) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Tipo de evento não encontrado' });
        }
        
        // Verificar status do WhatsApp
        const whatsappStatus = getWhatsAppStatusReal();
        if (whatsappStatus.status !== 'connected') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'WhatsApp não está conectado. Configure na página de Configuração WhatsApp.' });
        }
        
        // Buscar grupos se não foi especificado
        let targetGroupId = input.groupId;
        if (!targetGroupId) {
          const groups = await getWhatsAppGroups();
          if (groups.length === 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nenhum grupo WhatsApp disponível' });
          }
          // Usar o primeiro grupo disponível
          targetGroupId = groups[0].id;
        }
        
        const entries = await db.getEntriesBySchedule(schedule.id);
        const memberNames = entries.map(e => e.member.name);
        
        // Formatar mensagem para WhatsApp
        const memberList = memberNames.map((name, i) => `${i + 1}. ${name}`).join("\n");
        const formattedDate = new Date(input.eventDate + 'T12:00:00').toLocaleDateString('pt-BR');
        
        const message = `⚔️ *${eventType.displayName} - ESCALAÇÃO*
📅 *Data:* ${formattedDate}
⏰ *Horário:* ${eventType.eventTime}

🛡️ *Escalados salvem suas defesas!*
${memberList}

✅ Confirme sua presença!`;
        
        const success = await sendWhatsAppGroupMessage(targetGroupId, message);
        
        if (!success) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao enviar mensagem para o WhatsApp' });
        }
        
        return { success: true };
      }),
    
    getWhatsAppGroups: managerProcedure
      .query(async () => {
        const whatsappStatus = getWhatsAppStatusReal();
        if (whatsappStatus.status !== 'connected') {
          return [];
        }
        return await getWhatsAppGroups();
      }),
    
    history: protectedProcedure
      .input(z.object({
        eventTypeId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        const history = await db.getScheduleHistory(
          input.eventTypeId,
          input.startDate,
          input.endDate,
          input.limit
        );
        
        const result = await Promise.all(
          history.map(async (item) => {
            const entries = await db.getEntriesBySchedule(item.schedule.id);
            return {
              ...item.schedule,
              eventType: item.eventType,
              members: entries.map(e => e.member),
            };
          })
        );
        
        return result;
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ ANNOUNCEMENTS ============
  announcements: router({
    list: protectedProcedure
      .input(z.object({
        eventTypeId: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        if (input.eventTypeId) {
          const announcements = await db.getAnnouncementsByEvent(input.eventTypeId, input.limit);
          const result = await Promise.all(
            announcements.map(async (ann) => {
              const recipients = await db.getAnnouncementRecipients(ann.id);
              return {
                ...ann,
                recipients: recipients.map(r => r.member),
              };
            })
          );
          return result;
        } else {
          // Get general announcements
          const announcements = await db.getGeneralAnnouncements(input.limit);
          return announcements.map(ann => ({
            ...ann,
            recipients: [],
          }));
        }
      }),
    
    create: managerProcedure
      .input(z.object({
        eventTypeId: z.number().optional(),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(2000),
        memberIds: z.array(z.number()).default([]),
        sendNow: z.boolean().default(false),
        isGeneral: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        let announcementId: number;
        
        if (input.isGeneral || !input.eventTypeId) {
          // General announcement (no event, no specific members)
          announcementId = await db.createGeneralAnnouncement({
            title: input.title,
            message: input.message,
            createdBy: ctx.user.id,
            isGeneral: true,
          });
          
          if (input.sendNow) {
            await sendGeneralAnnouncement(input.title, input.message);
          }
        } else {
          // Event-specific announcement
          announcementId = await db.createAnnouncement({
            eventTypeId: input.eventTypeId,
            title: input.title,
            message: input.message,
            createdBy: ctx.user.id,
          });
          
          // Add recipients
          for (const memberId of input.memberIds) {
            await db.addAnnouncementRecipient({ announcementId, memberId });
          }
          
          if (input.sendNow && input.memberIds.length > 0) {
            const members = await Promise.all(
              input.memberIds.map(id => db.getMemberById(id))
            );
            const memberNames = members.filter(m => m).map(m => m!.name);
            
            await sendAnnouncementNotification(
              input.title,
              input.message,
              memberNames
            );
            
            await db.updateAnnouncementSentAt(announcementId);
          } else if (input.sendNow) {
            // Send without member list
            await sendGeneralAnnouncement(input.title, input.message);
            await db.updateAnnouncementSentAt(announcementId);
          }
        }
        
        return { success: true, announcementId };
      }),
    
    // Send private messages to selected members
    sendPrivate: managerProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(2000),
        memberIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        const members = await Promise.all(
          input.memberIds.map(id => db.getMemberById(id))
        );
        
        const membersWithChatId = members
          .filter(m => m && m.telegramChatId)
          .map(m => ({ chatId: m!.telegramChatId!, name: m!.name }));
        
        if (membersWithChatId.length === 0) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Nenhum membro selecionado tem chat ID do Telegram configurado' 
          });
        }
        
        const fullMessage = `📢 ${input.title}\n\n${input.message}`;
        const result = await sendPrivateMessages(membersWithChatId, fullMessage);
        
        return { 
          success: true, 
          sent: result.success, 
          failed: result.failed,
          total: membersWithChatId.length 
        };
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ GVG ATTACKS ============
  gvgAttacks: router({
    getBySchedule: protectedProcedure
      .input(z.object({ scheduleId: z.number() }))
      .query(async ({ input }) => {
        return db.getGvgAttacksBySchedule(input.scheduleId);
      }),
    
    getByDate: protectedProcedure
      .input(z.object({ eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .query(async ({ input }) => {
        return db.getGvgAttacksByDate(input.eventDate);
      }),
    
    save: managerProcedure
      .input(z.object({
        scheduleId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        attacks: z.array(z.object({
          memberId: z.number(),
          attack1Stars: z.number().min(0).max(3).default(0),
          attack1Missed: z.boolean().default(false),
          attack1Opponent: z.string().optional(),
          attack2Stars: z.number().min(0).max(3).default(0),
          attack2Missed: z.boolean().default(false),
          attack2Opponent: z.string().optional(),
          didNotAttack: z.boolean().default(false),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const attacks = input.attacks.map(a => ({
          ...a,
          scheduleId: input.scheduleId,
          eventDate: input.eventDate,
          createdBy: ctx.user.id,
        }));
        
        await db.bulkUpsertGvgAttacks(attacks);
        return { success: true };
      }),
    
    getMatchInfo: protectedProcedure
      .input(z.object({ eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .query(async ({ input }) => {
        return db.getGvgMatchInfo(input.eventDate);
      }),
    
    saveMatchInfo: managerProcedure
      .input(z.object({
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        opponentGuild: z.string().optional(),
        ourScore: z.number().min(0).max(60).default(0),
        opponentScore: z.number().min(0).max(60).default(0),
        validStars: z.number().min(0).max(60).default(0),
      }))
      .mutation(async ({ input }) => {
        await db.saveGvgMatchInfo(input);
        return { success: true };
      }),
    
    getMatchHistory: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
      .query(async ({ input }) => {
        return db.getGvgMatchHistory(input.limit);
      }),
    
    getEvolutionData: protectedProcedure
      .input(z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }))
      .query(async ({ input }) => {
        return db.getGvgEvolutionData(input.startDate, input.endDate);
      }),
    
    getNonAttackers: protectedProcedure
      .input(z.object({ scheduleId: z.number() }))
      .query(async ({ input }) => {
        return db.getGvgNonAttackers(input.scheduleId);
      }),
    
    sendNonAttackerAlert: managerProcedure
      .input(z.object({
        scheduleId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ input }) => {
        const nonAttackers = await db.getGvgNonAttackers(input.scheduleId);
        const names = nonAttackers.map(na => na.member.name);
        
        if (names.length === 0) {
          return { success: true, message: 'Todos atacaram!' };
        }
        
        const success = await sendNonAttackerAlert('GvG', input.eventDate, names);
        return { success, count: names.length };
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ GOT ATTACKS ============
  gotAttacks: router({
    getBySchedule: protectedProcedure
      .input(z.object({ scheduleId: z.number() }))
      .query(async ({ input }) => {
        return db.getGotAttacksBySchedule(input.scheduleId);
      }),
    
    getByDate: protectedProcedure
      .input(z.object({ eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .query(async ({ input }) => {
        return db.getGotAttacksByDate(input.eventDate);
      }),
    
    save: managerProcedure
      .input(z.object({
        scheduleId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        attacks: z.array(z.object({
          memberId: z.number(),
          ranking: z.number().optional(),
          power: z.string().optional(),
          attackVictories: z.number().min(0).default(0),
          attackDefeats: z.number().min(0).default(0),
          defenseVictories: z.number().min(0).default(0),
          defenseDefeats: z.number().min(0).default(0),
          points: z.number().min(0).default(0),
          didNotAttack: z.boolean().default(false),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const attacks = input.attacks.map(a => ({
          ...a,
          scheduleId: input.scheduleId,
          eventDate: input.eventDate,
          createdBy: ctx.user.id,
        }));
        
        await db.bulkUpsertGotAttacks(attacks);
        return { success: true };
      }),
    
    getNonAttackers: protectedProcedure
      .input(z.object({ scheduleId: z.number() }))
      .query(async ({ input }) => {
        return db.getGotNonAttackers(input.scheduleId);
      }),
    
    getPreviousPoints: protectedProcedure
      .input(z.object({ eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .query(async ({ input }) => {
        return db.getGotPreviousPoints(input.eventDate);
      }),
    
    sendNonAttackerAlert: managerProcedure
      .input(z.object({
        scheduleId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ input }) => {
        const nonAttackers = await db.getGotNonAttackers(input.scheduleId);
        const names = nonAttackers.map(na => na.member.name);
        
        if (names.length === 0) {
          return { success: true, message: 'Todos atacaram!' };
        }
        
        const success = await sendNonAttackerAlert('GoT', input.eventDate, names);
        return { success, count: names.length };
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ SCREENSHOT ANALYSIS ============
  screenshots: router({
    analyzeGvg: managerProcedure
      .input(z.object({
        imageBase64: z.string(),
        scheduleId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ input, ctx }) => {
        // Upload image to S3
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const fileName = `screenshots/gvg/${input.eventDate}-${Date.now()}.jpg`;
        const { url } = await storagePut(fileName, buffer, 'image/jpeg');
        
        // Save screenshot record
        const eventType = await db.getEventTypeByName('gvg');
        await db.createScreenshotUpload({
          eventTypeId: eventType?.id || 1,
          eventDate: input.eventDate,
          imageUrl: url,
          createdBy: ctx.user.id,
          imageKey: fileName,
        });
        
        // Analyze with LLM
        const extractedData = await analyzeGvgScreenshot(url);
        
        // Match players to members
        const members = await db.getAllMembers();
        const matchedAttacks = extractedData.map(data => {
          const member = matchPlayerToMember(data.playerName, members);
          return {
            ...data,
            memberId: member?.id,
            memberName: member?.name || data.playerName,
            matched: !!member,
          };
        });
        
        return { 
          success: true, 
          imageUrl: url,
          extractedData: matchedAttacks,
          totalExtracted: extractedData.length,
          totalMatched: matchedAttacks.filter(a => a.matched).length,
        };
      }),
    
    analyzeGot: managerProcedure
      .input(z.object({
        imageBase64: z.string(),
        scheduleId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ input, ctx }) => {
        // Upload image to S3
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const fileName = `screenshots/got/${input.eventDate}-${Date.now()}.jpg`;
        const { url } = await storagePut(fileName, buffer, 'image/jpeg');
        
        // Save screenshot record
        const eventType = await db.getEventTypeByName('got');
        await db.createScreenshotUpload({
          eventTypeId: eventType?.id || 2,
          eventDate: input.eventDate,
          imageUrl: url,
          createdBy: ctx.user.id,
          imageKey: fileName,
        });
        
        // Analyze with LLM
        const extractedData = await analyzeGotScreenshot(url);
        
        // Match players to members
        const members = await db.getAllMembers();
        const matchedAttacks = extractedData.map(data => {
          const member = matchPlayerToMember(data.playerName, members);
          return {
            ...data,
            memberId: member?.id,
            memberName: member?.name || data.playerName,
            matched: !!member,
          };
        });
        
        return { 
          success: true, 
          imageUrl: url,
          extractedData: matchedAttacks,
          totalExtracted: extractedData.length,
          totalMatched: matchedAttacks.filter(a => a.matched).length,
        };
      }),
    
    getByEventAndDate: protectedProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .query(async ({ input }) => {
        return db.getScreenshotsByEventAndDate(input.eventTypeId, input.eventDate);
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ PERFORMANCE RECORDS ============
  performance: router({
    getByEventAndDate: protectedProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .query(async ({ input }) => {
        return db.getPerformanceByEventAndDate(input.eventTypeId, input.eventDate);
      }),
    
    save: managerProcedure
      .input(z.object({
        eventTypeId: z.number(),
        eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        records: z.array(z.object({
          memberId: z.number(),
          attacked: z.boolean(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.deletePerformanceByEventAndDate(input.eventTypeId, input.eventDate);
        
        for (const record of input.records) {
          await db.createPerformanceRecord({
            eventTypeId: input.eventTypeId,
            eventDate: input.eventDate,
            memberId: record.memberId,
            attacked: record.attacked,
            notes: record.notes,
            createdBy: ctx.user.id,
          });
        }
        
        return { success: true };
      }),
    
    stats: protectedProcedure
      .input(z.object({
        memberId: z.number().optional(),
        eventTypeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getMemberPerformanceStats(input.memberId, input.eventTypeId);
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ STATISTICS ============
  stats: router({
    memberParticipation: protectedProcedure
      .input(z.object({
        eventTypeId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getMemberStats(undefined, input.eventTypeId, input.startDate, input.endDate);
      }),
    
    memberDetail: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getMemberStats(input.memberId, undefined, input.startDate, input.endDate);
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ RANKING ============
  ranking: router({
    gvg: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return db.getGvgRanking(input.startDate, input.endDate, input.limit);
      }),
    
    got: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        // Usar dados da ultima batalha de cada membro (nao somados)
        return db.getGotRankingLatest(input.startDate, input.endDate, input.limit);
      }),
    
    reliquias: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return db.getReliquiasRanking(input.limit);
      }),
    
    // Precisa de Atenção - GoT não atacaram na última batalha
    gotNonAttackersLatest: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getGotNonAttackersLatest(input.startDate, input.endDate);
      }),
    
    // Precisa de Atenção - GoT desempenho ruim na última batalha
    gotLowPerformersLatest: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getGotLowPerformersLatest(input.startDate, input.endDate);
      }),
    
    // Precisa de Atenção - GoT histórico de faltas em todas as batalhas
    gotNonAttackersHistory: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getGotNonAttackersHistory(input.startDate, input.endDate);
      }),
    
    // Precisa de Atenção - GoT métrica de aproveitamento em todas as batalhas
    gotPerformanceMetrics: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getGotPerformanceMetrics(input.startDate, input.endDate);
      }),
    
    // Enviar lembrete automático GoT
    sendAutomaticReminder: managerProcedure
      .input(z.object({
        eventDate: z.string(),
        nonAttackerNames: z.array(z.string()),
        customMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const success = await sendAutomaticGotReminder(
          input.eventDate,
          input.nonAttackerNames,
          input.customMessage
        );
        return { success };
      }),
    
    // Enviar mensagem WhatsApp
    sendWhatsAppMessage: managerProcedure
      .input(z.object({
        phoneNumber: z.string(),
        text: z.string(),
        whatsappToken: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await sendWhatsAppMessage(
          input.phoneNumber,
          input.text
        );
        return result;
      }),
    
    // Validar token WhatsApp
    validateWhatsAppToken: adminProcedure
      .input(z.object({
        token: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Placeholder para validação de token
        const valid = true;
        return { valid };
      }),
    
    // WhatsApp Bot Management

    sendToTelegram: managerProcedure
      .input(z.object({
        type: z.enum(["gvg", "got"]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const config = await db.getTelegramConfig();
        if (!config?.botToken || !config?.chatId) {
          return { success: false, error: "Bot não configurado" };
        }
        
        let message = "";
        if (input.type === "gvg") {
          const ranking = await db.getGvgRanking(input.startDate, input.endDate, 10);
          message = "🏆 *RANKING GvG*\n";
          message += input.startDate || input.endDate 
            ? `Período: ${input.startDate || "início"} até ${input.endDate || "hoje"}\n\n`
            : "Todo o período\n\n";
          ranking.forEach((p, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            message += `${medal} *${p.memberName}* - ⭐ ${p.totalStars} (${p.totalAttacks} batalhas)\n`;
          });
        } else {
          const ranking = await db.getGotRanking(input.startDate, input.endDate, 10);
          message = "🏆 *RANKING GoT*\n";
          message += input.startDate || input.endDate 
            ? `Período: ${input.startDate || "início"} até ${input.endDate || "hoje"}\n\n`
            : "Todo o período\n\n";
          ranking.forEach((p, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            message += `${medal} *${p.memberName}* - ${p.totalPoints} pts (${p.totalAttackVictories}V/${p.totalAttackDefeats}D atq, ${p.totalDefenseVictories}V/${p.totalDefenseDefeats}D def)\n`;
          });
        }
        
        try {
          const response = await fetch(
            `https://api.telegram.org/bot${config.botToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: config.chatId,
                text: message,
                parse_mode: "Markdown",
              }),
            }
          );
          return { success: response.ok };
        } catch {
          return { success: false };
        }
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ MEMBER HISTORY ============
  memberHistory: router({
    gvg: protectedProcedure
      .input(z.object({ memberId: z.number(), limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return db.getMemberGvgHistory(input.memberId, input.limit);
      }),
    
    got: protectedProcedure
      .input(z.object({ memberId: z.number(), limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return db.getMemberGotHistory(input.memberId, input.limit);
      }),
    
    reliquias: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(async ({ input }) => {
        return db.getMemberReliquiasHistory(input.memberId);
      }),
    
    fullStats: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(async ({ input }) => {
        return db.getMemberFullStats(input.memberId);
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ RELIQUIAS ============
  reliquias: router({
    // Season management
    getActiveSeason: protectedProcedure.query(async () => {
      return db.getActiveReliquiasSeason();
    }),
    
    getAllSeasons: protectedProcedure.query(async () => {
      return db.getAllReliquiasSeasons();
    }),
    
    createSeason: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ input }) => {
        const seasonId = await db.createReliquiasSeason({
          name: input.name,
          startDate: input.startDate,
          isActive: true,
        });
        return { success: true, seasonId };
      }),
    
    endSeason: adminProcedure
      .input(z.object({ seasonId: z.number() }))
      .mutation(async ({ input }) => {
        await db.endReliquiasSeason(input.seasonId);
        return { success: true };
      }),
    
    // Boss progress
    getBossProgress: protectedProcedure
      .input(z.object({ seasonId: z.number() }))
      .query(async ({ input }) => {
        return db.getBossProgressBySeason(input.seasonId);
      }),
    
    getCurrentBoss: protectedProcedure
      .input(z.object({ seasonId: z.number() }))
      .query(async ({ input }) => {
        return db.getCurrentBoss(input.seasonId);
      }),
    
    defeatGuard: managerProcedure
      .input(z.object({ bossId: z.number() }))
      .mutation(async ({ input }) => {
        await db.defeatGuard(input.bossId);
        return { success: true };
      }),
    
    defeatBoss: managerProcedure
      .input(z.object({ bossId: z.number() }))
      .mutation(async ({ input }) => {
        await db.defeatBoss(input.bossId);
        return { success: true };
      }),
    
    // Member roles
    getMemberRoles: protectedProcedure
      .input(z.object({ seasonId: z.number() }))
      .query(async ({ input }) => {
        return db.getMemberRolesBySeason(input.seasonId);
      }),
    
    setMemberRole: managerProcedure
      .input(z.object({
        seasonId: z.number(),
        memberId: z.number(),
        role: z.enum(["guards", "boss"]),
      }))
      .mutation(async ({ input }) => {
        await db.setMemberRole(input.seasonId, input.memberId, input.role);
        return { success: true };
      }),
    
    // Damage tracking
    getDamageRanking: protectedProcedure
      .input(z.object({ seasonId: z.number() }))
      .query(async ({ input }) => {
        return db.getDamageRankingBySeason(input.seasonId);
      }),
    
    updateDamage: managerProcedure
      .input(z.object({
        seasonId: z.number(),
        memberId: z.number(),
        cumulativeDamage: z.string(),
        damageNumeric: z.number(),
        ranking: z.number().optional(),
        power: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertMemberDamage(
          input.seasonId,
          input.memberId,
          input.cumulativeDamage,
          input.damageNumeric,
          input.ranking,
          input.power
        );
        return { success: true };
      }),
    
    // Screenshot analysis for Reliquias
    analyzeScreenshot: managerProcedure
      .input(z.object({
        imageBase64: z.string(),
        seasonId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Upload image to S3
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const fileName = `screenshots/reliquias/${input.seasonId}-${Date.now()}.jpg`;
        const { url } = await storagePut(fileName, buffer, 'image/jpeg');
        
        // Save screenshot record
        const eventType = await db.getEventTypeByName('reliquias');
        await db.createScreenshotUpload({
          eventTypeId: eventType?.id || 3,
          eventDate: new Date().toISOString().split('T')[0],
          imageUrl: url,
          createdBy: ctx.user.id,
          imageKey: fileName,
        });
        
        // Analyze with LLM
        const extractedData = await analyzeReliquiasScreenshot(url);
        
        // Match players to members
        const members = await db.getAllMembers();
        const matchedDamage = extractedData.map(data => {
          const member = matchPlayerToMember(data.playerName, members);
          return {
            ...data,
            memberId: member?.id,
            memberName: member?.name || data.playerName,
            matched: !!member,
          };
        });
        
        return { 
          success: true, 
          imageUrl: url,
          extractedData: matchedDamage,
          totalExtracted: extractedData.length,
          totalMatched: matchedDamage.filter(a => a.matched).length,
        };
      }),
    
    // Bulk update damage from screenshot analysis
    bulkUpdateDamage: managerProcedure
      .input(z.object({
        seasonId: z.number(),
        damages: z.array(z.object({
          memberId: z.number(),
          cumulativeDamage: z.string(),
          damageNumeric: z.number(),
          ranking: z.number().optional(),
          power: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        for (const damage of input.damages) {
          await db.upsertMemberDamage(
            input.seasonId,
            damage.memberId,
            damage.cumulativeDamage,
            damage.damageNumeric,
            damage.ranking,
            damage.power
          );
        }
        return { success: true, count: input.damages.length };
      }),
    
    // Member assignments per boss
    getMemberAssignments: protectedProcedure
      .input(z.object({
        seasonId: z.number(),
        bossName: z.string(),
        attackNumber: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getReliquiasMemberAssignments(
          input.seasonId,
          input.bossName,
          input.attackNumber || 1
        );
      }),
    
    getAllMemberAssignments: protectedProcedure
      .input(z.object({ seasonId: z.number() }))
      .query(async ({ input }) => {
        return db.getAllReliquiasMemberAssignmentsForSeason(input.seasonId);
      }),
    
    setMemberAssignment: managerProcedure
      .input(z.object({
        seasonId: z.number(),
        memberId: z.number(),
        bossName: z.string(),
        attackNumber: z.number().optional(),
        role: z.enum(["guards", "boss"]),
        guard1Number: z.number().optional().nullable(),
        guard2Number: z.number().optional().nullable(),
        performance: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertReliquiasMemberAssignment({
          seasonId: input.seasonId,
          memberId: input.memberId,
          bossName: input.bossName,
          attackNumber: input.attackNumber || 1,
          role: input.role,
          guard1Number: input.guard1Number ?? undefined,
          guard2Number: input.guard2Number ?? undefined,
          performance: input.performance ?? undefined,
        });
        return { success: true };
      }),
    
    removeMemberAssignment: managerProcedure
      .input(z.object({
        seasonId: z.number(),
        memberId: z.number(),
        bossName: z.string(),
        attackNumber: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteReliquiasMemberAssignment(
          input.seasonId,
          input.memberId,
          input.bossName,
          input.attackNumber || 1
        );
        return { success: true };
      }),
    
    // Send Reliquias reminder notification
    sendReminder: managerProcedure
      .input(z.object({
        seasonId: z.number(),
        bossName: z.string(),
        attackNumber: z.number().optional(),
        minutesBefore: z.number(),
      }))
      .mutation(async ({ input }) => {
        const assignments = await db.getReliquiasMemberAssignments(
          input.seasonId,
          input.bossName,
          input.attackNumber || 1
        );
        
        const bossAttackers = assignments
          .filter(a => a.assignment.role === "boss")
          .map(a => a.member.name);
        
        const guardsAttackers = assignments
          .filter(a => a.assignment.role === "guards")
          .map(a => ({
            name: a.member.name,
            guard1: a.assignment.guard1Number,
            guard2: a.assignment.guard2Number,
          }));
        
        const sent = await sendReliquiasReminder(
          input.bossName,
          input.minutesBefore,
          bossAttackers,
          guardsAttackers
        );
        
        return { success: sent, bossCount: bossAttackers.length, guardsCount: guardsAttackers.length };
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ BOT CONFIG ============
  bot: router({
    getConfig: adminProcedure.query(async () => {
      const config = await db.getBotConfig();
      return config ? {
        hasToken: !!config.telegramBotToken,
        telegramGroupId: config.telegramGroupId,
        isActive: config.isActive,
      } : null;
    }),
    
    testConnection: adminProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!validateBotToken(input.token)) {
          return { success: false, error: 'Formato de token inválido' };
        }
        
        const result = await testBotConnection(input.token);
        
        if (result.success && result.botName && !validateBotUsername(result.botName)) {
          return { success: false, error: 'O nome do bot deve terminar com "bot"' };
        }
        
        return result;
      }),
    
    saveConfig: adminProcedure
      .input(z.object({
        telegramBotToken: z.string().optional(),
        telegramGroupId: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.telegramBotToken && !validateBotToken(input.telegramBotToken)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Formato de token inválido' });
        }
        
         await db.upsertBotConfig(input);
        return { success: true };
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  whatsapp: router({
    initialize: adminProcedure.mutation(async () => {
      try {
        await initializeWhatsAppClient();
        const status = getWhatsAppStatus();
        return { success: true, status };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
    status: protectedProcedure.query(() => getWhatsAppStatus()),
    sendMessage: managerProcedure
      .input(z.object({ phoneNumber: z.string(), message: z.string() }))
      .mutation(async ({ input }) => ({
        success: await sendWhatsAppMessage(input.phoneNumber, input.message),
      })),
    sendMentionMessage: managerProcedure
      .input(z.object({ phoneNumber: z.string(), message: z.string(), mentionedNumbers: z.array(z.string()) }))
      .mutation(async ({ input }) => ({
        success: await sendWhatsAppMentionMessage(input.mentionedNumbers, input.message),
      })),
    sendGotReminder: managerProcedure
      .input(z.object({ memberPhones: z.array(z.object({ phoneNumber: z.string(), name: z.string() })), customMessage: z.string().optional() }))
      .mutation(async ({ input }) => sendGotReminder(input.memberPhones, input.customMessage || "")),
    disconnect: adminProcedure.mutation(async () => {
      await disconnectWhatsApp();
      return { success: true };
    }),
    clearSession: adminProcedure.mutation(async () => {
      clearWhatsAppSession();
      return { success: true };
    }),
    getQRCode: protectedProcedure.query(() => ({ qrCode: getCurrentQRCode() })),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ GoT STRATEGIES ============
  gotStrategies: router({
    getAll: protectedProcedure.query(async () => {
      return db.getAllGotStrategies();
    }),
    
    search: protectedProcedure
      .input(z.object({ keyword: z.string() }))
      .query(async ({ input }) => {
        // Suportar busca por múltiplos nomes separados por espaço
        const names = input.keyword.split(/\s+/).filter(n => n.length > 0);
        
        if (names.length > 1) {
          // Busca avançada com múltiplos nomes (até 3)
          return db.searchGotStrategiesByMultipleNames(names.slice(0, 3));
        } else if (names.length === 1) {
          // Busca por nome único: tenta nome de estratégia primeiro, depois cavaleiros
          const byName = await db.searchGotStrategies(names[0]);
          if (byName.length > 0) {
            return byName;
          }
          // Se não encontrou por nome, busca por cavaleiro
          return db.searchGotStrategiesByMultipleNames([names[0]]);
        } else {
          // Sem busca, retorna todas
          return db.getAllGotStrategies();
        }
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().max(100).optional(),
        observation: z.string().optional(),
        attackFormation1: z.string().min(1).max(50),
        attackFormation2: z.string().min(1).max(50),
        attackFormation3: z.string().min(1).max(50),
        defenseFormation1: z.string().min(1).max(50),
        defenseFormation2: z.string().min(1).max(50),
        defenseFormation3: z.string().min(1).max(50),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!ctx.user?.id) {
            console.error('[tRPC] User ID not available');
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
          }
          
          const strategy = await db.createGotStrategy({
            name: input.name || undefined,
            observation: input.observation || undefined,
            attackFormation1: input.attackFormation1,
            attackFormation2: input.attackFormation2,
            attackFormation3: input.attackFormation3,
            defenseFormation1: input.defenseFormation1,
            defenseFormation2: input.defenseFormation2,
            defenseFormation3: input.defenseFormation3,
            createdBy: ctx.user.id,
            usageCount: 0,
          });
          
          if (!strategy) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create strategy' });
          }
          
          // Backup automático
          await backupGotStrategy(strategy.id, strategy, {
            backupType: 'create',
            backupReason: 'Estratégia criada',
            createdBy: ctx.user.id,
          });
          
          return strategy;
        } catch (error) {
          console.error('[tRPC] Error creating strategy:', error);
          const msg = error instanceof Error ? error.message : 'Unknown error';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to create strategy: ${msg}` });
        }
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().max(100).optional(),
        observation: z.string().optional(),
        attackFormation1: z.string().max(50).optional(),
        attackFormation2: z.string().max(50).optional(),
        attackFormation3: z.string().max(50).optional(),
        defenseFormation1: z.string().max(50).optional(),
        defenseFormation2: z.string().max(50).optional(),
        defenseFormation3: z.string().max(50).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { id, ...updates } = input;
          
          // Backup automático antes de atualizar
          const oldStrategy = await db.getGotStrategyById(id);
          if (oldStrategy) {
            await backupGotStrategy(id, oldStrategy, {
              backupType: 'update',
              backupReason: 'Antes de atualização',
              createdBy: ctx.user?.id || 0,
            });
          }
          
          const strategy = await db.updateGotStrategy(id, updates);
          if (!strategy) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Strategy not found' });
          }
          return strategy;
        } catch (error) {
          console.error('[tRPC] Error updating strategy:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update strategy' });
        }
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Backup automático antes de deletar
          const strategy = await db.getGotStrategyById(input.id);
          if (strategy) {
            await backupGotStrategy(input.id, strategy, {
              backupType: 'delete',
              backupReason: 'Estratégia deletada',
              createdBy: ctx.user?.id || 0,
            });
          }
          
          const success = await db.deleteGotStrategy(input.id);
          if (!success) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Strategy not found' });
          }
          return { success };
        } catch (error) {
          console.error('[tRPC] Error deleting strategy:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete strategy' });
        }
      }),
    sendToTelegram: protectedProcedure
      .input(z.object({ strategyIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        try {
          if (input.strategyIds.length === 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Selecione pelo menos uma estratégia' });
          }
          
          // Buscar estratégias selecionadas
          const strategies = await Promise.all(
            input.strategyIds.map(id => db.getGotStrategyById(id))
          );
          
          const validStrategies = strategies.filter(s => s !== null);
          if (validStrategies.length === 0) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Nenhuma estratégia encontrada' });
          }
          
          // Formatar mensagem para Telegram
          let message = '';
          // Adicionar título apenas uma vez
          message += '📢 *Estratégias GoT*\n\n';
          
          validStrategies.forEach((strategy) => {
            message += `*${strategy.name}*\n\n`;
            message += `Ataque x Defesa\n\n`;
            message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
            message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
            message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n\n`;
          });
          
          // Enviar para Telegram
          await sendGeneralAnnouncement('Estratégias GoT', message);
          
          return { success: true, count: validStrategies.length };
        } catch (error) {
          console.error('[tRPC] Error sending strategies to Telegram:', error);
          const msg = error instanceof Error ? error.message : 'Erro ao enviar para Telegram';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: msg });
        }
      }),
    
    export: protectedProcedure.query(async () => {
      try {
        const strategies = await db.getAllGotStrategies();
        const exportData = exportStrategies(strategies);
        return exportData;
      } catch (error) {
        console.error('[tRPC] Error exporting strategies:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao exportar estratégias' });
      }
    }),
    
    import: protectedProcedure
      .input(z.object({
        fileContent: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const parseResult = parseImportFile(input.fileContent);
          
          if (!parseResult.data) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: parseResult.error || 'Erro ao processar arquivo' });
          }
          
          const importData = parseResult.data;
          const stats = getImportStats(importData);
          
          // Importar estratégias
          let importedCount = 0;
          let skippedCount = 0;
          
          for (const strategy of importData.strategies) {
            try {
              // Verificar se estratégia já existe pelo conteúdo
              const existing = await db.searchGotStrategies(strategy.name || '');
              const isDuplicate = existing.some(s => 
                s.attackFormation1 === strategy.attackFormation.split(' x ')[0]?.trim()
              );
              
              if (!isDuplicate) {
                // Dividir attackFormation em 3 partes (formato: "Knight1 x Knight2 x Knight3")
                const attackParts = strategy.attackFormation.split(' x ').map(s => s.trim());
                const defenseParts = strategy.defenseFormation.split(' x ').map(s => s.trim());
                
                await db.createGotStrategy({
                  name: strategy.name || undefined,
                  observation: strategy.observation || undefined,
                  attackFormation1: attackParts[0] || '',
                  attackFormation2: attackParts[1] || '',
                  attackFormation3: attackParts[2] || '',
                  defenseFormation1: defenseParts[0] || '',
                  defenseFormation2: defenseParts[1] || '',
                  defenseFormation3: defenseParts[2] || '',
                  createdBy: ctx.user?.id || 0,
                  usageCount: 0,
                });
                importedCount++;
              } else {
                skippedCount++;
              }
            } catch (error) {
              console.error('[tRPC] Error importing single strategy:', error);
              skippedCount++;
            }
          }
          
          return {
            success: true,
            importedCount,
            skippedCount,
            totalProcessed: importData.strategies.length,
            message: `Importadas ${importedCount} estratégias. ${skippedCount} duplicatas ignoradas.`,
          };
        } catch (error) {
          console.error('[tRPC] Error importing strategies:', error);
          const msg = error instanceof Error ? error.message : 'Erro ao importar estratégias';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: msg });
        }
      }),
    
    // Backup history
    getBackupHistory: protectedProcedure
      .input(z.object({ strategyId: z.number() }))
      .query(async ({ input }) => {
        const { getGotStrategyBackupHistory } = await import("./strategyBackup");
        return getGotStrategyBackupHistory(input.strategyId);
      }),
    
    // Restore from backup
    restoreFromBackup: protectedProcedure
      .input(z.object({ backupId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { restoreGotStrategyFromBackup } = await import("./strategyBackup");
          const success = await restoreGotStrategyFromBackup(input.backupId, ctx.user?.id || 0);
          if (!success) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Backup não encontrado' });
          }
          return { success };
        } catch (error) {
          console.error('[tRPC] Error restoring from backup:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao restaurar backup' });
        }
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ GVG SEASONS ============
  gvgSeasons: router({
    getActive: protectedProcedure.query(async () => {
      return db.getActiveSeason();
    }),
    
    getAll: protectedProcedure.query(async () => {
      return db.getAllSeasons();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        startDate: z.date(),
        endDate: z.date(),
        returnDate: z.date().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const season = await db.createGvgSeason({
          name: input.name,
          status: 'active',
          startDate: input.startDate,
          endDate: input.endDate,
          returnDate: input.returnDate,
          description: input.description,
        });
        return season || { error: 'Failed to create season' };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        seasonId: z.number(),
        status: z.enum(['active', 'paused', 'ended']),
      }))
      .mutation(async ({ input }) => {
        const season = await db.updateSeasonStatus(input.seasonId, input.status);
        return season || { error: 'Failed to update season' };
      }),
    
    endAndStart: adminProcedure
      .input(z.object({
        newSeasonName: z.string().min(1),
        newStartDate: z.date(),
        newEndDate: z.date(),
        newReturnDate: z.date().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.endCurrentSeasonAndStartNew({
          name: input.newSeasonName,
          status: 'active',
          startDate: input.newStartDate,
          endDate: input.newEndDate,
          returnDate: input.newReturnDate,
          description: input.description,
        });
        return result;
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

    botStatus: publicProcedure.query(async () => {
      const health = getBotHealth();
      return {
        isAlive: health.isAlive,
        status: health.status,
        messageCount: health.messageCount,
        uptime: health.uptime,
        lastHeartbeat: new Date(health.lastHeartbeat).toISOString(),
        timestamp: new Date().toISOString(),
      };
    }),

    resurrectTelegramBot: adminProcedure.mutation(async () => {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      const success = await resurrectBot(token);
      const health = getBotHealth();
      return {
        success,
        status: health.status,
        isAlive: health.isAlive,
        message: success ? "Bot ressuscitado com sucesso!" : "Falha ao ressuscitar Bot",
      };
    }),

  gvgStrategies: router({
    getAll: protectedProcedure.query(async () => {
      return db.getAllGvgStrategies();
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().max(100).optional(),
        observation: z.string().optional(),
        attackFormation1: z.string().min(1).max(50),
        attackFormation2: z.string().min(1).max(50),
        attackFormation3: z.string().min(1).max(50),
        attackFormation4: z.string().min(1).max(50),
        attackFormation5: z.string().min(1).max(50),
        defenseFormation1: z.string().min(1).max(50),
        defenseFormation2: z.string().min(1).max(50),
        defenseFormation3: z.string().min(1).max(50),
        defenseFormation4: z.string().min(1).max(50),
        defenseFormation5: z.string().min(1).max(50),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
        return db.createGvgStrategy({ ...input, createdBy: ctx.user.id, usageCount: 0 });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().max(100).optional(),
        observation: z.string().optional(),
        attackFormation1: z.string().max(50).optional(),
        attackFormation2: z.string().max(50).optional(),
        attackFormation3: z.string().max(50).optional(),
        attackFormation4: z.string().max(50).optional(),
        attackFormation5: z.string().max(50).optional(),
        defenseFormation1: z.string().max(50).optional(),
        defenseFormation2: z.string().max(50).optional(),
        defenseFormation3: z.string().max(50).optional(),
        defenseFormation4: z.string().max(50).optional(),
        defenseFormation5: z.string().max(50).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateGvgStrategy(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteGvgStrategy(input.id);
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  backup: router({
    exportGotStrategies: publicProcedure
      .query(async () => {
        try {
          const strategies = await db.getAllGotStrategies();
          return {
            success: true,
            data: strategies,
            timestamp: new Date().toISOString(),
            count: strategies.length,
          };
        } catch (error) {
          console.error('[Backup] Erro ao exportar estratégias:', error);
          return {
            success: false,
            error: 'Erro ao exportar estratégias',
            data: [],
          };
        }
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),

  // ============ CARDS ============
  cards: router({
    list: publicProcedure
      .query(async () => {
        return db.getAllCards();
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchCards(input.query);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCardById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        imageUrl: z.string().max(500).optional(),
        referenceLink: z.string().max(500).optional(),
        usageLimit: z.string().min(1).max(255),
        bonusDmg: z.string().default("0"),
        bonusDef: z.string().default("0"),
        bonusVid: z.string().default("0"),
        bonusPress: z.string().default("0"),
        bonusEsquiva: z.string().default("0"),
        bonusVelAtaq: z.string().default("0"),
        bonusTenacidade: z.string().default("0"),
        bonusSanguessuga: z.string().default("0"),
        bonusRedDano: z.string().default("0"),
        bonusCrit: z.string().default("0"),
        bonusCura: z.string().default("0"),
        bonusCuraRecebida: z.string().default("0"),
        bonusPrecisao: z.string().default("0"),
        bonusVida: z.string().default("0"),
        skillEffect: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const card = await db.createCard({
            ...input,
            createdBy: ctx.user.id,
          });
          return { success: true, data: card };
        } catch (error) {
          console.error('[Cards] Erro ao criar carta:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar carta' });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        imageUrl: z.string().max(500).optional(),
        referenceLink: z.string().max(500).optional(),
        usageLimit: z.string().min(1).max(255).optional(),
        bonusDmg: z.string().optional(),
        bonusDef: z.string().optional(),
        bonusVid: z.string().optional(),
        bonusPress: z.string().optional(),
        bonusEsquiva: z.string().optional(),
        bonusVelAtaq: z.string().optional(),
        bonusTenacidade: z.string().optional(),
        bonusSanguessuga: z.string().optional(),
        bonusRedDano: z.string().optional(),
        bonusCrit: z.string().optional(),
        bonusCura: z.string().optional(),
        bonusCuraRecebida: z.string().optional(),
        bonusPrecisao: z.string().optional(),
        bonusVida: z.string().optional(),
        skillEffect: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { id, ...updateData } = input;
          const card = await db.updateCard(id, updateData);
          return { success: true, data: card };
        } catch (error) {
          console.error('[Cards] Erro ao atualizar carta:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao atualizar carta' });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const success = await db.deleteCard(input.id);
          return { success };
        } catch (error) {
          console.error('[Cards] Erro ao deletar carta:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao deletar carta' });
        }
      }),

    export: publicProcedure
      .query(async () => {
        try {
          const jsonData = await db.exportCardsAsJson();
          return {
            success: true,
            data: jsonData,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error('[Cards] Erro ao exportar cartas:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao exportar cartas' });
        }
      }),

    import: protectedProcedure
      .input(z.object({ jsonData: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const importedCount = await db.importCardsFromJson(input.jsonData, ctx.user.id);
          return { success: true, importedCount };
        } catch (error) {
          console.error('[Cards] Erro ao importar cartas:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao importar cartas' });
        }
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),
  characters: router({
    list: publicProcedure
      .query(async () => {
        try {
          const characters = await db.getAllCharacters();
          return { success: true, data: characters };
        } catch (error) {
          console.error('[Characters] Erro ao listar personagens:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao listar personagens' });
        }
      }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        try {
          const characters = await db.searchCharacters(input.query);
          return { success: true, data: characters };
        } catch (error) {
          console.error('[Characters] Erro ao buscar personagens:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao buscar personagens' });
        }
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const character = await db.getCharacterById(input.id);
          if (!character) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Personagem não encontrado' });
          }
          const skills = await db.getCharacterSkills(input.id);
          const cloth = await db.getCharacterCloth(input.id);
          const constellations = await db.getCharacterConstellations(input.id);
          const links = await db.getCharacterLinks(input.id);
          return { success: true, data: { ...character, skills, cloth, constellations, links } };
        } catch (error) {
          console.error('[Characters] Erro ao buscar personagem:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao buscar personagem' });
        }
      }),
    getByClass: publicProcedure
      .input(z.object({ class: z.string() }))
      .query(async ({ input }) => {
        try {
          const characters = await db.getCharactersByClass(input.class);
          return { success: true, data: characters };
        } catch (error) {
          console.error('[Characters] Erro ao filtrar por classe:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao filtrar por classe' });
        }
      }),
    getByType: publicProcedure
      .input(z.object({ type: z.string() }))
      .query(async ({ input }) => {
        try {
          const characters = await db.getCharactersByType(input.type);
          return { success: true, data: characters };
        } catch (error) {
          console.error('[Characters] Erro ao filtrar por tipo:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao filtrar por tipo' });
        }
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        class: z.string().optional(),
        type: z.string().optional(),
        hp: z.number().optional(),
        atk: z.number().optional(),
        def: z.number().optional(),
        cosmos_gain_atk: z.number().optional(),
        cosmos_gain_dmg: z.number().optional(),
        dano_percent: z.number().optional(),
        defesa_percent: z.number().optional(),
        resistencia: z.number().optional(),
        pressa: z.number().optional(),
        esquiva_percent: z.number().optional(),
        vel_ataque_percent: z.number().optional(),
        tenacidade: z.number().optional(),
        sanguessuga: z.number().optional(),
        dano_vermelho_percent: z.number().optional(),
        tax_critico: z.number().optional(),
        precisao: z.number().optional(),
        cura_percent: z.number().optional(),
        cura_recebida_percent: z.number().optional(),
        bonus_vida_percent: z.number().optional(),
        red_dano_percent: z.number().optional(),
        esquiva_valor: z.number().optional(),
        efeito_habilidade: z.string().optional(),
        image_url: z.string().optional(),
        ssloj_url: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const id = await db.createCharacter(input);
          return { success: true, id };
        } catch (error) {
          console.error('[Characters] Erro ao criar personagem:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar personagem' });
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        class: z.string().optional(),
        type: z.string().optional(),
        hp: z.number().optional(),
        atk: z.number().optional(),
        def: z.number().optional(),
        cosmos_gain_atk: z.number().optional(),
        cosmos_gain_dmg: z.number().optional(),
        dano_percent: z.number().optional(),
        defesa_percent: z.number().optional(),
        resistencia: z.number().optional(),
        pressa: z.number().optional(),
        esquiva_percent: z.number().optional(),
        vel_ataque_percent: z.number().optional(),
        tenacidade: z.number().optional(),
        sanguessuga: z.number().optional(),
        dano_vermelho_percent: z.number().optional(),
        tax_critico: z.number().optional(),
        precisao: z.number().optional(),
        cura_percent: z.number().optional(),
        cura_recebida_percent: z.number().optional(),
        bonus_vida_percent: z.number().optional(),
        red_dano_percent: z.number().optional(),
        esquiva_valor: z.number().optional(),
        efeito_habilidade: z.string().optional(),
        image_url: z.string().optional(),
        ssloj_url: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...updateData } = input;
          const character = await db.updateCharacter(id, updateData);
          return { success: true, data: character };
        } catch (error) {
          console.error('[Characters] Erro ao atualizar personagem:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao atualizar personagem' });
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const success = await db.deleteCharacter(input.id);
          return { success };
        } catch (error) {
          console.error('[Characters] Erro ao deletar personagem:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao deletar personagem' });
        }
      }),
    export: publicProcedure
      .query(async () => {
        try {
          const jsonData = await db.exportCharactersToJson();
          return { success: true, data: jsonData, timestamp: new Date().toISOString() };
        } catch (error) {
          console.error('[Characters] Erro ao exportar personagens:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao exportar personagens' });
        }
      }),
    import: protectedProcedure
      .input(z.object({ jsonData: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const importedCount = await db.importCharactersFromJson(input.jsonData);
          return { success: true, importedCount };
        } catch (error) {
          console.error('[Characters] Erro ao importar personagens:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao importar personagens' });
        }
      }),
    searchWithAI: protectedProcedure
      .input(z.object({
        cardName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Retorne apenas JSON válido com informações sobre cartas de jogo." },
              { role: "user", content: `Procure informações sobre a carta "${input.cardName}". Retorne um JSON com: name, bonusDmg, bonusDef, bonusVid, bonusPress, bonusEsquiva, bonusVelAtaq, bonusTenacidade, bonusSanguessuga, bonusRedDano, bonusCrit, bonusCura, bonusCuraRecebida, bonusPrecisao, usageLimit, skillEffect.` },
            ],
          });

          const content = response.choices[0].message.content;
          const cardData = typeof content === "string" ? JSON.parse(content) : content;

          return { success: true, data: cardData };
        } catch (error) {
          console.error("[Cards] Erro ao buscar com IA:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar informações com IA" });
        }
      }),

  }),
  recommendations: recommendationsRouter,
  aiChat: aiChatRouter,
  arayashikiAnalysis: arayashikiAnalysisRouter,
  arayashikiSync: arayashikiSyncRouter,
  cardAnalysis: cardAnalysisRouter,
  accounts: accountsRouter,
  customMessages: customMessagesRouter,
});


// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
