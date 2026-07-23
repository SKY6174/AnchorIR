import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCommitteeHumanCode,
  extractMeetingRound,
  extractMeetingYear,
  getCommitteeTypeCode
} from "./committee-code.js";

test("위원회 유형을 합의된 영문 코드로 변환한다", () => {
  const expectedCodes: Record<string, string> = {
    total: "STEER",
    planning: "PLAN",
    budget: "BUDGET",
    evaluation: "EVAL",
    ecc_op: "ECC",
    icc_op: "ICC",
    rcc_op: "RCC",
    aidx_op: "AIDX",
    neulbom_op: "NURI",
    newind_op: "SEVEN"
  };

  for (const [committeeId, expectedCode] of Object.entries(expectedCodes)) {
    assert.equal(getCommitteeTypeCode(committeeId), expectedCode);
  }
  assert.equal(getCommitteeTypeCode("unknown"), "GENERAL");
});

test("회의 제목의 차 또는 회 표현에서 차수를 추출한다", () => {
  assert.equal(extractMeetingRound("제1차 앵커총괄위원회 회의"), 1);
  assert.equal(extractMeetingRound("앵커기획위원회 2차 회의"), 2);
  assert.equal(extractMeetingRound("제 12 회 자체평가위원회"), 12);
  assert.equal(extractMeetingRound("2026년 제3회 사업비관리위원회"), 3);
});

test("차년도 표현과 차수 없는 제목은 회의 차수로 처리하지 않는다", () => {
  assert.equal(extractMeetingRound("제2차년도 RISE 사업계획 심의"), null);
  assert.equal(extractMeetingRound("앵커총괄위원회 정기회의"), null);
  assert.equal(extractMeetingRound("제0차 앵커총괄위원회"), null);
});

test("회의일시와 제목에서 연도를 결정한다", () => {
  assert.equal(extractMeetingYear("2026-07-24T13:00:00Z", ""), 2026);
  assert.equal(extractMeetingYear("07/24/2027", ""), 2027);
  assert.equal(extractMeetingYear("", "2028년 제1차 회의"), 2028);
  assert.equal(extractMeetingYear("", "", 2029), 2029);
});

test("사람이 읽는 위원회 코드를 규칙에 맞게 생성한다", () => {
  assert.equal(
    buildCommitteeHumanCode({
      committeeId: "planning",
      title: "2026년 제3차 앵커기획위원회 회의",
      meetingDate: "2026-08-01T10:00:00Z"
    }),
    "UC-ANCHOR-2026-PLAN-03"
  );

  assert.equal(
    buildCommitteeHumanCode({
      committeeId: "aidx_op",
      title: "AID-X지원센터 운영위원회",
      meetingDate: "2026-08-01"
    }),
    "UC-ANCHOR-2026-AIDX-XX"
  );
});
