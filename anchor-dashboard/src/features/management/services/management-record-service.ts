import { supabase } from "../../../supabaseClient";
import type { Database, TablesInsert } from "../../../types/supabase";

type UnifiedCertificateInsert = TablesInsert<"unified_certificates">;
type ScholarshipInsert = Partial<Database["public"]["Views"]["scholarships_view"]["Row"]>;

export const deleteUnifiedCertificatesByYear = (year: number) =>
  supabase
    .from("unified_certificates")
    .delete()
    .eq("year", year);

export const insertUnifiedCertificates = (
  certificates: UnifiedCertificateInsert[]
) =>
  supabase
    .from("unified_certificates")
    .insert(certificates);

export const deleteScholarshipsByYear = (year: number) =>
  supabase
    .from("scholarships_view")
    .delete()
    .eq("year", year);

export const insertScholarships = (scholarships: ScholarshipInsert[]) =>
  supabase
    .from("scholarships_view")
    // The generated schema exposes this writable compatibility view as a View,
    // so Supabase infers its insert payload as never even though production
    // grants an INSERT rule for the legacy dashboard.
    .insert(scholarships as never[]);
