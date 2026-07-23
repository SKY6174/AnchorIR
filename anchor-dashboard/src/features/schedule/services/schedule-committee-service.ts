import { supabase } from "../../../supabaseClient";
import { COMMITTEES_DATA } from "../data/schedule-committee-data";

const scheduleCommitteeDb = supabase as any;

const COMMITTEE_ORDER: Record<string, number> = {
  total: 1,
  planning: 2,
  budget: 3,
  evaluation: 4,
  advisory: 5,
  ecc_op: 11,
  icc_op: 12,
  rcc_op: 13,
  aidx_op: 14,
  neulbom_op: 15,
  newind_op: 16
};

export const fetchScheduleCommittees = async (
  selectedYear: number | string | undefined
) => {
  const { data: committees, error: committeesError } = await supabase
    .from("committees")
    .select("*")
    .order("id");
  if (committeesError) throw committeesError;

  if (!committees || committees.length === 0) {
    return null;
  }

  const sortedCommittees = [...committees].sort(
    (first, second) =>
      (COMMITTEE_ORDER[first.id] || 99) - (COMMITTEE_ORDER[second.id] || 99)
  );

  const { data: members, error: membersError } = await supabase
    .from("committee_members")
    .select("*")
    .eq("year", String(selectedYear || ""))
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (membersError) throw membersError;

  return sortedCommittees.map(committee => {
    const localMaster: any =
      COMMITTEES_DATA.find(localCommittee => localCommittee.id === committee.id) || {};

    return {
      ...localMaster,
      ...committee,
      desc: (committee as any).description || localMaster.desc,
      members: (members || [])
        .filter(member => member.committee_id === committee.id)
        .map(member => ({
          id: member.id,
          type: member.type,
          name: member.name,
          org: member.org,
          dept: member.dept,
          rank: member.rank,
          location: member.location,
          term: member.term,
          note: member.note
        }))
    };
  });
};

export const insertScheduleCommitteeMembers = async (members: any[]) => {
  const { error } = await scheduleCommitteeDb
    .from("committee_members")
    .insert(members);
  if (error) throw error;
};

export const deleteScheduleCommitteeMember = async (
  memberId: number | string
) => {
  const { error } = await scheduleCommitteeDb
    .from("committee_members")
    .delete()
    .eq("id", memberId);
  if (error) throw error;
};

export const updateScheduleCommitteeMember = async (
  memberId: number | string | undefined,
  memberData: Record<string, unknown>
) => {
  const { error } = await scheduleCommitteeDb
    .from("committee_members")
    .update(memberData)
    .eq("id", memberId);
  if (error) throw error;
};

export const insertScheduleCommitteeMember = async (
  memberData: Record<string, unknown>
) => {
  const { error } = await scheduleCommitteeDb
    .from("committee_members")
    .insert(memberData);
  if (error) throw error;
};
