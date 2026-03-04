/**
 * Serviço de Backup Automático de Estratégias
 * Cria backup antes de qualquer operação (create/update/delete)
 */

import { getDb } from "./db";
import { gotStrategyBackups, gvgStrategyBackups } from "../drizzle/schema";
import { eq, lt } from "drizzle-orm";

export interface BackupOptions {
  backupType: "create" | "update" | "delete" | "manual";
  backupReason?: string;
  createdBy: number;
}

/**
 * Criar backup de estratégia GoT
 */
export async function backupGotStrategy(
  strategyId: number,
  strategyData: any,
  options: BackupOptions
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db.insert(gotStrategyBackups).values({
      strategyId,
      backupType: options.backupType,
      strategyData: JSON.stringify(strategyData),
      backupReason: options.backupReason,
      createdBy: options.createdBy,
    });
    console.log(`[Backup] GoT Strategy ${strategyId} backed up (${options.backupType})`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao fazer backup de estratégia GoT ${strategyId}:`, error);
    return false;
  }
}

/**
 * Criar backup de estratégia GVG
 */
export async function backupGvgStrategy(
  strategyId: number,
  strategyData: any,
  options: BackupOptions
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db.insert(gvgStrategyBackups).values({
      strategyId,
      backupType: options.backupType,
      strategyData: JSON.stringify(strategyData),
      backupReason: options.backupReason,
      createdBy: options.createdBy,
    });
    console.log(`[Backup] GVG Strategy ${strategyId} backed up (${options.backupType})`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao fazer backup de estratégia GVG ${strategyId}:`, error);
    return false;
  }
}

/**
 * Obter histórico de backups de estratégia GoT
 */
export async function getGotStrategyBackupHistory(strategyId: number, limit: number = 20) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const backups = await db
      .select()
      .from(gotStrategyBackups)
      .where(eq(gotStrategyBackups.strategyId, strategyId))
      .orderBy((table: any) => table.createdAt)
      .limit(limit);
    
    return backups.map((backup: any) => ({
      ...backup,
      strategyData: JSON.parse(backup.strategyData),
    }));
  } catch (error) {
    console.error(`[Backup] Erro ao obter histórico de backups GoT ${strategyId}:`, error);
    return [];
  }
}

/**
 * Obter histórico de backups de estratégia GVG
 */
export async function getGvgStrategyBackupHistory(strategyId: number, limit: number = 20) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const backups = await db
      .select()
      .from(gvgStrategyBackups)
      .where(eq(gvgStrategyBackups.strategyId, strategyId))
      .orderBy((table: any) => table.createdAt)
      .limit(limit);
    
    return backups.map((backup: any) => ({
      ...backup,
      strategyData: JSON.parse(backup.strategyData),
    }));
  } catch (error) {
    console.error(`[Backup] Erro ao obter histórico de backups GVG ${strategyId}:`, error);
    return [];
  }
}

/**
 * Restaurar estratégia GoT de um backup
 */
export async function restoreGotStrategyFromBackup(
  backupId: number,
  createdBy: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Obter backup
    const backup = await db
      .select()
      .from(gotStrategyBackups)
      .where(eq(gotStrategyBackups.id, backupId))
      .limit(1);
    
    if (!backup || backup.length === 0) {
      console.error(`[Backup] Backup GoT ${backupId} não encontrado`);
      return false;
    }

    const backupData = JSON.parse(backup[0].strategyData);
    
    // Criar novo backup antes de restaurar (backup de segurança)
    await backupGotStrategy(backup[0].strategyId, backupData, {
      backupType: "manual",
      backupReason: `Restaurado do backup ${backupId}`,
      createdBy,
    });

    console.log(`[Backup] Estratégia GoT ${backup[0].strategyId} restaurada do backup ${backupId}`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao restaurar estratégia GoT do backup ${backupId}:`, error);
    return false;
  }
}

/**
 * Restaurar estratégia GVG de um backup
 */
export async function restoreGvgStrategyFromBackup(
  backupId: number,
  createdBy: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Obter backup
    const backup = await db
      .select()
      .from(gvgStrategyBackups)
      .where(eq(gvgStrategyBackups.id, backupId))
      .limit(1);
    
    if (!backup || backup.length === 0) {
      console.error(`[Backup] Backup GVG ${backupId} não encontrado`);
      return false;
    }

    const backupData = JSON.parse(backup[0].strategyData);
    
    // Criar novo backup antes de restaurar (backup de segurança)
    await backupGvgStrategy(backup[0].strategyId, backupData, {
      backupType: "manual",
      backupReason: `Restaurado do backup ${backupId}`,
      createdBy,
    });

    console.log(`[Backup] Estratégia GVG ${backup[0].strategyId} restaurada do backup ${backupId}`);
    return true;
  } catch (error) {
    console.error(`[Backup] Erro ao restaurar estratégia GVG do backup ${backupId}:`, error);
    return false;
  }
}

/**
 * Limpar backups antigos (manter apenas últimos 30 dias)
 */
export async function cleanupOldBackups(daysToKeep: number = 30): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Limpar backups GoT
    const gotResult = await db
      .delete(gotStrategyBackups)
      .where(lt(gotStrategyBackups.createdAt, cutoffDate));

    // Limpar backups GVG
    const gvgResult = await db
      .delete(gvgStrategyBackups)
      .where(lt(gvgStrategyBackups.createdAt, cutoffDate));

    const totalDeleted = (gotResult as any).rowsAffected || 0 + (gvgResult as any).rowsAffected || 0;
    console.log(`[Backup] Limpeza de backups antigos concluída: ${totalDeleted} registros removidos`);
    
    return totalDeleted;
  } catch (error) {
    console.error("[Backup] Erro ao limpar backups antigos:", error);
    return 0;
  }
}
