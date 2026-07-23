# committee-vote-stabilization Completion Report

> **Status**: Complete with follow-up verification backlog
>
> **Project**: AnchorIR / 앵커사업 통합 IR 대시보드
> **Author**: Codex collaboration
> **Completion Date**: 2026-07-23

---

## 1. Summary

| Item | Content |
|---|---|
| Feature | 외부위원 심의·의결 및 디지털 봉인 PDF 안정화 |
| Start Date | 2026-07-23 |
| End Date | 2026-07-23 |
| PDCA Iterations | 9 |
| Design Match Rate | 97% |
| UI/UX Change | 없음 - JSX 구조, className, 인라인 스타일, 화면 레이아웃 보존 |

Supabase Auth와 `rise_users.uuid = auth.uid()`를 연결하고, 외부위원 인증·회의 명부·응답·안건별 표결·정족수·첨부자료·서명·PDF 봉인을 정규화된 서버 경계로 통합했다. 공개 직접 쓰기, 고정 PIN 우회, 임시위원, localStorage 공식 기록, 미응답 자동 찬성 및 클라이언트 정족수 판정을 제거했다.

운영 중 확인된 ECC 결과보고서 PDF 오류는 과거 확정 보고서와 신규 정규화 테이블 사이의 누락 데이터 때문에 `get_committee_meeting_result()`가 `null`을 반환하면서 발생했다. 운영 마이그레이션 098로 확정 기록의 재적 3명·참석 2명·전 안건 찬성 2표를 명부 4명(간사 제외 계산), 응답 2건, 안건별 표 6건으로 재구성하고 감사기록을 남겼다. 존재하지 않는 전자서명은 생성하지 않았다.

### Final Result

```text
Design Match Rate: 97%
Core Unit Tests:   6 / 6 passed
Concurrent Test:   10 voters + 1 duplicate request passed
Production Build:  passed
Official Result:   total 3 / attended 2 / APPROVED
PDF Snapshot:      version 4 / SHA-256 64 chars / A4 2-page Poppler pass
Critical Security Issues: 0 open in completed scope
```

## 2. Related Documents

| Phase | Document | Status |
|---|---|---|
| Plan | [committee-vote-stabilization.plan.md](../01-plan/features/committee-vote-stabilization.plan.md) | Finalized |
| Design | [committee-vote-stabilization.design.md](../02-design/features/committee-vote-stabilization.design.md) | Finalized |
| Analysis | [committee-vote-stabilization.analysis.md](../03-analysis/committee-vote-stabilization.analysis.md) | 97% |
| Runbook | [committee-vote-migration-runbook.md](../04-implementation/committee-vote-migration-runbook.md) | Operational |

## 3. Completed Items

### 3.1 Authentication and Authorization

- Supabase Auth를 로그인 신원의 단일 기준으로 적용했다.
- 승인된 `rise_users` 역할과 Auth UUID를 서버에서 함께 검증한다.
- 외부위원은 opaque public code, 이름, 해시 PIN, 제한시간 세션으로 인증한다.
- 일반 `RESEARCHER`의 위원회 관리·보고서 확정을 차단하고 본인 표결만 별도 경로로 허용한다.
- 핵심 테이블의 공개 RLS write와 클라이언트 직접 write를 제거했다.

### 3.2 Vote Integrity

- 회의별 roster snapshot과 간사 제외 정족수 DB 함수를 적용했다.
- 응답·안건별 표결·revision·idempotency·감사 로그를 단일 트랜잭션으로 저장한다.
- 일반 안건과 평가 안건의 입력 형식을 분리하고 미선택·중복·잘못된 값을 거부한다.
- 10명 동시 제출, 중복 replay, 수정 revision, 충돌 및 오류 rollback을 운영 격리 fixture에서 확인했다.
- 시험 데이터와 서명 객체를 정리하고 잔존 데이터가 없음을 확인했다.

### 3.3 Attachments, Signatures, and PDF

- 회의 자료와 서명을 private Storage 및 단기 signed URL 경계로 이동했다.
- PDF 입력을 `committee_report_snapshots.payload` 한 건으로 고정했다.
- SHA-256 및 서버 HMAC 봉인 코드와 공개 검증 API를 적용했다.
- 다운로드 앵커와 Blob URL을 30초 유지해 브라우저 다운로드 경합을 제거했다.
- 공식 결과가 없을 때 잘못된 `null` 스냅샷을 저장하지 않고 `409 CONFLICT`로 중단하는 서버 가드를 배포했다.
- 운영 ECC 보고서에서 정상 스냅샷 version 4와 PDF 파일 생성을 확인하고 Poppler로 A4 2쪽을 검증했다.

### 3.4 Production Migrations

| Migration | Result |
|---|---|
| 091-097 | 인증, 보안 스키마, 데이터 이관, RLS, RPC, Storage, Auth 연동, 관리자 경계 적용 |
| 098 | 기존 ECC 확정 결과를 정규화 데이터와 대조·복구하고 감사기록 저장 |
| 099 | malformed 스냅샷 감사 보존·무효화, DB 저장 함수와 공개 검증 API 이중 거부 |

098은 대상 회의, 확정 상태, 공식 회의록의 참석 집계, 기록 위원, 단일 위원장 및 안건 3건을 모두 확인한다. 하나라도 불일치하면 예외로 전체 롤백한다.

## 4. Quality Metrics

| Metric | Target | Final | Status |
|---|---:|---:|---|
| Design Match Rate | 90% 이상 | 97% | Pass |
| Committee Unit Tests | 전체 통과 | 6/6 | Pass |
| Production Build | 성공 | 성공 | Pass |
| Concurrent Submission Loss | 0건 | 0건 | Pass |
| Invalid/Partial Commit | 0건 | 0건 | Pass |
| Official DB/UI/PDF Snapshot Result | 일치 | `APPROVED`, 3/2, 안건 3건·표 6건 | Pass |
| PDF Snapshot Integrity | SHA-256 64자리 | 64자리 | Pass |
| Latest PDF Visual | A4 2쪽, 결함 0건 | 2쪽, 결함 0건 | Pass |
| UI DOM/CSS Intentional Changes | 0건 | 0건 | Pass |

## 5. Operational Evidence

- 정상 스냅샷 ID: `0b77a81c-a0ef-4f66-87c8-0bd26da4e1d5`
- 스냅샷 version: `4`
- 공식 결과: 재적 3명, 참석 2명, 필요 참석 2명, 필요 찬성 2명, `APPROVED`
- 데이터 건수: roster 4, responses 2, agendas 3, agenda votes 6
- 복구 감사코드: `LEGACY_PUBLISHED_RESULT_RECONCILED`
- Edge Function: `committee-vote` 운영 재배포 완료
- 완료 커밋: `d88263c`부터 `26036e1`까지 `main` 반영

실패 과정에서 생성된 result `null` 스냅샷 version 1-2는 삭제하지 않고 감사 흔적으로 보존하되 migration 099로 무효화했다. 공개 검증 API는 version 1을 `valid: false`, 정상 version 4를 `valid: true`로 반환한다. 최신 PDF는 2026-07-23 11:11 KST에 생성됐으며 Poppler에서 A4 2쪽, 한글·표·서명·봉인 영역 결함 0건을 확인했다.

## 6. Lessons Learned

### Keep

- 공식 판정은 DB 함수 한 곳에서 계산하고 UI와 PDF가 동일 스냅샷을 사용한다.
- 운영 데이터 수정은 강한 사전조건과 사후 검증을 포함한 forward-only migration으로 수행한다.
- UI 보존 요구가 있는 기능은 이벤트·데이터 경계만 교체하고 JSX와 스타일을 수정하지 않는다.

### Problem

- 보안 마이그레이션 이전에 생성된 확정 보고서는 집계 결과와 정규화 원장이 다를 수 있다.
- 스냅샷 함수가 공식 결과 `null`을 유효 payload로 저장해 클라이언트에서 늦게 실패했다.
- Edge Function 배포 시 플랫폼 JWT 검사를 기본값으로 두면 공개 경로가 함수에 도달하기 전에 차단된다. 내부 경로별 인증 설계를 유지하도록 `--no-verify-jwt` 배포 옵션을 runbook에 고정했다.

### Try

- 보고서 확정 전에 roster, 응답 수, 안건별 입력 완전성, 공식 결과 존재 여부를 서버에서 선검증한다.
- legacy 결과 이관 시 집계와 개인별 원장이 다르면 자동 확정보다 관리자 검토 큐를 우선한다.
- 생성 PDF를 서버 또는 private Storage에 선택적으로 보관해 시각 회귀와 장기 감사를 자동화한다.

## 7. Follow-up Backlog

다음 항목은 이번 운영 장애 해결과 보안 안정화의 완료 조건을 막지 않으며 별도 Check 또는 후속 기능으로 관리한다.

- 주요 화면의 수정 전후 픽셀 비교를 자동화한다.
- 운영 DB PITR 및 row count/hash 기준선을 정기 운영 절차로 확정한다.
- 실제 계정이 없는 일부 관리자 역할의 CRUD 통합시험을 보강한다.
- SQL 정족수와 TypeScript 표시 계산의 자동 parity test를 추가한다.
- verification URL 또는 검증 화면을 사용자 흐름에 연결한다.
- 전체 대시보드 TypeScript 오류와 lint 경고 정리는 별도 기능으로 시작한다.

## 8. Release History

| Commit | Summary |
|---|---|
| `d88263c` | 위원회 표결과 Supabase Auth 보안 경계 통합 |
| `c26ad80` | 위원회 명단 관리 경계 강화 |
| `22c3110` | 운영 검증 결과 기록 |
| `b10c802` | 역할 및 PDF 봉인 검증 |
| `2f08c79` | 동시 제출 검증 |
| `9f3715d` | 봉인 PDF 다운로드 안정화 |
| `e042e68` | PDF 다운로드 앵커 유지 보강 |
| `10b5b64` | 봉인 보고서 운영 검증 기록 |
| `26036e1` | 기존 확정 결과 정규화 및 PDF 오류 복구 |

## Version History

| Version | Date | Changes | Author |
|---|---|---|---|
| 1.0 | 2026-07-23 | Completion report created | Codex collaboration |
