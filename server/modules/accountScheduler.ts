import * as cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

interface Account {
  id: string;
  gameName: string;
  price: number;
  description: string;
  images: string[];
  createdAt: number;
}

interface SchedulerState {
  isRunning: boolean;
  intervalMinutes: number;
  task: any | null;
}

const ACCOUNTS_FILE = path.join(process.cwd(), 'server/data/contas.json');
// Credenciais específicas do Painel de Contas - envia APENAS para o grupo -5156917144
const TELEGRAM_BOT_TOKEN = process.env.PAINEL_CONTAS_BOT_TOKEN || '8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY';
const TELEGRAM_CHAT_ID = process.env.PAINEL_CONTAS_CHAT_ID || '-5156917144';

let schedulerState: SchedulerState = {
  isRunning: false,
  intervalMinutes: 60,
  task: null,
};

// Garantir que o diretório de dados existe
function ensureDataDir() {
  const dataDir = path.dirname(ACCOUNTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
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

// Executar ciclo de reenvio
async function runSchedulerCycle() {
  const accounts = loadAccounts();

  if (accounts.length === 0) {
    console.log('[Scheduler] Nenhuma conta para enviar');
    return;
  }

  console.log(`[Scheduler] Iniciando envio de ${accounts.length} contas`);

  for (const account of accounts) {
    try {
      await sendAccountToTelegram(account);
      // Aguardar 3 segundos entre contas
      await new Promise(resolve => setTimeout(resolve, 3000));
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
  return {
    isRunning: schedulerState.isRunning,
    intervalMinutes: schedulerState.intervalMinutes,
  };
}

// Adicionar nova conta
function addAccount(gameName: string, price: number, description: string, images: string[]): Account {
  const accounts = loadAccounts();
  const newAccount: Account = {
    id: Date.now().toString(),
    gameName,
    price,
    description,
    images,
    createdAt: Date.now(),
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

// Obter todas as contas
function getAllAccounts(): Account[] {
  return loadAccounts();
}

export {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  addAccount,
  removeAccount,
  getAllAccounts,
  sendAccountToTelegram,
};