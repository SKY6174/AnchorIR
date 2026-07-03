import React, { useState } from "react";
import { Info, Award, Layout, GitFork } from "lucide-react";

// 1. 프로젝트 및 단위과제 매핑 정보 정의 (2차년도 기준)
const PROJECTS_DATA = [
  {
    id: "A",
    title: "프로젝트 A : 울산에 뿌리내리는 정주형 실전 인재 양성(Dynamic TALENT)",
    units: [
      { id: "A1가", title: "지역과 미래를 만드는 UC-HYPER 전문기술인재양성" },
      { id: "A1나", title: "스마트·친환경선박 직업교육의 글로벌 스탠더드" },
      { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" },
      { id: "A3", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" }
    ]
  },
  {
    id: "B",
    title: "프로젝트 B : 기업과 하나되는 지⋅산⋅학⋅연 초연결 생태계 조성(Dynamic BRIDGE)",
    units: [
      { id: "B1", title: "울산지역 주력·신산업 분야 산학협력 체계 구축" },
      { id: "B2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      { id: "B3", title: "지･산･학 협력 탄소중립 실천 플랫폼 구축" },
      { id: "B4", title: "복합재난 대응 산업안전·보건 통합 운영체계 구축" }
    ]
  },
  {
    id: "C",
    title: "프로젝트 C : 다시 뛰게 만드는 생애 ‘직무 도약’ 체계 구축(Dynamic JUMP)",
    units: [
      { id: "C1", title: "U-LIFE 평생직업교육 기반 취∙창업 연계모델 구축" },
      { id: "C2", title: "동남권과 함께 성장하는 돌봄생태계, 울산愛 구현" }
    ]
  },
  {
    id: "D",
    title: "프로젝트 D : 지역생활 안전⋅의료⋅정주 협력체계 구축(DynamicCARE)",
    units: [
      { id: "D1", title: "지역문제해결을 위한 울산형 혁신 솔루션 구축" },
      { id: "D2", title: "지속가능한 보건복지 특성화 및 인재양성 체계 구축" },
      { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" }
    ]
  }
];

// 2. 단위과제별 전략(S) 및 추진과제(T) 매핑 사전 정의
const STRATEGY_TASK_MAPPING = {
  "A1가": {
    strategy: "S1: 정주형 산업실전 인재 양성 (Dynamic TALENT)",
    tasks: [
      "T1: UC-HYPER 전문기술인재 양성을 위한 교육과정 혁신",
      "T2: 지역 특화 핵심 교원 교육역량 및 연구 혁신성 제고",
      "T3: 첨단 특화 실습실(ECC) 인프라 구축 및 지역 공동 개방"
    ],
    programs: [
      { id: "A1가-S1T1-1", title: "UC-HYPER 교수법 개발 및 교재 보급" },
      { id: "A1가-S1T1-2", title: "지역 연계형 주문식 교육과정 및 마이크로디그리 설계" },
      { id: "A1가-S1T2-3", title: "특화분야 자격증 및 전문가 실무과정 지원" },
      { id: "A1가-S1T3-4", title: "개방형설계센터 인프라 및 공동 실험장비 고도화" }
    ]
  },
  "A1나": {
    strategy: "S1: 정주형 산업실전 인재 양성 (Dynamic TALENT)",
    tasks: [
      "T1: 글로벌 친환경선박 분야 기술표준 직업교육 체계 구축",
      "T2: 스마트 친환경선박 신호 및 제어 전공과정 도입",
      "T3: 글로벌 인턴십 및 취업 연계 환류 시스템 구축"
    ],
    programs: [
      { id: "A1나-S1T1-1", title: "친환경선박 직업교육 글로벌 표준 표준 교과 개편" },
      { id: "A1나-S1T2-2", title: "신산업 이관 전담 실무 교육장비 가동" },
      { id: "A1나-S1T3-3", title: "선도 조선소 연계 맞춤형 글로벌 인턴십 프로그램" }
    ]
  },
  "A2": {
    strategy: "S2: 로컬 창업 활성화 및 혁신 인프라 확산",
    tasks: [
      "T1: 글로컬 연계 대학생 창업동아리 및 생태계 조성",
      "T2: 지역 창업 유관기관 네트워크 통합 및 비즈니스 인큐베이팅"
    ],
    programs: [
      { id: "A2-S2T1-1", title: "창업 경진대회 및 시드 머니 지원 사업" },
      { id: "A2-S2T2-2", title: "지산학 연계 스타트업 엑셀러레이팅 프로그램" }
    ]
  },
  "A3": {
    strategy: "S2: 로컬 창업 활성화 및 혁신 인프라 확산",
    tasks: [
      "T1: 창업 기업 맞춤형 지식재산권(IP) 확보 및 기술이전 지원",
      "T2: 예비 청년 창업가 멘토링 프로그램 운영"
    ],
    programs: [
      { id: "A3-S2T1-1", title: "기술 연계형 특허 분석 및 상용화 지원 사업" },
      { id: "A3-S2T2-2", title: "울산 청년 창업 아카데미 멘토단 운영" }
    ]
  },
  "B1": {
    strategy: "S3: 지·산·학·연 초연결 생태계 구축 (Dynamic BRIDGE)",
    tasks: [
      "T1: 울산 주력산업 맞춤형 원스톱 기술지도·공동연구망 개설",
      "T2: 특화 신산업 재직자 직무 업스킬링 교육체계 도입"
    ],
    programs: [
      { id: "B1-S3T1-1", title: "신산업 산학 공동 연구과제 발굴 및 매칭" },
      { id: "B1-S3T2-2", title: "주력산업 재직자 기술 고도화 특별반 과정" }
    ]
  },
  "B2": {
    strategy: "S4: 지역산업 디지털 전환 (AID-X 역량강화)",
    tasks: [
      "T1: 제조/화학 등 지역 전통 기업의 AI/DX 진단 프로그램 운영",
      "T2: 인공지능 기반 공정자동화 실무인력 재교육 시스템 구축"
    ],
    programs: [
      { id: "B2-S4T1-1", title: "전통 중소제조기업 디지털 전환 컨설팅" },
      { id: "B2-S4T2-2", title: "AI/DX 융합 제조혁신 인재 아카데미 운영" }
    ]
  },
  "B3": {
    strategy: "S5: 지산학 협력 탄소중립 실천 플랫폼 구축",
    tasks: [
      "T1: 탄소중립 그린 파트너십 구축 및 성과 교류회 개최",
      "T2: 기후 위기 탄소배출 진단 및 모니터링 환경 조성"
    ],
    programs: [
      { id: "B3-S5T1-1", title: "울산 탄소중립 지산학 실천위원회 구성 및 세미나" },
      { id: "B3-S5T2-2", title: "지역사회 그린 실천 캠페인 프로그램 지원" }
    ]
  },
  "B4": {
    strategy: "S6: 복합재난 대응 산업안전·보건 관리체계",
    tasks: [
      "T1: 화학단지 재난예방 가상 시뮬레이션 교육훈련센터 구축",
      "T2: 중소기업 산업안전보건 컨설팅 지원단 운영"
    ],
    programs: [
      { id: "B4-S6T1-1", title: "산업안전 시뮬레이션 가상 훈련 교재 개발" },
      { id: "B4-S6T2-2", title: "안전보건 진단 컨설팅 및 소기업 가이드 배포" }
    ]
  },
  "C1": {
    strategy: "S7: 평생직업교육 활성화를 통한 생애주기 도약 (Dynamic JUMP)",
    tasks: [
      "T1: U-LIFE 평생교육 아카데미 및 맞춤형 직무 단기과정",
      "T2: 지역 취업 취약계층 일자리 상담 및 재취업 매칭 연계"
    ],
    programs: [
      { id: "C1-S7T1-1", title: "U-LIFE 생애주기 맞춤형 자격증 단기 코스" },
      { id: "C1-S7T2-2", title: "은퇴자 직무 전환 및 정착 일자리 매칭 아카데미" }
    ]
  },
  "C2": {
    strategy: "S8: 동남권 돌봄 생태계 및 울산愛 실현",
    tasks: [
      "T1: 초고령화 및 보육 보완형 전문 돌봄 복지인재 양성",
      "T2: 지역사회 취약가정 복지 거버넌스 케어 연계 활동"
    ],
    programs: [
      { id: "C2-S8T1-1", title: "동남권 표준 영유아 및 실버 케어 자격 지원" },
      { id: "C2-S8T2-2", title: "울산愛 커뮤니티 돌봄 홈서비스 실증 프로젝트" }
    ]
  },
  "D1": {
    strategy: "S9: 울산형 리빙랩 및 혁신 솔루션 (Dynamic CARE)",
    tasks: [
      "T1: 지역 밀착형 사회문제 해결을 위한 다자간 리빙랩 운영",
      "T2: 도시재생 및 교통·환경 인프라 개선 지원단 조직"
    ],
    programs: [
      { id: "D1-S9T1-1", title: "리빙랩 기반 지역 현안 발굴 및 개선 프로젝트" },
      { id: "D1-S9T2-2", title: "울산 원도심 활성화 및 청년 유입 환경 조사" }
    ]
  },
  "D2": {
    strategy: "S10: 보건복지 보육 특성화 및 정주 촉진",
    tasks: [
      "T1: 정주 선진 보건의료 서비스 인력 육성 인프라 보강",
      "T2: 늘봄 누리 교사 연계형 아동 복지 보육 연수 과정"
    ],
    programs: [
      { id: "D2-S10T1-1", title: "보건복지 계열 특성화 실습 시설 및 전문가 파견" },
      { id: "D2-S10T2-2", title: "교육청 연계 늘봄 프로그램 교구 및 콘텐츠 연수" }
    ]
  },
  "D3": {
    strategy: "S11: 에코 컬처 기반 울산 문화 콘텐츠 확산",
    tasks: [
      "T1: 에코 관광·문화예술 로컬 크리에이터 양성 프로그램",
      "T2: 시민 참여형 문화축제 기획 및 도시 재미 요소 개발"
    ],
    programs: [
      { id: "D3-S11T1-1", title: "에코 투어 전문 해설 크리에이터 창업 캠프" },
      { id: "D3-S11T2-2", title: "울산 대표 축제 연계 체험 콘텐츠 및 굿즈 기획" }
    ]
  }
};

export default function UnitSystemView() {
  const [selectedProjectId, setSelectedProjectId] = useState("A");
  
  // 선택한 프로젝트 소속 단위과제들 중 첫 번째 과제를 기본값으로 설정
  const currentProject = PROJECTS_DATA.find(p => p.id === selectedProjectId);
  const defaultUnitId = currentProject && currentProject.units.length > 0 ? currentProject.units[0].id : "";
  
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnitId);

  // 프로젝트 변경 시 단위과제 선택도 자동 스위칭
  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    const targetProj = PROJECTS_DATA.find(p => p.id === projId);
    if (targetProj && targetProj.units.length > 0) {
      setSelectedUnitId(targetProj.units[0].id);
    }
  };

  const selectedUnitData = STRATEGY_TASK_MAPPING[selectedUnitId] || {
    strategy: "추진전략 미등록",
    tasks: ["추진과제 정보가 등록되지 않았습니다."],
    programs: []
  };

  return (
    <div className="unit-system-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* 🚀 상단 블록: 단위과제 기획 체계 설명 카드 */}
      <div className="glass-card" style={{ padding: "1.8rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Info size={20} />
          울산과학대학교 RISE(앵커) 사업 기획 위계 체계
        </h3>
        
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "1.2rem" }}>
          RISE 사업의 효율적인 기획 및 성과관리를 위해 본 대시보드는 <strong>프로젝트 - 단위과제 - 추진전략 - 추진과제 - 프로그램</strong>의 5단계 고유 연계 체계를 도입하여 관리하고 있습니다.
        </p>

        {/* 5단계 체계 카드 리스트 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem", marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--accent-color)", fontWeight: "900", marginBottom: "0.2rem" }}>1단계: PJ</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "white" }}>프로젝트 (Project)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>울산시가 제시한 4대 핵심 사업 분야</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: "900", marginBottom: "0.2rem" }}>2단계: WS</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "white" }}>단위과제 (Workstream)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>목표 달성을 위한 12대 단위 사업 (A1~D3)</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#ec4899", fontWeight: "900", marginBottom: "0.2rem" }}>3단계: S</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "white" }}>추진전략 (Strategy)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>단위과제 달성을 위한 거시적 사업 비전</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#f59e0b", fontWeight: "900", marginBottom: "0.2rem" }}>4단계: T</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "white" }}>추진과제 (Task)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>전략 실현을 위한 고유 중점 분야</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#8b5cf6", fontWeight: "900", marginBottom: "0.2rem" }}>5단계: PG</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "white" }}>프로그램 (Program)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>실질적 예산 및 KPI가 매핑되는 행동 단위</div>
          </div>
        </div>

        {/* 💡 프로그램 ID 작명 규칙 및 액션플랜 설명 */}
        <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", padding: "1rem 1.2rem", borderRadius: "0.4rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
            <GitFork size={15} style={{ color: "var(--accent-color)" }} />
            <strong style={{ fontSize: "0.82rem", color: "white" }}>프로그램 고유 ID 작명 룰 (ID Rule)</strong>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
            <code style={{ background: "rgba(255,255,255,0.08)", padding: "0.1rem 0.3rem", borderRadius: "0.2rem", color: "var(--accent-color)", fontFamily: "monospace" }}>
              단위과제번호-(추진전략번호+추진과제번호)-프로그램번호
            </code>
            <span style={{ margin: "0 0.5rem", color: "#444" }}>|</span>
            예시: <strong style={{ color: "white" }}>A1가-S1T1-1</strong> ➔ 단위과제 <strong style={{ color: "#10b981" }}>A1가</strong>, 추진전략 <strong style={{ color: "#ec4899" }}>S1</strong>, 추진과제 <strong style={{ color: "#f59e0b" }}>T1</strong>에 매핑된 <strong style={{ color: "#8b5cf6" }}>1번 프로그램</strong>을 의미함.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginTop: "0.4rem", fontStyle: "italic" }}>
            * 액션플랜(Action Plan; AP): 각 프로그램 수행을 위해 예산(본사업비/이월비), 담당자, 추진 단계, 마일스톤 기한 등을 상세히 테이블로 명시한 최하위 실천 명세입니다.
          </p>
        </div>
      </div>

      {/* 🛠️ 하단 블록: 프로젝트/단위과제 선택 드롭다운 & 매핑 뷰 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", minHeight: "350px" }}>
        
        {/* 좌측: 상하 디스플레이 드롭다운 패널 */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: "900", color: "white", display: "flex", alignItems: "center", gap: "0.4rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.6rem" }}>
            <Layout size={16} />
            과제 내비게이터
          </h4>

          {/* 1. 프로젝트 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", fontWeight: "700" }}>
              [프로젝트 선택] 4 PJ
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="user-selector"
              style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color-dark)",
                color: "white",
                borderRadius: "0.4rem"
              }}
            >
              {PROJECTS_DATA.map(p => (
                <option key={p.id} value={p.id} style={{ background: "#1e1e1e", color: "white" }}>
                  {p.id} 프로젝트 ({p.id === "A" ? "TALENT" : p.id === "B" ? "BRIDGE" : p.id === "C" ? "JUMP" : "CARE"})
                </option>
              ))}
            </select>
          </div>

          {/* 프로젝트 한 줄 정보 */}
          <div style={{
            fontSize: "0.76rem",
            color: "var(--text-secondary)",
            padding: "0.6rem 0.8rem",
            background: "rgba(255,255,255,0.01)",
            borderLeft: "3px solid var(--accent-color)",
            borderRadius: "0.2rem"
          }}>
            {PROJECTS_DATA.find(p => p.id === selectedProjectId)?.title}
          </div>

          {/* 2. 단위과제 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", fontWeight: "700" }}>
              [단위과제 선택] 12 WS
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="user-selector"
              style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color-dark)",
                color: "white",
                borderRadius: "0.4rem"
              }}
            >
              {PROJECTS_DATA.find(p => p.id === selectedProjectId)?.units.map(u => (
                <option key={u.id} value={u.id} style={{ background: "#1e1e1e", color: "white" }}>
                  {u.id} : {u.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* 단위과제 한 줄 정보 */}
          <div style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            padding: "0.6rem 0.8rem",
            background: "rgba(255,255,255,0.01)",
            borderLeft: "3px solid #10b981",
            borderRadius: "0.2rem"
          }}>
            <strong>{selectedUnitId}</strong>: {PROJECTS_DATA.flatMap(p => p.units).find(u => u.id === selectedUnitId)?.title}
          </div>
        </div>

        {/* 우측: 추진전략(S) 및 추진과제(T) 매핑 출력 영역 */}
        <div className="glass-card" style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* 상단: 전략 (S) 헤더 */}
          <div>
            <span style={{
              fontSize: "0.65rem",
              background: "rgba(236,72,153,0.12)",
              border: "1px solid rgba(236,72,153,0.25)",
              color: "#ec4899",
              padding: "0.15rem 0.4rem",
              borderRadius: "0.2rem",
              fontWeight: "900",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "0.4rem"
            }}>
              추진전략 (Strategy)
            </span>
            <h4 style={{ fontSize: "1rem", color: "white", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Award size={18} style={{ color: "#ec4899" }} />
              {selectedUnitData.strategy}
            </h4>
          </div>

          {/* 중단: 추진과제 (T) 리스트 */}
          <div style={{ flex: 1 }}>
            <span style={{
              fontSize: "0.65rem",
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
              padding: "0.15rem 0.4rem",
              borderRadius: "0.2rem",
              fontWeight: "900",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "0.6rem"
            }}>
              추진과제 (Strategic Tasks)
            </span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {selectedUnitData.tasks.map((task, idx) => (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--border-color-dark)",
                  padding: "0.8rem 1rem",
                  borderRadius: "0.4rem",
                  fontSize: "0.8rem",
                  color: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem"
                }}>
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "900",
                    border: "1px solid rgba(245,158,11,0.25)"
                  }}>
                    {idx + 1}
                  </div>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 하단: 대표 연계 프로그램 (PG) 리스트 */}
          {selectedUnitData.programs && selectedUnitData.programs.length > 0 && (
            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
              <span style={{
                fontSize: "0.65rem",
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#8b5cf6",
                padding: "0.15rem 0.4rem",
                borderRadius: "0.2rem",
                fontWeight: "900",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "0.6rem"
              }}>
                체계 연계 프로그램 예시
              </span>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.5rem" }}>
                {selectedUnitData.programs.map((prog) => (
                  <div key={prog.id} style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.3rem",
                    fontSize: "0.72rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.03)"
                  }}>
                    <span style={{ color: "#aaa" }}>{prog.title}</span>
                    <code style={{
                      color: "#8b5cf6",
                      fontWeight: "700",
                      background: "rgba(139,92,246,0.08)",
                      padding: "0.1rem 0.35rem",
                      borderRadius: "0.25rem",
                      fontFamily: "monospace"
                    }}>
                      {prog.id}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
