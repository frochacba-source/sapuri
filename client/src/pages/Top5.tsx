import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Star, Swords, Crown, Target, Shield, Medal } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";

export default function Top5() {
  const [, setLocation] = useLocation();
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Get rankings
  const { data: gvgRanking, isLoading: loadingGvg } = trpc.ranking.gvg.useQuery({
    startDate,
    endDate,
    limit: 5,
  });

  const { data: gotRanking, isLoading: loadingGot } = trpc.ranking.got.useQuery({
    startDate,
    endDate,
    limit: 5,
  });

  const { data: reliquiasRanking, isLoading: loadingReliquias } = trpc.ranking.reliquias.useQuery({
    limit: 5,
  });

  const isLoading = loadingGvg || loadingGot || loadingReliquias;

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0: return "bg-yellow-500 text-yellow-950";
      case 1: return "bg-gray-400 text-gray-950";
      case 2: return "bg-amber-600 text-amber-950";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0: return <Crown className="h-4 w-4" />;
      case 1: return <Medal className="h-4 w-4" />;
      case 2: return <Medal className="h-4 w-4" />;
      default: return <span>{position + 1}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Top 5 - Competição Interna
            </h1>
            <p className="text-muted-foreground">
              Os melhores desempenhos da guilda
            </p>
          </div>
        </div>

        {/* Date Filters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Período de Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando rankings...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="gvg" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gvg" className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-red-500" />
                GvG
              </TabsTrigger>
              <TabsTrigger value="got" className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-500" />
                GoT
              </TabsTrigger>
              <TabsTrigger value="reliquias" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                Relíquias
              </TabsTrigger>
            </TabsList>

            {/* GvG Tab */}
            <TabsContent value="gvg" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 GvG */}
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      Top 5 - Estrelas Totais
                    </CardTitle>
                    <CardDescription>
                      Maiores pontuadores em estrelas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gvgRanking && gvgRanking.length > 0 ? (
                      <div className="space-y-4">
                        {gvgRanking.map((player, index) => (
                          <div 
                            key={player.memberId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition-colors"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <Badge className={`w-8 h-8 p-0 flex items-center justify-center ${getMedalColor(index)}`}>
                              {getMedalIcon(index)}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-semibold">{player.memberName}</p>
                              <p className="text-sm text-muted-foreground">
                                {player.totalAttacks} batalhas
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 font-bold text-lg">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                {player.totalStars}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                média: {Number(player.avgStars || 0).toFixed(1)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum dado encontrado no período
                      </p>
                    )}
                  </CardContent>
                </Card>

                </div>
            </TabsContent>

            {/* GoT Tab */}
            <TabsContent value="got" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 GoT - Pontos */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-500" />
                      Top 5 - Pontos Totais
                    </CardTitle>
                    <CardDescription>
                      Maiores pontuadores em GoT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gotRanking && gotRanking.length > 0 ? (
                      <div className="space-y-4">
                        {gotRanking.map((player, index) => (
                          <div 
                            key={player.memberId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition-colors"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <Badge className={`w-8 h-8 p-0 flex items-center justify-center ${getMedalColor(index)}`}>
                              {getMedalIcon(index)}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-semibold">{player.memberName}</p>
                              <div className="flex gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Swords className="h-3 w-3 text-green-500" />
                                  {player.totalAttackVictories}V / {player.totalAttackDefeats}D
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3 text-blue-500" />
                                  {player.totalDefenseVictories}V / {player.totalDefenseDefeats}D
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-blue-600">
                                {player.totalPoints} pts
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {player.totalBattles} batalhas
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum dado encontrado no período
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* GoT Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do GoT</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Swords className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Ataque</p>
                        <p className="text-sm text-muted-foreground">
                          Vitórias (V) e Derrotas (D) em ataques realizados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Defesa</p>
                        <p className="text-sm text-muted-foreground">
                          Vitórias (V) e Derrotas (D) em defesas sofridas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Pontuação</p>
                        <p className="text-sm text-muted-foreground">
                          Pontos totais acumulados no período
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Relíquias Tab */}
            <TabsContent value="reliquias" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Relíquias */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Top 5 - Dano Total
                    </CardTitle>
                    <CardDescription>
                      Maiores causadores de dano em Relíquias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reliquiasRanking && reliquiasRanking.length > 0 ? (
                      <div className="space-y-4">
                        {reliquiasRanking.map((player: { memberId: number; memberName: string; totalDamage: number; seasonsParticipated: number }, index: number) => (
                          <div 
                            key={player.memberId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition-colors"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <Badge className={`w-8 h-8 p-0 flex items-center justify-center ${getMedalColor(index)}`}>
                              {getMedalIcon(index)}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-semibold">{player.memberName}</p>
                              <p className="text-sm text-muted-foreground">
                                {player.seasonsParticipated} temporada(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-purple-600">
                                {(player.totalDamage / 1000000).toFixed(1)}M
                              </div>
                              <p className="text-sm text-muted-foreground">
                                dano total
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum dado encontrado
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Relíquias Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre Relíquias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Dano Total</p>
                        <p className="text-sm text-muted-foreground">
                          Soma de todo o dano causado em todas as temporadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Crown className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Temporadas</p>
                        <p className="text-sm text-muted-foreground">
                          Número de temporadas em que o jogador participou
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Medal className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Ranking</p>
                        <p className="text-sm text-muted-foreground">
                          Baseado no dano total acumulado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
