import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PADES_PROVIDER = (Deno.env.get("COMMITTEE_PADES_PROVIDER") ?? "").trim();
const ALLOWED_ORIGINS = (Deno.env.get("COMMITTEE_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

type ErrorCode =
  | "forbidden"
  | "not_found"
  | "invalid_request"
  | "invalid_snapshot"
  | "digest_mismatch"
  | "provider_not_configured"
  | "signing_failed"
  | "server_error";

class SigningFunctionError extends Error {
  constructor(readonly code: ErrorCode, readonly status = 400) {
    super(code);
  }
}

interface SigningResult {
  signedPdf: Uint8Array;
  certificateSubject: string;
  certificateIssuer: string;
  certificateSerial: string;
  certificateFingerprint: string;
  signatureAlgorithm: string;
  signedAt: string;
  tsaSubject: string;
  timestampAt: string;
  validationResult: Record<string, unknown>;
}

interface PadesProvider {
  sign(pdf: Uint8Array, profile: "B-T" | "B-LT" | "B-LTA"): Promise<SigningResult>;
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.length === 0
    ? origin
    : (ALLOWED_ORIGINS.includes(origin) ? origin : "");
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function respond(request: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json; charset=utf-8" }
  });
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(bytes: Uint8Array): Promise<string> {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}

function getProvider(): PadesProvider {
  // A real provider adapter must be added only after its HSM/KMS, certificate chain,
  // TSA, response validation contract and operational ownership are approved.
  throw new SigningFunctionError("provider_not_configured", 503);
}

async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const jwt = authorization.replace(/^Bearer\s+/i, "");
  if (!jwt) throw new SigningFunctionError("forbidden", 403);

  const { data: userData, error: userError } = await service.auth.getUser(jwt);
  if (userError || !userData.user) throw new SigningFunctionError("forbidden", 403);

  const { data: riseUser, error: roleError } = await service
    .from("rise_users")
    .select("uuid, approved, role_key")
    .eq("uuid", userData.user.id)
    .maybeSingle();
  const allowedRoles = new Set([
    "ADMIN", "DIRECTOR", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER",
    "CENTER_ECC", "CENTER_ICC", "CENTER_RCC", "CENTER_NURI", "CENTER_SPECIAL"
  ]);
  if (roleError || !riseUser?.approved || !allowedRoles.has(riseUser.role_key)) {
    throw new SigningFunctionError("forbidden", 403);
  }
  return userData.user;
}

function readProfile(value: unknown): "B-T" | "B-LT" | "B-LTA" {
  if (value === "B-T" || value === "B-LT" || value === "B-LTA") return value;
  throw new SigningFunctionError("invalid_request");
}

function readUuid(value: unknown): string {
  const text = String(value ?? "").trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(text)) {
    throw new SigningFunctionError("invalid_request");
  }
  return text;
}

function readDigest(value: unknown): string {
  const text = String(value ?? "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(text)) throw new SigningFunctionError("invalid_request");
  return text;
}

function readObjectPath(value: unknown, snapshotId: string): string {
  const text = String(value ?? "").trim();
  const pathPattern = /^[0-9a-f-]+\/[0-9a-f-]+\/[0-9a-f-]+\.pdf$/;
  if (!pathPattern.test(text) || text.includes("..") || text.split("/")[1] !== snapshotId) {
    throw new SigningFunctionError("invalid_request");
  }
  return text;
}

async function signingStatus(signatureId: string) {
  const { data, error } = await service
    .from("committee_report_signatures")
    .select("id, snapshot_id, status, provider, pades_profile, unsigned_sha256, signed_sha256, certificate_subject, certificate_issuer, certificate_fingerprint, signature_algorithm, signed_at, tsa_subject, timestamp_at, validation_result, error_code, created_at, updated_at")
    .eq("id", signatureId)
    .maybeSingle();
  if (error) throw new SigningFunctionError("server_error", 500);
  if (!data) throw new SigningFunctionError("not_found", 404);
  return data;
}

async function signedDownload(signatureId: string) {
  const { data: signature, error } = await service
    .from("committee_report_signatures")
    .select("status, signed_object_path")
    .eq("id", signatureId)
    .maybeSingle();
  if (error) throw new SigningFunctionError("server_error", 500);
  if (!signature || signature.status !== "signed" || !signature.signed_object_path) {
    throw new SigningFunctionError("not_found", 404);
  }
  const { data, error: urlError } = await service.storage
    .from("committee-signed-reports")
    .createSignedUrl(signature.signed_object_path, 300);
  if (urlError || !data?.signedUrl) throw new SigningFunctionError("server_error", 500);
  return { signedUrl: data.signedUrl, expiresIn: 300 };
}

async function requestSignature(userId: string, body: Record<string, unknown>) {
  if (!PADES_PROVIDER) throw new SigningFunctionError("provider_not_configured", 503);

  const snapshotId = readUuid(body.snapshotId);
  const profile = readProfile(body.padesProfile ?? "B-T");
  const unsignedSha256 = readDigest(body.unsignedSha256);
  const unsignedObjectPath = readObjectPath(body.unsignedObjectPath, snapshotId);

  const { data: snapshot, error: snapshotError } = await service
    .from("committee_report_snapshots")
    .select("id, meeting_id, invalidated_at")
    .eq("id", snapshotId)
    .maybeSingle();
  if (snapshotError) throw new SigningFunctionError("server_error", 500);
  if (!snapshot || snapshot.invalidated_at) throw new SigningFunctionError("invalid_snapshot");
  if (unsignedObjectPath.split("/")[0] !== snapshot.meeting_id) {
    throw new SigningFunctionError("invalid_request");
  }

  const { data: file, error: downloadError } = await service.storage
    .from("committee-report-staging")
    .download(unsignedObjectPath);
  if (downloadError || !file) throw new SigningFunctionError("not_found", 404);
  const unsignedPdf = new Uint8Array(await file.arrayBuffer());
  if (unsignedPdf.byteLength < 5 || new TextDecoder().decode(unsignedPdf.slice(0, 5)) !== "%PDF-") {
    throw new SigningFunctionError("invalid_request");
  }
  if (await sha256(unsignedPdf) !== unsignedSha256) {
    throw new SigningFunctionError("digest_mismatch");
  }

  const { data: signature, error: requestError } = await service.rpc(
    "create_committee_report_signature_request",
    {
      p_snapshot_id: snapshotId,
      p_requested_by: userId,
      p_provider: PADES_PROVIDER,
      p_pades_profile: profile,
      p_unsigned_object_path: unsignedObjectPath,
      p_unsigned_sha256: unsignedSha256
    }
  );
  if (requestError || !signature) throw new SigningFunctionError("server_error", 500);
  if (signature.status === "signed") return signingStatus(signature.id);

  await service.from("committee_report_signatures")
    .update({ status: "signing", error_code: null })
    .eq("id", signature.id)
    .eq("status", "pending");

  try {
    const result = await getProvider().sign(unsignedPdf, profile);
    const signedSha256 = await sha256(result.signedPdf);
    const signedObjectPath = `${snapshot.meeting_id}/${snapshotId}/${signature.id}.pdf`;
    const { error: uploadError } = await service.storage
      .from("committee-signed-reports")
      .upload(signedObjectPath, result.signedPdf, {
        contentType: "application/pdf",
        upsert: false
      });
    if (uploadError) throw new SigningFunctionError("signing_failed", 502);

    const { error: updateError } = await service.from("committee_report_signatures")
      .update({
        status: "signed",
        signed_object_path: signedObjectPath,
        signed_sha256: signedSha256,
        certificate_subject: result.certificateSubject,
        certificate_issuer: result.certificateIssuer,
        certificate_serial: result.certificateSerial,
        certificate_fingerprint: result.certificateFingerprint,
        signature_algorithm: result.signatureAlgorithm,
        signed_at: result.signedAt,
        tsa_subject: result.tsaSubject,
        timestamp_at: result.timestampAt,
        validation_result: result.validationResult,
        error_code: null
      })
      .eq("id", signature.id);
    if (updateError) throw new SigningFunctionError("server_error", 500);
    return signingStatus(signature.id);
  } catch (error) {
    const code = error instanceof SigningFunctionError ? error.code : "signing_failed";
    await service.from("committee_report_signatures")
      .update({ status: "failed", error_code: code })
      .eq("id", signature.id);
    throw error;
  }
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return respond(request, 405, { ok: false, error: { code: "invalid_request" } });

  try {
    const user = await requireAdmin(request);
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? "");
    const data = action === "request"
      ? await requestSignature(user.id, body)
      : action === "status"
        ? await signingStatus(readUuid(body.signatureId))
        : action === "download"
          ? await signedDownload(readUuid(body.signatureId))
          : (() => { throw new SigningFunctionError("invalid_request"); })();
    return respond(request, 200, { ok: true, data });
  } catch (error) {
    const resolved = error instanceof SigningFunctionError
      ? error
      : new SigningFunctionError("server_error", 500);
    return respond(request, resolved.status, {
      ok: false,
      error: { code: resolved.code, message: resolved.code }
    });
  }
});
