import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, AlertTriangle, Trophy, Loader2, Swords, Shield, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GotAttackRecord {
  memberId: number;
  memberName: string;
  ranking: number;
  power: string;
  attackVictories: number;
  attackDefeats: number;
  defenseVictories: number;
  defenseDefeats: number;
  points: number;
  didNotAttack: boolean;
  previousPoints?: number;
}

export default function GotAttacks() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attacks, setAttacks] = useState<GotAttackRecord[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  // Get GoT event type
  const { data: eventTypes, isLoading: loadingEvents } = trpc.eventTypes.list.useQuery();
  const gotEvent = eventTypes?.find(e => e.name === "got");

  // Get schedule for selected date
  const { data: schedule, isLoading: loadingSchedule } = trpc.schedules.getByEventAndDate.useQuery(
    { eventTypeId: gotEvent?.id || 0, eventDate: selectedDate },
    { enabled: !!gotEvent }
  );

  // Get existing attacks
  const { data: existingAttacks, refetch: refetchAttacks } = trpc.gotAttacks.getByDate.useQuery(
    { eventDate: selectedDate },
    { enabled: !!selectedDate }
  );

  // Get previous points for reference
  const { data: previousPointsData } = trpc.gotAttacks.getPreviousPoints.useQuery(
    { eventDate: selectedDate },
    { enabled: !!selectedDate }
  );

  // Mutations
  const saveAttacksMutation = trpc.gotAttacks.save.useMutation({
    onSuccess: () => {
      toast.success("Dados salvos com sucesso!");
      refetchAttacks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendAlertMutation = trpc.gotAttacks.sendNonAttackerAlert.useMutation({
    onSuccess: (data) => {
      if (data.count === 0) {
        toast.success("Todos os membros atacaram! 🎉");
      } else {
        toast.success(`Alerta enviado para ${data.count} membros que não atacaram`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Initialize attacks from schedule members - using useEffect to avoid render issues
  useEffect(() => {
    if (schedule?.members && existingAttacks !== undefined && !isInitialized) {
      const initialAttacks: GotAttackRecord[] = schedule.members.map((member, index) => {
        const existing = existingAttacks?.find(a => a.attack.memberId === member.id);
        const previousData = previousPointsData?.find(p => p.memberId === member.id);
        return {
          memberId: member.id,
          memberName: member.name,
          ranking: existing?.attack.ranking || index + 1,
          previousPoints: previousData?.points || 0,
          power: "",
          attackVictories: existing?.attack.attackVictories || 0,
          attackDefeats: existing?.attack.attackDefeats || 0,
          defenseVictories: existing?.attack.defenseVictories || 0,
          defenseDefeats: existing?.attack.defenseDefeats || 0,
          points: existing?.attack.points || 0,
          didNotAttack: existing?.attack.didNotAttack || false,
        };
      });
      setAttacks(initialAttacks);
      setIsInitialized(true);
    }
  }, [schedule, existingAttacks, isInitialized, previousPointsData]);

  // Reset initialization when date changes
  useEffect(() => {
    setIsInitialized(false);
    setAttacks([]);
  }, [selectedDate]);

  // Update attack record
  const updateAttack = (memberId: number, field: keyof GotAttackRecord, value: unknown) => {
    setAttacks(prev => prev.map(a => 
      a.memberId === memberId ? { ...a, [field]: value } : a
    ));
  };

  // Save attacks
  const handleSave = () => {
    if (!schedule) {
      toast.error("Nenhuma escalação encontrada para esta data");
      return;
    }

    saveAttacksMutation.mutate({
      scheduleId: schedule.id,
      eventDate: selectedDate,
      attacks: attacks.map(a => ({
        memberId: a.memberId,
        ranking: a.ranking,
        power: a.power || undefined,
        attackVictories: a.attackVictories,
        attackDefeats: a.attackDefeats,
        defenseVictories: a.defenseVictories,
        defenseDefeats: a.defenseDefeats,
        points: a.points,
        didNotAttack: a.didNotAttack,
      })),
    });
  };

  // Send alert for non-attackers
  const handleSendAlert = () => {
    if (!schedule) return;
    sendAlertMutation.mutate({
      scheduleId: schedule.id,
      eventDate: selectedDate,
    });
  };

  // Manual load button
  const handleLoadMembers = () => {
    if (!schedule?.members) {
      toast.error("Nenhuma escalação encontrada");
      return;
    }
    
    const initialAttacks: GotAttackRecord[] = schedule.members.map((member, index) => {
      const existing = existingAttacks?.find(a => a.attack.memberId === member.id);
      const previousData = previousPointsData?.find(p => p.memberId === member.id);
      return {
        memberId: member.id,
        memberName: member.name,
        ranking: existing?.attack.ranking || index + 1,
        previousPoints: previousData?.points || 0,
        power: "",
        attackVictories: existing?.attack.attackVictories || 0,
        attackDefeats: existing?.attack.attackDefeats || 0,
        defenseVictories: existing?.attack.defenseVictories || 0,
        defenseDefeats: existing?.attack.defenseDefeats || 0,
        points: existing?.attack.points || 0,
        didNotAttack: existing?.attack.didNotAttack || false,
      };
    });
    setAttacks(initialAttacks);
    setIsInitialized(true);
  };

  const handleLoadPreviousData = () => {
    if (!schedule?.members) {
      toast.error("Nenhuma escalacao encontrada");
      return;
    }
    
    const initialAttacks: GotAttackRecord[] = schedule.members.map((member) => {
      const previousData = previousPointsData?.find(p => p.memberId === member.id);
      return {
        memberId: member.id,
        memberName: member.name,
        ranking: previousData?.attackVictories || 0,
        previousPoints: previousData?.points || 0,
        power: "",
        attackVictories: previousData?.attackVictories || 0,
        attackDefeats: previousData?.attackDefeats || 0,
        defenseVictories: previousData?.defenseVictories || 0,
        defenseDefeats: previousData?.defenseDefeats || 0,
        points: previousData?.points || 0,
        didNotAttack: false,
      };
    });
    setAttacks(initialAttacks);
    setIsInitialized(true);
    toast.success("Dados da ultima batalha carregados!");
  };

  const nonAttackers = attacks.filter(a => a.didNotAttack || a.attackVictories === 0);
  const totalPoints = attacks.reduce((sum, a) => sum + a.points, 0);
  const totalVictories = attacks.reduce((sum, a) => sum + a.attackVictories + a.defenseVictories, 0);
  const isLoading = loadingEvents || loadingSchedule;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Registro de Ataques - GoT ⚔️🛡️</h1>
          <p className="text-muted-foreground">
            Registre o desempenho dos membros na Guerra dos Titãs
          </p>

        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold capitalize">{format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d \'de\' MMMM', { locale: ptBR })}</p>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2 w-auto mx-auto"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando...</p>
            </CardContent>
          </Card>
        ) : !schedule ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma escalação encontrada para {format(new Date(selectedDate + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Primeiro crie uma escalação para esta data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Escalados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{schedule.members?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {totalPoints}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Vitórias Totais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{totalVictories}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Não Atacaram</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${nonAttackers.length > 0 ? "text-red-500" : "text-green-500"}`}>
                    {nonAttackers.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleLoadMembers} variant="outline">
                Carregar Escalados
              </Button>
              
              <Button onClick={handleLoadPreviousData} variant="outline">
                Carregar Dados da Última Batalha
              </Button>
              
              <Button onClick={handleSave} disabled={attacks.length === 0 || saveAttacksMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              
              {nonAttackers.length > 0 && (
                <Button 
                  onClick={handleSendAlert} 
                  variant="destructive"
                  disabled={sendAlertMutation.isPending}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alertar Não-Atacantes ({nonAttackers.length})
                </Button>
              )}
            </div>

            {/* Info about cumulative data */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Dados Cumulativos:</strong> O GoT é um evento longo. Preencha manualmente 
                  os dados de vitórias, derrotas e pontos. Os valores representam 
                  o acumulado do evento inteiro.
                </p>
              </CardContent>
            </Card>

            {/* Attacks Table */}
            {attacks.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Desempenho</CardTitle>
                  <CardDescription>
                    Vitórias e derrotas em ataque e defesa + pontos totais (cumulativo)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Buscar jogador..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="max-w-sm"
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">#</th>
                          <th className="text-left py-2 px-2">Jogador</th>
                          <th className="text-center py-2 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <Swords className="h-4 w-4" /> Ataque
                            </div>
                          </th>
                          <th className="text-center py-2 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <Shield className="h-4 w-4" /> Defesa
                            </div>
                          </th>
                          <th className="text-center py-2 px-2">Pts Anterior</th>
                          <th className="text-center py-2 px-2">Pontos</th>
                          <th className="text-center py-2 px-2">Diferença</th>
                          <th className="text-center py-2 px-2">Não Atacou</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attacks
                          .filter(a => a.memberName.toLowerCase().includes(searchMember.toLowerCase()))
                          .sort((a, b) => b.points - a.points)
                          .map((attack, index) => (
                          <tr key={attack.memberId} className={`border-b ${attack.didNotAttack ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                            <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
                            <td className="py-2 px-2 font-medium">{attack.memberName}</td>
                            <td className="py-2 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={attack.attackVictories}
                                  onChange={(e) => updateAttack(attack.memberId, "attackVictories", parseInt(e.target.value) || 0)}
                                  className="w-14 text-center text-green-600"

                                />
                                <span className="text-muted-foreground">/</span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={attack.attackDefeats}
                                  onChange={(e) => updateAttack(attack.memberId, "attackDefeats", parseInt(e.target.value) || 0)}
                                  className="w-14 text-center text-red-600"

                                />
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={attack.defenseVictories}
                                  onChange={(e) => updateAttack(attack.memberId, "defenseVictories", parseInt(e.target.value) || 0)}
                                  className="w-14 text-center text-green-600"
                                />
                                <span className="text-muted-foreground">/</span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={attack.defenseDefeats}
                                  onChange={(e) => updateAttack(attack.memberId, "defenseDefeats", parseInt(e.target.value) || 0)}
                                  className="w-14 text-center text-red-600"
                                />
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center text-muted-foreground">
                              {attack.previousPoints || 0}
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                min={0}
                                value={attack.points}
                                onChange={(e) => updateAttack(attack.memberId, "points", parseInt(e.target.value) || 0)}
                                className="w-20 text-center font-bold"
                                disabled={attack.didNotAttack}
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`font-bold ${(attack.points - (attack.previousPoints || 0)) > 0 ? 'text-green-600' : (attack.points - (attack.previousPoints || 0)) < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {attack.points - (attack.previousPoints || 0) > 0 ? '+' : ''}{attack.points - (attack.previousPoints || 0)}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <Checkbox
                                checked={attack.didNotAttack}
                                onCheckedChange={(checked) => {
                                  updateAttack(attack.memberId, "didNotAttack", checked);
                                  if (checked) {
                                    // Apenas zera ataque, mantém defesa ativa pois pode ter sofrido ataques
                                    updateAttack(attack.memberId, "attackVictories", 0);
                                    updateAttack(attack.memberId, "attackDefeats", 0);
                                    // NÃO zera defesa - membro pode ter sofrido ataques mesmo sem atacar
                                    // updateAttack(attack.memberId, "defenseVictories", 0);
                                    // updateAttack(attack.memberId, "defenseDefeats", 0);
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Clique em "Carregar Escalados" para começar a registrar os ataques
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
