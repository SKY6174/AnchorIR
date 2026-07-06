import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Edit, Trash, FileText, Upload, X, AlertTriangle, Download, FileCheck, Award } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient";



const getAcademicYear = (dateStr) => {
  if (!dateStr) return new Date().getFullYear();
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month <= 2 ? year - 1 : year;
};

const getDynamicTeamName = (dateStr) => {
  if (!dateStr) return "RISE사업단";
  const date = new Date(dateStr);
  const splitDate = new Date("2026-07-01");
  return date >= splitDate ? "앵커사업단" : "RISE사업단";
};

export default function UnifiedCertificateManager({
  projects = [],
  certificates = [],
  selectedYear,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  setCertificates,
  currentRole,
  members = [],
  managerType = "all" // "award", "certificate", or "all"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  
  // 폼 필드
  const [managerDept, setManagerDept] = useState("");
  const [managerName, setManagerName] = useState("");
  const [certNo, setCertNo] = useState("");
  const defaultType = managerType === "award" ? "상장" : "이수증";
  const [certType, setCertType] = useState(defaultType);
  const [note, setNote] = useState("");
  const [teamName, setTeamName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [projectGroup, setProjectGroup] = useState("");
  const [issuer, setIssuer] = useState("사업단장");
  const [content, setContent] = useState("");
  const [awardType, setAwardType] = useState("");
  
  const departmentMembers = React.useMemo(() => {
    const map = {
      "ECC센터": [],
      "ICC센터": [],
      "RCC센터": [],
      "AID-X지원센터": [],
      "울산늘봄누리센터": [],
      "신산업특화센터": [],
      "기타": []
    };
    if (members && Array.isArray(members)) {
      members.forEach(m => {
        if (m.dept && m.name && m.status !== "미참여" && m.role === "연구원") {
          const d = m.dept.trim();
          if (map[d]) {
            map[d].push(m.name);
          }
        }
      });
    }
    Object.keys(map).forEach(key => {
      map[key] = [...new Set(map[key])];
    });
    return map;
  }, [members]);

  useEffect(() => {
    if (issueDate && certNo) {
      const acYear = getAcademicYear(issueDate);
      const match = certNo.match(/^제\d*-(.*호)$/);
      if (match) {
        setCertNo(`제${acYear}-${match[1]}`);
      }
    }
    
    const newDynamicName = getDynamicTeamName(issueDate);
    const oldDynamicName = newDynamicName === "RISE사업단" ? "앵커사업단" : "RISE사업단";
    if (projectGroup === oldDynamicName || !projectGroup) {
      setProjectGroup(newDynamicName);
    }
    if (issuer === `${oldDynamicName}장` || !issuer) {
      setIssuer(`${newDynamicName}장`);
    }
  }, [issueDate]);

  useEffect(() => {
    if (!issueDate) return;
    const date = new Date(issueDate);
    const riseStart = new Date("2025-03-01");
    const anchorStart = new Date("2026-07-01");
    if (date >= anchorStart) {
      setIssuer("산학협력단장, 앵커사업단장");
    } else if (date >= riseStart) {
      setIssuer("산학협력단장, RISE사업단장");
    } else {
      setIssuer("산학협력단장");
    }
  }, [issueDate]);

  const [sortConfig, setSortConfig] = useState({ key: "issueDate", direction: "desc" });

  const filteredCerts = certificates.filter(c => c.year === selectedYear);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedCerts = () => {
    const sorted = [...filteredCerts];
    const key = sortConfig.key;
    if (key) {
      sorted.sort((a, b) => {
        let valA = a[key] || "";
        let valB = b[key] || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
    }
    return sorted;
  };

  const openModalForNew = () => {
    setEditingId(null);
    setManagerDept("");
    setManagerName("");
    setCertNo("");
    setCertType(defaultType);
    setNote("");
    setTeamName("");
    setRecipientName("");
    setStudentId("");
    setBirthDate("");
    setPhone("");
    setIssueDate("");
    setProjectGroup("");
    setIssuer("사업단장");
    setContent("");
    setAwardType("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (cert) => {
    setEditingId(cert.id);
    setManagerDept(cert.managerDept || "");
    setManagerName(cert.managerName || "");
    setCertNo(cert.certNo || "");
    setCertType(cert.certType || defaultType);
    setNote(cert.note || "");
    setTeamName(cert.teamName || "");
    setRecipientName(cert.recipientName || "");
    setStudentId(cert.studentId || "");
    setBirthDate(cert.birthDate || "");
    setPhone(cert.phone || "");
    setIssueDate(cert.issueDate || "");
    setProjectGroup(cert.projectGroup || "");
    setIssuer(cert.issuer || "사업단장");
    setContent(cert.content || "");
    setAwardType(cert.awardType || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientName || !certType) {
      alert("성명과 구분(상장/이수증 등)은 필수입니다.");
      return;
    }
    const payload = {
      year: selectedYear,
      managerDept,
      managerName,
      certNo,
      certType,
      note,
      teamName,
      recipientName,
      studentId,
      birthDate,
      phone,
      issueDate,
      projectGroup,
      issuer,
      content,
      awardType
    };

    if (editingId) {
      onUpdateCertificate(editingId, payload);
    } else {
      onAddCertificate(payload);
    }
    setIsModalOpen(false);
  };

  const getSequenceErrors = () => {
    const certsByYear = {};
    filteredCerts.forEach(c => {
      if (!c.certNo) return;
      const acYear = getAcademicYear(c.issueDate);
      if (!certsByYear[acYear]) certsByYear[acYear] = [];
      const match = c.certNo.match(/(\d+)[^\d]*$/);
      if (match) {
        certsByYear[acYear].push(parseInt(match[1], 10));
      }
    });

    let allDuplicates = [];
    let allGaps = [];

    Object.keys(certsByYear).forEach(year => {
      const numbers = certsByYear[year].filter(n => !isNaN(n)).sort((a, b) => a - b);
      if (numbers.length === 0) return;

      let duplicates = [];
      let gaps = [];
      const seen = new Set();
      numbers.forEach(n => {
        if (seen.has(n)) duplicates.push(`${year}년도 ${n}번`);
        seen.add(n);
      });
      
      const max = numbers[numbers.length - 1];
      for (let i = 1; i <= max; i++) {
        if (!seen.has(i)) {
          gaps.push(`${year}년도 ${i}번`);
        }
      }
      allDuplicates.push(...duplicates);
      allGaps.push(...gaps);
    });

    if (allDuplicates.length > 0 || allGaps.length > 0) {
      return { duplicates: [...new Set(allDuplicates)], gaps: allGaps };
    }
    return null;
  };

  const sequenceErrors = getSequenceErrors();


  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length <= 1) return;
        const rows = data.slice(1);
        const imported = rows.filter(row => row[7]).map(row => { // 성명이 인덱스 7
          return {
            year: selectedYear,
            certNo: row[0] || "",
            managerDept: row[1] || "",
            managerName: row[2] || "",
            certType: row[3] || defaultType,
            awardType: row[4] || "",
            note: row[5] || "",
            teamName: row[6] || "",
            recipientName: row[7] || "",
            studentId: row[8] || "",
            birthDate: row[9] || "",
            phone: row[10] || "",
            issueDate: row[11] || "",
            projectGroup: row[12] || "",
            issuer: row[13] || "",
            content: row[14] || ""
          };
        });
        if (imported.length > 0) {
          if (window.confirm(`${imported.length}건을 추가하시겠습니까?`)) {
            imported.forEach(cert => onAddCertificate(cert));
            alert("업로드 성공");
          }
        }
      } catch (err) {
        console.error(err);
        alert("엑셀 파싱 오류");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const downloadExcel = () => {
    const headers = [
      "증서번호", "담당자-소속", "담당자-성명", "상장/수료증/이수증", "상훈", "비고", 
      "팀명", "성명", "학번", "생년월일", "휴대폰", "수상일(수료일)",
      "사업단명", "발급자명의", "시상내용(과정명)"
    ];
    const data = getSortedCerts().map((c) => [
      c.certNo, c.managerDept, c.managerName, c.certType, c.awardType, c.note, 
      c.teamName, c.recipientName, c.studentId, c.birthDate, c.phone, c.issueDate,
      c.projectGroup, c.issuer, c.content
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Auto width
    const colWidths = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const sheetName = managerType === "award" ? "상장" : (managerType === "certificate" ? "이수증" : "상장_이수증");
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}_${selectedYear}년차.xlsx`);
  };

  const titleText = managerType === "award" ? "상장 관리" : (managerType === "certificate" ? "이수증 및 수료증 관리" : "통합 상장∙이수증 관리");

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Award size={24} color="var(--accent-color)" />
          {titleText}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {currentRole?.id !== "GUEST" && (
            <button className="action-btn upload-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> 엑셀 업로드
            </button>
          )}
          <button className="action-btn download-btn" onClick={downloadExcel}>
            <Download size={16} /> 엑셀 다운로드
          </button>
          <input type="file" ref={fileInputRef} onChange={handleExcelUpload} accept=".xlsx, .xls" style={{ display: "none" }} />
          {currentRole?.id !== "GUEST" && (
            <button className="action-btn add-btn" onClick={openModalForNew}>
              <Plus size={16} /> 신규 등록
            </button>
          )}
        </div>
      </div>

      <div className="table-container" style={{ overflowX: "auto" }}>
        {sequenceErrors && (
          <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <AlertTriangle color="#ef4444" size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
              <strong style={{ color: "#ef4444" }}>증서번호 연속성 오류 알림:</strong><br />
              {sequenceErrors.duplicates.length > 0 && <span>• 중복 번호: {sequenceErrors.duplicates.join(", ")}<br /></span>}
              {sequenceErrors.gaps.length > 0 && <span>• 누락 번호: {sequenceErrors.gaps.join(", ")}<br /></span>}
              <span style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>데이터 무결성을 위해 증서번호를 확인해 주세요.</span>
            </div>
          </div>
        )}
        <table className="data-table" style={{ minWidth: "1600px" }}>
          <thead>
            <tr>
              <th onClick={() => requestSort("certNo")} style={{ cursor: "pointer" }}>증서번호</th>
              <th onClick={() => requestSort("certType")} style={{ cursor: "pointer" }}>구분</th>
              <th onClick={() => requestSort("awardType")} style={{ cursor: "pointer" }}>상훈</th>
              <th onClick={() => requestSort("teamName")} style={{ cursor: "pointer" }}>팀명</th>
              <th onClick={() => requestSort("recipientName")} style={{ cursor: "pointer" }}>성명</th>
              <th onClick={() => requestSort("studentId")} style={{ cursor: "pointer" }}>학번</th>
              <th onClick={() => requestSort("issueDate")} style={{ cursor: "pointer" }}>수상(수료)일</th>
              <th>사업단명</th>
              <th>발급자</th>
              <th>시상내용(과정명)</th>
              <th onClick={() => requestSort("managerDept")} style={{ cursor: "pointer" }}>담당자 소속</th>
              <th onClick={() => requestSort("managerName")} style={{ cursor: "pointer" }}>담당자 성명</th>
              <th>비고</th>
              {currentRole?.id !== "GUEST" && <th>관리</th>}
            </tr>
          </thead>
          <tbody>
            {getSortedCerts().length > 0 ? (
              getSortedCerts().map((c, idx) => (
                <tr key={c.id}>
                  <td>{c.certNo}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`status-badge ${c.certType === "상장" ? "completed" : "ongoing"}`}>
                      {c.certType}
                    </span>
                  </td>
                  <td>{c.awardType}</td>
                  <td>{c.teamName}</td>
                  <td style={{ fontWeight: "bold" }}>{c.recipientName}</td>
                  <td>{c.studentId}</td>
                  <td style={{ textAlign: "center" }}>{c.issueDate}</td>
                  <td>{c.projectGroup}</td>
                  <td>{c.issuer}</td>
                  <td>{c.content}</td>
                  <td>{c.managerDept}</td>
                  <td>{c.managerName}</td>
                  <td>{c.note}</td>
                  {currentRole?.id !== "GUEST" && (
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button className="icon-btn edit-btn" onClick={() => openModalForEdit(c)} title="수정">
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => window.confirm("삭제하시겠습니까?") && onDeleteCertificate(c.id)} title="삭제">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentRole?.id !== "GUEST" ? 14 : 13} style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ color: "var(--text-tertiary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <FileText size={48} style={{ opacity: 0.2 }} />
                    <p>등록된 내역이 없습니다.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }} onClick={() => setIsModalOpen(false)}>
          <div style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", width: "100%", maxWidth: "800px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "var(--text-primary)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>{editingId ? "내역 수정" : "신규 내역 등록"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* 1st Row: 수상(수료)일, 증서번호 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>수상(수료)일</label>
                    <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", colorScheme: "dark" }} className="date-input" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>증서번호</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>제{getAcademicYear(issueDate)}-</span>
                      <input 
                        type="text" 
                        value={(certNo || "").replace(/^제\d*-?/, '').replace(/호$/, '')} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val) {
                            setCertNo(`제${getAcademicYear(issueDate)}-${val}호`);
                          } else {
                            setCertNo("");
                          }
                        }} 
                        placeholder="001" 
                        style={{ flex: 1, minWidth: "50px", padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} 
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>호</span>
                    </div>
                  </div>
                </div>

                {/* 2nd Row: 구분, 상훈(상장), 팀명(상장) */}
                <div style={{ display: "grid", gridTemplateColumns: certType === "상장" ? "1fr 1fr 1fr" : "1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>구분 <span style={{ color: "red" }}>*</span></label>
                    <select value={certType} onChange={e => {
                      setCertType(e.target.value);
                      if (e.target.value !== "상장") {
                        setAwardType("");
                        setTeamName("");
                      }
                    }} required style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      {(managerType === "all" || managerType === "award") && <option value="상장">상장</option>}
                      {(managerType === "all" || managerType === "certificate") && <option value="수료증">수료증</option>}
                      {(managerType === "all" || managerType === "certificate") && <option value="이수증">이수증</option>}
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  {certType === "상장" && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>상훈</label>
                        <select value={awardType} onChange={e => setAwardType(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                          <option value="">선택</option>
                          {["대상", "최우수상", "우수상", "장려상", "금상", "은상", "동상"].map(aw => (
                            <option key={aw} value={aw}>{aw}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>팀명</label>
                        <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                      </div>
                    </>
                  )}
                </div>

                {/* 3rd Row: 성명, 학번, 생년월일, 휴대폰 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>성명 <span style={{ color: "red" }}>*</span></label>
                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} required style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>학번</label>
                    <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>생년월일</label>
                    <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} placeholder="MM/DD/YYYY" style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>휴대폰</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                </div>

                {/* 4th Row: 주관부서, 발급자명의 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>주관부서</label>
                    <select value={projectGroup} onChange={e => setProjectGroup(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      <option value="">선택</option>
                      <option value={getDynamicTeamName(issueDate)}>{getDynamicTeamName(issueDate)}</option>
                      <option value="산학협력단">산학협력단</option>
                      <option value="창업창직교육센터">창업창직교육센터</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>발급자명의</label>
                    <select value={issuer} onChange={e => setIssuer(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      <option value="">선택</option>
                      <option value={`${getDynamicTeamName(issueDate)}장`}>{getDynamicTeamName(issueDate)}장</option>
                      <option value="산학협력단장">산학협력단장</option>
                    </select>
                  </div>
                </div>

                {/* 5th Row: 담당자 소속, 담당자 성명 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>담당자 소속</label>
                    <select value={managerDept} onChange={e => {
                      setManagerDept(e.target.value);
                      setManagerName("");
                    }} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      <option value="">선택 안함</option>
                      {Object.keys(departmentMembers).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>담당자 성명</label>
                    {managerDept && managerDept !== "기타" ? (
                      <select value={managerName} onChange={e => setManagerName(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                        <option value="">선택</option>
                        {departmentMembers[managerDept]?.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} placeholder={managerDept === "기타" ? "직접 입력" : ""} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>시상내용(과정명)</label>
                  <input type="text" value={content} onChange={e => setContent(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>비고</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                </div>


                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button type="button" className="action-btn" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }} onClick={() => setIsModalOpen(false)}>취소</button>
                  <button type="submit" className="action-btn submit-btn">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
