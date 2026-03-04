# 🚫 Política de Desenvolvimento - GVG Sapuri

## Regra de Ouro: NÃO MEXER EM CÓDIGO QUE ESTÁ FUNCIONANDO

### ✅ O Que Fazer

1. **Criar novos arquivos** para novas funcionalidades
   - Exemplo: `server/telegramUserSessions.ts` para gerenciar sessões
   - Exemplo: `client/src/pages/GvgStrategiesPanel.tsx` para novo painel

2. **Isolar completamente as mudanças**
   - Não alterar imports em arquivos existentes
   - Não modificar rotas que já funcionam
   - Não tocar em handlers que estão operacionais

3. **Testar antes de fazer checkpoint**
   - Rodar testes: `pnpm test`
   - Verificar compilação: `pnpm build`
   - Testar no Bot/UI antes de salvar

4. **Usar git checkout** para reverter se algo quebrar
   - `git checkout .` - reverter todas as mudanças
   - `git checkout server/db.ts` - reverter arquivo específico

### ❌ O Que NÃO Fazer

- ❌ Modificar `server/db.ts` para adicionar imports novos
- ❌ Editar `server/_core/botWebhook.ts` sem testar imediatamente
- ❌ Alterar `drizzle/schema.ts` sem garantir migração funcional
- ❌ Mudar arquivos existentes sem criar checkpoint antes

### 📋 Checklist Antes de Cada Mudança

- [ ] Criar novo arquivo ou branch isolado?
- [ ] Vai quebrar algo existente?
- [ ] Testei localmente antes?
- [ ] Fiz checkpoint antes de começar?
- [ ] Posso fazer rollback se der problema?

### 🔒 Arquivos Críticos (NÃO TOCAR)

```
server/_core/index.ts          ← Inicialização do servidor
server/_core/botWebhook.ts     ← Webhook do Telegram
server/db.ts                   ← Funções de banco de dados
drizzle/schema.ts              ← Schema do banco
server/gotBotIntegration.ts    ← Comandos do Bot GoT
```

Se precisar mexer em algum desses, **fazer checkpoint ANTES** e testar imediatamente.

---

**Última atualização:** 25 de janeiro de 2026
**Responsável:** Manus AI
