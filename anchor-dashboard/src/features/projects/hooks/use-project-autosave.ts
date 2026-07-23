import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getCleanProjectsForStorage } from "../../../app/app-data-utils";
import type { LegacyAppRecord } from "../../../app/app-types";
import { upsertProjectData } from "../services/project-data-service";

type ProjectAutosaveOptions = {
  projects: LegacyAppRecord[];
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedProjectsRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

export const useProjectAutosave = ({
  projects,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedProjectsRef,
  safeSetLocalStorage,
  setSyncStatus
}: ProjectAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;

    // 원격 fetch 직후의 동일 데이터는 다시 업로드하지 않고 캐시만 갱신합니다.
    const currentCleanStr = JSON.stringify(
      getCleanProjectsForStorage(projects)
    );
    if (
      !fetchedProjectsRef.current ||
      fetchedProjectsRef.current === currentCleanStr
    ) {
      safeSetLocalStorage(
        `anchor_cache_proj_y${selectedYear}_v56`,
        currentCleanStr,
        selectedYear
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_proj_y${selectedYear}_v56`,
      currentCleanStr,
      selectedYear
    );
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const { error } = await upsertProjectData(
          selectedYear,
          projects,
          new Date().toISOString()
        );
        if (error) throw error;

        fetchedProjectsRef.current = currentCleanStr;
        setSyncStatus("synced");
      } catch {
        setSyncStatus("error");
      }
    }, 500);
    return () => clearTimeout(timer);
  // oxlint-disable-next-line react/exhaustive-deps -- project changes and load guards own autosave; user or role restoration must not enqueue a database write.
  }, [projects, selectedYear, isDbLoaded, isFetchCompleted]);
};
