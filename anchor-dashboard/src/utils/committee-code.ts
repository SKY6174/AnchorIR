const COMMITTEE_CODE_BY_ID: Record<string, string> = {
  total: "STEER",
  planning: "PLAN",
  planning_op: "PLAN",
  budget: "BUDGET",
  evaluation: "EVAL",
  advisory: "ADVISORY",
  ecc: "ECC",
  ecc_op: "ECC",
  icc: "ICC",
  icc_op: "ICC",
  rcc: "RCC",
  rcc_op: "RCC",
  aidx_op: "AIDX",
  neulbom_op: "NURI",
  newind_op: "SEVEN"
};

const MEETING_ROUND_PATTERNS = [
  /제\s*(\d{1,3})\s*차(?!\s*년도)/,
  /(?:^|[^\d])(\d{1,3})\s*차(?!\s*년도)/,
  /제\s*(\d{1,3})\s*회(?:의)?/,
  /(?:^|[^\d])(\d{1,3})\s*회(?:의)?/
];

export const getCommitteeTypeCode = (committeeId: unknown): string =>
  COMMITTEE_CODE_BY_ID[String(committeeId || "").trim().toLowerCase()] || "GENERAL";

export const extractMeetingRound = (title: unknown): number | null => {
  const normalizedTitle = String(title || "").trim();

  for (const pattern of MEETING_ROUND_PATTERNS) {
    const match = normalizedTitle.match(pattern);
    const round = Number(match?.[1]);
    if (Number.isInteger(round) && round >= 1 && round <= 999) return round;
  }

  return null;
};

export const extractMeetingYear = (
  meetingDate: unknown,
  title: unknown,
  fallbackYear = new Date().getFullYear()
): number => {
  const dateText = String(meetingDate || "").trim();
  const leadingYear = dateText.match(/^((?:19|20)\d{2})/)?.[1];
  if (leadingYear) return Number(leadingYear);

  const parsedDate = new Date(dateText);
  if (dateText && !Number.isNaN(parsedDate.getTime())) return parsedDate.getFullYear();

  const titleYear = String(title || "").match(/((?:19|20)\d{2})\s*년/)?.[1];
  return titleYear ? Number(titleYear) : fallbackYear;
};

export interface CommitteeHumanCodeInput {
  committeeId: unknown;
  title: unknown;
  meetingDate?: unknown;
  fallbackYear?: number;
}

export const buildCommitteeHumanCode = ({
  committeeId,
  title,
  meetingDate,
  fallbackYear
}: CommitteeHumanCodeInput): string => {
  const year = extractMeetingYear(meetingDate, title, fallbackYear);
  const committeeCode = getCommitteeTypeCode(committeeId);
  const round = extractMeetingRound(title);
  const roundCode = round === null ? "XX" : String(round).padStart(2, "0");

  return `UC-ANCHOR-${year}-${committeeCode}-${roundCode}`;
};
