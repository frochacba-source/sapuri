import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppPreview } from "@/components/WhatsAppPreview";

export default function WhatsAppTest() {
  const [memberName, setMemberName] = useState("João Silva");
  const [phoneNumber, setPhoneNumber] = useState("+55 (11) 98765-4321");
  const [message, setMessage] = useState(
    "Olá João! 👋\n\nVocê foi escalado para a GVG de hoje!\n\n📅 Data: 15/01/2026\n⏰ Horário: 13:00\n\nBoa sorte! 🎮"
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Teste de Prévia WhatsApp</h1>
          <p className="text-muted-foreground">
            Configure os dados e visualize como a mensagem será enviada
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração da Mensagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Nome do Membro
              </label>
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Digite o nome do membro"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Número de Telefone
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+55 (11) 98765-4321"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formato: +55 (XX) XXXXX-XXXX
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Mensagem
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite a mensagem a ser enviada"
                rows={8}
              />
            </div>

            <Button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full"
              size="lg"
            >
              Visualizar Prévia
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              ℹ️ Como Usar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              1. Preencha o nome do membro, número de telefone e a mensagem
            </p>
            <p>2. Clique em "Visualizar Prévia" para ver como ficará</p>
            <p>3. Na prévia, você pode:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Copiar a mensagem para enviar manualmente</li>
              <li>Abrir WhatsApp para enviar diretamente</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <WhatsAppPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        memberName={memberName}
        phoneNumber={phoneNumber}
        message={message}
        title="Prévia de Mensagem WhatsApp"
      />
    </DashboardLayout>
  );
}
