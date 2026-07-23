import type { AgendaResultPair, ScheduleFormData } from "../schedule-types";

export const applyMeetingAiDataRules = (
  aiData: ScheduleFormData,
  previousFormData: ScheduleFormData
): ScheduleFormData => {
  const title = aiData.title || previousFormData.title;
  const location = aiData.location || previousFormData.location;

  let category = previousFormData.category || "operating";
  let committeeType = previousFormData.committeeType || "agency";
  let department = previousFormData.dept || "사업운영팀";

  const isCommitteeTitle =
    title &&
    (title.includes("위원회") || title.includes("자문회의") || title.includes("협의회"));
  if (isCommitteeTitle) {
    category = "committee";

    const agencyCommittees = [
      "앵커총괄위원회",
      "앵커기획위원회",
      "앵커사업비관리위원회",
      "앵커사업자체평가위원회",
      "앵커사업자문회의"
    ];
    const cleanedTitle = title.replace(/\s+/g, "");
    const foundAgency = agencyCommittees.find(name => {
      const cleanedName = name.replace(/\s+/g, "");
      const cleanedShortName = cleanedName.replace("앵커", "");
      return cleanedTitle.includes(cleanedName) || cleanedTitle.includes(cleanedShortName);
    });

    if (foundAgency) {
      committeeType = "agency";
      department = foundAgency;
    } else {
      const centerCommittees = [
        { key: "ECC센터", match: ["ECC", "ecc"] },
        { key: "ICC센터", match: ["ICC", "icc"] },
        { key: "RCC센터", match: ["RCC", "rcc"] },
        { key: "AID-X지원센터", match: ["AID-X", "aidx", "AID"] },
        { key: "울산늘봄누리센터", match: ["늘봄", "늘봄누리"] },
        { key: "신산업특화센터", match: ["신산업", "특화센터"] }
      ];

      const foundCenter = centerCommittees.find(center =>
        center.match.some(match => title.toLowerCase().includes(match.toLowerCase()))
      );
      if (foundCenter) {
        committeeType = "center";
        department = foundCenter.key;
      }
    }
  }

  const isWrittenQuery =
    location &&
    (location.includes("서면부의") ||
      location.includes("서면 회의") ||
      location.includes("이메일"));
  const isTimeOmitted =
    !aiData.meetingStartTime ||
    !aiData.meetingEndTime ||
    aiData.meetingStartTime === "00:00" ||
    aiData.meetingStartTime === "";
  const shouldBeAllDay = isWrittenQuery || isTimeOmitted;

  return {
    ...previousFormData,
    title,
    location,
    category,
    committeeType: category === "committee" ? committeeType : previousFormData.committeeType,
    dept: category === "committee" ? department : previousFormData.dept,
    meetingDate: aiData.meetingDate || previousFormData.meetingDate,
    noTime: shouldBeAllDay,
    meetingStartTime: shouldBeAllDay
      ? ""
      : aiData.meetingStartTime || previousFormData.meetingStartTime || "10:00",
    meetingEndTime: shouldBeAllDay
      ? ""
      : aiData.meetingEndTime || previousFormData.meetingEndTime || "11:00",
    attendees: aiData.attendees || previousFormData.attendees
  };
};

export const buildOperatingAgendaDistribution = (
  agendaResultPairs: AgendaResultPair[],
  currentCategory: string,
  fallbackCategory: string
): ScheduleFormData => {
  const isOperating = currentCategory === "operating" || fallbackCategory === "operating";
  if (!isOperating || !agendaResultPairs || agendaResultPairs.length === 0) {
    return {};
  }

  const departments = [
    "사업운영팀",
    "ECC센터",
    "ICC센터",
    "RCC센터",
    "AID-X지원센터",
    "울산늘봄누리센터",
    "신산업특화센터"
  ];
  const agendas: Record<string, string> = {};
  const results: Record<string, string> = {};

  departments.forEach(department => {
    agendas[department] = "";
    results[department] = "";
  });

  agendaResultPairs.forEach(pair => {
    const text = pair.agenda || "";
    const resultText = pair.result || "";

    let matchedDepartment = departments.find(department => {
      const cleanedDepartment = department
        .replace("센터", "")
        .replace("지원센터", "")
        .replace("팀", "");
      return (
        text.includes(cleanedDepartment) ||
        resultText.includes(cleanedDepartment) ||
        (department === "사업운영팀" &&
          (text.includes("사업단") || resultText.includes("사업단")))
      );
    });

    if (!matchedDepartment) {
      if (text.toLowerCase().includes("ecc") || resultText.toLowerCase().includes("ecc")) {
        matchedDepartment = "ECC센터";
      } else if (
        text.toLowerCase().includes("icc") ||
        resultText.toLowerCase().includes("icc")
      ) {
        matchedDepartment = "ICC센터";
      } else if (
        text.toLowerCase().includes("rcc") ||
        resultText.toLowerCase().includes("rcc")
      ) {
        matchedDepartment = "RCC센터";
      } else if (
        text.toLowerCase().includes("aid") ||
        resultText.toLowerCase().includes("aid")
      ) {
        matchedDepartment = "AID-X지원센터";
      } else if (
        text.toLowerCase().includes("늘봄") ||
        resultText.toLowerCase().includes("늘봄")
      ) {
        matchedDepartment = "울산늘봄누리센터";
      } else if (
        text.toLowerCase().includes("신산업") ||
        resultText.toLowerCase().includes("신산업")
      ) {
        matchedDepartment = "신산업특화센터";
      } else {
        matchedDepartment = "사업운영팀";
      }
    }

    agendas[matchedDepartment] =
      (agendas[matchedDepartment] ? `${agendas[matchedDepartment]}\n` : "") + text;
    results[matchedDepartment] =
      (results[matchedDepartment] ? `${results[matchedDepartment]}\n` : "") + resultText;
  });

  return {
    operatingAgendas: agendas,
    operatingResults: results
  };
};
