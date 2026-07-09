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
  console.log("=== program_version_requests 테이블 내 '승인대기' 상태인 모든 요청 건 조회 ===");
  const { data, error } = await supabase
    .from('program_version_requests')
    .select('*')
    .eq('status', '승인대기');
    
  if (error) {
    console.error("조회 실패:", error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("현재 '승인대기' 상태인 요청이 전혀 없습니다.");
  } else {
    console.log(`총 ${data.length}개의 승인대기 요청이 존재합니다.`);
    data.forEach((req, idx) => {
      console.log(`\n[${idx + 1}] ID: ${req.id} | Program ID: ${req.program_id} | Title: ${req.program_title}`);
      console.log(`    - 요청자: ${req.requested_by}`);
      console.log(`    - 버전명: ${req.version_name}`);
      console.log(`    - 생성일시: ${req.created_at || req.inserted_at}`);
      if (req.changes && req.changes.after) {
        const y2 = req.changes.after.years?.["2"] || {};
        console.log(`    - [변경 후 2차년도 예산] 국비: ${y2.budget_national}, 시비: ${y2.budget_city}, 외부: ${y2.budget_external}`);
      }
      if (req.changes && req.changes.before) {
        const y2 = req.changes.before.years?.["2"] || {};
        console.log(`    - [변경 전 2차년도 예산] 국비: ${y2.budget_national}, 시비: ${y2.budget_city}, 외부: ${y2.budget_external}`);
      }
    });
  }
}

run();
