# pdca-manager-decomposition - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/pdca-manager-decomposition.plan.md`

## 1. Architecture

```text
PDCAManager
  ├─ PdcaViewHeader
  ├─ PdcaUnitExplorer
  ├─ PdcaProgramWorkspace
  │   ├─ PdcaPlanStage
  │   ├─ PdcaDoStage
  │   ├─ PdcaCheckStage
  │   └─ PdcaActStage
  ├─ PdcaAllProgramsView
  └─ PdcaFeedbackToast
```

부모는 Supabase 변경이력, state/effect, PDF 생성, 승인·저장 handler와 자동 단계
전환 규칙을 유지한다. child는 전달된 값과 callback으로 기존 JSX를 렌더링한다.
복잡한 화면은 작은 독립 경계부터 추출하며 한 batch에서 한 경계만 이동한다.

## 2. UI Preservation Contract

- 기존 `viewMode`, `activePdcaStage`, 권한 조건식은 부모 위치에 유지한다.
- 조건 내부의 기존 단일 최상위 JSX를 child return으로 그대로 이동한다.
- 새 wrapper element를 만들지 않는다.
- className, style, text, role, tabIndex, key와 event 순서를 변경하지 않는다.
- 각 이동 본문은 들여쓰기 제거 후 원본과 문자 단위로 일치해야 한다.
- design 개선이나 접근성 수정은 이 구조 변경과 섞지 않는다.

## 3. Component Boundaries

### PdcaViewHeader

제목, PDF 다운로드, 단위과제별/전체 현황 보기 전환을 렌더링한다.
PDF와 viewMode handler는 부모 callback을 그대로 받는다.

### PdcaUnitExplorer

단위과제와 프로그램 탐색 목록을 렌더링한다. 선택 상태와 탐색 callback만 받고
DB 또는 상태를 직접 갱신하지 않는다.

### PdcaProgramWorkspace

선택 프로그램의 단계 navigation과 상세 입력 공간을 조립한다. 단계별 화면은
props가 안정된 순서대로 P/D/C/A child로 추가 분리한다.

### PdcaAllProgramsView

전체 프로그램 table과 선택 프로그램 요약을 렌더링한다. 프로그램에 필요한
최소 구조 타입을 선언하고, 선택/단계 변경 handler를 props로 전달받는다.

### PdcaFeedbackToast

저장 결과 메시지를 기존 중앙 overlay와 동일하게 렌더링한다.

## 4. Types and Data Flow

- 기존 `LegacyPdcaRecord`와 `pdca-utils` 함수는 재사용한다.
- child props에는 새 `any`를 선언하지 않는다.
- 구조 타입은 화면에서 실제 읽는 필드만 optional로 선언한다.
- parent state setter는 `Dispatch<SetStateAction<T>>` 또는 기존 callback을 사용한다.
- child에서 `supabase`, `localStorage`, PDF library를 import하지 않는다.

```text
Supabase/localStorage/PDF
          |
          v
     PDCAManager handlers/state
          |
          v
 typed values + callbacks
          |
          v
 presentational feature components
```

## 5. API and Security Contract

- `program_version_requests` 조회·승인 payload를 변경하지 않는다.
- 프로그램 상세 저장 callback 인자를 변경하지 않는다.
- GUEST read-only 및 rank/researcher 권한 조건을 유지한다.
- PDF 생성과 다운로드의 사용자 입력 escaping 방식을 변경하지 않는다.

## 6. Extraction Sequence

1. `PdcaFeedbackToast`
2. `PdcaViewHeader`
3. `PdcaAllProgramsView`
4. `PdcaUnitExplorer`
5. 독립성이 높은 C/A 단계
6. D/P 단계와 workspace 조립은 props 복잡도를 재평가해 후속 batch로 결정

## 7. Test Gates

Every batch:

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run test:visual`
- `npm run build`
- `git diff --check`
- 이동 JSX normalized character exact comparison

## 8. Completion Gate

- 최소 3개 주요 화면 경계 분리
- 부모 line count 유의미한 감소
- UI/API/권한 contract 변경 0
- child 직접 Supabase 접근 0
- 전체 품질 gate 통과
- 설계 일치율 90% 이상
