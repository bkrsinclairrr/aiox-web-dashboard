# 🎯 Guia Completo: AIOX Web Dashboard com Vercel + Supabase

Um guia passo a passo para configurar o dashboard web profissional do AIOX com Vercel e Supabase.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Criar Projeto Supabase](#criar-projeto-supabase)
3. [Executar Setup SQL](#executar-setup-sql)
4. [Configurar Autenticação](#configurar-autenticação)
5. [Deploy em Vercel](#deploy-em-vercel)
6. [Verificar Funcionamento](#verificar-funcionamento)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- ✅ Node.js v18+ instalado
- ✅ npm v9+ instalado
- ✅ Conta GitHub (para source control)
- ✅ Conta Vercel (gratuita, integrada com GitHub)
- ✅ Conta Supabase (gratuita)
- ✅ AIOX Core rodando em `localhost:4002`

## 📦 Criar Projeto Supabase

### Passo 1: Criar Conta Supabase

1. Vá para [supabase.com](https://supabase.com)
2. Clique em **Start your project**
3. Faça login com GitHub ou outro método
4. Autorize o Supabase a acessar sua conta GitHub

### Passo 2: Criar Novo Projeto

1. No dashboard, clique em **New Project**
2. Escolha a **Organization** (padrão: sua conta pessoal)
3. Digite o **Project Name**: `aiox-dashboard`
4. Escolha a **Database Password** (anote-a bem)
5. Selecione a **Region** mais próxima (ex: us-east-1)
6. Clique em **Create new project**

⏳ Aguarde 2-3 minutos para o projeto estar pronto...

### Passo 3: Obter Credenciais

1. Quando pronto, vá para **Settings → API**
2. Copie estas informações:
   - **Project URL** (ex: `https://seu-projeto.supabase.co`)
   - **anon public key** (chave longa começando com `eyJhbGc...`)
3. Salve em um arquivo seguro para depois

## 🗄️ Executar Setup SQL

### Passo 1: Abrir SQL Editor

1. No dashboard Supabase, clique em **SQL Editor**
2. Clique no ícone **+** para nova query

### Passo 2: Criar Tabelas

Cole este SQL:

```sql
-- ======================================
-- AIOX Web Dashboard - Database Schema
-- ======================================

-- Tabela: events
-- Armazena todos os eventos do AIOX Engine
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  data JSONB DEFAULT '{}',
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'pending'))
);

-- Tabela: teams
-- Agrupa usuários e seus dados
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: team_members
-- Membros de cada time com roles
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member')),
  UNIQUE(team_id, user_id)
);

-- Tabela: audit_logs
-- Log de todas as ações para auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: invitations
-- Convites para novos membros do time
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
-- ÍNDICES para Performance
-- ======================================

CREATE INDEX events_team_id_created_at ON events(team_id, created_at DESC);
CREATE INDEX events_agent_name ON events(agent_name);
CREATE INDEX events_status ON events(status);
CREATE INDEX team_members_user_id ON team_members(user_id);
CREATE INDEX team_members_team_id ON team_members(team_id);
CREATE INDEX audit_logs_team_id ON audit_logs(team_id, created_at DESC);
CREATE INDEX audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX invitations_team_id ON invitations(team_id);

-- ======================================
-- ROW LEVEL SECURITY (RLS)
-- ======================================

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Políticas: Events
-- Usuários podem ver eventos de seus times
CREATE POLICY "Users can view events in their team" ON events
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem criar eventos em seus times
CREATE POLICY "Users can create events in their team" ON events
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Admins podem atualizar eventos
CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (
    (SELECT role FROM team_members 
     WHERE team_id = events.team_id AND user_id = auth.uid()) 
    IN ('owner', 'admin')
  );

-- Políticas: Teams
-- Usuários podem ver seus times
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Owner pode atualizar seu time
CREATE POLICY "Owner can update team" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

-- Usuários podem criar times
CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Políticas: Team Members
-- Usuários podem ver membros de seus times
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Admins podem adicionar membros
CREATE POLICY "Admins can insert team members" ON team_members
  FOR INSERT WITH CHECK (
    (SELECT role FROM team_members 
     WHERE team_id = team_members.team_id AND user_id = auth.uid()) 
    IN ('owner', 'admin')
  );

-- Admins podem remover membros
CREATE POLICY "Admins can delete team members" ON team_members
  FOR DELETE USING (
    (SELECT role FROM team_members tm2
     WHERE tm2.team_id = team_members.team_id AND tm2.user_id = auth.uid()) 
    IN ('owner', 'admin')
  );

-- Políticas: Audit Logs
-- Todos podem ver logs de seus times
CREATE POLICY "Users can view audit logs of their team" ON audit_logs
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Logs são apenas inseríveis (append-only)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Políticas: Invitations
-- Admins podem ver convites do seu time
CREATE POLICY "Admins can view invitations" ON invitations
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Admins podem criar convites
CREATE POLICY "Admins can create invitations" ON invitations
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
    AND invited_by = auth.uid()
  );

-- ======================================
-- FUNÇÕES SQL
-- ======================================

-- Função: auto_update_team_updated_at
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: teams.updated_at
CREATE TRIGGER teams_updated_at_trigger
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_teams_updated_at();

-- Função: criar time automaticamente
CREATE OR REPLACE FUNCTION create_default_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO teams (name, description, owner_id)
  VALUES (
    'Meu Time ' || NEW.email,
    'Time padrão para ' || NEW.email,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Criar time padrão para novo usuário
CREATE TRIGGER create_default_team_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_team();
```

### Passo 3: Executar Query

1. Clique em **Run** (botão azul)
2. Aguarde a execução (você verá "Success")
3. Vá para **Table Editor** para verificar as tabelas criadas

## 🔐 Configurar Autenticação

### Passo 1: Habilitar Email/Password Auth

1. Vá para **Authentication → Providers**
2. Procure por **Email**
3. Ative o toggle **Enable Email provider**
4. Em **Email/Password settings**:
   - ✅ Require email verification (opcional)
   - ✅ Auto confirm user (ou desative para verificação)
5. Clique **Save**

### Passo 2: Configurar Mailer (opcional)

Para enviar emails de verificação:

1. Vá para **Authentication → Email Templates**
2. Customize os templates de email
3. Ou configure SMTP customizado em **Settings → Email**

### Passo 3: Configurar OAuth (Google, GitHub, etc.)

Para login social (recomendado):

1. **Google OAuth**:
   - Vá para [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um novo projeto
   - Ative "Google+ API"
   - Crie credenciais OAuth 2.0 (Desktop Application)
   - Copie Client ID e Client Secret
   - Em Supabase → Auth → Providers → Google, cole as credenciais

2. **GitHub OAuth**:
   - Vá para [github.com/settings/developers](https://github.com/settings/developers)
   - Clique **New OAuth App**
   - Application name: AIOX Dashboard
   - Authorization callback URL: `https://seu-projeto.supabase.co/auth/v1/callback`
   - Copie Client ID e Client Secret
   - Em Supabase → Auth → Providers → GitHub, cole as credenciais

## 🚀 Deploy em Vercel

### Passo 1: Preparar Repositório Git

```bash
# Já dentro da pasta aiox-web-dashboard
git init
git add .
git commit -m "Initial commit: AIOX Web Dashboard"
```

### Passo 2: Criar Repositório GitHub

1. Vá para [github.com/new](https://github.com/new)
2. Repository name: `aiox-web-dashboard`
3. Description: AIOX Web Dashboard - Vercel + Supabase
4. Escolha **Public** ou **Private**
5. Clique **Create repository**

### Passo 3: Push para GitHub

```bash
git remote add origin https://github.com/seu-usuario/aiox-web-dashboard.git
git branch -M main
git push -u origin main
```

### Passo 4: Deploy em Vercel

1. Vá para [vercel.com/new](https://vercel.com/new)
2. Clique **Import Git Repository**
3. Cole a URL: `https://github.com/seu-usuario/aiox-web-dashboard`
4. Clique **Import**

### Passo 5: Configurar Environment Variables

Na página do projeto:

1. Vá para **Settings → Environment Variables**
2. Adicione:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-chave-anon-publica
VITE_AIOX_ENGINE_URL = http://localhost:4002
```

(Você pode mudar AIOX_ENGINE_URL para HTTPS se tiver um servidor remoto)

### Passo 6: Deploy

1. Clique **Deploy**
2. Aguarde 2-3 minutos
3. Quando terminar, você verá um URL tipo: `https://aiox-web-dashboard.vercel.app`

## ✅ Verificar Funcionamento

### 1. Testar Aplicação Localmente

```bash
cd aiox-web-dashboard
npm install
npm run dev
```

Abra http://localhost:3000

### 2. Testar Registro/Login

1. Clique em **Cadastre-se**
2. Digite email e senha
3. Você deve ser redirecionado para o Dashboard
4. Vá para **Histórico** - deve estar vazio (ainda sem eventos)

### 3. Testar Sincronização com AIOX

1. No terminal do AIOX Core, execute um comando que gere um evento:
   ```bash
   node bin/aiox.js validate:agents
   ```
2. Volte para o Dashboard
3. Vá para **Histórico** e clique em **Atualizar** (F5)
4. Você deve ver novos eventos aparecendo

### 4. Verificar Vercel Deploy

1. Abra assim dashboard em produção: `https://aiox-web-dashboard.vercel.app`
2. Faça login com a mesma conta
3. Todos os dados devem sincronizar

## 🐛 Troubleshooting

### ❌ "Supabase connection failed"

**Causa**: Variáveis de ambiente incorretas

**Solução**:
```bash
# Verifique .env.local
cat .env.local

# Deve ter:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### ❌ "AIOX Engine unreachable"

**Causa**: Engine não está rodando ou URL está errada

**Solução**:
```bash
# Verifique se o AIOX está rodando
netstat -ano | findstr :4002

# Se não estiver, inicie:
cd ../aiox-core
npm run dev
```

### ❌ "RLS policy violation"

**Causa**: Row Level Security está impedindo acesso

**Solução**:
1. Vá para Supabase → SQL Editor
2. Verifique as políticas RLS
3. Se necessário, desabilite temporariamente:
   ```sql
   ALTER TABLE events DISABLE ROW LEVEL SECURITY;
   ```

### ❌ "Build fails on Vercel"

**Causa**: Erro durante build

**Solução**:
1. Teste localmente:
   ```bash
   npm run build
   npm run preview
   ```
2. Verifique os logs: Vercel → Deployments → Clique na build com erro
3. Procure por erros TypeScript ou import ausentes

### ❌ "Authentication not working"

**Causa**: Configuração Supabase incompleta

**Solução**:
1. Supabase → Auth → Providers
2. Verifique que **Email** está ativado
3. Teste com uma conta nova

## 📊 Monitoramento em Produção

### Vercel Analytics

1. Vá para seu projeto → **Analytics**
2. Veja:
   - Page Performance
   - Core Web Vitals
   - Erros de Runtime

### Supabase Monitoring

1. Vá para Supabase → **Home → Reports**
2. Veja:
   - Requisições por dia
   - Banco de dados usado
   - Autenticações

## 🎓 Próximos Passos

1. **Adicionar mais agentes**: Implemente mais tipos de agentes no AIOX
2. **Webhooks**: Configure webhooks do Supabase para eventos em tempo real
3. **Custom Domain**: Use seu próprio domínio em vez de `vercel.app`
4. **Analytics**: Integre analytics como Segment ou Mixpanel
5. **Backup**: Configure backup automático do Supabase

## ❓ Dúvidas?

- 📧 Suporte Supabase: https://supabase.com/docs
- 📧 Suporte Vercel: https://vercel.com/docs
- 💬 GitHub Issues: https://github.com/seu-usuario/aiox-web-dashboard/issues

---

**Parabéns! 🎉 Seu dashboard está pronto!**
