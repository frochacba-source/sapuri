/**
 * GvG Custom Messages - Sistema de gerenciamento de mensagens personalizadas
 */

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Send,
  Clock,
  MessageSquare,
  Calendar,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

// Dias da semana
const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

interface CustomMessage {
  id: number;
  title: string;
  content: string;
  scheduleTime: string;
  daysOfWeek: string | null;
  isActive: boolean;
  sendToTelegram: boolean;
  sendToWhatsApp: boolean;
  telegramGroupId: string | null;
  whatsappGroupId: string | null;
  lastSentAt: Date | null;
  createdAt: Date;
}

interface MessageFormData {
  title: string;
  content: string;
  scheduleTime: string;
  daysOfWeek: number[];
  sendToTelegram: boolean;
  sendToWhatsApp: boolean;
  whatsappGroupId: string;
}

export default function GvgCustomMessages() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CustomMessage | null>(null);
  const [previewMessage, setPreviewMessage] = useState<CustomMessage | null>(null);
  const [formData, setFormData] = useState<MessageFormData>({
    title: "",
    content: "",
    scheduleTime: "14:00",
    daysOfWeek: [],
    sendToTelegram: true,
    sendToWhatsApp: true,
    whatsappGroupId: "",
  });

  // Queries
  const messagesQuery = trpc.customMessages.list.useQuery();
  const schedulerStatusQuery = trpc.customMessages.schedulerStatus.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const whatsappGroupsQuery = trpc.alerts.whatsappGroups.list.useQuery();

  // Mutations
  const createMutation = trpc.customMessages.create.useMutation({
    onSuccess: () => {
      toast.success("Mensagem criada com sucesso!");
      messagesQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar mensagem");
    },
  });

  const updateMutation = trpc.customMessages.update.useMutation({
    onSuccess: () => {
      toast.success("Mensagem atualizada com sucesso!");
      messagesQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar mensagem");
    },
  });

  const deleteMutation = trpc.customMessages.delete.useMutation({
    onSuccess: () => {
      toast.success("Mensagem excluída com sucesso!");
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir mensagem");
    },
  });

  const toggleMutation = trpc.customMessages.toggle.useMutation({
    onSuccess: (data) => {
      toast.success(data.data?.isActive ? "Mensagem ativada!" : "Mensagem desativada!");
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alternar status");
    },
  });

  const sendNowMutation = trpc.customMessages.sendNow.useMutation({
    onSuccess: (data) => {
      if (data.telegram || data.whatsapp) {
        toast.success(`Mensagem enviada! Telegram: ${data.telegram ? "✓" : "✗"} | WhatsApp: ${data.whatsapp ? "✓" : "✗"}`);
      } else {
        toast.error("Nenhuma plataforma recebeu a mensagem");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem");
    },
  });

  const startSchedulerMutation = trpc.customMessages.startScheduler.useMutation({
    onSuccess: () => {
      toast.success("Scheduler iniciado!");
      schedulerStatusQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao iniciar scheduler");
    },
  });

  const stopSchedulerMutation = trpc.customMessages.stopScheduler.useMutation({
    onSuccess: () => {
      toast.success("Scheduler parado!");
      schedulerStatusQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao parar scheduler");
    },
  });

  const refreshSchedulerMutation = trpc.customMessages.refreshScheduler.useMutation({
    onSuccess: (data) => {
      toast.success(`Scheduler recarregado! ${data.count} mensagens agendadas.`);
      schedulerStatusQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao recarregar scheduler");
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      scheduleTime: "14:00",
      daysOfWeek: [],
      sendToTelegram: true,
      sendToWhatsApp: true,
      whatsappGroupId: "",
    });
    setEditingMessage(null);
    setIsFormOpen(false);
  };

  // Open edit form
  const openEditForm = (message: CustomMessage) => {
    setEditingMessage(message);
    setFormData({
      title: message.title,
      content: message.content,
      scheduleTime: message.scheduleTime,
      daysOfWeek: message.daysOfWeek ? JSON.parse(message.daysOfWeek) : [],
      sendToTelegram: message.sendToTelegram,
      sendToWhatsApp: message.sendToWhatsApp,
      whatsappGroupId: message.whatsappGroupId || "",
    });
    setIsFormOpen(true);
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Conteúdo é obrigatório");
      return;
    }
    if (!formData.sendToTelegram && !formData.sendToWhatsApp) {
      toast.error("Selecione pelo menos uma plataforma");
      return;
    }
    if (formData.sendToWhatsApp && !formData.whatsappGroupId) {
      toast.error("Selecione um grupo do WhatsApp");
      return;
    }

    const data = {
      title: formData.title,
      content: formData.content,
      scheduleTime: formData.scheduleTime,
      daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
      sendToTelegram: formData.sendToTelegram,
      sendToWhatsApp: formData.sendToWhatsApp,
      whatsappGroupId: formData.whatsappGroupId || undefined,
    };

    if (editingMessage) {
      updateMutation.mutate({ id: editingMessage.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Toggle day
  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  // Format days for display
  const formatDays = (daysOfWeek: string | null): string => {
    if (!daysOfWeek) return "Todos os dias";
    try {
      const days = JSON.parse(daysOfWeek) as number[];
      if (days.length === 0) return "Todos os dias";
      if (days.length === 7) return "Todos os dias";
      return days.map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label).join(", ");
    } catch {
      return "Todos os dias";
    }
  };

  // Format date
  const formatDate = (date: Date | null): string => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleString("pt-BR");
  };

  const messages = messagesQuery.data?.data || [];
  const schedulerStatus = schedulerStatusQuery.data;
  const whatsappGroups = whatsappGroupsQuery.data || [];
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mensagens Personalizadas</h1>
            <p className="text-muted-foreground">
              Crie e gerencie mensagens automáticas para GvG
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={(open) => !open && resetForm()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMessage ? "Editar Mensagem" : "Nova Mensagem"}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes da mensagem automática
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Lembrete de GvG"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="content"
                    placeholder="Digite o conteúdo da mensagem..."
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Suporta formatação Markdown: *negrito*, _itálico_, etc.
                  </p>
                </div>

                {/* Horário */}
                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Horário de Envio</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  />
                </div>

                {/* Dias da semana */}
                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div
                        key={day.value}
                        className={`px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                          formData.daysOfWeek.includes(day.value)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent"
                        }`}
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.daysOfWeek.length === 0
                      ? "Nenhum selecionado = todos os dias"
                      : `Selecionados: ${formData.daysOfWeek.length} dias`}
                  </p>
                </div>

                {/* Plataformas */}
                <div className="space-y-4 border rounded-lg p-4">
                  <Label>Plataformas de Envio</Label>
                  
                  {/* Telegram */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>Telegram</span>
                    </div>
                    <Switch
                      checked={formData.sendToTelegram}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, sendToTelegram: checked })
                      }
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span>WhatsApp</span>
                      </div>
                      <Switch
                        checked={formData.sendToWhatsApp}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, sendToWhatsApp: checked })
                        }
                      />
                    </div>
                    
                    {formData.sendToWhatsApp && (
                      <Select
                        value={formData.whatsappGroupId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, whatsappGroupId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {whatsappGroups.map((group: any) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMessage ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Scheduler Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status do Agendador
                </CardTitle>
                <CardDescription>
                  Controle o agendamento automático de mensagens
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {schedulerStatus?.isRunning ? (
                  <>
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Ativo
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => stopSchedulerMutation.mutate()}
                      disabled={stopSchedulerMutation.isPending}
                    >
                      <Pause className="mr-1 h-4 w-4" />
                      Parar
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-3 w-3" />
                      Parado
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => startSchedulerMutation.mutate()}
                      disabled={startSchedulerMutation.isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Iniciar
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshSchedulerMutation.mutate()}
                  disabled={refreshSchedulerMutation.isPending}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshSchedulerMutation.isPending ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                📅 Mensagens agendadas: <strong>{schedulerStatus?.activeJobs || 0}</strong>
              </span>
              {schedulerStatus?.lastRefresh && (
                <span>
                  🔄 Última atualização:{" "}
                  <strong>{formatDate(schedulerStatus.lastRefresh)}</strong>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Cadastradas</CardTitle>
            <CardDescription>
              {messages.length} mensagem{messages.length !== 1 ? "s" : ""} cadastrada
              {messages.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messagesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem cadastrada</p>
                <p className="text-sm">Clique em "Nova Mensagem" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message: CustomMessage) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      message.isActive ? "border-green-500/30 bg-green-500/5" : "border-border"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{message.title}</h3>
                          {message.isActive ? (
                            <Badge variant="default" className="bg-green-500">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {message.scheduleTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDays(message.daysOfWeek)}
                          </span>
                          <span className="flex items-center gap-1">
                            {message.sendToTelegram && (
                              <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                                Telegram
                              </Badge>
                            )}
                            {message.sendToWhatsApp && (
                              <Badge variant="outline" className="text-green-500 border-green-500/30">
                                WhatsApp
                              </Badge>
                            )}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>

                        {message.lastSentAt && (
                          <p className="text-xs text-muted-foreground">
                            Último envio: {formatDate(message.lastSentAt)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Preview */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setPreviewMessage(message)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Preview: {message.title}</DialogTitle>
                            </DialogHeader>
                            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                              {message.content}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(message)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Send Now */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sendNowMutation.mutate({ id: message.id })}
                          disabled={sendNowMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>

                        {/* Toggle Active */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleMutation.mutate({ id: message.id })}
                          disabled={toggleMutation.isPending}
                        >
                          {message.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Mensagem</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a mensagem "{message.title}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate({ id: message.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>Criar mensagem:</strong> Clique em "Nova Mensagem" e configure título, conteúdo,
              horário e plataformas.
            </p>
            <p>
              • <strong>Dias da semana:</strong> Deixe em branco para enviar todos os dias, ou selecione
              os dias específicos.
            </p>
            <p>
              • <strong>Agendador:</strong> Inicie o agendador para que as mensagens sejam enviadas
              automaticamente no horário configurado.
            </p>
            <p>
              • <strong>Enviar agora:</strong> Use o botão de envio (📤) para testar a mensagem
              imediatamente.
            </p>
            <p>
              • <strong>Ativar/Desativar:</strong> Mensagens inativas não são enviadas pelo agendador.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
