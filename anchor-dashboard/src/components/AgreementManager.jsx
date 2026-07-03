import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Trash, FileText, Upload, X, AlertTriangle, Download, Award as AwardIcon, FileCheck } from "lucide-react";
import * as XLSX from "xlsx";

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
  certificates = [],
  awards = [],
  selectedYear,
  agreementsSubTab = "agreements",
  onChangeAgreementsSubTab,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  onAddAward,
  onUpdateAward,
  onDeleteAward,
  currentRole
}) {
  // 1. 기존 협약서 모달 및 입력 폼 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inputDate, setInputDate] = useState("");
  const [inputCenter, setInputCenter] = useState("ECC센터");
  const [inputOrganizations, setInputOrganizations] = useState([{ name: "", subject: "" }]);
  const [inputSubjectUniv, setInputSubjectUniv] = useState("단장");
  const [inputUnitId, setInputUnitId] = useState("");
  const [inputContents, setInputContents] = useState([]);
  const [inputFileName, setInputFileName] = useState("");
  const [inputFileData, setInputFileData] = useState("");

  // 2. 이수증 모달 및 입력 폼 상태
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState(null);
  const [certNo, setCertNo] = useState("");
  const [certDept, setCertDept] = useState("");
  const [certName, setCertName] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certIssuer, setCertIssuer] = useState("사업단장");
  const [certFileName, setCertFileName] = useState("");
  const [certFileData, setCertFileData] = useState("");

  // 3. 상장 모달 및 입력 폼 상태
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState(null);
  const [awardNo, setAwardNo] = useState("");
  const [awardDept, setAwardDept] = useState("");
  const [awardName, setAwardName] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [awardIssuer, setAwardIssuer] = useState("사업단장");
  const [awardFileName, setAwardFileName] = useState("");
  const [awardFileData, setAwardFileData] = useState("");

  // 정렬 상태 관리
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
  const [certSortConfig, setCertSortConfig] = useState({ key: "date", direction: "asc" });
  const [awardSortConfig, setAwardSortConfig] = useState({ key: "date", direction: "asc" });

  // 엑셀 다운로드 URL 상태
  const [excelDownloadUrl, setExcelDownloadUrl] = useState("");

  // 단위과제 로드 (기존 동일)
  const getAvailableUnits = () => {
    const unitsMap = new Map();
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
        const hasYearPlan = u.programs?.some(prog => prog.years && prog.years[selectedYear]);
        if (hasYearPlan || selectedYear === 2) {
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

  // 날짜 범위 검증 (Y차년도: (2024 + Y)년 3월 1일 ~ (2024 + Y + 1)년 2월 말일)
  const isDateValidForYear = (dateStr, year) => {
    if (!dateStr) return false;
    const startYear = 2024 + year;
    const endYear = startYear + 1;
    const minDate = new Date(`${startYear}-03-01T00:00:00`);
    const maxDate = new Date(`${endYear}-03-01T00:00:00`);
    maxDate.setMilliseconds(-1);
    
    const selectedDate = new Date(`${dateStr}T00:00:00`);
    return selectedDate >= minDate && selectedDate <= maxDate;
  };

  // 필터링 목록 도출
  const filteredAgreements = agreements.filter(a => a.year === selectedYear);
  const filteredCertificates = certificates.filter(c => c.year === selectedYear);
  const filteredAwards = awards.filter(a => a.year === selectedYear);

  // 정렬 요청 핸들러 (협약)
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 정렬 요청 핸들러 (이수증)
  const requestCertSort = (key) => {
    let direction = "asc";
    if (certSortConfig.key === key && certSortConfig.direction === "asc") {
      direction = "desc";
    }
    setCertSortConfig({ key, direction });
  };

  // 정렬 요청 핸들러 (상장)
  const requestAwardSort = (key) => {
    let direction = "asc";
    if (awardSortConfig.key === key && awardSortConfig.direction === "asc") {
      direction = "desc";
    }
    setAwardSortConfig({ key, direction });
  };

  // 정렬된 협약 목록
  const getSortedAgreements = () => {
    const sorted = [...filteredAgreements];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  // 정렬된 이수증 목록
  const getSortedCertificates = () => {
    const sorted = [...filteredCertificates];
    const key = certSortConfig.key;
    if (key) {
      sorted.sort((a, b) => {
        let valA = (key === "date" ? a.issueDate : a[key]) || "";
        let valB = (key === "date" ? b.issueDate : b[key]) || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return certSortConfig.direction === "asc"
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        if (valA < valB) return certSortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return certSortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  // 정렬된 상장 목록
  const getSortedAwards = () => {
    const sorted = [...filteredAwards];
    const key = awardSortConfig.key;
    if (key) {
      sorted.sort((a, b) => {
        let valA = (key === "date" ? a.issueDate : a[key]) || "";
        let valB = (key === "date" ? b.issueDate : b[key]) || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return awardSortConfig.direction === "asc"
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        if (valA < valB) return awardSortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return awardSortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const sortedAgreements = getSortedAgreements();
  const sortedCertificates = getSortedCertificates();
  const sortedAwards = getSortedAwards();

  // 엑셀 다운로드 pre-generation 캐싱
  useEffect(() => {
    let excelData = [];
    let sheetName = "";
    let cols = [];

    if (agreementsSubTab === "agreements") {
      if (sortedAgreements.length === 0) {
        setExcelDownloadUrl("");
        return;
      }
      excelData = sortedAgreements.map((agr) => {
        let orgsStr = "";
        let orgSubjectsStr = "";
        if (Array.isArray(agr.organizations)) {
          if (typeof agr.organizations[0] === "object" && agr.organizations[0] !== null) {
            orgsStr = agr.organizations.map(o => o.name).join(", ");
            orgSubjectsStr = agr.organizations.map(o => `${o.name}(${o.subject || "주체없음"})`).join(", ");
          } else {
            orgsStr = agr.organizations.join(", ");
            orgSubjectsStr = agr.subjectOrganization || "";
          }
        }
        return {
          "체결일자": agr.date || "",
          "관련 센터": agr.center || "",
          "협약 대상기관": orgsStr,
          "대학 측 협약주체(UC)": agr.subjectUniversity || "",
          "기관 측 협약주체": orgSubjectsStr,
          "관련 단위과제": agr.unitId || "",
          "협약내용 범주": Array.isArray(agr.contents) ? agr.contents.join(", ") : "",
          "사본 파일명": agr.fileName || "미첨부"
        };
      });
      sheetName = `${selectedYear}차년도 협약서 목록`;
      cols = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 30 }, { wch: 35 }];
    } else if (agreementsSubTab === "certificates") {
      if (sortedCertificates.length === 0) {
        setExcelDownloadUrl("");
        return;
      }
      excelData = sortedCertificates.map((c) => ({
        "발급번호": c.certNo || "",
        "발급대상 소속": c.recipientDept || "",
        "발급대상 성명": c.recipientName || "",
        "발급일자": c.issueDate || "",
        "발급주체": c.issuer || "",
        "사본 파일명": c.fileName || "미첨부"
      }));
      sheetName = `${selectedYear}차년도 이수증 발급 목록`;
      cols = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 35 }];
    } else if (agreementsSubTab === "awards") {
      if (sortedAwards.length === 0) {
        setExcelDownloadUrl("");
        return;
      }
      excelData = sortedAwards.map((a) => ({
        "발급번호": a.awardNo || "",
        "발급대상 소속": a.recipientDept || "",
        "발급대상 성명": a.recipientName || "",
        "발급일자": a.issueDate || "",
        "발급주체": a.issuer || "",
        "사본 파일명": a.fileName || "미첨부"
      }));
      sheetName = `${selectedYear}차년도 상장 발급 목록`;
      cols = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 35 }];
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = cols;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const b64out = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
      setExcelDownloadUrl(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64out}`);
    } catch (err) {
      console.error("Excel generation error:", err);
      setExcelDownloadUrl("");
    }
  }, [sortedAgreements, sortedCertificates, sortedAwards, selectedYear, agreementsSubTab]);

  // 1-1. 협약기관 동적 추가/제거
  const handleAddOrgField = () => {
    setInputOrganizations([...inputOrganizations, { name: "", subject: "" }]);
  };

  const handleRemoveOrgField = (index) => {
    if (inputOrganizations.length <= 1) return;
    setInputOrganizations(inputOrganizations.filter((_, i) => i !== index));
  };

  const handleOrgChange = (index, field, value) => {
    const updated = [...inputOrganizations];
    updated[index] = { ...updated[index], [field]: value };
    setInputOrganizations(updated);
  };

  const handleToggleContent = (content) => {
    if (inputContents.includes(content)) {
      setInputContents(inputContents.filter(c => c !== content));
    } else {
      setInputContents([...inputContents, content]);
    }
  };

  // 모의 파일 업로드 (Base64 변환)
  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === "agreement") {
          setInputFileName(file.name);
          setInputFileData(reader.result);
        } else if (target === "certificate") {
          setCertFileName(file.name);
          setCertFileData(reader.result);
        } else if (target === "award") {
          setAwardFileName(file.name);
          setAwardFileData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 사본 뷰어 팝업 연동
  const handleViewFile = (fileData) => {
    try {
      if (!fileData) {
        window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
        return;
      }
      let mimeType = "application/pdf";
      let base64 = fileData;
      const parts = fileData.split(",");
      if (parts.length > 1) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64 = parts[1];
      }
      const byteCharacters = window.atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (e) {
      window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
    }
  };

  // 1-2. 협약 등록 폼 초기화
  const resetForm = () => {
    setEditingId(null);
    setInputDate("");
    setInputCenter("ECC센터");
    setInputOrganizations([{ name: "", subject: "" }]);
    setInputSubjectUniv("단장");
    setInputUnitId(availableUnits[0]?.id || "");
    setInputContents([]);
    setInputFileName("");
    setInputFileData("");
  };

  // 2-1. 이수증 폼 초기화
  const resetCertForm = () => {
    setEditingCertId(null);
    setCertNo("");
    setCertDept("");
    setCertName("");
    setCertDate("");
    setCertIssuer("사업단장");
    setCertFileName("");
    setCertFileData("");
  };

  // 3-1. 상장 폼 초기화
  const resetAwardForm = () => {
    setEditingAwardId(null);
    setAwardNo("");
    setAwardDept("");
    setAwardName("");
    setAwardDate("");
    setAwardIssuer("사업단장");
    setAwardFileName("");
    setAwardFileData("");
  };

  // 1-3. 협약 저장 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputDate) return alert("협약 체결일자를 선택해 주세요.");
    if (!isDateValidForYear(inputDate, selectedYear)) {
      alert(`${selectedYear}차년도 사업기간은 ${2024 + selectedYear}년 03월 01일부터 ${2024 + selectedYear + 1}년 02월 말일까지입니다.\n선택하신 날짜는 범위에 해당되지 않습니다.`);
      return;
    }
    const cleanOrgs = inputOrganizations.map(o => ({ name: o.name.trim(), subject: o.subject.trim() })).filter(o => o.name);
    if (cleanOrgs.length === 0) return alert("협약 대상기관을 입력해 주세요.");
    if (cleanOrgs.some(o => !o.subject)) return alert("기관 측 협약주체를 입력해 주세요.");
    if (!inputUnitId) return alert("관련 단위과제를 선택해 주세요.");
    if (inputContents.length === 0) return alert("협약내용 범주를 선택해 주세요.");

    const combinedSubjectOrg = cleanOrgs.map(o => `${o.name} (${o.subject})`).join(", ");
    const payload = {
      year: selectedYear,
      date: inputDate,
      center: inputCenter,
      organizations: cleanOrgs,
      subjectUniversity: inputSubjectUniv,
      subjectOrganization: combinedSubjectOrg,
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

  // 2-2. 이수증 저장 핸들러
  const handleCertSubmit = (e) => {
    e.preventDefault();
    if (!certNo.trim()) return alert("발급번호를 입력해 주세요.");
    if (!certDept.trim()) return alert("발급대상 소속을 입력해 주세요.");
    if (!certName.trim()) return alert("발급대상 성명을 입력해 주세요.");
    if (!certDate) return alert("발급일을 선택해 주세요.");
    if (!isDateValidForYear(certDate, selectedYear)) {
      alert(`${selectedYear}차년도 사업기간은 ${2024 + selectedYear}년 03월 01일부터 ${2024 + selectedYear + 1}년 02월 말일까지입니다.\n선택하신 날짜는 범위에 해당되지 않습니다.`);
      return;
    }

    const payload = {
      year: selectedYear,
      certNo: certNo.trim(),
      recipientDept: certDept.trim(),
      recipientName: certName.trim(),
      issueDate: certDate,
      issuer: certIssuer,
      fileName: certFileName,
      fileData: certFileData
    };

    if (editingCertId) {
      onUpdateCertificate(editingCertId, payload);
    } else {
      onAddCertificate(payload);
    }
    setIsCertModalOpen(false);
    resetCertForm();
  };

  // 3-2. 상장 저장 핸들러
  const handleAwardSubmit = (e) => {
    e.preventDefault();
    if (!awardNo.trim()) return alert("발급번호를 입력해 주세요.");
    if (!awardDept.trim()) return alert("발급대상 소속을 입력해 주세요.");
    if (!awardName.trim()) return alert("발급대상 성명을 입력해 주세요.");
    if (!awardDate) return alert("발급일을 선택해 주세요.");
    if (!isDateValidForYear(awardDate, selectedYear)) {
      alert(`${selectedYear}차년도 사업기간은 ${2024 + selectedYear}년 03월 01일부터 ${2024 + selectedYear + 1}년 02월 말일까지입니다.\n선택하신 날짜는 범위에 해당되지 않습니다.`);
      return;
    }

    const payload = {
      year: selectedYear,
      awardNo: awardNo.trim(),
      recipientDept: awardDept.trim(),
      recipientName: awardName.trim(),
      issueDate: awardDate,
      issuer: awardIssuer,
      fileName: awardFileName,
      fileData: awardFileData
    };

    if (editingAwardId) {
      onUpdateAward(editingAwardId, payload);
    } else {
      onAddAward(payload);
    }
    setIsAwardModalOpen(false);
    resetAwardForm();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      
      {/* 탭 헤더 컨트롤 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            onClick={() => onChangeAgreementsSubTab("agreements")}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              borderRadius: "0.3rem 0.3rem 0 0",
              border: "none",
              background: agreementsSubTab === "agreements" ? "var(--accent-color)" : "transparent",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            ⚓ 협약 관리
          </button>
          <button 
            onClick={() => onChangeAgreementsSubTab("certificates")}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              borderRadius: "0.3rem 0.3rem 0 0",
              border: "none",
              background: agreementsSubTab === "certificates" ? "var(--accent-color)" : "transparent",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            📄 이수증 관리
          </button>
          <button 
            onClick={() => onChangeAgreementsSubTab("awards")}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              borderRadius: "0.3rem 0.3rem 0 0",
              border: "none",
              background: agreementsSubTab === "awards" ? "var(--accent-color)" : "transparent",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            🏆 상장 관리
          </button>
        </div>

        {/* 신규 등록 & 엑셀 다운로드 제어부 */}
        {(currentRole.rank <= 2) && (
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <a 
              href={excelDownloadUrl || "#"}
              download={excelDownloadUrl ? `${agreementsSubTab === "agreements" ? "Agreement" : agreementsSubTab === "certificates" ? "Certificate" : "Award"}_List_Year_${selectedYear}.xlsx` : undefined}
              onClick={(e) => {
                if (!excelDownloadUrl) {
                  e.preventDefault();
                  alert("다운로드할 데이터가 없습니다.");
                }
              }}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.25rem", 
                padding: "0.35rem 0.7rem", 
                fontSize: "0.7rem", 
                background: "#16a34a", 
                border: "none", 
                color: "white", 
                borderRadius: "0.25rem", 
                cursor: excelDownloadUrl ? "pointer" : "not-allowed", 
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              <Download size={12} /> 엑셀 다운로드
            </a>
            {currentRole.id !== "GUEST" && agreementsSubTab === "agreements" && (
              <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7 child", fontSize: "0.7rem" }}>
                <Plus size={14} /> 신규 협약서 등록
              </button>
            )}
            {currentRole.id !== "GUEST" && agreementsSubTab === "certificates" && (
              <button className="btn-primary" onClick={() => { resetCertForm(); setIsCertModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7 child", fontSize: "0.7rem" }}>
                <Plus size={14} /> 신규 이수증 등록
              </button>
            )}
            {currentRole.id !== "GUEST" && agreementsSubTab === "awards" && (
              <button className="btn-primary" onClick={() => { resetAwardForm(); setIsAwardModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7 child", fontSize: "0.7rem" }}>
                <Plus size={14} /> 신규 상장 등록
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. 협약 관리 View */}
      {agreementsSubTab === "agreements" && (
        <>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "white" }}>⚓ {selectedYear}차년도 협약서 통합 관리</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>단위과제별 가족회사 및 기관과의 대외 협약 체결 내용을 연차별로 영속 보존합니다.</p>
          </div>

          {filteredAgreements.filter(a => !isDateValidForYear(a.date, selectedYear)).length > 0 && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "0.375rem", padding: "0.6rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle color="#ef4444" size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", color: "#fca5a5" }}>
                <strong>⚠️ 사업기간 불일치 협약서 감지:</strong> 선택하신 차년도의 정식 사업기간을 벗어난 체결 건이 있습니다. 수정 아이콘을 통해 일자를 조정하십시오.
              </span>
            </div>
          )}

          <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
                  <th onClick={() => requestSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "12%", cursor: "pointer" }}>
                    날짜 {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th onClick={() => requestSort("center")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "12%", cursor: "pointer" }}>
                    관련 센터 {sortConfig.key === "center" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "18%" }}>협약기관</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "24%" }}>협약주체 (UC & 타기관)</th>
                  <th onClick={() => requestSort("unitId")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "10%", cursor: "pointer" }}>
                    단위과제 {sortConfig.key === "unitId" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "14%" }}>협약내용 범주</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>사본</th>
                  {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>제어</th>}
                </tr>
              </thead>
              <tbody>
                {sortedAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole.rank <= 2 ? 8 : 7} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                      등록된 협약서 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedAgreements.map((agr) => {
                    const hasInvalidDate = !isDateValidForYear(agr.date, selectedYear);
                    return (
                      <tr key={agr.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: hasInvalidDate ? "rgba(239, 68, 68, 0.03)" : "rgba(255,255,255,0.01)" }}>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{agr.date}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          <span style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{agr.center}</span>
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          {Array.isArray(agr.organizations) ? (
                            agr.organizations.map((org, i) => (
                              <span key={i} style={{ background: "#27272a", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", color: "#e4e4e7", marginRight: "0.2rem" }}>
                                {typeof org === "object" ? org.name : org}
                              </span>
                            ))
                          ) : (
                            <span style={{ background: "#27272a", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", color: "#e4e4e7" }}>{agr.organizations}</span>
                          )}
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                            <span style={{ color: "#a1a1aa" }}>🏫 UC: {agr.subjectUniversity}</span>
                            <span style={{ color: "#38bdf8" }}>🤝 타기관: {agr.subjectOrganization}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{agr.unitId}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          {Array.isArray(agr.contents) && agr.contents.map((c, i) => (
                            <span key={i} style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", padding: "0.1rem 0.3rem", borderRadius: "0.2rem", fontSize: "0.65rem", marginRight: "0.2rem" }}>{c}</span>
                          ))}
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          {agr.fileName ? (
                            <FileText size={16} style={{ color: "#60a5fa", cursor: "pointer" }} onClick={() => handleViewFile(agr.fileData)} />
                          ) : "-"}
                        </td>
                        {(currentRole.rank <= 2) && (
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                              {currentRole.id !== "GUEST" && (
                                <>
                                  <button onClick={() => {
                                    setEditingId(agr.id);
                                    setInputDate(agr.date || "");
                                    setInputCenter(agr.center || "ECC센터");
                                    setInputOrganizations(Array.isArray(agr.organizations) ? agr.organizations.map(o => typeof o === "object" ? { name: o.name || "", subject: o.subject || "" } : { name: o, subject: "" }) : [{ name: "", subject: "" }]);
                                    setInputSubjectUniv(agr.subjectUniversity || "단장");
                                    setInputUnitId(agr.unitId || "");
                                    setInputContents(Array.isArray(agr.contents) ? [...agr.contents] : []);
                                    setInputFileName(agr.fileName || "");
                                    setInputFileData(agr.fileData || "");
                                    setIsModalOpen(true);
                                  }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }} title="수정">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => { if(confirm("이 협약서를 삭제하시겠습니까?")) onDeleteAgreement(agr.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
                                    <Trash size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 2. 이수증 관리 View */}
      {agreementsSubTab === "certificates" && (
        <>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "white" }}>📄 {selectedYear}차년도 이수증 발급 내역</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>교육과정 및 세미나 이수증 발급 대장을 영속 보존합니다.</p>
          </div>

          <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
                  <th onClick={() => requestCertSort("certNo")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "20%", cursor: "pointer" }}>
                    발급번호 {certSortConfig.key === "certNo" ? (certSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "35%" }}>발급대상 인적사항</th>
                  <th onClick={() => requestCertSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "15%", cursor: "pointer" }}>
                    발급일 {certSortConfig.key === "date" ? (certSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "18%" }}>발급주체</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>사본</th>
                  {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>제어</th>}
                </tr>
              </thead>
              <tbody>
                {sortedCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole.rank <= 2 ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                      등록된 이수증 발급 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedCertificates.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{cert.certNo}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ color: "#a1a1aa", marginRight: "0.4rem" }}>[{cert.recipientDept}]</span>
                        <strong style={{ color: "white" }}>{cert.recipientName}</strong>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>{cert.issueDate}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{cert.issuer}</span>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        {cert.fileName ? (
                          <FileCheck size={16} style={{ color: "#34d399", cursor: "pointer" }} onClick={() => handleViewFile(cert.fileData)} />
                        ) : "-"}
                      </td>
                      {(currentRole.rank <= 2) && (
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button onClick={() => {
                                  setEditingCertId(cert.id);
                                  setCertNo(cert.certNo || "");
                                  setCertDept(cert.recipientDept || "");
                                  setCertName(cert.recipientName || "");
                                  setCertDate(cert.issueDate || "");
                                  setCertIssuer(cert.issuer || "사업단장");
                                  setCertFileName(cert.fileName || "");
                                  setCertFileData(cert.fileData || "");
                                  setIsCertModalOpen(true);
                                }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }} title="수정">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => { if(confirm("이 이수증을 삭제하시겠습니까?")) onDeleteCertificate(cert.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
                                  <Trash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 3. 상장 관리 View */}
      {agreementsSubTab === "awards" && (
        <>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "white" }}>🏆 {selectedYear}차년도 상장 발급 내역</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>공모전 및 경진대회 상장 발급 대장을 영속 보존합니다.</p>
          </div>

          <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
                  <th onClick={() => requestAwardSort("awardNo")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "20%", cursor: "pointer" }}>
                    발급번호 {awardSortConfig.key === "awardNo" ? (awardSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "35%" }}>발급대상 인적사항</th>
                  <th onClick={() => requestAwardSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "15%", cursor: "pointer" }}>
                    발급일 {awardSortConfig.key === "date" ? (awardSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "18%" }}>발급주체</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>사본</th>
                  {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>제어</th>}
                </tr>
              </thead>
              <tbody>
                {sortedAwards.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole.rank <= 2 ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                      등록된 상장 발급 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedAwards.map((award) => (
                    <tr key={award.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{award.awardNo}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ color: "#a1a1aa", marginRight: "0.4rem" }}>[{award.recipientDept}]</span>
                        <strong style={{ color: "white" }}>{award.recipientName}</strong>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>{award.issueDate}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ background: "rgba(167,139,250,0.1)", color: "#c084fc", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{award.issuer}</span>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        {award.fileName ? (
                          <AwardIcon size={16} style={{ color: "#f59e0b", cursor: "pointer" }} onClick={() => handleViewFile(award.fileData)} />
                        ) : "-"}
                      </td>
                      {(currentRole.rank <= 2) && (
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button onClick={() => {
                                  setEditingAwardId(award.id);
                                  setAwardNo(award.awardNo || "");
                                  setAwardDept(award.recipientDept || "");
                                  setAwardName(award.recipientName || "");
                                  setAwardDate(award.issueDate || "");
                                  setAwardIssuer(award.issuer || "사업단장");
                                  setAwardFileName(award.fileName || "");
                                  setAwardFileData(award.fileData || "");
                                  setIsAwardModalOpen(true);
                                }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }} title="수정">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => { if(confirm("이 상장을 삭제하시겠습니까?")) onDeleteAward(award.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
                                  <Trash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* A. 협약서 등록 및 수정 모달 */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "550px", maxHeight: "90vh", overflowY: "auto", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>⚓ {editingId ? "협약서 정보 수정" : "신규 협약서 등록"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>협약 체결일자</label>
                  <input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 센터</label>
                  <select value={inputCenter} onChange={(e) => setInputCenter(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                    {CENTERS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>협약 대상기관 및 기관 측 협약주체 목록</label>
                  <button type="button" onClick={handleAddOrgField} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "0.1rem" }}>
                    <Plus size={12} /> 기관 추가
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.40rem" }}>
                  {inputOrganizations.map((org, index) => (
                    <div key={index} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                      <input type="text" placeholder={`협약 대상기관 ${index + 1}`} value={org.name || ""} onChange={(e) => handleOrgChange(index, "name", e.target.value)} style={{ flex: 1.3, padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                      <input type="text" placeholder="직위/성명 (예: 총장 오연천)" value={org.subject || ""} onChange={(e) => handleOrgChange(index, "subject", e.target.value)} style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                      {inputOrganizations.length > 1 && (
                        <button type="button" onClick={() => handleRemoveOrgField(index)} style={{ background: "#3f3f46", border: "none", color: "#ef4444", borderRadius: "0.25rem", padding: "0.25rem", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>대학 측 협약주체 (UC)</label>
                <select value={inputSubjectUniv} onChange={(e) => setInputSubjectUniv(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                  <option value="총장">총장</option>
                  <option value="단장">단장</option>
                  <option value="센터장">센터장</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 단위과제</label>
                <select value={inputUnitId} onChange={(e) => setInputUnitId(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                  <option value="">-- 관련 단위과제 선택 --</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>{u.id}. {u.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.4rem" }}>협약 내용 범주 (다중 선택)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {AGREEMENT_CONTENTS_OPTIONS.map((c) => {
                    const isSelected = inputContents.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => handleToggleContent(c)} style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem", borderRadius: "2rem", border: isSelected ? "1px solid #34d399" : "1px solid #52525b", background: isSelected ? "rgba(52,211,153,0.15)" : "#27272a", color: isSelected ? "#34d399" : "#d4d4d8", cursor: "pointer" }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>협약서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "agreement")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{inputFileName ? `📁 ${inputFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. 이수증 등록 및 수정 모달 */}
      {isCertModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "500px", maxHeight: "90vh", overflowY: "auto", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>📄 {editingCertId ? "이수증 정보 수정" : "신규 이수증 등록"}</h3>
              <button onClick={() => setIsCertModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCertSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급번호</label>
                <input type="text" placeholder="예: 제 2026-이수-0001 호" value={certNo} onChange={(e) => setCertNo(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 소속</label>
                  <input type="text" placeholder="예: 울산과학대학교" value={certDept} onChange={(e) => setCertDept(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 성명</label>
                  <input type="text" placeholder="예: 홍길동" value={certName} onChange={(e) => setCertName(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급일자</label>
                  <input type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급주체</label>
                  <select value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                    <option value="사업단장">사업단장</option>
                    <option value="늘봄누리센터장">늘봄누리센터장</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>증서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "certificate")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{certFileName ? `📁 ${certFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCertModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. 상장 등록 및 수정 모달 */}
      {isAwardModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "500px", maxHeight: "90vh", overflowY: "auto", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>🏆 {editingAwardId ? "상장 정보 수정" : "신규 상장 등록"}</h3>
              <button onClick={() => setIsAwardModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAwardSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급번호</label>
                <input type="text" placeholder="예: 제 2026-상장-0001 호" value={awardNo} onChange={(e) => setAwardNo(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 소속</label>
                  <input type="text" placeholder="예: 울산과학대학교" value={awardDept} onChange={(e) => setAwardDept(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 성명</label>
                  <input type="text" placeholder="예: 홍길동" value={awardName} onChange={(e) => setAwardName(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급일자</label>
                  <input type="date" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급주체</label>
                  <select value={awardIssuer} onChange={(e) => setAwardIssuer(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                    <option value="사업단장">사업단장</option>
                    <option value="늘봄누리센터장">늘봄누리센터장</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>상장 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "award")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{awardFileName ? `📁 ${awardFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAwardModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
