import React from "react";
import ProgramProgressManager from "../../../components/ProgramProgressManager";
import type { ProgramProgressManagerProps } from "../../../components/ProgramProgressManager";
import type { ProjectData } from "../../../data/mockData";

const MajorProgramsManager = React.lazy(
  () => import("../../../components/MajorProgramsManager")
);
const SatisfactionManager = React.lazy(
  () => import("../../../components/SatisfactionManager")
);

type ProgressScreenProps = {
  progressSubTab: string;
  setProgressSubTab: (subTab: string) => void;
  projects: ProjectData[];
  selectedYear: number;
  darkMode: boolean;
  onUpdateProgramDetails:
    ProgramProgressManagerProps["onUpdateProgramDetails"];
  onSelectProgram:
    NonNullable<ProgramProgressManagerProps["onSelectProgram"]>;
};

export const ProgressScreen = ({
  progressSubTab,
  setProgressSubTab,
  projects,
  selectedYear,
  darkMode,
  onUpdateProgramDetails,
  onSelectProgram
}: ProgressScreenProps) => (
  <div className="progress-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    {/* 프로그램 진행 본문 가로 탭바 헤더 */}
    <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
      <button
        onClick={() => setProgressSubTab("progress_status")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: progressSubTab === "progress_status" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: progressSubTab === "progress_status" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        프로그램 진행 상황
      </button>
      <button
        onClick={() => setProgressSubTab("major_programs")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: progressSubTab === "major_programs" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: progressSubTab === "major_programs" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        주요 프로그램
      </button>
      <button
        onClick={() => setProgressSubTab("satisfaction_survey")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: progressSubTab === "satisfaction_survey" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: progressSubTab === "satisfaction_survey" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        만족도 조사
      </button>
    </div>

    {/* 본문 콘텐츠 스위칭 */}
    {progressSubTab === "progress_status" ? (
      <ProgramProgressManager
        projects={projects}
        selectedYear={selectedYear}
        darkMode={darkMode}
        onUpdateProgramDetails={onUpdateProgramDetails}
        onSelectProgram={onSelectProgram}
      />
    ) : progressSubTab === "major_programs" ? (
      <React.Suspense fallback={null}>
        <MajorProgramsManager
          key={`major-prog-${darkMode}-${selectedYear}`}
          selectedYear={selectedYear}
        />
      </React.Suspense>
    ) : (
      <React.Suspense fallback={null}>
        <SatisfactionManager
          key={`satisfaction-${darkMode}`}
          selectedYear={selectedYear}
        />
      </React.Suspense>
    )}
  </div>
);
