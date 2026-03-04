import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Megaphone, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GeneralAnnouncements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // Get recent general announcements
  const { data: announcements, refetch } = trpc.announcements.list.useQuery({
    limit: 20,
  });

  // Mutation to create announcement
  const createAnnouncementMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("Aviso enviado para o grupo!");
      setTitle("");
      setMessage("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }

    createAnnouncementMutation.mutate({
      title: title.trim(),
      message: message.trim(),
      isGeneral: true,
      sendNow: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Avisos Gerais</h1>
          <p className="text-muted-foreground">
            Envie avisos para todo o grupo do Telegram
          </p>
        </div>

        {/* Send New Announcement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Novo Aviso
            </CardTitle>
            <CardDescription>
              O aviso será enviado para o grupo do Telegram configurado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Atenção membros!"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/2000 caracteres
              </p>
            </div>

            <Button 
              onClick={handleSend} 
              disabled={!title.trim() || !message.trim() || createAnnouncementMutation.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Aviso
            </Button>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Avisos Recentes</CardTitle>
            <CardDescription>
              Últimos avisos enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.filter(a => a.isGeneral).map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(announcement.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {announcement.message}
                    </p>
                    {announcement.sentAt && (
                      <p className="text-xs text-green-600">
                        ✓ Enviado em {format(new Date(announcement.sentAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum aviso enviado ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
