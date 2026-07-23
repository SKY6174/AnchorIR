import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";

interface ProcurementProposalModalProps {
  PROPOSAL_SUMMARIES: Record<string, any>;
  convertMillionWonToThousandWon: (budgetStr?: string | null) => string;
  proposalModalData: any;
  selectedProposalIdx: number;
  setProposalModalData: Dispatch<SetStateAction<any>>;
  setSelectedProposalIdx: Dispatch<SetStateAction<number>>;
}

export function ProcurementProposalModal({
  PROPOSAL_SUMMARIES,
  convertMillionWonToThousandWon,
  proposalModalData,
  selectedProposalIdx,
  setProposalModalData,
  setSelectedProposalIdx
}: ProcurementProposalModalProps) {
        // 다중 기획 파일 리스트 빌드
        const planList = proposalModalData.docPlanFileList && Array.isArray(proposalModalData.docPlanFileList) && proposalModalData.docPlanFileList.length > 0
          ? proposalModalData.docPlanFileList
          : (proposalModalData.docPlanFileName ? [{
              id: "legacy-plan",
              name: proposalModalData.docPlanFileName,
              size: proposalModalData.docPlanFileSize || 0,
              url: proposalModalData.docPlanFileUrl || "",
              aiData: proposalModalData.aiProposalData || null
            }] : []);

        const activeFile = planList[selectedProposalIdx] || planList[0];
        const activeAi = activeFile?.aiData || null;

        return (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            padding: "2rem 1rem"
          }}>
            <div style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "0.75rem",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              color: "var(--text-primary)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              margin: "auto",
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#60A5FA", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📄 기획문서 상세 조회 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(사업단 작성)</span>
                </h4>
                <button
                  onClick={() => {
                    setProposalModalData(null);
                    setSelectedProposalIdx(0);
                  }}
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 다중 파일이 존재할 경우 문서 선택기 콤보박스 노출 */}
              {planList.length > 1 && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#93C5FD", fontWeight: "700", marginBottom: "0.25rem" }}>
                    📚 첨부된 기획 결재문서 선택 ({planList.length}건)
                  </label>
                  <select id="a11y-procurement-manager-56"
                    value={selectedProposalIdx}
                    onChange={(e) => setSelectedProposalIdx(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    {planList.map((f: any, idx: number) => (
                      <option key={f.id || idx} value={idx}>
                        {idx + 1}. {f.name.slice(0, 45)} {f.aiData ? `(${f.aiData.docNo})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeAi ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(96, 165, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(96, 165, 250, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#93C5FD", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📝 기획문서 결재번호 (AI 분석 완료)</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {activeAi.docNo}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>단위과제</span>
                    <strong style={{ fontSize: "0.9rem" }}>{activeAi.unit}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>주관 부서</span>
                    <span>{activeAi.dept}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>과제 배정 예산 (단위: 천원)</span>
                    <strong style={{ color: "#3b82f6" }}>{activeAi.budget}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {(activeAi.goals || []).map((goal: string, idx: number) => (
                        <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (() => {
                const summary = PROPOSAL_SUMMARIES[proposalModalData.unit] || {
                  title: "알 수 없는 단위과제",
                  dept: "미지정 센터",
                  goals: ["상세 계획 확인 중"],
                  budget: "0.0백만원"
                };

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                    <div style={{ background: "rgba(96, 165, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(96, 165, 250, 0.25)" }}>
                      <span style={{ fontSize: "0.72rem", color: "#93C5FD", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📝 기획문서 결재번호</span>
                      <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                        {activeFile?.name ? activeFile.name.replace(/\.[^/.]+$/, "") : (proposalModalData.docPlan || `UC-EQ-${proposalModalData.unit}-${String(proposalModalData.seq || proposalModalData.id).slice(-3).padStart(3, "0")}`)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>단위과제</span>
                      <strong style={{ fontSize: "0.9rem" }}>{proposalModalData.unit} : {summary.title}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>주관 부서</span>
                      <span>{summary.dept}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>과제 배정 예산</span>
                      <strong style={{ color: "#3b82f6" }}>{convertMillionWonToThousandWon(summary.budget)}</strong>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {summary.goals.map((goal: string, idx: number) => (
                          <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", flexShrink: 0 }}>
                {activeFile?.url ? (
                  <a
                    href={activeFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#60A5FA", textDecoration: "none", fontWeight: "700" }}
                  >
                    📎 첨부문서 다운로드
                  </a>
                ) : (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>첨부파일 없음</span>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setProposalModalData(null);
                    setSelectedProposalIdx(0);
                  }}
                  style={{ padding: "0.4rem 1.25rem", fontSize: "0.75rem" }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        );
}
