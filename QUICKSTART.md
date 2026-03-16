# ⚡ Quick Start - AIOX Web Dashboard

Para caminhos mais rápidos, siga este guia condensado.

## 🚀 Setup em 10 Minutos

### 1. Dependencies (2 min)

```bash
cd aiox-web-dashboard
npm install
```

### 2. Supabase (3 min)

1. Acesse: https://supabase.com/new
2. Crie um projeto (deixe as defaults)
3. Espere 2-3 minutos
4. Vá para **Settings → API**
5. Copie `Project URL` e `anon public key`

### 3. Environment (1 min)

```bash
# Edite .env.local
VITE_SUPABASE_URL=https://seu-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
VITE_AIOX_ENGINE_URL=http://localhost:4002
```

### 4. Database (2 min)

No Supabase → SQL Editor, cole o script de `SETUP_GUIDE.md` → "Executar Setup SQL" → Execute

### 5. Rodar (2 min)

```bash
npm run dev
# Abre em http://localhost:3000
```

**Pronto!** 🎉

## 📝 Próximos Passos

- [ ] Criar conta (Register)
- [ ] Fazer login
- [ ] Executar um agente AIOX para gerar eventos
- [ ] Verificar Histórico
- [ ] Veja o README.md para mais detalhes

## 🔗 Recursos Rápidos

| O quê | Onde |
|-------|------|
| Documentação Completa | [README.md](README.md) |
| Setup Detalhado | [SETUP_GUIDE.md](SETUP_GUIDE.md) |
| API Docs | [lib/aiox.ts](src/lib/aiox.ts) |
| Componentes React | [src/pages/](src/pages/) |

## 🆘 Problemas Comuns

| Erro | Solução |
|------|---------|
| `VITE_SUPABASE_URL is not defined` | Edite `.env.local` |
| `Cannot connect to AIOX Engine` | Inicie AIOX: `cd ../aiox-core && npm run dev` |
| `Port 3000 already in use` | Mude em `vite.config.ts` → `server.port` |

---

Para mais informações, veja [SETUP_GUIDE.md](SETUP_GUIDE.md)
