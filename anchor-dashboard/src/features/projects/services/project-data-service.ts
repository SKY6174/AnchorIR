import { supabase } from "../../../supabaseClient";
import type { Json } from "../../../types/supabase";

export const fetchDashboardSources = (
  selectedYear: number,
  startDate: string,
  endDate: string
) =>
  Promise.all([
    supabase.from("projects_data").select("*").eq("year", selectedYear).single(),
    supabase.from("agreements").select("*"),
    supabase.from("unified_certificates").select("*"),
    supabase.from("scholarships_view").select("*"),
    supabase.from("procurement_env").select("*").eq("year", selectedYear),
    supabase.from("procurement_equipment").select("*").eq("year", selectedYear),
    supabase.from("procurement_services").select("*").eq("year", selectedYear),
    supabase.from("schedule_monthly").select("*").eq("year", selectedYear),
    supabase.from("schedule_events").select("*").eq("year", selectedYear),
    supabase.from("schedule_meetings").select("*").eq("year", selectedYear),
    supabase
      .from("press_releases")
      .select("*")
      .gte("broadcast_date", startDate)
      .lt("broadcast_date", endDate),
    supabase.from("budget_executions").select("*").eq("year", selectedYear)
  ] as const);

export const upsertProjectData = (
  year: number,
  data: Json,
  updatedAt?: string
) =>
  supabase
    .from("projects_data")
    .upsert(
      updatedAt ? { year, data, updated_at: updatedAt } : { year, data },
      { onConflict: "year" }
    );

export const updateProjectData = (year: number, data: Json) =>
  supabase
    .from("projects_data")
    .update({ data })
    .eq("year", year);
