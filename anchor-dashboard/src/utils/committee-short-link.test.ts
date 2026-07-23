import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCommitteeVotePath,
  decodeCommitteeAccessCode,
  encodeCommitteeAccessCode,
  parseCommitteeVotePath
} from "./committee-short-link.js";

test("위원회 공개 코드를 URL-safe 단축 코드로 가역 변환한다", () => {
  const accessCodes = [
    "9aec2abb1c87ef515f89b000884f180a",
    "9aec2abb1c87ef515f89b000884f180ac245"
  ];

  for (const accessCode of accessCodes) {
    const shortCode = encodeCommitteeAccessCode(accessCode);
    assert.ok(shortCode.length < accessCode.length);
    assert.match(shortCode, /^[A-Za-z0-9_-]+$/);
    assert.equal(decodeCommitteeAccessCode(shortCode), accessCode);
  }
});

test("위원회 단축 경로를 만들고 원본 공개 코드로 복원한다", () => {
  const accessCode = "00112233445566778899aabbccddeeff0011";
  const path = buildCommitteeVotePath(accessCode);

  assert.match(path, /^\/v\/[A-Za-z0-9_-]+$/);
  assert.equal(parseCommitteeVotePath(path), accessCode);
  assert.equal(parseCommitteeVotePath(`${path}/`), accessCode);
});

test("잘못된 공개 코드와 단축 경로를 안전하게 거부한다", () => {
  assert.equal(encodeCommitteeAccessCode("not-a-hex-code"), "");
  assert.equal(decodeCommitteeAccessCode("invalid*code"), "");
  assert.equal(decodeCommitteeAccessCode("abcde"), "");
  assert.equal(parseCommitteeVotePath("/sv/example"), "");
  assert.equal(parseCommitteeVotePath("/v/invalid*code"), "");
});
