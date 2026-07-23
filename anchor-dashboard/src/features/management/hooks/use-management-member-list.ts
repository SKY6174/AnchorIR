import { useState } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";

interface UseManagementMemberListOptions {
  members: LegacyAppRecord[];
  selectedYear: number;
  getMemberStatusForYear: (member: LegacyAppRecord, year: number) => string;
}

export const useManagementMemberList = ({
  members,
  selectedYear,
  getMemberStatusForYear
}: UseManagementMemberListOptions) => {
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberSortConfig, setMemberSortConfig] = useState<{
    key: string | null;
    direction: string;
  }>({ key: null, direction: "asc" });

  const requestMemberSort = (key: string) => {
    let direction = "asc";
    if (memberSortConfig.key === key && memberSortConfig.direction === "asc") {
      direction = "desc";
    }
    setMemberSortConfig({ key, direction });
  };

  const getSortedMembers = () => {
    const filtered = (members || []).filter((member) => {
      const computedStatus = getMemberStatusForYear(member, selectedYear);
      if (memberFilter === "active") return computedStatus !== "미참여";
      if (memberFilter === "retired") return computedStatus === "미참여";
      return true;
    });

    const sorted = [...filtered];

    if (!memberSortConfig.key) {
      return sorted.sort((a, b) => {
        const roleRanks: Record<string, number> = {
          "사업단장": 1,
          "본부장": 2,
          "센터장": 3,
          "운영팀장": 4,
          "팀장교수": 4,
          "연구원": 5
        };
        const rankA = roleRanks[a.role] || 99;
        const rankB = roleRanks[b.role] || 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        if (a.role === "센터장" && b.role === "센터장") {
          const centerOrder: Record<string, number> = {
            "ECC센터": 1,
            "ICC센터": 2,
            "RCC센터": 3,
            "울산늘봄누리센터": 4,
            "신산업특화센터": 5
          };
          const orderA = centerOrder[a.dept] || 99;
          const orderB = centerOrder[b.dept] || 99;
          if (orderA !== orderB) return orderA - orderB;
        }

        if (a.role === "운영팀장" && b.role !== "운영팀장") return -1;
        if (a.role !== "운영팀장" && b.role === "운영팀장") return 1;

        if (a.role === "연구원" && b.role === "연구원") {
          const deptOrder: Record<string, number> = {
            "ECC센터": 1,
            "ICC센터": 2,
            "RCC센터": 3,
            "AID-X지원센터": 4,
            "울산늘봄누리센터": 5,
            "신산업특화센터": 6
          };
          const deptValueA = deptOrder[a.dept] || 99;
          const deptValueB = deptOrder[b.dept] || 99;
          if (deptValueA !== deptValueB) {
            return deptValueA - deptValueB;
          }

          const gradeOrder: Record<string, number> = {
            "책임연구원": 1,
            "선임연구원": 2,
            "연구원": 3
          };
          const gradeValueA = gradeOrder[a.grade] || 99;
          const gradeValueB = gradeOrder[b.grade] || 99;
          if (gradeValueA !== gradeValueB) {
            return gradeValueA - gradeValueB;
          }
        }

        return a.id.localeCompare(b.id, "en");
      });
    }

    return sorted.sort((a, b) => {
      let valueA = a[memberSortConfig.key!] || "";
      let valueB = b[memberSortConfig.key!] || "";

      if (memberSortConfig.key === "startDate") {
        valueA = a.startDate || a.hireDate || "";
        valueB = b.startDate || b.hireDate || "";
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return memberSortConfig.direction === "asc"
          ? valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: "base" })
          : valueB.localeCompare(valueA, undefined, { numeric: true, sensitivity: "base" });
      }

      if (valueA < valueB) return memberSortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return memberSortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  return {
    getSortedMembers,
    memberFilter,
    memberSortConfig,
    requestMemberSort,
    setMemberFilter
  };
};
