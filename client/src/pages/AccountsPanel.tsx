import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Play, Pause, RefreshCw } from 'lucide-react';

interface Account {
  id: string;
  gameName: string;
  price: number;
  description: string;
  images: string[];
  createdAt: number;
}

interface SchedulerStatus {
  isRunning: boolean;
  intervalMinutes: number;
}

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({
    isRunning: false,
    intervalMinutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    gameName: '',
    price: '',
    description: '',
    images: [] as File[],
  });

  // Carregar contas e status do scheduler
  useEffect(() => {
    loadAccounts();
    loadSchedulerStatus();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const loadSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/scheduler/status');
      if (response.ok) {
        const data = await response.json();
        setSchedulerStatus(data);
      }
    } catch (error) {
      console.error('Erro ao carregar status do scheduler:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        images: Array.from(e.target.files),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('gameName', formData.gameName);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);

      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('/api/accounts/announce', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage('✅ Conta anunciada com sucesso!');
        setFormData({
          gameName: '',
          price: '',
          description: '',
          images: [],
        });
        loadAccounts();
      } else {
        setMessage('❌ Erro ao anunciar conta');
      }
    } catch (error) {
      setMessage('❌ Erro ao anunciar conta');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadAccounts();
        setMessage('✅ Conta removida');
      }
    } catch (error) {
      console.error('Erro ao remover conta:', error);
    }
  };

  const handleStartScheduler = async () => {
    try {
      const response = await fetch('/api/scheduler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes: schedulerStatus.intervalMinutes }),
      });

      if (response.ok) {
        loadSchedulerStatus();
        setMessage('✅ Scheduler iniciado');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleStopScheduler = async () => {
    try {
      const response = await fetch('/api/scheduler/stop', {
        method: 'POST',
      });

      if (response.ok) {
        loadSchedulerStatus();
        setMessage('✅ Scheduler pausado');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Painel de Contas de Jogos</h1>
        <p className="text-gray-400">Anuncie suas contas à venda e gerencie o reenvio automático</p>
      </div>

      {message && (
        <div className="p-4 bg-blue-900 text-blue-100 rounded-lg">
          {message}
        </div>
      )}

      {/* Formulário de Anúncio */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Anunciar Nova Conta</CardTitle>
          <CardDescription>Preencha os dados da conta que deseja vender</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Jogo</label>
              <Input
                type="text"
                placeholder="Ex: Free Fire, Valorant, League of Legends"
                value={formData.gameName}
                onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                required
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preço (R$)</label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                placeholder="Descreva os itens, skins, rank, nível, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="bg-gray-800 border-gray-700 min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prints da Conta</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700"
              />
              {formData.images.length > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {formData.images.length} arquivo(s) selecionado(s)
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Anunciando...' : '🎮 Anunciar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Controle do Scheduler */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Controle do Scheduler</CardTitle>
          <CardDescription>Gerencie o reenvio automático de contas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium">Status: {schedulerStatus.isRunning ? '🟢 Ativo' : '🔴 Pausado'}</p>
              <p className="text-sm text-gray-400">Intervalo: {schedulerStatus.intervalMinutes} minutos</p>
            </div>
            <div className="space-x-2">
              {!schedulerStatus.isRunning ? (
                <Button
                  onClick={handleStartScheduler}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" /> Iniciar
                </Button>
              ) : (
                <Button
                  onClick={handleStopScheduler}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Pause className="w-4 h-4 mr-2" /> Pausar
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Intervalo de Reenvio (minutos)</label>
            <Input
              type="number"
              min="5"
              value={schedulerStatus.intervalMinutes}
              onChange={(e) =>
                setSchedulerStatus({
                  ...schedulerStatus,
                  intervalMinutes: parseInt(e.target.value),
                })
              }
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Contas Cadastradas ({accounts.length})</CardTitle>
          <CardDescription>Gerenciar suas contas à venda</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhuma conta cadastrada ainda</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{account.gameName}</h3>
                    <p className="text-purple-400 font-bold">R$ {account.price.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm mt-2">{account.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {account.images.length} imagem(ns) • {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteAccount(account.id)}
                    variant="destructive"
                    size="sm"
                    className="ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
