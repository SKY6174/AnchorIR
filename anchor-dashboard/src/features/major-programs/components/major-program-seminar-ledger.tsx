import { Pencil, Trash2 } from "lucide-react";
import type { SeminarRecord } from "../major-program-types";

interface MajorProgramSeminarLedgerProps {
  seminarList: SeminarRecord[];
  onEdit: (seminar: SeminarRecord) => void;
  onDelete: (seminarId: number) => void;
}

export function MajorProgramSeminarLedger({
  seminarList,
  onEdit,
  onDelete
}: MajorProgramSeminarLedgerProps) {
  return (
                    <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <h6 style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--text-primary)" }}>지산학 이음 세미나 개최 결과 요약 대장</h6>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: "800" }}>
                              <th style={{ padding: "0.6rem 0.5rem", width: "40px", textAlign: "center" }}>순번</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "140px" }}>일시</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "120px" }}>강사</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "220px" }}>주제(제목)</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "70px", textAlign: "center" }}>참석자 수</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "95px", textAlign: "right" }}>본예산</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "95px", textAlign: "right" }}>이월예산</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "80px", textAlign: "center" }}>만족도</th>
                              <th style={{ padding: "0.6rem 0.5rem" }}>기타 및 특이사항</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "50px", textAlign: "center" }}>관리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {seminarList.length > 0 ? (
                              seminarList.map((seminar) => (
                                <tr
                                  key={seminar.id}
                                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                  className="course-tr-hover"
                                >
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", fontWeight: "700" }}>{seminar.id}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>{seminar.date}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", fontWeight: "700", color: "var(--text-primary)" }}>{seminar.speaker}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-primary)", fontWeight: "600" }}>{seminar.title}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>{seminar.attendees}명</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10b981" }}>
                                    ₩{(seminar.mainCost || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#6366f1" }}>
                                    ₩{(seminar.carryCost || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>
                                    <span style={{ background: "rgba(234,179,8,0.1)", color: "#eab308", padding: "0.15rem 0.35rem", borderRadius: "3px", fontWeight: "800" }}>
                                      ★ {seminar.satisfaction.toFixed(1)}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{seminar.etc}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>
                                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                                      <button
                                        aria-label={`제${seminar.id}차 세미나 결과 수정`}
                                        onClick={() => onEdit(seminar)}
                                        title="수정"
                                        style={{ border: "none", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: "0.65rem", padding: "0.25rem 0.45rem", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button
                                        aria-label={`제${seminar.id}차 세미나 결과 삭제`}
                                        onClick={() => onDelete(seminar.id)}
                                        title="삭제"
                                        style={{ border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.65rem", padding: "0.25rem 0.45rem", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                  등록된 세미나 결과보고서가 없습니다. [+ 결과보고 등록] 버튼을 통해 추가해 보세요.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
  );
}
