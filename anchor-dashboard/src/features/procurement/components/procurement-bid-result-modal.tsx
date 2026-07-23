import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";

interface ProcurementBidResultModalProps {
  bidModalData: any;
  setBidModalData: Dispatch<SetStateAction<any>>;
  subTab?: string;
}

export function ProcurementBidResultModal({
  bidModalData,
  setBidModalData,
  subTab
}: ProcurementBidResultModalProps) {
  return (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 1300,
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
            maxWidth: "550px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto",
            padding: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#10B981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {subTab === "env_improvement" ? (
                  <>📜 결과문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(시설안전관리팀 시공/준공 결과)</span></>
                ) : (
                  <>📜 입찰문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(총무팀 작성 문서)</span></>
                )}
              </h4>
              <button
                onClick={() => setBidModalData(null)}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const price = Number(bidModalData.unitPrice) || 0;
              const qty = Number(bidModalData.quantity) || 0;
              const total = price * qty;
              const isEnv = subTab === "env_improvement";

              // AI 요약 데이터가 존재할 경우 반영
              if (bidModalData.aiBidData) {
                const ai = bidModalData.aiBidData;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                    <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                      <span style={{ fontSize: "0.72rem", color: "#A7F3D0", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                        {isEnv ? "⚖️ 결과문서 결재번호 (AI 분석 완료)" : "⚖️ 입찰문서 결재번호 (AI 분석 완료)"}
                      </span>
                      <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                        {ai.docNo}
                      </strong>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
                          {isEnv ? "준공 및 검수 부서" : "공고 및 낙찰 부서"}
                        </span>
                        <strong style={{ color: "#34D399" }}>
                          {isEnv ? "시설안전관리팀" : "대학본부 총무팀"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
                          {isEnv ? "준공 시공 상태" : "입찰 계약 방식"}
                        </span>
                        <span style={{ fontWeight: "700", color: "#10b981" }}>{ai.method}</span>
                      </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700", width: "140px" }}>
                            {isEnv ? "구축 공간명" : "품명"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "var(--text-primary)", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                        </tr>
                        {isEnv ? (
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>지정 호실/위치</td>
                            <td style={{ padding: "0.5rem" }}>{bidModalData.location || "지정 안 됨"}</td>
                          </tr>
                        ) : (
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>도입 단가 / 수량</td>
                            <td style={{ padding: "0.5rem" }}>{(price / 1000).toLocaleString()}천원 / {qty}대</td>
                          </tr>
                        )}
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                            {isEnv ? "총 집행 공사비" : "배정 예산 규모"}
                          </td>
                          <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{ai.budget}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                            {isEnv ? "최종 시공 완료일" : "입찰 등록 마감"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "#FBBF24", fontWeight: "700" }}>{ai.deadline}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                            {isEnv ? "시공 범위 및 실적" : "참가 자격 및 규격"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                            {(ai.qualifications || []).map((qual: string, idx: number) => (
                              <div key={idx} style={{ marginBottom: "0.2rem" }}>- {qual}</div>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.82rem" }}>
                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#A7F3D0", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                      {isEnv ? "⚖️ 결과문서 결재번호" : "⚖️ 입찰문서 결재번호"}
                    </span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {bidModalData.docBid || (isEnv
                        ? `UC-RES-${bidModalData.unit}-${String(bidModalData.seq || bidModalData.id).slice(-3).padStart(3, "0")}`
                        : `UC-BID-${bidModalData.unit}-${String(bidModalData.seq || bidModalData.id).slice(-3).padStart(3, "0")}`
                      )}
                    </strong>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>작성 부서</span>
                      <strong style={{ color: "#34D399" }}>
                        {isEnv ? "시설안전관리팀" : "대학본부 총무팀"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
                        {isEnv ? "보고 구분" : "입찰 구분"}
                      </span>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>
                        {isEnv ? "준공 검수 및 시설 인도 보고" : "제한경쟁입찰 (규격/가격 동시)"}
                      </span>
                    </div>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700", width: "120px" }}>
                          {isEnv ? "구축 공간명" : "품명"}
                        </td>
                        <td style={{ padding: "0.5rem", color: "var(--text-primary)", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                      </tr>
                      {isEnv ? (
                        <>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>구축 위치</td>
                            <td style={{ padding: "0.5rem" }}>{bidModalData.location || "지정 안 됨"}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>최종 집행액</td>
                            <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{(Number(bidModalData.budgetSpent || 0) / 1000).toLocaleString()}천원</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>구매 수량</td>
                            <td style={{ padding: "0.5rem" }}>{qty} 대(세트)</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>도입 단가</td>
                            <td style={{ padding: "0.5rem", fontWeight: "700", color: "#60A5FA" }}>{(price / 1000).toLocaleString()}천원</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>소요 예산</td>
                            <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{(total / 1000).toLocaleString()}천원 (부가가치세 포함)</td>
                          </tr>
                        </>
                      )}
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                          {isEnv ? "최종 구축 공간" : "납품 장소"}
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          {isEnv
                            ? `울산과학대학교 내 지정 공간 (${bidModalData.location || "지정 안 됨"})`
                            : "물산과학대학교 지정 실습 공간 및 지정 교수연구실"
                          }
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                          {isEnv ? "시공 특이 사항" : "요구 성능 규격"}
                        </td>
                        <td style={{ padding: "0.5rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                          {isEnv ? (
                            <>
                              - 시설안전관리팀 시방서 기준 정밀 준수 준공<br />
                              - 소방 및 전기 안전 기술 진단 적합성 판정 획득<br />
                              - {bidModalData.plan || "상세 공사 계획 대비 시공 완료"}
                            </>
                          ) : (
                            <>
                              - 앵커 사업단 실무위원회 통과 규격서 준수<br />
                              - 무상 유지보수 기한 2년 이상 보장 조건<br />
                              - {bidModalData.description || "상세 사양서 별도 첨부 참조"}
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", flexShrink: 0 }}>
              {bidModalData.docBidFileUrl ? (
                <a
                  href={bidModalData.docBidFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#10B981", textDecoration: "none", fontWeight: "700" }}
                >
                  📎 첨부문서 다운로드
                </a>
              ) : (
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>첨부파일 없음</span>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => setBidModalData(null)}
                style={{ padding: "0.4rem 1.25rem", fontSize: "0.75rem" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
  );
}
