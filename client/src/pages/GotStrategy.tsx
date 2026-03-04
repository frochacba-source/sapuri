import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface House {
  id: number;
  x: number;
  y: number;
  team: 'neutral' | 'santuario' | 'submundo';
  timeLeft: number;
  isActive: boolean;
  customTime?: number;
}

const HOUSES: House[] = [
  // Topo (Limite do Mar)
  { id: 12, x: 50, y: 10, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 13, x: 35, y: 15, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 14, x: 65, y: 15, team: 'neutral', timeLeft: 0, isActive: false },

  // Segunda linha
  { id: 15, x: 25, y: 25, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 16, x: 40, y: 25, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 17, x: 50, y: 25, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 18, x: 60, y: 25, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 19, x: 75, y: 25, team: 'neutral', timeLeft: 0, isActive: false },

  // Terceira linha
  { id: 20, x: 15, y: 40, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 21, x: 30, y: 40, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 22, x: 45, y: 40, team: 'neutral', timeLeft: 0, isActive: false },
  { id: 23, x: 55, y: 40, team: 'submundo', timeLeft: 0, isActive: false },
  { id: 24, x: 70, y: 40, team: 'submundo', timeLeft: 0, isActive: false },
  { id: 25, x: 85, y: 40, team: 'submundo', timeLeft: 0, isActive: false },

  // Quarta linha
  { id: 26, x: 10, y: 55, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 27, x: 25, y: 55, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 28, x: 40, y: 55, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 29, x: 55, y: 55, team: 'submundo', timeLeft: 0, isActive: false },
  { id: 30, x: 70, y: 55, team: 'submundo', timeLeft: 0, isActive: false },
  { id: 31, x: 85, y: 55, team: 'submundo', timeLeft: 0, isActive: false },

  // Quinta linha
  { id: 32, x: 5, y: 70, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 33, x: 20, y: 70, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 34, x: 35, y: 70, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 35, x: 50, y: 70, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 36, x: 65, y: 70, team: 'submundo', timeLeft: 0, isActive: false },
  { id: 37, x: 80, y: 70, team: 'submundo', timeLeft: 0, isActive: false },
  { id: 38, x: 95, y: 70, team: 'submundo', timeLeft: 0, isActive: false },

  // Base (Santuário e Submundo)
  { id: 39, x: 15, y: 85, team: 'santuario', timeLeft: 0, isActive: false },
  { id: 40, x: 85, y: 85, team: 'submundo', timeLeft: 0, isActive: false },
];

export default function GotStrategy() {
  const [houses, setHouses] = useState<House[]>(HOUSES);
  const [timerDuration, setTimerDuration] = useState(3600); // 60 minutos em segundos
  const [customTime, setCustomTime] = useState('');
  const [santuarioGuild, setSantuarioGuild] = useState('');
  const [neutroGuild, setNeutroGuild] = useState('');
  const [submundoGuild, setSubmundoGuild] = useState('');

  // Mutation para enviar mensagem
  const sendAttackMutation = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: () => {
      toast.success('Mensagem enviada!');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHouses(prevHouses =>
        prevHouses.map(house => {
          if (house.isActive && house.timeLeft > 0) {
            const newTime = house.timeLeft - 1;
            if (newTime === 0) {
              // Enviar mensagem quando timer termina
              const message = `🎯 Ataque a casa ${house.id}!`;
              sendAttackMutation.mutate({
                message,
                phoneNumber: 'all', // Enviar para todos
              });
              toast.success(`Casa ${house.id} - Hora de atacar!`);
            }
            return { ...house, timeLeft: newTime };
          }
          return house;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTimer = (houseId: number) => {
    setHouses(prevHouses =>
      prevHouses.map(house =>
        house.id === houseId
          ? { ...house, isActive: true, timeLeft: timerDuration }
          : house
      )
    );
  };

  const stopTimer = (houseId: number) => {
    setHouses(prevHouses =>
      prevHouses.map(house =>
        house.id === houseId
          ? { ...house, isActive: false }
          : house
      )
    );
  };

  const pauseTimer = (houseId: number) => {
    setHouses(prevHouses =>
      prevHouses.map(house =>
        house.id === houseId
          ? { ...house, isActive: false }
          : house
      )
    );
  };

  const resumeTimer = (houseId: number) => {
    setHouses(prevHouses =>
      prevHouses.map(house =>
        house.id === houseId && house.timeLeft > 0
          ? { ...house, isActive: true }
          : house
      )
    );
  };

  const setPresetTime = (seconds: number) => {
    setTimerDuration(seconds);
    toast.success(`Tempo padrão: ${seconds / 60} minutos`);
  };

  const handleCustomTime = () => {
    const minutes = parseInt(customTime);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error('Digite um número válido de minutos');
      return;
    }
    setTimerDuration(minutes * 60);
    setCustomTime('');
    toast.success(`Tempo customizado: ${minutes} minutos`);
  };

  const getTeamColor = (team: string) => {
    switch (team) {
      case 'santuario':
        return '#FF8C42';
      case 'submundo':
        return '#C946EF';
      default:
        return '#3B82F6';
    }
  };

  const getHouseStatus = (house: House) => {
    if (house.isActive) {
      const minutes = Math.floor(house.timeLeft / 60);
      const seconds = house.timeLeft % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return house.id.toString();
  };

  const getGuildName = (team: string) => {
    switch (team) {
      case 'santuario':
        return santuarioGuild || 'Santuário';
      case 'submundo':
        return submundoGuild || 'Submundo';
      default:
        return neutroGuild || 'Neutro';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-purple-500" />
            Estratégia GoT
          </h1>
          <p className="text-muted-foreground">
            Mapa interativo com cronômetros para coordenar ataques
          </p>
        </div>

        {/* Configuração de Guildas */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Guildas no Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF8C42' }} />
                  Santuário
                </Label>
                <Input
                  placeholder="Nome da guilda"
                  value={santuarioGuild}
                  onChange={(e) => setSantuarioGuild(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                  Neutro
                </Label>
                <Input
                  placeholder="Nome da guilda"
                  value={neutroGuild}
                  onChange={(e) => setNeutroGuild(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C946EF' }} />
                  Submundo
                </Label>
                <Input
                  placeholder="Nome da guilda"
                  value={submundoGuild}
                  onChange={(e) => setSubmundoGuild(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Tempo do Cronômetro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={timerDuration === 1800 ? 'default' : 'outline'}
                  onClick={() => setPresetTime(1800)}
                >
                  30 min
                </Button>
                <Button
                  variant={timerDuration === 3600 ? 'default' : 'outline'}
                  onClick={() => setPresetTime(3600)}
                >
                  60 min
                </Button>
                <Button
                  variant={timerDuration === 5400 ? 'default' : 'outline'}
                  onClick={() => setPresetTime(5400)}
                >
                  90 min
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Tempo em minutos"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min="1"
                  className="w-40"
                />
                <Button onClick={handleCustomTime}>Definir</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Tempo atual: {Math.floor(timerDuration / 60)} minutos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mapa */}
        <Card>
          <CardHeader>
            <CardTitle>Mapa do Conflito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg p-8" style={{ aspectRatio: '16/9' }}>
              {/* SVG para as conexões */}
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Conexões entre casas */}
                {houses.map((house, idx) => {
                  const nextHouses = houses.slice(idx + 1).filter(h => {
                    const dist = Math.sqrt(Math.pow(h.x - house.x, 2) + Math.pow(h.y - house.y, 2));
                    return dist < 25;
                  });
                  return nextHouses.map(nextHouse => (
                    <line
                      key={`${house.id}-${nextHouse.id}`}
                      x1={house.x}
                      y1={house.y}
                      x2={nextHouse.x}
                      y2={nextHouse.y}
                      stroke="#999"
                      strokeWidth="0.5"
                    />
                  ));
                })}
              </svg>

              {/* Casas */}
              <div className="absolute inset-0 w-full h-full">
                {houses.map(house => (
                  <div
                    key={house.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${house.x}%`,
                      top: `${house.y}%`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs transition-transform hover:scale-110 shadow-lg"
                      style={{
                        backgroundColor: getTeamColor(house.team),
                        opacity: house.isActive ? 1 : 0.8,
                      }}
                      onClick={() => startTimer(house.id)}
                    >
                      {getHouseStatus(house)}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {getGuildName(house.team)} - Casa {house.id}
                    </div>

                    {/* Menu de ações */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none group-hover:pointer-events-auto flex gap-1">
                      {!house.isActive && house.timeLeft > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resumeTimer(house.id);
                          }}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Retomar
                        </button>
                      )}
                      {house.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pauseTimer(house.id);
                          }}
                          className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                        >
                          Pausar
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          stopTimer(house.id);
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Parar
                      </button>
                    </div>

                    {/* Timer ativo */}
                    {house.isActive && (
                      <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-yellow-400 animate-pulse" />
                    )}
                    {!house.isActive && house.timeLeft > 0 && (
                      <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-orange-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* Legenda de Guildas */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF8C42' }} />
                  <span>{getGuildName('santuario')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }} />
                  <span>{getGuildName('neutral')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#C946EF' }} />
                  <span>{getGuildName('submundo')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Como usar:</strong> Clique em uma casa para iniciar o cronômetro. Quando o tempo terminar, uma mensagem será enviada automaticamente via WhatsApp e Telegram.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
