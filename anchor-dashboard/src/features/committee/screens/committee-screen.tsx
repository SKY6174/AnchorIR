import CommitteeManager from "../../../components/CommitteeManager";
import type { CommitteeManagerProps } from "../../../components/CommitteeManager";

export const CommitteeScreen = ({
  currentRole,
  currentUser,
  activeSubTab,
  onChangeSubTab,
  darkMode,
  selectedYear,
  monthlySchedules,
  setMonthlySchedules,
  eventSchedules,
  setEventSchedules,
  meetingSchedules,
  setMeetingSchedules,
  pressReleases,
  setPressReleases,
  members
}: CommitteeManagerProps) => (
  <div className="committee-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    <CommitteeManager
      currentRole={currentRole}
      currentUser={currentUser}
      activeSubTab={activeSubTab}
      onChangeSubTab={onChangeSubTab}
      darkMode={darkMode}
      selectedYear={selectedYear}
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
  </div>
);
