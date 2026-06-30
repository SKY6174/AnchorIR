import React from "react";
import { userRoles } from "../data/mockData";
import { LayoutDashboard, Users, FileBarChart2, FolderKanban, Award, Landmark, ClipboardList } from "lucide-react";

export default function Sidebar({ currentRole, onChangeRole, activeTab, onChangeTab, projectsSubTab, onChangeProjectsSubTab }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo-section">
          <Award className="logo-icon" size={28} />
          <span className="logo-text">UC ANCHOR Portal</span>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onChangeTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>IR 대시보드</span>
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
              <FolderKanban size={18} />
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

          <div
            className={`nav-item ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => onChangeTab("progress")}
          >
            <ClipboardList size={18} />
            <span>프로그램 진행</span>
          </div>

          <div
            className={`nav-item ${activeTab === "budget-items" ? "active" : ""}`}
            onClick={() => onChangeTab("budget-items")}
          >
            <Landmark size={18} />
            <span>예산항목 관리</span>
          </div>

          <div
            className={`nav-item ${activeTab === "kpis" ? "active" : ""}`}
            onClick={() => onChangeTab("kpis")}
          >
            <FileBarChart2 size={18} />
            <span>성과지표 관리</span>
          </div>

          {(currentRole.id === "DIRECTOR" || currentRole.id === "HQ_HEAD") && (
            <div
              className={`nav-item ${activeTab === "management" ? "active" : ""}`}
              onClick={() => onChangeTab("management")}
            >
              <Users size={18} />
              <span>사업단 관리</span>
            </div>
          )}
        </nav>
      </div>

      <div className="user-profile-card">
        <div style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>
            현재 로그인 권한
          </span>
          <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>{currentRole.name}</span>
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)", lineHeight: "1.2" }}>
          {currentRole.desc}
        </p>
      </div>
    </aside>
  );
}
