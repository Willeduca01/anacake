"use server";

import { revalidatePath } from "next/cache";
import { exigirSessaoAdmin } from "@/lib/auth";
import { sanitizarTexto } from "@/lib/sanitize";
import {
  criarReceita,
  atualizarReceita,
  excluirReceita,
  definirImagemReceita,
  removerImagemReceita,
  publicarReceitaParaProduto,
  despublicarReceita,
  type ReceitaInput,
} from "@/lib/receitas";

const MIMES_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGEM_BYTES = 4 * 1024 * 1024; // 4MB

async function processarImagemReceita(formData: FormData, receitaId: string): Promise<void> {
  if (formData.get("remover_imagem") === "on") {
    await removerImagemReceita(receitaId);
    return;
  }

  const arquivo = formData.get("imagem");
  if (!(arquivo instanceof File) || arquivo.size === 0) return;

  if (!MIMES_IMAGEM.includes(arquivo.type)) {
    throw new Error("Formato de imagem inválido (use JPG, PNG ou WebP).");
  }
  if (arquivo.size > MAX_IMAGEM_BYTES) {
    throw new Error("Imagem muito grande (máx. 4MB).");
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  await definirImagemReceita(receitaId, buffer, arquivo.type);
}

function parseReceita(formData: FormData): { id?: string; dados: ReceitaInput } {
  const id = String(formData.get("id") ?? "").trim();
  const nome = sanitizarTexto(String(formData.get("nome") ?? ""));
  const descricao = sanitizarTexto(String(formData.get("descricao") ?? ""));
  const categoria = sanitizarTexto(String(formData.get("categoria") ?? "doces"));
  const rendimento = Math.max(1, parseInt(String(formData.get("rendimento") ?? "1"), 10) || 1);
  const custoEmbalagem = Math.max(0, parseFloat(String(formData.get("custo_embalagem") ?? "0")) || 0);
  const taxaCustosInvisiveis = Math.max(0, parseFloat(String(formData.get("taxa_custos_invisiveis") ?? "20")) || 0);
  const margemLucroDesejada = Math.max(0, parseFloat(String(formData.get("margem_lucro_desejada") ?? "150")) || 0);

  if (!nome) {
    throw new Error("O nome da receita é obrigatório.");
  }

  const ingredientesJson = String(formData.get("ingredientes_json") ?? "[]");
  let ingredientes: { insumo_id: string; quantidade_utilizada: number }[] = [];

  try {
    const parsed = JSON.parse(ingredientesJson);
    if (Array.isArray(parsed)) {
      ingredientes = parsed
        .filter((item) => item.insumo_id && Number(item.quantidade_utilizada) > 0)
        .map((item) => ({
          insumo_id: String(item.insumo_id),
          quantidade_utilizada: Number(item.quantidade_utilizada),
        }));
    }
  } catch {
    throw new Error("Formato de ingredientes inválido.");
  }

  if (ingredientes.length === 0) {
    throw new Error("Adicione pelo menos um ingrediente com quantidade válida à receita.");
  }

  return {
    id: id || undefined,
    dados: {
      nome,
      descricao: descricao || null,
      categoria: categoria || "doces",
      rendimento,
      custo_embalagem: custoEmbalagem,
      taxa_custos_invisiveis: taxaCustosInvisiveis,
      margem_lucro_desejada: margemLucroDesejada,
      ingredientes,
    },
  };
}

export async function salvarReceitaAction(formData: FormData) {
  await exigirSessaoAdmin();
  const { id, dados } = parseReceita(formData);

  let targetId = id;
  if (targetId) {
    await atualizarReceita(targetId, dados);
  } else {
    targetId = await criarReceita(dados);
  }

  await processarImagemReceita(formData, targetId);

  revalidatePath("/admin");
  revalidatePath("/admin/receitas");
}

export async function excluirReceitaAction(formData: FormData) {
  await exigirSessaoAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("ID da receita inválido.");

  await excluirReceita(id);
  revalidatePath("/admin");
  revalidatePath("/admin/receitas");
}

/* ==========================================================
   AÇÕES DE PUBLICAÇÃO NO SITE / CARDÁPIO
   ========================================================== */

export async function publicarReceitaAction(formData: FormData) {
  await exigirSessaoAdmin();

  const receitaId = String(formData.get("receita_id") ?? "").trim();
  const nome = sanitizarTexto(String(formData.get("nome") ?? ""));
  const descricao = sanitizarTexto(String(formData.get("descricao") ?? ""));
  const categoria = sanitizarTexto(String(formData.get("categoria") ?? "doces"));
  const preco = parseFloat(String(formData.get("preco") ?? "0"));
  const estoque = parseInt(String(formData.get("estoque_atual") ?? "0"), 10);

  if (!receitaId) throw new Error("ID da receita é obrigatório.");
  if (!nome) throw new Error("Nome do produto é obrigatório.");
  if (Number.isNaN(preco) || preco <= 0) throw new Error("Preço de venda inválido.");
  if (Number.isNaN(estoque) || estoque < 0) throw new Error("Quantidade em estoque inválida.");

  let imagemDados: Buffer | undefined;
  let imagemMime: string | undefined;

  const arquivo = formData.get("imagem");
  if (arquivo instanceof File && arquivo.size > 0) {
    if (!MIMES_IMAGEM.includes(arquivo.type)) {
      throw new Error("Formato de imagem inválido (use JPG, PNG ou WebP).");
    }
    if (arquivo.size > MAX_IMAGEM_BYTES) {
      throw new Error("Imagem muito grande (máx. 4MB).");
    }
    imagemDados = Buffer.from(await arquivo.arrayBuffer());
    imagemMime = arquivo.type;
  }

  const somarAoEstoque =
    formData.get("somar_ao_estoque") === "true" ||
    formData.get("somar_ao_estoque") === "on";

  const subtrairInsumos =
    formData.get("subtrair_insumos_estoque") === "true" ||
    formData.get("subtrair_insumos_estoque") === "on";

  await publicarReceitaParaProduto({
    receita_id: receitaId,
    nome,
    descricao: descricao || null,
    categoria: categoria || "doces",
    preco,
    estoque_atual: estoque,
    somar_ao_estoque: somarAoEstoque,
    subtrair_insumos_estoque: subtrairInsumos,
    imagem_dados: imagemDados,
    imagem_mime: imagemMime,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/receitas");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/insumos");
  revalidatePath("/");
  revalidatePath("/cardapio");
}

export async function despublicarReceitaAction(formData: FormData) {
  await exigirSessaoAdmin();

  const receitaId = String(formData.get("receita_id") ?? "").trim();
  if (!receitaId) throw new Error("ID da receita é obrigatório.");

  await despublicarReceita(receitaId);

  revalidatePath("/admin");
  revalidatePath("/admin/receitas");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath("/cardapio");
}
