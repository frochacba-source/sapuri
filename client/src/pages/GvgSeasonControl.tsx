import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

export default function GvgSeasonControl() {
  const [showNewSeason, setShowNewSeason] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [seasonDescription, setSeasonDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('2');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customIntervalDate, setCustomIntervalDate] = useState('');
  const [customReturnDate, setCustomReturnDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const activeSeason = trpc.gvgSeasons.getActive.useQuery();
  const allSeasons = trpc.gvgSeasons.getAll.useQuery();
  const createSeason = trpc.gvgSeasons.create.useMutation();
  const updateStatus = trpc.gvgSeasons.updateStatus.useMutation();
  const endAndStart = trpc.gvgSeasons.endAndStart.useMutation();

  const calculateSeasonDates = (weeks: number) => {
    const today = new Date();
    // Find next Monday
    const nextMonday = addDays(today, (1 + 7 - today.getDay()) % 7 || 7);
    // Calculate end date (Saturday, 2 weeks later)
    const endDate = addDays(nextMonday, weeks * 7 - 2);
    // Return date is next Monday after end date
    const returnDate = addDays(endDate, 2);
    return { startDate: nextMonday, endDate, returnDate };
  };

  const handleCreateSeason = async () => {
    if (!seasonName.trim()) return;
    
    let startDate, endDate, returnDate;

    if (useCustomDates) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      returnDate = new Date(customReturnDate);
    } else {
      const weeks = parseInt(durationWeeks) || 2;
      const dates = calculateSeasonDates(weeks);
      startDate = dates.startDate;
      endDate = dates.endDate;
      returnDate = dates.returnDate;
    }

    await createSeason.mutateAsync({
      name: seasonName,
      startDate,
      endDate,
      returnDate,
      description: seasonDescription,
    });

    setSeasonName('');
    setSeasonDescription('');
    setShowNewSeason(false);
    activeSeason.refetch();
    allSeasons.refetch();
  };

  const handleEndAndStart = async () => {
    if (!seasonName.trim()) return;

    let startDate, endDate, returnDate;

    if (useCustomDates) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      returnDate = new Date(customReturnDate);
    } else {
      const weeks = parseInt(durationWeeks) || 2;
      const dates = calculateSeasonDates(weeks);
      startDate = dates.startDate;
      endDate = dates.endDate;
      returnDate = dates.returnDate;
    }

    await endAndStart.mutateAsync({
      newSeasonName: seasonName,
      newStartDate: startDate,
      newEndDate: endDate,
      newReturnDate: returnDate,
      description: seasonDescription,
    });

    setSeasonName('');
    setSeasonDescription('');
    setShowNewSeason(false);
    activeSeason.refetch();
    allSeasons.refetch();
  };

  const handlePauseSeason = async () => {
    if (!activeSeason.data?.id) return;
    await updateStatus.mutateAsync({
      seasonId: activeSeason.data.id,
      status: 'paused',
    });
    activeSeason.refetch();
  };

  const handleResumeSeason = async () => {
    if (!activeSeason.data?.id) return;
    await updateStatus.mutateAsync({
      seasonId: activeSeason.data.id,
      status: 'active',
    });
    activeSeason.refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'ended':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Season */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Temporada Ativa
          </CardTitle>
          <CardDescription>Controle a temporada atual do GvG</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSeason.isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : activeSeason.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <p className="text-lg font-semibold">{activeSeason.data.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeSeason.data.status)}`}>
                    {getStatusIcon(activeSeason.data.status)}
                    {activeSeason.data.status.charAt(0).toUpperCase() + activeSeason.data.status.slice(1)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Início</Label>
                  <p className="font-medium">{format(new Date(activeSeason.data.startDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fim</Label>
                  <p className="font-medium">{format(new Date(activeSeason.data.endDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Retorno</Label>
                  <p className="font-medium">{format(new Date(activeSeason.data.returnDate || new Date()), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              </div>

              {activeSeason.data.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{activeSeason.data.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {activeSeason.data.status === 'active' ? (
                  <Button
                    variant="outline"
                    onClick={handlePauseSeason}
                    disabled={updateStatus.isPending}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Temporada
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleResumeSeason}
                    disabled={updateStatus.isPending}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Retomar Temporada
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma temporada ativa</p>
              <Button onClick={() => setShowNewSeason(true)}>
                Começar Nova Temporada
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Season Form */}
      {showNewSeason && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeSeason.data ? 'Encerrar e Começar Nova Temporada' : 'Começar Nova Temporada'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="season-name">Nome da Temporada</Label>
              <Input
                id="season-name"
                placeholder="Ex: Temporada 1, Temporada de Inverno"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-custom"
                  checked={useCustomDates}
                  onChange={(e) => setUseCustomDates(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="use-custom" className="font-normal cursor-pointer">Usar datas customizadas</Label>
              </div>

              {!useCustomDates ? (
                <div>
                  <Label htmlFor="duration">Duração (semanas)</Label>
                  <Select value={durationWeeks} onValueChange={setDurationWeeks}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 semana</SelectItem>
                      <SelectItem value="2">2 semanas</SelectItem>
                      <SelectItem value="3">3 semanas</SelectItem>
                      <SelectItem value="4">4 semanas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-muted rounded-lg">
                  <div>
                    <Label htmlFor="start-date">Data de Início</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interval-date">Data de Intervalo</Label>
                    <Input
                      id="interval-date"
                      type="date"
                      value={customIntervalDate}
                      onChange={(e) => setCustomIntervalDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="return-date">Data de Retomada</Label>
                    <Input
                      id="return-date"
                      type="date"
                      value={customReturnDate}
                      onChange={(e) => setCustomReturnDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">Data de Fim</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Notas sobre a temporada..."
                value={seasonDescription}
                onChange={(e) => setSeasonDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">Datas da Temporada:</p>
              {(() => {
                const { startDate, endDate, returnDate } = calculateSeasonDates(parseInt(durationWeeks) || 2);
                return (
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Início: <span className="font-medium text-foreground">{format(startDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}</span></li>
                    <li>Fim: <span className="font-medium text-foreground">{format(endDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}</span></li>
                    <li>Retorno: <span className="font-medium text-foreground">{format(returnDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}</span></li>
                  </ul>
                );
              })()}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={activeSeason.data ? handleEndAndStart : handleCreateSeason}
                disabled={!seasonName.trim() || createSeason.isPending || endAndStart.isPending}
              >
                {activeSeason.data ? 'Encerrar e Começar' : 'Começar Temporada'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewSeason(false);
                  setSeasonName('');
                  setSeasonDescription('');
                  setUseCustomDates(false);
                  setCustomStartDate('');
                  setCustomIntervalDate('');
                  setCustomReturnDate('');
                  setCustomEndDate('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Seasons */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Temporadas</CardTitle>
          <CardDescription>Todas as temporadas passadas e futuras</CardDescription>
        </CardHeader>
        <CardContent>
          {allSeasons.isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : allSeasons.data && allSeasons.data.length > 0 ? (
            <div className="space-y-2">
              {allSeasons.data.map((season) => (
                <div
                  key={season.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{season.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(season.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(season.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(season.status)}`}>
                    {getStatusIcon(season.status)}
                    {season.status.charAt(0).toUpperCase() + season.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma temporada registrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
