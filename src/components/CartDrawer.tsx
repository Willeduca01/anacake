"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { formatarPreco, imagemPorCategoria } from "@/constants/products";
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

  const enviarPedido = () => {
    const waUrl = `https://wa.me/5519978293375?text=${encodeURIComponent(
      montarMensagem(itens, totalPrecoFormatado, nome)
    )}`;
    // Abre o WhatsApp de forma sincrona (dentro do gesto do usuario) para
    // nao ser bloqueado por popup, e registra o pedido em segundo plano.
    window.open(waUrl, "_blank", "noopener,noreferrer");
    void criarPedidoAction({
      cliente_nome: nome,
      itens: itens.map(({ produto, quantidade }) => ({
        produto_nome: produto.nome,
        quantidade,
        preco_unit: produto.preco,
      })),
    }).catch(() => {});
    setNome("");
    limpar();
    fecharSacola();
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
                          src={imagemPorCategoria(produto.categoria)}
                          alt={produto.nome}
                          fill
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

                  <button
                    onClick={enviarPedido}
                    className="block w-full rounded-full bg-rose-pastel py-3 text-center text-sm font-semibold text-white shadow-lg shadow-rose-pastel/30 hover:bg-chocolate-light transition-colors"
                  >
                    Enviar Pedido via WhatsApp
                  </button>

                  <button
                    onClick={limpar}
                    className="block w-full rounded-full border border-rose-light py-2.5 text-center text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
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
  nome?: string
): string {
  const linhas = itens.map(
    ({ produto, quantidade }) =>
      `• ${quantidade}x ${produto.nome} — ${formatarPreco(produto.preco * quantidade)}`
  );
  const saudacao = nome && nome.trim()
    ? `Olá! Aqui é ${nome.trim()}. Gostaria de fazer o seguinte pedido:`
    : "Olá! Gostaria de fazer o seguinte pedido:";
  return `${saudacao}\n\n${linhas.join("\n")}\n\n*Total: ${total}*`;
}
