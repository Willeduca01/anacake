import pg from 'pg';
import { getDatabaseUrl } from './get-db-url.mjs';

const { Pool } = pg;
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.error('Erro: DATABASE_URL não configurada no ambiente nem no arquivo .env.');
  process.exit(1);
}

async function migrate() {
  const pool = new Pool({ connectionString });
  console.log('Conectando ao PostgreSQL para criar índices de alta performance...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Criando índice para busca de produto por nome (checkout/confirmação)...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_produtos_nome 
      ON produtos (nome);
    `);

    console.log('2. Criando índice parcial para cardápio público ativo (sem custo de sort)...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_produtos_cardapio 
      ON produtos (categoria, nome) 
      WHERE ativo = true;
    `);

    console.log('3. Criando índice para Foreign Key de insumos -> insumos_base...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_insumos_insumo_base_id 
      ON insumos (insumo_base_id);
    `);

    console.log('4. Criando índice parcial para pedidos pendentes e ordenação cronológica...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pedidos_pendentes_created 
      ON pedidos (created_at DESC) 
      WHERE status = 'pendente';
    `);

    console.log('5. Criando índice composto para histórico de compras por insumo...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_insumo_compras_insumo_data 
      ON insumo_compras (insumo_id, data_compra DESC);
    `);

    console.log('6. Criando índice para listagem ordenada de receitas...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_receitas_nome 
      ON receitas (nome);
    `);

    console.log('7. Criando índice composto para histórico de vendas com desempate...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_vendas_data_id 
      ON vendas (data_venda DESC, id DESC);
    `);

    await client.query('COMMIT');
    console.log('✅ Todos os índices de otimização foram criados com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar índices:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
