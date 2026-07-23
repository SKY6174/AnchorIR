interface CommitteeSubtabNavigationProps {
  activeSubTab: string;
  onChangeSubTab?: (subTab: string) => void;
}

export function CommitteeSubtabNavigation({
  activeSubTab,
  onChangeSubTab
}: CommitteeSubtabNavigationProps) {
  return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem" }}>
          <button
            onClick={() => onChangeSubTab?.("committees")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.05rem",
              fontWeight: "800",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              color: activeSubTab === "committees" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSubTab === "committees" ? "2.5px solid var(--accent-color)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            위원회 명단 관리
          </button>
          <button
            onClick={() => onChangeSubTab?.("committee_meeting")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.05rem",
              fontWeight: "800",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              color: activeSubTab === "committee_meeting" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSubTab === "committee_meeting" ? "2.5px solid var(--accent-color)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            회의 운영 및 의결
          </button>
          <button
            onClick={() => onChangeSubTab?.("committee_report")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.05rem",
              fontWeight: "800",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              color: activeSubTab === "committee_report" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSubTab === "committee_report" ? "2.5px solid var(--accent-color)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            위원회 결과보고 대장
          </button>
        </div>


      </div>
  );
}
