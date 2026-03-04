import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, Star, Swords, Trophy, Target, Shield, TrendingDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { useLocation } from "wouter";

export default function PrecisaAtencao() {
  const [, setLocation] = useLocation();
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Get rankings
  const { data: gvgRanking, isLoading: loadingGvg } = trpc.ranking.gvg.useQuery({
    startDate,
    endDate,
    limit: 100,
  });

  const { data: gotRanking, isLoading: loadingGot } = trpc.ranking.got.useQuery({
    startDate,
    endDate,
    limit: 100,
  });

  // Dados específicos para Precisa de Atenção GoT - Última batalha
  const { data: gotNonAttackers, isLoading: loadingGotNonAttackers } = trpc.ranking.gotNonAttackersLatest.useQuery({
    startDate,
    endDate,
  });

  const { data: gotLowPerformers, isLoading: loadingGotLowPerformers } = trpc.ranking.gotLowPerformersLatest.useQuery({
    startDate,
    endDate,
  });
  
  // Dados de histórico de faltas - todas as batalhas
  const { data: gotNonAttackersHistory, isLoading: loadingGotHistory } = trpc.ranking.gotNonAttackersHistory.useQuery({
    startDate,
    endDate,
  });
  
  // Dados de métrica de aproveitamento - todas as batalhas
  const { data: gotPerformanceMetrics, isLoading: loadingGotPerformance } = trpc.ranking.gotPerformanceMetrics.useQuery({
    startDate,
    endDate,
  });

  const { data: reliquiasRanking, isLoading: loadingReliquias } = trpc.ranking.reliquias.useQuery({
    limit: 100,
  });

  const isLoading = loadingGvg || loadingGot || loadingReliquias || loadingGotNonAttackers || loadingGotLowPerformers || loadingGotHistory || loadingGotPerformance;

  // Filtrar membros com problemas
  const gvgProblems = gvgRanking?.filter(p => 
    p.totalAttacks === 0 || Number(p.avgStars || 0) < 2
  ).sort((a, b) => {
    if (a.totalAttacks !== b.totalAttacks) return a.totalAttacks - b.totalAttacks;
    return Number(a.avgStars || 0) - Number(b.avgStars || 0);
  }) || [];

  // Usar dados específicos das novas rotas
  const gotNonAttackersList = gotNonAttackers || [];
  const gotLowPerformersList = gotLowPerformers || [];

  const reliquiasProblems = reliquiasRanking?.filter(p => 
    p.totalDamage === 0
  ).sort((a, b) => a.totalDamage - b.totalDamage) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Precisa de Atenção
            </h1>
            <p className="text-muted-foreground">
              Membros que precisam melhorar participação e desempenho
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
                  className="w-40"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando dados...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="gvg" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gvg" className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-red-500" />
                GvG ({gvgProblems.length})
              </TabsTrigger>
              <TabsTrigger value="got" className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-500" />
                GoT ({gotNonAttackersList.length + gotLowPerformersList.length})
              </TabsTrigger>
              <TabsTrigger value="reliquias" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                Relíquias ({reliquiasProblems.length})
              </TabsTrigger>
            </TabsList>

            {/* GvG Tab */}
            <TabsContent value="gvg" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Não Atacaram */}
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Não Atacaram
                    </CardTitle>
                    <CardDescription>
                      Escalados que não realizaram nenhum ataque
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gvgProblems.filter(p => p.totalAttacks === 0).length > 0 ? (
                      <div className="space-y-3">
                        {gvgProblems.filter(p => p.totalAttacks === 0).map((player, index) => (
                          <div 
                            key={player.memberId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-red-100/50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border-l-4 border-red-500"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <Badge className="w-8 h-8 p-0 flex items-center justify-center bg-red-500 text-white">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-semibold">{player.memberName}</p>
                              <p className="text-sm text-red-600 font-medium">
                                ❌ Não atacou!
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 font-bold text-lg text-red-600">
                                <Star className="h-4 w-4" />
                                0
                              </div>
                              <p className="text-sm text-muted-foreground">
                                estrelas
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-green-600 py-4">
                        ✅ Todos os escalados atacaram!
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Desempenho Ruim */}
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <TrendingDown className="h-5 w-5" />
                      Desempenho Baixo
                    </CardTitle>
                    <CardDescription>
                      Média inferior a 2 estrelas por batalha
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gvgProblems.filter(p => p.totalAttacks > 0 && Number(p.avgStars || 0) < 2).length > 0 ? (
                      <div className="space-y-3">
                        {gvgProblems.filter(p => p.totalAttacks > 0 && Number(p.avgStars || 0) < 2).map((player, index) => (
                          <div 
                            key={player.memberId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-orange-100/50 dark:bg-orange-900/20 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors border-l-4 border-orange-500"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <Badge className="w-8 h-8 p-0 flex items-center justify-center bg-orange-500 text-white">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-semibold">{player.memberName}</p>
                              <p className="text-sm text-orange-600">
                                {player.totalAttacks} batalhas
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 font-bold text-lg text-orange-600">
                                <Star className="h-4 w-4" />
                                {Number(player.avgStars || 0).toFixed(1)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                média
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-green-600 py-4">
                        ✅ Todos com desempenho adequado!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* GoT Tab */}
            <TabsContent value="got" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Histórico de Faltas */}
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Escalados sem Ataques
                    </CardTitle>
                    <CardDescription>
                      Histórico de faltas em todas as batalhas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gotNonAttackersHistory && gotNonAttackersHistory.length > 0 ? (
                      <div className="space-y-4">
                        {gotNonAttackersHistory.map((player, index) => (
                          <div 
                            key={player.memberId}
                            className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/20 border-l-4 border-red-500 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{player.memberName}</p>
                                <p className="text-sm text-red-600 font-medium">
                                  {player.nonAttacks} falta(s) em {player.totalAttacks} batalha(s) ({player.percentage}%)
                                </p>
                              </div>
                              <Badge className="bg-red-500 text-white">{player.nonAttacks}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="font-medium">Batalhas sem ataque:</p>
                              <div className="flex flex-wrap gap-2">
                                {player.battles
                                  .filter(b => b.didNotAttack)
                                  .map((battle, i) => (
                                    <span key={i} className="bg-red-200 dark:bg-red-900/40 px-2 py-1 rounded">
                                      {battle.date}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-green-600 py-4">
                        ✅ Todos atacaram em todas as batalhas!
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Baixo Aproveitamento */}
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <TrendingDown className="h-5 w-5" />
                      Baixo Aproveitamento
                    </CardTitle>
                    <CardDescription>
                      Membros com taxa de vitórias &lt; 50%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gotPerformanceMetrics && gotPerformanceMetrics.length > 0 ? (
                      <div className="space-y-3">
                        {gotPerformanceMetrics.map((player, index) => (
                          <div 
                            key={player.memberId}
                            className="flex items-center gap-4 p-3 rounded-lg bg-orange-100/50 dark:bg-orange-900/20 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors border-l-4 border-orange-500"
                            onClick={() => setLocation(`/membro/${player.memberId}`)}
                          >
                            <Badge className="w-8 h-8 p-0 flex items-center justify-center bg-orange-500 text-white">
                              {index + 1}
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
                              <div className="flex items-center gap-1 font-bold text-lg text-orange-600">
                                {player.performance}%
                              </div>
                              <p className="text-sm text-muted-foreground">
                                aproveitamento
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-green-600 py-4">
                        ✅ Todos com aproveitamento adequado!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Relíquias Tab */}
            <TabsContent value="reliquias" className="space-y-6">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Sem Dano Registrado
                  </CardTitle>
                  <CardDescription>
                    Escalados que não causaram dano na temporada atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reliquiasProblems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reliquiasProblems.map((player, index) => (
                        <div 
                          key={player.memberId}
                          className="flex items-center gap-4 p-3 rounded-lg bg-red-100/50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border-l-4 border-red-500"
                          onClick={() => setLocation(`/membro/${player.memberId}`)}
                        >
                          <Badge className="w-8 h-8 p-0 flex items-center justify-center bg-red-500 text-white">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-semibold">{player.memberName}</p>
                            <p className="text-sm text-red-600 font-medium">
                              ❌ Sem dano registrado
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 font-bold text-lg text-red-600">
                              <Target className="h-4 w-4" />
                              0
                            </div>
                            <p className="text-sm text-muted-foreground">
                              dano
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-green-600 py-4">
                      ✅ Todos os escalados causaram dano!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
