import pg from 'pg';
import fs from 'fs';

const connectionString = "postgresql://postgres:uc_anchor@db.qpojcgpdgvzlivjrhrhn.supabase.co:6543/postgres";

async function run() {
  console.log(">>> [Direct DB Migration] budget_executions 테이블 생성 시도 <<<");
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("DB 연결 성공!");

    const sqlPath = "./supabase/migrations/001_create_budget_executions.sql";
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration SQL file not found at ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log("Executing SQL...");
    await client.query(sql);
    console.log("budget_executions 테이블 생성 완료!");
  } catch (err) {
    console.error("Migration 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
