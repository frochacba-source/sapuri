import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Star, Target, Crown, Swords, Shield, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MemberHistory() {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // Get all members
  const { data: members, isLoading: loadingMembers } = trpc.members.list.useQuery();

  // Get member stats
  const { data: memberStats, isLoading: loadingStats } = trpc.memberHistory.fullStats.useQuery(
    { memberId: selectedMemberId! },
    { enabled: !!selectedMemberId }
  );

  // Get GvG history
  const { data: gvgHistory, isLoading: loadingGvg } = trpc.memberHistory.gvg.useQuery(
    { memberId: selectedMemberId!, limit: 30 },
    { enabled: !!selectedMemberId }
  );

  // Get GoT history
  const { data: gotHistory, isLoading: loadingGot } = trpc.memberHistory.got.useQuery(
    { memberId: selectedMemberId!, limit: 30 },
    { enabled: !!selectedMemberId }
  );

  // Get Reliquias history
  const { data: reliquiasHistory, isLoading: loadingReliquias } = trpc.memberHistory.reliquias.useQuery(
    { memberId: selectedMemberId! },
    { enabled: !!selectedMemberId }
  );

  const selectedMember = useMemo(() => {
    return members?.find(m => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  const isLoading = loadingStats || loadingGvg || loadingGot || loadingReliquias;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Histórico do Membro
          </h1>
          <p className="text-muted-foreground">
            Veja o histórico de performance de cada membro em todos os eventos
          </p>
        </div>

        {/* Member Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione um Membro</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMembers ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Select
                value={selectedMemberId?.toString() || ""}
                onValueChange={(value) => setSelectedMemberId(parseInt(value))}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Escolha um membro..." />
                </SelectTrigger>
                <SelectContent>
                  {members?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedMemberId && (
          <>
            {/* Stats Summary */}
            {memberStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      GvG - Estrelas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {memberStats.gvg.totalStars}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {memberStats.gvg.totalBattles} batalhas • Média: {memberStats.gvg.avgStars?.toFixed(1) || "0.0"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      GoT - Pontos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {memberStats.got.totalPoints}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {memberStats.got.totalBattles} batalhas • {memberStats.got.totalAttackVictories}V/{memberStats.got.totalDefenseVictories}D
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4 text-emerald-500" />
                      Relíquias - Dano
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-600">
                      {memberStats.reliquias.totalDamage}B
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {memberStats.reliquias.seasonsParticipated} temporadas
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* History Tabs */}
            <Tabs defaultValue="gvg" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="gvg">GvG</TabsTrigger>
                <TabsTrigger value="got">GoT</TabsTrigger>
                <TabsTrigger value="reliquias">Relíquias</TabsTrigger>
              </TabsList>

              {/* GvG History */}
              <TabsContent value="gvg">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="h-5 w-5" />
                      Histórico GvG
                    </CardTitle>
                    <CardDescription>
                      Últimas {gvgHistory?.length || 0} batalhas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingGvg ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : !gvgHistory || gvgHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum registro de GvG encontrado
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Data</th>
                              <th className="text-center py-2 px-2">1º Ataque</th>
                              <th className="text-center py-2 px-2">2º Ataque</th>
                              <th className="text-center py-2 px-2">Total</th>
                              <th className="text-center py-2 px-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gvgHistory.map((record) => (
                              <tr key={record.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-2">
                                  {format(new Date(record.eventDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className="flex items-center justify-center gap-0.5">
                                    {[1, 2, 3].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= record.attack1Stars
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300 fill-gray-200"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className="flex items-center justify-center gap-0.5">
                                    {[1, 2, 3].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= record.attack2Stars
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300 fill-gray-200"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center font-bold">
                                  {record.attack1Stars + record.attack2Stars}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {record.didNotAttack ? (
                                    <span className="text-red-500 text-sm">Não atacou</span>
                                  ) : (
                                    <span className="text-green-500 text-sm">✓</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* GoT History */}
              <TabsContent value="got">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Histórico GoT
                    </CardTitle>
                    <CardDescription>
                      Últimas {gotHistory?.length || 0} batalhas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingGot ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : !gotHistory || gotHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum registro de GoT encontrado
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Data</th>
                              <th className="text-center py-2 px-2">Ranking</th>
                              <th className="text-center py-2 px-2">
                                <Swords className="h-4 w-4 inline" /> Ataque
                              </th>
                              <th className="text-center py-2 px-2">
                                <Shield className="h-4 w-4 inline" /> Defesa
                              </th>
                              <th className="text-center py-2 px-2">Pontos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gotHistory.map((record) => (
                              <tr key={record.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-2">
                                  {format(new Date(record.eventDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {record.ranking ? `#${record.ranking}` : "-"}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <span className="text-green-600">{record.attackVictories}</span>
                                  <span className="text-muted-foreground">/</span>
                                  <span className="text-red-500">{record.attackDefeats}</span>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <span className="text-green-600">{record.defenseVictories}</span>
                                  <span className="text-muted-foreground">/</span>
                                  <span className="text-red-500">{record.defenseDefeats}</span>
                                </td>
                                <td className="py-2 px-2 text-center font-bold text-purple-600">
                                  {record.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reliquias History */}
              <TabsContent value="reliquias">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Histórico Relíquias
                    </CardTitle>
                    <CardDescription>
                      Participação em temporadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingReliquias ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : !reliquiasHistory || reliquiasHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum registro de Relíquias encontrado
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Temporada</th>
                              <th className="text-center py-2 px-2">Período</th>
                              <th className="text-center py-2 px-2">Ranking</th>
                              <th className="text-center py-2 px-2">Dano</th>
                              <th className="text-center py-2 px-2">Poder</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reliquiasHistory.map((record) => (
                              <tr key={record.damage.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-2 font-medium">{record.season.name}</td>
                                <td className="py-2 px-2 text-center text-sm text-muted-foreground">
                                  {format(new Date(record.season.startDate + "T12:00:00"), "dd/MM", { locale: ptBR })}
                                  {record.season.endDate && (
                                    <> - {format(new Date(record.season.endDate + "T12:00:00"), "dd/MM", { locale: ptBR })}</>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {record.damage.ranking ? `#${record.damage.ranking}` : "-"}
                                </td>
                                <td className="py-2 px-2 text-center font-bold text-emerald-600">
                                  {record.damage.cumulativeDamage}
                                </td>
                                <td className="py-2 px-2 text-center text-muted-foreground">
                                  {record.damage.power || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
