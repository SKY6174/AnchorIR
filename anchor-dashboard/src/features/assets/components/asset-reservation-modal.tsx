import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { X } from "lucide-react";
import type { ReservationFormData } from "../asset-types";

interface AssetReservationModalProps {
  SPACES: readonly string[];
  handleAddReservation: FormEventHandler<HTMLFormElement>;
  loading: boolean;
  resFormData: ReservationFormData;
  setIsResModalOpen: Dispatch<SetStateAction<boolean>>;
  setResFormData: Dispatch<SetStateAction<ReservationFormData>>;
}

export const AssetReservationModal = ({
  SPACES,
  handleAddReservation,
  loading,
  resFormData,
  setIsResModalOpen,
  setResFormData
}: AssetReservationModalProps) => (
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
          📅 공간 사용 예약 신청
        </h3>
        <button type="button" onClick={() => setIsResModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleAddReservation} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
        <div>
          <label htmlFor="a11y-asset-manager-1" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>예약 대상 공간</label>
          <select id="a11y-asset-manager-1"
            value={resFormData.space_name}
            onChange={(e) => setResFormData(prev => ({ ...prev, space_name: e.target.value }))}
            className="form-select"
          >
            {SPACES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-2" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>예약일자</label>
          <input id="a11y-asset-manager-2"
            type="date"
            value={resFormData.reserved_date}
            onChange={(e) => setResFormData(prev => ({ ...prev, reserved_date: e.target.value }))}
            required
            className="form-input"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label htmlFor="a11y-asset-manager-3" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>시작 시간</label>
            <input id="a11y-asset-manager-3"
              type="time"
              value={resFormData.start_time}
              onChange={(e) => setResFormData(prev => ({ ...prev, start_time: e.target.value }))}
              required
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="a11y-asset-manager-4" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>종료 시간</label>
            <input id="a11y-asset-manager-4"
              type="time"
              value={resFormData.end_time}
              onChange={(e) => setResFormData(prev => ({ ...prev, end_time: e.target.value }))}
              required
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="a11y-asset-manager-5" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>신청부서</label>
          <select id="a11y-asset-manager-5"
            value={resFormData.dept}
            onChange={(e) => setResFormData(prev => ({ ...prev, dept: e.target.value }))}
            className="form-select"
          >
            {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "직접입력"].map(d => (
              <option key={d} value={d}>{d === "직접입력" ? "직접입력 (사업단 외 조직)" : d}</option>
            ))}
          </select>
        </div>

        {resFormData.dept === "직접입력" && (
          <div>
            <label htmlFor="a11y-asset-manager-6" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>신청부서 (직접 입력)</label>
            <input id="a11y-asset-manager-6"
              type="text"
              placeholder="예: 울산대학교 행정처, OO협회"
              value={resFormData.custom_dept}
              onChange={(e) => setResFormData(prev => ({ ...prev, custom_dept: e.target.value }))}
              required
              className="form-input"
            />
          </div>
        )}

        <div>
          <label htmlFor="a11y-asset-manager-7" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>
            {resFormData.dept === "직접입력" ? "예약대행자 (사업단 구성원)" : "신청자 (사업단 구성원)"}
          </label>
          <input id="a11y-asset-manager-7"
            type="text"
            placeholder="사업단 소속 구성원 이름 입력"
            value={resFormData.reserver_name}
            onChange={(e) => setResFormData(prev => ({ ...prev, reserver_name: e.target.value }))}
            required
            className="form-input"
          />
        </div>

        {resFormData.dept === "직접입력" && (
          <div>
            <label htmlFor="a11y-asset-manager-8" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>실제 이용자명 (외부 담당자)</label>
            <input id="a11y-asset-manager-8"
              type="text"
              placeholder="공간을 이용할 실제 외부 담당자명"
              value={resFormData.actual_user_name}
              onChange={(e) => setResFormData(prev => ({ ...prev, actual_user_name: e.target.value }))}
              required
              className="form-input"
            />
          </div>
        )}

        <div>
          <label htmlFor="a11y-asset-manager-9" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>사용 목적</label>
          <input id="a11y-asset-manager-9"
            type="text"
            placeholder="예: 지산학 워크숍 개최 등"
            value={resFormData.purpose}
            onChange={(e) => setResFormData(prev => ({ ...prev, purpose: e.target.value }))}
            className="form-input"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsResModalOpen(false)}
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
            {loading ? "등록 중..." : "승인요청"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
