import React from "react";
import type { ProcurementManagerProps } from "../../../components/ProcurementManager";

const ProcurementManager = React.lazy(
  () => import("../../../components/ProcurementManager")
);

type ProcurementScreenProps = ProcurementManagerProps & {
  subTab: string;
  onChangeSubTab: (subTab: string) => void;
};

export const ProcurementScreen = ({
  darkMode,
  currentRole,
  currentUser,
  selectedYear,
  setSelectedYear,
  subTab,
  onChangeSubTab,
  envData,
  setEnvData,
  equipData,
  setEquipData,
  serviceData,
  setServiceData,
  projects
}: ProcurementScreenProps) => (
  <div className="procurement-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    {/* 구매용역 관리 본문 가로 탭바 헤더 */}
    <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
      <button
        onClick={() => onChangeSubTab("env_improvement")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "env_improvement" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "env_improvement" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        환경개선
      </button>
      <button
        onClick={() => onChangeSubTab("equipment_purchase")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "equipment_purchase" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "equipment_purchase" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        기자재 구입∙운영
      </button>
      <button
        onClick={() => onChangeSubTab("major_services")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "major_services" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "major_services" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        주요 용역
      </button>
    </div>

    {/* 본문 콘텐츠 */}
    <React.Suspense fallback={null}>
      <ProcurementManager
        key={`procurement-${darkMode}-${selectedYear}`}
        darkMode={darkMode}
        currentRole={currentRole}
        currentUser={currentUser}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        subTab={subTab}
        onChangeSubTab={onChangeSubTab}
        envData={envData}
        setEnvData={setEnvData}
        equipData={equipData}
        setEquipData={setEquipData}
        serviceData={serviceData}
        setServiceData={setServiceData}
        projects={projects}
      />
    </React.Suspense>
  </div>
);
