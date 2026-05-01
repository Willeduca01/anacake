"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Produto } from "@/constants/products";
import MenuFilter from "@/components/MenuFilter";
import ProductCard from "@/components/ProductCard";

interface CardapioClientProps {
  produtos: Produto[];
}

export default function CardapioClient({ produtos }: CardapioClientProps) {
  const [filtro, setFiltro] = useState("Todos");

  const categorias = useMemo(
    () => [...new Set(produtos.map((p) => p.categoria))],
    [produtos]
  );

  const produtosFiltrados =
    filtro === "Todos"
      ? produtos
      : produtos.filter((p) => p.categoria === filtro);

  return (
    <>
      <div className="mb-10">
        <MenuFilter
          categorias={categorias}
          filtroAtivo={filtro}
          onFiltrar={setFiltro}
        />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={filtro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {produtosFiltrados.map((produto) => (
            <ProductCard key={produto.nome} produto={produto} />
          ))}
        </motion.div>
      </AnimatePresence>

      {produtosFiltrados.length === 0 && (
        <p className="text-center text-chocolate-muted mt-12">
          Nenhum produto encontrado nesta categoria.
        </p>
      )}
    </>
  );
}
