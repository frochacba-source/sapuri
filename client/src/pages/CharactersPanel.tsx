'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus, Search, Download, Upload } from 'lucide-react';

interface Character {
  id: number;
  name: string;
  class?: string;
  type?: string;
  hp?: number;
  atk?: number;
  def?: number;
  cosmos_gain_atk?: number;
  cosmos_gain_dmg?: number;
  dano_percent?: number;
  defesa_percent?: number;
  resistencia?: number;
  pressa?: number;
  esquiva_percent?: number;
  vel_ataque_percent?: number;
  tenacidade?: number;
  sanguessuga?: number;
  dano_vermelho_percent?: number;
  tax_critico?: number;
  precisao?: number;
  cura_percent?: number;
  cura_recebida_percent?: number;
  bonus_vida_percent?: number;
  red_dano_percent?: number;
  esquiva_valor?: number;
  efeito_habilidade?: string;
  image_url?: string;
  ssloj_url?: string;
  skills?: Array<{ skill_name: string; description: string }>;
}

export function CharactersPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Character>>({});
  const [activeTab, setActiveTab] = useState('basico');

  // Queries
  const { data: allCharacters, isLoading, refetch } = trpc.characters.list.useQuery();
  const { data: searchResults } = trpc.characters.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const { data: classResults } = trpc.characters.getByClass.useQuery(
    { class: selectedClass },
    { enabled: selectedClass.length > 0 }
  );
  const { data: typeResults } = trpc.characters.getByType.useQuery(
    { type: selectedType },
    { enabled: selectedType.length > 0 }
  );

  // Mutations
  const createMutation = trpc.characters.create.useMutation({
    onSuccess: () => {
      toast.success('Personagem criado com sucesso!');
      setIsCreateDialogOpen(false);
      setFormData({});
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = trpc.characters.update.useMutation({
    onSuccess: () => {
      toast.success('Personagem atualizado com sucesso!');
      setEditingId(null);
      setFormData({});
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = trpc.characters.delete.useMutation({
    onSuccess: () => {
      toast.success('Personagem deletado com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const exportMutation = trpc.characters.export.useQuery();
  const importMutation = trpc.characters.import.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.importedCount} personagens importados com sucesso!`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
  });

  // Determine which characters to display
  let displayCharacters: Character[] = [];
  if (searchQuery && searchResults?.data) {
    displayCharacters = searchResults.data;
  } else if (selectedClass && classResults?.data) {
    displayCharacters = classResults.data;
  } else if (selectedType && typeResults?.data) {
    displayCharacters = typeResults.data;
  } else if (allCharacters?.data) {
    displayCharacters = allCharacters.data;
  }

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }
    await createMutation.mutateAsync({
      name: formData.name,
      class: formData.class,
      type: formData.type,
      hp: formData.hp,
      atk: formData.atk,
      def: formData.def,
      cosmos_gain_atk: formData.cosmos_gain_atk,
      cosmos_gain_dmg: formData.cosmos_gain_dmg,
      dano_percent: formData.dano_percent,
      defesa_percent: formData.defesa_percent,
      resistencia: formData.resistencia,
      pressa: formData.pressa,
      esquiva_percent: formData.esquiva_percent,
      vel_ataque_percent: formData.vel_ataque_percent,
      tenacidade: formData.tenacidade,
      sanguessuga: formData.sanguessuga,
      dano_vermelho_percent: formData.dano_vermelho_percent,
      tax_critico: formData.tax_critico,
      precisao: formData.precisao,
      cura_percent: formData.cura_percent,
      cura_recebida_percent: formData.cura_recebida_percent,
      bonus_vida_percent: formData.bonus_vida_percent,
      red_dano_percent: formData.red_dano_percent,
      esquiva_valor: formData.esquiva_valor,
      efeito_habilidade: formData.efeito_habilidade,
      image_url: formData.image_url,
      ssloj_url: formData.ssloj_url,
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await updateMutation.mutateAsync({
      id: editingId,
      name: formData.name,
      class: formData.class,
      type: formData.type,
      hp: formData.hp,
      atk: formData.atk,
      def: formData.def,
      cosmos_gain_atk: formData.cosmos_gain_atk,
      cosmos_gain_dmg: formData.cosmos_gain_dmg,
      dano_percent: formData.dano_percent,
      defesa_percent: formData.defesa_percent,
      resistencia: formData.resistencia,
      pressa: formData.pressa,
      esquiva_percent: formData.esquiva_percent,
      vel_ataque_percent: formData.vel_ataque_percent,
      tenacidade: formData.tenacidade,
      sanguessuga: formData.sanguessuga,
      dano_vermelho_percent: formData.dano_vermelho_percent,
      tax_critico: formData.tax_critico,
      precisao: formData.precisao,
      cura_percent: formData.cura_percent,
      cura_recebida_percent: formData.cura_recebida_percent,
      bonus_vida_percent: formData.bonus_vida_percent,
      red_dano_percent: formData.red_dano_percent,
      esquiva_valor: formData.esquiva_valor,
      efeito_habilidade: formData.efeito_habilidade,
      image_url: formData.image_url,
      ssloj_url: formData.ssloj_url,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este personagem?')) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleExport = () => {
    if (exportMutation.data?.data) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportMutation.data.data));
      element.setAttribute('download', `characters-${new Date().toISOString().split('T')[0]}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Personagens exportados com sucesso!');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        importMutation.mutate({ jsonData });
      } catch (error) {
        toast.error('Erro ao ler arquivo JSON');
      }
    };
    reader.readAsText(file);
  };

  const openEditDialog = (character: Character) => {
    setFormData(character);
    setEditingId(character.id);
    setActiveTab('basico');
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingId(null);
    setFormData({});
    setActiveTab('basico');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personagens</h1>
          <p className="text-muted-foreground">Gerencie os cavaleiros do jogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Personagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Personagem' : 'Novo Personagem'}</DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basico">Informações</TabsTrigger>
                  <TabsTrigger value="habilidades">Habilidades</TabsTrigger>
                </TabsList>

                {/* TAB: BÁSICO */}
                <TabsContent value="basico" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome *</label>
                      <Input
                        placeholder="Nome do cavaleiro"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <Input
                        placeholder="Ex: Luz, Fogo, Água..."
                        value={formData.type || ''}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Classe</label>
                      <Input
                        placeholder="Ex: Protetor, Guerreiro..."
                        value={formData.class || ''}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL da Imagem</label>
                      <Input
                        placeholder="https://..."
                        value={formData.image_url || ''}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Estatísticas Principais */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Estatísticas Principais</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium">PV</label>
                        <Input
                          type="number"
                          placeholder="HP"
                          value={formData.hp || ''}
                          onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">ATQ</label>
                        <Input
                          type="number"
                          placeholder="ATK"
                          value={formData.atk || ''}
                          onChange={(e) => setFormData({ ...formData, atk: parseInt(e.target.value) || 0 })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">DEF</label>
                        <Input
                          type="number"
                          placeholder="DEF"
                          value={formData.def || ''}
                          onChange={(e) => setFormData({ ...formData, def: parseInt(e.target.value) || 0 })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ganho de Cosmos */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Ganho de Cosmos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Ganho Cosmos (ATQ)</label>
                        <Input
                          type="number"
                          placeholder="ATQ"
                          value={formData.cosmos_gain_atk || ''}
                          onChange={(e) => setFormData({ ...formData, cosmos_gain_atk: parseInt(e.target.value) || 0 })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Ganho Cosmos (DANO)</label>
                        <Input
                          type="number"
                          placeholder="DANO"
                          value={formData.cosmos_gain_dmg || ''}
                          onChange={(e) => setFormData({ ...formData, cosmos_gain_dmg: parseInt(e.target.value) || 0 })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">URL SSLOJ</label>
                    <Input
                      placeholder="https://..."
                      value={formData.ssloj_url || ''}
                      onChange={(e) => setFormData({ ...formData, ssloj_url: e.target.value })}
                    />
                  </div>
                </TabsContent>

                {/* TAB: HABILIDADES */}
                <TabsContent value="habilidades" className="space-y-4">
                  <div className="space-y-4">
                    {Array.isArray(formData.skills) && formData.skills.length > 0 ? (
                      formData.skills.map((skill: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-muted/30 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <label className="text-sm font-medium">Nome da Habilidade</label>
                              <Input
                                placeholder="Ex: Linha de marionetes..."
                                value={skill.skill_name || ''}
                                onChange={(e) => {
                                  const newSkills = [...formData.skills!];
                                  newSkills[index].skill_name = e.target.value;
                                  setFormData({ ...formData, skills: newSkills });
                                }}
                                className="text-sm"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newSkills = formData.skills!.filter((_: any, i: number) => i !== index);
                                setFormData({ ...formData, skills: newSkills });
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Descrição</label>
                            <Textarea
                              placeholder="Descreva os efeitos da habilidade em diferentes níveis..."
                              value={skill.description || ''}
                              onChange={(e) => {
                                const newSkills = [...formData.skills!];
                                newSkills[index].description = e.target.value;
                                setFormData({ ...formData, skills: newSkills });
                              }}
                              rows={4}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma habilidade adicionada ainda</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSkills = [
                        ...(formData.skills || []),
                        { skill_name: '', description: '' },
                      ];
                      setFormData({ ...formData, skills: newSkills });
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Habilidade
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Buscar personagem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
          icon={<Search className="h-4 w-4" />}
        />
        <Input
          placeholder="Filtrar por classe..."
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Filtrar por tipo..."
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Carregando...</div>
        ) : displayCharacters.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhum personagem encontrado
          </div>
        ) : (
          displayCharacters.map((character: Character) => (
            <Card key={character.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {character.type} • {character.class}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(character)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(character.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {character.image_url && (
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <p className="font-semibold">PV</p>
                    <p>{character.hp?.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="font-semibold">ATQ</p>
                    <p>{character.atk?.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="font-semibold">DEF</p>
                    <p>{character.def?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <p className="font-semibold">Cosmos ATQ</p>
                    <p>{character.cosmos_gain_atk}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <p className="font-semibold">Cosmos DMG</p>
                    <p>{character.cosmos_gain_dmg}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
