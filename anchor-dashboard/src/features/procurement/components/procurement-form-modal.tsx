import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Trash2, X } from "lucide-react";

type ProcurementDocumentType = "proposal" | "purchase" | "bid" | "check";
type ProcurementFormData = Record<string, any>;

interface ProposalDocument {
  docNo: string;
  name: string;
  size: number;
  url: string;
  aiData: any;
}

interface ProcurementFormModalProps {
  aiEngine: string;
  darkMode: boolean;
  formData: ProcurementFormData;
  formatToThousandWon: (value?: number | null) => string;
  getDynamicPrograms: (targetUnit: string) => Array<{ id: string; name: string }>;
  getUniqueProposalDocs: () => ProposalDocument[];
  handleAnalyzeAndUpload: (
    docType: ProcurementDocumentType,
    fileId?: number | string
  ) => Promise<void>;
  handleFileChange: (
    docType: ProcurementDocumentType,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  handleFileRemove: (
    docType: ProcurementDocumentType,
    fileId: number | string
  ) => void;
  handleFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSelectLegacyProposal: (docNo: string) => void;
  isAnalyzingBid: boolean;
  isEditMode: boolean;
  modalType: string;
  selectedYear?: number | string;
  setAiEngine: React.Dispatch<React.SetStateAction<string>>;
  setFormData: React.Dispatch<React.SetStateAction<ProcurementFormData>>;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ProcurementFormModal({
  aiEngine,
  darkMode,
  formData,
  formatToThousandWon,
  getDynamicPrograms,
  getUniqueProposalDocs,
  handleAnalyzeAndUpload,
  handleFileChange,
  handleFileRemove,
  handleFormSubmit,
  handleInputChange,
  handleSelectLegacyProposal,
  isAnalyzingBid,
  isEditMode,
  modalType,
  selectedYear,
  setAiEngine,
  setFormData,
  setIsAddModalOpen
}: ProcurementFormModalProps) {
  return (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 1100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "780px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: "var(--text-primary)", fontWeight: "800", fontSize: "1.1rem" }}>
                {modalType === "env" && "🛠️ 신규 교육환경 개선 사업 등록"}
                {modalType === "equip" && (isEditMode ? "🔬 핵심 기자재 도입 정보 수정" : "🔬 신규 핵심 기자재 도입 등록")}
                {modalType === "service" && "💼 신규 주요 용역 계약 등록"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>

              {/* 환경개선용 입력 필드들 */}
              {modalType === "env" && (
                <>
                  {/* 첫번째 줄: 단위과제, 사업연차 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-1" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select id="a11y-procurement-manager-1"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        {Number(formData.year || selectedYear) === 1
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-2" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업연차</label>
                      <select id="a11y-procurement-manager-2"
                        name="year"
                        value={formData.year || selectedYear}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  {/* 두번째 줄: 학과 선택, 부서 선택 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.25rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-3" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select id="a11y-procurement-manager-3"
                        name="deptName"
                        value={formData.deptName}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        <option value="기계공학부">기계공학부</option>
                        <option value="기계시스템전공">{" - 기계시스템전공"}</option>
                        <option value="기계설비전공">{" - 기계설비전공"}</option>
                        <option value="전기전자공학부">전기전자공학부</option>
                        <option value="전기전공">{" - 전기전공"}</option>
                        <option value="스마트전자전공">{" - 스마트전자전공"}</option>
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
                    <div>
                      <label htmlFor="a11y-procurement-manager-4" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select id="a11y-procurement-manager-4"
                        name="divisionName"
                        value={formData.divisionName}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">-- 선택 안 함 --</option>
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
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#ff9800", fontWeight: "700", marginBottom: "1rem" }}>
                    ** 학과나 부서 중 하나는 선택되어야 합니다.
                  </div>

                  {/* 세번째 줄: 구축 공간명, 구축 위치(지정 호실) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-5" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축 공간명</label>
                      <input id="a11y-procurement-manager-5" type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 3층 RISE 바이오 메디컬 실습실 구축" className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-6" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축 위치 (지정 호실)</label>
                      <input id="a11y-procurement-manager-6" type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: 대학 본관 302호" className="form-input" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-7" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업비 (백만원)</label>
                      <input id="a11y-procurement-manager-7"
                        type="number"
                        name="unitPrice"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                        required
                        placeholder="예: 50.00"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-8" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>현재 실제 집행액 (백만원)</label>
                      <input id="a11y-procurement-manager-8"
                        type="number"
                        name="budgetSpent"
                        step="0.01"
                        value={formData.budgetSpent}
                        onChange={handleInputChange}
                        placeholder="예: 10.50"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 다섯번째 줄: 개선단계 일정 지정 (선택 입력) */}
                  <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.95rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                    <span style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                      📅 개선단계 일정 지정 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
                      <div>
                        <label htmlFor="a11y-procurement-manager-9" style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>기획∙승인(PA) 일</label>
                        <input id="a11y-procurement-manager-9" type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-10" style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>요청∙설계(RD) 일</label>
                        <input id="a11y-procurement-manager-10" type="date" name="dateA" min={formData.dateP || ""} value={formData.dateA || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-11" style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>구매∙입찰∙계약(PBC) 일</label>
                        <input id="a11y-procurement-manager-11" type="date" name="dateB" min={formData.dateA || formData.dateP || ""} value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-12" style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>시공(C) 일</label>
                        <input id="a11y-procurement-manager-12" type="date" name="datePr" min={formData.dateB || formData.dateA || formData.dateP || ""} value={formData.datePr || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-13" style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>검수(I) 일</label>
                        <input id="a11y-procurement-manager-13" type="date" name="dateI" min={formData.datePr || formData.dateB || formData.dateA || formData.dateP || ""} value={formData.dateI || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="a11y-procurement-manager-14" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축 목적 (공간 용도)</label>
                    <textarea id="a11y-procurement-manager-14" name="purpose" value={formData.purpose} onChange={handleInputChange} required placeholder="특화 인력 양성을 위한 핵심 시너지 공간 용도 상세 기술" className="form-textarea" style={{ height: "50px", resize: "none" }} />
                  </div>
                  <div>
                    <label htmlFor="a11y-procurement-manager-15" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>향후 활용 계획</label>
                    <input id="a11y-procurement-manager-15" type="text" name="utilization" value={formData.utilization} onChange={handleInputChange} required placeholder="예: 공간 연계 교육과정 활용 방식 및 융합 연구 활용" className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="a11y-procurement-manager-16" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>세부 공간 구축 설계 계획 (선택)</label>
                    <textarea id="a11y-procurement-manager-16" name="plan" value={formData.plan} onChange={handleInputChange} placeholder="예: 바닥 전선 몰딩, 방음벽 흡음 패널 시공 및 스마트 미러링 보드 마운팅 작업" className="form-textarea" style={{ height: "50px", resize: "none" }} />
                  </div>
                  <div>
                    <label htmlFor="a11y-procurement-manager-17" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>공사 진행 실적 현황 (선택)</label>
                    <textarea id="a11y-procurement-manager-17" name="progress" value={formData.progress} onChange={handleInputChange} placeholder="현재 진행 실무 정보 기술" className="form-textarea" style={{ height: "50px", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 기자재용 입력 필드들 */}
              {modalType === "equip" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-18" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select id="a11y-procurement-manager-18"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        {Number(formData.year || selectedYear) === 1
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-19" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업연차 선택</label>
                      <select id="a11y-procurement-manager-19"
                        name="year"
                        value={formData.year || selectedYear}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="a11y-procurement-manager-20" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>연계 프로그램</label>
                    <select id="a11y-procurement-manager-20"
                      name="operation"
                      value={formData.operation}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {getDynamicPrograms(formData.unit).map((p: any) => (
                        <option key={p.id} value={p.name}>[{p.id}] {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-21" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select id="a11y-procurement-manager-21"
                        name="deptName"
                        value={formData.deptName}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        {/* 1) 학과는 사업단관리 탭의 대학조직도에 나온 학부(과)를 기준으로 렌더링 */}
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
                    <div>
                      <label htmlFor="a11y-procurement-manager-22" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select id="a11y-procurement-manager-22"
                        name="divisionName"
                        value={formData.divisionName}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        {/* 앵커사업단 및 센터 */}
                        <optgroup label="앵커사업단 및 센터">
                          <option value="사업운영팀">사업운영팀</option>
                          <option value="ECC센터">ECC센터</option>
                          <option value="ICC센터">ICC센터</option>
                          <option value="RCC센터">RCC센터</option>
                          <option value="AID-X지원센터">AID-X지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="신산업특화센터">신산업특화센터</option>
                        </optgroup>
                        {/* 대학본부 하위 조직 */}
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
                        {/* 산학협력단 하위 조직 */}
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
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#fbbf24", display: "block", marginTop: "-0.5rem" }}>
                    * 학과 또는 부서 중 최소 한 곳은 필수로 지정되어야 합니다.
                  </span>
                  {/* 기자재 관리번호 입력란 (선택 항목으로 변경, 바코드 삭제) */}
                  <div>
                    <label htmlFor="a11y-procurement-manager-23" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      기자재 관리번호 <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "normal" }}>(선택 - 검수 완료 후 기재)</span>
                    </label>
                    <input id="a11y-procurement-manager-23"
                      type="text"
                      name="asset_number"
                      value={formData.asset_number || ""}
                      onChange={handleInputChange}
                      placeholder="예: AIDX-EQ-2026-004 (검수 완료 시점에 수동 입력)"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="a11y-procurement-manager-24" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>품명</label>
                    <input id="a11y-procurement-manager-24" type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="예: 임상 실습용 스마트 베드" className="form-input" />
                  </div>
                  {(modalType as string) !== "env" && (
                    <div>
                      <label htmlFor="a11y-procurement-manager-25" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>규격</label>
                      <input id="a11y-procurement-manager-25" type="text" name="spec" value={formData.spec || ""} onChange={handleInputChange} placeholder="예: 20자유도(DoF) 초정밀 관절 제어 메커니즘 탑재" className="form-input" />
                    </div>
                  )}
                  {(modalType as string) !== "env" && (() => {
                    const priceVal = parseFloat(formData.unitPrice || 0);
                    const qtyVal = parseFloat(formData.quantity || 0);
                    const totalInMillion = (priceVal * qtyVal).toFixed(2);
                    return (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", gap: "1rem" }}>
                          <div>
                            <label htmlFor="a11y-procurement-manager-26" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단가 (백만원)</label>
                            <input id="a11y-procurement-manager-26" type="number" name="unitPrice" step="0.01" value={formData.unitPrice} onChange={handleInputChange} required placeholder="예: 120.00" className="form-input" />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-27" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위</label>
                            <input id="a11y-procurement-manager-27" type="text" name="itemUnit" value={formData.itemUnit || ""} onChange={handleInputChange} placeholder="예: 대, 개, 세트" className="form-input" />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-28" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>수량</label>
                            <input id="a11y-procurement-manager-28" type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required placeholder="예: 2" className="form-input" />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-29" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>금액 (백만원)</label>
                            <input id="a11y-procurement-manager-29" type="text" value={`${parseFloat(totalInMillion).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 백만원`} readOnly style={{ width: "100%", padding: "0.55rem 0.9rem", background: "rgba(255,255,255,0.02)", border: "1.5px solid var(--border-color)", borderRadius: "8px", color: "#10B981", fontWeight: "bold" }} />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label htmlFor="a11y-procurement-manager-30" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구입목적</label>
                            <textarea id="a11y-procurement-manager-30" name="descriptionPurpose" value={formData.descriptionPurpose || ""} onChange={handleInputChange} required placeholder="기자재의 구입 목적 및 타당성 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-31" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>활용계획</label>
                            <textarea id="a11y-procurement-manager-31" name="descriptionPlan" value={formData.descriptionPlan || ""} onChange={handleInputChange} required placeholder="핵심 활용 계획 및 예상 시너지 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {(modalType as string) === "env" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label htmlFor="a11y-procurement-manager-32" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축목적</label>
                        <textarea id="a11y-procurement-manager-32" name="descriptionPurpose" value={formData.descriptionPurpose || ""} onChange={handleInputChange} required placeholder="환경구축의 목적 및 타당성 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-33" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>활용계획</label>
                        <textarea id="a11y-procurement-manager-33" name="descriptionPlan" value={formData.descriptionPlan || ""} onChange={handleInputChange} required placeholder="핵심 활용 계획 및 예상 시너지 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                      </div>
                    </div>
                  )}

                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <span style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                      📅 단계별 이벤트 일자 입력 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: (modalType as string) === "env" ? "repeat(5, 1fr)" : "repeat(4, 1fr)", gap: "0.5rem" }}>
                      <div>
                        <label htmlFor="a11y-procurement-manager-34" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                          기획∙승인(PA) 일자
                        </label>
                        <input id="a11y-procurement-manager-34" type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      {(modalType as string) === "env" && (
                        <>
                          <div>
                            <label htmlFor="a11y-procurement-manager-35" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                              요청∙설계(RD) 일자
                            </label>
                            <input id="a11y-procurement-manager-35" type="date" name="dateA" value={formData.dateA || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-36" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              구매∙입찰∙계약(PBC) 일자
                            </label>
                            <input id="a11y-procurement-manager-36" type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-37" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              시공(C) 일자
                            </label>
                            <input id="a11y-procurement-manager-37" type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                        </>
                      )}
                      {(modalType as string) !== "env" && (
                        <>
                          <div>
                            <label htmlFor="a11y-procurement-manager-38" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              구매신청(Pr) 일자
                            </label>
                            <input id="a11y-procurement-manager-38" type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                          <div>
                            <label htmlFor="a11y-procurement-manager-39" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              입찰∙계약(BC) 일자
                            </label>
                            <input id="a11y-procurement-manager-39" type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                        </>
                      )}
                      <div>
                        <label htmlFor="a11y-procurement-manager-40" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                          검수(I) 일자
                        </label>
                        <input id="a11y-procurement-manager-40" type="date" name="dateI" value={formData.dateI || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(modalType === "env" || modalType === "equip") && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#60A5FA" }}>
                      {modalType === "env" ? "🤖 AI 문서 분석 및 요약 등록 (기획, 구매, 결과)" : "🤖 AI 문서 분석 및 요약 등록 (기획, 구매, 입찰)"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>AI 엔진:</span>
                      <select
                        value={aiEngine}
                        onChange={(e) => setAiEngine(e.target.value)}
                        style={{
                          background: "var(--input-bg)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.72rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        <option value="gemini">Google Gemini API</option>
                        <option value="gpt">OpenAI GPT-4o API</option>
                        <option value="debate">AI 교차 토론 조합 (Gemini & GPT)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>



                      {/* 1. 기획문서 업로드 및 AI 분석 (다중 파일 및 1대N 공유 연계 지원) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#93C5FD" }}>
                            {modalType === "env" ? "1. 기획문서 (사업단 ➔ 시설안전관리팀)" : "1. 기획문서 (사업단 작성/결재)"}
                          </span>
                        </div>

                        {/* [교육용 주석] 하나의 기획문서가 여러 개의 구매(1대N)를 반영할 수 있도록 기존 결재 연계 드롭다운 신설 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "0.5rem", borderRadius: "6px" }}>
                          <label htmlFor="a11y-procurement-manager-41" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>
                            🔗 기존 등록된 기획 결재문서 가져오기 (1대N 공유 매칭)
                          </label>
                          <select id="a11y-procurement-manager-41"
                            onChange={(e) => {
                              handleSelectLegacyProposal(e.target.value);
                              e.target.value = "";
                            }}
                            style={{
                              width: "100%",
                              background: "var(--input-bg)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                              padding: "0.25rem",
                              fontSize: "0.72rem",
                              cursor: "pointer"
                            }}
                          >
                            <option value="">-- 연계할 기존 기획결재번호 선택 --</option>
                            {getUniqueProposalDocs().map(doc => (
                              <option key={doc.docNo} value={doc.docNo}>
                                [{doc.docNo}] {doc.name.slice(0, 35)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {/* 파일 추가 인풋 */}
                          <input
                            type="file"
                            id="file-plan-upload"
                            accept=".pdf,.doc,.docx,.hwp,.txt"
                            onChange={(e) => handleFileChange("proposal", e)}
                            style={{ display: "none" }}
                          />

                          {/* 업로드된 다중 기획문서 목록 루프 */}
                          {(formData.docPlanFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{
                                        fontSize: "0.7rem",
                                        color: darkMode ? "#4ade80" : "#059669",
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)",
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("proposal", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                          e.currentTarget.style.borderColor = "#3b82f6";
                                          e.currentTarget.style.color = "#3b82f6";
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                          e.currentTarget.style.borderColor = "#3b82f6";
                                          e.currentTarget.style.color = "#3b82f6";
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("proposal", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleFileRemove("proposal", fileItem.id)}
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#3b82f6" }} />
                                </div>
                              )}
                            </div>
                          ))}

                          <label
                            htmlFor="file-plan-upload"
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            ➕ 신규 기획문서 추가 업로드 (.pdf, .docx, .hwp)
                          </label>
                        </div>
                      </div>

                      {/* 2. 구매문서 업로드 및 AI 분석 (다중 파일 업로드 지원) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#C084FC" }}>
                            {modalType === "env" ? "2. 구매문서 (시설안전관리팀)" : "2. 구매문서 (총무팀 발송)"}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <input
                            type="file"
                            id="file-purchase-upload"
                            accept=".pdf,.doc,.docx,.hwp,.txt"
                            onChange={(e) => handleFileChange("purchase", e)}
                            style={{ display: "none" }}
                          />

                          {/* 업로드된 다중 구매문서 목록 루프 */}
                          {(formData.docPurchaseFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{
                                        fontSize: "0.7rem",
                                        color: darkMode ? "#4ade80" : "#059669",
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)",
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("purchase", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)";
                                          e.currentTarget.style.borderColor = "#a78bfa";
                                          e.currentTarget.style.color = "#a78bfa";
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)";
                                          e.currentTarget.style.borderColor = "#a78bfa";
                                          e.currentTarget.style.color = "#a78bfa";
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("purchase", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#a78bfa", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleFileRemove("purchase", fileItem.id)}
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#a78bfa" }} />
                                </div>
                              )}
                            </div>
                          ))}

                          <label
                            htmlFor="file-purchase-upload"
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            ➕ 신규 구매문서 추가 업로드 (.pdf, .docx, .hwp)
                          </label>
                        </div>
                      </div>

                      {/* 3. 입찰/결과문서 업로드 및 AI 분석 (다중 파일 업로드 지원) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#34D399" }}>
                            {modalType === "env" ? "3. 결과문서 (시설안전관리팀)" : "3. 입찰문서 (총무팀 작성)"}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <input
                            type="file"
                            id="file-bid-upload"
                            accept=".pdf,.doc,.docx,.hwp,.txt"
                            onChange={(e) => handleFileChange("bid", e)}
                            style={{ display: "none" }}
                          />

                          {/* 업로드된 다중 입찰문서 목록 루프 */}
                          {(formData.docBidFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{
                                        fontSize: "0.7rem",
                                        color: darkMode ? "#4ade80" : "#059669",
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)",
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("bid", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.background = "rgba(52, 211, 153, 0.12)";
                                          e.currentTarget.style.borderColor = "#34d399";
                                          e.currentTarget.style.color = "#34d399";
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(52, 211, 153, 0.12)";
                                          e.currentTarget.style.borderColor = "#34d399";
                                          e.currentTarget.style.color = "#34d399";
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("bid", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#34D399", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleFileRemove("bid", fileItem.id)}
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#34D399" }} />
                                </div>
                              )}
                            </div>
                          ))}

                          <label
                            htmlFor="file-bid-upload"
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            {modalType === "env" ? "➕ 신규 결과문서 추가 업로드 (.pdf, .docx, .hwp)" : "➕ 신규 입찰문서 추가 업로드 (.pdf, .docx, .hwp)"}
                          </label>
                        </div>
                      </div>

                      {/* 4. 검수문서 업로드 및 AI 분석 (다중 파일 업로드 지원 - 요건 2 반영) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#FB7185" }}>
                            4. 검수문서 (사업단/총무팀 공동)
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <input
                            type="file"
                            id="file-check-upload"
                            accept=".pdf,.doc,.docx,.hwp,.txt"
                            onChange={(e) => handleFileChange("check", e)}
                            style={{ display: "none" }}
                          />

                          {/* 업로드된 다중 검수문서 목록 루프 */}
                          {(formData.docCheckFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{
                                        fontSize: "0.7rem",
                                        color: darkMode ? "#4ade80" : "#059669",
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)",
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("check", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.background = "rgba(251, 113, 133, 0.12)";
                                          e.currentTarget.style.borderColor = "#FB7185";
                                          e.currentTarget.style.color = "#FB7185";
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(251, 113, 133, 0.12)";
                                          e.currentTarget.style.borderColor = "#FB7185";
                                          e.currentTarget.style.color = "#FB7185";
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("check", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#FB7185", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleFileRemove("check", fileItem.id)}
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#FB7185" }} />
                                </div>
                              )}
                            </div>
                          ))}

                          <label
                            htmlFor="file-check-upload"
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            ➕ 신규 검수문서 추가 업로드 (.pdf, .docx, .hwp)
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              {/* 용역용 입력 필드들 */}
              {/* 용역용 입력 필드들 */}
              {modalType === "service" && (
                <>
                  {/* 첫번째 줄: 단위과제, 프로그램 진행 상황 (비율 = 1:2) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-42" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select id="a11y-procurement-manager-42"
                        name="unit"
                        value={formData.unit}
                        onChange={(e) => {
                          const nextUnit = e.target.value;
                          // 단위과제 변경 시 관련 프로그램 목록이 갱신되므로 첫 번째 프로그램으로 자동 셋해줍니다.
                          const nextProgs = getDynamicPrograms(nextUnit);
                          setFormData(prev => ({
                            ...prev,
                            unit: nextUnit,
                            programId: nextProgs.length > 0 ? nextProgs[0].id : "",
                            programName: nextProgs.length > 0 ? nextProgs[0].name : ""
                          }));
                        }}
                        className="form-select"
                      >
                        {Number(formData.year || selectedYear) === 1
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-43" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>연계 프로그램 (진행 상황)</label>
                      <select id="a11y-procurement-manager-43"
                        name="programSelect"
                        value={formData.programId && formData.programName ? `${formData.programId}|${formData.programName}` : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [pId, pName] = val.split("|");
                            setFormData(prev => ({
                              ...prev,
                              programId: pId,
                              programName: pName
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              programId: "",
                              programName: ""
                            }));
                          }
                        }}
                        className="form-select"
                      >
                        <option value="">(연계 프로그램 선택 안 함)</option>
                        {getDynamicPrograms(formData.unit).map((prog: any) => (
                          <option key={prog.id} value={`${prog.id}|${prog.name}`}>
                            [{prog.id}] {prog.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 두번째 줄: 관련학과, 관련부서 (학과, 부서 중 택1 필수) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-44" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련학과 (배정 학과) <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>(학과/부서 중 택1 필수)</span></label>
                      <select id="a11y-procurement-manager-44"
                        name="deptName"
                        value={formData.deptName}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">(학과 없음/전체)</option>
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
                    <div>
                      <label htmlFor="a11y-procurement-manager-45" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련부서 (배정 행정부서) <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>(학과/부서 중 택1 필수)</span></label>
                      <select id="a11y-procurement-manager-45"
                        name="divisionName"
                        value={formData.divisionName}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">(부서 없음/전체)</option>
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
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: "-0.5rem", marginBottom: "0.5rem", fontWeight: "600" }}>
                    * 관련학과 혹은 관련부서 중 최소한 하나는 반드시 지정해야 합니다.
                  </div>

                  {/* 세번째 줄: 용역명칭, 용역목적 (둘 다 필수 입력) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-46" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>용역 명칭 (500만원 이상) <span style={{ color: "var(--danger-color)" }}>*</span></label>
                      <input id="a11y-procurement-manager-46"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="예: 앵커 산학 네트워크 포럼 기획 운영 대행 용역"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-47" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>용역목적 (추진 목적) <span style={{ color: "var(--danger-color)" }}>*</span></label>
                      <input id="a11y-procurement-manager-47"
                        type="text"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                        placeholder="예: 해당 용역이 해결하고자 하는 문제 및 목표"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 네번째 줄: 수행결과 (선택 입력) */}
                  <div>
                    <label htmlFor="a11y-procurement-manager-48" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>수행결과 (선택)</label>
                    <textarea id="a11y-procurement-manager-48"
                      name="opResult"
                      value={formData.opResult}
                      onChange={handleInputChange}
                      placeholder="예: 최종 용역 수행 결과 및 납품 결과 기술"
                      className="form-textarea"
                      style={{ height: "50px", resize: "none" }}
                    />
                  </div>

                  {/* 다섯번째 줄: 사업예산(천원), 집행액(천원) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label htmlFor="a11y-procurement-manager-49" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업예산 (천원)</label>
                      <input id="a11y-procurement-manager-49"
                        type="number"
                        name="budgetPlan"
                        value={formData.budgetPlan}
                        onChange={handleInputChange}
                        placeholder="예: 25000 (2천5백만원)"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="a11y-procurement-manager-50" style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>집행액 (천원)</label>
                      <input id="a11y-procurement-manager-50"
                        type="number"
                        name="budgetSpent"
                        value={formData.budgetSpent}
                        onChange={handleInputChange}
                        placeholder="예: 20000 (2천만원)"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 5대 행정 절차 날짜 입력 필드 */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#60A5FA", display: "block", marginBottom: "0.5rem" }}>📅 5대 행정 절차 완료 일자 설정</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                      <div>
                        <label htmlFor="a11y-procurement-manager-51" style={{ display: "block", fontSize: "0.68rem", color: "#f59e0b", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>기획∙승인(PA)</label>
                        <input id="a11y-procurement-manager-51" type="date" name="datePp" value={formData.datePp || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-52" style={{ display: "block", fontSize: "0.68rem", color: "#3b82f6", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>구매의뢰(RP)</label>
                        <input id="a11y-procurement-manager-52" type="date" name="dateRfo" min={formData.datePp || ""} value={formData.dateRfo || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-53" style={{ display: "block", fontSize: "0.68rem", color: "#06b6d4", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>평가∙선정∙계약(ESC)</label>
                        <input id="a11y-procurement-manager-53" type="date" name="dateB" min={formData.dateRfo || formData.datePp || ""} value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-54" style={{ display: "block", fontSize: "0.68rem", color: "#eab308", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>수행(E)</label>
                        <input id="a11y-procurement-manager-54" type="date" name="dateE" min={formData.dateB || formData.dateRfo || formData.datePp || ""} value={formData.dateE || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label htmlFor="a11y-procurement-manager-55" style={{ display: "block", fontSize: "0.68rem", color: "#10b981", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>검수(I)</label>
                        <input id="a11y-procurement-manager-55" type="date" name="dateI" min={formData.dateE || formData.dateB || formData.dateRfo || formData.datePp || ""} value={formData.dateI || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                    </div>
                  </div>

                  {/* 3종 관련 문서 파일 첨부 및 AI 자동분석 패널 */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#a78bfa", display: "block", marginBottom: "0.5rem" }}>📎 행정 서류 첨부 및 AI Debate 분석 연계</span>

                    {/* 1. 기획문서 첨부 (다중 파일 및 1대N 연계 지원) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.01)", padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <label htmlFor="a11y-procurement-manager-56" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>기획서 관련 문서 (사업단 작성 기안문)</label>

                      {/* 1대N 공유 연계용 드롭다운 */}
                      <select
                        onChange={(e) => {
                          handleSelectLegacyProposal(e.target.value);
                          e.target.value = "";
                        }}
                        style={{
                          background: "var(--input-bg)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "4px",
                          padding: "0.2rem",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          marginBottom: "0.4rem"
                        }}
                      >
                        <option value="">-- 연계할 기존 기획결재번호 선택 (1대N) --</option>
                        {getUniqueProposalDocs().map(doc => (
                          <option key={doc.docNo} value={doc.docNo}>
                            [{doc.docNo}] {doc.name.slice(0, 30)}
                          </option>
                        ))}
                      </select>

                      <input type="file" id="file-plan-upload-serv" onChange={(e) => handleFileChange("proposal", e)} style={{ display: "none" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {(formData.docPlanFileList || []).map((fileItem: any) => (
                          <div key={fileItem.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.35rem 0.5rem", borderRadius: "4px" }}>
                            <span style={{ fontSize: "0.72rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                              📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {fileItem.aiData ? (
                                <span style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: "800" }}>
                                  ✅ Debate 완료 ({fileItem.aiData.docNo})
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAnalyzeAndUpload("proposal", fileItem.id)}
                                  disabled={fileItem.isAnalyzing}
                                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.65rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "3px", fontWeight: "700" }}
                                >
                                  {fileItem.isAnalyzing ? "토론중..." : "Debate 분석"}
                                </button>
                              )}
                              <button type="button" onClick={() => handleFileRemove("proposal", fileItem.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.1rem" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <label htmlFor="file-plan-upload-serv" style={{ display: "block", textAlign: "center", padding: "0.35rem", border: "1px dashed var(--border-color)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          ➕ 기획문서 추가 선택 (.pdf, .docx, .hwp)
                        </label>
                      </div>
                    </div>

                    {/* 2. 구매문서 첨부 (다중 파일 지원) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.01)", padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <label htmlFor="a11y-procurement-manager-58" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>구매의뢰 관련 문서 (위탁 의뢰 이송 공문)</label>
                      <input type="file" id="file-purchase-upload-serv" onChange={(e) => handleFileChange("purchase", e)} style={{ display: "none" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {(formData.docPurchaseFileList || []).map((fileItem: any) => (
                          <div key={fileItem.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.35rem 0.5rem", borderRadius: "4px" }}>
                            <span style={{ fontSize: "0.72rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                              📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {fileItem.aiData ? (
                                <span style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: "800" }}>
                                  ✅ Debate 완료 ({fileItem.aiData.docNo})
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAnalyzeAndUpload("purchase", fileItem.id)}
                                  disabled={fileItem.isAnalyzing}
                                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.65rem", background: "#a78bfa", border: "none", color: "white", borderRadius: "3px", fontWeight: "700" }}
                                >
                                  {fileItem.isAnalyzing ? "토론중..." : "Debate 분석"}
                                </button>
                              )}
                              <button type="button" onClick={() => handleFileRemove("purchase", fileItem.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.1rem" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <label htmlFor="file-purchase-upload-serv" style={{ display: "block", textAlign: "center", padding: "0.35rem", border: "1px dashed var(--border-color)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          ➕ 구매문서 추가 선택 (.pdf, .docx, .hwp)
                        </label>
                      </div>
                    </div>

                    {/* 3. 결과문서 첨부 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>검수조서 관련 문서 (최종 준공/검수 보고서)</span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="file" id="file-bid-upload-serv" onChange={(e) => handleFileChange("bid", e)} style={{ display: "none" }} />
                        <label htmlFor="file-bid-upload-serv" style={{ display: "block", flex: 1, textAlign: "center", padding: "0.45rem", border: "1px dashed var(--border-color)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          {formData.docBidFileName ? `📎 ${formData.docBidFileName}` : "📎 결과/검수 문서 파일 선택 (.pdf, .docx, .hwp)"}
                        </label>
                        <button type="button" onClick={() => handleAnalyzeAndUpload("bid")} disabled={isAnalyzingBid} style={{ padding: "0.45rem 1rem", fontSize: "0.72rem", background: "#10b981", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                          {isAnalyzingBid ? "분석중..." : "AI 분석"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem", flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  {isEditMode ? "수정하기" : "새 항목 등록하기"}
                </button>
              </div>

            </form>
          </div>
        </div>
  );
}
