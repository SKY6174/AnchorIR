import type { Dispatch, FormEvent, SetStateAction } from "react";
import { X } from "lucide-react";
import type {
  ScheduleCommitteeMember,
  ScheduleMemberFormData
} from "../schedule-types";

interface ScheduleMemberModalProps {
  editingMember: ScheduleCommitteeMember | null;
  handleSaveMember: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  memberFormData: ScheduleMemberFormData;
  setEditingMember: Dispatch<SetStateAction<ScheduleCommitteeMember | null>>;
  setIsMemberModalOpen: Dispatch<SetStateAction<boolean>>;
  setMemberFormData: Dispatch<SetStateAction<ScheduleMemberFormData>>;
}

export function ScheduleMemberModal({
  editingMember,
  handleSaveMember,
  memberFormData,
  setEditingMember,
  setIsMemberModalOpen,
  setMemberFormData
}: ScheduleMemberModalProps) {
  return (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 1100,
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1.2rem", flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {editingMember ? "✏️ 위원 정보 수정" : "➕ 새 위원 추가 등록"}
              </h3>
              <button
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMember(null);
                }}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 구분 선택/입력 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="a11y-schedule-manager-1" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>구분 (type)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    value={["위원장", "위원", "위원(자문겸직)", "간사"].includes(memberFormData.type) ? memberFormData.type : "custom"}
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        setMemberFormData(prev => ({ ...prev, type: e.target.value }));
                      } else {
                        setMemberFormData(prev => ({ ...prev, type: "" }));
                      }
                    }}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem", width: "40%" }}
                  >
                    <option value="위원">위원</option>
                    <option value="위원장">위원장</option>
                    <option value="위원(자문겸직)">위원(자문겸직)</option>
                    <option value="간사">간사</option>
                    <option value="custom">직접 입력...</option>
                  </select>
                  {!["위원장", "위원", "위원(자문겸직)", "간사"].includes(memberFormData.type) && (
                    <input
                      type="text"
                      required
                      placeholder="구분 직접 입력"
                      value={memberFormData.type}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, type: e.target.value }))}
                      style={{ flex: 1, padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    />
                  )}
                </div>
              </div>

              {/* 성명 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="a11y-schedule-manager-44" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>성명 (name) *</label>
                <input id="a11y-schedule-manager-1"
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                />
              </div>

              {/* 소속기관 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label htmlFor="a11y-schedule-manager-2" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>소속기관 (org)</label>
                <input id="a11y-schedule-manager-2"
                  type="text"
                  placeholder="예: 울산과학대학교, HD한국조선해양 등"
                  value={memberFormData.org}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, org: e.target.value }))}
                  style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* 부서/학과 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="a11y-schedule-manager-3" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>부서/학과 (dept)</label>
                  <input id="a11y-schedule-manager-3"
                    type="text"
                    placeholder="예: 기획처, 화학공학과 등"
                    value={memberFormData.dept}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, dept: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>

                {/* 직위 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="a11y-schedule-manager-4" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>직위 (rank)</label>
                  <input id="a11y-schedule-manager-4"
                    type="text"
                    placeholder="예: 교수, 처장, 대표 등"
                    value={memberFormData.rank}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, rank: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* 교내외 및 비고 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="a11y-schedule-manager-5" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>교내외 구분</label>
                  <select id="a11y-schedule-manager-5"
                    value={memberFormData.location}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, location: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  >
                    <option value="교내">교내</option>
                    <option value="교외">교외</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="a11y-schedule-manager-6" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>비고 (note)</label>
                  <input id="a11y-schedule-manager-6"
                    type="text"
                    placeholder="예: 신규 추가 등"
                    value={memberFormData.note}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, note: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* 💡 [임기 가드 개조] 단일 텍스트 창 대신 캘린더 2개(시작일/종료일)로 직관적 날짜 입력 받기 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="a11y-schedule-manager-7" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>임기 시작일</label>
                  <input id="a11y-schedule-manager-7"
                    type="date"
                    value={memberFormData.termStart || ""}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, termStart: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label htmlFor="a11y-schedule-manager-8" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>임기 종료일</label>
                  <input id="a11y-schedule-manager-8"
                    type="date"
                    value={memberFormData.termEnd || ""}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, termEnd: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "0.5rem", flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsMemberModalOpen(false);
                    setEditingMember(null);
                  }}
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
  );
}
