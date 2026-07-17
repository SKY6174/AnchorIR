import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CryptoJS from "crypto-js";
import { Plus, User, Award, DollarSign, Calendar, Trash2, Edit2, ShieldAlert, Check, X } from "lucide-react";

// 💡 [보안 수칙 - Rule 8] 개인정보 암복호화를 위한 AES 대칭키 정의
const SECRET_KEY = "anchor_instructor_secure_encryption_key_2026";

// 💡 [암호화 헬퍼] 평문을 안전하게 AES 암호화
const encryptData = (text) => {
  if (!text) return "";
  return CryptoJS.AES.encrypt(text.trim(), SECRET_KEY).toString();
};

// 💡 [복호화 헬퍼] 암호문을 복호화하여 평문 반환
const decryptData = (ciphertext) => {
  if (!ciphertext) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    // 만약 마이그레이션 시드 데이터처럼 평문이 들어있을 경우 예외 처리
    return ciphertext;
  }
};

// 💡 [마스킹 헬퍼] 개인정보 가독성 제한 및 마스킹 처리
const maskBirthDate = (birth) => {
  if (!birth || birth.length < 10) return birth;
  // YYYY-MM-DD -> YYYY-MM-**
  return `${birth.substring(0, 8)}**`;
};

const maskAccountNumber = (account) => {
  if (!account || account.length < 5) return account;
  const len = account.length;
  // 뒤 5자리를 마스킹
  return `${account.substring(0, len - 5)}*****`;
};

// 💡 [드롭다운 데이터 세트] 단위과제 - 프로그램 매핑 자료
const PROJECTS_MAP = {
  A1: ["A1-S1T1-1", "A1-S2T1-2", "A1-S3T1-1"],
  A2: ["A2-S1T1-1", "A2-S2T1-2"],
  B1: ["B1-S1T1-1", "B1-S2T1-2", "B1-S3T1-1"],
  B2: ["B2-S1T1-1", "B2-S2T1-2", "B2-S3T1-2"],
  B3: ["B3-S1T1-1", "B3-S2T1-2"],
  C1: ["C1-S1T1-1", "C1-S2T1-2"],
  C2: ["C2-S1T1-1"],
  D1: ["D1-S1T1-1", "D1-S2T1-2"],
  D2: ["D2-S1T1-1", "D2-S2T1-2"],
  D3: ["D3-S1T1-1"]
};

const DEPARTMENTS = [
  "컴퓨터정보과",
  "간호학과",
  "기계공학과",
  "전기전자공학과",
  "화학공학과",
  "세무회계학과",
  "평생교육원",
  "치위생학과",
  "물리치료학과",
  "사회복지학과"
];

export default function InstructorPoolManager() {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 신규 교강사 등록 폼 상태
  const [newForm, setNewForm] = useState({
    name: "",
    is_internal: true,
    birth_date: "",
    bank_name: "",
    account_number: "",
    rating_grade: "일반"
  });

  // 프로그램 참여 이력 폼 상태
  const [newProgForm, setNewProgForm] = useState({
    year: 2,
    unit_id: "B2",
    program_id: "B2-S1T1-1",
    department: "컴퓨터정보과"
  });

  // 강사비 지출 이력 폼 상태
  const [newPayForm, setNewPayForm] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    program_id: "B2-S1T1-1",
    notes: ""
  });

  // 1. 교∙강사 마스터 리스트 로드
  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // 로드된 데이터 복호화 처리
      const decryptedList = (data || []).map(ins => ({
        ...ins,
        decrypted_birth: decryptData(ins.birth_date),
        decrypted_account: decryptData(ins.account_number)
      }));

      setInstructors(decryptedList);
    } catch (err) {
      console.error("교강사 목록 조회 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // 2. 특정 교∙강사 상세 이력 조회 (참여이력, 지출내역)
  const handleSelectInstructor = async (ins) => {
    setSelectedInstructor(ins);
    setIsDetailOpen(true);
    
    try {
      // 참여 이력
      const { data: progData, error: progErr } = await supabase
        .from("instructor_programs")
        .select("*")
        .eq("instructor_id", ins.id)
        .order("created_at", { ascending: false });
      if (progErr) throw progErr;
      setPrograms(progData || []);

      // 지출 이력
      const { data: payData, error: payErr } = await supabase
        .from("instructor_payments")
        .select("*")
        .eq("instructor_id", ins.id)
        .order("payment_date", { ascending: false });
      if (payErr) throw payErr;
      setPayments(payData || []);
    } catch (err) {
      console.error("상세 이력 조회 실패:", err.message);
    }
  };

  // 3. 신규 교∙강사 등록 (암호화 수행)
  const handleAddInstructor = async (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.birth_date || !newForm.bank_name || !newForm.account_number) {
      alert("모든 인적사항 항목을 채워주세요.");
      return;
    }

    try {
      // 민감 정보 AES 암호화
      const encryptedBirth = encryptData(newForm.birth_date);
      const encryptedAccount = encryptData(newForm.account_number);

      const { error } = await supabase.from("instructors").insert({
        name: newForm.name,
        is_internal: newForm.is_internal,
        birth_date: encryptedBirth,
        bank_name: newForm.bank_name,
        account_number: encryptedAccount,
        rating_grade: newForm.rating_grade
      });

      if (error) throw error;

      alert("교∙강사가 성공적으로 등록되었습니다.");
      setIsAddModalOpen(false);
      setNewForm({
        name: "",
        is_internal: true,
        birth_date: "",
        bank_name: "",
        account_number: "",
        rating_grade: "일반"
      });
      fetchInstructors();
    } catch (err) {
      alert("교∙강사 등록 실패: " + err.message);
    }
  };

  // 4. 교∙강사 삭제
  const handleDeleteInstructor = async (id) => {
    if (!window.confirm("정말로 이 교∙강사를 삭제하시겠습니까? 관련 모든 참여 이력 및 강사비 지출 이력이 삭제됩니다.")) return;
    try {
      const { error } = await supabase.from("instructors").delete().eq("id", id);
      if (error) throw error;
      alert("삭제되었습니다.");
      fetchInstructors();
      if (selectedInstructor?.id === id) {
        setIsDetailOpen(false);
        setSelectedInstructor(null);
      }
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  // 5. 프로그램 참여 이력 추가
  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!selectedInstructor) return;
    
    try {
      const { error } = await supabase.from("instructor_programs").insert({
        instructor_id: selectedInstructor.id,
        year: newProgForm.year,
        unit_id: newProgForm.unit_id,
        program_id: newProgForm.program_id,
        department: newProgForm.department
      });

      if (error) throw error;

      alert("참여 이력이 추가되었습니다.");
      // 재조회
      handleSelectInstructor(selectedInstructor);
    } catch (err) {
      alert("이력 추가 실패: " + err.message);
    }
  };

  // 6. 프로그램 참여 이력 삭제
  const handleDeleteProgram = async (id) => {
    try {
      const { error } = await supabase.from("instructor_programs").delete().eq("id", id);
      if (error) throw error;
      handleSelectInstructor(selectedInstructor);
    } catch (err) {
      alert("이력 삭제 실패: " + err.message);
    }
  };

  // 7. 강사비 지출 내역 추가
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedInstructor || !newPayForm.amount) return;

    try {
      const { error } = await supabase.from("instructor_payments").insert({
        instructor_id: selectedInstructor.id,
        payment_date: newPayForm.payment_date,
        amount: parseFloat(newPayForm.amount),
        program_id: newPayForm.program_id,
        notes: newPayForm.notes
      });

      if (error) throw error;

      alert("강사비 지급 이력이 등록되었습니다.");
      setNewPayForm(prev => ({ ...prev, amount: "", notes: "" }));
      handleSelectInstructor(selectedInstructor);
    } catch (err) {
      alert("지급 등록 실패: " + err.message);
    }
  };

  // 8. 강사비 지출 이력 삭제
  const handleDeletePayment = async (id) => {
    try {
      const { error } = await supabase.from("instructor_payments").delete().eq("id", id);
      if (error) throw error;
      handleSelectInstructor(selectedInstructor);
    } catch (err) {
      alert("지급 삭제 실패: " + err.message);
    }
  };

  // 총 지출 강사비 연산
  const totalPayment = payments.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", color: "var(--text-color)" }}>
      {/* 1. 상단 안내 (두번째 그림의 협력기관 안내 카드와 100% 동기화) */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <User size={22} />
          교∙강사 Pool 관리 시스템
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          사업단 참여 교강사 인적사항 암호화 관리, 프로그램 참여 이력 매핑 및 강사비 지급을 연동합니다.
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* 교∙강사 리스트 테이블 (좌측) */}
        <div className="glass-card" style={{
          flex: 1.2,
          padding: "1.25rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "800" }}>
              교∙강사 마스터 대장
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="action-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.5rem 1.2rem",
                background: "var(--accent-color)",
                color: "#ffffff",
                border: "none",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              <Plus size={16} /> 신규 교∙강사 등록
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>로딩 중...</div>
          ) : instructors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>등록된 교강사가 없습니다.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>성명</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>구분</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>생년월일 (마스킹)</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>은행명</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>계좌번호 (마스킹)</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>인정 등급</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((ins) => (
                    <tr 
                      key={ins.id} 
                      onClick={() => handleSelectInstructor(ins)}
                      style={{ 
                        borderBottom: "1px solid var(--border-color)", 
                        cursor: "pointer",
                        background: selectedInstructor?.id === ins.id ? "rgba(59,130,246,0.1)" : "transparent"
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700" }}>{ins.name}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span style={{
                          padding: "0.15rem 0.4rem",
                          borderRadius: "0.2rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          background: ins.is_internal ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                          color: ins.is_internal ? "var(--success-color)" : "var(--warning-color)"
                        }}>
                          {ins.is_internal ? "교내" : "교외"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{maskBirthDate(ins.decrypted_birth)}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{ins.bank_name}</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>{maskAccountNumber(ins.decrypted_account)}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span style={{
                          padding: "0.15rem 0.4rem",
                          borderRadius: "0.2rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          background: "rgba(59,130,246,0.15)",
                          color: "var(--accent-color)"
                        }}>
                          {ins.rating_grade || "일반"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteInstructor(ins.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "0.25rem"
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 상세 참여 및 지출 이력 뷰 (우측) */}
        {isDetailOpen && selectedInstructor && (
          <div className="glass-card" style={{
            flex: 1,
            padding: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <User size={16} color="var(--accent-color)" /> {selectedInstructor.name} 교수 상세 대장
              </h3>
              <button onClick={() => setIsDetailOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={16} />
              </button>
            </div>

            {/* 1. 프로그램 참여 이력 섹션 */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <Award size={14} /> 프로그램 참여 이력
              </h4>
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "0.75rem", borderRadius: "0.25rem", marginBottom: "0.5rem" }}>
                <form onSubmit={handleAddProgram} style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                  <select
                    value={newProgForm.year}
                    onChange={(e) => setNewProgForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)" }}
                  >
                    <option value={1}>1차년도</option>
                    <option value={2}>2차년도</option>
                  </select>
                  <select
                    value={newProgForm.unit_id}
                    onChange={(e) => {
                      const uId = e.target.value;
                      setNewProgForm(prev => ({
                        ...prev,
                        unit_id: uId,
                        program_id: PROJECTS_MAP[uId]?.[0] || ""
                      }));
                    }}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)" }}
                  >
                    {Object.keys(PROJECTS_MAP).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                  <select
                    value={newProgForm.program_id}
                    onChange={(e) => setNewProgForm(prev => ({ ...prev, program_id: e.target.value }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)" }}
                  >
                    {(PROJECTS_MAP[newProgForm.unit_id] || []).map(pId => <option key={pId} value={pId}>{pId}</option>)}
                  </select>
                  <select
                    value={newProgForm.department}
                    onChange={(e) => setNewProgForm(prev => ({ ...prev, department: e.target.value }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)" }}
                  >
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                  <button type="submit" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem", fontWeight: "700", background: "var(--accent-color)", color: "#fff", border: "none", borderRadius: "0.2rem", cursor: "pointer" }}>
                    추가
                  </button>
                </form>
              </div>
              {programs.length === 0 ? (
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", padding: "0.5rem" }}>참여 이력이 없습니다.</div>
              ) : (
                <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                  {programs.map(prog => (
                    <li key={prog.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", padding: "0.35rem 0.5rem", borderBottom: "1px dashed var(--border-color)" }}>
                      <span>
                        [{prog.year}차년도] <strong>{prog.unit_id}</strong> / {prog.program_id} ({prog.department})
                      </span>
                      <button onClick={() => handleDeleteProgram(prog.id)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer" }}>
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 2. 강사비 지출 이력 섹션 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <DollarSign size={14} /> 강사비 지출 이력
                </h4>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--success-color)", background: "rgba(16,185,129,0.15)", padding: "0.1rem 0.4rem", borderRadius: "0.2rem" }}>
                  총합: {totalPayment.toLocaleString()}원
                </span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "0.75rem", borderRadius: "0.25rem", marginBottom: "0.5rem" }}>
                <form onSubmit={handleAddPayment} style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                  <input
                    type="date"
                    value={newPayForm.payment_date}
                    onChange={(e) => setNewPayForm(prev => ({ ...prev, payment_date: e.target.value }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", width: "110px" }}
                  />
                  <input
                    type="number"
                    placeholder="지급 금액 (원)"
                    value={newPayForm.amount}
                    onChange={(e) => setNewPayForm(prev => ({ ...prev, amount: e.target.value }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", width: "100px" }}
                  />
                  <select
                    value={newPayForm.program_id}
                    onChange={(e) => setNewPayForm(prev => ({ ...prev, program_id: e.target.value }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)" }}
                  >
                    {/* 교강사의 참여 프로그램 목록을 옵션으로 바인딩하여 2중 검증 */}
                    {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.program_id}</option>)}
                    {programs.length === 0 && <option value="Common">공통 예산</option>}
                  </select>
                  <input
                    type="text"
                    placeholder="비고"
                    value={newPayForm.notes}
                    onChange={(e) => setNewPayForm(prev => ({ ...prev, notes: e.target.value }))}
                    style={{ padding: "0.25rem", fontSize: "0.75rem", borderRadius: "0.2rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", flex: 1, minWidth: "120px" }}
                  />
                  <button type="submit" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem", fontWeight: "700", background: "var(--success-color)", color: "#fff", border: "none", borderRadius: "0.2rem", cursor: "pointer" }}>
                    지급
                  </button>
                </form>
              </div>
              {payments.length === 0 ? (
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", padding: "0.5rem" }}>지출 이력이 없습니다.</div>
              ) : (
                <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                  {payments.map(pay => (
                    <li key={pay.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", padding: "0.35rem 0.5rem", borderBottom: "1px dashed var(--border-color)" }}>
                      <span>
                        <span style={{ color: "var(--text-secondary)", marginRight: "0.4rem" }}>{pay.payment_date}</span>
                        <strong>{parseInt(pay.amount).toLocaleString()}원</strong> ({pay.program_id}) {pay.notes && `- ${pay.notes}`}
                      </span>
                      <button onClick={() => handleDeletePayment(pay.id)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer" }}>
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 신규 교∙강사 등록 모달 */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "var(--card-bg)",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            width: "400px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "800" }}>신규 교∙강사 인적사항 등록</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{
              background: "rgba(239,68,68,0.1)",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.25rem",
              fontSize: "0.7rem",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              marginBottom: "1rem"
            }}>
              <ShieldAlert size={14} /> 개인정보 암호화가 백엔드 저장 전에 자동 활성화됩니다.
            </div>

            <form onSubmit={handleAddInstructor} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>성명</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>교내/교외 여부</label>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={newForm.is_internal === true}
                      onChange={() => setNewForm(prev => ({ ...prev, is_internal: true }))}
                    /> 교내 교강사
                  </label>
                  <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={newForm.is_internal === false}
                      onChange={() => setNewForm(prev => ({ ...prev, is_internal: false }))}
                    /> 교외 전문가
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>생년월일 (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={newForm.birth_date}
                  onChange={(e) => setNewForm(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>은행명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 국민은행"
                    value={newForm.bank_name}
                    onChange={(e) => setNewForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div style={{ flex: 1.8 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>계좌번호</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 110-123-45678"
                    value={newForm.account_number}
                    onChange={(e) => setNewForm(prev => ({ ...prev, account_number: e.target.value }))}
                    style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.25rem", background: "var(--input-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>인정 등급</label>
                <select
                  value={newForm.rating_grade}
                  onChange={(e) => setNewForm(prev => ({ ...prev, rating_grade: e.target.value }))}
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.25rem", background: "var(--input-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)" }}
                >
                  <option value="전문">전문 등급</option>
                  <option value="우수">우수 등급</option>
                  <option value="일반">일반 등급</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-color)", borderRadius: "0.25rem", cursor: "pointer" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", background: "var(--accent-color)", color: "#ffffff", border: "none", borderRadius: "0.25rem", cursor: "pointer", fontWeight: "700" }}
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
