import React, { useState, useEffect } from "react";
import { Check, ClipboardList, PenTool, Layers, LayoutList, Info, HelpCircle } from "lucide-react";

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 천 단위 구분 쉼표 포맷팅 헬퍼 함수
const formatNumberWithCommas = (value) => {
  if (value === undefined || value === null) return "";
  const clean = String(value).replace(/[^0-9]/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("ko-KR");
};

const parseNumberFromCommas = (value) => {
  if (!value) return 0;
  return parseInt(String(value).replace(/,/g, ""), 10) || 0;
};

// "YYYY-MM-DD ~ YYYY-MM-DD" 포맷 파서
const parseTimelineDates = (timelineStr) => {
  if (!timelineStr || !timelineStr.includes("~")) return { start: "", end: "" };
  const parts = timelineStr.split("~").map((p) => p.trim());
  
  const toYYYYMMDD = (str) => {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const dotted = str.replace(/\./g, "-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(dotted)) return dotted;
    if (/^\d{4}-\d{2}$/.test(dotted)) return `${dotted}-01`;
    return dotted;
  };
  
  return {
    start: toYYYYMMDD(parts[0]),
    end: toYYYYMMDD(parts[1] || parts[0])
  };
};

const MONTHS_LIST = ["26.3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", "27.1월", "2월"];

const BUDGET_CATEGORIES_OPTIONS = [
  { value: "", label: "선택 안 함" },
  { value: "인건비", label: "인건비" },
  { value: "장학금", label: "장학금" },
  { value: "교육∙연구 프로그램 개발∙운영비", label: "프로그램개발운영비" },
  { value: "교육∙연구 환경개선비", label: "환경개선비" },
  { value: "실험∙실습장비 및 기자재 구입∙운영비", label: "실험실습장비비" },
  { value: "지역 연계∙협업 지원비", label: "지역연계협업비" },
  { value: "기업 지원∙협력 활동비", label: "기업지원협력비" },
  { value: "성과 활용∙확산 지원비", label: "성과활용확산비" },
  { value: "그 밖의 사업운영경비", label: "기타운영경비" },
  { value: "간접비", label: "간접비" }
];

const parseTimelineToMonths = (timelineStr) => {
  const defaultValue = Array(12).fill("");
  if (!timelineStr) return defaultValue;

  if (timelineStr.includes(",")) {
    const parts = timelineStr.split(",");
    if (parts.length === 12) {
      return parts.map(p => {
        const trimmed = p.trim().toUpperCase();
        if (trimmed.split("").some(char => ["P", "D", "C", "A"].includes(char))) {
          return trimmed;
        }
        return "";
      });
    }
  }

  const dates = parseTimelineDates(timelineStr);
  if (dates.start && dates.end) {
    try {
      const startMonth = parseInt(dates.start.split("-")[1], 10);
      const endMonth = parseInt(dates.end.split("-")[1], 10);

      const getMonthIndex = (m) => {
        if (m >= 3 && m <= 12) return m - 3;
        if (m === 1 || m === 2) return m + 9;
        return -1;
      };

      const startIndex = getMonthIndex(startMonth);
      const endIndex = getMonthIndex(endMonth);

      if (startIndex !== -1 && endIndex !== -1) {
        const arr = Array(12).fill("");
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        for (let i = start; i <= end; i++) {
          arr[i] = "P";
        }
        return arr;
      }
    } catch (e) {
      console.error("Parse timeline to months error:", e);
    }
  }

  return defaultValue;
};

const parseDecimalFromCommas = (val) => {
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

/**
 * PDCAManager Component
 * 프로그램별 PDCA(Plan-Do-Check-Act) 단계 관리, 기획수립(Timeline, 대상, 부서),
 * 다변화 재원(국고, 시비, 외부사업비) 예산/집행 입력 및 A단계 2분할 환류 방안 검증을 담당합니다.
 */
export default function PDCAManager({
  projects,
  currentRole,
  onUpdateProgramDetails,
  onAddProgram,
  selectedYear,
  selectedUnitId,
  setSelectedUnitId,
  selectedProgId,
  setSelectedProgId,
  viewMode = "unit",
  setViewMode
}) {
  const startYrShort = String(2024 + selectedYear).slice(-2);
  const endYrShort = String(2025 + selectedYear).slice(-2);
  const monthsList = [
    `${startYrShort}.3월`, "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
    `${endYrShort}.1월`, "2월"
  ];

  const [feedbackMsg, setFeedbackMsg] = useState("");

  // 프로그램 신규 추가용 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgAssignee, setNewProgAssignee] = useState("");
  const [newProgBudget, setNewProgBudget] = useState("");
  const [newProgCarry, setNewProgCarry] = useState("");

  // P 단계 기획 및 재원 배정용 상태 (본예산 및 이월예산 구분)
  const [inputTimeline, setInputTimeline] = useState("");
  const [inputStartDate, setInputStartDate] = useState("");
  const [inputEndDate, setInputEndDate] = useState("");
  const [inputTargetAudience, setInputTargetAudience] = useState("");
  const [inputCoopDept1, setInputCoopDept1] = useState("");
  const [inputCoopDept2, setInputCoopDept2] = useState("");
  
  // 본예산 재원 상태
  const [inputBudgetNational, setInputBudgetNational] = useState("");
  const [inputBudgetCity, setInputBudgetCity] = useState("");
  const [inputBudgetExternal, setInputBudgetExternal] = useState("");

  // 이월예산 재원 상태 (신설)
  const [inputBudgetCarryNational, setInputBudgetCarryNational] = useState("");
  const [inputBudgetCarryCity, setInputBudgetCarryCity] = useState("");
  const [inputBudgetCarryExternal, setInputBudgetCarryExternal] = useState("");

  // 이원화 비목별 예산용 상태 (본예산/이월예산/집행액 구분, 최대 4칸)
  const [inputBudgetCategories, setInputBudgetCategories] = useState([
    { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" },
    { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" },
    { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" },
    { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" }
  ]);

  // 월별 PDCA 일정 관리용 상태 (26.3월 ~ 27.2월, 12칸)
  const [inputMonthlyPDCA, setInputMonthlyPDCA] = useState(Array(12).fill(""));

  // 월별 실제 추진 실적 일정 관리용 상태 (26.3월 ~ 27.2월, 12칸, 드롭박스 입력 방식)
  const [inputMonthlyPDCAActual, setInputMonthlyPDCAActual] = useState(Array(12).fill(""));

  // D 단계 집행 실적용 상태 (재원별 분리)
  const [inputSpentNational, setInputSpentNational] = useState("");
  const [inputSpentCity, setInputSpentCity] = useState("");
  const [inputSpentExternal, setInputSpentExternal] = useState("");

  // C 단계 실적용 상태 (집행액 제외, 이수인원 및 만족도만 관리)
  const [inputParticipants, setInputParticipants] = useState("");
  const [inputSatisfaction, setInputSatisfaction] = useState("");
  const [inputAchievements, setInputAchievements] = useState(""); // 신규 성과사항 필드 추가

  // A 단계 2분할 환류 방안용 상태
  const [inputEvalType, setInputEvalType] = useState("우수"); // "우수" 또는 "미흡"
  const [inputExcellent, setInputExcellent] = useState("");
  const [inputImprovePlan, setInputImprovePlan] = useState("");
  const [inputDeficiency, setInputDeficiency] = useState("");
  const [inputActionItem, setInputActionItem] = useState("");

  // P/D 실적 횟수 및 달성률 상태
  const [inputFrequency, setInputFrequency] = useState("");
  const [inputTargetParticipants, setInputTargetParticipants] = useState("");
  const [inputTargetDevelopments, setInputTargetDevelopments] = useState("");
  const [inputTargetEtc, setInputTargetEtc] = useState("");
  const [inputTargetParticipantsUnit, setInputTargetParticipantsUnit] = useState("명");
  const [inputTargetDevelopmentsUnit, setInputTargetDevelopmentsUnit] = useState("건");
  const [inputTargetEtcUnit, setInputTargetEtcUnit] = useState("개");
  const [inputTargetParticipantsName, setInputTargetParticipantsName] = useState("참여인원");
  const [inputTargetDevelopmentsName, setInputTargetDevelopmentsName] = useState("개발수");
  const [inputTargetEtcName, setInputTargetEtcName] = useState("기타");
  const [inputKpiType, setInputKpiType] = useState("자율");
  const [inputKpiLink, setInputKpiLink] = useState("");
  const [inputActualFrequency, setInputActualFrequency] = useState("");
  const [inputAchieveRate, setInputAchieveRate] = useState("");

  // 현재 뷰포트에서 보여줄 PDCA 단계 선택 (localStorage 세션 연동)
  const [activePdcaStage, setActivePdcaStage] = useState(() => {
    return localStorage.getItem("anchor_active_pdca_stage") || "P";
  });

  useEffect(() => {
    localStorage.setItem("anchor_active_pdca_stage", activePdcaStage);
  }, [activePdcaStage]);

  // 모든 프로그램 수집
  const allPrograms = [];
  const allUnits = [];
  projects.forEach((p) => {
    p.units.forEach((u) => {
      allUnits.push(u);
      u.programs.forEach((prog) => {
        allPrograms.push({
          ...prog,
          unitId: u.id,
          unitTitle: u.title,
          projectTitle: p.title,
        });
      });
    });
  });
  allUnits.sort((a, b) => {
    if (a.id === "Common") return 1;
    if (b.id === "Common") return -1;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 연구원 권한 필터링 (본인 담당 세부과제만 노출)
  const isResearcher = currentRole.id === "RESEARCHER";

  const unitFilteredPrograms = allPrograms.filter((p) => {
    const matchesUnit = p.unitId === selectedUnitId;
    if (isResearcher) {
      const currentAssignee = p.assignees?.[selectedYear] !== undefined ? p.assignees[selectedYear] : (p.assignee || "");
      return matchesUnit && currentAssignee.includes(currentRole.name.split(" ")[0]);
    }
    return matchesUnit;
  });

  const allFilteredPrograms = isResearcher
    ? allPrograms.filter((p) => {
        const currentAssignee = p.assignees?.[selectedYear] !== undefined ? p.assignees[selectedYear] : (p.assignee || "");
        return currentAssignee.includes(currentRole.name.split(" ")[0]);
      })
    : allPrograms;

  const activeProg = allPrograms.find((p) => p.id === selectedProgId);

  // selectedProgId 또는 selectedYear가 바뀔 때 모든 기획/환류/재원 상태 로드
  React.useEffect(() => {
    if (selectedProgId) {
      const prog = allPrograms.find((p) => p.id === selectedProgId);
      if (prog) {
        const py = prog.years?.[selectedYear] || {};
        setInputTimeline(prog.timeline || "");
        
        const { start, end } = parseTimelineDates(prog.timeline || "");
        setInputStartDate(start);
        setInputEndDate(end);

        setInputTargetAudience(prog.targetAudience || "");
        const coopParts = (prog.coopDept || "").split(",").map(s => s.trim());
        setInputCoopDept1(coopParts[0] || "");
        setInputCoopDept2(coopParts[1] || "");
        
        // 본예산 로드 (백만원 단위 소수점 첫째자리)
        setInputBudgetNational(py.budget_national !== undefined ? (py.budget_national / 1000000).toFixed(1) : "0.0");
        setInputBudgetCity(py.budget_city !== undefined ? (py.budget_city / 1000000).toFixed(1) : "0.0");
        setInputBudgetExternal(py.budget_external !== undefined ? (py.budget_external / 1000000).toFixed(1) : "0.0");

        // 이월예산 로드 (1차년도 제외)
        if (selectedYear === 1) {
          setInputBudgetCarryNational("0.0");
          setInputBudgetCarryCity("0.0");
          setInputBudgetCarryExternal("0.0");
        } else {
          setInputBudgetCarryNational(py.budget_carry_national !== undefined ? (py.budget_carry_national / 1000000).toFixed(1) : "0.0");
          setInputBudgetCarryCity(py.budget_carry_city !== undefined ? (py.budget_carry_city / 1000000).toFixed(1) : "0.0");
          setInputBudgetCarryExternal(py.budget_carry_external !== undefined ? (py.budget_carry_external / 1000000).toFixed(1) : "0.0");
        }

        // 비목 예산 및 집행 바인딩 (본예산 + 이월예산 + 집행액, 4칸 구성)
        const loadedCategories = (py.budget_categories || []).map((c) => ({
          category: c.category || "",
          budget: c.budget !== undefined ? (c.budget / 1000000).toFixed(1) : "",
          budget_carry: selectedYear === 1 ? "0.0" : (c.budget_carry !== undefined ? (c.budget_carry / 1000000).toFixed(1) : ""),
          spent: c.spent !== undefined ? (c.spent / 1000000).toFixed(1) : "0.0",
          spent_carry: selectedYear === 1 ? "0.0" : (c.spent_carry !== undefined ? (c.spent_carry / 1000000).toFixed(1) : "0.0")
        }));
        while (loadedCategories.length < 4) {
          loadedCategories.push({ category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" });
        }
        setInputBudgetCategories(loadedCategories);

        // 월별 PDCA일정 바인딩
        setInputMonthlyPDCA(parseTimelineToMonths(prog.timeline || ""));
        setInputMonthlyPDCAActual(parseTimelineToMonths(prog.actual_timeline || ""));

        setInputSpentNational(py.spent_national !== undefined ? (py.spent_national / 1000000).toFixed(1) : "0.0");
        setInputSpentCity(py.spent_city !== undefined ? (py.spent_city / 1000000).toFixed(1) : "0.0");
        setInputSpentExternal(py.spent_external !== undefined ? (py.spent_external / 1000000).toFixed(1) : "0.0");

        setInputParticipants(String(prog.participants ?? 0));
        setInputSatisfaction(String(prog.satisfaction ?? 0));
        setInputAchievements(prog.achievements || "");

        setInputEvalType(prog.evalType || "우수");
        setInputExcellent(prog.excellent || "");
        setInputImprovePlan(prog.improvePlan || "");
        setInputDeficiency(prog.deficiency || "");
        setInputActionItem(prog.actionItem || "");

        setInputFrequency(prog.frequency !== undefined ? String(prog.frequency) : "");
        setInputTargetParticipants(prog.target_participants !== undefined ? String(prog.target_participants) : "");
        setInputTargetDevelopments(prog.target_developments !== undefined ? String(prog.target_developments) : "");
        setInputTargetEtc(prog.target_etc !== undefined ? String(prog.target_etc) : "");
        setInputTargetParticipantsUnit(prog.target_participants_unit || "명");
        setInputTargetDevelopmentsUnit(prog.target_developments_unit || "건");
        setInputTargetEtcUnit(prog.target_etc_unit || "개");
        setInputTargetParticipantsName(prog.target_participants_name || "참여인원");
        setInputTargetDevelopmentsName(prog.target_developments_name || "개발수");
        setInputTargetEtcName(prog.target_etc_name || "기타");
        setInputKpiType(prog.kpi_type || "자율");
        setInputKpiLink(prog.kpi_link || "");
        setInputActualFrequency(prog.actualFrequency !== undefined ? String(prog.actualFrequency) : "");
        setInputAchieveRate(prog.achieveRate !== undefined ? String(prog.achieveRate) : "");
      }
    } else {
      setInputKpiType("자율");
      setInputKpiLink("");
      setInputTargetParticipantsUnit("명");
      setInputTargetDevelopmentsUnit("건");
      setInputTargetEtcUnit("개");
      setInputTargetParticipantsName("참여인원");
      setInputTargetDevelopmentsName("개발수");
      setInputTargetEtcName("기타");
      setInputTimeline("");
      setInputStartDate("");
      setInputEndDate("");
      setInputTargetAudience("");
      setInputCoopDept1("");
      setInputCoopDept2("");
      setInputBudgetNational("");
      setInputBudgetCity("");
      setInputBudgetExternal("");
      setInputBudgetCarryNational("");
      setInputBudgetCarryCity("");
      setInputBudgetCarryExternal("");
      setInputBudgetCategories([
        { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" },
        { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" },
        { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" },
        { category: "", budget: "", budget_carry: "", spent: "0.0", spent_carry: "0.0" }
      ]);
      setInputMonthlyPDCA(Array(12).fill(""));
      setInputMonthlyPDCAActual(Array(12).fill(""));
      setInputSpentNational("");
      setInputSpentCity("");
      setInputSpentExternal("");
      setInputParticipants("");
      setInputSatisfaction("");
      setInputAchievements("");
      setInputExcellent("");
      setInputImprovePlan("");
      setInputDeficiency("");
      setInputActionItem("");
      setInputFrequency("");
      setInputActualFrequency("");
      setInputAchieveRate("");
    }
  }, [selectedProgId, selectedYear, projects]);

  // 추진일정 변경 이벤트 핸들러 (기존 호환 유지)
  const handleTimelineChange = (start, end) => {
    setInputStartDate(start);
    setInputEndDate(end);
    if (start && end) {
      setInputTimeline(`${start} ~ ${end}`);
    } else if (start) {
      setInputTimeline(`${start} ~`);
    } else if (end) {
      setInputTimeline(`~ ${end}`);
    } else {
      setInputTimeline("");
    }
  };

  // 프로그램 선택 시 모든 기획/환류/재원 상태 로드
  const handleSelectProgram = (prog) => {
    setSelectedProgId(prog.id);
    setFeedbackMsg("");
  };

  // P단계 완료 조건 판정 공통 함수
  const checkPStageCompletion = (prog, py, draftData = {}) => {
    const sNational = draftData.budget_national !== undefined ? draftData.budget_national : (py.budget_national || 0);
    const sCity = draftData.budget_city !== undefined ? draftData.budget_city : (py.budget_city || 0);
    const sExternal = draftData.budget_external !== undefined ? draftData.budget_external : (py.budget_external || 0);
    const sCarryNational = draftData.budget_carry_national !== undefined ? draftData.budget_carry_national : (py.budget_carry_national || 0);
    const sCarryCity = draftData.budget_carry_city !== undefined ? draftData.budget_carry_city : (py.budget_carry_city || 0);
    const sCarryExternal = draftData.budget_carry_external !== undefined ? draftData.budget_carry_external : (py.budget_carry_external || 0);

    // 1. 재원별 예산 배정: 본예산, 이월예산, 외부사업비 중 하나라도 입력되면 OK (0원 초과)
    const budgetTotal = sNational + sCity + sExternal + sCarryNational + sCarryCity + sCarryExternal;
    if (budgetTotal <= 0) return { ok: false, reason: "본예산, 이월예산, 외부사업비 중 하나라도 배정액이 0원 초과여야 합니다." };

    // 2. 비목별 예산 배정: 하나라도 입력되면 OK (0원 초과)
    const categories = draftData.budget_categories !== undefined ? draftData.budget_categories : (py.budget_categories || []);
    const hasValidCategory = categories.some(c => c.category && c.category !== "" && c.category !== "선택 안 함" && ((parseFloat(c.budget) || 0) > 0 || (parseFloat(c.budget_carry) || 0) > 0));
    if (!hasValidCategory) return { ok: false, reason: "비목별 예산 배정이 최소 하나 이상 등록되고 배정 금액이 0원 초과여야 합니다." };

    // 3. 월별 추진일정: P, D, C, A가 모두 반영되어야 OK
    const timelineStr = draftData.timeline !== undefined ? draftData.timeline : (prog.timeline || "");
    const timelineList = timelineStr.split(",").map(t => t.trim().toUpperCase());
    const hasP = timelineList.some(t => t.includes("P"));
    const hasD = timelineList.some(t => t.includes("D"));
    const hasC = timelineList.some(t => t.includes("C"));
    const hasA = timelineList.some(t => t.includes("A"));
    if (!hasP || !hasD || !hasC || !hasA) {
      return { ok: false, reason: "월별 추진일정에 P(기획), D(수행), C(성과), A(환류)가 각각 최소 1회 이상 모두 반영되어야 합니다." };
    }

    // 4. 성과지표 연계: '없음'을 선택하면 오른쪽에 성과지표 선택하지 않아도 됨, '자율'이나 '중점'이 선택되면 성과지표를 선택하고 세부 항목까지 입력해야 OK
    const kpiType = draftData.kpi_type !== undefined ? draftData.kpi_type : (prog.kpi_type || "자율");
    const kpiLink = draftData.kpi_link !== undefined ? draftData.kpi_link : (prog.kpi_link || "");
    if (kpiType === "자율" || kpiType === "중점") {
      if (!kpiLink || kpiLink === "" || kpiLink === "선택 안 함") {
        return { ok: false, reason: `성과지표 연계 구분이 '${kpiType}'인 경우 연계할 성과지표를 선택해야 합니다.` };
      }
      
      // 실적목표: 1개만 입력되더라도 OK
      const freq = draftData.frequency !== undefined ? draftData.frequency : (prog.frequency || 0);
      const tPart = draftData.target_participants !== undefined ? draftData.target_participants : (prog.target_participants || 0);
      const tDev = draftData.target_developments !== undefined ? draftData.target_developments : (prog.target_developments || 0);
      const tEtc = draftData.target_etc !== undefined ? draftData.target_etc : (prog.target_etc || 0);
      const hasTarget = freq > 0 || tPart > 0 || tDev > 0 || tEtc > 0;
      if (!hasTarget) {
        return { ok: false, reason: "성과지표의 세부 목표치(실적 목표)가 최소 1개 이상 입력되어야 합니다." };
      }
    }

    // 5. 참여대상: 입력 필요
    const targetAudience = draftData.targetAudience !== undefined ? draftData.targetAudience : (prog.targetAudience || "");
    if (!targetAudience.trim()) {
      return { ok: false, reason: "참여대상 기획 항목을 반드시 입력해야 합니다." };
    }

    // 연계부서: 입력이 없어도 OK (검증 제외)

    return { ok: true };
  };

  // PDCA 단계 완료 조건 검증 및 강제 롤백 방어
  const handleUpdatePDCA = (stage, status) => {
    if (!activeProg) return;

    const py = activeProg.years?.[selectedYear] || {};
    const budgetMain = py.budget_main || 0;
    const spentMain = py.spent_main || 0;
    
    const timeline = activeProg.timeline || "";
    const targetAudience = activeProg.targetAudience || "";
    const coopDept = activeProg.coopDept || "";
    
    const participants = activeProg.participants || 0;
    const satisfaction = activeProg.satisfaction || 0;
    
    const evalType = activeProg.evalType || "우수";
    const excellent = activeProg.excellent || "";
    const improvePlan = activeProg.improvePlan || "";
    const deficiency = activeProg.deficiency || "";
    const actionItem = activeProg.actionItem || "";

    const currentP = activeProg.pdca?.p || "대기";
    const currentD = activeProg.pdca?.d || "대기";
    const currentC = activeProg.pdca?.c || "대기";
    const currentA = activeProg.pdca?.a || "대기";

    if (status === "완료") {
      // 1. 단계별 의존성 체크
      if (stage === "d" && currentP !== "완료") {
        alert("[단계 의존성 오류] P(Plan) 단계가 완료되어야만 D(Do) 단계를 완료 처리할 수 있습니다.");
        return;
      }
      if (stage === "c" && currentD !== "완료") {
        alert("[단계 의존성 오류] D(Do) 단계가 완료되어야만 C(Check) 단계를 완료 처리할 수 있습니다.");
        return;
      }
      if (stage === "a" && currentC !== "완료") {
        alert("[단계 의존성 오류] C(Check) 단계가 완료되어야만 A(Act) 단계를 완료 처리할 수 있습니다.");
        return;
      }

      // 2. 개별 단계 완료 세부 조건 체크
      if (stage === "p") {
        const comp = checkPStageCompletion(activeProg, py);
        if (!comp.ok) {
          alert(`[검증 실패] P(Plan) 단계를 완료할 수 없습니다.\n- 원인: ${comp.reason}`);
          return;
        }
      } else if (stage === "d") {
        const actualFrequency = activeProg.actualFrequency || 0;
        if (spentMain <= 0) {
          alert(`[검증 실패] D(Do) 단계를 완료하려면 실제 세부 집행 실적이 기재되어야 합니다.`);
          return;
        }
        if (participants <= 0) {
          alert(`[검증 실패] D(Do) 단계를 완료하려면 최종 이수인원(0명 초과)이 기재되어야 합니다.`);
          return;
        }
        if (actualFrequency <= 0) {
          alert(`[검증 실패] D(Do) 단계를 완료하려면 수행 횟수(0회 초과)가 기재되어야 합니다.`);
          return;
        }
      } else if (stage === "c") {
        const achievements = activeProg.achievements || "";
        if (!achievements.trim()) {
          alert(`[검증 실패] C(Check) 단계를 완료하려면 성과사항이 기입되어야 합니다.`);
          return;
        }
        if (satisfaction <= 0) {
          alert(`[검증 실패] C(Check) 단계를 완료하려면 만족도(0점 초과)가 기재되어야 합니다.`);
          return;
        }
      } else if (stage === "a") {
        if (evalType === "우수") {
          if (!excellent.trim() || !improvePlan.trim()) {
            alert(`[검증 실패] A(Act) 우수 프로그램 상태를 완료하려면 '우수한 점'과 '발전방안'을 모두 기입해 주셔야 합니다.`);
            return;
          }
        } else {
          if (!deficiency.trim() || !actionItem.trim()) {
            alert(`[검증 실패] A(Act) 미흡 프로그램 상태를 완료하려면 '미비점'과 '개선사항'을 모두 기입해 주셔야 합니다.`);
            return;
          }
        }
      }
    }

    // 의존성 롤백 제어: 특정 단계를 완료에서 해제하는 경우, 하위 단계들도 연쇄 롤백시킴
    const newPdca = { ...activeProg.pdca, [stage]: status };
    
    if (status !== "완료") {
      if (stage === "p") {
        newPdca.d = "진행";
        newPdca.c = "진행";
        newPdca.a = "진행";
      } else if (stage === "d") {
        newPdca.c = "진행";
        newPdca.a = "진행";
      } else if (stage === "c") {
        newPdca.a = "진행";
      }
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      pdca: newPdca
    });
    
    setFeedbackMsg(`${stage.toUpperCase()} 단계 상태가 '${status}'(으)로 갱신되었습니다.`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // P 단계 기획 정보 및 세부 재원 예산 등록
  const handleUpdatePDetails = (e) => {
    e.preventDefault();
    if (!activeProg) return;

    const bNational = Math.round(parseDecimalFromCommas(inputBudgetNational) * 1000000);
    const bCity = Math.round(parseDecimalFromCommas(inputBudgetCity) * 1000000);
    const bExternal = Math.round(parseDecimalFromCommas(inputBudgetExternal) * 1000000);

    const bCarryNational = selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(inputBudgetCarryNational) * 1000000);
    const bCarryCity = selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(inputBudgetCarryCity) * 1000000);
    const bCarryExternal = 0; // 외부사업비는 본/이월 구분이 없어 0원으로 고정

    if (bNational < 0 || bCity < 0 || bExternal < 0 || bCarryNational < 0 || bCarryCity < 0) {
      alert("배정 예산은 0원 이상의 올바른 숫자 형식이어야 합니다.");
      return;
    }

    // 비목별 예산 및 집행 데이터 조립 및 복원 (본예산/이월예산 및 집행액 구분)
    const categoriesToSave = inputBudgetCategories
      .filter((c) => c.category && c.category !== "")
      .map((c) => ({
        category: c.category,
        budget: Math.round(parseDecimalFromCommas(c.budget) * 1000000),
        budget_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.budget_carry) * 1000000),
        spent: Math.round(parseDecimalFromCommas(c.spent || "0.0") * 1000000),
        spent_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.spent_carry || "0.0") * 1000000)
      }));

    // 최신 임시 데이터들을 취합하여 P단계의 자동 완료/진행 판정
    const freqVal = inputTargetParticipants !== "" ? parseInt(inputTargetParticipants, 10) : 0;
    const tPartVal = inputTargetParticipants !== "" ? parseInt(inputTargetParticipants, 10) : 0;
    const tDevVal = inputTargetDevelopments !== "" ? parseInt(inputTargetDevelopments, 10) : 0;
    const tEtcVal = inputTargetEtc !== "" ? parseInt(inputTargetEtc, 10) : 0;

    const draftData = {
      budget_national: bNational,
      budget_city: bCity,
      budget_external: bExternal,
      budget_carry_national: bCarryNational,
      budget_carry_city: bCarryCity,
      budget_carry_external: bCarryExternal,
      budget_categories: categoriesToSave,
      timeline: inputMonthlyPDCA.join(","),
      kpi_type: inputKpiType,
      kpi_link: inputKpiLink,
      frequency: freqVal,
      target_participants: tPartVal,
      target_developments: tDevVal,
      target_etc: tEtcVal,
      targetAudience: inputTargetAudience
    };

    const comp = checkPStageCompletion(activeProg, activeProg.years?.[selectedYear] || {}, draftData);
    const autoPState = comp.ok ? "완료" : "진행";

    const combinedCoopDept = [inputCoopDept1, inputCoopDept2].filter(Boolean).join(", ");

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      pdca: { ...activeProg.pdca, p: autoPState },
      timeline: inputMonthlyPDCA.join(","), // 12개월 쉼표 직렬화 저장
      targetAudience: inputTargetAudience,
      coopDept: combinedCoopDept,
      frequency: inputTargetParticipants !== "" ? parseInt(inputTargetParticipants, 10) : 0,
      target_participants: inputTargetParticipants !== "" ? parseInt(inputTargetParticipants, 10) : 0,
      target_developments: inputTargetDevelopments !== "" ? parseInt(inputTargetDevelopments, 10) : 0,
      target_etc: inputTargetEtc !== "" ? parseInt(inputTargetEtc, 10) : 0,
      target_participants_unit: inputTargetParticipantsUnit,
      target_developments_unit: inputTargetDevelopmentsUnit,
      target_etc_unit: inputTargetEtcUnit,
      target_participants_name: inputTargetParticipantsName,
      target_developments_name: inputTargetDevelopmentsName,
      target_etc_name: inputTargetEtcName,
      kpi_type: inputKpiType,
      kpi_link: inputKpiLink,
      budget_national: bNational,
      budget_city: bCity,
      budget_external: bExternal,
      budget_carry_national: bCarryNational,
      budget_carry_city: bCarryCity,
      budget_carry_external: bCarryExternal,
      budget_categories: categoriesToSave
    });

    setFeedbackMsg("P 단계 기획 정보 및 세부 재원별 예산 배정이 적용되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };



  // D 단계 집행 및 실적 등록 (재원별 집행 및 이수인원 기입)
  const handleUpdateBudget = (e) => {
    e.preventDefault();
    if (!activeProg) return;

    const sNational = Math.round(parseDecimalFromCommas(inputSpentNational) * 1000000);
    const sCity = Math.round(parseDecimalFromCommas(inputSpentCity) * 1000000);
    const sExternal = Math.round(parseDecimalFromCommas(inputSpentExternal) * 1000000);
    const parsedParticipants = parseInt(inputParticipants, 10);

    const py = activeProg.years?.[selectedYear] || {};
    const limitNational = Math.round((py.budget_national || 0) + (py.budget_carry_national || 0));
    const limitCity = Math.round((py.budget_city || 0) + (py.budget_carry_city || 0));
    const limitExternal = Math.round((py.budget_external || 0) + (py.budget_carry_external || 0));

    if (sNational > limitNational) {
      alert(`[한도 초과] 국고 집행액(${(sNational / 1000000).toFixed(1)} 백만원)은 배정 예산(${(limitNational / 1000000).toFixed(1)} 백만원)을 초과할 수 없습니다.`);
      return;
    }
    if (sCity > limitCity) {
      alert(`[한도 초과] 시비 집행액(${(sCity / 1000000).toFixed(1)} 백만원)은 배정 예산(${(limitCity / 1000000).toFixed(1)} 백만원)을 초과할 수 없습니다.`);
      return;
    }
    if (sExternal > limitExternal) {
      alert(`[한도 초과] 외부사업비 집행액(${(sExternal / 1000000).toFixed(1)} 백만원)은 배정 예산(${(limitExternal / 1000000).toFixed(1)} 백만원)을 초과할 수 없습니다.`);
      return;
    }
    if (isNaN(parsedParticipants) || parsedParticipants < 0) {
      alert("올바른 형식의 최종 이수인원(명)을 입력해 주세요.");
      return;
    }

    // D단계 비목별 집행액 데이터 취합 (본예산 및 이월예산은 유지)
    const categoriesToSave = inputBudgetCategories
      .filter((c) => c.category && c.category !== "")
      .map((c) => ({
        category: c.category,
        budget: Math.round(parseDecimalFromCommas(c.budget || "0.0") * 1000000),
        budget_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.budget_carry || "0.0") * 1000000),
        spent: Math.round(parseDecimalFromCommas(c.spent || "0.0") * 1000000),
        spent_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.spent_carry || "0.0") * 1000000)
      }));

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      spent_national: sNational,
      spent_city: sCity,
      spent_external: sExternal,
      participants: parsedParticipants,
      actualFrequency: inputActualFrequency !== "" ? parseInt(inputActualFrequency, 10) : 0,
      achieveRate: inputAchieveRate !== "" ? parseFloat(inputAchieveRate) : 0,
      budget_categories: categoriesToSave,
      actual_timeline: inputMonthlyPDCAActual.join(",") // 실제 일정을 쉼표로 연결해서 전송
    });

    setFeedbackMsg("D 단계 집행 실적 및 이수인원이 안전하게 저장되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // 프로그램 추가 처리 핸들러
  const handleCreateProgram = (e) => {
    e.preventDefault();
    if (!selectedUnitId) {
      alert("단위과제를 먼저 선택해 주세요.");
      return;
    }
    if (!newProgTitle.trim()) {
      alert("프로그램명을 입력해 주세요.");
      return;
    }

    const budgetVal = parseFloat(newProgBudget) || 0;
    const carryVal = parseFloat(newProgCarry) || 0;

    if (onAddProgram) {
      onAddProgram(selectedUnitId, newProgTitle.trim(), newProgAssignee.trim(), budgetVal, carryVal);
    }

    // 모달 상태 초기화 및 닫기
    setShowAddModal(false);
    setNewProgTitle("");
    setNewProgAssignee("");
    setNewProgBudget("");
    setNewProgCarry("");

    setFeedbackMsg("신규 프로그램이 성공적으로 생성 및 추가되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // C 단계 실적 입력 (성과사항 서술 및 만족도 기입)
  const handleUpdateCDetails = (e) => {
    e.preventDefault();
    if (!activeProg) return;

    const parsedSatisfaction = parseFloat(inputSatisfaction);

    if (!inputAchievements.trim()) {
      alert("성과사항을 서술해 주세요.");
      return;
    }
    if (isNaN(parsedSatisfaction) || parsedSatisfaction < 0 || parsedSatisfaction > 100) {
      alert("만족도는 0~100 사이의 숫자로 입력해 주세요.");
      return;
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      achievements: inputAchievements,
      satisfaction: parsedSatisfaction
    });

    setFeedbackMsg("C 단계 성과 실적(성과사항, 만족도)이 안전하게 저장되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // A 단계 자체 평가 및 환류 2분할 방안 저장
  const handleUpdateA = (e) => {
    e.preventDefault();
    if (!activeProg) return;

    if (inputEvalType === "우수") {
      if (!inputExcellent.trim() || !inputImprovePlan.trim()) {
        alert("우수 프로그램 환류 사항(우수한 점 및 발전방안)을 모두 기재해 주세요.");
        return;
      }
    } else {
      if (!inputDeficiency.trim() || !inputActionItem.trim()) {
        alert("미흡 프로그램 환류 사항(미비점 및 개선사항)을 모두 기재해 주세요.");
        return;
      }
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      evalType: inputEvalType,
      excellent: inputExcellent,
      improvePlan: inputImprovePlan,
      deficiency: inputDeficiency,
      actionItem: inputActionItem
    });

    setFeedbackMsg("A 단계 평가 환류 방안이 영구 반영되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 상단: 단위과제별 / 전체보기 탭 버튼 */}
      {!isResearcher && (
        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.4rem", borderRadius: "0.75rem", width: "fit-content" }}>
          <button
            onClick={() => { setViewMode("unit"); setSelectedProgId(null); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              background: viewMode === "unit" ? "var(--accent-color)" : "transparent",
              color: viewMode === "unit" ? "white" : "var(--text-secondary-dark)",
              transition: "all 0.2s ease"
            }}
          >
            <Layers size={14} />
            <span>단위과제별 조회/등록</span>
          </button>
          <button
            onClick={() => { setViewMode("all"); setSelectedProgId(null); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              background: viewMode === "all" ? "var(--accent-color)" : "transparent",
              color: viewMode === "all" ? "white" : "var(--text-secondary-dark)",
              transition: "all 0.2s ease"
            }}
          >
            <LayoutList size={14} />
            <span>전체 목록 조회/등록</span>
          </button>
        </div>
      )}

      {/* 이원화 분기 렌더링 */}
      {viewMode === "unit" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
          {/* 좌측: 프로그램 목록 */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.3rem" }}>단위과제 필터 선택</span>
              <select
                className="user-selector"
                value={selectedUnitId}
                onChange={(e) => { setSelectedUnitId(e.target.value); setSelectedProgId(null); }}
              >
                {allUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id === "Common" ? "" : `${u.id}. `}{u.title}
                  </option>
                ))}
              </select>
            </div>

            <h4 style={{ fontSize: "0.9rem", fontWeight: "800", borderTop: "1px solid var(--border-color-dark)", paddingTop: "1rem" }}>프로그램 리스트</h4>
            <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {unitFilteredPrograms.length === 0 ? (
                <p style={{ color: "var(--text-secondary-dark)", fontSize: "0.75rem", textAlign: "center", padding: "2rem" }}>
                  해당 과제에 배정된 본인 담당 프로그램이 없습니다.
                </p>
              ) : (
                unitFilteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => handleSelectProgram(prog)}
                    style={{
                      padding: "0.8rem 1rem",
                      borderRadius: "0.6rem",
                      border: `1px solid ${selectedProgId === prog.id ? "var(--accent-color)" : "var(--border-color-dark)"}`,
                      background: selectedProgId === prog.id ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>
                      <span>{prog.id}</span>
                      <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>
                        {(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee) || "미배정"}
                      </span>
                    </div>
                    <h5 style={{ fontSize: "0.8rem", fontWeight: "700", lineHeight: "1.3" }}>{prog.title}</h5>
                  </div>
                ))
              )}
            </div>
            
            {/* 프로그램 신규 생성 추가 버튼 */}
            {currentRole.rank <= 1 && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{
                  marginTop: "0.5rem",
                  width: "100%",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  fontWeight: "700",
                  fontSize: "0.78rem",
                  padding: "0.5rem",
                  borderRadius: "0.4rem",
                  boxShadow: "0 4px 10px rgba(37,99,235,0.2)"
                }}
              >
                + 신규 프로그램 추가
              </button>
            )}
          </div>

          {/* 우측: 프로그램 편집 패널 */}
          <div className="glass-card">
            {activeProg ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div style={{ borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>{activeProg.unitTitle}</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.2rem" }}>[{activeProg.id}] {activeProg.title}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                    <div>배정 본예산: <strong style={{ color: "white" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.budget_main)}백만원</strong></div>
                    <div>이월 예산액: <strong style={{ color: "white" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.budget_carry)}백만원</strong></div>
                    <div>본집행 실적: <strong style={{ color: "white" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.spent_main)}백만원</strong></div>
                    <div>이월 집행액: <strong style={{ color: "white" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.spent_carry)}백만원</strong></div>
                  </div>
                </div>

                {/* PDCA 현황 제어기 */}
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem" }}>PDCA 상태 설정</h4>
                  <div className="pdca-stepper">
                    {["p", "d", "c", "a"].map((stage) => {
                      const status = activeProg.pdca[stage];
                      const isDone = status === "완료";
                      const isProgress = status === "진행";
                      return (
                        <div key={stage} className={`pdca-step-item ${isDone ? "done" : isProgress ? "in-progress" : ""}`}>
                          <div className="pdca-circle">{stage.toUpperCase()}</div>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                            {stage === "p" ? "Plan" : stage === "d" ? "Do" : stage === "c" ? "Check" : "Act"}
                          </span>
                          {(isResearcher || currentRole.rank <= 2) && (
                            <select
                              style={{ 
                                fontSize: "0.65rem", 
                                background: stage === "p" ? "#27272a" : "#18181b", 
                                color: stage === "p" ? "#a1a1aa" : "white", 
                                border: "1px solid var(--border-color-dark)", 
                                borderRadius: "0.25rem", 
                                marginTop: "0.2rem",
                                cursor: stage === "p" ? "not-allowed" : "pointer"
                              }}
                              value={status}
                              disabled={stage === "p"}
                              title={stage === "p" ? "Plan 단계 상태는 기획 정보 입력량에 따라 자동으로 설정됩니다." : ""}
                              onChange={(e) => handleUpdatePDCA(stage, e.target.value)}
                            >
                              <option value="대기">대기</option>
                              <option value="진행">진행</option>
                              <option value="완료">완료</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 기획/실적 단계 선택 드롭다운 */}
                <div style={{
                  marginBottom: "1rem",
                  padding: "0.6rem 0.8rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color-dark)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.8rem",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ClipboardList size={20} style={{ color: "var(--accent-color)" }} />
                    <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-secondary-dark)" }}>P-D-C-A 단계 선택</span>
                  </div>
                  <select
                    className="user-selector"
                    value={activePdcaStage}
                    onChange={(e) => setActivePdcaStage(e.target.value)}
                    style={{
                      flex: 1,
                      maxWidth: "380px",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      background: "#18181b",
                      color: "white",
                      border: "1px solid var(--border-color-dark)",
                      borderRadius: "0.3rem",
                      outline: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    <option value="P" style={{ background: "#18181b", color: "white" }}>Plan (P 단계: 예산 기획 및 세부 추진계획)</option>
                    <option value="D" style={{ background: "#18181b", color: "white" }}>Do (D 단계: 세부 재원별 본집행액 및 실적 입력)</option>
                    <option value="C" style={{ background: "#18181b", color: "white" }}>Check (C 단계: 운영 성과 실적 입력)</option>
                    <option value="A" style={{ background: "#18181b", color: "white" }}>Act (A 단계: 사업 환류 및 자체평가)</option>
                  </select>
                </div>

                {/* P 단계: 기획 정보 수립 & 예산 세부 배정 */}
                {activePdcaStage === "P" && (isResearcher || currentRole.rank <= 2) && (
                  <form onSubmit={handleUpdatePDetails} style={{ padding: "0.75rem", background: "rgba(59,130,246,0.02)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.6rem", color: "var(--accent-color)" }}>P 단계: 예산 기획 및 세부 추진계획</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      
                      {/* 1영역: 재원별 예산 */}
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.15rem" }}>재원별 예산 배정 (백만원 단위)</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {/* 재원별 3개 분할 영역 (국고, 지자체시비, 외부사업비) */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                            {/* 국고 카드 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "0.35rem", border: "1px solid var(--border-color-dark)" }}>
                              <span style={{ fontSize: "0.62rem", color: "#60a5fa", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.15rem", marginBottom: "0.15rem" }}>국고</span>
                              <div>
                                <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)" }}>본예산</span>
                                <input type="text" className="user-selector budget-main-input" value={inputBudgetNational} onChange={(e) => setInputBudgetNational(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                              </div>
                              {selectedYear !== 1 && (
                                <div>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)" }}>이월예산</span>
                                  <input type="text" className="user-selector budget-carry-input" value={inputBudgetCarryNational} onChange={(e) => setInputBudgetCarryNational(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                </div>
                              )}
                            </div>

                            {/* 지자체 시비 카드 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "0.35rem", border: "1px solid var(--border-color-dark)" }}>
                              <span style={{ fontSize: "0.62rem", color: "#34d399", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.15rem", marginBottom: "0.15rem" }}>지자체 시비</span>
                              <div>
                                <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)" }}>본예산</span>
                                <input type="text" className="user-selector budget-main-input" value={inputBudgetCity} onChange={(e) => setInputBudgetCity(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                              </div>
                              {selectedYear !== 1 && (
                                <div>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)" }}>이월예산</span>
                                  <input type="text" className="user-selector budget-carry-input" value={inputBudgetCarryCity} onChange={(e) => setInputBudgetCarryCity(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                                </div>
                              )}
                            </div>

                            {/* 외부사업비 카드 (본예산/이월예산 구분 없이 '외부사업비' 단일 입력) */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "0.35rem", border: "1px solid var(--border-color-dark)" }}>
                              <span style={{ fontSize: "0.62rem", color: "#fbbf24", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.15rem", marginBottom: "0.15rem" }}>외부사업비</span>
                              <div style={{ marginTop: selectedYear === 1 ? "0rem" : "0.85rem" }}>
                                <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.15rem" }}>외부사업비</span>
                                <input type="text" className="user-selector budget-main-input" value={inputBudgetExternal} onChange={(e) => setInputBudgetExternal(e.target.value.replace(/[^0-9.]/g, ""))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", width: "100%" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2영역: 비목별 예산 */}
                      <div style={{ borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.4rem" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.2rem" }}>비목별 예산 배정 (백만원 단위, 최대 4개)</span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                          {inputBudgetCategories.map((item, idx) => (
                            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.2rem", alignItems: "center" }}>
                              <select
                                className="user-selector"
                                value={item.category}
                                onChange={(e) => {
                                  const newCats = [...inputBudgetCategories];
                                  newCats[idx].category = e.target.value;
                                  setInputBudgetCategories(newCats);
                                }}
                                style={{ fontSize: "0.7rem", padding: "0.2rem", width: "100%" }}
                              >
                                {BUDGET_CATEGORIES_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                className="user-selector budget-main-input"
                                placeholder="본예산"
                                value={item.budget}
                                onChange={(e) => {
                                  const newCats = [...inputBudgetCategories];
                                  newCats[idx].budget = e.target.value.replace(/[^0-9.]/g, "");
                                  setInputBudgetCategories(newCats);
                                }}
                                style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                              />
                              <input
                                type="text"
                                className="user-selector budget-carry-input"
                                placeholder="이월비"
                                value={selectedYear === 1 ? 0 : item.budget_carry}
                                disabled={selectedYear === 1}
                                onChange={(e) => {
                                  if (selectedYear === 1) return;
                                  const newCats = [...inputBudgetCategories];
                                  newCats[idx].budget_carry = e.target.value.replace(/[^0-9.]/g, "");
                                  setInputBudgetCategories(newCats);
                                }}
                                style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3영역: 추진일정 */}
                      <div style={{ borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.4rem" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>월별 추진 일정 (PDCA)</span>
                        
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid rgba(255,255,255,0.03)", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.58rem", color: "var(--accent-color)", fontWeight: "800", display: "inline-block", marginBottom: "0.25rem" }}>● 계획 일정</span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.2rem", overflowX: "auto" }}>
                            {monthsList.map((month, idx) => {
                              const val = inputMonthlyPDCA[idx] || "";
                              
                              const getStatusColor = (v) => {
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
                              
                              const bg = getStatusColor(val);
                              
                              return (
                                <div key={idx} style={{ textAlign: "center", minWidth: "42px" }}>
                                  <div style={{ fontSize: "0.6rem", color: "var(--text-secondary-dark)", marginBottom: "0.15rem" }}>{month}</div>
                                  <select
                                    className="user-selector"
                                    value={val}
                                    onChange={(e) => {
                                      const newPDCA = [...inputMonthlyPDCA];
                                      newPDCA[idx] = e.target.value;
                                      setInputMonthlyPDCA(newPDCA);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "0.15rem 0.2rem",
                                      fontSize: "0.65rem",
                                      background: bg !== "transparent" ? bg : "#18181b",
                                      color: bg !== "transparent" ? "white" : "var(--text-secondary-dark)",
                                      border: "1px solid var(--border-color-dark)",
                                      borderRadius: "0.2rem",
                                      fontWeight: bg !== "transparent" ? "800" : "normal",
                                      outline: "none",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    <option value="" style={{ background: "#18181b", color: "white" }}>-</option>
                                    <option value="P" style={{ background: "#2563eb", color: "white" }}>P</option>
                                    <option value="D" style={{ background: "#10b981", color: "white" }}>D</option>
                                    <option value="C" style={{ background: "#f59e0b", color: "white" }}>C</option>
                                    <option value="A" style={{ background: "#d946ef", color: "white" }}>A</option>
                                    <option value="P/D" style={{ background: "#1e3a8a", color: "#60a5fa" }}>P/D</option>
                                    <option value="D/C" style={{ background: "#064e3b", color: "#34d399" }}>D/C</option>
                                    <option value="C/A" style={{ background: "#78350f", color: "#fbbf24" }}>C/A</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 성과지표 연계 설정 영역 */}
                        <div style={{ borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.45rem", marginTop: "0.2rem", marginBottom: "0.4rem" }}>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.3rem" }}>
                            성과지표 연계
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "0.5rem" }}>
                            {/* 지표 유형 선택 라디오 그룹 */}
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "#18181b", padding: "0.2rem 0.4rem", borderRadius: "0.25rem", border: "1px solid var(--border-color-dark)" }}>
                              <span style={{ fontSize: "0.62rem", color: "var(--text-secondary-dark)", marginRight: "0.1rem" }}>유형:</span>
                              <label style={{ fontSize: "0.65rem", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                <input 
                                  type="radio" 
                                  name="kpiTypeSelect" 
                                  value="자율" 
                                  checked={inputKpiType === "자율"} 
                                  onChange={() => {
                                    setInputKpiType("자율");
                                    setInputKpiLink(""); // 유형 변경 시 초기화
                                  }} 
                                />
                                자율
                              </label>
                              <label style={{ fontSize: "0.65rem", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                <input 
                                  type="radio" 
                                  name="kpiTypeSelect" 
                                  value="중점" 
                                  checked={inputKpiType === "중점"} 
                                  onChange={() => {
                                    setInputKpiType("중점");
                                    setInputKpiLink(""); // 유형 변경 시 초기화
                                  }} 
                                />
                                중점
                              </label>
                              <label style={{ fontSize: "0.65rem", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                <input 
                                  type="radio" 
                                  name="kpiTypeSelect" 
                                  value="없음" 
                                  checked={inputKpiType === "없음" || !inputKpiType} 
                                  onChange={() => {
                                    setInputKpiType("없음");
                                    setInputKpiLink(""); // 없음 선택 시 링크 초기화
                                  }} 
                                />
                                없음
                              </label>
                            </div>
                            
                            {/* 지표 목록 드롭다운 */}
                            <div>
                              <select
                                className="user-selector"
                                value={inputKpiLink}
                                disabled={inputKpiType === "없음"}
                                onChange={(e) => setInputKpiLink(e.target.value)}
                                style={{ 
                                  width: "100%", 
                                  padding: "0.25rem 0.4rem", 
                                  fontSize: "0.7rem", 
                                  background: inputKpiType === "없음" ? "#27272a" : "#18181b", 
                                  color: inputKpiType === "없음" ? "#a1a1aa" : "white", 
                                  border: "1px solid var(--border-color-dark)",
                                  cursor: inputKpiType === "없음" ? "not-allowed" : "pointer"
                                }}
                              >
                                {inputKpiType === "없음" ? (
                                  <option value="" style={{ background: "#18181b", color: "#a1a1aa" }}>-- 성과지표 연계 없음 --</option>
                                ) : (
                                  <option value="" style={{ background: "#18181b", color: "white" }}>-- 성과지표를 선택해 주세요 --</option>
                                )}
                                {(() => {
                                  // 소속 단위과제 KPI를 우선으로 하고 없으면 전체 폴백
                                  const activeUnit = allUnits.find(u => u.programs?.some(p => p.id === activeProg?.id));
                                  let filteredKpis = activeUnit?.kpis || [];
                                  if (!Array.isArray(filteredKpis) || filteredKpis.length === 0) {
                                    const kpiMap = new Map();
                                    allUnits.forEach(u => {
                                      if (Array.isArray(u.kpis)) {
                                        u.kpis.forEach(k => {
                                          if (k && k.id) kpiMap.set(k.id, k);
                                        });
                                      }
                                    });
                                    filteredKpis = Array.from(kpiMap.values());
                                  }
                                  return filteredKpis
                                    .filter(k => k && k.type === inputKpiType)
                                    .map(k => (
                                      <option key={k.id} value={k.id} style={{ background: "#18181b", color: "white" }}>
                                        [{k.id}] {k.name}
                                      </option>
                                    ));
                                })()}
                              </select>
                            </div>
                          </div>

                          {/* 성과지표 선택 시 세부지표 목록을 바로 아래 줄에 디스플레이 */}
                          {inputKpiLink && (() => {
                            const activeUnit = allUnits.find(u => u.programs?.some(p => p.id === activeProg?.id));
                            let filteredKpis = activeUnit?.kpis || [];
                            if (!Array.isArray(filteredKpis) || filteredKpis.length === 0) {
                              const kpiMap = new Map();
                              allUnits.forEach(u => {
                                if (Array.isArray(u.kpis)) {
                                  u.kpis.forEach(k => {
                                    if (k && k.id) kpiMap.set(k.id, k);
                                  });
                                }
                              });
                              filteredKpis = Array.from(kpiMap.values());
                            }
                            const selectedKpi = filteredKpis.find(k => k && k.id === inputKpiLink);
                            if (!selectedKpi) return null;
                            return (
                              <div style={{ marginTop: "0.4rem", background: "rgba(59, 130, 246, 0.04)", border: "1px solid rgba(59, 130, 246, 0.15)", borderRadius: "0.3rem", padding: "0.4rem 0.6rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.15rem" }}>
                                  <span style={{ fontSize: "0.62rem", color: "#60a5fa", fontWeight: "700" }}>📌 연계 성과지표 상세: {selectedKpi.name}</span>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)" }}>공식: {selectedKpi.formula || "N/A"}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                  <span style={{ fontSize: "0.58rem", color: "var(--text-secondary-dark)", display: "block" }}>세부지표 목록:</span>
                                  {selectedKpi.subItems && selectedKpi.subItems.length > 0 ? (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.3rem" }}>
                                      {selectedKpi.subItems.map(sub => (
                                        <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "0.15rem 0.35rem", borderRadius: "0.2rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                                          <span style={{ fontSize: "0.6rem", color: "white" }}>• {sub.name}</span>
                                          <span style={{ fontSize: "0.6rem", color: "#34d399", fontWeight: "700" }}>({sub.unit})</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: "0.6rem", color: "var(--text-secondary-dark)" }}>등록된 세부지표가 없습니다.</span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* 실적목표 3종 구분 입력 (제목 입력창 신설 및 수치/단위 분리) */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
                          {/* 실적목표 1 */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>실적목표 1 제목</span>
                            <input 
                              type="text" 
                              className="user-selector" 
                              placeholder="실적목표명 (예: 참여인원)" 
                              value={inputTargetParticipantsName} 
                              onChange={(e) => setInputTargetParticipantsName(e.target.value)} 
                              style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", width: "100%", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)" }} 
                            />
                            <div style={{ display: "flex", gap: "0.2rem" }}>
                              <input 
                                type="number" 
                                className="user-selector" 
                                placeholder="수치" 
                                value={inputTargetParticipants} 
                                onChange={(e) => setInputTargetParticipants(e.target.value)} 
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", flex: 2, minWidth: 0 }} 
                              />
                              <input 
                                type="text" 
                                className="user-selector" 
                                placeholder="단위" 
                                value={inputTargetParticipantsUnit} 
                                onChange={(e) => setInputTargetParticipantsUnit(e.target.value)} 
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", flex: 1, minWidth: 0, textAlign: "center" }} 
                              />
                            </div>
                          </div>

                          {/* 실적목표 2 */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>실적목표 2 제목</span>
                            <input 
                              type="text" 
                              className="user-selector" 
                              placeholder="실적목표명 (예: 개발수)" 
                              value={inputTargetDevelopmentsName} 
                              onChange={(e) => setInputTargetDevelopmentsName(e.target.value)} 
                              style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", width: "100%", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)" }} 
                            />
                            <div style={{ display: "flex", gap: "0.2rem" }}>
                              <input 
                                type="number" 
                                className="user-selector" 
                                placeholder="수치" 
                                value={inputTargetDevelopments} 
                                onChange={(e) => setInputTargetDevelopments(e.target.value)} 
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", flex: 2, minWidth: 0 }} 
                              />
                              <input 
                                type="text" 
                                className="user-selector" 
                                placeholder="단위" 
                                value={inputTargetDevelopmentsUnit} 
                                onChange={(e) => setInputTargetDevelopmentsUnit(e.target.value)} 
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", flex: 1, minWidth: 0, textAlign: "center" }} 
                              />
                            </div>
                          </div>

                          {/* 실적목표 3 */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>실적목표 3 제목</span>
                            <input 
                              type="text" 
                              className="user-selector" 
                              placeholder="실적목표명 (예: 기타)" 
                              value={inputTargetEtcName} 
                              onChange={(e) => setInputTargetEtcName(e.target.value)} 
                              style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", width: "100%", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)" }} 
                            />
                            <div style={{ display: "flex", gap: "0.2rem" }}>
                              <input 
                                type="number" 
                                className="user-selector" 
                                placeholder="수치" 
                                value={inputTargetEtc} 
                                onChange={(e) => setInputTargetEtc(e.target.value)} 
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", flex: 2, minWidth: 0 }} 
                              />
                              <input 
                                type="text" 
                                className="user-selector" 
                                placeholder="단위" 
                                value={inputTargetEtcUnit} 
                                onChange={(e) => setInputTargetEtcUnit(e.target.value)} 
                                style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem", flex: 1, minWidth: 0, textAlign: "center" }} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* 참여대상 & 연계부서 (실적목표 아래로 한 줄 배치) */}
                        {(() => {
                          const coopDeptOptions = (
                            <>
                              <option value="" style={{ background: "#18181b", color: "#a1a1aa" }}>-- 선택 안 함 --</option>
                              <optgroup label="RISE(앵커)사업단 센터" style={{ background: "#18181b", color: "#60a5fa" }}>
                                <option value="ECC센터" style={{ background: "#18181b", color: "white" }}>ECC센터</option>
                                <option value="ICC센터" style={{ background: "#18181b", color: "white" }}>ICC센터</option>
                                <option value="RCC센터" style={{ background: "#18181b", color: "white" }}>RCC센터</option>
                                <option value="AID-X지원센터" style={{ background: "#18181b", color: "white" }}>AID-X지원센터</option>
                                <option value="울산늘봄누리센터" style={{ background: "#18181b", color: "white" }}>울산늘봄누리센터</option>
                                <option value="신산업특화센터" style={{ background: "#18181b", color: "white" }}>신산업특화센터</option>
                                <option value="사업운영팀" style={{ background: "#18181b", color: "white" }}>사업운영팀</option>
                              </optgroup>
                              <optgroup label="대학본부 및 부속기관" style={{ background: "#18181b", color: "#34d399" }}>
                                <option value="기획팀" style={{ background: "#18181b", color: "white" }}>기획팀</option>
                                <option value="교무팀" style={{ background: "#18181b", color: "white" }}>교무팀</option>
                                <option value="교수학습지원센터" style={{ background: "#18181b", color: "white" }}>교수학습지원센터</option>
                                <option value="직업교육혁신센터" style={{ background: "#18181b", color: "white" }}>직업교육혁신센터</option>
                                <option value="취업지원팀" style={{ background: "#18181b", color: "white" }}>취업지원팀</option>
                                <option value="학생복지팀" style={{ background: "#18181b", color: "white" }}>학생복지팀</option>
                                <option value="입학팀" style={{ background: "#18181b", color: "white" }}>입학팀</option>
                                <option value="평생교육원" style={{ background: "#18181b", color: "white" }}>평생교육원</option>
                                <option value="국제교류원" style={{ background: "#18181b", color: "white" }}>국제교류원</option>
                              </optgroup>
                              <optgroup label="산학협력단 및 연구소/기타 센터" style={{ background: "#18181b", color: "#fbbf24" }}>
                                <option value="산학기획팀" style={{ background: "#18181b", color: "white" }}>산학기획팀</option>
                                <option value="산학지원팀" style={{ background: "#18181b", color: "white" }}>산학지원팀</option>
                                <option value="이차전지연구소" style={{ background: "#18181b", color: "white" }}>이차전지연구소</option>
                                <option value="탄소중립지원센터" style={{ background: "#18181b", color: "white" }}>탄소중립지원센터</option>
                                <option value="현장실습지원센터" style={{ background: "#18181b", color: "white" }}>현장실습지원센터</option>
                                <option value="창업창직교육센터" style={{ background: "#18181b", color: "white" }}>창업창직교육센터</option>
                              </optgroup>
                            </>
                          );

                          return (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.4rem" }}>
                              <div>
                                <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>참여대상</span>
                                <select
                                  className="user-selector"
                                  value={inputTargetAudience}
                                  onChange={(e) => setInputTargetAudience(e.target.value)}
                                  style={{ width: "100%", padding: "0.25rem 0.4rem", fontSize: "0.75rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}
                                >
                                  <option value="" style={{ background: "#18181b", color: "white" }}>-- 참여대상 선택 --</option>
                                  <option value="재학생" style={{ background: "#18181b", color: "white" }}>재학생</option>
                                  <option value="성인학습자" style={{ background: "#18181b", color: "white" }}>성인학습자</option>
                                  <option value="재직자" style={{ background: "#18181b", color: "white" }}>재직자</option>
                                  <option value="기타" style={{ background: "#18181b", color: "white" }}>기타</option>
                                </select>
                              </div>
                              <div>
                                <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>연계부서 (최대 2개 선택)</span>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.2rem" }}>
                                  <select
                                    className="user-selector"
                                    value={inputCoopDept1}
                                    onChange={(e) => setInputCoopDept1(e.target.value)}
                                    style={{ width: "100%", padding: "0.25rem 0.4rem", fontSize: "0.75rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}
                                  >
                                    {coopDeptOptions}
                                  </select>
                                  <select
                                    className="user-selector"
                                    value={inputCoopDept2}
                                    onChange={(e) => setInputCoopDept2(e.target.value)}
                                    style={{ width: "100%", padding: "0.25rem 0.4rem", fontSize: "0.75rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}
                                  >
                                    {coopDeptOptions}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
                        <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem" }}>
                          P(기획정보) 저장
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* D 단계: 세부 재원별 집행 등록 */}
                {activePdcaStage === "D" && (isResearcher || currentRole.rank <= 2) && (
                  <form onSubmit={handleUpdateBudget} style={{ padding: "0.75rem", background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "#10b981" }}>D 단계: 세부 재원별 본집행액 및 실적 입력</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      
                      {/* 실제 추진일정 */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid rgba(255,255,255,0.03)", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.58rem", color: "#10b981", fontWeight: "800", display: "inline-block", marginBottom: "0.25rem" }}>● 실제 추진일정</span>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.2rem", overflowX: "auto" }}>
                          {monthsList.map((month, idx) => {
                            const actVal = inputMonthlyPDCAActual[idx] || "";
                            
                            const getActualStatusColor = (v) => {
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
                            
                            const actBg = getActualStatusColor(actVal);
                            
                            return (
                              <div key={idx} style={{ textAlign: "center", minWidth: "42px" }}>
                                <div style={{ fontSize: "0.6rem", color: "var(--text-secondary-dark)", marginBottom: "0.15rem" }}>{month}</div>
                                <select
                                  className="user-selector"
                                  value={actVal}
                                  onChange={(e) => {
                                    const newPDCAActual = [...inputMonthlyPDCAActual];
                                    newPDCAActual[idx] = e.target.value;
                                    setInputMonthlyPDCAActual(newPDCAActual);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.15rem 0.2rem",
                                    fontSize: "0.65rem",
                                    background: actBg !== "transparent" ? actBg : "#18181b",
                                    color: actBg !== "transparent" ? "white" : "var(--text-secondary-dark)",
                                    border: "1px solid var(--border-color-dark)",
                                    borderRadius: "0.2rem",
                                    fontWeight: actBg !== "transparent" ? "800" : "normal",
                                    outline: "none",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  <option value="" style={{ background: "#18181b", color: "white" }}>-</option>
                                  <option value="P" style={{ background: "#2563eb", color: "white" }}>P</option>
                                  <option value="D" style={{ background: "#10b981", color: "white" }}>D</option>
                                  <option value="C" style={{ background: "#f59e0b", color: "white" }}>C</option>
                                  <option value="A" style={{ background: "#d946ef", color: "white" }}>A</option>
                                  <option value="P/D" style={{ background: "#1e3a8a", color: "#60a5fa" }}>P/D</option>
                                  <option value="D/C" style={{ background: "#064e3b", color: "#34d399" }}>D/C</option>
                                  <option value="C/A" style={{ background: "#78350f", color: "#fbbf24" }}>C/A</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* 비목별 예산 집행액 입력 */}
                      <div style={{ borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.5rem", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>비목별 집행 등록 (백만원 단위)</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                          {inputBudgetCategories
                            .filter(item => item.category && item.category !== "")
                            .map((item, idx) => {
                              const originalIdx = inputBudgetCategories.findIndex(c => c.category === item.category);
                              return (
                                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.2rem", alignItems: "center" }}>
                                  <div style={{
                                    fontSize: "0.7rem",
                                    fontWeight: "700",
                                    color: "var(--text-primary-dark)",
                                    background: "rgba(255,255,255,0.02)",
                                    padding: "0.2rem 0.4rem",
                                    borderRadius: "0.25rem",
                                    border: "1px solid var(--border-color-dark)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }} title={item.category}>
                                    {item.category}
                                  </div>
                                  <input
                                    type="text"
                                    className="user-selector"
                                    placeholder="본집행액"
                                    value={item.spent || "0.0"}
                                    onChange={(e) => {
                                      const newCats = [...inputBudgetCategories];
                                      newCats[originalIdx].spent = e.target.value.replace(/[^0-9.]/g, "");
                                      setInputBudgetCategories(newCats);
                                    }}
                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                                  />
                                  <input
                                    type="text"
                                    className="user-selector"
                                    placeholder="이월집행"
                                    value={selectedYear === 1 ? 0 : item.spent_carry || "0.0"}
                                    disabled={selectedYear === 1}
                                    onChange={(e) => {
                                      if (selectedYear === 1) return;
                                      const newCats = [...inputBudgetCategories];
                                      newCats[originalIdx].spent_carry = e.target.value.replace(/[^0-9.]/g, "");
                                      setInputBudgetCategories(newCats);
                                    }}
                                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem" }}
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* 실적수 입력 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>실제 실적 횟수 (실적 빈도)</span>
                          <input type="text" className="user-selector" placeholder="예: 2" value={inputActualFrequency} onChange={(e) => setInputActualFrequency(e.target.value)} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem", width: "100%" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>계획대비 달성률 (%)</span>
                          <input type="text" className="user-selector" placeholder="예: 100" value={inputAchieveRate} onChange={(e) => setInputAchieveRate(e.target.value)} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem", width: "100%" }} />
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
                        <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#10b981", color: "white" }}>
                          D(수행실적) 저장
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* C 단계: 집행액 제외 성과 실적 입력 */}
                {activePdcaStage === "C" && (isResearcher || currentRole.rank <= 2) && (
                  <form onSubmit={handleUpdateCDetails} style={{ padding: "0.75rem", background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "#f59e0b" }}>C 단계: 운영 성과 실적 입력</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>성과사항 (정성/정량적 성과 서술)</span>
                        <textarea className="user-selector" rows={3} value={inputAchievements} onChange={(e) => setInputAchievements(e.target.value)} placeholder="프로그램 운영을 통해 달성한 주요 성과 사항을 서술해 주세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", width: "140px", color: "var(--text-secondary-dark)" }}>만족도 (점 / 100점):</span>
                        <input type="text" className="user-selector" placeholder="예: 95" value={inputSatisfaction} onChange={(e) => setInputSatisfaction(e.target.value)} style={{ flexGrow: 1 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
                        <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#f59e0b", color: "white" }}>
                          C(성과검증) 저장
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* A 단계: 환류 2분할 자체평가 */}
                {activePdcaStage === "A" && (isResearcher || currentRole.rank <= 2) && (
                  <form onSubmit={handleUpdateA} style={{ padding: "0.75rem", background: "rgba(217,70,239,0.03)", border: "1px solid rgba(217,70,239,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "#d946ef" }}>A 단계: 사업 환류 및 자체평가</h4>
                    
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>자체평가 구분:</span>
                      <label style={{ fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="radio" name="evalType" value="우수" checked={inputEvalType === "우수"} onChange={() => setInputEvalType("우수")} />
                        우수 프로그램
                      </label>
                      <label style={{ fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="radio" name="evalType" value="미흡" checked={inputEvalType === "미흡"} onChange={() => setInputEvalType("미흡")} />
                        미흡 프로그램
                      </label>
                    </div>

                    {inputEvalType === "우수" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>우수한 점</span>
                            <textarea className="user-selector" rows={2} value={inputExcellent} onChange={(e) => setInputExcellent(e.target.value)} placeholder="프로그램 운영 중 창출된 우수한 성과 및 성료 요인을 기록하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>발전방안</span>
                            <textarea className="user-selector" rows={2} value={inputImprovePlan} onChange={(e) => setInputImprovePlan(e.target.value)} placeholder="우수한 성과를 타 프로그램으로 확산하거나 차년도에 더욱 발전시킬 방안을 기입하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>미비점</span>
                            <textarea className="user-selector" rows={2} value={inputDeficiency} onChange={(e) => setInputDeficiency(e.target.value)} placeholder="운영상의 한계, 예산 집행 차질, 혹은 목표 달성 미달의 주원인을 파악하여 입력하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>개선사항</span>
                            <textarea className="user-selector" rows={2} value={inputActionItem} onChange={(e) => setInputActionItem(e.target.value)} placeholder="발견된 미비점을 극복하고 차년도 계획 시 보완 및 구조조정할 대책을 기입하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                      <button type="submit" className="btn-primary" style={{ width: "55%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#d946ef", color: "white" }}>
                        A(환류조치) 저장
                      </button>
                    </div>
                  </form>
                )}

                
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "260px", color: "var(--text-secondary-dark)" }}>
                <PenTool size={32} style={{ marginBottom: "0.75rem" }} />
                <span>좌측 프로그램 목록에서 수정할 프로그램을 선택해 주세요.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 전체 목록 모드 */
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>사업단 전체 프로그램 추진 상태</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginTop: "0.2rem" }}>
              행을 클릭하거나 우측 [정보 등록] 버튼을 눌러 실시간 PDCA 수치 및 집행 실적을 입력하실 수 있습니다.
            </p>
          </div>

          <div className="table-panel" style={{ maxHeight: "350px", overflowY: "auto" }}>
            <table className="custom-table" style={{ fontSize: "0.75rem" }}>
              <thead>
                <tr>
                  <th rowSpan={2}>ID</th>
                  <th rowSpan={2}>프로그램명</th>
                  <th rowSpan={2}>소속 과제</th>
                  <th rowSpan={2}>담당자</th>
                  <th rowSpan={2}>{selectedYear}차년도 본예산 (백만원)</th>
                  <th rowSpan={2}>{selectedYear}차년도 본집행 (백만원)</th>
                  <th colSpan={4} style={{ textAlign: "center" }}>진행 단계(PDCA)</th>
                  <th rowSpan={2} style={{ width: "90px" }}>실적 등록</th>
                </tr>
                <tr>
                  <th style={{ textAlign: "center", width: "50px" }}>P</th>
                  <th style={{ textAlign: "center", width: "50px" }}>D</th>
                  <th style={{ textAlign: "center", width: "50px" }}>C</th>
                  <th style={{ textAlign: "center", width: "50px" }}>A</th>
                </tr>
              </thead>
              <tbody>
                {allFilteredPrograms.map((prog) => {
                  const py = prog.years?.[selectedYear] || {};
                  return (
                    <tr
                      key={prog.id}
                      onClick={() => handleSelectProgram(prog)}
                      style={{
                        background: selectedProgId === prog.id ? "rgba(59,130,246,0.06)" : "inherit",
                        cursor: "pointer"
                      }}
                    >
                      <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                      <td style={{ fontWeight: selectedProgId === prog.id ? "700" : "normal" }}>{prog.title}</td>
                      <td>{prog.unitId}</td>
                      <td style={{ fontWeight: "700", color: "var(--accent-color)" }}>
                        {(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee) || "미배정"}
                      </td>
                      <td style={{ fontFamily: "var(--font-data)" }}>{formatToMillionWon(py.budget_main)}백만원</td>
                      <td style={{ fontFamily: "var(--font-data)" }}>{formatToMillionWon(py.spent_main)}백만원</td>
                      <td style={{ textAlign: "center", color: prog.pdca.p === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.p}</td>
                      <td style={{ textAlign: "center", color: prog.pdca.d === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.d}</td>
                      <td style={{ textAlign: "center", color: prog.pdca.c === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.c}</td>
                      <td style={{ textAlign: "center", color: prog.pdca.a === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.a}</td>
                      <td>
                        <button
                          className="btn-primary"
                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem" }}
                          onClick={(e) => { e.stopPropagation(); handleSelectProgram(prog); }}
                        >
                          정보 등록
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 테이블 하단 상세 편집 블록 (선택 시 동적 출현) */}
          {activeProg && (
            <div style={{ marginTop: "1rem", padding: "1.5rem", border: "1px solid var(--accent-color)", borderRadius: "1rem", background: "rgba(59,130,246,0.03)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", marginBottom: "0.5rem" }}>[{activeProg.id}] {activeProg.title}</h4>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <div>국고 예산: {formatToMillionWon(activeProg.years?.[selectedYear]?.budget_national)}백만원 (집행: {formatToMillionWon(activeProg.years?.[selectedYear]?.spent_national)}백만원)</div>
                  <div>시비 예산: {formatToMillionWon(activeProg.years?.[selectedYear]?.budget_city)}백만원 (집행: {formatToMillionWon(activeProg.years?.[selectedYear]?.spent_city)}백만원)</div>
                  <div>외부 예산: {formatToMillionWon(activeProg.years?.[selectedYear]?.budget_external)}백만원 (집행: {formatToMillionWon(activeProg.years?.[selectedYear]?.spent_external)}백만원)</div>
                </div>

                <h5 style={{ fontSize: "0.8rem", fontWeight: "700", marginTop: "1rem", marginBottom: "0.5rem" }}>PDCA 단계 갱신</h5>
                <div className="pdca-stepper" style={{ marginBottom: "0" }}>
                  {["p", "d", "c", "a"].map((stage) => {
                    const status = activeProg.pdca[stage];
                    const isDone = status === "완료";
                    const isProgress = status === "진행";
                    return (
                      <div key={stage} className={`pdca-step-item ${isDone ? "done" : isProgress ? "in-progress" : ""}`}>
                        <div className="pdca-circle" style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}>{stage.toUpperCase()}</div>
                        <span style={{ fontSize: "0.65rem", fontWeight: "700" }}>
                          {stage === "p" ? "Plan" : stage === "d" ? "Do" : stage === "c" ? "Check" : "Act"}
                        </span>
                        {(isResearcher || currentRole.rank <= 2) && (
                          <select
                            style={{ fontSize: "0.6rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.2" }}
                            value={status}
                            onChange={(e) => handleUpdatePDCA(stage, e.target.value)}
                          >
                            <option value="대기">대기</option>
                            <option value="진행">진행</option>
                            <option value="완료">완료</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--accent-color)" }}>기획 / 성과 / 환류 실무 정보 입력</h5>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>좌측 단위과제별 모드를 활성화하여 더욱 상세한 다변화 재원 및 2분할 환류 폼을 편집하실 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* 프리미엄 토스트 피드백 알림 (화면 정중앙 오버레이 팝업) */}
      {feedbackMsg && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "rgba(18, 18, 23, 0.96)",
            border: "2px solid rgba(16, 185, 129, 0.8)",
            borderRadius: "1rem",
            padding: "2rem 3rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.25)",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: "0.8rem",
            color: "white",
            minWidth: "360px",
            textAlign: "center"
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--success-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.4)",
              marginBottom: "0.2rem"
            }}>
              <Check size={24} strokeWidth={4} />
            </div>
            <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "#34d399", letterSpacing: "-0.03em" }}>설정 완료</span>
            <span style={{ fontSize: "0.92rem", color: "var(--text-secondary-dark)", fontWeight: "600", lineHeight: "1.4" }}>{feedbackMsg}</span>
          </div>
        </div>
      )}
      {/* 신규 프로그램 추가 모달 팝업 */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div className="glass-card" style={{
            width: "480px",
            padding: "1.5rem",
            borderRadius: "1rem",
            border: "1px solid var(--border-color-dark)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "white" }}>신규 프로그램 생성 등록</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary-dark)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProgram} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>프로그램명 *</label>
                <input 
                  type="text" 
                  required 
                  className="user-selector" 
                  placeholder="예: 지산학 네트워크 활성화 포럼 운영" 
                  value={newProgTitle} 
                  onChange={(e) => setNewProgTitle(e.target.value)} 
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem" }} 
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>담당 실무자</label>
                <input 
                  type="text" 
                  className="user-selector" 
                  placeholder="예: 정자윤 연구원 (미입력 시 '미지정')" 
                  value={newProgAssignee} 
                  onChange={(e) => setNewProgAssignee(e.target.value)} 
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>2차년도 배정 본예산 (백만원)</label>
                  <input 
                    type="text" 
                    className="user-selector" 
                    placeholder="예: 15.0" 
                    value={newProgBudget} 
                    onChange={(e) => setNewProgBudget(e.target.value.replace(/[^0-9.]/g, ""))} 
                    style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem" }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>2차년도 이월 예산액 (백만원)</label>
                  <input 
                    type="text" 
                    className="user-selector" 
                    placeholder={selectedYear === 1 ? "1차년도 불가" : "예: 5.0"} 
                    disabled={selectedYear === 1}
                    value={selectedYear === 1 ? "0.0" : newProgCarry} 
                    onChange={(e) => setNewProgCarry(e.target.value.replace(/[^0-9.]/g, ""))} 
                    style={{ 
                      width: "100%", 
                      padding: "0.4rem", 
                      fontSize: "0.8rem",
                      background: selectedYear === 1 ? "rgba(255,255,255,0.02)" : "#18181b",
                      color: selectedYear === 1 ? "rgba(255,255,255,0.2)" : "white",
                      cursor: selectedYear === 1 ? "not-allowed" : "text"
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", color: "white" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 2, justifyContent: "center", background: "var(--accent-color)" }}
                >
                  프로그램 등록 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes centerToastPop {
          from { transform: translate(-50%, -40%) scale(0.85); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
