import {
  Great_Vibes,
  Cinzel,
  Playfair_Display,
  Montserrat,
  Caveat,
} from "next/font/google";

export const fontGreatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const fontCinzel = Cinzel({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const fontPlayfair = Playfair_Display({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const fontMontserrat = Montserrat({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const fontCaveat = Caveat({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export interface FonteOpcao {
  id: string;
  nome: string;
  estilo: string;
  className: string;
}

export const FONTES_DISPONIVEIS: FonteOpcao[] = [
  {
    id: "great-vibes",
    nome: "Great Vibes",
    estilo: "Cursiva Festiva Clássica",
    className: fontGreatVibes.className,
  },
  {
    id: "cinzel",
    nome: "Cinzel",
    estilo: "Elegante & Imperial",
    className: fontCinzel.className,
  },
  {
    id: "playfair",
    nome: "Playfair Display",
    estilo: "Sofisticada Editorial",
    className: fontPlayfair.className,
  },
  {
    id: "montserrat",
    nome: "Montserrat",
    estilo: "Moderna & Marcante",
    className: fontMontserrat.className,
  },
  {
    id: "caveat",
    nome: "Caveat",
    estilo: "Manuscrita Acolhedora",
    className: fontCaveat.className,
  },
];

export interface TamanhoOpcao {
  id: string;
  label: string;
  classSizes: string;
}

export const TAMANHOS_DISPONIVEIS: TamanhoOpcao[] = [
  {
    id: "pequeno",
    label: "Pequeno",
    classSizes: "text-3xl sm:text-4xl md:text-5xl",
  },
  {
    id: "medio",
    label: "Médio (Padrão)",
    classSizes: "text-4xl sm:text-6xl md:text-7xl",
  },
  {
    id: "grande",
    label: "Grande",
    classSizes: "text-5xl sm:text-7xl md:text-8xl",
  },
  {
    id: "extra-grande",
    label: "Extra Grande",
    classSizes: "text-6xl sm:text-8xl md:text-9xl",
  },
];

export function getFontClass(fonteId?: string): string {
  switch (fonteId) {
    case "cinzel":
      return fontCinzel.className;
    case "playfair":
      return fontPlayfair.className;
    case "montserrat":
      return fontMontserrat.className;
    case "caveat":
      return fontCaveat.className;
    case "great-vibes":
    default:
      return fontGreatVibes.className;
  }
}

export function getTamanhoClass(tamanhoId?: string): string {
  switch (tamanhoId) {
    case "pequeno":
      return "text-3xl sm:text-4xl md:text-5xl";
    case "grande":
      return "text-5xl sm:text-7xl md:text-8xl";
    case "extra-grande":
      return "text-6xl sm:text-8xl md:text-9xl";
    case "medio":
    default:
      return "text-4xl sm:text-6xl md:text-7xl";
  }
}
