import type { LegacyPdcaRecord } from "../utils/pdca-utils";
import { formatAssignee } from "../utils/pdca-utils";

interface PdcaUnitExplorerProps {
  allUnits: LegacyPdcaRecord[];
  selectedUnitId: string;
  setSelectedUnitId: (unitId: string) => void;
  setSelectedProgId: (programId: string | null) => void;
  unitFilteredPrograms: LegacyPdcaRecord[];
  handleSelectProgram: (program: LegacyPdcaRecord) => void;
  selectedProgId: string | null;
  selectedYear: number;
}

export function PdcaUnitExplorer({
  allUnits,
  selectedUnitId,
  setSelectedUnitId,
  setSelectedProgId,
  unitFilteredPrograms,
  handleSelectProgram,
  selectedProgId,
  selectedYear,
}: PdcaUnitExplorerProps) {
  return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.02)" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>단위과제 필터 선택</span>
              <select
                className="user-selector"
                value={selectedUnitId}
                onChange={(e) => { setSelectedUnitId(e.target.value); setSelectedProgId(null); }}
              >
                {allUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id === "Common" ? "" : `${u.id}. `}{u.title}
                  </option>
                ))}
              </select>
            </div>

            <h4 style={{ fontSize: "0.9rem", fontWeight: "800", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>프로그램 리스트</h4>
            <div style={{ maxHeight: "1200px", minHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
              {unitFilteredPrograms.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", textAlign: "center", padding: "2rem" }}>
                  해당 과제에 배정된 본인 담당 프로그램이 없습니다.
                </p>
              ) : (
                unitFilteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => handleSelectProgram(prog)}
                    style={{
                      padding: "0.8rem 1rem",
                      borderRadius: "0.6rem",
                      border: `1px solid ${selectedProgId === prog.id ? "var(--accent-color)" : "var(--border-color)"}`,
                      background: selectedProgId === prog.id ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                      <span>{prog.id}</span>
                      <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>
                        {formatAssignee(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee)}
                      </span>
                    </div>
                    <h5 style={{ fontSize: "0.8rem", fontWeight: "700", lineHeight: "1.3" }}>{prog.title}</h5>
                  </div>
                ))
              )}
            </div>
          </div>
  );
}
