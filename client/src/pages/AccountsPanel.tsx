import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  Gamepad2,
  Users,
  Settings,
  Save,
  RefreshCw,
  User,
  Phone,
  Mail,
  FileText,
  Info,
  Eye,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

interface Account {
  id: string;
  gameName: string;
  price: number;
  description: string;
  images: string[];
  createdAt: number;
  // Informações do vendedor (controle interno)
  sellerName?: string;
  sellerContact?: string;
  sellerEmail?: string;
  sellerNotes?: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  intervalMinutes: number;
  sendToWhatsApp: boolean;
  selectedGroups: string[];
  // Configuração de horário
  sendStartHour?: number;
  sendEndHour?: number;
  timezone?: string;
  currentHour?: number;
  isWithinSendingHours?: boolean;
  sendingHoursMessage?: string;
}

interface WhatsAppGroup {
  id: string;
  name: string;
  participantCount: number;
  selected: boolean;
}

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({
    isRunning: false,
    intervalMinutes: 60,
    sendToWhatsApp: true,
    selectedGroups: [],
    sendStartHour: 8,
    sendEndHour: 22,
    timezone: 'America/Sao_Paulo',
  });
  
  // Estado para formulário de horário
  const [scheduleHoursForm, setScheduleHoursForm] = useState({
    startHour: 8,
    endHour: 22,
  });
  const [savingHours, setSavingHours] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  // Estados de loading para ações individuais
  const [sendingTelegram, setSendingTelegram] = useState<string | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Estados para seleção de grupos
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [savingGroups, setSavingGroups] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Estado do modal de edição
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({
    gameName: '',
    price: '',
    description: '',
    sellerName: '',
    sellerContact: '',
    sellerEmail: '',
    sellerNotes: '',
  });
  const [saving, setSaving] = useState(false);

  // Estado do modal de detalhes do vendedor
  const [viewingSellerInfo, setViewingSellerInfo] = useState<Account | null>(null);

  // Confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    gameName: '',
    price: '',
    description: '',
    images: [] as File[],
    sellerName: '',
    sellerContact: '',
    sellerEmail: '',
    sellerNotes: '',
  });

  // Carregar contas, status do scheduler e grupos
  useEffect(() => {
    loadAccounts();
    loadSchedulerStatus();
    loadWhatsAppGroups();
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
        setSelectedGroupIds(data.selectedGroups || []);
        // Atualizar formulário de horário com valores salvos
        setScheduleHoursForm({
          startHour: data.sendStartHour ?? 8,
          endHour: data.sendEndHour ?? 22,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar status do scheduler:', error);
    }
  };
  
  // Salvar configuração de horário
  const handleSaveScheduleHours = async () => {
    setSavingHours(true);
    try {
      // Validar horários
      if (scheduleHoursForm.startHour === scheduleHoursForm.endHour) {
        const confirm = window.confirm(
          'Se o horário de início for igual ao de fim, os envios automáticos serão DESABILITADOS. Deseja continuar?'
        );
        if (!confirm) {
          setSavingHours(false);
          return;
        }
      }
      
      const response = await fetch('/api/accounts/schedule-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startHour: scheduleHoursForm.startHour,
          endHour: scheduleHoursForm.endHour,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        showMessage(data.message || 'Horário salvo com sucesso!', 'success');
        loadSchedulerStatus(); // Recarregar status
      } else {
        const error = await response.json();
        showMessage(error.error || 'Erro ao salvar horário', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      showMessage('Erro ao salvar horário', 'error');
    } finally {
      setSavingHours(false);
    }
  };

  const loadWhatsAppGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch('/api/accounts/groups');
      if (response.ok) {
        const data = await response.json();
        setWhatsappGroups(data.whatsapp || []);
        // Atualizar selectedGroupIds com os grupos selecionados
        const selected = (data.whatsapp || [])
          .filter((g: WhatsAppGroup) => g.selected)
          .map((g: WhatsAppGroup) => g.id);
        if (selected.length > 0) {
          setSelectedGroupIds(selected);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectAllGroups = () => {
    setSelectedGroupIds(whatsappGroups.map(g => g.id));
  };

  const deselectAllGroups = () => {
    setSelectedGroupIds([]);
  };

  const saveSelectedGroups = async () => {
    setSavingGroups(true);
    try {
      const response = await fetch('/api/accounts/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupIds: selectedGroupIds }),
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(`✅ ${data.message}`, 'success');
        loadSchedulerStatus();
      } else {
        showMessage('❌ Erro ao salvar grupos', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar grupos:', error);
      showMessage('❌ Erro ao salvar grupos', 'error');
    } finally {
      setSavingGroups(false);
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
      
      // Adicionar campos do vendedor (controle interno)
      if (formData.sellerName) formDataToSend.append('sellerName', formData.sellerName);
      if (formData.sellerContact) formDataToSend.append('sellerContact', formData.sellerContact);
      if (formData.sellerEmail) formDataToSend.append('sellerEmail', formData.sellerEmail);
      if (formData.sellerNotes) formDataToSend.append('sellerNotes', formData.sellerNotes);

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
          sellerName: '',
          sellerContact: '',
          sellerEmail: '',
          sellerNotes: '',
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
      sellerName: account.sellerName || '',
      sellerContact: account.sellerContact || '',
      sellerEmail: account.sellerEmail || '',
      sellerNotes: account.sellerNotes || '',
    });
  };

  // Fechar modal de edição
  const closeEditModal = () => {
    setEditingAccount(null);
    setEditForm({ gameName: '', price: '', description: '', sellerName: '', sellerContact: '', sellerEmail: '', sellerNotes: '' });
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
          sellerName: editForm.sellerName,
          sellerContact: editForm.sellerContact,
          sellerEmail: editForm.sellerEmail,
          sellerNotes: editForm.sellerNotes,
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

              {/* Seção do Vendedor - Controle Interno */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                  <User className="w-4 h-4" />
                  Informações do Vendedor (Controle Interno)
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Esses dados são apenas para controle interno e NÃO serão enviados nas mensagens.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">
                      <User className="w-3 h-3 inline mr-1" />
                      Nome do Vendedor
                    </label>
                    <Input
                      type="text"
                      placeholder="Nome do vendedor"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Contato/WhatsApp
                    </label>
                    <Input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={formData.sellerContact}
                      onChange={(e) => setFormData({ ...formData, sellerContact: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1 text-gray-400">
                    <Mail className="w-3 h-3 inline mr-1" />
                    Email (opcional)
                  </label>
                  <Input
                    type="email"
                    placeholder="vendedor@email.com"
                    value={formData.sellerEmail}
                    onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-sm"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1 text-gray-400">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Observações (opcional)
                  </label>
                  <Textarea
                    placeholder="Notas internas sobre o vendedor ou a conta..."
                    value={formData.sellerNotes}
                    onChange={(e) => setFormData({ ...formData, sellerNotes: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-sm min-h-[60px]"
                  />
                </div>
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

        {/* Configuração de Horário de Envio */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Horário de Envio Automático
            </CardTitle>
            <CardDescription>Configure o período em que os anúncios automáticos serão enviados (Horário de Brasília)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status do Horário */}
            <div className={`p-3 rounded-lg border ${
              schedulerStatus.isWithinSendingHours 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {schedulerStatus.isWithinSendingHours ? (
                  <>
                    <Sun className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Dentro do horário de envio</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Fora do horário de envio</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Configurado: {schedulerStatus.sendStartHour?.toString().padStart(2, '0') || '08'}:00 às {schedulerStatus.sendEndHour?.toString().padStart(2, '0') || '22'}:00 
                {' '}| Hora atual em Brasília: {schedulerStatus.currentHour?.toString().padStart(2, '0') || '--'}:00
              </p>
            </div>

            {/* Formulário de Horário */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Hora de Início
                </label>
                <select
                  value={scheduleHoursForm.startHour}
                  onChange={(e) => setScheduleHoursForm({
                    ...scheduleHoursForm,
                    startHour: parseInt(e.target.value)
                  })}
                  className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Moon className="w-4 h-4 text-blue-400" />
                  Hora de Fim
                </label>
                <select
                  value={scheduleHoursForm.endHour}
                  onChange={(e) => setScheduleHoursForm({
                    ...scheduleHoursForm,
                    endHour: parseInt(e.target.value)
                  })}
                  className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aviso sobre horário igual */}
            {scheduleHoursForm.startHour === scheduleHoursForm.endHour && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Horário de início igual ao fim desabilita o envio automático
                </p>
              </div>
            )}

            {/* Info e Botão Salvar */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                🌎 Horário de Brasília (GMT-3) • Horário que cruza meia-noite é suportado (ex: 22h às 6h)
              </p>
              <Button
                onClick={handleSaveScheduleHours}
                disabled={savingHours}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {savingHours ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Horário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seleção de Grupos WhatsApp */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Configurar Grupos WhatsApp
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadWhatsAppGroups}
                disabled={loadingGroups}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                {loadingGroups ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Selecione os grupos que receberão os anúncios de contas. Se nenhum grupo for selecionado, os anúncios serão enviados para todos os grupos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingGroups ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-green-400" />
              <span className="ml-2 text-gray-400">Carregando grupos...</span>
            </div>
          ) : whatsappGroups.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum grupo disponível</p>
              <p className="text-gray-500 text-sm mt-1">
                Conecte o WhatsApp para ver os grupos disponíveis
              </p>
            </div>
          ) : (
            <>
              {/* Botões de seleção rápida */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={selectAllGroups}
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-400 hover:bg-green-600/20"
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    onClick={deselectAllGroups}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    Limpar Seleção
                  </Button>
                </div>
                <span className="text-sm text-gray-400">
                  {selectedGroupIds.length} de {whatsappGroups.length} selecionados
                </span>
              </div>

              {/* Lista de grupos */}
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                {whatsappGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => toggleGroupSelection(group.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedGroupIds.includes(group.id)
                        ? 'bg-green-900/30 border-green-600'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        selectedGroupIds.includes(group.id)
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-500'
                      }`}>
                        {selectedGroupIds.includes(group.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{group.name}</p>
                        <p className="text-xs text-gray-400">
                          {group.participantCount} participantes
                        </p>
                      </div>
                    </div>
                    <MessageCircle className={`w-5 h-5 ${
                      selectedGroupIds.includes(group.id)
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }`} />
                  </div>
                ))}
              </div>

              {/* Botão Salvar */}
              <div className="pt-3 border-t border-gray-700">
                <Button
                  onClick={saveSelectedGroups}
                  disabled={savingGroups}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {savingGroups ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configuração de Grupos
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {selectedGroupIds.length === 0
                    ? 'Com nenhum grupo selecionado, os anúncios serão enviados para TODOS os grupos'
                    : `Anúncios serão enviados apenas para os ${selectedGroupIds.length} grupo(s) selecionado(s)`
                  }
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
                      
                      {/* Informações do Vendedor */}
                      {(account.sellerName || account.sellerContact) && (
                        <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-400 text-xs">
                              <User className="w-3 h-3" />
                              <span className="font-medium">{account.sellerName || 'Vendedor'}</span>
                              {account.sellerContact && (
                                <>
                                  <span className="text-amber-600">•</span>
                                  <Phone className="w-3 h-3" />
                                  <span>{account.sellerContact}</span>
                                </>
                              )}
                            </div>
                            <Button
                              onClick={() => setViewingSellerInfo(account)}
                              variant="ghost"
                              size="sm"
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 h-6 px-2"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver mais
                            </Button>
                          </div>
                        </div>
                      )}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg my-4">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Editar Conta
              </h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
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

              {/* Seção do Vendedor - Controle Interno */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                  <User className="w-4 h-4" />
                  Informações do Vendedor (Controle Interno)
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">Nome do Vendedor</label>
                    <Input
                      type="text"
                      placeholder="Nome do vendedor"
                      value={editForm.sellerName}
                      onChange={(e) => setEditForm({ ...editForm, sellerName: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">Contato/WhatsApp</label>
                    <Input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={editForm.sellerContact}
                      onChange={(e) => setEditForm({ ...editForm, sellerContact: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1 text-gray-400">Email (opcional)</label>
                  <Input
                    type="email"
                    placeholder="vendedor@email.com"
                    value={editForm.sellerEmail}
                    onChange={(e) => setEditForm({ ...editForm, sellerEmail: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-sm"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1 text-gray-400">Observações (opcional)</label>
                  <Textarea
                    placeholder="Notas internas..."
                    value={editForm.sellerNotes}
                    onChange={(e) => setEditForm({ ...editForm, sellerNotes: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-sm min-h-[60px]"
                  />
                </div>
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

      {/* Modal de Informações do Vendedor */}
      {viewingSellerInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-amber-700/50 w-full max-w-md">
            <div className="p-6 border-b border-amber-700/30 bg-amber-900/20">
              <h2 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                <User className="w-5 h-5" />
                Informações do Vendedor
              </h2>
              <p className="text-xs text-amber-500/70 mt-1">
                Dados de controle interno - Não enviados nas mensagens
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Conta</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    {viewingSellerInfo.gameName}
                  </p>
                </div>
                
                {viewingSellerInfo.sellerName && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Nome do Vendedor</p>
                    <p className="text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400" />
                      {viewingSellerInfo.sellerName}
                    </p>
                  </div>
                )}
                
                {viewingSellerInfo.sellerContact && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Contato/WhatsApp</p>
                    <p className="text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      {viewingSellerInfo.sellerContact}
                    </p>
                  </div>
                )}
                
                {viewingSellerInfo.sellerEmail && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      {viewingSellerInfo.sellerEmail}
                    </p>
                  </div>
                )}
                
                {viewingSellerInfo.sellerNotes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Observações</p>
                    <p className="text-gray-300 text-sm bg-gray-700/50 rounded p-2 mt-1">
                      {viewingSellerInfo.sellerNotes}
                    </p>
                  </div>
                )}
                
                {!viewingSellerInfo.sellerName && !viewingSellerInfo.sellerContact && !viewingSellerInfo.sellerEmail && !viewingSellerInfo.sellerNotes && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma informação do vendedor cadastrada
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <Button
                onClick={() => setViewingSellerInfo(null)}
                variant="outline"
                className="border-gray-600"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  openEditModal(viewingSellerInfo);
                  setViewingSellerInfo(null);
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
