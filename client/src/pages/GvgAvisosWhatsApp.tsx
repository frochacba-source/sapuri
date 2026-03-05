import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Settings,
  Clock,
  Users,
  Smartphone
} from "lucide-react";
import { format } from "date-fns";

export default function GvgAvisosWhatsApp() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("⚔️ *GvG - AVISO* ⚔️\n\nLembrete: A GvG está chegando!\n\n💪 Preparem-se para a guerra!");
  const [sendToTelegram, setSendToTelegram] = useState(true);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(true);

  // Queries
  const { data: schedulerStatus, refetch: refetchStatus } = trpc.alerts.gvg.status.useQuery();
  const { data: whatsappGroups, isLoading: loadingGroups } = trpc.alerts.whatsappGroups.list.useQuery();

  // Mutations
  const startScheduler = trpc.alerts.gvg.start.useMutation({
    onSuccess: () => {
      toast.success("Avisos automáticos iniciados!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  const stopScheduler = trpc.alerts.gvg.stop.useMutation({
    onSuccess: () => {
      toast.success("Avisos automáticos parados!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  const sendManual = trpc.alerts.gvg.sendManual.useMutation({
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

  const setWhatsAppGroup = trpc.alerts.gvg.setWhatsAppGroup.useMutation({
    onSuccess: () => {
      toast.success("Grupo do WhatsApp configurado!");
      refetchStatus();
    },
    onError: (error) => toast.error(error.message),
  });

  // Handlers
  const handleStartScheduler = () => {
    startScheduler.mutate({
      whatsappGroupId: selectedGroupId || undefined,
    });
  };

  const handleSendEscalacao = () => {
    const platform = sendToTelegram && sendToWhatsApp ? "both" : sendToTelegram ? "telegram" : "whatsapp";
    sendManual.mutate({
      type: "escalacao",
      platform,
    });
  };

  const handleSendEscolhaAdversarios = () => {
    const platform = sendToTelegram && sendToWhatsApp ? "both" : sendToTelegram ? "telegram" : "whatsapp";
    sendManual.mutate({
      type: "escolha_adversarios",
      platform,
    });
  };

  const handleSendCustom = () => {
    const platform = sendToTelegram && sendToWhatsApp ? "both" : sendToTelegram ? "telegram" : "whatsapp";
    sendManual.mutate({
      type: "custom",
      customMessage,
      platform,
    });
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setWhatsAppGroup.mutate({ groupId });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-500" />
              GvG - Avisos WhatsApp & Telegram
            </h1>
            <p className="text-muted-foreground">
              Configure e envie avisos automáticos para a GvG
            </p>
          </div>
          {schedulerStatus?.isRunning && (
            <Badge variant="default" className="bg-green-500">
              <Clock className="h-3 w-3 mr-1" />
              Automático Ativo
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração do WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-500" />
                Configuração WhatsApp
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
                  <p className="text-sm text-muted-foreground">
                    Configure o WhatsApp na página de configurações
                  </p>
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

              {schedulerStatus?.whatsappGroupId && (
                <p className="text-sm text-muted-foreground">
                  Grupo atual: {whatsappGroups?.groups?.find(g => g.id === schedulerStatus.whatsappGroupId)?.name || schedulerStatus.whatsappGroupId}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Avisos Automáticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Avisos Automáticos
              </CardTitle>
              <CardDescription>
                Envia avisos de hora em hora (13:00 às 22:00) + mensagem especial às 13:30
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">
                    Status: {schedulerStatus?.isRunning ? "Ativo" : "Parado"}
                  </p>
                  {schedulerStatus?.lastExecution && (
                    <p className="text-sm text-muted-foreground">
                      Última execução: {format(new Date(schedulerStatus.lastExecution), "HH:mm:ss")}
                    </p>
                  )}
                </div>
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
                    disabled={startScheduler.isPending}
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

              <div className="text-sm text-muted-foreground">
                <p>📅 Horários de aviso: 13:00, 14:00, 15:00... até 22:00</p>
                <p>⏰ Mensagem especial às 13:30 (escolha de adversários)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opções de Envio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Opções de Envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="telegram"
                  checked={sendToTelegram}
                  onCheckedChange={setSendToTelegram}
                />
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  Telegram
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="whatsapp"
                  checked={sendToWhatsApp}
                  onCheckedChange={setSendToWhatsApp}
                  disabled={!selectedGroupId}
                />
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  WhatsApp
                </Label>
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
              Envie avisos imediatamente para os grupos selecionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleSendEscalacao}
                disabled={sendManual.isPending || (!sendToTelegram && !sendToWhatsApp)}
                className="w-full"
                variant="outline"
              >
                {sendManual.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                Enviar Escalação do Dia
              </Button>

              <Button
                onClick={handleSendEscolhaAdversarios}
                disabled={sendManual.isPending || (!sendToTelegram && !sendToWhatsApp)}
                className="w-full"
                variant="outline"
              >
                {sendManual.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Escolha de Adversários
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Mensagem Personalizada</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                placeholder="Digite uma mensagem personalizada..."
              />
              <Button
                onClick={handleSendCustom}
                disabled={sendManual.isPending || !customMessage.trim() || (!sendToTelegram && !sendToWhatsApp)}
                className="mt-2 w-full sm:w-auto"
              >
                {sendManual.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Mensagem Personalizada
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview da mensagem de escolha de adversários */}
        <Card>
          <CardHeader>
            <CardTitle>Preview: Mensagem das 13:30</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
{`⚔️ *GvG - ESCOLHA DE ADVERSÁRIOS* ⚔️

Pessoal, escolham seus adversários e arrumem as defesas para teste.

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20

⏰ Horário: 13:30`}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
