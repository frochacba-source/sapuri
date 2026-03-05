import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trash2, 
  Play, 
  Pause, 
  Edit2, 
  Send, 
  MessageCircle, 
  Loader2,
  Check,
  X,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Gamepad2
} from 'lucide-react';

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
  sendToWhatsApp: boolean;
}

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({
    isRunning: false,
    intervalMinutes: 60,
    sendToWhatsApp: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  // Estados de loading para ações individuais
  const [sendingTelegram, setSendingTelegram] = useState<string | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Estado do modal de edição
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({
    gameName: '',
    price: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  // Confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  // Limpar mensagem após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

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
        showMessage('✅ Conta anunciada com sucesso!', 'success');
        setFormData({
          gameName: '',
          price: '',
          description: '',
          images: [],
        });
        loadAccounts();
      } else {
        showMessage('❌ Erro ao anunciar conta', 'error');
      }
    } catch (error) {
      showMessage('❌ Erro ao anunciar conta', 'error');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edição
  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setEditForm({
      gameName: account.gameName,
      price: account.price.toString(),
      description: account.description,
    });
  };

  // Fechar modal de edição
  const closeEditModal = () => {
    setEditingAccount(null);
    setEditForm({ gameName: '', price: '', description: '' });
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!editingAccount) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: editForm.gameName,
          price: editForm.price,
          description: editForm.description,
        }),
      });

      if (response.ok) {
        showMessage('✅ Conta atualizada com sucesso!', 'success');
        loadAccounts();
        closeEditModal();
      } else {
        showMessage('❌ Erro ao atualizar conta', 'error');
      }
    } catch (error) {
      showMessage('❌ Erro ao atualizar conta', 'error');
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  // Enviar para Telegram
  const handleSendTelegram = async (accountId: string) => {
    setSendingTelegram(accountId);
    try {
      const response = await fetch(`/api/accounts/${accountId}/send-telegram`, {
        method: 'POST',
      });

      if (response.ok) {
        showMessage('✅ Conta enviada para o Telegram!', 'success');
      } else {
        showMessage('❌ Erro ao enviar para Telegram', 'error');
      }
    } catch (error) {
      showMessage('❌ Erro ao enviar para Telegram', 'error');
      console.error('Erro:', error);
    } finally {
      setSendingTelegram(null);
    }
  };

  // Enviar para WhatsApp
  const handleSendWhatsApp = async (accountId: string) => {
    setSendingWhatsApp(accountId);
    try {
      const response = await fetch(`/api/accounts/${accountId}/send-whatsapp`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage(`✅ ${data.message}`, 'success');
      } else {
        showMessage(`❌ ${data.error || 'Erro ao enviar para WhatsApp'}`, 'error');
      }
    } catch (error) {
      showMessage('❌ Erro ao enviar para WhatsApp', 'error');
      console.error('Erro:', error);
    } finally {
      setSendingWhatsApp(null);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    setDeleting(accountId);
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadAccounts();
        showMessage('✅ Conta removida', 'success');
      }
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      showMessage('❌ Erro ao remover conta', 'error');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
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
        showMessage('✅ Scheduler iniciado', 'success');
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
        showMessage('✅ Scheduler pausado', 'success');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleToggleWhatsApp = async () => {
    try {
      const newValue = !schedulerStatus.sendToWhatsApp;
      const response = await fetch('/api/scheduler/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newValue }),
      });

      if (response.ok) {
        setSchedulerStatus({ ...schedulerStatus, sendToWhatsApp: newValue });
        showMessage(
          newValue 
            ? '✅ Envio automático WhatsApp ativado' 
            : '⚪ Envio automático WhatsApp desativado', 
          'success'
        );
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-700/30">
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Painel de Contas de Jogos
          </h1>
        </div>
        <p className="text-gray-400">Anuncie suas contas à venda e gerencie o reenvio automático</p>
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 transition-all ${
          messageType === 'success' 
            ? 'bg-green-900/50 text-green-100 border border-green-700/50' 
            : messageType === 'error'
            ? 'bg-red-900/50 text-red-100 border border-red-700/50'
            : 'bg-blue-900/50 text-blue-100 border border-blue-700/50'
        }`}>
          {messageType === 'success' && <Check className="w-5 h-5" />}
          {messageType === 'error' && <X className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulário de Anúncio */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Anunciar Nova Conta
            </CardTitle>
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
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    {formData.images.length} arquivo(s) selecionado(s)
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Anunciando...
                  </>
                ) : (
                  <>
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Anunciar Conta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Controle do Scheduler */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Controle do Scheduler
            </CardTitle>
            <CardDescription>Gerencie o reenvio automático de contas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Card */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      schedulerStatus.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></span>
                    Status: {schedulerStatus.isRunning ? 'Ativo' : 'Pausado'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Intervalo: {schedulerStatus.intervalMinutes} minutos
                  </p>
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

              {/* Toggle WhatsApp */}
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Envio automático WhatsApp</span>
                </div>
                <Button
                  onClick={handleToggleWhatsApp}
                  variant={schedulerStatus.sendToWhatsApp ? "default" : "outline"}
                  size="sm"
                  className={schedulerStatus.sendToWhatsApp 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "border-gray-600"
                  }
                >
                  {schedulerStatus.sendToWhatsApp ? 'Ativo' : 'Inativo'}
                </Button>
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
                    intervalMinutes: parseInt(e.target.value) || 60,
                  })
                }
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 5 minutos. O scheduler reenviará todas as contas no intervalo configurado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
              Contas Cadastradas ({accounts.length})
            </span>
          </CardTitle>
          <CardDescription>Gerenciar suas contas à venda</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma conta cadastrada ainda</p>
              <p className="text-gray-500 text-sm mt-1">Use o formulário acima para anunciar sua primeira conta</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-600/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Info da Conta */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-purple-400" />
                        {account.gameName}
                      </h3>
                      <p className="text-green-400 font-bold text-lg">
                        R$ {account.price.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{account.description}</p>
                      <div className="flex items-center gap-4 text-gray-500 text-xs mt-3">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {account.images.length} imagem(ns)
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(account.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap gap-2">
                      {/* Editar */}
                      <Button
                        onClick={() => openEditModal(account)}
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>

                      {/* Enviar Telegram */}
                      <Button
                        onClick={() => handleSendTelegram(account.id)}
                        disabled={sendingTelegram === account.id}
                        variant="outline"
                        size="sm"
                        className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20"
                      >
                        {sendingTelegram === account.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-1" />
                        )}
                        Telegram
                      </Button>

                      {/* Enviar WhatsApp */}
                      <Button
                        onClick={() => handleSendWhatsApp(account.id)}
                        disabled={sendingWhatsApp === account.id}
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-400 hover:bg-green-600/20"
                      >
                        {sendingWhatsApp === account.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4 mr-1" />
                        )}
                        WhatsApp
                      </Button>

                      {/* Remover */}
                      {confirmDelete === account.id ? (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleDeleteAccount(account.id)}
                            disabled={deleting === account.id}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleting === account.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => setConfirmDelete(null)}
                            variant="outline"
                            size="sm"
                            className="border-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setConfirmDelete(account.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Editar Conta
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Jogo</label>
                <Input
                  type="text"
                  value={editForm.gameName}
                  onChange={(e) => setEditForm({ ...editForm, gameName: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 min-h-[120px]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <Button
                onClick={closeEditModal}
                variant="outline"
                className="border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
