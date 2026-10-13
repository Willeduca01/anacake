"use client";

import { useState, useActionState } from "react";
import {
  registrarVendaAction,
  type VendaFormState,
} from "@/app/admin/actions";
import { METODOS_PAGAMENTO } from "@/constants/pagamento";
import { Sparkles, ShoppingBag, Layers, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProdutoOpcao {
  id: number;
  nome: string;
  preco: number;
  estoque_atual: number;
  ativo: boolean;
}

const inputClass =
  "w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30";
const labelClass = "block text-xs font-semibold text-chocolate mb-1";

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

  const [modoVenda, setModoVenda] = useState<"PADRAO" | "AVULSA">("PADRAO");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [valorTotalAvulso, setValorTotalAvulso] = useState<string>("");
  const [naoAbaterEstoque, setNaoAbaterEstoque] = useState<boolean>(true);

  // Calcula valor previsto se for venda padrão
  const produtoAtual = produtos.find((p) => p.id === Number(produtoSelecionadoId));
  const valorTotalPrevisto =
    produtoAtual && Number(quantidade) > 0
      ? (produtoAtual.preco * Number(quantidade)).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : null;

  return (
    <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-rose-light/50 pb-4">
        <div>
          <h3 className="font-bold text-chocolate text-base sm:text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-pastel" />
            Lançar Nova Venda
          </h3>
          <p className="text-xs text-chocolate-muted mt-0.5">
            Registre saídas de produtos do cardápio ou vendas avulsas de encomendas
          </p>
        </div>

        {/* Abas de Modo de Venda */}
        <div className="flex items-center rounded-xl bg-cream/70 p-1 border border-rose-light self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setModoVenda("PADRAO")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modoVenda === "PADRAO"
                ? "bg-white text-chocolate shadow-xs"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Venda Padrão (Cardápio)
          </button>
          <button
            type="button"
            onClick={() => setModoVenda("AVULSA")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modoVenda === "AVULSA"
                ? "bg-rose-pastel text-white shadow-xs"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Venda Avulsa / Encomenda
          </button>
        </div>
      </div>

      {state.message && (
        <div
          className={`mb-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            state.ok
              ? "bg-badge-green text-badge-green-text border border-badge-green-text/20"
              : "bg-badge-red text-badge-red-text border border-badge-red-text/20"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="tipo_venda" value={modoVenda} />

        {modoVenda === "PADRAO" ? (
          /* ==========================================================
             MODO PADRÃO: Venda com baixa automática de produto
             ========================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Produto do Cardápio</label>
              <select
                name="produto_id"
                required
                value={produtoSelecionadoId}
                onChange={(e) =>
                  setProdutoSelecionadoId(e.target.value ? Number(e.target.value) : "")
                }
                className={inputClass}
              >
                <option value="" disabled>
                  Selecione um produto…
                </option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.estoque_atual <= 0}>
                    {p.nome} — R$ {p.preco.toFixed(2)} (Estoque: {p.estoque_atual} un)
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
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className={inputClass}
                placeholder="Ex: 1"
              />
              {valorTotalPrevisto && (
                <span className="text-[11px] font-semibold text-rose-pastel mt-1 block">
                  Total: {valorTotalPrevisto}
                </span>
              )}
            </div>

            <div>
              <label className={labelClass}>Forma de Pagamento</label>
              <select name="metodo_pagamento" defaultValue="PIX" className={inputClass}>
                {METODOS_PAGAMENTO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* ==========================================================
             MODO AVULSO: Encomenda / Venda sem baixa imediata
             ========================================================== */
          <div className="space-y-4 bg-rose-light/20 p-4 rounded-xl border border-rose-light/60">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Descrição do Item / Encomenda <span className="text-red-500">*</span>
                </label>
                <input
                  name="descricao_avulsa"
                  type="text"
                  required
                  placeholder="Ex: Bolo de Casamento 3 Andares (Massa Baunilha + Ninho)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Produto de Referência (Opcional)</label>
                <select name="produto_id" defaultValue="" className={inputClass}>
                  <option value="">Nenhum (Item sob medida)</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Quantidade</label>
                <input
                  name="quantidade"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Valor Total Cobrado (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  name="valor_total"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={valorTotalAvulso}
                  onChange={(e) => setValorTotalAvulso(e.target.value)}
                  placeholder="Ex: 180.00"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Forma de Pagamento</label>
                <select name="metodo_pagamento" defaultValue="PIX" className={inputClass}>
                  {METODOS_PAGAMENTO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox de Venda Avulsa sem abate de estoque */}
            <div className="mt-3 rounded-lg bg-white p-3 border border-rose-light flex items-start gap-3">
              <input
                id="nao_abater_estoque"
                name="nao_abater_estoque"
                type="checkbox"
                checked={naoAbaterEstoque}
                onChange={(e) => setNaoAbaterEstoque(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-rose-pastel text-rose-pastel focus:ring-rose-pastel/40 accent-rose-pastel cursor-pointer"
              />
              <label htmlFor="nao_abater_estoque" className="text-xs text-chocolate cursor-pointer">
                <strong className="block font-bold">
                  Venda Avulsa (Não abater do estoque agora)
                </strong>
                <span className="text-chocolate-muted">
                  O valor entra imediatamente na receita financeira do Dashboard, mas você
                  poderá conciliar e dar baixa manual de insumos ou produtos posteriormente.
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto rounded-full bg-rose-pastel px-6 py-2.5 text-sm font-bold text-white hover:bg-chocolate-light transition-all shadow-sm hover:shadow disabled:opacity-60 text-center flex items-center justify-center gap-2"
          >
            {pending ? (
              "Gravando venda…"
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Confirmar Registro de Venda
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
