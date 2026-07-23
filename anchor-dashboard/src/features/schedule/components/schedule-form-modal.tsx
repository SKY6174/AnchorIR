import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";
import type {
  AgendaResultPair,
  AiDebateLog,
  ScheduleCommitteeMember,
  ScheduleFormData
} from "../schedule-types";
import { ScheduleBasicFormFields } from "./schedule-basic-form-fields";
import { SchedulePressFormFields } from "./schedule-press-form-fields";
import { ScheduleMonthlyFormFields } from "./schedule-monthly-form-fields";
import { ScheduleEventFormFields } from "./schedule-event-form-fields";
import { ScheduleMeetingFormFields } from "./schedule-meeting-form-fields";

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
                <ScheduleMeetingFormFields
                  agendaResultPairs={agendaResultPairs}
                  aiDebateLogs={aiDebateLogs}
                  aiFileName={aiFileName}
                  aiPlanApplied={aiPlanApplied}
                  aiProgress={aiProgress}
                  aiRawText={aiRawText}
                  aiResultApplied={aiResultApplied}
                  aiResultFileName={aiResultFileName}
                  aiResultRawText={aiResultRawText}
                  aiStatusText={aiStatusText}
                  committees={committees}
                  darkMode={darkMode}
                  formData={formData}
                  handleAiFileChange={handleAiFileChange}
                  handleGenerateAIKeywords={handleGenerateAIKeywords}
                  handleInputChange={handleInputChange}
                  handleLoadSampleFile={handleLoadSampleFile}
                  handleMinutesFileUpload={handleMinutesFileUpload}
                  handleToggleAttendee={handleToggleAttendee}
                  includeProfessors={includeProfessors}
                  isAiLoading={isAiLoading}
                  isAnalyzingAI={isAnalyzingAI}
                  isDebating={isDebating}
                  isUploadingFile={isUploadingFile}
                  members={members}
                  setAgendaResultPairs={setAgendaResultPairs}
                  setAiDebateLogs={setAiDebateLogs}
                  setAiRawText={setAiRawText}
                  setAiResultRawText={setAiResultRawText}
                  setFormData={setFormData}
                  setIncludeProfessors={setIncludeProfessors}
                  triggerAiAutoFill={triggerAiAutoFill}
                />
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
