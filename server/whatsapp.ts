/**
 * WhatsApp Integration Module
 * Wrapper para integração com o sistema Sapuri
 */

import {
  connectWhatsApp,
  disconnectWhatsApp as clientDisconnect,
  logoutWhatsApp,
  getWhatsAppStatus as clientStatus,
  getWhatsAppQrCode,
  sendWhatsAppMessage as clientSendMessage,
  sendWhatsAppMessages as clientSendMessages,
} from "./whatsapp-web-client";

/**
 * Inicializar cliente do WhatsApp
 */
export async function initializeWhatsAppClient(): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("[WhatsApp] Inicializando cliente...");
    const connected = await connectWhatsApp();
    
    if (connected) {
      return { success: true, message: "Cliente inicializado com sucesso" };
    } else {
      return { success: true, message: "Iniciando conexão, aguarde o QR code..." };
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao inicializar:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

/**
 * Enviar mensagem para um número
 */
export async function sendWhatsAppMessage(
  phoneNumber: string, 
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sent = await clientSendMessage(phoneNumber, text);
    return { success: sent };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

/**
 * Enviar mensagem com menções (para grupos)
 */
export async function sendWhatsAppMentionMessage(
  mentions: string[], 
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Por enquanto, envia mensagem individual para cada mencionado
    const results = await clientSendMessages(
      mentions.map((phone) => ({ phoneNumber: phone, name: "" })),
      text,
      500
    );
    
    return { 
      success: results.failed === 0,
      error: results.failed > 0 ? `${results.failed} mensagens falharam` : undefined
    };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem com menções:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

/**
 * Enviar lembrete de GoT para membros
 */
export async function sendGotReminder(
  memberPhones: Array<{ phoneNumber: string; name: string }>,
  customMessage?: string
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  try {
    const defaultMessage = customMessage || 
      "⚔️ *LEMBRETE GoT - Sapuri Guild*\n\nOlá {nome}! Não esqueça de atacar no Guerra dos Tronos hoje!\n\n🎯 Coordene com sua equipe\n⏰ Boa sorte nas batalhas!";
    
    const result = await clientSendMessages(memberPhones, defaultMessage, 1000);
    
    return {
      success: result.failed === 0,
      sent: result.success,
      failed: result.failed,
    };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar lembrete GoT:", error);
    return {
      success: false,
      sent: 0,
      failed: memberPhones.length,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Obter status da conexão
 */
export function getWhatsAppStatus(): {
  connected: boolean;
  isConnected: boolean;
  status: string;
  qrCode: string | null;
} {
  const status = clientStatus();
  return {
    connected: status.isConnected,
    isConnected: status.isConnected,
    status: status.status,
    qrCode: status.hasQrCode ? getWhatsAppQrCode() : null,
  };
}

/**
 * Desconectar do WhatsApp
 */
export async function disconnectWhatsApp(): Promise<{ success: boolean }> {
  try {
    await clientDisconnect();
    return { success: true };
  } catch (error) {
    console.error("[WhatsApp] Erro ao desconectar:", error);
    return { success: false };
  }
}

/**
 * Limpar sessão e fazer logout
 */
export async function clearWhatsAppSession(): Promise<{ success: boolean }> {
  try {
    await logoutWhatsApp();
    return { success: true };
  } catch (error) {
    console.error("[WhatsApp] Erro ao limpar sessão:", error);
    return { success: false };
  }
}

/**
 * Obter QR code atual
 */
export function getCurrentQRCode(): string | null {
  return getWhatsAppQrCode();
}
