import type { ScheduleCommitteeMember } from "../schedule-types";

const COMMITTEE_MEMBER_HEADERS = [
  "구분",
  "성명",
  "소속기관",
  "부서/학과",
  "직위",
  "교내외",
  "비고"
];

export const downloadCommitteeRegistrationTemplate = async () => {
  const rows = [
    ["위원장", "조홍래", "울산과학대학교", "-", "총장", "교내", "대표"],
    ["위원", "김성철", "울산과학대학교", "-", "부총장", "교내", ""]
  ];

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([COMMITTEE_MEMBER_HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "위원회_위원등록_서식");
  XLSX.writeFile(workbook, "위원회_위원등록_양식.xlsx");
};

export const downloadCommitteeMemberList = async (
  committeeName: string,
  members: ScheduleCommitteeMember[]
) => {
  const rows = members.map(member => [
    member.type || "",
    member.name || "",
    member.org || "",
    member.dept || "",
    member.rank || "",
    member.location || "",
    member.note || ""
  ]);

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([COMMITTEE_MEMBER_HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "위원명단");
  XLSX.writeFile(workbook, `${committeeName}_위원명단_목록.xlsx`);
};
