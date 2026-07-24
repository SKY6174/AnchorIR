import type { Dispatch, SetStateAction } from "react";
import type { SatisfactionSurvey } from "../satisfaction-types";

interface SatisfactionSheetsModalProps {
  selectedSurvey: SatisfactionSurvey;
  setShowSheetsViewer: Dispatch<SetStateAction<boolean>>;
  handleOpenGoogleSheetsDirect: (survey: SatisfactionSurvey) => void;
  handleExportToExcel: (survey: SatisfactionSurvey) => void;
  currentLikertAverage: number;
}

export function SatisfactionSheetsModal({
  selectedSurvey,
  setShowSheetsViewer,
  handleOpenGoogleSheetsDirect,
  handleExportToExcel,
  currentLikertAverage,
}: SatisfactionSheetsModalProps) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "2rem"
    }}>
      <div style={{
        background: "#1e1e1e",
        borderRadius: "0.5rem",
        width: "95%",
        maxWidth: "1150px",
        height: "85vh",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #333",
        boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
        overflow: "hidden"
      }}>
        {/* 구글 스프레드시트 탑 그린 헤더 바 */}
        <div style={{
          background: "#0f9d58",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #0b7843"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              background: "white",
              padding: "0.25rem 0.35rem",
              borderRadius: "0.2rem",
              color: "#0f9d58",
              fontWeight: "900",
              fontSize: "0.78rem"
            }}>
              田
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", color: "white", fontWeight: "800", margin: 0 }}>
                Google Sheets 연동 실시간 뷰어 - {selectedSurvey.title}
              </h3>
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>
                연동 테이블: `satisfaction_responses` (ID: {selectedSurvey.id})
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSheetsViewer(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.2rem",
              cursor: "pointer",
              fontWeight: "700"
            }}
          >
            ✕
          </button>
        </div>

        {/* 시트 서브 툴바 */}
        <div style={{
          background: "#2b2b2b",
          borderBottom: "1px solid #3d3d3d",
          padding: "0.45rem 1.5rem",
          display: "flex",
          gap: "1.2rem",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.85)",
          alignItems: "center"
        }}>
          <span
            style={{ cursor: "pointer", color: "#0f9d58", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            onClick={() => handleOpenGoogleSheetsDirect(selectedSurvey)}
           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
            田 Google Sheets 웹으로 바로가기 (실제 데이터 자동 복사)
          </span>
          <span style={{ color: "#555" }}>|</span>
          <span style={{ cursor: "pointer", color: "var(--accent-color)", fontWeight: "700" }} onClick={() => handleExportToExcel(selectedSurvey)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>📥 Excel 파일 다운로드</span>
          <span style={{ color: "#555" }}>|</span>
          <span>편집 연동형</span>
          <span style={{ color: "#555" }}>|</span>
          <span style={{ color: "#10b981", fontWeight: "700" }}>● DB 실시간 동기화 완료</span>
        </div>

        {/* 스프레드시트 그리드 바디 */}
        <div style={{
          flex: 1,
          overflow: "auto",
          background: "#181818",
          padding: "1rem"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.75rem",
            color: "#ddd",
            textAlign: "left"
          }}>
            <thead>
              {/* 시트 고유 A, B, C, D 헤더 */}
              <tr style={{ background: "#2e2e2e" }}>
                <th aria-label="행 번호" style={{ width: "40px", border: "1px solid var(--border-color)", textAlign: "center", color: "#888", padding: "0.4rem" }}></th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "50px" }}>A</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "100px" }}>B</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "160px" }}>C</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>D</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>E</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>F</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>G</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>H</th>
                <th style={{ border: "1px solid var(--border-color)", padding: "0.4rem", color: "#888", textAlign: "center" }}>I</th>
              </tr>
              {/* 실제 필드 타이틀 행 */}
              <tr style={{ background: "#252525" }}>
                <td style={{ border: "1px solid var(--border-color)", textAlign: "center", color: "#888", fontWeight: "bold" }}>1</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>No</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>제출자명</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>제출 일시</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>문항 1</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>문항 2</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>문항 3</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>문항 4</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)", textAlign: "center" }}>문항 5</td>
                <td style={{ border: "1px solid var(--border-color)", padding: "0.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>기타 건의사항 및 피드백</td>
              </tr>
            </thead>
            <tbody>
              {selectedSurvey.responses.length === 0 ? (
                <tr>
                  <td style={{ border: "1px solid var(--border-color)", textAlign: "center", color: "#888", background: "#2e2e2e" }}>2</td>
                  <td colSpan={9} style={{ border: "1px solid var(--border-color)", padding: "1.5rem", textAlign: "center", color: "#777" }}>
                    현재 수집된 원시 응답 데이터가 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                selectedSurvey.responses.map((res, rIdx) => (
                  <tr key={res.id} style={{ background: rIdx % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)" }}>
                    <td style={{ border: "1px solid var(--border-color)", textAlign: "center", color: "#888", background: "#2e2e2e" }}>{rIdx + 2}</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", textAlign: "center" }}>{rIdx + 1}</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", color: "var(--text-primary)", fontWeight: "700" }}>{res.responder}</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", color: "var(--text-secondary)", textAlign: "center" }}>{res.date}</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[0]}점</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[1]}점</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[2]}점</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[3]}점</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[4]}점</td>
                    <td style={{ border: "1px solid var(--border-color)", padding: "0.45rem", color: "#ccc", fontStyle: res.comment ? "normal" : "italic" }}>
                      {res.comment || "(공백 피드백)"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 시트 하단 요약 정보 바 */}
        <div style={{
          background: "#222",
          borderTop: "1px solid #333",
          padding: "0.5rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.7rem",
          color: "var(--text-secondary)"
        }}>
          <span>총 {selectedSurvey.responses.length}행의 데이터 연동 완료</span>
          <span>100점 환산 평균: <strong style={{ color: "var(--accent-color)" }}>{currentLikertAverage}점</strong></span>
        </div>
      </div>
    </div>
  );
}
