"use client";

import { motion } from "framer-motion";
import { iconePorTema } from "@/types/data-comemorativa";

interface MenuFilterProps {
  categorias: string[];
  filtroAtivo: string;
  onFiltrar: (filtro: string) => void;
  abaComemorativa?: {
    nome: string;
    tema_slug: string;
  } | null;
}

export default function MenuFilter({
  categorias,
  filtroAtivo,
  onFiltrar,
  abaComemorativa,
}: MenuFilterProps) {
  const opcoes = [
    "Todos",
    ...(abaComemorativa?.nome ? [abaComemorativa.nome] : []),
    ...categorias,
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1.5 px-1 sm:justify-center">
      {opcoes.map((opcao) => {
        const ativo = filtroAtivo === opcao;
        const isComemorativa =
          Boolean(abaComemorativa?.nome && opcao === abaComemorativa.nome);
        const isNatal = isComemorativa && abaComemorativa?.tema_slug === "natal";
        const isPascoa = isComemorativa && abaComemorativa?.tema_slug === "pascoa";
        const isCarnaval = isComemorativa && abaComemorativa?.tema_slug === "carnaval";
        const isMaes = isComemorativa && abaComemorativa?.tema_slug === "dia-das-maes";

        if (isNatal || isPascoa || isCarnaval || isMaes) {
          return (
            <motion.button
              key={opcao}
              type="button"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => onFiltrar(opcao)}
              className={`relative whitespace-nowrap rounded-full px-5 py-1.5 text-sm font-semibold transition-all flex-shrink-0 cursor-pointer flex items-center gap-1.5 overflow-hidden ${
                ativo
                  ? isPascoa
                    ? "bg-gradient-to-r from-[#592D23] via-[#753B2E] to-[#47221A] text-white shadow-[0_0_18px_rgba(117,59,46,0.65),0_0_8px_rgba(212,163,115,0.5)] ring-2 ring-[#D4A373]"
                    : isCarnaval
                      ? "bg-gradient-to-r from-[#D90368] via-[#B5179E] to-[#7209B7] text-white shadow-[0_0_18px_rgba(217,3,104,0.65),0_0_8px_rgba(0,240,255,0.4)] ring-2 ring-[#FFD166]"
                      : isMaes
                        ? "bg-gradient-to-r from-[#9D4452] via-[#B85766] to-[#8C3A48] text-white shadow-[0_0_18px_rgba(184,87,102,0.65),0_0_8px_rgba(255,215,186,0.5)] ring-2 ring-[#E5989B]"
                        : "bg-gradient-to-r from-[#8C131B] via-[#B81D27] to-[#7A0F16] text-white shadow-[0_0_18px_rgba(184,29,39,0.7),0_0_8px_rgba(255,215,0,0.45)] ring-2 ring-amber-300"
                  : isPascoa
                    ? "bg-gradient-to-r from-[#FDF8F5] to-[#F5ECE5] border border-[#D4A373]/80 text-[#592D23] hover:border-[#D4A373] hover:shadow-[0_0_14px_rgba(212,163,115,0.35)]"
                    : isCarnaval
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-[#D90368]/40 text-[#7209B7] hover:border-[#D90368] hover:shadow-[0_0_14px_rgba(217,3,104,0.3)]"
                      : isMaes
                        ? "bg-gradient-to-r from-rose-50 to-[#FFF0EB] border border-[#E5989B]/50 text-[#8C3A48] hover:border-[#E5989B] hover:shadow-[0_0_14px_rgba(229,152,155,0.35)]"
                        : "bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300/80 text-[#8C131B] hover:border-amber-400 hover:shadow-[0_0_14px_rgba(255,215,0,0.35)]"
              }`}
            >
              {/* Efeito de onda/brilho dourado/caramelo pulsante */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

              <span className="text-sm">
                {isPascoa ? "🐰" : isCarnaval ? "🎭" : isMaes ? "💖" : "🎄"}
              </span>
              <span>{opcao}</span>
              {ativo && (
                <span className="inline-block text-[10px] text-amber-200 animate-pulse">
                  ✨
                </span>
              )}
            </motion.button>
          );
        }

        return (
          <button
            key={opcao}
            type="button"
            onClick={() => onFiltrar(opcao)}
            className={`whitespace-nowrap rounded-full px-5 py-1.5 text-sm font-medium transition-all flex-shrink-0 cursor-pointer flex items-center gap-1.5 ${
              ativo
                ? "bg-[#C88A8A] text-white shadow-xs"
                : isComemorativa
                  ? "bg-white border border-[#C88A8A]/60 text-[#8B4545] hover:border-[#C88A8A] hover:bg-rose-50/50"
                  : "bg-white border border-[#EAD8D0] text-[#5C3D2E] hover:border-[#C88A8A]/60 hover:text-[#4A2B20]"
            }`}
          >
            {isComemorativa && abaComemorativa && (
              <span className="text-sm">
                {iconePorTema(abaComemorativa.tema_slug)}
              </span>
            )}
            <span>{opcao}</span>
          </button>
        );
      })}
    </div>
  );
}
