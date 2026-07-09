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
  console.log("=== Supabase projects_data 테이블 백업 다운로드 시작 ===");
  const { data: rows, error } = await supabase.from('projects_data').select('*');
  
  if (error) {
    console.error("다운로드 실패:", error);
    return;
  }
  
  rows.forEach(row => {
    const fileName = `projects_data_year_${row.year}.json`;
    fs.writeFileSync(fileName, JSON.stringify(row.data, null, 2), 'utf8');
    console.log(`[연도: ${row.year}차년도] 데이터 백업 저장 완료: ${fileName} (Row ID: ${row.id})`);
  });
  console.log("=== 다운로드 완료 ===");
}

run();
