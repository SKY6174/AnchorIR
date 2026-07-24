interface AssetSubtabNavigationProps {
  activeSubTab?: string;
  onChangeSubTab?: (subTab: string) => void;
}

export const AssetSubtabNavigation = ({
  activeSubTab,
  onChangeSubTab
}: AssetSubtabNavigationProps) => (
  <div style={{
    display: "flex",
    gap: "1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    paddingBottom: "0.2rem",
    marginBottom: "0.5rem"
  }}>
    <button
      onClick={() => onChangeSubTab && onChangeSubTab("education_env")}
      style={{
        background: "transparent",
        border: "none",
        fontSize: "1rem",
        fontWeight: "800",
        cursor: "pointer",
        padding: "0.5rem 1rem",
        color: activeSubTab === "education_env" ? "var(--accent-color)" : "var(--text-secondary)",
        borderBottom: activeSubTab === "education_env" ? "2px solid var(--accent-color)" : "none",
        transition: "all 0.15s ease"
      }}
    >
      교육환경 사용예약 관리
    </button>
    <button
      onClick={() => onChangeSubTab && onChangeSubTab("equipment")}
      style={{
        background: "transparent",
        border: "none",
        fontSize: "1rem",
        fontWeight: "800",
        cursor: "pointer",
        padding: "0.5rem 1rem",
        color: activeSubTab === "equipment" ? "var(--accent-color)" : "var(--text-secondary)",
        borderBottom: activeSubTab === "equipment" ? "2px solid var(--accent-color)" : "none",
        transition: "all 0.15s ease"
      }}
    >
      기자재 대장 관리
    </button>
  </div>
);
