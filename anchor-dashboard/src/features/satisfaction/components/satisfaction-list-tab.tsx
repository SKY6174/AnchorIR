import type { Dispatch, SetStateAction } from "react";
import { Trash2 } from "lucide-react";
import type { SatisfactionSurvey } from "../satisfaction-types";
import { getLikertConvertedScore } from "../utils/satisfaction-analysis";

interface SatisfactionListTabProps {
  surveys: SatisfactionSurvey[];
  filterDepts: string[];
  setFilterDepts: Dispatch<SetStateAction<string[]>>;
  selectedYear?: number | string;
  selectedSurveyId: string | null;
  setSelectedSurveyId: Dispatch<SetStateAction<string | null>>;
  setActiveSurveyTab: Dispatch<SetStateAction<string>>;
  handleDeleteSurvey: (id: string) => void | Promise<void>;
}

export function SatisfactionListTab({
  surveys,
  filterDepts,
  setFilterDepts,
  selectedYear,
  selectedSurveyId,
  setSelectedSurveyId,
  setActiveSurveyTab,
  handleDeleteSurvey,
}: SatisfactionListTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* 만족도조사 목록 하부 부서 선택 멀티 체크박스 필터 */}
      {surveys.length > 0 && (
        <div className="glass-card" style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "800" }}>
              조회할 부서 선택 (복수 선택 가능)
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setFilterDepts(["ECC", "ICC", "RCC", "AIDX", "NURI", "SEVeN"])}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem 0.5rem", fontSize: "0.68rem", borderRadius: "0.25rem", cursor: "pointer", fontWeight: "700" }}
              >
                전체 선택
              </button>
              <button
                type="button"
                onClick={() => setFilterDepts([])}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem 0.5rem", fontSize: "0.68rem", borderRadius: "0.25rem", cursor: "pointer", fontWeight: "700" }}
              >
                전체 해제
              </button>
            </div>
          </div>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem 1.2rem",
            background: "rgba(255,255,255,0.01)",
            padding: "0.6rem 1rem",
            borderRadius: "0.375rem",
            border: "1px solid var(--border-color)"
          }}>
            {[
              { key: "ECC", label: "ECC (지산학)" },
              { key: "ICC", label: "ICC (기업협업)" },
              { key: "RCC", label: "RCC (지역협업)" },
              { key: "AIDX", label: "AIDX (AID-X)" },
              { key: "NURI", label: "NURI (늘봄누리)" },
              { key: "SEVeN", label: "SEVeN (신산업)" }
            ].map((deptObj) => {
              const isChecked = filterDepts.includes(deptObj.key);
              return (
                <label htmlFor="a11y-satisfaction-manager-1"
                  key={deptObj.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.76rem",
                    color: isChecked ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: isChecked ? "700" : "500",
                    transition: "all 0.15s"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterDepts([...filterDepts, deptObj.key]);
                      } else {
                        setFilterDepts(filterDepts.filter(d => d !== deptObj.key));
                      }
                    }}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  {deptObj.label}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {surveys.length === 0 ? (
        <div className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
          등록된 만족도 조사지가 없습니다. 우측 상단의 '신규 만족도조사지 제작' 버튼을 클릭해 새 설문을 생성해 보세요!
        </div>
      ) : (
        (() => {
          // 선택된 부서 키들에 매핑되는 설문 조사 필터링 및 글로벌 연차 연동 필터링 적용
          const filteredSurveys = surveys.filter(s => {
            // 1. 부서 매칭 검사
            if (!s.department) return false;
            const depts = s.department.split(",").map(d => d.trim().toUpperCase());
            const deptMatch = depts.some(d => filterDepts.includes(d));
            if (!deptMatch) return false;

            // 2. 글로벌 연차 매칭 검사 (ID 연도 또는 시작일 연도가 해당 연차에 부합하는 조사만 필터링)
            const targetYearStr = String(2024 + Number(selectedYear ?? 1));
            const idMatch = s.id && s.id.startsWith(targetYearStr);
            const dateMatch = s.startDate && s.startDate.startsWith(targetYearStr);
            return idMatch || dateMatch;
          });

          if (filteredSurveys.length === 0) {
            return (
              <div style={{
                padding: "3rem",
                textAlign: "center",
                color: "var(--text-secondary)",
                border: "1px dashed rgba(255,255,255,0.06)",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                background: "rgba(255,255,255,0.01)"
              }}>
                선택한 담당 부서의 만족도 조사 내역이 존재하지 않습니다.
              </div>
            );
          }

          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.2rem" }}>
              {filteredSurveys.map((survey) => {
                const convertedAvg = getLikertConvertedScore(survey.responses, survey.questions.length);
                return (
                   <div
                    key={survey.id}
                    className="glass-card animate-fade-in"
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: selectedSurveyId === survey.id ? "1.5px solid var(--accent-color)" : "1px solid var(--border-color)",
                      background: selectedSurveyId === survey.id
                        ? "linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08))"
                        : "linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.04))",
                      boxShadow: selectedSurveyId === survey.id
                        ? "0 8px 32px rgba(59, 130, 246, 0.25)"
                        : "0 4px 16px rgba(0, 0, 0, 0.15)",
                      backdropFilter: "blur(12px)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--accent-color)", fontWeight: "900", letterSpacing: "0.5px" }}>
                          ID: {survey.id}
                        </span>
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.65rem",
                            fontWeight: "800",
                            background: "var(--input-bg)",
                            color: "var(--text-secondary)"
                          }}>
                            {survey.department}
                          </span>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.65rem",
                            fontWeight: "800",
                            background: survey.status === "완료" ? "rgba(16, 185, 129, 0.1)" : survey.status === "배포중" ? "rgba(59, 130, 246, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: survey.status === "완료" ? "#10b981" : survey.status === "배포중" ? "#3b82f6" : "#f59e0b"
                          }}>
                            {survey.status}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { setSelectedSurveyId(survey.id); setActiveSurveyTab("detail"); }}
                        style={{
                          width: "100%",
                          padding: 0,
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          fontSize: "0.95rem",
                          fontWeight: "800",
                          marginBottom: "0.5rem",
                          color: "var(--text-primary)",
                          lineHeight: "1.3",
                          cursor: "pointer",
                          transition: "color 0.15s ease"
                        }}
                        onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                        onBlur={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                        title="상세보기 / 관리"
                      >
                        {survey.title}
                      </button>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                        {survey.purpose}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "0.25rem", marginBottom: "1rem" }}>
                        <div style={{ gridColumn: "span 2", whiteSpace: "nowrap" }}>일정: <span style={{ color: "var(--text-secondary)" }}>{survey.startDate} ~ {survey.endDate}</span></div>
                        <div style={{ gridColumn: "span 2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>대상: <span style={{ color: "var(--text-secondary)" }} title={survey.target || undefined}>{survey.target}</span></div>
                        <div>질문수: <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>{survey.questions.length}문항</span></div>
                        <div>수집응답: <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>{survey.responses.length}건</span></div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>100점 환산 평균</span>
                        <strong style={{ fontSize: "1.1rem", color: "var(--accent-color)" }}>
                          {survey.responses.length > 0 ? `${convertedAvg}점` : "자료 없음"}
                        </strong>
                      </div>

                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => { setSelectedSurveyId(survey.id); setActiveSurveyTab("detail"); }}
                          className="btn-secondary"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.75rem",
                            borderRadius: "0.3rem",
                            border: "1px solid var(--border-color)",
                            background: "rgba(255,255,255,0.02)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            fontWeight: "700"
                          }}
                        >
                          상세보기 / 관리
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey.id)}
                          style={{
                            padding: "0.4rem",
                            fontSize: "0.75rem",
                            borderRadius: "0.3rem",
                            border: "none",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            cursor: "pointer"
                          }}
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()
      )}
    </div>
  );
}
