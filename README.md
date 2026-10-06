# 🍰 Ana Cake — Confeitaria & Doceria Artesanal

Sistema completo de e-commerce e gestão para confeitaria artesanal, desenvolvido em **Next.js (App Router)** com banco de dados **PostgreSQL (Neon)**, integração de checkout via **WhatsApp**, painel administrativo protegido e arquitetura moderna pronta para produção na **Vercel**.

---

## 📌 Visão Geral e Comportamento do Sistema

O projeto foi construído para atender pequenas confeitarias e comércios locais, unindo um catálogo público atraente e responsivo a um painel de retaguarda (*backoffice*) simples e robusto.

```
                    ┌────────────────────────────────────────┐
                    │            CLIENTE NO SITE             │
                    │   Navega pelo Cardápio e monta Sacola  │
                    └───────────────────┬────────────────────┘
                                        │ Finaliza Pedido
                                        ▼
             ┌──────────────────────────┴──────────────────────────┐
             │                                                     │
             ▼                                                     ▼
┌─────────────────────────┐                           ┌─────────────────────────┐
│     WHATSAPP DA LOJA    │                           │    BANCO DE DADOS NEON  │
│ Mensagem pré-formatada  │                           │   Grava pedido como     │
│ pronta para o cliente   │                           │       'pendente'        │
│ enviar com 1 clique     │                           └────────────┬────────────┘
└─────────────────────────┘                                        │
                                                                   ▼
                                                      ┌─────────────────────────┐
                                                      │   PAINEL /admin DA LOJA │
                                                      │  • Badge de alerta      │
                                                      │  • Baixa de estoque     │
                                                      │  • Registro de venda    │
                                                      └─────────────────────────┘
```

---

## 🎯 Funcionalidades Principais

### 1. Área Pública (Experiência do Cliente)
* **Página Inicial (`/`):** Banners sazonais, apresentação da marca, destaques e mapa de localização.
* **Cardápio Dinâmico (`/cardapio`):**
  * Consulta os produtos diretamente do banco de dados em tempo real.
  * Filtros interativos por categoria (*Doces*, *Salgados*, *Sobremesas*, *Encomendas*).
  * Indicação visual de estoque (*Em estoque*, *Apenas X restantes*, *Esgotado*).
* **Sacola / Carrinho Lateral (`CartDrawer`):**
  * Adição, incremento e remoção de produtos com cálculo instantâneo.
  * Coleta do **Nome do Cliente** e **Forma de Pagamento** pretendida (PIX, Cartão de Crédito, Dinheiro, etc.).
  * **Checkout Inteligente:** Abre a conversa oficial no WhatsApp da loja com a mensagem detalhada pronta para envio e, em segundo plano, registra o pedido no banco de dados.

---

### 2. Painel Administrativo (`/admin`)
Acesso protegido por autenticação JWT com cookies seguros `HttpOnly` e proteção contra força bruta.

* **📊 Dashboard (`/admin`):**
  * KPIs em tempo real: faturamento total, ticket médio, vendas no mês e valor total do estoque.
  * Gráfico interativo de faturamento dos últimos 30 dias (Recharts).
  * Alertas automáticos de produtos com estoque baixo (≤ 5 unidades).
* **📦 Gestão de Produtos (`/admin/produtos`):**
  * Cadastro, edição e exclusão de produtos com controle de estoque e preços.
  * **Upload de Imagens:** Fotos são redimensionadas no navegador via Canvas e armazenadas diretamente no PostgreSQL (`BYTEA`), servidas com cache imutável em `/api/produtos/[id]/imagem`.
* **🛎️ Gestão de Pedidos (`/admin/pedidos`):**
  * Monitoramento dos pedidos pendentes enviados pelo site.
  * Contador/Badge com atualização em segundo plano no menu de navegação.
  * **Ação de Confirmação:** Valida o estoque, baixa a quantidade vendida de forma transacional (`BEGIN/COMMIT`), registra a venda financeira e altera o status do pedido para `confirmado`.
  * **Ação de Recusa:** Cancela o pedido sem alterar o estoque.
* **💰 Registro de Vendas (`/admin/vendas`):**
  * Histórico de todas as vendas concretizadas.
  * Formulário para lançamento de vendas manuais (balcão/loja física).
* **💬 Mini CRM de Atendimento (`/admin/mensagens`):**
  * Triagem visual de conversas com clientes divididas por filas (*Novas*, *Em atendimento*, *Aguardando*, *Resolvidas*).

---

## 🛡️ Arquitetura de Segurança Implementada

O sistema passou por auditoria e refatoração de segurança completa:

1. **Prevenção contra BOLA / IDOR:**
   * Todas as Server Actions e APIs administrativas exigem validação de sessão ativa e role `admin` no início de cada execução via `exigirSessaoAdmin()`.
2. **Rate Limiting (Proteção contra DoS e Brute Force):**
   * Endpoint de login limitado a **5 tentativas por minuto** por IP.
   * Criação de pedidos limitada a **10 requisições por minuto** por IP.
   * Suporte nativo a **Upstash Redis** distribuído em produção na Vercel, com fallback automático em memória para desenvolvimento local.
3. **Prevenção contra SQL Injection (SQLi):**
   * 100% das consultas ao PostgreSQL utilizam queries parametrizadas (`$1, $2, ...`).
   * Eliminação de template literals dinâmicos em comandos SQL.
4. **Mitigação de XSS (Cross-Site Scripting):**
   * Sanitização rigorosa de entradas de texto (nomes de clientes, descrições e produtos) via `DOMPurify` e filtros universais.
   * Cabeçalho de proteção `X-Content-Type-Options: nosniff` no serviço de imagens.
5. **Proteção de Segredos:**
   * Nenhuma credencial sensível exposta com prefixo `NEXT_PUBLIC_`.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Animações & Ícones:** [Framer Motion](https://www.framer.com/motion/) e [Lucide React](https://lucide.dev/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) hospedado no [Neon](https://neon.tech/) com *Connection Pooling*
* **Gráficos:** [Recharts](https://recharts.org/)
* **Autenticação:** [jose](https://github.com/panva/jose) (JWT) e [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Segurança & Rate Limit:** [@upstash/ratelimit](https://upstash.com/), [@upstash/redis](https://upstash.com/) e [dompurify](https://github.com/cure53/DOMPurify)

---

## 🚀 Como Rodar o Projeto em Qualquer Máquina

### 1. Pré-requisitos
* **Node.js** v20.18+ ou superior instalado ([Download Node.js](https://nodejs.org/))
* **Git** instalado

---

### 2. Passo a Passo

1. **Extrair os arquivos do projeto** na pasta desejada e abrir o terminal nela.

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   O arquivo `.env` já vem pré-configurado neste pacote. Caso precise recriá-lo, copie o `.env.example` para `.env`:
   ```env
   # Conexão com o banco Neon PostgreSQL
   DATABASE_URL=postgresql://neondb_owner:npg_aUgOIK0HkTE2@ep-dark-boat-b6q25xt7-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require

   # Credenciais do administrador do painel /admin
   ADMIN_USER=admin
   ADMIN_PASSWORD_HASH_B64=JDJiJDEwJERlMC91Vm1Scm5ML0s4NWg0VHMuUmU3MmFDc1F4Z3lXc0J2MTJ3QXdvSDZvWWdtQUhCOGsy
   AUTH_SECRET=4be82f7d3c6bf561b84482b45d1663b5033ad5f605576a82873faa3d57a29406
   COOKIE_SECURE=false

   # Rate Limiting (Opcional em desenvolvimento, recomendado na Vercel)
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```

4. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar a aplicação:**
   * **Loja / Cardápio:** [http://localhost:3000](http://localhost:3000) ou [http://localhost:3000/cardapio](http://localhost:3000/cardapio)
   * **Painel Administrativo:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Credenciais Padrão do Painel Admin

* **URL de Acesso:** `/admin`
* **Usuário:** `admin`
* **Senha:** `AnaCake@Admin2026`

*(Para alterar a senha no futuro, utilize o comando `node gen-cred.cjs "NovaSenhaForte"` e atualize o `ADMIN_PASSWORD_HASH_B64` no `.env`).*

---

## 🌐 Deploy em Produção (Vercel)

1. Faça o fork ou push do projeto para o seu repositório no GitHub.
2. Importe o repositório na [Vercel](https://vercel.com).
3. Adicione as mesmas variáveis do arquivo `.env` na seção **Environment Variables** da Vercel, definindo `COOKIE_SECURE=true`.
4. Clique em **Deploy**. A Vercel cuidará automaticamente do build e da geração do certificado SSL/HTTPS.
