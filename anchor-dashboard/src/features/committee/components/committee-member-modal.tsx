import type React from "react";
import type { FormEvent } from "react";

interface CommitteeMemberForm {
  name: string;
  type: string;
  org: string;
  dept: string;
  rank: string;
  location: string;
  note: string;
  sort_order: number;
}

interface CommitteeMemberModalProps {
  handleAddMember: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  memberForm: CommitteeMemberForm;
  setIsMemberModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMemberForm: React.Dispatch<React.SetStateAction<CommitteeMemberForm>>;
}

export function CommitteeMemberModal({
  handleAddMember,
  memberForm,
  setIsMemberModalOpen,
  setMemberForm
}: CommitteeMemberModalProps) {
  return (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "450px", maxWidth: "90%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>위원회 위원 추가</h3>
            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-4" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>위원 성명</label>
                  <input id="a11y-committee-manager-4"
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-5" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>직책/역할</label>
                  <select id="a11y-committee-manager-5"
                    value={memberForm.type}
                    onChange={(e) => setMemberForm({ ...memberForm, type: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  >
                    <option value="위원">위원</option>
                    <option value="위원장">위원장</option>
                    <option value="간사">간사</option>
                    <option value="위원(자문겸직)">위원(자문겸직)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-6" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>소속 기관명</label>
                  <input id="a11y-committee-manager-6"
                    type="text"
                    placeholder="예: 울산과학대학교"
                    value={memberForm.org}
                    onChange={(e) => setMemberForm({ ...memberForm, org: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-7" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>부서/학과명</label>
                  <input id="a11y-committee-manager-7"
                    type="text"
                    placeholder="예: 기획처 / 화학공학과"
                    value={memberForm.dept}
                    onChange={(e) => setMemberForm({ ...memberForm, dept: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-8" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>직위/직급</label>
                  <input id="a11y-committee-manager-8"
                    type="text"
                    placeholder="예: 처장 / 교수"
                    value={memberForm.rank}
                    onChange={(e) => setMemberForm({ ...memberForm, rank: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-9" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>구분</label>
                  <select id="a11y-committee-manager-9"
                    value={memberForm.location}
                    onChange={(e) => setMemberForm({ ...memberForm, location: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  >
                    <option value="교내">교내 위원</option>
                    <option value="교외">교외 위원</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 2 }}>
                  <label htmlFor="a11y-committee-manager-10" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>비고</label>
                  <input id="a11y-committee-manager-10"
                    type="text"
                    placeholder="예: 신규 위촉"
                    value={memberForm.note}
                    onChange={(e) => setMemberForm({ ...memberForm, note: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-11" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>정렬 순서</label>
                  <input id="a11y-committee-manager-11"
                    type="number"
                    value={memberForm.sort_order}
                    onChange={(e) => setMemberForm({ ...memberForm, sort_order: Number(e.target.value) })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>추가하기</button>
              </div>
            </form>
          </div>
        </div>
  );
}
