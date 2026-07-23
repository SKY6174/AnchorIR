import { supabase } from "../../../supabaseClient";
import type { Json } from "../../../types/supabase";

const MENU_VISIBILITY_KEY = "menu_visibility";

export const fetchMenuVisibility = () =>
  supabase
    .from("portal_configs")
    .select("value")
    .eq("key", MENU_VISIBILITY_KEY)
    .maybeSingle();

export const saveMenuVisibility = (value: Json) =>
  supabase
    .from("portal_configs")
    .upsert({
      key: MENU_VISIBILITY_KEY,
      value,
      updated_at: new Date().toISOString()
    });
