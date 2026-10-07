import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_aUgOIK0HkTE2@ep-dark-boat-b6q25xt7-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function seed() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log('Seeding initial ingredients and sample recipe...');

    // Insumos extras se não existirem
    const insumosParaCriar = [
      { nome: 'Farinha de Trigo Dona Benta', tipo: 'GRAMA', peso: 1000, preco: 5.50 },
      { nome: 'Açúcar Refinado União', tipo: 'GRAMA', peso: 1000, preco: 4.50 },
      { nome: 'Manteiga sem Sal', tipo: 'GRAMA', peso: 500, preco: 15.00 },
      { nome: 'Chocolate em Pó 50%', tipo: 'GRAMA', peso: 1000, preco: 38.00 },
      { nome: 'Ovos Grandes', tipo: 'UNIDADE', peso: 12, preco: 12.00 },
    ];

    for (const item of insumosParaCriar) {
      const existe = await client.query('SELECT id FROM insumos WHERE nome = $1', [item.nome]);
      if (existe.rows.length === 0) {
        const custoBase = item.preco / item.peso;
        await client.query(
          `INSERT INTO insumos (nome, tipo_medida, quantidade_embalagem, preco_embalagem, custo_por_unidade_base, formato_compra, unidades_por_pack, peso_unitario)
           VALUES ($1, $2, $3, $4, $5, 'UNIDADE', 1, $3)`,
          [item.nome, item.tipo, item.peso, item.preco, custoBase]
        );
      }
    }

    // Buscar IDs dos insumos para montar a receita
    const { rows: todosInsumos } = await client.query('SELECT id, nome FROM insumos');
    const findInsumo = (str) => todosInsumos.find(i => i.nome.toLowerCase().includes(str.toLowerCase()))?.id;

    const idLeiteCond = findInsumo('leite condensado');
    const idFarinha = findInsumo('farinha');
    const idAcucar = findInsumo('acucar') || findInsumo('açúcar');
    const idManteiga = findInsumo('manteiga');
    const idChoc = findInsumo('chocolate');
    const idOvos = findInsumo('ovos');

    const checkRec = await client.query('SELECT count(*)::int as count FROM receitas');
    if (checkRec.rows[0].count === 0) {
      const recRes = await client.query(
        `INSERT INTO receitas (nome, rendimento, custo_embalagem, taxa_custos_invisiveis, margem_lucro_desejada)
         VALUES ('Bolo de Cenoura com Brigadeiro Gourmet', 1, 4.50, 20.00, 150.00)
         RETURNING id`
      );
      const receitaId = recRes.rows[0].id;

      const items = [
        { id: idLeiteCond, qtd: 395 },
        { id: idFarinha, qtd: 250 },
        { id: idAcucar, qtd: 200 },
        { id: idManteiga, qtd: 100 },
        { id: idChoc, qtd: 80 },
        { id: idOvos, qtd: 3 },
      ];

      for (const it of items) {
        if (it.id) {
          await client.query(
            `INSERT INTO receita_insumos (receita_id, insumo_id, quantidade_utilizada)
             VALUES ($1, $2, $3)`,
            [receitaId, it.id, it.qtd]
          );
        }
      }
      console.log('Sample recipe created with success!');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
