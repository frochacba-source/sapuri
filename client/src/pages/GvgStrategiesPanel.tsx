import React from 'react';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Search, Copy, Download, Upload } from 'lucide-react';
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
  attackFormation4: string;
  attackFormation5: string;
  defenseFormation1: string;
  defenseFormation2: string;
  defenseFormation3: string;
  defenseFormation4: string;
  defenseFormation5: string;
}

export default function GvgStrategiesPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<StrategyForm>({
    name: '',
    attackFormation1: '',
    attackFormation2: '',
    attackFormation3: '',
    attackFormation4: '',
    attackFormation5: '',
    defenseFormation1: '',
    defenseFormation2: '',
    defenseFormation3: '',
    defenseFormation4: '',
    defenseFormation5: '',
  });

  const { data: strategies = [], isLoading, refetch } = trpc.gvgStrategies.getAll.useQuery();
  const createMutation = trpc.gvgStrategies.create.useMutation();
  const updateMutation = trpc.gvgStrategies.update.useMutation();
  const deleteMutation = trpc.gvgStrategies.delete.useMutation();

  const filteredStrategies = searchTerm
    ? strategies.filter(
        (s: any) =>
          (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          s.attackFormation1.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.attackFormation2.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.attackFormation3.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.attackFormation4.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.attackFormation5.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.defenseFormation1.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.defenseFormation2.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.defenseFormation3.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.defenseFormation4.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.defenseFormation5.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : strategies;

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.attackFormation1 || !formData.attackFormation2 || !formData.attackFormation3 || !formData.attackFormation4 || !formData.attackFormation5) {
      toast.error('Todos os 5 cavaleiros de Ataque são obrigatórios');
      return;
    }
    if (!formData.defenseFormation1 || !formData.defenseFormation2 || !formData.defenseFormation3 || !formData.defenseFormation4 || !formData.defenseFormation5) {
      toast.error('Todos os 5 cavaleiros de Defesa são obrigatórios');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        observation: formData.observation,
        attackFormation1: formData.attackFormation1,
        attackFormation2: formData.attackFormation2,
        attackFormation3: formData.attackFormation3,
        attackFormation4: formData.attackFormation4,
        attackFormation5: formData.attackFormation5,
        defenseFormation1: formData.defenseFormation1,
        defenseFormation2: formData.defenseFormation2,
        defenseFormation3: formData.defenseFormation3,
        defenseFormation4: formData.defenseFormation4,
        defenseFormation5: formData.defenseFormation5,
      });
      toast.success('Estratégia criada com sucesso');
      setFormData({
        name: '',
        attackFormation1: '',
        attackFormation2: '',
        attackFormation3: '',
        attackFormation4: '',
        attackFormation5: '',
        defenseFormation1: '',
        defenseFormation2: '',
        defenseFormation3: '',
        defenseFormation4: '',
        defenseFormation5: '',
      });
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao criar estratégia');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        observation: formData.observation,
        attackFormation1: formData.attackFormation1,
        attackFormation2: formData.attackFormation2,
        attackFormation3: formData.attackFormation3,
        attackFormation4: formData.attackFormation4,
        attackFormation5: formData.attackFormation5,
        defenseFormation1: formData.defenseFormation1,
        defenseFormation2: formData.defenseFormation2,
        defenseFormation3: formData.defenseFormation3,
        defenseFormation4: formData.defenseFormation4,
        defenseFormation5: formData.defenseFormation5,
      });
      toast.success('Estratégia atualizada com sucesso');
      setEditingId(null);
      setFormData({
        name: '',
        attackFormation1: '',
        attackFormation2: '',
        attackFormation3: '',
        attackFormation4: '',
        attackFormation5: '',
        defenseFormation1: '',
        defenseFormation2: '',
        defenseFormation3: '',
        defenseFormation4: '',
        defenseFormation5: '',
      });
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar estratégia');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta estratégia?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Estratégia deletada com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar estratégia');
    }
  };

  const handleDuplicate = (strategy: any) => {
    setFormData({
      name: `${strategy.name} (cópia)`,
      observation: strategy.observation,
      attackFormation1: strategy.attackFormation1,
      attackFormation2: strategy.attackFormation2,
      attackFormation3: strategy.attackFormation3,
      attackFormation4: strategy.attackFormation4,
      attackFormation5: strategy.attackFormation5,
      defenseFormation1: strategy.defenseFormation1,
      defenseFormation2: strategy.defenseFormation2,
      defenseFormation3: strategy.defenseFormation3,
      defenseFormation4: strategy.defenseFormation4,
      defenseFormation5: strategy.defenseFormation5,
    });
    setEditingId(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = (strategy: any) => {
    setEditingId(strategy.id);
    setFormData({
      name: strategy.name,
      observation: strategy.observation,
      attackFormation1: strategy.attackFormation1,
      attackFormation2: strategy.attackFormation2,
      attackFormation3: strategy.attackFormation3,
      attackFormation4: strategy.attackFormation4,
      attackFormation5: strategy.attackFormation5,
      defenseFormation1: strategy.defenseFormation1,
      defenseFormation2: strategy.defenseFormation2,
      defenseFormation3: strategy.defenseFormation3,
      defenseFormation4: strategy.defenseFormation4,
      defenseFormation5: strategy.defenseFormation5,
    });
  };

  const handleExport = async () => {
    try {
      if (strategies.length === 0) {
        toast.error('Nenhuma estrategia para exportar');
        return;
      }
      const jsonString = JSON.stringify(strategies, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estrategias-gvg-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Estrategias exportadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar estrategias');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const fileContent = await file.text();
      const importedStrategies = JSON.parse(fileContent);
      for (const strategy of importedStrategies) {
        await createMutation.mutateAsync({
          name: strategy.name,
          observation: strategy.observation,
          attackFormation1: strategy.attackFormation1,
          attackFormation2: strategy.attackFormation2,
          attackFormation3: strategy.attackFormation3,
          attackFormation4: strategy.attackFormation4,
          attackFormation5: strategy.attackFormation5,
          defenseFormation1: strategy.defenseFormation1,
          defenseFormation2: strategy.defenseFormation2,
          defenseFormation3: strategy.defenseFormation3,
          defenseFormation4: strategy.defenseFormation4,
          defenseFormation5: strategy.defenseFormation5,
        });
      }
      toast.success(`${importedStrategies.length} estrategias importadas com sucesso!`);
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar estrategias';
      toast.error(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel de Estratégias GVG</h1>
            <p className="text-gray-400">Gerenciar estratégias 5x5 para Guerra dos Gigantes</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={strategies.length === 0}
              className="gap-2"
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
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: '',
                    attackFormation1: '',
                    attackFormation2: '',
                    attackFormation3: '',
                    attackFormation4: '',
                    attackFormation5: '',
                    defenseFormation1: '',
                    defenseFormation2: '',
                    defenseFormation3: '',
                    defenseFormation4: '',
                    defenseFormation5: '',
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Estratégia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Estratégia' : 'Nova Estratégia'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da estratégia 5x5 para Guerra dos Gigantes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Estratégia</label>
                  <Input
                    placeholder="Ex: Explosivo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Observação (opcional)</label>
                  <Input
                    placeholder="Ex: Contra defesa forte"
                    value={formData.observation || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, observation: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-red-400">
                      ⚔️ Ataque (5 cavaleiros)
                    </label>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Input
                        key={`a${i}`}
                        placeholder={`Cavaleiro ${i}`}
                        value={(formData as any)[`attackFormation${i}`]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`attackFormation${i}`]: e.target.value,
                          } as any)
                        }
                        className="mt-2"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-blue-400">
                      🛡️ Defesa (5 cavaleiros)
                    </label>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Input
                        key={`d${i}`}
                        placeholder={`Cavaleiro ${i}`}
                        value={(formData as any)[`defenseFormation${i}`]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`defenseFormation${i}`]: e.target.value,
                          } as any)
                        }
                        className="mt-2"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingId ? handleUpdate : handleCreate}
                  >
                    {editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-2">
          <Search className="w-5 h-5 text-gray-400 mt-3" />
          <Input
            placeholder="Buscar estratégias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Carregando estratégias...</div>
        ) : filteredStrategies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-400">Nenhuma estratégia GVG cadastrada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStrategies.map((strategy) => (
              <Card
                key={strategy.id}
                className="flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-semibold truncate">
                        {strategy.name || '(sem nome)'}
                      </CardTitle>
                      {strategy.observation && (
                        <CardDescription className="text-xs truncate mt-1">
                          {strategy.observation}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => {
                          openEditDialog(strategy);
                          setIsCreateOpen(true);
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
                        <Copy className="h-3.5 w-3.5" />
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
                  <div className="grid grid-cols-2 gap-1.5 p-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1">⚔️ Ataque</p>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <p key={`a${i}`} className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {(strategy as any)[`attackFormation${i}`]}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">🛡️ Defesa</p>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <p key={`d${i}`} className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {(strategy as any)[`defenseFormation${i}`]}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">GVG 5x5</span>
                    <div className="flex gap-1">
                      <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">⚔️</span>
                      <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">🛡️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
