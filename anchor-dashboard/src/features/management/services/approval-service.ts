import { supabase } from "../../../supabaseClient";
import type { TablesUpdate } from "../../../types/supabase";

type ReservationUpdate = TablesUpdate<"asset_reservations">;

export const fetchPendingVersionRequests = (year: number) =>
  supabase
    .from("program_version_requests")
    .select("*")
    .eq("year", year)
    .eq("status", "승인대기");

export const fetchVersionRequests = () =>
  supabase
    .from("program_version_requests")
    .select("*")
    .order("requested_at", { ascending: false });

export const fetchAssetReservations = () =>
  supabase
    .from("asset_reservations")
    .select("*")
    .order("reserved_date", { ascending: false })
    .order("start_time", { ascending: false });

export const updateAssetReservation = (
  reservationId: string,
  changes: ReservationUpdate
) =>
  supabase
    .from("asset_reservations")
    .update(changes)
    .eq("id", reservationId);

export const deleteAssetReservation = (reservationId: string) =>
  supabase
    .from("asset_reservations")
    .delete()
    .eq("id", reservationId);

export const updateVersionRequestStatus = (
  requestId: number,
  status: string,
  approvedBy: string
) =>
  supabase
    .from("program_version_requests")
    .update({
      status,
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    })
    .eq("id", requestId);

export const deleteVersionRequest = (requestId: number) =>
  supabase
    .from("program_version_requests")
    .delete()
    .eq("id", requestId);
