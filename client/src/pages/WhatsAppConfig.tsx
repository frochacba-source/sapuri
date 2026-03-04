import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, MessageCircle, Wifi, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

/**
 * Normaliza QR code base64:
 * - Valida formato data:image/png;base64
 * - Garante que é uma imagem PNG válida
 * - Retorna null se inválido
 */
function normalizeQRCode(qrCode?: string): string | null {
  if (!qrCode) return null;

  // Já é um data URL válido?
  if (qrCode.startsWith("data:image/png;base64,")) {
    // Validar que o payload é base64 válido
    const payload = qrCode.slice(22); // Remove header
    
    // Base64 válido: A-Z, a-z, 0-9, +, /, =
    if (!/^[A-Za-z0-9+/=]+$/.test(payload)) {
      console.warn('Invalid base64 payload');
      return null;
    }
    
    return qrCode;
  }
  
  // Se for só base64 sem header, adicionar
  if (!/[^A-Za-z0-9+/=]/.test(qrCode) && qrCode.length > 100) {
    return `data:image/png;base64,${qrCode}`;
  }

  return null;
}

export default function WhatsAppConfig() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);

  // Queries
  const statusQuery = trpc.whatsapp.status.useQuery(undefined, {
    refetchInterval: isInitializing ? 1000 : false,
  });

  const qrQuery = trpc.whatsapp.getQRCode.useQuery(undefined, {
    enabled: isInitializing,
    refetchInterval: isInitializing ? 1000 : false,
  });

  // Mutations
  const initialize = trpc.whatsapp.initialize.useMutation({
    onSuccess: () => {
      setIsInitializing(true);
      statusQuery.refetch();
    },
  });

  const disconnect = trpc.whatsapp.disconnect.useMutation({
    onSuccess: () => {
      setIsInitializing(false);
      statusQuery.refetch();
      qrQuery.refetch();
    },
  });

  const clearSession = trpc.whatsapp.clearSession.useMutation({
    onSuccess: () => {
      setIsInitializing(false);
      statusQuery.refetch();
      qrQuery.refetch();
    },
  });

  // Regenerar QR code quando expirar
  const regenerateQR = trpc.whatsapp.initialize.useMutation({
    onSuccess: () => {
      qrQuery.refetch();
    },
  });

  // Normalizar QR code com useMemo para evitar re-renders instáveis
  const safeQRCode = useMemo(() => normalizeQRCode(qrQuery.data?.qrCode ?? undefined), [qrQuery.data?.qrCode]);

  // Determinar status
  const status = statusQuery.data;
  const isConnected = status?.isConnected ?? false;

  // Redirecionar se não for admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleInitialize = async () => {
    setIsInitializing(true);
    await initialize.mutateAsync();
  };

  const handleDisconnect = async () => {
    await disconnect.mutateAsync();
  };

  const handleClearSession = async () => {
    await clearSession.mutateAsync();
  };

  const handleRegenerateQR = async () => {
    await regenerateQR.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuração WhatsApp</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie a conexão do bot WhatsApp e escaneie o código QR para autenticar
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                Status da Conexão
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                Status da Conexão
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estado do Bot</p>
              <p className="text-lg font-semibold">
                {statusQuery.isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando...
                  </span>
                ) : isConnected ? (
                  <span className="text-green-600">Conectado</span>
                ) : isInitializing ? (
                  <span className="text-yellow-600">Inicializando...</span>
                ) : (
                  <span className="text-red-600">Desconectado</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modo</p>
              <p className="text-lg font-semibold">
                {isInitializing ? (
                  <span className="text-yellow-600">Inicializando</span>
                ) : (
                  <span className="text-blue-600">Pronto</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {!isConnected && !isInitializing && (
              <Button
                onClick={handleInitialize}
                disabled={initialize.isPending}
                className="flex-1"
              >
                {initialize.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Inicializar Bot
                  </>
                )}
              </Button>
            )}

            {isConnected && (
              <Button
                onClick={handleDisconnect}
                disabled={disconnect.isPending}
                variant="destructive"
                className="flex-1"
              >
                {disconnect.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Desconectar
                  </>
                )}
              </Button>
            )}

            {isConnected && (
              <Button
                onClick={handleClearSession}
                disabled={clearSession.isPending}
                variant="outline"
                className="flex-1"
              >
                {clearSession.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  "Limpar Sessão"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Card */}
      {safeQRCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Código QR para Escanear
            </CardTitle>
            <CardDescription>
              Use seu telefone com WhatsApp para escanear o código abaixo (expira em ~30 segundos)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-white p-4 rounded-lg border">
                <img
                  src={safeQRCode}
                  alt="QR Code"
                  className="w-64 h-64"
                  draggable={false}
                />
              </div>
            </div>
            <Button
              onClick={handleRegenerateQR}
              disabled={regenerateQR.isPending}
              variant="outline"
              className="w-full"
            >
              {regenerateQR.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                "Regenerar QR Code"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-semibold min-w-6">1.</span>
              <span>Clique em "Inicializar Bot"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold min-w-6">2.</span>
              <span>Um código QR será exibido</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold min-w-6">3.</span>
              <span>Abra o WhatsApp no seu telefone e escaneie o código</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold min-w-6">4.</span>
              <span>O bot será autenticado automaticamente</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold min-w-6">5.</span>
              <span>Você poderá enviar mensagens para membros</span>
            </li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">Notas:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• A sessão é salva automaticamente após autenticação</li>
              <li>• Você pode desconectar a qualquer momento</li>
              <li>• Use "Limpar Sessão" para resetar completamente</li>
              <li>• O bot funciona com Baileys (sem necessidade de Chrome)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
