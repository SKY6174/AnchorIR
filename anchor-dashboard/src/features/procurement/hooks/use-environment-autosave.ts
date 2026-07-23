import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import {
  deleteEnvironmentRecordsByYear,
  insertEnvironmentRecords
} from "../services/procurement-data-service";

type EnvironmentAutosaveOptions = {
  envData: LegacyAppRecord[];
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedEnvDataRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

type EnvironmentInsertRecords =
  Parameters<typeof insertEnvironmentRecords>[0];

const removeAdvancedEnvironmentColumns = (
  insertPayload: EnvironmentInsertRecords
): EnvironmentInsertRecords =>
  insertPayload.map((item) => {
    const {
      dept_name: _dept_name,
      division_name: _division_name,
      date_p: _date_p,
      date_a: _date_a,
      date_b: _date_b,
      date_pr: _date_pr,
      date_i: _date_i,
      doc_plan: _doc_plan,
      doc_purchase: _doc_purchase,
      doc_bid: _doc_bid,
      doc_plan_file_name: _doc_plan_file_name,
      doc_purchase_file_name: _doc_purchase_file_name,
      doc_bid_file_name: _doc_bid_file_name,
      doc_plan_file_size: _doc_plan_file_size,
      doc_purchase_file_size: _doc_purchase_file_size,
      doc_bid_file_size: _doc_bid_file_size,
      doc_plan_file_url: _doc_plan_file_url,
      doc_purchase_file_url: _doc_purchase_file_url,
      doc_bid_file_url: _doc_bid_file_url,
      ai_proposal_data: _ai_proposal_data,
      ai_purchase_data: _ai_purchase_data,
      ai_bid_data: _ai_bid_data,
      related_docs: _related_docs,
      ...rest
    } = item;
    return rest as EnvironmentInsertRecords[number];
  });

export const useEnvironmentAutosave = ({
  envData,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedEnvDataRef,
  safeSetLocalStorage,
  setSyncStatus
}: EnvironmentAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;

    if (!envData || envData.length === 0) return;

    const currentCleanStr = JSON.stringify(envData);
    if (
      !fetchedEnvDataRef.current ||
      fetchedEnvDataRef.current === currentCleanStr
    ) {
      safeSetLocalStorage(
        `anchor_cache_env_y${selectedYear}`,
        currentCleanStr,
        selectedYear
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_env_y${selectedYear}`,
      currentCleanStr,
      selectedYear
    );
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await deleteEnvironmentRecordsByYear(selectedYear);
        if (envData.length > 0) {
          const insertPayload = envData.map((item) => ({
            year: selectedYear,
            title: item.title,
            unit: item.unit,
            plan: item.plan,
            meeting_result: item.meetingResult,
            progress: item.progress,
            budget_plan: item.budgetPlan,
            budget_spent: item.budgetSpent,
            location: item.location,
            purpose: item.purpose,
            birdseye_view: item.birdseyeView,
            blueprints: item.blueprints,
            utilization: item.utilization,
            dept_name: item.deptName || "",
            division_name: item.divisionName || "",
            date_p: item.dateP || null,
            date_a: item.dateA || null,
            date_b: item.dateB || null,
            date_pr: item.datePr || null,
            date_i: item.dateI || null,
            doc_plan: item.docPlan || "",
            doc_purchase: item.docPurchase || "",
            doc_bid: item.docBid || "",
            doc_plan_file_name: item.docPlanFileName || "",
            doc_purchase_file_name: item.docPurchaseFileName || "",
            doc_bid_file_name: item.docBidFileName || "",
            doc_plan_file_size: Number(item.docPlanFileSize) || 0,
            doc_purchase_file_size: Number(item.docPurchaseFileSize) || 0,
            doc_bid_file_size: Number(item.docBidFileSize) || 0,
            doc_plan_file_url: item.docPlanFileUrl || "",
            doc_purchase_file_url: item.docPurchaseFileUrl || "",
            doc_bid_file_url: item.docBidFileUrl || "",
            ai_proposal_data: item.aiProposalData || null,
            ai_purchase_data: item.aiPurchaseData || null,
            ai_bid_data: item.aiBidData || null,
            related_docs: item.relatedDocs || ""
          }));

          let error = null;

          if (window.__HAS_NO_ADVANCED_ENV_COLUMNS__) {
            const safePayload =
              removeAdvancedEnvironmentColumns(insertPayload);
            const { error: retryErr } =
              await insertEnvironmentRecords(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } =
              await insertEnvironmentRecords(insertPayload);
            error = firstErr;

            if (error) {
              console.warn(
                "DB에 procurement_env 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.",
                error
              );
              window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = true;
              const safePayload =
                removeAdvancedEnvironmentColumns(insertPayload);
              const { error: retryErr } =
                await insertEnvironmentRecords(safePayload);
              error = retryErr;
            }
          }

          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch {
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  // oxlint-disable-next-line react/exhaustive-deps -- environment data, year, and load guards own synchronization; auth restoration is a permission check, not a write trigger.
  }, [envData, selectedYear, isDbLoaded, isFetchCompleted]);
};
