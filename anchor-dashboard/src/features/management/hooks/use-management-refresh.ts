import { useEffect } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";

type RefreshAction = () => void | Promise<void>;

export const useRegisteredUsersRefresh = (
  activeTab: string,
  currentUser: LegacyAppRecord | null,
  members: LegacyAppRecord[],
  fetchRegisteredUsers: RefreshAction
) => {
  useEffect(() => {
    if (
      activeTab === "management" &&
      currentUser &&
      currentUser.role?.rank <= 2
    ) {
      void fetchRegisteredUsers();
    }
  // oxlint-disable-next-line react/exhaustive-deps -- tab, user, and member changes own this refresh; the render-local fetcher must not trigger repeated account queries.
  }, [activeTab, currentUser, members]);
};

export const useApprovalDataRefresh = (
  activeTab: string,
  mgmtSubTab: string,
  fetchVersionRequests: RefreshAction,
  fetchReservations: RefreshAction
) => {
  useEffect(() => {
    if (activeTab === "management" && mgmtSubTab === "approvals") {
      void fetchVersionRequests();
      void fetchReservations();
    }
  // oxlint-disable-next-line react/exhaustive-deps -- active management tab state owns refresh; render-local fetchers must not retrigger the effect.
  }, [activeTab, mgmtSubTab]);
};
