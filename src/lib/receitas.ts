import { getPool } from "@/lib/db";

export interface ReceitaInsumoDetalhe {
  id: string;
  receita_id: string;
  insumo_id: string;
  insumo_nome: string;
  insumo_tipo_medida: string; // 'GRAMA', 'MILILITRO', 'UNIDADE'
  insumo_custo_base: number;
  quantidade_utilizada: number;
  custo_total_ingrediente: number;
}

export interface Receita {
  id: string;
  produto_id: number | null;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  rendimento: number;
  custo_embalagem: number;
  taxa_custos_invisiveis: number;
  margem_lucro_desejada: number;
  publicado: boolean;
  url_imagem: string | null;
  tem_imagem: boolean;
  created_at: string;
  updated_at: string;

  // Informações sincronizadas do produto na loja
  produto_estoque: number | null;
  produto_preco: number | null;
  produto_ativo: boolean | null;

  // Itens da receita
  ingredientes: ReceitaInsumoDetalhe[];

  // Métricas financeiras calculadas
  custo_ingredientes: number;
  valor_custos_invisiveis: number;
  custo_producao_total: number;
  custo_por_porcao: number;
  preco_sugerido_total: number;
  preco_sugerido_porcao: number;
  lucro_total: number;
  lucro_por_porcao: number;
}

export interface ReceitaInput {
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  rendimento: number;
  custo_embalagem: number;
  taxa_custos_invisiveis: number;
  margem_lucro_desejada: number;
  ingredientes: {
    insumo_id: string;
    quantidade_utilizada: number;
  }[];
}

export interface PublicarReceitaInput {
  receita_id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  preco: number;
  estoque_atual: number;
  somar_ao_estoque?: boolean;
  subtrair_insumos_estoque?: boolean;
  imagem_dados?: Buffer;
  imagem_mime?: string;
}

export function calcularMetricasReceita(
  r: {
    rendimento: number;
    custo_embalagem: number;
    taxa_custos_invisiveis: number;
    margem_lucro_desejada: number;
  },
  ingredientes: ReceitaInsumoDetalhe[]
) {
  const custo_ingredientes = ingredientes.reduce(
    (acc, item) => acc + item.custo_total_ingrediente,
    0
  );

  const valor_custos_invisiveis =
    custo_ingredientes * (r.taxa_custos_invisiveis / 100);

  const custo_producao_total =
    custo_ingredientes + valor_custos_invisiveis + r.custo_embalagem;

  const rendimento = Math.max(1, r.rendimento);
  const custo_por_porcao = custo_producao_total / rendimento;

  const preco_sugerido_total =
    custo_producao_total * (1 + r.margem_lucro_desejada / 100);

  const preco_sugerido_porcao = preco_sugerido_total / rendimento;

  const lucro_total = preco_sugerido_total - custo_producao_total;
  const lucro_por_porcao = lucro_total / rendimento;

  return {
    custo_ingredientes,
    valor_custos_invisiveis,
    custo_producao_total,
    custo_por_porcao,
    preco_sugerido_total,
    preco_sugerido_porcao,
    lucro_total,
    lucro_por_porcao,
  };
}

export async function listarReceitas(): Promise<Receita[]> {
  const pool = getPool();

  const [receitasRes, ingredientesRes] = await Promise.all([
    pool.query<{
      id: string;
      produto_id: number | null;
      nome: string;
      descricao: string | null;
      categoria: string | null;
      rendimento: number;
      custo_embalagem: number;
      taxa_custos_invisiveis: number;
      margem_lucro_desejada: number;
      publicado: boolean;
      url_imagem: string | null;
      tem_imagem: boolean;
      created_at: string;
      updated_at: string;
      produto_estoque: number | null;
      produto_preco: number | null;
      produto_ativo: boolean | null;
    }>(
      `SELECT 
         r.id,
         r.produto_id,
         r.nome,
         r.descricao,
         r.categoria,
         r.rendimento,
         r.custo_embalagem::float8 AS custo_embalagem,
         r.taxa_custos_invisiveis::float8 AS taxa_custos_invisiveis,
         r.margem_lucro_desejada::float8 AS margem_lucro_desejada,
         COALESCE(r.publicado, false) AS publicado,
         r.url_imagem,
         (r.imagem_dados IS NOT NULL) AS tem_imagem,
         to_char(r.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
         to_char(r.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS updated_at,
         p.estoque_atual AS produto_estoque,
         p.preco::float8 AS produto_preco,
         p.ativo AS produto_ativo
       FROM receitas r
       LEFT JOIN produtos p ON p.id = r.produto_id
       ORDER BY r.nome ASC`
    ),
    pool.query<{
      id: string;
      receita_id: string;
      insumo_id: string;
      quantidade_utilizada: number;
      insumo_nome: string;
      insumo_tipo_medida: string;
      insumo_custo_base: number;
    }>(
      `SELECT 
         ri.id,
         ri.receita_id,
         ri.insumo_id,
         ri.quantidade_utilizada::float8 AS quantidade_utilizada,
         i.nome AS insumo_nome,
         i.tipo_medida AS insumo_tipo_medida,
         i.custo_por_unidade_base::float8 AS insumo_custo_base
       FROM receita_insumos ri
       JOIN insumos i ON i.id = ri.insumo_id
       ORDER BY i.nome ASC`
    ),
  ]);

  const ingredientesPorReceita = new Map<string, ReceitaInsumoDetalhe[]>();
  for (const row of ingredientesRes.rows) {
    const custo_total = row.quantidade_utilizada * row.insumo_custo_base;
    const item: ReceitaInsumoDetalhe = {
      id: row.id,
      receita_id: row.receita_id,
      insumo_id: row.insumo_id,
      insumo_nome: row.insumo_nome,
      insumo_tipo_medida: row.insumo_tipo_medida,
      insumo_custo_base: row.insumo_custo_base,
      quantidade_utilizada: row.quantidade_utilizada,
      custo_total_ingrediente: custo_total,
    };

    if (!ingredientesPorReceita.has(row.receita_id)) {
      ingredientesPorReceita.set(row.receita_id, []);
    }
    ingredientesPorReceita.get(row.receita_id)!.push(item);
  }

  return receitasRes.rows.map((r) => {
    const ing = ingredientesPorReceita.get(r.id) ?? [];
    const metricas = calcularMetricasReceita(r, ing);

    return {
      ...r,
      ingredientes: ing,
      ...metricas,
    };
  });
}

export async function obterReceita(id: string): Promise<Receita | null> {
  const pool = getPool();

  const [receitaRes, ingredientesRes] = await Promise.all([
    pool.query<{
      id: string;
      produto_id: number | null;
      nome: string;
      descricao: string | null;
      categoria: string | null;
      rendimento: number;
      custo_embalagem: number;
      taxa_custos_invisiveis: number;
      margem_lucro_desejada: number;
      publicado: boolean;
      url_imagem: string | null;
      tem_imagem: boolean;
      created_at: string;
      updated_at: string;
      produto_estoque: number | null;
      produto_preco: number | null;
      produto_ativo: boolean | null;
    }>(
      `SELECT 
         r.id,
         r.produto_id,
         r.nome,
         r.descricao,
         r.categoria,
         r.rendimento,
         r.custo_embalagem::float8 AS custo_embalagem,
         r.taxa_custos_invisiveis::float8 AS taxa_custos_invisiveis,
         r.margem_lucro_desejada::float8 AS margem_lucro_desejada,
         COALESCE(r.publicado, false) AS publicado,
         r.url_imagem,
         (r.imagem_dados IS NOT NULL) AS tem_imagem,
         to_char(r.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
         to_char(r.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS updated_at,
         p.estoque_atual AS produto_estoque,
         p.preco::float8 AS produto_preco,
         p.ativo AS produto_ativo
       FROM receitas r
       LEFT JOIN produtos p ON p.id = r.produto_id
       WHERE r.id = $1`,
      [id]
    ),
    pool.query<{
      id: string;
      receita_id: string;
      insumo_id: string;
      quantidade_utilizada: number;
      insumo_nome: string;
      insumo_tipo_medida: string;
      insumo_custo_base: number;
    }>(
      `SELECT 
         ri.id,
         ri.receita_id,
         ri.insumo_id,
         ri.quantidade_utilizada::float8 AS quantidade_utilizada,
         i.nome AS insumo_nome,
         i.tipo_medida AS insumo_tipo_medida,
         i.custo_por_unidade_base::float8 AS insumo_custo_base
       FROM receita_insumos ri
       JOIN insumos i ON i.id = ri.insumo_id
       WHERE ri.receita_id = $1
       ORDER BY i.nome ASC`,
      [id]
    ),
  ]);

  if (receitaRes.rows.length === 0) return null;
  const r = receitaRes.rows[0];

  const ingredientes: ReceitaInsumoDetalhe[] = ingredientesRes.rows.map((row) => ({
    id: row.id,
    receita_id: row.receita_id,
    insumo_id: row.insumo_id,
    insumo_nome: row.insumo_nome,
    insumo_tipo_medida: row.insumo_tipo_medida,
    insumo_custo_base: row.insumo_custo_base,
    quantidade_utilizada: row.quantidade_utilizada,
    custo_total_ingrediente: row.quantidade_utilizada * row.insumo_custo_base,
  }));

  const metricas = calcularMetricasReceita(r, ingredientes);

  return {
    ...r,
    ingredientes,
    ...metricas,
  };
}

export async function criarReceita(dados: ReceitaInput): Promise<string> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const receitaRes = await client.query<{ id: string }>(
      `INSERT INTO receitas (
         nome,
         descricao,
         categoria,
         rendimento,
         custo_embalagem,
         taxa_custos_invisiveis,
         margem_lucro_desejada
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        dados.nome,
        dados.descricao || null,
        dados.categoria || "doces",
        Math.max(1, dados.rendimento),
        dados.custo_embalagem || 0,
        dados.taxa_custos_invisiveis ?? 20,
        dados.margem_lucro_desejada ?? 150,
      ]
    );

    const receitaId = receitaRes.rows[0].id;

    for (const item of dados.ingredientes) {
      if (item.insumo_id && item.quantidade_utilizada > 0) {
        await client.query(
          `INSERT INTO receita_insumos (receita_id, insumo_id, quantidade_utilizada)
           VALUES ($1, $2, $3)`,
          [receitaId, item.insumo_id, item.quantidade_utilizada]
        );
      }
    }

    await client.query("COMMIT");
    return receitaId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function atualizarReceita(
  id: string,
  dados: ReceitaInput
): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE receitas
       SET 
         nome = $1,
         descricao = $2,
         categoria = $3,
         rendimento = $4,
         custo_embalagem = $5,
         taxa_custos_invisiveis = $6,
         margem_lucro_desejada = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [
        dados.nome,
        dados.descricao || null,
        dados.categoria || "doces",
        Math.max(1, dados.rendimento),
        dados.custo_embalagem || 0,
        dados.taxa_custos_invisiveis ?? 20,
        dados.margem_lucro_desejada ?? 150,
        id,
      ]
    );

    await client.query("DELETE FROM receita_insumos WHERE receita_id = $1", [id]);

    for (const item of dados.ingredientes) {
      if (item.insumo_id && item.quantidade_utilizada > 0) {
        await client.query(
          `INSERT INTO receita_insumos (receita_id, insumo_id, quantidade_utilizada)
           VALUES ($1, $2, $3)`,
          [id, item.insumo_id, item.quantidade_utilizada]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function excluirReceita(id: string): Promise<void> {
  await getPool().query("DELETE FROM receitas WHERE id = $1", [id]);
}

/* ==========================================================
   IMAGENS DE RECEITA
   ========================================================== */

export async function getReceitaImagem(
  id: string
): Promise<{ dados: Buffer; mime: string } | null> {
  const { rows } = await getPool().query<{
    imagem_dados: Buffer | null;
    imagem_mime: string | null;
  }>(`SELECT imagem_dados, imagem_mime FROM receitas WHERE id = $1`, [id]);
  const row = rows[0];
  if (!row || !row.imagem_dados) return null;
  return { dados: row.imagem_dados, mime: row.imagem_mime ?? "image/jpeg" };
}

export async function definirImagemReceita(
  id: string,
  dados: Buffer,
  mime: string
): Promise<void> {
  const url = `/api/receitas/${id}/imagem?v=${Date.now()}`;
  await getPool().query(
    `UPDATE receitas SET imagem_dados = $1, imagem_mime = $2, url_imagem = $3 WHERE id = $4`,
    [dados, mime, url, id]
  );
}

export async function removerImagemReceita(id: string): Promise<void> {
  await getPool().query(
    `UPDATE receitas SET imagem_dados = NULL, imagem_mime = NULL, url_imagem = NULL WHERE id = $1`,
    [id]
  );
}

/* ==========================================================
   PUBLICAÇÃO DE RECEITA PARA PRODUTO NA LOJA
   ========================================================== */

export async function publicarReceitaParaProduto(
  input: PublicarReceitaInput
): Promise<number> {
  const pool = getPool();

  const { rows: recRows } = await pool.query<{
    produto_id: number | null;
    imagem_dados: Buffer | null;
    imagem_mime: string | null;
  }>(
    `SELECT produto_id, imagem_dados, imagem_mime FROM receitas WHERE id = $1`,
    [input.receita_id]
  );

  if (recRows.length === 0) throw new Error("Receita não encontrada.");
  const receita = recRows[0];

  let produtoId = receita.produto_id;
  const imgDados = input.imagem_dados ?? receita.imagem_dados;
  const imgMime = input.imagem_mime ?? receita.imagem_mime;

  if (produtoId) {
    let estoqueCalculado = input.estoque_atual;
    if (input.somar_ao_estoque) {
      const { rows: prodRows } = await pool.query<{ estoque_atual: number }>(
        `SELECT estoque_atual FROM produtos WHERE id = $1`,
        [produtoId]
      );
      const estoqueExistente = prodRows[0]?.estoque_atual ?? 0;
      estoqueCalculado = Math.max(0, estoqueExistente) + input.estoque_atual;
    }

    // Atualizar produto existente
    await pool.query(
      `UPDATE produtos
       SET nome = $1, descricao = $2, preco = $3, estoque_atual = $4, categoria = $5, ativo = true
       WHERE id = $6`,
      [
        input.nome,
        input.descricao,
        input.preco,
        estoqueCalculado,
        input.categoria || "doces",
        produtoId,
      ]
    );
  } else {
    // Criar novo produto no cardápio
    const { rows: prodRows } = await pool.query<{ id: number }>(
      `INSERT INTO produtos (nome, descricao, preco, estoque_atual, categoria, ativo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id`,
      [
        input.nome,
        input.descricao,
        input.preco,
        input.estoque_atual,
        input.categoria || "doces",
      ]
    );
    produtoId = prodRows[0].id;
  }

  // Se houver imagem (nova ou herdada da receita), aplicar no produto
  if (imgDados && imgMime) {
    const urlProd = `/api/produtos/${produtoId}/imagem?v=${Date.now()}`;
    await pool.query(
      `UPDATE produtos SET imagem_dados = $1, imagem_mime = $2, url_imagem = $3 WHERE id = $4`,
      [imgDados, imgMime, urlProd, produtoId]
    );

    // E se a receita não tinha imagem e o usuário subiu uma nova agora, salva na receita também
    if (!receita.imagem_dados && input.imagem_dados) {
      const urlRec = `/api/receitas/${input.receita_id}/imagem?v=${Date.now()}`;
      await pool.query(
        `UPDATE receitas SET imagem_dados = $1, imagem_mime = $2, url_imagem = $3 WHERE id = $4`,
        [imgDados, imgMime, urlRec, input.receita_id]
      );
    }
  }

  // Vincular na tabela receitas
  await pool.query(
    `UPDATE receitas
     SET produto_id = $1, publicado = true, descricao = $2, categoria = $3
     WHERE id = $4`,
    [produtoId, input.descricao, input.categoria || "doces", input.receita_id]
  );

  // Subtrair quantidades de insumos do estoque se a opção estiver ativada
  if (input.subtrair_insumos_estoque && input.estoque_atual > 0) {
    const { rows: recRows } = await pool.query<{ rendimento: number }>(
      `SELECT rendimento FROM receitas WHERE id = $1`,
      [input.receita_id]
    );
    const rendimento = Math.max(1, recRows[0]?.rendimento ?? 1);
    const fator = input.estoque_atual / rendimento;

    const { rows: ingRows } = await pool.query<{
      insumo_id: string;
      quantidade_utilizada: number;
    }>(
      `SELECT insumo_id, quantidade_utilizada::float8 AS quantidade_utilizada
       FROM receita_insumos
       WHERE receita_id = $1`,
      [input.receita_id]
    );

    for (const ing of ingRows) {
      const consumo = Math.round(ing.quantidade_utilizada * fator * 100) / 100;
      if (consumo > 0) {
        await pool.query(
          `UPDATE insumos
           SET quantidade_embalagem = GREATEST(0, quantidade_embalagem - $1),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [consumo, ing.insumo_id]
        );
      }
    }
  }

  return produtoId;
}

export async function despublicarReceita(receitaId: string): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query<{ produto_id: number | null }>(
    `SELECT produto_id FROM receitas WHERE id = $1`,
    [receitaId]
  );

  if (rows.length > 0 && rows[0].produto_id) {
    // Desativa o produto para não aparecer mais no cardápio de vendas dos clientes
    await pool.query(`UPDATE produtos SET ativo = false WHERE id = $1`, [
      rows[0].produto_id,
    ]);
  }

  await pool.query(`UPDATE receitas SET publicado = false WHERE id = $1`, [
    receitaId,
  ]);
}
