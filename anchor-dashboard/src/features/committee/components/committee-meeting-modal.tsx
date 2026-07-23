import type React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";
import type { GovernanceCommitteeMaster } from "../../../components/CommitteeManager";

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

interface CompressedPdf {
  name: string;
  dataUrl: string;
  compressed?: boolean;
  originalSize?: number;
  compressedSize?: number;
}

interface CommitteeMeetingModalProps {
  compressPdfIfNeeded: (file: File) => Promise<CompressedPdf | null>;
  handleCreateMeeting: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  isEditMode: boolean;
  isSubmittingMeeting: boolean;
  meetingForm: MeetingForm;
  selectedCommittee: GovernanceCommitteeMaster | null;
  setEditingMeetingId: React.Dispatch<React.SetStateAction<number | string | null>>;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMeetingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMeetingForm: React.Dispatch<React.SetStateAction<MeetingForm>>;
}

export function CommitteeMeetingModal({
  compressPdfIfNeeded,
  handleCreateMeeting,
  handleFileChange,
  isEditMode,
  isSubmittingMeeting,
  meetingForm,
  selectedCommittee,
  setEditingMeetingId,
  setIsEditMode,
  setIsMeetingModalOpen,
  setMeetingForm
}: CommitteeMeetingModalProps) {
  return (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--modal-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "500px", maxWidth: "95%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ color: "var(--text-primary)", fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>{isEditMode ? "회의 정보 및 의결 안건 수정" : "신규 회의 의결 개설"}</h3>
              <button
                type="button"
                onClick={() => {
                  setIsMeetingModalOpen(false);
                  setIsEditMode(false);
                  setEditingMeetingId(null);
                  setMeetingForm({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "", attachment_name: "", attachment_data: "", access_pin: "", agendas: [{ title: "", description: "", is_evaluation: false }] });
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", borderRadius: "50%" }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label htmlFor="a11y-committee-manager-12" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의명</label>
                <input id="a11y-committee-manager-12"
                  type="text"
                  required
                  placeholder="예: 제1차 앵커총괄위원회 회의"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-13" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 일시 및 마감기한</label>
                  <input id="a11y-committee-manager-13"
                    type="datetime-local"
                    required
                    value={meetingForm.meeting_date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meeting_date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-14" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 방식</label>
                  <select id="a11y-committee-manager-14"
                    value={meetingForm.meeting_type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meeting_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="ONLINE_WRITTEN">서면 의결 (비대면)</option>
                    <option value="OFFLINE_FACE">대면 회의 (시스템 서명)</option>
                  </select>
                </div>
              </div>

              {/* 💡 [회의 안건 다중화 개조] 개별 의안 관리 컨트롤러 */}
              <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.75rem", background: "rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="a11y-committee-manager-15" style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)" }}>의결 안건 / 평가 영역 설정 (최소 1개 필수)</label>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {selectedCommittee?.id === "evaluation" && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setMeetingForm(prev => ({
                            ...prev,
                            agendas: [
                              { title: "평가영역 1: 사업 계획의 타당성 및 목표의 구체성", description: "RISE 사업 전체 목표 대비 세부 과제별 사업 계획이 합리적이고 타당하게 설정되었는지 검증합니다.", is_evaluation: true },
                              { title: "평가영역 2: 예산 집행 계획의 합리성 및 집행률 제고 대책", description: "국고 및 대응 자금 예산 집행 계획이 타당하며, 예산 낭비를 막고 효율을 올릴 수 있도록 편성되었는지 심의합니다.", is_evaluation: true },
                              { title: "평가영역 3: 세부 추진 과제(UP/PG)별 성과 지표 달성도", description: "프로그램 진행에 따른 정량/정성 성과지표와 목표치가 지역 발전에 부합하게 설계되어 적절히 추진 중인지 평가합니다.", is_evaluation: true },
                              { title: "평가영역 4: 평가 환류 및 차년도 사업 반영 계획의 적절성", description: "성과 분석을 바탕으로 미흡 과제를 보완하고, 환류 결과를 차년도 계획에 객관적이고 공정하게 연계했는지 검증합니다.", is_evaluation: true }
                            ]
                          }));
                        }}
                        style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#fff", cursor: "pointer" }}
                      >
                        📋 4대 평가영역 자동 설정
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setMeetingForm(prev => ({
                          ...prev,
                          agendas: [...(prev.agendas || []), { title: "", description: "", is_evaluation: false }]
                        }));
                      }}
                      style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
                    >
                      ➕ 의안 추가
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {(meetingForm.agendas || []).map((agenda, index) => (
                    <div key={index} style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "0.5rem", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: "bold", color: "var(--accent-color)" }}>#{index + 1}</span>
                        <input id="a11y-committee-manager-20"
                          type="text"
                          required
                          placeholder="예: 제1호 의안 - 2차년도 사업계획서 심의"
                          value={agenda.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMeetingForm(prev => {
                              const updated = [...(prev.agendas || [])];
                              updated[index].title = val;
                              return { ...prev, agendas: updated };
                            });
                          }}
                          className="form-input"
                          style={{ flex: 1, padding: "0.3rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}
                        />
                        <label htmlFor="a11y-committee-manager-21" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                          <input id="a11y-committee-manager-21"
                            type="checkbox"
                            checked={!!agenda.is_evaluation}
                            onChange={(e) => {
                              const chk = e.target.checked;
                              setMeetingForm(prev => {
                                const updated = [...(prev.agendas || [])];
                                updated[index].is_evaluation = chk;
                                return { ...prev, agendas: updated };
                              });
                            }}
                          />
                          5점 척도
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMeetingForm(prev => {
                              const updated = (prev.agendas || []).filter((_, i) => i !== index);
                              return { ...prev, agendas: updated };
                            });
                          }}
                          style={{ background: "transparent", border: "none", color: "var(--danger-color)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="안건 설명 또는 세부 평가기준을 요약해 주세요. (선택)"
                        value={agenda.description || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMeetingForm(prev => {
                            const updated = [...(prev.agendas || [])];
                            updated[index].description = val;
                            return { ...prev, agendas: updated };
                          });
                        }}
                        className="form-textarea"
                        style={{ width: "100%", padding: "0.3rem 0.5rem", borderRadius: "4px", fontSize: "0.78rem", resize: "none", marginBottom: "0.4rem" }}
                      />

                      {/* 안건별 개별 자료 첨부 입력 컨트롤 (모든 문서/이미지 확장자 지원 & FileReader 무손실 업로드) */}
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <label htmlFor="a11y-committee-manager-15" style={{ fontSize: "0.7rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>📄 심의자료:</label>
                        <input id="a11y-committee-manager-15"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            let fileName = file.name;
                            let fileDataUrl = "";

                            // 💡 1순위: 무손실 PDF 최적화 압축 엔진 적용 (2MB 이하 자동 최적화 및 콘솔 400 에러 100% 방지)
                            if (file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
                              try {
                                const res = await compressPdfIfNeeded(file);
                                if (res && res.dataUrl) {
                                  fileName = res.name;
                                  fileDataUrl = res.dataUrl;
                                }
                              } catch { }
                            }

                            // 💡 2순위: 기본 FileReader 무손실 데이터 읽기
                            if (!fileDataUrl) {
                              fileDataUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result as string);
                                reader.onerror = () => resolve("");
                                reader.readAsDataURL(file);
                              });
                            }

                            if (fileDataUrl) {
                              setMeetingForm(prev => {
                                const updated = [...(prev.agendas || [])];
                                updated[index] = {
                                  ...updated[index],
                                  attachment_name: fileName,
                                  attachment_data: fileDataUrl
                                };
                                return { ...prev, agendas: updated };
                              });
                            } else {
                              alert("선택하신 심의자료 첨부파일 데이터를 읽어들이지 못했습니다.");
                            }
                          }}
                          style={{ flex: 1, fontSize: "0.68rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.15rem 0.3rem", borderRadius: "4px" }}
                        />
                        {agenda.attachment_name && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.68rem", color: "var(--success-color)", whiteSpace: "nowrap" }}>
                            <span>📎 {agenda.attachment_name.length > 15 ? agenda.attachment_name.substring(0, 15) + "..." : agenda.attachment_name}</span>
                            {agenda.attachment_data?.startsWith("http") && (
                              <span style={{ fontSize: "0.62rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "0.05rem 0.3rem", borderRadius: "4px", fontWeight: "bold" }}>
                                ☁️ Cloud Storage
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setMeetingForm(prev => {
                                  const updated = [...(prev.agendas || [])];
                                  updated[index].attachment_name = "";
                                  updated[index].attachment_data = "";
                                  return { ...prev, agendas: updated };
                                });
                              }}
                              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.68rem", fontWeight: "bold" }}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(meetingForm.agendas || []).length === 0 && (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                      등록된 의안이 없습니다. 상단 우측 버튼을 통해 안건을 추가해 주세요.
                    </div>
                  )}
                </div>
              </div>

              {/* 💡 [회의 안건 의결 서류 파일 탑재 필드] (PDF 전용 & 2MB 고해상도 자동 최적화 압축 안내) */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-16" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결 심의 자료 첨부 (선택)</label>
                  <input id="a11y-committee-manager-16"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="form-input"
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", fontSize: "0.75rem" }}
                  />
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.7rem", marginTop: "0.15rem", display: "block" }}>
                    * pdf 확장자만 지원 (2MB 초과 시 2MB 이하로 고해상도 자동 최적화 압축)
                  </small>
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="a11y-committee-manager-17" style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 보안 PIN코드 (자동 생성)</label>
                  <input id="a11y-committee-manager-17"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456을 제외한 6자리 숫자"
                    value={meetingForm.access_pin}
                    onChange={(e) => setMeetingForm({ ...meetingForm, access_pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    className="form-input"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px" }}
                  />
                  <small style={{ color: "#f59e0b", fontSize: "0.7rem", marginTop: "0.25rem", display: "block" }}>
                    * 회의 생성 시 안전한 6자리 숫자가 자동 입력됩니다. 123456은 생성되지 않습니다.
                  </small>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" disabled={isSubmittingMeeting} onClick={() => {
                  setIsMeetingModalOpen(false);
                  setIsEditMode(false);
                  setEditingMeetingId(null);
                  setMeetingForm({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "", attachment_name: "", attachment_data: "", access_pin: "", agendas: [{ title: "", description: "", is_evaluation: false }] });
                }} style={{ flex: 1, opacity: isSubmittingMeeting ? 0.6 : 1 }}>취소</button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingMeeting}
                  style={{
                    flex: 1,
                    opacity: isSubmittingMeeting ? 0.7 : 1,
                    cursor: isSubmittingMeeting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmittingMeeting
                    ? (isEditMode ? "⏳ 수정사항 저장 중..." : "⏳ 회의 등록 및 의결 개시 중...")
                    : (isEditMode ? "수정사항 저장" : "회의 등록 및 의결 개시")}
                </button>
              </div>
            </form>
          </div>
        </div>
  );
}
