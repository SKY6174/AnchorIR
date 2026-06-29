import React, { useState } from "react";
import { Calendar, User, Wallet, ClipboardList } from "lucide-react";

// 백만원 단위 포맷팅 헬퍼 함수
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Math.round(value / 1000000).toLocaleString();
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
                    <th style={{ width: "110px" }}>담당연구원</th>
                    <th style={{ width: "160px" }}>운영 예산 (배정/집행)</th>
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
                      const timeline = getProgramTimeline(prog.id);
                      const bMain = prog.budget_2026 || 0;
                      const bCarry = prog.budget_2025_carry || 0;
                      const totalProgBudget = bMain + bCarry;

                      const sMain = prog.spent_2026 || 0;
                      const sCarry = prog.spent_2025_carry || 0;
                      const totalProgSpent = sMain + sCarry;

                      // P-D-C-A 월 계산 및 툴팁 가이드라인 (기획과 실행에 긴 시간 배정)
                      const totalMonths = timeline.end - timeline.start + 1;
                      let pLen = Math.max(1, Math.round(totalMonths * 0.35));
                      let dLen = Math.max(1, Math.round(totalMonths * 0.40));
                      let cLen = Math.max(1, Math.round(totalMonths * 0.15));
                      let aLen = totalMonths - pLen - dLen - cLen;
                      if (aLen < 1) {
                        if (dLen > 1) { dLen--; aLen = 1; }
                        else if (pLen > 1) { pLen--; aLen = 1; }
                        else { aLen = 1; }
                      }

                      const monthNames = ["3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", "1월", "2월"];
                      const pRange = `${monthNames[timeline.start]}~${monthNames[timeline.start + pLen - 1]}`;
                      const dRange = `${monthNames[timeline.start + pLen]}~${monthNames[timeline.start + pLen + dLen - 1]}`;
                      const cRange = `${monthNames[timeline.start + pLen + dLen]}~${monthNames[timeline.start + pLen + dLen + cLen - 1]}`;
                      const aRange = `${monthNames[timeline.start + pLen + dLen + cLen]}~${monthNames[timeline.end]}`;
                      const hoverTooltip = `전체 일정: ${timeline.label}\n- Plan(P): ${pRange}\n- Do(D): ${dRange}\n- Check(C): ${cRange}\n- Act(A): ${aRange}`;

                      return (
                        <tr key={prog.id} style={{ height: "64px" }}>
                          <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                          <td style={{ fontWeight: "700", whiteSpace: "normal", wordBreak: "keep-all" }}>
                            {prog.title}
                          </td>
                          <td style={{ fontWeight: "700", color: "var(--accent-color)" }}>
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
                            <div style={{ position: "relative", width: "100%", height: "24px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "0.3rem" }}>
                              {/* 12칸 그리드 배경 라인 */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", height: "100%", position: "absolute", width: "100%", top: 0, left: 0 }}>
                                {[...Array(12)].map((_, idx) => (
                                  <div key={idx} style={{ borderRight: idx === 11 ? "none" : "1px solid rgba(255, 255, 255, 0.03)", height: "100%" }} />
                                ))}
                              </div>

                              {/* Gantt Timeline Bar (P-D-C-A 4색 분할) */}
                              <div
                                title={hoverTooltip}
                                style={{
                                  position: "absolute",
                                  top: "3px",
                                  height: "18px",
                                  left: `${(timeline.start / 12) * 100}%`,
                                  width: `${(totalMonths / 12) * 100}%`,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                                  display: "flex",
                                  borderRadius: "0.25rem",
                                  overflow: "hidden",
                                  transition: "all 0.3s ease"
                                }}
                              >
                                <div style={{ flex: pLen, height: "100%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.55rem", fontWeight: "900" }} title={`Plan: ${pRange}`}>
                                  P
                                </div>
                                <div style={{ flex: dLen, height: "100%", background: "linear-gradient(135deg, #10b981, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.55rem", fontWeight: "900" }} title={`Do: ${dRange}`}>
                                  D
                                </div>
                                <div style={{ flex: cLen, height: "100%", background: "linear-gradient(135deg, #f59e0b, #b45309)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.55rem", fontWeight: "900" }} title={`Check: ${cRange}`}>
                                  C
                                </div>
                                <div style={{ flex: aLen, height: "100%", background: "linear-gradient(135deg, #d946ef, #a21caf)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.55rem", fontWeight: "900" }} title={`Act: ${aRange}`}>
                                  A
                                </div>
                              </div>
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
