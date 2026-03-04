import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy, Star, Target, Swords, Shield, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Ranking() {
  const [gvgStartDate, setGvgStartDate] = useState("");
  const [gvgEndDate, setGvgEndDate] = useState("");
  const [gotStartDate, setGotStartDate] = useState("");
  const [gotEndDate, setGotEndDate] = useState("");
  const [sendingGvg, setSendingGvg] = useState(false);
  const [sendingGot, setSendingGot] = useState(false);
  const [searchGotPlayer, setSearchGotPlayer] = useState("");

  const sendRankingMutation = trpc.ranking.sendToTelegram.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Ranking enviado para o Telegram!");
      } else {
        toast.error("Falha ao enviar. Verifique a configuração do bot.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSendGvgRanking = async () => {
    if (!gvgRanking || gvgRanking.length === 0) {
      toast.error("Nenhum dado para enviar");
      return;
    }
    setSendingGvg(true);
    await sendRankingMutation.mutateAsync({
      type: "gvg",
      startDate: gvgStartDate || undefined,
      endDate: gvgEndDate || undefined,
    });
    setSendingGvg(false);
  };

  const handleSendGotRanking = async () => {
    if (!gotRanking || gotRanking.length === 0) {
      toast.error("Nenhum dado para enviar");
      return;
    }
    setSendingGot(true);
    await sendRankingMutation.mutateAsync({
      type: "got",
      startDate: gotStartDate || undefined,
      endDate: gotEndDate || undefined,
    });
    setSendingGot(false);
  };

  // GvG Ranking
  const { data: gvgRanking, isLoading: loadingGvg } = trpc.ranking.gvg.useQuery({
    startDate: gvgStartDate || undefined,
    endDate: gvgEndDate || undefined,
    limit: 50,
  });

  // GoT Ranking
  const { data: gotRanking, isLoading: loadingGot } = trpc.ranking.got.useQuery({
    startDate: gotStartDate || undefined,
    endDate: gotEndDate || undefined,
    limit: 50,
  });

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Ranking de Performance
          </h1>
          <p className="text-muted-foreground">
            Veja os melhores jogadores em cada evento
          </p>
        </div>

        <Tabs defaultValue="gvg" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="gvg" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              GvG (Estrelas)
            </TabsTrigger>
            <TabsTrigger value="got" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              GoT (Pontos)
            </TabsTrigger>
          </TabsList>

          {/* GvG Ranking Tab */}
          <TabsContent value="gvg" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtrar por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={gvgStartDate}
                      onChange={(e) => setGvgStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={gvgEndDate}
                      onChange={(e) => setGvgEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Ranking GvG - Total de Estrelas
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendGvgRanking}
                    disabled={sendingGvg || !gvgRanking || gvgRanking.length === 0}
                  >
                    {sendingGvg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">Telegram</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  {gvgStartDate || gvgEndDate 
                    ? `Período: ${gvgStartDate || "início"} até ${gvgEndDate || "hoje"}`
                    : "Todo o período"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingGvg ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !gvgRanking || gvgRanking.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de GvG encontrado
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 w-16">#</th>
                          <th className="text-left py-3 px-2">Jogador</th>
                          <th className="text-center py-3 px-2">Total Estrelas</th>
                          <th className="text-center py-3 px-2">Batalhas</th>
                          <th className="text-center py-3 px-2">Média</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gvgRanking.map((player, index) => (
                          <tr key={player.memberId} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <span className={`font-bold ${getMedalColor(index + 1)}`}>
                                {index + 1 <= 3 ? (
                                  <Trophy className={`h-5 w-5 inline ${getMedalColor(index + 1)}`} />
                                ) : (
                                  index + 1
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-medium">{player.memberName}</td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold">{player.totalStars}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">{player.totalAttacks}</td>
                            <td className="py-3 px-2 text-center">
                              {Number(player.avgStars || 0).toFixed(1)}
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

          {/* GoT Ranking Tab */}
          <TabsContent value="got" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtrar por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={gotStartDate}
                      onChange={(e) => setGotStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={gotEndDate}
                      onChange={(e) => setGotEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Ranking GoT - Total de Pontos
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendGotRanking}
                    disabled={sendingGot || !gotRanking || gotRanking.length === 0}
                  >
                    {sendingGot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">Telegram</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  {gotStartDate || gotEndDate 
                    ? `Período: ${gotStartDate || "início"} até ${gotEndDate || "hoje"}`
                    : "Todo o período"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Pesquisar jogador..."
                    value={searchGotPlayer}
                    onChange={(e) => setSearchGotPlayer(e.target.value)}
                    className="w-full"
                  />
                </div>
                {loadingGot ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !gotRanking || gotRanking.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de GoT encontrado
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 w-16">#</th>
                          <th className="text-left py-3 px-2">Jogador</th>
                          <th className="text-center py-3 px-2">Pontos</th>
                          <th className="text-center py-3 px-2">
                            <Swords className="h-4 w-4 inline mr-1" />
                            Ataque
                          </th>
                          <th className="text-center py-3 px-2">
                            <Shield className="h-4 w-4 inline mr-1" />
                            Defesa
                          </th>
                          <th className="text-center py-3 px-2">Batalhas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gotRanking
                          .filter(player => player.memberName.toLowerCase().includes(searchGotPlayer.toLowerCase()))
                          .map((player, index) => (
                          <tr key={player.memberId} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <span className={`font-bold ${getMedalColor(index + 1)}`}>
                                {index + 1 <= 3 ? (
                                  <Trophy className={`h-5 w-5 inline ${getMedalColor(index + 1)}`} />
                                ) : (
                                  index + 1
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-medium">{player.memberName}</td>
                            <td className="py-3 px-2 text-center">
                              <span className="font-bold text-purple-600">{player.totalPoints}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="text-green-600">{player.totalAttackVictories}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-red-500">{player.totalAttackDefeats}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="text-green-600">{player.totalDefenseVictories}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-red-500">{player.totalDefenseDefeats}</span>
                            </td>
                            <td className="py-3 px-2 text-center">{player.totalBattles}</td>
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
      </div>
    </DashboardLayout>
  );
}
