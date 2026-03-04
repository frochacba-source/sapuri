import { invokeLLM } from "./_core/llm";

interface GvgAttackData {
  playerName: string;
  attack1Stars: number;
  attack1Opponent: string | null;
  attack2Stars: number;
  attack2Opponent: string | null;
  didNotAttack: boolean;
}

interface GotAttackData {
  playerName: string;
  ranking: number;
  power: string;
  attackVictories: number;
  attackDefeats: number;
  defenseVictories: number;
  defenseDefeats: number;
  points: number;
  didNotAttack: boolean;
}

export async function analyzeGvgScreenshot(imageUrl: string): Promise<GvgAttackData[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em extrair dados de screenshots do jogo Saint Seiya: Lendas da Justiça.
          
Analise a imagem do "Registro de Combate" da GvG e extraia os dados de cada jogador.

Formato da tela:
- Nome do jogador na primeira coluna (pode ter caracteres especiais como 神, 東, ⚡)
- Primeiro Ataque: nome do oponente em vermelho + estrelas (◆ cheias = conquistadas, ◇ vazias = não conquistadas)
- Segundo Ataque: nome do oponente em vermelho + estrelas

Regras:
- Conte apenas estrelas CHEIAS (◆) como conquistadas
- Se não houver informação de ataque (linha vazia), o jogador não atacou
- Máximo de 3 estrelas por ataque

Retorne um JSON array com os dados extraídos.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados de ataque de cada jogador desta imagem do Registro de Combate da GvG."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "gvg_attacks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              attacks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerName: { type: "string", description: "Nome do jogador" },
                    attack1Stars: { type: "integer", description: "Estrelas do primeiro ataque (0-3)" },
                    attack1Opponent: { type: ["string", "null"], description: "Nome do oponente do primeiro ataque" },
                    attack2Stars: { type: "integer", description: "Estrelas do segundo ataque (0-3)" },
                    attack2Opponent: { type: ["string", "null"], description: "Nome do oponente do segundo ataque" },
                    didNotAttack: { type: "boolean", description: "True se o jogador não fez nenhum ataque" }
                  },
                  required: ["playerName", "attack1Stars", "attack1Opponent", "attack2Stars", "attack2Opponent", "didNotAttack"],
                  additionalProperties: false
                }
              }
            },
            required: ["attacks"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      console.error("[ImageAnalysis] No content in LLM response");
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.attacks || [];
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze GvG screenshot:", error);
    return [];
  }
}

export async function analyzeGotScreenshot(imageUrl: string): Promise<GotAttackData[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em extrair dados de screenshots do jogo Saint Seiya: Lendas da Justiça.
          
Analise a imagem da "Lista de Membros" do GoT (Guerra dos Titãs) e extraia os dados de cada jogador.

Formato da tela:
- Ranking (1, 2, 3...)
- Nome do jogador (pode ter caracteres especiais como 神, 東, ⚡)
- Poder (ex: 920M, 994M)
- Gravar: Ataque (X vitórias / Y derrotas) e Defesa (X vitórias / Y derrotas)
- Pontos totais

Regras:
- Vitórias aparecem em verde, derrotas em vermelho
- Se ataque tem 0 vitórias E 0 derrotas, o jogador não atacou
- Pontos 0 geralmente indica que não participou

Retorne um JSON array com os dados extraídos.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados de cada jogador desta imagem da Lista de Membros do GoT."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "got_attacks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              attacks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerName: { type: "string", description: "Nome do jogador" },
                    ranking: { type: "integer", description: "Posição no ranking" },
                    power: { type: "string", description: "Poder do jogador (ex: 920M)" },
                    attackVictories: { type: "integer", description: "Vitórias no ataque" },
                    attackDefeats: { type: "integer", description: "Derrotas no ataque" },
                    defenseVictories: { type: "integer", description: "Vitórias na defesa" },
                    defenseDefeats: { type: "integer", description: "Derrotas na defesa" },
                    points: { type: "integer", description: "Pontos totais" },
                    didNotAttack: { type: "boolean", description: "True se o jogador não atacou (0 vitórias no ataque)" }
                  },
                  required: ["playerName", "ranking", "power", "attackVictories", "attackDefeats", "defenseVictories", "defenseDefeats", "points", "didNotAttack"],
                  additionalProperties: false
                }
              }
            },
            required: ["attacks"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      console.error("[ImageAnalysis] No content in LLM response");
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.attacks || [];
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze GoT screenshot:", error);
    return [];
  }
}

// Helper to match extracted player names with database members
export function matchPlayerToMember(
  playerName: string, 
  members: { id: number; name: string }[]
): { id: number; name: string } | null {
  // Normalize names for comparison
  const normalize = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[神東⚡🔥💀👑🎮]/g, '') // Remove common game prefixes
      .replace(/[^a-z0-9]/g, '') // Remove special chars
      .trim();
  };

  const normalizedPlayerName = normalize(playerName);
  
  // Try exact match first
  for (const member of members) {
    if (normalize(member.name) === normalizedPlayerName) {
      return member;
    }
  }
  
  // Try partial match
  for (const member of members) {
    const normalizedMemberName = normalize(member.name);
    if (normalizedMemberName.includes(normalizedPlayerName) || 
        normalizedPlayerName.includes(normalizedMemberName)) {
      return member;
    }
  }
  
  return null;
}


interface ReliquiasDamageData {
  playerName: string;
  ranking: number;
  power: string;
  cumulativeDamage: string;
  damageNumeric: number; // Converted to numeric for sorting (in billions)
}

export async function analyzeReliquiasScreenshot(imageUrl: string): Promise<ReliquiasDamageData[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em extrair dados de screenshots do jogo Saint Seiya: Lendas da Justiça.
          
Analise a imagem do "Ranking de Dano" das Relíquias e extraia os dados de cada jogador.

Formato da tela:
- Ranking (1, 2, 3...)
- Nome do jogador (pode ter caracteres especiais como 神, 東, ⚡)
- Poder (ex: 859M, 920M)
- Dano Acumulado (ex: 2143B, 2086B, 1810B)

Regras:
- O dano acumulado é mostrado em formato abreviado (B = bilhões)
- Extraia o valor numérico do dano para ordenação (ex: "2143B" = 2143)
- Se o dano for em milhões (M), converta para bilhões (ex: "500M" = 0.5)

Retorne um JSON array com os dados extraídos.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia os dados de dano de cada jogador desta imagem do Ranking de Dano das Relíquias."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "reliquias_damage",
          strict: true,
          schema: {
            type: "object",
            properties: {
              damages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerName: { type: "string", description: "Nome do jogador" },
                    ranking: { type: "integer", description: "Posição no ranking" },
                    power: { type: "string", description: "Poder do jogador (ex: 859M)" },
                    cumulativeDamage: { type: "string", description: "Dano acumulado (ex: 2143B)" },
                    damageNumeric: { type: "number", description: "Valor numérico do dano em bilhões" }
                  },
                  required: ["playerName", "ranking", "power", "cumulativeDamage", "damageNumeric"],
                  additionalProperties: false
                }
              }
            },
            required: ["damages"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      console.error("[ImageAnalysis] No content in LLM response");
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.damages || [];
  } catch (error) {
    console.error("[ImageAnalysis] Failed to analyze Reliquias screenshot:", error);
    return [];
  }
}
