import React from "react";
import { Users, ClipboardList, Plus, Check, X, FileText, Vote, Cpu, Trash2, Edit, Edit3, Lock, UserCheck, Copy, RefreshCw } from "lucide-react";
import type {
  CommitteeAgenda,
  CommitteeMeeting,
  CommitteeMember,
  CommitteeResponse,
  GovernanceCommitteeMaster,
  MeetingResult
} from "../../../components/CommitteeManager";
import { buildCommitteeHumanCode } from "../../../utils/committee-code";
import { buildCommitteeVotePath } from "../../../utils/committee-short-link";

const ENABLE_INTERNAL_COMMITTEE_VOTE_FORM = false;
type AnyFunction = (...args: any[]) => any;

interface MeetingAgendaForm {
  id?: string;
  title: string;
  description: string;
  is_evaluation?: boolean;
  attachment_name?: string | null;
  attachment_path?: string | null;
  attachment_data?: string | null;
}

interface MeetingForm {
  title: string;
  meeting_date: string;
  meeting_type: string;
  agenda: string;
  attachment_name: string;
  attachment_data: string;
  access_pin: string;
  agendas: MeetingAgendaForm[];
}

interface CommitteeMeetingTabProps {
  agendaInputs: Record<string | number, { vote?: string; score?: number; opinion?: string }>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  clearCanvas: AnyFunction;
  committees: GovernanceCommitteeMaster[];
  decryptSignature: (encrypted: string) => string | null;
  draw: AnyFunction;
  editedReportText: string;
  fetchMeetingAgendasAndVotes: AnyFunction;
  fetchResponses: AnyFunction;
  filteredCommittees: GovernanceCommitteeMaster[];
  generateCommitteeSecurityPin: () => string;
  getAgendaVoteStats: AnyFunction;
  handleAiMeetingAnalysis: AnyFunction;
  handleDeleteMeeting: AnyFunction;
  handleEditMeetingStart: AnyFunction;
  handleRemoveMember: AnyFunction;
  handleSaveEditedReport: AnyFunction;
  handleSubmitVote: AnyFunction;
  hasSubmitted: boolean;
  isAnalyzing: boolean;
  isEditingReport: boolean;
  isManager: boolean;
  isMeetingManager?: boolean;
  isUserCommitteeMember: boolean;
  meetingResult: MeetingResult | null;
  meetings: CommitteeMeeting[];
  members: CommitteeMember[];
  qInfo: any;
  renderMarkdownText: (text: string | null | undefined) => React.ReactNode;
  responses: CommitteeResponse[];
  selectedCommittee: GovernanceCommitteeMaster | null;
  selectedGroup: string;
  selectedMeeting: CommitteeMeeting | null;
  selectedMeetingAgendas: CommitteeAgenda[];
  setAgendaInputs: React.Dispatch<React.SetStateAction<Record<string | number, { vote?: string; score?: number; opinion?: string }>>>;
  setEditedReportText: React.Dispatch<React.SetStateAction<string>>;
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingReport: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMeetingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMemberModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMeetingForm: React.Dispatch<React.SetStateAction<MeetingForm>>;
  setSelectedCommittee: React.Dispatch<React.SetStateAction<GovernanceCommitteeMaster | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<string>>;
  setSelectedMeeting: React.Dispatch<React.SetStateAction<CommitteeMeeting | null>>;
  sortMembersByRole: (members: CommitteeMember[]) => CommitteeMember[];
  startDrawing: AnyFunction;
  stopDrawing: AnyFunction;
}

export function CommitteeMeetingTab({
  agendaInputs,
  canvasRef,
  clearCanvas,
  committees,
  decryptSignature,
  draw,
  editedReportText,
  fetchMeetingAgendasAndVotes,
  fetchResponses,
  filteredCommittees,
  generateCommitteeSecurityPin,
  getAgendaVoteStats,
  handleAiMeetingAnalysis,
  handleDeleteMeeting,
  handleEditMeetingStart,
  handleRemoveMember,
  handleSaveEditedReport,
  handleSubmitVote,
  hasSubmitted,
  isAnalyzing,
  isEditingReport,
  isManager,
  isMeetingManager,
  isUserCommitteeMember,
  meetingResult,
  meetings,
  members,
  qInfo,
  renderMarkdownText,
  responses,
  selectedCommittee,
  selectedGroup,
  selectedMeeting,
  selectedMeetingAgendas,
  setAgendaInputs,
  setEditedReportText,
  setHasSubmitted,
  setIsEditingReport,
  setIsMeetingModalOpen,
  setIsMemberModalOpen,
  setMeetingForm,
  setSelectedCommittee,
  setSelectedGroup,
  setSelectedMeeting,
  sortMembersByRole,
  startDrawing,
  stopDrawing
}: CommitteeMeetingTabProps) {
  return (
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>

          {/* 좌측 사이드: 위원회 및 회의 목록 선택 */}
          <div style={{ flex: "1 1 25%", minWidth: "260px", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* 위원회 선택 헤더 */}
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Users size={16} /> 위원회 풀(Pool)
                </span>
              </div>

              {/* 💡 [사업단 vs 센터별 라디오 체크 버튼 구분] (요구사항 1 반영) */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
                <label htmlFor="a11y-committee-manager-1" style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  <input
                    type="radio"
                    name="committee_group"
                    value="agency"
                    checked={selectedGroup === "agency"}
                    onChange={() => setSelectedGroup("agency")}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  <span>사업단 위원회</span>
                </label>
                <label htmlFor="a11y-committee-manager-18" style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  <input id="a11y-committee-manager-18"
                    type="radio"
                    name="committee_group"
                    value="center"
                    checked={selectedGroup === "center"}
                    onChange={() => setSelectedGroup("center")}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  <span>센터별 운영위원회</span>
                </label>
              </div>

              <select
                value={selectedCommittee?.id || ""}
                onChange={(e) => {
                  const com = committees.find(c => c.id === e.target.value);
                  setSelectedCommittee(com || null);
                }}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
              >
                {filteredCommittees.length === 0 ? (
                  <option value="">등록된 위원회 없음</option>
                ) : (
                  filteredCommittees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                )}
              </select>


            </div>

            {/* 위원 구성 대장 */}
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>
                  소속 위원 ({members.filter(m => !m.type?.includes("간사")).length}명)
                </span>
                {isManager && selectedCommittee && (
                  <button className="btn btn-secondary" onClick={() => setIsMemberModalOpen(true)} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}>
                    <Plus size={12} /> 위원 배정
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {members.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>등록된 위원이 없습니다.</span>
                ) : (
                  sortMembersByRole(members).map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "0.3rem 0.5rem", borderRadius: "4px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                        {m.name} <small style={{ color: "var(--accent-color)", fontWeight: "bold" }}>({m.type || "위원"})</small>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginLeft: "0.3rem", display: "inline-block" }}>
                          {m.org} {m.dept}
                        </span>
                      </span>
                      {isManager && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 회의 안건 리스트 */}
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>
                  회의 의결 목록
                </span>
                {isManager && selectedCommittee && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setMeetingForm(previous => ({
                        ...previous,
                        access_pin: generateCommitteeSecurityPin()
                      }));
                      setIsMeetingModalOpen(true);
                    }}
                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                  >
                    <Plus size={12} /> 회의 생성
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {meetings.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>개설된 회의가 없습니다.</span>
                ) : (
                  meetings.map(m => (
                    <div
                      aria-label={`${m.title} 회의 선택`}
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: selectedMeeting?.id === m.id ? "1px solid var(--accent-color)" : "1px solid transparent",
                        background: selectedMeeting?.id === m.id ? "rgba(var(--accent-color-rgb), 0.1)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                     role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-primary)" }}>{m.title}</span>
                        <span style={{
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.3rem",
                          borderRadius: "4px",
                          background: m.status === "REPORTED" ? "var(--success-color-bg)" : "var(--accent-color-bg)",
                          color: m.status === "REPORTED" ? "var(--success-color)" : "var(--accent-color)"
                        }}>
                          {m.status === "REPORTED" ? "의결완료" : "의결중"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        <span>{m.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"}</span>
                        <span>{m.meeting_date ? m.meeting_date.substring(0, 10) : ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 우측 메인: 회의 상세 현황 및 위원 투표 입력판 */}
          <div style={{ flex: "1 1 70%", minWidth: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {selectedMeeting ? (
              <>
                {/* 회의 개요 및 성원 실시간 전광판 */}
                <div className="card" style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                        {selectedMeeting.title}
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        의결 기한: {selectedMeeting.meeting_date ? new Date(selectedMeeting.meeting_date).toLocaleString() : ""} | {selectedMeeting.meeting_type === "ONLINE_WRITTEN" ? "서면 회의" : "대면 회의"}
                      </p>
                    </div>

                    {isManager && (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleEditMeetingStart(selectedMeeting)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            color: "var(--accent-color)",
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.35)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(99, 102, 241, 0.25)";
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.35)";
                          }}
                        >
                          <Edit size={13} /> 회의 수정
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            color: "#ff6b6b",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.35)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.22)";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.35)";
                          }}
                        >
                          <Trash2 size={13} /> 회의 취소
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.78rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid var(--accent-color)",
                            color: "var(--accent-color)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "800"
                          }}
                          onClick={() => {
                            fetchResponses(selectedMeeting.id);
                            fetchMeetingAgendasAndVotes(selectedMeeting.id);
                            alert("🔄 외부 위원 의결 현황이 실시간 동기화 수합되었습니다.");
                          }}
                        >
                          <RefreshCw size={13} /> 실시간 수합 동기화
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(120, 120, 120, 0.08)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--accent-color)", display: "block", marginBottom: "0.25rem" }}>회의 안건 요지</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                      {String(selectedMeeting.agenda || "")
                        .replace(/\(5점척도\)/gi, "")
                        .replace(/\[첨부:.*?\]/gi, "")
                        .replace(/\[RISE사업.*?\]/gi, "")
                        .replace(/\b[\w\-_ㄱ-ㅎ가-힣]+\.(pdf|hwp|hwpx|docx|doc)\b/gi, "")
                        .replace(/\.pdf/gi, "")
                        .replace(/\.hwp/gi, "")
                        .trim()}
                    </p>
                  </div>

                  {/* 💡 [의안별 심의 첨부자료 표출 카드 전면 개편] */}
                  <div style={{ marginTop: "0.75rem", padding: "0.85rem", background: "rgba(99, 102, 241, 0.05)", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--accent-color)", display: "block", marginBottom: "0.6rem" }}>
                      📎 안건별 심의 첨부자료 목록
                    </strong>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {selectedMeetingAgendas && selectedMeetingAgendas.length > 0 ? (
                        selectedMeetingAgendas.map((ag, idx) => {
                          const fullMId = String(selectedMeeting.id).trim();
                          const shortMId = fullMId.includes("-") ? fullMId.split("-")[0] : fullMId;

                          // 💡 개별 안건 첨부파일명 인출 (대표 파일명이 파이프 | 또는 콤마 , 로 묶인 경우 해당 idx에 1:1 정밀 매칭)
                          let agName = ag.attachment_name;
                          if (agName && (agName.includes("|") || agName.includes(","))) {
                            const parts = agName.includes("|")
                              ? agName.split("|").map(p => p.trim())
                              : agName.split(",").map(p => p.trim());
                            if (parts[idx] && parts[idx].length > 0) {
                              agName = parts[idx];
                            }
                          }
                          if (!agName && selectedMeeting.attachment_name) {
                            const rawStr = String(selectedMeeting.attachment_name);
                            const parts = rawStr.includes("|")
                              ? rawStr.split("|").map(p => p.trim())
                              : rawStr.split(",").map(p => p.trim());
                            if (parts[idx] && parts[idx].length > 0) {
                              agName = parts[idx];
                            }
                          }
                          let agData = ag.attachment_data;
                          if (!agData && selectedMeeting.attachment_data) {
                            const rawStr = String(selectedMeeting.attachment_data);
                            if (rawStr.startsWith("[")) {
                              try {
                                const parsedArr = JSON.parse(rawStr);
                                if (parsedArr[idx] && parsedArr[idx].length > 0) {
                                  agData = parsedArr[idx];
                                }
                              } catch { }
                            } else if (idx === 0) {
                              agData = selectedMeeting.attachment_data;
                            }
                          }

                          // 로컬 스토리지 백업에서 2차 무손실 복원
                          if (!agData || !agName) {
                            try {
                              const localAgStr = localStorage.getItem(`local_meeting_agendas_${fullMId}`) || localStorage.getItem(`local_meeting_agendas_${shortMId}`);
                              if (localAgStr) {
                                const parsed = JSON.parse(localAgStr);
                                const found = parsed.find((c: any, cIdx: number) => String(c.id) === String(ag.id) || cIdx === idx);
                                if (found) {
                                  if (!agName && found.attachment_name) agName = found.attachment_name;
                                  if (!agData && found.attachment_data) agData = found.attachment_data;
                                }
                              }
                            } catch { }
                          }

                          // 3차 영구 복원: 파일명 기준 글로벌 바이너리 맵에서 즉시 수합
                          if (!agData && agName) {
                            try {
                              const globalMapStr = localStorage.getItem("global_attachment_map") || "{}";
                              const globalMap = JSON.parse(globalMapStr);
                              if (globalMap[agName.trim()]) {
                                agData = globalMap[agName.trim()];
                              }
                            } catch { }
                          }

                          return (
                            <div key={ag.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.45rem 0.65rem", background: "rgba(255,255,255,0.03)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.82rem" }}>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                                의안 #{idx + 1}: <span style={{ color: agName ? "var(--accent-color)" : "var(--text-secondary)" }}>{agName ? `📎 ${agName}` : "등록된 첨부자료 없음"}</span>
                              </span>
                              {agData ? (
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: "0.2rem 0.55rem", fontSize: "0.75rem" }}
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = agData;
                                    link.download = agName || `의안_${idx + 1}_첨부자료.pdf`;
                                    link.click();
                                  }}
                                >
                                  다운로드
                                </button>
                              ) : agName ? (
                                <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontStyle: "italic" }}>재첨부 필요</span>
                              ) : (
                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>미첨부</span>
                              )}
                            </div>
                          );
                        })
                      ) : selectedMeeting.attachment_name ? (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.45rem 0.65rem", background: "rgba(255,255,255,0.03)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.82rem" }}>
                          <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                            의안 #1: <span style={{ color: "var(--accent-color)" }}>📎 {selectedMeeting.attachment_name}</span>
                          </span>
                          {selectedMeeting.attachment_data && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.2rem 0.55rem", fontSize: "0.75rem" }}
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = selectedMeeting.attachment_data!;
                                link.download = selectedMeeting.attachment_name || "";
                                link.click();
                              }}
                            >
                              다운로드
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                          등록된 심의 첨부자료가 없습니다.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 💡 [외부 위원 전용 접속 링크 및 보안 PIN 배너 - 구글 폼 스타일 단축 URL 적용] */}
                  {(() => {
                    const shortMeetingCode = selectedMeeting.public_code?.trim();
                    const shortVotePath = shortMeetingCode ? buildCommitteeVotePath(shortMeetingCode) : "";
                    const shortVoteUrl = shortVotePath ? `${window.location.origin}${shortVotePath}` : "";
                    const committeeCode = buildCommitteeHumanCode({
                      committeeId: selectedMeeting.committee_id,
                      title: selectedMeeting.title,
                      meetingDate: selectedMeeting.meeting_date
                    });

                    if (!shortVoteUrl) {
                      return (
                        <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.08)", borderRadius: "6px", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontSize: "0.8rem", fontWeight: "700" }}>
                          외부위원 링크를 발급할 수 없는 비공식 회의입니다. 회의를 삭제한 뒤 DB 연결이 정상인 상태에서 다시 생성해 주세요.
                        </div>
                      );
                    }

                    return (
                      <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(16, 185, 129, 0.05)", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ fontSize: "0.8rem", flex: 1, minWidth: "250px" }}>
                          <span style={{ color: "#10B981", fontWeight: "bold", display: "block", marginBottom: "0.25rem" }}>🔗 외부 위원 의결 채널 단축 링크</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.25rem 0.5rem", borderRadius: "4px", color: "#a7f3d0", fontSize: "0.8rem", fontWeight: "bold", wordBreak: "break-all" }}>
                              {shortVoteUrl}
                            </code>
                            <button
                              type="button"
                              title="단축 주소 링크 복사"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.55rem",
                                fontSize: "0.72rem",
                                borderRadius: "4px",
                                border: "1px solid #10B981",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#34d399",
                                cursor: "pointer",
                                fontWeight: "bold",
                                flexShrink: 0
                              }}
                              onClick={() => {
                                navigator.clipboard.writeText(shortVoteUrl);
                                alert("📋 외부 위원 접속 단축 링크가 클립보드에 복사되었습니다!");
                              }}
                            >
                              <Copy size={13} />
                              <span>단축링크 복사</span>
                            </button>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.75rem", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>
                            위원회 코드: {committeeCode}
                          </span>
                          <span style={{ fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>
                            보안 PIN: {selectedMeeting.access_pin || "미발급"}
                          </span>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            onClick={() => {
                              const copyText = `안녕하세요, RISE 위원회 위원님.\n\n개설된 회의 심의 의결 안내 드립니다.\n\n■ 회의 안건: ${selectedMeeting.title}\n■ 위원회 코드: ${committeeCode}\n■ 접속 단축 링크: ${shortVoteUrl}\n■ 보안 PIN코드: ${selectedMeeting.access_pin || "미발급"}\n\n위 단축 링크로 접속하신 후 위원 성명과 보안 PIN코드를 입력하시고 의결 및 전자서명을 제출해 주시기 바랍니다.`;
                              navigator.clipboard.writeText(copyText);
                              alert("외부 위원 안내문 및 단축 접속 링크가 클립보드에 복사되었습니다!");
                            }}
                          >
                            <Copy size={13} />
                            <span>안내문 복사</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 실시간 성원/의결 전광판 */}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>재적 위원 수</span>
                      <strong style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>{qInfo?.total}명</strong>
                    </div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>출석(의결) 인원</span>
                      <strong style={{ fontSize: "1.5rem", color: qInfo?.isEstablished ? "var(--success-color)" : "#ef4444" }}>
                        {qInfo?.attended}명
                      </strong>
                    </div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>의사정족수 (성원)</span>
                      <strong style={{ fontSize: "1rem", display: "block", marginTop: "0.25rem", color: qInfo?.isEstablished ? "var(--success-color)" : "#ef4444" }}>
                        {qInfo?.isEstablished ? "성원 완료" : `과반 미달 (${qInfo?.majorityLimit}명 필요)`}
                      </strong>
                    </div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>의결정족수 (가결)</span>
                      <strong style={{ fontSize: "1rem", display: "block", marginTop: "0.25rem", color: qInfo?.isApproved ? "var(--success-color)" : "#ef4444" }}>
                        {qInfo?.isEstablished ? (qInfo?.isApproved ? "가결 요건 충족" : "부결/의결 미달") : "성원 대기"}
                      </strong>
                    </div>
                  </div>

                  <div style={({ fontSize: "0.75rem", color: "var(--accent-color)", marginTop: "0.5rem", textStyle: "italic" } as React.CSSProperties)}>
                    ℹ️ 의결 정족수 기준: {qInfo?.ruleText}
                  </div>

                  {/* 💡 [의안별 투표/평가 실시간 통계 모니터] */}
                  {selectedMeetingAgendas.length > 0 && (
                    <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        📊 의안별 실시간 의결 및 평가 집계
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {selectedMeetingAgendas.map((agenda, _aIdx) => {
                          const stats = getAgendaVoteStats(agenda.id, agenda.is_evaluation);
                          const cleanAgendaTitle = String(agenda.title || "").replace(/^\[안건\s*\d+\]\s*/gi, "").replace(/^\[의안\s*\d+\]\s*/gi, "").replace(/\(5점척도\)/gi, "").replace(/\[첨부:.*?\]/gi, "").trim();
                          return (
                            <div key={agenda.id} style={{ background: "rgba(120, 120, 120, 0.08)", borderRadius: "6px", padding: "0.6rem 0.75rem", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "0.4rem", fontWeight: "700" }}>
                                <span>{cleanAgendaTitle}</span>
                                {agenda.is_evaluation ? (
                                  <span style={{ color: "var(--accent-color)" }}>평균: {stats.avg}점 / 5.00</span>
                                ) : (
                                  <span style={{ color: "var(--success-color)" }}>참여: {stats.totalVotes}명</span>
                                )}
                              </div>
                              {agenda.is_evaluation ? (
                                /* 5점 척도 평점 채점 시각화 (진척도 바 형태로 평균점수 시각화) */
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(Number(stats.avg) / 5) * 100}%`, background: "var(--accent-color)", borderRadius: "4px", transition: "width 0.3s ease" }} />
                                  </div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", minWidth: "30px" }}>{((Number(stats.avg) / 5) * 100).toFixed(0)}%</span>
                                </div>
                              ) : (
                                /* 일반 찬반 투표 비율 막대 바 시각화 (찬성, 반대, 기권 등) */
                                <div style={{ display: "flex", gap: "0.2rem", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden", marginTop: "0.3rem" }}>
                                  {stats.totalVotes > 0 ? (
                                    <>
                                      <div style={{ width: `${(stats.approve / stats.totalVotes) * 100}%`, background: "#22c55e", transition: "width 0.3s ease" }} title={`찬성: ${stats.approve}명`} />
                                      <div style={{ width: `${(stats.reject / stats.totalVotes) * 100}%`, background: "#ef4444", transition: "width 0.3s ease" }} title={`반대: ${stats.reject}명`} />
                                      <div style={{ width: `${(stats.abstain / stats.totalVotes) * 100}%`, background: "#9ca3af", transition: "width 0.3s ease" }} title={`기권: ${stats.abstain}명`} />
                                    </>
                                  ) : (
                                    <div style={{ width: "100%", background: "rgba(255,255,255,0.05)" }} />
                                  )}
                                </div>
                              )}
                              {!agenda.is_evaluation && stats.totalVotes > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                                  <span>찬성: {stats.approve}명 ({((stats.approve / stats.totalVotes) * 100).toFixed(0)}%)</span>
                                  <span>반대: {stats.reject}명 ({((stats.reject / stats.totalVotes) * 100).toFixed(0)}%)</span>
                                  <span>기권: {stats.abstain}명 ({((stats.abstain / stats.totalVotes) * 100).toFixed(0)}%)</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 💡 [교육용 한글 주석] 의결서 온라인 제출은 별도 외부로그인을 통해 처리하므로 대시보드 내부 폼은 노출하지 않습니다. */}
                {ENABLE_INTERNAL_COMMITTEE_VOTE_FORM && isUserCommitteeMember && selectedMeeting?.status === "ACTIVE" && (
                  <div className="card" style={{ padding: "1.25rem", border: "1px solid var(--accent-color)", background: "rgba(var(--accent-color-rgb), 0.03)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Vote size={18} style={{ color: "var(--accent-color)" }} />
                      위원 의사결정서 온라인 제출
                    </h3>

                    {hasSubmitted ? (
                      <div style={{ textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                        <Check size={32} style={{ color: "var(--success-color)", marginBottom: "0.25rem" }} />
                        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "bold" }}>의결서 제출이 완료되었습니다.</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-line", textAlign: "left", lineHeight: "1.4" }}>
                          {selectedMeetingAgendas.map((a, idx) => {
                            const detail = agendaInputs[String(a.id || "")] || { vote: "", score: 0 };
                            const choice = a.is_evaluation ? `${detail.score}점` : (detail.vote === "APPROVE" ? "찬성" : detail.vote === "REJECT" ? "반대" : "기권");
                            return `안건 ${idx + 1}. ${a.title.substring(0, 25)}... ➡️ ${choice}`;
                          }).join("\n")}
                        </p>
                        <button className="btn btn-secondary" onClick={() => setHasSubmitted(false)} style={{ marginTop: "0.75rem", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                          의결서 수정하기
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* 💡 [의안 개조] 의안 목록 루프 돌며 개별 투표 카드 렌더링 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {selectedMeetingAgendas.map((agenda, index) => {
                            const agendaKey = String(agenda.id || "");
                            const detail = agendaInputs[agendaKey] || { vote: "", score: 0, opinion: "" };
                            return (
                              <div key={agenda.id} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                  <strong style={{ fontSize: "0.85rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                    <span style={{ color: "var(--accent-color)" }}>#{index + 1}</span> {agenda.title}
                                  </strong>
                                  <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", background: "rgba(var(--accent-color-rgb), 0.1)", padding: "0.1rem 0.3rem", borderRadius: "4px", fontWeight: "bold" }}>
                                    {agenda.is_evaluation ? "5점 척도" : "일반의결"}
                                  </span>
                                </div>
                                {agenda.description && (
                                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0", lineHeight: "1.4" }}>
                                    {agenda.description}
                                  </p>
                                )}

                                {/* 인풋 분기 */}
                                {agenda.is_evaluation ? (
                                  /* 5점 척도 평점 선택 단추 그룹 */
                                  <div style={{ marginBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", gap: "0.3rem" }}>
                                      {[1, 2, 3, 4, 5].map(scoreVal => {
                                        const isSelected = detail.score === scoreVal;
                                        return (
                                          <button
                                            key={scoreVal}
                                            type="button"
                                            onClick={() => setAgendaInputs(prev => ({
                                              ...prev,
                                              [agendaKey]: { ...prev[agendaKey], score: scoreVal }
                                            }))}
                                            style={{
                                              flex: 1,
                                              padding: "0.3rem",
                                              fontSize: "0.78rem",
                                              fontWeight: "bold",
                                              border: "1px solid",
                                              borderColor: isSelected ? "var(--accent-color)" : "var(--border-color)",
                                              background: isSelected ? "var(--accent-color)" : "rgba(0,0,0,0.2)",
                                              color: isSelected ? "white" : "var(--text-primary)",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              transition: "all 0.15s ease"
                                            }}
                                          >
                                            {scoreVal}점
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  /* 일반 찬반기권 선택 단추 그룹 */
                                  <div style={{ marginBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", gap: "0.4rem" }}>
                                      {[
                                        { val: "APPROVE", label: "찬성" },
                                        { val: "REJECT", label: "반대" },
                                        { val: "ABSTAIN", label: "기권" }
                                      ].map(item => {
                                        const isSelected = detail.vote === item.val;
                                        return (
                                          <button
                                            key={item.val}
                                            type="button"
                                            onClick={() => setAgendaInputs(prev => ({
                                              ...prev,
                                              [agendaKey]: { ...prev[agendaKey], vote: item.val }
                                            }))}
                                            style={{
                                              flex: 1,
                                              padding: "0.3rem",
                                              fontSize: "0.78rem",
                                              fontWeight: "bold",
                                              border: "1px solid",
                                              borderColor: isSelected ? (item.val === "APPROVE" ? "#22c55e" : item.val === "REJECT" ? "#ef4444" : "#9ca3af") : "var(--border-color)",
                                              background: isSelected ? (item.val === "APPROVE" ? "rgba(34,197,94,0.15)" : item.val === "REJECT" ? "rgba(239,68,68,0.15)" : "rgba(156,163,175,0.15)") : "rgba(0,0,0,0.2)",
                                              color: isSelected ? (item.val === "APPROVE" ? "#4ade80" : item.val === "REJECT" ? "#f87171" : "#d1d5db") : "var(--text-primary)",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              transition: "all 0.15s ease"
                                            }}
                                          >
                                            {item.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <textarea
                                    rows={2}
                                    placeholder={agenda.is_evaluation ? "평가 의견을 간략하게 작성해 주세요." : "의견을 1~2문장으로 기술해 주세요. (선택)"}
                                    value={detail.opinion || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAgendaInputs(prev => ({
                                        ...prev,
                                        [agendaKey]: { ...prev[agendaKey], opinion: val }
                                      }));
                                    }}
                                    style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", background: "rgba(120, 120, 120, 0.05)", color: "var(--text-primary)", border: "1px solid var(--border-color)", fontSize: "0.78rem", resize: "none" }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* 전자 서명 패드 */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <label htmlFor="a11y-committee-manager-19" style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Lock size={12} style={{ color: "var(--accent-color)" }} />
                              3. 위원 서명 (암호화 보안 저장)
                            </label>
                            <button onClick={clearCanvas} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer" }}>
                              지우기
                            </button>
                          </div>

                          <canvas
                            ref={canvasRef}
                            width={350}
                            height={100}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{
                              background: "#fff",
                              borderRadius: "6px",
                              border: "1px solid var(--border-color)",
                              cursor: "crosshair",
                              width: "100%",
                              height: "100px",
                              display: "block"
                            }}
                          />
                        </div>

                        <button className="btn btn-primary" onClick={handleSubmitVote} style={{ width: "100%", padding: "0.5rem", fontWeight: "bold", fontSize: "0.9rem" }}>
                          의결 동의 및 암호화 서명 제출
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. 실시간 표결 및 위원 의견 취합 현황 판 */}
                <div className="card" style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <FileText size={16} /> 위원 심의 의견 현황 ({responses.length}명 제출)
                    </h3>

                    {/* AI 의견 요약 & 탑재 버튼 (간사 또는 관리자 권한만 활성화) */}
                    {isManager && selectedMeeting.status === "ACTIVE" && (
                      <button
                        className="btn btn-primary"
                        onClick={handleAiMeetingAnalysis}
                        disabled={isAnalyzing || responses.length === 0 || !qInfo?.isEstablished}
                        title={!qInfo?.isEstablished ? "성원이 완료된 후 AI 분석을 진행할 수 있습니다." : "AI 종합 심의 분석 생성/재생성"}
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.35rem 0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          opacity: (!qInfo?.isEstablished || responses.length === 0) ? 0.5 : 1,
                          cursor: (!qInfo?.isEstablished || responses.length === 0) ? "not-allowed" : "pointer"
                        }}
                      >
                        <Cpu size={14} />
                        <span>{meetingResult ? "🤖 AI 분석 다시 실행" : "🤖 AI 의견 종합 분석 및 탑재"}</span>
                      </button>
                    )}
                  </div>

                  {isAnalyzing && (
                    <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", marginBottom: "0.75rem", border: "1px dashed var(--accent-color)" }}>
                      <div className="spinner" style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>ChatGPT 4o AI가 위원들의 서면 의견을 통합 분석하고 대시보드 결과 보고서를 구성하고 있습니다...</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                    {responses.length === 0 ? (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", padding: "1rem" }}>
                        현재 제출된 위원 심의 의견서가 없습니다.
                      </span>
                    ) : (
                      responses.map((r, idx) => {
                        const memberObj = members.find(m => String(m.id) === String(r.member_id) || (r.member_name && m.name === r.member_name));
                        const displayName = r.committee_members?.name || r.member_name || memberObj?.name || "위원회 위원";
                        const displayDept = r.committee_members?.dept || memberObj?.dept || memberObj?.org || "운영위원회";

                        const _isApprove = r.vote === "APPROVE" || r.vote === "찬성" || !r.vote || r.vote === "EVALUATION";
                        const isReject = r.vote === "REJECT" || r.vote === "반대";
                        const isAbstain = r.vote === "ABSTAIN" || r.vote === "기권";
                        const voteBadgeText = isReject ? "반대" : isAbstain ? "기권" : (r.vote === "EVALUATION" ? "평가완료" : "찬성");
                        const voteBadgeBg = isReject ? "rgba(239, 68, 68, 0.15)" : isAbstain ? "rgba(156, 163, 175, 0.15)" : "rgba(34, 197, 94, 0.15)";
                        const voteBadgeColor = isReject ? "#ef4444" : isAbstain ? "#9ca3af" : "#22c55e";

                        const sigUrl = (r.encrypted_signature ? decryptSignature(r.encrypted_signature) : null) || r.signature || (r as any).signature_data;

                        return (
                          <div key={r.id || idx} style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", background: "rgba(120, 120, 120, 0.08)", border: "1px solid var(--border-color)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{
                              fontSize: "0.7rem",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                              fontWeight: "bold",
                              background: voteBadgeBg,
                              color: voteBadgeColor
                            }}>
                              {voteBadgeText}
                            </span>

                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                                  {displayName} <small style={{ color: "var(--accent-color)", fontWeight: "600" }}>({displayDept})</small>
                                </strong>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                                  {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ""}
                                </span>
                              </div>
                              {r.opinion && (
                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", whiteSpace: "pre-line", lineHeight: "1.4" }}>
                                  {r.opinion}
                                </p>
                              )}
                            </div>

                            {/* 서명 완료 마크 및 전자 서명 이미지 첨부 표출 */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", flexShrink: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.1rem", color: "var(--success-color)", fontSize: "0.7rem", fontWeight: "bold" }}>
                                <UserCheck size={13} /> {sigUrl ? "서명 완료" : "의결 제출"}
                              </div>
                              {sigUrl ? (
                                <img
                                  src={sigUrl}
                                  alt="전자서명"
                                  style={{
                                    height: "32px",
                                    maxWidth: "95px",
                                    background: "#ffffff",
                                    padding: "2px 4px",
                                    borderRadius: "4px",
                                    border: "1px solid #d1d5db",
                                    objectFit: "contain",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                  (암호화 서명)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 💡 [회의 진행 탭 상세에서도 AI 심의 분석서 상시 노출 및 실시간 편집 인터페이스 연동] */}
                {meetingResult && (
                  <div style={{ marginTop: "1.25rem", padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Cpu size={16} style={{ color: "var(--accent-color)" }} />
                        앵커사업단 각종 위원회 심의 분석서
                      </strong>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {isMeetingManager && (
                          <button
                            type="button"
                            onClick={handleAiMeetingAnalysis}
                            disabled={isAnalyzing || !qInfo?.isEstablished}
                            className="btn btn-primary"
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.6rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              opacity: (!qInfo?.isEstablished || isAnalyzing) ? 0.5 : 1,
                              cursor: (!qInfo?.isEstablished || isAnalyzing) ? "not-allowed" : "pointer"
                            }}
                            title="성원 완료 후 최신 위원 의결 데이터로 AI 분석을 다시 실행합니다."
                          >
                            <RefreshCw size={12} /> AI 분석 다시 실행
                          </button>
                        )}

                        {isMeetingManager && !isEditingReport && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingReport(true);
                              setEditedReportText(meetingResult.ai_summary || "");
                            }}
                            className="btn"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem" }}
                          >
                            <Edit3 size={12} /> 수정하기
                          </button>
                        )}
                      </div>
                    </div>

                    {!qInfo?.isEstablished && (
                      <div style={{ padding: "0.75rem 1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", marginBottom: "1rem", color: "#fca5a5", fontSize: "0.82rem" }}>
                        ⚠️ <strong>성원 미달 안내:</strong> 현재 출석 위원 미달로 회의 성원이 성립되지 않았습니다. 위원의 추가 의결 참여로 성원이 완료된 후 우측의 <strong>[AI 분석 다시 실행]</strong> 버튼을 눌러 최신 심의 분석서를 재구성하세요.
                      </div>
                    )}

                    {isEditingReport ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <textarea id="a11y-committee-manager-19"
                          value={editedReportText}
                          onChange={(e) => setEditedReportText(e.target.value)}
                          style={{ width: "100%", height: "200px", background: "var(--card-bg-fallback)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "0.5rem", fontSize: "0.82rem", lineHeight: "1.5", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                          placeholder="심의 분석서 내용을 자유롭게 작성/수정해 주세요."
                        />
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => handleSaveEditedReport(meetingResult.id!)}
                            className="btn btn-primary"
                            style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingReport(false)}
                            className="btn"
                            style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                        {renderMarkdownText(meetingResult.ai_summary)}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                <ClipboardList size={48} style={{ display: "block", margin: "0 auto 1rem auto" }} />
                <span>왼쪽 회의 목록에서 안건을 선택하거나 새로운 회의 의결을 생성해 주세요.</span>
              </div>
            )}
          </div>
        </div>
  );
}
