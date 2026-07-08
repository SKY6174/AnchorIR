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

const updatedD2Programs = [
  { id: "D2-S1T1-1", title: "지산학 보건 거버넌스 구축 및 운영", budget_2026: 3000000, assignee: "박인숙 선임연구원", category: "성과 활용∙확산 지원비" },
  { id: "D2-S1T2-1", title: "맞춤형 보건복지 서비스 역량강화를 위한 기자재 & 장비", budget_2026: 50000000, assignee: "박인숙 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "D2-S1T2-2", title: "신규학과 (반려동물/K-뷰티/외국인요양보호사) 기자재 & 장비", budget_2026: 100000000, assignee: "박인숙 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "D2-S1T3-1", title: "사회적약자 의료케어 역량강화교육 프로그램 운영(주민참여형)", budget_2026: 11000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S1T3-2", title: "교내 시설 활용 주민참여 프로그램 운영", budget_2026: 5000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S1T4-1", title: "AI 보건의료 빅데이터 교육 프로그램 운영", budget_2026: 9000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S1T4-2", title: "지역의료기관 연계 사업 운영", budget_2026: 5000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S1T5-1", title: "사회적약자 의료케어 모니터링 프로그램 운영", budget_2026: 21000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S1T6-1", title: "사회적약자 보건복지서비스 역량강화 프로그램 운영", budget_2026: 0, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S2T7-1", title: "공공보건 의료데이터와 AI혁신 챌린지 운영", budget_2026: 0, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S2T7-2", title: "보건복지서비스 역량강화 전문인력양성 혁신 프로그램 운영", budget_2026: 30000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S2T8-1", title: "지역정주형 보건의료 인재 역량강화 프로그램 운영", budget_2026: 0, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S2T9-1", title: "지역 연계형 보건복지 취업역량 강화 프로그램 운영", budget_2026: 30000000, assignee: "박인숙 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D2-S2T10-1", title: "신규학과 개설&지원을 위한 통합형 보건인재 양성 교육환경 개선 + 외국인요양보호사", budget_2026: 136000000, assignee: "박인숙 선임연구원", category: "교육∙연구 환경개선비" }
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
    
    // D 프로젝트 내 D2 단위과제 찾기
    const dProj = list.find(p => p.id === "D");
    const d2 = dProj?.units?.find(u => u.id === "D2");
    
    if (d2) {
      console.log(`\n[연차 ${row.year}] D2 단위과제 프로그램 리스트 최신화 시작...`);
      
      // 1. D2 프로그램 목록 갱신
      d2.programs = updatedD2Programs.map((up) => {
        const yearsObj = {};
        [1, 2, 3, 4, 5].forEach((yr) => {
          const isSelectedYear = (parseInt(yr, 10) === 2);
          const bVal = isSelectedYear ? up.budget_2026 : 0;
          
          yearsObj[yr] = {
            budget_main: bVal,
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0,
            budget_national: bVal, // 💡 [업무 규칙 준수] D2 예산은 100% 국비(국고) 본예산으로 배정합니다.
            budget_city: 0,
            spent_national: 0,
            spent_city: 0,
            budget_categories: [
              {
                category: up.category,
                budget: String(bVal).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                budget_carry: "0",
                spent: 0,
                spent_carry: 0
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
          timeline: ",,P,D,C,A,,,,,,",
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
      
      // 2. D2 단위과제 자체의 budgetDetails 비목 요약 갱신
      if (d2.budgetDetails) {
        Object.keys(d2.budgetDetails).forEach((catName) => {
          const cat = d2.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                let mainVal = 0;
                if (catName === "교육∙연구 프로그램 개발∙운영비") mainVal = 111000000;
                else if (catName === "교육∙연구 환경개선비") mainVal = 136000000;
                else if (catName === "실험∙실습장비 및 기자재 구입∙운영비") mainVal = 150000000;
                else if (catName === "지역 연계∙협업 지원비") mainVal = 0;
                else if (catName === "기업 지원∙협력 활동비") mainVal = 0;
                else if (catName === "성과 활용∙확산 지원비") mainVal = 3000000;
                
                y.budget_main = mainVal;
                y.budget_national = mainVal; // 💡 100% 국고
                y.budget_city = 0;           // 0% 시비
              } else {
                y.budget_national = y.budget_main || 0;
                y.budget_city = 0;
              }
            });
          }
        });
      }
      
      // 3. D2 단위과제 자체의 years 객체 총액 동기화
      if (d2.years) {
        Object.keys(d2.years).forEach((yr) => {
          const y = d2.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_main = 400000000;
            y.budget_national = 400000000; // 💡 100% 국고 (4.0억 원)
            y.budget_city = 0;             // 💡 0% 시비
            y.budget_carry = y.budget_carry || 0;
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }
      
      // D2 단위과제 총합 예산 값 재동기화
      d2.budget = 400000000;
      d2.budget_2026 = 400000000;
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] D2 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] D2 프로그램 및 예산 업데이트 성공!`);
      }
    }
  }
}

run();