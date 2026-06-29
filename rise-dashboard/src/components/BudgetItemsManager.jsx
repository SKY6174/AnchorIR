import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Wallet, Info, FileEdit, CheckCircle } from "lucide-react";

// 백만원 단위 포맷팅 헬퍼 함수
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Math.round(value / 1000000).toLocaleString();
};

// 긴 비목명을 분리하기 위한 헬퍼 함수 (모바일에서는 축약 처리)
const splitLabel = (val, isMobile) => {
  if (isMobile) {
    const mobileMappings = {
      "교육∙연구 프로그램 개발∙운영비": ["교육프로그램"],
      "실험∙실습장비 및 기자재 구입∙운영비": ["실험실습장비"],
      "지역 연계∙협업 지원비": ["지역연계협업"],
      "기업 지원∙협력 활동비": ["기업지원협력"],
      "성과 활용∙확산 지원비": ["성과활용확산"],
      "그 밖의 사업운영경비": ["기타운영경비"],
      "교육∙연구 환경개선비": ["환경개선비"],
      "인건비": ["인건비"],
      "장학금": ["장학금"],
      "간접비": ["간접비"]
    };
    return mobileMappings[val] || [val];
  }

  const mappings = {
    "교육∙연구 프로그램 개발∙운영비": ["교육∙연구", "프로그램 개발", "∙운영비"],
    "실험∙실습장비 및 기자재 구입∙운영비": ["실험∙실습장비", "및 기자재", "구입∙운영비"],
    "지역 연계∙협업 지원비": ["지역 연계", "∙협업 지원비"],
    "기업 지원∙협력 활동비": ["기업 지원", "∙협력 활동비"],
    "성과 활용∙확산 지원비": ["성과 활용", "∙확산 지원비"],
    "그 밖의 사업운영경비": ["그 밖의", "사업운영경비"],
    "교육∙연구 환경개선비": ["교육∙연구", "환경개선비"]
  };
  return mappings[val] || [val];
};

// Recharts x축 긴 라벨용 커스텀 틱 컴포넌트 (최대 3줄 표출 및 간격 조정, 모바일 축약 대응)
const CustomizedAxisTick = (props) => {
  const { x, y, payload, isMobile } = props;
  const val = payload.value;
  if (!val) return null;

  const lines = splitLabel(val, isMobile);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={28} textAnchor="middle" fill="var(--text-secondary-dark)" style={{ fontSize: isMobile ? "0.55rem" : "0.62rem", fontWeight: "600", lineHeight: "1.4" }}>
        {lines.map((line, idx) => (
          <tspan key={idx} x={0} dy={idx === 0 ? 0 : 11}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

export default function BudgetItemsManager({ projects, currentRole, onUpdateBudgetDetails, selectedYear }) {
  const [selectedUnitId, setSelectedUnitId] = useState("A-1-가");
  const [editedBudgets, setEditedBudgets] = useState({}); // {budgetName: {budget_main: '', budget_carry: ''}}
  const [feedback, setFeedback] = useState("");
  
  // 서브탭 상태 관리: "main" (본사업비) 또는 "carry" (이월사업비)
  const [subTab, setSubTab] = useState("main");

  // 모바일 화면 감지 상태 (가로폭 768px 미만)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 모든 단위과제 수집
  const allUnits = [];
  projects.forEach(p => {
    p.units.forEach(u => {
      allUnits.push({ ...u, projectTitle: p.title });
    });
  });

  // 10개 표준 비목 목록 정의
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

  // 선택 연차별 전체 예산 및 누적 집행액 구하기
  let totalMainBudget = 0;
  let totalCarryBudget = 0;
  let totalMainSpent = 0;
  let totalCarrySpent = 0;
  projects.forEach((p) => {
    p.units.forEach((u) => {
      const yr = u.years?.[selectedYear] || { budget_main: 0, budget_carry: 0, spent_main: 0, spent_carry: 0 };
      totalMainBudget += (yr.budget_main || 0);
      totalCarryBudget += (yr.budget_carry || 0);
      totalMainSpent += (yr.spent_main || 0);
      totalCarrySpent += (yr.spent_carry || 0);
    });
  });
  const totalCombinedBudget = totalMainBudget + totalCarryBudget;

  // 담당부서 맵핑 정의 (공통경비가 포함된 사업운영팀이 최상단 배치)
  const DEPARTMENTS = [
    { name: "사업운영팀", ids: ["Common"] },
    { name: "ECC센터", ids: ["A-1-가", "A-2", "A-3"] },
    { name: "신산업특화센터", ids: ["A-1-나"] },
    { name: "ICC센터", ids: ["B-1", "B-3", "B-4"] },
    { name: "AID-X지원센터", ids: ["B-2"] },
    { name: "울산늘봄누리센터", ids: ["B-2"] },
    { name: "RCC센터", ids: ["C-1", "D-1", "D-2", "D-3"] }
  ];

  // 선택된 단위과제 및 프로젝트 제목 찾기 또는 전체사업 가상 유닛 빌드
  let activeUnit = null;
  let activeProjectTitle = "";
  
  if (selectedUnitId === "Total") {
    activeProjectTitle = "울산과학대학교 라이즈(앵커) 사업단";
    
    // 가상의 budgetDetails 생성하여 모든 단위과제의 비목 데이터를 실시간으로 합산
    const combinedDetails = {};
    BUDGET_ITEM_NAMES.forEach(bName => {
      combinedDetails[bName] = {
        years: {
          [selectedYear]: {
            budget_main: 0,
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0
          }
        }
      };
    });

    projects.forEach(p => {
      p.units.forEach(u => {
        if (!u.budgetDetails) return;
        Object.keys(u.budgetDetails).forEach(bName => {
          const detailYear = u.budgetDetails[bName]?.years?.[selectedYear] || {};
          if (combinedDetails[bName]) {
            const tgt = combinedDetails[bName].years[selectedYear];
            tgt.budget_main += (detailYear.budget_main || 0);
            tgt.spent_main += (detailYear.spent_main || 0);
            tgt.budget_carry += (detailYear.budget_carry || 0);
            tgt.spent_carry += (detailYear.spent_carry || 0);
          }
        });
      });
    });

    activeUnit = {
      id: "Total",
      title: "전체 사업 예산 현황",
      years: {
        [selectedYear]: {
          budget_main: totalMainBudget,
          spent_main: totalMainSpent,
          budget_carry: totalCarryBudget,
          spent_carry: totalCarrySpent
        }
      },
      budgetDetails: combinedDetails
    };
  } else {
    for (const p of projects) {
      const found = p.units.find(u => u.id === selectedUnitId);
      if (found) {
        activeUnit = found;
        activeProjectTitle = p.title;
        break;
      }
    }
  }

  // 선택된 단위가 바뀔 때 혹은 연차가 바뀔 때 사용자가 편집하던 값 초기화 (백만원 단위로 환산하여 Input 기본값 제공)
  useEffect(() => {
    if (!activeUnit) return;
    const init = {};
    const details = activeUnit.budgetDetails || {};
    Object.keys(details).forEach(key => {
      const detailYear = details[key].years?.[selectedYear] || {};
      init[key] = {
        budget_main: Math.round((detailYear.budget_main || 0) / 1000000).toString(),
        budget_carry: Math.round((detailYear.budget_carry || 0) / 1000000).toString()
      };
    });
    setEditedBudgets(init);
  }, [selectedUnitId, selectedYear, projects]);

  const handleSelectUnit = (unit) => {
    setSelectedUnitId(unit.id);
    setFeedback("");
  };

  // 실시간 입력값 상태 동기화 핸들러
  const handleBudgetChange = (bName, field, val) => {
    setEditedBudgets(prev => ({
      ...prev,
      [bName]: { ...prev[bName], [field]: val }
    }));
  };

  // 예산 배정액 적용 처리 핸들러
  const handleSaveBudgetDetails = (e) => {
    e.preventDefault();
    if (!activeUnit) return;

    let newTotalMain = 0;
    let newTotalCarry = 0;
    const parsedDetails = {};

    // 1. 모든 비목 데이터를 순회하며 정수 변환 및 유효성 검사 수행
    for (const key of Object.keys(activeUnit.budgetDetails)) {
      const rawMain = parseInt(editedBudgets[key]?.budget_main || "0", 10) * 1000000;
      const rawCarry = parseInt(editedBudgets[key]?.budget_carry || "0", 10) * 1000000;
      
      if (isNaN(rawMain) || rawMain < 0 || isNaN(rawCarry) || rawCarry < 0) {
        alert(`'${key}' 비목에 올바른 숫자를 입력해주세요.`);
        return;
      }
      
      const currentSpentMain = activeUnit.budgetDetails[key].years?.[selectedYear]?.spent_main || 0;
      const currentSpentCarry = activeUnit.budgetDetails[key].years?.[selectedYear]?.spent_carry || 0;
      
      // 이미 집행된 실적 이하로 예산을 축소 배정하는 것을 방지하는 정합성 체크
      if (rawMain < currentSpentMain) {
        alert(`'${key}' 비목의 본예산은 현재 누적 집행액보다 크거나 같아야 합니다.`);
        return;
      }
      if (rawCarry < currentSpentCarry) {
        alert(`'${key}' 비목의 이월예산은 현재 누적 집행액보다 크거나 같아야 합니다.`);
        return;
      }
      
      newTotalMain += rawMain;
      newTotalCarry += rawCarry;
      parsedDetails[key] = {
        years: {
          [selectedYear]: {
            budget_main: rawMain,
            spent_main: currentSpentMain,
            budget_carry: rawCarry,
            spent_carry: currentSpentCarry
          }
        }
      };
    }

    // 2. 한도 초과 검사 (단위과제의 연도별 한도 검증)
    const unitYear = activeUnit.years?.[selectedYear] || {};
    if (newTotalMain > (unitYear.budget_main || 0)) {
      alert(`수정한 본예산 총합(${newTotalMain.toLocaleString()}원)이 해당 단위과제 본예산 한도(${(unitYear.budget_main || 0).toLocaleString()}원)를 초과합니다.`);
      return;
    }
    if (newTotalCarry > (unitYear.budget_carry || 0)) {
      alert(`수정한 이월예산 총합(${newTotalCarry.toLocaleString()}원)이 해당 단위과제 이월예산 한도(${(unitYear.budget_carry || 0).toLocaleString()}원)를 초과합니다.`);
      return;
    }

    // 3. 최상위 프로젝트 상태 업데이트 트리거
    onUpdateBudgetDetails(activeUnit.id, parsedDetails);
    setFeedback("재원별 비목 예산 배정이 안전하게 갱신되었습니다.");
    setTimeout(() => setFeedback(""), 3000);
  };

  // 서브탭 전환에 따른 차트 데이터 가공 (단위: 백만원)
  const chartData = activeUnit
    ? Object.keys(activeUnit.budgetDetails).map(key => {
        const detYear = activeUnit.budgetDetails[key].years?.[selectedYear] || {};
        if (subTab === "main") {
          return {
            name: key,
            "본예산": Math.round((detYear.budget_main || 0) / 1000000),
            "본집행": Math.round((detYear.spent_main || 0) / 1000000)
          };
        } else {
          return {
            name: key,
            "이월예산": Math.round((detYear.budget_carry || 0) / 1000000),
            "이월집행": Math.round((detYear.spent_carry || 0) / 1000000)
          };
        }
      })
    : [];

  const isEditable = (currentRole.id === "DIRECTOR" || currentRole.id === "HQ_HEAD") && selectedUnitId !== "Total";

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "1.5rem" }}>
      {/* 좌측 단위과제 목록 */}
      <div className="glass-card" style={{ maxHeight: isMobile ? "none" : "680px", overflowY: "auto" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.8rem" }}>단위과제 목록</h3>
        
        {/* 전체 예산 현황 요약 카드 추가 (클릭 시 전체사업 통계 조회) */}
        <div 
          onClick={() => {
            setSelectedUnitId("Total");
            setFeedback("");
          }}
          style={{ 
            padding: "0.8rem", 
            borderRadius: "0.5rem", 
            background: selectedUnitId === "Total" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)", 
            marginBottom: "1.2rem", 
            border: `1px solid ${selectedUnitId === "Total" ? "var(--accent-color)" : "rgba(59,130,246,0.15)"}`,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ fontSize: "0.7rem", color: selectedUnitId === "Total" ? "var(--accent-color)" : "var(--text-secondary-dark)", fontWeight: "700" }}>{selectedYear}차년도 전체 예산 규모</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "white", marginTop: "0.2rem" }}>
            {formatToMillionWon(totalCombinedBudget)} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>백만원</span>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginTop: "0.4rem" }}>
            <span>본사업비: {formatToMillionWon(totalMainBudget)}백만원</span>
            <span>이월: {formatToMillionWon(totalCarryBudget)}백만원</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {DEPARTMENTS.map((dept) => {
            // 해당 부서에 속한 단위과제 필터링
            const deptUnits = allUnits.filter((u) => dept.ids.includes(u.id));
            if (deptUnits.length === 0) return null;

            return (
              <div key={dept.name} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {/* 부서 헤더 소제목 */}
                <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem", marginBottom: "0.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{dept.name}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: "normal", color: "var(--text-secondary-dark)" }}>{deptUnits.length}개 과제</span>
                </div>
                {/* 부서 소속 과제 카드 리스트 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {deptUnits.map((u) => {
                    const spentRate = u.budget > 0 ? (u.spent / u.budget) * 100 : 0;
                    const isCommon = u.id === "Common";
                    // 동일한 u.id가 두 개 부서(AID-X, 늘봄누리)에 복제될 수 있으므로 key는 부서명과 id의 조합으로 유니크하게 보장한다.
                    const keyStr = `${dept.name}-${u.id}`;
                    return (
                      <div
                        key={keyStr}
                        onClick={() => handleSelectUnit(u)}
                        style={{
                          padding: "0.75rem 0.9rem",
                          borderRadius: "0.5rem",
                          border: `1px solid ${selectedUnitId === u.id ? "var(--accent-color)" : "var(--border-color-dark)"}`,
                          background: selectedUnitId === u.id ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: isCommon ? "#ec4899" : "var(--accent-color)", fontWeight: "700" }}>
                          <span>{u.id}</span>
                          <span>{spentRate.toFixed(1)}% 집행</span>
                        </div>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: "700", marginTop: "0.25rem", lineHeight: "1.3", color: "white" }}>{u.title}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 비목 상세 */}
      <div className="glass-card">
        {activeUnit ? (
          <div>
            <div style={{ borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>{activeProjectTitle}</span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginTop: "0.2rem" }}>
                    {activeUnit.id} {activeUnit.title}
                  </h3>
                </div>
                {/* 본사업비 / 이월사업비 / 전체예산 분리를 위한 서브탭 스위치 제어기 */}
                <div style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.3rem", borderRadius: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setSubTab("main")}
                    style={{
                      border: "none",
                      padding: "0.4rem 1rem",
                      borderRadius: "0.35rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: subTab === "main" ? "var(--accent-color)" : "transparent",
                      color: subTab === "main" ? "white" : "var(--text-secondary-dark)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    본사업비
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab("carry")}
                    style={{
                      border: "none",
                      padding: "0.4rem 1rem",
                      borderRadius: "0.35rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: subTab === "carry" ? "var(--accent-color)" : "transparent",
                      color: subTab === "carry" ? "white" : "var(--text-secondary-dark)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    이월사업비
                  </button>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.8rem", fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>
                {subTab === "main" ? (
                  <span>본예산 한도: <strong style={{ color: "white" }}>{formatToMillionWon(activeUnit.years?.[selectedYear]?.budget_main)} 백만원</strong></span>
                ) : (
                  <span>이월예산 한도: <strong style={{ color: "white" }}>{formatToMillionWon(activeUnit.years?.[selectedYear]?.budget_carry)} 백만원</strong></span>
                )}
              </div>
            </div>

            {/* 재원 구분별 막대 차트 (배정액 대비 집행 실적 병행 표출) */}
            <div style={{ height: "280px", width: "100%", marginBottom: "1.5rem" }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="var(--text-secondary-dark)" height={90} interval={0} tick={<CustomizedAxisTick isMobile={isMobile} />} />
                  <YAxis stroke="var(--text-secondary-dark)" fontSize={9} />
                  <Tooltip
                    formatter={value => `${value.toLocaleString()} 백만원`}
                    contentStyle={{
                      background: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid var(--border-color-dark)",
                      borderRadius: "0.5rem",
                      color: "white"
                    }}
                  />
                  <Legend verticalAlign="top" height={28} fontSize={10} />
                  {subTab === "main" ? (
                    <>
                      <Bar dataKey="본예산" fill="#1e3a8a" />
                      <Bar dataKey="본집행" fill="#3b82f6" />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="이월예산" fill="#064e3b" />
                      <Bar dataKey="이월집행" fill="#10b981" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 편집 및 조회 테이블 (서브탭별로 다른 열을 노출함) */}
            <form onSubmit={handleSaveBudgetDetails}>
              <div className="table-panel" style={{ maxHeight: "300px", overflowY: "auto", overflowX: "auto", width: "100%", marginBottom: "1.5rem" }}>
                <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                  <thead>
                    {subTab === "main" ? (
                      <tr>
                        <th>비목명</th>
                        <th style={{ width: "180px" }}>본예산 배정 (백만원)</th>
                        <th>본사업비 집행 (백만원)</th>
                        <th>본사업비 잔액 (백만원)</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>비목명</th>
                        <th style={{ width: "180px" }}>이월예산 배정 (백만원)</th>
                        <th>이월비 집행 (백만원)</th>
                        <th>이월비 잔액 (백만원)</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {Object.keys(activeUnit.budgetDetails).map(bName => {
                      const detail = activeUnit.budgetDetails[bName];
                      const yearDet = detail.years?.[selectedYear] || {};
                      
                      // 본사업비 및 이월비 각각의 잔액 계산 (배정액 - 집행액)
                      const balanceMain = (yearDet.budget_main || 0) - (yearDet.spent_main || 0);
                      const balanceCarry = (yearDet.budget_carry || 0) - (yearDet.spent_carry || 0);

                      return (
                        <tr key={bName}>
                          <td style={{ fontWeight: "700" }}>{bName}</td>
                          {subTab === "main" ? (
                            <>
                              <td>
                                {isEditable ? (
                                  <input
                                    type="text"
                                    className="user-selector"
                                    style={{ padding: "0.2rem 0.4rem", width: "100%" }}
                                    value={editedBudgets[bName]?.budget_main ?? (yearDet.budget_main || 0).toString()}
                                    onChange={e => handleBudgetChange(bName, "budget_main", e.target.value)}
                                  />
                                ) : (
                                  <span>{formatToMillionWon(yearDet.budget_main)} 백만원</span>
                                )}
                              </td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{formatToMillionWon(yearDet.spent_main)} 백만원</td>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", color: balanceMain >= 0 ? "white" : "var(--danger-color)" }}>
                                {formatToMillionWon(balanceMain)} 백만원
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                {isEditable ? (
                                  <input
                                    type="text"
                                    className="user-selector"
                                    style={{ padding: "0.2rem 0.4rem", width: "100%" }}
                                    value={editedBudgets[bName]?.budget_carry ?? (yearDet.budget_carry || 0).toString()}
                                    onChange={e => handleBudgetChange(bName, "budget_carry", e.target.value)}
                                  />
                                ) : (
                                  <span>{formatToMillionWon(yearDet.budget_carry)} 백만원</span>
                                )}
                              </td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{formatToMillionWon(yearDet.spent_carry)} 백만원</td>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", color: balanceCarry >= 0 ? "white" : "var(--danger-color)" }}>
                                {formatToMillionWon(balanceCarry)} 백만원
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isEditable ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>
                    <Info size={14} />
                    {subTab === "main" ? (
                      <span>본예산 한도 범위 내에서 각각 조율해야 합니다.</span>
                    ) : (
                      <span>이월비 한도 범위 내에서 각각 조율해야 합니다.</span>
                    )}
                  </div>
                  <button type="submit" className="btn-primary">
                    <FileEdit size={16} />
                    <span>재원별 배정액 적용</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-secondary-dark)", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-color-dark)" }}>
                  <Info size={14} style={{ color: "var(--warning-color)" }} />
                  {selectedUnitId === "Total" ? (
                    <span>전체 사업 예산 현황은 조회 전용 모드입니다. 개별 단위과제 탭에서 예산을 조율해 주세요.</span>
                  ) : (
                    <span>예산 배정 조율 권한은 '송경영 사업단장' 및 '김현수 총괄본부장' 계정에만 주어져 있습니다.</span>
                  )}
                </div>
              )}
            </form>

            {feedback && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(16,185,129,0.1)", border: "1px solid var(--success-color)", borderRadius: "0.5rem", color: "#34d399", fontSize: "0.8rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <CheckCircle size={16} />
                <span>{feedback}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", color: "var(--text-secondary-dark)" }}>
            <Wallet size={36} style={{ marginRight: "0.5rem" }} />
            <span>좌측 목록에서 관리할 단위과제를 선택해 주세요.</span>
          </div>
        )}
      </div>
    </div>
  );
}
