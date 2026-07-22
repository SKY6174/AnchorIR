# 📘 UC ANCHOR 성과관리 시스템 - 개발 이벤트 로그 (DEV_LOG)

본 문서는 **UC ANCHOR 통합 대시보드(AnchorIR)** 시스템 개발 과정에서 발생하는 날짜별 작업 이벤트, 상세 기능 구현, 애로사항(Troubleshooting), 해결 과정을 기록하는 개발일기입니다.

---

## 🗓️ 2026년 7월 22일 (개발 21일차)
### 📌 주요 작업 이벤트
- **CommitteeManager.tsx ReferenceError (selectedMeetingAgendas) 원인 규명 및 복구 완료**
  - 원인: 정적 타입 정리 시 `selectedMeetingAgendas`, `selectedMeetingAgendaVotes`, `agendaInputs` 등 의안 관련 필수 `useState` 선언부 누락.
  - 해결: 해당 상태 변수 14개를 정적 타입 어노테이션과 함께 100% 완전 복구.
  - `npm run build` 검증: **468ms, 0 Error, 0 Warning** 달성 및 GitHub 원격 저장소(`main` 브랜치) 푸시 완료 (`64ca256`).

- **src/components/ 전체 26개 TSX 컴포넌트 정적 타입 보강 및 strict TSX 변환 완료**
  - 대상: `CommitteeManager.tsx`, `OrgChartManager.tsx`, `CenterOrgChartManager.tsx`, `InstructorPoolManager.tsx`, `PartnerManager.tsx`, `AgreementManager.tsx`, `UnifiedCertificateManager.tsx`, `ScholarshipManager.tsx`, `BudgetExecutionManager.tsx`, `BudgetItemsManager.tsx`, `AssetManager.tsx`, `ProcurementManager.tsx`, `MajorProgramsManager.tsx`, `ProgramProgressManager.tsx`, `ScheduleManager.tsx`, `PDCAManager.tsx`, `SatisfactionManager.tsx`, `SurveyResponder.tsx`, `UnitSystemView.tsx`, `AuthManager.tsx`, `LLMWiki.tsx`, `CommitteeExternalVote.tsx`, `ExcelUploader.tsx`, `KPIOverview.tsx`, `PortalConfigManager.tsx`, `Sidebar.tsx`, `VideoDashboard.tsx`.
  - 성과:
    1. UI/UX 완전 보존 (Tailwind CSS, JSX 노드 구조 단 1px 차이 없는 100% 유지).
    2. `any` 타입 최소화 및 Supabase DB Schema/도메인 interface (`OrgSubTeam`, `Instructor`, `PartnerInstitution`, `AgreementItem`, `CertificateItem`, `ExecutionRecord`, `ProcurementItem`, `SatisfactionSurvey` 등) 명확한 타입 정의.
    3. `useState`, `useRef`, 이벤트 핸들러(`e: React.ChangeEvent`, `e: React.FormEvent`) 타입 정적 지정 완료.
    4. `npm run build` 최종 검증 결과: **0 TS Error (443ms 빌드 경과)**.

- **mockWikiData.ts, App.tsx, main.tsx 파운데이션 정적 타입 보강 및 .ts 확장자 전환 완료**
  - 대상: `src/data/mockWikiData.ts` (이전 `.js`에서 TS 확장자 전환), `src/App.tsx`, `src/main.tsx`.
  - 성과:
    1. `WikiChunk`, `RAGSource`, `RAGQueryResult` 정적 인터페이스 선언 및 RAG 알고리즘 타입 어노테이션.
    2. `main.tsx` 널 가드 및 TypeScript 모듈 임포트 안전성 확보.
    3. `npm run build` 검증 결과: **0 TS Error (481ms 빌드 경과)**.

- **위원회 심의자료/안건 PDF 첨부파일 허용 용량 제한 및 텍스트 레이어 미조회 현상 원천 차단**
  - 문제 원인: 기존 캔버스 래스터화(Canvas Rasterization) 이미지 압축 방식으로 인해 PDF 내부의 텍스트 레이어(Text Layer, 드래그/복사/검색 가능 텍스트 데이터)가 소실되어 글자 미조회 및 이미지화가 발생함.
  - 근본 해결: 텍스트 레이어를 파괴하는 이미지 렌더링 재조합 압축 방식을 전면 제거하고, 15MB 한도 내에서 원본 PDF 바이너리를 100% 보존하여 DataURL로 탑재하도록 개선. PDF 텍스트 검색, 복사, 드래그 기능 완전 보존.
  - 빌드 검증: `npm run build` 성공 (**0 Error / 461ms**).

- **다중 위원(2명 이상) 서명 제출 시 관리자 화면 표결 집계 누락 및 성명 매칭 오류 완벽 수리**
  - 문제 원인: 위원별 제출 데이터 저장 시 `member_id` 및 `member_name` 매칭 규칙에서 문자열 끝 공백(`.trim()`) 미처리 및 `committee_members.name` 간의 유연한 조인 매칭 누락으로 인해, 이동은 위원이 서명 제출을 완료했음에도 변홍석 위원 1명만 출석/표결(1명)로 집계되던 현상.
  - 개선 조치: `fetchResponses` 및 `CommitteeExternalVote`의 데이터 매칭/필터링 알고리즘에 `.trim()` 및 `member_name` / `committee_members.name` 유연 매칭을 적용하고, 3초 주기 자동 Polling 갱신 및 로컬/DB 지속성을 보장하여 **2명 제출 시 관리자 화면에 즉시 2명(변홍석, 이동은) 성원 및 가결 표결(2명 찬성)로 100% 정상 반영**되도록 수리.
  - 빌드 검증: `npm run build` 성공 (**0 Error / 468ms**).
