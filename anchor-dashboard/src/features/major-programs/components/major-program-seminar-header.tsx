import { Activity, Plus } from "lucide-react";

interface MajorProgramSeminarHeaderProps {
  description: string | undefined;
  onCreate: () => void;
}

export function MajorProgramSeminarHeader({
  description,
  onCreate
}: MajorProgramSeminarHeaderProps) {
  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                        <div style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.05))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--accent-color)",
                          border: "1px solid rgba(59, 130, 246, 0.35)",
                          boxShadow: "0 4px 10px rgba(59, 130, 246, 0.15)"
                        }}>
                          <Activity size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                            지산학 이음 세미나 성과 및 결과 대장
                          </h4>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                            {description}
                          </p>
                        </div>
                      </div>

                      {/* 추가 결과보고 등록 모달 열기 버튼 */}
                      <button
                        onClick={onCreate}
                        style={{
                          background: "linear-gradient(135deg, var(--accent-color), #2563eb)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "30px",
                          fontSize: "0.78rem",
                          padding: "0.5rem 1.2rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                          transition: "transform 0.2s, box-shadow 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 6px 15px rgba(59, 130, 246, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.25)";
                        }}
                      >
                        <Plus size={14} />
                        <span>+ 결과보고 등록</span>
                      </button>
                    </div>
  );
}
