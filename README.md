# 🎮 Sapuri System - Sistema de Gerenciamento de Guilda

Sistema completo para gerenciamento de guilda de jogos, desenvolvido com React, Node.js, Express, tRPC e PostgreSQL. Inclui integração com bots de WhatsApp (Baileys) e Telegram.

## 📋 Sumário

- [Descrição](#-descrição)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Instalação Local](#-instalação-local)
- [Deploy](#-deploy)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Configuração dos Bots](#-configuração-dos-bots)
- [API](#-api)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 📖 Descrição

O **Sapuri System** é uma plataforma web completa para gerenciamento de guildas de jogos, oferecendo:

- **Gerenciamento de Membros**: Cadastro, perfis, status e sincronização
- **Escalas (GvG/GoT)**: Sistema completo de escalas de guerra
- **Estratégias de Ataque**: Planejamento e visualização de ataques
- **Cards/Personagens**: Biblioteca de cards com análise automática
- **Relíquias**: Sistema de temporadas e atribuições
- **Painel de Contas**: Gerenciamento de contas de jogo
- **Anúncios**: Sistema de comunicação com a guilda
- **Bots Integrados**: WhatsApp e Telegram para notificações

---

## 🛠 Tecnologias

### Frontend
- **React 19** - Biblioteca de UI
- **Vite 7** - Build tool e dev server
- **TailwindCSS 4** - Framework CSS utility-first
- **shadcn/ui** - Componentes de UI
- **React Query** - Gerenciamento de estado server-side
- **Wouter** - Roteamento leve
- **Recharts** - Gráficos e visualizações

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **tRPC** - API type-safe
- **Drizzle ORM** - ORM type-safe para PostgreSQL
- **PostgreSQL** - Banco de dados relacional

### Integrações
- **Baileys** - API WhatsApp (não oficial)
- **Telegram Bot API** - Integração oficial
- **Multer** - Upload de arquivos

---

## ⚡ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🏠 Dashboard | Visão geral com estatísticas e atividades recentes |
| 👥 Membros | CRUD completo, sincronização com Arayashiki |
| 📅 Escalas | GvG e GoT com drag-and-drop |
| ⚔️ Estratégias | Planejamento de ataques com visualização |
| 🃏 Cards | Biblioteca com análise de imagem via IA |
| 🏆 Relíquias | Temporadas, times e atribuições |
| 💰 Contas | Gerenciamento de contas de jogo |
| 📢 Anúncios | Sistema de comunicação |
| 🤖 Bots | WhatsApp e Telegram integrados |
| 💬 IA Chat | Assistente inteligente |

---

## 🚀 Instalação Local

### Pré-requisitos

- Node.js 18+ 
- pnpm 10+
- PostgreSQL 14+

### Passos

1. **Clone o repositório**
```bash
git clone <repo-url>
cd sapuri_system
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure o banco de dados**
```bash
# Crie o banco no PostgreSQL
createdb sapuri

# Ou via psql
psql -U postgres -c "CREATE DATABASE sapuri;"
```

4. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

5. **Execute as migrations**
```bash
pnpm db:push
```

6. **Inicie em desenvolvimento**
```bash
pnpm dev
```

Acesse: `http://localhost:5000`

---

## 🌐 Deploy

### Railway (Recomendado)

1. **Crie conta no [Railway](https://railway.app)**

2. **Crie novo projeto**
   - New Project → Deploy from GitHub Repo

3. **Adicione PostgreSQL**
   - New → Database → PostgreSQL
   - Copie a `DATABASE_URL` gerada

4. **Configure variáveis de ambiente**
   - Vá em Settings → Variables
   - Adicione todas as variáveis do `.env.example`

5. **Deploy automático**
   - Railway detecta automaticamente o projeto Node.js
   - Build: `pnpm build`
   - Start: `pnpm start`

### Variáveis de Build (Railway)

```env
NIXPACKS_BUILD_CMD=pnpm build
NIXPACKS_START_CMD=pnpm start
```

### Outros Provedores

- **Render**: Similar ao Railway, suporta PostgreSQL nativo
- **Fly.io**: Requer Dockerfile customizado
- **Vercel**: Frontend only (backend precisa de adaptação)

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão PostgreSQL | ✅ |
| `PORT` | Porta do servidor (default: 5000) | ❌ |
| `NODE_ENV` | Ambiente (development/production) | ❌ |
| `SESSION_SECRET` | Chave para sessões | ✅ |
| `OWNER_OPEN_ID` | ID do admin principal | ❌ |
| `TELEGRAM_BOT_TOKEN` | Token do bot Telegram | ❌ |
| `TELEGRAM_GROUP_ID` | ID do grupo Telegram | ❌ |
| `PAINEL_CONTAS_BOT_TOKEN` | Token bot para painel de contas | ❌ |
| `PAINEL_CONTAS_CHAT_ID` | Chat ID para notificações de contas | ❌ |

---

## 🤖 Configuração dos Bots

### Telegram

1. **Crie um bot** com [@BotFather](https://t.me/BotFather)
   - Use `/newbot` e siga as instruções
   - Salve o token gerado

2. **Obtenha o ID do grupo**
   - Adicione o bot ao grupo
   - Use `/getGroupId` ou envie uma mensagem e veja nos logs

3. **Configure no `.env`**
```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_GROUP_ID=-1234567890
```

### WhatsApp (Baileys)

1. **Inicie o servidor**
```bash
pnpm dev
```

2. **Acesse a rota de QR Code**
   - `http://localhost:5000/api/whatsapp/qr`

3. **Escaneie com WhatsApp**
   - Use o WhatsApp do celular
   - Vá em Configurações → Aparelhos Conectados → Conectar aparelho

4. **Sessão salva automaticamente**
   - A sessão fica em `server/whatsapp-sessions/`

---

## 📡 API

### tRPC Endpoints

A API usa tRPC para comunicação type-safe. Principais routers:

- `members` - Gerenciamento de membros
- `schedules` - Escalas GvG/GoT
- `strategies` - Estratégias de ataque
- `cards` - Biblioteca de cards
- `reliquias` - Sistema de relíquias
- `announcements` - Anúncios
- `aiChat` - Chat com IA

### REST Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/trpc/*` | ALL | tRPC API |
| `/api/accounts/*` | ALL | Painel de Contas |
| `/api/whatsapp/*` | ALL | WhatsApp API |
| `/api/telegram/*` | ALL | Telegram Webhook |

---

## 📁 Estrutura do Projeto

```
sapuri_system/
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Componentes React
│       ├── pages/          # Páginas da aplicação
│       ├── hooks/          # Custom hooks
│       ├── contexts/       # React contexts
│       └── lib/            # Utilitários
├── server/                 # Backend Node.js
│   ├── _core/              # Core do servidor
│   ├── routers/            # tRPC routers
│   ├── modules/            # Módulos específicos
│   ├── scrapers/           # Web scrapers
│   └── data/               # Dados estáticos
├── shared/                 # Código compartilhado
├── drizzle/                # Migrations e schema
├── uploads/                # Arquivos enviados
└── backups/                # Backups automáticos
```

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia em modo desenvolvimento

# Build
pnpm build        # Build para produção

# Produção
pnpm start        # Inicia servidor de produção

# Banco de dados
pnpm db:push      # Aplica migrations

# Testes
pnpm test         # Executa testes

# Outros
pnpm check        # Verifica tipos TypeScript
pnpm format       # Formata código com Prettier
```

---

## 🆘 Troubleshooting

### Erro de conexão com banco
```bash
# Verifique se o PostgreSQL está rodando
pg_isready

# Teste a conexão
psql $DATABASE_URL -c "SELECT 1"
```

### WhatsApp não conecta
1. Delete a pasta `server/whatsapp-sessions/`
2. Reinicie o servidor
3. Escaneie o QR code novamente

### Bot Telegram não responde
1. Verifique o token no BotFather
2. Confirme que o bot foi adicionado ao grupo
3. Verifique os logs do servidor

---

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para a guilda Sapuri**
