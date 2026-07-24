export interface SurveyResponse {
  id: number | string;
  responder: string;
  scores: number[];
  comment?: string | null;
  date?: string;
}

export interface SatisfactionSurvey {
  id: string;
  title: string;
  purpose?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  target?: string | null;
  department?: string | null;
  status?: string | null;
  googleSheetUrl?: string | null;
  questions: string[];
  responses: SurveyResponse[];
  aiReport?: string | null;
  created_at?: string;
}

export interface DebateLog {
  sender: "system" | "gpt" | "gemini";
  message: string;
}

export interface AiSurveyData {
  title: string;
  target: string;
  startDate: string;
  endDate: string;
  purpose: string;
  questions: string[];
  responsesCount: number;
  averageScore: number;
  comments: string[];
  gptOpinion?: string;
  geminiOpinion?: string;
  consensusOpinion?: string;
}
