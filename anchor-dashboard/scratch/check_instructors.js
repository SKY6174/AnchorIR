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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, ''));

async function run() {
  console.log("Supabase VITE_SUPABASE_URL:", env.VITE_SUPABASE_URL);
  
  // 1. instructors 테이블 조회 시도
  const { data: insData, error: insError } = await supabase.from('instructors').select('*');
  console.log("Instructors Data:", insData);
  console.log("Instructors Error:", insError);

  // 2. 다른 기존 테이블(예: scholarships) 조회 시도하여 API 연결 자체 확인
  const { data: scData, error: scError } = await supabase.from('scholarships').select('*');
  console.log("Scholarships Data count:", scData ? scData.length : null);
  console.log("Scholarships Error:", scError);
}

run();
