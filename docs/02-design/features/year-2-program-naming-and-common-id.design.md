# year-2-program-naming-and-common-id - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/year-2-program-naming-and-common-id.plan.md`

## 1. Module Structure

```text
src/data/mock-data/
├── year-1-programs-a.ts ... year-1-programs-d.ts
├── year-1-programs.ts
├── year-2-programs-a.ts ... year-2-programs-d.ts
├── year-2-programs-x.ts
└── initial-projects.ts
```

`initial-projects.ts`는 기존 공개 facade를 유지하되 새 `YEAR_2_PROGRAMS_*`
상수를 A, B, C, D, X 순서로 조립한다.

## 2. ID Hierarchy

```text
Project: X
  └─ Program/Unit: X0
       └─ Detail program: X0-S1Tn-n
```

- 공통운영경비 최상위 프로젝트 ID만 `E → X`
- 기존 `X0` 및 `X0-*`는 변경하지 않는다.

## 3. Legacy Migration

`migrateProgramIds`가 프로그램 ID 마이그레이션에 앞서 최상위 전략/프로젝트
ID가 `E`이면 `X`로 변경한다. 이 함수는 초기 데이터, DB 응답과 로컬 캐시에
이미 공통 적용되므로 병합 전에 구·신규 ID 중복을 방지한다.

## 4. Consumer Updates

- `App.tsx`: 1차년도 공통운영경비 제외 조건 `X`
- `KPIOverview.tsx`: 1차년도 제외 및 표시명 조건 `X`
- `initial-projects.ts`: 새 파일명과 export 상수 사용
- 과거 완료 문서와 백업 파일은 이력 보존을 위해 수정하지 않는다.

## 5. Preservation Contract

- 데이터 파일의 비-ID 내용과 배열 순서 변경 0
- 예산, 집행액, 담당자, PDCA와 KPI 변경 0
- JSX 태그, class, style와 문구 변경 0
- Supabase query/payload 변경 0
- 외부위원 코드 변경 0

## 6. Verification

- 구 production source 파일·import·상수 참조 0
- 공통운영경비 계층 `X → X0 → X0-*`
- 이동 전후 데이터 normalized comparison
- TypeScript, lint, committee 29/29, visual 3/3, build
- `git diff --check`
