# pdca-manager-decomposition - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Overview

### 1.1 Purpose

`PDCAManager.tsx`의 화면 렌더링 책임을 기능별 컴포넌트로 분리해 변경 충돌과
회귀 위험을 낮춘다. 기존 PDCA 승인, 예산, 일정, 실적, 환류 기능과 UI는
완전히 보존한다.

### 1.2 Background

현재 파일은 3,525줄이며 Supabase 변경이력, PDF 보고서, 자동 단계 전환,
프로그램 선택, P/D/C/A 입력 화면과 전체 현황 화면을 함께 소유한다.
한 번에 로직까지 이동하면 결재와 데이터 동기화 회귀 위험이 크므로 먼저
순수 렌더링 경계를 1:1 추출한다.

## 2. Goals

### 2.1 Primary Goals

- [ ] 전체 프로그램 현황 화면을 독립 컴포넌트로 분리
- [ ] 단위과제/프로그램 탐색 화면을 독립 컴포넌트로 분리
- [ ] P/D/C/A 단계 화면을 가능한 범위에서 기능별 분리
- [ ] 부모가 Supabase, state, effect, PDF 및 handler를 계속 소유
- [ ] TypeScript와 회귀 검증을 모든 batch에서 통과

### 2.2 Non-Goals

- 데이터베이스 schema 또는 payload 변경
- 승인·결재 workflow 재설계
- Tailwind/className/inline style/DOM 구조 변경
- 기존 PDF 문서 형식 변경
- 상태관리 library 또는 context 도입

## 3. Scope

### 3.1 In Scope

- `src/components/PDCAManager.tsx`
- `src/features/pdca/components/`의 typed presentational components
- 기존 `pdca-utils` type과 계산 utility 재사용
- 들여쓰기 정규화 JSX 문자 동등성 검증

### 3.2 Out of Scope

- 서비스·hook 계층으로의 DB workflow 이동
- UI redesign 및 접근성 마크업 재작성
- 운영 DB migration

## 4. Success Criteria

- [ ] 최소 3개 주요 화면 경계 분리
- [ ] 부모 파일 line count 유의미한 감소
- [ ] 이동 JSX 본문 100% 문자 동등
- [ ] child의 직접 Supabase 접근 0
- [ ] TypeScript, lint, committee 29개, visual 3개, build 모두 통과
- [ ] 설계 일치율 90% 이상

## 5. Implementation Order

1. 전체 프로그램 현황 view
2. 상단 탐색/보기 전환 영역
3. 독립성이 높은 단계별 화면
4. 마지막에 부모 조립 구조와 문서 검증

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 승인 handler 연결 누락 | High | 기존 callback을 props로 그대로 전달 |
| PDF 데이터 누락 | High | PDF 생성 로직은 부모에 유지 |
| 화면 미세 변경 | High | JSX 문자 비교와 visual gate 병행 |
| props 경계의 타입 약화 | Medium | 명시 타입 사용, 새 `any` 금지 |
| 외부위원 기능 회귀 | High | 모든 batch에서 committee/visual test 수행 |

## 7. References

- `docs/04-report/satisfaction-manager-decomposition.report.md`
- `docs/02-design/features/dashboard-modularization.design.md`
