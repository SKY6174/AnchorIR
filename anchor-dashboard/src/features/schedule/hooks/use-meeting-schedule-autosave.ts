import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  LegacyAppRecord,
  ScheduleMeetingInsert
} from "../../../app/app-types";
import { getCalculatedYearFromDate } from "../../../app/app-data-utils";
import {
  deleteScheduleMeetingsByIds,
  deleteScheduleMeetingsByYear,
  fetchScheduleMeetingIds,
  insertScheduleMeetings,
  upsertScheduleMeetings
} from "../services/schedule-data-service";

type MeetingScheduleAutosaveOptions = {
  meetingSchedules: LegacyAppRecord[];
  setMeetingSchedules: Dispatch<SetStateAction<LegacyAppRecord[]>>;
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedMeetingSchedulesRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
  syncMeetingsToMonthly: (
    latestMeetings: LegacyAppRecord[]
  ) => void;
};

export const useMeetingScheduleAutosave = ({
  meetingSchedules,
  setMeetingSchedules,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedMeetingSchedulesRef,
  safeSetLocalStorage,
  setSyncStatus,
  syncMeetingsToMonthly
}: MeetingScheduleAutosaveOptions) => {
  const latestMeetingSchedulesRef =
    useRef<LegacyAppRecord[] | null>(null);
  useEffect(() => {
    latestMeetingSchedulesRef.current = meetingSchedules;
  }, [meetingSchedules]);

  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;
    if (!meetingSchedules) return;

    if (
      fetchedMeetingSchedulesRef.current ===
      JSON.stringify(meetingSchedules)
    ) {
      return;
    }

    const hasInvalidItem = meetingSchedules.some(
      (item) => !item.title?.trim() || !item.datetime
    );
    if (hasInvalidItem) {
      console.warn(
        "Meeting schedule sync aborted: detected invalid meeting item with missing title or datetime.",
        meetingSchedules
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_meet_y${selectedYear}`,
      JSON.stringify(meetingSchedules),
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
            await deleteScheduleMeetingsByYear(targetYear);
          if (error) throw error;
          fetchedMeetingSchedulesRef.current = JSON.stringify([]);
          setSyncStatus("synced");
          syncMeetingsToMonthly([]);
          return;
        }

        const newItems: ScheduleMeetingInsert[] = [];
        const updateItems: ScheduleMeetingInsert[] = [];

        schedulesToSync.forEach((schedule) => {
          const item: ScheduleMeetingInsert = {
            year: getCalculatedYearFromDate(
              schedule.datetime
                ? schedule.datetime.substring(0, 10)
                : null,
              targetYear
            ),
            month: schedule.month,
            category: schedule.category,
            title: schedule.title,
            location: schedule.location || "",
            attendees_internal: schedule.attendeesInternal || "",
            attendees_external: schedule.attendeesExternal || "",
            agenda: schedule.agenda || "",
            result: schedule.result || "",
            datetime: schedule.datetime,
            audio_url: schedule.audioUrl || "",
            pdf_url: schedule.pdfUrl || ""
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
            await upsertScheduleMeetings(updateItems);
          if (updateError) throw updateError;
          if (updateData) upsertedData.push(...updateData);
        }

        if (newItems.length > 0) {
          const { data: insertData, error: insertError } =
            await insertScheduleMeetings(newItems);
          if (insertError) throw insertError;
          if (insertData) upsertedData.push(...insertData);
        }

        let finalLocalMeetings = schedulesToSync;
        if (upsertedData && upsertedData.length > 0) {
          const normalizedUpserted: LegacyAppRecord[] =
            upsertedData.map((item) => ({
              ...item,
              id: Number(item.id),
              year: Number(item.year),
              month: Number(item.month),
              attendeesInternal: item.attendees_internal || "",
              attendeesExternal: item.attendees_external || "",
              audioUrl: item.audio_url || "",
              pdfUrl: item.pdf_url || ""
            }));

          finalLocalMeetings = schedulesToSync.map((schedule) => {
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

          fetchedMeetingSchedulesRef.current =
            JSON.stringify(finalLocalMeetings);
          setMeetingSchedules(finalLocalMeetings);
          safeSetLocalStorage(
            `anchor_cache_meet_y${targetYear}`,
            JSON.stringify(finalLocalMeetings),
            targetYear
          );
        }

        const { data: currentDbItems } =
          await fetchScheduleMeetingIds(targetYear);

        if (currentDbItems) {
          const dbIds = currentDbItems.map((item) => item.id);
          const localRealIds = finalLocalMeetings
            .map((item) => item.id)
            .filter(
              (id) => typeof id === "number" && id < 2000000000
            );

          const idsToDelete = dbIds.filter(
            (id) => !localRealIds.includes(id)
          );
          if (idsToDelete.length > 0) {
            const { error: deleteError } =
              await deleteScheduleMeetingsByIds(idsToDelete);
            if (deleteError) throw deleteError;
          }
        }

        fetchedMeetingSchedulesRef.current =
          JSON.stringify(finalLocalMeetings);
        setSyncStatus("synced");
        syncMeetingsToMonthly(finalLocalMeetings);
      } catch (error) {
        console.error("Failed to sync meeting schedules:", error);
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(() => {
      void performSync(meetingSchedules, selectedYear);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (latestMeetingSchedulesRef.current) {
        void performSync(
          latestMeetingSchedulesRef.current,
          selectedYear
        );
      }
    };
  // oxlint-disable-next-line react/exhaustive-deps -- meeting data, year, and load guards own synchronization; auth restoration must not flush or delete meetings.
  }, [meetingSchedules, selectedYear, isDbLoaded, isFetchCompleted]);
};
