import type React from "react";
import type { ProcurementItem } from "../../../components/ProcurementManager";

type ProcurementFormData = Record<string, any>;

interface ActivePopover {
  equipId: number | string;
  month: string;
  x: number;
  y: number;
}

interface ProcurementMilestonePopoverProps {
  activePopover: ActivePopover;
  equipData: ProcurementItem[];
  formData: ProcurementFormData;
  getMilestoneArray: (value: string | string[] | null | undefined) => string[];
  handleMilestoneMultiToggle: (equipId: number | string, month: string, stepName: string) => void;
  setActivePopover: React.Dispatch<React.SetStateAction<ActivePopover | null>>;
}

export function ProcurementMilestonePopover({
  activePopover,
  equipData,
  formData,
  getMilestoneArray,
  handleMilestoneMultiToggle,
  setActivePopover
}: ProcurementMilestonePopoverProps) {
  return (
        <>
          <div
            onClick={() => setActivePopover(null)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, background: "transparent" }}
            role="button"
            tabIndex={0}
            aria-label="팝오버 닫기"
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}
          />
          <div
            style={{
              position: "fixed",
              top: `${activePopover.y}px`,
              left: `${activePopover.x}px`,
              transform: "translate(-50%, -100%) translateY(-10px)",
              background: "#ffffff", // 완전히 밝은 흰색 배경으로 교체
              border: "1px solid #cbd5e1", // 밝고 고상한 실버 테두리
              borderRadius: "8px",
              padding: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.15)", // 자연스러운 음영 그림자
              zIndex: 1251,
              width: "160px",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", textAlign: "center" }}>
              {activePopover.month}월 단계 중복 선택
            </div>
            {[
              { label: "기획 (P)", val: "기획", color: "#ea580c" }, // 밝은 배경에 선명한 오렌지
              { label: "승인 (A)", val: "승인", color: "#1d4ed8" }, // 선명한 다크 블루
              { label: "입찰 (B)", val: "입찰", color: "#0e7490" }, // 진한 시안
              { label: "구매 (Pr)", val: "구매", color: "#6d28d9" }, // 선명한 퍼플
              { label: "검수 (I)", val: "검수", color: "#047857" }  // 진한 에메랄드 그린
            ].map((step) => {
              let isChecked = false;
              if (activePopover.equipId === "NEW_FORM") {
                const currentList = getMilestoneArray(formData.milestones?.[activePopover.month]);
                isChecked = currentList.includes(step.val);
              } else {
                const activeEquipList = equipData;
                const targetEquip = activeEquipList.find(e => e.id === activePopover.equipId);
                const currentList = targetEquip ? getMilestoneArray(targetEquip.milestones?.[activePopover.month]) : [];
                isChecked = currentList.includes(step.val);
              }

              return (
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- 체크박스 라벨 전체의 기존 hover 강조를 유지하며 실제 조작은 내부 input이 담당합니다.
                <label
                  key={step.val}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.75rem",
                    color: "#0f172a", // 어두운 텍스트로 가독성 확보
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "0.2rem 0.35rem",
                    borderRadius: "4px",
                    transition: "background 0.1s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <input id="a11y-procurement-manager-58"
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMilestoneMultiToggle(activePopover.equipId, activePopover.month, step.val)}
                    style={{ cursor: "pointer", accentColor: step.color }}
                  />
                  <span style={{ color: step.color, fontWeight: "800" }}>{step.label}</span>
                </label>
              );
            })}
          </div>
        </>
  );
}
