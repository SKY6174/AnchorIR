import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { LegacyPdcaRecord } from "../utils/pdca-utils";

interface PdcaCheckStageProps {
  handleUpdateCDetails: (event: FormEvent<HTMLFormElement>) => void;
  inputAchievements: string;
  setInputAchievements: Dispatch<SetStateAction<string>>;
  inputSatisfaction: string;
  setInputSatisfaction: Dispatch<SetStateAction<string>>;
  currentRole: LegacyPdcaRecord;
}

export function PdcaCheckStage({
  handleUpdateCDetails, inputAchievements, setInputAchievements,
  inputSatisfaction, setInputSatisfaction, currentRole,
}: PdcaCheckStageProps) {
  return (
                  <form onSubmit={handleUpdateCDetails} style={{ padding: "0.75rem", background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "1.0rem", fontWeight: "800", marginBottom: "0.5rem", color: "#f59e0b" }}>C 단계: 운영 성과 실적 입력</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>성과사항 (정성/정량적 성과 서술)</span>
                        <textarea className="user-selector" rows={3} value={inputAchievements} onChange={(e) => setInputAchievements(e.target.value)} placeholder="프로그램 운영을 통해 달성한 주요 성과 사항을 서술해 주세요." style={{ width: "100%", fontSize: "0.7rem", padding: "0.3rem", background: "var(--panel-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", width: "140px", color: "var(--text-secondary)", fontWeight: "700" }}>만족도 (점 / 100점):</span>
                        <input type="text" className="user-selector" placeholder="예: 95" value={inputSatisfaction} onChange={(e) => setInputSatisfaction(e.target.value)} style={{ flexGrow: 1, fontSize: "0.7rem", padding: "0.25rem 0.4rem" }} />
                      </div>
                      {currentRole.id !== "GUEST" ? (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
                          <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#f59e0b", color: "white" }}>
                            C(성과검증) 저장
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
