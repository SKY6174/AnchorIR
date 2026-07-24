import type { SeminarRecord } from "../major-program-types";

interface MajorProgramSeminarSummaryProps {
  seminarList: SeminarRecord[];
}

export function MajorProgramSeminarSummary({
  seminarList
}: MajorProgramSeminarSummaryProps) {
  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>총 세미나 개최</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)" }}>{seminarList.length}회</span>
                      </div>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>누적 참석자 수</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#3b82f6" }}>
                          {seminarList.reduce((sum, s) => sum + s.attendees, 0)}명
                        </span>
                      </div>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>누적 소요 예산 (본 / 이월)</span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#10b981" }}>
                            ₩{seminarList.reduce((sum, s) => sum + ((s.mainCost || 0) + (s.carryCost || 0)), 0).toLocaleString()}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>
                            본: ₩{seminarList.reduce((sum, s) => sum + (s.mainCost || 0), 0).toLocaleString()} / 이월: ₩{seminarList.reduce((sum, s) => sum + (s.carryCost || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>평균 만족도</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#eab308" }}>
                          ★ {seminarList.length > 0 ? (seminarList.reduce((sum, s) => sum + s.satisfaction, 0) / seminarList.length).toFixed(2) : "0.0"} / 5.0
                        </span>
                      </div>
                    </div>
  );
}
