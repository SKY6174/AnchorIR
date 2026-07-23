export type CommitteeVoteDecision = "APPROVE" | "REJECT" | "ABSTAIN";

export type CommitteeVoteErrorCode =
  | "INVALID_CREDENTIALS"
  | "LOCKED"
  | "MEETING_CLOSED"
  | "INCOMPLETE_AGENDAS"
  | "CONFLICT"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "SERVER_ERROR";

export interface PublicCommitteeMeeting {
  id: string;
  public_code: string;
  committee_id: string;
  title: string;
  meeting_date?: string | null;
  meeting_type?: string | null;
  status: string;
}

export interface CommitteeVoter {
  id: string | number;
  name: string;
  type?: string;
  role_code?: "CHAIRMAN" | "MEMBER" | "SECRETARY";
  org?: string;
  dept?: string;
  rank?: string;
}

export interface CommitteeVoteAgenda {
  id: string;
  meeting_id: string;
  title: string;
  description?: string | null;
  is_evaluation: boolean;
  sort_order: number;
  attachment_name?: string | null;
  attachment_data?: string | null;
}

export interface CommitteeVoteContext {
  meeting: PublicCommitteeMeeting & Record<string, unknown>;
  member: CommitteeVoter;
  agendas: CommitteeVoteAgenda[];
  existing_votes?: CommitteeVoteSubmissionItem[];
  has_submitted: boolean;
  revision?: number;
}

export interface CommitteeVoteSubmissionItem {
  agenda_id: string;
  vote: CommitteeVoteDecision | null;
  score: number | null;
  opinion: string;
}

export interface CommitteeVoteSubmission {
  idempotency_key: string;
  signature_data_url: string;
  votes: CommitteeVoteSubmissionItem[];
}

export interface CommitteeVoteSubmissionResult {
  revision: number;
  submitted_at: string;
  idempotent_replay?: boolean;
}

export interface CommitteeReportSnapshot {
  snapshot_id: string;
  payload_sha256: string;
  verification_code: string;
  finalized_at: string;
  signature_urls: Record<string, string>;
  payload: {
    meeting: Record<string, any>;
    committee: Record<string, any> | null;
    result: Record<string, any>;
    agendas: Array<Record<string, any>>;
    votes: Array<Record<string, any>>;
    responses: Array<Record<string, any>>;
    roster: Array<Record<string, any>>;
  };
}

export class CommitteeVoteApiError extends Error {
  readonly code: CommitteeVoteErrorCode;
  readonly status?: number;

  constructor(code: CommitteeVoteErrorCode, message: string, status?: number) {
    super(message);
    this.name = "CommitteeVoteApiError";
    this.code = code;
    this.status = status;
  }
}
