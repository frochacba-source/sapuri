'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Search, Send, Download, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


interface StrategyForm {
  name: string;
  observation?: string;
  attackFormation1: string;
  attackFormation2: string;
  attackFormation3: string;
  defenseFormation1: string;
  defenseFormation2: string;
  defenseFormation3: string;
}

export default function GotStrategiesPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedStrategies, setSelectedStrategies] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<StrategyForm>({
    name: '',
    attackFormation1: '',
    attackFormation2: '',
    attackFormation3: '',
    defenseFormation1: '',
    defenseFormation2: '',
    defenseFormation3: '',
  });

  const { data: strategies = [], isLoading, refetch } = trpc.gotStrategies.getAll.useQuery();
  const { data: exportData } = trpc.gotStrategies.export.useQuery();
  const { data: searchResults = [] } = trpc.gotStrategies.search.useQuery(
    { keyword: searchTerm },
    { enabled: searchTerm.length > 0 }
  );
  const createMutation = trpc.gotStrategies.create.useMutation();
  const updateMutation = trpc.gotStrategies.update.useMutation();
  const deleteMutation = trpc.gotStrategies.delete.useMutation();
  const sendToTelegramMutation = trpc.gotStrategies.sendToTelegram.useMutation();
  const importMutation = trpc.gotStrategies.import.useMutation();

  const filteredStrategies = searchTerm ? searchResults : strategies;

  const handleCreate = async () => {
    if (!formData.attackFormation1 || !formData.attackFormation2 || !formData.attackFormation3) {
      toast.error('Todos os cavaleiros de Ataque são obrigatórios');
      return;
    }
    if (!formData.defenseFormation1 || !formData.defenseFormation2 || !formData.defenseFormation3) {
      toast.error('Todos os cavaleiros de Defesa são obrigatórios');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        attackFormation1: formData.attackFormation1,
        attackFormation2: formData.attackFormation2,
        attackFormation3: formData.attackFormation3,
        defenseFormation1: formData.defenseFormation1,
        defenseFormation2: formData.defenseFormation2,
        defenseFormation3: formData.defenseFormation3,
      });
      toast.success('Estratégia criada com sucesso');
      setFormData({
        name: '',
        attackFormation1: '',
        attackFormation2: '',
        attackFormation3: '',
        defenseFormation1: '',
        defenseFormation2: '',
        defenseFormation3: '',
      });
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar estratégia';
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateMutation.mutateAsync({
        id,
        name: formData.name || undefined,
        observation: formData.observation || undefined,
        attackFormation1: formData.attackFormation1,
        attackFormation2: formData.attackFormation2,
        attackFormation3: formData.attackFormation3,
        defenseFormation1: formData.defenseFormation1,
        defenseFormation2: formData.defenseFormation2,
        defenseFormation3: formData.defenseFormation3,
      });
      toast.success('Estratégia atualizada com sucesso');
      setEditingId(null);
      setFormData({
        name: '',
        observation: '',
        attackFormation1: '',
        attackFormation2: '',
        attackFormation3: '',
        defenseFormation1: '',
        defenseFormation2: '',
        defenseFormation3: '',
      });
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar estratégia');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta estratégia?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Estratégia deletada com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar estratégia');
    }
  };

  const handleDuplicate = async (strategy: any) => {
    const newName = `${strategy.name} (Cópia)`;
    try {
      await createMutation.mutateAsync({
        name: newName,
        attackFormation1: strategy.attackFormation1,
        attackFormation2: strategy.attackFormation2,
        attackFormation3: strategy.attackFormation3,
        defenseFormation1: strategy.defenseFormation1,
        defenseFormation2: strategy.defenseFormation2,
        defenseFormation3: strategy.defenseFormation3,
        observation: strategy.observation,
      });
      toast.success('Estratégia duplicada com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao duplicar estratégia');
    }
  };

  const toggleStrategy = (id: number) => {
    const newSelected = new Set(selectedStrategies);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStrategies(newSelected);
  };

  const selectedStrategyList = strategies.filter((s) => selectedStrategies.has(s.id));

  const handleSendToTelegram = async () => {
    if (selectedStrategyList.length === 0) {
      toast.error('Selecione pelo menos uma estratégia');
      return;
    }

    try {
      await sendToTelegramMutation.mutateAsync({
        strategyIds: Array.from(selectedStrategies),
      });
      toast.success(`${selectedStrategyList.length} estratégia(s) enviada(s) para o Telegram!`);
      setSelectedStrategies(new Set());
      setShowPreview(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar para Telegram';
      toast.error(errorMessage);
    }
  };

  const handleExport = async () => {
    try {
      if (!exportData) {
        toast.error('Nenhuma estratégia para exportar');
        return;
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estrategias-got-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Estratégias exportadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar estratégias');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      await importMutation.mutateAsync({ fileContent });
      toast.success('Estratégias importadas com sucesso!');
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar estratégias';
      toast.error(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Estratégias GoT</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie formações 3x3 (Ataque x Defesa) para sugestões automáticas do Bot Telegram
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou cavaleiros (ex: Hades Seiya Zeus)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <p className="text-xs text-muted-foreground mt-1">Digite até 3 nomes separados por espaço</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={strategies.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="cursor-pointer">
              <Button
                variant="outline"
                className="gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Importar
                </span>
              </Button>
            </label>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Estratégia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Estratégia</DialogTitle>
                <DialogDescription>
                  Adicione uma nova formação 3x3 (Ataque x Defesa) com nomes de cavaleiros
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Estratégia</label>
                  <Input
                    placeholder="Ex: Hades vs Hades"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Ataque x Defesa Layout */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  {/* Ataque Column */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Ataque</label>
                    {[1, 2, 3].map((i) => (
                      <Input
                        key={`attack${i}`}
                        placeholder={`Cavaleiro ${i}`}
                        value={formData[`attackFormation${i}` as keyof StrategyForm]}
                        onChange={(e) => setFormData({ ...formData, [`attackFormation${i}`]: e.target.value })}
                        className="text-sm"
                      />
                    ))}
                  </div>

                  {/* X Column */}
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold text-muted-foreground">x</span>
                  </div>

                  {/* Defesa Column */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Defesa</label>
                    {[1, 2, 3].map((i) => (
                      <Input
                        key={`defense${i}`}
                        placeholder={`Cavaleiro ${i}`}
                        value={formData[`defenseFormation${i}` as keyof StrategyForm]}
                        onChange={(e) => setFormData({ ...formData, [`defenseFormation${i}`]: e.target.value })}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Criar Estratégia'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Selection and Send Actions */}
        {selectedStrategies.size > 0 && (
          <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm">
                  <strong>{selectedStrategies.size}</strong> estratégia(s) selecionada(s)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                  >
                    Visualizar
                  </Button>
                  <Button
                    onClick={handleSendToTelegram}
                    disabled={sendToTelegramMutation.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendToTelegramMutation.isPending ? 'Enviando...' : 'Enviar para Telegram'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedStrategies(new Set())}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategies Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando estratégias...</p>
          </div>
        ) : filteredStrategies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma estratégia encontrada com esses critérios' : 'Nenhuma estratégia cadastrada ainda'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStrategies.map((strategy) => (
              <Card
                key={strategy.id}
                className={`flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border ${
                  selectedStrategies.has(strategy.id)
                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950 border-purple-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => toggleStrategy(strategy.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 flex items-start gap-2 min-w-0">
                      <Checkbox
                        checked={selectedStrategies.has(strategy.id)}
                        onCheckedChange={() => toggleStrategy(strategy.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">
                          {strategy.name || '(sem nome)'}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => {
                          setEditingId(strategy.id);
                          setFormData({
                            name: strategy.name || "",
                            observation: strategy.observation || "",
                            attackFormation1: strategy.attackFormation1,
                            attackFormation2: strategy.attackFormation2,
                            attackFormation3: strategy.attackFormation3,
                            defenseFormation1: strategy.defenseFormation1,
                            defenseFormation2: strategy.defenseFormation2,
                            defenseFormation3: strategy.defenseFormation3,
                          });
                        }}
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => handleDuplicate(strategy)}
                        title="Duplicar"
                      >
                        📋
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600"
                        onClick={() => handleDelete(strategy.id)}
                        title="Deletar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 py-0">
                  {/* Formações 3x3 Compacto */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-red-700 dark:text-red-300 flex items-center gap-1">⚔️ Ataque</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{strategy.attackFormation1}</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{strategy.attackFormation2}</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{strategy.attackFormation3}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="font-bold text-sm text-slate-400">×</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">🛡️ Defesa</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{strategy.defenseFormation1}</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{strategy.defenseFormation2}</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{strategy.defenseFormation3}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Usada {strategy.usageCount}x</span>
                    <div className="flex gap-1">
                      <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">⚔️ Ataque</span>
                      <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">🛡️ Defesa</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingId !== null && (
          <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Estratégia</DialogTitle>
                <DialogDescription>
                  Edite o nome e os cavaleiros da estratégia
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Estratégia</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Hades vs Hades"
                  />
                </div>

                {/* Ataque x Defesa Layout */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  {/* Ataque Column */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Ataque</label>
                    {[1, 2, 3].map((i) => (
                      <Input
                        key={`attack${i}`}
                        placeholder={`Cavaleiro ${i}`}
                        value={formData[`attackFormation${i}` as keyof StrategyForm] as string}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`attackFormation${i}`]: e.target.value,
                          } as StrategyForm)
                        }
                      />
                    ))}
                  </div>

                  {/* VS Column */}
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold">⚔️</span>
                  </div>

                  {/* Defesa Column */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Defesa</label>
                    {[1, 2, 3].map((i) => (
                      <Input
                        key={`defense${i}`}
                        placeholder={`Cavaleiro ${i}`}
                        value={formData[`defenseFormation${i}` as keyof StrategyForm] as string}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`defenseFormation${i}`]: e.target.value,
                          } as StrategyForm)
                        }
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleUpdate(editingId)}
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Preview Dialog */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Prévia - Estratégias para Telegram</DialogTitle>
                <DialogDescription>
                  Confira como as estratégias serão enviadas para o Bot Telegram
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 bg-gray-50 dark:bg-slate-900 p-4 rounded-lg">
                {selectedStrategyList.map((strategy, index) => (
                  <div key={strategy.id} className="bg-white dark:bg-slate-800 p-4 rounded border">
                    <p className="font-bold mb-2">
                      {index + 1}. {strategy.name}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Ataque:</strong> {strategy.attackFormation1} • {strategy.attackFormation2} • {strategy.attackFormation3}
                    </p>
                    <p className="text-sm">
                      <strong>Defesa:</strong> {strategy.defenseFormation1} • {strategy.defenseFormation2} • {strategy.defenseFormation3}
                    </p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
