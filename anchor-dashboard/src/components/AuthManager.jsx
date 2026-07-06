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

  // 로그인 핸들러 (Supabase Auth 연동 및 주소록 기반 자동 회원가입 설계)
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
      // 입력값이 이메일 형식이 아니면 @anchor.ac.kr 을 자동으로 붙임
      const targetEmail = targetId.includes("@") ? targetId : `${targetId}@anchor.ac.kr`;

      // 1. Supabase Auth 로그인 시도
      let authUser = null;
      let authSession = null;
      
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: userPw
      });

      if (!authErr && authData && authData.user) {
        authUser = authData.user;
        authSession = authData.session;
      } else {
        // 2. 만약 비밀번호 불일치 혹은 미가입 등으로 에러가 발생했을 때,
        // 기존의 주소록(members) 뒷자리 4자리 및 자동 회원가입(signUp) 연동 시도
        const matchedMember = members.find((m) => {
          const mEmail = (m.email || "").trim().toLowerCase();
          if (targetId === "special_head" && mEmail === "cshong@uc.ac.kr") return true;
          return mEmail === targetId || mEmail.split("@")[0] === targetId;
        });

        if (matchedMember && matchedMember.status !== "퇴직") {
          const cleanPhone = (matchedMember.phoneMobile || "").replace(/[^0-9]/g, "");
          const expectedPhonePw = cleanPhone.slice(-4) + "00";

          // 휴대폰 뒷자리가 일치하거나, 테스트용 계정이면서 비밀번호가 1234 혹은 uc_anchor(admin) 등일 때
          const isTestAccount = ["director", "team_leader", "researcher", "admin", "guest", "hq_head", "ecc_head", "special_head", "manager"].includes(targetId);
          const expectedTestPw = targetId === "admin" ? "uc_anchor" : targetId === "guest" ? "guest123" : "1234";

          if (userPw === expectedPhonePw || (isTestAccount && userPw === expectedTestPw)) {
            // 자동 회원가입 진행! (이미 6자리 이상이 보장됨)
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: targetEmail,
              password: userPw,
              options: {
                data: { name: matchedMember.name }
              }
            });

            if (!signUpErr) {
              // 가입 직후 즉시 로그인 시도
              const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({
                email: targetEmail,
                password: userPw
              });
              if (!retryErr && retryData) {
                authUser = retryData.user;
                authSession = retryData.session;
              }
            } else {
              console.error("Auto sign-up error:", signUpErr);
            }
          }
        }
      }

      if (!authUser) {
        setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 3. 로그인 성공 시, 기존 rise_users 및 주소록 데이터를 매핑하여 sessionUser 생성
      // DB의 rise_users 테이블에 해당 사용자가 존재하는지 확인하고, 없으면 삽입(동기화)해 줍니다.
      let dbUser = null;
      try {
        const { data, error } = await supabase
          .from("rise_users")
          .select("*")
          .or(`id.eq.${targetId},email.eq.${targetEmail}`)
          .maybeSingle();
        if (!error && data) {
          dbUser = data;
          // UUID 컬럼이 미연동 상태라면 업데이트해 줍니다.
          if (!dbUser.uuid) {
            await supabase
              .from("rise_users")
              .update({ uuid: authUser.id, email: targetEmail })
              .eq("id", dbUser.id);
          }
        }
      } catch (dbErr) {
        console.warn("DB query warning for rise_users sync:", dbErr);
      }

      // 주소록 매칭을 통해 세부 역할군 자동 판별
      const matchedMember = members.find((m) => {
        const mEmail = (m.email || "").trim().toLowerCase();
        if (targetId === "special_head" && mEmail === "cshong@uc.ac.kr") return true;
        return mEmail === targetId || mEmail.split("@")[0] === targetId;
      });

      let autoRoleKey = "RESEARCHER";
      let matchedName = authUser.user_metadata?.name || targetId;

      if (dbUser && dbUser.role_key) {
        autoRoleKey = dbUser.role_key;
        matchedName = dbUser.name;
      } else if (matchedMember) {
        matchedName = matchedMember.name;
        const mRole = matchedMember.role || "";
        const mDept = matchedMember.dept || "";
        if (targetId === "leegyu@uc.ac.kr" || targetId === "admin") {
          autoRoleKey = "ADMIN";
        } else if (mRole === "사업단장") {
          autoRoleKey = "DIRECTOR";
        } else if (mRole === "본부장") {
          autoRoleKey = "HQ_HEAD";
        } else if (mRole === "운영팀장") {
          autoRoleKey = "TEAM_LEADER";
        } else if (mRole === "팀장교수" || mRole === "팀장") {
          autoRoleKey = "TEAM_LEADER";
        } else if (mRole === "센터장") {
          if (mDept === "ECC센터") autoRoleKey = "CENTER_ECC";
          else if (mDept === "ICC센터") autoRoleKey = "CENTER_ICC";
          else if (mDept === "RCC센터") autoRoleKey = "CENTER_RCC";
          else if (mDept === "울산늘봄누리센터") autoRoleKey = "CENTER_NURI";
          else autoRoleKey = "CENTER_SPECIAL";
        }

        // DB rise_users 테이블에 신규 가입 자동 동기화 처리! (이미 존재하지 않을 때만 신규 생성)
        if (!dbUser) {
          const hashedPw = hashPassword(userPw);
          try {
            await supabase
              .from("rise_users")
              .insert([{
                id: targetId,
                pw: hashedPw,
                name: matchedName,
                role_key: autoRoleKey,
                approved: true,
                uuid: authUser.id,
                email: targetEmail
              }]);
          } catch (insertErr) {
            console.warn("DB user sync insert warning:", insertErr);
          }
        }
      }

      // 게스트 특화 처리
      if (targetId === "guest") {
        autoRoleKey = "GUEST";
        matchedName = "게스트 (방문자)";
      }

      const mappedRole = userRoles[autoRoleKey] || userRoles.RESEARCHER;
      const sessionUser = {
        id: targetId,
        name: matchedName,
        role: mappedRole,
        password: userPw,
        uuid: authUser.id,
        email: targetEmail
      };

      setSuccessMsg(`${matchedName}님, 환영합니다!`);
      setTimeout(() => {
        onLoginSuccess(sessionUser);
      }, 600);
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
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
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
            <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
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
            <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="password"
              placeholder="비밀번호"
              className="user-selector"
              style={{ paddingLeft: "2.5rem" }}
              value={userPw}
              onChange={(e) => setUserPw(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4", padding: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-color-dark)", borderRadius: "0.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p style={{ margin: 0 }}>※ 별도의 회원가입 없이 주소록에 등록된 이메일로 로그인하세요.</p>
            <p style={{ margin: 0 }}>※ 초기 비밀번호는 본인의 휴대전화 뒷번호 4자리 뒤에 00을 붙인 6자리입니다. (예: 7123 이면 712300)</p>
            <p style={{ margin: 0, color: "#60A5FA", fontWeight: "700" }}>🔑 게스트 로그인 안내: ID: <span style={{ textDecoration: "underline" }}>guest</span> / PW: <span style={{ textDecoration: "underline" }}>guest123</span></p>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
            <LogIn size={18} />
            <span>로그인</span>
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.7rem",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              화면이 정상적으로 표시되지 않나요? (시스템 캐시 초기화 및 화면 복구)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
