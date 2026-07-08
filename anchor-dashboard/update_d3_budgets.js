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

const updatedD3Programs = [
  { id: "D3-S1T1-1", title: "문화 콘텐츠 개발 우수 사례 및 벤치마킹", budget_2026: 5000000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S1T1-4", title: "K-컬처 글로벌 교류 프로젝트: 대만 충유대 교류 프로그램", budget_2026: 28400000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S1T2-1", title: "콘텐츠 크리에이터 연계 프로젝트(실무 프로젝트)", budget_2026: 30000000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S1T3-1", title: "도시재생 체험 프로젝트", budget_2026: 40000000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S1T3-2", title: "대학내 커뮤니티 공간 구축(북카페조성)", budget_2026: 200000000, assignee: "오영경 연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "D3-S1T4-1", title: "도시공간 재생 프로젝트 거버넌스 운영", budget_2026: 1000000, assignee: "오영경 연구원", category: "성과 활용∙확산 지원비" },
  { id: "D3-S1T4-2", title: "서포터즈 활동비", budget_2026: 4000000, assignee: "오영경 연구원", category: "성과 활용∙확산 지원비" },
  { id: "D3-S2T5-1", title: "문화 예술 체험 프로젝트", budget_2026: 10000000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S2T6-1", title: "지역 연계 협업 예술 프로젝트(중구 배움의 뜰, 평생교육학습 축제예정)", budget_2026: 10000000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S2T7-1", title: "지역사회 연계 및 교류 홍보", budget_2026: 10000000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "D3-S2T8-1", title: "지역 연계협업 문화 콘텐츠 개발 프로젝트", budget_2026: 40600000, assignee: "오영경 연구원", category: "교육∙연구 프로그램 개발∙운영비" }
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
    
    // D 프로젝트 찾기
    const dProj = list.find(p => p.id === "D");
    const d3 = dProj?.units?.find(u => u.id === "D3");
    
    if (d3) {
      console.log(`\n[연차 ${row.year}] D3 단위과제 프로그램 리스트 최신화 시작...`);
      
      // 1. 기존 프로그램 리스트를 2차년도 기준 11건 신규 정의로 완전히 교체
      d3.programs = updatedD3Programs.map((up) => {
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
      
      // 2. D3 단위과제 자체의 budgetDetails 비목 요약 갱신 (본예산은 국고 100%, 이월비는 기존 값 보존)
      if (d3.budgetDetails) {
        Object.keys(d3.budgetDetails).forEach((catName) => {
          const cat = d3.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                // 비목별 배정
                let mainVal = 0;
                if (catName === "교육∙연구 프로그램 개발∙운영비") mainVal = 174000000;
                else if (catName === "교육∙연구 환경개선비") mainVal = 0;
                else if (catName === "실험∙실습장비 및 기자재 구입∙운영비") mainVal = 200000000;
                else if (catName === "지역 연계∙협업 지원비") mainVal = 0;
                else if (catName === "기업 지원∙협력 활동비") mainVal = 0;
                else if (catName === "성과 활용∙확산 지원비") mainVal = 5000000;
                
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
      
      // 3. D3 단위과제 자체의 years 객체 총액 동기화
      if (d3.years) {
        Object.keys(d3.years).forEach((yr) => {
          const y = d3.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_main = 379000000;
            y.budget_national = 379000000;
            y.budget_city = 0;
            // carry는 기존에 설정된 값이 있으면 유지 (없으면 기본값 0)
            y.budget_carry = y.budget_carry || 0;
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }
      
      // D3 단위과제 총합 예산 값 재동기화
      d3.budget = 379000000;
      d3.budget_2026 = 379000000;
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] D3 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] D3 프로그램 및 예산 업데이트 성공!`);
      }
    }
  }
}

run();
