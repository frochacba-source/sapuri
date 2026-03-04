import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Telegram Bot Credentials', () => {
  it('should validate Telegram bot token and chat ID', async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    expect(token).toBeDefined();
    expect(chatId).toBeDefined();

    // Test bot token format
    expect(token).toMatch(/^\d+:[\w-]+$/);

    // Test chat ID format (should be negative for groups)
    expect(chatId).toBeDefined();

    // Test connection to Telegram API
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${token}/getMe`
      );
      
      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(response.data.result).toBeDefined();
      expect(response.data.result.id).toBe(8425089071);
      
      console.log('✅ Telegram bot credentials validated successfully');
    } catch (error) {
      console.error('❌ Failed to validate Telegram credentials:', error);
      throw error;
    }
  });
});
