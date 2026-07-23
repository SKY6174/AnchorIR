/**
 * 💡 위원회 성원 및 의결정족수 실시간 판정 엔진 (quorumEvaluator.ts)
 * 
 * [프로젝트 규칙 2 준수]:
 * 1. 간사(SECRETARY)는 의결 권한이 없는 행정 실무 진행자이므로 재적 위원 수(total_quorum),
 *    출석 의결 위원 수(attended), 찬반 표결 정족수 합산 대상에서 엄격히 제외합니다.
 * 2. 의사정족수(성원): 간사를 제외한 재적 위원 수(N명)의 과반수(Math.floor(N / 2) + 1) 이상 출석 시 성원.
 * 3. 의결정족수(가결): 성원 시 출석(참여)한 의결 위원 수(M명)의 과반수(Math.floor(M / 2) + 1) 이상 찬성 시 안건 최종 가결.
 */

import { Committee, CommitteeMember, MeetingResponse, EvaluationResult } from '../types/committee.js';

/**
 * 위원회의 실시간 참석 및 표결 데이터를 바탕으로 성원 여부와 안건 가부 판정을 수행하는 함수입니다.
 * 
 * @param committee 위원회 기본 설정 객체 (재적 정원 및 의결 규칙 포함)
 * @param members 소속 위원 명단 (간사 구분용)
 * @param responses 위원들의 참석/표결 응답 목록
 * @returns EvaluationResult 판정 결과 객체 (성원 여부, 가결 상태, 설명 메시지 등)
 */
export function evaluateMeetingStatus(
  committee: Committee,
  members: CommitteeMember[],
  responses: MeetingResponse[]
): EvaluationResult {
  const resolveRole = (member: CommitteeMember): string => {
    const rawRole = member.role || (member as CommitteeMember & { role_code?: string; type?: string }).role_code
      || (member as CommitteeMember & { type?: string }).type || 'MEMBER';
    return rawRole === 'SECRETARY' || rawRole.includes('간사') ? 'SECRETARY' : rawRole;
  };

  // ID는 DB의 BIGINT와 화면 문자열이 섞일 수 있으므로 비교 전에 문자열로 정규화합니다.
  const memberById = new Map(members.map(member => [String(member.id), member]));
  const pureVotingMembers = members.filter(member => resolveRole(member) !== 'SECRETARY');
  const eligibleMemberIds = new Set(pureVotingMembers.map(member => String(member.id)));
  const pureTotalQuorum = pureVotingMembers.length > 0 ? pureVotingMembers.length : (committee.total_quorum || 0);

  // 알 수 없는 위원과 중복 응답은 정족수에 포함하지 않고, 위원별 최신 제출 한 건만 사용합니다.
  const latestResponseByMember = new Map<string, MeetingResponse>();
  for (const response of responses) {
    const memberId = String(response.member_id);
    const member = memberById.get(memberId);
    if (members.length > 0 && (!member || !eligibleMemberIds.has(memberId))) continue;
    if (member && resolveRole(member) === 'SECRETARY') continue;

    const previous = latestResponseByMember.get(memberId);
    const previousTime = previous?.submitted_at ? Date.parse(previous.submitted_at) : 0;
    const responseTime = response.submitted_at ? Date.parse(response.submitted_at) : 0;
    if (!previous || responseTime >= previousTime) latestResponseByMember.set(memberId, response);
  }

  const attendedVotingResponses = Array.from(latestResponseByMember.values()).filter(response => response.attended);
  const attendedCount = attendedVotingResponses.length;

  // 4. 의사정족수 (성원 요건) 판정: 간사 제외 재적 위원 수의 과반수 이상 출석
  // 예: 재적 3명일 경우 Math.floor(3 / 2) + 1 = 2명 이상 출석 시 성원
  const requiredAttendanceCount = Math.floor(pureTotalQuorum / 2) + 1;
  const isEstablished = attendedCount >= requiredAttendanceCount;

  // 미성원 처리 (의사정족수 미달)
  if (!isEstablished) {
    return {
      isEstablished: false,
      decisionStatus: 'CANCELLED_NO_QUORUM',
      pureTotalQuorum,
      attendedCount,
      approveCount: 0,
      requiredApproveCount: 0,
      message: `미성원 (간사 제외 재적 ${pureTotalQuorum}명 중 ${attendedCount}명 출석, 성원 필요: ${requiredAttendanceCount}명)`
    };
  }

  // 5. 의결정족수 (가부 판단) 판정: 찬성(APPROVE) 표결 수 집계
  const approveCount = attendedVotingResponses.filter(r => r.vote === 'APPROVE').length;

  let isApproved = false;
  let requiredApproveCount = 0;
  let ruleText = '';

  if (committee.voting_rule === 'majority_of_attendees') {
    // 출석 위원 과반수 찬성 기준 (기본값)
    requiredApproveCount = Math.floor(attendedCount / 2) + 1;
    isApproved = approveCount >= requiredApproveCount;
    ruleText = `출석 과반 찬성 (출석 ${attendedCount}명 중 찬성 ${approveCount}명 필요: ${requiredApproveCount}명)`;
  } else {
    // 재적 위원 과반수 찬성 기준
    requiredApproveCount = Math.floor(pureTotalQuorum / 2) + 1;
    isApproved = approveCount >= requiredApproveCount;
    ruleText = `재적 과반 찬성 (재적 ${pureTotalQuorum}명 중 찬성 ${approveCount}명 필요: ${requiredApproveCount}명)`;
  }

  const decisionStatus = isApproved ? 'APPROVED' : 'REJECTED';

  return {
    isEstablished: true,
    decisionStatus,
    pureTotalQuorum,
    attendedCount,
    approveCount,
    requiredApproveCount,
    message: `성원 완료 (${attendedCount}명 참석) - 최종 결과: ${isApproved ? '가결(승인)' : '부결'} (${ruleText})`
  };
}
