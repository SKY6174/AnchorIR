import React from "react";
import type { ScheduleManagerProps } from "../../../components/ScheduleManager";

const ScheduleManager = React.lazy(
  () => import("../../../components/ScheduleManager")
);

type ScheduleScreenProps = ScheduleManagerProps & {
  subTab: string;
  onChangeSubTab: (subTab: string) => void;
};

export const ScheduleScreen = ({
  currentUser,
  currentRole,
  selectedYear,
  darkMode,
  subTab,
  onChangeSubTab,
  monthlySchedules,
  setMonthlySchedules,
  eventSchedules,
  setEventSchedules,
  meetingSchedules,
  setMeetingSchedules,
  pressReleases,
  setPressReleases,
  members
}: ScheduleScreenProps) => (
  <div className="schedule-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    {/* 일정 관리 본문 가로 탭바 헤더 */}
    <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
      <button
        onClick={() => onChangeSubTab("monthly")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "monthly" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "monthly" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        월간 일정
      </button>
      <button
        onClick={() => onChangeSubTab("events")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "events" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "events" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        주요 행사
      </button>
      <button
        onClick={() => onChangeSubTab("meetings")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "meetings" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "meetings" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        회의결과 등록
      </button>

      <button
        onClick={() => onChangeSubTab("press")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "press" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "press" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        언론보도
      </button>
    </div>

    {/* 본문 콘텐츠 */}
    <React.Suspense fallback={null}>
      <ScheduleManager
        key={`schedule-${darkMode}-${selectedYear}`}
        currentUser={currentUser}
        currentRole={currentRole}
        selectedYear={selectedYear}
        darkMode={darkMode}
        subTab={subTab}
        onChangeSubTab={onChangeSubTab}
        monthlySchedules={monthlySchedules}
        setMonthlySchedules={setMonthlySchedules}
        eventSchedules={eventSchedules}
        setEventSchedules={setEventSchedules}
        meetingSchedules={meetingSchedules}
        setMeetingSchedules={setMeetingSchedules}
        pressReleases={pressReleases}
        setPressReleases={setPressReleases}
        members={members}
      />
    </React.Suspense>
  </div>
);
