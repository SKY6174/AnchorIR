import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

async function run() {
  console.log(">>> [Direct DB Migration] 077 & 081 교강사 테이블 구축 및 개편 실행 <<<");
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.qpojcgpdgvzlivjrhrhn',
    password: 'uc_anchor', // 패스워드를 uc_anchor로 지정
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("DB 연결 성공!");

    // 077 기본 테이블 생성 마이그레이션 수행
    const sqlPath77 = path.resolve('../supabase/migrations/077_create_instructor_pool_tables.sql');
    if (fs.existsSync(sqlPath77)) {
      console.log("Executing 077 SQL (Create Base Tables)...");
      const sql77 = fs.readFileSync(sqlPath77, 'utf8');
      try {
        await client.query(sql77);
        console.log("077_create_instructor_pool_tables.sql 생성 완료!");
      } catch (e) {
        console.log("077 실행 생략 (이미 테이블이 존재할 수 있음):", e.message);
      }
    }

    // 081 스키마 개편 마이그레이션 실행
    const sqlPath81 = path.resolve('../supabase/migrations/081_update_instructor_pool_tables.sql');
    if (!fs.existsSync(sqlPath81)) {
      throw new Error(`Migration SQL file not found at ${sqlPath81}`);
    }

    const sql81 = fs.readFileSync(sqlPath81, 'utf8');
    console.log("Executing 081 SQL (Update Tables)...");
    await client.query(sql81);
    console.log("081_update_instructor_pool_tables.sql 적용 성공!");

  } catch (err) {
    console.error("Migration 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
