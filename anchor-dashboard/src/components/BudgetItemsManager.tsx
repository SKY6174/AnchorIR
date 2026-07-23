import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Wallet, Info, CheckCircle } from "lucide-react";
import type { ProjectData } from "../data/mockData";

type BudgetField = "budget_main" | "budget_carry";
type EditedBudget = Record<BudgetField, string>;
type BudgetUnit = Record<string, any> & {
  id: string;
  title: string;
  projectTitle?: string;
};

// 두번째 그림 기준 정렬된 표준 10대 비목 순서
const STANDARD_BUDGET_CATEGORIES = [
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

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value?: number | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 긴 비목명을 분리하기 위한 헬퍼 함수 (모바일에서는 축약 처리)
const splitLabel = (val: string, isMobile: boolean): string[] => {
  if (isMobile) {
    const mobileMappings: Record<string, string[]> = {
      "교육∙연구 프로그램 개발∙운영비": ["교육프로그램"],
      "실험∙실습장비 및 기자재 구입∙운영비": ["실험실습장비"],
      "지역 연계∙협업 지원비": ["지역연계협업"],
      "기업 지원∙협력 활동비": ["기업지원협력"],
      "성과 활용∙확산 지원비": ["성과활용확산"],
      "그 밖의 사업운영경비": ["기타사업운영경비"],
      "교육∙연구 환경개선비": ["환경개선비"],
      "인건비": ["인건비"],
      "장학금": ["장학금"],
      "간접비": ["간접비"]
    };
    return mobileMappings[val] || [val];
  }

  const mappings: Record<string, string[]> = {
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
interface CustomizedAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  isMobile: boolean;
}

const CustomizedAxisTick = (props: CustomizedAxisTickProps) => {
  const { x = 0, y = 0, payload = { value: "" }, isMobile } = props;
  const val = payload.value;
  if (!val) return null;

  const lines = splitLabel(val, isMobile);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={10} textAnchor="middle" fill="var(--text-secondary)" style={{ fontSize: isMobile ? "0.55rem" : "0.62rem", fontWeight: "600", lineHeight: "1.4" }}>
        {lines.map((line, idx) => (
          <tspan key={idx} x={0} dy={idx === 0 ? 0 : 11}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

export interface BudgetItemsManagerProps {
  projects?: ProjectData[];
  currentRole?: any;
  onUpdateBudgetDetails?: (unitId: string, budgets: any) => void;
  selectedYear?: number;
  darkMode?: boolean;
  currentUser?: any;
}

export default function BudgetItemsManager({ projects, currentRole, onUpdateBudgetDetails, selectedYear = 2 }: BudgetItemsManagerProps) {
  const [selectedUnitId, setSelectedUnitId] = useState("A1가");
  const [selectedDeptName, setSelectedDeptName] = useState("all");
  const [editedBudgets, setEditedBudgets] = useState<Record<string, EditedBudget>>({});
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

  // 💡 [실시간 업로드 데이터 동적 합산 가드]
  // 부모 컴포넌트인 App.jsx에서 엑셀 실시간 정산액을 이미 완벽하게 환산 반영하여 projects prop으로 내려주므로,
  // 자식 컴포넌트에서는 중복 계산 없이 전달받은 projects 객체를 그대로 정규화 프로젝트 데이터로 채택합니다.
  const normalizedProjects = projects ?? [];

  // 모든 단위과제 수집 (정규화된 프로젝트 기반)
  const allUnits: BudgetUnit[] = [];
  if (normalizedProjects && Array.isArray(normalizedProjects)) {
    normalizedProjects.forEach(p => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach(u => {
          allUnits.push({ ...u, projectTitle: p.title } as BudgetUnit);
        });
      }
    });
  }
  allUnits.sort((a, b) => {
    if (a.id === "Common" || a.id === "X0") return 1;
    if (b.id === "Common" || b.id === "X0") return -1;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 선택 연차별 전체 예산 및 누적 집행액 구하기
  let totalMainBudget = 0;
  let totalCarryBudget = 0;
  let totalMainSpent = 0;
  let totalCarrySpent = 0;
  if (normalizedProjects && Array.isArray(normalizedProjects)) {
    normalizedProjects.forEach((p) => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach((u) => {
          const yr = u.years?.[selectedYear] || { budget_main: 0, budget_carry: 0, spent_main: 0, spent_carry: 0 };
          totalMainBudget += (yr.budget_main || 0);
          totalCarryBudget += (yr.budget_carry || 0);
          totalMainSpent += (yr.spent_main || 0);
          totalCarrySpent += (yr.spent_carry || 0);
        });
      }
    });
  }
  const totalCombinedBudget = totalMainBudget + totalCarryBudget;

  // 담당부서 맵핑 정의 (연차별 유닛 ID 분기 처리 및 사용자 지정 순서)
  const DEPARTMENTS = selectedYear === 1
    ? [
      { name: "ECC센터", ids: ["A1", "A2", "D4"] },
      { name: "ICC센터", ids: ["B1", "C1", "C3"] },
      { name: "RCC센터", ids: ["B2", "B3", "D1", "D3"] },
      { name: "AID-X지원센터", ids: ["C2"] },
      { name: "울산늘봄누리센터", ids: ["D2"] },
      { name: "사업운영팀", ids: [] }
    ]
    : [
      { name: "ECC센터", ids: ["A1가", "A2", "A3"] },
      { name: "ICC센터", ids: ["B1", "B3", "B4"] },
      { name: "RCC센터", ids: ["C1", "D1", "D2", "D3"] },
      { name: "AID-X지원센터", ids: ["B2"] },
      { name: "울산늘봄누리센터", ids: ["C2"] },
      { name: "신산업특화센터", ids: ["A1나"] },
      { name: "사업운영팀", ids: ["X0", "Common"] }
    ];

  // 선택된 단위과제 및 프로젝트 제목 찾기 또는 전체사업 가상 유닛 빌드
  let activeUnit = null;
  let activeProjectTitle = "";

  if (selectedUnitId === "Total") {
    activeProjectTitle = "울산과학대학교 앵커 사업단";

    // 가상의 budgetDetails 생성하여 모든 단위과제의 비목 데이터를 실시간으로 합산
    const combinedDetails: Record<string, any> = {};
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

    if (normalizedProjects && Array.isArray(normalizedProjects)) {
      normalizedProjects.forEach(p => {
        if (p.units && Array.isArray(p.units)) {
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
        }
      });
    }

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
    for (const p of normalizedProjects) {
      const found = p.units.find(u => u.id === selectedUnitId);
      if (found) {
        activeUnit = found as BudgetUnit;
        activeProjectTitle = p.title;
        break;
      }
    }
  }

  // 선택된 단위가 바뀔 때 혹은 연차가 바뀔 때 사용자가 편집하던 값 초기화 (백만원 단위로 환산하여 Input 기본값 제공)
  // 연차가 변경될 때 활성화 연도에 맞는 유효한 기본 단위과제를 자동 선택
  useEffect(() => {
    if (selectedYear === 1) {
      setSubTab("main");
      if (selectedUnitId === "A1가" || !["A1", "A2", "D4", "B1", "B3", "C1", "C3", "C2", "D2", "B2", "D1", "D3", "Total"].includes(selectedUnitId)) {
        setSelectedUnitId("A1");
      }
    } else {
      if (selectedUnitId === "A1" || !["A1가", "A1나", "A2", "A3", "B1", "B3", "B4", "B2", "C2", "C1", "D1", "D2", "D3", "X0", "Common", "Total"].includes(selectedUnitId)) {
        setSelectedUnitId("A1가");
      }
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear === 1) {
      setSubTab("main");
    }
    if (!activeUnit) return;
    const init: Record<string, EditedBudget> = {};
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

  const handleSelectUnit = (unit: BudgetUnit) => {
    setSelectedUnitId(unit.id);
    setFeedback("");
  };

  // 실시간 입력값 상태 동기화 핸들러
  const _handleBudgetChange = (bName: string, field: BudgetField, val: string) => {
    setEditedBudgets(prev => ({
      ...prev,
      [bName]: { ...prev[bName], [field]: val }
    }));
  };

  // 포커스 아웃 시 실시간 예산 연동 및 유동성 검사 저장 핸들러
  const _handleInputBlur = (bName: string, field: BudgetField, rawValue: string) => {
    if (!activeUnit) return;
    const valInMillion = parseInt(rawValue || "0", 10);
    if (isNaN(valInMillion) || valInMillion < 0) {
      alert("올바른 숫자를 백만원 단위로 입력해 주세요.");
      const detailYear = activeUnit.budgetDetails?.[bName]?.years?.[selectedYear] || {};
      setEditedBudgets(prev => ({
        ...prev,
        [bName]: {
          ...prev[bName],
          [field]: Math.round((detailYear[field] || 0) / 1000000).toString()
        }
      }));
      return;
    }

    const byteValue = valInMillion * 1000000;
    const detailYear = activeUnit.budgetDetails?.[bName]?.years?.[selectedYear] || {};
    const currentSpent = detailYear[field === "budget_main" ? "spent_main" : "spent_carry"] || 0;

    if (byteValue < currentSpent) {
      alert("수정하려는 예산이 현재 누적 집행액보다 크거나 같아야 합니다.");
      setEditedBudgets(prev => ({
        ...prev,
        [bName]: {
          ...prev[bName],
          [field]: Math.round((detailYear[field] || 0) / 1000000).toString()
        }
      }));
      return;
    }

    let newTotal = 0;
    for (const key of Object.keys(activeUnit.budgetDetails || {})) {
      if (key === bName) {
        newTotal += byteValue;
      } else {
        const otherYearDet = activeUnit.budgetDetails[key]?.years?.[selectedYear] || {};
        newTotal += (otherYearDet[field] || 0);
      }
    }

    const unitYear = activeUnit.years?.[selectedYear] || {};
    const limit = field === "budget_main" ? (unitYear.budget_main || 0) : (unitYear.budget_carry || 0);
    const limitLabel = field === "budget_main" ? "본예산" : "이월예산";

    if (newTotal > limit) {
      alert(`수정한 ${limitLabel} 총합(${newTotal.toLocaleString()}원)이 해당 단위과제 ${limitLabel} 한도(${limit.toLocaleString()}원)를 초과합니다.`);
      setEditedBudgets(prev => ({
        ...prev,
        [bName]: {
          ...prev[bName],
          [field]: Math.round((detailYear[field] || 0) / 1000000).toString()
        }
      }));
      return;
    }

    const parsedDetails = {
      [bName]: {
        years: {
          [selectedYear]: {
            [field]: byteValue,
            [field === "budget_main" ? "spent_main" : "spent_carry"]: currentSpent
          }
        }
      }
    };

    onUpdateBudgetDetails?.(activeUnit.id, parsedDetails);
    setFeedback(`'${bName}'의 예산 배정이 실시간 적용되었습니다.`);
    setTimeout(() => setFeedback(""), 3000);
  };

  // 예산 배정액 적용 처리 핸들러
  const _handleSaveBudgetDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeUnit) return;

    let newTotalMain = 0;
    let newTotalCarry = 0;
    const parsedDetails: Record<string, any> = {};

    // 1. 모든 비목 데이터를 순회하며 정수 변환 및 유효성 검사 수행
    for (const key of Object.keys(activeUnit.budgetDetails || {})) {
      const rawMain = parseInt(editedBudgets[key]?.budget_main || "0", 10) * 1000000;
      const rawCarry = parseInt(editedBudgets[key]?.budget_carry || "0", 10) * 1000000;

      if (isNaN(rawMain) || rawMain < 0 || isNaN(rawCarry) || rawCarry < 0) {
        alert(`'${key}' 비목에 올바른 숫자를 입력해주세요.`);
        return;
      }

      const currentSpentMain = activeUnit.budgetDetails[key]?.years?.[selectedYear]?.spent_main || 0;
      const currentSpentCarry = activeUnit.budgetDetails[key]?.years?.[selectedYear]?.spent_carry || 0;

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
    onUpdateBudgetDetails?.(activeUnit.id, parsedDetails);
    setFeedback("재원별 비목 예산 배정이 안전하게 갱신되었습니다.");
    setTimeout(() => setFeedback(""), 3000);
  };

  // 서브탭 전환에 따른 차트 데이터 가공 (단위: 백만원)
  const chartData = activeUnit
    ? STANDARD_BUDGET_CATEGORIES.map(key => {
      const detYear = activeUnit.budgetDetails?.[key]?.years?.[selectedYear] || {};
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

  const _isEditable = (currentRole.id === "ADMIN" || currentRole.id === "G_DIRECTOR" || currentRole.id === "HQ_HEAD" || currentRole.id === "MANAGER") && selectedUnitId !== "Total";

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: "1.5rem" }}>
      {/* 좌측 단위과제 목록 */}
      <div className="glass-card" style={{ maxHeight: isMobile ? "none" : "900px", overflowY: "auto" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.8rem", color: "var(--text-primary)" }}>단위과제 목록</h3>

        {/* 전체 예산 현황 요약 카드 추가 (클릭 시 전체사업 통계 조회) */}
        <div
          onClick={() => {
            setSelectedUnitId("Total");
            setFeedback("");
          }}
          style={{
            padding: "0.8rem",
            borderRadius: "0.5rem",
            background: selectedUnitId === "Total" ? "rgba(59,130,246,0.15)" : "var(--panel-bg)",
            marginBottom: "1.2rem",
            border: `1px solid ${selectedUnitId === "Total" ? "var(--accent-color)" : "var(--border-color)"}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: selectedUnitId === "Total" ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none"
          }}
        >
          <div style={{ fontSize: "0.7rem", color: selectedUnitId === "Total" ? "var(--accent-color)" : "var(--text-secondary)", fontWeight: "700" }}>{selectedYear}차년도 전체 예산 규모</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--text-primary)", marginTop: "0.2rem" }}>
            {formatToMillionWon(totalCombinedBudget)} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>백만원</span>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
            <span>본사업비: {formatToMillionWon(totalMainBudget)}백만원</span>
            <span>이월: {formatToMillionWon(totalCarryBudget)}백만원</span>
          </div>
        </div>

        {/* 센터 선택 드롭박스 필터 */}
        <div style={{ marginBottom: "1.2rem", padding: "0.8rem", borderRadius: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem", fontWeight: "700" }}>담당 센터 선택</span>
          <select
            className="user-selector"
            style={{ width: "100%", padding: "0.4rem", fontSize: "0.75rem", borderRadius: "0.375rem" }}
            value={selectedDeptName}
            onChange={(e) => setSelectedDeptName(e.target.value)}
          >
            <option value="all">전체 센터</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {DEPARTMENTS
            .filter((dept) => selectedDeptName === "all" || dept.name === selectedDeptName)
            .map((dept) => {
              // 해당 부서에 속한 단위과제 필터링
              const deptUnits = allUnits.filter((u) => dept.ids.includes(u.id));
              if (deptUnits.length === 0) return null;

              return (
                <div key={dept.name} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {/* 부서 헤더 소제목 */}
                  <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem", marginBottom: "0.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{dept.name}</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: "normal", color: "var(--text-secondary)" }}>{deptUnits.length}개 과제</span>
                  </div>
                  {/* 부서 소속 과제 카드 리스트 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {deptUnits.map((u) => {
                      // 선택 연도(selectedYear) 및 서브탭(subTab) 기준 예산 및 집행액 동적 산출
                      const yr = u.years?.[selectedYear] || { budget_main: 0, budget_carry: 0, spent_main: 0, spent_carry: 0 };
                      let displayBudget = 0;
                      let displaySpent = 0;
                      if (subTab === "main") {
                        displayBudget = yr.budget_main || 0;
                        displaySpent = yr.spent_main || 0;
                      } else {
                        // carry (이월사업비)
                        displayBudget = yr.budget_carry || 0;
                        displaySpent = yr.spent_carry || 0;
                      }
                      const spentRate = displayBudget > 0 ? (displaySpent / displayBudget) * 100 : 0;
                      const isCommon = u.id === "Common" || u.id === "X0";
                      const isSelected = selectedUnitId === u.id;
                      // 동일한 u.id가 두 개 부서(AID-X, 늘봄누리)에 복제될 수 있으므로 key는 부서명과 id의 조합으로 유니크하게 보장한다.
                      const keyStr = `${dept.name}-${u.id}`;
                      return (
                        <div
                          key={keyStr}
                          onClick={() => handleSelectUnit(u)}
                          style={{
                            padding: "0.75rem 0.9rem",
                            borderRadius: "0.5rem",
                            border: `1px solid ${isSelected ? "var(--accent-color)" : "var(--border-color)"}`,
                            background: isSelected ? "rgba(59,130,246,0.08)" : "var(--panel-bg)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.12)" : "none"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: isCommon ? "#ec4899" : (isSelected ? "var(--accent-color)" : "var(--text-secondary)"), fontWeight: "700" }}>
                            <span>{u.id}</span>
                            <span style={{ color: "var(--accent-color)" }}>{spentRate.toFixed(1)}% 집행</span>
                          </div>
                          <h4 style={{ fontSize: "0.8rem", fontWeight: "700", marginTop: "0.25rem", lineHeight: "1.3", color: isSelected ? "var(--accent-color)" : "var(--text-primary)" }}>{u.title}</h4>
                          {/* 본사업비/이월사업비 상태에 따른 상세 수치 동적 반영 */}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                            {subTab === "main" ? (
                              <>
                                <span>본예산: {formatToMillionWon(displayBudget)}백만원</span>
                                <span>집행: {formatToMillionWon(displaySpent)}백만원</span>
                              </>
                            ) : (
                              <>
                                <span>이월예산: {formatToMillionWon(displayBudget)}백만원</span>
                                <span>집행: {formatToMillionWon(displaySpent)}백만원</span>
                              </>
                            )}
                          </div>
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
      <div className="glass-card" style={{ maxHeight: isMobile ? "none" : "900px", overflowY: "auto" }}>
        {activeUnit ? (
          <div>
            <div style={{ borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{activeProjectTitle}</span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginTop: "0.2rem" }}>
                    {activeUnit.id} {activeUnit.title}
                  </h3>
                </div>
                {/* 본사업비 / 이월사업비 / 전체예산 분리를 위한 서브탭 스위치 제어기 */}
                <div style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.3rem", borderRadius: "0.5rem" }}>
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
                      color: subTab === "main" ? "white" : "var(--text-secondary)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    본사업비
                  </button>
                  {selectedYear >= 2 && (
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
                        color: subTab === "carry" ? "white" : "var(--text-secondary)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      이월사업비
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.8rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {subTab === "main" ? (
                  <span>본예산 한도: <strong style={{ color: "white" }}>{formatToMillionWon(activeUnit.years?.[selectedYear]?.budget_main)} 백만원</strong></span>
                ) : (
                  <span>{selectedYear - 1}차년도 이월예산 한도: <strong style={{ color: "white" }}>{formatToMillionWon(activeUnit.years?.[selectedYear]?.budget_carry)} 백만원</strong></span>
                )}
              </div>
            </div>

            {/* 재원 구분별 막대 차트 (배정액 대비 집행 실적 병행 표출) */}
            <div style={{ height: "280px", width: "100%", marginBottom: "1.5rem" }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20 }}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" height={90} interval={0} tick={<CustomizedAxisTick isMobile={isMobile} />} />
                  <YAxis stroke="var(--text-secondary)" fontSize={9} />
                  <Tooltip
                    formatter={value => `${Number(value ?? 0).toLocaleString()} 백만원`}
                    contentStyle={{
                      background: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "white"
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconSize={10}
                    wrapperStyle={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.375rem",
                      padding: "0.2rem 0.6rem",
                      display: "inline-flex",
                      justifyContent: "center",
                      gap: "0.8rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: -10,
                      width: "60%",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}
                    formatter={(value) => (
                      <span style={{ color: "var(--text-primary)", fontSize: "11px", fontWeight: "700" }}>
                        {value}
                      </span>
                    )}
                  />
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
            <form onSubmit={e => e.preventDefault()}>
              <div className="table-panel" style={{ overflowX: "auto", marginBottom: "1rem" }}>
                <table className="custom-table" style={{ fontSize: "0.8rem", minWidth: "600px" }}>
                  <thead>
                    {subTab === "main" ? (
                      <tr>
                        <th>비목명</th>
                        <th style={{ width: "180px", textAlign: "right", paddingRight: "1rem" }}>{selectedYear}차년도 본예산 배정 (백만원)</th>
                        <th style={{ textAlign: "right", paddingRight: "1rem" }}>{selectedYear}차년도 본집행 (백만원)</th>
                        <th style={{ textAlign: "right", paddingRight: "1rem" }}>{selectedYear}차년도 본사업비 잔액 (백만원)</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>비목명</th>
                        <th style={{ width: "180px", textAlign: "right", paddingRight: "1rem" }}>{selectedYear - 1}차년도 이월예산 배정 (백만원)</th>
                        <th style={{ textAlign: "right", paddingRight: "1rem" }}>{selectedYear - 1}차년도 이월비 집행 (백만원)</th>
                        <th style={{ textAlign: "right", paddingRight: "1rem" }}>{selectedYear - 1}차년도 이월비 잔액 (백만원)</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {STANDARD_BUDGET_CATEGORIES.map(bName => {
                      const detail = activeUnit.budgetDetails?.[bName] || { years: {} };
                      const yearDet = detail.years?.[selectedYear] || {};

                      // 본사업비 및 이월비 각각의 잔액 계산 (배정액 - 집행액)
                      const balanceMain = (yearDet.budget_main || 0) - (yearDet.spent_main || 0);
                      const balanceCarry = (yearDet.budget_carry || 0) - (yearDet.spent_carry || 0);

                      const _isEduProg = bName === "교육∙연구 프로그램 개발∙운영비";

                      return (
                        <tr key={bName} style={{ color: "var(--text-primary)" }}>
                          <td style={{ fontWeight: "700" }}>{bName}</td>
                          {subTab === "main" ? (
                            <>
                              <td style={{ textAlign: "right", paddingRight: "1rem" }}>
                                <span style={{ color: "var(--accent-color)", fontWeight: "800" }}>
                                  {formatToMillionWon(yearDet.budget_main)} 백만원
                                </span>
                              </td>
                              <td style={{ fontFamily: "var(--font-data)", color: "var(--text-primary)", textAlign: "right", paddingRight: "1rem" }}>{formatToMillionWon(yearDet.spent_main)} 백만원</td>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", color: balanceMain >= 0 ? "var(--text-primary)" : "var(--danger-color)", textAlign: "right", paddingRight: "1rem" }}>
                                {formatToMillionWon(balanceMain)} 백만원
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ textAlign: "right", paddingRight: "1rem" }}>
                                <span style={{ color: "var(--accent-color)", fontWeight: "800" }}>
                                  {formatToMillionWon(yearDet.budget_carry)} 백만원
                                </span>
                              </td>
                              <td style={{ fontFamily: "var(--font-data)", color: "var(--text-primary)", textAlign: "right", paddingRight: "1rem" }}>{formatToMillionWon(yearDet.spent_carry)} 백만원</td>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", color: balanceCarry >= 0 ? "var(--text-primary)" : "var(--danger-color)", textAlign: "right", paddingRight: "1rem" }}>
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

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border-color)" }}>
                <Info size={14} style={{ color: "var(--accent-color)" }} />
                <span>모든 비목의 예산 배정액은 세부 프로그램 기획(P) 단계에서 입력하신 금액의 합계로 실시간 자동 동기화됩니다 (임의 수정 불가).</span>
              </div>
            </form>

            {feedback && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(16,185,129,0.1)", border: "1px solid var(--success-color)", borderRadius: "0.5rem", color: "#34d399", fontSize: "0.8rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <CheckCircle size={16} />
                <span>{feedback}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", color: "var(--text-secondary)" }}>
            <Wallet size={36} style={{ marginRight: "0.5rem" }} />
            <span>좌측 목록에서 관리할 단위과제를 선택해 주세요.</span>
          </div>
        )}
      </div>
    </div>
  );
}
