import React, { useState, useRef, useEffect } from "react";
import { Plus, Edit, Trash, Upload, X, Download, DollarSign } from "lucide-react";
import { getAllValidDepartments } from "./OrgChartManager";

const VALID_DEPARTMENTS = getAllValidDepartments();
const VALID_COURSES = ["일반과정", "전문기술석사", "평생직업교육", "기타"];

const extractYear = (dateStr: any): number | null => {
  if (!dateStr) return null;
  const str = String(dateStr);
  let actualYear: number | null = null;
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

const BANK_FORMATS: Record<string, string> = {
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

const formatAccountNum = (bank: string, value: string): string => {
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

export interface ScholarshipItem {
  id: string | number;
  year?: number;
  dept?: string;
  major?: string;
  course?: string;
  studentId?: string;
  name?: string;
  residentId?: string;
  grade?: string;
  enrollStatus?: string;
  regStatus?: string;
  amount?: number | string;
  bankName?: string;
  accountNum?: string;
  accountHolder?: string;
  approvalDate?: string;
}

export interface ScholarshipManagerProps {
  scholarships?: ScholarshipItem[];
  selectedYear?: number;
  onAddScholarship?: (item: ScholarshipItem) => void;
  onUpdateScholarship?: (item: ScholarshipItem) => void;
  onDeleteScholarship?: (id: string | number) => void;
  setScholarships?: (items: ScholarshipItem[]) => void;
  currentRole?: any;
  members?: Array<Record<string, any>>;
}

/**
 * 💡 ScholarshipManager - 마일리지 장학금 지급 관리 대장 TSX 컴포넌트 (오리지널 14컬럼 100% 원본 레이아웃 규격)
 */
export default function ScholarshipManager({
  scholarships = [],
  selectedYear,
  onAddScholarship,
  onUpdateScholarship,
  onDeleteScholarship,
  setScholarships,
  currentRole: _currentRole
}: ScholarshipManagerProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [filterYear, setFilterYear] = useState<string>(() => selectedYear ? selectedYear.toString() : "all");

  useEffect(() => {
    if (selectedYear) {
      setFilterYear(selectedYear.toString());
    }
  }, [selectedYear]);

  const [dept, setDept] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [residentId, setResidentId] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [enrollStatus, setEnrollStatus] = useState<string>("");
  const [regStatus, setRegStatus] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNum, setAccountNum] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [approvalDate, setApprovalDate] = useState<string>("");
  const [isCustomDept, setIsCustomDept] = useState<boolean>(false);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "id", direction: "desc" });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMajor("");
  }, [dept, isCustomDept]);

  const safeScholarships = Array.isArray(scholarships) ? scholarships : [];
  const filteredItems = safeScholarships.filter(s => {
    if (filterYear === "all") return true;
    return s.year === Number(filterYear);
  });

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key: string): string => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▴" : " ▾";
    }
    return "";
  };

  const getSortedItems = (): ScholarshipItem[] => {
    const sorted = [...filteredItems];
    const key = sortConfig.key;
    if (key) {
      sorted.sort((a: any, b: any) => {
        let valA = a[key] || "";
        let valB = b[key] || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return sorted;
  };

  const resetForm = () => {
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
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScholarshipItem) => {
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
    setAmount(item.amount ? item.amount.toString() : "");
    setBankName(item.bankName || "");
    setAccountNum(item.accountNum || "");
    setAccountHolder(item.accountHolder || "");
    setApprovalDate(item.approvalDate || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) {
      alert("성명과 장학금액은 필수 입력사항입니다.");
      return;
    }

    const payload: ScholarshipItem = {
      id: editingId || Date.now(),
      year: extractYear(approvalDate) || Number(filterYear === "all" ? 2 : filterYear),
      dept,
      major,
      course,
      studentId,
      name,
      residentId,
      grade,
      enrollStatus,
      regStatus,
      amount: Number(amount),
      bankName,
      accountNum: formatAccountNum(bankName, accountNum),
      accountHolder,
      approvalDate
    };

    if (editingId) {
      if (onUpdateScholarship) onUpdateScholarship(payload);
    } else {
      if (onAddScholarship) onAddScholarship(payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string | number) => {
    if (confirm("정말 이 장학금 지급 내역을 삭제하시겠습니까?")) {
      if (onDeleteScholarship) onDeleteScholarship(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const imported: any[] = XLSX.utils.sheet_to_json(sheet);

        if (imported.length === 0) {
          alert("업로드된 엑셀에 데이터가 존재하지 않습니다.");
          return;
        }

        const newItems: ScholarshipItem[] = imported.map((rec, idx) => ({
          id: Date.now() + idx,
          year: extractYear(rec["지급일자"] || rec["결재일자"]) || Number(selectedYear || 2),
          dept: rec["학과"] || rec["학부(과)"] || "",
          major: rec["전공"] || "",
          course: rec["과정"] || "일반과정",
          studentId: String(rec["학번"] || ""),
          name: rec["이름"] || rec["성명"] || "",
          residentId: rec["생년월일"] || rec["주민번호"] || "",
          grade: String(rec["학년"] || ""),
          enrollStatus: rec["학적"] || rec["학적상태"] || "재학",
          regStatus: rec["등록여부"] || rec["등록상태"] || "Y",
          amount: Number(rec["지급금액"] || rec["금액"] || 0),
          bankName: rec["은행명"] || "",
          accountNum: formatAccountNum(rec["은행명"] || "", String(rec["계좌번호"] || "")),
          accountHolder: rec["예금주"] || rec["이름"] || rec["성명"] || "",
          approvalDate: rec["지급일자"] || rec["결재일자"] || ""
        }));

        if (setScholarships) {
          setScholarships([...safeScholarships, ...newItems]);
        }
        alert(`${newItems.length}건의 장학금 지급 내역이 일괄 등록되었습니다.`);
      } catch (err: any) {
        console.error(err);
        alert("엑셀 일괄 업로드 중 오류가 발생했습니다.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = async () => {
    const dataToExport = getSortedItems().map((item, index) => ({
      "순번": index + 1,
      "학부(과)": item.dept || "",
      "전공": item.major || "",
      "과정": item.course || "",
      "학번": item.studentId || "",
      "이름": item.name || "",
      "생년월일": item.residentId || "",
      "학년": item.grade || "",
      "학적": item.enrollStatus || "",
      "등록여부": item.regStatus || "",
      "지급금액": Number(item.amount || 0),
      "은행명": item.bankName || "",
      "계좌번호": item.accountNum || "",
      "예금주": item.accountHolder || ""
    }));

    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "장학금 지급 내역");
    XLSX.writeFile(workbook, `장학금_지급_대장_${filterYear === "all" ? "전체" : filterYear + "차년도"}.xlsx`);
  };

  const handleDownloadSample = async () => {
    const sampleData = [
      {
        "학부(과)": "식품영양학과",
        "전공": "",
        "과정": "일반과정",
        "학번": "2529012",
        "이름": "김수진",
        "생년월일": "060616",
        "학년": "1",
        "학적": "재학",
        "등록여부": "Y",
        "지급금액": 100000,
        "은행명": "지역농.축협",
        "계좌번호": "1773735600000",
        "결재일자": "2025-12-31"
      }
    ];
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "서식샘플");
    XLSX.writeFile(workbook, "장학금_지급_엑셀업로드_양식.xlsx");
  };

  const totalAmount = filteredItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalStudents = filteredItems.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* 💡 [요약 카드 영역] 총 지급액 및 총 수혜인원 현황 */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "1rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {filterYear === "all" ? "전체 차년도" : `${filterYear}차년도`} 마일리지 장학금 총 지급액
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--accent-color)", marginTop: "0.25rem", letterSpacing: "-0.5px" }}>
              {totalAmount.toLocaleString()} <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>원</span>
            </div>
          </div>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={24} style={{ color: "var(--accent-color)" }} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {filterYear === "all" ? "전체" : `${filterYear}차년도`} 총 수혜 학생 수
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--text-primary)", marginTop: "0.25rem", letterSpacing: "-0.5px" }}>
              {totalStudents.toLocaleString()} <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-secondary)" }}>명</span>
            </div>
          </div>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#10b981" }}>🎓</span>
          </div>
        </div>
      </div>

      {/* 1. 상단 타이틀 및 툴바 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          <DollarSign size={22} style={{ color: "var(--accent-color)" }} />
          장학금 관리 대장
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* 차년도 선택 드롭다운 */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ padding: "0.4rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
          >
            <option value="all">전체 차년도 모아보기</option>
            <option value="1">1차년도 (2025학년도)</option>
            <option value="2">2차년도 (2026학년도)</option>
            <option value="3">3차년도 (2027학년도)</option>
            <option value="4">4차년도 (2028학년도)</option>
            <option value="5">5차년도 (2029학년도)</option>
          </select>

          {/* 엑셀 서식 다운로드 */}
          <button
            onClick={handleDownloadSample}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", border: "1px solid #8b5cf6", background: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", fontSize: "0.85rem", cursor: "pointer", fontWeight: "700" }}
          >
            <Download size={14} />
            <span>엑셀 서식</span>
          </button>

          {/* 엑셀 업로드 */}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" style={{ display: "none" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", border: "1px solid #10b981", background: "rgba(16, 185, 129, 0.1)", color: "#34d399", fontSize: "0.85rem", cursor: "pointer", fontWeight: "700" }}
          >
            <Upload size={14} />
            <span>엑셀 업로드</span>
          </button>

          {/* 엑셀 다운로드 */}
          <button
            onClick={handleExportExcel}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", border: "1px solid #8b5cf6", background: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", fontSize: "0.85rem", cursor: "pointer", fontWeight: "700" }}
          >
            <Download size={14} />
            <span>엑셀 다운로드</span>
          </button>

          {/* 신규 등록 */}
          <button
            onClick={openCreateModal}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", border: "none", background: "var(--accent-color)", color: "#fff", fontSize: "0.85rem", cursor: "pointer", fontWeight: "700" }}
          >
            <Plus size={14} />
            <span>신규 등록</span>
          </button>
        </div>
      </div>

      {/* 2. 오리지널 14컬럼 대장 테이블 */}
      <div className="glass-card" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
              <th style={{ padding: "0.75rem", textAlign: "center" }}>순번</th>
              <th onClick={() => requestSort("dept")} style={{ padding: "0.75rem", cursor: "pointer" }}>학부(과){renderSortIndicator("dept")}</th>
              <th onClick={() => requestSort("major")} style={{ padding: "0.75rem", cursor: "pointer" }}>전공{renderSortIndicator("major")}</th>
              <th onClick={() => requestSort("course")} style={{ padding: "0.75rem", cursor: "pointer" }}>과정{renderSortIndicator("course")}</th>
              <th onClick={() => requestSort("studentId")} style={{ padding: "0.75rem", cursor: "pointer" }}>학번{renderSortIndicator("studentId")}</th>
              <th onClick={() => requestSort("name")} style={{ padding: "0.75rem", cursor: "pointer" }}>이름{renderSortIndicator("name")}</th>
              <th style={{ padding: "0.75rem" }}>생년월일</th>
              <th style={{ padding: "0.75rem", textAlign: "center" }}>학년</th>
              <th style={{ padding: "0.75rem", textAlign: "center" }}>학적</th>
              <th style={{ padding: "0.75rem", textAlign: "center" }}>등록여부</th>
              <th onClick={() => requestSort("amount")} style={{ padding: "0.75rem", textAlign: "right", cursor: "pointer" }}>지급금액{renderSortIndicator("amount")}</th>
              <th style={{ padding: "0.75rem" }}>은행명</th>
              <th style={{ padding: "0.75rem" }}>계좌번호</th>
              <th style={{ padding: "0.75rem", textAlign: "center" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {getSortedItems().length > 0 ? (
              getSortedItems().map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "0.75rem", textAlign: "center", color: "var(--text-secondary)" }}>{idx + 1}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{item.dept}</td>
                  <td style={{ padding: "0.75rem" }}>{item.major || "-"}</td>
                  <td style={{ padding: "0.75rem" }}>{item.course || "일반과정"}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{item.studentId}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{item.name}</td>
                  <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>{item.residentId || "-"}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.grade || "-"}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.enrollStatus || "재학"}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.regStatus || "Y"}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: "800", color: "var(--accent-color)" }}>
                    {Number(item.amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{item.bankName || "-"}</td>
                  <td style={{ padding: "0.75rem" }}>{item.accountNum || "-"}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.3rem" }}>
                      <button onClick={() => openEditModal(item)} style={{ background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer" }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  등록된 장학금 지급 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "600px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--panel-bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>
                {editingId ? "장학금 지급 내역 수정" : "신규 장학금 지급 내역 등록"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>학과</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                >
                  <option value="">학과 선택</option>
                  {VALID_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>과정</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                >
                  <option value="">과정 선택</option>
                  {VALID_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>학번 *</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="예: 2529012"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>이름 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="학생 이름"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>생년월일</label>
                <input
                  type="text"
                  value={residentId}
                  onChange={(e) => setResidentId(e.target.value)}
                  placeholder="예: 060616"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>학년</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="예: 1"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>학적</label>
                <input
                  type="text"
                  value={enrollStatus}
                  onChange={(e) => setEnrollStatus(e.target.value)}
                  placeholder="예: 재학"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>등록여부</label>
                <input
                  type="text"
                  value={regStatus}
                  onChange={(e) => setRegStatus(e.target.value)}
                  placeholder="예: Y"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>지급금액(원) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="예: 100000"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>은행명</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                >
                  <option value="">은행 선택</option>
                  {Object.keys(BANK_FORMATS).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>계좌번호</label>
                <input
                  type="text"
                  value={accountNum}
                  onChange={(e) => setAccountNum(e.target.value)}
                  placeholder="숫자만 입력 (자동 서식 변환)"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "var(--accent-color)", color: "#fff", border: "none", fontWeight: "700" }}
                >
                  {editingId ? "수정 완료" : "등록 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
