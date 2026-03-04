/**
 * Serviço de Backup Completo do Sistema
 * Exporta e restaura estado completo do banco de dados
 */

import { getDb } from "./db";
import { systemBackups } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

interface BackupData {
  timestamp: number;
  version: string;
  tables: Record<string, any[]>;
}

/**
 * Exportar backup completo do sistema
 */
export async function createSystemBackup(
  backupName: string,
  description: string,
  userId: number
): Promise<{ success: boolean; backupId?: number; size: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        size: 0,
        error: "Database connection failed",
      };
    }

    // Coletar dados de todas as tabelas principais
    const backupData: BackupData = {
      timestamp: Date.now(),
      version: "1.0",
      tables: {},
    };

    // Tabelas a fazer backup (excluindo dados sensíveis)
    const tablesToBackup = [
      "members",
      "gotStrategies",
      "gvgStrategies",
      "gotAttacks",
      "gvgAttacks",
      "reliquiasBossProgress",
      "reliquiasDamage",
      "reliquiasMemberAssignments",
      "reliquiasMemberRoles",
      "reliquiasSeasons",
      "schedules",
      "scheduleEntries",
      "announcements",
      "announcementRecipients",
      "eventTypes",
      "gvgSeasons",
      "gvgMatchInfo",
      "performanceRecords",
      "nonAttackerAlerts",
      "screenshotUploads",
    ];

    // Executar queries para cada tabela
    for (const tableName of tablesToBackup) {
      try {
        const result = await db.execute(sql.raw(`SELECT * FROM ${tableName}`));
        backupData.tables[tableName] = (result as any) || [];
      } catch (error) {
        console.warn(`[Backup] Erro ao fazer backup da tabela ${tableName}:`, error);
        // Continuar com próxima tabela
      }
    }

    // Serializar dados
    const backupJson = JSON.stringify(backupData);
    const backupSize = Buffer.byteLength(backupJson, "utf-8");

    // Salvar no banco de dados
    const result = await db.insert(systemBackups).values({
      backupName,
      description,
      backupData: backupJson,
      backupSize,
      backupType: "manual",
      createdBy: userId,
    });

    console.log(`[Backup] Backup completo criado: ${backupName} (${backupSize} bytes)`);

    return {
      success: true,
      backupId: result[0].insertId,
      size: backupSize,
    };
  } catch (error) {
    console.error("[Backup] Erro ao criar backup:", error);
    return {
      success: false,
      size: 0,
      error: String(error),
    };
  }
}

/**
 * Listar todos os backups do sistema
 */
export async function listSystemBackups() {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }
    const backups = await db.select().from(systemBackups).orderBy(systemBackups.createdAt);
    return backups.map((backup) => ({
      id: backup.id,
      backupName: backup.backupName,
      description: backup.description,
      backupSize: backup.backupSize,
      backupType: backup.backupType,
      createdAt: backup.createdAt,
      createdBy: backup.createdBy,
    }));
  } catch (error) {
    console.error("[Backup] Erro ao listar backups:", error);
    return [];
  }
}

/**
 * Obter backup específico
 */
export async function getSystemBackup(backupId: number) {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }
    const backup = await db
      .select()
      .from(systemBackups)
      .where(eq(systemBackups.id, backupId))
      .limit(1);

    if (backup.length === 0) {
      throw new Error(`Backup ${backupId} não encontrado`);
    }

    return backup[0];
  } catch (error) {
    console.error("[Backup] Erro ao obter backup:", error);
    return null;
  }
}

/**
 * Restaurar backup completo do sistema
 * CUIDADO: Esta operação irá sobrescrever dados existentes
 */
export async function restoreSystemBackup(
  backupId: number,
  userId: number
): Promise<{ success: boolean; error?: string; tablesRestored?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        error: "Database connection failed",
      };
    }

    // Obter backup
    const backup = await getSystemBackup(backupId);
    if (!backup) {
      return {
        success: false,
        error: `Backup ${backupId} não encontrado`,
      };
    }

    // Parse backup data
    let backupData: BackupData;
    try {
      backupData = JSON.parse(backup.backupData);
    } catch (error) {
      return {
        success: false,
        error: "Dados de backup corrompidos",
      };
    }

    // Restaurar cada tabela
    let tablesRestored = 0;

    for (const [tableName, rows] of Object.entries(backupData.tables)) {
      try {
        if (!Array.isArray(rows) || rows.length === 0) {
          continue;
        }

        // Limpar tabela
        await db.execute(sql.raw(`TRUNCATE TABLE ${tableName}`));

        // Inserir dados
        const columns = Object.keys(rows[0]);
        const values = rows
          .map((row) => {
            const vals = columns.map((col) => {
              const val = row[col];
              if (val === null) return "NULL";
              if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === "boolean") return val ? "1" : "0";
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return val;
            });
            return `(${vals.join(",")})`;
          })
          .join(",");

        const insertSql = `INSERT INTO ${tableName} (${columns.join(",")}) VALUES ${values}`;
        await db.execute(sql.raw(insertSql));

        tablesRestored++;
        console.log(`[Backup] Tabela ${tableName} restaurada (${rows.length} registros)`);
      } catch (error) {
        console.warn(`[Backup] Erro ao restaurar tabela ${tableName}:`, error);
        // Continuar com próxima tabela
      }
    }

    console.log(`[Backup] Restauração completa: ${tablesRestored} tabelas restauradas`);

    return {
      success: true,
      tablesRestored,
    };
  } catch (error) {
    console.error("[Backup] Erro ao restaurar backup:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Deletar backup
 */
export async function deleteSystemBackup(backupId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      return false;
    }
    await db.delete(systemBackups).where(eq(systemBackups.id, backupId));
    console.log(`[Backup] Backup ${backupId} deletado`);
    return true;
  } catch (error) {
    console.error("[Backup] Erro ao deletar backup:", error);
    return false;
  }
}

/**
 * Exportar backup como arquivo JSON
 */
export async function exportBackupAsJson(backupId: number): Promise<string | null> {
  try {
    const backup = await getSystemBackup(backupId);
    if (!backup) {
      return null;
    }

    const exportData = {
      backupName: backup.backupName,
      description: backup.description,
      createdAt: backup.createdAt,
      data: JSON.parse(backup.backupData),
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("[Backup] Erro ao exportar backup:", error);
    return null;
  }
}
