# 🚀 1-CLICK VERCEL DEPLOYMENT - AÇÃO RÁPIDA

## ✅ JÁ FEITO (Seu código está pronto!)

```
✅ Git initialized
✅ All files committed
✅ Ready for GitHub push
```

---

## 🎯 PRÓXIMAS 3 AÇÕES (15 MINUTOS)

### ⏱️ AÇÃO 1: GitHub (2 minutos)

**Passo 1.1:** Vá para https://github.com/new

**Passo 1.2:** Preencha:
```
Repository name: aiox-web-dashboard
Visibility: Private (apenas seu time) ou Public
```

**Passo 1.3:** Clique **Create repository**

**Passo 1.4:** Você verá uma tela com comandos. COPIE e COLE AQUI:

```bash
# Cole EXATAMENTE esses comandos (GitHub vai mostrar no seu caso):

git branch -M main
git remote add origin https://github.com/SEU-USUARIO/aiox-web-dashboard.git
git push -u origin main

# Será pedido:
# - Username: seu email GitHub
# - Password: seu Personal Access Token (veja abaixo)
```

**Para PAT (Personal Access Token):**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Tokens (classic) → Generate new token
3. Marque: `repo` + `workflow`
4. Copie o token
5. Use como password

---

### ⏱️ AÇÃO 2: Vercel (3 minutos)

**Passo 2.1:** Vá para https://vercel.com/import

**Passo 2.2:** Clique **Import Git Repository**

**Passo 2.3:** Autorize Vercel a acessar GitHub (primeira vez apenas)

**Passo 2.4:** Busque e selecione: `aiox-web-dashboard`

**Passo 2.5:** Vercel detecta tudo automaticamente
```
Framework: Vite ✅
Build Command: npm run build ✅
Output: dist ✅
```

**Passo 2.6:** Clique **Deploy**

⏳ Aguarde 2-3 minutos...

✅ **Seu app está ONLINE em:** `https://seu-projeto.vercel.app`

---

### ⏱️ AÇÃO 3: Variáveis de Ambiente (5 minutos)

Vercel → Project Settings → Environment Variables

**Adicione estas 4 variáveis:**

```
Nome: VITE_SUPABASE_URL
Valor: https://qkbbaxcytipnibxswcbi.supabase.co

---

Nome: VITE_SUPABASE_ANON_KEY
Valor: (copie de c:\Users\Me\Downloads\wowow\aiox-web-dashboard\.env.local linha 1)

---

Nome: VITE_AIOX_ENGINE_URL
Valor: http://localhost:4002

---

Nome: VITE_AIOX_PROJECT_ROOT
Valor: /app
```

**Depois:** Project → Redeploy (para aplicar variáveis)

---

## 🎁 BÔNUS: Domínio Customizado (Opcional)

Se quiser seu próprio domínio:

**Vercel → Project Settings → Domains**

Opção A: Use `.vercel.app` grátis (já funciona)
Opção B: Seu domínio próprio (configure DNS)

---

## ✅ CHECKLIST: Está tudo pronto?

- [ ] Código em local está feito (`git commit` ✅)
- [ ] GitHub account criado
- [ ] Vercel account criado
- [ ] Deploy feito no Vercel
- [ ] Variáveis adicionadas
- [ ] **Seu app está online!** 🎉

---

## 🔗 LINKS PARA COPIAR

```
Seu app:        https://seu-projeto.vercel.app
GitHub repo:    https://github.com/seu-usuario/aiox-web-dashboard
Vercel project: https://vercel.com/seu-usuario/aiox-web-dashboard
```

---

## 📞 SE PRECISA AJUDA

**GitHub não encontra repo?**
→ Confirmou que deu `git push origin main`? 

**Vercel não encontra GitHub?**
→ Autorize em https://github.com/settings/applications

**Deploy falhou?**
→ Vercel → Deployments → Clique no falhado → Logs

**Variáveis não funcionam?**
→ Precisa fazer Redeploy após adicionar!

---

## 🎯 PRÓXIMO PASSO APÓS ISTO

```
1. ✅ Deploy Vercel FEITO
   ↓
2. Configurar Supabase SQL
   (Abra: SUPABASE_TEAM_SETUP.md)
   ↓
3. ✅ Pronto para compartilhar com time!
```

---

**SUA AÇÃO AGORA:**

1. Vá para https://github.com/new
2. Crie repo `aiox-web-dashboard`
3. Rode comandos git push
4. Vá para https://vercel.com/import
5. Import seu repo GitHub
6. [Deploy]
7. Adicione variáveis
8. ✅ LIVE! 🚀

---

*Tempo total: 15 minutos*  
*Resultado: App online + URL pública*  
*Custo: $0 🎉*
