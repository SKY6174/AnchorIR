import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const TEST_ACCESS_CODE = "TEST-CONCURRENCY-097-B10C802";
const TEST_PIN = "654321";
const TEST_NAMES = Array.from({ length: 10 }, (_, index) =>
  `TEST-VOTER-${String(index + 1).padStart(2, "0")}`
);
const ALLOWED_ORIGIN = "https://uc-anchor.vercel.app";
const SIGNATURE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function loadLocalEnvironment() {
  const entries = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    });
  return Object.fromEntries(entries);
}

const environment = loadLocalEnvironment();
const functionUrl = `${environment.VITE_SUPABASE_URL}/functions/v1/committee-vote`;
const anonKey = environment.VITE_SUPABASE_ANON_KEY;

if (!functionUrl || !anonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

async function invoke(action, body) {
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      origin: ALLOWED_ORIGIN
    },
    body: JSON.stringify({ action, ...body })
  });
  const envelope = await response.json();
  return { status: response.status, envelope };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function submission(agendaIds, idempotencyKey, approve = true, score = 5) {
  return {
    idempotency_key: idempotencyKey,
    signature_data_url: SIGNATURE_DATA_URL,
    votes: [
      {
        agenda_id: agendaIds.general,
        vote: approve ? "APPROVE" : "REJECT",
        score: null,
        opinion: "TEST-CONCURRENCY-097 general"
      },
      {
        agenda_id: agendaIds.evaluation,
        vote: null,
        score,
        opinion: "TEST-CONCURRENCY-097 evaluation"
      }
    ]
  };
}

const publicResult = await invoke("public", { access_code: TEST_ACCESS_CODE });
assert(publicResult.status === 200 && publicResult.envelope?.ok, "Public fixture lookup failed");

const authenticationStartedAt = performance.now();
const authentications = await Promise.all(TEST_NAMES.map((name) =>
  invoke("authenticate", { access_code: TEST_ACCESS_CODE, name, pin: TEST_PIN })
));
const authenticationDurationMs = Math.round(performance.now() - authenticationStartedAt);

assert(authentications.every((result) => result.status === 200 && result.envelope?.data?.token),
  "At least one synthetic voter authentication failed");

const voters = authentications.map((result, index) => ({
  name: TEST_NAMES[index],
  token: result.envelope.data.token
}));

const contextResult = await invoke("context", { voter_token: voters[0].token });
assert(contextResult.status === 200 && contextResult.envelope?.ok, "Vote context lookup failed");
const agendas = contextResult.envelope.data.agendas;
assert(Array.isArray(agendas) && agendas.length === 2, "Expected exactly two test agendas");

const agendaIds = {
  general: agendas.find((agenda) => !agenda.is_evaluation)?.id,
  evaluation: agendas.find((agenda) => agenda.is_evaluation)?.id
};
assert(agendaIds.general && agendaIds.evaluation, "Test agenda classification failed");

const initialKeys = voters.map(() => randomUUID());
const initialSubmissions = voters.map((voter, index) =>
  invoke("submit", {
    voter_token: voter.token,
    submission: submission(agendaIds, initialKeys[index])
  })
);
initialSubmissions.push(invoke("submit", {
  voter_token: voters[0].token,
  submission: submission(agendaIds, initialKeys[0])
}));

const submissionStartedAt = performance.now();
const initialResults = await Promise.all(initialSubmissions);
const submissionDurationMs = Math.round(performance.now() - submissionStartedAt);

assert(initialResults.every((result) => result.status === 200 && result.envelope?.ok),
  "At least one concurrent submission failed");
assert(initialResults.filter((result) => result.envelope.data.idempotent_replay === true).length === 1,
  "The simultaneous duplicate was not replayed exactly once");
assert(initialResults.filter((result) => result.envelope.data.idempotent_replay !== true).length === 10,
  "Expected exactly ten first-write submissions");
assert(initialResults.every((result) => result.envelope.data.revision === 1),
  "Initial submission revision must remain one");

const replayResults = await Promise.all(voters.map((voter, index) =>
  invoke("submit", {
    voter_token: voter.token,
    submission: submission(agendaIds, initialKeys[index])
  })
));
assert(replayResults.every((result) =>
  result.status === 200 && result.envelope?.data?.idempotent_replay === true
  && result.envelope.data.revision === 1
), "Idempotency replay validation failed");

const revisionKey = randomUUID();
const revisionResult = await invoke("submit", {
  voter_token: voters[0].token,
  submission: submission(agendaIds, revisionKey, false, 4)
});
assert(revisionResult.status === 200 && revisionResult.envelope?.data?.revision === 2,
  "New idempotency key did not create revision two");

const conflictResult = await invoke("submit", {
  voter_token: voters[0].token,
  submission: submission(agendaIds, initialKeys[0], false, 4)
});
assert(conflictResult.status === 400 && conflictResult.envelope?.error?.code === "CONFLICT",
  "Changed payload with a reused key was not rejected as CONFLICT");

const invalidSubmission = submission(agendaIds, randomUUID(), true, 9);
const rollbackResult = await invoke("submit", {
  voter_token: voters[0].token,
  submission: invalidSubmission
});
assert(rollbackResult.status === 400
  && rollbackResult.envelope?.error?.code === "INCOMPLETE_AGENDAS",
  "Invalid score was not rejected atomically");

const finalContext = await invoke("context", { voter_token: voters[0].token });
assert(finalContext.status === 200 && finalContext.envelope?.data?.revision === 2,
  "Rejected submission changed the stored revision");
assert(finalContext.envelope.data.existing_votes?.length === 2,
  "Rejected submission changed the agenda vote cardinality");

console.log(JSON.stringify({
  test: "committee-concurrency-e2e",
  voters: voters.length,
  concurrentRequests: initialResults.length,
  firstWrites: 10,
  simultaneousIdempotentReplays: 1,
  repeatedReplays: replayResults.length,
  finalRevisionForFirstVoter: finalContext.envelope.data.revision,
  conflictRejected: true,
  invalidScoreRolledBack: true,
  authenticationDurationMs,
  submissionDurationMs
}, null, 2));
