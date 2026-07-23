import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import {
  deletePressReleasesByIds,
  fetchPressReleaseIds,
  insertPressRelease,
  insertPressReleases
} from "../services/press-release-service";

type PressReleaseAutosaveOptions = {
  pressReleases: LegacyAppRecord[];
  setPressReleases: Dispatch<SetStateAction<LegacyAppRecord[]>>;
  selectedYear: number;
  activeDataYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedPressReleasesRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

export const usePressReleaseAutosave = ({
  pressReleases,
  setPressReleases,
  selectedYear,
  activeDataYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedPressReleasesRef,
  safeSetLocalStorage,
  setSyncStatus
}: PressReleaseAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;

    const getCalculatedYearFromDate = (dateStr: string) => {
      if (!dateStr) return selectedYear;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return selectedYear;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let calculatedYear = year;
      if (month < 3) {
        calculatedYear = year - 1;
      }
      return calculatedYear === 2025
        ? 1
        : calculatedYear === 2026
          ? 2
          : calculatedYear === 2027
            ? 3
            : calculatedYear === 2028
              ? 4
              : calculatedYear === 2029
                ? 5
                : selectedYear;
    };

    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;
    if (activeDataYear !== selectedYear) return;

    if (
      JSON.stringify(pressReleases) === fetchedPressReleasesRef.current
    ) {
      return;
    }

    const isStaleState =
      pressReleases.length > 0 &&
      pressReleases.some((item) => item.year !== selectedYear);
    if (isStaleState) {
      return;
    }

    const otherYearPress = pressReleases.filter(
      (item) =>
        getCalculatedYearFromDate(item.broadcastDate) !== selectedYear
    );
    const currentYearPress = pressReleases.filter(
      (item) =>
        getCalculatedYearFromDate(item.broadcastDate) === selectedYear
    );

    safeSetLocalStorage(
      `anchor_cache_press_y${selectedYear}`,
      JSON.stringify(currentYearPress),
      selectedYear
    );
    setSyncStatus("syncing");

    const formatToPostgresTimestamp = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString();
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return new Date().toISOString();

      const pad = (value: number) => String(value).padStart(2, "0");
      const yyyy = parsed.getFullYear();
      const mm = pad(parsed.getMonth() + 1);
      const dd = pad(parsed.getDate());
      const hh = pad(parsed.getHours());
      const mi = pad(parsed.getMinutes());
      const ss = pad(parsed.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}+09`;
    };

    const syncPressImmediate = async () => {
      try {
        if (otherYearPress.length > 0) {
          let hasError = false;
          for (const item of otherYearPress) {
            const targetYear =
              getCalculatedYearFromDate(item.broadcastDate);
            console.log(
              `타 연차 기사 감지: ${item.title} -> ${targetYear}차년도 DB로 직접 저장합니다.`
            );

            const insertPayload = {
              year: targetYear,
              type: item.type || "기타",
              media: item.media || "미상",
              title: item.title || "새 보도자료",
              broadcast_date: formatToPostgresTimestamp(
                item.broadcastDate
              ),
              content_url:
                item.contentUrl || "https://www.uc.ac.kr",
              press_content: item.pressContent || ""
            };

            let singleInsertErr = null;
            if (window.__HAS_NO_ADVANCED_PRESS_COLUMNS__) {
              const {
                press_content: _press_content,
                ...rest
              } = insertPayload;
              const { error } = await insertPressRelease(rest);
              singleInsertErr = error;
            } else {
              const { error } =
                await insertPressRelease(insertPayload);
              singleInsertErr = error;
              if (singleInsertErr) {
                console.warn(
                  "DB에 press_releases 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.",
                  singleInsertErr
                );
                window.__HAS_NO_ADVANCED_PRESS_COLUMNS__ = true;
                const {
                  press_content: _press_content,
                  ...rest
                } = insertPayload;
                const { error: fallbackErr } =
                  await insertPressRelease(rest);
                singleInsertErr = fallbackErr;
              }
            }

            if (singleInsertErr) {
              console.error(
                `Failed to insert press release to year ${targetYear}:`,
                singleInsertErr
              );
              alert(
                `📡 타 연차 보도자료 DB 저장 중 오류가 발생했습니다.\n\n[오류 원인]: ${singleInsertErr.message || singleInsertErr}`
              );
              hasError = true;
            } else {
              try {
                const cachedPressStr = localStorage.getItem(
                  `anchor_cache_press_y${targetYear}`
                );
                const cachedPressList = cachedPressStr
                  ? JSON.parse(cachedPressStr)
                  : [];
                if (
                  !cachedPressList.some(
                    (pressRelease: LegacyAppRecord) =>
                      pressRelease.title === item.title &&
                      pressRelease.broadcastDate === item.broadcastDate
                  )
                ) {
                  const updatedCache = [item, ...cachedPressList];
                  safeSetLocalStorage(
                    `anchor_cache_press_y${targetYear}`,
                    JSON.stringify(updatedCache),
                    targetYear
                  );
                }
              } catch (cacheError) {
                console.warn(
                  "Failed to update target year cache:",
                  cacheError
                );
              }
            }
          }

          if (!hasError) {
            const otherIds = otherYearPress.map((item) => item.id);
            setPressReleases((previous) =>
              previous.filter((item) => !otherIds.includes(item.id))
            );
            console.log(
              `[언론보도] 타 연차(${getCalculatedYearFromDate(otherYearPress[0].broadcastDate)}차년도)로 기사가 자동 이동되었습니다.`
            );
          }
          setSyncStatus(hasError ? "error" : "synced");
          return;
        }

        const targetYearNum =
          selectedYear === 1
            ? 2025
            : selectedYear === 2
              ? 2026
              : selectedYear === 3
                ? 2027
                : selectedYear === 4
                  ? 2028
                  : 2029;
        const startDateStr =
          `${targetYearNum}-03-01T00:00:00+09:00`;
        const endDateStr =
          `${targetYearNum + 1}-03-01T00:00:00+09:00`;

        const { data: currentDbItems, error: fetchErr } =
          await fetchPressReleaseIds(startDateStr, endDateStr);

        if (fetchErr) {
          console.error(
            "Failed to fetch current press releases to rollback backup:",
            fetchErr
          );
          setSyncStatus("error");
          return;
        }

        const oldIds = (currentDbItems || []).map((item) => item.id);

        if (currentYearPress.length > 0) {
          const insertPayload = currentYearPress.map((item) => ({
            year: selectedYear,
            type: item.type || "기타",
            media: item.media || "미상",
            title: item.title || "새 보도자료",
            broadcast_date: formatToPostgresTimestamp(
              item.broadcastDate
            ),
            content_url: item.contentUrl || "https://www.uc.ac.kr",
            press_content: item.pressContent || ""
          }));

          let insertErr = null;
          if (window.__HAS_NO_ADVANCED_PRESS_COLUMNS__) {
            const safePayload = insertPayload.map((item) => {
              const {
                press_content: _press_content,
                ...rest
              } = item;
              return rest;
            });
            const { error } =
              await insertPressReleases(safePayload);
            insertErr = error;
          } else {
            const { error } =
              await insertPressReleases(insertPayload);
            insertErr = error;
            if (insertErr) {
              console.warn(
                "DB에 press_releases 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.",
                insertErr
              );
              window.__HAS_NO_ADVANCED_PRESS_COLUMNS__ = true;
              const safePayload = insertPayload.map((item) => {
                const {
                  press_content: _press_content,
                  ...rest
                } = item;
                return rest;
              });
              const { error: fallbackErr } =
                await insertPressReleases(safePayload);
              insertErr = fallbackErr;
            }
          }

          if (insertErr) {
            console.error(
              "Failed to insert new press releases:",
              insertErr
            );
            alert(
              `📡 데이터베이스 저장 오류가 검출되었습니다.\n\n[오류 원인]: ${insertErr.message || insertErr}\n\n데이터 유실 방지를 위해 기존 보도 대장은 안전하게 롤백/보존되었습니다.`
            );
            setSyncStatus("error");
            return;
          }
        }

        if (oldIds.length > 0) {
          const { error: deleteErr } =
            await deletePressReleasesByIds(oldIds);

          if (deleteErr) {
            console.error(
              "Failed to clean up old press releases:",
              deleteErr
            );
          }
        }
        fetchedPressReleasesRef.current =
          JSON.stringify(pressReleases);
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to sync press releases:", error);
        setSyncStatus("error");
      }
    };
    void syncPressImmediate();
  // oxlint-disable-next-line react/exhaustive-deps -- press changes, year, and load guards own synchronization; auth and active-year restoration are safety checks, not write triggers.
  }, [pressReleases, selectedYear, isDbLoaded, isFetchCompleted]);
};
