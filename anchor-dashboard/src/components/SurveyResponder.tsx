import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Check, Send, AlertCircle, Compass } from "lucide-react";

export interface SurveyResponderProps {
  darkMode?: boolean;
  currentUser?: any;
  currentRole?: any;
}

export default function SurveyResponder({}: SurveyResponderProps = {}) {
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [survey, setSurvey] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 라디오 폼 입력 상태
  const [responderName, setResponderName] = useState<string>("");
  const [scores, setScores] = useState<number[]>([5, 5, 5, 5, 5]);
  const [comment, setComment] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // URL에서 만족도조사 ID (/sv/ID) 파싱 및 DB 정보 획득
  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split("/");
    const id = parts[parts.length - 1]; // 마지막 조각 추출 (예: 2025-ECC-2)

    if (!id || id === "sv" || id.trim() === "") {
      setErrorMsg("올바르지 않은 만족도 조사 링크입니다.");
      setIsLoading(false);
      return;
    }

    setSurveyId(id);
    fetchSurveyDetails(id);
  }, []);

  const fetchSurveyDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("satisfaction_surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        throw new Error("존재하지 않거나 만료된 만족도 조사입니다.");
      }

      if (data.status === "완료") {
        throw new Error("이 만족도 조사는 이미 기간이 마감되어 참여하실 수 없습니다.");
      }

      setSurvey(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "설문 정보를 읽어오는 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (qIdx: number, value: number) => {
    const updated = [...scores];
    updated[qIdx] = value;
    setScores(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("satisfaction_responses")
        .insert({
          survey_id: surveyId,
          responder_info: responderName.trim() || "익명 참가자",
          score_q1: scores[0],
          score_q2: scores[1],
          score_q3: scores[2],
          score_q4: scores[3],
          score_q5: scores[4],
          comments: comment.trim()
        });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      alert("설문 제출 중 오류가 발생했습니다: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#090d16", color: "white", gap: "1rem" }}>
        <div className="animate-spin" style={{ width: "30px", height: "30px", border: "3px solid var(--accent-color)", borderTopColor: "transparent", borderRadius: "50%" }} />
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>설문 조사지를 로딩 중입니다...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#090d16", color: "white", padding: "2rem", textAlign: "center", gap: "1rem" }}>
        <AlertCircle size={40} style={{ color: "#ef4444" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>설문 로드 불가</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", maxWidth: "320px" }}>{errorMsg}</p>
      </div>
    );
  }

  const mockQuestions = [
    "제공된 교육 프로그램의 전문성 및 실무 연계성에 만족하십니까?",
    "프로그램 진행자의 전문성과 원활한 일정 소통 방식에 만족하십니까?",
    "프로그램 수행 시설 및 인프라의 쾌적함과 장비 구성에 만족하십니까?",
    "전반적으로 본 프로그램에 참여한 효과성에 만족하십니까?",
    "향후 추진되는 연계 프로그램에 재참여할 의향이 있으십니까?"
  ];

  const ratingOptions = [
    { label: "매우만족 (100점)", score: 5 },
    { label: "만족 (80점)", score: 4 },
    { label: "보통 (60점)", score: 3 },
    { label: "미흡 (40점)", score: 2 },
    { label: "매우미흡 (20점)", score: 1 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", background: "#090d16", color: "white", padding: "1.5rem 1rem", fontFamily: "sans-serif" }}>
      
      {/* 모바일 최적화 헤더 */}
      <header style={{ width: "100%", maxWidth: "480px", textAlign: "center", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.4rem", color: "var(--accent-color)", marginBottom: "0.3rem" }}>
          <Compass size={20} className="animate-spin-slow" />
          <span style={{ fontSize: "0.75rem", fontWeight: "900", letterSpacing: "1px" }}>ULSAN COLLEGE ANCHOR</span>
        </div>
        <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: "white" }}>만족도 설문지 응답 제출</h2>
      </header>

      <main style={{ width: "100%", maxWidth: "480px" }}>
        {isSubmitted ? (
          <div className="glass-card" style={{ padding: "2.5rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", marginTop: "2rem" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
              <Check size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "white", marginBottom: "0.5rem" }}>설문 제출 완료!</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                작성해 주신 만족도 결과가 시스템에 소중하게 기록되었습니다.<br />
                보내주신 고견은 앵커 사업단의 내년도 사업 환류 계획에 유용하게 사용됩니다. 대단히 감사합니다.
              </p>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>울산과학대학교 앵커사업단 드림</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* 설문 메타 요약 */}
            <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--accent-color)", fontWeight: "900" }}>수행부서: {survey.department}센터</span>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "white", lineHeight: "1.3" }}>{survey.title}</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{survey.purpose}</p>
            </div>

            {/* 응답자명 작성 (익명 허용) */}
            <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "700" }}>응답자 소속/이름 (미입력 시 '익명 참가자'로 제출)</label>
              <input
                type="text"
                placeholder="예) 재학생 홍길동 / 기업 관계자"
                value={responderName}
                onChange={(e) => setResponderName(e.target.value)}
                className="user-selector"
                style={{ width: "100%", fontSize: "0.8rem", padding: "0.5rem" }}
              />
            </div>

            {/* 만족도 문항 5종 루프 */}
            {mockQuestions.map((q, qIdx) => (
              <div key={qIdx} className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: "900", minWidth: "40px" }}>질문 {qIdx + 1}.</span>
                  <p style={{ fontSize: "0.82rem", color: "white", fontWeight: "700", lineHeight: "1.4" }}>{q}</p>
                </div>

                {/* 5점 리커트 세로 라디오 레이아웃 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.2rem" }}>
                  {ratingOptions.map((opt) => {
                    const isChecked = scores[qIdx] === opt.score;
                    return (
                      <label 
                        key={opt.score} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "0.6rem", 
                          fontSize: "0.78rem", 
                          padding: "0.5rem 0.8rem", 
                          borderRadius: "0.35rem", 
                          background: isChecked ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.01)",
                          border: isChecked ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255,255,255,0.04)",
                          color: isChecked ? "white" : "var(--text-secondary)",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <input
                          type="radio"
                          name={`q_${qIdx}`}
                          value={opt.score}
                          checked={isChecked}
                          onChange={() => handleScoreChange(qIdx, opt.score)}
                          style={{ accentColor: "var(--accent-color)" }}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 서술형 피드백 의견 */}
            <div className="glass-card" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "700" }}>기타 건의사항 및 주관식 피드백 (선택사항)</label>
              <textarea
                placeholder="프로그램 참여 중 좋았던 점이나 건의하고 싶으신 의견을 자유롭게 적어주세요."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="user-selector"
                style={{ width: "100%", height: "80px", fontSize: "0.78rem", resize: "none", padding: "0.5rem" }}
              />
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.8rem",
                fontSize: "0.9rem",
                fontWeight: "800",
                borderRadius: "0.4rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 15px rgba(59,130,246,0.3)"
              }}
            >
              <Send size={16} />
              {submitting ? "제출 중..." : "의견 제출하기"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
