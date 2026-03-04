import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { invokeLLM } from "../_core/llm";

export const recommendationsRouter = router({
  getCardRecommendations: publicProcedure
    .input(z.object({ 
      characterId: z.number(),
      characterName: z.string(),
      characterClass: z.string(),
      characterType: z.string(),
      hp: z.number().optional(),
      atk: z.number().optional(),
      def: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Buscar todas as cartas
        const allCards = await db.getAllCards();
        
        if (allCards.length === 0) {
          return { 
            success: true, 
            recommendations: [],
            message: 'Nenhuma carta cadastrada no sistema'
          };
        }
        
        // Preparar descrição das cartas
        const cardsDescription = allCards.map(card => {
          const dmg = card.bonusDmg ? parseFloat(card.bonusDmg) : 0;
          const def = card.bonusDef ? parseFloat(card.bonusDef) : 0;
          return `- ${card.name}: DMG=${dmg}, DEF=${def}, Efeito: ${card.skillEffect || 'N/A'}`;
        }).join('\n');
        
        const prompt = `Você é um especialista em Saint Seiya: Lendas da Justiça.

Cavaleiro Analisado:
- Nome: ${input.characterName}
- Classe: ${input.characterClass}
- Tipo: ${input.characterType}
- HP: ${input.hp || 'N/A'}
- ATK: ${input.atk || 'N/A'}
- DEF: ${input.def || 'N/A'}

Observe que as cartas têm bônus em diferentes atributos (DMG, DEF, Vidância, Pressão, Esquiva, Vel.Ataque, Tenacidade, Sanguessuga, RedDano, TaxCrit).

Cartas Disponíveis:
${cardsDescription}

Analise os atributos do cavaleiro e recomende as 3-5 melhores cartas para ele. Para cada recomendação, explique brevemente por que essa carta é ideal.

Responda em formato JSON com a seguinte estrutura:
{
  "recommendations": [
    {
      "cardName": "nome da carta",
      "reason": "explicação breve de por que essa carta é ideal",
      "priority": "Alta/Média/Baixa"
    }
  ],
  "analysis": "análise geral do cavaleiro e sua melhor estratégia de cartas"
}`;
        
        // Chamar LLM para gerar recomendações
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'Você é um especialista em Saint Seiya: Lendas da Justiça e recomenda cartas ideais para cavaleiros.' },
            { role: 'user', content: prompt }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'card_recommendations',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        cardName: { type: 'string' },
                        reason: { type: 'string' },
                        priority: { type: 'string', enum: ['Alta', 'Média', 'Baixa'] }
                      },
                      required: ['cardName', 'reason', 'priority']
                    }
                  },
                  analysis: { type: 'string' }
                },
                required: ['recommendations', 'analysis']
              }
            }
          }
        });
        
        // Parsear resposta da IA
        const content = response.choices[0].message.content;
        const recommendations = typeof content === 'string' ? JSON.parse(content) : content;
        
        // Enriquecer recomendações com dados das cartas
        const enrichedRecommendations = recommendations.recommendations.map((rec: any) => {
          const card = allCards.find(c => c.name.toLowerCase() === rec.cardName.toLowerCase() || c.name.toLowerCase().includes(rec.cardName.toLowerCase()));
          return {
            ...rec,
            cardId: card?.id || null,
            cardData: card || null
          };
        });
        
        return {
          success: true,
          recommendations: enrichedRecommendations,
          analysis: recommendations.analysis,
          characterName: input.characterName
        };
      } catch (error) {
        console.error('[Recommendations] Erro ao gerar recomendações:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao gerar recomendações com IA' });
      }
    }),
});
