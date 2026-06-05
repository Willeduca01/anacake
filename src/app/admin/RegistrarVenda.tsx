"use client";

import { useActionState } from "react";
import {
  registrarVendaAction,
  type VendaFormState,
} from "@/app/admin/actions";

interface ProdutoOpcao {
  id: number;
  nome: string;
  preco: number;
  estoque_atual: number;
  ativo: boolean;
}

const inputClass =
  "w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30";
const labelClass = "block text-xs font-medium text-chocolate-muted mb-1";

const METODOS = ["Dinheiro", "Pix", "Cartão de Crédito", "Cartão de Débito", "Outro"];

const initial: VendaFormState = { ok: false, message: "" };

export default function RegistrarVenda({
  produtos,
}: {
  produtos: ProdutoOpcao[];
}) {
  const [state, formAction, pending] = useActionState(
    registrarVendaAction,
    initial
  );

  return (
    <div className="rounded-2xl border border-rose-light bg-white p-6">
      <h3 className="mb-4 font-semibold text-chocolate">Registrar venda</h3>

      {state.message && (
        <p
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            state.ok
              ? "bg-badge-green text-badge-green-text"
              : "bg-badge-red text-badge-red-text"
          }`}
        >
          {state.message}
        </p>
      )}

      <form action={formAction} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Produto</label>
          <select name="produto_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Selecione…
            </option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id} disabled={p.estoque_atual <= 0}>
                {p.nome} — estoque: {p.estoque_atual}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Quantidade</label>
          <input
            name="quantidade"
            type="number"
            min="1"
            defaultValue={1}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Pagamento</label>
          <select name="metodo_pagamento" defaultValue="Dinheiro" className={inputClass}>
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-rose-pastel px-6 py-2 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60"
          >
            {pending ? "Registrando…" : "Registrar venda"}
          </button>
        </div>
      </form>
    </div>
  );
}
