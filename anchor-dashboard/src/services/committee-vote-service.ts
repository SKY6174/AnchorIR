import { supabase } from "../supabaseClient";
import {
  CommitteeVoteApiError,
  CommitteeVoteContext,
  CommitteeVoteErrorCode,
  CommitteeReportSnapshot,
  CommitteeVoteSubmission,
  CommitteeVoteSubmissionResult,
  CommitteeVoter,
  PublicCommitteeMeeting
} from "../types/committee-vote";

interface FunctionEnvelope<T> {
  ok?: boolean;
  data?: T;
  error?: {
    code?: CommitteeVoteErrorCode;
    message?: string;
  };
}

interface AuthenticationResult {
  token: string;
  member: CommitteeVoter;
  expires_at: string;
}

const FUNCTION_NAME = "committee-vote";

async function toApiError(error: unknown, envelope?: FunctionEnvelope<unknown>): Promise<CommitteeVoteApiError> {
  let resolvedEnvelope = envelope;
  const response = (error as { context?: unknown } | null)?.context;
  if (!resolvedEnvelope?.error && response instanceof Response) {
    try {
      resolvedEnvelope = await response.clone().json() as FunctionEnvelope<unknown>;
    } catch {
      // The stable fallback below handles a non-JSON function response.
    }
  }
  const nestedCode = resolvedEnvelope?.error?.code;
  const nestedMessage = resolvedEnvelope?.error?.message;
  const rawMessage = error instanceof Error ? error.message : String(error || "");
  const code = nestedCode || (rawMessage.toLowerCase().includes("fetch") ? "NETWORK_ERROR" : "SERVER_ERROR");
  return new CommitteeVoteApiError(code, nestedMessage || rawMessage || "위원회 서버 요청에 실패했습니다.");
}

async function invoke<T>(action: string, body: Record<string, unknown>): Promise<T> {
  if (!supabase?.functions?.invoke) {
    throw new CommitteeVoteApiError("NETWORK_ERROR", "위원회 보안 서버에 연결할 수 없습니다.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action, ...body },
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
  });
  const envelope = data as FunctionEnvelope<T> | null;

  if (error || !envelope?.ok || envelope.data === undefined) {
    throw await toApiError(error, envelope || undefined);
  }

  return envelope.data;
}

export function getPublicCommitteeMeeting(accessCode: string): Promise<PublicCommitteeMeeting> {
  return invoke<PublicCommitteeMeeting>("public", { access_code: accessCode.trim() });
}

export function authenticateCommitteeVoter(
  accessCode: string,
  name: string,
  pin: string
): Promise<AuthenticationResult> {
  return invoke<AuthenticationResult>("authenticate", {
    access_code: accessCode.trim(),
    name: name.trim(),
    pin: pin.trim()
  });
}

export function getCommitteeVoteContext(token: string): Promise<CommitteeVoteContext> {
  return invoke<CommitteeVoteContext>("context", { voter_token: token });
}

export function submitCommitteeVote(
  token: string,
  submission: CommitteeVoteSubmission
): Promise<CommitteeVoteSubmissionResult> {
  return invoke<CommitteeVoteSubmissionResult>("submit", {
    voter_token: token,
    submission
  });
}

export function submitAuthenticatedCommitteeVote(
  meetingId: string,
  submission: CommitteeVoteSubmission
): Promise<CommitteeVoteSubmissionResult> {
  return invoke<CommitteeVoteSubmissionResult>("submit-authenticated", {
    meeting_id: meetingId,
    submission
  });
}

export function createCommitteeReportSnapshot(meetingId: string): Promise<CommitteeReportSnapshot> {
  return invoke<CommitteeReportSnapshot>("report-snapshot", { meeting_id: meetingId });
}

export function verifyCommitteeReport(snapshotId: string, verificationCode: string) {
  return invoke<{ valid: boolean; meeting_id?: string; payload_sha256?: string; finalized_at?: string }>("verify-report", {
    snapshot_id: snapshotId,
    verification_code: verificationCode
  });
}

export function uploadCommitteeDocument(
  meetingId: string,
  fileName: string,
  dataUrl: string
): Promise<{ attachment_path: string }> {
  return invoke<{ attachment_path: string }>("upload-document", {
    meeting_id: meetingId,
    file_name: fileName,
    data_url: dataUrl
  });
}

export function deleteCommitteeDocuments(
  meetingId: string,
  attachmentPaths: string[]
): Promise<{ removed: number }> {
  return invoke<{ removed: number }>("delete-documents", {
    meeting_id: meetingId,
    attachment_paths: attachmentPaths
  });
}

export function getCommitteeVoteErrorMessage(error: unknown): string {
  if (!(error instanceof CommitteeVoteApiError)) {
    return "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const messages: Record<CommitteeVoteErrorCode, string> = {
    INVALID_CREDENTIALS: "성명 또는 보안 PIN을 확인해 주세요.",
    LOCKED: "인증 시도가 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.",
    MEETING_CLOSED: "현재 심의·의결을 제출할 수 없는 회의입니다.",
    INCOMPLETE_AGENDAS: "모든 안건의 표결 또는 평가를 선택해 주세요.",
    CONFLICT: "회의 정보가 변경되었습니다. 새로고침 후 다시 제출해 주세요.",
    FORBIDDEN: "이 회의에 접근할 권한이 없습니다.",
    NOT_FOUND: "유효한 회의 접근 링크가 아닙니다.",
    INVALID_DOCUMENT: "올바른 PDF 문서가 아닙니다.",
    DOCUMENT_TOO_LARGE: "PDF 문서가 20MB 제한을 초과했습니다.",
    STORAGE_NOT_CONFIGURED: "위원회 보안 저장소가 운영 서버에 구성되지 않았습니다.",
    STORAGE_UPLOAD_FAILED: "위원회 보안 저장소에 문서를 업로드하지 못했습니다.",
    NETWORK_ERROR: "위원회 보안 서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.",
    SERVER_ERROR: "위원회 서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
  };

  return messages[error.code] || error.message;
}
