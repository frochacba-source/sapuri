/**
 * Sistema de mutex para webhook do Telegram
 * Garante que apenas uma instância processa cada mensagem
 */

import * as fs from "fs";
import * as path from "path";

const MUTEX_DIR = "/tmp/telegram-webhook-mutex";
const MUTEX_TIMEOUT = 15000; // 15 segundos

// Criar diretório se não existir
if (!fs.existsSync(MUTEX_DIR)) {
  fs.mkdirSync(MUTEX_DIR, { recursive: true });
}

/**
 * Adquirir lock para uma mensagem específica
 * Retorna true se conseguiu o lock, false se outra instância já está processando
 */
export function acquireMessageLock(messageHash: string): boolean {
  const lockFile = path.join(MUTEX_DIR, `${messageHash}.lock`);
  
  try {
    // Verificar se arquivo de lock já existe
    if (fs.existsSync(lockFile)) {
      const stats = fs.statSync(lockFile);
      const age = Date.now() - stats.mtimeMs;
      
      // Se lock expirou, remover e criar novo
      if (age > MUTEX_TIMEOUT) {
        console.log(`[Webhook Mutex] Lock expirado para ${messageHash}, removendo...`);
        fs.unlinkSync(lockFile);
      } else {
        // Lock ainda ativo, outra instância está processando
        console.log(`[Webhook Mutex] ⚠️ Lock ativo para ${messageHash}, ignorando mensagem duplicada`);
        return false;
      }
    }
    
    // Criar arquivo de lock
    fs.writeFileSync(lockFile, JSON.stringify({
      timestamp: Date.now(),
      pid: process.pid,
    }));
    
    return true;
  } catch (error) {
    console.error("[Webhook Mutex] Erro ao adquirir lock:", error);
    return false;
  }
}

/**
 * Liberar lock para uma mensagem
 */
export function releaseMessageLock(messageHash: string): void {
  const lockFile = path.join(MUTEX_DIR, `${messageHash}.lock`);
  
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      console.log(`[Webhook Mutex] Lock liberado para ${messageHash}`);
    }
  } catch (error) {
    console.error("[Webhook Mutex] Erro ao liberar lock:", error);
  }
}

/**
 * Limpar locks expirados
 */
export function cleanupExpiredLocks(): void {
  try {
    const files = fs.readdirSync(MUTEX_DIR);
    const now = Date.now();
    
    files.forEach(file => {
      const lockFile = path.join(MUTEX_DIR, file);
      const stats = fs.statSync(lockFile);
      const age = now - stats.mtimeMs;
      
      if (age > MUTEX_TIMEOUT) {
        fs.unlinkSync(lockFile);
        console.log(`[Webhook Mutex] Limpeza: removido lock expirado ${file}`);
      }
    });
  } catch (error) {
    console.error("[Webhook Mutex] Erro ao limpar locks:", error);
  }
}
