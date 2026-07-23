# Gap Analysis: committee-external-login-redesign

> Date: 2026-07-23 | Design: `docs/02-design/features/committee-external-login-redesign.design.md`

---

## Match Rate: 96%

## Summary

외부위원 미인증 화면을 UC 보안 포털형 2열 레이아웃으로 교체했다. 기존 인증 함수, 세션 저장, 인증 이후 심의·의결·서명 흐름에는 변경이 없다. 데스크톱과 모바일 모두 가로 넘침 없이 렌더링되며, TypeScript·lint·위원회 회귀시험·production build를 통과했다.

## Implemented Items

- [x] 데스크톱 52.5%/47.5% 네이비·화이트 분할 레이아웃
- [x] UC 브랜드, 보안 안내, 신뢰 카드와 장식 원 구현
- [x] 접근 코드 readonly 표시
- [x] 위원 코드와 개인 보안코드를 기존 state에 연결
- [x] 기존 `handleAuthSubmit` 및 인증 service 호출 보존
- [x] PIN `password` 타입과 기존 오류 mapper 보존
- [x] 900px 이하 1열 전환 및 390px 모바일 가로 넘침 방지
- [x] TypeScript 0, lint 0, 위원회 시험 6/6, build 성공

## Missing Items

- [ ] 1440×900 별도 캡처는 생략했다.

## Changed Items (Deviations from Design)

- [x] 640px 축소 기준은 구현 스타일 체계에 맞춰 560px로 적용했다.
- [x] 입력 배경은 레퍼런스 대비를 맞추기 위해 `#eef4ff`를 사용했다.
- [x] 로컬 production preview는 기존 차트 청크 초기화 오류로 화면 캡처하지 못해, 동일 소스의 로컬 개발 렌더링을 2048×1076 및 390×844에서 검증했다.

## Verification Evidence

- 2048×1076: body/page 폭 2048px, 좌우 패널 합계 2048px
- 390×844: body/page 폭 390px, hero/access 폭 390px
- 모바일 trust grid 및 input: 좌우 20px 여백, 폭 350px
- `npx tsc --noEmit --pretty false`: 성공
- `npx oxlint . --format=json`: 118 files, 0 diagnostics
- `npm run test:committee`: 6/6 성공
- `npm run build`: 성공

## Next Steps

- [x] 디자인 일치율 90% 이상으로 보고 단계 진행 가능
- [ ] 기존 production preview 차트 청크 초기화 문제는 별도 성능/번들 작업에서 점검
