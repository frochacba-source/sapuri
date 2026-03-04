import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Search, RefreshCw, Star, Sparkles } from 'lucide-react';

interface CardData {
  id: string;
  namePortuguese: string;
  nameEnglish: string;
  description: string;
  rarity: number;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: Record<string, number | undefined>;
  recommendedCharacters: string[];
  imageUrl: string;
}

export function ArayashikiSyncPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCardForAnalysis, setSelectedCardForAnalysis] = useState<CardData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const syncMutation = trpc.arayashikiSync.syncFromSsloj.useMutation();
  const analyzeCardMutation = trpc.cardAnalysis.analyzeCard.useMutation();
  const searchQuery = trpc.arayashikiSync.searchByName.useQuery(
    { name: searchTerm },
    { enabled: searchTerm.length > 0 }
  );
  const qualityQuery = trpc.arayashikiSync.getByQuality.useQuery(
    { quality: selectedQuality as any },
    { enabled: selectedQuality !== '' }
  );
  const rarityQuery = trpc.arayashikiSync.getByRarity.useQuery(
    { rarity: parseInt(selectedRarity) },
    { enabled: selectedRarity !== '' }
  );

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncMutation.mutateAsync();
      if (result.success) {
        setCards(result.cards);
        toast.success(`${result.cards.length} cartas sincronizadas com sucesso!`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao sincronizar cartas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.data?.success) {
      setCards(searchQuery.data.results);
    }
  };

  const handleQualityFilter = () => {
    if (qualityQuery.data?.success) {
      setCards(qualityQuery.data.results);
    }
  };

  const handleRarityFilter = () => {
    if (rarityQuery.data?.success) {
      setCards(rarityQuery.data.results);
    }
  };

  const displayedCards = cards.length > 0 ? cards : [];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'legendary': return 'bg-yellow-900 text-yellow-100';
      case 'epic': return 'bg-purple-900 text-purple-100';
      case 'rare': return 'bg-blue-900 text-blue-100';
      default: return 'bg-gray-700 text-gray-100';
    }
  };

  const getQualityLabel = (quality: string) => {
    const labels: Record<string, string> = {
      'legendary': 'Lendária',
      'epic': 'Épica',
      'rare': 'Rara',
      'common': 'Comum'
    };
    return labels[quality] || quality;
  };

  const handleAnalyzeCard = async (card: CardData) => {
    setSelectedCardForAnalysis(card);
    setIsAnalyzing(true);
    try {
      const result = await analyzeCardMutation.mutateAsync({
        cardName: card.namePortuguese,
        cardDescription: card.description,
        attributes: card.attributes,
        rarity: card.rarity,
      });
      setAnalysisResult(result.analysis);
    } catch (error) {
      toast.error('Erro ao analisar carta com IA');
      setSelectedCardForAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Section */}
      <Card className="p-6 bg-card">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Sincronizar Cartas do SSLOJ</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clique para extrair todas as cartas do site ssloj.com em português
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={isLoading || syncMutation.isPending}
            className="w-full"
          >
            {isLoading || syncMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Cartas
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Search and Filter Section */}
      <Card className="p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Buscar e Filtrar Cartas</h3>
        <div className="space-y-4">
          {/* Search by Name */}
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nome em português..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Quality Filter */}
          <div className="flex gap-2">
            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filtrar por qualidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legendary">Lendária</SelectItem>
                <SelectItem value="epic">Épica</SelectItem>
                <SelectItem value="rare">Rara</SelectItem>
                <SelectItem value="common">Comum</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleQualityFilter} variant="outline">
              Filtrar
            </Button>
          </div>

          {/* Rarity Filter */}
          <div className="flex gap-2">
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filtrar por raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Estrelas</SelectItem>
                <SelectItem value="5">5 Estrelas</SelectItem>
                <SelectItem value="4">4 Estrelas</SelectItem>
                <SelectItem value="3">3 Estrelas</SelectItem>
                <SelectItem value="2">2 Estrelas</SelectItem>
                <SelectItem value="1">1 Estrela</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRarityFilter} variant="outline">
              Filtrar
            </Button>
          </div>
        </div>
      </Card>

      {/* Cards Grid */}
      {displayedCards.length > 0 && (
        <Card className="p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">
            Cartas ({displayedCards.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCards.map((card) => (
              <div
                key={card.id}
                className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                {/* Card Image */}
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.namePortuguese}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}

                {/* Card Name and Rarity */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm line-clamp-2">
                      {card.namePortuguese}
                    </h4>
                    <div className="flex gap-0.5">
                      {Array.from({ length: card.rarity }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getQualityColor(card.quality)}`}>
                    {getQualityLabel(card.quality)}
                  </span>
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                    {card.description}
                  </p>
                )}

                {/* Attributes */}
                {Object.keys(card.attributes).length > 0 && (
                  <div className="mb-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Atributos:</p>
                    <div className="text-xs space-y-0.5">
                      {Object.entries(card.attributes).map(([key, value]) => {
                        if (!value) return null;
                        const labels: Record<string, string> = {
                          'dmgBoost': 'DMG',
                          'precision': 'Precisão',
                          'atkSpeed': 'Vel. Ataque',
                          'defBoost': 'Defesa',
                          'hpBoost': 'HP',
                          'dodge': 'Esquiva',
                          'tenacity': 'Tenacidade',
                          'crit': 'Crítico',
                          'healing': 'Cura',
                          'lifeDrain': 'Sanguessuga',
                          'dmgReduced': 'Red. Dano',
                          'haste': 'Pressa'
                        };
                        return (
                          <div key={key} className="flex justify-between">
                            <span>{labels[key] || key}:</span>
                            <span className="font-semibold text-accent">{value.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommended Characters */}
                {card.recommendedCharacters.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Recomendado para: {card.recommendedCharacters.length} cavaleiro(s)
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnalyzeCard(card)}
                    className="flex-1 text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Analisar com IA
                  </Button>
                  <a
                    href={`https://ssloj.com/arayashikis/${card.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center"
                  >
                    SSLOJ →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {cards.length === 0 && !isLoading && (
        <Card className="p-12 bg-card text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma carta sincronizada ainda. Clique no botão acima para sincronizar as cartas do SSLOJ.
          </p>
        </Card>
      )}

      {/* Analysis Modal */}
      <Dialog open={selectedCardForAnalysis !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedCardForAnalysis(null);
          setAnalysisResult('');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Análise de IA: {selectedCardForAnalysis?.namePortuguese}
            </DialogTitle>
            <DialogDescription>
              Recomendações de builds e estratégias para esta carta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Analisando carta com IA...</span>
              </div>
            ) : analysisResult ? (
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                {analysisResult}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
