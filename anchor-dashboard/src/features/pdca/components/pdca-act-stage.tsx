import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { LegacyPdcaRecord } from "../utils/pdca-utils";

interface PdcaActStageProps {
  handleUpdateA: (event: FormEvent<HTMLFormElement>) => void;
  inputEvalType: string; setInputEvalType: Dispatch<SetStateAction<string>>;
  inputExcellent: string; setInputExcellent: Dispatch<SetStateAction<string>>;
  inputImprovePlan: string; setInputImprovePlan: Dispatch<SetStateAction<string>>;
  inputDeficiency: string; setInputDeficiency: Dispatch<SetStateAction<string>>;
  inputActionItem: string; setInputActionItem: Dispatch<SetStateAction<string>>;
  currentRole: LegacyPdcaRecord;
}

export function PdcaActStage({
  handleUpdateA, inputEvalType, setInputEvalType, inputExcellent, setInputExcellent,
  inputImprovePlan, setInputImprovePlan, inputDeficiency, setInputDeficiency,
  inputActionItem, setInputActionItem, currentRole,
}: PdcaActStageProps) {
  return (
                  <form onSubmit={handleUpdateA} style={{ padding: "0.75rem", background: "rgba(217,70,239,0.03)", border: "1px solid rgba(217,70,239,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "1.0rem", fontWeight: "800", marginBottom: "0.5rem", color: "#d946ef" }}>A 단계: 사업 환류 및 자체평가</h4>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: "700" }}>자체평가 구분:</span>
                      <label style={{ fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="radio" name="evalType" value="우수" checked={inputEvalType === "우수"} onChange={() => setInputEvalType("우수")} />
                        우수 프로그램
                      </label>
                      <label style={{ fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="radio" name="evalType" value="미흡" checked={inputEvalType === "미흡"} onChange={() => setInputEvalType("미흡")} />
                        미흡 프로그램
                      </label>
                    </div>

                    {inputEvalType === "우수" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>우수한 점</span>
                            <textarea className="user-selector" rows={2} value={inputExcellent} onChange={(e) => setInputExcellent(e.target.value)} placeholder="프로그램 운영 중 창출된 우수한 성과 및 성료 요인을 기록하세요." style={{ width: "100%", fontSize: "0.7rem", padding: "0.3rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>발전방안</span>
                            <textarea className="user-selector" rows={2} value={inputImprovePlan} onChange={(e) => setInputImprovePlan(e.target.value)} placeholder="우수한 성과를 타 프로그램으로 확산하거나 차년도에 더욱 발전시킬 방안을 기입하세요." style={{ width: "100%", fontSize: "0.7rem", padding: "0.3rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>미비점</span>
                            <textarea className="user-selector" rows={2} value={inputDeficiency} onChange={(e) => setInputDeficiency(e.target.value)} placeholder="운영상의 한계, 예산 집행 차질, 혹은 목표 달성 미달의 주원인을 파악하여 입력하세요." style={{ width: "100%", fontSize: "0.7rem", padding: "0.3rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>개선사항</span>
                            <textarea className="user-selector" rows={2} value={inputActionItem} onChange={(e) => setInputActionItem(e.target.value)} placeholder="발견된 미비점을 극복하고 차년도 계획 시 보완 및 구조조정할 대책을 기입하세요." style={{ width: "100%", fontSize: "0.7rem", padding: "0.3rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {currentRole.id !== "GUEST" ? (
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                        <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#d946ef", color: "white" }}>
                          A(환류조치) 저장
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: "0.4rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-color)", borderRadius: "6px", color: "var(--text-secondary)", textAlign: "center", fontSize: "0.68rem", marginTop: "0.5rem" }}>
                        🔒 게스트(방문자) 계정은 읽기 전용입니다. (수정 불가)
                      </div>
                    )}
                  </form>
  );
}
