import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Send, X } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  phoneNumber?: string;
  message: string;
  title?: string;
}

export function WhatsAppPreview({
  isOpen,
  onClose,
  memberName,
  phoneNumber,
  message,
  title = "Prévia de Mensagem WhatsApp",
}: WhatsAppPreviewProps) {
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success("Mensagem copiada para a área de transferência!");
  };

  const handleOpenWhatsApp = () => {
    if (!phoneNumber) {
      toast.error("Número de telefone não configurado para este membro");
      return;
    }

    // Format phone number for WhatsApp (remove special characters)
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Prévia da mensagem para {memberName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contato */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Contato
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{memberName}</p>
                  {phoneNumber ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {phoneNumber}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ Número de telefone não configurado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Prévia da Mensagem */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Mensagem
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 min-h-24">
              <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {message}
              </p>
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Fechar
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyMessage}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Mensagem
            </Button>
            <Button
              onClick={handleOpenWhatsApp}
              disabled={!phoneNumber}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
