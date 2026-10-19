import pg from 'pg';
import { getDatabaseUrl } from './get-db-url.mjs';

const { Pool } = pg;
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.error('Erro: DATABASE_URL não configurada no ambiente nem no arquivo .env.');
  process.exit(1);
}

async function run() {
  const pool = new Pool({ connectionString });
  console.log('Conectando ao PostgreSQL para exclusão dos insumos do estoque...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Removendo vínculos de insumos em receitas (receita_insumos)...');
    const riRes = await client.query('DELETE FROM receita_insumos RETURNING id');
    console.log(`   -> ${riRes.rowCount} vínculos de receitas removidos.`);

    console.log('2. Removendo compras registradas para insumos (insumo_compras)...');
    const icRes = await client.query('DELETE FROM insumo_compras RETURNING id');
    console.log(`   -> ${icRes.rowCount} compras removidas.`);

    console.log('3. Removendo todos os insumos do estoque (insumos)...');
    const insumosRes = await client.query('DELETE FROM insumos RETURNING id, nome');
    console.log(`   -> ${insumosRes.rowCount} insumos excluídos com sucesso:`);
    for (const row of insumosRes.rows) {
      console.log(`      - ${row.nome} (${row.id})`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Todos os insumos do estoque foram excluídos com sucesso!');

    const countInsumos = await client.query('SELECT count(*)::int as c FROM insumos');
    const countBases = await client.query('SELECT count(*)::int as c FROM insumos_base');
    console.log('\n--- ESTADO ATUAL ---');
    console.log(`- Insumos no estoque restantes: ${countInsumos.rows[0].c}`);
    console.log(`- Produtos & Itens Base preservados no catálogo: ${countBases.rows[0].c}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na operação, rollback executado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(() => process.exit(1));
