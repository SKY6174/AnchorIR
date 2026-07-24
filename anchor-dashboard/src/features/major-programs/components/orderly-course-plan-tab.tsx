import type { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";
import type { PmProfessor } from "../major-program-types";

interface OrderlyCoursePlanTabProps {
  pmProfessors: PmProfessor[];
  pmSearchQuery: string;
  setPmSearchQuery: Dispatch<SetStateAction<string>>;
}

export function OrderlyCoursePlanTab({
  pmProfessors,
  pmSearchQuery,
  setPmSearchQuery
}: OrderlyCoursePlanTabProps) {
  return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* 총괄 카드 세트 */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>총 소요 예산</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#10b981", marginTop: "0.25rem" }}>117.9 백만원</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>국고 지원금 100%</div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>대상 교과목</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--accent-color)", marginTop: "0.25rem" }}>54 개 과목</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>A1 정규 교육과정</div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>참여 학생수</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#eab308", marginTop: "0.25rem" }}>2,170 명</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>유학생 76명 포함</div>
                          </div>
                        </div>

                        {/* 💡 학과/전공별 주문식 교육과정 운영 정보 테이블 (기존 학과별 PM교수 구성 현황에서 개편됨) */}
                        <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", background: "rgba(255,255,255,0.01)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                            {/* 초보 개발자용 설명: 테이블 상단 타이틀 명칭 변경 */}
                            <h5 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)" }}>학과/전공별 주문식 교육과정 운영 정보</h5>
                            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "5px", padding: "0.25rem 0.5rem", width: "180px" }}>
                              <Search size={12} style={{ color: "var(--text-secondary)", marginRight: "0.25rem" }} />
                              {/* 초보 개발자용 설명: 검색 필터 힌트 플레이스홀더를 변경함 */}
                              <input
                                type="text"
                                placeholder="학과/전공명 검색..."
                                value={pmSearchQuery}
                                onChange={(e) => setPmSearchQuery(e.target.value)}
                                style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.75rem", width: "100%" }}
                              />
                            </div>
                          </div>

                          {/* 초보 개발자용 설명: 스크롤이 생기는 테이블 컨테이너 영역. 리스트가 길어져서 최대 높이를 350px로 늘렸습니다. */}
                          <div style={{ maxHeight: "350px", overflowY: "auto", fontSize: "0.8rem" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                              <thead>
                                {/* 초보 개발자용 설명: 요청 사양에 따른 테이블 헤더 컬럼 변경 (순번 | 학과/전공명 | PM교수 | 운영중인 주문식교육과정 | 참여학생 수 | 비고) */}
                                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                  <th style={{ padding: "0.5rem 0.4rem" }}>순번</th>
                                  <th style={{ padding: "0.5rem 0.4rem" }}>학과/전공명</th>
                                  <th style={{ padding: "0.5rem 0.4rem" }}>PM교수</th>
                                  <th style={{ padding: "0.5rem 0.4rem" }}>운영중인 주문식교육과정</th>
                                  <th style={{ padding: "0.5rem 0.4rem" }}>참여학생 수<br/>(총학생수 / 중복제외)</th>
                                  <th style={{ padding: "0.5rem 0.4rem" }}>비고</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* 초보 개발자용 설명: Supabase에서 조회하거나 로컬 Fallback 데이터를 담고 있는 pmProfessors 상태값을 이용해 렌더링합니다. */}
                                {pmProfessors.filter(pm => pm.dept.includes(pmSearchQuery))
                                  .map((pm, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                      {/* 1. 순번 */}
                                      <td style={{ padding: "0.5rem 0.4rem", color: "var(--text-secondary)" }}>{idx + 1}</td>
                                      {/* 2. 학과/전공명 */}
                                      <td style={{ padding: "0.5rem 0.4rem", fontWeight: "700", color: "var(--text-primary)" }}>{pm.dept}</td>
                                      {/* 3. PM교수 */}
                                      <td style={{ padding: "0.5rem 0.4rem", color: "#10b981", fontWeight: "800" }}>{pm.name} 교수</td>
                                      {/* 4. 운영중인 주문식교육과정 */}
                                      <td style={{ padding: "0.5rem 0.4rem", color: "var(--text-secondary)", fontSize: "0.75rem", maxWidth: "250px", wordBreak: "keep-all" }}>{pm.courses}</td>
                                      {/* 5. 참여학생 수 (총학생수, 중복제외 각각 표시) */}
                                      <td style={{ padding: "0.5rem 0.4rem", color: "#eab308", fontWeight: "800" }}>
                                        {pm.totalStudents}명 <span style={{ color: "var(--text-secondary)", fontSize: "0.7rem", fontWeight: "normal" }}>({pm.uniqueStudents}명)</span>
                                      </td>
                                      {/* 6. 비고 (교과목 연계 및 학과 특이사항) */}
                                      <td style={{ padding: "0.5rem 0.4rem", color: "var(--text-secondary)", fontSize: "0.7rem", maxWidth: "200px", wordBreak: "keep-all" }}>{pm.note}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
  );
}
