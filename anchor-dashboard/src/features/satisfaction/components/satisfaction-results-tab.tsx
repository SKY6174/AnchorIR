import type { Dispatch, SetStateAction } from "react";
import type { SatisfactionSurvey } from "../satisfaction-types";
import { getLikertConvertedScore } from "../utils/satisfaction-analysis";

interface SatisfactionResultsTabProps {
  surveys: SatisfactionSurvey[];
  selectedYear?: number | string;
  setSelectedSurveyId: Dispatch<SetStateAction<string | null>>;
  setActiveSurveyTab: Dispatch<SetStateAction<string>>;
  handleDeleteSurvey: (id: string) => void | Promise<void>;
}

export function SatisfactionResultsTab({
  surveys,
  selectedYear,
  setSelectedSurveyId,
  setActiveSurveyTab,
  handleDeleteSurvey,
}: SatisfactionResultsTabProps) {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: "1.5rem", borderRadius: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>만족도조사 결과 통계 목록</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            등록된 전체 만족도 조사의 통계 지표와 AI 총평 반영 현황을 한눈에 비교 분석할 수 있습니다.
          </p>
        </div>
      </div>
      <div className="table-panel" style={{ overflowX: "auto" }}>
        <table className="custom-table" style={{ fontSize: "0.75rem", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "100px", textAlign: "center" }}>설문 ID</th>
              <th>만족도 조사제목</th>
              <th style={{ width: "110px", textAlign: "center" }}>수행부서</th>
              <th style={{ width: "110px", textAlign: "center" }}>대상</th>
              <th style={{ width: "150px", textAlign: "center" }}>조사 기간</th>
              <th style={{ width: "70px", textAlign: "center" }}>응답수</th>
              <th style={{ width: "110px", textAlign: "center" }}>평균 (100점 만점)</th>
              <th style={{ width: "80px", textAlign: "center" }}>상태</th>
              <th style={{ width: "90px", textAlign: "center" }}>상세 통계</th>
              <th style={{ width: "120px", textAlign: "center" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {surveys
              .filter(s => {
                const targetYearStr = String(2024 + Number(selectedYear ?? 1));
                const idMatch = s.id && s.id.startsWith(targetYearStr);
                const dateMatch = s.startDate && s.startDate.startsWith(targetYearStr);
                return idMatch || dateMatch;
              })
              .map((survey) => {
                const convertedAvg = getLikertConvertedScore(survey.responses, survey.questions.length);
              return (
                <tr key={survey.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedSurveyId(survey.id); setActiveSurveyTab("detail"); }} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                  <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", textAlign: "center" }}>{survey.id}</td>
                  <td style={{ fontWeight: "700" }}>{survey.title}</td>
                  <td style={{ textAlign: "center" }}>{survey.department}</td>
                  <td style={{ textAlign: "center" }}>{survey.target}</td>
                  <td style={{ textAlign: "center" }}>{survey.startDate} ~ {survey.endDate}</td>
                  <td style={{ textAlign: "center", fontFamily: "var(--font-data)", fontWeight: "700" }}>{survey.responses.length}건</td>
                  <td style={{ textAlign: "center", fontFamily: "var(--font-data)", fontWeight: "900", color: "var(--accent-color)" }}>
                    {survey.responses.length > 0 ? `${convertedAvg}점` : "자료 없음"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      padding: "0.15rem 0.4rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.62rem",
                      fontWeight: "800",
                      background: survey.status === "완료" ? "rgba(16, 185, 129, 0.1)" : survey.status === "배포중" ? "rgba(59, 130, 246, 0.1)" : "rgba(245, 158, 11, 0.1)",
                      color: survey.status === "완료" ? "#10b981" : survey.status === "배포중" ? "#3b82f6" : "#f59e0b"
                    }}>
                      {survey.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn-primary"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSurveyId(survey.id);
                        setActiveSurveyTab("detail");
                      }}
                    >
                      상세보기
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.3rem", justifyContent: "center" }}>
                      <button
                        aria-label={`${survey.title} 설문 수정`}
                        className="btn-primary"
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "0.7rem",
                          borderRadius: "0.3rem",
                          background: "rgba(59, 130, 246, 0.1)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          color: "#3b82f6",
                          fontWeight: "800",
                          cursor: "pointer"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSurveyId(survey.id);
                          setActiveSurveyTab("detail");
                        }}
                      >
                        수정
                      </button>
                      <button
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "0.7rem",
                          borderRadius: "0.3rem",
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          color: "#ef4444",
                          fontWeight: "800",
                          cursor: "pointer"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSurvey(survey.id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
