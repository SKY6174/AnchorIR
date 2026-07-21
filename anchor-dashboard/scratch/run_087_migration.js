import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

const sqlPath = path.resolve('../supabase/migrations/087_add_attachment_to_agendas.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qpojcgpdgvzlivjrhrhn',
  password: 'uc_anchor',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL database via Pooler...");
  await client.connect();
  console.log("Connected successfully! Running migration 087...");
  
  try {
    await client.query(sqlContent);
    console.log("Migration 087 executed successfully!");
  } catch (err) {
    console.error("Migration execution failed:", err);
  } finally {
    await client.end();
  }
}

main();
