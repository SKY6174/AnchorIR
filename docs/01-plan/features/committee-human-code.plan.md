# committee-human-code - Plan Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic

## 1. Purpose

로그인 화면의 무작위 공개 식별값 대신 사람이 이해할 수 있는 위원회 관리코드를 표시한다.

## 2. Code Rule

`UC-ANCHOR-{연도}-{위원회코드}-{차수}`

- 연도: 회의일시의 4자리 연도
- 위원회코드: 위원회 유형별 고정 영문 코드
- 차수: 회의 제목의 `제1차`, `1차`, `제1회`, `1회`에서 추출하여 두 자리로 표기
- 차수 누락: 임의 생성하지 않고 `XX`

## 3. Scope

- 공통 코드 생성 utility와 단위시험
- 외부위원 로그인 화면의 readonly 위원회 코드 변경
- 무작위 `public_code`와 보안 인증 흐름 유지

## 4. Success Criteria

- [x] 요청된 10개 위원회 코드 매핑
- [x] 회의 제목에서 차수 추출
- [x] 회의일시에서 연도 추출
- [x] 로그인 화면에서 사람이 읽는 코드 표시
- [x] 기존 인증용 공개 코드가 API 호출에 계속 사용됨
- [x] lint, 위원회 시험, build 통과

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 규칙적인 코드를 인증키로 오용 | 표시 전용으로만 사용하고 API에는 기존 공개 코드 전달 |
| 제목에 차수 누락 | `XX`로 표시해 관리자 수정 유도 |
| `차년도` 오인식 | `차년도`는 정규식에서 제외 |
