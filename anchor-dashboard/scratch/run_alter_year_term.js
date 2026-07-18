import pg from 'pg';

async function run() {
  console.log(">>> [Direct DB Patch] committee_members 테이블에 'year' 및 'term' 컬럼 안전 추가 시도 <<<");
  
  // Supabase GCP DB 직접 접속 커넥션 (port 5432)
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

    console.log("⏳ ALTER TABLE (year, term) 실행 중...");
    await client.query(`
      ALTER TABLE committee_members ADD COLUMN IF NOT EXISTS year VARCHAR(10) DEFAULT '2';
      ALTER TABLE committee_members ADD COLUMN IF NOT EXISTS term VARCHAR(100);
    `);
    console.log("✨ 컬럼들이 성공적으로 추가(또는 이미 존재)되었습니다!");

    console.log("⏳ Schema Cache 릴로드 전송 중...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("🎉 스키마 캐시가 성공적으로 릴로드되었습니다!");

  } catch (err) {
    console.error("❌ Patch 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
