import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pgPool?: Pool };

export function getPool(): Pool {
  if (!globalForDb.pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL não configurada no ambiente.");
    }
    globalForDb.pgPool = new Pool({ connectionString, max: 5 });
  }
  return globalForDb.pgPool;
}
