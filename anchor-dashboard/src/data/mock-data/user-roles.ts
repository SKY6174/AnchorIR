import type { LegacyDataRecord } from "./data-types";

export const userRoles: Record<string, LegacyDataRecord> = {
  "ADMIN": { "id": "ADMIN", "name": "최고 관리자", "rank": 0, "desc": "시스템 모든 메뉴 및 권한 마스터 제어 권한" },
  "G_DIRECTOR": { "id": "G_DIRECTOR", "name": "사업단장 (송경영 교수)", "rank": 1, "desc": "전체 프로젝트 사업비 & KPI 최종 결재 및 연구원 배정 마스터 권한" },
  "HQ_HEAD": { "id": "HQ_HEAD", "name": "총괄본부장 (김현수 교수)", "rank": 2, "desc": "사업단 전체 실적 모니터링 및 AID-X지원센터 실무 총괄" },
  "MANAGER": { "id": "MANAGER", "name": "운영팀장", "rank": 4, "desc": "공통 영역 및 운영 행정비 집행 관리 총괄" },
  "CENTER_ECC": { "id": "CENTER_ECC", "name": "CENTER_ECC", "rank": 3, "desc": "소속 단위과제(A1가, A2, A3) 세부 예산 및 프로그램 상태 관리" },
  "CENTER_ICC": { "id": "CENTER_ICC", "name": "CENTER_ICC", "rank": 3, "desc": "소속 단위과제(B1, B3, B4) 세부 예산 및 산학협력 체계 관리" },
  "CENTER_RCC": { "id": "CENTER_RCC", "name": "CENTER_RCC", "rank": 3, "desc": "소속 단위과제(C1, D1, D2, D3) 세부 예산 및 평생학습 관리" },
  "CENTER_AID": { "id": "CENTER_AID", "name": "CENTER_AID", "rank": 3, "desc": "소속 단위과제(B2) 세부 예산 및 AID 역량강화 관리" },
  "CENTER_NURI": { "id": "CENTER_NURI", "name": "CENTER_NURI", "rank": 3, "desc": "소속 단위과제(C2) 늘봄누리 생태계 및 특화 교육 총괄 관리" },
  "CENTER_NULBOM": { "id": "CENTER_NULBOM", "name": "CENTER_NULBOM", "rank": 3, "desc": "소속 단위과제(C2) 늘봄 표준 교안 및 특화 교육 관리" },
  "CENTER_SPECIAL": { "id": "CENTER_SPECIAL", "name": "CENTER_SPECIAL", "rank": 3, "desc": "소속 단위과제(A1나 신산업 이관 분 4억 원 총괄)" },
  "TEAM_LEADER": { "id": "TEAM_LEADER", "name": "팀장교수", "rank": 5, "desc": "공통 영역 및 운영 행정비 집행 관리 총괄" },
  "RESEARCHER": { "id": "RESEARCHER", "name": "실무 연구원", "rank": 6, "desc": "담당 프로그램 세부 예산 실시간 집행 등록 및 PDCA 업데이트 권한" },
  "GUEST": { "id": "GUEST", "name": "게스트 (방문자)", "rank": 9, "desc": "사업단 외 일반 게스트 전용, 읽기 전용 권한 (사업단 관리 조회 불가)" }
};
