import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  FileText, Award, Layers, Plus, CheckCircle, Info, ChevronLeft, ChevronRight,
  Edit, Trash2
} from "lucide-react";

export default function ScheduleManager({
  currentRole,
  selectedYear,
  subTab,
  onChangeSubTab,
  monthlySchedules = [],
  setMonthlySchedules,
  eventSchedules = [],
  setEventSchedules,
  meetingSchedules = [],
  setMeetingSchedules
}) {
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("monthly"); // "monthly", "event", "meeting"
  const [isEditMode, setIsEditMode] = useState(false);   // 수정 모드 활성화 여부
  const [editingItemId, setEditingItemId] = useState(null); // 편집 대상 일정 ID

  // 캘린더 월 상태 (2026년 7월 기준)
  const [currentMonth, setCurrentMonth] = useState(7); // 7월
  const [selectedDay, setSelectedDay] = useState(15); // 디폴트 선택 일자

  // 행사 및 회의 월 선택 상태
  const [selectedEventMonth, setSelectedEventMonth] = useState(7); // 7월
  const [selectedMeetingMonth, setSelectedMeetingMonth] = useState(7); // 7월

  // 회의 대분류 상태 ("operating": 사업단 운영회의, "center": 센터별 회의, "committee": 각종 위원회 회의)
  const [activeMeetingCat, setActiveMeetingCat] = useState("operating");

  // 4. 입력 폼 임시 State
  const [formData, setFormData] = useState({
    title: "",
    type: "행사",
    dept: "사업운영팀",
    startDate: "2026-07-15",
    startTime: "10:00",
    endDate: "2026-07-15",
    endTime: "11:00",
    location: "",
    noTime: false,
    // 행사 & 회의용
    month: 7,
    department: "",
    datetime: "",
    attendeesInternal: "",
    attendeesExternal: "",
    program: "",
    purpose: "",
    result: "",
    category: "operating",
    agenda: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalType === "monthly" || modalType === "task" || modalType === "deadline") {
      const isTaskVal = modalType === "task";
      const isDeadlineVal = modalType === "deadline";
      const hasTime = !formData.noTime;
      const startAtVal = hasTime ? `${formData.startDate} ${formData.startTime}` : formData.startDate;

      if (isEditMode) {
        setMonthlySchedules(monthlySchedules.map(s => 
          s.id === editingItemId 
            ? {
                ...s,
                title: formData.title || "새 일정",
                type: isTaskVal ? "할일" : (isDeadlineVal ? "마감" : (formData.type || "기타")),
                dept: (isTaskVal || isDeadlineVal) ? "사업운영팀" : (formData.dept || "사업운영팀"),
                startAt: startAtVal,
                endAt: (isTaskVal || isDeadlineVal) ? startAtVal : (hasTime ? `${formData.endDate} ${formData.endTime}` : formData.endDate),
                location: (isTaskVal || isDeadlineVal) ? "" : (formData.location || "-"),
                isTask: isTaskVal,
                isDeadline: isDeadlineVal
              }
            : s
        ));
      } else {
        const newItem = {
          id: Date.now(),
          title: formData.title || "새 일정",
          type: isTaskVal ? "할일" : (isDeadlineVal ? "마감" : (formData.type || "기타")),
          dept: (isTaskVal || isDeadlineVal) ? "사업운영팀" : (formData.dept || "사업운영팀"),
          startAt: startAtVal,
          endAt: (isTaskVal || isDeadlineVal) ? startAtVal : (hasTime ? `${formData.endDate} ${formData.endTime}` : formData.endDate),
          location: (isTaskVal || isDeadlineVal) ? "" : (formData.location || "-"),
          isTask: isTaskVal,
          isDeadline: isDeadlineVal,
          completed: false
        };
        setMonthlySchedules([newItem, ...monthlySchedules]);
      }
    } else if (modalType === "event") {
      const newItem = {
        id: Date.now(),
        month: Number(formData.month) || 7,
        title: formData.title || "새 행사 일정",
        department: formData.department || "-",
        datetime: formData.datetime || "-",
        location: formData.location || "-",
        attendeesInternal: formData.attendeesInternal || "-",
        attendeesExternal: formData.attendeesExternal || "-",
        program: formData.program || "-",
        purpose: formData.purpose || "-",
        result: formData.result || "-"
      };
      setEventSchedules([newItem, ...eventSchedules]);
    } else if (modalType === "meeting") {
      const newItem = {
        id: Date.now(),
        month: Number(formData.month) || 7,
        category: formData.category,
        title: formData.title || "새 회의 일정",
        datetime: formData.datetime || "-",
        location: formData.location || "-",
        attendeesInternal: formData.attendeesInternal || "-",
        attendeesExternal: formData.attendeesExternal || "-",
        agenda: formData.agenda || "-",
        result: formData.result || "-"
      };
      setMeetingSchedules([newItem, ...meetingSchedules]);
    }

    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    setFormData({
      title: "",
      type: "행사",
      dept: "사업운영팀",
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: "",
      noTime: false,
      month: 7,
      department: "",
      datetime: "",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: ""
    });
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = (id) => {
    if (window.confirm("선택한 일정을 삭제하시겠습니까?")) {
      setMonthlySchedules(monthlySchedules.filter(s => s.id !== id));
    }
  };

  // 일정 수정 모달 트리거
  const handleEditSchedule = (sched) => {
    setIsEditMode(true);
    setEditingItemId(sched.id);
    setModalType(sched.isDeadline ? "deadline" : (sched.isTask ? "task" : "monthly"));

    const startParts = sched.startAt ? sched.startAt.split(" ") : ["2026-07-15", "10:00"];
    const endParts = sched.endAt ? sched.endAt.split(" ") : ["2026-07-15", "11:00"];
    const noTimeVal = startParts.length < 2 || !startParts[1];

    setFormData({
      title: sched.title,
      type: sched.type || "행사",
      dept: sched.dept || "사업운영팀",
      startDate: startParts[0] || "2026-07-15",
      startTime: startParts[1] || "10:00",
      endDate: endParts[0] || "2026-07-15",
      endTime: endParts[1] || "11:00",
      location: sched.location || "",
      noTime: noTimeVal,
      month: 7,
      department: "",
      datetime: "",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: ""
    });
    setIsAddModalOpen(true);
  };

  // 할일 완료 상태 토글
  const handleToggleTaskCompleted = (id) => {
    setMonthlySchedules(prev => prev.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const openAddModal = (type) => {
    setModalType(type);
    setIsAddModalOpen(true);
  };

  // 캘린더 드로잉 헬퍼
  const getDaysInMonth = (month) => {
    // 2026년 기준 7월은 31일, 8월은 31일
    if (month === 7) return 31;
    if (month === 8) return 31;
    return 30; // 간소화
  };

  const getStartDayOfWeek = (month) => {
    // 2026년 7월 1일은 수요일(3)
    if (month === 7) return 3;
    // 2026년 8월 1일은 토요일(6)
    if (month === 8) return 6;
    return 1;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDay = getStartDayOfWeek(currentMonth);
    const cells = [];

    // 빈 셀 채우기
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ height: "70px", borderBottom: "1px solid rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.05)" }}></div>);
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `2026-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${day < 10 ? "0" + day : day}`;
      const daySchedules = monthlySchedules.filter(s => s.startAt && s.startAt.substring(0, 10) === dateString);
      const isSelected = selectedDay === day;

      cells.push(
        <div 
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          style={{
            height: "70px",
            padding: "0.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s ease"
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isSelected ? "var(--accent-color)" : "var(--text-primary-dark)" }}>
            {day}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem", maxHeight: "40px", overflow: "hidden" }}>
            {daySchedules.map(sched => {
              const isTask = sched.isTask || false;
              const isDeadline = sched.isDeadline || false;
              const isCompleted = sched.completed || false;
              
              let bgColor = "#4B5563";
              if (isDeadline) {
                bgColor = isCompleted ? "rgba(239, 68, 68, 0.4)" : "#EF4444";
              } else if (isTask) {
                bgColor = isCompleted ? "rgba(139, 92, 246, 0.4)" : "#8B5CF6";
              } else {
                bgColor = sched.type === "행사" ? "#3B82F6" : sched.type === "회의" ? "#10B981" : sched.type === "위원회" ? "#F59E0B" : "#4B5563";
              }

              return (
                <div 
                  key={sched.id} 
                  style={{
                    fontSize: "0.65rem",
                    background: bgColor,
                    color: "white",
                    padding: "0.1rem 0.25rem",
                    borderRadius: "2px",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    textDecoration: isCompleted ? "line-through" : "none",
                    opacity: isCompleted ? 0.6 : 1
                  }}
                  title={`${isDeadline ? "[마감]" : (isTask ? "[할일]" : `[${sched.type}]`)} ${sched.title} (${sched.dept})`}
                >
                  {isDeadline ? "🚨 " : (isTask ? "✔️ " : "")}{sched.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  const getSelectedDaySchedules = () => {
    const dateString = `2026-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`;
    return monthlySchedules.filter(s => s.startAt && s.startAt.substring(0, 10) === dateString);
  };

  return (
    <div className="schedule-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. 월간 일정 */}
      {subTab === "monthly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                📅 앵커사업단 월간 일정
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                주요 마감일정, 장비 검수, 보고서 제출 기한 등을 캘린더 형태로 일괄 체크
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                className="btn btn-primary"
                onClick={() => openAddModal("monthly")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                <Plus size={16} />
                일정 추가
              </button>
              <button 
                onClick={() => openAddModal("task")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "#8B5CF6", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#7C3AED"}
                onMouseOut={(e) => e.currentTarget.style.background = "#8B5CF6"}
              >
                <Plus size={16} />
                할일 추가
              </button>
              <button 
                onClick={() => openAddModal("deadline")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "#EF4444", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#DC2626"}
                onMouseOut={(e) => e.currentTarget.style.background = "#EF4444"}
              >
                <Plus size={16} />
                마감일 등록
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "1.5rem" }}>
            
            {/* 왼쪽: 캘린더 프레임 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)" }}>
              
              {/* 캘린더 월 조작용 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1rem", fontWeight: "800", color: "white" }}>
                  2026년 {currentMonth}월
                </span>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "4px", color: "white", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "4px", color: "white", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* 요일 행 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary-dark)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                <div style={{ color: "#EF4444" }}>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div style={{ color: "#60A5FA" }}>토</div>
              </div>

              {/* 날짜 그리드 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderLeft: "1px solid rgba(255,255,255,0.05)", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "0.25rem" }}>
                {renderCalendar()}
              </div>

            </div>

            {/* 오른쪽: 선택 일자 상세일정 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary-dark)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                🗓️ {currentMonth}월 {selectedDay}일 상세 일정
              </h4>

              {getSelectedDaySchedules().length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {getSelectedDaySchedules().map(sched => {
                    const isTask = sched.isTask || false;
                    const isDeadline = sched.isDeadline || false;
                    const isCompleted = sched.completed || false;
                    
                    let cardBg = "rgba(255,255,255,0.02)";
                    let cardBorder = "1px solid rgba(255,255,255,0.05)";
                    if (isDeadline) {
                      cardBg = "rgba(239, 68, 68, 0.03)";
                      cardBorder = "1px solid rgba(239, 68, 68, 0.15)";
                    } else if (isTask) {
                      cardBg = "rgba(139, 92, 246, 0.03)";
                      cardBorder = "1px solid rgba(139, 92, 246, 0.15)";
                    }

                    return (
                      <div 
                        key={sched.id} 
                        style={{
                          padding: "0.75rem", borderRadius: "6px",
                          background: cardBg,
                          border: cardBorder,
                          position: "relative",
                          opacity: isCompleted ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                            {(isTask || isDeadline) && (
                              <input 
                                type="checkbox" 
                                checked={isCompleted} 
                                onChange={() => handleToggleTaskCompleted(sched.id)}
                                style={{ marginTop: "0.2rem", cursor: "pointer", width: "15px", height: "15px", accentColor: isDeadline ? "#EF4444" : "#8B5CF6" }}
                              />
                            )}
                            <strong style={{ 
                              fontSize: "0.9rem", 
                              color: "white", 
                              display: "block", 
                              marginBottom: "0.25rem",
                              textDecoration: isCompleted ? "line-through" : "none"
                            }}>
                              {sched.title}
                            </strong>
                          </div>
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button 
                              onClick={() => handleEditSchedule(sched)}
                              title="수정"
                              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                              onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                              onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSchedule(sched.id)}
                              title="삭제"
                              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                              onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                              onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                          <span style={{ 
                            fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px", 
                            background: isDeadline ? "rgba(239, 68, 68, 0.2)" : (isTask ? "rgba(139, 92, 246, 0.2)" : (sched.type === "행사" ? "rgba(59, 130, 246, 0.2)" : sched.type === "회의" ? "rgba(16, 185, 129, 0.2)" : sched.type === "위원회" ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.05)")), 
                            color: isDeadline ? "#EF4444" : (isTask ? "#A78BFA" : (sched.type === "행사" ? "#60A5FA" : sched.type === "회의" ? "#34D399" : sched.type === "위원회" ? "#FBBF24" : "#FFFFFF")), 
                            fontWeight: "700" 
                          }}>
                            {isDeadline ? "마감" : (isTask ? "할일" : (sched.type || "기타"))}
                          </span>
                          <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-secondary-dark)", fontWeight: "700" }}>
                            {sched.dept || "사업운영팀"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary-dark)", fontSize: "0.8rem", textAlign: "center" }}>
                  <Info size={24} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                  <span>선택된 날짜에 등록된 일정이 없습니다.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. 행사 일정 */}
      {subTab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 행사 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                ✨ 앵커 사업단 주요 행사 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                월별 가로 탭을 눌러 행사 상세 기획, 참석자, 목적 및 결과 정보 관리
              </p>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => openAddModal("event")}
              style={{
                display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
              }}
            >
              <Plus size={16} />
              행사 일정 등록
            </button>
          </div>

          {/* 💡 월별 가로 탭바 헤더 */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedEventMonth(m)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
                  background: selectedEventMonth === m ? "var(--accent-color)" : "transparent",
                  color: selectedEventMonth === m ? "white" : "var(--text-secondary-dark)",
                  fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                {m}월
              </button>
            ))}
          </div>

          {/* 행사 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {eventSchedules.filter(e => e.month === selectedEventMonth).length > 0 ? (
              eventSchedules.filter(e => e.month === selectedEventMonth).map(event => (
                <div 
                  key={event.id}
                  className="card"
                  style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", fontWeight: "700" }}>
                      소속부서: {event.department}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={14} />
                      {event.datetime}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "white" }}>
                    {event.title}
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary-dark)" }}>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>📍 행사 장소</span>
                        <strong>{event.location}</strong>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>👥 참석자 (내부)</span>
                          <span>{event.attendeesInternal}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>👥 참석자 (외부)</span>
                          <span>{event.attendeesExternal}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>🔗 연계 프로그램</span>
                        <span>{event.program}</span>
                      </div>
                      
                      <div>
                        <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>🎯 행사 목적</span>
                        <p style={{ margin: "0.1rem 0 0 0", lineHeight: "1.3" }}>{event.purpose}</p>
                      </div>
                    </div>

                    <div style={{ background: "rgba(52, 211, 153, 0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(52, 211, 153, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "#34D399", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={14} />
                        행사 결과 보고
                      </span>
                      <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>{event.result}</p>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", color: "var(--text-secondary-dark)", textAlign: "center" }}>
                <CalendarIcon size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                <span>{selectedEventMonth}월에 등록된 주요 행사 일정이 없습니다.<br />[행사 일정 등록] 버튼을 눌러 초기 계획을 채워보세요.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. 회의 일정 */}
      {subTab === "meetings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 회의 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                👥 의사 결정 정기 회의 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                운영위원회, 센터 실무진 회의, 자문 위원회 일시 및 의제 결과 기록
              </p>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => openAddModal("meeting")}
              style={{
                display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
              }}
            >
              <Plus size={16} />
              회의 일정 등록
            </button>
          </div>

          {/* 월별 선택 가로바 */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMeetingMonth(m)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
                  background: selectedMeetingMonth === m ? "var(--accent-color)" : "transparent",
                  color: selectedMeetingMonth === m ? "white" : "var(--text-secondary-dark)",
                  fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                {m}월
              </button>
            ))}
          </div>

          {/* 회의 대분류 가로 단추 (운영회의, 센터회의, 위원회) */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.2rem" }}>
            <button
              onClick={() => setActiveMeetingCat("operating")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "operating" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                borderBottom: activeMeetingCat === "operating" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              사업단 운영회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("center")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "center" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                borderBottom: activeMeetingCat === "center" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              센터별 회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("committee")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "committee" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                borderBottom: activeMeetingCat === "committee" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              각종 위원회 회의
            </button>
          </div>

          {/* 회의 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {meetingSchedules.filter(m => m.month === selectedMeetingMonth && m.category === activeMeetingCat).length > 0 ? (
              meetingSchedules.filter(m => m.month === selectedMeetingMonth && m.category === activeMeetingCat).map(meeting => (
                <div 
                  key={meeting.id}
                  className="card"
                  style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", fontWeight: "700" }}>
                      📍 회의 장소: {meeting.location}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={14} />
                      {meeting.datetime}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "white" }}>
                    {meeting.title}
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary-dark)" }}>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>👥 참석자 (내부)</span>
                          <span>{meeting.attendeesInternal}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>👥 참석자 (외부)</span>
                          <span>{meeting.attendeesExternal}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>📝 회의 의제 (주요 안건)</span>
                        <p style={{ margin: "0.1rem 0 0 0", lineHeight: "1.3" }}>{meeting.agenda}</p>
                      </div>
                    </div>

                    <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "#60A5FA", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={14} />
                        회의 결정 결과
                      </span>
                      <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>{meeting.result}</p>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", color: "var(--text-secondary-dark)", textAlign: "center" }}>
                <Users size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                <span>{selectedMeetingMonth}월에 분류된 회의 일정이 없습니다.<br />[회의 일정 등록] 버튼을 눌러 회의록 틀을 보충해 보세요.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. 등록 모달 팝업 */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="card" style={{ width: "600px", maxHeight: "85vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "white" }}>
                {isEditMode 
                  ? (modalType === "deadline" ? "✏️ 마감일 수정" : modalType === "task" ? "✏️ 할일 수정" : "✏️ 일반 일정 수정") 
                  : (modalType === "monthly" ? "➕ 새 일반 일정 등록" : modalType === "task" ? "➕ 새 할일 등록" : modalType === "deadline" ? "🚨 새 마감일 등록" : modalType === "event" ? "➕ 새 행사 일정 기획 등록" : "➕ 새 회의 일정 회의록 등록")}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditMode(false);
                  setEditingItemId(null);
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary-dark)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 마감일 입력 */}
              {modalType === "deadline" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>마감일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 RISE 최종 계획서 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>마감 기한 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>마감 시간</label>
                        <label style={{ fontSize: "0.75rem", color: "white", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                          <input type="checkbox" name="noTime" checked={formData.noTime} onChange={handleCheckboxChange} style={{ cursor: "pointer" }} />
                          시간 지정 안 함
                        </label>
                      </div>
                      <input 
                        type="time" 
                        name="startTime" 
                        value={formData.startTime} 
                        onChange={handleInputChange} 
                        disabled={formData.noTime}
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: formData.noTime ? "rgba(255,255,255,0.2)" : "white", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1, colorScheme: "dark" }} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 할일 입력 */}
              {modalType === "task" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>할일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 결과 보고서 작성 및 결재 요청" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 부서</label>
                    <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                      {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>할일 일자</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>할일 시간</label>
                        <label style={{ fontSize: "0.75rem", color: "white", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                          <input type="checkbox" name="noTime" checked={formData.noTime} onChange={handleCheckboxChange} style={{ cursor: "pointer" }} />
                          시간 지정 안 함
                        </label>
                      </div>
                      <input 
                        type="time" 
                        name="startTime" 
                        value={formData.startTime} 
                        onChange={handleInputChange} 
                        disabled={formData.noTime}
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: formData.noTime ? "rgba(255,255,255,0.2)" : "white", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1, colorScheme: "dark" }} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 월간 일정 입력 */}
              {modalType === "monthly" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>일정 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>일정 유형</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        {["행사", "회의", "위원회", "기타"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 부서</label>
                      <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>시작일시 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>종료일시 (일자)</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>장소</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 대학 본부 대회의실" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                </>
              )}

              {/* 행사 일정 입력 */}
              {modalType === "event" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>행사 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: RISE 지산학 공동 취업 박람회" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구분 월</label>
                      <select name="month" value={formData.month} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map(m => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>담당 부서(센터)</label>
                      <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="예: ECC센터 / G-VET팀" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>일시 (상세)</label>
                      <input type="text" name="datetime" value={formData.datetime} onChange={handleInputChange} placeholder="예: 2026.07.25 13:00~" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 체육관 특설 돔" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 내부 교수 및 연구원 15명" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 지자체 관계자 5명" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 지역 정착 지원 프로그램" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>행사 목적</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="행사를 통해 도달하고자 하는 목표 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>행사 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="수료 인원, 산출된 최종 성과 및 보도 내역" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 회의 일정 입력 */}
              {modalType === "meeting" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>회의 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 제2차 ICC 센터 공동 운영 회의" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>회의 대분류</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        <option value="operating">사업단 운영회의</option>
                        <option value="center">센터별 회의</option>
                        <option value="committee">각종 위원회 회의</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구분 월</label>
                      <select name="month" value={formData.month} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map(m => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>일시 (상세)</label>
                      <input type="text" name="datetime" value={formData.datetime} onChange={handleInputChange} placeholder="예: 2026.07.19 14:00" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: ICC 센터장실" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 전담 교수 3명" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 자문위원 2명" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>회의 의제 (안건)</label>
                    <textarea name="agenda" value={formData.agenda} onChange={handleInputChange} placeholder="회의에서 중점적으로 다룬 의제 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>회의 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="결정된 결의 사항 및 향후 조치 내역" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setEditingItemId(null);
                  }}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color-dark)", color: "white", cursor: "pointer" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
                >
                  {isEditMode ? "수정 완료" : "새 등록 완료"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
