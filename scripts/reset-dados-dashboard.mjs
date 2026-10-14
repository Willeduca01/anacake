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
  console.log('Conectando ao PostgreSQL para reset dos dados operacionais...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Apagando todos os registros de vendas...');
    const vendasRes = await client.query('DELETE FROM vendas RETURNING id');
    console.log(`   -> ${vendasRes.rowCount} vendas removidas.`);

    console.log('2. Apagando todos os registros de histórico de compras de insumos...');
    const comprasRes = await client.query('DELETE FROM insumo_compras RETURNING id');
    console.log(`   -> ${comprasRes.rowCount} compras de insumos removidas.`);

    console.log('3. Zerando o estoque atual de todos os insumos (estoque_atual = 0)...');
    const insumosRes = await client.query('UPDATE insumos SET estoque_atual = 0 RETURNING id');
    console.log(`   -> ${insumosRes.rowCount} insumos tiveram o estoque zerado.`);

    await client.query('COMMIT');
    console.log('\n✅ Operação realizada com sucesso!');

    // Verificação pós-limpeza
    const countVendas = await client.query('SELECT count(*)::int as c FROM vendas');
    const countCompras = await client.query('SELECT count(*)::int as c FROM insumo_compras');
    const sumEstoque = await client.query('SELECT COALESCE(SUM(estoque_atual), 0)::float8 as s FROM insumos');

    console.log('\n--- ESTADO ATUAL ---');
    console.log(`- Vendas restantes: ${countVendas.rows[0].c}`);
    console.log(`- Histórico de compras restantes: ${countCompras.rows[0].c}`);
    console.log(`- Soma total do estoque de insumos: ${sumEstoque.rows[0].s}`);

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
