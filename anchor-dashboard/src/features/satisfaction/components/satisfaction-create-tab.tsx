import type {
  Dispatch,
  FormEventHandler,
  SetStateAction,
} from "react";
import { Plus, Send, Trash2 } from "lucide-react";

interface SatisfactionCreateTabProps {
  handleCreateSurvey: FormEventHandler<HTMLFormElement>;
  newDept: string;
  setNewDept: Dispatch<SetStateAction<string>>;
  newStartDate: string;
  setNewStartDate: Dispatch<SetStateAction<string>>;
  getNextSurveyId: (
    departments: string | string[],
    customYear?: string | null,
  ) => string;
  newTitle: string;
  setNewTitle: Dispatch<SetStateAction<string>>;
  newPurpose: string;
  setNewPurpose: Dispatch<SetStateAction<string>>;
  newEndDate: string;
  setNewEndDate: Dispatch<SetStateAction<string>>;
  newTarget: string;
  setNewTarget: Dispatch<SetStateAction<string>>;
  newQuestions: string[];
  setNewQuestions: Dispatch<SetStateAction<string[]>>;
  handleRemoveQuestion: (index: number) => void;
  customQuestionInput: string;
  setCustomQuestionInput: Dispatch<SetStateAction<string>>;
  handleAddQuestion: () => void;
  setActiveSurveyTab: Dispatch<SetStateAction<string>>;
}

export function SatisfactionCreateTab({
  handleCreateSurvey,
  newDept,
  setNewDept,
  newStartDate,
  setNewStartDate,
  getNextSurveyId,
  newTitle,
  setNewTitle,
  newPurpose,
  setNewPurpose,
  newEndDate,
  setNewEndDate,
  newTarget,
  setNewTarget,
  newQuestions,
  setNewQuestions,
  handleRemoveQuestion,
  customQuestionInput,
  setCustomQuestionInput,
  handleAddQuestion,
  setActiveSurveyTab,
}: SatisfactionCreateTabProps) {
  return (
    <form onSubmit={handleCreateSurvey} className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.6rem" }}>
        새로운 만족도 조사지 제작 폼
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label htmlFor="a11y-satisfaction-manager-16" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>수행 부서 선택</label>
          <select id="a11y-satisfaction-manager-1"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            className="user-selector"
            style={{ width: "100%" }}
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
          <label htmlFor="a11y-satisfaction-manager-2" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>추천 자동발급 ID</label>
          <input id="a11y-satisfaction-manager-2"
            type="text"
            value={getNextSurveyId(newDept, newStartDate ? newStartDate.split("-")[0] : null)}
            disabled
            className="user-selector"
            style={{ width: "100%", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)" }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="a11y-satisfaction-manager-3" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 제목</label>
        <input id="a11y-satisfaction-manager-3"
          type="text"
          placeholder="예) 2026년도 AID-X 역량강화 세미나 만족도 조사"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="user-selector"
          style={{ width: "100%" }}
          required
        />
      </div>

      <div>
        <label htmlFor="a11y-satisfaction-manager-4" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 목적</label>
        <textarea id="a11y-satisfaction-manager-4"
          placeholder="조사의 구체적인 배경 및 환류 계획을 적어주세요."
          value={newPurpose}
          onChange={(e) => setNewPurpose(e.target.value)}
          className="user-selector"
          style={{ width: "100%", height: "70px", resize: "none" }}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label htmlFor="a11y-satisfaction-manager-5" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 일정 (시작 ~ 종료)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input id="a11y-satisfaction-manager-16"
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="user-selector"
              style={{ width: "100%" }}
            />
            <span>~</span>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="user-selector"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="a11y-satisfaction-manager-17" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 대상</label>
          <input id="a11y-satisfaction-manager-5"
            type="text"
            placeholder="예) 인공지능 재직자 교육 참여자 전체"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="user-selector"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="a11y-satisfaction-manager-6" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem", fontWeight: "700" }}>
          만족도조사 문항 빌더 (리커트 5점 척도형)
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.8rem" }}>
          {newQuestions.map((q, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "800", minWidth: "45px" }}>문항 {idx + 1}</span>
              <input id="a11y-satisfaction-manager-17"
                type="text"
                value={q}
                onChange={(e) => {
                  const updated = [...newQuestions];
                  updated[idx] = e.target.value;
                  setNewQuestions(updated);
                }}
                className="user-selector"
                style={{ flex: 1, fontSize: "0.78rem" }}
              />
              <button
                type="button"
                onClick={() => handleRemoveQuestion(idx)}
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "0.3rem", padding: "0.4rem", cursor: "pointer" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="추가하고 싶은 커스텀 만족도 문항을 적어주세요."
            value={customQuestionInput}
            onChange={(e) => setCustomQuestionInput(e.target.value)}
            className="user-selector"
            style={{ flex: 1, fontSize: "0.78rem" }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddQuestion(); } }}
          />
          <button
            type="button"
            onClick={handleAddQuestion}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.5rem 1rem", fontSize: "0.78rem", cursor: "pointer", borderRadius: "0.3rem", border: "1px solid var(--border-color)" }}
          >
            <Plus size={14} /> 문항 추가
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={() => setActiveSurveyTab("list")}
          className="btn-secondary"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.18)",
            background: "rgba(255, 255, 255, 0.04)",
            color: "rgba(255, 255, 255, 0.85)",
            padding: "0.6rem 1.5rem",
            borderRadius: "0.4rem",
            cursor: "pointer",
            fontWeight: "700",
            transition: "all 0.2s"
          }}
        >
          취소
        </button>
        <button
          type="submit"
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.3rem", borderRadius: "0.4rem", padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}
        >
          <Send size={14} /> 설문지 생성 및 저장
        </button>
      </div>
    </form>
  );
}
