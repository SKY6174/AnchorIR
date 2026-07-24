# dashboard-visual-regression - Plan Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic

## 1. Overview

### 1.1 Purpose

대시보드 모듈화 이후의 UI/UX 보존 계약을 자동 검증한다. 현재 화면을 기준
baseline으로 고정하고, 이후 구조 변경이 DOM·레이아웃·픽셀 결과를 의도치 않게
변경하면 로컬과 CI에서 즉시 탐지한다.

### 1.2 Background

기존 모듈화는 이동한 JSX 본문의 문자 동등성과 수동 브라우저 smoke test로
검증했다. 이 방식은 현재 변경에는 충분했지만 앞으로 Satisfaction과 PDCA처럼
대형 화면을 추가 분리할 때 반복 가능한 시각 회귀 장치가 필요하다.

## 2. Goals

### 2.1 Primary Goals

- [ ] Playwright 기반 브라우저 회귀 테스트 환경 구축
- [ ] 고정 viewport, locale, timezone, color scheme으로 렌더링 결정성 확보
- [ ] 핵심 로그인 화면의 screenshot baseline 생성
- [ ] 외부위원 로그인 폼의 DOM 구조와 Enter 제출 경로 자동 검증
- [ ] console error와 예상하지 않은 page error를 실패로 처리
- [ ] 기존 TypeScript, lint, committee test, build gate에 영향 없음

### 2.2 Non-Goals

- 운영 Supabase 데이터를 변경하지 않는다.
- 실제 OTP, PAdES provider 또는 전자서명을 호출하지 않는다.
- 애플리케이션 JSX, Tailwind class, CSS와 레이아웃을 수정하지 않는다.
- 모든 업무 탭의 전체 E2E를 한 번에 구축하지 않는다.

## 3. Scope

### 3.1 In Scope

- Chromium desktop viewport의 main login baseline
- 외부위원 로그인 baseline과 폼 구조 contract
- 네트워크 mock을 사용한 외부위원 로그인 화면 결정성 확보
- screenshot update와 compare 명령
- 실패 artifact 및 실행 지침

### 3.2 Out of Scope

- 실제 운영 DB/Edge Function에 쓰기를 발생시키는 E2E
- Safari/Firefox 및 모바일 전체 matrix
- Satisfaction/PDCA 기능 자체의 구조 분리
- baseline 자동 승인

## 4. Success Criteria

- [ ] production source의 JSX/CSS 변경 0건
- [ ] 동일 환경에서 screenshot test 반복 통과
- [ ] 외부위원 PIN input에서 Enter가 form submit을 발생시킴
- [ ] baseline과 1px 이상 허용되지 않은 차이가 발생하면 실패
- [ ] `test:visual`과 `test:visual:update` 명령 제공
- [ ] TypeScript 0 errors, lint 0 diagnostics, committee 29/29, build passed

## 5. Implementation Order

1. Playwright dependency와 config 추가
2. deterministic rendering helper 추가
3. main login 및 external committee login test 작성
4. baseline 생성 후 재실행
5. 기존 네 가지 품질 gate와 visual gate 통합 검증
6. 갭분석과 완료보고

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 서버 데이터가 screenshot을 변경 | High | 외부위원 API mock, 초기 로그인 화면 우선 |
| font/animation 차이 | High | font 준비 대기, animation/transition 비활성화 |
| baseline이 의도치 않게 갱신 | High | update 명령 분리, 일반 test에서 쓰기 금지 |
| Playwright browser 미설치 | Medium | 명시적 설치·실행 안내와 사전 검증 |
| 민감정보 artifact 노출 | High | 실제 계정·PIN·운영 응답을 fixture에 저장하지 않음 |

## 7. References

- `docs/02-design/features/dashboard-modularization.design.md`
- `docs/03-analysis/dashboard-modularization.analysis.md`
- `docs/04-report/dashboard-modularization.report.md`
