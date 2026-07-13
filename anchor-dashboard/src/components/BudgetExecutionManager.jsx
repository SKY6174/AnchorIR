import React, { useState, useEffect } from "react";
import { Upload, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Calendar, FileText, Download, Trash2, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";

// 💡 [교육용 한글 주석] 월별 집행현황 엑셀 파일을 월별로 올릴 수 있는 '26.3월 ~ '27.2월까지의 기간 정의
const MONTHS_CONFIG = [
  { label: "26.3월", value: "2026-03" },
  { label: "26.4월", value: "2026-04" },
  { label: "26.5월", value: "2026-05" },
  { label: "26.6월", value: "2026-06" },
  { label: "26.7월", value: "2026-07" },
  { label: "26.8월", value: "2026-08" },
  { label: "26.9월", value: "2026-09" },
  { label: "26.10월", value: "2026-10" },
  { label: "26.11월", value: "2026-11" },
  { label: "26.12월", value: "2026-12" },
  { label: "27.1월", value: "2027-01" },
  { label: "27.2월", value: "2027-02" }
];

export default function BudgetExecutionManager({ projects = [], currentRole, selectedYear: rawYear, supabase }) {
  const selectedYear = Number(rawYear);
  const [activeUploadTab, setActiveUploadTab] = useState("main"); // "main" (본예산 집행 등록) vs "carryover" (이월예산 집행 등록)
  
  // 수집 및 저장된 실 정산 레코드 상태
  const [executionRecords, setExecutionRecords] = useState([]);
  
  // 상세조회 모달 상태 관리 정의
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalConfig, setDetailModalConfig] = useState({ monthLabel: "", budgetType: "", title: "" });
  
  // 각 월별 업로드된 파일 정보 메타 데이터 (어떤 월에 어떤 파일이 몇건 올라갔는지 매핑 보관)
  // key 형태: `${year}_${budgetType}_${monthValue}`
  const [uploadedFilesMeta, setUploadedFilesMeta] = useState({});

  const [dragActive, setDragActive] = useState(null); // drag중인 month value 저장
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" or "warning"
  
  // 1) 조회 구분 및 단위과제 선택 상태 변수 정의
  const [viewType, setViewType] = useState("total"); // "total" (사업전체) vs "unit" (단위과제별)
  const [selectedUnit, setSelectedUnit] = useState("");

  // 2) 현재 선택된 연도에 따른 단위과제 리스트 정의
  const unitList = selectedYear === 1
    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"]
    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0"];

  // 연차 변경 시 선택된 단위과제 초기값 자동 동기화
  useEffect(() => {
    setSelectedUnit(unitList[0]);
  }, [selectedYear]);

  // 💡 [교육용 한글 주석] 초기 진입 시 Supabase 혹은 LocalStorage 캐시 저장소로부터 이전 업로드 데이터를 불러옵니다.
  useEffect(() => {
    loadSavedData();
  }, [selectedYear]);

  const loadSavedData = async () => {
    try {
      // 1. Supabase 원격 저장소 노크 시도
      if (supabase) {
        const { data, error } = await supabase
          .from("budget_executions")
          .select("*")
          .eq("year", selectedYear);
        if (!error && data && data.length > 0) {
          setExecutionRecords(data);
          rebuildFileMeta(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase 데이터 로드 에러 (LocalStorage 백업 모드로 전환합니다):", e.message);
    }

    // 2. 실패 시 LocalStorage 폴백 데이터 로드
    const localDataStr = localStorage.getItem(`budget_exec_records_${selectedYear}`);
    if (localDataStr) {
      try {
        const parsed = JSON.parse(localDataStr);
        setExecutionRecords(parsed);
        rebuildFileMeta(parsed);
      } catch (err) {
        console.error("LocalStorage 파싱 실패:", err);
      }
    } else {
      setExecutionRecords([]);
      setUploadedFilesMeta({});
    }
  };

  // 기존 내역으로부터 파일 메타 정보 재생성
  const rebuildFileMeta = (records) => {
    const meta = {};
    records.forEach(r => {
      const key = `${r.year}_${r.budget_type}_${r.month_label}`;
      if (!meta[key]) {
        meta[key] = {
          count: 0,
          fileName: "정산엑셀_자동집계.xlsx",
          totalAmount: 0
        };
      }
      meta[key].count += 1;
      meta[key].totalAmount += Number(r.amount);
    });
    setUploadedFilesMeta(meta);
  };

  // 로컬 및 데이터베이스 데이터 영속 저장
  const saveRecords = async (newRecords) => {
    setExecutionRecords(newRecords);
    rebuildFileMeta(newRecords);
    
    // LocalStorage 백업
    localStorage.setItem(`budget_exec_records_${selectedYear}`, JSON.stringify(newRecords));

    // Supabase 원격 백업
    try {
      if (supabase) {
        // RLS 통과를 위해 임시 딜리트 후 인서트 처리하거나 upsert
        const { error: delError } = await supabase
          .from("budget_executions")
          .delete()
          .eq("year", selectedYear);

        if (delError) {
          console.error("Supabase 기존 데이터 삭제 실패 (RLS 또는 DB 에러):", delError);
          triggerToast(`⚠️ DB 동기화(삭제) 실패: ${delError.message}`, "warning");
        } else if (newRecords.length > 0) {
          const bulkInsert = newRecords.map(({ id, created_at, ...rest }) => rest);
          const { error: insError } = await supabase
            .from("budget_executions")
            .insert(bulkInsert);

          if (insError) {
            console.error("Supabase 데이터 삽입 실패 (RLS 또는 DB 에러):", insError);
            triggerToast(`⚠️ DB 동기화(삽입) 실패: ${insError.message}`, "warning");
          } else {
            console.log("Supabase 원격 데이터베이스 실시간 동기화 완료!");
          }
        }
      }
    } catch (e) {
      console.error("Supabase 실시간 백업 동기화 예외 발생:", e.message);
      triggerToast(`⚠️ DB 백업 예외: ${e.message}`, "warning");
    }
  };

  // 💡 [교육용 한글 주석] 첫 번째 그림에 표기된 14개 핵심 헤더를 준수하는 엑셀 양식을 다운로드합니다.
  const handleDownloadTemplate = () => {
    const headers = [
      "프로그램ID", "프로그램명", "국비/시비", "비목항목명(사업비 비목)", "세부내역(사용용도)",
      "e나라 비목", "계정과목", "계정과목 세목", "집행일자", "적요", "거래처", "집행액", "결의번호", "담당자"
    ];

    // 가이드용 고품질 예제 행 추가 (첫 번째 그림 기준)
    const samples = [
      [
        "X0-S1T1-1", "(공통)전담연구원 인건비", "국비", "인건비", "인건비",
        "210-01", "인건비", "지원금사업 인건비", "2026-04-20", "[인건비]김래림", "김래림", 77574, "20260001656", "윤유경"
      ],
      [
        "X0-S1T1-1", "(공통)전담연구원 인건비", "국비", "인건비", "인건비",
        "210-01", "인건비", "지원금사업 인건비", "2026-04-20", "[인건비]박연주", "박연주", 76140, "20260001656", "윤유경"
      ],
      [
        "A1가-S3T5-1", "개방형설계센터 전문가활용교육 개발 및 운영", "시비", "교육·연구 프로그램 개발·운영비", "비정규교육과정 개발/운영",
        "210-01", "기타교육운영비", "지원금사업 기타교육운영비", "2026-06-15", "[카드][RISE사업][A1]2026년 제4차 지산학 이음 세미나 행사 운영 물품", "서란", 1800000, "20260062222", "이은주서관"
      ]
    ];

    const data = [headers, ...samples];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // 컬럼 너비 조정 (가독성 향상)
    ws["!cols"] = [
      { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 25 }, { wch: 25 },
      { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 50 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "집행내역_업로드양식");
    
    // 파일 쓰기 및 다운로드 트리거
    XLSX.writeFile(wb, `${selectedYear}차년도_예산_집행현황_업로드양식.xlsx`);
    triggerToast("✨ 엑셀 업로드 양식을 다운로드 하였습니다.", "success");
  };

  // 💡 [교육용 한글 주석] 파싱된 엑셀 데이터를 무결성 규칙에 맞춰 정제하고 중복을 걸러 저장합니다.
  const processExcelData = (file, monthLabel, budgetType) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 2차원 배열 형태로 데이터를 정밀 로드
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rows.length <= 1) {
          triggerToast("⚠️ 엑셀 파일 내에 유효한 집행 데이터가 존재하지 않습니다.", "warning");
          return;
        }

        // 헤더 매칭 및 열 인덱스 판별
        const headers = rows[0].map(h => (h || "").toString().trim().replace(/\s/g, ""));
        const getIdx = (name) => headers.findIndex(h => h.includes(name));

        // 💡 [사용자 지산학 특화 4대 핵심 매핑 가드]
        // 사용자가 명시한 A열(0: 프로그램ID), C열(2: 비목항목명), H열(7: 집행일자), L열(11: 집행액)을 기본 매핑으로 삼고,
        // 동적 헤더 파싱 결과가 유효하면 이를 사용하고, 없으면 고정 열 인덱스를 폴백(Fallback)으로 적용합니다.
        let pIdIdx = getIdx("프로그램ID");
        if (pIdIdx === -1) pIdIdx = 0;

        let pNameIdx = getIdx("프로그램명");
        if (pNameIdx === -1) pNameIdx = 1;

        let fundIdx = getIdx("국비/시비");
        if (fundIdx === -1) fundIdx = 3;

        let categoryIdx = getIdx("비목항목명");
        if (categoryIdx === -1) categoryIdx = 2;

        let usageIdx = getIdx("세부내역");
        if (usageIdx === -1) usageIdx = 4;

        let enaraIdx = getIdx("e나라비목");
        if (enaraIdx === -1) enaraIdx = 5;

        let subjectIdx = getIdx("계정과목");
        if (subjectIdx === -1) subjectIdx = 6;

        let detailSubjectIdx = getIdx("계정과목세목");
        if (detailSubjectIdx === -1) detailSubjectIdx = 8;

        let dateIdx = getIdx("집행일자");
        if (dateIdx === -1) dateIdx = 7;

        let summaryIdx = getIdx("적요");
        if (summaryIdx === -1) summaryIdx = 9;

        let clientIdx = getIdx("거래처");
        if (clientIdx === -1) clientIdx = 10;

        let amountIdx = getIdx("집행액");
        if (amountIdx === -1) amountIdx = 11;

        let resolutionIdx = getIdx("결의번호");
        if (resolutionIdx === -1) resolutionIdx = 12;

        let managerIdx = getIdx("담당자");
        if (managerIdx === -1) managerIdx = 13;

        let newParsedRows = [];
        let duplicateCount = 0;
        let invalidCarryoverCount = 0;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || !row[pIdIdx]) continue; // 빈 행 건너뜀

          const resolutionNo = (row[resolutionIdx] || "").toString().trim();
          const programId = (row[pIdIdx] || "").toString().trim();
          const rawDate = row[dateIdx];
          
          // 날짜 포맷팅 변환 (DATE형)
          let execDate = "2026-03-01";
          if (rawDate) {
            if (typeof rawDate === "number") {
              const excelEpoch = new Date(1900, 0, rawDate - 1);
              execDate = excelEpoch.toISOString().split("T")[0];
            } else {
              execDate = rawDate.toString().trim();
            }
          }

          // 💡 [이월예산 집행 기한 통제 가드] 1차년도 이월예산은 8월 31일 기한 마감되므로 9월 이후 집행분은 등록을 원천 차단합니다.
          if (budgetType === "carryover" && execDate > "2026-08-31") {
            invalidCarryoverCount++;
            continue;
          }

          const amount = parseFloat((row[amountIdx] || "0").toString().replace(/,/g, ""));
          if (isNaN(amount) || amount <= 0) continue;

          // 💡 중복 판단 핵심 키: 결의번호 + 프로그램ID + 집행일자 + 집행액 + 예산구분
          const isDuplicate = executionRecords.some(r => 
            r.resolution_no === resolutionNo &&
            r.program_id === programId &&
            r.execution_date === execDate &&
            Number(r.amount) === amount &&
            r.budget_type === budgetType &&
            r.year === selectedYear
          ) || newParsedRows.some(r =>
            r.resolution_no === resolutionNo &&
            r.program_id === programId &&
            r.execution_date === execDate &&
            r.amount === amount
          );

          if (isDuplicate) {
            duplicateCount++;
            continue; // 중복 행은 건너뛰고 반영하지 않음
          }

          newParsedRows.push({
            year: selectedYear,
            month_label: monthLabel,
            program_id: programId,
            program_name: (row[pNameIdx] || "").toString().trim(),
            funding_source: (row[fundIdx] || "국비").toString().trim(),
            expense_category: (row[categoryIdx] || "").toString().trim().replace(/[·•ㆍ]/g, "∙"),
            detail_usage: (row[usageIdx] || "").toString().trim(),
            enara_category: (row[enaraIdx] || "").toString().trim(),
            account_subject: (row[subjectIdx] || "").toString().trim(),
            account_detail: (row[detailSubjectIdx] || "").toString().trim(),
            execution_date: execDate,
            summary: (row[summaryIdx] || "").toString().trim(),
            client: (row[clientIdx] || "").toString().trim(),
            amount: amount,
            resolution_no: resolutionNo,
            manager: (row[managerIdx] || "").toString().trim(),
            budget_type: budgetType
          });
        }

        if (newParsedRows.length === 0) {
          const skipMsg = invalidCarryoverCount > 0
            ? `이월예산 기한 초과(8/31): 새로 추가된 건이 없습니다. (기한 초과 ${invalidCarryoverCount}건 제외, 중복 ${duplicateCount}건 제외)`
            : `중복 내역 필터링 완료: 새로 추가된 건이 없습니다. (중복 ${duplicateCount}건 제외)`;
          triggerToast(skipMsg, "warning");
          return;
        }

        // 기존 데이터에 새 파싱 행 병합 저장
        const merged = [...executionRecords, ...newParsedRows];
        saveRecords(merged);

        // 월별 파일 정보 메타데이터 업데이트
        const key = `${selectedYear}_${budgetType}_${monthLabel}`;
        setUploadedFilesMeta(prev => ({
          ...prev,
          [key]: {
            fileName: file.name,
            count: (prev[key]?.count || 0) + newParsedRows.length,
            totalAmount: (prev[key]?.totalAmount || 0) + newParsedRows.reduce((sum, r) => sum + r.amount, 0)
          }
        }));

        let successMsg = `✨ [${monthLabel} ${budgetType === "main" ? "본예산" : "이월예산"}] 총 ${newParsedRows.length}건이 성공적으로 등록되었습니다. (중복 ${duplicateCount}건 자동 제외)`;
        if (invalidCarryoverCount > 0) {
          successMsg += ` (⚠️ 기한 초과 ${invalidCarryoverCount}건 제외)`;
        }
        triggerToast(successMsg, "success");

      } catch (err) {
        console.error(err);
        triggerToast("⚠️ 엑셀 파일 해석 중 예상치 못한 오류가 발생했습니다.", "warning");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 💡 특정 월의 업로드 내역 삭제(초기화) 처리
  const handleClearMonth = (monthLabel, budgetType) => {
    if (!window.confirm(`⚠️ [${monthLabel} ${budgetType === "main" ? "본예산" : "이월예산"}] 집행 내역을 모두 삭제하시겠습니까?`)) {
      return;
    }
    const filtered = executionRecords.filter(r => 
      !(r.month_label === monthLabel && r.budget_type === budgetType && r.year === selectedYear)
    );
    saveRecords(filtered);

    const key = `${selectedYear}_${budgetType}_${monthLabel}`;
    setUploadedFilesMeta(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    triggerToast(`🗑️ ${monthLabel} 집행 데이터가 성공적으로 초기화되었습니다.`, "success");
  };

  const triggerToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // 드래그앤드롭 이벤트 핸들러
  const handleDrag = (e, monthValue) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(monthValue);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e, monthLabel, budgetType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        triggerToast("⚠️ 올바른 엑셀 파일(.xlsx, .xls)을 선택해 주세요.", "warning");
        return;
      }
      processExcelData(file, monthLabel, budgetType);
    }
  };

  const handleFileChange = (e, monthLabel, budgetType) => {
    if (e.target.files && e.target.files[0]) {
      processExcelData(e.target.files[0], monthLabel, budgetType);
    }
  };

  // ==============================================================================
  // [3] 집행률 실시간 연동 연산
  // ==============================================================================
  const calculateMetrics = () => {
    // 1. 분모 구하기 (projects 전체 예산 정보로부터 합산)
    let totalMainBudget = 0;
    let totalCarryoverBudget = 0;

    const targetUnitPrefix = viewType === "unit" ? selectedUnit : "";

    const yearBudgetField = `budget_${2024 + selectedYear}`;
    const carryoverField = `budget_${2023 + selectedYear}_carry`;

    projects.forEach(p => {
      if (p && Array.isArray(p.units)) {
        p.units.forEach(u => {
          const isMatchUnit = viewType === "total" || (targetUnitPrefix && (u.id || "").startsWith(targetUnitPrefix));
          if (isMatchUnit) {
            let mainB = 0;
            if (selectedYear === 1) {
              mainB = Number(u.budget || 0);
            } else {
              mainB = Number(u[yearBudgetField] || u.budget || 0);
            }
            let carryB = 0;
            if (selectedYear > 1) {
              carryB = Number(u[carryoverField] || 0);
            }
            totalMainBudget += mainB;
            totalCarryoverBudget += carryB;
          }
        });
      }
    });

    // 2. 분자 구하기 (실제 업로드된 집행액 합산)
    let spentMain = 0;
    let spentCarryover = 0;

    executionRecords.forEach(r => {
      const amt = Number(r.amount || 0);
      const isMatchUnit = viewType === "total" || (targetUnitPrefix && r.program_id.startsWith(targetUnitPrefix));

      if (isMatchUnit) {
        if (r.budget_type === "main") {
          spentMain += amt;
        } else if (r.budget_type === "carryover") {
          spentCarryover += amt;
        }
      }
    });

    // 백분율 계산
    const mainRate = totalMainBudget > 0 ? ((spentMain / totalMainBudget) * 100).toFixed(1) : "0.0";
    const carryoverRate = totalCarryoverBudget > 0 ? ((spentCarryover / totalCarryoverBudget) * 100).toFixed(1) : "0.0";
    const carryoverBalance = totalCarryoverBudget - spentCarryover;

    // 월별 누적 추이 차트 데이터 조립
    const chartData = [];
    let cumulativeMain = 0;
    let cumulativeCarry = 0;

    MONTHS_CONFIG.forEach(m => {
      // 해당 월의 집행액 구하기
      let monthMain = 0;
      let monthCarry = 0;

      executionRecords.forEach(r => {
        if (r.month_label === m.label && (viewType === "total" || (targetUnitPrefix && r.program_id.startsWith(targetUnitPrefix)))) {
          if (r.budget_type === "main") monthMain += Number(r.amount || 0);
          else if (r.budget_type === "carryover") monthCarry += Number(r.amount || 0);
        }
      });

      cumulativeMain += monthMain;
      cumulativeCarry += monthCarry;

      const mainPct = totalMainBudget > 0 ? Math.min(100, (cumulativeMain / totalMainBudget) * 100) : 0;
      const carryPct = totalCarryoverBudget > 0 ? Math.min(100, (cumulativeCarry / totalCarryoverBudget) * 100) : 0;

      const dataPoint = {
        month: m.label,
        mainBudget: parseFloat(mainPct.toFixed(1)),
        mainSpentAmt: Math.round(cumulativeMain / 1000000) // 백만원 단위 누적 집행액 추가
      };
      
      if (selectedYear !== 1) {
        dataPoint.carryoverBudget = parseFloat(carryPct.toFixed(1));
        dataPoint.carryoverSpentAmt = Math.round(cumulativeCarry / 1000000); // 백만원 단위 누적 이월집행액 추가
      }

      chartData.push(dataPoint);
    });

    return {
      mainRate: `${mainRate}%`,
      carryoverRate: selectedYear === 1 ? "N/A" : `${carryoverRate}%`,
      mainSpent: `${(spentMain / 100000000).toFixed(2)}억 원`,
      mainTotal: `${(totalMainBudget / 100000000).toFixed(2)}억 원`,
      carryoverSpent: selectedYear === 1 ? "0원" : `${(spentCarryover / 100000000).toFixed(2)}억 원`,
      carryoverTotal: selectedYear === 1 ? "0원" : `${(totalCarryoverBudget / 100000000).toFixed(2)}억 원`,
      carryoverBalance: `${(carryoverBalance / 100000000).toFixed(2)}억 원`,
      chartData
    };
  };

  const activeData = calculateMetrics();

  return (
    <div className="budget-execution-container" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 토스트 알림 컴포넌트 */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: toastType === "success" ? "#10B981" : "#F59E0B",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease"
        }}>
          {toastType === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>{toastMsg}</span>
        </div>
      )}

      {/* 헤더 섹션 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
            {selectedYear}차년도 예산 집행률 관리
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            월별 집행현황 관리 및 본예산·이월예산 통합 정산 프레임워크
          </p>
        </div>
        
        {/* 💡 양식 다운로드 단추 */}
        <button
          onClick={handleDownloadTemplate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            fontWeight: "800",
            borderRadius: "0.4rem",
            background: "var(--accent-color)",
            color: "white",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)",
            transition: "all 0.2s"
          }}
        >
          <Download size={14} />
          <span>엑셀 양식 다운로드</span>
        </button>
      </div>

      {/* 2차년도 기준 1차년도 이월예산 8월 31일 한계점 경고 배너 */}
      {selectedYear !== 1 && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          marginBottom: "0.5rem"
        }}>
          <AlertTriangle size={24} style={{ color: "#EF4444", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#F87171" }}>
              [중요] 1차년도 이월예산 집행 기한 및 반납 원칙 안내
            </h4>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#FCA5A5", lineHeight: "1.4" }}>
              2차년도 운영 지침에 따라, 1차년도에서 이월된 예산은 **8월 31일까지만 집행이 유효하게 인정**되며, 해당 기한 이후 미집행된 잔액은 **전액 반납하는 것이 원칙**입니다. 기한 내에 이월 예산이 우선 집행될 수 있도록 각 단위과제 실무 부서(ECC센터, ICC, RCC 등)는 집행 일정을 특별 관리해 주시기 바랍니다.
            </p>
          </div>
        </div>
      )}

      {/* 본예산 vs 이월예산 핵심 지표 현황판 (실 데이터 집계 연동) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        
        {/* 본예산 요약 */}
        <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {viewType === "total" ? "[전체] " : `[${selectedUnit}] `}본예산 집행률 현황
            </span>
            <DollarSign size={20} style={{ color: "#3B82F6" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>{activeData.mainRate}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>(누적 {activeData.mainSpent} / 총 {activeData.mainTotal})</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: activeData.mainRate, height: "100%", background: "#3B82F6", borderRadius: "4px" }}></div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#60A5FA" }}>ℹ️ 전체 12개월 중 현재 등록된 엑셀 집행 데이터 합계 누적 통계</span>
        </div>

        {/* 이월예산 요약 */}
        <div className="glass-card" style={{ 
          padding: "1.25rem", 
          borderRadius: "10px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.75rem",
          opacity: selectedYear === 1 ? 0.55 : 1,
          position: "relative"
        }}>
          {selectedYear === 1 && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.03)",
              borderRadius: "10px",
              pointerEvents: "none",
              zIndex: 2
            }} />
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {viewType === "total" ? "[전체] " : `[${selectedUnit}] `}이월예산 집행률 현황 (8/31 마감)
            </span>
            <Calendar size={20} style={{ color: selectedYear === 1 ? "var(--text-secondary)" : "#EF4444" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: selectedYear === 1 ? "var(--text-secondary)" : "#F87171" }}>
              {selectedYear === 1 ? "N/A" : activeData.carryoverRate}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {selectedYear === 1 ? "(이월배정금 없음)" : `(누적 ${activeData.carryoverSpent} / 총 ${activeData.carryoverTotal})`}
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: selectedYear === 1 ? "0%" : activeData.carryoverRate, height: "100%", background: "#EF4444", borderRadius: "4px" }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: selectedYear === 1 ? "#ef4444" : "#FCA5A5", fontWeight: selectedYear === 1 ? "800" : "normal" }}>
              {selectedYear === 1 ? "💡 1차년도는 최초 협약 연도로서 이월예산이 존재하지 않습니다." : "⚠️ 8월 31일 기한 마감 완료"}
            </span>
            {selectedYear === 2 && <span style={{ color: "var(--text-secondary)" }}>잔액 반납 예정액: <strong>{activeData.carryoverBalance}</strong></span>}
          </div>
        </div>

      </div>

      {/* 꺾은선 차트 카드 */}
      <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={18} style={{ color: "var(--accent-color)" }} />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>월별 누적 집행률 추이</h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name="executionViewType" 
                  value="total" 
                  checked={viewType === "total"}
                  onChange={() => setViewType("total")}
                  style={{ accentColor: "var(--accent-color)" }}
                />
                사업 전체
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name="executionViewType" 
                  value="unit" 
                  checked={viewType === "unit"}
                  onChange={() => setViewType("unit")}
                  style={{ accentColor: "var(--accent-color)" }}
                />
                단위과제별
              </label>
            </div>

            {viewType === "unit" && (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {unitList.map((unit) => (
                  <option key={unit} value={unit} style={{ background: "var(--background-card, #1e1e1e)", color: "var(--text-primary)" }}>
                    {unit} 과제
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        <div style={{ width: "100%", height: 260, padding: "0.5rem 0" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activeData.chartData}
              margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-secondary)" 
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              />
              {/* 좌측 Y축: 누적 집행률 (%) */}
              <YAxis 
                yAxisId="left"
                stroke="var(--text-secondary)" 
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                domain={[0, 100]}
                unit="%"
              />
              {/* 우측 Y축: 누적 집행액 (백만원) */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#60A5FA" 
                tick={{ fontSize: 11, fill: "#60A5FA" }}
                domain={[0, 'auto']}
                unit="M"
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name.includes("집행액")) {
                    return [`${value.toLocaleString()} 백만 원`, name];
                  }
                  return [`${value}%`, name];
                }}
                contentStyle={{
                  background: "rgba(224, 235, 246, 0.95)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  fontSize: "11px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
                labelStyle={{ color: "#111827", fontWeight: "700", marginBottom: "0.2rem" }}
                itemStyle={{ color: "#1f2937", padding: "0.1rem 0" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              {selectedYear !== 1 && (
                <ReferenceLine 
                  yAxisId="left"
                  x="8월" 
                  stroke="#EF4444" 
                  strokeDasharray="4 4" 
                  label={{ value: "이월마감 (8/31)", fill: "#F87171", position: "insideTopLeft", fontSize: 11, fontWeight: "bold" }}
                />
              )}
              {/* 본예산 누적 집행률 (좌측) */}
              <Line 
                yAxisId="left"
                name="본예산 누적 집행률" 
                type="monotone" 
                dataKey="mainBudget" 
                stroke="#3B82F6" 
                strokeWidth={3}
                activeDot={{ r: 6 }} 
              />
              {/* 본예산 누적 집행액 (우측, 점선) */}
              <Line 
                yAxisId="right"
                name="본예산 누적 집행액" 
                type="monotone" 
                dataKey="mainSpentAmt" 
                stroke="#60A5FA" 
                strokeWidth={2}
                strokeDasharray="5 5"
                activeDot={{ r: 4 }} 
              />
              {selectedYear !== 1 && (
                <>
                  {/* 이월예산 누적 집행률 (좌측) */}
                  <Line 
                    yAxisId="left"
                    name="이월예산 누적 집행률" 
                    type="monotone" 
                    dataKey="carryoverBudget" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    activeDot={{ r: 6 }} 
                  />
                  {/* 이월예산 누적 집행액 (우측, 점선) */}
                  <Line 
                    yAxisId="right"
                    name="이월예산 누적 집행액" 
                    type="monotone" 
                    dataKey="carryoverSpentAmt" 
                    stroke="#FCA5A5" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    activeDot={{ r: 4 }} 
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==============================================================================
          💡 [본예산 vs 이월예산 업로드 영역 탭 분리 적용]
          ============================================================================== */}
      <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            📊 월별 집행 내역 업로드 및 관리
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ShieldCheck size={14} style={{ color: "#10B981" }} />
            <span>실시간 중복 필터 및 무결성 보장 필터 탑재 완료</span>
          </span>
        </div>

        {/* 12개월 업로드 공간 그리드 영역 ('26.3월 ~ '27.2월, 1줄에 6개씩 2줄 배치) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "1rem"
        }}>
          {MONTHS_CONFIG.map((m, index) => {
            const hasCarryover = index < 6; // '26.3월 ~ '26.8월에만 이월예산 표시

            const mainMetaKey = `${selectedYear}_main_${m.label}`;
            const carryMetaKey = `${selectedYear}_carryover_${m.label}`;

            const mainMeta = uploadedFilesMeta[mainMetaKey];
            const carryMeta = uploadedFilesMeta[carryMetaKey];

            const isMainDrag = dragActive === `main-${m.value}`;
            const isCarryDrag = dragActive === `carryover-${m.value}`;

            return (
              <div
                key={m.value}
                style={{
                  background: "var(--background-card, #1c1c1e)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  minHeight: "260px",
                  transition: "all 0.2s ease",
                  justifyContent: "space-between"
                }}
              >
                {/* 월 레이블 */}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#3B82F6" }}>{m.label}</span>
                </div>

                {/* 1. 본예산 업로드 세부 영역 */}
                <div
                  onDragEnter={(e) => handleDrag(e, `main-${m.value}`)}
                  onDragOver={(e) => handleDrag(e, `main-${m.value}`)}
                  onDragLeave={(e) => handleDrag(e, null)}
                  onDrop={(e) => handleDrop(e, m.label, "main")}
                  style={{
                    flex: 1,
                    background: isMainDrag ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.02)",
                    border: isMainDrag ? "1px dashed #3B82F6" : "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "6px",
                    padding: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "0.4rem",
                    marginBottom: "0.25rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#60A5FA" }}>💰 본예산</span>
                    <span style={{ 
                      fontSize: "0.55rem", 
                      padding: "0.1rem 0.25rem", 
                      borderRadius: "3px",
                      background: mainMeta ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
                      color: mainMeta ? "#10B981" : "var(--text-secondary)",
                      fontWeight: "700"
                    }}>
                      {mainMeta ? "완료" : "미등록"}
                    </span>
                  </div>

                  {mainMeta ? (
                    <div 
                      onClick={() => {
                        setDetailModalConfig({
                          monthLabel: m.label,
                          budgetType: "main",
                          title: `💰 [${m.label} 본예산] 업로드 상세 내역`
                        });
                        setDetailModalOpen(true);
                      }}
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "0.15rem", 
                        background: "rgba(59, 130, 246, 0.12)", 
                        padding: "0.3rem 0.4rem", 
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        transition: "all 0.2s"
                      }}
                      title="클릭하여 업로드 상세 내역 보기"
                    >
                      <span style={{ fontSize: "0.6rem", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={mainMeta.fileName}>
                        📄 {mainMeta.fileName}
                      </span>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "var(--text-secondary)" }}>
                        <span>건수: <strong style={{ color: "#60A5FA" }}>{mainMeta.count}건</strong></span>
                        <span>금액: <strong style={{ color: "#60A5FA" }}>{(mainMeta.totalAmount / 10000).toFixed(0)}만</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", textAlign: "center", padding: "0.4rem 0" }}>
                      드롭 또는 업로드
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.25rem", width: "100%" }}>
                    <input
                      type="file"
                      id={`file-input-main-${m.value}`}
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileChange(e, m.label, "main")}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor={`file-input-main-${m.value}`}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "0.2rem 0",
                        fontSize: "0.6rem",
                        fontWeight: "700",
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--text-primary)",
                        borderRadius: "3px",
                        cursor: "pointer",
                        border: "1px solid rgba(255,255,255,0.1)",
                        transition: "all 0.2s"
                      }}
                    >
                      {mainMeta ? "다시 업로드" : "업로드"}
                    </label>
                    {mainMeta && (
                      <button
                        onClick={() => handleClearMonth(m.label, "main")}
                        style={{
                          padding: "0.2rem 0.35rem",
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "none",
                          color: "#F87171",
                          borderRadius: "3px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }}
                        title="본예산 초기화"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. 이월예산 업로드 세부 영역 ('26.3월 ~ '26.8월 기간에만 표시) */}
                {hasCarryover ? (
                  <div
                    onDragEnter={(e) => handleDrag(e, `carryover-${m.value}`)}
                    onDragOver={(e) => handleDrag(e, `carryover-${m.value}`)}
                    onDragLeave={(e) => handleDrag(e, null)}
                    onDrop={(e) => handleDrop(e, m.label, "carryover")}
                    style={{
                      flex: 1,
                      background: isCarryDrag ? "rgba(239, 68, 68, 0.12)" : "rgba(255,255,255,0.02)",
                      border: isCarryDrag ? "1px dashed #EF4444" : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "6px",
                      padding: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.4rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#F87171" }}>📅 이월예산</span>
                      <span style={{ 
                        fontSize: "0.55rem", 
                        padding: "0.1rem 0.25rem", 
                        borderRadius: "3px",
                        background: carryMeta ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.05)",
                        color: carryMeta ? "#F87171" : "var(--text-secondary)",
                        fontWeight: "700"
                      }}>
                        {carryMeta ? "완료" : "미등록"}
                      </span>
                    </div>

                    {carryMeta ? (
                      <div 
                        onClick={() => {
                          setDetailModalConfig({
                            monthLabel: m.label,
                            budgetType: "carryover",
                            title: `📅 [${m.label} 이월예산] 업로드 상세 내역`
                          });
                          setDetailModalOpen(true);
                        }}
                        style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: "0.15rem", 
                          background: "rgba(239, 68, 68, 0.12)", 
                          padding: "0.3rem 0.4rem", 
                          borderRadius: "4px",
                          cursor: "pointer",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          transition: "all 0.2s"
                        }}
                        title="클릭하여 업로드 상세 내역 보기"
                      >
                        <span style={{ fontSize: "0.6rem", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={carryMeta.fileName}>
                          📄 {carryMeta.fileName}
                        </span>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "var(--text-secondary)" }}>
                          <span>건수: <strong style={{ color: "#F87171" }}>{carryMeta.count}건</strong></span>
                          <span>금액: <strong style={{ color: "#F87171" }}>{(carryMeta.totalAmount / 10000).toFixed(0)}만</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", textAlign: "center", padding: "0.4rem 0" }}>
                        드롭 또는 업로드
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "0.25rem", width: "100%" }}>
                      <input
                        type="file"
                        id={`file-input-carryover-${m.value}`}
                        accept=".xlsx, .xls"
                        onChange={(e) => handleFileChange(e, m.label, "carryover")}
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor={`file-input-carryover-${m.value}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "0.2rem 0",
                          fontSize: "0.6rem",
                          fontWeight: "700",
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--text-primary)",
                          borderRadius: "3px",
                          cursor: "pointer",
                          border: "1px solid rgba(255,255,255,0.1)",
                          transition: "all 0.2s"
                        }}
                      >
                        {carryMeta ? "다시 업로드" : "업로드"}
                      </label>
                      {carryMeta && (
                        <button
                          onClick={() => handleClearMonth(m.label, "carryover")}
                          style={{
                            padding: "0.2rem 0.35rem",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "none",
                            color: "#F87171",
                            borderRadius: "3px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s"
                          }}
                          title="이월예산 초기화"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    flex: 1,
                    border: "1px dashed rgba(255,255,255,0.02)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.1)",
                    minHeight: "80px"
                  }}>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                      📅 이월 사용 불가
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ==============================================================================
          💡 [실시간 업로드 집행 내역 상세 모달]
          ============================================================================== */}
      {detailModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div className="glass-card" style={{
            width: "90%",
            maxWidth: "960px",
            maxHeight: "80vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
          }}>
            {/* 모달 헤더 */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              background: "rgba(255,255,255,0.02)"
            }}>
              <span style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--text-primary)" }}>
                {detailModalConfig.title}
              </span>
              <button 
                onClick={() => setDetailModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  outline: "none"
                }}
              >
                ✕
              </button>
            </div>

            {/* 모달 본문 (테이블 리스트) */}
            <div style={{
              padding: "1.25rem",
              overflowY: "auto",
              flex: 1
            }}>
              {(() => {
                const filtered = executionRecords.filter(r => 
                  r.month_label === detailModalConfig.monthLabel && 
                  r.budget_type === detailModalConfig.budgetType
                );

                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      상세 집행 내역 정보가 존재하지 않습니다.
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", minWidth: "850px" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>집행일자</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>프로그램 ID</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>비목명</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>적요</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>거래처</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)", textAlign: "right" }}>집행액</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>결의번호</th>
                          <th style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>담당자</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item, idx) => (
                          <tr 
                            key={idx} 
                            style={{ 
                              borderBottom: "1px solid rgba(255,255,255,0.04)", 
                              background: idx % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent"
                            }}
                          >
                            <td style={{ padding: "0.6rem 0.5rem" }}>{item.execution_date}</td>
                            <td style={{ padding: "0.6rem 0.5rem", color: "#60A5FA", fontWeight: "700" }}>{item.program_id}</td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>{item.expense_category}</td>
                            <td style={{ padding: "0.6rem 0.5rem", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.summary}>
                              {item.summary}
                            </td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>{item.client}</td>
                            <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                              {Number(item.amount).toLocaleString()}원
                            </td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>{item.resolution_no}</td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>{item.manager}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* 모달 푸터 */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0.8rem 1.5rem",
              borderTop: "1px solid var(--border-color)",
              background: "rgba(255,255,255,0.02)"
            }}>
              <button
                onClick={() => setDetailModalOpen(false)}
                style={{
                  padding: "0.45rem 1.25rem",
                  background: "var(--accent-color, #3B82F6)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  outline: "none"
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
