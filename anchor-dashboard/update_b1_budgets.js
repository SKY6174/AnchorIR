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

const updatedB1Programs = [
  { id: "B1가-S1T1-1", title: "특허출원", budget_2026: 30000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T1-2", title: "논문게재료", budget_2026: 27500000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T1-3", title: "기술 사업화 지원(시제품 제작, 마케팅 지원 등)", budget_2026: 5000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T2-1", title: "AI활용 연구논문 작성법 관련 교직원 역량 강화 교육", budget_2026: 10000000, assignee: "이혜성 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B1가-S1T3-1", title: "가족협력회사 지원(현판, 인증서 제작 등)", budget_2026: 5000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T3-2", title: "성과공유", budget_2026: 4000000, assignee: "이윤정 연구원", category: "성과 활용∙확산 지원비" },
  { id: "B1가-S1T5-1", title: "(대기업 협력형) 산학공동기술개발연구과제 3건", budget_2026: 100000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T5-2", title: "(신산업 분야) 공동연구 과제 개발(에너지, AX 등 1개 과제) 5건", budget_2026: 75000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T6-1", title: "(초광역) 주력신사업 공동연구 과제 개발 1건", budget_2026: 20000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T6-2", title: "(개방형설계센터 실증연구형) 산학공동기술개발과제", budget_2026: 15000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T7-1", title: "(인재양성형) 공동연구 과제 개발(전문기술석사 참여) 3건", budget_2026: 30000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T8-1", title: "산학협력 간담회", budget_2026: 6000000, assignee: "도지은 연구원", category: "성과 활용∙확산 지원비" },
  { id: "B1가-S1T9-1", title: "기업애로 해결 컨설팅 지원 3건", budget_2026: 1500000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T10-1", title: "기업애로 해결 기술 지원 22건", budget_2026: 11000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B1가-S1T10-2", title: "산업체 재직자교육", budget_2026: 10000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" }
];

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
    const b1 = bProj?.units?.find(u => u.id === "B1");
    
    if (b1) {
      console.log(`\n[연차 ${row.year}] B1 단위과제 프로그램 리스트 최신화 시작...`);
      
      // 1. 기존 프로그램 리스트 24건을 2차년도 기준 15건 신규 정의로 완전히 교체
      b1.programs = updatedB1Programs.map((up) => {
        // years 다년도 설정
        const yearsObj = {};
        [1, 2, 3, 4, 5].forEach((yr) => {
          const isSelectedYear = (parseInt(yr, 10) === 2);
          const bVal = isSelectedYear ? up.budget_2026 : 0;
          
          yearsObj[yr] = {
            budget_main: bVal,
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0,
            budget_national: bVal,
            budget_city: 0,
            spent_national: 0,
            spent_city: 0,
            budget_categories: [
              {
                category: up.category,
                budget: bVal,
                spent: 0,
                budget_national: bVal,
                budget_city: 0,
                spent_national: 0,
                spent_city: 0
              }
            ]
          };
        });
        
        return {
          id: up.id,
          title: up.title,
          assignee: up.assignee,
          pdca: { p: "완료", d: "대기", c: "대기", a: "대기" },
          coopDept: "",
          evalType: "우수",
          timeline: "",
          excellent: "",
          actionItem: "",
          deficiency: "",
          spent_2026: 0,
          budget_2026: up.budget_2026,
          improvePlan: "",
          targetAudience: "",
          spent_2025_carry: 0,
          budget_2025_carry: 0,
          years: yearsObj
        };
      });
      
      // 2. B1 단위과제 자체의 budgetDetails 비목 요약 갱신 (본예산은 국고 100%, 이월비는 기존 값 보존)
      if (b1.budgetDetails) {
        Object.keys(b1.budgetDetails).forEach((catName) => {
          const cat = b1.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                // 비목별 배정
                let mainVal = 0;
                if (catName === "교육∙연구 프로그램 개발∙운영비") mainVal = 10000000;
                else if (catName === "기업 지원∙협력 활동비") mainVal = 330000000;
                else if (catName === "성과 활용∙확산 지원비") mainVal = 10000000;
                
                y.budget_main = mainVal;
                y.budget_national = mainVal;
                y.budget_city = 0;
              } else {
                y.budget_national = y.budget_main || 0;
                y.budget_city = 0;
              }
            });
          }
        });
      }
      
      // 3. B1 단위과제 자체의 years 객체 총액 동기화
      if (b1.years) {
        Object.keys(b1.years).forEach((yr) => {
          const y = b1.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_main = 350000000;
            y.budget_national = 350000000;
            y.budget_city = 0;
            y.budget_carry = 85100000; // 이월비 유지
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }
      
      // B1 단위과제 총합 예산 값 재동기화
      b1.budget = 350000000;
      b1.budget_2026 = 350000000;
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] B1 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] B1 프로그램 및 예산 업데이트 성공!`);
      }
    }
  }
}

run();
