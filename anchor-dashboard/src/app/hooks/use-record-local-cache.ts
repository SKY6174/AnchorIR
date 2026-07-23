import { useEffect } from "react";
import type { LegacyAppRecord } from "../app-types";

type CacheWriter = (
  key: string,
  value: string,
  currentYear: number
) => void;

const stripEmbeddedFileData = (items: LegacyAppRecord[]) =>
  items.map((item) => {
    const isUrl =
      item.fileData &&
      (item.fileData.startsWith("http://") ||
        item.fileData.startsWith("https://"));
    const cleanFileData = isUrl ? item.fileData : null;
    return { ...item, fileData: cleanFileData };
  });

export const useAgreementLocalCache = (
  agreements: LegacyAppRecord[],
  safeSetLocalStorage: CacheWriter,
  getSelectedYear: () => number
) => {
  useEffect(() => {
    try {
      const agreementsForStorage = stripEmbeddedFileData(agreements);
      safeSetLocalStorage(
        "anchor_agreements_data_v1",
        JSON.stringify(agreementsForStorage),
        getSelectedYear()
      );
    } catch (error) {
      console.error("Failed to save agreements to localStorage:", error);
    }
  // oxlint-disable-next-line react/exhaustive-deps -- agreement changes own persistence; selectedYear is only quota-recovery context and must not cause duplicate writes.
  }, [agreements]);
};

export const useUnifiedCertificateLocalCache = (
  unifiedCertificates: LegacyAppRecord[],
  safeSetLocalStorage: CacheWriter,
  getSelectedYear: () => number
) => {
  useEffect(() => {
    try {
      const unifiedCertsForStorage =
        stripEmbeddedFileData(unifiedCertificates);
      safeSetLocalStorage(
        "anchor_unified_certificates_data_v1",
        JSON.stringify(unifiedCertsForStorage),
        getSelectedYear()
      );
    } catch (error) {
      console.error(
        "Failed to save unified certificates to localStorage:",
        error
      );
    }
  // oxlint-disable-next-line react/exhaustive-deps -- certificate changes own persistence; selectedYear is only quota-recovery context and must not cause duplicate writes.
  }, [unifiedCertificates]);
};

export const useScholarshipLocalCache = (
  scholarships: LegacyAppRecord[],
  safeSetLocalStorage: CacheWriter,
  getSelectedYear: () => number
) => {
  useEffect(() => {
    try {
      const clean = scholarships.map((item) => ({ ...item }));
      safeSetLocalStorage(
        "anchor_cache_scholarships_all",
        JSON.stringify(clean),
        getSelectedYear()
      );
    } catch (error) {
      console.error("Failed to save scholarships to localStorage:", error);
    }
  // oxlint-disable-next-line react/exhaustive-deps -- scholarship changes own persistence; selectedYear is only quota-recovery context and must not cause duplicate writes.
  }, [scholarships]);
};
