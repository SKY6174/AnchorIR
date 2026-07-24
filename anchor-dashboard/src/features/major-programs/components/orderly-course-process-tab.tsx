import type { Dispatch, SetStateAction } from "react";
import { ArrowRight } from "lucide-react";
import type { OrderlyCourse } from "../major-program-types";

interface OrderlyCourseProcessTabProps {
  orderlyCourses: OrderlyCourse[];
  selectedDeptFilter: string;
  setSelectedDeptFilter: Dispatch<SetStateAction<string>>;
  selectedTypeFilter: string;
  setSelectedTypeFilter: Dispatch<SetStateAction<string>>;
  activeCourseId: string;
  setActiveCourseId: Dispatch<SetStateAction<string>>;
  setOrderlyTab: Dispatch<SetStateAction<string>>;
}

export function OrderlyCourseProcessTab({
  orderlyCourses,
  selectedDeptFilter,
  setSelectedDeptFilter,
  selectedTypeFilter,
  setSelectedTypeFilter,
  activeCourseId,
  setActiveCourseId,
  setOrderlyTab
}: OrderlyCourseProcessTabProps) {
  return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* 필터 헤더 */}
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label htmlFor="a11y-major-programs-manager-1" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>학과 필터</label>
                            <select id="a11y-major-programs-manager-1"
                              value={selectedDeptFilter}
                              onChange={(e) => setSelectedDeptFilter(e.target.value)}
                              style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                            >
                              <option value="all" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>전체 학과</option>
                              {Array.from(new Set(orderlyCourses.map(c => c.dept))).map(dept => (
                                <option key={dept} value={dept} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{dept}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label htmlFor="a11y-major-programs-manager-2" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>교육과정 유형</label>
                            <select id="a11y-major-programs-manager-2"
                              value={selectedTypeFilter}
                              onChange={(e) => setSelectedTypeFilter(e.target.value)}
                              style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                            >
                              <option value="all" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>전체 유형</option>
                              <option value="AI 리터러시" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>AI 리터러시</option>
                              <option value="옴니버스" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>옴니버스</option>
                              <option value="OJT 병행" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>OJT 병행</option>
                              <option value="캡스톤디자인" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>캡스톤디자인</option>
                              <option value="기업형 PBL" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>기업형 PBL</option>
                            </select>
                          </div>
                        </div>

                        {/* 교과목 테이블 */}
                        <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                            <thead style={{ position: "sticky", top: 0, background: "#1e293b", backdropFilter: "blur(4px)", zIndex: 5 }}>
                              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.15)", color: "rgba(255, 255, 255, 0.95)" }}>
                                <th style={{ padding: "0.5rem" }}>유형</th>
                                <th style={{ padding: "0.5rem" }}>학과</th>
                                <th style={{ padding: "0.5rem" }}>교과목명</th>
                                <th style={{ padding: "0.5rem" }}>담당교수</th>
                                <th style={{ padding: "0.5rem", textAlign: "right" }}>학생수</th>
                                <th style={{ padding: "0.5rem", textAlign: "right" }}>배정예산</th>
                                <th style={{ padding: "0.5rem", textAlign: "center" }}>액션</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderlyCourses.filter(c => {
                                const matchDept = selectedDeptFilter === "all" || c.dept === selectedDeptFilter;
                                const matchType = selectedTypeFilter === "all" || c.type === selectedTypeFilter;
                                return matchDept && matchType;
                              }).map((c) => (
                                <tr
                                  key={c.id}
                                  onClick={() => {
                                    setActiveCourseId(c.id);
                                    setOrderlyTab("result");
                                  }}
                                  style={{
                                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    cursor: "pointer",
                                    background: activeCourseId === c.id ? "rgba(16, 185, 129, 0.06)" : "transparent"
                                  }}
                                  className="course-tr-hover"
                                 role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                  <td style={{ padding: "0.5rem" }}>
                                    <span style={{
                                      fontSize: "0.65rem",
                                      padding: "0.15rem 0.4rem",
                                      borderRadius: "3px",
                                      fontWeight: "800",
                                      background: c.type === "캡스톤디자인" ? "rgba(59,130,246,0.15)" : c.type === "기업형 PBL" ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.15)",
                                      color: c.type === "캡스톤디자인" ? "#3b82f6" : c.type === "기업형 PBL" ? "#10b981" : "#eab308"
                                    }}>
                                      {c.type}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.5rem" }}>{c.dept}</td>
                                  <td style={{ padding: "0.5rem", fontWeight: "700" }}>{c.name}</td>
                                  <td style={{ padding: "0.5rem" }}>{c.professor}</td>
                                  <td style={{ padding: "0.5rem", textAlign: "right" }}>{c.students}명</td>
                                  <td style={{ padding: "0.5rem", textAlign: "right", color: "var(--accent-color)" }}>{(c.budget / 1000).toLocaleString()}천원</td>
                                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                    <button style={{ border: "none", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: "0.68rem", padding: "0.2rem 0.5rem", borderRadius: "3px", cursor: "pointer", fontWeight: "800" }}>
                                      이수 관리 <ArrowRight size={10} style={{ display: "inline", marginLeft: "1px" }} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
  );
}
