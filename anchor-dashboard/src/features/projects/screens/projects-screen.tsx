import React from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import UnitSystemView from "../../../components/UnitSystemView";
import type { PDCAManagerProps } from "../../../components/PDCAManager";
import type { LegacyAppRecord } from "../../../app/app-types";
import { formatToMillionWon } from "../../../app/app-data-utils";

const PDCAManager = React.lazy(() => import("../../../components/PDCAManager"));

interface ProjectsScreenProps {
  projectsSubTab: string;
  setProjectsSubTab: React.Dispatch<React.SetStateAction<string>>;
  displayProjects: LegacyAppRecord[];
  selectedYear: number;
  selectedUnitId: string;
  setSelectedUnitId: React.Dispatch<React.SetStateAction<string>>;
  selectedProgId: string | null;
  setSelectedProgId: React.Dispatch<React.SetStateAction<string | null>>;
  pdcaViewMode: string;
  setPdcaViewMode: React.Dispatch<React.SetStateAction<string>>;
  currentRole: LegacyAppRecord;
  currentUser: LegacyAppRecord;
  supabase: PDCAManagerProps["supabase"];
  isDownloadingPdf: string | null;
  handleExportExcel: () => void | Promise<void>;
  handleExportPDF: () => void | Promise<void>;
  handleExportMarkdown: () => void | Promise<void>;
  handleUpdateProgramDetails: NonNullable<PDCAManagerProps["onUpdateProgramDetails"]>;
  handleAddProgram: NonNullable<PDCAManagerProps["onAddProgram"]>;
}

export const ProjectsScreen = ({
  projectsSubTab,
  setProjectsSubTab,
  displayProjects,
  selectedYear,
  selectedUnitId,
  setSelectedUnitId,
  selectedProgId,
  setSelectedProgId,
  pdcaViewMode,
  setPdcaViewMode,
  currentRole,
  currentUser,
  supabase,
  isDownloadingPdf,
  handleExportExcel,
  handleExportPDF,
  handleExportMarkdown,
  handleUpdateProgramDetails,
  handleAddProgram
}: ProjectsScreenProps) => (
<div className="projects-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 서브탭 내비게이션 바 (프레임 밖/위에 배치) */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_system")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: projectsSubTab === "unit_system" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "unit_system" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                단위과제 체계
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_status")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: projectsSubTab === "unit_status" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "unit_status" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                단위과제 진행상황
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("program_mgmt")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: projectsSubTab === "program_mgmt" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "program_mgmt" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                프로그램 관리
              </button>
            </div>

            {/* 본문 콘텐츠 블록만 glass-card 로 감싸주어 서브메뉴와 분리 */}
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              {projectsSubTab === "unit_status" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* 💡 [요구사항 반영] 파일 다운로드 내보내기 버튼 그룹 신설 */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10b981",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <FileSpreadsheet size={14} />
                      Excel 다운로드
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPDF}
                      disabled={isDownloadingPdf === "unit_status"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        cursor: isDownloadingPdf === "unit_status" ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (isDownloadingPdf !== "unit_status") {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {isDownloadingPdf === "unit_status" ? (
                        <>
                          <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                          PDF 내보내는 중...
                        </>
                      ) : (
                        <>
                          <FileText size={14} />
                          PDF 다운로드
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "#3b82f6",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <Download size={14} />
                      Markdown 다운로드
                    </button>
                  </div>

                  <div className="table-panel">
                    <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                          <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0.5rem", fontSize: "0.95rem" }}>단위과제</th>
                          <th colSpan={selectedYear >= 2 ? 5 : 4} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0", fontSize: "0.95rem" }}>
                            예산 배정 및 집행 (단위: 백만원)
                          </th>
                          <th colSpan={5} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0", fontSize: "0.95rem" }}>
                            프로그램 진행
                          </th>
                        </tr>
                        <tr>
                          <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>본예산</th>
                          {selectedYear >= 2 && <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>이월예산</th>}
                          <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>총 배정액</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>누적 집행</th>
                          <th style={{ fontSize: "0.88rem", borderRight: "1px solid var(--border-color)", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>집행률</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>총 개수</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>준비</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>진행</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>완료</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>진행률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const sortedUnits = displayProjects.flatMap((p) => p.units)
                            .sort((a, b) => {
                              if (a.id === "Common" || a.id === "X0") return 1;
                              if (b.id === "Common" || b.id === "X0") return -1;
                              return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                            });

                          // 합계 집계용 변수들
                          let sumBudgetMain = 0;
                          let sumBudgetCarry = 0;
                          let sumTotalBudget = 0;
                          let sumTotalSpent = 0;
                          let sumTotalPrograms = 0;
                          let sumReadyCount = 0;
                          let sumInProgressCount = 0;
                          let sumCompletedCount = 0;
                          let sumTotalProgressSum = 0;

                          sortedUnits.forEach((u) => {
                            const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                            const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                            const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);

                            sumBudgetMain += (yData.budget_main || 0);
                            sumBudgetCarry += budgetCarryVal;
                            sumTotalBudget += ((yData.budget_main || 0) + budgetCarryVal);
                            sumTotalSpent += ((yData.spent_main || 0) + spentCarryVal);

                            if (u.id !== "Common" && u.id !== "X0") {
                              const totalProgs = u.programs?.length || 0;
                              sumTotalPrograms += totalProgs;

                              if (totalProgs > 0) {
                                u.programs.forEach((prog: LegacyAppRecord) => {
                                  const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
                                  const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
                                  const progProgress = (completedSteps / 4) * 100;
                                  sumTotalProgressSum += progProgress;

                                  if (completedSteps === 0) {
                                    sumReadyCount++;
                                  } else if (completedSteps === 4) {
                                    sumCompletedCount++;
                                  } else {
                                    sumInProgressCount++;
                                  }
                                });
                              }
                            }
                          });

                          const sumRate = sumTotalBudget > 0 ? (sumTotalSpent / sumTotalBudget) * 100 : 0;
                          const sumProgressRate = sumTotalPrograms > 0 ? (sumTotalProgressSum / sumTotalPrograms) : 0;

                          return (
                            <>
                              {sortedUnits.map((u) => {
                                const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                                const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                                const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
                                const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
                                const totalSpent = (yData.spent_main || 0) + spentCarryVal;
                                const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

                                // 프로그램 현황 집계 변수들
                                const totalPrograms = u.programs?.length || 0;
                                let readyCount = 0;
                                let inProgressCount = 0;
                                let completedCount = 0;
                                let totalProgressSum = 0;

                                if (totalPrograms > 0) {
                                  u.programs.forEach((prog: LegacyAppRecord) => {
                                    const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
                                    const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
                                    const progProgress = (completedSteps / 4) * 100;
                                    totalProgressSum += progProgress;

                                    if (completedSteps === 0) {
                                      readyCount++;
                                    } else if (completedSteps === 4) {
                                      completedCount++;
                                    } else {
                                      inProgressCount++;
                                    }
                                  });
                                }
                                const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;

                                return (
                                  <tr
                                    aria-label={`${u.title} 단위과제 선택`}
                                    key={u.id}
                                    onClick={() => {
                                      setSelectedUnitId(u.id);
                                      setSelectedProgId(null);
                                      setProjectsSubTab("program_mgmt"); // 단위과제 클릭 시 프로그램 관리 탭으로 연계 이동
                                    }}
                                    style={{
                                      cursor: "pointer",
                                      background: selectedUnitId === u.id ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                      transition: "background 0.2s"
                                    }}
                                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                    <td style={{ fontWeight: "700", borderRight: "1px solid var(--border-color)" }}>
                                      {u.id === "Common" ? "" : `${u.id}. `}{u.title}
                                    </td>
                                    <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                      {formatToMillionWon(yData.budget_main)}
                                    </td>
                                    {selectedYear >= 2 && (
                                      <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                        {formatToMillionWon(budgetCarryVal)}
                                      </td>
                                    )}
                                    <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", textAlign: "right", paddingRight: "1rem" }}>
                                      {formatToMillionWon(totalBudget)}
                                    </td>
                                    <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                      {formatToMillionWon(totalSpent)}
                                    </td>
                                    <td style={{ borderRight: "1px solid var(--border-color)", fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                      {rate.toFixed(1)}%
                                    </td>
                                    {u.id === "Common" || u.id === "X0" ? (
                                      <>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td>-</td>
                                      </>
                                    ) : (
                                      <>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center" }}>
                                          {totalPrograms}개
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--text-secondary)" }}>
                                          {readyCount}
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "#f59e0b" }}>
                                          {inProgressCount}
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--success-color)", fontWeight: "700" }}>
                                          {completedCount}
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                                            <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                              <div style={{ width: `${Math.min(progressRate, 100)}%`, height: "100%", background: "#10b981" }} />
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-data)", fontWeight: "700", color: "#10b981" }}>{progressRate.toFixed(1)}%</span>
                                          </div>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                              {/* 합계 행 추가 */}
                              <tr style={{ background: "rgba(59, 130, 246, 0.08)", fontWeight: "800", borderTop: "2px solid var(--border-color)" }}>
                                <td style={{ fontWeight: "800", borderRight: "1px solid var(--border-color)", textAlign: "center" }}>
                                  합계
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                  {formatToMillionWon(sumBudgetMain)}
                                </td>
                                {selectedYear >= 2 && (
                                  <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                    {formatToMillionWon(sumBudgetCarry)}
                                  </td>
                                )}
                                <td style={{ fontFamily: "var(--font-data)", fontWeight: "800", textAlign: "right", paddingRight: "1rem", color: "var(--accent-color)" }}>
                                  {formatToMillionWon(sumTotalBudget)}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                  {formatToMillionWon(sumTotalSpent)}
                                </td>
                                <td style={{ borderRight: "1px solid var(--border-color)", fontFamily: "var(--font-data)", fontWeight: "800", textAlign: "right", paddingRight: "1rem" }}>
                                  {sumRate.toFixed(1)}%
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center" }}>
                                  {sumTotalPrograms}개
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--text-secondary)" }}>
                                  {sumReadyCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "#f59e0b" }}>
                                  {sumInProgressCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--success-color)", fontWeight: "800" }}>
                                  {sumCompletedCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                                    <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                      <div style={{ width: `${Math.min(sumProgressRate, 100)}%`, height: "100%", background: "#10b981" }} />
                                    </div>
                                    <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-data)", fontWeight: "800", color: "#10b981" }}>{sumProgressRate.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {projectsSubTab === "unit_system" && (
                <UnitSystemView key={`unit-system-${selectedYear}`} selectedYear={selectedYear} />
              )}

              {projectsSubTab === "program_mgmt" && (
                <div id="pdca-manager-section">
                  <React.Suspense fallback={null}>
                    <PDCAManager
                      key={`pdca-${selectedYear}`}
                      projects={displayProjects}
                      currentRole={currentRole}
                      onUpdateProgramDetails={handleUpdateProgramDetails}
                      onAddProgram={handleAddProgram}
                      selectedYear={selectedYear}
                      selectedUnitId={selectedUnitId}
                      setSelectedUnitId={setSelectedUnitId}
                      selectedProgId={selectedProgId}
                      setSelectedProgId={setSelectedProgId}
                      viewMode={pdcaViewMode}
                      setViewMode={setPdcaViewMode}
                      currentUser={currentUser}
                      supabase={supabase}
                    />
                  </React.Suspense>
                </div>
              )}
            </div>
          </div>
);
