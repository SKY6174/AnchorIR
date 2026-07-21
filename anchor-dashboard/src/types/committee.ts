/**
 * 💡 위원회 운영 및 의결 도메인 타입 정의 (Committee Types)
 * 
 * 위원회 성원 판정, 의결정족수 계산, 전자서명 및 회의록 관리를 위한 인터페이스 모음입니다.
 * [규칙 2 준수]: 간사(SECRETARY)는 의결권이 없으므로 성원/의결 정족수 수치 연산에서 엄격히 제외됩니다.
 */

/** 위원회 직책 구분에 대한 타입 (위원장, 간사, 일반위원) */
export type CommitteeRole = 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';

/** 회의 의결 방식 (출석 과반 찬성 vs 재적 과반 찬성) */
export type VotingRule = 'majority_of_attendees' | 'majority_of_total';

/** 회의 형태 (대면 회의 vs 온라인 서면 회의) */
export type MeetingType = 'OFFLINE_FACE' | 'ONLINE_WRITTEN';

/** 찬/반 표결 상태 */
export type VoteType = 'APPROVE' | 'REJECT' | 'ABSTAIN';

/** 최종 안건 의결 상태 (가결, 부결, 미성원취소, 미결/진행중) */
export type DecisionStatus = 'APPROVED' | 'REJECTED' | 'CANCELLED_NO_QUORUM' | 'PENDING';

/** 위원회 정보 정의 인터페이스 */
export interface Committee {
  id: string;
  name: string;
  total_quorum: number; // 간사를 제외한 순수 재적 의결 위원 수
  voting_rule: VotingRule;
  created_at?: string;
}

/** 위원 소속 및 직책 정보 인터페이스 */
export interface CommitteeMember {
  id: string;
  committee_id: string;
  user_id: string;
  user_name?: string; // 사용자 성함 (옵션 조인)
  department?: string; // 소속 부서 (옵션 조인)
  role: CommitteeRole;
  term_start?: string | null;
  term_end?: string | null;
  created_at?: string;
}

/** 위원 개별 응답 및 서명 데이터 인터페이스 */
export interface MeetingResponse {
  id?: string;
  meeting_id: string;
  member_id: string;
  member_role?: CommitteeRole; // 성원 연산 시 간사 제어용
  attended: boolean; // 출석 여부
  vote: VoteType | null; // 표결
  opinion: string | null; // 세부 의견
  encrypted_signature: string | null; // AES 암호화된 서명 데이터
  submitted_at?: string | null;
}

/** 회의 안건 개요 인터페이스 */
export interface CommitteeMeeting {
  id: string;
  committee_id: string;
  committee_name?: string;
  title: string;
  meeting_date: string;
  meeting_type: MeetingType;
  agenda: string;
  status: 'CREATED' | 'ACTIVE' | 'CLOSED' | 'REPORTED';
  created_at?: string;
}

/** 성원 및 의결 정족수 실시간 연산 결과 인터페이스 */
export interface EvaluationResult {
  /** 회의 성원(의사정족수) 달성 여부 */
  isEstablished: boolean;
  /** 안건 최종 가부 상태 ('APPROVED', 'REJECTED', 'CANCELLED_NO_QUORUM', 'PENDING') */
  decisionStatus: DecisionStatus;
  /** 간사를 제외한 실제 순수 재적 위원 수 */
  pureTotalQuorum: number;
  /** 간사를 제외한 실제 출석 위원 수 */
  attendedCount: number;
  /** 찬성 표결 수 */
  approveCount: number;
  /** 가결을 위해 필요했던 찬성표 기준 수 */
  requiredApproveCount: number;
  /** 행정 보고용 상세 안내 메시지 */
  message: string;
}
