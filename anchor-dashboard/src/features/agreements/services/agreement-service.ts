import { supabase } from "../../../supabaseClient";
import type { TablesInsert } from "../../../types/supabase";

type AgreementInsert = TablesInsert<"agreements">;

export const deleteAgreementsByYear = (year: number) =>
  supabase
    .from("agreements")
    .delete()
    .eq("year", year);

export const insertAgreements = (agreements: AgreementInsert[]) =>
  supabase
    .from("agreements")
    .insert(agreements);
