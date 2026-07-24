# dashboard-visual-regression - Design Document

> Version: 1.0.0 | Date: 2026-07-24 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/dashboard-visual-regression.plan.md`

## 1. Overview

### 1.1 Purpose

Playwright Test의 screenshot assertion과 DOM contract assertion을 사용해 현재
대시보드 로그인 UI와 외부위원 로그인 UI를 회귀 기준으로 고정한다.

### 1.2 Design Goals

- production component와 stylesheet는 변경하지 않는다.
- 실제 운영 DB와 인증 provider를 호출하지 않는다.
- locale, timezone, viewport, color scheme, animation을 고정한다.
- 일반 실행은 baseline을 읽기만 하며 별도 update 명령만 baseline을 변경한다.
- screenshot failure 시 actual, expected, diff와 trace를 보존한다.

## 2. Architecture

### 2.1 Test Runtime

```text
Playwright Test
  ├─ webServer: Vite local server
  ├─ Chromium desktop project
  ├─ deterministic page helper
  ├─ main login visual contract
  └─ external committee login visual/DOM contract
```

테스트는 독립 프로세스의 Vite server를 `127.0.0.1:4174`에 실행한다. 기존 개발
서버와 충돌하지 않도록 포트를 고정하고, CI에서는 기존 server를 재사용하지 않는다.

### 2.2 Deterministic Browser Context

- viewport: 1440 × 900
- device scale factor: 1
- locale: `ko-KR`
- timezone: `Asia/Seoul`
- color scheme: light
- reduced motion: reduce
- browser: bundled Chromium
- screenshot animation: disabled
- caret: hidden
- document fonts ready 대기
- CSS animation/transition 강제 비활성화

### 2.3 Network Boundary

main login은 초기 화면만 검사하므로 인증 요청을 보내지 않는다.

external committee login은 URL의 meeting/code parameter를 사용하되 Supabase Edge
Function 요청을 route mock으로 차단한다. mock payload는 화면에 필요한 공개
위원회명, 위원 성명과 meeting 식별자만 포함하며 실제 개인정보·PIN을 사용하지 않는다.
POST 인증 요청은 테스트에서 캡처해 Enter submit 발생만 검증하고 성공 세션을 만들지
않는다.

## 3. File Structure

```text
anchor-dashboard/
├── playwright.config.ts
├── tests/
│   └── visual/
│       ├── helpers/
│       │   └── visual-test-helpers.ts
│       ├── dashboard-login.visual.spec.ts
│       ├── committee-login.visual.spec.ts
│       └── *-snapshots/
├── test-results/              # gitignored
└── playwright-report/         # gitignored
```

`package.json` scripts:

- `test:visual`: baseline compare
- `test:visual:update`: 명시적 baseline 갱신
- `test:visual:report`: 마지막 HTML report 열기

## 4. Test Contracts

### 4.1 Main Login

- 페이지 최상위 영역이 viewport 안에 존재한다.
- 로그인 form, 사용자 ID, 비밀번호, submit button을 accessible role/label로 찾는다.
- page error와 예상하지 않은 console error가 없다.
- `dashboard-login.png`가 baseline과 pixel-level로 일치한다.

### 4.2 External Committee Login

- `.committee-login-page`와 `.committee-login-form`이 각각 1개 존재한다.
- form 내부 input 순서는 위원회 코드, 위원 성명, 보안코드다.
- 보안코드는 `type=password`, `inputmode=numeric`, `pattern=[0-9]{6}`,
  `maxlength=6`을 유지한다.
- PIN input에서 Enter 입력 시 동일 form submit 요청이 정확히 1회 발생한다.
- `.committee-login-page`의 DOM element name/class/style signature를 snapshot한다.
- `committee-login.png`가 baseline과 pixel-level로 일치한다.

## 5. Screenshot Policy

- 기본 `maxDiffPixels`는 0으로 설정한다.
- screenshot은 full page가 아닌 고정 viewport를 사용한다.
- baseline 파일은 Git에 포함한다.
- 변경 의도가 문서화되지 않은 상태에서 update 명령을 실행하지 않는다.
- 의도된 UI 변경은 expected/actual/diff 검토 후 별도 커밋한다.

## 6. Failure Policy

다음은 즉시 실패한다.

- page error
- application source에서 발생한 console error
- locator 수 또는 DOM contract 불일치
- pixel diff 1개 이상
- mock되지 않은 외부 인증 요청
- baseline 부재

favicon 또는 browser 자체 noise는 URL과 message를 명시적으로 좁혀 제외할 수 있으나,
일반적인 console error를 포괄적으로 무시하지 않는다.

## 7. Security

- `.env`, 운영 세션, 실제 계정, 실제 보안코드를 fixture에 기록하지 않는다.
- test artifact에 API key 또는 Authorization header를 첨부하지 않는다.
- 네트워크 mock은 test context 내부에서만 동작한다.
- screenshot에는 테스트용 가상 위원명만 사용한다.

## 8. Implementation Order

1. Playwright dependency와 scripts
2. config와 artifact ignore
3. deterministic helper
4. main login contract
5. external committee route mock과 contract
6. Chromium 설치 및 baseline 생성
7. baseline 재실행
8. 기존 네 가지 품질 gate

## 9. Completion Gates

- `npm run test:visual` passed
- baseline 재실행 2회 연속 passed
- production source JSX/CSS diff 0
- TypeScript 0 errors
- lint 0 diagnostics
- committee tests 29/29
- production build passed
