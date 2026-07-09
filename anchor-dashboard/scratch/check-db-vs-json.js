import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// 1. .env 파일 파싱하여 Supabase 정보 가져오기
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

async function checkDiff() {
  console.log("=== DB 데이터 vs 로컬 JSON 파일 비교 분석 시작 ===");

  // 1. Supabase에서 2차년도 데이터 조회
  const { data: dbRows, error } = await supabase
    .from('projects_data')
    .select('data')
    .eq('year', 2);

  if (error) {
    console.error("DB 조회 오류:", error);
    return;
  }

  if (!dbRows || dbRows.length === 0) {
    console.error("DB에 2차년도 데이터가 없습니다.");
    return;
  }

  const dbData = dbRows[0].data;

  // 2. 로컬 JSON 파일 로드
  const localFileName = 'projects_data_year_2.json';
  if (!fs.existsSync(localFileName)) {
    console.error(`로컬 파일 ${localFileName}이 존재하지 않습니다.`);
    return;
  }
  const localData = JSON.parse(fs.readFileSync(localFileName, 'utf8'));

  // 3. 비교 함수 정의
  // D1, D2, D3 단위과제 하위 프로그램들의 예산(budget_city, budget_national) 및 manager 비교
  console.log("\n--- [D1, D2, D3 단위과제 예산 검증] ---");
  
  const targetUnits = ["D1", "D2", "D3"];

  const inspectData = (sourceName, dataObj) => {
    const info = {};
    dataObj.forEach(strat => {
      if (strat.units) {
        strat.units.forEach(unit => {
          if (targetUnits.includes(unit.id)) {
            if (!info[unit.id]) {
              info[unit.id] = {
                manager: unit.manager,
                programs: []
              };
            }
            if (unit.programs) {
              unit.programs.forEach(prog => {
                const yr2 = prog.years && prog.years["2"] ? prog.years["2"] : {};
                info[unit.id].programs.push({
                  id: prog.id,
                  title: prog.title,
                  budget_city: yr2.budget_city,
                  budget_national: yr2.budget_national,
                  budget_main: yr2.budget_main
                });
              });
            }
          }
        });
      }
    });
    return info;
  };

  const dbInfo = inspectData("DB", dbData);
  const localInfo = inspectData("로컬", localData);

  targetUnits.forEach(unitId => {
    console.log(`\n[단위과제: ${unitId}]`);
    const dbUnit = dbInfo[unitId] || { manager: "없음", programs: [] };
    const localUnit = localInfo[unitId] || { manager: "없음", programs: [] };

    console.log(`  - DB 담당자: ${dbUnit.manager}`);
    console.log(`  - 로컬 담당자: ${localUnit.manager}`);
    if (dbUnit.manager !== localUnit.manager) {
      console.log(`  ⚠️ 담당자 불일치! DB: ${dbUnit.manager} vs 로컬: ${localUnit.manager}`);
    }

    // 프로그램 비교
    dbUnit.programs.forEach(dbProg => {
      const localProg = localUnit.programs.find(p => p.id === dbProg.id);
      if (!localProg) {
        console.log(`  ⚠️ 로컬에 프로그램 ${dbProg.id}이 존재하지 않습니다.`);
        return;
      }

      const hasCityInDb = dbProg.budget_city > 0;
      const hasCityInLocal = localProg.budget_city > 0;

      if (hasCityInDb || hasCityInLocal || dbProg.budget_national !== localProg.budget_national) {
        console.log(`  [프로그램 ID: ${dbProg.id}]`);
        console.log(`    - DB  -> 총예산: ${dbProg.budget_main}, 시비: ${dbProg.budget_city}, 국비: ${dbProg.budget_national}`);
        console.log(`    - 로컬 -> 총예산: ${localProg.budget_main}, 시비: ${localProg.budget_city}, 국비: ${localProg.budget_national}`);
        
        if (dbProg.budget_city !== localProg.budget_city) {
          console.log(`    ⚠️ 시비 불일치! DB: ${dbProg.budget_city} vs 로컬: ${localProg.budget_city}`);
        }
        if (dbProg.budget_national !== localProg.budget_national) {
          console.log(`    ⚠️ 국비 불일치! DB: ${dbProg.budget_national} vs 로컬: ${localProg.budget_national}`);
        }
      }
    });
  });

  // 4. 전체적인 매니저 정보 비교 (모든 단위과제 대상)
  console.log("\n--- [전체 단위과제 담당자(manager) 비교] ---");
  const getManagers = (dataObj) => {
    const mgrs = {};
    dataObj.forEach(strat => {
      if (strat.units) {
        strat.units.forEach(unit => {
          mgrs[unit.id] = unit.manager;
        });
      }
    });
    return mgrs;
  };

  const dbMgrs = getManagers(dbData);
  const localMgrs = getManagers(localData);

  Object.keys(localMgrs).forEach(unitId => {
    if (dbMgrs[unitId] !== localMgrs[unitId]) {
      console.log(`⚠️ 단위과제 ${unitId} 담당자 불일치: DB [${dbMgrs[unitId]}] vs 로컬 [${localMgrs[unitId]}]`);
    } else {
      console.log(`정상 - ${unitId}: ${localMgrs[unitId]}`);
    }
  });

}

checkDiff();
