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
      return parts.map(p => ["P", "D", "C", "A"].includes(p.trim()) ? p.trim() : "");
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

export default function ProgramProgressManager({ projects, selectedYear }) {
  const allUnits = projects.flatMap(p => p.units);
  const [selectedUnitId, setSelectedUnitId] = useState(allUnits[0]?.id || "A-1-가");

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
                  background: isActive ? "rgba(59, 130, 246, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  border: isActive ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isActive ? "white" : "var(--text-secondary-dark)" }}>
                    {u.id}
                  </span>
                  <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem", borderRadius: "0.25rem", background: "rgba(255, 255, 255, 0.05)" }}>
                    {u.programs?.length || 0}개 프로그램
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: "800", color: isActive ? "var(--accent-color)" : "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginBottom: "0.4rem" }}>
                  {u.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", display: "flex", justifyContent: "space-between" }}>
                  <span>총 예산:</span>
                  <span style={{ fontWeight: "700", color: "white" }}>{formatToMillionWon(totalBudget)} 백만원</span>
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
                    <th style={{ width: "230px" }}>세부 프로그램명</th>
                    <th style={{ width: "140px" }}>담당연구원</th>
                    <th style={{ width: "130px" }}>운영 예산 (배정/집행)</th>
                    <th style={{ width: "340px", textAlign: "center" }}>
                      2차년도 Timeline
                      {/* 연도 구분 줄 (상위 2분할: 2026년 10개월 / 2027년 2개월) */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1px", marginTop: "0.4rem", fontSize: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.2rem", color: "var(--accent-color)" }}>
                        <div style={{ gridColumn: "span 10", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.05)", fontWeight: "800" }}>2026년</div>
                        <div style={{ gridColumn: "span 2", textAlign: "center", fontWeight: "800" }}>2027년</div>
                      </div>
                      {/* 월 구분 줄 */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1px", marginTop: "0.25rem", fontSize: "0.65rem", fontWeight: "normal" }}>
                        {MONTHS_GUIDE.map((m) => (
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
                        <tr key={prog.id} style={{ height: "64px" }}>
                          <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                          <td style={{ fontWeight: "700", whiteSpace: "normal", wordBreak: "keep-all" }}>
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
                          <td style={{ verticalAlign: "middle", padding: "0.5rem 0.2rem" }}>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(12, 1fr)",
                              gap: "3px",
                              background: "rgba(255, 255, 255, 0.02)",
                              borderRadius: "0.4rem",
                              padding: "4px",
                              border: "1px solid rgba(255,255,255,0.04)"
                            }}>
                              {monthlyPDCA.map((val, idx) => {
                                if (!val) {
                                  return (
                                    <div key={idx} style={{ height: "20px", borderRadius: "0.2rem", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed rgba(255,255,255,0.03)" }} />
                                  );
                                }

                                const stageKey = val.toLowerCase();
                                const status = prog.pdca?.[stageKey] || "대기";

                                let color = "transparent";
                                if (val === "P") color = "linear-gradient(135deg, #3b82f6, #1d4ed8)";
                                if (val === "D") color = "linear-gradient(135deg, #10b981, #047857)";
                                if (val === "C") color = "linear-gradient(135deg, #f59e0b, #b45309)";
                                if (val === "A") color = "linear-gradient(135deg, #d946ef, #a21caf)";

                                let opacity = 0.2; // 대기
                                let border = "none";
                                let animation = "none";

                                if (status === "진행") {
                                  opacity = 0.75;
                                  border = `1px solid ${val === "P" ? "#93c5fd" : val === "D" ? "#6ee7b7" : val === "C" ? "#fcd34d" : "#f5d0fe"}`;
                                  animation = "pulse 2s infinite";
                                } else if (status === "완료") {
                                  opacity = 1.0;
                                  border = "none";
                                }

                                return (
                                  <div
                                    key={idx}
                                    title={`${MONTHS_GUIDE[idx].name}: ${val}단계 (${status})`}
                                    style={{
                                      height: "20px",
                                      background: color,
                                      opacity: opacity,
                                      border: border,
                                      animation: animation,
                                      borderRadius: "0.2rem",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontSize: "0.6rem",
                                      fontWeight: "900",
                                      boxShadow: status === "완료" ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    {val}
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
