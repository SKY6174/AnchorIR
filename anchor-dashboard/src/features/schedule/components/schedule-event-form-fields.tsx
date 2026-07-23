import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { AiDebateLog, ScheduleFormData } from "../schedule-types";

interface ScheduleEventFormFieldsProps {
  aiDebateLogs: AiDebateLog[];
  aiFileName: string;
  aiProgress: number;
  aiRawText: string;
  aiResultApplied: boolean;
  aiResultFileName: string;
  aiResultRawText: string;
  aiStatusText: string;
  formData: ScheduleFormData;
  handleAiFileChange: (event: ChangeEvent<HTMLInputElement>, mode: "plan" | "result") => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleLoadSampleFile: () => void;
  isAiLoading: boolean;
  isDebating: boolean;
  setAiDebateLogs: Dispatch<SetStateAction<AiDebateLog[]>>;
  setAiRawText: Dispatch<SetStateAction<string>>;
  setAiResultRawText: Dispatch<SetStateAction<string>>;
  triggerAiAutoFill: (mode?: string) => void;
  triggerAiDebate: (mode?: string) => void;
}

export function ScheduleEventFormFields({
  aiDebateLogs,
  aiFileName,
  aiProgress,
  aiRawText,
  aiResultApplied,
  aiResultFileName,
  aiResultRawText,
  aiStatusText,
  formData,
  handleAiFileChange,
  handleInputChange,
  handleLoadSampleFile,
  isAiLoading,
  isDebating,
  setAiDebateLogs,
  setAiRawText,
  setAiResultRawText,
  triggerAiAutoFill,
  triggerAiDebate
}: ScheduleEventFormFieldsProps) {
  return (
                <>
                  {/* AI 기획서/결과서 자동 기입 위젯 */}
                  <div style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "1rem"
                  }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#a78bfa" }}>🧠 지능형 AI-분석 연동 (기획 vs 결과 분리)</span>
                    </div>

                    <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", lineHeight: "1.3", marginBottom: "0.75rem" }}>
                      💡 <strong>기획서</strong>를 분석하면 명칭, 담당 부서, 장소, 일자, 시간, 목적, 프로그램 등 일정 정보가 자동 완성됩니다.<br />
                      💡 <strong>결과보고서</strong>를 분석하면 하단의 행사 결과 요약이 자동으로 입력됩니다.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {/* [1] 기획서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>1️⃣ 행사 기획/계획 단계</span>
                          <button
                            type="button"
                            onClick={handleLoadSampleFile}
                            style={{ fontSize: "0.6rem", color: "#60a5fa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                          >
                            [샘플로드]
                          </button>
                        </div>
                        <input
                          type="file"
                          id="ai-plan-file"
                          accept=".txt,.pdf"
                          onChange={(e) => handleAiFileChange(e, "plan")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-plan-file"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.35rem 0.5rem",
                            background: "var(--input-bg)",
                            border: "1px dashed rgba(167, 139, 250, 0.4)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                            {aiFileName || "기획서 파일 첨부"}
                          </span>
                          <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.2)", padding: "0.1rem 0.25rem", borderRadius: "3px" }}>탐색</span>
                        </label>
                        <textarea id="a11y-schedule-manager-20"
                          value={aiRawText}
                          onChange={(e) => setAiRawText(e.target.value)}
                          placeholder="또는 기획서 본문을 직접 붙여넣으세요..."
                          style={{
                            width: "100%",
                            height: "45px",
                            padding: "0.3rem",
                            background: "rgba(0,0,0,0.15)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "0.68rem",
                            resize: "none"
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => triggerAiAutoFill("plan")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "rgba(139, 92, 246, 0.15)",
                              border: "1px solid var(--accent-color)",
                              color: "var(--text-primary)",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            단독 분석
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerAiDebate("plan")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1.2,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)"
                            }}
                          >
                            ⚔️ 합의 토론
                          </button>
                        </div>
                      </div>

                      {/* [2] 결과보고서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.3rem" }}>2️⃣ 행사 결과/실적 단계</span>
                        <input
                          type="file"
                          id="ai-result-file"
                          accept=".txt,.pdf"
                          onChange={(e) => handleAiFileChange(e, "result")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-result-file"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.35rem 0.5rem",
                            background: "var(--input-bg)",
                            border: "1px dashed rgba(167, 139, 250, 0.4)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                            {aiResultFileName || "결과보고서 파일 첨부"}
                          </span>
                          <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.2)", padding: "0.1rem 0.25rem", borderRadius: "3px" }}>탐색</span>
                        </label>
                        <textarea
                          value={aiResultRawText}
                          onChange={(e) => setAiResultRawText(e.target.value)}
                          placeholder="또는 결과보고서 본문을 직접 붙여넣으세요..."
                          style={{
                            width: "100%",
                            height: "45px",
                            padding: "0.3rem",
                            background: "rgba(0,0,0,0.15)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "0.68rem",
                            resize: "none"
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => triggerAiAutoFill("result")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid #10B981",
                              color: "var(--text-primary)",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            단독 분석
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerAiDebate("result")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1.2,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                            }}
                          >
                            ⚔️ 합의 토론
                          </button>
                        </div>
                      </div>
                    </div>

                    {isAiLoading && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#a78bfa", marginBottom: "0.2rem", fontFamily: "monospace" }}>
                          <span>{aiStatusText}</span>
                          <span>{aiProgress}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "var(--input-bg)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${aiProgress}%`, height: "100%", background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)", borderRadius: "2px", transition: "width 0.15s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* 실시간 AI Debate Room 모니터링 패널 */}
                    {(isDebating || aiDebateLogs.length > 0) && (
                      <div style={{
                        marginTop: "0.75rem",
                        padding: "0.6rem 0.75rem",
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.4)",
                        borderRadius: "6px",
                        boxShadow: "0 0 12px rgba(139, 92, 246, 0.25)",
                        fontFamily: "monospace",
                        fontSize: "0.68rem"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.3rem", marginBottom: "0.4rem" }}>
                          <span style={{ color: "#a78bfa", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            ⚔️ AI Consensus Debate Room
                          </span>
                          <button
                            type="button"
                            onClick={() => setAiDebateLogs([])}
                            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.6rem" }}
                          >
                            비우기
                          </button>
                        </div>

                        <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {aiDebateLogs.map((log, index) => {
                            let color = "var(--text-primary)";
                            let prefix = "🤖 ";
                            let bg = "rgba(255,255,255,0.02)";

                            if (log.role === "chatgpt") {
                              color = "#10B981";
                              prefix = "🟢 ChatGPT: ";
                              bg = "rgba(16, 185, 129, 0.05)";
                            } else if (log.role === "gemini") {
                              color = "#3B82F6";
                              prefix = "🔵 Gemini: ";
                              bg = "rgba(59, 130, 246, 0.05)";
                            } else if (log.role === "system") {
                              color = "#A78BFA";
                              prefix = "⚙️ ";
                              bg = "rgba(167, 139, 250, 0.05)";
                            }

                            return (
                              <div
                                key={index}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  borderRadius: "4px",
                                  background: bg,
                                  borderLeft: `2.5px solid ${color === "var(--text-primary)" ? "transparent" : color}`,
                                  color: color,
                                  lineHeight: "1.3"
                                }}
                              >
                                <strong>{prefix}</strong>{log.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-schedule-manager-21" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>담당 부서(센터)</label>
                      <select id="a11y-schedule-manager-21" name="department" value={formData.department} onChange={handleInputChange} className="form-select">
                        <option value="">-- 부서 선택 --</option>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                        <option value="external">외부기관 (직접 입력)</option>
                      </select>
                      {formData.department === "external" && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <label htmlFor="a11y-schedule-manager-22" style={{ display: "block", fontSize: "0.72rem", color: "var(--accent-color)", marginBottom: "0.25rem", fontWeight: "700" }}>
                            🏢 외부 주관 기관명 직접 입력
                          </label>
                          <input id="a11y-schedule-manager-22"
                            type="text"
                            name="externalDept"
                            value={formData.externalDept || ""}
                            onChange={handleInputChange}
                            required
                            placeholder="예: 교육부, 울산시청 등 주관기관 입력"
                            className="form-input"
                            style={{ border: "1px solid var(--accent-color)" }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-23" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input id="a11y-schedule-manager-23" type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 체육관 특설 돔" className="form-input" />
                    </div>
                  </div>

                  {/* 일자 및 시작/종료시간 개별 입력 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-schedule-manager-24" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 일자</label>
                      <input id="a11y-schedule-manager-24" type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-25" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input id="a11y-schedule-manager-25" type="time" name="eventStartTime" value={formData.eventStartTime} onChange={handleInputChange} required className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-26" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input id="a11y-schedule-manager-26" type="time" name="eventEndTime" value={formData.eventEndTime} onChange={handleInputChange} required className="form-input" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-schedule-manager-27" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input id="a11y-schedule-manager-27" type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 내부 교수 및 연구원 15명" className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-28" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input id="a11y-schedule-manager-28" type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 지자체 관계자 5명" className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="a11y-schedule-manager-29" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input id="a11y-schedule-manager-29" type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 지역 정착 지원 프로그램" className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="a11y-schedule-manager-30" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 목적</label>
                    <textarea id="a11y-schedule-manager-30" name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="행사를 통해 도달하고자 하는 목표 기술" className="form-textarea" style={{ height: "46px", resize: "none" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <label htmlFor="a11y-schedule-manager-31" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>행사 결과</label>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", opacity: 0.75 }}>
                          (💡 행사 종료 후 결과 등록 시 작성 가능)
                        </span>
                      </div>
                      {aiResultApplied && (
                        <span style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#10b981", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✨ AI 행사 결과 반영됨 ✓
                        </span>
                      )}
                    </div>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="행사 종료 후 수료 인원, 산출된 최종 성과 및 보도 실적 등을 기록합니다 (기획 단계에서는 공란 가능)" className="form-textarea" style={{ height: "46px", resize: "none" }} />
                  </div>
                </>
  );
}
