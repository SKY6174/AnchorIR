import React, { useState } from "react";
import { Check, ClipboardList, PenTool, Layers, LayoutList, Info, HelpCircle } from "lucide-react";

// 백만원 단위 포맷팅 헬퍼 함수
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Math.round(value / 1000000).toLocaleString();
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

/**
 * PDCAManager Component
 * 프로그램별 PDCA(Plan-Do-Check-Act) 단계 관리, 기획수립(Timeline, 대상, 부서),
 * 다변화 재원(국고, 시비, 외부사업비) 예산/집행 입력 및 A단계 2분할 환류 방안 검증을 담당합니다.
 */
export default function PDCAManager({
  projects,
  currentRole,
  onUpdateProgramDetails,
  selectedYear,
  selectedUnitId,
  setSelectedUnitId,
  selectedProgId,
  setSelectedProgId
}) {
  const [viewMode, setViewMode] = useState("unit"); // "unit" (단위과제별) 또는 "all" (전체)
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // P 단계 기획 및 재원 배정용 상태
  const [inputTimeline, setInputTimeline] = useState("");
  const [inputStartDate, setInputStartDate] = useState("");
  const [inputEndDate, setInputEndDate] = useState("");
  const [inputTargetAudience, setInputTargetAudience] = useState("");
  const [inputCoopDept, setInputCoopDept] = useState("");
  const [inputBudgetNational, setInputBudgetNational] = useState("");
  const [inputBudgetCity, setInputBudgetCity] = useState("");
  const [inputBudgetExternal, setInputBudgetExternal] = useState("");

  // D 단계 집행 실적용 상태 (재원별 분리)
  const [inputSpentNational, setInputSpentNational] = useState("");
  const [inputSpentCity, setInputSpentCity] = useState("");
  const [inputSpentExternal, setInputSpentExternal] = useState("");

  // C 단계 실적용 상태 (집행액 제외, 이수인원 및 만족도만 관리)
  const [inputParticipants, setInputParticipants] = useState("");
  const [inputSatisfaction, setInputSatisfaction] = useState("");

  // A 단계 2분할 환류 방안용 상태
  const [inputEvalType, setInputEvalType] = useState("우수"); // "우수" 또는 "미흡"
  const [inputExcellent, setInputExcellent] = useState("");
  const [inputImprovePlan, setInputImprovePlan] = useState("");
  const [inputDeficiency, setInputDeficiency] = useState("");
  const [inputActionItem, setInputActionItem] = useState("");

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

  // 연구원 권한 필터링 (본인 담당 세부과제만 노출)
  const isResearcher = currentRole.id === "RESEARCHER";

  const unitFilteredPrograms = allPrograms.filter((p) => {
    const matchesUnit = p.unitId === selectedUnitId;
    if (isResearcher) {
      return matchesUnit && p.assignee.includes(currentRole.name.split(" ")[0]);
    }
    return matchesUnit;
  });

  const allFilteredPrograms = isResearcher
    ? allPrograms.filter((p) => p.assignee.includes(currentRole.name.split(" ")[0]))
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
        setInputCoopDept(prog.coopDept || "");
        
        setInputBudgetNational(py.budget_national !== undefined ? formatNumberWithCommas(Math.round(py.budget_national / 1000)) : "0");
        setInputBudgetCity(py.budget_city !== undefined ? formatNumberWithCommas(Math.round(py.budget_city / 1000)) : "0");
        setInputBudgetExternal(py.budget_external !== undefined ? formatNumberWithCommas(Math.round(py.budget_external / 1000)) : "0");

        setInputSpentNational(formatNumberWithCommas(py.spent_national ?? 0));
        setInputSpentCity(formatNumberWithCommas(py.spent_city ?? 0));
        setInputSpentExternal(formatNumberWithCommas(py.spent_external ?? 0));

        setInputParticipants(String(prog.participants ?? 0));
        setInputSatisfaction(String(prog.satisfaction ?? 0));

        setInputEvalType(prog.evalType || "우수");
        setInputExcellent(prog.excellent || "");
        setInputImprovePlan(prog.improvePlan || "");
        setInputDeficiency(prog.deficiency || "");
        setInputActionItem(prog.actionItem || "");
      }
    } else {
      setInputTimeline("");
      setInputStartDate("");
      setInputEndDate("");
      setInputTargetAudience("");
      setInputCoopDept("");
      setInputBudgetNational("");
      setInputBudgetCity("");
      setInputBudgetExternal("");
      setInputSpentNational("");
      setInputSpentCity("");
      setInputSpentExternal("");
      setInputParticipants("");
      setInputSatisfaction("");
      setInputExcellent("");
      setInputImprovePlan("");
      setInputDeficiency("");
      setInputActionItem("");
    }
  }, [selectedProgId, selectedYear]);

  // 추진일정 변경 이벤트 핸들러
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

    if (status === "완료") {
      if (stage === "p") {
        // P 완료 검증: 예산 기재 및 Timeline, 참여대상, 연계부서 기재 필수
        if (budgetMain <= 0) {
          alert(`[검증 실패] P(Plan) 단계를 완료하려면 재원 예산(국고/시비/외부)이 0원 초과 배정되어야 합니다. (현재 총 예산: 0원)`);
          return;
        }
        if (!timeline.trim() || !targetAudience.trim() || !coopDept.trim()) {
          alert(`[검증 실패] P(Plan) 단계를 완료하려면 기획 정보(Timeline, 참여대상, 연계부서)가 모두 기재되어야 합니다.`);
          return;
        }
      } else if (stage === "d") {
        // D 완료 검증: 실제 예산 집행이 한 푼이라도 있어야 함
        if (spentMain <= 0) {
          alert(`[검증 실패] D(Do) 단계를 완료하려면 실제 세부 집행 실적이 기재되어야 합니다. (현재 집행액 합계: 0원)`);
          return;
        }
      } else if (stage === "c") {
        // C 완료 검증: 실집행액은 검증에서 제외, 이수인원과 만족도 점수가 기재되었는지만 확인!
        if (participants <= 0 || satisfaction <= 0) {
          alert(`[검증 실패] C(Check) 단계를 완료하려면 이수인원(0명 초과)과 만족도(0% 초과)가 반드시 기재되어야 합니다.`);
          return;
        }
      } else if (stage === "a") {
        // A 완료 검증: 우수/미흡 평가 구분에 따른 2가지 세부 사항 기재 필수
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

    const newPdca = { ...activeProg.pdca, [stage]: status };
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

    const bNational = parseNumberFromCommas(inputBudgetNational) * 1000;
    const bCity = parseNumberFromCommas(inputBudgetCity) * 1000;
    const bExternal = parseNumberFromCommas(inputBudgetExternal) * 1000;

    if (bNational < 0 || bCity < 0 || bExternal < 0) {
      alert("배정 예산은 0원 이상의 올바른 숫자 형식이어야 합니다.");
      return;
    }

    if (!inputTimeline.trim() || !inputTargetAudience.trim() || !inputCoopDept.trim()) {
      alert("Timeline, 참여대상, 연계부서 기획 정보를 기입해주세요.");
      return;
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      timeline: inputTimeline,
      targetAudience: inputTargetAudience,
      coopDept: inputCoopDept,
      budget_national: bNational,
      budget_city: bCity,
      budget_external: bExternal
    });

    setFeedbackMsg("P 단계 기획 정보 및 세부 재원별 예산 배정이 적용되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // D 단계 세부 재원별 집행 실적 입력 (한도 검사 포함)
  const handleUpdateBudget = (e) => {
    e.preventDefault();
    if (!activeProg) return;

    const sNational = parseNumberFromCommas(inputSpentNational);
    const sCity = parseNumberFromCommas(inputSpentCity);
    const sExternal = parseNumberFromCommas(inputSpentExternal);

    if (sNational < 0 || sCity < 0 || sExternal < 0) {
      alert("집행액은 0원 이상의 올바른 숫자 형식이어야 합니다.");
      return;
    }

    const py = activeProg.years?.[selectedYear] || {};
    const bNational = py.budget_national || 0;
    const bCity = py.budget_city || 0;
    const bExternal = py.budget_external || 0;

    // 개별 재원별 배정 예산 초과 방지 밸리데이션
    if (sNational > bNational) {
      alert(`[오류] 국고 집행액(${formatToMillionWon(sNational)}백만원)이 배정된 국고 예산 한도(${formatToMillionWon(bNational)}백만원)를 초과할 수 없습니다.`);
      return;
    }
    if (sCity > bCity) {
      alert(`[오류] 시비 집행액(${formatToMillionWon(sCity)}백만원)이 배정된 시비 예산 한도(${formatToMillionWon(bCity)}백만원)를 초과할 수 없습니다.`);
      return;
    }
    if (sExternal > bExternal) {
      alert(`[오류] 외부사업비 집행액(${formatToMillionWon(sExternal)}백만원)이 배정된 외부 예산 한도(${formatToMillionWon(bExternal)}백만원)를 초과할 수 없습니다.`);
      return;
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      spent_national: sNational,
      spent_city: sCity,
      spent_external: sExternal
    });

    setFeedbackMsg("D 단계 재원별 집행 실적이 안전하게 대시보드 모델에 연동되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // C 단계 실적 입력 (실집행액 제외, 이수인원/만족도 기입)
  const handleUpdateCDetails = (e) => {
    e.preventDefault();
    if (!activeProg) return;

    const parsedParticipants = parseInt(inputParticipants, 10);
    const parsedSatisfaction = parseFloat(inputSatisfaction);

    if (isNaN(parsedParticipants) || parsedParticipants < 0) {
      alert("올바른 숫자 형식의 이수인원을 입력해주세요.");
      return;
    }
    if (isNaN(parsedSatisfaction) || parsedSatisfaction < 0 || parsedSatisfaction > 100) {
      alert("만족도는 0~100 사이의 숫자로 입력해주세요.");
      return;
    }

    onUpdateProgramDetails(activeProg.unitId, activeProg.id, {
      participants: parsedParticipants,
      satisfaction: parsedSatisfaction
    });

    setFeedbackMsg("C 단계 성과 실적(이수인원, 만족도)이 안전하게 저장되었습니다.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // A 단계자체 평가 및 환류 2분할 방안 저장
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
                    {u.id === "Common" ? "" : `${u.id} `}{u.title}
                  </option>
                ))}
              </select>
            </div>

            <h4 style={{ fontSize: "0.9rem", fontWeight: "800", borderTop: "1px solid var(--border-color-dark)", paddingTop: "1rem" }}>소속 프로그램 목록</h4>
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
                      <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>{prog.assignee}</span>
                    </div>
                    <h5 style={{ fontSize: "0.8rem", fontWeight: "700", lineHeight: "1.3" }}>{prog.title}</h5>
                  </div>
                ))
              )}
            </div>
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
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem" }}>PDCA 단계 상태 설정</h4>
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
                              style={{ fontSize: "0.65rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem", marginTop: "0.2rem" }}
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

                {/* P 단계: 기획 정보 수립 & 예산 세부 배정 */}
                {(isResearcher || currentRole.rank <= 2) && (
                  <form onSubmit={handleUpdatePDetails} style={{ padding: "0.75rem", background: "rgba(59,130,246,0.02)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.6rem", color: "var(--accent-color)" }}>P 단계: 예산 기획 및 세부 추진계획</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>국고 예산 (천원)</span>
                          <input type="text" className="user-selector" value={inputBudgetNational} onChange={(e) => setInputBudgetNational(formatNumberWithCommas(e.target.value))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>지자체 시비 (천원)</span>
                          <input type="text" className="user-selector" value={inputBudgetCity} onChange={(e) => setInputBudgetCity(formatNumberWithCommas(e.target.value))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>외부사업비 (천원)</span>
                          <input type="text" className="user-selector" value={inputBudgetExternal} onChange={(e) => setInputBudgetExternal(formatNumberWithCommas(e.target.value))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }} />
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.15rem" }}>추진 일정 (Timeline)</span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.4rem", alignItems: "center" }}>
                          <input
                            type="date"
                            className="user-selector"
                            value={inputStartDate}
                            onChange={(e) => handleTimelineChange(e.target.value, inputEndDate)}
                            style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem", width: "100%" }}
                          />
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>~</span>
                          <input
                            type="date"
                            className="user-selector"
                            value={inputEndDate}
                            onChange={(e) => handleTimelineChange(inputStartDate, e.target.value)}
                            style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem", background: "#18181b", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem", width: "100%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>참여 대상 (Target)</span>
                        <input type="text" className="user-selector" placeholder="예: 재학생 및 매칭기업 임직원" value={inputTargetAudience} onChange={(e) => setInputTargetAudience(e.target.value)} style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>연계 부서 (Cooperation Dept)</span>
                        <input type="text" className="user-selector" placeholder="예: ICC센터 및 지역 협의체" value={inputCoopDept} onChange={(e) => setInputCoopDept(e.target.value)} style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem" }} />
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: "0.3rem" }}>P 기획 정보 저장</button>
                    </div>
                  </form>
                )}

                {/* D 단계: 세부 재원별 집행 등록 */}
                {(isResearcher || currentRole.rank <= 2) && activeProg.pdca.p === "완료" && (
                  <form onSubmit={handleUpdateBudget} style={{ padding: "0.75rem", background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "var(--accent-color)" }}>D 단계: 세부 재원별 본집행액 입력</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>국고 집행</span>
                          <input type="text" className="user-selector" value={inputSpentNational} onChange={(e) => setInputSpentNational(formatNumberWithCommas(e.target.value))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>시비 집행</span>
                          <input type="text" className="user-selector" value={inputSpentCity} onChange={(e) => setInputSpentCity(formatNumberWithCommas(e.target.value))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>외부 집행</span>
                          <input type="text" className="user-selector" value={inputSpentExternal} onChange={(e) => setInputSpentExternal(formatNumberWithCommas(e.target.value))} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }} />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: "0.2rem" }}>D 집행 실적 저장</button>
                    </div>
                  </form>
                )}

                {/* C 단계: 집행액 제외 성과 실적 입력 */}
                {(isResearcher || currentRole.rank <= 2) && activeProg.pdca.d === "완료" && (
                  <form onSubmit={handleUpdateCDetails} style={{ padding: "0.75rem", background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "var(--success-color)" }}>C 단계: 운영 성과 실적 입력</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="text" className="user-selector" placeholder="이수인원 수" value={inputParticipants} onChange={(e) => setInputParticipants(e.target.value)} style={{ flexGrow: 1 }} />
                        <span style={{ fontSize: "0.75rem", width: "45px" }}>이수(명)</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="text" className="user-selector" placeholder="만족도" value={inputSatisfaction} onChange={(e) => setInputSatisfaction(e.target.value)} style={{ flexGrow: 1 }} />
                        <span style={{ fontSize: "0.75rem", width: "45px" }}>만족(%)</span>
                      </div>
                      <button type="submit" className="btn-primary" style={{ background: "var(--success-color)" }}>C 성과 적용</button>
                    </div>
                  </form>
                )}

                {/* A 단계: 환류 2분할 자체평가 */}
                {(isResearcher || currentRole.rank <= 2) && activeProg.pdca.c === "완료" && (
                  <form onSubmit={handleUpdateA} style={{ padding: "0.75rem", background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "0.5rem", color: "var(--warning-color)" }}>A 단계: 사업 환류 및 자체평가</h4>
                    
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
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
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>우수한 점</span>
                          <textarea className="user-selector" rows={2} value={inputExcellent} onChange={(e) => setInputExcellent(e.target.value)} placeholder="프로그램 운영 중 창출된 우수한 성과 및 성료 요인을 기록하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>발전방안</span>
                          <textarea className="user-selector" rows={2} value={inputImprovePlan} onChange={(e) => setInputImprovePlan(e.target.value)} placeholder="우수한 성과를 타 프로그램으로 확산하거나 차년도에 더욱 발전시킬 방안을 기입하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem" }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>미비점</span>
                          <textarea className="user-selector" rows={2} value={inputDeficiency} onChange={(e) => setInputDeficiency(e.target.value)} placeholder="운영상의 한계, 예산 집행 차질, 혹은 목표 달성 미달의 주원인을 파악하여 입력하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>개선사항</span>
                          <textarea className="user-selector" rows={2} value={inputActionItem} onChange={(e) => setInputActionItem(e.target.value)} placeholder="발견된 미비점을 극복하고 차년도 계획 시 보완 및 구조조정할 대책을 기입하세요." style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem" }} />
                        </div>
                      </div>
                    )}
                    <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", background: "var(--warning-color)" }}>A 환류 방안 저장</button>
                  </form>
                )}

                {feedbackMsg && (
                  <div style={{ padding: "0.5rem", background: "rgba(16,185,129,0.1)", border: "1px solid var(--success-color)", borderRadius: "0.5rem", color: "#34d399", fontSize: "0.75rem", textAlign: "center" }}>
                    {feedbackMsg}
                  </div>
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
                  <th>ID</th>
                  <th>프로그램명</th>
                  <th>소속 과제</th>
                  <th>담당자</th>
                  <th>{selectedYear}차년도 본예산 (백만원)</th>
                  <th>{selectedYear}차년도 본집행 (백만원)</th>
                  <th>PDCA 현황</th>
                  <th style={{ width: "90px" }}>실적 등록</th>
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
                      <td style={{ fontWeight: "700", color: "var(--accent-color)" }}>{prog.assignee}</td>
                      <td style={{ fontFamily: "var(--font-data)" }}>{formatToMillionWon(py.budget_main)}백만원</td>
                      <td style={{ fontFamily: "var(--font-data)" }}>{formatToMillionWon(py.spent_main)}백만원</td>
                      <td>
                        <span style={{ display: "flex", gap: "0.2rem", fontSize: "0.65rem", fontFamily: "var(--font-data)" }}>
                          <span style={{ color: prog.pdca.p === "완료" ? "var(--success-color)" : "inherit" }}>P:{prog.pdca.p}</span>
                          <span style={{ color: prog.pdca.d === "완료" ? "var(--success-color)" : "inherit" }}>D:{prog.pdca.d}</span>
                          <span style={{ color: prog.pdca.c === "완료" ? "var(--success-color)" : "inherit" }}>C:{prog.pdca.c}</span>
                          <span style={{ color: prog.pdca.a === "완료" ? "var(--success-color)" : "inherit" }}>A:{prog.pdca.a}</span>
                        </span>
                      </td>
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
    </div>
  );
}
