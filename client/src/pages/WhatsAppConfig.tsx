import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { 
  Loader2, 
  MessageCircle, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  QrCode, 
  RefreshCw,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap
} from "lucide-react";

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

// Status indicator component
function StatusIndicator({ status }: { status: 'connected' | 'disconnected' | 'connecting' }) {
  const config = {
    connected: {
      color: 'bg-emerald-500',
      pulse: false,
      ring: 'ring-emerald-500/30',
    },
    disconnected: {
      color: 'bg-red-500',
      pulse: false,
      ring: 'ring-red-500/30',
    },
    connecting: {
      color: 'bg-amber-500',
      pulse: true,
      ring: 'ring-amber-500/30',
    },
  };

  const { color, pulse, ring } = config[status];

  return (
    <span className="relative flex h-3 w-3">
      {pulse && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color} ring-4 ${ring}`} />
    </span>
  );
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

  // Determine current status for indicator
  const connectionStatus = isConnected ? 'connected' : isInitializing ? 'connecting' : 'disconnected';

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#128C7E] via-[#25D366] to-[#075E54] p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTQgMC04IDQtOCA0cy00LTQtOC00Yy0yIDAtNC0yLTQgMnMwIDQgMCA0IDQgOCA4IDggOC00IDgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Configuração WhatsApp
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Conecte e gerencie o bot do WhatsApp para envio de mensagens
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Card - Main */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-white/10">
                    {isConnected ? (
                      <Wifi className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  Status da Conexão
                </CardTitle>
                <StatusIndicator status={connectionStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estado do Bot</p>
                  <div className="flex items-center gap-2">
                    {statusQuery.isLoading ? (
                      <span className="flex items-center gap-2 text-slate-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </span>
                    ) : isConnected ? (
                      <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        Conectado
                      </span>
                    ) : isInitializing ? (
                      <span className="flex items-center gap-2 text-amber-400 font-semibold animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Conectando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400 font-semibold">
                        <AlertCircle className="w-5 h-5" />
                        Desconectado
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Modo</p>
                  <div className="flex items-center gap-2">
                    {isInitializing ? (
                      <span className="flex items-center gap-2 text-amber-400 font-semibold">
                        <Zap className="w-5 h-5" />
                        Inicializando
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sky-400 font-semibold">
                        <Power className="w-5 h-5" />
                        Pronto
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {!isConnected && !isInitializing && (
                  <Button
                    onClick={handleInitialize}
                    disabled={initialize.isPending}
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                  >
                    {initialize.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Inicializando...
                      </>
                    ) : (
                      <>
                        <Power className="w-5 h-5 mr-2" />
                        Inicializar Bot
                      </>
                    )}
                  </Button>
                )}

                {isConnected && (
                  <>
                    <Button
                      onClick={handleDisconnect}
                      disabled={disconnect.isPending}
                      className="flex-1 h-12 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-red-500/40 hover:scale-[1.02]"
                    >
                      {disconnect.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Desconectando...
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-5 h-5 mr-2" />
                          Desconectar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClearSession}
                      disabled={clearSession.isPending}
                      variant="outline"
                      className="h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300"
                    >
                      {clearSession.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Limpando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5 mr-2" />
                          Limpar Sessão
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card - Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm">
                {[
                  { step: 1, text: 'Clique em "Inicializar Bot"', icon: Power },
                  { step: 2, text: 'Aguarde o código QR aparecer', icon: QrCode },
                  { step: 3, text: 'Escaneie com seu WhatsApp', icon: Smartphone },
                  { step: 4, text: 'Autenticação automática', icon: CheckCircle2 },
                  { step: 5, text: 'Pronto para enviar mensagens', icon: MessageCircle },
                ].map(({ step, text, icon: Icon }) => (
                  <li 
                    key={step} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs font-bold shadow-sm">
                      {step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{text}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Section */}
      {safeQRCode && (
        <Card className="mt-6 border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
          <CardHeader className="text-center border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl">Escaneie o Código QR</CardTitle>
            <CardDescription className="text-sm">
              Abra o WhatsApp → Configurações → Aparelhos Conectados → Escanear QR
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-6">
              {/* QR Code Display */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative p-6 bg-white rounded-2xl shadow-2xl border-4 border-slate-100">
                  <img
                    src={safeQRCode}
                    alt="QR Code para WhatsApp"
                    className="w-56 h-56 md:w-64 md:h-64 object-contain transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Timer Warning */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium animate-pulse">
                <AlertCircle className="w-4 h-4" />
                O código expira em ~30 segundos
              </div>

              {/* Regenerate Button */}
              <Button
                onClick={handleRegenerateQR}
                disabled={regenerateQR.isPending}
                variant="outline"
                className="h-11 px-6 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 transition-all duration-300"
              >
                {regenerateQR.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando novo código...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar QR Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 border-l-4 border-l-sky-500">
        <CardContent className="py-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
                <Info className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sky-900 dark:text-sky-300 mb-2">Informações Importantes</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-sky-800 dark:text-sky-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Sessão salva automaticamente</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Desconecte a qualquer momento</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>"Limpar Sessão" para reset completo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Funciona com Baileys (sem Chrome)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
