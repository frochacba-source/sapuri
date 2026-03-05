import { Router, Request, Response } from 'express';
import {
  connectWhatsApp,
  disconnectWhatsApp,
  logoutWhatsApp,
  sendWhatsAppMessage,
  sendWhatsAppMessages,
  getWhatsAppStatus,
  getWhatsAppQrCode,
  checkWhatsAppNumber,
  getMessageHistory,
  getWhatsAppGroups,
  sendWhatsAppGroupMessage,
  getWhatsAppHealthStatus,
  resetReconnectionAttempts,
  forceReconnect,
} from './whatsapp-web-client';

const router = Router();

/**
 * GET /api/whatsapp/status
 * Obter status da conexão WhatsApp
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = getWhatsAppStatus();
    res.json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

/**
 * GET /api/whatsapp/qr-code
 * Obter QR Code em formato base64
 */
router.get('/qr-code', (req: Request, res: Response) => {
  try {
    const qrCode = getWhatsAppQrCode();
    const status = getWhatsAppStatus();

    res.json({
      success: true,
      qrCode,
      status,
      message: qrCode ? 'QR Code disponível - escaneie com seu WhatsApp' : 'Aguardando QR Code...',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

/**
 * POST /api/whatsapp/connect
 * Iniciar conexão WhatsApp
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    console.log('[WhatsApp Routes] Iniciando conexão...');
    await connectWhatsApp();

    const status = getWhatsAppStatus();
    res.json({
      success: true,
      message: 'Conexão iniciada. Aguarde o QR Code.',
      status,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao conectar:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao conectar',
    });
  }
});

/**
 * POST /api/whatsapp/disconnect
 * Desconectar do WhatsApp
 */
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    await disconnectWhatsApp();
    res.json({
      success: true,
      message: 'Desconectado com sucesso',
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao desconectar',
    });
  }
});

/**
 * POST /api/whatsapp/logout
 * Fazer logout completo
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    await logoutWhatsApp();
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao fazer logout:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer logout',
    });
  }
});

/**
 * POST /api/whatsapp/send-message
 * Enviar mensagem individual
 */
router.post('/send-message', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, text } = req.body;

    if (!phoneNumber || !text) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber e text são obrigatórios',
      });
    }

    const sent = await sendWhatsAppMessage(phoneNumber, text);

    res.json({
      success: sent,
      message: sent ? 'Mensagem enviada com sucesso' : 'Falha ao enviar mensagem',
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
    });
  }
});

/**
 * POST /api/whatsapp/send-messages
 * Enviar múltiplas mensagens
 */
router.post('/send-messages', async (req: Request, res: Response) => {
  try {
    const { members, text } = req.body;

    if (!members || !Array.isArray(members) || !text) {
      return res.status(400).json({
        success: false,
        error: 'members (array) e text são obrigatórios',
      });
    }

    const result = await sendWhatsAppMessages(members, text);

    res.json({
      success: true,
      result,
      message: `${result.success} mensagens enviadas, ${result.failed} falharam`,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao enviar mensagens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar mensagens',
    });
  }
});

/**
 * POST /api/whatsapp/check-number
 * Verificar se número tem WhatsApp
 */
router.post('/check-number', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber é obrigatório',
      });
    }

    const hasWhatsApp = await checkWhatsAppNumber(phoneNumber);

    res.json({
      success: true,
      hasWhatsApp,
      message: hasWhatsApp ? 'Número tem WhatsApp' : 'Número não tem WhatsApp',
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao verificar número:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao verificar número',
    });
  }
});

/**
 * GET /api/whatsapp/message-history
 * Obter histórico de mensagens
 */
router.get('/message-history', (req: Request, res: Response) => {
  try {
    const history = getMessageHistory();
    res.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao obter histórico:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao obter histórico',
    });
  }
});

/**
 * GET /api/whatsapp/groups
 * Listar todos os grupos do WhatsApp
 */
router.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await getWhatsAppGroups();
    res.json({
      success: true,
      groups,
      count: groups.length,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao listar grupos:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao listar grupos',
    });
  }
});

/**
 * POST /api/whatsapp/send-group-message
 * Enviar mensagem para um grupo
 */
router.post('/send-group-message', async (req: Request, res: Response) => {
  try {
    const { groupId, text } = req.body;

    if (!groupId || !text) {
      return res.status(400).json({
        success: false,
        error: 'groupId e text são obrigatórios',
      });
    }

    const sent = await sendWhatsAppGroupMessage(groupId, text);

    res.json({
      success: sent,
      message: sent ? 'Mensagem enviada com sucesso para o grupo' : 'Falha ao enviar mensagem para o grupo',
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao enviar mensagem para grupo:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar mensagem para grupo',
    });
  }
});

/**
 * GET /api/whatsapp/health
 * Obter status de saúde detalhado do WhatsApp
 * Inclui informações de reconexão, keep-alive, sessão, etc.
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const health = getWhatsAppHealthStatus();
    
    // Definir código HTTP baseado no status
    const httpStatus = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao obter health status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao obter health status',
      health: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    });
  }
});

/**
 * POST /api/whatsapp/reset-reconnection
 * Resetar contador de reconexão para permitir novas tentativas
 */
router.post('/reset-reconnection', (req: Request, res: Response) => {
  try {
    resetReconnectionAttempts();
    const health = getWhatsAppHealthStatus();
    
    res.json({
      success: true,
      message: 'Estado de reconexão resetado com sucesso',
      health,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao resetar reconexão:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao resetar reconexão',
    });
  }
});

/**
 * POST /api/whatsapp/force-reconnect
 * Forçar reconexão imediata do WhatsApp
 */
router.post('/force-reconnect', async (req: Request, res: Response) => {
  try {
    console.log('[WhatsApp Routes] Reconexão forçada solicitada...');
    const success = await forceReconnect();
    const health = getWhatsAppHealthStatus();
    
    res.json({
      success,
      message: success ? 'Reconexão iniciada com sucesso' : 'Falha ao iniciar reconexão',
      health,
    });
  } catch (error) {
    console.error('[WhatsApp Routes] Erro ao forçar reconexão:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao forçar reconexão',
    });
  }
});

export default router;
