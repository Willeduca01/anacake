import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_aUgOIK0HkTE2@ep-dark-boat-b6q25xt7-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const pool = new Pool({ connectionString });
  console.log('Connecting to Neon PostgreSQL...');
  
  const client = await pool.connect();
  console.log('Connected! Creating tables and indexes...');
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      descricao TEXT,
      preco NUMERIC(10, 2) NOT NULL,
      estoque_atual INT NOT NULL DEFAULT 0,
      categoria VARCHAR(100),
      url_imagem TEXT,
      imagem_dados BYTEA,
      imagem_mime VARCHAR(50),
      ativo BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      status VARCHAR(20) NOT NULL DEFAULT 'pendente',
      cliente_nome VARCHAR(255),
      metodo_pagamento VARCHAR(50),
      total NUMERIC(10, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      confirmado_em TIMESTAMP WITH TIME ZONE
    );

    CREATE TABLE IF NOT EXISTS pedido_itens (
      id SERIAL PRIMARY KEY,
      pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
      produto_nome VARCHAR(255) NOT NULL,
      quantidade INT NOT NULL,
      preco_unit NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vendas (
      id SERIAL PRIMARY KEY,
      produto_id INT REFERENCES produtos(id) ON DELETE SET NULL,
      quantidade INT NOT NULL,
      valor_total NUMERIC(10, 2) NOT NULL,
      data_venda TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      metodo_pagamento VARCHAR(50)
    );

    CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas (data_venda);
    CREATE INDEX IF NOT EXISTS idx_vendas_produto ON vendas (produto_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos (status);
    CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens (pedido_id);
  `);
  
  console.log('Tables created successfully!');
  
  // Check if produtos has any data
  const { rows } = await client.query('SELECT count(*)::int as total FROM produtos');
  console.log(`Current products in database: ${rows[0].total}`);
  
  if (rows[0].total === 0) {
    console.log('Seeding initial products for Ana Cake...');
    await client.query(`
      INSERT INTO produtos (nome, descricao, preco, estoque_atual, categoria, ativo) VALUES
      ('Bolo de Cenoura com Brigadeiro', 'Massa fofinha com cobertura generosa de brigadeiro gourmet', 35.00, 10, 'doces', true),
      ('Bolo Red Velvet', 'Massa aveludada com recheio tradicional de cream cheese', 45.00, 8, 'doces', true),
      ('Brigadeiro Tradicional (Caixa com 6)', 'Brigadeiro feito com chocolate nobre e granulado crocante', 18.00, 15, 'doces', true),
      ('Coxinha de Frango com Catupiry', 'Massa leve e recheio cremoso e bem temperado', 8.50, 20, 'salgados', true),
      ('Empada de Palmito', 'Massa que derrete na boca com recheio cremoso de palmito', 9.00, 12, 'salgados', true),
      ('Torta Holandesa (Fatia)', 'Base crocante com creme holandês e cobertura de ganache', 16.00, 10, 'sobremesas', true),
      ('Pudim de Leite Condensado', 'Pudim lisinho e sem furinhos com calda de caramelo brilhante', 14.00, 10, 'sobremesas', true);
    `);
    console.log('Initial sample products inserted!');
  }
  
  client.release();
  await pool.end();
  console.log('Neon database is ready!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
