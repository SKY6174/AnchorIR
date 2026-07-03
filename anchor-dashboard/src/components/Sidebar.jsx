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
  onChangeAgreementsSubTab
}) {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo-section">
          <img src="/logo.png" alt="울산과학대학교 로고" className="logo-img" />
          <span className="logo-text">ANCHOR Portal</span>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onChangeTab("dashboard")}
          >
            <LayoutDashboard size={24} />
            <span>IR 대시보드</span>
          </div>

          <div
            className={`nav-item ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => onChangeTab("progress")}
          >
            <ClipboardList size={24} />
            <span>프로그램 진행</span>
          </div>

          <div className={`projects-nav-wrapper ${activeTab === "projects" ? "active" : ""}`}>
            <div
              className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("projects");
                if (onChangeProjectsSubTab) {
                  onChangeProjectsSubTab("unit_status");
                }
              }}
            >
              <FolderKanban size={24} />
              <span>단위과제 관리</span>
            </div>
            <div className="nav-sub-menu">
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
            </div>
          </div>

          <div className={`budget-nav-wrapper ${activeTab === "budget" ? "active" : ""}`}>
            <div
              className={`nav-item ${activeTab === "budget" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("budget");
                if (onChangeBudgetSubTab) {
                  onChangeBudgetSubTab("budget_categories");
                }
              }}
            >
              <Landmark size={24} />
              <span>예산 관리</span>
            </div>
            <div className="nav-sub-menu">
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
            </div>
          </div>

          <div className={`kpis-nav-wrapper ${activeTab === "kpis" ? "active" : ""}`}>
            <div
              className={`nav-item ${activeTab === "kpis" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("kpis");
                if (onChangeKpiSubTab) {
                  onChangeKpiSubTab("자율");
                }
              }}
            >
              <FileBarChart2 size={24} />
              <span>성과지표 관리</span>
            </div>
            <div className="nav-sub-menu">
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
            </div>
          </div>

          <div className={`agreements-nav-wrapper ${activeTab === "agreements" ? "active" : ""}`}>
            <div
              className={`nav-item ${activeTab === "agreements" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("agreements");
                if (onChangeAgreementsSubTab) {
                  onChangeAgreementsSubTab("agreements");
                }
              }}
            >
              <Award size={24} />
              <span>협약∙발급 관리</span>
            </div>
            <div className="nav-sub-menu">
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
            </div>
          </div>

          <div className={`procurement-nav-wrapper ${activeTab === "procurement" ? "active" : ""}`}>
            <div
              className={`nav-item ${activeTab === "procurement" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("procurement");
                if (onChangeProcurementSubTab) {
                  onChangeProcurementSubTab("env_improvement");
                }
              }}
            >
              <Briefcase size={24} />
              <span>구매용역 관리</span>
            </div>
            <div className="nav-sub-menu">
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
            </div>
          </div>

          <div className={`schedule-nav-wrapper ${activeTab === "schedule" ? "active" : ""}`}>
            <div
              className={`nav-item ${activeTab === "schedule" ? "active" : ""}`}
              onClick={() => {
                onChangeTab("schedule");
                if (onChangeScheduleSubTab) {
                  onChangeScheduleSubTab("monthly");
                }
              }}
            >
              <Calendar size={24} />
              <span>일정 관리</span>
            </div>
            <div className="nav-sub-menu">
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
            </div>
          </div>

          <div
            className={`nav-item ${activeTab === "llm_wiki" ? "active" : ""}`}
            onClick={() => onChangeTab("llm_wiki")}
            style={{ marginTop: "0.2rem" }}
          >
            <BookOpen size={24} />
            <span>앵커Wiki</span>
          </div>

          {(currentRole.id === "ADMIN" || currentRole.id === "DIRECTOR" || currentRole.id === "HQ_HEAD") && (
            <div className={`mgmt-nav-wrapper ${activeTab === "management" ? "active" : ""}`}>
              <div
                className={`nav-item ${activeTab === "management" ? "active" : ""}`}
                onClick={() => {
                  onChangeTab("management");
                  if (onChangeMgmtSubTab) {
                    onChangeMgmtSubTab("members");
                  }
                }}
              >
                <Users size={24} />
                <span>사업단 관리</span>
              </div>
              <div className="nav-sub-menu">
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
              </div>
            </div>
          )}
        </nav>
      </div>


    </aside>
  );
}
