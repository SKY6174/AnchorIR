# committee-external-login-redesign - Design Document

> Version: 1.1.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic | Plan: `docs/01-plan/features/committee-external-login-redesign.plan.md`

---

## 1. Overview

### 1.1 Purpose

외부위원 미인증 화면과 인증 후 자료 열람·표결 화면을 하나의 UC 보안위원회 디자인 언어로 통합한다. 인증, 자료 조회, 표결, 서명 서비스 호출은 현재 구현을 그대로 사용한다.

### 1.2 Design Goals

- 좌측 52.5% 네이비 브랜드 패널, 우측 47.5% 흰색 인증 패널
- 레퍼런스의 여백, 정보 위계, 파란색 CTA와 밝은 입력 배경 재현
- 실제 DOM 입력은 기존 `loginForm.name`, `loginForm.pin`에 연결
- URL/prop 접근 코드는 readonly 필드에 표시
- 모바일에서 입력 가독성과 터치 영역 보장

## 2. Architecture

### 2.1 Component Boundary

`CommitteeExternalVote`의 인증 전후 표현 계층만 변경한다.

```text
loading/error render       unchanged
unauthorized render        existing login design
authorized workspace       linked light/blue design
handlers and API calls     unchanged
```

별도 인증 체계나 상태를 추가하지 않는다. 스타일은 `CommitteeExternalVote.tsx`에 전용 class를 부여하고 `dashboard.css`의 해당 scope에서 정의한다.

### 2.4 Authenticated workspace extension

- 전체 배경은 로그인 우측 패널과 동일한 `#f4f7fb` 계열로 전환한다.
- 상단에는 로그인 좌측 패널의 네이비 그라데이션과 UC 브랜드 마크를 재사용한다.
- 문자형 `UC` 배지는 울산과학대학교 심벌 로고로 교체하고, 브랜드 문구는 `울산과학대학교 앵커사업단` / `{위원회명}`의 두 줄로 표시한다.
- 회의명, 일시, 접속 위원, 로그아웃을 하나의 보안 세션 헤더로 구성한다.
- 접속 위원은 `성명 위원회직책(소속, 직위)` 형식으로 표시하고 역할 코드는 `위원장`, `위원`, `간사`로 변환한다. 소속은 `org`, 값이 없으면 `dept`를 사용한다.
- 자료·표결·서명은 흰색 카드, 옅은 회색 테두리, 블루 포커스 링으로 통일한다.
- PDF iframe, 안건 선택, 표결 값, 서명 canvas의 상태와 이벤트는 변경하지 않는다.
- 원본 첨부파일명과 보안 signed URL 처리도 변경하지 않는다.

Desktop workspace:

```text
┌─────────────────────────────────────────────────────────┐
│ UC / SECURE COMMITTEE     meeting / member / logout     │
├─────────────────────────────────────────────────────────┤
│ materials card: agenda information | secure PDF viewer  │
├─────────────────────────────────────────────────────────┤
│ agenda voting cards                                     │
├─────────────────────────────────────────────────────────┤
│ signature and submit                                    │
└─────────────────────────────────────────────────────────┘
```

- 980px 이하에서 자료 영역은 1열로 전환한다.
- 640px 이하에서 헤더와 액션 버튼을 세로 배치하고 카드 여백을 축소한다.
- PDF 뷰어는 모바일에서 최소 420px 높이를 유지한다.

### 2.2 Layout

Desktop:

```text
┌──────────────────────────────┬──────────────────────────┐
│ UC brand / secure committee  │ lock / member access     │
│ headline / description       │ access code readonly     │
│ two trust cards              │ member code / PIN        │
│ environment notice           │ submit / lock notice     │
└──────────────────────────────┴──────────────────────────┘
```

Mobile/tablet:

- 900px 이하에서는 1열로 전환한다.
- 640px 이하에서는 좌측 브랜드 패널을 간결한 헤더 형태로 축소한다.
- 입력과 CTA는 전체 너비를 유지한다.

### 2.3 Visual Tokens

| Token | Value |
|---|---|
| Hero start | `#082b52` |
| Hero end | `#12599e` |
| CTA start | `#1264c4` |
| CTA end | `#2684e8` |
| Primary text | `#14233a` |
| Secondary text | `#8a98aa` |
| Input background | `#f7f9fc` |
| Input focus | `#eaf2ff` / `#2f80ed` |

장식 원은 CSS pseudo-element로 생성하며 별도 이미지 asset은 사용하지 않는다.

## 3. Data and API Contract

### 3.1 Existing State

- `meeting`: 공개 회의 정보와 제목 표시
- `loginForm.name`: 위원 코드 입력
- `loginForm.pin`: 개인 보안코드 입력
- `meetingId` 또는 URL query: 위원회 접근 코드

### 3.2 Authentication

기존 호출을 변경하지 않는다.

```ts
authenticateCommitteeVoter(accessCode, loginForm.name, loginForm.pin)
getCommitteeVoteContext(authentication.token)
```

성공 후 token과 만료시각을 sessionStorage에 저장하는 기존 로직도 동일하게 유지한다.

## 4. Implementation Plan

1. Lucide 아이콘 import에 `ArrowRight`, `ShieldCheck`를 추가한다.
2. 미인증 render에서 현재 접근 코드를 계산한다.
3. 단일 glass card를 2열 scoped layout으로 교체한다.
4. `dashboard.css`에 desktop/mobile 전용 style을 추가한다.
5. 인증 후 워크스페이스에 로그인 토큰 기반 class scope를 적용한다.
6. TypeScript, lint, build, 위원회 시험을 실행한다.
7. 로컬 production preview를 데스크톱·모바일 기준 해상도로 확인한다.

## 5. Test Plan

- 접근 코드가 readonly로 표시되는지 확인
- 위원 코드/PIN state 변경과 form submit 확인
- 빈 입력 검증 문구 유지 확인
- 기존 위원 인증 service 호출 인자 변경 없음 확인
- 2048×1074, 1440×900, 390×844 viewport 레이아웃 확인
- TypeScript 0, lint 0, 위원회 시험 6/6, production build 성공

## 6. Security Considerations

- 접근 코드는 기존 공유 URL에 포함된 회의 식별자만 표시한다.
- PIN은 계속 `type="password"`로 유지한다.
- 인증 오류는 기존 일반화된 오류 mapper를 사용한다.
- token, PIN, 서명 데이터는 새 DOM 속성·로그·저장소에 추가하지 않는다.
