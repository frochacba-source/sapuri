import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, AlertTriangle, Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AttackRecord {
  memberId: number;
  memberName: string;
  previousValidStars: number;
  currentValidStars: number;
  attack1Stars: number;
  attack1Missed: boolean;
  attack2Stars: number;
  attack2Missed: boolean;
  didNotAttack: boolean;
}

// Visual stars component with missed state (gray for missed, yellow for hit)
function VisualStars({ 
  value, 
  missed,
  onChange, 
  onMissedChange,
  disabled 
}: { 
  value: number; 
  missed: boolean;
  onChange: (v: number) => void; 
  onMissedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === star ? star - 1 : star)}
            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= value
                  ? missed 
                    ? "text-gray-400 fill-gray-400" // Errou - cinza
                    : "text-yellow-500 fill-yellow-500" // Acertou - amarelo
                  : "text-gray-300" // Vazio - contorno
              }`}
            />
          </button>
        ))}
      </div>
      {value > 0 && !disabled && (
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <Checkbox
            checked={missed}
            onCheckedChange={(checked) => onMissedChange(!!checked)}
            className="h-3 w-3"
          />
          <span className={missed ? "text-gray-500" : "text-muted-foreground"}>Errou</span>
        </label>
      )}
    </div>
  );
}

export default function GvgAttacks() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attacks, setAttacks] = useState<AttackRecord[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [opponentGuild, setOpponentGuild] = useState("");
  const [ourScore, setOurScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [validStars, setValidStars] = useState(0);
  const [searchMember, setSearchMember] = useState("");

  // Get GvG event type
  const { data: eventTypes, isLoading: loadingEvents } = trpc.eventTypes.list.useQuery();
  const gvgEvent = eventTypes?.find(e => e.name === "gvg");

  // Get schedule for selected date
  const { data: schedule, isLoading: loadingSchedule } = trpc.schedules.getByEventAndDate.useQuery(
    { eventTypeId: gvgEvent?.id || 0, eventDate: selectedDate },
    { enabled: !!gvgEvent }
  );

  // Get existing attacks
  const { data: existingAttacks, refetch: refetchAttacks } = trpc.gvgAttacks.getByDate.useQuery(
    { eventDate: selectedDate },
    { enabled: !!selectedDate }
  );

  // Get match info
  const { data: matchInfo, refetch: refetchMatchInfo } = trpc.gvgAttacks.getMatchInfo.useQuery(
    { eventDate: selectedDate },
    { enabled: !!selectedDate }
  );

  // Load match info when available
  useEffect(() => {
    if (matchInfo) {
      setOpponentGuild(matchInfo.opponentGuild || "");
      setOurScore(matchInfo.ourScore || 0);
      setOpponentScore(matchInfo.opponentScore || 0);
      setValidStars((matchInfo as { validStars?: number }).validStars || 0);
    }
  }, [matchInfo]);

  // Mutations
  const saveAttacksMutation = trpc.gvgAttacks.save.useMutation({
    onSuccess: () => {
      toast.success("Ataques salvos com sucesso!");
      refetchAttacks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const saveMatchInfoMutation = trpc.gvgAttacks.saveMatchInfo.useMutation({
    onSuccess: () => {
      toast.success("Informações do confronto salvas!");
      refetchMatchInfo();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendAlertMutation = trpc.gvgAttacks.sendNonAttackerAlert.useMutation({
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

  // Initialize attacks from schedule members
  useEffect(() => {
    if (schedule?.members && existingAttacks !== undefined && !isInitialized) {
      const initialAttacks: AttackRecord[] = schedule.members.map(member => {
        const existing = existingAttacks?.find(a => a.attack.memberId === member.id);
        return {
          memberId: member.id,
          memberName: member.name,
          previousValidStars: existing?.attack.previousValidStars || 0,
          currentValidStars: existing?.attack.currentValidStars || 0,
          attack1Stars: existing?.attack.attack1Stars || 0,
          attack1Missed: existing?.attack.attack1Missed || false,
          attack2Stars: existing?.attack.attack2Stars || 0,
          attack2Missed: existing?.attack.attack2Missed || false,
          didNotAttack: existing?.attack.didNotAttack || false,
        };
      });
      setAttacks(initialAttacks);
      setIsInitialized(true);
    }
  }, [schedule, existingAttacks, isInitialized]);

  // Reset initialization when date changes
  useEffect(() => {
    setIsInitialized(false);
    setAttacks([]);
  }, [selectedDate]);

  // Update attack record
  const updateAttack = (memberId: number, field: keyof AttackRecord, value: unknown) => {
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
        attack1Stars: a.attack1Stars,
        attack1Missed: a.attack1Missed,
        attack2Stars: a.attack2Stars,
        attack2Missed: a.attack2Missed,
        didNotAttack: a.didNotAttack,
      })),
    });
  };

  // Save match info
  const handleSaveMatchInfo = () => {
    // Validate score limit
    if (ourScore > 60 || opponentScore > 60) {
      toast.error("O placar máximo é 60 estrelas!");
      return;
    }

    saveMatchInfoMutation.mutate({
      eventDate: selectedDate,
      opponentGuild,
      ourScore,
      opponentScore,
      validStars,
    } as { eventDate: string; opponentGuild?: string; ourScore: number; opponentScore: number; validStars?: number });
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
    
    const initialAttacks: AttackRecord[] = schedule.members.map(member => {
      const existing = existingAttacks?.find(a => a.attack.memberId === member.id);
      return {
        memberId: member.id,
        memberName: member.name,
        previousValidStars: existing?.attack.previousValidStars || 0,
        currentValidStars: existing?.attack.currentValidStars || 0,
        attack1Stars: existing?.attack.attack1Stars || 0,
        attack1Missed: existing?.attack.attack1Missed || false,
        attack2Stars: existing?.attack.attack2Stars || 0,
        attack2Missed: existing?.attack.attack2Missed || false,
        didNotAttack: existing?.attack.didNotAttack || false,
      };
    });
    setAttacks(initialAttacks);
    setIsInitialized(true);
  };

  const nonAttackers = attacks.filter(a => a.didNotAttack || (a.attack1Stars === 0 && a.attack2Stars === 0));
  // Calcular apenas as estrelas acertadas (não contar erros)
  const totalStars = attacks.reduce((sum, a) => {
    const attack1Hits = a.attack1Missed ? 0 : a.attack1Stars;
    const attack2Hits = a.attack2Missed ? 0 : a.attack2Stars;
    return sum + attack1Hits + attack2Hits;
  }, 0);
  const isLoading = loadingEvents || loadingSchedule;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">Registro de Ataques - GvG ⚔️🛡️</h1>
          <p className="text-muted-foreground">
            Registre o desempenho dos membros na Guerra de Guilda
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
            {/* Match Info Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Informações do Confronto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-48">
                    <label className="text-sm font-medium mb-1 block">Guilda Adversária</label>
                    <Input
                      placeholder="Nome da guilda adversária"
                      value={opponentGuild}
                      onChange={(e) => setOpponentGuild(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-center">Sapuri</label>
                      <Input
                        type="number"
                        min={0}
                        max={60}
                        value={ourScore}
                        onChange={(e) => setOurScore(Math.min(60, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-20 text-center font-bold text-lg"
                      />
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground mt-6">x</span>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-center">Adversário</label>
                      <Input
                        type="number"
                        min={0}
                        max={60}
                        value={opponentScore}
                        onChange={(e) => setOpponentScore(Math.min(60, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-20 text-center font-bold text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-center">Estrelas Válidas</label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={validStars}
                      onChange={(e) => setValidStars(Math.min(60, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-20 text-center font-bold text-lg bg-green-50 dark:bg-green-950/30 border-green-300"
                    />
                  </div>
                  <Button onClick={handleSaveMatchInfo} disabled={saveMatchInfoMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Placar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">* Placar máximo: 60 estrelas | Estrelas Válidas: valor do jogo</p>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <CardTitle className="text-sm font-medium">Total de Estrelas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    {totalStars} <span className="text-sm text-muted-foreground font-normal">/ 60 máx</span>
                  </div>
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

            {/* Attacks Table */}
            {attacks.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Ataques</CardTitle>
                  <CardDescription>
                    Clique nas estrelas para marcar o desempenho. Marque "Errou" para estrelas cinzas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input
                      placeholder="Pesquisar jogador..."
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Jogador</th>
                          <th className="text-center py-2 px-2">Estrelas Anteriores</th>
                          <th className="text-center py-2 px-2">Estrelas Válidas</th>
                          <th className="text-center py-2 px-2">1º Ataque</th>
                          <th className="text-center py-2 px-2">2º Ataque</th>
                          <th className="text-center py-2 px-2">Total</th>
                          <th className="text-center py-2 px-2">Não Atacou</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attacks
                          .filter(attack => attack.memberName.toLowerCase().includes(searchMember.toLowerCase()))
                          .map(attack => (
                          <tr key={attack.memberId} className={`border-b ${attack.didNotAttack ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                            <td className="py-2 px-2 font-medium">{attack.memberName}</td>
                            <td className="py-2 px-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="6"
                                value={attack.previousValidStars}
                                onChange={(e) => updateAttack(attack.memberId, "previousValidStars", parseInt(e.target.value) || 0)}
                                className="w-12 h-8 text-center text-sm"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="6"
                                value={attack.currentValidStars}
                                onChange={(e) => updateAttack(attack.memberId, "currentValidStars", parseInt(e.target.value) || 0)}
                                className="w-12 h-8 text-center text-sm"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <VisualStars
                                value={attack.attack1Stars}
                                missed={attack.attack1Missed}
                                onChange={(v) => updateAttack(attack.memberId, "attack1Stars", v)}
                                onMissedChange={(v) => updateAttack(attack.memberId, "attack1Missed", v)}
                                disabled={attack.didNotAttack}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <VisualStars
                                value={attack.attack2Stars}
                                missed={attack.attack2Missed}
                                onChange={(v) => updateAttack(attack.memberId, "attack2Stars", v)}
                                onMissedChange={(v) => updateAttack(attack.memberId, "attack2Missed", v)}
                                disabled={attack.didNotAttack}
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                {[1, 2, 3, 4, 5, 6].map((star) => {
                                  const totalStars = attack.attack1Stars + attack.attack2Stars;
                                  const isFilled = star <= totalStars;
                                  // Determine if this star should be gray (from missed attacks)
                                  const attack1MissedStars = attack.attack1Missed ? attack.attack1Stars : 0;
                                  const attack2MissedStars = attack.attack2Missed ? attack.attack2Stars : 0;
                                  const totalMissed = attack1MissedStars + attack2MissedStars;
                                  const isGray = isFilled && star <= totalMissed;
                                  
                                  return (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        isFilled
                                          ? isGray
                                            ? "text-gray-400 fill-gray-400"
                                            : "text-yellow-500 fill-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <Checkbox
                                checked={attack.didNotAttack}
                                onCheckedChange={(checked) => {
                                  updateAttack(attack.memberId, "didNotAttack", checked);
                                  if (checked) {
                                    updateAttack(attack.memberId, "attack1Stars", 0);
                                    updateAttack(attack.memberId, "attack2Stars", 0);
                                    updateAttack(attack.memberId, "attack1Missed", false);
                                    updateAttack(attack.memberId, "attack2Missed", false);
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
                    Clique em "Carregar Escalados" para começar o registro
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
