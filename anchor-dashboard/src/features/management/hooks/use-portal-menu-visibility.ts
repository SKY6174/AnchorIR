import { useEffect } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import { fetchMenuVisibility } from "../services/portal-config-service";

type PortalMenuVisibilityOptions = {
  currentUser: unknown;
  setMenuVisibility: (visibility: LegacyAppRecord) => void;
};

export const usePortalMenuVisibility = ({
  currentUser,
  setMenuVisibility
}: PortalMenuVisibilityOptions) => {
  useEffect(() => {
    const fetchPortalConfig = async () => {
      try {
        const { data, error } = await fetchMenuVisibility();

        if (
          !error &&
          data &&
          data.value &&
          typeof data.value === "object" &&
          !Array.isArray(data.value)
        ) {
          const merged = {
            committee: true,
            committee_meeting: true,
            committee_report: true,
            ...(data.value as LegacyAppRecord)
          };
          setMenuVisibility(merged);
          localStorage.setItem(
            "anchor_menu_visibility",
            JSON.stringify(merged)
          );
        }
      } catch (error) {
        console.error("Failed to fetch portal config from DB:", error);
      }
    };

    if (currentUser) {
      void fetchPortalConfig();
    }
  }, [currentUser, setMenuVisibility]);
};
