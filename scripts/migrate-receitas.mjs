import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_aUgOIK0HkTE2@ep-dark-boat-b6q25xt7-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  const pool = new Pool({ connectionString });
  console.log('Connecting to Neon PostgreSQL for Receitas migration...');
  const client = await pool.connect();
  
  try {
    console.log('Creating receitas and receita_insumos tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS receitas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        rendimento INT NOT NULL DEFAULT 1,
        custo_embalagem NUMERIC(10, 2) NOT NULL DEFAULT 0,
        taxa_custos_invisiveis NUMERIC(10, 2) NOT NULL DEFAULT 20,
        margem_lucro_desejada NUMERIC(10, 2) NOT NULL DEFAULT 150,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS receita_insumos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        receita_id UUID NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
        insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
        quantidade_utilizada NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_receita_insumos_receita ON receita_insumos(receita_id);
      CREATE INDEX IF NOT EXISTS idx_receita_insumos_insumo ON receita_insumos(insumo_id);
    `);

    console.log('Receitas tables created successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
