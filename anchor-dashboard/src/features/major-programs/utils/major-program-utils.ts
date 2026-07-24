import type {
  CourseStatus,
  StudentRecord
} from "../major-program-types";

export const getOverallStatus = (student: StudentRecord): CourseStatus => {
  const statuses = [student.capstone, student.pbl, student.omnibus, student.ai];
  if (statuses.includes("진행중")) return "진행중";
  if (statuses.includes("이수완료")) return "이수완료";
  return "미참여";
};
