import type { ScheduleCommitteeMember } from "../schedule-types";

const PROFESSOR_ROLES = ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"];

const isProfessorMember = (member: ScheduleCommitteeMember) =>
  PROFESSOR_ROLES.includes(member.grade) ||
  ["팀장교수", "센터장"].includes(member.role) ||
  PROFESSOR_ROLES.includes(member.role) ||
  PROFESSOR_ROLES.includes(member.rank);

export const getFormattedMemberGrade = (
  member: ScheduleCommitteeMember | null | undefined,
  _includeProfessors?: boolean
) => {
  if (!member) return "연구원";

  if (member.name === "송경영") {
    return "단장";
  }

  if (member.name === "김현수") {
    return "총괄본부장";
  }

  if (member.name === "심현미") {
    return "운영팀장";
  }

  if (isProfessorMember(member)) {
    const centerHeads: Record<string, string> = {
      "이동은": "ECC센터",
      "김기범": "ICC센터",
      "현용환": "RCC센터",
      "홍광표": "울산늘봄누리센터",
      "홍진숙": "신산업특화센터"
    };

    const isCenterHead =
      member.role === "센터장" ||
      member.rank === "센터장" ||
      centerHeads[member.name] !== undefined;

    if (isCenterHead) {
      return "센터장";
    }

    const departmentName = member.dept || "";
    const isNoTeamProfessorDepartment =
      departmentName.includes("늘봄") || departmentName.includes("신산업");

    if (isNoTeamProfessorDepartment) {
      return member.grade || "교수";
    }

    return "팀장교수";
  }

  return member.grade || "연구원";
};

export const isWriterExcluded = (member: ScheduleCommitteeMember | null | undefined) => {
  if (!member) return true;
  const displayRole = getFormattedMemberGrade(member);

  if (displayRole === "센터장" || displayRole === "팀장교수" || displayRole === "운영팀장") {
    return true;
  }

  return isProfessorMember(member);
};

export const isDateInSelectedYear = (
  dateString: string | undefined,
  yearValue: number | string | undefined
) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const targetYear =
    yearValue === 1 ? 2025 :
      yearValue === 2 ? 2026 :
        yearValue === 3 ? 2027 :
          yearValue === 4 ? 2028 : 2029;
  const start = new Date(`${targetYear}-03-01T00:00:00+09:00`);

  const endYear = targetYear + 1;
  const isLeap = (endYear % 4 === 0 && endYear % 100 !== 0) || endYear % 400 === 0;
  const endDay = isLeap ? "29" : "28";
  const end = new Date(`${endYear}-02-${endDay}T23:59:59+09:00`);

  return date >= start && date <= end;
};

export const calculateScheduleYearFromDate = (
  dateString: string | undefined,
  fallbackYear: number | string | undefined
) => {
  if (!dateString) return fallbackYear;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallbackYear;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const calculatedYear = month < 3 ? year - 1 : year;

  return calculatedYear === 2025 ? 1 :
    calculatedYear === 2026 ? 2 :
      calculatedYear === 2027 ? 3 :
        calculatedYear === 2028 ? 4 :
          calculatedYear === 2029 ? 5 : fallbackYear;
};

export const sortMembersByRole = (
  members: ScheduleCommitteeMember[],
  _context?: unknown
) => {
  if (!Array.isArray(members)) return [];

  const getRolePriority = (type?: string | null) => {
    if (!type) return 2;
    if (type.includes("위원장")) return 1;
    if (type.includes("간사")) return 3;
    return 2;
  };

  return [...members].sort((first, second) => {
    const firstPriority = getRolePriority(first.type);
    const secondPriority = getRolePriority(second.type);
    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    const firstSortOrder = first.sort_order ?? 999;
    const secondSortOrder = second.sort_order ?? 999;
    return firstSortOrder - secondSortOrder;
  });
};
