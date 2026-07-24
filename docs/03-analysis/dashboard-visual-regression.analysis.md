# Gap Analysis: dashboard-visual-regression

> Date: 2026-07-24
> Design: `docs/02-design/features/dashboard-visual-regression.design.md`

## Match Rate: 95%

설계 검증 항목 20개 중 19개를 완전 충족했다. 핵심 목표인 production UI 무변경,
픽셀 baseline, 외부위원 DOM contract, PIN Enter submit, runtime error guard와 기존
품질 gate 연동을 완료했다.

## Implemented Items

- [x] Playwright Test 1.61.1과 bundled Chromium 설치
- [x] 고정 1440×900 viewport, device scale 1
- [x] `ko-KR`, `Asia/Seoul`, light scheme, reduced motion 고정
- [x] animation, transition, caret 비활성화와 font ready 대기
- [x] Vite 독립 webServer 및 고정 포트
- [x] main dashboard login screenshot baseline
- [x] external committee login screenshot baseline
- [x] external committee element/class/inline-style/role DOM signature
- [x] 위원회 코드·성명·보안코드 input 순서와 개수
- [x] PIN type/inputmode/pattern/maxlength contract
- [x] PIN Enter submit request 1회 검증
- [x] Supabase Edge Function public/auth/context route mock
- [x] 실제 운영 DB, PIN, 개인정보를 사용하지 않는 fixture
- [x] page error 및 예상하지 않은 console error guard
- [x] actual/diff/trace artifact와 HTML report
- [x] baseline compare/update 명령 분리
- [x] baseline compare 3회 연속 통과
- [x] TypeScript, lint, committee test, build 통과
- [x] production JSX/CSS diff 0

## Partial Item

- [ ] 현재 screenshot baseline은 `chromium-darwin`이다. macOS에서는 즉시 자동
  검증되지만 Linux CI는 같은 Playwright 버전으로 Linux baseline을 별도 생성·검토해야
  한다. 플랫폼 안내와 artifact 정책은 문서화했다.

## Evidence

| Gate | Result |
|---|---|
| visual tests | 3/3 passed, 3 consecutive compare runs |
| committee tests | 29/29 passed |
| TypeScript | 0 errors |
| lint | 0 diagnostics |
| production build | passed |
| screenshot diff allowance | 0 pixels |
| production source changes | 0 files |

## Security Review

- test mock은 browser context route에서만 적용된다.
- `.env`, Authorization header, 운영 세션과 실제 보안코드를 snapshot하지 않는다.
- 외부 인증 요청은 mock 밖으로 전송되지 않는다.
- test fixture는 가상 meeting/member/agenda 식별자만 포함한다.

## Recommendation

Linux CI를 도입할 때 해당 runner에서 최초 baseline을 생성하고 PNG diff를 사람이
검토한 뒤 platform-specific snapshot으로 커밋한다. 현재 macOS 개발 환경의 UI
보존 자동화는 완료 상태다.

## Conclusion

일치율 95%로 보고 단계 진입 기준 90%를 충족한다.
