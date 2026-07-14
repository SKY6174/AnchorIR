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
// 💡 [안전 조치] RLS 정책 우회를 위해 Service Role Key가 있는지 확인하고 사용하거나, Anon Key를 사용합니다.
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== DB 데이터 유실 정밀 진단 시작 ===");
  
  // 1. agreements 테이블 진단
  const { data: agr, error: agrErr } = await supabase.from('agreements').select('*');
  console.log(`[Agreements] 데이터 개수: ${agr ? agr.length : 0}, 에러:`, agrErr);
  if (agr && agr.length > 0) {
    console.log("샘플 데이터(최신순):", agr.slice(0, 2));
  }

  // 2. schedule_monthly 테이블 진단
  const { data: sMonth, error: smErr } = await supabase.from('schedule_monthly').select('*');
  console.log(`[Schedule Monthly] 데이터 개수: ${sMonth ? sMonth.length : 0}, 에러:`, smErr);

  // 3. schedule_events 테이블 진단
  const { data: sEvent, error: seErr } = await supabase.from('schedule_events').select('*');
  console.log(`[Schedule Events] 데이터 개수: ${sEvent ? sEvent.length : 0}, 에러:`, seErr);

  // 4. scholarships 테이블 진단
  const { data: schol, error: scErr } = await supabase.from('scholarships_view').select('*');
  console.log(`[Scholarships] 데이터 개수: ${schol ? schol.length : 0}, 에러:`, scErr);

  // 5. unified_certificates 테이블 진단
  const { data: certs, error: certsErr } = await supabase.from('unified_certificates').select('*');
  console.log(`[Unified Certificates] 데이터 개수: ${certs ? certs.length : 0}, 에러:`, certsErr);
}

run();
