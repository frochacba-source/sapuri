/**
 * Integração do Painel de Estratégias GoT com Bot Telegram
 * Fornece sugestões de formações 3x3 quando membros usam /estrategia
 */

import { 
  getAllGotStrategies,
  getGotStrategyById,
  createGotStrategy,
  updateGotStrategy,
  deleteGotStrategy,
  searchGotStrategies,
  searchMembersByNamePart,
  searchCharactersInGotStrategies,
  searchCharactersInGvgStrategies,
} from "./db";
import { sendTelegramMessageDirect } from "./telegram";
import {
  getCachedByCharacter,
  setCachedByCharacter,
  getCachedByName,
  setCachedByName,
  getCachedByKeyword,
  setCachedByKeyword,
  invalidateCache,
} from "./_core/strategyCache";

/**
 * Função auxiliar para verificar se uma estratégia contém TODOS os cavaleiros na formação de ataque
 * Verifica se TODOS os cavaleiros aparecem na mesma estratégia (não necessariamente na mesma linha)
 */
function strategyContainsAllCharactersInAttack(strategy: any, characters: string[]): boolean {
  if (characters.length === 0) return true;
  
  // Concatenar todas as formações de ataque
  const fullAttackFormation = `${strategy.attackFormation1} ${strategy.attackFormation2} ${strategy.attackFormation3}`.toLowerCase();
  
  // Verificar se TODOS os cavaleiros aparecem na formação
  return characters.every(char => {
    const charLower = char.toLowerCase();
    // Buscar o cavaleiro como palavra completa (não como substring)
    const words = fullAttackFormation.split(/\s+/);
    return words.some(word => word.includes(charLower));
  });
}

/**
 * Função auxiliar para verificar se uma estratégia contém TODOS os cavaleiros na formação de defesa
 * Verifica se TODOS os cavaleiros aparecem na mesma estratégia (não necessariamente na mesma linha)
 */
function strategyContainsAllCharactersInDefense(strategy: any, characters: string[]): boolean {
  if (characters.length === 0) return true;
  
  // Concatenar todas as formações de defesa
  const fullDefenseFormation = `${strategy.defenseFormation1} ${strategy.defenseFormation2} ${strategy.defenseFormation3}`.toLowerCase();
  
  // Verificar se TODOS os cavaleiros aparecem na formação
  return characters.every(char => {
    const charLower = char.toLowerCase();
    // Buscar o cavaleiro como palavra completa (não como substring)
    const words = fullDefenseFormation.split(/\s+/);
    return words.some(word => word.includes(charLower));
  });
}

/**
 * Processar comando /estrategia do bot
 * Retorna sugestões de estratégias GoT
 */
export async function handleEstrategiaCommand(
  chatId: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /estrategia command for chat:", chatId);
    const strategies = await getAllGotStrategies();
    console.log("[GoT Bot Integration] Found", strategies.length, "strategies");
    return sendGotStrategiesSuggestions(chatId, strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /estrategia command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias. Tente novamente mais tarde."
    );
  }
}

/**
 * Enviar sugestões de estratégias GoT via Telegram
 */
export async function sendGotStrategiesSuggestions(
  chatId: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Nenhuma estratégia encontrada no banco de dados."
    );
  }

  let message = "🤖 Estratégias GoT\n\n";

  strategies.slice(0, 5).forEach((strategy) => {
    if (strategy.name) {
      message += `📣 ${strategy.name}\n\n`;
    }
    message += `Ataque⚔️ x 🛡️Defesa\n\n`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n\n`;
  });

  if (strategies.length > 5) {
    message += `\n... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  return sendTelegramMessageDirect(token, chatId, message);
}

/**
 * Enviar lembretes automáticos com sugestões de estratégias
 * Pode ser chamado antes de eventos GoT
 */
export async function handleSearchCommand(chatId: string, keyword: string) {
  console.log(`[GoT Bot Integration] Handling search for keyword: ${keyword}`);
  try {
    const strategies = await searchGotStrategies(keyword);
    
    if (strategies.length === 0) {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      await sendTelegramMessageDirect(token, chatId, `❌ Nenhuma estratégia encontrada com o nome: ${keyword}`);
      return;
    }
    
    let message = `🤖 Estratégias GoT

`;
    
    strategies.forEach((strategy: any) => {
      if (strategy.name) {
        message += `📣 ${strategy.name}

`;
      }
      message += `Ataque⚔️ x 🛡️Defesa

`;
      message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}
`;
      message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}
`;
      message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}`;
      if (strategy.observation) {
        message += `

📝 Observação: ${strategy.observation}`;
      }
      message += `

`;
    });
    
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    await sendTelegramMessageDirect(token, chatId, message);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling search command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    await sendTelegramMessageDirect(token, chatId, "❌ Erro ao buscar estratégias");
  }
}

export async function sendStrategyReminder(
  chatId: string,
  eventName: string = "Guerra dos Titãs"
): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    const strategies = await getAllGotStrategies();

    if (strategies.length === 0) {
      return sendTelegramMessageDirect(
        token,
        chatId,
        `⏰ <b>${eventName}</b> começando em breve!\n\n` +
        "📋 Nenhuma estratégia cadastrada ainda. Use /estrategia para sugestões."
      );
    }

    // Enviar lembretes com top 3 estratégias
    const topStrategies = strategies.slice(0, 3);
    let message = `⏰ <b>${eventName}</b> começando em breve!\n\n`;
    message += "🤖 Estratégias GoT\n\n";

    topStrategies.forEach((strategy) => {
      if (strategy.name) {
        message += `📣 ${strategy.name}\n\n`;
      }
      message += `Ataque⚔️ x 🛡️Defesa\n\n`;
      message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
      message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
      message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n\n`;
    });

    message += "Use /estrategia para ver mais opções!";

    return sendTelegramMessageDirect(token, chatId, message);
  } catch (error) {
    console.error("[GoT Bot Integration] Error sending strategy reminder:", error);
    return false;
  }
}

/**
 * Processar comando /ataque [nome] [nome] [nome] do bot
 * Retorna estratégias de ataque com até 3 cavaleiros específicos
 */
export async function handleAttackCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /ataque command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique até 3 cavaleiros. Exemplo: /ataque Kanon Aikos Hyoga"
      );
    }
    
    // Dividir os nomes e limitar a 3
    const names = characterNames.trim().split(/\s+/).slice(0, 3);
    
    // Tentar obter do cache primeiro
    const cacheKey = names.join("|").toLowerCase();
    let filteredStrategies = getCachedByCharacter(cacheKey);
    
    if (!filteredStrategies) {
      const { searchGotStrategiesByMultipleNamesInAttack, getGotStrategiesByName } = await import("./db");
      
      // Buscar estratégias que contém TODOS os cavaleiros APENAS no lado do ATAQUE
      filteredStrategies = await searchGotStrategiesByMultipleNamesInAttack(names);
      
      // Se não encontrou por nome de cavaleiro, tenta buscar por nome de estratégia
      if (filteredStrategies.length === 0) {
        console.log("[GoT Bot Integration] No strategies found by character name, searching by strategy name");
        let allStrategies: any[] = [];
        for (const name of names) {
          const strategyNameResults = await getGotStrategiesByName(name);
          allStrategies = allStrategies.concat(strategyNameResults);
        }
        // Filtrar para manter APENAS estratégias que contém TODOS os cavaleiros no ATAQUE
        filteredStrategies = allStrategies.filter(s => strategyContainsAllCharactersInAttack(s, names));
      }
      
      // Cachear o resultado
      setCachedByCharacter(cacheKey, filteredStrategies);
    }
    
    // Se ainda não encontrou, tenta buscar por palavra-chave
    if (filteredStrategies.length === 0) {
      console.log("[GoT Bot Integration] No strategies found by strategy name, searching by keyword");
      const { searchGotStrategiesByKeyword } = await import("./db");
      let allStrategies: any[] = [];
      for (const keyword of names) {
        const keywordStrategies = await searchGotStrategiesByKeyword(keyword);
        allStrategies = allStrategies.concat(keywordStrategies);
      }
      // Não filtrar por cavaleiros quando busca por palavra-chave
      filteredStrategies = Array.from(new Map(allStrategies.map((s: any) => [s.id, s])).values());
    }
    
    // Remover duplicatas
    const uniqueStrategies = Array.from(new Map(filteredStrategies.map(s => [s.id, s])).values());
    console.log("[GoT Bot Integration] Found", uniqueStrategies.length, "attack strategies for", names.join(", "));
    
    return sendGotAttackStrategies(chatId, names.join(" / "), uniqueStrategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /ataque command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias de ataque. Tente novamente mais tarde."
    );
  }
}

/**
 * Processar comando /defesa [nome] [nome] [nome] do bot
 * Retorna estratégias de defesa com até 3 cavaleiros específicos
 */
export async function handleDefenseCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /defesa command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique até 3 cavaleiros. Exemplo: /defesa Ikki Taça ShunD"
      );
    }
    
    // Dividir os nomes e limitar a 3
    const names = characterNames.trim().split(/\s+/).slice(0, 3);
    
    const { searchGotStrategiesByMultipleNamesInDefense } = await import("./db");
    
    // Buscar estratégias que contém TODOS os cavaleiros APENAS no lado da DEFESA
    // Esta função já faz a busca corretamente, não precisa de fallback
    let filteredStrategies = await searchGotStrategiesByMultipleNamesInDefense(names);
    console.log("[GoT Bot Integration] /defesa command - filtered strategies count:", filteredStrategies.length);
    
    // Se não encontrou, retorna vazio (não busca por nome de estratégia)
    // Isso garante que SEMPRE retorna apenas defesas com TODOS os cavaleiros
    
    // Remover duplicatas
    const uniqueStrategies = Array.from(new Map(filteredStrategies.map(s => [s.id, s])).values());
    console.log("[GoT Bot Integration] Found", uniqueStrategies.length, "defense strategies for", names.join(", "));
    
    return sendGotDefenseStrategies(chatId, names.join(" / "), uniqueStrategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /defesa command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias de defesa. Tente novamente mais tarde."
    );
  }
}

/**
 * Enviar estratégias de ataque para cavaleiros específicos
 * Envia em um único bloco sem duplicação
 */
export async function sendGotAttackStrategies(
  chatId: string,
  characterNames: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `❌ Nenhuma estratégia de ataque encontrada para ${characterNames}.`
    );
  }

  let message = `🤖 Estratégias de Ataque - ${characterNames}\n\n`;

  // Mostrar todas as estratégias encontradas
  strategies.forEach((strategy) => {
    message += `Ataque⚔️ x 🛡️Defesa\n`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem de mais estratégias
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  // Enviar uma única mensagem
  return sendTelegramMessageDirect(token, chatId, message);
}

/**
 * Enviar estratégias de defesa para cavaleiros específicos
 * Envia em um único bloco sem duplicação
 */
export async function sendGotDefenseStrategies(
  chatId: string,
  characterNames: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `❌ Nenhuma estratégia de defesa encontrada para ${characterNames}.`
    );
  }

  let message = `🤖 Estratégias de Defesa - ${characterNames}\n\n`;

  // Mostrar todas as estratégias encontradas
  strategies.forEach((strategy) => {
    message += `Ataque⚔️ x 🛡️Defesa\n`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem de mais estratégias
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  // Enviar uma única mensagem
  return sendTelegramMessageDirect(token, chatId, message);
}


/**
 * Processar comando /dica defesa [nome] [nome] [nome]
 * Retorna APENAS as defesas recomendadas (sem ataque)
 */
export async function handleTipDefenseCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /dica defesa command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique até 3 cavaleiros. Exemplo: /dica defesa Ikki Taça ShunD"
      );
    }
    
    // Dividir os nomes e limitar a 3
    const names = characterNames.trim().split(/\s+/).slice(0, 3);
    
    const { searchGotStrategiesByMultipleNamesInDefense } = await import("./db");
    
    // Buscar estratégias que contém TODOS os cavaleiros APENAS no lado da DEFESA
    // Esta função já faz a busca corretamente, não precisa de fallback
    let filteredStrategies = await searchGotStrategiesByMultipleNamesInDefense(names);
    
    // Se não encontrou, retorna vazio (não busca por nome de estratégia)
    // Isso garante que SEMPRE retorna apenas defesas com TODOS os cavaleiros
    
    // Remover duplicatas
    const uniqueStrategies = Array.from(new Map(filteredStrategies.map(s => [s.id, s])).values());
    console.log("[GoT Bot Integration] Found", uniqueStrategies.length, "defense tips for", names.join(", "));
    
    return sendGotDefenseTips(chatId, names.join(" / "), uniqueStrategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /dica defesa command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar dicas de defesa. Tente novamente mais tarde."
    );
  }
}

/**
 * Enviar dicas de defesa (APENAS DEFESA, SEM ATAQUE)
 */
export async function sendGotDefenseTips(
  chatId: string,
  characterNames: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `❌ Nenhuma dica de defesa encontrada para ${characterNames}.`
    );
  }

  let message = `🤖 Dicas de Defesa - ${characterNames}\n\n`;

  // Mostrar APENAS as defesas (sem ataque)
  strategies.slice(0, 5).forEach((strategy) => {
    message += `🛡️ Defesa: ${strategy.defenseFormation1} / ${strategy.defenseFormation2} / ${strategy.defenseFormation3}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem de mais dicas
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} dicas disponíveis.`;
  }

  // Enviar uma única mensagem
  return sendTelegramMessageDirect(token, chatId, message);
}


// ============ GVG STRATEGIES (5x5) ============

/**
 * Processar comando /ataque GVG [nome] [nome] [nome] [nome] [nome]
 * Retorna estratégias de ataque para GVG (5 cavaleiros)
 */
export async function handleGvgAttackCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /ataque GVG command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique uma palavra-chave. Exemplo: /ataque GVG Explosivo"
      );
    }
    
    const input = characterNames.trim();
    const { searchGvgStrategiesByKeywordInAttack, getGvgStrategiesByAttackFormation } = await import("./db");
    
    // Primeiro, tentar buscar por palavra-chave
    console.log("[GoT Bot Integration] Searching for keyword in GVG:", input);
    let strategies = await searchGvgStrategiesByKeywordInAttack(input);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG attack strategies for keyword:", input);
    
    // Se nao encontrou por palavra-chave, tentar buscar por nome de cavaleiro
    if (strategies.length === 0) {
      console.log("[GoT Bot Integration] No keyword matches, searching for character names:", input);
      strategies = await getGvgStrategiesByAttackFormation(input);
      console.log("[GoT Bot Integration] Found", strategies.length, "GVG attack strategies for character:", input);
      return sendGvgAttackStrategies(chatId, `cavaleiro: ${input}`, strategies);
    }
    
    return sendGvgAttackStrategies(chatId, `palavra-chave: ${input}`, strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /ataque GVG command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias de ataque GVG. Tente novamente mais tarde."
    );
  }
}

/**
 * Processar comando /defesa GVG [nome] [nome] [nome] [nome] [nome]
 * Retorna estratégias de defesa para GVG (5 cavaleiros)
 */
export async function handleGvgDefenseCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /defesa GVG command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique uma palavra-chave. Exemplo: /defesa GVG Explosivo"
      );
    }
    
    const input = characterNames.trim();
    const { searchGvgStrategiesByKeywordInDefense, getGvgStrategiesByDefenseFormation } = await import("./db");
    
    // Primeiro, tentar buscar por palavra-chave
    console.log("[GoT Bot Integration] Searching for keyword in GVG:", input);
    let strategies = await searchGvgStrategiesByKeywordInDefense(input);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense strategies for keyword:", input);
    
    // Se nao encontrou por palavra-chave, tentar buscar por nome de cavaleiro
    if (strategies.length === 0) {
      console.log("[GoT Bot Integration] No keyword matches, searching for character names:", input);
      strategies = await getGvgStrategiesByDefenseFormation(input);
      console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense strategies for character:", input);
      return sendGvgDefenseStrategies(chatId, `cavaleiro: ${input}`, strategies);
    }
    
    return sendGvgDefenseStrategies(chatId, `palavra-chave: ${input}`, strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /defesa GVG command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias de defesa GVG. Tente novamente mais tarde."
    );
  }
}

/**
 * Processar comando /dica defesa GVG [nome] [nome] [nome] [nome] [nome]
 * Retorna APENAS as defesas recomendadas para GVG (sem ataque)
 */
export async function handleGvgTipDefenseCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /dica defesa GVG command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique uma palavra-chave. Exemplo: /dica defesa GVG Explosivo"
      );
    }
    
    const input = characterNames.trim();
    const { searchGvgDefenseTipsByKeyword } = await import("./db");
    
    // Buscar APENAS por palavra-chave em GVG (sem buscar por nome de cavaleiro)
    console.log("[GoT Bot Integration] Searching for keyword in GVG:", input);
    const strategies = await searchGvgDefenseTipsByKeyword(input);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense tips for keyword:", input);
    
    return sendGvgDefenseTips(chatId, `palavra-chave: ${input}`, strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /dica defesa GVG command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar dicas de defesa GVG. Tente novamente mais tarde."
    );
  }
}

/**
 * Enviar estratégias de ataque GVG (5x5)
 */
export async function sendGvgAttackStrategies(
  chatId: string,
  characterNames: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `❌ Nenhuma estratégia de ataque GVG encontrada para ${characterNames}.`
    );
  }

  let message = `🤖 Estratégias de Ataque GVG - ${characterNames}\n\n`;

  // Mostrar até 5 estratégias
  strategies.slice(0, 5).forEach((strategy) => {
    message += `Ataque ⚔️ x 🛡️ Defesa\n\n`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n`;
    message += `${strategy.attackFormation4} x ${strategy.defenseFormation4}\n`;
    message += `${strategy.attackFormation5} x ${strategy.defenseFormation5}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem de mais estratégias
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  // Enviar uma única mensagem
  return sendTelegramMessageDirect(token, chatId, message);
}

/**
 * Enviar estratégias de defesa GVG (5x5)
 */
export async function sendGvgDefenseStrategies(
  chatId: string,
  characterNames: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `❌ Nenhuma estratégia de defesa GVG encontrada para ${characterNames}.`
    );
  }

  let message = `🤖 Estratégias de Defesa GVG - ${characterNames}\n\n`;

  // Mostrar até 5 estratégias
  strategies.slice(0, 5).forEach((strategy) => {
    message += `Ataque ⚔️ x 🛡️ Defesa\n\n`;
    message += `${strategy.attackFormation1} x ${strategy.defenseFormation1}\n`;
    message += `${strategy.attackFormation2} x ${strategy.defenseFormation2}\n`;
    message += `${strategy.attackFormation3} x ${strategy.defenseFormation3}\n`;
    message += `${strategy.attackFormation4} x ${strategy.defenseFormation4}\n`;
    message += `${strategy.attackFormation5} x ${strategy.defenseFormation5}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem de mais estratégias
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} estratégias disponíveis.`;
  }

  // Enviar uma única mensagem
  return sendTelegramMessageDirect(token, chatId, message);
}

/**
 * Enviar dicas de defesa GVG (APENAS DEFESA, SEM ATAQUE)
 */
export async function sendGvgDefenseTips(
  chatId: string,
  characterNames: string,
  strategies: any[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  if (strategies.length === 0) {
    return sendTelegramMessageDirect(
      token,
      chatId,
      `❌ Nenhuma dica de defesa GVG encontrada para ${characterNames}.`
    );
  }

  let message = `🤖 Dicas de Defesa GVG - ${characterNames}\n\n`;

  // Mostrar APENAS as defesas (sem ataque)
  strategies.slice(0, 5).forEach((strategy) => {
    message += `🛡️ Defesa: ${strategy.defenseFormation1} / ${strategy.defenseFormation2} / ${strategy.defenseFormation3} / ${strategy.defenseFormation4} / ${strategy.defenseFormation5}\n\n`;
  });

  // Se houver mais de 5, mostrar mensagem de mais dicas
  if (strategies.length > 5) {
    message += `... e mais ${strategies.length - 5} dicas disponíveis.`;
  }

  // Enviar uma única mensagem
  return sendTelegramMessageDirect(token, chatId, message);
}


/**
 * Processar comando /gvg ataque [nome] [nome] [nome] [nome] [nome]
 * Busca estratégias de ataque GVG com TODOS os cavaleiros especificados
 */
export async function handleGvgAttackCommandNew(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /gvg ataque command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique até 5 cavaleiros. Exemplo: /gvg ataque Seiya Shiryu Hyoga Shun Ikki"
      );
    }
    
    // Dividir os nomes e limitar a 5
    const names = characterNames.trim().split(/\s+/).slice(0, 5);
    
    const { searchGvgStrategiesByMultipleNamesInAttack } = await import("./db");
    
    // Buscar estratégias que contêm TODOS os nomes no ataque
    const strategies = await searchGvgStrategiesByMultipleNamesInAttack(names);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG attack strategies for", names.join(", "));
    
    return sendGvgAttackStrategies(chatId, names.join(" / "), strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /gvg ataque command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias de ataque GVG. Tente novamente mais tarde."
    );
  }
}

/**
 * Processar comando /gvg defesa [nome] [nome] [nome] [nome] [nome]
 * Busca estratégias de defesa GVG com TODOS os cavaleiros especificados
 */
export async function handleGvgDefenseCommandNew(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /gvg defesa command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique até 5 cavaleiros. Exemplo: /gvg defesa Seiya Shiryu Hyoga Shun Ikki"
      );
    }
    
    // Dividir os nomes e limitar a 5
    const names = characterNames.trim().split(/\s+/).slice(0, 5);
    
    const { searchGvgStrategiesByMultipleNamesInDefense } = await import("./db");
    
    // Buscar estratégias que contêm TODOS os nomes na defesa
    const strategies = await searchGvgStrategiesByMultipleNamesInDefense(names);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense strategies for", names.join(", "));
    
    return sendGvgDefenseStrategies(chatId, names.join(" / "), strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /gvg defesa command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar estratégias de defesa GVG. Tente novamente mais tarde."
    );
  }
}

/**
 * Processar comando /gvg dica [nome] [nome] [nome] [nome] [nome]
 * Busca dicas de defesa GVG com TODOS os cavaleiros especificados
 */
export async function handleGvgDicaCommand(
  chatId: string,
  characterNames: string
): Promise<boolean> {
  try {
    console.log("[GoT Bot Integration] Handling /gvg dica command for characters:", characterNames);
    
    if (!characterNames || characterNames.trim() === "") {
      const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❌ Por favor, especifique até 5 cavaleiros. Exemplo: /gvg dica Seiya Shiryu Hyoga Shun Ikki"
      );
    }
    
    // Remover a palavra 'defesa' ou 'ataque' se estiver no início
    let cleanInput = characterNames.trim();
    if (cleanInput.toLowerCase().startsWith('defesa ')) {
      cleanInput = cleanInput.substring(7).trim();
    } else if (cleanInput.toLowerCase().startsWith('ataque ')) {
      cleanInput = cleanInput.substring(7).trim();
    }
    
    // Dividir os nomes e limitar a 5
    const names = cleanInput.split(/\s+/).slice(0, 5);
    
    const { searchGvgStrategiesByMultipleNamesInDefense } = await import("./db");
    
    // Buscar dicas de defesa que contém TODOS os nomes (usando a mesma lógica que GoT)
    const strategies = await searchGvgStrategiesByMultipleNamesInDefense(names);
    console.log("[GoT Bot Integration] Found", strategies.length, "GVG defense tips for", names.join(", "));
    
    return sendGvgDefenseTips(chatId, names.join(" / "), strategies);
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /gvg dica command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    return sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar dicas de defesa GVG. Tente novamente mais tarde."
    );
  }
}


// ============ MEMBER SEARCH COMMAND ============

export async function handleNomeCommand(
  chatId: string,
  searchTerm: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
  
  try {
    console.log("[GoT Bot Integration] Handling /nome command for search term:", searchTerm);
    
    // Se searchTerm está vazio, listar TODOS os personagens
    let gotResults = [];
    let gvgResults = [];
    let isShowingAll = false;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      // Buscar TODOS os cavaleiros
      gotResults = await searchCharactersInGotStrategies("");
      gvgResults = await searchCharactersInGvgStrategies("");
      isShowingAll = true;
    } else {
      // Buscar cavaleiros com filtro
      gotResults = await searchCharactersInGotStrategies(searchTerm);
      gvgResults = await searchCharactersInGvgStrategies(searchTerm);
    }
    
    const allResults = [...gotResults, ...gvgResults];

    if (allResults.length === 0) {
      const errorMsg = isShowingAll
        ? "❌ Nenhum cavaleiro encontrado no banco de dados."
        : `❌ Nenhum cavaleiro encontrado com "${searchTerm}".`;
      await sendTelegramMessageDirect(
        token,
        chatId,
        errorMsg
      );
      return false;
    }

    // Remover duplicatas (case-insensitive) e ordenar
    // Usar um Map para rastrear caracteres únicos (normalizado para lowercase)
    const characterMap = new Map<string, string>();
    
    for (const result of allResults) {
      const normalized = result.character.toLowerCase().trim();
      if (!characterMap.has(normalized)) {
        characterMap.set(normalized, result.character);
      }
    }
    
    // Converter para array e ordenar
    const uniqueCharacters = Array.from(characterMap.values()).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    const characterList = uniqueCharacters
      .map((char, index) => `${index + 1}. ${char}`)
      .join("\n");

    const message = isShowingAll 
      ? `📋 Todos os Cavaleiros:\n\n${characterList}`
      : `🔍 Cavaleiros encontrados para "${searchTerm}":\n\n${characterList}`;

    await sendTelegramMessageDirect(token, chatId, message);
    return true;
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /nome command:", error);
    await sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao buscar cavaleiros. Tente novamente mais tarde."
    );
    return false;
  }
}


/**
 * Processar comando /ia do bot
 * Envia pergunta para IA e retorna resposta
 */
export async function handleIaCommand(
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    
    // Extrair a pergunta (remove "/ia " do início)
    const question = message.replace(/^\/ia\s+/i, '').trim();
    
    if (!question) {
      return sendTelegramMessageDirect(
        token,
        chatId,
        "❓ Use: /ia [sua pergunta]\n\nExemplos:\n- /ia qual é a melhor estratégia para GvG?\n- /ia como usar Ikki em defesa?\n- /ia qual carta é melhor para Seiya?"
      );
    }

    // Enviar mensagem de "digitando"
    await sendTelegramMessageDirect(token, chatId, "⏳ Analisando sua pergunta...");

    // Chamar a IA
    const { invokeLLM } = await import('./_core/llm');
    
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em Saint Seiya: Lendas da Justiça. Responda perguntas sobre estratégias de GvG, GoT, Relíquias, cavaleiros, cartas e dicas de jogo. Mantenha respostas concisas e úteis. Use emojis para melhorar a legibilidade.'
        },
        {
          role: 'user',
          content: question
        }
      ]
    });

    // Extrair resposta
    let iaResponse = response.choices?.[0]?.message?.content;
    
    // Se a resposta for um array (conteúdo com múltiplos tipos), extrair apenas texto
    if (Array.isArray(iaResponse)) {
      iaResponse = iaResponse
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');
    }
    
    iaResponse = iaResponse || 'Desculpe, não consegui processar sua pergunta.';
    const responseStr = String(iaResponse);
    
    // Dividir resposta em chunks se for muito longa (limite do Telegram é 4096 caracteres)
    const maxLength = 4000;
    if (responseStr.length > maxLength) {
      const chunks = responseStr.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
      for (const chunk of chunks) {
        await sendTelegramMessageDirect(token, chatId, chunk);
      }
    } else {
      await sendTelegramMessageDirect(token, chatId, responseStr);
    }

    return true;
  } catch (error) {
    console.error("[GoT Bot Integration] Error handling /ia command:", error);
    const token = process.env.TELEGRAM_BOT_TOKEN || "8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY";
    await sendTelegramMessageDirect(
      token,
      chatId,
      "❌ Erro ao processar sua pergunta. Tente novamente mais tarde."
    );
    return false;
  }
}
