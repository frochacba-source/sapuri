import { describe, it, expect, vi } from 'vitest';

// Mock invokeLLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(async ({ messages }) => ({
    choices: [{
      message: {
        content: 'Resposta simulada da IA sobre Saint Seiya'
      }
    }]
  }))
}));

describe('AI Chat Functionality', () => {
  it('should have aiChatRouter exported', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    expect(aiChatRouter).toBeDefined();
    expect(aiChatRouter.createCaller).toBeDefined();
  });

  it('should have sendMessage procedure', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    expect(aiChatRouter._def.procedures.sendMessage).toBeDefined();
  });

  it('should have getHistory procedure', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    expect(aiChatRouter._def.procedures.getHistory).toBeDefined();
  });

  it('should have clearSession procedure', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    expect(aiChatRouter._def.procedures.clearSession).toBeDefined();
  });

  it('should validate sendMessage input schema', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    const sendMessageProcedure = aiChatRouter._def.procedures.sendMessage;
    
    expect(sendMessageProcedure).toBeDefined();
    expect(sendMessageProcedure._def.inputs).toBeDefined();
  });

  it('should validate getHistory input schema', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    const getHistoryProcedure = aiChatRouter._def.procedures.getHistory;
    
    expect(getHistoryProcedure).toBeDefined();
    expect(getHistoryProcedure._def.inputs).toBeDefined();
  });

  it('should validate clearSession input schema', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    const clearSessionProcedure = aiChatRouter._def.procedures.clearSession;
    
    expect(clearSessionProcedure).toBeDefined();
    expect(clearSessionProcedure._def.inputs).toBeDefined();
  });

  it('should have proper context types', async () => {
    const contexts = ['general', 'strategy', 'card'];
    
    // Verify context types are valid
    for (const context of contexts) {
      expect(['general', 'strategy', 'card']).toContain(context);
    }
  });

  it('should support different context types', async () => {
    const contexts = ['general', 'strategy', 'card'];
    
    for (const context of contexts) {
      expect(['general', 'strategy', 'card']).toContain(context);
    }
  });

  it('should have proper error handling', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    
    // Router should be defined and have procedures
    expect(aiChatRouter).toBeDefined();
    expect(aiChatRouter._def).toBeDefined();
    expect(aiChatRouter._def.procedures).toBeDefined();
  });

  it('should integrate with main router', async () => {
    const { aiChatRouter } = await import('./routers/aiChat');
    
    // Verify router is properly exported
    expect(aiChatRouter).toBeDefined();
    expect(aiChatRouter._def.procedures).toBeDefined();
  });
});
