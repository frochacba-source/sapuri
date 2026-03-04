import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, Trophy, Swords, Crown, TrendingUp } from "lucide-react";

export default function Stats() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: eventTypes } = trpc.eventTypes.list.useQuery();
  const { data: stats, isLoading } = trpc.stats.memberParticipation.useQuery({
    eventTypeId: eventFilter !== "all" ? parseInt(eventFilter) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Aggregate stats by member
  const memberStats = stats?.reduce((acc, stat) => {
    const existing = acc.find(m => m.memberId === stat.memberId);
    if (existing) {
      existing.total += Number(stat.count);
      existing.events.push({ eventName: stat.eventName, count: Number(stat.count) });
    } else {
      acc.push({
        memberId: stat.memberId,
        memberName: stat.memberName,
        total: Number(stat.count),
        events: [{ eventName: stat.eventName, count: Number(stat.count) }],
      });
    }
    return acc;
  }, [] as { memberId: number; memberName: string; total: number; events: { eventName: string; count: number }[] }[]);

  // Sort by total participation
  const sortedStats = memberStats?.sort((a, b) => b.total - a.total);
  const maxParticipation = sortedStats?.[0]?.total || 1;

  const getEventIcon = (eventName: string) => {
    switch (eventName.toLowerCase()) {
      case 'gvg': return <Swords className="w-3 h-3" />;
      case 'got': return <Trophy className="w-3 h-3" />;
      case 'relíquias': return <Crown className="w-3 h-3" />;
      default: return null;
    }
  };

  const getEventColor = (eventName: string) => {
    switch (eventName.toLowerCase()) {
      case 'gvg': return 'bg-red-500';
      case 'got': return 'bg-blue-500';
      case 'relíquias': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Estatísticas</h1>
          <p className="text-muted-foreground">
            Acompanhe a participação dos membros nos eventos
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Evento</label>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {eventTypes?.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membros Ativos</p>
                  <p className="text-2xl font-bold">{sortedStats?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Participações</p>
                  <p className="text-2xl font-bold">
                    {sortedStats?.reduce((sum, s) => sum + s.total, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mais Ativo</p>
                  <p className="text-2xl font-bold truncate">
                    {sortedStats?.[0]?.memberName || "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Ranking de Participação
            </CardTitle>
            <CardDescription>
              Ordenado por número total de participações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : sortedStats && sortedStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Membro</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-32">Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStats.map((member, index) => (
                    <TableRow key={member.memberId}>
                      <TableCell>
                        {index < 3 ? (
                          <Badge
                            variant="outline"
                            className={
                              index === 0
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : index === 1
                                ? "bg-gray-400/10 text-gray-400 border-gray-400/20"
                                : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                            }
                          >
                            {index + 1}º
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{member.memberName}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {member.events.map((event, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              {getEventIcon(event.eventName)}
                              {event.count}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{member.total}</TableCell>
                      <TableCell>
                        <Progress
                          value={(member.total / maxParticipation) * 100}
                          className="h-2"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma estatística disponível</p>
                <p className="text-sm mt-2">
                  As estatísticas aparecerão após as primeiras escalações.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
