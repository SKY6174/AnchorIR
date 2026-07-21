import React, { useState, useRef, useEffect } from "react";
import { Plus, Edit, Trash, Upload, X, Download, DollarSign } from "lucide-react";
import * as XLSX from "xlsx";
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
  amount?: number;
  bankName?: string;
  accountNum?: string;
  accountHolder?: string;
  approvalDate?: string;
}

export interface ScholarshipManagerProps {
  /** 마일리지 장학금 지급 수혜자 전체 목록 */
  scholarships?: ScholarshipItem[];
  /** 선택된 연차 */
  selectedYear?: number;
  /** 신규 등록 콜백 */
  onAddScholarship?: (item: ScholarshipItem) => void;
  /** 업데이트 콜백 */
  onUpdateScholarship?: (item: ScholarshipItem) => void;
  /** 삭제 콜백 */
  onDeleteScholarship?: (id: string | number) => void;
  /** 상태 갱신 함수 */
  setScholarships?: (items: ScholarshipItem[]) => void;
  /** 현재 사용자 역할 객체 */
  currentRole?: any;
}

/**
 * 💡 ScholarshipManager - RCC/ECC 마일리지 장학금 지급 검증 및 대장 관리 TSX 컴포넌트
 */
export default function ScholarshipManager({
  scholarships = [],
  selectedYear,
  onAddScholarship,
  onUpdateScholarship,
  onDeleteScholarship,
  setScholarships,
  currentRole
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
    if (!name || !studentId || !amount) {
      alert("성명, 학번, 장학금액은 필수 입력사항입니다.");
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
    reader.onload = (evt) => {
      try {
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
          dept: rec["학과"] || "",
          major: rec["전공"] || "",
          course: rec["과정"] || "일반과정",
          studentId: String(rec["학번"] || ""),
          name: rec["성명"] || "",
          residentId: rec["주민번호"] || "",
          grade: String(rec["학년"] || ""),
          enrollStatus: rec["학적상태"] || "재학",
          regStatus: rec["등록상태"] || "등록",
          amount: Number(rec["지급금액"] || rec["금액"] || 0),
          bankName: rec["은행명"] || "",
          accountNum: formatAccountNum(rec["은행명"] || "", String(rec["계좌번호"] || "")),
          accountHolder: rec["예금주"] || rec["성명"] || "",
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

  const totalAmount = filteredItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {filterYear === "all" ? "전체 차년도" : `${filterYear}차년도`} 마일리지 장학금 총 지급액
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-color)", marginTop: "0.2rem" }}>
              {totalAmount.toLocaleString()} 원
            </div>
          </div>
          <DollarSign size={36} style={{ color: "var(--accent-color)", opacity: 0.8 }} />
        </div>

        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>총 수혜 학생 수</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", marginTop: "0.2rem" }}>
            {filteredItems.length} 명
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem" }}>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
          >
            <option value="all">전체 차년도 모아보기</option>
            <option value="1">1차년도 (2025)</option>
            <option value="2">2차년도 (2026)</option>
            <option value="3">3차년도 (2027)</option>
            <option value="4">4차년도 (2028)</option>
            <option value="5">5차년도 (2029)</option>
          </select>
        </div>
      </div>

      {/* 툴바 */}
      <div className="glass-card" style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>마일리지 장학금 지급 관리 대장</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" style={{ display: "none" }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1rem", fontSize: "0.85rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer" }}
          >
            <Upload size={16} />
            <span>엑셀 일괄 업로드</span>
          </button>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1rem", fontSize: "0.85rem", background: "var(--accent-color)", color: "#fff", border: "none", cursor: "pointer", fontWeight: "700" }}
          >
            <Plus size={16} />
            <span>신규 지급 내역 등록</span>
          </button>
        </div>
      </div>

      {/* 장학금 테이블 */}
      <div className="glass-card" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
              <th onClick={() => requestSort("dept")} style={{ padding: "0.75rem", cursor: "pointer" }}>학과{renderSortIndicator("dept")}</th>
              <th onClick={() => requestSort("studentId")} style={{ padding: "0.75rem", cursor: "pointer" }}>학번{renderSortIndicator("studentId")}</th>
              <th onClick={() => requestSort("name")} style={{ padding: "0.75rem", cursor: "pointer" }}>성명{renderSortIndicator("name")}</th>
              <th style={{ padding: "0.75rem" }}>학년/학적</th>
              <th onClick={() => requestSort("amount")} style={{ padding: "0.75rem", textAlign: "right", cursor: "pointer" }}>지급금액(원){renderSortIndicator("amount")}</th>
              <th style={{ padding: "0.75rem" }}>지급 계좌</th>
              <th onClick={() => requestSort("approvalDate")} style={{ padding: "0.75rem", cursor: "pointer" }}>지급일자{renderSortIndicator("approvalDate")}</th>
              <th style={{ padding: "0.75rem", textAlign: "center" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {getSortedItems().length > 0 ? (
              getSortedItems().map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "0.75rem" }}>{item.dept} {item.major ? `(${item.major})` : ""}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{item.studentId}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{item.name}</td>
                  <td style={{ padding: "0.75rem" }}>{item.grade ? `${item.grade}학년` : "-"} / {item.enrollStatus || "재학"}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: "800", color: "var(--accent-color)" }}>
                    {Number(item.amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{item.bankName} {item.accountNum}</td>
                  <td style={{ padding: "0.75rem" }}>{item.approvalDate || "-"}</td>
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
                <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
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
                  placeholder="예: 20261234"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>성명 *</label>
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
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "0.2rem" }}>지급금액(원) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="예: 500000"
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
