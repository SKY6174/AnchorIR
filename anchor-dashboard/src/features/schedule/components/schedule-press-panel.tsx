import type { Dispatch, SetStateAction } from "react";
import { Award, Clock, Edit, Plus, Trash2 } from "lucide-react";
import type { ScheduleItem } from "../schedule-types";
import { getYoutubeEmbedUrl } from "../utils/schedule-display-utils";
import { isDateInSelectedYear } from "../utils/schedule-member-utils";

const ENABLE_AI_PRESS_RELEASE_GENERATION = false;

interface SchedulePressPanelProps {
  activePressId: number | string | null;
  currentRole: any;
  darkMode: boolean;
  handleDeletePress: (id?: number | string) => void;
  handleEditPress: (press: ScheduleItem) => void;
  handleExportPressExcel: () => void | Promise<void>;
  handleGenerateAiPressReleases: () => void;
  openAddModal: (type: string) => void;
  pressReleases: ScheduleItem[];
  selectedPressType: string;
  selectedYear: number | string | undefined;
  setActivePressId: Dispatch<SetStateAction<number | string | null>>;
  setSelectedPressType: Dispatch<SetStateAction<string>>;
}

export function SchedulePressPanel({
  activePressId,
  currentRole,
  darkMode,
  handleDeletePress,
  handleEditPress,
  handleExportPressExcel,
  handleGenerateAiPressReleases,
  openAddModal,
  pressReleases,
  selectedPressType,
  selectedYear,
  setActivePressId,
  setSelectedPressType
}: SchedulePressPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📰 앵커사업단 언론보도 모음
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                방송 보도, 주요 일간지 신문 기사 및 뉴미디어(기타) 홍보 실적 통합 관리
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {/* 구분 필터 */}
              <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.03)", padding: "0.25rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                {["all", "방송", "신문", "기타"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedPressType(type)}
                    className="btn"
                    style={{
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "4px",
                      border: "none",
                      background: selectedPressType === type ? "var(--accent-color)" : "transparent",
                      color: selectedPressType === type ? "white" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {type === "all" ? "전체" : type}
                  </button>
                ))}
              </div>

              {/* 내보내기 및 등록 */}
              <button
                type="button"
                onClick={handleExportPressExcel}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.9rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34D399", cursor: "pointer", borderRadius: "6px" }}
              >
                📥 엑셀 다운로드
              </button>

              {/* 임시 비활성화 처리 (개별 URL 자동 입력 기능 우선 제공을 위해 숨김) */}
              {ENABLE_AI_PRESS_RELEASE_GENERATION && currentRole.id !== "GUEST" && (
                <button
                  type="button"
                  onClick={handleGenerateAiPressReleases}
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.45rem 0.9rem",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "6px",
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
                    transition: "all 0.2s ease"
                  }}
                >
                  📡 AI 언론 기사 크롤링 수집
                </button>
              )}

              {currentRole.id !== "GUEST" && (
                <button
                  type="button"
                  onClick={() => openAddModal("press")}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1.2rem", background: "var(--accent-color)", border: "none", color: "white", cursor: "pointer", borderRadius: "9999px" }}
                >
                  <Plus size={16} />
                  신규 언론보도 등록
                </button>
              )}
            </div>
          </div>

          {/* 리스트 & 상세 내용 (Master-Detail) 레이아웃 - 왼쪽 40% : 오른쪽 60% 비율 분할 */}
          <div style={{ display: "grid", gridTemplateColumns: "4fr 6fr", gap: "1.5rem", alignItems: "start" }}>

            {/* 좌측: 리스트 영역 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "70vh", overflowY: "auto", paddingRight: "0.5rem" }}>
              {pressReleases
                .filter(p => isDateInSelectedYear(p.broadcastDate, selectedYear))
                .filter(p => selectedPressType === "all" || p.type === selectedPressType).length > 0 ? (
                pressReleases
                  .filter(p => isDateInSelectedYear(p.broadcastDate, selectedYear))
                  .filter(p => selectedPressType === "all" || p.type === selectedPressType)
                  .sort((a, b) => {
                    const dateA = a.broadcastDate ? new Date(a.broadcastDate) : new Date(0);
                    const dateB = b.broadcastDate ? new Date(b.broadcastDate) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((press) => {
                    const isActive = activePressId === press.id;
                    return (
                      <div
                        key={press.id}
                        onClick={() => setActivePressId(press.id ?? null)}
                        className="glass-card"
                        style={{
                          padding: "1.0rem",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          background: isActive
                            ? (darkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)")
                            : (darkMode ? "rgba(255, 255, 255, 0.03)" : "#ffffff"),
                          border: isActive
                            ? "1px solid var(--accent-color)"
                            : (darkMode ? "1px solid var(--border-color)" : "1px solid rgba(0, 0, 0, 0.08)"),
                          boxShadow: isActive ? "0 0 10px rgba(59, 130, 246, 0.2)" : "none",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                       role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: press.type === "방송" ? "rgba(239, 68, 68, 0.15)" : press.type === "신문" ? "rgba(59, 130, 246, 0.15)" : "rgba(139, 92, 246, 0.15)", color: press.type === "방송" ? "#EF4444" : press.type === "신문" ? "#60A5FA" : "#A78BFA", fontWeight: "800" }}>
                              {press.type}
                            </span>
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(128,128,128,0.12)", color: "var(--text-secondary)", fontWeight: "700" }}>
                              {press.media}
                            </span>
                          </div>

                          {/* 제어 버튼 */}
                          <div style={{ display: "flex", gap: "0.3rem" }} onClick={(e) => e.stopPropagation()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditPress(press)}
                                  title="수정"
                                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem" }}
                                  onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                  onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                  onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePress(press.id)}
                                  title="삭제"
                                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem" }}
                                  onFocus={(e) => e.currentTarget.style.color = "#EF4444"}
                                  onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                  onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {press.title}
                        </h4>

                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <Clock size={11} />
                          <span>{press.broadcastDate ? press.broadcastDate.replace("T", " ").substring(0, 16) : "-"}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="card" style={{ padding: "3rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center", width: "100%" }}>
                  <Award size={32} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.8rem" }}>등록된 언론보도 내역이 없습니다.</span>
                </div>
              )}
            </div>

            {/* 우측: 상세 표시 영역 */}
            <div style={{ minHeight: "500px" }}>
              {(() => {
                const activePress = pressReleases.find(p => p.id === activePressId);
                if (!activePress) {
                  return (
                    <div className="card" style={{ height: "100%", minHeight: "450px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
                      <Award size={48} style={{ marginBottom: "1rem", opacity: 0.3 }} />
                      <h4 style={{ margin: 0, color: "var(--text-primary)", fontWeight: "700" }}>언론보도 상세 정보</h4>
                      <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>왼쪽 목록에서 보고 싶은 보도 내역을 선택해 주세요.</p>
                    </div>
                  );
                }

                const embedUrl = getYoutubeEmbedUrl(activePress.contentUrl);

                return (
                  <div
                    className="card"
                    style={{
                      padding: "1.75rem",
                      borderRadius: "10px",
                      background: "var(--panel-bg)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                    }}
                  >
                    {/* 상단 메타 정보 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.0rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.60rem", borderRadius: "4px", background: activePress.type === "방송" ? "rgba(239, 68, 68, 0.2)" : activePress.type === "신문" ? "rgba(59, 130, 246, 0.2)" : "rgba(139, 92, 246, 0.2)", color: activePress.type === "방송" ? "#EF4444" : activePress.type === "신문" ? "#60A5FA" : "#A78BFA", fontWeight: "800" }}>
                          {activePress.type}
                        </span>
                        <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.60rem", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-primary)", fontWeight: "700" }}>
                          {activePress.media}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={14} />
                        <span>보도일시: {activePress.broadcastDate ? activePress.broadcastDate.replace("T", " ").substring(0, 16) : "-"}</span>
                      </div>
                    </div>

                    {/* 보도 제목 */}
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: "1.4" }}>
                      {activePress.title}
                    </h3>

                    {/* 보도내용 텍스트 추가 */}
                    {activePress.pressContent && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "0.85rem" }}>📝 보도내용</strong>
                        {activePress.pressContent}
                      </div>
                    )}

                    {/* 상세 본문 및 미디어 뷰어 */}
                    <div style={{ marginTop: "0.5rem" }}>
                      {embedUrl ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <iframe
                              src={`${embedUrl}?feature=oembed&enablejsapi=1`}
                              title="Youtube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                            />
                          </div>

                          {/* 하단 기사 본문 URL 정보 */}
                          <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", width: "70%" }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600" }}>유튜브 영상 주소</span>
                              <span style={{ fontSize: "0.7rem", color: "#60A5FA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {activePress.contentUrl}
                              </span>
                            </div>
                            <a
                              href={activePress.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                padding: "0.45rem 0.8rem", borderRadius: "6px", background: "rgba(59, 130, 246, 0.12)",
                                border: "1px solid rgba(59, 130, 246, 0.25)", color: "#93C5FD", fontSize: "0.75rem", fontWeight: "700", textDecoration: "none", transition: "all 0.2s"
                              }}
                            >
                              📺 유튜브에서 보기
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>📰 기사 내용 바로가기</span>
                            <Award size={18} style={{ color: "var(--accent-color)" }} />
                          </div>

                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                            본 보도자료는 신문 및 지면 기사 형태로 배포되었습니다. 아래 기사 링크를 클릭하시면 본문 기사 원본 페이지로 바로 이동합니다.
                          </p>

                          <div style={{
                            background: darkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.06)",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            border: darkMode ? "1px dashed rgba(96, 165, 250, 0.4)" : "1px dashed rgba(59, 130, 246, 0.3)"
                          }}>
                            <span style={{
                              fontSize: "0.75rem",
                              color: darkMode ? "#93C5FD" : "#1E40AF",
                              fontWeight: "700",
                              wordBreak: "break-all"
                            }}>
                              {activePress.contentUrl || "(등록된 링크 주소가 없습니다)"}
                            </span>
                          </div>

                          {activePress.contentUrl && (
                            <a
                              href={activePress.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                padding: "0.6rem", borderRadius: "6px",
                                background: darkMode ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.15)",
                                border: darkMode ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid rgba(59, 130, 246, 0.3)",
                                color: darkMode ? "#E0F2FE" : "#1D4ED8",
                                fontSize: "0.8rem", fontWeight: "700", textDecoration: "none", textAlign: "center", transition: "all 0.2s"
                              }}
                            >
                              🔗 새 창에서 보도 기사 읽기
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
  );
}
