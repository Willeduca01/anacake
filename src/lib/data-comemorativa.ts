import { getPool } from "@/lib/db";
import {
  type DataComemorativaConfig,
  DATA_COMEMORATIVA_PADRAO,
} from "@/types/data-comemorativa";

export * from "@/types/data-comemorativa";

export async function obterDataComemorativaConfig(): Promise<DataComemorativaConfig> {
  try {
    const pool = getPool();

    const { rows: configRows } = await pool.query<{
      id: number;
      ativo: boolean;
      nome_aba: string;
      tema_slug: string;
      badge_texto: string | null;
      subtitulo: string | null;
      fonte_titulo: string | null;
      tamanho_titulo: string | null;
      updated_at: string;
    }>(
      `SELECT id, ativo, nome_aba, tema_slug, badge_texto, subtitulo, fonte_titulo, tamanho_titulo, updated_at
       FROM data_comemorativa_config
       WHERE id = 1`
    );

    if (configRows.length === 0) {
      return DATA_COMEMORATIVA_PADRAO;
    }

    const { rows: produtoRows } = await pool.query<{ produto_id: number }>(
      `SELECT produto_id
       FROM data_comemorativa_produtos
       ORDER BY produto_id ASC`
    );

    return {
      id: configRows[0].id,
      ativo: Boolean(configRows[0].ativo),
      nome_aba: configRows[0].nome_aba || DATA_COMEMORATIVA_PADRAO.nome_aba,
      tema_slug: configRows[0].tema_slug || DATA_COMEMORATIVA_PADRAO.tema_slug,
      badge_texto:
        configRows[0].badge_texto || DATA_COMEMORATIVA_PADRAO.badge_texto,
      subtitulo: configRows[0].subtitulo || DATA_COMEMORATIVA_PADRAO.subtitulo,
      fonte_titulo:
        configRows[0].fonte_titulo || DATA_COMEMORATIVA_PADRAO.fonte_titulo,
      tamanho_titulo:
        configRows[0].tamanho_titulo || DATA_COMEMORATIVA_PADRAO.tamanho_titulo,
      updated_at: configRows[0].updated_at,
      produto_ids: produtoRows.map((p) => p.produto_id),
    };
  } catch (err) {
    console.error("Erro ao obter configuração de data comemorativa:", err);
    return DATA_COMEMORATIVA_PADRAO;
  }
}

export async function salvarDataComemorativaConfig(dados: {
  ativo: boolean;
  nome_aba: string;
  tema_slug: string;
  badge_texto?: string;
  subtitulo?: string;
  fonte_titulo?: string;
  tamanho_titulo?: string;
  produto_ids: number[];
}): Promise<DataComemorativaConfig> {
  const pool = getPool();
  const client = await pool.connect();

  const nome_aba = dados.nome_aba.trim() || DATA_COMEMORATIVA_PADRAO.nome_aba;
  const tema_slug = dados.tema_slug.trim() || DATA_COMEMORATIVA_PADRAO.tema_slug;
  const badge_texto =
    dados.badge_texto !== undefined
      ? dados.badge_texto.trim()
      : DATA_COMEMORATIVA_PADRAO.badge_texto;
  const subtitulo =
    dados.subtitulo !== undefined
      ? dados.subtitulo.trim()
      : DATA_COMEMORATIVA_PADRAO.subtitulo;
  const fonte_titulo =
    dados.fonte_titulo?.trim() || DATA_COMEMORATIVA_PADRAO.fonte_titulo;
  const tamanho_titulo =
    dados.tamanho_titulo?.trim() || DATA_COMEMORATIVA_PADRAO.tamanho_titulo;
  const ativo = Boolean(dados.ativo);
  const produto_ids = Array.from(
    new Set(dados.produto_ids.filter((id) => Number.isInteger(id) && id > 0))
  );

  try {
    await client.query("BEGIN");

    const { rows: configRows } = await client.query<{
      id: number;
      ativo: boolean;
      nome_aba: string;
      tema_slug: string;
      badge_texto: string | null;
      subtitulo: string | null;
      fonte_titulo: string | null;
      tamanho_titulo: string | null;
      updated_at: string;
    }>(
      `INSERT INTO data_comemorativa_config (
        id, ativo, nome_aba, tema_slug, badge_texto, subtitulo, fonte_titulo, tamanho_titulo, updated_at
       )
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
         SET ativo = EXCLUDED.ativo,
             nome_aba = EXCLUDED.nome_aba,
             tema_slug = EXCLUDED.tema_slug,
             badge_texto = EXCLUDED.badge_texto,
             subtitulo = EXCLUDED.subtitulo,
             fonte_titulo = EXCLUDED.fonte_titulo,
             tamanho_titulo = EXCLUDED.tamanho_titulo,
             updated_at = CURRENT_TIMESTAMP
       RETURNING id, ativo, nome_aba, tema_slug, badge_texto, subtitulo, fonte_titulo, tamanho_titulo, updated_at`,
      [
        ativo,
        nome_aba,
        tema_slug,
        badge_texto,
        subtitulo,
        fonte_titulo,
        tamanho_titulo,
      ]
    );

    await client.query("DELETE FROM data_comemorativa_produtos");

    if (produto_ids.length > 0) {
      const valuesSql = produto_ids.map((_, i) => `($${i + 1})`).join(", ");
      await client.query(
        `INSERT INTO data_comemorativa_produtos (produto_id)
         VALUES ${valuesSql}
         ON CONFLICT (produto_id) DO NOTHING`,
        produto_ids
      );
    }

    await client.query("COMMIT");

    return {
      id: configRows[0].id,
      ativo: configRows[0].ativo,
      nome_aba: configRows[0].nome_aba,
      tema_slug: configRows[0].tema_slug,
      badge_texto: configRows[0].badge_texto ?? undefined,
      subtitulo: configRows[0].subtitulo ?? undefined,
      fonte_titulo: configRows[0].fonte_titulo ?? undefined,
      tamanho_titulo: configRows[0].tamanho_titulo ?? undefined,
      updated_at: configRows[0].updated_at,
      produto_ids,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar configuração de data comemorativa:", err);
    throw err;
  } finally {
    client.release();
  }
}
