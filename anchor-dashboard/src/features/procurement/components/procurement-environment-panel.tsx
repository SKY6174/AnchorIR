import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowUpDown, ListFilter, Plus } from "lucide-react";
import type { ProcurementItem } from "../../../components/ProcurementManager";

type MilestoneMap = Record<string, string[]>;

interface ProcurementEnvironmentPanelProps {
  currentRole: any;
  currentUser: any;
  deptFilter: string;
  divisionFilter: string;
  envData: ProcurementItem[];
  getMilestonesFromDates: (item: ProcurementItem, activeYear: number | string) => MilestoneMap;
  getMonthIndex: (dateStr?: string | null) => number | null;
  handleSort: (field: string) => void;
  monthsOrder: string[];
  openAddModal: (type: "env" | "equip" | "service") => void;
  openEditModal: (item: ProcurementItem) => void;
  phaseWeight: Record<string, number>;
  selectedEquipUnit: string;
  selectedYear?: number | string;
  setBidModalData: Dispatch<SetStateAction<any>>;
  setDeptFilter: Dispatch<SetStateAction<string>>;
  setDivisionFilter: Dispatch<SetStateAction<string>>;
  setEnvData: Dispatch<SetStateAction<ProcurementItem[]>>;
  setProposalModalData: Dispatch<SetStateAction<any>>;
  setPurchaseModalData: Dispatch<SetStateAction<any>>;
  setSelectedEquipUnit: Dispatch<SetStateAction<string>>;
  sortDirection: string;
  sortField: string;
}

export function ProcurementEnvironmentPanel({
  currentRole,
  currentUser,
  deptFilter,
  divisionFilter,
  envData,
  getMilestonesFromDates,
  getMonthIndex,
  handleSort,
  monthsOrder,
  openAddModal,
  openEditModal,
  phaseWeight,
  selectedEquipUnit,
  selectedYear,
  setBidModalData,
  setDeptFilter,
  setDivisionFilter,
  setEnvData,
  setProposalModalData,
  setPurchaseModalData,
  setSelectedEquipUnit,
  sortDirection,
  sortField
}: ProcurementEnvironmentPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 환경개선 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🛠️ 교육환경 개선 사업 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                앵커사업을 통한 대학 특화 공간 및 스마트 첨단 강의실 구축 진행 현황
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">학과 전체</option>
                  <option value="기계공학부">기계공학부</option>
                  <option value="기계시스템전공">{"\u00A0-\u00A0기계시스템전공"}</option>
                  <option value="기계설비전공">{"\u00A0-\u00A0기계설비전공"}</option>
                  <option value="전기전자공학부">전기전자공학부</option>
                  <option value="전기전공">{"\u00A0-\u00A0전기전공"}</option>
                  <option value="스마트전자전공">{"\u00A0-\u00A0스마트전자전공"}</option>
                  <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                  <option value="컴퓨터공학과">컴퓨터공학과</option>
                  <option value="화학공학과">화학공학과</option>
                  <option value="게임영상학과">게임영상학과</option>
                  <option value="실내건축디자인과">실내건축디자인과</option>
                  <option value="융합안전공학과">융합안전공학과</option>
                  <option value="인테리어시공학과">인테리어시공학과</option>
                  <option value="간호학부">간호학부</option>
                  <option value="물리치료학과">물리치료학과</option>
                  <option value="치위생학과">치위생학과</option>
                  <option value="식품영양학과">식품영양학과</option>
                  <option value="호텔조리제빵과">호텔조리제빵과</option>
                  <option value="스포츠재활학부">스포츠재활학부</option>
                  <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                  <option value="푸드케어학과">푸드케어학과</option>
                  <option value="골프산업과">골프산업과</option>
                  <option value="반려동물보건과">반려동물보건과</option>
                  <option value="사회복지학과">사회복지학과</option>
                  <option value="유아교육과">유아교육과</option>
                  <option value="세무회계학과">세무회계학과</option>
                  <option value="사회복지상담학과">사회복지상담학과</option>
                  <option value="국제학부">국제학부</option>
                  <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                  <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                  <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                </select>
              </div>

              {/* 부서 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">부서 전체</option>
                  <optgroup label="앵커사업단 및 센터">
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="RCC센터">RCC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                  </optgroup>
                  <optgroup label="대학본부">
                    <option value="교무팀">교무팀</option>
                    <option value="교수학습지원센터">교수학습지원센터</option>
                    <option value="직업교육혁신센터">직업교육혁신센터</option>
                    <option value="교양교육혁신센터">교양교육혁신센터</option>
                    <option value="기획팀">기획팀</option>
                    <option value="대외협력실">대외협력실</option>
                    <option value="입학팀">입학팀</option>
                    <option value="진로진학지원센터">진로진학지원센터</option>
                    <option value="총무팀">총무팀</option>
                    <option value="재무회계팀">재무회계팀</option>
                    <option value="국제교류원운영팀">국제교류원운영팀</option>
                    <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                    <option value="IR센터">IR센터</option>
                  </optgroup>
                  <optgroup label="산학협력단">
                    <option value="산학기획팀">산학기획팀</option>
                    <option value="산학지원팀">산학지원팀</option>
                    <option value="창업창직교육센터">창업창직교육센터</option>
                    <option value="현장실습지원센터">현장실습지원센터</option>
                    <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="종합환경분석센터">종합환경분석센터</option>
                    <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                    <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                    <option value="이차전지연구소">이차전지연구소</option>
                    <option value="지산학혁신연구소">지산학혁신연구소</option>
                    <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                  </optgroup>
                </select>
              </div>

              {/* 전체 과제 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
                <select
                  value={selectedEquipUnit}
                  onChange={(e) => setSelectedEquipUnit(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="ALL">전체 과제</option>
                  {Number(selectedYear) === 1
                    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                  }
                </select>
              </div>



              {currentRole.id !== "GUEST" && (
                <button
                  className="action-btn"
                  onClick={() => openAddModal("env")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "9999px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  환경개선 항목 추가
                </button>
              )}
            </div>
          </div>

          {/* 💡 [교육용 한글 주석] 환경개선 절차(총 9단계)를 직관적인 가로 한 줄 스텝 프로세스 바 형태로 시각화하여 렌더링합니다. */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "800" }}>🛠️</span>
              <h4 style={{ margin: 0, fontSize: "0.8rem", fontWeight: "800", color: "var(--text-primary)" }}>교육환경 개선 추진 절차 안내</h4>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              overflowX: "auto",
              gap: "0.5rem",
              paddingBottom: "0.25rem",
              // 스크롤바 스타일링
              scrollbarWidth: "thin",
              msOverflowStyle: "none"
            }}>
              {[
                { no: "01", name: "회의 및 예산협의", dept: "시설안전 · 앵커사업단" },
                { no: "02", name: "계획서 반영 및 승인", dept: "앵커사업단 · 울산앵커" },
                { no: "03", name: "환경개선 요청", dept: "앵커사업단 ➔ 시설안전" },
                { no: "04", name: "설계협의 및 확정", dept: "시설안전 · 앵커사업단" },
                { no: "05", name: "구매신청", dept: "시설안전 ➔ 총무팀" },
                { no: "06", name: "입찰 및 계약", dept: "총무팀 (평가절차)" },
                { no: "07", name: "시공 (공사)", dept: "계약업체 · 시설안전" },
                { no: "08", name: "검수", dept: "시설 / 총무 / 앵커" },
                { no: "09", name: "집행완료", dept: "재무회계팀" }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.no}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "105px",
                    textAlign: "center",
                    flex: 1
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      background: "var(--body-bg)", // 카드의 배경색과 확실한 구분을 주기 위해 body-bg 적용
                      border: "1.5px solid var(--border-color)", // 외각 테두리를 선명하게 1.5px 보더 지정
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      width: "100%",
                      justifyContent: "center"
                    }}>
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: "800",
                        color: "var(--accent-color)",
                        background: "rgba(16, 185, 129, 0.15)",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>{step.no}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{step.name}</span>
                    </div>
                    <span style={{
                      fontSize: "0.6rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                      whiteSpace: "nowrap"
                    }}>{step.dept}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <span style={{
                      fontSize: "1rem",
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      fontWeight: "900",
                      userSelect: "none",
                      padding: "0 0.1rem"
                    }}>➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 환경개선 테이블 */}
          <div className="glass-card" style={{ padding: "0.25rem", borderRadius: "12px", overflowX: "auto", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "transparent" }}>
                  <th
                    aria-label="사업비 기준 정렬"
                    rowSpan={3}
                    onClick={() => handleSort("seq")}
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "55px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="순번 기준 정렬"
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      순번
                      <ArrowUpDown size={12} style={{ opacity: sortField === "seq" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th
                    rowSpan={3}
                    onClick={() => handleSort("unit")}
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="단위과제 기준 정렬"
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      단위과제
                      <ArrowUpDown size={12} style={{ opacity: sortField === "unit" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "130px", verticalAlign: "middle" }}>학과 / 부서</th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "270px", verticalAlign: "middle" }}>환경구축 명</th>
                  <th
                    aria-label="사업비 기준 정렬"
                    rowSpan={3}
                    onClick={() => handleSort("unitPrice")}
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "105px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="사업비 기준 정렬"
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        사업비
                        <ArrowUpDown size={12} style={{ opacity: sortField === "unitPrice" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "384px", verticalAlign: "middle" }}>구축목적 및 활용계획</th>
                  <th colSpan={12} style={{ padding: "0.5rem", textAlign: "center", fontWeight: "800", borderBottom: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.01)", lineHeight: "1.3" }}>
                    개선단계<br />
                    <span style={{ fontSize: "0.63rem", fontWeight: "normal", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>[기획∙승인(PA : 1∙2) ⇨ 요청∙설계(RD : 3∙4) ⇨ 구매∙입찰∙계약(PBC : 5∙6) ⇨ 시공(C : 7) ⇨ 검수(I : 8)]</span>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "80px", verticalAlign: "middle" }}>관련문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle" }}>제어</th>
                  )}
                </tr>
                {/* 2행: 연도 분할 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                  <th colSpan={10} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)", borderRight: "1px solid var(--border-color)" }}>
                    '{String(2024 + (Number(selectedYear) || 1)).slice(-2)}년
                  </th>
                  <th colSpan={2} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)" }}>
                    '{String(2024 + (Number(selectedYear) || 1) + 1).slice(-2)}년
                  </th>
                </tr>
                {/* 3행: 월 리스트 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.01)", borderBottom: "2px solid var(--border-color)" }}>
                  {monthsOrder.map((m, idx) => (
                    <th
                      key={m}
                      style={{
                        padding: "0.3rem 0.2rem",
                        textAlign: "center",
                        fontWeight: "800",
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        width: "36px",
                        whiteSpace: "nowrap",
                        borderRight: idx < 11 ? "1px solid var(--border-color)" : "none"
                      }}
                    >
                      {m}월
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEnvList = envData.length > 0 ? envData : [];

                  // 1) 과제 필터링
                  let filteredEnvs = selectedEquipUnit === "ALL"
                    ? activeEnvList
                    : activeEnvList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터
                  if (deptFilter) {
                    filteredEnvs = filteredEnvs.filter(e => (e.deptName || "").includes(deptFilter));
                  }
                  if (divisionFilter) {
                    filteredEnvs = filteredEnvs.filter(e => (e.divisionName || "").includes(divisionFilter));
                  }

                  // 3) 정렬 적용
                  filteredEnvs = [...filteredEnvs].sort((a, b) => {
                    let aVal = a[sortField];
                    let bVal = b[sortField];
                    if (sortField === "total") {
                      aVal = (Number(a.unitPrice) || 0) * (Number(a.quantity) || 1);
                      bVal = (Number(b.unitPrice) || 0) * (Number(b.quantity) || 1);
                    } else if (sortField === "unitPrice") {
                      aVal = Number(a.unitPrice) || 0;
                      bVal = Number(b.unitPrice) || 0;
                    } else if (sortField === "seq" || sortField === "id") {
                      aVal = Number(aVal) || 0;
                      bVal = Number(bVal) || 0;
                    }
                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  });

                  if (filteredEnvs.length === 0) {
                    return (
                      <tr>
                        <td colSpan={11 + monthsOrder.length} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          📭 등록된 교육환경 개선 사업 내역이 없습니다.
                        </td>
                      </tr>
                    );
                  }

                  return filteredEnvs.map((equip, idx) => {
                    const price = equip.unitPrice ? (equip.unitPrice / 1000000) : (equip.budgetPlan ? (equip.budgetPlan / 1000000) : 0);
                    const qty = equip.quantity || 1;
                    const _total = price * qty;

                    const idxP = getMonthIndex(equip.dateP);
                    const idxA = getMonthIndex(equip.dateA);
                    const idxB = getMonthIndex(equip.dateB);
                    const idxPr = getMonthIndex(equip.datePr);
                    const idxI = getMonthIndex(equip.dateI);

                    const activePhases = [];
                    if (idxP !== null) activePhases.push({ phase: "PA", idx: idxP, weight: phaseWeight["P"], date: equip.dateP, label: "기획∙승인", color: "#f59e0b" });
                    if (idxA !== null) activePhases.push({ phase: "RD", idx: idxA, weight: phaseWeight["A"], date: equip.dateA, label: "요청∙설계", color: "#3b82f6" });
                    if (idxB !== null) activePhases.push({ phase: "PBC", idx: idxB, weight: phaseWeight["B"], date: equip.dateB, label: "구매∙입찰∙계약", color: "#06b6d4" });
                    if (idxPr !== null) activePhases.push({ phase: "C", idx: idxPr, weight: phaseWeight["Pr"], date: equip.datePr, label: "시공", color: "#a78bfa" });
                    if (idxI !== null) activePhases.push({ phase: "I", idx: idxI, weight: phaseWeight["I"], date: equip.dateI, label: "검수", color: "#10b981" });

                    let lastActivePhase = null;
                    if (activePhases.length > 0) {
                      const sortedActive = [...activePhases].sort((a, b) => {
                        if (a.idx !== b.idx) return b.idx - a.idx;
                        return b.weight - a.weight;
                      });
                      lastActivePhase = sortedActive[0];
                    }

                    const arrowsToRender: Array<{ cellIdx: number; leftPercent: string; color: string }> = [];
                    const segments = [
                      { start: idxP, end: idxA, color: "#f59e0b" },
                      { start: idxA, end: idxB, color: "#3b82f6" },
                      { start: idxB, end: idxPr, color: "#06b6d4" },
                      { start: idxPr, end: idxI, color: "#a78bfa" }
                    ];

                    segments.forEach(seg => {
                      if (seg.start !== null && seg.end !== null && seg.start < seg.end) {
                        const pos = (seg.start + seg.end) / 2;
                        const cellIdx = Math.floor(pos);
                        const rem = pos - cellIdx;
                        const leftPercent = (rem === 0) ? "50%" : "100%";
                        arrowsToRender.push({
                          cellIdx,
                          leftPercent,
                          color: seg.color
                        });
                      }
                    });

                    return (
                      <tr
                        key={equip.id || idx}
                        style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s ease" }}
                      >
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "750", color: "var(--accent-color)" }}>
                          {equip.unit}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "600" }}>
                          {(() => {
                            const dName = equip.deptName || "";
                            const divName = equip.divisionName || "";
                            if (dName && divName) {
                              return `${dName} / ${divName}`;
                            }
                            return dName || divName || "-";
                          })()}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "700", color: "var(--text-primary)" }}>
                          {equip.title || equip.itemName || "-"}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                          {price.toFixed(2)}
                        </td>
                        <td style={{ padding: "0.8rem 0.75rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "384px" }} title={equip.purpose || equip.utilization}>
                          {(() => {
                            const purpose = equip.purpose || "-";
                            const plan = equip.utilization || "-";
                            return (
                              <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.35rem",
                                lineHeight: "1.4",
                                fontSize: "0.78rem"
                              }}>
                                <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                  <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                  <span>
                                    <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>구축목적:</strong>
                                    {purpose}
                                  </span>
                                </div>
                                <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                  <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                  <span>
                                    <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>활용계획:</strong>
                                    {plan}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        {monthsOrder.map((m, currIdx) => {
                          const dynamicMilestones = getMilestonesFromDates(equip, selectedYear || 1);
                          const stepList = dynamicMilestones[m] || [];

                          const getSegmentColorForPos = (pos: number) => {
                            if (idxP !== null && idxA !== null && pos >= idxP && pos <= idxA) return "#f59e0b";
                            if (idxA !== null && idxB !== null && pos >= idxA && pos <= idxB) return "#3b82f6";
                            if (idxB !== null && idxPr !== null && pos >= idxB && pos <= idxPr) return "#06b6d4";
                            if (idxPr !== null && idxI !== null && pos >= idxPr && pos <= idxI) return "#a78bfa";
                            return "var(--border-color)";
                          };

                          const leftColor = getSegmentColorForPos(currIdx - 0.5);
                          const rightColor = getSegmentColorForPos(currIdx + 0.5);

                          const envPhaseMap: Record<string, { code: string; label: string; color: string }> = {
                            "P": { code: "PA", label: "기획∙승인", color: "#f59e0b" },
                            "A": { code: "RD", label: "요청∙설계", color: "#3b82f6" },
                            "B": { code: "PBC", label: "구매∙입찰∙계약", color: "#06b6d4" },
                            "Pr": { code: "C", label: "시공", color: "#a78bfa" },
                            "I": { code: "I", label: "검수", color: "#10b981" }
                          };

                          const hasMilestone = stepList.length > 0;

                          const getEnvStatusText = (item: ProcurementItem) => {
                            if (item.dateI) return "검수 완료";
                            if (item.datePr) return "시공 중";
                            if (item.dateB) return "구매∙입찰∙계약 중";
                            if (item.dateA) return "요청∙설계 중";
                            if (item.dateP) return "기획∙승인 중";
                            return "준비 중";
                          };
                          const currentStatus = getEnvStatusText(equip);

                          const shouldShowBalloon = lastActivePhase && lastActivePhase.idx === currIdx;
                          let _phaseColor = "rgba(255, 255, 255, 0.2)";
                          let _phaseLabel = "";
                          let _phaseDate = "";
                          let _primaryCode = "";

                          if (hasMilestone) {
                            const rawCode = stepList[0];
                            const info = envPhaseMap[rawCode] || { code: rawCode, label: rawCode, color: "#38bdf8" };
                            _primaryCode = info.code;
                            _phaseLabel = info.label;
                            _phaseColor = info.color;
                            _phaseDate = rawCode === "P" ? (equip.dateP || "") :
                                        rawCode === "A" ? (equip.dateA || "") :
                                        rawCode === "B" ? (equip.dateB || "") :
                                        rawCode === "Pr" ? (equip.datePr || "") :
                                        equip.dateI || "";
                          }

                          const colorSet =
                            currentStatus.includes("요청") ? { bg: "#f59e0b", shadow: "rgba(245,158,11,0.4)", border: "#fbbf24" } :
                            currentStatus.includes("검토") ? { bg: "#3b82f6", shadow: "rgba(59,130,246,0.4)", border: "#60a5fa" } :
                            currentStatus.includes("설계") ? { bg: "#06b6d4", shadow: "rgba(6,182,212,0.4)", border: "#22d3ee" } :
                            currentStatus.includes("입찰") ? { bg: "#a78bfa", shadow: "rgba(167,139,250,0.4)", border: "#c084fc" } :
                            currentStatus.includes("시공") ? { bg: "#10b981", shadow: "rgba(16,185,129,0.4)", border: "#34d399" } :
                            { bg: "rgba(255, 255, 255, 0.1)", shadow: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.2)" };

                          return (
                            <td
                              key={currIdx}
                              style={{
                                padding: 0,
                                position: "relative",
                                borderRight: currIdx < 11 ? "1px solid var(--border-color)" : "none",
                                verticalAlign: "middle",
                                minWidth: "36px",
                                width: "36px"
                              }}
                            >
                              {/* 가로 진행선 (배경 선) */}
                              <div style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: "1.5px",
                                background: `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`,
                                zIndex: 0
                              }} />

                              {/* 화살표 선 흐름 기호 (구간 한가운데에 단 1개의 진행 화살표 렌더링) */}
                              {arrowsToRender
                                .filter(arr => arr.cellIdx === currIdx)
                                .map((arr, arrIdx) => (
                                  <div
                                    key={arrIdx}
                                    style={{
                                      position: "absolute",
                                      left: arr.leftPercent,
                                      top: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: 0,
                                      height: 0,
                                      borderTop: "2px solid transparent",
                                      borderBottom: "2px solid transparent",
                                      borderLeft: `4.5px solid ${arr.color}`,
                                      zIndex: 3,
                                      pointerEvents: "none"
                                    }}
                                  />
                                ))
                              }

                              {/* 두 번째 그림 스타일의 마일스톤 노드 */}
                              <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center", height: "32px" }}>
                                {shouldShowBalloon && (
                                  <div
                                    className="status-flag-balloon"
                                    style={({
                                      "--bg-color": colorSet.bg,
                                      "--shadow-color": colorSet.shadow,
                                      "--border-color": colorSet.border,
                                      bottom: "100%",
                                      marginBottom: "4px"
                                    } as React.CSSProperties)}
                                  >
                                    {currentStatus}
                                  </div>
                                )}
                                {hasMilestone && stepList.map((rawCode, sIdx) => {
                                  const info = envPhaseMap[rawCode] || { code: rawCode, label: rawCode, color: "#38bdf8" };
                                  const pCode = info.code;
                                  const pLabel = info.label;
                                  const pColor = info.color;
                                  const pDate = rawCode === "P" ? equip.dateP :
                                                rawCode === "A" ? equip.dateA :
                                                rawCode === "B" ? equip.dateB :
                                                rawCode === "Pr" ? equip.datePr :
                                                equip.dateI;
                                  return (
                                    <div
                                      key={sIdx}
                                      className="milestone-tooltip-container"
                                      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                    >
                                      <div className="milestone-tooltip" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                                        <span style={{ color: pColor, fontWeight: "900" }}>{pLabel} ({pCode})</span>
                                        <span style={{ fontSize: "0.68rem", opacity: 0.85, fontWeight: "normal" }}>{pDate || "날짜 미정"}</span>
                                      </div>

                                      <svg width="24" height="32" viewBox="0 0 24 32" style={{ overflow: "visible" }}>
                                        <defs>
                                          <filter id={`glow-${pCode}`} x="-40%" y="-40%" width="180%" height="180%">
                                            <feGaussianBlur stdDeviation="2.2" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                          </filter>
                                        </defs>
                                        <path
                                          d="M 4 7 L 12 11.5 L 20 7"
                                          fill="none"
                                          stroke={pColor}
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          opacity="0.9"
                                        />
                                        <text x="12" y="4.5" textAnchor="middle" fontSize="9" fontWeight="950" fill="var(--text-primary)" style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}>
                                          {pCode}
                                        </text>
                                        <circle cx="12" cy="17.5" r="4.5" fill={pColor} stroke="#ffffff" strokeWidth="1.5" filter={`url(#glow-${pCode})`} style={{ transition: "all 0.2s ease" }} />
                                      </svg>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}

                        {/* 관련문서 열 */}
                        <td style={{ padding: "0.8rem 0.2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                            {/* 1. 기획문서 */}
                            <button
                              onClick={() => setProposalModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#2563EB",
                                border: "1px solid rgba(59, 130, 246, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#1D4ED8";
                                e.currentTarget.style.color = "#1D4ED8";
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#1D4ED8";
                                e.currentTarget.style.color = "#1D4ED8";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                e.currentTarget.style.color = "#2563EB";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                e.currentTarget.style.color = "#2563EB";
                              }}
                              title="기획(사업단 ➔ 시설안전관리팀) 문서 요약 보기"
                            >
                              기획
                            </button>

                            {/* 2. 구매문서 */}
                            <button
                              onClick={() => setPurchaseModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "#7C3AED",
                                border: "1px solid rgba(139, 92, 246, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#6D28D9";
                                e.currentTarget.style.color = "#6D28D9";
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#6D28D9";
                                e.currentTarget.style.color = "#6D28D9";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                                e.currentTarget.style.color = "#7C3AED";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                                e.currentTarget.style.color = "#7C3AED";
                              }}
                              title="구매(시설안전관리팀) 문서 요약 보기"
                            >
                              구매
                            </button>

                            {/* 3. 결과문서 */}
                            <button
                              onClick={() => setBidModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#059669",
                                border: "1px solid rgba(16, 185, 129, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                                e.currentTarget.style.borderColor = "#047857";
                                e.currentTarget.style.color = "#047857";
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                                e.currentTarget.style.borderColor = "#047857";
                                e.currentTarget.style.color = "#047857";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
                                e.currentTarget.style.color = "#059669";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
                                e.currentTarget.style.color = "#059669";
                              }}
                              title="결과(시설안전관리팀 시공/준공) 문서 요약 보기"
                            >
                              결과
                            </button>
                          </div>
                        </td>
                        {/* 제어 열 버튼 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                              <>
                                <button
                                  onClick={() => openEditModal(equip)}
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(107, 114, 128, 0.12)",
                                    border: "1px solid rgba(107, 114, 128, 0.4)",
                                    borderRadius: "4px",
                                    color: "var(--text-primary)",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    width: "36px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                    e.currentTarget.style.color = "var(--accent-color, #2563EB)";
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                    e.currentTarget.style.color = "var(--accent-color, #2563EB)";
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.background = "rgba(107, 114, 128, 0.12)";
                                    e.currentTarget.style.borderColor = "rgba(107, 114, 128, 0.4)";
                                    e.currentTarget.style.color = "var(--text-primary)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = "rgba(107, 114, 128, 0.12)";
                                    e.currentTarget.style.borderColor = "rgba(107, 114, 128, 0.4)";
                                    e.currentTarget.style.color = "var(--text-primary)";
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("정말 이 환경개선 건을 삭제하시겠습니까?")) {
                                      setEnvData(activeEnvList.filter(e => e.id !== equip.id));
                                    }
                                  }}
                                  className="btn btn-danger"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(239, 68, 68, 0.12)",
                                    border: "1px solid rgba(239, 68, 68, 0.45)",
                                    borderRadius: "4px",
                                    color: "#DC2626",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    width: "36px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                    e.currentTarget.style.borderColor = "#B91C1C";
                                    e.currentTarget.style.color = "#B91C1C";
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                    e.currentTarget.style.borderColor = "#B91C1C";
                                    e.currentTarget.style.color = "#B91C1C";
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.45)";
                                    e.currentTarget.style.color = "#DC2626";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.45)";
                                    e.currentTarget.style.color = "#DC2626";
                                  }}
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
  );
}
