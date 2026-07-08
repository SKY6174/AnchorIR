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

const updatedB4Programs = [
  { id: "B4가-S1T1-1", title: "복합재난분야 정규 교육과정 운영", budget_2026: 16000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T1-2", title: "복합재난분야 비정규 교육과정 운영", budget_2026: 57000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T1-3", title: "복합재난분야 교직원 역량강화", budget_2026: 14000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T1-4", title: "복합재난대응 아이디어 경진대회(지속가능캠퍼스 경진대회-B3연계)", budget_2026: 5000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T1-5", title: "복합재난 대응 선진기술 벤치마킹", budget_2026: 20000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T2-1", title: "복합재난분야 온라인 교육컨텐츠(K-MOOC) 개발", budget_2026: 30000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T5-1", title: "재난 및 산업안전 재직자교육(산업현장 교육프로그램 운영)", budget_2026: 10000000, assignee: "이혜성 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T6-1", title: "복합재난분야 가족회사 기술지원", budget_2026: 9000000, assignee: "이혜성 연구원", category: "기업 지원∙협력 활동비" },
  { id: "B4가-S1T7-1", title: "복합재난분야 정책연구", budget_2026: 10000000, assignee: "이혜성 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T8-1", title: "ISO45001 인증 교육과정", budget_2026: 10000000, assignee: "도지은 연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B4가-S1T9-1", title: "복합재난 대응 체험형 교육실습 장비", budget_2026: 55000000, assignee: "이정은 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "B4가-S1T9-2", title: "복합재난 대응 실감형 컨텐츠 운영장비", budget_2026: 40000000, assignee: "이정은 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "B4가-S1T11-1", title: "복합재난대응 지자체 협력프로그램", budget_2026: 4000000, assignee: "도지은 연구원", category: "지역 연계∙협업 지원비" },
  { id: "B4가-S1T12-1", title: "재난 대응 산학 협의체 운영", budget_2026: 5000000, assignee: "도지은 연구원", category: "성과 활용∙확산 지원비" },
  { id: "B4가-S1T12-2", title: "복합재난분야 거버넌스 구축활동(간담회 포함)", budget_2026: 12000000, assignee: "도지은 연구원", category: "성과 활용∙확산 지원비" },
  { id: "B4가-S1T12-3", title: "성과공유회", budget_2026: 3000000, assignee: "도지은 연구원", category: "성과 활용∙확산 지원비" }
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
    const b4 = bProj?.units?.find(u => u.id === "B4");
    
    if (b4) {
      console.log(`\n[연차 ${row.year}] B4 단위과제 프로그램 리스트 최신화 시작...`);
      
      // 1. 기존 프로그램 리스트 17-20여 건을 2차년도 기준 16건 신규 정의로 완전히 교체
      b4.programs = updatedB4Programs.map((up) => {
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
      
      // 2. B4 단위과제 자체의 budgetDetails 비목 요약 갱신 (본예산은 국고 100%, 이월비는 기존 값 보존)
      if (b4.budgetDetails) {
        Object.keys(b4.budgetDetails).forEach((catName) => {
          const cat = b4.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                // 비목별 배정
                let mainVal = 0;
                if (catName === "교육∙연구 프로그램 개발∙운영비") mainVal = 172000000;
                else if (catName === "실험∙실습장비 및 기자재 구입∙운영비") mainVal = 95000000;
                else if (catName === "지역 연계∙협업 지원비") mainVal = 4000000;
                else if (catName === "기업 지원∙협력 활동비") mainVal = 9000000;
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
      
      // 3. B4 단위과제 자체의 years 객체 총액 동기화
      if (b4.years) {
        Object.keys(b4.years).forEach((yr) => {
          const y = b4.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_main = 300000000;
            y.budget_national = 300000000;
            y.budget_city = 0;
            // y.budget_carry는 기존에 설정된 값이 있으면 유지 (없으면 기본값 50,000,000원 대칭)
            y.budget_carry = y.budget_carry || 50000000;
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }
      
      // B4 단위과제 총합 예산 값 재동기화
      b4.budget = 300000000;
      b4.budget_2026 = 300000000;
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] B4 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] B4 프로그램 및 예산 업데이트 성공!`);
      }
    }
  }
}

run();
