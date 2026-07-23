import { useEffect } from "react";
import type { LegacyAppRecord } from "../app-types";

type DashboardUiLifecycleOptions = {
  darkMode: boolean;
  activeTab: string;
  menuVisibility: LegacyAppRecord;
  isPrivilegedUser: boolean | null | undefined;
  setActiveTab: (tab: string) => void;
};

export const useDashboardUiLifecycle = ({
  darkMode,
  activeTab,
  menuVisibility,
  isPrivilegedUser,
  setActiveTab
}: DashboardUiLifecycleOptions) => {
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.documentElement.classList.add("light-mode");
    }
    localStorage.setItem("anchor_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (
      activeTab &&
      activeTab !== "dashboard" &&
      menuVisibility[activeTab] === false
    ) {
      if (!isPrivilegedUser) {
        setActiveTab("dashboard");
      }
    }
  }, [activeTab, menuVisibility, isPrivilegedUser, setActiveTab]);
};
