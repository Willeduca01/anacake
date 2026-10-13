export interface PromocaoConfig {
  titulo: string;
  subtitulo: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
  updated_at?: string;
}

export const PROMOCAO_PADRAO: PromocaoConfig = {
  titulo: "Coleção Especial de Dia das Mães",
  subtitulo: "Novidade da Temporada",
  descricao:
    "Kits exclusivos com brigadeiros, trufas e mini bolos decorados. Encomende até 5 de maio e ganhe uma caixa personalizada de presente.",
  categoria: "promocoes",
  ativo: true,
};
