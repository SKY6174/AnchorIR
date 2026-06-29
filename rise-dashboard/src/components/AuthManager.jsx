import React, { useState, useEffect } from "react";
import { userRoles } from "../data/mockData";
import { Lock, User, UserPlus, LogIn, Award } from "lucide-react";

export default function AuthManager({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userName, setUserName] = useState("");
  const [userRoleKey, setUserRoleKey] = useState("RESEARCHER");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 실명 조직 거버넌스 기반 기본 계정 자동 등록
  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem("rise_users") || "[]");
    const hasDirector = existingUsers.some((u) => u.id === "director");
    
    if (!hasDirector) {
      const defaultUsers = [
        { id: "director", pw: "1234", name: "송경영 사업단장", role: userRoles.DIRECTOR },
        { id: "hq_head", pw: "1234", name: "김현수 총괄본부장", role: userRoles.HQ_HEAD },
        { id: "ecc_head", pw: "1234", name: "이동은 ECC센터장", role: userRoles.CENTER_ECC },
        { id: "special_head", pw: "1234", name: "홍진숙 신산업특화센터장", role: userRoles.CENTER_SPECIAL },
        { id: "manager", pw: "1234", name: "심현미 운영팀장", role: userRoles.TEAM_LEADER },
        { id: "researcher", pw: "1234", name: "이은주 선임연구원", role: userRoles.RESEARCHER }
      ];
      localStorage.setItem("rise_users", JSON.stringify([...existingUsers, ...defaultUsers]));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!userId || !userPw) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("rise_users") || "[]");
    const foundUser = users.find((u) => u.id === userId.trim().toLowerCase() && u.pw === userPw);

    if (!foundUser) {
      setErrorMsg("아이디 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    onLoginSuccess(foundUser);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!userId || !userPw || !userName) {
      setErrorMsg("모든 필드를 입력해 주세요.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("rise_users") || "[]");
    const isDup = users.some((u) => u.id === userId.trim().toLowerCase());

    if (isDup) {
      setErrorMsg("이미 존재하는 아이디입니다.");
      return;
    }

    const selectedRole = userRoles[userRoleKey];
    const newUser = {
      id: userId.trim().toLowerCase(),
      pw: userPw,
      name: `${userName} ${selectedRole.name.split(" ")[1] || "연구원"}`,
      role: selectedRole
    };

    localStorage.setItem("rise_users", JSON.stringify([...users, newUser]));
    setSuccessMsg("회원가입이 완료되었습니다! 로그인해 주세요.");
    setIsSignup(false);
    setUserId("");
    setUserPw("");
    setUserName("");
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
                placeholder="아이디 (테스트: director / hq_head / researcher)"
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
                placeholder="비밀번호 (테스트: 1234)"
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
