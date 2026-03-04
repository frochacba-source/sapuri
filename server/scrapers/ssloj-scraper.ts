import axios from 'axios';
import * as cheerio from 'cheerio';

const SSLOJ_BASE_URL = 'https://ssloj.com';
const CHARACTERS_URL = `${SSLOJ_BASE_URL}/characters`;

interface CharacterData {
  id: number;
  name: string;
  class: string;
  type: string;
  summon_type?: string;
  release_date?: string;
  stars?: number;
  level?: number;
  hp?: number;
  atk?: number;
  def?: number;
  attack_rate?: number;
  tenacity?: number;
  cosmos_gain_atk?: number;
  cosmos_gain_dmg?: number;
  image_url?: string;
  ssloj_url: string;
}

interface CharacterDetail extends CharacterData {
  skills?: SkillData[];
  cloth?: ClothData[];
  constellations?: ConstellationData[];
  links?: LinkData[];
}

interface SkillData {
  skill_name: string;
  skill_type: string;
  description: string;
  start_time?: number;
  end_time?: number;
  delay?: number;
  cooldown?: number;
  cosmos_gain_atk?: number;
  cosmos_gain_dmg?: number;
}

interface ClothData {
  level: number;
  description: string;
  hp_boost?: number;
  atk_boost?: number;
  def_boost?: number;
  haste?: number;
}

interface ConstellationData {
  constellation_name: string;
  description: string;
  level: string;
  hp_boost?: number;
  dodge?: number;
  atk_boost?: number;
  crit?: number;
  def_boost?: number;
  hit?: number;
}

interface LinkData {
  link_name: string;
  description: string;
  level: number;
}

/**
 * Scraper para extrair dados dos cavaleiros do ssloj.com
 */
export class SSLOJScraper {
  /**
   * Extrai lista de cavaleiros da página de listagem
   */
  static async scrapeCharactersList(): Promise<CharacterData[]> {
    try {
      const response = await axios.get(CHARACTERS_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const characters: CharacterData[] = [];

      // Procura por todos os links de cavaleiros
      $('a[href*="/characters/"]').each((index: number, element: any) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();

        // Ignora links que não são de cavaleiros específicos
        if (!href || href === '/characters' || text === 'Back to characters') return;

        // Extrai ID da URL
        const idMatch = href.match(/\/characters\/(\d+)/);
        if (!idMatch) return;

        const id = parseInt(idMatch[1], 10);
        const name = text.split('\n')[0].trim();

        // Extrai classe e tipo
        const classMatch = text.match(/(Protector|Warrior|Skilled|Assassin|Assist)/);
        const typeMatch = text.match(/(Water|Fire|Air|Earth|Light|Dark)/);

        characters.push({
          id,
          name,
          class: classMatch ? classMatch[1] : '',
          type: typeMatch ? typeMatch[1] : '',
          ssloj_url: `${SSLOJ_BASE_URL}${href}`
        });
      });

      return characters;
    } catch (error) {
      console.error('[SSLOJ Scraper] Erro ao extrair lista de cavaleiros:', error);
      throw error;
    }
  }

  /**
   * Extrai dados detalhados de um cavaleiro específico
   */
  static async scrapeCharacterDetail(characterId: number): Promise<CharacterDetail | null> {
    try {
      const url = `${SSLOJ_BASE_URL}/characters/${characterId}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const character: CharacterDetail = {
        id: characterId,
        name: '',
        class: '',
        type: '',
        ssloj_url: url,
        skills: [],
        cloth: [],
        constellations: [],
        links: []
      };

      // Extrai informações básicas
      const titleText = $('h1').text().trim();
      character.name = titleText.split('\n')[0].trim();

      // Extrai atributos (HP, ATK, DEF, etc)
      const statsText = $('div').text();
      
      const hpMatch = statsText.match(/HP[:\s]+(\d+)/);
      if (hpMatch) character.hp = parseInt(hpMatch[1], 10);

      const atkMatch = statsText.match(/ATK[:\s]+(\d+)/);
      if (atkMatch) character.atk = parseInt(atkMatch[1], 10);

      const defMatch = statsText.match(/DEF[:\s]+(\d+)/);
      if (defMatch) character.def = parseInt(defMatch[1], 10);

      // Extrai classe e tipo
      const classMatch = statsText.match(/(Protector|Warrior|Skilled|Assassin|Assist)/);
      if (classMatch) character.class = classMatch[1];

      const typeMatch = statsText.match(/(Water|Fire|Air|Earth|Light|Dark)/);
      if (typeMatch) character.type = typeMatch[1];

      // Extrai habilidades (Skills)
      const skillsSection = $('h2:contains("Skills")').nextUntil('h2');
      skillsSection.each((index: number, element: any) => {
        const skillName = $(element).find('h3').text().trim();
        if (!skillName) return;

        const skillType = $(element).find('.skill-type').text().trim();
        const description = $(element).find('p').text().trim();

        character.skills?.push({
          skill_name: skillName,
          skill_type: skillType,
          description: description
        });
      });

      // Extrai armadura (Cloth)
      const clothSection = $('h2:contains("Cloth")').nextUntil('h2');
      let clothLevel = 1;
      clothSection.each((index: number, element: any) => {
        const description = $(element).text().trim();
        if (description) {
          character.cloth?.push({
            level: clothLevel,
            description: description
          });
          clothLevel++;
        }
      });

      // Extrai constelações (Constellations)
      const constellationSection = $('h2:contains("Constellations")').nextUntil('h2');
      constellationSection.each((index: number, element: any) => {
        const name = $(element).find('h3').text().trim();
        const description = $(element).find('p').text().trim();
        
        if (name) {
          character.constellations?.push({
            constellation_name: name,
            description: description,
            level: 'C9'
          });
        }
      });

      // Extrai ligações (Links)
      const linksSection = $('h2:contains("Links")').nextUntil('h2');
      linksSection.each((index: number, element: any) => {
        const linkName = $(element).find('h3').text().trim();
        const description = $(element).find('p').text().trim();
        
        if (linkName) {
          character.links?.push({
            link_name: linkName,
            description: description,
            level: 1
          });
        }
      });

      return character;
    } catch (error) {
      console.error(`[SSLOJ Scraper] Erro ao extrair dados do cavaleiro ${characterId}:`, error);
      return null;
    }
  }

  /**
   * Sincroniza todos os cavaleiros do ssloj.com com o banco de dados
   */
  static async syncAllCharacters(onProgress?: (current: number, total: number) => void): Promise<number> {
    try {
      console.log('[SSLOJ Scraper] Iniciando sincronização de cavaleiros...');
      
      // Obtém lista de cavaleiros
      const characters = await this.scrapeCharactersList();
      console.log(`[SSLOJ Scraper] Encontrados ${characters.length} cavaleiros`);

      let syncedCount = 0;

      // Sincroniza cada cavaleiro
      for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        
        try {
          const detail = await this.scrapeCharacterDetail(character.id);
          if (detail) {
            syncedCount++;
            if (onProgress) {
              onProgress(i + 1, characters.length);
            }
          }
        } catch (error) {
          console.error(`[SSLOJ Scraper] Erro ao sincronizar cavaleiro ${character.name}:`, error);
        }

        // Aguarda um pouco entre requisições para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`[SSLOJ Scraper] Sincronização concluída: ${syncedCount}/${characters.length} cavaleiros`);
      return syncedCount;
    } catch (error) {
      console.error('[SSLOJ Scraper] Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Extrai apenas os dados básicos de um cavaleiro (sem habilidades, armadura, etc)
   */
  static async scrapeCharacterBasicInfo(characterId: number): Promise<CharacterData | null> {
    try {
      const detail = await this.scrapeCharacterDetail(characterId);
      if (!detail) return null;

      return {
        id: detail.id,
        name: detail.name,
        class: detail.class,
        type: detail.type,
        hp: detail.hp,
        atk: detail.atk,
        def: detail.def,
        ssloj_url: detail.ssloj_url
      };
    } catch (error) {
      console.error(`[SSLOJ Scraper] Erro ao extrair informações básicas do cavaleiro ${characterId}:`, error);
      return null;
    }
  }
}

export default SSLOJScraper;
