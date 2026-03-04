import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";
import { Loader2, Bell, Clock, Send, Users, Trophy, AlertTriangle, Settings, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function GotAvisos() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customMessage, setCustomMessage] = useState("⚔️ *LEMBRETE GoT*\n\nFavor quem ainda não atacou, atacar por gentileza!\n\n🕐 O tempo está passando...");
  
  // Horários de lembrete (13:00 às 22:00)
  const reminderHours = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const [enabledHours, setEnabledHours] = useState<number[]>([13, 15, 17, 19, 21]);

  // Buscar escalação do dia
  const { data: schedules, isLoading: loadingSchedules } = trpc.schedules.getByEventAndDate.useQuery({
    eventTypeId: 2, // GoT
    eventDate: selectedDate,
  });

  // Buscar ataques do dia
  const { data: attacks, isLoading: loadingAttacks } = trpc.gotAttacks.getByDate.useQuery({
    eventDate: selectedDate,
  });

  // Buscar membros que não atacaram
  const { data: nonAttackers } = trpc.ranking.gotNonAttackersLatest.useQuery({});

  const sendReminderMutation = trpc.gotAttacks.sendNonAttackerAlert.useMutation({
    onSuccess: () => {
      toast.success("Lembrete enviado para o grupo do Telegram!");
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  // Membros escalados para o dia
  const escalados = schedules?.members || [];
  // Ataques realizados no dia
  const atacaram = attacks?.filter((a: { attack: { didNotAttack: boolean; memberId: number } }) => !a.attack.didNotAttack) || [];
  // Membros que não atacaram
  const naoAtacaram = escalados.filter((e: { id: number; name: string }) => 
    !atacaram.some((a: { attack: { memberId: number } }) => a.attack.memberId === e.id)
  );

  const handleSendReminder = () => {
    if (!schedules?.id) {
      toast.error("Nenhuma escalação encontrada para esta data");
      return;
    }
    sendReminderMutation.mutate({
      scheduleId: schedules.id,
      eventDate: selectedDate,
    });
  };

  const toggleHour = (hour: number) => {
    setEnabledHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-500" />
              Avisos GoT
            </h1>
            <p className="text-muted-foreground">
              Configure lembretes automáticos para quem não atacou
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status do Dia */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Status do Dia
                  </CardTitle>
                  <CardDescription>
                    Resumo da participação em {format(new Date(selectedDate + "T12:00:00"), "dd/MM/yyyy")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Recarregar dados da escalação
                    window.location.reload();
                  }}
                  disabled={loadingSchedules}
                >
                  {loadingSchedules ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Carregar Escalados"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{escalados.length}</p>
                  <p className="text-sm text-muted-foreground">Escalados</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{atacaram.length}</p>
                  <p className="text-sm text-muted-foreground">Atacaram</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold">{naoAtacaram.length}</p>
                  <p className="text-sm text-muted-foreground">Faltam</p>
                </div>
              </div>

              {naoAtacaram.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Ainda não atacaram:</p>
                  <div className="flex flex-wrap gap-2">
                    {naoAtacaram.map((m: { id: number; name: string }) => (
                      <Badge key={m.id} variant="destructive">
                        {m.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuração de Lembretes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Horários de Lembrete
              </CardTitle>
              <CardDescription>
                Selecione os horários para envio automático (13:00 às 22:00)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {reminderHours.map(hour => (
                  <Button
                    key={hour}
                    variant={enabledHours.includes(hour) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHour(hour)}
                    className="w-full"
                  >
                    {hour}:00
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <Settings className="h-4 w-4 inline mr-1" />
                Horários selecionados: {enabledHours.map(h => `${h}:00`).join(", ") || "Nenhum"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mensagem Personalizada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              Mensagem de Lembrete
            </CardTitle>
            <CardDescription>
              Personalize a mensagem que será enviada para o grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite a mensagem de lembrete..."
              rows={5}
            />
            
            {/* Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Prévia da mensagem:</p>
              <pre className="whitespace-pre-wrap text-sm">
                {customMessage}
                {"\n\n"}📋 *Ainda não atacaram ({naoAtacaram.length}):*{"\n"}
                {naoAtacaram.map((m: { name: string }) => m.name).join(", ") || "Todos já atacaram! 🎉"}
              </pre>
            </div>

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button 
                onClick={handleSendReminder}
                disabled={sendReminderMutation.isPending}
                className="flex-1"
              >
                {sendReminderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Avisos Telegram
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setLocation('/got/avisos-whatsapp')}
              >
                <Send className="mr-2 h-4 w-4" />
                Avisos WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
