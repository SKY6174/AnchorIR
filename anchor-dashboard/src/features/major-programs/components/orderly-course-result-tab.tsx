import type React from "react";
import type { Dispatch, SetStateAction } from "react";
import { Download, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { getOverallStatus } from "../utils/major-program-utils";
import type {
  CourseStatus,
  CourseStatusKey,
  OrderlyCourse,
  StudentRecord
} from "../major-program-types";

type StringSetter = Dispatch<SetStateAction<string>>;

interface OrderlyCourseResultTabProps {
  orderlyCourses: OrderlyCourse[];
  studentMasterList: StudentRecord[];
  setStudentMasterList: Dispatch<SetStateAction<StudentRecord[]>>;
  selectedResultDeptFilter: string;
  setSelectedResultDeptFilter: StringSetter;
  newStudentId: string;
  setNewStudentId: StringSetter;
  newStudentName: string;
  setNewStudentName: StringSetter;
  newStudentDept: string;
  setNewStudentDept: StringSetter;
  downloadResultSample: () => Promise<void>;
  handleExcelUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleCourseStatus: (studentId: string, courseType: CourseStatusKey) => void;
}

export function OrderlyCourseResultTab({
  orderlyCourses,
  studentMasterList,
  setStudentMasterList,
  selectedResultDeptFilter,
  setSelectedResultDeptFilter,
  newStudentId,
  setNewStudentId,
  newStudentName,
  setNewStudentName,
  newStudentDept,
  setNewStudentDept,
  downloadResultSample,
  handleExcelUpload,
  toggleCourseStatus
}: OrderlyCourseResultTabProps) {
                      // 학과 필터가 반영된 학생 목록
                      const filteredStudents = studentMasterList.filter(s => {
                        return selectedResultDeptFilter === "all" || s.dept === selectedResultDeptFilter;
                      });

                      // 이수 통계 실시간 집계
                      const totalCount = filteredStudents.length;
                      const progressCount = filteredStudents.filter(s => getOverallStatus(s) === "진행중").length;
                      const completedCount = filteredStudents.filter(s => getOverallStatus(s) === "이수완료").length;

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

                          {/* 상단 통계 카드 & 학과 필터 */}
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.2rem", flexWrap: "wrap" }}>

                            {/* 좌측: 학과 필터 및 통계 요약 */}
                            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1.2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "800" }}>이수 통계 집계</span>
                                  <h5 style={{ fontSize: "1.05rem", fontWeight: "900", color: "#10b981", marginTop: "0.1rem" }}>
                                    {selectedResultDeptFilter === "all" ? "전체 학부(과)" : selectedResultDeptFilter} 결과
                                  </h5>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-3" style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>결과 학과 필터</label>
                                  <select id="a11y-major-programs-manager-3"
                                    value={selectedResultDeptFilter}
                                    onChange={(e) => setSelectedResultDeptFilter(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem 0.5rem", borderRadius: "5px", fontSize: "0.72rem", outline: "none" }}
                                  >
                                    <option value="all" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>전체 학과</option>
                                    {Array.from(new Set(orderlyCourses.map(c => c.dept))).map(dept => (
                                      <option key={dept} value={dept} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{dept}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem", borderRadius: "6px", textAlign: "center" }}>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>총 참여학생</span>
                                  <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "var(--text-primary)", marginTop: "0.2rem" }}>{totalCount}명</div>
                                </div>
                                <div style={{ background: "rgba(234,179,8,0.06)", padding: "0.6rem", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(234,179,8,0.15)" }}>
                                  <span style={{ fontSize: "0.68rem", color: "#eab308" }}>진행중</span>
                                  <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#eab308", marginTop: "0.2rem" }}>{progressCount}명</div>
                                </div>
                                <div style={{ background: "rgba(16,185,129,0.06)", padding: "0.6rem", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(16,185,129,0.15)" }}>
                                  <span style={{ fontSize: "0.68rem", color: "#10b981" }}>이수완료</span>
                                  <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#10b981", marginTop: "0.2rem" }}>{completedCount}명</div>
                                </div>
                              </div>
                            </div>

                            {/* 우측: 이수학생 개별 등록 및 엑셀 일괄 업로드 */}
                            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h6 style={{ fontSize: "0.82rem", fontWeight: "800" }}>이수 대장 관리 및 업로드</h6>
                                <button
                                  onClick={downloadResultSample}
                                  style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)", fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.2rem" }}
                                >
                                  <Download size={11} />
                                  엑셀 양식 받기
                                </button>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
                                {/* 개별 등록 폼 */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: "0.75rem" }}>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>개별 학생 등록</span>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "0.3rem" }}>
                                    <input
                                      type="text"
                                      placeholder="학번(9자리)"
                                      value={newStudentId}
                                      onChange={(e) => setNewStudentId(e.target.value)}
                                      style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem", borderRadius: "4px", fontSize: "0.7rem", outline: "none" }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="학생명"
                                      value={newStudentName}
                                      onChange={(e) => setNewStudentName(e.target.value)}
                                      style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem", borderRadius: "4px", fontSize: "0.7rem", outline: "none" }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="학과명"
                                      value={newStudentDept}
                                      onChange={(e) => setNewStudentDept(e.target.value)}
                                      style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem", borderRadius: "4px", fontSize: "0.7rem", outline: "none" }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (!newStudentId || !newStudentName) {
                                        alert("학번과 학생명은 필수 입력 항목입니다.");
                                        return;
                                      }
                                      const exists = studentMasterList.some(s => s.id === newStudentId);
                                      if (exists) {
                                        alert("이미 등록된 학번입니다.");
                                        return;
                                      }
                                      setStudentMasterList([
                                        ...studentMasterList,
                                        {
                                          id: newStudentId,
                                          name: newStudentName,
                                          dept: newStudentDept || "기계공학부",
                                          capstone: "미참여",
                                          pbl: "미참여",
                                          omnibus: "미참여",
                                          ai: "미참여"
                                        }
                                      ]);
                                      setNewStudentId("");
                                      setNewStudentName("");
                                      setNewStudentDept("");
                                    }}
                                    style={{
                                      background: "#10b981",
                                      color: "#fff",
                                      border: "none",
                                      padding: "0.3rem",
                                      borderRadius: "4px",
                                      fontSize: "0.72rem",
                                      cursor: "pointer",
                                      fontWeight: "800",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.2rem",
                                      marginTop: "0.2rem"
                                    }}
                                  >
                                    <Plus size={11} />
                                    학생 신규 추가
                                  </button>
                                </div>

                                {/* 엑셀 업로드 드롭존 */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>엑셀 일괄 업로드</span>
                                  <label
                                    htmlFor="excel-result-uploader"
                                    style={{
                                      border: "1px dashed var(--border-color)",
                                      borderRadius: "6px",
                                      padding: "0.6rem 0.4rem",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      background: "rgba(255,255,255,0.01)",
                                      height: "100%",
                                      gap: "0.25rem",
                                      textAlign: "center"
                                    }}
                                  >
                                    <FileSpreadsheet size={20} style={{ color: "#10b981" }} />
                                    <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)" }}>파일 선택 (.xlsx)</span>
                                    <input
                                      type="file"
                                      id="excel-result-uploader"
                                      accept=".xlsx, .xls"
                                      onChange={handleExcelUpload}
                                      style={{ display: "none" }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 상세 이수학생 리스트 테이블 */}
                          <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-primary)" }}>이수 대장 테이블 명세 (각 유형별 배지를 클릭하면 상태가 토글됩니다)</span>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>조회 대상: {filteredStudents.length}명</span>
                            </div>
                            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                                <thead style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 1 }}>
                                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "rgba(255, 255, 255, 0.9)" }}>
                                    <th style={{ padding: "0.5rem 0.75rem" }}>학번</th>
                                    <th style={{ padding: "0.5rem 0.75rem" }}>이름</th>
                                    <th style={{ padding: "0.5rem 0.75rem" }}>소속 학과</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>캡스톤디자인</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>기업형 PBL</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>옴니버스</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>AI 리터러시</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>종합 상태</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>제거</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => {
                                      const overall = getOverallStatus(student);

                                      const getBadgeStyle = (status: CourseStatus): React.CSSProperties => {
                                        if (status === "이수완료") return { background: "rgba(16,185,129,0.12)", color: "#10b981" };
                                        if (status === "진행중") return { background: "rgba(234,179,8,0.12)", color: "#eab308" };
                                        return { background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" };
                                      };

                                      return (
                                        <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", background: "transparent" }}>
                                          <td style={{ padding: "0.5rem 0.75rem" }}>{student.id}</td>
                                          <td style={{ padding: "0.5rem 0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>{student.name}</td>
                                          <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>{student.dept}</td>

                                          {/* 유형별 이수 상태 토글 배지 */}
                                          {(["capstone", "pbl", "omnibus", "ai"] as CourseStatusKey[]).map((type) => {
                                            const status = student[type] || "미참여";
                                            const badgeStyle = getBadgeStyle(status);
                                            return (
                                              <td key={type} style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                                                <span
                                                  onClick={() => toggleCourseStatus(student.id, type)}
                                                  style={{
                                                    fontSize: "0.62rem",
                                                    padding: "0.15rem 0.4rem",
                                                    borderRadius: "3px",
                                                    fontWeight: "800",
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                    display: "inline-block",
                                                    width: "65px",
                                                    transition: "all 0.15s ease",
                                                    ...badgeStyle
                                                  }}
                                                  title="클릭하여 상태 변경"
                                                 role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                                  {status}
                                                </span>
                                              </td>
                                            );
                                          })}

                                          {/* 종합 이수 상태 */}
                                          <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                                            <span style={{
                                              fontSize: "0.62rem",
                                              padding: "0.15rem 0.4rem",
                                              borderRadius: "3px",
                                              fontWeight: "800",
                                              background: overall === "이수완료" ? "#10b981" : overall === "진행중" ? "#eab308" : "rgba(255,255,255,0.05)",
                                              color: overall === "미참여" ? "var(--text-secondary)" : "#fff",
                                              display: "inline-block",
                                              width: "65px"
                                            }}>
                                              {overall}
                                            </span>
                                          </td>

                                          {/* 제거 버튼 */}
                                          <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                                            <button
                                              onClick={() => {
                                                if (confirm(`${student.name} 학생을 명단에서 제거하시겠습니까?`)) {
                                                  setStudentMasterList(studentMasterList.filter(s => s.id !== student.id));
                                                }
                                              }}
                                              style={{ border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.65rem", padding: "0.15rem 0.35rem", borderRadius: "3px", cursor: "pointer" }}
                                            >
                                              <Trash2 size={11} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                        필터 조건에 부합하는 학생 데이터가 없습니다. 엑셀을 업로드하거나 개별 등록해 주세요.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
}
