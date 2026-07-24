import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { ClipboardList, PenTool, FileSpreadsheet, FileText, Download } from "lucide-react";
import type { LegacyPdcaRecord } from "../features/pdca/utils/pdca-utils";
import {
  formatToMillionWon,
  getErrorDetails,
  getRequesterRoleName,
  parseDecimalFromCommas,
  parseTimelineDates,
  parseTimelineToMonths,
} from "../features/pdca/utils/pdca-utils";
import { PdcaFeedbackToast } from "../features/pdca/components/pdca-feedback-toast";
import { PdcaViewHeader } from "../features/pdca/components/pdca-view-header";
import { PdcaAllProgramsView } from "../features/pdca/components/pdca-all-programs-view";
import { PdcaUnitExplorer } from "../features/pdca/components/pdca-unit-explorer";
import { PdcaCheckStage } from "../features/pdca/components/pdca-check-stage";
import { PdcaActStage } from "../features/pdca/components/pdca-act-stage";
import { PdcaPlanStage } from "../features/pdca/components/pdca-plan-stage";
import { PdcaDoStage } from "../features/pdca/components/pdca-do-stage";
import { exportPdcaProgramMarkdown, exportPdcaProgramPdf } from "../features/pdca/services/pdca-export-service";

/**
 * PDCAManager Component
 * 프로그램별 PDCA(Plan-Do-Check-Act) 단계 관리, 기획수립(Timeline, 대상, 부서),
 * 다변화 재원(국고, 시비, 외부사업비) 예산/집행 입력 및 A단계 2분할 환류 방안 검증을 담당합니다.
 */
export interface PDCAManagerProps {
  projects?: any[];
  currentRole?: any;
  onUpdateProgramDetails?: (unitId: string, programId: string, details: any) => void;
  onAddProgram?: (unitId: string, title: string, assignee: string, budget2026: string | number, carryBudget: string | number) => void;
  selectedYear?: number;
  selectedUnitId?: string;
  setSelectedUnitId?: (unitId: string) => void;
  selectedProgId?: string | null;
  setSelectedProgId?: (progId: string | null) => void;
  viewMode?: string;
  setViewMode?: (mode: string) => void;
  currentUser?: any;
  supabase?: any;
  darkMode?: boolean;
}

export default function PDCAManager({
  projects = [],
  currentRole = {},
  onUpdateProgramDetails = () => undefined,
  onAddProgram: _onAddProgram = () => undefined,
  selectedYear = 1,
  selectedUnitId = "",
  setSelectedUnitId = () => undefined,
  selectedProgId = "",
  setSelectedProgId = () => undefined,
  viewMode = "unit",
  setViewMode = () => undefined,
  currentUser = {},
  supabase
}: PDCAManagerProps) {
  const yearIndex = Number(selectedYear || 1);
  const startYrShort = String(2024 + yearIndex).slice(-2);
  const endYrShort = String(2025 + yearIndex).slice(-2);
  const monthsList = [
    `${startYrShort}.3월`, "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
    `${endYrShort}.1월`, "2월"
  ];

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // 💡 [실시간 엑셀 집행 데이터 동적 연동]
  // localStorage에 적재된 집행 내역을 읽어와 프로그램 ID 및 비목별로 실시간 자동 분류/합계 연산합니다.
  const cachedExecs: LegacyPdcaRecord[] = (() => {
    try {
      const data = localStorage.getItem(`budget_exec_records_${selectedYear}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("PDCA 실시간 집행 데이터 로드 오류:", e);
      return [];
    }
  })();

  const getExcelSpentAmount = (progId: string, categoryName: string, budgetType: string) => {
    if (!progId || !categoryName) return 0;
    
    // 점 문자 및 공백 제거로 데이터 인코딩 충돌을 완벽 차단
    const normCategory = categoryName.replace(/\s/g, "").replace(/[·∙•ㆍ]/g, "");
    
    return cachedExecs
      .filter((r: LegacyPdcaRecord) => {
        const matchesProg = (r.program_id || "").trim() === progId.trim();
        const normRecordCategory = (r.expense_category || "").replace(/\s/g, "").replace(/[·∙•ㆍ]/g, "");
        const matchesCategory = normRecordCategory === normCategory;
        const matchesType = r.budget_type === budgetType;
        return matchesProg && matchesCategory && matchesType;
      })
      .reduce((sum: number, r: LegacyPdcaRecord) => sum + (Number(r.amount) || 0), 0);
  };


  // P 단계 기획 및 재원 배정용 상태 (본예산 및 이월예산 구분)
  const [inputTimeline, setInputTimeline] = useState("");
  const [_inputStartDate, setInputStartDate] = useState("");
  const [_inputEndDate, setInputEndDate] = useState("");
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
  const [_inputBudgetCarryExternal, setInputBudgetCarryExternal] = useState("");

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

  // D 단계 참여대상별 실제 참석 인원 실적용 상태 (재학생, 성인학습자, 재직자, 기타)
  const [inputAudienceParticipants, setInputAudienceParticipants] = useState<Record<string, string>>({
    "재학생": "",
    "성인학습자": "",
    "재직자": "",
    "기타": ""
  });

  // 참여대상별 인원 기입 시 참석인원 실적 상태에 자동 합산 연동하는 핸들러
  const handleAudienceParticipantChange = (audienceType: string, value: string, activeAudienceList: string[]) => {
    const cleanVal = value.replace(/[^0-9]/g, "");
    const updated = {
      ...inputAudienceParticipants,
      [audienceType]: cleanVal
    };
    setInputAudienceParticipants(updated);

    let total = 0;
    if (activeAudienceList && activeAudienceList.length > 0) {
      activeAudienceList.forEach((aud: string) => {
        const val = parseInt(updated[aud], 10) || 0;
        total += val;
      });
    }

    setInputParticipants(String(total));
  };

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
  const [inputTargetParticipantsUnit, setInputTargetParticipantsUnit] = useState("");
  const [inputTargetDevelopmentsUnit, setInputTargetDevelopmentsUnit] = useState("");
  const [inputTargetEtcUnit, setInputTargetEtcUnit] = useState("");
  const [inputTargetParticipantsName, setInputTargetParticipantsName] = useState("");
  const [inputTargetDevelopmentsName, setInputTargetDevelopmentsName] = useState("");
  const [inputTargetEtcName, setInputTargetEtcName] = useState("");
  const [inputKpiTypes, setInputKpiTypes] = useState(["자율"]);
  const [inputKpiLinks, setInputKpiLinks] = useState([""]);
  const [inputKpiTargets, setInputKpiTargets] = useState<Record<string, number | string>>({});
  const [inputKpiActuals, setInputKpiActuals] = useState<Record<string, number | string>>({});
  const [_inputActualFrequency, setInputActualFrequency] = useState("");
  const [inputAchieveRate, setInputAchieveRate] = useState("");

  // D단계 세부 실제 실적 수치 상태
  const [inputActualDevelopments, setInputActualDevelopments] = useState("");
  const [inputActualEtc, setInputActualEtc] = useState("");

  // 현재 뷰포트에서 보여줄 PDCA 단계 선택 (localStorage 세션 연동)
  const [activePdcaStage, setActivePdcaStage] = useState(() => {
    return localStorage.getItem("anchor_active_pdca_stage") || "P";
  });

  useEffect(() => {
    localStorage.setItem("anchor_active_pdca_stage", activePdcaStage);
  }, [activePdcaStage]);

  // 프로그램별 변경 버전 차수 리스트 관리 및 선택 상태
  const [programVersions, setProgramVersions] = useState<LegacyPdcaRecord[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("current");

  // 활성 프로그램 변경 시 Supabase로부터 변경이력(결재완료/대기 목록) 조회
  useEffect(() => {
    if (activeProg && supabase) {
      supabase
        .from("program_version_requests")
        .select("*")
        .eq("program_id", activeProg.id)
        .order("requested_at", { ascending: true })
        .then(({ data, error: _error }: { data: LegacyPdcaRecord[] | null; error: unknown }) => {
          if (data) {
            setProgramVersions(data);
          } else {
            setProgramVersions([]);
          }
        });
      setSelectedVersionId("current");
    } else {
      setProgramVersions([]);
      setSelectedVersionId("current");
    }
  // oxlint-disable-next-line react/exhaustive-deps -- program selection, year, and client identity intentionally own version-history loading; the derived active program is not a separate trigger.
  }, [selectedProgId, selectedYear, supabase]);

  // 모든 프로그램 수집
  const allPrograms: LegacyPdcaRecord[] = [];
  const allUnits: LegacyPdcaRecord[] = [];
  projects.forEach((p: LegacyPdcaRecord) => {
    if (p.units && Array.isArray(p.units)) {
      p.units.forEach((u: LegacyPdcaRecord) => {
        allUnits.push(u);
        if (u.programs && Array.isArray(u.programs)) {
          u.programs.forEach((prog: LegacyPdcaRecord) => {
            allPrograms.push({
              ...prog,
              unitId: u.id,
              unitTitle: u.title,
              projectTitle: p.title,
            });
          });
        }
      });
    }
  });
  allUnits.sort((a, b) => {
    if (a.id === "Common" || a.id === "X0") return 1;
    if (b.id === "Common" || b.id === "X0") return -1;
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

  // 💡 [연도별 인스턴스 정밀 매칭] 1차년도/2차년도 이후 프로그램 간 ID 중복 시 현재 선택된 연도(selectedYear) 정보가 있는 인스턴스를 우선 매칭합니다.
  // 💡 [연도별 인스턴스 정밀 매칭] 1차년도/2차년도 이후 프로그램 간 ID 중복 시 현재 선택된 연도(selectedYear) 정보가 있는 인스턴스를 우선 매칭합니다.
  const activeProg = allPrograms.find((p) => p.id === selectedProgId && p.years && p.years[selectedYear]) || allPrograms.find((p) => p.id === selectedProgId);

  // 💡 [실시간 예산 집행률 달성률 자동 연산 가드]
  // P단계 기획 예산 총합(분모) 대비 D단계 실제 엑셀 집행 실적 총합(분자)의 백분율을 자동 연산합니다.
  React.useEffect(() => {
    if (!activeProg) return;

    const py = activeProg.years?.[selectedYear] || {};
    
    // 1. P단계 전체 배정 예산 (국고 + 시비 + 외부사업비 + 이월예산들)
    const bNational = Number(py.national_national || py.budget_national || 0);
    const bCity = Number(py.national_city || py.budget_city || 0);
    const bExternal = Number(py.national_external || py.budget_external || 0);
    const bCarryNational = Number(py.budget_carry_national || 0);
    const bCarryCity = Number(py.budget_carry_city || 0);
    const bCarryExternal = Number(py.budget_carry_external || 0);
    
    const totalPlannedBudget = bNational + bCity + bExternal + bCarryNational + bCarryCity + bCarryExternal;

    // 2. D단계 실제 엑셀 누적 집행 총합 (비목별 spent + spent_carry)
    let totalSpent = 0;
    const rawCategories = py.budget_categories || [];
    rawCategories.forEach((c: LegacyPdcaRecord) => {
      if (c.category) {
        const spentMain = getExcelSpentAmount(activeProg.id, c.category, "main");
        const spentCarry = selectedYear === 1 ? 0 : getExcelSpentAmount(activeProg.id, c.category, "carryover");
        totalSpent += (spentMain + spentCarry);
      }
    });

    // 3. 달성률 계산 (소수점 없이 반올림 정수, 100% 한도 적용)
    const rate = totalPlannedBudget > 0 ? Math.min(100, Math.round((totalSpent / totalPlannedBudget) * 100)) : 0;
    setInputAchieveRate(String(rate));
  // oxlint-disable-next-line react/exhaustive-deps -- getExcelSpentAmount reads cachedExecs, which is already the explicit recalculation input.
  }, [activeProg, selectedYear, cachedExecs]);

  // selectedProgId, selectedYear, selectedVersionId가 바뀔 때 모든 기획/환류/재원 상태 로드
  React.useEffect(() => {
    if (selectedProgId) {
      // 💡 [연도별 인스턴스 정밀 매칭] 현재 선택된 연도(selectedYear) 정보가 활성화된 인스턴스를 우선 매칭하여 바인딩합니다.
      const prog = allPrograms.find((p) => p.id === selectedProgId && p.years && p.years[selectedYear]) || allPrograms.find((p) => p.id === selectedProgId);
      if (prog) {
        let dataSrc = prog;
        let py = prog.years?.[selectedYear] || {};

        if (selectedVersionId !== "current") {
          const verObj = programVersions.find(v => v.id === Number(selectedVersionId));
          if (verObj && verObj.changes && verObj.changes.after) {
            dataSrc = verObj.changes.after;
            py = verObj.changes.after.years?.[selectedYear] || {};
          }
        }

        setInputTimeline(dataSrc.timeline || "");

        const { start, end } = parseTimelineDates(dataSrc.timeline || "");
        setInputStartDate(start);
        setInputEndDate(end);

        setInputTargetAudience(dataSrc.targetAudience || "");
        const coopParts = (dataSrc.coopDept || "").split(",").map((s: string) => s.trim());
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
        const rawCategories = py.budget_categories || [];
        const validCategories = rawCategories.filter((c: LegacyPdcaRecord) => {
          const b = parseDecimalFromCommas(c.budget);
          const bc = parseDecimalFromCommas(c.budget_carry);
          const s = parseDecimalFromCommas(c.spent);
          const sc = parseDecimalFromCommas(c.spent_carry);
          
          // 엑셀 집행 실적도 유효성 판단에 포함
          const realSpentMain = getExcelSpentAmount(prog.id, c.category, "main");
          const realSpentCarry = selectedYear === 1 ? 0 : getExcelSpentAmount(prog.id, c.category, "carryover");

          return b > 0 || bc > 0 || s > 0 || sc > 0 || realSpentMain > 0 || realSpentCarry > 0;
        });

        const loadedCategories = validCategories.map((c: LegacyPdcaRecord) => {
          const b = parseDecimalFromCommas(c.budget);
          const bc = parseDecimalFromCommas(c.budget_carry);
          
          // 💡 [수동 입력 배제 및 실시간 엑셀 집행 연동]
          // c.spent / c.spent_carry의 수동 기재값 대신, 엑셀 정산 파일의 누적 실적을 가져와 꽂아줍니다.
          const realSpentMain = getExcelSpentAmount(prog.id, c.category, "main");
          const realSpentCarry = selectedYear === 1 ? 0 : getExcelSpentAmount(prog.id, c.category, "carryover");

          return {
            category: c.category || "",
            budget: b > 0 ? (b / 1000000).toFixed(1) : "",
            budget_carry: selectedYear === 1 ? "0.0" : (bc > 0 ? (bc / 1000000).toFixed(1) : ""),
            spent: realSpentMain.toLocaleString(),
            spent_carry: realSpentCarry.toLocaleString()
          };
        });

        while (loadedCategories.length < 4) {
          loadedCategories.push({ category: "", budget: "", budget_carry: "", spent: "0", spent_carry: "0" });
        }
        if (loadedCategories.length > 4) {
          loadedCategories.length = 4;
        }
        setInputBudgetCategories(loadedCategories);

        // 월별 PDCA일정 바인딩
        setInputMonthlyPDCA(parseTimelineToMonths(dataSrc.timeline || ""));
        setInputMonthlyPDCAActual(parseTimelineToMonths(dataSrc.actual_timeline || ""));

        // 💡 [비목별 집행등록 값의 합산으로 재원별 본집행 실적 자동 연산 표시]
        const totalCategorySpentMain = loadedCategories.reduce((sum: number, c: LegacyPdcaRecord) => {
          return sum + (parseDecimalFromCommas(c.spent) || 0);
        }, 0);

        let sNational = 0;
        let sCity = 0;
        let sExternal = 0;

        let remainingSpent = totalCategorySpentMain;
        const limitNational = Math.round((py.budget_national || 0) + (py.budget_carry_national || 0));
        const limitCity = Math.round((py.budget_city || 0) + (py.budget_carry_city || 0));
        const limitExternal = Math.round((py.budget_external || 0) + (py.budget_carry_external || 0));

        sNational = Math.min(remainingSpent, limitNational);
        remainingSpent -= sNational;

        if (remainingSpent > 0) {
          sCity = Math.min(remainingSpent, limitCity);
          remainingSpent -= sCity;
        }

        if (remainingSpent > 0) {
          sExternal = Math.min(remainingSpent, limitExternal);
          remainingSpent -= sExternal;
        }

        if (remainingSpent > 0) {
          sNational += remainingSpent;
        }

        setInputSpentNational((sNational / 1000000).toFixed(1));
        setInputSpentCity((sCity / 1000000).toFixed(1));
        setInputSpentExternal((sExternal / 1000000).toFixed(1));

        setInputParticipants(String(dataSrc.participants ?? 0));
        const audiencePartMap = dataSrc.actual_audience_participants || {};
        setInputAudienceParticipants({
          "재학생": audiencePartMap["재학생"] !== undefined ? String(audiencePartMap["재학생"]) : "",
          "성인학습자": audiencePartMap["성인학습자"] !== undefined ? String(audiencePartMap["성인학습자"]) : "",
          "재직자": audiencePartMap["재직자"] !== undefined ? String(audiencePartMap["재직자"]) : "",
          "기타": audiencePartMap["기타"] !== undefined ? String(audiencePartMap["기타"]) : ""
        });
        setInputActualDevelopments(dataSrc.actual_developments !== undefined ? String(dataSrc.actual_developments) : "");
        setInputActualEtc(dataSrc.actual_etc !== undefined ? String(dataSrc.actual_etc) : "");
        setInputSatisfaction(String(dataSrc.satisfaction ?? 0));
        setInputAchievements(dataSrc.achievements || "");

        setInputEvalType(dataSrc.evalType || "우수");
        setInputExcellent(dataSrc.excellent || "");
        setInputImprovePlan(dataSrc.improvePlan || "");
        setInputDeficiency(dataSrc.deficiency || "");
        setInputActionItem(dataSrc.actionItem || "");

        setInputFrequency(dataSrc.frequency !== undefined && dataSrc.frequency !== 0 ? String(dataSrc.frequency) : "");
        setInputTargetParticipants(dataSrc.target_participants !== undefined && dataSrc.target_participants !== 0 ? String(dataSrc.target_participants) : "");
        setInputTargetDevelopments(dataSrc.target_developments !== undefined && dataSrc.target_developments !== 0 ? String(dataSrc.target_developments) : "");
        setInputTargetEtc(dataSrc.target_etc !== undefined && dataSrc.target_etc !== 0 ? String(dataSrc.target_etc) : "");
        setInputTargetParticipantsUnit(dataSrc.target_participants_unit || "");
        setInputTargetDevelopmentsUnit(dataSrc.target_developments_unit || "");
        setInputTargetEtcUnit(dataSrc.target_etc_unit || "");
        setInputTargetParticipantsName(dataSrc.target_participants_name || "");
        setInputTargetDevelopmentsName(dataSrc.target_developments_name || "");
        // 다중 KPI 링크 바인딩 (하위 호환성 가드 탑재)
        let loadedKpiLinks = [""];
        let loadedKpiTypes = ["자율"];

        if (Array.isArray(dataSrc.kpi_links) && dataSrc.kpi_links.length > 0) {
          loadedKpiLinks = [...dataSrc.kpi_links];
          loadedKpiTypes = Array.isArray(dataSrc.kpi_types) ? [...dataSrc.kpi_types] : dataSrc.kpi_links.map(() => dataSrc.kpi_type || "자율");
        } else if (dataSrc.kpi_link) {
          loadedKpiLinks = [dataSrc.kpi_link];
          loadedKpiTypes = [dataSrc.kpi_type || "자율"];
        }

        setInputKpiLinks(loadedKpiLinks);
        setInputKpiTypes(loadedKpiTypes);
        setInputKpiTargets(dataSrc.kpi_targets || {});
        setInputKpiActuals(dataSrc.kpi_actuals || {});
        setInputActualFrequency(dataSrc.actualFrequency !== undefined ? String(dataSrc.actualFrequency) : "");
        setInputAchieveRate(dataSrc.achieveRate !== undefined ? String(dataSrc.achieveRate) : "");
      }
    } else {
      setInputKpiLinks([""]);
      setInputKpiTypes(["자율"]);
      setInputKpiTargets({});
      setInputKpiActuals({});
      setInputTargetParticipantsUnit("");
      setInputTargetDevelopmentsUnit("");
      setInputTargetEtcUnit("");
      setInputTargetParticipantsName("");
      setInputTargetDevelopmentsName("");
      setInputTargetEtcName("");
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
      setInputAudienceParticipants({
        "재학생": "",
        "성인학습자": "",
        "재직자": "",
        "기타": ""
      });
      setInputActualDevelopments("");
      setInputActualEtc("");
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
  // oxlint-disable-next-line react/exhaustive-deps -- these source selections own form rebinding; render-local program collections and lookup helpers must not reset edits on every render.
  }, [selectedProgId, selectedYear, selectedVersionId, programVersions]);

  // 추진일정 변경 이벤트 핸들러 (기존 호환 유지)
  const _handleTimelineChange = (start: string, end: string) => {
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
  const handleSelectProgram = (prog: LegacyPdcaRecord) => {
    setSelectedProgId(prog.id);
    setFeedbackMsg("");
  };

  // P단계 완료 조건 판정 공통 함수
  const checkPStageCompletion = (
    prog: LegacyPdcaRecord,
    py: LegacyPdcaRecord,
    draftData: LegacyPdcaRecord = {}
  ) => {
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
    const hasValidCategory = categories.some((c: LegacyPdcaRecord) => c.category && c.category !== "" && c.category !== "선택 안 함" && ((parseFloat(c.budget) || 0) > 0 || (parseFloat(c.budget_carry) || 0) > 0));
    if (!hasValidCategory) return { ok: false, reason: "비목별 예산 배정이 최소 하나 이상 등록되고 배정 금액이 0원 초과여야 합니다." };

    // 3. 월별 추진일정: P, D, C, A가 모두 반영되어야 OK
    const timelineStr = draftData.timeline !== undefined ? draftData.timeline : (prog.timeline || "");
    const timelineList = timelineStr.split(",").map((t: string) => t.trim().toUpperCase());
    const hasP = timelineList.some((t: string) => t.includes("P"));
    const hasD = timelineList.some((t: string) => t.includes("D"));
    const hasC = timelineList.some((t: string) => t.includes("C"));
    const hasA = timelineList.some((t: string) => t.includes("A"));
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

  // D단계 완료 조건 판정 공통 함수
  const checkDStageCompletion = (
    prog: LegacyPdcaRecord,
    py: LegacyPdcaRecord,
    draftData: LegacyPdcaRecord = {}
  ) => {
    // 1. 실제 추진일정 검증: P, D, C, A 모든 단계가 최소 한 개 이상 반영되어야 OK
    const actualTimelineStr = draftData.actual_timeline !== undefined ? draftData.actual_timeline : (prog.actual_timeline || "");
    const actualTimelineList = actualTimelineStr.split(",").map((t: string) => t.trim().toUpperCase());
    const hasActP = actualTimelineList.some((t: string) => t.includes("P"));
    const hasActD = actualTimelineList.some((t: string) => t.includes("D"));
    const hasActC = actualTimelineList.some((t: string) => t.includes("C"));
    const hasActA = actualTimelineList.some((t: string) => t.includes("A"));
    if (!hasActP || !hasActD || !hasActC || !hasActA) {
      return { ok: false, reason: "실제 추진일정에 P, D, C, A가 각각 최소 1회 이상 모두 반영되어야 합니다." };
    }

    // 2. 비목별 집행 내역 검증: 1개 이상 입력 (spent 또는 spent_carry > 0)
    const categories = draftData.budget_categories !== undefined ? draftData.budget_categories : (py.budget_categories || []);
    const hasValidSpentCategory = categories.some((c: LegacyPdcaRecord) => c.category && c.category !== "" && c.category !== "선택 안 함" && ((parseFloat(c.spent) || 0) > 0 || (parseFloat(c.spent_carry) || 0) > 0));
    if (!hasValidSpentCategory) {
      return { ok: false, reason: "비목별 집행 내역이 최소 하나 이상 등록되고 집행액이 0원 초과여야 합니다." };
    }

    // 3. 실제 실적 검증: 실제 실적이 1개 이상 입력되어야 OK (participants, actual_developments, actual_etc 중 하나라도 > 0)
    const actParticipants = draftData.participants !== undefined ? draftData.participants : (prog.participants || 0);
    const actDevelopments = draftData.actual_developments !== undefined ? draftData.actual_developments : (prog.actual_developments || 0);
    const actEtc = draftData.actual_etc !== undefined ? draftData.actual_etc : (prog.actual_etc || 0);
    const hasActualPerformance = actParticipants > 0 || actDevelopments > 0 || actEtc > 0;
    if (!hasActualPerformance) {
      return { ok: false, reason: "실제 실적(참여인원, 개발수, 기타 실적 등)이 최소 1개 이상 입력되어야 합니다." };
    }

    return { ok: true };
  };

  // C단계 완료 조건 판정 공통 함수
  const checkCStageCompletion = (
    prog: LegacyPdcaRecord,
    _py: LegacyPdcaRecord,
    draftData: LegacyPdcaRecord = {}
  ) => {
    // 1. 이전 단계인 D가 완료여야 함
    const currentDPdca = prog.pdca?.d || "대기";
    if (currentDPdca !== "완료") {
      return { ok: false, reason: "D(Do) 단계가 아직 완료되지 않았습니다." };
    }

    // 2. 성과사항 및 만족도 입력 검증
    const ach = draftData.achievements !== undefined ? draftData.achievements : (prog.achievements || "");
    const sat = draftData.satisfaction !== undefined ? parseFloat(draftData.satisfaction) : (parseFloat(prog.satisfaction) || 0);

    if (!ach.trim()) {
      return { ok: false, reason: "성과사항이 빈칸 없이 서술되어야 합니다." };
    }
    if (sat <= 0) {
      return { ok: false, reason: "수요자 만족도가 0점 초과여야 합니다." };
    }
    return { ok: true };
  };

  // A단계 완료 조건 판정 공통 함수
  const checkAStageCompletion = (
    prog: LegacyPdcaRecord,
    _py: LegacyPdcaRecord,
    draftData: LegacyPdcaRecord = {}
  ) => {
    // 1. 이전 단계인 C가 완료여야 함
    const currentCPdca = prog.pdca?.c || "대기";
    if (currentCPdca !== "완료") {
      return { ok: false, reason: "C(Check) 단계가 아직 완료되지 않았습니다." };
    }

    // 2. 자체평가 구분에 따른 환류 서술 입력 검증
    const type = draftData.evalType !== undefined ? draftData.evalType : (prog.evalType || "우수");
    if (type === "우수") {
      const good = draftData.excellent !== undefined ? draftData.excellent : (prog.excellent || "");
      const dev = draftData.improvePlan !== undefined ? draftData.improvePlan : (prog.improvePlan || "");
      if (!good.trim() || !dev.trim()) {
        return { ok: false, reason: "우수한 점 및 발전방안이 기재되어야 합니다." };
      }
    } else {
      const bad = draftData.deficiency !== undefined ? draftData.deficiency : (prog.deficiency || "");
      const imp = draftData.actionItem !== undefined ? draftData.actionItem : (prog.actionItem || "");
      if (!bad.trim() || !imp.trim()) {
        return { ok: false, reason: "미비점 및 개선사항이 기재되어야 합니다." };
      }
    }
    return { ok: true };
  };

  // PDCA 단계 완료 조건 검증 및 강제 롤백 방어
  const handleUpdatePDCA = (stage: string, status: string) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (!activeProg) return;

    const py = activeProg.years?.[selectedYear] || {};
    const currentP = activeProg.pdca?.p || "대기";
    const currentD = activeProg.pdca?.d || "대기";
    const currentC = activeProg.pdca?.c || "대기";
    const _currentA = activeProg.pdca?.a || "대기";

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
        const compD = checkDStageCompletion(activeProg, py);
        if (!compD.ok) {
          alert(`[검증 실패] D(Do) 단계를 완료할 수 없습니다.\n- 원인: ${compD.reason}`);
          return;
        }
      } else if (stage === "c") {
        const compC = checkCStageCompletion(activeProg, py);
        if (!compC.ok) {
          alert(`[검증 실패] C(Check) 단계를 완료할 수 없습니다.\n- 원인: ${compC.reason}`);
          return;
        }
      } else if (stage === "a") {
        const compA = checkAStageCompletion(activeProg, py);
        if (!compA.ok) {
          alert(`[검증 실패] A(Act) 단계를 완료할 수 없습니다.\n- 원인: ${compA.reason}`);
          return;
        }
      }
    }

    // 의존성 롤백 제어: 특정 단계를 완료에서 해제하는 경우, 하위 단계들도 연쇄 롤백시킴
    const newPdca = { ...activeProg.pdca, [stage]: status };

    if (status !== "완료") {
      if (stage === "p") {
        newPdca.d = "진행";
        newPdca.c = "대기";
        newPdca.a = "대기";
      } else if (stage === "d") {
        newPdca.c = "대기";
        newPdca.a = "대기";
      } else if (stage === "c") {
        newPdca.a = "대기";
      }
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      pdca: newPdca
    });

    setFeedbackMsg(`${stage.toUpperCase()} 단계 상태가 '${status}'(으)로 갱신되었습니다.`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // P 단계 기획 정보 및 세부 재원 예산 등록
  const handleUpdatePDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
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

    // 1) 월별 추진 일정 유효성 체크 (P, D, C, A 모두 1회 이상 반영 의무, C/A 등 부분 매칭 허용)
    const timelineCombinedStr = inputMonthlyPDCA.join(",").toUpperCase();
    const hasP = timelineCombinedStr.includes("P");
    const hasD = timelineCombinedStr.includes("D");
    const hasC = timelineCombinedStr.includes("C");
    const hasA = timelineCombinedStr.includes("A");
    if (!hasP || !hasD || !hasC || !hasA) {
      alert("월별 추진 일정에는 반드시 P(Plan), D(Do), C(Check), A(Action) 단계가 최소 1회 이상 모두 포함되도록 일정을 계획하셔야 합니다.");
      return;
    }

    // 최신 임시 데이터들을 취합하여 P단계의 자동 완료/진행 판정
    const freqVal = inputTargetParticipants !== "" ? parseInt(inputTargetParticipants, 10) : 0;
    const tPartVal = inputTargetParticipants !== "" ? parseInt(inputTargetParticipants, 10) : 0;
    const tDevVal = inputTargetDevelopments !== "" ? parseInt(inputTargetDevelopments, 10) : 0;
    const tEtcVal = inputTargetEtc !== "" ? parseInt(inputTargetEtc, 10) : 0;

    // 2) 실적 목표치 유효성 체크 (참여인원, 개발건수, 기타 목표 중 최소 1개는 양수 입력)
    if (tPartVal <= 0 && tDevVal <= 0 && tEtcVal <= 0) {
      alert("실적 목표치(참여인원, 개발건수, 기타 목표) 중 최소 1개 항목은 반드시 입력되어야 합니다.");
      return;
    }

    // 3) 참여대상 필수 검사
    if (!inputTargetAudience || inputTargetAudience.trim() === "" || inputTargetAudience.trim() === "미입력") {
      alert("참여대상은 필수 입력 사항입니다.");
      return;
    }

    // 비목별 예산 및 집행 데이터 조립 및 복원 (본예산/이월예산 및 집행액 구분)
    const categoriesToSave = inputBudgetCategories
      .filter((c) => c.category && c.category !== "" && c.category !== "선택 안 함")
      .map((c) => ({
        category: c.category,
        budget: Math.round(parseDecimalFromCommas(c.budget || "0") * 1000000),
        budget_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.budget_carry || "0") * 1000000),
        spent: Math.round(parseDecimalFromCommas(c.spent || "0.0") * 1000000),
        spent_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.spent_carry || "0.0") * 1000000)
      }));

    // 재원별 총합 vs 비목별 총합 정합성 검증
    const totalResourceBudget = bNational + bCity + bExternal;
    const totalCategoryBudget = categoriesToSave.reduce((sum, c) => sum + (c.budget || 0), 0);

    if (totalResourceBudget !== totalCategoryBudget) {
      alert(`[예산 불일치]\n\n재원별 본예산 총합(${(totalResourceBudget / 1000000).toFixed(2)} 백만원)과\n비목별 본예산 총합(${(totalCategoryBudget / 1000000).toFixed(2)} 백만원)이 일치하지 않습니다.\n\n수치를 다시 확인하여 균등하게 배정해 주세요.`);
      return;
    }

    if (selectedYear !== 1) {
      const totalResourceBudgetCarry = bCarryNational + bCarryCity + bCarryExternal;
      const totalCategoryBudgetCarry = categoriesToSave.reduce((sum, c) => sum + (c.budget_carry || 0), 0);

      if (totalResourceBudgetCarry !== totalCategoryBudgetCarry) {
        alert(`[예산 불일치]\n\n재원별 이월예산 총합(${(totalResourceBudgetCarry / 1000000).toFixed(2)} 백만원)과\n비목별 이월예산 총합(${(totalCategoryBudgetCarry / 1000000).toFixed(2)} 백만원)이 일치하지 않습니다.\n\n이월예산 수치를 다시 확인해 주세요.`);
        return;
      }
    }

    const draftData = {
      budget_national: bNational,
      budget_city: bCity,
      budget_external: bExternal,
      budget_carry_national: bCarryNational,
      budget_carry_city: bCarryCity,
      budget_carry_external: bCarryExternal,
      budget_categories: categoriesToSave,
      timeline: inputMonthlyPDCA.join(","),
      kpi_type: inputKpiTypes[0] || "자율",
      kpi_link: inputKpiLinks[0] || "",
      kpi_types: inputKpiTypes,
      kpi_links: inputKpiLinks,
      kpi_targets: inputKpiTargets,
      frequency: freqVal,
      target_participants: tPartVal,
      target_developments: tDevVal,
      target_etc: tEtcVal,
      targetAudience: inputTargetAudience
    };

    const comp = checkPStageCompletion(activeProg, activeProg.years?.[selectedYear] || {}, draftData);
    const autoPState = comp.ok ? "완료" : "진행";

    const combinedCoopDept = [inputCoopDept1, inputCoopDept2].filter(Boolean).join(", ");

    const afterData = {
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
      kpi_type: inputKpiTypes[0] || "자율",
      kpi_link: inputKpiLinks[0] || "",
      kpi_types: inputKpiTypes,
      kpi_links: inputKpiLinks,
      kpi_targets: inputKpiTargets,
      years: {
        [selectedYear]: {
          budget_national: bNational,
          budget_city: bCity,
          budget_external: bExternal,
          budget_carry_national: bCarryNational,
          budget_carry_city: bCarryCity,
          budget_carry_external: bCarryExternal,
          budget_categories: categoriesToSave
        }
      }
    };

    // 승인권자 권한 검사
    const approverNames = ["심현미", "김현수", "송경영"];
    const isApprover = currentUser && approverNames.some(name => (currentUser.name || "").includes(name));

    if (isApprover) {
      onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
        ...afterData,
        budget_national: bNational,
        budget_city: bCity,
        budget_external: bExternal,
        budget_carry_national: bCarryNational,
        budget_carry_city: bCarryCity,
        budget_carry_external: bCarryExternal,
        budget_categories: categoriesToSave
      });

      // 💡 [교육용 한글 주석] 송경영 단장 직접 수정 시, 변경 이력(승인완료 상태) DB 즉시 적재 (차수는 변경시키지 않고 기록)
      // 로그인 세션 이름이 "송경영 단장" 등으로 표기되는 경우에도 안전하게 우회하도록 includes 검사 방식을 적용합니다.
      if (currentUser && (currentUser.name || "").includes("송경영")) {
        try {
          if (supabase) {
            const beforeData = {
              pdca: activeProg.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" },
              timeline: activeProg.timeline || "",
              targetAudience: activeProg.targetAudience || "",
              coopDept: activeProg.coopDept || "",
              target_participants: activeProg.target_participants || 0,
              target_developments: activeProg.target_developments || 0,
              target_etc: activeProg.target_etc || 0,
              target_participants_unit: activeProg.target_participants_unit || "명",
              target_developments_unit: activeProg.target_developments_unit || "건",
              target_etc_unit: activeProg.target_etc_unit || "개",
              target_participants_name: activeProg.target_participants_name || "참여인원",
              target_developments_name: activeProg.target_developments_name || "개발건수",
              target_etc_name: activeProg.target_etc_name || "기타",
              kpi_type: activeProg.kpi_type || "자율",
              kpi_link: activeProg.kpi_link || "",
              kpi_types: activeProg.kpi_types || [],
              kpi_links: activeProg.kpi_links || [],
              kpi_targets: activeProg.kpi_targets || {},
              years: {
                [selectedYear]: {
                  budget_national: activeProg.years?.[selectedYear]?.budget_national || 0,
                  budget_city: activeProg.years?.[selectedYear]?.budget_city || 0,
                  budget_external: activeProg.years?.[selectedYear]?.budget_external || 0,
                  budget_carry_national: activeProg.years?.[selectedYear]?.budget_carry_national || 0,
                  budget_carry_city: activeProg.years?.[selectedYear]?.budget_carry_city || 0,
                  budget_carry_external: activeProg.years?.[selectedYear]?.budget_carry_external || 0,
                  budget_categories: activeProg.years?.[selectedYear]?.budget_categories || []
                }
              }
            };

            const nowTime = Date.now();
            const approvedAtIso = new Date(nowTime).toISOString();
            const requestedAtIso = new Date(nowTime - 2000).toISOString(); // 신청을 처리보다 2초 전으로 보정하여 역전현상 해결

            await supabase
              .from("program_version_requests")
              .insert({
                year: selectedYear,
                unit_id: activeProg.unitId,
                program_id: activeProg.id,
                program_title: activeProg.title,
                version_name: "송경영 단장 직접 수정",
                changes: {
                  before: beforeData,
                  after: afterData
                },
                status: "승인완료",
                requested_by: `${currentUser.name} (${getRequesterRoleName(currentUser)})`,
                requested_at: requestedAtIso,
                approved_by: currentUser.name,
                approved_at: approvedAtIso
              });
          }
        } catch (err) {
          console.error("Failed to insert direct version request log for Song:", err);
        }
      }

      setFeedbackMsg("P 단계 기획 정보 및 예산 배정이 최종 승인되어 즉시 적용되었습니다.");
      setTimeout(() => setFeedbackMsg(""), 3000);
    } else {
      try {
        if (!supabase) {
          alert("데이터베이스 연동 설정이 되어있지 않습니다.");
          return;
        }

        const { data: pending } = await supabase
          .from("program_version_requests")
          .select("id")
          .eq("program_id", activeProg.id)
          .eq("status", "승인대기");

        if (pending && pending.length > 0) {
          alert("⚠️ 이미 승인 대기 중인 변경 요청 건이 있습니다. 기존 요청이 처리된 이후에 추가 변경을 신청할 수 있습니다.");
          return;
        }

        const { data: requestList } = await supabase
          .from("program_version_requests")
          .select("id, version_name, status")
          .eq("program_id", activeProg.id)
          .eq("year", selectedYear);

        // 오직 '승인완료'된 변경이력 중 '차 수정'이 명기된 건만 카운트해서 버전을 누적
        const approvedCount = requestList
          ? requestList.filter((r: LegacyPdcaRecord) => r.status === "승인완료" && (r.version_name || "").includes("차 수정")).length
          : 0;
        const versionName = `${approvedCount + 1}차 수정`;

        const beforeData = {
          pdca: activeProg.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" },
          timeline: activeProg.timeline || "",
          targetAudience: activeProg.targetAudience || "",
          coopDept: activeProg.coopDept || "",
          target_participants: activeProg.target_participants || 0,
          target_developments: activeProg.target_developments || 0,
          target_etc: activeProg.target_etc || 0,
          target_participants_unit: activeProg.target_participants_unit || "명",
          target_developments_unit: activeProg.target_developments_unit || "건",
          target_etc_unit: activeProg.target_etc_unit || "개",
          target_participants_name: activeProg.target_participants_name || "참여인원",
          target_developments_name: activeProg.target_developments_name || "개발건수",
          target_etc_name: activeProg.target_etc_name || "기타",
          kpi_type: activeProg.kpi_type || "자율",
          kpi_link: activeProg.kpi_link || "",
          kpi_types: activeProg.kpi_types || [],
          kpi_links: activeProg.kpi_links || [],
          kpi_targets: activeProg.kpi_targets || {},
          years: {
            [selectedYear]: {
              budget_national: activeProg.years?.[selectedYear]?.budget_national || 0,
              budget_city: activeProg.years?.[selectedYear]?.budget_city || 0,
              budget_external: activeProg.years?.[selectedYear]?.budget_external || 0,
              budget_carry_national: activeProg.years?.[selectedYear]?.budget_carry_national || 0,
              budget_carry_city: activeProg.years?.[selectedYear]?.budget_carry_city || 0,
              budget_carry_external: activeProg.years?.[selectedYear]?.budget_carry_external || 0,
              budget_categories: activeProg.years?.[selectedYear]?.budget_categories || []
            }
          }
        };

        const { error: insertErr } = await supabase
          .from("program_version_requests")
          .insert({
            year: selectedYear,
            unit_id: activeProg.unitId,
            program_id: activeProg.id,
            program_title: activeProg.title,
            version_name: versionName,
            changes: {
              before: beforeData,
              after: afterData
            },
            status: "승인대기",
            requested_by: currentUser ? `${currentUser.name} (${getRequesterRoleName(currentUser)})` : "실무 연구원"
          });

        if (insertErr) throw insertErr;

        alert(`📝 [${versionName}] 승인 대기 요청이 정상적으로 전송되었습니다!\n사업단 결재권자(심현미, 김현수, 송경영)의 승인이 완료되면 최종 반영됩니다.`);
      } catch (err) {
        console.error("Failed to insert version request:", err);
        const detailMsg = getErrorDetails(err);
        alert("승인 요청을 전송하는 도중 에러가 발생했습니다:\n" + detailMsg);
      }
    }
  };



  // D 단계 집행 및 실적 등록 (재원별 집행 및 이수인원 기입)
  const handleUpdateBudget = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (!activeProg) return;

    const parsedParticipants = parseInt(inputParticipants, 10) || 0;
    const parsedActualDevelopments = parseInt(inputActualDevelopments, 10) || 0;
    const parsedActualEtc = parseInt(inputActualEtc, 10) || 0;

    const py = activeProg.years?.[selectedYear] || {};
    const limitNational = Math.round((py.budget_national || 0) + (py.budget_carry_national || 0));
    const limitCity = Math.round((py.budget_city || 0) + (py.budget_carry_city || 0));
    const limitExternal = Math.round((py.budget_external || 0) + (py.budget_carry_external || 0));

    // D단계 비목별 집행액 데이터 취합 (본예산 및 이월예산은 유지)
    const categoriesToSave = inputBudgetCategories
      .filter((c) => c.category && c.category !== "")
      .map((c) => ({
        category: c.category,
        budget: Math.round(parseDecimalFromCommas(c.budget || "0.0") * 1000000),
        budget_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.budget_carry || "0.0") * 1000000),
        spent: Math.round(parseDecimalFromCommas(c.spent || "0")),
        spent_carry: selectedYear === 1 ? 0 : Math.round(parseDecimalFromCommas(c.spent_carry || "0"))
      }));

    // 비목별 본집행 및 이월집행 합산 총액
    const totalSpentMain = categoriesToSave.reduce((sum, c) => sum + (c.spent || 0), 0);
    const _totalSpentCarry = categoriesToSave.reduce((sum, c) => sum + (c.spent_carry || 0), 0);

    // 본집행 실적을 국고/시비/외부사업비 한도에 비례하여 자동 안분 배분
    let sNational = 0;
    let sCity = 0;
    let sExternal = 0;

    let remainingSpent = totalSpentMain;

    sNational = Math.min(remainingSpent, limitNational);
    remainingSpent -= sNational;

    if (remainingSpent > 0) {
      sCity = Math.min(remainingSpent, limitCity);
      remainingSpent -= sCity;
    }

    if (remainingSpent > 0) {
      sExternal = Math.min(remainingSpent, limitExternal);
      remainingSpent -= sExternal;
    }

    // 예산 한도 총합을 초과하는 집행액이 있으면, 초과분은 국고 집행액에 병합 처리
    if (remainingSpent > 0) {
      sNational += remainingSpent;
    }

    // D단계 자동 완료/진행 판정
    const compD = checkDStageCompletion(activeProg, py, {
      actual_timeline: inputMonthlyPDCAActual.join(","),
      budget_categories: categoriesToSave,
      participants: parsedParticipants,
      actual_developments: parsedActualDevelopments,
      actual_etc: parsedActualEtc
    });
    const autoDState = compD.ok ? "완료" : "진행";

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      spent_national: sNational,
      spent_city: sCity,
      spent_external: sExternal,
      participants: parsedParticipants,
      actual_audience_participants: {
        "재학생": parseInt(inputAudienceParticipants["재학생"], 10) || 0,
        "성인학습자": parseInt(inputAudienceParticipants["성인학습자"], 10) || 0,
        "재직자": parseInt(inputAudienceParticipants["재직자"], 10) || 0,
        "기타": parseInt(inputAudienceParticipants["기타"], 10) || 0
      },
      actual_developments: parsedActualDevelopments,
      actual_etc: parsedActualEtc,
      actualFrequency: parsedParticipants, // 실제 참여인원과 동기화
      achieveRate: inputAchieveRate !== "" ? parseFloat(inputAchieveRate) : 0,
      budget_categories: categoriesToSave,
      actual_timeline: inputMonthlyPDCAActual.join(","), // 실제 일정을 쉼표로 연결해서 전송
      kpi_actuals: inputKpiActuals,
      pdca: { ...activeProg.pdca, d: autoDState }
    });

    setFeedbackMsg("D 단계 집행 실적 및 세부 실적치들이 안전하게 저장되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };


  // C 단계 실적 입력 (성과사항 서술 및 만족도 기입)
  const handleUpdateCDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (!activeProg) return;

    const parsedSatisfaction = parseFloat(inputSatisfaction) || 0;

    if (isNaN(parsedSatisfaction) || parsedSatisfaction < 0 || parsedSatisfaction > 100) {
      alert("만족도는 0~100 사이의 숫자로 입력해 주세요.");
      return;
    }

    // C단계 자동 완료/대기 판정
    const compC = checkCStageCompletion(activeProg, activeProg.years?.[selectedYear] || {}, {
      achievements: inputAchievements,
      satisfaction: parsedSatisfaction
    });

    const autoCState = compC.ok ? "완료" : "대기";
    const newPdca = { ...activeProg.pdca, c: autoCState };

    // C가 대기 상태가 되면 A도 자동으로 대기 상태로 연쇄 롤백
    if (autoCState === "대기") {
      newPdca.a = "대기";
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      achievements: inputAchievements,
      satisfaction: parsedSatisfaction,
      pdca: newPdca
    });

    setFeedbackMsg("C 단계 성과 실적(성과사항, 만족도)이 안전하게 저장되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // A 단계 자체 평가 및 환류 2분할 방안 저장
  const handleUpdateA = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (!activeProg) return;

    // A단계 자동 완료/대기 판정
    const compA = checkAStageCompletion(activeProg, activeProg.years?.[selectedYear] || {}, {
      evalType: inputEvalType,
      excellent: inputExcellent,
      improvePlan: inputImprovePlan,
      deficiency: inputDeficiency,
      actionItem: inputActionItem
    });

    const autoAState = compA.ok ? "완료" : "대기";

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      evalType: inputEvalType,
      excellent: inputExcellent,
      improvePlan: inputImprovePlan,
      deficiency: inputDeficiency,
      actionItem: inputActionItem,
      pdca: { ...activeProg.pdca, a: autoAState }
    });

    setFeedbackMsg("A 단계 평가 환류 방안이 영구 반영되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // 💡 [프로그램 ID별 Excel 내보내기 - 시스템 외형 유지형 리포트 서식 빌드]
  const handleExportProgramExcel = async () => {
    if (!activeProg) return;
    const XLSX = await import("xlsx");
    const py = activeProg.years?.[selectedYear] || {};
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `[${activeProg.id}]${activeProg.title}_PDCA_${dateStr}.xlsx`;

    const wb = XLSX.utils.book_new();

    const data = [
      [`[${activeProg.id}] ${activeProg.title} - PDCA 성과환류 결과보고서 (${selectedYear}차년도)`],
      [""],
      ["■ 1. 프로그램 기본 정보"],
      ["단위과제", activeProg.unitTitle || "미지정", "담당부서(협업)", `${inputCoopDept1 || "없음"}${inputCoopDept2 ? `, ${inputCoopDept2}` : ""}`],
      ["사업대상", inputTargetAudience || "미정", "기획추진일정", inputTimeline || "미정"],
      [""],
      ["■ 2. 재원별 예산 및 집행 현황 (단위: 백만원)"],
      ["재원 구분", "배정 예산액", "누적 집행액", "집행률"],
      ["국고", parseFloat(inputBudgetNational), parseFloat(inputSpentNational), `${parseFloat(inputBudgetNational) > 0 ? (parseFloat(inputSpentNational) / parseFloat(inputBudgetNational) * 100).toFixed(1) : "0.0"}%`],
      ["시비", parseFloat(inputBudgetCity), parseFloat(inputSpentCity), `${parseFloat(inputBudgetCity) > 0 ? (parseFloat(inputSpentCity) / parseFloat(inputBudgetCity) * 100).toFixed(1) : "0.0"}%`],
      ["외부", parseFloat(inputBudgetExternal), parseFloat(inputSpentExternal), `${parseFloat(inputBudgetExternal) > 0 ? (parseFloat(inputSpentExternal) / parseFloat(inputBudgetExternal) * 100).toFixed(1) : "0.0"}%`],
      ["합계", (py.budget_main || 0) + (py.budget_carry || 0) ? ((py.budget_main || 0) + (py.budget_carry || 0)) / 1000000 : 0, (py.spent_main || 0) + (py.spent_carry || 0) ? ((py.spent_main || 0) + (py.spent_carry || 0)) / 1000000 : 0, `${((py.budget_main || 0) + (py.budget_carry || 0)) > 0 ? (((py.spent_main || 0) + (py.spent_carry || 0)) / ((py.budget_main || 0) + (py.budget_carry || 0)) * 100).toFixed(1) : "0.0"}%`],
      [""],
      ["■ 3. 비목별 예산 기획 및 집행 실적 (단위: 원)"],
      ["순번", "세부 비목 (카테고리)", "본예산 계획", "이월예산 계획", "본집행 실적", "이월집행 실적"]
    ];

    let seq = 1;
    inputBudgetCategories.forEach(c => {
      if (c.category) {
        data.push([
          seq++,
          c.category,
          c.budget ? parseFloat(c.budget) * 1000000 : 0,
          c.budget_carry ? parseFloat(c.budget_carry) * 1000000 : 0,
          c.spent ? parseInt(c.spent.replace(/,/g, "")) : 0,
          c.spent_carry ? parseInt(c.spent_carry.replace(/,/g, "")) : 0
        ]);
      }
    });

    data.push(
      [""],
      ["■ 4. PDCA 단계별 세부 성과환류"],
      ["[Plan - 기획 및 목표 수립]"],
      [" - 기획 단계 상태", activeProg.pdca?.p || "대기"],
      [" - 기획 추진일정", inputMonthlyPDCA.map((val, idx) => val ? `${idx + 3}월(${val})` : null).filter(Boolean).join(", ") || "일정 없음"],
      [" - 성과 목표 설정", `운영 횟수: ${inputFrequency || "0"}회 / 참여 인원: ${inputTargetParticipants || "0"}${inputTargetParticipantsUnit || "명"}(${inputTargetParticipantsName || ""})`],
      [" - 개발/개설 목표", `${inputTargetDevelopments || "0"}${inputTargetDevelopmentsUnit || "건"}(${inputTargetDevelopmentsName || ""}) / 기타: ${inputTargetEtc || "0"}${inputTargetEtcUnit || "건"}`],
      [" - 연계 KPI 링크", activeProg.kpi_links?.filter(Boolean).join(", ") || "연계 없음"],
      [""],
      ["[Do - 추진 및 집행 실적]"],
      [" - 추진 단계 상태", activeProg.pdca?.d || "대기"],
      [" - 실제 추진 일정", inputMonthlyPDCAActual.map((val, idx) => val ? `${idx + 3}월(${val})` : null).filter(Boolean).join(", ") || "일정 없음"],
      [" - 실제 성과 실적", `총 참여인원: ${inputParticipants || "0"}명 (재학생: ${inputAudienceParticipants["재학생"] || "0"}명, 성인학습자: ${inputAudienceParticipants["성인학습자"] || "0"}명, 재직자: ${inputAudienceParticipants["재직자"] || "0"}명, 기타: ${inputAudienceParticipants["기타"] || "0"}명)`],
      [" - 개발/개설 실적", `${inputActualDevelopments || "0"}건 / 기타 실적: ${inputActualEtc || "0"}건`],
      [""],
      ["[Check - 성과 분석 및 만족도]"],
      [" - 분석 단계 상태", activeProg.pdca?.c || "대기"],
      [" - 수요자 만족도", `${inputSatisfaction || "0.0"} 점 / 5.0 점`],
      [" - 주요 성과 요약", inputAchievements || "등록된 내용 없음"],
      [""],
      ["[Act - 자체평가 및 환류]"],
      [" - 환류 단계 상태", activeProg.pdca?.a || "대기"],
      [" - 자체 평가 등급", inputEvalType],
      inputEvalType === "우수" 
        ? [" - 우수 요인 및 발전방안", `[우수요인]: ${inputExcellent || "기재 없음"} \n[발전방안]: ${inputImprovePlan || "기재 없음"}`]
        : [" - 미흡 요인 및 조치사항", `[미흡요인]: ${inputDeficiency || "기재 없음"} \n[조치사항]: ${inputActionItem || "기재 없음"}`]
    );

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws["!cols"] = [
      { wch: 22 },
      { wch: 38 },
      { wch: 22 },
      { wch: 38 },
      { wch: 18 },
      { wch: 18 }
    ];

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } },
      { s: { r: 13, c: 0 }, e: { r: 13, c: 5 } }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "PDCA 결과보고");
    XLSX.writeFile(wb, fileName);
  };

  const pdcaExportContext = {
    activeProg,
    selectedYear,
    setIsDownloadingPdf,
    inputBudgetNational,
    inputSpentNational,
    inputBudgetCity,
    inputSpentCity,
    inputBudgetExternal,
    inputSpentExternal,
    inputBudgetCategories,
    inputMonthlyPDCA,
    inputMonthlyPDCAActual,
    inputCoopDept1,
    inputCoopDept2,
    inputTargetAudience,
    inputTimeline,
    inputFrequency,
    inputTargetParticipants,
    inputTargetParticipantsUnit,
    inputTargetParticipantsName,
    inputTargetDevelopments,
    inputTargetDevelopmentsUnit,
    inputTargetDevelopmentsName,
    inputTargetEtc,
    inputTargetEtcUnit,
    inputParticipants,
    inputAudienceParticipants,
    inputActualDevelopments,
    inputActualEtc,
    inputSatisfaction,
    inputAchievements,
    inputEvalType,
    inputExcellent,
    inputImprovePlan,
    inputDeficiency,
    inputActionItem,
  };

  const handleExportProgramPDF = () => exportPdcaProgramPdf(pdcaExportContext);
  const handleExportProgramMarkdown = () => exportPdcaProgramMarkdown(pdcaExportContext);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 상단: 단위과제별 / 전체보기 탭 버튼 */}
      {!isResearcher && (
        <PdcaViewHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          setSelectedProgId={setSelectedProgId}
        />
      )}

      {/* 이원화 분기 렌더링 */}
      {viewMode === "unit" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
          {/* 좌측: 프로그램 목록 */}
          <PdcaUnitExplorer
            allUnits={allUnits}
            selectedUnitId={selectedUnitId}
            setSelectedUnitId={setSelectedUnitId}
            setSelectedProgId={setSelectedProgId}
            unitFilteredPrograms={unitFilteredPrograms}
            handleSelectProgram={handleSelectProgram}
            selectedProgId={selectedProgId}
            selectedYear={selectedYear}
          />

          {/* 우측: 프로그램 편집 패널 */}
          <div style={{ padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.02)" }}>
            {activeProg ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{activeProg.unitTitle}</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.2rem" }}>[{activeProg.id}] {activeProg.title}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <div>배정 본예산: <strong style={{ color: "var(--text-primary)" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.budget_main)}백만원</strong></div>
                    <div>이월 예산액: <strong style={{ color: "var(--text-primary)" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.budget_carry)}백만원</strong></div>
                    <div>본집행 실적: <strong style={{ color: "var(--text-primary)" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.spent_main)}백만원</strong></div>
                    <div>이월 집행액: <strong style={{ color: "var(--text-primary)" }}>{formatToMillionWon(activeProg.years?.[selectedYear]?.spent_carry)}백만원</strong></div>
                  </div>
                </div>

                {/* 💡 프로그램별 개별 파일 내보내기 버튼 그룹 (글래스모피즘 3색 조합) */}
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                  <button
                    type="button"
                    onClick={handleExportProgramExcel}
                    className="export-btn excel"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.8rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.25)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(16, 185, 129, 0.18)";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <FileSpreadsheet size={14} />
                    Excel 내보내기
                  </button>

                  <button
                    type="button"
                    disabled={isDownloadingPdf}
                    onClick={handleExportProgramPDF}
                    className="export-btn pdf"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.8rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "8px",
                      cursor: isDownloadingPdf ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.25)"
                    }}
                    onMouseEnter={(e) => {
                      if (!isDownloadingPdf) {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)";
                        e.currentTarget.style.transform = "scale(1.02)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDownloadingPdf) {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <FileText size={14} />
                    {isDownloadingPdf ? "PDF 변환 중..." : "PDF 내보내기"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportProgramMarkdown}
                    className="export-btn markdown"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.8rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: "rgba(59, 130, 246, 0.08)",
                      color: "#3b82f6",
                      border: "1px solid rgba(59, 130, 246, 0.25)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.18)";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Download size={14} />
                    MD 내보내기
                  </button>
                </div>

                {/* PDCA 현황 제어기 */}
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem" }}>PDCA 상태 설정</h4>
                  <div className="pdca-stepper">
                    {["p", "d", "c", "a"].map((stage) => {
                      const status = activeProg.pdca[stage];
                      const _isDone = status === "완료";
                      const _isProgress = status === "진행";
                      const _isAutoStage = stage === "p" || stage === "d";
                      return (
                        <div
                          key={stage}
                          className={`pdca-step-item ${status === "완료" ? "done" : status === "진행" ? "in-progress" : "pending"}`}
                          style={{ cursor: "pointer", transition: "transform 0.2s" }}
                          onClick={() => setActivePdcaStage(stage.toUpperCase())}
                          title={`${stage.toUpperCase()} 단계 실무 폼 열기`}
                         role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                          <div className="pdca-circle">{stage.toUpperCase()}</div>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                            {stage === "p" ? "Plan" : stage === "d" ? "Do" : stage === "c" ? "Check" : "Act"}
                          </span>
                          {(isResearcher || currentRole.rank <= 2) && (
                            <select
                              className="pdca-status-select"
                              value={status}
                              disabled={true}
                              title={
                                stage === "p"
                                  ? "Plan 단계 상태는 기획 정보 입력량에 따라 자동으로 설정됩니다."
                                  : stage === "d"
                                    ? "Do 단계 상태는 집행 및 수행 실적 저장 시 자동으로 설정됩니다."
                                    : stage === "c"
                                      ? "Check 단계 상태는 성과 실적 저장 시 자동으로 설정됩니다."
                                      : "Act 단계 상태는 환류 평가 저장 시 자동으로 설정됩니다."
                              }
                              onClick={(e) => e.stopPropagation()}
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
                  background: "rgba(120, 120, 120, 0.03)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.8rem",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ClipboardList size={20} style={{ color: "var(--accent-color)" }} />
                    <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-secondary)" }}>P-D-C-A 단계 선택</span>
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
                      background: "var(--panel-bg)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.3rem",
                      outline: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    <option value="P" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>Plan (P 단계: 예산 기획 및 세부 추진계획)</option>
                    <option value="D" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>Do (D 단계: 세부 재원별 본집행액 및 실적 입력)</option>
                    <option value="C" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>Check (C 단계: 운영 성과 실적 입력)</option>
                    <option value="A" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>Act (A 단계: 사업 환류 및 자체평가)</option>
                  </select>
                </div>

                {/* P 단계: 기획 정보 수립 & 예산 세부 배정 */}
                {activePdcaStage === "P" && (isResearcher || currentRole.rank <= 2) && (
                  <PdcaPlanStage
                    handleUpdatePDetails={handleUpdatePDetails}
                    programVersions={programVersions}
                    selectedVersionId={selectedVersionId}
                    setSelectedVersionId={setSelectedVersionId}
                    currentRole={currentRole}
                    selectedYear={selectedYear}
                    inputBudgetNational={inputBudgetNational}
                    setInputBudgetNational={setInputBudgetNational}
                    inputBudgetCarryNational={inputBudgetCarryNational}
                    setInputBudgetCarryNational={setInputBudgetCarryNational}
                    inputBudgetCity={inputBudgetCity}
                    setInputBudgetCity={setInputBudgetCity}
                    inputBudgetCarryCity={inputBudgetCarryCity}
                    setInputBudgetCarryCity={setInputBudgetCarryCity}
                    inputBudgetExternal={inputBudgetExternal}
                    setInputBudgetExternal={setInputBudgetExternal}
                    inputBudgetCategories={inputBudgetCategories}
                    setInputBudgetCategories={setInputBudgetCategories}
                    monthsList={monthsList}
                    inputMonthlyPDCA={inputMonthlyPDCA}
                    setInputMonthlyPDCA={setInputMonthlyPDCA}
                    activeProg={activeProg}
                    allUnits={allUnits}
                    inputKpiTypes={inputKpiTypes}
                    setInputKpiTypes={setInputKpiTypes}
                    inputKpiLinks={inputKpiLinks}
                    setInputKpiLinks={setInputKpiLinks}
                    inputKpiTargets={inputKpiTargets}
                    setInputKpiTargets={setInputKpiTargets}
                    inputTargetParticipantsName={inputTargetParticipantsName}
                    setInputTargetParticipantsName={setInputTargetParticipantsName}
                    inputTargetParticipants={inputTargetParticipants}
                    setInputTargetParticipants={setInputTargetParticipants}
                    inputTargetParticipantsUnit={inputTargetParticipantsUnit}
                    setInputTargetParticipantsUnit={setInputTargetParticipantsUnit}
                    inputTargetDevelopmentsName={inputTargetDevelopmentsName}
                    setInputTargetDevelopmentsName={setInputTargetDevelopmentsName}
                    inputTargetDevelopments={inputTargetDevelopments}
                    setInputTargetDevelopments={setInputTargetDevelopments}
                    inputTargetDevelopmentsUnit={inputTargetDevelopmentsUnit}
                    setInputTargetDevelopmentsUnit={setInputTargetDevelopmentsUnit}
                    inputTargetEtcName={inputTargetEtcName}
                    setInputTargetEtcName={setInputTargetEtcName}
                    inputTargetEtc={inputTargetEtc}
                    setInputTargetEtc={setInputTargetEtc}
                    inputTargetEtcUnit={inputTargetEtcUnit}
                    setInputTargetEtcUnit={setInputTargetEtcUnit}
                    inputTargetAudience={inputTargetAudience}
                    setInputTargetAudience={setInputTargetAudience}
                    inputCoopDept1={inputCoopDept1}
                    setInputCoopDept1={setInputCoopDept1}
                    inputCoopDept2={inputCoopDept2}
                    setInputCoopDept2={setInputCoopDept2}
                  />
                )}

                {/* D 단계: 세부 재원별 집행 등록 */}
                {activePdcaStage === "D" && (isResearcher || currentRole.rank <= 2) && (
                  <PdcaDoStage
                    handleUpdateBudget={handleUpdateBudget}
                    monthsList={monthsList}
                    inputMonthlyPDCAActual={inputMonthlyPDCAActual}
                    setInputMonthlyPDCAActual={setInputMonthlyPDCAActual}
                    activeProg={activeProg}
                    inputAudienceParticipants={inputAudienceParticipants}
                    handleAudienceParticipantChange={handleAudienceParticipantChange}
                    inputParticipants={inputParticipants}
                    setInputParticipants={setInputParticipants}
                    allUnits={allUnits}
                    inputKpiActuals={inputKpiActuals}
                    setInputKpiActuals={setInputKpiActuals}
                    inputBudgetCategories={inputBudgetCategories}
                    selectedYear={selectedYear}
                    inputAchieveRate={inputAchieveRate}
                    inputActualDevelopments={inputActualDevelopments}
                    setInputActualDevelopments={setInputActualDevelopments}
                    inputActualEtc={inputActualEtc}
                    setInputActualEtc={setInputActualEtc}
                    currentRole={currentRole}
                  />
                )}

                {/* C 단계: 집행액 제외 성과 실적 입력 */}
                {activePdcaStage === "C" && (isResearcher || currentRole.rank <= 2) && (
                  <PdcaCheckStage
                    handleUpdateCDetails={handleUpdateCDetails}
                    inputAchievements={inputAchievements}
                    setInputAchievements={setInputAchievements}
                    inputSatisfaction={inputSatisfaction}
                    setInputSatisfaction={setInputSatisfaction}
                    currentRole={currentRole}
                  />
                )}

                {/* A 단계: 환류 2분할 자체평가 */}
                {activePdcaStage === "A" && (isResearcher || currentRole.rank <= 2) && (
                  <PdcaActStage
                    handleUpdateA={handleUpdateA}
                    inputEvalType={inputEvalType}
                    setInputEvalType={setInputEvalType}
                    inputExcellent={inputExcellent}
                    setInputExcellent={setInputExcellent}
                    inputImprovePlan={inputImprovePlan}
                    setInputImprovePlan={setInputImprovePlan}
                    inputDeficiency={inputDeficiency}
                    setInputDeficiency={setInputDeficiency}
                    inputActionItem={inputActionItem}
                    setInputActionItem={setInputActionItem}
                    currentRole={currentRole}
                  />
                )}


              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "260px", color: "var(--text-secondary)" }}>
                <PenTool size={32} style={{ marginBottom: "0.75rem" }} />
                <span>좌측 프로그램 목록에서 수정할 프로그램을 선택해 주세요.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 전체 목록 모드 */
        <PdcaAllProgramsView
          allFilteredPrograms={allFilteredPrograms}
          selectedYear={selectedYear}
          handleSelectProgram={handleSelectProgram}
          selectedProgId={selectedProgId}
          activeProg={activeProg}
          setActivePdcaStage={setActivePdcaStage}
          isResearcher={isResearcher}
          currentRole={currentRole}
          handleUpdatePDCA={handleUpdatePDCA}
        />
      )}
      {/* 프리미엄 토스트 피드백 알림 (화면 정중앙 오버레이 팝업) */}
      {feedbackMsg && (
        <PdcaFeedbackToast feedbackMsg={feedbackMsg} />
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
