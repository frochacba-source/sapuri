import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, Upload, Trash2, RotateCcw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function BackupManager() {
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);

  // Queries e Mutations
  const { data: backups, isLoading, refetch } = trpc.system.listBackups.useQuery();
  const createBackupMutation = trpc.system.createBackup.useMutation();
  const restoreBackupMutation = trpc.system.restoreBackup.useMutation();
  const deleteBackupMutation = trpc.system.deleteBackup.useMutation();
  const exportBackupMutation = trpc.system.exportBackup.useMutation();

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      toast.error('Nome do backup é obrigatório');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createBackupMutation.mutateAsync({
        backupName: backupName.trim(),
        description: backupDescription.trim(),
      });

      if (result.success) {
        toast.success(`Backup "${backupName}" criado com sucesso! (${(result.size / 1024).toFixed(2)} KB)`);
        setBackupName('');
        setBackupDescription('');
        refetch();
      } else {
        toast.error(`Erro ao criar backup: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao criar backup');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreBackup = async (backupId: number) => {
    if (!confirm('⚠️ Restaurar este backup irá sobrescrever TODOS os dados atuais. Tem certeza?')) {
      return;
    }

    setIsRestoring(true);
    try {
      const result = await restoreBackupMutation.mutateAsync({ backupId });

      if (result.success) {
        toast.success(`Backup restaurado com sucesso! ${result.tablesRestored} tabelas foram restauradas.`);
        refetch();
      } else {
        toast.error(`Erro ao restaurar backup: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao restaurar backup');
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: number) => {
    if (!confirm('Tem certeza que deseja deletar este backup?')) {
      return;
    }

    try {
      const result = await deleteBackupMutation.mutateAsync({ backupId });

      if (result.success) {
        toast.success('Backup deletado com sucesso');
        refetch();
      } else {
        toast.error('Erro ao deletar backup');
      }
    } catch (error) {
      toast.error('Erro ao deletar backup');
      console.error(error);
    }
  };

  const handleExportBackup = async (backupId: number, backupName: string) => {
    try {
      const result = await exportBackupMutation.mutateAsync({ backupId });

      if (result.json) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.json));
        element.setAttribute('download', `backup-${backupName}-${new Date().toISOString().split('T')[0]}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Backup exportado com sucesso');
      } else {
        toast.error('Erro ao exportar backup');
      }
    } catch (error) {
      toast.error('Erro ao exportar backup');
      console.error(error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Criar Novo Backup */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Criar Novo Backup</CardTitle>
          <CardDescription>Faça backup completo do sistema antes de fazer alterações importantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Backup</label>
            <Input
              placeholder="Ex: Backup antes de atualizar estratégias"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <Input
              placeholder="Ex: Backup de segurança antes de grandes mudanças"
              value={backupDescription}
              onChange={(e) => setBackupDescription(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <Button
            onClick={handleCreateBackup}
            disabled={isCreating || !backupName.trim()}
            className="w-full"
          >
            {isCreating ? 'Criando backup...' : 'Criar Backup Agora'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>Gerencie seus backups do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando backups...</div>
          ) : !backups || backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum backup criado ainda</div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{backup.backupName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(backup.createdAt)} • {formatBytes(backup.backupSize)}
                    </p>
                    {backup.description && (
                      <p className="text-sm text-muted-foreground mt-1">{backup.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Restaurar este backup"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restaurar Backup</DialogTitle>
                          <DialogDescription>
                            ⚠️ <strong>Aviso:</strong> Restaurar este backup irá sobrescrever TODOS os dados atuais do sistema.
                            Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-4 justify-end">
                          <Button variant="outline">Cancelar</Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={isRestoring}
                          >
                            {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportBackup(backup.id, backup.backupName)}
                      title="Exportar como JSON"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBackup(backup.id)}
                      title="Deletar backup"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Segurança */}
      <Card className="bg-amber-950/20 border-amber-700/30">
        <CardHeader>
          <CardTitle className="text-amber-100">💡 Dicas de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-100/80 space-y-2">
          <p>✓ Faça backup antes de fazer alterações importantes no sistema</p>
          <p>✓ Mantenha vários backups em diferentes datas para segurança</p>
          <p>✓ Exporte backups importantes como JSON para armazenamento externo</p>
          <p>✓ Teste a restauração de backups periodicamente para garantir que funcionam</p>
        </CardContent>
      </Card>
    </div>
  );
}
