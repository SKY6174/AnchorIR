import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { LegacyPdcaRecord } from "../utils/pdca-utils";

type StringSetter = Dispatch<SetStateAction<string>>;

interface PdcaDoStageProps {
  handleUpdateBudget: (event: FormEvent<HTMLFormElement>) => void;
  monthsList: string[];
  inputMonthlyPDCAActual: string[];
  setInputMonthlyPDCAActual: Dispatch<SetStateAction<string[]>>;
  activeProg: LegacyPdcaRecord;
  inputAudienceParticipants: Record<string, string>;
  handleAudienceParticipantChange: (audienceType: string, value: string, activeAudienceList: string[]) => void;
  inputParticipants: string;
  setInputParticipants: StringSetter;
  inputActualDevelopments: string;
  setInputActualDevelopments: StringSetter;
  inputActualEtc: string;
  setInputActualEtc: StringSetter;
  allUnits: LegacyPdcaRecord[];
  inputKpiActuals: Record<string, number | string>;
  setInputKpiActuals: Dispatch<SetStateAction<Record<string, number | string>>>;
  inputBudgetCategories: LegacyPdcaRecord[];
  selectedYear: number;
  inputAchieveRate: string;
  currentRole: LegacyPdcaRecord;
}

export function PdcaDoStage({
  handleUpdateBudget,
  monthsList,
  inputMonthlyPDCAActual,
  setInputMonthlyPDCAActual,
  activeProg,
  inputAudienceParticipants,
  handleAudienceParticipantChange,
  inputParticipants,
  setInputParticipants,
  allUnits,
  inputKpiActuals,
  setInputKpiActuals,
  inputBudgetCategories,
  selectedYear,
  inputAchieveRate,
  inputActualDevelopments,
  setInputActualDevelopments,
  inputActualEtc,
  setInputActualEtc,
  currentRole,
}: PdcaDoStageProps) {
  return (
                  <form onSubmit={handleUpdateBudget} style={{ padding: "0.75rem", background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "1.0rem", fontWeight: "800", marginBottom: "0.5rem", color: "#10b981" }}>D 단계: 세부 재원별 본집행액 및 실적 입력</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>

                      {/* 실제 추진일정 */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid var(--border-color)", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.58rem", color: "#10b981", fontWeight: "800", display: "inline-block", marginBottom: "0.25rem" }}>● 실제 추진일정</span>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.2rem", overflowX: "auto" }}>
                          {monthsList.map((month, idx) => {
                            const actVal = inputMonthlyPDCAActual[idx] || "";

                            const getActualStatusColor = (v: string) => {
                              if (!v || typeof v !== "string") return "transparent";
                              if (v.startsWith("P/D")) return "#1e3a8a";
                              if (v.startsWith("D/C")) return "#064e3b";
                              if (v.startsWith("C/A")) return "#78350f";
                              if (v.startsWith("P")) return "#2563eb";
                              if (v.startsWith("D")) return "#10b981";
                              if (v.startsWith("C")) return "#f59e0b";
                              if (v.startsWith("A")) return "#d946ef";
                              return "transparent";
                            };

                            const actBg = getActualStatusColor(actVal);

                            return (
                              <div key={idx} style={{ textAlign: "center", minWidth: "42px" }}>
                                <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", marginBottom: "0.15rem" }}>{month}</div>
                                <select
                                  className="user-selector"
                                  value={actVal}
                                  onChange={(e) => {
                                    const newPDCAActual = [...inputMonthlyPDCAActual];
                                    newPDCAActual[idx] = e.target.value;
                                    setInputMonthlyPDCAActual(newPDCAActual);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.15rem 0.2rem",
                                    fontSize: "0.65rem",
                                    background: actBg !== "transparent" ? actBg : "var(--panel-bg)",
                                    color: actBg !== "transparent" ? "white" : "var(--text-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "0.2rem",
                                    fontWeight: actBg !== "transparent" ? "800" : "normal",
                                    outline: "none",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  <option value="" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>-</option>
                                  <option value="P" style={{ background: "#2563eb", color: "white" }}>P</option>
                                  <option value="D" style={{ background: "#10b981", color: "white" }}>D</option>
                                  <option value="C" style={{ background: "#f59e0b", color: "white" }}>C</option>
                                  <option value="A" style={{ background: "#d946ef", color: "white" }}>A</option>
                                  <option value="P/D" style={{ background: "#1e3a8a", color: "#60a5fa" }}>P/D</option>
                                  <option value="D/C" style={{ background: "#064e3b", color: "#34d399" }}>D/C</option>
                                  <option value="C/A" style={{ background: "#78350f", color: "#fbbf24" }}>C/A</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 비목별 예산 집행액 입력 */}
                      <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>비목별 집행 등록</span>

                        {/* 본예산과 이월예산 구분 헤더 라인 */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.2rem", marginBottom: "0.2rem", paddingBottom: "0.15rem", borderBottom: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", fontWeight: "700" }}>비목명</div>
                          <div style={{ fontSize: "0.6rem", color: "#10b981", fontWeight: "700" }}>본집행 (단위 : 원)</div>
                          <div style={{ fontSize: "0.6rem", color: "#a78bfa", fontWeight: "700" }}>이월집행 (단위 : 원)</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                          {inputBudgetCategories
                            .filter(item => item.category && item.category !== "")
                            .map((item, idx) => {
                              const _originalIdx = inputBudgetCategories.findIndex(c => c.category === item.category);
                              return (
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.2rem", alignItems: "center" }}>
                                  <div style={{
                                    fontSize: "0.7rem",
                                    fontWeight: "700",
                                    color: "var(--text-primary)",
                                    background: "rgba(120, 120, 120, 0.02)",
                                    padding: "0.2rem 0.4rem",
                                    borderRadius: "0.25rem",
                                    border: "1px solid var(--border-color)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }} title={item.category}>
                                    {item.category}
                                  </div>
                                  <input
                                    type="text"
                                    className="user-selector"
                                    placeholder="자동계산"
                                    value={item.spent || "0"}
                                    readOnly={true}
                                    style={{
                                      padding: "0.2rem 0.4rem",
                                      fontSize: "0.7rem",
                                      background: "rgba(120, 120, 120, 0.02)",
                                      cursor: "not-allowed",
                                      border: "1px dashed rgba(16, 185, 129, 0.2)",
                                      color: "#10b981",
                                      fontWeight: "700",
                                      textAlign: "center"
                                    }}
                                  />
                                  <input
                                    type="text"
                                    className="user-selector"
                                    placeholder="자동계산"
                                    value={selectedYear === 1 ? "0" : item.spent_carry || "0"}
                                    readOnly={true}
                                    style={{
                                      padding: "0.2rem 0.4rem",
                                      fontSize: "0.7rem",
                                      background: "rgba(120, 120, 120, 0.02)",
                                      cursor: "not-allowed",
                                      border: "1px dashed rgba(167, 139, 250, 0.2)",
                                      color: selectedYear === 1 ? "var(--text-secondary)" : "#a78bfa",
                                      fontWeight: "700",
                                      textAlign: "center"
                                    }}
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* 참여대상별 실적 입력 (신설) */}
                      {(() => {
                        const activeAudienceList = activeProg?.targetAudience
                          ? activeProg.targetAudience.split(",").map((s: string) => s.trim()).filter(Boolean)
                          : [];
                        if (activeAudienceList.length === 0) return null;

                        return (
                          <div style={{ background: "rgba(37,99,235,0.02)", padding: "0.5rem", borderRadius: "0.4rem", border: "1px dashed rgba(37,99,235,0.15)", marginTop: "0.2rem", marginBottom: "0.2rem" }}>
                            <span style={{ fontSize: "0.6rem", color: "#3b82f6", fontWeight: "800", display: "inline-block", marginBottom: "0.3rem" }}>● 참여대상별 인원 실적 입력 (참석인원 실적에 자동 합계 연동)</span>
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(activeAudienceList.length, 4)}, 1fr)`, gap: "0.4rem" }}>
                              {activeAudienceList.map((aud: string) => (
                                <div key={aud}>
                                  <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>{aud} (명)</span>
                                  <input
                                    type="text"
                                    className="user-selector"
                                    placeholder="인원 기입"
                                    value={inputAudienceParticipants[aud] || ""}
                                    onChange={(e) => handleAudienceParticipantChange(aud, e.target.value, activeAudienceList)}
                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 성과지표 세부 실적 입력란 (D단계) */}
                      {(() => {
                        const activeKpiLinks = activeProg.kpi_links || (activeProg.kpi_link ? [activeProg.kpi_link] : []);
                        if (!Array.isArray(activeKpiLinks) || activeKpiLinks.filter(Boolean).length === 0) return null;

                        const kpiList = allUnits.flatMap(u => u.kpis || []);
                        const selectedKpis = activeKpiLinks
                          .map(link => kpiList.find(k => k && k.id === link))
                          .filter(Boolean);

                        if (selectedKpis.length === 0) return null;

                        return (
                          <div style={{ marginTop: "0.4rem", marginBottom: "0.4rem", padding: "0.45rem", background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "0.25rem" }}>
                            <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: "800", display: "inline-block", marginBottom: "0.3rem" }}>
                              ● 연계 성과지표 세부 실적 입력 (D단계)
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                              {selectedKpis.map(kpi => {
                                if (!kpi.subItems || kpi.subItems.length === 0) return null;
                                return (
                                  <div key={kpi.id} style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.25rem", marginBottom: "0.15rem" }}>
                                    <div style={{ fontSize: "0.58rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                                      지표: [{kpi.id}] {kpi.name}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.3rem" }}>
                                      {kpi.subItems.map((sub: LegacyPdcaRecord) => {
                                        const targetVal = activeProg.kpi_targets?.[sub.id] || "";
                                        return (
                                          <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(120, 120, 120, 0.02)", padding: "0.2rem 0.4rem", borderRadius: "0.2rem", border: "1px solid var(--border-color)" }}>
                                            <span style={{ fontSize: "0.58rem", color: "var(--text-secondary)", flex: 1, marginRight: "0.2rem" }}>
                                              • {sub.name} {targetVal !== "" ? `(목표: ${targetVal}${sub.unit})` : ""}
                                            </span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                              <input
                                                type="number"
                                                min="0"
                                                placeholder="실적"
                                                value={inputKpiActuals[sub.id] !== undefined ? inputKpiActuals[sub.id] : ""}
                                                onChange={(e) => {
                                                  // 음수 입력을 방지하기 위해 입력값을 양의 실수(float)로 변환하고 0 이하인 경우 0으로 자동 보정합니다.
                                                  const val = parseFloat(e.target.value);
                                                  setInputKpiActuals({
                                                    ...inputKpiActuals,
                                                    [sub.id]: isNaN(val) ? "" : Math.max(0, val)
                                                  });
                                                }}
                                                style={{
                                                  width: "3.2rem",
                                                  textAlign: "right",
                                                  fontSize: "0.6rem",
                                                  padding: "0.1rem 0.2rem",
                                                  background: "var(--input-bg)",
                                                  color: "var(--text-primary)",
                                                  border: "1px solid var(--border-color)",
                                                  borderRadius: "0.15rem"
                                                }}
                                              />
                                              <span style={{ fontSize: "0.58rem", color: "#10b981", fontWeight: "700" }}>{sub.unit}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 실적수 입력 */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.4rem", marginTop: "0.3rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                        {activeProg && (parseFloat(activeProg.target_participants) || 0) > 0 && (
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                              {activeProg.target_participants_name || "참여인원"} 실적 ({activeProg.target_participants_unit || "명"})
                            </span>
                            <input
                              type="number"
                              min="0"
                              className="user-selector"
                              placeholder="실적 수치"
                              value={inputParticipants}
                              onChange={(e) => {
                                // 참여인원 실적 값의 음수 입력을 차단하고 0 이상만 허용합니다.
                                const val = parseFloat(e.target.value);
                                setInputParticipants(isNaN(val) ? "" : Math.max(0, val).toString());
                              }}
                              style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }}
                            />
                          </div>
                        )}
                        {activeProg && (parseFloat(activeProg.target_developments) || 0) > 0 && (
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                              {activeProg.target_developments_name || "개발수"} 실적 ({activeProg.target_developments_unit || "건"})
                            </span>
                            <input
                              type="number"
                              min="0"
                              className="user-selector"
                              placeholder="실적 수치"
                              value={inputActualDevelopments}
                              onChange={(e) => {
                                // 개발수 실적 값의 음수 입력을 차단하고 0 이상만 허용합니다.
                                const val = parseFloat(e.target.value);
                                setInputActualDevelopments(isNaN(val) ? "" : Math.max(0, val).toString());
                              }}
                              style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }}
                            />
                          </div>
                        )}
                        {activeProg && (parseFloat(activeProg.target_etc) || 0) > 0 && (
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                              {activeProg.target_etc_name || "기타"} 실적 ({activeProg.target_etc_unit || "개"})
                            </span>
                            <input
                              type="number"
                              min="0"
                              className="user-selector"
                              placeholder="실적 수치"
                              value={inputActualEtc}
                              onChange={(e) => {
                                // 기타 실적 값의 음수 입력을 차단하고 0 이상만 허용합니다.
                                const val = parseFloat(e.target.value);
                                setInputActualEtc(isNaN(val) ? "" : Math.max(0, val).toString());
                              }}
                              style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }}
                            />
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: "0.82rem", color: "#60a5fa", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                            계획대비 달성률 (%) (자동계산)
                          </span>
                          <input
                            type="text"
                            className="user-selector"
                            placeholder="자동계산"
                            value={inputAchieveRate}
                            readOnly={true}
                            style={{
                              padding: "0.2rem 0.4rem",
                              fontSize: "0.7rem",
                              width: "100%",
                              background: "rgba(120, 120, 120, 0.02)",
                              border: "1px solid rgba(96, 165, 250, 0.3)",
                              color: "#60a5fa",
                              fontWeight: "700",
                              textAlign: "center",
                              cursor: "not-allowed"
                            }}
                          />
                        </div>
                      </div>

                      {currentRole.id !== "GUEST" ? (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
                          <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#10b981", color: "white" }}>
                            D(수행실적) 저장
                          </button>
                        </div>
                      ) : (
                        <div style={{ padding: "0.4rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-color)", borderRadius: "6px", color: "var(--text-secondary)", textAlign: "center", fontSize: "0.68rem", marginTop: "0.4rem" }}>
                          🔒 게스트(방문자) 계정은 읽기 전용입니다. (수정 불가)
                        </div>
                      )}
                    </div>
                  </form>
  );
}
