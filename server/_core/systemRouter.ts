import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { createSystemBackup, listSystemBackups, getSystemBackup, restoreSystemBackup, deleteSystemBackup, exportBackupAsJson } from "../systemBackupService";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  // Sistema de Backup Completo
  createBackup: adminProcedure
    .input(
      z.object({
        backupName: z.string().min(1, "backup name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createSystemBackup(
        input.backupName,
        input.description || "",
        ctx.user.id
      );
      return result;
    }),

  listBackups: adminProcedure.query(async () => {
    const backups = await listSystemBackups();
    return backups;
  }),

  getBackup: adminProcedure
    .input(z.object({ backupId: z.number() }))
    .query(async ({ input }) => {
      const backup = await getSystemBackup(input.backupId);
      return backup;
    }),

  restoreBackup: adminProcedure
    .input(z.object({ backupId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await restoreSystemBackup(input.backupId, ctx.user.id);
      return result;
    }),

  deleteBackup: adminProcedure
    .input(z.object({ backupId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await deleteSystemBackup(input.backupId);
      return { success };
    }),

  exportBackup: adminProcedure
    .input(z.object({ backupId: z.number() }))
    .query(async ({ input }) => {
      const json = await exportBackupAsJson(input.backupId);
      return { json };
    }),
});
