import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast } from "sonner";
import { Loader2, Send, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function WhatsAppAvisos() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customMessage, setCustomMessage] = useState("⚔️ *LEMBRETE GoT*\n\nFavor quem ainda não atacou, atacar por gentileza!\n\n🕐 O tempo está passando...");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Buscar escalação do dia
  const { data: schedules, isLoading: loadingSchedules } = trpc.schedules.getByEventAndDate.useQuery({
    eventTypeId: 2, // GoT
    eventDate: selectedDate,
  });

  // Buscar ataques do dia
  const { data: attacks, isLoading: loadingAttacks } = trpc.gotAttacks.getByDate.useQuery({
    eventDate: selectedDate,
  });

  // Buscar membros
  const { data: members } = trpc.members.list.useQuery();

  const sendWhatsAppMutation = trpc.whatsapp.sendGotReminder.useMutation({
    onSuccess: (result) => {
      toast.success(`Mensagens enviadas! ${result.success} sucesso, ${result.failed} falharam`);
      setSelectedMembers([]);
      setSelectAll(false);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  // Membros escalados para o dia
  const escalados = schedules?.members || [];
  // Ataques realizados no dia
  const atacaram = attacks?.filter((a: { attack: { didNotAttack: boolean; memberId: number } }) => !a.attack.didNotAttack) || [];
  // Membros que não atacaram
  const naoAtacaram = escalados.filter((e: { id: number; name: string }) => 
    !atacaram.some((a: { attack: { memberId: number } }) => a.attack.memberId === e.id)
  );

  // Membros com telefone cadastrado
  const membrosComTelefone = naoAtacaram.filter((m: any) => m.phoneNumber);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedMembers(membrosComTelefone.map((m: any) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleToggleMember = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSendWhatsApp = () => {
    if (selectedMembers.length === 0) {
      toast.error("Selecione pelo menos um membro");
      return;
    }

    const memberPhones = membrosComTelefone
      .filter((m: any) => selectedMembers.includes(m.id))
      .map((m: any) => ({
        phoneNumber: m.phoneNumber,
        name: m.name,
      }));

    sendWhatsAppMutation.mutate({
      memberPhones,
      customMessage: customMessage || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Avisos WhatsApp - GoT
            </h1>
            <p className="text-muted-foreground mt-1">
              Envie lembretes para membros que não atacaram via WhatsApp
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecionar Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Escalados</p>
                <p className="text-2xl font-bold mt-2">{escalados.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Atacaram</p>
                <p className="text-2xl font-bold mt-2 text-green-600">{atacaram.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Não Atacaram</p>
                <p className="text-2xl font-bold mt-2 text-orange-600">{naoAtacaram.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mensagem Personalizada</CardTitle>
            <CardDescription>
              Deixe em branco para usar a mensagem padrão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada..."
                className="min-h-24"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Prévia:</p>
              <pre className="whitespace-pre-wrap text-sm">
                {customMessage}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Members Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecionar Membros</CardTitle>
            <CardDescription>
              {membrosComTelefone.length} membro(s) com telefone cadastrado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {membrosComTelefone.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-600 p-4 bg-amber-50 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Nenhum membro que não atacou tem telefone cadastrado</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="selectAll"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="selectAll" className="cursor-pointer flex-1">
                    Selecionar Todos ({membrosComTelefone.length})
                  </Label>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {membrosComTelefone.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <Label htmlFor={`member-${member.id}`} className="cursor-pointer flex-1">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.phoneNumber}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Send Button */}
        {membrosComTelefone.length > 0 && (
          <Button
            onClick={handleSendWhatsApp}
            disabled={sendWhatsAppMutation.isPending || selectedMembers.length === 0}
            size="lg"
            className="w-full"
          >
            {sendWhatsAppMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando Mensagens...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar para {selectedMembers.length} Membro(s)
              </>
            )}
          </Button>
        )}
      </div>
      <Toaster />
    </DashboardLayout>
  );
}
