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

const updatedC2Programs = [
  { id: "C2-S1T1-1", title: "연간 운영할 수 있는 방과후 형태의 늘봄 프로그램 개발", budget_2026: 22000000, assignee: "최주명 센터장", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T1-3", title: "연간 운영할 수 있는 방과후 형태의 늘봄 프로그램 개발 고도화", budget_2026: 50000000, assignee: "최주명 센터장", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T1-2", title: "늘봄허브 및 개별 네트워크를 통한 방과후 늘봄 프로그램 운영(적용)", budget_2026: 130000000, assignee: "김예지 연구원", category: "지역 연계∙협업 지원비" },
  { id: "C2-S1T2-1", title: "소외계층, 지역사회, 학교 등에 적용 가능한 방학 늘봄 프로그램 개발", budget_2026: 10000000, assignee: "황수진 연구원", category: "지역 연계∙협업 지원비" },
  { id: "C2-S1T2-2", title: "일반형, 캠프형 등 다양한 형태의 늘봄 프로그램 운영 및 적용", budget_2026: 25000000, assignee: "황수진 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T3-1", title: "대학 중심 협력체계 구축 및 네트워크 형성", budget_2026: 16000000, assignee: "황수진 연구원", category: "지역 연계∙협업 지원비" },
  { id: "C2-S1T3-2", title: "유관기관 중심 협력체계 구축 및 네트워크 형성", budget_2026: 12000000, assignee: "김예지 연구원", category: "지역 연계∙협업 지원비" },
  { id: "C2-S1T4-1", title: "늘봄돌봄 역량 배양을 위한 강사양성과정 프로그램 개발", budget_2026: 132000000, assignee: "김예지 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T4-2", title: "양성된 강사의 현장 매칭 및 보급 (기초)", budget_2026: 48000000, assignee: "김예지 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T4-3", title: "양성된 강사의 현장 매칭 및 보급 (심화)", budget_2026: 30000000, assignee: "김예지 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T5-1", title: "늘봄愛 플랫폼을 통한 성과관리", budget_2026: 35000000, assignee: "황수진 연구원", category: "교육∙연구 환경개선비" },
  { id: "C2-S1T5-2", title: "늘봄 교육환경 개선비 (레이저 가공기 구입 등)", budget_2026: 30000000, assignee: "최주명 센터장", category: "교육∙연구 환경개선비" },
  { id: "C2-S1T6-1", title: "공동브랜드 대표 모듈 확산(성과공유 포럼/워크숍 정례운영)", budget_2026: 10000000, assignee: "최주명 센터장", category: "성과 활용∙확산 지원비" },
  { id: "C2-S1T6-2", title: "늘봄협의체 구성 및 간담회", budget_2026: 10000000, assignee: "황수진 연구원", category: "성과 활용∙확산 지원비" },
  { id: "C2-S1T6-3", title: "K-pop, 브리지 게임, 지역특화 등을 중심으로 프로그램 개발 및 고도화", budget_2026: 16000000, assignee: "최주명 센터장", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T7-1", title: "늘봄·체험 프로그램 이용자 40명 이상 확보(학교 적용 확대 운영)", budget_2026: 100000000, assignee: "황수진 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "C2-S1T8-1", title: "학과특성 반영 늘봄 프로그램 개발", budget_2026: 24000000, assignee: "최주명 센터장", category: "교육∙연구 프로그램 개발∙운영비" }
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
    
    // C 프로젝트 찾기
    const cProj = list.find(p => p.id === "C");
    const c2 = cProj?.units?.find(u => u.id === "C2");
    
    if (c2) {
      console.log(`\n[연차 ${row.year}] C2 단위과제 프로그램 리스트 최신화 시작...`);
      
      // 1. 기존 프로그램 리스트를 2차년도 기준 17건(16개 고유 프로그램) 신규 정의로 완전히 교체
      c2.programs = updatedC2Programs.map((up) => {
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
      
      // 2. C2 단위과제 자체의 budgetDetails 비목 요약 갱신 (본예산은 국고 100%, 이월비는 기존 값 보존)
      if (c2.budgetDetails) {
        Object.keys(c2.budgetDetails).forEach((catName) => {
          const cat = c2.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                // 비목별 배정
                let mainVal = 0;
                if (catName === "교육∙연구 프로그램 개발∙운영비") mainVal = 447000000;
                else if (catName === "교육∙연구 환경개선비") mainVal = 65000000;
                else if (catName === "실험∙실습장비 및 기자재 구입∙운영비") mainVal = 0;
                else if (catName === "지역 연계∙협업 지원비") mainVal = 168000000;
                else if (catName === "기업 지원∙협력 활동비") mainVal = 0;
                else if (catName === "성과 활용∙확산 지원비") mainVal = 20000000;
                
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
      
      // 3. C2 단위과제 자체의 years 객체 총액 동기화
      if (c2.years) {
        Object.keys(c2.years).forEach((yr) => {
          const y = c2.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_main = 700000000;
            y.budget_national = 700000000;
            y.budget_city = 0;
            // carry는 기존에 설정된 값이 있으면 유지 (없으면 기본값 0)
            y.budget_carry = y.budget_carry || 0;
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }
      
      // C2 단위과제 총합 예산 값 재동기화
      c2.budget = 700000000;
      c2.budget_2026 = 700000000;
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] C2 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] C2 프로그램 및 예산 업데이트 성공!`);
      }
    }
  }
}

run();
