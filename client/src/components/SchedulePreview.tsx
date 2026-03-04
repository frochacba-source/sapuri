import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SchedulePreviewProps {
  eventName: string;
  eventTime: string;
  eventDate: string;
  memberNames: string[];
  memberPhones?: { [key: string]: string };
}

export function SchedulePreview({ eventName, eventTime, eventDate, memberNames, memberPhones = {} }: SchedulePreviewProps) {
  const [copiedTab, setCopiedTab] = useState<'telegram' | 'whatsapp' | null>(null);

  // Format date to display (e.g., "02/02/2026")
  const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR');

  const memberListTelegram = memberNames.map((name, i) => `${i + 1}. ${name}`).join('\n');
  
  const memberListWhatsapp = memberNames.map((name, i) => {
    const phone = memberPhones[name] || '';
    return `${i + 1}. ${name}${phone ? ` ${phone}` : ''}`;
  }).join('\n');

  const telegramMessage = `🏆 ${eventName} - Escalação de Hoje (${formattedDate})

⏰ Horário: ${eventTime}

🛡️ Escalados salvem suas defesas!

${memberListTelegram}

⚔️Otima Batalha⚔️`;

  const whatsappMessage = `🏆 ${eventName} - Escalação de Hoje (${formattedDate})

⏰ Horário: ${eventTime}

🛡️ Escalados salvem suas defesas!

${memberListWhatsapp}

⚔️Otima Batalha⚔️`;

  const copyToClipboard = (text: string, tab: 'telegram' | 'whatsapp') => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="w-full border border-border rounded-lg bg-card p-4">
      <h3 className="text-lg font-semibold mb-4">Pré-visualização da Escalação</h3>
      
      <Tabs defaultValue="telegram" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="telegram">📱 Telegram</TabsTrigger>
          <TabsTrigger value="whatsapp">💬 WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="telegram" className="space-y-4">
          <div className="bg-background p-4 rounded-lg border border-border min-h-[200px] max-h-[400px] overflow-y-auto space-y-1">
            <div className="text-sm font-sans">
              <div>🏆 {eventName} - Escalação de Hoje ({formattedDate})</div>
              <div className="mt-2"></div>
              <div>⏰ Horário: {eventTime}</div>
              <div className="mt-2"></div>
              <div>🛡️ Escalados salvem suas defesas!</div>
              <div className="mt-2"></div>
              {memberNames.map((name, i) => (
                <div key={i}>{i + 1}. {name}</div>
              ))}
              <div className="mt-2"></div>
              <div>⚔️Otima Batalha⚔️</div>
            </div>
          </div>

          <Button
            onClick={() => copyToClipboard(telegramMessage, 'telegram')}
            className="w-full"
            variant="outline"
          >
            {copiedTab === 'telegram' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar para Telegram
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <div className="bg-background p-4 rounded-lg border border-border min-h-[200px] max-h-[400px] overflow-y-auto space-y-1">
            <div className="text-sm font-mono">
              <div>🏆 {eventName} - Escalação de Hoje ({formattedDate})</div>
              <div className="mt-2"></div>
              <div>⏰ Horário: {eventTime}</div>
              <div className="mt-2"></div>
              <div>🛡️ Escalados salvem suas defesas!</div>
              <div className="mt-2"></div>
              {memberNames.map((name, i) => {
                const phone = memberPhones[name] || '';
                return (
                  <div key={i}>{i + 1}. {name}{phone ? ` ${phone}` : ''}</div>
                );
              })}
              <div className="mt-2"></div>
              <div>⚔️Otima Batalha⚔️</div>
            </div>
          </div>

          <Button
            onClick={() => copyToClipboard(whatsappMessage, 'whatsapp')}
            className="w-full"
            variant="outline"
          >
            {copiedTab === 'whatsapp' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar para WhatsApp
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
