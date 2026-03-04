import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';

export const cardAnalysisRouter = router({
  analyzeCard: publicProcedure
    .input(
      z.object({
        cardName: z.string().min(1, 'Nome da carta é obrigatório'),
        cardDescription: z.string().optional(),
        attributes: z.object({
          dmgBoost: z.number().optional(),
          precision: z.number().optional(),
          atkSpeed: z.number().optional(),
          defBoost: z.number().optional(),
          hpBoost: z.number().optional(),
          tenacity: z.number().optional(),
          lifesteal: z.number().optional(),
          damageReduction: z.number().optional(),
          critRate: z.number().optional(),
        }).optional(),
        rarity: z.number().min(1).max(6).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const attributesText = input.attributes
        ? Object.entries(input.attributes)
            .filter(([_, value]) => value !== undefined && value !== 0)
            .map(([key, value]) => {
              const labels: Record<string, string> = {
                dmgBoost: 'Bônus de Dano',
                precision: 'Precisão',
                atkSpeed: 'Velocidade de Ataque',
                defBoost: 'Bônus de Defesa',
                hpBoost: 'Bônus de HP',
                tenacity: 'Tenacidade',
                lifesteal: 'Sanguessuga',
                damageReduction: 'Redução de Dano',
                critRate: 'Taxa de Crítico',
              };
              return `${labels[key] || key}: ${value}`;
            })
            .join(', ')
        : 'Sem atributos específicos';

      const prompt = `
Você é um especialista em Saint Seiya: Lendas da Justiça. Analise a seguinte carta e forneça recomendações de builds:

**Carta:** ${input.cardName}
**Raridade:** ${input.rarity || 'Desconhecida'} estrelas
**Descrição:** ${input.cardDescription || 'Sem descrição'}
**Atributos:** ${attributesText}

Por favor, forneça:
1. **Melhor Papel:** Qual é o papel ideal para esta carta (Atacante, Defensor, Suporte, Híbrido)?
2. **Cavaleiros Recomendados:** Liste 3-4 cavaleiros que se beneficiam mais desta carta e por quê.
3. **Builds Sugeridos:** Sugira 2-3 builds diferentes usando esta carta com diferentes composições.
4. **Sinergia:** Quais outras cartas combinam bem com esta?
5. **Contra-Indicações:** Em quais situações esta carta NÃO é recomendada?

Forneça a resposta em formato estruturado e em português.
      `;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system' as const,
              content: 'Você é um especialista em estratégia de Saint Seiya: Lendas da Justiça. Forneça análises detalhadas e práticas sobre cartas e builds.',
            },
            {
              role: 'user' as const,
              content: prompt,
            },
          ],
        });

        const analysis = response.choices[0]?.message?.content || 'Não foi possível gerar análise';

        return {
          cardName: input.cardName,
          analysis,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Erro ao analisar carta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }),

  suggestBuilds: publicProcedure
    .input(
      z.object({
        characterName: z.string().min(1, 'Nome do cavaleiro é obrigatório'),
        characterRole: z.enum(['Atacante', 'Defensor', 'Suporte', 'Híbrido']).optional(),
        availableCards: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const cardsText = input.availableCards && input.availableCards.length > 0
        ? `Cartas disponíveis: ${input.availableCards.join(', ')}`
        : 'Sem restrição de cartas';

      const prompt = `
Você é um especialista em Saint Seiya: Lendas da Justiça. Crie builds otimizados para o cavaleiro:

**Cavaleiro:** ${input.characterName}
**Papel:** ${input.characterRole || 'Não especificado'}
${cardsText}

Por favor, forneça:
1. **Build Ofensivo:** Cartas e estratégia para maximizar dano.
2. **Build Defensivo:** Cartas e estratégia para maximizar defesa e sobrevivência.
3. **Build Balanceado:** Cartas e estratégia para um meio termo entre ataque e defesa.

Para cada build, explique:
- Quais cartas usar
- Por que essas cartas funcionam bem com este cavaleiro
- Ordem de ativação das habilidades
- Contra-estratégias

Forneça a resposta em formato estruturado e em português.
      `;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system' as const,
              content: 'Você é um especialista em estratégia de Saint Seiya: Lendas da Justiça. Crie builds práticos e eficazes.',
            },
            {
              role: 'user' as const,
              content: prompt,
            },
          ],
        });

        const builds = response.choices[0]?.message?.content || 'Não foi possível gerar builds';

        return {
          characterName: input.characterName,
          builds,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Erro ao sugerir builds: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }),

  compareCards: publicProcedure
    .input(
      z.object({
        card1Name: z.string().min(1, 'Nome da primeira carta é obrigatório'),
        card2Name: z.string().min(1, 'Nome da segunda carta é obrigatório'),
        card1Attributes: z.record(z.string(), z.number()).optional(),
        card2Attributes: z.record(z.string(), z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `
Você é um especialista em Saint Seiya: Lendas da Justiça. Compare as seguintes cartas:

**Carta 1:** ${input.card1Name}
**Atributos:** ${input.card1Attributes ? JSON.stringify(input.card1Attributes) : 'Não especificados'}

**Carta 2:** ${input.card2Name}
**Atributos:** ${input.card2Attributes ? JSON.stringify(input.card2Attributes) : 'Não especificados'}

Por favor, forneça:
1. **Comparação de Atributos:** Qual é melhor em cada aspecto?
2. **Casos de Uso:** Quando usar cada uma?
3. **Recomendação:** Qual é melhor em geral e por quê?
4. **Sinergia:** Podem ser usadas juntas?

Forneça a resposta em formato estruturado e em português.
      `;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system' as const,
              content: 'Você é um especialista em comparação de cartas de Saint Seiya: Lendas da Justiça.',
            },
            {
              role: 'user' as const,
              content: prompt,
            },
          ],
        });

        const comparison = response.choices[0]?.message?.content || 'Não foi possível fazer comparação';

        return {
          card1: input.card1Name,
          card2: input.card2Name,
          comparison,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Erro ao comparar cartas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }),
});
