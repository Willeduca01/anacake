export const METODOS_PAGAMENTO = [
  "Dinheiro",
  "Pix",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Outro",
] as const;

export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

export function metodoValido(valor: string): boolean {
  return (METODOS_PAGAMENTO as readonly string[]).includes(valor);
}
