# GvG Guilda Sapuri - TODO

## Configuração do Sistema
- Total de membros: até 75
- Eventos: GvG (20 escalados, 13:00), GoT (25 escalados, 13:00), Relíquias (40 escalados, 15:00)
- Bot Telegram: @Sapuribot

## Funcionalidades Principais

- [x] Cadastro de membros da guilda (nome + ID Telegram) - até 75 membros
- [x] Painel de seleção por evento (GvG, GoT, Relíquias)
- [x] Sistema de salvamento de escalação com timestamp
- [x] Histórico de escalações por evento
- [x] Integração com bot Telegram (@Sapuribot)
- [x] Notificações automáticas aos escalados
- [ ] Configuração de horário de lembrete (30min antes de cada evento)
- [x] Visualização de histórico com filtros (data/jogador/evento)
- [x] Dashboard com estatísticas de participação por evento
- [x] Sistema de autenticação (apenas líder/admin pode escalar)

## Eventos
- [x] GvG: 20 escalados, 13:00 horário de Brasília, diário
- [x] GoT: 25 escalados, 13:00 horário de Brasília, a cada 3 dias
- [x] Relíquias: 40 escalados, 15:00 horário de Brasília

## Validações
- [x] Limite de escalados por evento (20/25/40)
- [x] Limite de 75 membros na guilda

## Novas Funcionalidades (v2)

### Upload de Prints de Desempenho
- [ ] Upload de prints do GoT para análise
- [ ] Extração de dados: quem atacou / não atacou
- [ ] Histórico de desempenho por jogador

### Quadro de Avisos
- [x] Quadro de avisos separado por evento (GvG, GoT, Relíquias)
- [x] Selecionar jogadores específicos para enviar aviso
- [x] Enviar alertas para quem falta atacar

### Filtros de Participação no Cadastro
- [x] Checkbox "Participa GvG" no cadastro de membro
- [x] Checkbox "Participa GoT" no cadastro de membro
- [x] Checkbox "Participa Relíquias" no cadastro de membro
- [x] Filtrar membros na escalação baseado nas participações marcadas

### Sistema de Sub-Admins
- [x] Cadastro de sub-admins com senha simples
- [x] Permissões por competição (GvG, GoT, Relíquias)
- [x] Sub-admin pode: escalar, enviar avisos
- [x] Sub-admin NÃO pode: excluir membros
- [x] Admin principal tem acesso total

### Bugs
- [x] Corrigir erro NotFoundError insertBefore (resolvido com useEffect)

## Novas Funcionalidades (v3)

### Painel de Avisos Geral
- [x] Enviar aviso para todos os membros sem precisar selecionar

### Mensagens Privadas no Telegram
- [x] Enviar mensagem no privado dos membros (não só no grupo)
- [x] Membro precisa iniciar conversa com bot primeiro

### Registro de Ataques GvG
- [x] Cada membro: 2 ataques, cada um vale 0-3 estrelas
- [x] Registrar adversário de cada ataque
- [x] Upload de print para preenchimento automático via IA
- [x] Entrada manual como alternativa

### Registro de Ataques GoT
- [x] Registrar vitórias/derrotas no ataque
- [x] Registrar vitórias/derrotas na defesa
- [x] Registrar pontos totais
- [x] Upload de print para preenchimento automático via IA

### Alertas de Não-Atacantes
- [x] Painel mostrando quem não atacou no dia
- [x] Notificação automática para admins cadastrados
- [x] Separado por evento (GvG, GoT)

### Upload de Prints
- [x] Painel para subir prints dos eventos
- [x] Análise automática via IA (LLM com visão)
- [x] Atualização dos dados dos membros baseado nos prints


## Correções e Melhorias (v4)

### Bugs
- [x] Corrigir erro NotFoundError insertBefore no upload de imagem GvG

### GoT Cumulativo
- [x] Ataques e pontos do GoT são cumulativos durante o evento
- [x] A cada batalha, novos prints atualizam os dados acumulados

### Estrelas Visuais na GvG
- [x] Substituir números por estrelas visuais
- [x] Estrelas amarelas (⭐) = conquistou
- [x] Estrelas cinzas (☆) = não atacou/não pontuou

## Novas Funcionalidades (v5)

### Bug
- [x] Corrigir erro insertBefore no upload de imagens GvG (resolvido com refatoração)

### Ranking de Desempenho
- [x] Ranking geral de membros baseado em GvG (estrelas totais)
- [x] Ranking geral de membros baseado em GoT (pontos totais)
- [x] Top performers de cada evento
- [x] Filtro por período (data inicial/final)

### Histórico Individual por Membro
- [x] Página de perfil do membro
- [x] Histórico de participações em GvG com datas e estrelas
- [x] Histórico de participações em GoT com datas e pontos
- [x] Histórico de participações em Relíquias com dano
- [x] Estatísticas consolidadas por evento

### Evento Relíquias Completo
- [x] Sistema de temporadas (criar/encerrar)
- [x] Sequência de BOSS: Orfeu (5 guardas) → Radamantis (10) → Pandora (15) → Gêmeos (20, 3x)
- [x] Progressão visual de bosses com contadores de guardas e derrotas
- [x] Função do membro: "Atacar Guardas" ou "Atacar Boss Diretamente"
- [x] Registro de dano cumulativo por membro
- [x] Upload de prints para registrar ranking de dano
- [x] Análise automática via IA dos prints de Relíquias
- [x] Ranking de dano por temporada

## Refatoração Relíquias (v6)

### Remoção de Upload de Imagens
- [x] Remover upload de prints do GvG
- [x] Remover upload de prints do GoT
- [x] Manter registro manual de ataques

### Sistema de Relíquias por Boss
- [x] Criar abas separadas por Boss (Orfeu, Radamantis, Pandora, Gêmeos)
- [x] Gêmeos: 4 colunas para os 4 ataques obrigatórios
- [x] Regras de guardas: Orfeu(5), Radamantis(10), Pandora(15), Gêmeos(20)

### Gestão de 40 Membros Fixos
- [x] Listar sempre os 40 membros escalados em todas as abas
- [x] Função por membro: "Atacar Guardas" ou "Atacar Boss"
- [x] Impedir seleção simultânea de Guardas e Boss

### Campos de Guardas e Desempenho
- [x] Ao selecionar Guardas: campos para Guarda 1 e Guarda 2
- [x] Campo de desempenho em texto livre por membro
- [x] Gêmeos: desempenho separado em cada uma das 4 colunas

### Notificações Telegram Manuais
- [x] Botão 15 minutos antes do evento
- [x] Botão 10 minutos antes do evento
- [x] Botão 5 minutos antes do evento
- [x] Botão 1 minuto antes do evento
- [x] Formato: nome da competição + lista Boss + lista Guardas com números

### Quadro de Avisos
- [ ] Mensagens pré-definidas fixas
- [ ] Mensagens editáveis pelo líder
- [ ] Envio via bot Telegram

## Ajustes v7

### Relíquias
- [x] Remover seção "Progressão de Bosses" da página de Ataques
- [x] Criar tela de Avisos de Relíquias
- [x] Mostrar lista de membros marcados como Boss
- [x] Mostrar lista de membros marcados como Guardas
- [x] Botão para enviar notificação com as listas

### GvG
- [x] Remover campos Oponente 1 e Oponente 2 da página de Ataques

### Notificações
- [x] Ajustar formato da notificação Telegram com listas separadas

## Melhorias v8

### GvG Ataques
- [x] Limite máximo de 60 estrelas no placar
- [x] Estrelas vazadas: amarelas para acerto, cinzas para erro
- [x] Campo para nome da guilda adversária
- [x] Campo de placar do confronto

### GvG Evolução (Nova Página)
- [x] Criar página de Evolução no menu GvG
- [x] Gráfico de linhas mostrando evolução dos membros
- [x] Filtros de período (7/30/90 dias)
- [x] Seleção de membros para comparar
- [x] Top 5 por estrelas totais e média
- [ ] Filtro por temporada/período

### Top 5 Competição Interna
- [x] Top 5 GvG (estrelas totais)
- [x] Top 5 GoT (pontos totais, detalhes ataque/defesa)
- [x] Top 5 Relíquias (dano total)
- [x] Link para histórico individual ao clicar
- [ ] Exibir no Dashboard ou página dedicada

### GoT Ataques
- [x] Manter defesa ativa mesmo quando marcar "não atacou"
- [x] Campos de defesa sempre editáveis independente do status de ataque

## Correções e Melhorias v9

### Bugs
- [x] Corrigir erro insertBefore ao salvar escalação de Relíquias (simplificado Select)
- [x] Corrigir erro avgStars.toFixed na página de Ranking

### Relíquias
- [x] Padrão Boss para todos os membros (alterar manualmente para Guardas)
- [x] Gêmeos: renomear colunas para 1°, 2°, 3°, 4° (remover "Ataque")
- [x] Ordenar membros por dano automaticamente (maior para menor)

### Ranking
- [x] Botão para enviar ranking para o Telegram
- [x] Substituir "Média por Batalha" por "Top 5 Menos Participação"

## Melhorias v10

### Ranking Negativo
- [x] Substituir "Média por Batalha" por ranking de quem menos ataca/participa
- [x] Mostrar escalados que não atacam
- [x] Mostrar membros com desempenho ruim

### Nova Tela "Precisa de Atenção"
- [x] Criar página com dados negativos de cada competição
- [x] GvG: escalados que não atacam, desempenho ruim
- [x] GoT: escalados que não atacam, desempenho ruim
- [x] Relíquias: escalados que não atacam, desempenho ruim

### Avisos GvG
- [x] Alterar "Escalados (20):" para "Escalados salvem suas defesas!"

### Avisos Relíquias
- [x] Ordenar guardas por número (menor para maior)
- [x] Usar "e" ao invés de vírgula (ex: "1 e 2")

## Melhorias v11

### Time Ideal GvG (Nova Página)
- [x] Criar painel Time Ideal GvG no menu GvG
- [x] Score Final: Pontuação (50%) + Execução (30%) + Participação (20%)
- [x] Pontuação: total de estrelas normalizado 0-100
- [x] Execução: penalizar escalado não atacou (alta) e ataque com erro (média)
- [x] Participação: (ataques realizados / escalações) × 100
- [x] Top 20 ordenado por Score Final decrescente
- [x] Desempate: maior pontuação, menos falhas, mais participações
- [x] Exibir: nome, score final, pontuação total, % participação, nº falhas, posição

### Avisos GvG
- [x] Botão "Carregar Escalados" para puxar escalação do dia

### Quadro Estrelas Válidas GvG
- [x] Criar quadro para registro manual de estrelas válidas do jogo

### Evolução GvG
- [x] Remover quadro "Top 5 - Média por Batalha"

### Top 5 - Competição Interna
- [x] Remover quadro "Precisa Melhorar" da aba GvG
- [ ] Corrigir aba Relíquias para puxar dados por Boss
- [ ] Gêmeos: calcular diferença entre ataques (ataque atual - ataque anterior)
- [ ] Gêmeos: quadros separados para cada ataque e total

### Prec### Precisa de Atenção
- [x] Corrigir GoT para puxar dados corretamente (funcionando - mostra 0 quando todos estão OK)
- [x] Corrigir Relíquias para puxar dados corretamente (funcionando - mostra 0 quando todos estão OK)

## Correções v12

### Sub-Admins
- [x] Adicionar campos de login e senha no cadastro de Sub-Admins (já existia)
- [x] Criar tela de login para Sub-Admins (/subadmin-login)
- [x] Implementar autenticação separada para Sub-Admins
- [x] Botão na Home para acessar login de Sub-Admin

### GoT Pontuação
- [x] Cada batalha tem pontuação independente (já funcionava assim)
- [x] Esclarecido que dados são cumulativos do evento inteiro

### GoT Ataques
- [x] Adicionar coluna de pontuação anterior do membro (Pts Anterior)
- [x] Adicionar coluna de Diferença (pontuação atual - anterior)
- [x] Cores indicativas: verde para ganho, vermelho para perda

## Correções v13

### Top 5 Competição Interna
- [x] Pegar dados da última batalha (não cumulativos)
- [x] Cada membro deve mostrar apenas seu último registro

### Precisa de Atenção GoT
- [x] Corrigir para trazer os dados corretamente
- [x] Mostrar membros que não atacaram na última batalha
- [x] Mostrar membros com saldo negativo na última batalha

### Ranking GoT
- [x] Pegar dados não cumulativos (último registro por membro)
- [x] Membros podem ser escalados em diferentes batalhas
- [x] Sempre pegar o último dado de cada membro

### Lembretes Automáticos GoT
- [x] Criar página de Lembretes GoT (/got/avisos)
- [x] Configurar horários de lembrete (13:00 às 22:00)
- [x] Mensagem personalizável com prévia
- [x] Botão para enviar lembrete manualmente
- [x] Mostrar status do dia: escalados, atacaram, faltam

## Melhorias v14 - COMPLETA

### Precisa de Atenção - Escalados sem Ataques
- [x] Buscar em TODAS as batalhas (não apenas última)
- [x] Mostrar em quais batalhas cada escalado não atacou
- [x] Listar histórico de faltas por membro

### Precisa de Atenção - Baixo Aproveitamento
- [x] Criar métrica: (Vitórias Ataque + Vitórias Defesa) / (Total Ataque + Total Defesa)
- [x] Substituir "Saldo Negativo" por "Baixo Aproveitamento"
- [x] Mostrar % de aproveitamento por membro
- [x] Limiar: membros com aproveitamento < 50%

### Automação de Mensagens
- [x] Implementar agendamento automático de mensagens Telegram via cron job
- [x] Disparar lembretes GoT automaticamente nos horários configurados
- [x] Integrar API WhatsApp para envio de mensagens
- [x] Configurar número de WhatsApp para notificações

### Avisos GoT
- [x] Adicionar botão "Carregar Escalados" para puxar escalação do dia

## Melhorias v15 - Integração WhatsApp

### Campo de Telefone
- [x] Adicionar campo phoneNumber à tabela members
- [x] Campo de entrada "Número WhatsApp" no cadastro de membros
- [x] Campo de entrada "Número WhatsApp" na edição de membros
- [x] Formato: +55XXXXXXXXXXX (opcional)

### Biblioteca WhatsApp
- [x] Instalar whatsapp-web.js (v1.34.4)
- [x] Criar serviço WhatsApp em server/whatsapp.ts
- [x] Funções: inicializar cliente, enviar mensagens, envio em lote
- [x] Suporte a menções (@) em mensagens
- [x] Gerenciamento de sessão e status do bot

### Rotas tRPC
- [x] Rota whatsapp.initialize para inicializar bot
- [x] Rota whatsapp.status para obter status
- [x] Rota whatsapp.sendMessage para enviar mensagem
- [x] Rota whatsapp.sendMentionMessage para enviar com menções
- [x] Rota whatsapp.sendGotReminder para lembrete automático GoT
- [x] Rota whatsapp.disconnect para desconectar
- [x] Rota whatsapp.clearSession para limpar sessão

### Testes Unitários
- [x] 9 testes de WhatsApp criados
- [x] Testes de formatação de números de telefone
- [x] Testes de formatação de mensagens GoT
- [x] Testes de status de envio em lote
- [x] Todos os testes passando (49 testes totais)


## Melhorias v16 - Página de Configuração WhatsApp

### Página de Configuração
- [x] Criar rota para gerar QR code do WhatsApp
- [x] Criar página WhatsAppConfig.tsx com UI
- [x] Implementar polling de status do bot (2 segundos)
- [x] Adicionar link no menu de configurações
- [x] Botão para inicializar bot
- [x] Exibição de QR code em tempo real
- [x] Status da conexão (conectado/desconectado/inicializando)
- [x] Botão para desconectar
- [x] Botão para limpar sessão
- [x] Rotas tRPC: initialize, status, getQRCode, clearQRCode, disconnect, clearSession
- [x] Link no sidebar do DashboardLayout
- [x] Título dinâmico na página
- [x] Todos os 49 testes passando


## Melhorias v17 - Preparação para Produção (Chromium)

### Scripts de Instalação
- [ ] Criar script setup-chromium.sh para instalação no servidor
- [ ] Criar script install-dependencies.sh para dependências do sistema
- [ ] Documentar passos de instalação no README

### Configuração de Produção
- [ ] Ajustar whatsapp-web.js para usar Chromium em produção
- [ ] Criar variável de ambiente WHATSAPP_MODE (mock/production)
- [ ] Implementar fallback automático mock → production
- [ ] Adicionar logging detalhado para debug

### Gerenciamento de Sessão
- [ ] Persistir sessão do bot em arquivo ou banco de dados
- [ ] Implementar recuperação automática de sessão após restart
- [ ] Criar mecanismo de limpeza de sessões antigas
- [ ] Adicionar health check do bot

### Documentação
- [ ] Criar DEPLOYMENT.md com instruções de setup
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de troubleshooting
- [ ] Adicionar exemplos de uso em produção


## Melhorias v18 - Migração para Baileys ✅ COMPLETA

- [x] Remover whatsapp-web.js e instalar Baileys
- [x] Reescrever server/whatsapp.ts com Baileys
- [x] Atualizar rotas tRPC para Baileys
- [x] Remover rota clearQRCode (não necessária com Baileys)
- [x] Todos os 49 testes passando
- [x] Bot mais estável e sem necessidade de Chrome


## Melhorias v19 - Novas Funcionalidades (Em Progresso)

### Pausa/Retomada de Cronômetro
- [ ] Adicionar botão Pausar/Retomar no Mapa Estratégia
- [ ] Preservar tempo restante ao pausar
- [ ] Indicador visual de cronômetro pausado

### Bot WhatsApp - Correção de Geolocalização
- [ ] Corrigir problema de geolocalização (Washington DC → Brasil)
- [ ] Integrar ChatGPT API para análise de mensagens
- [ ] Testar conexão com número brasileiro

### Sistema de Temporada GvG
- [ ] Criar página de Controle de Temporada
- [ ] Funcionalidade: Começar Temporada (2 semanas, seg-sab)
- [ ] Retorno automático na segunda-feira
- [ ] Encerrar temporada manualmente
- [ ] Mostrar status da temporada ativa
- [ ] Histórico de temporadas anteriores


## Correções v14 - Integração WhatsApp e Problemas Críticos

### WhatsApp Web
- [x] Implementação de cliente WhatsApp simplificado (mock para sandbox)
- [x] Rotas API para WhatsApp (/api/whatsapp/*)
- [x] Endpoints: connect, disconnect, logout, send-message, send-messages, check-number, status, qr-code
- [x] Integração com Express server
- [x] Inicialização automática ao iniciar servidor

### Problema de Estratégia GoT
- [ ] Corrigir colunas da tabela gotStrategies no banco de dados
- [ ] Executar migration para adicionar campos attackFormation1-3 e defenseFormation1-3
- [ ] Testar criação de estratégia após migration

### Status Atual
- ✅ 49 testes passando
- ✅ Dev server rodando normalmente
- ✅ Rotas WhatsApp implementadas e integradas
- ⚠️ Tabela gotStrategies precisa de migration para adicionar colunas de formações


## Correções v15 - Erro ao Salvar Estratégia GoT RESOLVIDO

### Problema Identificado
- Tabela gotStrategies no banco de dados estava faltando as colunas attackFormation1-3 e defenseFormation1-3
- Função createGotStrategy estava retornando estratégia anterior ao invés da criada

### Solução Implementada
- [x] Adicionar colunas faltantes à tabela gotStrategies (attackFormation1-3, defenseFormation1-3)
- [x] Remover colunas antigas (attackFormation, defenseFormation, keywords, description, winRate)
- [x] Corrigir função createGotStrategy para usar insertId ao invés de buscar por createdBy
- [x] Criar testes para validar funcionalidade de salvamento de estratégia
- [x] Todos os 52 testes passando

### Status Final
- ✅ Funcionalidade de salvar estratégia GoT funcionando corretamente
- ✅ 52 testes passando
- ✅ Dev server rodando normalmente


## Novas Funcionalidades v16 - Envio de Estratégias para Telegram

### Painel de Estratégias GoT
- [x] Interface de seleção de múltiplas estratégias (checkboxes)
- [x] Botão "Enviar para Telegram" para enviar estratégias selecionadas
- [x] Prévia de mensagem antes de enviar
- [x] Integração com Bot do Telegram
- [x] Rota tRPC sendToTelegram implementada
- [x] Todos os 52 testes passando
- [x] Ajustar formato da mensagem para o padrão correto (Ataque x Defesa em colunas)


## Melhorias v17 - Formato de Mensagem e Comando de Estratégias no Bot

### Formato de Mensagem
- [x] Remover repetição de "Estratégias GoT" no título da mensagem
- [x] Manter apenas "📢 *Estratégias GoT*" sem repetir no corpo
- [x] Atualizar formato em sendToTelegram (envio manual)
- [x] Atualizar formato em gotBotIntegration.ts (comando /estratégia)

### Comando de Estratégias no Bot Telegram
- [x] Comando `/estratégia` já implementado no Bot Telegram
- [x] Comando aceita parâmetro opcional (nome do cavaleiro ou estratégia)
- [x] Retorna estratégias que contenham o parâmetro buscado
- [x] Se nenhum parâmetro, retorna todas as estratégias cadastradas
- [x] Formato de resposta atualizado para o padrão correto
- [x] Todos os 52 testes passando


## Bugs v18 - Comando /estratégia não responde no Bot

### Problema
- [ ] Comando `/estratégia` não está respondendo no Bot Telegram
- [ ] Webhook pode não estar configurado corretamente
- [ ] Verificar se o Bot está recebendo as mensagens
- [ ] Verificar se o handler está sendo chamado corretamente
- [ ] Testar webhook com token fornecido: 8425089071:AAHSyCnG_zOl2_1oKabx2vqib7gl1joFEeY

### Status do Debug
- [x] Webhook configurado com sucesso
- [x] Logs de debug adicionados ao webhook e handleEstrategiaCommand
- [x] Dev server rodando com os logs habilitados
- [ ] Testar comando /estrategia novamente e verificar logs


## Novas Funcionalidades v19 - Filtro de Estratégias por Tipo

### Comandos de Filtro
- [x] Implementar comando `/ataque` para buscar estratégias de ataque
- [x] Implementar comando `/defesa` para buscar estratégias de defesa
- [x] Implementar filtro por cavaleiro específico (ex: `/ataque Kanon`)
- [x] Adicionar funções de filtro ao db.ts
- [x] Adicionar handlers ao gotBotIntegration.ts
- [x] Atualizar webhook para processar novos comandos
- [x] Build compilou com sucesso
- [x] Todos os 52 testes passando


## Bugs v20 - Comando /defesa não funciona

### Problema
- [ ] Comando `/defesa` não está respondendo no Bot Telegram
- [ ] Verificar se o handler está sendo chamado
- [ ] Verificar se há erro na função de filtro de defesa
- [ ] Testar comando `/defesa` novamente após correção

### Correção Aplicada
- [x] Reordenado: /ataque e /defesa antes de /estrategia
- [x] Build compilou com sucesso
- [x] Todos os 52 testes passando


## Simplificação v21 - Bot Telegram Simplificado

### Problema
- [ ] Bot não está respondendo aos comandos
- [ ] Remover filtros complexos (/ataque, /defesa)
- [ ] Deixar apenas comando /estrategia simples
- [ ] Simplificar webhook para apenas responder a /estrategia
- [ ] Testar Bot após simplificação

### Simplificação Concluída
- [x] Removidos filtros complexos (/ataque, /defesa)
- [x] Deixado apenas comando /estrategia simples
- [x] Simplificado webhook para apenas responder a /estrategia
- [x] Build compilou com sucesso
- [x] Todos os 52 testes passando
- [x] Servidor reiniciado com versão simplificada


## Novas Funcionalidades v22 - Busca de Ataque/Defesa por Personagem

- [x] Implementar comando `/ataque [nome]` para buscar ataques de um cavaleiro
- [x] Implementar comando `/defesa [nome]` para buscar defesas de um cavaleiro
- [x] Funções de filtro já existem no db.ts
- [x] Atualizar webhook para processar novos comandos
- [x] Adicionar handlers handleAttackCommand e handleDefenseCommand
- [x] Build compilou com sucesso
- [x] Todos os 52 testes passando


## Bugs v23 - Bot parou de funcionar

- [x] Bot está funcionando corretamente! Logs mostram processamento de /ataque Hyoga com sucesso
- [x] Encontradas 3 estratégias de ataque para Hyoga
- [x] Webhook respondendo normalmente


## Melhorias v24 - Health Check e Reinicialização do Bot

- [x] Implementar comando `/status` para verificar se o Bot está respondendo
- [x] Atualizar mensagem de help com novos comandos
- [x] Build compilou com sucesso
- [x] Todos os 52 testes passando
- [x] Servidor reiniciado
- [ ] Implementar comando `/restart` para reiniciar o Bot
- [ ] Adicionar monitoramento de heartbeat do Bot
- [ ] Criar função para detectar congelamento
- [ ] Implementar auto-recovery quando Bot congelar


## Novas Funcionalidades v25 - Melhorias no Sistema de Estratégias

### Painel de Estratégias GoT
- [ ] Adicionar campo "Observação" (opcional) ao formulário de criação de estratégia
- [ ] Permitir salvar estratégia sem nome (nome vazio)
- [ ] Implementar funcionalidade de editar estratégia completa (todas as formações)
- [ ] Adicionar busca por nome da estratégia no painel

### Bot Telegram
- [ ] Implementar comando `/estrategia [nome]` para buscar por nome da estratégia
- [ ] Melhorar formatação das mensagens com emojis (⚔️ e 🛡️)
- [ ] Adicionar espaço entre nome da estratégia e "Ataque x Defesa"
- [ ] Incluir campo de observação na mensagem do Bot (se preenchido)


## Correções v26 - Filtro de Estratégias GoT e Formato de Mensagens

### Filtro de Estratégias GoT
- [x] Corrigir comando `/ataque` para aceitar até 3 nomes
- [x] Corrigir comando `/defesa` para aceitar até 3 nomes
- [x] Implementar busca múltipla (combinar estratégias de vários cavaleiros)
- [x] Remover duplicatas de estratégias encontradas
- [x] Limitar automaticamente a 3 nomes mesmo se receber mais

### Formato de Mensagens
- [x] Corrigir duplicação de respostas do Bot
- [x] Implementar resposta em bloco único (sem múltiplas mensagens)
- [x] Adicionar emoji 🤖 no início da mensagem
- [x] Formato: "🤖 Estratégias de Ataque - [nome]"
- [x] Formato: "🤖 Estratégias de Defesa - [nome]"
- [x] Formato linha: "Ataque⚔️ x 🛡️Defesa"
- [x] Mostrar mensagem "... e mais X estratégias disponíveis" quando houver mais de 5

### Testes
- [x] Criar arquivo gotBotIntegration.test.ts com 11 testes
- [x] Todos os testes passando
- [x] Testar comando sem parâmetros (rejeita)
- [x] Testar comando com até 3 nomes (aceita)
- [x] Testar limite de 3 nomes (limita automaticamente)
- [x] Testar remoção de duplicatas
- [x] Testar formato de mensagem de ataque
- [x] Testar formato de mensagem de defesa
- [x] Testar mensagem de mais estratégias


## Correções v29 - Webhook Telegram
- [x] Corrigir setup do webhook Telegram ao iniciar servidor
- [x] Adicionar chamada setupTelegramWebhookUrl no index.ts
- [x] Testar resposta do Bot aos comandos


## Novas Funcionalidades v30 - Painel GoT + GVG + Primeira Interação
- [x] Duplicar estratégias GoT
- [x] Editar cavaleiros nas estratégias GoT
- [x] Criar painel GVG 5x5 no frontend
- [ ] Implementar primeira interação do Bot (Nick + Guilda)


## Correções v31 - Busca por Palavra-chave e Painel GVG
- [x] Corrigir busca por palavra-chave no Bot (/ataque, /defesa, /dica defesa)
- [ ] Atualizar help com informação sobre busca por keyword
- [x] Criar painel de estratégias GVG 5x5 no frontend


## Painel GVG 5x5 - Concluído
- [x] Criar página GvgStrategiesPanel.tsx (5x5)
- [x] Adicionar link GVG no menu principal (App.tsx)
- [x] Testar painel GVG


## Melhorias v32 - Busca por Nome de Estratégia GoT
- [x] Adicionar função para buscar por nome de estratégia no db.ts
- [x] Atualizar /ataque para buscar por nome de estratégia
- [x] Atualizar /defesa para buscar por nome de estratégia
- [x] Atualizar /dica defesa para buscar por nome de estratégia
- [x] Testar todos os comandos (26 testes passando)


## Correção v33 - Formatação GVG
- [x] Adicionar linha vazia após "Ataque ⚔️ x 🛡️ Defesa" nos comandos GVG


## Implementação v36 - Sistema de Backup Automático

- [ ] Implementar backup automático diário do banco de dados
- [ ] Criar sistema de retenção de 7 dias de backups
- [ ] Adicionar botão de export/download de estratégias no Painel
- [ ] Implementar alertas de deleção de dados
- [ ] Criar documentação de segurança e backup
- [ ] Testar sistema de backup e recuperação


## Implementação v37 - Sistema de Salvamento Automático
- [x] Implementar serviço de salvamento automático a cada 5 minutos
- [x] Adicionar sincronização de dados em tempo real
- [x] Implementar alertas de salvamento
- [x] Testar sistema de salvamento automático (6 testes passando)
- [x] Documentar sistema de backup e salvamento


## Implementação v38 - Export/Import de Estratégias
- [x] Criar rotas tRPC para export de estratégias em JSON
- [x] Criar rotas tRPC para import de estratégias de arquivo JSON
- [x] Implementar UI com botões de export/import no Painel GoT
- [x] Adicionar validação de arquivo JSON importado
- [x] Escrever testes para export/import (14 testes passando)
- [x] Testar e entregar funcionalidade


## Implementação v39 - Sistema de Backup Automático de Estratégias
- [x] Investigar e corrigir bot respondendo 3 vezes ao mesmo comando (desabilitado webhook)
- [x] Implementar backup automático antes de cada operação (create/update/delete)
- [x] Criar tabela de histórico de backups de estratégias
- [x] Implementar sistema de versionamento de estratégias
- [ ] Criar interface para visualizar histórico de backups
- [ ] Implementar botão de restauração de versão anterior
- [x] Adicionar timestamp e informações de autor em cada backup
- [x] Testar sistema de backup e restauração


## Implementação v40 - Pesquisa Avançada de Estratégias GoT com Múltiplos Nomes
- [x] Criar função de busca no backend que aceita até 3 nomes
- [x] Atualizar rota tRPC search para suportar múltiplos nomes
- [x] Melhorar UI da barra de pesquisa com placeholder informativo
- [x] Implementar lógica de filtro com AND/OR para múltiplos nomes
- [x] Criar testes para pesquisa com 1, 2 e 3 nomes
- [ ] Testar no navegador e entregar funcionalidade


## Implementação v41 - Correção de Bot Duplicado e Limpeza do Painel
- [x] Investigar por que bot ainda está duplicando respostas
- [x] Implementar deduplicação robusta com hash de mensagens
- [x] Remover caixa de informações "Como solicitar estratégias ao Bot Telegram" do painel
- [x] Melhorar polling com cache TTL
- [x] Entregar correções


## Implementação v42 - Sistema de Backup Completo do Sistema
- [x] Criar tabelas para armazenar backups completos (metadados + arquivo comprimido)
- [x] Implementar serviço de backup completo (exportar banco de dados + estratégias)
- [x] Implementar serviço de restauração de backup
- [x] Criar UI no Dashboard com botões de backup/restauração
- [x] Adicionar histórico de backups com data/hora/tamanho
- [x] Implementar export de backup como JSON
- [x] Entregar funcionalidade


## Implementação v43 - Comandos /gvg Independentes (Ataque, Defesa, Dica)
- [x] Adicionar 3 funções de busca GVG em db.ts para até 5 nomes
  - [x] searchGvgStrategiesByMultipleNamesInAttack()
  - [x] searchGvgStrategiesByMultipleNamesInDefense()
  - [x] searchGvgDefenseTips()
- [x] Implementar 3 handlers de comando em gotBotIntegration.ts
  - [x] handleGvgAttackCommandNew()
  - [x] handleGvgDefenseCommandNew()
  - [x] handleGvgDicaCommand()
- [x] Registrar rotas /gvg ataque, /gvg defesa, /gvg dica no webhook
- [x] Criar testes automatizados para os novos handlers (10 testes passando)
- [x] Salvar checkpoint com todas as mudanças


## Melhorias v20 - Painel de Gerenciamento de Cartas ✅ COMPLETA

### Database & Backend
- [x] Criar tabela `cards` no banco de dados
- [x] Criar tabela `cardBackups` para histórico
- [x] Implementar funções CRUD em `server/db.ts`
- [x] Implementar funções de Export/Import
- [x] Criar testes unitários com 19 testes (todos passando ✓)

### API & tRPC Procedures
- [x] Criar router `cards` com 8 procedimentos
- [x] Procedimentos: list, search, getById, create, update, delete, export, import

### Frontend UI
- [x] Criar página `CardsPanel.tsx` com interface completa
- [x] Formulário modal para criar/editar cartas
- [x] Grid de cartas com visualização de atributos
- [x] Campo de busca para filtrar cartas
- [x] Botões de Editar e Deletar
- [x] Botões de Exportar e Importar (JSON)
- [x] Exibição de imagem e link de referência
- [x] Validação de formulário
- [x] Adicionar rota `/cartas` em App.tsx

### Testing
- [x] 19 testes unitários criados e passando
- [x] Cobertura: CRUD, busca, export/import, casos extremos

### Funcionalidades Implementadas
- [x] Criar nova carta com todos os atributos
- [x] Editar carta existente
- [x] Deletar carta
- [x] Buscar cartas por nome
- [x] Listar todas as cartas
- [x] Exportar cartas como JSON
- [x] Importar cartas de JSON
- [x] Visualizar atributos de bônus (DMG, Def, Vidância, Pressão, Esquiva, Vel.Ataque, Tenacidade, Sanguessuga, RedDano, TaxCrit)
- [x] Campo de limite de uso (Todos, Leão|Fênix, etc)
- [x] Campo de efeito da habilidade
- [x] Campo de imagem (URL)
- [x] Campo de link de referência

### Próximas Etapas (Futuro)
- [ ] Integração com IA para análise de compatibilidade carta x cavaleiro
- [ ] Comandos de bot Telegram para consultar cartas
- [ ] Filtros avançados e ordenação
- [ ] Upload de imagens direto na interface
- [ ] Comparação entre cartas
- [ ] Sistema de favoritos

### Menu Integration
- [x] Adicionar item "Cartas" no sidebar do DashboardLayout
- [x] Ícone roxo (Wand2) para o menu de Cartas
- [x] Título dinâmico "Cartas" na página


## Melhorias v21 - Menu de Personagens (Em Progresso)

### Database & Backend
- [ ] Criar tabela `characters` com dados básicos dos cavaleiros
- [ ] Criar tabela `characterSkills` para habilidades
- [ ] Criar tabela `characterCloth` para armadura
- [ ] Criar tabela `characterConstellations` para constelações
- [ ] Criar tabela `characterLinks` para sinergias
- [ ] Implementar scraper para extrair dados do ssloj.com
- [ ] Criar funções CRUD em `server/db.ts` para personagens
- [ ] Implementar sincronização automática com ssloj.com

### API & tRPC Procedures
- [ ] Criar router `characters` com procedimentos:
  - [ ] list: Listar todos os cavaleiros
  - [ ] search: Buscar cavaleiros por nome
  - [ ] getById: Buscar cavaleiro por ID
  - [ ] getByClass: Filtrar por classe
  - [ ] getByType: Filtrar por tipo
  - [ ] sync: Sincronizar dados do ssloj.com

### Frontend UI
- [ ] Criar página `CharactersPanel.tsx` com:
  - [ ] Grid de cavaleiros com imagens
  - [ ] Filtros por Classe, Tipo, Tipo de Invocação
  - [ ] Campo de busca por nome
  - [ ] Página detalhada de cavaleiro com:
    - [ ] Informações básicas
    - [ ] Habilidades (Skills)
    - [ ] Armadura (Cloth)
    - [ ] Constelações (Constellations)
    - [ ] Sinergias (Links)
  - [ ] Botão de sincronização manual
  - [ ] Exibição de cartas recomendadas

### Integration
- [ ] Integrar com sistema de Cartas para recomendações
- [ ] Mostrar cartas compatíveis por cavaleiro
- [ ] Criar sistema de sinergias carta x cavaleiro

### Testing
- [ ] Testes unitários para funções de scraper
- [ ] Testes unitários para CRUD de personagens
- [ ] Testes de sincronização

### Menu
- [ ] Adicionar item "Personagens" no sidebar
- [ ] Ícone apropriado para o menu


## Melhorias v21 - Menu de Personagens

### Painel de Personagens
- [x] Criar tabelas de banco de dados para personagens
- [x] Tabelas: characters, character_skills, character_cloth, character_constellations, character_links
- [x] Implementar scraper para extrair dados do ssloj.com
- [x] Criar funções CRUD para personagens em server/db.ts
- [x] Criar router tRPC para personagens
- [x] Criar página React de personagens com interface
- [x] Adicionar menu "Personagens" ao sidebar
- [x] Busca por nome de personagem
- [x] Filtro por classe (Protector, Warrior, Skilled, Assassin, Assist)
- [x] Filtro por tipo (Water, Fire, Air, Earth, Light, Dark)
- [x] Grid de cartas com informações básicas (HP, ATK, DEF)
- [x] Link para visualizar no SSLOJ
- [x] Criar, editar e deletar personagens
- [x] Export/Import de personagens em JSON
- [x] 12 testes unitários (todos passando ✓)

### Correções v21.1
- [x] Corrigir erro de Select.Item com value vazio (remover item "Todas")
- [x] Adicionar botão "Limpar filtro" para remover filtros aplicados

### Próximas Melhorias
- [ ] Integração com IA para recomendações de cartas por cavaleiro
- [ ] Comandos Telegram para consultar personagens
- [ ] Filtros avançados por atributo mínimo
- [ ] Sincronização automática com ssloj.com


## Melhorias v22 - Recomendador de Cartas com IA

### Painel de Recomendador de Cartas
- [x] Criar procedimento tRPC para gerar recomendações com IA
- [x] Integrar invokeLLM para analisar atributos do cavaleiro
- [x] Criar página React do Recomendador de Cartas
- [x] Seletor de cavaleiro com busca
- [x] Exibir atributos do cavaleiro selecionado
- [x] Grid de cartas recomendadas com explicação
- [x] Adicionar menu "Recomendador" ao sidebar
- [x] Criar testes unitários para recomendações (10 testes passando ✓)


## Melhorias v23 - Integração com IA (Chat, Análise, Bot Telegram)

### Chat de IA no Painel
- [ ] Criar tabela de histórico de chats no banco de dados
- [ ] Implementar procedimento tRPC para enviar mensagens ao chat
- [ ] Criar página React com interface de chat
- [ ] Adicionar histórico de conversas
- [ ] Adicionar menu "Chat IA" ao sidebar

### Análise de Estratégias com IA
- [ ] Criar procedimento tRPC para analisar estratégias
- [ ] Integrar análise com dados de estratégias existentes
- [ ] Criar interface para exibir análises
- [ ] Adicionar botão "Analisar com IA" nas estratégias

### Bot Telegram com IA
- [ ] Implementar comando /ia no bot Telegram
- [ ] Integrar invokeLLM no handler do comando
- [ ] Adicionar contexto de cavaleiros e cartas
- [ ] Testar comando com membros

### Testes e Finalização
- [ ] Criar testes unitários para integração com IA
- [ ] Testar chat no painel
- [ ] Testar análise de estratégias
- [ ] Testar comando /ia no Telegram


## Melhorias v23 - Chat com IA

### Chat de IA no Painel
- [x] Criar tabelas de histórico de chats no banco de dados
- [x] Implementar router tRPC para enviar mensagens ao chat
- [x] Criar página React com interface de chat
- [x] Adicionar histórico de conversas em memória
- [x] Adicionar menu "Chat IA" ao sidebar com ícone Sparkles
- [x] Suporte a 3 contextos: general, strategy, card
- [x] Integração com invokeLLM para respostas de IA
- [x] Criar testes unitários para Chat IA (11 testes passando ✓)

### Próximas Melhorias
- [ ] Análise de Estratégias com IA
- [ ] Comando /ia no Bot Telegram
- [ ] Persistência de histórico em banco de dados
- [ ] Exportar conversas como PDF
- [ ] Suporte a múltiplas sessões de chat


## Melhorias v24 - Comando /ia no Bot Telegram

### Comando /ia no Bot Telegram
- [x] Implementar handler do comando /ia no gotBotIntegration.ts
- [x] Integrar invokeLLM para respostas de IA
- [x] Adicionar roteamento do comando /ia no botWebhook.ts
- [x] Suporte a perguntas sobre estratégias, cartas e cavaleiros
- [x] Dividir respostas longas em múltiplos chunks (limite Telegram 4096 caracteres)
- [x] Adicionar comando /ia à mensagem de ajuda (/help)
- [x] Criar testes unitários para comando /ia (12 testes passando ✓)
- [x] Suporte a múltiplos usuários e perguntas consecutivas

### Próximas Melhorias
- [ ] Histórico de conversas por usuário no Telegram
- [ ] Análise de estratégias com IA
- [ ] Persistência de histórico em banco de dados
- [ ] Exportar conversas como PDF


## Melhorias v25 - Análise de Cartas (Arayashiki) com IA

### Painel de Análise de Cartas com IA
- [ ] Criar tabela de Arayashiki no banco de dados
- [ ] Implementar scraper para extrair dados das cartas do ssloj.com
- [ ] Criar funções CRUD para Arayashiki em server/db.ts
- [ ] Criar router tRPC para análise de cartas com IA
- [ ] Integrar invokeLLM para análise de sinergia entre cartas
- [ ] Criar painel React de análise de cartas
- [ ] Seletor de cavaleiro para análise
- [ ] Recomendações de cartas baseado em atributos
- [ ] Análise de sinergia entre cartas
- [ ] Adicionar menu de "Análise de Cartas" ao sidebar
- [ ] Criar testes unitários para análise de cartas


## Melhorias v25 - Análise de Cartas (Arayashiki) com IA

### Painel de Análise de Cartas
- [x] Criar tabelas de Arayashiki no banco de dados
- [x] Implementar scraper para extrair dados do ssloj.com/arayashikis
- [x] Criar funções CRUD para gerenciar cartas
- [x] Criar router tRPC para análise de cartas com IA
- [x] Criar página React com 3 abas (Analisar Cavaleiro, Sinergia, Build)
- [x] Integrar invokeLLM para análise de cartas
- [x] Adicionar menu "Analise de Cartas" ao sidebar
- [x] Criar testes unitários para análise de cartas (19 testes passando ✓)

### Funcionalidades Implementadas
- [x] Aba 1: Analisar Cavaleiro - IA recomenda cartas para um cavaleiro específico
- [x] Aba 2: Sinergia de Cartas - Analisa como duas cartas funcionam juntas
- [x] Aba 3: Gerar Build - Cria composição otimizada por papel (Atacante/Defensor/Suporte)
- [x] Grid de cartas disponíveis no sistema
- [x] Busca e filtros de cartas
- [x] Respostas formatadas em markdown com Streamdown

### Próximas Melhorias
- [ ] Persistência de histórico de análises no banco de dados
- [ ] Comparação de múltiplos builds
- [ ] Integração com painel de Personagens para recomendações automáticas
- [ ] Sincronização automática com ssloj.com para atualizar dados de cartas
- [ ] Comando `/analise [cavaleiro]` no Bot Telegram para consultas rápidas


## Melhorias v26 - Sincronização de Cartas em Português

### Painel de Sincronização de Cartas (Arayashiki)
- [x] Criar tabela de Arayashiki no banco de dados com campos em português
- [x] Implementar scraper para extrair dados do ssloj.com/arayashikis
- [x] Extrair nome em português, descrição, atributos, recomendações
- [x] Criar router tRPC para sincronizar cartas
- [x] Implementar busca por nome em português
- [x] Implementar filtros por qualidade (Lendária, Épica, Rara, Comum)
- [x] Implementar filtros por raridade (1-6 estrelas)
- [x] Criar página React de sincronização com interface intuitiva
- [x] Exibir grid de cartas com imagem, nome, raridade, qualidade, atributos
- [x] Adicionar links para página original no SSLOJ
- [x] Adicionar menu "Sincronizar Cartas" ao sidebar
- [x] Criar testes unitários para sincronização (12 testes passando ✓)

### Próximas Melhorias
- [ ] Persistência de histórico de sincronizações
- [ ] Comando `/cartas [nome]` no Bot Telegram para consultar cartas
- [ ] Integração com análise de IA para recomendações por cavaleiro
- [ ] Sincronização automática periódica com SSLOJ
- [ ] Comparação de builds com cartas recomendadas


## Melhorias v27 - Análise de Cartas com IA

### Painel de Análise de Cartas com IA
- [ ] Criar router tRPC para análise de cartas com invokeLLM
- [ ] Adicionar botão "Analisar com IA" no painel de sincronização de cartas
- [ ] Criar modal de recomendações de builds por cavaleiro
- [ ] Gerar recomendações automáticas baseado em atributos da carta
- [ ] Sugerir melhores cavaleiros para cada carta
- [ ] Implementar cache de análises para performance
- [ ] Adicionar histórico de análises realizadas
- [ ] Criar testes unitários para análise com IA


## Melhorias v27 - Análise de Cartas com IA

### Painel de Análise de Cartas com IA
- [x] Criar router tRPC para análise de cartas com IA
- [x] Integrar invokeLLM para gerar análises detalhadas
- [x] Adicionar botão "Analisar com IA" no painel de cartas
- [x] Criar modal para exibir recomendações de builds
- [x] Implementar análise de compatibilidade entre cartas
- [x] Adicionar comparação de cartas com IA
- [x] Criar testes unitários para análise com IA (11 testes passando ✓)

### Status
- ✓ Router de análise de cartas criado
- ✓ Integração com LLM funcionando
- ✓ Painel React com botão de análise
- ✓ Modal de recomendações implementado
- ✓ Testes unitários passando


## Painel de Compra e Venda de Contas de Jogos (v13)

### Frontend - Painel de Contas
- [ ] Criar página de Painel de Contas no menu principal
- [ ] Formulário com campos: Nome do Jogo, Preço (R$), Descrição, Upload de Imagens
- [ ] Botão "Anunciar Conta" para enviar dados
- [ ] Seção de Controle do Scheduler:
  - [ ] Campo para definir intervalo de reenvio (em minutos)
  - [ ] Botão ▶ Iniciar scheduler
  - [ ] Botão ⏸ Pausar scheduler
  - [ ] Indicador visual (Ativo/Pausado)
  - [ ] Lista de contas cadastradas com opção de remover

### Backend - API de Contas
- [ ] Endpoint POST /api/contas/anunciar - recebe dados e salva em JSON
- [ ] Endpoint GET /api/contas - retorna lista de contas salvas
- [ ] Endpoint DELETE /api/contas/:id - remove uma conta
- [ ] Endpoint POST /api/scheduler/start - inicia scheduler com intervalo
- [ ] Endpoint POST /api/scheduler/stop - pausa scheduler
- [ ] Endpoint GET /api/scheduler/status - retorna status do scheduler

### Integração Telegram
- [ ] Função para enviar mensagem formatada ao Telegram
- [ ] Função para enviar múltiplas imagens ao Telegram
- [ ] Formato: 🎮 *Nova Conta à Venda!* com detalhes

### Scheduler Automático
- [ ] Implementar scheduler com node-cron
- [ ] Loop de reenvio a cada intervalo configurável
- [ ] Delay de 3 segundos entre envios (anti-flood)
- [ ] Suporte a ajuste dinâmico do intervalo sem reiniciar
- [ ] Novas contas entram automaticamente no próximo ciclo
- [ ] Persistência de contas em arquivo JSON local

### Arquivo de Dados
- [ ] Criar contas.json para persistir dados das contas
- [ ] Estrutura: id, gameName, price, description, images[], createdAt
