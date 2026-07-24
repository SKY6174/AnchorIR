import type { Dispatch, FormEvent, SetStateAction } from "react";
import { FileSpreadsheet } from "lucide-react";

type StringSetter = Dispatch<SetStateAction<string>>;

interface SeminarResultModalProps {
  isEditMode: boolean;
  setIsSeminarModalOpen: Dispatch<SetStateAction<boolean>>;
  isAiAnalyzing: boolean;
  aiStatusText: string;
  handleFileUpload: (file: File | null | undefined) => void;
  handleSeminarSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  formSeminarId: string;
  setFormSeminarId: StringSetter;
  formSeminarDate: string;
  setFormSeminarDate: StringSetter;
  formSeminarSpeaker: string;
  setFormSeminarSpeaker: StringSetter;
  formSeminarTitle: string;
  setFormSeminarTitle: StringSetter;
  formSeminarAttendees: string;
  setFormSeminarAttendees: StringSetter;
  formSeminarMainCost: string;
  setFormSeminarMainCost: StringSetter;
  formSeminarCarryCost: string;
  setFormSeminarCarryCost: StringSetter;
  formSeminarSatisfaction: string;
  setFormSeminarSatisfaction: StringSetter;
  formSeminarEtc: string;
  setFormSeminarEtc: StringSetter;
}

export function SeminarResultModal({
  isEditMode,
  setIsSeminarModalOpen,
  isAiAnalyzing,
  aiStatusText,
  handleFileUpload,
  handleSeminarSubmit,
  formSeminarId,
  setFormSeminarId,
  formSeminarDate,
  setFormSeminarDate,
  formSeminarSpeaker,
  setFormSeminarSpeaker,
  formSeminarTitle,
  setFormSeminarTitle,
  formSeminarAttendees,
  setFormSeminarAttendees,
  formSeminarMainCost,
  setFormSeminarMainCost,
  formSeminarCarryCost,
  setFormSeminarCarryCost,
  formSeminarSatisfaction,
  setFormSeminarSatisfaction,
  formSeminarEtc,
  setFormSeminarEtc
}: SeminarResultModalProps) {
  return (
                      <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        backdropFilter: "blur(5px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        animation: "fadeIn 0.25s ease-out"
                      }}>
                        <div style={{
                          background: "var(--modal-bg, #1e293b)",
                          border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
                          borderRadius: "16px",
                          width: "90%",
                          maxWidth: "800px",
                          maxHeight: "90vh",
                          overflowY: "auto",
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          flexDirection: "column",
                          animation: "slideUp 0.3s ease-out"
                        }}>
                          {/* 모달 헤더 */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                              {isEditMode ? "지산학 이음 세미나 결과보고 수정" : "지산학 이음 세미나 결과보고 등록"}
                            </h4>
                            <button
                              onClick={() => setIsSeminarModalOpen(false)}
                              style={{ border: "none", background: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer", fontWeight: "bold" }}
                            >
                              ✕
                            </button>
                          </div>

                          {/* 모달 바디 */}
                          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>

                            {/* PDF/MD AI 분석 드롭존 섹션 */}
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = "#3b82f6";
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.04)";
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = "var(--border-color, rgba(255,255,255,0.15))";
                                e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = "var(--border-color, rgba(255,255,255,0.15))";
                                e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                              style={{
                                background: "rgba(255,255,255,0.01)",
                                border: "1px dashed var(--border-color, rgba(255,255,255,0.15))",
                                borderRadius: "10px",
                                padding: "1.2rem",
                                textAlign: "center",
                                transition: "all 0.25s ease"
                              }}
                            >
                              {isAiAnalyzing ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", padding: "1rem 0" }}>
                                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3b82f6", animation: "spin 1s linear infinite" }} />
                                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#3b82f6", minHeight: "20px" }}>{aiStatusText}</span>
                                  {/* 프로그레스바 */}
                                  <div style={{ width: "200px", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginTop: "0.2rem" }}>
                                    <div style={{ height: "100%", width: "70%", background: "#3b82f6", borderRadius: "2px", animation: "loadingBar 1.5s ease-in-out infinite" }} />
                                  </div>
                                </div>
                              ) : (
                                <label htmlFor="modal-pdf-uploader" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                  <FileSpreadsheet size={28} style={{ color: "#3b82f6" }} />
                                  <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--text-primary)" }}>📄 지산학 세미나 결과보고 PDF 또는 MD 파일 업로드 (GPT-4o 분석)</span>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>결과보고 PDF 또는 MD 파일을 여기에 업로드하시면, GPT-4o가 차수/강사/주제/예산 등을 자동 인식하여 입력창을 채워줍니다.</span>
                                  <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", padding: "0.2rem 0.6rem", background: "rgba(59,130,246,0.08)", borderRadius: "4px", marginTop: "0.2rem" }}>파일 선택하기</span>
                                  <input
                                    type="file"
                                    id="modal-pdf-uploader"
                                    accept=".pdf,.md"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(file);
                                    }}
                                    style={{ display: "none" }}
                                  />
                                </label>
                              )}
                            </div>

                            {/* 수동 입력 필드 그리드 */}
                            <form onSubmit={handleSeminarSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-4" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>차수 (숫자)</label>
                                  <input id="a11y-major-programs-manager-4"
                                    type="number"
                                    placeholder="예: 4"
                                    value={formSeminarId}
                                    onChange={(e) => setFormSeminarId(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                    required
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-5" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>일시</label>
                                  <input id="a11y-major-programs-manager-5"
                                    type="text"
                                    placeholder="예: 2026. 05. 22. (금) 11:00~13:00"
                                    value={formSeminarDate}
                                    onChange={(e) => setFormSeminarDate(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                    required
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-6" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>강사명 및 소속</label>
                                  <input id="a11y-major-programs-manager-6"
                                    type="text"
                                    placeholder="예: 장동선 (뇌과학자)"
                                    value={formSeminarSpeaker}
                                    onChange={(e) => setFormSeminarSpeaker(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                    required
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-7" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>세미나 주제 (제목)</label>
                                  <input id="a11y-major-programs-manager-7"
                                    type="text"
                                    placeholder="예: 인공지능 시대와 대학 교육"
                                    value={formSeminarTitle}
                                    onChange={(e) => setFormSeminarTitle(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                    required
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-8" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>참석자 수 (명)</label>
                                  <input id="a11y-major-programs-manager-8"
                                    type="number"
                                    placeholder="예: 88"
                                    value={formSeminarAttendees}
                                    onChange={(e) => setFormSeminarAttendees(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-9" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>본예산 집행액 (원)</label>
                                  <input id="a11y-major-programs-manager-9"
                                    type="number"
                                    placeholder="예: 1800000"
                                    value={formSeminarMainCost}
                                    onChange={(e) => setFormSeminarMainCost(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-10" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>이월예산 집행액 (원)</label>
                                  <input id="a11y-major-programs-manager-10"
                                    type="number"
                                    placeholder="예: 370000"
                                    value={formSeminarCarryCost}
                                    onChange={(e) => setFormSeminarCarryCost(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                  />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-11" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>평균 만족도 (1.0 ~ 5.0)</label>
                                  <input id="a11y-major-programs-manager-11"
                                    type="number"
                                    step="0.1"
                                    min="1.0"
                                    max="5.0"
                                    placeholder="예: 4.8"
                                    value={formSeminarSatisfaction}
                                    onChange={(e) => setFormSeminarSatisfaction(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none" }}
                                  />
                                </div>

                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                <label htmlFor="a11y-major-programs-manager-12" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "800" }}>기타 및 특이사항</label>
                                <textarea id="a11y-major-programs-manager-12"
                                  placeholder="세부 지출 내역, 연계 교류회 진행 현황 및 보도자료 게재 사실 등을 자유롭게 기입하세요."
                                  value={formSeminarEtc}
                                  onChange={(e) => setFormSeminarEtc(e.target.value)}
                                  rows={3}
                                  style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem", borderRadius: "6px", fontSize: "0.78rem", outline: "none", resize: "vertical" }}
                                />
                              </div>

                              {/* 모달 푸터 액션 버튼 */}
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                                <button
                                  type="button"
                                  onClick={() => setIsSeminarModalOpen(false)}
                                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", padding: "0.45rem 1rem", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "700" }}
                                >
                                  취소
                                </button>
                                <button
                                  type="submit"
                                  style={{ background: "linear-gradient(135deg, var(--accent-color), #2563eb)", border: "none", color: "#fff", padding: "0.45rem 1.2rem", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "800", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
                                >
                                  {isEditMode ? "수정 완료" : "등록 완료"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
  );
}
