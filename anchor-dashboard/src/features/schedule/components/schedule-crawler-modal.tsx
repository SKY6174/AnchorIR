interface ScheduleCrawlerModalProps {
  crawlerLogs: string[];
  crawlerProgress: number;
}

export function ScheduleCrawlerModal({
  crawlerLogs,
  crawlerProgress
}: ScheduleCrawlerModalProps) {
  return (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 1200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            width: "550px",
            maxHeight: "85vh",
            background: "#090d16",
            border: "1px solid #1e293b",
            borderRadius: "0.75rem",
            boxShadow: "0 20px 50px rgba(139, 92, 246, 0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            margin: "auto"
          }}>
            {/* 맥북 스타일 윈도우 타이틀 바 */}
            <div style={{
              background: "#111827",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #1f2937"
            }}>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontFamily: "monospace", fontWeight: "700" }}>
                📡 ANCHOR AI News Crawler v1.0
              </span>
              <span style={{ width: "40px" }} />
            </div>

            {/* 터미널 로그 콘솔 본문 */}
            <div style={{
              padding: "1.25rem",
              minHeight: "220px",
              maxHeight: "300px",
              overflowY: "auto",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.75rem",
              lineHeight: "1.5",
              color: "#34d399",
              background: "#040711",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}>
              {crawlerLogs.map((log, i) => (
                <div key={i} style={{
                  color: log.includes("[SUCCESS]") ? "#60a5fa" : (log.includes("[WARNING]") ? "#f59e0b" : (log.includes("[INFO]") ? "#a78bfa" : "#34d399")),
                  whiteSpace: "pre-wrap",
                  animation: "fadeIn 0.15s ease-out forwards"
                }}>
                  {log}
                </div>
              ))}
              {crawlerLogs.length < 7 && (
                <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
                  <span style={{ width: "12px", height: "12px", border: "2px solid #94a3b8", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear" }} />
                  <span>매체 크롤링 진행 중...</span>
                </div>
              )}
            </div>

            {/* 하단 상태바 및 프로그레스 게이지 */}
            <div style={{
              background: "#111827",
              padding: "1rem 1.25rem",
              borderTop: "1px solid #1f2937"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: "600" }}>
                  크롤러 분석 게이지
                </span>
                <span style={{ color: "#c084fc", fontSize: "0.68rem", fontFamily: "monospace", fontWeight: "700" }}>
                  {crawlerProgress}% Completed
                </span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#1f2937", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  width: `${crawlerProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)",
                  borderRadius: "3px",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
          </div>
        </div>
  );
}
