#!/usr/bin/env bash
# Deploy pull-based da Ana Cake na VM.
# Executado por um systemd timer a cada poucos minutos:
#   - atualiza config versionada (docker-compose.yml, este script) via git
#   - baixa a imagem mais recente do GHCR
#   - sobe o container so se a imagem/config mudou (up -d e idempotente)
set -euo pipefail

cd "$(dirname "$0")/.."

# Mantem compose/scripts em dia (read-only deploy key configurada na VM).
git pull --ff-only 2>&1 || echo "[deploy] git pull falhou (seguindo com imagem atual)"

sudo docker compose pull
# --no-build: a VM NUNCA builda (892MB RAM). Se a imagem nao existir, erra
# de proposito em vez de cair para build local.
sudo docker compose up -d --no-build
sudo docker image prune -f >/dev/null 2>&1 || true

echo "[deploy] concluido em $(date -Is)"
