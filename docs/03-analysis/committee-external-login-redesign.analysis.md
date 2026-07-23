# Gap Analysis: committee-external-login-redesign

> Date: 2026-07-23 | Design: `docs/02-design/features/committee-external-login-redesign.design.md`

---

## Match Rate: 96%

## Summary

인증 후 회의자료·표결·서명 화면을 로그인 화면의 UC 네이비·블루·화이트 디자인 체계로 확장했다. 기존 인증, PDF signed URL, 안건 선택, 표결, 임시 저장, 서명 canvas 및 최종 제출 이벤트는 변경하지 않았다. 정적 검증과 위원회 회귀 시험은 모두 통과했으며, 실제 인증 세션을 사용한 운영 화면 육안 확인만 배포 후 확인 항목으로 남는다.

## Implemented Items

- [x] 로그인 브랜드 패널과 연결되는 네이비 그라데이션 보안 세션 헤더
- [x] 회의명·일시·접속 위원·로그아웃 정보 위계 구성
- [x] 밝은 배경과 흰색 자료·표결·서명 카드
- [x] 안건 선택, 안건 상세, 첨부파일명, PDF iframe 기능 유지
- [x] 표결 값, 의견 입력, 서명 canvas, 임시 저장 및 최종 제출 기능 유지
- [x] 980px 자료 영역 1열 전환
- [x] 640px 헤더·서명 액션 세로 배치
- [x] 모바일 PDF 뷰어 최소 420px 높이
- [x] TypeScript production build, lint 및 위원회 시험 18건 통과

## Missing Items

- [ ] 배포된 운영 URL에서 실제 인증 세션 기준 데스크톱·모바일 육안 확인

## Changed Items (Deviations from Design)

- [x] 회의 자료의 실제 가독성을 위해 데스크톱 PDF 뷰어 높이를 최대 720px까지 유동적으로 확장
- [x] 인증 상태를 명확히 알리기 위해 헤더 아래 보안 세션 상태 띠 추가

## Recommendations

1. 다음 배포 후 실제 회의 링크에서 PDF 스크롤, 표결 버튼, 서명 입력을 한 차례 확인한다.
2. 운영 화면에서 긴 한글 첨부파일명과 모바일 390px 폭의 줄바꿈을 확인한다.

## Next Steps

- [x] 구현과 자동 검증 완료
- [ ] 배포 후 운영 화면 스모크 테스트
