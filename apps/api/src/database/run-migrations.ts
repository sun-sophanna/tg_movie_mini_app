import './load-env';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) {
    throw new Error(
      'DATABASE_URL is required. Set it in apps/api/.env (see apps/api/.env.example).',
    );
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id serial PRIMARY KEY,
      filename varchar NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const migrationPath = join(__dirname, 'migrations', '001-init.sql');
  const filename = '001-init.sql';
  const exists = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [
    filename,
  ]);
  if (exists.rowCount === 0) {
    const sql = readFileSync(migrationPath, 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
      console.log(`Applied migration ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } else {
    console.log(`Migration ${filename} already applied`);
  }

  await client.end();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
