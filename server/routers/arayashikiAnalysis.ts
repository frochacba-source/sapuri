/**
 * Router tRPC para análise de Arayashiki (cartas) com IA
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  getAllArayashikis,
  getArayashikiById,
  searchArayashikis,
  getArayashikisByAttribute,
  getArayashikisByQuality,
  createArayashiki,
  updateArayashiki,
  deleteArayashiki,
  getArayashikiSynergies,
  createArayashikiSynergy,
} from '../db';
import { invokeLLM } from '../_core/llm';

export const arayashikiAnalysisRouter = router({
  /**
   * Listar todas as cartas
   */
  listAll: publicProcedure.query(async () => {
    try {
      const cards = await getAllArayashikis();
      return {
        success: true,
        data: cards,
        count: Array.isArray(cards) ? cards.length : 0
      };
    } catch (error) {
      console.error('[Arayashiki Analysis] Erro ao listar cartas:', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: 'Erro ao listar cartas'
      };
    }
  }),

  /**
   * Buscar cartas por nome ou atributo
   */
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const cards = await searchArayashikis(input.query);
        return {
          success: true,
          data: cards,
          count: Array.isArray(cards) ? cards.length : 0
        };
      } catch (error) {
        console.error('[Arayashiki Analysis] Erro ao buscar cartas:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Erro ao buscar cartas'
        };
      }
    }),

  /**
   * Analisar cartas para um cavaleiro com IA
   */
  analyzeForCharacter: publicProcedure
    .input(z.object({
      characterName: z.string().min(1),
      characterAttributes: z.object({
        hp: z.number().optional(),
        atk: z.number().optional(),
        def: z.number().optional(),
        tenacity: z.number().optional(),
      }).optional(),
    }))
    .query(async ({ input }) => {
      try {
        // Buscar todas as cartas
        const allCards = await getAllArayashikis();
        const cardsData = Array.isArray(allCards) ? allCards : [];

        // Preparar dados para IA
        const cardsText = cardsData
          .slice(0, 50) // Limitar a 50 cartas para não sobrecarregar a IA
          .map((card: any) => `- ${card.name} (${card.quality}, ${card.attribute})`)
          .join('\n');

        const prompt = `Você é um especialista em Saint Seiya: Lendas da Justiça.

Analisando o cavaleiro: ${input.characterName}
${input.characterAttributes ? `Atributos: HP=${input.characterAttributes.hp}, ATK=${input.characterAttributes.atk}, DEF=${input.characterAttributes.def}, Tenacity=${input.characterAttributes.tenacity}` : ''}

Cartas disponíveis:
${cardsText}

Recomende as 5 melhores cartas para este cavaleiro, explicando por quê. Considere sinergias, atributos e estratégia.`;

        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de cartas para Saint Seiya: Lendas da Justiça. Forneça recomendações precisas e bem fundamentadas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        let analysis = 'Desculpe, não consegui gerar análise.';
        if (response.choices?.[0]?.message?.content) {
          const content = response.choices[0].message.content;
          analysis = Array.isArray(content) 
            ? content.map((c: any) => c.text || '').join('\n')
            : String(content);
        }

        return {
          success: true,
          characterName: input.characterName,
          analysis,
          cardsCount: cardsData.length
        };
      } catch (error) {
        console.error('[Arayashiki Analysis] Erro ao analisar cartas:', error);
        return {
          success: false,
          error: 'Erro ao analisar cartas com IA'
        };
      }
    }),

  /**
   * Analisar sinergia entre cartas com IA
   */
  analyzeSynergy: publicProcedure
    .input(z.object({
      card1Name: z.string().min(1),
      card2Name: z.string().min(1),
      characterName: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const prompt = `Você é um especialista em Saint Seiya: Lendas da Justiça.

Analise a sinergia entre estas duas cartas:
- Carta 1: ${input.card1Name}
- Carta 2: ${input.card2Name}
${input.characterName ? `- Cavaleiro: ${input.characterName}` : ''}

Explique:
1. Como essas cartas funcionam juntas
2. Qual é o nível de sinergia (baixa, média, alta)
3. Em quais situações são mais eficazes
4. Possíveis melhorias ou alternativas`;

        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de sinergias de cartas para Saint Seiya: Lendas da Justiça.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        let analysis = 'Desculpe, não consegui gerar análise de sinergia.';
        if (response.choices?.[0]?.message?.content) {
          const content = response.choices[0].message.content;
          analysis = Array.isArray(content)
            ? content.map((c: any) => c.text || '').join('\n')
            : String(content);
        }

        return {
          success: true,
          card1: input.card1Name,
          card2: input.card2Name,
          analysis
        };
      } catch (error) {
        console.error('[Arayashiki Analysis] Erro ao analisar sinergia:', error);
        return {
          success: false,
          error: 'Erro ao analisar sinergia com IA'
        };
      }
    }),

  /**
   * Gerar composição de cartas otimizada com IA
   */
  generateOptimalBuild: publicProcedure
    .input(z.object({
      characterName: z.string().min(1),
      role: z.enum(['attacker', 'defender', 'support']),
      budget: z.enum(['low', 'medium', 'high']).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const allCards = await getAllArayashikis();
        const cardsData = Array.isArray(allCards) ? allCards : [];

        const cardsText = cardsData
          .slice(0, 50)
          .map((card: any) => `- ${card.name} (${card.quality}, ${card.attribute})`)
          .join('\n');

        const prompt = `Você é um especialista em construção de decks para Saint Seiya: Lendas da Justiça.

Crie uma composição otimizada de cartas para:
- Cavaleiro: ${input.characterName}
- Papel: ${input.role === 'attacker' ? 'Atacante' : input.role === 'defender' ? 'Defensor' : 'Suporte'}
${input.budget ? `- Orçamento: ${input.budget === 'low' ? 'Baixo (cartas comuns)' : input.budget === 'medium' ? 'Médio' : 'Alto (cartas raras)'}` : ''}

Cartas disponíveis:
${cardsText}

Recomende 5 cartas que funcionem bem juntas, explicando a estratégia geral do deck.`;

        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em construção de decks otimizados para Saint Seiya: Lendas da Justiça.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        let build = 'Desculpe, não consegui gerar composição.';
        if (response.choices?.[0]?.message?.content) {
          const content = response.choices[0].message.content;
          build = Array.isArray(content)
            ? content.map((c: any) => c.text || '').join('\n')
            : String(content);
        }

        return {
          success: true,
          characterName: input.characterName,
          role: input.role,
          build
        };
      } catch (error) {
        console.error('[Arayashiki Analysis] Erro ao gerar build:', error);
        return {
          success: false,
          error: 'Erro ao gerar composição otimizada'
        };
      }
    }),
});
