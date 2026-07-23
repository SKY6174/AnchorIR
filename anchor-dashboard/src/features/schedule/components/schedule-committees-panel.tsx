import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { CheckCircle, Download, Edit, Info, Plus, Trash2, Upload, Users } from "lucide-react";
import { dotToDashDate, getCommitteeIcon } from "../data/schedule-committee-data";
import type { ScheduleCommitteeMember } from "../schedule-types";
import { sortMembersByRole } from "../utils/schedule-member-utils";

interface ScheduleCommitteesPanelProps {
  activeCommitteeDetailTab: string;
  committees: any[];
  darkMode: boolean;
  handleDeleteMember: (memberId: number | string | undefined) => void | Promise<void>;
  handleDownloadExcelFormat: () => void | Promise<void>;
  handleExcelDownload: () => void | Promise<void>;
  handleExcelUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  hasCommitteeEditPermission: boolean;
  selectedCommitteeGroup: string;
  selectedCommitteeId: string;
  setActiveCommitteeDetailTab: Dispatch<SetStateAction<string>>;
  setEditingMember: Dispatch<SetStateAction<ScheduleCommitteeMember | null>>;
  setIsMemberModalOpen: Dispatch<SetStateAction<boolean>>;
  setMemberFormData: Dispatch<SetStateAction<any>>;
  setSelectedCommitteeGroup: Dispatch<SetStateAction<string>>;
  setSelectedCommitteeId: Dispatch<SetStateAction<string>>;
}

export function ScheduleCommitteesPanel({
  activeCommitteeDetailTab,
  committees,
  darkMode,
  handleDeleteMember,
  handleDownloadExcelFormat,
  handleExcelDownload,
  handleExcelUpload,
  hasCommitteeEditPermission,
  selectedCommitteeGroup,
  selectedCommitteeId,
  setActiveCommitteeDetailTab,
  setEditingMember,
  setIsMemberModalOpen,
  setMemberFormData,
  setSelectedCommitteeGroup,
  setSelectedCommitteeId
}: ScheduleCommitteesPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 상단 안내 배너 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={20} style={{ color: "var(--accent-color)" }} />
                🏛️ 앵커 사업단 의사결정 거버넌스 (위원회 관리)
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                울산과학대학교 앵커 사업의 성공을 위한 최고 의사결정 기구 및 핵심 실무/평가 위원회 종합 현황
              </p>
            </div>
          </div>



          {/* subsub 탭 버튼 그룹 */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            <button
              onClick={() => setSelectedCommitteeGroup("agency")}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: selectedCommitteeGroup === "agency" ? "800" : "500",
                color: selectedCommitteeGroup === "agency" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: selectedCommitteeGroup === "agency" ? "2px solid var(--accent-color)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              💼 사업단 위원회
            </button>
            <button
              onClick={() => setSelectedCommitteeGroup("center")}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: selectedCommitteeGroup === "center" ? "800" : "500",
                color: selectedCommitteeGroup === "center" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: selectedCommitteeGroup === "center" ? "2px solid var(--accent-color)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              🏢 센터별 운영위원회
            </button>
          </div>

          {/* 메인 레이아웃: 좌측 목록 + 우측 상세 (minmax 가드로 5개 위원회 비율 100% 일치 구현) */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 7fr)", gap: "1.5rem" }}>

            {/* 좌측: 위원회 카드 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {committees
                .filter(comm => selectedCommitteeGroup === "agency"
                  ? ["total", "planning", "budget", "evaluation", "advisory"].includes(comm.id)
                  : ["ecc_op", "icc_op", "rcc_op", "aidx_op", "neulbom_op", "newind_op"].includes(comm.id)
                )
                .map((comm) => {
                  const isSelected = selectedCommitteeId === comm.id;
                  return (
                    <div
                      key={comm.id}
                      onClick={() => setSelectedCommitteeId(comm.id)}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(255, 255, 255, 0.04)" : "var(--panel-bg)",
                        border: isSelected ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                        boxShadow: isSelected ? "0 4px 20px rgba(236, 72, 153, 0.15)" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      className="committee-item-card"
                     role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                      {/* 상단 그라데이션 좌측 사이드바 */}
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        background: comm.color
                      }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", paddingLeft: "0.5rem" }}>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "900", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ color: isSelected ? "var(--accent-color)" : "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                            {getCommitteeIcon(comm.id)}
                          </span>
                          {comm.name}
                        </h4>
                        <span style={{
                          fontSize: "0.65rem",
                          fontWeight: "900",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          background: isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                          color: isSelected ? "white" : "var(--text-secondary)",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}>
                          {comm.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", paddingLeft: "0.5rem" }}>
                        {comm.purpose}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* 우측: 5대 위원회 상세 정보 */}
            {(() => {
              const activeComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];
              return (
                <div className="card" style={{
                  background: "var(--panel-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "450px"
                }}>
                  {/* 상세 헤더 영역 (위원회별 고유 그라데이션) */}
                  <div style={{
                    padding: "1.5rem",
                    background: activeComm.color,
                    borderRadius: "9px 9px 0 0",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: "900",
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        textTransform: "uppercase"
                      }}>
                        {activeComm.badge}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>
                        ⏱️ 주기: {activeComm.cycle}
                      </span>
                    </div>
                    <h3 style={{ margin: "0.75rem 0 0.25rem 0", color: "white", fontSize: "1.3rem", fontWeight: "900" }}>
                      {activeComm.name}
                    </h3>
                  </div>

                  {/* 세부 탭 선택 바 */}
                  <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                    <button
                      onClick={() => setActiveCommitteeDetailTab("members")}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: activeCommitteeDetailTab === "members" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: activeCommitteeDetailTab === "members" ? "2px solid var(--accent-color)" : "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      👥 위원 명단
                    </button>
                    <button
                      onClick={() => setActiveCommitteeDetailTab("purpose")}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: activeCommitteeDetailTab === "purpose" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: activeCommitteeDetailTab === "purpose" ? "2px solid var(--accent-color)" : "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      📋 위원회 운영 목적 & 기능
                    </button>
                  </div>

                  {/* 상세 탭 콘텐츠 */}
                  <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {activeCommitteeDetailTab === "members" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                        {/* 명단 상단 제어 바 (총 위원수 + 명단 편집 추가 버튼) */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", flexWrap: "wrap", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                            총 {(activeComm.members || []).length}명의 위원 등록됨
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            {/* 엑셀 서식 다운로드 버튼 */}
                            <button
                              type="button"
                              onClick={handleDownloadExcelFormat}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                borderRadius: "9999px",
                                background: darkMode ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.06)",
                                border: "1px solid #8b5cf6",
                                color: "#8b5cf6",
                                fontSize: "0.78rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: "none"
                              }}
                              className="hover-opacity"
                              title="위원 일괄 등록용 엑셀(CSV) 양식 서식을 다운로드합니다."
                            >
                              <Download size={13} />
                              엑셀 서식
                            </button>

                            {/* 엑셀 업로드 버튼 */}
                            <button
                              type="button"
                              onClick={() => document.getElementById("excel-upload-input-file")?.click()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                borderRadius: "9999px",
                                background: darkMode ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.06)",
                                border: "1px solid #10b981",
                                color: "#10b981",
                                fontSize: "0.78rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: "none"
                              }}
                              className="hover-opacity"
                              title="엑셀(.xlsx) 서식을 선택하여 위원들을 일괄 업로드합니다."
                            >
                              <Upload size={13} />
                              엑셀 업로드
                            </button>
                            <input
                              id="excel-upload-input-file"
                              type="file"
                              accept=".xlsx, .xls"
                              onChange={handleExcelUpload}
                              style={{ display: "none" }}
                            />

                            {/* 엑셀 다운로드 버튼 */}
                            <button
                              type="button"
                              onClick={handleExcelDownload}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                borderRadius: "9999px",
                                background: darkMode ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.06)",
                                border: "1px solid #8b5cf6",
                                color: "#8b5cf6",
                                fontSize: "0.78rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: "none"
                              }}
                              className="hover-opacity"
                              title="현재 위원 명단을 엑셀(CSV)로 다운로드합니다."
                            >
                              <Download size={13} />
                              엑셀 다운로드
                            </button>

                            {/* 신규 등록 버튼 (위원 추가) */}
                            {hasCommitteeEditPermission && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMember(null);
                                  setMemberFormData({
                                    type: "위원",
                                    name: "",
                                    org: "울산과학대학교",
                                    dept: "",
                                    rank: "",
                                    location: "교내",
                                    term: "",
                                    termStart: "",
                                    termEnd: "",
                                    note: ""
                                  });
                                  setIsMemberModalOpen(true);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  padding: "0.42rem 1.05rem",
                                  borderRadius: "9999px",
                                  background: "#3b82f6",
                                  border: "none",
                                  color: "#fff",
                                  fontSize: "0.78rem",
                                  fontWeight: "800",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
                                  transition: "all 0.15s ease",
                                  outline: "none"
                                }}
                                className="hover-opacity"
                              >
                                <Plus size={13} />
                                신규 등록
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 위원 테이블 (가로/세로 오버플로우 가드 장착) */}
                        {activeComm.members && activeComm.members.length > 0 ? (
                          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", maxHeight: "350px" }} className="custom-scrollbar">
                            <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "60px", whiteSpace: "nowrap" }}>구분</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "85px", whiteSpace: "nowrap" }}>성명</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "140px", whiteSpace: "nowrap" }}>소속기관</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "160px", whiteSpace: "nowrap" }}>부서/학과</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "80px", whiteSpace: "nowrap" }}>직위</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "70px", textAlign: "center", whiteSpace: "nowrap" }}>교내외</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>비고</th>
                                  {hasCommitteeEditPermission && <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "60px", textAlign: "right", whiteSpace: "nowrap" }}>제어</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {sortMembersByRole(activeComm.members).map((member) => (
                                  <tr
                                    key={member.id}
                                    style={{
                                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                                      color: "var(--text-primary)",
                                      background: member.type === "위원장" ? "rgba(236, 72, 153, 0.03)" : "transparent"
                                    }}
                                    className="table-row-hover"
                                  >
                                    <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                                      <span style={{
                                        padding: "0.15rem 0.4rem",
                                        borderRadius: "4px",
                                        fontSize: "0.68rem",
                                        fontWeight: "800",
                                        background: member.type === "위원장" ? "rgba(236, 72, 153, 0.15)" : member.type === "간사" ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.05)",
                                        color: member.type === "위원장" ? "var(--accent-color)" : member.type === "간사" ? "#3b82f6" : "var(--text-secondary)"
                                      }}>
                                        {member.type}
                                      </span>
                                    </td>
                                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: "700", whiteSpace: "nowrap" }}>{member.name}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{member.org}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{member.dept || "-"}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{member.rank || "-"}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", whiteSpace: "nowrap" }}>
                                      <span style={{
                                        padding: "0.1rem 0.3rem",
                                        borderRadius: "3px",
                                        fontSize: "0.65rem",
                                        background: member.location === "교내" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                        color: member.location === "교내" ? "#10b981" : "#f59e0b"
                                      }}>
                                        {member.location}
                                      </span>
                                    </td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--accent-color)", fontSize: "0.7rem", fontWeight: "600" }}>
                                      {member.note}
                                    </td>
                                    {hasCommitteeEditPermission && (
                                      <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                          <button
                                            aria-label={`${member.name} 위원 정보 수정`}
                                            onClick={() => {
                                              let tStart = "";
                                              let tEnd = "";
                                              if (member.term) {
                                                const splitTerm = member.term.split("~");
                                                if (splitTerm[0]) tStart = dotToDashDate(splitTerm[0]);
                                                if (splitTerm[1]) tEnd = dotToDashDate(splitTerm[1]);
                                              }

                                              setEditingMember(member);
                                              setMemberFormData({
                                                type: member.type || "",
                                                name: member.name,
                                                org: member.org,
                                                dept: member.dept || "",
                                                rank: member.rank || "",
                                                location: member.location,
                                                term: member.term || "",
                                                termStart: tStart,
                                                termEnd: tEnd,
                                                note: member.note || ""
                                              });
                                              setIsMemberModalOpen(true);
                                            }}
                                            style={{
                                              border: "none",
                                              background: "transparent",
                                              color: "var(--text-secondary)",
                                              cursor: "pointer",
                                              padding: "0.2rem"
                                            }}
                                            title="수정"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button
                                            aria-label={`${member.name} 위원 삭제`}
                                            onClick={() => handleDeleteMember(member.id)}
                                            style={{
                                              border: "none",
                                              background: "transparent",
                                              color: "#ef4444",
                                              cursor: "pointer",
                                              padding: "0.2rem"
                                            }}
                                            title="삭제"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                            padding: "2.5rem 1rem",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px dashed var(--border-color)",
                            borderRadius: "8px",
                            textAlign: "center",
                            color: "var(--text-secondary)"
                          }}>
                            <Users size={36} style={{ color: "var(--accent-color)", opacity: 0.6, marginBottom: "0.75rem" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                              위원 명단 준비 중
                            </span>
                            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                              본 위원회의 명단 정보는 추후 구성 완료 시 시스템에 직접 입력될 예정입니다.<br />
                              관련 권한을 가진 관리자 또는 사업단 총괄 책임자가 추후 업데이트할 수 있습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Info size={14} style={{ color: "var(--accent-color)" }} />
                            위원회 개요
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                            {activeComm.desc}
                          </p>
                        </div>

                        <div>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <CheckCircle size={14} style={{ color: "#10b981" }} />
                            주요 기능 및 심의 사항
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: "1.5" }}>
                            {activeComm.functions.map((fn: string, i: number) => (
                              <li key={i}>{fn}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
  );
}
