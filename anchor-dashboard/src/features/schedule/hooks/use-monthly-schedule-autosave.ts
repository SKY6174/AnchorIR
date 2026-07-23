import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  LegacyAppRecord,
  ScheduleMonthlyInsert
} from "../../../app/app-types";
import {
  deleteMonthlySchedulesByIds,
  deleteMonthlySchedulesByYear,
  fetchStandaloneMonthlyScheduleIds,
  insertMonthlySchedules,
  upsertMonthlySchedules
} from "../services/schedule-data-service";

type MonthlyScheduleAutosaveOptions = {
  monthlySchedules: LegacyAppRecord[];
  setMonthlySchedules: Dispatch<SetStateAction<LegacyAppRecord[]>>;
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedMonthlySchedulesRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

export const useMonthlyScheduleAutosave = ({
  monthlySchedules,
  setMonthlySchedules,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedMonthlySchedulesRef,
  safeSetLocalStorage,
  setSyncStatus
}: MonthlyScheduleAutosaveOptions) => {
  const latestMonthlySchedulesRef =
    useRef<LegacyAppRecord[] | null>(null);
  useEffect(() => {
    latestMonthlySchedulesRef.current = monthlySchedules;
  }, [monthlySchedules]);

  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;
    if (!monthlySchedules) return;

    if (
      fetchedMonthlySchedulesRef.current ===
      JSON.stringify(monthlySchedules)
    ) {
      return;
    }

    const hasInvalidItem = monthlySchedules.some(
      (item) =>
        !item.title?.trim() || !item.startAt || !item.endAt
    );
    if (hasInvalidItem) {
      console.warn(
        "Schedule sync aborted: detected invalid schedule item with missing title or dates.",
        monthlySchedules
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_month_y${selectedYear}`,
      JSON.stringify(monthlySchedules),
      selectedYear
    );
    setSyncStatus("syncing");

    const performSync = async (
      schedulesToSync: LegacyAppRecord[],
      targetYear: number
    ) => {
      try {
        if (!schedulesToSync) return;

        if (schedulesToSync.length === 0) {
          const { error } =
            await deleteMonthlySchedulesByYear(targetYear);
          if (error) throw error;
          fetchedMonthlySchedulesRef.current = JSON.stringify([]);
          setSyncStatus("synced");
          return;
        }

        const pureSchedulesToSync = schedulesToSync.filter(
          (item) => !item.eventId && !item.meetingId
        );

        const newItems: ScheduleMonthlyInsert[] = [];
        const updateItems: ScheduleMonthlyInsert[] = [];

        pureSchedulesToSync.forEach((schedule) => {
          const item: ScheduleMonthlyInsert = {
            year: targetYear,
            title: schedule.title,
            type: schedule.type || "기타",
            dept: schedule.dept || "사업운영팀",
            start_at: schedule.startAt,
            end_at: schedule.endAt,
            location: schedule.location || "",
            is_task: schedule.isTask || false,
            is_deadline: schedule.isDeadline || false,
            completed: schedule.completed || false,
            attendees: schedule.attendees || "",
            event_id: schedule.eventId || null,
            meeting_id: schedule.meetingId || null
          };
          if (
            schedule.id &&
            typeof schedule.id === "number" &&
            schedule.id < 2000000000
          ) {
            item.id = schedule.id;
            updateItems.push(item);
          } else {
            newItems.push(item);
          }
        });

        const upsertedData: LegacyAppRecord[] = [];

        if (updateItems.length > 0) {
          const { data: upData, error: upError } =
            await upsertMonthlySchedules(updateItems);

          if (upError) {
            if (upError.code === "42703") {
              const fallbackItems = updateItems.map(
                ({
                  event_id: _event_id,
                  meeting_id: _meeting_id,
                  ...rest
                }) => rest
              );
              const { data: fallbackData, error: fallbackError } =
                await upsertMonthlySchedules(fallbackItems);
              if (fallbackError) throw fallbackError;
              if (fallbackData) upsertedData.push(...fallbackData);
            } else {
              throw upError;
            }
          } else if (upData) {
            upsertedData.push(...upData);
          }
        }

        if (newItems.length > 0) {
          const { data: insertData, error: insertError } =
            await insertMonthlySchedules(newItems);

          if (insertError) {
            if (insertError.code === "42703") {
              const fallbackItems = newItems.map(
                ({
                  event_id: _event_id,
                  meeting_id: _meeting_id,
                  ...rest
                }) => rest
              );
              const { data: fallbackData, error: fallbackError } =
                await insertMonthlySchedules(fallbackItems);
              if (fallbackError) throw fallbackError;
              if (fallbackData) upsertedData.push(...fallbackData);
            } else {
              throw insertError;
            }
          } else if (insertData) {
            upsertedData.push(...insertData);
          }
        }

        let finalLocalSchedules = schedulesToSync;
        if (upsertedData && upsertedData.length > 0) {
          const normalizedUpserted: LegacyAppRecord[] =
            upsertedData.map((item) => ({
              id: Number(item.id),
              year: Number(item.year),
              title: item.title,
              type: item.type,
              dept: item.dept,
              startAt: item.start_at,
              endAt: item.end_at,
              location: item.location,
              isTask: item.is_task || false,
              isDeadline: item.is_deadline || false,
              completed: item.completed || false,
              attendees: item.attendees || "",
              eventId: item.event_id ? Number(item.event_id) : null,
              meetingId: item.meeting_id
                ? Number(item.meeting_id)
                : null
            }));

          finalLocalSchedules = schedulesToSync.map((schedule) => {
            if (
              schedule.id &&
              typeof schedule.id === "number" &&
              schedule.id < 2000000000
            ) {
              return schedule;
            }
            const dbMatch = normalizedUpserted.find((item) => {
              const matchTitle = item.title === schedule.title;
              const itemDate = item.startAt
                ? item.startAt.substring(0, 10)
                : "";
              const scheduleDate = schedule.startAt
                ? schedule.startAt.substring(0, 10)
                : "";
              return matchTitle && itemDate === scheduleDate;
            });
            if (dbMatch) {
              return dbMatch;
            }
            return schedule;
          });

          fetchedMonthlySchedulesRef.current =
            JSON.stringify(finalLocalSchedules);
          setMonthlySchedules(finalLocalSchedules);
          safeSetLocalStorage(
            `anchor_cache_month_y${targetYear}`,
            JSON.stringify(finalLocalSchedules),
            targetYear
          );
        }

        const { data: currentDbItems } =
          await fetchStandaloneMonthlyScheduleIds(targetYear);

        if (currentDbItems) {
          const dbIds = currentDbItems.map((item) => item.id);
          const localRealIds = finalLocalSchedules
            .filter((item) => !item.eventId && !item.meetingId)
            .map((item) => item.id)
            .filter(
              (id) => typeof id === "number" && id < 2000000000
            );

          const idsToDelete = dbIds.filter(
            (id) => !localRealIds.includes(id)
          );
          if (idsToDelete.length > 0) {
            const { error: deleteError } =
              await deleteMonthlySchedulesByIds(idsToDelete);
            if (deleteError) throw deleteError;
          }
        }

        fetchedMonthlySchedulesRef.current =
          JSON.stringify(finalLocalSchedules);
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to sync monthly schedules:", error);
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(() => {
      void performSync(monthlySchedules, selectedYear);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (latestMonthlySchedulesRef.current) {
        void performSync(
          latestMonthlySchedulesRef.current,
          selectedYear
        );
      }
    };
  // oxlint-disable-next-line react/exhaustive-deps -- schedule data, year, and load guards own synchronization; auth restoration must not flush or delete schedules.
  }, [monthlySchedules, selectedYear, isDbLoaded, isFetchCompleted]);
};
