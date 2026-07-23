import { supabase } from "../supabaseClient";
import {
  assertCommitteeSigningReady,
  CommitteeSigningError,
  computePdfSha256,
  createCommitteeSigningFeatureConfig,
  validatePadesProfile,
  validatePdfSha256,
  validateSigningObjectPath,
  type CommitteeSigningErrorCode,
  type CommitteeSigningStatus,
  type PadesProfile
} from "./committee-signing-core";

interface SigningEnvelope<T> {
  ok?: boolean;
  data?: T;
  error?: { code?: CommitteeSigningErrorCode; message?: string };
}

const FUNCTION_NAME = "committee-report-sign";
export const committeeSigningFeatureConfig = Object.freeze(
  createCommitteeSigningFeatureConfig(import.meta.env)
);

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });
  const envelope = data as SigningEnvelope<T> | null;
  if (error || !envelope?.ok || envelope.data === undefined) {
    const code = envelope?.error?.code
      ?? (error?.message?.toLowerCase().includes("fetch") ? "network_error" : "server_error");
    throw new CommitteeSigningError(code, envelope?.error?.message || error?.message);
  }
  return envelope.data;
}

export async function requestCommitteeReportSignature(input: {
  meetingId: string;
  snapshotId: string;
  unsignedObjectPath: string;
  unsignedSha256: string;
  padesProfile?: PadesProfile;
}): Promise<CommitteeSigningStatus> {
  assertCommitteeSigningReady(committeeSigningFeatureConfig);
  const padesProfile = validatePadesProfile(input.padesProfile ?? "B-T");
  return invoke<CommitteeSigningStatus>({
    action: "request",
    snapshotId: input.snapshotId,
    unsignedObjectPath: validateSigningObjectPath(
      input.unsignedObjectPath,
      input.meetingId,
      input.snapshotId
    ),
    unsignedSha256: validatePdfSha256(input.unsignedSha256),
    padesProfile
  });
}

export async function stageCommitteeReportForSigning(input: {
  meetingId: string;
  snapshotId: string;
  pdf: Blob;
}): Promise<{ unsignedObjectPath: string; unsignedSha256: string }> {
  assertCommitteeSigningReady(committeeSigningFeatureConfig);
  const bytes = new Uint8Array(await input.pdf.arrayBuffer());
  const unsignedSha256 = await computePdfSha256(bytes);
  const unsignedObjectPath = validateSigningObjectPath(
    `${input.meetingId}/${input.snapshotId}/${crypto.randomUUID()}.pdf`,
    input.meetingId,
    input.snapshotId
  );
  const { error } = await supabase.storage
    .from("committee-report-staging")
    .upload(unsignedObjectPath, input.pdf, {
      contentType: "application/pdf",
      upsert: false
    });
  if (error) {
    throw new CommitteeSigningError(
      error.message.toLowerCase().includes("fetch") ? "network_error" : "server_error"
    );
  }
  return { unsignedObjectPath, unsignedSha256 };
}

export function getCommitteeReportSignatureStatus(
  signatureId: string
): Promise<CommitteeSigningStatus> {
  assertCommitteeSigningReady(committeeSigningFeatureConfig);
  return invoke<CommitteeSigningStatus>({ action: "status", signatureId });
}

export function getSignedCommitteeReportDownload(
  signatureId: string
): Promise<{ signedUrl: string; expiresIn: number }> {
  assertCommitteeSigningReady(committeeSigningFeatureConfig);
  return invoke<{ signedUrl: string; expiresIn: number }>({
    action: "download",
    signatureId
  });
}

export {
  getCommitteeSigningErrorMessage
} from "./committee-signing-core";
