import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import {
  deleteAgreementsByYear,
  insertAgreements
} from "../services/agreement-service";

type AgreementsAutosaveOptions = {
  agreements: LegacyAppRecord[];
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  isAgreementsLoaded: boolean;
  canWrite: boolean;
  isAgreementsFetchedRef: { current: boolean };
  fetchedAgreementsRef: { current: string };
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

export const useAgreementsAutosave = ({
  agreements,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  isAgreementsLoaded,
  canWrite,
  isAgreementsFetchedRef,
  fetchedAgreementsRef,
  safeSetLocalStorage,
  setSyncStatus
}: AgreementsAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted || !isAgreementsLoaded) return;
    if (!isAgreementsFetchedRef.current) return;
    if (!canWrite) return;

    const currentCleanStr = JSON.stringify(agreements);
    if (
      !fetchedAgreementsRef.current ||
      fetchedAgreementsRef.current === currentCleanStr
    ) {
      try {
        const clean = agreements.map((item) => {
          const isUrl =
            item.fileData &&
            (item.fileData.startsWith("http://") ||
              item.fileData.startsWith("https://"));
          const cleanFileData = isUrl ? item.fileData : null;
          return { ...item, fileData: cleanFileData };
        });
        safeSetLocalStorage(
          "anchor_cache_agreements_all",
          JSON.stringify(clean),
          selectedYear
        );
      } catch (error) {
        console.warn("Failed to write agreements cache:", error);
      }
      return;
    }

    if (!agreements || agreements.length === 0) return;

    setSyncStatus("syncing");
    const syncImmediate = async () => {
      try {
        const activeYears = Array.from(
          new Set([selectedYear, ...agreements.map((item) => item.year)])
        );
        for (const year of activeYears) {
          await deleteAgreementsByYear(year);
          const filtered = agreements.filter((item) => item.year === year);
          if (filtered.length > 0) {
            const { error } = await insertAgreements(
              filtered.map((item) => {
                const rawDate = String(item.date || "").trim();
                const clean = rawDate.replace(/[^0-9-]/g, "");

                let finalDate = clean;
                if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
                  const dottedMatch = rawDate.match(
                    /^(\d{4})[./](\d{1,2})[./](\d{1,2})$/
                  );
                  if (dottedMatch) {
                    const yearPart = dottedMatch[1];
                    const monthPart = dottedMatch[2].padStart(2, "0");
                    const dayPart = dottedMatch[3].padStart(2, "0");
                    finalDate = `${yearPart}-${monthPart}-${dayPart}`;
                  } else if (/^\d{8}$/.test(clean)) {
                    finalDate =
                      `${clean.substring(0, 4)}-` +
                      `${clean.substring(4, 6)}-` +
                      clean.substring(6, 8);
                  } else if (/^\d{2}-\d{2}-\d{2}$/.test(clean)) {
                    finalDate = `20${clean}`;
                  } else if (/^\d{6}$/.test(clean)) {
                    finalDate =
                      `20${clean.substring(0, 2)}-` +
                      `${clean.substring(2, 4)}-` +
                      clean.substring(4, 6);
                  } else {
                    const baseYear =
                      item.year === 1
                        ? 2025
                        : item.year === 2
                          ? 2026
                          : item.year === 3
                            ? 2027
                            : item.year === 4
                              ? 2028
                              : 2029;
                    finalDate = `${baseYear}-05-15`;
                  }
                }

                return {
                  year: item.year,
                  date: finalDate,
                  center: item.center,
                  organizations: item.organizations,
                  subject_univ: item.subjectUniversity || "",
                  subject_org: item.subjectOrganization || "",
                  unit_id: item.unitId || "",
                  contents: item.contents || [],
                  file_name: item.fileName || null,
                  file_data: item.fileData || null,
                  agreement_type: item.agreementType || "-"
                };
              })
            );
            if (error) throw error;
          }
        }
        fetchedAgreementsRef.current = currentCleanStr;
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to sync agreements to Supabase:", error);
        setSyncStatus("error");
      }
    };
    void syncImmediate();
  // oxlint-disable-next-line react/exhaustive-deps -- agreement changes and load guards own synchronization; year and auth restoration must not overwrite remote data.
  }, [agreements, isDbLoaded, isFetchCompleted, isAgreementsLoaded]);
};
