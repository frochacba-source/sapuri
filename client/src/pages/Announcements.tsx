import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { Send, MessageSquare, Users, Search, Swords, Trophy, Crown, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Announcements() {
  const params = useParams<{ eventType: string }>();
  const eventTypeName = params.eventType || "gvg";
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();
  const { data: eventTypes } = trpc.eventTypes.list.useQuery();
  const { data: members } = trpc.members.listByEvent.useQuery(
    { eventName: eventTypeName },
    { enabled: !!eventTypeName }
  );
  
  const eventType = eventTypes?.find(e => e.name === eventTypeName);

  // Get today's schedule for GvG
  const today = new Date().toISOString().split('T')[0];
  const { data: todaySchedule } = trpc.schedules.getByEventAndDate.useQuery(
    { eventDate: today, eventTypeId: eventType?.id || 0 },
    { enabled: eventTypeName === 'gvg' && !!eventType?.id }
  );

  const loadScheduledMembers = () => {
    if (!todaySchedule?.members || todaySchedule.members.length === 0) {
      toast.error("Nenhuma escalação encontrada para hoje");
      return;
    }
    const scheduledIds = todaySchedule.members.map((m: { id: number }) => m.id);
    setSelectedMembers(scheduledIds);
    toast.success(`${scheduledIds.length} membros escalados carregados`);
  };

  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("Aviso enviado com sucesso!");
      setTitle("");
      setMessage("");
      setSelectedMembers([]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredMembers = members?.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (memberId: number) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const selectAll = () => {
    if (!filteredMembers) return;
    setSelectedMembers(filteredMembers.map(m => m.id));
  };

  const clearAll = () => {
    setSelectedMembers([]);
  };

  const handleSend = () => {
    if (!eventType) return;
    if (!title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!message.trim()) {
      toast.error("Mensagem é obrigatória");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Selecione pelo menos um destinatário");
      return;
    }

    createAnnouncement.mutate({
      eventTypeId: eventType.id,
      title: title.trim(),
      message: message.trim(),
      memberIds: selectedMembers,
      sendNow: true,
    });
  };

  const getEventIcon = () => {
    switch (eventTypeName) {
      case 'gvg': return <Swords className="w-6 h-6 text-red-500" />;
      case 'got': return <Trophy className="w-6 h-6 text-blue-500" />;
      case 'reliquias': return <Crown className="w-6 h-6 text-yellow-500" />;
      default: return <MessageSquare className="w-6 h-6" />;
    }
  };

  // Quick message templates
  const templates = [
    { title: "Falta Atacar!", message: "Atenção! Você ainda não atacou na batalha de hoje. Por favor, entre no jogo e faça seus ataques o mais rápido possível!" },
    { title: "Lembrete de Horário", message: "A batalha começa em breve! Esteja online e preparado." },
    { title: "Parabéns!", message: "Excelente desempenho na batalha de hoje! Continue assim!" },
  ];

  const applyTemplate = (template: { title: string; message: string }) => {
    setTitle(template.title);
    setMessage(template.message);
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
        <div className="flex items-center gap-3">
          {getEventIcon()}
          <div>
            <h1 className="text-3xl font-bold">Avisos - {eventType.displayName}</h1>
            <p className="text-muted-foreground">
              Envie mensagens para jogadores específicos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Nova Mensagem
              </CardTitle>
              <CardDescription>
                Crie um aviso para enviar aos jogadores selecionados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Templates */}
              <div className="space-y-2">
                <Label>Modelos Rápidos</Label>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Falta Atacar!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={handleSend}
                  disabled={createAnnouncement.isPending || selectedMembers.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createAnnouncement.isPending 
                    ? "Enviando..." 
                    : `Enviar para ${selectedMembers.length} jogador${selectedMembers.length !== 1 ? 'es' : ''}`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member Selection */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Destinatários
                  </CardTitle>
                  <CardDescription>
                    {selectedMembers.length} de {members?.length || 0} selecionados
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {eventTypeName === 'gvg' && (
                    <Button variant="outline" size="sm" onClick={loadScheduledMembers}>
                      <Download className="w-3 h-3 mr-1" />
                      Carregar Escalados
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Limpar
                  </Button>
                </div>
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
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {filteredMembers?.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleMember(member.id)}
                    >
                      <Checkbox
                        checked={isSelected}
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

              {filteredMembers?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum membro encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
