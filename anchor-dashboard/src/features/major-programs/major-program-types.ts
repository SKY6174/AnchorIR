export interface PmProfessor {
  dept: string;
  name: string;
  courses: string;
  totalStudents: number;
  uniqueStudents: number;
  note: string;
}

export interface OrderlyCourse {
  id: string;
  type: string;
  dept: string;
  name: string;
  professor: string;
  students: number;
  budget: number;
  year: number;
  isForeign?: boolean;
}

export type CourseStatus = "미참여" | "진행중" | "이수완료";
export type CourseStatusKey = "capstone" | "pbl" | "omnibus" | "ai";

export interface StudentRecord {
  id: string;
  name: string;
  dept: string;
  capstone: CourseStatus;
  pbl: CourseStatus;
  omnibus: CourseStatus;
  ai: CourseStatus;
}

export interface SeminarRecord {
  id: number;
  date: string;
  speaker: string;
  title: string;
  attendees: number;
  mainCost: number;
  carryCost: number;
  satisfaction: number;
  etc: string;
}

export interface MajorProgram {
  id: string;
  name: string;
  desc?: string;
  [key: string]: any;
}

export interface MajorUnitData {
  label: string;
  programs: MajorProgram[];
}

export interface MajorProgramsManagerProps {
  selectedYear?: number | string;
  darkMode?: boolean;
  currentUser?: any;
  currentRole?: any;
}
