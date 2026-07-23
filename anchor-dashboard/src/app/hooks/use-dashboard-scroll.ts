import { useEffect } from "react";

type DashboardScrollOptions = {
  activeTab: string;
  projectsSubTab: string;
  mgmtSubTab: string;
  kpiSubTab: string;
  selectedProgId: string | null;
  committeeSubTab: string;
  setIsScrollRestored: (restored: boolean) => void;
};

export const useDashboardScroll = ({
  activeTab,
  projectsSubTab,
  mgmtSubTab,
  kpiSubTab,
  selectedProgId,
  committeeSubTab,
  setIsScrollRestored
}: DashboardScrollOptions) => {
  useEffect(() => {
    const mainEl = document.querySelector(".main-content");
    if (!mainEl) {
      setIsScrollRestored(true);
      return;
    }

    setIsScrollRestored(false);

    const handleSaveScroll = () => {
      localStorage.setItem("anchor_scroll_y", String(mainEl.scrollTop));
    };

    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (mainEl.scrollTop > 0) {
          localStorage.setItem("anchor_scroll_y", String(mainEl.scrollTop));
        }
      }, 150);
    };

    window.addEventListener("beforeunload", handleSaveScroll);
    mainEl.addEventListener("scroll", handleScroll);

    const savedScrollY = localStorage.getItem("anchor_scroll_y");
    let hasSavedScroll = false;

    if (savedScrollY) {
      const scrollY = parseInt(savedScrollY, 10);
      if (scrollY > 0) {
        hasSavedScroll = true;
        setTimeout(() => {
          if (mainEl) mainEl.scrollTop = scrollY;
          setIsScrollRestored(true);
        }, 120);
        setTimeout(() => {
          if (mainEl) mainEl.scrollTop = scrollY;
        }, 350);
        setTimeout(() => {
          if (mainEl) mainEl.scrollTop = scrollY;
        }, 600);
      }
    }

    if (!hasSavedScroll) {
      setTimeout(() => {
        setIsScrollRestored(true);
      }, 50);
    }

    return () => {
      window.removeEventListener("beforeunload", handleSaveScroll);
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  // oxlint-disable-next-line react/exhaustive-deps -- scroll restoration intentionally runs once on mount.
  }, []);

  useEffect(() => {
    const mainEl = document.querySelector(".main-content");
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [
    activeTab,
    projectsSubTab,
    mgmtSubTab,
    kpiSubTab,
    selectedProgId,
    committeeSubTab
  ]);
};
