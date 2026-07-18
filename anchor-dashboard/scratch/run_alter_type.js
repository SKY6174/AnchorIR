import pg from 'pg';

async function run() {
  console.log(">>> [Direct DB Patch] committee_members 테이블에 'type' 컬럼 안전 추가 시도 <<<");
  
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

    const sql = `ALTER TABLE committee_members ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT '위원';`;
    console.log("⏳ ALTER TABLE 실행 중...");
    await client.query(sql);
    console.log("✨ 'type' 컬럼이 성공적으로 추가(또는 이미 존재)되었습니다!");

  } catch (err) {
    console.error("❌ Patch 실패:", err.message);
  } finally {
    await client.end();
  }
}

run();
