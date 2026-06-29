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

export default function AuthManager({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userName, setUserName] = useState("");
  const [userRoleKey, setUserRoleKey] = useState("RESEARCHER");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 로그인 핸들러 (Supabase 연동 및 승인 상태 체크)
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

      // Supabase rise_users 테이블에서 계정 조회
      const { data: foundUser, error } = await supabase
        .from("rise_users")
        .select("*")
        .eq("id", targetId)
        .single();

      if (error || !foundUser) {
        setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 비밀번호 해시값 비교
      if (foundUser.pw !== targetHashedPw) {
        setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 관리자 승인 여부(approved) 체크
      if (!foundUser.approved) {
        setErrorMsg("아직 가입 승인을 받지 않은 계정입니다. 사업단 관리자의 승인을 기다려 주세요.");
        return;
      }

      // 로그인 성공 처리 (role 매핑 복원)
      const mappedRole = userRoles[foundUser.role_key] || userRoles.RESEARCHER;
      const sessionUser = {
        id: foundUser.id,
        name: foundUser.name,
        role: mappedRole
      };

      onLoginSuccess(sessionUser);
    } catch (err) {
      console.error("Login process error:", err);
      setErrorMsg("로그인 처리 중 서버 통신 에러가 발생했습니다.");
    }
  };

  // 회원가입 핸들러 (Supabase 연동)
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!userId || !userPw || !userName) {
      setErrorMsg("모든 필드를 입력해 주세요.");
      return;
    }

    try {
      const targetId = userId.trim().toLowerCase();

      // 1. 중복 계정 유무 체크
      const { data: existingUser, error: checkError } = await supabase
        .from("rise_users")
        .select("id")
        .eq("id", targetId)
        .maybeSingle();

      if (existingUser) {
        setErrorMsg("이미 존재하는 아이디입니다.");
        return;
      }

      // 2. 신규 사용자 등록 (approved = false 상태로 기입)
      const selectedRole = userRoles[userRoleKey];
      const displayName = `${userName} ${selectedRole.name.split(" ")[1] || "연구원"}`;
      const hashedPw = hashPassword(userPw);

      const { error: insertError } = await supabase
        .from("rise_users")
        .insert([
          {
            id: targetId,
            pw: hashedPw,
            name: displayName,
            role_key: userRoleKey,
            approved: false // 기본값은 승인 대기
          }
        ]);

      if (insertError) {
        console.error("Signup insert error:", insertError);
        setErrorMsg("회원가입 처리 중 오류가 발생했습니다.");
        return;
      }

      setSuccessMsg("회원가입 신청이 정상 접수되었습니다! 관리자 승인 후 로그인해 주세요.");
      setIsSignup(false);
      setUserId("");
      setUserPw("");
      setUserName("");
    } catch (err) {
      console.error("Signup process error:", err);
      setErrorMsg("회원가입 통신 중 예기치 못한 에러가 발생했습니다.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Award size={48} style={{ color: "var(--accent-color)", marginBottom: "0.75rem", animation: "float 3s ease-in-out infinite" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.04em" }}>UC ANCHOR Portal</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", marginTop: "0.25rem" }}>
            {isSignup ? "앵커사업 통합 대시보드 회원가입" : "앵커사업 통합 대시보드 로그인"}
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

        {isSignup ? (
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary-dark)" }} />
              <input
                type="text"
                placeholder="아이디"
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

            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary-dark)" }} />
              <input
                type="text"
                placeholder="이름 (예: 홍길동)"
                className="user-selector"
                style={{ paddingLeft: "2.5rem" }}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.3rem" }}>
                역할(권한) 선택
              </span>
              <select
                className="user-selector"
                value={userRoleKey}
                onChange={(e) => setUserRoleKey(e.target.value)}
              >
                <option value="DIRECTOR">단장 (송경영 교수 권한)</option>
                <option value="HQ_HEAD">총괄본부장 (김현수 교수 권한)</option>
                <option value="CENTER_ECC">ECC센터장 (이동은 교수 권한)</option>
                <option value="CENTER_SPECIAL">신산업특화센터장 (홍진숙 교수 권한)</option>
                <option value="TEAM_LEADER">운영팀장 (심현미 부장 권한)</option>
                <option value="RESEARCHER">실무 연구원 권한</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
              <UserPlus size={18} />
              <span>회원가입</span>
            </button>

            <span
              onClick={() => { setIsSignup(false); setErrorMsg(""); }}
              style={{ fontSize: "0.8rem", color: "var(--accent-color)", cursor: "pointer", textAlign: "center", display: "block", marginTop: "0.5rem" }}
            >
              이미 계정이 있으신가요? 로그인하기
            </span>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary-dark)" }} />
              <input
                type="text"
                placeholder="아이디"
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

            <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
              <LogIn size={18} />
              <span>로그인</span>
            </button>

            <span
              onClick={() => { setIsSignup(true); setErrorMsg(""); }}
              style={{ fontSize: "0.8rem", color: "var(--accent-color)", cursor: "pointer", textAlign: "center", display: "block", marginTop: "0.5rem" }}
            >
              새로운 계정이 필요하신가요? 회원가입하기
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
