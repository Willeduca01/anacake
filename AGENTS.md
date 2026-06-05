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
