import React, { useState } from "react";
import { userRoles } from "../data/mockData";
import { Lock, User, UserPlus, LogIn, Award } from "lucide-react";
import { supabase } from "../supabaseClient";
import CryptoJS from "crypto-js";

// 비밀번호 SHA-256 해시 암호화 헬퍼 함수 (단방향)
const hashPassword = (password) => {
  if (!password) return "";
  return CryptoJS.SHA256(password).toString();
};

export default function AuthManager({ onLoginSuccess, members = [] }) {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 로그인 핸들러 (자동 회원가입 및 이중 검증 연동)
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!userId || !userPw) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      const targetId = userId.trim().toLowerCase();
      const targetHashedPw = hashPassword(userPw);

      // 테스트 목적 예외 계정 비밀번호 및 우회 처리
      const isTestAccount = ["director", "team_leader", "researcher", "admin"].includes(targetId);
      const expectedTestPw = targetId === "admin" ? "uc_anchor" : "1234";

      // 1. Supabase rise_users 테이블에서 계정 조회 시도
      let foundUser = null;
      try {
        const { data, error } = await supabase
          .from("rise_users")
          .select("*")
          .eq("id", targetId)
          .single();
        if (!error && data) {
          foundUser = data;
        }
      } catch (dbErr) {
        console.warn("DB query warning for login user:", dbErr);
      }

      // 2. 테스트 계정 우회 로그인 처리
      if (isTestAccount && userPw === expectedTestPw) {
        let sessionUser = null;
        if (foundUser) {
          const mappedRole = userRoles[foundUser.role_key] || userRoles.RESEARCHER;
          sessionUser = {
            id: foundUser.id,
            name: foundUser.name,
            role: mappedRole
          };
        } else {
          // 가상 유저 객체 생성
          let roleKey = "RESEARCHER";
          let name = "테스트 연구원";
          if (targetId === "director") { roleKey = "DIRECTOR"; name = "송경영 단장(테스트)"; }
          if (targetId === "team_leader") { roleKey = "TEAM_LEADER"; name = "심현미 팀장(테스트)"; }
          if (targetId === "admin") { roleKey = "DIRECTOR"; name = "시스템 관리자"; }
          
          sessionUser = {
            id: targetId,
            name: name,
            role: userRoles[roleKey]
          };
        }
        onLoginSuccess(sessionUser);
        return;
      }

      // 3. 주소록(members)에서 해당 이메일 또는 ID 기준 구성원 탐색
      const matchedMember = members.find((m) => {
        const mEmail = (m.email || "").trim().toLowerCase();
        return mEmail === targetId || mEmail.split("@")[0] === targetId;
      });

      if (!matchedMember) {
        setErrorMsg("등록되지 않은 이메일(아이디)입니다. 관리자에게 구성원 등록을 먼저 요청해 주세요.");
        return;
      }

      // 4. 퇴직 상태 차단 검증
      if (matchedMember.status === "퇴직") {
        setErrorMsg("퇴직 처리된 구성원은 로그인이 불가능합니다.");
        return;
      }

      // 5. 역할 권한 자동 판별 매핑 규칙
      let autoRoleKey = "RESEARCHER";
      const mRole = matchedMember.role || "";
      const mDept = matchedMember.dept || "";
      if (mRole === "사업단장") {
        autoRoleKey = "DIRECTOR";
      } else if (mRole === "본부장") {
        autoRoleKey = "HQ_HEAD";
      } else if (mRole === "운영팀장") {
        autoRoleKey = "TEAM_LEADER";
      } else if (mRole === "센터장") {
        autoRoleKey = mDept === "ECC센터" ? "CENTER_ECC" : "CENTER_SPECIAL";
      }

      const mappedRole = userRoles[autoRoleKey] || userRoles.RESEARCHER;

      // 6. 이중 비밀번호 대조
      // 1차: DB(rise_users)에 저장된 사용자 임의 변경 비밀번호 확인
      if (foundUser) {
        if (foundUser.pw === targetHashedPw) {
          const sessionUser = {
            id: foundUser.id,
            name: foundUser.name,
            role: mappedRole
          };
          onLoginSuccess(sessionUser);
          return;
        }
      }

      // 2차: DB에 없거나 일치하지 않을 때 주소록 휴대전화 뒷자리 4자리와 대조
      const cleanPhone = (matchedMember.phoneMobile || "").replace(/[^0-9]/g, "");
      if (cleanPhone.length >= 4) {
        const rawPw = cleanPhone.slice(-4);
        if (userPw === rawPw) {
          const sessionUser = {
            id: matchedMember.email || targetId,
            name: `${matchedMember.name} ${mappedRole.name.split(" ")[1] || "연구원"}`,
            role: mappedRole
          };
          onLoginSuccess(sessionUser);
          return;
        }
      }

      setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
    } catch (err) {
      console.error("Login process error:", err);
      setErrorMsg("로그인 처리 중 서버 통신 에러가 발생했습니다.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Award size={48} style={{ color: "var(--accent-color)", marginBottom: "0.75rem", animation: "float 3s ease-in-out infinite" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.04em" }}>UC ANCHOR Portal</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>
            앵커사업 통합 대시보드 로그인
          </p>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger-color)", borderRadius: "0.5rem", color: "#f87171", fontSize: "0.8rem", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "rgba(16,185,129,0.1)", border: "1px solid var(--success-color)", borderRadius: "0.5rem", color: "#34d399", fontSize: "0.8rem", textAlign: "center" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ position: "relative" }}>
            <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary-dark)" }} />
            <input
              type="text"
              placeholder="이메일 (또는 아이디)"
              className="user-selector"
              style={{ paddingLeft: "2.5rem" }}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary-dark)" }} />
            <input
              type="password"
              placeholder="비밀번호"
              className="user-selector"
              style={{ paddingLeft: "2.5rem" }}
              value={userPw}
              onChange={(e) => setUserPw(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", lineHeight: "1.4", padding: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-color-dark)", borderRadius: "0.25rem" }}>
            <p>※ 별도의 회원가입 없이 주소록에 등록된 이메일로 로그인하세요.</p>
            <p>※ 초기 비밀번호는 본인의 휴대전화 뒷번호 4자리입니다.</p>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
            <LogIn size={18} />
            <span>로그인</span>
          </button>
        </form>
      </div>
    </div>
  );
}
