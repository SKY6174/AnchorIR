import type { ChangeEvent } from "react";
import type { ScheduleFormData } from "../schedule-types";

interface SchedulePressFormFieldsProps {
  formData: ScheduleFormData;
  handleAnalyzePressUrlWithGemini: () => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isAnalyzingUrl: boolean;
}

export function SchedulePressFormFields({
  formData,
  handleAnalyzePressUrlWithGemini,
  handleInputChange,
  isAnalyzingUrl
}: SchedulePressFormFieldsProps) {
  return (
    <>
      {/* ✨ AI 자동 입력 안내 배너 */}
      <div style={{
        background: "rgba(139, 92, 246, 0.08)",
        border: "1px dashed rgba(139, 92, 246, 0.25)",
        borderRadius: "8px",
        padding: "0.75rem 1rem",
        marginBottom: "1.25rem",
        fontSize: "0.78rem",
        color: "var(--text-primary)",
        lineHeight: "1.4",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.5rem"
      }}>
        <span style={{ fontSize: "1rem" }}>💡</span>
        <span>
          <strong style={{ color: "#a78bfa" }}>간편 입력 팁</strong>: 맨 아래의 <strong style={{ textDecoration: "underline" }}>보도 내용 URL</strong>만 입력하신 뒤 우측의 <strong style={{ color: "#a78bfa" }}>[✨ AI 자동 입력]</strong> 버튼을 누르면, 방송 구분 / 매체 / 제목 / 일시 / 상세 내용까지 GPT & Gemini API 교차 검증을 거쳐 실시간으로 수집하여 일괄 입력해 줍니다.
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
        <div>
          <label htmlFor="a11y-schedule-manager-57" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 구분</label>
          <select id="a11y-schedule-manager-38" name="pressType" value={formData.pressType} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
            <option value="방송">📺 방송</option>
            <option value="신문">📰 신문</option>
            <option value="기타">🌐 기타 (뉴미디어 등)</option>
          </select>
        </div>
        <div>
          <label htmlFor="a11y-schedule-manager-39" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 매체</label>
          <input id="a11y-schedule-manager-39" type="text" name="pressMedia" value={formData.pressMedia} onChange={handleInputChange} required placeholder="예: 울산MBC, 경상일보, 블로그 등" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div>
        <label htmlFor="a11y-schedule-manager-40" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 제목</label>
        <input id="a11y-schedule-manager-40" type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 울산과학대학교, 지역 창업 연계 RISE 앵커사업 활성화 시동" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label htmlFor="a11y-schedule-manager-41" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 일자</label>
          <input id="a11y-schedule-manager-41" type="date" name="pressDate" value={formData.pressDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label htmlFor="a11y-schedule-manager-42" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도/방송 시간</label>
          <input id="a11y-schedule-manager-42" type="time" name="pressTime" value={formData.pressTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div>
        <label htmlFor="a11y-schedule-manager-43" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도내용 (기사 상세 본문)</label>
        <textarea id="a11y-schedule-manager-43" name="pressContent" value={formData.pressContent || ""} onChange={handleInputChange} placeholder="기사 본문 또는 세부 보도 내용을 기술해 주세요." style={{ width: "100%", height: "100px", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
      </div>

      <div>
        <label htmlFor="a11y-schedule-manager-57" style={{ display: "block", fontSize: "0.85rem", color: "#8b5cf6", fontWeight: "700", marginBottom: "0.35rem" }}>✨ 보도 내용 URL (유튜브 링크 또는 기사 링크)</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input id="a11y-schedule-manager-57"
            type="url"
            name="pressUrl"
            value={formData.pressUrl || ""}
            onChange={handleInputChange}
            required
            placeholder="예: https://www.youtube.com/watch?v=... 또는 기사 원문 링크"
            style={{ flex: 1, padding: "0.6rem 0.75rem", background: "rgba(139, 92, 246, 0.08)", border: "2px solid #8b5cf6", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.9rem", boxShadow: "0 0 10px rgba(139, 92, 246, 0.15)" }}
          />
          <button
            type="button"
            onClick={handleAnalyzePressUrlWithGemini}
            disabled={isAnalyzingUrl || !formData.pressUrl}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: isAnalyzingUrl
                ? "rgba(139, 92, 246, 0.3)"
                : (formData.pressUrl ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" : "rgba(255,255,255,0.05)"),
              border: "none",
              color: formData.pressUrl ? "white" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "0.75rem",
              cursor: formData.pressUrl && !isAnalyzingUrl ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "all 0.2s"
            }}
          >
            {isAnalyzingUrl ? (
              <>
                <span style={{ width: "12px", height: "12px", border: "2px solid white", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite", marginRight: "0.2rem" }} />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <span>✨ AI 자동 입력</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
