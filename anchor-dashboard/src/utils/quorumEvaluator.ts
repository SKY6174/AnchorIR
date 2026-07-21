/**
 * 💡 위원회 성원 및 의결정족수 실시간 판정 엔진 (quorumEvaluator.ts)
 * 
 * [프로젝트 규칙 2 준수]:
 * 1. 간사(SECRETARY)는 의결 권한이 없는 행정 실무 진행자이므로 재적 위원 수(total_quorum),
 *    출석 의결 위원 수(attended), 찬반 표결 정족수 합산 대상에서 엄격히 제외합니다.
 * 2. 의사정족수(성원): 간사를 제외한 재적 위원 수(N명)의 과반수(Math.floor(N / 2) + 1) 이상 출석 시 성원.
 * 3. 의결정족수(가결): 성원 시 출석(참여)한 의결 위원 수(M명)의 과반수(Math.floor(M / 2) + 1) 이상 찬성 시 안건 최종 가결.
 */

import { Committee, CommitteeMember, MeetingResponse, EvaluationResult } from '../types/committee';

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
  // 1. 간사(SECRETARY) 위원 ID 목록 추출
  const secretaryMemberIds = new Set(
    members.filter(m => m.role === 'SECRETARY').map(m => m.id)
  );

  // 2. 간사를 제외한 순수 의결 위원 명단 및 재적 수 산정
  const pureVotingMembers = members.filter(m => m.role !== 'SECRETARY');
  const pureTotalQuorum = pureVotingMembers.length > 0 ? pureVotingMembers.length : (committee.total_quorum || 0);

  // 3. 간사를 제외한 실제 출석 의결 위원 수 계산
  const attendedVotingResponses = responses.filter(
    r => r.attended && !secretaryMemberIds.has(r.member_id)
  );
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
