# committee-vote-short-link - Design Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/committee-vote-short-link.plan.md`

## 1. Overview

`committee_meetings.public_code` 전체를 URL-safe Base64로 가역 변환하여 `/v/:shortCode` 경로로 제공한다. DB와 Edge Function에는 복원된 원본 코드를 전달한다.

## 2. Architecture

```text
public_code (hex)
  -> encodeCommitteeAccessCode
  -> /v/{base64url}
  -> parseCommitteeVotePath
  -> public_code (hex)
  -> existing committee-vote API
```

- `CommitteeManager`: 짧은 URL 생성·표시·복사
- `App`: `/v/` 경로를 위원회 외부투표 모드로 분기
- `CommitteeExternalVote`: 기존 `meetingId` prop과 인증 흐름 유지
- `vercel.json`: `/v/:code`를 SPA index로 rewrite

## 3. Encoding Contract

- 입력: 짝수 길이의 16바이트 이상 lowercase/uppercase hex 문자열
- 출력: padding 없는 Base64 URL-safe 문자열 (`A-Z`, `a-z`, `0-9`, `-`, `_`)
- 복원: Base64 URL-safe 문자열을 원본 lowercase hex로 변환
- 비정상 입력은 빈 값으로 반환하여 회의 접근을 차단
- 코드 일부를 자르거나 hash를 재생성하지 않는다.

## 4. Compatibility

- 신규: `/v/{shortCode}`
- 기존: `/?v={public_code}`
- 관리자가 이미 배포한 기존 링크는 계속 동작한다.
- 만족도 조사 `/sv/{surveyId}` 라우팅은 변경하지 않는다.

## 5. Implementation Plan

1. `committee-short-link.ts`에 encode/decode/path parser 구현
2. `CommitteeManager`의 표시·복사 링크를 `/v/`로 변경
3. `App`에 `/v/` 경로 인터셉터 추가
4. Vercel rewrite 추가
5. 단위 시험을 committee test suite에 포함

## 6. Test Plan

- 32자리 및 36자리 hex round trip
- 출력에 `+`, `/`, `=`가 포함되지 않는지 확인
- 잘못된 path·Base64 입력 거부
- 기존 query 링크 parser 유지
- lint, 위원회 시험, production build

## 7. Security Considerations

- 인코딩은 난독화가 아니라 URL 표현 변환이며 접근 권한을 대체하지 않는다.
- PIN과 위원 인증은 기존대로 필수다.
- 전체 공개 코드의 엔트로피를 보존한다.
- 브라우저 로그나 새 저장소에 PIN·세션 토큰을 추가하지 않는다.
