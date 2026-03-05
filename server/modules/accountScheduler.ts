import * as cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { toZonedTime } from 'date-fns-tz';
import { 
  sendWhatsAppGroupMessage, 
  sendWhatsAppGroupImage,
  getWhatsAppGroups, 
  getWhatsAppStatus 
} from '../whatsapp-web-client';

// Timezone de Brasília
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

interface Account {
  id: string;
  gameName: string;
  price: number;
  description: string;
  images: string[];
  createdAt: number;
  // Informações do vendedor (controle interno - não enviadas nas mensagens)
  sellerName?: string;
  sellerContact?: string;
  sellerEmail?: string;
  sellerNotes?: string;
}

interface SchedulerState {
  isRunning: boolean;
  intervalMinutes: number;
  task: any | null;
  sendToWhatsApp: boolean; // Nova flag para envio WhatsApp
  selectedGroups: string[]; // Grupos selecionados para envio
  // Configuração de horário de envio
  sendStartHour: number;    // 0-23 (padrão: 8)
  sendEndHour: number;      // 0-23 (padrão: 22)
  timezone: string;         // Fuso horário (padrão: America/Sao_Paulo)
}

const ACCOUNTS_FILE = path.join(process.cwd(), 'server/data/contas.json');
const CONFIG_FILE = path.join(process.cwd(), 'server/data/contas-config.json');
// Credenciais específicas do Painel de Contas - envia APENAS para o grupo -5156917144
const TELEGRAM_BOT_TOKEN = process.env.PAINEL_CONTAS_BOT_TOKEN || '8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY';
const TELEGRAM_CHAT_ID = process.env.PAINEL_CONTAS_CHAT_ID || '-5156917144';

let schedulerState: SchedulerState = {
  isRunning: false,
  intervalMinutes: 60,
  task: null,
  sendToWhatsApp: true, // Envia também para WhatsApp por padrão
  selectedGroups: [], // Vazio = envia para todos
  sendStartHour: 8,   // Padrão: 8h
  sendEndHour: 22,    // Padrão: 22h
  timezone: BRAZIL_TIMEZONE,
};

// Interface para configuração persistente
interface AccountsConfig {
  selectedGroups: string[];
  sendToWhatsApp: boolean;
  // Configuração de horário de envio
  sendStartHour?: number; // 0-23
  sendEndHour?: number;   // 0-23
  timezone?: string;      // Default: America/Sao_Paulo
}

// Carregar configuração de grupos do arquivo
function loadConfig(): AccountsConfig {
  ensureDataDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar config:', error);
  }
  return { 
    selectedGroups: [], 
    sendToWhatsApp: true,
    sendStartHour: 8,
    sendEndHour: 22,
    timezone: BRAZIL_TIMEZONE
  };
}

// Salvar configuração de grupos no arquivo
function saveConfig(config: AccountsConfig) {
  ensureDataDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Inicializar estado com configuração salva
(function initConfig() {
  const config = loadConfig();
  schedulerState.selectedGroups = config.selectedGroups || [];
  schedulerState.sendToWhatsApp = config.sendToWhatsApp !== false;
  schedulerState.sendStartHour = config.sendStartHour ?? 8;
  schedulerState.sendEndHour = config.sendEndHour ?? 22;
  schedulerState.timezone = config.timezone || BRAZIL_TIMEZONE;
})();

// Garantir que o diretório de dados existe
function ensureDataDir() {
  const dataDir = path.dirname(ACCOUNTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Verificar se está dentro do horário de envio configurado
function isWithinSendingHours(): { allowed: boolean; currentHour: number; message: string } {
  const { sendStartHour, sendEndHour, timezone } = schedulerState;
  
  // Se horários não configurados (undefined/null), permitir sempre
  if (sendStartHour === undefined || sendEndHour === undefined) {
    return { allowed: true, currentHour: 0, message: 'Horário não configurado - envio permitido' };
  }
  
  // Se startHour === endHour, desabilita envio automático
  if (sendStartHour === sendEndHour) {
    return { allowed: false, currentHour: 0, message: 'Envio automático desabilitado (horário início = fim)' };
  }
  
  // Obter hora atual no fuso horário de Brasília
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  const currentHour = zonedDate.getHours();
  
  // Verificar se horário cruza meia-noite (ex: 22h às 6h)
  let allowed: boolean;
  if (sendStartHour < sendEndHour) {
    // Horário normal (ex: 8h às 22h)
    allowed = currentHour >= sendStartHour && currentHour < sendEndHour;
  } else {
    // Horário que cruza meia-noite (ex: 22h às 6h)
    allowed = currentHour >= sendStartHour || currentHour < sendEndHour;
  }
  
  const message = allowed 
    ? `Dentro do horário de envio (${sendStartHour}h-${sendEndHour}h, atual: ${currentHour}h)`
    : `Fora do horário de envio (${sendStartHour}h-${sendEndHour}h, atual: ${currentHour}h)`;
  
  return { allowed, currentHour, message };
}

// Obter status do horário de envio
function getSendingHoursStatus(): {
  sendStartHour: number;
  sendEndHour: number;
  timezone: string;
  currentHour: number;
  isWithinHours: boolean;
  statusMessage: string;
} {
  const { allowed, currentHour, message } = isWithinSendingHours();
  return {
    sendStartHour: schedulerState.sendStartHour,
    sendEndHour: schedulerState.sendEndHour,
    timezone: schedulerState.timezone,
    currentHour,
    isWithinHours: allowed,
    statusMessage: message
  };
}

// Configurar horário de envio
function setSendingHours(startHour: number, endHour: number): { success: boolean; message: string } {
  // Validar valores
  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
    return { success: false, message: 'Hora deve estar entre 0 e 23' };
  }
  
  schedulerState.sendStartHour = startHour;
  schedulerState.sendEndHour = endHour;
  
  // Salvar configuração
  saveConfig({
    selectedGroups: schedulerState.selectedGroups,
    sendToWhatsApp: schedulerState.sendToWhatsApp,
    sendStartHour: startHour,
    sendEndHour: endHour,
    timezone: schedulerState.timezone
  });
  
  const message = startHour === endHour 
    ? 'Envio automático desabilitado (horário início = fim)'
    : `Horário de envio configurado: ${startHour}h às ${endHour}h (Brasília)`;
  
  console.log(`[Scheduler] ${message}`);
  return { success: true, message };
}

// Carregar contas do arquivo JSON
function loadAccounts(): Account[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar contas:', error);
  }
  return [];
}

// Salvar contas no arquivo JSON
function saveAccounts(accounts: Account[]) {
  ensureDataDir();
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

// Enviar mensagem formatada ao Telegram
async function sendMessageToTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return false;
  }

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem ao Telegram:', error);
    return false;
  }
}

// Enviar imagem ao Telegram (suporta paths locais e URLs)
async function sendPhotoToTelegram(imagePath: string, caption?: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return false;
  }

  try {
    // Se for path local (começa com /uploads/), fazer upload do arquivo
    if (imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), imagePath);
      
      if (!fs.existsSync(fullPath)) {
        console.error(`Arquivo não encontrado: ${fullPath}`);
        return false;
      }
      
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', fs.createReadStream(fullPath));
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');
      }
      
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        formData,
        { headers: formData.getHeaders() }
      );
    } else {
      // Se for URL externa, enviar diretamente
      await axios.post(`https://i.ytimg.com/vi/UhZtrhV7t3U/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB7Rlis0ADJRPE85E7RLm94IJc58w`, {
        chat_id: TELEGRAM_CHAT_ID,
        photo: imagePath,
        caption: caption || '',
        parse_mode: 'Markdown',
      });
    }
    return true;
  } catch (error: any) {
    console.error('Erro ao enviar foto ao Telegram:', error?.response?.data || error?.message || error);
    return false;
  }
}

// Enviar conta completa (mensagem + imagens)
async function sendAccountToTelegram(account: Account) {
  const message = `🎮 *Nova Conta à Venda!*

🕹️ *Jogo:* ${account.gameName}
💰 *Preço:* R$ ${account.price.toFixed(2)}
📋 *Descrição:*
${account.description}

📸 _Prints enviados abaixo_`;

  // Enviar mensagem de texto
  await sendMessageToTelegram(message);

  // Aguardar 1 segundo entre envios
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Enviar cada imagem
  for (const imageUrl of account.images) {
    await sendPhotoToTelegram(imageUrl);
    // Aguardar 3 segundos entre envios de imagens (anti-flood)
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Enviar conta para WhatsApp (grupos selecionados ou todos) - com imagens
async function sendAccountToWhatsApp(account: Account, targetGroups?: string[]): Promise<{ sent: number; failed: number }> {
  const status = getWhatsAppStatus();
  
  if (!status.isConnected) {
    console.log('[WhatsApp] Não conectado, pulando envio');
    return { sent: 0, failed: 0 };
  }

  const message = `🎮 *Nova Conta à Venda!*

🕹️ *Jogo:* ${account.gameName}
💰 *Preço:* R$ ${account.price.toFixed(2)}

📋 *Descrição:*
${account.description}

📸 _Prints enviados abaixo_

💬 Entre em contato para mais informações!`;

  try {
    const allGroups = await getWhatsAppGroups();
    
    // Usar grupos selecionados (do parâmetro ou estado) ou todos os grupos
    const selectedGroupIds = targetGroups || schedulerState.selectedGroups;
    const groups = selectedGroupIds.length > 0
      ? allGroups.filter(g => selectedGroupIds.includes(g.id))
      : allGroups;
    
    if (groups.length === 0) {
      console.log('[WhatsApp] Nenhum grupo para enviar');
      return { sent: 0, failed: 0 };
    }
    
    console.log(`[WhatsApp] Enviando para ${groups.length} grupo(s): ${groups.map(g => g.name).join(', ')}`);
    
    let sent = 0;
    let failed = 0;

    for (const group of groups) {
      try {
        // 1. Enviar mensagem de texto
        const textSuccess = await sendWhatsAppGroupMessage(group.id, message);
        if (!textSuccess) {
          failed++;
          continue;
        }
        
        // Delay antes de enviar imagens
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 2. Enviar cada imagem
        for (const imageUrl of account.images) {
          const imageSuccess = await sendWhatsAppGroupImage(group.id, imageUrl);
          if (imageSuccess) {
            console.log(`[WhatsApp] Imagem enviada para grupo ${group.name}: ${imageUrl}`);
          } else {
            console.log(`[WhatsApp] Falha ao enviar imagem para ${group.name}: ${imageUrl}`);
          }
          // Delay entre imagens (anti-flood)
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        sent++;
        console.log(`[WhatsApp] Conta com ${account.images.length} imagem(ns) enviada para grupo: ${group.name}`);
        
        // Delay entre grupos
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`[WhatsApp] Erro ao enviar para grupo ${group.name}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar conta:', error);
    return { sent: 0, failed: 0 };
  }
}

// Enviar conta para um grupo específico do WhatsApp - com imagens
async function sendAccountToWhatsAppGroup(account: Account, groupId: string): Promise<boolean> {
  const status = getWhatsAppStatus();
  
  if (!status.isConnected) {
    console.log('[WhatsApp] Não conectado');
    return false;
  }

  const message = `🎮 *Nova Conta à Venda!*

🕹️ *Jogo:* ${account.gameName}
💰 *Preço:* R$ ${account.price.toFixed(2)}

📋 *Descrição:*
${account.description}

📸 _Prints enviados abaixo_

💬 Entre em contato para mais informações!`;

  try {
    // 1. Enviar mensagem de texto
    const textSuccess = await sendWhatsAppGroupMessage(groupId, message);
    if (!textSuccess) {
      return false;
    }
    
    // Delay antes de enviar imagens
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 2. Enviar cada imagem
    for (const imageUrl of account.images) {
      const imageSuccess = await sendWhatsAppGroupImage(groupId, imageUrl);
      if (imageSuccess) {
        console.log(`[WhatsApp] Imagem enviada: ${imageUrl}`);
      } else {
        console.log(`[WhatsApp] Falha ao enviar imagem: ${imageUrl}`);
      }
      // Delay entre imagens (anti-flood)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`[WhatsApp] Conta com ${account.images.length} imagem(ns) enviada para grupo: ${groupId}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar para grupo:', error);
    return false;
  }
}

// Executar ciclo de reenvio
async function runSchedulerCycle() {
  // Verificar se está dentro do horário de envio
  const hoursCheck = isWithinSendingHours();
  if (!hoursCheck.allowed) {
    console.log(`[Scheduler] ${hoursCheck.message} - pulando envio automático`);
    return;
  }
  
  const accounts = loadAccounts();

  if (accounts.length === 0) {
    console.log('[Scheduler] Nenhuma conta para enviar');
    return;
  }

  console.log(`[Scheduler] Iniciando envio de ${accounts.length} contas (${hoursCheck.message})`);

  for (const account of accounts) {
    try {
      // Enviar para Telegram
      await sendAccountToTelegram(account);
      
      // Enviar para WhatsApp se habilitado
      if (schedulerState.sendToWhatsApp) {
        console.log(`[Scheduler] Enviando conta ${account.id} para WhatsApp...`);
        const whatsAppResult = await sendAccountToWhatsApp(account);
        console.log(`[Scheduler] WhatsApp: ${whatsAppResult.sent} enviados, ${whatsAppResult.failed} falhas`);
      }
      
      // Aguardar 5 segundos entre contas
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Erro ao enviar conta ${account.id}:`, error);
    }
  }

  console.log('[Scheduler] Ciclo concluído');
}

// Iniciar scheduler
function startScheduler(intervalMinutes: number = 60) {
  if (schedulerState.isRunning) {
    console.log('[Scheduler] Já está rodando');
    return false;
  }

  schedulerState.intervalMinutes = intervalMinutes;

  // Converter minutos para expressão cron
  // A cada N minutos: */N * * * *
  const cronExpression = `*/${intervalMinutes} * * * *`;

  try {
    schedulerState.task = cron.schedule(cronExpression, runSchedulerCycle);

    schedulerState.isRunning = true;
    console.log(`[Scheduler] Iniciado com intervalo de ${intervalMinutes} minutos`);
    return true;
  } catch (error) {
    console.error('Erro ao iniciar scheduler:', error);
    return false;
  }
}

// Parar scheduler
function stopScheduler() {
  if (!schedulerState.isRunning || !schedulerState.task) {
    console.log('[Scheduler] Não está rodando');
    return false;
  }

  schedulerState.task.stop();
  schedulerState.isRunning = false;
  console.log('[Scheduler] Parado');
  return true;
}

// Obter status do scheduler
function getSchedulerStatus() {
  const hoursStatus = getSendingHoursStatus();
  return {
    isRunning: schedulerState.isRunning,
    intervalMinutes: schedulerState.intervalMinutes,
    sendToWhatsApp: schedulerState.sendToWhatsApp,
    selectedGroups: schedulerState.selectedGroups,
    // Status do horário de envio
    sendStartHour: hoursStatus.sendStartHour,
    sendEndHour: hoursStatus.sendEndHour,
    timezone: hoursStatus.timezone,
    currentHour: hoursStatus.currentHour,
    isWithinSendingHours: hoursStatus.isWithinHours,
    sendingHoursMessage: hoursStatus.statusMessage,
  };
}

// Configurar envio para WhatsApp
function setWhatsAppEnabled(enabled: boolean) {
  schedulerState.sendToWhatsApp = enabled;
  saveConfig({ 
    selectedGroups: schedulerState.selectedGroups, 
    sendToWhatsApp: enabled 
  });
}

// Configurar grupos selecionados
function setSelectedGroups(groupIds: string[]) {
  schedulerState.selectedGroups = groupIds;
  saveConfig({ 
    selectedGroups: groupIds, 
    sendToWhatsApp: schedulerState.sendToWhatsApp 
  });
  console.log(`[Scheduler] Grupos configurados: ${groupIds.length > 0 ? groupIds.join(', ') : 'todos'}`);
}

// Obter grupos selecionados
function getSelectedGroups(): string[] {
  return schedulerState.selectedGroups;
}

// Listar grupos disponíveis (WhatsApp)
async function listAvailableGroups() {
  const status = getWhatsAppStatus();
  if (!status.isConnected) {
    return { whatsapp: [] };
  }
  
  const groups = await getWhatsAppGroups();
  return {
    whatsapp: groups.map(g => ({
      id: g.id,
      name: g.name,
      participantCount: g.participantCount,
      selected: schedulerState.selectedGroups.includes(g.id)
    }))
  };
}

// Interface para dados do vendedor
interface SellerInfo {
  sellerName?: string;
  sellerContact?: string;
  sellerEmail?: string;
  sellerNotes?: string;
}

// Adicionar nova conta
function addAccount(
  gameName: string, 
  price: number, 
  description: string, 
  images: string[],
  sellerInfo?: SellerInfo
): Account {
  const accounts = loadAccounts();
  const newAccount: Account = {
    id: Date.now().toString(),
    gameName,
    price,
    description,
    images,
    createdAt: Date.now(),
    // Adicionar informações do vendedor se fornecidas
    ...(sellerInfo?.sellerName && { sellerName: sellerInfo.sellerName }),
    ...(sellerInfo?.sellerContact && { sellerContact: sellerInfo.sellerContact }),
    ...(sellerInfo?.sellerEmail && { sellerEmail: sellerInfo.sellerEmail }),
    ...(sellerInfo?.sellerNotes && { sellerNotes: sellerInfo.sellerNotes }),
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // Enviar imediatamente ao Telegram
  sendAccountToTelegram(newAccount).catch(error => {
    console.error('Erro ao enviar conta ao Telegram:', error);
  });

  return newAccount;
}

// Remover conta
function removeAccount(accountId: string): boolean {
  const accounts = loadAccounts();
  const filteredAccounts = accounts.filter(acc => acc.id !== accountId);

  if (filteredAccounts.length === accounts.length) {
    return false; // Conta não encontrada
  }

  saveAccounts(filteredAccounts);
  return true;
}

// Atualizar conta existente
function updateAccount(
  accountId: string, 
  updates: { 
    gameName?: string; 
    price?: number; 
    description?: string;
    sellerName?: string;
    sellerContact?: string;
    sellerEmail?: string;
    sellerNotes?: string;
  }
): Account | null {
  const accounts = loadAccounts();
  const accountIndex = accounts.findIndex(acc => acc.id === accountId);

  if (accountIndex === -1) {
    return null; // Conta não encontrada
  }

  // Atualizar campos da conta
  if (updates.gameName !== undefined) {
    accounts[accountIndex].gameName = updates.gameName;
  }
  if (updates.price !== undefined) {
    accounts[accountIndex].price = updates.price;
  }
  if (updates.description !== undefined) {
    accounts[accountIndex].description = updates.description;
  }
  
  // Atualizar campos do vendedor (controle interno)
  if (updates.sellerName !== undefined) {
    accounts[accountIndex].sellerName = updates.sellerName || undefined;
  }
  if (updates.sellerContact !== undefined) {
    accounts[accountIndex].sellerContact = updates.sellerContact || undefined;
  }
  if (updates.sellerEmail !== undefined) {
    accounts[accountIndex].sellerEmail = updates.sellerEmail || undefined;
  }
  if (updates.sellerNotes !== undefined) {
    accounts[accountIndex].sellerNotes = updates.sellerNotes || undefined;
  }

  saveAccounts(accounts);
  return accounts[accountIndex];
}

// Obter conta por ID
function getAccountById(accountId: string): Account | null {
  const accounts = loadAccounts();
  return accounts.find(acc => acc.id === accountId) || null;
}

// Obter todas as contas
function getAllAccounts(): Account[] {
  return loadAccounts();
}

export {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  setWhatsAppEnabled,
  setSelectedGroups,
  getSelectedGroups,
  listAvailableGroups,
  addAccount,
  removeAccount,
  updateAccount,
  getAccountById,
  getAllAccounts,
  sendAccountToTelegram,
  sendAccountToWhatsApp,
  sendAccountToWhatsAppGroup,
  // Funções de horário de envio
  setSendingHours,
  getSendingHoursStatus,
  isWithinSendingHours,
};