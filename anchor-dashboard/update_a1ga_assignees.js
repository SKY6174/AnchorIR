// Supabase 원격 DB의 projects_data 테이블의 모든 연차 행 데이터를
// A1가 2차년도 사업계획서 규격(담당자 직급/직위 및 국고/시비 재원 분할)으로 일제히 업데이트하는 마이그레이션 스크립트

import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// .env 파일 직접 파싱 로더
const envFile = fs.readFileSync(".env", "utf8");
const env = Object.fromEntries(envFile.split("\n").filter(Boolean).map(line => {
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) return [line.trim(), ""];
  return [line.substring(0, eqIdx).trim(), line.substring(eqIdx + 1).replace(/["\r]/g, "").trim()];
}));

const supabaseUrl = env.VITE_SUPABASE_URL || "https://qpojcgpdgvzlivjrhrhn.supabase.co";
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 직급 및 재원이 반영된 최신 A1가 프로그램 매핑 데이터셋
const updatedA1gaPrograms = [
  { id: "A1가-S1T1-1", title: "UC-HYPER 교수법 개발(공학/비공학)", budget_2026: 12000000, budget_national: 12000000, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T2-1", title: "주문식 교육과정 운영", budget_2026: 202000000, budget_national: 122000000, budget_city: 80000000, assignee: "정자윤 연구원/이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T2-2", title: "주문식(지역맞춤형) 교육과정 개발 및 개편 보고서", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S1T2-3", title: "주문식 교육과정 자체평가 보고서", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S1T2-4", title: "과정평가형 교육과정개발(3개 학과)", budget_2026: 12000000, budget_national: 12000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S1T2-5", title: "학점교류 교과목 운영", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "서란 연구원/이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T2-6", title: "학과별 실험실습재료비 지원", budget_2026: 100000000, budget_national: 100000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T3-1", title: "특화분야 자격증/전문가 과정 운영", budget_2026: 45000000, budget_national: 45000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S2T4-1", title: "진로개발 통합지원 시스템 개발/운영", budget_2026: 0, budget_national: 0, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S2T5-1", title: "지산학 페스티벌 운영 창의설계 경진대회", budget_2026: 6000000, budget_national: 6000000, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T6-1", title: "개방형설계센터 전문가활용교육 개발 및 운영", budget_2026: 60000000, budget_national: 60000000, budget_city: 0, assignee: "서란 연구원/이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T7-1", title: "울산형 데이터센터 기술인재 양성을 위한 자격증과정 운영", budget_2026: 15000000, budget_national: 15000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S3T7-2", title: "울산형 데이터센터 기술인재 양성을 위한 마이크로디그리 개발", budget_2026: 4000000, budget_national: 4000000, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S3T8-1", title: "표준형 현장실습 교과목 운영", budget_2026: 50000000, budget_national: 50000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S3T9-1", title: "기업 PBL 문제해결 지원과제 운영", budget_2026: 90000000, budget_national: 90000000, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T9-2", title: "전문기술석사과정 워크숍", budget_2026: 4000000, budget_national: 4000000, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T9-3", title: "전공심화 산학 PBL과제", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T10-1", title: "교육환경개선", budget_2026: 300000000, budget_national: 300000000, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T10-2", title: "생성형 AI 지원 플랫폼 구축", budget_2026: 50000000, budget_national: 50000000, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T10-3", title: "실시간 쌍방향 소통 수업 플랫폼 구축", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T10-4", title: "기자재 및 실습장비 구축", budget_2026: 537000000, budget_national: 537000000, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T11-1", title: "ECC플랫폼 구축(2단계)", budget_2026: 15000000, budget_national: 15000000, budget_city: 0, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S4T12-1", title: "특화분야 온라인 교육 콘텐츠 개발", budget_2026: 60000000, budget_national: 60000000, budget_city: 0, assignee: "서란 연구원/이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S4T12-2", title: "AI리터러시 교과목 운영", budget_2026: 50000000, budget_national: 0, budget_city: 50000000, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S4T12-3", title: "전자연구노트 이용료", budget_2026: 0, budget_national: 0, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-1", title: "이전 공공기관 합동 채용설명회 및 취업 아카데미 운영", budget_2026: 5000000, budget_national: 5000000, budget_city: 0, assignee: "김소연 연구원", pdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-2", title: "산학협력 간담회", budget_2026: 6000000, budget_national: 6000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-3", title: "정책연구과제 운영", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "박기범 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-4", title: "강소기업 현장견학 프로그램 운영", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S5T13-5", title: "학과 전공 맞춤형 모듈식 취업캠프", budget_2026: 24000000, budget_national: 24000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S5T13-6", title: "시그니처 클래스 운영", budget_2026: 40000000, budget_national: 40000000, budget_city: 0, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S5T13-7", title: "교직원 역량강화 프로그램 운영", budget_2026: 40000000, budget_national: 40000000, budget_city: 0, assignee: "미지정", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-8", title: "장학금 지급", budget_2026: 240000000, budget_national: 240000000, budget_city: 0, assignee: "이은주 선임연구원/서란 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S5T14-1", title: "벤치마킹", budget_2026: 14000000, budget_national: 14000000, budget_city: 0, assignee: "서란 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } }
];

async function run() {
  console.log("Supabase projects_data 불러오는 중...");
  const { data: rows, error } = await supabase.from("projects_data").select("*");

  if (error) {
    console.error("DB 로드 실패:", error);
    process.exit(1);
  }

  console.log(`총 ${rows.length}개 연차 레코드를 발견했습니다.`);

  for (const row of rows) {
    const list = row.data;
    if (!list || !Array.isArray(list)) continue;

    // A1가 단위과제 찾기
    const aProj = list.find(p => p.id === "A");
    const a1ga = aProj?.units?.find(u => u.id === "A1가");

    if (a1ga && a1ga.programs) {
      console.log(`[연차 ${row.year}] A1가 프로그램 담당자 및 재원 매핑 보완 중...`);
      
      // programs 리스트 매핑 루프
      a1ga.programs.forEach((prog) => {
        const updateInfo = updatedA1gaPrograms.find(p => p.id === prog.id);
        if (updateInfo) {
          prog.assignee = updateInfo.assignee;
          
          // 다년도 연차 구조 내의 각 연차(1~5) years 객체 정보 갱신
          if (!prog.years) prog.years = {};
          [1, 2, 3, 4, 5].forEach((yr) => {
            if (!prog.years[yr]) {
              prog.years[yr] = { budget_main: prog.budget_2026 || 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
            }
            const y = prog.years[yr];
            // 2차년도(selectedYear = 2)에 해당하는 본예산 국고/시비 상세 분할
            if (parseInt(yr, 10) === 2) {
              y.budget_national = updateInfo.budget_national;
              y.budget_city = updateInfo.budget_city;
            } else {
              // 기타 차년도는 100% 국고 기본 매핑
              y.budget_national = y.budget_main || y.budget_2026 || 0;
              y.budget_city = 0;
            }
            
            // 비목별 예산 리스트 내의 매칭된 비목에도 국고/시비 반영
            if (y.budget_categories && Array.isArray(y.budget_categories)) {
              y.budget_categories.forEach((cat) => {
                if (updateInfo.budget_city > 0) {
                  if (updateInfo.id === "A1가-S1T2-1" && cat.category === "교육∙연구 프로그램 개발∙운영비") {
                    cat.budget_national = 112000000;
                    cat.budget_city = 80000000;
                  } else if (updateInfo.id === "A1가-S4T12-2" && cat.category === "교육∙연구 프로그램 개발∙운영비") {
                    cat.budget_national = 0;
                    cat.budget_city = 50000000;
                  } else {
                    cat.budget_national = parseInt(String(cat.budget || "0").replace(/,/g, ""), 10) || 0;
                    cat.budget_city = 0;
                  }
                } else {
                  cat.budget_national = parseInt(String(cat.budget || "0").replace(/,/g, ""), 10) || 0;
                  cat.budget_city = 0;
                }
              });
            }
          });
        }
      });

      // 💡 [단위과제 레벨 롤업 동기화]
      if (a1ga.budgetDetails) {
        Object.keys(a1ga.budgetDetails).forEach((catName) => {
          const cat = a1ga.budgetDetails[catName];
          if (cat.years) {
            Object.keys(cat.years).forEach((yr) => {
              const y = cat.years[yr];
              if (parseInt(yr, 10) === 2) {
                if (catName === "교육∙연구 프로그램 개발∙운영비") {
                  y.budget_national = 614000000;
                  y.budget_city = 130000000;
                } else {
                  y.budget_national = y.budget_main || 0;
                  y.budget_city = 0;
                }
              } else {
                y.budget_national = y.budget_main || 0;
                y.budget_city = 0;
              }
            });
          }
        });
      }

      if (a1ga.years) {
        Object.keys(a1ga.years).forEach((yr) => {
          const y = a1ga.years[yr];
          if (parseInt(yr, 10) === 2) {
            y.budget_national = 1961000000;
            y.budget_city = 130000000;
          } else {
            y.budget_national = y.budget_main || 0;
            y.budget_city = 0;
          }
        });
      }

      // DB에 수정된 json 업데이트
      const { error: updateError } = await supabase
        .from("projects_data")
        .update({ data: list })
        .eq("year", row.year);

      if (updateError) {
        console.error(`[연차 ${row.year}] 업데이트 실패:`, updateError);
      } else {
        console.log(`[연차 ${row.year}] 업데이트 성공!`);
      }
    }
  }

  console.log("마이그레이션이 완료되었습니다.");
}

run();
