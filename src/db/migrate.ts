import fs from 'fs';
import path from 'path';
import pool from './client';

async function waitForConnection(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Connection attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function run() {
  console.log('Waiting for database connection...');
  await waitForConnection();
  console.log('Database connected, running migrations...');
  
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    console.log(`Running migration: ${f}`);
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    await pool.query(sql);
  }
  console.log('Migrations completed successfully');
  await pool.end();
}

run().catch((err: unknown) => {
  const message = err instanceof Error ? err.stack ?? err.message : String(err);
  process.stderr.write(`${message}\n`);
  throw err;
});


