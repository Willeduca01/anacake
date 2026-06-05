import { getPool } from "@/lib/db";

export interface VendaInput {
  produto_id: number;
  quantidade: number;
  metodo_pagamento: string | null;
}

export interface VendaRegistro {
  id: number;
  produto_id: number | null;
  produto_nome: string | null;
  quantidade: number;
  valor_total: number;
  data_venda: string;
  metodo_pagamento: string | null;
}

export class EstoqueInsuficienteError extends Error {
  constructor(disponivel: number) {
    super(`Estoque insuficiente (disponível: ${disponivel}).`);
    this.name = "EstoqueInsuficienteError";
  }
}

export async function registrarVenda(input: VendaInput): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{
      preco: number;
      estoque_atual: number;
    }>(
      "SELECT preco::float8 AS preco, estoque_atual FROM produtos WHERE id = $1 FOR UPDATE",
      [input.produto_id]
    );

    if (rows.length === 0) {
      throw new Error("Produto não encontrado.");
    }

    const { preco, estoque_atual } = rows[0];
    if (estoque_atual < input.quantidade) {
      throw new EstoqueInsuficienteError(estoque_atual);
    }

    const valorTotal = Number((preco * input.quantidade).toFixed(2));

    await client.query(
      `INSERT INTO vendas (produto_id, quantidade, valor_total, metodo_pagamento)
       VALUES ($1, $2, $3, $4)`,
      [input.produto_id, input.quantidade, valorTotal, input.metodo_pagamento]
    );

    await client.query(
      "UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id = $2",
      [input.quantidade, input.produto_id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listarVendas(limit = 50): Promise<VendaRegistro[]> {
  const { rows } = await getPool().query<VendaRegistro>(
    `SELECT v.id, v.produto_id, p.nome AS produto_nome, v.quantidade,
            v.valor_total::float8 AS valor_total,
            to_char(v.data_venda, 'YYYY-MM-DD"T"HH24:MI:SS') AS data_venda,
            v.metodo_pagamento
     FROM vendas v
     LEFT JOIN produtos p ON p.id = v.produto_id
     ORDER BY v.data_venda DESC, v.id DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
