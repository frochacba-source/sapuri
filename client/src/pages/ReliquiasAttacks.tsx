import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { toast } from "sonner";
import { Crown, Plus, Shield, Swords, Users, Save, Loader2, Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Boss configuration
const BOSSES = [
  { name: "Orfeu", guardsRequired: 5, maxDefeats: 1, icon: "🎸", order: 1 },
  { name: "Radamantis", guardsRequired: 10, maxDefeats: 1, icon: "⚔️", order: 2 },
  { name: "Pandora", guardsRequired: 15, maxDefeats: 1, icon: "🎭", order: 3 },
  { name: "Gêmeos", guardsRequired: 20, maxDefeats: 3, icon: "♊", order: 4 },
];

interface MemberAssignment {
  memberId: number;
  memberName: string;
  role: "guards" | "boss";
  guard1Number?: number | null;
  guard2Number?: number | null;
  performance?: string | null;
  garruda?: "full" | "5 Red" | "4 Red" | "3 Red" | null;
}

export default function ReliquiasAttacks() {
  const [isCreatingSeasonOpen, setIsCreatingSeasonOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [newSeasonDate, setNewSeasonDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedBoss, setSelectedBoss] = useState("Orfeu");
  const [selectedAttackNumber, setSelectedAttackNumber] = useState(1);
  const [assignments, setAssignments] = useState<Map<number, MemberAssignment>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar selectedAttackNumber quando o boss mudar
  useEffect(() => {
    setSelectedAttackNumber(1);
  }, [selectedBoss]);

  // Prevenir erro de removeChild ao mudar de aba
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sem operações de DOM aqui
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedBoss, selectedAttackNumber]);

  // Queries
  const { data: activeSeason, isLoading: loadingSeason, refetch: refetchSeason } = trpc.reliquias.getActiveSeason.useQuery();

  const { data: reliquiasMembers } = trpc.members.list.useQuery();
  const { data: existingAssignments, refetch: refetchAssignments } = trpc.reliquias.getMemberAssignments.useQuery(
    { seasonId: activeSeason?.id || 0, bossName: selectedBoss, attackNumber: selectedAttackNumber },
    { enabled: !!activeSeason }
  );

  // Filter members who participate in Reliquias (all 40 members)
  // Sort by performance (damage) - higher damage first
  const eligibleMembers = useMemo(() => {
    const filtered = reliquiasMembers?.filter(m => m.participatesReliquias && m.isActive) || [];
    
    // Sort by performance value from assignments (higher first)
    return filtered.sort((a, b) => {
      const aAssignment = assignments.get(a.id);
      const bAssignment = assignments.get(b.id);
      
      // Extract numeric value from performance string (e.g., "1.5M" -> 1500000)
      const parsePerformance = (perf: string | null | undefined): number => {
        if (!perf) return 0;
        const match = perf.match(/([\d.,]+)\s*([KMB])?/i);
        if (!match) return 0;
        const num = parseFloat(match[1].replace(',', '.'));
        const multiplier = match[2]?.toUpperCase();
        if (multiplier === 'K') return num * 1000;
        if (multiplier === 'M') return num * 1000000;
        if (multiplier === 'B') return num * 1000000000;
        return num;
      };
      
      const aPerf = parsePerformance(aAssignment?.performance);
      const bPerf = parsePerformance(bAssignment?.performance);
      
      return bPerf - aPerf; // Descending order
    });
  }, [reliquiasMembers, assignments]);

  // Mutations
  const createSeasonMutation = trpc.reliquias.createSeason.useMutation({
    onSuccess: () => {
      toast.success("Temporada criada com sucesso!");
      setIsCreatingSeasonOpen(false);
      setNewSeasonName("");
      refetchSeason();
    },
    onError: (error) => toast.error(error.message),
  });

  const endSeasonMutation = trpc.reliquias.endSeason.useMutation({
    onSuccess: () => {
      toast.success("Temporada encerrada!");
      refetchSeason();
    },
    onError: (error) => toast.error(error.message),
  });



  const setAssignmentMutation = trpc.reliquias.setMemberAssignment.useMutation({
    onError: (error) => toast.error(error.message),
  });

  const sendReminderMutation = trpc.reliquias.sendReminder.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Notificação enviada! Boss: ${data.bossCount}, Guardas: ${data.guardsCount}`);
      } else {
        toast.error("Falha ao enviar notificação. Verifique a configuração do bot.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  // Initialize assignments from existing data
  useEffect(() => {
    if (existingAssignments) {
      const newAssignments = new Map<number, MemberAssignment>();
      existingAssignments.forEach(({ assignment, member }) => {
        newAssignments.set(member.id, {
          memberId: member.id,
          memberName: member.name,
          role: assignment.role as "guards" | "boss",
          guard1Number: assignment.guard1Number,
          guard2Number: assignment.guard2Number,
          performance: assignment.performance,
        });
      });
      setAssignments(newAssignments);
    } else {
      setAssignments(new Map());
    }
  }, [existingAssignments]);

  // Reset assignments when boss/attack changes
  useEffect(() => {
    refetchAssignments();
  }, [selectedBoss, selectedAttackNumber, refetchAssignments]);

  const handleCreateSeason = () => {
    if (!newSeasonName.trim()) {
      toast.error("Nome da temporada é obrigatório");
      return;
    }
    createSeasonMutation.mutate({ name: newSeasonName, startDate: newSeasonDate });
  };

  const updateAssignment = (memberId: number, memberName: string, field: keyof MemberAssignment, value: unknown) => {
    setAssignments(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(memberId) || { memberId, memberName, role: "boss" as const };
      
      // If changing role to boss, clear guard numbers
      if (field === "role" && value === "boss") {
        newMap.set(memberId, { ...existing, [field]: value, guard1Number: null, guard2Number: null });
      } else {
        newMap.set(memberId, { ...existing, [field]: value });
      }
      
      return newMap;
    });
  };

  const handleSaveAssignments = async () => {
    if (!activeSeason) return;
    
    setIsSaving(true);
    try {
      const promises = Array.from(assignments.values()).map(assignment =>
        setAssignmentMutation.mutateAsync({
          seasonId: activeSeason.id,
          memberId: assignment.memberId,
          bossName: selectedBoss,
          attackNumber: selectedAttackNumber,
          role: assignment.role,
          guard1Number: assignment.guard1Number,
          guard2Number: assignment.guard2Number,
          performance: assignment.performance,
        })
      );
      
      await Promise.all(promises);
      toast.success("Atribuições salvas com sucesso!");
      refetchAssignments();
    } catch {
      toast.error("Erro ao salvar atribuições");
    } finally {
      setIsSaving(false);
    }
  };

  const currentBossConfig = BOSSES.find(b => b.name === selectedBoss);
  
  // Count members by role
  const guardsCount = Array.from(assignments.values()).filter(a => a.role === "guards").length;
  const bossCount = Array.from(assignments.values()).filter(a => a.role === "boss").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-emerald-500" />
              Relíquias - Ataques
            </h1>
            <p className="text-muted-foreground">
              Gerencie a progressão de bosses e atribuições dos 40 membros
            </p>
          </div>
          
          {!activeSeason && (
            <Dialog open={isCreatingSeasonOpen} onOpenChange={setIsCreatingSeasonOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Temporada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Temporada</DialogTitle>
                  <DialogDescription>
                    Inicie uma nova temporada de Relíquias
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Temporada</label>
                    <Input
                      value={newSeasonName}
                      onChange={(e) => setNewSeasonName(e.target.value)}
                      placeholder="Ex: Temporada 1 - Janeiro 2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Início</label>
                    <Input
                      type="date"
                      value={newSeasonDate}
                      onChange={(e) => setNewSeasonDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingSeasonOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSeason} disabled={createSeasonMutation.isPending}>
                    {createSeasonMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Temporada
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loadingSeason ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando...</p>
            </CardContent>
          </Card>
        ) : !activeSeason ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma temporada ativa</h3>
              <p className="text-muted-foreground mb-4">
                Crie uma nova temporada para começar a registrar os ataques de Relíquias
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Season Info */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-emerald-500" />
                    {activeSeason.name}
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    Ativa
                  </Badge>
                </div>
                <CardDescription>
                  Iniciada em {activeSeason.startDate ? format(new Date(activeSeason.startDate), "dd/MM/yyyy", { locale: ptBR }) : "Data não disponível"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={() => endSeasonMutation.mutate({ seasonId: activeSeason.id })}
                  disabled={endSeasonMutation.isPending}
                >
                  Encerrar Temporada
                </Button>
              </CardContent>
            </Card>

            {/* Boss Tabs with Member Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Atribuições dos Membros por Boss
                </CardTitle>
                <CardDescription>
                  Defina quem ataca guardas (com número do guarda) e quem ataca o boss diretamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedBoss} onValueChange={(value) => { setSelectedBoss(value); setSelectedAttackNumber(1); }}>
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    {BOSSES.map(boss => (
                      <TabsTrigger key={boss.name} value={boss.name} className="flex items-center gap-1">
                        <span>{boss.icon}</span>
                        {boss.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {BOSSES.map(boss => (
                    <TabsContent key={boss.name} value={boss.name} className="space-y-4">
                      {/* Gêmeos has 4 attack columns */}
                      {boss.name === "Gêmeos" && (
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4].map(num => (
                            <Button
                              key={num}
                              variant={selectedAttackNumber === num ? "default" : "outline"}
                              onClick={() => setSelectedAttackNumber(num)}
                              className="flex-1"
                            >
                              {num}º
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Summary */}
                      <div className="flex gap-4 mb-4">
                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                          <Shield className="h-3 w-3 text-blue-500" />
                          Atacando Guardas: {guardsCount}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                          <Swords className="h-3 w-3 text-red-500" />
                          Atacando Boss: {bossCount}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                          Total: {assignments.size} / {eligibleMembers.length}
                        </Badge>
                      </div>

                      {/* Members Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                          <table className="w-full">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                <th className="text-left py-2 px-3 font-medium w-48">Membro</th>
                                <th className="text-center py-2 px-3 font-medium w-32">Função</th>
                                <th className="text-center py-2 px-3 font-medium w-24">Guarda 1</th>
                                <th className="text-center py-2 px-3 font-medium w-24">Guarda 2</th>
                                <th className="text-center py-2 px-3 font-medium w-28">Garruda</th>
                                <th className="text-left py-2 px-3 font-medium w-32">Desempenho</th>
                              </tr>
                            </thead>
                            <tbody>
                              {eligibleMembers.map(member => {
                                const assignment = assignments.get(member.id);
                                const role = assignment?.role || "boss";
                                const isGuards = role === "guards";
                                
                                return (
                                  <tr key={member.id} className="border-t hover:bg-muted/50">
                                    <td className="py-2 px-3 font-medium">{member.name}</td>
                                    <td className="py-2 px-3">
                                      <Select
                                        value={role}
                                        onValueChange={(value) => updateAssignment(member.id, member.name, "role", value)}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="boss">Boss</SelectItem>
                                          <SelectItem value="guards">Guardas</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="py-2 px-3">
                                      <Input
                                        type="number"
                                        min={1}
                                        max={currentBossConfig?.guardsRequired || 20}
                                        value={assignment?.guard1Number || ""}
                                        onChange={(e) => updateAssignment(member.id, member.name, "guard1Number", e.target.value ? parseInt(e.target.value) : null)}
                                        disabled={!isGuards}
                                        placeholder="Nº"
                                        className="w-full text-center"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <Input
                                        type="number"
                                        min={1}
                                        max={currentBossConfig?.guardsRequired || 20}
                                        value={assignment?.guard2Number || ""}
                                        onChange={(e) => updateAssignment(member.id, member.name, "guard2Number", e.target.value ? parseInt(e.target.value) : null)}
                                        disabled={!isGuards}
                                        placeholder="Nº"
                                        className="w-full text-center"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <Select
                                        value={assignment?.garruda || ""}
                                        onValueChange={(value) => updateAssignment(member.id, member.name, "garruda", value)}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Selecionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="full">Full</SelectItem>
                                          <SelectItem value="5 Red">5 Red</SelectItem>
                                          <SelectItem value="4 Red">4 Red</SelectItem>
                                          <SelectItem value="3 Red">3 Red</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="py-2 px-3">
                                      <Input
                                        value={assignment?.performance || ""}
                                        onChange={(e) => updateAssignment(member.id, member.name, "performance", e.target.value)}
                                        placeholder="Desempenho..."
                                        className="w-full text-xs"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
                        {/* Notification Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {[15, 10, 5, 1].map(minutes => (
                            <Button
                              key={minutes}
                              variant="outline"
                              size="sm"
                              onClick={() => activeSeason && sendReminderMutation.mutate({
                                seasonId: activeSeason.id,
                                bossName: selectedBoss,
                                attackNumber: selectedAttackNumber,
                                minutesBefore: minutes,
                              })}
                              disabled={!activeSeason || sendReminderMutation.isPending}
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              {minutes} min
                            </Button>
                          ))}
                        </div>
                        
                        {/* Save Button */}
                        <Button onClick={handleSaveAssignments} disabled={isSaving} size="lg">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Salvar Atribuições
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
