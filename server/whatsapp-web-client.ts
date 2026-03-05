/**
 * WhatsApp Web Client usando Baileys
 * Sistema de conexão e envio de mensagens via WhatsApp
 * Inclui sistema de comandos para consultar estratégias
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
import { getDb } from "./db";
import { gvgStrategies, gotStrategies, GvgStrategy, GotStrategy } from "../drizzle/schema";
import { like, desc, sql } from "drizzle-orm";

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

// ============ SISTEMA DE COMANDOS ============

const MAX_STRATEGIES_PER_RESPONSE = 5;

/**
 * Buscar estratégias GvG no banco de dados
 */
async function searchGvgStrategies(searchTerm?: string): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db) {
    console.log("[WhatsApp Bot] Banco de dados não disponível");
    return [];
  }

  try {
    let strategies: GvgStrategy[];
    
    if (searchTerm && searchTerm.trim()) {
      // Busca por nome ou formação
      strategies = await db
        .select()
        .from(gvgStrategies)
        .where(sql`LOWER(${gvgStrategies.name}) LIKE ${`%${searchTerm.toLowerCase()}%`}`)
        .orderBy(desc(gvgStrategies.usageCount))
        .limit(MAX_STRATEGIES_PER_RESPONSE);
    } else {
      // Retorna as mais usadas
      strategies = await db
        .select()
        .from(gvgStrategies)
        .orderBy(desc(gvgStrategies.usageCount))
        .limit(MAX_STRATEGIES_PER_RESPONSE);
    }

    console.log(`[WhatsApp Bot] Encontradas ${strategies.length} estratégias GvG`);
    return strategies;
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estratégias GvG:", error);
    return [];
  }
}

/**
 * Buscar estratégias GoT no banco de dados
 */
async function searchGotStrategies(searchTerm?: string): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db) {
    console.log("[WhatsApp Bot] Banco de dados não disponível");
    return [];
  }

  try {
    let strategies: GotStrategy[];
    
    if (searchTerm && searchTerm.trim()) {
      // Busca por nome ou observação
      strategies = await db
        .select()
        .from(gotStrategies)
        .where(sql`LOWER(${gotStrategies.name}) LIKE ${`%${searchTerm.toLowerCase()}%`} OR LOWER(${gotStrategies.observation}) LIKE ${`%${searchTerm.toLowerCase()}%`}`)
        .orderBy(desc(gotStrategies.usageCount))
        .limit(MAX_STRATEGIES_PER_RESPONSE);
    } else {
      // Retorna as mais usadas
      strategies = await db
        .select()
        .from(gotStrategies)
        .orderBy(desc(gotStrategies.usageCount))
        .limit(MAX_STRATEGIES_PER_RESPONSE);
    }

    console.log(`[WhatsApp Bot] Encontradas ${strategies.length} estratégias GoT`);
    return strategies;
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estratégias GoT:", error);
    return [];
  }
}

/**
 * Formatar estratégia GvG para mensagem WhatsApp
 */
function formatGvgStrategy(strategy: GvgStrategy): string {
  const name = strategy.name || `Estratégia #${strategy.id}`;
  
  return `
🗡️ *${name}*
━━━━━━━━━━━━━━━━━━

⚔️ *ATAQUE (5v5):*
┌──────────────────┐
│ ${strategy.attackFormation1}
│ ${strategy.attackFormation2}
│ ${strategy.attackFormation3}
│ ${strategy.attackFormation4}
│ ${strategy.attackFormation5}
└──────────────────┘

🛡️ *DEFESA (5v5):*
┌──────────────────┐
│ ${strategy.defenseFormation1}
│ ${strategy.defenseFormation2}
│ ${strategy.defenseFormation3}
│ ${strategy.defenseFormation4}
│ ${strategy.defenseFormation5}
└──────────────────┘

📊 _Usos: ${strategy.usageCount}_
`;
}

/**
 * Formatar estratégia GoT para mensagem WhatsApp
 */
function formatGotStrategy(strategy: GotStrategy): string {
  const name = strategy.name || `Estratégia #${strategy.id}`;
  const observation = strategy.observation ? `\n📝 _${strategy.observation}_` : "";
  
  return `
⚔️ *${name}*
━━━━━━━━━━━━━━━━━━

🔴 *ATAQUE (3x3):*
┌──────────────────┐
│ ${strategy.attackFormation1}
│ ${strategy.attackFormation2}
│ ${strategy.attackFormation3}
└──────────────────┘

🔵 *DEFESA (3x3):*
┌──────────────────┐
│ ${strategy.defenseFormation1}
│ ${strategy.defenseFormation2}
│ ${strategy.defenseFormation3}
└──────────────────┘

📊 _Usos: ${strategy.usageCount}_${observation}
`;
}

/**
 * Gerar mensagem de ajuda
 */
function getHelpMessage(): string {
  return `
🤖 *BOT SAPURI - COMANDOS*
━━━━━━━━━━━━━━━━━━━━━━━

📋 *Comandos Disponíveis:*

/help ou /ajuda
↳ Lista todos os comandos

/estrategias
↳ Lista tipos de estratégias disponíveis

/gvg
↳ Mostra as 5 estratégias GvG mais usadas

/gvg [busca]
↳ Busca estratégia GvG por nome
↳ Ex: /gvg cavalaria

/got
↳ Mostra as 5 estratégias GoT mais usadas

/got [busca]
↳ Busca estratégia GoT por nome
↳ Ex: /got defesa forte

━━━━━━━━━━━━━━━━━━━━━━━
_Sistema Sapuri v1.0_
`;
}

/**
 * Gerar mensagem de tipos de estratégias
 */
function getStrategiesTypesMessage(): string {
  return `
📚 *TIPOS DE ESTRATÉGIAS*
━━━━━━━━━━━━━━━━━━━━━━━

🗡️ *GvG (Guerra de Guildas)*
• Formação 5v5
• Use: /gvg

⚔️ *GoT (Guerra de Titãs)*
• Formação 3x3
• Use: /got

💡 _Dica: Adicione uma palavra para buscar_
_Ex: /gvg cavalaria_
`;
}

/**
 * Processar comando recebido
 */
async function processCommand(command: string): Promise<string | null> {
  const trimmed = command.trim().toLowerCase();
  
  // Verificar se é um comando (começa com /)
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const searchTerm = parts.slice(1).join(" ");

  console.log(`[WhatsApp Bot] Processando comando: ${cmd}, termo: "${searchTerm}"`);

  switch (cmd) {
    case "/help":
    case "/ajuda":
      return getHelpMessage();

    case "/estrategias":
    case "/estratégias":
      return getStrategiesTypesMessage();

    case "/gvg": {
      const strategies = await searchGvgStrategies(searchTerm || undefined);
      
      if (strategies.length === 0) {
        return searchTerm
          ? `❌ Nenhuma estratégia GvG encontrada para "${searchTerm}"\n\n_Tente outro termo ou use /gvg para ver as mais usadas._`
          : "❌ Nenhuma estratégia GvG cadastrada no sistema.";
      }

      const header = searchTerm
        ? `🔍 *Resultados para "${searchTerm}":*\n`
        : `📊 *Top ${strategies.length} Estratégias GvG:*\n`;
      
      const formatted = strategies.map(formatGvgStrategy).join("\n━━━━━━━━━━━━━━━━━━\n");
      return header + formatted;
    }

    case "/got": {
      const strategies = await searchGotStrategies(searchTerm || undefined);
      
      if (strategies.length === 0) {
        return searchTerm
          ? `❌ Nenhuma estratégia GoT encontrada para "${searchTerm}"\n\n_Tente outro termo ou use /got para ver as mais usadas._`
          : "❌ Nenhuma estratégia GoT cadastrada no sistema.";
      }

      const header = searchTerm
        ? `🔍 *Resultados para "${searchTerm}":*\n`
        : `📊 *Top ${strategies.length} Estratégias GoT:*\n`;
      
      const formatted = strategies.map(formatGotStrategy).join("\n━━━━━━━━━━━━━━━━━━\n");
      return header + formatted;
    }

    default:
      // Comando não reconhecido - não responde (evita spam)
      return null;
  }
}

/**
 * Handler de mensagens recebidas
 */
async function handleIncomingMessage(message: any): Promise<void> {
  try {
    // Ignorar mensagens do próprio bot
    if (message.key.fromMe) {
      return;
    }

    // Extrair texto da mensagem
    const text = message.message?.conversation ||
                 message.message?.extendedTextMessage?.text ||
                 "";

    if (!text || !text.trim()) {
      return;
    }

    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid?.endsWith("@g.us");
    const sender = message.key.participant || message.key.remoteJid;

    console.log(`[WhatsApp Bot] Mensagem recebida de ${isGroup ? "grupo" : "privado"}: ${text.substring(0, 50)}`);

    // Processar comando
    const response = await processCommand(text);

    if (response && socket) {
      // Pequeno delay para parecer mais natural
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Responder no mesmo chat
      await socket.sendMessage(remoteJid, { text: response });
      
      console.log(`[WhatsApp Bot] Resposta enviada para ${remoteJid}`);
    }
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao processar mensagem:", error);
  }
}

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

    // Handler de mensagens recebidas (sistema de comandos)
    socket.ev.on("messages.upsert", async (msg) => {
      if (msg.type === "notify") {
        for (const message of msg.messages) {
          console.log("[WhatsApp] Mensagem recebida:", message.key?.remoteJid);
          await handleIncomingMessage(message);
        }
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
    const results = await socket.onWhatsApp(jid.replace("@s.whatsapp.net", ""));
    const result = results?.[0];
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
