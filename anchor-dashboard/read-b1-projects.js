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
  const { data, error } = await supabase
    .from('projects_data')
    .select('*')
    .eq('year', 2)
    .single();

  if (error) {
    console.error("DB Query Error:", error);
    return;
  }
  
  if (data.data) {
    let foundUnit = null;
    console.log("=== 전체 추진전략 및 단위과제 목록 ===");
    data.data.forEach(strat => {
      console.log(`[전략] ID: ${strat.id} | Title: ${strat.title}`);
      strat.units.forEach(unit => {
        console.log(`  └ [단위과제] ID: ${unit.id} | Title: ${unit.title}`);
        if (unit.id && (unit.id.includes('B1') || unit.id.includes('B-1') || unit.id.includes('b1') || unit.id.includes('b-1'))) {
          foundUnit = unit;
        }
      });
    });
    
    if (foundUnit) {
      console.log(`\n=== B-1 단위과제 데이터 발견 ===`);
      console.log(`ID: ${foundUnit.id} | Title: ${foundUnit.title}`);
      if (foundUnit.programs) {
        console.log(`총 프로그램 수: ${foundUnit.programs.length}개`);
        foundUnit.programs.forEach(p => {
          console.log(`  - [ID] ${p.id} | [Title] ${p.title} | [Assignee] ${p.assignee}`);
        });
      } else {
        console.log("programs 필드가 없습니다.");
      }
    } else {
      console.log("B-1 단위과제를 찾지 못했습니다.");
    }
  } else {
    console.log("No data field in row");
  }
}

run();
