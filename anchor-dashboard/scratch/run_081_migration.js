import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = "postgresql://postgres:uc_anchor@db.qpojcgpdgvzlivjrhrhn.supabase.co:6543/postgres";

async function run() {
  console.log(">>> [Direct DB Migration] 081 교강사 마스터 및 변동이력 스키마 개편 실행 <<<");
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("DB 연결 성공!");

    const sqlPath = "./supabase/migrations/081_update_instructor_pool_tables.sql";
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration SQL file not found at ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log("Executing SQL...");
    await client.query(sql);
    console.log("081_update_instructor_pool_tables.sql 적용 성공!");
  } catch (err) {
    console.error("Migration 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
