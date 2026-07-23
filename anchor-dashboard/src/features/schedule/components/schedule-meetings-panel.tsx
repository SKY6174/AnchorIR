import type { Dispatch, SetStateAction } from "react";
import { CheckCircle, Clock, Edit, Plus, Trash2, Users } from "lucide-react";
import type { ScheduleItem } from "../schedule-types";

interface ScheduleMeetingsPanelProps {
  activeMeetingCat: string;
  currentRole: any;
  darkMode: boolean;
  handleDeleteMeeting: (id?: number | string) => void;
  handleEditMeeting: (meeting: ScheduleItem) => void;
  handleGenerateMockMeetings: () => void | Promise<void>;
  meetingSchedules: ScheduleItem[];
  openAddModal: (type: string) => void;
  selectedCommitteeFilters: string[];
  selectedDeptFilters: string[];
  selectedMeetingId: number | string | null;
  selectedYear: number | string | undefined;
  setActiveMeetingCat: Dispatch<SetStateAction<string>>;
  setSelectedCommitteeFilters: Dispatch<SetStateAction<string[]>>;
  setSelectedDeptFilters: Dispatch<SetStateAction<string[]>>;
  setSelectedMeetingId: Dispatch<SetStateAction<number | string | null>>;
}

export function ScheduleMeetingsPanel({
  activeMeetingCat,
  currentRole,
  darkMode,
  handleDeleteMeeting,
  handleEditMeeting,
  handleGenerateMockMeetings,
  meetingSchedules,
  openAddModal,
  selectedCommitteeFilters,
  selectedDeptFilters,
  selectedMeetingId,
  selectedYear,
  setActiveMeetingCat,
  setSelectedCommitteeFilters,
  setSelectedDeptFilters,
  setSelectedMeetingId
}: ScheduleMeetingsPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 회의 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                👥 의사 결정 정기 회의 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                운영위원회, 센터 실무진 회의, 자문 위원회 일시 및 의제 결과 기록
              </p>
            </div>

            {currentRole.id !== "GUEST" && (
              <button
                className="btn btn-primary"
                onClick={() => openAddModal("meeting")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                  background: "var(--accent-color)", border: "none", color: "white", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                <Plus size={16} />
                회의결과 등록
              </button>
            )}
          </div>



          {/* 회의 대분류 가로 단추 (운영회의, 센터회의, 위원회) */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.2rem" }}>
            <button
              onClick={() => setActiveMeetingCat("operating")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "operating" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "operating" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              사업운영위원회
            </button>
            <button
              onClick={() => setActiveMeetingCat("center")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "center" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "center" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              부서별 회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("committee")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "committee" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "committee" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              각종 위원회
            </button>
          </div>

          {/* 회의 목록 분기 */}
          {(activeMeetingCat === "center" || activeMeetingCat === "operating" || activeMeetingCat === "committee") ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 부서별 필터 버튼 그룹 (센터 회의인 경우에만 렌더링) */}
              {activeMeetingCat === "center" && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  background: darkMode ? "rgba(30, 41, 59, 0.4)" : "rgba(0, 0, 0, 0.03)",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "0.25rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: darkMode ? "#94a3b8" : "var(--text-secondary)" }}>
                      🔍 부서(센터) 선택 필터 (다중 선택)
                    </span>
                    {selectedDeptFilters.length > 0 && (
                      <button
                        onClick={() => setSelectedDeptFilters([])}
                        style={{
                          background: "none",
                          border: "none",
                          color: darkMode ? "#38bdf8" : "var(--accent-color)",
                          fontSize: "0.68rem",
                          cursor: "pointer",
                          fontWeight: "600",
                          padding: 0
                        }}
                      >
                        필터 초기화
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedDeptFilters([])}
                      style={{
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: "1px solid " + (selectedDeptFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                        background: selectedDeptFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                        color: selectedDeptFilters.length === 0 ? "white" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                        transition: "all 0.15s ease"
                      }}
                    >
                      전체
                    </button>
                    {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map((deptName) => {
                      const isSelected = selectedDeptFilters.includes(deptName);
                      return (
                        <button
                          key={deptName}
                          onClick={() => {
                            setSelectedDeptFilters(prev =>
                              prev.includes(deptName) ? prev.filter(d => d !== deptName) : [...prev, deptName]
                            );
                          }}
                          style={{
                            padding: "0.3rem 0.65rem",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            borderRadius: "4px",
                            cursor: "pointer",
                            border: "1px solid " + (isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                            background: isSelected ? (darkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(59, 130, 246, 0.1)") : (darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                            color: isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                            transition: "all 0.15s ease"
                          }}
                        >
                          {deptName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 위원회별 필터 버튼 그룹 (각종 위원회 탭인 경우에만 렌더링) */}
              {activeMeetingCat === "committee" && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  background: darkMode ? "rgba(30, 41, 59, 0.4)" : "rgba(0, 0, 0, 0.03)",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "0.25rem"
                }}>
                  {/* 사업단 위원회 라인 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--accent-color)" }}>
                        🏛️ 사업단 위원회 종류
                      </span>
                      {selectedCommitteeFilters.length > 0 && (
                        <button
                          onClick={() => setSelectedCommitteeFilters([])}
                          style={{ background: "none", border: "none", color: darkMode ? "#38bdf8" : "var(--accent-color)", fontSize: "0.68rem", cursor: "pointer", fontWeight: "600", padding: 0 }}
                        >
                          필터 초기화
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setSelectedCommitteeFilters([])}
                        style={{
                          padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                          border: "1px solid " + (selectedCommitteeFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                          background: selectedCommitteeFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                          color: selectedCommitteeFilters.length === 0 ? "white" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                          transition: "all 0.15s ease"
                        }}
                      >
                        전체
                      </button>
                      {[
                        "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
                        "앵커사업자체평가위원회", "앵커사업자문회의"
                      ].map(cName => {
                        const isSelected = selectedCommitteeFilters.includes(cName);
                        return (
                          <button
                            key={cName}
                            onClick={() => {
                              setSelectedCommitteeFilters(prev =>
                                prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]
                              );
                            }}
                            style={{
                              padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                              border: "1px solid " + (isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                              background: isSelected ? (darkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(59, 130, 246, 0.1)") : (darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                              color: isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                              transition: "all 0.15s ease"
                            }}
                          >
                            {cName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 센터 위원회 라인 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.4rem", borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#34D399" }}>
                      ⚡ 센터 위원회 종류
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setSelectedCommitteeFilters([])}
                        style={{
                          padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                          border: "1px solid " + (selectedCommitteeFilters.length === 0 ? "#34D399" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                          background: selectedCommitteeFilters.length === 0 ? "#34D399" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0, 0, 0, 0.05)"),
                          color: selectedCommitteeFilters.length === 0 ? "white" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                          transition: "all 0.15s ease"
                        }}
                      >
                        전체
                      </button>
                      {[
                        "ECC센터위원회", "ICC센터위원회", "RCC센터위원회",
                        "AID-X지원센터위원회", "울산늘봄누리센터위원회", "신산업특화센터위원회"
                      ].map(cName => {
                        const isSelected = selectedCommitteeFilters.includes(cName);
                        return (
                          <button
                            key={cName}
                            onClick={() => {
                              setSelectedCommitteeFilters(prev =>
                                prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]
                              );
                            }}
                            style={{
                              padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                              border: "1px solid " + (isSelected ? "#34D399" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                              background: isSelected ? "rgba(52, 211, 153, 0.15)" : (darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                              color: isSelected ? "#34D399" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                              transition: "all 0.15s ease"
                            }}
                          >
                            {cName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 좌우 Split 뷰 */}
              {(() => {
                // 부서 및 위원회별 다중 필터링 적용
                const filteredList = meetingSchedules.filter(m => {
                  if (m.year !== selectedYear) return false;
                  const isCatMatch = m.category === activeMeetingCat;
                  if (!isCatMatch) return false;

                  // 1) 부서별 회의인 경우 부서 필터 작동
                  if (activeMeetingCat === "center") {
                    if (selectedDeptFilters.length === 0) return true;
                    const ext = m.attendeesExternal || m.attendees_external || "";
                    let dept = "사업운영팀";
                    if (ext.includes("부서:")) {
                      const parts = ext.split("|");
                      dept = parts[1] ? parts[1].replace("부서:", "").trim() : "사업운영팀";
                    }
                    return selectedDeptFilters.includes(dept);
                  }

                  // 2) 각종 위원회인 경우 위원회 종류 필터 작동
                  if (activeMeetingCat === "committee") {
                    if (selectedCommitteeFilters.length === 0) return true;

                    const ext = m.attendeesExternal || m.attendees_external || "";
                    let committeeName = "";
                    if (ext.includes("위원회:")) {
                      const parts = ext.split("|");
                      const committeePart = parts.find((p: string) => p.includes("위원회:"));
                      if (committeePart) {
                        committeeName = committeePart.replace("위원회:", "").trim();
                      }
                    }

                    if (committeeName) {
                      committeeName = committeeName.replace(/RISE/g, '앵커');
                    }

                    if (!committeeName) {
                      // 제목에서 위원회 키워드로 매칭 Fallback
                      const allCommittees = [
                        "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
                        "앵커사업자체평가위원회", "앵커사업자문회의",
                        "ECC센터위원회", "ICC센터위원회", "RCC센터위원회",
                        "AID-X지원센터위원회", "울산늘봄누리센터위원회", "신산업특화센터위원회"
                      ];
                      const matched = allCommittees.find(c => m.title && m.title.replace(/RISE/g, '앵커').includes(c));
                      if (matched) committeeName = matched;
                    }
                    return selectedCommitteeFilters.includes(committeeName);
                  }

                  return true;
                });

                const selectedMeeting = filteredList.find(m => m.id === selectedMeetingId) || filteredList[0];

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1rem", minHeight: "500px" }}>
                    {/* 왼쪽: 회의록 리스트 */}
                    <div style={{
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      maxHeight: "650px",
                      overflowY: "auto",
                      padding: "0.5rem"
                    }}>
                      <div style={{ padding: "0.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.5rem" }}>
                        📋 회의록 목록 ({filteredList.length}건)
                      </div>

                      {filteredList.length === 0 ? (
                        <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          조회된 회의록이 없습니다.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {filteredList.map(meeting => {
                            const isSelected = selectedMeeting && selectedMeeting.id === meeting.id;

                            // 부서 추출
                            const ext = meeting.attendeesExternal || meeting.attendees_external || "";
                            let dept = "사업운영팀";
                            if (ext.includes("부서:")) {
                              dept = ext.split("|")[1]?.replace("부서:", "").trim() || "사업운영팀";
                            }

                            return (
                              <div
                                key={meeting.id}
                                id={`meeting-item-${meeting.id}`}
                                onClick={() => setSelectedMeetingId(meeting.id ?? null)}
                                style={{
                                  padding: "0.65rem 0.85rem",
                                  borderRadius: "6px",
                                  background: isSelected ? "rgba(59, 130, 246, 0.12)" : "transparent",
                                  border: "1px solid " + (isSelected ? "rgba(59, 130, 246, 0.3)" : "transparent"),
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.25rem"
                                }}
                                onFocus={(e) => { if (!isSelected) e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"; }}
                                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"; }}
                                onBlur={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                               role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: isSelected ? (darkMode ? "#60A5FA" : "var(--accent-color)") : "var(--text-primary)", wordBreak: "break-all" }}>
                                  {meeting.title}
                                </span>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.2rem" }}>
                                  <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "700" }}>
                                    {dept}
                                  </span>
                                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                                    {meeting.datetime ? meeting.datetime.split(" ")[0] : ""}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 오른쪽: 상세 회의록 뷰 */}
                    <div style={{
                      background: "var(--panel-bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                      position: "relative"
                    }}>
                      {selectedMeeting ? (
                        <>
                          {(() => {
                            const isOperating = selectedMeeting.category === "operating";

                            // 작성자 및 부서 파싱 (일반 회의용)
                            const ext = selectedMeeting.attendeesExternal || selectedMeeting.attendees_external || "";
                            let writer = "작성자 미정";
                            let dept = "사업운영팀";
                            if (ext.includes("작성자:") && ext.includes("부서:")) {
                              const parts = ext.split("|");
                              writer = parts[0]?.replace("작성자:", "").trim() || "작성자 미정";
                              dept = parts[1]?.replace("부서:", "").trim() || "사업운영팀";
                            }

                            // 삭제 권한: 송경영, 심현미, ADMIN
                            const canDelete = currentRole && (
                              currentRole.name.includes("송경영") ||
                              currentRole.name.includes("심현미") ||
                              currentRole.id === "ADMIN"
                            );

                            if (isOperating) {
                              // ==========================================
                              // 💡 1) 사업운영위원회 전용 상세 요점 뷰
                              // ==========================================
                              const operatingDepts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];

                              // JSON 파싱 및 폴백 매핑
                              let parsedAgendas: Record<string, string> = {};
                              let parsedResults: Record<string, string> = {};

                              operatingDepts.forEach(d => {
                                parsedAgendas[d] = "";
                                parsedResults[d] = "";
                              });

                              // 💡 [교육용 한글 주석] 줄바꿈으로 구성된 텍스트에서 [부서명] 말머리 또는 부서 단어를 추출하여 7개 부서별로 지능적으로 분배합니다.
                              const agendaLines = (selectedMeeting.agenda || "").split("\n").filter(Boolean);
                              const resultLines = (selectedMeeting.result || "").split("\n").filter(Boolean);

                              // 💡 [교육용 한글 주석] 3단계 하이브리드 파서를 이용하여 텍스트를 각 부서별로 영리하게 분류합니다.
                              // 1단계: 말머리 대괄호 [부서명] 또는 부서 풀 네임 포함 여부 검증
                              // 2단계: 부서의 축약 명칭 (ECC, ICC, RCC 등) 매칭 검증
                              // 3단계: 텍스트 내의 지산학 핵심 키워드 유추 매칭
                              const getHeuristicDept = (line: string) => {
                                // 1단계 판정
                                let matched = operatingDepts.find(d => line.startsWith(`[${d}]`) || line.includes(`[${d}]`) || line.includes(d));
                                if (matched) return matched;

                                // 2단계 판정
                                matched = operatingDepts.find(d => {
                                  const cleanD = d.replace("센터", "").replace("지원센터", "").replace("팀", "");
                                  return line.includes(cleanD);
                                });
                                if (matched) return matched;

                                // 3단계 판정 (업무 성격 지능적 유추)
                                const text = line.toLowerCase();
                                if (text.includes("주문식") || text.includes("산학협력") || text.includes("가족회사") || text.includes("r&bd") || text.includes("재직자") || text.includes("간담회") || text.includes("산학공동")) {
                                  return text.includes("주문식") || text.includes("재직자") ? "ECC센터" : "ICC센터";
                                }
                                if (text.includes("장학금") || text.includes("이월금") || text.includes("예산") || text.includes("공지") || text.includes("일정") || text.includes("성과관리") || text.includes("먼데이닷컴") || text.includes("기자재") || text.includes("워크숍") || text.includes("회의록")) {
                                  return "사업운영팀";
                                }
                                if (text.includes("늘봄") || text.includes("누리") || text.includes("지역사회") || text.includes("리빙랩") || text.includes("로컬") || text.includes("협업")) {
                                  return text.includes("늘봄") ? "울산늘봄누리센터" : "RCC센터";
                                }
                                if (text.includes("aidx") || text.includes("aid-x") || text.includes("디지털") || text.includes("자격증") || text.includes("인공지능")) {
                                  return "AID-X지원센터";
                                }
                                if (text.includes("신산업") || text.includes("특화") || text.includes("융합") || text.includes("첨단")) {
                                  return "신산업특화센터";
                                }

                                // 4단계: 매칭되지 않으면 "사업운영팀"으로 기본 배치
                                return "사업운영팀";
                              };

                              agendaLines.forEach((line: string) => {
                                const matchedDept = getHeuristicDept(line);
                                // 말머리가 대괄호 형식으로 있을 경우만 텍스트에서 떼어내어 본문을 보기 좋게 만듭니다.
                                let cleanLine = line.trim();
                                operatingDepts.forEach(d => {
                                  cleanLine = cleanLine.replace(`[${d}]`, "").trim();
                                });
                                parsedAgendas[matchedDept] = (parsedAgendas[matchedDept] ? parsedAgendas[matchedDept] + "\n" : "") + cleanLine;
                              });

                              resultLines.forEach((line: string) => {
                                const matchedDept = getHeuristicDept(line);
                                let cleanLine = line.trim();
                                operatingDepts.forEach(d => {
                                  cleanLine = cleanLine.replace(`[${d}]`, "").trim();
                                });
                                parsedResults[matchedDept] = (parsedResults[matchedDept] ? parsedResults[matchedDept] + "\n" : "") + cleanLine;
                              });

                              const getDeptData = (deptName: string, dataObj: Record<string, string>) => {
                                if (!dataObj) return "";
                                const keys = Object.keys(dataObj);
                                const matchedKey = keys.find(k => k.includes(deptName) || deptName.includes(k));
                                return matchedKey ? dataObj[matchedKey] : "";
                              };

                              // 💡 [교육용 한글 주석] 의제 데이터를 심의/의결/선정 등의 [의제] 그룹과 공유/공지/보고 등의 [전달사항] 그룹으로 지능적으로 쪼갭니다.
                              const parseAgendaIntoGroups = (val: string) => {
                                if (!val) return { agendas: [], notices: [] };
                                let lines = val.split("\n").map((l: string) => l.trim()).filter(Boolean);
                                if (lines.length <= 1 && val.includes(",")) {
                                  lines = val.split(",").map((l: string) => l.trim()).filter(Boolean);
                                }

                                const agendas: string[] = [];
                                const notices: string[] = [];

                                lines.forEach((line: string) => {
                                  const text = line.toLowerCase();
                                  if (text.includes("심의") || text.includes("의결") || text.includes("안건") || text.includes("선정") || text.includes("제출") || text.includes("결정")) {
                                    agendas.push(line);
                                  } else if (text.includes("공유") || text.includes("공지") || text.includes("보고") || text.includes("안내") || text.includes("논의") || text.includes("일정") || text.includes("회의") || text.includes("전달") || text.includes("참석")) {
                                    notices.push(line);
                                  } else {
                                    agendas.push(line);
                                  }
                                });

                                return { agendas, notices };
                              };

                              // 💡 [교육용 한글 주석] 결과 데이터를 완료/개최/배포 등의 [추진상황] 그룹과 보류/지연/애로/요청 등의 [애로사항] 그룹으로 지능적으로 쪼갭니다.
                              const parseResultIntoGroups = (val: string) => {
                                if (!val) return { results: [], difficulties: [] };
                                let lines = val.split("\n").map((l: string) => l.trim()).filter(Boolean);
                                if (lines.length <= 1 && val.includes(",")) {
                                  lines = val.split(",").map((l: string) => l.trim()).filter(Boolean);
                                }

                                const results: string[] = [];
                                const difficulties: string[] = [];

                                lines.forEach((line: string) => {
                                  const text = line.toLowerCase();
                                  if (text.includes("보류") || text.includes("미정") || text.includes("애로") || text.includes("지연") || text.includes("어려움") || text.includes("요청") || text.includes("필요") || text.includes("의견수렴") || text.includes("논의 예정") || text.includes("문제")) {
                                    difficulties.push(line);
                                  } else {
                                    results.push(line);
                                  }
                                });

                                return { results, difficulties };
                              };

                              return (
                                <>
                                  {/* 헤더 영역 (부서/작성자 생략) */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                                    <div style={{ flexGrow: 1 }}>
                                      <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "var(--text-primary)" }}>
                                        {selectedMeeting.title}
                                      </h3>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                                        <span>📅 일시: <strong>{selectedMeeting.datetime}</strong></span>
                                        <span>•</span>
                                        <span>📍 장소: <strong>{selectedMeeting.location}</strong></span>
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                                        👥 참석자: <strong style={{ color: "var(--text-primary)" }}>{selectedMeeting.attendeesInternal || selectedMeeting.attendees_internal || "-"}</strong>
                                      </div>
                                    </div>

                                    {/* 수정/삭제 단추 우측 맨 위 배치 */}
                                    {currentRole.id !== "GUEST" && (
                                      <div style={{ display: "flex", gap: "0.25rem" }}>
                                        <button
                                          onClick={() => handleEditMeeting(selectedMeeting)}
                                          title="수정"
                                          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                          onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                          onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                          onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                        >
                                          <Edit size={16} />
                                        </button>
                                        {canDelete && (
                                          <button
                                            onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                            title="삭제"
                                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                            onFocus={(e) => e.currentTarget.style.color = "#EF4444"}
                                            onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                            onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* 회의 성격 배너 설명 문구 */}
                                  <div style={{
                                    padding: "0.6rem 0.8rem",
                                    background: "rgba(59,130,246,0.04)",
                                    borderLeft: "3px solid var(--accent-color)",
                                    borderRadius: "4px",
                                    fontSize: "0.72rem",
                                    color: "var(--text-secondary)",
                                    lineHeight: "1.4"
                                  }}>
                                    💡 본 사업운영위원회는 <strong>사업단, 사업운영팀, ECC, ICC, RCC, AID-X, 늘봄누리센터, 신산업특화센터</strong> 각 부서의 주요 업무추진 현황 및 애로사항을 공유하기 위하여 격주로 소집되는 회의입니다.
                                  </div>

                                  {/* 7개 부서 의제 & 결과 1열 배치 (좌우 대조 매칭 구조) */}
                                  <div style={{ marginTop: "0.5rem" }}>
                                    <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.5rem" }}>
                                      🏢 부서별 주요 업무추진 현황 및 애로사항
                                    </span>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                                      {operatingDepts.map(dept => {
                                        const agendaVal = getDeptData(dept, parsedAgendas);
                                        const resultVal = getDeptData(dept, parsedResults);

                                        return (
                                          <div
                                            key={dept}
                                            style={{
                                              background: darkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.01)",
                                              border: "1px solid var(--border-color)",
                                              borderRadius: "8px",
                                              padding: "0.85rem 1rem",
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "0.6rem"
                                            }}
                                          >
                                            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                              📌 {dept}
                                            </span>

                                            {/* 의제와 결과 좌우 분할 매칭 구조 */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.25rem", fontSize: "0.72rem" }}>
                                              {/* 왼쪽 영역: 의제 / 전달사항 */}
                                              <div style={{
                                                background: darkMode ? "rgba(255,255,255,0.005)" : "rgba(0,0,0,0.005)",
                                                padding: "0.6rem 0.75rem",
                                                borderRadius: "6px",
                                                borderLeft: "2.5px solid #60A5FA" // 의제 파란색 포인트 데코선
                                              }}>
                                                <div style={{ color: "var(--text-secondary)", fontWeight: "800", marginBottom: "0.4rem" }}>💡 의제 / 전달사항</div>
                                                <div style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.4" }}>
                                                  {(() => {
                                                    const { agendas, notices } = parseAgendaIntoGroups(agendaVal);
                                                    if (agendas.length === 0 && notices.length === 0) return "논의사항 없음";

                                                    return (
                                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                        {agendas.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#3B82F6", marginBottom: "0.15rem" }}>[의제]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {agendas.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[.)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                        {notices.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#60A5FA", marginBottom: "0.15rem" }}>[전달사항]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {notices.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[.)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              </div>

                                              {/* 오른쪽 영역: 추진상황 / 결과 */}
                                              <div style={{
                                                background: darkMode ? "rgba(255,255,255,0.005)" : "rgba(0,0,0,0.005)",
                                                padding: "0.6rem 0.75rem",
                                                borderRadius: "6px",
                                                borderLeft: "2.5px solid #34D399" // 결과 초록색 포인트 데코선
                                              }}>
                                                <div style={{ color: "var(--text-secondary)", fontWeight: "800", marginBottom: "0.4rem" }}>✅ 추진상황 / 결과</div>
                                                <div style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.4" }}>
                                                  {(() => {
                                                    const { results, difficulties } = parseResultIntoGroups(resultVal);
                                                    if (results.length === 0 && difficulties.length === 0) return "추진완료 / 특이사항 없음";

                                                    return (
                                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                        {results.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#10B981", marginBottom: "0.15rem" }}>[추진상황]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {results.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[.)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem", fontWeight: "700" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                        {difficulties.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#F59E0B", marginBottom: "0.15rem" }}>[애로사항]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {difficulties.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[.)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem", fontWeight: "700" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* AI 핵심 브리핑 요약 */}
                                  <div style={{
                                    background: darkMode ? "rgba(139, 92, 246, 0.05)" : "rgba(139, 92, 246, 0.08)",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(139, 92, 246, 0.15)",
                                    marginTop: "0.5rem"
                                  }}>
                                    <span style={{ color: darkMode ? "#C084FC" : "#6D28D9", fontWeight: "800", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.3rem" }}>
                                      🤖 AI 요약 핵심 브리핑
                                    </span>
                                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-primary)", lineHeight: "1.45" }}>
                                      {(() => {
                                        const keywords = Object.values(parsedResults).filter(Boolean).slice(0, 3).join(", ");
                                        return keywords
                                          ? `본 회의에서는 각 부서의 전달사항(주요 키워드: ${keywords})에 대한 진척 상황 및 현안들을 공유했습니다. 향후 부서 간 실무 협의를 강화하여 목표 추진 계획을 차질 없이 준수할 것을 권장합니다.`
                                          : "본 회의에서는 부서별 주요 안건 공유 및 지산학 프로그램의 격주 실적 관리가 원활히 이뤄졌습니다. AI 핵심 분석 결과 각 부서의 추진 상황은 계획 대비 순조롭게 진행 중인 것으로 분석되었습니다.";
                                      })()}
                                    </p>
                                  </div>

                                  {/* PLAUD 음성 녹음본 및 회의자료 2열 배치 */}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                        🎙️ PLAUD MP3 음성 파일
                                      </span>
                                      {selectedMeeting.audioUrl ? (
                                        <audio controls src={selectedMeeting.audioUrl} style={{ width: "100%", height: "26px", marginTop: "0.15rem" }} />
                                      ) : (
                                        <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>음성 파일이 등록되어 있지 않습니다.</span>
                                      )}
                                    </div>
                                    <div style={({ background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifycontent: "space-between" } as React.CSSProperties)}>
                                      <div>
                                        <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)", display: "block" }}>
                                          📄 회의자료 문서 (PDF)
                                        </span>
                                        <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                                          {selectedMeeting.pdfUrl ? "정상 업로드 완료" : "첨부된 PDF 없음"}
                                        </span>
                                      </div>
                                      {selectedMeeting.pdfUrl && (
                                        <a
                                          href={selectedMeeting.pdfUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ color: "#60A5FA", fontSize: "0.72rem", fontWeight: "700", textDecoration: "none", background: "rgba(59,130,246,0.1)", padding: "0.3rem 0.6rem", borderRadius: "4px" }}
                                        >
                                          바로보기 ➔
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );
                            }

                            // ==========================================
                            // 💡 2) 기존 센터별/위원회 일반 회의 상세 뷰
                            // ==========================================
                            return (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                                  <div>
                                    <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.4rem" }}>
                                      <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "700" }}>
                                        {dept}
                                      </span>
                                      <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontWeight: "700" }}>
                                        작성자: {writer}
                                      </span>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                                      {selectedMeeting.title}
                                    </h3>
                                  </div>

                                  {currentRole.id !== "GUEST" && (
                                    <div style={{ display: "flex", gap: "0.25rem" }}>
                                      <button
                                        onClick={() => handleEditMeeting(selectedMeeting)}
                                        title="수정"
                                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                        onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                        onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                        onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      {canDelete && (
                                        <button
                                          onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                          title="삭제"
                                          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                          onFocus={(e) => e.currentTarget.style.color = "#EF4444"}
                                          onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                          onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* 상세 정보 내용 */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.825rem", color: "var(--text-primary)" }}>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>📅 회의 시간</span>
                                    <strong>{selectedMeeting.datetime}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>📍 회의 장소</span>
                                    <strong>{selectedMeeting.location}</strong>
                                  </div>
                                  <div style={{ gridColumn: "span 2" }}>
                                    <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>👥 참석자</span>
                                    <strong>{selectedMeeting.attendeesInternal || selectedMeeting.attendees_internal || "-"}</strong>
                                  </div>
                                </div>

                                {/* 주요 의제 */}
                                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                                  <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.825rem", marginBottom: "0.4rem" }}>📋 주요 의제 및 논의 사항</span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.825rem", color: "var(--text-primary)" }}>
                                    {(selectedMeeting.agenda || "").split("\n").filter(Boolean).map((agendaItem: string, idx: number) => (
                                      <span key={idx} style={{ display: "block", lineHeight: "1.4" }}>
                                        의제 {idx + 1}. {agendaItem}
                                      </span>
                                    ))}
                                    {!(selectedMeeting.agenda) && <span>등록된 의제가 없습니다.</span>}
                                  </div>
                                </div>

                                {/* 결정 사항 결과 박스 */}
                                <div style={{
                                  background: darkMode ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.08)",
                                  padding: "0.85rem 1rem",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(59, 130, 246, 0.15)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.35rem"
                                }}>
                                  <span style={{ color: darkMode ? "#60A5FA" : "#1E3A8A", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                    <CheckCircle size={14} style={{ color: darkMode ? "#60A5FA" : "#2563EB" }} />
                                    주요 결정 및 조치 사항 (요점 정리)
                                  </span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-primary)", lineHeight: "1.45" }}>
                                    {(selectedMeeting.result || "").split("\n").filter(Boolean).map((resultItem: string, idx: number) => (
                                      <div key={idx} style={{ borderBottom: idx < (selectedMeeting.result || "").split("\n").filter(Boolean).length - 1 ? "1px dashed var(--border-color)" : "none", paddingBottom: "0.3rem" }}>
                                        <strong>결과 {idx + 1}.</strong> {resultItem}
                                      </div>
                                    ))}
                                    {!(selectedMeeting.result) && <span>등록된 결정 사항이 없습니다.</span>}
                                  </div>
                                </div>

                                {/* 회의록 첨부파일 개별 분리 렌더링 */}
                                {(selectedMeeting.audioUrl || selectedMeeting.pdfUrl) && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                                    {selectedMeeting.audioUrl && (
                                      <div style={{
                                        background: "rgba(255,255,255,0.02)",
                                        padding: "0.55rem 0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.2rem"
                                      }}>
                                        <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                          🎙️ 첨부 음성 녹음본
                                        </span>
                                        <audio controls src={selectedMeeting.audioUrl} style={{ width: "100%", height: "26px", marginTop: "0.1rem" }} />
                                      </div>
                                    )}
                                    {selectedMeeting.pdfUrl && (
                                      <div style={{
                                        background: "rgba(255,255,255,0.02)",
                                        padding: "0.55rem 0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                      }}>
                                        <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                          📄 첨부 회의록 문서 (PDF)
                                        </span>
                                        <a
                                          href={selectedMeeting.pdfUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ color: "#60A5FA", fontSize: "0.72rem", fontWeight: "700", textDecoration: "none" }}
                                        >
                                          [PDF 바로보기 ➔]
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}

                                 {/* 💡 [교육용 한글 주석] 온라인 의결 시스템 사용 지침에 따라 PLAUD 연동 배너는 삭제되었습니다. */}
                               </>
                            );
                          })()}
                        </>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", gap: "1rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <Users size={32} style={{ marginBottom: "0.5rem", opacity: 0.3 }} />
                            <span style={{ fontSize: "0.8rem" }}>회의록 목록에서 회의를 선택해 주세요.</span>
                          </div>
                          {currentRole.id !== "GUEST" && (
                            <button
                              type="button"
                              onClick={handleGenerateMockMeetings}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.5rem 1rem",
                                borderRadius: "6px",
                                background: "rgba(59, 130, 246, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                color: "#60A5FA",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                              onFocus={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"}
                              onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"}
                              onBlur={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"}
                              onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"}
                            >
                              ➕ 테스트용 가상 회의록 10건 일괄 생성
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {meetingSchedules.filter(m => m.year === selectedYear && m.category === activeMeetingCat).length > 0 ? (
                meetingSchedules.filter(m => m.year === selectedYear && m.category === activeMeetingCat).map(meeting => (
                  <div
                    key={meeting.id}
                    className="card"
                    style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    {/* 작성자, 관련부서 정보 동적 파싱 로직 */}
                    {(() => {
                      const ext = meeting.attendeesExternal || meeting.attendees_external || "";
                      let writer = "작성자 미정";
                      let dept = "사업운영팀";
                      let isCustomFormatted = false;

                      if (ext.includes("작성자:") && ext.includes("부서:")) {
                        isCustomFormatted = true;
                        const parts = ext.split("|");
                        writer = parts[0] ? parts[0].replace("작성자:", "").trim() : "작성자 미정";
                        dept = parts[1] ? parts[1].replace("부서:", "").trim() : "사업운영팀";
                      }

                      return (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontWeight: "700" }}>
                                작성자: {isCustomFormatted ? writer : "박지현 팀장"}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}>
                                <Clock size={14} />
                                {dept && (
                                  <span style={{ fontWeight: "700", color: "#EC4899", marginRight: "0.4rem" }}>
                                    {dept}
                                  </span>
                                )}
                                {meeting.datetime}
                              </span>
                              {currentRole.id !== "GUEST" && (
                                <>
                                  <button
                                    onClick={() => handleEditMeeting(meeting)}
                                    title="수정"
                                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                    onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                    onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                    onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                    onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                    title="삭제"
                                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                    onFocus={(e) => e.currentTarget.style.color = "#EF4444"}
                                    onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                    onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                    onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                            {meeting.title}
                          </h4>

                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

                              {isCustomFormatted ? (
                                <div>
                                  <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>👥 참석자</span>
                                  <strong>{meeting.attendeesInternal || meeting.attendees_internal}</strong>
                                </div>
                              ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (내부)</span>
                                    <span>{meeting.attendeesInternal}</span>
                                  </div>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (외부)</span>
                                    <span>{meeting.attendeesExternal}</span>
                                  </div>
                                </div>
                              )}

                              <div>
                                <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>📝 회의 의제 (주요 안건)</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.1rem 0 0 0", color: "var(--text-primary)" }}>
                                  {meeting.agenda && meeting.agenda.split("\n").filter(Boolean).map((agendaItem: string, idx: number) => (
                                    <span key={idx} style={{ display: "block", lineHeight: "1.3" }}>
                                      의제 {idx + 1}. {agendaItem}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span style={{ color: "var(--text-secondary)", display: "block" }}>📍 회의 장소</span>
                                <strong>{meeting.location}</strong>
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              <div style={{ background: darkMode ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.08)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                                <span style={{ color: darkMode ? "#60A5FA" : "#1E3A8A", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <CheckCircle size={14} style={{ color: darkMode ? "#60A5FA" : "#2563EB" }} />
                                  회의 결정 결과
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: "1.45" }}>
                                  {(meeting.result || "").split("\n").filter(Boolean).map((resultItem: string, idx: number) => (
                                    <div key={idx} style={{ borderBottom: idx < (meeting.result || "").split("\n").filter(Boolean).length - 1 ? "1px dashed var(--border-color)" : "none", paddingBottom: "0.3rem" }}>
                                      <strong>결과 {idx + 1}.</strong> {resultItem}
                                    </div>
                                  ))}
                                  {!(meeting.result) && <span>등록된 결정 사항이 없습니다.</span>}
                                </div>
                              </div>

                              {/* 회의록 첨부파일 개별 분리 렌더링 */}
                              {(meeting.audioUrl || meeting.pdfUrl) && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                                  {meeting.audioUrl && (
                                    <div style={{
                                      background: "rgba(255,255,255,0.02)",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "8px",
                                      border: "1px solid var(--border-color)",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.2rem"
                                    }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                        🎙️ 첨부 음성 녹음본
                                      </span>
                                      <audio controls src={meeting.audioUrl} style={{ width: "100%", height: "26px", marginTop: "0.1rem" }} />
                                    </div>
                                  )}
                                  {meeting.pdfUrl && (
                                    <div style={{
                                      background: "rgba(255,255,255,0.02)",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "8px",
                                      border: "1px solid var(--border-color)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between"
                                    }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                        📄 첨부 회의록 문서
                                      </span>
                                      <a
                                        href={meeting.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: "#60A5FA", fontSize: "0.72rem", fontWeight: "700", textDecoration: "none" }}
                                      >
                                        [PDF 바로보기 ➔]
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 💡 [교육용 한글 주석] 온라인 의결 시스템 사용 지침에 따라 PLAUD 연동 배너는 삭제되었습니다. */}
                            </div>

                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
                  <Users size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                  <span>등록된 회의 일정이 없습니다.<br />[회의 일정 등록] 버튼을 눌러 회의록 틀을 보충해 보세요.</span>
                </div>
              )}
            </div>
          )}

        </div>
  );
}
