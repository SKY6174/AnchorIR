import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../../../app/app-types";
import {
  deleteScholarshipsByYear,
  deleteUnifiedCertificatesByYear,
  insertScholarships,
  insertUnifiedCertificates
} from "../services/management-record-service";

type CacheWriter = (
  key: string,
  value: string,
  currentYear: number
) => void;

type RecordAutosaveBase = {
  selectedYear: number;
  isDbLoaded: boolean;
  isFetchCompleted: boolean;
  isLoaded: boolean;
  canWrite: boolean;
  safeSetLocalStorage: CacheWriter;
  setSyncStatus: Dispatch<SetStateAction<string>>;
};

type UnifiedCertificateAutosaveOptions = RecordAutosaveBase & {
  unifiedCertificates: LegacyAppRecord[];
  fetchedUnifiedCertificatesRef: { current: string };
};

export const useUnifiedCertificateAutosave = ({
  unifiedCertificates,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  isLoaded,
  canWrite,
  fetchedUnifiedCertificatesRef,
  safeSetLocalStorage,
  setSyncStatus
}: UnifiedCertificateAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted || !isLoaded) return;
    if (!canWrite) return;

    const currentCleanStr = JSON.stringify(unifiedCertificates);
    const writeCache = () => {
      try {
        const clean = unifiedCertificates.map((item) => {
          const isUrl =
            item.fileData &&
            (item.fileData.startsWith("http://") ||
              item.fileData.startsWith("https://"));
          const cleanFileData = isUrl ? item.fileData : null;
          return { ...item, fileData: cleanFileData };
        });
        safeSetLocalStorage(
          "anchor_cache_unified_certificates_all",
          JSON.stringify(clean),
          selectedYear
        );
      } catch (error) {
        console.warn(
          "Failed to write unified certificates cache:",
          error
        );
      }
    };

    if (
      !fetchedUnifiedCertificatesRef.current ||
      fetchedUnifiedCertificatesRef.current === currentCleanStr
    ) {
      writeCache();
      return;
    }

    if (!unifiedCertificates || unifiedCertificates.length === 0) return;
    writeCache();
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const activeYears = Array.from(
          new Set([
            selectedYear,
            ...unifiedCertificates.map((item) => item.year)
          ])
        );
        for (const year of activeYears) {
          await deleteUnifiedCertificatesByYear(year);
          const filtered = unifiedCertificates.filter(
            (item) => item.year === year
          );
          if (filtered.length > 0) {
            const { error } = await insertUnifiedCertificates(
              filtered.map((item) => ({
                year: item.year,
                manager_dept: item.managerDept,
                manager_name: item.managerName,
                cert_no: item.certNo,
                cert_type: item.certType,
                note: item.note,
                team_name: item.teamName,
                recipient_name: item.recipientName,
                student_id: item.studentId,
                birth_date: item.birthDate,
                phone: item.phone,
                issue_date: item.issueDate,
                project_group: item.projectGroup,
                issuer: item.issuer,
                content: item.content,
                award_type: item.awardType || null
              }))
            );
            if (error) throw error;
          }
        }
        fetchedUnifiedCertificatesRef.current = currentCleanStr;
        setSyncStatus("synced");
      } catch (error) {
        console.error(
          "Failed to sync unified certificates to Supabase:",
          error
        );
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  // oxlint-disable-next-line react/exhaustive-deps -- certificate changes and load guards own synchronization; year and auth restoration must not trigger delete-and-reinsert writes.
  }, [unifiedCertificates, isDbLoaded, isFetchCompleted, isLoaded]);
};

type ScholarshipAutosaveOptions = RecordAutosaveBase & {
  scholarships: LegacyAppRecord[];
  fetchedScholarshipsRef: { current: string };
};

export const useScholarshipAutosave = ({
  scholarships,
  selectedYear,
  isDbLoaded,
  isFetchCompleted,
  isLoaded,
  canWrite,
  fetchedScholarshipsRef,
  safeSetLocalStorage,
  setSyncStatus
}: ScholarshipAutosaveOptions) => {
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted || !isLoaded) return;
    if (!canWrite) return;

    const currentCleanStr = JSON.stringify(scholarships);
    const writeCache = () => {
      try {
        const clean = scholarships.map((item) => ({ ...item }));
        safeSetLocalStorage(
          "anchor_cache_scholarships_all",
          JSON.stringify(clean),
          selectedYear
        );
      } catch (error) {
        console.warn("Failed to write scholarships cache:", error);
      }
    };

    if (
      !fetchedScholarshipsRef.current ||
      fetchedScholarshipsRef.current === currentCleanStr
    ) {
      writeCache();
      return;
    }

    if (!scholarships || scholarships.length === 0) return;
    writeCache();
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const activeYears = Array.from(
          new Set([
            selectedYear,
            ...scholarships.map((item) => item.year)
          ])
        );
        for (const year of activeYears) {
          await deleteScholarshipsByYear(year);
          const filtered = scholarships.filter(
            (item) => item.year === year
          );
          if (filtered.length > 0) {
            const payload = filtered.map((item) => ({
              year: item.year,
              dept: item.dept,
              major: item.major,
              course: item.course,
              student_id: item.studentId,
              name: item.name,
              resident_id: item.residentId,
              grade: item.grade,
              enroll_status: item.enrollStatus,
              reg_status: item.regStatus,
              amount: item.amount,
              bank_name: item.bankName,
              account_num: item.accountNum,
              account_holder: item.accountHolder,
              approval_date: item.approvalDate
            }));
            const { error } = await insertScholarships(payload);
            if (error) throw error;
          }
        }
        fetchedScholarshipsRef.current = currentCleanStr;
        setSyncStatus("synced");
      } catch (error) {
        console.error(
          "Failed to sync scholarships to Supabase:",
          error
        );
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  // oxlint-disable-next-line react/exhaustive-deps -- scholarship changes and load guards own synchronization; year and auth restoration must not trigger delete-and-reinsert writes.
  }, [scholarships, isDbLoaded, isFetchCompleted, isLoaded]);
};
