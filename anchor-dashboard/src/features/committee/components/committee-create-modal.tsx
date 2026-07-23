import type React from "react";
import type { FormEvent } from "react";

interface CommitteeForm {
  name: string;
  total_quorum: number;
  voting_rule: string;
}

interface CommitteeCreateModalProps {
  committeeForm: CommitteeForm;
  handleCreateCommittee: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  setCommitteeForm: React.Dispatch<React.SetStateAction<CommitteeForm>>;
  setIsCommitteeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CommitteeCreateModal({
  committeeForm,
  handleCreateCommittee,
  setCommitteeForm,
  setIsCommitteeModalOpen
}: CommitteeCreateModalProps) {
  return (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>신규 위원회 개설</h3>
            <form onSubmit={handleCreateCommittee} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label htmlFor="a11y-committee-manager-20" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>위원회 명칭</label>
                <input id="a11y-committee-manager-1"
                  type="text"
                  required
                  placeholder="예: 앵커총괄위원회, 자체평가위원회"
                  value={committeeForm.name}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, name: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                />
              </div>
              <div>
                <label htmlFor="a11y-committee-manager-2" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>재적 위원 수 (의사정족수 기준)</label>
                <input id="a11y-committee-manager-2"
                  type="number"
                  min={1}
                  required
                  value={committeeForm.total_quorum}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, total_quorum: parseInt(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                />
              </div>
              <div>
                <label htmlFor="a11y-committee-manager-3" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결정족수 기준</label>
                <select id="a11y-committee-manager-3"
                  value={committeeForm.voting_rule}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, voting_rule: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                >
                  <option value="majority_of_attendees">출석 위원 과반수 찬성</option>
                  <option value="majority_of_total">재적 위원 과반수 찬성</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCommitteeModalOpen(false)} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>개설하기</button>
              </div>
            </form>
          </div>
        </div>
  );
}
