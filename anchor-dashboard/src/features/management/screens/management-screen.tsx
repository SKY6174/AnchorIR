import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Clock, Download, Edit2, Info, Plus, Upload, X } from "lucide-react";
import OrgChartManager from "../../../components/OrgChartManager";
import CenterOrgChartManager from "../../../components/CenterOrgChartManager";
import PortalConfigManager from "../../../components/PortalConfigManager";
import type { AssetReservation, LegacyAppRecord, ProgramVersionRequest } from "../../../app/app-types";
import { formatAssignee } from "../../../app/app-data-utils";
import { deleteRiseMember } from "../services/member-service";

const InstructorPoolManager = React.lazy(() => import("../../../components/InstructorPoolManager"));
const PartnerManager = React.lazy(() => import("../../../components/PartnerManager"));

interface ManagementScreenProps {
  isActive: boolean;
  currentRole: LegacyAppRecord;
  currentUser: LegacyAppRecord;
  darkMode: boolean;
  selectedYear: number;
  mgmtSubTab: string;
  setMgmtSubTab: React.Dispatch<React.SetStateAction<string>>;
  members: LegacyAppRecord[];
  setMembers: React.Dispatch<React.SetStateAction<LegacyAppRecord[]>>;
  memberFilter: string;
  setMemberFilter: React.Dispatch<React.SetStateAction<string>>;
  memberSortConfig: { key: string | null; direction: string };
  requestMemberSort: (key: string) => void;
  getSortedMembers: () => LegacyAppRecord[];
  getMemberStatusForYear: (member: LegacyAppRecord, year: number) => string;
  renderRoleBadge: (role: string, isRetired: boolean) => React.ReactNode;
  setEditingMember: React.Dispatch<React.SetStateAction<LegacyAppRecord | null>>;
  setIsMemberModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  assignFilterUnitId: string;
  setAssignFilterUnitId: React.Dispatch<React.SetStateAction<string>>;
  displayProjects: LegacyAppRecord[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  jointPrograms: Record<string, boolean>;
  setJointPrograms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  registeredUsers: LegacyAppRecord[];
  approvalsTab: string;
  setApprovalsTab: React.Dispatch<React.SetStateAction<string>>;
  versionRequests: ProgramVersionRequest[];
  selectedRequest: ProgramVersionRequest | null;
  setSelectedRequest: React.Dispatch<React.SetStateAction<ProgramVersionRequest | null>>;
  reservations: AssetReservation[];
  isEditTimeModalOpen: boolean;
  setIsEditTimeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingRes: AssetReservation | null;
  setEditingRes: React.Dispatch<React.SetStateAction<AssetReservation | null>>;
  editResFormData: { reserved_date: string; start_time: string; end_time: string };
  setEditResFormData: React.Dispatch<React.SetStateAction<{ reserved_date: string; start_time: string; end_time: string }>>;
  menuVisibility: LegacyAppRecord;
  isSongDirector: boolean;
  handleDownloadMemberTemplate: () => void | Promise<void>;
  handleMemberExcelImport: (event: ChangeEvent<HTMLInputElement>) => void;
  handleExportMembersExcel: () => void | Promise<void>;
  handleUploadExcel: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDownloadExcel: () => void | Promise<void>;
  handleOpenAddProgram: () => void;
  handleAssignChange: (unitId: string, programId: string, assignee: string) => void;
  setSelectedUnitId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProgId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  handleDeleteUser: (userId: string) => void | Promise<void>;
  handleApproveRequest: (request: ProgramVersionRequest) => void | Promise<void>;
  handleRejectRequest: (request: ProgramVersionRequest) => void | Promise<void>;
  handleDeleteRequest: (request: ProgramVersionRequest) => void | Promise<void>;
  handleApproveReservation: (reservation: AssetReservation) => void | Promise<void>;
  handleRejectReservation: (reservation: AssetReservation) => void | Promise<void>;
  handleOpenEditTime: (reservation: AssetReservation) => void;
  handleSaveEditedTime: (event?: FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleSaveMenuVisibility: (visibility: LegacyAppRecord) => void | Promise<void>;
  renderBudgetCategoriesDiff: (categories?: LegacyAppRecord[]) => React.ReactNode;
  renderTimelineDiff: (timeline?: string) => React.ReactNode;
}

export const ManagementScreen = ({
  isActive,
  currentRole,
  currentUser,
  darkMode,
  selectedYear,
  mgmtSubTab,
  setMgmtSubTab,
  members,
  setMembers,
  memberFilter,
  setMemberFilter,
  memberSortConfig,
  requestMemberSort,
  getSortedMembers,
  getMemberStatusForYear,
  renderRoleBadge,
  setEditingMember,
  setIsMemberModalOpen,
  assignFilterUnitId,
  setAssignFilterUnitId,
  displayProjects,
  fileInputRef,
  jointPrograms,
  setJointPrograms,
  registeredUsers,
  approvalsTab,
  setApprovalsTab,
  versionRequests,
  selectedRequest,
  setSelectedRequest,
  reservations,
  isEditTimeModalOpen,
  setIsEditTimeModalOpen,
  editingRes,
  setEditingRes,
  editResFormData,
  setEditResFormData,
  menuVisibility,
  isSongDirector,
  handleDownloadMemberTemplate,
  handleMemberExcelImport,
  handleExportMembersExcel,
  handleUploadExcel,
  handleDownloadExcel,
  handleOpenAddProgram,
  handleAssignChange,
  setSelectedUnitId,
  setSelectedProgId,
  setActiveTab,
  handleDeleteUser,
  handleApproveRequest,
  handleRejectRequest,
  handleDeleteRequest,
  handleApproveReservation,
  handleRejectReservation,
  handleOpenEditTime,
  handleSaveEditedTime,
  handleSaveMenuVisibility,
  renderBudgetCategoriesDiff,
  renderTimelineDiff
}: ManagementScreenProps) => (
  <>
        {isActive && (
          <div className="management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>

            {/* 서브탭 내비게이션 바 (프레임 밖/위에 배치, 0.5rem 마진 및 1rem 폰트) */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.8rem", marginBottom: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* 1. 승인처리 탭 노출 가드 (최고 관리자군 또는 특화 승인권자) */}
              {((currentRole && ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(currentRole.id || "")) ||
                (currentUser && ["이규상", "임은애", "황수진", "최주명"].some(name => (currentUser.name || "").includes(name)))) && (
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("approvals")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "approvals" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "approvals" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    승인처리
                  </button>
                )}

              {/* 2. 구성원 관리, 회원현황, 프로그램 배정 등 기타 관리자 탭 노출 가드 (특화 승인권자는 제외) */}
              {currentRole && (currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR" || currentRole.id === "HQ_HEAD" || currentRole.id === "MANAGER") &&
                !(currentUser && ["이규상", "임은애", "황수진", "최주명"].some(name => (currentUser.name || "").includes(name))) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMgmtSubTab("members")}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        color: mgmtSubTab === "members" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: mgmtSubTab === "members" ? "2px solid var(--accent-color)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      구성원 관리
                    </button>
                    {currentRole.rank <= 2 && (
                      <button
                        type="button"
                        onClick={() => setMgmtSubTab("users")}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "0.5rem 1rem",
                          fontSize: "1rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          color: mgmtSubTab === "users" ? "var(--accent-color)" : "var(--text-secondary)",
                          borderBottom: mgmtSubTab === "users" ? "2px solid var(--accent-color)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        회원현황
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMgmtSubTab("programs")}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        color: mgmtSubTab === "programs" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: mgmtSubTab === "programs" ? "2px solid var(--accent-color)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      프로그램 배정
                    </button>
                  </>
                )}

              {/* 공용 sub-tab 버튼 (대학조직도, 사업단 조직도, 파트너기관은 누구나 접근 가능) */}
              {currentRole && (
                <>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("org_chart")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "org_chart" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "org_chart" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    대학 조직도
                  </button>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("center_org_chart")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "center_org_chart" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "center_org_chart" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    사업단 조직도
                  </button>

                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("partners")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "partners" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "partners" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    협력기관 관리
                  </button>
                </>
              )}
              {(currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <button
                  type="button"
                  onClick={() => setMgmtSubTab("instructor_pool")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    color: mgmtSubTab === "instructor_pool" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: mgmtSubTab === "instructor_pool" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  교∙강사 Pool 관리
                </button>
              )}
              {(currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <button
                  type="button"
                  onClick={() => setMgmtSubTab("portal_config")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    color: mgmtSubTab === "portal_config" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: mgmtSubTab === "portal_config" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  앵커 포털 관리
                </button>
              )}
            </div>

            {/* 본문 콘텐츠만 카드 블록 내부로 래핑 */}
            <div className="glass-card" style={{ padding: "1.25rem", position: "relative" }}>
              {/* 구성원 추가 및 엑셀 업로드/다운로드 툴바 영역 (협약서와 100% 동일한 버튼 디자인 및 둥글기 적용) */}
              {mgmtSubTab === "members" && currentRole.rank <= 2 && (
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.4rem", marginBottom: "1.2rem" }}>
                  {/* 엑셀 서식 다운로드 */}
                  <button
                    onClick={handleDownloadMemberTemplate}
                    className="action-btn download-btn"
                    style={{
                      background: "var(--bg-tertiary)",
                      cursor: "pointer"
                    }}
                  >
                    <Download size={16} /> 엑셀 서식
                  </button>

                  {/* 엑셀 업로드 */}
                  <label htmlFor="a11y-app-1"
                    className="action-btn upload-btn"
                    style={{
                      cursor: "pointer"
                    }}
                  >
                    <Upload size={16} /> 엑셀 업로드
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleMemberExcelImport}
                      style={{ display: "none" }}
                    />
                  </label>

                  {/* 엑셀 다운로드 */}
                  <button
                    onClick={handleExportMembersExcel}
                    className="action-btn download-btn"
                    style={{
                      background: "var(--bg-tertiary)",
                      cursor: "pointer"
                    }}
                  >
                    <Download size={16} /> 엑셀 다운로드
                  </button>

                  {/* 구성원 추가 (신규 등록 버튼 스타일과 100% 동기화) */}
                  <button
                    className="btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      borderRadius: "9999px",
                      padding: "0.5rem 1.2rem",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setEditingMember({
                        id: "",
                        name: "",
                        role: "연구원",
                        grade: "연구원",
                        dept: "ECC센터",
                        phoneOffice: "",
                        phoneMobile: "",
                        email: "",
                        room: "",
                        hireDate: "2026-03-01",
                        startDate: "2026-03-01",
                        endDate: "",
                        status: "참여중"
                      });
                      setIsMemberModalOpen(true);
                    }}
                  >
                    <Plus size={16} /> 신규 등록
                  </button>
                </div>
              )}

              {mgmtSubTab === "members" && (
                <div>
                  {/* 참여중 / 미참여 구분을 위한 삼분할 필터 바 */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <button
                      onClick={() => setMemberFilter("all")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        border: memberFilter === "all" ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                        background: memberFilter === "all" ? "rgba(59,130,246,0.15)" : "transparent",
                        color: memberFilter === "all" ? "var(--accent-color)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      전체 ({members.length}명)
                    </button>
                    <button
                      onClick={() => setMemberFilter("active")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        border: memberFilter === "active" ? "1px solid var(--success-color)" : "1px solid var(--border-color)",
                        background: memberFilter === "active" ? "rgba(16,185,129,0.15)" : "transparent",
                        color: memberFilter === "active" ? "var(--success-color)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      참여중 ({members.filter(m => getMemberStatusForYear(m, selectedYear) !== "미참여").length}명)
                    </button>
                    <button
                      onClick={() => setMemberFilter("retired")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        border: memberFilter === "retired" ? "1px solid #ef4444" : "1px solid var(--border-color)",
                        background: memberFilter === "retired" ? "rgba(239,68,68,0.15)" : "transparent",
                        color: memberFilter === "retired" ? "#ef4444" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      미참여 ({members.filter(m => getMemberStatusForYear(m, selectedYear) === "미참여").length}명)
                    </button>
                  </div>

                  <div className="table-panel">
                    <table className="custom-table" style={{ fontSize: "0.8rem", width: "100%" }}>
                      <thead>
                        <tr>
                          <th
                            onClick={() => requestMemberSort("dept")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            소속 부서 {memberSortConfig.key === "dept" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>성명</th>
                          <th
                            onClick={() => requestMemberSort("role")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            직책 {memberSortConfig.key === "role" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>직급/직위</th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>이메일</th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>교내 전화</th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>휴대전화</th>
                          <th
                            onClick={() => requestMemberSort("startDate")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            시작일 {memberSortConfig.key === "startDate" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>종료일</th>
                          <th
                            onClick={() => requestMemberSort("status")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            참여 여부 {memberSortConfig.key === "status" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          {currentRole.rank <= 2 && <th style={{ textAlign: "center", verticalAlign: "middle" }}>관리</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedMembers().map((m) => {
                          const isRetired = getMemberStatusForYear(m, selectedYear) === "미참여";
                          return (
                            <tr
                              key={m.id}
                              style={{
                                opacity: isRetired ? 0.45 : 1,
                                background: isRetired ? "rgba(255, 255, 255, 0.01)" : "transparent",
                                transition: "all 0.2s"
                              }}
                            >
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>{m.dept}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "800", color: isRetired ? "var(--text-secondary)" : "var(--text-primary)" }}>{m.name}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                {renderRoleBadge(m.role, isRetired)}
                              </td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>{m.grade}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.email}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.phoneOffice || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.phoneMobile || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.startDate || m.hireDate || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.endDate || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <span
                                  className={`badge ${isRetired ? "badge-red" : "badge-green"
                                    }`}
                                  style={{
                                    fontSize: "0.65rem",
                                    background: isRetired ? "rgba(239, 68, 68, 0.15)" : undefined,
                                    color: isRetired ? "#f87171" : undefined
                                  }}
                                >
                                  {getMemberStatusForYear(m, selectedYear)}
                                </span>
                              </td>
                              {currentRole.rank <= 2 && (
                                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                  <div style={{ display: "flex", gap: "0.3rem", justifyContent: "center", alignItems: "center" }}>
                                    <button
                                      className="btn-primary"
                                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(59,130,246,0.15)", border: "1px solid var(--accent-color)", color: "#60a5fa" }}
                                      onClick={() => {
                                        setEditingMember(m);
                                        setIsMemberModalOpen(true);
                                      }}
                                    >
                                      수정
                                    </button>
                                    <button
                                      className="btn-primary"
                                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171" }}
                                      onClick={async () => {
                                        if (window.confirm(`정말 ${m.name} 구성원을 삭제하시겠습니까?`)) {
                                          setMembers(members.filter((item) => item.id !== m.id));
                                          try {
                                            const { error } = await deleteRiseMember(m.id);
                                            if (error) throw error;
                                          } catch (err) {
                                            console.error("Failed to delete member from DB:", err);
                                          }
                                        }
                                      }}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mgmtSubTab === "programs" && (
                <div>
                  <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>단위과제 필터:</span>
                      <select
                        className="user-selector"
                        value={assignFilterUnitId}
                        onChange={(e) => setAssignFilterUnitId(e.target.value)}
                        style={{
                          padding: "0.3rem 0.6rem",
                          fontSize: "0.78rem",
                          borderRadius: "0.25rem",
                          background: "var(--panel-bg)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-primary)",
                          outline: "none",
                          width: "280px",
                          textOverflow: "ellipsis"
                        }}
                      >
                        <option value="all" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>전체 단위과제</option>
                        {displayProjects.flatMap((p) => p.units)
                          .sort((a, b) => {
                            if (a.id === "Common" || a.id === "X0") return 1;
                            if (b.id === "Common" || b.id === "X0") return -1;
                            return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                          })
                          .map((u) => (
                            <option key={u.id} value={u.id} style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>{u.id === "Common" ? "" : `${u.id}. `}{u.title}</option>
                          ))}
                      </select>
                    </div>
                    {currentRole.rank <= 2 && (
                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                        <label htmlFor="a11y-app-22"
                          className="action-btn upload-btn"
                          style={{
                            cursor: "pointer",
                            margin: 0
                          }}
                        >
                          <Upload size={16} /> 엑셀 업로드
                          <input id="a11y-app-22" type="file" accept=".xlsx, .xls" style={{ display: "none" }} ref={fileInputRef} onChange={handleUploadExcel} />
                        </label>
                        <button
                          onClick={handleDownloadExcel}
                          className="action-btn download-btn"
                          style={{
                            background: "var(--bg-tertiary)",
                            cursor: "pointer"
                          }}
                        >
                          <Download size={16} /> 엑셀 다운로드
                        </button>
                        <button
                          onClick={handleOpenAddProgram}
                          className="action-btn"
                          style={{
                            padding: "0.5rem 1.2rem",
                            background: "var(--accent-color)",
                            color: "white",
                            border: "none",
                            borderRadius: "9999px",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <Plus size={16} /> 신규 프로그램
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    * 실무 연구원으로 등록된 구성원(직책: 연구원)만 프로그램 담당연구원 목록으로 매핑됩니다.
                  </p>
                  <div className="table-panel">
                    <table className="custom-table" style={{ fontSize: "0.8rem", tableLayout: "fixed", width: "100%" }}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: "18%", textAlign: "center", verticalAlign: "middle" }}>단위과제</th>
                          <th rowSpan={2} style={{ width: "9%", textAlign: "center", verticalAlign: "middle" }}>프로그램 ID</th>
                          <th rowSpan={2} style={{ width: "22%", textAlign: "center", verticalAlign: "middle" }}>프로그램명</th>
                          <th rowSpan={2} style={{ width: "10%", textAlign: "center", verticalAlign: "middle" }}>담당부서</th>
                          <th rowSpan={2} style={{ width: "19%", textAlign: "center", verticalAlign: "middle" }}>담당연구원</th>
                          <th colSpan={4} style={{ textAlign: "center", width: "15%", verticalAlign: "middle" }}>진행 단계(PDCA)</th>
                          <th rowSpan={2} style={{ width: "7%", textAlign: "center", verticalAlign: "middle" }}>작업</th>
                        </tr>
                        <tr>
                          <th style={{ textAlign: "center", width: "3.75%" }}>P</th>
                          <th style={{ textAlign: "center", width: "3.75%" }}>D</th>
                          <th style={{ textAlign: "center", width: "3.75%" }}>C</th>
                          <th style={{ textAlign: "center", width: "3.75%" }}>A</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayProjects.flatMap((p) => p.units)
                          .filter((u) => assignFilterUnitId === "all" || u.id === assignFilterUnitId)
                          .sort((a, b) => {
                            if (a.id === "Common" || a.id === "X0") return 1;
                            if (b.id === "Common" || b.id === "X0") return -1;
                            return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                          })
                          .flatMap((u) => {
                            return u.programs.map((prog: LegacyAppRecord) => {
                              let dept = "사업운영팀";
                              if (selectedYear === 1) {
                                if (["A1", "A2", "D4"].includes(u.id)) dept = "ECC센터";
                                else if (["B1", "C1", "C3"].includes(u.id)) dept = "ICC센터";
                                else if (["B2", "B3", "D1", "D3"].includes(u.id)) dept = "RCC센터";
                                else if (u.id === "C2") dept = "AID-X지원센터";
                                else if (u.id === "D2") dept = "울산늘봄누리센터";
                              } else {
                                if (["A1가", "A2", "A3"].includes(u.id)) dept = "ECC센터";
                                else if (u.id === "A1나") dept = "신산업특화센터";
                                else if (["B1", "B3", "B4"].includes(u.id)) dept = "ICC센터";
                                else if (u.id === "B2") dept = "AID-X지원센터";
                                else if (u.id === "C2") dept = "울산늘봄누리센터";
                                else if (["C1", "D1", "D2", "D3"].includes(u.id)) dept = "RCC센터";
                              }

                              return (
                                <tr key={prog.id}>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", wordBreak: "break-all" }}>{u.id === "Common" ? "공통운영경비" : `${u.id}. ${u.title}`}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", wordBreak: "break-all" }}>{prog.title}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--accent-color)", fontWeight: "700" }}>{dept}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                    {currentRole.rank <= 2 ? (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center", justifyContent: "center" }}>
                                        {/* 공동배정 체크박스 */}
                                        <label htmlFor="a11y-app-23" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                                          <input id="a11y-app-23"
                                            type="checkbox"
                                            checked={!!jointPrograms[prog.id]}
                                            onChange={(e) => {
                                              const isChecked = e.target.checked;
                                              setJointPrograms(prev => ({ ...prev, [prog.id]: isChecked }));

                                              // 체크 해제 시에는 단일 연구원으로 변경할 수 있도록 현재 값의 첫 번째 연구원을 기본값으로 넘김
                                              if (!isChecked) {
                                                const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                handleAssignChange(u.id, prog.id, parts[0] || "");
                                              }
                                            }}
                                          />
                                          2인 공동배정
                                        </label>

                                        {jointPrograms[prog.id] ? (
                                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                                            {/* 정 담당자 선택 */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                              <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "700" }}>정:</span>
                                              <select
                                                className="user-selector"
                                                style={{ width: "110px", padding: "0.15rem 0.3rem", fontSize: "0.7rem" }}
                                                value={(() => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  return parts[0] || "";
                                                })()}
                                                onChange={(e) => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  const first = e.target.value;
                                                  const second = parts[1] || "";
                                                  const combined = second ? `${first}, ${second}` : first;
                                                  handleAssignChange(u.id, prog.id, combined);
                                                }}
                                              >
                                                <option value="">선택</option>
                                                {members
                                                  .filter((m) => m.role === "연구원" && m.dept === dept)
                                                  .map((m) => (
                                                    <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                      {m.name} {m.grade}
                                                    </option>
                                                  ))}
                                              </select>
                                            </div>
                                            {/* 부 담당자 선택 */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                              <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "700" }}>부:</span>
                                              <select
                                                className="user-selector"
                                                style={{ width: "110px", padding: "0.15rem 0.3rem", fontSize: "0.7rem" }}
                                                value={(() => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  return parts[1] || "";
                                                })()}
                                                onChange={(e) => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  const first = parts[0] || "";
                                                  const second = e.target.value;
                                                  const combined = second ? `${first}, ${second}` : first;
                                                  handleAssignChange(u.id, prog.id, combined);
                                                }}
                                              >
                                                <option value="">선택</option>
                                                {members
                                                  .filter((m) => m.role === "연구원" && m.dept === dept)
                                                  .map((m) => (
                                                    <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                      {m.name} {m.grade}
                                                    </option>
                                                  ))}
                                              </select>
                                            </div>
                                          </div>
                                        ) : (
                                          /* 단일 배정 드롭다운 */
                                          <select
                                            className="user-selector"
                                            style={{ width: "200px", padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                                            value={prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "")}
                                            onChange={(e) => handleAssignChange(u.id, prog.id, e.target.value)}
                                          >
                                            <option value="">미배정</option>
                                            {members
                                              .filter((m) => {
                                                if (m.role !== "연구원") return false;
                                                const currentAssignee = prog.assignees?.[selectedYear] || prog.assignee || "";
                                                const isCurrent = currentAssignee === `${m.name} ${m.grade}`;
                                                const isDeptMatch = m.dept === dept;
                                                if (!isCurrent && !isDeptMatch) return false;

                                                const startYear = 2024 + selectedYear;
                                                const endYear = 2025 + selectedYear;
                                                const yearStart = new Date(`${startYear}-03-01T00:00:00`);
                                                const yearEnd = new Date(`${endYear}-02-28T23:59:59`);

                                                const mStartStr = m.startDate || m.hireDate || "2025-03-01";
                                                const mStartDate = new Date(mStartStr);
                                                if (mStartDate > yearEnd) return false;

                                                if (m.endDate) {
                                                  const mEndDate = new Date(m.endDate);
                                                  if (mEndDate < yearStart) return false;
                                                }
                                                return true;
                                              })
                                              .map((m) => (
                                                <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                  {m.name} {m.grade} ({m.dept})
                                                </option>
                                              ))}
                                          </select>
                                        )}
                                      </div>
                                    ) : (
                                      <span>{formatAssignee(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee)}</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.p === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.p}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.d === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.d}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.c === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.c}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.a === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.a}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                    {currentRole.rank <= 2 ? (
                                      <button
                                        className="btn-primary"
                                        style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", lineHeight: "1.2", whiteSpace: "normal" }}
                                        onClick={() => {
                                          setSelectedUnitId(u.id);
                                          setSelectedProgId(prog.id);
                                          setActiveTab("projects");
                                          setTimeout(() => {
                                            const el = document.getElementById("pdca-manager-section");
                                            if (el) el.scrollIntoView({ behavior: "smooth" });
                                          }, 100);
                                        }}
                                      >
                                        정보<br />등록
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>권한 없음</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mgmtSubTab === "users" && currentRole.rank <= 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* 1. 시스템 고정 계정 목록 테이블 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>시스템 고정 계정 현황</h3>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>관리자용 데모 및 시스템 고유 계정</span>
                    </div>
                    <div className="table-panel" style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <table className="custom-table" style={{ fontSize: "0.75rem", tableLayout: "fixed", width: "100%" }}>
                        <thead>
                          <tr>
                            <th style={{ width: "25%", textAlign: "center", verticalAlign: "middle" }}>아이디</th>
                            <th style={{ width: "12%", textAlign: "center", verticalAlign: "middle" }}>이름</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>역할</th>
                            <th style={{ width: "18%", textAlign: "center", verticalAlign: "middle" }}>역할키</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>시작일</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>속성</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredUsers.filter(u => ["admin", "g_director", "hq_head", "center_director", "manager", "team_leader", "researcher"].includes(u.id.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>
                                등록된 고정 계정이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            registeredUsers
                              .filter(u => ["admin", "g_director", "hq_head", "manager", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase()))
                              .map((u) => {
                                const roleNames: Record<string, string> = {
                                  ADMIN: "최고 관리자",
                                  G_DIRECTOR: "사업단장",
                                  HQ_HEAD: "총괄본부장",
                                  MANAGER: "운영팀장",
                                  CENTER_ECC: "ECC센터장",
                                  CENTER_SPECIAL: "신산업특화센터장",
                                  CENTER_NURI: "늘봄누리센터장",
                                  CENTER_ICC: "ICC센터장",
                                  CENTER_RCC: "RCC센터장",
                                  TEAM_LEADER: "팀장교수",
                                  RESEARCHER: "실무 연구원"
                                };
                                const cleanName = (u.name || "").split(" ")[0];
                                return (
                                  <tr key={u.id}>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>{cleanName}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      {renderRoleBadge(roleNames[u.role_key] || u.role_key, false)}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", fontWeight: "700" }}>고정 계정</td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. 주소록 연동 회원 목록 테이블 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>주소록 연동 회원 현황</h3>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>인사 주소록 기반 가입 계정</span>
                    </div>
                    <div className="table-panel" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <table className="custom-table" style={{ fontSize: "0.75rem", tableLayout: "fixed", width: "100%" }}>
                        <thead>
                          <tr>
                            <th style={{ width: "25%", textAlign: "center", verticalAlign: "middle" }}>아이디</th>
                            <th style={{ width: "12%", textAlign: "center", verticalAlign: "middle" }}>이름</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>역할</th>
                            <th style={{ width: "18%", textAlign: "center", verticalAlign: "middle" }}>역할키</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>시작일</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredUsers.filter(u => !["admin", "g_director", "hq_head", "manager", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
                                연동된 주소록 회원이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            registeredUsers
                              .filter(u => !["admin", "g_director", "hq_head", "manager", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase()))
                              .map((u) => {
                                const roleNames: Record<string, string> = {
                                  ADMIN: "최고 관리자",
                                  DIRECTOR: "사업단장",
                                  G_DIRECTOR: "사업단장",
                                  HQ_HEAD: "총괄본부장",
                                  MANAGER: "운영팀장",
                                  CENTER_ECC: "ECC센터장",
                                  CENTER_SPECIAL: "신산업특화센터장",
                                  CENTER_NURI: "늘봄누리센터장",
                                  CENTER_ICC: "ICC센터장",
                                  CENTER_RCC: "RCC센터장",
                                  TEAM_LEADER: "팀장교수",
                                  RESEARCHER: "실무 연구원",
                                  RESEARCH: "연구원"
                                };
                                const cleanName = (u.name || "").split(" ")[0];
                                const isDirectoryUser = (members || []).some(m => m.email && m.email.trim().toLowerCase() === u.id.trim().toLowerCase() && m.status !== "미참여");

                                return (
                                  <tr key={u.id}>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>{cleanName}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      {renderRoleBadge(roleNames[u.role_key] || u.role_key, false)}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      {!isDirectoryUser ? (
                                        <button
                                          onClick={() => handleDeleteUser(u.id)}
                                          className="btn-primary"
                                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "var(--danger-color)", cursor: "pointer", border: "none" }}
                                        >
                                          삭제
                                        </button>
                                      ) : (
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700" }}>주소록 회원</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {mgmtSubTab === "approvals" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {(() => {
                    const approverNames = ["심현미", "김현수", "송경영", "이규상", "임은애", "황수진", "최주명"];
                    const hasNamePermission = currentUser && approverNames.some(name => (currentUser.name || "").includes(name));
                    const hasRolePermission = currentRole && ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(currentRole.id || "");
                    const isApprover = hasNamePermission || hasRolePermission;

                    if (!isApprover) {
                      return (
                        <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
                          <Info size={40} style={{ marginBottom: "0.75rem", opacity: 0.4, color: "var(--accent-color)" }} />
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem" }}>결재 승인 권한 없음</span>
                          <span>프로그램 기획 및 예산 변경 결재 권한은 <strong>심현미 운영팀장, 김현수 총괄본부장, 송경영 사업단장</strong> 3인에게만 부여되어 있습니다.</span>
                        </div>
                      );
                    }

                    return (
                      <div>
                        {/* 💡 [교육용 한글 주석] 예산변경과 시설사용 결재를 전환 선택할 수 있는 탭 세그먼트바를 렌더링합니다. */}
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                          {!(currentUser && ["이규상", "임은애", "황수진", "최주명"].some(n => (currentUser.name || "").includes(n))) && (
                            <button
                              onClick={() => setApprovalsTab("budget")}
                              style={{
                                padding: "0.4rem 1rem",
                                fontSize: "0.85rem",
                                fontWeight: "800",
                                borderRadius: "0.3rem",
                                border: "none",
                                background: approvalsTab === "budget" ? "var(--accent-color)" : "transparent",
                                color: approvalsTab === "budget" ? "white" : "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              💰 예산 및 기획변경 승인
                            </button>
                          )}
                          <button
                            onClick={() => setApprovalsTab("facility")}
                            style={{
                              padding: "0.4rem 1rem",
                              fontSize: "0.85rem",
                              fontWeight: "800",
                              borderRadius: "0.3rem",
                              border: "none",
                              background: approvalsTab === "facility" ? "var(--accent-color)" : "transparent",
                              color: approvalsTab === "facility" ? "white" : "var(--text-secondary)",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            🏫 교육환경 시설사용 승인
                          </button>
                        </div>

                        {approvalsTab === "budget" && !(currentUser && ["이규상", "임은애", "황수진", "최주명"].some(n => (currentUser.name || "").includes(n))) ? (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>프로그램 기획 및 예산 변경 결재함</h3>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>연구원들의 기획 리비전 신청 관리</span>
                            </div>
                            <div className="table-panel">
                              <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>결재번호</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>프로그램 ID</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "280px" }}>프로그램명</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>변경 차수</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>상태</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>신청자</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>신청 및 처리 일시</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "80px" }}>결재 처리</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {versionRequests.length === 0 ? (
                                    <tr>
                                      <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2.5rem" }}>
                                        결재 대기 중이거나 처리된 변경 요청 문서가 없습니다.
                                      </td>
                                    </tr>
                                  ) : (
                                    versionRequests.map((req, _idx) => {
                                      // 💡 [교육용 한글 주석] 송경영 단장님의 직접 수정 이력은 공식 수정 횟차(seq) 집계에 들어가지 않도록 배제 처리합니다.
                                      const approvedRequests = versionRequests.filter(r => r.status === "승인완료" && r.version_name !== "송경영 단장 직접 수정");
                                      const isApproved = req.status === "승인완료";
                                      let displayNo = "-";
                                      if (isApproved) {
                                        const approvedIdx = approvedRequests.findIndex(r => r.id === req.id);
                                        const seq = approvedIdx !== -1 ? (approvedRequests.length - approvedIdx) : 1;
                                        displayNo = `${2024 + req.year}-${req.unit_id}-${seq}`;
                                      }

                                      return (
                                        <tr key={req.id}>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{displayNo}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>{req.program_id}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", width: "280px", maxWidth: "280px", wordBreak: "keep-all", lineHeight: "1.3", whiteSpace: "normal" }}>{req.program_title}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <span className="badge badge-blue" style={{ fontSize: "0.65rem", whiteSpace: "normal", maxWidth: "85px", lineHeight: "1.3", display: "inline-block", textAlign: "center", padding: "0.15rem 0.25rem" }}>
                                              {req.version_name === "송경영 단장 직접 수정" ? (
                                                <>송경영 단장<br />직접 수정</>
                                              ) : req.version_name}
                                            </span>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                              <span className={`badge ${req.status === "승인완료" ? "badge-green" : (req.status === "반려" ? "badge-red" : "badge-gray")
                                                }`} style={{ fontSize: "0.65rem" }}>
                                                {req.status}
                                              </span>
                                              {(req.status === "승인완료" || req.status === "반려") && req.approved_by && (
                                                <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                                  ({req.approved_by})
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>{(req.requested_by || "").replace(/\s*\(.*?\)/g, "").replace(/\)/g, "").trim()}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.2rem", lineHeight: "1.4", fontFamily: "var(--font-data)", textAlign: "left" }}>
                                              <div>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>신청: </span>
                                                {new Date(req.requested_at).toLocaleString("ko-KR")}
                                              </div>
                                              <div style={{ marginTop: "0.15rem" }}>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>처리: </span>
                                                {req.approved_at
                                                  ? new Date(req.approved_at).toLocaleString("ko-KR")
                                                  : <span style={{ color: "var(--text-secondary)" }}>대기 중</span>
                                                }
                                              </div>
                                            </div>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                              <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="btn-primary"
                                                style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "var(--accent-color)", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                              >
                                                상세보기
                                              </button>
                                              {req.status === "승인대기" && (
                                                <>
                                                  <button
                                                    onClick={() => handleApproveRequest(req)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#10B981", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    승인
                                                  </button>
                                                  <button
                                                    onClick={() => handleRejectRequest(req)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    반려
                                                  </button>
                                                </>
                                              )}
                                              {isSongDirector && (
                                                <button
                                                  onClick={() => handleDeleteRequest(req)}
                                                  className="btn-primary"
                                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                >
                                                  삭제
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>교육환경 시설사용 예약 승인함</h3>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>공간 사용 신청 및 충돌 승인 관리</span>
                            </div>
                            <div className="table-panel">
                              <table className="custom-table" style={{ fontSize: "0.75rem", tableLayout: "fixed", width: "100%" }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "116px" }}>예약일자</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "137px" }}>사용시간</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "169px" }}>시설명(호실번호)</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "116px" }}>신청부서</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "95px" }}>신청자</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>사용목적</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "100px" }}>결재 상태</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "90px" }}>일정 조정</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "100px" }}>결재 처리</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reservations.length === 0 ? (
                                    <tr>
                                      <td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2.5rem" }}>
                                        접수된 교육환경 공간 예약 승인 신청 문서가 없습니다.
                                      </td>
                                    </tr>
                                  ) : (
                                    reservations.map((res) => {
                                      const SPACE_ROOMS: Record<string, string> = {
                                        "AI∙DX다목적강의실": "M-404",
                                        "AI∙DX강의실1": "M-402",
                                        "AI∙DX강의실2": "M-405",
                                        "울산늘봄누리센터": "1-108",
                                        "앵커사업단회의실": "앵커사업단"
                                      };
                                      const roomSuffix = SPACE_ROOMS[res.space_name] ? `(${SPACE_ROOMS[res.space_name]})` : "";
                                      return (
                                        <tr key={res.id}>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{res.reserved_date}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", whiteSpace: "nowrap" }}>{res.start_time.substring(0, 5)} ~ {res.end_time.substring(0, 5)}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.space_name}{roomSuffix}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.dept}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.reserver_name}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", wordBreak: "break-all" }}>{res.purpose}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <span className={`badge ${res.status === "승인완료" ? "badge-green" : "badge-orange"}`} style={{ fontSize: "0.65rem" }}>
                                              {res.status || "승인대기"}
                                            </span>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <button
                                              onClick={() => handleOpenEditTime(res)}
                                              style={{
                                                background: "none",
                                                border: "none",
                                                color: "#60A5FA",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.15rem",
                                                fontSize: "0.65rem",
                                                fontWeight: "800"
                                              }}
                                              title="예약 일시 수정 조율 권한"
                                            >
                                              <Edit2 size={12} />
                                              <span>조정</span>
                                            </button>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                              {res.status !== "승인완료" ? (
                                                <>
                                                  <button
                                                    onClick={() => handleApproveReservation(res)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#10B981", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    승인
                                                  </button>
                                                  <button
                                                    onClick={() => handleRejectReservation(res)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    반려
                                                  </button>
                                                </>
                                              ) : (
                                                <button
                                                  onClick={() => handleRejectReservation(res)}
                                                  className="btn-primary"
                                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                >
                                                  취소/삭제
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {mgmtSubTab === "org_chart" && (
                <OrgChartManager key={`org-${darkMode}`} />
              )}

              {mgmtSubTab === "center_org_chart" && (
                <CenterOrgChartManager key={`center-org-${darkMode}`} />
              )}



              {mgmtSubTab === "partners" && (
                <React.Suspense fallback={null}>
                  <PartnerManager key={`partner-${darkMode}-${selectedYear}`} selectedYear={selectedYear} />
                </React.Suspense>
              )}

              {mgmtSubTab === "instructor_pool" && (currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <React.Suspense fallback={null}>
                  <InstructorPoolManager key={`instructors-${darkMode}`} currentUser={currentUser} currentRole={currentRole} />
                </React.Suspense>
              )}

              {mgmtSubTab === "portal_config" && (currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <PortalConfigManager
                  key={`config-${darkMode}`}
                  initialVisibility={menuVisibility}
                  onSave={handleSaveMenuVisibility}
                />
              )}
            </div>
          </div>
        )}

        {/* 결재 상세 비교 Diff 모달 */}
        {selectedRequest && (() => {
          // 💡 [교육용 한글 주석] 송경영 단장님의 직접 수정 이력은 공식 수정 횟차(seq) 집계에 들어가지 않도록 배제 처리합니다.
          const approvedRequests = versionRequests.filter(r => r.status === "승인완료" && r.version_name !== "송경영 단장 직접 수정");
          const isApproved = selectedRequest.status === "승인완료";
          let displaySeq = "-";
          if (isApproved) {
            const approvedIdx = approvedRequests.findIndex(r => r.id === selectedRequest.id);
            const seq = approvedIdx !== -1 ? (approvedRequests.length - approvedIdx) : 1;
            displaySeq = `${2024 + selectedRequest.year}-${selectedRequest.unit_id}-${seq}`;
          }
          const changesAfter = selectedRequest.changes?.after || {};
          const showTarget1 = (changesAfter.target_participants && changesAfter.target_participants !== 0 && String(changesAfter.target_participants).trim() !== "" && String(changesAfter.target_participants).trim() !== "0") || (changesAfter.target_participants_name && changesAfter.target_participants_name.trim() !== "");
          const showTarget2 = (changesAfter.target_developments && changesAfter.target_developments !== 0 && String(changesAfter.target_developments).trim() !== "" && String(changesAfter.target_developments).trim() !== "0") || (changesAfter.target_developments_name && changesAfter.target_developments_name.trim() !== "");
          const showTarget3 = (changesAfter.target_etc && changesAfter.target_etc !== 0 && String(changesAfter.target_etc).trim() !== "" && String(changesAfter.target_etc).trim() !== "0") || (changesAfter.target_etc_name && changesAfter.target_etc_name.trim() !== "");
          let beforeVersion = "최초계획";
          let afterVersion = selectedRequest.version_name || "신청 계획";
          if (afterVersion.includes("차 수정")) {
            const numMatch = afterVersion.match(/(\d+)차/);
            if (numMatch) {
              const num = parseInt(numMatch[1], 10);
              if (num === 1) {
                beforeVersion = "최초계획";
              } else {
                beforeVersion = `${num - 1}차 수정`;
              }
            }
          } else if (afterVersion === "송경영 단장 직접 수정") {
            beforeVersion = "이전 계획";
          }

          return (
            <div style={{
              position: "fixed",
              top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.6)",
              zIndex: 1200,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflowY: "auto",
              padding: "2rem 1rem"
            }}>
              <div style={{
                background: "var(--modal-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
                width: "100%",
                maxWidth: "950px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                color: "var(--text-primary)",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                margin: "auto",
                padding: "1.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    📄 [{selectedRequest.program_title}] 기획 변경 상세 대조표 ({selectedRequest.version_name})
                  </h3>
                  <button
                    aria-label="변경 요청 상세 창 닫기"
                    onClick={() => setSelectedRequest(null)}
                    style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.78rem" }}>
                  {/* 1. 기본 기안 정보 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>결재번호:</span> <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-data)" }}>{displaySeq}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>신청자:</span> <strong style={{ color: "var(--text-primary)" }}>{(selectedRequest.requested_by || "").replace(/\s*\(.*?\)/g, "")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>신청 일시:</span> <strong style={{ color: "var(--text-primary)" }}>{new Date(selectedRequest.requested_at).toLocaleString("ko-KR")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>상태:</span> <strong style={{ color: selectedRequest.status === "승인완료" ? "#10B981" : (selectedRequest.status === "반려" ? "#EF4444" : "#FBBF24") }}>{selectedRequest.status}</strong>
                    </div>
                  </div>

                  {/* 2. 대조 비교 테이블 (이전 vs 신청) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    {/* 변경 전 (Before) */}
                    <div style={{ border: "1px solid rgba(239, 68, 68, 0.2)", padding: "1rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.015)" }}>
                      <h4 style={{ margin: "0 0 0.6rem 0", color: "#F87171", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid rgba(239, 68, 68, 0.1)", paddingBottom: "0.3rem" }}>
                        🔴 변경 전 ({beforeVersion})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>💰 재원별 예산 배정</span>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <tbody>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>국고 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_national || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.before.years?.[selectedYear]?.budget_carry_national || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>시비 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_city || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.before.years?.[selectedYear]?.budget_carry_city || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr><td style={{ padding: "0.15rem 0" }}>외부사업비</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_external || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>📁 비목별 예산 세부 배정</span>
                          {renderBudgetCategoriesDiff(selectedRequest.changes.before.years?.[selectedYear]?.budget_categories)}
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem" }}>📅 월별 추진 일정 (PDCA)</span>
                          {renderTimelineDiff(selectedRequest.changes.before.timeline)}
                        </div>

                        {(showTarget1 || showTarget2 || showTarget3) && (
                          <div>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>🎯 실적 목표치</span>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                              <tbody>
                                {showTarget1 && (
                                  <tr style={{ borderBottom: (showTarget2 || showTarget3) ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_participants_name || "참여인원"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_participants || 0} {selectedRequest.changes.before.target_participants_unit || "명"}</td></tr>
                                )}
                                {showTarget2 && (
                                  <tr style={{ borderBottom: showTarget3 ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_developments_name || "개발건수"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_developments || 0} {selectedRequest.changes.before.target_developments_unit || "건"}</td></tr>
                                )}
                                {showTarget3 && (
                                  <tr><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_etc_name || "기타"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_etc || 0} {selectedRequest.changes.before.target_etc_unit || "개"}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>👥 참여대상 및 부서</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>참여대상: {selectedRequest.changes.before.targetAudience || "미입력"} | 부서: {selectedRequest.changes.before.coopDept || "미입력"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 변경 후 (After) */}
                    <div style={{ border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.015)" }}>
                      <h4 style={{ margin: "0 0 0.6rem 0", color: "#34D399", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid rgba(16, 185, 129, 0.1)", paddingBottom: "0.3rem" }}>
                        🟢 변경 후 ({afterVersion})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>💰 재원별 예산 배정</span>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <tbody>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>국고 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_national || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.after.years?.[selectedYear]?.budget_carry_national || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>시비 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_city || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.after.years?.[selectedYear]?.budget_carry_city || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr><td style={{ padding: "0.15rem 0" }}>외부사업비</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_external || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>📁 비목별 예산 세부 배정</span>
                          {renderBudgetCategoriesDiff(selectedRequest.changes.after.years?.[selectedYear]?.budget_categories)}
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem" }}>📅 월별 추진 일정 (PDCA)</span>
                          {renderTimelineDiff(selectedRequest.changes.after.timeline)}
                        </div>

                        {(showTarget1 || showTarget2 || showTarget3) && (
                          <div>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>🎯 실적 목표치</span>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                              <tbody>
                                {showTarget1 && (
                                  <tr style={{ borderBottom: (showTarget2 || showTarget3) ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_participants_name || "참여인원"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_participants || 0} {selectedRequest.changes.after.target_participants_unit || "명"}</td></tr>
                                )}
                                {showTarget2 && (
                                  <tr style={{ borderBottom: showTarget3 ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_developments_name || "개발건수"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_developments || 0} {selectedRequest.changes.after.target_developments_unit || "건"}</td></tr>
                                )}
                                {showTarget3 && (
                                  <tr><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_etc_name || "기타"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_etc || 0} {selectedRequest.changes.after.target_etc_unit || "개"}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>👥 참여대상 및 부서</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>참여대상: {selectedRequest.changes.after.targetAudience || "미입력"} | 부서: {selectedRequest.changes.after.coopDept || "미입력"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단 결재 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "1rem", flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                  >
                    닫기
                  </button>
                  {selectedRequest.status === "승인대기" && (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleApproveRequest(selectedRequest)}
                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", background: "#10B981" }}
                      >
                        승인 처리
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleRejectRequest(selectedRequest)}
                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", background: "#EF4444" }}
                      >
                        반려 처리
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ============================================================================ */}
        {/* 💡 [교육용 한글 주석] 승인자 전용의 공간 예약 일시 조정/변경 모달 */}
        {/* ============================================================================ */}
        {isEditTimeModalOpen && editingRes && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}>
            <div style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "0.75rem",
              width: "350px",
              padding: "1.25rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              margin: "auto",
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "0.85rem", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={18} /> ⏱️ 예약 일시 변경 (조율 권한)
              </h3>
              <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
                승인권자 권한으로 예약 신청 건의 사용 시간과 날짜를 조정합니다.
              </p>

              <form onSubmit={handleSaveEditedTime} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label htmlFor="a11y-app-24" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약일자</label>
                  <input id="a11y-app-1"
                    type="date"
                    value={editResFormData.reserved_date}
                    onChange={(e) => setEditResFormData(prev => ({ ...prev, reserved_date: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <label htmlFor="a11y-app-2" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>시작 시간</label>
                    <input id="a11y-app-2"
                      type="time"
                      value={editResFormData.start_time}
                      onChange={(e) => setEditResFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      required
                      style={{ width: "100%", padding: "0.45rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-app-3" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>종료 시간</label>
                    <input id="a11y-app-3"
                      type="time"
                      value={editResFormData.end_time}
                      onChange={(e) => setEditResFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      required
                      style={{ width: "100%", padding: "0.45rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditTimeModalOpen(false);
                      setEditingRes(null);
                    }}
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  </>
);
