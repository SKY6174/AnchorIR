import { supabase } from "../../../supabaseClient";
import type { TablesInsert } from "../../../types/supabase";

type PressReleaseInsert = TablesInsert<"press_releases">;

export const insertPressRelease = (pressRelease: PressReleaseInsert) =>
  supabase
    .from("press_releases")
    .insert(pressRelease);

export const insertPressReleases = (pressReleases: PressReleaseInsert[]) =>
  supabase
    .from("press_releases")
    .insert(pressReleases);

export const fetchPressReleaseIds = (startDate: string, endDate: string) =>
  supabase
    .from("press_releases")
    .select("id")
    .gte("broadcast_date", startDate)
    .lt("broadcast_date", endDate);

export const deletePressReleasesByIds = (ids: number[]) =>
  supabase
    .from("press_releases")
    .delete()
    .in("id", ids);
