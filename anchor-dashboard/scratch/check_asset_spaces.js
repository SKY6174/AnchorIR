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
  console.log("=== asset_reservations 테이블 내 고유 space_name 목록 조회 ===");
  const { data, error } = await supabase
    .from('asset_reservations')
    .select('space_name');
    
  if (error) {
    console.error("조회 실패:", error);
    return;
  }
  
  const spaces = [...new Set(data.map(d => d.space_name))];
  console.log("현재 DB에 저장된 고유 공간명:", spaces);
  
  // 각 공간명별 예약 건수도 세보자.
  for (const space of spaces) {
    const count = data.filter(d => d.space_name === space).length;
    console.log(`- ${space}: ${count}건`);
  }
}

run();
