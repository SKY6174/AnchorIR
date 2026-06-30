// 앵커 사업비 및 성과지표 통합 Mock 데이터 모델 (본사업비/이월비 분리 및 실명 조직도 매핑)

export const initialProjectsData = [
  {
    id: "A",
    title: "프로젝트 A: 정주형 실전인재 양성",
    budget: 2810000000,
    spent: 1405000000,
    units: [
      {
        id: "A1가",
        title: "UC-HYPER 전문기술인재 양성",
        budget: 1884000000,
        spent: 0,
        budget_2026: 1884000000,
        spent_2026: 0,
        budget_2025_carry: 0,
        spent_2025_carry: 0,
        manager: "이동은 ECC센터장",
        programs: [
          { id: "A1가-01", title: "UC-HYPER 교수법 개발(공학/비공학)", budget_2026: 12000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-02", title: "주문식 교육과정 운영", budget_2026: 202000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-03", title: "주문식(지역맞춤형) 교육과정 개발 및 개편 보고서", budget_2026: 20000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-04", title: "주문식 교육과정 자체평가 보고서", budget_2026: 20000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-05", title: "과정평가형 교육과정개발(3개 학과)", budget_2026: 12000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-06", title: "학점교류 교과목 운영", budget_2026: 20000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "서란 연구원, 이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-07", title: "학과별 실험실습재료비 지원", budget_2026: 100000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-08", title: "특화분야 자격증/전문가 과정 운영", budget_2026: 45000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-09", title: "지산학 페스티벌 운영 창의설계 경진대회", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-10", title: "개방형설계센터 전문가활용교육 개발 및 운영", budget_2026: 60000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "서란 연구원, 이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-11", title: "교직원 역량강화 프로그램 운영", budget_2026: 40000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-12", title: "울산형 데이터센터 기술인재 양성을 위한 자격증과정 운영", budget_2026: 15000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-13", title: "울산형 데이터센터 기술인재 양성을 위한 마이크로디그리 개발", budget_2026: 4000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-14", title: "표준형 현장실습 교과목 운영", budget_2026: 50000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-15", title: "기업 PBL 문제해결 지원과제 운영", budget_2026: 90000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-16", title: "전문기술석사 과정 워크숍", budget_2026: 4000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-17", title: "전공심화 산학 PBL과제", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-18", title: "교육환경개선", budget_2026: 300000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-19", title: "생성형 AI 지원 플랫폼 구축", budget_2026: 50000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-20", title: "실시간 쌍방향 소통 수업 플랫폼 구축", budget_2026: 20000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-21", title: "기자재 및 실습장비 구축", budget_2026: 546000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-22", title: "ECC플랫폼 구축(2단계)", budget_2026: 15000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-23", title: "특화분야 온라인 교육 콘텐츠 개발", budget_2026: 60000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "서란 연구원, 이은주 선임연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-24", title: "AI리터러시 교과목 운영", budget_2026: 50000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-25", title: "전자연구노트 이용료", budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-26", title: "이전 공공기관 합동 채용설명회 및 취업 아카데미 운영", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김소연 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-27", title: "산학협력 간담회", budget_2026: 6000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-28", title: "정책연구", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "박기범 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-29", title: "강소기업 현장견학 프로그램 운영", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-30", title: "학과 전공 맞춤형 모듈식 취업캠프", budget_2026: 24000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정지윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-31", title: "시그니처 클래스 운영", budget_2026: 40000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정자윤 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1가-32", title: "벤치마킹", budget_2026: 14000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "서란 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 200000000, spent_2026: 60000000, budget_2025_carry: 30000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 220000000, spent_2026: 50000000, budget_2025_carry: 47000000, spent_2025_carry: 15000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 800000000, spent_2026: 411000000, budget_2025_carry: 212000000, spent_2025_carry: 115000000 },
          "교육∙연구 환경개선비": { budget_2026: 300000000, spent_2026: 100000000, budget_2025_carry: 100000000, spent_2025_carry: 50000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 550000000, spent_2026: 70000000, budget_2025_carry: 100000000, spent_2025_carry: 45000000 },
          "지역 연계∙협업 지원비": { budget_2026: 15000000, spent_2026: 4000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "기업 지원∙협력 활동비": { budget_2026: 10000000, spent_2026: 2000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "성과 활용∙확산 지원비": { budget_2026: 5000000, spent_2026: 3000000, budget_2025_carry: 4000000, spent_2025_carry: 2000000 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-1",
            name: "지역 맞춤형 교과과정 혁신지수",
            type: "자율",
            description: "주류 및 신산업 연계 주문식 교육과정 개발 건수 및 강의 만족도 조사 지표",
            formula: "(주문식 교육개발 달성률 * 0.6) + (강의만족도 달성률 * 0.4)",
            cycle: "연 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "L-1-1",
                name: "신규 주문식 교육과정 개발 건수",
                unit: "건",
                years: {
                  1: { target: 28, current: 35 },
                  2: { target: 5.0, current: 4.0 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              },
              {
                id: "L-1-2",
                name: "주문식 교육 교재 개발 성과 건수",
                unit: "건",
                years: {
                  1: { target: 100, current: 98.8 },
                  2: { target: 10.0, current: 9.0 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 16.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-2",
            name: "현장실습 참여성과지수",
            type: "자율",
            description: "이차전지/조선 등 울산 핵심 분야 산업체 현장실습 이수 학생 수 및 만족도",
            formula: "(이수학생 달성률 * 0.7) + (실습 만족도 달성률 * 0.3)",
            cycle: "반기별 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "L-2-1",
                name: "핵심 분야 현장실습 참여 이수 인원",
                unit: "명",
                years: {
                  1: { target: 100, current: 1266 },
                  2: { target: 200.0, current: 160.0 },
                  3: { target: 220.0, current: 0 },
                  4: { target: 240.0, current: 0 },
                  5: { target: 260.0, current: 0 }
                }
              },
              {
                id: "L-2-2",
                name: "참여 학생 현장실습 만족 평점",
                unit: "점",
                years: {
                  1: { target: 90, current: 98.64 },
                  2: { target: 95.0, current: 85.0 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-1",
            name: "지역 정주 교육 지수",
            type: "중점",
            description: "앵커 취업연계 교육 후 울산 관내 기업 취업 및 1년 이상 정착 유지 비율",
            formula: "(울산 취업 정주율 달성률 * 0.8) + (취업 연계 만족도 * 0.2)",
            cycle: "연 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "U-1-1",
                name: "울산 관내 기업 취업생 수",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 80.0, current: 72.0 },
                  3: { target: 90.0, current: 0 },
                  4: { target: 100.0, current: 0 },
                  5: { target: 110.0, current: 0 }
                }
              },
              {
                id: "U-1-2",
                name: "취업 후 1년 이상 관내 거주 유지율",
                unit: "%",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 85.0, current: 76.5 },
                  3: { target: 87.0, current: 0 },
                  4: { target: 89.0, current: 0 },
                  5: { target: 90.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "A1나",
        title: "신산업특화 전문기술인재 양성",
        budget: 310000000,
        spent: 47795700,
        budget_2026: 310000000,
        spent_2026: 47795700,
        budget_2025_carry: 0,
        spent_2025_carry: 0,
        manager: "홍진숙 신산업특화센터장",
        programs: [
          { id: "A1나-01", title: "융합전공 세미나", budget_2026: 2000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-02", title: "이수학생 장학금 - 30명", budget_2026: 8000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-03", title: "역량 디지털배지", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-04", title: "학과 홍보물 구입", budget_2026: 3000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-05", title: "지역 고교 입시 담당자 협의회", budget_2026: 2400000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-06", title: "스마트·친환경 선박 직무역량강화 연수", budget_2026: 3000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-07", title: "혁신적 교수법 역량강화 연수", budget_2026: 3000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-08", title: "교원 연수 프로그램", budget_2026: 7000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-09", title: "교육과정 운영 고도화 워크숍", budget_2026: 1500000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-10", title: "챌린지 프로젝트(캡스톤디자인)", budget_2026: 7500000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-11", title: "옵니버스 교과목 운영 및 개선", budget_2026: 2000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-12", title: "융합전공 동아리 운영", budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-13", title: "재학생 성과공유대회", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-14", title: "지·산·학 페스티벌", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-15", title: "자율운항보트 경진대회", budget_2026: 20000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-16", title: "4-station 운영 재료비", budget_2026: 3000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-17", title: "글로벌 챌린지 프로그램", budget_2026: 20000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-18", title: "산업체 X-station OJT", budget_2026: 8000000, spent_2026: 1230000, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-19", title: "학교 밖 수업", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-20", title: "산업체 디지털전환 교육 (HMC)", budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-21", title: "산업체 맞춤형 비교과 전문가과정", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-22", title: "진로역량개발을 위한 자격증 과정", budget_2026: 7000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-23", title: "진로역량강화 학생 연수 프로그램(대전)", budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-24", title: "진로역량강화 학생 연수 프로그램", budget_2026: 14000000, spent_2026: 12465000, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-25", title: "취업 및 진로 역량 개발 프로그램", budget_2026: 14000000, spent_2026: 13403100, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-26", title: "산업친화형 취업처 발굴", budget_2026: 1000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-27", title: "디지털트윈 스테이션 환경 개선", budget_2026: 15000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-28", title: "정도관리 실습실 환경 개선", budget_2026: 15000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-29", title: "혁신적교수법 강의실 환경 개선", budget_2026: 15000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-30", title: "메이커스페이스 환경", budget_2026: 30000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-31", title: "가상현실 실습실 환경 개선", budget_2026: 10000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-32", title: "현장미러형 기자재", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-33", title: "선체 설계 소프트웨어 리스 (1년)", budget_2026: 21000000, spent_2026: 20697600, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-34", title: "산학연관 거버넌스 구축 확대", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-35", title: "거버넌스 사업참여 활동", budget_2026: 2000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-36", title: "거버넌스 성과공유대회", budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "김나희 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
          { id: "A1나-37", title: "사업 우수성과 공유 (조선학회)", budget_2026: 2600000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "정호성 연구원", pdca: { p: "대기", d: "대기", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 30000000, spent_2026: 20000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "장학금": { budget_2026: 47000000, spent_2026: 15000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 100000000, spent_2026: 30000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 환경개선비": { budget_2026: 100000000, spent_2026: 50000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 100000000, spent_2026: 30000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "지역 연계∙협업 지원비": { budget_2026: 10000000, spent_2026: 2000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 8000000, spent_2026: 2000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 5000000, spent_2026: 1000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-1-나",
            name: "신산업 로봇공학 실무융합지수",
            type: "자율",
            description: "신산업특화 로봇 장비 실습 활용도 및 기업 만족도 종합 평정치",
            formula: "(장비 가동률 달성률 * 0.7) + (자문지도 만족도 달성률 * 0.3)",
            cycle: "분기별 1회",
            owner: "신산업특화센터",
            subItems: [
              {
                id: "L-1-나-1",
                name: "특화분야 전용 실습장비 가동 누적시간",
                unit: "시간",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 800.0, current: 680.0 },
                  3: { target: 900.0, current: 0 },
                  4: { target: 1000.0, current: 0 },
                  5: { target: 1100.0, current: 0 }
                }
              },
              {
                id: "L-1-나-2",
                name: "산업체 기술애로 해소 참여 자문 건수",
                unit: "건",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 10.0, current: 8.0 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "A2",
        title: "글로컬 창업 문화 조성",
        budget: 590000000,
        spent: 220000000,
        budget_2026: 470000000,
        spent_2026: 150000000,
        budget_2025_carry: 120000000,
        spent_2025_carry: 70000000,
        manager: "이동은 ECC센터장",
        programs: [
          { id: "A2-01", title: "재학생 및 교직원 창업 교육과정 운영", budget_2026: 63000000, spent_2026: 30000000, budget_2025_carry: 20000000, spent_2025_carry: 18000000, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "A2-02", title: "창업지원 제도 개선 및 메이커스페이스 구축", budget_2026: 210000000, spent_2026: 70000000, budget_2025_carry: 50000000, spent_2025_carry: 40000000, assignee: "서란 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "A2-03", title: "예비창업자 인큐베이팅 및 AI 경영 교육", budget_2026: 85000000, spent_2026: 30000000, budget_2025_carry: 20000000, spent_2025_carry: 10000000, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
          { id: "A2-04", title: "창업 성공 도약 패키지 지원", budget_2026: 45000000, spent_2026: 8000000, budget_2025_carry: 10000000, spent_2025_carry: 2000000, assignee: "박기범 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "A2-05", title: "로컬 및 글로벌 창업 네트워크 경진대회", budget_2026: 67000000, spent_2026: 12000000, budget_2025_carry: 20000000, spent_2025_carry: 0, assignee: "김소연 연구원", pdca: { p: "진행", d: "대기", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 40000000, spent_2026: 15000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "장학금": { budget_2026: 30000000, spent_2026: 10000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 150000000, spent_2026: 70000000, budget_2025_carry: 38000000, spent_2025_carry: 28000000 },
          "교육∙연구 환경개선비": { budget_2026: 150000000, spent_2026: 30000000, budget_2025_carry: 40000000, spent_2025_carry: 20000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 70000000, spent_2026: 15000000, budget_2025_carry: 10000000, spent_2025_carry: 10000000 },
          "지역 연계∙협업 지원비": { budget_2026: 12000000, spent_2026: 3000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "기업 지원∙협력 활동비": { budget_2026: 13000000, spent_2026: 5000000, budget_2025_carry: 5000000, spent_2025_carry: 1000000 },
          "성과 활용∙확산 지원비": { budget_2026: 5000000, spent_2026: 2000000, budget_2025_carry: 5000000, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-3",
            name: "창업교육 운영성과지수",
            type: "자율",
            description: "글로컬 창업특강 및 인큐베이팅 참여 성인학습자 및 재학생 지수",
            formula: "(특강 수료인원 달성률 * 0.5) + (신규 창업동아리 달성률 * 0.5)",
            cycle: "연 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "L-3-1",
                name: "창업 특화 아카데미 교육 수료 인원",
                unit: "명",
                years: {
                  1: { target: 5, current: 5 },
                  2: { target: 100.0, current: 85.0 },
                  3: { target: 110.0, current: 0 },
                  4: { target: 120.0, current: 0 },
                  5: { target: 130.0, current: 0 }
                }
              },
              {
                id: "L-3-2",
                name: "육성 지원하는 학생 창업동아리 수",
                unit: "개",
                years: {
                  1: { target: 120, current: 110 },
                  2: { target: 10.0, current: 8.5 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-4",
            name: "창업 활성화지수",
            type: "자율",
            description: "신규 발굴 학생/교원 창업 벤처기업 수 및 투자유치 실적",
            formula: "(신규 창업기업수 달성률 * 0.6) + (유치 투자액 달성률 * 0.4)",
            cycle: "반기별 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "L-4-1",
                name: "학생 및 교원 신규 기술창업 기업 수",
                unit: "개",
                years: {
                  1: { target: 8, current: 8 },
                  2: { target: 5.0, current: 4.0 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              },
              {
                id: "L-4-2",
                name: "창업기업 외부 매칭 투자유치 유치액",
                unit: "만원",
                years: {
                  1: { target: 3, current: 3 },
                  2: { target: 20000.0, current: 15000.0 },
                  3: { target: 22000.0, current: 0 },
                  4: { target: 25000.0, current: 0 },
                  5: { target: 30000.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-2",
            name: "창업 문화 확산 지수",
            type: "중점",
            description: "캠퍼스 내 메이커스페이스 장비 가동률 및 학생 참여도 지표",
            formula: "(가동률 달성률 * 0.5) + (참여 이용학생수 달성률 * 0.5)",
            cycle: "분기별 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "U-2-1",
                name: "메이커스페이스 전용 장비 가동률",
                unit: "%",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 70.0, current: 65.0 },
                  3: { target: 75.0, current: 0 },
                  4: { target: 78.0, current: 0 },
                  5: { target: 80.0, current: 0 }
                }
              },
              {
                id: "U-2-2",
                name: "체험 및 교육 참여 재학생 누적 인원",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 500.0, current: 450.0 },
                  3: { target: 550.0, current: 0 },
                  4: { target: 600.0, current: 0 },
                  5: { target: 650.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "A3",
        title: "글로벌 협력 거점 대학 육성",
        budget: 300000000,
        spent: 85000000,
        budget_2026: 240000000,
        spent_2026: 60000000,
        budget_2025_carry: 60000000,
        spent_2025_carry: 25000000,
        manager: "이동은 ECC센터장",
        programs: [
          { id: "A3-01", title: "해외 우수 대학 교류 협약 및 네트워크 구축", budget_2026: 80000000, spent_2026: 20000000, budget_2025_carry: 20000000, spent_2025_carry: 10000000, assignee: "이은주 선임연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "A3-02", title: "유학생 통합관리 플랫폼 및 상담지원", budget_2026: 42000000, spent_2026: 1000000, budget_2025_carry: 1200000, spent_2025_carry: 200000, assignee: "서란 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "A3-03", title: "외국인 특화 정규과정 개설 및 장학 지원", budget_2026: 77000000, spent_2026: 20000000, budget_2025_carry: 20000000, spent_2025_carry: 8000000, assignee: "정자윤 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "A3-04", title: "TOPIK 한국어 교육 및 다문화 지원", budget_2026: 41000000, spent_2026: 10000000, budget_2025_carry: 8000000, spent_2025_carry: 5000000, assignee: "박기범 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 20000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 40000000, spent_2026: 10000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 120000000, spent_2026: 35000000, budget_2025_carry: 30000000, spent_2025_carry: 15000000 },
          "교육∙연구 환경개선비": { budget_2026: 20000000, spent_2026: 3000000, budget_2025_carry: 5000000, spent_2025_carry: 1000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 10000000, spent_2026: 1000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "지역 연계∙협업 지원비": { budget_2026: 10000000, spent_2026: 1000000, budget_2025_carry: 5000000, spent_2025_carry: 1000000 },
          "기업 지원∙협력 활동비": { budget_2026: 10000000, spent_2026: 1000000, budget_2025_carry: 2000000, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 10000000, spent_2026: 1000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-23",
            name: "글로벌 역량 강화지수",
            type: "자율",
            description: "외국인 우수교원 확보율 및 글로벌 교류 학기 이수생 비율",
            formula: "(우수교원 달성률 * 0.5) + (이수학생 달성률 * 0.5)",
            cycle: "연 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "L-23-1",
                name: "외국인 전임교원 신규 유치 확보율",
                unit: "%",
                years: {
                  1: { target: 2, current: 2 },
                  2: { target: 12.0, current: 9.6 },
                  3: { target: 13.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              },
              {
                id: "L-23-2",
                name: "해외 파견 및 글로벌 학기 참여 재학생 수",
                unit: "명",
                years: {
                  1: { target: 25, current: 24 },
                  2: { target: 40.0, current: 32.0 },
                  3: { target: 45.0, current: 0 },
                  4: { target: 50.0, current: 0 },
                  5: { target: 55.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-24",
            name: "외국인 학생 유치 정착 지원지수",
            type: "자율",
            description: "해외 유학생 유치 수 및 울산 역내 기업 취업 정주율",
            formula: "(유학생수 달성률 * 0.6) + (유학생정주율 달성률 * 0.4)",
            cycle: "연 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "L-24-1",
                name: "정규과정 입학 외국인 유학생 수",
                unit: "명",
                years: {
                  1: { target: 15, current: 15 },
                  2: { target: 150.0, current: 120.0 },
                  3: { target: 160.0, current: 0 },
                  4: { target: 170.0, current: 0 },
                  5: { target: 180.0, current: 0 }
                }
              },
              {
                id: "L-24-2",
                name: "졸업 외국인 유학생 울산 정주 취업률",
                unit: "%",
                years: {
                  1: { target: 90, current: 85 },
                  2: { target: 30.0, current: 22.0 },
                  3: { target: 32.0, current: 0 },
                  4: { target: 34.0, current: 0 },
                  5: { target: 35.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-12",
            name: "지역정착형 글로벌 교육지수",
            type: "중점",
            description: "유학생 대상 한국어(TOPIK) 4급 이상 합격 및 연계 생활 적응도",
            formula: "(TOPIK 달성률 * 0.8) + (적응도 달성률 * 0.2)",
            cycle: "반기별 1회",
            owner: "ECC센터",
            subItems: [
              {
                id: "U-12-1",
                name: "TOPIK 4급 취득 외국인 유학생 수",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 80.0, current: 60.0 },
                  3: { target: 85.0, current: 0 },
                  4: { target: 90.0, current: 0 },
                  5: { target: 95.0, current: 0 }
                }
              },
              {
                id: "U-12-2",
                name: "다문화 공동체 멘토링 만족도",
                unit: "점",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 95.0, current: 75.0 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "B",
    title: "프로젝트 B: 지산학연 초연결 생태계 조성",
    budget: 1970000000,
    spent: 890000000,
    units: [
      {
        id: "B1",
        title: "주력·신산업 분야 산학협력 체계 구축",
        budget: 450000000,
        spent: 180000000,
        budget_2026: 350000000,
        spent_2026: 120000000,
        budget_2025_carry: 100000000,
        spent_2025_carry: 60000000,
        manager: "김기범 ICC센터장",
        programs: [
          { id: "B1-01", title: "기업협업센터(ICC) 고도화 및 교원 역량 강화", budget_2026: 38000000, spent_2026: 21000000, budget_2025_carry: 10000000, spent_2025_carry: 10000000, assignee: "이정은 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B1-02", title: "지산학 거버넌스 및 신규 가족회사 매칭", budget_2026: 14000000, spent_2026: 6000000, budget_2025_carry: 4000000, spent_2025_carry: 3000000, assignee: "이혜성 연구원", pdca: { p: "완료", d: "완료", c: "완료", a: "진행" } },
          { id: "B1-03", title: "대기업 및 신산업 연계 공동 R&D 과제 수행", budget_2026: 270000000, spent_2026: 80000000, budget_2025_carry: 76000000, spent_2025_carry: 40000000, assignee: "도지은 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B1-04", title: "중소기업 기술 애로 해결 자문 지도", budget_2026: 28000000, spent_2026: 13000000, budget_2025_carry: 10000000, spent_2025_carry: 7000000, assignee: "김예담 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 30000000, spent_2026: 10000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 90000000, spent_2026: 35000000, budget_2025_carry: 20000000, spent_2025_carry: 10000000 },
          "교육∙연구 환경개선비": { budget_2026: 25000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 170000000, spent_2026: 50000000, budget_2025_carry: 60000000, spent_2025_carry: 40000000 },
          "지역 연계∙협업 지원비": { budget_2026: 12000000, spent_2026: 4000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "기업 지원∙협력 활동비": { budget_2026: 20000000, spent_2026: 10000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "성과 활용∙확산 지원비": { budget_2026: 3000000, spent_2026: 3000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-5",
            name: "산학기술 이전 및 기술사업화 성과지수",
            type: "자율",
            description: "산학 공동 특허 출원 등록 및 기술료 수입 실적 지표",
            formula: "(특허출원 달성률 * 0.5) + (기술료 수입 달성률 * 0.5)",
            cycle: "반기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "L-5-1",
                name: "지산학 연계 공동 특허 등록 건수",
                unit: "건",
                years: {
                  1: { target: 10, current: 9 },
                  2: { target: 8.0, current: 6.0 },
                  3: { target: 10.0, current: 0 },
                  4: { target: 11.0, current: 0 },
                  5: { target: 12.0, current: 0 }
                }
              },
              {
                id: "L-5-2",
                name: "체결한 특허기술 기술료 징수액",
                unit: "만원",
                years: {
                  1: { target: 50, current: 48 },
                  2: { target: 3000.0, current: 2000.0 },
                  3: { target: 3500.0, current: 0 },
                  4: { target: 4000.0, current: 0 },
                  5: { target: 5000.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-6",
            name: "기업애로 해결 지원 지수",
            type: "자율",
            description: "가족회사 애로기술 자문 해결 및 경영 기술지도 참여 횟수",
            formula: "(자문해결 달성률 * 0.7) + (만족도 달성률 * 0.3)",
            cycle: "분기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "L-6-1",
                name: "중소기업 애로기술 지도 자문 건수",
                unit: "건",
                years: {
                  1: { target: 15, current: 15 },
                  2: { target: 50.0, current: 44.0 },
                  3: { target: 55.0, current: 0 },
                  4: { target: 60.0, current: 0 },
                  5: { target: 65.0, current: 0 }
                }
              },
              {
                id: "L-6-2",
                name: "지도 자문 수혜업체 종합 만족도",
                unit: "점",
                years: {
                  1: { target: 20, current: 20 },
                  2: { target: 95.0, current: 83.6 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-3",
            name: "산학협력 기반 연구과제 수행 지수",
            type: "중점",
            description: "지방자치단체 및 민간기업 매칭형 공동 연구과제 수주 실적",
            formula: "(매칭수주 달성률 * 0.6) + (참여교원 달성률 * 0.4)",
            cycle: "반기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "U-3-1",
                name: "민간/지자체 공동 연구과제 수주 건수",
                unit: "건",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 10.0, current: 8.0 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              },
              {
                id: "U-3-2",
                name: "산학협력 연구에 참여한 교원 인원",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 30.0, current: 24.0 },
                  3: { target: 35.0, current: 0 },
                  4: { target: 40.0, current: 0 },
                  5: { target: 45.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "B2",
        title: "AID 역량강화 기반 지역산업 전환 지원",
        budget: 1320000000,
        spent: 450000000,
        budget_2026: 1020000000,
        spent_2026: 300000000,
        budget_2025_carry: 300000000,
        spent_2025_carry: 150000000,
        manager: "김현수 AID-X지원센터장",
        programs: [
          { id: "B2-01", title: "AID-X지원센터 및 AWS C3 교육센터 리모델링", budget_2026: 222000000, spent_2026: 100000000, budget_2025_carry: 72000000, spent_2025_carry: 50000000, assignee: "임은애 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B2-02", title: "교원 대상 AI·DX 실습 및 전문 연수 과정", budget_2026: 35000000, spent_2026: 15000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000, assignee: "서은지 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B2-03", title: "전학부 공통 AI 리터러시 융합 교육 개설", budget_2026: 82000000, spent_2026: 38000000, budget_2025_carry: 20000000, spent_2025_carry: 12000000, assignee: "채민지 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B2-04", title: "중소기업 맞춤형 AI·DX 기술 실증 R&D", budget_2026: 145000000, spent_2026: 60000000, budget_2025_carry: 40000000, spent_2025_carry: 20000000, assignee: "임은애 선임연구원", pdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
          { id: "B2-05", title: "MANI 초광역 협력 로봇 AI 실습 장치 구축", budget_2026: 536000000, spent_2026: 72000000, budget_2025_carry: 158000000, spent_2025_carry: 63000000, assignee: "서은지 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 100000000, spent_2026: 35000000, budget_2025_carry: 30000000, spent_2025_carry: 15000000 },
          "장학금": { budget_2026: 25000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 280000000, spent_2026: 92000000, budget_2025_carry: 70000000, spent_2025_carry: 28000000 },
          "교육∙연구 환경개선비": { budget_2026: 200000000, spent_2026: 80000000, budget_2025_carry: 70000000, spent_2025_carry: 30000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 380000000, spent_2026: 80000000, budget_2025_carry: 120000000, spent_2025_carry: 70000000 },
          "지역 연계∙협업 지원비": { budget_2026: 15000000, spent_2026: 2000000, budget_2025_carry: 4000000, spent_2025_carry: 1000000 },
          "기업 지원∙협력 활동비": { budget_2026: 12000000, spent_2026: 2000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 8000000, spent_2026: 1000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-13",
            name: "AI·DX 관련 교육프로그램 운영성과지수",
            type: "자율",
            description: "신규 개발 개설한 AI 융합 리터러시 교육 교과목 이수율 및 수혜학생 만족도",
            formula: "(이수인원 달성률 * 0.6) + (만족도 달성률 * 0.4)",
            cycle: "반기별 1회",
            owner: "AID-X지원센터",
            subItems: [
              {
                id: "L-13-1",
                name: "AI 융합 전공 교과정 신규 이수 학생",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 300.0, current: 240.0 },
                  3: { target: 330.0, current: 0 },
                  4: { target: 350.0, current: 0 },
                  5: { target: 380.0, current: 0 }
                }
              },
              {
                id: "L-13-2",
                name: "교육과정 체험 및 전공 만족 평점",
                unit: "점",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 95.0, current: 80.0 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-14",
            name: "AI·DX 역량강화 달성지수",
            type: "자율",
            description: "산업체 재직자 및 유관 교원의 AWS C3 자격증 취득 비율",
            formula: "(자격취득 달성률 * 0.8) + (워크숍 개최 달성률 * 0.2)",
            cycle: "반기별 1회",
            owner: "AID-X지원센터",
            subItems: [
              {
                id: "L-14-1",
                name: "AWS 클라우드 교육 자격 취득 인원",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 50.0, current: 32.0 },
                  3: { target: 55.0, current: 0 },
                  4: { target: 60.0, current: 0 },
                  5: { target: 65.0, current: 0 }
                }
              },
              {
                id: "L-14-2",
                name: "교원 대상 AI/DX 기술실습 연수 개최",
                unit: "회",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 5.0, current: 4.0 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-7",
            name: "AI·DX 분야 기술교육 지수",
            type: "중점",
            description: "MANI 협업 로봇 실습 교육 프로그램 이수율 및 만족도",
            formula: "(이수율 달성률 * 0.7) + (기기활용률 달성률 * 0.3)",
            cycle: "연 1회",
            owner: "AID-X지원센터",
            subItems: [
              {
                id: "U-7-1",
                name: "로봇 실습 교육과정 이수 재학생",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 120.0, current: 100.0 },
                  3: { target: 130.0, current: 0 },
                  4: { target: 140.0, current: 0 },
                  5: { target: 150.0, current: 0 }
                }
              },
              {
                id: "U-7-2",
                name: "협업 실습용 로봇 장비 가동률",
                unit: "%",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 80.0, current: 65.0 },
                  3: { target: 82.0, current: 0 },
                  4: { target: 84.0, current: 0 },
                  5: { target: 85.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "B3",
        title: "지·산·학 협력 탄소중립 실천 플랫폼 구축",
        budget: 380000000,
        spent: 140000000,
        budget_2026: 300000000,
        spent_2026: 100000000,
        budget_2025_carry: 80000000,
        spent_2025_carry: 40000000,
        manager: "김기범 ICC센터장",
        programs: [
          { id: "B3-01", title: "탄소중립·ESG 캠퍼스 아카데미 개설 및 운영", budget_2026: 44000000, spent_2026: 25000000, budget_2025_carry: 14000000, spent_2025_carry: 9000000, assignee: "이정은 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B3-02", title: "중소기업 온실가스 탄소배출 모니터링 연구", budget_2026: 207000000, spent_2026: 60000000, budget_2025_carry: 56000000, spent_2025_carry: 26000000, assignee: "이혜성 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B3-03", title: "캠퍼스 내 전동화 배터리 스왑 실증", budget_2026: 49000000, spent_2026: 15000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000, assignee: "도지은 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 25000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 15000000, spent_2026: 4000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 110000000, spent_2026: 45000000, budget_2025_carry: 30000000, spent_2025_carry: 15000000 },
          "교육∙연구 환경개선비": { budget_2026: 40000000, spent_2026: 15000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 90000000, spent_2026: 23000000, budget_2025_carry: 30000000, spent_2025_carry: 17000000 },
          "지역 연계∙협업 지원비": { budget_2026: 8000000, spent_2026: 1000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 10000000, spent_2026: 3000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 2000000, spent_2026: 1000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-15",
            name: "ESG 전문인력 양성 경영실현 지수",
            type: "자율",
            description: "탄소중립 아카데미 및 ESG 컨설팅 교육 수료생 가중 지표",
            formula: "(아카데미이수 달성률 * 0.5) + (ESG컨설팅 달성률 * 0.5)",
            cycle: "연 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "L-15-1",
                name: "ESG 탄소중립 수료 아카데미 학생 수",
                unit: "명",
                years: {
                  1: { target: 40, current: 38 },
                  2: { target: 100.0, current: 82.0 },
                  3: { target: 110.0, current: 0 },
                  4: { target: 120.0, current: 0 },
                  5: { target: 130.0, current: 0 }
                }
              },
              {
                id: "L-15-2",
                name: "학생 연계 ESG 기업 컨설팅 수행 건수",
                unit: "건",
                years: {
                  1: { target: 2, current: 2 },
                  2: { target: 5.0, current: 4.1 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-16",
            name: "탄소중립 지원 실천 지수",
            type: "자율",
            description: "울산 관내 파트너 중소기업 대상 탄소 모니터링 솔루션 구축률",
            formula: "(솔루션구축 달성률 * 0.7) + (탄소감축량 달성률 * 0.3)",
            cycle: "반기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "L-16-1",
                name: "모니터링 솔루션 적용 지원 기업 수",
                unit: "개",
                years: {
                  1: { target: 3, current: 3 },
                  2: { target: 5.0, current: 4.0 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              },
              {
                id: "L-16-2",
                name: "수혜기업 평균 이산화탄소 절감 비율",
                unit: "%",
                years: {
                  1: { target: 2, current: 2 },
                  2: { target: 12.0, current: 9.0 },
                  3: { target: 13.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-8",
            name: "탄소중립 분야 교육운영 지수",
            type: "중점",
            description: "전동화 배터리 스왑 관련 신설 교과목 이수율 및 친환경 만족도",
            formula: "(교과목이수 달성률 * 0.6) + (배터리 실증 장비 가동률 * 0.4)",
            cycle: "연 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "U-8-1",
                name: "배터리 스왑 특화 신규 과목 이수생 수",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 50.0, current: 45.0 },
                  3: { target: 55.0, current: 0 },
                  4: { target: 60.0, current: 0 },
                  5: { target: 65.0, current: 0 }
                }
              },
              {
                id: "U-8-2",
                name: "캠퍼스 내 배터리 스테이션 가동 비율",
                unit: "%",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 90.0, current: 75.0 },
                  3: { target: 92.0, current: 0 },
                  4: { target: 94.0, current: 0 },
                  5: { target: 95.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "B4",
        title: "복합재난 대응 산업안전·보건 통합 운영체계 구축",
        budget: 390000000,
        spent: 120000000,
        budget_2026: 300000000,
        spent_2026: 80000000,
        budget_2025_carry: 90000000,
        spent_2025_carry: 40000000,
        manager: "김기범 ICC센터장",
        programs: [
          { id: "B4-01", title: "산업안전 보건 교육과정 개편 및 K-MOOC 제작", budget_2026: 127000000, spent_2026: 60000000, budget_2025_carry: 37000000, spent_2025_carry: 27000000, assignee: "도지은 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "B4-02", title: "중소기업 공정 안전 진단 및 매뉴얼 배포", budget_2026: 49000000, spent_2026: 8000000, budget_2025_carry: 14000000, spent_2025_carry: 2000000, assignee: "김예담 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "B4-03", title: "간호시뮬레이션센터 실감형 재난 안전 장비 도입", budget_2026: 124000000, spent_2026: 12000000, budget_2025_carry: 39000000, spent_2025_carry: 11000000, assignee: "도지은 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 25000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 12000000, spent_2026: 4000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 110000000, spent_2026: 35000000, budget_2025_carry: 40000000, spent_2025_carry: 15000000 },
          "교육∙연구 환경개선비": { budget_2026: 30000000, spent_2026: 10000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 105000000, spent_2026: 18000000, budget_2025_carry: 30000000, spent_2025_carry: 17000000 },
          "지역 연계∙협업 지원비": { budget_2026: 10000000, spent_2026: 2000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "기업 지원∙협력 활동비": { budget_2026: 5000000, spent_2026: 1000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 3000000, spent_2026: 2000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-11",
            name: "재난 및 산업안전 확산지수",
            type: "자율",
            description: "산업안전 보건교육 K-MOOC 플랫폼 콘텐츠 개발 및 수료 실적",
            formula: "(K-MOOC 개발 달성률 * 0.5) + (교육생 이수 달성률 * 0.5)",
            cycle: "반기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "L-11-1",
                name: "K-MOOC 안전 보건 신규 강좌 개발",
                unit: "건",
                years: {
                  1: { target: 12, current: 12 },
                  2: { target: 4.0, current: 3.0 },
                  3: { target: 5.0, current: 0 },
                  4: { target: 6.0, current: 0 },
                  5: { target: 7.0, current: 0 }
                }
              },
              {
                id: "L-11-2",
                name: "개설 강좌 안전 이수 완료 재직자 수",
                unit: "명",
                years: {
                  1: { target: 3, current: 3 },
                  2: { target: 500.0, current: 375.0 },
                  3: { target: 550.0, current: 0 },
                  4: { target: 600.0, current: 0 },
                  5: { target: 650.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-12",
            name: "재난 및 산업안전 교육성과지수",
            type: "자율",
            description: "시뮬레이터 안전 VR 콘텐츠 체험 교육을 이수한 재직자 수",
            formula: "(체험 이수인원 달성률 * 0.7) + (콘텐츠 신작 달성률 * 0.3)",
            cycle: "분기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "L-12-1",
                name: "안전 VR 시뮬레이터 교육 이수생 수",
                unit: "명",
                years: {
                  1: { target: 80, current: 75 },
                  2: { target: 200.0, current: 150.0 },
                  3: { target: 220.0, current: 0 },
                  4: { target: 240.0, current: 0 },
                  5: { target: 250.0, current: 0 }
                }
              },
              {
                id: "L-12-2",
                name: "신규 개발 도입한 안전 VR 교육 콘텐츠",
                unit: "개",
                years: {
                  1: { target: 15, current: 15 },
                  2: { target: 5.0, current: 3.5 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-6",
            name: "재난대응 분야 교육운영 지수",
            type: "중점",
            description: "중소기업 현장 실증 공정 안전진단 가이드 배포 개수",
            formula: "(매뉴얼 배포 달성률 * 0.6) + (기술지도 만족도 달성률 * 0.4)",
            cycle: "반기별 1회",
            owner: "ICC센터",
            subItems: [
              {
                id: "U-6-1",
                name: "현장 공정 진단 가이드북 배포 개소",
                unit: "개소",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 30.0, current: 24.0 },
                  3: { target: 35.0, current: 0 },
                  4: { target: 40.0, current: 0 },
                  5: { target: 45.0, current: 0 }
                }
              },
              {
                id: "U-6-2",
                name: "산업안전 기술지도 수혜업체 만족도",
                unit: "점",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 95.0, current: 79.8 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "C",
    title: "프로젝트 C: 다시 뛰게 만드는 생애 '직무 도약' 체계 구축",
    budget: 1050000000,
    spent: 420000000,
    units: [
      {
        id: "C1",
        title: "U-LIFE 평생직업교육 기반 취·창업 연계모델 구축",
        budget: 450000000,
        spent: 140000000,
        budget_2026: 350000000,
        spent_2026: 90000000,
        budget_2025_carry: 100000000,
        spent_2025_carry: 50000000,
        manager: "현용환 RCC센터장",
        programs: [
          { id: "C1-01", title: "평생직업교육 거점센터 플랫폼 고도화 및 장학 제도", budget_2026: 44000000, spent_2026: 18000000, budget_2025_carry: 14000000, spent_2025_carry: 6000000, assignee: "이현섭 책임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-02", title: "생애주기 직무 야간 집중 자격증 취득반 운영", budget_2026: 4000000, spent_2026: 200000, budget_2025_carry: 1000000, spent_2025_carry: 0, assignee: "박인숙 선임연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "C1-03", title: "스마트테크 및 라이프케어 4대 아카데미 실무 교육", budget_2026: 82000000, spent_2026: 20000000, budget_2025_carry: 15000000, spent_2025_carry: 10000000, assignee: "이연향 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-04", title: "평생학습관 건물 리모델링 및 실습 기자재 조달", budget_2026: 220000000, spent_2026: 51800000, budget_2025_carry: 70000000, spent_2025_carry: 34000000, assignee: "김소정 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 25000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 15000000, spent_2026: 3000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 110000000, spent_2026: 35200000, budget_2025_carry: 30000000, spent_2025_carry: 15000000 },
          "교육∙연구 환경개선비": { budget_2026: 160000000, spent_2026: 30800000, budget_2025_carry: 50000000, spent_2025_carry: 20000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 30000000, spent_2026: 10000000, budget_2025_carry: 10000000, spent_2025_carry: 10000000 },
          "지역 연계∙협업 지원비": { budget_2026: 6000000, spent_2026: 1000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 3000000, spent_2026: 1000000, budget_2025_carry: 2000000, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 1000000, spent_2026: 1000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-7",
            name: "평생·직업교육 활성화지수",
            type: "자율",
            description: "신중년·재직자 맞춤형 직무도약 아카데미 교육 수료 실적",
            formula: "(아카데미 수료 달성률 * 0.7) + (자격증반 만족도 달성률 * 0.3)",
            cycle: "연 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-7-1",
                name: "직무도약 평생아카데미 이수 학습자",
                unit: "명",
                years: {
                  1: { target: 90, current: 85 },
                  2: { target: 150.0, current: 120.0 },
                  3: { target: 160.0, current: 0 },
                  4: { target: 170.0, current: 0 },
                  5: { target: 180.0, current: 0 }
                }
              },
              {
                id: "L-7-2",
                name: "자격증 취득 지원반 참여 만족도",
                unit: "점",
                years: {
                  1: { target: 90, current: 70 },
                  2: { target: 95.0, current: 65.0 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-8",
            name: "평생·직업교육 프로그램 품질향상지수",
            type: "자율",
            description: "직무 교육 교재 개발 성과 및 현장 교육 피드백 강의 만족도",
            formula: "(교재개발 달성률 * 0.5) + (강의만족도 달성률 * 0.5)",
            cycle: "반기별 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-8-1",
                name: "직무 평생교육 전용 교재 신개발 수",
                unit: "건",
                years: {
                  1: { target: 6, current: 5 },
                  2: { target: 10.0, current: 8.0 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              },
              {
                id: "L-8-2",
                name: "평생교육 학습 참여자 강의 종합 평점",
                unit: "점",
                years: {
                  1: { target: 90, current: 75 },
                  2: { target: 95.0, current: 70.0 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-4",
            name: "성인학습자 지원 지수",
            type: "중점",
            description: "만 25세 이상 성인 신편입학 등록 학생 수 및 학점 인정 실적",
            formula: "(신입학생수 달성률 * 0.6) + (학점부여 달성률 * 0.4)",
            cycle: "연 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "U-4-1",
                name: "만 25세 이상 성인 신편입 등록생 수",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 50.0, current: 35.0 },
                  3: { target: 55.0, current: 0 },
                  4: { target: 60.0, current: 0 },
                  5: { target: 65.0, current: 0 }
                }
              },
              {
                id: "U-4-2",
                name: "평생학습 연계 학점 특별인정 이수율",
                unit: "%",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 80.0, current: 62.0 },
                  3: { target: 82.0, current: 0 },
                  4: { target: 84.0, current: 0 },
                  5: { target: 85.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "C2",
        title: "동남권과 함께 성장하는 돌봄생태계, 울산애(愛) 구현",
        budget: 900000000,
        spent: 280000000,
        budget_2026: 700000000,
        spent_2026: 200000000,
        budget_2025_carry: 200000000,
        spent_2025_carry: 80000000,
        manager: "홍광표 울산늘봄누리센터장",
        programs: [
          { id: "C2-01", title: "초등/유치원 방과후 및 방학 늘봄 표준 교육 교안 개발", budget_2026: 220000000, spent_2026: 104000000, budget_2025_carry: 60000000, spent_2025_carry: 40000000, assignee: "홍광표 교수", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C2-02", title: "지역아동센터 및 복지관 늘봄 프로그램 위탁 운영", budget_2026: 156000000, spent_2026: 30000000, budget_2025_carry: 40000000, spent_2025_carry: 10000000, assignee: "홍광표 교수", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "C2-03", title: "늘봄 모니터링 품질평가 및 전용 홈페이지 제작", budget_2026: 116000000, spent_2026: 26000000, budget_2025_carry: 40000000, spent_2025_carry: 10000000, assignee: "홍광표 교수", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C2-04", title: "K-pop/브리지게임 등 특화 패키지 도입 및 교사 양성", budget_2026: 208000000, spent_2026: 40000000, budget_2025_carry: 60000000, spent_2025_carry: 20000000, assignee: "홍광표 교수", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 45000000, spent_2026: 15000000, budget_2025_carry: 20000000, spent_2025_carry: 5000000 },
          "장학금": { budget_2026: 15000000, spent_2026: 5000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 320000000, spent_2026: 110000000, budget_2025_carry: 100000000, spent_2025_carry: 40000000 },
          "교육∙연구 환경개선비": { budget_2026: 60000000, spent_2026: 20000000, budget_2025_carry: 20000000, spent_2025_carry: 10000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 70000000, spent_2026: 10000000, budget_2025_carry: 30000000, spent_2025_carry: 10000000 },
          "지역 연계∙협업 지원비": { budget_2026: 165000000, spent_2026: 35000000, budget_2025_carry: 20000000, spent_2025_carry: 10000000 },
          "기업 지원∙협력 활동비": { budget_2026: 15000000, spent_2026: 2000000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 10000000, spent_2026: 300000, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-19",
            name: "늘봄학교 교사 양성 프로그램 운영성과지수",
            type: "자율",
            description: "신규 발굴 늘봄학교 전담교사 양성 연수 과정 누적 수료생 수",
            formula: "(수료교사 달성률 * 0.7) + (연수 교재개발 달성률 * 0.3)",
            cycle: "반기별 1회",
            owner: "울산늘봄누리센터",
            subItems: [
              {
                id: "L-19-1",
                name: "양성 연수 이수 늘봄 전담 교사 수",
                unit: "명",
                years: {
                  1: { target: 2, current: 2 },
                  2: { target: 5.0, current: 3.5 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              },
              {
                id: "L-19-2",
                name: "늘봄 연수 전용 실습 교재 개발 수",
                unit: "건",
                years: {
                  1: { target: 1, current: 1 },
                  2: { target: 3.0, current: 2.1 },
                  3: { target: 4.0, current: 0 },
                  4: { target: 5.0, current: 0 },
                  5: { target: 6.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-20",
            name: "돌봄 체험프로그램 운영 활성화지수",
            type: "자율",
            description: "위탁 늘봄학교 학생 참여수 및 돌봄 품질 지수",
            formula: "(체험 학생수 달성률 * 0.6) + (강의 품질만족 달성률 * 0.4)",
            cycle: "분기별 1회",
            owner: "울산늘봄누리센터",
            subItems: [
              {
                id: "L-20-1",
                name: "돌봄 패키지 위탁 교육 참여 학생 수",
                unit: "명",
                years: {
                  1: { target: 100, current: 95 },
                  2: { target: 200.0, current: 160.0 },
                  3: { target: 220.0, current: 0 },
                  4: { target: 240.0, current: 0 },
                  5: { target: 250.0, current: 0 }
                }
              },
              {
                id: "L-20-2",
                name: "참여 학부모 대상 만족도 종합 평정",
                unit: "점",
                years: {
                  1: { target: 90, current: 75 },
                  2: { target: 95.0, current: 72.0 },
                  3: { target: 96.0, current: 0 },
                  4: { target: 97.0, current: 0 },
                  5: { target: 98.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-10",
            name: "늘봄/방과후 지산학연 협업실적 증가율",
            type: "중점",
            description: "늘봄학교 교안 검증 협의체 및 지산학 네트워크 연계 건수",
            formula: "(협의체 달성률 * 0.5) + (네트워크연계 달성률 * 0.5)",
            cycle: "연 1회",
            owner: "울산늘봄누리센터",
            subItems: [
              {
                id: "U-10-1",
                name: "교안 검증을 위한 지산학 협의체 구축",
                unit: "개",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 5.0, current: 3.0 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              },
              {
                id: "U-10-2",
                name: "네트워크 연계 돌봄 교안 공동 개발",
                unit: "건",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 10.0, current: 6.5 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "D",
    title: "프로젝트 D: 지역생활안전·의료·정주 협력체계 구축",
    budget: 990000000,
    spent: 390000000,
    units: [
      {
        id: "D1",
        title: "지역문제 해결을 위한 울산형 혁신 솔루션 구축",
        budget: 250000000,
        spent: 80000000,
        budget_2026: 200000000,
        spent_2026: 50000000,
        budget_2025_carry: 50000000,
        spent_2025_carry: 30000000,
        manager: "현용환 RCC센터장",
        programs: [
          { id: "D1-01", title: "지역사회 공헌 융합 봉사 및 리씽크 울산 프로젝트", budget_2026: 117000000, spent_2026: 30000000, budget_2025_carry: 30000000, spent_2025_carry: 20000000, assignee: "오영경 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "D1-02", title: "주민 참여형 생활밀착 에코-리빙랩 운영 실증", budget_2026: 36000000, spent_2026: 8000000, budget_2025_carry: 10000000, spent_2025_carry: 2000000, assignee: "최승혜 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "D1-03", title: "울산형 2주기 앵커 모델 발전 정책 연구 R&D", budget_2026: 47000000, spent_2026: 12000000, budget_2025_carry: 10000000, spent_2025_carry: 8000000, assignee: "오영경 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 20000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 12000000, spent_2026: 3000000, budget_2025_carry: 2000000, spent_2025_carry: 2000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 100000000, spent_2026: 25000000, budget_2025_carry: 20000000, spent_2025_carry: 15000000 },
          "교육∙연구 환경개선비": { budget_2026: 2000000, spent_2026: 300000, budget_2025_carry: 1000000, spent_2025_carry: 200000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 12000000, spent_2026: 2000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "지역 연계∙협업 지원비": { budget_2026: 40000000, spent_2026: 10000000, budget_2025_carry: 16000000, spent_2025_carry: 5000000 },
          "기업 지원∙협력 활동비": { budget_2026: 8000000, spent_2026: 1000000, budget_2025_carry: 3000000, spent_2025_carry: 4000000 },
          "성과 활용∙확산 지원비": { budget_2026: 6000000, spent_2026: 900000, budget_2025_carry: 1000000, spent_2025_carry: 600000 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-9",
            name: "지역 현안 해결 지수",
            type: "자율",
            description: "지산학 연계 리빙랩 과제 해결 성공 개수 및 주민 수혜도",
            formula: "(과제해결 달성률 * 0.6) + (주민수혜 달성률 * 0.4)",
            cycle: "반기별 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-9-1",
                name: "리빙랩 해결 프로젝트 성공 건수",
                unit: "건",
                years: {
                  1: { target: 2, current: 2 },
                  2: { target: 4.0, current: 3.0 },
                  3: { target: 5.0, current: 0 },
                  4: { target: 6.0, current: 0 },
                  5: { target: 7.0, current: 0 }
                }
              },
              {
                id: "L-9-2",
                name: "프로젝트 참여 수혜 주민 인원",
                unit: "명",
                years: {
                  1: { target: 80, current: 80 },
                  2: { target: 150.0, current: 130.0 },
                  3: { target: 160.0, current: 0 },
                  4: { target: 170.0, current: 0 },
                  5: { target: 180.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-10",
            name: "지역사회 공헌활동 활성화지수",
            type: "자율",
            description: "학생/교직원의 지역 소외계층 봉사활동 참여 시간 및 실적",
            formula: "(봉사시간 달성률 * 0.6) + (수혜기관 달성률 * 0.4)",
            cycle: "분기별 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-10-1",
                name: "봉사활동 연계 프로그램 참여 누적 시간",
                unit: "시간",
                years: {
                  1: { target: 600, current: 580 },
                  2: { target: 1000.0, current: 800.0 },
                  3: { target: 1100.0, current: 0 },
                  4: { target: 1200.0, current: 0 },
                  5: { target: 1300.0, current: 0 }
                }
              },
              {
                id: "L-10-2",
                name: "봉사 지원을 받은 관내 사회복지기관",
                unit: "개소",
                years: {
                  1: { target: 6, current: 6 },
                  2: { target: 10.0, current: 7.8 },
                  3: { target: 12.0, current: 0 },
                  4: { target: 14.0, current: 0 },
                  5: { target: 15.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-5",
            name: "지역문제해결 연계 지수",
            type: "중점",
            description: "지자체 정책 제안 건수 및 공공 현안 해결을 위한 기여도 지수",
            formula: "(정책제안 달성률 * 0.7) + (참여교직원 달성률 * 0.3)",
            cycle: "반기별 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "U-5-1",
                name: "울산광역시 제출 채택 정책 제안 건수",
                unit: "건",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 5.0, current: 3.5 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              },
              {
                id: "U-5-2",
                name: "공공 현안 대응 자문단 교직원 인원",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 15.0, current: 12.0 },
                  3: { target: 18.0, current: 0 },
                  4: { target: 20.0, current: 0 },
                  5: { target: 22.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "D2",
        title: "지속가능한 보건복지 특성화 및 인재양성 체계 구축",
        budget: 520000000,
        spent: 190000000,
        budget_2026: 400000000,
        spent_2026: 130000000,
        budget_2025_carry: 120000000,
        spent_2025_carry: 60000000,
        manager: "현용환 RCC센터장",
        programs: [
          { id: "D2-01", title: "지산학 보건 거버넌스 및 실물 융합 임상 실습 프로그램", budget_2026: 139000000, spent_2026: 80000000, budget_2025_carry: 40000000, spent_2025_carry: 30000000, assignee: "이현섭 책임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "D2-02", title: "의료 사각지대 주민 구강/근골격 복지케어 모니터링", budget_2026: 111000000, spent_2026: 30000000, budget_2025_carry: 30000000, spent_2025_carry: 10000000, assignee: "박인숙 선임연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "D2-03", title: "반려동물보건과 등 신규 학과 전용 스마트 기자재 조달", budget_2026: 150000000, spent_2026: 20000000, budget_2025_carry: 50000000, spent_2025_carry: 20000000, assignee: "이연향 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 30000000, spent_2026: 10000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000 },
          "장학금": { budget_2026: 12000000, spent_2026: 2000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 120000000, spent_2026: 38000000, budget_2025_carry: 30000000, spent_2025_carry: 12000000 },
          "교육∙연구 환경개선비": { budget_2026: 90000000, spent_2026: 30000000, budget_2025_carry: 20000000, spent_2025_carry: 10000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 135000000, spent_2026: 48000000, budget_2025_carry: 55000000, spent_2025_carry: 32000000 },
          "지역 연계∙협업 지원비": { budget_2026: 6000000, spent_2026: 1000000, budget_2025_carry: 1000000, spent_2025_carry: 0 },
          "기업 지원∙협력 활동비": { budget_2026: 4000000, spent_2026: 1000000, budget_2025_carry: 2000000, spent_2025_carry: 0 },
          "성과 활용∙확산 지원비": { budget_2026: 3000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-18",
            name: "사회적 약자 의료케어 종합 달성지수",
            type: "자율",
            description: "의료 소외 계층(독거노인 등) 대상 보건의료 서비스 혜택 인원수",
            formula: "(의료수혜 달성률 * 0.7) + (봉사단수 달성률 * 0.3)",
            cycle: "반기별 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-18-1",
                name: "의료 혜택 서비스 지원 수혜 인원",
                unit: "명",
                years: {
                  1: { target: 180, current: 175 },
                  2: { target: 300.0, current: 250.0 },
                  3: { target: 320.0, current: 0 },
                  4: { target: 340.0, current: 0 },
                  5: { target: 350.0, current: 0 }
                }
              },
              {
                id: "L-18-2",
                name: "지역 보건 봉사 활동 참여 동아리 수",
                unit: "개",
                years: {
                  1: { target: 3, current: 3 },
                  2: { target: 5.0, current: 4.0 },
                  3: { target: 6.0, current: 0 },
                  4: { target: 7.0, current: 0 },
                  5: { target: 8.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-9",
            name: "보건복지서비스 역량강화 프로그램 지수",
            type: "중점",
            description: "스마트 임상실습 기기 도입률 및 복지 실무 교육 이수 인원",
            formula: "(이수 달성률 * 0.6) + (스마트기기도입 달성률 * 0.4)",
            cycle: "연 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "U-9-1",
                name: "임상 실무 교육과정 이수 학생 수",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 150.0, current: 130.0 },
                  3: { target: 160.0, current: 0 },
                  4: { target: 170.0, current: 0 },
                  5: { target: 180.0, current: 0 }
                }
              },
              {
                id: "U-9-2",
                name: "신규 임상실습 스마트 기자재 매칭 도입",
                unit: "종",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 10.0, current: 8.0 },
                  3: { target: 11.0, current: 0 },
                  4: { target: 12.0, current: 0 },
                  5: { target: 13.0, current: 0 }
                }
              }
            ]
          }
        ]
      },
      {
        id: "D3",
        title: "에코컬처 도시재생 및 문화혁신 모델 구축",
        budget: 490000000,
        spent: 120000000,
        budget_2026: 390000000,
        spent_2026: 90000000,
        budget_2025_carry: 100000000,
        spent_2025_carry: 30000000,
        manager: "현용환 RCC센터장",
        programs: [
          { id: "D3-01", title: "호계역 에코컬처 공공디자인 및 굿즈 브랜드 개발", budget_2026: 115000000, spent_2026: 30000000, budget_2025_carry: 30000000, spent_2025_carry: 10000000, assignee: "김소정 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "D3-02", title: "구도심 공실 상가 청년 창작 공유 공간 리모델링 시공", budget_2026: 251000000, spent_2026: 50000000, budget_2025_carry: 70000000, spent_2025_carry: 20000000, assignee: "오영경 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "D3-03", title: "시민 참여형 업사이클링 축제 기획 운영", budget_2026: 24000000, spent_2026: 10000000, budget_2025_carry: 0, spent_2025_carry: 0, assignee: "최승혜 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 25000000, spent_2026: 8000000, budget_2025_carry: 5000000, spent_2025_carry: 2000000 },
          "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 100000000, spent_2026: 22000000, budget_2025_carry: 20000000, spent_2025_carry: 8000000 },
          "교육∙연구 환경개선비": { budget_2026: 200000000, spent_2026: 40000000, budget_2025_carry: 50000000, spent_2025_carry: 10000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 10000000, spent_2026: 3000000, budget_2025_carry: 3000000, spent_2025_carry: 2000000 },
          "지역 연계∙협업 지원비": { budget_2026: 45000000, spent_2026: 15000000, budget_2025_carry: 18000000, spent_2025_carry: 5000000 },
          "기업 지원∙협력 활동비": { budget_2026: 5000000, spent_2026: 2000000, budget_2025_carry: 2000000, spent_2025_carry: 1000000 },
          "성과 활용∙확산 지원비": { budget_2026: 5000000, spent_2026: 0, budget_2025_carry: 2000000, spent_2025_carry: 2000000 },
          "그 밖의 사업운영경비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "간접비": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: [
          {
            id: "L-21",
            name: "도시공간 재생프로젝트 운영성과지수",
            type: "자율",
            description: "구도심 리모델링 청년 창작공유공간 구축 면적 및 청년 기업 매칭 수",
            formula: "(구축공간 달성률 * 0.6) + (입주매칭 달성률 * 0.4)",
            cycle: "연 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-21-1",
                name: "청년 창작공유 신규 리모델링 공간",
                unit: "개소",
                years: {
                  1: { target: 1, current: 1 },
                  2: { target: 3.0, current: 2.0 },
                  3: { target: 4.0, current: 0 },
                  4: { target: 5.0, current: 0 },
                  5: { target: 6.0, current: 0 }
                }
              },
              {
                id: "L-21-2",
                name: "공간 신규 매칭 창작기업 입주 수",
                unit: "개",
                years: {
                  1: { target: 5, current: 5 },
                  2: { target: 10.0, current: 9.0 },
                  3: { target: 11.0, current: 0 },
                  4: { target: 12.0, current: 0 },
                  5: { target: 13.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "L-22",
            name: "문화 콘텐츠 개발프로젝트 운영성과지수",
            type: "자율",
            description: "에코디자인 굿즈 개발 개수 및 축제 참여 울산시민 관람객 수",
            formula: "(굿즈개발 달성률 * 0.5) + (시민관람 달성률 * 0.5)",
            cycle: "반기별 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "L-22-1",
                name: "에코디자인 굿즈 신규 개발 수",
                unit: "종",
                years: {
                  1: { target: 4, current: 4 },
                  2: { target: 8.0, current: 6.0 },
                  3: { target: 9.0, current: 0 },
                  4: { target: 10.0, current: 0 },
                  5: { target: 11.0, current: 0 }
                }
              },
              {
                id: "L-22-2",
                name: "체험 축제 참여 관내 수혜 시민 인원",
                unit: "명",
                years: {
                  1: { target: 250, current: 240 },
                  2: { target: 500.0, current: 360.0 },
                  3: { target: 550.0, current: 0 },
                  4: { target: 600.0, current: 0 },
                  5: { target: 650.0, current: 0 }
                }
              }
            ]
          },
          {
            id: "U-11",
            name: "꿀잼도시 프로젝트 만족 지수",
            type: "중점",
            description: "울산 에코컬처 공공디자인 관련 프로젝트 완료 후 시민 만족도 종합 설문",
            formula: "(종합만족도 달성률 * 0.8) + (브랜드참여 달성률 * 0.2)",
            cycle: "연 1회",
            owner: "RCC센터",
            subItems: [
              {
                id: "U-11-1",
                name: "공공디자인 적용 환경 만족도 점수",
                unit: "점",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 90.0, current: 80.0 },
                  3: { target: 91.0, current: 0 },
                  4: { target: 92.0, current: 0 },
                  5: { target: 93.0, current: 0 }
                }
              },
              {
                id: "U-11-2",
                name: "굿즈 브랜드 마일스톤 참여자 수",
                unit: "명",
                years: {
                  1: { target: 0, current: 0 },
                  2: { target: 300.0, current: 220.0 },
                  3: { target: 320.0, current: 0 },
                  4: { target: 340.0, current: 0 },
                  5: { target: 350.0, current: 0 }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "E",
    title: "공통경비",
    budget: 2363000000,
    spent: 120000000,
    units: [
      {
        id: "Common",
        title: "공통경비",
        budget: 2863000000,
        spent: 120000000,
        budget_2026: 2363000000,
        spent_2026: 90000000,
        budget_2025_carry: 500000000,
        spent_2025_carry: 3000000,
        manager: "심현미 운영팀장",
        programs: [
          { id: "Common-1-1", title: "앵커 사업단 공통 일반행정 및 경상운영비 집행", budget_2026: 1563000000, spent_2026: 50000000, budget_2025_carry: 30000000, spent_2025_carry: 20000000, assignee: "한유경 선임", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "Common-1-2", title: "지산학연 거버넌스 워크숍 및 최종 성과공유포럼 개최", budget_2026: 400000000, spent_2026: 25000005, budget_2025_carry: 10000000, spent_2025_carry: 5000000, assignee: "김래림 연구원", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "Common-1-3", title: "사업단 홍보 영상, 백서 제작 및 브랜드 확산", budget_2026: 400000000, spent_2026: 15000000, budget_2025_carry: 10000000, spent_2025_carry: 5000000, assignee: "박언주 연구원", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } }
        ],
        budgetDetails: {
          "인건비": { budget_2026: 400000000, spent_2026: 15000000, budget_2025_carry: 50000000, spent_2025_carry: 3000000 },
          "장학금": { budget_2026: 0, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { budget_2026: 600000000, spent_2026: 30000000, budget_2025_carry: 150000000, spent_2025_carry: 8000000 },
          "교육∙연구 환경개선비": { budget_2026: 200000000, spent_2026: 50000005, budget_2025_carry: 50000000, spent_2025_carry: 3000000 },
          "실험∙실습장비 및 기자재 구입∙운영비": { budget_2026: 200000000, spent_2026: 3000000, budget_2025_carry: 50000000, spent_2025_carry: 4000000 },
          "지역 연계∙협업 지원비": { budget_2026: 300000000, spent_2026: 12000000, budget_2025_carry: 50000000, spent_2025_carry: 3000000 },
          "기업 지원∙협력 활동비": { budget_2026: 150000000, spent_2026: 5000000, budget_2025_carry: 30000000, spent_2025_carry: 2000000 },
          "성과 활용∙확산 지원비": { budget_2026: 213000000, spent_2026: 5000000, budget_2025_carry: 70000000, spent_2025_carry: 4000000 },
          "그 밖의 사업운영경비": { budget_2026: 200000000, spent_2026: 10000000, budget_2025_carry: 50000000, spent_2025_carry: 3000000 },
          "간접비": { budget_2026: 100000000, spent_2026: 0, budget_2025_carry: 0, spent_2025_carry: 0 }
        },
        kpis: []
      }
    ]
  }
];

export const userRoles = {
  DIRECTOR: { id: "DIRECTOR", name: "사업단장 (송경영 교수)", rank: 1, desc: "전체 프로젝트 사업비 & KPI 최종 결재 및 연구원 배정 마스터 권한" },
  HQ_HEAD: { id: "HQ_HEAD", name: "총괄본부장 (김현수 교수)", rank: 2, desc: "사업단 전체 실적 모니터링 및 AID-X지원센터 실무 총괄" },
  CENTER_ECC: { id: "CENTER_ECC", name: "CENTER_ECC", rank: 3, desc: "소속 단위과제(A1가, A2, A3) 세부 예산 및 프로그램 상태 관리" },
  CENTER_ICC: { id: "CENTER_ICC", name: "CENTER_ICC", rank: 3, desc: "소속 단위과제(B1, B3, B4) 세부 예산 및 산학협력 체계 관리" },
  CENTER_RCC: { id: "CENTER_RCC", name: "CENTER_RCC", rank: 3, desc: "소속 단위과제(C1, D1, D2, D3) 세부 예산 및 평생학습 관리" },
  CENTER_AID: { id: "CENTER_AID", name: "CENTER_AID", rank: 3, desc: "소속 단위과제(B2) 세부 예산 및 AID 역량강화 관리" },
  CENTER_NULBOM: { id: "CENTER_NULBOM", name: "CENTER_NULBOM", rank: 3, desc: "소속 단위과제(C2) 늘봄 표준 교안 및 특화 교육 관리" },
  CENTER_SPECIAL: { id: "CENTER_SPECIAL", name: "CENTER_SPECIAL", rank: 3, desc: "소속 단위과제(A1나 신산업 이관 분 4억 원 총괄)" },
  TEAM_LEADER: { id: "TEAM_LEADER", name: "TEAM_LEADER", rank: 4, desc: "공통 영역 및 운영 행정비 집행 관리 총괄" },
  RESEARCHER: { id: "RESEARCHER", name: "실무 연구원", rank: 5, desc: "담당 프로그램 세부 예산 실시간 집행 등록 및 PDCA 업데이트 권한" }
};


// 1차년도 공식 프로그램 데이터 매핑 (2차년도 유닛 ID 기준)
export const YEAR_1_PROGRAMS = {
  "A1가": [
    {
      "id": "A1-S1T1-1",
      "title": "UC-HYPER 교수학습모델 개발/운영/성과확산",
      "budget": 17300000,
      "spent": 17300000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 17300000, "spent": 17300000 }
      ]
    },
    {
      "id": "A1-S1T2-1",
      "title": "채용연계(우대) 맞춤형 주문식 교육과정 개발/운영",
      "budget": 74000000,
      "spent": 68000000,
      "assignee": "기획처 & 참여학과 교수진",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 74000000, "spent": 68000000 }
      ]
    },
    {
      "id": "A1-S1T2-2",
      "title": "캡스톤 디자인 운영",
      "budget": 6500000,
      "spent": 6100000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 6500000, "spent": 6100000 }
      ]
    },
    {
      "id": "A1-S1T2-3",
      "title": "현장기반 학습공간 연계 정규교과목 운영",
      "budget": 50000000,
      "spent": 49400000,
      "assignee": "참여학과",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 49400000 }
      ]
    },
    {
      "id": "A1-S1T2-4",
      "title": "UC-HYPER 융복합 트랙 교육과정 개발/운영",
      "budget": 11200000,
      "spent": 9800000,
      "assignee": "기획처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 11200000, "spent": 9800000 }
      ]
    },
    {
      "id": "A1-S2T3-1",
      "title": "진로개발 통합지원 시스템 개발/운영",
      "budget": 0,
      "spent": 0,
      "assignee": "학생취업처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 0, "spent": 0 }
      ]
    },
    {
      "id": "A1-S2T4-1",
      "title": "ECC 성과확산 프로그램 운영",
      "budget": 18000000,
      "spent": 15500000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 18000000, "spent": 15500000 }
      ]
    },
    {
      "id": "A1-S3T5-1",
      "title": "UC-HYPER 교직원 역량 강화 프로그램 운영",
      "budget": 500000,
      "spent": 500000,
      "assignee": "교무처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 500000, "spent": 500000 }
      ]
    },
    {
      "id": "A1-S3T5-2",
      "title": "UC-HYPER 운영 규정 제·개정",
      "budget": 0,
      "spent": 0,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 0, "spent": 0 }
      ]
    },
    {
      "id": "A1-S3T6-1",
      "title": "표준형 현장실습 운영",
      "budget": 40000000,
      "spent": 32600000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 32600000 }
      ]
    },
    {
      "id": "A1-S3T6-2",
      "title": "전문기술석사 교육과정 운영",
      "budget": 5500000,
      "spent": 5500000,
      "assignee": "대학원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 5500000, "spent": 5500000 }
      ]
    },
    {
      "id": "A1-S3T6-3",
      "title": "글로벌 교육 프로그램 개발/운영",
      "budget": 0,
      "spent": 0,
      "assignee": "국제교류원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 0, "spent": 0 }
      ]
    },
    {
      "id": "A1-S4T7-1",
      "title": "UC-HYPER 교육환경 구축",
      "budget": 1228900000,
      "spent": 1120900000,
      "assignee": "시설관리처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 1228900000, "spent": 1120900000 }
      ]
    },
    {
      "id": "A1-S4T7-2",
      "title": "ECC 공유·협업 체계를 위한 인프라 구축",
      "budget": 29300000,
      "spent": 26000000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 29300000, "spent": 26000000 }
      ]
    },
    {
      "id": "A1-S4T8-1",
      "title": "AI 리터러시 정규/비정규 교육과정 개발/운영",
      "budget": 7700000,
      "spent": 7700000,
      "assignee": "교무처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 7700000, "spent": 7700000 }
      ]
    },
    {
      "id": "A1-S4T8-2",
      "title": "UC-HYPER 핵심분야 요소기술 정규/비정규 교육과정 개발/운영",
      "budget": 35000000,
      "spent": 34800000,
      "assignee": "기획처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 34800000 }
      ]
    },
    {
      "id": "A1-S5T9-1",
      "title": "울산 맞춤형 인재양성 거버넌스 구축",
      "budget": 0,
      "spent": 0,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 0, "spent": 0 }
      ]
    },
    {
      "id": "A1-S5T10-1",
      "title": "글로벌 지산학 혁신 거버넌스 구축",
      "budget": 0,
      "spent": 0,
      "assignee": "국제교류원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 0, "spent": 0 }
      ]
    },
    {
      "id": "A1-S5T11-1",
      "title": "공통경비",
      "budget": 379600000,
      "spent": 405800000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "인건비", "budget": 156000000, "spent": 155200000 },
        { "category": "장학금", "budget": 88000000, "spent": 72100000 },
        { "category": "실험∙실습장비 및 기자재 구입∙운영비", "budget": 187800000, "spent": 105900000 },
        { "category": "기업 지원∙협력 활동비", "budget": 208300000, "spent": 76700000 },
        { "category": "성과 활용∙확산 지원비", "budget": 48700000, "spent": 22800000 },
        { "category": "그 밖의 사업운영경비", "budget": 72300000, "spent": 55700000 },
        { "category": "간접비", "budget": 69000000, "spent": 69000000 }
      ]
    },
    {
      "id": "A1-S4T8-3",
      "title": "UDx 미래인재양성 교육과정 개발 및 Lab 구축 [인센티브]",
      "budget": 161000000,
      "spent": 0,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 70000000, "spent": 0 },
        { "category": "교육∙연구 환경개선비", "budget": 91000000, "spent": 0 }
      ]
    },
    {
      "id": "A1-S4T7-3",
      "title": "AI·디지털트윈 첨단 실습 및 실증 장비 인프라 구축 [인센티브]",
      "budget": 359500000,
      "spent": 151500000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "실험∙실습장비 및 기자재 구입∙운영비", "budget": 359500000, "spent": 151500000 }
      ]
    },
    {
      "id": "A1-S5T10-2",
      "title": "UDx 지산학 협력 거버넌스 및 첫걸음 R&D 예비과제 운영 [인센티브]",
      "budget": 62000000,
      "spent": 0,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "기업 지원∙협력 활동비", "budget": 62000000, "spent": 0 }
      ]
    },
    {
      "id": "A1-S5T11-2",
      "title": "인센티브 공통 운영 경비 및 간접비",
      "budget": 41500000,
      "spent": 29900000,
      "assignee": "지산학교육센터(ECC)",
      "budget_categories": [
        { "category": "인건비", "budget": 7500000, "spent": 7000000 },
        { "category": "그 밖의 사업운영경비", "budget": 17000000, "spent": 5900000 },
        { "category": "간접비", "budget": 17000000, "spent": 17000000 }
      ]
    }],
  "A2": [
    {
      "id": "A2-S1T1-1",
      "title": "창업 정규 교육과정 개발·운영",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S1T1-2",
      "title": "창업 비정규 프로그램 개발·운영",
      "budget": 150000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 150000000, "spent": 150000000 }
      ]
    },
    {
      "id": "A2-S1T2-1",
      "title": "창업문화 확산을 위한 규정·제도 개선",
      "budget": 10000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "A2-S1T2-2",
      "title": "교직원 창업역량 강화",
      "budget": 40000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "A2-S1T2-3",
      "title": "실전 창업 환경 개선 및 하이퍼캠퍼스(창업) 구축",
      "budget": 150000000,
      "assignee": "시설관리처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 150000000, "spent": 150000000 }
      ]
    },
    {
      "id": "A2-S2T3-1",
      "title": "재학생·교직원 예비창업자 지원 프로그램 운영",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S2T3-2",
      "title": "초·중·고 및 지역민 예비창업자 지원 프로그램 운영",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S2T4-1",
      "title": "초기 창업자 대상 사업화 후속 지원",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S2T4-2",
      "title": "아이디어 특허 지원",
      "budget": 50000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S3T5-1",
      "title": "초·중·고 창업 교육 통합 지원 프로그램",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S3T5-2",
      "title": "타 기관 연계 창업 협력 네트워크 구축 및 공동 교육 프로그램 운영",
      "budget": 150000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 150000000, "spent": 150000000 }
      ]
    },
    {
      "id": "A2-S3T6-1",
      "title": "해외 창업 인큐베이터 연계 프로그램 기획",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "A2-S3T6-2",
      "title": "창업선도모델 공동연구 및 벤치마크",
      "budget": 50000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    }
  ,
    {
      "id": "A2-S3T7-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "글로컬창업지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "B1": [
    {
      "id": "B1-S1T1-1",
      "title": "ICC 기반 미래가치창출 지원 체계 구축",
      "budget": 15000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B1-S1T1-2",
      "title": "ICC 구축을 위한 행·제도적 기반 마련",
      "budget": 15000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B1-S1T2-1",
      "title": "지역별 산학연 협의체 구성 및 운영 계획 수립",
      "budget": 10000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "B1-S1T2-2",
      "title": "분야별 협력기관 발굴 및 협약체결",
      "budget": 10000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "B1-S2T3-1",
      "title": "기업 맞춤형 과제 공모 및 지원 체계 구축",
      "budget": 70000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 70000000, "spent": 70000000 }
      ]
    },
    {
      "id": "B1-S2T3-2",
      "title": "컨소시엄 형태의 다기관 협력형 연구개발 과제 운영",
      "budget": 60000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 60000000, "spent": 60000000 }
      ]
    },
    {
      "id": "B1-S2T4-1",
      "title": "지역 산업체 및 혁신기관 협력을 통한 수요 발굴",
      "budget": 15000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B1-S2T4-2",
      "title": "전문기술석사 학생의 현장문제 발굴 및 과제 수행",
      "budget": 35000000,
      "assignee": "대학원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 35000000 }
      ]
    },
    {
      "id": "B1-S3T5-1",
      "title": "높은 접근성의 산업체를 위한 공용 플랫폼 구축",
      "budget": 10000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "B1-S3T5-2",
      "title": "전문가 풀을 활용한 중소기업 기술 지원 체계 운영",
      "budget": 20000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B1-S3T6-1",
      "title": "공용장비 지원 플랫폼 구축 (U-NEXUS 연계)",
      "budget": 15000000,
      "assignee": "정보통신처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B1-S3T6-2",
      "title": "공용장비 활용 프로그램 개발 및 운영 체계 마련",
      "budget": 35000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 35000000 }
      ]
    }
  ,
    {
      "id": "B1-S3T7-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "R&BD지원팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "C1": [
    {
      "id": "B2-S1T1-1",
      "title": "지역 내 평생직업교육 거점센터 운영",
      "budget": 55000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 55000000, "spent": 55000000 }
      ]
    },
    {
      "id": "B2-S1T1-2",
      "title": "지역 기관과의 평생직업교육 연계 방안 마련",
      "budget": 15000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B2-S1T2-1",
      "title": "UC-HYPER 내 평생직업교육관련 데이터 구축",
      "budget": 20000000,
      "assignee": "정보통신처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B2-S1T2-2",
      "title": "교육통합 플랫폼의 대학내 기반 구축",
      "budget": 30000000,
      "assignee": "정보통신처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "B2-S1T2-3",
      "title": "울산의 교육통합 플랫폼을 위한 참여",
      "budget": 20000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B2-S2T3-1",
      "title": "교육접근성 확대를 위한 다양한 학습 프로그램 개발",
      "budget": 20000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B2-S2T4-1",
      "title": "성인학습자를 위한 맞춤형 학과 개설 지원",
      "budget": 30000000,
      "assignee": "기획처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "B2-S2T4-2",
      "title": "성인학습자 학과 입학을 위한 맞춤형 지원 확대",
      "budget": 15000000,
      "assignee": "학생취업처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B2-S3T5-1",
      "title": "생애주기별 평생학습 지원 체계 구축",
      "budget": 20000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B2-S3T5-2",
      "title": "생애주기별 교육 지원 시스템 구축",
      "budget": 15000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B2-S3T6-1",
      "title": "산업체와의 실무중심의 교육 프로그램 개발",
      "budget": 40000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "B2-S3T6-2",
      "title": "성인학습자 대상 학점 인정 프로그램 운영",
      "budget": 20000000,
      "assignee": "기획처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B2-S4T7-1",
      "title": "지역산업 연계 맞춤형 직업교육 과정 운영",
      "budget": 80000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 80000000, "spent": 80000000 }
      ]
    },
    {
      "id": "B2-S4T7-2",
      "title": "지역 산업 맞춤형 교육 콘텐츠 개발",
      "budget": 60000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 60000000, "spent": 60000000 }
      ]
    },
    {
      "id": "B2-S4T8-1",
      "title": "기업과 협력한 교육 콘텐츠 개발",
      "budget": 85000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 85000000, "spent": 85000000 }
      ]
    }
  ,
    {
      "id": "B2-S4T9-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "평생교육원",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "C2": [
    {
      "id": "B3-S1T1-1",
      "title": "지역문제해결 공용플랫폼의 협력 체계 구축",
      "budget": 20000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "B3-S1T1-2",
      "title": "공용 플랫폼의 협력 체계 마련",
      "budget": 15000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B3-S1T2-1",
      "title": "지역문제해결 캡스톤 디자인 운영",
      "budget": 114999999,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 115000000, "spent": 115000000 }
      ]
    },
    {
      "id": "B3-S1T2-2",
      "title": "자매도시 또는 글로벌 지역문제해결 캡스톤 디자인 모델 개발",
      "budget": 50000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "B3-S2T3-1",
      "title": "지역협력 마일리지 제도 협력 체계 구축",
      "budget": 15000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "B3-S2T3-2",
      "title": "지역협력 마일리지 형태의 지속 가능한 주민참여 운영 모델 및 제도 개발",
      "budget": 25000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 25000000, "spent": 25000000 }
      ]
    },
    {
      "id": "B3-S2T4-1",
      "title": "학과기반의 지역사회공헌활동 프로그램 운영",
      "budget": 35000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 35000000 }
      ]
    },
    {
      "id": "B3-S2T4-2",
      "title": "대학의 역량을 활용한 지역사회협력 연계",
      "budget": 15000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    }
  ,
    {
      "id": "B3-S2T5-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "로컬브릿지팀",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "B4": [
    {
      "id": "C1-S1T1-1",
      "title": "산업별 재난 유형 및 사례 분석 기반 교육 콘텐츠 개발",
      "budget": 30000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "C1-S1T1-2",
      "title": "산업 맞춤형 재난 대응 표준프로세스 개발 및 적용",
      "budget": 30000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "C1-S1T2-1",
      "title": "산업 현장 중심 응급 대응 매뉴얼 개발 및 운영",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C1-S1T2-2",
      "title": "응급처치 교육 모듈 개발 및 시범 운영",
      "budget": 30000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "C1-S1T2-3",
      "title": "기업·지자체 협력 기반 재난 대응 전문 교육 프로그램 개발",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C1-S2T3-1",
      "title": "산업안전·보건 교육 교재 및 온라인 학습 콘텐츠 개발",
      "budget": 50000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "C1-S2T3-2",
      "title": "산업 맞춤형 안전·보건 자격 인증 과정 개설 및 운영",
      "budget": 50000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "C1-S2T4-1",
      "title": "실습 중심의 VR·AR 기반 재난 대응 교육 콘텐츠 개발",
      "budget": 80000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 80000000, "spent": 80000000 }
      ]
    },
    {
      "id": "C1-S3T5-1",
      "title": "기업 및 연구기관 협력을 통한 산업안전 컨설팅 모델 기획",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C1-S3T5-2",
      "title": "센터 운영을 위한 전문 인력 양성 및 교육 과정 개설",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C1-S3T6-1",
      "title": "재난 대응 협력 네트워크 구축을 위한 MOU 체결",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "C1-S3T6-2",
      "title": "정기 협의체 운영 및 기업 맞춤형 재난 대응 전략 논의",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 20000000, "spent": 20000000 }
      ]
    }
  ,
    {
      "id": "C1-S3T7-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "B2": [
    {
      "id": "C2-S1T1-1",
      "title": "AID-X지원센터 공간 설계 및 구축",
      "budget": 400000000,
      "assignee": "시설관리처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 400000000, "spent": 400000000 }
      ]
    },
    {
      "id": "C2-S1T1-2",
      "title": "센터 운영 규정 및 마스터플랜 수립",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "C2-S1T2-1",
      "title": "교원 AI·DX 활용 교수역량 강화 연수",
      "budget": 40000000,
      "assignee": "교무처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "C2-S1T2-2",
      "title": "AI 리터러시 튜터 교원 선발 및 아카데미 운영",
      "budget": 20000000,
      "assignee": "학생취업처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C2-S2T3-1",
      "title": "AI·DX 융합 마이크로디그리 교과 개발",
      "budget": 50000000,
      "assignee": "기획처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "C2-S2T3-2",
      "title": "학과별 AI 융합 요소기술 교재 집필",
      "budget": 30000000,
      "assignee": "교무처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "C2-S2T4-1",
      "title": "산업체 재직자 맞춤형 AI·DX 직무 비교과 개설",
      "budget": 60000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 60000000, "spent": 60000000 }
      ]
    },
    {
      "id": "C2-S2T4-2",
      "title": "채용 우대형 AI 코딩 단기 실무반 운영",
      "budget": 40000000,
      "assignee": "학생취업처",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "C2-S3T5-1",
      "title": "기업 애로 AI 기술 연계 산학 공동 R&D 수행",
      "budget": 120000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 120000000, "spent": 120000000 }
      ]
    },
    {
      "id": "C2-S3T6-1",
      "title": "중소기업 맞춤형 디지털 트윈 실증 기술지도",
      "budget": 80000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 80000000, "spent": 80000000 }
      ]
    }
  ,
    {
      "id": "C1-S3T7-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 환경개선비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "B3": [
    {
      "id": "C3-S1T1-1",
      "title": "탄소중립 교육 기본과정 개발",
      "budget": 15000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "C3-S1T1-2",
      "title": "탄소중립 시범 교육 운영",
      "budget": 35000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 35000000 }
      ]
    },
    {
      "id": "C3-S1T2-1",
      "title": "시험 평가 기준 연구 및 시험 설계",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C3-S1T2-2",
      "title": "인증체계 구축 및 시험 운영 시범사업",
      "budget": 30000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "C3-S2T3-1",
      "title": "ESG 경영진단 시스템 개발",
      "budget": 30000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "C3-S2T3-2",
      "title": "ESG 경영 컨설팅 시범 운영",
      "budget": 50000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "C3-S2T4-1",
      "title": "친환경 기술 개발 지원 체계 구축",
      "budget": 40000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "C3-S2T4-2",
      "title": "녹색산업 육성 및 실증 사업 지원",
      "budget": 40000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "C3-S3T5-1",
      "title": "탄소중립지원센터 연계 교육 인프라 구축 설계",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C3-S3T5-2",
      "title": "탄소중립 실습 및 체험 공간 조성 설계",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C3-S3T6-1",
      "title": "탄소중립지원센터 연계 정책과제 연구 및 벤치마킹",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "C3-S3T6-2",
      "title": "시민 참여형 탄소중립 실천 프로그램 기획 및 시범 운영",
      "budget": 30000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    }
  ,
    {
      "id": "C3-S3T7-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "D1": [
    {
      "id": "D1-S1T1-1",
      "title": "지역사회 기반 보건복지 협의체 구축 및 운영",
      "budget": 15000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "D1-S1T1-2",
      "title": "보건의료 전문기관 연계 협력체계 마련",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "D1-S1T2-1",
      "title": "보건분야 전문기술인력 연수 프로그램 기획 및 운영",
      "budget": 35000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 35000000 }
      ]
    },
    {
      "id": "D1-S1T2-2",
      "title": "요양보호사 등 재직자 대상 직무 역량 강화 교육과정 개발 및 운영",
      "budget": 40000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "D1-S1T2-3",
      "title": "대학생-재직자 매칭 보건복지 연수 과정 운영",
      "budget": 20000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "D1-S2T3-1",
      "title": "취약계층 건강모니터링 프로그램 운영",
      "budget": 60000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 60000000, "spent": 60000000 }
      ]
    },
    {
      "id": "D1-S2T3-2",
      "title": "사회적 약자 의료케어 서포터즈 조직 및 운영",
      "budget": 40000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "D1-S2T3-3",
      "title": "디지털헬스케어 기반 시범사업 적용 및 평가",
      "budget": 70000000,
      "assignee": "정보통신처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 70000000, "spent": 70000000 }
      ]
    },
    {
      "id": "D1-S2T4-1",
      "title": "반려동물보건과 신설을 위한 학과 기반 구축",
      "budget": 130000000,
      "assignee": "기획처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 130000000, "spent": 130000000 }
      ]
    },
    {
      "id": "D1-S2T4-2",
      "title": "반려동물 매개치료 교육 프로그램 개발 및 적용",
      "budget": 50000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    }
  ,
    {
      "id": "D1-S2T5-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "산학협력단",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "D2": [
    {
      "id": "D2-S1T1-1",
      "title": "방과후 늘봄 프로그램 시범 적용",
      "budget": 50000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "D2-S1T1-2",
      "title": "전문 강사 양성 과정 설계",
      "budget": 20000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "D2-S1T2-1",
      "title": "방학 중 특별 돌봄 캠프 운영",
      "budget": 40000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 40000000, "spent": 40000000 }
      ]
    },
    {
      "id": "D2-S2T3-1",
      "title": "대학 컨소시엄 구축 및 MOU 체결",
      "budget": 15000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "D2-S2T3-2",
      "title": "공동 성과 공유회 개최",
      "budget": 15000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 15000000, "spent": 15000000 }
      ]
    },
    {
      "id": "D2-S2T4-1",
      "title": "교육청-지자체 연합 늘봄 거버넌스 회의 개최",
      "budget": 10000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "D2-S3T5-1",
      "title": "늘봄 프로그램 효과 분석 및 고도화 연구",
      "budget": 20000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 20000000, "spent": 20000000 }
      ]
    },
    {
      "id": "D2-S3T6-1",
      "title": "늘봄 온라인 플랫폼 내 모니터링 모듈 구축",
      "budget": 30000000,
      "assignee": "정보통신처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "D2-S3T7-1",
      "title": "울산 늘봄누리 브랜드 BI 개발 및 홍보",
      "budget": 30000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 30000000, "spent": 30000000 }
      ]
    },
    {
      "id": "D2-S4T8-1",
      "title": "동구, 중구, 북구 특화 늘봄 프로그램 개발",
      "budget": 280000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 280000000, "spent": 280000000 }
      ]
    },
    {
      "id": "D2-S4T9-1",
      "title": "울산 정주형 예비교사 멘토단 선발 및 파견",
      "budget": 250000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 250000000, "spent": 250000000 }
      ]
    },
    {
      "id": "D2-S4T10-1",
      "title": "IT·보건 강점을 살린 특화 교육 개설",
      "budget": 200000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 200000000, "spent": 200000000 }
      ]
    },
    {
      "id": "D2-S4T10-2",
      "title": "대학 기자재 활용형 늘봄 교육 운영",
      "budget": 140000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 140000000, "spent": 140000000 }
      ]
    }
  ,
    {
      "id": "D2-S4T11-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "늘봄학교지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "D3": [
    {
      "id": "D3-S1T1-1",
      "title": "울산 에코 컬처 관광·문화 콘텐츠 개발",
      "budget": 35000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 35000000, "spent": 35000000 }
      ]
    },
    {
      "id": "D3-S1T1-2",
      "title": "기후·문화 융합 시범 강좌 개설",
      "budget": 65000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 65000000, "spent": 65000000 }
      ]
    },
    {
      "id": "D3-S1T2-1",
      "title": "지역 문화 기획자 및 에코 도슨트 양성 과정",
      "budget": 70000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 70000000, "spent": 70000000 }
      ]
    },
    {
      "id": "D3-S1T2-2",
      "title": "대학생 문화 서포터즈 발굴 및 육성",
      "budget": 50000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "D3-S2T3-1",
      "title": "에코 컬처 축제 기획 및 시민 체험 행사 운영",
      "budget": 250000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 250000000, "spent": 250000000 }
      ]
    },
    {
      "id": "D3-S2T4-1",
      "title": "에코 컬처 네트워크 구축을 위한 다자간 MOU 체결",
      "budget": 80000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 80000000, "spent": 80000000 }
      ]
    },
    {
      "id": "D3-S2T5-1",
      "title": "'꿀잼도시 울산' 콘텐츠 브랜딩 BI 개발 및 대외 홍보",
      "budget": 150000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 150000000, "spent": 150000000 }
      ]
    }
  ,
    {
      "id": "D3-S2T6-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    }],
  "A3": [
    {
      "id": "D4-S1T1-1",
      "title": "글로벌 거점 센터 물리적/제도적 공간 구축",
      "budget": 120000000,
      "assignee": "시설관리처",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 120000000, "spent": 120000000 }
      ]
    },
    {
      "id": "D4-S1T1-2",
      "title": "센터 운영 규칙 및 마스터플랜 수립",
      "budget": 13000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 13000000, "spent": 13000000 }
      ]
    },
    {
      "id": "D4-S1T2-1",
      "title": "무역/글로벌 비즈니스 비교과 트랙 운영",
      "budget": 50000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "D4-S1T2-2",
      "title": "해외 인턴십 파견 전 직무 훈련 코스 개설",
      "budget": 50000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "D4-S2T3-1",
      "title": "자매대학 교환교류 및 공동 연구 세션 설계",
      "budget": 50000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 50000000, "spent": 50000000 }
      ]
    },
    {
      "id": "D4-S2T4-1",
      "title": "글로벌 지산학 거버넌스 위원회 회의 개최",
      "budget": 10000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 10000000, "spent": 10000000 }
      ]
    },
    {
      "id": "D4-S2T4-2",
      "title": "해외 우수 바이어 초청 수출상담회 연계",
      "budget": 110000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 110000000, "spent": 110000000 }
      ]
    },
    {
      "id": "D4-S2T4-3",
      "title": "글로벌 공동 연구 성과공유 세미나 개최",
      "budget": 60000000,
      "assignee": "R&BD지원센터",
      "budget_categories": [
        { "category": "교육∙연구 프로그램 개발∙운영비", "budget": 60000000, "spent": 60000000 }
      ]
    }
  ,
    {
      "id": "D4-S3T7-1",
      "title": "공통경비",
      "budget": 10000000,
      "assignee": "국제교류원"
    }]
};

// 1차년도 단위과제 예산 메타데이터
export const Y1_UNIT_META = {
  "A1가": {
    "budget": 2978000000,
    "national": 2683000000,
    "city": 295000000,
    "carry": 0
  },
  "A2": {
    "budget": 900000000,
    "national": 900000000,
    "city": 0,
    "carry": 120000000
  },
  "A3": {
    "budget": 483000000,
    "national": 362000000,
    "city": 121000000,
    "carry": 60000000
  },
  "B1": {
    "budget": 300000000,
    "national": 300000000,
    "city": 0,
    "carry": 100000000
  },
  "B2": {
    "budget": 900000000,
    "national": 900000000,
    "city": 0,
    "carry": 300000000
  },
  "B3": {
    "budget": 400000000,
    "national": 312000000,
    "city": 88000000,
    "carry": 80000000
  },
  "B4": {
    "budget": 400000000,
    "national": 370000000,
    "city": 30000000,
    "carry": 50000000
  },
  "C1": {
    "budget": 700000000,
    "national": 515000000,
    "city": 185000000,
    "carry": 150000000
  },
  "C2": {
    "budget": 300000000,
    "national": 275000000,
    "city": 25000000,
    "carry": 80000000
  },
  "D1": {
    "budget": 500000000,
    "national": 440000000,
    "city": 60000000,
    "carry": 100000000
  },
  "D2": {
    "budget": 1200000000,
    "national": 1200000000,
    "city": 0,
    "carry": 200000000
  },
  "D3": {
    "budget": 700000000,
    "national": 622000000,
    "city": 78000000,
    "carry": 100000000
  }
};
