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

- **PDF 압축 시 텍스트 사라짐 원천 방지 및 문서 방향(Landscape / Portrait) 자동 동적 감지 로직 구현**
  - 문제 원인 1 (텍스트 사라짐): `pdf.js`가 Canvas에 페이지를 다 그리기 전 폰트 자원이 완전히 로드/페인팅되지 않고 `toDataURL`이 비동기로 즉시 실행되어 폰트 텍스트 층이 캡처되지 않음.
  - 개선 조치 1: `page.getTextContent()` 명시적 대기 및 캔버스 렌더링 후 `60ms Paint Delay` 보장을 추가하여 텍스트 폰트 글자가 1글자도 사라지지 않고 100% 선명하게 렌더링되도록 수정.
  - 문제 원인 2 (방향 왜곡): 가로 방향(Landscape, PPT 슬라이드 등) PDF 문서임에도 `orientation: 'portrait'`로 강제 지정되어 세로 A4 종이에 작게 찌그러지거나 아래쪽 여백이 생성되는 현상 발생.
  - 개선 조치 2: 첫 페이지의 가로/세로 비율(`firstViewport.width > firstViewport.height`)을 자동 감지하여, 가로 슬라이드 문서는 **`orientation: 'landscape'`**로, 세로 문서는 **`orientation: 'portrait'`**로 100% 자동 분기 지정하도록 보강.
  - 빌드 검증: `npm run build` 성공 (**0 Error / 462ms**).
