import { supabase } from "../../../supabaseClient";
import type { TablesInsert } from "../../../types/supabase";

type MonthlyInsert = TablesInsert<"schedule_monthly">;
type EventInsert = TablesInsert<"schedule_events">;
type MeetingInsert = TablesInsert<"schedule_meetings">;

export const fetchScheduleMeetingsForYearRepair = () =>
  supabase.from("schedule_meetings").select("id, datetime, year");

export const updateScheduleMeetingYear = (id: number, year: number) =>
  supabase.from("schedule_meetings").update({ year }).eq("id", id);

export const fetchScheduleEventsForYearRepair = () =>
  supabase.from("schedule_events").select("id, datetime, year");

export const updateScheduleEventYear = (id: number, year: number) =>
  supabase.from("schedule_events").update({ year }).eq("id", id);

export const deleteMonthlySchedulesByYear = (year: number) =>
  supabase.from("schedule_monthly").delete().eq("year", year);

export const deleteMonthlySchedulesByIds = (ids: number[]) =>
  supabase.from("schedule_monthly").delete().in("id", ids);

export const upsertMonthlySchedules = (items: MonthlyInsert[]) =>
  supabase
    .from("schedule_monthly")
    .upsert(items, { onConflict: "id" })
    .select();

export const insertMonthlySchedules = (items: MonthlyInsert[]) =>
  supabase.from("schedule_monthly").insert(items).select();

export const fetchStandaloneMonthlyScheduleIds = (year: number) =>
  supabase
    .from("schedule_monthly")
    .select("id")
    .eq("year", year)
    .is("event_id", null)
    .is("meeting_id", null);

export const deleteScheduleEventsByYear = (year: number) =>
  supabase.from("schedule_events").delete().eq("year", year);

export const deleteScheduleEventsByIds = (ids: number[]) =>
  supabase.from("schedule_events").delete().in("id", ids);

export const upsertScheduleEvents = (items: EventInsert[]) =>
  supabase
    .from("schedule_events")
    .upsert(items, { onConflict: "id" })
    .select();

export const insertScheduleEvents = (items: EventInsert[]) =>
  supabase.from("schedule_events").insert(items).select();

export const fetchScheduleEventIds = (year: number) =>
  supabase.from("schedule_events").select("id").eq("year", year);

export const deleteScheduleMeetingsByYear = (year: number) =>
  supabase.from("schedule_meetings").delete().eq("year", year);

export const deleteScheduleMeetingsByIds = (ids: number[]) =>
  supabase.from("schedule_meetings").delete().in("id", ids);

export const upsertScheduleMeetings = (items: MeetingInsert[]) =>
  supabase
    .from("schedule_meetings")
    .upsert(items, { onConflict: "id" })
    .select();

export const insertScheduleMeetings = (items: MeetingInsert[]) =>
  supabase.from("schedule_meetings").insert(items).select();

export const fetchScheduleMeetingIds = (year: number) =>
  supabase.from("schedule_meetings").select("id").eq("year", year);
