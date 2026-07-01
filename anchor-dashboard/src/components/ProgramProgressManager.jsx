import React, { useState } from "react";
import { Calendar, User, Wallet, ClipboardList } from "lucide-react";

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 12개월 타임라인 기준 정보 (2026.03 ~ 2027.02)
const MONTHS_GUIDE = [
  { name: "3월", label: "26.3" },
  { name: "4월", label: "26.4" },
  { name: "5월", label: "26.5" },
  { name: "6월", label: "26.6" },
  { name: "7월", label: "26.7" },
  { name: "8월", label: "26.8" },
  { name: "9월", label: "26.9" },
  { name: "10월", label: "26.10" },
  { name: "11월", label: "26.11" },
  { name: "12월", label: "26.12" },
  { name: "1월", label: "27.1" },
  { name: "2월", label: "27.2" }
];

// YYYY-MM-DD ~ YYYY-MM-DD 포맷 파서
const parseTimelineDates = (timelineStr) => {
  if (!timelineStr || !timelineStr.includes("~")) return { start: "", end: "" };
  const parts = timelineStr.split("~").map((p) => p.trim());
  
  const toYYYYMMDD = (str) => {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const dotted = str.replace(/\./g, "-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(dotted)) return dotted;
    if (/^\d{4}-\d{2}$/.test(dotted)) return `${dotted}-01`;
    return dotted;
  };
  
  return {
    start: toYYYYMMDD(parts[0]),
    end: toYYYYMMDD(parts[1] || parts[0])
  };
};

// 타임라인을 12개월 (P/D/C/A) 배열로 파싱
const parseTimelineToMonths = (timelineStr) => {
  const defaultValue = Array(12).fill("");
  if (!timelineStr) return defaultValue;

  if (timelineStr.includes(",")) {
    const parts = timelineStr.split(",");
    if (parts.length === 12) {
      return parts.map(p => {
        const trimmed = p.trim().toUpperCase();
        if (trimmed.split("").some(char => ["P", "D", "C", "A"].includes(char))) {
          return trimmed;
        }
        return "";
      });
    }
  }

  const dates = parseTimelineDates(timelineStr);
  if (dates.start && dates.end) {
    try {
      const startMonth = parseInt(dates.start.split("-")[1], 10);
      const endMonth = parseInt(dates.end.split("-")[1], 10);

      const getMonthIndex = (m) => {
        if (m >= 3 && m <= 12) return m - 3;
        if (m === 1 || m === 2) return m + 9;
        return -1;
      };

      const startIndex = getMonthIndex(startMonth);
      const endIndex = getMonthIndex(endMonth);

      if (startIndex !== -1 && endIndex !== -1) {
        const arr = Array(12).fill("");
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        for (let i = start; i <= end; i++) {
          arr[i] = "P";
        }
        return arr;
      }
    } catch (e) {
      console.error("Parse timeline to months error:", e);
    }
  }

  return defaultValue;
};

// 프로그램 ID 기반 모의 타임라인 범위 산정 헬퍼
const getProgramTimeline = (progId) => {
  // ID 끝자리 숫자를 추출하여 다채로운 타임라인 할당
  const cleanId = progId.replace(/[^0-9]/g, "");
  const num = cleanId ? parseInt(cleanId.slice(-1), 10) : 1;
  const lastDigit = isNaN(num) ? 1 : num;

  switch (lastDigit % 5) {
    case 1:
      return { start: 0, end: 5, label: "26.03월 ~ 26.08월" }; // 3월 ~ 8월
    case 2:
      return { start: 1, end: 9, label: "26.04월 ~ 26.12월" }; // 4월 ~ 12월
    case 3:
      return { start: 3, end: 10, label: "26.06월 ~ 27.01월" }; // 6월 ~ 1월
    case 4:
      return { start: 5, end: 11, label: "26.08월 ~ 27.02월" }; // 8월 ~ 2월
    default:
      return { start: 2, end: 8, label: "26.05월 ~ 26.11월" }; // 5월 ~ 11월
  }
};

export default function ProgramProgressManager({ projects, selectedYear, onSelectProgram }) {
  const startYr = 2024 + selectedYear;
  const endYr = 2025 + selectedYear;
  const startYrShort = String(startYr).slice(-2);
  const endYrShort = String(endYr).slice(-2);

  const monthsGuide = [
    { name: "3월", label: `${startYrShort}.3` },
    { name: "4월", label: `${startYrShort}.4` },
    { name: "5월", label: `${startYrShort}.5` },
    { name: "6월", label: `${startYrShort}.6` },
    { name: "7월", label: `${startYrShort}.7` },
    { name: "8월", label: `${startYrShort}.8` },
    { name: "9월", label: `${startYrShort}.9` },
    { name: "10월", label: `${startYrShort}.10` },
    { name: "11월", label: `${startYrShort}.11` },
    { name: "12월", label: `${startYrShort}.12` },
    { name: "1월", label: `${endYrShort}.1` },
    { name: "2월", label: `${endYrShort}.2` }
  ];

  const allUnits = projects.flatMap(p => p.units).sort((a, b) => {
    if (a.id === "Common") return 1;
    if (b.id === "Common") return -1;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });
  const [selectedUnitId, setSelectedUnitId] = useState(allUnits[0]?.id || "A1가");

  const activeUnit = allUnits.find(u => u.id === selectedUnitId);

  // 단위과제 클릭 핸들러
  const handleSelectUnit = (unitId) => {
    setSelectedUnitId(unitId);
  };

  return (
    <div className="budget-items-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
      {/* 1. 좌측 패널 (단위과제 목록 카드 리스트) */}
      <div className="glass-card" style={{ padding: "1.2rem", height: "fit-content" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ClipboardList size={18} style={{ color: "var(--accent-color)" }} />
          <span>단위과제 목록</span>
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {allUnits.map((u) => {
            const isActive = u.id === selectedUnitId;
            const uYear = u.years?.[selectedYear] || {};
            const totalBudget = (uYear.budget_main || 0) + (uYear.budget_carry || 0);

            return (
              <div
                key={u.id}
                onClick={() => handleSelectUnit(u.id)}
                className={`unit-item ${isActive ? "active" : ""}`}
                style={{
                  padding: "0.8rem 1rem",
                  borderRadius: "0.5rem",
                  background: isActive ? "rgba(59, 130, 246, 0.08)" : "var(--panel-bg)",
                  border: isActive ? "1.5px solid var(--accent-color)" : "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: isActive ? "var(--accent-color)" : "var(--text-secondary)" }}>
                    {u.id}
                  </span>
                  <span style={{ 
                    fontSize: "0.65rem", 
                    padding: "0.15rem 0.45rem", 
                    borderRadius: "0.25rem", 
                    background: isActive ? "rgba(59, 130, 246, 0.15)" : "rgba(0, 0, 0, 0.04)",
                    color: "var(--text-secondary)",
                    fontWeight: "600"
                  }}>
                    {u.programs?.length || 0}개 프로그램
                  </span>
                </div>
                <div style={{ 
                  fontSize: "0.85rem", 
                  fontWeight: "800", 
                  color: isActive ? "var(--accent-color)" : "var(--text-primary)", 
                  textOverflow: "ellipsis", 
                  overflow: "hidden", 
                  whiteSpace: "nowrap", 
                  marginBottom: "0.4rem" 
                }}>
                  {u.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                  <span>총 예산:</span>
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{formatToMillionWon(totalBudget)} 백만원</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 우측 패널 (세부 프로그램 리스트 및 타임라인 차트) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {activeUnit ? (
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            {/* 상단 단위과제 개요 */}
            <div style={{ borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", fontWeight: "700" }}>
                    {activeUnit.id} 단위과제 진행 현황
                  </span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginTop: "0.2rem" }}>
                    {activeUnit.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* 프로그램 리스트 & 간트 차트 결합형 테이블 */}
            <div className="table-panel" style={{ overflowX: "auto" }}>
              <table className="custom-table" style={{ fontSize: "0.8rem", minWidth: "900px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>ID</th>
                    <th style={{ width: "230px" }}>프로그램명</th>
                    <th style={{ width: "140px" }}>담당연구원</th>
                    <th style={{ width: "130px" }}>운영 예산 (배정/집행)</th>
                    <th style={{ width: "340px", textAlign: "center" }}>
                      {selectedYear}차년도 Timeline
                      {/* 연도 구분 줄 (상위 2분할: 시작년도 10개월 / 끝년도 2개월) */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1px", marginTop: "0.4rem", fontSize: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.2rem", color: "var(--accent-color)" }}>
                        <div style={{ gridColumn: "span 10", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.05)", fontWeight: "800" }}>{startYr}년</div>
                        <div style={{ gridColumn: "span 2", textAlign: "center", fontWeight: "800" }}>{endYr}년</div>
                      </div>
                      {/* 월 구분 줄 */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1px", marginTop: "0.25rem", fontSize: "0.65rem", fontWeight: "normal" }}>
                        {monthsGuide.map((m) => (
                          <div key={m.name} title={`${m.label}월`}>{m.name}</div>
                        ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeUnit.programs && activeUnit.programs.length > 0 ? (
                    activeUnit.programs.map((prog) => {
                      const py = prog.years?.[selectedYear] || {};
                      const totalProgBudget = (py.budget_main || 0) + (py.budget_carry || 0);
                      const totalProgSpent = (py.spent_main || 0) + (py.spent_carry || 0);

                      const monthlyPDCA = parseTimelineToMonths(prog.timeline || "");

                      return (
                        <tr key={prog.id} style={{ height: "80px" }}>
                          <td 
                            onClick={() => onSelectProgram && onSelectProgram(activeUnit.id, prog.id)}
                            style={{ 
                              fontFamily: "var(--font-data)", 
                              fontWeight: "700", 
                              cursor: "pointer", 
                              transition: "color 0.2s" 
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-color)"; e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.textDecoration = "none"; }}
                          >
                            {prog.id}
                          </td>
                          <td 
                            onClick={() => onSelectProgram && onSelectProgram(activeUnit.id, prog.id)}
                            style={{ 
                              fontWeight: "700", 
                              whiteSpace: "normal", 
                              wordBreak: "keep-all", 
                              cursor: "pointer", 
                              transition: "color 0.2s" 
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-color)"; e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.textDecoration = "none"; }}
                          >
                            {prog.title}
                          </td>
                          <td style={{ fontWeight: "700", color: "var(--accent-color)", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              <User size={12} />
                              <span>{prog.assignee || "미배정"}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", fontFamily: "var(--font-data)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-secondary-dark)", fontSize: "0.7rem" }}>배정:</span>
                                <span style={{ fontWeight: "700" }}>{formatToMillionWon(totalProgBudget)} 백만원</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-secondary-dark)", fontSize: "0.7rem" }}>집행:</span>
                                <span style={{ color: "var(--success-color)", fontWeight: "700" }}>{formatToMillionWon(totalProgSpent)} 백만원</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ verticalAlign: "middle", padding: "0.3rem 0.2rem" }}>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(12, 1fr)",
                              gap: "2px",
                              background: "rgba(255, 255, 255, 0.015)",
                              borderRadius: "0.4rem",
                              padding: "2px",
                              border: "1px solid rgba(255,255,255,0.03)"
                            }}>
                              {monthlyPDCA.map((val, idx) => {
                                const steps = val ? val.split(/[\/+&,]/).map(s => s.trim().toUpperCase()).filter(s => ["P", "D", "C", "A"].includes(s)) : [];
                                
                                const getSingleColor = (char, isActual = false, progData = null) => {
                                  if (!char || typeof char !== "string") return "transparent";
                                  if (isActual && progData) {
                                    const stageKey = char.toLowerCase();
                                    const status = progData.pdca?.[stageKey] || "대기";
                                    if (status === "대기") return "transparent";
                                    if (status === "진행") {
                                      if (char === "P") return "rgba(59, 130, 246, 0.45)";
                                      if (char === "D") return "rgba(16, 185, 129, 0.45)";
                                      if (char === "C") return "rgba(245, 158, 11, 0.45)";
                                      if (char === "A") return "rgba(217, 70, 239, 0.45)";
                                    }
                                    // 완료인 경우 선명한 색상
                                  }
                                  if (char === "P") return "#3b82f6";
                                  if (char === "D") return "#10b981";
                                  if (char === "C") return "#f59e0b";
                                  if (char === "A") return "#d946ef";
                                  return "transparent";
                                };

                                // 1. 상단 Plan 바 배경 및 연속 둥글기 계산 (Gantt 연결 바 연출)
                                let planBg = "transparent";
                                if (steps.length === 1) {
                                  planBg = getSingleColor(steps[0]);
                                } else if (steps.length >= 2) {
                                  planBg = `linear-gradient(135deg, ${getSingleColor(steps[0])} 50%, ${getSingleColor(steps[1])} 50%)`;
                                }

                                const hasLeftPlan = idx > 0 && monthlyPDCA[idx - 1] !== "";
                                const hasRightPlan = idx < 11 && monthlyPDCA[idx + 1] !== "";
                                const planRadius = `${!hasLeftPlan ? "4px" : "0"} ${!hasRightPlan ? "4px" : "0"} ${!hasRightPlan ? "4px" : "0"} ${!hasLeftPlan ? "4px" : "0"}`;

                                // 2. 하단 Actual 바 배경 및 연속 둥글기 계산 (Gantt 연결 바 연출)
                                const getActualBg = () => {
                                  // 수동 기입된 실제 타임라인이 존재하면 그것을 최우선으로 사용하여 그립니다.
                                  if (prog.actual_timeline) {
                                    const actualMonths = parseTimelineToMonths(prog.actual_timeline);
                                    const targetActualVal = actualMonths[idx] || "";
                                    const actualSteps = targetActualVal ? targetActualVal.split(/[\/+&,]/).map(s => s.trim().toUpperCase()).filter(s => ["P", "D", "C", "A"].includes(s)) : [];
                                    
                                    if (actualSteps.length === 0) return "transparent";
                                    if (actualSteps.length === 1) {
                                      return getSingleColor(actualSteps[0], true, prog);
                                    } else {
                                      const col1 = getSingleColor(actualSteps[0], true, prog);
                                      const col2 = getSingleColor(actualSteps[1], true, prog);
                                      if (col1 !== "transparent" || col2 !== "transparent") {
                                        const fb1 = col1 !== "transparent" ? col1 : "rgba(255,255,255,0.02)";
                                        const fb2 = col2 !== "transparent" ? col2 : "rgba(255,255,255,0.02)";
                                        return `linear-gradient(135deg, ${fb1} 50%, ${fb2} 50%)`;
                                      }
                                      return "transparent";
                                    }
                                  }

                                  // actual_timeline이 비어있으면 기존의 계획 기반 매핑 자동 폴백
                                  if (steps.length === 0) return "transparent";
                                  if (steps.length === 1) {
                                    return getSingleColor(steps[0], true, prog);
                                  } else {
                                    const col1 = getSingleColor(steps[0], true, prog);
                                    const col2 = getSingleColor(steps[1], true, prog);
                                    if (col1 !== "transparent" || col2 !== "transparent") {
                                      const fb1 = col1 !== "transparent" ? col1 : "rgba(255,255,255,0.02)";
                                      const fb2 = col2 !== "transparent" ? col2 : "rgba(255,255,255,0.02)";
                                      return `linear-gradient(135deg, ${fb1} 50%, ${fb2} 50%)`;
                                    }
                                    return "transparent";
                                  }
                                };
                                const actualBg = getActualBg();

                                const isActualActive = (i) => {
                                  // 수동 기입된 실제 타임라인이 존재하면 그것을 판정 기준으로 삼습니다.
                                  if (prog.actual_timeline) {
                                    const actualMonths = parseTimelineToMonths(prog.actual_timeline) || [];
                                    const actVal = actualMonths[i];
                                    if (!actVal || typeof actVal !== "string") return false;
                                    const sList = actVal.split(/[\/+&,]/).map(s => s.trim().toUpperCase()).filter(s => ["P", "D", "C", "A"].includes(s));
                                    return sList.some(char => {
                                      if (!char || typeof char !== "string") return false;
                                      const status = prog.pdca?.[char.toLowerCase()] || "대기";
                                      return status === "완료" || status === "진행";
                                    });
                                  }

                                  const v = monthlyPDCA[i];
                                  if (!v || typeof v !== "string") return false;
                                  const sList = v.split(/[\/+&,]/).map(s => s.trim().toUpperCase()).filter(s => ["P", "D", "C", "A"].includes(s));
                                  return sList.some(char => {
                                    if (!char || typeof char !== "string") return false;
                                    const status = prog.pdca?.[char.toLowerCase()] || "대기";
                                    return status === "완료" || status === "진행";
                                  });
                                };

                                const hasLeftActual = idx > 0 && isActualActive(idx - 1) && isActualActive(idx);
                                const hasRightActual = idx < 11 && isActualActive(idx + 1) && isActualActive(idx);
                                const actualRadius = `${!hasLeftActual ? "4px" : "0"} ${!hasRightActual ? "4px" : "0"} ${!hasRightActual ? "4px" : "0"} ${!hasLeftActual ? "4px" : "0"}`;

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      height: "36px",
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "space-between",
                                      position: "relative",
                                      padding: "2px 0",
                                      background: "rgba(255, 255, 255, 0.01)",
                                      borderRight: "1px dashed rgba(255,255,255,0.03)"
                                    }}
                                  >
                                    {/* 상단: 계획(Plan) Gantt Bar */}
                                    {val ? (
                                      <div
                                        title={`계획: ${val}단계`}
                                        style={{
                                          height: "10px",
                                          background: planBg,
                                          borderRadius: planRadius,
                                          fontSize: "0.52rem",
                                          fontWeight: "900",
                                          color: "white",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          lineHeight: 1,
                                          position: "relative"
                                        }}
                                      >
                                        <span style={{ transform: "scale(0.85)" }}>{val}</span>
                                        {hasRightPlan && (
                                          <span style={{ position: "absolute", right: "-3px", fontSize: "0.45rem", opacity: 0.6, zIndex: 2 }}>➔</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div style={{ height: "10px" }} />
                                    )}

                                    {/* 중앙: 상/하 연결 화살표 데코레이션 */}
                                    {val && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          left: "50%",
                                          top: "50%",
                                          transform: "translate(-50%, -50%)",
                                          fontSize: "0.55rem",
                                          color: "rgba(255, 255, 255, 0.35)",
                                          fontWeight: "bold",
                                          zIndex: 10,
                                          pointerEvents: "none"
                                        }}
                                      >
                                        ↓
                                      </div>
                                    )}

                                    {/* 하단: 실제(Actual) Gantt Bar */}
                                    {val ? (
                                      <div
                                        title={`실제 진행`}
                                        style={{
                                          height: "10px",
                                          background: actualBg !== "transparent" ? actualBg : "rgba(255,255,255,0.02)",
                                          borderRadius: actualRadius,
                                          border: actualBg === "transparent" ? "1px dashed rgba(255,255,255,0.02)" : "none",
                                          fontSize: "0.5rem",
                                          fontWeight: "900",
                                          color: "white",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          lineHeight: 1
                                        }}
                                      >
                                        {actualBg !== "transparent" && (
                                          <span style={{ transform: "scale(0.8)" }}>{val}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div style={{ height: "10px" }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary-dark)", padding: "2rem" }}>
                        소속된 세부 프로그램이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px", color: "var(--text-secondary-dark)" }}>
            좌측에서 단위를 선택해주십시오.
          </div>
        )}
      </div>
    </div>
  );
}
