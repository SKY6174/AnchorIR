import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFilePath = './.env';
const envFile = fs.readFileSync(envFilePath, 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return [];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
    .filter(arr => arr.length === 2)
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== DB 테이블 및 스키마 상세 구조 조회 ===");
  
  // PostgreSQL 시스템 카탈로그에서 public 스키마 내의 모든 테이블 목록 조회
  const { data: tables, error } = await supabase
    .rpc('get_tables_list'); // 만약 get_tables_list RPC가 정의되어 있지 않다면 에러가 날 수 있음

  if (error) {
    console.log("RPC get_tables_list failed, attempting manual system query via select...");
    // rpc가 안되면 일반적인 다른 방식으로 테이블 목록을 가져오기 위해 sql을 수행해야 하지만,
    // postgrest는 raw sql 수행이 직접 안되므로 테이블 메타데이터를 조회할 수 있는 내장 스키마나 뷰를 노크합니다.
    const { data: list, error: listErr } = await supabase
      .from('projects_data')
      .select('id, year, updated_at');
    console.log("Projects Data Rows:", list, listErr);
  } else {
    console.log("Tables list:", tables);
  }
}

run();
