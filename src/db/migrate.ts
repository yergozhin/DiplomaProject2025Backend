import fs from 'fs';
import path from 'path';
import pool from './client';

async function run() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    await pool.query(sql);
  }
  process.exit(0);
}

run().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


