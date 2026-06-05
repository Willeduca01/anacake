<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Decisões de Arquitetura

### 2026-06-05 - Deploy via Docker (Node dinâmico) atrás de nginx (proxy reverso)

**Decisão:** Containerizar a aplicação com um `Dockerfile` multi-stage usando o output `standalone` do Next.js, orquestrado por `docker-compose.yml`, rodando como servidor Node em `127.0.0.1:3000`. O nginx (já existente na VM, porta 80) atua como **proxy reverso** para `http://127.0.0.1:3000`. Deploy via Git: `git pull` + `docker compose up -d --build`.

**Contexto:** O cardápio é dinâmico — vem em tempo de execução de um webhook do n8n (`http://4.204.40.176:5678/webhook/Cardapio`, backend n8n + postgres em Docker na VM). A produção estava servindo um **export estático** (`out/`) via nginx, que não refletia atualizações de cardápio/estoque. Além disso, não havia versionamento (a pasta na VM não era um repositório git).

**Alternativas descartadas:**
- *Editar direto no container / na VM:* sem build/versionamento, mudanças efêmeras.
- *Export estático (`output: export`):* o cardápio viraria uma "foto" fixa, sem refletir o n8n; ainda exige API route dinâmica (`/api/cardapio`). Anula a integração ao vivo.
- *Container expondo a porta 80 direto:* conflita com o nginx já existente na VM (que também serve n8n/portainer e cuida de gzip/cache/headers).

**Impacto:** Deploy reproduzível, versionado e com rollback; cardápio ao vivo funcionando. O nginx deixa de servir `out/` estático e passa a fazer proxy para o container Node em `127.0.0.1:3000`. A config antiga do nginx deve ser salva (backup) antes da troca. O repositório passa a ser clonado/atualizado na VM via deploy key read-only.

### 2026-06-05 - Painel /admin com escrita direta no postgres e auth via .env

**Decisão:** Criar uma área `/admin` protegida no próprio site para CRUD de produtos do cardápio. O Next.js conecta **direto no postgres** (`pg`, via server actions) para escrever na tabela `produtos`. Autenticação por **credencial em `.env`** (`ADMIN_USER` + `ADMIN_PASSWORD_HASH_B64` em bcrypt) e **sessão JWT** (`jose`) em cookie HttpOnly, com um `middleware` protegendo `/admin/*`. O hash bcrypt é guardado em base64 no `.env` para evitar a expansão de `$` pelo carregador de env do Next.

**Contexto:** Era preciso editar o cardápio pelo site, sem acessar a VM, e apenas para o admin. Os dados já vivem no postgres (lido pelo n8n). Escrever direto no postgres mantém tudo versionado no app e evita criar fluxos de escrita no n8n. Segredos (conexão do banco + credenciais do admin + `AUTH_SECRET`) ficam num `.env` **não versionado**, injetado no container via `env_file` no compose; na VM o container alcança o postgres por `host.docker.internal` (extra_hosts host-gateway).

**Alternativas descartadas:**
- *Escrita via webhooks do n8n:* exigiria montar fluxos manualmente na UI do n8n, fora do versionamento.
- *Auth.js (NextAuth):* robusto demais para um único admin; mais dependências e configuração.
- *Guardar o hash bcrypt cru no `.env`:* o `$` do hash é interpretado como variável pelo loader de env do Next/dotenv-expand — por isso usamos base64.

**Impacto:** Novas dependências: `pg`, `jose`, `bcryptjs`. Novo `.env` obrigatório (ver `.env.example`); sem ele, o app sobe mas o `/admin` não funciona. O chrome público (Header/Footer/carrinho) foi isolado das rotas `/admin` via `AppShell`. **Risco de segurança em aberto:** o site roda em HTTP puro — o login trafega em texto puro. Enquanto não houver HTTPS, manter `COOKIE_SECURE=false`; ao habilitar TLS, definir `COOKIE_SECURE=true`. Recomenda-se restringir `/admin` por IP no nginx e/ou adicionar HTTPS antes de uso real. Utilitário `gen-cred.cjs` gera hash+secret para rotação de senha.

### 2026-06-05 - Dashboard de vendas no /admin (registro de vendas + métricas)

**Decisão:** Estender o `/admin` com navegação em abas (**Dashboard · Produtos · Vendas**) usando route group `(painel)` + layout compartilhado, mantendo `/admin/login` fora do grupo. A tabela `vendas` (já existente: `produto_id`, `quantidade`, `valor_total`, `data_venda`, `metodo_pagamento`) é **reaproveitada** — não foram criadas tabelas novas. Adicionado fluxo **"Registrar venda"** (server action transacional) que insere em `vendas` e **baixa `estoque_atual`** em `produtos` (`BEGIN/COMMIT`, `SELECT ... FOR UPDATE`, rollback em erro). O Dashboard agrega via SQL (KPIs de faturamento/ticket/estoque, faturamento dos últimos 30 dias com `generate_series`, top produtos, faturamento por categoria, alerta de estoque baixo). Gráficos com **Recharts** (client components). Índices `idx_vendas_data` e `idx_vendas_produto` criados no postgres.

**Contexto:** A tabela `vendas` existia mas estava **vazia** — nenhum fluxo gravava vendas (pedidos só saíam por link de WhatsApp, sem persistência). Para o dashboard ter dados reais, o admin passou a registrar vendas manualmente. A estrutura de dados necessária já existia em `produtos` + `vendas`, então optou-se por reaproveitá-la em vez de criar entidades novas.

**Alternativas descartadas:**
- *Criar tabelas novas (pedidos/itens/clientes):* desnecessário para o escopo atual; `produtos`+`vendas` cobrem os indicadores pedidos. Pode ser revisto se surgir necessidade de pedidos com múltiplos itens/clientes.
- *Captura automática de vendas via WhatsApp/n8n:* exigiria integração externa e confirmação de pedido; fora do escopo. Registro manual no admin resolve agora.
- *Gráficos em CSS puro (sem dependência):* descartado por limitar a riqueza visual; preferiu-se Recharts (decisão aprovada pela usuária).

**Impacto:** Nova dependência `recharts`. `/admin` agora é o Dashboard; CRUD de produtos movido para `/admin/produtos`; nova `/admin/vendas`. Registrar venda **altera estoque** (decrementa), refletindo no painel de produtos. Sem novas variáveis de `.env`. Migração de banco: rodar os `CREATE INDEX IF NOT EXISTS` (idempotentes) no deploy.

### 2026-06-05 - CI/CD: build no GitHub Actions + deploy pull-based na VM

**Decisão:** Tirar o build de Docker de cima da VM. O **GitHub Actions** (`.github/workflows/build.yml`) builda a imagem a cada push na `main` e publica no **GHCR** (`ghcr.io/willeduca01/anacake:latest` + tag por SHA), autenticando com o `GITHUB_TOKEN` efêmero (sem PAT). A VM **puxa sozinha**: um **systemd timer** (`anacake-deploy.timer`, a cada ~3 min) roda `scripts/deploy.sh`, que faz `git pull --ff-only` (atualiza compose/script), `docker compose pull` e `up -d` (idempotente — só recria se a imagem/config mudou). O `docker-compose.yml` passou a referenciar `image:` (mantendo `build:` para uso local). A VM **não builda mais**.

**Contexto:** A VM tem só **892 MB de RAM**; o `next build` estoura a memória e entra em *swap thrashing* (chegou a travar ~22 min, exigindo pausar o n8n para concluir). Servir os containers 24h cabe tranquilo — o gargalo é exclusivamente o build. Mover o build para os runners do GitHub (RAM de sobra) transforma a VM num servidor de execução puro, sem downtime do n8n a cada deploy.

**Alternativas descartadas:**
- *Deploy via SSH a partir do Actions (push-based):* exigiria expor a porta 22 da VM aos IPs (amplos) dos runners do GitHub; mais superfície de ataque. Pull-based não abre nenhuma porta.
- *Watchtower (daemon de auto-update):* container extra consumindo RAM numa VM já apertada; o systemd timer + `compose pull` resolve sem processo residente.
- *Continuar buildando na VM:* inviável de forma confiável com 892 MB (risco de OOM, lentidão, downtime do n8n).
- *Pacote GHCR público (pull anônimo):* seria tokenless, mas a alteração de visibilidade pública não pôde ser aplicada de forma confiável (UI; sem API para isso) — pull anônimo seguiu retornando `unauthorized`. Abandonado em favor do token.

**Impacto:** A imagem fica **privada** no GHCR. A VM autentica uma vez com um **PAT classic `read:packages`** via `docker login ghcr.io -u Willeduca01` (credencial em `/root/.docker/config.json`, fora do repositório). **Atenção:** se o token tiver expiração, refazer o `docker login` antes de expirar (senão o `pull` falha e a VM continua na imagem atual, sem downtime). Não há mais build na VM (deploys em segundos, sem mexer no n8n). Latência de deploy ~ até 3 min (intervalo do timer). Novos arquivos versionados: workflow, `scripts/deploy.sh`, `.gitattributes` (LF). Deploy manual imediato na VM: `sudo systemctl start anacake-deploy.service`.
