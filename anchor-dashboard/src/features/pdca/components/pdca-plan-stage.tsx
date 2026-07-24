import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { LegacyPdcaRecord } from "../utils/pdca-utils";
import { BUDGET_CATEGORIES_OPTIONS } from "../utils/pdca-utils";

type StringSetter = Dispatch<SetStateAction<string>>;
interface BudgetCategoryRow extends LegacyPdcaRecord {
  category: string;
  budget: string;
  budget_carry: string;
  spent: string;
  spent_carry: string;
}

interface PdcaPlanStageProps {
  handleUpdatePDetails: (event: FormEvent<HTMLFormElement>) => void;
  programVersions: LegacyPdcaRecord[];
  selectedVersionId: string;
  setSelectedVersionId: StringSetter;
  currentRole: LegacyPdcaRecord;
  selectedYear: number;
  inputBudgetNational: string;
  setInputBudgetNational: StringSetter;
  inputBudgetCarryNational: string;
  setInputBudgetCarryNational: StringSetter;
  inputBudgetCity: string;
  setInputBudgetCity: StringSetter;
  inputBudgetCarryCity: string;
  setInputBudgetCarryCity: StringSetter;
  inputBudgetExternal: string;
  setInputBudgetExternal: StringSetter;
  inputTargetParticipantsName: string;
  setInputTargetParticipantsName: StringSetter;
  inputTargetParticipants: string;
  setInputTargetParticipants: StringSetter;
  inputTargetParticipantsUnit: string;
  setInputTargetParticipantsUnit: StringSetter;
  inputTargetDevelopmentsName: string;
  setInputTargetDevelopmentsName: StringSetter;
  inputTargetDevelopments: string;
  setInputTargetDevelopments: StringSetter;
  inputTargetDevelopmentsUnit: string;
  setInputTargetDevelopmentsUnit: StringSetter;
  inputTargetEtcName: string;
  setInputTargetEtcName: StringSetter;
  inputTargetEtc: string;
  setInputTargetEtc: StringSetter;
  inputTargetEtcUnit: string;
  setInputTargetEtcUnit: StringSetter;
  inputTargetAudience: string;
  setInputTargetAudience: StringSetter;
  inputCoopDept1: string;
  setInputCoopDept1: StringSetter;
  inputCoopDept2: string;
  setInputCoopDept2: StringSetter;
  inputBudgetCategories: BudgetCategoryRow[];
  setInputBudgetCategories: Dispatch<SetStateAction<BudgetCategoryRow[]>>;
  monthsList: string[];
  inputMonthlyPDCA: string[];
  setInputMonthlyPDCA: Dispatch<SetStateAction<string[]>>;
  activeProg: LegacyPdcaRecord;
  allUnits: LegacyPdcaRecord[];
  inputKpiTypes: string[];
  setInputKpiTypes: Dispatch<SetStateAction<string[]>>;
  inputKpiLinks: string[];
  setInputKpiLinks: Dispatch<SetStateAction<string[]>>;
  inputKpiTargets: Record<string, number | string>;
  setInputKpiTargets: Dispatch<SetStateAction<Record<string, number | string>>>;
}

export function PdcaPlanStage({
  handleUpdatePDetails,
  programVersions,
  selectedVersionId,
  setSelectedVersionId,
  currentRole,
  selectedYear,
  inputBudgetNational,
  setInputBudgetNational,
  inputBudgetCarryNational,
  setInputBudgetCarryNational,
  inputBudgetCity,
  setInputBudgetCity,
  inputBudgetCarryCity,
  setInputBudgetCarryCity,
  inputBudgetExternal,
  setInputBudgetExternal,
  inputBudgetCategories,
  setInputBudgetCategories,
  monthsList,
  inputMonthlyPDCA,
  setInputMonthlyPDCA,
  activeProg,
  allUnits,
  inputKpiTypes,
  setInputKpiTypes,
  inputKpiLinks,
  setInputKpiLinks,
  inputKpiTargets,
  setInputKpiTargets,
  inputTargetParticipantsName,
  setInputTargetParticipantsName,
  inputTargetParticipants,
  setInputTargetParticipants,
  inputTargetParticipantsUnit,
  setInputTargetParticipantsUnit,
  inputTargetDevelopmentsName,
  setInputTargetDevelopmentsName,
  inputTargetDevelopments,
  setInputTargetDevelopments,
  inputTargetDevelopmentsUnit,
  setInputTargetDevelopmentsUnit,
  inputTargetEtcName,
  setInputTargetEtcName,
  inputTargetEtc,
  setInputTargetEtc,
  inputTargetEtcUnit,
  setInputTargetEtcUnit,
  inputTargetAudience,
  setInputTargetAudience,
  inputCoopDept1,
  setInputCoopDept1,
  inputCoopDept2,
  setInputCoopDept2,
}: PdcaPlanStageProps) {
  return (
                  <form onSubmit={handleUpdatePDetails} style={{ padding: "0.75rem", background: "rgba(59,130,246,0.02)", border: "1px solid var(--border-color)", borderRadius: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.0rem", fontWeight: "800", color: "var(--accent-color)", margin: 0 }}>P 단계: 예산 기획 및 세부 추진계획</h4>

                      {/* 버전 선택 드롭다운 */}
                      {(() => {
                        const approvedList = (programVersions || []).filter(v => v.status === "승인완료");
                        const latestApproved = approvedList.length > 0 ? approvedList[approvedList.length - 1] : null;
                        let currentVersionName = "최초";
                        if (latestApproved) {
                          if (latestApproved.version_name === "최초계획") {
                            currentVersionName = "최초";
                          } else if (latestApproved.version_name === "송경영 단장 직접 수정") {
                            const prevApprovedRevisions = approvedList.filter(v => v.version_name !== "송경영 단장 직접 수정");
                            currentVersionName = prevApprovedRevisions.length > 0
                              ? prevApprovedRevisions[prevApprovedRevisions.length - 1].version_name
                              : "최초";
                          } else {
                            currentVersionName = latestApproved.version_name;
                          }
                        }
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)" }}>📄 현재 버전:</span>
                            <select
                              value={selectedVersionId}
                              onChange={(e) => setSelectedVersionId(e.target.value)}
                              style={{
                                padding: "0.25rem 0.4rem",
                                fontSize: "0.68rem",
                                background: "var(--panel-bg)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "4px",
                                color: "var(--text-primary)",
                                outline: "none",
                                cursor: "pointer"
                              }}
                            >
                              <option value="current">{currentVersionName}</option>
                              {programVersions.map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.version_name === "최초계획" ? "최초" : v.version_name} ({v.status})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })()}
                    </div>

                    <fieldset disabled={selectedVersionId !== "current"} style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                      {/* 💡 프로그램 기획 및 예산 변경 방법 안내 카드 */}
                      <div className="" style={{
                        padding: "0.6rem 0.8rem",
                        background: "rgba(239, 68, 68, 0.04)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        lineHeight: "1.45",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                        boxShadow: "inset 0 1px 2px rgba(239, 68, 68, 0.02)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "800", color: "#f87171" }}>
                          💡 프로그램 기획 및 예산 변경 방법 안내
                        </div>
                        <p style={{ margin: 0 }}>
                          <strong>[변경 원칙]</strong> 재원별 예산 배정, 비목별 예산 배정, 월별 추진 일정(PDCA가 모두 반영), 실적목표(1개 이상), 참여대상 중 하나 이상의 수정사항을 반영하여 입력한 뒤 하단의 <strong>[저장 및 결재 요청]</strong> 버튼을 누르시면 '승인대기' 상태로 등록됩니다.
                        </p>
                        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                          - 운영팀장, 총괄본부장, 사업단장 결재 승인이 완료되면 최종 반영되며 새로운 변경 차수 버전이 영구 기록됩니다.
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                        {/* 1영역: 재원별 예산 */}
                        <div>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.15rem" }}>재원별 예산 배정 (백만원 단위)</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            {/* 재원별 3개 분할 영역 (국고, 지자체시비, 외부사업비) */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                              {/* 국고 카드 */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "0.35rem", border: "1px solid var(--border-color)" }}>
                                <span style={{ fontSize: "0.62rem", color: "#60a5fa", fontWeight: "800", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.15rem", marginBottom: "0.15rem" }}>국고</span>
                                <div>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)" }}>본예산</span>
                                  <input type="text" className="user-selector budget-main-input" value={inputBudgetNational} onChange={(e) => setInputBudgetNational(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                </div>
                                {selectedYear !== 1 && (
                                  <div>
                                    <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)" }}>이월예산</span>
                                    <input type="text" className="user-selector budget-carry-input" value={inputBudgetCarryNational} onChange={(e) => setInputBudgetCarryNational(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                  </div>
                                )}
                              </div>

                              {/* 지자체 시비 카드 */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "0.35rem", border: "1px solid var(--border-color)" }}>
                                <span style={{ fontSize: "0.62rem", color: "#34d399", fontWeight: "800", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.15rem", marginBottom: "0.15rem" }}>지자체 시비</span>
                                <div>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)" }}>본예산</span>
                                  <input type="text" className="user-selector budget-main-input" value={inputBudgetCity} onChange={(e) => setInputBudgetCity(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                </div>
                                {selectedYear !== 1 && (
                                  <div>
                                    <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)" }}>이월예산</span>
                                    <input type="text" className="user-selector budget-carry-input" value={inputBudgetCarryCity} onChange={(e) => setInputBudgetCarryCity(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                  </div>
                                )}
                              </div>

                              {/* 외부사업비 카드 (본예산/이월예산 구분 없이 '외부사업비' 단일 입력) */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "0.35rem", border: "1px solid var(--border-color)" }}>
                                <span style={{ fontSize: "0.62rem", color: "#fbbf24", fontWeight: "800", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.15rem", marginBottom: "0.15rem" }}>외부사업비</span>
                                <div style={{ marginTop: selectedYear === 1 ? "0rem" : "0.85rem" }}>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>외부사업비</span>
                                  <input type="text" className="user-selector budget-main-input" value={inputBudgetExternal} onChange={(e) => setInputBudgetExternal(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2영역: 비목별 예산 */}
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem" }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>비목별 예산 배정 (백만원 단위, 최대 4개)</span>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                            {inputBudgetCategories.map((item, idx) => (
                              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.2rem", alignItems: "center" }}>
                                <select
                                  className="user-selector"
                                  value={item.category}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newCats = [...inputBudgetCategories];
                                    newCats[idx].category = val;
                                    if (!val || val === "선택 안 함") {
                                      newCats[idx].budget = "";
                                      newCats[idx].budget_carry = "";
                                    }
                                    setInputBudgetCategories(newCats);
                                  }}
                                  style={{ fontSize: "0.7rem", padding: "0.2rem", width: "100%" }}
                                >
                                  {BUDGET_CATEGORIES_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  className="user-selector budget-main-input"
                                  placeholder="본예산"
                                  value={item.budget}
                                  disabled={!item.category || item.category === "선택 안 함"}
                                  onChange={(e) => {
                                    const newCats = [...inputBudgetCategories];
                                    newCats[idx].budget = e.target.value.replace(/[^0-9.]/g, "");
                                    setInputBudgetCategories(newCats);
                                  }}
                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                                />
                                <input
                                  type="text"
                                  className="user-selector budget-carry-input"
                                  placeholder="이월비"
                                  value={selectedYear === 1 ? 0 : item.budget_carry}
                                  disabled={selectedYear === 1 || !item.category || item.category === "선택 안 함"}
                                  onChange={(e) => {
                                    if (selectedYear === 1) return;
                                    const newCats = [...inputBudgetCategories];
                                    newCats[idx].budget_carry = e.target.value.replace(/[^0-9.]/g, "");
                                    setInputBudgetCategories(newCats);
                                  }}
                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3영역: 추진일정 */}
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem" }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>월별 추진 일정 (PDCA)</span>

                          <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid rgba(255,255,255,0.03)", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.58rem", color: "var(--accent-color)", fontWeight: "800", display: "inline-block", marginBottom: "0.25rem" }}>● 계획 일정</span>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.2rem", overflowX: "auto" }}>
                              {monthsList.map((month, idx) => {
                                const val = inputMonthlyPDCA[idx] || "";

                                const getStatusColor = (v: string) => {
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

                                const bg = getStatusColor(val);

                                return (
                                  <div key={idx} style={{ textAlign: "center", minWidth: "42px" }}>
                                    <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", marginBottom: "0.15rem" }}>{month}</div>
                                    <select
                                      className="user-selector"
                                      value={val}
                                      onChange={(e) => {
                                        const newPDCA = [...inputMonthlyPDCA];
                                        newPDCA[idx] = e.target.value;
                                        setInputMonthlyPDCA(newPDCA);
                                      }}
                                      style={{
                                        width: "100%",
                                        padding: "0.15rem 0.2rem",
                                        fontSize: "0.65rem",
                                        background: bg !== "transparent" ? bg : "var(--panel-bg)",
                                        color: bg !== "transparent" ? "white" : "var(--text-secondary)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "0.2rem",
                                        fontWeight: bg !== "transparent" ? "800" : "normal",
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

                          {/* 성과지표 연계 설정 영역 (최대 2개 다중 연계 지원) */}
                          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.45rem", marginTop: "0.2rem", marginBottom: "0.4rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700" }}>
                                성과지표 연계 (최대 2개)
                              </span>
                              {inputKpiLinks.length < 2 && inputKpiLinks[0] && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInputKpiLinks([...inputKpiLinks, ""]);
                                    setInputKpiTypes([...inputKpiTypes, "자율"]);
                                  }}
                                  style={{
                                    fontSize: "0.55rem",
                                    padding: "0.15rem 0.35rem",
                                    color: "#60a5fa",
                                    background: "rgba(59, 130, 246, 0.1)",
                                    border: "1px dashed rgba(59, 130, 246, 0.3)",
                                    borderRadius: "0.2rem",
                                    cursor: "pointer"
                                  }}
                                >
                                  ➕ 성과지표 추가
                                </button>
                              )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                              {inputKpiLinks.map((linkVal, idx) => {
                                const typeVal = inputKpiTypes[idx] || "자율";

                                return (
                                  <div key={idx} style={{ display: "grid", gridTemplateColumns: idx === 1 ? "1.2fr 1.6fr 0.3fr" : "1.2fr 1.8fr", gap: "0.5rem", alignItems: "center" }}>
                                    {/* 지표 유형 선택 라디오 그룹 */}
                                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", background: "var(--panel-bg)", padding: "0.2rem 0.35rem", borderRadius: "0.25rem", border: "1px solid var(--border-color)" }}>
                                      <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>유형:</span>
                                      <label style={{ fontSize: "0.62rem", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.1rem" }}>
                                        <input
                                          type="radio"
                                          name={`kpiTypeSelect_${idx}`}
                                          value="자율"
                                          checked={typeVal === "자율"}
                                          onChange={() => {
                                            const newTypes = [...inputKpiTypes];
                                            newTypes[idx] = "자율";
                                            setInputKpiTypes(newTypes);
                                            const newLinks = [...inputKpiLinks];
                                            newLinks[idx] = ""; // 유형 변경 시 초기화
                                            setInputKpiLinks(newLinks);
                                          }}
                                        />
                                        자율
                                      </label>
                                      <label style={{ fontSize: "0.62rem", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.1rem" }}>
                                        <input
                                          type="radio"
                                          name={`kpiTypeSelect_${idx}`}
                                          value="중점"
                                          checked={typeVal === "중점"}
                                          onChange={() => {
                                            const newTypes = [...inputKpiTypes];
                                            newTypes[idx] = "중점";
                                            setInputKpiTypes(newTypes);
                                            const newLinks = [...inputKpiLinks];
                                            newLinks[idx] = ""; // 유형 변경 시 초기화
                                            setInputKpiLinks(newLinks);
                                          }}
                                        />
                                        중점
                                      </label>
                                      {idx === 0 && (
                                        <label style={{ fontSize: "0.62rem", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.1rem" }}>
                                          <input
                                            type="radio"
                                            name={`kpiTypeSelect_${idx}`}
                                            value="없음"
                                            checked={typeVal === "없음"}
                                            onChange={() => {
                                              setInputKpiTypes(["없음"]);
                                              setInputKpiLinks([""]);
                                              setInputKpiTargets({}); // 지표 해제 시 세부지표 목표 초기화
                                            }}
                                          />
                                          없음
                                        </label>
                                      )}
                                    </div>

                                    {/* 지표 목록 드롭다운 */}
                                    <div style={{ display: "flex", width: "100%" }}>
                                      <select
                                        className="user-selector"
                                        value={linkVal}
                                        disabled={typeVal === "없음"}
                                        onChange={(e) => {
                                          const newLinks = [...inputKpiLinks];
                                          newLinks[idx] = e.target.value;
                                          setInputKpiLinks(newLinks);
                                        }}
                                        style={{
                                          width: "100%",
                                          padding: "0.25rem 0.4rem",
                                          fontSize: "0.7rem",
                                          background: typeVal === "없음" ? "var(--border-color)" : "var(--panel-bg)",
                                          color: typeVal === "없음" ? "var(--text-secondary)" : "var(--text-primary)",
                                          border: "1px solid var(--border-color)",
                                          cursor: typeVal === "없음" ? "not-allowed" : "pointer"
                                        }}
                                      >
                                        {typeVal === "없음" ? (
                                          <option value="" style={{ background: "var(--panel-bg)", color: "var(--text-secondary)" }}>-- 성과지표 연계 없음 --</option>
                                        ) : (
                                          <option value="" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>-- 성과지표를 선택해 주세요 --</option>
                                        )}
                                        {(() => {
                                          const activeUnit = allUnits.find(u => u.programs?.some((p: LegacyPdcaRecord) => p.id === activeProg?.id));
                                          let filteredKpis = activeUnit?.kpis || [];
                                          if (!Array.isArray(filteredKpis) || filteredKpis.length === 0) {
                                            const kpiMap = new Map();
                                            allUnits.forEach(u => {
                                              if (Array.isArray(u.kpis)) {
                                                u.kpis.forEach((k: LegacyPdcaRecord) => {
                                                  if (k && k.id) kpiMap.set(k.id, k);
                                                });
                                              }
                                            });
                                            filteredKpis = Array.from(kpiMap.values());
                                          }
                                          return filteredKpis
                                            .filter((k: LegacyPdcaRecord) => k && k.type === typeVal)
                                            .map((k: LegacyPdcaRecord) => (
                                              <option key={k.id} value={k.id} style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>
                                                [{k.id}] {k.name}
                                              </option>
                                            ));
                                        })()}
                                      </select>
                                    </div>

                                    {idx === 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInputKpiLinks([inputKpiLinks[0]]);
                                          setInputKpiTypes([inputKpiTypes[0]]);
                                          // 제거된 지표의 세부목표 삭제
                                          const firstKpi = allUnits.flatMap(u => u.kpis || []).find(k => k && k.id === inputKpiLinks[0]);
                                          const allowedSubIds = firstKpi?.subItems?.map((s: LegacyPdcaRecord) => s.id) || [];
                                          const cleanTargets: Record<string, number | string> = {};
                                          allowedSubIds.forEach((id: string) => {
                                            if (inputKpiTargets[id] !== undefined) {
                                              cleanTargets[id] = inputKpiTargets[id];
                                            }
                                          });
                                          setInputKpiTargets(cleanTargets);
                                        }}
                                        style={{
                                          fontSize: "0.62rem",
                                          padding: "0.22rem",
                                          background: "rgba(239, 68, 68, 0.1)",
                                          color: "#ef4444",
                                          border: "1px solid rgba(239, 68, 68, 0.2)",
                                          borderRadius: "0.25rem",
                                          cursor: "pointer",
                                          textAlign: "center"
                                        }}
                                      >
                                        ❌
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 성과지표 선택 시 세부지표 목록 및 목표치 입력란을 아래 줄에 디스플레이 */}
                          {inputKpiLinks.some(Boolean) && (() => {
                            const kpiList = allUnits.flatMap(u => u.kpis || []);
                            const selectedKpis = inputKpiLinks
                              .map(link => kpiList.find(k => k && k.id === link))
                              .filter(Boolean);

                            if (selectedKpis.length === 0) return null;

                            return (
                              <div style={{ marginTop: "0.4rem", background: "rgba(59, 130, 246, 0.04)", border: "1px solid rgba(59, 130, 246, 0.15)", borderRadius: "0.3rem", padding: "0.4rem 0.6rem" }}>
                                <div style={{ fontSize: "0.78rem", color: "#60a5fa", fontWeight: "800", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.15rem", marginBottom: "0.3rem" }}>
                                  📌 연계 성과지표 세부 목표치 입력 (P단계)
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                                  {selectedKpis.map(kpi => (
                                    <div key={kpi.id} style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.30rem", marginBottom: "0.15rem" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                                        <span style={{ fontSize: "0.6rem", color: "var(--text-primary)", fontWeight: "700" }}>[{kpi.id}] {kpi.name}</span>
                                        <span style={{ fontSize: "0.52rem", color: "var(--text-secondary)" }}>공식: {kpi.formula || "N/A"}</span>
                                      </div>
                                      {kpi.subItems && kpi.subItems.length > 0 ? (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.3rem" }}>
                                          {kpi.subItems.map((sub: LegacyPdcaRecord) => (
                                            <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(120, 120, 120, 0.02)", padding: "0.2rem 0.4rem", borderRadius: "0.2rem", border: "1px solid var(--border-color)" }}>
                                              <span style={{ fontSize: "0.58rem", color: "var(--text-secondary)", flex: 1, marginRight: "0.2rem" }}>• {sub.name}</span>
                                              <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  placeholder="목표"
                                                  value={inputKpiTargets[sub.id] !== undefined ? inputKpiTargets[sub.id] : ""}
                                                  onChange={(e) => {
                                                    // 음수 입력을 방지하기 위해 입력값을 양의 실수(float)로 변환하고 0 이하인 경우 0으로 자동 보정합니다.
                                                    const val = parseFloat(e.target.value);
                                                    setInputKpiTargets({
                                                      ...inputKpiTargets,
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
                                                <span style={{ fontSize: "0.58rem", color: "#34d399", fontWeight: "700" }}>{sub.unit}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)" }}>하위 세부지표 없음</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 실적목표 3종 구분 입력 (제목 입력창 신설 및 수치/단위 분리) */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
                            {/* 실적목표 1 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700" }}>실적목표 1 제목</span>
                              <input
                                type="text"
                                className="user-selector"
                                placeholder="예시) 참여인원"
                                value={inputTargetParticipantsName}
                                onChange={(e) => setInputTargetParticipantsName(e.target.value)}
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", width: "100%", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                              />
                              <div style={{ display: "flex", gap: "0.2rem" }}>
                                <input
                                  type="number"
                                  className="user-selector"
                                  placeholder="예시) 0"
                                  min="0"
                                  value={inputTargetParticipants}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setInputTargetParticipants(isNaN(val) ? "" : Math.max(0, val).toString());
                                  }}
                                  style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", flex: 2, minWidth: 0, background: "rgba(255,255,255,0.02)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                />
                                <input
                                  type="text"
                                  className="user-selector"
                                  placeholder="예시) 명"
                                  value={inputTargetParticipantsUnit}
                                  onChange={(e) => setInputTargetParticipantsUnit(e.target.value)}
                                  style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", flex: 1, minWidth: 0, textAlign: "center", background: "rgba(255,255,255,0.02)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                />
                              </div>
                            </div>

                            {/* 실적목표 2 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700" }}>실적목표 2 제목</span>
                              <input
                                type="text"
                                className="user-selector"
                                placeholder="예시) 개발수"
                                value={inputTargetDevelopmentsName}
                                onChange={(e) => setInputTargetDevelopmentsName(e.target.value)}
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", width: "100%", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                              />
                              <div style={{ display: "flex", gap: "0.2rem" }}>
                                <input
                                  type="number"
                                  className="user-selector"
                                  placeholder="예시) 0"
                                  min="0"
                                  value={inputTargetDevelopments}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setInputTargetDevelopments(isNaN(val) ? "" : Math.max(0, val).toString());
                                  }}
                                  style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", flex: 2, minWidth: 0, background: "rgba(255,255,255,0.02)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                />
                                <input
                                  type="text"
                                  className="user-selector"
                                  placeholder="예시) 건"
                                  value={inputTargetDevelopmentsUnit}
                                  onChange={(e) => setInputTargetDevelopmentsUnit(e.target.value)}
                                  style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", flex: 1, minWidth: 0, textAlign: "center", background: "rgba(255,255,255,0.02)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                />
                              </div>
                            </div>

                            {/* 실적목표 3 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700" }}>실적목표 3 제목</span>
                              <input
                                type="text"
                                className="user-selector"
                                placeholder="예시) 기타"
                                value={inputTargetEtcName}
                                onChange={(e) => setInputTargetEtcName(e.target.value)}
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", width: "100%", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                              />
                              <div style={{ display: "flex", gap: "0.2rem" }}>
                                <input
                                  type="number"
                                  className="user-selector"
                                  placeholder="예시) 0"
                                  min="0"
                                  value={inputTargetEtc}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setInputTargetEtc(isNaN(val) ? "" : Math.max(0, val).toString());
                                  }}
                                  style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", flex: 2, minWidth: 0, background: "rgba(255,255,255,0.02)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                />
                                <input
                                  type="text"
                                  className="user-selector"
                                  placeholder="예시) 개"
                                  value={inputTargetEtcUnit}
                                  onChange={(e) => setInputTargetEtcUnit(e.target.value)}
                                  style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem", flex: 1, minWidth: 0, textAlign: "center", background: "rgba(255,255,255,0.02)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 참여대상 & 연계부서 (실적목표 아래로 한 줄 배치) */}
                          {(() => {
                            const coopDeptOptions = (
                              <>
                                <option value="" style={{ background: "var(--modal-bg)", color: "var(--text-secondary)" }}>-- 선택 안 함 --</option>
                                <optgroup label="앵커사업단 센터" style={{ background: "var(--modal-bg)", color: "#60a5fa" }}>
                                  <option value="ECC센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>ECC센터</option>
                                  <option value="ICC센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>ICC센터</option>
                                  <option value="RCC센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>RCC센터</option>
                                  <option value="AID-X지원센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>AID-X지원센터</option>
                                  <option value="울산늘봄누리센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>울산늘봄누리센터</option>
                                  <option value="신산업특화센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>신산업특화센터</option>
                                  <option value="사업운영팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>사업운영팀</option>
                                </optgroup>
                                <optgroup label="대학본부 및 부속기관" style={{ background: "var(--modal-bg)", color: "#34d399" }}>
                                  <option value="기획팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>기획팀</option>
                                  <option value="교무팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>교무팀</option>
                                  <option value="교수학습지원센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>교수학습지원센터</option>
                                  <option value="직업교육혁신센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>직업교육혁신센터</option>
                                  <option value="취업지원팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>취업지원팀</option>
                                  <option value="학생복지팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>학생복지팀</option>
                                  <option value="입학팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>입학팀</option>
                                  <option value="평생교육원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>평생교육원</option>
                                  <option value="국제교류원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>국제교류원</option>
                                </optgroup>
                                <optgroup label="산학협력단 및 연구소/기타 센터" style={{ background: "var(--modal-bg)", color: "#fbbf24" }}>
                                  <option value="산학기획팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>산학기획팀</option>
                                  <option value="산학지원팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>산학지원팀</option>
                                  <option value="이차전지연구소" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>이차전지연구소</option>
                                  <option value="탄소중립지원센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>탄소중립지원센터</option>
                                  <option value="현장실습지원센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>현장실습지원센터</option>
                                  <option value="창업창직교육센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>창업창직교육센터</option>
                                </optgroup>
                              </>
                            );

                            return (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.4rem" }}>
                                <div>
                                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>참여대상 (복수선택 가능)</span>
                                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                                    {["재학생", "성인학습자", "재직자", "기타"].map((option) => {
                                      const selectedList = inputTargetAudience ? inputTargetAudience.split(",").map(s => s.trim()) : [];
                                      const isChecked = selectedList.includes(option);

                                      return (
                                        <label
                                          key={option}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                            fontSize: "0.68rem",
                                            color: "var(--text-primary)",
                                            background: isChecked ? "rgba(37,99,235,0.15)" : "var(--background-card, rgba(255,255,255,0.02))",
                                            border: isChecked ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                                            padding: "0.22rem 0.4rem",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            userSelect: "none",
                                            transition: "all 0.15s"
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              let newList = [...selectedList];
                                              if (e.target.checked) {
                                                newList.push(option);
                                              } else {
                                                newList = newList.filter(item => item !== option);
                                              }
                                              setInputTargetAudience(newList.join(", "));
                                            }}
                                            style={{ cursor: "pointer", accentColor: "var(--accent-color)" }}
                                          />
                                          {option}
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>연계부서 (최대 2개 선택)</span>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.2rem" }}>
                                    <select
                                      className="user-selector"
                                      value={inputCoopDept1}
                                      onChange={(e) => setInputCoopDept1(e.target.value)}
                                      style={{ width: "100%", padding: "0.25rem 0.4rem", fontSize: "0.7rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                    >
                                      {coopDeptOptions}
                                    </select>
                                    <select
                                      className="user-selector"
                                      value={inputCoopDept2}
                                      onChange={(e) => setInputCoopDept2(e.target.value)}
                                      style={{ width: "100%", padding: "0.25rem 0.4rem", fontSize: "0.7rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}
                                    >
                                      {coopDeptOptions}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                      </div>
                    </fieldset>

                    {selectedVersionId === "current" && currentRole.id !== "GUEST" ? (
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
                        <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem" }}>
                          P(기획정보) 변경 신청 / 저장
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: "0.4rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-color)", borderRadius: "6px", color: "var(--text-secondary)", textAlign: "center", fontSize: "0.68rem", marginTop: "0.4rem" }}>
                        🔒 {currentRole.id === "GUEST" ? "게스트(방문자) 계정은 읽기 전용입니다. (수정 불가)" : `${programVersions.find(v => v.id === Number(selectedVersionId))?.version_name} 조회 모드입니다. (수정 불가)`}
                      </div>
                    )}
                  </form>
  );
}
