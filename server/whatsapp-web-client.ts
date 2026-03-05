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

// ============ SISTEMA DE CONTAS POR VALOR ============

// Interface para contas (deve corresponder ao accountScheduler)
interface Account {
  id: string;
  gameName: string;
  price: number;
  description: string;
  images: string[];
  createdAt: number;
  sellerName?: string;
  sellerContact?: string;
  sellerEmail?: string;
  sellerNotes?: string;
}

// Caminho do arquivo de contas
const ACCOUNTS_FILE = path.join(process.cwd(), 'server/data/contas.json');

/**
 * Carregar contas do arquivo JSON
 */
function loadAccountsFromFile(): Account[] {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[WhatsApp Bot] Erro ao carregar contas:', error);
  }
  return [];
}

/**
 * Mapear valores por extenso para números
 */
const valoresPorExtenso: Record<string, number> = {
  'cem': 100, 'cento': 100,
  'duzentos': 200, 'duzentas': 200,
  'trezentos': 300, 'trezentas': 300,
  'quatrocentos': 400, 'quatrocentas': 400,
  'quinhentos': 500, 'quinhentas': 500,
  'seiscentos': 600, 'seiscentas': 600,
  'setecentos': 700, 'setecentas': 700,
  'oitocentos': 800, 'oitocentas': 800,
  'novecentos': 900, 'novecentas': 900,
  'mil': 1000,
};

/**
 * Detectar se a mensagem é uma pergunta sobre valor/preço de conta
 * Retorna o valor detectado ou null se não for uma pergunta sobre preço
 */
function detectPriceQuery(message: string): number | null {
  const lowerMessage = message.toLowerCase().trim();
  
  // Palavras-chave que indicam pergunta sobre conta/valor
  const keywords = ['conta', 'tem', 'teria', 'valor', 'preço', 'preco', 'quanto', 'reais', 'r$', 'por'];
  const hasKeyword = keywords.some(kw => lowerMessage.includes(kw));
  
  if (!hasKeyword) {
    return null;
  }
  
  // Padrões para detectar valores
  // R$ 500, R$500, 500 reais, 500, de 500, por 500
  const patterns = [
    /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,                    // R$ 500 ou R$500
    /(\d+(?:[.,]\d{1,2})?)\s*reais/i,                  // 500 reais
    /(?:de|por|conta)\s*(\d+(?:[.,]\d{1,2})?)/i,       // de 500, por 500, conta 500
    /(\d{3,})/,                                          // números com 3+ dígitos (100+)
  ];
  
  for (const pattern of patterns) {
    const match = lowerMessage.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value) && value >= 50) {
        return value;
      }
    }
  }
  
  // Verificar valores por extenso
  for (const [palavra, valor] of Object.entries(valoresPorExtenso)) {
    if (lowerMessage.includes(palavra)) {
      // Verificar se é combinação tipo "mil e quinhentos"
      const milMatch = lowerMessage.match(/(\d*)\s*mil\s*(?:e\s*)?(\w+)?/);
      if (milMatch) {
        let total = 1000;
        const multiplier = milMatch[1] ? parseInt(milMatch[1]) : 1;
        total = total * multiplier;
        
        if (milMatch[2]) {
          const adicional = valoresPorExtenso[milMatch[2]];
          if (adicional) {
            total += adicional;
          }
        }
        return total;
      }
      return valor;
    }
  }
  
  return null;
}

/**
 * Buscar contas com valor aproximado (±20%)
 * Ordenar por proximidade ao valor solicitado
 * Limitar a 5 contas
 */
function findAccountsByPrice(targetPrice: number): Account[] {
  const accounts = loadAccountsFromFile();
  
  if (accounts.length === 0) {
    return [];
  }
  
  // Calcular faixa de preço (±20%)
  const minPrice = targetPrice * 0.8;
  const maxPrice = targetPrice * 1.2;
  
  // Filtrar e ordenar por proximidade
  const filtered = accounts
    .filter(acc => acc.price >= minPrice && acc.price <= maxPrice)
    .sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice))
    .slice(0, 5);
  
  return filtered;
}

/**
 * Formatar lista de contas para mensagem WhatsApp
 */
function formatAccountsList(accounts: Account[], targetPrice: number): string {
  if (accounts.length === 0) {
    return `😔 Não encontrei contas na faixa de R$ ${targetPrice.toLocaleString('pt-BR')}.

💡 *Dicas:*
• Tente um valor diferente
• Aguarde novos anúncios
• Pergunte sobre outras faixas de preço

📢 Anúncios automáticos são enviados regularmente!`;
  }
  
  let message = `💰 *Encontrei ${accounts.length} conta${accounts.length > 1 ? 's' : ''} próxima${accounts.length > 1 ? 's' : ''} a R$ ${targetPrice.toLocaleString('pt-BR')}:*\n\n`;
  
  accounts.forEach((acc, index) => {
    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index] || `${index + 1}.`;
    const priceFormatted = acc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    // Descrição resumida (primeiras 60 caracteres)
    let descResumida = acc.description || 'Sem descrição';
    if (descResumida.length > 60) {
      descResumida = descResumida.substring(0, 57) + '...';
    }
    
    message += `${emoji} *${acc.gameName || 'Conta'}*\n`;
    message += `💵 *R$ ${priceFormatted}*\n`;
    message += `📝 ${descResumida}\n\n`;
  });
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📢 Para mais detalhes, aguarde os anúncios automáticos!\n`;
  message += `💬 Interessado? Aguarde o anúncio completo com imagens.`;
  
  return message;
}

/**
 * Processar pergunta sobre preço de conta
 * Retorna true se processou, false se não era pergunta sobre preço
 */
async function processPriceQuery(
  text: string,
  remoteJid: string,
  socketInstance: WASocket
): Promise<boolean> {
  const price = detectPriceQuery(text);
  
  if (price === null) {
    return false;
  }
  
  console.log(`[WhatsApp Bot] Pergunta sobre preço detectada: R$ ${price}`);
  
  // Verificar faixas válidas
  if (price < 50) {
    await socketInstance.sendMessage(remoteJid, { 
      text: `❌ Não temos contas abaixo de R$ 50. Tente um valor maior!` 
    });
    return true;
  }
  
  if (price > 10000) {
    await socketInstance.sendMessage(remoteJid, { 
      text: `❌ Não temos contas acima de R$ 10.000. Tente um valor menor!` 
    });
    return true;
  }
  
  // Enviar mensagem de "verificando..."
  await socketInstance.sendMessage(remoteJid, { 
    text: `🔍 Vou verificar as contas disponíveis próximas a R$ ${price.toLocaleString('pt-BR')}...` 
  });
  
  // Aguardar 2-3 segundos (parecer mais natural)
  const delay = 2000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Buscar contas
  const accounts = findAccountsByPrice(price);
  
  // Formatar e enviar resposta
  const response = formatAccountsList(accounts, price);
  await socketInstance.sendMessage(remoteJid, { text: response });
  
  console.log(`[WhatsApp Bot] Resposta sobre preço enviada: ${accounts.length} contas encontradas`);
  
  return true;
}

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

📋 *Comandos Principais:*

/comandos ou /help
↳ Lista todos os comandos

/estrategias
↳ Lista tipos de estratégias

━━━━━━━━━━━━━━━━━━━━━━━

⚔️ *GoT (Guerra dos Titãs - 3x3):*

/got
↳ Top 5 estratégias GoT

/got [busca]
↳ Busca por nome
↳ Ex: /got explosivo

/ataque [nomes]
↳ Busca ataque GoT (até 3 nomes)
↳ Ex: /ataque Kanon Aikos ShunD

/defesa [nomes]
↳ Busca defesa GoT (até 3 nomes)
↳ Ex: /defesa Ikki Taça Hades

/dica [nomes]
↳ Dicas de defesa rápida
↳ Ex: /dica Ikki Shun MuD

━━━━━━━━━━━━━━━━━━━━━━━

🗡️ *GvG (Guerra de Guildas - 5v5):*

/gvg
↳ Top 5 estratégias GvG

/gvg [busca]
↳ Busca por nome
↳ Ex: /gvg cavalaria

/gvg ataque [nomes]
↳ Busca ataque GvG (até 5 nomes)
↳ Ex: /gvg ataque Seiya Shiryu Hyoga

/gvg defesa [nomes]
↳ Busca defesa GvG (até 5 nomes)
↳ Ex: /gvg defesa CamusD MiloD Ikki

/gvg dica [nomes]
↳ Dicas de defesa GvG
↳ Ex: /gvg dica Hades MuD

━━━━━━━━━━━━━━━━━━━━━━━

🔍 *Busca e Utilidades:*

/nome
↳ Lista todos os cavaleiros

/nome [busca]
↳ Busca cavaleiros
↳ Ex: /nome Seiya

/buscar [nome]
↳ Busca estratégia por nome

/status
↳ Status do bot

━━━━━━━━━━━━━━━━━━━━━━━
_Sistema Sapuri v2.0_
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

// ============ FUNÇÕES DE BUSCA AVANÇADA ============

/**
 * Buscar estratégias GoT por cavaleiros no ataque
 */
async function searchGotAttackByCharacters(names: string[]): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db || names.length === 0) return [];

  try {
    // Buscar todas as estratégias GoT
    const allStrategies = await db.select().from(gotStrategies).orderBy(desc(gotStrategies.usageCount));
    
    // Filtrar para encontrar estratégias que contém TODOS os cavaleiros no ataque
    const filtered = allStrategies.filter(strategy => {
      const attackFormation = `${strategy.attackFormation1} ${strategy.attackFormation2} ${strategy.attackFormation3}`.toLowerCase();
      return names.every(name => attackFormation.includes(name.toLowerCase()));
    });

    return filtered.slice(0, MAX_STRATEGIES_PER_RESPONSE);
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estratégias de ataque:", error);
    return [];
  }
}

/**
 * Buscar estratégias GoT por cavaleiros na defesa
 */
async function searchGotDefenseByCharacters(names: string[]): Promise<GotStrategy[]> {
  const db = await getDb();
  if (!db || names.length === 0) return [];

  try {
    const allStrategies = await db.select().from(gotStrategies).orderBy(desc(gotStrategies.usageCount));
    
    const filtered = allStrategies.filter(strategy => {
      const defenseFormation = `${strategy.defenseFormation1} ${strategy.defenseFormation2} ${strategy.defenseFormation3}`.toLowerCase();
      return names.every(name => defenseFormation.includes(name.toLowerCase()));
    });

    return filtered.slice(0, MAX_STRATEGIES_PER_RESPONSE);
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estratégias de defesa:", error);
    return [];
  }
}

/**
 * Buscar estratégias GvG por cavaleiros no ataque
 */
async function searchGvgAttackByCharacters(names: string[]): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db || names.length === 0) return [];

  try {
    const allStrategies = await db.select().from(gvgStrategies).orderBy(desc(gvgStrategies.usageCount));
    
    const filtered = allStrategies.filter(strategy => {
      const attackFormation = `${strategy.attackFormation1} ${strategy.attackFormation2} ${strategy.attackFormation3} ${strategy.attackFormation4} ${strategy.attackFormation5}`.toLowerCase();
      return names.every(name => attackFormation.includes(name.toLowerCase()));
    });

    return filtered.slice(0, MAX_STRATEGIES_PER_RESPONSE);
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estratégias GvG de ataque:", error);
    return [];
  }
}

/**
 * Buscar estratégias GvG por cavaleiros na defesa
 */
async function searchGvgDefenseByCharacters(names: string[]): Promise<GvgStrategy[]> {
  const db = await getDb();
  if (!db || names.length === 0) return [];

  try {
    const allStrategies = await db.select().from(gvgStrategies).orderBy(desc(gvgStrategies.usageCount));
    
    const filtered = allStrategies.filter(strategy => {
      const defenseFormation = `${strategy.defenseFormation1} ${strategy.defenseFormation2} ${strategy.defenseFormation3} ${strategy.defenseFormation4} ${strategy.defenseFormation5}`.toLowerCase();
      return names.every(name => defenseFormation.includes(name.toLowerCase()));
    });

    return filtered.slice(0, MAX_STRATEGIES_PER_RESPONSE);
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar estratégias GvG de defesa:", error);
    return [];
  }
}

/**
 * Buscar cavaleiros disponíveis
 */
async function searchCharacters(searchTerm?: string): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Buscar de GoT
    const gotResults = await db.select().from(gotStrategies);
    const gvgResults = await db.select().from(gvgStrategies);

    const characters = new Set<string>();
    
    // Extrair cavaleiros das formações GoT
    gotResults.forEach(s => {
      [s.attackFormation1, s.attackFormation2, s.attackFormation3,
       s.defenseFormation1, s.defenseFormation2, s.defenseFormation3].forEach(f => {
        if (f) f.split(/[,\/\s]+/).forEach(c => {
          const cleaned = c.trim();
          if (cleaned.length > 2) characters.add(cleaned);
        });
      });
    });

    // Extrair de GvG
    gvgResults.forEach(s => {
      [s.attackFormation1, s.attackFormation2, s.attackFormation3, s.attackFormation4, s.attackFormation5,
       s.defenseFormation1, s.defenseFormation2, s.defenseFormation3, s.defenseFormation4, s.defenseFormation5].forEach(f => {
        if (f) f.split(/[,\/\s]+/).forEach(c => {
          const cleaned = c.trim();
          if (cleaned.length > 2) characters.add(cleaned);
        });
      });
    });

    let result = Array.from(characters).sort();
    
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => c.toLowerCase().includes(term));
    }

    return result.slice(0, 30);
  } catch (error) {
    console.error("[WhatsApp Bot] Erro ao buscar cavaleiros:", error);
    return [];
  }
}

/**
 * Formatar ataques GoT - Formato igual ao Telegram
 */
function formatGotAttackList(strategies: GotStrategy[], characterNames: string): string {
  if (strategies.length === 0) {
    return `❌ Nenhuma estratégia de ataque encontrada para ${characterNames}.`;
  }

  let message = `🤖 Estratégias de Ataque - ${characterNames}\n\n`;

  // Mostrar até 5 estratégias
  strategies.slice(0, 5).forEach((s) => {
    message += `Ataque ⚔️ x 🛡️ Defesa\n\n`;
    message += `${s.attackFormation1} x ${s.defenseFormation1}\n`;
    message += `${s.attackFormation2} x ${s.defenseFormation2}\n`;
    message += `${s.attackFormation3} x ${s.defenseFormation3}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  return message;
}

/**
 * Formatar defesas GoT - Formato igual ao Telegram
 */
function formatGotDefenseList(strategies: GotStrategy[], characterNames: string): string {
  if (strategies.length === 0) {
    return `❌ Nenhuma estratégia de defesa encontrada para ${characterNames}.`;
  }

  let message = `🤖 Estratégias de Defesa - ${characterNames}\n\n`;

  // Mostrar até 5 estratégias
  strategies.slice(0, 5).forEach((s) => {
    message += `Ataque ⚔️ x 🛡️ Defesa\n\n`;
    message += `${s.attackFormation1} x ${s.defenseFormation1}\n`;
    message += `${s.attackFormation2} x ${s.defenseFormation2}\n`;
    message += `${s.attackFormation3} x ${s.defenseFormation3}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  return message;
}

/**
 * Formatar dicas de defesa (apenas defesas, sem ataque)
 */
function formatDefenseTips(strategies: GotStrategy[], characterNames: string): string {
  if (strategies.length === 0) {
    return `❌ Nenhuma dica de defesa encontrada para "${characterNames}"\n\n_Tente outros cavaleiros._`;
  }

  let message = `💡 *Dicas de Defesa - ${characterNames}:*\n━━━━━━━━━━━━━━━━━━\n\n`;
  
  strategies.forEach((s, i) => {
    message += `*${i + 1}.* 🛡️ ${s.defenseFormation1} / ${s.defenseFormation2} / ${s.defenseFormation3}\n`;
  });

  return message;
}

/**
 * Formatar ataques GvG - Formato igual ao Telegram
 */
function formatGvgAttackList(strategies: GvgStrategy[], characterNames: string): string {
  if (strategies.length === 0) {
    return `❌ Nenhuma estratégia de ataque GVG encontrada para ${characterNames}.`;
  }

  let message = `🤖 Estratégias de Ataque GVG - ${characterNames}\n\n`;

  // Mostrar até 5 estratégias
  strategies.slice(0, 5).forEach((s) => {
    message += `Ataque ⚔️ x 🛡️ Defesa\n\n`;
    message += `${s.attackFormation1} x ${s.defenseFormation1}\n`;
    message += `${s.attackFormation2} x ${s.defenseFormation2}\n`;
    message += `${s.attackFormation3} x ${s.defenseFormation3}\n`;
    message += `${s.attackFormation4} x ${s.defenseFormation4}\n`;
    message += `${s.attackFormation5} x ${s.defenseFormation5}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  return message;
}

/**
 * Formatar defesas GvG - Formato igual ao Telegram
 */
function formatGvgDefenseList(strategies: GvgStrategy[], characterNames: string): string {
  if (strategies.length === 0) {
    return `❌ Nenhuma estratégia de defesa GVG encontrada para ${characterNames}.`;
  }

  let message = `🤖 Estratégias de Defesa GVG - ${characterNames}\n\n`;

  // Mostrar até 5 estratégias
  strategies.slice(0, 5).forEach((s) => {
    message += `Ataque ⚔️ x 🛡️ Defesa\n\n`;
    message += `${s.attackFormation1} x ${s.defenseFormation1}\n`;
    message += `${s.attackFormation2} x ${s.defenseFormation2}\n`;
    message += `${s.attackFormation3} x ${s.defenseFormation3}\n`;
    message += `${s.attackFormation4} x ${s.defenseFormation4}\n`;
    message += `${s.attackFormation5} x ${s.defenseFormation5}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  return message;
}

/**
 * Formatar dicas GvG
 */
function formatGvgTips(strategies: GvgStrategy[], characterNames: string): string {
  if (strategies.length === 0) {
    return `❌ Nenhuma dica GvG encontrada para "${characterNames}"`;
  }

  let message = `💡 *Dicas GvG - ${characterNames}:*\n━━━━━━━━━━━━━━━━━━\n\n`;
  
  strategies.forEach((s, i) => {
    message += `*${i + 1}.* 🛡️ ${s.defenseFormation1} / ${s.defenseFormation2} / ${s.defenseFormation3} / ${s.defenseFormation4} / ${s.defenseFormation5}\n`;
  });

  return message;
}

/**
 * Processar comando recebido
 */
async function processCommand(command: string): Promise<string | null> {
  const trimmed = command.trim();
  const lowerCommand = trimmed.toLowerCase();
  
  // Verificar se é um comando (começa com /)
  if (!lowerCommand.startsWith("/")) {
    return null;
  }

  const parts = lowerCommand.split(/\s+/);
  const cmd = parts[0];
  const searchTerm = trimmed.substring(cmd.length).trim();
  const names = searchTerm.split(/\s+/).filter(n => n.length > 0);

  console.log(`[WhatsApp Bot] Processando comando: ${cmd}, termo: "${searchTerm}"`);

  // Comandos básicos
  switch (cmd) {
    case "/help":
    case "/ajuda":
    case "/comandos":
      return getHelpMessage();

    case "/estrategias":
    case "/estratégias":
      return getStrategiesTypesMessage();

    case "/status":
      return `✅ *Bot Status*\n━━━━━━━━━━━━━━━━━━\n\n🟢 Bot está ativo e respondendo!\n⏰ ${new Date().toLocaleString('pt-BR')}\n\n_Use /comandos para ver todos os comandos._`;
  }

  // Comandos de GvG (verificar primeiro para evitar conflito com /gvg simples)
  if (lowerCommand.startsWith("/gvg ataque")) {
    const input = searchTerm.replace(/^ataque\s*/i, "").trim();
    const charNames = input.split(/\s+/).filter(n => n.length > 0).slice(0, 5);
    
    if (charNames.length === 0) {
      return "❌ Por favor, especifique até 5 cavaleiros.\n\n_Ex: /gvg ataque Seiya Shiryu Hyoga_";
    }
    
    const strategies = await searchGvgAttackByCharacters(charNames);
    return formatGvgAttackList(strategies, charNames.join(" / "));
  }

  if (lowerCommand.startsWith("/gvg defesa")) {
    const input = searchTerm.replace(/^defesa\s*/i, "").trim();
    const charNames = input.split(/\s+/).filter(n => n.length > 0).slice(0, 5);
    
    if (charNames.length === 0) {
      return "❌ Por favor, especifique até 5 cavaleiros.\n\n_Ex: /gvg defesa Ikki Shun_";
    }
    
    const strategies = await searchGvgDefenseByCharacters(charNames);
    return formatGvgDefenseList(strategies, charNames.join(" / "));
  }

  if (lowerCommand.startsWith("/gvg dica")) {
    const input = searchTerm.replace(/^dica\s*/i, "").trim();
    const charNames = input.split(/\s+/).filter(n => n.length > 0).slice(0, 5);
    
    if (charNames.length === 0) {
      return "❌ Por favor, especifique até 5 cavaleiros.\n\n_Ex: /gvg dica Seiya Shiryu_";
    }
    
    const strategies = await searchGvgDefenseByCharacters(charNames);
    return formatGvgTips(strategies, charNames.join(" / "));
  }

  // /gvg simples ou com busca
  if (cmd === "/gvg") {
    const strategies = await searchGvgStrategies(searchTerm || undefined);
    
    if (strategies.length === 0) {
      return searchTerm
        ? `❌ Nenhuma estratégia GvG encontrada para "${searchTerm}"\n\n_Tente outro termo ou use /gvg para ver as mais usadas._`
        : "❌ Nenhuma estratégia GvG cadastrada no sistema.";
    }

    const header = searchTerm
      ? `🔍 *Resultados para "${searchTerm}":*\n`
      : `🗡️ *Top ${strategies.length} Estratégias GvG:*\n`;
    
    const formatted = strategies.map(formatGvgStrategy).join("\n━━━━━━━━━━━━━━━━━━\n");
    return header + formatted;
  }

  // /got
  if (cmd === "/got") {
    const strategies = await searchGotStrategies(searchTerm || undefined);
    
    if (strategies.length === 0) {
      return searchTerm
        ? `❌ Nenhuma estratégia GoT encontrada para "${searchTerm}"\n\n_Tente outro termo ou use /got para ver as mais usadas._`
        : "❌ Nenhuma estratégia GoT cadastrada no sistema.";
    }

    const header = searchTerm
      ? `🔍 *Resultados para "${searchTerm}":*\n`
      : `⚔️ *Top ${strategies.length} Estratégias GoT:*\n`;
    
    const formatted = strategies.map(formatGotStrategy).join("\n━━━━━━━━━━━━━━━━━━\n");
    return header + formatted;
  }

  // /ataque [nomes] - GoT attack
  if (cmd === "/ataque") {
    if (names.length === 0) {
      return "❌ Por favor, especifique até 3 cavaleiros.\n\n_Ex: /ataque Kanon Aikos Hyoga_";
    }
    
    const charNames = names.slice(0, 3);
    const strategies = await searchGotAttackByCharacters(charNames);
    return formatGotAttackList(strategies, charNames.join(" / "));
  }

  // /defesa [nomes] - GoT defense
  if (cmd === "/defesa") {
    if (names.length === 0) {
      return "❌ Por favor, especifique até 3 cavaleiros.\n\n_Ex: /defesa Ikki Taça ShunD_";
    }
    
    const charNames = names.slice(0, 3);
    const strategies = await searchGotDefenseByCharacters(charNames);
    return formatGotDefenseList(strategies, charNames.join(" / "));
  }

  // /dica [nomes] - Defense tips
  if (cmd === "/dica") {
    if (names.length === 0) {
      return "❌ Por favor, especifique até 3 cavaleiros.\n\n_Ex: /dica Ikki Shun_";
    }
    
    const charNames = names.slice(0, 3);
    const strategies = await searchGotDefenseByCharacters(charNames);
    return formatDefenseTips(strategies, charNames.join(" / "));
  }

  // /nome [busca] - Search characters
  if (cmd === "/nome") {
    const characters = await searchCharacters(searchTerm || undefined);
    
    if (characters.length === 0) {
      return searchTerm
        ? `❌ Nenhum cavaleiro encontrado para "${searchTerm}"`
        : "❌ Nenhum cavaleiro encontrado no banco de dados.";
    }

    const header = searchTerm
      ? `🔍 *Cavaleiros com "${searchTerm}":*\n\n`
      : `📋 *Cavaleiros Disponíveis:*\n\n`;
    
    const list = characters.map((c, i) => `${i + 1}. ${c}`).join("\n");
    return header + list;
  }

  // /buscar [nome] - Search strategies by name
  if (cmd === "/buscar") {
    if (!searchTerm) {
      return "❌ Por favor, especifique o nome da estratégia.\n\n_Ex: /buscar explosivo_";
    }

    const gotResults = await searchGotStrategies(searchTerm);
    const gvgResults = await searchGvgStrategies(searchTerm);
    
    if (gotResults.length === 0 && gvgResults.length === 0) {
      return `❌ Nenhuma estratégia encontrada para "${searchTerm}"`;
    }

    let message = `🔍 *Resultados para "${searchTerm}":*\n━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (gotResults.length > 0) {
      message += `⚔️ *GoT (${gotResults.length}):*\n`;
      gotResults.slice(0, 3).forEach(s => {
        message += `• ${s.name || `#${s.id}`}\n`;
      });
      message += "\n";
    }
    
    if (gvgResults.length > 0) {
      message += `🗡️ *GvG (${gvgResults.length}):*\n`;
      gvgResults.slice(0, 3).forEach(s => {
        message += `• ${s.name || `#${s.id}`}\n`;
      });
    }

    return message;
  }

  // Comando não reconhecido - não responde (evita spam)
  return null;
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

    // NOVO: Verificar se é pergunta sobre preço de conta (antes de comandos)
    // Processar apenas se não for comando (não começa com /)
    if (!text.trim().startsWith('/') && socket) {
      const priceProcessed = await processPriceQuery(text, remoteJid, socket);
      if (priceProcessed) {
        console.log(`[WhatsApp Bot] Pergunta sobre preço processada para ${remoteJid}`);
        return; // Já respondeu, não precisa continuar
      }
    }

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

/**
 * Enviar imagem para um grupo
 */
export async function sendWhatsAppGroupImage(
  groupId: string,
  imagePath: string,
  caption?: string
): Promise<boolean> {
  if (!socket || connectionStatus !== "connected") {
    console.log("[WhatsApp] Não conectado, não é possível enviar imagem");
    return false;
  }

  try {
    // O ID do grupo já vem no formato correto (xxxxx@g.us)
    const jid = groupId.includes("@") ? groupId : `${groupId}@g.us`;
    
    // Construir path completo se for path relativo
    let fullPath = imagePath;
    if (imagePath.startsWith('/uploads/')) {
      fullPath = path.join(process.cwd(), imagePath);
    }
    
    // Verificar se arquivo existe
    if (!fs.existsSync(fullPath)) {
      console.error(`[WhatsApp] Arquivo de imagem não encontrado: ${fullPath}`);
      return false;
    }
    
    console.log(`[WhatsApp] Enviando imagem para grupo ${jid}: ${fullPath}`);

    // Ler arquivo e enviar
    const imageBuffer = fs.readFileSync(fullPath);
    
    await socket.sendMessage(jid, { 
      image: imageBuffer,
      caption: caption || undefined
    });

    // Adicionar ao histórico
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber: groupId,
      message: `[IMAGEM] ${imagePath}${caption ? ' - ' + caption : ''}`,
      status: "sent",
      timestamp: new Date(),
    });

    console.log(`[WhatsApp] Imagem enviada com sucesso para grupo ${groupId}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar imagem para grupo:", error);
    
    messageHistory.push({
      id: Date.now().toString(),
      phoneNumber: groupId,
      message: `[IMAGEM FALHOU] ${imagePath}`,
      status: "failed",
      timestamp: new Date(),
    });
    
    return false;
  }
}
