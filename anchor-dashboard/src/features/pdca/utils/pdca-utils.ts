export type LegacyPdcaRecord = Record<string, any>;

export const getErrorDetails = (error: unknown): string => {
  if (error && typeof error === "object") {
    const record = error as LegacyPdcaRecord;
    return record.message || record.details || JSON.stringify(record);
  }
  return String(error);
};

export const formatAssignee = (assigneeText?: string): string => {
  if (!assigneeText) return "미배정";
  const parts = assigneeText.split(/[,/]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2) {
    return `${parts[0]}(정), ${parts[1]}(부)`;
  }
  return assigneeText;
};

export const formatToMillionWon = (value?: number | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

export const parseTimelineDates = (timelineStr: string) => {
  if (!timelineStr || !timelineStr.includes("~")) return { start: "", end: "" };
  const parts = timelineStr.split("~").map((part) => part.trim());

  const toYYYYMMDD = (value: string) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const dotted = value.replace(/\./g, "-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(dotted)) return dotted;
    if (/^\d{4}-\d{2}$/.test(dotted)) return `${dotted}-01`;
    return dotted;
  };

  return {
    start: toYYYYMMDD(parts[0]),
    end: toYYYYMMDD(parts[1] || parts[0]),
  };
};

export const getRequesterRoleName = (
  user: LegacyPdcaRecord | null | undefined,
) => {
  if (!user) return "실무자";
  if (typeof user.role === "string") return user.role;
  if (user.role && typeof user.role === "object") {
    return user.role.name || user.role.role || "실무자";
  }
  if (user.role_key) {
    const roleNames: Record<string, string> = {
      ADMIN: "최고 관리자",
      G_DIRECTOR: "사업단장",
      HQ_HEAD: "총괄본부장",
      TEAM_LEADER: "팀장교수",
      MANAGER: "운영팀장",
      RESEARCHER: "실무 연구원",
      RESEARCH: "연구원",
    };
    return roleNames[user.role_key] || user.role_key;
  }
  return "실무자";
};

export const BUDGET_CATEGORIES_OPTIONS = [
  { value: "", label: "선택 안 함" },
  { value: "인건비", label: "인건비" },
  { value: "장학금", label: "장학금" },
  { value: "교육∙연구 프로그램 개발∙운영비", label: "프로그램개발운영비" },
  { value: "교육∙연구 환경개선비", label: "환경개선비" },
  { value: "실험∙실습장비 및 기자재 구입∙운영비", label: "실험실습장비비" },
  { value: "지역 연계∙협업 지원비", label: "지역연계협업비" },
  { value: "기업 지원∙협력 활동비", label: "기업지원협력비" },
  { value: "성과 활용∙확산 지원비", label: "성과활용확산비" },
  { value: "그 밖의 사업운영경비", label: "기타사업운영경비" },
  { value: "간접비", label: "간접비" },
];

export const parseTimelineToMonths = (timelineStr: string) => {
  const defaultValue = Array(12).fill("");
  if (!timelineStr) return defaultValue;

  if (timelineStr.includes(",")) {
    const parts = timelineStr.split(",");
    if (parts.length === 12) {
      return parts.map((part) => {
        const trimmed = part.trim().toUpperCase();
        if (trimmed.split("").some((char) => ["P", "D", "C", "A"].includes(char))) {
          return trimmed;
        }
        return "";
      });
    }
  }

  const dates = parseTimelineDates(timelineStr);
  if (dates.start && dates.end) {
    try {
      const startMonth = parseInt(dates.start.split("-")[1], 10);
      const endMonth = parseInt(dates.end.split("-")[1], 10);

      const getMonthIndex = (month: number) => {
        if (month >= 3 && month <= 12) return month - 3;
        if (month === 1 || month === 2) return month + 9;
        return -1;
      };

      const startIndex = getMonthIndex(startMonth);
      const endIndex = getMonthIndex(endMonth);

      if (startIndex !== -1 && endIndex !== -1) {
        const result = Array(12).fill("");
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        for (let index = start; index <= end; index++) {
          result[index] = "P";
        }
        return result;
      }
    } catch (error) {
      console.error("Parse timeline to months error:", error);
    }
  }

  return defaultValue;
};

export const parseDecimalFromCommas = (
  value: number | string | null | undefined,
) => {
  if (!value) return 0;
  return parseFloat(String(value).replace(/,/g, "")) || 0;
};
