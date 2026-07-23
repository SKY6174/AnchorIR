# committee-vote-short-link - Plan Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic

## 1. Overview

### 1.1 Purpose

외부위원 회의 접근 주소를 Google Forms와 유사한 짧은 경로형 URL로 표시하고 복사한다.

### 1.2 Background

현재 `/?v={public_code}` 형식은 안전하지만 길고 읽기 어렵다. 만족도 조사에서 사용하는 `/sv/`와 충돌하지 않는 `/v/` 경로를 제공한다.

## 2. Goals

- [x] 신규 링크를 `https://uc-anchor.vercel.app/v/{shortCode}` 형식으로 제공
- [x] 공개 코드의 엔트로피를 줄이지 않고 URL-safe 형식으로 압축
- [x] 기존 `?v=` 링크를 계속 지원
- [x] 링크 표시, 단축링크 복사, 안내문 복사에 동일 URL 사용

## 3. Scope

### 3.1 In Scope

- 공개 hex 코드를 Base64 URL-safe 코드로 가역 변환
- `/v/:code` 접속 라우팅 및 원본 코드 복원
- Vercel SPA rewrite 명시
- 단위 시험과 기존 위원회 시험

### 3.2 Out of Scope

- 외부 URL 단축 서비스 연동
- DB 컬럼 및 Edge Function 계약 변경
- 기존 링크 폐기

## 4. Success Criteria

- [x] 32/36자리 공개 코드가 더 짧은 URL-safe 코드로 표현됨
- [x] 신규 경로와 기존 query 링크가 동일한 회의를 조회함
- [x] 잘못된 단축 코드를 안전하게 거부함
- [x] lint, build, 위원회 시험 통과

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 짧은 코드 충돌 | 코드 일부를 자르지 않고 전체 바이트를 가역 인코딩 |
| 만족도 조사 경로 충돌 | `/sv/`가 아닌 `/v/` 사용 |
| 기존 공유 링크 무효화 | `?v=` 파서를 유지 |
| 임의 문자열 디코딩 | hex/Base64 URL 형식과 길이를 검증 |
