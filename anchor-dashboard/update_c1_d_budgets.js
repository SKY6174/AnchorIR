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

const c1Programs = [
  { id: "C1-S1T1-1", title: "아카데미별 거버넌스 운영", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S1T1-2", title: "평생학습관 환경개선", budget: 75000000, category: "교육∙연구 환경개선비", assignee: "이연향" },
  { id: "C1-S1T1-3", title: "평생직업교육관련 기자재", budget: 30000000, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "이연향" },
  { id: "C1-S1T2-1", title: "평생학습 박람회 및 성과공유회", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S1T3-1", title: "자체홈페이지플랫폼구축으로 변경필요(예산미정)", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S1T4-1", title: "자체홈페이지플랫폼구축으로 변경필요(예산미정)", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S2T5-1", title: "자격증 취득지원", budget: 4000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S2T6-1", title: "성인학습자 학과 환경개선", budget: 95000000, category: "교육∙연구 환경개선비", assignee: "이연향" },
  { id: "C1-S2T6-2", title: "성인학습자 학과 기자재 구축", budget: 20000000, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "이연향" },
  { id: "C1-S2T7-1", title: "평생직업교육활성화 정책연구", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S3T8-1", title: "평생직업교육활성화 정책연구", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S3T9-1", title: "평생학습 박람회 및 성과공유회", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S3T10-1", title: "평생직업교육과정 개발", budget: 6000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S3T11-1", title: "성인학습자 학습지원 프로그램", budget: 12000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S3T11-2", title: "평생교육참여학습자장학금", budget: 10000000, category: "장학금", assignee: "이연향" },
  { id: "C1-S3T11-3", title: "운영보조인력 지원", budget: 2000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S4T12-1", title: "스마트테크 아카데미 교육프로그램운영", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S4T12-2", title: "라이프케어아카데미 교육프로그램운영", budget: 25000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S4T13-1", title: "평생직업교육과정 개발", budget: 6000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S4T14-1", title: "로컬창업아카데미 교육프로그램운영", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" },
  { id: "C1-S4T14-2", title: "팝업아카데미 교육프로그램운영", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "이연향" }
];

const d1Programs = [
  { id: "D1-S1T1-1", title: "지역사회문제해결교육과정 Re:Think 울산 운영", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T1-2", title: "지역사회문제해결 프로젝트(캡스톤디자인)", budget: 15000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T1-3", title: "지역사회문제해결 동아리 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T1-4", title: "지역사회문제해결역량강화교육(재학생)", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T1-5", title: "실험실습재료비", budget: 10000000, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "김소정" },
  { id: "D1-S1T2-1", title: "지역협력협의체운영", budget: 6000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D1-S1T2-2", title: "지역기관과의 거버넌스 구축", budget: 6000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "최승혜" },
  { id: "D1-S1T2-3", title: "지역문제해결 플랫폼 구축", budget: 2000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T3-1", title: "지역사회문제해결 리빙랩 운영", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T3-2", title: "Day Out in 울산 프로그램 운영", budget: 24000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T4-1", title: "지역사회모델 정책연구", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T4-2", title: "지역사회문제해결역량강화교육(지역주민)", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T5-1", title: "지역사회연계 워크숍 및 특강", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T5-2", title: "지역사회문제해결 토론회", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T6-1", title: "지역문제해결 공동 프로그램 운영", budget: 40000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T7-1", title: "지역사회연계봉사프로그램", budget: 12000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T8-1", title: "울산형 2주기 RISE모델 개발 정책연구", budget: 50000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T8-2", title: "지역문제해결 프로젝트 성과공유회", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" },
  { id: "D1-S1T8-3", title: "지역협력협의체&거버넌스 성과공유회", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "김소정" }
];

const d2Programs = [
  { id: "D2-S1T1-1", title: "지산학 보건 거버넌스 구축 및 운영", budget: 3000000, category: "성과 활용∙확산 지원비", assignee: "박인숙" },
  { id: "D2-S1T2-1", title: "맞춤형 보건복지 서비스 역량강화를 위한 기자재 & 장비", budget: 50000000, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "박인숙" },
  { id: "D2-S1T2-2", title: "신규학과 (반려동물/K-뷰티/외국인요양보호사) 기자재 & 장비", budget: 100000000, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "박인숙" },
  { id: "D2-S1T3-1", title: "사회적약자 의료케어 역량강화교육 프로그램 운영(주민참여형)", budget: 11000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S1T3-2", title: "교내 시설 활용 주민참여 프로그램 운영", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S1T4-1", title: "AI 보건의료 빅데이터 교육 프로그램 운영", budget: 9000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S1T4-2", title: "지역의료기관 연계 사업 운영", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S1T5-1", title: "사회적약자 의료케어 모니터링 프로그램 운영", budget: 21000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S1T6-1", title: "사회적약자 보건복지서비스 역량강화 프로그램 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S2T7-1", title: "공공보건 의료데이터와 AI혁신 챌린지 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S2T7-2", title: "보건복지서비스 역량강화 전문인력양성 혁신 프로그램 운영", budget: 30000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S2T8-1", title: "지역정주형 보건의료 인재 역량강화 프로그램 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S2T9-1", title: "지역 연계형 보건복지 취업역량 강화 프로그램 운영", budget: 30000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "박인숙" },
  { id: "D2-S2T10-1", title: "신규학과 개설&지원을 위한 통합형 보건인재 양성 교육환경 개선 + 외국인요양보호사", budget: 136000000, category: "교육∙연구 환경개선비", assignee: "박인숙" }
];

const d3Programs = [
  { id: "D3-S1T1-1", title: "문화 콘텐츠 개발 우수 사례 및 벤치마킹", budget: 5000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S1T1-2", title: "국중박 벤치마킹", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S1T1-3", title: "(이월사업)(문화/도시재생 체험 프로그램)북구 이화정 벤치마킹", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S1T1-4", title: "K-컬처 글로벌 교류 프로젝트: 대만 충유대 교류 프로그램", budget: 28400000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S1T1-5", title: "(이월사업)(문화/도시재생 체험 프로그램)울리단길 런케이션", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S1T2-1", title: "콘텐츠 크리에이터 연계 프로젝트(실무 프로젝트)", budget: 30000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S1T2-2", title: "(이월사업)(콘텐츠 크리에이터 양성프로그램 심화과정)세계유산 도시 울산, 첫 페이지를 열다", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S1T3-1", title: "도시재생 체험 프로젝트", budget: 40000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S1T3-2", title: "대학내 커뮤니티 공간 구축(북카페조성)", budget: 200000000, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "" },
  { id: "D3-S1T3-3", title: "(이월사업)지역 커뮤니티 공간 기자재 구입", budget: 0, category: "실험∙실습장비 및 기자재 구입∙운영비", assignee: "" },
  { id: "D3-S1T4-1", title: "도시공간 재생 프로젝트 거버넌스 운영", budget: 1000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S1T4-2", title: "서포터즈 활동비", budget: 4000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S2T5-1", title: "문화 예술 체험 프로젝트", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S2T6-1", title: "지역 연계 협업 예술 프로젝트(중구 배움의 뜰, 평생교육학습 축제예정)", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S2T6-2", title: "①힙합라운지-청년문화체험", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T6-3", title: "②대학이 여는 도시재생-그래피티 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T6-4", title: "③지산학 페스티벌-그래피티 부스 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T6-5", title: "④문화-도시 재생 네트워킹 라운드 테이블", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T6-6", title: "⑤3개대학 연합 문화관광 서포터즈 발대식", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T7-1", title: "지역사회 연계 및 교류 홍보", budget: 10000000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" },
  { id: "D3-S2T7-2", title: "지산학 실내 부스 센터별 지원금", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T7-3", title: "(이월사업)(성과활용확산)세계인의 날 연계 전통문화체험 부스 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T7-4", title: "(이월사업)(성과활용확산)도시재생 거버넌스 운영", budget: 0, category: "교육∙연구 프로그램 개발∙운영비", assignee: "" },
  { id: "D3-S2T8-1", title: "지역 연계협업 문화 콘텐츠 개발 프로젝트", budget: 40600000, category: "교육∙연구 프로그램 개발∙운영비", assignee: "오영경" }
];

async function run() {
  console.log("Supabase projects_data 로드 중...");
  const { data: rows, error } = await supabase.from('projects_data').select('*');
  
  if (error) {
    console.error("DB 로드 실패:", error);
    process.exit(1);
  }
  
  for (const row of rows) {
    const list = row.data;
    if (!list || !Array.isArray(list)) continue;
    
    // C 프로젝트 찾기
    const cProj = list.find(p => p.id === "C");
    const c1 = cProj?.units?.find(u => u.id === "C1");
    if (c1) {
      console.log(`[연차 ${row.year}] C1 단위과제 최신화...`);
      c1.manager = "이연향 연구원";
      c1.budget = 350000000;
      c1.budget_2026 = 0;
      c1.budget_2025_carry = 350000000;
      c1.spent = 0;
      
      c1.programs = c1Programs.map(up => {
        return {
          id: up.id,
          title: up.title,
          budget_2026: 0,
          spent_2026: 0,
          budget_2025_carry: up.budget,
          spent_2025_carry: 0,
          assignee: up.assignee + " 연구원",
          pdca: { p: "완료", d: "진행", c: "대기", a: "대기" },
          timeline: ",,P,D,C,A,,,,,,",
          budget_categories: up.budget > 0 ? [{ category: up.category, budget_2026: 0, spent_2026: 0, budget_2025_carry: up.budget, spent_2025_carry: 0 }] : []
        };
      });

      c1.budgetDetails = {
        "인건비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
        "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 10000000, spent_2025_carry: 0 },
        "교육∙연구 프로그램 개발∙운영비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 120000000, spent_2025_carry: 0 },
        "교육∙연구 환경개선비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 170000000, spent_2025_carry: 0 },
        "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 50000000, spent_2025_carry: 0 },
        "지역 연계∙협업 지원비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
        "기업 지원∙협력 활동비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
        "성과 활용∙확산 지원비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
        "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
        "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
      };
    }

    // D 프로젝트 찾기
    const dProj = list.find(p => p.id === "D");
    if (dProj) {
      const d1 = dProj.units?.find(u => u.id === "D1");
      if (d1) {
        console.log(`[연차 ${row.year}] D1 단위과제 최신화...`);
        d1.manager = "김소정 연구원";
        d1.budget = 200000000;
        d1.budget_2026 = 200000000;
        d1.budget_2025_carry = 0;
        d1.spent = 0;
        
        d1.programs = d1Programs.map(up => {
          return {
            id: up.id,
            title: up.title,
            budget_2026: up.budget,
            spent_2026: 0,
            budget_2025_carry: 0,
            spent_2025_carry: 0,
            assignee: up.assignee + " 연구원",
            pdca: { p: "완료", d: "진행", c: "대기", a: "대기" },
            timeline: ",,P,D,C,A,,,,,,",
            budget_categories: up.budget > 0 ? [{ category: up.category, budget_2026: up.budget, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }] : []
          };
        });

        d1.budgetDetails = {
          "인건비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 190000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 환경개선비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "지역 연계∙협업 지원비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        };
      }

      const d2 = dProj.units?.find(u => u.id === "D2");
      if (d2) {
        console.log(`[연차 ${row.year}] D2 단위과제 최신화...`);
        d2.manager = "박인숙 연구원";
        d2.budget = 400000000;
        d2.budget_2026 = 400000000;
        d2.budget_2025_carry = 0;
        d2.spent = 0;
        
        d2.programs = d2Programs.map(up => {
          return {
            id: up.id,
            title: up.title,
            budget_2026: up.budget,
            spent_2026: 0,
            budget_2025_carry: 0,
            spent_2025_carry: 0,
            assignee: up.assignee + " 연구원",
            pdca: { p: "완료", d: "진행", c: "대기", a: "대기" },
            timeline: ",,P,D,C,A,,,,,,",
            budget_categories: up.budget > 0 ? [{ category: up.category, budget_2026: up.budget, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }] : []
          };
        });

        d2.budgetDetails = {
          "인건비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 111000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 환경개선비": { budget_2026: 136000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 150000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "지역 연계∙협업 지원비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 3000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        };
      }

      const d3 = dProj.units?.find(u => u.id === "D3");
      if (d3) {
        console.log(`[연차 ${row.year}] D3 단위과제 최신화...`);
        d3.manager = "오영경 연구원";
        d3.budget = 379000000;
        d3.budget_2026 = 379000000;
        d3.budget_2025_carry = 0;
        d3.spent = 0;
        
        d3.programs = d3Programs.map(up => {
          return {
            id: up.id,
            title: up.title,
            budget_2026: up.budget,
            spent_2026: 0,
            budget_2025_carry: 0,
            spent_2025_carry: 0,
            assignee: up.assignee ? up.assignee + " 연구원" : "",
            pdca: { p: "완료", d: "진행", c: "대기", a: "대기" },
            timeline: ",,P,D,C,A,,,,,,",
            budget_categories: up.budget > 0 ? [{ category: up.category, budget_2026: up.budget, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }] : []
          };
        });

        d3.budgetDetails = {
          "인건비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 174000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 환경개선비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 200000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "지역 연계∙협업 지원비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        };
      }
    }

    // DB 업데이트
    console.log(`Supabase 로 레코드 업데이트 반영 중 (ID: ${row.id})`);
    const { error: upErr } = await supabase.from('projects_data').update({ data: list }).eq('id', row.id);
    if (upErr) {
      console.error(`레코드 ${row.id} 업데이트 실패:`, upErr);
    } else {
      console.log(`레코드 ${row.id} 업데이트 완료!`);
    }
  }
  
  console.log("\n모든 C1 및 D1, D2, D3 단위과제 DB 데이터 마이그레이션이 완료되었습니다!");
}

run();
