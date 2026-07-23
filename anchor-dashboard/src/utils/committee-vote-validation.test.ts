import assert from "node:assert/strict";
import test from "node:test";
import { buildValidatedVoteItems } from "./committee-vote-validation.js";

const agendas = [
  { id: "11111111-1111-1111-1111-111111111111", meeting_id: "m1", title: "의결", is_evaluation: false, sort_order: 1 },
  { id: "22222222-2222-2222-2222-222222222222", meeting_id: "m1", title: "평가", is_evaluation: true, sort_order: 2 }
];

test("모든 일반 표결과 평가 점수를 명시적으로 선택해야 한다", () => {
  const missingVote = buildValidatedVoteItems(agendas, {
    [agendas[1].id]: { score: 5, opinion: "" }
  });
  assert.equal(missingVote.valid, false);
  assert.equal(missingVote.firstInvalidAgendaId, agendas[0].id);

  const missingScore = buildValidatedVoteItems(agendas, {
    [agendas[0].id]: { vote: "APPROVE", opinion: "" }
  });
  assert.equal(missingScore.valid, false);
  assert.equal(missingScore.firstInvalidAgendaId, agendas[1].id);
});

test("평가 안건과 일반 안건을 서로 다른 공식 값으로 만든다", () => {
  const result = buildValidatedVoteItems(agendas, {
    [agendas[0].id]: { vote: "ABSTAIN", score: 5, opinion: " 보완 " },
    [agendas[1].id]: { vote: "APPROVE", score: 4, opinion: " 적정 " }
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.items, [
    { agenda_id: agendas[0].id, vote: "ABSTAIN", score: null, opinion: "보완" },
    { agenda_id: agendas[1].id, vote: null, score: 4, opinion: "적정" }
  ]);
});

test("중복 안건 ID와 빈 안건 목록을 거부한다", () => {
  const duplicate = buildValidatedVoteItems([agendas[0], { ...agendas[0] }], {
    [agendas[0].id]: { vote: "APPROVE" }
  });
  assert.equal(duplicate.valid, false);
  assert.equal(buildValidatedVoteItems([], {}).valid, false);
});
