import type { Tables, TablesInsert } from "../types/supabase";

export type LegacyAppRecord = Record<string, any>;
export type LegacyYearRecord = Record<number, LegacyAppRecord>;
export type RiseMemberInsert = TablesInsert<"rise_members">;
export type ScheduleMonthlyInsert = TablesInsert<"schedule_monthly">;
export type ScheduleEventInsert = TablesInsert<"schedule_events">;
export type ScheduleMeetingInsert = TablesInsert<"schedule_meetings">;
export type AssetReservation = Tables<"asset_reservations">;
export type ProgramVersionRequest = Omit<Tables<"program_version_requests">, "changes"> & {
  changes: LegacyAppRecord;
};
export type Html2PdfFactory = () => LegacyAppRecord;

declare global {
  interface Window {
    html2pdf?: Html2PdfFactory;
    __HAS_NO_ADVANCED_SERVICES_COLUMNS__?: boolean;
    __HAS_NO_ADVANCED_ENV_COLUMNS__?: boolean;
    __HAS_NO_ADVANCED_EQUIP_COLUMNS__?: boolean;
    __HAS_NO_ADVANCED_PRESS_COLUMNS__?: boolean;
  }
}
