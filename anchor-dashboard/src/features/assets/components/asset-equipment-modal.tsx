import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { X } from "lucide-react";
import type {
  EquipmentFormData,
  LegacyAssetRecord
} from "../asset-types";

interface AssetEquipmentModalProps {
  USAGE_TYPES: readonly string[];
  completedProcuredItems: LegacyAssetRecord[];
  editingEquipId: number | null;
  equipFormData: EquipmentFormData;
  handleSaveEquipment: FormEventHandler<HTMLFormElement>;
  loading: boolean;
  setEquipFormData: Dispatch<SetStateAction<EquipmentFormData>>;
  setIsEquipModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AssetEquipmentModal = ({
  USAGE_TYPES,
  completedProcuredItems,
  editingEquipId,
  equipFormData,
  handleSaveEquipment,
  loading,
  setEquipFormData,
  setIsEquipModalOpen
}: AssetEquipmentModalProps) => (
  <div style={{
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.6)",
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
      maxWidth: "450px",
      maxHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      color: "var(--text-primary)",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
      margin: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          📦 {editingEquipId ? "기자재 정보 수정" : "구매 완료 기자재 불러오기"}
        </h3>
        <button type="button" onClick={() => setIsEquipModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSaveEquipment} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
        {!editingEquipId && (
          <div>
            <label htmlFor="a11y-asset-manager-13" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>
              📥 구매 완료 기자재 선택 (불러오기)
            </label>
            <select id="a11y-asset-manager-13"
              onChange={(e) => {
                const selectedId = e.target.value;
                if (!selectedId) return;
                const targetItem = completedProcuredItems.find(item => item.id.toString() === selectedId);
                if (targetItem) {
                  setEquipFormData({
                    item_name: targetItem.item_name || "",
                    asset_number: targetItem.asset_number || `AIDX-EQ-${targetItem.id}`,
                    barcode_id: targetItem.barcode || "", // 조달에서 스캔 등록한 바코드 연동
                    stock_location: "",
                    category: (targetItem.item_name || "").includes("AI") || (targetItem.item_name || "").includes("DX") ? "ai_dx" : "other",
                    usage_type: "정규교과",
                    memo: targetItem.description || ""
                  });
                }
              }}
              className="form-select"
            >
              <option value="">-- 구매 완료 내역에서 선택 (불러오기) --</option>
              {completedProcuredItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.item_name} ({item.quantity}개, {item.unit_price ? (item.unit_price / 1000000).toFixed(1) : 0}백만원) - {item.dept_name || item.division_name || "소속 없음"}
                </option>
              ))}
            </select>
            <p style={{ margin: "0.2rem 0 0.5rem 0", fontSize: "0.65rem", color: "var(--text-secondary)" }}>
              * 기획/구매 단계에서 검수 완료 처리된 품목들만 조회됩니다.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="a11y-asset-manager-14" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>기자재 품명</label>
          <input id="a11y-asset-manager-14"
            type="text"
            placeholder="위 드롭다운에서 기자재를 선택하세요"
            value={equipFormData.item_name}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, item_name: e.target.value }))}
            required
            disabled={!editingEquipId}
            className="form-input"
            style={{ opacity: !editingEquipId ? 0.6 : 1 }}
          />
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-15" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>물품(기자재)번호</label>
          <input id="a11y-asset-manager-15"
            type="text"
            placeholder="기자재 선택 시 자동 입력됩니다"
            value={equipFormData.asset_number}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, asset_number: e.target.value }))}
            required
            disabled={!editingEquipId}
            className="form-input"
            style={{ opacity: !editingEquipId ? 0.6 : 1 }}
          />
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-16" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>바코드</label>
          <input id="a11y-asset-manager-16"
            type="text"
            placeholder="예: 8809123456789"
            value={equipFormData.barcode_id || ""}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, barcode_id: e.target.value }))}
            required
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-17" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>재고(보관) 위치</label>
          <input id="a11y-asset-manager-17"
            type="text"
            placeholder="예: 동부캠퍼스 1공학관 204호 AIDX 교육실"
            value={equipFormData.stock_location}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, stock_location: e.target.value }))}
            required
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-18" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>자산 구분</label>
          <select id="a11y-asset-manager-18"
            value={equipFormData.category}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, category: e.target.value }))}
            className="form-select"
          >
            <option value="ai_dx">AI∙DX 자산</option>
            <option value="other">기타 자산</option>
          </select>
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-19" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>사용 분야(목적)</label>
          <select id="a11y-asset-manager-19"
            value={equipFormData.usage_type}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, usage_type: e.target.value }))}
            className="form-select"
          >
            {USAGE_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-20" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>비고 및 특이사항</label>
          <input id="a11y-asset-manager-20"
            type="text"
            placeholder="예: 2026 라이즈 특화 1차 도입분"
            value={equipFormData.memo}
            onChange={(e) => setEquipFormData(prev => ({ ...prev, memo: e.target.value }))}
            className="form-input"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsEquipModalOpen(false)}
            style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
          >
            {loading ? "저장 중..." : "정보 저장"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
