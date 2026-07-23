import React from "react";
import BudgetItemsManager from "../../../components/BudgetItemsManager";
import type { BudgetItemsManagerProps } from "../../../components/BudgetItemsManager";
import type { BudgetExecutionManagerProps } from "../../../components/BudgetExecutionManager";
import { TotalInvestmentManager } from "../components/total-investment-manager";
import type { TotalInvestmentManagerProps } from "../components/total-investment-manager";

const BudgetExecutionManager = React.lazy(
  () => import("../../../components/BudgetExecutionManager")
);

interface BudgetScreenProps {
  subTab: string;
  onChangeSubTab: (subTab: string) => void;
  investmentSubTab: TotalInvestmentManagerProps["investmentSubTab"];
  onChangeInvestmentSubTab: TotalInvestmentManagerProps["onChangeInvestmentSubTab"];
  investmentProjects: TotalInvestmentManagerProps["projects"];
  darkMode: boolean;
  selectedYear: number;
  projects: NonNullable<BudgetItemsManagerProps["projects"]>;
  currentRole: BudgetItemsManagerProps["currentRole"];
  onUpdateBudgetDetails: BudgetItemsManagerProps["onUpdateBudgetDetails"];
  supabase: BudgetExecutionManagerProps["supabase"];
}

export const BudgetScreen = ({
  subTab,
  onChangeSubTab,
  investmentSubTab,
  onChangeInvestmentSubTab,
  investmentProjects,
  darkMode,
  selectedYear,
  projects,
  currentRole,
  onUpdateBudgetDetails,
  supabase
}: BudgetScreenProps) => (
  <div className="budget-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    {/* 예산 관리 본문 가로 탭바 헤더 */}
    <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
      <button
        onClick={() => onChangeSubTab("total_investment")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "total_investment" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "total_investment" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        총괄 투자 계획
      </button>
      <button
        onClick={() => onChangeSubTab("budget_categories")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "budget_categories" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "budget_categories" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        비목별 관리
      </button>
      <button
        onClick={() => onChangeSubTab("execution_rate")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "execution_rate" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "execution_rate" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        집행률 관리
      </button>
    </div>

    {/* 본문 콘텐츠 스위칭 */}
    {subTab === "total_investment" ? (
      <TotalInvestmentManager
        investmentSubTab={investmentSubTab}
        onChangeInvestmentSubTab={onChangeInvestmentSubTab}
        projects={investmentProjects}
        selectedYear={selectedYear}
        darkMode={darkMode}
      />
    ) : subTab === "budget_categories" ? (
      <BudgetItemsManager
        key={`budget-items-${darkMode}-${selectedYear}`}
        projects={projects}
        currentRole={currentRole}
        onUpdateBudgetDetails={onUpdateBudgetDetails}
        selectedYear={selectedYear}
      />
    ) : subTab === "execution_rate" ? (
      <React.Suspense fallback={null}>
        <BudgetExecutionManager
          key={`budget-exec-${darkMode}-${selectedYear}`}
          projects={projects}
          currentRole={currentRole}
          selectedYear={selectedYear}
          supabase={supabase}
          darkMode={darkMode}
        />
      </React.Suspense>
    ) : null}
  </div>
);
