import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, Swords, Trophy, Crown, Filter } from "lucide-react";

export default function History() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: eventTypes } = trpc.eventTypes.list.useQuery();
  const { data: history, isLoading } = trpc.schedules.history.useQuery({
    eventTypeId: eventFilter !== "all" ? parseInt(eventFilter) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 50,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'gvg': return <Swords className="w-4 h-4 text-red-500" />;
      case 'got': return <Trophy className="w-4 h-4 text-blue-500" />;
      case 'reliquias': return <Crown className="w-4 h-4 text-yellow-500" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case 'gvg': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'got': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'reliquias': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">
            Visualize todas as escalações anteriores
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            {(startDate || endDate || eventFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setEventFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle>Escalações</CardTitle>
            <CardDescription>
              {history?.length || 0} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : history && history.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {history.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id.toString()}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        {getEventIcon(item.eventType.name)}
                        <div>
                          <p className="font-medium">
                            {item.eventType.displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(item.eventDate)}
                          </p>
                        </div>
                        <Badge variant="outline" className={getEventColor(item.eventType.name)}>
                          {item.members.length} jogadores
                        </Badge>
                        {item.notificationSent && (
                          <Badge variant="secondary" className="text-xs">
                            Notificado
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 pb-2">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Jogadores Escalados:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {item.members.map((member, index) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1"
                            >
                              <span className="text-muted-foreground w-5">{index + 1}.</span>
                              <span className="truncate">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma escalação encontrada</p>
                <p className="text-sm mt-2">As escalações aparecerão aqui após serem salvas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
