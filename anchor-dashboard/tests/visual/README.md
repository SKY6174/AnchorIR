# Visual regression tests

이 테스트는 production JSX/CSS를 변경하지 않고 현재 로그인 화면을 픽셀 및 DOM
baseline으로 고정합니다.

## First-time setup

```bash
npm install
npx playwright install chromium
```

## Compare with the committed baseline

```bash
npm run test:visual
```

일반 실행은 baseline을 변경하지 않습니다. 차이가 있으면
`test-results/visual`에 actual/diff/trace가 생성됩니다.

## Intentionally update the baseline

UI 변경이 승인되고 expected/actual/diff를 검토한 경우에만 실행합니다.

```bash
npm run test:visual:update
npm run test:visual
```

갱신된 PNG와 DOM snapshot을 함께 검토하고 별도 커밋합니다.

## Current contracts

- 대시보드 메인 로그인 화면 1440×900 screenshot
- 외부위원 로그인 화면 1440×900 screenshot
- 외부위원 로그인 element/class/inline-style/role DOM signature
- 외부위원 PIN Enter submit
- page error와 예상하지 않은 console error 0건

## Platform note

Playwright screenshot 이름에는 실행 플랫폼이 포함됩니다. 현재 baseline은
`chromium-darwin`입니다. 다른 OS의 CI에서 실행하려면 해당 OS의 동일 Playwright
버전으로 baseline을 별도로 생성하고 검토해야 합니다. DOM snapshot과 동작 테스트는
같은 spec에서 함께 실행됩니다.
