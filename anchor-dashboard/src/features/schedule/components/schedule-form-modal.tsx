import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";
import type {
  AgendaResultPair,
  AiDebateLog,
  ScheduleCommitteeMember,
  ScheduleFormData
} from "../schedule-types";
import { getFormattedMemberGrade, isWriterExcluded } from "../utils/schedule-member-utils";
import { ScheduleBasicFormFields } from "./schedule-basic-form-fields";
import { SchedulePressFormFields } from "./schedule-press-form-fields";
import { ScheduleMonthlyFormFields } from "./schedule-monthly-form-fields";
import { ScheduleEventFormFields } from "./schedule-event-form-fields";

interface ScheduleFormModalProps {
  agendaResultPairs: AgendaResultPair[];
  aiDebateLogs: AiDebateLog[];
  aiFileName: string;
  aiPlanApplied: boolean;
  aiProgress: number;
  aiRawText: string;
  aiResultApplied: boolean;
  aiResultFileName: string;
  aiResultRawText: string;
  aiStatusText: string;
  committees: any[];
  darkMode: boolean;
  formData: ScheduleFormData;
  handleAiFileChange: (event: ChangeEvent<HTMLInputElement>, mode: "plan" | "result") => void;
  handleAnalyzePressUrlWithGemini: () => void;
  handleCheckboxChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDeptCheckboxChange: (deptName: string) => void;
  handleFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleGenerateAIKeywords: () => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleLoadSampleFile: () => void;
  handleMinutesFileUpload: (event: ChangeEvent<HTMLInputElement>, type: "audio" | "pdf") => void;
  handleToggleAttendee: (name: string, role: string) => void;
  includeProfessors: boolean;
  isAiLoading: boolean;
  isAnalyzingAI: boolean;
  isAnalyzingUrl: boolean;
  isDebating: boolean;
  isEditMode: boolean;
  isUploadingFile: boolean;
  members: ScheduleCommitteeMember[];
  modalType: string;
  setAgendaResultPairs: React.Dispatch<React.SetStateAction<AgendaResultPair[]>>;
  setAiDebateLogs: React.Dispatch<React.SetStateAction<AiDebateLog[]>>;
  setAiRawText: React.Dispatch<React.SetStateAction<string>>;
  setAiResultRawText: React.Dispatch<React.SetStateAction<string>>;
  setEditingItemId: React.Dispatch<React.SetStateAction<number | string | null>>;
  setFormData: React.Dispatch<React.SetStateAction<ScheduleFormData>>;
  setIncludeProfessors: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  triggerAiAutoFill: (mode?: string) => void;
  triggerAiDebate: (mode?: string) => void;
}

export function ScheduleFormModal({
  agendaResultPairs,
  aiDebateLogs,
  aiFileName,
  aiPlanApplied,
  aiProgress,
  aiRawText,
  aiResultApplied,
  aiResultFileName,
  aiResultRawText,
  aiStatusText,
  committees,
  darkMode,
  formData,
  handleAiFileChange,
  handleAnalyzePressUrlWithGemini,
  handleCheckboxChange,
  handleDeptCheckboxChange,
  handleFormSubmit,
  handleGenerateAIKeywords,
  handleInputChange,
  handleLoadSampleFile,
  handleMinutesFileUpload,
  handleToggleAttendee,
  includeProfessors,
  isAiLoading,
  isAnalyzingAI,
  isAnalyzingUrl,
  isDebating,
  isEditMode,
  isUploadingFile,
  members,
  modalType,
  setAgendaResultPairs,
  setAiDebateLogs,
  setAiRawText,
  setAiResultRawText,
  setEditingItemId,
  setFormData,
  setIncludeProfessors,
  setIsAddModalOpen,
  setIsEditMode,
  triggerAiAutoFill,
  triggerAiDebate
}: ScheduleFormModalProps) {
  return (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 9999,
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
            maxWidth: "730px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {isEditMode
                  ? (modalType === "deadline" ? "✏️ 마감일 수정" : modalType === "task" ? "✏️ 할일 수정" : modalType === "event" ? "✏️ 행사 기획 및 결과 수정" : modalType === "meeting" ? "✏️ 회의결과 수정" : modalType === "press" ? "✏️ 언론보도 수정" : "✏️ 일반 일정 수정")
                  : (modalType === "monthly" ? "➕ 새 일반 일정 등록" : modalType === "task" ? "➕ 새 할일 등록" : modalType === "deadline" ? "🚨 새 마감일 등록" : modalType === "event" ? "➕ 새 행사 기획 및 결과 등록" : modalType === "meeting" ? "➕ 새 회의결과 등록" : modalType === "press" ? "➕ 새 언론보도 등록" : "➕ 새 회의 일정 회의결과 등록")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditMode(false);
                  setEditingItemId(null);
                }}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>

              {/* 마감일 입력 */}
              {modalType === "deadline" && (
                <ScheduleBasicFormFields
                  formData={formData}
                  handleCheckboxChange={handleCheckboxChange}
                  handleInputChange={handleInputChange}
                  modalType={modalType}
                />
              )}

              {/* 할일 입력 */}
              {modalType === "task" && (
                <ScheduleBasicFormFields
                  formData={formData}
                  handleCheckboxChange={handleCheckboxChange}
                  handleInputChange={handleInputChange}
                  modalType={modalType}
                />
              )}

              {/* 월간 일정 입력 */}
              {modalType === "monthly" && (
                <ScheduleMonthlyFormFields
                  aiPlanApplied={aiPlanApplied}
                  formData={formData}
                  handleDeptCheckboxChange={handleDeptCheckboxChange}
                  handleInputChange={handleInputChange}
                  handleToggleAttendee={handleToggleAttendee}
                  includeProfessors={includeProfessors}
                  members={members}
                  setIncludeProfessors={setIncludeProfessors}
                />
              )}

              {/* 행사 일정 입력 */}
              {modalType === "event" && (
                <ScheduleEventFormFields
                  aiDebateLogs={aiDebateLogs}
                  aiFileName={aiFileName}
                  aiProgress={aiProgress}
                  aiRawText={aiRawText}
                  aiResultApplied={aiResultApplied}
                  aiResultFileName={aiResultFileName}
                  aiResultRawText={aiResultRawText}
                  aiStatusText={aiStatusText}
                  formData={formData}
                  handleAiFileChange={handleAiFileChange}
                  handleInputChange={handleInputChange}
                  handleLoadSampleFile={handleLoadSampleFile}
                  isAiLoading={isAiLoading}
                  isDebating={isDebating}
                  setAiDebateLogs={setAiDebateLogs}
                  setAiRawText={setAiRawText}
                  setAiResultRawText={setAiResultRawText}
                  triggerAiAutoFill={triggerAiAutoFill}
                  triggerAiDebate={triggerAiDebate}
                />
              )}

              {modalType === "meeting" && (
                <>
                  {/* 회의 대분류 (최상단으로 위치 이동 완료) */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="a11y-schedule-manager-49" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 대분류</label>
                    <select id="a11y-schedule-manager-31" name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                      <option value="operating">사업운영위원회</option>
                      <option value="center">부서별 회의</option>
                      <option value="committee">각종 위원회</option>
                    </select>
                  </div>

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
                      💡 <strong>기획/일정안</strong>을 분석하면 회의 명칭, 장소, 일자, 시작/종료시간, 참석자 등 기본 정보가 자동 완성됩니다. (다중 파일 업로드 지원)<br />
                      💡 <strong>결과보고서(회의록)</strong>를 분석하면 하단의 안건별 결과 리스트(의제 및 결과)가 자동으로 채워집니다. (다중 파일 업로드 지원)
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {/* [1] 회의 기획서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>1️⃣ 회의 기획/일정 단계</span>
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
                          id="ai-meeting-plan-file"
                          accept=".txt,.pdf"
                          multiple
                          onChange={(e) => handleAiFileChange(e, "plan")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-meeting-plan-file"
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
                        <textarea id="a11y-schedule-manager-49"
                          value={aiRawText}
                          onChange={(e) => setAiRawText(e.target.value)}
                          placeholder="또는 회의 계획 본문을 직접 붙여넣으세요..."
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
                            disabled={isAiLoading}
                            style={{
                              flex: 1,
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
                            🤖 AI 분석 실행
                          </button>
                        </div>
                      </div>

                      {/* [2] 회의록/결과보고서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.3rem" }}>2️⃣ 회의 결과/회의록 단계</span>
                        <input
                          type="file"
                          id="ai-meeting-result-file"
                          accept=".txt,.pdf"
                          multiple
                          onChange={(e) => handleAiFileChange(e, "result")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-meeting-result-file"
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
                            background: darkMode ? "rgba(0,0,0,0.15)" : "#fafafa",
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
                            disabled={isAiLoading}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: darkMode ? "0 2px 4px rgba(16, 185, 129, 0.2)" : "0 2px 4px rgba(16, 185, 129, 0.1)"
                            }}
                          >
                            🤖 AI 분석 실행
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
                            🤖 AI 분석 로그 모니터링
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

                  {/* 회의 명칭 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <label htmlFor="a11y-schedule-manager-32" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>회의 명칭</label>
                      {aiPlanApplied && (
                        <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.15)", border: "1px solid rgba(167, 139, 250, 0.35)", color: "#a78bfa", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✨ AI 계획 정보 반영됨 ✓
                        </span>
                      )}
                    </div>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 제2차 ICC 센터 공동 운영 회의" className="form-input" />
                  </div>

                  {/* 장소 */}
                  <div>
                    <label htmlFor="a11y-schedule-manager-50" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input id="a11y-schedule-manager-32" type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: ICC 센터장실" className="form-input" />
                  </div>

                  {/* 1) 각종 위원회 세부 구분 버튼메뉴 (category === "committee" 일 때 노출) */}
                  {formData.category === "committee" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                      <label htmlFor="a11y-schedule-manager-33" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)" }}>위원회 구분</label>
                      <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                        {["agency", "center"].map((type) => {
                          const isSelected = (formData.committeeType || "agency") === type;
                          const label = type === "agency" ? "🏛️ 사업단 위원회" : "🏫 센터 위원회";
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  committeeType: type,
                                  dept: type === "agency" ? "앵커총괄위원회" : "ECC센터"
                                }));
                              }}
                              style={{
                                flex: 1,
                                padding: "0.55rem",
                                fontSize: "0.8rem",
                                fontWeight: "700",
                                borderRadius: "6px",
                                border: "1px solid " + (isSelected ? "var(--accent-color)" : "var(--border-color)"),
                                background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                                color: isSelected ? "#60A5FA" : "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                textAlign: "center"
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2) 부서명(또는 위원회명) 및 작성자 배치 (회의일시보다 위에 위치하도록 배치 순서 변경) */}
                  {formData.category !== "operating" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                          {formData.category === "committee" && (formData.committeeType || "agency") === "agency" ? "위원회명" : "부서(센터)명"}
                        </label>
                        <select id="a11y-schedule-manager-33" name="dept" value={formData.dept} onChange={handleInputChange} className="form-select">
                          {(() => {
                            if (formData.category === "committee") {
                              if ((formData.committeeType || "agency") === "agency") {
                                return [
                                  "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
                                  "앵커사업자체평가위원회", "앵커사업자문회의"
                                ].map(d => <option key={d} value={d}>{d}</option>);
                              } else {
                                return [
                                  "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"
                                ].map(d => <option key={d} value={d}>{d}</option>);
                              }
                            }
                            return ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ));
                          })()}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="a11y-schedule-manager-34" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>작성자</label>
                        <select id="a11y-schedule-manager-34" name="writer" value={formData.writer} onChange={handleInputChange} className="form-select">
                          {(() => {
                            const isCenterMeeting =
                              formData.category === "center" ||
                              (formData.category === "committee" && (formData.committeeType || "agency") === "center");

                            let activeWriters = [];
                            if (isCenterMeeting && formData.dept) {
                              activeWriters = (members || []).filter(m =>
                                m.status !== "미참여" &&
                                m.email &&
                                m.dept === formData.dept &&
                                !isWriterExcluded(m)
                              );
                              if (activeWriters.length === 0) {
                                activeWriters = (members || []).filter(m =>
                                  m.status !== "미참여" &&
                                  m.dept === formData.dept &&
                                  !isWriterExcluded(m)
                                );
                              }
                            } else {
                              activeWriters = (members || []).filter(m =>
                                m.status !== "미참여" &&
                                m.email &&
                                m.dept === "사업운영팀" && // 사업운영팀 구성원만 노출
                                !isWriterExcluded(m)
                              );

                              // 사업단 관련 회의인 경우 심현미 운영팀장을 맨 위에 강제 포함
                              const simHyunMi = (members || []).find(m => m.name === "심현미") || {
                                id: "sim_hm_temp",
                                name: "심현미",
                                grade: "운영팀장",
                                role: "운영팀장",
                                dept: "사업운영팀",
                                email: "sim@uc.ac.kr"
                              };
                              activeWriters = [simHyunMi, ...activeWriters.filter(m => m.name !== "심현미")];
                            }

                            if (activeWriters.length > 0) {
                              return activeWriters.map(m => {
                                const displayName = `${m.name} ${getFormattedMemberGrade(m)}`.trim();
                                return (
                                  <option key={m.id || m.email} value={displayName}>
                                    {displayName}
                                  </option>
                                );
                              });
                            }
                            return ["박지현 팀장", "김민수 단장", "이진우 PD", "최성훈 PD", "한아름 PD"].map(w => (
                              <option key={w} value={w}>{w}</option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 3) 회의 일자 및 시간 입력 필드 (맞바꿈에 의해 아래로 이동됨) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem", marginTop: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label htmlFor="a11y-schedule-manager-35" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>회의 일자</label>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                          <input id="a11y-schedule-manager-50"
                            type="checkbox"
                            name="noTime"
                            checked={formData.noTime || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                noTime: checked,
                                meetingStartTime: checked ? "" : (prev.meetingStartTime || "10:00"),
                                meetingEndTime: checked ? "" : (prev.meetingEndTime || "11:00")
                              }));
                            }}
                            style={{ cursor: "pointer", width: "13px", height: "13px" }}
                          />
                          전일 (시간 없음)
                        </label>
                      </div>
                      <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} required className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-51" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", opacity: formData.noTime ? 0.4 : 1 }}>시작 시간</label>
                      <input id="a11y-schedule-manager-35"
                        type="time"
                        name="meetingStartTime"
                        value={formData.meetingStartTime}
                        onChange={handleInputChange}
                        required={!formData.noTime}
                        disabled={formData.noTime}
                        className="form-input"
                        style={{
                          opacity: formData.noTime ? 0.4 : 1,
                          cursor: formData.noTime ? "not-allowed" : "text"
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-36" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", opacity: formData.noTime ? 0.4 : 1 }}>종료 시간</label>
                      <input id="a11y-schedule-manager-36"
                        type="time"
                        name="meetingEndTime"
                        value={formData.meetingEndTime}
                        onChange={handleInputChange}
                        required={!formData.noTime}
                        disabled={formData.noTime}
                        className="form-input"
                        style={{
                          opacity: formData.noTime ? 0.4 : 1,
                          cursor: formData.noTime ? "not-allowed" : "text"
                        }}
                      />
                    </div>
                  </div>

                  {/* 4) 참석 대상자 선택 및 수기 입력창 (모든 회의 종류에 맞추어 자동 대응) */}
                  {/* 장소(location)에 '서면'이라는 단어가 포함되는 경우(예: 서면회의, 서면 회의, 서면) 참석자 입력 영역을 노출하지 않습니다. */}
                  {!(formData.location && formData.location.includes("서면")) && (
                    <div style={{ marginTop: "0.75rem" }}>
                    {(() => {
                      let labelText = "👥 소속 연구원 선택 (부서별 자동 연동)";
                      let showIncludeProfessors = false;

                      if (formData.category === "operating") {
                        labelText = "👥 사업단 전 구성원 선택";
                        showIncludeProfessors = true;

                        // 1. 참여중인 전체 인원 로드 및 팀장교수 체크박스 필터링
                        const rawMembers = (members || []).filter(m => {
                          const status = m.status || "참여중";
                          if (status !== "참여중") return false;

                          const displayRole = getFormattedMemberGrade(m);
                          if (!includeProfessors && displayRole === "팀장교수") return false;

                          return true;
                        });

                        // 2. 단장/본부장 특별 그룹 먼저 추출
                        const leaderNames = ["송경영", "김현수"];
                        const leadersList = rawMembers.filter(m => leaderNames.includes(m.name)).map(m => ({
                          name: m.name,
                          role: getFormattedMemberGrade(m),
                          key: m.id || m.email
                        }));

                        // 3. 부서(센터)별 그룹화 매핑 (단장/본부장은 각 부서별 그룹 목록에서 제외)
                        const depts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
                        const grouped = depts.map(d => {
                          const list = rawMembers.filter(m => {
                            if (leaderNames.includes(m.name)) return false; // 리더그룹에 포함된 인원은 부서 리스트에서 중복 제외
                            if (d === "사업운영팀") {
                              const isOperatingOrAgency = m.dept === "사업단" || m.dept.includes("산학협력단") || m.dept === "앵커사업단" || m.dept === "앵커" ||
                                                           m.dept === "사업운영팀" || m.dept === "운영팀" || m.dept.includes("운영팀");
                              return isOperatingOrAgency;
                            }
                            return m.dept === d;
                          }).map(m => ({
                            name: m.name,
                            role: getFormattedMemberGrade(m),
                            key: m.id || m.email
                          }));
                          return { deptName: d, list };
                        }).filter(g => g.list.length > 0);

                        // 리더 목록이 존재하면 grouped 맨 처음에 "📌 단장 / 본부장" 그룹으로 삽입
                        if (leadersList.length > 0) {
                          grouped.unshift({
                            deptName: "단장 / 본부장",
                            list: leadersList
                          });
                        }

                        return (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                              <label htmlFor="a11y-schedule-manager-37" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                {labelText}
                              </label>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                                <input id="a11y-schedule-manager-51"
                                  type="checkbox"
                                  checked={includeProfessors}
                                  onChange={(e) => setIncludeProfessors(e.target.checked)}
                                  style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                                팀장교수 포함
                              </label>
                            </div>

                            {/* 부서별 그룹 카드 형태로 예쁘게 렌더링 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                              {grouped.map(g => (
                                <div key={g.deptName} style={{
                                  padding: "0.4rem 0.5rem",
                                  background: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.02)",
                                  border: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.08)",
                                  borderRadius: "6px"
                                }}>
                                  <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#a78bfa", marginBottom: "0.25rem" }}>
                                    📌 {g.deptName}
                                  </div>
                                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                                    {g.list.map(m => {
                                      const isSelected = (formData.attendees || "")
                                        .split(",")
                                        .map((x: string) => x.trim())
                                        .some((x: string) => x.includes(m.name));

                                      return (
                                        <button
                                          key={m.key}
                                          type="button"
                                          onClick={() => handleToggleAttendee(m.name, m.role)}
                                          style={{
                                            padding: "0.2rem 0.4rem",
                                            fontSize: "0.65rem",
                                            borderRadius: "4px",
                                            border: "1px solid " + (isSelected
                                              ? "var(--accent-color)"
                                              : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)")),
                                            background: isSelected
                                              ? (darkMode ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)")
                                              : "transparent",
                                            color: isSelected
                                              ? (darkMode ? "#60A5FA" : "#1E40AF")
                                              : (darkMode ? "var(--text-secondary)" : "#475569"),
                                            cursor: "pointer",
                                            transition: "all 0.1s ease",
                                            fontWeight: "700"
                                          }}
                                        >
                                          {m.name} {m.role} {isSelected ? "✓" : "+"}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      }

                      let displayMembers = [];
                      if (formData.category === "committee") {
                        labelText = "👥 위원회 위원 선택";
                        const currentDept = formData.dept || "";

                        const targetCommittee = committees.find(c => {
                          const nameMatch = c.name === currentDept || c.name.includes(currentDept);
                          const keyMatch = (currentDept.startsWith("ECC") && c.id === "ecc_op") ||
                                           (currentDept.startsWith("ICC") && c.id === "icc_op") ||
                                           (currentDept.startsWith("RCC") && c.id === "rcc_op") ||
                                           ((currentDept.includes("AID") || currentDept.includes("aidx")) && c.id === "aidx_op") ||
                                           ((currentDept.includes("늘봄") || currentDept.includes("neulbom")) && c.id === "neulbom_op") ||
                                           ((currentDept.includes("신산업") || currentDept.includes("newind")) && c.id === "newind_op");
                          return nameMatch || keyMatch;
                        });

                        const commMembers = targetCommittee ? (targetCommittee.members || []) : [];
                        displayMembers = commMembers.map((m: ScheduleCommitteeMember) => ({
                          name: m.name,
                          role: `${m.type}(${m.rank || m.org || ''})`,
                          key: m.id || m.name
                        }));
                      } else {
                        labelText = "👥 소속 연구원 선택 (부서별 자동 연동)";
                        showIncludeProfessors = true;

                        displayMembers = (members || []).filter(m => {
                          const isDeptMatch = m.dept === formData.dept;
                          if (!isDeptMatch) return false;

                          const start = m.startDate || m.start_date || m.hireDate || m.hire_date || "2025-03-01";
                          const end = m.endDate || m.end_date || "";
                          const status = m.status || "참여중";

                          const meetingDateStr = formData.meetingDate;
                          if (meetingDateStr) {
                            if (start && meetingDateStr < start) return false;
                            if (end && meetingDateStr > end) return false;
                          }

                          const displayRole = getFormattedMemberGrade(m);
                          if (!includeProfessors && displayRole === "팀장교수") return false;

                          return status === "참여중";
                        }).map(m => ({
                          name: m.name,
                          role: getFormattedMemberGrade(m),
                          key: m.id || m.email
                        }));
                      }

                      return (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <label htmlFor="a11y-schedule-manager-52" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              {labelText}
                            </label>
                            {showIncludeProfessors && (
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                                <input id="a11y-schedule-manager-52"
                                  type="checkbox"
                                  checked={includeProfessors}
                                  onChange={(e) => setIncludeProfessors(e.target.checked)}
                                  style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                                팀장교수 포함
                              </label>
                            )}
                          </div>

                          {displayMembers.length === 0 ? (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.5rem", padding: "0.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                              {formData.category === "committee" ? "선택한 위원회의 구성원을 찾을 수 없습니다." : "소속 부서를 먼저 선택해 주세요."}
                            </div>
                          ) : (
                            <div style={{
                              display: "flex",
                              gap: "0.35rem",
                              flexWrap: "wrap",
                              marginBottom: "0.5rem",
                              padding: "0.5rem",
                              background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                              borderRadius: "6px",
                              border: darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.08)"
                            }}>
                              {displayMembers.map((m: { name: string; role: string; key: number | string }) => {
                                const isSelected = (formData.attendees || "")
                                  .split(",")
                                  .map((x: string) => x.trim())
                                  .some((x: string) => x.includes(m.name));

                                return (
                                  <button
                                    key={m.key}
                                    type="button"
                                    onClick={() => handleToggleAttendee(m.name, m.role)}
                                    style={{
                                      padding: "0.25rem 0.5rem",
                                      fontSize: "0.7rem",
                                      borderRadius: "4px",
                                      border: "1px solid " + (isSelected
                                        ? "var(--accent-color)"
                                        : (darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)")),
                                      background: isSelected
                                        ? (darkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)")
                                        : "transparent",
                                      color: isSelected
                                        ? (darkMode ? "#60A5FA" : "#1E40AF")
                                        : (darkMode ? "var(--text-secondary)" : "#475569"),
                                      cursor: "pointer",
                                      transition: "all 0.1s ease",
                                      fontWeight: "700"
                                    }}
                                  >
                                    {m.name} {m.role} {isSelected ? "✓" : "+"}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <label htmlFor="a11y-schedule-manager-53" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                      참석자 (위의 버튼을 누르면 자동으로 입력되며, 타 부서 인원의 경우 수기입력 가능)
                    </label>
                    <input id="a11y-schedule-manager-37"
                      type="text"
                      name="attendees"
                      value={formData.attendees || ""}
                      onChange={handleInputChange}
                      placeholder="위 칩을 선택하거나 직접 입력 (예: 박지현 팀장, 이진우 PD (총 2명))"
                      style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}
                    />
                  </div>
                  )}

                  {/* 회의록 첨부파일 개별 분리 업로드 (2칸 설계) */}
                  <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {/* 1번째 칸: MP3 음성 파일 */}
                    <div>
                      <label htmlFor="a11y-schedule-manager-38" style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                        🎙️ 음성 녹음 파일 (MP3 전용, 최대 5MB)
                      </label>
                      {formData.audioUrl ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: "rgba(85, 182, 133, 0.08)",
                          padding: "0.45rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(85, 182, 133, 0.15)"
                        }}>
                          <span style={{ fontSize: "0.7rem", color: "#55b685", fontWeight: "700" }}>✓ 등록됨</span>
                          <a
                            href={formData.audioUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.7rem", color: "#60A5FA", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}
                          >
                            [듣기/다운로드 ➔]
                          </a>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, audioUrl: "" }))}
                            style={{
                              marginLeft: "auto",
                              background: "none",
                              border: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              fontSize: "0.68rem",
                              fontWeight: "700"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: "relative" }}>
                          <input
                            type="file"
                            accept=".mp3,audio/mp3,audio/mpeg"
                            onChange={(e) => handleMinutesFileUpload(e, "audio")}
                            disabled={isUploadingFile}
                            style={{ display: "none" }}
                            id="minutes-audio-file-input"
                          />
                          <label
                            htmlFor="minutes-audio-file-input"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              width: "100%",
                              padding: "0.5rem",
                              background: "rgba(59, 130, 246, 0.05)",
                              border: "1px dashed rgba(59, 130, 246, 0.4)",
                              borderRadius: "6px",
                              color: "var(--text-secondary)",
                              cursor: isUploadingFile ? "not-allowed" : "pointer",
                              fontSize: "0.7rem",
                              textAlign: "center"
                            }}
                          >
                            {isUploadingFile ? "⏳ 전송 중..." : "📁 MP3 파일 등록"}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* 2번째 칸: PDF 문서 파일 */}
                    <div>
                      <label htmlFor="a11y-schedule-manager-54" style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                        📄 회의록 첨부 문서 (PDF 전용, 최대 2MB)
                      </label>
                      {formData.pdfUrl ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: "rgba(85, 182, 133, 0.08)",
                          padding: "0.45rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(85, 182, 133, 0.15)"
                        }}>
                          <span style={{ fontSize: "0.7rem", color: "#55b685", fontWeight: "700" }}>✓ 등록됨</span>
                          <a
                            href={formData.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.7rem", color: "#60A5FA", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}
                          >
                            [문서 확인 ➔]
                          </a>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pdfUrl: "" }))}
                            style={{
                              marginLeft: "auto",
                              background: "none",
                              border: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              fontSize: "0.68rem",
                              fontWeight: "700"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: "relative" }}>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleMinutesFileUpload(e, "pdf")}
                            disabled={isUploadingFile}
                            style={{ display: "none" }}
                            id="minutes-pdf-file-input"
                          />
                          <label
                            htmlFor="minutes-pdf-file-input"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              width: "100%",
                              padding: "0.5rem",
                              background: "rgba(59, 130, 246, 0.05)",
                              border: "1px dashed rgba(59, 130, 246, 0.4)",
                              borderRadius: "6px",
                              color: "var(--text-secondary)",
                              cursor: isUploadingFile ? "not-allowed" : "pointer",
                              fontSize: "0.7rem",
                              textAlign: "center"
                            }}
                          >
                            {isUploadingFile ? "⏳ 전송 중..." : "📁 PDF 파일 등록"}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 주요 의제 및 회의 결과 1:1 대칭 대응 입력 목록 */}
                  {formData.category === "operating" ? (
                    <div style={{ marginTop: "1rem" }}>
                      <label htmlFor="a11y-schedule-manager-55" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: "700" }}>
                        🏢 부서별 주요 업무추진 현황 및 애로사항 입력
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                        {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map((deptName) => {
                          const deptAgendaVal = formData.operatingAgendas?.[deptName] || "";
                          const deptResultVal = formData.operatingResults?.[deptName] || "";

                          return (
                            <div
                              key={deptName}
                              style={{
                                background: "rgba(255, 255, 255, 0.01)",
                                padding: "0.6rem",
                                borderRadius: "6px",
                                border: "1px solid var(--border-color)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.4rem"
                              }}
                            >
                              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)" }}>
                                📌 {deptName}
                              </span>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                <input id="a11y-schedule-manager-55"
                                  type="text"
                                  value={deptAgendaVal}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      operatingAgendas: {
                                        ...(prev.operatingAgendas || {}),
                                        [deptName]: e.target.value
                                      }
                                    }));
                                  }}
                                  placeholder={`${deptName} 의제 / 전달사항`}
                                  style={{ padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.72rem" }}
                                />
                                <textarea
                                  value={deptResultVal}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      operatingResults: {
                                        ...(prev.operatingResults || {}),
                                        [deptName]: e.target.value
                                      }
                                    }));
                                  }}
                                  placeholder={`${deptName} 추진상황 / 결과`}
                                  rows={2}
                                  style={{ padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.72rem", resize: "vertical", fontFamily: "inherit" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <label htmlFor="a11y-schedule-manager-56" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700" }}>
                            📝 회의 의제 및 결과 관리 (AI 자동 추출 및 1:1 편집)
                          </label>
                          {aiResultApplied && (
                            <span style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#10b981", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                              ✨ AI 안건 결과 반영됨 ✓
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateAIKeywords}
                          disabled={isAnalyzingAI}
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            borderRadius: "6px",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#34D399",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          ✨ AI 의제/결과 자동 분석
                        </button>
                      </div>

                      {/* AI 분석 중 가시적 로딩 바 피드백 */}
                      {isAnalyzingAI && (
                        <div style={{
                          padding: "1rem",
                          background: "rgba(59, 130, 246, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.15)",
                          borderRadius: "6px",
                          marginBottom: "0.75rem",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem"
                        }}>
                          <div style={{
                            width: "24px",
                            height: "24px",
                            border: "2px solid #60A5FA",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite"
                          }} />
                          <span style={{ fontSize: "0.75rem", color: "#93C5FD", fontWeight: "700" }}>
                            AI가 회의 맥락을 분석하여 의제와 결과를 정밀 요약 정리하고 있습니다...
                          </span>
                          <style>{`
                            @keyframes spin {
                              to { transform: rotate(360deg); }
                            }
                          `}</style>
                        </div>
                      )}

                      {/* AI 팁 안내 박스 */}
                      <div style={{
                        padding: "0.5rem 0.75rem",
                        background: "rgba(255, 255, 255, 0.015)",
                        border: "1px solid rgba(255, 255, 255, 0.03)",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.6rem",
                        lineHeight: "1.4"
                      }}>
                        💡 <strong>AI 스마트 팁</strong>: 회의 음성 녹음본(MP3) 및 회의록 첨부 문서(PDF, 존재하는 경우)를 등록하면, <strong>두 자료를 AI가 정밀 분석·조합하여 회의 의제와 결과를 자동으로 생성</strong>합니다.
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {agendaResultPairs.map((pair, index) => (
                          <div
                            key={index}
                            style={{
                              display: "grid",
                              gridTemplateColumns: agendaResultPairs.length > 1 ? "1fr 2.2fr 40px" : "1fr 2.2fr",
                              gap: "0.5rem",
                              alignItems: "stretch",
                              background: "rgba(255, 255, 255, 0.01)",
                              padding: "0.5rem",
                              borderRadius: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.04)"
                            }}
                          >
                            <input id="a11y-schedule-manager-56"
                              type="text"
                              value={pair.agenda}
                              onChange={(e) => {
                                const newPairs = [...agendaResultPairs];
                                newPairs[index].agenda = e.target.value;
                                setAgendaResultPairs(newPairs);
                              }}
                              placeholder={`의제 ${index + 1} (예: 2차년도 예산 검토)`}
                              style={{ padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.75rem", height: "100%" }}
                            />
                            <textarea
                              value={pair.result}
                              onChange={(e) => {
                                const newPairs = [...agendaResultPairs];
                                newPairs[index].result = e.target.value;
                                setAgendaResultPairs(newPairs);
                              }}
                              placeholder={`결정 및 조치 사항 ${index + 1} (상세 결과 2줄 분량)`}
                              rows={2}
                              style={{ padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.75rem", resize: "vertical", fontFamily: "inherit", lineHeight: "1.3" }}
                            />
                            {agendaResultPairs.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPairs = agendaResultPairs.filter((_, idx) => idx !== index);
                                  setAgendaResultPairs(newPairs);
                                }}
                                style={{ padding: "0.45rem", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", color: "#F87171", cursor: "pointer", fontWeight: "700", fontSize: "0.75rem" }}
                              >
                                ✕
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAgendaResultPairs([...agendaResultPairs, { agenda: "", result: "" }])}
                          style={{
                            marginTop: "0.2rem",
                            padding: "0.35rem 0.8rem",
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            borderRadius: "6px",
                            color: "#60A5FA",
                            cursor: "pointer",
                            fontSize: "0.72rem",
                            display: "inline-flex",
                            alignSelf: "flex-start",
                            fontWeight: "700"
                          }}
                        >
                          + 의제/결과 행 추가
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 언론보도 일정 등록 */}
              {modalType === "press" && (
                <SchedulePressFormFields
                  formData={formData}
                  handleAnalyzePressUrlWithGemini={handleAnalyzePressUrlWithGemini}
                  handleInputChange={handleInputChange}
                  isAnalyzingUrl={isAnalyzingUrl}
                />
              )}

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setEditingItemId(null);
                  }}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  {isEditMode ? "수정 완료" : "새 등록 완료"}
                </button>
              </div>

            </form>
          </div>
        </div>
  );
}
