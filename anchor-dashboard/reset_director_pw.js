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
const anonKey = env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  console.log("=== schedule_monthly 테이블 전체 데이터 덤프 ===");
  const { data, error } = await supabase.from('schedule_monthly').select('*');
  if (error) {
    console.error("Fetch Error:", error);
    return;
  }
  console.log(`총 데이터 개수: ${data.length}`);
  data.forEach((item, idx) => {
    console.log(`[${idx+1}] ID: ${item.id}, Year: ${item.year}, Title: ${item.title}, StartAt: ${item.start_at}`);
  });
}

run();
