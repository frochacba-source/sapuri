#!/bin/bash

# Script de Instalação do Chromium para Bot WhatsApp
# Este script instala as dependências necessárias para rodar o whatsapp-web.js com Chromium em produção

set -e

echo "🚀 Iniciando instalação do Chromium para WhatsApp Bot..."
echo ""

# Detectar sistema operacional
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📦 Sistema detectado: Linux"
    
    # Atualizar package manager
    echo "📥 Atualizando package manager..."
    sudo apt-get update -qq
    
    # Instalar dependências do sistema
    echo "📥 Instalando dependências do sistema..."
    sudo apt-get install -y \
        chromium-browser \
        chromium \
        libxss1 \
        libappindicator1 \
        libindicator7 \
        fonts-liberation \
        xdg-utils \
        wget \
        ca-certificates \
        fonts-noto-color-emoji \
        libnss3 \
        libgconf-2-4 \
        libxss1 \
        libappindicator1 \
        libindicator7 \
        libgbm1 \
        libxshmfence1 \
        libgtk-3-0 \
        libx11-xcb1 \
        libxcb-dri3-0 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxslt1.1 \
        libxss1 \
        libxtst6 \
        fonts-liberation \
        xdg-utils
    
    # Encontrar caminho do Chromium
    CHROMIUM_PATH=$(which chromium-browser || which chromium || echo "/usr/bin/chromium-browser")
    
    if [ -f "$CHROMIUM_PATH" ]; then
        echo "✅ Chromium instalado em: $CHROMIUM_PATH"
    else
        echo "⚠️  Chromium não encontrado. Tentando instalar novamente..."
        sudo apt-get install -y chromium-browser
        CHROMIUM_PATH=$(which chromium-browser || which chromium)
        echo "✅ Chromium instalado em: $CHROMIUM_PATH"
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Sistema detectado: macOS"
    
    # Verificar se Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew não encontrado. Por favor, instale Homebrew primeiro:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    echo "📥 Instalando Chromium via Homebrew..."
    brew install --cask chromium
    
    CHROMIUM_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
    echo "✅ Chromium instalado em: $CHROMIUM_PATH"
    
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "📦 Sistema detectado: Windows"
    echo "⚠️  Para Windows, por favor instale Chromium manualmente:"
    echo "   1. Baixe em: https://www.chromium.org/getting-involved/download-chromium"
    echo "   2. Ou instale via Chocolatey: choco install chromium"
    exit 1
else
    echo "❌ Sistema operacional não suportado: $OSTYPE"
    exit 1
fi

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure a variável de ambiente WHATSAPP_MODE=production"
echo "   2. Reinicie o servidor: npm run dev ou npm start"
echo "   3. O bot usará o Chromium real em vez do modo mock"
echo ""
echo "🔗 Para mais informações, veja DEPLOYMENT.md"
