import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Crown, Shield, Swords, Send, Loader2, Users, Bell } from "lucide-react";

// Boss configuration
const BOSSES = [
  { name: "Orfeu", icon: "🎸" },
  { name: "Radamantis", icon: "⚔️" },
  { name: "Pandora", icon: "🎭" },
  { name: "Gêmeos", icon: "♊" },
];

export default function ReliquiasAvisos() {
  const [selectedBoss, setSelectedBoss] = useState("Orfeu");
  const [selectedAttackNumber, setSelectedAttackNumber] = useState(1);

  // Queries
  const { data: activeSeason, isLoading: loadingSeason } = trpc.reliquias.getActiveSeason.useQuery();
  const { data: assignments, isLoading: loadingAssignments } = trpc.reliquias.getMemberAssignments.useQuery(
    { seasonId: activeSeason?.id || 0, bossName: selectedBoss, attackNumber: selectedAttackNumber },
    { enabled: !!activeSeason }
  );

  // Mutations
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

  // Separate members by role
  const bossMembers = useMemo(() => {
    return assignments?.filter(a => a.assignment.role === "boss").map(a => ({
      name: a.member.name,
      performance: a.assignment.performance,
    })) || [];
  }, [assignments]);

  const guardsMembers = useMemo(() => {
    const guards = assignments?.filter(a => a.assignment.role === "guards").map(a => ({
      name: a.member.name,
      guard1: a.assignment.guard1Number,
      guard2: a.assignment.guard2Number,
      performance: a.assignment.performance,
    })) || [];
    // Sort by minimum guard number
    return guards.sort((a, b) => {
      const minA = Math.min(a.guard1 || 999, a.guard2 || 999);
      const minB = Math.min(b.guard1 || 999, b.guard2 || 999);
      return minA - minB;
    });
  }, [assignments]);

  const handleSendNotification = (minutesBefore: number) => {
    if (!activeSeason) {
      toast.error("Nenhuma temporada ativa");
      return;
    }
    
    sendReminderMutation.mutate({
      seasonId: activeSeason.id,
      bossName: selectedBoss,
      attackNumber: selectedAttackNumber,
      minutesBefore,
    });
  };

  const currentBossConfig = BOSSES.find(b => b.name === selectedBoss);
  const isLoading = loadingSeason || loadingAssignments;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-emerald-500" />
              Relíquias - Avisos
            </h1>
            <p className="text-muted-foreground">
              Visualize e envie notificações com as atribuições dos membros
            </p>
          </div>
        </div>

        {isLoading ? (
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
              <p className="text-muted-foreground">
                Crie uma temporada na página de Ataques para começar
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
              </CardHeader>
            </Card>

            {/* Boss Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selecionar Boss
                </CardTitle>
                <CardDescription>
                  Escolha o boss para visualizar as atribuições
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {BOSSES.map(boss => (
                    <Button
                      key={boss.name}
                      variant={selectedBoss === boss.name ? "default" : "outline"}
                      onClick={() => { setSelectedBoss(boss.name); setSelectedAttackNumber(1); }}
                    >
                      <span className="mr-1">{boss.icon}</span>
                      {boss.name}
                    </Button>
                  ))}
                </div>

                {/* Gêmeos attack selection */}
                {selectedBoss === "Gêmeos" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <Button
                        key={num}
                        variant={selectedAttackNumber === num ? "default" : "outline"}
                        onClick={() => setSelectedAttackNumber(num)}
                        size="sm"
                      >
                        {num}º Ataque
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Members Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Boss Attackers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-red-500" />
                    Atacando Boss ({bossMembers.length})
                  </CardTitle>
                  <CardDescription>
                    Membros que atacam o boss diretamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bossMembers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum membro atribuído
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {bossMembers.map((member, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800"
                        >
                          <div className="flex items-center gap-2">
                            <Swords className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{member.name}</span>
                          </div>
                          {member.performance && (
                            <span className="text-sm text-muted-foreground truncate max-w-32">
                              {member.performance}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guards Attackers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Atacando Guardas ({guardsMembers.length})
                  </CardTitle>
                  <CardDescription>
                    Membros que atacam os guardas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {guardsMembers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum membro atribuído
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {guardsMembers.map((member, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{member.name}</span>
                            {(member.guard1 || member.guard2) && (
                              <Badge variant="secondary" className="text-xs">
                                {[member.guard1, member.guard2].filter((n): n is number => n != null).sort((a, b) => a - b).join(" e ")}
                              </Badge>
                            )}
                          </div>
                          {member.performance && (
                            <span className="text-sm text-muted-foreground truncate max-w-32">
                              {member.performance}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Send Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Enviar Notificação
                </CardTitle>
                <CardDescription>
                  Envie a lista de atribuições para o grupo do Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSendNotification(15)}
                    disabled={sendReminderMutation.isPending || (bossMembers.length === 0 && guardsMembers.length === 0)}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    15 min antes
                  </Button>
                  <Button
                    onClick={() => handleSendNotification(10)}
                    disabled={sendReminderMutation.isPending || (bossMembers.length === 0 && guardsMembers.length === 0)}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    10 min antes
                  </Button>
                  <Button
                    onClick={() => handleSendNotification(5)}
                    disabled={sendReminderMutation.isPending || (bossMembers.length === 0 && guardsMembers.length === 0)}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    5 min antes
                  </Button>
                  <Button
                    onClick={() => handleSendNotification(1)}
                    disabled={sendReminderMutation.isPending || (bossMembers.length === 0 && guardsMembers.length === 0)}
                  >
                    {sendReminderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    1 min antes
                  </Button>
                </div>
                
                {/* Preview */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Prévia da mensagem:</p>
                  <div className="text-sm whitespace-pre-wrap font-mono bg-background p-3 rounded border">
                    {`⏰ RELÍQUIAS - ${currentBossConfig?.icon} ${selectedBoss} em X minutos!

🎯 Atacando Boss (${bossMembers.length}):
${bossMembers.length > 0 ? bossMembers.map(m => `⚔️ ${m.name}`).join("\n") : "Nenhum"}

🛡️ Atacando Guardas (${guardsMembers.length}):
${guardsMembers.length > 0 ? guardsMembers.map(m => {
  const guards = [m.guard1, m.guard2].filter(Boolean).join(", ");
  return `🛡️ ${m.name}${guards ? ` (Guardas: ${guards})` : ""}`;
}).join("\n") : "Nenhum"}

Preparem-se! 💪`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
