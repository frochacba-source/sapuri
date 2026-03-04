import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, TrendingUp, Star, Calendar, Users } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Color palette for chart lines
const COLORS = [
  "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7", "#eab308", "#22c55e", "#0ea5e9",
];

export default function GvgEvolution() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Get evolution data
  const { data: evolutionData, isLoading } = trpc.gvgAttacks.getEvolutionData.useQuery({
    startDate,
    endDate,
  });

  // Get all members for selection
  const { data: members } = trpc.members.list.useQuery();

  // Process data for chart
  const chartData = useMemo(() => {
    if (!evolutionData || evolutionData.length === 0) return [];

    // Group by date
    const dateMap = new Map<string, Record<string, number>>();
    
    evolutionData.forEach(record => {
      if (!dateMap.has(record.eventDate)) {
        dateMap.set(record.eventDate, {});
      }
      const dateEntry = dateMap.get(record.eventDate)!;
      dateEntry[record.memberName] = record.totalStars;
    });

    // Convert to array sorted by date
    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, members]) => ({
        date,
        dateFormatted: format(new Date(date + "T12:00:00"), "dd/MM", { locale: ptBR }),
        ...members,
      }));
  }, [evolutionData]);

  // Get unique members from data
  const membersInData = useMemo(() => {
    if (!evolutionData) return [];
    const uniqueMembers = new Map<number, string>();
    evolutionData.forEach(record => {
      uniqueMembers.set(record.memberId, record.memberName);
    });
    return Array.from(uniqueMembers.entries()).map(([id, name]) => ({ id, name }));
  }, [evolutionData]);

  // Filter members to show in chart
  const displayMembers = useMemo(() => {
    if (selectedMembers.length === 0) {
      // Show top 5 by total stars if none selected
      const memberTotals = new Map<number, { name: string; total: number }>();
      evolutionData?.forEach(record => {
        const current = memberTotals.get(record.memberId) || { name: record.memberName, total: 0 };
        current.total += record.totalStars;
        memberTotals.set(record.memberId, current);
      });
      return Array.from(memberTotals.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([id, data]) => ({ id, name: data.name }));
    }
    return membersInData.filter(m => selectedMembers.includes(m.id));
  }, [selectedMembers, membersInData, evolutionData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!evolutionData || evolutionData.length === 0) return null;

    const memberStats = new Map<number, { name: string; total: number; count: number; best: number }>();
    
    evolutionData.forEach(record => {
      const current = memberStats.get(record.memberId) || { 
        name: record.memberName, 
        total: 0, 
        count: 0,
        best: 0 
      };
      current.total += record.totalStars;
      current.count += 1;
      current.best = Math.max(current.best, record.totalStars);
      memberStats.set(record.memberId, current);
    });

    const sortedByTotal = Array.from(memberStats.entries())
      .sort((a, b) => b[1].total - a[1].total);

    const sortedByAvg = Array.from(memberStats.entries())
      .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count));

    return {
      totalBattles: new Set(evolutionData.map(r => r.eventDate)).size,
      topByTotal: sortedByTotal.slice(0, 5),
      topByAvg: sortedByAvg.slice(0, 5),
    };
  }, [evolutionData]);

  const toggleMember = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAll = () => setSelectedMembers(membersInData.map(m => m.id));
  const clearSelection = () => setSelectedMembers([]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              Evolução - GvG
            </h1>
            <p className="text-muted-foreground">
              Acompanhe a evolução dos membros ao longo da temporada
            </p>
          </div>
        </div>

        {/* Date Filters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setStartDate(format(subDays(new Date(), 7), "yyyy-MM-dd"));
                  setEndDate(format(new Date(), "yyyy-MM-dd"));
                }}>
                  7 dias
                </Button>
                <Button variant="outline" onClick={() => {
                  setStartDate(format(subDays(new Date(), 30), "yyyy-MM-dd"));
                  setEndDate(format(new Date(), "yyyy-MM-dd"));
                }}>
                  30 dias
                </Button>
                <Button variant="outline" onClick={() => {
                  setStartDate(format(subDays(new Date(), 90), "yyyy-MM-dd"));
                  setEndDate(format(new Date(), "yyyy-MM-dd"));
                }}>
                  90 dias
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando dados...</p>
            </CardContent>
          </Card>
        ) : chartData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
              <p className="text-muted-foreground">
                Não há registros de ataques no período selecionado
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Batalhas no Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBattles}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Membros Participantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{membersInData.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Líder em Estrelas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      {stats.topByTotal[0]?.[1].name || "-"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats.topByTotal[0]?.[1].total || 0} estrelas totais
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Member Selection */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Selecionar Membros
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Selecionar Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedMembers.length === 0 
                    ? "Mostrando Top 5 por estrelas totais. Selecione membros específicos para comparar."
                    : `${selectedMembers.length} membro(s) selecionado(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {membersInData.map((member, index) => (
                    <label
                      key={member.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                        selectedMembers.includes(member.id) || (selectedMembers.length === 0 && displayMembers.some(m => m.id === member.id))
                          ? "bg-purple-100 dark:bg-purple-950 border-purple-300"
                          : "bg-muted hover:bg-muted/80"
                      } border`}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                        className="h-3 w-3"
                      />
                      <span 
                        className="text-sm font-medium"
                        style={{ 
                          color: (selectedMembers.includes(member.id) || (selectedMembers.length === 0 && displayMembers.some(m => m.id === member.id)))
                            ? COLORS[displayMembers.findIndex(m => m.id === member.id) % COLORS.length]
                            : undefined
                        }}
                      >
                        {member.name}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Evolução</CardTitle>
                <CardDescription>
                  Estrelas por batalha ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="dateFormatted" 
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        domain={[0, 6]}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        label={{ value: 'Estrelas', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend />
                      {displayMembers.map((member, index) => (
                        <Line
                          key={member.id}
                          type="monotone"
                          dataKey={member.name}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Rankings */}
            {stats && (
              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Top 5 - Total de Estrelas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topByTotal.map(([id, data], index) => (
                        <div key={id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{data.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold">{data.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
