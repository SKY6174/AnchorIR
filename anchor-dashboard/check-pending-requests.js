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
const supabaseKey = env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== program_version_requests 내 D1-S1T1-1 대기 건 조회 ===");
  const { data, error } = await supabase
    .from('program_version_requests')
    .select('*')
    .eq('program_id', 'D1-S1T1-1');
    
  if (error) {
    console.error("조회 실패:", error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("D1-S1T1-1 에 대한 승인 요청 건이 아예 없습니다.");
  } else {
    data.forEach(req => {
      console.log(`- Request ID: ${req.id} | version_name: ${req.version_name} | status: ${req.status}`);
      if (req.changes && req.changes.after) {
        const y2 = req.changes.after.years?.["2"] || {};
        console.log(`  * [2차년도] 본예산: ${y2.budget_main}, 국비: ${y2.budget_national}, 시비: ${y2.budget_city}`);
      }
    });
  }
}

run();
