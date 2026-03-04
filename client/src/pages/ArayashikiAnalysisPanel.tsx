/**
 * Painel de Análise de Cartas (Arayashiki) com IA
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Search, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';

export function ArayashikiAnalysisPanel() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedCard1, setSelectedCard1] = useState<string>('');
  const [selectedCard2, setSelectedCard2] = useState<string>('');
  const [characterRole, setCharacterRole] = useState<'attacker' | 'defender' | 'support'>('attacker');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [synergyAnalysis, setSynergyAnalysis] = useState<string>('');
  const [buildAnalysis, setBuildAnalysis] = useState<string>('');

  // Queries
  const { data: allCards } = trpc.arayashikiAnalysis.listAll.useQuery();
  const analyzeForCharacterQuery = trpc.arayashikiAnalysis.analyzeForCharacter.useQuery(
    { characterName: selectedCharacter },
    { enabled: !!selectedCharacter }
  );
  const analyzeSynergyQuery = trpc.arayashikiAnalysis.analyzeSynergy.useQuery(
    { card1Name: selectedCard1, card2Name: selectedCard2, characterName: selectedCharacter },
    { enabled: !!selectedCard1 && !!selectedCard2 }
  );
  const generateBuildQuery = trpc.arayashikiAnalysis.generateOptimalBuild.useQuery(
    { characterName: selectedCharacter, role: characterRole },
    { enabled: !!selectedCharacter }
  );

  const cards = allCards?.data || [];
  const cardNames = cards.map(c => c.name);

  const handleAnalyzeCharacter = async () => {
    if (!selectedCharacter) {
      toast.error('Selecione um cavaleiro');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeForCharacterQuery.refetch();
      if (result.data?.success) {
        setAnalysis(result.data.analysis);
        toast.success('Análise concluída!');
      }
    } catch (error) {
      toast.error('Erro ao analisar cavaleiro');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSynergy = async () => {
    if (!selectedCard1 || !selectedCard2) {
      toast.error('Selecione duas cartas');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSynergyQuery.refetch();
      if (result.data?.success) {
        setSynergyAnalysis(result.data.analysis);
        toast.success('Análise de sinergia concluída!');
      }
    } catch (error) {
      toast.error('Erro ao analisar sinergia');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBuild = async () => {
    if (!selectedCharacter) {
      toast.error('Selecione um cavaleiro');
      return;
    }

    setLoading(true);
    try {
      const result = await generateBuildQuery.refetch();
      if (result.data?.success) {
        setBuildAnalysis(result.data.build);
        toast.success('Build gerada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao gerar build');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-amber-500" />
        <h1 className="text-3xl font-bold">Análise de Cartas com IA</h1>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze">Analisar Cavaleiro</TabsTrigger>
          <TabsTrigger value="synergy">Sinergia de Cartas</TabsTrigger>
          <TabsTrigger value="build">Gerar Build</TabsTrigger>
        </TabsList>

        {/* Aba 1: Analisar Cavaleiro */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Cartas para Cavaleiro</CardTitle>
              <CardDescription>
                Selecione um cavaleiro e a IA recomendará as melhores cartas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cavaleiro</label>
                <Input
                  placeholder="Digite o nome do cavaleiro (ex: Ikki, Seiya, Shun)"
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAnalyzeCharacter}
                disabled={!selectedCharacter || loading}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? 'Analisando...' : 'Analisar com IA'}
              </Button>

              {analysis && (
                <Card className="bg-slate-50 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Streamdown>{analysis}</Streamdown>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Sinergia de Cartas */}
        <TabsContent value="synergy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Sinergia</CardTitle>
              <CardDescription>
                Analise como duas cartas funcionam juntas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Carta 1</label>
                  <Select value={selectedCard1} onValueChange={setSelectedCard1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cardNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Carta 2</label>
                  <Select value={selectedCard2} onValueChange={setSelectedCard2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cardNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cavaleiro (Opcional)</label>
                <Input
                  placeholder="Digite o nome do cavaleiro"
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAnalyzeSynergy}
                disabled={!selectedCard1 || !selectedCard2 || loading}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? 'Analisando...' : 'Analisar Sinergia'}
              </Button>

              {synergyAnalysis && (
                <Card className="bg-slate-50 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Análise de Sinergia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Streamdown>{synergyAnalysis}</Streamdown>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 3: Gerar Build */}
        <TabsContent value="build" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Build Otimizado</CardTitle>
              <CardDescription>
                A IA criará uma composição de cartas otimizada para seu cavaleiro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cavaleiro</label>
                <Input
                  placeholder="Digite o nome do cavaleiro"
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Papel do Cavaleiro</label>
                <Select value={characterRole} onValueChange={(value: any) => setCharacterRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attacker">Atacante</SelectItem>
                    <SelectItem value="defender">Defensor</SelectItem>
                    <SelectItem value="support">Suporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateBuild}
                disabled={!selectedCharacter || loading}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? 'Gerando...' : 'Gerar Build'}
              </Button>

              {buildAnalysis && (
                <Card className="bg-slate-50 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-lg">Build Recomendado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Streamdown>{buildAnalysis}</Streamdown>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Seção de Cartas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Cartas Disponíveis
          </CardTitle>
          <CardDescription>
            Total de {cards.length} cartas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="font-medium text-sm">{card.name}</div>
                <div className="text-xs text-muted-foreground">
                  {card.quality} • {card.attribute}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
