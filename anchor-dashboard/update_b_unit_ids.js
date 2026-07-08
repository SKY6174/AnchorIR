import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFilePath = '/Users/thomas/Documents/AnchorIR/anchor-dashboard/.env';
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
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Supabase projects_data 로드 중...");
  const { data: rows, error } = await supabase.from('projects_data').select('*');
  
  if (error) {
    console.error("DB 로드 실패:", error);
    process.exit(1);
  }
  
  console.log(`총 ${rows.length}개 연차 레코드를 발견했습니다.`);
  
  for (const row of rows) {
    const list = row.data;
    if (!list || !Array.isArray(list)) continue;
    
    // B 프로젝트 찾기
    const bProj = list.find(p => p.id === "B");
    if (bProj && bProj.units) {
      console.log(`\n[연차 ${row.year}] B 프로젝트 단위과제 ID 교정 작업 시작...`);
      
      bProj.units.forEach((unit) => {
        if (unit.programs && Array.isArray(unit.programs)) {
          unit.programs.forEach((prog) => {
            if (prog.id) {
              const oldId = prog.id;
              // B1가-, B2가-, B4가- 에 대해 '가' 삭제 처리
              if (prog.id.startsWith("B1가-")) {
                prog.id = prog.id.replace("B1가-", "B1-");
              } else if (prog.id.startsWith("B2가-")) {
                prog.id = prog.id.replace("B2가-", "B2-");
              } else if (prog.id.startsWith("B4가-")) {
                prog.id = prog.id.replace("B4가-", "B4-");
              }
              
              if (oldId !== prog.id) {
                console.log(`  - 프로그램 ID 교정: ${oldId} -> ${prog.id}`);
              }
            }
          });
        }
      });
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] B 단위과제 ID 교정 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] B 단위과제 ID 교정 업데이트 성공!`);
      }
    }
  }
}

run();
