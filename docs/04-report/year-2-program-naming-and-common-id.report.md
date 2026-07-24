# Completion Report: year-2-program-naming-and-common-id

> Date: 2026-07-24 | Match Rate: 100% | Status: Complete

## Outcome

1·2차년도 프로그램 파일 명명 규칙을 통일하고, 2차년도 공통운영경비 ID를
`X` 계열로 일원화했다.

## Delivered Structure

```text
src/data/mock-data/
├── year-1-programs-a.ts ... year-1-programs-d.ts
├── year-2-programs-a.ts ... year-2-programs-d.ts
└── year-2-programs-x.ts
```

## ID Result

```text
Project X: 공통운영경비
└── X0
    ├── X0-S1T1-1
    └── ... X0-* 10개
```

기존 Supabase·로컬 캐시의 `E`는 `migrateProgramIds` 처리 단계에서 `X`로
변환되므로 신규 마스터 데이터와 중복되지 않는다.

## Preserved Contracts

- 2차년도 데이터 내용과 배열 순서 유지
- 예산, 집행액, 담당자, PDCA와 KPI 유지
- `X0` 및 모든 `X0-*` ID 유지
- UI DOM, class, style, 문구와 레이아웃 변경 없음
- 외부위원 인증·심의·의결 변경 없음

## Quality Evidence

- 이동 데이터 normalized exact comparison: 5/5 pass
- TypeScript: pass
- lint: pass, warning 0
- committee regression: 29/29 pass
- visual regression: 3/3 pass
- production build: pass
- design match rate: 100%

## Commits

- `5c4d90a` design year 2 program naming
- `930103a` align year 2 program naming and common ID
