import React, { useState } from "react";
import { Lock, User, LogIn, Award } from "lucide-react";
import { supabase } from "../supabaseClient";
import {
  getApprovedRiseUserErrorMessage,
  resolveApprovedRiseUser
} from "../services/auth-service";

export interface AuthManagerProps {
  onLoginSuccess?: (userData: any) => void;
  members?: any[];
  darkMode?: boolean;
  currentUser?: any;
  currentRole?: any;
}

export default function AuthManager({ onLoginSuccess, members = [] }: AuthManagerProps) {
  const [userId, setUserId] = useState<string>("");
  const [userPw, setUserPw] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!userId || !userPw) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      const normalizedLoginId = userId.trim().toLowerCase();
      const safeMembers = Array.isArray(members)
        ? members
        : (members && Array.isArray((members as any).data) ? (members as any).data : []);
      const matchedMember = safeMembers.find((member: any) => {
        const email = String(member?.email || "").trim().toLowerCase();
        return email === normalizedLoginId || email.split("@")[0] === normalizedLoginId;
      });
      const email = matchedMember?.email
        ? String(matchedMember.email).trim().toLowerCase()
        : (normalizedLoginId.includes("@") ? normalizedLoginId : `${normalizedLoginId}@anchor.ac.kr`);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: userPw
      });

      if (authError || !authData.user || !authData.session) {
        setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      const sessionUser = await resolveApprovedRiseUser(authData.user, normalizedLoginId);

      let welcomeDisplayName = sessionUser.name;
      if (!welcomeDisplayName) {
        if (sessionUser.role_key === "G_DIRECTOR") welcomeDisplayName = "사업단장";
        else if (sessionUser.role_key === "ADMIN") welcomeDisplayName = "관리자";
        else if (sessionUser.role_key === "HQ_HEAD") welcomeDisplayName = "총괄본부장";
        else if (sessionUser.role_key === "MANAGER") welcomeDisplayName = "운영팀장";
        else welcomeDisplayName = "사용자";
      }

      setUserPw("");
      setSuccessMsg(`${welcomeDisplayName}님, 환영합니다!`);
      setTimeout(() => {
        onLoginSuccess?.(sessionUser);
      }, 600);
    } catch (err) {
      console.error("Login process error:", err);
      setErrorMsg(getApprovedRiseUserErrorMessage(err));
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
            <p style={{ margin: 0 }}>※ 초기 비밀번호는 본인의 휴대전화 뒷번호 4자리 뒤에 00을 붙인 6자리입니다. (예: 010-9876-5432 ➡️ 543200)</p>
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
                sessionStorage.clear();
                window.location.href = window.location.origin + window.location.pathname + "?cb=" + Date.now();
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
