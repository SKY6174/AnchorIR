import { supabase } from "../../../supabaseClient";
import type { TablesInsert } from "../../../types/supabase";

type EnvironmentInsert = TablesInsert<"procurement_env">;
type EquipmentInsert = TablesInsert<"procurement_equipment">;
type ServiceInsert = TablesInsert<"procurement_services">;
type EquipmentAssetInsert = TablesInsert<"equipment_assets">;

export const probeProcurementAdvancedColumns = () =>
  Promise.all([
    supabase.from("procurement_services").select("date_b").limit(1),
    supabase.from("procurement_env").select("date_b").limit(1),
    supabase.from("procurement_equipment").select("date_b").limit(1)
  ] as const);

export const deleteEnvironmentRecordsByYear = (year: number) =>
  supabase.from("procurement_env").delete().eq("year", year);

export const insertEnvironmentRecords = (records: EnvironmentInsert[]) =>
  supabase.from("procurement_env").insert(records);

export const deleteEquipmentRecordsByYear = (year: number) =>
  supabase.from("procurement_equipment").delete().eq("year", year);

export const insertEquipmentRecords = (records: EquipmentInsert[]) =>
  supabase.from("procurement_equipment").insert(records);

export const upsertEquipmentAssets = (assets: EquipmentAssetInsert[]) =>
  supabase
    .from("equipment_assets")
    .upsert(assets, { onConflict: "barcode_id" });

export const deleteServiceRecordsByYear = (year: number) =>
  supabase.from("procurement_services").delete().eq("year", year);

export const insertServiceRecords = (records: ServiceInsert[]) =>
  supabase.from("procurement_services").insert(records);
