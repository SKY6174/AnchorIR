import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit, Trash, Upload, X, Download, DollarSign } from "lucide-react";
import * as XLSX from "xlsx";

import { universityOrgData, getAllValidDepartments } from "./OrgChartManager";

const VALID_DEPARTMENTS = getAllValidDepartments();

const VALID_COURSES = ["일반과정", "전문기술석사", "평생직업교육", "기타"];

const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const str = String(dateStr);
  let actualYear = null;
  const match = str.match(/(20\d{2})/);
  if (match) {
    actualYear = Number(match[1]);
  } else {
    const num = Number(str);
    if (!isNaN(num) && num > 40000 && num < 50000) {
      const d = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (!isNaN(d.getTime())) actualYear = d.getFullYear();
    }
  }
  
  if (actualYear) {
    if (actualYear >= 2025 && actualYear <= 2029) {
      return actualYear - 2024;
    }
  }
  return null;
};

const BANK_FORMATS = {
  "KB국민은행": "000000-00-000000",
  "신한은행": "000-000-000000",
  "우리은행": "0000-000-000000",
  "하나은행": "000-000000-00000",
  "NH농협은행": "000-0000-0000-00",
  "IBK기업은행": "000-000000-00-000",
  "카카오뱅크": "3333-00-0000000",
  "토스뱅크": "1000-0000-0000",
  "케이뱅크": "100-000-000000",
  "새마을금고": "9000-0000-0000-0",
  "부산은행": "000-00-000000-0",
  "대구은행": "000-00-000000-0",
  "경남은행": "000-00-0000000",
  "광주은행": "000-000-000000",
  "전북은행": "000-00-0000000",
  "SC제일은행": "000-00-000000",
  "수협은행": "000-00-000000",
  "신협": "00000-00-000000",
  "우체국": "000000-00-000000",
  "기타은행": ""
};

const formatAccountNum = (bank, value) => {
  if (!value) return "";
  const digits = value.replace(/[^0-9]/g, "");
  const format = BANK_FORMATS[bank];
  if (!format || bank === "기타은행") return digits;

  let result = "";
  let digitIndex = 0;
  for (let i = 0; i < format.length; i++) {
    if (digitIndex >= digits.length) break;
    if (format[i] === "-") {
      result += "-";
    } else {
      result += digits[digitIndex++];
    }
  }
  if (digitIndex < digits.length) {
    result += "-" + digits.substring(digitIndex);
  }
  return result;
};

export default function ScholarshipManager({
  scholarships = [],
  selectedYear,
  onAddScholarship,
  onUpdateScholarship,
  onDeleteScholarship,
  setScholarships,
  currentRole
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterYear, setFilterYear] = useState(() => selectedYear ? selectedYear.toString() : "all");

  // 💡 [연도 선택 동기화] 상단 탭에서 차년도가 변경되면 해당 차년도의 데이터만 기본 조회되도록 동기화합니다.
  useEffect(() => {
    if (selectedYear) {
      setFilterYear(selectedYear.toString());
    }
  }, [selectedYear]);
  // 폼 필드
  const [dept, setDept] = useState("");
  const [major, setMajor] = useState("");
  const [course, setCourse] = useState("");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [residentId, setResidentId] = useState("");
  const [grade, setGrade] = useState("");
  const [enrollStatus, setEnrollStatus] = useState("");
  const [regStatus, setRegStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [approvalDate, setApprovalDate] = useState("");
  const [isCustomDept, setIsCustomDept] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMajor("");
  }, [dept, isCustomDept]);

  const filteredItems = scholarships.filter(s => {
    if (filterYear === "all") return true;
    return s.year === Number(filterYear);
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▴" : " ▾";
    }
    return "";
  };

  const getSortedItems = () => {
    const sorted = [...filteredItems];
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

  const maskResidentId = (id) => {
    if (!id) return "";
    // 하이픈 제거 후 생년월일(앞 6자리)만 남깁니다.
    const cleanId = id.replace(/-/g, "").trim();
    if (cleanId.length >= 6) {
      return cleanId.substring(0, 6);
    }
    return cleanId;
  };

  const maskAccountNum = (acc) => {
    if (!acc) return "";
    if (acc.length >= 6) {
      return acc.substring(0, acc.length - 4) + "****";
    }
    return "****";
  };

  const openModalForNew = () => {
    setEditingId(null);
    setDept("");
    setMajor("");
    setCourse("");
    setStudentId("");
    setName("");
    setResidentId("");
    setGrade("");
    setEnrollStatus("");
    setRegStatus("");
    setAmount("");
    setBankName("");
    setAccountNum("");
    setAccountHolder("");
    setApprovalDate("");
    setIsCustomDept(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (item) => {
    setEditingId(item.id);
    if (!VALID_DEPARTMENTS.includes(item.dept) && item.dept) {
      setIsCustomDept(true);
    } else {
      setIsCustomDept(false);
    }
    setDept(item.dept || "");
    setMajor(item.major || "");
    setCourse(item.course || "");
    setStudentId(item.studentId || "");
    setName(item.name || "");
    setResidentId(item.residentId || "");
    setGrade(item.grade || "");
    setEnrollStatus(item.enrollStatus || "");
    setRegStatus(item.regStatus || "");
    setAmount(item.amount || "");
    setBankName(item.bankName || "");
    setAccountNum(formatAccountNum(item.bankName, item.accountNum || ""));
    setAccountHolder(item.accountHolder || "");
    setApprovalDate(item.approvalDate || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dept || !amount) {
      alert("이름, 학부(과), 지급금액은 필수입니다.");
      return;
    }

    if (!VALID_DEPARTMENTS.includes(dept)) {
      alert("올바른 학부(과)명을 입력해주세요.");
      return;
    }

    if (studentId && studentId.length !== 7) {
      alert("학번은 7자리여야 합니다.");
      return;
    }

    const targetYear = extractYear(approvalDate) || selectedYear;

    const payload = {
      year: targetYear,
      dept, major, course, studentId, name,
      residentId, grade, enrollStatus, regStatus,
      amount: amount.toString().replace(/,/g, ''), // 숫자만 저장
      bankName, accountNum, accountHolder, approvalDate
    };

    if (!editingId) {
      const isDuplicate = scholarships.some(
        c =>
          c.year === payload.year &&
          c.dept === payload.dept &&
          c.major === payload.major &&
          c.course === payload.course &&
          c.studentId === payload.studentId &&
          c.name === payload.name &&
          c.residentId === payload.residentId &&
          c.grade === payload.grade &&
          c.enrollStatus === payload.enrollStatus &&
          c.regStatus === payload.regStatus &&
          c.amount === payload.amount &&
          c.bankName === payload.bankName &&
          c.accountNum === payload.accountNum &&
          c.accountHolder === payload.accountHolder &&
          c.approvalDate === payload.approvalDate
      );
      if (isDuplicate) {
        alert("이미 동일한 내용의 데이터가 존재합니다.");
        return;
      }
    }

    if (editingId) {
      onUpdateScholarship(editingId, payload);
    } else {
      onAddScholarship(payload);
    }
    setIsModalOpen(false);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length <= 1) {
        alert("엑셀 파일에 데이터가 없습니다.");
        return;
      }

      const headers = jsonData[0];
      const getIndex = (nameStr) => headers.findIndex(h => typeof h === "string" && h.includes(nameStr));

      const iDept = getIndex("학과");
      const iMajor = getIndex("전공");
      const iCourse = getIndex("과정");
      const iStudentId = getIndex("학번");
      const iName = getIndex("이름");
      const iResidentId = getIndex("생년월일") !== -1 ? getIndex("생년월일") : (getIndex("연락처") !== -1 ? getIndex("연락처") : getIndex("주민번호"));
      const iGrade = getIndex("학년");
      const iEnrollStatus = getIndex("학적");
      const iRegStatus = getIndex("등록여부");
      const iAmount = getIndex("지급금액");
      const iBankName = getIndex("은행명");
      const iAccountNum = getIndex("계좌");
      const iAccountHolder = getIndex("예금주");
      const iApprovalDate = getIndex("승인일") !== -1 ? getIndex("승인일") : getIndex("결재일");

      if (iName === -1 || iAmount === -1) {
        alert("필수 열(이름, 지급금액)을 찾을 수 없습니다. 양식을 확인해주세요.");
        return;
      }

      let importCount = 0;
      const imported = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0 || !row[iName]) continue;

        const newRec = {
          year: selectedYear,
          dept: row[iDept] ? String(row[iDept]) : "",
          major: iMajor !== -1 && row[iMajor] && String(row[iMajor]) !== String(row[iDept]) ? String(row[iMajor]) : "",
          course: iCourse !== -1 && row[iCourse] ? String(row[iCourse]) : "",
          studentId: iStudentId !== -1 && row[iStudentId] ? String(row[iStudentId]) : "",
          name: String(row[iName]),
          residentId: iResidentId !== -1 && row[iResidentId] ? String(row[iResidentId]) : "",
          grade: iGrade !== -1 && row[iGrade] ? String(row[iGrade]) : "",
          enrollStatus: iEnrollStatus !== -1 && row[iEnrollStatus] ? String(row[iEnrollStatus]) : "",
          regStatus: iRegStatus !== -1 && row[iRegStatus] ? String(row[iRegStatus]) : "",
          amount: String(row[iAmount]).replace(/,/g, ''),
          bankName: iBankName !== -1 && row[iBankName] ? String(row[iBankName]) : "",
          accountNum: iAccountNum !== -1 && row[iAccountNum] ? String(row[iAccountNum]) : "",
          accountHolder: iAccountHolder !== -1 && row[iAccountHolder] ? String(row[iAccountHolder]) : "",
          approvalDate: iApprovalDate !== -1 && row[iApprovalDate] ? String(row[iApprovalDate]) : ""
        };

        newRec.year = extractYear(newRec.approvalDate) || selectedYear;

        const isDuplicate = scholarships.some(
          c =>
            c.year === newRec.year &&
            c.dept === newRec.dept &&
            c.major === newRec.major &&
            c.course === newRec.course &&
            c.studentId === newRec.studentId &&
            c.name === newRec.name &&
            c.residentId === newRec.residentId &&
            c.grade === newRec.grade &&
            c.enrollStatus === newRec.enrollStatus &&
            c.regStatus === newRec.regStatus &&
            c.amount === newRec.amount &&
            c.bankName === newRec.bankName &&
            c.accountNum === newRec.accountNum &&
            c.accountHolder === newRec.accountHolder &&
            c.approvalDate === newRec.approvalDate
        );
        const isImportedDuplicate = imported.some(
          c =>
            c.year === newRec.year &&
            c.dept === newRec.dept &&
            c.major === newRec.major &&
            c.course === newRec.course &&
            c.studentId === newRec.studentId &&
            c.name === newRec.name &&
            c.residentId === newRec.residentId &&
            c.grade === newRec.grade &&
            c.enrollStatus === newRec.enrollStatus &&
            c.regStatus === newRec.regStatus &&
            c.amount === newRec.amount &&
            c.bankName === newRec.bankName &&
            c.accountNum === newRec.accountNum &&
            c.accountHolder === newRec.accountHolder &&
            c.approvalDate === newRec.approvalDate
        );

        if (!isDuplicate && !isImportedDuplicate) {
          imported.push(newRec);
          importCount++;
        }
      }

      if (importCount > 0) {
        const confirmMsg = `총 ${importCount}건의 장학금 데이터를 업로드합니다. 계속하시겠습니까?`;
        if (window.confirm(confirmMsg)) {
          const tempIdStart = Date.now();
          const newItems = imported.map((rec, idx) => ({ ...rec, id: tempIdStart + idx }));
          setScholarships(prev => [...prev, ...newItems]);
          alert(`${importCount}건이 등록되었습니다.`);
        }
      } else {
        alert("추가할 새로운 데이터가 없습니다. (전체 중복이거나 빈 데이터)");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleExcelDownload = () => {
    const dataToExport = getSortedItems().map((item, index) => ({
      "순번": index + 1,
      "학과": item.dept || "",
      "전공": item.major || "",
      "과정": item.course || "",
      "학번": item.studentId || "",
      "이름": item.name || "",
      "생년월일": item.residentId || "", 
      "학년": item.grade || "",
      "학적": item.enrollStatus || "",
      "등록여부": item.regStatus || "",
      "은행명": item.bankName || "",
      "계좌": item.accountNum || "", 
      "예금주": item.accountHolder || "",
      "승인일": item.approvalDate || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "장학금 내역");
    XLSX.writeFile(workbook, `장학금_내역_${selectedYear}차년도.xlsx`);
  };

  const handleExcelTemplateDownload = () => {
    const headers = [
      "학과", "전공", "과정", "학번", "이름", "생년월일", 
      "학년", "학적", "등록여부", "지급금액", "은행명", "계좌", "예금주", "승인일"
    ];
    const data = [[]]; // 빈 데이터 한 줄
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Auto width
    const colWidths = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "장학금_업로드서식");
    XLSX.writeFile(workbook, "장학금_업로드서식.xlsx");
  };

  const sortedData = getSortedItems();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* 💡 [연도 누적 선택 필터] (버튼들과 패딩 및 둥글기 통일) */}
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "0.5rem",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            <option value="all">전체 연도 누적 조회</option>
            <option value="1">1차년도 (2025학년도)</option>
            <option value="2">2차년도 (2026학년도)</option>
            <option value="3">3차년도 (2027학년도)</option>
            <option value="4">4차년도 (2028학년도)</option>
            <option value="5">5차년도 (2029학년도)</option>
          </select>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleExcelUpload}
          />
          <button className="action-btn download-btn" onClick={handleExcelTemplateDownload} style={{ background: "var(--bg-tertiary)" }}>
            <Download size={16} /> 엑셀 서식
          </button>
          <button className="action-btn upload-btn" onClick={() => fileInputRef.current.click()}>
            <Upload size={16} /> 엑셀 업로드
          </button>
          <button className="action-btn download-btn" onClick={handleExcelDownload}>
            <Download size={16} /> 엑셀 다운로드
          </button>
          <button 
            onClick={openModalForNew}
            className="action-btn"
            style={{
              borderRadius: "9999px",
              background: "var(--accent-color)",
              border: "none",
              color: "white",
              fontWeight: "700",
              padding: "0.5rem 1.2rem"
            }}
          >
            <Plus size={16} /> 신규 등록
          </button>
        </div>
      </div>

      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="custom-table" style={{ minWidth: "1600px", fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>순번</th>
              <th onClick={() => requestSort("dept")} style={{ width: "150px", cursor: "pointer", textAlign: "center" }}>학부(과){renderSortIndicator("dept")}</th>
              <th onClick={() => requestSort("major")} style={{ width: "150px", cursor: "pointer", textAlign: "center" }}>전공{renderSortIndicator("major")}</th>
              <th onClick={() => requestSort("course")} style={{ width: "110px", cursor: "pointer", textAlign: "center" }}>과정{renderSortIndicator("course")}</th>
              <th onClick={() => requestSort("studentId")} style={{ width: "100px", cursor: "pointer", textAlign: "center" }}>학번{renderSortIndicator("studentId")}</th>
              <th onClick={() => requestSort("name")} style={{ width: "90px", cursor: "pointer", textAlign: "center" }}>이름{renderSortIndicator("name")}</th>
              <th style={{ width: "140px", textAlign: "center" }}>생년월일</th>
              <th style={{ width: "60px", textAlign: "center" }}>학년</th>
              <th style={{ width: "60px", textAlign: "center" }}>학적</th>
              <th style={{ width: "80px", textAlign: "center" }}>등록여부</th>
              <th onClick={() => requestSort("amount")} style={{ width: "110px", cursor: "pointer", textAlign: "right" }}>지급금액{renderSortIndicator("amount")}</th>
              <th style={{ width: "130px", textAlign: "center" }}>은행명</th>
              <th style={{ width: "160px", textAlign: "center" }}>계좌번호</th>
              <th style={{ width: "90px", textAlign: "center" }}>예금주</th>
              <th onClick={() => requestSort("approvalDate")} style={{ width: "120px", cursor: "pointer", textAlign: "center" }}>승인일{renderSortIndicator("approvalDate")}</th>
              <th style={{ width: "90px", textAlign: "center" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={item.id} className="table-row">
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td style={{ textAlign: "center" }}>{item.dept}</td>
                  <td style={{ textAlign: "center" }}>{item.major}</td>
                  <td style={{ textAlign: "center" }}>{item.course}</td>
                  <td style={{ textAlign: "center" }}>{item.studentId}</td>
                  <td style={{ textAlign: "center" }}>{item.name}</td>
                  <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>{maskResidentId(item.residentId)}</td>
                  <td style={{ textAlign: "center" }}>{item.grade}</td>
                  <td style={{ textAlign: "center" }}>{item.enrollStatus}</td>
                  <td style={{ textAlign: "center" }}>{item.regStatus}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>{item.amount ? Number(item.amount).toLocaleString() : ""}</td>
                  <td style={{ textAlign: "center" }}>{item.bankName}</td>
                  <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>{maskAccountNum(item.accountNum)}</td>
                  <td style={{ textAlign: "center" }}>{item.accountHolder}</td>
                  <td style={{ textAlign: "center" }}>{item.approvalDate}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                      <button className="icon-btn" onClick={() => openModalForEdit(item)} title="수정" style={{ color: "var(--text-secondary)" }}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => {
                        if (window.confirm("정말 삭제하시겠습니까?")) onDeleteScholarship(item.id);
                      }} title="삭제">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ color: "var(--text-tertiary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <DollarSign size={48} style={{ opacity: 0.2 }} />
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
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>{editingId ? "장학금 내역 수정" : "장학금 내역 신규 등록"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>학부(과) <span style={{ color: "red" }}>*</span></label>
                    {isCustomDept ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input type="text" value={dept} onChange={e => setDept(e.target.value)} required placeholder="직접입력" style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                        <button type="button" onClick={() => { setIsCustomDept(false); setDept(""); }} style={{ padding: "0 0.8rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.1)", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>취소</button>
                      </div>
                    ) : (
                      <select value={dept} onChange={e => {
                        if (e.target.value === "custom") {
                          setIsCustomDept(true);
                          setDept("");
                        } else {
                          setDept(e.target.value);
                        }
                      }} required style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                        <option value="">선택안함</option>
                        {VALID_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        <option value="custom">직접입력</option>
                      </select>
                    )}
                    <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>목록에 없는 과거 학과명 등은 '직접입력'을 선택하여 기재해 주세요.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>전공</label>
                    {(!isCustomDept && (dept === "기계공학부" || dept === "전기전자공학부" || dept === "스포츠재활학부")) ? (
                      <select value={major} onChange={e => setMajor(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                        <option value="">선택안함</option>
                        {dept === "기계공학부" && (
                          <>
                            <option value="기계시스템전공">기계시스템전공</option>
                            <option value="기계설비전공">기계설비전공</option>
                          </>
                        )}
                        {dept === "전기전자공학부" && (
                          <>
                            <option value="전기전공">전기전공</option>
                            <option value="스마트전자전공">스마트전자전공</option>
                          </>
                        )}
                        {dept === "스포츠재활학부" && (
                          <>
                            <option value="스포츠지도전공">스포츠지도전공</option>
                            <option value="스포츠재활전공">스포츠재활전공</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input type="text" value={major} onChange={e => setMajor(e.target.value)} disabled={!isCustomDept && !(dept || "").endsWith("학부")} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", opacity: (!isCustomDept && !(dept || "").endsWith("학부")) ? 0.5 : 1, cursor: (!isCustomDept && !(dept || "").endsWith("학부")) ? "not-allowed" : "text" }} />
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>과정</label>
                    <select value={course} onChange={e => setCourse(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      <option value="">선택안함</option>
                      {VALID_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>학번</label>
                    <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>이름 <span style={{ color: "red" }}>*</span></label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>생년월일</label>
                    <input type="text" value={residentId} onChange={e => setResidentId(e.target.value)} placeholder="예: 040916" style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>학년</label>
                    <input type="text" value={grade} onChange={e => setGrade(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>학적</label>
                    <input type="text" value={enrollStatus} onChange={e => setEnrollStatus(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>등록여부</label>
                    <input type="text" value={regStatus} onChange={e => setRegStatus(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>지급금액 <span style={{ color: "red" }}>*</span></label>
                    <input type="text" value={amount} onChange={e => setAmount(e.target.value)} required style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>은행명</label>
                    <select value={bankName} onChange={e => { setBankName(e.target.value); setAccountNum(formatAccountNum(e.target.value, accountNum)); }} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      <option value="">은행 선택</option>
                      {Object.keys(BANK_FORMATS).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>계좌번호</label>
                    <input type="text" value={accountNum} onChange={e => setAccountNum(formatAccountNum(bankName, e.target.value))} placeholder={BANK_FORMATS[bankName] || "계좌번호 입력 (숫자만)"} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>예금주</label>
                    <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>승인일(결재일)</label>
                    <input type="date" value={approvalDate} onChange={e => setApprovalDate(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
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
