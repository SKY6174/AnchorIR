import { supabase } from "../../../supabaseClient";
import type { TablesInsert } from "../../../types/supabase";

type RiseMemberInsert = TablesInsert<"rise_members">;

export const fetchRiseMembers = () =>
  supabase
    .from("rise_members")
    .select("*")
    .order("id", { ascending: true });

export const upsertRiseMember = (member: RiseMemberInsert) =>
  supabase
    .from("rise_members")
    .upsert(member);

export const upsertRiseMembers = (members: RiseMemberInsert[]) =>
  supabase
    .from("rise_members")
    .upsert(members);

export const insertRiseMember = (member: RiseMemberInsert) =>
  supabase
    .from("rise_members")
    .insert(member);

export const deleteRiseMember = (memberId: string) =>
  supabase
    .from("rise_members")
    .delete()
    .eq("id", memberId);
