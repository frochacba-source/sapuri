import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function AIChatPanel() {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [context, setContext] = useState<'general' | 'strategy' | 'card'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Buscar histórico ao carregar
  const { data: history } = trpc.aiChat.getHistory.useQuery({ sessionId });

  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await trpc.aiChat.sendMessage.mutate({
        sessionId,
        message: userMessage,
        context: context as 'general' | 'strategy' | 'card',
      });

      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      } else {
        toast.error('Erro ao processar mensagem');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await trpc.aiChat.clearSession.mutate({ sessionId });
      setMessages([]);
      toast.success('Chat limpo');
    } catch (error) {
      toast.error('Erro ao limpar chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-amber-500" />
          Chat com IA
        </h1>
        <p className="text-muted-foreground">Converse com a IA sobre estratégias, cartas e cavaleiros</p>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contexto da Conversa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Conversa</label>
            <Select value={context} onValueChange={(val) => setContext(val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral - Dúvidas sobre o jogo</SelectItem>
                <SelectItem value="strategy">Estratégia - Análise de estratégias</SelectItem>
                <SelectItem value="card">Cartas - Recomendações de cartas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {context === 'general' && 'A IA responderá perguntas gerais sobre Saint Seiya e o jogo'}
            {context === 'strategy' && 'A IA ajudará a analisar e melhorar suas estratégias de combate'}
            {context === 'card' && 'A IA recomendará cartas baseado em seus cavaleiros e objetivos'}
          </p>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Conversa</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Mensagens */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Nenhuma mensagem ainda. Comece a conversa!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pressione Enter para enviar ou Shift+Enter para nova linha
          </p>
        </div>
      </Card>
    </div>
  );
}
