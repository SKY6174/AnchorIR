import React from "react";
import type { AssetManagerProps } from "../../../components/AssetManager";

const AssetManager = React.lazy(
  () => import("../../../components/AssetManager")
);

export const AssetScreen = ({
  currentRole,
  currentUser,
  activeSubTab,
  onChangeSubTab,
  darkMode,
  selectedYear
}: AssetManagerProps) => (
  <div className="asset-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    <React.Suspense fallback={null}>
      <AssetManager
        currentRole={currentRole}
        currentUser={currentUser}
        activeSubTab={activeSubTab}
        onChangeSubTab={onChangeSubTab}
        darkMode={darkMode}
        selectedYear={selectedYear}
      />
    </React.Suspense>
  </div>
);
