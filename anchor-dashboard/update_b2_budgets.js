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

const updatedB2Programs = [
  { id: "B2가-S1T1-1", title: "AWS C3 인증센터 구축", budget_2026: 100000000, assignee: "임은애 선임연구원", category: "교육∙연구 환경개선비" },
  { id: "B2가-S1T2-1", title: "AI Lab 환경개선 / [인센티브] 사업전담직원 전산기기 및 사무실 구축", budget_2026: 20000000, assignee: "임은애 선임연구원", category: "교육∙연구 환경개선비" },
  { id: "B2가-S1T3-1", title: "AI·DX 교직원역량강화", budget_2026: 20000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B2가-S1T4-1", title: "AI·DX 실습재료비", budget_2026: 9000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B2가-S2T5-1", title: "AICE 자격증 과정 운영", budget_2026: 12000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B2가-S2T6-1", title: "AI·DX 특화교육과정 운영", budget_2026: 20000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B2가-S2T7-1", title: "SLM 챗봇 기반 교과운영 / [인센티브] 기술교육용 LLM 챗봇 개발 정책과제 운영", budget_2026: 3000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B2가-S2T8-1", title: "AI·DX 자문·컨설팅", budget_2026: 10000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T9-1", title: "AI·DX 기술사업화 지원", budget_2026: 10000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T9-2", title: "AI·DX 산학연구 등 기술지원", budget_2026: 5000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T10-1", title: "[초광역] AI 지역문제해결 프로젝트", budget_2026: 15000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" },
  { id: "B2가-S3T11-1", title: "AI·DX 산학공동연구개발과제", budget_2026: 60000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T12-1", title: "Physical AIoT(제조AI) 교육기자재(Jetson nano 기반) / Physical AI 시뮬레이션 SW / Physical AI(MFEC) 실습장비 / Physical AI 자율주행 실습장비 / [인센티브] Physical AI 디지털 트윈제작장비", budget_2026: 325000000, assignee: "임은애 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "B2가-S3T17-1", title: "제조AI(스마트공장) 실습장비 / nvidia Jetson Thor(로봇제어기) / A6000 워크스테이션 / A6000용 모니터 / [인센티브] AI 추론용 데스크탑", budget_2026: 216000000, assignee: "임은애 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "B2가-S3T18-1", title: "AI Worker(휴머노이드 로봇) / 2DoF 로봇 핸드 / 데이터시각화 SW / [인센티브] AI매니퓰레이터 고급형(교육용)", budget_2026: 105000000, assignee: "임은애 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비" },
  { id: "B2가-S3T13-1", title: "AI·DX 초광역 거버넌스 운영", budget_2026: 10000000, assignee: "임은애 선임연구원", category: "성과 활용∙확산 지원비" },
  { id: "B2가-S3T13-2", title: "AI·DX 세미나", budget_2026: 15000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T13-3", title: "AX 프론티어동아리", budget_2026: 15000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T14-1", title: "AI·DX 재직자교육", budget_2026: 10000000, assignee: "임은애 선임연구원", category: "기업 지원∙협력 활동비" },
  { id: "B2가-S3T14-2", title: "울산 청년 AX 리더십 컨소시엄", budget_2026: 20000000, assignee: "임은애 선임연구원", category: "지역 연계∙협업 지원비" },
  { id: "B2가-S3T15-1", title: "AI·DX 서포터즈 활동비 / [인센티브] 울산MANI 프로그램 개발", budget_2026: 5000000, assignee: "임은애 선임연구원", category: "성과 활용∙확산 지원비" },
  { id: "B2가-S3T19-1", title: "[초광역] AWS 해커톤", budget_2026: 15000000, assignee: "임은애 선임연구원", category: "교육∙연구 프로그램 개발∙운영비" }
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
    const b2 = bProj?.units?.find(u => u.id === "B2");
    
    if (b2) {
      console.log(`\n[연차 ${row.year}] B2 단위과제 프로그램 리스트 최신화 시작...`);
      
      // 1. 기존 프로그램 리스트 21건을 2차년도 기준 22건 신규 정의로 완전히 교체
      b2.programs = updatedB2Programs.map((up) => {
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
      
      // 2. B2 단위과제 자체의 budgetDetails 비목 요약 갱신 (본예산은 국고 100%, 이월비는 기존 값 보존)
      if (b2.budgetDetails) {
        Object.keys(b2.budgetDetails).forEach((catName) => {
          const cat = b2.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                // 비목별 배정
                let mainVal = 0;
                if (catName === "교육∙연구 프로그램 개발∙운영비") mainVal = 94000000;
                else if (catName === "교육∙연구 환경개선비") mainVal = 120000000;
                else if (catName === "실험∙실습장비 및 기자재 구입∙운영비") mainVal = 646000000;
                else if (catName === "지역 연계∙협업 지원비") mainVal = 20000000;
                else if (catName === "기업 지원∙협력 활동비") mainVal = 125000000;
                else if (catName === "성과 활용∙확산 지원비") mainVal = 15000000;
                
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
      
      // 3. B2 단위과제 자체의 years 객체 총액 동기화 (6.5억 -> 10.2억으로 상향 조정)
      if (b2.years) {
        Object.keys(b2.years).forEach((yr) => {
          const y = b2.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_main = 1020000000;
            y.budget_national = 1020000000;
            y.budget_city = 0;
            // carry는 기존에 설정된 값이 있으면 유지 (B2의 carry는 3억 원)
            y.budget_carry = y.budget_carry || 300000000;
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }
      
      // B2 단위과제 총합 예산 값 재동기화
      b2.budget = 1020000000;
      b2.budget_2026 = 1020000000;
      
      // 원격 DB 갱신
      const { error: updateError } = await supabase
        .from('projects_data')
        .update({ data: list })
        .eq('year', row.year);
        
      if (updateError) {
        console.error(`[연차 ${row.year}] B2 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] B2 프로그램 및 예산 업데이트 성공!`);
      }
    }
  }
}

run();
