import type { Dispatch, SetStateAction } from "react";

interface MajorProgramUnitNavigationProps {
  unitKeys: string[];
  selectedUnit: string;
  hoveredUnit: string | null;
  handleUnitChange: (unit: string) => void;
  setHoveredUnit: Dispatch<SetStateAction<string | null>>;
}

export function MajorProgramUnitNavigation({
  unitKeys,
  selectedUnit,
  hoveredUnit,
  handleUnitChange,
  setHoveredUnit
}: MajorProgramUnitNavigationProps) {
  return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1rem"
        }}>
          <div style={{
            fontSize: "0.8rem",
            fontWeight: "800",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            과제 선택 (단위과제 목록)
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            {unitKeys.length > 0 ? (
              unitKeys.map((unit) => {
                const isSelected = selectedUnit === unit;
                const isHovered = hoveredUnit === unit;

                return (
                  <button
                    key={unit}
                    onClick={() => handleUnitChange(unit)}
                    onMouseEnter={() => setHoveredUnit(unit)}
                    onMouseLeave={() => setHoveredUnit(null)}
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      border: isSelected
                        ? "1.5px solid rgba(255,255,255,0.4)"
                        : isHovered
                          ? "1.5px solid rgba(59, 130, 246, 0.5)"
                          : "1.5px solid rgba(255,255,255,0.08)",
                      background: isSelected
                        ? "linear-gradient(135deg, var(--accent-color), #3b82f6)"
                        : isHovered
                          ? "rgba(59, 130, 246, 0.15)"
                          : "rgba(255, 255, 255, 0.04)",
                      color: isSelected
                        ? "#fff"
                        : isHovered
                          ? "var(--accent-color)"
                          : "var(--text-secondary)",
                      boxShadow: isSelected
                        ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                        : "none",
                      transform: isSelected
                        ? "translateY(-1px) scale(1.03)"
                        : isHovered
                          ? "translateY(-1px)"
                          : "none",
                      transition: "all 0.2s ease",
                      outline: "none"
                    }}
                  >
                    {unit}
                  </button>
                );
              })
            ) : (
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>과제 없음</div>
            )}
          </div>
        </div>
  );
}
