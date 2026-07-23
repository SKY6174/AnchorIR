import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CryptoJS from "crypto-js";
import { Plus, User, Award, Trash2, ShieldAlert, X, Upload, Download, Edit } from "lucide-react";
import * as XLSX from "xlsx";
import { academicYears } from "./OrgChartManager";

// 💡 [보안 수칙 - Rule 8] 개인정보 암복호화를 위한 AES 대칭키 정의
const SECRET_KEY = "anchor_instructor_secure_encryption_key_2026";

// 💡 은행별 계좌번호 형식 포맷 맵
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

// 💡 [암호화 헬퍼] 평문을 안전하게 AES 암호화
const encryptData = (text: string) => {
  if (!text) return "";
  return CryptoJS.AES.encrypt(text.trim(), SECRET_KEY).toString();
};

// 💡 [복호화 헬퍼] 암호문을 복호화하여 평문 반환
const decryptData = (ciphertext: string) => {
  if (!ciphertext) return "";
  const trimmed = ciphertext.trim();
  
  // 💡 [초강력 복호화 예외 차단]
  // 평문 데이터(예: 생년월일 YYYY-MM-DD, 대시 포함 계좌번호 등)인 경우
  // 복호화 시도 시 CryptoJS 에러로 인해 데이터 로드가 중단되는 현상을 방지하기 위해 조기 반환 처리합니다.
  if (
    trimmed.includes("-") || 
    /^\d+$/.test(trimmed) || 
    trimmed.length < 20
  ) {
    return trimmed;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(trimmed, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted || decrypted.trim() === "") {
      return trimmed;
    }
    return decrypted;
  } catch (e) {
    // 예외 발생 시 안전하게 평문 원본 반환
    return trimmed;
  }
};

// 💡 [마스킹 헬퍼] 개인정보 가독성 제한 및 마스킹 처리
const maskBirthDate = (birth?: string): string => {
  if (!birth || birth.length < 10) return birth || "";
  // YYYY-MM-DD -> YYYY-MM-**
  return `${birth.substring(0, 8)}**`;
};

const maskAccountNumber = (account?: string): string => {
  if (!account || account.length < 5) return account || "";
  const len = account.length;
  // 뒤 5자리를 마스킹
  return `${account.substring(0, len - 5)}*****`;
};

// 회계연도에 해당하는 전체 학부(과) 및 전공 목록 자동 추출 헬퍼 함수
export const getDepartmentListByYear = (yearStr: number | string = 2026): string[] => {
  const numericYear = typeof yearStr === "number" ? yearStr : (parseInt(yearStr) || 2026);
  const yearData = (academicYears as any)[numericYear];
  if (!yearData || !yearData.departments) return [];
  
  const names: string[] = [];
  yearData.departments.forEach((group: any) => {
    if (group.subTeams) {
      group.subTeams.forEach((team: any) => {
        names.push(team.name);
        if (team.majors) {
          team.majors.forEach((major: any) => names.push(major.name));
        }
      });
    }
  });
  return Array.from(new Set(names)).sort();
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

// 💡 선택 연도에 속하는 학부/학과/전공 리스트를 유니크하게 추출하는 헬퍼 함수
const getDeptsByYear = (yearStr) => {
  const numericYear = parseInt(yearStr) || 2026;
  const yearData = academicYears[numericYear];
  if (!yearData || !yearData.departments) return [];
  
  const names = [];
  yearData.departments.forEach(group => {
    if (group.subTeams) {
      group.subTeams.forEach(team => {
        names.push(team.name);
        if (team.majors) {
          team.majors.forEach(major => names.push(major.name));
        }
      });
    }
  });
  return Array.from(new Set(names)).sort();
};

export interface InstructorPoolManagerProps {
  currentUser?: any;
  currentRole?: any;
  darkMode?: boolean;
  selectedYear?: number;
}

export default function InstructorPoolManager({ currentUser, currentRole }: InstructorPoolManagerProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [histories, setHistories] = useState<InstructorHistory[]>([]); // 💡 변동 정보 이력 상태값으로 통합 관리
  
  // 💡 서브서브탭 제어 상태 ('master': 교∙강사 마스터 대장, 'history': 교∙강사 활동이력)
  const [activeSubTab, setActiveSubTab] = useState<string>("master");
  // 💡 활동이력 등록 전용 모달 제어 상태
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  // 💡 좌측 교강사 검색용 텍스트 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  
  // 💡 수정 대상 상태 제어 변수 추가
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [editingHistory, setEditingHistory] = useState(null);

  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 신규 교강사 등록 폼 상태 (고정 정보)
  const [newForm, setNewForm] = useState({
    name: "",
    gender: "남성", // 💡 성별 필드 추가
    birth_date: "",
    bank_name: "", // 💡 드롭다운 선택 초기화
    account_number: ""
  });

  // 변동 정보 이력 등록 폼 상태 (하나로 통합)
  const [newHistoryForm, setNewHistoryForm] = useState({
    year: 2026,
    department: "",
    position: "교수",
    is_internal: true,
    unit_id: "B2",
    program_id: "B2-S1T1-1",
    amount: ""
  });

  // 💡 교내 여부 및 연도 변경 시 학부(과) 자동 디폴트 셋팅
  useEffect(() => {
    if (newHistoryForm.is_internal) {
      const depts = getDeptsByYear(newHistoryForm.year);
      if (depts.length > 0) {
        if (!depts.includes(newHistoryForm.department)) {
          setNewHistoryForm(prev => ({ ...prev, department: depts[0] }));
        }
      } else {
        setNewHistoryForm(prev => ({ ...prev, department: "" }));
      }
    } else {
      const depts = getDeptsByYear(newHistoryForm.year);
      if (depts.includes(newHistoryForm.department)) {
        setNewHistoryForm(prev => ({ ...prev, department: "" }));
      }
    }
  }, [newHistoryForm.year, newHistoryForm.is_internal]);

  // 1. 교∙강사 마스터 리스트 로드 (고정 정보)
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

  // 2. 특정 교∙강사 상세 이력 조회 (변동 정보 테이블 `instructor_histories` 조회)
  const handleSelectInstructor = async (ins: any) => {
    setSelectedInstructor(ins);
    setIsDetailOpen(true);
    
    try {
      const { data: historyData, error: historyErr } = await supabase
        .from("instructor_histories")
        .select("*")
        .eq("instructor_id", ins.id)
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });

      if (historyErr) throw historyErr;
      setHistories(historyData || []);
    } catch (err: any) {
      console.error("상세 이력 조회 실패:", err?.message || err);
    }
  };

  // 3. 교∙강사 등록 및 수정 (암호화 수행)
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingInstructor(null);
    setNewForm({
      name: "",
      gender: "남성",
      birth_date: "",
      bank_name: "",
      account_number: ""
    });
  };

  const handleEditInstructorClick = (ins: any) => {
    setEditingInstructor(ins);
    setNewForm({
      name: ins.name,
      gender: ins.gender || "남성",
      birth_date: ins.decrypted_birth,
      bank_name: ins.bank_name,
      account_number: ins.decrypted_account
    });
    setIsAddModalOpen(true);
  };

  const handleAddInstructor = async (e: any) => {
    e.preventDefault();
    if (!newForm.name || !newForm.birth_date || !newForm.bank_name || !newForm.account_number) {
      alert("모든 인적사항 항목을 채워주세요.");
      return;
    }

    try {
      // 민감 정보 AES 암호화
      const encryptedBirth = encryptData(newForm.birth_date);
      const encryptedAccount = encryptData(newForm.account_number);

      if (editingInstructor) {
        // 수정 모드
        const { error } = await supabase
          .from("instructors")
          .update({
            name: newForm.name,
            gender: newForm.gender,
            birth_date: encryptedBirth,
            bank_name: newForm.bank_name,
            account_number: encryptedAccount
          })
          .eq("id", editingInstructor.id);

        if (error) throw error;
        alert("교∙강사 인적사항이 수정되었습니다.");
      } else {
        // 등록 모드
        const isDup = instructors.some(
          (ins) => ins.name === newForm.name && ins.decrypted_birth === newForm.birth_date
        );
        if (isDup) {
          alert("이미 동일한 이름과 생년월일로 등록된 교∙강사가 존재합니다.");
          return;
        }

        const { error } = await supabase.from("instructors").insert({
          name: newForm.name,
          gender: newForm.gender,
          birth_date: encryptedBirth,
          bank_name: newForm.bank_name,
          account_number: encryptedAccount
        });

        if (error) throw error;
        alert("신규 교∙강사가 등록되었습니다.");
      }

      handleCloseAddModal();
      fetchInstructors();
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  // 💡 [엑셀 서식 다운로드]
  const handleDownloadTemplate = () => {
    const headers = [["성명", "성별", "생년월일(YYYY-MM-DD)", "은행명", "계좌번호"]];
    const sampleData = [
      ["홍길동", "남성", "1980-05-15", "신한은행", "110-123-456789"],
      ["신사임당", "여성", "1985-10-23", "KB국민은행", "123-45-678901"]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "교강사_업로드서식");
    
    // 열 너비 조절
    ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 22 }, { wch: 18 }, { wch: 22 }];
    
    XLSX.writeFile(wb, "UC_ANCHOR_교강사_업로드_서식.xlsx");
  };

  // 💡 [엑셀 다운로드 (Export)]
  const handleExcelExport = () => {
    if (instructors.length === 0) {
      alert("다운로드할 교∙강사 데이터가 없습니다.");
      return;
    }

    const dataToExport = instructors.map(ins => ({
      "성명": ins.name,
      "성별": ins.gender || "미정",
      "생년월일": ins.decrypted_birth,
      "은행명": ins.bank_name,
      "계좌번호": ins.decrypted_account
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "교강사_Pool_대장");

    // 열 너비 조절
    ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 22 }];

    XLSX.writeFile(wb, `UC_ANCHOR_교강사_Pool_대장.xlsx`);
  };

  // 💡 [엑셀 업로드 (Import)]
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const excelRows = XLSX.utils.sheet_to_json(ws);

        if (excelRows.length === 0) {
          alert("엑셀 파일에 데이터가 존재하지 않습니다.");
          return;
        }

        // 중복 필터링을 위해 기존 교강사 대장의 복호화된 이름+생년월일 매핑 셋 생성
        const existingSet = new Set(
          instructors.map(ins => `${ins.name.trim()}_${ins.decrypted_birth.trim()}`)
        );

        const newDataList = [];
        let skippedCount = 0;

        for (const row of excelRows) {
          const rawName = row["성명"] || "";
          const rawGender = row["성별"] || "남성";
          const rawBirth = row["생년월일(YYYY-MM-DD)"] || row["생년월일"] || "";
          const rawBank = row["은행명"] || "";
          const rawAccount = row["계좌번호"] || row["계좌"] || "";

          // 필수 정보 검증
          if (!rawName || !rawBirth || !rawBank || !rawAccount) {
            skippedCount++;
            continue;
          }

          const name = String(rawName).trim();
          const birth = String(rawBirth).trim();
          const key = `${name}_${birth}`;

          // 중복 자동 필터링 (이름 + 생년월일 기준)
          if (existingSet.has(key)) {
            skippedCount++;
            continue;
          }

          // 민감 정보 규정에 따른 저장 전 AES 암호화 적용 (Rule 8)
          const encryptedBirth = encryptData(birth);
          const encryptedAccount = encryptData(String(rawAccount).trim());

          newDataList.push({
            name: name,
            gender: String(rawGender).trim(),
            birth_date: encryptedBirth,
            bank_name: String(rawBank).trim(),
            account_number: encryptedAccount
          });
        }

        if (newDataList.length === 0) {
          alert(`가져올 수 있는 신규 데이터가 없습니다. (걸러진 중복/누락 건수: ${skippedCount}건)`);
          return;
        }

        // Supabase DB에 일괄 주입
        const { error } = await supabase.from("instructors").insert(newDataList);
        if (error) throw error;

        alert(`일괄 업로드가 성공적으로 완료되었습니다.\n- 등록 성공: ${newDataList.length}건\n- 중복/누락 스킵: ${skippedCount}건`);
        fetchInstructors();
      } catch (err) {
        alert("엑셀 가져오기 실패: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // 4. 교∙강사 삭제
  // 💡 [사용자 비밀번호 검증 헬퍼]
  const verifyCurrentUserPassword = async (inputPw) => {
    if (currentUser?.email && currentUser?.uuid) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: inputPw
        });
        return !error && data.user?.id === currentUser.uuid;
      } catch (err) {
        console.error("Supabase Auth 재인증 오류:", err);
      }
    }
    return false;
  };

  // 4. 교∙강사 삭제 (비밀번호 확인 필요)
  const handleDeleteInstructor = async (ins) => {
    const inputPw = prompt("교∙강사 마스터 대장 데이터를 삭제하려면 본인의 비밀번호를 입력해 주세요:");
    if (inputPw === null) return; // 취소

    const isVerified = await verifyCurrentUserPassword(inputPw);
    if (!isVerified) {
      alert("비밀번호가 일치하지 않습니다. 삭제가 취소되었습니다.");
      return;
    }

    if (!window.confirm(`정말로 ${ins.name} 교∙강사를 삭제하시겠습니까?\n관련 모든 활동이력도 함께 삭제됩니다.`)) return;

    try {
      const { error } = await supabase.from("instructors").delete().eq("id", ins.id);
      if (error) throw error;
      alert("삭제되었습니다.");
      fetchInstructors();
      if (selectedInstructor?.id === ins.id) {
        setIsDetailOpen(false);
        setSelectedInstructor(null);
      }
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  // 5. 변동 정보 이력 추가 및 수정
  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setEditingHistory(null);
    setNewHistoryForm({
      year: 2026,
      department: "",
      position: "",
      is_internal: true,
      unit_id: "B2",
      program_id: "B2-S1T1-1",
      amount: ""
    });
  };

  const handleEditHistoryClick = (item) => {
    setEditingHistory(item);
    setNewHistoryForm({
      year: item.year,
      department: item.department,
      position: item.position,
      is_internal: item.is_internal,
      unit_id: item.program_id ? item.program_id.split("-")[0] : "B2",
      program_id: item.program_id,
      amount: item.amount
    });
    setIsHistoryModalOpen(true);
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!selectedInstructor || !newHistoryForm.amount) return;
    
    try {
      if (editingHistory) {
        // 수정 모드
        const { error } = await supabase
          .from("instructor_histories")
          .update({
            year: parseInt(newHistoryForm.year),
            department: newHistoryForm.department,
            position: newHistoryForm.position,
            is_internal: newHistoryForm.is_internal,
            program_id: newHistoryForm.program_id,
            amount: parseFloat(newHistoryForm.amount)
          })
          .eq("id", editingHistory.id);

        if (error) throw error;
        alert("교∙강사 활동이력이 수정되었습니다.");
      } else {
        // 등록 모드
        const { error } = await supabase.from("instructor_histories").insert({
          instructor_id: selectedInstructor.id,
          year: parseInt(newHistoryForm.year),
          department: newHistoryForm.department,
          position: newHistoryForm.position,
          is_internal: newHistoryForm.is_internal,
          program_id: newHistoryForm.program_id,
          amount: parseFloat(newHistoryForm.amount)
        });

        if (error) throw error;
        alert("변동 정보 이력이 추가되었습니다.");
      }

      handleCloseHistoryModal();
      handleSelectInstructor(selectedInstructor);
    } catch (err) {
      alert("이력 저장 실패: " + err.message);
    }
  };

  // 6. 변동 정보 이력 삭제
  const handleDeleteHistory = async (id) => {
    try {
      const { error } = await supabase.from("instructor_histories").delete().eq("id", id);
      if (error) throw error;
      handleSelectInstructor(selectedInstructor);
    } catch (err) {
      alert("이력 삭제 실패: " + err.message);
    }
  };

  // 💡 [활동이력 엑셀 서식 다운로드]
  const handleDownloadHistoryTemplate = () => {
    const headers = [["성명", "생년월일(YYYY-MM-DD)", "사업연도", "교내/교외 구분(교내 또는 교외)", "소속", "직급", "단위과제(예: B2)", "참여 프로그램(예: B2-S1T1-1)", "지급비용(원)"]];
    const sampleData = [
      ["김철수", "1975-04-12", "2026", "교내", "컴퓨터정보과", "교수", "B2", "B2-S1T1-1", "350000"],
      ["이영희", "1982-11-23", "2026", "교외", "간호학협회", "강사", "A1", "A1-S2T1-2", "500000"]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "활동이력_업로드서식");
    
    ws["!cols"] = [
      { wch: 15 }, { wch: 22 }, { wch: 12 }, { wch: 25 }, 
      { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 18 }
    ];
    
    XLSX.writeFile(wb, "UC_ANCHOR_교강사_활동이력_업로드_서식.xlsx");
  };

  // 💡 [활동이력 엑셀 다운로드 (Export)]
  const handleHistoryExcelExport = async () => {
    try {
      const { data: allHistories, error: histErr } = await supabase
        .from("instructor_histories")
        .select("*")
        .order("year", { ascending: false });
        
      if (histErr) throw histErr;
      
      if (!allHistories || allHistories.length === 0) {
        alert("다운로드할 활동이력 데이터가 존재하지 않습니다.");
        return;
      }

      const insMap = {};
      instructors.forEach(ins => {
        insMap[ins.id] = ins;
      });

      const dataToExport = allHistories.map(h => {
        const ins = insMap[h.instructor_id] || {};
        return {
          "성명": ins.name || "알수없음",
          "생년월일": ins.decrypted_birth || "",
          "사업연도": h.year,
          "교내/교외 구분": h.is_internal ? "교내" : "교외",
          "소속": h.department,
          "직급": h.position,
          "단위과제": h.program_id ? h.program_id.split("-")[0] : "",
          "참여 프로그램": h.program_id,
          "지급비용": h.amount
        };
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "교강사_활동이력_대장");

      ws["!cols"] = [
        { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, 
        { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 22 }, { wch: 18 }
      ];

      XLSX.writeFile(wb, `UC_ANCHOR_교강사_활동이력_대장.xlsx`);
    } catch (err) {
      alert("활동이력 엑셀 다운로드 실패: " + err.message);
    }
  };

  // 💡 [활동이력 엑셀 업로드 (Import)]
  const handleHistoryExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const excelRows = XLSX.utils.sheet_to_json(ws);

        if (excelRows.length === 0) {
          alert("엑셀 파일에 데이터가 존재하지 않습니다.");
          return;
        }

        const insLookup = {};
        instructors.forEach(ins => {
          const key = `${ins.name.trim()}_${ins.decrypted_birth.trim()}`;
          insLookup[key] = ins.id;
        });

        const newHistList = [];
        let skippedCount = 0;
        let notFoundCount = 0;

        for (const row of excelRows) {
          const rawName = row["성명"] || "";
          const rawBirth = row["생년월일(YYYY-MM-DD)"] || row["생년월일"] || "";
          const rawYear = row["사업연도"] || 2026;
          const rawInternalStr = row["교내/교외 구분(교내 또는 교외)"] || row["교내/교외 구분"] || "교내";
          const rawDept = row["소속"] || "";
          const rawPosition = row["직급"] || "";
          const rawProgram = row["참여 프로그램(예: B2-S1T1-1)"] || row["참여 프로그램"] || "";
          const rawAmount = row["지급비용(원)"] || row["지급비용"] || 0;

          if (!rawName || !rawBirth || !rawDept || !rawProgram) {
            skippedCount++;
            continue;
          }

          const name = String(rawName).trim();
          const birth = String(rawBirth).trim();
          const lookupKey = `${name}_${birth}`;
          const instructorId = insLookup[lookupKey];

          if (!instructorId) {
            notFoundCount++;
            continue;
          }

          const isInternal = String(rawInternalStr).trim() === "교내";

          newHistList.push({
            instructor_id: instructorId,
            year: parseInt(rawYear) || 2026,
            department: String(rawDept).trim(),
            position: String(rawPosition).trim(),
            is_internal: isInternal,
            program_id: String(rawProgram).trim(),
            amount: parseFloat(rawAmount) || 0
          });
        }

        if (newHistList.length === 0) {
          alert(`가져올 수 있는 신규 활동이력이 없습니다.\n- 누락 스킵: ${skippedCount}건\n- 마스터 대장 미등록 스킵: ${notFoundCount}건`);
          return;
        }

        const { error } = await supabase.from("instructor_histories").insert(newHistList);
        if (error) throw error;

        alert(`활동이력 일괄 업로드가 성공적으로 완료되었습니다.\n- 등록 성공: ${newHistList.length}건\n- 누락/대장미등록 스킵: ${skippedCount + notFoundCount}건`);
        
        if (selectedInstructor) {
          handleSelectInstructor(selectedInstructor);
        } else {
          fetchInstructors();
        }
      } catch (err) {
        alert("활동이력 엑셀 가져오기 실패: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // 총 지급비용 연산
  const totalPayment = histories.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", color: "var(--text-color)" }}>
      {/* 1. 상단 안내 카드 */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <User size={20} />
          교∙강사 Pool 관리 시스템
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          교∙강사의 인적사항을 안전하게 암호화 관리하고, 매년 변동되는 소속, 직급, 교내외 여부 및 프로그램별 지급 비용을 이력으로 통합 연계합니다.
        </p>
      </div>

      {/* 💡 [서브서브메뉴] 탭 버튼 바 (Premium Glassmorphism Style) */}
      <div style={{ display: "flex", gap: "0.35rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem" }}>
        <button
          onClick={() => setActiveSubTab("master")}
          style={{
            padding: "0.5rem 1.2rem",
            fontSize: "0.85rem",
            fontWeight: "800",
            border: "none",
            background: activeSubTab === "master" ? "rgba(139, 92, 246, 0.12)" : "transparent",
            color: activeSubTab === "master" ? "#8b5cf6" : "var(--text-secondary)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🗂️ 교∙강사 마스터 대장
        </button>
        <button
          onClick={() => {
            setActiveSubTab("history");
            // 선택된 교강사가 없을 시 기본 첫 번째 교수 지정
            if (!selectedInstructor && instructors.length > 0) {
              handleSelectInstructor(instructors[0]);
            }
          }}
          style={{
            padding: "0.5rem 1.2rem",
            fontSize: "0.85rem",
            fontWeight: "800",
            border: "none",
            background: activeSubTab === "history" ? "rgba(59, 130, 246, 0.12)" : "transparent",
            color: activeSubTab === "history" ? "#3b82f6" : "var(--text-secondary)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          📈 교∙강사 활동이력
        </button>
      </div>

      {/* 탭 1: 교.강사 마스터 대장 */}
      {activeSubTab === "master" && (
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>
              교∙강사 인적사항 현황 (고정 정보)
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={handleDownloadTemplate}
                className="action-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.6rem 1.2rem",
                  background: "#ffffff",
                  color: "#8b5cf6",
                  border: "1px solid #8b5cf6",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Download size={16} /> 엑셀 서식
              </button>
              <label
                className="action-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.6rem 1.2rem",
                  background: "#ecfdf5",
                  color: "#10b981",
                  border: "1px solid #10b981",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  margin: 0,
                  transition: "all 0.2s ease"
                }}
              >
                <Upload size={16} /> 엑셀 업로드
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelImport}
                  style={{ display: "none" }}
                />
              </label>
              <button
                onClick={handleExcelExport}
                className="action-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.6rem 1.2rem",
                  background: "#f5f3ff",
                  color: "#8b5cf6",
                  border: "1px solid #8b5cf6",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Download size={16} /> 엑셀 다운로드
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="action-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.6rem 1.4rem",
                  background: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "9999px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Plus size={18} /> 신규 등록
              </button>
            </div>
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
                    <th style={{ padding: "0.75rem 0.5rem" }}>성별</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>생년월일 (마스킹)</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>은행명</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>계좌번호 (마스킹)</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((ins) => (
                    <tr 
                      key={ins.id} 
                      onClick={() => {
                        handleSelectInstructor(ins);
                        setActiveSubTab("history");
                      }}
                      title="클릭하여 활동이력 확인 및 신규 이력 등록"
                      style={{ 
                        borderBottom: "1px solid var(--border-color)", 
                        cursor: "pointer",
                        background: selectedInstructor?.id === ins.id ? "rgba(59,130,246,0.06)" : "transparent",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--panel-bg)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = selectedInstructor?.id === ins.id ? "rgba(59,130,246,0.06)" : "transparent"}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700", color: "var(--accent-color)" }}>{ins.name}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span style={{
                          padding: "0.15rem 0.4rem",
                          borderRadius: "0.2rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          background: ins.gender === "남성" ? "rgba(59,130,246,0.15)" : "rgba(236,72,153,0.15)",
                          color: ins.gender === "남성" ? "#3b82f6" : "#ec4899"
                        }}>
                          {ins.gender || "미정"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{maskBirthDate(ins.decrypted_birth)}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{ins.bank_name}</td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>{maskAccountNumber(ins.decrypted_account)}</td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", alignItems: "center" }}>
                          <button
                            onClick={() => handleEditInstructorClick(ins)}
                            title="수정"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "var(--accent-color)",
                              cursor: "pointer",
                              padding: "0.25rem"
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteInstructor(ins)}
                            title="삭제"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 탭 2: 교.강사 활동이력 */}
      {activeSubTab === "history" && (
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", width: "100%" }}>
          {/* 탭 2 좌측: 교강사 목록 패널 */}
          <div className="glass-card" style={{ flex: 0.13, minWidth: "120px", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: "800" }}>교∙강사 선택</h3>
            <input
              type="text"
              placeholder="🔍 성명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.6rem",
                fontSize: "0.8rem",
                borderRadius: "0.25rem",
                background: "var(--card-bg)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
                outline: "none"
              }}
            />
            <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {instructors
                .filter(ins => ins.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(ins => (
                  <div
                    key={ins.id}
                    onClick={() => handleSelectInstructor(ins)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.35rem",
                      cursor: "pointer",
                      border: "1px solid var(--border-color)",
                      background: selectedInstructor?.id === ins.id ? "rgba(59, 130, 246, 0.1)" : "transparent",
                      borderColor: selectedInstructor?.id === ins.id ? "#3b82f6" : "var(--border-color)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: "700", fontSize: "0.8rem" }}>{ins.name}</span>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                      생년월일: {maskBirthDate(ins.decrypted_birth)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 탭 2: 교.강사 활동이력 대장 */}
          <div className="glass-card" style={{ flex: 0.87, padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {selectedInstructor ? `📈 ${selectedInstructor.name} 교수 활동이력` : "활동이력을 확인할 교강사를 좌측에서 선택해 주세요."}
                </h3>
                {selectedInstructor && (
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--success-color)", background: "rgba(16,185,129,0.15)", padding: "0.15rem 0.4rem", borderRadius: "0.2rem" }}>
                    누적 지급: {totalPayment.toLocaleString()}원
                  </span>
                )}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={handleDownloadHistoryTemplate}
                  className="action-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.6rem 1.2rem",
                    background: "#ffffff",
                    color: "#8b5cf6",
                    border: "1px solid #8b5cf6",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Download size={16} /> 엑셀 서식
                </button>
                <label
                  className="action-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.6rem 1.2rem",
                    background: "#ecfdf5",
                    color: "#10b981",
                    border: "1px solid #10b981",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    margin: 0,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Upload size={16} /> 엑셀 업로드
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleHistoryExcelImport}
                    style={{ display: "none" }}
                  />
                </label>
                <button
                  onClick={handleHistoryExcelExport}
                  className="action-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.6rem 1.2rem",
                    background: "#f5f3ff",
                    color: "#8b5cf6",
                    border: "1px solid #8b5cf6",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Download size={16} /> 엑셀 다운로드
                </button>
                <button
                  onClick={() => {
                    if (!selectedInstructor) {
                      alert("이력을 등록할 대상 교∙강사를 먼저 선택해 주세요.");
                      return;
                    }
                    setIsHistoryModalOpen(true);
                  }}
                  className="action-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.6rem 1.4rem",
                    background: "#3b82f6",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "9999px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Plus size={18} /> 신규 등록
                </button>
              </div>
            </div>

            {selectedInstructor ? (
              <div>
                {histories.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", padding: "3rem 1rem", textAlign: "center" }}>등록된 참여 및 지급 활동이력이 존재하지 않습니다.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left", color: "var(--text-secondary)" }}>
                          <th style={{ padding: "0.75rem 0.5rem" }}>연도</th>
                          <th style={{ padding: "0.75rem 0.5rem" }}>소속</th>
                          <th style={{ padding: "0.75rem 0.5rem" }}>직급</th>
                          <th style={{ padding: "0.75rem 0.5rem" }}>구분</th>
                          <th style={{ padding: "0.75rem 0.5rem" }}>참여 프로그램</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>지급비용</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {histories.map(item => (
                          <tr key={item.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "all 0.15s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--panel-bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700" }}>{item.year}학년도</td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>{item.department}</td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>{item.position}</td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>
                              <span style={{
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                padding: "0.15rem 0.4rem",
                                borderRadius: "0.2rem",
                                background: item.is_internal ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                                color: item.is_internal ? "var(--success-color)" : "var(--warning-color)"
                              }}>
                                {item.is_internal ? "교내" : "교외"}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>{item.program_id}</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "700", color: "var(--accent-color)" }}>{parseInt(item.amount).toLocaleString()}원</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => handleEditHistoryClick(item)}
                                  title="수정"
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--accent-color)",
                                    cursor: "pointer",
                                    padding: "0.25rem"
                                  }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHistory(item.id)}
                                  title="삭제"
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
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
                상세 조회할 교∙강사를 왼쪽 리스트에서 선택해 주세요.
              </div>
            )}
          </div>
        </div>
      )}
      {/* 활동이력 등록 모달 (변동 정보) */}
      {isHistoryModalOpen && selectedInstructor && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
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
            maxWidth: "500px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)" }}>
                📈 {selectedInstructor.name} 교수 {editingHistory ? "활동이력 수정" : "활동이력 추가"}
              </h3>
              <button type="button" onClick={handleCloseHistoryModal} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              await handleAddHistory(e);
              setIsHistoryModalOpen(false);
            }} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              {/* 사업연도 및 교내/교외 구분 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>사업연도</label>
                  <select
                    value={newHistoryForm.year}
                    onChange={(e) => setNewHistoryForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                  >
                    <option value={2024}>2024학년도</option>
                    <option value={2025}>2025학년도</option>
                    <option value={2026}>2026학년도</option>
                    <option value={2027}>2027학년도</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>교내/교외 구분</label>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                      <input
                        type="radio"
                        checked={newHistoryForm.is_internal === true}
                        onChange={() => setNewHistoryForm(prev => ({ ...prev, is_internal: true }))}
                      /> 교내
                    </label>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                      <input
                        type="radio"
                        checked={newHistoryForm.is_internal === false}
                        onChange={() => setNewHistoryForm(prev => ({ ...prev, is_internal: false }))}
                      /> 교외
                    </label>
                  </div>
                </div>
              </div>

              {/* 소속 및 직급 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>소속</label>
                  {newHistoryForm.is_internal ? (
                    <select
                      value={newHistoryForm.department}
                      onChange={(e) => setNewHistoryForm(prev => ({ ...prev, department: e.target.value }))}
                      style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                    >
                      {getDeptsByYear(newHistoryForm.year).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="소속 기관명 직접 입력"
                      required
                      value={newHistoryForm.department}
                      onChange={(e) => setNewHistoryForm(prev => ({ ...prev, department: e.target.value }))}
                      style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>직급</label>
                  <input
                    type="text"
                    placeholder="예: 교수, 처장 등"
                    required
                    value={newHistoryForm.position}
                    onChange={(e) => setNewHistoryForm(prev => ({ ...prev, position: e.target.value }))}
                    style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
              </div>

              {/* 단위과제 및 참여 프로그램 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>단위과제</label>
                  <select
                    value={newHistoryForm.unit_id}
                    onChange={(e) => {
                      const uId = e.target.value;
                      setNewHistoryForm(prev => ({
                        ...prev,
                        unit_id: uId,
                        program_id: PROJECTS_MAP[uId]?.[0] || ""
                      }));
                    }}
                    style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                  >
                    {Object.keys(PROJECTS_MAP).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>참여 프로그램</label>
                  <select
                    value={newHistoryForm.program_id}
                    onChange={(e) => setNewHistoryForm(prev => ({ ...prev, program_id: e.target.value }))}
                    style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                  >
                    {(PROJECTS_MAP[newHistoryForm.unit_id] || []).map(pId => <option key={pId} value={pId}>{pId}</option>)}
                  </select>
                </div>
              </div>

              {/* 지급비용 */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "0.25rem" }}>지급비용 (원)</label>
                <input
                  type="number"
                  placeholder="예: 500000"
                  required
                  value={newHistoryForm.amount}
                  onChange={(e) => setNewHistoryForm(prev => ({ ...prev, amount: e.target.value }))}
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.375rem", background: "var(--card-bg)", color: "var(--text-color)", border: "1px solid var(--border-color)", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseHistoryModal}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  {editingHistory ? "이력 수정 완료" : "이력 추가 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 신규 교∙강사 등록 모달 (고정 정보) */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
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
            maxWidth: "450px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)" }}>
                👤 {editingInstructor ? "교∙강사 인적사항 수정 (고정 정보)" : "신규 교∙강사 인적사항 등록 (고정 정보)"}
              </h3>
              <button type="button" onClick={handleCloseAddModal} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <div style={{
                background: "rgba(239,68,68,0.1)",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.25rem",
                fontSize: "0.7rem",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                marginBottom: "0.25rem"
              }}>
                <ShieldAlert size={14} /> 개인정보 암호화가 백엔드 저장 전에 자동 활성화됩니다.
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600", display: "block" }}>성명</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600", display: "block" }}>성별</label>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                    <input
                      type="radio"
                      name="gender"
                      checked={newForm.gender === "남성"}
                      onChange={() => setNewForm(prev => ({ ...prev, gender: "남성" }))}
                    /> 남성
                  </label>
                  <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                    <input
                      type="radio"
                      name="gender"
                      checked={newForm.gender === "여성"}
                      onChange={() => setNewForm(prev => ({ ...prev, gender: "여성" }))}
                    /> 여성
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600", display: "block" }}>생년월일 (YYYY-MM-DD)</label>
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
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600", display: "block" }}>은행명</label>
                  <select
                    required
                    value={newForm.bank_name}
                    onChange={(e) => setNewForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="form-input"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--text-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.375rem",
                      padding: "0.5rem",
                      fontSize: "0.8rem",
                      width: "100%",
                      outline: "none"
                    }}
                  >
                    <option value="">은행 선택</option>
                    {Object.keys(BANK_FORMATS).map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1.8 }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600", display: "block" }}>계좌번호</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 110-123-45678"
                    value={newForm.account_number}
                    onChange={(e) => setNewForm(prev => ({ ...prev, account_number: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseAddModal}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  {editingInstructor ? "수정 완료" : "등록 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
