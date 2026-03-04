/**
 * Scraper para extrair dados das Arayashiki (cartas) do ssloj.com em português
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ArayashikiCard {
  id: string;
  namePortuguese: string;
  nameEnglish: string;
  description: string;
  rarity: number; // 1-6 stars
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: {
    dmgBoost?: number;
    precision?: number;
    atkSpeed?: number;
    defBoost?: number;
    hpBoost?: number;
    dodge?: number;
    tenacity?: number;
    crit?: number;
    healing?: number;
    lifeDrain?: number;
    dmgReduced?: number;
    haste?: number;
  };
  recommendedCharacters: string[]; // Array of character IDs
  xpRequired: number;
  imageUrl: string;
  sourceUrl: string;
}

/**
 * Extrair todas as cartas do ssloj.com/arayashikis
 */
export async function scrapeArayashikiList(): Promise<ArayashikiCard[]> {
  try {
    console.log('[Arayashiki Scraper] Iniciando scrape de cartas...');
    
    const response = await axios.get('https://ssloj.com/arayashikis', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const cards: ArayashikiCard[] = [];

    // Extract card links from the list
    $('a[href*="/arayashikis/"]').each((index, element) => {
      const href = $(element).attr('href');
      if (href && !href.includes('back') && href !== '/arayashikis') {
        const cardId = href.split('/').pop();
        if (cardId && cardId.length > 0) {
          const sourceUrl = `https://ssloj.com${href}`;
          cards.push({
            id: cardId,
            namePortuguese: '',
            nameEnglish: '',
            description: '',
            rarity: 0,
            quality: 'common',
            attributes: {},
            recommendedCharacters: [],
            xpRequired: 0,
            imageUrl: '',
            sourceUrl
          });
        }
      }
    });

    console.log(`[Arayashiki Scraper] Encontradas ${cards.length} cartas`);
    return cards;
  } catch (error) {
    console.error('[Arayashiki Scraper] Erro ao fazer scrape da lista:', error);
    return [];
  }
}

/**
 * Extrair detalhes de uma carta específica
 */
export async function scrapeCardDetails(cardUrl: string): Promise<ArayashikiCard | null> {
  try {
    console.log(`[Arayashiki Scraper] Extraindo detalhes: ${cardUrl}`);
    
    const response = await axios.get(cardUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const cardId = cardUrl.split('/').pop() || '';

    // Extract card name (Portuguese - main title)
    const namePortuguese = $('h1, .card-title, [class*="name"]').first().text().trim() || 'Unknown';

    // Extract description (full ability text)
    const description = $('p, div[class*="description"], .card-description, [class*="effect"]')
      .filter((i, el) => {
        const text = $(el).text();
        return text.length > 20; // Filter out short text
      })
      .first()
      .text()
      .trim();

    // Extract rarity (count stars)
    const starCount = $('span').filter((i, el) => {
      const text = $(el).text();
      return text.includes('⭐');
    }).length;
    const rarity = Math.min(starCount || 1, 6);

    // Determine quality based on rarity
    let quality: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    if (rarity >= 5) quality = 'legendary';
    else if (rarity >= 4) quality = 'epic';
    else if (rarity >= 3) quality = 'rare';

    // Extract attributes
    const attributes: ArayashikiCard['attributes'] = {};
    const pageText = $.text();

    // Parse attribute values using regex patterns
    const dmgMatch = pageText.match(/(?:DMG|Dano|Damage|Bôn\.?\s*DMG)[:\s]+([0-9.]+)%?/i);
    if (dmgMatch) attributes.dmgBoost = parseFloat(dmgMatch[1]);

    const precisionMatch = pageText.match(/(?:Precisão|Precision|Hit)[:\s]+([0-9.]+)/i);
    if (precisionMatch) attributes.precision = parseFloat(precisionMatch[1]);

    const atkSpeedMatch = pageText.match(/(?:Vel\.?\s*Ataq|ATK Speed|Velocidade)[:\s]+([0-9.]+)%?/i);
    if (atkSpeedMatch) attributes.atkSpeed = parseFloat(atkSpeedMatch[1]);

    const defMatch = pageText.match(/(?:DEF|Defesa|Defense)[:\s]+([0-9.]+)%?/i);
    if (defMatch) attributes.defBoost = parseFloat(defMatch[1]);

    const hpMatch = pageText.match(/(?:HP|Vida|Health)[:\s]+([0-9.]+)%?/i);
    if (hpMatch) attributes.hpBoost = parseFloat(hpMatch[1]);

    // Extract recommended characters (from canvas elements with character IDs)
    const recommendedCharacters: string[] = [];
    $('canvas[id*="touxiang"]').each((i, el) => {
      const canvasId = $(el).attr('id') || '';
      // Extract character ID from canvas ID like "canvas-touxiang_xingshi_sheshou"
      const charMatch = canvasId.match(/touxiang_(.+)/);
      if (charMatch) {
        recommendedCharacters.push(charMatch[1]);
      }
    });

    // Extract XP required
    const xpMatch = pageText.match(/XP\s*required[:\s]+([0-9,]+)/i);
    const xpRequired = xpMatch ? parseInt(xpMatch[1].replace(/,/g, '')) : 0;

    // Extract image URL
    const imageUrl = $('img[class*="card"], img[class*="arayashiki"]').first().attr('src') || '';

    const card: ArayashikiCard = {
      id: cardId,
      namePortuguese,
      nameEnglish: namePortuguese, // Use Portuguese as fallback for English
      description,
      rarity,
      quality,
      attributes,
      recommendedCharacters,
      xpRequired,
      imageUrl,
      sourceUrl: cardUrl
    };

    console.log(`[Arayashiki Scraper] Carta extraída: ${namePortuguese} (${rarity}⭐, ${quality})`);
    return card;
  } catch (error) {
    console.error(`[Arayashiki Scraper] Erro ao extrair detalhes:`, error);
    return null;
  }
}

/**
 * Extrair todas as cartas com detalhes completos
 */
export async function scrapeAllArayashikisWithDetails(): Promise<ArayashikiCard[]> {
  try {
    console.log('[Arayashiki Scraper] Iniciando scrape completo de todas as cartas...');
    
    // Get list of cards
    const cardList = await scrapeArayashikiList();
    console.log(`[Arayashiki Scraper] Encontradas ${cardList.length} cartas para detalhar`);

    // Fetch details for each card (limit to first 50 to avoid rate limiting)
    const detailedCards: ArayashikiCard[] = [];
    const limit = Math.min(cardList.length, 50);
    
    for (let i = 0; i < limit; i++) {
      const card = cardList[i];
      const detailedCard = await scrapeCardDetails(card.sourceUrl);
      
      if (detailedCard) {
        detailedCards.push(detailedCard);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[Arayashiki Scraper] Total de cartas com detalhes: ${detailedCards.length}`);
    return detailedCards;
  } catch (error) {
    console.error('[Arayashiki Scraper] Erro ao fazer scrape completo:', error);
    return [];
  }
}

/**
 * Extrair cartas por atributo específico
 */
export async function scrapeArayashikisByAttribute(attribute: string): Promise<ArayashikiCard[]> {
  try {
    console.log(`[Arayashiki Scraper] Extraindo cartas com atributo: ${attribute}`);
    
    const url = `https://ssloj.com/arayashikis?attribute=${encodeURIComponent(attribute)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const cards: ArayashikiCard[] = [];

    $('a[href*="/arayashikis/"]').each((index, element) => {
      const href = $(element).attr('href');
      if (href && !href.includes('back')) {
        const cardId = href.split('/').pop();
        if (cardId) {
          cards.push({
            id: cardId,
            namePortuguese: $(element).text().trim(),
            nameEnglish: '',
            description: '',
            rarity: 0,
            quality: 'common',
            attributes: {},
            recommendedCharacters: [],
            xpRequired: 0,
            imageUrl: '',
            sourceUrl: `https://ssloj.com${href}`
          });
        }
      }
    });

    console.log(`[Arayashiki Scraper] Encontradas ${cards.length} cartas com atributo ${attribute}`);
    return cards;
  } catch (error) {
    console.error(`[Arayashiki Scraper] Erro ao extrair cartas por atributo:`, error);
    return [];
  }
}
