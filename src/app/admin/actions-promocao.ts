"use server";

import { revalidatePath } from "next/cache";
import { exigirSessaoAdmin } from "@/lib/auth";
import { sanitizarTexto } from "@/lib/sanitize";
import { salvarPromocaoConfig, type PromocaoConfig } from "@/lib/promocoes";

export async function salvarPromocaoAction(
  formData: FormData
): Promise<{ ok: boolean; mensagem?: string }> {
  await exigirSessaoAdmin();

  const titulo = sanitizarTexto(String(formData.get("titulo") ?? ""));
  const subtitulo = sanitizarTexto(String(formData.get("subtitulo") ?? ""));
  const descricao = sanitizarTexto(String(formData.get("descricao") ?? ""));
  const categoria = sanitizarTexto(String(formData.get("categoria") ?? "promocoes")) || "promocoes";
  const ativo = formData.get("ativo") === "on" || formData.get("ativo") === "true";

  if (!titulo) {
    throw new Error("O título da promoção é obrigatório.");
  }

  const dados: PromocaoConfig = {
    titulo,
    subtitulo: subtitulo || "Novidade da Temporada",
    descricao,
    categoria,
    ativo,
  };

  await salvarPromocaoConfig(dados);

  revalidatePath("/");
  revalidatePath("/cardapio");
  revalidatePath("/admin/produtos");

  return { ok: true, mensagem: "Configurações da promoção salvas com sucesso!" };
}
