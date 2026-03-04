import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Calendar, Swords, Trophy, Crown, Clock, Zap, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [resurrecting, setResurrecting] = useState(false);
  
  const { data: members } = trpc.members.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: eventTypes } = trpc.eventTypes.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: botStatus, refetch: refetchBotStatus } = trpc.botStatus.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 30000 });
  const resurrectBotMutation = trpc.resurrectTelegramBot.useMutation();
  const seedEventTypes = trpc.eventTypes.seed.useMutation();

  // Seed event types on first load
  useEffect(() => {
    if (isAuthenticated && eventTypes && eventTypes.length === 0) {
      seedEventTypes.mutate();
    }
  }, [isAuthenticated, eventTypes]);

  const handleResurrectBot = async () => {
    setResurrecting(true);
    try {
      await resurrectBotMutation.mutateAsync();
      await refetchBotStatus();
    } catch (error) {
      console.error("Erro ao ressuscitar Bot:", error);
    } finally {
      setResurrecting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name || 'Líder'}! Gerencie as escalações da Guilda Sapuri.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Membros"
            value={members?.length || 0}
            subtitle="de 75 cadastrados"
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title="GvG"
            value="20"
            subtitle="escalados • 13:00"
            icon={<Swords className="w-5 h-5" />}
          />
          <StatsCard
            title="GoT"
            value="25"
            subtitle="escalados • 13:00"
            icon={<Trophy className="w-5 h-5" />}
          />
          <StatsCard
            title="Relíquias"
            value="40"
            subtitle="escalados • 15:00"
            icon={<Crown className="w-5 h-5" />}
          />
        </div>

        {/* Bot Status Card */}
        {botStatus && (
          <Card className={botStatus.isAlive ? "border-green-500 bg-gradient-to-r from-green-950 to-green-900" : "border-red-500 bg-gradient-to-r from-red-950 to-red-900"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {botStatus.isAlive ? (
                  <Zap className="w-6 h-6 text-green-400 animate-pulse" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 animate-bounce" />
                )}
                <span className={botStatus.isAlive ? "text-green-400" : "text-red-400"}>
                  Status do Bot Telegram
                </span>
              </CardTitle>
              <CardDescription className={botStatus.isAlive ? "text-green-300" : "text-red-300"}>
                {botStatus.isAlive ? "✅ Bot operacional" : "⚠️ Bot offline - Clique para ressuscitar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className={`font-bold capitalize ${botStatus.isAlive ? "text-green-400" : "text-red-400"}`}>{botStatus.status}</p>
                </div>
                <div>
                  <p className="text-gray-400">Mensagens</p>
                  <p className="font-bold text-blue-400">{botStatus.messageCount}</p>
                </div>
                <div>
                  <p className="text-gray-400">Uptime</p>
                  <p className="font-bold text-purple-400">{Math.round(botStatus.uptime / 1000)}s</p>
                </div>
                <div>
                  <p className="text-gray-400">Última verificação</p>
                  <p className="font-bold text-yellow-400 text-xs">{new Date(botStatus.lastHeartbeat).toLocaleTimeString("pt-BR")}</p>
                </div>
              </div>
              {!botStatus.isAlive && (
                <Button 
                  onClick={handleResurrectBot} 
                  disabled={resurrecting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
                  variant="default"
                >
                  {resurrecting ? "⏳ Ressuscitando..." : "🔄 RESSUSCITAR BOT"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {eventTypes?.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {event.name === 'gvg' && <Swords className="w-5 h-5 text-red-500" />}
                  {event.name === 'got' && <Trophy className="w-5 h-5 text-blue-500" />}
                  {event.name === 'reliquias' && <Crown className="w-5 h-5 text-yellow-500" />}
                  {event.displayName}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.eventTime} • {event.maxPlayers} jogadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation(`/escalacao/${event.name}`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Escalar Hoje
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas escalações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {members && members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum membro cadastrado ainda.</p>
                <Button 
                  variant="link" 
                  onClick={() => setLocation('/membros')}
                  className="mt-2"
                >
                  Cadastrar membros →
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma escalação realizada ainda.</p>
                <p className="text-sm mt-2">Selecione um evento acima para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ title, value, subtitle, icon }: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
