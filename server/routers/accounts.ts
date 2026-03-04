import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as accountScheduler from '../modules/accountScheduler';

export const accountsRouter = router({
  // GET /api/accounts - Retorna lista de contas
  list: publicProcedure.query(async () => {
    try {
      const accounts = accountScheduler.getAllAccounts();
      return accounts;
    } catch (error) {
      console.error('Erro ao listar contas:', error);
      return [];
    }
  }),

  // POST /api/accounts/announce - Anuncia nova conta
  announce: publicProcedure
    .input(
      z.object({
        gameName: z.string().min(1),
        price: z.number().positive(),
        description: z.string().min(1),
        images: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const account = accountScheduler.addAccount(
          input.gameName,
          input.price,
          input.description,
          input.images
        );
        return { success: true, account };
      } catch (error) {
        console.error('Erro ao anunciar conta:', error);
        return { success: false, error: 'Erro ao anunciar conta' };
      }
    }),

  // DELETE /api/accounts/:id - Remove uma conta
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = accountScheduler.removeAccount(input.id);
        return { success };
      } catch (error) {
        console.error('Erro ao remover conta:', error);
        return { success: false };
      }
    }),

  // GET /api/scheduler/status - Retorna status do scheduler
  schedulerStatus: publicProcedure.query(async () => {
    try {
      const status = accountScheduler.getSchedulerStatus();
      return status;
    } catch (error) {
      console.error('Erro ao obter status do scheduler:', error);
      return { isRunning: false, intervalMinutes: 60 };
    }
  }),

  // POST /api/scheduler/start - Inicia o scheduler
  schedulerStart: publicProcedure
    .input(z.object({ intervalMinutes: z.number().min(5).default(60) }))
    .mutation(async ({ input }) => {
      try {
        const success = accountScheduler.startScheduler(input.intervalMinutes);
        return { success };
      } catch (error) {
        console.error('Erro ao iniciar scheduler:', error);
        return { success: false };
      }
    }),

  // POST /api/scheduler/stop - Para o scheduler
  schedulerStop: publicProcedure.mutation(async () => {
    try {
      const success = accountScheduler.stopScheduler();
      return { success };
    } catch (error) {
      console.error('Erro ao parar scheduler:', error);
      return { success: false };
    }
  }),
});
