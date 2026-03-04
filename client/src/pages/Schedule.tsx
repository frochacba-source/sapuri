import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SchedulePreview } from "@/components/SchedulePreview";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { Calendar, Send, Save, Search, Users, ChevronLeft, ChevronRight, Swords, Trophy, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Schedule() {
  const params = useParams<{ eventType: string }>();
  const eventTypeName = params.eventType || "gvg";
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();
  const { data: eventTypes } = trpc.eventTypes.list.useQuery();
  
  // Get members filtered by event participation
  const { data: members } = trpc.members.listByEvent.useQuery(
    { eventName: eventTypeName },
    { enabled: !!eventTypeName }
  );
  
  const eventType = eventTypes?.find(e => e.name === eventTypeName);
  
  const { data: existingSchedule, isLoading: loadingSchedule } = trpc.schedules.getByEventAndDate.useQuery(
    { eventTypeId: eventType?.id || 0, eventDate: selectedDate },
    { enabled: !!eventType }
  );

  // Load existing schedule into selection
  useEffect(() => {
    if (existingSchedule?.members) {
      setSelectedMembers(existingSchedule.members.map(m => m.id));
    } else {
      setSelectedMembers([]);
    }
  }, [existingSchedule]);

  const saveSchedule = trpc.schedules.save.useMutation({
    onSuccess: () => {
      utils.schedules.getByEventAndDate.invalidate();
      toast.success("Escalação salva com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendNotification = trpc.schedules.sendNotification.useMutation({
    onSuccess: () => {
      utils.schedules.getByEventAndDate.invalidate();
      toast.success("Notificação enviada para o Telegram!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredMembers = members?.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (memberId: number) => {
    if (!isAdmin) return;
    
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      if (eventType && prev.length >= eventType.maxPlayers) {
        toast.error(`Máximo de ${eventType.maxPlayers} jogadores`);
        return prev;
      }
      return [...prev, memberId];
    });
  };

  const selectAll = () => {
    if (!isAdmin || !filteredMembers || !eventType) return;
    const maxToSelect = Math.min(filteredMembers.length, eventType.maxPlayers);
    setSelectedMembers(filteredMembers.slice(0, maxToSelect).map(m => m.id));
  };

  const clearAll = () => {
    if (!isAdmin) return;
    setSelectedMembers([]);
  };

  const handleSave = () => {
    if (!eventType) return;
    saveSchedule.mutate({
      eventTypeId: eventType.id,
      eventDate: selectedDate,
      memberIds: selectedMembers,
    });
  };

  const handleSendNotification = () => {
    if (!eventType) return;
    sendNotification.mutate({
      eventTypeId: eventType.id,
      eventDate: selectedDate,
    });
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getEventIcon = () => {
    switch (eventTypeName) {
      case 'gvg': return <Swords className="w-6 h-6 text-red-500" />;
      case 'got': return <Trophy className="w-6 h-6 text-blue-500" />;
      case 'reliquias': return <Crown className="w-6 h-6 text-yellow-500" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  if (!eventType) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Evento não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {getEventIcon()}
            <div>
              <h1 className="text-3xl font-bold">{eventType.displayName}</h1>
              <p className="text-muted-foreground">
                {eventType.maxPlayers} jogadores • {eventType.eventTime} • {members?.length || 0} membros disponíveis
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold capitalize">{formatDate(selectedDate)}</p>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2 w-auto mx-auto"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Selecionar Jogadores</CardTitle>
                  <CardDescription>
                    {selectedMembers.length} de {eventType.maxPlayers} selecionados
                    {members && members.length < eventType.maxPlayers && (
                      <span className="text-yellow-500 ml-2">
                        (apenas {members.length} membros participam deste evento)
                      </span>
                    )}
                  </CardDescription>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Selecionar Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Limpar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar jogador..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Member Grid */}
              {loadingSchedule ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {filteredMembers?.map((member) => {
                    const isSelected = selectedMembers.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'
                        } ${!isAdmin ? 'cursor-default' : ''}`}
                        onClick={() => toggleMember(member.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={!isAdmin}
                          onCheckedChange={() => toggleMember(member.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          {member.telegramUsername && (
                            <p className="text-xs text-muted-foreground truncate">
                              @{member.telegramUsername}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredMembers?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum membro encontrado</p>
                  <p className="text-sm mt-2">
                    Verifique se há membros marcados para participar de {eventType.displayName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Escalados
              </CardTitle>
              <CardDescription>
                {selectedMembers.length}/{eventType.maxPlayers}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {selectedMembers.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Nenhum jogador selecionado
                  </p>
                ) : (
                  selectedMembers.map((memberId, index) => {
                    const member = members?.find(m => m.id === memberId);
                    return (
                      <div key={memberId} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="truncate">{member?.name}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status */}
              {existingSchedule && (
                <div className="space-y-2 mb-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Notificação:</span>
                    <Badge variant={existingSchedule.notificationSent ? "default" : "secondary"}>
                      {existingSchedule.notificationSent ? "Enviada" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Preview */}
              {selectedMembers.length > 0 && eventType && (() => {
                const memberPhones: { [key: string]: string } = {};
                selectedMembers.forEach(id => {
                  const member = members?.find(m => m.id === id);
                  if (member?.phoneNumber) {
                    memberPhones[member.name] = member.phoneNumber;
                  }
                });
                return (
                  <div className="mt-4 pt-4 border-t">
                    <SchedulePreview
                      eventName={eventType.displayName}
                      eventTime={eventType.eventTime}
                      eventDate={selectedDate}
                      memberNames={selectedMembers
                        .map(id => members?.find(m => m.id === id)?.name)
                        .filter(Boolean) as string[]}
                      memberPhones={memberPhones}
                    />
                  </div>
                );
              })()}

              {/* Actions */}
              {isAdmin && (
                <div className="space-y-2 mt-4">
                  <Button 
                    className="w-full" 
                    onClick={handleSave}
                    disabled={saveSchedule.isPending || selectedMembers.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveSchedule.isPending ? "Salvando..." : "Salvar Escalação"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSendNotification}
                    disabled={sendNotification.isPending || !existingSchedule}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendNotification.isPending ? "Enviando..." : "Enviar Notificação"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
