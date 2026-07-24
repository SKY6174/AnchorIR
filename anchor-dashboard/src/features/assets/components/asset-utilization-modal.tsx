import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Trash2, TrendingUp } from "lucide-react";
import type {
  LegacyAssetRecord,
  UtilizationFormData
} from "../asset-types";

interface AssetUtilizationModalProps {
  handleDeleteUtilization: (recordId: number) => void;
  handleSaveUtilization: FormEventHandler<HTMLFormElement>;
  selectedUtilEquip: LegacyAssetRecord;
  setIsUtilModalOpen: Dispatch<SetStateAction<boolean>>;
  setUtilFormData: Dispatch<SetStateAction<UtilizationFormData>>;
  utilFormData: UtilizationFormData;
  utilRecords: LegacyAssetRecord[];
}

export const AssetUtilizationModal = ({
  handleDeleteUtilization,
  handleSaveUtilization,
  selectedUtilEquip,
  setIsUtilModalOpen,
  setUtilFormData,
  utilFormData,
  utilRecords
}: AssetUtilizationModalProps) => (
  <div style={{
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.6)",
    zIndex: 999,
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
      maxWidth: "550px",
      maxHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      color: "var(--text-primary)",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
      margin: "auto",
      overflow: "hidden"
    }}>
      {/* 헤더 */}
      <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
        <div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#34D399", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <TrendingUp size={16} /> 학기별 활용 실적 관리
          </h3>
          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
            {selectedUtilEquip.item_name} ({selectedUtilEquip.asset_number})
          </p>
        </div>
        <button
          onClick={() => setIsUtilModalOpen(false)}
          style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer" }}
        >
          &times;
        </button>
      </div>

      {/* 몸체 */}
      <div style={{ padding: "1rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 기자재 정보 바 */}
        <div style={{ display: "flex", gap: "1rem", padding: "0.6rem 0.8rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.7rem" }}>
          <div><span style={{ color: "var(--text-secondary)" }}>바코드:</span> <span style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{selectedUtilEquip.barcode_id}</span></div>
          <div><span style={{ color: "var(--text-secondary)" }}>재고위치:</span> <span style={{ color: "var(--text-primary)" }}>{selectedUtilEquip.stock_location || "-"}</span></div>
        </div>

        {/* 실적 리스트 */}
        <div>
          <h4 style={{ fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>📋 등록된 실적 리스트</h4>
          <div style={{ background: "rgba(0,0,0,0.15)", border: "1px solid var(--border-color)", borderRadius: "6px", maxHeight: "250px", overflowY: "auto" }}>
            {utilRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                등록된 학기별 활용 실적이 없습니다. 아래 폼에서 추가해 주세요.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ padding: "0.5rem", width: "130px" }}>학기</th>
                    <th style={{ padding: "0.5rem" }}>실적 세부내역</th>
                    <th style={{ padding: "0.5rem", width: "50px", textAlign: "center" }}>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {utilRecords.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "0.5rem", fontWeight: "700", color: "#60A5FA" }}>{rec.semester}</td>
                      <td style={{ padding: "0.5rem", color: "var(--text-primary)", whiteSpace: "pre-line" }}>{rec.usage_details}</td>
                      <td style={{ padding: "0.5rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleDeleteUtilization(rec.id)}
                          style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}
                          title="실적 삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 실적 등록 폼 */}
        <form onSubmit={handleSaveUtilization} style={{ padding: "0.8rem", border: "1px solid rgba(16, 185, 129, 0.2)", background: "rgba(16, 185, 129, 0.02)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <h4 style={{ fontSize: "0.75rem", fontWeight: "700", color: "#34D399", margin: 0 }}>➕ 신규 실적 추가</h4>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ width: "160px" }}>
              <label htmlFor="a11y-asset-manager-21" style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>학기 선택</label>
              <select id="a11y-asset-manager-21"
                value={utilFormData.semester}
                onChange={(e) => setUtilFormData(prev => ({ ...prev, semester: e.target.value }))}
                style={{ width: "100%", padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.7rem" }}
              >
                <option value="2024학년도 1학기">2024학년도 1학기</option>
                <option value="2024학년도 2학기">2024학년도 2학기</option>
                <option value="2025학년도 1학기">2025학년도 1학기</option>
                <option value="2025학년도 2학기">2025학년도 2학기</option>
                <option value="2026학년도 1학기">2026학년도 1학기</option>
                <option value="2026학년도 2학기">2026학년도 2학기</option>
                <option value="2027학년도 1학기">2027학년도 1학기</option>
                <option value="2027학년도 2학기">2027학년도 2학기</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="a11y-asset-manager-22" style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>실적 세부사항</label>
              <input id="a11y-asset-manager-22"
                type="text"
                placeholder="예: 정규교과 AI 기초실습 45명 이수 및 기자재 100% 활용"
                value={utilFormData.usage_details}
                onChange={(e) => setUtilFormData(prev => ({ ...prev, usage_details: e.target.value }))}
                required
                style={{ width: "100%", padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.7rem" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.2rem" }}>
            <button
              type="submit"
              style={{ padding: "0.4rem 1rem", background: "#10B981", border: "none", color: "white", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer" }}
            >
              추가하기
            </button>
          </div>
        </form>
      </div>

      {/* 푸터 */}
      <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setIsUtilModalOpen(false)}
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
        >
          닫기
        </button>
      </div>
    </div>
  </div>
);
