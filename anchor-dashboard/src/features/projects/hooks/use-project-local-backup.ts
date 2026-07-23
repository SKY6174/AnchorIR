import { useEffect } from "react";
import { getCleanProjectsForStorage } from "../../../app/app-data-utils";
import type { LegacyAppRecord } from "../../../app/app-types";

const PROJECT_BACKUP_KEY = "anchor_projects_data_v56";

type StorageErrorRecord = {
  name?: string;
  code?: number;
  number?: number;
};

export const useProjectLocalBackup = (projects: LegacyAppRecord[]) => {
  useEffect(() => {
    try {
      localStorage.setItem(
        PROJECT_BACKUP_KEY,
        JSON.stringify(getCleanProjectsForStorage(projects))
      );
    } catch (error) {
      const storageError = error as StorageErrorRecord;
      const isQuotaError =
        storageError.name === "QuotaExceededError" ||
        storageError.code === 22 ||
        storageError.number === -2147024882;

      if (isQuotaError) {
        console.warn(
          "로컬 스토리지 공간이 부족합니다. 이전 구버전 캐시를 청소하고 재시도합니다..."
        );
        try {
          Object.keys(localStorage).forEach((key) => {
            if (
              key.startsWith("anchor_projects_data_") &&
              key !== PROJECT_BACKUP_KEY
            ) {
              localStorage.removeItem(key);
            }
            if (key.startsWith("anchor_cache_proj_")) {
              localStorage.removeItem(key);
            }
          });
          localStorage.setItem(
            PROJECT_BACKUP_KEY,
            JSON.stringify(getCleanProjectsForStorage(projects))
          );
          console.log("이전 캐시 청소 및 데이터 재저장 성공");
        } catch (retryError) {
          console.error(
            "이전 캐시 QR 청소 후에도 로컬 스토리지 기입 실패:",
            retryError
          );
        }
      } else {
        console.error(
          "로컬 스토리지 기입 중 알 수 없는 예외 발생:",
          error
        );
      }
    }
  }, [projects]);
};
