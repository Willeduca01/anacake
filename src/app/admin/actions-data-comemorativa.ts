"use server";

import { revalidatePath } from "next/cache";
import { exigirSessaoAdmin } from "@/lib/auth";
import { sanitizarTexto } from "@/lib/sanitize";
import {
  salvarDataComemorativaConfig,
  type DataComemorativaConfig,
} from "@/lib/data-comemorativa";

export interface SalvarDataComemorativaInput {
  ativo: boolean;
  nome_aba: string;
  tema_slug: string;
  badge_texto?: string;
  subtitulo?: string;
  fonte_titulo?: string;
  tamanho_titulo?: string;
  produto_ids: number[];
}

export async function salvarDataComemorativaAction(
  dados: SalvarDataComemorativaInput
): Promise<{ ok: boolean; mensagem?: string; config?: DataComemorativaConfig }> {
  await exigirSessaoAdmin();

  const nome_aba = sanitizarTexto(dados.nome_aba || "").trim();
  const tema_slug = sanitizarTexto(dados.tema_slug || "").trim();
  const badge_texto = sanitizarTexto(dados.badge_texto || "").trim();
  const subtitulo = sanitizarTexto(dados.subtitulo || "").trim();
  const fonte_titulo = sanitizarTexto(dados.fonte_titulo || "great-vibes").trim();
  const tamanho_titulo = sanitizarTexto(dados.tamanho_titulo || "medio").trim();
  const ativo = Boolean(dados.ativo);
  const produto_ids = Array.isArray(dados.produto_ids)
    ? dados.produto_ids
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
    : [];

  if (!nome_aba) {
    throw new Error("O nome da aba é obrigatório.");
  }

  const atualizado = await salvarDataComemorativaConfig({
    ativo,
    nome_aba,
    tema_slug: tema_slug || "padrao",
    badge_texto: badge_texto || undefined,
    subtitulo: subtitulo || undefined,
    fonte_titulo: fonte_titulo || undefined,
    tamanho_titulo: tamanho_titulo || undefined,
    produto_ids,
  });

  revalidatePath("/");
  revalidatePath("/cardapio");
  revalidatePath("/admin/comemorativa");

  return {
    ok: true,
    mensagem: "Configurações de data comemorativa salvas com sucesso!",
    config: atualizado,
  };
}
