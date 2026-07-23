import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  LegacyAppRecord,
  ScheduleEventInsert
} from "../../../app/app-types";
import { getCalculatedYearFromDate } from "../../../app/app-data-utils";
import {
  deleteScheduleEventsByIds,
  deleteScheduleEventsByYear,
  fetchScheduleEventIds,
  insertScheduleEvents,
  upsertScheduleEvents
} from "../services/schedule-data-service";

type EventScheduleAutosaveOptions = {
  eventSchedules: LegacyAppRecord[];
  setEventSchedules: Dispatch<SetStateAction<LegacyAppRecord[]>>;
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedEventSchedulesRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
  syncEventsToMonthly: (latestEvents: LegacyAppRecord[]) => void;
};

export const useEventScheduleAutosave = ({
  eventSchedules,
  setEventSchedules,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedEventSchedulesRef,
  safeSetLocalStorage,
  setSyncStatus,
  syncEventsToMonthly
}: EventScheduleAutosaveOptions) => {
  const latestEventSchedulesRef =
    useRef<LegacyAppRecord[] | null>(null);
  useEffect(() => {
    latestEventSchedulesRef.current = eventSchedules;
  }, [eventSchedules]);

  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;
    if (!eventSchedules) return;

    if (
      fetchedEventSchedulesRef.current ===
      JSON.stringify(eventSchedules)
    ) {
      return;
    }

    const hasInvalidItem = eventSchedules.some(
      (item) => !item.title?.trim() || !item.datetime
    );
    if (hasInvalidItem) {
      console.warn(
        "Event schedule sync aborted: detected invalid event item with missing title or datetime.",
        eventSchedules
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_event_y${selectedYear}`,
      JSON.stringify(eventSchedules),
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
            await deleteScheduleEventsByYear(targetYear);
          if (error) throw error;
          fetchedEventSchedulesRef.current = JSON.stringify([]);
          setSyncStatus("synced");
          syncEventsToMonthly([]);
          return;
        }

        const newItems: ScheduleEventInsert[] = [];
        const updateItems: ScheduleEventInsert[] = [];

        schedulesToSync.forEach((schedule) => {
          const item: ScheduleEventInsert = {
            year: getCalculatedYearFromDate(
              schedule.datetime
                ? schedule.datetime.substring(0, 10)
                : null,
              targetYear
            ),
            month: schedule.month,
            title: schedule.title,
            department: schedule.department || "",
            location: schedule.location || "",
            attendees_internal: schedule.attendeesInternal || "",
            attendees_external: schedule.attendeesExternal || "",
            program: schedule.program || "",
            purpose: schedule.purpose || "",
            result: schedule.result || "",
            datetime: schedule.datetime
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
          const { data: updateData, error: updateError } =
            await upsertScheduleEvents(updateItems);
          if (updateError) throw updateError;
          if (updateData) upsertedData.push(...updateData);
        }

        if (newItems.length > 0) {
          const { data: insertData, error: insertError } =
            await insertScheduleEvents(newItems);
          if (insertError) throw insertError;
          if (insertData) upsertedData.push(...insertData);
        }

        let finalLocalEvents = schedulesToSync;
        if (upsertedData && upsertedData.length > 0) {
          const normalizedUpserted: LegacyAppRecord[] =
            upsertedData.map((item) => ({
              id: Number(item.id),
              year: Number(item.year),
              month: Number(item.month),
              title: item.title,
              department: item.department || "",
              location: item.location || "",
              attendeesInternal: item.attendees_internal || "",
              attendeesExternal: item.attendees_external || "",
              program: item.program || "",
              purpose: item.purpose || "",
              result: item.result || "",
              datetime: item.datetime
            }));

          finalLocalEvents = schedulesToSync.map((schedule) => {
            if (
              schedule.id &&
              typeof schedule.id === "number" &&
              schedule.id < 2000000000
            ) {
              return schedule;
            }
            const dbMatch = normalizedUpserted.find((item) => {
              const matchTitle = item.title === schedule.title;
              const itemDate = item.datetime
                ? item.datetime.substring(0, 10)
                : "";
              const scheduleDate = schedule.datetime
                ? schedule.datetime.substring(0, 10)
                : "";
              return matchTitle && itemDate === scheduleDate;
            });
            if (dbMatch) {
              return dbMatch;
            }
            return schedule;
          });

          fetchedEventSchedulesRef.current =
            JSON.stringify(finalLocalEvents);
          setEventSchedules(finalLocalEvents);
          safeSetLocalStorage(
            `anchor_cache_event_y${targetYear}`,
            JSON.stringify(finalLocalEvents),
            targetYear
          );
        }

        const { data: currentDbItems } =
          await fetchScheduleEventIds(targetYear);

        if (currentDbItems) {
          const dbIds = currentDbItems.map((item) => item.id);
          const localRealIds = finalLocalEvents
            .map((item) => item.id)
            .filter(
              (id) => typeof id === "number" && id < 2000000000
            );

          const idsToDelete = dbIds.filter(
            (id) => !localRealIds.includes(id)
          );
          if (idsToDelete.length > 0) {
            const { error: deleteError } =
              await deleteScheduleEventsByIds(idsToDelete);
            if (deleteError) throw deleteError;
          }
        }

        fetchedEventSchedulesRef.current =
          JSON.stringify(finalLocalEvents);
        setSyncStatus("synced");
        syncEventsToMonthly(finalLocalEvents);
      } catch (error) {
        console.error("Failed to sync event schedules:", error);
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(() => {
      void performSync(eventSchedules, selectedYear);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (latestEventSchedulesRef.current) {
        void performSync(
          latestEventSchedulesRef.current,
          selectedYear
        );
      }
    };
  // oxlint-disable-next-line react/exhaustive-deps -- event data, year, and load guards own synchronization; auth restoration must not flush or delete events.
  }, [eventSchedules, selectedYear, isDbLoaded, isFetchCompleted]);
};
