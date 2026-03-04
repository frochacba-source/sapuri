# Guia de Deployment - WhatsApp Bot em Produção

Este documento descreve como configurar o bot WhatsApp para produção real com Chromium.

## 📋 Pré-requisitos

- Servidor Linux, macOS ou Windows
- Node.js 16+ instalado
- Acesso de administrador/sudo no servidor
- Conexão de internet estável

## 🚀 Instalação do Chromium

### Opção 1: Script Automático (Recomendado)

```bash
# Dar permissão de execução
chmod +x setup-chromium.sh

# Executar script de instalação
./setup-chromium.sh
```

O script detectará seu sistema operacional e instalará as dependências necessárias.

### Opção 2: Instalação Manual

#### Linux (Debian/Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y chromium-browser

# Verificar instalação
which chromium-browser
# Saída esperada: /usr/bin/chromium-browser
```

#### Linux (Fedora/RHEL)

```bash
sudo dnf install -y chromium

# Verificar instalação
which chromium
# Saída esperada: /usr/bin/chromium
```

#### macOS

```bash
brew install --cask chromium

# Verificar instalação
ls /Applications/Chromium.app/Contents/MacOS/Chromium
```

#### Windows

1. Baixe Chromium em: https://www.chromium.org/getting-involved/download-chromium
2. Ou instale via Chocolatey:
   ```powershell
   choco install chromium
   ```

## 🔧 Configuração de Produção

### 1. Copiar arquivo de configuração

```bash
cp .env.production.example .env.production
```

### 2. Editar variáveis de ambiente

```bash
# Abrir arquivo de configuração
nano .env.production
```

Configure os seguintes valores:

```env
# Modo de operação
WHATSAPP_MODE=production

# Caminho do Chromium (ajuste conforme seu sistema)
CHROMIUM_PATH=/usr/bin/chromium-browser

# Outras configurações (opcional)
WHATSAPP_DEBUG=true
```

### 3. Encontrar caminho correto do Chromium

Se não souber o caminho exato, execute:

**Linux:**
```bash
which chromium-browser
# ou
which chromium
```

**macOS:**
```bash
ls /Applications/Chromium.app/Contents/MacOS/Chromium
```

**Windows (PowerShell):**
```powershell
Get-Command chromium
```

## 🧪 Testando a Configuração

### 1. Iniciar servidor em modo desenvolvimento

```bash
npm run dev
```

### 2. Acessar página de configuração

- Abra: `http://localhost:3000`
- Vá para: **Configurações** → **WhatsApp Config**
- Clique em: **Inicializar Bot**

### 3. Verificar modo de operação

Você deve ver:

- ✅ **Modo Produção**: QR code real aparecerá
- ❌ **Modo Mock**: QR code visual de teste aparecerá

### 4. Escanear QR code (Produção)

1. Abra WhatsApp no seu telefone
2. Vá para: **Configurações** → **Dispositivos Vinculados** → **Vincular um Dispositivo**
3. Escaneie o QR code que aparece na página
4. Aguarde a autenticação

### 5. Testar envio de mensagens

- Vá para: **GoT** → **Avisos WhatsApp**
- Selecione membros com números cadastrados
- Customize mensagem (opcional)
- Clique em: **Enviar**

## 📊 Monitoramento

### Verificar logs do servidor

```bash
# Ver logs em tempo real
npm run dev

# Procurar por mensagens de WhatsApp
grep "\[WhatsApp\]" logs.txt
```

### Logs esperados em produção

```
[WhatsApp] Usando Chromium em: /usr/bin/chromium-browser
[WhatsApp] QR Code recebido. Escaneie com seu telefone
[WhatsApp] Autenticado com sucesso!
[WhatsApp] Cliente pronto!
[WhatsApp] Mensagem enviada para +55XXXXXXXXXXX
```

### Logs de erro

```
[WhatsApp] Modo produção ativado mas Chromium não disponível!
[WhatsApp] Execute: bash setup-chromium.sh
```

## 🔄 Gerenciamento de Sessão

### Localização da sessão

A sessão do bot é salva em: `.wwebjs_auth/`

### Limpar sessão

Na página de **WhatsApp Config**, clique em: **Limpar Sessão**

Ou via terminal:

```bash
rm -rf .wwebjs_auth/
```

### Recuperar sessão após restart

O bot tentará recuperar a sessão automaticamente. Se falhar:

1. Clique em **Limpar Sessão**
2. Clique em **Inicializar Bot**
3. Escaneie o QR code novamente

## 🐛 Troubleshooting

### Problema: "Chromium não encontrado"

**Solução:**
1. Verifique se Chromium está instalado: `which chromium-browser`
2. Atualize `CHROMIUM_PATH` em `.env.production`
3. Reinicie o servidor

### Problema: "QR code não aparece"

**Solução:**
1. Verifique se o Chromium está funcionando: `chromium-browser --version`
2. Verifique logs do servidor para erros
3. Tente limpar a sessão e reiniciar

### Problema: "Mensagens não são enviadas"

**Solução:**
1. Verifique se o bot está conectado (status verde)
2. Verifique se os números de telefone estão no formato correto: `+55XXXXXXXXXXX`
3. Verifique logs para mensagens de erro
4. Tente desconectar e reconectar o bot

### Problema: "Erro ao inicializar puppeteer"

**Solução:**
1. Instale dependências do sistema:
   ```bash
   sudo apt-get install -y libxss1 libappindicator1 libindicator7 fonts-liberation
   ```
2. Tente novamente

## 📝 Variáveis de Ambiente Avançadas

```env
# Timeout para inicialização (ms)
WHATSAPP_INIT_TIMEOUT=30000

# Delay entre mensagens em lote (ms)
WHATSAPP_MESSAGE_DELAY=1000

# Habilitar debug
WHATSAPP_DEBUG=true

# Configurações do Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_DISABLE_SANDBOX=true
PUPPETEER_DISABLE_DEV_SHM=true
```

## 🔒 Segurança em Produção

### Recomendações

1. **Proteja a sessão**: Não compartilhe o diretório `.wwebjs_auth/`
2. **Use HTTPS**: Configure SSL/TLS no servidor
3. **Autenticação**: Mantenha a autenticação do admin ativa
4. **Backup**: Faça backup da sessão periodicamente
5. **Monitoramento**: Configure alertas para erros de conexão

### Backup da sessão

```bash
# Fazer backup
tar -czf whatsapp_session_backup.tar.gz .wwebjs_auth/

# Restaurar backup
tar -xzf whatsapp_session_backup.tar.gz
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Consulte a seção "Troubleshooting"
3. Verifique se o Chromium está instalado corretamente
4. Tente limpar a sessão e reiniciar

## 🔗 Referências

- [whatsapp-web.js Documentation](https://docs.wwebjs.dev/)
- [Chromium Download](https://www.chromium.org/getting-involved/download-chromium)
- [Puppeteer Documentation](https://pptr.dev/)
