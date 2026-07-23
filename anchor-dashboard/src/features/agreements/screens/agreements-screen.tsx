import React from "react";
import type { AgreementManagerProps } from "../../../components/AgreementManager";
import type { ScholarshipManagerProps } from "../../../components/ScholarshipManager";
import type { UnifiedCertificateManagerProps } from "../../../components/UnifiedCertificateManager";

const AgreementManager = React.lazy(
  () => import("../../../components/AgreementManager")
);
const UnifiedCertificateManager = React.lazy(
  () => import("../../../components/UnifiedCertificateManager")
);
const ScholarshipManager = React.lazy(
  () => import("../../../components/ScholarshipManager")
);

interface AgreementsScreenProps {
  subTab: string;
  onChangeSubTab: (subTab: string) => void;
  darkMode: boolean;
  projects: NonNullable<AgreementManagerProps["projects"]>;
  agreements: AgreementManagerProps["agreements"];
  selectedYear: number;
  onAddAgreement: AgreementManagerProps["onAddAgreement"];
  onUpdateAgreement: AgreementManagerProps["onUpdateAgreement"];
  onDeleteAgreement: AgreementManagerProps["onDeleteAgreement"];
  setAgreements: AgreementManagerProps["setAgreements"];
  currentRole: AgreementManagerProps["currentRole"];
  certificates: UnifiedCertificateManagerProps["certificates"];
  onAddCertificate: UnifiedCertificateManagerProps["onAddCertificate"];
  onUpdateCertificate: UnifiedCertificateManagerProps["onUpdateCertificate"];
  onDeleteCertificate: UnifiedCertificateManagerProps["onDeleteCertificate"];
  setCertificates: UnifiedCertificateManagerProps["setCertificates"];
  members: NonNullable<UnifiedCertificateManagerProps["members"]>;
  scholarships: ScholarshipManagerProps["scholarships"];
  setScholarships: ScholarshipManagerProps["setScholarships"];
}

export const AgreementsScreen = ({
  subTab,
  onChangeSubTab,
  darkMode,
  projects,
  agreements,
  selectedYear,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  setAgreements,
  currentRole,
  certificates,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  setCertificates,
  members,
  scholarships,
  setScholarships
}: AgreementsScreenProps) => (
  <div className="agreements-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
    {/* 협약·발급 관리 본문 가로 탭바 헤더 (예산 탭바와 스타일 완전 대칭화) */}
    <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
      <button
        onClick={() => onChangeSubTab("agreements")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "agreements" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "agreements" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        협약 관리
      </button>
      <button
        onClick={() => onChangeSubTab("unified_certificates")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "unified_certificates" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "unified_certificates" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        상장·이수증 관리
      </button>
      <button
        onClick={() => onChangeSubTab("scholarships")}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          fontWeight: "800",
          cursor: "pointer",
          padding: "0.5rem 1rem",
          color: subTab === "scholarships" ? "var(--accent-color)" : "var(--text-secondary)",
          borderBottom: subTab === "scholarships" ? "2px solid var(--accent-color)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        장학금 관리
      </button>
    </div>

    <div className="glass-card" style={{ padding: "1.25rem" }}>
      {/* 협약서 서브탭 활성화 시 협약서 단독 매니저 마운트 */}
      {subTab === "agreements" && (
        <React.Suspense fallback={null}>
          <AgreementManager
            key={`agreement-${darkMode}-${selectedYear}`}
            projects={projects}
            agreements={agreements}
            selectedYear={selectedYear}
            onAddAgreement={onAddAgreement}
            onUpdateAgreement={onUpdateAgreement}
            onDeleteAgreement={onDeleteAgreement}
            setAgreements={setAgreements}
            currentRole={currentRole}
          />
        </React.Suspense>
      )}

      {/* 통합 상장/이수증 서브탭 활성화 시 통합 매니저 마운트 */}
      {subTab === "unified_certificates" && (
        <React.Suspense fallback={null}>
          <UnifiedCertificateManager
            key={`unified-certificate-${darkMode}-${selectedYear}`}
            projects={projects}
            certificates={certificates}
            selectedYear={selectedYear}
            onAddCertificate={onAddCertificate}
            onUpdateCertificate={onUpdateCertificate}
            onDeleteCertificate={onDeleteCertificate}
            setCertificates={setCertificates}
            currentRole={currentRole}
            members={members}
          />
        </React.Suspense>
      )}

      {/* 장학금 관리 서브탭 활성화 시 장학금 매니저 마운트 */}
      {subTab === "scholarships" && (
        <React.Suspense fallback={null}>
          <ScholarshipManager
            key={`scholarship-${darkMode}-${selectedYear}`}
            scholarships={scholarships}
            setScholarships={setScholarships}
            selectedYear={selectedYear}
            currentRole={currentRole}
            members={members}
          />
        </React.Suspense>
      )}
    </div>
  </div>
);
