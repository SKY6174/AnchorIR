import type React from "react";
import ScheduleManager from "../../../components/ScheduleManager";
import type { CommitteeMember, CurrentUser } from "../../../components/CommitteeManager";

interface CommitteeRosterTabProps {
  allMembers?: CommitteeMember[];
  currentRole?: any;
  currentUser?: CurrentUser;
  darkMode?: boolean;
  eventSchedules?: any[];
  meetingSchedules?: any[];
  monthlySchedules?: any[];
  onChangeSubTab?: (subTab: string) => void;
  pressReleases?: any[];
  selectedYear?: number | string;
  setEventSchedules?: React.Dispatch<React.SetStateAction<any[]>>;
  setMeetingSchedules?: React.Dispatch<React.SetStateAction<any[]>>;
  setMonthlySchedules?: React.Dispatch<React.SetStateAction<any[]>>;
  setPressReleases?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function CommitteeRosterTab({
  allMembers,
  currentRole,
  currentUser,
  darkMode,
  eventSchedules,
  meetingSchedules,
  monthlySchedules,
  onChangeSubTab,
  pressReleases,
  selectedYear,
  setEventSchedules,
  setMeetingSchedules,
  setMonthlySchedules,
  setPressReleases
}: CommitteeRosterTabProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
          <ScheduleManager
            key={`schedule-committee-integrated-${darkMode}-${selectedYear}`}
            currentUser={currentUser}
            currentRole={currentRole}
            selectedYear={selectedYear}
            darkMode={darkMode}
            subTab="committees"
            onChangeSubTab={onChangeSubTab}
            monthlySchedules={monthlySchedules}
            setMonthlySchedules={setMonthlySchedules}
            eventSchedules={eventSchedules}
            setEventSchedules={setEventSchedules}
            meetingSchedules={meetingSchedules}
            setMeetingSchedules={setMeetingSchedules}
            pressReleases={pressReleases}
            setPressReleases={setPressReleases}
            members={allMembers}
          />
        </div>
  );
}
