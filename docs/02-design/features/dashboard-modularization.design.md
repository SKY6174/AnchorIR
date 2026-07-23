# dashboard-modularization - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/dashboard-modularization.plan.md`

---

## 1. Overview

### 1.1 Purpose

대형 데이터·화면 파일을 작은 책임 단위로 분리하되, 렌더링 결과와 사용자 동작, 서버 계약, 데이터 값과 순서를 그대로 보존한다. 각 단계는 호환 facade와 명시적 import 경계를 사용해 독립적으로 검증하고 되돌릴 수 있게 한다.

### 1.2 Design Goals

- JSX element 종류·순서·조건, Tailwind className, inline style, 표시 문자열을 변경하지 않는다.
- 기존 export/import 계약과 런타임 데이터 순서·객체 참조 의미를 보존한다.
- `feature → shared/data` 방향으로만 의존하며 순환 import를 만들지 않는다.
- 계산, I/O, 상태 수명주기, 화면 조립 책임을 구분한다.
- 한 번에 한 책임만 이동하고 매 batch마다 전체 품질 gate를 통과한다.

## 2. Architecture

### 2.1 Dependency Direction

```text
app/App.tsx
  ├─ features/*/screens
  ├─ features/*/hooks
  ├─ features/*/services
  ├─ shared/hooks | shared/utils | shared/types
  └─ data/mockData facade

features/*/screens
  ├─ same-feature hooks/services/components
  └─ shared + data

data/mockData facade
  └─ data/mock-data/*
```

허용하지 않는 방향:

- `shared`가 `features` 또는 `app`을 import
- `data`가 UI component를 import
- service가 React component/hook을 import
- feature 간 직접 상태 공유를 위한 상호 import

### 2.2 Responsibility Boundaries

| Layer | Responsibility | Must not own |
|---|---|---|
| `app` | 인증·전역 레이아웃·최상위 탭 조립 | 도메인별 상세 JSX·DB query 구현 |
| `features/*/screens` | 기존 JSX의 1:1 화면 구성 | 직접적인 Supabase query 조립 |
| `features/*/hooks` | 상태·effect·handler 수명주기 | 시각 스타일 재정의 |
| `features/*/services` | 조회·저장·payload 변환·오류 전달 | React state |
| `shared` | 여러 feature가 사용하는 타입·순수 utility | feature 고유 비즈니스 흐름 |
| `data/mock-data` | 정적 seed/mock 데이터 | UI 상태·서버 통신 |

### 2.3 UI Preservation Contract

- JSX 이동 시 기존 최상위 element를 그대로 반환한다.
- 이동 편의를 위한 wrapper element를 추가하지 않는다.
- Fragment는 실제 DOM node를 추가하지 않을 때만 허용한다.
- className 문자열, class 순서, inline style 값, aria 속성, label/input 연결을 그대로 유지한다.
- conditional rendering의 조건식 평가 순서와 fallback을 변경하지 않는다.
- handler를 prop으로 이동할 때 기존 callback 호출 시점과 인자를 유지한다.
- memoization과 lazy loading은 동작·레이아웃 검증 후 별도 batch에서만 적용한다.

## 3. Static Data Design

### 3.1 Existing Export Contract

`src/data/mockData.ts`는 다음 이름을 계속 export한다.

- `LegacyDataRecord`
- `ProgramData`
- `UnitData`
- `ProjectData`
- `initialProjectsData`
- `userRoles`
- `YEAR_1_PROGRAMS`
- `Y1_UNIT_META`

기존 consumer import 경로는 첫 batch에서 바꾸지 않는다. `mockData.ts`는 호환 facade로 남기고 내부 모듈을 re-export한다.

### 3.2 Planned Modules

```text
src/data/
├── mockData.ts
└── mock-data/
    ├── data-types.ts
    ├── initial-projects.ts
    ├── project-a.ts
    ├── project-b.ts
    ├── project-c.ts
    ├── project-d.ts
    ├── project-e.ts
    ├── user-roles.ts
    ├── year-1-programs.ts
    ├── year-1-programs-a.ts
    ├── year-1-programs-b.ts
    ├── year-1-programs-c.ts
    ├── year-1-programs-d.ts
    └── year-1-unit-meta.ts
```

AST 측정 경계:

- `initialProjectsData`: 최상위 프로젝트 A~E, 5개
- `YEAR_1_PROGRAMS`: 최상위 unit key 12개
  - A: `A1가`, `A2`, `A3`
  - B: `B1`, `B2`, `B3`, `B4`
  - C: `C1`, `C2`
  - D: `D1`, `D2`, `D3`

데이터 literal의 내부 값과 property 순서를 수정하지 않는다. 집계 모듈은 spread가 아니라 명시적 배열/객체 조립을 사용해 기존 최상위 순서를 보존한다. 외부에는 기존 mutable 타입 계약을 유지한다.

### 3.3 Identity and Order

- 각 프로젝트와 unit map은 모듈 초기화 시 한 번만 생성한다.
- `initialProjectsData`는 `[projectA, projectB, projectC, projectD, projectE]` 순서를 유지한다.
- `YEAR_1_PROGRAMS`는 기존 삽입 순서 `A1가, A2, B1, C1, D3, D1, B4, B2, B3, D2, C2, A3`를 유지한다.
- facade import와 직접 module import가 같은 객체를 가리키도록 재생성·deep clone을 금지한다.

## 4. App Decomposition

### 4.1 Extraction Order

1. 로컬 type alias/interface
2. 상수와 순수 계산·normalization 함수
3. Supabase query/mutation service
4. 자동 저장·복원·인증 관련 hook
5. 탭별 화면 component
6. 최상위 조립과 lazy boundary

### 4.2 State Ownership Rule

- 여러 탭이 함께 쓰는 상태는 `App` 또는 공유 app hook에 남긴다.
- 한 탭에서만 쓰는 상태는 해당 feature hook으로 이동한다.
- effect를 이동할 때 dependency 배열, cleanup, 초기 실행 여부를 그대로 유지한다.
- service는 상태를 직접 변경하지 않고 typed result 또는 오류를 반환한다.
- localStorage key, 저장 시점, debounce 간격, Supabase table/RPC 이름은 변경하지 않는다.

### 4.3 Screen Extraction Rule

처음 화면을 이동할 때는 props 수가 많더라도 context/store를 새로 도입하지 않는다. 기존 closure가 사용하던 값과 handler를 명시적 props로 전달하고, 안정화 후에만 hook 단위로 줄인다.

## 5. Manager Decomposition

| Order | Target | First boundaries | Special gate |
|---|---|---|---|
| 1 | `ScheduleManager` | 일정·회의·언론보도 | 날짜/필터/저장 회귀 |
| 2 | `ProcurementManager` | 환경개선·기자재·용역 | 금액 합계·CRUD 회귀 |
| 3 | `SatisfactionManager` | 설문·응답·분석·내보내기 | 집계·export 회귀 |
| 4 | `PDCAManager` | 편집·승인·보고서 | 승인 상태·PDF 회귀 |
| 5 | `CommitteeManager` | 내부관리·외부심의·표결·결과보고서 | 정족수·중복표결·서명·PDF 전체 시험 |

`CommitteeManager`는 다른 manager의 분리 패턴과 검증 절차가 안정된 뒤 마지막에 처리한다.

## 6. API and Security Contract

이번 구조 개편은 새 endpoint 또는 DB migration을 만들지 않는다.

- Supabase table, RPC, storage bucket, request payload, response normalization을 변경하지 않는다.
- Supabase Auth와 `rise_users` 결합 규칙을 변경하지 않는다.
- 외부위원 committee code, security code, lockout, session 복원 규칙을 변경하지 않는다.
- 비밀정보를 새 로그·fixture·문서에 기록하지 않는다.
- 사용자 입력 검증 위치를 이동하더라도 validation 순서와 오류 문구를 유지한다.

## 7. Implementation and Commit Plan

각 batch는 source edit 전 `bkit_pre_write_check`, significant edit 후 `bkit_post_write`를 수행한다.

1. `mockData` 호환 facade 및 데이터 모듈 분리
2. `App` type/constant/pure utility 분리
3. `App` Supabase service 분리
4. `App` lifecycle hook 분리
5. 탭별 JSX component 분리
6. `ScheduleManager` 분리
7. `ProcurementManager` 분리
8. `SatisfactionManager`와 `PDCAManager` 분리
9. 위원회 회귀시험 강화
10. `CommitteeManager` 분리
11. lazy boundary 및 bundle 측정
12. 전체 gap analysis와 결과보고

각 batch는 관련 파일만 명시적으로 stage하며 사용자 소유 diary, PDCA status, Supabase temp 파일은 포함하지 않는다.

## 8. Test Plan

### 8.1 Every Batch

- `npx tsc --noEmit --pretty false`
- `npm run lint -- --format=unix`
- `npm run test:committee`
- `npm run build`
- 변경 파일 export/import 정적 비교

### 8.2 Data Equivalence

분할 전 기준 snapshot과 분할 후 facade export에 대해 다음을 비교한다.

- `JSON.stringify` 결과
- 최상위 key와 배열 순서
- 프로젝트/unit/program 개수
- 예산 합계와 주요 ID 집합
- facade와 내부 aggregation의 object identity

### 8.3 UI Equivalence

- 핵심 탭의 동일 viewport screenshot 비교
- DOM element 종류·순서와 className 비교
- 탭 이동, modal, 저장, 새로고침 복원 smoke test
- layout shift와 console error 확인

### 8.4 Committee Critical Regression

- 외부위원 로그인 버튼과 Enter 제출
- 실패 횟수·잠금 처리
- 심의 자료 접근권한
- 찬성/반대/기권 및 중복 제출 방지
- 정족수와 의결 결과 계산
- 디지털 봉인 PDF 결과보고서 생성
- 재로그인·세션 복원·서명 감사 추적

## 9. Completion Gates

- 모든 기존 기능이 동일하게 동작한다.
- TypeScript, lint, committee tests, production build가 통과한다.
- UI 변경 diff가 없거나 기능과 무관한 렌더러 차이로 설명 가능하다.
- 설계-구현 gap analysis 목표는 90% 이상이다.
- `App.tsx`와 manager가 조립 책임 중심으로 축소되고 순환 import가 없다.
