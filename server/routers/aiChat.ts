import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { getDb, getAllCards } from "../db";

// In-memory chat history (in production, use database)
const chatSessions = new Map<string, Array<{ role: 'user' | 'assistant', content: string }>>();

export const aiChatRouter = router({
  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      message: z.string(),
      context: z.string().optional().default('general'), // 'general', 'strategy', 'card'
    }))
    .mutation(async ({ input }) => {
      try {
        const { sessionId, message, context } = input;

        // Initialize session if needed
        if (!chatSessions.has(sessionId)) {
          chatSessions.set(sessionId, []);
        }

        const history = chatSessions.get(sessionId)!;

        // Add user message to history
        history.push({ role: 'user', content: message });

        // Build system prompt based on context
        let systemPrompt = 'Você é um assistente especializado em Saint Seiya: Lendas da Justiça.';
        let contextInfo = '';
        
        if (context === 'strategy') {
          systemPrompt += ' Você ajuda a analisar e melhorar estratégias de combate, recomendando cavaleiros, cartas e composições.';
        } else if (context === 'card') {
          systemPrompt += ' Você é especialista em cartas do jogo, ajudando a escolher as melhores cartas para cada situação. IMPORTANTE: Você DEVE usar APENAS as informações das cartas fornecidas abaixo. NÃO invente ou alucinhe informações sobre cartas que não estão na lista.';
          
          // Buscar todas as cartas do banco
          try {
            const allCards = await getAllCards();
            if (allCards && allCards.length > 0) {
              contextInfo = '\n\nCARTAS DISPONÍVEIS NO SISTEMA:\n';
              allCards.forEach((card: any) => {
                contextInfo += `\n- **${card.name}**\n`;
                contextInfo += `  Uso: ${card.usageLimit}\n`;
                if (card.bonusDmg && card.bonusDmg !== '0') contextInfo += `  DMG: +${card.bonusDmg}%\n`;
                if (card.bonusDef && card.bonusDef !== '0') contextInfo += `  Defesa: +${card.bonusDef}%\n`;
                if (card.bonusVid && card.bonusVid !== '0') contextInfo += `  Resistência: +${card.bonusVid}%\n`;
                if (card.bonusPress && card.bonusPress !== '0') contextInfo += `  Pressa: +${card.bonusPress}\n`;
                if (card.bonusEsquiva && card.bonusEsquiva !== '0') contextInfo += `  Esquiva: +${card.bonusEsquiva}%\n`;
                if (card.bonusVelAtaq && card.bonusVelAtaq !== '0') contextInfo += `  Vel. Ataque: +${card.bonusVelAtaq}%\n`;
                if (card.bonusTenacidade && card.bonusTenacidade !== '0') contextInfo += `  Tenacidade: +${card.bonusTenacidade}\n`;
                if (card.bonusSanguessuga && card.bonusSanguessuga !== '0') contextInfo += `  Sanguessuga: +${card.bonusSanguessuga}\n`;
                if (card.bonusRedDano && card.bonusRedDano !== '0') contextInfo += `  Red. Dano: +${card.bonusRedDano}%\n`;
                if (card.bonusCrit && card.bonusCrit !== '0') contextInfo += `  Tax. Crítico: +${card.bonusCrit}\n`;
                if (card.bonusCura && card.bonusCura !== '0') contextInfo += `  Cura: +${card.bonusCura}%\n`;
                if (card.bonusCuraRecebida && card.bonusCuraRecebida !== '0') contextInfo += `  Cura Recebida: +${card.bonusCuraRecebida}%\n`;
                if (card.bonusPrecisao && card.bonusPrecisao !== '0') contextInfo += `  Precisão: +${card.bonusPrecisao}\n`;
                if (card.skillEffect) contextInfo += `  Efeito: ${card.skillEffect}\n`;
              });
            }
          } catch (error) {
            console.error('[AI Chat] Erro ao buscar cartas:', error);
          }
        } else {
          systemPrompt += ' Você responde perguntas sobre o jogo, cavaleiros, estratégias e cartas de forma concisa e útil.';
        }
        
        systemPrompt += contextInfo;

        // Prepare messages for LLM (keep last 10 messages for context)
        const recentHistory = history.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
        
        // Se for contexto de cartas, adicionar instrução no final do histórico
        if (context === 'card' && recentHistory.length > 0) {
          recentHistory[recentHistory.length - 1].content += '\n\n[IMPORTANTE: Responda APENAS com base nas cartas listadas acima. Se a carta não estiver na lista, diga que ela não está cadastrada no sistema.]';
        }

        // Call LLM
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            ...recentHistory
          ]
        });

        const assistantMessage = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);

        // Add assistant response to history
        history.push({ role: 'assistant', content: assistantMessage });

        // Keep history size manageable (last 50 messages)
        if (history.length > 50) {
          chatSessions.set(sessionId, history.slice(-50));
        }

        // Se for contexto de cartas, procurar pela carta mencionada e retornar imagem
        let cardImage: string | null = null;
        if (context === 'card') {
          try {
            const allCards = await getAllCards();
            const userMessageLower = message.toLowerCase();
            const matchedCard = allCards.find((card: any) => 
              userMessageLower.includes(card.name.toLowerCase())
            );
            if (matchedCard && matchedCard.imageUrl) {
              cardImage = matchedCard.imageUrl;
            }
          } catch (error) {
            console.error('[AI Chat] Erro ao buscar imagem da carta:', error);
          }
        }

        return {
          success: true,
          response: assistantMessage,
          messageCount: history.length,
          cardImage: cardImage || undefined
        };
      } catch (error) {
        console.error('[AI Chat] Erro ao processar mensagem:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao processar mensagem com IA' });
      }
    }),

  getHistory: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(({ input }) => {
      const history = chatSessions.get(input.sessionId) || [];
      return history;
    }),

  clearSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(({ input }) => {
      chatSessions.delete(input.sessionId);
      return { success: true };
    }),
});
