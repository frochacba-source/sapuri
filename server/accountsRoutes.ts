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
    const { gameName, price, description } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!gameName || !price || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios: gameName, price, description' });
    }

    // Gerar URLs das imagens
    const imageUrls = files
      ? files.map((file) => `/uploads/painel-contas/${file.filename}`)
      : [];

    // Adicionar conta (também envia ao Telegram)
    const account = await accountScheduler.addAccount(
      gameName,
      parseFloat(price),
      description,
      imageUrls
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

export default router;
