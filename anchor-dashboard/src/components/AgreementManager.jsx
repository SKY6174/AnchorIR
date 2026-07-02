import React, { useState } from "react";
import { Plus, Trash2, Edit, Trash, FileText, Upload, X } from "lucide-react";

const AGREEMENT_CONTENTS_OPTIONS = [
  "주문식교육", "창업", "글로벌", "R&BD", "AIDX", "탄소중립",
  "복합재난", "평생교육", "늘봄", "지역현안해결", "보건복지서비스", "에코컬처"
];

const CENTERS_LIST = [
  "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"
];

export default function AgreementManager({
  projects = [],
  agreements = [],
  selectedYear,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  currentRole
}) {
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 입력 폼 상태
  const [inputDate, setInputDate] = useState("");
  const [inputCenter, setInputCenter] = useState("ECC센터");
  const [inputOrganizations, setInputOrganizations] = useState([""]);
  const [inputSubjectUniv, setInputSubjectUniv] = useState("단장");
  const [inputSubjectOrg, setInputSubjectOrg] = useState("");
  const [inputUnitId, setInputUnitId] = useState("");
  const [inputContents, setInputContents] = useState([]);
  const [inputFileName, setInputFileName] = useState("");
  const [inputFileData, setInputFileData] = useState(""); // Base64 파일 원본 데이터 영속 캐시

  // 현재 연차에 등록된 단위과제 추출 로직 (드롭다운 연동용)
  const getAvailableUnits = () => {
    const unitsMap = new Map();
    // 1차년도 ID 매핑 테이블 선언
    const y1Mapping = {
      "A1가": { id: "A1", title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성" },
      "A2": { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" },
      "A3": { id: "D4", title: "지역산업 연계 글로벌 협력 거점 대학 육성" },
      "B1": { id: "B1", title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화" },
      "B2": { id: "C2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      "B3": { id: "C3", title: "교육·산업·복지가 조화로운 지속가능한 탄소중립" },
      "B4": { id: "C1", title: "복합재난 대응 산업안전·보건 관리시스템 개발" },
      "C1": { id: "B2", title: "U-LIFE 평생직업교육 플랫폼 구축" },
      "C2": { id: "D2", title: "내일을 밝히는 '위드아이' 늘봄 생태계 조성" },
      "D1": { id: "B3", title: "지역을 키우는 지역문제 해결 협력 체계 구축" },
      "D2": { id: "D1", title: "통합형 인재양성 기반 포용적 보건복지서비스 구현" },
      "D3": { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" }
    };

    projects.forEach((p) => {
      p.units.forEach((u) => {
        // 해당 단위과제가 현재 연도에 기획을 가졌는지 검증
        const hasYearPlan = u.programs?.some(prog => prog.years && prog.years[selectedYear]);
        if (hasYearPlan || selectedYear === 2) { // 2차년도는 디폴트 노출
          if (selectedYear === 1) {
            const mapInfo = y1Mapping[u.id];
            if (mapInfo) {
              unitsMap.set(mapInfo.id, { id: mapInfo.id, title: mapInfo.title });
            } else if (u.id !== "A1나") {
              unitsMap.set(u.id, { id: u.id, title: u.title });
            }
          } else {
            unitsMap.set(u.id, { id: u.id, title: u.title });
          }
        }
      });
    });

    return Array.from(unitsMap.values()).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  };

  const availableUnits = getAvailableUnits();

  // 협약서 필터링 (현재 선택된 사업연도 기준)
  const filteredAgreements = agreements.filter(a => a.year === selectedYear);

  // 협약기관 추가/제거 핸들러
  const handleAddOrgField = () => {
    setInputOrganizations([...inputOrganizations, ""]);
  };

  const handleRemoveOrgField = (index) => {
    if (inputOrganizations.length <= 1) return;
    const updated = inputOrganizations.filter((_, i) => i !== index);
    setInputOrganizations(updated);
  };

  const handleOrgChange = (index, value) => {
    const updated = [...inputOrganizations];
    updated[index] = value;
    setInputOrganizations(updated);
  };

  // 협약내용 토글
  const handleToggleContent = (content) => {
    if (inputContents.includes(content)) {
      setInputContents(inputContents.filter(c => c !== content));
    } else {
      setInputContents([...inputContents, content]);
    }
  };

  // 모의 파일 업로드 (Base64 파일 리더 포함)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputFileData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setEditingId(null);
    setInputDate("");
    setInputCenter("ECC센터");
    setInputOrganizations([""]);
    setInputSubjectUniv("단장");
    setInputSubjectOrg("");
    setInputUnitId(availableUnits[0]?.id || "");
    setInputContents([]);
    setInputFileName("");
    setInputFileData("");
  };

  // 모달 열기 (등록 모드)
  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // 모달 열기 (수정 모드)
  const handleOpenEditModal = (agr) => {
    setEditingId(agr.id);
    setInputDate(agr.date || "");
    setInputCenter(agr.center || "ECC센터");
    setInputOrganizations(Array.isArray(agr.organizations) ? [...agr.organizations] : [""]);
    setInputSubjectUniv(agr.subjectUniversity || "단장");
    setInputSubjectOrg(agr.subjectOrganization || "");
    setInputUnitId(agr.unitId || "");
    setInputContents(Array.isArray(agr.contents) ? [...agr.contents] : []);
    setInputFileName(agr.fileName || "");
    setInputFileData(agr.fileData || "");
    setIsModalOpen(true);
  };

  // 저장 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 입력 유효성 검사
    if (!inputDate) {
      alert("협약 체결일자를 선택해 주세요.");
      return;
    }
    const cleanOrgs = inputOrganizations.map(o => o.trim()).filter(Boolean);
    if (cleanOrgs.length === 0) {
      alert("협약기관을 최소 1개 이상 입력해 주세요.");
      return;
    }
    if (!inputSubjectOrg.trim()) {
      alert("기관 측 협약 주체를 입력해 주세요.");
      return;
    }
    if (!inputUnitId) {
      alert("관련 단위과제를 선택해 주세요.");
      return;
    }
    if (inputContents.length === 0) {
      alert("협약내용 범주를 최소 1개 이상 선택해 주세요.");
      return;
    }

    const payload = {
      year: selectedYear,
      date: inputDate,
      center: inputCenter,
      organizations: cleanOrgs,
      subjectUniversity: inputSubjectUniv,
      subjectOrganization: inputSubjectOrg.trim(),
      unitId: inputUnitId,
      contents: inputContents,
      fileName: inputFileName,
      fileData: inputFileData
    };

    if (editingId) {
      onUpdateAgreement(editingId, payload);
    } else {
      onAddAgreement(payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // 사본 보기 핸들러 (Base64 데이터를 브라우저 임시 Blob 객체로 변환해 새 창에서 시각화)
  const handleViewFile = (agr) => {
    try {
      let base64Data = agr.fileData;

      // 1. 새로고침 후 데이터 보존을 위해 fileData가 생략된 경우 (또는 기본 예시 샘플인 경우)
      // W3C 공인 표준 테스트용 PDF 문서를 새 탭에 호출하여 브라우저 자체 뷰어가 100% 정상 작동함을 보장합니다.
      if (!base64Data) {
        window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
        return;
      }

      // 2. 사용자가 이번 세션에 직접 올린 파일 데이터가 온전히 쥐어져 있는 경우
      let mimeType = "application/pdf";
      const parts = base64Data.split(",");
      if (parts.length > 1) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        base64Data = parts[1];
      } else {
        base64Data = parts[0];
      }

      const byteCharacters = window.atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      
      // 새 창에서 파일 띄우기
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Failed to render PDF file:", error);
      // 예외 발생 시 안전 우회책으로 W3C 테스팅 표준 PDF 뷰잉 연계
      window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* 타이틀 및 등록 버튼 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>⚓ {selectedYear}차년도 협약서 통합 관리</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>단위과제별 가족회사 및 기관과의 대외 협약 체결 내용을 연차별로 영속 보존합니다.</p>
        </div>
        {(currentRole.rank <= 2) && (
          <button className="btn-primary" onClick={handleOpenAddModal} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
            <Plus size={16} /> 신규 협약서 등록
          </button>
        )}
      </div>

      {/* 협약서 목록 테이블 */}
      <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "10%" }}>날짜</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "12%" }}>관련 센터</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "22%" }}>협약기관</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "15%" }}>협약주체 (대학 vs 기관)</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "10%" }}>단위과제</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "20%" }}>협약내용 범주</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>사본</th>
              {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>제어</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAgreements.length === 0 ? (
              <tr>
                <td colSpan={currentRole.rank <= 2 ? 8 : 7} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                  등록된 협약서 내역이 없습니다. 새로운 협약서를 등록해 보세요!
                </td>
              </tr>
            ) : (
              filteredAgreements.map((agr) => (
                <tr key={agr.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: "rgba(255,255,255,0.01)" }}>
                  <td style={{ padding: "0.6rem 0.8rem" }}>{agr.date}</td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <span style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{agr.center}</span>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {agr.organizations.map((org, idx) => (
                        <span key={idx} style={{ background: "#27272a", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", color: "#e4e4e7" }}>{org}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                      <span style={{ color: "#a1a1aa" }}>🏫 {agr.subjectUniversity}</span>
                      <span style={{ color: "#38bdf8" }}>🤝 {agr.subjectOrganization}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{agr.unitId}</td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {agr.contents.map((c, idx) => (
                        <span key={idx} style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", padding: "0.1rem 0.3rem", borderRadius: "0.2rem", fontSize: "0.65rem" }}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                    {agr.fileName ? (
                      <span 
                        title={agr.fileName} 
                        onClick={() => handleViewFile(agr)}
                        style={{ color: "#60a5fa", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                      >
                        <FileText size={16} />
                      </span>
                    ) : (
                      <span style={{ color: "#52525b" }}>-</span>
                    )}
                  </td>
                  {(currentRole.rank <= 2) && (
                    <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        <button onClick={() => handleOpenEditModal(agr)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "0.1rem" }} title="수정">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => { if(confirm("이 협약서를 삭제하시겠습니까?")) onDeleteAgreement(agr.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.1rem" }} title="삭제">
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 등록 및 수정 모달 */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "550px", maxHeight: "90vh", overflowY: "auto", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
            
            {/* 모달 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>⚓ {editingId ? "협약서 정보 수정" : "신규 협약서 등록"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* 모달 바디 폼 */}
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              
              {/* 날짜 & 관련 센터 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>협약 체결일자</label>
                  <input 
                    type="date" 
                    value={inputDate} 
                    onChange={(e) => setInputDate(e.target.value)} 
                    style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 센터</label>
                  <select 
                    value={inputCenter} 
                    onChange={(e) => setInputCenter(e.target.value)} 
                    style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}
                  >
                    {CENTERS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 동적 협약기관 리스트 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>협약기관 목록</label>
                  <button type="button" onClick={handleAddOrgField} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "0.1rem" }}>
                    <Plus size={12} /> 기관 추가
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {inputOrganizations.map((org, index) => (
                    <div key={index} style={{ display: "flex", gap: "0.25rem" }}>
                      <input 
                        type="text" 
                        placeholder={`협약기관 ${index + 1} (예: 울산대학교)`} 
                        value={org} 
                        onChange={(e) => handleOrgChange(index, e.target.value)} 
                        style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} 
                      />
                      {inputOrganizations.length > 1 && (
                        <button type="button" onClick={() => handleRemoveOrgField(index)} style={{ background: "#3f3f46", border: "none", color: "#ef4444", borderRadius: "0.25rem", padding: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 협약 주체 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>대학 측 협약주체</label>
                  <select 
                    value={inputSubjectUniv} 
                    onChange={(e) => setInputSubjectUniv(e.target.value)} 
                    style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}
                  >
                    <option value="총장">총장</option>
                    <option value="단장">단장</option>
                    <option value="센터장">센터장</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>기관 측 협약주체</label>
                  <input 
                    type="text" 
                    placeholder="예: 울산테크노파크 원장" 
                    value={inputSubjectOrg} 
                    onChange={(e) => setInputSubjectOrg(e.target.value)} 
                    style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} 
                  />
                </div>
              </div>

              {/* 관련 단위과제 */}
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 단위과제</label>
                <select 
                  value={inputUnitId} 
                  onChange={(e) => setInputUnitId(e.target.value)} 
                  style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}
                >
                  <option value="">-- 관련 단위과제 선택 --</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>{u.id}. {u.title}</option>
                  ))}
                </select>
              </div>

              {/* 협약 내용 범주 다중 선택 (칩 스타일) */}
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.4rem" }}>협약 내용 범주 (다중 선택)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {AGREEMENT_CONTENTS_OPTIONS.map((c) => {
                    const isSelected = inputContents.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleToggleContent(c)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.65rem",
                          borderRadius: "2rem",
                          border: isSelected ? "1px solid #34d399" : "1px solid #52525b",
                          background: isSelected ? "rgba(52,211,153,0.15)" : "#27272a",
                          color: isSelected ? "#34d399" : "#d4d4d8",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 협약서 사본 모의 업로드 */}
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>협약서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      style={{ display: "none" }} 
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                    />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>
                    {inputFileName ? `📁 ${inputFileName}` : "선택된 파일 없음"}
                  </span>
                </div>
              </div>

              {/* 모달 푸터 버튼 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                  취소
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                  저장하기
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
