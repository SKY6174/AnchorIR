# year-2-program-naming-and-common-id - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Purpose

1차년도와 2차년도 프로그램 데이터 모듈의 명명 규칙을 통일하고,
2차년도 공통운영경비의 프로젝트 ID를 `E`에서 `X`로 일원화한다.

## 2. Goals

- [ ] `project-a.ts`~`project-d.ts`를 `year-2-programs-a.ts`~`year-2-programs-d.ts`로 변경
- [ ] 공통운영경비 파일을 `year-2-programs-x.ts`로 변경
- [ ] export 상수를 `YEAR_2_PROGRAMS_A`~`YEAR_2_PROGRAMS_X`로 통일
- [ ] 공통운영경비 프로젝트 ID를 `X`로 변경
- [ ] 하위 분류 `X0` 및 `X0-*` 프로그램 ID는 그대로 유지
- [ ] 기존 DB·로컬 캐시의 프로젝트 ID `E`를 런타임에서 `X`로 마이그레이션

## 3. Non-Goals

- 데이터 내용, 예산, 집행액, 담당자와 프로그램 순서 변경
- `X0` 하위 프로그램 ID 재설계
- UI DOM, class, inline style, 문구와 레이아웃 변경
- Supabase 스키마 변경
- 외부위원 인증·심의·의결 변경

## 4. Rename Map

| Before | After |
|---|---|
| `project-a.ts` | `year-2-programs-a.ts` |
| `project-b.ts` | `year-2-programs-b.ts` |
| `project-c.ts` | `year-2-programs-c.ts` |
| `project-d.ts` | `year-2-programs-d.ts` |
| `project-e.ts` | `year-2-programs-x.ts` |
| `PROJECT_A`~`PROJECT_D` | `YEAR_2_PROGRAMS_A`~`YEAR_2_PROGRAMS_D` |
| `PROJECT_E` | `YEAR_2_PROGRAMS_X` |
| 공통운영경비 프로젝트 ID `E` | `X` |

## 5. Success Criteria

- [ ] 구 `project-a.ts`~`project-e.ts` 참조 0
- [ ] 런타임 공통운영경비 프로젝트 ID `X`
- [ ] 하위 ID `X0` 및 `X0-*` 변경 0
- [ ] 기존 `E` 캐시/DB 데이터가 `X`로 변환된 뒤 병합
- [ ] 데이터 배열 순서와 비-ID 데이터 exact comparison 통과
- [ ] TypeScript, lint, committee 29/29, visual 3/3, build 통과

## 6. Risks

| Risk | Mitigation |
|---|---|
| import 누락 | 전체 저장소 참조 검색 후 rename |
| 기존 DB의 `E`와 신규 `X` 중복 | 병합 전 migration 함수에서 `E → X` |
| 1차년도 공통경비 필터 회귀 | `E` 조건을 `X` 조건으로 함께 전환 |
| 데이터 손상 | 파일 이동 외에는 export명과 프로젝트 ID만 변경 |
