import React from "react";
import type { CSSProperties } from "react";
import { HelpCircle } from "lucide-react";
import type { LegacyAppRecord } from "../../../app/app-types";
import { getNormalizedKpi } from "../../../app/app-data-utils";

interface KpiScreenProps {
  menuVisibility: Record<string, boolean>;
  isSongDirector: boolean;
  kpiSubTab: string;
  setKpiSubTab: React.Dispatch<React.SetStateAction<string>>;
  displayProjects: LegacyAppRecord[];
  selectedYear: number;
  selectedKpi: LegacyAppRecord | null;
  setSelectedKpi: React.Dispatch<React.SetStateAction<LegacyAppRecord | null>>;
  currentRole: LegacyAppRecord;
  handleUpdateKpiValue: (subItemId: string, field: string, value: unknown) => void;
}

// LaTeX 수식 파서 및 HTML 렌더러 컴포넌트
const RenderLatexFormula = ({ formula }: { formula?: string }) => {
  if (!formula) return null;

  // 전체 컨테이너 스타일
  const containerStyle: CSSProperties = {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    background: "rgba(255,255,255,0.01)",
    padding: "0.6rem 0.8rem",
    borderRadius: "0.4rem",
    border: "1px solid var(--border-color)",
    width: "100%",
    boxSizing: "border-box"
  };

  // 1단계: LaTeX 문자열에서 오염된 text{...} 구조와 제어문자들을 완전히 평문화
  const purifyLatexString = (str: string) => {
    if (!str) return "";
    return str
      // \text{...} 또는 [Tab]ext{...} 구조 매칭하여 중괄호 안의 글자만 추출
      .replace(/(?:\\text|[\t]ext)\{([^}]+)\}/g, "$1")
      // 혹시 백슬래시 탈락해서 남은 text{...} 및 ext{...} 정화
      .replace(/(?:text|ext)\{([^}]+)\}/g, "$1")
      // LaTeX 퍼센트 이스케이프 복구
      .replace(/\\%/g, "%")
      // 남은 백슬래시 제거
      .replace(/\\/g, "");
  };

  // 먼저 전체 수식 문자열을 평문화 처리한다! (중괄호 중첩 구조가 여기서 선제 정화됨)
  const purifiedFormula = purifyLatexString(formula);

  // 2단계: 평문화된 수식에서 분수 및 연산자 파싱
  // 2.1. 만약 수식에 "="이 있다면 (C-1 ~ C-6 공식 등)
  if (purifiedFormula.includes("=")) {
    const parts = purifiedFormula.split("=");
    const label = parts[0].trim();
    const rightSide = parts[1].trim();

    // 평문화 상태이므로 단순히 frac{분자}{분모} 구조만 감지하면 됨! (오염된 rac도 지원)
    const fracMatch = rightSide.match(/(?:frac|rac)\{([^}]+)\}\s*\{([^}]+)\}/);
    if (fracMatch) {
      const num = fracMatch[1].trim();
      const den = fracMatch[2].trim();

      const timesMatch = rightSide.match(/times\s*([\d.]+)/);
      const weight = timesMatch ? timesMatch[1] : null;

      return (
        <div style={containerStyle}>
          {label && (
            <span style={{ fontWeight: "800", color: "var(--accent-color)", marginRight: "0.4rem" }}>
              {label} =
            </span>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
              <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
              <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{den}</span>
            </div>
            {weight && (
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                × {weight}
              </span>
            )}
          </div>
        </div>
      );
    }
  }

  // 2.2. 일반 다항식 분수라면 (L-1 ~ L-24 공식 등)
  const containsFrac = purifiedFormula.includes("frac") || purifiedFormula.includes("rac");
  if (!containsFrac) {
    return <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{purifiedFormula}</span>;
  }

  const terms = purifiedFormula.split("+");

  return (
    <div style={containerStyle}>
      {terms.map((termStr, index) => {
        const trimmed = termStr.trim();
        const fracMatch = trimmed.match(/(?:frac|rac)\{([^}]+)\}\s*\{([^}]+)\}(?:\s*times\s*([\d.]+))?/);

        if (fracMatch) {
          const num = fracMatch[1].trim();
          const den = fracMatch[2].trim();
          const weight = fracMatch[3];

          return (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary)" }}>+</span>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "65px" }}>
                  <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
                  <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{den}</span>
                </div>
                {weight && (
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                    × {weight}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={index}>
            {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary)" }}>+</span>}
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{trimmed}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const KpiScreen = ({
  menuVisibility,
  isSongDirector,
  kpiSubTab,
  setKpiSubTab,
  displayProjects,
  selectedYear,
  selectedKpi,
  setSelectedKpi,
  currentRole,
  handleUpdateKpiValue
}: KpiScreenProps) => (
  <>
            {/* 성과지표 관리 서브탭 내비게이션 바 (예산 탭바와 스타일 완전 대칭화) */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem", width: "100%" }}>
              {(menuVisibility.kpi_status !== false || isSongDirector) && (
                <button
                  onClick={() => {
                    setKpiSubTab("공통");
                    // 공통 탭에 해당하는 첫 번째 지표 자동 선택
                    const first = displayProjects.flatMap((p: LegacyAppRecord) => p.units.flatMap((u: LegacyAppRecord) => u.kpis)).find((k: LegacyAppRecord) => k.type === "공통");
                    setSelectedKpi(first || null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    color: kpiSubTab === "공통" ? "var(--accent-color)" : (menuVisibility.kpi_status === false ? "#EF4444" : "var(--text-secondary)"),
                    borderBottom: kpiSubTab === "공통" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  (교육부)공통성과지표
                  {menuVisibility.kpi_status === false && (
                    <span style={{ fontSize: "0.6rem", color: "#EF4444", fontWeight: "800", marginLeft: "3px" }}>[숨김]</span>
                  )}
                </button>
              )}
              {(menuVisibility.kpi_self !== false || isSongDirector) && (
                <button
                  onClick={() => {
                    setKpiSubTab("자율");
                    // 자율 탭에 해당하는 첫 번째 지표 자동 선택
                    const first = displayProjects.flatMap((p: LegacyAppRecord) => p.units.flatMap((u: LegacyAppRecord) => u.kpis)).find((k: LegacyAppRecord) => k.type === "자율");
                    setSelectedKpi(first || null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    color: kpiSubTab === "자율" ? "var(--accent-color)" : (menuVisibility.kpi_self === false ? "#EF4444" : "var(--text-secondary)"),
                    borderBottom: kpiSubTab === "자율" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  (지자체)자율성과지표
                  {menuVisibility.kpi_self === false && (
                    <span style={{ fontSize: "0.6rem", color: "#EF4444", fontWeight: "800", marginLeft: "3px" }}>[숨김]</span>
                  )}
                </button>
              )}
              {(menuVisibility.kpi_focus !== false || isSongDirector) && (
                <button
                  onClick={() => {
                    setKpiSubTab("중점");
                    // 중점 탭에 해당하는 첫 번째 지표 자동 선택
                    const first = displayProjects.flatMap((p: LegacyAppRecord) => p.units.flatMap((u: LegacyAppRecord) => u.kpis)).find((k: LegacyAppRecord) => k.type === "중점");
                    setSelectedKpi(first || null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    color: kpiSubTab === "중점" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: kpiSubTab === "중점" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  (대학)중점관리지표
                </button>
              )}
            </div>

            {/* 성과지표 관리 탭: 전체 영역을 Fragment로 묶어 하단에 성과지표 전용 엑셀 업로더를 배치합니다. */}
            <div className="kpi-split-layout" style={{ marginTop: "1rem" }}>
              {/* 좌측 성과지표 리스트 테이블 */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>

                <div className="table-panel">
                  <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>지표 ID</th>
                        <th>지표명</th>
                        <th>유형</th>
                        <th>현재달성도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const kpiMap = new Map();
                        if (displayProjects && Array.isArray(displayProjects)) {
                          displayProjects.forEach((p: LegacyAppRecord) => {
                            if (p.units && Array.isArray(p.units)) {
                              p.units.forEach((u: LegacyAppRecord) => {
                                if (u.kpis && Array.isArray(u.kpis)) {
                                  u.kpis.forEach((k: LegacyAppRecord) => {
                                    if (k.type === kpiSubTab) {
                                      const nk = getNormalizedKpi(k, selectedYear);
                                      if (nk) kpiMap.set(nk.id, { k, nk });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }

                        const sortedKpis = Array.from(kpiMap.values()).sort((a, b) => {
                          const prefixA = a.nk.id.startsWith("C-") ? "C" : "L";
                          const prefixB = b.nk.id.startsWith("C-") ? "C" : "L";
                          if (prefixA !== prefixB) {
                            return prefixA.localeCompare(prefixB);
                          }
                          const numA = parseInt(a.nk.id.replace("L-", "").replace("C-", ""), 10) || 0;
                          const numB = parseInt(b.nk.id.replace("L-", "").replace("C-", ""), 10) || 0;
                          return numA - numB;
                        });

                        return sortedKpis.map(({ k: _k, nk }) => {
                          let rate = 0;
                          if (selectedYear === 1 && nk.id === "L-1") {
                            rate = 111.9;
                          } else if (selectedYear === 1 && nk.id === "L-2") {
                            rate = 687.8;
                          } else if (selectedYear === 1 && nk.id === "L-3") {
                            rate = 138.6;
                          } else if (selectedYear === 1 && nk.id === "L-4") {
                            rate = 146.7;
                          } else if (selectedYear === 1 && nk.id === "L-5") {
                            rate = 81.8;
                          } else if (selectedYear === 1 && nk.id === "L-6") {
                            rate = 103.3;
                          } else if (selectedYear === 1 && nk.id === "L-7") {
                            rate = 321.3;
                          } else if (selectedYear === 1 && nk.id === "L-8") {
                            rate = 134.0;
                          } else if (selectedYear === 1 && nk.id === "L-9") {
                            rate = 106.0;
                          } else if (selectedYear === 1 && nk.id === "L-10") {
                            rate = 128.5;
                          } else if (selectedYear === 1 && nk.id === "L-11") {
                            rate = 160.0;
                          } else if (selectedYear === 1 && nk.id === "L-12") {
                            rate = 114.6;
                          } else if (selectedYear === 1 && nk.id === "L-13") {
                            rate = 108.0;
                          } else if (selectedYear === 1 && nk.id === "L-14") {
                            rate = 500.0;
                          } else if (selectedYear === 1 && nk.id === "L-15") {
                            rate = 132.2;
                          } else if (selectedYear === 1 && nk.id === "L-16") {
                            rate = 123.3;
                          } else if (selectedYear === 1 && nk.id === "L-17") {
                            rate = 0.0;
                          } else if (selectedYear === 1 && nk.id === "L-18") {
                            rate = 176.5;
                          } else if (selectedYear === 1 && nk.id === "L-19") {
                            rate = 244.0;
                          } else if (selectedYear === 1 && nk.id === "L-20") {
                            rate = 202.5;
                          } else if (selectedYear === 1 && nk.id === "L-21") {
                            rate = 100.0;
                          } else if (selectedYear === 1 && nk.id === "L-22") {
                            rate = 175.0;
                          } else if (selectedYear === 1 && nk.id === "L-23") {
                            rate = 144.3;
                          } else if (selectedYear === 1 && nk.id === "L-24") {
                            rate = 138.3;
                          } else if (nk.subItems && nk.subItems.length > 0) {
                            let sumRate = 0;
                            nk.subItems.forEach((sub: LegacyAppRecord) => {
                              const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                              sumRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                            });
                            rate = sumRate / nk.subItems.length;
                          } else {
                            rate = nk.target > 0 ? (nk.current / nk.target) * 100 : 0;
                          }
                          const isSelected = selectedKpi?.id === nk.id;
                          return (
                            <tr
                              aria-label={`${nk.name} KPI 선택`}
                              key={nk.id}
                              onClick={() => setSelectedKpi(nk)}
                              style={{
                                cursor: "pointer",
                                background: isSelected ? "rgba(59,130,246,0.08)" : "inherit",
                                borderLeft: isSelected ? "4px solid var(--accent-color)" : "none",
                                transition: "all 0.2s ease"
                              }}
                             role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{nk.id}</td>
                              <td style={{ fontWeight: isSelected ? "700" : "normal" }}>{nk.name}</td>
                              <td>
                                <span className={`badge ${nk.type === "공통" ? "badge-green" : nk.type === "자율" ? "badge-blue" : "badge-yellow"}`}>
                                  {nk.type}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <div style={{ width: "50px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ width: `${Math.min(rate, 100)}%`, height: "100%", background: rate >= 100 ? "var(--success-color)" : "var(--warning-color)" }} />
                                  </div>
                                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", color: rate >= 100 ? "var(--success-color)" : "inherit" }}>
                                    {rate.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 우측 성과지표 세부내용 상세 블록 (Sticky 고정 스크롤 효과) */}
              <div className="sticky-panel">
                <div className="glass-card" style={{ border: selectedKpi ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)", minHeight: "360px" }}>
                  {selectedKpi ? (() => {
                    const nk = getNormalizedKpi(selectedKpi, selectedYear);
                    if (!nk) return null;
                    return (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.75rem" }}>
                          <span className="badge badge-blue" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                            {nk.id}
                          </span>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>{nk.name} 상세 명세</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                          <div>
                            <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold", display: "block" }}>지표 정의</span>
                            <p style={{ fontSize: "0.85rem", fontWeight: "700", marginTop: "0.2rem", lineHeight: "1.4" }}>
                              {nk.description}
                            </p>
                          </div>

                          {/* 세부지표 목푯값 및 실적값을 보여주는 미니 표 추가 */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                              <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold" }}>지표 구성 세부항목 목표 대비 실적 표</span>
                              <span className="badge badge-yellow" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>{selectedYear}차년도 세부지표</span>
                            </div>
                            <table className="mini-table" style={{ fontSize: "0.75rem" }}>
                              <thead>
                                <tr>
                                  <th>세부 항목명</th>
                                  <th style={{ textAlign: "right" }}>기준값</th>
                                  <th style={{ textAlign: "right" }}>목푯값</th>
                                  <th style={{ textAlign: "right" }}>현재실적</th>
                                  <th style={{ textAlign: "right" }}>달성도</th>
                                </tr>
                              </thead>
                              <tbody>
                                {nk.subItems && nk.subItems.map((sub: LegacyAppRecord, index: number) => {
                                  const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                  const subRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                  const canEditTarget = currentRole.rank <= 4;
                                  const cleanName = sub.name.replace(/\s*\(기준값:\s*\d+\)/, "");
                                  const letter = String.fromCharCode(65 + index); // 0 -> A, 1 -> B, 2 -> C ...
                                  return (
                                    <tr key={sub.id}>
                                      <td style={{ fontWeight: "700" }}>{`[${letter}] ${cleanName}`}</td>
                                      <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>
                                        {sub.base !== undefined ? `${sub.base.toLocaleString()} ${sub.unit}` : "-"}
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                          <input id="a11y-app-24"
                                            aria-label={`${cleanName} ${selectedYear}차년도 목표값`}
                                            type="number"
                                            step="any"
                                            className="user-selector"
                                            disabled={!canEditTarget}
                                            defaultValue={yData.target}
                                            min="0"
                                            onBlur={(e) => {
                                              if (!canEditTarget) return;
                                              let val = parseFloat(e.target.value);
                                              if (!isNaN(val)) {
                                                if (val < 0) {
                                                  val = 0;
                                                  e.target.value = "0";
                                                }
                                                handleUpdateKpiValue(sub.id, "target", val);
                                              }
                                            }}
                                            style={{
                                              width: "55px",
                                              textAlign: "right",
                                              fontSize: "0.75rem",
                                              padding: "0.1rem 0.2rem",
                                              background: !canEditTarget ? "rgba(128, 128, 128, 0.25)" : "rgb(128, 128, 128)",
                                              color: !canEditTarget ? "rgba(255, 255, 255, 0.4)" : "white",
                                              border: "1px solid var(--border-color)",
                                              borderRadius: "0.25rem",
                                              cursor: !canEditTarget ? "not-allowed" : "text"
                                            }}
                                          />
                                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{sub.unit}</span>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                          <input
                                            aria-label={`${cleanName} ${selectedYear}차년도 현재값`}
                                            type="number"
                                            step="any"
                                            className="user-selector"
                                            defaultValue={yData.current}
                                            min="0"
                                            onBlur={(e) => {
                                              let val = parseFloat(e.target.value);
                                              if (!isNaN(val)) {
                                                if (val < 0) {
                                                  val = 0;
                                                  e.target.value = "0";
                                                }
                                                handleUpdateKpiValue(sub.id, "current", val);
                                              }
                                            }}
                                            style={{
                                              width: "55px",
                                              textAlign: "right",
                                              fontSize: "0.75rem",
                                              padding: "0.1rem 0.2rem",
                                              background: "rgb(128, 128, 128)",
                                              color: "white",
                                              border: "1px solid var(--border-color)",
                                              borderRadius: "0.25rem"
                                            }}
                                          />
                                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{sub.unit}</span>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "800", color: subRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                        {subRate.toFixed(1)}%
                                      </td>
                                    </tr>
                                  );
                                })}
                                {(() => {
                                  let totalKpiRate = 0;
                                  if (selectedYear === 1 && nk.id === "L-1") {
                                    totalKpiRate = 111.9;
                                  } else if (selectedYear === 1 && nk.id === "L-2") {
                                    totalKpiRate = 687.8;
                                  } else if (selectedYear === 1 && nk.id === "L-3") {
                                    totalKpiRate = 138.6;
                                  } else if (selectedYear === 1 && nk.id === "L-4") {
                                    totalKpiRate = 146.7;
                                  } else if (selectedYear === 1 && nk.id === "L-5") {
                                    totalKpiRate = 81.8;
                                  } else if (selectedYear === 1 && nk.id === "L-6") {
                                    totalKpiRate = 103.3;
                                  } else if (selectedYear === 1 && nk.id === "L-7") {
                                    totalKpiRate = 321.3;
                                  } else if (selectedYear === 1 && nk.id === "L-8") {
                                    totalKpiRate = 134.0;
                                  } else if (selectedYear === 1 && nk.id === "L-9") {
                                    totalKpiRate = 106.0;
                                  } else if (selectedYear === 1 && nk.id === "L-10") {
                                    totalKpiRate = 128.5;
                                  } else if (selectedYear === 1 && nk.id === "L-11") {
                                    totalKpiRate = 160.0;
                                  } else if (selectedYear === 1 && nk.id === "L-12") {
                                    totalKpiRate = 114.6;
                                  } else if (selectedYear === 1 && nk.id === "L-13") {
                                    totalKpiRate = 108.0;
                                  } else if (selectedYear === 1 && nk.id === "L-14") {
                                    totalKpiRate = 500.0;
                                  } else if (selectedYear === 1 && nk.id === "L-15") {
                                    totalKpiRate = 132.2;
                                  } else if (selectedYear === 1 && nk.id === "L-16") {
                                    totalKpiRate = 123.3;
                                  } else if (selectedYear === 1 && nk.id === "L-17") {
                                    totalKpiRate = 0.0;
                                  } else if (selectedYear === 1 && nk.id === "L-18") {
                                    totalKpiRate = 176.5;
                                  } else if (selectedYear === 1 && nk.id === "L-19") {
                                    totalKpiRate = 244.0;
                                  } else if (selectedYear === 1 && nk.id === "L-20") {
                                    totalKpiRate = 202.5;
                                  } else if (selectedYear === 1 && nk.id === "L-21") {
                                    totalKpiRate = 100.0;
                                  } else if (selectedYear === 1 && nk.id === "L-22") {
                                    totalKpiRate = 175.0;
                                  } else if (selectedYear === 1 && nk.id === "L-23") {
                                    totalKpiRate = 144.3;
                                  } else if (selectedYear === 1 && nk.id === "L-24") {
                                    totalKpiRate = 138.3;
                                  } else if (nk.subItems && nk.subItems.length > 0) {
                                    let sumKpiRate = 0;
                                    nk.subItems.forEach((sub: LegacyAppRecord) => {
                                      const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                      sumKpiRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                    });
                                    totalKpiRate = sumKpiRate / nk.subItems.length;
                                  }
                                  const finalCapRate = Math.min(totalKpiRate, 100.0);
                                  return (
                                    <tr style={{ background: "rgba(59,130,246,0.06)", borderTop: "1px solid var(--border-color-dark)" }}>
                                      <td colSpan={2} style={{ fontWeight: "800" }}>종합 지표 달성도 (Total)</td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)" }}>100.0%</td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)", color: "var(--accent-color)", fontWeight: "700" }}>{totalKpiRate.toFixed(1)}%</td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "900", color: finalCapRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                        {finalCapRate.toFixed(1)}%
                                      </td>
                                    </tr>
                                  );
                                })()}
                              </tbody>
                            </table>
                          </div>

                          <div>
                            <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold", display: "block", marginBottom: "0.4rem" }}>성과지표 산출공식 및 세부산식 분석</span>
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", padding: "0.6rem 0.8rem", borderRadius: "0.375rem" }}>
                              <div style={{ marginBottom: "0.5rem" }}>
                                <RenderLatexFormula formula={nk.formula} />
                              </div>
                              {nk.type === "공통" && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                  <p style={{ fontWeight: "800", color: "#60a5fa", marginBottom: "0.25rem" }}>💡 교육부 RISE 공통성과지표 상세 가이드</p>
                                  <p>• <strong>평가 메커니즘</strong>: 단순 실적 달성도가 아닌, <strong>2024년 기준연도 대비 당해연도의 순 증가 비율(성장률)</strong>을 계산합니다.</p>
                                  <p>• <strong>산식 세부 분석</strong>:
                                    {nk.id === "C-1" && " 지자체 대표과제 성과 달성도 평균수식을 적용하여 각 대표과제의 개별 목표 달성률의 평균을 냅니다."}
                                    {nk.id === "C-2" && " 지산학연 연계 건수 및 연구 계약 체결 금액의 기준연도(24년) 총합 대비 성장 비율을 구합니다."}
                                    {nk.id === "C-3" && " 대학 평생직업교육 수료생 수 및 정원외 전형 입학생 수의 24년 모수 대비 증가율을 측정합니다."}
                                    {nk.id === "C-4" && " 졸업자 중 울산광역시 및 인접 관내 취업자의 절대 인원 증가 추이를 백분율로 추적합니다."}
                                    {nk.id === "C-5" && " RISE 지산학 협력체계 만족도 평점의 24년 기초 조사 평점 대비 성장 추이를 측정합니다."}
                                    {nk.id === "C-6" && " 대학 경제 영향력 평가(IMPACT) 모델에 따른 지역 경제 생산 유발 효과(억원)의 향상률을 계산합니다."}
                                  </p>
                                  <p style={{ marginTop: "0.25rem" }}>• <strong>지표 활용시기</strong>: {
                                    nk.id === "C-1" || nk.id === "C-2" || nk.id === "C-3"
                                      ? "2차년도 중간평가 및 5차년도 종합평가에 모두 활용됩니다."
                                      : "5차년도 최종 종합평가 시에만 활용되는 중장기 결과지표입니다."
                                  }</p>
                                </div>
                              )}
                              {nk.type === "자율" && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                  <p style={{ fontWeight: "800", color: "#ec4899", marginBottom: "0.25rem" }}>💡 지자체(울산) 자율성과지표 안내</p>
                                  <p>• <strong>평가 메커니즘</strong>: 울산 RISE 비전 및 지역 주도 대학지원을 위해 시도와 대학이 합의하여 지정한 정량 지표입니다.</p>
                                  <p>• <strong>활용 시기</strong>: 매년 실시되는 지자체 자체평가 및 교육부의 연차점검, 중간·종합평가 시 연차별 달성도가 전면 반영됩니다.</p>
                                </div>
                              )}
                              {nk.type === "중점" && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                  <p style={{ fontWeight: "800", color: "#f472b6", marginBottom: "0.25rem" }}>💡 대학 중점관리지표 안내</p>
                                  <p>• <strong>평가 메커니즘</strong>: 대학 강점·특성화 분야 육성 및 경쟁력 제고를 목적으로 대학이 설정한 집중 관리 핵심성과지표입니다.</p>
                                  <p>• <strong>활용 시기</strong>: 대학 자체 성과관리 환류 및 시도 컨설팅 환류 지표로 연중 활용됩니다.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem" }}>
                            <div>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>주관 부서</span>
                              <p style={{ fontWeight: "700" }}>{nk.owner}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>측정 주기</span>
                              <p style={{ fontWeight: "700" }}>{nk.cycle}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", color: "var(--text-secondary)", gap: "0.5rem" }}>
                      <HelpCircle size={32} style={{ color: "var(--accent-color)" }} />
                      <span style={{ fontSize: "0.8rem" }}>좌측 목록의 성과지표 행을 클릭하시면 상세 비교 정보가 나타납니다.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
  </>
);
