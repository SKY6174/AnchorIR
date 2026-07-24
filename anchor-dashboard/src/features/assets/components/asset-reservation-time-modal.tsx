import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Clock } from "lucide-react";
import type {
  LegacyAssetRecord,
  ReservationTimeFormData
} from "../asset-types";

interface AssetReservationTimeModalProps {
  editResFormData: ReservationTimeFormData;
  handleSaveEditedTime: FormEventHandler<HTMLFormElement>;
  loading: boolean;
  setEditingRes: Dispatch<SetStateAction<LegacyAssetRecord | null>>;
  setEditResFormData: Dispatch<SetStateAction<ReservationTimeFormData>>;
  setIsEditTimeModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AssetReservationTimeModal = ({
  editResFormData,
  handleSaveEditedTime,
  loading,
  setEditingRes,
  setEditResFormData,
  setIsEditTimeModalOpen
}: AssetReservationTimeModalProps) => (
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
      width: "350px",
      padding: "1.25rem",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
      margin: "auto",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.85rem", color: "#60A5FA", display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <Clock size={18} /> ⏱️ 예약 일시 변경 (조율 권한)
      </h3>
      <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
        승인권자 권한으로 예약 신청 건의 사용 시간과 날짜를 조정합니다.
      </p>

      <form onSubmit={handleSaveEditedTime} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <label htmlFor="a11y-asset-manager-10" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약일자</label>
          <input id="a11y-asset-manager-10"
            type="date"
            value={editResFormData.reserved_date}
            onChange={(e) => setEditResFormData(prev => ({ ...prev, reserved_date: e.target.value }))}
            required
            style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label htmlFor="a11y-asset-manager-11" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>시작 시간</label>
            <input id="a11y-asset-manager-11"
              type="time"
              value={editResFormData.start_time}
              onChange={(e) => setEditResFormData(prev => ({ ...prev, start_time: e.target.value }))}
              required
              style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
            />
          </div>
          <div>
            <label htmlFor="a11y-asset-manager-12" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>종료 시간</label>
            <input id="a11y-asset-manager-12"
              type="time"
              value={editResFormData.end_time}
              onChange={(e) => setEditResFormData(prev => ({ ...prev, end_time: e.target.value }))}
              required
              style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setIsEditTimeModalOpen(false);
              setEditingRes(null);
            }}
            style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
          >
            닫기
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
          >
            {loading ? "저장 중..." : "일시 조정 적용"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
