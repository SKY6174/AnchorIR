import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { ListFilter, Plus } from "lucide-react";
import type { ProcurementItem } from "../../../components/ProcurementManager";

interface ProcurementServicesPanelProps {
  currentRole: any;
  currentUser: any;
  darkMode: boolean;
  deptFilter: string;
  divisionFilter: string;
  openAddModal: (type: "env" | "equip" | "service") => void;
  openEditModal: (item: ProcurementItem) => void;
  selectedEquipUnit: string;
  selectedYear?: number | string;
  serviceData: ProcurementItem[];
  setBidModalData: Dispatch<SetStateAction<any>>;
  setDeptFilter: Dispatch<SetStateAction<string>>;
  setDivisionFilter: Dispatch<SetStateAction<string>>;
  setProposalModalData: Dispatch<SetStateAction<any>>;
  setPurchaseModalData: Dispatch<SetStateAction<any>>;
  setSelectedEquipUnit: Dispatch<SetStateAction<string>>;
  setServiceData: Dispatch<SetStateAction<ProcurementItem[]>>;
}

export function ProcurementServicesPanel({
  currentRole,
  currentUser,
  darkMode,
  deptFilter,
  divisionFilter,
  openAddModal,
  openEditModal,
  selectedEquipUnit,
  selectedYear,
  serviceData,
  setBidModalData,
  setDeptFilter,
  setDivisionFilter,
  setProposalModalData,
  setPurchaseModalData,
  setSelectedEquipUnit,
  setServiceData
}: ProcurementServicesPanelProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 용역 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                💼 주요 용역 사업 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                앵커사업 주요 용역사업 계약 및 진행 현황
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
                  onClick={() => openAddModal("service")}
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
                  주요 용역 추가
                </button>
              )}
            </div>
          </div>

          {/* 💡 [교육용 한글 주석] 주요 용역 처리 절차를 시각적으로 보여주는 가로 흐름 스텝바를 배치합니다. */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.1rem" }}>💼</span>
              <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "800", color: "var(--text-primary)" }}>주요 용역 처리 절차 안내</h4>
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
                { no: "01", name: "기획", dept: "앵커사업단", desc: "사업계획서 반영분 구체화", tooltip: "사업계획서 상의 주요 용역 사업 구체화 및 상세 계획 수립" },
                { no: "02", name: "내부결재 승인", dept: "앵커사업단", desc: "과업지시서 작성", tooltip: "용역 제안서 요구사항이 명시된 과업지시서 작성 및 결재 승인" },
                { no: "03", name: "구매의뢰", dept: "앵커사업단 ➔ 총무팀", desc: "구매의뢰 요청", tooltip: "총무팀을 향한 공식 용역 조달/구매 의뢰 및 접수" },
                { no: "04", name: "업체선정 평가", dept: "총무팀 외", desc: "입찰 시 제안서 심사", tooltip: "💡 입찰 진행 시:\n제안서 심사 및 업체 선정을 위한 서류/프레젠테이션 평가위원회 구성 및 평가" },
                { no: "05", name: "업체 선정 및 계약", dept: "총무팀", desc: "낙찰 및 계약 체결", tooltip: "우수업체 최종 협상, 낙찰자 결정 및 정식 용역 계약 체결" },
                { no: "06", name: "용역 수행", dept: "선정 업체", desc: "과업수행 계획 이행", tooltip: "계약업체의 과업 이행 및 진행 진척도 관리" },
                { no: "07", name: "검수", dept: "총무팀 / 앵커사업단", desc: "산출물 최종 검수", tooltip: "완료 보고서 및 과업 결과물의 적합성 판정 및 검수" },
                { no: "08", name: "집행완료", dept: "재무회계팀", desc: "대금 지급 및 정산 완료", tooltip: "재무회계팀을 통한 용역 대금 최종 송금 및 예산 정산 완료" }
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

          {/* 주요 용역 테이블 */}
          <div className="glass-card" style={{ padding: "0.25rem", borderRadius: "12px", overflowX: "auto", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "transparent" }}>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "55px", whiteSpace: "nowrap" }}>순번</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "150px", whiteSpace: "nowrap" }}>프로그램 ID</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "150px", whiteSpace: "nowrap" }}>운영부서</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "220px", whiteSpace: "nowrap" }}>용역명</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "160px", whiteSpace: "nowrap" }}>사업예산/집행액(천원)</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "340px", whiteSpace: "nowrap" }}>용역목적 및 수행결과</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "500px", whiteSpace: "nowrap" }}>
                    용역 절차
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "500", marginTop: "0.15rem" }}>
                      [기획∙승인(PA : 1∙2) ⇨ 구매의뢰(RP : 3) ⇨ 평가∙선정∙계약(ESC : 4∙5) ⇨ 수행(E : 6) ⇨ 검수(I : 7)]
                    </span>
                  </th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "140px", whiteSpace: "nowrap" }}>관련문서</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "80px", whiteSpace: "nowrap" }}>제어</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeServiceList = serviceData.length > 0 ? serviceData : [];

                  // 1) 과제 필터링
                  let filteredServices = selectedEquipUnit === "ALL"
                    ? activeServiceList
                    : activeServiceList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터
                  if (deptFilter) {
                    filteredServices = filteredServices.filter(e => (e.deptName || "").includes(deptFilter));
                  }
                  if (divisionFilter) {
                    filteredServices = filteredServices.filter(e => (e.divisionName || "").includes(divisionFilter));
                  }

                  if (filteredServices.length === 0) {
                    return (
                      <tr>
                        <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          📭 등록된 주요 용역 사업 내역이 없습니다.
                        </td>
                      </tr>
                    );
                  }

                  return filteredServices.map((equip, idx) => {
                    return (
                      <tr
                        key={equip.id || idx}
                        style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s ease" }}
                      >
                        {/* 1. 순번 */}
                        <td aria-label={`${equip.name} 용역 목적 및 수행 결과`} style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)" }}>
                          {idx + 1}
                        </td>

                        {/* 2. 프로그램 ID // (프로그램명) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>
                          <div style={{ color: "var(--accent-color)", fontSize: "0.82rem" }}>
                            {equip.programId || `[${equip.unit}]`}
                          </div>
                          {equip.programName && (
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", marginTop: "0.15rem", fontWeight: "normal" }}>
                              ({equip.programName})
                            </div>
                          )}
                        </td>

                        {/* 3. 운영부서 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "600", fontSize: "0.8rem" }}>
                          {(() => {
                            const dName = equip.deptName || "";
                            const divName = equip.divisionName || "";
                            if (dName && divName) {
                              return `${dName} / ${divName}`;
                            }
                            return dName || divName || "-";
                          })()}
                        </td>

                        {/* 4. 용역명 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", color: "var(--text-primary)" }}>
                          {equip.title || "-"}
                        </td>

                        {/* 5. 사업예산 / 집행액(천원) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#3b82f6" }}>
                            예산: {Math.round((equip.budgetPlan || 0) / 1000).toLocaleString()}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: "0.15rem", fontWeight: "700" }}>
                            집행: {Math.round((equip.budgetSpent || 0) / 1000).toLocaleString()}
                          </div>
                        </td>

                        {/* 6. 용역목적 및 수행결과 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.35rem", lineHeight: "1.4", fontSize: "0.78rem", textAlign: "left" }}>
                            <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                              <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                              <span>
                                <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>용역목적:</strong>
                                {equip.purpose || "-"}
                              </span>
                            </div>
                            <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                              <span style={{ color: "#10b981", fontWeight: "bold" }}>•</span>
                              <span>
                                <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>수행결과:</strong>
                                {equip.opResult || "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 7. 용역 절차 가로 마일스톤 노드 */}
                        <td style={{ padding: "0.8rem 0.5rem", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}>
                            {[
                              { dateKey: "datePp", label: "기획∙승인", code: "PA", colorLight: "#d97706", colorDark: "#f59e0b", bgLight: "#fef3c7", bgDark: "rgba(245, 158, 11, 0.2)" },
                              { dateKey: "dateRfo", label: "구매의뢰", code: "RP", colorLight: "#1d4ed8", colorDark: "#60a5fa", bgLight: "#dbeafe", bgDark: "rgba(59, 130, 246, 0.2)" },
                              { dateKey: "dateB", label: "평가∙선정∙계약", code: "ESC", colorLight: "#7c3aed", colorDark: "#c084fc", bgLight: "#f3e8ff", bgDark: "rgba(167, 139, 250, 0.2)" },
                              { dateKey: "dateE", label: "수행", code: "E", colorLight: "#b45309", colorDark: "#facc15", bgLight: "#fef9c3", bgDark: "rgba(234, 179, 8, 0.2)" },
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
                                  {sIdx < 4 && (
                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: "900", opacity: 0.35 }}>➔</span>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </td>

                        {/* 8. 관련문서 기획/구매/결과 3종 단추 */}
                        <td style={{ padding: "0.8rem 0.2rem", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", justifyContent: "center" }}>
                            {/* 기획문서 */}
                            <button
                              onClick={() => setProposalModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff",
                                color: darkMode ? "#60a5fa" : "#1d4ed8",
                                border: darkMode ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(37, 99, 235, 0.4)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
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
                              title="기획 문서 요약 보기"
                            >
                              기획
                            </button>

                            {/* 구매문서 */}
                            <button
                              onClick={() => setPurchaseModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: darkMode ? "rgba(139, 92, 246, 0.18)" : "#f5f3ff",
                                color: darkMode ? "#a78bfa" : "#6d28d9",
                                border: darkMode ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(109, 40, 217, 0.4)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(139, 92, 246, 0.28)" : "#ede9fe";
                                e.currentTarget.style.borderColor = darkMode ? "#a78bfa" : "#7c3aed";
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(139, 92, 246, 0.28)" : "#ede9fe";
                                e.currentTarget.style.borderColor = darkMode ? "#a78bfa" : "#7c3aed";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(139, 92, 246, 0.18)" : "#f5f3ff";
                                e.currentTarget.style.borderColor = darkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(109, 40, 217, 0.4)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(139, 92, 246, 0.18)" : "#f5f3ff";
                                e.currentTarget.style.borderColor = darkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(109, 40, 217, 0.4)";
                              }}
                              title="구매 문서 요약 보기"
                            >
                              구매
                            </button>

                            {/* 결과문서 */}
                            <button
                              onClick={() => setBidModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5",
                                color: darkMode ? "#34d399" : "#047857",
                                border: darkMode ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(5, 150, 105, 0.4)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
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
                              title="결과 문서 요약 보기"
                            >
                              결과
                            </button>
                          </div>
                        </td>

                        {/* 9. 제어 열 버튼 (세로 2층 배치) */}
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
                                    background: darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5",
                                    border: darkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #d4d4d8",
                                    borderRadius: "4px",
                                    color: darkMode ? "#e4e4e7" : "#27272a",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    width: "38px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
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
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("정말 이 주요 용역 건을 삭제하시겠습니까?")) {
                                      setServiceData(activeServiceList.filter(e => e.id !== equip.id));
                                    }
                                  }}
                                  className="btn btn-danger"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                                    border: darkMode ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "4px",
                                    color: darkMode ? "#f87171" : "#b91c1c",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    width: "38px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
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
