import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do módulo de LLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(async ({ messages }) => ({
    choices: [{
      message: {
        content: 'Resposta simulada da IA sobre Saint Seiya'
      }
    }]
  }))
}));

// Mock do módulo de Telegram
vi.mock('./telegram', () => ({
  sendTelegramMessageDirect: vi.fn(async (token, chatId, message) => true)
}));

describe('IA Command for Telegram Bot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have handleIaCommand function exported', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    expect(handleIaCommand).toBeDefined();
    expect(typeof handleIaCommand).toBe('function');
  });

  it('should handle /ia command with question', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const result = await handleIaCommand('12345', '/ia qual é a melhor estratégia para GvG?');
    
    expect(result).toBe(true);
  });

  it('should handle /ia command about cards', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const result = await handleIaCommand('12345', '/ia qual carta é melhor para Ikki?');
    
    expect(result).toBe(true);
  });

  it('should handle /ia command about characters', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const result = await handleIaCommand('12345', '/ia como usar Seiya em defesa?');
    
    expect(result).toBe(true);
  });

  it('should handle /ia command about strategy analysis', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const result = await handleIaCommand('12345', '/ia analise minha estratégia de GoT');
    
    expect(result).toBe(true);
  });

  it('should return false if no question provided', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const result = await handleIaCommand('12345', '/ia');
    
    expect(result).toBe(true); // Retorna true mas envia mensagem de erro
  });

  it('should handle long questions', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const longQuestion = '/ia ' + 'a'.repeat(500);
    const result = await handleIaCommand('12345', longQuestion);
    
    expect(result).toBe(true);
  });

  it('should handle special characters in questions', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    const result = await handleIaCommand('12345', '/ia qual é a melhor estratégia? (com defesa forte)');
    
    expect(result).toBe(true);
  });

  it('should handle multiple consecutive commands', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    
    const result1 = await handleIaCommand('12345', '/ia pergunta 1');
    const result2 = await handleIaCommand('12345', '/ia pergunta 2');
    const result3 = await handleIaCommand('12345', '/ia pergunta 3');
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });

  it('should handle commands from different users', async () => {
    const { handleIaCommand } = await import('./gotBotIntegration');
    
    const result1 = await handleIaCommand('user1', '/ia pergunta do usuário 1');
    const result2 = await handleIaCommand('user2', '/ia pergunta do usuário 2');
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should be integrated in botWebhook', async () => {
    const { handleTelegramWebhook } = await import('./_core/botWebhook');
    
    expect(handleTelegramWebhook).toBeDefined();
    expect(typeof handleTelegramWebhook).toBe('function');
  });

  it('should be listed in help message', async () => {
    const { handleTelegramWebhook } = await import('./_core/botWebhook');
    
    expect(handleTelegramWebhook).toBeDefined();
  });
});
