import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import Sidebar from "./components/Sidebar";
import KPIOverview from "./components/KPIOverview";
const CommitteeExternalVote = React.lazy(() => import("./components/CommitteeExternalVote"));
const SatisfactionManager = React.lazy(() => import("./components/SatisfactionManager"));
const ProcurementManager = React.lazy(() => import("./components/ProcurementManager"));
const ScheduleManager = React.lazy(() => import("./components/ScheduleManager"));
const AgreementManager = React.lazy(() => import("./components/AgreementManager"));
const UnifiedCertificateManager = React.lazy(() => import("./components/UnifiedCertificateManager"));
const ScholarshipManager = React.lazy(() => import("./components/ScholarshipManager"));
const InstructorPoolManager = React.lazy(() => import("./components/InstructorPoolManager"));
const PDCAManager = React.lazy(() => import("./components/PDCAManager"));
const BudgetExecutionManager = React.lazy(() => import("./components/BudgetExecutionManager"));
const MajorProgramsManager = React.lazy(() => import("./components/MajorProgramsManager"));
const PartnerManager = React.lazy(() => import("./components/PartnerManager"));
const AssetManager = React.lazy(() => import("./components/AssetManager"));
import BudgetItemsManager from "./components/BudgetItemsManager";
import ProgramProgressManager from "./components/ProgramProgressManager";
import SurveyResponder from "./components/SurveyResponder";
import LLMWiki from "./components/LLMWiki";
import OrgChartManager from "./components/OrgChartManager";
import CenterOrgChartManager from "./components/CenterOrgChartManager";
import PortalConfigManager from "./components/PortalConfigManager";
import AuthManager from "./components/AuthManager";
import CommitteeManager from "./components/CommitteeManager";
import UnitSystemView from "./components/UnitSystemView";
import { initialProjectsData } from "./data/mockData";
import type { ProjectData } from "./data/mockData";
import type { AgreementItem } from "./components/AgreementManager";
import type { ScholarshipItem } from "./components/ScholarshipManager";
import type { CommitteeMember } from "./components/CommitteeManager";
import type { ProcurementItem } from "./components/ProcurementManager";
import type { ScheduleCommitteeMember } from "./components/ScheduleManager";
import { Sun, Moon, LogOut, HelpCircle, Lock as LockIcon, Info, Clock, Edit2, FileText, Upload, Plus, Download, X, BookOpen, FileSpreadsheet } from "lucide-react";
import { supabase } from "./supabaseClient";
import { parseCommitteeVotePath } from "./utils/committee-short-link";
import type { AssetReservation, Html2PdfFactory, LegacyAppRecord, LegacyYearRecord, ProgramVersionRequest, RiseMemberInsert, ScheduleEventInsert, ScheduleMeetingInsert, ScheduleMonthlyInsert } from "./app/app-types";
import { INITIAL_AGREEMENTS, INITIAL_MEMBERS } from "./app/app-seed-data";
import { formatAssignee, formatDataToMultiYear, formatToMillionWon, getCalculatedYearFromDate, getCleanProjectsForStorage, getErrorMessage, getNormalizedKpi, getRealUnitId, mergeProjectsWithInitial, migrateProgramIds, recalculateCarryOver } from "./app/app-data-utils";
import { useDashboardScroll } from "./app/hooks/use-dashboard-scroll";
import { useDashboardUiLifecycle } from "./app/hooks/use-dashboard-ui-lifecycle";
import { useAgreementLocalCache, useScholarshipLocalCache, useUnifiedCertificateLocalCache } from "./app/hooks/use-record-local-cache";
import { useAgreementsAutosave } from "./features/agreements/hooks/use-agreements-autosave";
import { useApprovedAuthSession } from "./features/auth/hooks/use-approved-auth-session";
import { deleteAssetReservation, deleteVersionRequest, fetchAssetReservations, fetchPendingVersionRequests, fetchVersionRequests as fetchVersionRequestRecords, updateAssetReservation, updateVersionRequestStatus } from "./features/management/services/approval-service";
import { deleteRiseUserAccount, fetchRiseUserAccounts } from "./features/management/services/account-service";
import { useScholarshipAutosave, useUnifiedCertificateAutosave } from "./features/management/hooks/use-management-record-autosave";
import { deleteRiseMember, fetchRiseMembers, insertRiseMember, upsertRiseMember, upsertRiseMembers } from "./features/management/services/member-service";
import { saveMenuVisibility } from "./features/management/services/portal-config-service";
import { useApprovalDataRefresh, useRegisteredUsersRefresh } from "./features/management/hooks/use-management-refresh";
import { usePortalMenuVisibility } from "./features/management/hooks/use-portal-menu-visibility";
import { deleteEnvironmentRecordsByYear, deleteEquipmentRecordsByYear, deleteServiceRecordsByYear, insertEnvironmentRecords, insertEquipmentRecords, insertServiceRecords, probeProcurementAdvancedColumns, upsertEquipmentAssets } from "./features/procurement/services/procurement-data-service";
import { deletePressReleasesByIds, fetchPressReleaseIds, insertPressRelease, insertPressReleases } from "./features/press/services/press-release-service";
import { fetchDashboardSources, updateProjectData, upsertProjectData } from "./features/projects/services/project-data-service";
import { useProjectAutosave } from "./features/projects/hooks/use-project-autosave";
import { useKpiSelection, useVisibleKpiSubTabGuard } from "./features/projects/hooks/use-kpi-selection-lifecycle";
import { useProjectLocalBackup } from "./features/projects/hooks/use-project-local-backup";
import { useJointProgramDetection, useProjectFetchReset, useProjectNormalization } from "./features/projects/hooks/use-project-state-lifecycle";
import { deleteMonthlySchedulesByIds, deleteMonthlySchedulesByYear, deleteScheduleEventsByIds, deleteScheduleEventsByYear, deleteScheduleMeetingsByIds, deleteScheduleMeetingsByYear, fetchScheduleEventIds, fetchScheduleEventsForYearRepair, fetchScheduleMeetingIds, fetchScheduleMeetingsForYearRepair, fetchStandaloneMonthlyScheduleIds, insertMonthlySchedules, insertScheduleEvents, insertScheduleMeetings, updateScheduleEventYear, updateScheduleMeetingYear, upsertMonthlySchedules, upsertScheduleEvents, upsertScheduleMeetings } from "./features/schedule/services/schedule-data-service";
import { useDashboardCache } from "./shared/hooks/use-dashboard-cache";
import { useDashboardCacheMaintenance } from "./shared/hooks/use-dashboard-cache-maintenance";
import { useActiveTabPersistence, useLocalStorageJson, useLocalStorageValue, useOptionalLocalStorageJson, useOptionalLocalStorageValue } from "./shared/hooks/use-local-storage-persistence";
import { useSyncBeforeUnload } from "./shared/hooks/use-sync-before-unload";
import "./styles/dashboard.css";


declare const html2pdf: Html2PdfFactory;





// LaTeX 수식 파서 및 HTML 렌더러 컴포넌트
const RenderLatexFormula = ({ formula }: { formula?: string }) => {
  if (!formula) return null;

  // 전체 컨테이너 스타일
  const containerStyle: CSSProperties = {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    background: "rgba(255,255,255,0.01)",
    padding: "0.6rem 0.8rem",
    borderRadius: "0.4rem",
    border: "1px solid var(--border-color)",
    width: "100%",
    boxSizing: "border-box"
  };

  // 1단계: LaTeX 문자열에서 오염된 text{...} 구조와 제어문자들을 완전히 평문화
  const purifyLatexString = (str: string) => {
    if (!str) return "";
    return str
      // \text{...} 또는 [Tab]ext{...} 구조 매칭하여 중괄호 안의 글자만 추출
      .replace(/(?:\\text|[\t]ext)\{([^}]+)\}/g, "$1")
      // 혹시 백슬래시 탈락해서 남은 text{...} 및 ext{...} 정화
      .replace(/(?:text|ext)\{([^}]+)\}/g, "$1")
      // LaTeX 퍼센트 이스케이프 복구
      .replace(/\\%/g, "%")
      // 남은 백슬래시 제거
      .replace(/\\/g, "");
  };

  // 먼저 전체 수식 문자열을 평문화 처리한다! (중괄호 중첩 구조가 여기서 선제 정화됨)
  const purifiedFormula = purifyLatexString(formula);

  // 2단계: 평문화된 수식에서 분수 및 연산자 파싱
  // 2.1. 만약 수식에 "="이 있다면 (C-1 ~ C-6 공식 등)
  if (purifiedFormula.includes("=")) {
    const parts = purifiedFormula.split("=");
    const label = parts[0].trim();
    const rightSide = parts[1].trim();

    // 평문화 상태이므로 단순히 frac{분자}{분모} 구조만 감지하면 됨! (오염된 rac도 지원)
    const fracMatch = rightSide.match(/(?:frac|rac)\{([^}]+)\}\s*\{([^}]+)\}/);
    if (fracMatch) {
      const num = fracMatch[1].trim();
      const den = fracMatch[2].trim();

      const timesMatch = rightSide.match(/times\s*([\d.]+)/);
      const weight = timesMatch ? timesMatch[1] : null;

      return (
        <div style={containerStyle}>
          {label && (
            <span style={{ fontWeight: "800", color: "var(--accent-color)", marginRight: "0.4rem" }}>
              {label} =
            </span>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
              <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
              <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{den}</span>
            </div>
            {weight && (
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                × {weight}
              </span>
            )}
          </div>
        </div>
      );
    }
  }

  // 2.2. 일반 다항식 분수라면 (L-1 ~ L-24 공식 등)
  const containsFrac = purifiedFormula.includes("frac") || purifiedFormula.includes("rac");
  if (!containsFrac) {
    return <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{purifiedFormula}</span>;
  }

  const terms = purifiedFormula.split("+");

  return (
    <div style={containerStyle}>
      {terms.map((termStr, index) => {
        const trimmed = termStr.trim();
        const fracMatch = trimmed.match(/(?:frac|rac)\{([^}]+)\}\s*\{([^}]+)\}(?:\s*times\s*([\d.]+))?/);

        if (fracMatch) {
          const num = fracMatch[1].trim();
          const den = fracMatch[2].trim();
          const weight = fracMatch[3];

          return (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary)" }}>+</span>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "65px" }}>
                  <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
                  <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{den}</span>
                </div>
                {weight && (
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                    × {weight}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={index}>
            {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary)" }}>+</span>}
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{trimmed}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)

// 월별 추진일정 상세 대조 렌더러
const renderTimelineDiff = (timelineStr?: string) => {
  const parts = (timelineStr || "").split(",").map((p: string) => p.trim());
  const months = ["25.3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", "26.1월", "2월"];

  const getStatusColor = (v: string) => {
    if (!v || typeof v !== "string") return "transparent";
    if (v.startsWith("P/D")) return "#1e3a8a";
    if (v.startsWith("D/C")) return "#064e3b";
    if (v.startsWith("C/A")) return "#78350f";
    if (v.startsWith("P")) return "#2563eb";
    if (v.startsWith("D")) return "#10b981";
    if (v.startsWith("C")) return "#f59e0b";
    if (v.startsWith("A")) return "#d946ef";
    return "transparent";
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.15rem", marginTop: "0.4rem", width: "100%", maxWidth: "360px" }}>
      {months.map((m, idx) => {
        const val = parts[idx] || "";
        const bg = getStatusColor(val);
        const hasValue = val && val !== "-";

        return (
          <div key={idx} style={{ textAlign: "center", minWidth: "25px" }}>
            {/* 윗줄: 월 표시 */}
            <div style={{ fontSize: "0.55rem", color: "var(--text-secondary)", marginBottom: "0.12rem", whiteSpace: "nowrap" }}>
              {m}
            </div>
            {/* 아랫줄: P, D, C, A 일정 표기 */}
            <div
              style={{
                padding: "0.08rem 0",
                fontSize: "0.58rem",
                background: bg !== "transparent" ? bg : "rgba(255,255,255,0.02)",
                color: bg !== "transparent" ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "3px",
                fontWeight: bg !== "transparent" ? "800" : "normal",
                minHeight: "0.88rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {hasValue ? val : "-"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 비목별 예산 배정 상세 대조 렌더러
const renderBudgetCategoriesDiff = (categories?: LegacyAppRecord[]) => {
  const validList = (categories || []).filter((c: LegacyAppRecord) => c.category);
  if (validList.length === 0) {
    return <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>등록된 비목별 예산이 없습니다.</div>;
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem", marginTop: "0.3rem" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
          <th style={{ textAlign: "left", padding: "0.2rem" }}>비목명</th>
          <th style={{ textAlign: "right", padding: "0.2rem" }}>본예산</th>
          <th style={{ textAlign: "right", padding: "0.2rem" }}>이월예산</th>
        </tr>
      </thead>
      <tbody>
        {validList.map((c, idx) => (
          <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
            <td style={{ padding: "0.2rem", color: "var(--text-primary)" }}>{c.category}</td>
            <td style={{ textAlign: "right", padding: "0.2rem", color: "var(--text-primary)" }}>{c.budget ? (parseFloat(c.budget) / 1000000).toFixed(1) + "백만원" : "-"}</td>
            <td style={{ textAlign: "right", padding: "0.2rem", color: "var(--text-primary)" }}>{c.budget_carry ? (parseFloat(c.budget_carry) / 1000000).toFixed(1) + "백만원" : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function App() {
  const { getIndexedDBCache, safeSetLocalStorage } = useDashboardCache();
  useDashboardCacheMaintenance();

  const [isScrollRestored, setIsScrollRestored] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  const currentRole = currentUser ? currentUser.role : null;

  const roleKey = currentUser?.role_key || currentUser?.role?.id || "";
  const isSongDirector = currentUser && (
    (currentUser.name || "").includes("송경영") ||
    roleKey === "TEAM_LEADER" ||
    roleKey === "ADMIN" ||
    roleKey === "G_DIRECTOR" ||
    roleKey === "HQ_HEAD" ||
    roleKey === "MANAGER" ||
    currentUser.role === "사업단장" ||
    currentUser.role === "운영팀장" ||
    currentUser.id === "manager"
  );

  const [menuVisibility, setMenuVisibility] = useState(() => {
    const cached = localStorage.getItem("anchor_menu_visibility");
    const defaultVisibility = {
      dashboard: true,
      progress: true,
      progress_status: true,
      major_programs: true,
      satisfaction_survey: true,
      projects: true,
      unit_status: true,
      unit_system: true,
      program_mgmt: true,
      kpis: true,
      kpi_status: true,
      kpi_self: true,
      kpi_focus: true,
      budget: true,
      settlement: true,
      execution: true,
      procurement: true,
      env_improvement: true,
      equipment_purchase: true,
      major_services: true,
      agreements: true,
      unified_certificates: true,
      committee: true,
      committee_meeting: true,
      committee_report: true,
      schedule: true,
      monthly: true,
      events: true,
      meetings: true,
      committees: true,
      press: true,
      management: true,
      approvals: true,
      members: true,
      users: true,
      programs: true,
      org_chart: true,
      partners: true
    };

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // 캐시 오염 복구: 기존 캐시 객체 내에 projects 키가 없거나 false 일 시 강제로 true 복구 적용
        if (parsed.projects === undefined || parsed.projects === false) {
          parsed.projects = true;
          parsed.unit_status = true;
          parsed.unit_system = true;
          parsed.program_mgmt = true;
        }
        if (parsed.committee === undefined) {
          parsed.committee = true;
          parsed.committee_meeting = true;
          parsed.committee_report = true;
        }
        return { ...defaultVisibility, ...parsed };
      } catch {
        return defaultVisibility;
      }
    }
    return defaultVisibility;
  });

  const handleSaveMenuVisibility = async (nextVisibility: LegacyAppRecord) => {
    setMenuVisibility(nextVisibility);
    localStorage.setItem("anchor_menu_visibility", JSON.stringify(nextVisibility));

    // Supabase DB에 설정 저장 동기화 (RLS 403 에러 발생 시 콘솔 경고 소멸 후 로컬 캐시 폴백)
    try {
      const { error } = await saveMenuVisibility(nextVisibility);
      if (error) {
        console.warn("portal_configs DB 적재 스킵 (로컬 스토리지 캐시 전담):", error.message);
      }
    } catch (err: any) {
      console.warn("DB save error (로컬 전담):", err.message);
    }
  };

  // 로그인 성공 혹은 세션 로드 시 Supabase DB로부터 마스터 포털 노출 설정 수신
  usePortalMenuVisibility({ currentUser, setMenuVisibility });

  const [projects, setProjects] = useState<LegacyAppRecord[]>(() => {
    // 💡 [깜빡임 방지 최우선 처리] 현재 로컬 선택 연도별 캐시 데이터를 최우선적으로 선제 로드하여 0초 반응을 제공합니다.
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_proj_y${savedYear}_v56`) || localStorage.getItem("anchor_projects_data_v56");
    const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));
    if (cached) {
      try {
        const loaded = migrateProgramIds(JSON.parse(cached));
        // [공통 병합] 캐시 데이터와 초기 템늘릿 데이터를 정밀 머지합니다.
        return mergeProjectsWithInitial(loaded, multiYearInitialData);
      } catch (e) {
        console.error("Failed to parse cached projects data:", e);
      }
    }
    return multiYearInitialData;
  });
  const [activeTab, setActiveTab] = useState(() => {
    // 💡 URL 패스가 /sv/로 시작하면 설문 응답 모드로 즉시 기동 (SPA 라우터 폴백 대응)
    if (window.location.pathname.startsWith("/sv/")) {
      return "survey_respond";
    }
    const cachedTab = localStorage.getItem("anchor_active_tab");
    // 💡 [교육용 한글 주석] survey_respond 탭은 모바일 임시 설문조사 화면이므로,
    // 일반적인 메인 페이지 진입 시에는 기본 탭인 'dashboard'로 되돌려 오류를 방지합니다.
    if (cachedTab === "survey_respond") {
      return "dashboard";
    }
    return cachedTab || "dashboard";
  });

  // 결재 변경 승인요청 상태 및 상세 보기 모달 제어용
  const [versionRequests, setVersionRequests] = useState<ProgramVersionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProgramVersionRequest | null>(null);
  const [approvalsTab, setApprovalsTab] = useState(() => {
    const savedLogged = localStorage.getItem("anchor_logged_in_user");
    if (savedLogged) {
      try {
        const u = JSON.parse(savedLogged);
        const name = u.name || "";
        if (["이규상", "임은애", "황수진", "최주명"].some(n => name.includes(n))) {
          return "facility";
        }
      } catch { }
    }
    return localStorage.getItem("anchor_approvals_tab") || "budget";
  });
  const [reservations, setReservations] = useState<AssetReservation[]>([]);

  // 💡 [교육용 한글 주석] 승인자 전용의 공간 예약 일시 조율용 상태변수들입니다.
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<AssetReservation | null>(null);
  const [editResFormData, setEditResFormData] = useState({
    reserved_date: "",
    start_time: "",
    end_time: ""
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("anchor_dark_mode");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // survey_respond 탭은 임시 설문 화면이므로 마지막 일반 탭 상태를 유지합니다.
  useActiveTabPersistence(activeTab);

  useLocalStorageValue("anchor_approvals_tab", approvalsTab);

  // 💡 [교육용 한글 주석] 직책에 따라 테두리선(line), 배경색, 글자색이 가미된 선명하고 세련된 뱃지를 렌더링하는 공용 헬퍼 함수입니다.
  const renderRoleBadge = (role: string, isRetired: boolean) => {
    if (isRetired) {
      return (
        <span className="badge badge-gray" style={{ fontSize: "0.65rem", background: "rgba(255, 255, 255, 0.08)", color: "var(--text-secondary)" }}>
          {role}
        </span>
      );
    }

    // 기본값 (일반 연구원 등)
    let bg = "rgba(107, 114, 128, 0.08)";
    let color = "#9ca3af";
    let border = "1px solid rgba(107, 114, 128, 0.25)";

    if (role === "사업단장") {
      bg = "rgba(239, 68, 68, 0.12)";
      color = "#f87171";
      border = "1px solid rgba(239, 68, 68, 0.4)";
    } else if (role === "본부장" || role === "총괄본부장") {
      bg = "rgba(139, 92, 246, 0.12)";
      color = "#a78bfa";
      border = "1px solid rgba(139, 92, 246, 0.45)";
    } else if (role === "센터장" || role.endsWith("센터장")) {
      bg = "rgba(59, 130, 246, 0.12)";
      color = "#60a5fa";
      border = "1px solid rgba(59, 130, 246, 0.4)";
    } else if (role === "운영팀장" || role === "팀장교수" || role === "팀장") {
      bg = "rgba(13, 148, 136, 0.12)";
      color = "#2dd4bf";
      border = "1px solid rgba(13, 148, 136, 0.45)";
    } else if (role === "최고 관리자") {
      bg = "rgba(236, 72, 153, 0.12)";
      color = "#f472b6";
      border = "1px solid rgba(236, 72, 153, 0.4)";
    }

    return (
      <span style={{
        display: "inline-block",
        fontSize: "0.65rem",
        fontWeight: "800",
        padding: "0.15rem 0.45rem",
        borderRadius: "4px",
        background: bg,
        color: color,
        border: border,
        whiteSpace: "nowrap"
      }}>
        {role}
      </span>
    );
  };

  // 사업단 구성원 관리 및 서브탭 상태 (첫 기동 시 즉각 화면 출력을 보장하기 위해 로컬 캐시를 초기값으로 지탱)
  const [members, setMembers] = useState<LegacyAppRecord[]>(() => {
    const saved = localStorage.getItem("anchor_members");
    const initialList: LegacyAppRecord[] = INITIAL_MEMBERS.map((m) => ({
      ...m,
      startDate: m.startDate || m.hireDate || "2026-03-01",
      endDate: m.endDate || "",
      status: m.status || "참여중"
    }));

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LegacyAppRecord[];

        // 💡 [구버전 캐시 강제 무력화 가드]
        // 로컬 스토리지에 옛날 더미 전화번호(010-1234-5678 등)가 남아있는 경우,
        // 새로 동기화된 실데이터 주소록으로 강제 리셋 및 동기화를 수행합니다.
        const deleeMember = parsed.find(m => m.email === "delee@uc.ac.kr");
        if (deleeMember && (deleeMember.phoneMobile === "010-1234-5678" || !deleeMember.phoneMobile.includes("5171"))) {
          console.log(">>> [로컬스토리지 주소록 핫 리셋 가동] 신규 실제 번호 데이터셋으로 동기화합니다. <<<");
          localStorage.setItem("anchor_members", JSON.stringify(initialList));
          return initialList;
        }

        // 💡 [교육용 한글 주석] 홍광표 센터장님의 이메일이 로컬스토리지 캐시에 옛날 값(gphong@uc.ac.kr)으로 남아있는 경우,
        // 이를 신규 이메일(kphong@uc.ac.kr)로 자동 정정하여 화면 및 수정 폼에서 즉시 반영되도록 조치합니다.
        let isLocalDataDirty = false;
        parsed.forEach(m => {
          if ((m.id === "m-07" || m.name === "홍광표") && m.email === "gphong@uc.ac.kr") {
            m.email = "kphong@uc.ac.kr";
            isLocalDataDirty = true;
          }
        });
        if (isLocalDataDirty) {
          localStorage.setItem("anchor_members", JSON.stringify(parsed));
        }

        // 💡 [교육용 한글 주석] 홍광표 교수님의 이메일(kphong@uc.ac.kr)에 맞게 정렬 이동 조건의 이메일 값을 변경합니다.
        // 로컬스토리지에 홍진숙 교수(cshong@uc.ac.kr)가 존재할 경우 위치를 홍광표 교수(kphong@uc.ac.kr) 바로 다음으로 재정렬 이동
        const hongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "cshong@uc.ac.kr");
        if (hongIdx !== -1) {
          const hongObj = parsed[hongIdx];
          parsed.splice(hongIdx, 1);
          const gphongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "kphong@uc.ac.kr");
          if (gphongIdx !== -1) {
            parsed.splice(gphongIdx + 1, 0, hongObj);
          } else {
            parsed.push(hongObj);
          }
        } else {
          const hongObj = initialList.find(m => m.email === "cshong@uc.ac.kr");
          if (hongObj) {
            const gphongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "kphong@uc.ac.kr");
            if (gphongIdx !== -1) {
              parsed.splice(gphongIdx + 1, 0, hongObj);
            } else {
              parsed.push(hongObj);
            }
          }
        }

        return parsed.map((m) => {
          let currentGrade = m.grade || "연구원";
          if (currentGrade === "전임 교수") currentGrade = "정교수";
          if (currentGrade === "행정 부장") currentGrade = "부장";
          return {
            ...m,
            dept: m.dept === "미배정" ? "-" : m.dept,
            grade: currentGrade,
            startDate: m.startDate || m.hireDate || "2026-03-01",
            endDate: m.endDate || "",
            status: m.status === "재직중" ? "참여중" : (m.status === "퇴직" ? "미참여" : (m.status || "참여중"))
          };
        });
      } catch (e) {
        console.error("Failed to parse saved members:", e);
      }
    }
    return initialList;
  });

  // 선택된 연차(selectedYear) 및 계약 기간(startDate/endDate)을 고려한 실시간 참여 상태 계산 함수
  const getMemberStatusForYear = (m: LegacyAppRecord, year: number) => {
    if (!m) return "미참여";
    const sDate = m.startDate || m.hireDate || "2026-03-01";
    const eDate = m.endDate || "";

    let termStart = "2025-01-01";
    let termEnd = "2026-02-28";

    if (year === 2) {
      termStart = "2026-03-01";
      termEnd = "2027-02-28";
    } else if (year === 3) {
      termStart = "2027-03-01";
      termEnd = "2028-02-29";
    } else if (year === 4) {
      termStart = "2028-03-01";
      termEnd = "2029-02-28";
    } else if (year === 5) {
      termStart = "2029-03-01";
      termEnd = "2030-02-28";
    }

    // 시작일 조건: 해당 연차의 종료일(termEnd) 이전에 시작했어야 함
    const isStarted = sDate <= termEnd;
    // 종료일 조건: 종료일(endDate) 정보가 없거나, 혹은 해당 연차의 시작일(termStart)보다 크거나 같아야 함
    const isNotEnded = !eDate || eDate >= termStart;

    // 오로지 날짜 범위 조건(계약 기간)만을 기준으로 동적으로 판별함
    if (isStarted && isNotEnded) {
      return "참여중";
    }
    return "미참여";
  };

  // Supabase DB 저장 스키마 필드 전용 객체 정제(Sanitize) 함수
  // (PostgreSQL 테이블에 부재하는 'hireDate' 등의 컬럼이 전송되면 구문 오류가 나는 현상을 원천 방지)
  const sanitizeMemberForDb = (m: LegacyAppRecord | null | undefined): RiseMemberInsert | null => {
    if (!m) return null;
    return {
      id: m.id,
      name: m.name || "",
      role: m.role || "연구원",
      grade: m.grade || "연구원",
      dept: m.dept || "-",
      phoneOffice: m.phoneOffice || null,
      phoneMobile: m.phoneMobile || null,
      email: m.email || null,
      room: m.room || null,
      startDate: m.startDate || m.hireDate || "2026-03-01",
      endDate: m.endDate || null,
      status: m.status === "재직중" ? "참여중" : (m.status === "퇴직" ? "미참여" : (m.status || "참여중"))
    };
  };

  // 💡 [교육용 한글 주석] 구성원 업로드용 엑셀 서식 템플릿 다운로드 핸들러
  const handleDownloadMemberTemplate = async () => {
    const templateData = [
      {
        "소속 부서": "ECC센터",
        "성명": "홍길동",
        "직책": "연구원",
        "직급/직위": "연구원",
        "이메일": "hong@ulsan.ac.kr",
        "교내 전화": "052-230-0114",
        "휴대전화": "010-1234-5678",
        "시작일": "2026-03-01",
        "종료일": "",
        "참여 여부": "참여중"
      }
    ];
    const fileName = `UC_RISE_구성원_업로드_서식.xlsx`;

    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "구성원템플릿");
      ws["!cols"] = Array(10).fill({ wch: 20 });

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
      const a = document.createElement("a");
      a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Member template export error:", err);
      alert("템플릿 생성 중 오류가 발생했습니다: " + getErrorMessage(err));
    }
  };

  // 💡 [교육용 한글 주석] 구성원 주소록 엑셀 데이터 파일 다운로드 (내보내기) 핸들러
  const handleExportMembersExcel = async () => {
    const excelData = members.map((m) => ({
      "소속 부서": m.dept || "-",
      "성명": m.name || "",
      "직책": m.role || "연구원",
      "직급/직위": m.grade || "연구원",
      "이메일": m.email || "",
      "교내 전화": m.phoneOffice || "",
      "휴대전화": m.phoneMobile || "",
      "시작일": m.startDate || m.hireDate || "2026-03-01",
      "종료일": m.endDate || "",
      "참여 여부": m.status || "참여중"
    }));
    const sheetName = "RISE사업단 구성원 주소록";
    const fileName = `Anchor_RISE_사업단_구성원_목록.xlsx`;

    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = Array(10).fill({ wch: 20 });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

      const a = document.createElement("a");
      a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Members Excel export error:", err);
      alert("엑셀 내보내기 중 오류가 발생했습니다: " + getErrorMessage(err));
    }
  };

  // 💡 [교육용 한글 주석] 엑셀 파일로부터 구성원 데이터들을 파싱하여 Supabase DB에 일괄 저장(가져오기)하는 핸들러
  const handleMemberExcelImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const binaryStr = evt.target?.result;
        if (!binaryStr) throw new Error("엑셀 파일을 읽을 수 없습니다.");
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<LegacyAppRecord>(ws);

        if (rawRows.length === 0) {
          alert("엑셀 파일에 데이터가 존재하지 않습니다.");
          return;
        }

        let importedCount = 0;
        const uploadPayloads: LegacyAppRecord[] = [];

        rawRows.forEach((row, index) => {
          const deptVal = row["소속 부서"];
          const nameVal = row["성명"];
          const roleVal = row["직책"];
          const gradeVal = row["직급/직위"];
          const emailVal = row["이메일"];
          const phoneOfficeVal = row["교내 전화"];
          const phoneMobileVal = row["휴대전화"];
          const startDateVal = row["시작일"];
          const endDateVal = row["종료일"];
          const statusVal = row["참여 여부"];

          if (!nameVal || !emailVal) {
            console.warn(`[Row ${index + 2}] 성명과 이메일 누락으로 제외됨.`);
            return;
          }

          // DB 규격에 맞춰 정제 매핑
          const payload = {
            id: `m-${Date.now()}-${index}`,
            name: String(nameVal).trim(),
            dept: deptVal ? String(deptVal).trim() : "ECC센터",
            role: roleVal ? String(roleVal).trim() : "연구원",
            grade: gradeVal ? String(gradeVal).trim() : "연구원",
            email: String(emailVal).trim(),
            phoneOffice: phoneOfficeVal ? String(phoneOfficeVal).trim() : null,
            phoneMobile: phoneMobileVal ? String(phoneMobileVal).trim() : null,
            startDate: startDateVal ? String(startDateVal).trim() : "2026-03-01",
            endDate: endDateVal ? String(endDateVal).trim() : null,
            status: statusVal ? String(statusVal).trim() : "참여중"
          };

          uploadPayloads.push(payload);
          importedCount++;
        });

        if (uploadPayloads.length === 0) {
          alert("업로드할 유효한 구성원 데이터가 없습니다. (성명, 이메일 필수)");
          return;
        }

        // Supabase DB에 일괄 Upsert 처리
        const sanitizedList = uploadPayloads
          .map(p => sanitizeMemberForDb(p))
          .filter((p): p is RiseMemberInsert => p !== null);
        const { error } = await upsertRiseMembers(sanitizedList);

        if (error) throw error;

        // 프론트엔드 상태값 갱신
        setMembers(prev => {
          const updated = [...prev];
          sanitizedList.forEach(newP => {
            const idx = updated.findIndex(m => m.email === newP.email);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], ...newP };
            } else {
              updated.push(newP);
            }
          });
          return updated;
        });

        alert(`총 ${importedCount}명의 구성원 데이터를 성공적으로 업로드 및 동기화했습니다!`);
      } catch (err) {
        console.error("Excel import error:", err);
        alert(`엑셀 파일 처리 및 DB 업로드 중 오류가 발생했습니다: ${getErrorMessage(err)}`);
      }
    };
    reader.readAsBinaryString(file);
    // 동일한 파일 재업로드 이벤트를 타도록 초기화
    e.target.value = "";
  };

  // Supabase 원격 rise_members 테이블에서 구성원 주소록 실시간 동기화 및 자가 치유 시딩 로드
  useEffect(() => {
    // 비로그인 상태이거나 GUEST 권한일 때는 조회를 생략합니다. (401 RLS 방지) (Rule 8 RLS 보안 준수)
    if (!currentUser || (currentUser.role?.id === "GUEST" || currentUser.role === "GUEST")) return;

    const fetchDbMembers = async () => {
      try {
        const { data, error } = await fetchRiseMembers();

        if (error) throw error;

        if (data && data.length > 0) {
          // DB 테이블에 데이터가 정상 적재되어 있는 경우 최우선 동기화 적용
          // 기존 구버전 상태값("재직중", "퇴직")을 "참여중", "미참여"로 자가 보정 매핑 로드
          const formatted = data.map((m) => ({
            ...m,
            status: m.status === "재직중" ? "참여중" : (m.status === "퇴직" ? "미참여" : (m.status || "참여중"))
          }));
          setMembers(formatted);
        } else {
          // DB 테이블은 존재하나 데이터가 비어있을 시 최초 시드 업서트 기동
          console.log("Supabase members empty. Seeding initial data...");
          const cleanedSeed = INITIAL_MEMBERS
            .map((m) => sanitizeMemberForDb({
              ...m,
              startDate: m.startDate || m.hireDate || "2026-03-01",
              endDate: m.endDate || "",
              status: m.status || "참여중"
            }))
            .filter((m): m is RiseMemberInsert => m !== null);

          // 💡 [RLS 보안 가드] 현재 브라우저의 JWT 토큰 세션이 있는지 검사하여, 인증된 사용자일 때만 DB 시딩 시도
          const runSeeding = async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                const { error: seedError } = await upsertRiseMembers(cleanedSeed);
                if (seedError) {
                  console.warn("Seeding initial members failed (RLS blocked):", seedError.message);
                }
              } else {
                console.log("Skipping DB write, offline/guest local fallback applied.");
              }
            } catch (seedErr) {
              console.warn("Silent seeding exception caught:", seedErr);
            }
            setMembers(cleanedSeed);
          };
          runSeeding();
        }
      } catch (err) {
        console.error("Supabase rise_members table sync failed, fallback to localStorage cache:", err);

        // 💡 [인증/세션 만료 예방 안전장치] rise_members 테이블 조회 및 업서트 중 401/403/42501(RLS) 에러 감지 시 자동 로그아웃 유도
        const errorRecord = err as LegacyAppRecord;
        const status = errorRecord?.status;
        const code = String(errorRecord?.code || "");
        const msg = String(errorRecord?.message || "");
        if (
          status === 401 ||
          status === 403 ||
          code === "PGRST301" ||
          code === "42501" ||
          msg.includes("JWT") ||
          msg.includes("claims") ||
          msg.includes("expired") ||
          msg.includes("permission denied") ||
          msg.includes("security policy")
        ) {
          console.warn(">>> [Supabase Members 동기화 중 세션 만료 감지] 자동으로 로그아웃 처리를 유도합니다. <<<", err);
          alert("보안 세션이 만료되었거나 데이터베이스 인증 오류가 발생했습니다. 안전한 데이터 저장을 위해 확인을 누르시면 자동 로그아웃 후 다시 로그인 화면으로 이동합니다.");
          handleLogout();
          return;
        }

        const saved = localStorage.getItem("anchor_members");
        if (saved) {
          try {
            setMembers(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to restore members from localStorage:", e);
          }
        }
      }
    };

    fetchDbMembers();
  }, [currentUser]);

  // members 로컬 상태 갱신 시 로컬스토리지 보조 백업 (네트워크 지연 시 즉시 피드백 및 영속성 보장)
  useLocalStorageJson("anchor_members", members);

  // 협약서 관리 상태 선언 및 로컬스토리지 영속 저장 연동
  const [agreements, setAgreements] = useState<LegacyAppRecord[]>(() => {
    const cached = localStorage.getItem("anchor_agreements_data_v1");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return INITIAL_AGREEMENTS;
      }
    }
    return INITIAL_AGREEMENTS;
  });

  // Base64 첨부를 제외한 협약서 캐시를 저장합니다.
  useAgreementLocalCache(
    agreements,
    safeSetLocalStorage,
    () => selectedYear
  );

  // 협약∙발급 관리 서브탭 및 추가 데이터군(이수증, 상장) 상태 선언
  const [agreementsSubTab, setAgreementsSubTab] = useState(() => {
    return localStorage.getItem("anchor_agreements_sub_tab") || "agreements";
  });

  useLocalStorageValue("anchor_agreements_sub_tab", agreementsSubTab);

  // 💡 [안전 가드 퓨즈] Supabase DB 패치가 100% 정상 완료되었는지 추적하여, 401 권한에러 등으로 빈 배열 상태가 된 경우 원격 DB를 덮어써 삭제하는 사고를 방어합니다.
  const [isAgreementsLoaded, setIsAgreementsLoaded] = useState(false);
  const [isUnifiedCertificatesLoaded, setIsUnifiedCertificatesLoaded] = useState(false);
  const [isScholarshipsLoaded, setIsScholarshipsLoaded] = useState(false);

  const [unifiedCertificates, setUnifiedCertificates] = useState<LegacyAppRecord[]>(() => {
    const cached = localStorage.getItem("anchor_unified_certificates_data_v1");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [scholarships, setScholarships] = useState<LegacyAppRecord[]>(() => {
    const cached = localStorage.getItem("anchor_cache_scholarships_all");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  });

  useUnifiedCertificateLocalCache(
    unifiedCertificates,
    safeSetLocalStorage,
    () => selectedYear
  );

  useScholarshipLocalCache(
    scholarships,
    safeSetLocalStorage,
    () => selectedYear
  );

  const [assignFilterUnitId, setAssignFilterUnitId] = useState("all");

  // 프로그램 CRUD 상태
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LegacyAppRecord | null>(null);
  const [programForm, setProgramForm] = useState({ unitId: "", id: "", title: "", dept: "사업운영팀" });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [mgmtSubTab, setMgmtSubTab] = useState(() => {
    return localStorage.getItem("anchor_mgmt_sub_tab") || "approvals";
  }); // "approvals", "members", "programs", "users"
  useLocalStorageValue("anchor_mgmt_sub_tab", mgmtSubTab);
  const [memberFilter, setMemberFilter] = useState("all"); // "all", "active", "retired"
  const [memberSortConfig, setMemberSortConfig] = useState<{ key: string | null; direction: string }>({ key: null, direction: "asc" });

  const requestMemberSort = (key: string) => {
    let direction = "asc";
    if (memberSortConfig.key === key && memberSortConfig.direction === "asc") {
      direction = "desc";
    }
    setMemberSortConfig({ key, direction });
  };

  const getSortedMembers = () => {
    const filtered = (members || []).filter((m) => {
      const computedStatus = getMemberStatusForYear(m, selectedYear);
      if (memberFilter === "active") return computedStatus !== "미참여";
      if (memberFilter === "retired") return computedStatus === "미참여";
      return true;
    });

    const sorted = [...filtered];

    if (!memberSortConfig.key) {
      // 기본 정렬: 리더십 순서 -> 센터 부서 가중치 -> 연구원 가중치 -> ID 오름차순
      return sorted.sort((a, b) => {
        const roleRanks: Record<string, number> = {
          "사업단장": 1,
          "본부장": 2,
          "센터장": 3,
          "운영팀장": 4,
          "팀장교수": 4,
          "연구원": 5
        };
        const rankA = roleRanks[a.role] || 99;
        const rankB = roleRanks[b.role] || 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        if (a.role === "센터장" && b.role === "센터장") {
          const centerOrder: Record<string, number> = {
            "ECC센터": 1,
            "ICC센터": 2,
            "RCC센터": 3,
            "울산늘봄누리센터": 4,
            "신산업특화센터": 5
          };
          const oA = centerOrder[a.dept] || 99;
          const oB = centerOrder[b.dept] || 99;
          if (oA !== oB) return oA - oB;
        }

        if (a.role === "운영팀장" && b.role !== "운영팀장") return -1;
        if (a.role !== "운영팀장" && b.role === "운영팀장") return 1;

        if (a.role === "연구원" && b.role === "연구원") {
          const deptOrder: Record<string, number> = {
            "ECC센터": 1,
            "ICC센터": 2,
            "RCC센터": 3,
            "AID-X지원센터": 4,
            "울산늘봄누리센터": 5,
            "신산업특화센터": 6
          };
          const deptValA = deptOrder[a.dept] || 99;
          const deptValB = deptOrder[b.dept] || 99;
          if (deptValA !== deptValB) {
            return deptValA - deptValB;
          }

          const gradeOrder: Record<string, number> = {
            "책임연구원": 1,
            "선임연구원": 2,
            "연구원": 3
          };
          const gradeValA = gradeOrder[a.grade] || 99;
          const gradeValB = gradeOrder[b.grade] || 99;
          if (gradeValA !== gradeValB) {
            return gradeValA - gradeValB;
          }
        }

        return a.id.localeCompare(b.id, 'en');
      });
    }

    return sorted.sort((a, b) => {
      let valA = a[memberSortConfig.key!] || "";
      let valB = b[memberSortConfig.key!] || "";

      if (memberSortConfig.key === "startDate") {
        valA = a.startDate || a.hireDate || "";
        valB = b.startDate || b.hireDate || "";
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return memberSortConfig.direction === "asc"
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" })
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: "base" });
      }

      if (valA < valB) return memberSortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return memberSortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  // Supabase 실시간 동기화 상태 배지 및 로드 플래그
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced", "syncing", "error"

  // 구매용역 관리 DB 보존 상태
  const [envData, setEnvData] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_env_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [equipData, setEquipData] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_equip_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [serviceData, setServiceData] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_serv_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });

  // 일정관리 DB 보존 상태
  const [monthlySchedules, setMonthlySchedules] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_month_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [eventSchedules, setEventSchedules] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_event_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [meetingSchedules, setMeetingSchedules] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_meet_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [pressReleases, setPressReleases] = useState<LegacyAppRecord[]>(() => {
    const savedYear = localStorage.getItem("anchor_selected_year") || "2";
    const cached = localStorage.getItem(`anchor_cache_press_y${savedYear}`);
    return cached ? JSON.parse(cached) : [];
  });

  const [projectsSubTab, setProjectsSubTab] = useState(() => {
    return localStorage.getItem("anchor_projects_sub_tab") || "unit_system";
  }); // "unit_system" (단위과제 체계), "unit_status" (단위과제 집행현황) 또는 "program_mgmt" (프로그램 관리)
  const [committeeSubTab, setCommitteeSubTab] = useState(() => {
    return localStorage.getItem("anchor_committee_sub_tab") || "committees";
  }); // "committees" (위원회 명단 관리), "committee_meeting" (회의 운영 및 의결) 또는 "committee_report" (위원회 결과보고 대장)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LegacyAppRecord | null>(null); // 추가/수정용 임시 객체

  // 개인정보 관리 (비밀번호 변경) 상태 및 핸들러
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 💡 [삼중 보안 가드] 게스트(GUEST) 사용자는 어떠한 상황에서도 비밀번호 변경이 불가능합니다.
    if (isGuest) {
      alert("게스트(방문자) 계정은 비밀번호 변경이 불가능합니다.");
      setIsPasswordModalOpen(false);
      return;
    }

    if (!currentPw || !newPw || !confirmNewPw) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    // 비밀번호 복잡도 검증: 최소 8자 이상, 영문자, 숫자, 특수문자(@$!%*#?&) 각각 최소 1개 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPw)) {
      alert("새 비밀번호는 최소 8자 이상이어야 하며, 영문자, 숫자, 특수문자(@$!%*#?&)가 각각 최소 1개 이상 포함되어야 합니다.");
      return;
    }

    if (newPw !== confirmNewPw) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const { data: reauthData, error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPw
      });

      if (reauthError || reauthData.user?.id !== currentUser.uuid) {
        alert("현재 비밀번호가 일치하지 않습니다.");
        return;
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        password: newPw
      });

      if (authUpdateError) {
        alert(`인증 비밀번호 변경 실패: ${authUpdateError.message}`);
        return;
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setIsPasswordModalOpen(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmNewPw("");
    } catch (err) {
      console.error("Password change error:", err);
      alert("비밀번호 변경 중 통신 오류가 발생했습니다.");
    }
  };

  // Supabase 회원현황 목록 상태
  const [registeredUsers, setRegisteredUsers] = useState<LegacyAppRecord[]>([]);

  // 회원현황 목록 로드 함수
  const fetchRegisteredUsers = async () => {
    // 1. 기본 데모 계정들 정의
    const demoUsers = [
      { id: "admin", name: "시스템 관리자", role_key: "ADMIN", created_at: "2025-01-06T00:00:00.000Z" },
      { id: "g_director", name: "", role_key: "G_DIRECTOR", created_at: "2025-01-06T00:00:00.000Z" },
      { id: "hq_head", name: "", role_key: "HQ_HEAD", created_at: "2025-03-01T00:00:00.000Z" },
      { id: "manager", name: "", role_key: "MANAGER", created_at: "2026-02-01T00:00:00.000Z" },
    ];

    try {
      // 2. Supabase DB에서 가입된 회원 로드
      const { data, error: _error } = await fetchRiseUserAccounts();
      const dbUsers = data || [];
      const dbMap = new Map<string, LegacyAppRecord>(dbUsers.map(u => [u.id.trim().toLowerCase(), u]));

      // 3. 주소록(members)에서 참여중인 멤버들 로드 및 매핑 (이메일 및 임시 비밀번호 매핑 가이드라인 연동)
      const activeMembers = (members || [])
        .filter(m => m.status !== "미참여" && m.email)
        .map(m => {
          const emailId = m.email.trim().toLowerCase();

          // 역할 맵핑 규칙
          let autoRoleKey = "RESEARCHER";
          const mRole = m.role || "";
          const mDept = m.dept || "";
          if (mRole === "사업단장") {
            autoRoleKey = "G_DIRECTOR";
          } else if (mRole === "본부장") {
            autoRoleKey = "HQ_HEAD";
          } else if (mRole === "운영팀장") {
            autoRoleKey = "MANAGER";
          } else if (mRole === "팀장교수" || mRole === "팀장") {
            autoRoleKey = "TEAM_LEADER";
          } else if (mRole === "센터장") {
            if (mDept === "ECC센터") autoRoleKey = "CENTER_ECC";
            else if (mDept === "ICC센터") autoRoleKey = "CENTER_ICC";
            else if (mDept === "RCC센터") autoRoleKey = "CENTER_RCC";
            else if (mDept === "울산늘봄누리센터") autoRoleKey = "CENTER_NURI";
            else autoRoleKey = "CENTER_SPECIAL";
          }

          // DB에 비밀번호를 직접 변경한 이력이 존재하면 해당 가입일/이름 정보를 우선시함
          // cshong@uc.ac.kr 주소록과 DB 상의 special_head 계정 간의 예외 매핑을 함께 지원합니다.
          const dbUser = dbMap.get(emailId) ||
            dbMap.get(emailId.split("@")[0]) ||
            (emailId === "cshong@uc.ac.kr" ? dbMap.get("special_head") : null);
          return {
            id: emailId,
            name: dbUser ? dbUser.name : m.name,
            role_key: autoRoleKey,
            // 주소록(members)에 시작일이 수정 기입되어 있다면 그것을 우선 표출하고, 없으면 DB 생성일 또는 디폴트값을 사용합니다.
            created_at: m.startDate || m.hireDate || (dbUser ? dbUser.created_at : "2026-03-01T00:00:00.000Z")
          };
        });

      // 4. 데모 계정 + 주소록 액티브 계정 + DB 계정 우선순위 병합
      const finalUsersMap = new Map<string, LegacyAppRecord>();

      // 데모 계정 주입
      demoUsers.forEach(u => finalUsersMap.set(u.id.toLowerCase(), u));
      // 주소록 재직중인 계정 주입
      activeMembers.forEach(u => finalUsersMap.set(u.id.toLowerCase(), u));
      // DB 실제 회원 계정 주입 (최종 우선순위 보장)
      dbUsers.forEach(u => {
        const idLower = u.id.trim().toLowerCase();
        if (["g_director", "hq_head", "manager"].includes(idLower)) {
          u.name = "";
        }
        finalUsersMap.set(idLower, u);
      });

      // 주소록에 변경된 시작일이 있다면, DB 계정 정보가 덮어썼더라도 주소록에 명시된 시작일이 화면상 가입일/시작일로 우선 표출되게 최종 갱신 보장
      finalUsersMap.forEach((user, key) => {
        const matchedActive = activeMembers.find(am => am.id.trim().toLowerCase() === key);
        if (matchedActive) {
          user.created_at = matchedActive.created_at;
        }
      });

      // 직책별 가중치 순서 정의 (0순위 관리자 ~ 5순위 실무 연구원)
      const roleRanks: Record<string, number> = {
        ADMIN: 0,
        G_DIRECTOR: 1,
        HQ_HEAD: 2,
        CENTER_ECC: 3,
        CENTER_ICC: 3,
        CENTER_RCC: 3,
        CENTER_AID: 3,
        CENTER_NURI: 3,
        CENTER_NULBOM: 3,
        CENTER_SPECIAL: 3,
        MANAGER: 4,
        TEAM_LEADER: 5,
        RESEARCHER: 6
      };

      const sortedUsers = Array.from(finalUsersMap.values()).sort((a, b) => {
        const rankA = roleRanks[a.role_key] !== undefined ? roleRanks[a.role_key] : 99;
        const rankB = roleRanks[b.role_key] !== undefined ? roleRanks[b.role_key] : 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        // 동일한 센터장 직급 내에서의 정렬 순서 적용 (이동은 -> 김기범 -> 현용환 -> 홍광표 -> 홍진숙)
        const isCenterA = a.role_key.startsWith("CENTER_");
        const isCenterB = b.role_key.startsWith("CENTER_");
        if (isCenterA && isCenterB) {
          const centerOrder: Record<string, number> = {
            CENTER_ECC: 1,
            CENTER_ICC: 2,
            CENTER_RCC: 3,
            CENTER_NURI: 4,
            CENTER_SPECIAL: 5
          };
          const orderA = centerOrder[a.role_key] || 99;
          const orderB = centerOrder[b.role_key] || 99;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
        }

        // 동일한 TEAM_LEADER 직급 내에서 운영팀장(심현미 부장)을 팀장교수진보다 우선 배치
        if (a.role_key === "TEAM_LEADER" && b.role_key === "TEAM_LEADER") {
          const isOpLeaderA = a.id.toLowerCase() === "hmsim@uc.ac.kr" || a.id.toLowerCase() === "team_leader";
          const isOpLeaderB = b.id.toLowerCase() === "hmsim@uc.ac.kr" || b.id.toLowerCase() === "team_leader";
          if (isOpLeaderA && !isOpLeaderB) return -1;
          if (!isOpLeaderA && isOpLeaderB) return 1;
        }

        // 동일한 RESEARCHER 직급 내에서의 정렬 순서 적용 (소속 부서 순서 -> 직급/직위 순서)
        if (a.role_key === "RESEARCHER" && b.role_key === "RESEARCHER") {
          const memberA = (members || []).find(m => m.email && m.email.trim().toLowerCase() === a.id.trim().toLowerCase());
          const memberB = (members || []).find(m => m.email && m.email.trim().toLowerCase() === b.id.trim().toLowerCase());

          if (memberA && memberB) {
            // 1. 소속부서 정렬 순서 (ECC, ICC, RCC, AID-X, 늘봄누리, 신산업)
            const deptOrder: Record<string, number> = {
              "ECC센터": 1,
              "ICC센터": 2,
              "RCC센터": 3,
              "AID-X지원센터": 4,
              "울산늘봄누리센터": 5,
              "신산업특화센터": 6
            };
            const deptValA = deptOrder[memberA.dept] || 99;
            const deptValB = deptOrder[memberB.dept] || 99;
            if (deptValA !== deptValB) {
              return deptValA - deptValB;
            }

            // 2. 직급/직위 정렬 순서 (책임연구원, 선임연구원, 연구원)
            const gradeOrder: Record<string, number> = {
              "책임연구원": 1,
              "선임연구원": 2,
              "연구원": 3
            };
            const gradeValA = gradeOrder[memberA.grade] || 99;
            const gradeValB = gradeOrder[memberB.grade] || 99;
            if (gradeValA !== gradeValB) {
              return gradeValA - gradeValB;
            }
          }
        }

        // 동일한 직급일 경우 ID 알파벳 순 정렬
        return a.id.localeCompare(b.id, 'en');
      });

      setRegisteredUsers(sortedUsers);
    } catch (err) {
      console.error("Fetch registered users error:", err);
      setRegisteredUsers(demoUsers);
    }
  };

  // 회원현황에서 사용자 계정 삭제 실행 함수
  const handleDeleteUser = async (userId: string) => {
    const demoIds = ["admin", "g_director", "hq_head", "center_director", "leader", "team_leader", "researcher"];
    if (demoIds.includes(userId.toLowerCase())) {
      alert("시스템 기본 데모 계정은 삭제할 수 없습니다.");
      return;
    }

    if (!window.confirm(`정말로 '${userId}' 계정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await deleteRiseUserAccount(userId);

      if (error) {
        alert("계정 삭제 중 오류가 발생했습니다.");
      } else {
        alert("성공적으로 계정이 삭제되었습니다.");
        fetchRegisteredUsers(); // 목록 새로고침
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("삭제 처리 중 예기치 못한 에러가 발생했습니다.");
    }
  };

  // 관리자 탭 활성화 시 또는 주소록 변경 시 사용자 계정 목록 갱신
  useRegisteredUsersRefresh(
    activeTab,
    currentUser,
    members,
    fetchRegisteredUsers
  );

  // 성과지표 상세 조회용 상태 및 다년도 성과관리 연도 선택 상태
  const [selectedKpi, setSelectedKpi] = useState<LegacyAppRecord | null>(() => {
    const saved = localStorage.getItem("anchor_selected_kpi");
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem("anchor_selected_year");
    return saved ? parseInt(saved, 10) : 2;
  });
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);

  // 2인 공동배정 여부 로컬 상태 (프로그램 ID별 true/false)
  const [jointPrograms, setJointPrograms] = useState<Record<string, boolean>>({});

  // projects 데이터 로딩 시 2명 이상으로 배정된 과제를 자동 스캔하여 체크 상태 설정
  useJointProgramDetection(projects, selectedYear, setJointPrograms);

  const [kpiSubTab, setKpiSubTab] = useState(() => {
    return localStorage.getItem("anchor_kpi_sub_tab") || "공통";
  });
  const [budgetSubTab, setBudgetSubTab] = useState(() => {
    return localStorage.getItem("anchor_budget_sub_tab") || "total_investment";
  });
  const [investmentSubTab, setInvestmentSubTab] = useState(() => {
    return localStorage.getItem("anchor_investment_sub_tab") || "five_year";
  });
  const [procurementSubTab, setProcurementSubTab] = useState(() => {
    return localStorage.getItem("anchor_procurement_sub_tab") || "env_improvement";
  });
  const [scheduleSubTab, setScheduleSubTab] = useState(() => {
    return localStorage.getItem("anchor_schedule_sub_tab") || "monthly";
  });
  const [assetSubTab, setAssetSubTab] = useState(() => {
    return localStorage.getItem("anchor_asset_sub_tab") || "education_env";
  });
  const [progressSubTab, setProgressSubTab] = useState(() => {
    return localStorage.getItem("anchor_progress_sub_tab") || "progress_status";
  });
  const [selectedUnitId, setSelectedUnitId] = useState(() => {
    return localStorage.getItem("anchor_selected_unit_id") || "A1가";
  });
  const [selectedProgId, setSelectedProgId] = useState(() => {
    return localStorage.getItem("anchor_selected_prog_id") || null;
  });




  useOptionalLocalStorageJson("anchor_selected_kpi", selectedKpi);
  useLocalStorageValue("anchor_selected_year", selectedYear);
  useLocalStorageValue("anchor_kpi_sub_tab", kpiSubTab);
  useLocalStorageValue("anchor_projects_sub_tab", projectsSubTab);
  useLocalStorageValue("anchor_committee_sub_tab", committeeSubTab);
  useLocalStorageValue("anchor_progress_sub_tab", progressSubTab);
  useLocalStorageValue("anchor_budget_sub_tab", budgetSubTab);
  useLocalStorageValue("anchor_investment_sub_tab", investmentSubTab);
  useLocalStorageValue("anchor_procurement_sub_tab", procurementSubTab);
  useLocalStorageValue("anchor_schedule_sub_tab", scheduleSubTab);
  useLocalStorageValue("anchor_asset_sub_tab", assetSubTab);
  useLocalStorageValue("anchor_selected_unit_id", selectedUnitId);
  useOptionalLocalStorageValue("anchor_selected_prog_id", selectedProgId);

  const [pdcaViewMode, setPdcaViewMode] = useState(() => {
    return localStorage.getItem("anchor_pdca_view_mode") || "unit";
  });

  useLocalStorageValue("anchor_pdca_view_mode", pdcaViewMode);

  // ==========================================
  // 단위과제 진행현황 데이터 내보내기 핸들러 (Excel, Markdown, PDF)
  // ==========================================
  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const excelData = [];
      let sumBudgetMain = 0;
      let sumBudgetCarry = 0;
      let sumTotalBudget = 0;
      let sumTotalSpent = 0;
      let sumTotalPrograms = 0;
      let sumReadyCount = 0;
      let sumInProgressCount = 0;
      let sumCompletedCount = 0;
      let sumTotalProgressSum = 0;

      const sortedUnits = displayProjects.flatMap((p) => p.units)
        .sort((a, b) => {
          if (a.id === "Common" || a.id === "X0") return 1;
          if (b.id === "Common" || b.id === "X0") return -1;
          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
        });

      sortedUnits.forEach((u) => {
        const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
        const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
        const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
        const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
        const totalSpent = (yData.spent_main || 0) + spentCarryVal;
        const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        sumBudgetMain += (yData.budget_main || 0);
        sumBudgetCarry += budgetCarryVal;
        sumTotalBudget += totalBudget;
        sumTotalSpent += totalSpent;

        let totalPrograms = 0;
        let readyCount = 0;
        let inProgressCount = 0;
        let completedCount = 0;
        let totalProgressSum = 0;

        if (u.id !== "Common" && u.id !== "X0") {
          totalPrograms = u.programs?.length || 0;
          sumTotalPrograms += totalPrograms;

          if (totalPrograms > 0) {
            u.programs.forEach((prog: LegacyAppRecord) => {
              const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
              const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
              const progProgress = (completedSteps / 4) * 100;
              totalProgressSum += progProgress;
              sumTotalProgressSum += progProgress;

              if (completedSteps === 0) {
                readyCount++;
                sumReadyCount++;
              } else if (completedSteps === 4) {
                completedCount++;
                sumCompletedCount++;
              } else {
                inProgressCount++;
                sumInProgressCount++;
              }
            });
          }
        }

        const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;

        excelData.push({
          "단위과제": (u.id === "Common" ? "" : `${u.id}. `) + u.title,
          "본예산 (백만원)": yData.budget_main || 0,
          ...(selectedYear >= 2 ? { "이월예산 (백만원)": budgetCarryVal } : {}),
          "총 배정액 (백만원)": totalBudget,
          "누적 집행 (백만원)": totalSpent,
          "집행률 (%)": parseFloat(rate.toFixed(1)),
          "프로그램 총 개수": u.id === "Common" || u.id === "X0" ? "-" : `${totalPrograms}개`,
          "준비 단계": u.id === "Common" || u.id === "X0" ? "-" : readyCount,
          "진행 단계": u.id === "Common" || u.id === "X0" ? "-" : inProgressCount,
          "완료 단계": u.id === "Common" || u.id === "X0" ? "-" : completedCount,
          "프로그램 진행률 (%)": u.id === "Common" || u.id === "X0" ? "-" : parseFloat(progressRate.toFixed(1))
        });
      });

      const sumRate = sumTotalBudget > 0 ? (sumTotalSpent / sumTotalBudget) * 100 : 0;
      const sumProgressRate = sumTotalPrograms > 0 ? (sumTotalProgressSum / sumTotalPrograms) : 0;

      excelData.push({
        "단위과제": "합계",
        "본예산 (백만원)": sumBudgetMain,
        ...(selectedYear >= 2 ? { "이월예산 (백만원)": sumBudgetCarry } : {}),
        "총 배정액 (백만원)": sumTotalBudget,
        "누적 집행 (백만원)": sumTotalSpent,
        "집행률 (%)": parseFloat(sumRate.toFixed(1)),
        "프로그램 총 개수": `${sumTotalPrograms}개`,
        "준비 단계": sumReadyCount,
        "진행 단계": sumInProgressCount,
        "완료 단계": sumCompletedCount,
        "프로그램 진행률 (%)": parseFloat(sumProgressRate.toFixed(1))
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "진행현황");

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `[${selectedYear}차년도]단위과제_진행현황_${yyyy}${mm}${dd}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      alert("엑셀 다운로드 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    }
  };

  const handleExportMarkdown = () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      let mdContent = `# 앵커사업 통합 IR 단위과제 진행현황 (${selectedYear}차년도)\n\n`;
      mdContent += `* 생성일자: ${yyyy}-${mm}-${dd}\n\n`;

      const sortedUnits = displayProjects.flatMap((p) => p.units)
        .sort((a, b) => {
          if (a.id === "Common" || a.id === "X0") return 1;
          if (b.id === "Common" || b.id === "X0") return -1;
          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
        });

      if (selectedYear >= 2) {
        mdContent += `| 단위과제 | 본예산 | 이월예산 | 총 배정액 | 누적 집행 | 집행률 | 총 프로그램 | 준비 | 진행 | 완료 | 프로그램 진행률 |\n`;
        mdContent += `| :--- | ---: | ---: | ---: | ---: | ---: | :---: | :---: | :---: | :---: | ---: |\n`;
      } else {
        mdContent += `| 단위과제 | 본예산 | 총 배정액 | 누적 집행 | 집행률 | 총 프로그램 | 준비 | 진행 | 완료 | 프로그램 진행률 |\n`;
        mdContent += `| :--- | ---: | ---: | ---: | ---: | :---: | :---: | :---: | :---: | ---: |\n`;
      }

      let sumBudgetMain = 0;
      let sumBudgetCarry = 0;
      let sumTotalBudget = 0;
      let sumTotalSpent = 0;
      let sumTotalPrograms = 0;
      let sumReadyCount = 0;
      let sumInProgressCount = 0;
      let sumCompletedCount = 0;
      let sumTotalProgressSum = 0;

      sortedUnits.forEach((u) => {
        const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
        const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
        const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
        const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
        const totalSpent = (yData.spent_main || 0) + spentCarryVal;
        const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        sumBudgetMain += (yData.budget_main || 0);
        sumBudgetCarry += budgetCarryVal;
        sumTotalBudget += totalBudget;
        sumTotalSpent += totalSpent;

        let totalPrograms = 0;
        let readyCount = 0;
        let inProgressCount = 0;
        let completedCount = 0;
        let totalProgressSum = 0;

        if (u.id !== "Common" && u.id !== "X0") {
          totalPrograms = u.programs?.length || 0;
          sumTotalPrograms += totalPrograms;

          if (totalPrograms > 0) {
            u.programs.forEach((prog: LegacyAppRecord) => {
              const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
              const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
              const progProgress = (completedSteps / 4) * 100;
              totalProgressSum += progProgress;
              sumTotalProgressSum += progProgress;

              if (completedSteps === 0) {
                readyCount++;
                sumReadyCount++;
              } else if (completedSteps === 4) {
                completedCount++;
                sumCompletedCount++;
              } else {
                inProgressCount++;
                sumInProgressCount++;
              }
            });
          }
        }

        const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;
        const nameStr = (u.id === "Common" ? "" : `${u.id}. `) + u.title;
        const rateStr = `${rate.toFixed(1)}%`;
        const progRateStr = u.id === "Common" || u.id === "X0" ? "-" : `${progressRate.toFixed(1)}%`;

        if (selectedYear >= 2) {
          mdContent += `| ${nameStr} | ${formatToMillionWon(yData.budget_main)} | ${formatToMillionWon(budgetCarryVal)} | ${formatToMillionWon(totalBudget)} | ${formatToMillionWon(totalSpent)} | ${rateStr} | ${u.id === "Common" || u.id === "X0" ? "-" : `${totalPrograms}개`} | ${u.id === "Common" || u.id === "X0" ? "-" : readyCount} | ${u.id === "Common" || u.id === "X0" ? "-" : inProgressCount} | ${u.id === "Common" || u.id === "X0" ? "-" : completedCount} | ${progRateStr} |\n`;
        } else {
          mdContent += `| ${nameStr} | ${formatToMillionWon(yData.budget_main)} | ${formatToMillionWon(totalBudget)} | ${formatToMillionWon(totalSpent)} | ${rateStr} | ${u.id === "Common" || u.id === "X0" ? "-" : `${totalPrograms}개`} | ${u.id === "Common" || u.id === "X0" ? "-" : readyCount} | ${u.id === "Common" || u.id === "X0" ? "-" : inProgressCount} | ${u.id === "Common" || u.id === "X0" ? "-" : completedCount} | ${progRateStr} |\n`;
        }
      });

      const sumRate = sumTotalBudget > 0 ? (sumTotalSpent / sumTotalBudget) * 100 : 0;
      const sumProgressRate = sumTotalPrograms > 0 ? (sumTotalProgressSum / sumTotalPrograms) : 0;

      if (selectedYear >= 2) {
        mdContent += `| **합계** | **${formatToMillionWon(sumBudgetMain)}** | **${formatToMillionWon(sumBudgetCarry)}** | **${formatToMillionWon(sumTotalBudget)}** | **${formatToMillionWon(sumTotalSpent)}** | **${sumRate.toFixed(1)}%** | **${sumTotalPrograms}개** | **${sumReadyCount}** | **${sumInProgressCount}** | **${sumCompletedCount}** | **${sumProgressRate.toFixed(1)}%** |\n`;
      } else {
        mdContent += `| **합계** | **${formatToMillionWon(sumBudgetMain)}** | **${formatToMillionWon(sumTotalBudget)}** | **${formatToMillionWon(sumTotalSpent)}** | **${sumRate.toFixed(1)}%** | **${sumTotalPrograms}개** | **${sumReadyCount}** | **${sumInProgressCount}** | **${sumCompletedCount}** | **${sumProgressRate.toFixed(1)}%** |\n`;
      }

      const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `[${selectedYear}차년도]단위과제_진행현황_${yyyy}${mm}${dd}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("마크다운 내보내기 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    }
  };

  const handleExportPDF = async () => {
    setIsDownloadingPdf("unit_status");
    try {
      await new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `[${selectedYear}차년도]단위과제_진행현황_${yyyy}${mm}${dd}.pdf`;

      let tableRowsHtml = "";
      let sumBudgetMain = 0;
      let sumBudgetCarry = 0;
      let sumTotalBudget = 0;
      let sumTotalSpent = 0;
      let sumTotalPrograms = 0;
      let sumReadyCount = 0;
      let sumInProgressCount = 0;
      let sumCompletedCount = 0;
      let sumTotalProgressSum = 0;

      const sortedUnits = displayProjects.flatMap((p) => p.units)
        .sort((a, b) => {
          if (a.id === "Common" || a.id === "X0") return 1;
          if (b.id === "Common" || b.id === "X0") return -1;
          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
        });

      sortedUnits.forEach((u) => {
        const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
        const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
        const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
        const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
        const totalSpent = (yData.spent_main || 0) + spentCarryVal;
        const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        sumBudgetMain += (yData.budget_main || 0);
        sumBudgetCarry += budgetCarryVal;
        sumTotalBudget += totalBudget;
        sumTotalSpent += totalSpent;

        let totalPrograms = 0;
        let readyCount = 0;
        let inProgressCount = 0;
        let completedCount = 0;
        let totalProgressSum = 0;

        if (u.id !== "Common" && u.id !== "X0") {
          totalPrograms = u.programs?.length || 0;
          sumTotalPrograms += totalPrograms;

          if (totalPrograms > 0) {
            u.programs.forEach((prog: LegacyAppRecord) => {
              const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
              const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
              const progProgress = (completedSteps / 4) * 100;
              totalProgressSum += progProgress;
              sumTotalProgressSum += progProgress;

              if (completedSteps === 0) {
                readyCount++;
                sumReadyCount++;
              } else if (completedSteps === 4) {
                completedCount++;
                sumCompletedCount++;
              } else {
                inProgressCount++;
                sumInProgressCount++;
              }
            });
          }
        }

        const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;
        const nameStr = (u.id === "Common" ? "" : `${u.id}. `) + u.title;
        const budgetCarryCell = selectedYear >= 2 ? `<td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-family: sans-serif; white-space: nowrap; font-size: 10px;">${formatToMillionWon(budgetCarryVal)}</td>` : "";

        tableRowsHtml += `
          <tr style="background: ${u.id === "Common" || u.id === "X0" ? "#f9fafb" : "#ffffff"}; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; font-weight: bold; font-size: 10px; word-break: keep-all; vertical-align: middle;">${nameStr}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${formatToMillionWon(yData.budget_main)}</td>
            ${budgetCarryCell}
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${formatToMillionWon(totalBudget)}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${formatToMillionWon(totalSpent)}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${rate.toFixed(1)}%</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; white-space: nowrap; font-size: 10px; vertical-align: middle;">${u.id === "Common" || u.id === "X0" ? "-" : `${totalPrograms}개`}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; white-space: nowrap; font-size: 10px; vertical-align: middle;">${u.id === "Common" || u.id === "X0" ? "-" : readyCount}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; color: #f59e0b; white-space: nowrap; font-size: 10px; vertical-align: middle;">${u.id === "Common" || u.id === "X0" ? "-" : inProgressCount}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; color: #10b981; font-weight: bold; white-space: nowrap; font-size: 10px; vertical-align: middle;">${u.id === "Common" || u.id === "X0" ? "-" : completedCount}</td>
            <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; color: #10b981; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${u.id === "Common" || u.id === "X0" ? "-" : `${progressRate.toFixed(1)}%`}</td>
          </tr>
        `;
      });

      const sumRate = sumTotalBudget > 0 ? (sumTotalSpent / sumTotalBudget) * 100 : 0;
      const sumProgressRate = sumTotalPrograms > 0 ? (sumTotalProgressSum / sumTotalPrograms) : 0;
      const sumBudgetCarryCell = selectedYear >= 2 ? `<td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; background: #e5e7eb; font-family: sans-serif; white-space: nowrap; font-size: 10px;">${formatToMillionWon(sumBudgetCarry)}</td>` : "";

      const carryHeader = selectedYear >= 2 ? `<th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #e5e7eb;">이월예산</th>` : "";
      const colSpanVal = selectedYear >= 2 ? 5 : 4;

      const colGroupHtml = selectedYear >= 2 ? `
        <colgroup>
          <col style="width: 31.8%;" />
          <col style="width: 6.8%;" />
          <col style="width: 6.8%;" />
          <col style="width: 7.2%;" />
          <col style="width: 6.8%;" />
          <col style="width: 6.4%;" />
          <col style="width: 6.8%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.2%;" />
          <col style="width: 6.8%;" />
        </colgroup>
      ` : `
        <colgroup>
          <col style="width: 43.6%;" />
          <col style="width: 6.8%;" />
          <col style="width: 7.2%;" />
          <col style="width: 6.8%;" />
          <col style="width: 6.4%;" />
          <col style="width: 6.8%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.2%;" />
          <col style="width: 6.8%;" />
        </colgroup>
      `;

      const htmlContent = `
        <div style="padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #333333; background: #ffffff; width: 100%;">
          <h1 style="text-align: center; font-size: 20px; font-weight: 800; margin-bottom: 5px; color: #111827;">울산과학대학교 앵커사업단 진행현황</h1>
          <p style="text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 20px;">[${selectedYear}차년도] 단위과제별 예산 집행 및 프로그램 추진 실적</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 10px; color: #111827; border: 1px solid #d1d5db; table-layout: fixed;">
            ${colGroupHtml}
            <thead>
              <tr style="background: #f3f4f6;">
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-weight: bold; font-size: 11px; color: #111827; background: #f3f4f6; vertical-align: middle; height: 46px; line-height: 1.2; position: relative; z-index: 10;">단위과제</th>
                <th colspan="${colSpanVal}" style="border: 1px solid #d1d5db; padding: 9px; text-align: center; font-weight: bold; color: #111827;">예산 배정 및 집행 (단위: 백만원)</th>
                <th colspan="5" style="border: 1px solid #d1d5db; padding: 9px; text-align: center; font-weight: bold; color: #111827;">프로그램 진행</th>
              </tr>
              <tr style="background: transparent;">
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">본예산</th>
                ${carryHeader}
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">총 배정액</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">누적 집행</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">집행률</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">총 개수</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">준비</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">진행</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">완료</th>
                <th style="border: 1px solid #d1d5db; padding: 9px 3px; white-space: nowrap; font-size: 10.5px; color: #111827; font-weight: bold; background: #f9fafb;">진행률</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
              <tr style="background: #e5e7eb; font-weight: bold;">
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; white-space: nowrap; font-size: 10px; vertical-align: middle;">합계</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; background: #e5e7eb; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${formatToMillionWon(sumBudgetMain)}</td>
                ${sumBudgetCarryCell}
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; color: #1e40af; background: #e5e7eb; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${formatToMillionWon(sumTotalBudget)}</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; background: #e5e7eb; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${formatToMillionWon(sumTotalSpent)}</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; background: #e5e7eb; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${sumRate.toFixed(1)}%</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; font-weight: bold; background: #e5e7eb; white-space: nowrap; font-size: 10px; vertical-align: middle;">${sumTotalPrograms}개</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; font-weight: bold; background: #e5e7eb; white-space: nowrap; font-size: 10px; vertical-align: middle;">${sumReadyCount}</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; font-weight: bold; background: #e5e7eb; white-space: nowrap; font-size: 10px; vertical-align: middle;">${sumInProgressCount}</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: center; font-weight: bold; color: #10b981; background: #e5e7eb; white-space: nowrap; font-size: 10px; vertical-align: middle;">${sumCompletedCount}</td>
                <td style="border: 1px solid #d1d5db; padding: 9px 4px; text-align: right; font-weight: bold; color: #10b981; background: #e5e7eb; font-family: sans-serif; white-space: nowrap; font-size: 10px; vertical-align: middle;">${sumProgressRate.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 10px; color: #9ca3af; text-align: right;">
            울산과학대학교 앵커사업단 성과 예산 관리 시스템 | 출력 일자: ${yyyy}-${mm}-${dd}
          </div>
        </div>
      `;

      const opt = {
        margin: [22.5, 20, 22.5, 20],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(htmlContent).set(opt).save();
    } catch (err) {
      alert("PDF 다운로드 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // ==========================================
  // Supabase DB 실시간 패칭 및 자동 동기화 훅
  // ==========================================

  // Supabase 원격 서버 데이터 fetch 완료 여부를 체크하는 이중 안전 잠금장치 State
  const [isFetchCompleted, setIsFetchCompleted] = useState(false);
  // 💡 데이터 불일치 보호망: 현재 화면에 로드된 데이터가 몇 차년도 데이터인지 명확하게 추적합니다.
  const [activeDataYear, setActiveDataYear] = useState(selectedYear);

  // 💡 Race Condition 방지: 원격에서 막 가져온 순수 데이터를 기억하여, 사용자가 직접 수정한 경우에만 Auto-save 동작하도록 보장
  const fetchedProjectsRef = useRef("");
  const fetchedAgreementsRef = useRef("");
  const isAgreementsFetchedRef = useRef(false); // DB Fetch 완료 감지 잠금
  const fetchedUnifiedCertificatesRef = useRef("");
  const fetchedScholarshipsRef = useRef("");
  const fetchedEnvDataRef = useRef("");
  const fetchedEquipDataRef = useRef("");
  const fetchedServiceDataRef = useRef("");
  const fetchedMonthlySchedulesRef = useRef("");
  const fetchedEventSchedulesRef = useRef("");
  const fetchedMeetingSchedulesRef = useRef("");
  const fetchedPressReleasesRef = useRef("");

  // selectedYear가 변경될 때 fetch 완료 플래그와 원격 데이터 기준 ref를 초기화
  useProjectFetchReset(
    selectedYear,
    setIsFetchCompleted,
    fetchedProjectsRef
  );

  // 💡 [비즈니스 룰 규격화 엔진]
  // 3, 4, 5차년도 예산 계획을 2차년도(2026년) 예산 계획과 강제로 동기화하고,
  // 종료과제 A1나의 경우 2차년도를 제외한 모든 차년도를 0원으로 강제 격리 조치합니다.
  const normalizeProjectsMultiYearData = <T extends LegacyAppRecord[] | null | undefined,>(projectsList: T): T => {
    if (!projectsList || !Array.isArray(projectsList)) return projectsList;
    return projectsList.map((strat: LegacyAppRecord) => ({
      ...strat,
      units: strat.units?.map((unit: LegacyAppRecord) => {
        const isA1Na = unit.id === "A1na" || unit.id === "A1나";
        const isC1 = unit.id === "C1";

        const newYears: LegacyYearRecord = { ...unit.years };
        if (isC1) {
          // 💡 C1단위과제 2차년도 본사업비 예산 350,000,000원으로 강제 주입 (이월 찌꺼기 3.5억 제거)
          newYears[2] = {
            budget_main: 350000000,
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0
          };
        }

        const u2 = newYears[2] || {};

        // 3, 4, 5차년도 강제 복사 (A1나 단위과제는 0원)
        [3, 4, 5].forEach(yr => {
          newYears[yr] = {
            ...newYears[yr],
            budget_main: isA1Na ? 0 : (u2.budget_main || 0),
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0
          };
        });

        // 1차년도부터 5차년도까지 이월잔액 연쇄적 재계산
        recalculateCarryOver(newYears);

        // 💡 [데이터 불일치 방지망] C1단위과제 하위 프로그램 목록에 타 과제(B2 등) 찌꺼기가 섞여 로드되는 문제를 방지하기 위해 프로그램 명세를 템플릿으로 강제 치환 및 초기화합니다.
        let targetPrograms: LegacyAppRecord[] = unit.programs || [];
        if (isC1) {
          const c1Template: LegacyAppRecord[] = [
            { id: "C1-S1T1-1", title: "아카데미별 거버넌스 운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S1T1-2", title: "평생학습관 환경개선", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
            { id: "C1-S1T1-3", title: "평생직업교육관련 기자재", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
            { id: "C1-S1T2-1", title: "평생학습 박람회 및 성과공유회", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S1T3-1", title: "자체홈페이지플랫폼구축으로 변경필요(예산미정)", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S1T4-1", title: "자체홈페이지플랫폼구축으로 변경필요(예산미정)", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S2T5-1", title: "자격증 취득지원", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S2T6-1", title: "성인학습자 학과 환경개선", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
            { id: "C1-S2T6-2", title: "성인학습자 학과 기자재 구축", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
            { id: "C1-S2T7-1", title: "평생직업교육활성화 정책연구", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S3T8-1", title: "평생직업교육활성화 정책연구", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S3T9-1", title: "평생학습 박람회 및 성과공유회", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S3T10-1", title: "평생직업교육과정 개발", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S3T11-1", title: "성인학습자 학습지원 프로그램", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S3T11-2", title: "평생교육참여학습자장학금", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S3T11-3", title: "운영보조인력 지원", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S4T12-1", title: "스마트테크 아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S4T12-2", title: "라이프케어아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S4T13-1", title: "평생직업교육과정 개발", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S4T14-1", title: "로컬창업아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
            { id: "C1-S4T14-2", title: "팝업아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } }
          ];

          targetPrograms = c1Template.map((tmpl: LegacyAppRecord) => {
            const exist = unit.programs?.find((ex: LegacyAppRecord) => ex.id === tmpl.id) || {};
            return {
              ...tmpl,
              years: exist.years || {}
            };
          });
        }

        return {
          ...unit,
          years: newYears,
          programs: targetPrograms.map((prog: LegacyAppRecord) => {
            const newProgYears: LegacyYearRecord = { ...prog.years };

            // 💡 C1단위과제의 하위 프로그램인 경우, 2차년도 본사업비와 국비/시비 안분, 비목을 강제로 정규화합니다.
            if (isC1) {
              const c1ProgBudgets: Record<string, LegacyAppRecord> = {
                "C1-S1T1-1": { total: 5000000, national: 5000000, city: 0, category: "성과 활용∙확산 지원비" },
                "C1-S1T1-2": { total: 75000000, national: 75000000, city: 0, category: "교육∙연구 환경개선비" },
                "C1-S1T1-3": { total: 30000000, national: 30000000, city: 0, category: "실험∙실습장비 및 기자재 구입∙운영비" },
                "C1-S1T2-1": { total: 10000000, national: 10000000, city: 0, category: "성과 활용∙확산 지원비" },
                "C1-S1T3-1": { total: 0, national: 0, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S1T4-1": { total: 0, national: 0, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S2T5-1": { total: 4000000, national: 4000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S2T6-1": { total: 95000000, national: 95000000, city: 0, category: "교육∙연구 환경개선비" },
                "C1-S2T6-2": { total: 20000000, national: 20000000, city: 0, category: "실험∙실습장비 및 기자재 구입∙운영비" },
                "C1-S2T7-1": { total: 5000000, national: 5000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S3T8-1": { total: 5000000, national: 5000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S3T9-1": { total: 10000000, national: 10000000, city: 0, category: "성과 활용∙확산 지원비" },
                "C1-S3T10-1": { total: 6000000, national: 6000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S3T11-1": { total: 12000000, national: 12000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S3T11-2": { total: 10000000, national: 10000000, city: 0, category: "장학금" },
                "C1-S3T11-3": { total: 2000000, national: 2000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S4T12-1": { total: 10000000, national: 0, city: 10000000, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S4T12-2": { total: 25000000, national: 25000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S4T13-1": { total: 6000000, national: 6000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S4T14-1": { total: 10000000, national: 0, city: 10000000, category: "교육∙연구 프로그램 개발∙운영비" },
                "C1-S4T14-2": { total: 10000000, national: 10000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" }
              };

              const cfg = c1ProgBudgets[prog.id] || { total: 0, national: 0, city: 0, category: "교육∙연구 프로그램 개발∙운영비" };
              newProgYears[2] = {
                budget_main: cfg.total,
                spent_main: 0,
                budget_carry: 0,
                spent_carry: 0,
                budget_national: cfg.national,
                spent_national: 0,
                budget_city: cfg.city,
                spent_city: 0,
                budget_external: 0,
                spent_external: 0,
                budget_carry_national: 0,
                spent_carry_national: 0,
                budget_carry_city: 0,
                spent_carry_city: 0,
                budget_carry_external: 0,
                spent_carry_external: 0,
                budget_categories: [
                  {
                    category: cfg.category,
                    budget: String(cfg.total).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    budget_carry: "0",
                    spent: 0,
                    spent_carry: 0
                  }
                ]
              };
            }

            const p2 = newProgYears[2] || {};

            [3, 4, 5].forEach(yr => {
              const pYr = newProgYears[yr] || {};
              const budgetMain = isA1Na ? 0 : (p2.budget_main || 0);

              // 2차년도의 재원(국비, 시비, 외부사업비) 비율 복사 적용
              const budget_national = isA1Na ? 0 : (p2.budget_national || 0);
              const budget_city = isA1Na ? 0 : (p2.budget_city || 0);
              const budget_external = isA1Na ? 0 : (p2.budget_external || 0);

              newProgYears[yr] = {
                ...pYr,
                budget_main: budgetMain,
                spent_main: 0,
                budget_carry: 0,
                spent_carry: 0,

                budget_national,
                spent_national: 0,
                budget_city,
                spent_city: 0,
                budget_external,
                spent_external: 0,

                budget_carry_national: 0,
                spent_carry_national: 0,
                budget_carry_city: 0,
                spent_carry_city: 0,
                budget_carry_external: 0,
                spent_carry_external: 0
              };

              // 2차년도 비목(budget_categories) 복사 적용 (A1나는 0원)
              if (p2.budget_categories) {
                newProgYears[yr].budget_categories = p2.budget_categories.map((cat: LegacyAppRecord) => ({
                  ...cat,
                  budget: isA1Na ? "0" : cat.budget,
                  budget_carry: "0",
                  spent: 0,
                  spent_carry: 0
                }));
              }
            });

            return {
              ...prog,
              years: newProgYears
            };
          })
        };
      })
    })) as unknown as T;
  };

  // projects 상태 변경 시 다년도 예산과 종료과제 예외 규칙을 강제 정규화합니다.
  useProjectNormalization(
    projects,
    setProjects,
    normalizeProjectsMultiYearData
  );

  // 1) 최초 마운트 및 연차 변경 시 DB 데이터 Fetch 연동
  useEffect(() => {
    let active = true;

    const fetchAllDashboardData = async () => {
      // 💡 [보안/에러 원천 방어 가드] 로그인 완료 전(currentUser가 없음)에는 Supabase API를 요청하지 않고 무조건 대기합니다.
      if (!currentUser) return;

      try {
        // 💡 [깜빡임 방지 및 0초 반응 최적화] 비비비동기 원격 쿼리가 시작되기 전에, IndexedDB 캐시를 먼저 비동기로 즉시 인출하여 상태에 주입합니다.
        try {
          const [
            cachedProj,
            cachedAgr,
            cachedUnifiedCert,
            cachedScholarships,
            cachedEnv,
            cachedEquip,
            cachedServ,
            cachedMonth,
            cachedEvent,
            cachedMeet,
            cachedPress
          ] = await Promise.all([
            getIndexedDBCache(`anchor_cache_proj_y${selectedYear}_v56`),
            getIndexedDBCache("anchor_cache_agreements_all"),
            getIndexedDBCache("anchor_cache_unified_certificates_all"),
            getIndexedDBCache("anchor_cache_scholarships_all"),
            getIndexedDBCache(`anchor_cache_env_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_equip_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_serv_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_month_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_event_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_meet_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_press_y${selectedYear}`)
          ]);

          if (active) {
            if (cachedProj) setProjects(migrateProgramIds(JSON.parse(cachedProj)));
            else setProjects([]);
            if (cachedAgr) setAgreements(JSON.parse(cachedAgr));
            else setAgreements([]);
            if (cachedUnifiedCert) setUnifiedCertificates(JSON.parse(cachedUnifiedCert));
            else setUnifiedCertificates([]);
            if (cachedScholarships) setScholarships(JSON.parse(cachedScholarships));
            else setScholarships([]);
            if (cachedEnv) setEnvData(JSON.parse(cachedEnv));
            else setEnvData([]);
            if (cachedEquip) setEquipData(JSON.parse(cachedEquip));
            else setEquipData([]);
            if (cachedServ) setServiceData(JSON.parse(cachedServ));
            else setServiceData([]);
            if (cachedMonth) setMonthlySchedules(JSON.parse(cachedMonth));
            else setMonthlySchedules([]);
            if (cachedEvent) setEventSchedules(JSON.parse(cachedEvent));
            else setEventSchedules([]);
            if (cachedMeet) setMeetingSchedules(JSON.parse(cachedMeet));
            else setMeetingSchedules([]);
            if (cachedPress) setPressReleases(JSON.parse(cachedPress));
            else setPressReleases([]);

            if (cachedProj || cachedMonth) {
              setIsDbLoaded(true);
            } else {
              setIsDbLoaded(false);
            }
          }
        } catch (cacheErr) {
          console.error("IndexedDB 선제 캐시 로드 중 실패:", cacheErr);
        }
        // 0-0. Supabase schedule_meetings 및 schedule_events 테이블 연차(year) 과거 데이터 자가 보정 (일회성 자가 치료)
        (async () => {
          try {
            // 1) 회의록 연도 정합성 보정
            const { data: dbMeets } = await fetchScheduleMeetingsForYearRepair();
            if (dbMeets && dbMeets.length > 0) {
              for (const m of dbMeets) {
                const correctYear = getCalculatedYearFromDate(m.datetime ? m.datetime.substring(0, 10) : null, m.year);
                if (Number(m.year) !== correctYear) {
                  await updateScheduleMeetingYear(m.id, correctYear);
                  console.log(`[DB보정] 회의록 id ${m.id}의 연도를 ${m.year} -> ${correctYear}로 자가 보정 완료`);
                }
              }
            }
            // 2) 행사 연도 정합성 보정
            const { data: dbEvents } = await fetchScheduleEventsForYearRepair();
            if (dbEvents && dbEvents.length > 0) {
              for (const e of dbEvents) {
                const correctYear = getCalculatedYearFromDate(e.datetime ? e.datetime.substring(0, 10) : null, e.year);
                if (Number(e.year) !== correctYear) {
                  await updateScheduleEventYear(e.id, correctYear);
                  console.log(`[DB보정] 행사 id ${e.id}의 연도를 ${e.year} -> ${correctYear}로 자가 보정 완료`);
                }
              }
            }
          } catch (err) {
            console.error("DB 연차 정합성 자가 보정 중 실패:", err);
          }
        })();

        // 0-0. 원격 DB 040 고도화 컬럼 실존 여부 조용히 선제 노크 (콘솔 400 에러 원천 차단 목적, Promise.all 병렬화)
        try {
          const [chkServRes, chkEnvRes, chkEquipRes] = await probeProcurementAdvancedColumns();
          if (!active) return;
          window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = !!chkServRes.error;
          window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = !!chkEnvRes.error;
          window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = !!chkEquipRes.error;
        } catch {
          if (!active) return;
          window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = true;
          window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = true;
          window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = true;
        }

        const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
        const startDateStr = `${targetYearNum}-03-01T00:00:00+09:00`;
        const endDateStr = `${targetYearNum + 1}-03-01T00:00:00+09:00`;

        // 💡 [속도 극대화] 12개 테이블을 Promise.all을 통해 단 1회의 병렬 쿼리로 동시에 로딩합니다.
        const [
          projRes,
          agrRes,
          certRes,
          schRes,
          envRes,
          equipRes,
          servRes,
          monthRes,
          eventRes,
          meetRes,
          pressRes,
          execRes
        ] = await fetchDashboardSources(selectedYear, startDateStr, endDateStr);

        if (!active) return;

        // 💡 [동기화] Supabase DB의 정산 집행 실적 테이블을 로컬 스토리지에 동기화하여 대시보드 메인 화면에 즉시 롤업되도록 처리
        if (execRes && execRes.data) {
          localStorage.setItem(`budget_exec_records_${selectedYear}`, JSON.stringify(execRes.data));
        }

        // 💡 [인증/세션 만료 예방 안전장치] API 요청 결과 401(Unauthorized)이나 토큰 만료 에러가 감지되면 사용자에게 알리고 자동으로 재로그인을 진행시킵니다.
        const authErrors = [
          projRes?.error, agrRes?.error, certRes?.error, schRes?.error,
          envRes?.error, equipRes?.error, servRes?.error, monthRes?.error,
          eventRes?.error, meetRes?.error, pressRes?.error, execRes?.error
        ].filter(err => {
          const status = err ? (err as LegacyAppRecord).status : null;
          const code = err ? String(err.code || "") : "";
          const msg = err ? String(err.message || "") : "";
          return err && (
            status === 401 ||
            status === 403 ||
            code === "PGRST301" ||
            code === "42501" ||
            msg.includes("JWT") ||
            msg.includes("claims") ||
            msg.includes("expired") ||
            msg.includes("permission denied") ||
            msg.includes("security policy")
          );
        });

        if (authErrors.length > 0) {
          console.warn(">>> [Supabase 인증 세션 만료 감지] 자동으로 로그아웃 처리를 유도합니다. <<<", authErrors);
          alert("보안 세션이 만료되었거나 데이터베이스 인증 오류가 발생했습니다. 안전한 데이터 저장을 위해 확인을 누르시면 자동 로그아웃 후 다시 로그인 화면으로 이동합니다.");
          handleLogout();
          return;
        }

        // 1. Projects 복구
        const projData = projRes.data;

        if (projData && projData.data) {
          // [성과 동기화] 원격 DB 데이터 로드 시점에도 mockData.js의 최신 KPI 구조(C-1~C-6 등)가 강제 유지되도록 동기화합니다.
          // [ID 마이그레이션] DB에서 읽어온 데이터 내의 프로그램 ID들을 5단계 위계 규정에 맞게 마이그레이션 적용합니다.
          const dbProjData = migrateProgramIds(projData.data as unknown as LegacyAppRecord[]);
          const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));

          // 💡 [병합 수정] Supabase에서 로드한 데이터를 최신 실증 데이터 템플릿과 머지하여 데이터 유실을 방지합니다.
          const mergedProjData = mergeProjectsWithInitial(dbProjData, multiYearInitialData);

          // 💡 [승인대기 변경신청 데이터 실시간 오버레이 합성]
          // 일반 연구원(실무진)이 기획 변경 신청을 완료하여 '승인대기' 상태인 요청 정보가 존재하는 경우,
          // 새로고침 시 이 변경 기획 데이터(changes.after)를 세부 프로그램에 오버레이 덮어씌워 렌더링을 유지시킵니다.
          try {
            const { data: pendReqs } = await fetchPendingVersionRequests(selectedYear);

            if (pendReqs && pendReqs.length > 0) {
              mergedProjData.forEach((strat: LegacyAppRecord) => {
                if (strat.units && Array.isArray(strat.units)) {
                  strat.units.forEach((unit: LegacyAppRecord) => {
                    if (unit.programs && Array.isArray(unit.programs)) {
                      unit.programs.forEach((prog: LegacyAppRecord) => {
                        const req = pendReqs.find(r => r.program_id === prog.id);
                        const changes = req?.changes as LegacyAppRecord | null;
                        if (changes?.after) {
                          const after = changes.after as LegacyAppRecord;

                          // P기획 및 수동 수치 오버레이 주입
                          if (after.timeline !== undefined) prog.timeline = after.timeline;
                          if (after.targetAudience !== undefined) prog.targetAudience = after.targetAudience;
                          if (after.coopDept !== undefined) prog.coopDept = after.coopDept;
                          if (after.frequency !== undefined) prog.frequency = after.frequency;
                          if (after.target_participants !== undefined) prog.target_participants = after.target_participants;
                          if (after.target_developments !== undefined) prog.target_developments = after.target_developments;
                          if (after.target_etc !== undefined) prog.target_etc = after.target_etc;
                          if (after.target_participants_unit !== undefined) prog.target_participants_unit = after.target_participants_unit;
                          if (after.target_developments_unit !== undefined) prog.target_developments_unit = after.target_developments_unit;
                          if (after.target_etc_unit !== undefined) prog.target_etc_unit = after.target_etc_unit;
                          if (after.target_participants_name !== undefined) prog.target_participants_name = after.target_participants_name;
                          if (after.target_developments_name !== undefined) prog.target_developments_name = after.target_developments_name;
                          if (after.target_etc_name !== undefined) prog.target_etc_name = after.target_etc_name;
                          if (after.kpi_type !== undefined) prog.kpi_type = after.kpi_type;
                          if (after.kpi_link !== undefined) prog.kpi_link = after.kpi_link;

                          // 연차별 예산 재원 및 비목 상세 덮어쓰기 오버레이
                          if (after.years && after.years[selectedYear]) {
                            const ay = after.years[selectedYear];
                            if (!prog.years) prog.years = {};
                            if (!prog.years[selectedYear]) prog.years[selectedYear] = {};
                            const py = prog.years[selectedYear];

                            if (ay.budget_national !== undefined) py.budget_national = ay.budget_national;
                            if (ay.budget_city !== undefined) py.budget_city = ay.budget_city;
                            if (ay.budget_external !== undefined) py.budget_external = ay.budget_external;
                            if (ay.budget_carry_national !== undefined) py.budget_carry_national = ay.budget_carry_national;
                            if (ay.budget_carry_city !== undefined) py.budget_carry_city = ay.budget_carry_city;
                            if (ay.budget_carry_external !== undefined) py.budget_carry_external = ay.budget_carry_external;

                            py.budget_main = (py.budget_national || 0) + (py.budget_city || 0);
                            if (selectedYear !== 1) {
                              py.budget_carry = (py.budget_carry_national || 0) + (py.budget_carry_city || 0);
                            }

                            if (ay.budget_categories) py.budget_categories = JSON.parse(JSON.stringify(ay.budget_categories));
                          }
                        }
                      });
                    }
                  });
                }
              });

              // 💡 승인대기 정보 적용 후 비목과 총합 재롤업 집계
              mergedProjData.forEach((strategy: LegacyAppRecord) => {
                if (strategy.units && Array.isArray(strategy.units)) {
                  strategy.units.forEach((unit: LegacyAppRecord) => {
                    const categorySums: Record<string, Record<number, LegacyAppRecord>> = {
                      "인건비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "장학금": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "교육∙연구 프로그램 개발∙운영비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "교육∙연구 환경개선비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "실험∙실습장비 및 기자재 구입∙운영비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "지역 연계∙협업 지원비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "기업 지원∙협력 활동비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "성과 활용∙확산 지원비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "그 밖의 사업운영경비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "간접비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } }
                    };

                    [1, 2, 3, 4, 5].forEach((yr) => {
                      if (unit.programs && Array.isArray(unit.programs)) {
                        unit.programs.forEach((prog: LegacyAppRecord) => {
                          const py = prog.years?.[yr] || {};
                          const progTotalMain = py.budget_main || 0;
                          const progTotalCarry = py.budget_carry || 0;
                          const progTotalSpent = py.spent_main || 0;
                          const progTotalSpentCarry = py.spent_carry || 0;

                          let allocatedMain = 0;
                          let allocatedCarry = 0;
                          let allocatedSpent = 0;
                          let allocatedSpentCarry = 0;

                          if (py.budget_categories && Array.isArray(py.budget_categories)) {
                            py.budget_categories.forEach((catItem: LegacyAppRecord) => {
                              const catName = catItem.category;
                              if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                                const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                                const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                                const spentVal = Math.round(catItem.spent || 0);
                                const spentCarryVal = Math.round(catItem.spent_carry || 0);

                                categorySums[catName][yr].main += mainVal;
                                categorySums[catName][yr].carry += carryVal;
                                categorySums[catName][yr].spent_main += spentVal;
                                categorySums[catName][yr].spent_carry += spentCarryVal;

                                allocatedMain += mainVal;
                                allocatedCarry += carryVal;
                                allocatedSpent += spentVal;
                                allocatedSpentCarry += spentCarryVal;
                              }
                            });
                          }

                          const remainMain = Math.max(0, progTotalMain - allocatedMain);
                          const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                          const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                          const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].main += remainMain;
                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].carry += remainCarry;
                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].spent_main += remainSpent;
                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].spent_carry += remainSpentCarry;
                        });
                      }
                    });

                    if (!unit.budgetDetails) unit.budgetDetails = {};
                    Object.keys(categorySums).forEach((catName) => {
                      // 💡 [TypeError 방어] unit.budgetDetails[catName] 객체 및 years 속성이 유실되어 있다면 빈 객체로 확실하게 방어하여 'setting 1' 크래시를 예방합니다.
                      if (!unit.budgetDetails[catName]) {
                        unit.budgetDetails[catName] = { years: {} };
                      }
                      if (!unit.budgetDetails[catName].years) {
                        unit.budgetDetails[catName].years = {};
                      }
                      [1, 2, 3, 4, 5].forEach((yr) => {
                        const mainVal = categorySums[catName][yr].main;

                        // 💡 [단위과제 하위 프로그램들의 총합 비율 계산]
                        let totalProgMain = 0;
                        let totalProgNational = 0;
                        let totalProgSpent = 0;
                        let totalProgSpentNational = 0;

                        if (unit.programs && Array.isArray(unit.programs)) {
                          unit.programs.forEach((prog: LegacyAppRecord) => {
                            const py = prog.years?.[yr] || {};
                            totalProgMain += py.budget_main || 0;
                            totalProgNational += py.budget_national || 0;
                            totalProgSpent += py.spent_main || 0;
                            totalProgSpentNational += py.spent_national || 0;
                          });
                        }

                        const ratio = totalProgMain > 0 ? totalProgNational / totalProgMain : 0.5;
                        const spentRatio = totalProgSpent > 0 ? totalProgSpentNational / totalProgSpent : ratio;

                        // 💡 [교육용 한글 주석] 로컬 캐시 동화 시 A1나 단위과제 국비 100%, 시비 0원 강제 연산 처리
                        const isNationalOnly = unit.id === "A1나";
                        unit.budgetDetails[catName].years[yr] = {
                          budget_main: mainVal,
                          budget_carry: categorySums[catName][yr].carry,
                          spent_main: categorySums[catName][yr].spent_main,
                          spent_carry: categorySums[catName][yr].spent_carry,
                          budget_national: isNationalOnly ? mainVal : Math.round(mainVal * ratio),
                          budget_city: isNationalOnly ? 0 : mainVal - Math.round(mainVal * ratio),
                          budget_external: 0,
                          spent_national: isNationalOnly ? categorySums[catName][yr].spent_main : Math.round(categorySums[catName][yr].spent_main * spentRatio),
                          spent_city: isNationalOnly ? 0 : categorySums[catName][yr].spent_main - Math.round(categorySums[catName][yr].spent_main * spentRatio),
                          spent_external: 0
                        };
                      });
                    });

                    [1, 2, 3, 4, 5].forEach((yr) => {
                      const uYear = unit.years[yr] || {};
                      const budgetDetailValues = Object.values(unit.budgetDetails as Record<string, LegacyAppRecord>);
                      uYear.spent_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_main || 0), 0);
                      uYear.spent_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
                      uYear.budget_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_main || 0), 0);
                      uYear.budget_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_carry || 0), 0);

                      // 💡 [교육용 한글 주석] A1나 단위과제는 국비 100%, 시비 0원 롤업 처리
                      if (unit.id === "A1나") {
                        uYear.budget_national = uYear.budget_main;
                        uYear.budget_city = 0;
                        uYear.budget_external = 0;
                        uYear.spent_national = uYear.spent_main;
                        uYear.spent_city = 0;
                        uYear.spent_external = 0;
                      } else {
                        uYear.budget_national = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_national || 0), 0);
                        uYear.budget_city = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_city || 0), 0);
                        uYear.budget_external = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_external || 0), 0);
                        uYear.spent_national = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_national || 0), 0);
                        uYear.spent_city = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_city || 0), 0);
                        uYear.spent_external = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_external || 0), 0);
                      }
                    });
                  });
                }
              });
            }
          } catch (e) {
            console.error("승인대기 오버레이 처리 실패:", e);
          }

          mergedProjData.forEach((strategy) => {
            if (strategy.units && Array.isArray(strategy.units)) {
              strategy.units.forEach((unit) => {
                const sourceUnit = multiYearInitialData
                  ?.flatMap(s => s.units)
                  ?.find(u => u.id === unit.id);
                if (sourceUnit) {
                  unit.kpis = sourceUnit.kpis || [];
                }
              });
            }
          });
          setProjects(mergedProjData);
          // 💡 [안전 가드] 원격 Supabase DB로부터 최신 프로젝트 데이터를 성공적으로 가져왔으므로, 레퍼런스(fetchedProjectsRef.current)에 동기화해 둡니다.
          fetchedProjectsRef.current = JSON.stringify(getCleanProjectsForStorage(mergedProjData));

          safeSetLocalStorage(`anchor_cache_proj_y${selectedYear}_v56`, JSON.stringify(getCleanProjectsForStorage(mergedProjData)), selectedYear);
          if (currentUser && currentRole?.id !== "GUEST") {
            await upsertProjectData(selectedYear, mergedProjData);
          }
        } else {
          const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));
          setProjects(multiYearInitialData);
          // 💡 [안전 가드] 원격 DB에 데이터가 없어 최초 초기 템플릿을 사용하는 경우에도 레퍼런스에 동기화해 둡니다.
          fetchedProjectsRef.current = JSON.stringify(getCleanProjectsForStorage(multiYearInitialData));

          safeSetLocalStorage(`anchor_cache_proj_y${selectedYear}_v56`, JSON.stringify(getCleanProjectsForStorage(multiYearInitialData)), selectedYear);
          if (currentUser && currentRole?.id !== "GUEST") {
            await upsertProjectData(selectedYear, multiYearInitialData);
          }
        }

        // 2. Agreements 복구 (전체 연차 데이터를 한 번에 가져와 메모리에 유지)
        const agrData = agrRes.data;
        const agrErr = agrRes.error;

        if (agrErr) {
          console.error("Failed to fetch agreements:", agrErr);
        } else {
          setIsAgreementsLoaded(true); // 💡 로드 성공 상태 설정
          if (agrData && agrData.length > 0) {
            const formatted = agrData.map(a => ({
              id: Number(a.id),
              year: a.year,
              date: a.date,
              center: a.center,
              organizations: a.organizations,
              subjectUniversity: a.subject_univ,
              subjectOrganization: a.subject_org || "",
              unitId: a.unit_id,
              contents: a.contents,
              fileName: a.file_name,
              fileData: a.file_data,
              agreementType: a.agreement_type || "-"
            }));
            setAgreements(formatted);
            fetchedAgreementsRef.current = JSON.stringify(formatted); // 🛡️ 원본 저장
            isAgreementsFetchedRef.current = true; // DB 복구 성공 락 해제
            try {
              const clean = formatted.map(item => {
                const isUrl = item.fileData && (item.fileData.startsWith("http://") || item.fileData.startsWith("https://"));
                const cleanFileData = isUrl ? item.fileData : null;
                return { ...item, fileData: cleanFileData };
              });
              safeSetLocalStorage("anchor_cache_agreements_all", JSON.stringify(clean), selectedYear);
            } catch (e) {
              console.error("Failed to save agreements cache:", e);
            }
          } else {
            setAgreements([]);
            fetchedAgreementsRef.current = JSON.stringify([]); // 🛡️ 원본 저장
            isAgreementsFetchedRef.current = true; // DB 복구 성공 락 해제 (빈 데이터)
          }
        }

        // 2-2. Unified Certificates 복구 (전체 연차 데이터를 한 번에 가져와 메모리에 유지)
        const unifiedCertData = certRes.data;
        const unifiedCertErr = certRes.error;

        if (unifiedCertErr) {
          console.error("Failed to fetch unified certificates:", unifiedCertErr);
        } else {
          setIsUnifiedCertificatesLoaded(true); // 💡 로드 성공 상태 설정
          if (unifiedCertData && unifiedCertData.length > 0) {
            const formatted = unifiedCertData.map(c => ({
              id: Number(c.id),
              year: c.year,
              managerDept: c.manager_dept,
              managerName: c.manager_name,
              certNo: c.cert_no,
              certType: c.cert_type,
              awardType: c.award_type,
              note: c.note,
              teamName: c.team_name,
              recipientName: c.recipient_name,
              studentId: c.student_id,
              birthDate: c.birth_date,
              phone: c.phone,
              issueDate: c.issue_date,
              projectGroup: c.project_group,
              issuer: c.issuer,
              content: c.content,
              fileName: c.file_name,
              fileData: c.file_data
            }));
            setUnifiedCertificates(formatted);
            fetchedUnifiedCertificatesRef.current = JSON.stringify(formatted); // 🛡️ 원본 저장
            try {
              const clean = formatted.map(item => {
                const isUrl = item.fileData && (item.fileData.startsWith("http://") || item.fileData.startsWith("https://"));
                const cleanFileData = isUrl ? item.fileData : null;
                return { ...item, fileData: cleanFileData };
              });
              safeSetLocalStorage("anchor_cache_unified_certificates_all", JSON.stringify(clean), selectedYear);
            } catch (e) {
              console.error("Failed to save unified certificates cache:", e);
            }
          } else {
            setUnifiedCertificates([]);
            fetchedUnifiedCertificatesRef.current = JSON.stringify([]); // 🛡️ 원본 저장
          }
        }

        // 2-3. Scholarships 복구
        const scholarshipData = schRes.data;
        const scholarshipError = schRes.error;

        if (scholarshipError) {
          console.error("Failed to fetch scholarships:", scholarshipError);
        } else {
          setIsScholarshipsLoaded(true); // 💡 로드 성공 상태 설정
          if (scholarshipData && scholarshipData.length > 0) {
            const formatted = scholarshipData.map(c => ({
              id: Number(c.id) || Date.now() + Math.random(),
              year: c.year,
              dept: c.dept,
              major: c.major,
              course: c.course,
              studentId: c.student_id,
              name: c.name,
              residentId: c.resident_id,
              grade: c.grade,
              enrollStatus: c.enroll_status,
              regStatus: c.reg_status,
              amount: c.amount,
              bankName: c.bank_name,
              accountNum: c.account_num,
              accountHolder: c.account_holder,
              approvalDate: c.approval_date
            }));
            setScholarships(formatted);
            fetchedScholarshipsRef.current = JSON.stringify(formatted); // 🛡️ 원본 저장
            try {
              const clean = formatted.map(item => ({ ...item }));
              safeSetLocalStorage("anchor_cache_scholarships_all", JSON.stringify(clean), selectedYear);
            } catch (e) {
              console.error("Failed to save scholarships cache:", e);
            }
          } else {
            setScholarships([]);
            fetchedScholarshipsRef.current = JSON.stringify([]); // 🛡️ 원본 저장
          }
        }

        // 3. Procurement (환경개선, 기자재, 주요용역) 복구
        const pEnv = envRes.data;
        const pEnvError = envRes.error;
        const pEquip = equipRes.data;
        const pEquipError = equipRes.error;
        const pServ = servRes.data;
        const pServError = servRes.error;

        if (pEnvError) {
          console.error("Supabase procurement_env fetch error (using fallback cache):", pEnvError);
          const cachedEnv = localStorage.getItem(`anchor_cache_env_y${selectedYear}`);
          if (cachedEnv) {
            try {
              setEnvData(JSON.parse(cachedEnv));
            } catch (e) {
              console.error("Failed to parse cached env data:", e);
            }
          }
        } else if (pEnv && pEnv.length > 0) {
          const formatted = pEnv.map(x => ({
            ...x,
            id: Number(x.id),
            budgetPlan: Number(x.budget_plan),
            budgetSpent: Number(x.budget_spent),
            deptName: x.dept_name || "",
            divisionName: x.division_name || "",
            dateP: x.date_p || "",
            dateA: x.date_a || "",
            dateB: x.date_b || "",
            datePr: x.date_pr || "",
            dateI: x.date_i || "",
            docPlan: x.doc_plan || "",
            docPurchase: x.doc_purchase || "",
            docBid: x.doc_bid || "",
            docPlanFileName: x.doc_plan_file_name || "",
            docPurchaseFileName: x.doc_purchase_file_name || "",
            docBidFileName: x.doc_bid_file_name || "",
            docPlanFileSize: Number(x.doc_plan_file_size) || 0,
            docPurchaseFileSize: Number(x.doc_purchase_file_size) || 0,
            docBidFileSize: Number(x.doc_bid_file_size) || 0,
            docPlanFileUrl: x.doc_plan_file_url || "",
            docPurchaseFileUrl: x.doc_purchase_file_url || "",
            docBidFileUrl: x.doc_bid_file_url || "",
            aiProposalData: x.ai_proposal_data || null,
            aiPurchaseData: x.ai_purchase_data || null,
            aiBidData: x.ai_bid_data || null,
            relatedDocs: x.related_docs || ""
          }));
          setEnvData(formatted);
          fetchedEnvDataRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_env_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          // 💡 [선명 반응 최적화] 데이터가 0건이라도 캐시를 지우지 않고 빈 배열 "[]"로 남겨두어, 다음 렌더링 시 깜빡임 없이 즉각 대처하도록 개선합니다.
          setEnvData([]);
          fetchedEnvDataRef.current = "[]";
          safeSetLocalStorage(`anchor_cache_env_y${selectedYear}`, "[]", selectedYear);
        }

        if (pEquipError) {
          console.error("Supabase procurement_equipment fetch error (using fallback cache):", pEquipError);
          const cachedEquip = localStorage.getItem(`anchor_cache_equip_y${selectedYear}`);
          if (cachedEquip) {
            try {
              setEquipData(JSON.parse(cachedEquip));
            } catch (e) {
              console.error("Failed to parse cached equip data:", e);
            }
          }
        } else if (pEquip && pEquip.length > 0) {
          const formatted = pEquip.map(x => {
            const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
            return {
              id: Number(x.id),
              year: Number(x.year),
              unit: x.unit || "A1",
              seq: Number(x.seq) || 1,
              deptName: x.dept_name || "",
              divisionName: x.division_name || "",
              itemName: x.item_name || "",
              unitPrice: Number(x.unit_price) || 0,
              quantity: Number(x.quantity) || 1,
              spec: x.spec || "",
              itemUnit: x.item_unit || "대",
              description: x.description || "",
              operation: x.operation || "교과목(정규)",
              password: x.password || "1234",
              relatedDocs: x.related_docs || "", // 관련문서 필드 로드 매핑
              docPlan: x.doc_plan || docParts[0] || "", // 기획문서 결재번호 (호환 처리)
              docPurchase: x.doc_purchase || docParts[1] || "", // 구매문서 결재번호 (호환 처리)
              docBid: x.doc_bid || docParts[2] || "", // 입찰문서 결재번호 (호환 처리)
              dateP: x.date_p || "",
              dateA: x.date_a || "",
              dateB: x.date_b || "",
              datePr: x.date_pr || "",
              dateI: x.date_i || "",
              barcode: x.barcode || "",
              asset_number: x.asset_number || ""
            };
          });
          setEquipData(formatted);
          fetchedEquipDataRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_equip_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          // 💡 [선명 반응 최적화] 데이터가 0건이라도 캐시를 지우지 않고 빈 배열 "[]"로 남겨두어, 다음 렌더링 시 깜빡임 없이 즉각 대처하도록 개선합니다.
          setEquipData([]);
          fetchedEquipDataRef.current = "[]";
          safeSetLocalStorage(`anchor_cache_equip_y${selectedYear}`, "[]", selectedYear);
        }
        if (pServError) {
          console.error("Supabase procurement_services fetch error (using fallback cache):", pServError);
          const cachedServ = localStorage.getItem(`anchor_cache_serv_y${selectedYear}`);
          if (cachedServ) {
            try {
              const parsed = JSON.parse(cachedServ);
              // 자가 치유(Self-healing): 이전 스키마(스네이크케이스 등) 캐시 데이터 호환성 보장
              const healed = parsed.map((x: LegacyAppRecord) => ({
                ...x,
                id: Number(x.id || Date.now()),
                year: Number(x.year || selectedYear),
                unit: x.unit || "A1",
                programId: x.programId || x.program_id || "",
                programName: x.programName || x.program_name || "",
                deptName: x.deptName || x.dept_name || "",
                divisionName: x.divisionName || x.division_name || "",
                password: x.password || "1234",
                title: x.title || "",
                purpose: x.purpose || "",
                providerQual: x.providerQual || x.provider_qual || "",
                step: Number(x.step) || 1,
                budgetPlan: Number(x.budgetPlan || x.budget_plan || 0),
                budgetSpent: Number(x.budgetSpent || x.budget_spent || 0),
                opResult: x.opResult || x.op_result || "",

                // 7대 날짜 복원
                datePp: x.datePp || x.date_pp || "",
                dateRfo: x.dateRfo || x.date_rfo || "",
                dateB: x.dateB || x.date_b || "",
                dateEs: x.dateEs || x.date_es || "",
                dateC: x.dateC || x.date_c || "",
                dateE: x.dateE || x.date_e || "",
                dateI: x.dateI || x.date_i || "",

                // 3종 문서
                docPlan: x.docPlan || x.doc_plan || "",
                docPurchase: x.docPurchase || x.doc_purchase || "",
                docBid: x.docBid || x.doc_bid || "",
                docPlanFileName: x.docPlanFileName || x.doc_plan_file_name || "",
                docPurchaseFileName: x.docPurchaseFileName || x.doc_purchase_file_name || "",
                docBidFileName: x.docBidFileName || x.doc_bid_file_name || "",
                docPlanFileSize: Number(x.docPlanFileSize || x.doc_plan_file_size || 0),
                docPurchaseFileSize: Number(x.docPurchaseFileSize || x.doc_purchase_file_size || 0),
                docBidFileSize: Number(x.docBidFileSize || x.doc_bid_file_size || 0),
                docPlanFileUrl: x.docPlanFileUrl || x.doc_plan_file_url || "",
                docPurchaseFileUrl: x.docPurchaseFileUrl || x.doc_purchase_file_url || "",
                docBidFileUrl: x.docBidFileUrl || "",
                aiProposalData: x.aiProposalData || x.ai_proposal_data || null,
                aiPurchaseData: x.aiPurchaseData || x.ai_purchase_data || null,
                aiBidData: x.aiBidData || x.ai_bid_data || null
              }));
              setServiceData(healed);
            } catch (e) {
              console.error("Failed to parse cached services data:", e);
            }
          }
        } else if (pServ && pServ.length > 0) {
          const formatted = pServ.map(x => {
            const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
            return {
              ...x,
              id: Number(x.id),
              year: Number(x.year),
              unit: x.unit || "A1",
              programId: x.program_id || "",
              programName: x.program_name || "",
              deptName: x.dept_name || "",
              divisionName: x.division_name || "",
              password: x.password || "1234",
              relatedDocs: x.related_docs || "",
              budgetPlan: Number(x.budget_plan),
              budgetSpent: Number(x.budget_spent),
              step: Number(x.step) || 1,
              opResult: x.op_result || "",
              // 7대 절차 날짜 맵핑
              datePp: x.date_pp || "",
              dateRfo: x.date_rfo || "",
              dateB: x.date_b || "",
              dateEs: x.date_es || "",
              dateC: x.date_c || "",
              dateE: x.date_e || "",
              dateI: x.date_i || "",
              // 3종 관련 문서 및 AI 데이터 맵핑
              docPlan: x.doc_plan || docParts[0] || "",
              docPurchase: x.doc_purchase || docParts[1] || "",
              docBid: x.doc_bid || docParts[2] || "",
              docPlanFileName: x.doc_plan_file_name || "",
              docPurchaseFileName: x.doc_purchase_file_name || "",
              docBidFileName: x.doc_bid_file_name || "",
              docPlanFileSize: Number(x.doc_plan_file_size) || 0,
              docPurchaseFileSize: Number(x.doc_purchase_file_size) || 0,
              docBidFileSize: Number(x.doc_bid_file_size) || 0,
              docPlanFileUrl: x.doc_plan_file_url || "",
              docPurchaseFileUrl: x.doc_purchase_file_url || "",
              docBidFileUrl: x.doc_bid_file_url || "",
              aiProposalData: x.ai_proposal_data || null,
              aiPurchaseData: x.ai_purchase_data || null,
              aiBidData: x.ai_bid_data || null
            };
          });
          setServiceData(formatted);
          fetchedServiceDataRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_serv_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          // 💡 [선명 반응 최적화] 데이터가 0건이라도 캐시를 지우지 않고 빈 배열 "[]"로 남겨두어, 다음 렌더링 시 깜빡임 없이 즉각 대처하도록 개선합니다.
          setServiceData([]);
          fetchedServiceDataRef.current = "[]";
          safeSetLocalStorage(`anchor_cache_serv_y${selectedYear}`, "[]", selectedYear);
        }

        // 4. Schedule (월간일정, 행사일정, 회의일정) 복구
        const sMonth = monthRes.data;
        const sEvent = eventRes.data;
        const sMeet = meetRes.data;

        // 💡 [클린업 자가치유] 기존 DB에 잘못 저장된 연동 행사/회의 데이터는 깨끗하게 영구 삭제처리하여 DB 중복을 자가치유합니다.
        if (sMonth && sMonth.length > 0) {
          const dirtyLinkedItems = sMonth.filter(x => x.event_id !== null || x.meeting_id !== null);
          if (dirtyLinkedItems.length > 0) {
            const dirtyIds = dirtyLinkedItems.map(d => d.id);
            await deleteMonthlySchedulesByIds(dirtyIds);
            console.log(`[Self-Healing] Cleaned up ${dirtyIds.length} duplicate/redundant sync records from schedule_monthly.`);
          }
        }

        if (!active) return;

        const formattedEvents: LegacyAppRecord[] = (sEvent || []).map(x => ({
          id: Number(x.id),
          year: Number(x.year),
          month: Number(x.month),
          title: x.title,
          department: x.department || "",
          location: x.location || "",
          attendeesInternal: x.attendees_internal || "",
          attendeesExternal: x.attendees_external || "",
          program: x.program || "",
          purpose: x.purpose || "",
          result: x.result || "",
          datetime: x.datetime
        }));

        const formattedMeetings: LegacyAppRecord[] = (sMeet || []).map(x => ({
          ...x,
          id: Number(x.id),
          year: Number(x.year),
          month: Number(x.month),
          attendeesInternal: x.attendees_internal || "",
          attendeesExternal: x.attendees_external || "",
          audioUrl: x.audio_url || "",
          pdfUrl: x.pdf_url || ""
        }));

        let formattedMonthly: LegacyAppRecord[] = (sMonth || [])
          .filter(x => x.event_id === null && x.meeting_id === null) // 순수 일반 일정만 로드
          .map(x => ({
            id: Number(x.id),
            year: x.year,
            title: x.title,
            type: x.type,
            dept: x.dept,
            startAt: x.start_at,
            endAt: x.end_at,
            location: x.location,
            isTask: x.is_task || false,
            isDeadline: x.is_deadline || false,
            completed: x.completed || false,
            attendees: x.attendees || "",
            eventId: null,
            meetingId: null
          }));

        // 💡 초도 로드 연동 병합 (주요 행사)
        formattedEvents.forEach(evt => {
          const hasLinked = formattedMonthly.some(m => m.eventId === evt.id);
          if (!hasLinked) {
            const startPart = evt.datetime ? evt.datetime.split(" ~ ")[0].trim() : "";
            let dateStr = startPart.substring(0, 10);
            if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              dateStr = `${evt.year}-${String(evt.month).padStart(2, "0")}-01`;
            }
            const endPart = evt.datetime && evt.datetime.includes(" ~ ") ? evt.datetime.split(" ~ ")[1].trim() : startPart;
            let endDateStr = endPart.substring(0, 10);
            if (!endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              endDateStr = dateStr;
            }

            formattedMonthly.push({
              id: `mevt-init-${Date.now()}-${evt.id}`,
              eventId: evt.id,
              year: evt.year,
              title: `[행사] ${evt.title}`,
              type: "행사",
              dept: evt.department || "사업운영팀",
              startAt: dateStr,
              endAt: endDateStr,
              location: evt.location || "",
              isTask: false,
              isDeadline: false,
              completed: false,
              attendees: evt.attendeesInternal || ""
            });
          }
        });

        // 💡 초도 로드 연동 병합 (회의록)
        formattedMeetings.forEach(meet => {
          const hasLinked = formattedMonthly.some(m => m.meetingId === meet.id);
          if (!hasLinked) {
            const startPart = meet.datetime ? meet.datetime.split(" ~ ")[0].trim() : "";
            let dateStr = startPart.substring(0, 10);
            if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              dateStr = `${meet.year}-${String(meet.month).padStart(2, "0")}-01`;
            }
            const endPart = meet.datetime && meet.datetime.includes(" ~ ") ? meet.datetime.split(" ~ ")[1].trim() : startPart;
            let endDateStr = endPart.substring(0, 10);
            if (!endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              endDateStr = dateStr;
            }

            const isCommittee = meet.category === "각종 위원회" || meet.category === "committee";
            const prefix = isCommittee ? "[위원회]" : "[회의]";
            const typeVal = isCommittee ? "위원회" : "회의";

            formattedMonthly.push({
              id: `mmeet-init-${Date.now()}-${meet.id}`,
              meetingId: meet.id,
              year: meet.year,
              title: `${prefix} ${meet.title}`,
              type: typeVal,
              dept: isCommittee ? "ECC센터" : "사업운영팀",
              startAt: dateStr,
              endAt: endDateStr,
              location: meet.location || "",
              isTask: false,
              isDeadline: false,
              completed: false,
              attendees: meet.attendeesInternal || ""
            });
          }
        });

        setMonthlySchedules(formattedMonthly);
        fetchedMonthlySchedulesRef.current = JSON.stringify(formattedMonthly);
        safeSetLocalStorage(`anchor_cache_month_y${selectedYear}`, JSON.stringify(formattedMonthly), selectedYear);

        setEventSchedules(formattedEvents);
        fetchedEventSchedulesRef.current = JSON.stringify(formattedEvents);
        safeSetLocalStorage(`anchor_cache_event_y${selectedYear}`, JSON.stringify(formattedEvents), selectedYear);

        setMeetingSchedules(formattedMeetings);
        fetchedMeetingSchedulesRef.current = JSON.stringify(formattedMeetings);
        safeSetLocalStorage(`anchor_cache_meet_y${selectedYear}`, JSON.stringify(formattedMeetings), selectedYear);


        // press_releases 복구 (year 칼럼 매핑 오류와 무관하게 실제 기사 발행일 범위 기준으로 정밀 분리 패치)
        const sPress = pressRes.data;
        const sPressErr = pressRes.error;

        if (sPressErr) {
          console.error("Failed to fetch press releases:", sPressErr);
        } else if (sPress && sPress.length > 0) {
          const formatted = sPress.map(x => ({
            id: Number(x.id),
            year: x.year,
            type: x.type,
            media: x.media,
            title: x.title,
            broadcastDate: x.broadcast_date,
            contentUrl: x.content_url,
            pressContent: x.press_content || ""
          }));
          setPressReleases(formatted);
          fetchedPressReleasesRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_press_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          setPressReleases([]);
          fetchedPressReleasesRef.current = "[]";
          localStorage.removeItem(`anchor_cache_press_y${selectedYear}`);
        }

        if (!active) return;
        setIsDbLoaded(true);
        setIsFetchCompleted(true);
        setActiveDataYear(selectedYear); // 💡 패치가 완전히 적용된 연차를 기록하여 동기화 혼선 차단
      } catch (e) {
        if (!active) return;
        console.error("Error loading dashboard data from Supabase:", e);
        setIsDbLoaded(true);
        setIsFetchCompleted(true);
      }
    };

    fetchAllDashboardData();
    return () => {
      active = false;
    };
  // oxlint-disable-next-line react/exhaustive-deps -- selectedYear and currentUser own dashboard loading; role restoration must not start a second full fetch.
  }, [selectedYear, currentUser]);

  // 2) Projects 자동 저장 디바운스 훅
  useProjectAutosave({
    projects,
    selectedYear,
    isDbLoaded,
    isFetchCompleted,
    canWrite: Boolean(currentUser && currentRole?.id !== "GUEST"),
    fetchedProjectsRef,
    safeSetLocalStorage,
    setSyncStatus
  });

  // 💡 DB 동기화 중(syncStatus === "syncing") 새로고침 및 페이지 탈출 방어 훅
  useSyncBeforeUnload(syncStatus);

  // 3) Agreements 자동 저장 (통합 캐시 및 원격 fetch 안전 잠금)
  useAgreementsAutosave({
    agreements,
    selectedYear,
    isDbLoaded,
    isFetchCompleted,
    isAgreementsLoaded,
    canWrite: Boolean(currentUser && currentRole?.id !== "GUEST"),
    isAgreementsFetchedRef,
    fetchedAgreementsRef,
    safeSetLocalStorage,
    setSyncStatus
  });

  // 10) Press Releases (언론보도) 자동 저장 디바운스 훅 (타 연차 기사 지능형 즉시 분배 저장 탑재)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;

    // 기사 날짜 기준 연차(1~5) 자동 계산 헬퍼
    const getCalculatedYearFromDate = (dateStr: string) => {
      if (!dateStr) return selectedYear;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return selectedYear;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      let calcYear = year;
      if (month < 3) {
        calcYear = year - 1;
      }
      return calcYear === 2025 ? 1 : calcYear === 2026 ? 2 : calcYear === 2027 ? 3 : calcYear === 2028 ? 4 : calcYear === 2029 ? 5 : selectedYear;
    };

    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;

    // 💡 철통 방어망: 현재 화면의 데이터가 속한 연차(activeDataYear)와 탭 연차(selectedYear)가 다르면 즉시 중단!
    // 이는 비동기 로딩 및 탭 전환 타이밍에 발생하는 치명적인 Race Condition 삭제 버그를 완벽히 막아줍니다.
    if (activeDataYear !== selectedYear) return;

    // 💡 Race Condition 방지: 방금 DB에서 가져온 상태 그대로라면(사용자 수정 없음) Auto-save를 수행하지 않음.
    // 이는 빈 배열([])일 때 isStaleState 가 실패하여 타 연차 DB를 싹 지워버리는 치명적인 버그를 완벽히 막아줍니다.
    if (JSON.stringify(pressReleases) === fetchedPressReleasesRef.current) {
      return;
    }

    // 💡 탭(연차) 전환 시, 데이터를 새로 패치하기 전의 과거 연차 상태(Stale State)에서 자동저장이 도는 것을 방지
    // 이 처리가 없으면 과거 연차 데이터가 '타 연차 기사'로 오인되어 이전 연차 DB에 계속 무한 중복 Insert 됨!
    const isStaleState = pressReleases.length > 0 && pressReleases.some(s => s.year !== selectedYear);
    if (isStaleState) {
      return; // DB 패치가 완료되어 s.year === selectedYear 로 맞춰질 때까지 대기
    }

    // 💡 타 연차에 해당하는 기사들 (사용자가 날짜를 다른 연차로 수정한 경우)
    const otherYearPress = pressReleases.filter(s => getCalculatedYearFromDate(s.broadcastDate) !== selectedYear);

    // 현재 선택된 연차에 속하는 기사들만 추출
    const currentYearPress = pressReleases.filter(s => getCalculatedYearFromDate(s.broadcastDate) === selectedYear);

    // 로컬스토리지에는 현재 연차 보도자료 저장
    safeSetLocalStorage(`anchor_cache_press_y${selectedYear}`, JSON.stringify(currentYearPress), selectedYear);
    setSyncStatus("syncing");

    const formatToPostgresTimestamp = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString();
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return new Date().toISOString();

      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = parsed.getFullYear();
      const mm = pad(parsed.getMonth() + 1);
      const dd = pad(parsed.getDate());
      const hh = pad(parsed.getHours());
      const mi = pad(parsed.getMinutes());
      const ss = pad(parsed.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}+09`;
    };

    const syncPressImmediate = async () => {
      try {
        // --- 1단계: 타 연차 기사가 발견되었을 경우 해당 연차 DB에 단독 Insert 및 청소 ---
        if (otherYearPress.length > 0) {
          let hasError = false;
          for (const item of otherYearPress) {
            const targetYear = getCalculatedYearFromDate(item.broadcastDate);
            console.log(`타 연차 기사 감지: ${item.title} -> ${targetYear}차년도 DB로 직접 저장합니다.`);

            let insertPayload = {
              year: targetYear,
              type: item.type || "기타",
              media: item.media || "미상",
              title: item.title || "새 보도자료",
              broadcast_date: formatToPostgresTimestamp(item.broadcastDate),
              content_url: item.contentUrl || "https://www.uc.ac.kr",
              press_content: item.pressContent || ""
            };

            let singleInsertErr = null;
            if (window.__HAS_NO_ADVANCED_PRESS_COLUMNS__) {
              const { press_content: _press_content, ...rest } = insertPayload;
              const { error } = await insertPressRelease(rest);
              singleInsertErr = error;
            } else {
              const { error } = await insertPressRelease(insertPayload);
              singleInsertErr = error;
              if (singleInsertErr) {
                console.warn("DB에 press_releases 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", singleInsertErr);
                window.__HAS_NO_ADVANCED_PRESS_COLUMNS__ = true;
                const { press_content: _press_content, ...rest } = insertPayload;
                const { error: fallbackErr } = await insertPressRelease(rest);
                singleInsertErr = fallbackErr;
              }
            }

            if (singleInsertErr) {
              console.error(`Failed to insert press release to year ${targetYear}:`, singleInsertErr);
              alert(`📡 타 연차 보도자료 DB 저장 중 오류가 발생했습니다.\n\n[오류 원인]: ${singleInsertErr.message || singleInsertErr}`);
              hasError = true;
            } else {
              // 💡 성공 시 해당 연차의 로컬 캐시도 즉시 업데이트하여 깜빡임 및 누락 예방
              try {
                const cachedPressStr = localStorage.getItem(`anchor_cache_press_y${targetYear}`);
                const cachedPressList = cachedPressStr ? JSON.parse(cachedPressStr) : [];
                if (!cachedPressList.some((p: LegacyAppRecord) => p.title === item.title && p.broadcastDate === item.broadcastDate)) {
                  const updatedCache = [item, ...cachedPressList];
                  safeSetLocalStorage(`anchor_cache_press_y${targetYear}`, JSON.stringify(updatedCache), targetYear);
                }
              } catch (cacheErr) {
                console.warn("Failed to update target year cache:", cacheErr);
              }
            }
          }

          if (!hasError) {
            // 성공했을 때만 현재 연차 상태에서 제거 (클로저 Race Condition 방지를 위해 ID 기반 필터링 적용)
            const otherIds = otherYearPress.map(item => item.id);
            setPressReleases(prev => prev.filter(s => !otherIds.includes(s.id)));
            // alert는 다른 화면(상장/이수증 등)을 보고 있을 때 방해되므로 제거하고 조용히 백그라운드 처리
            console.log(`[언론보도] 타 연차(${getCalculatedYearFromDate(otherYearPress[0].broadcastDate)}차년도)로 기사가 자동 이동되었습니다.`);
          }
          setSyncStatus(hasError ? "error" : "synced");
          return;
        }

        // --- 2단계: 원래 선택된 현재 연차 기사들의 정상 동기화 처리 ---
        const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
        const startDateStr = `${targetYearNum}-03-01T00:00:00+09:00`;
        const endDateStr = `${targetYearNum + 1}-03-01T00:00:00+09:00`;

        const { data: currentDbItems, error: fetchErr } = await fetchPressReleaseIds(
          startDateStr,
          endDateStr
        );

        if (fetchErr) {
          console.error("Failed to fetch current press releases to rollback backup:", fetchErr);
          setSyncStatus("error");
          return;
        }

        const oldIds = (currentDbItems || []).map(item => item.id);

        if (currentYearPress.length > 0) {
          const insertPayload = currentYearPress.map(s => ({
            year: selectedYear,
            type: s.type || "기타",
            media: s.media || "미상",
            title: s.title || "새 보도자료",
            broadcast_date: formatToPostgresTimestamp(s.broadcastDate),
            content_url: s.contentUrl || "https://www.uc.ac.kr",
            press_content: s.pressContent || ""
          }));

          let insertErr = null;
          if (window.__HAS_NO_ADVANCED_PRESS_COLUMNS__) {
            const safePayload = insertPayload.map(item => {
              const { press_content: _press_content, ...rest } = item;
              return rest;
            });
            const { error } = await insertPressReleases(safePayload);
            insertErr = error;
          } else {
            const { error } = await insertPressReleases(insertPayload);
            insertErr = error;
            if (insertErr) {
              console.warn("DB에 press_releases 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", insertErr);
              window.__HAS_NO_ADVANCED_PRESS_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => {
                const { press_content: _press_content, ...rest } = item;
                return rest;
              });
              const { error: fallbackErr } = await insertPressReleases(safePayload);
              insertErr = fallbackErr;
            }
          }

          if (insertErr) {
            console.error("Failed to insert new press releases:", insertErr);
            alert(`📡 데이터베이스 저장 오류가 검출되었습니다.\n\n[오류 원인]: ${insertErr.message || insertErr}\n\n데이터 유실 방지를 위해 기존 보도 대장은 안전하게 롤백/보존되었습니다.`);
            setSyncStatus("error");
            return;
          }
        }

        if (oldIds.length > 0) {
          const { error: deleteErr } = await deletePressReleasesByIds(oldIds);

          if (deleteErr) {
            console.error("Failed to clean up old press releases:", deleteErr);
          }
        }
        // 💡 성공적인 Sync 완료 후, 현재 화면의 상태를 "순수 상태"로 참조 업데이트하여 무한 루프 방지
        fetchedPressReleasesRef.current = JSON.stringify(pressReleases);
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync press releases:", e);
        setSyncStatus("error");
      }
    };
    syncPressImmediate();
  // oxlint-disable-next-line react/exhaustive-deps -- press changes, year, and load guards own synchronization; auth and active-year restoration are safety checks, not write triggers.
  }, [pressReleases, selectedYear, isDbLoaded, isFetchCompleted]);

  // 3-2) Unified Certificates 자동 저장
  useUnifiedCertificateAutosave({
    unifiedCertificates,
    selectedYear,
    isDbLoaded,
    isFetchCompleted,
    isLoaded: isUnifiedCertificatesLoaded,
    canWrite: Boolean(currentUser && currentRole?.id !== "GUEST"),
    fetchedUnifiedCertificatesRef,
    safeSetLocalStorage,
    setSyncStatus
  });

  // 3-3) Scholarships 자동 저장
  useScholarshipAutosave({
    scholarships,
    selectedYear,
    isDbLoaded,
    isFetchCompleted,
    isLoaded: isScholarshipsLoaded,
    canWrite: Boolean(currentUser && currentRole?.id !== "GUEST"),
    fetchedScholarshipsRef,
    safeSetLocalStorage,
    setSyncStatus
  });

  // 4) Procurement Env 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;

    // 💡 안전 가드: 데이터가 없거나 로딩 중 꼬였을 때 DB 데이터를 지워버리는 대형 사고 방지
    if (!envData || envData.length === 0) return;

    // 💡 [정합성 안전 가드] 원격 DB fetch 결과와 일치하면 불필요한 자동 저장(덮어쓰기 오염)을 스킵합니다.
    const currentCleanStr = JSON.stringify(envData);
    if (!fetchedEnvDataRef.current || fetchedEnvDataRef.current === currentCleanStr) {
      safeSetLocalStorage(`anchor_cache_env_y${selectedYear}`, currentCleanStr, selectedYear);
      return;
    }

    safeSetLocalStorage(`anchor_cache_env_y${selectedYear}`, currentCleanStr, selectedYear);
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await deleteEnvironmentRecordsByYear(selectedYear);
        if (envData.length > 0) {
          const insertPayload = envData.map(e => ({
            year: selectedYear,
            title: e.title,
            unit: e.unit,
            plan: e.plan,
            meeting_result: e.meetingResult,
            progress: e.progress,
            budget_plan: e.budgetPlan,
            budget_spent: e.budgetSpent,
            location: e.location,
            purpose: e.purpose,
            birdseye_view: e.birdseyeView,
            blueprints: e.blueprints,
            utilization: e.utilization,
            dept_name: e.deptName || "",
            division_name: e.divisionName || "",
            date_p: e.dateP || null,
            date_a: e.dateA || null,
            date_b: e.dateB || null,
            date_pr: e.datePr || null,
            date_i: e.dateI || null,
            doc_plan: e.docPlan || "",
            doc_purchase: e.docPurchase || "",
            doc_bid: e.docBid || "",
            doc_plan_file_name: e.docPlanFileName || "",
            doc_purchase_file_name: e.docPurchaseFileName || "",
            doc_bid_file_name: e.docBidFileName || "",
            doc_plan_file_size: Number(e.docPlanFileSize) || 0,
            doc_purchase_file_size: Number(e.docPurchaseFileSize) || 0,
            doc_bid_file_size: Number(e.docBidFileSize) || 0,
            doc_plan_file_url: e.docPlanFileUrl || "",
            doc_purchase_file_url: e.docPurchaseFileUrl || "",
            doc_bid_file_url: e.docBidFileUrl || "",
            ai_proposal_data: e.aiProposalData || null,
            ai_purchase_data: e.aiPurchaseData || null,
            ai_bid_data: e.aiBidData || null,
            related_docs: e.relatedDocs || ""
          }));

          let error = null;

          if (window.__HAS_NO_ADVANCED_ENV_COLUMNS__) {
            const safePayload = insertPayload.map(item => {
              const {
                dept_name: _dept_name, division_name: _division_name,
                date_p: _date_p, date_a: _date_a, date_b: _date_b, date_pr: _date_pr, date_i: _date_i,
                doc_plan: _doc_plan, doc_purchase: _doc_purchase, doc_bid: _doc_bid,
                doc_plan_file_name: _doc_plan_file_name, doc_purchase_file_name: _doc_purchase_file_name, doc_bid_file_name: _doc_bid_file_name,
                doc_plan_file_size: _doc_plan_file_size, doc_purchase_file_size: _doc_purchase_file_size, doc_bid_file_size: _doc_bid_file_size,
                doc_plan_file_url: _doc_plan_file_url, doc_purchase_file_url: _doc_purchase_file_url, doc_bid_file_url: _doc_bid_file_url,
                ai_proposal_data: _ai_proposal_data, ai_purchase_data: _ai_purchase_data, ai_bid_data: _ai_bid_data, related_docs: _related_docs,
                ...rest
              } = item;
              return rest;
            });
            const { error: retryErr } = await insertEnvironmentRecords(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } = await insertEnvironmentRecords(insertPayload);
            error = firstErr;

            if (error) {
              console.warn("DB에 procurement_env 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", error);
              window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => {
                const {
                  dept_name: _dept_name, division_name: _division_name,
                  date_p: _date_p, date_a: _date_a, date_b: _date_b, date_pr: _date_pr, date_i: _date_i,
                  doc_plan: _doc_plan, doc_purchase: _doc_purchase, doc_bid: _doc_bid,
                  doc_plan_file_name: _doc_plan_file_name, doc_purchase_file_name: _doc_purchase_file_name, doc_bid_file_name: _doc_bid_file_name,
                  doc_plan_file_size: _doc_plan_file_size, doc_purchase_file_size: _doc_purchase_file_size, doc_bid_file_size: _doc_bid_file_size,
                  doc_plan_file_url: _doc_plan_file_url, doc_purchase_file_url: _doc_purchase_file_url, doc_bid_file_url: _doc_bid_file_url,
                  ai_proposal_data: _ai_proposal_data, ai_purchase_data: _ai_purchase_data, ai_bid_data: _ai_bid_data, related_docs: _related_docs,
                  ...rest
                } = item;
                return rest;
              });
              const { error: retryErr } = await insertEnvironmentRecords(safePayload);
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

  // 5) Procurement Equipment 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;

    // 💡 안전 가드: 데이터가 없거나 로딩 중 꼬였을 때 DB 데이터를 지워버리는 대형 사고 방지
    if (!equipData || equipData.length === 0) return;

    // 💡 [정합성 안전 가드] 원격 DB fetch 결과와 일치하면 불필요한 자동 저장(덮어쓰기 오염)을 스킵합니다.
    const currentCleanStr = JSON.stringify(equipData);
    if (!fetchedEquipDataRef.current || fetchedEquipDataRef.current === currentCleanStr) {
      safeSetLocalStorage(`anchor_cache_equip_y${selectedYear}`, currentCleanStr, selectedYear);
      return;
    }

    safeSetLocalStorage(`anchor_cache_equip_y${selectedYear}`, currentCleanStr, selectedYear);
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await deleteEquipmentRecordsByYear(selectedYear);
        if (equipData.length > 0) {
          const insertPayload = equipData.map(e => ({
            year: selectedYear,
            unit: e.unit || "A1",
            seq: Number(e.seq) || 1,
            dept_name: e.deptName || "",
            division_name: e.divisionName || "",
            item_name: e.itemName || e.name || "",
            unit_price: Number(e.unitPrice) || 0,
            quantity: Number(e.quantity) || 1,
            spec: e.spec || "",
            item_unit: e.itemUnit || "대",
            description: e.description || "",
            operation: e.operation || "교과목(정규)",
            password: e.password || "1234",
            related_docs: e.relatedDocs || [e.docPlan, e.docPurchase, e.docBid].filter(Boolean).join(", "),
            doc_plan: e.docPlan || "",
            doc_purchase: e.docPurchase || "",
            doc_bid: e.docBid || "",
            date_p: e.dateP || null,
            date_a: e.dateA || null,
            date_b: e.dateB || null,
            date_pr: e.datePr || null,
            date_i: e.date_i || e.dateI || null,
            barcode: e.barcode || "",
            asset_number: e.asset_number || ""
          }));

          // 💡 초연결 자산 연동: '기자재 구매' 단계에서 바코드가 입력된 항목들을 equipment_assets 테이블에 자동 Upsert 동기화
          const assetsPayload = equipData
            .filter(e => e.barcode) // 바코드가 실재로 스캔 등록된 자산만 연동
            .map(e => ({
              barcode_id: e.barcode,
              asset_number: e.asset_number || `AIDX-EQ-${e.id}`,
              item_name: e.itemName || e.name || "새 기자재 항목",
              dept_name: e.deptName || e.divisionName || "",
              unit_price: Number(e.unitPrice) || 0,
              quantity: Number(e.quantity) || 1,
              stock_location: e.location || "",
              memo: e.description || "",
              category: (e.itemName || e.name || "").includes("AI") || (e.itemName || e.name || "").includes("DX") ? "AI∙DX 자산" : "기타자산",
              usage_type: "정규교과"
            }));

          if (assetsPayload.length > 0) {
            const { error: assetSyncErr } = await upsertEquipmentAssets(assetsPayload);
            if (assetSyncErr) {
              console.error("equipment_assets 자산 동기화 실패:", assetSyncErr.message);
            }
          }

          let error = null;

          if (window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__) {
            const safePayload = insertPayload.map(item => {
              const {
                date_p: _date_p, date_a: _date_a, date_b: _date_b, date_pr: _date_pr, date_i: _date_i,
                doc_plan: _doc_plan, doc_purchase: _doc_purchase, doc_bid: _doc_bid,
                ...rest
              } = item;
              return rest;
            });
            const { error: retryErr } = await insertEquipmentRecords(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } = await insertEquipmentRecords(insertPayload);
            error = firstErr;

            if (error) {
              console.warn("DB에 procurement_equipment 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", error);
              window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => {
                const {
                  date_p: _date_p, date_a: _date_a, date_b: _date_b, date_pr: _date_pr, date_i: _date_i,
                  doc_plan: _doc_plan, doc_purchase: _doc_purchase, doc_bid: _doc_bid,
                  ...rest
                } = item;
                return rest;
              });
              const { error: retryErr } = await insertEquipmentRecords(safePayload);
              error = retryErr;
            }
          }

          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync procurement_equipment:", e);
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  // oxlint-disable-next-line react/exhaustive-deps -- equipment data, year, and load guards own synchronization; auth restoration is a permission check, not a write trigger.
  }, [equipData, selectedYear, isDbLoaded, isFetchCompleted]);

  // 6) Procurement Services 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;

    // 💡 안전 가드: 데이터가 없거나 로딩 중 꼬였을 때 DB 데이터를 지워버리는 대형 사고 방지
    if (!serviceData || serviceData.length === 0) return;

    // 💡 [정합성 안전 가드] 원격 DB fetch 결과와 일치하면 불필요한 자동 저장(덮어쓰기 오염)을 스킵합니다.
    const currentCleanStr = JSON.stringify(serviceData);
    if (!fetchedServiceDataRef.current || fetchedServiceDataRef.current === currentCleanStr) {
      safeSetLocalStorage(`anchor_cache_serv_y${selectedYear}`, currentCleanStr, selectedYear);
      return;
    }

    safeSetLocalStorage(`anchor_cache_serv_y${selectedYear}`, currentCleanStr, selectedYear);
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await deleteServiceRecordsByYear(selectedYear);
        if (serviceData.length > 0) {
          const insertPayload = serviceData.map(s => ({
            year: selectedYear,
            unit: s.unit || "A1",
            program_id: s.programId || "",
            program_name: s.programName || "",
            dept_name: s.deptName || "",
            division_name: s.divisionName || "",
            password: s.password || "1234",
            related_docs: s.relatedDocs || "",
            title: s.title,
            purpose: s.purpose,
            provider_qual: s.providerQual,
            step: s.step || 1,
            budget_plan: s.budgetPlan,
            budget_spent: s.budgetSpent,
            op_result: s.opResult,
            // 7대 절차 날짜
            date_pp: s.datePp || null,
            date_rfo: s.dateRfo || null,
            date_b: s.dateB || null,
            date_es: s.dateEs || null,
            date_c: s.dateC || null,
            date_e: s.dateE || null,
            date_i: s.dateI || null,
            // 3종 관련 문서 및 AI 데이터
            doc_plan: s.docPlan || "",
            doc_purchase: s.docPurchase || "",
            doc_bid: s.doc_bid || s.docBid || "",
            doc_plan_file_name: s.docPlanFileName || "",
            doc_purchase_file_name: s.docPurchaseFileName || "",
            doc_bid_file_name: s.docBidFileName || "",
            doc_plan_file_size: Number(s.docPlanFileSize) || 0,
            doc_purchase_file_size: Number(s.docPurchaseFileSize) || 0,
            doc_bid_file_size: Number(s.docBidFileSize) || 0,
            doc_plan_file_url: s.docPlanFileUrl || "",
            doc_purchase_file_url: s.docPurchaseFileUrl || "",
            doc_bid_file_url: s.docBidFileUrl || "",
            ai_proposal_data: s.aiProposalData || null,
            ai_purchase_data: s.aiPurchaseData || null,
            ai_bid_data: s.aiBidData || null
          }));

          let error = null;

          if (window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__) {
            const safePayload = insertPayload.map(item => ({
              year: item.year,
              title: item.title,
              step: item.step,
              budget_plan: item.budget_plan,
              budget_spent: item.budget_spent,
              op_result: item.op_result
            }));
            const { error: retryErr } = await insertServiceRecords(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } = await insertServiceRecords(insertPayload);
            error = firstErr;

            if (error) {
              console.warn("DB에 procurement_services 고도화 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", error);
              window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => ({
                year: item.year,
                title: item.title,
                step: item.step,
                budget_plan: item.budget_plan,
                budget_spent: item.budget_spent,
                op_result: item.op_result
              }));
              const { error: retryErr } = await insertServiceRecords(safePayload);
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

  // 최신 monthlySchedules 상태 보존을 위한 Ref (언마운트/탭이동 시 즉시 강제 Flush 동기화 보장)
  const latestMonthlySchedulesRef = useRef<LegacyAppRecord[] | null>(null);
  useEffect(() => {
    latestMonthlySchedulesRef.current = monthlySchedules;
  }, [monthlySchedules]);

  // 7) Schedule Monthly 자동 저장 디바운스 훅 (원자적 Upsert + Diff Delete 적용)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    if (!monthlySchedules) return;

    // 💡 안전 가드 0: 원격 DB에서 가져온 최초 데이터 또는 직전 동기화 데이터와 로컬 상태가 100% 동일하다면 불필요한 쿼리 전송 및 유실 사고 방지를 위해 즉시 리턴함.
    if (fetchedMonthlySchedulesRef.current === JSON.stringify(monthlySchedules)) return;

    // 💡 안전 가드 1: 데이터 형식이 비정상적이거나 날짜/제목 누락 시 동기화 스킵하여 증발 방지
    const hasInvalidItem = monthlySchedules.some(s => !s.title?.trim() || !s.startAt || !s.endAt);
    if (hasInvalidItem) {
      console.warn("Schedule sync aborted: detected invalid schedule item with missing title or dates.", monthlySchedules);
      return;
    }

    safeSetLocalStorage(`anchor_cache_month_y${selectedYear}`, JSON.stringify(monthlySchedules), selectedYear);
    setSyncStatus("syncing");

    const performSync = async (schedulesToSync: LegacyAppRecord[], targetYear: number) => {
      try {
        if (!schedulesToSync) return;

        // 1. 모든 일정이 삭제된 상태면 원격 DB 해당 연도 전체 삭제
        if (schedulesToSync.length === 0) {
          const { error } = await deleteMonthlySchedulesByYear(targetYear);
          if (error) throw error;
          fetchedMonthlySchedulesRef.current = JSON.stringify([]);
          setSyncStatus("synced");
          return;
        }

        // 💡 [중복 방지] 주요 행사(eventId) 또는 회의록(meetingId) 연동 일정은 schedule_monthly DB에 저장하지 않고,
        // 오직 화면단에서만 실시간 병합/표시합니다. 이를 통해 DB 중복 저장을 원천 차단합니다.
        const pureSchedulesToSync = schedulesToSync.filter(s => !s.eventId && !s.meetingId);

        // 2. 신규 생성(id가 없음)과 기존 수정(id가 존재)을 분리하여 Not-Null primary key Violate 방지
        const newItems: ScheduleMonthlyInsert[] = [];
        const updateItems: ScheduleMonthlyInsert[] = [];

        pureSchedulesToSync.forEach(s => {
          const item: ScheduleMonthlyInsert = {
            year: targetYear,
            title: s.title,
            type: s.type || "기타",
            dept: s.dept || "사업운영팀",
            start_at: s.startAt,
            end_at: s.endAt,
            location: s.location || "",
            is_task: s.isTask || false,
            is_deadline: s.isDeadline || false,
            completed: s.completed || false,
            attendees: s.attendees || "",
            event_id: s.eventId || null,
            meeting_id: s.meetingId || null
          };
          if (s.id && typeof s.id === "number" && s.id < 2000000000) {
            item.id = s.id;
            updateItems.push(item);
          } else {
            newItems.push(item);
          }
        });

        // 3. 분할 전송 수행 및 새로 발행된 sequence id 결과 조회
        const upsertedData: LegacyAppRecord[] = [];

        // [A] 기존 수정 일정 (upsert)
        if (updateItems.length > 0) {
          const { data: upData, error: upError } = await upsertMonthlySchedules(updateItems);

          if (upError) {
            if (upError.code === "42703") {
              const fallbackItems = updateItems.map(({ event_id: _event_id, meeting_id: _meeting_id, ...rest }) => rest);
              const { data: fbData, error: fbError } = await upsertMonthlySchedules(fallbackItems);
              if (fbError) throw fbError;
              if (fbData) upsertedData.push(...fbData);
            } else {
              throw upError;
            }
          } else if (upData) {
            upsertedData.push(...upData);
          }
        }

        // [B] 신규 추가 일정 (insert)
        if (newItems.length > 0) {
          const { data: insData, error: insError } = await insertMonthlySchedules(newItems);

          if (insError) {
            if (insError.code === "42703") {
              const fallbackItems = newItems.map(({ event_id: _event_id, meeting_id: _meeting_id, ...rest }) => rest);
              const { data: fbData, error: fbError } = await insertMonthlySchedules(fallbackItems);
              if (fbError) throw fbError;
              if (fbData) upsertedData.push(...fbData);
            } else {
              throw insError;
            }
          } else if (insData) {
            upsertedData.push(...insData);
          }
        }

        // 4. 로컬 임시 id를 DB sequence id로 매핑 복원하여 중복 인서트 방지 (날짜 substring 10자리 비교 및 camelCase 규격 정형화)
        let finalLocalSchedules = schedulesToSync;
        if (upsertedData && upsertedData.length > 0) {
          const normalizedUpserted: LegacyAppRecord[] = upsertedData.map(x => ({
            id: Number(x.id),
            year: Number(x.year),
            title: x.title,
            type: x.type,
            dept: x.dept,
            startAt: x.start_at,
            endAt: x.end_at,
            location: x.location,
            isTask: x.is_task || false,
            isDeadline: x.is_deadline || false,
            completed: x.completed || false,
            attendees: x.attendees || "",
            eventId: x.event_id ? Number(x.event_id) : null,
            meetingId: x.meeting_id ? Number(x.meeting_id) : null
          }));

          finalLocalSchedules = schedulesToSync.map(s => {
            if (s.id && typeof s.id === "number" && s.id < 2000000000) {
              return s;
            }
            const dbMatch = normalizedUpserted.find(x => {
              const matchTitle = x.title === s.title;
              const xDate = x.startAt ? x.startAt.substring(0, 10) : "";
              const sDate = s.startAt ? s.startAt.substring(0, 10) : "";
              return matchTitle && xDate === sDate;
            });
            if (dbMatch) {
              return dbMatch;
            }
            return s;
          });

          fetchedMonthlySchedulesRef.current = JSON.stringify(finalLocalSchedules);
          setMonthlySchedules(finalLocalSchedules);
          safeSetLocalStorage(`anchor_cache_month_y${targetYear}`, JSON.stringify(finalLocalSchedules), targetYear);
        }

        // 5. 사용자가 삭제한 아이템들 DB 반영 (Diff Delete)
        // 💡 중요: 주요 행사(event_id) 또는 회의록(meeting_id)에 연동된 자동 입력 일정은 월간일정 훅이 삭제하지 않고 각 소스 탭의 라이프사이클에 맡겨 격리함.
        const { data: currentDbItems } = await fetchStandaloneMonthlyScheduleIds(targetYear);

        if (currentDbItems) {
          const dbIds = currentDbItems.map(x => x.id);
          const localRealIds = finalLocalSchedules
            .filter(s => !s.eventId && !s.meetingId)
            .map(s => s.id)
            .filter(id => typeof id === "number" && id < 2000000000);

          const idsToDelete = dbIds.filter(id => !localRealIds.includes(id));
          if (idsToDelete.length > 0) {
            const { error: delError } = await deleteMonthlySchedulesByIds(idsToDelete);
            if (delError) throw delError;
          }
        }

        fetchedMonthlySchedulesRef.current = JSON.stringify(finalLocalSchedules);
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync monthly schedules:", e);
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(() => {
      performSync(monthlySchedules, selectedYear);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (latestMonthlySchedulesRef.current) {
        performSync(latestMonthlySchedulesRef.current, selectedYear);
      }
    };
  // oxlint-disable-next-line react/exhaustive-deps -- schedule data, year, and load guards own synchronization; auth restoration must not flush or delete schedules.
  }, [monthlySchedules, selectedYear, isDbLoaded, isFetchCompleted]);

  // 최신 eventSchedules 상태 보존을 위한 Ref (언마운트/탭이동 시 즉시 강제 Flush 동기화 보장)
  const latestEventSchedulesRef = useRef<LegacyAppRecord[] | null>(null);
  useEffect(() => {
    latestEventSchedulesRef.current = eventSchedules;
  }, [eventSchedules]);

  // 주요 행사와 월간 일정을 단방향으로 강제 Reactive 동기화하는 함수
  const syncEventsToMonthly = (latestEvents: LegacyAppRecord[]) => {
    if (!latestEvents) return;
    setMonthlySchedules(prev => {
      let updated = [...prev];

      latestEvents.forEach(evt => {
        if (!evt.id || typeof evt.id !== "number" || evt.id >= 2000000000) return;

        const idx = updated.findIndex(m => m.eventId === evt.id);

        const startPart = evt.datetime ? evt.datetime.split(" ~ ")[0].trim() : "";
        let dateStr = startPart.substring(0, 10);
        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = `${evt.year}-${String(evt.month).padStart(2, "0")}-01`;
        }

        const endPart = evt.datetime && evt.datetime.includes(" ~ ") ? evt.datetime.split(" ~ ")[1].trim() : startPart;
        let endDateStr = endPart.substring(0, 10);
        if (!endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          endDateStr = dateStr;
        }

        const mappedItem = {
          eventId: evt.id,
          year: evt.year,
          title: `[행사] ${evt.title}`,
          type: "행사",
          dept: evt.department || "사업운영팀",
          startAt: dateStr,
          endAt: endDateStr,
          location: evt.location || "",
          isTask: false,
          isDeadline: false,
          completed: false,
          attendees: evt.attendeesInternal || ""
        };

        if (idx !== -1) {
          updated[idx] = { ...updated[idx], ...mappedItem };
        } else {
          updated.push({
            id: `mevt-${Date.now()}-${evt.id}`,
            ...mappedItem
          });
        }
      });

      const eventIds = latestEvents.map(e => e.id).filter(id => typeof id === "number" && id < 2000000000);
      updated = updated.filter(m => {
        if (m.eventId) {
          return eventIds.includes(m.eventId);
        }
        return true;
      });

      return updated;
    });
  };

  // 회의록과 월간 일정을 단방향으로 강제 Reactive 동기화하는 함수
  const syncMeetingsToMonthly = (latestMeetings: LegacyAppRecord[]) => {
    if (!latestMeetings) return;
    setMonthlySchedules(prev => {
      let updated = [...prev];

      latestMeetings.forEach(meet => {
        if (!meet.id || typeof meet.id !== "number" || meet.id >= 2000000000) return;

        const idx = updated.findIndex(m => m.meetingId === meet.id);

        const startPart = meet.datetime ? meet.datetime.split(" ~ ")[0].trim() : "";
        let dateStr = startPart.substring(0, 10);
        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = `${meet.year}-${String(meet.month).padStart(2, "0")}-01`;
        }

        const endPart = meet.datetime && meet.datetime.includes(" ~ ") ? meet.datetime.split(" ~ ")[1].trim() : startPart;
        let endDateStr = endPart.substring(0, 10);
        if (!endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          endDateStr = dateStr;
        }

        const isCommittee = meet.category === "각종 위원회" || meet.category === "committee";
        const prefix = isCommittee ? "[위원회]" : "[회의]";
        const typeVal = isCommittee ? "위원회" : "회의";

        const mappedItem = {
          meetingId: meet.id,
          year: meet.year,
          title: `${prefix} ${meet.title}`,
          type: typeVal,
          dept: isCommittee ? "ECC센터" : "사업운영팀",
          startAt: dateStr,
          endAt: endDateStr,
          location: meet.location || "",
          isTask: false,
          isDeadline: false,
          completed: false,
          attendees: meet.attendeesInternal || ""
        };

        if (idx !== -1) {
          updated[idx] = { ...updated[idx], ...mappedItem };
        } else {
          updated.push({
            id: `mmeet-${Date.now()}-${meet.id}`,
            ...mappedItem
          });
        }
      });

      const meetingIds = latestMeetings.map(e => e.id).filter(id => typeof id === "number" && id < 2000000000);
      updated = updated.filter(m => {
        if (m.meetingId) {
          return meetingIds.includes(m.meetingId);
        }
        return true;
      });

      return updated;
    });
  };

  // 8) Schedule Events 자동 저장 디바운스 훅 (원자적 Upsert + Diff Delete 적용)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    if (!eventSchedules) return;

    // 💡 안전 가드 0: 원격 DB에서 가져온 최초 데이터 또는 직전 동기화 데이터와 로컬 상태가 100% 동일하다면 불필요한 쿼리 전송 및 유실 사고 방지를 위해 즉시 리턴함.
    if (fetchedEventSchedulesRef.current === JSON.stringify(eventSchedules)) return;

    // 💡 안전 가드 1: 필수값(title, datetime)이 비어있다면 동기화 스킵하여 증발 방지
    const hasInvalidItem = eventSchedules.some(s => !s.title?.trim() || !s.datetime);
    if (hasInvalidItem) {
      console.warn("Event schedule sync aborted: detected invalid event item with missing title or datetime.", eventSchedules);
      return;
    }

    safeSetLocalStorage(`anchor_cache_event_y${selectedYear}`, JSON.stringify(eventSchedules), selectedYear);
    setSyncStatus("syncing");

    const performSync = async (schedulesToSync: LegacyAppRecord[], targetYear: number) => {
      try {
        if (!schedulesToSync) return;

        // 1. 모든 일정이 삭제된 상태면 원격 DB 해당 연도 전체 삭제
        if (schedulesToSync.length === 0) {
          const { error } = await deleteScheduleEventsByYear(targetYear);
          if (error) throw error;
          fetchedEventSchedulesRef.current = JSON.stringify([]);
          setSyncStatus("synced");
          syncEventsToMonthly([]);
          return;
        }

        // 2. 신규 생성(id가 없음)과 기존 수정(id가 존재)을 분리하여 Not-Null primary key Violate 방지
        const newItems: ScheduleEventInsert[] = [];
        const updateItems: ScheduleEventInsert[] = [];

        schedulesToSync.forEach((s: LegacyAppRecord) => {
          const item: ScheduleEventInsert = {
            year: getCalculatedYearFromDate(s.datetime ? s.datetime.substring(0, 10) : null, targetYear),
            month: s.month,
            title: s.title,
            department: s.department || "",
            location: s.location || "",
            attendees_internal: s.attendeesInternal || "",
            attendees_external: s.attendeesExternal || "",
            program: s.program || "",
            purpose: s.purpose || "",
            result: s.result || "",
            datetime: s.datetime
          };
          if (s.id && typeof s.id === "number" && s.id < 2000000000) {
            item.id = s.id;
            updateItems.push(item);
          } else {
            newItems.push(item);
          }
        });

        // 3. 분할 전송 수행 및 새로 발행된 sequence id 결과 조회
        const upsertedData: LegacyAppRecord[] = [];

        // [A] 기존 수정 일정 (upsert)
        if (updateItems.length > 0) {
          const { data: upData, error: upError } = await upsertScheduleEvents(updateItems);
          if (upError) throw upError;
          if (upData) upsertedData.push(...upData);
        }

        // [B] 신규 추가 일정 (insert)
        if (newItems.length > 0) {
          const { data: insData, error: insError } = await insertScheduleEvents(newItems);
          if (insError) throw insError;
          if (insData) upsertedData.push(...insData);
        }

        // 4. 로컬 임시 id를 DB sequence id로 매핑 복원하여 중복 인서트 방지 (날짜 substring 10자리 비교 및 camelCase 규격 정형화)
        let finalLocalEvents = schedulesToSync;
        if (upsertedData && upsertedData.length > 0) {
          const normalizedUpserted: LegacyAppRecord[] = upsertedData.map((x: LegacyAppRecord) => ({
            id: Number(x.id),
            year: Number(x.year),
            month: Number(x.month),
            title: x.title,
            department: x.department || "",
            location: x.location || "",
            attendeesInternal: x.attendees_internal || "",
            attendeesExternal: x.attendees_external || "",
            program: x.program || "",
            purpose: x.purpose || "",
            result: x.result || "",
            datetime: x.datetime
          }));

          finalLocalEvents = schedulesToSync.map(s => {
            if (s.id && typeof s.id === "number" && s.id < 2000000000) {
              return s;
            }
            const dbMatch = normalizedUpserted.find((x: LegacyAppRecord) => {
              const matchTitle = x.title === s.title;
              const xDate = x.datetime ? x.datetime.substring(0, 10) : "";
              const sDate = s.datetime ? s.datetime.substring(0, 10) : "";
              return matchTitle && xDate === sDate;
            });
            if (dbMatch) {
              return dbMatch;
            }
            return s;
          });

          fetchedEventSchedulesRef.current = JSON.stringify(finalLocalEvents);
          setEventSchedules(finalLocalEvents);
          safeSetLocalStorage(`anchor_cache_event_y${targetYear}`, JSON.stringify(finalLocalEvents), targetYear);
        }

        // 5. 사용자가 삭제한 아이템들 DB 반영 (Diff Delete)
        const { data: currentDbItems } = await fetchScheduleEventIds(targetYear);

        if (currentDbItems) {
          const dbIds = currentDbItems.map(x => x.id);
          const localRealIds = finalLocalEvents
            .map(s => s.id)
            .filter(id => typeof id === "number" && id < 2000000000);

          const idsToDelete = dbIds.filter(id => !localRealIds.includes(id));
          if (idsToDelete.length > 0) {
            const { error: delError } = await deleteScheduleEventsByIds(idsToDelete);
            if (delError) throw delError;
          }
        }

        fetchedEventSchedulesRef.current = JSON.stringify(finalLocalEvents);
        setSyncStatus("synced");
        syncEventsToMonthly(finalLocalEvents);
      } catch (e) {
        console.error("Failed to sync event schedules:", e);
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(() => {
      performSync(eventSchedules, selectedYear);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (latestEventSchedulesRef.current) {
        performSync(latestEventSchedulesRef.current, selectedYear);
      }
    };
  // oxlint-disable-next-line react/exhaustive-deps -- event data, year, and load guards own synchronization; auth restoration must not flush or delete events.
  }, [eventSchedules, selectedYear, isDbLoaded, isFetchCompleted]);

  // 최신 meetingSchedules 상태 보존을 위한 Ref (언마운트/탭이동 시 즉시 강제 Flush 동기화 보장)
  const latestMeetingSchedulesRef = useRef<LegacyAppRecord[] | null>(null);
  useEffect(() => {
    latestMeetingSchedulesRef.current = meetingSchedules;
  }, [meetingSchedules]);

  // 9) Schedule Meetings 자동 저장 디바운스 훅 (원자적 Upsert + Diff Delete 적용 및 월간일정 연동)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    if (!meetingSchedules) return;

    // 💡 안전 가드 0: 원격 DB에서 가져온 최초 데이터 또는 직전 동기화 데이터와 로컬 상태가 100% 동일하다면 불필요한 쿼리 전송 및 유실 사고 방지를 위해 즉시 리턴함.
    if (fetchedMeetingSchedulesRef.current === JSON.stringify(meetingSchedules)) return;

    // 💡 안전 가드 1: 필수값(title, datetime)이 비어있다면 동기화 스킵하여 증발 방지
    const hasInvalidItem = meetingSchedules.some(s => !s.title?.trim() || !s.datetime);
    if (hasInvalidItem) {
      console.warn("Meeting schedule sync aborted: detected invalid meeting item with missing title or datetime.", meetingSchedules);
      return;
    }

    safeSetLocalStorage(`anchor_cache_meet_y${selectedYear}`, JSON.stringify(meetingSchedules), selectedYear);
    setSyncStatus("syncing");

    const performSync = async (schedulesToSync: LegacyAppRecord[], targetYear: number) => {
      try {
        if (!schedulesToSync) return;

        // 1. 모든 일정이 삭제된 상태면 원격 DB 해당 연도 전체 삭제
        if (schedulesToSync.length === 0) {
          const { error } = await deleteScheduleMeetingsByYear(targetYear);
          if (error) throw error;
          fetchedMeetingSchedulesRef.current = JSON.stringify([]);
          setSyncStatus("synced");
          syncMeetingsToMonthly([]);
          return;
        }

        // 2. 20억 이하의 실제 DB id만 전송에 포함하고 로컬 임시 id는 제외하여 시퀀스 범위초과 에러 방지
        // 2. 신규 생성(id가 없음)과 기존 수정(id가 존재)을 분리하여 Not-Null primary key Violate 방지
        const newItems: ScheduleMeetingInsert[] = [];
        const updateItems: ScheduleMeetingInsert[] = [];

        schedulesToSync.forEach((s: LegacyAppRecord) => {
          const item: ScheduleMeetingInsert = {
            year: getCalculatedYearFromDate(s.datetime ? s.datetime.substring(0, 10) : null, targetYear),
            month: s.month,
            category: s.category,
            title: s.title,
            location: s.location || "",
            attendees_internal: s.attendeesInternal || "",
            attendees_external: s.attendeesExternal || "",
            agenda: s.agenda || "",
            result: s.result || "",
            datetime: s.datetime,
            audio_url: s.audioUrl || "",
            pdf_url: s.pdfUrl || ""
          };
          if (s.id && typeof s.id === "number" && s.id < 2000000000) {
            item.id = s.id;
            updateItems.push(item);
          } else {
            newItems.push(item);
          }
        });

        // 3. 분할 전송 수행 및 새로 발행된 sequence id 결과 조회
        const upsertedData: LegacyAppRecord[] = [];

        // [A] 기존 수정 일정 (upsert)
        if (updateItems.length > 0) {
          const { data: upData, error: upError } = await upsertScheduleMeetings(updateItems);
          if (upError) throw upError;
          if (upData) upsertedData.push(...upData);
        }

        // [B] 신규 추가 일정 (insert)
        if (newItems.length > 0) {
          const { data: insData, error: insError } = await insertScheduleMeetings(newItems);
          if (insError) throw insError;
          if (insData) upsertedData.push(...insData);
        }

        // 4. 로컬 임시 id를 DB sequence id로 매핑 복원하여 중복 인서트 방지 (날짜 substring 10자리 비교 및 camelCase 규격 정형화)
        let finalLocalMeetings = schedulesToSync;
        if (upsertedData && upsertedData.length > 0) {
          const normalizedUpserted: LegacyAppRecord[] = upsertedData.map((x: LegacyAppRecord) => ({
            ...x,
            id: Number(x.id),
            year: Number(x.year),
            month: Number(x.month),
            attendeesInternal: x.attendees_internal || "",
            attendeesExternal: x.attendees_external || "",
            audioUrl: x.audio_url || "",
            pdfUrl: x.pdf_url || ""
          }));

          finalLocalMeetings = schedulesToSync.map(s => {
            if (s.id && typeof s.id === "number" && s.id < 2000000000) {
              return s;
            }
            const dbMatch = normalizedUpserted.find((x: LegacyAppRecord) => {
              const matchTitle = x.title === s.title;
              const xDate = x.datetime ? x.datetime.substring(0, 10) : "";
              const sDate = s.datetime ? s.datetime.substring(0, 10) : "";
              return matchTitle && xDate === sDate;
            });
            if (dbMatch) {
              return dbMatch;
            }
            return s;
          });

          fetchedMeetingSchedulesRef.current = JSON.stringify(finalLocalMeetings);
          setMeetingSchedules(finalLocalMeetings);
          safeSetLocalStorage(`anchor_cache_meet_y${targetYear}`, JSON.stringify(finalLocalMeetings), targetYear);
        }

        // 5. 사용자가 삭제한 아이템들 DB 반영 (Diff Delete)
        const { data: currentDbItems } = await fetchScheduleMeetingIds(targetYear);

        if (currentDbItems) {
          const dbIds = currentDbItems.map(x => x.id);
          const localRealIds = finalLocalMeetings
            .map(s => s.id)
            .filter(id => typeof id === "number" && id < 2000000000);

          const idsToDelete = dbIds.filter(id => !localRealIds.includes(id));
          if (idsToDelete.length > 0) {
            const { error: delError } = await deleteScheduleMeetingsByIds(idsToDelete);
            if (delError) throw delError;
          }
        }

        fetchedMeetingSchedulesRef.current = JSON.stringify(finalLocalMeetings);
        setSyncStatus("synced");
        syncMeetingsToMonthly(finalLocalMeetings);
      } catch (e) {
        console.error("Failed to sync meeting schedules:", e);
        setSyncStatus("error");
      }
    };

    const timer = setTimeout(() => {
      performSync(meetingSchedules, selectedYear);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (latestMeetingSchedulesRef.current) {
        performSync(latestMeetingSchedulesRef.current, selectedYear);
      }
    };
  // oxlint-disable-next-line react/exhaustive-deps -- meeting data, year, and load guards own synchronization; auth restoration must not flush or delete meetings.
  }, [meetingSchedules, selectedYear, isDbLoaded, isFetchCompleted]);


  // 1차년도용 단위과제 필터링 및 이름/ID 변환
  const getNormalizedProjectsForRendering = (
    rawProjects: LegacyAppRecord[],
    yr: number
  ): LegacyAppRecord[] => {
    if (!rawProjects) return [];

    const cloned = JSON.parse(JSON.stringify(rawProjects)) as LegacyAppRecord[];

    // 💡 [실시간 엑셀 업로드 집행 기록 전역 동적 합산 가드]
    // '예산 관리 > 집행률 관리'에서 업로드하여 localStorage에 저장된 실제 집행 로우 데이터를
    // 대시보드 전체에 누적 합산하여 실시간 환산 반영합니다.
    const BUDGET_ITEM_NAMES = [
      "인건비",
      "장학금",
      "교육∙연구 프로그램 개발∙운영비",
      "교육∙연구 환경개선비",
      "실험∙실습장비 및 기자재 구입∙운영비",
      "지역 연계∙협업 지원비",
      "기업 지원∙협력 활동비",
      "성과 활용∙확산 지원비",
      "그 밖의 사업운영경비",
      "간접비"
    ];

    const cachedExecs: LegacyAppRecord[] = (() => {
      try {
        const data = localStorage.getItem(`budget_exec_records_${yr}`);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error("대시보드 실시간 집행 연동 오류:", e);
        return [];
      }
    })();

    const matchedRecordsForUnit = (unitId: string, records: LegacyAppRecord[]) => {
      return records.filter((r: LegacyAppRecord) => {
        if (unitId === "X0") {
          return (r.program_id || "").startsWith("X0");
        }
        return (r.program_id || "").startsWith(unitId);
      });
    };

    // 복사본 cloned 전체를 돌며 엑셀 집행 데이터를 각 단위과제에 실시간 환산 누적 적용
    cloned.forEach((p: LegacyAppRecord) => {
      p.units.forEach((u: LegacyAppRecord) => {
        // years가 없는 유닛(예: 공통 X0)에 대해 동적으로 년차별 매핑 생성
        if (!u.years) {
          u.years = {
            1: {
              budget_main: u.budget_2025 || 0,
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0
            },
            2: {
              budget_main: u.budget_2026 || 0,
              spent_main: 0,
              budget_carry: u.budget_2025_carry || 0,
              spent_carry: 0
            }
          };
        }

        // 해당 년차의 기존 mock spent 값을 0으로 리셋하여 엑셀 업로드 기반으로 환산
        if (u.years[yr]) {
          u.years[yr].spent_main = 0;
          u.years[yr].spent_carry = 0;
        }

        // budgetDetails 구조가 없으면 생성
        if (!u.budgetDetails) {
          u.budgetDetails = {};
          BUDGET_ITEM_NAMES.forEach(bName => {
            u.budgetDetails[bName] = {
              years: {
                [yr]: {
                  budget_main: 0,
                  spent_main: 0,
                  budget_carry: 0,
                  spent_carry: 0
                }
              }
            };
          });
        }

        // budgetDetails 내의 각 비목별 spent_main / spent_carry도 0으로 리셋
        Object.keys(u.budgetDetails).forEach(bName => {
          const bItem = u.budgetDetails[bName];
          if (bItem) {
            if (!bItem.years) {
              bItem.years = {
                1: { budget_main: bItem.budget_2025 || 0, spent_main: 0, budget_carry: 0, spent_carry: 0 },
                2: { budget_main: bItem.budget_2026 || 0, spent_main: 0, budget_carry: bItem.budget_2025_carry || 0, spent_carry: 0 }
              };
            }
            if (bItem.years[yr]) {
              bItem.years[yr].spent_main = 0;
              bItem.years[yr].spent_carry = 0;
            }
          }
        });

        // 해당 단위과제에 매칭되는 집행 로우 필터링
        const matchedRecords = matchedRecordsForUnit(u.id, cachedExecs);

        // 필터링된 집행건들을 비목별 및 예산유형별로 합산
        matchedRecords.forEach((r: LegacyAppRecord) => {
          const bName = BUDGET_ITEM_NAMES.find(name => {
            const norm1 = (name || "").replace(/\s/g, "").replace(/[·∙•ㆍ]/g, "");
            const norm2 = (r.expense_category || "").replace(/\s/g, "").replace(/[·∙•ㆍ]/g, "");
            return norm1 === norm2;
          }) || r.expense_category;
          if (bName) {
            if (!u.budgetDetails[bName]) {
              u.budgetDetails[bName] = {
                years: {
                  [yr]: {
                    budget_main: 0,
                    spent_main: 0,
                    budget_carry: 0,
                    spent_carry: 0
                  }
                }
              };
            }
            if (!u.budgetDetails[bName].years[yr]) {
              u.budgetDetails[bName].years[yr] = {
                budget_main: 0,
                spent_main: 0,
                budget_carry: 0,
                spent_carry: 0
              };
            }

            const amountVal = Number(r.amount) || 0;
            if (r.budget_type === "carryover") {
              u.budgetDetails[bName].years[yr].spent_carry += amountVal;
              if (u.years[yr]) u.years[yr].spent_carry += amountVal;
            } else {
              u.budgetDetails[bName].years[yr].spent_main += amountVal;
              if (u.years[yr]) u.years[yr].spent_main += amountVal;
            }
          }
        });
      });
    });

    if (yr !== 1) {
      // 2~5차년도에는 해당 연도의 프로그램만 필터링 및 X0 등 년도 매핑이 누락된 유닛 정규화
      return cloned.map((p: LegacyAppRecord) => {
        const newUnits = p.units.map((u: LegacyAppRecord) => {
          // years가 없는 유닛(예: 공통 X0)에 대해 동적으로 년차별 매핑 생성
          if (!u.years) {
            u.years = {
              1: {
                budget_main: u.budget_2025 || 0,
                spent_main: u.spent_2025 || 0,
                budget_carry: 0,
                spent_carry: 0
              },
              2: {
                budget_main: u.budget_2026 || 0,
                spent_main: u.spent_2026 || 0,
                budget_carry: u.budget_2025_carry || 0,
                spent_carry: u.spent_2025_carry || 0
              }
            };
          }

          // budgetDetails 내부 년도 매핑 정규화
          if (u.budgetDetails) {
            Object.keys(u.budgetDetails).forEach(bName => {
              const bItem = u.budgetDetails[bName];
              if (bItem && !bItem.years) {
                bItem.years = {
                  1: {
                    budget_main: bItem.budget_2025 || 0,
                    spent_main: bItem.spent_2025 || 0,
                    budget_carry: 0,
                    spent_carry: 0
                  },
                  2: {
                    budget_main: bItem.budget_2026 || 0,
                    spent_main: bItem.spent_2026 || 0,
                    budget_carry: bItem.budget_2025_carry || 0,
                    spent_carry: bItem.spent_2025_carry || 0
                  }
                };
              }
            });
          }

          // 프로그램 목록 필터링 및 정규화
          const filteredPrograms = u.programs ? u.programs.map((prog: LegacyAppRecord) => {
            if (!prog.years) {
              prog.years = {
                1: (prog.budget_2025 || 0) > 0,
                2: (prog.budget_2026 || 0) > 0 || (prog.budget_2025_carry || 0) > 0
              };
            }
            return prog;
          }).filter((prog: LegacyAppRecord) => prog.years && prog.years[yr]) : [];

          return {
            ...u,
            programs: filteredPrograms
          };
        });
        return { ...p, units: newUnits };
      });
    }

    // 1차년도에 A1나 및 공통 E는 필터링 제외
    const mapping: Record<string, { id: string; title: string }> = {
      "A1가": { id: "A1", title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성" },
      "A2": { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" },
      "A3": { id: "D4", title: "지역산업 연계 글로벌 협력 거점 대학 육성" },
      "B1": { id: "B1", title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화" },
      "B2": { id: "C2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      "B3": { id: "C3", title: "교육·산업·복지가 조화로운 지속가능한 탄소중립" },
      "B4": { id: "C1", title: "복합재난 대응 산업안전·보건 관리시스템 개발" },
      "C1": { id: "B2", title: "U-LIFE 평생직업교육 플랫폼 구축" },
      "C2": { id: "D2", title: "내일을 밝히는 '위드아이' 늘봄 생태계 조성" },
      "D1": { id: "B3", title: "지역을 키우는 지역문제 해결 협력 체계 구축" },
      "D2": { id: "D1", title: "통합형 인재양성 기반 포용적 보건복지서비스 구현" },
      "D3": { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" }
    };

    return cloned.map((p: LegacyAppRecord) => {
      if (p.id === "E") return null;

      const newUnits = p.units
        .filter((u: LegacyAppRecord) => u.id !== "A1나")
        .map((u: LegacyAppRecord) => {
          const mapInfo = mapping[u.id];
          const filteredPrograms = u.programs.filter((prog: LegacyAppRecord) => prog.years && prog.years[1]);
          if (mapInfo) {
            return {
              ...u,
              id: mapInfo.id,
              title: mapInfo.title,
              programs: filteredPrograms
            };
          }
          return {
            ...u,
            programs: filteredPrograms
          };
        });

      return {
        ...p,
        units: newUnits
      };
    }).filter(Boolean) as LegacyAppRecord[];
  };

  const displayProjects = getNormalizedProjectsForRendering(projects, selectedYear);



  // 숨겨진 성과지표 subTab을 노출 가능한 첫 탭으로 보정합니다.
  useVisibleKpiSubTabGuard({
    activeTab,
    menuVisibility,
    kpiSubTab,
    displayProjects,
    isPrivilegedUser: isSongDirector,
    setKpiSubTab,
    setSelectedKpi
  });


  // 새로고침 시 스크롤 위치를 복원하고 탭 전환 시 최상단으로 이동합니다.
  useDashboardScroll({
    activeTab,
    projectsSubTab,
    mgmtSubTab,
    kpiSubTab,
    selectedProgId,
    committeeSubTab,
    setIsScrollRestored
  });

  // Supabase Auth 세션을 기준으로 rise_users 업무 프로필을 복원합니다.
  useApprovedAuthSession({ setCurrentUser });

  // 다크모드 바인딩 및 비활성 메뉴 접근 가드
  useDashboardUiLifecycle({
    darkMode,
    activeTab,
    menuVisibility,
    isPrivilegedUser: isSongDirector,
    setActiveTab
  });

  // projects 상태 변경 시 localStorage 자동 기입 (새로고침 휘발 방지 우회책)
  useProjectLocalBackup(projects);

  // 성과지표 탭 진입 또는 서브탭 전환 시 첫 지표를 자동 선택합니다.
  useKpiSelection({
    activeTab,
    kpiSubTab,
    projects,
    setSelectedKpi
  });

  const handleLoginSuccess = async (user: LegacyAppRecord) => {
    setCurrentUser(user);
    setActiveTab("dashboard");
    localStorage.setItem("anchor_active_tab", "dashboard");
    localStorage.setItem("anchor_logged_in_user", JSON.stringify(user));
  };

  const handleLogout = async () => {
    console.log(">>> [보안 캐시 완전 소멸 로그아웃 수행] 로컬 스토리지를 비우고 타임스탬프 핫 부트 리로드합니다. <<<");
    await supabase.auth.signOut({ scope: "local" });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin + window.location.pathname + "?cb=" + Date.now();
  };

  // 엑셀 업로드로 데이터 실시간 갱신 (본사업비/이월비 구분 갱신 및 다년도 연쇄 이월 반영)
  const _handleUpdateData = (excelJson: LegacyAppRecord[], type: string) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];

      if (type === "BUDGET") {
        // 프로그램ID별로 행들을 그룹화
        const progRows: Record<string, LegacyAppRecord[]> = {};
        excelJson.forEach((row: LegacyAppRecord) => {
          const pid = row["프로그램ID"];
          if (pid) {
            if (!progRows[pid]) progRows[pid] = [];
            progRows[pid].push(row);
          }
        });

        // 각 프로그램ID별로 본예산 행과 이월예산 행을 조합하여 롤업 업데이트 실행
        Object.keys(progRows).forEach((progId: string) => {
          const rows = progRows[progId];
          const mainRow = rows.find((r: LegacyAppRecord) => r["예산구분"] === "본예산") || {};
          const carryRow = rows.find((r: LegacyAppRecord) => r["예산구분"] === "이월예산") || {};

          updated.forEach((p: LegacyAppRecord) => {
            p.units.forEach((u: LegacyAppRecord) => {
              u.programs.forEach((prog: LegacyAppRecord) => {
                if (prog.id === progId) {
                  const py = prog.years?.[selectedYear];
                  if (py) {
                    // 1. 재원별 본예산 및 이월예산 원화 단위(* 1,000,000)로 파싱하여 대입
                    const bNational = Math.round((parseFloat(mainRow["국고"]) || 0) * 1000000);
                    const bCity = Math.round((parseFloat(mainRow["지자체시비"]) || 0) * 1000000);
                    const bExternal = Math.round((parseFloat(mainRow["외부사업비"]) || 0) * 1000000);

                    const bCarryNational = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["국고"]) || 0) * 1000000);
                    const bCarryCity = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["지자체시비"]) || 0) * 1000000);
                    const bCarryExternal = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["외부사업비"]) || 0) * 1000000);

                    py.budget_national = bNational;
                    py.budget_city = bCity;
                    py.budget_external = bExternal;
                    py.budget_main = bNational + bCity; // 본예산 입력 우선 합산 (외부사업비 제외)

                    py.budget_carry_national = bCarryNational;
                    py.budget_carry_city = bCarryCity;
                    py.budget_carry_external = bCarryExternal;
                    py.budget_carry = bCarryNational + bCarryCity; // 이월예산 입력 우선 합산 (외부사업비 제외)

                    // 2. 10대 비목별 요소 파싱 및 0원 초과 비목 필터링 롤업 (최대 4개 제한)
                    const standardCategories = [
                      { label: "인건비", dbCategory: "인건비" },
                      { label: "장학금", dbCategory: "장학금" },
                      { label: "프로그램개발운영비", dbCategory: "교육∙연구 프로그램 개발∙운영비" },
                      { label: "환경개선비", dbCategory: "교육∙연구 환경개선비" },
                      { label: "실험실습장비비", dbCategory: "실험∙실습장비 및 기자재 구입∙운영비" },
                      { label: "지역연계협업비", dbCategory: "지역 연계∙협업 지원비" },
                      { label: "기업지원협력비", dbCategory: "기업 지원∙협력 활동비" },
                      { label: "성과활용확산비", dbCategory: "성과 활용∙확산 지원비" },
                      { label: "기타사업운영경비", dbCategory: "그 밖의 사업운영경비" },
                      { label: "간접비", dbCategory: "간접비" }
                    ];

                    const cats: LegacyAppRecord[] = [];
                    standardCategories.forEach((cat: LegacyAppRecord) => {
                      const budgetVal = parseFloat(mainRow[cat.label]) || 0;
                      const carryVal = parseFloat(carryRow[cat.label]) || 0;

                      if (budgetVal > 0 || carryVal > 0) {
                        // 기존에 이미 등록되어 있던 비목이면 spent/spent_carry 집행액 정보를 보존
                        const existing = (py.budget_categories || []).find((c: LegacyAppRecord) => c.category === cat.dbCategory) || {};
                        cats.push({
                          category: cat.dbCategory,
                          budget: Math.round(budgetVal * 1000000),
                          budget_carry: Math.round(carryVal * 1000000),
                          spent: existing.spent || 0,
                          spent_carry: existing.spent_carry || 0
                        });
                      }
                    });

                    // UI 기획 슬롯 제약에 맞춰 금액이 0보다 큰 비목 중 선입된 최대 4개까지만 배정
                    py.budget_categories = cats.slice(0, 4);

                    // 3. 프로그램 최상위 레거시 예산/집행 필드도 현재 5개년 연도 정보 기준으로 롤업 일치화
                    if (selectedYear === 2) {
                      prog.budget_2026 = py.budget_main;
                      prog.budget_2025_carry = py.budget_carry;
                      prog.budget = prog.budget_2026 + prog.budget_2025_carry;
                    } else if (selectedYear === 1) {
                      prog.budget_2025_carry = 0;
                      prog.budget = py.budget_main;
                    } else {
                      prog.budget = py.budget_main + py.budget_carry;
                    }

                    // 프로그램의 5개년 이월 예산 및 집행액 재계산 연쇄 작동
                    recalculateCarryOver(prog.years);
                  }
                }
              });

              // 해당 단위과제에 소속된 세부 프로그램들의 비목별 배정계획을 10대 표준비목으로 쪼개서 실시간 롤업 동기화
              const categorySums: Record<string, LegacyAppRecord> = {
                "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
              };

              u.programs.forEach((prog: LegacyAppRecord) => {
                const py = prog.years?.[selectedYear] || {};
                const progTotalMain = py.budget_main || 0;
                const progTotalCarry = py.budget_carry || 0;
                const progTotalSpent = py.spent_main || 0;
                const progTotalSpentCarry = py.spent_carry || 0;

                let allocatedMain = 0;
                let allocatedCarry = 0;
                let allocatedSpent = 0;
                let allocatedSpentCarry = 0;

                if (py.budget_categories && Array.isArray(py.budget_categories)) {
                  py.budget_categories.forEach((catItem: LegacyAppRecord) => {
                    const catName = catItem.category;
                    if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                      const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                      const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                      const spentVal = Math.round(catItem.spent || 0);
                      const spentCarryVal = Math.round(catItem.spent_carry || 0);

                      categorySums[catName].main += mainVal;
                      categorySums[catName].carry += carryVal;
                      categorySums[catName].spent_main += spentVal;
                      categorySums[catName].spent_carry += spentCarryVal;

                      allocatedMain += mainVal;
                      allocatedCarry += carryVal;
                      allocatedSpent += spentVal;
                      allocatedSpentCarry += spentCarryVal;
                    }
                  });
                }

                const remainMain = Math.max(0, progTotalMain - allocatedMain);
                const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
                categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
                categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
                categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
              });

              Object.keys(categorySums).forEach((catName: string) => {
                if (!u.budgetDetails[catName]) {
                  u.budgetDetails[catName] = { years: {} };
                }
                if (!u.budgetDetails[catName].years[selectedYear]) {
                  u.budgetDetails[catName].years[selectedYear] = {
                    budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                  };
                }
                const tgt = u.budgetDetails[catName].years[selectedYear];
                tgt.budget_main = categorySums[catName].main;
                tgt.budget_carry = categorySums[catName].carry;
                tgt.spent_main = categorySums[catName].spent_main;
                tgt.spent_carry = categorySums[catName].spent_carry;
              });

              // 비목별 이월 재계산
              Object.keys(u.budgetDetails).forEach((key: string) => {
                recalculateCarryOver(u.budgetDetails[key].years);
              });

              if (u.years[selectedYear]) {
                const budgetDetailValues = Object.values(u.budgetDetails as Record<string, LegacyAppRecord>);
                u.years[selectedYear].budget_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years[selectedYear]?.budget_main || 0), 0);
                u.years[selectedYear].budget_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years[selectedYear]?.budget_carry || 0), 0);
                u.years[selectedYear].spent_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years[selectedYear]?.spent_main || 0), 0);
                u.years[selectedYear].spent_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years[selectedYear]?.spent_carry || 0), 0);
              }

              // 단위과제 이월 재계산
              recalculateCarryOver(u.years);
            });
          });
        });
      } else if (type === "KPI") {
        excelJson.forEach((row: LegacyAppRecord) => {
          const subId = row["세부항목ID"];
          const currentVal = parseFloat(row["실적값(현재값)"]);

          if (subId && !isNaN(currentVal)) {
            updated.forEach((p: LegacyAppRecord) => {
              p.units.forEach((u: LegacyAppRecord) => {
                u.kpis.forEach((kpi: LegacyAppRecord) => {
                  let subItemFound = false;
                  kpi.subItems.forEach((sub: LegacyAppRecord) => {
                    if (sub.id === subId) {
                      if (!sub.years) sub.years = {};
                      if (!sub.years[selectedYear]) sub.years[selectedYear] = { target: 0, current: 0 };
                      sub.years[selectedYear].current = currentVal;
                      subItemFound = true;
                    }
                  });
                  if (subItemFound) {
                    const totalAchievement = kpi.subItems.reduce((sum: number, s: LegacyAppRecord) => {
                      const yData = s.years?.[selectedYear] || { target: 0, current: 0 };
                      const achievementRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                      return sum + achievementRate;
                    }, 0);
                    const avgAchievement = totalAchievement / kpi.subItems.length;
                    kpi.current = avgAchievement;
                    kpi.target = 100.0;
                  }
                });
              });
            });
          }
        });
      }

      return updated;
    });
  };

  // 결재 변경 승인요청 DB 조회 및 갱신 API 연동
  const fetchVersionRequests = async () => {
    try {
      const { data, error: _error } = await fetchVersionRequestRecords();
      if (data) setVersionRequests(data as ProgramVersionRequest[]);
    } catch (e) {
      console.error("Failed to fetch version requests:", e);
    }
  };

  // 💡 [교육용 한글 주석] 시설 사용 예약 데이터 로드 함수를 신설합니다.
  const fetchReservations = async () => {
    try {
      if (!supabase) return;
      const { data, error: _error } = await fetchAssetReservations();
      if (data) setReservations(data);
    } catch (e) {
      console.error("Failed to fetch reservations:", e);
    }
  };

  useApprovalDataRefresh(
    activeTab,
    mgmtSubTab,
    fetchVersionRequests,
    fetchReservations
  );

  // 💡 [교육용 한글 주석] 통합 승인처리 화면에서 시설 사용 승인 요청을 확정하는 함수입니다.
  const handleApproveReservation = async (res: AssetReservation) => {
    const isTimeOverlapping = (newStart: string, newEnd: string, existStart: string, existEnd: string) => {
      const parseTimeToMinutes = (t: string) => {
        const parts = t.split(":");
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
      };
      const ns = parseTimeToMinutes(newStart);
      const ne = parseTimeToMinutes(newEnd);
      const es = parseTimeToMinutes(existStart);
      const ee = parseTimeToMinutes(existEnd);
      return ns < ee && ne > es;
    };

    // 중복 시간 겹침 엄격 검증
    const duplicate = reservations.find((r: AssetReservation) => {
      return (
        r.id !== res.id &&
        r.status === "승인완료" &&
        r.space_name === res.space_name &&
        r.reserved_date === res.reserved_date &&
        isTimeOverlapping(res.start_time, res.end_time, r.start_time, r.end_time)
      );
    });

    if (duplicate) {
      alert(
        `⚠️ 승인 불가: 해당 시간대에 이미 승인완료된 다른 예약이 선점되어 있습니다.\n(승인 확정된 예약: ${duplicate.dept} - ${duplicate.reserver_name} / ${duplicate.start_time.substring(0, 5)}~${duplicate.end_time.substring(0, 5)})`
      );
      return;
    }

    try {
      const { error } = await updateAssetReservation(res.id, { status: "승인완료" });

      if (error) throw error;
      alert("✨ 해당 공간 사용 예약이 최종 승인 처리되었습니다.");
      fetchReservations();
    } catch (err) {
      alert("예약 승인 도중 데이터베이스 오류가 발생했습니다: " + getErrorMessage(err));
    }
  };

  // 💡 [교육용 한글 주석] 시설 사용 예약을 반려(삭제)하는 함수입니다.
  const handleRejectReservation = async (res: AssetReservation) => {
    if (!window.confirm("정말 이 예약을 반려(삭제) 처리하시겠습니까?")) {
      return;
    }
    try {
      const { error } = await deleteAssetReservation(res.id);

      if (error) throw error;
      alert("🗑️ 예약이 성공적으로 반려 및 삭제 처리되었습니다.");
      fetchReservations();
    } catch (err) {
      alert("예약 반려 도중 데이터베이스 오류가 발생했습니다: " + getErrorMessage(err));
    }
  };

  // 💡 [교육용 한글 주석] 승인자 전용의 예약 일시 수정/조정 모달을 기동하는 함수입니다.
  const handleOpenEditTime = (res: AssetReservation) => {
    setEditingRes(res);
    setEditResFormData({
      reserved_date: res.reserved_date,
      start_time: res.start_time.substring(0, 5),
      end_time: res.end_time.substring(0, 5)
    });
    setIsEditTimeModalOpen(true);
  };

  // 💡 [교육용 한글 주석] 승인자가 조정한 예약을 충돌검증 후 DB에 영구 저장하는 함수입니다.
  const handleSaveEditedTime = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!editingRes) return;

    const isTimeOverlapping = (newStart: string, newEnd: string, existStart: string, existEnd: string) => {
      const parseTimeToMinutes = (t: string) => {
        const parts = t.split(":");
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
      };
      const ns = parseTimeToMinutes(newStart);
      const ne = parseTimeToMinutes(newEnd);
      const es = parseTimeToMinutes(existStart);
      const ee = parseTimeToMinutes(existEnd);
      return ns < ee && ne > es;
    };

    if (editResFormData.start_time >= editResFormData.end_time) {
      alert("⚠️ 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    // 중복 시간 겹침 엄격 검증
    const duplicate = reservations.find((r: AssetReservation) => {
      return (
        r.id !== editingRes.id &&
        r.status === "승인완료" &&
        r.space_name === editingRes.space_name &&
        r.reserved_date === editResFormData.reserved_date &&
        isTimeOverlapping(editResFormData.start_time, editResFormData.end_time, r.start_time, r.end_time)
      );
    });

    if (duplicate) {
      alert(
        `⚠️ 변경 불가: 수정하려는 시간대에 이미 승인완료된 다른 예약이 선점되어 있습니다.\n(승인 확정된 예약: ${duplicate.dept} - ${duplicate.reserver_name} / ${duplicate.start_time.substring(0, 5)}~${duplicate.end_time.substring(0, 5)})`
      );
      return;
    }

    try {
      const { error } = await updateAssetReservation(editingRes.id, {
        reserved_date: editResFormData.reserved_date,
        start_time: editResFormData.start_time,
        end_time: editResFormData.end_time
      });

      if (error) throw error;
      alert("✨ 예약 일시가 성공적으로 조정되었습니다.");
      setIsEditTimeModalOpen(false);
      setEditingRes(null);
      fetchReservations();
    } catch (err) {
      alert("일시 조정 실패: " + getErrorMessage(err));
    }
  };

  const handleApproveRequest = async (req: ProgramVersionRequest) => {
    try {
      const approverName = currentUser ? currentUser.name : "승인자";
      const { error: updateErr } = await updateVersionRequestStatus(
        req.id,
        "승인완료",
        approverName
      );

      if (updateErr) throw updateErr;

      // 실제 project_data에 적용 (changes.after 병합)
      const afterFields = req.changes.after;
      const targetUnitId = getRealUnitId(req.unit_id, selectedYear);

      setProjects((prevProjects) => {
        const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
        let dataUpdated = false;

        updated.forEach((p: LegacyAppRecord) => {
          // p.year 매칭 확인
          const pYearVal = p.year === 2024 + selectedYear || p.year === selectedYear;
          if (pYearVal) {
            p.units.forEach((u: LegacyAppRecord) => {
              if (u.id === targetUnitId) {
                u.programs.forEach((prog: LegacyAppRecord) => {
                  if (String(prog.id) === String(req.program_id)) {
                    // 예산, 기획, 추진실적, 환류방안, KPI 등 changes.after의 정보를 전체 병합
                    Object.keys(afterFields).forEach((key) => {
                      if (key === "years" && afterFields.years) {
                        if (!prog.years) prog.years = {};
                        if (afterFields.years[selectedYear]) {
                          prog.years[selectedYear] = {
                            ...prog.years[selectedYear],
                            ...afterFields.years[selectedYear]
                          };
                        }
                      } else if (key === "pdca" && afterFields.pdca) {
                        prog.pdca = { ...prog.pdca, ...afterFields.pdca };
                      } else {
                        prog[key] = afterFields[key];
                      }
                    });
                    dataUpdated = true;
                  }
                });
              }
            });

            // Supabase 반영
            if (dataUpdated) {
              updateProjectData(2024 + selectedYear, p.data || p)
                .then(({ error }) => {
                  if (error) console.error("Failed to sync project data after approval:", error);
                });
            }
          }
        });

        return updated;
      });

      alert("🎉 변경 사항 승인 완료! 프로그램 상세 기획 및 예산에 즉각 반영되었습니다.");
      setSelectedRequest(null);
      fetchVersionRequests();
    } catch (e) {
      console.error("Approve request error:", e);
      alert("승인 처리 도중 데이터베이스 오류가 발생했습니다.");
    }
  };

  const handleRejectRequest = async (req: ProgramVersionRequest) => {
    try {
      const approverName = currentUser ? currentUser.name : "승인자";
      const { error } = await updateVersionRequestStatus(req.id, "반려", approverName);

      if (error) throw error;

      alert("🚨 변경 신청 반려 처리가 완료되었습니다.");
      setSelectedRequest(null);
      fetchVersionRequests();
    } catch (e) {
      console.error("Reject request error:", e);
      alert("반려 처리 도중 데이터베이스 오류가 발생했습니다.");
    }
  };

  const handleDeleteRequest = async (req: ProgramVersionRequest) => {
    // 1) 권한 검사
    if (!isSongDirector) {
      alert("⚠️ 결재 내역 삭제 권한은 송경영 사업단장 및 관리자에게 있습니다.");
      return;
    }

    if (!window.confirm("정말 이 결재 내역을 삭제하시겠습니까?\n(승인 완료된 이력의 경우, 적용 이전 계획 상태로 프로그램 데이터가 강제 롤백됩니다.)")) {
      return;
    }

    try {
      // 2) DB에서 해당 결재 내역 삭제
      const { error: deleteErr } = await deleteVersionRequest(req.id);

      if (deleteErr) throw deleteErr;

      // 3) 승인 완료된 이력인 경우 롤백(이전 계획 복원) 처리
      if (req.status === "승인완료") {
        const beforeFields = req.changes.before; // 이전 계획 데이터
        const targetUnitId = getRealUnitId(req.unit_id, selectedYear);

        setProjects((prevProjects) => {
          const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
          let dataUpdated = false;

          updated.forEach((p: LegacyAppRecord) => {
            const pYearVal = p.year === 2024 + selectedYear || p.year === selectedYear;
            if (pYearVal) {
              p.units.forEach((u: LegacyAppRecord) => {
                if (u.id === targetUnitId) {
                  u.programs.forEach((prog: LegacyAppRecord) => {
                    if (String(prog.id) === String(req.program_id)) {
                      // 이전 계획 스냅샷(beforeFields)의 정보를 전체 병합
                      Object.keys(beforeFields).forEach((key) => {
                        if (key === "years" && beforeFields.years) {
                          if (!prog.years) prog.years = {};
                          if (beforeFields.years[selectedYear]) {
                            prog.years[selectedYear] = {
                              ...prog.years[selectedYear],
                              ...beforeFields.years[selectedYear]
                            };
                          }
                        } else if (key === "pdca" && beforeFields.pdca) {
                          prog.pdca = { ...prog.pdca, ...beforeFields.pdca };
                        } else {
                          prog[key] = beforeFields[key];
                        }
                      });
                      dataUpdated = true;
                    }
                  });
                }
              });

              // Supabase 반영
              if (dataUpdated) {
                updateProjectData(2024 + selectedYear, p.data || p)
                  .then(({ error }) => {
                    if (error) console.error("Failed to sync project data after rollback deletion:", error);
                  });
              }
            }
          });

          return updated;
        });
      }

      alert("🗑️ 결재 내역이 성공적으로 삭제되었으며, 승인완료 건의 경우 이전 기획 상태로 안전하게 복원되었습니다.");
      setSelectedRequest(null);
      fetchVersionRequests();
    } catch (e) {
      console.error("Delete request error:", e);
      alert("결재 내역 삭제 도중 데이터베이스 오류가 발생했습니다.");
    }
  };

  // 실무진 수동 갱신 (프로그램 PDCA 및 실적 등록)
  const handleUpdateProgramDetails = (unitId: string, progId: string, updatedFields: LegacyAppRecord) => {
    const realUnitId = getRealUnitId(unitId, selectedYear);
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
      updated.forEach((p: LegacyAppRecord) => {
        p.units.forEach((u: LegacyAppRecord) => {
          if (u.id === realUnitId) {
            u.programs.forEach((prog: LegacyAppRecord) => {
              if (prog.id === progId) {
                // PDCA 상태 갱신
                if (updatedFields.pdca !== undefined) prog.pdca = updatedFields.pdca;
                if (updatedFields.participants !== undefined) prog.participants = updatedFields.participants;
                if (updatedFields.actual_audience_participants !== undefined) prog.actual_audience_participants = updatedFields.actual_audience_participants;
                if (updatedFields.satisfaction !== undefined) prog.satisfaction = updatedFields.satisfaction;
                if (updatedFields.selfEval !== undefined) prog.selfEval = updatedFields.selfEval;

                // 실제 실적 타임라인 갱신 (수동 입력 지원)
                if (updatedFields.actual_timeline !== undefined) prog.actual_timeline = updatedFields.actual_timeline;

                // 신규 P단계 기획 필드 갱신
                if (updatedFields.timeline !== undefined) prog.timeline = updatedFields.timeline;
                if (updatedFields.targetAudience !== undefined) prog.targetAudience = updatedFields.targetAudience;
                if (updatedFields.coopDept !== undefined) prog.coopDept = updatedFields.coopDept;
                if (updatedFields.target_participants !== undefined) prog.target_participants = updatedFields.target_participants;
                if (updatedFields.target_developments !== undefined) prog.target_developments = updatedFields.target_developments;
                if (updatedFields.target_etc !== undefined) prog.target_etc = updatedFields.target_etc;
                if (updatedFields.target_participants_unit !== undefined) prog.target_participants_unit = updatedFields.target_participants_unit;
                if (updatedFields.target_developments_unit !== undefined) prog.target_developments_unit = updatedFields.target_developments_unit;
                if (updatedFields.target_etc_unit !== undefined) prog.target_etc_unit = updatedFields.target_etc_unit;
                if (updatedFields.target_participants_name !== undefined) prog.target_participants_name = updatedFields.target_participants_name;
                if (updatedFields.target_developments_name !== undefined) prog.target_developments_name = updatedFields.target_developments_name;
                if (updatedFields.target_etc_name !== undefined) prog.target_etc_name = updatedFields.target_etc_name;
                if (updatedFields.kpi_type !== undefined) prog.kpi_type = updatedFields.kpi_type;
                if (updatedFields.kpi_link !== undefined) prog.kpi_link = updatedFields.kpi_link;
                if (updatedFields.kpi_types !== undefined) prog.kpi_types = updatedFields.kpi_types;
                if (updatedFields.kpi_links !== undefined) prog.kpi_links = updatedFields.kpi_links;
                if (updatedFields.kpi_targets !== undefined) prog.kpi_targets = updatedFields.kpi_targets;
                if (updatedFields.kpi_actuals !== undefined) prog.kpi_actuals = updatedFields.kpi_actuals;

                // 신규 A단계 2분할 환류 필드 갱신
                if (updatedFields.evalType !== undefined) prog.evalType = updatedFields.evalType;
                if (updatedFields.excellent !== undefined) prog.excellent = updatedFields.excellent;
                if (updatedFields.improvePlan !== undefined) prog.improvePlan = updatedFields.improvePlan;
                if (updatedFields.deficiency !== undefined) prog.deficiency = updatedFields.deficiency;
                if (updatedFields.actionItem !== undefined) prog.actionItem = updatedFields.actionItem;
                if (updatedFields.achievements !== undefined) prog.achievements = updatedFields.achievements;

                const py = prog.years?.[selectedYear];
                if (py) {
                  // P단계 예산 배정액 세부 재원 갱신 (본예산 및 이월예산 구분)
                  if (updatedFields.budget_national !== undefined) py.budget_national = updatedFields.budget_national;
                  if (updatedFields.budget_city !== undefined) py.budget_city = updatedFields.budget_city;
                  if (updatedFields.budget_external !== undefined) py.budget_external = updatedFields.budget_external;

                  if (updatedFields.budget_carry_national !== undefined) py.budget_carry_national = updatedFields.budget_carry_national;
                  if (updatedFields.budget_carry_city !== undefined) py.budget_carry_city = updatedFields.budget_carry_city;
                  if (updatedFields.budget_carry_external !== undefined) py.budget_carry_external = updatedFields.budget_carry_external;

                  // 세부 재원 예산의 합으로 총 본예산(budget_main) 동기화 (외부사업비 제외)
                  py.budget_main = (py.budget_national || 0) + (py.budget_city || 0);

                  // 세부 재원 이월예산의 합으로 총 이월예산(budget_carry) 동기화 (1차년도 제외, 외부사업비 제외)
                  if (selectedYear === 1) {
                    py.budget_carry_national = 0;
                    py.budget_carry_city = 0;
                    py.budget_carry_external = 0;
                    py.budget_carry = 0;
                  } else {
                    py.budget_carry = (py.budget_carry_national || 0) + (py.budget_carry_city || 0);
                  }

                  // 프로그램 최상위 레거시 필드도 현재 5개년 연도 정보 기준으로 일치화 (P 단계 입력이 진짜)
                  if (selectedYear === 2) {
                    prog.budget_2026 = py.budget_main;
                    prog.budget_2025_carry = py.budget_carry;
                    prog.budget = prog.budget_2026 + prog.budget_2025_carry;
                  } else if (selectedYear === 1) {
                    prog.budget_2025_carry = 0;
                    prog.budget = py.budget_main;
                  } else {
                    prog.budget = py.budget_main + py.budget_carry;
                  }

                  // D단계 집행액 세부 재원 갱신
                  if (updatedFields.spent_national !== undefined) py.spent_national = Math.min(updatedFields.spent_national, py.budget_national || 0);
                  if (updatedFields.spent_city !== undefined) py.spent_city = Math.min(updatedFields.spent_city, py.budget_city || 0);
                  if (updatedFields.spent_external !== undefined) py.spent_external = Math.min(updatedFields.spent_external, py.budget_external || 0);

                  // 세부 재원 집행액의 합으로 총 본집행액(spent_main) 동기화 (외부사업비 제외)
                  py.spent_main = (py.spent_national || 0) + (py.spent_city || 0);

                  // 프로그램 최상위 집행액 레거시 필드 동기화 (D 단계 입력이 진짜)
                  if (selectedYear === 2) {
                    prog.spent_2026 = py.spent_main;
                    prog.spent_2025_carry = py.spent_carry || 0;
                    prog.spent = prog.spent_2026 + prog.spent_2025_carry;
                  } else if (selectedYear === 1) {
                    prog.spent_2025_carry = 0;
                    prog.spent = py.spent_main;
                  } else {
                    prog.spent = py.spent_main + (py.spent_carry || 0);
                  }

                  // 비목별 이원화 예산 갱신
                  if (updatedFields.budget_categories !== undefined) {
                    py.budget_categories = updatedFields.budget_categories;
                  }
                }

                // 프로그램 5개년 이월 잔액 재계산
                recalculateCarryOver(prog.years);

                // 수동 이월 배정 기입이 포함되지 않은 경우에만 예산 이월비 자동 재조정
                if (updatedFields.budget_carry_national === undefined) {
                  [1, 2, 3, 4, 5].forEach((yr) => {
                    if (yr !== selectedYear) {
                      const y = prog.years?.[yr];
                      if (y) {
                        const isExternalSub = prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
                        const isNationalOnly = prog.id.startsWith("A1나-");
                        if (isExternalSub) {
                          y.budget_carry_external = y.budget_carry || 0;
                          y.budget_carry_national = 0;
                          y.budget_carry_city = 0;
                        } else if (isNationalOnly) {
                          y.budget_carry_national = y.budget_carry || 0;
                          y.budget_carry_city = 0;
                          y.budget_carry_external = 0;
                        } else {
                          const nationalRatio = prog.budget_2026 > 0 ? (prog.budget_national || 0) / prog.budget_2026 : 0.5;
                          y.budget_carry_national = Math.round((y.budget_carry || 0) * nationalRatio);
                          y.budget_carry_city = (y.budget_carry || 0) - y.budget_carry_national;
                          y.budget_carry_external = 0;
                        }
                      }
                    }
                  });
                }
              }
            });

            // 해당 단위과제에 소속된 세부 프로그램들의 비목별 배정계획을 10대 표준비목으로 쪼개서 실시간 롤업 동기화
            const categorySums: Record<string, LegacyAppRecord> = {
              "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
            };

            u.programs.forEach((prog: LegacyAppRecord) => {
              const py = prog.years?.[selectedYear] || {};
              const progTotalMain = py.budget_main || 0;
              const progTotalCarry = py.budget_carry || 0;
              const progTotalSpent = py.spent_main || 0;
              const progTotalSpentCarry = py.spent_carry || 0;

              let allocatedMain = 0;
              let allocatedCarry = 0;
              let allocatedSpent = 0;
              let allocatedSpentCarry = 0;

              if (py.budget_categories && Array.isArray(py.budget_categories)) {
                py.budget_categories.forEach((catItem: LegacyAppRecord) => {
                  const catName = catItem.category;
                  if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                    const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                    const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                    const spentVal = Math.round(catItem.spent || 0);
                    const spentCarryVal = Math.round(catItem.spent_carry || 0);

                    categorySums[catName].main += mainVal;
                    categorySums[catName].carry += carryVal;
                    categorySums[catName].spent_main += spentVal;
                    categorySums[catName].spent_carry += spentCarryVal;

                    allocatedMain += mainVal;
                    allocatedCarry += carryVal;
                    allocatedSpent += spentVal;
                    allocatedSpentCarry += spentCarryVal;
                  }
                });
              }

              const remainMain = Math.max(0, progTotalMain - allocatedMain);
              const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
              const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
              const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

              categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
              categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
            });

            // 계산 결과를 u.budgetDetails 의 selectedYear 에 주입
            Object.keys(categorySums).forEach((catName: string) => {
              if (!u.budgetDetails[catName]) {
                u.budgetDetails[catName] = { years: {} };
              }
              if (!u.budgetDetails[catName].years[selectedYear]) {
                u.budgetDetails[catName].years[selectedYear] = {
                  budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                };
              }
              const tgt = u.budgetDetails[catName].years[selectedYear];
              const mainVal = categorySums[catName].main;
              const isNationalOnly = u.id === "A1나";

              // 💡 [단위과제 하위 프로그램들의 총합 비율 계산]
              let totalProgMain = 0;
              let totalProgNational = 0;
              let totalProgSpent = 0;
              let totalProgSpentNational = 0;

              u.programs.forEach((prog: LegacyAppRecord) => {
                const py = prog.years?.[selectedYear] || {};
                totalProgMain += py.budget_main || 0;
                totalProgNational += py.budget_national || 0;
                totalProgSpent += py.spent_main || 0;
                totalProgSpentNational += py.spent_national || 0;
              });

              const ratio = totalProgMain > 0 ? totalProgNational / totalProgMain : 0.5;
              const spentRatio = totalProgSpent > 0 ? totalProgSpentNational / totalProgSpent : ratio;

              tgt.budget_main = mainVal;
              tgt.budget_carry = categorySums[catName].carry;
              tgt.spent_main = categorySums[catName].spent_main;
              tgt.spent_carry = categorySums[catName].spent_carry;

              // 💡 [비목 상세 수준 재원 기입] A1나 및 D1, D2, D3 단위과제는 국비 100%, 시비 0원 강제 처리
              tgt.budget_national = isNationalOnly ? mainVal : Math.round(mainVal * ratio);
              tgt.budget_city = isNationalOnly ? 0 : mainVal - Math.round(mainVal * ratio);
              tgt.budget_external = 0;
              tgt.spent_national = isNationalOnly ? categorySums[catName].spent_main : Math.round(categorySums[catName].spent_main * spentRatio);
              tgt.spent_city = isNationalOnly ? 0 : categorySums[catName].spent_main - Math.round(categorySums[catName].spent_main * spentRatio);
              tgt.spent_external = 0;
            });

            // 모든 비목의 이월 잔액 재계산
            Object.keys(u.budgetDetails).forEach((key: string) => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 연쇄 재계산
            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              const budgetDetailValues = Object.values(u.budgetDetails as Record<string, LegacyAppRecord>);
              uYear.spent_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_carry || 0), 0);

              // 💡 [교육용 한글 주석] 프로그램 단위 재원 롤업 연산 시 A1나인 경우 국비 100% 강제 동기화
              if (u.id === "A1나") {
                uYear.budget_national = uYear.budget_main;
                uYear.budget_city = 0;
                uYear.budget_external = 0;
                uYear.spent_national = uYear.spent_main;
                uYear.spent_city = 0;
                uYear.spent_external = 0;
              } else {
                uYear.budget_national = u.programs.reduce((sum: number, prog: LegacyAppRecord) => sum + (prog.years?.[yr]?.budget_national || 0), 0);
                uYear.budget_city = u.programs.reduce((sum: number, prog: LegacyAppRecord) => sum + (prog.years?.[yr]?.budget_city || 0), 0);
                uYear.budget_external = u.programs.reduce((sum: number, prog: LegacyAppRecord) => sum + (prog.years?.[yr]?.budget_external || 0), 0);
                uYear.spent_national = u.programs.reduce((sum: number, prog: LegacyAppRecord) => sum + (prog.years?.[yr]?.spent_national || 0), 0);
                uYear.spent_city = u.programs.reduce((sum: number, prog: LegacyAppRecord) => sum + (prog.years?.[yr]?.spent_city || 0), 0);
                uYear.spent_external = u.programs.reduce((sum: number, prog: LegacyAppRecord) => sum + (prog.years?.[yr]?.spent_external || 0), 0);
              }
            });
            recalculateCarryOver(u.years);

            // 레거시/기타 UI 연동용 필드 동기화
            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });

        // 프로젝트 전체 집행액/예산 총합 갱신
        p.spent = p.units.reduce((sum: number, un: LegacyAppRecord) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum: number, un: LegacyAppRecord) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      // 💡 [DB 실시간 연동 가드] 프로그램 기획/예산 상세 변경 시, 원격 Supabase DB에도 즉각 동기화 저장합니다.
      if (supabase && currentUser && currentRole?.id !== "GUEST") {
        upsertProjectData(selectedYear, updated)
          .then(({ error }) => {
            if (error) console.error("프로그램 기획 상세 DB 업데이트 실패:", error);
            else console.log("프로그램 기획 상세 DB 업데이트 성공!");
          });
      }
      return updated;
    });
  };

  // 프로그램 신규 추가 핸들러
  const handleAddProgram = (unitId: string, title: string, assignee: string, budget2026: string | number, carryBudget: string | number) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
      updated.forEach((p: LegacyAppRecord) => {
        p.units.forEach((u: LegacyAppRecord) => {
          if (u.id === unitId) {
            // 새 프로그램 ID 자동 연산
            let nextNum = 1;
            if (u.programs.length > 0) {
              const lastId = u.programs[u.programs.length - 1].id;
              const parts = lastId.split("-");
              const lastNum = parseInt(parts[parts.length - 1], 10);
              if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
            const newId = `${unitId}-${String(nextNum).padStart(2, '0')}`;

            const bMain = Math.round((parseFloat(String(budget2026)) || 0) * 1000000);
            const bCarry = Math.round((parseFloat(String(carryBudget)) || 0) * 1000000);

            const yearsObj: LegacyYearRecord = {};
            [1, 2, 3, 4, 5].forEach((yr) => {
              const baseMain = yr === 2 ? bMain : Math.round(bMain * (yr === 1 ? 0.9 : yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3));
              const baseCarry = yr === 2 ? bCarry : 0;
              yearsObj[yr] = {
                budget_main: baseMain,
                budget_carry: baseCarry,
                spent_main: 0,
                spent_carry: 0,
                budget_categories: [],
                budget_national: baseMain,
                budget_city: 0,
                budget_external: 0,
                budget_carry_national: baseCarry,
                budget_carry_city: 0,
                budget_carry_external: 0
              };
            });

            const newProg = {
              id: newId,
              title: title,
              assignee: assignee || "미지정",
              assignees: {
                [selectedYear]: assignee || "미지정"
              },
              budget_2026: bMain,
              budget_2025_carry: bCarry,
              budget: bMain + bCarry,
              spent_2026: 0,
              spent_2025_carry: 0,
              spent: 0,
              participants: 0,
              satisfaction: 0,
              selfEval: "",
              timeline: "",
              targetAudience: "",
              coopDept: "",
              pdca: { p: "대기", d: "대기", c: "대기", a: "대기" },
              years: yearsObj
            };

            u.programs.push(newProg);

            // 해당 단위과제 롤업 및 이월 재계산
            const categorySums: Record<string, LegacyAppRecord> = {
              "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
            };

            u.programs.forEach((prog: LegacyAppRecord) => {
              const py = prog.years?.[selectedYear] || {};
              const progTotalMain = py.budget_main || 0;
              const progTotalCarry = py.budget_carry || 0;
              const progTotalSpent = py.spent_main || 0;
              const progTotalSpentCarry = py.spent_carry || 0;

              let allocatedMain = 0;
              let allocatedCarry = 0;
              let allocatedSpent = 0;
              let allocatedSpentCarry = 0;

              if (py.budget_categories && Array.isArray(py.budget_categories)) {
                py.budget_categories.forEach((catItem: LegacyAppRecord) => {
                  const catName = catItem.category;
                  if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                    const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                    const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                    const spentVal = Math.round(catItem.spent || 0);
                    const spentCarryVal = Math.round(catItem.spent_carry || 0);

                    categorySums[catName].main += mainVal;
                    categorySums[catName].carry += carryVal;
                    categorySums[catName].spent_main += spentVal;
                    categorySums[catName].spent_carry += spentCarryVal;

                    allocatedMain += mainVal;
                    allocatedCarry += carryVal;
                    allocatedSpent += spentVal;
                    allocatedSpentCarry += spentCarryVal;
                  }
                });
              }

              const remainMain = Math.max(0, progTotalMain - allocatedMain);
              const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
              const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
              const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

              categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
              categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
            });

            Object.keys(categorySums).forEach((catName: string) => {
              if (!u.budgetDetails[catName]) {
                u.budgetDetails[catName] = { years: {} };
              }
              if (!u.budgetDetails[catName].years[selectedYear]) {
                u.budgetDetails[catName].years[selectedYear] = {
                  budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                };
              }
              const tgt = u.budgetDetails[catName].years[selectedYear];
              tgt.budget_main = categorySums[catName].main;
              tgt.budget_carry = categorySums[catName].carry;
              tgt.spent_main = categorySums[catName].spent_main;
              tgt.spent_carry = categorySums[catName].spent_carry;
            });

            Object.keys(u.budgetDetails).forEach((key: string) => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              const budgetDetailValues = Object.values(u.budgetDetails as Record<string, LegacyAppRecord>);
              uYear.spent_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);

            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });

        p.spent = p.units.reduce((sum: number, un: LegacyAppRecord) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum: number, un: LegacyAppRecord) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      // 💡 [DB 실시간 연동 가드] 프로그램 추가 시, 원격 Supabase DB에도 즉각 동기화 저장합니다.
      if (supabase && currentUser && currentRole?.id !== "GUEST") {
        upsertProjectData(selectedYear, updated)
          .then(({ error }) => {
            if (error) console.error("프로그램 추가 DB 업데이트 실패:", error);
            else console.log("프로그램 추가 DB 업데이트 성공!");
          });
      }
      return updated;
    });
  };

  // 협약서 신규 등록 핸들러
  const handleAddAgreement = (newAgr: LegacyAppRecord) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setAgreements((prev) => [
      ...prev,
      {
        ...newAgr,
        id: `agr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 난수 결합형 고유 ID 생성
      }
    ]);
  };

  // 협약서 수정 핸들러
  const handleUpdateAgreement = (id: string | number, updatedFields: LegacyAppRecord) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setAgreements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  // 협약서 삭제 핸들러
  const handleDeleteAgreement = (id: string | number) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setAgreements((prev) => prev.filter((a) => a.id !== id));
  };

  // 통합 상장/이수증 신규 등록 핸들러
  const handleAddUnifiedCertificate = (newCert: LegacyAppRecord) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setUnifiedCertificates((prev) => [
      ...prev,
      {
        ...newCert,
        id: `unified-y${newCert.year}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 연차 구분 및 난수 결합형 고유 ID
      }
    ]);
  };

  // 통합 상장/이수증 수정 핸들러
  const handleUpdateUnifiedCertificate = (id: string | number, updatedFields: LegacyAppRecord) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setUnifiedCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  // 통합 상장/이수증 삭제 핸들러
  const handleDeleteUnifiedCertificate = (id: string | number) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setUnifiedCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  // 성과지표 목표치/실적치 직접 수정 핸들러
  const handleUpdateKpiValue = (subItemId: string, field: string, value: unknown) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
      updated.forEach((p: LegacyAppRecord) => {
        p.units.forEach((u: LegacyAppRecord) => {
          u.kpis.forEach((k: LegacyAppRecord) => {
            if (k.subItems) {
              k.subItems.forEach((sub: LegacyAppRecord) => {
                if (sub.id === subItemId) {
                  if (!sub.years) sub.years = {};
                  if (!sub.years[selectedYear]) {
                    sub.years[selectedYear] = { target: 0, current: 0 };
                  }
                  sub.years[selectedYear][field] = value;
                }
              });
            }
          });
        });
      });
      return updated;
    });
  };

  // 비목 예산 세부 조율 갱신 핸들러 (5개년 연쇄 이월 계산 연계)
  const handleUpdateBudgetDetails = (unitId: string, updatedBudgetDetails: Record<string, LegacyAppRecord>) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const realUnitId = getRealUnitId(unitId, selectedYear);
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
      updated.forEach((p: LegacyAppRecord) => {
        p.units.forEach((u: LegacyAppRecord) => {
          if (u.id === realUnitId) {
            // 비목 예산 배정 수정분 반영
            Object.keys(updatedBudgetDetails).forEach((key: string) => {
              if (!u.budgetDetails[key]) {
                u.budgetDetails[key] = { years: {} };
              }
              const yearsUpdate = updatedBudgetDetails[key].years || {};
              Object.keys(yearsUpdate).forEach((yr: string) => {
                if (!u.budgetDetails[key].years) {
                  u.budgetDetails[key].years = {};
                }
                const existing = u.budgetDetails[key].years[yr] || {};
                u.budgetDetails[key].years[yr] = {
                  ...existing,
                  ...yearsUpdate[yr]
                };
              });
            });

            // 모든 비목의 이월 잔액 5개년 연쇄 재계산
            Object.keys(u.budgetDetails).forEach((key: string) => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 연쇄 재계산
            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              const budgetDetailValues = Object.values(u.budgetDetails as Record<string, LegacyAppRecord>);
              uYear.spent_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);

            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });

        p.spent = p.units.reduce((sum: number, un: LegacyAppRecord) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum: number, un: LegacyAppRecord) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };;;
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({ unitId: displayProjects[0]?.units[0]?.id || "", id: "", title: "", dept: "사업운영팀" });
    setShowProgramEditor(true);
  };

  const _handleOpenEditProgram = (unitId: string, prog: LegacyAppRecord) => {
    setEditingProgram(prog);
    setProgramForm({ unitId, id: prog.id, title: prog.title, dept: prog.dept || "사업운영팀" });
    setShowProgramEditor(true);
  };

  const handleSaveProgram = () => {
    if (!programForm.unitId || !programForm.id || !programForm.title) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    setProjects((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as LegacyAppRecord[];
      const targetUnit = updated.flatMap((p: LegacyAppRecord) => p.units).find((u: LegacyAppRecord) => u.id === programForm.unitId);
      if (targetUnit) {
        if (editingProgram) {
          // Edit
          const prog = targetUnit.programs.find((p: LegacyAppRecord) => p.id === editingProgram.id);
          if (prog) {
            prog.id = programForm.id;
            prog.title = programForm.title;
            // Dept might not be directly in prog originally, but we'll add it
            prog.dept = programForm.dept;
          }
        } else {
          // Add
          if (targetUnit.programs.some((p: LegacyAppRecord) => p.id === programForm.id)) {
            alert("이미 존재하는 프로그램 ID입니다.");
            return updated;
          }
          targetUnit.programs.push({
            id: programForm.id,
            title: programForm.title,
            dept: programForm.dept,
            assignees: {},
            years: { [selectedYear]: {} },
            kpis: []
          });
        }
      }
      return updated;
    });
    setShowProgramEditor(false);
  };

  const _handleDeleteProgram = (unitId: string, progId: string) => {
    if (!window.confirm("정말 이 프로그램을 삭제하시겠습니까? 관련 KPI 및 예산 내역이 있다면 함께 영향 받을 수 있습니다.")) return;
    setProjects((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as LegacyAppRecord[];
      const targetUnit = updated.flatMap((p: LegacyAppRecord) => p.units).find((u: LegacyAppRecord) => u.id === unitId);
      if (targetUnit) {
        targetUnit.programs = targetUnit.programs.filter((p: LegacyAppRecord) => p.id !== progId);
      }
      return updated;
    });
  };

  const handleDownloadExcel = async () => {
    const data: LegacyAppRecord[] = [];
    displayProjects.flatMap((p: LegacyAppRecord) => p.units).forEach((u: LegacyAppRecord) => {
      u.programs.forEach((prog: LegacyAppRecord) => {
        data.push({
          "단위과제 ID": u.id,
          "단위과제명": u.title,
          "프로그램 ID": prog.id,
          "프로그램명": prog.title,
          "담당연구원": prog.assignees?.[selectedYear] || prog.assignee || ""
        });
      });
    });
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "프로그램 배정");
    XLSX.writeFile(wb, `프로그램_배정_${selectedYear}차년도.xlsx`);
  };

  const handleUploadExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt: ProgressEvent<FileReader>) => {
      const bstr = evt.target?.result;
      if (typeof bstr !== "string") return;
      const XLSX = await import("xlsx");
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<LegacyAppRecord>(ws);

      setProjects((prev) => {
        const updated = JSON.parse(JSON.stringify(prev)) as LegacyAppRecord[];
        data.forEach((row: LegacyAppRecord) => {
          const unitId = row["단위과제 ID"];
          const progId = row["프로그램 ID"];
          const title = row["프로그램명"];
          const assignee = row["담당연구원"];

          const targetUnit = updated.flatMap((p: LegacyAppRecord) => p.units).find((u: LegacyAppRecord) => u.id === unitId);
          if (targetUnit) {
            let prog = targetUnit.programs.find((p: LegacyAppRecord) => p.id === progId);
            if (!prog) {
              prog = { id: progId, title: title, assignees: {}, years: { [selectedYear]: {} }, kpis: [] };
              targetUnit.programs.push(prog);
            } else {
              prog.title = title;
            }
            if (!prog.assignees) prog.assignees = {};
            if (assignee !== undefined) {
              prog.assignees[selectedYear] = assignee;
              prog.assignee = assignee;
            }
          }
        });
        return updated;
      });
      alert("엑셀 데이터가 성공적으로 반영되었습니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  // 연구원 배정 핸들러
  const handleAssignChange = (unitId: string, progId: string, newAssignee: string) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const realUnitId = getRealUnitId(unitId, selectedYear);
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects)) as LegacyAppRecord[];
      updated.forEach((p: LegacyAppRecord) => {
        p.units.forEach((u: LegacyAppRecord) => {
          if (u.id === realUnitId) {
            u.programs.forEach((prog: LegacyAppRecord) => {
              if (prog.id === progId) {
                if (!prog.assignees) {
                  prog.assignees = {};
                }
                prog.assignees[selectedYear] = newAssignee;
                // 하위 호환성을 위해 현재 선택된 년도의 배정을 단일 assignee 필드에도 업데이트
                prog.assignee = newAssignee;
              }
            });
          }
        });
      });
      // 💡 [DB 실시간 연동 가드] 로컬 상태 갱신 직후, 원격 Supabase DB의 projects_data 테이블에도 즉각 동기화 저장합니다.
      if (supabase && currentUser && currentRole?.id !== "GUEST") {
        upsertProjectData(selectedYear, updated)
          .then(({ error }) => {
            if (error) console.error("연구원 배정 DB 업데이트 실패:", error);
            else console.log("연구원 배정 DB 업데이트 성공!");
          });
      }
      return updated;
    });
    alert(`[${progId}] 프로그램의 ${selectedYear}차년도 담당연구원이 "${newAssignee || "미배정"}"(으)로 배정 및 저장되었습니다.`);
  };

  // 사용자 호칭 맵핑 웰컴 메시지 헬퍼 함수
  const getWelcomeMessage = () => {
    if (!currentUser) return "";

    // 만약 사용자가 타이핑한 원래 ID가 데모 가상 계정(g_director, hq_head, manager)이라면,
    // 주소록 매핑을 타지 않게 강제 우회하여 실명이 표출되지 않고 직함만 출력되도록 처리합니다.
    const cleanId = currentUser.loginId || currentUser.id;
    const isDemoAccount = ["g_director", "hq_head", "manager"].includes(cleanId);

    const memberSource = members as unknown as LegacyAppRecord;
    const safeMembers: LegacyAppRecord[] = Array.isArray(members) ? members : (memberSource && Array.isArray(memberSource.data) ? memberSource.data : []);
    const currentMember = isDemoAccount ? null : (safeMembers.find((m: LegacyAppRecord) => {
      if (!m.email) return false;
      const mId = m.email.trim().toLowerCase().split("@")[0];
      return mId === currentUser.id;
    }) || safeMembers.find((m: LegacyAppRecord) => {
      const cleanMName = m.name ? m.name.split(" ")[0].split("(")[0].trim() : "";
      const cleanCurrName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
      return cleanMName === cleanCurrName;
    }));

    let cleanName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
    if (cleanName === "g_director") cleanName = "송경영";
    else if (cleanName === "hq_head") cleanName = "김현수";
    else if (cleanName === "manager") cleanName = "심현미";
    else if (cleanName === "admin") cleanName = "관리자";

    let roleOrPosition = "";

    if (currentMember) {
      const mRole = currentMember.role || "";
      const mPosition = currentMember.position || "";

      if (mRole === "연구원") {
        // 연구원의 경우에는 직급/직위(position)를 표시
        roleOrPosition = mPosition || "연구원";
      } else {
        // 그 외의 경우(사업단장, 본부장, 센터장, 운영팀장 등)는 직책(role)을 표시
        if (mRole === "본부장") roleOrPosition = "총괄본부장";
        else if (mRole === "단장") roleOrPosition = "사업단장";
        else roleOrPosition = mRole;
      }
    } else {
      // 주소록에 매칭되지 않는 예외 및 테스트 계정 처리
      const roleId = currentUser.role_key || currentUser.role?.id || "";
      if (roleId === "ADMIN") roleOrPosition = "";
      else if (roleId === "G_DIRECTOR") roleOrPosition = "사업단장";
      else if (roleId === "HQ_HEAD") roleOrPosition = "총괄본부장";
      else if (roleId === "CENTER_LEADER") roleOrPosition = "센터장";
      else if (roleId === "MANAGER") roleOrPosition = "운영팀장";
      else roleOrPosition = "연구원";
    }

    const displayMessage = [cleanName, roleOrPosition].filter(Boolean).join(" ");

    return (
      <strong style={{ fontWeight: "800", color: "var(--text-primary)" }}>
        [{displayMessage}]
      </strong>
    );
  };

  // 💡 참여자 전용 설문조사 모바일 입력 폼 (로그인 우회)
  // 💡 [외부 위원 전용 심의 의결 채널 라우팅 인터셉터] (/v/ 단축경로와 기존 ?v= 지원)
  const params = new URLSearchParams(window.location.search);
  const shortVoteCode = parseCommitteeVotePath(window.location.pathname) || params.get("v");
  const isVoteMode = params.get("mode") === "vote" || !!shortVoteCode;
  const voteMeetingId = params.get("meetingId") || shortVoteCode || undefined;

  if (isVoteMode && voteMeetingId) {
    return (
      <React.Suspense fallback={<div style={{ color: "var(--text-secondary)", padding: "2rem", textAlign: "center" }}>심의 의결 채널 로드 중...</div>}>
        <CommitteeExternalVote meetingId={voteMeetingId} />
      </React.Suspense>
    );
  }

  if (activeTab === "survey_respond") {
    return <SurveyResponder />;
  }

  if (!currentUser) {
    return <AuthManager onLoginSuccess={handleLoginSuccess} members={members} />;
  }

  const isGuest = currentUser && (
    currentUser.id === "guest" ||
    (currentUser.name || "").includes("게스트") ||
    (currentUser.role_key === "GUEST") ||
    (currentUser.role === "GUEST" || currentUser.role === "게스트") ||
    (currentUser.role && typeof currentUser.role === "object" && (currentUser.role.id === "GUEST" || currentUser.role.id === "guest"))
  );

  return (
    <div className="dashboard-container">
      {/* 사이드바 */}
      <Sidebar
        currentRole={currentRole}
        onChangeRole={() => { }}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          localStorage.setItem("anchor_active_tab", tab);
          setSelectedKpi(null);
        }}
        projectsSubTab={projectsSubTab}
        onChangeProjectsSubTab={setProjectsSubTab}
        kpiSubTab={kpiSubTab}
        onChangeKpiSubTab={setKpiSubTab}
        mgmtSubTab={mgmtSubTab}
        onChangeMgmtSubTab={setMgmtSubTab}
        budgetSubTab={budgetSubTab}
        onChangeBudgetSubTab={setBudgetSubTab}
        procurementSubTab={procurementSubTab}
        onChangeProcurementSubTab={setProcurementSubTab}
        scheduleSubTab={scheduleSubTab}
        onChangeScheduleSubTab={setScheduleSubTab}
        assetSubTab={assetSubTab}
        onChangeAssetSubTab={setAssetSubTab}
        agreementsSubTab={agreementsSubTab}
        onChangeAgreementsSubTab={setAgreementsSubTab}
        progressSubTab={progressSubTab}
        onChangeProgressSubTab={setProgressSubTab}
        committeeSubTab={committeeSubTab}
        onChangeCommitteeSubTab={(subTab) => {
          setCommitteeSubTab(subTab);
          localStorage.setItem("anchor_committee_sub_tab", subTab);
        }}
        menuVisibility={currentUser && ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(currentUser.role_key) ? {} : menuVisibility}
        isSongDirector={isSongDirector}
        currentUser={currentUser}
      />

      {/* 메인 뷰 */}
      <main className="main-content" style={{ opacity: isScrollRestored ? 1 : 0, transition: "opacity 0.22s ease-in-out" }}>
        <header className="top-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="page-title">
            <h1>앵커사업 통합 IR 대시보드</h1>
            <p>울산과학대학교 앵커사업 예산 및 성과관리 시스템</p>
          </div>

          {/* 전역 연도 선택 컨트롤러 */}
          <div style={{ display: "flex", gap: "0.2rem", background: "rgba(255, 255, 255, 0.03)", padding: "0.2rem", borderRadius: "2rem", border: "1px solid var(--border-color)" }}>
            {[1, 2, 3, 4, 5].map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  // 💡 탭 변경 즉시 비동기 로딩 플래그를 동기적으로 리셋하여 자동 저장 Race Condition을 완전히 원천 봉쇄
                  setIsFetchCompleted(false);
                  setIsDbLoaded(false);

                  setSelectedYear(yr);
                  setSelectedKpi(null);
                  if (yr === 1) {
                    setSelectedUnitId("A1");
                  } else {
                    setSelectedUnitId("A1가");
                  }
                  setSelectedProgId(null);
                }}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.88rem", // 💡 [가운데 연차 폰트 크기 1.5pt 상향 조정]
                  borderRadius: "2rem",
                  border: "none",
                  background: selectedYear === yr ? "var(--accent-color)" : "transparent",
                  color: selectedYear === yr ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.2s"
                }}
              >
                {yr}차년도{yr === 2 ? "(현)" : ""}
              </button>
            ))}
          </div>

          {/* 💡 [우측 영역 높이/너비 85% 수준 축소 튜닝] */}
          <div className="controls-section" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
            {/* 첫 번째 줄: 로그인 정보, 개인정보 관리, 로그아웃 */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginRight: "0.3rem" }}>
                {getWelcomeMessage()}
              </span>
              {currentUser && !isGuest && (
                <button
                  className="btn-primary"
                  style={{
                    padding: "0.3rem 0.6rem",
                    fontSize: "0.68rem",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.375rem",
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    cursor: "pointer",
                    height: "28px"
                  }}
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <LockIcon size={12} />
                  <span>개인정보 관리</span>
                </button>
              )}
              <button
                className="btn-primary"
                style={{
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.68rem",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid var(--danger-color)",
                  borderRadius: "0.375rem",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  cursor: "pointer",
                  height: "28px"
                }}
                onClick={handleLogout}
              >
                <LogOut size={12} />
                <span>로그아웃</span>
              </button>
            </div>

            {/* 두 번째 줄: DB 동기화 배지, 앵커 Wiki 링크 버튼, 라이트/다크모드 토글 */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {/* Supabase 실시간 동기화 상태 배지 */}
              <span
                onClick={() => {
                  if (syncStatus === "error") {
                    const msg = "동기화 실패 상태입니다.\n\n" +
                      "[안내 1] 장시간 화면을 켜두셨을 경우 로그인 세션 만료가 원인일 수 있습니다. 안전한 동기화를 위해 로그아웃 및 다시 로그인을 진행하시겠습니까? (권장)\n\n" +
                      "[안내 2] 단순 캐시 충돌이 의심되는 경우, '취소'를 누르시면 로컬 캐시를 초기화하고 화면을 새로고침합니다.";
                    if (confirm(msg)) {
                      handleLogout();
                    } else {
                      localStorage.removeItem(`anchor_cache_cert_y${selectedYear}`);
                      localStorage.removeItem(`anchor_cache_award_y${selectedYear}`);
                      localStorage.removeItem(`anchor_cache_agr_y${selectedYear}`);
                      window.location.reload();
                    }
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  fontSize: "0.68rem",
                  padding: "0.2rem 0.45rem",
                  borderRadius: "4px",
                  cursor: syncStatus === "error" ? "pointer" : "default",
                  background: syncStatus === "synced"
                    ? "rgba(16, 185, 129, 0.1)"
                    : syncStatus === "syncing"
                      ? "rgba(245, 158, 11, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  color: syncStatus === "synced"
                    ? "#10B981"
                    : syncStatus === "syncing"
                      ? "#F59E0B"
                      : "#EF4444",
                  border: syncStatus === "synced"
                    ? "1px solid rgba(16, 185, 129, 0.2)"
                    : syncStatus === "syncing"
                      ? "1px solid rgba(245, 158, 11, 0.2)"
                      : "1px solid rgba(239, 68, 68, 0.2)",
                  fontWeight: "700",
                  textDecoration: syncStatus === "error" ? "underline" : "none",
                  height: "28px"
                }}
                title={syncStatus === "error" ? "클릭하여 로컬 캐시 초기화" : ""}
               role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                {syncStatus === "synced" ? "☁️ DB 동기화 완료" : syncStatus === "syncing" ? "🔄 DB 저장 중..." : "⚠️ 동기화 실패 (클릭 시 복구)"}
              </span>

              {/* 💡 [앵커 Wiki] 이동식 링크 버튼 */}
              <button
                className="btn-primary"
                style={{
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.68rem",
                  background: activeTab === "llm_wiki" ? "rgba(99, 102, 241, 0.15)" : "var(--input-bg)",
                  border: activeTab === "llm_wiki" ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                  borderRadius: "0.375rem",
                  color: activeTab === "llm_wiki" ? "var(--accent-color)" : "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  cursor: "pointer",
                  height: "28px",
                  fontWeight: activeTab === "llm_wiki" ? "bold" : "normal"
                }}
                onClick={() => setActiveTab("llm_wiki")}
              >
                <BookOpen size={12} />
                <span>앵커 Wiki</span>
              </button>

              <button className="theme-toggle-btn" style={{ padding: "0.3rem", borderRadius: "0.375rem", height: "28px", width: "28px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div>
            {/* 메인 대시보드 탭: 사용자의 요청에 따라 엑셀 업로더 영역을 제거하고 KPI 요약 카드만 노출합니다. */}
            <KPIOverview key={`kpi-${selectedYear}`} projects={displayProjects} currentRole={currentRole} selectedYear={selectedYear} />
          </div>
        )}

        {activeTab === "projects" && (
          <div className="projects-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 서브탭 내비게이션 바 (프레임 밖/위에 배치) */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_system")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: projectsSubTab === "unit_system" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "unit_system" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                단위과제 체계
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_status")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: projectsSubTab === "unit_status" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "unit_status" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                단위과제 진행상황
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("program_mgmt")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: projectsSubTab === "program_mgmt" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "program_mgmt" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                프로그램 관리
              </button>
            </div>

            {/* 본문 콘텐츠 블록만 glass-card 로 감싸주어 서브메뉴와 분리 */}
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              {projectsSubTab === "unit_status" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* 💡 [요구사항 반영] 파일 다운로드 내보내기 버튼 그룹 신설 */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10b981",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <FileSpreadsheet size={14} />
                      Excel 다운로드
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPDF}
                      disabled={isDownloadingPdf === "unit_status"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        cursor: isDownloadingPdf === "unit_status" ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (isDownloadingPdf !== "unit_status") {
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {isDownloadingPdf === "unit_status" ? (
                        <>
                          <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                          PDF 내보내는 중...
                        </>
                      ) : (
                        <>
                          <FileText size={14} />
                          PDF 다운로드
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "#3b82f6",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <Download size={14} />
                      Markdown 다운로드
                    </button>
                  </div>

                  <div className="table-panel">
                    <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                          <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0.5rem", fontSize: "0.95rem" }}>단위과제</th>
                          <th colSpan={selectedYear >= 2 ? 5 : 4} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0", fontSize: "0.95rem" }}>
                            예산 배정 및 집행 (단위: 백만원)
                          </th>
                          <th colSpan={5} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0", fontSize: "0.95rem" }}>
                            프로그램 진행
                          </th>
                        </tr>
                        <tr>
                          <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>본예산</th>
                          {selectedYear >= 2 && <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>이월예산</th>}
                          <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>총 배정액</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>누적 집행</th>
                          <th style={{ fontSize: "0.88rem", borderRight: "1px solid var(--border-color)", textAlign: "right", paddingRight: "1rem", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>집행률</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>총 개수</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>준비</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>진행</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>완료</th>
                          <th style={{ fontSize: "0.88rem", textAlign: "center", color: "#3b82f6", background: "rgba(16, 185, 129, 0.08)" }}>진행률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const sortedUnits = displayProjects.flatMap((p) => p.units)
                            .sort((a, b) => {
                              if (a.id === "Common" || a.id === "X0") return 1;
                              if (b.id === "Common" || b.id === "X0") return -1;
                              return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                            });

                          // 합계 집계용 변수들
                          let sumBudgetMain = 0;
                          let sumBudgetCarry = 0;
                          let sumTotalBudget = 0;
                          let sumTotalSpent = 0;
                          let sumTotalPrograms = 0;
                          let sumReadyCount = 0;
                          let sumInProgressCount = 0;
                          let sumCompletedCount = 0;
                          let sumTotalProgressSum = 0;

                          sortedUnits.forEach((u) => {
                            const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                            const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                            const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);

                            sumBudgetMain += (yData.budget_main || 0);
                            sumBudgetCarry += budgetCarryVal;
                            sumTotalBudget += ((yData.budget_main || 0) + budgetCarryVal);
                            sumTotalSpent += ((yData.spent_main || 0) + spentCarryVal);

                            if (u.id !== "Common" && u.id !== "X0") {
                              const totalProgs = u.programs?.length || 0;
                              sumTotalPrograms += totalProgs;

                              if (totalProgs > 0) {
                                u.programs.forEach((prog: LegacyAppRecord) => {
                                  const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
                                  const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
                                  const progProgress = (completedSteps / 4) * 100;
                                  sumTotalProgressSum += progProgress;

                                  if (completedSteps === 0) {
                                    sumReadyCount++;
                                  } else if (completedSteps === 4) {
                                    sumCompletedCount++;
                                  } else {
                                    sumInProgressCount++;
                                  }
                                });
                              }
                            }
                          });

                          const sumRate = sumTotalBudget > 0 ? (sumTotalSpent / sumTotalBudget) * 100 : 0;
                          const sumProgressRate = sumTotalPrograms > 0 ? (sumTotalProgressSum / sumTotalPrograms) : 0;

                          return (
                            <>
                              {sortedUnits.map((u) => {
                                const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                                const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                                const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
                                const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
                                const totalSpent = (yData.spent_main || 0) + spentCarryVal;
                                const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

                                // 프로그램 현황 집계 변수들
                                const totalPrograms = u.programs?.length || 0;
                                let readyCount = 0;
                                let inProgressCount = 0;
                                let completedCount = 0;
                                let totalProgressSum = 0;

                                if (totalPrograms > 0) {
                                  u.programs.forEach((prog: LegacyAppRecord) => {
                                    const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
                                    const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
                                    const progProgress = (completedSteps / 4) * 100;
                                    totalProgressSum += progProgress;

                                    if (completedSteps === 0) {
                                      readyCount++;
                                    } else if (completedSteps === 4) {
                                      completedCount++;
                                    } else {
                                      inProgressCount++;
                                    }
                                  });
                                }
                                const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;

                                return (
                                  <tr
                                    aria-label={`${u.title} 단위과제 선택`}
                                    key={u.id}
                                    onClick={() => {
                                      setSelectedUnitId(u.id);
                                      setSelectedProgId(null);
                                      setProjectsSubTab("program_mgmt"); // 단위과제 클릭 시 프로그램 관리 탭으로 연계 이동
                                    }}
                                    style={{
                                      cursor: "pointer",
                                      background: selectedUnitId === u.id ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                      transition: "background 0.2s"
                                    }}
                                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                    <td style={{ fontWeight: "700", borderRight: "1px solid var(--border-color)" }}>
                                      {u.id === "Common" ? "" : `${u.id}. `}{u.title}
                                    </td>
                                    <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                      {formatToMillionWon(yData.budget_main)}
                                    </td>
                                    {selectedYear >= 2 && (
                                      <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                        {formatToMillionWon(budgetCarryVal)}
                                      </td>
                                    )}
                                    <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", textAlign: "right", paddingRight: "1rem" }}>
                                      {formatToMillionWon(totalBudget)}
                                    </td>
                                    <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                      {formatToMillionWon(totalSpent)}
                                    </td>
                                    <td style={{ borderRight: "1px solid var(--border-color)", fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                      {rate.toFixed(1)}%
                                    </td>
                                    {u.id === "Common" || u.id === "X0" ? (
                                      <>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td style={{ textAlign: "center" }}>-</td>
                                        <td>-</td>
                                      </>
                                    ) : (
                                      <>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center" }}>
                                          {totalPrograms}개
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--text-secondary)" }}>
                                          {readyCount}
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "#f59e0b" }}>
                                          {inProgressCount}
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--success-color)", fontWeight: "700" }}>
                                          {completedCount}
                                        </td>
                                        <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                                            <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                              <div style={{ width: `${Math.min(progressRate, 100)}%`, height: "100%", background: "#10b981" }} />
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-data)", fontWeight: "700", color: "#10b981" }}>{progressRate.toFixed(1)}%</span>
                                          </div>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                              {/* 합계 행 추가 */}
                              <tr style={{ background: "rgba(59, 130, 246, 0.08)", fontWeight: "800", borderTop: "2px solid var(--border-color)" }}>
                                <td style={{ fontWeight: "800", borderRight: "1px solid var(--border-color)", textAlign: "center" }}>
                                  합계
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                  {formatToMillionWon(sumBudgetMain)}
                                </td>
                                {selectedYear >= 2 && (
                                  <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                    {formatToMillionWon(sumBudgetCarry)}
                                  </td>
                                )}
                                <td style={{ fontFamily: "var(--font-data)", fontWeight: "800", textAlign: "right", paddingRight: "1rem", color: "var(--accent-color)" }}>
                                  {formatToMillionWon(sumTotalBudget)}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                  {formatToMillionWon(sumTotalSpent)}
                                </td>
                                <td style={{ borderRight: "1px solid var(--border-color)", fontFamily: "var(--font-data)", fontWeight: "800", textAlign: "right", paddingRight: "1rem" }}>
                                  {sumRate.toFixed(1)}%
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center" }}>
                                  {sumTotalPrograms}개
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--text-secondary)" }}>
                                  {sumReadyCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "#f59e0b" }}>
                                  {sumInProgressCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--success-color)", fontWeight: "800" }}>
                                  {sumCompletedCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                                    <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                      <div style={{ width: `${Math.min(sumProgressRate, 100)}%`, height: "100%", background: "#10b981" }} />
                                    </div>
                                    <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-data)", fontWeight: "800", color: "#10b981" }}>{sumProgressRate.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {projectsSubTab === "unit_system" && (
                <UnitSystemView key={`unit-system-${selectedYear}`} selectedYear={selectedYear} />
              )}

              {projectsSubTab === "program_mgmt" && (
                <div id="pdca-manager-section">
                  <React.Suspense fallback={null}>
                    <PDCAManager
                      key={`pdca-${selectedYear}`}
                      projects={displayProjects}
                      currentRole={currentRole}
                      onUpdateProgramDetails={handleUpdateProgramDetails}
                      onAddProgram={handleAddProgram}
                      selectedYear={selectedYear}
                      selectedUnitId={selectedUnitId}
                      setSelectedUnitId={setSelectedUnitId}
                      selectedProgId={selectedProgId}
                      setSelectedProgId={setSelectedProgId}
                      viewMode={pdcaViewMode}
                      setViewMode={setPdcaViewMode}
                      currentUser={currentUser}
                      supabase={supabase}
                    />
                  </React.Suspense>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "management" && currentRole && (
          <div className="management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>

            {/* 서브탭 내비게이션 바 (프레임 밖/위에 배치, 0.5rem 마진 및 1rem 폰트) */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.8rem", marginBottom: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* 1. 승인처리 탭 노출 가드 (최고 관리자군 또는 특화 승인권자) */}
              {((currentRole && ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(currentRole.id || "")) ||
                (currentUser && ["이규상", "임은애", "황수진", "최주명"].some(name => (currentUser.name || "").includes(name)))) && (
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("approvals")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "approvals" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "approvals" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    승인처리
                  </button>
                )}

              {/* 2. 구성원 관리, 회원현황, 프로그램 배정 등 기타 관리자 탭 노출 가드 (특화 승인권자는 제외) */}
              {currentRole && (currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR" || currentRole.id === "HQ_HEAD" || currentRole.id === "MANAGER") &&
                !(currentUser && ["이규상", "임은애", "황수진", "최주명"].some(name => (currentUser.name || "").includes(name))) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMgmtSubTab("members")}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        color: mgmtSubTab === "members" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: mgmtSubTab === "members" ? "2px solid var(--accent-color)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      구성원 관리
                    </button>
                    {currentRole.rank <= 2 && (
                      <button
                        type="button"
                        onClick={() => setMgmtSubTab("users")}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "0.5rem 1rem",
                          fontSize: "1rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          color: mgmtSubTab === "users" ? "var(--accent-color)" : "var(--text-secondary)",
                          borderBottom: mgmtSubTab === "users" ? "2px solid var(--accent-color)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        회원현황
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMgmtSubTab("programs")}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        color: mgmtSubTab === "programs" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: mgmtSubTab === "programs" ? "2px solid var(--accent-color)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      프로그램 배정
                    </button>
                  </>
                )}

              {/* 공용 sub-tab 버튼 (대학조직도, 사업단 조직도, 파트너기관은 누구나 접근 가능) */}
              {currentRole && (
                <>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("org_chart")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "org_chart" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "org_chart" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    대학 조직도
                  </button>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("center_org_chart")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "center_org_chart" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "center_org_chart" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    사업단 조직도
                  </button>

                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("partners")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "partners" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "partners" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    협력기관 관리
                  </button>
                </>
              )}
              {(currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <button
                  type="button"
                  onClick={() => setMgmtSubTab("instructor_pool")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    color: mgmtSubTab === "instructor_pool" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: mgmtSubTab === "instructor_pool" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  교∙강사 Pool 관리
                </button>
              )}
              {(currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <button
                  type="button"
                  onClick={() => setMgmtSubTab("portal_config")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    color: mgmtSubTab === "portal_config" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: mgmtSubTab === "portal_config" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  앵커 포털 관리
                </button>
              )}
            </div>

            {/* 본문 콘텐츠만 카드 블록 내부로 래핑 */}
            <div className="glass-card" style={{ padding: "1.25rem", position: "relative" }}>
              {/* 구성원 추가 및 엑셀 업로드/다운로드 툴바 영역 (협약서와 100% 동일한 버튼 디자인 및 둥글기 적용) */}
              {mgmtSubTab === "members" && currentRole.rank <= 2 && (
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.4rem", marginBottom: "1.2rem" }}>
                  {/* 엑셀 서식 다운로드 */}
                  <button
                    onClick={handleDownloadMemberTemplate}
                    className="action-btn download-btn"
                    style={{
                      background: "var(--bg-tertiary)",
                      cursor: "pointer"
                    }}
                  >
                    <Download size={16} /> 엑셀 서식
                  </button>

                  {/* 엑셀 업로드 */}
                  <label htmlFor="a11y-app-1"
                    className="action-btn upload-btn"
                    style={{
                      cursor: "pointer"
                    }}
                  >
                    <Upload size={16} /> 엑셀 업로드
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleMemberExcelImport}
                      style={{ display: "none" }}
                    />
                  </label>

                  {/* 엑셀 다운로드 */}
                  <button
                    onClick={handleExportMembersExcel}
                    className="action-btn download-btn"
                    style={{
                      background: "var(--bg-tertiary)",
                      cursor: "pointer"
                    }}
                  >
                    <Download size={16} /> 엑셀 다운로드
                  </button>

                  {/* 구성원 추가 (신규 등록 버튼 스타일과 100% 동기화) */}
                  <button
                    className="btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      borderRadius: "9999px",
                      padding: "0.5rem 1.2rem",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setEditingMember({
                        id: "",
                        name: "",
                        role: "연구원",
                        grade: "연구원",
                        dept: "ECC센터",
                        phoneOffice: "",
                        phoneMobile: "",
                        email: "",
                        room: "",
                        hireDate: "2026-03-01",
                        startDate: "2026-03-01",
                        endDate: "",
                        status: "참여중"
                      });
                      setIsMemberModalOpen(true);
                    }}
                  >
                    <Plus size={16} /> 신규 등록
                  </button>
                </div>
              )}

              {mgmtSubTab === "members" && (
                <div>
                  {/* 참여중 / 미참여 구분을 위한 삼분할 필터 바 */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <button
                      onClick={() => setMemberFilter("all")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        border: memberFilter === "all" ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                        background: memberFilter === "all" ? "rgba(59,130,246,0.15)" : "transparent",
                        color: memberFilter === "all" ? "var(--accent-color)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      전체 ({members.length}명)
                    </button>
                    <button
                      onClick={() => setMemberFilter("active")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        border: memberFilter === "active" ? "1px solid var(--success-color)" : "1px solid var(--border-color)",
                        background: memberFilter === "active" ? "rgba(16,185,129,0.15)" : "transparent",
                        color: memberFilter === "active" ? "var(--success-color)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      참여중 ({members.filter(m => getMemberStatusForYear(m, selectedYear) !== "미참여").length}명)
                    </button>
                    <button
                      onClick={() => setMemberFilter("retired")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        border: memberFilter === "retired" ? "1px solid #ef4444" : "1px solid var(--border-color)",
                        background: memberFilter === "retired" ? "rgba(239,68,68,0.15)" : "transparent",
                        color: memberFilter === "retired" ? "#ef4444" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      미참여 ({members.filter(m => getMemberStatusForYear(m, selectedYear) === "미참여").length}명)
                    </button>
                  </div>

                  <div className="table-panel">
                    <table className="custom-table" style={{ fontSize: "0.8rem", width: "100%" }}>
                      <thead>
                        <tr>
                          <th
                            onClick={() => requestMemberSort("dept")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            소속 부서 {memberSortConfig.key === "dept" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>성명</th>
                          <th
                            onClick={() => requestMemberSort("role")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            직책 {memberSortConfig.key === "role" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>직급/직위</th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>이메일</th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>교내 전화</th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>휴대전화</th>
                          <th
                            onClick={() => requestMemberSort("startDate")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            시작일 {memberSortConfig.key === "startDate" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          <th style={{ textAlign: "center", verticalAlign: "middle" }}>종료일</th>
                          <th
                            onClick={() => requestMemberSort("status")}
                            style={{ cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = ""}
                           role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                            참여 여부 {memberSortConfig.key === "status" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </th>
                          {currentRole.rank <= 2 && <th style={{ textAlign: "center", verticalAlign: "middle" }}>관리</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedMembers().map((m) => {
                          const isRetired = getMemberStatusForYear(m, selectedYear) === "미참여";
                          return (
                            <tr
                              key={m.id}
                              style={{
                                opacity: isRetired ? 0.45 : 1,
                                background: isRetired ? "rgba(255, 255, 255, 0.01)" : "transparent",
                                transition: "all 0.2s"
                              }}
                            >
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>{m.dept}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "800", color: isRetired ? "var(--text-secondary)" : "var(--text-primary)" }}>{m.name}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                {renderRoleBadge(m.role, isRetired)}
                              </td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>{m.grade}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.email}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.phoneOffice || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.phoneMobile || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.startDate || m.hireDate || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{m.endDate || "-"}</td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <span
                                  className={`badge ${isRetired ? "badge-red" : "badge-green"
                                    }`}
                                  style={{
                                    fontSize: "0.65rem",
                                    background: isRetired ? "rgba(239, 68, 68, 0.15)" : undefined,
                                    color: isRetired ? "#f87171" : undefined
                                  }}
                                >
                                  {getMemberStatusForYear(m, selectedYear)}
                                </span>
                              </td>
                              {currentRole.rank <= 2 && (
                                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                  <div style={{ display: "flex", gap: "0.3rem", justifyContent: "center", alignItems: "center" }}>
                                    <button
                                      className="btn-primary"
                                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(59,130,246,0.15)", border: "1px solid var(--accent-color)", color: "#60a5fa" }}
                                      onClick={() => {
                                        setEditingMember(m);
                                        setIsMemberModalOpen(true);
                                      }}
                                    >
                                      수정
                                    </button>
                                    <button
                                      className="btn-primary"
                                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171" }}
                                      onClick={async () => {
                                        if (window.confirm(`정말 ${m.name} 구성원을 삭제하시겠습니까?`)) {
                                          setMembers(members.filter((item) => item.id !== m.id));
                                          try {
                                            const { error } = await deleteRiseMember(m.id);
                                            if (error) throw error;
                                          } catch (err) {
                                            console.error("Failed to delete member from DB:", err);
                                          }
                                        }
                                      }}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mgmtSubTab === "programs" && (
                <div>
                  <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>단위과제 필터:</span>
                      <select
                        className="user-selector"
                        value={assignFilterUnitId}
                        onChange={(e) => setAssignFilterUnitId(e.target.value)}
                        style={{
                          padding: "0.3rem 0.6rem",
                          fontSize: "0.78rem",
                          borderRadius: "0.25rem",
                          background: "var(--panel-bg)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-primary)",
                          outline: "none",
                          width: "280px",
                          textOverflow: "ellipsis"
                        }}
                      >
                        <option value="all" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>전체 단위과제</option>
                        {displayProjects.flatMap((p) => p.units)
                          .sort((a, b) => {
                            if (a.id === "Common" || a.id === "X0") return 1;
                            if (b.id === "Common" || b.id === "X0") return -1;
                            return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                          })
                          .map((u) => (
                            <option key={u.id} value={u.id} style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>{u.id === "Common" ? "" : `${u.id}. `}{u.title}</option>
                          ))}
                      </select>
                    </div>
                    {currentRole.rank <= 2 && (
                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                        <label htmlFor="a11y-app-22"
                          className="action-btn upload-btn"
                          style={{
                            cursor: "pointer",
                            margin: 0
                          }}
                        >
                          <Upload size={16} /> 엑셀 업로드
                          <input id="a11y-app-22" type="file" accept=".xlsx, .xls" style={{ display: "none" }} ref={fileInputRef} onChange={handleUploadExcel} />
                        </label>
                        <button
                          onClick={handleDownloadExcel}
                          className="action-btn download-btn"
                          style={{
                            background: "var(--bg-tertiary)",
                            cursor: "pointer"
                          }}
                        >
                          <Download size={16} /> 엑셀 다운로드
                        </button>
                        <button
                          onClick={handleOpenAddProgram}
                          className="action-btn"
                          style={{
                            padding: "0.5rem 1.2rem",
                            background: "var(--accent-color)",
                            color: "white",
                            border: "none",
                            borderRadius: "9999px",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <Plus size={16} /> 신규 프로그램
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    * 실무 연구원으로 등록된 구성원(직책: 연구원)만 프로그램 담당연구원 목록으로 매핑됩니다.
                  </p>
                  <div className="table-panel">
                    <table className="custom-table" style={{ fontSize: "0.8rem", tableLayout: "fixed", width: "100%" }}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: "18%", textAlign: "center", verticalAlign: "middle" }}>단위과제</th>
                          <th rowSpan={2} style={{ width: "9%", textAlign: "center", verticalAlign: "middle" }}>프로그램 ID</th>
                          <th rowSpan={2} style={{ width: "22%", textAlign: "center", verticalAlign: "middle" }}>프로그램명</th>
                          <th rowSpan={2} style={{ width: "10%", textAlign: "center", verticalAlign: "middle" }}>담당부서</th>
                          <th rowSpan={2} style={{ width: "19%", textAlign: "center", verticalAlign: "middle" }}>담당연구원</th>
                          <th colSpan={4} style={{ textAlign: "center", width: "15%", verticalAlign: "middle" }}>진행 단계(PDCA)</th>
                          <th rowSpan={2} style={{ width: "7%", textAlign: "center", verticalAlign: "middle" }}>작업</th>
                        </tr>
                        <tr>
                          <th style={{ textAlign: "center", width: "3.75%" }}>P</th>
                          <th style={{ textAlign: "center", width: "3.75%" }}>D</th>
                          <th style={{ textAlign: "center", width: "3.75%" }}>C</th>
                          <th style={{ textAlign: "center", width: "3.75%" }}>A</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayProjects.flatMap((p) => p.units)
                          .filter((u) => assignFilterUnitId === "all" || u.id === assignFilterUnitId)
                          .sort((a, b) => {
                            if (a.id === "Common" || a.id === "X0") return 1;
                            if (b.id === "Common" || b.id === "X0") return -1;
                            return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                          })
                          .flatMap((u) => {
                            return u.programs.map((prog: LegacyAppRecord) => {
                              let dept = "사업운영팀";
                              if (selectedYear === 1) {
                                if (["A1", "A2", "D4"].includes(u.id)) dept = "ECC센터";
                                else if (["B1", "C1", "C3"].includes(u.id)) dept = "ICC센터";
                                else if (["B2", "B3", "D1", "D3"].includes(u.id)) dept = "RCC센터";
                                else if (u.id === "C2") dept = "AID-X지원센터";
                                else if (u.id === "D2") dept = "울산늘봄누리센터";
                              } else {
                                if (["A1가", "A2", "A3"].includes(u.id)) dept = "ECC센터";
                                else if (u.id === "A1나") dept = "신산업특화센터";
                                else if (["B1", "B3", "B4"].includes(u.id)) dept = "ICC센터";
                                else if (u.id === "B2") dept = "AID-X지원센터";
                                else if (u.id === "C2") dept = "울산늘봄누리센터";
                                else if (["C1", "D1", "D2", "D3"].includes(u.id)) dept = "RCC센터";
                              }

                              return (
                                <tr key={prog.id}>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", wordBreak: "break-all" }}>{u.id === "Common" ? "공통운영경비" : `${u.id}. ${u.title}`}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", wordBreak: "break-all" }}>{prog.title}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--accent-color)", fontWeight: "700" }}>{dept}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                    {currentRole.rank <= 2 ? (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center", justifyContent: "center" }}>
                                        {/* 공동배정 체크박스 */}
                                        <label htmlFor="a11y-app-23" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                                          <input id="a11y-app-23"
                                            type="checkbox"
                                            checked={!!jointPrograms[prog.id]}
                                            onChange={(e) => {
                                              const isChecked = e.target.checked;
                                              setJointPrograms(prev => ({ ...prev, [prog.id]: isChecked }));

                                              // 체크 해제 시에는 단일 연구원으로 변경할 수 있도록 현재 값의 첫 번째 연구원을 기본값으로 넘김
                                              if (!isChecked) {
                                                const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                handleAssignChange(u.id, prog.id, parts[0] || "");
                                              }
                                            }}
                                          />
                                          2인 공동배정
                                        </label>

                                        {jointPrograms[prog.id] ? (
                                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                                            {/* 정 담당자 선택 */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                              <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "700" }}>정:</span>
                                              <select
                                                className="user-selector"
                                                style={{ width: "110px", padding: "0.15rem 0.3rem", fontSize: "0.7rem" }}
                                                value={(() => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  return parts[0] || "";
                                                })()}
                                                onChange={(e) => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  const first = e.target.value;
                                                  const second = parts[1] || "";
                                                  const combined = second ? `${first}, ${second}` : first;
                                                  handleAssignChange(u.id, prog.id, combined);
                                                }}
                                              >
                                                <option value="">선택</option>
                                                {members
                                                  .filter((m) => m.role === "연구원" && m.dept === dept)
                                                  .map((m) => (
                                                    <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                      {m.name} {m.grade}
                                                    </option>
                                                  ))}
                                              </select>
                                            </div>
                                            {/* 부 담당자 선택 */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                              <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "700" }}>부:</span>
                                              <select
                                                className="user-selector"
                                                style={{ width: "110px", padding: "0.15rem 0.3rem", fontSize: "0.7rem" }}
                                                value={(() => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  return parts[1] || "";
                                                })()}
                                                onChange={(e) => {
                                                  const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                  const parts = currentVal.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
                                                  const first = parts[0] || "";
                                                  const second = e.target.value;
                                                  const combined = second ? `${first}, ${second}` : first;
                                                  handleAssignChange(u.id, prog.id, combined);
                                                }}
                                              >
                                                <option value="">선택</option>
                                                {members
                                                  .filter((m) => m.role === "연구원" && m.dept === dept)
                                                  .map((m) => (
                                                    <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                      {m.name} {m.grade}
                                                    </option>
                                                  ))}
                                              </select>
                                            </div>
                                          </div>
                                        ) : (
                                          /* 단일 배정 드롭다운 */
                                          <select
                                            className="user-selector"
                                            style={{ width: "200px", padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                                            value={prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "")}
                                            onChange={(e) => handleAssignChange(u.id, prog.id, e.target.value)}
                                          >
                                            <option value="">미배정</option>
                                            {members
                                              .filter((m) => {
                                                if (m.role !== "연구원") return false;
                                                const currentAssignee = prog.assignees?.[selectedYear] || prog.assignee || "";
                                                const isCurrent = currentAssignee === `${m.name} ${m.grade}`;
                                                const isDeptMatch = m.dept === dept;
                                                if (!isCurrent && !isDeptMatch) return false;

                                                const startYear = 2024 + selectedYear;
                                                const endYear = 2025 + selectedYear;
                                                const yearStart = new Date(`${startYear}-03-01T00:00:00`);
                                                const yearEnd = new Date(`${endYear}-02-28T23:59:59`);

                                                const mStartStr = m.startDate || m.hireDate || "2025-03-01";
                                                const mStartDate = new Date(mStartStr);
                                                if (mStartDate > yearEnd) return false;

                                                if (m.endDate) {
                                                  const mEndDate = new Date(m.endDate);
                                                  if (mEndDate < yearStart) return false;
                                                }
                                                return true;
                                              })
                                              .map((m) => (
                                                <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                  {m.name} {m.grade} ({m.dept})
                                                </option>
                                              ))}
                                          </select>
                                        )}
                                      </div>
                                    ) : (
                                      <span>{formatAssignee(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee)}</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.p === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.p}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.d === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.d}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.c === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.c}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle", color: prog.pdca.a === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.a}</td>
                                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                    {currentRole.rank <= 2 ? (
                                      <button
                                        className="btn-primary"
                                        style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", lineHeight: "1.2", whiteSpace: "normal" }}
                                        onClick={() => {
                                          setSelectedUnitId(u.id);
                                          setSelectedProgId(prog.id);
                                          setActiveTab("projects");
                                          setTimeout(() => {
                                            const el = document.getElementById("pdca-manager-section");
                                            if (el) el.scrollIntoView({ behavior: "smooth" });
                                          }, 100);
                                        }}
                                      >
                                        정보<br />등록
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>권한 없음</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mgmtSubTab === "users" && currentRole.rank <= 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* 1. 시스템 고정 계정 목록 테이블 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>시스템 고정 계정 현황</h3>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>관리자용 데모 및 시스템 고유 계정</span>
                    </div>
                    <div className="table-panel" style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <table className="custom-table" style={{ fontSize: "0.75rem", tableLayout: "fixed", width: "100%" }}>
                        <thead>
                          <tr>
                            <th style={{ width: "25%", textAlign: "center", verticalAlign: "middle" }}>아이디</th>
                            <th style={{ width: "12%", textAlign: "center", verticalAlign: "middle" }}>이름</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>역할</th>
                            <th style={{ width: "18%", textAlign: "center", verticalAlign: "middle" }}>역할키</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>시작일</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>속성</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredUsers.filter(u => ["admin", "g_director", "hq_head", "center_director", "manager", "team_leader", "researcher"].includes(u.id.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>
                                등록된 고정 계정이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            registeredUsers
                              .filter(u => ["admin", "g_director", "hq_head", "manager", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase()))
                              .map((u) => {
                                const roleNames: Record<string, string> = {
                                  ADMIN: "최고 관리자",
                                  G_DIRECTOR: "사업단장",
                                  HQ_HEAD: "총괄본부장",
                                  MANAGER: "운영팀장",
                                  CENTER_ECC: "ECC센터장",
                                  CENTER_SPECIAL: "신산업특화센터장",
                                  CENTER_NURI: "늘봄누리센터장",
                                  CENTER_ICC: "ICC센터장",
                                  CENTER_RCC: "RCC센터장",
                                  TEAM_LEADER: "팀장교수",
                                  RESEARCHER: "실무 연구원"
                                };
                                const cleanName = (u.name || "").split(" ")[0];
                                return (
                                  <tr key={u.id}>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>{cleanName}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      {renderRoleBadge(roleNames[u.role_key] || u.role_key, false)}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", fontWeight: "700" }}>고정 계정</td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. 주소록 연동 회원 목록 테이블 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>주소록 연동 회원 현황</h3>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>인사 주소록 기반 가입 계정</span>
                    </div>
                    <div className="table-panel" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <table className="custom-table" style={{ fontSize: "0.75rem", tableLayout: "fixed", width: "100%" }}>
                        <thead>
                          <tr>
                            <th style={{ width: "25%", textAlign: "center", verticalAlign: "middle" }}>아이디</th>
                            <th style={{ width: "12%", textAlign: "center", verticalAlign: "middle" }}>이름</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>역할</th>
                            <th style={{ width: "18%", textAlign: "center", verticalAlign: "middle" }}>역할키</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>시작일</th>
                            <th style={{ width: "15%", textAlign: "center", verticalAlign: "middle" }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredUsers.filter(u => !["admin", "g_director", "hq_head", "manager", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
                                연동된 주소록 회원이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            registeredUsers
                              .filter(u => !["admin", "g_director", "hq_head", "manager", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase()))
                              .map((u) => {
                                const roleNames: Record<string, string> = {
                                  ADMIN: "최고 관리자",
                                  DIRECTOR: "사업단장",
                                  G_DIRECTOR: "사업단장",
                                  HQ_HEAD: "총괄본부장",
                                  MANAGER: "운영팀장",
                                  CENTER_ECC: "ECC센터장",
                                  CENTER_SPECIAL: "신산업특화센터장",
                                  CENTER_NURI: "늘봄누리센터장",
                                  CENTER_ICC: "ICC센터장",
                                  CENTER_RCC: "RCC센터장",
                                  TEAM_LEADER: "팀장교수",
                                  RESEARCHER: "실무 연구원",
                                  RESEARCH: "연구원"
                                };
                                const cleanName = (u.name || "").split(" ")[0];
                                const isDirectoryUser = (members || []).some(m => m.email && m.email.trim().toLowerCase() === u.id.trim().toLowerCase() && m.status !== "미참여");

                                return (
                                  <tr key={u.id}>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>{cleanName}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      {renderRoleBadge(roleNames[u.role_key] || u.role_key, false)}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      {!isDirectoryUser ? (
                                        <button
                                          onClick={() => handleDeleteUser(u.id)}
                                          className="btn-primary"
                                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "var(--danger-color)", cursor: "pointer", border: "none" }}
                                        >
                                          삭제
                                        </button>
                                      ) : (
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700" }}>주소록 회원</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {mgmtSubTab === "approvals" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {(() => {
                    const approverNames = ["심현미", "김현수", "송경영", "이규상", "임은애", "황수진", "최주명"];
                    const hasNamePermission = currentUser && approverNames.some(name => (currentUser.name || "").includes(name));
                    const hasRolePermission = currentRole && ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(currentRole.id || "");
                    const isApprover = hasNamePermission || hasRolePermission;

                    if (!isApprover) {
                      return (
                        <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
                          <Info size={40} style={{ marginBottom: "0.75rem", opacity: 0.4, color: "var(--accent-color)" }} />
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem" }}>결재 승인 권한 없음</span>
                          <span>프로그램 기획 및 예산 변경 결재 권한은 <strong>심현미 운영팀장, 김현수 총괄본부장, 송경영 사업단장</strong> 3인에게만 부여되어 있습니다.</span>
                        </div>
                      );
                    }

                    return (
                      <div>
                        {/* 💡 [교육용 한글 주석] 예산변경과 시설사용 결재를 전환 선택할 수 있는 탭 세그먼트바를 렌더링합니다. */}
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                          {!(currentUser && ["이규상", "임은애", "황수진", "최주명"].some(n => (currentUser.name || "").includes(n))) && (
                            <button
                              onClick={() => setApprovalsTab("budget")}
                              style={{
                                padding: "0.4rem 1rem",
                                fontSize: "0.85rem",
                                fontWeight: "800",
                                borderRadius: "0.3rem",
                                border: "none",
                                background: approvalsTab === "budget" ? "var(--accent-color)" : "transparent",
                                color: approvalsTab === "budget" ? "white" : "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              💰 예산 및 기획변경 승인
                            </button>
                          )}
                          <button
                            onClick={() => setApprovalsTab("facility")}
                            style={{
                              padding: "0.4rem 1rem",
                              fontSize: "0.85rem",
                              fontWeight: "800",
                              borderRadius: "0.3rem",
                              border: "none",
                              background: approvalsTab === "facility" ? "var(--accent-color)" : "transparent",
                              color: approvalsTab === "facility" ? "white" : "var(--text-secondary)",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            🏫 교육환경 시설사용 승인
                          </button>
                        </div>

                        {approvalsTab === "budget" && !(currentUser && ["이규상", "임은애", "황수진", "최주명"].some(n => (currentUser.name || "").includes(n))) ? (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>프로그램 기획 및 예산 변경 결재함</h3>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>연구원들의 기획 리비전 신청 관리</span>
                            </div>
                            <div className="table-panel">
                              <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>결재번호</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>프로그램 ID</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "280px" }}>프로그램명</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>변경 차수</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>상태</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>신청자</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>신청 및 처리 일시</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "80px" }}>결재 처리</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {versionRequests.length === 0 ? (
                                    <tr>
                                      <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2.5rem" }}>
                                        결재 대기 중이거나 처리된 변경 요청 문서가 없습니다.
                                      </td>
                                    </tr>
                                  ) : (
                                    versionRequests.map((req, _idx) => {
                                      // 💡 [교육용 한글 주석] 송경영 단장님의 직접 수정 이력은 공식 수정 횟차(seq) 집계에 들어가지 않도록 배제 처리합니다.
                                      const approvedRequests = versionRequests.filter(r => r.status === "승인완료" && r.version_name !== "송경영 단장 직접 수정");
                                      const isApproved = req.status === "승인완료";
                                      let displayNo = "-";
                                      if (isApproved) {
                                        const approvedIdx = approvedRequests.findIndex(r => r.id === req.id);
                                        const seq = approvedIdx !== -1 ? (approvedRequests.length - approvedIdx) : 1;
                                        displayNo = `${2024 + req.year}-${req.unit_id}-${seq}`;
                                      }

                                      return (
                                        <tr key={req.id}>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{displayNo}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>{req.program_id}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", width: "280px", maxWidth: "280px", wordBreak: "keep-all", lineHeight: "1.3", whiteSpace: "normal" }}>{req.program_title}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <span className="badge badge-blue" style={{ fontSize: "0.65rem", whiteSpace: "normal", maxWidth: "85px", lineHeight: "1.3", display: "inline-block", textAlign: "center", padding: "0.15rem 0.25rem" }}>
                                              {req.version_name === "송경영 단장 직접 수정" ? (
                                                <>송경영 단장<br />직접 수정</>
                                              ) : req.version_name}
                                            </span>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                              <span className={`badge ${req.status === "승인완료" ? "badge-green" : (req.status === "반려" ? "badge-red" : "badge-gray")
                                                }`} style={{ fontSize: "0.65rem" }}>
                                                {req.status}
                                              </span>
                                              {(req.status === "승인완료" || req.status === "반려") && req.approved_by && (
                                                <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                                  ({req.approved_by})
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>{(req.requested_by || "").replace(/\s*\(.*?\)/g, "").replace(/\)/g, "").trim()}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.2rem", lineHeight: "1.4", fontFamily: "var(--font-data)", textAlign: "left" }}>
                                              <div>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>신청: </span>
                                                {new Date(req.requested_at).toLocaleString("ko-KR")}
                                              </div>
                                              <div style={{ marginTop: "0.15rem" }}>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>처리: </span>
                                                {req.approved_at
                                                  ? new Date(req.approved_at).toLocaleString("ko-KR")
                                                  : <span style={{ color: "var(--text-secondary)" }}>대기 중</span>
                                                }
                                              </div>
                                            </div>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                              <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="btn-primary"
                                                style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "var(--accent-color)", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                              >
                                                상세보기
                                              </button>
                                              {req.status === "승인대기" && (
                                                <>
                                                  <button
                                                    onClick={() => handleApproveRequest(req)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#10B981", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    승인
                                                  </button>
                                                  <button
                                                    onClick={() => handleRejectRequest(req)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    반려
                                                  </button>
                                                </>
                                              )}
                                              {isSongDirector && (
                                                <button
                                                  onClick={() => handleDeleteRequest(req)}
                                                  className="btn-primary"
                                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                >
                                                  삭제
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>교육환경 시설사용 예약 승인함</h3>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>공간 사용 신청 및 충돌 승인 관리</span>
                            </div>
                            <div className="table-panel">
                              <table className="custom-table" style={{ fontSize: "0.75rem", tableLayout: "fixed", width: "100%" }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "116px" }}>예약일자</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "137px" }}>사용시간</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "169px" }}>시설명(호실번호)</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "116px" }}>신청부서</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "95px" }}>신청자</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>사용목적</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "100px" }}>결재 상태</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "90px" }}>일정 조정</th>
                                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "100px" }}>결재 처리</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reservations.length === 0 ? (
                                    <tr>
                                      <td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2.5rem" }}>
                                        접수된 교육환경 공간 예약 승인 신청 문서가 없습니다.
                                      </td>
                                    </tr>
                                  ) : (
                                    reservations.map((res) => {
                                      const SPACE_ROOMS: Record<string, string> = {
                                        "AI∙DX다목적강의실": "M-404",
                                        "AI∙DX강의실1": "M-402",
                                        "AI∙DX강의실2": "M-405",
                                        "울산늘봄누리센터": "1-108",
                                        "앵커사업단회의실": "앵커사업단"
                                      };
                                      const roomSuffix = SPACE_ROOMS[res.space_name] ? `(${SPACE_ROOMS[res.space_name]})` : "";
                                      return (
                                        <tr key={res.id}>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", fontWeight: "700" }}>{res.reserved_date}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontFamily: "var(--font-data)", whiteSpace: "nowrap" }}>{res.start_time.substring(0, 5)} ~ {res.end_time.substring(0, 5)}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.space_name}{roomSuffix}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.dept}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.reserver_name}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle", wordBreak: "break-all" }}>{res.purpose}</td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <span className={`badge ${res.status === "승인완료" ? "badge-green" : "badge-orange"}`} style={{ fontSize: "0.65rem" }}>
                                              {res.status || "승인대기"}
                                            </span>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <button
                                              onClick={() => handleOpenEditTime(res)}
                                              style={{
                                                background: "none",
                                                border: "none",
                                                color: "#60A5FA",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.15rem",
                                                fontSize: "0.65rem",
                                                fontWeight: "800"
                                              }}
                                              title="예약 일시 수정 조율 권한"
                                            >
                                              <Edit2 size={12} />
                                              <span>조정</span>
                                            </button>
                                          </td>
                                          <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                              {res.status !== "승인완료" ? (
                                                <>
                                                  <button
                                                    onClick={() => handleApproveReservation(res)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#10B981", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    승인
                                                  </button>
                                                  <button
                                                    onClick={() => handleRejectReservation(res)}
                                                    className="btn-primary"
                                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                  >
                                                    반려
                                                  </button>
                                                </>
                                              ) : (
                                                <button
                                                  onClick={() => handleRejectReservation(res)}
                                                  className="btn-primary"
                                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white", width: "100%", minWidth: "56px", maxWidth: "68px", fontWeight: "700" }}
                                                >
                                                  취소/삭제
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {mgmtSubTab === "org_chart" && (
                <OrgChartManager key={`org-${darkMode}`} />
              )}

              {mgmtSubTab === "center_org_chart" && (
                <CenterOrgChartManager key={`center-org-${darkMode}`} />
              )}



              {mgmtSubTab === "partners" && (
                <React.Suspense fallback={null}>
                  <PartnerManager key={`partner-${darkMode}-${selectedYear}`} selectedYear={selectedYear} />
                </React.Suspense>
              )}

              {mgmtSubTab === "instructor_pool" && (currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <React.Suspense fallback={null}>
                  <InstructorPoolManager key={`instructors-${darkMode}`} currentUser={currentUser} currentRole={currentRole} />
                </React.Suspense>
              )}

              {mgmtSubTab === "portal_config" && (currentRole?.id === "ADMIN" || currentRole?.id === "G_DIRECTOR") && (
                <PortalConfigManager
                  key={`config-${darkMode}`}
                  initialVisibility={menuVisibility}
                  onSave={handleSaveMenuVisibility}
                />
              )}
            </div>
          </div>
        )}

        {/* 결재 상세 비교 Diff 모달 */}
        {selectedRequest && (() => {
          // 💡 [교육용 한글 주석] 송경영 단장님의 직접 수정 이력은 공식 수정 횟차(seq) 집계에 들어가지 않도록 배제 처리합니다.
          const approvedRequests = versionRequests.filter(r => r.status === "승인완료" && r.version_name !== "송경영 단장 직접 수정");
          const isApproved = selectedRequest.status === "승인완료";
          let displaySeq = "-";
          if (isApproved) {
            const approvedIdx = approvedRequests.findIndex(r => r.id === selectedRequest.id);
            const seq = approvedIdx !== -1 ? (approvedRequests.length - approvedIdx) : 1;
            displaySeq = `${2024 + selectedRequest.year}-${selectedRequest.unit_id}-${seq}`;
          }
          const changesAfter = selectedRequest.changes?.after || {};
          const showTarget1 = (changesAfter.target_participants && changesAfter.target_participants !== 0 && String(changesAfter.target_participants).trim() !== "" && String(changesAfter.target_participants).trim() !== "0") || (changesAfter.target_participants_name && changesAfter.target_participants_name.trim() !== "");
          const showTarget2 = (changesAfter.target_developments && changesAfter.target_developments !== 0 && String(changesAfter.target_developments).trim() !== "" && String(changesAfter.target_developments).trim() !== "0") || (changesAfter.target_developments_name && changesAfter.target_developments_name.trim() !== "");
          const showTarget3 = (changesAfter.target_etc && changesAfter.target_etc !== 0 && String(changesAfter.target_etc).trim() !== "" && String(changesAfter.target_etc).trim() !== "0") || (changesAfter.target_etc_name && changesAfter.target_etc_name.trim() !== "");
          let beforeVersion = "최초계획";
          let afterVersion = selectedRequest.version_name || "신청 계획";
          if (afterVersion.includes("차 수정")) {
            const numMatch = afterVersion.match(/(\d+)차/);
            if (numMatch) {
              const num = parseInt(numMatch[1], 10);
              if (num === 1) {
                beforeVersion = "최초계획";
              } else {
                beforeVersion = `${num - 1}차 수정`;
              }
            }
          } else if (afterVersion === "송경영 단장 직접 수정") {
            beforeVersion = "이전 계획";
          }

          return (
            <div style={{
              position: "fixed",
              top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.6)",
              zIndex: 1200,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflowY: "auto",
              padding: "2rem 1rem"
            }}>
              <div style={{
                background: "var(--modal-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
                width: "100%",
                maxWidth: "950px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                color: "var(--text-primary)",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                margin: "auto",
                padding: "1.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    📄 [{selectedRequest.program_title}] 기획 변경 상세 대조표 ({selectedRequest.version_name})
                  </h3>
                  <button
                    aria-label="변경 요청 상세 창 닫기"
                    onClick={() => setSelectedRequest(null)}
                    style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.78rem" }}>
                  {/* 1. 기본 기안 정보 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>결재번호:</span> <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-data)" }}>{displaySeq}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>신청자:</span> <strong style={{ color: "var(--text-primary)" }}>{(selectedRequest.requested_by || "").replace(/\s*\(.*?\)/g, "")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>신청 일시:</span> <strong style={{ color: "var(--text-primary)" }}>{new Date(selectedRequest.requested_at).toLocaleString("ko-KR")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>상태:</span> <strong style={{ color: selectedRequest.status === "승인완료" ? "#10B981" : (selectedRequest.status === "반려" ? "#EF4444" : "#FBBF24") }}>{selectedRequest.status}</strong>
                    </div>
                  </div>

                  {/* 2. 대조 비교 테이블 (이전 vs 신청) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    {/* 변경 전 (Before) */}
                    <div style={{ border: "1px solid rgba(239, 68, 68, 0.2)", padding: "1rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.015)" }}>
                      <h4 style={{ margin: "0 0 0.6rem 0", color: "#F87171", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid rgba(239, 68, 68, 0.1)", paddingBottom: "0.3rem" }}>
                        🔴 변경 전 ({beforeVersion})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>💰 재원별 예산 배정</span>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <tbody>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>국고 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_national || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.before.years?.[selectedYear]?.budget_carry_national || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>시비 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_city || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.before.years?.[selectedYear]?.budget_carry_city || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr><td style={{ padding: "0.15rem 0" }}>외부사업비</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_external || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>📁 비목별 예산 세부 배정</span>
                          {renderBudgetCategoriesDiff(selectedRequest.changes.before.years?.[selectedYear]?.budget_categories)}
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem" }}>📅 월별 추진 일정 (PDCA)</span>
                          {renderTimelineDiff(selectedRequest.changes.before.timeline)}
                        </div>

                        {(showTarget1 || showTarget2 || showTarget3) && (
                          <div>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>🎯 실적 목표치</span>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                              <tbody>
                                {showTarget1 && (
                                  <tr style={{ borderBottom: (showTarget2 || showTarget3) ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_participants_name || "참여인원"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_participants || 0} {selectedRequest.changes.before.target_participants_unit || "명"}</td></tr>
                                )}
                                {showTarget2 && (
                                  <tr style={{ borderBottom: showTarget3 ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_developments_name || "개발건수"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_developments || 0} {selectedRequest.changes.before.target_developments_unit || "건"}</td></tr>
                                )}
                                {showTarget3 && (
                                  <tr><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_etc_name || "기타"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_etc || 0} {selectedRequest.changes.before.target_etc_unit || "개"}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>👥 참여대상 및 부서</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>참여대상: {selectedRequest.changes.before.targetAudience || "미입력"} | 부서: {selectedRequest.changes.before.coopDept || "미입력"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 변경 후 (After) */}
                    <div style={{ border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.015)" }}>
                      <h4 style={{ margin: "0 0 0.6rem 0", color: "#34D399", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid rgba(16, 185, 129, 0.1)", paddingBottom: "0.3rem" }}>
                        🟢 변경 후 ({afterVersion})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>💰 재원별 예산 배정</span>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <tbody>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>국고 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_national || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.after.years?.[selectedYear]?.budget_carry_national || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>시비 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_city || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.after.years?.[selectedYear]?.budget_carry_city || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr><td style={{ padding: "0.15rem 0" }}>외부사업비</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_external || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>📁 비목별 예산 세부 배정</span>
                          {renderBudgetCategoriesDiff(selectedRequest.changes.after.years?.[selectedYear]?.budget_categories)}
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem" }}>📅 월별 추진 일정 (PDCA)</span>
                          {renderTimelineDiff(selectedRequest.changes.after.timeline)}
                        </div>

                        {(showTarget1 || showTarget2 || showTarget3) && (
                          <div>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>🎯 실적 목표치</span>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                              <tbody>
                                {showTarget1 && (
                                  <tr style={{ borderBottom: (showTarget2 || showTarget3) ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_participants_name || "참여인원"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_participants || 0} {selectedRequest.changes.after.target_participants_unit || "명"}</td></tr>
                                )}
                                {showTarget2 && (
                                  <tr style={{ borderBottom: showTarget3 ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_developments_name || "개발건수"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_developments || 0} {selectedRequest.changes.after.target_developments_unit || "건"}</td></tr>
                                )}
                                {showTarget3 && (
                                  <tr><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_etc_name || "기타"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_etc || 0} {selectedRequest.changes.after.target_etc_unit || "개"}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>👥 참여대상 및 부서</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>참여대상: {selectedRequest.changes.after.targetAudience || "미입력"} | 부서: {selectedRequest.changes.after.coopDept || "미입력"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단 결재 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "1rem", flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                  >
                    닫기
                  </button>
                  {selectedRequest.status === "승인대기" && (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleApproveRequest(selectedRequest)}
                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", background: "#10B981" }}
                      >
                        승인 처리
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleRejectRequest(selectedRequest)}
                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", background: "#EF4444" }}
                      >
                        반려 처리
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ============================================================================ */}
        {/* 💡 [교육용 한글 주석] 승인자 전용의 공간 예약 일시 조정/변경 모달 */}
        {/* ============================================================================ */}
        {isEditTimeModalOpen && editingRes && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}>
            <div style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "0.75rem",
              width: "350px",
              padding: "1.25rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              margin: "auto",
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "0.85rem", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={18} /> ⏱️ 예약 일시 변경 (조율 권한)
              </h3>
              <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
                승인권자 권한으로 예약 신청 건의 사용 시간과 날짜를 조정합니다.
              </p>

              <form onSubmit={handleSaveEditedTime} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label htmlFor="a11y-app-24" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약일자</label>
                  <input id="a11y-app-1"
                    type="date"
                    value={editResFormData.reserved_date}
                    onChange={(e) => setEditResFormData(prev => ({ ...prev, reserved_date: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <label htmlFor="a11y-app-2" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>시작 시간</label>
                    <input id="a11y-app-2"
                      type="time"
                      value={editResFormData.start_time}
                      onChange={(e) => setEditResFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      required
                      style={{ width: "100%", padding: "0.45rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-app-3" style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>종료 시간</label>
                    <input id="a11y-app-3"
                      type="time"
                      value={editResFormData.end_time}
                      onChange={(e) => setEditResFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      required
                      style={{ width: "100%", padding: "0.45rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditTimeModalOpen(false);
                      setEditingRes(null);
                    }}
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 탭 개편: 반응형 사이드 2분할 레이아웃 및 목표치/실적 미니 표 */}
        {activeTab === "kpis" && (
          <>
            {/* 성과지표 관리 서브탭 내비게이션 바 (예산 탭바와 스타일 완전 대칭화) */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem", width: "100%" }}>
              {(menuVisibility.kpi_status !== false || isSongDirector) && (
                <button
                  onClick={() => {
                    setKpiSubTab("공통");
                    // 공통 탭에 해당하는 첫 번째 지표 자동 선택
                    const first = displayProjects.flatMap((p: LegacyAppRecord) => p.units.flatMap((u: LegacyAppRecord) => u.kpis)).find((k: LegacyAppRecord) => k.type === "공통");
                    setSelectedKpi(first || null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    color: kpiSubTab === "공통" ? "var(--accent-color)" : (menuVisibility.kpi_status === false ? "#EF4444" : "var(--text-secondary)"),
                    borderBottom: kpiSubTab === "공통" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  (교육부)공통성과지표
                  {menuVisibility.kpi_status === false && (
                    <span style={{ fontSize: "0.6rem", color: "#EF4444", fontWeight: "800", marginLeft: "3px" }}>[숨김]</span>
                  )}
                </button>
              )}
              {(menuVisibility.kpi_self !== false || isSongDirector) && (
                <button
                  onClick={() => {
                    setKpiSubTab("자율");
                    // 자율 탭에 해당하는 첫 번째 지표 자동 선택
                    const first = displayProjects.flatMap((p: LegacyAppRecord) => p.units.flatMap((u: LegacyAppRecord) => u.kpis)).find((k: LegacyAppRecord) => k.type === "자율");
                    setSelectedKpi(first || null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    color: kpiSubTab === "자율" ? "var(--accent-color)" : (menuVisibility.kpi_self === false ? "#EF4444" : "var(--text-secondary)"),
                    borderBottom: kpiSubTab === "자율" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  (지자체)자율성과지표
                  {menuVisibility.kpi_self === false && (
                    <span style={{ fontSize: "0.6rem", color: "#EF4444", fontWeight: "800", marginLeft: "3px" }}>[숨김]</span>
                  )}
                </button>
              )}
              {(menuVisibility.kpi_focus !== false || isSongDirector) && (
                <button
                  onClick={() => {
                    setKpiSubTab("중점");
                    // 중점 탭에 해당하는 첫 번째 지표 자동 선택
                    const first = displayProjects.flatMap((p: LegacyAppRecord) => p.units.flatMap((u: LegacyAppRecord) => u.kpis)).find((k: LegacyAppRecord) => k.type === "중점");
                    setSelectedKpi(first || null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    color: kpiSubTab === "중점" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: kpiSubTab === "중점" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  (대학)중점관리지표
                </button>
              )}
            </div>

            {/* 성과지표 관리 탭: 전체 영역을 Fragment로 묶어 하단에 성과지표 전용 엑셀 업로더를 배치합니다. */}
            <div className="kpi-split-layout" style={{ marginTop: "1rem" }}>
              {/* 좌측 성과지표 리스트 테이블 */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>

                <div className="table-panel">
                  <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>지표 ID</th>
                        <th>지표명</th>
                        <th>유형</th>
                        <th>현재달성도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const kpiMap = new Map();
                        if (displayProjects && Array.isArray(displayProjects)) {
                          displayProjects.forEach((p: LegacyAppRecord) => {
                            if (p.units && Array.isArray(p.units)) {
                              p.units.forEach((u: LegacyAppRecord) => {
                                if (u.kpis && Array.isArray(u.kpis)) {
                                  u.kpis.forEach((k: LegacyAppRecord) => {
                                    if (k.type === kpiSubTab) {
                                      const nk = getNormalizedKpi(k, selectedYear);
                                      if (nk) kpiMap.set(nk.id, { k, nk });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }

                        const sortedKpis = Array.from(kpiMap.values()).sort((a, b) => {
                          const prefixA = a.nk.id.startsWith("C-") ? "C" : "L";
                          const prefixB = b.nk.id.startsWith("C-") ? "C" : "L";
                          if (prefixA !== prefixB) {
                            return prefixA.localeCompare(prefixB);
                          }
                          const numA = parseInt(a.nk.id.replace("L-", "").replace("C-", ""), 10) || 0;
                          const numB = parseInt(b.nk.id.replace("L-", "").replace("C-", ""), 10) || 0;
                          return numA - numB;
                        });

                        return sortedKpis.map(({ k: _k, nk }) => {
                          let rate = 0;
                          if (selectedYear === 1 && nk.id === "L-1") {
                            rate = 111.9;
                          } else if (selectedYear === 1 && nk.id === "L-2") {
                            rate = 687.8;
                          } else if (selectedYear === 1 && nk.id === "L-3") {
                            rate = 138.6;
                          } else if (selectedYear === 1 && nk.id === "L-4") {
                            rate = 146.7;
                          } else if (selectedYear === 1 && nk.id === "L-5") {
                            rate = 81.8;
                          } else if (selectedYear === 1 && nk.id === "L-6") {
                            rate = 103.3;
                          } else if (selectedYear === 1 && nk.id === "L-7") {
                            rate = 321.3;
                          } else if (selectedYear === 1 && nk.id === "L-8") {
                            rate = 134.0;
                          } else if (selectedYear === 1 && nk.id === "L-9") {
                            rate = 106.0;
                          } else if (selectedYear === 1 && nk.id === "L-10") {
                            rate = 128.5;
                          } else if (selectedYear === 1 && nk.id === "L-11") {
                            rate = 160.0;
                          } else if (selectedYear === 1 && nk.id === "L-12") {
                            rate = 114.6;
                          } else if (selectedYear === 1 && nk.id === "L-13") {
                            rate = 108.0;
                          } else if (selectedYear === 1 && nk.id === "L-14") {
                            rate = 500.0;
                          } else if (selectedYear === 1 && nk.id === "L-15") {
                            rate = 132.2;
                          } else if (selectedYear === 1 && nk.id === "L-16") {
                            rate = 123.3;
                          } else if (selectedYear === 1 && nk.id === "L-17") {
                            rate = 0.0;
                          } else if (selectedYear === 1 && nk.id === "L-18") {
                            rate = 176.5;
                          } else if (selectedYear === 1 && nk.id === "L-19") {
                            rate = 244.0;
                          } else if (selectedYear === 1 && nk.id === "L-20") {
                            rate = 202.5;
                          } else if (selectedYear === 1 && nk.id === "L-21") {
                            rate = 100.0;
                          } else if (selectedYear === 1 && nk.id === "L-22") {
                            rate = 175.0;
                          } else if (selectedYear === 1 && nk.id === "L-23") {
                            rate = 144.3;
                          } else if (selectedYear === 1 && nk.id === "L-24") {
                            rate = 138.3;
                          } else if (nk.subItems && nk.subItems.length > 0) {
                            let sumRate = 0;
                            nk.subItems.forEach((sub: LegacyAppRecord) => {
                              const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                              sumRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                            });
                            rate = sumRate / nk.subItems.length;
                          } else {
                            rate = nk.target > 0 ? (nk.current / nk.target) * 100 : 0;
                          }
                          const isSelected = selectedKpi?.id === nk.id;
                          return (
                            <tr
                              aria-label={`${nk.name} KPI 선택`}
                              key={nk.id}
                              onClick={() => setSelectedKpi(nk)}
                              style={{
                                cursor: "pointer",
                                background: isSelected ? "rgba(59,130,246,0.08)" : "inherit",
                                borderLeft: isSelected ? "4px solid var(--accent-color)" : "none",
                                transition: "all 0.2s ease"
                              }}
                             role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{nk.id}</td>
                              <td style={{ fontWeight: isSelected ? "700" : "normal" }}>{nk.name}</td>
                              <td>
                                <span className={`badge ${nk.type === "공통" ? "badge-green" : nk.type === "자율" ? "badge-blue" : "badge-yellow"}`}>
                                  {nk.type}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <div style={{ width: "50px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ width: `${Math.min(rate, 100)}%`, height: "100%", background: rate >= 100 ? "var(--success-color)" : "var(--warning-color)" }} />
                                  </div>
                                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", color: rate >= 100 ? "var(--success-color)" : "inherit" }}>
                                    {rate.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 우측 성과지표 세부내용 상세 블록 (Sticky 고정 스크롤 효과) */}
              <div className="sticky-panel">
                <div className="glass-card" style={{ border: selectedKpi ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)", minHeight: "360px" }}>
                  {selectedKpi ? (() => {
                    const nk = getNormalizedKpi(selectedKpi, selectedYear);
                    if (!nk) return null;
                    return (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.75rem" }}>
                          <span className="badge badge-blue" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                            {nk.id}
                          </span>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>{nk.name} 상세 명세</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                          <div>
                            <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold", display: "block" }}>지표 정의</span>
                            <p style={{ fontSize: "0.85rem", fontWeight: "700", marginTop: "0.2rem", lineHeight: "1.4" }}>
                              {nk.description}
                            </p>
                          </div>

                          {/* 세부지표 목푯값 및 실적값을 보여주는 미니 표 추가 */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                              <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold" }}>지표 구성 세부항목 목표 대비 실적 표</span>
                              <span className="badge badge-yellow" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>{selectedYear}차년도 세부지표</span>
                            </div>
                            <table className="mini-table" style={{ fontSize: "0.75rem" }}>
                              <thead>
                                <tr>
                                  <th>세부 항목명</th>
                                  <th style={{ textAlign: "right" }}>기준값</th>
                                  <th style={{ textAlign: "right" }}>목푯값</th>
                                  <th style={{ textAlign: "right" }}>현재실적</th>
                                  <th style={{ textAlign: "right" }}>달성도</th>
                                </tr>
                              </thead>
                              <tbody>
                                {nk.subItems && nk.subItems.map((sub: LegacyAppRecord, index: number) => {
                                  const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                  const subRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                  const canEditTarget = currentRole.rank <= 4;
                                  const cleanName = sub.name.replace(/\s*\(기준값:\s*\d+\)/, "");
                                  const letter = String.fromCharCode(65 + index); // 0 -> A, 1 -> B, 2 -> C ...
                                  return (
                                    <tr key={sub.id}>
                                      <td style={{ fontWeight: "700" }}>{`[${letter}] ${cleanName}`}</td>
                                      <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>
                                        {sub.base !== undefined ? `${sub.base.toLocaleString()} ${sub.unit}` : "-"}
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                          <input id="a11y-app-24"
                                            aria-label={`${cleanName} ${selectedYear}차년도 목표값`}
                                            type="number"
                                            step="any"
                                            className="user-selector"
                                            disabled={!canEditTarget}
                                            defaultValue={yData.target}
                                            min="0"
                                            onBlur={(e) => {
                                              if (!canEditTarget) return;
                                              let val = parseFloat(e.target.value);
                                              if (!isNaN(val)) {
                                                if (val < 0) {
                                                  val = 0;
                                                  e.target.value = "0";
                                                }
                                                handleUpdateKpiValue(sub.id, "target", val);
                                              }
                                            }}
                                            style={{
                                              width: "55px",
                                              textAlign: "right",
                                              fontSize: "0.75rem",
                                              padding: "0.1rem 0.2rem",
                                              background: !canEditTarget ? "rgba(128, 128, 128, 0.25)" : "rgb(128, 128, 128)",
                                              color: !canEditTarget ? "rgba(255, 255, 255, 0.4)" : "white",
                                              border: "1px solid var(--border-color)",
                                              borderRadius: "0.25rem",
                                              cursor: !canEditTarget ? "not-allowed" : "text"
                                            }}
                                          />
                                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{sub.unit}</span>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                          <input
                                            aria-label={`${cleanName} ${selectedYear}차년도 현재값`}
                                            type="number"
                                            step="any"
                                            className="user-selector"
                                            defaultValue={yData.current}
                                            min="0"
                                            onBlur={(e) => {
                                              let val = parseFloat(e.target.value);
                                              if (!isNaN(val)) {
                                                if (val < 0) {
                                                  val = 0;
                                                  e.target.value = "0";
                                                }
                                                handleUpdateKpiValue(sub.id, "current", val);
                                              }
                                            }}
                                            style={{
                                              width: "55px",
                                              textAlign: "right",
                                              fontSize: "0.75rem",
                                              padding: "0.1rem 0.2rem",
                                              background: "rgb(128, 128, 128)",
                                              color: "white",
                                              border: "1px solid var(--border-color)",
                                              borderRadius: "0.25rem"
                                            }}
                                          />
                                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{sub.unit}</span>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "800", color: subRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                        {subRate.toFixed(1)}%
                                      </td>
                                    </tr>
                                  );
                                })}
                                {(() => {
                                  let totalKpiRate = 0;
                                  if (selectedYear === 1 && nk.id === "L-1") {
                                    totalKpiRate = 111.9;
                                  } else if (selectedYear === 1 && nk.id === "L-2") {
                                    totalKpiRate = 687.8;
                                  } else if (selectedYear === 1 && nk.id === "L-3") {
                                    totalKpiRate = 138.6;
                                  } else if (selectedYear === 1 && nk.id === "L-4") {
                                    totalKpiRate = 146.7;
                                  } else if (selectedYear === 1 && nk.id === "L-5") {
                                    totalKpiRate = 81.8;
                                  } else if (selectedYear === 1 && nk.id === "L-6") {
                                    totalKpiRate = 103.3;
                                  } else if (selectedYear === 1 && nk.id === "L-7") {
                                    totalKpiRate = 321.3;
                                  } else if (selectedYear === 1 && nk.id === "L-8") {
                                    totalKpiRate = 134.0;
                                  } else if (selectedYear === 1 && nk.id === "L-9") {
                                    totalKpiRate = 106.0;
                                  } else if (selectedYear === 1 && nk.id === "L-10") {
                                    totalKpiRate = 128.5;
                                  } else if (selectedYear === 1 && nk.id === "L-11") {
                                    totalKpiRate = 160.0;
                                  } else if (selectedYear === 1 && nk.id === "L-12") {
                                    totalKpiRate = 114.6;
                                  } else if (selectedYear === 1 && nk.id === "L-13") {
                                    totalKpiRate = 108.0;
                                  } else if (selectedYear === 1 && nk.id === "L-14") {
                                    totalKpiRate = 500.0;
                                  } else if (selectedYear === 1 && nk.id === "L-15") {
                                    totalKpiRate = 132.2;
                                  } else if (selectedYear === 1 && nk.id === "L-16") {
                                    totalKpiRate = 123.3;
                                  } else if (selectedYear === 1 && nk.id === "L-17") {
                                    totalKpiRate = 0.0;
                                  } else if (selectedYear === 1 && nk.id === "L-18") {
                                    totalKpiRate = 176.5;
                                  } else if (selectedYear === 1 && nk.id === "L-19") {
                                    totalKpiRate = 244.0;
                                  } else if (selectedYear === 1 && nk.id === "L-20") {
                                    totalKpiRate = 202.5;
                                  } else if (selectedYear === 1 && nk.id === "L-21") {
                                    totalKpiRate = 100.0;
                                  } else if (selectedYear === 1 && nk.id === "L-22") {
                                    totalKpiRate = 175.0;
                                  } else if (selectedYear === 1 && nk.id === "L-23") {
                                    totalKpiRate = 144.3;
                                  } else if (selectedYear === 1 && nk.id === "L-24") {
                                    totalKpiRate = 138.3;
                                  } else if (nk.subItems && nk.subItems.length > 0) {
                                    let sumKpiRate = 0;
                                    nk.subItems.forEach((sub: LegacyAppRecord) => {
                                      const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                      sumKpiRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                    });
                                    totalKpiRate = sumKpiRate / nk.subItems.length;
                                  }
                                  const finalCapRate = Math.min(totalKpiRate, 100.0);
                                  return (
                                    <tr style={{ background: "rgba(59,130,246,0.06)", borderTop: "1px solid var(--border-color-dark)" }}>
                                      <td colSpan={2} style={{ fontWeight: "800" }}>종합 지표 달성도 (Total)</td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)" }}>100.0%</td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)", color: "var(--accent-color)", fontWeight: "700" }}>{totalKpiRate.toFixed(1)}%</td>
                                      <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "900", color: finalCapRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                        {finalCapRate.toFixed(1)}%
                                      </td>
                                    </tr>
                                  );
                                })()}
                              </tbody>
                            </table>
                          </div>

                          <div>
                            <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold", display: "block", marginBottom: "0.4rem" }}>성과지표 산출공식 및 세부산식 분석</span>
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", padding: "0.6rem 0.8rem", borderRadius: "0.375rem" }}>
                              <div style={{ marginBottom: "0.5rem" }}>
                                <RenderLatexFormula formula={nk.formula} />
                              </div>
                              {nk.type === "공통" && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                  <p style={{ fontWeight: "800", color: "#60a5fa", marginBottom: "0.25rem" }}>💡 교육부 RISE 공통성과지표 상세 가이드</p>
                                  <p>• <strong>평가 메커니즘</strong>: 단순 실적 달성도가 아닌, <strong>2024년 기준연도 대비 당해연도의 순 증가 비율(성장률)</strong>을 계산합니다.</p>
                                  <p>• <strong>산식 세부 분석</strong>:
                                    {nk.id === "C-1" && " 지자체 대표과제 성과 달성도 평균수식을 적용하여 각 대표과제의 개별 목표 달성률의 평균을 냅니다."}
                                    {nk.id === "C-2" && " 지산학연 연계 건수 및 연구 계약 체결 금액의 기준연도(24년) 총합 대비 성장 비율을 구합니다."}
                                    {nk.id === "C-3" && " 대학 평생직업교육 수료생 수 및 정원외 전형 입학생 수의 24년 모수 대비 증가율을 측정합니다."}
                                    {nk.id === "C-4" && " 졸업자 중 울산광역시 및 인접 관내 취업자의 절대 인원 증가 추이를 백분율로 추적합니다."}
                                    {nk.id === "C-5" && " RISE 지산학 협력체계 만족도 평점의 24년 기초 조사 평점 대비 성장 추이를 측정합니다."}
                                    {nk.id === "C-6" && " 대학 경제 영향력 평가(IMPACT) 모델에 따른 지역 경제 생산 유발 효과(억원)의 향상률을 계산합니다."}
                                  </p>
                                  <p style={{ marginTop: "0.25rem" }}>• <strong>지표 활용시기</strong>: {
                                    nk.id === "C-1" || nk.id === "C-2" || nk.id === "C-3"
                                      ? "2차년도 중간평가 및 5차년도 종합평가에 모두 활용됩니다."
                                      : "5차년도 최종 종합평가 시에만 활용되는 중장기 결과지표입니다."
                                  }</p>
                                </div>
                              )}
                              {nk.type === "자율" && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                  <p style={{ fontWeight: "800", color: "#ec4899", marginBottom: "0.25rem" }}>💡 지자체(울산) 자율성과지표 안내</p>
                                  <p>• <strong>평가 메커니즘</strong>: 울산 RISE 비전 및 지역 주도 대학지원을 위해 시도와 대학이 합의하여 지정한 정량 지표입니다.</p>
                                  <p>• <strong>활용 시기</strong>: 매년 실시되는 지자체 자체평가 및 교육부의 연차점검, 중간·종합평가 시 연차별 달성도가 전면 반영됩니다.</p>
                                </div>
                              )}
                              {nk.type === "중점" && (
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                  <p style={{ fontWeight: "800", color: "#f472b6", marginBottom: "0.25rem" }}>💡 대학 중점관리지표 안내</p>
                                  <p>• <strong>평가 메커니즘</strong>: 대학 강점·특성화 분야 육성 및 경쟁력 제고를 목적으로 대학이 설정한 집중 관리 핵심성과지표입니다.</p>
                                  <p>• <strong>활용 시기</strong>: 대학 자체 성과관리 환류 및 시도 컨설팅 환류 지표로 연중 활용됩니다.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem" }}>
                            <div>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>주관 부서</span>
                              <p style={{ fontWeight: "700" }}>{nk.owner}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>측정 주기</span>
                              <p style={{ fontWeight: "700" }}>{nk.cycle}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", color: "var(--text-secondary)", gap: "0.5rem" }}>
                      <HelpCircle size={32} style={{ color: "var(--accent-color)" }} />
                      <span style={{ fontSize: "0.8rem" }}>좌측 목록의 성과지표 행을 클릭하시면 상세 비교 정보가 나타납니다.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "agreements" && (
          <div className="agreements-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 협약·발급 관리 본문 가로 탭바 헤더 (예산 탭바와 스타일 완전 대칭화) */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setAgreementsSubTab("agreements")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: agreementsSubTab === "agreements" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: agreementsSubTab === "agreements" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                협약 관리
              </button>
              <button
                onClick={() => setAgreementsSubTab("unified_certificates")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: agreementsSubTab === "unified_certificates" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: agreementsSubTab === "unified_certificates" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                상장·이수증 관리
              </button>
              <button
                onClick={() => setAgreementsSubTab("scholarships")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: agreementsSubTab === "scholarships" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: agreementsSubTab === "scholarships" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                장학금 관리
              </button>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              {/* 협약서 서브탭 활성화 시 협약서 단독 매니저 마운트 */}
              {agreementsSubTab === "agreements" && (
                <React.Suspense fallback={null}>
                  <AgreementManager
                    key={`agreement-${darkMode}-${selectedYear}`}
                    projects={displayProjects}
                    agreements={agreements as AgreementItem[]}
                    selectedYear={selectedYear}
                    onAddAgreement={handleAddAgreement}
                    onUpdateAgreement={handleUpdateAgreement}
                    onDeleteAgreement={handleDeleteAgreement}
                    setAgreements={setAgreements as React.Dispatch<React.SetStateAction<AgreementItem[]>>}
                    currentRole={currentRole}
                  />
                </React.Suspense>
              )}

              {/* 통합 상장/이수증 서브탭 활성화 시 통합 매니저 마운트 */}
              {agreementsSubTab === "unified_certificates" && (
                <React.Suspense fallback={null}>
                  <UnifiedCertificateManager
                    key={`unified-certificate-${darkMode}-${selectedYear}`}
                    projects={displayProjects}
                    certificates={unifiedCertificates}
                    selectedYear={selectedYear}
                    onAddCertificate={handleAddUnifiedCertificate}
                    onUpdateCertificate={handleUpdateUnifiedCertificate}
                    onDeleteCertificate={handleDeleteUnifiedCertificate}
                    setCertificates={setUnifiedCertificates}
                    currentRole={currentRole}
                    members={members}
                  />
                </React.Suspense>
              )}

              {/* 장학금 관리 서브탭 활성화 시 장학금 매니저 마운트 */}
              {agreementsSubTab === "scholarships" && (
                <React.Suspense fallback={null}>
                  <ScholarshipManager
                    key={`scholarship-${darkMode}-${selectedYear}`}
                    scholarships={scholarships as ScholarshipItem[]}
                    setScholarships={setScholarships as React.Dispatch<React.SetStateAction<ScholarshipItem[]>>}
                    selectedYear={selectedYear}
                    currentRole={currentRole}
                    members={members}
                  />
                </React.Suspense>
              )}
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="progress-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 프로그램 진행 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setProgressSubTab("progress_status")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: progressSubTab === "progress_status" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: progressSubTab === "progress_status" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                프로그램 진행 상황
              </button>
              <button
                onClick={() => setProgressSubTab("major_programs")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: progressSubTab === "major_programs" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: progressSubTab === "major_programs" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                주요 프로그램
              </button>
              <button
                onClick={() => setProgressSubTab("satisfaction_survey")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: progressSubTab === "satisfaction_survey" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: progressSubTab === "satisfaction_survey" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                만족도 조사
              </button>
            </div>

            {/* 본문 콘텐츠 스위칭 */}
            {progressSubTab === "progress_status" ? (
              <ProgramProgressManager
                projects={displayProjects as ProjectData[]}
                selectedYear={selectedYear}
                darkMode={darkMode}
                onUpdateProgramDetails={handleUpdateProgramDetails}
                onSelectProgram={(unitId, progId) => {
                  setActiveTab("projects");
                  setProjectsSubTab("program_mgmt");
                  setSelectedUnitId(unitId);
                  setSelectedProgId(progId);
                }}
              />
            ) : progressSubTab === "major_programs" ? (
              <React.Suspense fallback={null}>
                <MajorProgramsManager
                  key={`major-prog-${darkMode}-${selectedYear}`}
                  selectedYear={selectedYear}
                />
              </React.Suspense>
            ) : (
              <React.Suspense fallback={null}>
                <SatisfactionManager
                  key={`satisfaction-${darkMode}`}
                  selectedYear={selectedYear}
                />
              </React.Suspense>
            )}
          </div>
        )}

        {activeTab === "budget" && (
          <div className="budget-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 예산 관리 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setBudgetSubTab("total_investment")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: budgetSubTab === "total_investment" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: budgetSubTab === "total_investment" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                총괄 투자 계획
              </button>
              <button
                onClick={() => setBudgetSubTab("budget_categories")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: budgetSubTab === "budget_categories" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: budgetSubTab === "budget_categories" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                비목별 관리
              </button>
              <button
                onClick={() => setBudgetSubTab("execution_rate")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: budgetSubTab === "execution_rate" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: budgetSubTab === "execution_rate" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                집행률 관리
              </button>
            </div>

            {/* 본문 콘텐츠 스위칭 */}
            {budgetSubTab === "total_investment" ? (
              <TotalInvestmentManager
                investmentSubTab={investmentSubTab}
                onChangeInvestmentSubTab={setInvestmentSubTab}
                projects={projects}
                selectedYear={selectedYear}
                darkMode={darkMode}
              />
            ) : budgetSubTab === "budget_categories" ? (
              <BudgetItemsManager
                key={`budget-items-${darkMode}-${selectedYear}`}
                projects={displayProjects as ProjectData[]}
                currentRole={currentRole}
                onUpdateBudgetDetails={handleUpdateBudgetDetails}
                selectedYear={selectedYear}
              />
            ) : budgetSubTab === "execution_rate" ? (
              <React.Suspense fallback={null}>
                <BudgetExecutionManager
                  key={`budget-exec-${darkMode}-${selectedYear}`}
                  projects={displayProjects as ProjectData[]}
                  currentRole={currentRole}
                  selectedYear={selectedYear}
                  supabase={supabase}
                  darkMode={darkMode}
                />
              </React.Suspense>
            ) : null}
          </div>
        )}

        {activeTab === "asset" && (
          <div className="asset-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            <React.Suspense fallback={null}>
              <AssetManager
                currentRole={currentRole}
                currentUser={currentUser}
                activeSubTab={assetSubTab}
                onChangeSubTab={setAssetSubTab}
                darkMode={darkMode}
                selectedYear={selectedYear}
              />
            </React.Suspense>
          </div>
        )}

        {activeTab === "committee" && (
          <div className="committee-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            <CommitteeManager
              currentRole={currentRole}
              currentUser={currentUser}
              activeSubTab={committeeSubTab}
              onChangeSubTab={setCommitteeSubTab}
              darkMode={darkMode}
              selectedYear={selectedYear}
              monthlySchedules={monthlySchedules}
              setMonthlySchedules={setMonthlySchedules}
              eventSchedules={eventSchedules}
              setEventSchedules={setEventSchedules}
              meetingSchedules={meetingSchedules}
              setMeetingSchedules={setMeetingSchedules}
              pressReleases={pressReleases}
              setPressReleases={setPressReleases}
              members={members as CommitteeMember[]}
            />
          </div>
        )}

        {activeTab === "procurement" && (
          <div className="procurement-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 구매용역 관리 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setProcurementSubTab("env_improvement")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: procurementSubTab === "env_improvement" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: procurementSubTab === "env_improvement" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                환경개선
              </button>
              <button
                onClick={() => setProcurementSubTab("equipment_purchase")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: procurementSubTab === "equipment_purchase" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: procurementSubTab === "equipment_purchase" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                기자재 구입∙운영
              </button>
              <button
                onClick={() => setProcurementSubTab("major_services")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: procurementSubTab === "major_services" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: procurementSubTab === "major_services" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                주요 용역
              </button>
            </div>

            {/* 본문 콘텐츠 */}
            <React.Suspense fallback={null}>
              <ProcurementManager
                key={`procurement-${darkMode}-${selectedYear}`}
                darkMode={darkMode}
                currentRole={currentRole}
                currentUser={currentUser}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                subTab={procurementSubTab}
                onChangeSubTab={setProcurementSubTab}
                envData={envData as ProcurementItem[]}
                setEnvData={setEnvData as React.Dispatch<React.SetStateAction<ProcurementItem[]>>}
                equipData={equipData as ProcurementItem[]}
                setEquipData={setEquipData as React.Dispatch<React.SetStateAction<ProcurementItem[]>>}
                serviceData={serviceData as ProcurementItem[]}
                setServiceData={setServiceData as React.Dispatch<React.SetStateAction<ProcurementItem[]>>}
                projects={displayProjects}
              />
            </React.Suspense>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="schedule-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 일정 관리 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setScheduleSubTab("monthly")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "monthly" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "monthly" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                월간 일정
              </button>
              <button
                onClick={() => setScheduleSubTab("events")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "events" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "events" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                주요 행사
              </button>
              <button
                onClick={() => setScheduleSubTab("meetings")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "meetings" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "meetings" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                회의결과 등록
              </button>

              <button
                onClick={() => setScheduleSubTab("press")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "press" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "press" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                언론보도
              </button>
            </div>

            {/* 본문 콘텐츠 */}
            <React.Suspense fallback={null}>
              <ScheduleManager
                key={`schedule-${darkMode}-${selectedYear}`}
                currentUser={currentUser}
                currentRole={currentRole}
                selectedYear={selectedYear}
                darkMode={darkMode}
                subTab={scheduleSubTab}
                onChangeSubTab={setScheduleSubTab}
                monthlySchedules={monthlySchedules}
                setMonthlySchedules={setMonthlySchedules}
                eventSchedules={eventSchedules}
                setEventSchedules={setEventSchedules}
                meetingSchedules={meetingSchedules}
                setMeetingSchedules={setMeetingSchedules}
                pressReleases={pressReleases}
                setPressReleases={setPressReleases}
                members={members as ScheduleCommitteeMember[]}
              />
            </React.Suspense>
          </div>
        )}

        {activeTab === "llm_wiki" && (
          <LLMWiki selectedYear={selectedYear} darkMode={darkMode} />
        )}
      </main>

      {isMemberModalOpen && editingMember && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                👥 {editingMember.id ? "구성원 정보 수정" : "신규 구성원 등록"}
              </h3>
              <button
                aria-label="구성원 입력 창 닫기"
                type="button"
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMember(null);
                }}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingMember.name || !editingMember.email) {
                  alert("성명과 이메일은 필수 입력 사항입니다.");
                  return;
                }
                const oldMembers = [...members];
                if (editingMember.id) {
                  // 수정 처리
                  const updatedList = members.map((m) => (m.id === editingMember.id ? editingMember : m));
                  setMembers(updatedList);
                  try {
                    const sanitized = sanitizeMemberForDb(editingMember);
                    if (!sanitized) throw new Error("저장할 구성원 정보가 올바르지 않습니다.");
                    const { error } = await upsertRiseMember(sanitized);
                    if (error) throw error;
                  } catch (err) {
                    console.error("Failed to update member in DB:", err);
                    alert(`DB 저장 중 오류가 발생했습니다. (테이블 생성 여부 확인 필요): ${getErrorMessage(err)}`);
                    setMembers(oldMembers); // 롤백
                  }
                } else {
                  // 추가 처리
                  const newMember = {
                    ...editingMember,
                    id: `m-${Date.now()}`,
                    startDate: editingMember.startDate || "2026-03-01",
                    status: editingMember.status || "참여중"
                  };
                  setMembers([...members, newMember]);
                  try {
                    const sanitized = sanitizeMemberForDb(newMember);
                    if (!sanitized) throw new Error("추가할 구성원 정보가 올바르지 않습니다.");
                    const { error } = await insertRiseMember(sanitized);
                    if (error) throw error;
                  } catch (err) {
                    console.error("Failed to insert member into DB:", err);
                    alert(`DB 추가 중 오류가 발생했습니다. (테이블 생성 여부 확인 필요): ${getErrorMessage(err)}`);
                    setMembers(oldMembers); // 롤백
                  }
                }
                setIsMemberModalOpen(false);
                setEditingMember(null);
              }}
              style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
            >
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label htmlFor="a11y-app-4" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>성명 *</label>
                    <input id="a11y-app-4"
                      type="text"
                      required
                      className="form-input"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-app-5" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>소속 부서</label>
                    <select id="a11y-app-5"
                      className="form-select"
                      value={editingMember.dept}
                      onChange={(e) => setEditingMember({ ...editingMember, dept: e.target.value })}
                    >
                      <option value="-" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>-</option>
                      <option value="운영본부" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>운영본부</option>
                      <option value="사업운영팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>사업운영팀</option>
                      <option value="ECC센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>ECC센터</option>
                      <option value="ICC센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>ICC센터</option>
                      <option value="RCC센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>RCC센터</option>
                      <option value="AID-X지원센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>AID-X지원센터</option>
                      <option value="울산늘봄누리센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>울산늘봄누리센터</option>
                      <option value="신산업특화센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>신산업특화센터</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label htmlFor="a11y-app-6" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>직책(역할)</label>
                    <select id="a11y-app-6"
                      className="form-select"
                      value={editingMember.role}
                      onChange={(e) => {
                        const nextRole = e.target.value;
                        let nextGrade = "연구원";
                        if (["사업단장", "총괄본부장", "센터장", "운영팀장", "팀장교수"].includes(nextRole)) {
                          nextGrade = "정교수";
                        } else if (nextRole === "운영팀장") {
                          nextGrade = "부장";
                        }
                        setEditingMember({ ...editingMember, role: nextRole, grade: nextGrade });
                      }}
                    >
                      <option value="사업단장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>사업단장</option>
                      <option value="총괄본부장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>총괄본부장</option>
                      <option value="센터장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>센터장</option>
                      <option value="운영팀장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>운영팀장</option>
                      <option value="팀장교수" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>팀장교수</option>
                      <option value="연구원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>연구원</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="a11y-app-7" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>직급/직위</label>
                    <select id="a11y-app-7"
                      className="form-select"
                      value={editingMember.grade}
                      onChange={(e) => setEditingMember({ ...editingMember, grade: e.target.value })}
                    >
                      {["사업단장", "총괄본부장", "센터장", "운영팀장", "팀장교수"].includes(editingMember.role) ? (
                        <>
                          <option value="정교수" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>정교수</option>
                          <option value="부교수" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>부교수</option>
                          <option value="조교수" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>조교수</option>
                        </>
                      ) : (
                        <>
                          <option value="부장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>부장</option>
                          <option value="차장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>차장</option>
                          <option value="과장" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>과장</option>
                          <option value="대리" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>대리</option>
                          <option value="사원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>사원</option>
                          <option value="책임연구원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>책임연구원</option>
                          <option value="선임연구원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>선임연구원</option>
                          <option value="연구원" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>연구원</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="a11y-app-8" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>이메일 *</label>
                  <input id="a11y-app-8"
                    type="email"
                    required
                    className="form-input"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label htmlFor="a11y-app-9" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>교내 전화번호</label>
                    <input id="a11y-app-9"
                      type="text"
                      className="form-input"
                      placeholder="052-230-XXXX"
                      value={editingMember.phoneOffice}
                      onChange={(e) => setEditingMember({ ...editingMember, phoneOffice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-app-10" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>휴대전화번호</label>
                    <input id="a11y-app-10"
                      type="text"
                      className="form-input"
                      placeholder="010-XXXX-XXXX"
                      value={editingMember.phoneMobile}
                      onChange={(e) => setEditingMember({ ...editingMember, phoneMobile: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingMember.status !== "미참여"}
                    onChange={(e) => {
                      const isActive = e.target.checked;
                      setEditingMember({
                        ...editingMember,
                        status: isActive ? "참여중" : "미참여",
                        endDate: isActive ? "" : (editingMember.endDate || "")
                      });
                    }}
                  />
                  <label htmlFor="is_active" style={{ fontWeight: "700", cursor: "pointer" }}>현재 사업단 참여중</label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label htmlFor="a11y-app-11" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>시작일</label>
                    <input id="a11y-app-11"
                      type="date"
                      className="form-input"
                      value={editingMember.startDate || editingMember.hireDate || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, startDate: e.target.value, hireDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-app-12" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>종료일</label>
                    <input id="a11y-app-12"
                      type="date"
                      className="form-input"
                      disabled={editingMember.status !== "미참여"}
                      value={editingMember.endDate || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", padding: "0.85rem 1.25rem", flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                  onClick={() => {
                    setIsMemberModalOpen(false);
                    setEditingMember(null);
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProgramEditor && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "450px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                🎯 {editingProgram ? "프로그램 수정" : "신규 프로그램 추가"}
              </h3>
              <button
                aria-label="프로그램 입력 창 닫기"
                type="button"
                onClick={() => setShowProgramEditor(false)}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label htmlFor="a11y-app-13" style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>단위과제 *</label>
                  <select id="a11y-app-13"
                    value={programForm.unitId}
                    onChange={(e) => setProgramForm({ ...programForm, unitId: e.target.value })}
                    className="form-select"
                    disabled={!!editingProgram}
                  >
                    <option value="" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>단위과제를 선택하세요</option>
                    {displayProjects.flatMap(p => p.units).map(u => (
                      <option key={u.id} value={u.id} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{u.id === "Common" ? "" : `${u.id}. `}{u.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="a11y-app-14" style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>프로그램 ID *</label>
                  <input id="a11y-app-14"
                    type="text"
                    value={programForm.id}
                    onChange={(e) => setProgramForm({ ...programForm, id: e.target.value })}
                    placeholder="예: 1-1, Common-1 등"
                    className="form-input"
                    disabled={!!editingProgram}
                  />
                </div>

                <div>
                  <label htmlFor="a11y-app-15" style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>프로그램명 *</label>
                  <input id="a11y-app-15"
                    type="text"
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    placeholder="프로그램명을 입력하세요"
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="a11y-app-16" style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>담당부서</label>
                  <select id="a11y-app-16"
                    value={programForm.dept}
                    onChange={(e) => setProgramForm({ ...programForm, dept: e.target.value })}
                    className="form-select"
                  >
                    <option value="사업운영팀" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>사업운영팀</option>
                    <option value="늘봄누리센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>늘봄누리센터</option>
                    <option value="신산업특화센터" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>신산업특화센터</option>
                    <option value="ECC" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>ECC</option>
                    <option value="ICC" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>ICC</option>
                    <option value="RCC" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>RCC</option>
                    <option value="AID-X" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>AID-X</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", padding: "0.85rem 1.25rem", flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                  onClick={() => setShowProgramEditor(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                  onClick={handleSaveProgram}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && currentUser && !isGuest && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form
            onSubmit={handlePasswordChange}
            className="glass-card"
            style={{ width: "400px", padding: "2rem", border: "1px solid var(--border-color)", background: "var(--bg-dark)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LockIcon size={20} style={{ color: "var(--accent-color)" }} />
              <span>개인정보 관리 (비밀번호 변경)</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8rem" }}>
              <div>
                <label htmlFor="a11y-app-17" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700", color: "var(--text-secondary)" }}>아이디 (이메일)</label>
                <input id="a11y-app-17"
                  type="text"
                  disabled
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "rgba(255,255,255,0.85)", background: "var(--input-bg)", cursor: "not-allowed" }}
                  value={currentUser.id}
                />
              </div>

              <div>
                <label htmlFor="a11y-app-18" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700", color: "var(--text-secondary)" }}>성명</label>
                <input id="a11y-app-18"
                  type="text"
                  disabled
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "rgba(255,255,255,0.85)", background: "var(--input-bg)", cursor: "not-allowed" }}
                  value={currentUser.name}
                />
              </div>

              <div>
                <label htmlFor="a11y-app-19" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>현재 비밀번호 *</label>
                <input id="a11y-app-19"
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.45rem 0.6rem", color: "#f3f4f6", background: "#1f2937", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  placeholder="현재 비밀번호를 입력해 주세요"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="a11y-app-20" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>새 비밀번호 *</label>
                <input id="a11y-app-20"
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.45rem 0.6rem", color: "#f3f4f6", background: "#1f2937", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  placeholder="새 비밀번호를 입력해 주세요"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="a11y-app-21" style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>새 비밀번호 확인 *</label>
                <input id="a11y-app-21"
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.45rem 0.6rem", color: "#f3f4f6", background: "#1f2937", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                  value={confirmNewPw}
                  onChange={(e) => setConfirmNewPw(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmNewPw("");
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
              >
                변경하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 💡 [총괄 투자 계획 매니저 컴포넌트 & 동적 데이터셋]
// ==========================================




// 문자열 내의 특수 점을 표준 가운데점(·)으로 통일하는 헬퍼
const normalizeCategoryName = (name: string) => {
  if (!name) return "";
  return name.replace(/[∙•]/g, "·").trim();
};

type InvestmentValue = { main: number; carry: number };
type InvestmentCategory = { name: string; values: InvestmentValue[] };
type AnnualInvestmentCategory = { name: string; values: number[] };
type TotalInvestmentManagerProps = {
  investmentSubTab: string;
  onChangeInvestmentSubTab: (tab: string) => void;
  projects: LegacyAppRecord[];
  selectedYear: number;
  darkMode: boolean;
};

function TotalInvestmentManager({ investmentSubTab, onChangeInvestmentSubTab, projects, selectedYear, darkMode }: TotalInvestmentManagerProps) {
  const [expandedUnits, setExpandedUnits] = React.useState<Record<string, boolean>>({});
  // PDF 다운로드 진행 상태 제어 (어느 탭에서 다운로드 중인지 기록)
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState<"five_year" | "annual" | null>(null);

  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. 모든 단위과제 수집 (정렬 포함)
  const allUnits: LegacyAppRecord[] = [];
  if (projects && Array.isArray(projects)) {
    projects.forEach((p: LegacyAppRecord) => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach((u: LegacyAppRecord) => {
          allUnits.push({
            ...u,
            projectTitle: p.title
          });
        });
      }
    });
  }

  // ID 기준으로 정렬 (Common은 맨 마지막에 위치하도록 함)
  allUnits.sort((a, b) => {
    if (a.id === "Common" || a.id === "X0") return 1;
    if (b.id === "Common" || b.id === "X0") return -1;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 비목 기본 정렬 기준 목록
  const CATEGORY_ORDER = [
    "인건비",
    "장학금",
    "교육·연구 프로그램 개발·운영비",
    "교육·연구 환경개선비",
    "실험·실습장비 및 기자재 구입·운영비",
    "지역 연계·협업 지원비",
    "기업 지원·협력 활동비",
    "성과 활용·확산 지원비",
    "그 밖의 사업운영비",
    "간접비"
  ];

  // ----------------------------------------------------
  // (1) 5개년 총괄 데이터 동적 계산 (단위: 백만원)
  // ----------------------------------------------------
  const TOTAL_INVESTMENT_5YEAR_DATA = allUnits.map((u) => {
    const unitTitle = u.id === "Common" ? "공통운영경비" : `${u.id}. ${u.title}`;

    // 연도별 예산 총액 (백만원 단위, {main, carry} 형태의 객체 반환)
    // 1~5차년도
    const annualTotals = [1, 2, 3, 4, 5].map((yr) => {
      return {
        main: (u.years?.[yr]?.budget_main || 0) / 1e6,
        carry: (u.years?.[yr]?.budget_carry || 0) / 1e6
      };
    });
    // 5개년 총합
    const fiveYearMainSum = annualTotals.reduce((sum, val) => sum + val.main, 0);
    const fiveYearCarrySum = annualTotals.reduce((sum, val) => sum + val.carry, 0);
    const totalRow = [...annualTotals, { main: fiveYearMainSum, carry: fiveYearCarrySum }];

    // 비목별 5개년 예산
    const categoriesMap: Record<string, InvestmentValue[]> = {};
    CATEGORY_ORDER.forEach((catName) => {
      categoriesMap[catName] = [1, 2, 3, 4, 5].map(() => ({ main: 0, carry: 0 })); // 1~5차년도
    });

    // 프로그램들을 순회하며 각 연도의 비목 데이터 합산
    if (u.programs && Array.isArray(u.programs)) {
      u.programs.forEach((prog: LegacyAppRecord) => {
        [1, 2, 3, 4, 5].forEach((yr) => {
          const bgCats = prog.years?.[yr]?.budget_categories || [];
          bgCats.forEach((cat: LegacyAppRecord) => {
            const normCat = normalizeCategoryName(cat.category);
            const matchedOrderCat = CATEGORY_ORDER.find(c => normalizeCategoryName(c) === normCat);
            if (matchedOrderCat) {
              const cleanBudget = typeof cat.budget === "string"
                ? parseFloat(cat.budget.replace(/,/g, ""))
                : Number(cat.budget || 0);
              const cleanCarry = typeof cat.budget_carry === "string"
                ? parseFloat(cat.budget_carry.replace(/,/g, ""))
                : Number(cat.budget_carry || 0);
              categoriesMap[matchedOrderCat][yr - 1].main += cleanBudget / 1e6;
              categoriesMap[matchedOrderCat][yr - 1].carry += cleanCarry / 1e6;
            }
          });
        });
      });
    }

    // 값이 0보다 큰 비목만 필터링하여 categories 구성
    const categories: InvestmentCategory[] = [];
    CATEGORY_ORDER.forEach((catName) => {
      const values = categoriesMap[catName];
      const mainSum = values.reduce((sum: number, val: InvestmentValue) => sum + val.main, 0);
      const carrySum = values.reduce((sum: number, val: InvestmentValue) => sum + val.carry, 0);
      const catSum = mainSum + carrySum;
      if (catSum > 0) {
        categories.push({
          name: catName,
          values: [...values, { main: mainSum, carry: carrySum }]
        });
      }
    });

    return {
      id: u.id,
      title: unitTitle,
      total: totalRow,
      categories: categories
    };
  });

  // ----------------------------------------------------
  // (2) 5개년 총괄 요약 영역 동적 계산 ({main, carry} 형태의 배열로 확장)
  // ----------------------------------------------------
  const summaryTotal = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryLabor = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryOperation = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryIndirect = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryOnlyOperation = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));

  TOTAL_INVESTMENT_5YEAR_DATA.forEach((uData) => {
    for (let i = 0; i < 6; i++) {
      summaryTotal[i].main += uData.total[i].main;
      summaryTotal[i].carry += uData.total[i].carry;
    }

    uData.categories.forEach((cat) => {
      const normCat = normalizeCategoryName(cat.name);
      if (normCat === "인건비") {
        for (let i = 0; i < 6; i++) {
          summaryLabor[i].main += cat.values[i].main;
          summaryLabor[i].carry += cat.values[i].carry;
        }
      } else if (normCat === "그 밖의 사업운영비" || normCat === "그 밖의 사업운영경비") {
        for (let i = 0; i < 6; i++) {
          summaryOperation[i].main += cat.values[i].main;
          summaryOperation[i].carry += cat.values[i].carry;
        }
      } else if (normCat === "간접비") {
        for (let i = 0; i < 6; i++) {
          summaryIndirect[i].main += cat.values[i].main;
          summaryIndirect[i].carry += cat.values[i].carry;
        }
      }
    });
  });

  // "총사업비 중 운영비" = "인건비" + "그 밖의 사업운영비" + "간접비"
  for (let i = 0; i < 6; i++) {
    summaryOnlyOperation[i].main = summaryLabor[i].main + summaryOperation[i].main + summaryIndirect[i].main;
    summaryOnlyOperation[i].carry = summaryLabor[i].carry + summaryOperation[i].carry + summaryIndirect[i].carry;
  }

  const TOTAL_INVESTMENT_SUMMARY_DATA = {
    total: summaryTotal,
    labor: summaryLabor,
    operation: summaryOperation,
    indirect: summaryIndirect,
    only_operation: summaryOnlyOperation
  };

  // ----------------------------------------------------
  // (3) 연차별 계획 (재원별) 데이터 동적 계산
  // ----------------------------------------------------
  const ANNUAL_INVESTMENT_DATA = allUnits.map((u) => {
    const unitTitle = u.id === "Common" ? "공통운영경비" : `${u.id}. ${u.title}`;

    let uNat = 0, uCity = 0, uExt = 0;
    if (u.programs && Array.isArray(u.programs)) {
      u.programs.forEach((prog: LegacyAppRecord) => {
        const py = prog.years?.[selectedYear] || {};
        uNat += (py.budget_national || 0) + (py.budget_carry_national || 0);
        uCity += (py.budget_city || 0) + (py.budget_carry_city || 0);
        uExt += (py.budget_external || 0) + (py.budget_carry_external || 0);
      });
    }

    const natKr = uNat / 1e6;
    const cityKr = uCity / 1e6;
    const extKr = uExt / 1e6;
    const sumKr = natKr + cityKr + extKr;

    // 단위과제 대로우의 비율은 100%로 고정
    // [국비, 시비, 외부사업비, 합계, 비율] -> 총 5개 요소
    const totalRow = [natKr, cityKr, extKr, sumKr, 100.0];

    // 비목별 재원 안분 계산
    const categoriesMap: Record<string, { national: number; city: number; external: number }> = {};
    CATEGORY_ORDER.forEach((catName) => {
      categoriesMap[catName] = { national: 0, city: 0, external: 0 };
    });

    if (u.programs && Array.isArray(u.programs)) {
      u.programs.forEach((prog: LegacyAppRecord) => {
        const py = prog.years?.[selectedYear] || {};
        const progBudgetMain = py.budget_main || 0;
        const progBudgetCarry = py.budget_carry || 0;

        // 안분 비율
        const natRatio = progBudgetMain > 0 ? (py.budget_national || 0) / progBudgetMain : 0;
        const cityRatio = progBudgetMain > 0 ? (py.budget_city || 0) / progBudgetMain : 0;
        const extRatio = progBudgetMain > 0 ? (py.budget_external || 0) / progBudgetMain : 0;

        const carryNatRatio = progBudgetCarry > 0 ? (py.budget_carry_national || 0) / progBudgetCarry : 0;
        const carryCityRatio = progBudgetCarry > 0 ? (py.budget_carry_city || 0) / progBudgetCarry : 0;
        const carryExtRatio = progBudgetCarry > 0 ? (py.budget_carry_external || 0) / progBudgetCarry : 0;

        const bgCats = py.budget_categories || [];
        bgCats.forEach((cat: LegacyAppRecord) => {
          const normCat = normalizeCategoryName(cat.category);
          const matchedOrderCat = CATEGORY_ORDER.find(c => normalizeCategoryName(c) === normCat);
          if (matchedOrderCat) {
            const catB = cat.budget ? parseFloat(String(cat.budget).replace(/,/g, "")) : 0;
            const catBC = cat.budget_carry ? parseFloat(String(cat.budget_carry).replace(/,/g, "")) : 0;

            // 재원 안분 적용
            const cNat = catB * natRatio + catBC * carryNatRatio;
            const cCity = catB * cityRatio + catBC * carryCityRatio;
            const cExt = catB * extRatio + catBC * carryExtRatio;

            categoriesMap[matchedOrderCat].national += cNat / 1e6;
            categoriesMap[matchedOrderCat].city += cCity / 1e6;
            categoriesMap[matchedOrderCat].external += cExt / 1e6;
          }
        });
      });
    }

    const categories: AnnualInvestmentCategory[] = [];
    CATEGORY_ORDER.forEach((catName) => {
      const cData = categoriesMap[catName];
      const catSum = cData.national + cData.city + cData.external;
      if (catSum > 0) {
        // 비목의 비율은 해당 단위과제 총합 예산(sumKr) 대비 비율
        const catRatio = sumKr > 0 ? (catSum / sumKr) * 100 : 0;
        categories.push({
          name: catName,
          // values 형식: [국비, 시비, 외부사업비, 합계, 비율] -> 총 5개 요소
          values: [cData.national, cData.city, cData.external, catSum, catRatio]
        });
      }
    });

    return {
      id: u.id,
      title: unitTitle,
      total: totalRow,
      categories: categories
    };
  });

  // ----------------------------------------------------
  // (4) 연차별 계획 요약 요율 및 합계 동적 계산
  // ----------------------------------------------------
  let annualTotalNat = 0;
  let annualTotalCity = 0;
  let annualTotalExt = 0;
  let annualTotalSum = 0;

  let annualLaborNat = 0, annualLaborCity = 0, annualLaborExt = 0, annualLaborSum = 0;
  let annualOpNat = 0, annualOpCity = 0, annualOpExt = 0, annualOpSum = 0;
  let annualIndNat = 0, annualIndCity = 0, annualIndExt = 0, annualIndSum = 0;

  ANNUAL_INVESTMENT_DATA.forEach((uData) => {
    annualTotalNat += uData.total[0];
    annualTotalCity += uData.total[1];
    annualTotalExt += uData.total[2];
    annualTotalSum += uData.total[3];

    uData.categories.forEach((cat) => {
      const normCat = normalizeCategoryName(cat.name);
      if (normCat === "인건비") {
        annualLaborNat += cat.values[0];
        annualLaborCity += cat.values[1];
        annualLaborExt += cat.values[2];
        annualLaborSum += cat.values[3];
      } else if (normCat === "그 밖의 사업운영비" || normCat === "그 밖의 사업운영경비") {
        annualOpNat += cat.values[0];
        annualOpCity += cat.values[1];
        annualOpExt += cat.values[2];
        annualOpSum += cat.values[3];
      } else if (normCat === "간접비") {
        annualIndNat += cat.values[0];
        annualIndCity += cat.values[1];
        annualIndExt += cat.values[2];
        annualIndSum += cat.values[3];
      }
    });
  });

  const annualLaborRatio = annualTotalSum > 0 ? (annualLaborSum / annualTotalSum) * 100 : 0;
  const annualOpRatio = annualTotalSum > 0 ? (annualOpSum / annualTotalSum) * 100 : 0;
  const annualIndRatio = annualTotalSum > 0 ? (annualIndSum / annualTotalSum) * 100 : 0;

  const annualOnlyOpNat = annualLaborNat + annualOpNat + annualIndNat;
  const annualOnlyOpCity = annualLaborCity + annualOpCity + annualIndCity;
  const annualOnlyOpExt = annualLaborExt + annualOpExt + annualIndExt;
  const annualOnlyOpSum = annualLaborSum + annualOpSum + annualIndSum;
  const annualOnlyOpRatio = annualTotalSum > 0 ? (annualOnlyOpSum / annualTotalSum) * 100 : 0;

  const targetYear = 2024 + selectedYear;

  // 천 단위 콤마 포맷팅 및 소수점 1자리 표기를 위한 공통 헬퍼 함수
  const formatValue = (val: number | null | undefined) => {
    if (val === undefined || val === null || val === 0) return "-";
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // 1) 5개년 총괄 PDF 다운로드 핸들러
  const handleExportFiveYearPDF = async () => {
    setIsDownloadingPdf("five_year");
    try {
      await new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `앵커사업비_5개년_총괄_투자계획_${targetYear}_${yyyy}${mm}${dd}.pdf`;

      // 💡 [요구사항 반영] 5개년 단위과제별 예산 합산 비율 차트 데이터 가공
      const fiveYearUnitTotals: Record<string, number> = {};
      let totalSumVal = 0;
      TOTAL_INVESTMENT_5YEAR_DATA.forEach(u => {
        const normId = getNormalizedUnitId(u.id);
        const totalObj = u.total[5] || { main: 0, carry: 0 };
        const val = (totalObj.main || 0) + (totalObj.carry || 0);
        if (val > 0) {
          fiveYearUnitTotals[normId] = (fiveYearUnitTotals[normId] || 0) + val;
          totalSumVal += val;
        }
      });

      const fiveYearChartItems = Object.entries(fiveYearUnitTotals).map(([id, val]) => {
        let displayName = id;
        if (id === "Common") displayName = "공통경비";
        else if (id === "X0") displayName = "X0(공통)";
        return {
          id,
          name: displayName,
          value: val,
          ratio: totalSumVal > 0 ? (val / totalSumVal) * 100 : 0,
          color: getUnitColor(id)
        };
      }).sort((a, b) => {
        const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        const posA = idxA === -1 ? 999 : idxA;
        const posB = idxB === -1 ? 999 : idxB;
        return posA - posB;
      });

      let barDivsHtml = "";
      let legendItemsHtml = "";
      fiveYearChartItems.forEach((item) => {
        if (item.value > 0) {
          barDivsHtml += `<div style="width: ${item.ratio}%; background: ${item.color}; height: 100%;"></div>`;
          legendItemsHtml += `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; margin-right: 12px; margin-bottom: 4px; white-space: nowrap;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.color}; display: inline-block; flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #111827;">${item.name}</span>
              <span style="color: #4b5563;">${item.ratio.toFixed(1)}%</span>
              <span style="color: #6b7280; font-size: 7.5px;">(${formatValue(item.value)})</span>
            </div>
          `;
        }
      });

      const progressBarHtml = `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; color: #111827;">📊 5개년 단위과제별 예산 합산 비율</span>
            <span style="font-size: 9px; color: #4b5563; font-weight: bold;">총 ${formatValue(totalSumVal)}백만 원</span>
          </div>
          <div style="width: 100%; height: 14px; display: flex; border-radius: 7px; overflow: hidden; background: #e5e7eb;">
            ${barDivsHtml}
          </div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 2px;">
            ${legendItemsHtml}
          </div>
        </div>
      `;

      let tableRowsHtml = "";
      TOTAL_INVESTMENT_5YEAR_DATA.forEach((u) => {
        const totalObj = u.total[5] || { main: 0, carry: 0 };
        const mainSum = (totalObj.main || 0) + (totalObj.carry || 0);

        tableRowsHtml += `
          <tr style="background: ${u.id === "Common" || u.id === "X0" ? "#fffbeb" : "#ffffff"}; font-weight: bold; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${u.title}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[0].main + u.total[0].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #1d4ed8;">${formatValue(u.total[1].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #047857;">${formatValue(u.total[1].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[2].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[3].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[4].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: #10b981;">${formatValue(mainSum)}</td>
          </tr>
        `;

        u.categories.forEach((cat) => {
          const catSum = (cat.values[5]?.main || 0) + (cat.values[5]?.carry || 0);
          tableRowsHtml += `
            <tr style="background: #fafafa; font-size: 9px; color: #4b5563; page-break-inside: avoid; break-inside: avoid;">
              <td style="border: 1px solid #d1d5db; padding: 6px 6px 6px 18px; text-align: left;">&nbsp;&nbsp;└ ${cat.name}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[0].main + cat.values[0].carry)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; color: #2563eb;">${formatValue(cat.values[1].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; color: #059669;">${formatValue(cat.values[1].carry)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[2].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[3].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[4].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; font-weight: bold;">${formatValue(catSum)}</td>
            </tr>
          `;
        });
      });

      const summaryLabels = ["총 사업비", "인건비", "그 밖의 사업운영비", "간접비", "총사업비 중 운영비"];
      const summaryKeys: Array<keyof typeof TOTAL_INVESTMENT_SUMMARY_DATA> = ["total", "labor", "operation", "indirect", "only_operation"];
      summaryKeys.forEach((key, sIdx) => {
        const rowData = TOTAL_INVESTMENT_SUMMARY_DATA[key];
        const rowSum = (rowData[5]?.main || 0) + (rowData[5]?.carry || 0);
        const isTotal = key === "total";
        const isOnlyOp = key === "only_operation";

        tableRowsHtml += `
          <tr style="background: ${isTotal ? "#e0f2fe" : isOnlyOp ? "#ecfdf5" : "#f3f4f6"}; font-weight: bold; border-top: ${isTotal || isOnlyOp ? "2px solid #3b82f6" : "1px solid #d1d5db"}; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${summaryLabels[sIdx]}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[0].main + rowData[0].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #1d4ed8;">${formatValue(rowData[1].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #047857;">${formatValue(rowData[1].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[2].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[3].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[4].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: ${isTotal ? "#0369a1" : "#047857"};">${formatValue(rowSum)}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <div style="padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #333333; background: #ffffff; width: 100%;">
          <h1 style="text-align: center; font-size: 18px; font-weight: 800; margin-bottom: 5px; color: #111827;">울산과학대학교 앵커사업비 5개년 총괄 투자 계획</h1>
          <p style="text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 20px;">[${targetYear}년도 기준 조회] 5개년 총괄 투자 현황 (단위: 백만원)</p>

          ${progressBarHtml}

          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; color: #111827; border: 1px solid #d1d5db; table-layout: fixed;">
            <colgroup>
              <col style="width: 25%;" />
              <col style="width: 10%;" />
              <col style="width: 11%;" />
              <col style="width: 11%;" />
              <col style="width: 10%;" />
              <col style="width: 10%;" />
              <col style="width: 10%;" />
              <col style="width: 13%;" />
            </colgroup>
            <thead>
              <tr style="background: transparent; font-weight: bold;">
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">구분</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2025</th>
                <th colspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 6px 4px; background: #f3f4f6;">2026</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2027</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2028</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2029</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; color: #3b82f6; background: #f3f4f6;">합계</th>
              </tr>
              <tr style="background: transparent;">
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 9px; color: #1d4ed8; padding: 5px 2px; background: #f9fafb;">본사업</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 9px; color: #047857; padding: 5px 2px; background: #f9fafb;">이월사업</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: right;">
            울산과학대학교 앵커사업단 | 출력 일자: ${yyyy}-${mm}-${dd}
          </div>
        </div>
      `;

      const opt = {
        margin: [22.5, 20, 22.5, 20],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(htmlContent).set(opt).save();
    } catch (err) {
      alert("PDF 다운로드 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // 2) 5개년 총괄 Markdown 다운로드 핸들러
  const handleExportFiveYearMarkdown = () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      let md = `# 울산과학대학교 앵커사업비 5개년 총괄 투자 계획\n\n`;
      md += `* 조회 차년도 기준: ${targetYear}년도 (${selectedYear}차년도)\n`;
      md += `* 생성일자: ${yyyy}-${mm}-${dd}\n\n`;
      md += `| 구분 | 2025 | 2026 (본사업) | 2026 (이월사업) | 2027 | 2028 | 2029 | 합계 |\n`;
      md += `| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;

      TOTAL_INVESTMENT_5YEAR_DATA.forEach((u) => {
        const totalObj = u.total[5] || { main: 0, carry: 0 };
        const mainSum = (totalObj.main || 0) + (totalObj.carry || 0);
        md += `| **${u.title}** | ${formatValue(u.total[0].main + u.total[0].carry)} | ${formatValue(u.total[1].main)} | ${formatValue(u.total[1].carry)} | ${formatValue(u.total[2].main)} | ${formatValue(u.total[3].main)} | ${formatValue(u.total[4].main)} | **${formatValue(mainSum)}** |\n`;
        u.categories.forEach((cat) => {
          const catSum = (cat.values[5]?.main || 0) + (cat.values[5]?.carry || 0);
          md += `| &nbsp;&nbsp;&nbsp;&nbsp;└ ${cat.name} | ${formatValue(cat.values[0].main + cat.values[0].carry)} | ${formatValue(cat.values[1].main)} | ${formatValue(cat.values[1].carry)} | ${formatValue(cat.values[2].main)} | ${formatValue(cat.values[3].main)} | ${formatValue(cat.values[4].main)} | ${formatValue(catSum)} |\n`;
        });
      });

      md += `| | | | | | | | |\n`;
      md += `| **[총괄 요약]** | | | | | | | |\n`;

      const summaryLabels = ["총 사업비", "인건비", "그 밖의 사업운영비", "간접비", "총사업비 중 운영비"];
      const summaryKeys: Array<keyof typeof TOTAL_INVESTMENT_SUMMARY_DATA> = ["total", "labor", "operation", "indirect", "only_operation"];
      summaryKeys.forEach((key, sIdx) => {
        const rowData = TOTAL_INVESTMENT_SUMMARY_DATA[key];
        const rowSum = (rowData[5]?.main || 0) + (rowData[5]?.carry || 0);
        md += `| **${summaryLabels[sIdx]}** | ${formatValue(rowData[0].main + rowData[0].carry)} | ${formatValue(rowData[1].main)} | ${formatValue(rowData[1].carry)} | ${formatValue(rowData[2].main)} | ${formatValue(rowData[3].main)} | ${formatValue(rowData[4].main)} | **${formatValue(rowSum)}** |\n`;
      });

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `앵커사업비_5개년_총괄_투자계획_${targetYear}_${yyyy}${mm}${dd}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("마크다운 내보내기 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    }
  };

  // 3) 연차별 계획 PDF 다운로드 핸들러
  const handleExportAnnualPDF = async () => {
    setIsDownloadingPdf("annual");
    try {
      await new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `앵커사업비_${targetYear}년도_재원별_투자계획_${yyyy}${mm}${dd}.pdf`;

      // 💡 [요구사항 반영] (1) 연차별 단위과제별 예산 비율 차트 데이터 가공
      const annualUnitTotals: Record<string, number> = {};
      let annualTotalGovSum = 0;
      ANNUAL_INVESTMENT_DATA.forEach(u => {
        const normId = getNormalizedUnitId(u.id);
        const val = (u.total[0] || 0) + (u.total[1] || 0); // 국비 + 시비
        if (val > 0) {
          annualUnitTotals[normId] = (annualUnitTotals[normId] || 0) + val;
          annualTotalGovSum += val;
        }
      });

      const annualUnitChartItems = Object.entries(annualUnitTotals).map(([id, val]) => {
        let displayName = id;
        if (id === "Common") displayName = "공통경비";
        else if (id === "X0") displayName = "X0(공통)";
        return {
          id,
          name: displayName,
          value: val,
          ratio: annualTotalGovSum > 0 ? (val / annualTotalGovSum) * 100 : 0,
          color: getUnitColor(id)
        };
      }).sort((a, b) => {
        const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        const posA = idxA === -1 ? 999 : idxA;
        const posB = idxB === -1 ? 999 : idxB;
        return posA - posB;
      });

      // (2) 전체사업비 재원 구성 비율 가공
      const sourceChartItems = [
        { name: "국비", value: annualTotalNat, color: "#3b82f6" },
        { name: "시비", value: annualTotalCity, color: "#10b981" },
        { name: "외부사업비", value: annualTotalExt, color: "#f59e0b" }
      ];

      // HTML ProgressBar 스트링 생성 (1번 차트)
      let barDivs1Html = "";
      let legendItems1Html = "";
      annualUnitChartItems.forEach((item) => {
        if (item.value > 0) {
          barDivs1Html += `<div style="width: ${item.ratio}%; background: ${item.color}; height: 100%;"></div>`;
          legendItems1Html += `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; margin-right: 12px; margin-bottom: 4px; white-space: nowrap;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.color}; display: inline-block; flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #111827;">${item.name}</span>
              <span style="color: #4b5563;">${item.ratio.toFixed(1)}%</span>
              <span style="color: #6b7280; font-size: 7.5px;">(${formatValue(item.value)})</span>
            </div>
          `;
        }
      });

      const progressBar1Html = `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; color: #111827;">📊 ${targetYear}년도 단위과제별 예산(국비+시비) 비율</span>
            <span style="font-size: 9px; color: #4b5563; font-weight: bold;">총 ${formatValue(annualTotalGovSum)}백만 원</span>
          </div>
          <div style="width: 100%; height: 14px; display: flex; border-radius: 7px; overflow: hidden; background: #e5e7eb;">
            ${barDivs1Html}
          </div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 2px;">
            ${legendItems1Html}
          </div>
        </div>
      `;

      // HTML ProgressBar 스트링 생성 (2번 차트)
      const sourceTotal = annualTotalNat + annualTotalCity + annualTotalExt;
      let barDivs2Html = "";
      let legendItems2Html = "";
      sourceChartItems.forEach((item) => {
        if (item.value > 0) {
          const itemRatio = sourceTotal > 0 ? (item.value / sourceTotal) * 100 : 0;
          barDivs2Html += `<div style="width: ${itemRatio}%; background: ${item.color}; height: 100%;"></div>`;
          legendItems2Html += `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; margin-right: 12px; margin-bottom: 4px; white-space: nowrap;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.color}; display: inline-block; flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #111827;">${item.name}</span>
              <span style="color: #4b5563;">${itemRatio.toFixed(1)}%</span>
              <span style="color: #6b7280; font-size: 7.5px;">(${formatValue(item.value)})</span>
            </div>
          `;
        }
      });

      const progressBar2Html = `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; color: #111827;">📊 ${targetYear}년도 전체사업비 재원 구성 비율</span>
            <span style="font-size: 9px; color: #4b5563; font-weight: bold;">총 ${formatValue(sourceTotal)}백만 원</span>
          </div>
          <div style="width: 100%; height: 14px; display: flex; border-radius: 7px; overflow: hidden; background: #e5e7eb;">
            ${barDivs2Html}
          </div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 2px;">
            ${legendItems2Html}
          </div>
        </div>
      `;

      let tableRowsHtml = "";
      ANNUAL_INVESTMENT_DATA.forEach((u) => {
        tableRowsHtml += `
          <tr style="background: ${u.id === "Common" || u.id === "X0" ? "#fffbeb" : "#ffffff"}; font-weight: bold; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${u.title}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[0])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[1])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[2])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: #10b981;">${formatValue(u.total[3])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center; font-size: 10px;">100%</td>
          </tr>
        `;

        u.categories.forEach((cat) => {
          tableRowsHtml += `
            <tr style="background: #fafafa; font-size: 9px; color: #4b5563; page-break-inside: avoid; break-inside: avoid;">
              <td style="border: 1px solid #d1d5db; padding: 6px 6px 6px 18px; text-align: left;">&nbsp;&nbsp;└ ${cat.name}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[0])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[1])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[2])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; font-weight: bold;">${formatValue(cat.values[3])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: center;">${cat.values[4].toFixed(1)}%</td>
            </tr>
          `;
        });
      });

      const summaryRows = [
        { label: "총 사업비", values: [annualTotalNat, annualTotalCity, annualTotalExt, annualTotalSum, 100.0] },
        { label: "인건비", values: [annualLaborNat, annualLaborCity, annualLaborExt, annualLaborSum, annualLaborRatio] },
        { label: "그 밖의 사업운영비", values: [annualOpNat, annualOpCity, annualOpExt, annualOpSum, annualOpRatio] },
        { label: "간접비", values: [annualIndNat, annualIndCity, annualIndExt, annualIndSum, annualIndRatio] },
        { label: "총사업비 중 운영비", values: [annualOnlyOpNat, annualOnlyOpCity, annualOnlyOpExt, annualOnlyOpSum, annualOnlyOpRatio] }
      ];

      summaryRows.forEach((row) => {
        const isTotal = row.label === "총 사업비";
        const isOnlyOp = row.label === "총사업비 중 운영비";

        tableRowsHtml += `
          <tr style="background: ${isTotal ? "#e0f2fe" : isOnlyOp ? "#ecfdf5" : "#f3f4f6"}; font-weight: bold; border-top: ${isTotal || isOnlyOp ? "2px solid #3b82f6" : "1px solid #d1d5db"}; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${row.label}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(row.values[0])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(row.values[1])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(row.values[2])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: ${isTotal ? "#0369a1" : "#047857"};">${formatValue(row.values[3])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center; font-size: 10px;">${row.values[4].toFixed(1)}%</td>
          </tr>
        `;
      });

      const htmlContent = `
        <div style="padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #333333; background: #ffffff; width: 100%;">
          <h1 style="text-align: center; font-size: 18px; font-weight: 800; margin-bottom: 5px; color: #111827;">울산과학대학교 앵커사업비 ${targetYear}년도 재원별 투자 계획</h1>
          <p style="text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 20px;">연차별 재원 안분 현황 (단위: 백만원)</p>

          ${progressBar1Html}
          ${progressBar2Html}

          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; color: #111827; border: 1px solid #d1d5db; table-layout: fixed;">
            <colgroup>
              <col style="width: 35%;" />
              <col style="width: 13%;" />
              <col style="width: 13%;" />
              <col style="width: 13%;" />
              <col style="width: 14%;" />
              <col style="width: 12%;" />
            </colgroup>
            <thead>
              <tr style="background: #f3f4f6; font-weight: bold;">
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">구분</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">국비</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">시비</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">외부사업비</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px; color: #3b82f6;">합계</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">비율 (%)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: right;">
            울산과학대학교 앵커사업단 | 출력 일자: ${yyyy}-${mm}-${dd}
          </div>
        </div>
      `;

      const opt = {
        margin: [22.5, 20, 22.5, 20],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(htmlContent).set(opt).save();
    } catch (err) {
      alert("PDF 다운로드 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // 4) 연차별 계획 Markdown 다운로드 핸들러
  const handleExportAnnualMarkdown = () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      let md = `# 울산과학대학교 앵커사업비 ${targetYear}년도 재원별 계획\n\n`;
      md += `* 생성일자: ${yyyy}-${mm}-${dd}\n\n`;
      md += `| ${targetYear}년도 구분 | 국비 | 시비 | 외부사업비 | 합계 | 비율 (%) |\n`;
      md += `| :--- | ---: | ---: | ---: | ---: | ---: |\n`;

      ANNUAL_INVESTMENT_DATA.forEach((u) => {
        md += `| **${u.title}** | ${formatValue(u.total[0])} | ${formatValue(u.total[1])} | ${formatValue(u.total[2])} | **${formatValue(u.total[3])}** | 100% |\n`;
        u.categories.forEach((cat) => {
          md += `| &nbsp;&nbsp;&nbsp;&nbsp;└ ${cat.name} | ${formatValue(cat.values[0])} | ${formatValue(cat.values[1])} | ${formatValue(cat.values[2])} | ${formatValue(cat.values[3])} | ${cat.values[4].toFixed(1)}% |\n`;
        });
      });

      md += `| | | | | | |\n`;
      md += `| **[재원별 요약]** | | | | | |\n`;

      const summaryRows = [
        { label: "총 사업비", values: [annualTotalNat, annualTotalCity, annualTotalExt, annualTotalSum, 100.0] },
        { label: "인건비", values: [annualLaborNat, annualLaborCity, annualLaborExt, annualLaborSum, annualLaborRatio] },
        { label: "그 밖의 사업운영비", values: [annualOpNat, annualOpCity, annualOpExt, annualOpSum, annualOpRatio] },
        { label: "간접비", values: [annualIndNat, annualIndCity, annualIndExt, annualIndSum, annualIndRatio] },
        { label: "총사업비 중 운영비", values: [annualOnlyOpNat, annualOnlyOpCity, annualOnlyOpExt, annualOnlyOpSum, annualOnlyOpRatio] }
      ];

      summaryRows.forEach((row) => {
        md += `| **${row.label}** | ${formatValue(row.values[0])} | ${formatValue(row.values[1])} | ${formatValue(row.values[2])} | **${formatValue(row.values[3])}** | ${row.values[4].toFixed(1)}% |\n`;
      });

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `앵커사업비_${targetYear}년도_재원별_계획_${yyyy}${mm}${dd}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("마크다운 내보내기 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    }
  };

  const getNormalizedUnitId = (id: string) => {
    if (id === "Common" || id === "X0") return id;
    const match = id.match(/^[A-D][1-4]/);
    return match ? match[0] : id;
  };

  const getUnitColor = (id: string) => {
    const colors: Record<string, string> = {
      A1: "#3b82f6",
      A2: "#60a5fa",
      B1: "#6366f1",
      B2: "#8b5cf6",
      C1: "#14b8a6",
      C2: "#10b981",
      D1: "#f59e0b",
      D2: "#ec4899",
      Common: "#94a3b8",
      X0: "#cbd5e1"
    };
    return colors[id] || "#64748b";
  };

  const HorizontalProgressBar = ({ title, items, unitText = "백만원" }: { title?: string; items: Array<{ name: string; value: number; color: string }>; unitText?: string }) => {
    const validItems = items.filter((item) => item.value > 0);
    const totalVal = validItems.reduce((acc: number, curr) => acc + curr.value, 0);

    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      }}>
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>{title}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>총 {totalVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{unitText}</span>
          </div>
        )}

        <div style={{
          width: "100%",
          height: "20px",
          display: "flex",
          borderRadius: "10px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.03)"
        }}>
          {validItems.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              예산 데이터가 없습니다.
            </div>
          ) : (
            validItems.map((item, idx: number) => {
              const itemRatio = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
              return (
                <div
                  key={idx}
                  style={{
                    width: `${itemRatio}%`,
                    background: item.color,
                    height: "100%",
                    transition: "width 0.3s ease",
                    cursor: "pointer"
                  }}
                  title={`${item.name}: ${item.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unitText} (${itemRatio.toFixed(1)}%)`}
                />
              );
            })
          )}
        </div>

        {validItems.length > 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem 1rem",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            marginTop: "0.2rem"
          }}>
            {validItems.map((item, idx: number) => {
              const itemRatio = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: item.color,
                    display: "inline-block"
                  }} />
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{item.name}</span>
                  <span>{itemRatio.toFixed(1)}%</span>
                  <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>({item.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })})</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderFiveYear = () => {
    const fiveYearUnitTotals: Record<string, number> = {};
    let totalSumVal = 0;
    TOTAL_INVESTMENT_5YEAR_DATA.forEach(u => {
      const normId = getNormalizedUnitId(u.id);
      const totalObj = u.total[5] || { main: 0, carry: 0 };
      const val = (totalObj.main || 0) + (totalObj.carry || 0);
      if (val > 0) {
        fiveYearUnitTotals[normId] = (fiveYearUnitTotals[normId] || 0) + val;
        totalSumVal += val;
      }
    });

    const fiveYearChartItems = Object.entries(fiveYearUnitTotals).map(([id, val]) => {
      let displayName = id;
      if (id === "Common") displayName = "공통경비";
      else if (id === "X0") displayName = "X0(공통)";
      return {
        id,
        name: displayName,
        value: val,
        ratio: totalSumVal > 0 ? (val / totalSumVal) * 100 : 0,
        color: getUnitColor(id)
      };
    }).sort((a, b) => {
      const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });

    return (
      <div className="table-panel">
        {/* 💡 [요구사항 반영] 5개년 총괄 내보내기 버튼 그룹 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <button
            type="button"
            onClick={() => handleDownloadUnifiedExcel("five_year")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FileSpreadsheet size={14} />
            Excel 다운로드
          </button>

          <button
            type="button"
            onClick={handleExportFiveYearPDF}
            disabled={isDownloadingPdf === "five_year"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              cursor: isDownloadingPdf === "five_year" ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (isDownloadingPdf !== "five_year") {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isDownloadingPdf === "five_year" ? (
              <>
                <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                PDF 내보내는 중...
              </>
            ) : (
              <>
                <FileText size={14} />
                PDF 다운로드
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportFiveYearMarkdown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#3b82f6",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Download size={14} />
            Markdown 다운로드
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", background: "rgba(59, 130, 246, 0.05)", borderLeft: "4px solid var(--accent-color)", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          <span>💡 2차년도 사업비는 본사업비와 이월사업비로 구성되며, 타 연차는 본사업비만을 나타냄.</span>
          <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>(단위: 백만원)</span>
        </div>

        {/* 5개년 단위과제별 합산비율 차트 (가로형 2D-Bar) */}
        <HorizontalProgressBar title="📊 5개년 단위과제별 예산 합산 비율" items={fiveYearChartItems} />

        <table className="custom-table" style={{ fontSize: "0.8rem", width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>구분</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2025</th>
              <th colSpan={2} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", padding: "0.45rem" }}>
                2026
              </th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2027</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2028</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2029</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", fontWeight: "800", color: "var(--accent-color)", borderBottom: "1px solid var(--border-color)" }}>합계</th>
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.01)" }}>
              <th style={{ textAlign: "center", fontSize: "0.7rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderBottom: "1px solid var(--border-color)", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>본사업</th>
              <th style={{ textAlign: "center", fontSize: "0.7rem", color: darkMode ? "#34d399" : "#047857", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>이월사업</th>
            </tr>
          </thead>
          <tbody>
            {TOTAL_INVESTMENT_5YEAR_DATA.map((u) => {
              const isExpanded = !!expandedUnits[u.id];
              const hasCategories = u.categories && u.categories.length > 0;
              return (
                <React.Fragment key={u.id}>
                  {/* 대단위과제 로우 */}
                  <tr
                    onClick={() => hasCategories && toggleUnit(u.id)}
                    style={{
                      cursor: hasCategories ? "pointer" : "default",
                      background: u.id === "Common" || u.id === "X0" ? "rgba(245, 158, 11, 0.08)" : "rgba(255,255,255,0.01)",
                      fontWeight: "700"
                    }}
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <td style={{ paddingLeft: "1.5rem", color: u.id === "Common" || u.id === "X0" ? "#fbbf24" : "inherit", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {hasCategories && (
                        <span style={{ fontSize: "0.6rem", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>▶</span>
                      )}
                      {u.title}
                    </td>
                    {u.total.map((val, idx) => {
                      if (idx === 1) {
                        const mainVal = val.main || 0;
                        const carryVal = val.carry || 0;
                        return (
                          <React.Fragment key={idx}>
                            <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderRight: "1px dashed rgba(255, 255, 255, 0.15)", fontWeight: "700" }}>
                              {formatValue(mainVal)}
                            </td>
                            <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#34d399" : "#047857", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", fontWeight: "700" }}>
                              {formatValue(carryVal)}
                            </td>
                          </React.Fragment>
                        );
                      }
                      const mainVal = val.main || 0;
                      const carryVal = val.carry || 0;
                      const sumVal = mainVal + carryVal;
                      let displayVal = "-";
                      if (idx === 0) displayVal = formatValue(sumVal);
                      else displayVal = formatValue(mainVal);

                      return (
                        <td
                          key={idx}
                          style={{
                            textAlign: "right",
                            paddingRight: idx === 5 ? "1.5rem" : "1rem",
                            fontWeight: idx === 5 ? "800" : "700",
                            color: idx === 5 ? "var(--accent-color)" : "inherit",
                            borderRight: idx === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)"
                          }}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                  {/* 세부 비목 아코디언 로우 */}
                  {isExpanded && u.categories.map((cat, catIdx) => (
                    <tr key={`${u.id}-${catIdx}`} style={{ background: "rgba(0,0,0,0.25)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {cat.name}
                      </td>
                      {cat.values.map((v, vIdx) => {
                        if (vIdx === 1) {
                          const mainVal = v.main || 0;
                          const carryVal = v.carry || 0;
                          return (
                            <React.Fragment key={vIdx}>
                              <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                                {formatValue(mainVal)}
                              </td>
                              <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#34d399" : "#047857", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                                {formatValue(carryVal)}
                              </td>
                            </React.Fragment>
                          );
                        }
                        const mainVal = v.main || 0;
                        const carryVal = v.carry || 0;
                        const sumVal = mainVal + carryVal;
                        let displayVal = "-";
                        if (vIdx === 0) displayVal = formatValue(sumVal);
                        else displayVal = formatValue(mainVal);

                        return (
                          <td key={vIdx} style={{ textAlign: "right", paddingRight: vIdx === 5 ? "1.5rem" : "1rem", borderRight: vIdx === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* 총 합계 요약 영역 */}
            <tr style={{ borderTop: "2px solid var(--accent-color)", background: "rgba(59, 130, 246, 0.05)", fontWeight: "800" }}>
              <td style={{ paddingLeft: "1.5rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>총 사업비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.total.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#34d399" : "#047857", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>인건비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.labor.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#60a5fa", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#34d399", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>그 밖의 사업운영비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.operation.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#60a5fa", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#34d399", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>간접비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.indirect.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#60a5fa", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#34d399", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(16, 185, 129, 0.05)", fontWeight: "800" }}>
              <td style={{ paddingLeft: "1.5rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#10b981" }}>총사업비 중 운영비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.only_operation.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", borderRight: "1px dashed rgba(255, 255, 255, 0.15)", color: "#10b981" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#10b981" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", color: "#10b981", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderAnnual = () => {
    // (1) 당해년도 단위과제별 예산(국비+시비) 비율 가공
    const annualUnitTotals: Record<string, number> = {};
    let annualTotalGovSum = 0;
    ANNUAL_INVESTMENT_DATA.forEach(u => {
      const normId = getNormalizedUnitId(u.id);
      const val = (u.total[0] || 0) + (u.total[1] || 0); // 국비 + 시비
      if (val > 0) {
        annualUnitTotals[normId] = (annualUnitTotals[normId] || 0) + val;
        annualTotalGovSum += val;
      }
    });

    const annualUnitChartItems = Object.entries(annualUnitTotals).map(([id, val]) => {
      let displayName = id;
      if (id === "Common") displayName = "공통경비";
      else if (id === "X0") displayName = "X0(공통)";
      return {
        id,
        name: displayName,
        value: val,
        ratio: annualTotalGovSum > 0 ? (val / annualTotalGovSum) * 100 : 0,
        color: getUnitColor(id)
      };
    }).sort((a, b) => {
      const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });

    // (2) 전체사업비 중 국비 vs. 시비 vs. 외부사업비 비율 가공
    const sourceChartItems = [
      { name: "국비", value: annualTotalNat, color: "#3b82f6" },
      { name: "시비", value: annualTotalCity, color: "#10b981" },
      { name: "외부사업비", value: annualTotalExt, color: "#f59e0b" }
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 💡 [요구사항 반영] 연차별 계획 내보내기 버튼 그룹 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
          <button
            type="button"
            onClick={() => handleDownloadUnifiedExcel("annual")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FileSpreadsheet size={14} />
            Excel 다운로드
          </button>

          <button
            type="button"
            onClick={handleExportAnnualPDF}
            disabled={isDownloadingPdf === "annual"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              cursor: isDownloadingPdf === "annual" ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (isDownloadingPdf !== "annual") {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isDownloadingPdf === "annual" ? (
              <>
                <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                PDF 내보내는 중...
              </>
            ) : (
              <>
                <FileText size={14} />
                PDF 다운로드
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportAnnualMarkdown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#3b82f6",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Download size={14} />
            Markdown 다운로드
          </button>
        </div>
        {/* 요약 연차 정보 헤더 */}
        <div style={{ padding: "0.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.3rem" }}>■ {targetYear}년도 예산</h4>
            <div style={{ fontSize: "0.85rem", color: "var(--accent-color)", fontWeight: "700" }}>
              ○ {formatValue(annualTotalSum)}백만 원 (국비 {formatValue(annualTotalNat)}, 시비 {formatValue(annualTotalCity)}, 외부사업비 {formatValue(annualTotalExt)})
            </div>
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>(단위: 백만원)</span>
        </div>

        {/* 당해년도 단위과제별 예산(국비+시비) 비율 차트 */}
        <HorizontalProgressBar title={`📊 ${targetYear}년도 단위과제별 예산(국비+시비) 비율`} items={annualUnitChartItems} />

        {/* 당해년도 재원별(국비/시비/외부) 안분 비율 차트 */}
        <HorizontalProgressBar title={`📊 ${targetYear}년도 전체사업비 재원 구성 비율`} items={sourceChartItems} />

        <div className="table-panel">
          <table className="custom-table" style={{ fontSize: "0.8rem", width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>구분</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>국비</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>시비</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>외부사업비</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)", fontWeight: "800", color: "var(--accent-color)" }}>합계</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "none" }}>비율 (%)</th>
              </tr>
            </thead>
            <tbody>
              {ANNUAL_INVESTMENT_DATA.map((u) => {
                const isExpanded = !!expandedUnits[u.id];
                const hasCategories = u.categories && u.categories.length > 0;
                return (
                  <React.Fragment key={u.id}>
                    {/* 대단위과제 로우 */}
                    <tr
                      onClick={() => hasCategories && toggleUnit(u.id)}
                      style={{
                        cursor: hasCategories ? "pointer" : "default",
                        background: u.id === "Common" || u.id === "X0" ? "rgba(245, 158, 11, 0.08)" : "rgba(255,255,255,0.01)",
                        fontWeight: "700"
                      }}
                     role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                      <td style={{ paddingLeft: "1.5rem", color: u.id === "Common" || u.id === "X0" ? "#fbbf24" : "inherit", borderRight: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {hasCategories && (
                          <span style={{ fontSize: "0.6rem", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>▶</span>
                        )}
                        {u.title}
                      </td>
                      {u.total.map((val, idx) => (
                        <td
                          key={idx}
                          style={{
                            textAlign: idx === 4 ? "center" : "right",
                            paddingRight: idx === 4 ? "0" : "1rem",
                            fontWeight: (idx === 3 || idx === 4) ? "800" : "700",
                            color: idx === 3 ? "var(--accent-color)" : "inherit",
                            borderRight: idx === 4 ? "none" : "1px solid rgba(255, 255, 255, 0.1)"
                          }}
                        >
                          {idx === 4 ? `${val.toFixed(0)}` : formatValue(val)}
                        </td>
                      ))}
                    </tr>
                    {/* 세부 비목 아코디언 로우 */}
                    {isExpanded && u.categories.map((cat, catIdx) => (
                      <tr key={`${u.id}-${catIdx}`} style={{ background: "rgba(0,0,0,0.25)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>
                          {cat.name}
                        </td>
                        {cat.values.map((v, vIdx) => (
                          <td
                            key={vIdx}
                            style={{
                              textAlign: vIdx === 4 ? "center" : "right",
                              paddingRight: vIdx === 4 ? "0" : "1rem",
                              borderRight: vIdx === 4 ? "none" : "1px solid rgba(255, 255, 255, 0.1)"
                            }}
                          >
                            {vIdx === 4 ? `${v.toFixed(1)}%` : formatValue(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {/* 총 합계 요약 영역 */}
              <tr style={{ borderTop: "2px solid var(--accent-color)", background: "rgba(59, 130, 246, 0.05)", fontWeight: "800" }}>
                <td style={{ paddingLeft: "1.5rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>총 사업비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "var(--accent-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>100</td>
              </tr>
              <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>인건비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>{annualLaborRatio.toFixed(1)}%</td>
              </tr>
              <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>그 밖의 사업운영비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>{annualOpRatio.toFixed(1)}%</td>
              </tr>
              <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>간접비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>{annualIndRatio.toFixed(1)}%</td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(16, 185, 129, 0.05)", fontWeight: "800" }}>
                <td style={{ paddingLeft: "1.5rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)", color: "#10b981" }}>총사업비 중 운영비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpSum)}</td>
                <td style={{ textAlign: "center", color: "#10b981", borderRight: "none" }}>{annualOnlyOpRatio.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 엑셀 다운로드 헬퍼
  const handleDownloadUnifiedExcel = async (type: "all" | "five_year" | "annual" = "all") => {
      // 1. 5개년 총괄 데이터 포맷팅
      const fiveYearRows: Array<Array<string | number>> = [];
      fiveYearRows.push([
        "구분",
        "2025",
        "2026 (본사업)",
        "2026 (이월사업)",
        "2027",
        "2028",
        "2029",
        "합계"
      ]);

      TOTAL_INVESTMENT_5YEAR_DATA.forEach((u) => {
        fiveYearRows.push([
          u.title,
          u.total[0].main + u.total[0].carry,
          u.total[1].main,
          u.total[1].carry,
          u.total[2].main,
          u.total[3].main,
          u.total[4].main,
          u.total[5].main + u.total[5].carry
        ]);
        u.categories.forEach((cat) => {
          fiveYearRows.push([
            `   └ ${cat.name}`,
            cat.values[0].main + cat.values[0].carry,
            cat.values[1].main,
            cat.values[1].carry,
            cat.values[2].main,
            cat.values[3].main,
            cat.values[4].main,
            cat.values[5].main + cat.values[5].carry
          ]);
        });
      });

      fiveYearRows.push([]);
      fiveYearRows.push(["[총괄 요약]"]);

      const summaryTypes = [
        { label: "총 사업비", data: TOTAL_INVESTMENT_SUMMARY_DATA.total },
        { label: "인건비", data: TOTAL_INVESTMENT_SUMMARY_DATA.labor },
        { label: "그 밖의 사업운영비", data: TOTAL_INVESTMENT_SUMMARY_DATA.operation },
        { label: "간접비", data: TOTAL_INVESTMENT_SUMMARY_DATA.indirect },
        { label: "총사업비 중 운영비", data: TOTAL_INVESTMENT_SUMMARY_DATA.only_operation }
      ];

      summaryTypes.forEach((st) => {
        fiveYearRows.push([
          st.label,
          st.data[0].main + st.data[0].carry,
          st.data[1].main,
          st.data[1].carry,
          st.data[2].main,
          st.data[3].main,
          st.data[4].main,
          st.data[5].main + st.data[5].carry
        ]);
      });

      // 2. 연차별 계획 데이터 포맷팅
      const annualRows: Array<Array<string | number>> = [];
      annualRows.push([
        `${targetYear}년도 구분`,
        "국비",
        "시비",
        "외부사업비",
        "합계",
        "비율 (%)"
      ]);

      ANNUAL_INVESTMENT_DATA.forEach((u) => {
        annualRows.push([
          u.title,
          u.total[0],
          u.total[1],
          u.total[2],
          u.total[3],
          u.total[4]
        ]);
        u.categories.forEach((cat) => {
          annualRows.push([
            `   └ ${cat.name}`,
            cat.values[0],
            cat.values[1],
            cat.values[2],
            cat.values[3],
            cat.values[4]
          ]);
        });
      });

      annualRows.push([]);
      annualRows.push(["[재원별 요약]"]);
      annualRows.push(["총 사업비", annualTotalNat, annualTotalCity, annualTotalExt, annualTotalSum, 100]);
      annualRows.push(["인건비", annualLaborNat, annualLaborCity, annualLaborExt, annualLaborSum, annualLaborRatio]);
      annualRows.push(["그 밖의 사업운영비", annualOpNat, annualOpCity, annualOpExt, annualOpSum, annualOpRatio]);
      annualRows.push(["간접비", annualIndNat, annualIndCity, annualIndExt, annualIndSum, annualIndRatio]);
      annualRows.push(["총사업비 중 운영비", annualOnlyOpNat, annualOnlyOpCity, annualOnlyOpExt, annualOnlyOpSum, annualOnlyOpRatio]);

      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      if (type === "all" || type === "five_year") {
        const wsFiveYear = XLSX.utils.aoa_to_sheet(fiveYearRows);
        XLSX.utils.book_append_sheet(wb, wsFiveYear, "5개년 총괄 투자 계획");
      }
      if (type === "all" || type === "annual") {
        const wsAnnual = XLSX.utils.aoa_to_sheet(annualRows);
        XLSX.utils.book_append_sheet(wb, wsAnnual, `${targetYear}년도 재원별 계획`);
      }

      const filename = type === "all"
        ? `앵커사업비_통합_투자계획_현황_${targetYear}.xlsx`
        : type === "five_year"
          ? `앵커사업비_5개년_총괄_투자계획_${targetYear}.xlsx`
          : `앵커사업비_${targetYear}년도_재원별_계획.xlsx`;

      XLSX.writeFile(wb, filename);
  };

  const _renderExcelDownload = () => {
    return (
      <div className="glass-card" style={{ padding: "2.5rem", maxWidth: "600px", margin: "2rem auto", textAlign: "center", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "inline-flex", padding: "1.2rem", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", marginBottom: "1.5rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-spreadsheet">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M8 13h2" />
            <path d="M14 13h2" />
            <path d="M8 17h2" />
            <path d="M14 17h2" />
          </svg>
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>투자 계획 엑셀 다운로드</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.5" }}>
          울산과학대학교 앵커사업비 계획의 5개년 총괄 현황 및 {targetYear}년도 연차별 재원별 현황을 단 한 번에 워크북 시트로 묶어 엑셀 파일로 내려받습니다.
        </p>

        <button
          onClick={() => handleDownloadUnifiedExcel("all")}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "0.85rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: "800",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
            transition: "all 0.2s ease",
            marginBottom: "1rem"
          }}
        >
          📥 통합 투자 계획서 엑셀 다운로드 (.xlsx)
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={() => handleDownloadUnifiedExcel("five_year")}
            style={{
              padding: "0.60rem 1rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📄 5개년 총괄만 받기
          </button>
          <button
            onClick={() => handleDownloadUnifiedExcel("annual")}
            style={{
              padding: "0.60rem 1rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📅 {targetYear}년도 계획만 받기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* 2단계 서브 메뉴 헤더 (5개년 총괄 / 연차별 계획) */}
      <div style={{ display: "flex", gap: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", width: "fit-content" }}>
        <button
          onClick={() => onChangeInvestmentSubTab("five_year")}
          style={{
            background: investmentSubTab === "five_year" ? "var(--accent-color)" : "transparent",
            color: investmentSubTab === "five_year" ? "#fff" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            padding: "0.4rem 1.2rem",
            fontWeight: "700",
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.18s ease"
          }}
        >
          5개년 총괄
        </button>
        <button
          onClick={() => onChangeInvestmentSubTab("annual")}
          style={{
            background: investmentSubTab === "annual" ? "var(--accent-color)" : "transparent",
            color: investmentSubTab === "annual" ? "#fff" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            padding: "0.4rem 1.2rem",
            fontWeight: "700",
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.18s ease"
          }}
        >
          연차별 계획 (재원별)
        </button>
      </div>

      {/* 실시간 렌더링 스위칭 */}
      {investmentSubTab === "five_year" ? renderFiveYear() : renderAnnual()}
    </div>
  );
}
