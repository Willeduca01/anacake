"use server";

import { revalidatePath } from "next/cache";
import { exigirSessaoAdmin } from "@/lib/auth";
import { sanitizarTexto } from "@/lib/sanitize";
import {
  criarInsumo,
  atualizarInsumo,
  excluirInsumo,
  criarInsumoBase,
  atualizarInsumoBase,
  excluirInsumoBase,
  registrarCompraInsumo,
  type InsumoInput,
  type InsumoBaseInput,
  type InsumoCompraInput,
  type TipoCompraInsumo,
  type CategoriaGastoInsumo,
  type TipoMedida,
  type FormatoCompra,
} from "@/lib/insumos";

/* ==========================================================
   PARSERS
   ========================================================== */

function parseInsumo(formData: FormData): InsumoInput {
  const nome = sanitizarTexto(String(formData.get("nome") ?? ""));
  const tipoMedidaRaw = String(formData.get("tipo_medida") ?? "");
  const formatoCompraRaw = String(formData.get("formato_compra") ?? "UNIDADE");
  const insumoBaseIdRaw = String(formData.get("insumo_base_id") ?? "").trim();
  
  if (!nome) throw new Error("Nome é obrigatório.");
  if (!["UNIDADE", "GRAMA", "MILILITRO"].includes(tipoMedidaRaw)) {
    throw new Error("Tipo de medida inválido.");
  }
  const formatoCompra: FormatoCompra = formatoCompraRaw === "PACK" ? "PACK" : "UNIDADE";

  let unidades = 1;
  let pesoUnitario = 0;
  let precoTotal = 0;

  if (formatoCompra === "PACK") {
    unidades = Math.max(1, Number(formData.get("unidades_por_pack")) || 1);
    pesoUnitario = Number(formData.get("peso_unitario"));
    precoTotal = Number(formData.get("preco_embalagem"));
  } else {
    unidades = Math.max(1, Number(formData.get("quantidade_unidades")) || 1);
    pesoUnitario = Number(formData.get("peso_unitario") ?? formData.get("quantidade_embalagem"));

    const precoUnitarioRaw = formData.get("preco_unitario");
    if (precoUnitarioRaw !== null && precoUnitarioRaw !== undefined && precoUnitarioRaw !== "") {
      const precoUnitario = Number(precoUnitarioRaw);
      precoTotal = Math.round(unidades * precoUnitario * 100) / 100;
    } else {
      precoTotal = Number(formData.get("preco_embalagem"));
    }
  }

  if (Number.isNaN(pesoUnitario) || pesoUnitario <= 0) {
    throw new Error("Quantidade ou peso por unidade inválido.");
  }
  if (Number.isNaN(precoTotal) || precoTotal < 0) {
    throw new Error("Preço inválido.");
  }

  const estoqueAtualRaw = formData.get("estoque_atual");
  const estoqueMinimoRaw = formData.get("estoque_minimo");
  const estoqueAtual =
    estoqueAtualRaw !== null && estoqueAtualRaw !== ""
      ? Number(estoqueAtualRaw)
      : undefined;
  const estoqueMinimo =
    estoqueMinimoRaw !== null && estoqueMinimoRaw !== ""
      ? Number(estoqueMinimoRaw)
      : undefined;

  return {
    insumo_base_id: insumoBaseIdRaw || null,
    nome,
    tipo_medida: tipoMedidaRaw as TipoMedida,
    formato_compra: formatoCompra,
    unidades_por_pack: unidades,
    peso_unitario: pesoUnitario,
    quantidade_embalagem: unidades * pesoUnitario,
    preco_embalagem: precoTotal,
    estoque_atual: estoqueAtual,
    estoque_minimo: estoqueMinimo,
  };
}

function parseInsumoBase(formData: FormData): InsumoBaseInput {
  const nome = sanitizarTexto(String(formData.get("nome") ?? ""));
  const unidadePadrao = String(formData.get("unidade_padrao") ?? "").trim().toLowerCase();
  const quantidadePadrao = Number(formData.get("quantidade_padrao"));

  if (!nome) throw new Error("Nome do item base é obrigatório.");
  if (!["kg", "g", "l", "ml", "un"].includes(unidadePadrao)) {
    throw new Error("Unidade de medida inválida.");
  }
  if (Number.isNaN(quantidadePadrao) || quantidadePadrao <= 0) {
    throw new Error("Quantidade ou peso padrão inválido.");
  }

  return {
    nome,
    unidade_padrao: unidadePadrao,
    quantidade_padrao: quantidadePadrao,
  };
}

/* ==========================================================
   ACTIONS - PRODUTOS / ITENS BASE
   ========================================================== */

export async function criarInsumoBaseAction(formData: FormData) {
  await exigirSessaoAdmin();
  await criarInsumoBase(parseInsumoBase(formData));
  revalidatePath("/admin/insumos");
}

export async function atualizarInsumoBaseAction(formData: FormData) {
  await exigirSessaoAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID inválido.");
  await atualizarInsumoBase(id, parseInsumoBase(formData));
  revalidatePath("/admin/insumos");
}

export async function excluirInsumoBaseAction(formData: FormData) {
  await exigirSessaoAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID inválido.");
  await excluirInsumoBase(id);
  revalidatePath("/admin/insumos");
}

/* ==========================================================
   ACTIONS - INSUMOS (ESTOQUE)
   ========================================================== */

export async function criarInsumoAction(formData: FormData) {
  await exigirSessaoAdmin();
  await criarInsumo(parseInsumo(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/insumos");
}

export async function atualizarInsumoAction(formData: FormData) {
  await exigirSessaoAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID inválido.");
  await atualizarInsumo(id, parseInsumo(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/insumos");
}

export async function excluirInsumoAction(formData: FormData) {
  await exigirSessaoAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID inválido.");
  await excluirInsumo(id);
  revalidatePath("/admin");
  revalidatePath("/admin/insumos");
  revalidatePath("/admin/receitas");
}

/* ==========================================================
   ACTIONS - COMPRAS DE INSUMOS
   ========================================================== */

export async function registrarCompraInsumoAction(formData: FormData) {
  await exigirSessaoAdmin();
  const tipoCompraRaw = String(formData.get("tipo_compra") ?? "PADRAO");
  const tipoCompra: TipoCompraInsumo = tipoCompraRaw === "AVULSO" ? "AVULSO" : "PADRAO";
  const categoriaGastoRaw = String(formData.get("categoria_gasto") ?? "GASTO");
  const categoriaGasto: CategoriaGastoInsumo =
    categoriaGastoRaw === "INVESTIMENTO" ? "INVESTIMENTO" : "GASTO";

  const insumoId = String(formData.get("insumo_id") ?? "").trim();
  const descricaoAvulsa = sanitizarTexto(String(formData.get("descricao_avulsa") ?? "")).trim();
  const quantidadeRaw = formData.get("quantidade");
  const quantidade = quantidadeRaw !== null && quantidadeRaw !== "" ? Number(quantidadeRaw) : 1;
  const precoTotal = Number(formData.get("preco_total"));
  const estabelecimento = sanitizarTexto(String(formData.get("estabelecimento") ?? "")).trim();
  const dataCompra = String(formData.get("data_compra") ?? "").trim();
  const observacoes = sanitizarTexto(String(formData.get("observacoes") ?? "")).trim();

  if (tipoCompra === "PADRAO") {
    if (!insumoId) throw new Error("Insumo é obrigatório.");
  } else {
    if (!descricaoAvulsa && !insumoId) {
      throw new Error("Informe a descrição do insumo avulso.");
    }
  }

  if (Number.isNaN(quantidade) || quantidade <= 0) {
    throw new Error("Quantidade comprada deve ser maior que zero.");
  }
  if (Number.isNaN(precoTotal) || precoTotal <= 0) {
    throw new Error("Preço total deve ser maior que zero.");
  }

  const input: InsumoCompraInput = {
    insumo_id: insumoId || null,
    tipo_compra: tipoCompra,
    descricao_avulsa: descricaoAvulsa || null,
    categoria_gasto: categoriaGasto,
    quantidade,
    preco_total: precoTotal,
    estabelecimento: estabelecimento || null,
    data_compra: dataCompra || null,
    observacoes: observacoes || null,
  };

  await registrarCompraInsumo(input);

  revalidatePath("/admin");
  revalidatePath("/admin/insumos");
  revalidatePath("/admin/receitas");
}
