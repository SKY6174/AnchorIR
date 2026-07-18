import React, { useState } from "react";
import { Settings, Save, RotateCcw, ShieldAlert } from "lucide-react";

// 대시보드에 노출되는 전체 메인 메뉴(탭) 및 서브메뉴(서브탭) 트리 정보 정의 (사이드바 명칭과 100% 동기화)
const MENU_SCHEMA = [
  {
    key: "dashboard",
    label: "IR 대시보드",
    description: "전체 핵심 성과 지표(KPI) 요약 및 달성률 정보 제공",
    subMenus: []
  },
  {
    key: "projects",
    label: "단위과제 관리",
    description: "단위과제별 세부 사업 예산 집행률 및 위계 체계 관리",
    subMenus: [
      { key: "unit_system", label: "단위과제 체계" },
      { key: "unit_status", label: "단위과제 진행상황" },
      { key: "program_mgmt", label: "프로그램 관리" }
    ]
  },
  {
    key: "progress",
    label: "프로그램 진행",
    description: "각 프로그램 진행 단계 관리 및 만족도 조사 추이 추적",
    subMenus: [
      { key: "progress_status", label: "프로그램 진행 상황" },
      { key: "major_programs", label: "주요 프로그램" },
      { key: "satisfaction_survey", label: "만족도 조사" }
    ]
  },
  {
    key: "budget",
    label: "예산 관리",
    description: "월별 본예산 및 이월예산 집행 현황과 꺾은선 차트 분석",
    subMenus: [
      { key: "settlement", label: "비목별 관리" },
      { key: "execution", label: "집행률 관리" }
    ]
  },
  {
    key: "kpis",
    label: "성과지표 관리",
    description: "성과지표 목록 관리 및 목표치/실적 입력 조율",
    subMenus: [
      { key: "kpi_status", label: "(교육부)공통성과지표" },
      { key: "kpi_self", label: "(지자체)자율성과지표" },
      { key: "kpi_focus", label: "(대학)중점관리지표" }
    ]
  },
  {
    key: "agreements",
    label: "협약∙발급 관리",
    description: "유관기관(산업체, 지역사회, 대학 등) 협약 대장 및 교육 이수증, 상장 발급 기록 대장",
    subMenus: [
      { key: "agreements", label: "협약 관리" },
      { key: "unified_certificates", label: "상장∙이수증 관리" }
    ]
  },
  {
    key: "procurement",
    label: "구매∙용역 관리",
    description: "교육환경 개선, 기자재 구매 및 주요 용역 추진 과정 관리",
    subMenus: [
      { key: "env_improvement", label: "환경개선" },
      { key: "equipment_purchase", label: "기자재 구매" },
      { key: "major_services", label: "주요 용역" }
    ]
  },
  {
    key: "asset",
    label: "자산 관리",
    description: "교육 환경 예약 신청 및 사업 기자재(AI∙DX/기타) 현황 모니터링",
    subMenus: [
      { key: "education_env", label: "교육환경 관리" },
      { key: "equipment", label: "기자재 관리" }
    ]
  },
  {
    key: "schedule",
    label: "일정∙행사∙회의 관리",
    description: "월간 사업 일정, 주요 행사 관리 및 회의결과 회의록, 언론보도 대장",
    subMenus: [
      { key: "monthly", label: "월간 일정" },
      { key: "events", label: "주요 행사" },
      { key: "meetings", label: "회의결과 등록" },
      { key: "press", label: "언론보도" }
    ]
  },
  {
    key: "committee",
    label: "위원회 관리",
    description: "각종 사업단위원회 회의 소집, 의결서 취합 및 AI 분석 결과보고 대장 관리",
    subMenus: [
      { key: "committee_meeting", label: "회의 운영 및 의결" },
      { key: "committee_report", label: "위원회 결과보고 대장" }
    ]
  },
  {
    key: "management",
    label: "사업단 관리",
    description: "구성원 관리, 회원가입 승인, 대학 조직도, 위원회 및 협력기관 정보 제어",
    subMenus: [
      { key: "approvals", label: "승인처리" },
      { key: "members", label: "구성원 관리" },
      { key: "users", label: "회원현황" },
      { key: "programs", label: "프로그램 배정" },
      { key: "org_chart", label: "대학 조직도" },
      { key: "center_org_chart", label: "사업단 조직도" },
      { key: "committees", label: "위원회 관리" },
      { key: "partners", label: "협력기관 관리" },
      { key: "instructor_pool", label: "교∙강사 Pool 관리" }
    ]
  },
  {
    key: "llm_wiki",
    label: "앵커Wiki",
    description: "앵커사업 지식 공유 및 인공지능 위키백과 정보 제공",
    subMenus: []
  }
];

export default function PortalConfigManager({ initialVisibility, onSave }) {
  // 현재 설정된 메뉴 활성화 상태 (기본값: 모두 true)
  const [visibility, setVisibility] = useState(() => {
    const base = {};
    MENU_SCHEMA.forEach(m => {
      base[m.key] = initialVisibility[m.key] !== false;
      m.subMenus.forEach(s => {
        base[s.key] = initialVisibility[s.key] !== false;
      });
    });
    return base;
  });

  // 메인 메뉴(탭) 토글 핸들러 (자식 연동 작동)
  const handleParentToggle = (parentKey, isChecked) => {
    const next = { ...visibility };
    next[parentKey] = isChecked;

    // 1) 메인 메뉴가 꺼지면 하위의 모든 서브메뉴도 전부 비활성화 처리
    // 2) 메인 메뉴가 켜지면 하위의 모든 서브메뉴도 전부 활성화 처리
    const parentMenu = MENU_SCHEMA.find(m => m.key === parentKey);
    if (parentMenu && parentMenu.subMenus) {
      parentMenu.subMenus.forEach(sub => {
        next[sub.key] = isChecked;
      });
    }
    setVisibility(next);
  };

  // 서브메뉴(서브탭) 토글 핸들러 (부모 연동 작동)
  const handleSubToggle = (parentKey, subKey, isChecked) => {
    const next = { ...visibility };
    next[subKey] = isChecked;

    const parentMenu = MENU_SCHEMA.find(m => m.key === parentKey);
    if (parentMenu && parentMenu.subMenus) {
      if (isChecked) {
        // 3) 서브메뉴 중 하나라도 체크하여 활성화되면, 부모 메인 메뉴도 자동으로 켜짐
        next[parentKey] = true;
      } else {
        // 4) 부모 아래의 모든 서브메뉴가 해제(체크아웃)되면, 부모 메인 메뉴도 자동으로 꺼짐
        const anyActive = parentMenu.subMenus.some(sub => sub.key !== subKey && next[sub.key] !== false);
        if (!anyActive) {
          next[parentKey] = false;
        }
      }
    }
    setVisibility(next);
  };

  // 변경한 설정을 로컬 스토리지에 최종 반영하고 상위 부모 컴포넌트에 통지
  const handleSaveConfig = () => {
    onSave(visibility);
    alert("💾 포털 메뉴 및 서브탭 활성화 설정이 실시간으로 동기화되어 반영되었습니다!");
  };

  // 설정을 모든 메뉴 활성화(초기화) 상태로 롤백
  const handleResetConfig = () => {
    if (confirm("정말 모든 메뉴와 서브탭을 기본 활성화 상태로 복원하시겠습니까?")) {
      const reset = {};
      MENU_SCHEMA.forEach(m => {
        reset[m.key] = true;
        m.subMenus.forEach(s => {
          reset[s.key] = true;
        });
      });
      setVisibility(reset);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>

      {/* 타이틀 및 안내 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Settings size={22} />
          앵커 포털 관리 및 메뉴 노출 설정
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          대시보드 사이드바 및 하위 정산 탭에 노출되는 메인 메뉴(탭)와 서브메뉴(서브탭)의 노출 여부를 실시간으로 제어합니다.<br />
          <strong>* 송경영 사업단장(G_DIRECTOR) 전용 관리용 특수 제어 모듈입니다.</strong>
        </p>
      </div>

      {/* 보안 경고 배너 */}
      <div style={{
        background: "rgba(59, 130, 246, 0.08)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "8px",
        padding: "0.85rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem"
      }}>
        <ShieldAlert size={20} style={{ color: "var(--accent-color)", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)" }}>
            [안내] 메뉴-서브메뉴 노출 제어 및 연계성 규칙
          </h4>
          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            메인 메뉴를 체크 해제하면 하위 서브메뉴들도 전부 함께 꺼지며 화면에서 소거됩니다.<br />
            반대로, 꺼져 있던 서브메뉴를 체크하면 부모 메인 메뉴가 자동으로 함께 켜져 정상적으로 내비게이션 바에 복원됩니다.
          </p>
        </div>
      </div>

      {/* 설정 테이블/트리 구조 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* 제어 컨트롤 툴바 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button
            onClick={handleResetConfig}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 1rem", fontSize: "0.8rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer", borderRadius: "0.3rem" }}
          >
            전체 초기화
          </button>
          <button
            onClick={handleSaveConfig}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 1rem", fontSize: "0.8rem", background: "var(--accent-color)", color: "white", border: "none", cursor: "pointer", borderRadius: "0.3rem", fontWeight: "700" }}
          >
            설정 저장 및 즉시 반영
          </button>
        </div>

        {/* 메뉴 목록 리스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {MENU_SCHEMA.map((menu) => {
            const isParentChecked = visibility[menu.key] !== false;
            return (
              <div
                key={menu.key}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  background: isParentChecked ? "transparent" : "rgba(0,0,0,0.02)",
                  overflow: "hidden",
                  opacity: isParentChecked ? 1 : 0.65,
                  transition: "opacity 0.2s ease"
                }}
              >

                {/* 메인 메뉴(부모) 헤더 행 */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1.25rem",
                  background: "var(--background-card, rgba(0,0,0,0.02))",
                  borderBottom: menu.subMenus.length > 0 ? "1px solid var(--border-color)" : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <input
                      type="checkbox"
                      id={`parent-${menu.key}`}
                      checked={isParentChecked}
                      onChange={(e) => handleParentToggle(menu.key, e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "var(--accent-color)"
                      }}
                    />
                    <label
                      htmlFor={`parent-${menu.key}`}
                      style={{ fontSize: "0.92rem", fontWeight: "800", color: "var(--text-primary)", cursor: "pointer" }}
                    >
                      {menu.label}
                    </label>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      ({menu.description})
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: isParentChecked ? "rgba(59, 130, 246, 0.1)" : "var(--border-color)", color: isParentChecked ? "var(--accent-color)" : "var(--text-secondary)", fontWeight: "700" }}>
                    {isParentChecked ? "사용 중" : "숨김 상태"}
                  </span>
                </div>

                {/* 서브메뉴(자식) 리스트 영역 */}
                {menu.subMenus.length > 0 && (
                  <div style={{
                    padding: "1rem 1.5rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    background: "rgba(0,0,0,0.01)"
                  }}>
                    {menu.subMenus.map((sub) => {
                      const isSubChecked = visibility[sub.key] !== false;
                      return (
                        <div
                          key={sub.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem",
                            borderRadius: "4px",
                            background: isSubChecked ? "rgba(59, 130, 246, 0.03)" : "transparent"
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`sub-${sub.key}`}
                            checked={isSubChecked}
                            onChange={(e) => handleSubToggle(menu.key, sub.key, e.target.checked)}
                            style={{
                              width: "14px",
                              height: "14px",
                              cursor: "pointer",
                              accentColor: "var(--accent-color)"
                            }}
                          />
                          <label
                            htmlFor={`sub-${sub.key}`}
                            style={{
                              fontSize: "0.82rem",
                              color: isSubChecked ? "var(--text-primary)" : "var(--text-secondary)",
                              cursor: "pointer",
                              fontWeight: isSubChecked ? "700" : "normal"
                            }}
                          >
                            {sub.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
