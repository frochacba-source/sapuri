import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function RecommendationsPanel() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  // Buscar todos os personagens
  const { data: charactersData, isLoading: isLoadingCharacters } = trpc.characters.getAll.useQuery();
  const characters = charactersData?.data || [];

  // Filtrar personagens por busca
  const filteredCharacters = useMemo(() => {
    return characters.filter(char =>
      char.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [characters, searchQuery]);

  // Gerar recomendações
  const generateRecommendations = async () => {
    if (!selectedCharacterId) {
      toast.error('Selecione um cavaleiro');
      return;
    }

    const character = characters.find(c => c.id === selectedCharacterId);
    if (!character) return;

    setIsLoading(true);
    try {
      const response = await trpc.recommendations.getCardRecommendations.mutate({
        characterId: character.id,
        characterName: character.name,
        characterClass: character.class,
        characterType: character.type,
        hp: character.hp,
        atk: character.atk,
        def: character.def,
      });

      if (response.success) {
        setRecommendations(response);
        toast.success('Recomendações geradas com sucesso!');
      } else {
        toast.error(response.message || 'Erro ao gerar recomendações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao gerar recomendações com IA');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recomendador de Cartas</h1>
        <p className="text-muted-foreground">Use IA para descobrir as melhores cartas para cada cavaleiro</p>
      </div>

      {/* Seletor de Cavaleiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Selecione um Cavaleiro
          </CardTitle>
          <CardDescription>Escolha o cavaleiro para análise de cartas ideais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Buscar Cavaleiro</label>
            <div className="relative">
              <Input
                placeholder="Digite o nome do cavaleiro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cavaleiros Disponíveis</label>
            <Select
              value={selectedCharacterId?.toString() || ''}
              onValueChange={(val) => setSelectedCharacterId(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cavaleiro" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCharacters ? (
                  <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                ) : filteredCharacters.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">Nenhum cavaleiro encontrado</div>
                ) : (
                  filteredCharacters.map(char => (
                    <SelectItem key={char.id} value={char.id.toString()}>
                      {char.name} ({char.class})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedCharacter && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Classe</p>
                <p className="font-semibold">{selectedCharacter.class}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-semibold">{selectedCharacter.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HP</p>
                <p className="font-semibold">{selectedCharacter.hp || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ATK</p>
                <p className="font-semibold">{selectedCharacter.atk || 'N/A'}</p>
              </div>
            </div>
          )}

          <Button
            onClick={generateRecommendations}
            disabled={!selectedCharacterId || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Recomendações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recomendações */}
      {recommendations && (
        <div className="space-y-4">
          {/* Análise Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de {recommendations.characterName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {recommendations.analysis}
              </p>
            </CardContent>
          </Card>

          {/* Cartas Recomendadas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cartas Recomendadas</h3>
            {recommendations.recommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <p>Nenhuma carta recomendada encontrada</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.recommendations.map((rec: any, idx: number) => (
                  <Card key={idx} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base">{rec.cardName}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              rec.priority === 'Alta' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                              rec.priority === 'Média' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                              'bg-green-500/20 text-green-700 dark:text-green-400'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {rec.reason}
                      </p>
                      {rec.cardData && (
                        <div className="mt-4 space-y-2 text-xs">
                          {rec.cardData.bonusDmg && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">DMG:</span>
                              <span className="font-semibold">+{rec.cardData.bonusDmg}%</span>
                            </div>
                          )}
                          {rec.cardData.bonusDef && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">DEF:</span>
                              <span className="font-semibold">+{rec.cardData.bonusDef}%</span>
                            </div>
                          )}
                          {rec.cardData.referenceLink && (
                            <a
                              href={rec.cardData.referenceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline block mt-2"
                            >
                              Ver mais informações →
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
