export type ScheduleItem = Record<string, any> & {
  id?: number | string;
  title?: string;
  date?: string;
  year?: number | string;
};

export type ScheduleCommitteeMember = Record<string, any> & {
  id?: number | string;
  name: string;
  type?: string | null;
};

export type ScheduleFormData = Record<string, any>;

export interface ScheduleMemberFormData {
  type: string;
  name: string;
  org: string;
  dept: string;
  rank: string;
  location: string;
  term: string;
  termStart: string;
  termEnd: string;
  note: string;
}

export interface AgendaResultPair {
  agenda: string;
  result: string;
}

export interface AiDebateLog {
  role: string;
  text: string;
}
