import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Send, Sparkles, AlertCircle, Bookmark, RefreshCw, MessageSquare } from "lucide-react";
import { simulateRAGQuery, WIKI_CHUNKS } from "../data/mockWikiData";

export default function LLMWiki() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "안녕하세요! 울산과학대학교 라이즈(앵커) 사업단 AI RAG 위키 포털입니다. 사업 계획서와 1차년도 성과보고서의 축적된 지식을 바탕으로 원하시는 정보를 실시간으로 검색하여 답변해 드립니다. 무엇이든 질문해 보세요!\n\n💡 **추천 질문 목록**:\n- D3 단위과제 집행 지연 사유가 무엇인가요?\n- 자율성과지표 L-1의 산출 공식과 실적을 알려줘\n- 글로벌 협력 거점(D4) 사업의 지연 원인을 알려주세요\n- A1 (UC-HYPER) 사업비 규모와 개요는?",
      sources: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const chatEndRef = useRef(null);

  // 메시지 전송 시 대화창 하단 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 키워드 클릭 시 대화창에 질문 자동 주입 및 답변 가동
  const handleQuickQuestion = (text) => {
    setQuery(text);
    handleSend(null, text);
  };

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const activeText = customText || query;
    if (!activeText || activeText.trim() === "") return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { sender: "user", text: activeText, sources: [] }]);
    setQuery("");
    setLoading(true);

    // AI RAG 시뮬레이션 지연 실행 (마치 서버에서 연산하는 효과)
    setTimeout(() => {
      const ragResult = simulateRAGQuery(activeText);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: ragResult.answer,
        sources: ragResult.sources
      }]);
      setLoading(false);
    }, 850);
  };

  // 카테고리 필터링된 위키 단락 목록
  const filteredChunks = WIKI_CHUNKS.filter(chunk => {
    if (selectedCategory === "all") return true;
    return chunk.category === selectedCategory;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", height: "calc(100vh - 120px)", minHeight: "550px" }}>
      
      {/* 1. 좌측 패널: 위키 백과사전 단락 퀵 네비게이션 */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: "1.2rem", height: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem", marginBottom: "1rem" }}>
          <BookOpen size={20} style={{ color: "var(--accent-color)" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>사업 백과 단락 (색인)</h3>
        </div>

        {/* 카테고리 탭 스위처 */}
        <div style={{ display: "flex", gap: "0.3rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {["all", "개요", "사업비 현황", "사업비지침", "성과지표", "5극3특"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                border: "none",
                padding: "0.3rem 0.65rem",
                borderRadius: "0.35rem",
                fontSize: "0.72rem",
                fontWeight: "700",
                cursor: "pointer",
                background: selectedCategory === cat ? "var(--accent-color)" : "rgba(255, 255, 255, 0.04)",
                color: selectedCategory === cat ? "white" : "var(--text-secondary)",
                transition: "all 0.2s ease"
              }}
            >
              {cat === "all" ? "전체" : cat}
            </button>
          ))}
        </div>

        {/* 위키 단락 리스트 */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {filteredChunks.map(chunk => (
            <div
              key={chunk.id}
              onClick={() => handleQuickQuestion(`${chunk.unit} ${chunk.title}`)}
              style={{
                padding: "0.7rem 0.8rem",
                borderRadius: "0.5rem",
                background: "var(--panel-bg)",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              className="wiki-item-hover"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--accent-color)" }}>{chunk.unit}</span>
                <span style={{ 
                  fontSize: "0.58rem", 
                  padding: "0.1rem 0.3rem", 
                  borderRadius: "0.2rem", 
                  background: chunk.category === "지연 사유" ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
                  color: chunk.category === "지연 사유" ? "var(--danger-color)" : "var(--accent-color)" 
                }}>
                  {chunk.category}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {chunk.title}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "0.25rem", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.3" }}>
                {chunk.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 우측 패널: AI RAG 대화형 챗봇 인터페이스 */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: "1.2rem", height: "100%", overflow: "hidden" }}>
        
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} style={{ color: "var(--accent-color)" }} />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>지식 RAG AI 챗봇</h3>
              <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                학습 문서: 12개 단위과제 계획서, 1차년도 성과보고서 (ChromaDB 모의 색인 연동 중)
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessages([
              {
                sender: "ai",
                text: "대화 기록이 성공적으로 초기화되었습니다. 어떤 내용이 궁금하신가요?",
                sources: []
              }
            ])}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.7rem",
              fontWeight: "700"
            }}
          >
            <RefreshCw size={12} />
            초기화
          </button>
        </div>

        {/* 채팅 본문 윈도우 */}
        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingRight: "0.5rem", marginBottom: "1rem" }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                width: "100%"
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "0.8rem 1rem",
                  borderRadius: "0.75rem",
                  borderTopRightRadius: msg.sender === "user" ? "0" : "0.75rem",
                  borderTopLeftRadius: msg.sender === "user" ? "0.75rem" : "0",
                  background: msg.sender === "user" ? "var(--accent-color)" : "var(--panel-bg)",
                  border: msg.sender === "user" ? "none" : "1px solid var(--border-color)",
                  color: msg.sender === "user" ? "white" : "var(--text-primary)",
                  fontSize: "0.82rem",
                  lineHeight: "1.5",
                  whiteSpace: "pre-line"
                }}
              >
                {msg.text}

                {/* AI 응답일 때 RAG 참고 출처 칩 표기 */}
                {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: "0.75rem", paddingTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Bookmark size={10} />
                      참고 성과/지침 문서 출처:
                    </div>
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                      {msg.sources.map(src => (
                        <span
                          key={src.id}
                          style={{
                            fontSize: "0.58rem",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "0.25rem",
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "var(--accent-color)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            fontWeight: "700"
                          }}
                        >
                          [{src.unit}] {src.category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* AI 응답 생성중 로딩 물방울 애니메이션 */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
              <div
                style={{
                  padding: "0.8rem 1rem",
                  borderRadius: "0.75rem",
                  borderTopLeftRadius: "0",
                  background: "var(--panel-bg)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Sparkles size={14} className="animate-spin" style={{ color: "var(--accent-color)" }} />
                <span>RAG 지식베이스 검색 및 답변 구상 중...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 채팅 입력 폼 */}
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", padding: "0.4rem 0.6rem", borderRadius: "0.75rem" }}>
          <input
            type="text"
            placeholder="사업 관련 질문을 입력하세요 (예: D3 지연 사유가 뭐야?)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            style={{
              flexGrow: 1,
              border: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "0.82rem",
              outline: "none",
              padding: "0.4rem"
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              border: "none",
              background: query.trim() && !loading ? "var(--accent-color)" : "rgba(255,255,255,0.03)",
              color: query.trim() && !loading ? "white" : "var(--text-secondary)",
              cursor: query.trim() && !loading ? "pointer" : "default",
              padding: "0.45rem 0.75rem",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
