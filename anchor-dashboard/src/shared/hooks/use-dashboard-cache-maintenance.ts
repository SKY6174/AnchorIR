import { useEffect } from "react";

type ErrorEventWithPayload = Event & {
  error?: unknown;
};

const getErrorText = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error || "");
};

export const useDashboardCacheMaintenance = () => {
  useEffect(() => {
    try {
      localStorage.removeItem("anchor_members");

      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("anchor_projects_data_") &&
          key !== "anchor_projects_data_v56"
        ) {
          localStorage.removeItem(key);
        }
        if (
          key.startsWith("anchor_cache_proj_") ||
          key.startsWith("anchor_cache_equip_") ||
          key.startsWith("anchor_cache_env_") ||
          key.startsWith("anchor_cache_serv_")
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("구버전 캐시 청소 실패:", error);
    }
  }, []);

  useEffect(() => {
    const handleGlobalError = (event: Event) => {
      if (event.type === "unhandledrejection") {
        return;
      }

      const error = (event as ErrorEventWithPayload).error;
      if (!error) return;

      const errorMessage = getErrorText(error);
      const isCriticalRenderError =
        errorMessage.includes("TypeError") ||
        errorMessage.includes("Cannot read properties") ||
        errorMessage.includes("undefined") ||
        errorMessage.includes("null") ||
        errorMessage.includes("is not a function");

      const isNetworkOrDbError =
        errorMessage.includes("PostgrestError") ||
        errorMessage.includes("supabase") ||
        errorMessage.includes("FetchError") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("constraint") ||
        errorMessage.includes("violation") ||
        errorMessage.includes("violates") ||
        errorMessage.includes("not-null") ||
        errorMessage.includes("database") ||
        errorMessage.includes("query") ||
        errorMessage.includes("RLS") ||
        errorMessage.includes("policy");

      if (!isCriticalRenderError || isNetworkOrDbError) {
        return;
      }

      console.error(
        "Critical rendering error caught by Self-Healing. Resetting cache:",
        errorMessage
      );
      const lastReset = localStorage.getItem(
        "anchor_last_self_healing_reset"
      );
      const now = Date.now();
      if (lastReset && now - parseInt(lastReset, 10) < 3000) {
        return;
      }

      localStorage.setItem("anchor_last_self_healing_reset", String(now));
      localStorage.removeItem("anchor_projects_data_v56");
      localStorage.removeItem("anchor_selected_kpi");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("anchor_cache_proj_")) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleGlobalError);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleGlobalError);
    };
  }, []);
};
