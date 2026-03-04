import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bot, Settings as SettingsIcon, Clock, CheckCircle2, XCircle, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [botToken, setBotToken] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; botName?: string; error?: string } | null>(null);

  const utils = trpc.useUtils();
  const { data: botConfig, isLoading } = trpc.bot.getConfig.useQuery(undefined, { enabled: isAdmin });
  const { data: eventTypes } = trpc.eventTypes.list.useQuery();

  const testConnection = trpc.bot.testConnection.useMutation({
    onSuccess: (result) => {
      setTestResult(result);
      if (result.success) {
        toast.success(`Bot conectado: @${result.botName}`);
      } else {
        toast.error(result.error || "Falha na conexão");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const saveConfig = trpc.bot.saveConfig.useMutation({
    onSuccess: () => {
      utils.bot.getConfig.invalidate();
      toast.success("Configurações salvas!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateEventType = trpc.eventTypes.update.useMutation({
    onSuccess: () => {
      utils.eventTypes.list.invalidate();
      toast.success("Evento atualizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (botConfig) {
      setGroupId(botConfig.telegramGroupId || "");
      setIsActive(botConfig.isActive);
    }
  }, [botConfig]);

  const handleTestConnection = () => {
    if (!botToken.trim()) {
      toast.error("Insira o token do bot");
      return;
    }
    testConnection.mutate({ token: botToken.trim() });
  };

  const handleSaveBot = () => {
    saveConfig.mutate({
      telegramBotToken: botToken.trim() || undefined,
      telegramGroupId: groupId.trim() || undefined,
      isActive,
    });
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar as configurações.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure o bot do Telegram e os eventos
          </p>
        </div>

        <Tabs defaultValue="telegram" className="space-y-6">
          <TabsList>
            <TabsTrigger value="telegram">
              <Bot className="w-4 h-4 mr-2" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="events">
              <Clock className="w-4 h-4 mr-2" />
              Eventos
            </TabsTrigger>
          </TabsList>

          {/* Telegram Tab */}
          <TabsContent value="telegram" className="space-y-6">
            {/* Bot Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Status do Bot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {botConfig?.hasToken ? (
                    <>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Configurado
                      </Badge>
                      <Badge variant={botConfig.isActive ? "default" : "secondary"}>
                        {botConfig.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Não configurado
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bot Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configurar Bot</CardTitle>
                <CardDescription>
                  Configure o token do bot @Sapuribot para enviar notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Como obter o token</AlertTitle>
                  <AlertDescription>
                    1. Abra o Telegram e procure por @BotFather<br />
                    2. Envie /newbot e siga as instruções<br />
                    3. Copie o token fornecido e cole abaixo
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Token do Bot</Label>
                    <div className="flex gap-2">
                      <Input
                        id="token"
                        type="password"
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testConnection.isPending}
                      >
                        {testConnection.isPending ? "Testando..." : "Testar"}
                      </Button>
                    </div>
                    {testResult && (
                      <p className={`text-sm ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                        {testResult.success ? `✓ Conectado: @${testResult.botName}` : `✗ ${testResult.error}`}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupId">ID do Grupo</Label>
                    <Input
                      id="groupId"
                      placeholder="-1001234567890"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Para obter o ID, adicione o bot ao grupo e use /getid ou um bot como @userinfobot
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ativar Notificações</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilita o envio de notificações pelo bot
                      </p>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveBot} disabled={saveConfig.isPending} className="w-full">
                  {saveConfig.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {eventTypes?.map((event) => (
              <EventConfigCard
                key={event.id}
                event={event}
                onUpdate={(data) => updateEventType.mutate({ id: event.id, ...data })}
                isUpdating={updateEventType.isPending}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function EventConfigCard({ 
  event, 
  onUpdate, 
  isUpdating 
}: { 
  event: { id: number; name: string; displayName: string; maxPlayers: number; eventTime: string; reminderMinutes: number; isActive: boolean };
  onUpdate: (data: { displayName?: string; maxPlayers?: number; eventTime?: string; reminderMinutes?: number; isActive?: boolean }) => void;
  isUpdating: boolean;
}) {
  const [displayName, setDisplayName] = useState(event.displayName);
  const [maxPlayers, setMaxPlayers] = useState(event.maxPlayers.toString());
  const [eventTime, setEventTime] = useState(event.eventTime);
  const [reminderMinutes, setReminderMinutes] = useState(event.reminderMinutes.toString());
  const [isActive, setIsActive] = useState(event.isActive);

  const handleSave = () => {
    onUpdate({
      displayName,
      maxPlayers: parseInt(maxPlayers),
      eventTime,
      reminderMinutes: parseInt(reminderMinutes),
      isActive,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{event.displayName}</CardTitle>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
        <CardDescription>
          Configurações do evento {event.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome de Exibição</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Máximo de Jogadores</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Horário do Evento</Label>
            <Input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Lembrete (minutos antes)</Label>
            <Input
              type="number"
              min="5"
              max="120"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isUpdating} className="w-full">
          {isUpdating ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardContent>
    </Card>
  );
}
