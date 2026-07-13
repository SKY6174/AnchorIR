import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = fs.existsSync('.env') ? '.env' : fs.existsSync('anchor-dashboard/.env') ? 'anchor-dashboard/.env' : null;
if (!envPath) {
  console.error('.env 파일을 찾을 수 없습니다.');
  process.exit(1);
}
const envFile = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) return [line.trim(), ''];
      return [line.substring(0, eqIdx).trim(), line.substring(eqIdx + 1).replace(/["\r]/g, '').trim()];
    })
);

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://qpojcgpdgvzlivjrhrhn.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('projects_data').select('*').eq('year', 2).single();
  if (error) {
    console.error('DB 조회 실패:', error);
    process.exit(1);
  }

  const list = data.data;
  const aProj = list.find(p => p.id === 'A');
  const a1ga = aProj?.units?.find(u => u.id === 'A1가');

  if (!a1ga) {
    console.error('A1가 단위과제를 찾을 수 없습니다.');
    process.exit(1);
  }

  console.log('==================================================');
  console.log(`DB 상의 A1가 프로그램 개수: ${a1ga.programs.length}`);
  console.log('==================================================');
  a1ga.programs.forEach((prog, idx) => {
    console.log(`${idx + 1}. ID: ${prog.id} | Title: ${prog.title} | Assignee: ${prog.assignee}`);
  });
  console.log('==================================================');
}

run();
