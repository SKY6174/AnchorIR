import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import {
  deleteEquipmentRecordsByYear,
  insertEquipmentRecords,
  upsertEquipmentAssets
} from "../services/procurement-data-service";

type EquipmentAutosaveOptions = {
  equipData: LegacyAppRecord[];
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  canWrite: boolean;
  fetchedEquipDataRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

type EquipmentInsertRecords =
  Parameters<typeof insertEquipmentRecords>[0];

const removeAdvancedEquipmentColumns = (
  insertPayload: EquipmentInsertRecords
): EquipmentInsertRecords =>
  insertPayload.map((item) => {
    const {
      date_p: _date_p,
      date_a: _date_a,
      date_b: _date_b,
      date_pr: _date_pr,
      date_i: _date_i,
      doc_plan: _doc_plan,
      doc_purchase: _doc_purchase,
      doc_bid: _doc_bid,
      ...rest
    } = item;
    return rest as EquipmentInsertRecords[number];
  });

export const useEquipmentAutosave = ({
  equipData,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  canWrite,
  fetchedEquipDataRef,
  safeSetLocalStorage,
  setSyncStatus
}: EquipmentAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!canWrite) return;

    if (!equipData || equipData.length === 0) return;

    const currentCleanStr = JSON.stringify(equipData);
    if (
      !fetchedEquipDataRef.current ||
      fetchedEquipDataRef.current === currentCleanStr
    ) {
      safeSetLocalStorage(
        `anchor_cache_equip_y${selectedYear}`,
        currentCleanStr,
        selectedYear
      );
      return;
    }

    safeSetLocalStorage(
      `anchor_cache_equip_y${selectedYear}`,
      currentCleanStr,
      selectedYear
    );
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await deleteEquipmentRecordsByYear(selectedYear);
        if (equipData.length > 0) {
          const insertPayload = equipData.map((item) => ({
            year: selectedYear,
            unit: item.unit || "A1",
            seq: Number(item.seq) || 1,
            dept_name: item.deptName || "",
            division_name: item.divisionName || "",
            item_name: item.itemName || item.name || "",
            unit_price: Number(item.unitPrice) || 0,
            quantity: Number(item.quantity) || 1,
            spec: item.spec || "",
            item_unit: item.itemUnit || "대",
            description: item.description || "",
            operation: item.operation || "교과목(정규)",
            password: item.password || "1234",
            related_docs:
              item.relatedDocs ||
              [item.docPlan, item.docPurchase, item.docBid]
                .filter(Boolean)
                .join(", "),
            doc_plan: item.docPlan || "",
            doc_purchase: item.docPurchase || "",
            doc_bid: item.docBid || "",
            date_p: item.dateP || null,
            date_a: item.dateA || null,
            date_b: item.dateB || null,
            date_pr: item.datePr || null,
            date_i: item.date_i || item.dateI || null,
            barcode: item.barcode || "",
            asset_number: item.asset_number || ""
          }));

          const assetsPayload = equipData
            .filter((item) => item.barcode)
            .map((item) => ({
              barcode_id: item.barcode,
              asset_number: item.asset_number || `AIDX-EQ-${item.id}`,
              item_name: item.itemName || item.name || "새 기자재 항목",
              dept_name: item.deptName || item.divisionName || "",
              unit_price: Number(item.unitPrice) || 0,
              quantity: Number(item.quantity) || 1,
              stock_location: item.location || "",
              memo: item.description || "",
              category:
                (item.itemName || item.name || "").includes("AI") ||
                (item.itemName || item.name || "").includes("DX")
                  ? "AI∙DX 자산"
                  : "기타자산",
              usage_type: "정규교과"
            }));

          if (assetsPayload.length > 0) {
            const { error: assetSyncErr } =
              await upsertEquipmentAssets(assetsPayload);
            if (assetSyncErr) {
              console.error(
                "equipment_assets 자산 동기화 실패:",
                assetSyncErr.message
              );
            }
          }

          let error = null;

          if (window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__) {
            const safePayload =
              removeAdvancedEquipmentColumns(insertPayload);
            const { error: retryErr } =
              await insertEquipmentRecords(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } =
              await insertEquipmentRecords(insertPayload);
            error = firstErr;

            if (error) {
              console.warn(
                "DB에 procurement_equipment 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.",
                error
              );
              window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = true;
              const safePayload =
                removeAdvancedEquipmentColumns(insertPayload);
              const { error: retryErr } =
                await insertEquipmentRecords(safePayload);
              error = retryErr;
            }
          }

          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to sync procurement_equipment:", error);
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  // oxlint-disable-next-line react/exhaustive-deps -- equipment data, year, and load guards own synchronization; auth restoration is a permission check, not a write trigger.
  }, [equipData, selectedYear, isDbLoaded, isFetchCompleted]);
};
