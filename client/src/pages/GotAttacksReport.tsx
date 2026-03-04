'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, FileText, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function GotAttacksReport() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);

  const { data: attacks = [], isLoading } = trpc.gotAttacks.getByDate.useQuery({ eventDate: selectedDate });

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // Formatar data para exibição
      const date = new Date(selectedDate);
      const dateStr = date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Criar conteúdo HTML para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório GoT - ${dateStr}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: #1a1a1a;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background-color: #2d2d2d;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #8b5cf6;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #ffffff;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #b0b0b0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #8b5cf6;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #8b5cf6;
            }
            td {
              padding: 10px 12px;
              border: 1px solid #444;
              color: #e0e0e0;
            }
            tr:nth-child(even) {
              background-color: #383838;
            }
            tr:hover {
              background-color: #404040;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              background-color: #383838;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #8b5cf6;
              text-align: center;
            }
            .stat-card .label {
              font-size: 12px;
              color: #b0b0b0;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .stat-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #ffffff;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #444;
              color: #707070;
              font-size: 12px;
            }
            .victory { color: #10b981; font-weight: bold; }
            .defeat { color: #ef4444; font-weight: bold; }
            .zero { color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Relatório de Ataques GoT</h1>
              <p>${dateStr}</p>
            </div>

            <div class="stats">
              <div class="stat-card">
                <div class="label">Total de Membros</div>
                <div class="value">${attacks.length}</div>
              </div>
              <div class="stat-card">
                <div class="label">Total de Vitórias (Ataque)</div>
                <div class="value">${attacks.reduce((sum: number, a: any) => sum + a.attack.attackVictories, 0)}</div>
              </div>
              <div class="stat-card">
                <div class="label">Total de Derrotas (Ataque)</div>
                <div class="value">${attacks.reduce((sum: number, a: any) => sum + a.attack.attackDefeats, 0)}</div>
              </div>
              <div class="stat-card">
                <div class="label">Pontos Totais</div>
                <div class="value">${attacks.reduce((sum: number, a: any) => sum + a.attack.points, 0)}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th>Ataque V</th>
                  <th>Ataque D</th>
                  <th>Defesa V</th>
                  <th>Defesa D</th>
                  <th>Pontos Anteriores</th>
                  <th>Pontos</th>
                  <th>Diferença</th>
                </tr>
              </thead>
              <tbody>
                ${attacks.map((a: any, idx: number) => {
                  const previousPoints = (a.attack.points || 0) - (a.attack.pointsDifference || 0);
                  const difference = a.attack.pointsDifference || 0;
                  return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${a.member.name}</strong></td>
                    <td class="victory">${a.attack.attackVictories}</td>
                    <td class="defeat">${a.attack.attackDefeats}</td>
                    <td class="victory">${a.attack.defenseVictories}</td>
                    <td class="defeat">${a.attack.defenseDefeats}</td>
                    <td>${previousPoints}</td>
                    <td><strong>${a.attack.points}</strong></td>
                    <td class="${difference >= 0 ? 'victory' : 'defeat'}">${difference >= 0 ? '+' : ''}${difference}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>Relatório gerado automaticamente pelo Sistema de Gerenciamento de Guilda</p>
              <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Usar manus-md-to-pdf ou criar PDF via blob
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Criar iframe invisível para imprimir
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          toast.success('PDF preparado para impressão');
        }, 1000);
      };

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      // Criar CSV
      const headers = ['#', 'Jogador', 'Ataque V', 'Ataque D', 'Defesa V', 'Defesa D', 'Pontos Anteriores', 'Pontos', 'Diferença'];
      const rows = attacks.map((a: any, idx: number) => {
        const previousPoints = (a.attack.points || 0) - (a.attack.pointsDifference || 0);
        const difference = a.attack.pointsDifference || 0;
        return [
          idx + 1,
          a.member.name,
          a.attack.attackVictories,
          a.attack.attackDefeats,
          a.attack.defenseVictories,
          a.attack.defenseDefeats,
          previousPoints,
          a.attack.points,
          difference
        ] as any[];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any) => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `got-ataques-${selectedDate}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar CSV:', error);
      toast.error('Erro ao baixar CSV');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">📊 Relatório de Ataques GoT</h1>
          <p className="text-gray-600 mt-2">Visualize e exporte dados de ataques GoT</p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center justify-center bg-white dark:bg-slate-950 rounded-lg p-4 border border-border">
              <Button
                onClick={() => setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))}
                variant="ghost"
                size="sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center min-w-[200px]">
                <div className="text-lg font-bold capitalize">
                  {format(new Date(selectedDate), 'EEEE, d "de" MMMM', { locale: ptBR })}
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-center mt-2 text-sm"
                />
              </div>
              
              <Button
                onClick={() => setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))}
                variant="ghost"
                size="sm"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={handleExportPDF}
                disabled={isLoading || isExporting || attacks.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </Button>
              <Button
                onClick={handleDownloadCSV}
                disabled={isLoading || attacks.length === 0}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Ataques */}
        <Card>
          <CardHeader>
            <CardTitle>Ataques do Dia</CardTitle>
            <CardDescription>
              {attacks.length} membros com dados registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : attacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum ataque registrado para esta data</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Jogador</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-600">Ataque V</th>
                      <th className="text-center py-3 px-4 font-semibold text-red-600">Ataque D</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-600">Defesa V</th>
                      <th className="text-center py-3 px-4 font-semibold text-red-600">Defesa D</th>
                      <th className="text-center py-3 px-4 font-semibold text-purple-600">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attacks.map((a: any, idx: number) => (
                      <tr key={a.attack.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{a.member.name}</td>
                        <td className="py-3 px-4 text-center text-green-600 font-semibold">{a.attack.attackVictories}</td>
                        <td className="py-3 px-4 text-center text-red-600 font-semibold">{a.attack.attackDefeats}</td>
                        <td className="py-3 px-4 text-center text-green-600 font-semibold">{a.attack.defenseVictories}</td>
                        <td className="py-3 px-4 text-center text-red-600 font-semibold">{a.attack.defenseDefeats}</td>
                        <td className="py-3 px-4 text-center font-bold text-purple-600">{a.attack.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {attacks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{attacks.length}</div>
                  <div className="text-sm text-gray-600 mt-2">Total de Membros</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {attacks.reduce((sum: number, a: any) => sum + a.attack.attackVictories, 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Vitórias (Ataque)</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {attacks.reduce((sum: number, a: any) => sum + a.attack.attackDefeats, 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Derrotas (Ataque)</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {attacks.reduce((sum: number, a: any) => sum + a.attack.points, 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Pontos Totais</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
