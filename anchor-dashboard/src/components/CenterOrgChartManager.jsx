import React, { useState } from "react";
import { Network, Users, ChevronRight, Info, ShieldAlert, Award, ArrowRightLeft } from "lucide-react";

export default function CenterOrgChartManager() {
  const [hoveredNode, setHoveredNode] = useState(null);

  // 툴팁 상세 매핑 정보
  const nodeDetails = {
    president: {
      title: "울산과학대학교 총장",
      desc: "앵커 사업 총괄 책임자 및 최고 승인 권한자",
      tasks: ["앵커 계획 및 핵심 성과 총괄 승인", "지자체-대학 거버넌스 협력체계 구축 총괄", "대학 예산 배분 및 최종 감사"]
    },
    director: {
      title: "앵커사업단장 (송경영 단장)",
      desc: "울산과학대학교 영커 사업 실무 집행 최고 책임자",
      tasks: ["앵커사업단 운영 및 전 과정 의사결정 주도", "연차별 사업 예산 조정 및 핵심 성과지표(KPI) 관리", "지자체 협력 및 외부 거버넌스 회의 대표 참여"]
    },
    hq_head: {
      title: "총괄본부장 (김현수 본부장)",
      desc: "사업단 실무 집행 조정 및 센터 간 융합 과제 조율 책임자",
      tasks: ["5개 센터 간 협업 과제 및 마일스톤 통합 관리", "집행 실적 정기 검토 및 사업계획 변경 1차 심사", "실무 부서 애로사항 해결 및 단장 보좌"]
    },
    operation: {
      title: "사업운영팀 (심현미 팀장 & 연구원 4명)",
      desc: "사업단 총괄 지원, 예산 집행, 성과 지표 정기 모니터링 실무팀",
      tasks: ["사업비 정산, 지출 승인 및 예산 관리 총괄", "교육부 공통/자율 지표 실적 수집 및 통계 관리", "회의록 등록, 상장/이수증 발급 및 대시보드 관리"]
    },
    aidx: {
      title: "AID-X 지원센터 [B2]",
      desc: "학내 디지털 전환(DX) 및 AI 교육 실증 전담 센터",
      tasks: ["AI 활용 직업교육과정 공동 개발 및 인프라 구축", "AI·DX 특화 융합 교육 모델 실증 연구 지원", "학생 대상 첨단 디지털 장비 실습 교육 가동"]
    },
    ecc: {
      title: "지산학교육센터(ECC) [A1/A2/A3]",
      desc: "지산학 연계 주문식 교육과정 및 인프라 고도화 센터",
      tasks: ["지산학 융합 전공 및 주문식 교육 트랙 개발", "로컬 창업 프로그램 기획 및 스타트업 연계 육성", "G-VET 글로벌 직업교육 가동 및 해외 정주 연계"]
    },
    icc: {
      title: "기업협업센터(ICC) [B1/B3/B4]",
      desc: "산학협동 연구과제 및 재직자 직무 교육 총괄 센터",
      tasks: ["가족기업 연계 공동 기술 개발 과제 검토 및 자금 지원", "지속가능 및 지역 산업안전 특화 교육 프로그램 개발", "산업체 재직자 단기 직무 연수 및 특허 출원 지원"]
    },
    rcc: {
      title: "지역협업센터(RCC) [C1/D2/D1/D3]",
      desc: "지역 공헌, 도시재생 및 정주 활성화 특화 센터",
      tasks: ["지자체-지역 복지/문화 리더 연계 공헌 프로그램 기획", "로컬 크리에이터 양성 및 정주 환경 개선 자문", "RCC 마일리지 장학금 지급 기준 심사 및 수혜자 선발"]
    },
    neulbom: {
      title: "울산늘봄 누리센터 [C2]",
      desc: "초등 늘봄 연계 교육 표준안 설계 및 강사 매칭 센터",
      tasks: ["울산형 늘봄학교 맞춤형 표준 교과 과정 연구", "우수 늘봄 강사 선발, 양성 및 일선 학교 매칭 관리", "늘봄 교육 만족도 평가 및 피드백 모니터링"]
    }
  };

  const handleMouseEnter = (nodeId) => {
    setHoveredNode(nodeId);
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  return (
    <div className="org-chart-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", userSelect: "none" }}>

      {/* 1. 상단 타이틀 배너 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          <Network size={22} />
          🏛️ 앵커사업단 조직도
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
          울산과학대학교 앵커사업의 성공을 위한 <strong>1단 1본부 5센터 10팀 (총원 43명)</strong> 의 최고 의사결정 기구 및 핵심 수행 거버넌스 체계입니다.
          각 조직 노드에 마우스를 올리면 상세 역할과 미션을 확인하실 수 있습니다.
        </p>
      </div>

      {/* 2. 조직도 그래픽 영역 (수직 Flex 레이어 구조로 구조적 한계 극복) */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "rgba(0,0,0,0.2)",
        padding: "2rem",
        paddingBottom: "3rem",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        minHeight: "680px",
        minWidth: "1480px",
        overflowX: "auto",
        position: "relative",
        gap: "1.5rem"
      }}>

        {/* 상단 레이어: 좌측 위원회 + 중앙 1~3층 트리 + 우측 거버넌스 (수평 간격을 획기적으로 조여 절반으로 만듦!) */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "2.5rem",
          width: "100%",
          maxWidth: "1050px"
        }}>

          {/* ================= 좌측: 사업단 내부 위원회 ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "170px", paddingTop: "4.8rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "var(--accent-color)", borderBottom: "2px solid var(--accent-color)", paddingBottom: "0.2rem", marginBottom: "0.2rem", textAlign: "center" }}>
              사업단 내부 위원회
            </div>
            {[
              { id: "c1", name: "앵커총괄위원회", color: "#6366f1" },
              { id: "c2", name: "앵커기획위원회", color: "#6366f1" },
              { id: "c3", name: "자체평가위원회", color: "#6366f1" },
              { id: "c4", name: "사업비관리위원회", color: "#6366f1" },
              { id: "c5", name: "사업운영위원회", color: "#10b981" }
            ].map(c => (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.5rem",
                  borderRadius: "6px",
                  borderLeft: `3px solid ${c.color}`,
                  textAlign: "center",
                  background: "var(--panel-bg)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease"
                }}
              >
                {c.name}
              </div>
            ))}
          </div>

          {/* ================= 중앙: 1~3층 수직 트리 ================= */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.1rem", width: "420px" }}>
            {/* 1층: 총장 */}
            <div
              onMouseEnter={() => handleMouseEnter("president")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "340px",
                padding: "0.9rem",
                background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
                border: hoveredNode === "president" ? "1.5px solid var(--accent-color)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: hoveredNode === "president" ? "0 0 20px rgba(236,72,153,0.3)" : "0 10px 25px rgba(0,0,0,0.3)",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredNode === "president" ? "scale(1.03)" : "scale(1)"
              }}
            >
              <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "900", color: "#f8fafc", letterSpacing: "1px" }}>울산과학대학교 총장</h4>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.2rem" }}>앵커사업 총괄 최고 의사결정 권한</div>
            </div>

            {/* 연결선 */}
            <div style={{ width: "2px", height: "14px", background: "rgba(255, 255, 255, 0.45)" }} />

            {/* 2층: 앵커사업단장 */}
            <div
              onMouseEnter={() => handleMouseEnter("director")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "340px",
                padding: "1rem",
                background: "linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)",
                border: hoveredNode === "director" ? "1.5px solid var(--accent-color)" : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: hoveredNode === "director" ? "0 0 20px rgba(236,72,153,0.3)" : "0 10px 25px rgba(0,0,0,0.3)",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredNode === "director" ? "scale(1.03)" : "scale(1)"
              }}
            >
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#f8fafc" }}>앵커사업단장</h4>
              <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#f59e0b", marginTop: "0.2rem" }}>송경영 단장</div>
            </div>

            {/* 연결선 */}
            <div style={{ width: "2px", height: "14px", background: "rgba(255, 255, 255, 0.45)" }} />

            {/* 3층: 총괄본부장 & 사업운영팀 */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
              {/* 총괄본부장 */}
              <div
                onMouseEnter={() => handleMouseEnter("hq_head")}
                onMouseLeave={handleMouseLeave}
                style={{
                  width: "280px",
                  padding: "0.9rem",
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  border: hoveredNode === "hq_head" ? "1.5px solid var(--accent-color)" : "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: hoveredNode === "hq_head" ? "0 0 20px rgba(236,72,153,0.3)" : "0 8px 20px rgba(0,0,0,0.25)",
                  borderRadius: "10px",
                  textAlign: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: hoveredNode === "hq_head" ? "scale(1.03)" : "scale(1)"
                }}
              >
                <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "900", color: "#f1f5f9" }}>총괄본부장</h4>
                <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#38bdf8", marginTop: "0.2rem" }}>김현수 본부장</div>
              </div>

              {/* 지원 부서 연결선 (수평 점선) */}
              <div style={{
                position: "absolute",
                left: "calc(50% + 140px)",
                width: "40px",
                height: "0px",
                borderTop: "2px dashed rgba(255, 255, 255, 0.45)",
                zIndex: 1
              }} />

              {/* 사업운영팀 (지원) */}
              <div
                onMouseEnter={() => handleMouseEnter("operation")}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: "absolute",
                  left: "calc(50% + 180px)",
                  width: "200px",
                  padding: "0.75rem",
                  background: "rgba(132, 204, 22, 0.04)",
                  border: hoveredNode === "operation" ? "1.5px solid #84cc16" : "1px solid rgba(132, 204, 22, 0.3)",
                  boxShadow: hoveredNode === "operation" ? "0 0 15px rgba(132, 204, 22, 0.25)" : "0 4px 15px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  transition: "all 0.3s ease",
                  transform: hoveredNode === "operation" ? "scale(1.03)" : "scale(1)"
                }}
              >
                <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "#a3e635" }}>사업운영팀 (지원)</h4>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.2rem", lineHeight: "1.3" }}>
                  <strong>심현미 팀장</strong>
                  <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.1rem" }}>연구원 4명</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 우측: 대학 및 외부 연계 거버넌스 ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "170px", paddingTop: "4.8rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "var(--accent-color)", borderBottom: "2px solid var(--accent-color)", paddingBottom: "0.2rem", marginBottom: "0.2rem", textAlign: "center" }}>
              대학/지자체 거버넌스
            </div>
            {[
              { id: "e1", name: "대학평의원회 등 제위원회", color: "#6366f1" },
              { id: "e2", name: "(통합) 예산및성과관리위원회", color: "#f59e0b" },
              { id: "e3", name: "(통합) 참여·소통위원회", color: "#ec4899" }
            ].map(e => (
              <div
                key={e.id}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.5rem",
                  borderRadius: "6px",
                  borderRight: `3px solid ${e.color}`,
                  textAlign: "center",
                  background: "var(--panel-bg)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease"
                }}
              >
                {e.name}
              </div>
            ))}
          </div>

        </div>

        {/* 중간 레이어: 총괄본부장에서 5대 센터로 내려가는 선명한 분기 가이드라인 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: "-0.5rem" }}>
          <div style={{ width: "2px", height: "15px", background: "rgba(255, 255, 255, 0.45)" }} />
          <div style={{ width: "84%", height: "2px", background: "rgba(255, 255, 255, 0.45)" }} />
        </div>

        {/* 하위 레이어: 4층 5대 센터 (가로 1400px 이상으로 아주 넓고 시원하게 독립 배치!) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "1.2rem",
          width: "100%",
          maxWidth: "1440px",
          alignItems: "start",
          marginTop: "-1rem"
        }}>

          {/* 1. AID-X 지원센터 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "2px", height: "12px", background: "rgba(255, 255, 255, 0.45)" }} />
            <div
              onMouseEnter={() => handleMouseEnter("aidx")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "0.8rem",
                background: "var(--panel-bg)",
                borderTop: "4px solid #6b7280",
                borderLeft: "1px solid var(--border-color)",
                borderRight: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                boxShadow: hoveredNode === "aidx" ? "0 8px 20px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: hoveredNode === "aidx" ? "translateY(-4px)" : "none"
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#9ca3af", background: "rgba(107, 114, 128, 0.15)", padding: "0.15rem 0.3rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.4rem" }}>
                B2과제 특화
              </div>
              <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--text-primary)" }}>AID-X 지원센터</h5>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginTop: "0.3rem" }}>김현수 센터장</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>운영실 (연구원 3명)</div>

              <div style={{ borderTop: "1px dashed var(--border-color)", marginTop: "0.5rem", paddingTop: "0.4rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#a3e635", fontWeight: "700" }}>AI·DX교육팀</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.1rem" }}>(이정준)</div>
              </div>
            </div>
          </div>

          {/* 2. 지산학교육센터(ECC) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "2px", height: "12px", background: "rgba(255, 255, 255, 0.45)" }} />
            <div
              onMouseEnter={() => handleMouseEnter("ecc")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "0.8rem",
                background: "var(--panel-bg)",
                borderTop: "4px solid #10b981",
                borderLeft: "1px solid var(--border-color)",
                borderRight: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                boxShadow: hoveredNode === "ecc" ? "0 8px 20px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: hoveredNode === "ecc" ? "translateY(-4px)" : "none"
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#34d399", background: "rgba(16, 185, 129, 0.15)", padding: "0.15rem 0.3rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.4rem" }}>
                A1~A3과제
              </div>
              <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--text-primary)" }}>지산학교육센터</h5>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginTop: "0.3rem" }}>이동은 센터장</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>연구원 5명</div>

              <div style={{ borderTop: "1px dashed var(--border-color)", marginTop: "0.5rem", paddingTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left", paddingLeft: "0.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: "800", marginRight: "0.2rem" }}>[A1]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>HYPER교육 (장광일)</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: "800", marginRight: "0.2rem" }}>[A2]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>로컬창업 (고형석)</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: "800", marginRight: "0.2rem" }}>[A3]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>G-VET운영 (양승호)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 기업협업센터(ICC) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "2px", height: "12px", background: "rgba(255, 255, 255, 0.45)" }} />
            <div
              onMouseEnter={() => handleMouseEnter("icc")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "0.8rem",
                background: "var(--panel-bg)",
                borderTop: "4px solid #2563eb",
                borderLeft: "1px solid var(--border-color)",
                borderRight: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                boxShadow: hoveredNode === "icc" ? "0 8px 20px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: hoveredNode === "icc" ? "translateY(-4px)" : "none"
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#60a5fa", background: "rgba(37, 99, 235, 0.15)", padding: "0.15rem 0.3rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.4rem" }}>
                B1/B3/B4과제
              </div>
              <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--text-primary)" }}>기업협업센터</h5>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginTop: "0.3rem" }}>김기범 센터장</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>연구원 4명</div>

              <div style={{ borderTop: "1px dashed var(--border-color)", marginTop: "0.5rem", paddingTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left", paddingLeft: "0.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#60a5fa", fontWeight: "800", marginRight: "0.2rem" }}>[B1]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>R&BD지원 (김기범)</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#60a5fa", fontWeight: "800", marginRight: "0.2rem" }}>[B3]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>지속가능실천 (김산)</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#60a5fa", fontWeight: "800", marginRight: "0.2rem" }}>[B4]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>산업안전지원 (한미라)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 지역협업센터(RCC) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "2px", height: "12px", background: "rgba(255, 255, 255, 0.45)" }} />
            <div
              onMouseEnter={() => handleMouseEnter("rcc")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "0.8rem",
                background: "var(--panel-bg)",
                borderTop: "4px solid #f59e0b",
                borderLeft: "1px solid var(--border-color)",
                borderRight: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                boxShadow: hoveredNode === "rcc" ? "0 8px 20px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: hoveredNode === "rcc" ? "translateY(-4px)" : "none"
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#fbbf24", background: "rgba(245, 158, 11, 0.15)", padding: "0.15rem 0.3rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.4rem" }}>
                C1/D1/D2/D3
              </div>
              <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--text-primary)" }}>지역협업센터</h5>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginTop: "0.3rem" }}>현용환 센터장</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>연구원 6명</div>

              <div style={{ borderTop: "1px dashed var(--border-color)", marginTop: "0.5rem", paddingTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left", paddingLeft: "0.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: "800", marginRight: "0.2rem" }}>[C1]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>LIFE교육 (김민경)</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: "800", marginRight: "0.2rem" }}>[D1]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>LBA대응 (이한도)</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: "800", marginRight: "0.2rem" }}>[D3]</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>로컬브릿지 (이상현)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. 울산늘봄 누리센터 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "2px", height: "12px", background: "rgba(255, 255, 255, 0.45)" }} />
            <div
              onMouseEnter={() => handleMouseEnter("neulbom")}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "0.8rem",
                background: "var(--panel-bg)",
                borderTop: "4px solid #ec4899",
                borderLeft: "1px solid var(--border-color)",
                borderRight: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                boxShadow: hoveredNode === "neulbom" ? "0 8px 20px rgba(0,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: hoveredNode === "neulbom" ? "translateY(-4px)" : "none"
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#f472b6", background: "rgba(236, 72, 153, 0.15)", padding: "0.15rem 0.3rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.4rem" }}>
                C2과제 특화
              </div>
              <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--text-primary)" }}>울산늘봄 누리센터</h5>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginTop: "0.3rem" }}>홍광표 센터장</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>운영실 (연구원 3명)</div>
            </div>
          </div>

        </div>

        {/* 우하단 기구 요약 가로 한줄 표출 */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          right: "20px",
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          background: "var(--panel-bg)",
          border: "1px solid var(--border-color)",
          padding: "0.3rem 0.8rem",
          borderRadius: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          📍 기구 요약: <strong>1단 1본부 5센터 10팀</strong> | 총수행원: <strong style={{ color: "var(--accent-color)" }}>43명</strong>
        </div>

      </div>

      {/* 3. 실시간 인터랙션 정보창 (Hovered Info) */}
      <div className="glass-card" style={{
        padding: "1.25rem",
        borderRadius: "10px",
        background: "var(--panel-bg)",
        border: "1px solid var(--border-color)",
        minHeight: "130px",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        transition: "all 0.25s ease"
      }}>
        {hoveredNode ? (
          <div>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Info size={16} />
              {nodeDetails[hoveredNode].title}
            </h4>
            <p style={{ margin: "0.25rem 0 0.5rem 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {nodeDetails[hoveredNode].desc}
            </p>
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-primary)" }}>핵심 실무 및 미션:</span>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                {nodeDetails[hoveredNode].tasks.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100px", color: "var(--text-tertiary)", gap: "0.5rem" }}>
            <Users size={32} style={{ opacity: 0.3 }} />
            <span style={{ fontSize: "0.8rem" }}>조직도 노드에 마우스를 올리면 각 기구의 실무 과제와 세부 책임 내용이 여기에 표출됩니다.</span>
          </div>
        )}
      </div>

    </div>
  );
}
