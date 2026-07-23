import assert from "node:assert/strict";
import test from "node:test";
import { evaluateMeetingStatus } from "./quorumEvaluator.js";
import type { Committee, CommitteeMember, MeetingResponse } from "../types/committee.js";

const committee: Committee = {
  id: "c1",
  name: "테스트 위원회",
  total_quorum: 99,
  voting_rule: "majority_of_attendees"
};

const members: CommitteeMember[] = [
  { id: "1", committee_id: "c1", user_id: "u1", role: "CHAIRMAN" },
  { id: "2", committee_id: "c1", user_id: "u2", role: "MEMBER" },
  { id: "3", committee_id: "c1", user_id: "u3", role: "MEMBER" },
  { id: "4", committee_id: "c1", user_id: "u4", role: "SECRETARY" }
];

function response(memberId: string, vote: MeetingResponse["vote"], submittedAt: string): MeetingResponse {
  return {
    meeting_id: "m1",
    member_id: memberId,
    attended: true,
    vote,
    opinion: null,
    encrypted_signature: null,
    submitted_at: submittedAt
  };
}

test("간사와 알 수 없는 응답은 재적·출석·찬반에서 제외한다", () => {
  const result = evaluateMeetingStatus(committee, members, [
    response("1", "APPROVE", "2026-01-01T00:00:00Z"),
    response("2", "APPROVE", "2026-01-01T00:00:00Z"),
    response("4", "APPROVE", "2026-01-01T00:00:00Z"),
    response("999", "APPROVE", "2026-01-01T00:00:00Z")
  ]);
  assert.equal(result.pureTotalQuorum, 3);
  assert.equal(result.attendedCount, 2);
  assert.equal(result.approveCount, 2);
  assert.equal(result.decisionStatus, "APPROVED");
});

test("동일 위원의 최신 응답만 계산한다", () => {
  const result = evaluateMeetingStatus(committee, members, [
    response("1", "APPROVE", "2026-01-01T00:00:00Z"),
    response("1", "REJECT", "2026-01-02T00:00:00Z"),
    response("2", "APPROVE", "2026-01-01T00:00:00Z")
  ]);
  assert.equal(result.attendedCount, 2);
  assert.equal(result.approveCount, 1);
  assert.equal(result.decisionStatus, "REJECTED");
});

test("간사 제외 재적 과반에 미달하면 미성원이다", () => {
  const result = evaluateMeetingStatus(committee, members, [
    response("1", "APPROVE", "2026-01-01T00:00:00Z")
  ]);
  assert.equal(result.pureTotalQuorum, 3);
  assert.equal(result.attendedCount, 1);
  assert.equal(result.decisionStatus, "CANCELLED_NO_QUORUM");
});
