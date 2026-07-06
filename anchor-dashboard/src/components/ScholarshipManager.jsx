import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit, Trash, Upload, X, Download, DollarSign } from "lucide-react";
import * as XLSX from "xlsx";

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
  const fileInputRef = useRef(null);

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

  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  const filteredItems = scholarships.filter(s => s.year === selectedYear);

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
    if (id.length >= 8) {
      return id.substring(0, 7) + "*******";
    }
    return id.substring(0, 2) + "****";
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
    setIsModalOpen(true);
  };

  const openModalForEdit = (item) => {
    setEditingId(item.id);
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
    setAccountNum(item.accountNum || "");
    setAccountHolder(item.accountHolder || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dept || !amount) {
      alert("이름, 학과, 지급금액은 필수입니다.");
      return;
    }

    const payload = {
      year: selectedYear,
      dept, major, course, studentId, name,
      residentId, grade, enrollStatus, regStatus,
      amount: amount.toString().replace(/,/g, ''), // 숫자만 저장
      bankName, accountNum, accountHolder
    };

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
      const iResidentId = getIndex("주민번호");
      const iGrade = getIndex("학년");
      const iEnrollStatus = getIndex("학적");
      const iRegStatus = getIndex("등록여부");
      const iAmount = getIndex("지급금액");
      const iBankName = getIndex("은행명");
      const iAccountNum = getIndex("계좌");
      const iAccountHolder = getIndex("예금주");

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
          major: iMajor !== -1 && row[iMajor] ? String(row[iMajor]) : "",
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
          accountHolder: iAccountHolder !== -1 && row[iAccountHolder] ? String(row[iAccountHolder]) : ""
        };

        const isDuplicate = filteredItems.some(
          c => c.studentId === newRec.studentId && c.name === newRec.name && c.amount === newRec.amount
        );
        const isImportedDuplicate = imported.some(
          c => c.studentId === newRec.studentId && c.name === newRec.name && c.amount === newRec.amount
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
      "주민번호": item.residentId || "", 
      "학년": item.grade || "",
      "학적": item.enrollStatus || "",
      "등록여부": item.regStatus || "",
      "지급금액": item.amount || "",
      "은행명": item.bankName || "",
      "계좌": item.accountNum || "", 
      "예금주": item.accountHolder || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "장학금 내역");
    XLSX.writeFile(workbook, `장학금_내역_${selectedYear}차년도.xlsx`);
  };

  const sortedData = getSortedItems();

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <DollarSign className="text-blue-400" />
          장학금 관리 ({selectedYear}차년도)
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleExcelUpload}
          />
          <button className="action-btn" onClick={() => fileInputRef.current.click()} style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
            <Upload size={16} /> 엑셀 업로드
          </button>
          <button className="action-btn" onClick={handleExcelDownload} style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}>
            <Download size={16} /> 엑셀 다운로드
          </button>
          <button className="action-btn submit-btn" onClick={openModalForNew}>
            <Plus size={16} /> 신규 장학금 등록
          </button>
        </div>
      </div>

      <div className="table-container" style={{ flex: 1, overflowY: "auto" }}>
        <table className="data-table" style={{ whiteSpace: "nowrap" }}>
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>순번</th>
              <th onClick={() => requestSort("dept")} style={{ cursor: "pointer" }}>학과{renderSortIndicator("dept")}</th>
              <th onClick={() => requestSort("major")} style={{ cursor: "pointer" }}>전공{renderSortIndicator("major")}</th>
              <th onClick={() => requestSort("course")} style={{ cursor: "pointer" }}>과정{renderSortIndicator("course")}</th>
              <th onClick={() => requestSort("studentId")} style={{ cursor: "pointer" }}>학번{renderSortIndicator("studentId")}</th>
              <th onClick={() => requestSort("name")} style={{ cursor: "pointer" }}>이름{renderSortIndicator("name")}</th>
              <th style={{ width: "140px", textAlign: "center" }}>주민번호</th>
              <th style={{ width: "60px", textAlign: "center" }}>학년</th>
              <th style={{ width: "60px", textAlign: "center" }}>학적</th>
              <th style={{ width: "80px", textAlign: "center" }}>등록여부</th>
              <th onClick={() => requestSort("amount")} style={{ cursor: "pointer", textAlign: "right" }}>지급금액{renderSortIndicator("amount")}</th>
              <th>은행명</th>
              <th>계좌</th>
              <th>예금주</th>
              <th style={{ width: "100px", textAlign: "center" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={item.id} className="table-row">
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.dept}</td>
                  <td>{item.major}</td>
                  <td>{item.course}</td>
                  <td>{item.studentId}</td>
                  <td>{item.name}</td>
                  <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>{maskResidentId(item.residentId)}</td>
                  <td style={{ textAlign: "center" }}>{item.grade}</td>
                  <td style={{ textAlign: "center" }}>{item.enrollStatus}</td>
                  <td style={{ textAlign: "center" }}>{item.regStatus}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>{item.amount ? Number(item.amount).toLocaleString() : ""}</td>
                  <td>{item.bankName}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{maskAccountNum(item.accountNum)}</td>
                  <td>{item.accountHolder}</td>
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
                <td colSpan="15" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  등록된 장학금 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "800px", width: "95%" }}>
            <div className="modal-header">
              <h3>{editingId ? "장학금 내역 수정" : "장학금 내역 신규 등록"}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: "1.5rem" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>학과 <span style={{ color: "red" }}>*</span></label>
                    <input type="text" value={dept} onChange={e => setDept(e.target.value)} required style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>전공</label>
                    <input type="text" value={major} onChange={e => setMajor(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>과정</label>
                    <input type="text" value={course} onChange={e => setCourse(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
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
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>주민번호</label>
                    <input type="text" value={residentId} onChange={e => setResidentId(e.target.value)} placeholder="000000-0000000" style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
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
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>계좌번호</label>
                    <input type="text" value={accountNum} onChange={e => setAccountNum(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>예금주</label>
                    <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
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
