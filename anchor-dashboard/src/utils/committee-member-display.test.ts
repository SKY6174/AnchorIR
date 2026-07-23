import assert from "node:assert/strict";
import test from "node:test";
import { formatCommitteeMemberDisplay } from "./committee-member-display.js";

test("위원장 이름을 위원회 직책과 직위 순서로 표시한다", () => {
  assert.equal(
    formatCommitteeMemberDisplay({
      name: "변홍석",
      role_code: "CHAIRMAN",
      org: "울산과학대학교",
      rank: "교무처장"
    }),
    "변홍석 위원장(울산과학대학교, 교무처장)"
  );
});

test("일반 위원과 간사의 위원회 직책을 표시한다", () => {
  assert.equal(
    formatCommitteeMemberDisplay({
      name: "홍길동",
      role_code: "MEMBER",
      org: "울산과학대학교",
      rank: "교수"
    }),
    "홍길동 위원(울산과학대학교, 교수)"
  );
  assert.equal(
    formatCommitteeMemberDisplay({
      name: "김간사",
      role_code: "SECRETARY",
      dept: "앵커사업단운영팀",
      rank: "연구원"
    }),
    "김간사 간사(앵커사업단운영팀, 연구원)"
  );
});

test("구형 type과 직위 누락도 안전하게 처리한다", () => {
  assert.equal(
    formatCommitteeMemberDisplay({ name: "이위원장", type: "위원장", org: "-", dept: "기획처" }),
    "이위원장 위원장(기획처)"
  );
  assert.equal(
    formatCommitteeMemberDisplay({ name: "박위원" }),
    "박위원 위원"
  );
  assert.equal(formatCommitteeMemberDisplay(null), "");
});
