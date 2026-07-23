import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowUpDown, ListFilter, Plus } from "lucide-react";
import type { ProcurementItem } from "../../../components/ProcurementManager";

interface ProcurementEquipmentPanelProps {
  currentRole: any;
  currentUser: any;
  darkMode: boolean;
  deptFilter: string;
  divisionFilter: string;
  equipData: ProcurementItem[];
  formatToMillionWon: (value?: number | null) => string;
  handleSort: (field: string) => void;
  openAddModal: (type: "env" | "equip" | "service") => void;
  openEditModal: (item: ProcurementItem) => void;
  selectedEquipUnit: string;
  selectedYear?: number | string;
  setBidModalData: Dispatch<SetStateAction<any>>;
  setDeptFilter: Dispatch<SetStateAction<string>>;
  setDivisionFilter: Dispatch<SetStateAction<string>>;
  setEquipData: Dispatch<SetStateAction<ProcurementItem[]>>;
  setProposalModalData: Dispatch<SetStateAction<any>>;
  setPurchaseModalData: Dispatch<SetStateAction<any>>;
  setSelectedEquipUnit: Dispatch<SetStateAction<string>>;
  sortDirection: string;
  sortField: string;
}

export function ProcurementEquipmentPanel({
  currentRole,
  currentUser,
  darkMode,
  deptFilter,
  divisionFilter,
  equipData,
  formatToMillionWon,
  handleSort,
  openAddModal,
  openEditModal,
  selectedEquipUnit,
  selectedYear,
  setBidModalData,
  setDeptFilter,
  setDivisionFilter,
  setEquipData,
  setProposalModalData,
  setPurchaseModalData,
  setSelectedEquipUnit,
  sortDirection,
  sortField
}: ProcurementEquipmentPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 기자재 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🔬 기자재 구입 및 운영 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                단위과제별 교육/연구용 핵심 기자재의 계획·집행 및 실적 관리
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 (요건 1: 모달창과 동일한 고정 전체 학과 목록 맵핑) */}
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

              {/* 부서 필터 (요건 1: 모달창과 동일한 고정 전체 본부/산단 하위 부서 목록 맵핑 및 사업단 최상단 배치) */}
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

              {/* 단위과제 필터 */}
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
                  onClick={() => openAddModal("equip")}
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
                  기자재 추가
                </button>
              )}
            </div>
          </div>

          {/* 💡 [교육용 한글 주석] 기자재 구입 및 운영 절차를 시각적으로 보여주는 가로 흐름 스텝바를 배치합니다. */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔬</span>
              <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "800", color: "var(--text-primary)" }}>기자재 구입 및 운영 절차 안내</h4>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              overflowX: "auto",
              paddingBottom: "0.25rem",
              scrollbarWidth: "thin",
              msOverflowStyle: "none"
            }}>
              {[
                { no: "01", name: "수요조사", dept: "앵커사업단 · 학부(과)", desc: "행정용 / 학부(과)용", tooltip: "수요조사\n- 행정용\n- 학부(과)용" },
                { no: "02", name: "계획수립", dept: "앵커사업단", desc: "사업계획서 반영", tooltip: "사업계획 및 부서 필요 기자재 반영 수립" },
                { no: "03", name: "앵커기획위원회", dept: "앵커사업단", desc: "자체 심의", tooltip: "앵커기획위원회 자체 심의" },
                { no: "04", name: "금액별 심의/승인", dept: "앵커 ➔ 울산/중앙", desc: "금액별 분기 심의", tooltip: "💡 금액별 심의/승인 상세 절차:\n• 3천만원 미만: 자체심의\n• 3천만원 이상: 울산앵커센터 사전승인\n• 1억원 이상: 울산앵커센터 사전보고 & 중앙앵커센터 승인신청 및 사전승인" },
                { no: "05", name: "선정위원회 승인", dept: "앵커 ➔ 교무팀", desc: "기자재선정위 승인", tooltip: "학부(과) 기자재 대상: 앵커사업단 요청 ➔ 교무팀 개최" },
                { no: "06", name: "결재 및 구매신청", dept: "앵커사업단", desc: "시설팀 / 교무팀 경유", tooltip: "내부결재 및 구매신청\n- 행정용 : 시설팀 경유\n- 학부(과)용 : 교무팀 경유" },
                { no: "07", name: "입찰 / 수의계약", dept: "총무팀", desc: "계약 및 조달", tooltip: "총무팀을 경유한 입찰 또는 수의계약 체결" },
                { no: "08", name: "검수 및 입고", dept: "시설/교무/앵커/총무", desc: "현물 대조 검수", tooltip: "납품 기자재에 대한 실물 검수 및 입고 처리" },
                { no: "09", name: "집행완료", dept: "재무회계팀", desc: "최종 예산 지출", tooltip: "재무회계팀 최종 집행 및 지출 결의 완료" },
                { no: "10", name: "기자재 운영/관리", dept: "자산부서 · 앵커사업단", desc: "대장 등재 및 관리", tooltip: "각 자산관리부서 및 앵커사업단 자산 대장 등재 및 모니터링" }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.no}>
                  <div
                    title={step.tooltip}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "120px",
                      textAlign: "center",
                      flex: 1,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      background: step.no === "04" ? "rgba(16, 185, 129, 0.12)" : "var(--body-bg)", // 확실한 대비를 위해 body-bg 적용
                      border: step.no === "04" ? "1.5px solid var(--accent-color)" : "1.5px solid var(--border-color)", // 1.5px로 외곽선 보강
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      width: "100%",
                      justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}>
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: "800",
                        color: step.no === "04" ? "white" : "var(--accent-color)",
                        background: step.no === "04" ? "var(--accent-color)" : "rgba(16, 185, 129, 0.15)",
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
                    <span style={{
                      fontSize: "0.55rem",
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      marginTop: "0.05rem",
                      whiteSpace: "nowrap"
                    }}>{step.desc}</span>
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

          {/* 기자재 리스트 (스프레드시트 스타일 표 뷰) */}
          <div className="glass-card" style={{ padding: "0.5rem", borderRadius: "10px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)", minWidth: "1200px" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border-color)" }}>
                  <th
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
                    onClick={() => handleSort("unit")}
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="과제 기준 정렬"
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      과제
                      <ArrowUpDown size={12} style={{ opacity: sortField === "unit" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "130px", verticalAlign: "middle" }}>학과 / 부서</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "200px", verticalAlign: "middle" }}>품명</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "160px", verticalAlign: "middle" }}>규격</th>
                  <th
                    aria-label="단가 기준 정렬"
                    onClick={() => handleSort("unitPrice")}
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "95px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="단가 기준 정렬"
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        단가
                        <ArrowUpDown size={12} style={{ opacity: sortField === "unitPrice" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "45px", verticalAlign: "middle" }}>단위</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px", verticalAlign: "middle" }}>수량</th>
                  <th
                    aria-label="금액 기준 정렬"
                    onClick={() => handleSort("total")}
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "105px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="금액 기준 정렬"
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        금액
                        <ArrowUpDown size={12} style={{ opacity: sortField === "total" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "720px", verticalAlign: "middle" }}>구입목적 및 활용계획</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "500px", whiteSpace: "nowrap" }}>
                    구매 절차
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "500", marginTop: "0.15rem" }}>
                      [기획∙승인(PA : 1~5) ⇨ 구매신청(Pr : 6) ⇨ 입찰∙계약(BC : 7) ⇨ 검수(I : 8)]
                    </span>
                  </th>
                  <th style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "48px", verticalAlign: "middle", lineHeight: "1.2" }}>관련<br />문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "48px", verticalAlign: "middle" }}>제어</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEquipList = equipData;

                  // 1) 과제 필터링
                  let filteredEquips = selectedEquipUnit === "ALL"
                    ? activeEquipList
                    : activeEquipList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터 이원화 적용 (요건 3 AND 연산 연계)
                  if (deptFilter) {
                    filteredEquips = filteredEquips.filter(e => {
                      const dName = e.deptName || "";
                      return dName.includes(deptFilter);
                    });
                  }
                  if (divisionFilter) {
                    filteredEquips = filteredEquips.filter(e => {
                      const divName = e.divisionName || "";
                      return divName.includes(divisionFilter);
                    });
                  }

                  // 3) 순번, 과제, 단가, 금액 정렬 적용 (사용자 요건 3 대응)
                  filteredEquips = [...filteredEquips].sort((a, b) => {
                    let aVal = a[sortField];
                    let bVal = b[sortField];

                    if (sortField === "total") {
                      aVal = (Number(a.unitPrice) || 0) * (Number(a.quantity) || 1);
                      bVal = (Number(b.unitPrice) || 0) * (Number(b.quantity) || 1);
                    } else if (sortField === "unitPrice") {
                      aVal = Number(a.unitPrice) || 0;
                      bVal = Number(b.unitPrice) || 0;
                    } else if (sortField === "seq" || sortField === "id") {
                      aVal = Number(a.seq || a.id) || 0;
                      bVal = Number(b.seq || b.id) || 0;
                    } else {
                      aVal = String(aVal || "");
                      bVal = String(bVal || "");
                    }

                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  });

                  if (filteredEquips.length > 0) {
                    return filteredEquips.map((equip, idx) => {
                      const price = Number(equip.unitPrice) || 0;
                      const qty = Number(equip.quantity) || 0;
                      const total = price * qty;

                      const getEquipStatus = (eq: ProcurementItem) => {
                        if (!eq.dateP && !eq.datePr && !eq.dateB && !eq.dateI) {
                          return "준비중";
                        }
                        const todayStr = new Date().toISOString().substring(0, 10);
                        if (eq.dateI && todayStr >= eq.dateI) return "구매 완료";
                        if (eq.dateB && todayStr >= eq.dateB) return "입찰중";
                        if (eq.datePr && todayStr >= eq.datePr) return "구매중";
                        if (eq.dateP && todayStr >= eq.dateP) return "결재중";
                        if (eq.dateP && todayStr < eq.dateP) return "준비중";

                        if (eq.dateI) return "구매 완료";
                        if (eq.dateB) return "입찰중";
                        if (eq.datePr) return "구매중";
                        if (eq.dateP) return "결재중";
                        return "준비중";
                      };

                      const _currentStatus = getEquipStatus(equip);

                      const monthsOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"];
                      const getMonthIndexLocal = (dateStr?: string) => {
                        if (!dateStr) return null;
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return null;
                        const baseYear = 2024 + Number(selectedYear || 1);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        const isCurrentYearPart = (month >= 3 && month <= 12 && year === baseYear);
                        const isNextYearPart = ((month === 1 || month === 2) && year === baseYear + 1);
                        if (isCurrentYearPart || isNextYearPart) {
                          return monthsOrder.indexOf(String(month));
                        }
                        return null;
                      };

                      const idxP = getMonthIndexLocal(equip.dateP);
                      const idxPr = getMonthIndexLocal(equip.datePr);
                      const idxB = getMonthIndexLocal(equip.dateB);
                      const idxI = getMonthIndexLocal(equip.dateI);

                      const _getPhaseColor = (code: string) => {
                        const colors: Record<string, string> = {
                          "PA": "#f59e0b",
                          "Pr": "#a78bfa",
                          "BC": "#06b6d4",
                          "I": "#10b981"
                        };
                        return colors[code] || "#38bdf8";
                      };

                      const _getPhaseLabel = (code: string) => {
                        const labels: Record<string, string> = {
                          "PA": "기획∙승인",
                          "Pr": "구매신청",
                          "BC": "입찰∙계약",
                          "I": "검수"
                        };
                        return labels[code] || "미정";
                      };

                      const activePhases = [];
                      const phaseWeightLocal = { "PA": 1, "Pr": 2, "BC": 3, "I": 4 };
                      if (idxP !== null) activePhases.push({ phase: "PA", idx: idxP, weight: phaseWeightLocal["PA"], date: equip.dateP, label: "기획∙승인", color: "#f59e0b" });
                      if (idxPr !== null) activePhases.push({ phase: "Pr", idx: idxPr, weight: phaseWeightLocal["Pr"], date: equip.datePr, label: "구매신청", color: "#a78bfa" });
                      if (idxB !== null) activePhases.push({ phase: "BC", idx: idxB, weight: phaseWeightLocal["BC"], date: equip.dateB, label: "입찰∙계약", color: "#06b6d4" });
                      if (idxI !== null) activePhases.push({ phase: "I", idx: idxI, weight: phaseWeightLocal["I"], date: equip.dateI, label: "검수", color: "#10b981" });

                      let _lastActivePhase = null;
                      if (activePhases.length > 0) {
                        const sortedActive = [...activePhases].sort((a, b) => {
                          if (a.idx !== b.idx) return b.idx - a.idx;
                          return b.weight - a.weight;
                        });
                        _lastActivePhase = sortedActive[0];
                      }

                      const arrowsToRender = [];
                      const segments = [
                        { start: idxP, end: idxPr, color: "#f59e0b" },
                        { start: idxPr, end: idxB, color: "#a78bfa" },
                        { start: idxB, end: idxI, color: "#06b6d4" }
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
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "750", color: "var(--accent-color)" }}>
                            {equip.unit}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "600" }}>
                            {(() => {
                              const dName = equip.deptName || "";
                              const divName = equip.divisionName || "";
                              if (dName && divName) {
                                return `${dName} / ${divName}`;
                              }
                              return dName || divName || "-";
                            })()}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", color: "var(--text-primary)", fontSize: "0.82rem" }}>
                            {equip.itemName || equip.name || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", fontSize: "0.78rem" }} title={equip.spec}>
                            {equip.spec || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-primary)", fontWeight: "600" }}>
                            {formatToMillionWon(price)}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                            {equip.itemUnit || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-primary)", fontWeight: "600" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", color: darkMode ? "#34d399" : "#059669" }}>
                            {formatToMillionWon(total)}
                          </td>
                          <td style={{ padding: "0.8rem 0.75rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", width: "720px" }} title={equip.description || equip.opPlan}>
                            {(() => {
                              // 개행으로 구분된 데이터를 구입목적과 활용계획으로 쪼갭니다 (요구사항 3)
                              const text = equip.description || equip.opPlan || "";
                              const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);
                              const purpose = lines[0] || "-";
                              const plan = lines[1] || "-";
                              return (
                                <div style={{
                                  display: "inline-flex",
                                  flexDirection: "column",
                                  gap: "0.35rem",
                                  lineHeight: "1.4",
                                  fontSize: "0.78rem",
                                  textAlign: "left"
                                }}>
                                  <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                    <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                    <span>
                                      <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>구입목적:</strong>
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

                          {/* 7. 구매 절차 가로 마일스톤 노드 (요청: 주요 용역과 같은 모양의 그림으로 변경) */}
                          <td style={{ padding: "0.8rem 0.5rem", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}>
                              {[
                                { dateKey: "dateP", label: "기획∙승인", code: "PA", colorLight: "#d97706", colorDark: "#f59e0b", bgLight: "#fef3c7", bgDark: "rgba(245, 158, 11, 0.2)" },
                                { dateKey: "datePr", label: "구매신청", code: "Pr", colorLight: "#1d4ed8", colorDark: "#60a5fa", bgLight: "#dbeafe", bgDark: "rgba(59, 130, 246, 0.2)" },
                                { dateKey: "dateB", label: "입찰∙계약", code: "BC", colorLight: "#7c3aed", colorDark: "#c084fc", bgLight: "#f3e8ff", bgDark: "rgba(167, 139, 250, 0.2)" },
                                { dateKey: "dateI", label: "검수", code: "I", colorLight: "#059669", colorDark: "#34d399", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" }
                              ].map((step, sIdx) => {
                                const hasDate = !!equip[step.dateKey];
                                const rawDate = equip[step.dateKey]; // YYYY-MM-DD
                                let formattedDate = "";
                                if (hasDate && rawDate.includes("-")) {
                                  const parts = rawDate.split("-");
                                  formattedDate = `${parts[1]}.${parts[2]}`; // MM.DD 포맷
                                }

                                const activeColor = darkMode ? step.colorDark : step.colorLight;
                                const activeBg = darkMode ? step.bgDark : step.bgLight;

                                return (
                                  <React.Fragment key={step.code}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "46px" }}>
                                      <div
                                        style={{
                                          padding: "0.22rem 0.45rem",
                                          borderRadius: "14px",
                                          fontSize: "0.68rem",
                                          fontWeight: "800",
                                          background: hasDate ? activeBg : (darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(113, 113, 122, 0.08)"),
                                          color: hasDate ? activeColor : "var(--text-secondary)",
                                          border: hasDate ? `1.5px solid ${activeColor}55` : "1.5px solid var(--border-color)",
                                          whiteSpace: "nowrap",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          boxShadow: hasDate ? `0 1px 3px ${activeColor}15` : "none",
                                          transition: "all 0.2s ease"
                                        }}
                                        title={`${step.label}(${step.code}) ${hasDate ? `: ${rawDate}` : "(미지정)"}`}
                                      >
                                        <span>{step.code}</span>
                                      </div>
                                      <span style={{ fontSize: "0.62rem", color: hasDate ? "var(--text-primary)" : "var(--text-secondary)", marginTop: "0.2rem", fontWeight: hasDate ? "800" : "normal" }}>
                                        {hasDate ? formattedDate : "-"}
                                      </span>
                                    </div>
                                    {sIdx < 3 && (
                                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: "900", opacity: 0.35 }}>➔</span>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </td>

                          <td style={{ padding: "0.8rem 0.2rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", width: "48px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                              {/* 1. 기획문서 버튼 (파란색 테마) */}
                              <button
                                onClick={() => setProposalModalData(equip)}
                                style={{
                                  padding: "0.2rem 0",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff",
                                  color: darkMode ? "#60a5fa" : "#1d4ed8",
                                  border: darkMode ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(37, 99, 235, 0.4)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  width: "34px",
                                  fontWeight: "700"
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.28)" : "#dbeafe";
                                  e.currentTarget.style.borderColor = darkMode ? "#60a5fa" : "#2563eb";
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.28)" : "#dbeafe";
                                  e.currentTarget.style.borderColor = darkMode ? "#60a5fa" : "#2563eb";
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.4)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.4)";
                                }}
                                title="기획 제안서 요약 보기"
                              >
                                기획
                              </button>

                              {/* 2. 구매문서 버튼 (보라색 테마) */}
                              <button
                                onClick={() => setPurchaseModalData(equip)}
                                style={{
                                  padding: "0.2rem 0",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: darkMode ? "rgba(167, 139, 250, 0.18)" : "#f5f3ff",
                                  color: darkMode ? "#c084fc" : "#6d28d9",
                                  border: darkMode ? "1px solid rgba(167, 139, 250, 0.4)" : "1px solid rgba(109, 40, 217, 0.4)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  width: "34px",
                                  fontWeight: "700"
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(167, 139, 250, 0.28)" : "#ede9fe";
                                  e.currentTarget.style.borderColor = darkMode ? "#c084fc" : "#7c3aed";
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(167, 139, 250, 0.28)" : "#ede9fe";
                                  e.currentTarget.style.borderColor = darkMode ? "#c084fc" : "#7c3aed";
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(167, 139, 250, 0.18)" : "#f5f3ff";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(167, 139, 250, 0.4)" : "rgba(109, 40, 217, 0.4)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(167, 139, 250, 0.18)" : "#f5f3ff";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(167, 139, 250, 0.4)" : "rgba(109, 40, 217, 0.4)";
                                }}
                                title="구매 발송문서 요약 보기"
                              >
                                구매
                              </button>

                              {/* 3. 입찰문서 버튼 (초록색 테마) */}
                              <button
                                onClick={() => setBidModalData(equip)}
                                style={{
                                  padding: "0.2rem 0",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5",
                                  color: darkMode ? "#34d399" : "#047857",
                                  border: darkMode ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(5, 150, 105, 0.4)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  width: "34px",
                                  fontWeight: "700"
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.28)" : "#d1fae5";
                                  e.currentTarget.style.borderColor = darkMode ? "#34d399" : "#059669";
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.28)" : "#d1fae5";
                                  e.currentTarget.style.borderColor = darkMode ? "#34d399" : "#059669";
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.4)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.4)";
                                }}
                                title="입찰 규격 공고 보기"
                              >
                                입찰
                              </button>
                            </div>
                          </td>
                          {currentRole.id !== "GUEST" && (
                            <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "48px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                                {(["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                                  <button
                                    onClick={() => openEditModal(equip)}
                                    style={{
                                      background: darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5",
                                      border: darkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #d4d4d8",
                                      borderRadius: "4px",
                                      color: darkMode ? "#e4e4e7" : "#27272a",
                                      padding: "0.2rem 0",
                                      fontSize: "0.65rem",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      textAlign: "center",
                                      whiteSpace: "nowrap",
                                      width: "34px"
                                    }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
                                      e.currentTarget.style.color = darkMode ? "#60a5fa" : "#1d4ed8";
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
                                      e.currentTarget.style.color = darkMode ? "#60a5fa" : "#1d4ed8";
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.background = darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
                                      e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.15)" : "#d4d4d8";
                                      e.currentTarget.style.color = darkMode ? "#e4e4e7" : "#27272a";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
                                      e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.15)" : "#d4d4d8";
                                      e.currentTarget.style.color = darkMode ? "#e4e4e7" : "#27272a";
                                    }}
                                    title="기자재 수정"
                                  >
                                    수정
                                  </button>
                                )}
                                {(["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                                  <button
                                    onClick={() => {
                                      if (confirm("🚨 이 작업은 되돌릴 수 없습니다. 해당 기자재 항목을 정말로 삭제하시겠습니까?")) {
                                        const inputPw = prompt("🔒 삭제 안전장치: 등록 시 설정한 비밀번호를 입력해 주세요.");
                                        const registeredPw = equip.password || "1234";

                                        if (inputPw === null) return; // 취소
                                        if (inputPw === registeredPw) {
                                          setEquipData(activeEquipList.filter(e => e.id !== equip.id));
                                          alert("🗑️ 기자재 항목이 안전하게 삭제되었습니다.");
                                        } else {
                                          alert("⚠️ 비밀번호가 일치하지 않습니다. 삭제 권한이 거부되었습니다.");
                                        }
                                      }
                                    }}
                                    style={{
                                      background: darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                                      border: darkMode ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid rgba(239, 68, 68, 0.4)",
                                      borderRadius: "4px",
                                      color: darkMode ? "#f87171" : "#b91c1c",
                                      padding: "0.2rem 0",
                                      fontSize: "0.65rem",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      textAlign: "center",
                                      whiteSpace: "nowrap",
                                      width: "34px"
                                    }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                      e.currentTarget.style.borderColor = "#ef4444";
                                      e.currentTarget.style.color = "#ef4444";
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                      e.currentTarget.style.borderColor = "#ef4444";
                                      e.currentTarget.style.color = "#ef4444";
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.background = darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2";
                                      e.currentTarget.style.borderColor = darkMode ? "rgba(239, 68, 68, 0.45)" : "rgba(239, 68, 68, 0.4)";
                                      e.currentTarget.style.color = darkMode ? "#f87171" : "#b91c1c";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2";
                                      e.currentTarget.style.borderColor = darkMode ? "rgba(239, 68, 68, 0.45)" : "rgba(239, 68, 68, 0.4)";
                                      e.currentTarget.style.color = darkMode ? "#f87171" : "#b91c1c";
                                    }}
                                    title="기자재 삭제"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  } else {
                    return (
                      <tr>
                        <td colSpan={13} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          필터링된 기자재 내역이 존재하지 않습니다.
                        </td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </table>
          </div>
        </div>
  );
}
