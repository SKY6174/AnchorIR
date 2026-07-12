import React from "react";
import { userRoles } from "../data/mockData";
import { LayoutDashboard, Users, FileBarChart2, FolderKanban, Award, Landmark, ClipboardList, BookOpen, Briefcase, Calendar } from "lucide-react";

export default function Sidebar({
  currentRole,
  onChangeRole,
  activeTab,
  onChangeTab,
  projectsSubTab,
  onChangeProjectsSubTab,
  kpiSubTab,
  onChangeKpiSubTab,
  mgmtSubTab,
  onChangeMgmtSubTab,
  budgetSubTab,
  onChangeBudgetSubTab,
  procurementSubTab,
  onChangeProcurementSubTab,
  scheduleSubTab,
  onChangeScheduleSubTab,
  agreementsSubTab,
  onChangeAgreementsSubTab,
  progressSubTab,
  onChangeProgressSubTab,
  menuVisibility = {},
  isSongDirector = false
}) {
  const [hoveredTab, setHoveredTab] = React.useState(null);

  // 해당 메뉴 키가 숨김 상태로 설정되었는지 판별
  const isHidden = (key) => menuVisibility[key] === false;

  // 단장용 숨김 메뉴 스타일링 (빨간색 계열 + 취소선 효과 제공)
  const getHiddenStyle = (key) => {
    if (isHidden(key)) {
      return {
        color: "#f87171",
        opacity: 0.65,
        textDecoration: "line-through"
      };
    }
    return {};
  };

  return (
    <aside className="sidebar">
      <div>
        <div
          className="logo-section"
          onClick={() => onChangeTab("dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="울산과학대학교 로고" className="logo-img" />
          <span className="logo-text">ANCHOR Portal</span>
        </div>

        <nav className="nav-menu">
          {(menuVisibility.dashboard !== false || isSongDirector) && (
            <div
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => onChangeTab("dashboard")}
              style={getHiddenStyle("dashboard")}
            >
              <LayoutDashboard size={24} />
              <span>
                IR 대시보드
                {isHidden("dashboard") && (
                  <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                    [숨김]
                  </span>
                )}
              </span>
            </div>
          )}

          {/* 1) 단위과제 관리 탭 복구 (요구사항 1 반영) */}
          {(menuVisibility.projects !== false || isSongDirector) && (
            <div
              className={`projects-nav-wrapper ${(activeTab === "projects" || hoveredTab === "projects") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("projects")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("projects");
                  if (onChangeProjectsSubTab) {
                    const subTabs = ["unit_status", "unit_system", "program_mgmt"];
                    const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[tab] !== false) || "unit_status";
                    onChangeProjectsSubTab(firstActive);
                  }
                }}
                style={getHiddenStyle("projects")}
              >
                <FolderKanban size={24} />
                <span>
                  단위과제 관리
                  {isHidden("projects") && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                      [숨김]
                    </span>
                  )}
                </span>
              </div>
              <div className="nav-sub-menu">
                {(menuVisibility.unit_status !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "projects" && projectsSubTab === "unit_status" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("projects");
                      if (onChangeProjectsSubTab) {
                        onChangeProjectsSubTab("unit_status");
                      }
                    }}
                    style={getHiddenStyle("unit_status")}
                  >
                    - 단위과제 집행현황
                    {isHidden("unit_status") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.unit_system !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "projects" && projectsSubTab === "unit_system" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("projects");
                      if (onChangeProjectsSubTab) {
                        onChangeProjectsSubTab("unit_system");
                      }
                    }}
                    style={getHiddenStyle("unit_system")}
                  >
                    - 단위과제 체계
                    {isHidden("unit_system") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.program_mgmt !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "projects" && projectsSubTab === "program_mgmt" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("projects");
                      if (onChangeProjectsSubTab) {
                        onChangeProjectsSubTab("program_mgmt");
                      }
                    }}
                    style={getHiddenStyle("program_mgmt")}
                  >
                    - 프로그램 관리
                    {isHidden("program_mgmt") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(menuVisibility.progress !== false || isSongDirector) && (
            <div
              className={`progress-nav-wrapper ${(activeTab === "progress" || hoveredTab === "progress") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("progress")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "progress" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("progress");
                  if (onChangeProgressSubTab) {
                    const subTabs = ["progress_status", "major_programs", "satisfaction_survey"];
                    const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[tab] !== false) || "progress_status";
                    onChangeProgressSubTab(firstActive);
                  }
                }}
                style={getHiddenStyle("progress")}
              >
                <ClipboardList size={24} />
                <span>
                  프로그램 진행
                  {isHidden("progress") && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                      [숨김]
                    </span>
                  )}
                </span>
              </div>
              <div className="nav-sub-menu">
                {(menuVisibility.progress_status !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "progress" && progressSubTab === "progress_status" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("progress");
                      if (onChangeProgressSubTab) {
                        onChangeProgressSubTab("progress_status");
                      }
                    }}
                    style={getHiddenStyle("progress_status")}
                  >
                    - 프로그램 진행 상황
                    {isHidden("progress_status") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.major_programs !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "progress" && progressSubTab === "major_programs" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("progress");
                      if (onChangeProgressSubTab) {
                        onChangeProgressSubTab("major_programs");
                      }
                    }}
                    style={getHiddenStyle("major_programs")}
                  >
                    - 주요 프로그램
                    {isHidden("major_programs") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.satisfaction_survey !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "progress" && progressSubTab === "satisfaction_survey" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("progress");
                      if (onChangeProgressSubTab) {
                        onChangeProgressSubTab("satisfaction_survey");
                      }
                    }}
                    style={getHiddenStyle("satisfaction_survey")}
                  >
                    - 만족도 조사
                    {isHidden("satisfaction_survey") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(menuVisibility.budget !== false || isSongDirector) && (
            <div
              className={`budget-nav-wrapper ${(activeTab === "budget" || hoveredTab === "budget") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("budget")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "budget" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("budget");
                  if (onChangeBudgetSubTab) {
                    const subTabs = ["total_investment", "budget_categories", "execution_rate"];
                    const schemaMapping = { "total_investment": "settlement", "budget_categories": "settlement", "execution_rate": "execution" };
                    const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[schemaMapping[tab]] !== false) || "total_investment";
                    onChangeBudgetSubTab(firstActive);
                  }
                }}
                style={getHiddenStyle("budget")}
              >
                <Landmark size={24} />
                <span>
                  예산 관리
                  {isHidden("budget") && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                      [숨김]
                    </span>
                  )}
                </span>
              </div>
              <div className="nav-sub-menu">
                <div
                  className={`nav-sub-item ${activeTab === "budget" && budgetSubTab === "total_investment" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeTab("budget");
                    if (onChangeBudgetSubTab) {
                      onChangeBudgetSubTab("total_investment");
                    }
                  }}
                >
                  - 총괄 투자 계획
                </div>
                {(menuVisibility.settlement !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "budget" && budgetSubTab === "budget_categories" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("budget");
                      if (onChangeBudgetSubTab) {
                        onChangeBudgetSubTab("budget_categories");
                      }
                    }}
                    style={getHiddenStyle("settlement")}
                  >
                    - 비목별 관리
                    {isHidden("settlement") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.execution !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "budget" && budgetSubTab === "execution_rate" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("budget");
                      if (onChangeBudgetSubTab) {
                        onChangeBudgetSubTab("execution_rate");
                      }
                    }}
                    style={getHiddenStyle("execution")}
                  >
                    - 집행률 관리
                    {isHidden("execution") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(menuVisibility.kpis !== false || isSongDirector) && (
            <div
              className={`kpis-nav-wrapper ${(activeTab === "kpis" || hoveredTab === "kpis") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("kpis")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "kpis" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("kpis");
                  if (onChangeKpiSubTab) {
                    const subTabs = ["공통", "자율", "중점"];
                    const schemaMapping = { "공통": "kpi_status", "자율": "kpi_self", "중점": "kpi_focus" };
                    const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[schemaMapping[tab]] !== false) || "공통";
                    onChangeKpiSubTab(firstActive);
                  }
                }}
                style={getHiddenStyle("kpis")}
              >
                <FileBarChart2 size={24} />
                <span>
                  성과지표 관리
                  {isHidden("kpis") && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                      [숨김]
                    </span>
                  )}
                </span>
              </div>
              <div className="nav-sub-menu">
                {(menuVisibility.kpi_status !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "kpis" && kpiSubTab === "공통" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("kpis");
                      if (onChangeKpiSubTab) {
                        onChangeKpiSubTab("공통");
                      }
                    }}
                    style={getHiddenStyle("kpi_status")}
                  >
                    - (교육부)공통성과지표
                    {isHidden("kpi_status") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.kpi_self !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "kpis" && kpiSubTab === "자율" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("kpis");
                      if (onChangeKpiSubTab) {
                        onChangeKpiSubTab("자율");
                      }
                    }}
                    style={getHiddenStyle("kpi_self")}
                  >
                    - (지자체)자율성과지표
                    {isHidden("kpi_self") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.kpi_focus !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "kpis" && kpiSubTab === "중점" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("kpis");
                      if (onChangeKpiSubTab) {
                        onChangeKpiSubTab("중점");
                      }
                    }}
                    style={getHiddenStyle("kpi_focus")}
                  >
                    - (대학)중점관리지표
                    {isHidden("kpi_focus") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(menuVisibility.agreements !== false || isSongDirector) && (
            <div
              className={`agreements-nav-wrapper ${(activeTab === "agreements" || hoveredTab === "agreements") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("agreements")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "agreements" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("agreements");
                  if (onChangeAgreementsSubTab) {
                    const subTabs = ["agreements", "unified_certificates", "scholarships"];
                    const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[tab] !== false) || "agreements";
                    onChangeAgreementsSubTab(firstActive);
                  }
                }}
                style={getHiddenStyle("agreements")}
              >
                <Award size={24} />
                <span>
                  협약∙발급 관리
                  {isHidden("agreements") && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                      [숨김]
                    </span>
                  )}
                </span>
              </div>
              <div className="nav-sub-menu">
                {(menuVisibility.agreements !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "agreements" && agreementsSubTab === "agreements" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("agreements");
                      if (onChangeAgreementsSubTab) {
                        onChangeAgreementsSubTab("agreements");
                      }
                    }}
                    style={getHiddenStyle("agreements")}
                  >
                    - 협약 관리
                    {isHidden("agreements") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.unified_certificates !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "agreements" && agreementsSubTab === "unified_certificates" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("agreements");
                      if (onChangeAgreementsSubTab) {
                        onChangeAgreementsSubTab("unified_certificates");
                      }
                    }}
                    style={getHiddenStyle("unified_certificates")}
                  >
                    - 상장∙이수증 관리
                    {isHidden("unified_certificates") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.scholarships !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "agreements" && agreementsSubTab === "scholarships" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("agreements");
                      if (onChangeAgreementsSubTab) {
                        onChangeAgreementsSubTab("scholarships");
                      }
                    }}
                    style={getHiddenStyle("scholarships")}
                  >
                    - 장학금 관리
                    {isHidden("scholarships") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className={`procurement-nav-wrapper ${(activeTab === "procurement" || hoveredTab === "procurement") ? "active" : ""}`}
            onMouseEnter={() => setHoveredTab("procurement")}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div
              className={`nav-item ${activeTab === "procurement" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("procurement");
                if (onChangeProcurementSubTab) {
                  const subTabs = ["env_improvement", "equipment_purchase", "major_services"];
                  const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[tab] !== false) || "env_improvement";
                  onChangeProcurementSubTab(firstActive);
                }
              }}
              style={getHiddenStyle("procurement")}
            >
              <Briefcase size={24} />
              <span>
                구매용역 관리
                {isHidden("procurement") && (
                  <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                    [숨김]
                  </span>
                )}
              </span>
            </div>
            <div className="nav-sub-menu">
              {(menuVisibility.env_improvement !== false || isSongDirector) && (
                <div
                  className={`nav-sub-item ${activeTab === "procurement" && procurementSubTab === "env_improvement" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeTab("procurement");
                    if (onChangeProcurementSubTab) {
                      onChangeProcurementSubTab("env_improvement");
                    }
                  }}
                  style={getHiddenStyle("env_improvement")}
                >
                  - 환경개선
                  {isHidden("env_improvement") && (
                    <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                      [숨김]
                    </span>
                  )}
                </div>
              )}
              {(menuVisibility.equipment_purchase !== false || isSongDirector) && (
                <div
                  className={`nav-sub-item ${activeTab === "procurement" && procurementSubTab === "equipment_purchase" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeTab("procurement");
                    if (onChangeProcurementSubTab) {
                      onChangeProcurementSubTab("equipment_purchase");
                    }
                  }}
                  style={getHiddenStyle("equipment_purchase")}
                >
                  - 기자재 구입∙운영
                  {isHidden("equipment_purchase") && (
                    <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                      [숨김]
                    </span>
                  )}
                </div>
              )}
              {(menuVisibility.major_services !== false || isSongDirector) && (
                <div
                  className={`nav-sub-item ${activeTab === "procurement" && procurementSubTab === "major_services" ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeTab("procurement");
                    if (onChangeProcurementSubTab) {
                      onChangeProcurementSubTab("major_services");
                    }
                  }}
                  style={getHiddenStyle("major_services")}
                >
                  - 주요 용역
                  {isHidden("major_services") && (
                    <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                      [숨김]
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {(menuVisibility.schedule !== false || isSongDirector) && (
            <div
              className={`schedule-nav-wrapper ${(activeTab === "schedule" || hoveredTab === "schedule") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("schedule")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "schedule" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("schedule");
                  if (onChangeScheduleSubTab) {
                    const subTabs = ["monthly", "events", "meetings", "committees", "press"];
                    const firstActive = subTabs.find(tab => isSongDirector || menuVisibility[tab] !== false) || "monthly";
                    onChangeScheduleSubTab(firstActive);
                  }
                }}
                style={getHiddenStyle("schedule")}
              >
                <Calendar size={24} />
                <span>
                  일정∙행사∙회의 관리
                  {isHidden("schedule") && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "bold", textDecoration: "none", display: "inline-block", marginLeft: "0.25rem" }}>
                      [숨김]
                    </span>
                  )}
                </span>
              </div>
              <div className="nav-sub-menu">
                {(menuVisibility.monthly !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "monthly" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("monthly");
                      }
                    }}
                    style={getHiddenStyle("monthly")}
                  >
                    - 월간 일정
                    {isHidden("monthly") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.events !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "events" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("events");
                      }
                    }}
                    style={getHiddenStyle("events")}
                  >
                    - 주요 행사
                    {isHidden("events") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.meetings !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "meetings" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("meetings");
                      }
                    }}
                    style={getHiddenStyle("meetings")}
                  >
                    - 회의결과 등록
                    {isHidden("meetings") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.committees !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "committees" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("committees");
                      }
                    }}
                    style={getHiddenStyle("committees")}
                  >
                    - 위원회 관리
                    {isHidden("committees") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.press !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "press" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("press");
                      }
                    }}
                    style={getHiddenStyle("press")}
                  >
                    - 언론보도
                    {isHidden("press") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className={`nav-item ${activeTab === "llm_wiki" ? "active" : ""}`}
            onClick={() => onChangeTab("llm_wiki")}
            style={{ marginTop: "0.2rem" }}
          >
            <BookOpen size={24} />
            <span>앵커Wiki</span>
          </div>

          {/* '사업단 관리' 메뉴는 로그인한 모든 사용자(연구원 및 게스트 포함)에게 노출합니다. 단, 내역별 권한 제한은 유지됩니다. */}
          {currentRole && (
            <div
              className={`mgmt-nav-wrapper ${(activeTab === "management" || hoveredTab === "management") ? "active" : ""}`}
              onMouseEnter={() => setHoveredTab("management")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`nav-item ${activeTab === "management" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("management");
                  if (onChangeMgmtSubTab) {
                    const isManager = currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR" || currentRole.id === "HQ_HEAD" || currentRole.id === "MANAGER";
                    const subTabsOrder = ["approvals", "members", "users", "programs", "org_chart", "center_org_chart", "partners", "portal_config"];

                    const firstActive = subTabsOrder.find(tab => {
                      if (tab === "portal_config") return currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR";
                      if (!isManager && ["approvals", "members", "users", "programs"].includes(tab)) return false;
                      return isSongDirector || menuVisibility[tab] !== false;
                    }) || "org_chart";

                    onChangeMgmtSubTab(firstActive);
                  }
                }}
              >
                <Users size={24} />
                <span>사업단 관리</span>
              </div>
              <div className="nav-sub-menu">
                {/* 관리자 권한 전용 서브 탭 가드 */}
                {(currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR" || currentRole.id === "HQ_HEAD" || currentRole.id === "MANAGER") && (
                  <>
                    {(menuVisibility.approvals !== false || isSongDirector) && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "approvals" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("approvals");
                          }
                        }}
                        style={getHiddenStyle("approvals")}
                      >
                        - 승인처리
                        {isHidden("approvals") && (
                          <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                            [숨김]
                          </span>
                        )}
                      </div>
                    )}
                    {(menuVisibility.members !== false || isSongDirector) && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "members" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("members");
                          }
                        }}
                        style={getHiddenStyle("members")}
                      >
                        - 구성원 관리
                        {isHidden("members") && (
                          <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                            [숨김]
                          </span>
                        )}
                      </div>
                    )}
                    {(menuVisibility.users !== false || isSongDirector) && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "users" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("users");
                          }
                        }}
                        style={getHiddenStyle("users")}
                      >
                        - 회원현황
                        {isHidden("users") && (
                          <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                            [숨김]
                          </span>
                        )}
                      </div>
                    )}
                    {(menuVisibility.programs !== false || isSongDirector) && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "programs" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("programs");
                          }
                        }}
                        style={getHiddenStyle("programs")}
                      >
                        - 프로그램 배정
                        {isHidden("programs") && (
                          <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                            [숨김]
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
                {/* 일반 공용 서브 탭 (대학조직도, 파트너기관) */}
                {(menuVisibility.org_chart !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "org_chart" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("management");
                      if (onChangeMgmtSubTab) {
                        onChangeMgmtSubTab("org_chart");
                      }
                    }}
                    style={getHiddenStyle("org_chart")}
                  >
                    - 대학조직도
                    {isHidden("org_chart") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.center_org_chart !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "center_org_chart" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("management");
                      if (onChangeMgmtSubTab) {
                        onChangeMgmtSubTab("center_org_chart");
                      }
                    }}
                    style={getHiddenStyle("center_org_chart")}
                  >
                    - 사업단 조직도
                    {isHidden("center_org_chart") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {(menuVisibility.partners !== false || isSongDirector) && (
                  <div
                    className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "partners" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("management");
                      if (onChangeMgmtSubTab) {
                        onChangeMgmtSubTab("partners");
                      }
                    }}
                    style={getHiddenStyle("partners")}
                  >
                    - 파트너기관
                    {isHidden("partners") && (
                      <span style={{ fontSize: "0.6rem", color: "#ef4444", textDecoration: "none", marginLeft: "0.2rem" }}>
                        [숨김]
                      </span>
                    )}
                  </div>
                )}
                {/* 앵커 포털 관리 서브 탭 (admin, g_director 권한 전용) */}
                {(currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR") && (
                  <div
                    className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "portal_config" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("management");
                      if (onChangeMgmtSubTab) {
                        onChangeMgmtSubTab("portal_config");
                      }
                    }}
                  >
                    - 앵커 포털 관리
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>


    </aside>
  );
}
