"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { criarSessao, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import {
  criarProduto,
  atualizarProduto,
  excluirProduto,
  definirImagemProduto,
  removerImagemProduto,
  type ProdutoInput,
} from "@/lib/produtos";
import { registrarVenda, EstoqueInsuficienteError } from "@/lib/vendas";
import {
  confirmarPedido,
  recusarPedido,
  ProdutoNaoEncontradoError,
  EstoqueInsuficientePedidoError,
} from "@/lib/pedidos";

function cookieSecure(): boolean {
  return process.env.COOKIE_SECURE === "true";
}

export async function loginAction(formData: FormData) {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  const adminUser = process.env.ADMIN_USER;
  const adminHashB64 = process.env.ADMIN_PASSWORD_HASH_B64;
  const adminHash = adminHashB64
    ? Buffer.from(adminHashB64, "base64").toString("utf8")
    : "";

  if (!adminUser || !adminHash) {
    redirect("/admin/login?error=config");
  }

  const usuarioOk = usuario === adminUser;
  const senhaOk = usuarioOk ? await bcrypt.compare(senha, adminHash) : false;

  if (!usuarioOk || !senhaOk) {
    redirect("/admin/login?error=1");
  }

  const token = await criarSessao(adminUser);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function parseProduto(formData: FormData): ProdutoInput {
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const preco = Number(formData.get("preco"));
  const estoque = Number(formData.get("estoque_atual"));

  if (!nome) throw new Error("Nome é obrigatório.");
  if (Number.isNaN(preco) || preco < 0) throw new Error("Preço inválido.");
  if (Number.isNaN(estoque) || estoque < 0) throw new Error("Estoque inválido.");

  return {
    nome,
    descricao: descricao || null,
    preco,
    estoque_atual: Math.trunc(estoque),
    categoria: categoria || null,
    ativo: formData.get("ativo") === "on",
  };
}

const MIMES_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGEM_BYTES = 4 * 1024 * 1024; // 4MB (a UI ja reduz antes de enviar)

async function processarImagem(formData: FormData, id: number): Promise<void> {
  if (formData.get("remover_imagem") === "on") {
    await removerImagemProduto(id);
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
  await definirImagemProduto(id, buffer, arquivo.type);
}

export async function criarProdutoAction(formData: FormData) {
  const produto = await criarProduto(parseProduto(formData));
  await processarImagem(formData, produto.id);
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
}

export async function atualizarProdutoAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isNaN(id)) throw new Error("ID inválido.");
  await atualizarProduto(id, parseProduto(formData));
  await processarImagem(formData, id);
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
}

export async function excluirProdutoAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isNaN(id)) throw new Error("ID inválido.");
  await excluirProduto(id);
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
}

export type VendaFormState = { ok: boolean; message: string };

export async function registrarVendaAction(
  _prev: VendaFormState,
  formData: FormData
): Promise<VendaFormState> {
  const produtoId = Number(formData.get("produto_id"));
  const quantidade = Number(formData.get("quantidade"));
  const metodo = String(formData.get("metodo_pagamento") ?? "").trim();

  if (Number.isNaN(produtoId)) {
    return { ok: false, message: "Selecione um produto." };
  }
  if (Number.isNaN(quantidade) || quantidade <= 0) {
    return { ok: false, message: "Quantidade inválida." };
  }

  try {
    await registrarVenda({
      produto_id: produtoId,
      quantidade: Math.trunc(quantidade),
      metodo_pagamento: metodo || null,
    });
  } catch (err) {
    if (err instanceof EstoqueInsuficienteError) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Erro ao registrar a venda." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/vendas");
  revalidatePath("/admin/produtos");
  return { ok: true, message: "Venda registrada com sucesso!" };
}

export type PedidoActionResult = { ok: boolean; message: string };

export async function confirmarPedidoAction(
  pedidoId: number
): Promise<PedidoActionResult> {
  try {
    await confirmarPedido(pedidoId);
  } catch (err) {
    if (
      err instanceof ProdutoNaoEncontradoError ||
      err instanceof EstoqueInsuficientePedidoError
    ) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Erro ao confirmar o pedido." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/vendas");
  revalidatePath("/admin/produtos");
  return { ok: true, message: "Pedido confirmado e venda registrada!" };
}

export async function recusarPedidoAction(
  pedidoId: number
): Promise<PedidoActionResult> {
  try {
    await recusarPedido(pedidoId);
  } catch {
    return { ok: false, message: "Erro ao recusar o pedido." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { ok: true, message: "Pedido recusado." };
}
