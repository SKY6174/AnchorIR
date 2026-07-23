import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCommitteeSigningReady,
  CommitteeSigningError,
  computePdfSha256,
  createCommitteeSigningFeatureConfig,
  validatePadesProfile,
  validatePdfSha256,
  validateSigningObjectPath
} from "./committee-signing-core.js";

const UUID_A = "11111111-1111-4111-8111-111111111111";
const UUID_B = "22222222-2222-4222-8222-222222222222";
const UUID_C = "33333333-3333-4333-8333-333333333333";

test("PAdES 기능은 명시적으로 설정하지 않으면 비활성화된다", () => {
  assert.deepEqual(createCommitteeSigningFeatureConfig({}), {
    enabled: false,
    providerReady: false
  });
});

test("provider 준비 전에는 서명 요청을 안전하게 거부한다", () => {
  assert.throws(
    () => assertCommitteeSigningReady({ enabled: true, providerReady: false }),
    (error) => error instanceof CommitteeSigningError
      && error.code === "provider_not_configured"
  );
});

test("승인된 PAdES profile만 허용한다", () => {
  assert.equal(validatePadesProfile("B-T"), "B-T");
  assert.equal(validatePadesProfile("B-LT"), "B-LT");
  assert.equal(validatePadesProfile("B-LTA"), "B-LTA");
  assert.throws(() => validatePadesProfile("B-B"), CommitteeSigningError);
});

test("PDF SHA-256은 소문자 64자리 hex로 정규화한다", () => {
  const digest = "A".repeat(64);
  assert.equal(validatePdfSha256(digest), "a".repeat(64));
  assert.throws(() => validatePdfSha256("abc"), CommitteeSigningError);
});

test("staging object path는 meeting/snapshot/request UUID 구조만 허용한다", () => {
  const validPath = `${UUID_A}/${UUID_B}/${UUID_C}.pdf`;
  assert.equal(validateSigningObjectPath(validPath, UUID_A, UUID_B), validPath);
  assert.throws(
    () => validateSigningObjectPath(`${UUID_A}/${UUID_B}/../secret.pdf`, UUID_A, UUID_B),
    CommitteeSigningError
  );
  assert.throws(
    () => validateSigningObjectPath(`${UUID_B}/${UUID_A}/${UUID_C}.pdf`, UUID_A, UUID_B),
    CommitteeSigningError
  );
});

test("서명 대상은 PDF 헤더를 가진 20MB 이하 문서만 허용한다", async () => {
  const pdf = new TextEncoder().encode("%PDF-1.7\nminimal");
  assert.match(await computePdfSha256(pdf), /^[0-9a-f]{64}$/);
  await assert.rejects(
    computePdfSha256(new TextEncoder().encode("not a pdf")),
    CommitteeSigningError
  );
});
