<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Decisões de Arquitetura

### 2026-06-05 - Padronização de deploy via Docker + Git

**Decisão:** Containerizar a aplicação com um `Dockerfile` multi-stage usando o output `standalone` do Next.js, orquestrado por `docker-compose.yml`, e adotar o fluxo de deploy baseado em Git (`git pull` + `docker compose up -d --build`) na VM.

**Contexto:** O site (Next.js 16, App Router, com API route) rodava em um container montado manualmente na VM. Isso tornava o deploy frágil: mudanças efêmeras (perdidas ao recriar o container), sem versionamento e com o ambiente em produção divergindo do repositório.

**Alternativas descartadas:**
- *Editar direto no container:* sem build/versionamento, mudanças se perdem ao recriar o container e o Next.js exige `next build` para produção.
- *Export estático (`output: export`):* inviável por existir API route (`/api/cardapio`) e lógica dinâmica (carrinho), que exigem servidor Node.

**Impacto:** Deploy reproduzível, versionado e com rollback. O container passa a expor a porta 80 (host) → 3000 (container). O container manual antigo precisa ser parado/removido na primeira publicação para liberar a porta 80. O repositório deve ser clonado na VM (antes o deploy era manual).
