# committee-external-login-redesign - Plan Document

> Version: 1.0.0 | Date: 2026-07-23 | Status: Approved
> Level: Dynamic

---

## 1. Overview

### 1.1 Purpose

외부위원 심의 로그인 화면을 사용자가 제공한 UC 산학협력단 레퍼런스처럼 좌측 안내 패널과 우측 로그인 패널로 개편한다. 기존 회의 조회, 위원 인증, 보안 PIN, 세션 복원과 오류 처리는 변경하지 않는다.

### 1.2 Background

현재 화면은 중앙의 단일 다크 카드이며 기능은 안정화되어 있다. 레퍼런스는 기관 브랜딩, 심의 절차 안내, 입력 정보의 위계와 신뢰 표시가 명확한 2열 라이트 로그인 화면이다.

## 2. Goals

### 2.1 Primary Goals

- [ ] 데스크톱에서 좌측 네이비 안내 패널과 우측 흰색 로그인 패널을 구현한다.
- [ ] UC 브랜드, 심의 절차 문구, PDF 보안 열람과 심의 증적 안내를 표시한다.
- [ ] 위원회 코드, 위원 코드, 개인 보안코드의 3개 필드 구성을 표현한다.
- [ ] 기존 인증 API와 URL 접근 코드 전달을 그대로 유지한다.
- [ ] 모바일에서는 로그인 입력을 우선하는 반응형 화면을 제공한다.

### 2.2 Non-Goals

- 외부위원 인증 방식, PIN 규칙, 잠금 정책 변경
- Supabase schema, Edge Function, RLS 변경
- 로그인 이후 심의·의결·서명 화면 변경

## 3. Scope

### 3.1 In Scope

- `CommitteeExternalVote.tsx`의 미인증 화면 JSX와 시각 스타일
- 레퍼런스에 맞춘 Lucide 아이콘과 반응형 CSS
- 현재 URL의 회의 접근 코드를 readonly 입력으로 표시

### 3.2 Out of Scope

- 회의 조회·인증·세션 저장 handler
- 위원회 결과보고서와 PDF 출력
- 관리자용 위원회 관리 화면

## 4. Success Criteria

- [ ] 기존 `authenticateCommitteeVoter(accessCode, name, pin)` 호출이 동일하다.
- [ ] 위원 코드와 PIN의 state 및 submit 흐름이 동일하다.
- [ ] 접근 코드는 URL/prop에서 가져오며 사용자가 변경할 수 없다.
- [ ] 데스크톱 화면이 제공된 첫 번째 레퍼런스의 구성·색상·위계를 재현한다.
- [ ] 900px 이하에서 좌측 패널이 축소 또는 숨김 처리되어 입력이 잘리지 않는다.
- [ ] TypeScript, oxlint, production build, 위원회 시험이 통과한다.

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| UI 수정이 인증 handler를 변경 | High | handler와 state를 수정하지 않고 미인증 render만 교체 |
| 작은 화면에서 2열 레이아웃 잘림 | Medium | 전용 class와 media query 적용 |
| 전역 테마가 흰색 패널 텍스트를 덮음 | Medium | 로그인 화면 scope 안에서 명시 색상 적용 |
| 실제 접근 코드 노출 | Low | 이미 URL로 전달되는 공개 회의 접근 코드만 readonly 표시 |

## 6. References

- 사용자 제공 이미지 1: 목표 디자인
- 사용자 제공 이미지 2: 현재 외부위원 로그인 화면
- `src/components/CommitteeExternalVote.tsx`
- `docs/02-design/features/committee-vote-stabilization.design.md`
