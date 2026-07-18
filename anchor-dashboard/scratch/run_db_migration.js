import pg from 'pg';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log(">>> [Direct DB Migration] 위원회 서브시스템 테이블 생성 및 고도화 적용 시도 <<<");
  
  // Supabase GCP DB Connection Pooler 6543
  const client = new pg.Client({
    host: 'qpojcgpdgvzlivjrhrhn.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'uc_anchor',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ 원격 DB 연결 성공!");

    // 1) 082 마이그레이션 로드 및 실행
    const sql82Path = path.resolve("..", "supabase", "migrations", "082_create_committee_tables.sql");
    if (!fs.existsSync(sql82Path)) {
      throw new Error(`082 SQL 파일을 찾을 수 없습니다: ${sql82Path}`);
    }
    const sql82 = fs.readFileSync(sql82Path, 'utf8');
    console.log("⏳ 082_create_committee_tables.sql 실행 중...");
    await client.query(sql82);
    console.log("✨ 082_create_committee_tables.sql 적용 성공!");

    // 2) 083 마이그레이션 로드 및 실행
    const sql83Path = path.resolve("..", "supabase", "migrations", "083_fix_committee_foreign_keys.sql");
    if (!fs.existsSync(sql83Path)) {
      throw new Error(`083 SQL 파일을 찾을 수 없습니다: ${sql83Path}`);
    }
    const sql83 = fs.readFileSync(sql83Path, 'utf8');
    console.log("⏳ 083_fix_committee_foreign_keys.sql 실행 중...");
    await client.query(sql83);
    console.log("✨ 083_fix_committee_foreign_keys.sql 적용 성공!");

    console.log("🎉 위원회 의결 서브시스템 테이블이 성공적으로 원격 DB에 개설되었습니다!");
  } catch (err) {
    console.error("❌ Migration 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
