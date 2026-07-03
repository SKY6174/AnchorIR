import React, { useState, useEffect } from "react";
import { Award, BookOpen, Layers, Settings, Compass, Share2, ShieldAlert } from "lucide-react";

// 연차별 단위과제 및 주요 프로그램 데이터 명세
const majorProgramsData = {
  1: { // 1차년도
    A1: {
      label: "A1 (지역과 미래를 만드는 UC-HYPER 전문기술인재 양성)",
      programs: [
        { id: "A1_orderly", name: "주문식 교육과정", desc: "지역 산업체 수요 맞춤형 주문식 교육과정 개발 및 운영" }
      ]
    },
    A2: {
      label: "A2 (지역 창업 생태계 혁신을 위한 글로컬 창업인재 양성)",
      programs: [
        { id: "A2_urise_star", name: "U-RISE 스타", desc: "RISE 체계 기반 스타트업 육성 및 글로컬 창업동아리 활성화" }
      ]
    },
    A3: {
      label: "A3 (지역산업 연계 글로벌 협력 거점 대학 육성)",
      programs: [
        { id: "A3_global", name: "글로벌 파트너십", desc: "글로벌 유수 대학 및 연구소 연계 국제 공동 연구 교류" }
      ]
    },
    B1: {
      label: "B1 (중소·중견기업 맞춤형 기술지원·공동연구 활성화)",
      programs: [
        { id: "B1_tech_support", name: "기업 연계 R&BD", desc: "애로기술 해결 지도 및 현장 실증 공동 프로젝트" }
      ]
    },
    B2: {
      label: "B2 (U-LIFE 평생직업교육 플랫폼 구축)",
      programs: [
        { id: "B2_rbnd", name: "R&BD", desc: "지산학 연계 연구개발 및 평생 교육 기술 상용화 프로그램" }
      ]
    },
    B3: {
      label: "B3 (성인학습자 친화형 평생직업교육 과정 개발/운영)",
      programs: [
        { id: "B3_academy", name: "아카데미별", desc: "평생직업교육 아카데미 다변화 및 특화 과정 운영" }
      ]
    },
    B4: {
      label: "B4 (복합재난 대응 산업안전·보건 관리시스템 개발)",
      programs: [
        { id: "B4_safety", name: "산업안전 보건교육", desc: "산업안전 관리 고도화 및 재난 안전 예방 아카데미" }
      ]
    },
    C1: {
      label: "C1 (U-LIFE 평생직업교육 플랫폼 구축)",
      programs: [
        { id: "C1_lifelong", name: "평생학습 활성화", desc: "성인학습자 맞춤형 친화 학사학위 및 비학위 과정 개발" }
      ]
    },
    C2: {
      label: "C2 (지산학 밀착형 지역 현안 대응 및 성과 창출)",
      programs: [
        { id: "C2_aidx", name: "AIDX", desc: "재학생·재직자 AI/DX 공동 융합 교육 및 기술 실증" },
        { id: "C2_mani", name: "동남권-제주MANI", desc: "동남권 및 제주 지역 대학 간 초광역 앵커 협력 모델" }
      ]
    },
    D1: {
      label: "D1 (지역을 키우는 지역문제 해결 협력 체계 구축)",
      programs: [
        { id: "D1_local_problem", name: "지역 현안 해결", desc: "대학-공공기관 협력 체제 구축 및 지역 리빙랩 과제 수행" }
      ]
    },
    D2: {
      label: "D2 (통합형 인재양성 기반 포용적 보건복지서비스 구현)",
      programs: [
        { id: "D2_welfare", name: "보건복지 아카데미", desc: "지역밀착형 시니어 헬스케어 및 복지 서비스 인재 육성" }
      ]
    },
    D3: {
      label: "D3 (에코 컬처로 만드는 꿀잼도시 울산)",
      programs: [
        { id: "D3_culture", name: "로컬 컬처 콘텐츠", desc: "울산 해양/문화 관광 브랜드 콘텐츠 발굴 및 아카데미" }
      ]
    }
  },
  2: { // 2차년도
    A1: {
      label: "A1 (글로컬 지·산·학 협력기반 미래 핵심인재 양성)",
      programs: [
        { id: "A1_orderly_y2", name: "주문식 교육과정", desc: "2차년도 고도화된 산업체 맞춤형 주문식 교육과정" },
        { id: "A1_seminar_y2", name: "지산학 이음 세미나", desc: "지역사회와 대학을 잇는 지산학 동반성장 세미나" }
      ]
    },
    A2: {
      label: "A2 (창업 교육 생태계 혁신 및 글로컬 창업 문화 조성)",
      programs: [
        { id: "A2_anchor_star_y2", name: "앵커 스타", desc: "2차년도 앵커 체계 기반 스타트업 고도화 및 투자 유치 지원" }
      ]
    },
    A3: {
      label: "A3 (지역산업 상생발전 중심 글로벌 교류 아카데미)",
      programs: [
        { id: "A3_global_y2", name: "글로벌 아카데미", desc: "해외 우수 교육 기관 연계 글로벌 교환 인력 및 연수" }
      ]
    },
    B1: {
      label: "B1 (지산학연 기술고도화 및 공동 연구 인프라 구축)",
      programs: [
        { id: "B1_tech_y2", name: "R&BD 고도화", desc: "애로 기술 상용화 연구 및 교내 고가 기자재 활용 지원" }
      ]
    },
    B2: {
      label: "B2 (성인 평생교육 플랫폼 확산 및 기업협력 고도화)",
      programs: [
        { id: "B2_aws_c3", name: "AWS C3 인증", desc: "AWS C3 클라우드 컴퓨팅 국제 자격증 취득 및 AI 연계 교육" },
        { id: "B2_ax_frontier", name: "AX프론티어 동아리", desc: "인공지능 전환(AX) 기술 기반 학생/기업 프론티어 동아리 활동 지원" }
      ]
    },
    B3: {
      label: "B3 (넷제로 탄소중립 실천 친환경 캠퍼스 확산)",
      programs: [
        { id: "B3_netzero_y2", name: "그린에너지 실증", desc: "캠퍼스 내 탄소 저감 기술 모의 실증 및 안전 교육과정" }
      ]
    },
    B4: {
      label: "B4 (지역 복합 재난 예방 및 디지털 안전 시스템 실증)",
      programs: [
        { id: "B4_disaster_y2", name: "디지털 재난안전", desc: "스마트 소방/안전 모니터링 실무 인력 양성 아카데미" }
      ]
    },
    C1: {
      label: "C1 (지역사회 밀착 평생 직업 학습 거점 구축)",
      programs: [
        { id: "C1_lifelong_y2", name: "성인 평생교육", desc: "지역 중소기업 재직자 기술 재교육 및 마이크로 디그리" }
      ]
    },
    C2: {
      label: "C2 (지산학 밀착형 늘봄 및 방과후 학교 상생 벨트)",
      programs: [
        { id: "C2_care_y2", name: "늘봄 아카데미", desc: "지자체-대학 협업형 에듀케어 교육 과정 개발 운영" }
      ]
    },
    D1: {
      label: "D1 (지역 현안 및 취약 분야 사회안전망 구축 리빙랩)",
      programs: [
        { id: "D1_livinglab_y2", name: "리빙랩 아카데미", desc: "지역 밀착형 복지 해결 및 사회 혁신 주체 양성 지원" }
      ]
    },
    D2: {
      label: "D2 (통합 웰니스 시니어 보건의료 전문인재 육성)",
      programs: [
        { id: "D2_wellness_y2", name: "웰니스 헬스케어", desc: "물리치료/간호 웰니스 지역 시니어 봉사 및 아카데미" }
      ]
    },
    D3: {
      label: "D3 (꿀잼도시 조성을 위한 울산 로컬 브랜딩)",
      programs: [
        { id: "D3_branding_y2", name: "로컬 브랜딩", desc: "울산 역사/에코 자원 기반 로컬 관광 상품 개발 기획" }
      ]
    }
  }
};

export default function MajorProgramsManager({ selectedYear }) {
  // 현재 연도에 해당하는 단위과제 목록 추출
  const yearData = majorProgramsData[selectedYear] || {};
  const unitKeys = Object.keys(yearData);Offset: 0

  // 현재 선택된 단위과제 상태 (첫 번째 항목을 디폴트로 설정)
  const [selectedUnit, setSelectedUnit] = useState("");
  // 현재 선택된 프로그램 상태
  const [selectedProg, setSelectedProg] = useState(null);

  // 연도가 변경되면 단위과제 선택 초기화
  useEffect(() => {
    if (unitKeys.length > 0) {
      setSelectedUnit(unitKeys[0]);
      // 디폴트 프로그램 설정
      const defaultProg = yearData[unitKeys[0]]?.programs[0] || null;
      setSelectedProg(defaultProg);
    } else {
      setSelectedUnit("");
      setSelectedProg(null);
    }
  }, [selectedYear]);

  // 단위과제를 변경했을 때 프로그램 선택
  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    const firstProg = yearData[unit]?.programs[0] || null;
    setSelectedProg(firstProg);
  };

  const currentUnitInfo = yearData[selectedUnit] || {};
  const currentPrograms = currentUnitInfo.programs || [];

  return (
    <div className="major-programs-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* 1. 상단 안내 영역 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Compass size={22} className="animate-spin-slow" />
          {selectedYear}차년도 주요 프로그램 관리
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary-dark)", lineHeight: "1.5" }}>
          울산과학대학교 앵커사업단에서 추진하는 핵심 과제별 주요 프로그램을 조회하고 관리할 수 있습니다. 
          좌측 원형 버튼에서 <strong>단위과제</strong>를 선택한 뒤, 하단의 <strong>주요 프로그램</strong>을 골라 상세 현황을 확인하세요.
        </p>
      </div>

      {/* 2. 메인 워크스페이스 레이아웃 (좌측 단위과제 원형 리스트 / 우측 프로그램 정보) */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "2rem" }}>
        
        {/* 좌측 단위과제 원형 버튼 세트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: "1.5rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-secondary-dark)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            과제 선택
          </span>
          {unitKeys.length > 0 ? (
            unitKeys.map((unit) => (
              <button
                key={unit}
                onClick={() => handleUnitChange(unit)}
                className={`unit-circle-btn ${selectedUnit === unit ? "active" : ""}`}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "none",
                  fontSize: "1.1rem",
                  fontWeight: "900",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: selectedUnit === unit 
                    ? "linear-gradient(135deg, var(--accent-color), #3b82f6)" 
                    : "rgba(255, 255, 255, 0.05)",
                  color: selectedUnit === unit ? "#white" : "var(--text-secondary-dark)",
                  boxShadow: selectedUnit === unit 
                    ? "0 4px 15px rgba(59, 130, 246, 0.4)" 
                    : "none",
                  border: selectedUnit === unit ? "2px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.1)"
                }}
              >
                {unit}
              </button>
            ))
          ) : (
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", textAlign: "center" }}>과제 없음</div>
          )}
        </div>

        {/* 우측 프로그램 선택 및 개별 화면 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {selectedUnit ? (
            <>
              {/* 단위과제 라벨 표시 */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: "800" }}>SELECTED TASK</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.2rem" }}>
                  {currentUnitInfo.label}
                </h3>
              </div>

              {/* 주요 프로그램 가로 탭 바 */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {currentPrograms.map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProg(prog)}
                    style={{
                      padding: "0.6rem 1.25rem",
                      borderRadius: "20px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      transition: "all 0.2s ease",
                      background: selectedProg?.id === prog.id 
                        ? "rgba(59, 130, 246, 0.15)" 
                        : "rgba(255, 255, 255, 0.03)",
                      color: selectedProg?.id === prog.id 
                        ? "var(--accent-color)" 
                        : "var(--text-secondary-dark)",
                      border: selectedProg?.id === prog.id 
                        ? "1px solid var(--accent-color)" 
                        : "1px solid rgba(255, 255, 255, 0.08)"
                    }}
                  >
                    {prog.name}
                  </button>
                ))}
              </div>

              {/* 주요 프로그램별 프레임 (상세 화면 준비 중 카드) */}
              {selectedProg ? (
                <div className="glass-card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", textAlign: "center", gap: "1rem" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-color)" }}>
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>
                      {selectedProg.name}
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary-dark)", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
                      {selectedProg.desc}
                    </p>
                  </div>
                  
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "30px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary-dark)"
                  }}>
                    <Settings size={14} className="animate-spin-slow" />
                    <span>프로그램별 상세 성과/관리 화면 구성 준비 중</span>
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                  주요 프로그램을 선택해 주세요.
                </div>
              )}
            </>
          ) : (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
              과제 정보를 가져올 수 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
