export type PadesProfile = "B-T" | "B-LT" | "B-LTA";

export type CommitteeSigningErrorCode =
  | "feature_disabled"
  | "provider_not_configured"
  | "forbidden"
  | "not_found"
  | "invalid_request"
  | "invalid_snapshot"
  | "digest_mismatch"
  | "signing_failed"
  | "network_error"
  | "server_error";

export class CommitteeSigningError extends Error {
  constructor(readonly code: CommitteeSigningErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CommitteeSigningError";
  }
}

export interface CommitteeSigningFeatureConfig {
  enabled: boolean;
  providerReady: boolean;
}

export interface CommitteeSigningStatus {
  id: string;
  snapshot_id: string;
  status: "pending" | "signing" | "signed" | "failed" | "revoked";
  provider: string;
  pades_profile: PadesProfile;
  unsigned_sha256: string;
  signed_sha256?: string | null;
  certificate_subject?: string | null;
  certificate_issuer?: string | null;
  certificate_fingerprint?: string | null;
  signature_algorithm?: string | null;
  signed_at?: string | null;
  tsa_subject?: string | null;
  timestamp_at?: string | null;
  validation_result?: Record<string, unknown> | null;
  error_code?: string | null;
}

export function createCommitteeSigningFeatureConfig(
  env: Record<string, string | boolean | undefined>
): CommitteeSigningFeatureConfig {
  return {
    enabled: env.VITE_ENABLE_PADES_SIGNING === true || env.VITE_ENABLE_PADES_SIGNING === "true",
    providerReady: env.VITE_PADES_PROVIDER_READY === true || env.VITE_PADES_PROVIDER_READY === "true"
  };
}

export function assertCommitteeSigningReady(config: CommitteeSigningFeatureConfig): void {
  if (!config.enabled) {
    throw new CommitteeSigningError("feature_disabled", "공인 전자서명 기능이 활성화되지 않았습니다.");
  }
  if (!config.providerReady) {
    throw new CommitteeSigningError("provider_not_configured", "전자서명 제공자 설정이 완료되지 않았습니다.");
  }
}

export function validatePadesProfile(value: string): PadesProfile {
  if (value === "B-T" || value === "B-LT" || value === "B-LTA") return value;
  throw new CommitteeSigningError("invalid_request");
}

export function validatePdfSha256(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new CommitteeSigningError("invalid_request");
  }
  return normalized;
}

export function validateSigningObjectPath(
  value: string,
  meetingId: string,
  snapshotId: string
): string {
  const normalized = value.trim();
  const expectedPrefix = `${meetingId}/${snapshotId}/`;
  if (
    normalized.includes("..")
    || !normalized.startsWith(expectedPrefix)
    || !/^[0-9a-f-]+\/[0-9a-f-]+\/[0-9a-f-]+\.pdf$/.test(normalized)
  ) {
    throw new CommitteeSigningError("invalid_request");
  }
  return normalized;
}

export function assertUnsignedPdf(bytes: Uint8Array): void {
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (bytes.byteLength < 5 || bytes.byteLength > 20 * 1024 * 1024 || header !== "%PDF-") {
    throw new CommitteeSigningError("invalid_request");
  }
}

export async function computePdfSha256(bytes: Uint8Array): Promise<string> {
  assertUnsignedPdf(bytes);
  const digestInput = Uint8Array.from(bytes).buffer;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", digestInput));
  return Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
}

export function getCommitteeSigningErrorMessage(error: unknown): string {
  if (!(error instanceof CommitteeSigningError)) {
    return "전자서명 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
  const messages: Record<CommitteeSigningErrorCode, string> = {
    feature_disabled: "공인 전자서명 기능이 활성화되지 않았습니다.",
    provider_not_configured: "전자서명 제공자 설정이 완료되지 않았습니다.",
    forbidden: "전자서명을 요청할 권한이 없습니다.",
    not_found: "전자서명 대상 문서를 찾을 수 없습니다.",
    invalid_request: "전자서명 요청 형식이 올바르지 않습니다.",
    invalid_snapshot: "유효하지 않거나 폐기된 결과보고서입니다.",
    digest_mismatch: "서명 대상 PDF의 무결성 값이 일치하지 않습니다.",
    signing_failed: "전자서명 제공자가 문서를 서명하지 못했습니다.",
    network_error: "전자서명 서버에 연결할 수 없습니다.",
    server_error: "전자서명 서버에서 요청을 처리하지 못했습니다."
  };
  return messages[error.code];
}
