import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";

export const useJointProgramDetection = (
  projects: LegacyAppRecord[],
  selectedYear: number,
  setJointPrograms: Dispatch<
    SetStateAction<Record<string, boolean>>
  >
) => {
  useEffect(() => {
    if (!projects || !Array.isArray(projects)) return;

    const initialJoint: Record<string, boolean> = {};
    projects.forEach((project) => {
      if (project.units && Array.isArray(project.units)) {
        project.units.forEach((unit: LegacyAppRecord) => {
          if (unit.programs && Array.isArray(unit.programs)) {
            unit.programs.forEach((program: LegacyAppRecord) => {
              const currentValue =
                program.assignees?.[selectedYear] !== undefined
                  ? program.assignees[selectedYear]
                  : (program.assignee || "");
              if (
                currentValue &&
                (currentValue.includes(",") || currentValue.includes("/"))
              ) {
                initialJoint[program.id] = true;
              }
            });
          }
        });
      }
    });
    setJointPrograms((previous) => ({ ...initialJoint, ...previous }));
  }, [projects, selectedYear, setJointPrograms]);
};

export const useProjectFetchReset = (
  selectedYear: number,
  setIsFetchCompleted: (completed: boolean) => void,
  fetchedProjectsRef: { current: string }
) => {
  useEffect(() => {
    setIsFetchCompleted(false);
    fetchedProjectsRef.current = "";
  }, [selectedYear, setIsFetchCompleted, fetchedProjectsRef]);
};
