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
  setMeetingSchedules,
  members = []
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
                dept: isDeadlineVal ? "사업운영팀" : (formData.dept || "사업운영팀"),
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
          dept: isDeadlineVal ? "사업운영팀" : (formData.dept || "사업운영팀"),
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
      // 3) 일자가 입력되면 자동으로 해당월 추출 (예: 2026-07-25 -> 7)
      const extractedMonth = formData.eventDate ? parseInt(formData.eventDate.split("-")[1], 10) : 7;
      
      // 4) 일자(캘린더 입력 YYYY-MM-DD), 시간(시작, 종료 개별 입력) 조합
      const combinedDatetime = `${formData.eventDate} ${formData.eventStartTime} ~ ${formData.eventEndTime}`;

      if (isEditMode) {
        setEventSchedules(eventSchedules.map(e => 
          e.id === editingItemId 
            ? {
                ...e,
                month: extractedMonth,
                title: formData.title || "새 행사",
                department: formData.department || "-",
                datetime: combinedDatetime,
                location: formData.location || "-",
                attendeesInternal: formData.attendeesInternal || "-",
                attendeesExternal: formData.attendeesExternal || "-",
                program: formData.program || "-",
                purpose: formData.purpose || "-",
                result: formData.result || "-"
              }
            : e
        ));
      } else {
        const newItem = {
          id: Date.now(),
          month: extractedMonth,
          title: formData.title || "새 행사 일정",
          department: formData.department || "-",
          datetime: combinedDatetime,
          location: formData.location || "-",
          attendeesInternal: formData.attendeesInternal || "-",
          attendeesExternal: formData.attendeesExternal || "-",
          program: formData.program || "-",
          purpose: formData.purpose || "-",
          result: formData.result || "-"
        };
        setEventSchedules([newItem, ...eventSchedules]);
      }
    } else if (modalType === "meeting") {
      // 입력된 회의 일자에서 자동으로 월 추출
      const extractedMonth = formData.meetingDate ? parseInt(formData.meetingDate.split("-")[1], 10) : 7;
      
      // 일자(YYYY-MM-DD)와 시작/종료 시간을 결합하여 datetime 문자열 조합
      const combinedDatetime = `${formData.meetingDate} ${formData.meetingStartTime} ~ ${formData.meetingEndTime}`;

      // 작성자 및 부서 정보를 attendeesExternal에 조합하여 저장 (하위호환성 유지)
      const combinedAttendeesExternal = `작성자: ${formData.writer || "작성자 미정"} | 부서: ${formData.dept || "부서 미정"}`;

      // 의제 목록을 줄바꿈으로 묶어서 저장
      const combinedAgenda = (formData.agendaList || []).filter(Boolean).join("\n");

      if (isEditMode) {
        setMeetingSchedules(meetingSchedules.map(m => 
          m.id === editingItemId
            ? {
                ...m,
                month: extractedMonth,
                category: formData.category,
                title: formData.title || "새 회의록",
                datetime: combinedDatetime,
                location: formData.location || "-",
                attendeesInternal: formData.attendees || "-",
                attendeesExternal: combinedAttendeesExternal,
                agenda: combinedAgenda || "-",
                result: formData.result || "-"
              }
            : m
        ));
      } else {
        const newItem = {
          id: Date.now(),
          month: extractedMonth,
          category: formData.category,
          title: formData.title || "새 회의록",
          datetime: combinedDatetime,
          location: formData.location || "-",
          attendeesInternal: formData.attendees || "-",
          attendeesExternal: combinedAttendeesExternal,
          agenda: combinedAgenda || "-",
          result: formData.result || "-"
        };
        setMeetingSchedules([newItem, ...meetingSchedules]);
      }
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

  // 행사 및 결과 기획 삭제 핸들러
  const handleDeleteEvent = (id) => {
    if (window.confirm("선택한 행사 기획 및 결과 내역을 삭제하시겠습니까?")) {
      setEventSchedules(eventSchedules.filter(e => e.id !== id));
    }
  };

  // 행사 및 결과 기획 수정 모달 트리거
  const handleEditEvent = (event) => {
    setIsEditMode(true);
    setEditingItemId(event.id);
    setModalType("event");

    // datetime 파싱 ("2026-07-25 13:00 ~ 15:00" 형식)
    const dt = event.datetime || "";
    const parts = dt.split(" ");
    let eventDate = parts[0] || "2026-07-15";
    let eventStartTime = "10:00";
    let eventEndTime = "11:00";

    if (parts.length >= 4) {
      eventStartTime = parts[1] || "10:00";
      eventEndTime = parts[3] || "11:00";
    } else if (parts.length >= 2) {
      const timeParts = parts[1].split("~");
      eventStartTime = timeParts[0] || "10:00";
      eventEndTime = timeParts[1] || "11:00";
    }

    setFormData({
      title: event.title,
      type: "행사",
      dept: "사업운영팀",
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: event.location || "",
      noTime: false,
      month: event.month || 7,
      department: event.department || "",
      datetime: event.datetime || "",
      eventDate: eventDate,
      eventStartTime: eventStartTime,
      eventEndTime: eventEndTime,
      attendeesInternal: event.attendeesInternal || "",
      attendeesExternal: event.attendeesExternal || "",
      program: event.program || "",
      purpose: event.purpose || "",
      result: event.result || "",
      category: "operating",
      agenda: ""
    });
    setIsAddModalOpen(true);
  };

  // 회의록 삭제 핸들러
  const handleDeleteMeeting = (id) => {
    if (window.confirm("선택한 회의록을 삭제하시겠습니까?")) {
      setMeetingSchedules(meetingSchedules.filter(m => m.id !== id));
    }
  };

  // 회의록 수정 모달 트리거
  const handleEditMeeting = (meeting) => {
    setIsEditMode(true);
    setEditingItemId(meeting.id);
    setModalType("meeting");

    // datetime 파싱 ("2026-07-25 13:00 ~ 15:00" 형식)
    const dt = meeting.datetime || "";
    const parts = dt.split(" ");
    let meetingDate = parts[0] || "2026-07-15";
    let meetingStartTime = "10:00";
    let meetingEndTime = "11:00";

    if (parts.length >= 4) {
      meetingStartTime = parts[1] || "10:00";
      meetingEndTime = parts[3] || "11:00";
    } else if (parts.length >= 2) {
      const timeParts = parts[1].split("~");
      meetingStartTime = timeParts[0] || "10:00";
      meetingEndTime = timeParts[1] || "11:00";
    }

    // 작성자 및 부서 파싱
    const ext = meeting.attendeesExternal || meeting.attendees_external || "";
    let writer = "박지현 팀장";
    let dept = "사업운영팀";
    if (ext.includes("작성자:") && ext.includes("부서:")) {
      const p = ext.split("|");
      writer = p[0] ? p[0].replace("작성자:", "").trim() : "박지현 팀장";
      dept = p[1] ? p[1].replace("부서:", "").trim() : "사업운영팀";
    }

    // 의제 목록 파싱 (줄바꿈 구분)
    const agendaStr = meeting.agenda || "";
    const agendaList = agendaStr ? agendaStr.split("\n") : [""];

    setFormData({
      title: meeting.title,
      type: "회의",
      dept: dept,
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: meeting.location || "",
      noTime: false,
      month: meeting.month || 7,
      department: dept,
      datetime: meeting.datetime || "",
      meetingDate: meetingDate,
      meetingStartTime: meetingStartTime,
      meetingEndTime: meetingEndTime,
      writer: writer,
      attendees: meeting.attendeesInternal || meeting.attendees_internal || "",
      agendaList: agendaList,
      category: meeting.category || "operating",
      result: meeting.result || ""
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = (type) => {
    setModalType(type);
    setIsEditMode(false);
    setEditingItemId(null);

    // 현재 선택된 행사 월에 맞춰 기본 날짜 세팅
    const formattedMonth = selectedEventMonth < 10 ? `0${selectedEventMonth}` : selectedEventMonth;
    const defaultEventDate = `2026-${formattedMonth}-15`;

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
      month: selectedEventMonth,
      department: "ECC센터",
      datetime: "",
      eventDate: defaultEventDate,
      eventStartTime: "10:00",
      eventEndTime: "11:00",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: "",
      // 회의록용 추가
      meetingDate: defaultEventDate,
      meetingStartTime: "10:00",
      meetingEndTime: "11:00",
      writer: (() => {
        const activeWriters = (members || []).filter(m => 
          m.status !== "미참여" && 
          m.email && 
          (m.role === "운영팀장" || m.grade === "책임연구원" || m.grade === "선임연구원" || m.grade === "연구원")
        );
        if (activeWriters.length > 0) {
          const first = activeWriters[0];
          const titleOrGrade = first.role === "운영팀장" ? "운영팀장" : (first.grade || "연구원");
          return `${first.name} ${titleOrGrade}`.trim();
        }
        return "박지현 팀장";
      })(),
      attendees: "",
      agendaList: [""]
    });
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

    // 빈 셀 채우기 (라이트/다크모드 유동적 border 적용 및 최소 높이 확보)
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ minHeight: "85px", height: "auto", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)" }}></div>);
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
            minHeight: "85px",
            height: "auto",
            padding: "0.25rem 0.25rem 0.4rem 0.25rem",
            borderBottom: "1px solid var(--border-color)",
            borderRight: "1px solid var(--border-color)",
            background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s ease",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isSelected ? "var(--accent-color)" : "var(--text-primary)" }}>
            {day}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem", maxHeight: "115px", overflowY: "auto", flex: 1, scrollbarWidth: "none" }}>
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
          
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📅 앵커사업단 월간 일정
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                주요 마감일정, 장비 검수, 보고서 제출 기한 등을 캘린더 형태로 일괄 체크
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                className="btn btn-primary"
                onClick={() => openAddModal("monthly")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "var(--accent-color)", border: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                <Plus size={16} />
                일정 추가
              </button>
              <button 
                onClick={() => openAddModal("task")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "#8B5CF6", border: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
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
                  background: "#EF4444", border: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
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
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
              
              {/* 캘린더 월 조작용 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    2026년
                  </span>
                  <span style={{ fontSize: "1.45rem", fontWeight: "900", color: "var(--accent-color)" }}>
                    {currentMonth}월
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
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
                              color: "var(--text-primary)", 
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
                              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                              onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSchedule(sched.id)}
                              title="삭제"
                              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                              onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
      )}

      {/* 2. 행사 일정 */}
      {subTab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 행사 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                ✨ 앵커 사업단 주요 행사 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
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
              행사 기획 및 결과 등록
            </button>
          </div>

          {/* 💡 월별 가로 탭바 헤더 */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedEventMonth(m)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
                  background: selectedEventMonth === m ? "var(--accent-color)" : "transparent",
                  color: selectedEventMonth === m ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                {m === 3 ? "'26.3월" : m === 1 ? "'27.1월" : `${m}월`}
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
                  style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", fontWeight: "700" }}>
                      소속부서: {event.department}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}>
                        <Clock size={14} />
                        {event.datetime}
                      </span>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        title="수정"
                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        title="삭제"
                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                        onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {event.title}
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>📍 행사 장소</span>
                        <strong>{event.location}</strong>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (내부)</span>
                          <span>{event.attendeesInternal}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (외부)</span>
                          <span>{event.attendeesExternal}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>🔗 연계 프로그램</span>
                        <span>{event.program}</span>
                      </div>
                      
                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>🎯 행사 목적</span>
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
              <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
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
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                👥 의사 결정 정기 회의 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
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
              회의록 등록
            </button>
          </div>

          {/* 월별 선택 가로바 */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMeetingMonth(m)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
                  background: selectedMeetingMonth === m ? "var(--accent-color)" : "transparent",
                  color: selectedMeetingMonth === m ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                {m === 3 ? "'26.3월" : m === 1 ? "'27.1월" : `${m}월`}
              </button>
            ))}
          </div>

          {/* 회의 대분류 가로 단추 (운영회의, 센터회의, 위원회) */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.2rem" }}>
            <button
              onClick={() => setActiveMeetingCat("operating")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "operating" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "operating" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              사업단 운영회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("center")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "center" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "center" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              센터별 회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("committee")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "committee" ? "var(--accent-color)" : "var(--text-secondary)",
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
                  style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  {/* 작성자, 관련부서 정보 동적 파싱 로직 */}
                  {(() => {
                    const ext = meeting.attendeesExternal || meeting.attendees_external || "";
                    let writer = "작성자 미정";
                    let dept = "사업운영팀";
                    let isCustomFormatted = false;

                    if (ext.includes("작성자:") && ext.includes("부서:")) {
                      isCustomFormatted = true;
                      const parts = ext.split("|");
                      writer = parts[0] ? parts[0].replace("작성자:", "").trim() : "작성자 미정";
                      dept = parts[1] ? parts[1].replace("부서:", "").trim() : "사업운영팀";
                    }

                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "700" }}>
                              소속부서: {isCustomFormatted ? dept : "사업운영팀"}
                            </span>
                            <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontWeight: "700" }}>
                              작성자: {isCustomFormatted ? writer : "박지현 팀장"}
                            </span>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}>
                              <Clock size={14} />
                              {meeting.datetime}
                            </span>
                            <button 
                              onClick={() => handleEditMeeting(meeting)}
                              title="수정"
                              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                              onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              title="삭제"
                              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                              onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                          {meeting.title}
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            
                            {isCustomFormatted ? (
                              <div>
                                <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>👥 참석자</span>
                                <strong>{meeting.attendeesInternal || meeting.attendees_internal}</strong>
                              </div>
                            ) : (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                <div>
                                  <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (내부)</span>
                                  <span>{meeting.attendeesInternal}</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (외부)</span>
                                  <span>{meeting.attendeesExternal}</span>
                                </div>
                              </div>
                            )}

                            <div>
                              <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>📝 회의 의제 (주요 안건)</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.1rem 0 0 0" }}>
                                {meeting.agenda && meeting.agenda.split("\n").filter(Boolean).map((agendaItem, idx) => (
                                  <span key={idx} style={{ display: "block", lineHeight: "1.3" }}>
                                    • {agendaItem}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <span style={{ color: "var(--text-secondary)", display: "block" }}>📍 회의 장소</span>
                              <strong>{meeting.location}</strong>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                              <span style={{ color: "#60A5FA", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <CheckCircle size={14} />
                                회의 결정 결과
                              </span>
                              <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>{meeting.result}</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => alert("🎙️ PLAUD 음성 녹음 및 AI 회의록 자동 요약 기능 연동 데모\n\n향후 PLAUD 디바이스 및 API와 실시간 동기화하여, 회의 음성 녹음본이 업로드되면 AI가 발화자별 텍스트 변환(STT) 및 핵심 결정을 자동으로 요약하여 이 회의록에 자동으로 채워주는 스마트 기능이 활성화될 예정입니다.")}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                padding: "0.35rem", borderRadius: "6px", background: "rgba(139, 92, 246, 0.15)",
                                border: "1px solid rgba(139, 92, 246, 0.3)", color: "#C084FC", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer"
                              }}
                            >
                              🎙️ PLAUD 녹음 자동 연동 (베타 예정)
                            </button>
                          </div>

                        </div>
                      </>
                    );
                  })()}
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
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
          <div className="card" style={{ width: "600px", maxHeight: "85vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {isEditMode 
                  ? (modalType === "deadline" ? "✏️ 마감일 수정" : modalType === "task" ? "✏️ 할일 수정" : modalType === "event" ? "✏️ 행사 기획 및 결과 수정" : modalType === "meeting" ? "✏️ 회의록 수정" : "✏️ 일반 일정 수정") 
                  : (modalType === "monthly" ? "➕ 새 일반 일정 등록" : modalType === "task" ? "➕ 새 할일 등록" : modalType === "deadline" ? "🚨 새 마감일 등록" : modalType === "event" ? "➕ 새 행사 기획 및 결과 등록" : modalType === "meeting" ? "➕ 새 회의록 등록" : "➕ 새 회의 일정 회의록 등록")}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditMode(false);
                  setEditingItemId(null);
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 마감일 입력 */}
              {modalType === "deadline" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 RISE 최종 계획서 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감 기한 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>마감 시간</label>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
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
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: formData.noTime ? "rgba(255,255,255,0.2)" : "white", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1, colorScheme: "dark" }} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 할일 입력 */}
              {modalType === "task" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 결과 보고서 작성 및 결재 요청" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                    <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                      {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 일자</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>할일 시간</label>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
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
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: formData.noTime ? "rgba(255,255,255,0.2)" : "white", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1, colorScheme: "dark" }} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 월간 일정 입력 */}
              {modalType === "monthly" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 유형</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["행사", "회의", "위원회", "기타"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                      <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작일시 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료일시 (일자)</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 대학 본부 대회의실" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                </>
              )}

              {/* 행사 일정 입력 */}
              {modalType === "event" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: RISE 지산학 공동 취업 박람회" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>담당 부서(센터)</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 체육관 특설 돔" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  
                  {/* 일자 및 시작/종료시간 개별 입력 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 일자</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="eventStartTime" value={formData.eventStartTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="eventEndTime" value={formData.eventEndTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 내부 교수 및 연구원 15명" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 지자체 관계자 5명" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 지역 정착 지원 프로그램" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 목적</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="행사를 통해 도달하고자 하는 목표 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="수료 인원, 산출된 최종 성과 및 보도 내역" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 회의 일정 입력 */}
              {modalType === "meeting" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 제2차 ICC 센터 공동 운영 회의" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 대분류</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        <option value="operating">사업단 운영회의</option>
                        <option value="center">센터별 회의</option>
                        <option value="committee">각종 위원회 회의</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: ICC 센터장실" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>

                  {/* 회의 일시 개별 입력 필드 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 일자</label>
                      <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="meetingStartTime" value={formData.meetingStartTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="meetingEndTime" value={formData.meetingEndTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>

                  {/* 관련 부서 및 작성자 드롭다운 배치 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                      <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>작성자</label>
                      <select name="writer" value={formData.writer} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {(() => {
                          const activeWriters = (members || []).filter(m => 
                            m.status !== "미참여" && 
                            m.email && 
                            (m.role === "운영팀장" || m.grade === "책임연구원" || m.grade === "선임연구원" || m.grade === "연구원")
                          );
                          if (activeWriters.length > 0) {
                            return activeWriters.map(m => {
                              const titleOrGrade = m.role === "운영팀장" ? "운영팀장" : (m.grade || "연구원");
                              const displayName = `${m.name} ${titleOrGrade}`.trim();
                              return (
                                <option key={m.id || m.email} value={displayName}>
                                  {displayName}
                                </option>
                              );
                            });
                          }
                          return ["박지현 팀장", "김민수 단장", "이진우 PD", "최성훈 PD", "한아름 PD"].map(w => (
                            <option key={w} value={w}>{w}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>

                  {/* 참석자 직접 입력 */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (직접 입력)</label>
                    <input type="text" name="attendees" value={formData.attendees} onChange={handleInputChange} placeholder="예: 박지현 팀장, 이진우 PD, 김현주 실무 위원 (총 3명)" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>

                  {/* 주요의제 동적 리스트 추가/삭제 폼 */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>주요 의제 (한 줄에 하나의 의제)</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {formData.agendaList && formData.agendaList.map((agenda, index) => (
                        <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
                          <input 
                            type="text" 
                            value={agenda} 
                            onChange={(e) => {
                              const newList = [...formData.agendaList];
                              newList[index] = e.target.value;
                              setFormData({ ...formData, agendaList: newList });
                            }}
                            placeholder={`의제 ${index + 1} (예: 2차년도 사업계획서 검토)`}
                            style={{ flex: 1, padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}
                          />
                          {formData.agendaList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newList = formData.agendaList.filter((_, idx) => idx !== index);
                                setFormData({ ...formData, agendaList: newList });
                              }}
                              style={{ padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#F87171", cursor: "pointer", fontWeight: "700" }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, agendaList: [...formData.agendaList, ""] })}
                        style={{ marginTop: "0.25rem", padding: "0.35rem 0.8rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px", color: "#60A5FA", cursor: "pointer", fontSize: "0.75rem", display: "inline-flex", alignSelf: "flex-start", fontWeight: "700" }}
                      >
                        + 의제 추가
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="결정된 결의 사항 및 향후 조치 내역" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
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
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer" }}
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
