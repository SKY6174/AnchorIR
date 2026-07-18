import pg from 'pg';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log(">>> [Direct DB Migration] 083_fix_committee_foreign_keys 적용 시도 (GCP Pooler 6543) <<<");
  
  const client = new pg.Client({
    host: 'gcp-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.qpojcgpdgvzlivjrhrhn',
    password: 'uc_anchor',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("DB 연결 성공!");

    const sqlPath = path.resolve("../supabase/migrations/083_fix_committee_foreign_keys.sql");
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration SQL file not found at ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log("Executing SQL...");
    await client.query(sql);
    console.log("083_fix_committee_foreign_keys 마이그레이션 성공!");
  } catch (err) {
    console.error("Migration 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
