import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Send, Sparkles, Bookmark, RefreshCw } from "lucide-react";
import {
  simulateRAGQuery,
  WIKI_CHUNKS,
  type RAGSource
} from "../data/mockWikiData";
import { supabase } from "../supabaseClient";
import type { Json } from "../types/supabase";

export interface LLMWikiProps {
  selectedYear?: number | string;
  darkMode?: boolean;
  currentUser?: any;
  currentRole?: any;
}

export interface WikiMessage {
  sender: "user" | "ai" | string;
  text: string;
  sources?: RAGSource[];
}

interface RagMetadata {
  year?: number | string;
  title?: string;
  category?: string;
  unit?: string;
}

interface EmbeddingResponse {
  data?: Array<{ embedding?: number[] }>;
}

const readRagMetadata = (value: Json): RagMetadata => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as RagMetadata;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export default function LLMWiki({ selectedYear = 2, darkMode = true }: LLMWikiProps) {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<WikiMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 연차가 변경되면 RAG 챗봇 환영 인사 및 대화 상태 동적 갱신
  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: `안녕하세요! 울산과학대학교 앵커 사업단 AI RAG 위키 포털입니다. 현재 **${selectedYear}차년도** 지식베이스(기획서 및 성과자료)를 기반으로 검색합니다.\n\n원하시는 정보를 실시간으로 검색하여 답변해 드립니다. 무엇이든 질문해 보세요!\n\n💡 **추천 질문 목록**:\n- ${selectedYear === 1 ? "1차년도" : "2차년도"} A1가 단위과제 개요가 무엇인가요?\n- 회의비 식비 한도 규정이 어떻게 개정되었어?\n- 강사료 지침의 최신 개정본 및 차이점을 알려줘\n- 자율성과지표 L-1의 산출 공식과 실적은?`,
        sources: []
      }
    ]);
  }, [selectedYear]);

  // 메시지 전송 시 대화창 하단 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 키워드 클릭 시 대화창에 질문 자동 주입 및 답변 가동
  const handleQuickQuestion = (text: string) => {
    setQuery(text);
    handleSend(null, text);
  };

  const handleSend = async (e?: React.FormEvent<HTMLFormElement> | null, customText?: string | null) => {
    if (e) e.preventDefault();
    const activeText = customText || query;
    if (!activeText || activeText.trim() === "") return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { sender: "user", text: activeText, sources: [] }]);
    setQuery("");
    setLoading(true);

    // 1. OpenAI API 키 판별 (환경변수 -> 로컬스토리지 -> 사용자 prompt 유도)
    let apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    if (!apiKey || apiKey.startsWith("sk-") === false) {
      apiKey = localStorage.getItem("user_openai_api_key") || "";
    }

    // 2. 키워드 점수 기반 모의 RAG 검색 가동 (유관 지식 조각 추출용 폴백 데이터)
    const numericSelectedYear = Number(selectedYear);
    const ragResult = simulateRAGQuery(activeText, numericSelectedYear);

    if (!apiKey) {
      const inputKey = prompt(
        "🔑 실시간 GPT Wiki 검색을 사용하려면 OpenAI API Key가 필요합니다.\nsk-로 시작하는 API Key를 입력해 주세요 (브라우저 로컬 스토리지에만 안전하게 저장됩니다):",
        ""
      );
      if (!inputKey) {
        // 취소 시 모의 RAG 폴백 작동
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: "ai",
            text: ragResult.answer + "\n\n*(⚠️ API Key가 입력되지 않아 모의 지식베이스 검색 결과로 답변되었습니다)*",
            sources: ragResult.sources
          }]);
          setLoading(false);
        }, 850);
        return;
      }
      apiKey = inputKey.trim();
      localStorage.setItem("user_openai_api_key", apiKey);
    }

    // 진짜 RAG 탐색 결과 저장용 변수
    let finalContextStr = "";
    let finalSources: RAGSource[] = [];
    let isRealRAGSuccessful = false;

    try {
      // 3. 실시간 OpenAI 임베딩 API 호출 (1536차원 벡터 변환)
      console.log(">>> RAG 임베딩 API 호출 시도 <<<");
      const embedResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          input: activeText,
          model: "text-embedding-3-small"
        })
      });

      if (!embedResponse.ok) {
        throw new Error(`Embedding API Error: ${embedResponse.status}`);
      }

      const embedData = await embedResponse.json() as EmbeddingResponse;
      const queryEmbedding = embedData?.data?.[0]?.embedding;

      if (queryEmbedding && Array.isArray(queryEmbedding)) {
        // 4. Supabase match_rag_documents RPC 함수 호출 (코사인 유사도 검색)
        console.log(">>> Supabase pgvector 유사도 탐색 수행 <<<");
        const { data: dbChunks, error: dbErr } = await supabase.rpc("match_rag_documents", {
          query_embedding: queryEmbedding as unknown as string,
          match_threshold: 0.25,
          match_count: 6
        });

        if (dbErr) throw dbErr;

        if (dbChunks && dbChunks.length > 0) {
          // 현재 연차(selectedYear)에 매칭되는 데이터 또는 연차 무관 공통 지식 필터링
          const yearFiltered = dbChunks
            .map(chunk => ({ ...chunk, metadata: readRagMetadata(chunk.metadata) }))
            .filter(chunk => {
              const chunkYear = chunk.metadata.year ? Number(chunk.metadata.year) : null;
              return !chunkYear || chunkYear === numericSelectedYear;
            });

          if (yearFiltered.length > 0) {
            finalContextStr = yearFiltered
              .map(chunk => `[지식 자료: ${chunk.metadata?.title || "참조문서"} (${chunk.metadata?.category || "일반"})]\n${chunk.content}`)
              .join("\n\n");
            
            finalSources = yearFiltered.map(chunk => ({
              id: String(chunk.id),
              unit: chunk.metadata.unit || "일반",
              category: chunk.metadata.category || "지식",
              title: chunk.metadata.title || "참조문서"
            }));

            isRealRAGSuccessful = true;
            console.log(`>>> RAG 실데이터 매칭 성공: ${yearFiltered.length}건 단락 연동 <<<`);
          }
        }
      }
    } catch (e) {
      console.warn("실시간 DB pgvector RAG 탐색 실패, 모의 데이터 폴백을 준비합니다:", getErrorMessage(e));
    }

    // 실시간 DB RAG 검색이 실패했거나 데이터가 없는 경우 모의 데이터셋으로 폴백
    if (!isRealRAGSuccessful) {
      console.log(">>> [폴백 발동] 모의 지식베이스 자료로 RAG 컨텍스트를 구성합니다. <<<");
      finalContextStr = (ragResult.sources || [])
        .map(src => {
          const fullChunk = WIKI_CHUNKS.find(c => c.id === src.id);
          return `[지식 자료: ${fullChunk?.title} (${fullChunk?.category})]\n${fullChunk?.content}`;
        })
        .join("\n\n");
      finalSources = ragResult.sources;
    }

    try {
      const systemPrompt = `당신은 울산과학대학교 앵커(ANCHOR)사업단 전담 AI RAG 어시스턴트입니다. 
제공되는 [지식베이스 콘텍스트] 소스의 팩트에 기반하여 사용자의 질문에 정확하고 친절하게 한국어로 대답해야 합니다.

[지식베이스 콘텍스트]:
${finalContextStr || "관련된 직접적인 지식 문서가 없습니다. 일반 지식과 앵커사업 기획 방향에 기반해 답변해 주십시오."}

[주의사항]:
1. 반드시 제공된 콘텍스트의 팩트에 기반해서 답변을 구성하고, 모르는 부분이나 팩트에 없는 부분은 억지로 거짓말하지 마십시오.
2. 금액이나 식비, 초과근무 수당 한도 등 지침 규정 질문에는 콘텍스트 속의 명확한 수치를 콕 집어 명시적으로 대답하십시오.
3. 2차년도인지 1차년도인지 연차 구분이 질문에 언급되거나 문맥상 파악되면 해당 연도 기준 지침에 맞춤 대조하여 상세히 대답하십시오.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: activeText }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const answerText = resData?.choices?.[0]?.message?.content;
        
        setMessages(prev => [...prev, {
          sender: "ai",
          text: answerText || "답변을 가져오지 못했습니다.",
          sources: finalSources
        }]);
        setLoading(false);
        return;
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP 에러 ${response.status}`);
      }
    } catch (err) {
      console.warn("Real OpenAI RAG fetch failed, sliding down to mock RAG:", err);
      // 마지막 네트워크 통신 에러 시 최종 모의 폴백
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: ragResult.answer + `\n\n*(⚠️ 실시간 GPT 연결 실패로 모의 지식베이스 결과로 답변되었습니다. 원인: ${getErrorMessage(err)})*`,
          sources: ragResult.sources
        }]);
        setLoading(false);
      }, 850);
    }
  };

  // 카테고리 필터링된 위키 단락 목록 (연차별 연동 및 알파벳/넘버링 기호 오름차순 정렬)
  const filteredChunks = WIKI_CHUNKS.filter(chunk => {
    const matchesCategory = selectedCategory === "all" || chunk.category === selectedCategory;
    const matchesYear = !chunk.year || chunk.year === selectedYear;
    return matchesCategory && matchesYear;
  }).sort((a, b) => {
    if (a.category === "개요" && b.category === "개요") {
      // localeCompare { numeric: true } 옵션을 주어 A1, A2, B1, C1, D1, D4 순으로 넘버링 정렬
      return a.unit.localeCompare(b.unit, undefined, { numeric: true, sensitivity: "base" });
    }
    return 0;
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
                background: selectedCategory === cat ? "var(--accent-color)" : (darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.05)"),
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
                학습 문서: 12개 단위과제 계획서, 1차년도 성과보고서 (ChromaDB 모의 색인, {selectedYear}차년도 연동 중)
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessages([
              {
                sender: "ai",
                text: `대화 기록이 성공적으로 초기화되었습니다. 현재 **${selectedYear}차년도** 지식베이스를 연동 중입니다. 어떤 내용이 궁금하신가요?`,
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
                  <div style={{ marginTop: "0.75rem", paddingTop: "0.6rem", borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
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
        <form 
          onSubmit={handleSend} 
          style={{ 
            display: "flex", 
            gap: "0.5rem", 
            background: isFocused 
              ? (darkMode ? "rgba(30, 41, 59, 0.65)" : "white") 
              : (darkMode ? "rgba(24, 24, 27, 0.9)" : "white"), 
            border: isFocused 
              ? "2px solid var(--accent-color)" 
              : (darkMode ? "2px solid rgba(59, 130, 246, 0.45)" : "2px solid rgba(59, 130, 246, 0.3)"), 
            padding: "0.5rem 0.8rem", 
            borderRadius: "0.75rem",
            boxShadow: isFocused 
              ? (darkMode ? "0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(59, 130, 246, 0.2)" : "0 0 0 3px rgba(59, 130, 246, 0.2)") 
              : (darkMode ? "0 0 12px rgba(59, 130, 246, 0.25), 0 4px 15px rgba(0, 0, 0, 0.35)" : "0 4px 12px rgba(59, 130, 246, 0.15)"),
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <input
            type="text"
            placeholder="사업 관련 질문을 입력하세요 (예: D3 지연 사유가 뭐야?)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
              background: query.trim() && !loading ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"),
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
