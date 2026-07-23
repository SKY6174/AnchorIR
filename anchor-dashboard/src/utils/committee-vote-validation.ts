import {
  CommitteeVoteAgenda,
  CommitteeVoteDecision,
  CommitteeVoteSubmissionItem
} from "../types/committee-vote.js";

export interface AgendaInputValue {
  vote?: string | null;
  score?: number | null;
  opinion?: string | null;
}

export interface CommitteeVoteValidationResult {
  valid: boolean;
  firstInvalidAgendaId?: string;
  items: CommitteeVoteSubmissionItem[];
}

const DECISIONS = new Set<CommitteeVoteDecision>(["APPROVE", "REJECT", "ABSTAIN"]);

export function buildValidatedVoteItems(
  agendas: CommitteeVoteAgenda[],
  inputs: Record<string | number, AgendaInputValue>
): CommitteeVoteValidationResult {
  const seenAgendaIds = new Set<string>();
  const items: CommitteeVoteSubmissionItem[] = [];

  for (const agenda of agendas) {
    const agendaId = String(agenda.id);
    const input = inputs[agenda.id] || inputs[agendaId] || {};

    if (seenAgendaIds.has(agendaId)) {
      return { valid: false, firstInvalidAgendaId: agendaId, items: [] };
    }
    seenAgendaIds.add(agendaId);

    if (agenda.is_evaluation) {
      const score = Number(input.score);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        return { valid: false, firstInvalidAgendaId: agendaId, items: [] };
      }
      items.push({ agenda_id: agendaId, vote: null, score, opinion: input.opinion?.trim() || "" });
      continue;
    }

    const vote = input.vote as CommitteeVoteDecision | undefined;
    if (!vote || !DECISIONS.has(vote)) {
      return { valid: false, firstInvalidAgendaId: agendaId, items: [] };
    }
    items.push({ agenda_id: agendaId, vote, score: null, opinion: input.opinion?.trim() || "" });
  }

  return { valid: agendas.length > 0, items };
}

export function createIdempotencyKey(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const random = globalThis.crypto?.getRandomValues?.(new Uint32Array(4));
  if (random) return Array.from(random, value => value.toString(16).padStart(8, "0")).join("-");
  throw new Error("안전한 요청 식별자를 생성할 수 없습니다.");
}
