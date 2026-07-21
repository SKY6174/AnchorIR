/**
 * 💡 PDCA 성과 관리 체계 도메인 타입 정의 (PDCA Types)
 * 
 * RISE 앵커사업의 추진전략(Strategy) -> 전략과제(Task) -> 세부프로그램(Program) 
 * 3단계 계층 구조 및 분기별 이행 실적(PDCA)을 다루는 인터페이스 정의입니다.
 */

/** PDCA 4단계 수행 과정 구분 */
export type PDCAStep = 'Plan' | 'Do' | 'Check' | 'Action';

/** 분기별 추진 실적 상태 (달성, 진행중, 지연, 미착수) */
export type ProgressStatus = 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED' | 'NOT_STARTED';

/** 재원 종류 (국비, 시비, 민자/자부담) */
export interface BudgetBreakdown {
  national: number; // 국비 (원 단위 또는 백만원)
  city: number;     // 시비
  private: number;  // 민간/기타
  total: number;    // 합계 롤업 수치
}

/** 분기별 계획 및 실적 상세 인터페이스 */
export interface PDCAQuarter {
  quarter: 1 | 2 | 3 | 4; // 1분기 ~ 4분기
  planText: string;       // 분기별 계획 내용
  actualText: string;     // 분기별 실적 내용
  budget: BudgetBreakdown;// 분기 집행 예산
  status: ProgressStatus; // 추진 상태
}

/** 세부 프로그램(Program) 인터페이스 */
export interface Program {
  id: string;
  taskId: string;           // 상위 전략과제 ID
  code: string;             // 예: "1-1-2"
  title: string;            // 세부 프로그램명
  department: string;       // 담당 부서 (예: '사업운영팀', '글로컬인재양성센터')
  managerName: string;      // 담당 교수/실무자 성함
  targetFrequency: number;  // 목표 수행 횟수
  actualFrequency: number;  // 실적 수행 횟수
  achieveRate: number;      // 달성률 (%)
  quarters: PDCAQuarter[];  // 1~4분기 PDCA 데이터
  improvementAction?: string;// C&A 단계 환류 개선 조치 사항
  created_at?: string;
}

/** 추진 전략 과제(Task) 인터페이스 */
export interface StrategyTask {
  id: string;
  strategyId: string; // 상위 추진전략 ID (예: 'S1')
  code: string;       // 예: "1-1"
  title: string;      // 과제명 (예: "UC-HYPER 실무인재 양성")
  programs: Program[];// 하위 세부 프로그램 목록
}

/** 최상위 추진 전략(Strategy) 인터페이스 */
export interface Strategy {
  id: string;         // 예: 'S1'
  title: string;      // 추진전략 명칭
  tasks: StrategyTask[];
}
