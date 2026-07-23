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

export const useProjectNormalization = (
  projects: LegacyAppRecord[],
  setProjects: Dispatch<SetStateAction<LegacyAppRecord[]>>,
  normalizeProjects: (
    projects: LegacyAppRecord[]
  ) => LegacyAppRecord[]
) => {
  useEffect(() => {
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return;
    }

    const normalized = normalizeProjects(projects);
    if (JSON.stringify(projects) !== JSON.stringify(normalized)) {
      console.log(
        "♻️ [비즈니스 룰] 프로젝트 예산 다년도 동기화 및 A1나 예외 격리 정규화 규칙을 실행합니다."
      );
      setProjects(normalized);
    }
  // oxlint-disable-next-line react/exhaustive-deps -- project changes own normalization; render-local normalizer identity must not retrigger the effect.
  }, [projects]);
};
