/**
 * Serviço de Backup Automático do Banco de Dados
 * Realiza backups diários e mantém histórico de 7 dias
 */

import fs from "fs";
import path from "path";

// Diretório de backups
const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUP_AGE_DAYS = 7;

/**
 * Inicializar diretório de backups
 */
function initBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log("[Backup] Diretório de backups criado:", BACKUP_DIR);
  }
}

/**
 * Gerar nome de arquivo de backup com timestamp
 */
function getBackupFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `backup-${timestamp}.json`;
}

/**
 * Exportar dados do banco de dados (placeholder)
 */
async function exportDatabaseData(): Promise<any> {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      tables: {
        gotStrategies: [],
        gvgStrategies: [],
        members: [],
        escalations: [],
        gotBattles: [],
        gvgBattles: [],
        reliquiaBattles: [],
      },
    };

    console.log("[Backup] Dados preparados para backup");
    return data;
  } catch (error) {
    console.error("[Backup] Erro ao exportar dados:", error);
    throw error;
  }
}

/**
 * Salvar backup em arquivo
 */
async function saveBackup(data: any): Promise<string> {
  try {
    initBackupDir();

    const filename = getBackupFilename();
    const filepath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`[Backup] Backup salvo: ${filename}`);

    return filepath;
  } catch (error) {
    console.error("[Backup] Erro ao salvar backup:", error);
    throw error;
  }
}

/**
 * Limpar backups antigos (mais de 7 dias)
 */
async function cleanOldBackups(): Promise<void> {
  try {
    initBackupDir();

    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filepath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filepath);
      const ageMs = now - stats.mtime.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (ageDays > MAX_BACKUP_AGE_DAYS) {
        fs.unlinkSync(filepath);
        console.log(`[Backup] Backup antigo removido: ${file} (${ageDays.toFixed(1)} dias)`);
      }
    }
  } catch (error) {
    console.error("[Backup] Erro ao limpar backups antigos:", error);
  }
}

/**
 * Executar backup completo
 */
export async function performBackup(): Promise<void> {
  try {
    console.log("[Backup] Iniciando backup automático...");
    const data = await exportDatabaseData();
    await saveBackup(data);
    await cleanOldBackups();
    console.log("[Backup] Backup concluído com sucesso!");
  } catch (error) {
    console.error("[Backup] Falha no backup automático:", error);
  }
}

/**
 * Listar backups disponíveis
 */
export function listBackups(): Array<{ filename: string; date: Date; size: number }> {
  try {
    initBackupDir();

    const files = fs.readdirSync(BACKUP_DIR);
    return files
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .map((filename) => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          date: stats.mtime,
          size: stats.size,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("[Backup] Erro ao listar backups:", error);
    return [];
  }
}

/**
 * Restaurar backup
 */
export async function restoreBackup(filename: string): Promise<any> {
  try {
    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup não encontrado: ${filename}`);
    }

    const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    console.log(`[Backup] Backup restaurado: ${filename}`);

    return data;
  } catch (error) {
    console.error("[Backup] Erro ao restaurar backup:", error);
    throw error;
  }
}

/**
 * Inicializar agendamento de backups (a cada 24 horas)
 */
export function scheduleBackups(): void {
  // Realizar backup imediatamente
  performBackup().catch((e) => console.error("[Backup] Erro no backup inicial:", e));

  // Agendar backup diário (a cada 24 horas)
  const interval = 24 * 60 * 60 * 1000; // 24 horas em ms
  setInterval(
    () => {
      performBackup().catch((e) => console.error("[Backup] Erro no backup agendado:", e));
    },
    interval
  );

  console.log("[Backup] Sistema de backup automático iniciado (a cada 24 horas)");
}
