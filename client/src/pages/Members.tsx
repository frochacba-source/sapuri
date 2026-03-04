import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Users, Search, Swords, Trophy, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface MemberForm {
  name: string;
  telegramId: string;
  telegramUsername: string;
  phoneNumber: string;
  participatesGvg: boolean;
  participatesGot: boolean;
  participatesReliquias: boolean;
}

const defaultMemberForm: MemberForm = {
  name: "",
  telegramId: "",
  telegramUsername: "",
  phoneNumber: "",
  participatesGvg: true,
  participatesGot: true,
  participatesReliquias: true,
};

export default function Members() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<(MemberForm & { id: number }) | null>(null);
  const [newMember, setNewMember] = useState<MemberForm>(defaultMemberForm);

  const utils = trpc.useUtils();
  const { data: members, isLoading } = trpc.members.list.useQuery();
  const { data: memberCount } = trpc.members.count.useQuery();
  
  const createMember = trpc.members.create.useMutation({
    onSuccess: () => {
      utils.members.list.invalidate();
      utils.members.count.invalidate();
      setIsAddOpen(false);
      setNewMember(defaultMemberForm);
      toast.success("Membro adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMember = trpc.members.update.useMutation({
    onSuccess: () => {
      utils.members.list.invalidate();
      setEditingMember(null);
      toast.success("Membro atualizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMember = trpc.members.delete.useMutation({
    onSuccess: () => {
      utils.members.list.invalidate();
      utils.members.count.invalidate();
      toast.success("Membro removido!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredMembers = members?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.telegramUsername?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    createMember.mutate({
      name: newMember.name.trim(),
      telegramId: newMember.telegramId.trim() || undefined,
      telegramUsername: newMember.telegramUsername.trim() || undefined,
      phoneNumber: newMember.phoneNumber.trim() || undefined,
      participatesGvg: newMember.participatesGvg,
      participatesGot: newMember.participatesGot,
      participatesReliquias: newMember.participatesReliquias,
    });
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    updateMember.mutate({
      id: editingMember.id,
      name: editingMember.name,
      telegramId: editingMember.telegramId || undefined,
      telegramUsername: editingMember.telegramUsername || undefined,
      phoneNumber: editingMember.phoneNumber || undefined,
      participatesGvg: editingMember.participatesGvg,
      participatesGot: editingMember.participatesGot,
      participatesReliquias: editingMember.participatesReliquias,
    });
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMember.mutate({ id, isActive });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Membros</h1>
            <p className="text-muted-foreground">
              {memberCount || 0} de 75 membros cadastrados
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button disabled={(memberCount || 0) >= 75}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Membro</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo membro da guilda
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Nome do jogador"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegramUsername">Username Telegram</Label>
                    <Input
                      id="telegramUsername"
                      placeholder="@username"
                      value={newMember.telegramUsername}
                      onChange={(e) => setNewMember({ ...newMember, telegramUsername: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegramId">ID Telegram (opcional)</Label>
                    <Input
                      id="telegramId"
                      placeholder="123456789"
                      value={newMember.telegramId}
                      onChange={(e) => setNewMember({ ...newMember, telegramId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Número WhatsApp (opcional)</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+55 11 99999-9999"
                      value={newMember.phoneNumber}
                      onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                    />
                  </div>
                  
                  {/* Participation Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <Label>Participa de:</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="new-gvg"
                          checked={newMember.participatesGvg}
                          onCheckedChange={(checked) => setNewMember({ ...newMember, participatesGvg: !!checked })}
                        />
                        <label htmlFor="new-gvg" className="flex items-center gap-2 text-sm cursor-pointer">
                          <Swords className="w-4 h-4 text-red-500" />
                          GvG
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="new-got"
                          checked={newMember.participatesGot}
                          onCheckedChange={(checked) => setNewMember({ ...newMember, participatesGot: !!checked })}
                        />
                        <label htmlFor="new-got" className="flex items-center gap-2 text-sm cursor-pointer">
                          <Trophy className="w-4 h-4 text-blue-500" />
                          GoT
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="new-reliquias"
                          checked={newMember.participatesReliquias}
                          onCheckedChange={(checked) => setNewMember({ ...newMember, participatesReliquias: !!checked })}
                        />
                        <label htmlFor="new-reliquias" className="flex items-center gap-2 text-sm cursor-pointer">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          Relíquias
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddMember} disabled={createMember.isPending}>
                    {createMember.isPending ? "Salvando..." : "Adicionar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou username..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredMembers && filteredMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telegram</TableHead>
                      <TableHead className="text-center">Eventos</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          {member.telegramUsername ? (
                            <span className="text-blue-500">@{member.telegramUsername}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            {member.participatesGvg && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                <Swords className="w-3 h-3" />
                              </Badge>
                            )}
                            {member.participatesGot && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                <Trophy className="w-3 h-3" />
                              </Badge>
                            )}
                            {member.participatesReliquias && (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                <Crown className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Switch
                              checked={member.isActive}
                              onCheckedChange={(checked) => handleToggleActive(member.id, checked)}
                            />
                          ) : (
                            <Badge variant={member.isActive ? "default" : "secondary"}>
                              {member.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingMember({
                                  id: member.id,
                                  name: member.name,
                                  telegramId: member.telegramId || "",
                                  telegramUsername: member.telegramUsername || "",
                                  phoneNumber: member.phoneNumber || "",
                                  participatesGvg: member.participatesGvg,
                                  participatesGot: member.participatesGot,
                                  participatesReliquias: member.participatesReliquias,
                                })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm(`Remover ${member.name}?`)) {
                                    deleteMember.mutate({ id: member.id });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum membro encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username Telegram</Label>
                  <Input
                    id="edit-username"
                    value={editingMember.telegramUsername || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, telegramUsername: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-id">ID Telegram</Label>
                  <Input
                    id="edit-id"
                    value={editingMember.telegramId || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, telegramId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Número WhatsApp</Label>
                  <Input
                    id="edit-phone"
                    placeholder="+55 11 99999-9999"
                    value={editingMember.phoneNumber || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })}
                  />
                </div>
                
                {/* Participation Checkboxes */}
                <div className="space-y-3 pt-2">
                  <Label>Participa de:</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit-gvg"
                        checked={editingMember.participatesGvg}
                        onCheckedChange={(checked) => setEditingMember({ ...editingMember, participatesGvg: !!checked })}
                      />
                      <label htmlFor="edit-gvg" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Swords className="w-4 h-4 text-red-500" />
                        GvG
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit-got"
                        checked={editingMember.participatesGot}
                        onCheckedChange={(checked) => setEditingMember({ ...editingMember, participatesGot: !!checked })}
                      />
                      <label htmlFor="edit-got" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        GoT
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit-reliquias"
                        checked={editingMember.participatesReliquias}
                        onCheckedChange={(checked) => setEditingMember({ ...editingMember, participatesReliquias: !!checked })}
                      />
                      <label htmlFor="edit-reliquias" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Relíquias
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateMember} disabled={updateMember.isPending}>
                {updateMember.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
