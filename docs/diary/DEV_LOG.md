# 📘 UC ANCHOR 성과관리 시스템 - 개발 이벤트 로그 (DEV_LOG)

본 문서는 **UC ANCHOR 통합 대시보드(AnchorIR)** 시스템 개발 과정에서 발생하는 날짜별 작업 이벤트, 상세 기능 구현, 애로사항(Troubleshooting), 해결 과정을 기록하는 개발일기입니다.

---

## 🗓️ 2026년 6월 25일 ~ 7월 8일 (개발 1일차 ~ 10일차)
### 📌 주요 작업 이벤트
- **프로젝트 셋업 및 5대 핵심 서비스 모듈 초기 구축**
  - **PDCA 모듈**: 추진전략 ➔ 전략과제 ➔ 세부프로그램 연결 성과체계 구축. 실시간 달성율 추적 UI/UX 연동.
  - **일정 & 회의록 모듈**: FullCalendar 기반 일정 캘린더 구현. 더블클릭 모달 연동 및 MP3/PDF 첨부 기능 구현.
  - **지산학 마일리지 모듈**: 학생 수혜 명단 관리, `pgcrypto` 기반 주민등록번호 및 계좌번호 DB 암호화 적재.
  - **조달/기자재 관리 모듈**: 4단계(계획/입찰/계약/검수) 추적 및 서류 PDF AI 자동 요약 기능 구현.
  - **포털 설정 모듈**: `portal_configs` 테이블 기반 동적 메뉴 노출 제어 및 주소록 자동 매핑.

### 🚨 애로사항 & 해결 과정 (Troubleshooting)
- **이슈 1: 개인정보(주민번호/계좌번호) 평문 노출 보안 위험**
  - *문제*: 행정 제출용 장학금 명단에 민감한 개인정보가 포함되어 DB 유출 시 심각한 보안 문제 발생 가능.
  - *해결*: Supabase PostgreSQL의 `pgp_sym_encrypt` 함수를 활용한 양방향 암호화 도입. 인가된 전용 View 및 RLS 정책을 통해서만 복호화 조회되도록 통제.
- **이슈 2: 비인증 사용자 접근 및 권한 격리**
  - *문제*: Supabase `anon` 키로 불필요한 테이블 접근 시도 가능성.
  - *해결*: Supabase Auth 및 RLS(Row Level Security) 정책을 전면 수립하여 비인증 요청을 완벽 격리.

---

## 🗓️ 2026년 7월 9일 ~ 7월 15일 (개발 11일차 ~ 15일차)
### 📌 주요 작업 이벤트
- **부서 구조 개편 및 7개 부서 전면 통합**
  - 기존 8대 부서 명칭 정리 및 사업단-사업운영팀을 '사업운영팀' 1개 부서로 전면 통합.
  - 참석자 자동완성 칩 연동 및 부서별 그룹화, 팀장교수 토글 필터 개발.
- **AI 회의록 분석 및 합의토론 고도화**
  - OpenAI GPT-4o 분석 엔진 연동. 3단계 헤어리스틱 파서 구현으로 AI 부서추론 오류율 최소화.

### 🚨 애로사항 & 해결 과정 (Troubleshooting)
- **이슈 1: 회의록 결과 단독 분석 시 부서 누락 및 텍스트 바인딩 오류**
  - *문제*: AI 분석 시 복잡한 부서명 표현(예: '사업단', '운영팀' 등)을 제대로 매핑하지 못함.
  - *해결*: 프롬프트 엔지니어링 보강 및 3단계 헤어리스틱 파서를 도입하여 부서 키 규격화.
- **이슈 2: 대용량 첨부파일로 인한 브라우저 페이로드 타임아웃**
  - *문제*: 안건 서류 PDF 첨부 시 base64 인코딩 데이터가 커져 렌더링 및 통신 속도 저하.
  - *해결*: 안건 첨부파일(`attachment_data`)에 Lazy Loading을 적용하고, 1MB 초과 시 자동 압축 로직 연동.

---

## 🗓️ 2026년 7월 16일 ~ 7월 21일 (개발 16일차 ~ 20일차)
### 📌 주요 작업 이벤트
- **위원회 규정(의정정족수/간사 제정) 시스템 전면 반영**
  - 간사(Secretary)의 의결 권한 제외 규정 반영 (`AGENTS.md` 및 코드 계산 로직).
  - 재적 위원 수(`total_quorum`), 출석 위원 수(`attended`), 과반 찬성 가결 자동 판정.
- **PDF 보고서 자동 생성 및 서명 인프라 구축**
  - 픽셀 기반 캔버스 서명 검증 및 위원장/위원/간사 순 서명 카드 정렬.

---

## 🗓️ 2026년 7월 22일 (개발 21일차)
### 📌 주요 작업 이벤트
- **Phase 4 전체 20개 컴포넌트 100% 1:1 축약 0% TSX 마이그레이션 완수**
  - "TSX 변환을 축약없이 원래의 JSX 기능과 UI/UX를 그대로 유지하면서 변환한다"는 원칙 준수.
  - `CommitteeManager`, `OrgChartManager`, `CenterOrgChartManager`, `InstructorPoolManager`, `PartnerManager`, `AgreementManager`, `UnifiedCertificateManager`, `BudgetExecutionManager`, `BudgetItemsManager`, `AssetManager`, `ProcurementManager`, `MajorProgramsManager`, `ProgramProgressManager`, `ScheduleManager`, `PDCAManager`, `SatisfactionManager`, `SurveyResponder`, `UnitSystemView`, `AuthManager`, `LLMWiki` 전체 20개 컴포넌트 전면 이식 완료.
  - `npm run build` 검증: **470ms, 0 Error, 0 Warning** 달성 및 GitHub 원격 저장소(`main` 브랜치) 푸시 완료 (`c4d3287`).

### 🚨 애로사항 & 해결 과정 (Troubleshooting)
- **이슈 1: TSX 변환 시 일부 모달 및 스타일 축약으로 인한 UI 붕괴**
  - *문제*: 코드 효율화를 위해 일부 구문을 축약했을 때 원본 대시보드의 화면 서식 및 모달창 모양에 미세한 오차가 발생하는 현상 확인.
  - *해결*: 축약 제로(0% Omission) 원칙을 즉시 수립하여, 원본 `.jsx` 파일 전체 소스(3,909줄, 7,415줄, 9,357줄 등)를 단 한 줄의 생략도 없이 100% 라인 바이 라인 1:1로 이식하고 `Props` 타입 인터페이스 어노테이션만 정확히 입히는 방식으로 전환하여 UI/UX 100% 불변성을 완벽히 확보함.
