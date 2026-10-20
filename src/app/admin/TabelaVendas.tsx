"use client";

import { useState } from "react";
import type { VendaRegistro } from "@/lib/vendas";
import { conciliarEstoqueVendaAction } from "@/app/admin/actions";
import {
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  X,
  Sparkles,
  Layers,
} from "lucide-react";

interface ProdutoOpcao {
  id: number;
  nome: string;
  preco: number;
  estoque_atual: number;
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default function TabelaVendas({
  vendas,
  produtos,
}: {
  vendas: VendaRegistro[];
  produtos: ProdutoOpcao[];
}) {
  const [vendaSelecionada, setVendaSelecionada] = useState<VendaRegistro | null>(null);
  const [darBaixaProduto, setDarBaixaProduto] = useState<boolean>(true);
  const [produtoId, setProdutoId] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  function abrirModalConciliacao(venda: VendaRegistro) {
    setVendaSelecionada(venda);
    setProdutoId(venda.produto_id ?? (produtos[0]?.id ?? ""));
    setQuantidade(venda.quantidade || 1);
    setDarBaixaProduto(Boolean(venda.produto_id));
  }

  function fecharModal() {
    setVendaSelecionada(null);
    setLoading(false);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-rose-light bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-rose-light flex items-center justify-between">
          <h3 className="text-sm font-semibold text-chocolate">
            Histórico de vendas{" "}
            <span className="font-normal text-chocolate-muted">
              ({vendas.length})
            </span>
          </h3>
          <span className="sm:hidden text-[11px] text-chocolate-muted">
            ← Deslize tabela →
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-cream text-left text-chocolate-muted border-b border-rose-light/60">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Data</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Tipo</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Item / Descrição</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Qtd</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Valor</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Pagamento</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Estoque / Ação</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-chocolate-muted">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              )}
              {vendas.map((v) => {
                const isAvulsa = v.tipo_venda === "AVULSA";
                const estoquePendente = !v.baixa_estoque_realizada;

                return (
                  <tr key={v.id} className="border-t border-rose-light/60 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-3 text-chocolate-muted whitespace-nowrap">
                      {formatarData(v.data_venda)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isAvulsa ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-pastel/15 px-2.5 py-0.5 text-xs font-semibold text-rose-pastel border border-rose-pastel/20">
                          <Sparkles className="w-3 h-3" />
                          Avulsa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-chocolate-muted border border-rose-light">
                          <Layers className="w-3 h-3" />
                          Padrão
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-chocolate">
                      <div className="flex flex-col">
                        <span>{v.produto_nome ?? v.descricao_avulsa ?? "—"}</span>
                        {isAvulsa && v.produto_nome && v.descricao_avulsa && (
                          <span className="text-[11px] text-chocolate-muted">
                            Ref: {v.produto_nome}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-chocolate">{v.quantidade}</td>
                    <td className="px-4 py-3 font-bold text-chocolate whitespace-nowrap">
                      {brl(v.valor_total)}
                    </td>
                    <td className="px-4 py-3 text-chocolate-muted whitespace-nowrap">
                      {v.metodo_pagamento ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {estoquePendente ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirModalConciliacao(v)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-pastel/10 hover:bg-rose-pastel px-2.5 py-1 text-xs font-semibold text-chocolate hover:text-white border border-rose-pastel/30 transition-all cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            Conciliar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-badge-green px-2.5 py-0.5 text-xs font-semibold text-badge-green-text">
                            <CheckCircle2 className="w-3 h-3" />
                            Baixado
                          </span>
                          {v.conciliado_por_admin && (
                            <span className="text-[10px] text-chocolate-muted font-medium">
                              (manual)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONCILIAÇÃO DE ESTOQUE */}
      {vendaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-light animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-rose-light">
              <div className="flex items-center gap-2 text-chocolate font-bold">
                <SlidersHorizontal className="w-5 h-5 text-rose-pastel" />
                <h3>Conciliar Estoque Manualmente</h3>
              </div>
              <button
                type="button"
                onClick={fecharModal}
                className="rounded-lg p-1 text-chocolate-muted hover:bg-rose-light/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 rounded-xl bg-cream/70 p-3.5 border border-rose-light text-xs text-chocolate space-y-1">
              <p>
                <strong className="font-semibold text-chocolate-muted">Venda:</strong>{" "}
                <span className="font-bold">
                  {vendaSelecionada.produto_nome ?? vendaSelecionada.descricao_avulsa}
                </span>
              </p>
              <p>
                <strong className="font-semibold text-chocolate-muted">Qtd vendida:</strong>{" "}
                {vendaSelecionada.quantidade} un. —{" "}
                <strong className="font-semibold text-chocolate-muted">Valor:</strong>{" "}
                {brl(vendaSelecionada.valor_total)}
              </p>
            </div>

            <form
              action={async (formData) => {
                setLoading(true);
                try {
                  await conciliarEstoqueVendaAction(formData);
                  fecharModal();
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Erro ao conciliar estoque.");
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="venda_id" value={vendaSelecionada.id} />

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-chocolate cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_conciliacao"
                    checked={darBaixaProduto}
                    onChange={() => setDarBaixaProduto(true)}
                    className="accent-rose-pastel cursor-pointer"
                  />
                  <span>Dar baixa no estoque de um produto acabado</span>
                </label>

                {darBaixaProduto && (
                  <div className="pl-6 space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-chocolate-muted mb-1">
                        Selecione o produto a deduzir:
                      </label>
                      <select
                        name="produto_id"
                        value={produtoId}
                        onChange={(e) =>
                          setProdutoId(e.target.value ? Number(e.target.value) : "")
                        }
                        className="w-full rounded-lg border border-rose-light bg-warm-white px-3 py-1.5 text-xs text-chocolate"
                      >
                        <option value="" disabled>
                          Selecione…
                        </option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} (Atual: {p.estoque_atual} un)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-chocolate-muted mb-1">
                        Quantidade a abater:
                      </label>
                      <input
                        name="quantidade"
                        type="number"
                        min="1"
                        value={quantidade}
                        onChange={(e) => setQuantidade(Number(e.target.value) || 1)}
                        className="w-full rounded-lg border border-rose-light bg-warm-white px-3 py-1.5 text-xs text-chocolate"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs font-semibold text-chocolate cursor-pointer pt-2">
                  <input
                    type="radio"
                    name="tipo_conciliacao"
                    checked={!darBaixaProduto}
                    onChange={() => setDarBaixaProduto(false)}
                    className="accent-rose-pastel cursor-pointer"
                  />
                  <span>Apenas marcar como conciliado (sem dedução de estoque)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-rose-light">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={loading}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-chocolate-muted hover:bg-cream transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-rose-pastel hover:bg-chocolate-light px-5 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Conciliando…" : "Confirmar Conciliação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
