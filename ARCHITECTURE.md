# 🏗️ Arquitetura - AIOX Web Dashboard

## 📊 Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                       INTERNET / USUÁRIOS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              VERCEL (Frontend + Serverless)              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │       React App (aiox-web-dashboard)                │ │  │
│  │  ├──────────────────┬──────────────────────────────────┤ │  │
│  │  │                  │                                   │ │  │
│  │  │  Pages:          │  Features:                       │ │  │
│  │  │  • Dashboard     │  • Real-time Events              │ │  │
│  │  │  • Agents        │  • Agent Management              │ │  │
│  │  │  • History       │  • Team Collaboration            │ │  │
│  │  │  • Team          │  • Audit Logs                    │ │  │
│  │  │  • Settings      │  • Responsive UI (Tailwind)      │ │  │
│  │  │  • Auth          │  • Type-safe (TypeScript)        │ │  │
│  │  │                  │                                   │ │  │
│  │  └────────┬─────────────────────────────┬──────────────┘ │  │
│  │           │                             │                │  │
│  └───────────┼──────────────────────────────┼────────────────┘  │
│              │                             │                    │
│              │ (HTTPS)                     │ (HTTPS)            │
│              │                             │                    │
│  ┌───────────▼────────────────┐  ┌────────▼──────────────────┐│
│  │   SUPABASE (Database)      │  │ AIOX Engine (localhost)   ││
│  ├────────────────────────────┤  ├───────────────────────────┤│
│  │                            │  │                           ││
│  │  PostgreSQL:               │  │  Port: 4002               ││
│  │  • events                  │  │  • REST API               ││
│  │  • teams                   │  │  • Event Generator        ││
│  │  • team_members            │  │  • Agent Manager          ││
│  │  • audit_logs              │  │  • Metrics                ││
│  │  • invitations             │  │  • Health Check           ││
│  │                            │  │                           ││
│  │  Auth (JWT):               │  ├───────────────────────────┤│
│  │  • Email/Password          │  │ Local Development:        ││
│  │  • OAuth (Google, GitHub)  │  │ npm run dev               ││
│  │  • Session Management      │  │                           ││
│  │                            │  │ (não deploy em produção)  ││
│  │  RLS Policies:             │  │                           ││
│  │  • Row-level security      │  │                           ││
│  │  • Team isolation          │  │                           ││
│  │                            │  │                           ││
│  └────────────────────────────┘  └───────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### 1. **Autenticação (Login/Register)**

```
User Input (Email + Senha)
    ↓
React Form (Login.tsx)
    ↓
Supabase Auth API
    ↓
JWT Token gerado
    ↓
localStorage (session)
    ↓
Redireciona para Dashboard
```

### 2. **Carregar Eventos**

```
Dashboard.tsx montado
    ↓
useEffect chama aiox.getEvents()
    ↓
Axios → http://localhost:4002/api/events
    ↓
AIOX Engine retorna JSON
    ↓
useState(events) atualiza
    ↓
Componentes renderizam com dados
    ↓
setInterval a cada 5s (polling)
```

### 3. **Sincronizar com Supabase**

```
Eventos capturados pelo AIOX
    ↓
Hooks Python salvam em JSON
    ↓
Backend (serverless function) no Vercel
    ↓
Supabase insere em table 'events'
    ↓
RLS policies validam permissões
    ↓
Frontend busca e exibe
```

### 4. **Gerenciar Time**

```
Admin convida novo membro
    ↓
Enviar convite → Supabase table 'invitations'
    ↓
Email enviado com link de aceitação
    ↓
Novo usuário clica link
    ↓
Insere em 'team_members' com role
    ↓
Novo membro pode fazer login
```

## 📁 Estrutura de Diretórios

```
aiox-web-dashboard/
├── src/
│   ├── pages/                 # Páginas (rotas )
│   │   ├── Dashboard.tsx     # Home com timeline de eventos
│   │   ├── Agents.tsx        # Lista e gerencia agentes
│   │   ├── History.tsx       # Auditoria com filtros
│   │   ├── Team.tsx          # Membros e convites
│   │   ├── Settings.tsx      # Configurações do usuário
│   │   ├── Login.tsx         # Autenticação
│   │   └── Register.tsx      # Registro de novos usuários
│   │
│   ├── components/            # Componentes reutilizáveis
│   │   └── Navigation.tsx    # Header com navegação
│   │
│   ├── lib/                   # Utilitários e clientes
│   │   ├── supabase.ts       # Cliente Supabase (instância)
│   │   └── aiox.ts           # Cliente HTTP para AIOX Engine
│   │
│   ├── App.tsx                # App principal (routing)
│   ├── main.tsx               # Entry point (ReactDOM.render)
│   └── index.css              # Estilos globais
│
├── public/                    # Arquivos estáticos
│   └── index.html            # HTML template
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD para Vercel
│
├── vite.config.ts            # Configuração Vite (React + proxy)
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind CSS themes
├── prettier.config.js        # Code formatting
├── package.json              # Dependencies
├── vercel.json               # Deploy config
│
├── .env.example              # Template de variáveis
├── .env.local                # Variáveis locais (NÃO commitar)
│
├── README.md                 # Documentação principal
├── SETUP_GUIDE.md            # Setup passo a passo
├── QUICKSTART.md             # Quick start em 10 min
└── ARCHITECTURE.md           # Este arquivo
```

## 🔐 Segurança

### Token JWT

```
Supabase gera JWT ao login
    ↓
Armazenado em localStorage (secure, httpOnly ideal em produção)
    ↓
Enviado em header: Authorization: Bearer {token}
    ↓
Supabase valida assinatura do token
    ↓
RLS policies checam auth.uid()
```

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

```sql
-- Exemplo: Usuário só vê eventos de seus times
SELECT events FROM events 
WHERE team_id IN (
  SELECT team_id FROM team_members 
  WHERE user_id = auth.uid()
)
```

### Autenticação Multi-Tenant

Cada usuário isolado por `team_id`:

```
User A (team_id=123)  →  Vê apenas dados de team 123
                         Não consegue ver dados de team 456

User B (team_id=456)  →  Vê apenas dados de team 456
```

## 🚀 Deployment Pipeline

### Local Development

```
npm run dev
  ↓
Vite dev server (port 3000)
  ↓
Hot module replacement (HMR)
  ↓
Testa contra Supabase em produção
```

### Production (Vercel)

```
git push origin main
  ↓
GitHub webhook → Vercel
  ↓
npm install
  ↓
npm run build (TSC + Vite)
  ↓
Processa variáveis de environment
  ↓
Deploy em CDN global
  ↓
Disponível em: https://seu-app.vercel.app
```

## 📡 APIs Integradas

### Supabase Auth API

```typescript
// Login
supabase.auth.signInWithPassword({email, password})

// Register
supabase.auth.signUp({email, password})

// Logout
supabase.auth.signOut()

// User info
supabase.auth.getUser()
```

### Supabase Database API

```typescript
// Query
supabase.from('events').select('*').eq('team_id', teamId)

// Insert
supabase.from('events').insert([{...}])

// Update
supabase.from('teams').update({name}).eq('id', teamId)

// Realtime subscriptions (opcional)
supabase.from('events').on('*', callback).subscribe()
```

### AIOX Engine API (localhost:4002)

```typescript
GET   /api/events         // Últimos 50 eventos
GET   /api/agents         // Lista de agentes
GET   /api/agents/:id     // Detalhes do agente
POST  /api/agents/:id/execute  // Executar agente
GET   /api/metrics        // Métricas do sistema
GET   /api/health         // Status de saúde
```

## 🔄 Real-time Updates (Roadmap)

Atualmente: **Polling** (a cada 5s)

```typescript
setInterval(() => loadData(), 5000)
```

Futuro: **WebSocket** (real-time)

```typescript
// Supabase Realtime
supabase
  .from('events')
  .on('INSERT', payload => setEvents([...events, payload.new]))
  .subscribe()
```

## 📊 Performance Considerations

### Frontend

- **Code Splitting**: Rotas lazy-loaded
- **Memoization**: React.memo em componentes pesados
- **Images**: Lazy-loading nativo do navegador
- **CSS**: Tailwind purging em produção (~20KB gzip)

### Backend (Supabase)

- **Índices**: Criados em foreign keys e campos de filtro
- **RLS**: Encoraja queries eficientes (filtra por team_id)
- **Connection pooling**: Supabase gerencia automaticamente
- **Rate limiting**: 50 queries/min por usuário

###istema

- **Cache**: localStorage para user preferences
- **Debouncing**: Inputs com delay
- **Pagination**: Histórico carregado em chunks

## 🧪 Testing Strategy

```
Unit Tests
  ↓ (isolate components)
  ↓ npm test

Integration Tests
  ↓ (test components + Supabase)
  ↓ npm run test:integration

E2E Tests
  ↓ (test whole workflow)
  ↓ npm run test:e2e  (Cypress/Playwright)
```

## 📈 Scaling Roadmap

### Fase 1 (Atual): MVP
- ✅ Single team per user
- ✅ Basic CRUD operations
- ✅ Manual data sync

### Fase 2: Team Collaboration
- ⏳ Multiple teams per user
- ⏳ Role-based access (RBAC)
- ⏳ Automated sync via webhooks

### Fase 3: Enterprise
- 📅 SSO (SAML, OIDC)
- 📅 Advanced audit logs
- 📅 Custom integrations
- 📅 SLA monitoring

---

Para perguntas sobre arquitetura, veja [README.md](README.md).
