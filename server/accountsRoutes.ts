import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as accountScheduler from './modules/accountScheduler';

const router = Router();

// Configurar diretório de uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'painel-contas');

// Garantir que o diretório existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `conta-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 10, // máximo 10 arquivos
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.'));
    }
  },
});

// GET /api/accounts - Lista todas as contas
router.get('/accounts', (_req, res) => {
  try {
    const accounts = accountScheduler.getAllAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao listar contas' });
  }
});

// POST /api/accounts/announce - Anuncia nova conta com upload de imagens
router.post('/accounts/announce', upload.array('images', 10), async (req, res) => {
  try {
    const { gameName, price, description, sellerName, sellerContact, sellerEmail, sellerNotes } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!gameName || !price || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios: gameName, price, description' });
    }

    // Gerar URLs das imagens
    const imageUrls = files
      ? files.map((file) => `/uploads/painel-contas/${file.filename}`)
      : [];

    // Montar informações do vendedor (controle interno)
    const sellerInfo = {
      sellerName: sellerName || undefined,
      sellerContact: sellerContact || undefined,
      sellerEmail: sellerEmail || undefined,
      sellerNotes: sellerNotes || undefined,
    };

    // Adicionar conta (também envia ao Telegram)
    const account = await accountScheduler.addAccount(
      gameName,
      parseFloat(price),
      description,
      imageUrls,
      sellerInfo
    );

    res.json({ success: true, account });
  } catch (error) {
    console.error('Erro ao anunciar conta:', error);
    res.status(500).json({ error: 'Erro ao anunciar conta' });
  }
});

// DELETE /api/accounts/:id - Remove uma conta
router.delete('/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = accountScheduler.removeAccount(id);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Conta não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao remover conta:', error);
    res.status(500).json({ error: 'Erro ao remover conta' });
  }
});

// PUT /api/accounts/:id - Edita uma conta
router.put('/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { gameName, price, description, sellerName, sellerContact, sellerEmail, sellerNotes } = req.body;

    const updatedAccount = accountScheduler.updateAccount(id, {
      gameName,
      price: price ? parseFloat(price) : undefined,
      description,
      sellerName,
      sellerContact,
      sellerEmail,
      sellerNotes,
    });

    if (updatedAccount) {
      res.json({ success: true, account: updatedAccount });
    } else {
      res.status(404).json({ error: 'Conta não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao editar conta:', error);
    res.status(500).json({ error: 'Erro ao editar conta' });
  }
});

// POST /api/accounts/:id/send-telegram - Envio manual para Telegram
router.post('/accounts/:id/send-telegram', async (req, res) => {
  try {
    const { id } = req.params;
    const account = accountScheduler.getAccountById(id);

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    await accountScheduler.sendAccountToTelegram(account);
    res.json({ success: true, message: 'Conta enviada para o Telegram' });
  } catch (error) {
    console.error('Erro ao enviar para Telegram:', error);
    res.status(500).json({ error: 'Erro ao enviar para Telegram' });
  }
});

// POST /api/accounts/:id/send-whatsapp - Envio manual para WhatsApp (todos os grupos)
router.post('/accounts/:id/send-whatsapp', async (req, res) => {
  try {
    const { id } = req.params;
    const account = accountScheduler.getAccountById(id);

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const result = await accountScheduler.sendAccountToWhatsApp(account);
    res.json({ 
      success: true, 
      message: `Conta enviada para ${result.sent} grupo(s) do WhatsApp`,
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error('Erro ao enviar para WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao enviar para WhatsApp' });
  }
});

// POST /api/scheduler/whatsapp - Ativar/Desativar envio automático WhatsApp
router.post('/scheduler/whatsapp', (req, res) => {
  try {
    const { enabled } = req.body;
    accountScheduler.setWhatsAppEnabled(enabled === true);
    res.json({ success: true, enabled: enabled === true });
  } catch (error) {
    console.error('Erro ao configurar WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao configurar WhatsApp' });
  }
});

// GET /api/scheduler/status - Status do scheduler
router.get('/scheduler/status', (_req, res) => {
  try {
    const status = accountScheduler.getSchedulerStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro ao obter status' });
  }
});

// POST /api/scheduler/start - Inicia o scheduler
router.post('/scheduler/start', (req, res) => {
  try {
    const { intervalMinutes = 60 } = req.body;
    const success = accountScheduler.startScheduler(intervalMinutes);
    res.json({ success });
  } catch (error) {
    console.error('Erro ao iniciar scheduler:', error);
    res.status(500).json({ error: 'Erro ao iniciar scheduler' });
  }
});

// POST /api/scheduler/stop - Para o scheduler
router.post('/scheduler/stop', (_req, res) => {
  try {
    const success = accountScheduler.stopScheduler();
    res.json({ success });
  } catch (error) {
    console.error('Erro ao parar scheduler:', error);
    res.status(500).json({ error: 'Erro ao parar scheduler' });
  }
});

// GET /api/accounts/groups - Lista grupos disponíveis
router.get('/accounts/groups', async (_req, res) => {
  try {
    const groups = await accountScheduler.listAvailableGroups();
    res.json(groups);
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ error: 'Erro ao listar grupos' });
  }
});

// POST /api/accounts/groups - Salva grupos selecionados
router.post('/accounts/groups', (req, res) => {
  try {
    const { groupIds } = req.body;
    
    if (!Array.isArray(groupIds)) {
      return res.status(400).json({ error: 'groupIds deve ser um array' });
    }
    
    accountScheduler.setSelectedGroups(groupIds);
    res.json({ 
      success: true, 
      selectedGroups: groupIds,
      message: groupIds.length > 0 
        ? `${groupIds.length} grupo(s) selecionado(s)` 
        : 'Envio configurado para todos os grupos'
    });
  } catch (error) {
    console.error('Erro ao configurar grupos:', error);
    res.status(500).json({ error: 'Erro ao configurar grupos' });
  }
});

// POST /api/accounts/:id/send-whatsapp-groups - Envio manual para grupos específicos
router.post('/accounts/:id/send-whatsapp-groups', async (req, res) => {
  try {
    const { id } = req.params;
    const { groupIds } = req.body;
    
    const account = accountScheduler.getAccountById(id);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    // Se groupIds fornecido, usa eles; senão usa os selecionados na config
    const targetGroups = Array.isArray(groupIds) && groupIds.length > 0 
      ? groupIds 
      : undefined;
    
    const result = await accountScheduler.sendAccountToWhatsApp(account, targetGroups);
    res.json({ 
      success: true, 
      message: `Conta enviada para ${result.sent} grupo(s) do WhatsApp`,
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error('Erro ao enviar para WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao enviar para WhatsApp' });
  }
});

export default router;
