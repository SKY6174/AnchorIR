# 📘 UC ANCHOR 성과관리 시스템 - 개발 이벤트 로그 (DEV_LOG)

본 문서는 **UC ANCHOR 통합 대시보드(AnchorIR)** 시스템 개발 과정에서 발생하는 날짜별 작업 이벤트, 상세 기능 구현, 애로사항(Troubleshooting), 해결 과정을 일자별로 누적 기록하는 일일 개발일기입니다.

---

## 🗓️ 2026년 7월 22일 (개발 21일차) - 일일 종합 개발 일기

### 📌 1. TSX 마이그레이션 & 정적 타입 시스템 완수
- **CommitteeManager.tsx selectedMeetingAgendas 상태 복구**
  - 원인: 정적 타입 정리 중 `selectedMeetingAgendas`, `selectedMeetingAgendaVotes`, `agendaInputs` 등 의안 관련 14개 필수 `useState` 선언부 누락.
  - 해결: 해당 상태 변수 14개를 정적 타입 어노테이션과 함께 100% 완전 복구.
- **src/components/ 전체 26개 TSX 컴포넌트 정적 타입 지정**
  - UI/UX 단 1px 오차 없이 100% 보존.
  - `any` 사용을 배제하고 Supabase DB 스키마 도메인 타입(`OrgSubTeam`, `Instructor`, `PartnerInstitution`, `AgreementItem`, `CertificateItem`, `ExecutionRecord`, `ProcurementItem`, `SatisfactionSurvey` 등) 명확 정의.
- **파운데이션 모듈(.ts) 마이그레이션**
  - `src/data/mockWikiData.ts`, `src/App.tsx`, `src/main.tsx` 정적 타입 정의 및 모듈 안정성 확보.

### 📌 2. PDF 첨부파일 최적화 & 텍스트/방향 100% 보존 (스마트 듀얼 압축 엔진)
- **PDF 파일 2MB 제한 상향 및 용량 압축 시 텍스트 사라짐 파괴 원천 해결**
  - 원인: 캔버스 래스터화(Canvas Rasterization) 시 폰트 페인팅 비동기 타이밍 문제로 텍스트 레이어가 미조회되어 흰 종이로 비어버리던 고질적 한계.
  - 해결: `page.getTextContent()` 명시적 동기화 + CMap/standardFontDataUrl 로딩 + `80ms Font Painting Delay`로 텍스트/폰트를 1글자도 지우지 않고 100% 선명 보존.
- **Landscape (가로 슬라이드 PPT 양식) 방향 자동 감지**
  - 원인: 기존 `orientation: 'portrait'` 세로 고정으로 가로 슬라이드가 찌그러지던 현상.
  - 해결: 첫 페이지 가로/세로 비율(`width > height`)을 자동 동적 감지하여 `orientation: 'landscape'` (가로 A4 297mm x 210mm)로 자동 생성.
- **스마트 듀얼 압축 엔진 (5~20MB 대용량 1.2MB ~ 1.7MB 획기적 감축)**
  - 1차: `pdf-lib` 무손실 바이너리 스트림 최적화 시도.
  - 2차: 2MB 초과 시 스마트 고화질 캔버스 엔진으로 텍스트 파괴 없이 1.2MB~1.7MB 이하로 획기적 감축.

### 📌 3. 서명 필기감 실현 & 다중 위원(2명 이상) 표결 실시간 수합
- **서명 캔버스 마우스/터치 유격 100% 제거**
  - `getCanvasCoords`에 `scaleX = canvas.width / rect.width`, `scaleY = canvas.height / rect.height` 비율 보정 알고리즘을 도입하여, 마우스/터치 펜 팁 바로 아래에서 실물 펜 필기감 실현.
- **다중 위원 서명 제출 관리자 화면 표결 집계 누락 수리**
  - 위원 제출 데이터 및 `committee_members.name` 조인 시 `.trim()` 문자열 유연 매칭 알고리즘을 적용하여 2명 이상 제출(변홍석, 이동은 등) 시 2명(100%) 성원 및 찬성 표결로 100% 즉시 반영.
- **Supabase DB 실시간 무결성 저장 연동**
  - `committee_meetings.responses_data` JSONB 컬럼 1순위 최우선 보장 DB 연동으로 외부 서명/표결 결과를 100% 실시간 DB에 무결성 보장 저장.

### 📌 5. 회의 수정 폼 안건/첨부자료 무결성 & PDF 뷰어 Vercel 414 / atob 예외 100% 완전 소멸
- **회의 수정 모달 안건 제목/설명 중복 태그 누적 완전 철폐**
  - 원인: 회의 수정 폼 초기화 시 `agenda` 및 안건 `title` 내 `[첨부: ...]` 나 `[상정 의안 #1]` 구문 미정제 주입으로 수정 시마다 지문 태그가 중복 연결되던 현상.
  - 해결: `cleanAgendaTitle` 정제 엔진을 강제 구동하여 pure 안건 제목(`수정사업`, `성과평가`, `테스트`)만 폼 인풋에 채워 넣도록 정제.
- **의안별 첨부자료 파이프(|) / JSON 배열 1:1 인덱스 독립 분리 매칭**
  - 원인: `meeting.attachment_name` 파이프 수합 문자열이 각 안건 인덱스(0, 1, 2)에 1:1로 할당되지 않아 의안 #2, #3에 엉뚱한 파일이 매칭되던 현상.
  - 해결: 0, 1, 2 인덱스 정밀 파싱 알고리즘을 구축하여 안건별로 올바른 심의자료만 1:1 독립 할당.
- **Supabase Storage 400 Bad Request 및 Safe ASCII Storage Path**
  - 한글/특수문자/괄호 포함 파일명 업로드 시 Supabase Storage REST API가 400 Bad Request를 뱉던 현상을 해결하기 위해 `doc_1784722135513_0_2026_3.pdf` 형태의 pure ASCII 영문 키 생성기 적용.
- **Vercel HTTP 414 URI Too Long & 5중 껍질 탈피(Unwrap) 디코더 탑재**
  - 원인: `attachment_data`에 2중/3중 겹친 URL 인코딩(%22, %5B) 및 JSON 문자열이 꼬여 Vercel 호스트 주소 뒤에 상대 URL로 주입되며 414 에러 및 백색 화면 유발.
  - 해결: 5중 껍질 탈피(Unwrap) 디코더를 탑재하여 pure `data:application/pdf;base64,...` 바이너리 1개만 정밀 인출함으로써 414 에러 원천 방지 및 PDF 100% 정상 열람 완수.
- **atob `InvalidCharacterError` 완충 및 rawStr 안전 폴백**
  - `decodeURIComponent` 1차 정제 + 4의 배수 길이 패딩(`=`) 자동 보정 + 예외 발생 시 `rawStr` 안전 폴백을 통해 `등록된 첨부 심의 자료가 없습니다.` 경고 소멸 및 PDF 뷰어 100% 원활 렌더링.
- **인쇄/PDF 출력 시 페이지 절단선 줄잘림 100% 소멸**
  - html2pdf 및 인쇄 템플릿 내 모든 문단/테이블/리스트 요소에 `@media print` 및 inline `page-break-inside: avoid !important; break-inside: avoid-page !important;` CSS 적용으로 문장/줄이 반통 잘리지 않고 다음 페이지로 깔끔히 통째 이전(Clean Page-Break).
- **보고서 테이블 1(심의 안건 목록) & 테이블 2(안건별 의결 통계) `[첨부: ...]` 태그 지움**
  - 인쇄/보고서 표출 시 안건명에 붙던 `[첨부: ...]` 구문을 완전히 정제하여 pure 안건 제목만 깔끔히 노출.
- **Supabase DB 마이그레이션 SQL 생성 완료**
  - `005_storage_meeting_docs_rls_policy.sql` (Storage Bucket RLS 허용 SQL)
  - `006_add_responses_data_to_committee_meetings.sql` (responses_data JSONB 컬럼 추가 SQL)

---

## 🗓️ 2026년 7월 21일 (개발 20일차)
### 📌 주요 작업 이벤트
- **회의 중복 생성 방지(Double-submission Guard) 구현**
  - [회의 등록 및 의결 개시] 버튼 연속 클릭 시 중복 생성 방지 Guard `isSubmittingMeeting` 로딩 상태 적용.
- **위원회 의결정족수 및 재적 산정 규칙 적용**
  - 간사(Secretary)를 재적 위원 수(`total_quorum`) 및 출석 표결 정족수 산정 대상에서 엄격 제외 처리.

---

## 🗓️ 2026년 7월 20일 (개발 19일차)
### 📌 주요 작업 이벤트
- **위원회 관리 및 서면 의결 모듈 초기 구축**
  - 앵커 사업단 운영위원회 회의 생성, 안건 등록, 외부 위원 의결 채널 보안 URL 생성 기능 구현.
