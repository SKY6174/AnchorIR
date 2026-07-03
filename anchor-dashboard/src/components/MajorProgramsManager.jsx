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
        { id: "A2_urise_star", name: "앵커 스타", desc: "앵커 체계 기반 스타트업 육성 및 글로컬 창업동아리 활성화" }
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
    C2: {
      label: "C2 (지산학 밀착형 지역 현안 대응 및 성과 창출)",
      programs: [
        { id: "C2_aidx", name: "AIDX", desc: "재학생·재직자 AI/DX 공동 융합 교육 및 기술 실증" },
        { id: "C2_mani", name: "동남권-제주MANI", desc: "동남권 및 제주 지역 대학 간 초광역 앵커 협력 모델" }
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
    B2: {
      label: "B2 (성인 평생교육 플랫폼 확산 및 기업협력 고도화)",
      programs: [
        { id: "B2_aws_c3", name: "AWS C3 인증", desc: "AWS C3 클라우드 컴퓨팅 국제 자격증 취득 및 AI 연계 교육" },
        { id: "B2_ax_frontier", name: "AX프론티어 동아리", desc: "인공지능 전환(AX) 기술 기반 학생/기업 프론티어 동아리 활동 지원" }
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
