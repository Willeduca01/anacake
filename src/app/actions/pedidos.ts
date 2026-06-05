"use server";

import { criarPedido, type PedidoItemInput } from "@/lib/pedidos";
import { metodoValido } from "@/constants/pagamento";

export interface CriarPedidoPayload {
  cliente_nome?: string | null;
  metodo_pagamento?: string | null;
  itens: PedidoItemInput[];
}

export async function criarPedidoAction(
  payload: CriarPedidoPayload
): Promise<{ ok: boolean }> {
  try {
    const nome = (payload.cliente_nome ?? "").trim().slice(0, 120) || null;
    const metodoRaw = (payload.metodo_pagamento ?? "").trim();
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
        produto_nome: i.produto_nome.trim().slice(0, 200),
        quantidade: Math.min(Math.trunc(Number(i.quantidade)), 999),
        preco_unit: Math.max(Number(i.preco_unit) || 0, 0),
      }));

    if (itens.length === 0) return { ok: false };

    await criarPedido(nome, metodo, itens);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
