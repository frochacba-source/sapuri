/**
 * WhatsApp Web Client usando Baileys
 * Sistema de conexão e envio de mensagens via WhatsApp
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  ConnectionState,
  proto,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as qrcode from "qrcode";
import * as fs from "fs";
import * as path from "path";
import pino from "pino";

// Diretório para salvar sessões
const SESSIONS_DIR = path.join(process.cwd(), "server", "whatsapp-sessions");

// Estado global do cliente
let socket: WASocket | null = null;
let qrCodeBase64: string | null = null;
let connectionStatus: "disconnected" | "connecting" | "connected" | "qr" = "disconnected";
let isConnecting = false;

// Histórico de mensagens
interface MessageHistoryEntry {
  id: string;
  phoneNumber: string;
  message: string;
  status: "sent" | "failed";
  timestamp: Date;
}
const messageHistory: MessageHistoryEntry[] = [];

// Logger silencioso para produção
const logger = pino({ level: "silent" });

/**
 * Garantir que o diretório de sessões existe
 */
function ensureSessionsDir(): void {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

/**
 * Formatar número de telefone para formato do WhatsApp
 * Aceita: +55119999-9999, 5511999999999, 11999999999, etc
 */
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, "");
  
  // Se começar com 55, está ok
  // Se não começar, adiciona 55 (Brasil)
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }
  
  // Formato do WhatsApp: número@s.whatsapp.net
  return cleaned + "@s.whatsapp.net";
}

/**
 * Conectar ao WhatsApp
 */
export async function connectWhatsApp(): Promise<boolean> {
  if (isConnecting) {
    console.log("[WhatsApp] Já está conectando, aguarde...");
    return false;
  }

  if (socket && connectionStatus === "connected") {
    console.log("[WhatsApp] Já conectado!");
    return true;
  }

  isConnecting = true;
  connectionStatus = "connecting";

  try {
    ensureSessionsDir();

    // Buscar versão mais recente do WhatsApp Web
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[WhatsApp] Usando versão WA v${version.join(".")}, isLatest: ${isLatest}`);

    // Carregar estado de autenticação
    const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);

    // Criar socket do WhatsApp
    socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
      logger,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
    });

    // Handler de conexão
    socket.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update;

      // Se recebeu QR code
      if (qr) {
        console.log("[WhatsApp] QR Code recebido, gerando imagem...");
        connectionStatus = "qr";
        try {
          // Gerar QR code como imagem base64
          qrCodeBase64 = await qrcode.toDataURL(qr, {
            width: 256,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          console.log("[WhatsApp] QR Code gerado com sucesso");
        } catch (err) {
          console.error("[WhatsApp] Erro ao gerar QR code:", err);
        }
      }

      // Se conectou
      if (connection === "open") {
        console.log("[WhatsApp] Conectado com sucesso!");
        connectionStatus = "connected";
        qrCodeBase64 = null;
        isConnecting = false;
      }

      // Se desconectou
      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log(
          "[WhatsApp] Conexão fechada devido a:",
          lastDisconnect?.error,
          "Reconectar:",
          shouldReconnect
        );

        connectionStatus = "disconnected";
        qrCodeBase64 = null;
        isConnecting = false;
        
        if (shouldReconnect) {
          // Tentar reconectar após 3 segundos
          setTimeout(() => {
            connectWhatsApp();
          }, 3000);
        }
      }
    });

    // Salvar credenciais quando atualizadas
    socket.ev.on("creds.update", saveCreds);

    // Handler de mensagens recebidas (para debug)
    socket.ev.on("messages.upsert", (msg) => {
      if (msg.type === "notify") {
        console.log("[WhatsApp] Mensagem recebida:", msg.messages[0]?.key?.remoteJid);
      }
    });

    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao conectar:", error);
    connectionStatus = "disconnected";
    isConnecting = false;
    return false;
  }
}

/**
 * Desconectar do WhatsApp
 */
export async function disconnectWhatsApp(): Promise<void> {
  if (socket) {
    console.log("[WhatsApp] Desconectando...");
    await socket.end(undefined);
    socket = null;
  }
  connectionStatus = "disconnected";
  qrCodeBase64 = null;
  isConnecting = false;
}

/**
 * Fazer logout e limpar sessão
 */
export async function logoutWhatsApp(): Promise<void> {
  if (socket) {
    try {
      await socket.logout();
    } catch (error) {
      console.error("[WhatsApp] Erro ao fazer logout:", error);
    }
    socket = null;
  }
  
  // Limpar arquivos de sessão
  if (fs.existsSync(SESSIONS_DIR)) {
    const files = fs.readdirSync(SESSIONS_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(SESSIONS_DIR, file));
    }
  }
  
  connectionStatus = "disconnected";
  qrCodeBase64 = null;
  isConnecting = false;
}

/**
 * Obter status da conexão
 */
export function getWhatsAppStatus(): {
  isConnected: boolean;
  status: string;
  hasQrCode: boolean;
} {
  return {
    isConnected: connectionStatus === "connected",
    status: connectionStatus,
    hasQrCode: !!qrCodeBase64,
  };
}

/**
 * Obter QR code em base64
 */
export function getWhatsAppQrCode(): string | null {
  return qrCodeBase64;
}

/**
 * Enviar mensagem individual
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  text: string
): Promise<boolean> {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] Não conectado, não é possível enviar mensagem");
    return false;
  }

  try {
    const jid = formatPhoneNumber(phoneNumber);
    console.log(`[WhatsApp] Enviando mensagem para ${jid}`);

    await socket.sendMessage(jid, { text });

    // Adicionar ao histórico
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber,
      message: text,
      status: "sent",
      timestamp: new Date(),
    });

    console.log(`[WhatsApp] Mensagem enviada com sucesso para ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber,
      message: text,
      status: "failed",
      timestamp: new Date(),
    });
    
    return false;
  }
}

/**
 * Enviar mensagens para múltiplos membros
 */
export async function sendWhatsAppMessages(
  members: Array<{ phoneNumber: string; name: string }>,
  text: string,
  delayMs: number = 1000
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const member of members) {
    // Personalizar mensagem com nome do membro
    const personalizedText = text.replace("{nome}", member.name);
    
    const sent = await sendWhatsAppMessage(member.phoneNumber, personalizedText);
    if (sent) {
      success++;
    } else {
      failed++;
    }

    // Delay entre mensagens para evitar bloqueio
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { success, failed };
}

/**
 * Verificar se número tem WhatsApp
 */
export async function checkWhatsAppNumber(phoneNumber: string): Promise<boolean> {
  if (!socket || connectionStatus !== "connected") {
    return false;
  }

  try {
    const jid = formatPhoneNumber(phoneNumber);
    const [result] = await socket.onWhatsApp(jid.replace("@s.whatsapp.net", ""));
    return result?.exists ?? false;
  } catch (error) {
    console.error("[WhatsApp] Erro ao verificar número:", error);
    return false;
  }
}

/**
 * Obter histórico de mensagens
 */
export function getMessageHistory(): MessageHistoryEntry[] {
  // Retornar últimas 100 mensagens
  return messageHistory.slice(-100);
}

/**
 * Obter cliente do WhatsApp
 */
export function getWhatsAppClient(): WASocket | null {
  return socket;
}

/**
 * Interface para grupos do WhatsApp
 */
export interface WhatsAppGroup {
  id: string;
  name: string;
  participantsCount: number;
}

/**
 * Listar todos os grupos do WhatsApp
 */
export async function getWhatsAppGroups(): Promise<WhatsAppGroup[]> {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] Não conectado, não é possível listar grupos");
    return [];
  }

  try {
    console.log("[WhatsApp] Buscando grupos...");
    const groups = await socket.groupFetchAllParticipating();
    
    const groupList: WhatsAppGroup[] = Object.values(groups).map((group: any) => ({
      id: group.id,
      name: group.subject || "Sem nome",
      participantsCount: group.participants?.length || 0,
    }));

    console.log(`[WhatsApp] Encontrados ${groupList.length} grupos`);
    return groupList;
  } catch (error) {
    console.error("[WhatsApp] Erro ao listar grupos:", error);
    return [];
  }
}

/**
 * Enviar mensagem para um grupo
 */
export async function sendWhatsAppGroupMessage(
  groupId: string,
  text: string
): Promise<boolean> {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] Não conectado, não é possível enviar mensagem");
    return false;
  }

  try {
    // O ID do grupo já vem no formato correto (xxxxx@g.us)
    const jid = groupId.includes("@") ? groupId : `${groupId}@g.us`;
    console.log(`[WhatsApp] Enviando mensagem para grupo ${jid}`);

    await socket.sendMessage(jid, { text });

    // Adicionar ao histórico
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber: groupId,
      message: text,
      status: "sent",
      timestamp: new Date(),
    });

    console.log(`[WhatsApp] Mensagem enviada com sucesso para grupo ${groupId}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem para grupo:", error);
    
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber: groupId,
      message: text,
      status: "failed",
      timestamp: new Date(),
    });
    
    return false;
  }
}
