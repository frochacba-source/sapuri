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
import { Plus, Pencil, Trash2, Shield, Swords, Trophy, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface SubAdminForm {
  name: string;
  username: string;
  password: string;
  canManageGvg: boolean;
  canManageGot: boolean;
  canManageReliquias: boolean;
}

const defaultForm: SubAdminForm = {
  name: "",
  username: "",
  password: "",
  canManageGvg: false,
  canManageGot: false,
  canManageReliquias: false,
};

export default function SubAdmins() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<(SubAdminForm & { id: number }) | null>(null);
  const [newAdmin, setNewAdmin] = useState<SubAdminForm>(defaultForm);

  const utils = trpc.useUtils();
  const { data: subAdmins, isLoading } = trpc.subAdmins.list.useQuery();
  
  const createSubAdmin = trpc.subAdmins.create.useMutation({
    onSuccess: () => {
      utils.subAdmins.list.invalidate();
      setIsAddOpen(false);
      setNewAdmin(defaultForm);
      toast.success("Sub-admin criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateSubAdmin = trpc.subAdmins.update.useMutation({
    onSuccess: () => {
      utils.subAdmins.list.invalidate();
      setEditingAdmin(null);
      toast.success("Sub-admin atualizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteSubAdmin = trpc.subAdmins.delete.useMutation({
    onSuccess: () => {
      utils.subAdmins.list.invalidate();
      toast.success("Sub-admin removido!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddAdmin = () => {
    if (!newAdmin.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!newAdmin.username.trim()) {
      toast.error("Username é obrigatório");
      return;
    }
    if (!newAdmin.password.trim() || newAdmin.password.length < 4) {
      toast.error("Senha deve ter pelo menos 4 caracteres");
      return;
    }
    if (!newAdmin.canManageGvg && !newAdmin.canManageGot && !newAdmin.canManageReliquias) {
      toast.error("Selecione pelo menos um evento para gerenciar");
      return;
    }
    createSubAdmin.mutate(newAdmin);
  };

  const handleUpdateAdmin = () => {
    if (!editingAdmin) return;
    updateSubAdmin.mutate({
      id: editingAdmin.id,
      name: editingAdmin.name,
      password: editingAdmin.password || undefined,
      canManageGvg: editingAdmin.canManageGvg,
      canManageGot: editingAdmin.canManageGot,
      canManageReliquias: editingAdmin.canManageReliquias,
    });
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateSubAdmin.mutate({ id, isActive });
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sub-Administradores</h1>
            <p className="text-muted-foreground">
              Gerencie quem pode fazer escalações e enviar avisos
            </p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Sub-Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Sub-Admin</DialogTitle>
                <DialogDescription>
                  Crie um novo sub-administrador com acesso limitado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do sub-admin"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="username_login"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 4 caracteres"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  />
                </div>
                
                {/* Event Permissions */}
                <div className="space-y-3 pt-2">
                  <Label>Pode gerenciar:</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="new-gvg"
                        checked={newAdmin.canManageGvg}
                        onCheckedChange={(checked) => setNewAdmin({ ...newAdmin, canManageGvg: !!checked })}
                      />
                      <label htmlFor="new-gvg" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Swords className="w-4 h-4 text-red-500" />
                        GvG
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="new-got"
                        checked={newAdmin.canManageGot}
                        onCheckedChange={(checked) => setNewAdmin({ ...newAdmin, canManageGot: !!checked })}
                      />
                      <label htmlFor="new-got" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        GoT
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="new-reliquias"
                        checked={newAdmin.canManageReliquias}
                        onCheckedChange={(checked) => setNewAdmin({ ...newAdmin, canManageReliquias: !!checked })}
                      />
                      <label htmlFor="new-reliquias" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Relíquias
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Permissões do Sub-Admin:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>✅ Fazer escalações dos eventos selecionados</li>
                    <li>✅ Enviar avisos aos jogadores</li>
                    <li>❌ Não pode excluir membros</li>
                    <li>❌ Não pode gerenciar outros admins</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAdmin} disabled={createSubAdmin.isPending}>
                  {createSubAdmin.isPending ? "Salvando..." : "Criar Sub-Admin"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sub-Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Lista de Sub-Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : subAdmins && subAdmins.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-center">Permissões</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell className="text-muted-foreground">{admin.username}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            {admin.canManageGvg && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                <Swords className="w-3 h-3 mr-1" />
                                GvG
                              </Badge>
                            )}
                            {admin.canManageGot && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                <Trophy className="w-3 h-3 mr-1" />
                                GoT
                              </Badge>
                            )}
                            {admin.canManageReliquias && (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                <Crown className="w-3 h-3 mr-1" />
                                Relíquias
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={admin.isActive}
                            onCheckedChange={(checked) => handleToggleActive(admin.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingAdmin({
                                id: admin.id,
                                name: admin.name,
                                username: admin.username,
                                password: "",
                                canManageGvg: admin.canManageGvg,
                                canManageGot: admin.canManageGot,
                                canManageReliquias: admin.canManageReliquias,
                              })}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                if (confirm(`Remover ${admin.name}?`)) {
                                  deleteSubAdmin.mutate({ id: admin.id });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum sub-admin cadastrado</p>
                <p className="text-sm mt-2">Crie sub-admins para ajudar a gerenciar os eventos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Sub-Admin</DialogTitle>
            </DialogHeader>
            {editingAdmin && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editingAdmin.name}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editingAdmin.username}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nova Senha (deixe vazio para manter)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Nova senha"
                    value={editingAdmin.password}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                  />
                </div>
                
                {/* Event Permissions */}
                <div className="space-y-3 pt-2">
                  <Label>Pode gerenciar:</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit-gvg"
                        checked={editingAdmin.canManageGvg}
                        onCheckedChange={(checked) => setEditingAdmin({ ...editingAdmin, canManageGvg: !!checked })}
                      />
                      <label htmlFor="edit-gvg" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Swords className="w-4 h-4 text-red-500" />
                        GvG
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit-got"
                        checked={editingAdmin.canManageGot}
                        onCheckedChange={(checked) => setEditingAdmin({ ...editingAdmin, canManageGot: !!checked })}
                      />
                      <label htmlFor="edit-got" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        GoT
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit-reliquias"
                        checked={editingAdmin.canManageReliquias}
                        onCheckedChange={(checked) => setEditingAdmin({ ...editingAdmin, canManageReliquias: !!checked })}
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
              <Button variant="outline" onClick={() => setEditingAdmin(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateAdmin} disabled={updateSubAdmin.isPending}>
                {updateSubAdmin.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
