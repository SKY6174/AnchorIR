export interface CommitteeMemberDisplayInput {
  name?: string | null;
  role_code?: string | null;
  type?: string | null;
  org?: string | null;
  dept?: string | null;
  rank?: string | null;
}

const getCommitteeRoleLabel = (member: CommitteeMemberDisplayInput): string => {
  const roleCode = String(member.role_code || "").trim().toUpperCase();
  if (roleCode === "CHAIRMAN") return "위원장";
  if (roleCode === "SECRETARY") return "간사";
  if (roleCode === "MEMBER") return "위원";

  const legacyType = String(member.type || "").trim();
  if (legacyType.includes("위원장")) return "위원장";
  if (legacyType.includes("간사")) return "간사";
  return "위원";
};

export const formatCommitteeMemberDisplay = (
  member?: CommitteeMemberDisplayInput | null
): string => {
  if (!member) return "";

  const name = String(member.name || "").trim();
  const committeeRole = getCommitteeRoleLabel(member);
  const organization = String(member.org || "").trim();
  const department = String(member.dept || "").trim();
  const affiliation = [organization, department].find(value =>
    Boolean(value) && !/^[-–—]$/.test(value)
  ) || "";
  const position = String(member.rank || "").trim();
  const affiliationAndPosition = [affiliation, position].filter(Boolean).join(", ");
  const roleAndPosition = `${committeeRole}${affiliationAndPosition ? `(${affiliationAndPosition})` : ""}`;

  return [name, roleAndPosition].filter(Boolean).join(" ");
};
