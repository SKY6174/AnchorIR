import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// 💡 direct IPv6 주소로 Supabase 원격 DB 다이렉트 5432 포트 연결 수립
const client = new Client({
  host: '2406:da1c:4c7:f801:36a:5125:7c10:48c4', // db.qpojcgpdgvzlivjrhrhn.supabase.co 의 실시간 IPv6
  port: 5432, // Direct Postgres 포트
  user: 'postgres', // Direct 연결 시 순수 postgres 계정 사용
  password: 'Snake1201@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const sqlPath = '../supabase/migrations/079_create_seminar_reports_table.sql';
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

async function main() {
  console.log("Connecting directly to Supabase via Direct IPv6 Address [2406:da1c:4c7:f801:36a:5125:7c10:48c4:5432]...");
  try {
    await client.connect();
    console.log("✔ Connected successfully!");
    
    console.log("💾 Executing migration 079_create_seminar_reports_table...");
    await client.query(sqlContent);
    console.log("🎉 Migration 079 executed successfully!");
  } catch (err) {
    console.error("❌ Migration execution failed:", err.message || err);
  } finally {
    await client.end();
    console.log("DB Connection Closed.");
  }
}

main();
