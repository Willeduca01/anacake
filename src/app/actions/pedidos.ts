"use server";

import { criarPedido, type PedidoItemInput } from "@/lib/pedidos";
import { metodoValido } from "@/constants/pagamento";
import { obterClientIp, verificarRateLimitPedidos } from "@/lib/ratelimit";
import { sanitizarTexto } from "@/lib/sanitize";

export interface CriarPedidoPayload {
  cliente_nome?: string | null;
  metodo_pagamento?: string | null;
  itens: PedidoItemInput[];
}

export interface CriarPedidoResponse {
  ok: boolean;
  message?: string;
}

export async function criarPedidoAction(
  payload: CriarPedidoPayload
): Promise<CriarPedidoResponse> {
  try {
    // Tarefa 2: Rate Limiting moderado por IP (10 pedidos/min) para mitigar DoS/spam
    const ip = await obterClientIp();
    const rateLimit = await verificarRateLimitPedidos(ip);
    if (!rateLimit.success) {
      return {
        ok: false,
        message: "Limite de pedidos atingido. Aguarde alguns instantes antes de tentar novamente.",
      };
    }

    // Tarefa 4: Sanitização contra XSS nos dados informados pelo cliente
    const nome = sanitizarTexto(payload.cliente_nome ?? "").slice(0, 120) || null;
    const metodoRaw = sanitizarTexto(payload.metodo_pagamento ?? "");
    const metodo = metodoValido(metodoRaw) ? metodoRaw : null;

    const itens = (payload.itens ?? [])
      .filter(
        (i) =>
          typeof i.produto_nome === "string" &&
          i.produto_nome.trim().length > 0 &&
          Number(i.quantidade) > 0
      )
      .slice(0, 50)
      .map((i) => ({
        produto_nome: sanitizarTexto(i.produto_nome).slice(0, 200),
        quantidade: Math.min(Math.trunc(Number(i.quantidade)), 999),
        preco_unit: Math.max(Number(i.preco_unit) || 0, 0),
      }))
      .filter((i) => i.produto_nome.length > 0 && i.quantidade > 0);

    if (itens.length === 0) {
      return { ok: false, message: "Pedido sem itens válidos." };
    }

    await criarPedido(nome, metodo, itens);
    return { ok: true };
  } catch {
    return { ok: false, message: "Erro interno ao processar o pedido." };
  }
}
