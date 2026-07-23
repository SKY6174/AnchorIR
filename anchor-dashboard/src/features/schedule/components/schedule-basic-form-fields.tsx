import type { ChangeEvent } from "react";
import type { ScheduleFormData } from "../schedule-types";

interface ScheduleBasicFormFieldsProps {
  formData: ScheduleFormData;
  handleCheckboxChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  modalType: string;
}

export function ScheduleBasicFormFields({
  formData,
  handleCheckboxChange,
  handleInputChange,
  modalType
}: ScheduleBasicFormFieldsProps) {
  if (modalType === "deadline") {
    return (
      <>
        <div>
          <label htmlFor="a11y-schedule-manager-9" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감일 내용</label>
          <input id="a11y-schedule-manager-9" type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 RISE 최종 계획서 마감" className="form-input" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="a11y-schedule-manager-10" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감 기한 (일자)</label>
            <input id="a11y-schedule-manager-10" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label htmlFor="a11y-schedule-manager-11" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>마감 시간</label>
              <label style={{ fontSize: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                <input id="a11y-schedule-manager-44" type="checkbox" name="noTime" checked={formData.noTime} onChange={handleCheckboxChange} style={{ cursor: "pointer" }} />
                시간 지정 안 함
              </label>
            </div>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              disabled={formData.noTime}
              className="form-input"
              style={{ cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1 }}
            />
          </div>
        </div>
      </>
    );
  }

  if (modalType === "task") {
    return (
      <>
        <div>
          <label htmlFor="a11y-schedule-manager-45" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 내용</label>
          <input id="a11y-schedule-manager-11" type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 결과 보고서 작성 및 결재 요청" className="form-input" />
        </div>
        <div>
          <label htmlFor="a11y-schedule-manager-12" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
          <select id="a11y-schedule-manager-12" name="dept" value={formData.dept} onChange={handleInputChange} className="form-select">
            {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="a11y-schedule-manager-13" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 일자</label>
            <input id="a11y-schedule-manager-13" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label htmlFor="a11y-schedule-manager-14" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>할일 시간</label>
              <label style={{ fontSize: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                <input id="a11y-schedule-manager-45" type="checkbox" name="noTime" checked={formData.noTime} onChange={handleCheckboxChange} style={{ cursor: "pointer" }} />
                시간 지정 안 함
              </label>
            </div>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              disabled={formData.noTime}
              className="form-input"
              style={{ cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1 }}
            />
          </div>
        </div>
      </>
    );
  }

  return null;
}
