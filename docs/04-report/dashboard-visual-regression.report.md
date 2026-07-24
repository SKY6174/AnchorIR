# Completion Report: dashboard-visual-regression

> Date: 2026-07-24
> Result: Completed
> Design match rate: 95%

## 1. Summary

대시보드 로그인과 외부위원 로그인 화면을 Playwright pixel/DOM baseline으로
고정했다. 앞으로 모듈을 이동하거나 구조를 변경할 때 1픽셀 또는 DOM signature
차이, PIN Enter 제출 손상, runtime error를 자동 탐지할 수 있다.

## 2. Related Documents

- Plan: `docs/01-plan/features/dashboard-visual-regression.plan.md`
- Design: `docs/02-design/features/dashboard-visual-regression.design.md`
- Analysis: `docs/03-analysis/dashboard-visual-regression.analysis.md`

## 3. Delivered Artifacts

- `playwright.config.ts`
- `tests/visual/dashboard-login.visual.spec.ts`
- `tests/visual/committee-login.visual.spec.ts`
- `tests/visual/helpers/visual-test-helpers.ts`
- dashboard login 1440×900 PNG baseline
- committee login 1440×900 PNG baseline
- committee login DOM signature baseline
- `tests/visual/README.md`

## 4. Commands

```bash
npm run test:visual
npm run test:visual:update
npm run test:visual:report
```

일반 실행은 baseline을 변경하지 않는다. update 명령은 승인된 UI 변경에서만
사용하며 생성된 PNG와 DOM snapshot을 검토해야 한다.

## 5. Quality Results

| Check | Result |
|---|---|
| visual regression | 3/3 passed |
| repeated determinism | 3 consecutive compare runs passed |
| committee regression | 29/29 passed |
| TypeScript | 0 errors |
| lint | 0 diagnostics |
| production build | passed |
| production JSX/CSS | unchanged |

## 6. External Committee Coverage

- public meeting 조회는 가상 Edge Function 응답으로 격리했다.
- 화면의 위원회 코드, 성명, PIN input 구조를 검증한다.
- PIN input에서 Enter를 누르면 authenticate action이 정확히 한 번 발생한다.
- 성공 mock 후 안건 화면 진입까지 확인한다.
- 실제 위원 정보, PIN, 운영 DB 쓰기는 발생하지 않는다.

## 7. Operational Note

현재 PNG는 개발 환경과 동일한 `chromium-darwin` baseline이다. Linux CI 추가 시
동일 Playwright 버전에서 Linux baseline을 생성하고 사람이 시각 검토한 후
platform-specific snapshot을 함께 관리한다.

## 8. Dependency Audit Note

`npm audit`의 high 1건은 이번에 추가한 Playwright가 아니라 기존 `xlsx@0.18.5`의
prototype pollution 및 ReDoS advisory다. npm registry에는 자동 수정 가능한
버전이 표시되지 않으므로 별도의 spreadsheet 보안 교체 계획에서 다룬다.

## 9. Next Step

시각 안전망이 생겼으므로 다음 구조 개선은 Satisfaction 화면의 결과·목록·AI 입력
경계를 작은 batch로 분리하는 순서가 적합하다.
