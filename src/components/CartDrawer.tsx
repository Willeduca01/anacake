"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { formatarPreco, fonteImagem } from "@/constants/products";
import { METODOS_PAGAMENTO } from "@/constants/pagamento";
import { criarPedidoAction } from "@/app/actions/pedidos";

export default function CartDrawer() {
  const {
    itens,
    aberta,
    fecharSacola,
    incrementar,
    decrementar,
    remover,
    limpar,
    totalItens,
    totalPrecoFormatado,
  } = useCart();

  const [nome, setNome] = useState("");
  const [metodo, setMetodo] = useState<string>(METODOS_PAGAMENTO[0]);
  const [enviando, setEnviando] = useState(false);
  const [alertaEstoque, setAlertaEstoque] = useState<{
    itemNome: string;
    mensagem?: string;
  } | null>(null);
  const [erroCheckout, setErroCheckout] = useState<string | null>(null);

  const enviarPedido = async () => {
    if (enviando || itens.length === 0) return;

    setEnviando(true);
    setAlertaEstoque(null);
    setErroCheckout(null);

    try {
      const res = await criarPedidoAction({
        cliente_nome: nome,
        metodo_pagamento: metodo,
        itens: itens.map(({ produto, quantidade }) => ({
          produto_nome: produto.nome,
          quantidade,
          preco_unit: produto.preco,
        })),
      });

      if (!res.success) {
        if (res.error === "OUT_OF_STOCK" && res.itemNome) {
          // Trata o erro 'OUT_OF_STOCK': remove apenas o produto esgotado sem resetar os demais
          remover(res.itemNome);
          setAlertaEstoque({
            itemNome: res.itemNome,
            mensagem: res.message,
          });
        } else {
          setErroCheckout(res.message || "Não foi possível finalizar o pedido.");
        }
        setEnviando(false);
        return;
      }

      // Sucesso na reserva e criação do pedido: abrir WhatsApp com a mensagem
      const waUrl = `https://wa.me/5519978293375?text=${encodeURIComponent(
        montarMensagem(itens, totalPrecoFormatado, nome, metodo)
      )}`;

      const win = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.href = waUrl;
      }

      setNome("");
      setMetodo(METODOS_PAGAMENTO[0]);
      limpar();
      fecharSacola();
    } catch {
      setErroCheckout(
        "Falha na comunicação ao processar seu pedido. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AnimatePresence>
      {aberta && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fecharSacola}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-warm-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-rose-light">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-rose-pastel" />
                <h2 className="text-lg font-bold text-chocolate">Sua Sacola</h2>
                {totalItens > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-rose-pastel px-2 text-xs font-bold text-white">
                    {totalItens}
                  </span>
                )}
              </div>
              <button
                onClick={fecharSacola}
                className="p-2 rounded-lg text-chocolate-muted hover:bg-rose-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {alertaEstoque && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-sm">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 text-sm">
                    Item indisponível no momento
                  </p>
                  <p className="mt-1 text-amber-800 leading-relaxed">
                    O produto{" "}
                    <strong className="font-bold underline text-amber-950">
                      {alertaEstoque.itemNome}
                    </strong>{" "}
                    acabou de esgotar ou não possui estoque suficiente e foi removido da sua sacola. Os demais itens continuam salvos!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertaEstoque(null)}
                  className="text-amber-600 hover:text-amber-800 p-1"
                  aria-label="Fechar aviso de estoque"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {erroCheckout && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3 shadow-sm">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 text-sm">
                    Não foi possível concluir
                  </p>
                  <p className="mt-1 text-red-800 leading-relaxed">
                    {erroCheckout}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErroCheckout(null)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Fechar erro"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {itens.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="h-20 w-20 rounded-full bg-rose-light/50 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-rose-pastel/60" />
                </div>
                <p className="text-chocolate-muted">Sua sacola está vazia.</p>
                <button
                  onClick={fecharSacola}
                  className="rounded-full bg-rose-pastel px-6 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors"
                >
                  Explorar Cardápio
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto divide-y divide-rose-light/60 px-6">
                  {itens.map(({ produto, quantidade }) => (
                    <li key={produto.nome} className="py-4 flex gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-cream">
                        <Image
                          src={fonteImagem(produto)}
                          alt={produto.nome}
                          fill
                          unoptimized={fonteImagem(produto).startsWith("/api/")}
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-chocolate truncate">
                          {produto.nome}
                        </h3>
                        <p className="text-xs text-chocolate-muted mt-0.5">
                          {formatarPreco(produto.preco)} cada
                        </p>
                        <p className="text-sm font-bold text-chocolate mt-1">
                          {formatarPreco(produto.preco * quantidade)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => remover(produto.nome)}
                          className="p-1 text-chocolate-muted hover:text-red-500 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decrementar(produto.nome)}
                            className="h-7 w-7 rounded-lg border border-rose-light flex items-center justify-center text-chocolate-muted hover:bg-rose-light transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-chocolate">
                            {quantidade}
                          </span>
                          <button
                            onClick={() => incrementar(produto.nome)}
                            className="h-7 w-7 rounded-lg border border-rose-light flex items-center justify-center text-chocolate-muted hover:bg-rose-light transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-rose-light px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-chocolate-muted">
                      {totalItens} {totalItens === 1 ? "item" : "itens"}
                    </span>
                    <span className="text-xl font-bold text-chocolate">
                      {totalPrecoFormatado}
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="cliente-nome"
                      className="block text-xs font-medium text-chocolate-muted mb-1"
                    >
                      Seu nome (opcional)
                    </label>
                    <input
                      id="cliente-nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Como podemos te chamar?"
                      maxLength={120}
                      className="w-full rounded-lg border border-rose-light bg-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="metodo-pagamento"
                      className="block text-xs font-medium text-chocolate-muted mb-1"
                    >
                      Forma de pagamento
                    </label>
                    <select
                      id="metodo-pagamento"
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value)}
                      className="w-full rounded-lg border border-rose-light bg-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
                    >
                      {METODOS_PAGAMENTO.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={enviarPedido}
                    disabled={enviando || itens.length === 0}
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-rose-pastel py-3 text-center text-sm font-semibold text-white shadow-lg shadow-rose-pastel/30 hover:bg-chocolate-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                    {enviando ? "Verificando estoque..." : "Enviar Pedido via WhatsApp"}
                  </button>

                  <button
                    onClick={() => {
                      setAlertaEstoque(null);
                      setErroCheckout(null);
                      limpar();
                    }}
                    disabled={enviando}
                    className="block w-full rounded-full border border-rose-light py-2.5 text-center text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors disabled:opacity-50"
                  >
                    Limpar Sacola
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function montarMensagem(
  itens: { produto: { nome: string; preco: number }; quantidade: number }[],
  total: string,
  nome?: string,
  metodo?: string
): string {
  const linhas = itens.map(
    ({ produto, quantidade }) =>
      `• ${quantidade}x ${produto.nome} — ${formatarPreco(produto.preco * quantidade)}`
  );
  const saudacao = nome && nome.trim()
    ? `Olá! Aqui é ${nome.trim()}. Gostaria de fazer o seguinte pedido:`
    : "Olá! Gostaria de fazer o seguinte pedido:";
  const pagamento = metodo ? `\n*Pagamento: ${metodo}*` : "";
  return `${saudacao}\n\n${linhas.join("\n")}\n\n*Total: ${total}*${pagamento}`;
}
