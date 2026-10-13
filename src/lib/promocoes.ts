import { getPool } from "@/lib/db";
import { type PromocaoConfig, PROMOCAO_PADRAO } from "@/types/promocao";

export { type PromocaoConfig, PROMOCAO_PADRAO };

export async function obterPromocaoConfig(): Promise<PromocaoConfig> {
  try {
    const { rows } = await getPool().query<PromocaoConfig>(
      `SELECT titulo, subtitulo, descricao, categoria, ativo, updated_at
       FROM configuracoes_promocao
       WHERE id = 1`
    );

    if (rows.length === 0) {
      return PROMOCAO_PADRAO;
    }

    return {
      titulo: rows[0].titulo || PROMOCAO_PADRAO.titulo,
      subtitulo: rows[0].subtitulo || PROMOCAO_PADRAO.subtitulo,
      descricao: rows[0].descricao || PROMOCAO_PADRAO.descricao,
      categoria: rows[0].categoria || PROMOCAO_PADRAO.categoria,
      ativo: rows[0].ativo ?? true,
      updated_at: rows[0].updated_at,
    };
  } catch (err) {
    console.error("Erro ao obter configuração da promoção:", err);
    return PROMOCAO_PADRAO;
  }
}

export async function salvarPromocaoConfig(
  dados: PromocaoConfig
): Promise<PromocaoConfig> {
  const pool = getPool();
  const titulo = dados.titulo.trim() || PROMOCAO_PADRAO.titulo;
  const subtitulo = dados.subtitulo.trim() || PROMOCAO_PADRAO.subtitulo;
  const descricao = dados.descricao.trim() || PROMOCAO_PADRAO.descricao;
  const categoria = dados.categoria.trim() || PROMOCAO_PADRAO.categoria;
  const ativo = Boolean(dados.ativo);

  const { rows } = await pool.query<PromocaoConfig>(
    `INSERT INTO configuracoes_promocao (id, titulo, subtitulo, descricao, categoria, ativo, updated_at)
     VALUES (1, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE
       SET titulo = EXCLUDED.titulo,
           subtitulo = EXCLUDED.subtitulo,
           descricao = EXCLUDED.descricao,
           categoria = EXCLUDED.categoria,
           ativo = EXCLUDED.ativo,
           updated_at = CURRENT_TIMESTAMP
     RETURNING titulo, subtitulo, descricao, categoria, ativo, updated_at`,
    [titulo, subtitulo, descricao, categoria, ativo]
  );

  return rows[0];
}
