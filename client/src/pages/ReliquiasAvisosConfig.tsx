import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Loader2, 
  Bell, 
  Send, 
  MessageCircle, 
  PlayCircle, 
  StopCircle,
  Clock,
  Crown,
  Smartphone,
  Settings
} from "lucide-react";
import { format } from "date-fns";

// Boss configuration
const BOSSES = [
  { name: "Orfeu", icon: "🎸" },
  { name: "Radamantis", icon: "⚔️" },
  { name: "Pandora", icon: "🎭" },
  { name: "Gêmeos", icon: "♊" },
];

// Intervalos de aviso em minutos
const ALERT_INTERVALS = [
  { value: 60, label: "1 hora antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 15, label: "15 minutos antes" },
  { value: 10, label: "10 minutos antes" },
  { value: 5, label: "5 minutos antes" },
  { value: 1, label: "1 minuto antes" },
];

export default function ReliquiasAvisosConfig() {
  const [selectedBoss, setSelectedBoss] = useState("Orfeu");
  const [eventTime, setEventTime] = useState("15:00");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [sendToTelegram, setSendToTelegram] = useState(true);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([60, 30, 15, 10, 5, 1]);

  // Queries
  const { data: schedulerStatus, refetch: refetchStatus } = trpc.alerts.reliquias.status.useQuery();
  const { data: whatsappGroups, isLoading: loadingGroups } = trpc.alerts.whatsappGroups.list.useQuery();
  const { data: activeSeason } = trpc.reliquias.getActiveSeason.useQuery();

  // Mutations
  const startScheduler = trpc.alerts.reliquias.start.useMutation({
    onSuccess: () => {
      toast.success("Avisos automáticos iniciados!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  const stopScheduler = trpc.alerts.reliquias.stop.useMutation({
    onSuccess: () => {
      toast.success("Avisos automáticos parados!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  const sendManual = trpc.alerts.reliquias.sendManual.useMutation({
    onSuccess: (data) => {
      const platforms = [];
      if (data.telegram) platforms.push("Telegram");
      if (data.whatsapp) platforms.push("WhatsApp");
      if (platforms.length > 0) {
        toast.success(`Aviso enviado para: ${platforms.join(", ")}`);
      } else {
        toast.error("Falha ao enviar aviso");
      }
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  const setWhatsAppGroup = trpc.alerts.reliquias.setWhatsAppGroup.useMutation({
    onSuccess: () => {
      toast.success("Grupo do WhatsApp configurado!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  const setIntervals = trpc.alerts.reliquias.setIntervals.useMutation({
    onSuccess: () => {
      toast.success("Intervalos configurados!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  // Handlers
  const handleStartScheduler = () => {
    if (!eventTime.match(/^\d{2}:\d{2}$/)) {
      toast.error("Formato de horário inválido. Use HH:MM");
      return;
    }
    startScheduler.mutate({
      bossName: selectedBoss,
      eventTime,
      whatsappGroupId: selectedGroupId || undefined,
    });
  };

  const handleSendManual = (minutesBefore: number) => {
    const platform = sendToTelegram && sendToWhatsApp ? "both" : sendToTelegram ? "telegram" : "whatsapp";
    sendManual.mutate({
      bossName: selectedBoss,
      minutesBefore,
      platform,
    });
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setWhatsAppGroup.mutate({ groupId });
  };

  const toggleInterval = (interval: number) => {
    const newIntervals = selectedIntervals.includes(interval)
      ? selectedIntervals.filter(i => i !== interval)
      : [...selectedIntervals, interval].sort((a, b) => b - a);
    setSelectedIntervals(newIntervals);
    setIntervals.mutate({ intervals: newIntervals });
  };

  const currentBossConfig = BOSSES.find(b => b.name === selectedBoss);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-emerald-500" />
              Relíquias - Avisos Automáticos
            </h1>
            <p className="text-muted-foreground">
              Configure avisos para WhatsApp e Telegram
            </p>
          </div>
          <div className="flex items-center gap-2">
            {schedulerStatus?.isRunning && (
              <Badge variant="default" className="bg-green-500">
                <Clock className="h-3 w-3 mr-1" />
                Automático Ativo
              </Badge>
            )}
            {activeSeason && (
              <Badge variant="outline">
                {activeSeason.name}
              </Badge>
            )}
          </div>
        </div>

        {!activeSeason ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma temporada ativa</h3>
              <p className="text-muted-foreground">
                Crie uma temporada na página de Relíquias para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seleção do Boss e Horário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-emerald-500" />
                    Configuração do Evento
                  </CardTitle>
                  <CardDescription>
                    Selecione o boss e o horário do evento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Boss</Label>
                    <div className="flex flex-wrap gap-2">
                      {BOSSES.map(boss => (
                        <Button
                          key={boss.name}
                          variant={selectedBoss === boss.name ? "default" : "outline"}
                          onClick={() => setSelectedBoss(boss.name)}
                          size="sm"
                        >
                          <span className="mr-1">{boss.icon}</span>
                          {boss.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="eventTime" className="mb-2 block">Horário do Evento</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuração do WhatsApp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    Grupo do WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Selecione o grupo para receber os avisos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!whatsappGroups?.connected ? (
                    <div className="text-center py-4">
                      <Smartphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">WhatsApp não conectado</p>
                    </div>
                  ) : loadingGroups ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {whatsappGroups?.groups?.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name} ({group.participantsCount} membros)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Intervalos de Aviso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Intervalos de Aviso
                </CardTitle>
                <CardDescription>
                  Selecione quando os avisos serão enviados antes do evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ALERT_INTERVALS.map(interval => (
                    <Button
                      key={interval.value}
                      variant={selectedIntervals.includes(interval.value) ? "default" : "outline"}
                      onClick={() => toggleInterval(interval.value)}
                      size="sm"
                    >
                      {interval.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Avisos selecionados: {selectedIntervals.map(i => {
                    const interval = ALERT_INTERVALS.find(a => a.value === i);
                    return interval?.label;
                  }).join(", ") || "Nenhum"}
                </p>
              </CardContent>
            </Card>

            {/* Opções de Plataforma */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Plataformas de Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="telegram-rel"
                      checked={sendToTelegram}
                      onCheckedChange={setSendToTelegram}
                    />
                    <Label htmlFor="telegram-rel" className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      Telegram
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="whatsapp-rel"
                      checked={sendToWhatsApp}
                      onCheckedChange={setSendToWhatsApp}
                      disabled={!selectedGroupId}
                    />
                    <Label htmlFor="whatsapp-rel" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controle Automático */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-green-500" />
                  Avisos Automáticos
                </CardTitle>
                <CardDescription>
                  Inicia avisos automáticos nos intervalos selecionados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      Status: {schedulerStatus?.isRunning ? "Ativo" : "Parado"}
                    </p>
                    {schedulerStatus?.isRunning && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Horário do evento: {schedulerStatus.eventTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Jobs ativos: {schedulerStatus.activeJobs}
                        </p>
                      </>
                    )}
                    {schedulerStatus?.lastExecution && (
                      <p className="text-sm text-muted-foreground">
                        Última execução: {format(new Date(schedulerStatus.lastExecution), "HH:mm:ss")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {schedulerStatus?.isRunning ? (
                      <Button
                        variant="destructive"
                        onClick={() => stopScheduler.mutate()}
                        disabled={stopScheduler.isPending}
                      >
                        {stopScheduler.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <StopCircle className="h-4 w-4 mr-2" />
                        )}
                        Parar
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStartScheduler}
                        disabled={startScheduler.isPending || selectedIntervals.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {startScheduler.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <PlayCircle className="h-4 w-4 mr-2" />
                        )}
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avisos Manuais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  Avisos Manuais
                </CardTitle>
                <CardDescription>
                  Envie avisos imediatamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {ALERT_INTERVALS.map(interval => (
                    <Button
                      key={interval.value}
                      variant="outline"
                      onClick={() => handleSendManual(interval.value)}
                      disabled={sendManual.isPending || (!sendToTelegram && !sendToWhatsApp)}
                      size="sm"
                    >
                      {sendManual.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
                      )}
                      {interval.label.replace(" antes", "")}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview da Mensagem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
{`⏰ *RELÍQUIAS - ${currentBossConfig?.icon} ${selectedBoss} em X minutos!*

🎯 *Atacando Boss (N):*
⚔️ Jogador1
⚔️ Jogador2

🛡️ *Atacando Guardas (N):*
🛡️ Jogador3 (Guardas: 1, 2)
🛡️ Jogador4 (Guardas: 3, 4)

💪 Preparem-se!`}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
