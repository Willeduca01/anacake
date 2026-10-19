"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import { type Produto, formatarPreco, fonteImagem } from "@/constants/products";
import { useCart } from "@/contexts/CartContext";

function StockBadge({ estoque }: { estoque: number }) {
  if (estoque === 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-rose-100/95 px-2 py-0.5 text-[10px] font-semibold text-rose-800 shadow-xs">
        Esgotado
      </span>
    );
  }
  if (estoque <= 5) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-100/95 px-2 py-0.5 text-[10px] font-semibold text-amber-800 shadow-xs">
        Restam {estoque}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-100/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-xs">
      Em estoque
    </span>
  );
}

export default function ProductCard({ produto }: { produto: Produto }) {
  const { itens, adicionar, abrirSacola } = useCart();
  const itemNaSacola = itens.find((i) => i.produto.nome === produto.nome);
  const esgotado = produto.estoque === 0;

  const handleAdicionar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (esgotado) return;
    adicionar(produto);
    abrirSacola();
  };

  const imagemSrc = fonteImagem(produto);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.3 }}
      onClick={handleAdicionar}
      className="group relative flex items-center gap-3.5 rounded-2xl bg-white border border-[#F3E8E2] p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Coluna da esquerda (Imagem com tamanho fixo e badge) */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-cream">
        <Image
          src={imagemSrc}
          alt={produto.nome}
          fill
          unoptimized={imagemSrc.startsWith("/api/")}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 96px, 112px"
        />
        <div className="absolute top-1.5 left-1.5 z-10">
          <StockBadge estoque={produto.estoque} />
        </div>
        {itemNaSacola && (
          <div className="absolute bottom-1.5 right-1.5 h-5 min-w-5 rounded-full bg-[#C88A8A] flex items-center justify-center px-1.5 gap-0.5 shadow-sm">
            <Check className="h-3 w-3 text-white" />
            <span className="text-[10px] font-bold text-white">
              {itemNaSacola.quantidade}
            </span>
          </div>
        )}
      </div>

      {/* Coluna da direita (Informações e Ação) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <h3 className="font-bold text-sm text-[#4A2B20] line-clamp-1 group-hover:text-[#C88A8A] transition-colors">
            {produto.nome}
          </h3>
          <p className="text-xs text-[#8B6E60] line-clamp-2 mt-0.5 leading-relaxed">
            {produto.descricao ||
              `Delicioso doce artesanal de ${produto.categoria}. Feito com ingredientes de alta confeitaria.`}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[#F8EFEA]/80">
          <span className="font-bold text-base text-[#4A2B20] whitespace-nowrap">
            {formatarPreco(produto.preco)}
          </span>

          <button
            type="button"
            onClick={handleAdicionar}
            disabled={esgotado}
            className="rounded-xl px-3 py-1.5 bg-[#C88A8A] hover:bg-[#B77979] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Adicionar ${produto.nome}`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{esgotado ? "Esgotado" : "Adicionar"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
