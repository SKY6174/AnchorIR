import { supabase } from "../../../supabaseClient";

export const fetchRiseUserAccounts = () =>
  supabase
    .from("rise_users")
    .select("id, name, role_key, created_at");

export const deleteRiseUserAccount = (userId: string) =>
  supabase
    .from("rise_users")
    .delete()
    .eq("id", userId);
