"use client";

import { motion } from "framer-motion";

interface MenuFilterProps {
  categorias: string[];
  filtroAtivo: string;
  onFiltrar: (filtro: string) => void;
}

export default function MenuFilter({ categorias, filtroAtivo, onFiltrar }: MenuFilterProps) {
  const opcoes = ["Todos", ...categorias];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {opcoes.map((opcao) => {
        const ativo = filtroAtivo === opcao;
        return (
          <button
            key={opcao}
            onClick={() => onFiltrar(opcao)}
            className="relative rounded-full px-5 py-2 text-sm font-medium transition-colors"
          >
            {ativo && (
              <motion.span
                layoutId="filtro-ativo"
                className="absolute inset-0 rounded-full bg-rose-pastel shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span
              className={`relative z-10 ${
                ativo ? "text-white" : "text-chocolate-muted hover:text-chocolate"
              }`}
            >
              {opcao}
            </span>
          </button>
        );
      })}
    </div>
  );
}
