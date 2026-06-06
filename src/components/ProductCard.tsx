"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import { type Produto, formatarPreco, fonteImagem } from "@/constants/products";
import { useCart } from "@/contexts/CartContext";

function StockBadge({ estoque }: { estoque: number }) {
  if (estoque === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-badge-red px-2.5 py-0.5 text-xs font-medium text-badge-red-text">
        Esgotado
      </span>
    );
  }
  if (estoque <= 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-badge-yellow px-2.5 py-0.5 text-xs font-medium text-badge-yellow-text">
        Apenas {estoque} restantes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-badge-green px-2.5 py-0.5 text-xs font-medium text-badge-green-text">
      Em estoque
    </span>
  );
}

export default function ProductCard({ produto }: { produto: Produto }) {
  const { itens, adicionar, abrirSacola } = useCart();
  const itemNaSacola = itens.find((i) => i.produto.nome === produto.nome);
  const esgotado = produto.estoque === 0;

  const handleAdicionar = () => {
    adicionar(produto);
    abrirSacola();
  };

  const imagemSrc = fonteImagem(produto);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="group rounded-2xl border border-rose-light bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <Image
          src={imagemSrc}
          alt={produto.nome}
          fill
          unoptimized={imagemSrc.startsWith("/api/")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <StockBadge estoque={produto.estoque} />
        </div>
        {itemNaSacola && (
          <div className="absolute top-3 right-3 h-7 min-w-7 rounded-full bg-rose-pastel flex items-center justify-center px-2 gap-1">
            <Check className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">{itemNaSacola.quantidade}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-rose-pastel">
          {produto.categoria}
        </span>
        <h3 className="text-base font-semibold text-chocolate mb-3">{produto.nome}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-chocolate">
            {formatarPreco(produto.preco)}
          </span>
          <button
            onClick={handleAdicionar}
            disabled={esgotado}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-pastel px-4 py-1.5 text-xs font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {esgotado ? "Esgotado" : "Adicionar"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
