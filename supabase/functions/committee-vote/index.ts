import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const REPORT_HMAC_KEY = Deno.env.get("COMMITTEE_REPORT_HMAC_KEY") ?? "";
const ALLOWED_ORIGINS = (Deno.env.get("COMMITTEE_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

type ErrorCode =
  | "INVALID_CREDENTIALS"
  | "LOCKED"
  | "MEETING_CLOSED"
  | "INCOMPLETE_AGENDAS"
  | "CONFLICT"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_DOCUMENT"
  | "DOCUMENT_TOO_LARGE"
  | "STORAGE_NOT_CONFIGURED"
  | "STORAGE_UPLOAD_FAILED"
  | "NETWORK_ERROR"
  | "SERVER_ERROR";

class VoteFunctionError extends Error {
  constructor(readonly code: ErrorCode, message: string, readonly status = 400) {
    super(message);
  }
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

async function sha256(value: string | Uint8Array): Promise<string> {
  const input = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", input)));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, canonicalize(nested)]));
  }
  return value;
}

async function hmacSha256(value: string): Promise<string> {
  if (REPORT_HMAC_KEY.length < 32) throw new VoteFunctionError("SERVER_ERROR", "REPORT_SEAL_NOT_CONFIGURED", 500);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(REPORT_HMAC_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function mapDatabaseError(error: { message?: string } | null): VoteFunctionError {
  const message = error?.message ?? "SERVER_ERROR";
  const codes: ErrorCode[] = [
    "INVALID_CREDENTIALS", "LOCKED", "MEETING_CLOSED", "INCOMPLETE_AGENDAS", "CONFLICT", "FORBIDDEN"
  ];
  const code = codes.find(candidate => message.includes(candidate)) ?? "SERVER_ERROR";
  const status = code === "FORBIDDEN" ? 403 : code === "LOCKED" ? 429 : code === "SERVER_ERROR" ? 500 : 400;
  return new VoteFunctionError(code, code, status);
}

function mapStorageError(error: { message?: string; statusCode?: string | number } | null): VoteFunctionError {
  const message = (error?.message ?? "").toLowerCase();
  const statusCode = String(error?.statusCode ?? "");

  if (message.includes("bucket") && (message.includes("not found") || statusCode === "404")) {
    return new VoteFunctionError("STORAGE_NOT_CONFIGURED", "STORAGE_NOT_CONFIGURED", 503);
  }
  if (
    statusCode === "413"
    || message.includes("maximum allowed size")
    || message.includes("payload too large")
    || message.includes("entity too large")
  ) {
    return new VoteFunctionError("DOCUMENT_TOO_LARGE", "DOCUMENT_TOO_LARGE", 413);
  }
  if (message.includes("mime type") || message.includes("invalid mime")) {
    return new VoteFunctionError("INVALID_DOCUMENT", "INVALID_DOCUMENT", 400);
  }
  return new VoteFunctionError("STORAGE_UPLOAD_FAILED", "STORAGE_UPLOAD_FAILED", 503);
}

function sanitizeStoragePdfName(fileName: string): string {
  const withoutExtension = fileName.normalize("NFKD").replace(/\.pdf$/i, "");
  const asciiBaseName = withoutExtension
    .replace(/[^\x00-\x7F]/g, "_")
    .replace(/[^0-9A-Za-z._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 80);
  return `${asciiBaseName || "document"}.pdf`;
}

async function getSession(token: string) {
  if (!token || token.length > 128) throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
  const tokenHash = await sha256(token);
  const { data, error } = await service
    .from("committee_vote_sessions")
    .select("id, meeting_id, member_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw mapDatabaseError(error);
  if (!data || data.revoked_at || new Date(data.expires_at).getTime() <= Date.now()) {
    throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
  }
  return { ...data, tokenHash };
}

async function publicMeeting(accessCode: string) {
  if (!accessCode || accessCode.length > 128) throw new VoteFunctionError("NOT_FOUND", "NOT_FOUND", 404);
  const { data, error } = await service
    .from("committee_meetings")
    .select("id, public_code, committee_id, title, meeting_date, meeting_type, status")
    .eq("public_code", accessCode.trim())
    .maybeSingle();
  if (error) throw mapDatabaseError(error);
  if (!data) throw new VoteFunctionError("NOT_FOUND", "NOT_FOUND", 404);
  return data;
}

async function authenticate(request: Request, body: Record<string, unknown>) {
  const accessCode = String(body.access_code ?? "").trim();
  const name = String(body.name ?? "").trim();
  const pin = String(body.pin ?? "").trim();
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const ipSource = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";

  const { data, error } = await service.rpc("authenticate_committee_voter", {
    p_access_code: accessCode,
    p_name: name,
    p_pin: pin,
    p_token_hash: tokenHash,
    p_expires_at: expiresAt,
    p_ip_hash: ipSource ? await sha256(ipSource) : null,
    p_user_agent_hash: userAgent ? await sha256(userAgent) : null
  });
  if (error) throw mapDatabaseError(error);
  if (data?.error_code === "LOCKED") throw new VoteFunctionError("LOCKED", "LOCKED", 429);
  if (data?.error_code) throw new VoteFunctionError("INVALID_CREDENTIALS", "INVALID_CREDENTIALS");

  return { token, member: data.member, expires_at: expiresAt };
}

async function context(token: string) {
  const session = await getSession(token);
  const [{ data: meeting, error: meetingError }, { data: member, error: memberError }] = await Promise.all([
    service.from("committee_meetings")
      .select("id, public_code, committee_id, title, meeting_date, meeting_type, status, agenda")
      .eq("id", session.meeting_id).single(),
    service.from("committee_members")
      .select("id, name, type, role_code, org, dept, rank")
      .eq("id", session.member_id).single()
  ]);
  if (meetingError || memberError) throw mapDatabaseError(meetingError || memberError);

  const { data: agendas, error: agendaError } = await service
    .from("meeting_agendas")
    .select("id, meeting_id, title, description, is_evaluation, sort_order, attachment_name, attachment_path")
    .eq("meeting_id", session.meeting_id)
    .order("sort_order", { ascending: true });
  if (agendaError) throw mapDatabaseError(agendaError);

  const safeAgendas = await Promise.all((agendas ?? []).map(async agenda => {
    let attachmentData: string | null = null;
    if (agenda.attachment_path) {
      const { data: signed, error: signedError } = await service.storage
        .from("committee-meeting-documents")
        .createSignedUrl(agenda.attachment_path, 300);
      if (signedError) throw mapDatabaseError(signedError);
      attachmentData = signed.signedUrl;
    }
    return { ...agenda, attachment_data: attachmentData, attachment_path: undefined };
  }));

  const [{ data: votes, error: voteError }, { data: response, error: responseError }] = await Promise.all([
    service.from("meeting_agenda_votes")
      .select("agenda_id, vote, score, opinion")
      .eq("meeting_id", session.meeting_id)
      .eq("member_id", session.member_id),
    service.from("meeting_responses")
      .select("revision, submitted_at")
      .eq("meeting_id", session.meeting_id)
      .eq("member_id", session.member_id)
      .maybeSingle()
  ]);
  if (voteError || responseError) throw mapDatabaseError(voteError || responseError);

  return {
    meeting,
    member,
    agendas: safeAgendas,
    existing_votes: votes ?? [],
    has_submitted: Boolean(response?.submitted_at),
    revision: response?.revision ?? 0
  };
}

function decodePng(dataUrl: string): Uint8Array {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new VoteFunctionError("INCOMPLETE_AGENDAS", "INVALID_SIGNATURE");
  const binary = atob(match[1]);
  if (binary.length === 0 || binary.length > 2 * 1024 * 1024) {
    throw new VoteFunctionError("INCOMPLETE_AGENDAS", "INVALID_SIGNATURE");
  }
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!pngMagic.every((value, index) => bytes[index] === value)) {
    throw new VoteFunctionError("INCOMPLETE_AGENDAS", "INVALID_SIGNATURE");
  }
  return bytes;
}

function decodePdf(dataUrl: string): Uint8Array {
  const match = /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new VoteFunctionError("INVALID_DOCUMENT", "INVALID_DOCUMENT");
  const binary = atob(match[1]);
  if (binary.length === 0) throw new VoteFunctionError("INVALID_DOCUMENT", "INVALID_DOCUMENT");
  if (binary.length > 20 * 1024 * 1024) {
    throw new VoteFunctionError("DOCUMENT_TOO_LARGE", "DOCUMENT_TOO_LARGE", 413);
  }
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    throw new VoteFunctionError("INVALID_DOCUMENT", "INVALID_DOCUMENT");
  }
  return bytes;
}

async function submit(token: string, rawSubmission: unknown) {
  const session = await getSession(token);
  const submission = rawSubmission as {
    idempotency_key?: string;
    signature_data_url?: string;
    votes?: unknown[];
  };
  if (!submission?.idempotency_key || !Array.isArray(submission.votes)) {
    throw new VoteFunctionError("INCOMPLETE_AGENDAS", "INCOMPLETE_AGENDAS");
  }

  const signature = decodePng(String(submission.signature_data_url ?? ""));
  const signatureHash = await sha256(signature);
  const objectPath = `${session.meeting_id}/${session.member_id}/${submission.idempotency_key}.png`;
  const { error: uploadError } = await service.storage
    .from("committee-signatures")
    .upload(objectPath, signature, { contentType: "image/png", upsert: false });
  if (uploadError && !uploadError.message.toLowerCase().includes("already exists")) {
    throw mapDatabaseError(uploadError);
  }

  const { data, error } = await service.rpc("submit_committee_vote", {
    p_token_hash: session.tokenHash,
    p_idempotency_key: submission.idempotency_key,
    p_signature_object_path: objectPath,
    p_signature_sha256: signatureHash,
    p_votes: submission.votes
  });
  if (error) {
    if (!uploadError) await service.storage.from("committee-signatures").remove([objectPath]);
    throw mapDatabaseError(error);
  }
  return data;
}

async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const jwt = authorization.replace(/^Bearer\s+/i, "");
  if (!jwt) throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
  const { data: userData, error: userError } = await service.auth.getUser(jwt);
  if (userError || !userData.user) throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
  return userData.user;
}

async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  const { data: riseUser, error: roleError } = await service
    .from("rise_users")
    .select("uuid, approved, role_key")
    .eq("uuid", user.id)
    .maybeSingle();
  const allowedRoles = new Set([
    "ADMIN", "DIRECTOR", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER",
    "CENTER_ECC", "CENTER_ICC", "CENTER_RCC", "CENTER_NURI", "CENTER_SPECIAL"
  ]);
  if (roleError || !riseUser?.approved || !allowedRoles.has(riseUser.role_key)) {
    throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
  }
  return user;
}

async function submitAuthenticated(request: Request, meetingId: string, submission: unknown) {
  const user = await requireUser(request);
  const { data: memberRows, error: memberError } = await service
    .from("committee_members")
    .select("id")
    .eq("user_uuid", user.id);
  if (memberError) throw mapDatabaseError(memberError);
  const memberIds = (memberRows ?? []).map(row => row.id);
  if (memberIds.length === 0) throw new VoteFunctionError("FORBIDDEN", "MEMBER_AUTH_MAPPING_MISSING", 403);

  const { data: rosterRows, error: rosterError } = await service
    .from("committee_meeting_members")
    .select("member_id")
    .eq("meeting_id", meetingId)
    .in("member_id", memberIds);
  if (rosterError) throw mapDatabaseError(rosterError);
  if (!rosterRows || rosterRows.length !== 1) throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);

  const token = randomToken();
  const tokenHash = await sha256(token);
  const { error: sessionError } = await service.from("committee_vote_sessions").insert({
    token_hash: tokenHash,
    meeting_id: meetingId,
    member_id: rosterRows[0].member_id,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  });
  if (sessionError) throw mapDatabaseError(sessionError);
  return submit(token, submission);
}

async function createReportSnapshot(request: Request, meetingId: string) {
  const admin = await requireAdmin(request);
  if (!/^[0-9a-f-]{36}$/i.test(meetingId)) throw new VoteFunctionError("NOT_FOUND", "NOT_FOUND", 404);

  const [meetingResult, rosterResult, agendaResult, voteResult, responseResult, resultRpc] = await Promise.all([
    service.from("committee_meetings")
      .select("id, committee_id, title, meeting_date, meeting_type, status, agenda, committees(id, name, total_quorum, voting_rule)")
      .eq("id", meetingId).single(),
    service.from("committee_meeting_members")
      .select("member_id, role_code, committee_members(id, name, type, role_code, org, dept, rank)")
      .eq("meeting_id", meetingId).order("created_at", { ascending: true }),
    service.from("meeting_agendas")
      .select("id, meeting_id, title, description, is_evaluation, sort_order")
      .eq("meeting_id", meetingId).order("sort_order", { ascending: true }),
    service.from("meeting_agenda_votes")
      .select("id, agenda_id, member_id, vote, score, opinion, submitted_at, committee_members(id, name, type, role_code, org, dept)")
      .eq("meeting_id", meetingId),
    service.from("meeting_responses")
      .select("id, member_id, attended, vote, opinion, encrypted_signature, signature_object_path, signature_sha256, revision, submitted_at, committee_members(id, name, type, role_code, org, dept, rank)")
      .eq("meeting_id", meetingId),
    service.rpc("get_committee_meeting_result", { p_meeting_id: meetingId })
  ]);

  const firstError = meetingResult.error || rosterResult.error || agendaResult.error
    || voteResult.error || responseResult.error || resultRpc.error;
  if (firstError) throw mapDatabaseError(firstError);
  if (!resultRpc.data || typeof resultRpc.data !== "object" || !("decision_status" in resultRpc.data)) {
    throw new VoteFunctionError("CONFLICT", "REPORT_RESULT_UNAVAILABLE", 409);
  }

  const responseArtifacts = await Promise.all((responseResult.data ?? []).map(async response => {
    let signatureUrl: string | null = null;
    if (response.signature_object_path) {
      const { data, error } = await service.storage.from("committee-signatures")
        .createSignedUrl(response.signature_object_path, 600);
      if (error) throw mapDatabaseError(error);
      signatureUrl = data.signedUrl;
    }
    const { signature_object_path: _privatePath, ...safeResponse } = response;
    return { response: safeResponse, signatureUrl };
  }));
  const responses = responseArtifacts.map(item => item.response);
  const signatureUrls = Object.fromEntries(responseArtifacts
    .filter(item => item.signatureUrl)
    .map(item => [String(item.response.id), item.signatureUrl as string]));

  const meeting = meetingResult.data as Record<string, unknown> & { committees?: unknown };
  const committee = meeting.committees ?? null;
  const { committees: _joinedCommittee, ...safeMeeting } = meeting;
  const payload = canonicalize({
    meeting: safeMeeting,
    committee,
    result: resultRpc.data,
    agendas: agendaResult.data ?? [],
    votes: voteResult.data ?? [],
    responses,
    roster: rosterResult.data ?? []
  });
  const canonicalPayload = JSON.stringify(payload);
  const payloadHash = await sha256(canonicalPayload);
  const seal = await hmacSha256(canonicalPayload);
  const { data: stored, error: storeError } = await service.rpc("store_committee_report_snapshot", {
    p_meeting_id: meetingId,
    p_payload: payload,
    p_payload_sha256: payloadHash,
    p_seal_hmac: seal,
    p_finalized_by: admin.id
  });
  if (storeError) throw mapDatabaseError(storeError);

  return {
    snapshot_id: stored.id,
    payload_sha256: payloadHash,
    verification_code: seal.slice(0, 24).toUpperCase(),
    finalized_at: stored.finalized_at,
    signature_urls: signatureUrls,
    payload
  };
}

async function verifyReport(snapshotId: string, verificationCode: string) {
  if (!/^[0-9a-f-]{36}$/i.test(snapshotId) || !/^[0-9A-F]{24}$/.test(verificationCode)) {
    return { valid: false };
  }
  const { data, error } = await service
    .from("committee_report_snapshots")
    .select("meeting_id, payload, payload_sha256, seal_hmac, finalized_at, invalidated_at")
    .eq("id", snapshotId)
    .maybeSingle();
  if (error) throw mapDatabaseError(error);
  if (!data || data.invalidated_at || !data.payload?.result?.decision_status) return { valid: false };
  const canonicalPayload = JSON.stringify(canonicalize(data.payload));
  const recalculatedHash = await sha256(canonicalPayload);
  const recalculatedSeal = await hmacSha256(canonicalPayload);
  const valid = recalculatedHash === data.payload_sha256
    && recalculatedSeal === data.seal_hmac
    && recalculatedSeal.slice(0, 24).toUpperCase() === verificationCode;
  if (!valid) return { valid: false };
  return {
    valid: true,
    meeting_id: data.meeting_id,
    payload_sha256: data.payload_sha256,
    finalized_at: data.finalized_at
  };
}

async function uploadDocument(request: Request, meetingId: string, fileName: string, dataUrl: string) {
  await requireAdmin(request);
  if (!/^[0-9a-f-]{36}$/i.test(meetingId)) throw new VoteFunctionError("NOT_FOUND", "NOT_FOUND", 404);
  const pdf = decodePdf(dataUrl);
  const safeName = sanitizeStoragePdfName(fileName);
  const objectPath = `${meetingId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await service.storage.from("committee-meeting-documents")
    .upload(objectPath, pdf, { contentType: "application/pdf", upsert: false });
  if (error) {
    console.error("committee-vote document upload failed", {
      meetingId,
      objectPath,
      storageStatus: error.statusCode,
      storageMessage: error.message
    });
    throw mapStorageError(error);
  }
  return { attachment_path: objectPath };
}

async function deleteDocuments(request: Request, meetingId: string, rawPaths: unknown) {
  await requireAdmin(request);
  if (!/^[0-9a-f-]{36}$/i.test(meetingId)) throw new VoteFunctionError("NOT_FOUND", "NOT_FOUND", 404);
  if (!Array.isArray(rawPaths) || rawPaths.length > 20) {
    throw new VoteFunctionError("INVALID_DOCUMENT", "INVALID_DOCUMENT");
  }

  const meetingPrefix = `${meetingId}/`;
  const paths = [...new Set(rawPaths.map(path => String(path)))];
  if (paths.some(path => !path.startsWith(meetingPrefix) || path.length > 500)) {
    throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
  }
  if (paths.length === 0) return { removed: 0 };

  const { error } = await service.storage.from("committee-meeting-documents").remove(paths);
  if (error) {
    console.error("committee-vote document cleanup failed", {
      meetingId,
      pathCount: paths.length,
      storageStatus: error.statusCode,
      storageMessage: error.message
    });
    throw mapStorageError(error);
  }
  return { removed: paths.length };
}

async function migrateAttachments(request: Request, batchSize: number) {
  await requireAdmin(request);
  const limit = Math.min(Math.max(batchSize || 10, 1), 25);
  const { data: agendas, error } = await service.from("meeting_agendas")
    .select("id, meeting_id, attachment_name, attachment_data")
    .is("attachment_path", null)
    .not("attachment_data", "is", null)
    .limit(limit);
  if (error) throw mapDatabaseError(error);

  const migrated: string[] = [];
  const failed: Array<{ agenda_id: string; reason: string }> = [];
  for (const agenda of agendas ?? []) {
    try {
      const pdf = decodePdf(String(agenda.attachment_data));
      const safeName = sanitizeStoragePdfName(String(agenda.attachment_name || "document.pdf"));
      const objectPath = `${agenda.meeting_id}/${agenda.id}-${safeName}`;
      const { error: uploadError } = await service.storage.from("committee-meeting-documents")
        .upload(objectPath, pdf, { contentType: "application/pdf", upsert: false });
      if (uploadError && !uploadError.message.toLowerCase().includes("already exists")) throw uploadError;
      const { error: updateError } = await service.from("meeting_agendas")
        .update({ attachment_path: objectPath })
        .eq("id", agenda.id)
        .is("attachment_path", null);
      if (updateError) throw updateError;
      migrated.push(agenda.id);
    } catch (migrationError) {
      failed.push({ agenda_id: agenda.id, reason: migrationError instanceof Error ? migrationError.message : "UNKNOWN" });
    }
  }

  const { count } = await service.from("meeting_agendas")
    .select("id", { count: "exact", head: true })
    .is("attachment_path", null)
    .not("attachment_data", "is", null);
  return { migrated, failed, remaining: count ?? 0 };
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return respond(request, 405, { ok: false, error: { code: "NOT_FOUND" } });

  try {
    const origin = request.headers.get("origin") ?? "";
    if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
      throw new VoteFunctionError("FORBIDDEN", "FORBIDDEN", 403);
    }
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? "");
    let data: unknown;

    if (action === "public") data = await publicMeeting(String(body.access_code ?? ""));
    else if (action === "authenticate") data = await authenticate(request, body);
    else if (action === "context") data = await context(String(body.voter_token ?? ""));
    else if (action === "submit") data = await submit(String(body.voter_token ?? ""), body.submission);
    else if (action === "submit-authenticated") data = await submitAuthenticated(
      request, String(body.meeting_id ?? ""), body.submission
    );
    else if (action === "report-snapshot") data = await createReportSnapshot(request, String(body.meeting_id ?? ""));
    else if (action === "verify-report") data = await verifyReport(
      String(body.snapshot_id ?? ""), String(body.verification_code ?? "").trim().toUpperCase()
    );
    else if (action === "upload-document") data = await uploadDocument(
      request, String(body.meeting_id ?? ""), String(body.file_name ?? ""), String(body.data_url ?? "")
    );
    else if (action === "delete-documents") data = await deleteDocuments(
      request, String(body.meeting_id ?? ""), body.attachment_paths
    );
    else if (action === "migrate-attachments") data = await migrateAttachments(request, Number(body.batch_size ?? 10));
    else throw new VoteFunctionError("NOT_FOUND", "NOT_FOUND", 404);

    return respond(request, 200, { ok: true, data });
  } catch (error) {
    const known = error instanceof VoteFunctionError
      ? error
      : new VoteFunctionError("SERVER_ERROR", "SERVER_ERROR", 500);
    console.error("committee-vote", known.code, error);
    return respond(request, known.status, { ok: false, error: { code: known.code, message: known.message } });
  }
});
