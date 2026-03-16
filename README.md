# 🚀 AIOX Web Dashboard

Dashboard web profissional para **AIOX Engine** com autenticação, gerenciamento de time e sincronização em tempo real. Construído com **React 19**, **TypeScript**, **Tailwind CSS** e hospedado em **Vercel** com dados em **Supabase**.

## 🎯 Funcionalidades

- ✅ **Autenticação Completa** - Login/Registro com Supabase Auth
- ✅ **Dashboard em Tempo Real** - Monitoramento de eventos e métricas do AIOX Engine
- ✅ **Gerenciamento de Agentes** - Listar, monitorar e executar agentes
- ✅ **Histórico de Eventos** - Auditoria completa com filtros avançados
- ✅ **Gerenciamento de Time** - Convidar membros, gerenciar permissões
- ✅ **Configurações Personalizadas** - Tema, notificações, URL do engine
- ✅ **Design Cockpit** - Interface AIOX Cockpit (neon + brutalist)
- ✅ **Responsive** - Funciona em desktop, tablet e mobile

## 📋 Pré-requisitos

- Node.js v18+
- npm v9+
- Conta Supabase (gratuita em supabase.com)
- Projeto AIOX Core rodando localmente

## 🛠️ Instalação Local

### 1. Clone o repositório

```bash
cd aiox-web-dashboard
npm install
```

### 2. Configure as variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_AIOX_ENGINE_URL=http://localhost:4002
```

### 3. Obtenha suas credenciais Supabase

1. Vá para [supabase.com](https://supabase.com)
2. Crie um novo projeto ou use um existente
3. Na aba **Settings → API**, copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configure o Supabase (Banco de Dados)

Execute o SQL no **Supabase SQL Editor**:

```sql
-- Tabela de eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela de times
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de membros do time
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view events in their team" ON events
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their team" ON events
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their team" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    ) OR owner_id = auth.uid()
  );

CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX events_team_id_created_at ON events(team_id, created_at DESC);
CREATE INDEX events_agent_name ON events(agent_name);
CREATE INDEX team_members_user_id ON team_members(user_id);
```

### 5. Inicie o desenvolvimento

```bash
npm run dev
```

O dashboard abrirá em **http://localhost:3000**

## 📦 Estrutura do Projeto

```
aiox-web-dashboard/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Monitor em tempo real
│   │   ├── Agents.tsx         # Gerenciamento de agentes
│   │   ├── History.tsx        # Auditoria de eventos
│   │   ├── Team.tsx           # Gerenciamento de time
│   │   ├── Settings.tsx       # Configurações do usuário
│   │   ├── Login.tsx          # Autenticação
│   │   └── Register.tsx       # Registro de usuários
│   ├── components/
│   │   └── Navigation.tsx     # Barra de navegação
│   ├── lib/
│   │   ├── supabase.ts        # Cliente Supabase
│   │   └── aiox.ts            # Cliente AIOX Engine
│   ├── App.tsx                # Roteamento principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais
├── vite.config.ts             # Config Vite + React
├── tailwind.config.js         # Config Tailwind CSS
├── vercel.json                # Config deploy Vercel
├── package.json               # Dependências
└── tsconfig.json              # Config TypeScript
```

## 🚀 Deploy em Vercel

### 1. Configure o repositório Git

```bash
git init
git add .
git commit -m "Initial commit: AIOX Web Dashboard"
git remote add origin https://github.com/seu-usuario/aiox-web-dashboard.git
git push -u origin main
```

### 2. Importe para Vercel

1. Vá para [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Digite a URL do seu repositório
4. Clique **Import**

### 3. Configure as variáveis de ambiente no Vercel

Na página do projeto → **Settings → Environment Variables**:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-chave-anon
VITE_AIOX_ENGINE_URL = https://seu-aiox-engine.com (ou localhost)
```

### 4. Deploy

Clique em **Deploy** e aguarde a conclusão (geralmente 2-3 minutos).

## 📱 Uso da Aplicação

### 1. Cadastro e Login

```
Email: seu@email.com
Senha: sua-senha-segura (mín. 6 caracteres)
```

### 2. Dashboard

- Visualiza última 20 eventos em tempo real
- Mostra agentes ativos
- Exibe métricas resumidas (total, ativos, taxa de sucesso)

### 3. Agentes

- Lista todos os agentes disponíveis no AIOX Engine
- Permite executar agentes (se status = active)
- Mostra última execução de cada agente

### 4. Histórico

- Auditoria completa de eventos com filtros
- Busca por tipo, agente ou status
- Expandir para ver detalhes JSON dos eventos

### 5. Time

- Convidar novos membros por email
- Definir roles (member, admin, owner)
- Remover membros (não é possível remover a si mesmo)

### 6. Configurações

- Alterar senha
- Configurar URL customizada do AIOX Engine
- Habilitar/desabilitar sincronização automática
- Deletar sua conta (irreversível)

## 🔌 Integração com AIOX Engine

O dashboard se conecta ao **AIOX Engine** (:4002) para buscar:

- **GET /api/events** - Últimos eventos
- **GET /api/agents** - Lista de agentes
- **GET /api/agents/:id** - Detalhes do agente
- **POST /api/agents/:id/execute** - Executar agente
- **GET /api/metrics** - Métricas do sistema
- **GET /api/health** - Status de saúde

## 🔒 Segurança

- ✅ Autenticação JWT via Supabase
- ✅ Row Level Security (RLS) no Supabase
- ✅ Variáveis de ambiente para credenciais
- ✅ Proteção contra CSRF
- ✅ Validação de entrada em formulários

## 📊 Monitoramento

Para monitorar o dashboard em produção:

1. **Vercel Analytics** - Performance e erro reporting
2. **Supabase Logs** - Queries de banco de dados
3. **Vercel Logs** - Saída da aplicação

## ⚡ Performance

- Build otimizado com Vite (~1.5MB gzip)
- Code splitting automático por rota
- Images lazy-loaded
- Cache no navegador (localStorage)

## 🛠️ Desenvolvimento

### Scripts disponíveis:

```bash
npm run dev          # Inicia Vite dev server
npm run build        # Build para produção
npm run preview      # Preview do build
npm run type-check   # Check tipos TypeScript
npm run lint         # Lint com ESLint
```

### Dicas de desenvolvimento:

- Use `npm run dev` para desenvolvimento com hot reload
- TypeScript ajuda a pegar erros em tempo de compilação
- Tailwind CSS sugere classes enquanto digita

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave pública Supabase | `eyJhbGc...` |
| `VITE_AIOX_ENGINE_URL` | URL do AIOX Engine | `http://localhost:4002` |

## 🐛 Troubleshooting

### "Supabase connection failed"
- Verifique as variáveis de ambiente em `.env.local`
- Confirme que o projeto Supabase está ativo

### "AIOX Engine unreachable"
- Verifique se o AIOX Core está rodando: `npm run dev` na pasta aiox-core
- Confirme que a porta 4002 está acessível

### "Build fails on Vercel"
- Rode `npm run build` localmente e veja o erro
- Verifique se todas as variáveis de ambiente estão configuradas

## 📚 Recursos

- [Documentação React 19](https://react.dev)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [AIOX Core](https://github.com/SynkraAI/aiox-core)

## 📄 Licença

MIT - Veja LICENSE.md

## 👥 Suporte

- 📧 Email: support@aiox.dev
- 💬 Discord: [Link do servidor]
- 🐛 Issues: GitHub Issues

---

**Desenvolvido com ⚡ por SynkraAI**
