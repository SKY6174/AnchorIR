import { Layers, LayoutList } from "lucide-react";

interface PdcaViewHeaderProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  setSelectedProgId: (programId: string | null) => void;
}

export function PdcaViewHeader({
  viewMode,
  setViewMode,
  setSelectedProgId,
}: PdcaViewHeaderProps) {
  return (
        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.4rem", borderRadius: "0.75rem", width: "fit-content" }}>
          <button
            onClick={() => { setViewMode("unit"); setSelectedProgId(null); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              background: viewMode === "unit" ? "var(--accent-color)" : "transparent",
              color: viewMode === "unit" ? "white" : "var(--text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            <Layers size={14} />
            <span>단위과제별 조회/등록</span>
          </button>
          <button
            onClick={() => { setViewMode("all"); setSelectedProgId(null); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              background: viewMode === "all" ? "var(--accent-color)" : "transparent",
              color: viewMode === "all" ? "white" : "var(--text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            <LayoutList size={14} />
            <span>전체 목록 조회/등록</span>
          </button>
        </div>
  );
}
