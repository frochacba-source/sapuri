import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Edit2, Download, Upload } from 'lucide-react';

interface CardFormData {
  name: string;
  imageUrl?: string;
  referenceLink?: string;
  usageLimit: string;
  bonusDmg: string;
  bonusDef: string;
  bonusVid: string;
  bonusPress: string;
  bonusEsquiva: string;
  bonusVelAtaq: string;
  bonusTenacidade: string;
  bonusSanguessuga: string;
  bonusRedDano: string;
  bonusCrit: string;
  bonusDanoCritico: string;
  bonusDefPercent: string;
  bonusCura: string;
  bonusCuraRecebida: string;
  bonusPrecisao: string;
  bonusVida: string;
  skillEffect?: string;
}

const INITIAL_FORM_DATA: CardFormData = {
  name: '',
  imageUrl: '',
  referenceLink: '',
  usageLimit: 'Todos',
  bonusDmg: '0',
  bonusDef: '0',
  bonusVid: '0',
  bonusPress: '0',
  bonusEsquiva: '0',
  bonusVelAtaq: '0',
  bonusTenacidade: '0',
  bonusSanguessuga: '0',
  bonusRedDano: '0',
  bonusCrit: '0',
  bonusDanoCritico: '0',
  bonusDefPercent: '0',
  bonusCura: '0',
  bonusCuraRecebida: '0',
  bonusPrecisao: '0',
  bonusVida: '0',
  skillEffect: '',
};

export default function CardsPage() {
  const [formData, setFormData] = useState<CardFormData>(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Queries
  const { data: allCards = [], isLoading: isLoadingCards, refetch: refetchCards } = trpc.cards.list.useQuery();
  const { data: searchResults = [] } = trpc.cards.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Mutations
  const createCardMutation = trpc.cards.create.useMutation({
    onSuccess: () => {
      toast.success('Carta criada com sucesso!');
      setFormData(INITIAL_FORM_DATA);
      setIsDialogOpen(false);
      refetchCards();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar carta');
    },
  });

  const updateCardMutation = trpc.cards.update.useMutation({
    onSuccess: () => {
      toast.success('Carta atualizada com sucesso!');
      setFormData(INITIAL_FORM_DATA);
      setEditingId(null);
      setIsDialogOpen(false);
      refetchCards();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar carta');
    },
  });

  const deleteCardMutation = trpc.cards.delete.useMutation({
    onSuccess: () => {
      toast.success('Carta deletada com sucesso!');
      refetchCards();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao deletar carta');
    },
  });

  const exportCardsMutation = trpc.cards.export.useQuery();
  const importCardsMutation = trpc.cards.import.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.importedCount} cartas importadas com sucesso!`);
      refetchCards();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao importar cartas');
    },
  });

  const displayCards = searchQuery ? searchResults : allCards;

  const handleFormChange = (field: keyof CardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da carta é obrigatório');
      return;
    }

    if (editingId) {
      updateCardMutation.mutate({ id: editingId, ...formData });
    } else {
      createCardMutation.mutate(formData);
    }
  };

  const handleEdit = (card: any) => {
    setFormData({
      name: card.name || '',
      imageUrl: card.imageUrl || '',
      referenceLink: card.referenceLink || '',
      usageLimit: card.usageLimit || 'Todos',
      bonusDmg: String(card.bonusDmg ?? '0'),
      bonusDef: String(card.bonusDef ?? '0'),
      bonusVid: String(card.bonusVid ?? '0'),
      bonusPress: String(card.bonusPress ?? '0'),
      bonusEsquiva: String(card.bonusEsquiva ?? '0'),
      bonusVelAtaq: String(card.bonusVelAtaq ?? '0'),
      bonusTenacidade: String(card.bonusTenacidade ?? '0'),
      bonusSanguessuga: String(card.bonusSanguessuga ?? '0'),
      bonusRedDano: String(card.bonusRedDano ?? '0'),
      bonusCrit: String(card.bonusCrit ?? '0'),
      bonusCura: String(card.bonusCura ?? '0'),
      bonusCuraRecebida: String(card.bonusCuraRecebida ?? '0'),
      bonusPrecisao: String(card.bonusPrecisao ?? '0'),
      bonusVida: String(card.bonusVida ?? '0'),
      skillEffect: card.skillEffect || '',
    });
    setEditingId(card.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta carta?')) {
      deleteCardMutation.mutate({ id });
    }
  };

  const handleExport = () => {
    if (exportCardsMutation.data?.data) {
      const element = document.createElement('a');
      const file = new Blob([exportCardsMutation.data.data], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `cartas-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Cartas exportadas com sucesso!');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const jsonData = event.target.result;
            importCardsMutation.mutate({ jsonData });
          } catch (error) {
            toast.error('Arquivo JSON inválido');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Cartas</h1>
            <p className="text-muted-foreground mt-2">Gerencie as cartas do jogo com seus atributos e efeitos</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleImport} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Carta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Carta' : 'Criar Nova Carta'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome da Carta *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Ex: Carta de Poder"
                    />
                  </div>

                  {/* URL da Imagem */}
                  <div>
                    <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  {/* Link de Referência */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Link de Referência</label>
                    <Input
                      value={formData.referenceLink}
                      onChange={(e) => handleFormChange('referenceLink', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  {/* Limite de Uso */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Limite de Uso *</label>
                    <Input
                      value={formData.usageLimit}
                      onChange={(e) => handleFormChange('usageLimit', e.target.value)}
                      placeholder="Ex: Todos, Leão|Fênix, etc"
                    />
                  </div>

                  {/* Bônus de Atributos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">DMG %</label>
                      <Input
                        type="number"
                        value={formData.bonusDmg}
                        onChange={(e) => handleFormChange('bonusDmg', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Defesa %</label>
                      <Input
                        type="number"
                        value={formData.bonusDef}
                        onChange={(e) => handleFormChange('bonusDef', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Resistência %</label>
                      <Input
                        type="number"
                        value={formData.bonusVid}
                        onChange={(e) => handleFormChange('bonusVid', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pressa</label>
                      <Input
                        type="number"
                        value={formData.bonusPress}
                        onChange={(e) => handleFormChange('bonusPress', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Esquiva %</label>
                      <Input
                        type="number"
                        value={formData.bonusEsquiva}
                        onChange={(e) => handleFormChange('bonusEsquiva', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vel. Ataque %</label>
                      <Input
                        type="number"
                        value={formData.bonusVelAtaq}
                        onChange={(e) => handleFormChange('bonusVelAtaq', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tenacidade</label>
                      <Input
                        type="number"
                        value={formData.bonusTenacidade}
                        onChange={(e) => handleFormChange('bonusTenacidade', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sanguessuga</label>
                      <Input
                        type="number"
                        value={formData.bonusSanguessuga}
                        onChange={(e) => handleFormChange('bonusSanguessuga', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Red Dano %</label>
                      <Input
                        type="number"
                        value={formData.bonusRedDano}
                        onChange={(e) => handleFormChange('bonusRedDano', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tax Crit</label>
                      <Input
                        type="number"
                        value={formData.bonusCrit}
                        onChange={(e) => handleFormChange('bonusCrit', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dano Crítico</label>
                      <Input
                        type="number"
                        value={formData.bonusDanoCritico}
                        onChange={(e) => handleFormChange('bonusDanoCritico', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bôn. Def (%)</label>
                      <Input
                        type="number"
                        value={formData.bonusDefPercent}
                        onChange={(e) => handleFormChange('bonusDefPercent', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cura %</label>
                      <Input
                        type="number"
                        value={formData.bonusCura}
                        onChange={(e) => handleFormChange('bonusCura', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cura Recebida %</label>
                      <Input
                        type="number"
                        value={formData.bonusCuraRecebida}
                        onChange={(e) => handleFormChange('bonusCuraRecebida', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Precisão</label>
                      <Input
                        type="number"
                        value={formData.bonusPrecisao}
                        onChange={(e) => handleFormChange('bonusPrecisao', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bôn. Vida (%)</label>
                      <Input
                        type="number"
                        value={formData.bonusVida}
                        onChange={(e) => handleFormChange('bonusVida', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Efeito da Habilidade */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Efeito da Habilidade</label>
                    <Textarea
                      value={formData.skillEffect}
                      onChange={(e) => handleFormChange('skillEffect', e.target.value)}
                      placeholder="Descrição do efeito especial..."
                      rows={3}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={createCardMutation.isPending || updateCardMutation.isPending}
                    >
                      {(createCardMutation.isPending || updateCardMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingId ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Buscar cartas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingCards ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayCards.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhuma carta encontrada
            </div>
          ) : (
            displayCards.map((card: any) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(card)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(card.id)}
                        disabled={deleteCardMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  )}

                  <div className="text-sm space-y-1">
                    <p><strong>Limite:</strong> {card.usageLimit}</p>
                    {card.skillEffect && (
                      <p><strong>Efeito:</strong> {card.skillEffect}</p>
                    )}
                  </div>

                  {/* Atributos */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {card.bonusDmg !== '0' && <p>DMG: +{card.bonusDmg}%</p>}
                    {card.bonusDef !== '0' && <p>Def: +{card.bonusDef}%</p>}
                    {card.bonusVid !== '0' && <p>Vid: +{card.bonusVid}%</p>}
                    {card.bonusPress !== '0' && <p>Press: +{card.bonusPress}</p>}
                    {card.bonusEsquiva !== '0' && <p>Esq: +{card.bonusEsquiva}%</p>}
                    {card.bonusVelAtaq !== '0' && <p>V.Atq: +{card.bonusVelAtaq}%</p>}
                    {card.bonusTenacidade !== '0' && <p>Ten: +{card.bonusTenacidade}</p>}
                    {card.bonusSanguessuga !== '0' && <p>Sang: +{card.bonusSanguessuga}</p>}
                    {card.bonusRedDano !== '0' && <p>RedDano: +{card.bonusRedDano}%</p>}
                    {card.bonusCrit !== '0' && <p>Crit: +{card.bonusCrit}</p>}
                  </div>

                  {card.referenceLink && (
                    <a
                      href={card.referenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Ver referência →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
