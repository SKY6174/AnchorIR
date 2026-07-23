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

export type CommitteeWorkbookParseResult =
  | { status: "no-data"; members: [] }
  | { status: "no-members"; members: [] }
  | { status: "success"; members: any[] };

export const parseCommitteeMemberWorkbook = async (
  arrayBuffer: ArrayBuffer,
  committeeId: string,
  currentMemberCount: number,
  selectedYear: number | string | undefined
): Promise<CommitteeWorkbookParseResult> => {
  const XLSX = await import("xlsx");
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });

  if (rows.length <= 1) {
    return { status: "no-data", members: [] };
  }

  const members: any[] = [];
  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];
    if (!row || row.length < 2 || !row[1]) continue;

    members.push({
      committee_id: committeeId,
      type: row[0] || "위원",
      name: String(row[1]).trim(),
      org: row[2] || "울산과학대학교",
      dept: row[3] || "-",
      rank: row[4] || "",
      location: row[5] || "교내",
      year: selectedYear,
      note: row[6] || "",
      sort_order: currentMemberCount + index
    });
  }

  if (members.length === 0) {
    return { status: "no-members", members: [] };
  }

  return { status: "success", members };
};
