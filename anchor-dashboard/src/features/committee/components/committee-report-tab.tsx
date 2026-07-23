import type React from "react";
import { Award, Cpu, Edit3, FileText } from "lucide-react";

interface CommitteeReportTabProps {
  editedReportText: string;
  handleDownloadSignedPDF: (report: any) => void | Promise<void>;
  handleSaveEditedReport: (resultId: string) => void | Promise<void>;
  isDownloadingPdf: string | null;
  isEditingReport: boolean;
  isMeetingManager?: boolean;
  renderMarkdownText: (text: string) => React.ReactNode;
  reports: any[];
  selectedReportId: string | null;
  setEditedReportText: React.Dispatch<React.SetStateAction<string>>;
  setIsEditingReport: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedReportId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function CommitteeReportTab({
  editedReportText,
  handleDownloadSignedPDF,
  handleSaveEditedReport,
  isDownloadingPdf,
  isEditingReport,
  isMeetingManager,
  renderMarkdownText,
  reports,
  selectedReportId,
  setEditedReportText,
  setIsEditingReport,
  setSelectedReportId
}: CommitteeReportTabProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>
                위원회 의결 결과보고 대장
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                성원 및 표결 요건을 충족하여 가결/부결 처리된 공식 보고서 목록입니다.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4.5rem", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
              <FileText size={48} style={{ display: "block", margin: "0 auto 1rem auto" }} />
              <span>아직 탑재 완료(AI 종합 분석)된 위원회 결과 보고서가 없습니다.</span>
            </div>
          ) : (
            // 💡 [UI 개편 - Master-Detail 2열 레이아웃 적용] 좌측 리스트와 우측 상세 뷰어를 flex 구조로 분리
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginTop: "0.5rem" }}>

              {/* 왼쪽 블록: 위원회 회의 결과보고 목록 리스트 */}
              <div
                style={{
                  width: "280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  maxHeight: "650px",
                  overflowY: "auto"
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-secondary)", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.25rem" }}>
                  회의 목록 ({reports.length}건)
                </div>
                {reports.map((rep) => {
                  const isSelected = selectedReportId === rep.id;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReportId(rep.id)}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        border: isSelected ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.05)",
                        background: isSelected ? "rgba(37, 99, 235, 0.1)" : "rgba(255,255,255,0.01)",
                        transition: "all 0.2s ease"
                      }}
                     role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--accent-color)", fontWeight: "bold" }}>
                        {rep.committee_meetings?.committees?.name}
                      </span>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rep.committee_meetings?.title}
                      </h4>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        {rep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 오른쪽 블록: 선택된 결과보고서 상세 분석 & 다운로드 영역 */}
              <div style={{ flex: 1 }}>
                {(() => {
                  const activeRep = reports.find(r => r.id === selectedReportId) || reports[0];
                  if (!activeRep) return null;

                  // 💡 [의결 형태별 일시 표기 분기] 서면의결인 경우 시간 없이 일자만 표시, 대면인 경우 시작시간까지 표시
                  const isWrittenMeeting = activeRep.committee_meetings?.meeting_type === "ONLINE_WRITTEN";
                  const displayDate = activeRep.committee_meetings?.meeting_date
                    ? new Date(activeRep.committee_meetings.meeting_date).toLocaleDateString("ko-KR",
                      isWrittenMeeting
                        ? { year: 'numeric', month: 'long', day: 'numeric' }
                        : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                    )
                    : "-";

                  return (
                    <div
                      className="card"
                      style={{
                        padding: "1.5rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "rgba(255,255,255,0.01)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "bold", display: "block" }}>
                            {activeRep.committee_meetings?.committees?.name}
                          </span>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.15rem" }}>
                            {activeRep.committee_meetings?.title}
                          </h3>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            의결 형태: {activeRep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"} | 회의 일시: {displayDate} | 보고서 탑재일: {activeRep.published_at ? new Date(activeRep.published_at).toLocaleDateString("ko-KR") : ""}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <span style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            background: activeRep.is_established ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: activeRep.is_established ? "#22c55e" : "#ef4444"
                          }}>
                            {activeRep.is_established ? "의결 성원" : "미성원 취소"}
                          </span>
                          <span style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            background: activeRep.decision_status === "APPROVED" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                            color: activeRep.decision_status === "APPROVED" ? "#10b981" : "#ef4444"
                          }}>
                            {activeRep.decision_status === "APPROVED" ? "안건 가결" : activeRep.decision_status === "REJECTED" ? "안건 부결" : "의결 취소"}
                          </span>
                        </div>
                      </div>

                      {/* 안건 요지 */}
                      <div style={{ padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>제출 안건 요지:</strong>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-line" }}>{activeRep.committee_meetings?.agenda}</p>
                      </div>

                      {/* AI 종합 분석 결과 */}
                      <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Cpu size={16} style={{ color: "var(--accent-color)" }} />
                            앵커사업단 각종 위원회 심의 분석서
                          </strong>
                          {isMeetingManager && !isEditingReport && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingReport(true);
                                setEditedReportText(activeRep.ai_summary || "");
                              }}
                              className="btn"
                              style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem" }}
                            >
                              <Edit3 size={12} /> 수정하기
                            </button>
                          )}
                        </div>

                        {isEditingReport ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <textarea
                              value={editedReportText}
                              onChange={(e) => setEditedReportText(e.target.value)}
                              style={{ width: "100%", height: "250px", background: "var(--card-bg-fallback)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "0.5rem", fontSize: "0.82rem", lineHeight: "1.5", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                              placeholder="심의 분석서 내용을 자유롭게 작성/수정해 주세요."
                            />
                            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => handleSaveEditedReport(activeRep.id)}
                                className="btn btn-primary"
                                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingReport(false)}
                                className="btn"
                                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {renderMarkdownText(activeRep.ai_summary)}
                          </div>
                        )}
                      </div>

                      {/* 공식 회의록 인증 및 다운로드 단추 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)", fontSize: "0.8rem", color: "#60a5fa" }}>
                          <Award size={14} />
                          <span>{activeRep.official_minutes}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadSignedPDF(activeRep)}
                          disabled={isDownloadingPdf === activeRep.id}
                          className="btn btn-primary"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            padding: "0.5rem 1rem",
                            fontSize: "0.82rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            width: "fit-content",
                            marginTop: "0.25rem",
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            border: "none",
                            color: "#fff",
                            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                          }}
                        >
                          {isDownloadingPdf === activeRep.id ? (
                            <>
                              <div className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                              PDF 봉인 날인 중...
                            </>
                          ) : (
                            <>
                              <FileText size={15} />
                              의결 결과보고서 다운로드 (디지털 봉인)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}
        </div>
  );
}
