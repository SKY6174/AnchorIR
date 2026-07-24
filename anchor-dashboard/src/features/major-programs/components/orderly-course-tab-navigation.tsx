import type { Dispatch, SetStateAction } from "react";
import { Activity, Calendar, CheckCircle } from "lucide-react";

interface OrderlyCourseTabNavigationProps {
  orderlyTab: string;
  setOrderlyTab: Dispatch<SetStateAction<string>>;
}

export function OrderlyCourseTabNavigation({
  orderlyTab,
  setOrderlyTab
}: OrderlyCourseTabNavigationProps) {
  return (
                      <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.02)", padding: "0.25rem", borderRadius: "30px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                        {[
                          { key: "plan", label: "운영 계획", icon: <Calendar size={13} /> },
                          { key: "process", label: "운영 과정", icon: <Activity size={13} /> },
                          { key: "result", label: "운영 결과 & 이수", icon: <CheckCircle size={13} /> }
                        ].map((subTab) => (
                          <button
                            key={subTab.key}
                            onClick={() => setOrderlyTab(subTab.key)}
                            style={{
                              border: "none",
                              padding: "0.5rem 1.1rem",
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "800",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              background: orderlyTab === subTab.key ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                              color: orderlyTab === subTab.key ? "#fff" : "var(--text-secondary)",
                              boxShadow: orderlyTab === subTab.key ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
                              transform: orderlyTab === subTab.key ? "translateY(-1px)" : "none"
                            }}
                          >
                            {subTab.icon}
                            {subTab.label}
                          </button>
                        ))}
                      </div>
  );
}
