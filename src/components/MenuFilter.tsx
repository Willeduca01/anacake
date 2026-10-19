"use client";

interface MenuFilterProps {
  categorias: string[];
  filtroAtivo: string;
  onFiltrar: (filtro: string) => void;
}

export default function MenuFilter({
  categorias,
  filtroAtivo,
  onFiltrar,
}: MenuFilterProps) {
  const opcoes = ["Todos", ...categorias];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1.5 px-1 sm:justify-center">
      {opcoes.map((opcao) => {
        const ativo = filtroAtivo === opcao;
        return (
          <button
            key={opcao}
            type="button"
            onClick={() => onFiltrar(opcao)}
            className={`whitespace-nowrap rounded-full px-5 py-1.5 text-sm font-medium transition-all flex-shrink-0 cursor-pointer ${
              ativo
                ? "bg-[#C88A8A] text-white shadow-xs"
                : "bg-white border border-[#EAD8D0] text-[#5C3D2E] hover:border-[#C88A8A]/60 hover:text-[#4A2B20]"
            }`}
          >
            {opcao}
          </button>
        );
      })}
    </div>
  );
}
