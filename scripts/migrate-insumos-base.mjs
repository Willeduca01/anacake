import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_aUgOIK0HkTE2@ep-dark-boat-b6q25xt7-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  const pool = new Pool({ connectionString });
  console.log('Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  
  try {
    console.log('Creating insumos_base table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS insumos_base (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        tipo_medida VARCHAR(20) NOT NULL,
        unidade_padrao VARCHAR(10) NOT NULL,
        quantidade_padrao NUMERIC(10, 2) NOT NULL,
        quantidade_base NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_insumos_base_nome ON insumos_base (nome);

      ALTER TABLE insumos ADD COLUMN IF NOT EXISTS insumo_base_id UUID REFERENCES insumos_base(id) ON DELETE SET NULL;
      ALTER TABLE insumos ADD COLUMN IF NOT EXISTS formato_compra VARCHAR(20) DEFAULT 'UNIDADE';
      ALTER TABLE insumos ADD COLUMN IF NOT EXISTS unidades_por_pack NUMERIC(10, 2) DEFAULT 1;
      ALTER TABLE insumos ADD COLUMN IF NOT EXISTS peso_unitario NUMERIC(10, 2);
    `);

    // Check if insumos_base has initial data
    const { rows } = await client.query('SELECT count(*)::int as total FROM insumos_base');
    console.log(`Current items in insumos_base: ${rows[0].total}`);

    if (rows[0].total === 0) {
      console.log('Seeding initial base ingredients/products for confectionery...');
      await client.query(`
        INSERT INTO insumos_base (nome, tipo_medida, unidade_padrao, quantidade_padrao, quantidade_base) VALUES
        ('Leite Condensado', 'GRAMA', 'g', 395, 395),
        ('Creme de Leite', 'GRAMA', 'g', 200, 200),
        ('Leite Integral', 'MILILITRO', 'l', 1, 1000),
        ('Farinha de Trigo', 'GRAMA', 'kg', 1, 1000),
        ('Açúcar Refinado', 'GRAMA', 'kg', 1, 1000),
        ('Manteiga sem Sal', 'GRAMA', 'g', 500, 500),
        ('Chocolate em Pó 50%', 'GRAMA', 'kg', 1, 1000),
        ('Ovos (Dúzia)', 'UNIDADE', 'un', 12, 12);
      `);
      console.log('Sample base products seeded!');
    }

    console.log('Migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
