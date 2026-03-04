/**
 * Cache em memória para estratégias GoT
 * Melhora performance das buscas evitando consultas repetidas ao banco de dados
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface StrategyCache {
  byCharacter: Map<string, CacheEntry<any[]>>;
  byName: Map<string, CacheEntry<any[]>>;
  byKeyword: Map<string, CacheEntry<any[]>>;
  allStrategies: CacheEntry<any[]> | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cache: StrategyCache = {
  byCharacter: new Map(),
  byName: new Map(),
  byKeyword: new Map(),
  allStrategies: null,
};

function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp > CACHE_TTL;
}

export function getCachedByCharacter(character: string): any[] | null {
  const entry = cache.byCharacter.get(character.toLowerCase());
  if (!entry || isExpired(entry)) {
    cache.byCharacter.delete(character.toLowerCase());
    return null;
  }
  console.log(`[Cache] Hit: byCharacter/${character}`);
  return entry.data;
}

export function setCachedByCharacter(character: string, data: any[]): void {
  cache.byCharacter.set(character.toLowerCase(), {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Cache] Set: byCharacter/${character} (${data.length} items)`);
}

export function getCachedByName(name: string): any[] | null {
  const entry = cache.byName.get(name.toLowerCase());
  if (!entry || isExpired(entry)) {
    cache.byName.delete(name.toLowerCase());
    return null;
  }
  console.log(`[Cache] Hit: byName/${name}`);
  return entry.data;
}

export function setCachedByName(name: string, data: any[]): void {
  cache.byName.set(name.toLowerCase(), {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Cache] Set: byName/${name} (${data.length} items)`);
}

export function getCachedByKeyword(keyword: string): any[] | null {
  const entry = cache.byKeyword.get(keyword.toLowerCase());
  if (!entry || isExpired(entry)) {
    cache.byKeyword.delete(keyword.toLowerCase());
    return null;
  }
  console.log(`[Cache] Hit: byKeyword/${keyword}`);
  return entry.data;
}

export function setCachedByKeyword(keyword: string, data: any[]): void {
  cache.byKeyword.set(keyword.toLowerCase(), {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Cache] Set: byKeyword/${keyword} (${data.length} items)`);
}

export function getCachedAllStrategies(): any[] | null {
  if (!cache.allStrategies || isExpired(cache.allStrategies)) {
    cache.allStrategies = null;
    return null;
  }
  console.log(`[Cache] Hit: allStrategies`);
  return cache.allStrategies.data;
}

export function setCachedAllStrategies(data: any[]): void {
  cache.allStrategies = {
    data,
    timestamp: Date.now(),
  };
  console.log(`[Cache] Set: allStrategies (${data.length} items)`);
}

export function invalidateCache(): void {
  cache.byCharacter.clear();
  cache.byName.clear();
  cache.byKeyword.clear();
  cache.allStrategies = null;
  console.log('[Cache] Cache invalidado completamente');
}

export function invalidateCacheByCharacter(character: string): void {
  cache.byCharacter.delete(character.toLowerCase());
  console.log(`[Cache] Cache invalidado: byCharacter/${character}`);
}

export function getCacheStats(): {
  byCharacter: number;
  byName: number;
  byKeyword: number;
  hasAllStrategies: boolean;
  totalSize: number;
} {
  return {
    byCharacter: cache.byCharacter.size,
    byName: cache.byName.size,
    byKeyword: cache.byKeyword.size,
    hasAllStrategies: cache.allStrategies !== null,
    totalSize:
      cache.byCharacter.size +
      cache.byName.size +
      cache.byKeyword.size +
      (cache.allStrategies ? 1 : 0),
  };
}
