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
          {menuVisibility.dashboard !== false && (
            <div
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => onChangeTab("dashboard")}
            >
              <LayoutDashboard size={24} />
              <span>IR 대시보드</span>
            </div>
          )}

          {menuVisibility.progress !== false && (
            <div className={`progress-nav-wrapper ${activeTab === "progress" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "progress" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("progress");
                  if (onChangeProgressSubTab) {
                    // 켜져 있는 서브탭 중 첫 번째 탭으로 초기화 활성화
                    const subTabs = ["progress_status", "major_programs", "satisfaction_survey"];
                    const firstActive = subTabs.find(tab => menuVisibility[tab] !== false) || "progress_status";
                    onChangeProgressSubTab(firstActive);
                  }
                }}
              >
                <ClipboardList size={24} />
                <span>프로그램 진행</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.progress_status !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "progress" && progressSubTab === "progress_status" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("progress");
                      if (onChangeProgressSubTab) {
                        onChangeProgressSubTab("progress_status");
                      }
                    }}
                  >
                    - 프로그램 진행 상황
                  </div>
                )}
                {menuVisibility.major_programs !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "progress" && progressSubTab === "major_programs" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("progress");
                      if (onChangeProgressSubTab) {
                        onChangeProgressSubTab("major_programs");
                      }
                    }}
                  >
                    - 주요 프로그램
                  </div>
                )}
                {menuVisibility.satisfaction_survey !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "progress" && progressSubTab === "satisfaction_survey" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("progress");
                      if (onChangeProgressSubTab) {
                        onChangeProgressSubTab("satisfaction_survey");
                      }
                    }}
                  >
                    - 만족도 조사
                  </div>
                )}
              </div>
            </div>
          )}

          {menuVisibility.projects !== false && (
            <div className={`projects-nav-wrapper ${activeTab === "projects" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("projects");
                  if (onChangeProjectsSubTab) {
                    const subTabs = ["unit_status", "unit_system", "program_mgmt"];
                    const firstActive = subTabs.find(tab => menuVisibility[tab] !== false) || "unit_status";
                    onChangeProjectsSubTab(firstActive);
                  }
                }}
              >
                <FolderKanban size={24} />
                <span>단위과제 관리</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.unit_status !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "projects" && projectsSubTab === "unit_status" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("projects");
                      if (onChangeProjectsSubTab) {
                        onChangeProjectsSubTab("unit_status");
                      }
                    }}
                  >
                    - 단위과제 집행현황
                  </div>
                )}
                {menuVisibility.unit_system !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "projects" && projectsSubTab === "unit_system" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("projects");
                      if (onChangeProjectsSubTab) {
                        onChangeProjectsSubTab("unit_system");
                      }
                    }}
                  >
                    - 단위과제 체계
                  </div>
                )}
                {menuVisibility.program_mgmt !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "projects" && projectsSubTab === "program_mgmt" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("projects");
                      if (onChangeProjectsSubTab) {
                        onChangeProjectsSubTab("program_mgmt");
                      }
                    }}
                  >
                    - 프로그램 관리
                  </div>
                )}
              </div>
            </div>
          )}

          {menuVisibility.budget !== false && (
            <div className={`budget-nav-wrapper ${activeTab === "budget" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "budget" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("budget");
                  if (onChangeBudgetSubTab) {
                    const subTabs = ["budget_categories", "execution_rate"];
                    const schemaMapping = { "budget_categories": "settlement", "execution_rate": "execution" };
                    const firstActive = subTabs.find(tab => menuVisibility[schemaMapping[tab]] !== false) || "budget_categories";
                    onChangeBudgetSubTab(firstActive);
                  }
                }}
              >
                <Landmark size={24} />
                <span>예산 관리</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.settlement !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "budget" && budgetSubTab === "budget_categories" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("budget");
                      if (onChangeBudgetSubTab) {
                        onChangeBudgetSubTab("budget_categories");
                      }
                    }}
                  >
                    - 비목별 관리
                  </div>
                )}
                {menuVisibility.execution !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "budget" && budgetSubTab === "execution_rate" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("budget");
                      if (onChangeBudgetSubTab) {
                        onChangeBudgetSubTab("execution_rate");
                      }
                    }}
                  >
                    - 집행률 관리
                  </div>
                )}
              </div>
            </div>
          )}

          {menuVisibility.kpis !== false && (
            <div className={`kpis-nav-wrapper ${activeTab === "kpis" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "kpis" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("kpis");
                  if (onChangeKpiSubTab) {
                    const subTabs = ["공통", "자율", "중점"];
                    const schemaMapping = { "공통": "kpi_status", "자율": "kpi_mgmt", "중점": "kpi_mgmt" };
                    const firstActive = subTabs.find(tab => menuVisibility[schemaMapping[tab]] !== false) || "공통";
                    onChangeKpiSubTab(firstActive);
                  }
                }}
              >
                <FileBarChart2 size={24} />
                <span>성과지표 관리</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.kpi_status !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "kpis" && kpiSubTab === "공통" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("kpis");
                      if (onChangeKpiSubTab) {
                        onChangeKpiSubTab("공통");
                      }
                    }}
                  >
                    - (교육부)공통성과지표
                  </div>
                )}
                {menuVisibility.kpi_mgmt !== false && (
                  <>
                    <div
                      className={`nav-sub-item ${activeTab === "kpis" && kpiSubTab === "자율" ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTab("kpis");
                        if (onChangeKpiSubTab) {
                          onChangeKpiSubTab("자율");
                        }
                      }}
                    >
                      - (지자체)자율성과지표
                    </div>
                    <div
                      className={`nav-sub-item ${activeTab === "kpis" && kpiSubTab === "중점" ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTab("kpis");
                        if (onChangeKpiSubTab) {
                          onChangeKpiSubTab("중점");
                        }
                      }}
                    >
                      - (대학)중점관리지표
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {menuVisibility.agreements !== false && (
            <div className={`agreements-nav-wrapper ${activeTab === "agreements" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "agreements" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("agreements");
                  if (onChangeAgreementsSubTab) {
                    const subTabs = ["agreements", "certificates", "awards"];
                    const firstActive = subTabs.find(tab => menuVisibility[tab] !== false) || "agreements";
                    onChangeAgreementsSubTab(firstActive);
                  }
                }}
              >
                <Award size={24} />
                <span>협약∙발급 관리</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.agreements !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "agreements" && agreementsSubTab === "agreements" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("agreements");
                      if (onChangeAgreementsSubTab) {
                        onChangeAgreementsSubTab("agreements");
                      }
                    }}
                  >
                    - 협약 관리
                  </div>
                )}
                {menuVisibility.certificates !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "agreements" && agreementsSubTab === "certificates" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("agreements");
                      if (onChangeAgreementsSubTab) {
                        onChangeAgreementsSubTab("certificates");
                      }
                    }}
                  >
                    - 이수증 관리
                  </div>
                )}
                {menuVisibility.awards !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "agreements" && agreementsSubTab === "awards" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("agreements");
                      if (onChangeAgreementsSubTab) {
                        onChangeAgreementsSubTab("awards");
                      }
                    }}
                  >
                    - 상장 관리
                  </div>
                )}
              </div>
            </div>
          )}

          {menuVisibility.procurement !== false && (
            <div className={`procurement-nav-wrapper ${activeTab === "procurement" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "procurement" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("procurement");
                  if (onChangeProcurementSubTab) {
                    const subTabs = ["env_improvement", "equipment_purchase", "major_services"];
                    const firstActive = subTabs.find(tab => menuVisibility[tab] !== false) || "env_improvement";
                    onChangeProcurementSubTab(firstActive);
                  }
                }}
              >
                <Briefcase size={24} />
                <span>구매용역 관리</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.env_improvement !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "procurement" && procurementSubTab === "env_improvement" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("procurement");
                      if (onChangeProcurementSubTab) {
                        onChangeProcurementSubTab("env_improvement");
                      }
                    }}
                  >
                    - 환경개선
                  </div>
                )}
                {menuVisibility.equipment_purchase !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "procurement" && procurementSubTab === "equipment_purchase" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("procurement");
                      if (onChangeProcurementSubTab) {
                        onChangeProcurementSubTab("equipment_purchase");
                      }
                    }}
                  >
                    - 기자재 구입∙운영
                  </div>
                )}
                {menuVisibility.major_services !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "procurement" && procurementSubTab === "major_services" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("procurement");
                      if (onChangeProcurementSubTab) {
                        onChangeProcurementSubTab("major_services");
                      }
                    }}
                  >
                    - 주요 용역
                  </div>
                )}
              </div>
            </div>
          )}

          {menuVisibility.schedule !== false && (
            <div className={`schedule-nav-wrapper ${activeTab === "schedule" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "schedule" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("schedule");
                  if (onChangeScheduleSubTab) {
                    const subTabs = ["monthly", "events", "meetings", "committees", "press"];
                    const firstActive = subTabs.find(tab => menuVisibility[tab] !== false) || "monthly";
                    onChangeScheduleSubTab(firstActive);
                  }
                }}
              >
                <Calendar size={24} />
                <span>일정∙행사∙회의 관리</span>
              </div>
              <div className="nav-sub-menu">
                {menuVisibility.monthly !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "monthly" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("monthly");
                      }
                    }}
                  >
                    - 월간 일정
                  </div>
                )}
                {menuVisibility.events !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "events" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("events");
                      }
                    }}
                  >
                    - 주요 행사
                  </div>
                )}
                {menuVisibility.meetings !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "meetings" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("meetings");
                      }
                    }}
                  >
                    - 회의록 등록
                  </div>
                )}
                {menuVisibility.committees !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "committees" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("committees");
                      }
                    }}
                  >
                    - 위원회 관리
                  </div>
                )}
                {menuVisibility.press !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "schedule" && scheduleSubTab === "press" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("schedule");
                      if (onChangeScheduleSubTab) {
                        onChangeScheduleSubTab("press");
                      }
                    }}
                  >
                    - 언론보도
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

          {/* 모든 역할(연구원 포함)이 사업단 관리 메뉴에 접근하여 대학조직도/파트너기관을 볼 수 있도록 허용합니다. */}
          {currentRole && (
            <div className={`mgmt-nav-wrapper ${activeTab === "management" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "management" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("management");
                  if (onChangeMgmtSubTab) {
                    const isManager = currentRole.id === "ADMIN" || currentRole.id === "DIRECTOR" || currentRole.id === "HQ_HEAD";
                    const subTabsOrder = ["approvals", "members", "users", "programs", "org_chart", "partners", "portal_config"];
                    
                    const firstActive = subTabsOrder.find(tab => {
                      if (tab === "portal_config") return isSongDirector;
                      if (!isManager && ["approvals", "members", "users", "programs"].includes(tab)) return false;
                      return menuVisibility[tab] !== false;
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
                {(currentRole.id === "ADMIN" || currentRole.id === "DIRECTOR" || currentRole.id === "HQ_HEAD") && (
                  <>
                    {menuVisibility.approvals !== false && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "approvals" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("approvals");
                          }
                        }}
                      >
                        - 승인처리
                      </div>
                    )}
                    {menuVisibility.members !== false && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "members" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("members");
                          }
                        }}
                      >
                        - 구성원 관리
                      </div>
                    )}
                    {menuVisibility.users !== false && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "users" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("users");
                          }
                        }}
                      >
                        - 회원현황
                      </div>
                    )}
                    {menuVisibility.programs !== false && (
                      <div
                        className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "programs" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeTab("management");
                          if (onChangeMgmtSubTab) {
                            onChangeMgmtSubTab("programs");
                          }
                        }}
                      >
                        - 프로그램 배정
                      </div>
                    )}
                  </>
                )}
                {/* 일반 공용 서브 탭 (대학조직도, 파트너기관) */}
                {menuVisibility.org_chart !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "org_chart" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("management");
                      if (onChangeMgmtSubTab) {
                        onChangeMgmtSubTab("org_chart");
                      }
                    }}
                  >
                    - 대학조직도
                  </div>
                )}
                {menuVisibility.partners !== false && (
                  <div
                    className={`nav-sub-item ${activeTab === "management" && mgmtSubTab === "partners" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeTab("management");
                      if (onChangeMgmtSubTab) {
                        onChangeMgmtSubTab("partners");
                      }
                    }}
                  >
                    - 파트너기관
                  </div>
                )}
                {/* 앵커 포털 관리 서브 탭 (송경영 단장님 전용) */}
                {isSongDirector && (
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
