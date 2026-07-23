import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";

interface ProcurementPurchaseModalProps {
  purchaseModalData: any;
  selectedPurchaseIdx: number;
  setPurchaseModalData: Dispatch<SetStateAction<any>>;
  setSelectedPurchaseIdx: Dispatch<SetStateAction<number>>;
}

export function ProcurementPurchaseModal({
  purchaseModalData,
  selectedPurchaseIdx,
  setPurchaseModalData,
  setSelectedPurchaseIdx
}: ProcurementPurchaseModalProps) {
        // 다중 구매 파일 리스트 빌드
        const purchaseList = purchaseModalData.docPurchaseFileList && Array.isArray(purchaseModalData.docPurchaseFileList) && purchaseModalData.docPurchaseFileList.length > 0
          ? purchaseModalData.docPurchaseFileList
          : (purchaseModalData.docPurchaseFileName ? [{
              id: "legacy-purchase",
              name: purchaseModalData.docPurchaseFileName,
              size: purchaseModalData.docPurchaseFileSize || 0,
              url: purchaseModalData.docPurchaseFileUrl || "",
              aiData: purchaseModalData.aiPurchaseData || null
            }] : []);

        const activeFile = purchaseList[selectedPurchaseIdx] || purchaseList[0];
        const activeAi = activeFile?.aiData || null;

        const price = Number(purchaseModalData.unitPrice) || 0;
        const qty = Number(purchaseModalData.quantity) || 0;
        const total = price * qty;

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
              maxWidth: "500px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              color: "var(--text-primary)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              margin: "auto",
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#C084FC", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📦 구매문서 상세 조회 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(총무팀 발송)</span>
                </h4>
                <button
                  onClick={() => {
                    setPurchaseModalData(null);
                    setSelectedPurchaseIdx(0);
                  }}
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 다중 파일이 존재할 경우 문서 선택기 콤보박스 노출 */}
              {purchaseList.length > 1 && (
                <div style={{ marginBottom: "1rem" }}>
                  <label htmlFor="a11y-procurement-manager-57" style={{ display: "block", fontSize: "0.72rem", color: "#D8B4FE", fontWeight: "700", marginBottom: "0.25rem" }}>
                    📚 첨부된 구매의뢰문서 선택 ({purchaseList.length}건)
                  </label>
                  <select id="a11y-procurement-manager-57"
                    value={selectedPurchaseIdx}
                    onChange={(e) => setSelectedPurchaseIdx(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    {purchaseList.map((f: any, idx: number) => (
                      <option key={f.id || idx} value={idx}>
                        {idx + 1}. {f.name.slice(0, 45)} {f.aiData ? `(${f.aiData.docNo})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeAi ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(167, 139, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(167, 139, 250, 0.25)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📦 구매문서 결재번호 (AI 분석 완료)</span>
                        <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                          {activeAi.docNo}
                        </strong>
                      </div>
                      {activeAi.mgmtNo && (
                        <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "0.4rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>⚙️ 기자재 관리번호</span>
                          <strong style={{ fontFamily: "monospace", color: "#34D399", fontSize: "1.15rem", letterSpacing: "0.5px" }}>
                            {activeAi.mgmtNo}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>품명 및 수량</span>
                    <strong style={{ fontSize: "0.9rem" }}>{purchaseModalData.itemName || purchaseModalData.name || "-"} / {qty}대 (세트)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>발신 부서 / 발송처</span>
                    <span>{activeAi.fromDept} / <strong>{activeAi.toDept}</strong></span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>도입 소요예산 (단위: 천원)</span>
                    <strong style={{ color: "#a78bfa" }}>{activeAi.budget}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조달 위탁 요청 기술 사양</span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {(activeAi.specs || []).map((spec: string, idx: number) => (
                        <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(167, 139, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(167, 139, 250, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📦 구매문서 결재번호 (총무팀 수신부서 이송공문)</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {activeFile?.name ? activeFile.name.replace(/\.[^/.]+$/, "") : (purchaseModalData.docPurchase || `UC-PR-${purchaseModalData.unit}-${String(purchaseModalData.seq || purchaseModalData.id).slice(-3).padStart(3, "0")}`)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>품명 및 수량</span>
                    <strong style={{ fontSize: "0.9rem" }}>{purchaseModalData.itemName || purchaseModalData.name || "-"} / {qty}대 (세트)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>발신 부서 / 발송처</span>
                    <span>{purchaseModalData.divisionName || purchaseModalData.deptName || "앵커사업단"} / <strong>총무팀 (구매 위탁 요청)</strong></span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>도입 소요예산</span>
                    <strong style={{ color: "#a78bfa" }}>{(total / 1000).toLocaleString()}천원 (VAT 포함)</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>발송 공문 비고</span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                      본 문서는 사업단 내부 기획/결재가 완료되어, 조달 진행 및 위탁 발주를 위해 총무팀으로 발송 처리된 행정 이송 결재 연계 상태 문서입니다.
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", flexShrink: 0 }}>
                {activeFile?.url ? (
                  <a
                    href={activeFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#C084FC", textDecoration: "none", fontWeight: "700" }}
                  >
                    📎 첨부문서 다운로드
                  </a>
                ) : (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>첨부파일 없음</span>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setPurchaseModalData(null);
                    setSelectedPurchaseIdx(0);
                  }}
                  style={{ padding: "0.4rem 1.25rem", fontSize: "0.75rem" }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        );
}
