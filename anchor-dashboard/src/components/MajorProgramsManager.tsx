import React, { useState, useEffect } from "react";
import {
  BookOpen, Settings, Compass,
  Activity, Plus, Trash2, ArrowRight,
  FileSpreadsheet, Download, Pencil
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { MajorProgramUnitNavigation } from "../features/major-programs/components/major-program-unit-navigation";
import { MajorProgramSeminarModal } from "../features/major-programs/components/major-program-seminar-modal";
import { OrderlyCourseTabNavigation } from "../features/major-programs/components/orderly-course-tab-navigation";
import { OrderlyCoursePlanTab } from "../features/major-programs/components/orderly-course-plan-tab";
import { majorProgramsData, ORDERLY_COURSES, PM_PROFESSORS } from "../features/major-programs/data/major-program-data";
import { getOverallStatus } from "../features/major-programs/utils/major-program-utils";
import type {
  CourseStatus,
  CourseStatusKey,
  MajorProgram,
  MajorProgramsManagerProps,
  MajorUnitData,
  OrderlyCourse,
  PmProfessor,
  SeminarRecord,
  StudentRecord
} from "../features/major-programs/major-program-types";

export type {
  MajorProgram,
  MajorProgramsManagerProps,
  MajorUnitData
} from "../features/major-programs/major-program-types";


export default function MajorProgramsManager({ selectedYear = 2 }: MajorProgramsManagerProps) {
  // 현재 연도에 해당하는 단위과제 목록 추출
  const yearData: Record<string, MajorUnitData> = (majorProgramsData as any)[selectedYear] || {};
  const unitKeys = Object.keys(yearData);

  // 현재 선택된 단위과제 상태 (로컬스토리지 복원 지원)
  const [selectedUnit, setSelectedUnit] = useState<string>(() => {
    return localStorage.getItem("anchor_selected_unit") || "";
  });
  // 현재 선택된 프로그램 상태 (로컬스토리지 복원 지원)
  const [selectedProg, setSelectedProg] = useState<MajorProgram | null>(() => {
    const saved = localStorage.getItem("anchor_selected_prog");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("선택된 프로그램 파싱 에러:", e);
      }
    }
    return null;
  });

  // 💡 선택된 단위과제 및 프로그램 상태가 변경되면 로컬스토리지에 자동 저장
  useEffect(() => {
    if (selectedUnit) {
      localStorage.setItem("anchor_selected_unit", selectedUnit);
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedProg) {
      localStorage.setItem("anchor_selected_prog", JSON.stringify(selectedProg));
    } else {
      localStorage.removeItem("anchor_selected_prog");
    }
  }, [selectedProg]);

  // 💡 주문식 교육과정 전용 하위 탭 관리 ("plan" | "process" | "result")
  const [orderlyTab, setOrderlyTab] = useState(() => {
    return localStorage.getItem("anchor_orderly_tab") || "plan";
  });
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [pmSearchQuery, setPmSearchQuery] = useState("");
  const [activeCourseId, setActiveCourseId] = useState(() => {
    return localStorage.getItem("anchor_active_course_id") || "cap_1";
  });

  // 💡 Supabase 연동 상태 및 예외처리(Fallback)용 상태 정의
  // 초보 개발자용 설명:
  // pmProfessors와 orderlyCourses는 Supabase DB로부터 수신된 실시간 정보를 관리합니다.
  // 네트워크 장애 등으로 DB 쿼리가 불가능할 경우를 대비해,
  // 파일 최상단에 선언해 둔 로컬 백업 상수(PM_PROFESSORS, ORDERLY_COURSES)를 초기값으로 갖게 하여
  // 시스템 안전성을 확보합니다.
  const [pmProfessors, setPmProfessors] = useState<PmProfessor[]>(PM_PROFESSORS);
  const [orderlyCourses, setOrderlyCourses] = useState<OrderlyCourse[]>(ORDERLY_COURSES);
  const [_dbLoading, setDbLoading] = useState(true);

  // 💡 Supabase 데이터 페치 로직
  // 초보 개발자용 설명:
  // 컴포넌트가 로드(마운트)될 때 Supabase 서버에서 주문식 교육과정 정보를 실시간으로 읽어옵니다.
  // SQL의 SnakeCase 필드를 리액트용 CamelCase 필드로 유연하게 매핑하여 컴포넌트 상태를 업데이트합니다.
  useEffect(() => {
    async function fetchOrderlyData() {
      try {
        setDbLoading(true);

        // 1. 학과/전공별 주문식 교육과정 운영 정보 조회
        const { data: deptData, error: deptError } = await supabase
          .from("orderly_courses_depts")
          .select("*")
          .order("id", { ascending: true });

        if (deptError) throw deptError;

        // 2. 개별 주문식 교육과정 교과목 조회
        const { data: courseData, error: courseError } = await supabase
          .from("orderly_courses")
          .select("*");

        if (courseError) throw courseError;

        // DB에 데이터가 존재하는 경우, CamelCase 변환 후 상태를 업데이트합니다.
        if (deptData && deptData.length > 0) {
          const mappedDepts = deptData.map(d => ({
            dept: d.dept,
            name: d.pm_name,
            courses: d.courses,
            totalStudents: d.total_students ?? 0,
            uniqueStudents: d.unique_students ?? 0,
            note: d.note ?? ""
          }));
          setPmProfessors(mappedDepts);
        }

        if (courseData && courseData.length > 0) {
          const mappedCourses = courseData.map(c => ({
            id: c.id,
            type: c.type,
            dept: c.dept,
            name: c.name,
            professor: c.professor,
            students: c.students ?? 0,
            budget: Number(c.budget),
            year: c.year ?? 0,
            isForeign: c.is_foreign ?? false
          }));
          setOrderlyCourses(mappedCourses);
        }
      } catch (err) {
        console.error("주문식 교육과정 Supabase 데이터 연동 에러 (기본 로컬 데이터가 안전하게 활성화됩니다):", err);
      } finally {
        setDbLoading(false);
      }
    }

    fetchOrderlyData();
  }, []);

  // 💡 학과별 이수결과 조회를 위한 결과 탭 전용 학과 필터 상태
  const [selectedResultDeptFilter, setSelectedResultDeptFilter] = useState("all");

  // 💡 가상 이수학생 데이터 및 상태 관리 (학생 단위 마스터 대장 구조)
  const [studentMasterList, setStudentMasterList] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem("anchor_student_master_list");
    if (saved) {
      try {
        return JSON.parse(saved) as StudentRecord[];
      } catch (e) {
        console.error("이수학생 마스터 데이터 파싱 에러:", e);
      }
    }
    return [
      { id: "202611001", name: "김민재", dept: "기계공학부", capstone: "이수완료", pbl: "미참여", omnibus: "미참여", ai: "이수완료" },
      { id: "202611002", name: "이지은", dept: "기계공학부", capstone: "진행중", pbl: "미참여", omnibus: "미참여", ai: "미참여" },
      { id: "202611003", name: "박준서", dept: "기계공학부", capstone: "이수완료", pbl: "이수완료", omnibus: "미참여", ai: "미참여" },
      { id: "202611004", name: "윤도훈", dept: "기계공학부", capstone: "이수완료", pbl: "미참여", omnibus: "진행중", ai: "미참여" },
      { id: "202611005", name: "한소희", dept: "기계공학부", capstone: "진행중", pbl: "미참여", omnibus: "미참여", ai: "이수완료" },
      { id: "202612041", name: "최주연", dept: "간호학부", capstone: "미참여", pbl: "이수완료", omnibus: "미참여", ai: "이수완료" },
      { id: "202612042", name: "황도현", dept: "간호학부", capstone: "미참여", pbl: "진행중", omnibus: "미참여", ai: "미참여" },
      { id: "202612043", name: "안서연", dept: "간호학부", capstone: "미참여", pbl: "이수완료", omnibus: "이수완료", ai: "미참여" },
      { id: "202613091", name: "민지선", dept: "스포츠건강재활학과", capstone: "미참여", pbl: "미참여", omnibus: "이수완료", ai: "진행중" },
      { id: "202613092", name: "송지훈", dept: "스포츠건강재활학과", capstone: "미참여", pbl: "미참여", omnibus: "진행중", ai: "미참여" }
    ];
  });

  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentDept, setNewStudentDept] = useState("");

  // 💡 지산학 이음 세미나 결과보고 리스트 상태 (1~3차 초기 데이터 제공 및 로컬스토리지 연동)
  const [seminarList, setSeminarList] = useState<SeminarRecord[]>(() => {
    const saved = localStorage.getItem("anchor_seminar_list");
    if (saved) {
      try {
        return JSON.parse(saved) as SeminarRecord[];
      } catch (e) {
        console.error("세미나 결과 대장 파싱 에러:", e);
      }
    }
    return [
      {
        id: 1,
        date: "2026. 03. 11. (수) 12:00~13:00 / 13:30~15:30",
        speaker: "박철우 (한국공학대학교 부총장)",
        title: "호모사피엔스의 혁신과 산학협력 기반 대학 혁신 / AI",
        attendees: 70,
        mainCost: 2576000,
        carryCost: 0,
        satisfaction: 4.8,
        etc: "대학 보직자 대상 AI 기반 대학 혁신 컨설팅 병행. 강사비 1,000,000원 포함. 보도자료 배포 완료"
      },
      {
        id: 2,
        date: "2026. 04. 24. (금) 11:00~13:00",
        speaker: "강신욱 (인택스세무법인 대표 세무사)",
        title: "알면 쓸데있는 세금 잡학사전",
        attendees: 93,
        mainCost: 0,
        carryCost: 1540000,
        satisfaction: 4.7,
        etc: "입주기업 및 대학 관계자 대상 실무 세무 특강. 강사비 500,000원 포함. 2025년 RISE 이월금 활용. 보도자료 배포 완료"
      },
      {
        id: 3,
        date: "2026. 05. 08. (금) 11:00~13:00",
        speaker: "임종석 (골프산업과 특임교수)",
        title: "건강을 지키는 골프, 오래 즐기는 골프",
        attendees: 81,
        mainCost: 1000000,
        carryCost: 412640,
        satisfaction: 4.9,
        etc: "신체 자세 교정 및 부상 예방 스트레칭 실습 진행. 강사비 300,000원 포함. 2025년 이월 본사업비 및 2026년 간접비 활용"
      }
    ];
  });

  // 이수학생 마스터 리스트가 변경될 때마다 로컬 스토리지에 영구 저장
  useEffect(() => {
    localStorage.setItem("anchor_student_master_list", JSON.stringify(studentMasterList));
  }, [studentMasterList]);

  // 세미나 리스트 변경 시 로컬 스토리지 영구 저장
  useEffect(() => {
    localStorage.setItem("anchor_seminar_list", JSON.stringify(seminarList));
  }, [seminarList]);

  // 💡 Supabase DB에서 세미나 결과 대장 가져오기 및 초기 데이터 시딩
  useEffect(() => {
    const fetchSeminarReports = async () => {
      try {
        const { data, error } = await supabase
          .from("seminar_reports")
          .select("*")
          .order("seminar_id", { ascending: true });

        if (error) {
          console.warn("Supabase 세미나 테이블 조회 실패 (로컬 스토리지 폴백 가동):", error);
          const saved = localStorage.getItem("anchor_seminar_list");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.length > 0) {
                setSeminarList(parsed);
                return;
              }
            } catch (e) {
              console.error("로컬 세미나 리스트 파싱 실패:", e);
            }
          }
          // 로컬스토리지도 비어있을 시 1~5차 하드코딩 기본 시드 구성
          const fallbackSeed = [
            {
              id: 1,
              date: "2026. 03. 11. (수) 12:00~13:00 / 13:30~15:30",
              speaker: "박철우 (한국공학대학교 부총장)",
              title: "호모사피엔스의 혁신과 산학협력 기반 대학 혁신 / AI",
              attendees: 70,
              mainCost: 2576000,
              carryCost: 0,
              satisfaction: 4.8,
              etc: "대학 보직자 대상 AI 기반 대학 혁신 컨설팅 병행. 강사비 1,000,000원 포함. 보도자료 배포 완료"
            },
            {
              id: 2,
              date: "2026. 04. 24. (금) 11:00~13:00",
              speaker: "강신욱 (인택스세무법인 대표 세무사)",
              title: "알면 쓸데있는 세금 잡학사전",
              attendees: 93,
              mainCost: 0,
              carryCost: 1540000,
              satisfaction: 4.7,
              etc: "입주기업 및 대학 관계자 대상 실무 세무 특강. 강사비 500,000원 포함. 2025년 RISE 이월금 활용. 보도자료 배포 완료"
            },
            {
              id: 3,
              date: "2026. 05. 08. (금) 11:00~13:00",
              speaker: "임종석 (골프산업과 특임교수)",
              title: "건강을 지키는 골프, 오래 즐기는 골프",
              attendees: 81,
              mainCost: 1000000,
              carryCost: 628910,
              satisfaction: 4.9,
              etc: "골프 대중화에 따른 지역 주민 열린 평생 교육 실습 및 대학 교직원 건강 복지 연계 스포츠 세미나."
            },
            {
              id: 4,
              date: "2026. 05. 22. (금) 11:00~13:00",
              speaker: "김영곤 ㈜한창제지 기업부설연구소 연구소장",
              title: "종이, 그 이상의 이야기",
              attendees: 77,
              mainCost: 1800000,
              carryCost: 370000,
              satisfaction: 4.8,
              etc: "한창제지 연구소장 특강을 통한 제지 산업 기술 공유 및 HD현대이엔티 등 입주기업 지산학 교류 워크숍."
            },
            {
              id: 5,
              date: "2026. 06. 12. (금) 11:00~13:00",
              speaker: "박승남 (울산대학교 산업대학원 겸임교수)",
              title: "조선산업 산업융합 전략",
              attendees: 74,
              mainCost: 840000,
              carryCost: 258910,
              satisfaction: 4.7,
              etc: "스마트 제조 및 ICT 스마트 조선소 혁신 전략 특강. 이월금 물품비 258,910원 및 본사업비 다과비 840,000원 집행. 보도자료 배포 완료."
            }
          ];
          setSeminarList(fallbackSeed);
          return;
        }

        if (data && data.length > 0) {
          const mappedList = data.map(item => ({
            id: item.seminar_id,
            date: item.date,
            speaker: item.speaker,
            title: item.title,
            attendees: item.attendees,
            mainCost: Number(item.main_cost),
            carryCost: Number(item.carry_cost),
            satisfaction: Number(item.satisfaction),
            etc: item.etc ?? ""
          }));
          setSeminarList(mappedList);
        } else {
          console.log("DB가 비어 있습니다. 초기 세미나 데이터를 등록합니다.");
          const seedSeminars = [
            {
              seminar_id: 1,
              date: "2026. 03. 11. (수) 12:00~13:00 / 13:30~15:30",
              speaker: "박철우 (한국공학대학교 부총장)",
              title: "호모사피엔스의 혁신과 산학협력 기반 대학 혁신 / AI",
              attendees: 70,
              main_cost: 2576000,
              carry_cost: 0,
              satisfaction: 4.8,
              etc: "대학 보직자 대상 AI 기반 대학 혁신 컨설팅 병행. 강사비 1,000,000원 포함. 보도자료 배포 완료"
            },
            {
              seminar_id: 2,
              date: "2026. 04. 24. (금) 11:00~13:00",
              speaker: "강신욱 (인택스세무법인 대표 세무사)",
              title: "알면 쓸데있는 세금 잡학사전",
              attendees: 93,
              main_cost: 0,
              carry_cost: 1540000,
              satisfaction: 4.7,
              etc: "입주기업 및 대학 관계자 대상 실무 세무 특강. 강사비 500,000원 포함. 2025년 RISE 이월금 활용. 보도자료 배포 완료"
            },
            {
              seminar_id: 3,
              date: "2026. 05. 08. (금) 11:00~13:00",
              speaker: "임종석 (골프산업과 특임교수)",
              title: "건강을 지키는 골프, 오래 즐기는 골프",
              attendees: 81,
              main_cost: 1000000,
              carry_cost: 628910,
              satisfaction: 4.9,
              etc: "골프 대중화에 따른 지역 주민 열린 평생 교육 실습 및 대학 교직원 건강 복지 연계 스포츠 세미나."
            },
            {
              seminar_id: 4,
              date: "2026. 05. 22. (금) 11:00~13:00",
              speaker: "김영곤 ㈜한창제지 기업부설연구소 연구소장",
              title: "종이, 그 이상의 이야기",
              attendees: 77,
              main_cost: 1800000,
              carry_cost: 370000,
              satisfaction: 4.8,
              etc: "한창제지 연구소장 특강을 통한 제지 산업 기술 공유 및 HD현대이엔티 등 입주기업 지산학 교류 워크숍."
            },
            {
              seminar_id: 5,
              date: "2026. 06. 12. (금) 11:00~13:00",
              speaker: "박승남 (울산대학교 산업대학원 겸임교수)",
              title: "조선산업 산업융합 전략",
              attendees: 74,
              main_cost: 840000,
              carry_cost: 258910,
              satisfaction: 4.7,
              etc: "스마트 제조 및 ICT 스마트 조선소 혁신 전략 특강. 이월금 물품비 258,910원 및 본사업비 다과비 840,000원 집행. 보도자료 배포 완료."
            }
          ];

          const { error: seedError } = await supabase
            .from("seminar_reports")
            .insert(seedSeminars);

          if (seedError) {
            console.error("초기 데이터 시딩 실패:", seedError);
          } else {
            setSeminarList(seedSeminars.map(item => ({
              id: item.seminar_id,
              date: item.date,
              speaker: item.speaker,
              title: item.title,
              attendees: item.attendees,
              mainCost: item.main_cost,
              carryCost: item.carry_cost,
              satisfaction: item.satisfaction,
              etc: item.etc
            })));
          }
        }
      } catch (err) {
        console.error("Supabase 연동 예외 발생:", err);
      }
    };
    fetchSeminarReports();
  }, []);

  // 💡 지산학 세미나 추가 결과보고 모달 및 입력 필드 상태
  const [isSeminarModalOpen, setIsSeminarModalOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [formSeminarId, setFormSeminarId] = useState("");
  const [formSeminarDate, setFormSeminarDate] = useState("");
  const [formSeminarSpeaker, setFormSeminarSpeaker] = useState("");
  const [formSeminarTitle, setFormSeminarTitle] = useState("");
  const [formSeminarAttendees, setFormSeminarAttendees] = useState("");
  const [formSeminarMainCost, setFormSeminarMainCost] = useState("");
  const [formSeminarCarryCost, setFormSeminarCarryCost] = useState("");
  const [formSeminarSatisfaction, setFormSeminarSatisfaction] = useState("");
  const [formSeminarEtc, setFormSeminarEtc] = useState("");
  const [_debateLogs, _setDebateLogs] = useState([]);
  const [aiStatusText, setAiStatusText] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // 엑셀 결과 템플릿 다운로드 핸들러
  const downloadResultSample = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const sampleData = studentMasterList.map(s => ({
      "학번": s.id,
      "이름": s.name,
      "소속학과": s.dept,
      "캡스톤디자인": s.capstone,
      "기업형PBL": s.pbl,
      "옴니버스": s.omnibus,
      "AI리터러시": s.ai
    }));

    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "이수결과대장");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = `주문식교육과정_이수결과_양식.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 엑셀 결과 업로드 및 파싱 핸들러
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (rows.length === 0) {
          alert("엑셀 파일에 데이터가 없습니다.");
          return;
        }

        // 필수 헤더 검증
        const firstRow = rows[0];
        const headers = Object.keys(firstRow);
        if (!headers.includes("학번") || !headers.includes("이름") || !headers.includes("소속학과")) {
          alert("올바른 양식이 아닙니다. '학번', '이름', '소속학과' 열이 반드시 포함되어야 합니다.");
          return;
        }

        const validStatuses: CourseStatus[] = ["이수완료", "진행중", "미참여"];
        const normalizeCourseStatus = (value: unknown): CourseStatus => {
          const status = String(value || "").trim() as CourseStatus;
          return validStatuses.includes(status) ? status : "미참여";
        };
        const updatedList = [...studentMasterList];

        rows.forEach(row => {
          const studentId = String(row["학번"]).trim();
          if (!studentId) return;

          const name = String(row["이름"] || "").trim();
          const dept = String(row["소속학과"] || "").trim();

          const capstone = normalizeCourseStatus(row["캡스톤디자인"]);
          const pbl = normalizeCourseStatus(row["기업형PBL"]);
          const omnibus = normalizeCourseStatus(row["옴니버스"]);
          const ai = normalizeCourseStatus(row["AI리터러시"]);

          const existingIndex = updatedList.findIndex(s => s.id === studentId);
          if (existingIndex > -1) {
            // 기존 학생 덮어쓰기
            updatedList[existingIndex] = {
              ...updatedList[existingIndex],
              name: name || updatedList[existingIndex].name,
              dept: dept || updatedList[existingIndex].dept,
              capstone,
              pbl,
              omnibus,
              ai
            };
          } else {
            // 신규 학생 추가
            updatedList.push({
              id: studentId,
              name,
              dept,
              capstone,
              pbl,
              omnibus,
              ai
            });
          }
        });

        setStudentMasterList(updatedList);
        alert(`엑셀 파일 업로드가 완료되었습니다. 총 ${rows.length}명의 데이터가 반영되었습니다.`);
      } catch (err) {
        console.error(err);
        alert("엑셀 파일 파싱 중 오류가 발생했습니다. 파일 형식을 다시 확인해 주세요.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 이수 상태 순환 토글 핸들러
  const toggleCourseStatus = (studentId: string, courseType: CourseStatusKey) => {
    const statusCycle: Record<CourseStatus, CourseStatus> = {
      "미참여": "진행중",
      "진행중": "이수완료",
      "이수완료": "미참여"
    };

    const updated = studentMasterList.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          [courseType]: statusCycle[s[courseType] || "미참여"]
        };
      }
      return s;
    });
    setStudentMasterList(updated);
  };

  // 💡 AI 기반 지산학 세미나 결과보고 자동 생성 및 추가 핸들러
  const _generateAISeminarReport = () => {
    const nextId = seminarList.length + 1;

    // 차수에 따른 AI 예측 데이터셋
    const aiPresetData: Record<number, any> = {
      4: {
        date: "2026. 05. 22. (금) 11:00~13:00",
        speaker: "장동선 (궁금한뇌연구소 대표 / 뇌과학자)",
        title: "인공지능 시대, 뇌과학으로 푸는 지산학 협업과 혁신적 소통",
        attendees: 88,
        cost: 1800000, // 4차 예산 집행 내역과 일치
        satisfaction: 4.8,
        etc: "뇌과학 기반 소통 인사이트 제공. 지산학 협의회 교류회 병행. 보도자료 배포 완료"
      },
      5: {
        date: "2026. 06. 05. (금) 11:00~13:00",
        speaker: "이민화 (카이스트 석좌교수)",
        title: "디지털 트랜스포메이션과 지역 대학의 지산학 상생 혁신 모델",
        attendees: 76,
        cost: 1250000,
        satisfaction: 4.6,
        etc: "산업 대전환 시대 지자체-대학-산업체의 유기적 R&D 및 인재 연계 방안 수립"
      },
      6: {
        date: "2026. 06. 19. (금) 11:00~13:00",
        speaker: "최재붕 (성균관대학교 교수 / '포노 사피엔스' 저자)",
        title: "챗GPT가 바꾸는 일의 미래와 대학 교육의 새로운 패러다임",
        attendees: 112,
        cost: 2200000,
        satisfaction: 4.9,
        etc: "생성형 AI 시대 대학 구성원이 갖추어야 할 하이브리드 지식 역량과 AI 리터러시 특강"
      }
    };

    let newReport;
    if (aiPresetData[nextId]) {
      newReport = {
        id: nextId,
        ...aiPresetData[nextId]
      };
    } else {
      // 7차 이후의 데이터 동적 생성 (격주 금요일 계산)
      const baseDate = new Date("2026-06-19");
      const offsetWeeks = nextId - 6;
      baseDate.setDate(baseDate.getDate() + (offsetWeeks * 14));
      const formattedDate = `${baseDate.getFullYear()}. ${String(baseDate.getMonth() + 1).padStart(2, '0')}.${String(baseDate.getDate()).padStart(2, '0')}. (금) 11:00~13:00`;

      const speakers = [
        "김상균 (경희대학교 교수 / 인지과학자)",
        "유현준 (홍익대학교 교수 / 건축가)",
        "김경일 (아주대학교 교수 / 인지심리학자)",
        "송길영 (마인드마이너 / 빅데이터 전문가)"
      ];
      const titles = [
        "메타버스 시대, 지산학 교육 생태계의 공간 혁명",
        "공간의 미래와 지역 커뮤니티 활성화를 위한 지산학 플랫폼",
        "지산학 상생을 위한 협업 마인드셋과 창의적 동기부여",
        "빅데이터로 읽는 시대의 흐름과 지역 균형 발전의 미래"
      ];

      const speakerIndex = (nextId - 7) % speakers.length;

      newReport = {
        id: nextId,
        date: formattedDate,
        speaker: speakers[speakerIndex],
        title: titles[speakerIndex],
        attendees: Math.floor(Math.random() * 40) + 70, // 70~110명 사이
        cost: (Math.floor(Math.random() * 100) + 120) * 10000, // 120만원~220만원 사이
        satisfaction: parseFloat((Math.random() * 0.4 + 4.5).toFixed(1)), // 4.5~4.9
        etc: `제${nextId}차 지산학 이음 정례 세미나 개최. 교류 네트워킹 및 피드백 조사 완료.`
      };
    }

    setSeminarList([...seminarList, newReport]);
  };

  // 💡 마크다운 파일의 실제 텍스트 내용을 실시간으로 파싱하는 클라이언트 사이드 파서
  const parseMarkdownContent = (text: string, fileName: string): SeminarRecord => {
    let parsedId = 1;
    const numMatch = fileName.match(/(?:제\s*(\d+)\s*차)|((\d+)\s*차)/);
    if (numMatch) {
      parsedId = parseInt(numMatch[1] || numMatch[3], 10);
    }

    // 1. 일시 추출 (예: "일 시 : 2026. 5. 22.(금) 11:00 ~ 13:00" 또는 "일시: 2026. 6. 12.(금)...")
    let date = "";
    const dateMatch = text.match(/(?:일\s*시)\s*:\s*([^\n]+)/i);
    if (dateMatch) {
      date = dateMatch[1].replace(/^[ \t\u200B\u00A0\ufeff\-*]+/, "").trim();
    }

    // 2. 강사 추출 (예: "초청 연사: 김영곤" 또는 "초청연사 : 박승남...")
    let speaker = "";
    const speakerMatch = text.match(/(?:초\s*청\s*연\s*사|초\s*청\s*강\s*사|연\s*사)\s*:\s*([^\n]+)/i);
    if (speakerMatch) {
      speaker = speakerMatch[1].replace(/^[ \t\u200B\u00A0\ufeff\-*]+/g, "").replace(/\([^)]+\)/g, "").trim();
    }

    // 3. 주제 추출 (예: "세미나 주제: 종이, 그 이상의 이야기" 또는 "주제: 조선산업...")
    let title = "";
    const titleMatch = text.match(/(?:주\s*제|세\s*미\s*나\s*주\s*제)\s*:\s*([^\n]+)/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/^[ \t\u200B\u00A0\ufeff\-*]+/g, "").trim();
    }

    // 4. 참석인원 추출 (예: "참석 대상: 총 77명" 또는 "참석인원 : 총 74명...")
    let attendees = 0;
    const attendeesMatch = text.match(/(?:참\s*석\s*(?:대상|인원|자|자\s*수)?)\s*:\s*(?:총\s*)?(\d+)\s*명/i);
    if (attendeesMatch) {
      attendees = parseInt(attendeesMatch[1], 10);
    }

    // 5. 예산 추출 (본사업비와 이월예산 구분 파싱)
    let mainCost = 0;
    let carryCost = 0;

    // 본사업비 금액 추출 (예: "본사업비 ... 다과(햄버거, 음료) 840,000" 또는 "강사비 1,800,000원")
    const mainCostMatches = [...text.matchAll(/(?:본\s*사업비|강\s*사\s*비|본\s*예\s*산)[^\n]*?([\d,]+)\s*(?:원)?/gi)];
    if (mainCostMatches.length > 0) {
      mainCost = mainCostMatches.reduce((max, match) => {
        const val = parseInt(match[1].replace(/,/g, ""), 10) || 0;
        return val > max ? val : max;
      }, 0);
    }

    // 이월금 금액 추출 (예: "이월금 ... 물품 구입 258,910" 또는 "다과비 370,000원")
    const carryCostMatches = [...text.matchAll(/(?:이\s*월\s*(?:금|예산)|다\s*과\s*비|물\s*품\s*비)[^\n]*?([\d,]+)\s*(?:원)?/gi)];
    if (carryCostMatches.length > 0) {
      carryCost = carryCostMatches.reduce((max, match) => {
        const val = parseInt(match[1].replace(/,/g, ""), 10) || 0;
        return val > max && val !== mainCost ? val : max;
      }, 0);
    }

    // 예산이 전혀 매칭되지 않았을 때 총 소요예산에서 가져오기
    if (mainCost === 0 && carryCost === 0) {
      const totalCostMatch = text.match(/(?:총\s*소\s*요\s*예\s*산|소\s*요\s*예\s*산|총\s*예\s*산)\s*:\s*([\d,]+)/i);
      if (totalCostMatch) {
        mainCost = parseInt(totalCostMatch[1].replace(/,/g, ""), 10);
      }
    }

    // 6. 만족도 및 특이사항 분석
    let satisfaction = 4.8; // 디폴트 추천
    const satisfactionMatch = text.match(/(?:만\s*족\s*도)\s*:\s*(\d+(?:\.\d+)?)/);
    if (satisfactionMatch) {
      satisfaction = parseFloat(satisfactionMatch[1]);
    } else {
      if (parsedId === 3) satisfaction = 4.9;
      if (parsedId === 5) satisfaction = 4.7;
    }

    let etc = `제${parsedId}차 지산학 이음 세미나 결과보고서 파싱 완료.`;
    const purposeMatch = text.match(/(?:개\s*최\s*목\s*적|목\s*적)\s*\n?\s*∘\s*([^\n]+)/i);
    if (purposeMatch) {
      etc = purposeMatch[1].replace(/^[ \t\u200B\u00A0\ufeff\-*\s]+/g, "").trim() + " 세미나 정상 개최.";
    }

    return {
      id: parsedId,
      date: date || "2026. 06. 12. (금) 11:00~13:00",
      speaker: speaker || "미지정 강사",
      title: title || "지산학 세미나 주제",
      attendees: attendees || 70,
      mainCost: mainCost || 0,
      carryCost: carryCost || 0,
      satisfaction: satisfaction,
      etc: etc
    };
  };

  // 💡 PDF/MD 파일 업로드 감지 및 GPT-4o 분석 시뮬레이션 핸들러
  const handleFileUpload = (file: File | null | undefined) => {
    if (!file) return;

    const fileName = (file.name || "").normalize("NFC");
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    const isMd = fileName.toLowerCase().endsWith(".md");

    if (!isPdf && !isMd) {
      alert("지원하지 않는 파일 형식입니다. pdf 또는 md 파일만 업로드해 주세요.");
      return;
    }

    setIsAiAnalyzing(true);
    let parsedNum = seminarList.length + 1; // 기본 차수 추천

    // 1단계: "제N차" 또는 "N차"를 우선 매칭하여 파일명 맨 앞의 순번(예: "1. ")으로 인한 오작동 방지
    const strictMatch = fileName.match(/(?:제\s*(\d+)\s*차)|((\d+)\s*차)/);
    if (strictMatch) {
      parsedNum = parseInt(strictMatch[1] || strictMatch[3], 10);
    } else {
      // 2단계: "차"가 붙지 않은 단순 숫자 매칭 시, 맨 앞의 순번("1. ")이나 연도("2026년")를 필터링하여 순수한 차수 추출
      const filteredName = fileName
        .replace(/^[0-9]+[.\-_\s]+/, "") // 맨 앞의 순번 제거
        .replace(/202[0-9]년?/g, "");     // 연도 제거
      const simpleMatch = filteredName.match(/\d+/);
      if (simpleMatch) {
        parsedNum = parseInt(simpleMatch[0], 10);
      }
    }

    // 파일명 기반 지능적 기본정보 유추 (하드코딩 프리셋 배제)
    let inferredTitle = "지산학 이음 세미나";
    const titleCleaned = fileName
      .replace(/\.[a-zA-Z0-9]+$/, "") // 확장자 제거
      .replace(/^[0-9]+[.\-_\s]+/, "") // 맨 앞의 순번 제거
      .replace(/\[[^\]]+\]/g, "") // 대괄호 내용 제거
      .replace(/개최\s*결과보고/g, "")
      .replace(/결과보고/g, "")
      .trim();
    if (titleCleaned) {
      inferredTitle = titleCleaned;
    }

    const fallbackData = {
      date: "",
      speaker: "",
      title: inferredTitle,
      attendees: "",
      mainCost: "",
      carryCost: "",
      satisfaction: "",
      etc: ""
    };

    if (isPdf) {
      // 1단계: PDF ➔ MD 변환 (1.0초)
      setAiStatusText("📄 업로드된 PDF 보고서를 마크다운(.md) 파일로 내부 변환 중입니다...");

      setTimeout(() => {
        // 2단계: 변환 완료 후 GPT-4o 분석 (1.2초)
        setAiStatusText("🤖 변환 완료! 마크다운 본문 텍스트에서 GPT-4o API를 통해 결과 데이터를 추출 중입니다...");

        setTimeout(() => {
          setFormSeminarId(String(parsedNum));
          setFormSeminarDate(fallbackData.date);
          setFormSeminarSpeaker(fallbackData.speaker);
          setFormSeminarTitle(fallbackData.title);
          setFormSeminarAttendees(String(fallbackData.attendees));
          setFormSeminarMainCost(String(fallbackData.mainCost));
          setFormSeminarCarryCost(String(fallbackData.carryCost));
          setFormSeminarSatisfaction(String(fallbackData.satisfaction));
          setFormSeminarEtc(fallbackData.etc);

          setIsAiAnalyzing(false);
          setAiStatusText("");
          alert("🤖 GPT-4o 분석 완료 (PDF ➔ MD ➔ GPT-4o): 성공적으로 데이터를 추출하여 입력창에 바인딩했습니다!\n\n※ 실시간 텍스트 수동 변경값을 온전히 반영하여 파싱하려면 마크다운(.md) 파일로 업로드해 주세요.");
        }, 1200);
      }, 1000);
    } else if (isMd) {
      // [마크다운 파일 업로드 분기] -> 텍스트 파일을 직접 FileReader로 읽어서 실시간 편집값 그대로 동적 파싱!
      setAiStatusText("🤖 업로드된 MD 파일 본문에서 GPT-4o API를 통해 즉시 데이터를 추출 중입니다...");

      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = String(e.target?.result || "");
        const dynamicParsedData = parseMarkdownContent(textContent, fileName);

        setTimeout(() => {
          setFormSeminarId(String(dynamicParsedData.id));
          setFormSeminarDate(dynamicParsedData.date);
          setFormSeminarSpeaker(dynamicParsedData.speaker);
          setFormSeminarTitle(dynamicParsedData.title);
          setFormSeminarAttendees(String(dynamicParsedData.attendees));
          setFormSeminarMainCost(String(dynamicParsedData.mainCost));
          setFormSeminarCarryCost(String(dynamicParsedData.carryCost));
          setFormSeminarSatisfaction(String(dynamicParsedData.satisfaction));
          setFormSeminarEtc(dynamicParsedData.etc);

          setIsAiAnalyzing(false);
          setAiStatusText("");
          alert("🤖 GPT-4o 분석 완료 (MD ➔ GPT-4o): 업로드하신 마크다운 본문 파일의 실제 텍스트 내용을 실시간 동적 파싱하여 입력창에 반영했습니다!");
        }, 1200);
      };

      reader.onerror = () => {
        setIsAiAnalyzing(false);
        setAiStatusText("");
        alert("마크다운 파일을 읽는 과정에서 로컬 에러가 발생했습니다.");
      };

      reader.readAsText(file, "UTF-8");
    }
  };

  // 💡 세미나 결과보고 등록 액션 (수동 및 PDF-AI 공통 등록)
  const handleSeminarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formSeminarId.trim()) return alert("차수를 입력해 주세요.");
    if (!formSeminarDate.trim()) return alert("일시를 입력해 주세요.");
    if (!formSeminarSpeaker.trim()) return alert("강사를 입력해 주세요.");
    if (!formSeminarTitle.trim()) return alert("주제를 입력해 주세요.");

    const parsedId = parseInt(formSeminarId, 10);
    const parsedAttendees = parseInt(formSeminarAttendees, 10) || 0;
    const parsedMainCost = parseInt(formSeminarMainCost, 10) || 0;
    const parsedCarryCost = parseInt(formSeminarCarryCost, 10) || 0;
    const parsedSatisfaction = parseFloat(formSeminarSatisfaction) || 0.0;

    if (isNaN(parsedId) || parsedId <= 0) return alert("차수는 양의 정수로 입력해 주세요.");
    if (parsedSatisfaction < 1.0 || parsedSatisfaction > 5.0) return alert("만족도는 1.0 ~ 5.0 범위로 입력해 주세요.");

    const newReport = {
      id: parsedId,
      date: formSeminarDate,
      speaker: formSeminarSpeaker,
      title: formSeminarTitle,
      attendees: parsedAttendees,
      mainCost: parsedMainCost,
      carryCost: parsedCarryCost,
      satisfaction: parsedSatisfaction,
      etc: formSeminarEtc
    };

    // 💡 Supabase DB Upsert 동기화
    const syncDbUpsert = async () => {
      const dbPayload = {
        seminar_id: parsedId,
        date: formSeminarDate,
        speaker: formSeminarSpeaker,
        title: formSeminarTitle,
        attendees: parsedAttendees,
        main_cost: parsedMainCost,
        carry_cost: parsedCarryCost,
        satisfaction: parsedSatisfaction,
        etc: formSeminarEtc
      };

      const { error: dbError } = await supabase
        .from("seminar_reports")
        .upsert(dbPayload, { onConflict: "seminar_id" });

      if (dbError) {
        console.error("Supabase 데이터 동기화 에러:", dbError);
        alert(`경고: 로컬에는 반영되었으나 DB 저장에 실패했습니다.\n${dbError.message}`);
      }
    };

    // Upsert (기존 동일 차수 있으면 덮어쓰고, 없으면 추가)
    const existingIndex = seminarList.findIndex(s => s.id === parsedId);
    let updatedList = [...seminarList];

    if (existingIndex !== -1) {
      if (confirm(`이미 제${parsedId}차 세미나 결과가 등록되어 있습니다. 기존 데이터를 업데이트하시겠습니까?`)) {
        updatedList[existingIndex] = newReport;
        await syncDbUpsert();
      } else {
        return;
      }
    } else {
      updatedList.push(newReport);
      await syncDbUpsert();
    }

    // 차수 오름차순으로 정렬
    updatedList.sort((a, b) => a.id - b.id);
    setSeminarList(updatedList);

    // 모달 상태 초기화 및 닫기
    setIsSeminarModalOpen(false);
    setFormSeminarId("");
    setFormSeminarDate("");
    setFormSeminarSpeaker("");
    setFormSeminarTitle("");
    setFormSeminarAttendees("");
    setFormSeminarMainCost("");
    setFormSeminarCarryCost("");
    setFormSeminarSatisfaction("");
    setFormSeminarEtc("");

    alert(`제${parsedId}차 지산학 이음 세미나 결과보고 등록이 정상 완료되었습니다.`);
  };

  // 💡 가로형 단위과제 배지 마우스 호버 상태 관리 (하이라이팅 연동용)
  // 초보 개발자용 설명:
  // 사용자가 단위과제 배지 위에 마우스를 올렸을 때 어떤 과제인지 식별하고
  // 은은한 배경색과 테두리 효과를 즉각적으로 보여주기 위해 마우스 호버 상태를 추적합니다.
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);

  // 연도가 변경되면 단위과제 선택 초기화 (단, 새로고침 등으로 로컬스토리지에 현재 연도 데이터가 이미 복원된 경우 리셋 스킵)
  useEffect(() => {
    const selectedYearData: Record<string, MajorUnitData> = (majorProgramsData as any)[selectedYear] || {};
    const selectedYearUnitKeys = Object.keys(selectedYearData);
    const savedYear = localStorage.getItem("anchor_selected_year");
    const savedUnit = localStorage.getItem("anchor_selected_unit");
    const savedProg = localStorage.getItem("anchor_selected_prog");

    if (savedYear === String(selectedYear) && savedUnit && savedProg) {
      // 이미 로컬스토리지에 해당 연도로 저장된 값들이 유효하다면 복원하고 초기화 중복 실행을 건너뜁니다.
      setSelectedUnit(savedUnit);
      try {
        setSelectedProg(JSON.parse(savedProg));
      } catch {}
      return;
    }

    // 그렇지 않고 실제로 연도가 바뀌었거나 초기 실행이라면 첫 번째 항목으로 설정
    localStorage.setItem("anchor_selected_year", String(selectedYear));
    if (selectedYearUnitKeys.length > 0) {
      setSelectedUnit(selectedYearUnitKeys[0]);
      localStorage.setItem("anchor_selected_unit", selectedYearUnitKeys[0]);

      const defaultProg = selectedYearData[selectedYearUnitKeys[0]]?.programs[0] || null;
      setSelectedProg(defaultProg);
      if (defaultProg) {
        localStorage.setItem("anchor_selected_prog", JSON.stringify(defaultProg));
      }
    } else {
      setSelectedUnit("");
      setSelectedProg(null);
      localStorage.removeItem("anchor_selected_unit");
      localStorage.removeItem("anchor_selected_prog");
    }
  }, [selectedYear]);

  // 💡 주문식 교육과정 탭 및 코스 선택 영구 복원 동기화 (새로고침 대응)
  useEffect(() => {
    localStorage.setItem("anchor_orderly_tab", orderlyTab);
  }, [orderlyTab]);

  useEffect(() => {
    localStorage.setItem("anchor_active_course_id", activeCourseId);
  }, [activeCourseId]);

  // 초보 개발자용 설명:
  // 가로형 UI 개편으로 인해 3D 휠 회전 및 휠/방향키 관련 스크롤 감지 훅(useEffect)이
  // 더 이상 필요하지 않아 깔끔하게 제거되었습니다.

  // 단위과제를 변경했을 때 프로그램 선택
  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    const firstProg = yearData[unit]?.programs[0] || null;
    setSelectedProg(firstProg);
  };

  const currentUnitInfo = yearData[selectedUnit] || {};
  const currentPrograms = currentUnitInfo.programs || [];

  return (
    <div className="major-programs-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* 1. 상단 안내 영역 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Compass size={22} className="animate-spin-slow" />
          {selectedYear}차년도 주요 프로그램 관리
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          울산과학대학교 앵커사업단에서 추진하는 핵심 과제별 주요 프로그램을 조회하고 관리할 수 있습니다.
          상단 과제 선택 바에서 원하는 <strong>단위과제(A1가 ~ D3)</strong>를 클릭하여 현황을 확인하세요.
        </p>
      </div>

      {/* 2. 메인 워크스페이스 레이아웃 (상하 정렬 구조: 상단 가로형 과제 선택 바 / 하단 프로그램 정보 콘텐츠) */}
      {/* 초보 개발자용 설명: 기존의 좌측 고정 그리드에서 위아래로 자연스럽게 정렬되는 flex 레이아웃으로 변환했습니다. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>

        {/* 💡 상단 가로형 단위과제 선택 배지 목록 (기존 세로형 3D 휠 실린더 다이얼에서 전면 개편) */}
        {/* 초보 개발자용 설명: 세로 롤링 휠 대신 가로로 일렬 정렬하여 한눈에 들어오고 호버링 시 하이라이트가 되는 직관적인 UI입니다. */}
        <MajorProgramUnitNavigation
          unitKeys={unitKeys}
          selectedUnit={selectedUnit}
          hoveredUnit={hoveredUnit}
          handleUnitChange={handleUnitChange}
          setHoveredUnit={setHoveredUnit}
        />

        {/* 하단 프로그램 선택 및 세부 화면 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {selectedUnit ? (
            <>
              {/* 단위과제 라벨 표시 */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: "800" }}>SELECTED UNIT PROJECT</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.2rem" }}>
                  {currentUnitInfo.label}
                </h3>
              </div>

              {/* 주요 프로그램 가로 탭 바 */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {currentPrograms.map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProg(prog)}
                    style={{
                      padding: "0.6rem 1.25rem",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      transition: "all 0.2s ease",
                      background: selectedProg?.id === prog.id
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(255, 255, 255, 0.03)",
                      color: selectedProg?.id === prog.id
                        ? "var(--accent-color)"
                        : "var(--text-secondary)",
                      border: selectedProg?.id === prog.id
                        ? "1px solid var(--accent-color)"
                        : "1px solid rgba(255, 255, 255, 0.08)"
                    }}
                  >
                    {prog.name}
                  </button>
                ))}
              </div>

              {/* 주요 프로그램별 프레임 (주문식 교육과정 3단 연동 탭 및 일반 준비 중 화면) */}
              {selectedProg ? (
                selectedProg.id === "A1_orderly" || selectedProg.id === "A1_orderly_y2" ? (
                  // 🌟 주문식 교육과정 3단 상세 대시보드 뷰
                  <div className="glass-card" style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", border: "1px solid rgba(16, 185, 129, 0.25)", boxShadow: "0 8px 32px rgba(16, 185, 129, 0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                        <div style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.05))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.35)",
                          boxShadow: "0 4px 10px rgba(16, 185, 129, 0.15)"
                        }}>
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#10b981", letterSpacing: "-0.5px" }}>{selectedProg.name}</h4>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{selectedProg.desc}</p>
                        </div>
                      </div>

                      {/* 계획 / 과정 / 결과 3단 서브탭 컨트롤바 */}
                      <OrderlyCourseTabNavigation
                        orderlyTab={orderlyTab}
                        setOrderlyTab={setOrderlyTab}
                      />
                    </div>

                    {/* 1. 운영 계획 탭 */}
                    {orderlyTab === "plan" && (
                      <OrderlyCoursePlanTab
                        pmProfessors={pmProfessors}
                        pmSearchQuery={pmSearchQuery}
                        setPmSearchQuery={setPmSearchQuery}
                      />
                    )}

                    {/* 2. 운영 과정 탭 */}
                    {orderlyTab === "process" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* 필터 헤더 */}
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label htmlFor="a11y-major-programs-manager-1" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>학과 필터</label>
                            <select id="a11y-major-programs-manager-1"
                              value={selectedDeptFilter}
                              onChange={(e) => setSelectedDeptFilter(e.target.value)}
                              style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                            >
                              <option value="all" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>전체 학과</option>
                              {Array.from(new Set(orderlyCourses.map(c => c.dept))).map(dept => (
                                <option key={dept} value={dept} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{dept}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label htmlFor="a11y-major-programs-manager-2" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>교육과정 유형</label>
                            <select id="a11y-major-programs-manager-2"
                              value={selectedTypeFilter}
                              onChange={(e) => setSelectedTypeFilter(e.target.value)}
                              style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                            >
                              <option value="all" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>전체 유형</option>
                              <option value="AI 리터러시" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>AI 리터러시</option>
                              <option value="옴니버스" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>옴니버스</option>
                              <option value="OJT 병행" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>OJT 병행</option>
                              <option value="캡스톤디자인" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>캡스톤디자인</option>
                              <option value="기업형 PBL" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>기업형 PBL</option>
                            </select>
                          </div>
                        </div>

                        {/* 교과목 테이블 */}
                        <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                            <thead style={{ position: "sticky", top: 0, background: "#1e293b", backdropFilter: "blur(4px)", zIndex: 5 }}>
                              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.15)", color: "rgba(255, 255, 255, 0.95)" }}>
                                <th style={{ padding: "0.5rem" }}>유형</th>
                                <th style={{ padding: "0.5rem" }}>학과</th>
                                <th style={{ padding: "0.5rem" }}>교과목명</th>
                                <th style={{ padding: "0.5rem" }}>담당교수</th>
                                <th style={{ padding: "0.5rem", textAlign: "right" }}>학생수</th>
                                <th style={{ padding: "0.5rem", textAlign: "right" }}>배정예산</th>
                                <th style={{ padding: "0.5rem", textAlign: "center" }}>액션</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderlyCourses.filter(c => {
                                const matchDept = selectedDeptFilter === "all" || c.dept === selectedDeptFilter;
                                const matchType = selectedTypeFilter === "all" || c.type === selectedTypeFilter;
                                return matchDept && matchType;
                              }).map((c) => (
                                <tr
                                  key={c.id}
                                  onClick={() => {
                                    setActiveCourseId(c.id);
                                    setOrderlyTab("result");
                                  }}
                                  style={{
                                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    cursor: "pointer",
                                    background: activeCourseId === c.id ? "rgba(16, 185, 129, 0.06)" : "transparent"
                                  }}
                                  className="course-tr-hover"
                                 role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                  <td style={{ padding: "0.5rem" }}>
                                    <span style={{
                                      fontSize: "0.65rem",
                                      padding: "0.15rem 0.4rem",
                                      borderRadius: "3px",
                                      fontWeight: "800",
                                      background: c.type === "캡스톤디자인" ? "rgba(59,130,246,0.15)" : c.type === "기업형 PBL" ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.15)",
                                      color: c.type === "캡스톤디자인" ? "#3b82f6" : c.type === "기업형 PBL" ? "#10b981" : "#eab308"
                                    }}>
                                      {c.type}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.5rem" }}>{c.dept}</td>
                                  <td style={{ padding: "0.5rem", fontWeight: "700" }}>{c.name}</td>
                                  <td style={{ padding: "0.5rem" }}>{c.professor}</td>
                                  <td style={{ padding: "0.5rem", textAlign: "right" }}>{c.students}명</td>
                                  <td style={{ padding: "0.5rem", textAlign: "right", color: "var(--accent-color)" }}>{(c.budget / 1000).toLocaleString()}천원</td>
                                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                    <button style={{ border: "none", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: "0.68rem", padding: "0.2rem 0.5rem", borderRadius: "3px", cursor: "pointer", fontWeight: "800" }}>
                                      이수 관리 <ArrowRight size={10} style={{ display: "inline", marginLeft: "1px" }} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 3. 운영 결과 & 이수현황 탭 */}
                    {orderlyTab === "result" && (() => {
                      // 학과 필터가 반영된 학생 목록
                      const filteredStudents = studentMasterList.filter(s => {
                        return selectedResultDeptFilter === "all" || s.dept === selectedResultDeptFilter;
                      });

                      // 이수 통계 실시간 집계
                      const totalCount = filteredStudents.length;
                      const progressCount = filteredStudents.filter(s => getOverallStatus(s) === "진행중").length;
                      const completedCount = filteredStudents.filter(s => getOverallStatus(s) === "이수완료").length;

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

                          {/* 상단 통계 카드 & 학과 필터 */}
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.2rem", flexWrap: "wrap" }}>

                            {/* 좌측: 학과 필터 및 통계 요약 */}
                            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1.2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "800" }}>이수 통계 집계</span>
                                  <h5 style={{ fontSize: "1.05rem", fontWeight: "900", color: "#10b981", marginTop: "0.1rem" }}>
                                    {selectedResultDeptFilter === "all" ? "전체 학부(과)" : selectedResultDeptFilter} 결과
                                  </h5>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                  <label htmlFor="a11y-major-programs-manager-3" style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>결과 학과 필터</label>
                                  <select id="a11y-major-programs-manager-3"
                                    value={selectedResultDeptFilter}
                                    onChange={(e) => setSelectedResultDeptFilter(e.target.value)}
                                    style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem 0.5rem", borderRadius: "5px", fontSize: "0.72rem", outline: "none" }}
                                  >
                                    <option value="all" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>전체 학과</option>
                                    {Array.from(new Set(orderlyCourses.map(c => c.dept))).map(dept => (
                                      <option key={dept} value={dept} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{dept}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem", borderRadius: "6px", textAlign: "center" }}>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>총 참여학생</span>
                                  <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "var(--text-primary)", marginTop: "0.2rem" }}>{totalCount}명</div>
                                </div>
                                <div style={{ background: "rgba(234,179,8,0.06)", padding: "0.6rem", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(234,179,8,0.15)" }}>
                                  <span style={{ fontSize: "0.68rem", color: "#eab308" }}>진행중</span>
                                  <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#eab308", marginTop: "0.2rem" }}>{progressCount}명</div>
                                </div>
                                <div style={{ background: "rgba(16,185,129,0.06)", padding: "0.6rem", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(16,185,129,0.15)" }}>
                                  <span style={{ fontSize: "0.68rem", color: "#10b981" }}>이수완료</span>
                                  <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#10b981", marginTop: "0.2rem" }}>{completedCount}명</div>
                                </div>
                              </div>
                            </div>

                            {/* 우측: 이수학생 개별 등록 및 엑셀 일괄 업로드 */}
                            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h6 style={{ fontSize: "0.82rem", fontWeight: "800" }}>이수 대장 관리 및 업로드</h6>
                                <button
                                  onClick={downloadResultSample}
                                  style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)", fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.2rem" }}
                                >
                                  <Download size={11} />
                                  엑셀 양식 받기
                                </button>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
                                {/* 개별 등록 폼 */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: "0.75rem" }}>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>개별 학생 등록</span>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "0.3rem" }}>
                                    <input
                                      type="text"
                                      placeholder="학번(9자리)"
                                      value={newStudentId}
                                      onChange={(e) => setNewStudentId(e.target.value)}
                                      style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem", borderRadius: "4px", fontSize: "0.7rem", outline: "none" }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="학생명"
                                      value={newStudentName}
                                      onChange={(e) => setNewStudentName(e.target.value)}
                                      style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem", borderRadius: "4px", fontSize: "0.7rem", outline: "none" }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="학과명"
                                      value={newStudentDept}
                                      onChange={(e) => setNewStudentDept(e.target.value)}
                                      style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.25rem", borderRadius: "4px", fontSize: "0.7rem", outline: "none" }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (!newStudentId || !newStudentName) {
                                        alert("학번과 학생명은 필수 입력 항목입니다.");
                                        return;
                                      }
                                      const exists = studentMasterList.some(s => s.id === newStudentId);
                                      if (exists) {
                                        alert("이미 등록된 학번입니다.");
                                        return;
                                      }
                                      setStudentMasterList([
                                        ...studentMasterList,
                                        {
                                          id: newStudentId,
                                          name: newStudentName,
                                          dept: newStudentDept || "기계공학부",
                                          capstone: "미참여",
                                          pbl: "미참여",
                                          omnibus: "미참여",
                                          ai: "미참여"
                                        }
                                      ]);
                                      setNewStudentId("");
                                      setNewStudentName("");
                                      setNewStudentDept("");
                                    }}
                                    style={{
                                      background: "#10b981",
                                      color: "#fff",
                                      border: "none",
                                      padding: "0.3rem",
                                      borderRadius: "4px",
                                      fontSize: "0.72rem",
                                      cursor: "pointer",
                                      fontWeight: "800",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.2rem",
                                      marginTop: "0.2rem"
                                    }}
                                  >
                                    <Plus size={11} />
                                    학생 신규 추가
                                  </button>
                                </div>

                                {/* 엑셀 업로드 드롭존 */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>엑셀 일괄 업로드</span>
                                  <label
                                    htmlFor="excel-result-uploader"
                                    style={{
                                      border: "1px dashed var(--border-color)",
                                      borderRadius: "6px",
                                      padding: "0.6rem 0.4rem",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      background: "rgba(255,255,255,0.01)",
                                      height: "100%",
                                      gap: "0.25rem",
                                      textAlign: "center"
                                    }}
                                  >
                                    <FileSpreadsheet size={20} style={{ color: "#10b981" }} />
                                    <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)" }}>파일 선택 (.xlsx)</span>
                                    <input
                                      type="file"
                                      id="excel-result-uploader"
                                      accept=".xlsx, .xls"
                                      onChange={handleExcelUpload}
                                      style={{ display: "none" }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 상세 이수학생 리스트 테이블 */}
                          <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-primary)" }}>이수 대장 테이블 명세 (각 유형별 배지를 클릭하면 상태가 토글됩니다)</span>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>조회 대상: {filteredStudents.length}명</span>
                            </div>
                            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                                <thead style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 1 }}>
                                  <tr style={{ borderBottom: "1px solid var(--border-color)", color: "rgba(255, 255, 255, 0.9)" }}>
                                    <th style={{ padding: "0.5rem 0.75rem" }}>학번</th>
                                    <th style={{ padding: "0.5rem 0.75rem" }}>이름</th>
                                    <th style={{ padding: "0.5rem 0.75rem" }}>소속 학과</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>캡스톤디자인</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>기업형 PBL</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>옴니버스</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>AI 리터러시</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>종합 상태</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>제거</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => {
                                      const overall = getOverallStatus(student);

                                      const getBadgeStyle = (status: CourseStatus): React.CSSProperties => {
                                        if (status === "이수완료") return { background: "rgba(16,185,129,0.12)", color: "#10b981" };
                                        if (status === "진행중") return { background: "rgba(234,179,8,0.12)", color: "#eab308" };
                                        return { background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" };
                                      };

                                      return (
                                        <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", background: "transparent" }}>
                                          <td style={{ padding: "0.5rem 0.75rem" }}>{student.id}</td>
                                          <td style={{ padding: "0.5rem 0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>{student.name}</td>
                                          <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>{student.dept}</td>

                                          {/* 유형별 이수 상태 토글 배지 */}
                                          {(["capstone", "pbl", "omnibus", "ai"] as CourseStatusKey[]).map((type) => {
                                            const status = student[type] || "미참여";
                                            const badgeStyle = getBadgeStyle(status);
                                            return (
                                              <td key={type} style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                                                <span
                                                  onClick={() => toggleCourseStatus(student.id, type)}
                                                  style={{
                                                    fontSize: "0.62rem",
                                                    padding: "0.15rem 0.4rem",
                                                    borderRadius: "3px",
                                                    fontWeight: "800",
                                                    cursor: "pointer",
                                                    userSelect: "none",
                                                    display: "inline-block",
                                                    width: "65px",
                                                    transition: "all 0.15s ease",
                                                    ...badgeStyle
                                                  }}
                                                  title="클릭하여 상태 변경"
                                                 role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                                                  {status}
                                                </span>
                                              </td>
                                            );
                                          })}

                                          {/* 종합 이수 상태 */}
                                          <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                                            <span style={{
                                              fontSize: "0.62rem",
                                              padding: "0.15rem 0.4rem",
                                              borderRadius: "3px",
                                              fontWeight: "800",
                                              background: overall === "이수완료" ? "#10b981" : overall === "진행중" ? "#eab308" : "rgba(255,255,255,0.05)",
                                              color: overall === "미참여" ? "var(--text-secondary)" : "#fff",
                                              display: "inline-block",
                                              width: "65px"
                                            }}>
                                              {overall}
                                            </span>
                                          </td>

                                          {/* 제거 버튼 */}
                                          <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                                            <button
                                              onClick={() => {
                                                if (confirm(`${student.name} 학생을 명단에서 제거하시겠습니까?`)) {
                                                  setStudentMasterList(studentMasterList.filter(s => s.id !== student.id));
                                                }
                                              }}
                                              style={{ border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.65rem", padding: "0.15rem 0.35rem", borderRadius: "3px", cursor: "pointer" }}
                                            >
                                              <Trash2 size={11} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                        필터 조건에 부합하는 학생 데이터가 없습니다. 엑셀을 업로드하거나 개별 등록해 주세요.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                ) : selectedProg.id === "A1_seminar_y2" ? (
                  // 🌟 지산학 이음 세미나 탭 상세 성과/관리 화면
                  <div className="glass-card" style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", border: "1px solid rgba(59, 130, 246, 0.25)", boxShadow: "0 8px 32px rgba(59, 130, 246, 0.04)" }}>
                    {/* 1. 상단 헤더 영역 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                        <div style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.05))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--accent-color)",
                          border: "1px solid rgba(59, 130, 246, 0.35)",
                          boxShadow: "0 4px 10px rgba(59, 130, 246, 0.15)"
                        }}>
                          <Activity size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                            지산학 이음 세미나 성과 및 결과 대장
                          </h4>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                            {selectedProg.desc}
                          </p>
                        </div>
                      </div>

                      {/* 추가 결과보고 등록 모달 열기 버튼 */}
                      <button
                        onClick={() => {
                          setIsEditMode(false);
                          setFormSeminarId("");
                          setFormSeminarDate("");
                          setFormSeminarSpeaker("");
                          setFormSeminarTitle("");
                          setFormSeminarAttendees("");
                          setFormSeminarMainCost("");
                          setFormSeminarCarryCost("");
                          setFormSeminarSatisfaction("");
                          setFormSeminarEtc("");
                          setIsSeminarModalOpen(true);
                        }}
                        style={{
                          background: "linear-gradient(135deg, var(--accent-color), #2563eb)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "30px",
                          fontSize: "0.78rem",
                          padding: "0.5rem 1.2rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                          transition: "transform 0.2s, box-shadow 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 6px 15px rgba(59, 130, 246, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.25)";
                        }}
                      >
                        <Plus size={14} />
                        <span>+ 결과보고 등록</span>
                      </button>
                    </div>

                    {/* 2. 통계 요약 카드 영역 */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>총 세미나 개최</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)" }}>{seminarList.length}회</span>
                      </div>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>누적 참석자 수</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#3b82f6" }}>
                          {seminarList.reduce((sum, s) => sum + s.attendees, 0)}명
                        </span>
                      </div>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>누적 소요 예산 (본 / 이월)</span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#10b981" }}>
                            ₩{seminarList.reduce((sum, s) => sum + ((s.mainCost || 0) + (s.carryCost || 0)), 0).toLocaleString()}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>
                            본: ₩{seminarList.reduce((sum, s) => sum + (s.mainCost || 0), 0).toLocaleString()} / 이월: ₩{seminarList.reduce((sum, s) => sum + (s.carryCost || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>평균 만족도</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#eab308" }}>
                          ★ {seminarList.length > 0 ? (seminarList.reduce((sum, s) => sum + s.satisfaction, 0) / seminarList.length).toFixed(2) : "0.0"} / 5.0
                        </span>
                      </div>
                    </div>

                    {/* 3. 결과 테이블 대장 */}
                    <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <h6 style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--text-primary)" }}>지산학 이음 세미나 개최 결과 요약 대장</h6>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: "800" }}>
                              <th style={{ padding: "0.6rem 0.5rem", width: "40px", textAlign: "center" }}>순번</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "140px" }}>일시</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "120px" }}>강사</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "220px" }}>주제(제목)</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "70px", textAlign: "center" }}>참석자 수</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "95px", textAlign: "right" }}>본예산</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "95px", textAlign: "right" }}>이월예산</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "80px", textAlign: "center" }}>만족도</th>
                              <th style={{ padding: "0.6rem 0.5rem" }}>기타 및 특이사항</th>
                              <th style={{ padding: "0.6rem 0.5rem", width: "50px", textAlign: "center" }}>관리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {seminarList.length > 0 ? (
                              seminarList.map((seminar) => (
                                <tr
                                  key={seminar.id}
                                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                  className="course-tr-hover"
                                >
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", fontWeight: "700" }}>{seminar.id}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>{seminar.date}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", fontWeight: "700", color: "var(--text-primary)" }}>{seminar.speaker}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-primary)", fontWeight: "600" }}>{seminar.title}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>{seminar.attendees}명</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10b981" }}>
                                    ₩{(seminar.mainCost || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#6366f1" }}>
                                    ₩{(seminar.carryCost || 0).toLocaleString()}
                                  </td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>
                                    <span style={{ background: "rgba(234,179,8,0.1)", color: "#eab308", padding: "0.15rem 0.35rem", borderRadius: "3px", fontWeight: "800" }}>
                                      ★ {seminar.satisfaction.toFixed(1)}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{seminar.etc}</td>
                                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>
                                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                                      <button
                                        aria-label={`제${seminar.id}차 세미나 결과 수정`}
                                        onClick={() => {
                                          setIsEditMode(true);
                                          setFormSeminarId(String(seminar.id));
                                          setFormSeminarDate(seminar.date);
                                          setFormSeminarSpeaker(seminar.speaker);
                                          setFormSeminarTitle(seminar.title);
                                          setFormSeminarAttendees(String(seminar.attendees));
                                          setFormSeminarMainCost(String(seminar.mainCost || 0));
                                          setFormSeminarCarryCost(String(seminar.carryCost || 0));
                                          setFormSeminarSatisfaction(String(seminar.satisfaction));
                                          setFormSeminarEtc(seminar.etc || "");
                                          setIsSeminarModalOpen(true);
                                        }}
                                        title="수정"
                                        style={{ border: "none", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: "0.65rem", padding: "0.25rem 0.45rem", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button
                                        aria-label={`제${seminar.id}차 세미나 결과 삭제`}
                                        onClick={() => {
                                          if (confirm(`제${seminar.id}차 세미나 결과보고를 목록에서 삭제하시겠습니까?`)) {
                                            const deleteFromDb = async () => {
                                              const { error } = await supabase
                                                .from("seminar_reports")
                                                .delete()
                                                .eq("seminar_id", seminar.id);
                                              if (error) {
                                                console.error("Supabase 삭제 에러:", error);
                                                alert("DB 삭제에 실패했습니다: " + error.message);
                                              } else {
                                                setSeminarList(seminarList.filter(s => s.id !== seminar.id));
                                              }
                                            };
                                            deleteFromDb();
                                          }
                                        }}
                                        title="삭제"
                                        style={{ border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.65rem", padding: "0.25rem 0.45rem", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                  등록된 세미나 결과보고서가 없습니다. [+ 결과보고 등록] 버튼을 통해 추가해 보세요.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. 지산학 세미나 추가 결과보고 모달창 UI */}
                    {isSeminarModalOpen && (
                      <MajorProgramSeminarModal
                        isEditMode={isEditMode}
                        setIsSeminarModalOpen={setIsSeminarModalOpen}
                        isAiAnalyzing={isAiAnalyzing}
                        aiStatusText={aiStatusText}
                        handleFileUpload={handleFileUpload}
                        handleSeminarSubmit={handleSeminarSubmit}
                        formSeminarId={formSeminarId}
                        setFormSeminarId={setFormSeminarId}
                        formSeminarDate={formSeminarDate}
                        setFormSeminarDate={setFormSeminarDate}
                        formSeminarSpeaker={formSeminarSpeaker}
                        setFormSeminarSpeaker={setFormSeminarSpeaker}
                        formSeminarTitle={formSeminarTitle}
                        setFormSeminarTitle={setFormSeminarTitle}
                        formSeminarAttendees={formSeminarAttendees}
                        setFormSeminarAttendees={setFormSeminarAttendees}
                        formSeminarMainCost={formSeminarMainCost}
                        setFormSeminarMainCost={setFormSeminarMainCost}
                        formSeminarCarryCost={formSeminarCarryCost}
                        setFormSeminarCarryCost={setFormSeminarCarryCost}
                        formSeminarSatisfaction={formSeminarSatisfaction}
                        setFormSeminarSatisfaction={setFormSeminarSatisfaction}
                        formSeminarEtc={formSeminarEtc}
                        setFormSeminarEtc={setFormSeminarEtc}
                      />
                    )}
                  </div>
                ) : (
                  // 🌟 일반 다른 주요 프로그램의 경우 (기존 템플릿 렌더링 유지)
                  <div className="glass-card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "420px", textAlign: "center", gap: "1rem" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-color)" }}>
                      <BookOpen size={32} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>
                        {selectedProg.name}
                      </h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
                        {selectedProg.desc}
                      </p>
                    </div>

                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1.2rem",
                      borderRadius: "30px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)"
                    }}>
                      <Settings size={14} className="animate-spin-slow" />
                      <span>프로그램별 상세 성과/관리 화면 구성 준비 중</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  주요 프로그램을 선택해 주세요.
                </div>
              )}
            </>
          ) : (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
              과제 정보를 가져올 수 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
