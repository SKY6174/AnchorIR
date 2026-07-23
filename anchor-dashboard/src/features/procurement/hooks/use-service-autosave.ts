import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import {
  deleteServiceRecordsByYear,
  insertServiceRecords
} from "../services/procurement-data-service";

type ServiceAutosaveOptions = {
  serviceData: LegacyAppRecord[];
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedServiceDataRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

export const useServiceAutosave = ({
  serviceData,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedServiceDataRef,
  safeSetLocalStorage,
  setSyncStatus
}: ServiceAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;

    if (!serviceData || serviceData.length === 0) return;

    const currentCleanStr = JSON.stringify(serviceData);
    if (
      !fetchedServiceDataRef.current ||
      fetchedServiceDataRef.current === currentCleanStr
    ) {
      safeSetLocalStorage(
        `anchor_cache_serv_y${selectedYear}`,
        currentCleanStr,
        selectedYear
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_serv_y${selectedYear}`,
      currentCleanStr,
      selectedYear
    );
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await deleteServiceRecordsByYear(selectedYear);
        if (serviceData.length > 0) {
          const insertPayload = serviceData.map((item) => ({
            year: selectedYear,
            unit: item.unit || "A1",
            program_id: item.programId || "",
            program_name: item.programName || "",
            dept_name: item.deptName || "",
            division_name: item.divisionName || "",
            password: item.password || "1234",
            related_docs: item.relatedDocs || "",
            title: item.title,
            purpose: item.purpose,
            provider_qual: item.providerQual,
            step: item.step || 1,
            budget_plan: item.budgetPlan,
            budget_spent: item.budgetSpent,
            op_result: item.opResult,
            date_pp: item.datePp || null,
            date_rfo: item.dateRfo || null,
            date_b: item.dateB || null,
            date_es: item.dateEs || null,
            date_c: item.dateC || null,
            date_e: item.dateE || null,
            date_i: item.dateI || null,
            doc_plan: item.docPlan || "",
            doc_purchase: item.docPurchase || "",
            doc_bid: item.doc_bid || item.docBid || "",
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
            ai_bid_data: item.aiBidData || null
          }));

          let error = null;

          if (window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__) {
            const safePayload = insertPayload.map((item) => ({
              year: item.year,
              title: item.title,
              step: item.step,
              budget_plan: item.budget_plan,
              budget_spent: item.budget_spent,
              op_result: item.op_result
            }));
            const { error: retryErr } =
              await insertServiceRecords(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } =
              await insertServiceRecords(insertPayload);
            error = firstErr;

            if (error) {
              console.warn(
                "DB에 procurement_services 고도화 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.",
                error
              );
              window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = true;
              const safePayload = insertPayload.map((item) => ({
                year: item.year,
                title: item.title,
                step: item.step,
                budget_plan: item.budget_plan,
                budget_spent: item.budget_spent,
                op_result: item.op_result
              }));
              const { error: retryErr } =
                await insertServiceRecords(safePayload);
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
  // oxlint-disable-next-line react/exhaustive-deps -- service data, year, and load guards own synchronization; auth restoration is a permission check, not a write trigger.
  }, [serviceData, selectedYear, isDbLoaded, isFetchCompleted]);
};
