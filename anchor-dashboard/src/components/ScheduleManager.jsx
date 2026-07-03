import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  FileText, Award, Layers, Plus, CheckCircle, Info, ChevronLeft, ChevronRight
} from "lucide-react";

export default function ScheduleManager({ currentRole, selectedYear, subTab, onChangeSubTab }) {
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("monthly"); // "monthly", "event", "meeting"

  // 캘린더 월 상태 (2026년 7월 기준)
  const [currentMonth, setCurrentMonth] = useState(7); // 7월
  const [selectedDay, setSelectedDay] = useState(15); // 디폴트 선택 일자

  // 행사 및 회의 월 선택 상태
  const [selectedEventMonth, setSelectedEventMonth] = useState(7); // 7월
  const [selectedMeetingMonth, setSelectedMeetingMonth] = useState(7); // 7월

  // 회의 대분류 상태 ("operating": 사업단 운영회의, "center": 센터별 회의, "committee": 각종 위원회 회의)
  const [activeMeetingCat, setActiveMeetingCat] = useState("operating");

  // 1. 월간 일정 기본 목업 데이터
  const [monthlySchedules, setMonthlySchedules] = useState([
    { id: 1, date: "2026-07-10", title: "사업단 정기 운영 회의", time: "14:00", location: "본관 3층 소회의실" },
    { id: 2, date: "2026-07-15", title: "하이퍼 팩토리 시공 준공 검수", time: "10:00", location: "동부캠퍼스 3공학관 204호" },
    { id: 3, date: "2026-07-24", title: "현장 안전진단 컨설팅 용역 품의 결재", time: "16:00", location: "온라인 결재 시스템" },
    { id: 4, date: "2026-07-28", title: "RISE 사업 주간 성과 중간 점검회", time: "11:00", location: "ECC센터 회의룸" },
    { id: 5, date: "2026-08-05", title: "지역 산업 안전 보건 지수 위원회", time: "15:00", location: "울산 시청 의사당" }
  ]);

  // 2. 행사 일정 목업 데이터
  const [eventSchedules, setEventSchedules] = useState([
    {
      id: 1,
      month: 7,
      title: "울산형 RISE 앵커 사업단 출범 페스티벌",
      department: "ECC센터 / 사업운영팀",
      datetime: "2026-07-12 14:00 - 18:00",
      location: "울산과학대학교 동부캠퍼스 대강당 및 아산홀",
      attendeesInternal: "사업단장, 총괄본부장, 각 센터장 및 실무 책임연구원 45명",
      attendeesExternal: "울산광역시 시장, 시의회 의장, 협력 중견/중소기업 대표 30명",
      program: "지역 맞춤형 인재 육성 교과 혁신 선포 및 거버넌스 킥오프",
      purpose: "RISE 사업의 성과 목표와 대학-기업-지자체 3자 동맹의 유기적 협력 비전 대외 선언",
      result: "울산형 지산학 연동 선언서 공동 서명 완료 및 지역 언론 보도 5건 성료"
    },
    {
      id: 2,
      month: 7,
      title: "U-LIFE 평생직업교육 재직자 드론 정밀 제어 단기 실무 워크숍",
      department: "RCC센터 LIFE교육팀",
      datetime: "2026-07-20 09:00 - 17:00",
      location: "서부캠퍼스 실습 드론 교육장 및 2공학관 301호",
      attendeesInternal: "드론전공 지도교수 3명, 연구원 5명",
      attendeesExternal: "울산 지역 조선/물류 협력업체 재직근로자 18명",
      program: "U-LIFE 평생직업교육 플랫폼 활성화 프로그램",
      purpose: "조선 산업 혁신을 위한 무인 자율 이동 기술의 재직자 정밀 직무 업스킬링",
      result: "수료 인원 18명 전원 단기 직무 기술 이수증 발급 완료 및 만족도 조사 94.2점 달성"
    },
    {
      id: 3,
      month: 8,
      title: "고분자 신소재 공동 기기 사용성 강화 기업 매칭 간담회",
      department: "ICC센터 R&BD지원팀",
      datetime: "2026-08-11 15:00",
      location: "화학공학과 세미나실",
      attendeesInternal: "김기범 ICC센터장, 전담 교수 4명",
      attendeesExternal: "울산 정밀화학 단지 입주 8개사 연구개발 팀장",
      program: "중소·중견기업 맞춤형 기술지원 활성화",
      purpose: "대학 내 특수 크로마토그래피 등 핵심 공유 연구 장비의 사용성 확대 협의",
      result: "차기 월간 공동 분석 장비 예약 스케줄표 합의 완료"
    }
  ]);

  // 3. 회의 일정 목업 데이터
  const [meetingSchedules, setMeetingSchedules] = useState([
    {
      id: 1,
      month: 7,
      category: "operating", // operating, center, committee
      title: "제4차 사업단 운영위원회 정기 주간 의사록",
      datetime: "2026-07-10 14:00 - 16:00",
      location: "본관 3층 소회의실",
      attendeesInternal: "송경영 사업단장, 김현수 총괄본부장, 센터장 전원",
      attendeesExternal: "배석 외부 평가 위원 1명 (자문역)",
      agenda: "2차년도 이월예산 8월 말 반납 마감 관련 각 단위과제별 집행 가속화 대책 수립 건",
      result: "미집행률이 높은 3개 단위과제에 대해 이월예산을 우선 집행하도록 실무 독려하고 부득이한 반납 최소화 지침 의결"
    },
    {
      id: 2,
      month: 7,
      category: "center",
      title: "ECC센터 하이퍼교육 실무 프로그램 기획 긴급 회의",
      datetime: "2026-07-18 10:30",
      location: "ECC센터 소통라운지",
      attendeesInternal: "이동은 ECC센터장, 장광일 교수, 이은주 선임연구원, 정자윤 연구원",
      attendeesExternal: "없음 (내부 실무 회의)",
      agenda: "UC-HYPER 교과과정 개편을 위한 자문 위원 3인의 1차 피드백 검토 및 수정안 마련",
      result: "교직원 역량강화 세부 프로그램 추진 일정을 당초 8월 말에서 8월 중순으로 앞당겨 개최하기로 확정"
    },
    {
      id: 3,
      month: 7,
      category: "committee",
      title: "울산 남구 늘봄 생태계 조성 늘봄 자문 심의위원회",
      datetime: "2026-07-22 15:00",
      location: "서부캠퍼스 산학협력 대회의실",
      attendeesInternal: "홍광표 울산늘봄누리센터장, 황수진 선임연구원",
      attendeesExternal: "울산교육청 장학사 1명, 남구 초등학교 교감 2명, 외부 교육 전문가 2명",
      agenda: "방과 후 늘봄 연계 전문 인프라 시범 적용 프로그램 운영 모델 심의",
      result: "남구 소재 3개 초등학교 시범 사업 적용안을 최종 승인함 (가결)"
    }
  ]);

  // 4. 입력 폼 임시 State
  const [formData, setFormData] = useState({
    title: "",
    date: "2026-07-15",
    time: "10:00",
    location: "",
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

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalType === "monthly") {
      const newItem = {
        id: Date.now(),
        date: formData.date,
        title: formData.title || "새 일정",
        time: formData.time || "12:00",
        location: formData.location || "-"
      };
      setMonthlySchedules([newItem, ...monthlySchedules]);
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
    setFormData({
      title: "",
      date: "2026-07-15",
      time: "10:00",
      location: "",
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
      const dateString = `2026-07-${day < 10 ? "0" + day : day}`;
      const daySchedules = monthlySchedules.filter(s => s.date === dateString);
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
            {daySchedules.map(sched => (
              <div 
                key={sched.id} 
                style={{
                  fontSize: "0.65rem",
                  background: "var(--accent-color)",
                  color: "white",
                  padding: "0.1rem 0.25rem",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden"
                }}
                title={sched.title}
              >
                {sched.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  const getSelectedDaySchedules = () => {
    const dateString = `2026-07-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`;
    return monthlySchedules.filter(s => s.date === dateString);
  };

  return (
    <div className="schedule-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. 월간 일정 */}
      {subTab === "monthly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                📅 월간 학사 및 사업단 일정 캘린더
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                주요 마감일정, 장비 검수, 보고서 제출 기한 등을 캘린더 형태로 일괄 체크
              </p>
            </div>
            
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
                  {getSelectedDaySchedules().map(sched => (
                    <div 
                      key={sched.id} 
                      style={{
                        padding: "0.75rem", borderRadius: "6px",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)"
                      }}
                    >
                      <strong style={{ fontSize: "0.9rem", color: "white", display: "block", marginBottom: "0.25rem" }}>
                        {sched.title}
                      </strong>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={12} />
                          {sched.time}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <MapPin size={12} />
                          {sched.location}
                        </span>
                      </div>
                    </div>
                  ))}
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
                ➕ {modalType === "monthly" ? "새 일반 일정 등록" : modalType === "event" ? "새 행사 일정 기획 등록" : "새 회의 일정 회의록 등록"}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary-dark)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 월간 일정 입력 */}
              {modalType === "monthly" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>일정 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>일자</label>
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>시간</label>
                      <input type="time" name="time" value={formData.time} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
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
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color-dark)", color: "white", cursor: "pointer" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
                >
                  새 등록 완료
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
