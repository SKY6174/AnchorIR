import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { FileSpreadsheet, RefreshCw, Sparkles } from "lucide-react";
import type { DebateLog } from "../satisfaction-types";

interface ExtractedSurveyData {
  title: string;
  target: string;
  startDate: string;
  endDate: string;
  purpose: string;
  department: string;
  questions: string[];
  responsesCount: number;
  averageScore: number;
  comments: string[];
}

interface SatisfactionAiInputModalProps {
  setShowAiInputModal: Dispatch<SetStateAction<boolean>>;
  setUploadedFile: Dispatch<SetStateAction<File | null>>;
  setDebateLogs: Dispatch<SetStateAction<DebateLog[]>>;
  setAiAnalysisStep: Dispatch<SetStateAction<number>>;
  aiAnalysisStep: number;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: File | null;
  setAiInputRawText: Dispatch<SetStateAction<string>>;
  runDebateSimulation: () => void;
  debatePhase: string;
  debateLogs: DebateLog[];
  extractedData: ExtractedSurveyData;
  setExtractedData: Dispatch<SetStateAction<ExtractedSurveyData>>;
  getNextSurveyId: (departments: string | string[], customYear?: string | null) => string;
  customQuestionInputExt: string;
  setCustomQuestionInputExt: Dispatch<SetStateAction<string>>;
  handleSaveExtractedSurvey: () => void;
  isGeneratingAiInput: boolean;
}

export function SatisfactionAiInputModal({
  setShowAiInputModal,
  setUploadedFile,
  setDebateLogs,
  setAiAnalysisStep,
  aiAnalysisStep,
  handleFileChange,
  uploadedFile,
  setAiInputRawText,
  runDebateSimulation,
  debatePhase,
  debateLogs,
  extractedData,
  setExtractedData,
  getNextSurveyId,
  customQuestionInputExt,
  setCustomQuestionInputExt,
  handleSaveExtractedSurvey,
  isGeneratingAiInput,
}: SatisfactionAiInputModalProps) {
  return (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "1.5rem"
        }}>
          <div style={{
            background: "var(--modal-bg, #1a191d)",
            border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
            color: "var(--text-primary, #ffffff)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "85vh",
            boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(20px)",
            animation: "scaleIn 0.25s ease"
          }}>
            {/* 모달 상단 헤더 바 */}
            <div style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(0,0,0,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white" }}>
                <Sparkles size={18} />
                <h3 style={{ fontSize: "0.95rem", fontWeight: "800", margin: 0 }}>외부 만족도조사 결과 파일 AI 분석 연동</h3>
              </div>
              <button
                onClick={() => {
                  setShowAiInputModal(false);
                  setUploadedFile(null);
                  setDebateLogs([]);
                  setAiAnalysisStep(1);
                }}
                style={{ background: "transparent", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer", fontWeight: "700" }}
              >
                ✕
              </button>
            </div>

            {/* 모달 바디 (단계별 분기 렌더링) */}
            <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.2rem" }}>

              {/* 1단계: 파일 업로드 대기 */}
              {aiAnalysisStep === 1 && (
                <>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>
                    구글 폼, 네이버 폼, 엑셀 또는 한글/PDF 형식의 만족도 조사 통계 보고서 파일을 업로드해 주세요.<br/>
                    AI(GPT-4o & Gemini) 협동 의사결정 모델이 파일 데이터를 읽고 상호 검증(Debate)을 거쳐 최종 결과를 추출합니다.
                  </p>

                  <div
                    onClick={() => document.getElementById("satisfaction-file-input")?.click()}
                    style={{
                      border: "2px dashed var(--border-color)",
                      borderRadius: "0.5rem",
                      padding: "2.5rem 1.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "var(--input-bg, rgba(255,255,255,0.01))",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.6rem"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-color)"}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent-color)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <input
                      id="satisfaction-file-input"
                      type="file"
                      accept=".xlsx, .xls, .hwp, .pdf"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <FileSpreadsheet size={36} style={{ color: "var(--accent-color)" }} />
                    <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      클릭하여 파일 선택 (xlsx, hwp, pdf)
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                      드래그 앤 드롭으로도 파일을 불러올 수 있습니다.
                    </div>
                  </div>

                  {uploadedFile && (
                    <div style={{
                      padding: "0.6rem 0.8rem",
                      background: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "0.35rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.75rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "#10b981", fontWeight: "900" }}>✓</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{uploadedFile.name}</span>
                        <span style={{ color: "var(--text-secondary)" }}>({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setAiInputRawText("");
                        }}
                        style={{ background: "transparent", border: "none", color: "var(--accent-color)", cursor: "pointer", fontWeight: "800", fontSize: "0.75rem" }}
                      >
                        삭제
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button
                      onClick={() => {
                        setShowAiInputModal(false);
                        setUploadedFile(null);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        padding: "0.45rem 1rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        cursor: "pointer"
                      }}
                    >
                      취소
                    </button>
                    <button
                      onClick={runDebateSimulation}
                      disabled={!uploadedFile}
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        border: "none",
                        color: "white",
                        padding: "0.45rem 1.2rem",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "0.25rem",
                        cursor: !uploadedFile ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <Sparkles size={14} />
                      AI 협동 토론 분석 시작
                    </button>
                  </div>
                </>
              )}

              {/* 2단계: GPT-4o vs Gemini 토론 룸 */}
              {aiAnalysisStep === 2 && (
                <>
                  {/* 디베이트 진행 상황 게이지바 */}
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.35rem", fontWeight: "800" }}>
                      <span style={{ color: "var(--accent-color)" }}>
                        {debatePhase === "extract" ? "1. 파일 데이터 추출 단계" :
                         debatePhase === "draft" ? "2. 모델별 데이터 추출 초안 작성" :
                         debatePhase === "debate" ? "3. 크로스 데이터 팩트체크 및 토론" :
                         "4. 최종 의사결정 합의 도달 (Consensus)"}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {debatePhase === "extract" ? "25%" :
                         debatePhase === "draft" ? "50%" :
                         debatePhase === "debate" ? "75%" : "100%"}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        width: debatePhase === "extract" ? "25%" :
                               debatePhase === "draft" ? "50%" :
                               debatePhase === "debate" ? "75%" : "100%",
                        height: "100%",
                        background: "linear-gradient(90deg, #10b981, var(--accent-color))",
                        borderRadius: "3px",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>

                  {/* 실시간 디베이트 대화방 */}
                  <div style={{
                    height: "300px",
                    overflowY: "auto",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    background: "rgba(0, 0, 0, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem"
                  }}>
                    {debateLogs.map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: log.sender === "system" ? "center" : (log.sender === "gpt" ? "flex-start" : "flex-end"),
                          width: "100%"
                        }}
                      >
                        {log.sender !== "system" && (
                          <span style={{
                            fontSize: "0.62rem",
                            fontWeight: "800",
                            color: log.sender === "gpt" ? "#10b981" : "#a855f7",
                            marginBottom: "0.15rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}>
                            {log.sender === "gpt" ? "🤖 GPT-4o-mini" : "✨ Gemini 1.5 Flash"}
                          </span>
                        )}
                        <div style={{
                          maxWidth: "85%",
                          padding: "0.55rem 0.75rem",
                          borderRadius: log.sender === "system" ? "0.25rem" : (log.sender === "gpt" ? "0rem 0.5rem 0.5rem 0.5rem" : "0.5rem 0rem 0.5rem 0.5rem"),
                          background: log.sender === "system" ? "transparent" : (log.sender === "gpt" ? "rgba(16, 185, 129, 0.12)" : "rgba(168, 85, 247, 0.12)"),
                          border: log.sender === "system" ? "none" : (log.sender === "gpt" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(168, 85, 247, 0.2)"),
                          color: log.sender === "system" ? "var(--text-secondary)" : "var(--text-primary)",
                          fontSize: log.sender === "system" ? "0.68rem" : "0.74rem",
                          fontStyle: log.sender === "system" ? "italic" : "normal",
                          lineHeight: "1.35",
                          textAlign: log.sender === "system" ? "center" : "left"
                        }}>
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                    <RefreshCw size={14} className="animate-spin" style={{ color: "var(--accent-color)" }} />
                    <span>두 거대 AI 모델이 파일 내용을 상호 대조하며 토론을 벌이고 있습니다...</span>
                  </div>
                </>
              )}

              {/* 3단계: AI 최종 합의 결과 검토 및 수정 폼 */}
              {aiAnalysisStep === 3 && (
                <>
                  <p style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: "800" }}>
                    ✓ GPT-4o와 Gemini 모델 간의 토론 결과 합의(Consensus)가 도출되었습니다. 최종 데이터를 리뷰하고 등록해 주세요.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.8rem" }}>
                    {/* 수행 부서 선택 / 추천 자동발급 ID (2컬럼) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                      <div>
                        <label htmlFor="a11y-satisfaction-manager-8" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                          수행 부서 선택
                        </label>
                        <select id="a11y-satisfaction-manager-8"
                          value={extractedData.department}
                          onChange={(e) => setExtractedData({ ...extractedData, department: e.target.value })}
                          style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                        >
                          <option value="ECC">ECC (지산학교육센터)</option>
                          <option value="ICC">ICC (기업협업센터)</option>
                          <option value="RCC">RCC (지역협업센터)</option>
                          <option value="AIDX">AIDX (AID-X지원센터)</option>
                          <option value="NURI">NURI (울산늘봄누리센터)</option>
                          <option value="SEVeN">SEVeN (신산업특화센터)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="a11y-satisfaction-manager-9" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                          추천 자동발급 ID
                        </label>
                        <input id="a11y-satisfaction-manager-9"
                          type="text"
                          readOnly
                          value={getNextSurveyId([extractedData.department], extractedData.startDate ? extractedData.startDate.split("-")[0] : null)}
                          style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", opacity: 0.6, color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem", cursor: "not-allowed" }}
                        />
                      </div>
                    </div>

                    {/* 조사 제목 */}
                    <div>
                      <label htmlFor="a11y-satisfaction-manager-10" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                        조사 제목
                      </label>
                      <input id="a11y-satisfaction-manager-10"
                        type="text"
                        value={extractedData.title}
                        onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                        placeholder="예) 2026년도 AID-X 역량강화 세미나 만족도 조사"
                        style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                      />
                    </div>

                    {/* 조사 목적 */}
                    <div>
                      <label htmlFor="a11y-satisfaction-manager-11" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                        조사 목적
                      </label>
                      <textarea id="a11y-satisfaction-manager-11"
                        value={extractedData.purpose}
                        onChange={(e) => setExtractedData({ ...extractedData, purpose: e.target.value })}
                        placeholder="조사의 구체적인 배경 및 환류 계획을 적어주세요."
                        style={{ width: "100%", height: "55px", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem", resize: "none" }}
                      />
                    </div>

                    {/* 조사 일정 / 조사 대상 (2컬럼) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.8rem" }}>
                      <div>
                        <label htmlFor="a11y-satisfaction-manager-12" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                          조사 일정 (시작 ~ 종료)
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <input id="a11y-satisfaction-manager-19"
                            type="date"
                            value={extractedData.startDate}
                            onChange={(e) => setExtractedData({ ...extractedData, startDate: e.target.value })}
                            style={{ flex: 1, padding: "0.4rem", fontSize: "0.72rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                          />
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>~</span>
                          <input
                            type="date"
                            value={extractedData.endDate}
                            onChange={(e) => setExtractedData({ ...extractedData, endDate: e.target.value })}
                            style={{ flex: 1, padding: "0.4rem", fontSize: "0.72rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="a11y-satisfaction-manager-20" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                          조사 대상
                        </label>
                        <input id="a11y-satisfaction-manager-12"
                          type="text"
                          value={extractedData.target}
                          onChange={(e) => setExtractedData({ ...extractedData, target: e.target.value })}
                          placeholder="예) 인공지능 재직자 교육 참여자 전체"
                          style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                        />
                      </div>
                    </div>

                    {/* 만족도조사 문항 빌더 (리커트 5점 척도형) */}
                    <div style={{ marginTop: "0.3rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.6rem" }}>
                      <label htmlFor="a11y-satisfaction-manager-13" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "800", marginBottom: "0.4rem" }}>
                        만족도조사 문항 빌더 (리커트 5점 척도형)
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {extractedData.questions.map((qText, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--accent-color)", width: "3.2rem", flexShrink: 0 }}>
                              문항 {idx + 1}
                            </span>
                            <input id="a11y-satisfaction-manager-20"
                              type="text"
                              value={qText}
                              onChange={(e) => {
                                const updated = [...extractedData.questions];
                                updated[idx] = e.target.value;
                                setExtractedData({ ...extractedData, questions: updated });
                              }}
                              style={{ flex: 1, padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                            />
                            <button
                              onClick={() => {
                                const updated = extractedData.questions.filter((_, i) => i !== idx);
                                setExtractedData({ ...extractedData, questions: updated });
                              }}
                              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "0.45rem 0.6rem", borderRadius: "0.3rem", cursor: "pointer", fontWeight: "800", fontSize: "0.7rem" }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 문항 추가 인터페이스 */}
                      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
                        <input
                          type="text"
                          placeholder="추가하고 싶은 커스텀 만족도 문항을 적어주세요."
                          value={customQuestionInputExt}
                          onChange={(e) => setCustomQuestionInputExt(e.target.value)}
                          style={{ flex: 1, padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                        />
                        <button
                          onClick={() => {
                            if (!customQuestionInputExt.trim()) return;
                            setExtractedData({
                              ...extractedData,
                              questions: [...extractedData.questions, customQuestionInputExt.trim()]
                            });
                            setCustomQuestionInputExt("");
                          }}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.45rem 1rem", fontSize: "0.72rem", borderRadius: "0.3rem", fontWeight: "700", cursor: "pointer" }}
                        >
                          + 문항 추가
                        </button>
                      </div>
                    </div>

                    {/* 응답 수 및 만족도 평균 (2컬럼) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.6rem" }}>
                      <div>
                        <label htmlFor="a11y-satisfaction-manager-13" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                          응답 수 (인원수)
                        </label>
                        <input id="a11y-satisfaction-manager-13"
                          type="number"
                          value={extractedData.responsesCount}
                          onChange={(e) => setExtractedData({ ...extractedData, responsesCount: parseInt(e.target.value, 10) || 10 })}
                          style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                        />
                      </div>
                      <div>
                        <label htmlFor="a11y-satisfaction-manager-14" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                          종합 만족도 평균 (100점 만점)
                        </label>
                        <input id="a11y-satisfaction-manager-14"
                          type="number"
                          step="0.1"
                          value={extractedData.averageScore}
                          onChange={(e) => setExtractedData({ ...extractedData, averageScore: parseFloat(e.target.value) || 90.0 })}
                          style={{ width: "100%", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                        />
                      </div>
                    </div>

                    {/* 주관식 의견 */}
                    <div>
                      <label htmlFor="a11y-satisfaction-manager-15" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: "700", marginBottom: "0.25rem" }}>
                        합의된 주요 주관식 의견 / 피드백 (줄바꿈으로 구분)
                      </label>
                      <textarea id="a11y-satisfaction-manager-15"
                        value={extractedData.comments.join("\n")}
                        onChange={(e) => setExtractedData({ ...extractedData, comments: e.target.value.split("\n").filter(Boolean) })}
                        placeholder="한 줄에 의견 하나씩 기입해 주세요"
                        style={{ width: "100%", height: "65px", padding: "0.45rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.3rem", resize: "none", lineHeight: "1.4" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <button
                      onClick={() => {
                        setAiAnalysisStep(1);
                        setUploadedFile(null);
                        setDebateLogs([]);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        padding: "0.45rem 1rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        cursor: "pointer"
                      }}
                    >
                      ← 파일 재업로드
                    </button>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          setShowAiInputModal(false);
                          setUploadedFile(null);
                          setDebateLogs([]);
                          setAiAnalysisStep(1);
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-secondary)",
                          padding: "0.45rem 1rem",
                          fontSize: "0.75rem",
                          borderRadius: "0.25rem",
                          cursor: "pointer"
                        }}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveExtractedSurvey}
                        disabled={isGeneratingAiInput}
                        style={{
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          border: "none",
                          color: "white",
                          padding: "0.45rem 1.2rem",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          borderRadius: "0.25rem",
                          cursor: isGeneratingAiInput ? "not-allowed" : "pointer"
                        }}
                      >
                        {isGeneratingAiInput ? "저장 처리 중..." : "만족도조사 최종 등록"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
  );
}
