# Documentação do ControlHub Access

## Visão Geral

ControlHub Access é um sistema de controle de acesso para visitantes, desenvolvido para gerenciar entradas e saídas em condomínios ou edifícios. O sistema permite registrar visitantes, controlar seus acessos e manter um histórico de visitas.

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TailwindCSS, Shadcn/UI (Radix UI)
- **Backend**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Linguagens**: TypeScript, SQL
- **Gerenciamento de Estado**: React Query (TanStack Query)
- **Validação de Formulários**: React Hook Form, Zod
- **Estilização**: TailwindCSS, Tailwind Merge

## Estrutura do Banco de Dados

### Tabela: Visitors (Visitantes)
- **id**: Chave primária (UUID)
- **name**: Nome do visitante
- **cpf**: CPF do visitante (único)
- **photo**: Caminho da foto do visitante
- **createdAt**: Data de registro
- **visit_count**: Contador de visitas
- **last_entry_time**: Timestamp da última entrada
- **visiting_apartment**: Apartamento que está visitando
- **in**: Booleano que indica se o visitante está dentro do prédio

### Tabela: AccessLog (Logs de Acesso)
- **id**: Chave primária (UUID)
- **visitorId**: ID do visitante (chave estrangeira)
- **going_to_ap**: Apartamento de destino
- **authBy**: Quem autorizou a entrada
- **photoPath**: Caminho da foto capturada na entrada
- **lastAccess**: Timestamp do último acesso
- **createdAt**: Data de criação do registro

## Funções do Banco de Dados

- **increment_visit_count**: Incrementa o contador de visitas de um visitante

## Arquitetura do Projeto

### Diretórios Principais
- **/src/app**: Componentes principais da aplicação Next.js
- **/src/components**: Componentes reutilizáveis da interface
- **/src/lib**: Bibliotecas e serviços de integração com o backend
- **/src/utils**: Funções utilitárias
- **/src/hooks**: Hooks personalizados React
- **/src/generated**: Código gerado automaticamente (Prisma)
- **/prisma**: Configuração do ORM Prisma

### Componentes Principais
- **EntranceForm**: Formulário para registro de entrada de visitantes
- **EntranceHistory**: Histórico de entradas no edifício
- **BuildingRegistry**: Registro de visitantes no prédio
- **PhotoCapture**: Componente para captura de fotos
- **QuickEntryDialog**: Diálogo para entrada rápida de visitantes

### APIs e Serviços
- **/src/lib/supabase-api.ts**: Interfaces com o Supabase
  - Funções para gerenciar visitantes (CRUD)
  - Funções para gerenciar logs de acesso
  - Upload e gerenciamento de fotos

## Funcionalidades Principais

1. **Registro de Visitantes**:
   - Cadastro de novos visitantes com nome, CPF e foto
   - Validação de CPF para evitar duplicações

2. **Controle de Acesso**:
   - Registro de entradas de visitantes
   - Identificação do apartamento de destino
   - Registro de quem autorizou a entrada

3. **Histórico de Visitas**:
   - Visualização de todas as entradas registradas
   - Filtragem por visitante, data ou apartamento

4. **Dashboard**:
   - Visão geral das estatísticas de acesso
   - Monitoramento de visitantes atuais no prédio

5. **Suporte Offline**:
   - Utilização de dados mockados quando sem conexão com o Supabase
   - Sincronização quando a conexão for restabelecida

## Modo de Desenvolvimento

O projeto inclui:
- Ambiente de desenvolvimento com Next.js
- Suporte a dados mockados (db.json) para desenvolvimento offline
- Integração com Supabase para ambiente de produção

## Responsividade e UX

- Suporte a dispositivos móveis (hook useMobile)
- Sistema de notificações (use-toast)
- Tema claro/escuro (theme-provider)

## Requisitos de Sistema

- Node.js
- PostgreSQL (via Supabase)
- Navegador moderno com suporte à API de câmera (para captura de fotos)

## Fluxo de Funcionamento

1. **Cadastro de Visitante**:
   - Preenchimento de dados (nome, CPF)
   - Captura de foto
   - Armazenamento no banco de dados

2. **Registro de Entrada**:
   - Busca de visitante por CPF
   - Seleção do apartamento de destino
   - Identificação de quem autorizou
   - Registro do log de acesso

3. **Monitoramento**:
   - Visualização de visitantes atualmente no prédio
   - Consulta ao histórico de acessos

Esta documentação fornece uma visão abrangente do projeto ControlHub Access, detalhando sua estrutura, funcionalidades e tecnologias utilizadas.
