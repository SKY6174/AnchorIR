import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { ScheduleCommitteeMember, ScheduleFormData } from "../schedule-types";
import { getFormattedMemberGrade } from "../utils/schedule-member-utils";

interface ScheduleMonthlyFormFieldsProps {
  aiPlanApplied: boolean;
  formData: ScheduleFormData;
  handleDeptCheckboxChange: (deptName: string) => void;
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleToggleAttendee: (name: string, role: string) => void;
  includeProfessors: boolean;
  members: ScheduleCommitteeMember[];
  setIncludeProfessors: Dispatch<SetStateAction<boolean>>;
}

export function ScheduleMonthlyFormFields({
  aiPlanApplied,
  formData,
  handleDeptCheckboxChange,
  handleInputChange,
  handleToggleAttendee,
  includeProfessors,
  members,
  setIncludeProfessors
}: ScheduleMonthlyFormFieldsProps) {
  return (
                <>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <label htmlFor="a11y-schedule-manager-46" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>일정 명칭</label>
                      {aiPlanApplied && (
                        <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.15)", border: "1px solid rgba(167, 139, 250, 0.35)", color: "#a78bfa", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✨ AI 기획 정보 반영됨 ✓
                        </span>
                      )}
                    </div>
                    <input id="a11y-schedule-manager-46" type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" className="form-input" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-schedule-manager-47" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 유형</label>
                      <select id="a11y-schedule-manager-14" name="type" value={formData.type} onChange={handleInputChange} className="form-select">
                        {["행사", "회의", "위원회", "기타"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-15" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>관련 부서 (중복 선택 가능)</label>
                      <div style={{ display: "flex", gap: "0.5rem 0.75rem", flexWrap: "wrap", padding: "0.5rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                        {["전체", "사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => {
                          const checked = formData.dept ? formData.dept.split(",").map((x: string) => x.trim()).includes(d) : false;
                          return (
                            <label key={d} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--text-primary)", cursor: "pointer", userSelect: "none" }}>
                              <input id="a11y-schedule-manager-47"
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleDeptCheckboxChange(d)}
                                style={{ cursor: "pointer", width: "14px", height: "14px" }}
                              />
                               {d}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-schedule-manager-48" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작일시 (일자)</label>
                      <input id="a11y-schedule-manager-15" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-16" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input id="a11y-schedule-manager-16" type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="form-input" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-schedule-manager-17" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료일시 (일자)</label>
                      <input id="a11y-schedule-manager-17" type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-schedule-manager-18" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input id="a11y-schedule-manager-18" type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="a11y-schedule-manager-19" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input id="a11y-schedule-manager-19" type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 대학 본부 대회의실" className="form-input" />
                  </div>
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <label htmlFor="a11y-schedule-manager-20" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        👥 전체 사업단 참석자 선택
                      </label>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                        <input id="a11y-schedule-manager-48"
                          type="checkbox"
                          checked={includeProfessors}
                          onChange={(e) => setIncludeProfessors(e.target.checked)}
                          style={{ cursor: "pointer", width: "14px", height: "14px" }}
                        />
                        팀장교수 포함
                      </label>
                    </div>
                    {(() => {
                      const ROLE_PRIORITY: Record<string, number> = {
                        "사업단장": 1,
                        "단장": 1, // 송경영 단장 정렬 최우선순위 보장
                        "총괄본부장": 2,
                        "본부장": 2, // 김현수 본부장 정렬 2순위 보장
                        "센터장": 3,
                        "운영팀장": 4,
                        "팀장교수": 5,
                        "연구원": 6
                      };
                      const DEPT_PRIORITY: Record<string, number> = {
                        "ECC센터": 1,
                        "ICC센터": 2,
                        "RCC센터": 3,
                        "AID-X지원센터": 4,
                        "울산늘봄누리센터": 5,
                        "신산업특화센터": 6,
                        "사업운영팀": 7
                      };
                      const GRADE_PRIORITY: Record<string, number> = {
                        "책임연구원": 1,
                        "선임연구원": 2,
                        "연구원": 3
                      };

                      const referenceDateObj = new Date(formData.startDate || new Date());

                      const allActiveMembers = (members || [])
                        .filter(m => {
                          const start = new Date(m.startDate || m.hireDate || "2026-03-01");
                          const end = m.endDate ? new Date(m.endDate) : null;
                          if (start > referenceDateObj) return false;
                          if (end && end < referenceDateObj) return false;

                          // 팀장교수 포함 체크 해제 시 팀장교수 리스트에서 완전 숨김
                          const displayRole = getFormattedMemberGrade(m);
                          if (!includeProfessors && displayRole === "팀장교수") return false;
                          return true;
                        })
                        .sort((a, b) => {
                          const rA = ROLE_PRIORITY[a.role] || 99;
                          const rB = ROLE_PRIORITY[b.role] || 99;
                          if (rA !== rB) return rA - rB;

                          const dA = DEPT_PRIORITY[a.dept] || 99;
                          const dB = DEPT_PRIORITY[b.dept] || 99;
                          if (dA !== dB) return dA - dB;

                          const gA = GRADE_PRIORITY[a.grade] || 99;
                          const gB = GRADE_PRIORITY[b.grade] || 99;
                          if (gA !== gB) return gA - gB;

                          const sA = new Date(a.startDate || a.hireDate || "2026-03-01").getTime();
                          const sB = new Date(b.startDate || b.hireDate || "2026-03-01").getTime();
                          return sA - sB;
                        });

                      return (
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", padding: "0.5rem", background: "var(--panel-bg)", borderRadius: "6px", border: "1px solid var(--border-color)", maxHeight: "120px", overflowY: "auto" }}>
                          {allActiveMembers.map(m => {
                            const displayRole = getFormattedMemberGrade(m, includeProfessors);
                            const isSelected = (formData.attendees || "")
                              .split(",")
                              .map((x: string) => x.trim())
                              .some((x: string) => x.includes(m.name));

                            return (
                              <button
                                key={m.id || m.email}
                                type="button"
                                onClick={() => handleToggleAttendee(m.name, displayRole)}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.7rem",
                                  borderRadius: "4px",
                                  border: "1px solid " + (isSelected ? "var(--accent-color)" : "var(--border-color)"),
                                  background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                                  color: isSelected ? "#60A5FA" : "var(--text-secondary)",
                                  cursor: "pointer",
                                  fontWeight: "700"
                                }}
                              >
                                {m.name} {displayRole} {isSelected ? "✓" : "+"}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <input
                      type="text"
                      name="attendees"
                      value={formData.attendees || ""}
                      onChange={handleInputChange}
                      placeholder="선택되거나 직접 콤마(,)로 구분해 입력"
                      className="form-input"
                      style={{ marginTop: "0.35rem", fontSize: "0.75rem" }}
                    />
                  </div>
                </>
  );
}
