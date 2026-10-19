"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import {
  type Produto,
  formatarPreco,
  fonteImagem,
  iconePorCategoria,
} from "@/constants/products";
import MenuFilter from "@/components/MenuFilter";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCart } from "@/contexts/CartContext";
import { sanitizarTexto } from "@/lib/sanitize";

interface CardapioClientProps {
  produtos: Produto[];
  categoriaInicial?: string;
}

export default function CardapioClient({
  produtos,
  categoriaInicial,
}: CardapioClientProps) {
  const { itens, totalItens, totalPrecoFormatado, adicionar, abrirSacola } =
    useCart();

  const categorias = useMemo(
    () => [
      ...new Set(produtos.map((p) => sanitizarTexto(p.categoria) || "Outros")),
    ],
    [produtos]
  );

  const [filtro, setFiltro] = useState<string>(() => {
    if (!categoriaInicial) return "Todos";
    const sanitizado = sanitizarTexto(categoriaInicial).toLowerCase();
    const encontrada = categorias.find(
      (c) => sanitizarTexto(c).toLowerCase() === sanitizado
    );
    return encontrada || "Todos";
  });

  const [prevCategoriaInicial, setPrevCategoriaInicial] = useState(
    categoriaInicial
  );

  if (categoriaInicial !== prevCategoriaInicial) {
    setPrevCategoriaInicial(categoriaInicial);
    if (categoriaInicial) {
      const sanitizado = sanitizarTexto(categoriaInicial).toLowerCase();
      const encontrada = categorias.find(
        (c) => sanitizarTexto(c).toLowerCase() === sanitizado
      );
      setFiltro(encontrada || "Todos");
    } else {
      setFiltro("Todos");
    }
  }

  const filtroSanitizado = sanitizarTexto(filtro) || "Todos";
  const [produtoDetalhe, setProdutoDetalhe] = useState<Produto | null>(null);

  // Produtos mais pedidos (destaques do topo)
  const maisPedidos = useMemo(() => {
    return produtos.slice(0, 6);
  }, [produtos]);

  // Agrupamento por categoria para exibição limpa em seções
  const produtosPorCategoria = useMemo(() => {
    const map = new Map<string, Produto[]>();
    for (const cat of categorias) {
      map.set(cat, []);
    }
    for (const p of produtos) {
      const cat = sanitizarTexto(p.categoria) || "Outros";
      const lista = map.get(cat) ?? [];
      lista.push(p);
      map.set(cat, lista);
    }
    return map;
  }, [categorias, produtos]);

  const handleAdicionarDestaque = (e: React.MouseEvent, produto: Produto) => {
    e.stopPropagation();
    if (produto.estoque === 0) return;
    adicionar(produto);
  };

  return (
    <div className="space-y-6">
      {/* 2. Barra de Categorias em Chips / Pílulas */}
      <div className="sticky top-14 sm:top-16 z-30 bg-warm-white/95 backdrop-blur-md py-2.5 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-rose-light/50">
        <MenuFilter
          categorias={categorias}
          filtroAtivo={filtro}
          onFiltrar={setFiltro}
        />
      </div>

      {/* 3. Seção "Mais Pedidos" (Carrossel Horizontal) - Exibida quando em Todos ou no topo geral */}
      {filtroSanitizado === "Todos" && maisPedidos.length > 0 && (
        <section className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-[#4A2B20] flex items-center gap-1.5 whitespace-nowrap">
              <span>🏆</span> Mais Pedidos
            </h2>
            <div className="h-px flex-1 bg-[#EAD8D0]" />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar scrollbar-none pb-2 pt-0.5 px-0.5">
            {maisPedidos.map((produto) => {
              const imagemSrc = fonteImagem(produto);
              const esgotado = produto.estoque === 0;
              const itemNaSacola = itens.find((i) => i.produto.nome === produto.nome);

              return (
                <div
                  key={`mais-pedido-${produto.nome}`}
                  onClick={() => setProdutoDetalhe(produto)}
                  className="w-36 sm:w-44 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-[#F3E8E2] shadow-sm relative group cursor-pointer active:scale-[0.98] transition-all duration-200"
                >
                  <div className="relative h-44 sm:h-48 w-full bg-cream">
                    <Image
                      src={imagemSrc}
                      alt={produto.nome}
                      fill
                      unoptimized={imagemSrc.startsWith("/api/")}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 144px, 176px"
                    />

                    {/* Badge sobreposto */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-[#C88A8A] shadow-xs">
                        ★ Top
                      </span>
                    </div>

                    {itemNaSacola && (
                      <div className="absolute top-2 right-2 z-10 h-5 min-w-5 rounded-full bg-[#C88A8A] flex items-center justify-center px-1.5 gap-0.5 shadow-sm">
                        <Check className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-bold text-white">
                          {itemNaSacola.quantidade}
                        </span>
                      </div>
                    )}

                    {/* Barra inferior / Sobreposição escura transparente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-2.5 sm:p-3 z-10">
                      <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-1 drop-shadow-sm mb-1">
                        {produto.nome}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-extrabold text-sm sm:text-base drop-shadow-sm">
                          {formatarPreco(produto.preco)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleAdicionarDestaque(e, produto)}
                          disabled={esgotado}
                          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed ${
                            itemNaSacola
                              ? "bg-[#A76D6D]"
                              : "bg-[#C88A8A] hover:bg-[#B77979]"
                          }`}
                          aria-label={`Adicionar ${produto.nome}`}
                        >
                          {itemNaSacola ? (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          ) : (
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Listagem de Categorias e Itens em Lista Vertical */}
      <div className="space-y-8">
        {filtroSanitizado === "Todos" ? (
          // Exibe cada categoria com seu título, emoji temático e divisor
          categorias.map((cat) => {
            const itensDaCategoria = produtosPorCategoria.get(cat) ?? [];
            if (itensDaCategoria.length === 0) return null;

            return (
              <section key={cat} className="space-y-3.5">
                <div className="flex items-center gap-3 pt-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#4A2B20] flex items-center gap-2 whitespace-nowrap capitalize">
                    <span>{iconePorCategoria(cat)}</span>
                    <span>{cat}</span>
                  </h2>
                  <div className="h-px flex-1 bg-[#EAD8D0]" />
                </div>

                <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {itensDaCategoria.map((produto) => (
                    <ProductCard
                      key={produto.nome}
                      produto={produto}
                      onAbrirDetalhes={setProdutoDetalhe}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          // Exibe apenas a categoria selecionada com cabeçalho
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#4A2B20] flex items-center gap-2 whitespace-nowrap capitalize">
                <span>{iconePorCategoria(filtroSanitizado)}</span>
                <span>{filtroSanitizado}</span>
              </h2>
              <div className="h-px flex-1 bg-[#EAD8D0]" />
            </div>

            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {(produtosPorCategoria.get(filtroSanitizado) ?? []).map(
                (produto) => (
                  <ProductCard
                    key={produto.nome}
                    produto={produto}
                    onAbrirDetalhes={setProdutoDetalhe}
                  />
                )
              )}
            </div>
          </section>
        )}
      </div>

      {/* Caso vazio na categoria filtrada */}
      {filtroSanitizado !== "Todos" &&
        (produtosPorCategoria.get(filtroSanitizado) ?? []).length === 0 && (
          <div className="text-center text-chocolate-muted py-12 space-y-2">
            <p className="font-semibold text-chocolate">
              Nenhum produto encontrado em &ldquo;{filtroSanitizado}&rdquo; no
              momento.
            </p>
            <button
              onClick={() => setFiltro("Todos")}
              className="text-xs text-[#C88A8A] font-bold hover:underline"
            >
              Ver todos os produtos do cardápio
            </button>
          </div>
        )}

      {/* Barra Flutuante Mobile: "Ver Sacola" para quando o cliente terminar de escolher */}
      {totalItens > 0 && (
        <aside className="fixed bottom-4 left-3.5 right-3.5 z-40 sm:hidden">
          <button
            type="button"
            onClick={abrirSacola}
            className="w-full flex items-center justify-between bg-[#4A2B20] text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-black/25 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C88A8A] px-1.5 text-xs font-bold text-white">
                {totalItens}
              </span>
              <span className="text-sm font-semibold">Ver Sacola</span>
            </div>
            <span className="text-sm font-extrabold text-[#FDF6F0]">
              {totalPrecoFormatado}
            </span>
          </button>
        </aside>
      )}
      {/* Modal de Detalhes do Produto ao clicar no card */}
      <ProductDetailModal
        produto={produtoDetalhe}
        onClose={() => setProdutoDetalhe(null)}
      />
    </div>
  );
}
