"use client";

import { useState, useTransition } from "react";
import {
  confirmarPedidoAction,
  recusarPedidoAction,
} from "@/app/admin/actions";
import type { Pedido } from "@/lib/pedidos";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PedidoCard({ pedido }: { pedido: Pedido }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  const confirmar = () => {
    setErro("");
    startTransition(async () => {
      const r = await confirmarPedidoAction(pedido.id);
      if (!r.ok) setErro(r.message);
    });
  };

  const recusar = () => {
    if (!window.confirm("Recusar este pedido? Ele não será registrado como venda.")) {
      return;
    }
    setErro("");
    startTransition(async () => {
      const r = await recusarPedidoAction(pedido.id);
      if (!r.ok) setErro(r.message);
    });
  };

  return (
    <div className="rounded-2xl border border-rose-light bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-chocolate">
            {pedido.cliente_nome || "Cliente não identificado"}
          </p>
          <p className="text-xs text-chocolate-muted">
            Pedido #{pedido.id} · {formatarData(pedido.created_at)}
          </p>
        </div>
        <span className="rounded-full bg-badge-yellow px-2.5 py-0.5 text-xs font-medium text-badge-yellow-text">
          Pendente
        </span>
      </div>

      <ul className="my-4 space-y-1.5 border-y border-rose-light/60 py-3">
        {pedido.itens.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-chocolate">
              {item.quantidade}× {item.produto_nome}
            </span>
            <span className="text-chocolate-muted">
              {brl(item.preco_unit * item.quantidade)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <span className="text-chocolate-muted">Pagamento</span>
        <span className="font-medium text-chocolate">
          {pedido.metodo_pagamento || "Não informado"}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm text-chocolate-muted">Total</span>
        <span className="text-lg font-bold text-chocolate">
          {brl(pedido.total)}
        </span>
      </div>

      {erro && (
        <p className="mt-3 rounded-lg bg-badge-red px-3 py-2 text-xs text-badge-red-text">
          {erro}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={confirmar}
          disabled={pending}
          className="flex-1 rounded-full bg-rose-pastel px-4 py-2 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60"
        >
          {pending ? "Processando…" : "Confirmar venda"}
        </button>
        <button
          onClick={recusar}
          disabled={pending}
          className="rounded-full border border-rose-light px-4 py-2 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors disabled:opacity-60"
        >
          Recusar
        </button>
      </div>
    </div>
  );
}
