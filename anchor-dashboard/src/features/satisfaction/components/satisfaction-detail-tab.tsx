import type { Dispatch, SetStateAction } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  QrCode, BarChart3, FileText, Check, Download, RefreshCw, Compass
} from "lucide-react";
import type { SatisfactionSurvey } from "../satisfaction-types";

interface SatisfactionDetailTabProps {
  selectedSurvey: SatisfactionSurvey;
  handleCompleteSurveyStatus: (id: string) => void;
  handleCopyUrl: (id: string) => void;
  copiedId: string | null;
  generateAiAnalysis: (survey: SatisfactionSurvey) => void;
  generatingAi: boolean;
  aiReport: string | null;
  handleGenerateSimulatedData: (id: string) => void;
  simulatedResponder: string;
  setSimulatedResponder: Dispatch<SetStateAction<string>>;
  simulatedScores: number[];
  setSimulatedScores: Dispatch<SetStateAction<number[]>>;
  simulatedComment: string;
  setSimulatedComment: Dispatch<SetStateAction<string>>;
  handleAddSingleResponse: (id: string) => void;
  handleSyncToGoogleSheets: (id: string) => void;
  syncingId: string | null;
  handleExportToExcel: (survey: SatisfactionSurvey) => void;
  currentLikertAverage: number;
  chartData: Array<{ name: string; score: number; questionText?: string }>;
}

export function SatisfactionDetailTab({
  selectedSurvey,
  handleCompleteSurveyStatus,
  handleCopyUrl,
  copiedId,
  generateAiAnalysis,
  generatingAi,
  aiReport,
  handleGenerateSimulatedData,
  simulatedResponder,
  setSimulatedResponder,
  simulatedScores,
  setSimulatedScores,
  simulatedComment,
  setSimulatedComment,
  handleAddSingleResponse,
  handleSyncToGoogleSheets,
  syncingId,
  handleExportToExcel,
  currentLikertAverage,
  chartData,
}: SatisfactionDetailTabProps) {
  return (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem" }}>
          {/* 좌측: 조사 기본 정보 및 배포용 QR, 모의 응답기 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* 기본 상세 정보 카드 */}
            <div className="glass-card" style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.6rem" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-color)", fontWeight: "900" }}>ID: {selectedSurvey.id}</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.15rem", color: "var(--text-primary)" }}>{selectedSurvey.title}</h3>
                </div>
                <button
                  onClick={() => handleCompleteSurveyStatus(selectedSurvey.id)}
                  disabled={selectedSurvey.status === "완료"}
                  className="btn-secondary"
                  style={{
                    padding: "0.3rem 0.7rem",
                    fontSize: "0.72rem",
                    borderRadius: "0.25rem",
                    background: selectedSurvey.status === "완료" ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    color: selectedSurvey.status === "완료" ? "#10b981" : "var(--text-primary)",
                    cursor: selectedSurvey.status === "완료" ? "default" : "pointer"
                  }}
                >
                  {selectedSurvey.status === "완료" ? "조사 마감됨" : "조사 마감하기"}
                </button>
              </div>

              <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary)" }}>
                <div><strong>조사 목적:</strong> <span style={{ color: "var(--text-secondary)" }}>{selectedSurvey.purpose}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "rgba(255,255,255,0.01)", padding: "0.6rem", borderRadius: "0.3rem" }}>
                  <div><strong>수행 부서:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedSurvey.department}센터</span></div>
                  <div><strong>조사 대상:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedSurvey.target}</span></div>
                  <div><strong>조사 일정:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedSurvey.startDate} ~ {selectedSurvey.endDate}</span></div>
                  <div><strong>진행 상태:</strong> <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>{selectedSurvey.status}</span></div>
                </div>
              </div>
            </div>

            {/* 배포용 QR 코드 및 모바일 단축주소 카드 */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <QrCode size={18} /> 실시간 배포용 QR코드 & 모바일 링크
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ background: "white", padding: "0.5rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", width: "120px", height: "120px" }}>
                  {/* qrcode.react를 이용한 SVG QR코드 실시간 생성 */}
                  <QRCodeSVG
                    value={`https://uc-anchor.vercel.app/sv/${selectedSurvey.id}`}
                    size={110}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    모바일 카메라나 현장 안내용 프린트물에 아래 QR코드를 부착하세요.
                    스캔 시 해당 조사지로 직통 연결됩니다.
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      readOnly
                      value={`https://uc-anchor.vercel.app/sv/${selectedSurvey.id}`}
                      className="user-selector"
                      style={{ flex: 1, fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)" }}
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedSurvey.id)}
                      className="btn-secondary"
                      style={{ padding: "0.45rem 0.8rem", fontSize: "0.75rem", cursor: "pointer", borderRadius: "0.3rem", border: "1px solid var(--border-color)" }}
                    >
                      {copiedId === selectedSurvey.id ? "복사완료!" : "링크복사"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GPT-4o-mini AI 자동 총평 분석 카드 */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Compass size={18} className="animate-spin-slow" />
                  GPT-4o-mini 만족도 조사 종합 총평
                </h4>
                <button
                  type="button"
                  onClick={() => generateAiAnalysis(selectedSurvey)}
                  disabled={generatingAi || selectedSurvey.responses.length === 0}
                  className="btn-secondary"
                  style={{
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.72rem",
                    borderRadius: "0.3rem",
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "var(--accent-color)",
                    cursor: "pointer",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  <RefreshCw size={12} className={generatingAi ? "animate-spin" : ""} />
                  {generatingAi ? "총평 생성 중..." : "AI 총평 생성/갱신"}
                </button>
              </div>

              {generatingAi ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <RefreshCw className="animate-spin" size={24} style={{ color: "var(--accent-color)" }} />
                  <p style={{ fontSize: "0.78rem" }}>GPT-4o-mini 모델이 응답 데이터와 피드백을 기반으로 환류 의견을 작성 중입니다...</p>
                </div>
              ) : aiReport ? (
                <div style={{
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  background: "rgba(59, 130, 246, 0.02)",
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: "-8px", left: "15px", background: "#090d16", padding: "0 0.4rem", fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "900" }}>
                    AI ANALYSIS REPORT
                  </div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{aiReport}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.8rem", borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "0.5rem", fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                    <span>글자 수: {aiReport.length}자</span>
                    <span>Powered by GPT-4o-mini</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color-dark)", borderRadius: "0.4rem", fontSize: "0.78rem" }}>
                  {selectedSurvey.responses.length === 0
                    ? "수집된 만족도 조사가 없어 AI 총평을 실행할 수 없습니다."
                    : "우측 상단의 'AI 총평 생성/갱신' 버튼을 눌러 종합의견 리포트를 작성해 보세요."}
                </div>
              )}
            </div>

            {/* 모의 수집 피드백 응답 수동 등록기 */}
            {selectedSurvey.status !== "완료" && (
              <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <RefreshCw size={16} /> 실시간 응답 수집 시뮬레이터 (DB 저장)
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleGenerateSimulatedData(selectedSurvey.id)}
                    className="btn-secondary"
                    style={{
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.7rem",
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "var(--accent-color)",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                      fontWeight: "700"
                    }}
                  >
                    ⚡ 대량 모의 데이터 10건 생성
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", background: "rgba(255,255,255,0.01)", padding: "1rem", borderRadius: "0.4rem", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                    <div>
                      <label htmlFor="a11y-satisfaction-manager-18" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>응답자 정보</label>
                      <input id="a11y-satisfaction-manager-6"
                        type="text"
                        value={simulatedResponder}
                        onChange={(e) => setSimulatedResponder(e.target.value)}
                        className="user-selector"
                        style={{ width: "100%", fontSize: "0.75rem", padding: "0.4rem" }}
                      />
                    </div>
                    <div>
                      <label htmlFor="a11y-satisfaction-manager-7" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>개별 문항 점수 부여 (1~5점)</label>
                      <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.2rem" }}>
                        {selectedSurvey.questions.map((_, qIdx) => (
                          <select id="a11y-satisfaction-manager-18"
                            key={qIdx}
                            value={simulatedScores[qIdx] || 5}
                            onChange={(e) => {
                              const updated = [...simulatedScores];
                              updated[qIdx] = parseInt(e.target.value, 10);
                              setSimulatedScores(updated);
                            }}
                            className="user-selector"
                            style={{ flex: 1, fontSize: "0.75rem", padding: "0.3rem" }}
                          >
                            <option value="5">5점</option>
                            <option value="4">4점</option>
                            <option value="3">3점</option>
                            <option value="2">2점</option>
                            <option value="1">1점</option>
                          </select>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="a11y-satisfaction-manager-19" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>주관식 기타 건의사항</label>
                    <input id="a11y-satisfaction-manager-7"
                      type="text"
                      placeholder="예) 교재 상태가 아주 훌륭했습니다."
                      value={simulatedComment}
                      onChange={(e) => setSimulatedComment(e.target.value)}
                      className="user-selector"
                      style={{ width: "100%", fontSize: "0.75rem", padding: "0.4rem" }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSingleResponse(selectedSurvey.id)}
                    className="btn-primary"
                    style={{ padding: "0.45rem", fontSize: "0.78rem", fontWeight: "700", width: "100%", justifyContent: "center", borderRadius: "0.3rem", display: "flex", gap: "0.3rem" }}
                  >
                    <Check size={14} /> 모의 응답 데이터 DB 입력 전송
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 리커트 5점 척도 100점 환산 차트 및 수집 의견 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* 결과 통계 차트 및 시트 동기화 */}
            <div className="glass-card" style={{ padding: "1.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <BarChart3 size={18} /> 문항별 만족도 점수 (100점 만점)
                </h4>

                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {/* 구글 시트 연동 버튼 */}
                  <button
                    onClick={() => handleSyncToGoogleSheets(selectedSurvey.id)}
                    disabled={syncingId === selectedSurvey.id}
                    className="btn-secondary"
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.72rem",
                      borderRadius: "0.3rem",
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#10b981",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontWeight: "700"
                    }}
                  >
                    {syncingId === selectedSurvey.id ? "시트 동기화중..." : "구글 시트 연동"}
                  </button>

                  {/* 엑셀 파일 익스포트 버튼 */}
                  <button
                    onClick={() => handleExportToExcel(selectedSurvey)}
                    className="btn-secondary"
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.72rem",
                      borderRadius: "0.3rem",
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      color: "var(--accent-color)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontWeight: "700"
                    }}
                  >
                    <Download size={12} /> Excel 내보내기
                  </button>
                </div>
              </div>

              {selectedSurvey.responses.length === 0 ? (
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border-color-dark)", borderRadius: "0.4rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  수집된 만족도 응답이 없어 통계가 산출되지 않았습니다.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", padding: "0.6rem 1rem", borderRadius: "0.3rem", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>수집 응답 건수: <strong style={{ color: "var(--text-primary)" }}>{selectedSurvey.responses.length}건</strong></span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>종합 환산 점수: <strong style={{ color: "var(--accent-color)" }}>{currentLikertAverage} / 100점</strong></span>
                  </div>

                  {/* Recharts BarChart */}
                  <div style={{ width: "100%", height: "220px", fontSize: "0.7rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
                        <Tooltip
                          contentStyle={{ background: "#0f172a", border: "1px solid var(--border-color)", borderRadius: "0.3rem" }}
                          labelStyle={{ color: "white", fontWeight: "700" }}
                          itemStyle={{ color: "var(--accent-color)" }}
                          formatter={(value, _name, _props) => [`${value}점`, "환산 만족도"]}
                        />
                        <ReferenceLine y={80} stroke="rgba(16,185,129,0.5)" strokeDasharray="3 3" label={{ value: "우수선 (80점)", fill: "#10b981", fontSize: 10, position: "top" }} />
                        <Bar dataKey="score" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ maxHeight: "120px", overflowY: "auto", fontSize: "0.72rem", border: "1px solid var(--border-color)", borderRadius: "0.3rem", padding: "0.5rem" }}>
                    <span style={{ fontWeight: "700", color: "var(--accent-color)", display: "block", marginBottom: "0.2rem" }}>[질문 문항 가이드 명세]</span>
                    {selectedSurvey.questions.map((q, idx) => (
                      <div key={idx} style={{ padding: "0.15rem 0", borderBottom: "1px solid rgba(255,255,255,0.02)", display: "flex", gap: "0.25rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>문항 {idx + 1}:</span>
                        <span style={{ color: "var(--text-secondary)" }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 수집된 주관식 건의사항 / 의견 피드백 카드 목록 */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FileText size={18} /> 주관식 건의사항 및 환류 의견 ({selectedSurvey.responses.filter(r => r.comment).length}건)
              </h4>

              <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedSurvey.responses.filter(r => r.comment).length === 0 ? (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
                    제출된 의견 피드백이 없습니다.
                  </p>
                ) : (
                  selectedSurvey.responses.filter(r => r.comment).map((res) => (
                    <div
                      key={res.id}
                      style={{
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        background: "rgba(255,255,255,0.01)",
                        border: "1px solid var(--border-color)",
                        fontSize: "0.75rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.68rem", marginBottom: "0.25rem" }}>
                        <span>응답자: <strong style={{ color: "var(--text-secondary)" }}>{res.responder}</strong></span>
                        <span>{res.date}</span>
                      </div>
                      <p style={{ color: "var(--text-primary)", lineHeight: "1.35" }}>"{res.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
  );
}
