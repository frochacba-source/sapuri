import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { scrapeAllArayashikisWithDetails } from '../scrapers/arayashiki-scraper';

export const arayashikiSyncRouter = router({
  // Sincronizar cartas do ssloj.com
  syncFromSsloj: publicProcedure
    .mutation(async () => {
      try {
        console.log('[Arayashiki Sync] Iniciando sincronização...');
        
        const cards = await scrapeAllArayashikisWithDetails();
        
        console.log(`[Arayashiki Sync] ${cards.length} cartas extraídas`);
        
        return {
          success: true,
          message: `${cards.length} cartas sincronizadas com sucesso`,
          cards: cards.map(card => ({
            id: card.id,
            namePortuguese: card.namePortuguese,
            nameEnglish: card.nameEnglish,
            description: card.description,
            rarity: card.rarity,
            quality: card.quality,
            attributes: card.attributes,
            recommendedCharacters: card.recommendedCharacters,
            xpRequired: card.xpRequired,
            imageUrl: card.imageUrl,
            sourceUrl: card.sourceUrl
          }))
        };
      } catch (error) {
        console.error('[Arayashiki Sync] Erro ao sincronizar:', error);
        return {
          success: false,
          message: 'Erro ao sincronizar cartas',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  // Buscar cartas por nome em português
  searchByName: publicProcedure
    .input(z.object({
      name: z.string().min(1)
    }))
    .query(async ({ input }) => {
      try {
        const cards = await scrapeAllArayashikisWithDetails();
        
        const filtered = cards.filter(card =>
          card.namePortuguese.toLowerCase().includes(input.name.toLowerCase()) ||
          card.nameEnglish.toLowerCase().includes(input.name.toLowerCase())
        );

        return {
          success: true,
          results: filtered.map(card => ({
            id: card.id,
            namePortuguese: card.namePortuguese,
            nameEnglish: card.nameEnglish,
            description: card.description,
            rarity: card.rarity,
            quality: card.quality,
            attributes: card.attributes,
            recommendedCharacters: card.recommendedCharacters,
            imageUrl: card.imageUrl
          }))
        };
      } catch (error) {
        console.error('[Arayashiki Search] Erro ao buscar:', error);
        return {
          success: false,
          results: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  // Obter cartas por qualidade
  getByQuality: publicProcedure
    .input(z.object({
      quality: z.enum(['common', 'rare', 'epic', 'legendary'])
    }))
    .query(async ({ input }) => {
      try {
        const cards = await scrapeAllArayashikisWithDetails();
        
        const filtered = cards.filter(card => card.quality === input.quality);

        return {
          success: true,
          results: filtered.map(card => ({
            id: card.id,
            namePortuguese: card.namePortuguese,
            rarity: card.rarity,
            quality: card.quality,
            attributes: card.attributes
          }))
        };
      } catch (error) {
        console.error('[Arayashiki Quality Filter] Erro:', error);
        return {
          success: false,
          results: []
        };
      }
    }),

  // Obter cartas por raridade
  getByRarity: publicProcedure
    .input(z.object({
      rarity: z.number().min(1).max(6)
    }))
    .query(async ({ input }) => {
      try {
        const cards = await scrapeAllArayashikisWithDetails();
        
        const filtered = cards.filter(card => card.rarity === input.rarity);

        return {
          success: true,
          results: filtered.map(card => ({
            id: card.id,
            namePortuguese: card.namePortuguese,
            rarity: card.rarity,
            quality: card.quality,
            attributes: card.attributes
          }))
        };
      } catch (error) {
        console.error('[Arayashiki Rarity Filter] Erro:', error);
        return {
          success: false,
          results: []
        };
      }
    }),

  // Obter cartas recomendadas para um cavaleiro
  getRecommendedForCharacter: publicProcedure
    .input(z.object({
      characterId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const cards = await scrapeAllArayashikisWithDetails();
        
        const recommended = cards.filter(card =>
          card.recommendedCharacters.includes(input.characterId)
        );

        return {
          success: true,
          results: recommended.map(card => ({
            id: card.id,
            namePortuguese: card.namePortuguese,
            description: card.description,
            rarity: card.rarity,
            quality: card.quality,
            attributes: card.attributes,
            imageUrl: card.imageUrl
          }))
        };
      } catch (error) {
        console.error('[Arayashiki Recommended] Erro:', error);
        return {
          success: false,
          results: []
        };
      }
    })
});
