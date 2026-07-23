import { useEffect } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";

type KpiSelectionSetter = (kpi: LegacyAppRecord | null) => void;

type VisibleKpiSubTabGuardOptions = {
  activeTab: string;
  menuVisibility: LegacyAppRecord;
  kpiSubTab: string;
  displayProjects: LegacyAppRecord[];
  isPrivilegedUser: boolean | null | undefined;
  setKpiSubTab: (subTab: string) => void;
  setSelectedKpi: KpiSelectionSetter;
};

export const useVisibleKpiSubTabGuard = ({
  activeTab,
  menuVisibility,
  kpiSubTab,
  displayProjects,
  isPrivilegedUser,
  setKpiSubTab,
  setSelectedKpi
}: VisibleKpiSubTabGuardOptions) => {
  useEffect(() => {
    if (isPrivilegedUser) return;

    if (activeTab === "kpis" && menuVisibility) {
      const isStatusVisible = menuVisibility.kpi_status !== false;
      const isSelfVisible = menuVisibility.kpi_self !== false;
      const isFocusVisible = menuVisibility.kpi_focus !== false;

      const selectFirstKpi = (type: string) => {
        const first = displayProjects
          .flatMap((project) =>
            project.units.flatMap(
              (unit: LegacyAppRecord) => unit.kpis
            )
          )
          .find((kpi) => kpi.type === type);
        setSelectedKpi(first || null);
      };

      if (kpiSubTab === "공통" && !isStatusVisible) {
        if (isSelfVisible) {
          setKpiSubTab("자율");
          selectFirstKpi("자율");
        } else if (isFocusVisible) {
          setKpiSubTab("중점");
          selectFirstKpi("중점");
        }
      } else if (kpiSubTab === "자율" && !isSelfVisible) {
        if (isStatusVisible) {
          setKpiSubTab("공통");
          selectFirstKpi("공통");
        } else if (isFocusVisible) {
          setKpiSubTab("중점");
          selectFirstKpi("중점");
        }
      } else if (kpiSubTab === "중점" && !isFocusVisible) {
        if (isStatusVisible) {
          setKpiSubTab("공통");
          selectFirstKpi("공통");
        } else if (isSelfVisible) {
          setKpiSubTab("자율");
          selectFirstKpi("자율");
        }
      }
    }
  }, [
    activeTab,
    menuVisibility,
    kpiSubTab,
    displayProjects,
    isPrivilegedUser,
    setKpiSubTab,
    setSelectedKpi
  ]);
};

type KpiSelectionOptions = {
  activeTab: string;
  kpiSubTab: string;
  projects: LegacyAppRecord[];
  setSelectedKpi: KpiSelectionSetter;
};

export const useKpiSelection = ({
  activeTab,
  kpiSubTab,
  projects,
  setSelectedKpi
}: KpiSelectionOptions) => {
  useEffect(() => {
    if (activeTab === "kpis") {
      const firstKpi = projects
        .flatMap((project) =>
          project.units.flatMap(
            (unit: LegacyAppRecord) => unit.kpis || []
          )
        )
        .find((kpi) => (kpi ? kpi.type === kpiSubTab : false));

      setSelectedKpi(firstKpi || null);
    }
  }, [activeTab, kpiSubTab, projects, setSelectedKpi]);
};
