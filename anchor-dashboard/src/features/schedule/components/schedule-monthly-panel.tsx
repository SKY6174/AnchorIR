import type { Dispatch, ReactNode, SetStateAction } from "react";
import { ChevronLeft, ChevronRight, Clock, Edit, Info, MapPin, Plus, Trash2 } from "lucide-react";
import type { ScheduleItem } from "../schedule-types";

interface ScheduleMonthlyPanelProps {
  currentMonth: number;
  currentRole: any;
  displayYear: number;
  getSelectedDaySchedules: () => ScheduleItem[];
  handleDeleteSchedule: (id?: number | string) => void;
  handleEditSchedule: (schedule: ScheduleItem) => void;
  handleLinkToDetail: (schedule: ScheduleItem) => void;
  handleToggleTaskCompleted: (id?: number | string) => void;
  openAddModal: (type: string, defaultDateString?: string | null) => void;
  renderCalendar: () => ReactNode;
  selectedDay: number;
  selectedDeptFilter: string;
  setCurrentMonth: Dispatch<SetStateAction<number>>;
  setSelectedDeptFilter: Dispatch<SetStateAction<string>>;
}

export function ScheduleMonthlyPanel({
  currentMonth,
  currentRole,
  displayYear,
  getSelectedDaySchedules,
  handleDeleteSchedule,
  handleEditSchedule,
  handleLinkToDetail,
  handleToggleTaskCompleted,
  openAddModal,
  renderCalendar,
  selectedDay,
  selectedDeptFilter,
  setCurrentMonth,
  setSelectedDeptFilter
}: ScheduleMonthlyPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <div className="card" style={{ padding: "1.25rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📅 앵커사업단 월간 일정
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                주요 마감일정, 장비 검수, 보고서 제출 기한 등을 캘린더 형태로 일괄 체크
              </p>
              <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: "500", opacity: 0.95 }}>
                (안내 : 선택된 연차에 해당되는 월(month)만 표시됩니다. '25.6월 보시려면 1차년도를 클릭하신 후 화살표로 이동하시면 됩니다.)
              </p>
            </div>

            {currentRole.id !== "GUEST" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => openAddModal("monthly")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                    background: "var(--accent-color, #3B82F6)", border: "none", color: "#FFFFFF", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onFocus={(e) => e.currentTarget.style.background = "#2563EB"}
                  onMouseOver={(e) => e.currentTarget.style.background = "#2563EB"}
                  onBlur={(e) => e.currentTarget.style.background = "var(--accent-color, #3B82F6)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "var(--accent-color, #3B82F6)"}
                >
                  <Plus size={16} />
                  일정 추가
                </button>
                <button
                  onClick={() => openAddModal("task")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                    background: "#8B5CF6", border: "none", color: "#FFFFFF", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onFocus={(e) => e.currentTarget.style.background = "#7C3AED"}
                  onMouseOver={(e) => e.currentTarget.style.background = "#7C3AED"}
                  onBlur={(e) => e.currentTarget.style.background = "#8B5CF6"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#8B5CF6"}
                >
                  <Plus size={16} />
                  할일 추가
                </button>
                <button
                  onClick={() => openAddModal("deadline")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                    background: "#EF4444", border: "none", color: "#FFFFFF", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onFocus={(e) => e.currentTarget.style.background = "#DC2626"}
                  onMouseOver={(e) => e.currentTarget.style.background = "#DC2626"}
                  onBlur={(e) => e.currentTarget.style.background = "#EF4444"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#EF4444"}
                >
                  <Plus size={16} />
                  마감일 등록
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "1.5rem" }}>

            {/* 왼쪽: 캘린더 프레임 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>

              {/* 캘린더 월 조작용 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {displayYear}년
                  </span>
                  <span style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--accent-color)" }}>
                    {currentMonth}월
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    onClick={() => setCurrentMonth(prev => prev === 1 ? 12 : prev - 1)}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(prev => prev === 12 ? 1 : prev + 1)}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* 부서 필터 칩 */}
              <div style={{
                display: "flex",
                gap: "0.35rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                {["전체", "사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(dept => {
                  const isActive = selectedDeptFilter === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDeptFilter(dept)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "20px",
                        border: "1px solid " + (isActive ? "var(--accent-color)" : "var(--border-color)"),
                        background: isActive ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                        color: isActive ? "#60A5FA" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: isActive ? "800" : "500",
                        transition: "all 0.15s ease",
                      }}
                      onFocus={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = "var(--text-secondary)";
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = "var(--text-secondary)";
                      }}
                      onBlur={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>

              {/* 요일 행 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <div style={{ color: "#EF4444" }}>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div style={{ color: "#60A5FA" }}>토</div>
              </div>

              {/* 날짜 그리드 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderLeft: "1px solid var(--border-color)", borderTop: "1px solid var(--border-color)", marginTop: "0.25rem" }}>
                {renderCalendar()}
              </div>

            </div>

            {/* 오른쪽: 선택 일자 상세일정 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                🗓️ {currentMonth}월 {selectedDay}일 상세 일정
              </h4>

              {getSelectedDaySchedules().length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {getSelectedDaySchedules().map((sched: ScheduleItem) => {
                    const isTask = sched.isTask || false;
                    const isDeadline = sched.isDeadline || false;
                    const isCompleted = sched.completed || false;
                    const isLinkable = sched.type === "행사" || sched.type === "회의" || sched.type === "위원회";

                    let cardBg = "rgba(255,255,255,0.02)";
                    let cardBorder = "1px solid rgba(255,255,255,0.05)";
                    if (isDeadline) {
                      cardBg = "rgba(239, 68, 68, 0.03)";
                      cardBorder = "1px solid rgba(239, 68, 68, 0.15)";
                    } else if (isTask) {
                      cardBg = "rgba(139, 92, 246, 0.03)";
                      cardBorder = "1px solid rgba(139, 92, 246, 0.15)";
                    } else if (isLinkable) {
                      cardBg = "rgba(59, 130, 246, 0.03)";
                      cardBorder = "1px solid rgba(59, 130, 246, 0.15)";
                    }

                    return (
                      <div
                        key={sched.id}
                        onClick={() => {
                          if (isLinkable) {
                            handleLinkToDetail(sched);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (isLinkable) {
                            e.currentTarget.style.borderColor = "var(--accent-color)";
                            e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isLinkable) {
                            e.currentTarget.style.borderColor = isDeadline ? "rgba(239, 68, 68, 0.15)" : (isTask ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.05)");
                            e.currentTarget.style.background = cardBg;
                          }
                        }}
                        style={{
                          padding: "0.75rem", borderRadius: "6px",
                          background: cardBg,
                          border: cardBorder,
                          position: "relative",
                          opacity: isCompleted ? 0.6 : 1,
                          cursor: isLinkable ? "pointer" : "default",
                          transition: "all 0.15s ease"
                        }}
                       role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                            {(isTask || isDeadline) && (
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleTaskCompleted(sched.id);
                                }}
                                style={{ marginTop: "0.2rem", cursor: "pointer", width: "15px", height: "15px", accentColor: isDeadline ? "#EF4444" : "#8B5CF6" }}
                              />
                            )}
                            <div>
                              <strong style={{
                                fontSize: "0.9rem",
                                color: "var(--text-primary)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                marginBottom: "0.25rem",
                                textDecoration: isCompleted ? "line-through" : "none"
                              }}>
                                {sched.title}
                                {isLinkable && (
                                  <span style={{ fontSize: "0.68rem", color: "#60A5FA", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.1rem" }} title="상세 정보 연계 이동">
                                    🔗
                                  </span>
                                )}
                              </strong>
                            </div>
                          </div>
                          {currentRole.id !== "GUEST" && (
                            <div style={{ display: "flex", gap: "0.25rem" }} onClick={(e) => e.stopPropagation()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                              <button
                                onClick={() => handleEditSchedule(sched)}
                                title="수정"
                                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(sched.id)}
                                title="삭제"
                                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                onFocus={(e) => e.currentTarget.style.color = "#EF4444"}
                                onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                          <span style={{
                            fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px",
                            background: isDeadline ? "rgba(239, 68, 68, 0.2)" : (isTask ? "rgba(139, 92, 246, 0.2)" : (sched.type === "행사" ? "rgba(59, 130, 246, 0.2)" : sched.type === "회의" ? "rgba(16, 185, 129, 0.2)" : sched.type === "위원회" ? "rgba(245, 158, 11, 0.2)" : "rgba(128, 128, 128, 0.15)")),
                            color: isDeadline ? "#EF4444" : (isTask ? "#A78BFA" : (sched.type === "행사" ? "#60A5FA" : sched.type === "회의" ? "#34D399" : sched.type === "위원회" ? "#FBBF24" : "var(--text-primary)")),
                            fontWeight: "700"
                          }}>
                            {isDeadline ? "마감" : (isTask ? "할일" : (sched.type || "기타"))}
                          </span>
                          <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(128, 128, 128, 0.1)", color: "var(--text-secondary)", fontWeight: "700" }}>
                            {sched.dept || "사업운영팀"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={12} />
                            {(() => {
                              const parts = sched.startAt ? sched.startAt.split(" ") : [];
                              const hasTime = parts.length >= 2 && parts[1];
                              const timeStr = hasTime ? parts[1] : "(종일)";
                              if (isDeadline) {
                                return `${timeStr} (마감 기한)`;
                              }
                              if (isTask) {
                                return `${timeStr} (할일 기한)`;
                              }
                              return sched.startAt === sched.endAt ? sched.startAt : `${sched.startAt} ~ ${sched.endAt}`;
                            })()}
                          </span>
                          {!(isTask || isDeadline) && sched.location && (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              <MapPin size={12} />
                              {sched.location}
                            </span>
                          )}
                          {(sched.type === "회의" || sched.type === "위원회") && (
                            <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.5rem" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLinkToDetail(sched);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.25rem 0.65rem",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                  borderRadius: "4px",
                                  background: "rgba(16, 185, 129, 0.12)",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                  color: "#34D399",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
                                  e.currentTarget.style.borderColor = "#34D399";
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
                                  e.currentTarget.style.borderColor = "#34D399";
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                                }}
                              >
                                📄 관련 회의록 바로가기
                              </button>
                            </div>
                          )}
                          {sched.type === "행사" && (
                            <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.5rem" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLinkToDetail(sched);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.25rem 0.65rem",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                  borderRadius: "4px",
                                  background: "rgba(59, 130, 246, 0.12)",
                                  border: "1px solid rgba(59, 130, 246, 0.25)",
                                  color: "#60A5FA",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                  e.currentTarget.style.borderColor = "#60A5FA";
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                  e.currentTarget.style.borderColor = "#60A5FA";
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.25)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.25)";
                                }}
                              >
                                🎯 관련 주요행사 바로가기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center" }}>
                  <Info size={24} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                  <span>선택된 날짜에 등록된 일정이 없습니다.</span>
                </div>
              )}
            </div>

          </div>

        </div>
  );
}
