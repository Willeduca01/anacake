export type TemaSlug =
  | "natal"
  | "pascoa"
  | "carnaval"
  | "dia-das-maes"
  | "padrao";

export interface DataComemorativaConfig {
  id?: number;
  ativo: boolean;
  nome_aba: string;
  tema_slug: string;
  badge_texto?: string;
  subtitulo?: string;
  fonte_titulo?: string;
  tamanho_titulo?: string;
  updated_at?: string;
  produto_ids: number[];
}

export const DATA_COMEMORATIVA_PADRAO: DataComemorativaConfig = {
  ativo: false,
  nome_aba: "Natal",
  tema_slug: "natal",
  badge_texto: "Especial de Fim de Ano",
  subtitulo:
    "Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.",
  fonte_titulo: "great-vibes",
  tamanho_titulo: "medio",
  produto_ids: [],
};

export const TEMAS_DISPONIVEIS: {
  slug: TemaSlug;
  label: string;
  icone: string;
}[] = [
  { slug: "natal", label: "Natal", icone: "🎄" },
  { slug: "pascoa", label: "Páscoa", icone: "🐰" },
  { slug: "carnaval", label: "Carnaval", icone: "🎭" },
  { slug: "dia-das-maes", label: "Dia das Mães", icone: "💐" },
  { slug: "padrao", label: "Padrão / Geral", icone: "✨" },
];

export function iconePorTema(slug: string): string {
  const normalizado = slug.toLowerCase().trim();
  switch (normalizado) {
    case "natal":
      return "🎄";
    case "pascoa":
      return "🐰";
    case "carnaval":
      return "🎭";
    case "dia-das-maes":
      return "💐";
    default:
      return "✨";
  }
}
