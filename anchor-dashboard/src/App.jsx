import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import KPIOverview from "./components/KPIOverview";
import ExcelUploader from "./components/ExcelUploader";
import PDCAManager from "./components/PDCAManager";
import AgreementManager from "./components/AgreementManager";
import UnifiedCertificateManager from "./components/UnifiedCertificateManager";
import ScholarshipManager from "./components/ScholarshipManager";
import BudgetItemsManager from "./components/BudgetItemsManager";
import BudgetExecutionManager from "./components/BudgetExecutionManager";
import ProgramProgressManager from "./components/ProgramProgressManager";
import MajorProgramsManager from "./components/MajorProgramsManager";
import SatisfactionManager from "./components/SatisfactionManager";
import SurveyResponder from "./components/SurveyResponder";
import LLMWiki from "./components/LLMWiki";
import OrgChartManager from "./components/OrgChartManager";
import PartnerManager from "./components/PartnerManager";
import PortalConfigManager from "./components/PortalConfigManager";
import AuthManager from "./components/AuthManager";
import ProcurementManager from "./components/ProcurementManager";
import ScheduleManager from "./components/ScheduleManager";
import UnitSystemView from "./components/UnitSystemView";
import { initialProjectsData, userRoles, YEAR_1_PROGRAMS, Y1_UNIT_META } from "./data/mockData";
import { Sun, Moon, LogOut, HelpCircle, ArrowUpRight, Lock as LockIcon, Info } from "lucide-react";
import { supabase } from "./supabaseClient";
import CryptoJS from "crypto-js";
import * as XLSX from "xlsx";
import "./styles/dashboard.css";

// 담당연구원이 2명일 때 정/부 표기 헬퍼 함수
const formatAssignee = (assigneeText) => {
  if (!assigneeText) return "미배정";
  const parts = assigneeText.split(/[,\/]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    return `${parts[0]}(정), ${parts[1]}(부)`;
  }
  return assigneeText;
};


// 초기에 적재해 둘 기자재 목록 모의 데이터셋 (Supabase 최초 시딩용)
const defaultEquipmentsSeed = [
  { id: 1, unit: "A1", seq: 1, deptName: "간호학부", divisionName: "", itemName: "스마트 환자 시뮬레이터 (중환자 케어 실습 장비)", unitPrice: 120000000, quantity: 1, description: "글로벌 앵커 혁신 교육과정 임상 실습 고도화 핵심 기기", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-10", dateA: "2025-04-15", dateB: "2025-06-12", datePr: "2025-07-20", dateI: "2025-09-05"
  },
  { id: 2, unit: "A2", seq: 2, deptName: "화학공학과", divisionName: "", itemName: "정밀 화학 분석 크로마토그래피 시스템", unitPrice: 245000000, quantity: 1, description: "신산업 저탄소 에너지 트랙 화학 정밀 분석 실습 장비", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-15", dateA: "2025-04-20", dateB: "2025-06-18", datePr: "2025-07-25", dateI: "2025-09-10"
  },
  { id: 3, unit: "B1", seq: 3, deptName: "컴퓨터공학과", divisionName: "", itemName: "AI 알고리즘 모델링 연산용 고성능 GPU 워크스테이션", unitPrice: 15000000, quantity: 3, description: "RCC 특화산업 AI 융합 실감형 교육 센터 실무 교육 지원", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-12", dateA: "2025-04-18", dateB: "", datePr: "2025-06-25", dateI: "2025-08-14"
  },
  { id: 4, unit: "B2", seq: 4, deptName: "기계공학부", divisionName: "", itemName: "스마트 팩토리 모듈 제어 및 3D 정밀 프린팅 모듈", unitPrice: 38000000, quantity: 1, description: "지산학 연계 제조 혁신 엔지니어 교육 기자재", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-20", dateA: "2025-05-15", dateB: "2025-06-08", datePr: "2025-06-20", dateI: "2025-08-18"
  },
  { id: 5, unit: "B3", seq: 5, deptName: "전기전자공학부", divisionName: "", itemName: "반도체 임베디드 코딩 및 고정밀 계측 오실로스코프", unitPrice: 8500000, quantity: 4, description: "반도체 전공 대학 연계 실무 미러형 교육 설계용 장비", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-25", dateA: "2025-04-28", dateB: "2025-06-05", datePr: "2025-06-18", dateI: "2025-08-20"
  },
  { id: 6, unit: "B4", seq: 6, deptName: "유아교육과", divisionName: "", itemName: "늘봄 연계 창의 놀이 실증용 스마트 인터랙티브 디스플레이", unitPrice: 8500000, quantity: 2, description: "에듀테크 기반 창의적 교육 콘텐츠 제작 교육 과정 운영", operation: "교과목(비정규)", password: "1234",
    dateP: "2025-03-18", dateA: "2025-05-10", dateB: "", datePr: "2025-06-24", dateI: "2025-08-25"
  },
  { id: 7, unit: "C1", seq: 7, deptName: "컴퓨터공학과", divisionName: "", itemName: "다목적 6축 소형 스마트 교육용 협동 로봇 머니퓰레이터", unitPrice: 28000000, quantity: 1, description: "미래 지능형 로봇 운용/제어 교과목 현장 중심 실습", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-22", dateA: "2025-05-12", dateB: "2025-06-15", datePr: "2025-06-28", dateI: "2025-08-28"
  },
  { id: 8, unit: "C2", seq: 8, deptName: "반려동물보건과", divisionName: "", itemName: "동물 전용 디지털 초음파 진단 장치", unitPrice: 19000000, quantity: 1, description: "신설학과 실무 미러형 임상 실습실 조달 품목", operation: "교과목(정규)", password: "1234",
    dateP: "2025-04-10", dateA: "2025-05-20", dateB: "2025-06-18", datePr: "2025-07-15", dateI: "2025-09-12"
  },
  { id: 9, unit: "D1", seq: 9, deptName: "조선해양시스템공학과", divisionName: "", itemName: "미래 친환경선박 가상 운항 교육 시뮬레이터", unitPrice: 45000000, quantity: 1, description: "5극3특 가상 운항 실습 교육 과정 지원용 장비", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-08", dateA: "2025-05-08", dateB: "2025-07-10", datePr: "2025-08-20", dateI: "2025-11-15"
  },
  { id: 10, unit: "D2", seq: 10, deptName: "물리치료학과", divisionName: "", itemName: "메디컬 스킨케어 다기능 뷰티 디바이스", unitPrice: 6500000, quantity: 5, description: "웰니스 뷰티 케어 실습 및 지역 상생 뷰티 아카데미 활용", operation: "교과목(비정규)", password: "1234",
    dateP: "2025-03-14", dateA: "2025-04-24", dateB: "", datePr: "2025-06-22", dateI: "2025-08-29"
  }
];

// 초기에 적재해 둘 협약서 목록 모의 데이터셋 (1차년도 샘플 2개 제공)
const INITIAL_AGREEMENTS = [
  {
    id: 1,
    year: 1,
    date: "2026-05-12",
    center: "ECC센터",
    organizations: [
      { name: "울산대학교", subject: "울산대학교 교무처장" },
      { name: "울산테크노파크", subject: "울산TP 원장" }
    ],
    subjectUniversity: "단장",
    subjectOrganization: "울산대학교 교무처장, 울산TP 원장",
    unitId: "A1",
    contents: ["주문식교육", "R&BD"],
    fileName: "2026_지역혁신인재양성_공동협약서.pdf",
    fileData: null
  },
  {
    id: 2,
    year: 1,
    date: "2026-06-20",
    center: "ICC센터",
    organizations: [
      { name: "HD현대중공업", subject: "HD현대중공업 인재개발원장" }
    ],
    subjectUniversity: "총장",
    subjectOrganization: "HD현대중공업 인재개발원장",
    unitId: "B1",
    contents: ["주문식교육", "AIDX"],
    fileName: "HD현대중공업_산학협력_협약서_최종.docx"
  }
];

// 1차년도 화면 노출 ID에서 원본 내부 ID로 역매핑을 위한 전역 맵
const REVERSE_UNIT_MAPPING_Y1 = {
  "A1": "A1가",
  "A2": "A2",
  "D4": "A3",
  "B1": "B1",
  "C2": "B2",
  "C3": "B3",
  "C1": "B4",
  "B2": "C1",
  "D2": "C2",
  "B3": "D1",
  "D1": "D2",
  "D3": "D3"
};

const PROGRAM_ID_MIGRATION_MAP = {
  "A1가": {
    // 1차 마이그레이션 (원본 ID ➡️ 신규 ID)
    "A1가-01": "A1가-S1T1-1", "A1가-02": "A1가-S1T2-1", "A1가-03": "A1가-S1T2-2", "A1가-04": "A1가-S1T2-3", "A1가-05": "A1가-S1T2-4",
    "A1가-06": "A1가-S1T2-5", "A1가-07": "A1가-S1T2-6", "A1가-08": "A1가-S1T2-7", "A1가-09": "A1가-S1T3-1", "A1가-10": "A1가-S2T4-1",
    "A1가-11": "A1가-S2T5-1",
    "A1가-12": "A1가-S3T6-1", "A1가-13": "A1가-S3T7-1",
    "A1가-14": "A1가-S3T7-2", "A1가-15": "A1가-S3T8-1", "A1가-16": "A1가-S3T9-1", "A1가-17": "A1가-S3T9-2",
    "A1가-18": "A1가-S3T9-3", "A1가-19": "A1가-S4T10-1", "A1가-20": "A1가-S4T10-2", "A1가-21": "A1가-S4T10-3", "A1가-22": "A1가-S4T10-4", "A1가-23": "A1가-S4T11-1", "A1가-24": "A1가-S4T12-1",
    "A1가-25": "A1가-S4T12-2",
    "A1가-26": "A1가-S4T12-3", "A1가-27": "A1가-S5T13-1", "A1가-28": "A1가-S5T13-2", "A1가-29": "A1가-S5T13-3", "A1가-30": "A1가-S5T13-4", "A1가-31": "A1가-S5T13-5", "A1가-32": "A1가-S5T13-6",
    "A1가-33": "A1가-S5T13-7", "A1가-34": "A1가-S5T13-8", "A1가-35": "A1가-S5T14-1",

    // 2차 구제 마이그레이션 (과거 잘못 저장된 v26 캐시 ID ➡️ 신규 ID 보정)
    "A1가-S1T1-2": "A1가-S1T2-1", "A1가-S1T1-3": "A1가-S1T2-2", "A1가-S1T1-4": "A1가-S1T2-3", "A1가-S1T1-5": "A1가-S1T2-4",
    "A1가-S1T1-6": "A1가-S1T2-5", "A1가-S1T1-7": "A1가-S1T2-6", "A1가-S1T1-8": "A1가-S1T2-7", "A1가-S1T1-9": "A1가-S1T3-1",
    "A1가-S1T1-10": "A1가-S2T4-1", "A1가-S3T3-1": "A1가-S2T5-1", "A1가-S1T1-11": "A1가-S3T6-1", "A1가-S1T1-12": "A1가-S3T7-1",
    "A1가-S3T3-2": "A1가-S3T7-2", "A1가-S3T3-3": "A1가-S3T8-1", "A1가-S3T3-4": "A1가-S3T9-1", "A1가-S3T3-5": "A1가-S3T9-2",
    "A1가-S4T4-1": "A1가-S3T9-3", "A1가-S4T4-2": "A1가-S4T10-1", "A1가-S4T4-3": "A1가-S4T10-2", "A1가-S4T4-4": "A1가-S4T10-3",
    "A1가-S4T4-5": "A1가-S4T10-4", "A1가-S4T4-6": "A1가-S4T11-1", "A1가-S4T4-7": "A1가-S4T12-1", "A1가-S3T3-6": "A1가-S4T12-2",
    "A1가-S5T5-1": "A1가-S4T12-3", "A1가-S5T5-2": "A1가-S5T13-1", "A1가-S5T5-3": "A1가-S5T13-2", "A1가-S5T5-4": "A1가-S5T13-3",
    "A1가-S5T5-5": "A1가-S5T13-4", "A1가-S5T5-6": "A1가-S5T13-5", "A1가-S5T5-7": "A1가-S5T13-6", "A1가-S5T5-8": "A1가-S5T13-7",
    "A1가-S5T5-9": "A1가-S5T13-8", "A1가-S5T5-10": "A1가-S5T14-1"
  },
  "A1나": {
    "A1나-01": "A1나-S1T1-1", "A1나-02": "A1나-S2T2-1", "A1나-03": "A1나-S3T3-1"
  },
  "A2": {
    "A2-01": "A2-S1T1-1", "A2-02": "A2-S1T2-1", "A2-03": "A2-S2T3-1", "A2-04": "A2-S2T4-1", "A2-05": "A2-S3T5-1", "A2-06": "A2-S3T6-1", "A2-07": "A2-S3T7-1"
  },
  "A3": {
    "A3-01": "A3-S1T1-1", "A3-02": "A3-S1T2-1", "A3-03": "A3-S2T3-1", "A3-04": "A3-S2T4-1", "A3-05": "A3-S2T4-2", "A3-06": "A3-S2T4-3"
  },
  "B1": {
    "B1-01": "B1-S1T1-1", "B1-02": "B1-S1T2-1", "B1-03": "B1-S2T3-1", "B1-04": "B1-S3T4-1", "B1-05": "B1-S3T4-2", "B1-06": "B1-S3T4-3"
  },
  "B2": {
    "B2-01": "B2-S1T1-1", "B2-02": "B2-S2T2-1", "B2-03": "B2-S2T3-1", "B2-04": "B2-S3T4-1", "B2-05": "B2-S4T5-1", "B2-06": "B2-S4T5-2", "B2-07": "B2-S4T5-3"
  },
  "B3": {
    "B3-01": "B3-S1T1-1", "B3-02": "B3-S2T2-1", "B3-03": "B3-S3T3-1", "B3-04": "B3-S3T3-2", "B3-05": "B3-S3T3-3"
  },
  "B4": {
    "B4-01": "B4-S1T1-1", "B4-02": "B4-S2T2-1", "B4-03": "B4-S3T3-1", "B4-04": "B4-S3T3-2", "B4-05": "B4-S3T3-3"
  },
  "C1": {
    "C1-01": "C1-S1T1-1", "C1-02": "C1-S2T2-1", "C1-03": "C1-S3T3-1", "C1-04": "C1-S4T4-1", "C1-05": "C1-S4T4-2"
  },
  "C2": {
    "C2-01": "C2-S1T1-1", "C2-02": "C2-S2T2-1", "C2-03": "C2-S3T3-1", "C2-04": "C2-S4T4-1", "C2-05": "C2-S4T4-2"
  },
  "D1": {
    "D1-01": "D1-S1T1-1", "D1-02": "D1-S2T2-1", "D1-03": "D1-S2T3-1", "D1-04": "D1-S2T3-2", "D1-05": "D1-S2T3-3"
  },
  "D2": {
    "D2-01": "D2-S1T1-1", "D2-02": "D2-S1T2-1", "D2-03": "D2-S2T3-1", "D2-04": "D2-S2T3-2", "D2-05": "D2-S2T3-3"
  },
  "D3": {
    "D3-01": "D3-S1T1-1", "D3-02": "D3-S1T2-1", "D3-03": "D3-S2T3-1", "D3-04": "D3-S2T3-2", "D3-05": "D3-S2T3-3"
  }
};

const migrateProgramIds = (data) => {
  if (!data || !Array.isArray(data)) return data;
  data.forEach((strategy) => {
    if (strategy.units && Array.isArray(strategy.units)) {
      strategy.units.forEach((unit) => {
        if (unit.programs && Array.isArray(unit.programs)) {
          unit.programs.forEach((prog) => {
            const unitRules = PROGRAM_ID_MIGRATION_MAP[unit.id];
            if (unitRules && unitRules[prog.id]) {
              prog.id = unitRules[prog.id];
            }
          });
        }
      });
    }
  });
  return data;
};

const getCalculatedYearFromDate = (dateStr, fallbackYear) => {
  if (!dateStr) return fallbackYear;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return fallbackYear;
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  // 1월과 2월은 직전 연도의 회계연도에 속함 (예: 2026년 2월 -> 2025회계연도)
  const fiscalYear = month <= 2 ? year - 1 : year;
  
  // 2025년: 1차년도, 2026년: 2차년도, ...
  if (fiscalYear === 2025) return 1;
  if (fiscalYear === 2026) return 2;
  if (fiscalYear === 2027) return 3;
  if (fiscalYear === 2028) return 4;
  if (fiscalYear === 2029) return 5;
  
  return fallbackYear;
};

const getRealUnitId = (unitId, yr) => {
  return yr === 1 ? (REVERSE_UNIT_MAPPING_Y1[unitId] || unitId) : unitId;
};

// 앵커 사업단 초기 구성원 주소록 명단 데이터셋
const INITIAL_MEMBERS = [
  // 교수 및 리더진
  { id: "m-01", name: "송경영", role: "사업단장", grade: "정교수", dept: "-", phoneOffice: "052-279-3154", phoneMobile: "010-7627-7123", email: "kysong@uc.ac.kr", room: "교수연구실/E1-307", hireDate: "2026-03-01" },
  { id: "m-02", name: "김현수", role: "본부장", grade: "정교수", dept: "운영본부", phoneOffice: "052-279-3122", phoneMobile: "010-4628-7963", email: "hskim3@uc.ac.kr", room: "교수연구실/E2-414", hireDate: "2026-03-01" },
  { id: "m-03", name: "심현미", role: "운영팀장", grade: "부장", dept: "사업운영팀", phoneOffice: "052-230-0441", phoneMobile: "010-6554-8359", email: "hmsim@uc.ac.kr", room: "산학협력단/S-203", hireDate: "2026-03-01" },
  { id: "m-04", name: "이동은", role: "센터장", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0111", phoneMobile: "010-1234-5678", email: "delee@uc.ac.kr", room: "교수연구실/E2-201", hireDate: "2026-03-01" },
  { id: "m-05", name: "김기범", role: "센터장", grade: "정교수", dept: "ICC센터", phoneOffice: "052-230-0222", phoneMobile: "010-2345-6789", email: "kbkim@uc.ac.kr", room: "교수연구실/E2-301", hireDate: "2026-03-01" },
  { id: "m-06", name: "현용환", role: "센터장", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0333", phoneMobile: "010-3456-7890", email: "yhhyun@uc.ac.kr", room: "교수연구실/E2-401", hireDate: "2026-03-01" },
  { id: "m-07", name: "홍광표", role: "센터장", grade: "정교수", dept: "울산늘봄누리센터", phoneOffice: "052-230-0444", phoneMobile: "010-4567-8901", email: "gphong@uc.ac.kr", room: "교수연구실/E2-501", hireDate: "2026-03-01" },
  { id: "m-07b", name: "홍진숙", role: "센터장", grade: "정교수", dept: "신산업특화센터", phoneOffice: "052-279-3134", phoneMobile: "010-9120-8583", email: "cshong@uc.ac.kr", room: "센터실/N-101", hireDate: "2026-06-01" },
  
  // 팀장교수
  { id: "m-08", name: "장광일", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0112", phoneMobile: "010-5678-9012", email: "kijang@uc.ac.kr", room: "교수연구실/E2-202", hireDate: "2026-03-01" },
  { id: "m-09", name: "고형석", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0113", phoneMobile: "010-6789-0123", email: "hsko@uc.ac.kr", room: "교수연구실/E2-203", hireDate: "2026-03-01" },
  { id: "m-10", name: "양승호", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0114", phoneMobile: "010-7890-1234", email: "shyang@uc.ac.kr", room: "교수연구실/E2-204", hireDate: "2026-03-01" },
  { id: "m-11", name: "김산", role: "팀장교수", grade: "정교수", dept: "ICC센터", phoneOffice: "052-230-0223", phoneMobile: "010-8901-2345", email: "skim@uc.ac.kr", room: "교수연구실/E2-302", hireDate: "2026-03-01" },
  { id: "m-12", name: "한미라", role: "팀장교수", grade: "정교수", dept: "ICC센터", phoneOffice: "052-230-0224", phoneMobile: "010-9012-3456", email: "mrhan@uc.ac.kr", room: "교수연구실/E2-303", hireDate: "2026-03-01" },
  { id: "m-13", name: "김민경", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0334", phoneMobile: "010-0123-4567", email: "mkkim@uc.ac.kr", room: "교수연구실/E2-402", hireDate: "2026-03-01" },
  { id: "m-14", name: "이한도", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0335", phoneMobile: "010-1234-8765", email: "hdlee@uc.ac.kr", room: "교수연구실/E2-403", hireDate: "2026-03-01" },
  { id: "m-15", name: "이상현", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0336", phoneMobile: "010-2345-9876", email: "shlee@uc.ac.kr", room: "교수연구실/E2-404", hireDate: "2026-03-01" },
  { id: "m-15b", name: "박성혁", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0337", phoneMobile: "010-8765-4321", email: "shpark@uc.ac.kr", room: "교수연구실/E2-405", hireDate: "2026-03-01" },
  { id: "m-16", name: "이정준", role: "팀장교수", grade: "정교수", dept: "AID-X지원센터", phoneOffice: "052-230-0445", phoneMobile: "010-3456-0987", email: "jjlee@uc.ac.kr", room: "교수연구실/E2-502", hireDate: "2026-03-01" },

  // 실무 연구원 (등급/직위 3구분 적용)
  { id: "m-17", name: "이현섭", role: "연구원", grade: "책임연구원", dept: "RCC센터", phoneOffice: "052-230-0417", phoneMobile: "010-8252-1151", email: "mogern1@uc.ac.kr", room: "연구원실/R-101", hireDate: "2026-03-01" },
  { id: "m-18", name: "이은주", role: "연구원", grade: "선임연구원", dept: "ECC센터", phoneOffice: "052-230-0414", phoneMobile: "010-4026-3850", email: "ejlee7@uc.ac.kr", room: "연구원실/E-101", hireDate: "2026-03-01" },
  { id: "m-19", name: "이정은", role: "연구원", grade: "선임연구원", dept: "ICC센터", phoneOffice: "052-279-3305", phoneMobile: "010-3435-6878", email: "lje6878@uc.ac.kr", room: "연구원실/I-101", hireDate: "2026-03-01" },
  { id: "m-20", name: "임은애", role: "연구원", grade: "선임연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3319", phoneMobile: "010-4595-5406", email: "jslover85@uc.ac.kr", room: "연구원실/A101", hireDate: "2026-03-01" },
  { id: "m-21", name: "박인숙", role: "연구원", grade: "선임연구원", dept: "RCC센터", phoneOffice: "052-230-0428", phoneMobile: "010-5703-5706", email: "ispark@uc.ac.kr", room: "연구원실/R-102", hireDate: "2026-03-01" },
  { id: "m-22", name: "한유경", role: "연구원", grade: "선임연구원", dept: "사업운영팀", phoneOffice: "052-230-0452", phoneMobile: "010-5137-7030", email: "hanyuky@uc.ac.kr", room: "운영팀실/S-204", hireDate: "2026-03-01" },
  { id: "m-23", name: "황수진", role: "연구원", grade: "선임연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0418", phoneMobile: "010-2080-2503", email: "sujin5599@uc.ac.kr", room: "연구원실/N-103", hireDate: "2026-03-01" },
  { id: "m-24", name: "서란", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0415", phoneMobile: "010-8636-1276", email: "rseo2@uc.ac.kr", room: "연구원실/E-102", hireDate: "2026-03-01" },
  { id: "m-25", name: "정자윤", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0673", phoneMobile: "010-3517-9169", email: "jyjung2@uc.ac.kr", room: "연구원실/E-103", hireDate: "2026-03-01" },
  { id: "m-26", name: "박기범", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0445", phoneMobile: "010-8079-1798", email: "gbbak@uc.ac.kr", room: "연구원실/E-104", hireDate: "2026-03-01" },
  { id: "m-27", name: "김소연", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0667", phoneMobile: "010-2482-9506", email: "sysy400@uc.ac.kr", room: "연구원실/E-105", hireDate: "2026-03-01" },
  { id: "m-28", name: "이혜성", role: "연구원", grade: "연구원", dept: "ICC센터", phoneOffice: "052-279-3307", phoneMobile: "010-3459-0429", email: "hslee4@uc.ac.kr", room: "연구원실/I-102", hireDate: "2026-03-01" },
  { id: "m-29", name: "도지은", role: "연구원", grade: "연구원", dept: "ICC센터", phoneOffice: "052-279-3313", phoneMobile: "010-4262-0370", email: "jido@uc.ac.kr", room: "연구원실/I-103", hireDate: "2026-03-01" },
  { id: "m-30", name: "이연향", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0427", phoneMobile: "010-7165-7038", email: "yhlee4@uc.ac.kr", room: "연구원실/R-103", hireDate: "2026-03-01" },
  { id: "m-31", name: "김소정", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0450", phoneMobile: "010-3162-1678", email: "sjkim9@uc.ac.kr", room: "연구원실/R-104", hireDate: "2026-03-01" },
  { id: "m-32", name: "오영경", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0449", phoneMobile: "010-2636-3832", email: "ohyk@uc.ac.kr", room: "연구원실/R-105", hireDate: "2026-03-01" },
  { id: "m-33", name: "최승혜", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0448", phoneMobile: "010-8545-9087", email: "shchoi2@uc.ac.kr", room: "연구원실/R-106", hireDate: "2026-03-01" },
  { id: "m-34", name: "서은지", role: "연구원", grade: "연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3220", phoneMobile: "010-3294-8295", email: "ajaeunji@uc.ac.kr", room: "연구원실/A102", hireDate: "2026-03-01" },
  { id: "m-35", name: "채민지", role: "연구원", grade: "연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3185", phoneMobile: "010-7682-6864", email: "minji6843@uc.ac.kr", room: "연구원실/A103", hireDate: "2026-03-01" },
  { id: "m-36", name: "김나희", role: "연구원", grade: "연구원", dept: "신산업특화센터", phoneOffice: "052-230-0709", phoneMobile: "010-4363-7319", email: "nhkim2@uc.ac.kr", room: "센터실/N-101", hireDate: "2026-03-01" },
  { id: "m-37", name: "정호성", role: "연구원", grade: "연구원", dept: "신산업특화센터", phoneOffice: "052-230-0708", phoneMobile: "010-9208-7849", email: "jhsung@uc.ac.kr", room: "센터실/N-102", hireDate: "2026-03-01" },
  { id: "m-38", name: "김래림", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0529", phoneMobile: "010-5246-9520", email: "rrkim@uc.ac.kr", room: "운영팀실/S-206", hireDate: "2026-03-01" },
  { id: "m-39", name: "박언주", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0443", phoneMobile: "010-2541-5992", email: "ejpark@uc.ac.kr", room: "운영팀실/S-207", hireDate: "2026-03-01" },
  { id: "m-40", name: "이규상", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0442", phoneMobile: "010-2402-1649", email: "leegyu@uc.ac.kr", room: "운영팀실/S-208", hireDate: "2026-03-01" },
  { id: "m-41", name: "김예지", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0454", phoneMobile: "010-9778-1705", email: "limited0517@uc.ac.kr", room: "연구원실/N-104", hireDate: "2026-03-01" },
  { id: "m-42", name: "최주명", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0419", phoneMobile: "010-9385-5959", email: "jmchoi@uc.ac.kr", room: "연구원실/N-105", hireDate: "2026-03-01" }
];

// LaTeX 수식 파서 및 HTML 렌더러 컴포넌트
const RenderLatexFormula = ({ formula }) => {
  if (!formula) return null;

  // 전체 컨테이너 스타일
  const containerStyle = {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    background: "rgba(255,255,255,0.01)",
    padding: "0.6rem 0.8rem",
    borderRadius: "0.4rem",
    border: "1px solid var(--border-color)",
    width: "100%",
    boxSizing: "border-box"
  };

  // 1단계: LaTeX 문자열에서 오염된 text{...} 구조와 제어문자들을 완전히 평문화
  const purifyLatexString = (str) => {
    if (!str) return "";
    return str
      // \text{...} 또는 [Tab]ext{...} 구조 매칭하여 중괄호 안의 글자만 추출
      .replace(/(?:\\text|[\t]ext)\{([^}]+)\}/g, "$1")
      // 혹시 백슬래시 탈락해서 남은 text{...} 및 ext{...} 정화
      .replace(/(?:text|ext)\{([^}]+)\}/g, "$1")
      // LaTeX 퍼센트 이스케이프 복구
      .replace(/\\%/g, "%")
      // 남은 백슬래시 제거
      .replace(/\\/g, "");
  };

  // 먼저 전체 수식 문자열을 평문화 처리한다! (중괄호 중첩 구조가 여기서 선제 정화됨)
  const purifiedFormula = purifyLatexString(formula);

  // 2단계: 평문화된 수식에서 분수 및 연산자 파싱
  // 2.1. 만약 수식에 "="이 있다면 (C-1 ~ C-6 공식 등)
  if (purifiedFormula.includes("=")) {
    const parts = purifiedFormula.split("=");
    const label = parts[0].trim();
    const rightSide = parts[1].trim();

    // 평문화 상태이므로 단순히 frac{분자}{분모} 구조만 감지하면 됨! (오염된 rac도 지원)
    const fracMatch = rightSide.match(/(?:frac|rac)\{([^}]+)\}\s*\{([^}]+)\}/);
    if (fracMatch) {
      const num = fracMatch[1].trim();
      const den = fracMatch[2].trim();
      
      const timesMatch = rightSide.match(/times\s*([\d.]+)/);
      const weight = timesMatch ? timesMatch[1] : null;

      return (
        <div style={containerStyle}>
          {label && (
            <span style={{ fontWeight: "800", color: "var(--accent-color)", marginRight: "0.4rem" }}>
              {label} =
            </span>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
              <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
              <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{den}</span>
            </div>
            {weight && (
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                × {weight}
              </span>
            )}
          </div>
        </div>
      );
    }
  }

  // 2.2. 일반 다항식 분수라면 (L-1 ~ L-24 공식 등)
  const containsFrac = purifiedFormula.includes("frac") || purifiedFormula.includes("rac");
  if (!containsFrac) {
    return <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{purifiedFormula}</span>;
  }

  const terms = purifiedFormula.split("+");

  return (
    <div style={containerStyle}>
      {terms.map((termStr, index) => {
        const trimmed = termStr.trim();
        const fracMatch = trimmed.match(/(?:frac|rac)\{([^}]+)\}\s*\{([^}]+)\}(?:\s*times\s*([\d.]+))?/);

        if (fracMatch) {
          const num = fracMatch[1].trim();
          const den = fracMatch[2].trim();
          const weight = fracMatch[3];

          return (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary)" }}>+</span>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "65px" }}>
                  <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
                  <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{den}</span>
                </div>
                {weight && (
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                    × {weight}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={index}>
            {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary)" }}>+</span>}
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{trimmed}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 5개년 연쇄 잔액 이월(Carry Over) 계산 함수
function recalculateCarryOver(years) {
  if (!years) return;

  // 1차년도 잔액 -> 2차년도 이월
  if (years[1] && years[2]) {
    const balanceY1 = Math.max(0, ((years[1].budget_main || 0) + (years[1].budget_carry || 0)) - ((years[1].spent_main || 0) + (years[1].spent_carry || 0)));
    years[2].budget_carry = balanceY1;
  }

  // 2차년도 잔액 -> 3차년도 이월
  if (years[2] && years[3]) {
    const balanceY2 = Math.max(0, ((years[2].budget_main || 0) + (years[2].budget_carry || 0)) - ((years[2].spent_main || 0) + (years[2].spent_carry || 0)));
    years[3].budget_carry = balanceY2;
  }

  // 3차년도 잔액 -> 4차년도 이월
  if (years[3] && years[4]) {
    const balanceY3 = Math.max(0, ((years[3].budget_main || 0) + (years[3].budget_carry || 0)) - ((years[3].spent_main || 0) + (years[3].spent_carry || 0)));
    years[4].budget_carry = balanceY3;
  }

  // 4차년도 잔액 -> 5차년도 이월
  if (years[4] && years[5]) {
    const balanceY4 = Math.max(0, ((years[4].budget_main || 0) + (years[4].budget_carry || 0)) - ((years[4].spent_main || 0) + (years[4].spent_carry || 0)));
    years[5].budget_carry = balanceY4;
  }
}

// 다년도 예산/집행 구조 동적 변환기 (1~5차년도)
function formatDataToMultiYear(data) {
  return data.map((p) => {
    const newUnits = p.units.map((u) => {
      // 1. 단위과제 예산 다년도 맵핑
      const unitYears = {};
      [1, 2, 3, 4, 5].forEach((yr) => {
        if (yr === 2) {
          unitYears[yr] = {
            budget_main: u.budget_2026 || 0,
            spent_main: u.spent_2026 || 0,
            budget_carry: u.budget_2025_carry || 0,
            spent_carry: u.spent_2025_carry || 0
          };
        } else if (yr === 1) {
          // 1차년도 실제 예산 데이터가 Y1_UNIT_META에 정의되어 있다면 이를 우선 사용하고, 없다면 0.9배 및 역산 공식 적용
          const meta = Y1_UNIT_META[u.id];
          let budgetMain, spentMain;
          if (meta) {
            budgetMain = meta.budget;
            spentMain = meta.budget - meta.carry; // 예산에서 이월 잔액(carry)을 차감하여 집행액 역산
          } else {
            budgetMain = Math.round((u.budget_2026 || 0) * 0.9);
            spentMain = Math.max(0, budgetMain - (u.budget_2025_carry || 0));
          }
          unitYears[yr] = {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: 0,
            spent_carry: 0
          };
        } else {
          const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
          unitYears[yr] = {
            budget_main: Math.round((u.budget_2026 || 0) * factor),
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0
          };
        }
      });
      // 1차년도부터 5차년도까지 이월예산 연쇄 반영
      recalculateCarryOver(unitYears);

      // 2. 세부 프로그램 다년도 맵핑
      // 1차년도용 프로그램 목록 생성
      const y1ProgList = YEAR_1_PROGRAMS[u.id] || [];
      const y1Progs = y1ProgList.map((item) => {
        const meta = Y1_UNIT_META[u.id] || { budget: 1, national: 1, city: 0, carry: 0 };
        const nationalRatio = meta.national / meta.budget;
        const spentRatio = (meta.budget - meta.carry) / meta.budget;
        
        const budgetMain = item.budget;
        const spentMain = item.spent !== undefined ? item.spent : Math.round(item.budget * spentRatio);
        
        const budget_national = Math.round(budgetMain * nationalRatio);
        const budget_city = budgetMain - budget_national;
        
        const spent_national = Math.round(spentMain * nationalRatio);
        const spent_city = spentMain - spent_national;
        
        const progYears = {
          1: {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: 0,
            spent_carry: 0,
            
            budget_national,
            spent_national,
            budget_city,
            spent_city,
            budget_external: 0,
            spent_external: 0,
            
            budget_carry_national: 0,
            spent_carry_national: 0,
            budget_carry_city: 0,
            spent_carry_city: 0,
            budget_carry_external: 0,
            spent_carry_external: 0,
            budget_categories: item.budget_categories || []
          }
        };
        
        return {
          id: item.id,
          title: item.title,
          assignee: item.assignee || "미지정",
          pdca: item.pdca || { p: "완료", d: "완료", c: "완료", a: "완료" },
          years: progYears,
          timeline: item.timeline || "",
          targetAudience: item.targetAudience || "",
          coopDept: item.coopDept || "",
          achievements: "울산 지역 주력산업 고도화 및 지역정주 취업률 강화를 위해 기업 맞춤형 주문식 교육과정을 개발하고, 지산학교육센터(ECC) 중심의 산학 공동 연구를 수행하여 지역 사회 만족도를 크게 제고함.",
          satisfaction: 92,
          evalType: "우수",
          excellent: "대학 내 행정 전담 시스템 구축 및 격주 단위 운영위원회 활성화를 통해 신속한 의사결정 체계를 안착시킨 점이 우수함.",
          improvePlan: "2차년도에는 지역 정주 취업 연계를 보다 고도화하기 위해 가족회사 매칭 강소기업 현장 견학 프로그램을 추가 개설하고, 산학 PBL 과제를 확대 편성할 계획임.",
          deficiency: "",
          actionItem: ""
        };
      });

      // 2~5차년도용 프로그램 다년도 매핑 (1차년도는 제외)
      const y2Progs = u.programs.map((prog) => {
        const progYears = {};
        [2, 3, 4, 5].forEach((yr) => {
          let budgetMain = 0;
          let spentMain = 0;
          let budgetCarry = 0;
          let spentCarry = 0;

          if (yr === 2) {
            budgetMain = prog.budget_2026 || 0;
            spentMain = prog.spent_2026 || 0;
            budgetCarry = prog.budget_2025_carry || 0;
            spentCarry = prog.spent_2025_carry || 0;
          } else {
            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
            budgetMain = Math.round((prog.budget_2026 || 0) * factor);
            spentMain = 0;
            budgetCarry = 0;
            spentCarry = 0;
          }

          const isExternalSub = prog.id.endsWith("-2") || prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
          
          let budget_national = 0;
          let budget_city = 0;
          let budget_external = 0;

          if (prog.id.startsWith("A1가-")) {
            if (prog.id === "A1가-S1T2-1") {
              const ratio = yr === 2 ? 1 : (yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3);
              budget_national = Math.round(112000000 * ratio);
              budget_city = Math.round(80000000 * ratio);
            } else if (prog.id === "A1가-S4T12-2") {
              const ratio = yr === 2 ? 1 : (yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3);
              budget_city = Math.round(50000000 * ratio);
            } else {
              budget_national = budgetMain;
            }
          } else {
            if (isExternalSub) {
              budget_external = budgetMain;
            } else {
              budget_national = Math.round(budgetMain * 0.5);
              budget_city = budgetMain - budget_national;
            }
          }

          let spent_national = 0;
          let spent_city = 0;
          let spent_external = 0;
          if (spentMain > 0) {
            if (prog.id.startsWith("A1가-")) {
              if (prog.id === "A1가-S1T2-1") {
                const total = 192000000;
                spent_national = Math.round(spentMain * (112000000 / total));
                spent_city = spentMain - spent_national;
              } else if (prog.id === "A1가-S4T12-2") {
                spent_city = spentMain;
              } else {
                spent_national = spentMain;
              }
            } else {
              if (isExternalSub) {
                spent_external = spentMain;
              } else {
                spent_national = Math.round(spentMain * 0.5);
                spent_city = spentMain - spent_national;
              }
            }
          }

          let carry_national = 0;
          let carry_city = 0;
          let carry_external = 0;
          if (budgetCarry > 0) {
            if (isExternalSub) {
              carry_external = budgetCarry;
            } else {
              carry_national = Math.round(budgetCarry * 0.5);
              carry_city = budgetCarry - carry_national;
            }
          }

          let carry_spent_national = 0;
          let carry_spent_city = 0;
          let carry_spent_external = 0;
          if (spentCarry > 0) {
            if (isExternalSub) {
              carry_spent_external = spentCarry;
            } else {
              carry_spent_national = Math.round(spentCarry * 0.5);
              carry_spent_city = spentCarry - carry_spent_national;
            }
          }

          progYears[yr] = {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: budgetCarry,
            spent_carry: spentCarry,

            budget_national,
            spent_national,
            budget_city,
            spent_city,
            budget_external,
            spent_external,

            budget_carry_national: carry_national,
            spent_carry_national: carry_spent_national,
            budget_carry_city: carry_city,
            spent_carry_city: carry_spent_city,
            budget_carry_external: carry_external,
            spent_carry_external: carry_spent_external
          };
        });

        recalculateCarryOver(progYears);

        [2, 3, 4, 5].forEach((yr) => {
          const py = progYears[yr];
          const isExternalSub = prog.id.endsWith("-2") || prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
          if (isExternalSub) {
            py.budget_carry_external = py.budget_carry || 0;
            py.budget_carry_national = 0;
            py.budget_carry_city = 0;
          } else {
            py.budget_carry_national = Math.round((py.budget_carry || 0) * 0.5);
            py.budget_carry_city = (py.budget_carry || 0) - py.budget_carry_national;
            py.budget_carry_external = 0;
          }
        });

        return {
          ...prog,
          years: progYears,
          timeline: prog.timeline || "",
          targetAudience: prog.targetAudience || "",
          coopDept: prog.coopDept || "",
          evalType: prog.evalType || "우수",
          excellent: prog.excellent || "",
          improvePlan: prog.improvePlan || "",
          deficiency: prog.deficiency || "",
          actionItem: prog.actionItem || ""
        };
      });

      const newPrograms = [...y1Progs, ...y2Progs];

      // 3. 비목별 예산 다년도 맵핑
      const newBudgetDetails = {};
      Object.keys(u.budgetDetails || {}).forEach((key) => {
        const b = u.budgetDetails[key];
        
        // [비정상 오버플로우 정화] 100억 원 초과 시 오기입 및 오계산 복구 (장학금 복원)
        if (b.budget_2026 > 10000000000) {
          b.budget_2026 = Math.round(b.budget_2026 / 1000);
        }
        if (b.budget_2025_carry > 10000000000) {
          b.budget_2025_carry = Math.round(b.budget_2025_carry / 1000);
        }
        if (b.spent_2026 > 10000000000) {
          b.spent_2026 = Math.round(b.spent_2026 / 1000);
        }
        if (b.spent_2025_carry > 10000000000) {
          b.spent_2025_carry = Math.round(b.spent_2025_carry / 1000);
        }

        const detailYears = {};
        [1, 2, 3, 4, 5].forEach((yr) => {
          if (yr === 2) {
            detailYears[yr] = {
              budget_main: b.budget_2026 || 0,
              spent_main: b.spent_2026 || 0,
              budget_carry: b.budget_2025_carry || 0,
              spent_carry: b.spent_2025_carry || 0
            };
          } else if (yr === 1) {
            const budgetMain = Math.round((b.budget_2026 || 0) * 0.9);
            const spentMain = Math.max(0, budgetMain - (b.budget_2025_carry || 0));
            detailYears[yr] = {
              budget_main: budgetMain,
              spent_main: spentMain,
              budget_carry: 0,
              spent_carry: 0
            };
          } else {
            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
            detailYears[yr] = {
              budget_main: Math.round((b.budget_2026 || 0) * factor),
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0
            };
          }
        });
        recalculateCarryOver(detailYears);
        newBudgetDetails[key] = {
          years: detailYears
        };
      });

      // 3.5. 세부 프로그램(newPrograms)의 비목별 배정 계획을 단위과제 10대 비목(newBudgetDetails)에 쪼개서 강제 롤업 연동
      [1, 2, 3, 4, 5].forEach((yr) => {
        const categorySums = {
          "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
        };

        newPrograms.forEach((prog) => {
          const py = prog.years?.[yr] || {};
          const progTotalMain = py.budget_main || 0;
          const progTotalCarry = py.budget_carry || 0;
          const progTotalSpent = py.spent_main || 0;
          const progTotalSpentCarry = py.spent_carry || 0;

          let allocatedMain = 0;
          let allocatedCarry = 0;
          let allocatedSpent = 0;
          let allocatedSpentCarry = 0;

          if (py.budget_categories && Array.isArray(py.budget_categories)) {
            py.budget_categories.forEach((catItem) => {
              const catName = catItem.category;
              if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                const spentVal = Math.round(catItem.spent || 0);
                const spentCarryVal = Math.round(catItem.spent_carry || 0);

                categorySums[catName].main += mainVal;
                categorySums[catName].carry += carryVal;
                categorySums[catName].spent_main += spentVal;
                categorySums[catName].spent_carry += spentCarryVal;

                allocatedMain += mainVal;
                allocatedCarry += carryVal;
                allocatedSpent += spentVal;
                allocatedSpentCarry += spentCarryVal;
              }
            });
          }

          const remainMain = Math.max(0, progTotalMain - allocatedMain);
          const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
          const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
          const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

          categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
          categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
          categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
          categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
        });

        // 결과 주입
        Object.keys(categorySums).forEach((catName) => {
          if (!newBudgetDetails[catName]) {
            newBudgetDetails[catName] = { years: {} };
          }
          if (!newBudgetDetails[catName].years[yr]) {
            newBudgetDetails[catName].years[yr] = {
              budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
            };
          }
          const tgt = newBudgetDetails[catName].years[yr];
          tgt.budget_main = categorySums[catName].main;
          tgt.budget_carry = categorySums[catName].carry;
          tgt.spent_main = categorySums[catName].spent_main;
          tgt.spent_carry = categorySums[catName].spent_carry;
        });
      });

      // 모든 비목의 이월 잔액 5개년 연쇄 재계산
      Object.keys(newBudgetDetails).forEach((key) => {
        recalculateCarryOver(newBudgetDetails[key].years);
      });

      // 3.6. 롤업된 데이터를 바탕으로 단위과제 전체 연도별(unitYears) 총예산/총집행액 누적합 재집계
      [1, 2, 3, 4, 5].forEach((yr) => {
        unitYears[yr] = {
          budget_main: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0),
          budget_carry: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0),
          spent_main: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0),
          spent_carry: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0)
        };
      });
      recalculateCarryOver(unitYears);

      return {
        ...u,
        years: unitYears,
        programs: newPrograms,
        budgetDetails: newBudgetDetails
      };
    });

    return {
      ...p,
      units: newUnits
    };
  });
}

const getNormalizedKpi = (k, selectedYear) => {
  if (!k) return null;
  if (selectedYear !== 1) return k;

  if (k.id.startsWith("C-")) {
    if (k.id === "C-1") {
      return {
        ...k,
        description: "지자체 대표 프로젝트 및 단위과제들의 종합 연도별 목표치 달성률",
        formula: "\\text{대표과제 달성률(\\%)} = \\frac{\\text{당해연도 대표과제 성과 달성치}}{\\text{당해연도 대표과제 목표 설정치}} \\times 100",
        subItems: [
          {
            id: "C-1-1",
            name: "대표과제 목표 달성 개수",
            unit: "건",
            years: { 1: { target: 5, current: 5 } }
          }
        ]
      };
    } else if (k.id === "C-2") {
      return {
        ...k,
        description: "대학, 산업체, 연구소, 지자체 간의 협약 건수 및 공동 R&BD 유입 실적 증가 비율",
        formula: "\\text{협업 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-2-1",
            name: "지산학연 협력협약 체결 건수",
            unit: "건",
            years: { 1: { target: 45, current: 52 } }
          },
          {
            id: "C-2-2",
            name: "공동 R&BD 및 기술이전 체결액",
            unit: "백만원",
            years: { 1: { target: 800, current: 950 } }
          }
        ]
      };
    } else if (k.id === "C-3") {
      return {
        ...k,
        description: "성인학습자의 직업 능력 제고를 위한 비학위 및 평생직업교육과정 참여생 증가 추이",
        formula: "\\text{성인학습자 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-3-1",
            name: "평생직업교육 비학위과정 이수 인원",
            unit: "명",
            years: { 1: { target: 1500, current: 1680 } }
          }
        ]
      };
    } else if (k.id === "C-4") {
      return {
        ...k,
        description: "졸업생 중 울산광역시 및 인접 동일생활권 내 기업체에 취업하여 정주한 졸업생 증가율",
        formula: "\\text{정주 취업 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-4-1",
            name: "관내 기업체 취업 졸업생 수",
            unit: "명",
            years: { 1: { target: 650, current: 698 } }
          }
        ]
      };
    } else if (k.id === "C-5") {
      return {
        ...k,
        description: "RISE 사업 및 지산학 협력 거버넌스 전반에 대한 시도 내 만족도 조사 향상율",
        formula: "\\text{만족도 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-5-1",
            name: "종합 지산학연 연계 체제 만족도 지수",
            unit: "점",
            years: { 1: { target: 80, current: 82 } }
          }
        ]
      };
    } else if (k.id === "C-6") {
      return {
        ...k,
        description: "대학의 생산 유발 및 고용 창출 등 지역 경제 활성화에 기여한 영향력 성장도",
        formula: "\\text{경제영향력 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-6-1",
            name: "생산 및 고용 유발 파급효과 추정액",
            unit: "억원",
            years: { 1: { target: 1200, current: 1280 } }
          }
        ]
      };
    }
  }

  if (k.id === "L-1") {
    return {
      ...k,
      description: "주류 및 신산업 연계 주문식 교육과정 개발 건수 및 강의 만족도 조사 지표",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 40 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 10",
      subItems: [
        {
          id: "L-1-1",
          name: "지역 맞춤형 교과·비교과 프로그램 개편 건수",
          base: 28,
          unit: "건",
          years: { 1: { target: 28, current: 35 } }
        },
        {
          id: "L-1-2",
          name: "지역 맞춤형 교과·비교과 프로그램 이수 학생 수",
          base: 3500,
          unit: "명",
          years: { 1: { target: 4000, current: 3726 } }
        },
        {
          id: "L-1-3",
          name: "졸업자의 지역 내 취업자 수",
          base: 624,
          unit: "명",
          years: { 1: { target: 624, current: 624 } }
        },
        {
          id: "L-1-4",
          name: "졸업자의 지역 외 취업자 수",
          base: 527,
          unit: "명",
          years: { 1: { target: 527, current: 527 } }
        }
      ]
    };
  }

  if (k.id === "L-2") {
    return {
      ...k,
      description: "이차전지/조선 등 울산 핵심 분야 산업체 현장실습 이수 학생 수 및 만족도",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 20 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 10 + \\frac{\\text{E 실적}}{\\text{E 기준}} \\times 30",
      subItems: [
        {
          id: "L-2-1",
          name: "12주 이상으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 74,
          unit: "명",
          years: { 1: { target: 74, current: 66 } }
        },
        {
          id: "L-2-2",
          name: "8주이상 12주미만으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 27,
          unit: "명",
          years: { 1: { target: 27, current: 26 } }
        },
        {
          id: "L-2-3",
          name: "4주 이상 8주 미만으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 103,
          unit: "명",
          years: { 1: { target: 103, current: 63 } }
        },
        {
          id: "L-2-4",
          name: "4주 이상으로 운영된 일반 현장실습 이수학생 수",
          base: 16,
          unit: "명",
          years: { 1: { target: 20, current: 1005 } }
        },
        {
          id: "L-2-5",
          name: "4주 이상 글로벌 표준 현장실습 학기제 이수학생 수",
          base: 4,
          unit: "명",
          years: { 1: { target: 4, current: 1 } }
        }
      ]
    };
  }

  if (k.id === "L-3") {
    return {
      ...k,
      description: "창업 강좌 개설 건수 및 창업 강좌 이수 학생 수 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        {
          id: "L-3-1",
          name: "창업교육 운영성과지수",
          base: 132,
          unit: "건",
          years: { 1: { target: 132, current: 143 } }
        },
        {
          id: "L-3-2",
          name: "창업교육과정 이수학생 수",
          base: 2300,
          unit: "명",
          years: { 1: { target: 2300, current: 3580 } }
        }
      ]
    };
  }

  if (k.id === "L-4") {
    return {
      ...k,
      description: "학생 및 교원의 창업 프로그램 참가 지원 및 실질 창업 활성화 수준 평가 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10",
      subItems: [
        {
          id: "L-4-1",
          name: "창업지원 프로그램 지원(운영)건수",
          base: 22,
          unit: "건",
          years: { 1: { target: 22, current: 32 } }
        },
        {
          id: "L-4-2",
          name: "학생·교원 창업기업 수",
          base: 1,
          unit: "개사",
          years: { 1: { target: 1, current: 1 } }
        },
        {
          id: "L-4-3",
          name: "학생·교원 창업 매출액",
          base: 0,
          unit: "백만원",
          years: { 1: { target: 0, current: 0 } }
        }
      ]
    };
  }

  if (k.id === "L-5") {
    return {
      ...k,
      description: "산학공동 연구개발 성과의 기업 기술이전 계약 건수 및 로열티(기술료) 창출 실적 평가 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 25 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 25 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 30 + \\frac{\\text{E 실적}}{\\text{E 기준}} \\times 10",
      subItems: [
        { id: "L-5-1", name: "산학연계 기술이전 건수", base: 1, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-2", name: "산학연계 기술이전 수익", base: 500, unit: "원", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-3", name: "산학연계 기술사업화 지원 건수", base: 6, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-4", name: "지식재산권 건수", base: 10, unit: "건", years: { 1: { target: 10, current: 21 } } },
        { id: "L-5-5", name: "논문 게재 수", base: 33, unit: "편", years: { 1: { target: 33, current: 62 } } }
      ]
    };
  }

  if (k.id === "L-6") {
    return {
      ...k,
      description: "대학 인프라 및 교수진을 매칭한 중소·중견기업 대상 기업애로 기술 지원 및 비즈니스 컨설팅 지원 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-6-1", name: "기업애로 해결 기술 지원 수", base: 21, unit: "건", years: { 1: { target: 21, current: 22 } } },
        { id: "L-6-2", name: "기업애로 해결 컨설팅 지원 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-7") {
    return {
      ...k,
      description: "성인학습자 친화형 교육환경 구축 및 평생·직업교육 과정 활성화를 통한 평생학습 기회 보장 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-7-1", name: "평생·직업교육 프로그램 이수자 수", base: 100, unit: "명", years: { 1: { target: 110, current: 375 } } },
        { id: "L-7-2", name: "재학생 중 성인 학습자 수", base: 50, unit: "명", years: { 1: { target: 50, current: 98 } } }
      ]
    };
  }

  if (k.id === "L-8") {
    return {
      ...k,
      description: "평생·직업교육 품질 신뢰도 향상을 위한 교육과정 신개발 및 참여자의 취·창업 지원 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 40",
      subItems: [
        { id: "L-8-1", name: "평생·직업교육 프로그램 개발 및 개편 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 10 } } },
        { id: "L-8-2", name: "대학 성인학습자 고등교육 참여자의 유지취업률", base: 10, unit: "%", years: { 1: { target: 10, current: 0 } } },
        { id: "L-8-3", name: "대학 성인학습자 고등교육 참여자의 취·창업률", base: 14, unit: "%", years: { 1: { target: 14, current: 25.9 } } }
      ]
    };
  }

  if (k.id === "L-9") {
    return {
      ...k,
      description: "지역 밀착형 문제 해결을 위한 리빙랩 및 지자체-대학-산업계 지역 현안 공동 대응 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20",
      subItems: [
        { id: "L-9-1", name: "지역사회 문제를 해결한 프로젝트 건수", base: 7, unit: "건", years: { 1: { target: 7, current: 7 } } },
        { id: "L-9-2", name: "지역사회 문제해결 협의체 운영 건수", base: 5, unit: "명", years: { 1: { target: 5, current: 6 } } },
        { id: "L-9-3", name: "지역사회 문제 해결 프로젝트 참여 기업(기관) 수", base: 6, unit: "명", years: { 1: { target: 6, current: 6 } } }
      ]
    };
  }

  if (k.id === "L-10") {
    return {
      ...k,
      description: "대학 보건·안전·문화 인프라를 활용한 취약계층 돌봄 및 사회공헌 프로그램 활성화 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-10-1", name: "대학 특화분야 연계 사회공헌활동 참여 인원", base: 30, unit: "명", years: { 1: { target: 30, current: 34 } } },
        { id: "L-10-2", name: "지역사회 내 행사 봉사활동 참여 인원", base: 100, unit: "명", years: { 1: { target: 100, current: 164 } } }
      ]
    };
  }

  if (k.id === "L-11") {
    return {
      ...k,
      description: "재난 및 산업안전 분야 예방 관련 산학협력 안전기술 지도 및 재난안전 확산 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 40 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 30",
      subItems: [
        { id: "L-11-1", name: "재난 및 산업안전 관련 안전기술 지원 건수 (기준값: 3)", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } },
        { id: "L-11-2", name: "재난 및 산업안전 관련 연구 및 시스템(S/W, 콘텐츠) 개발 활용 건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } },
        { id: "L-11-3", name: "재난 및 산업안전 확산 활동 건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-12") {
    return {
      ...k,
      name: "재난 및 산업안전 교육성과 종합지수",
      description: "지역 밀착형 재난안전 교육프로그램 신규 개발 및 전문 교육 이수, 관련 자격 취득 활성화 종합 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 20 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 20",
      subItems: [
        { id: "L-12-1", name: "재난 및 산업안전 관련 교육프로그램 개편건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } },
        { id: "L-12-2", name: "재난 및 산업안전 관련 교육프로그램 이수자수 (기준값: 150)", base: 150, unit: "명", years: { 1: { target: 150, current: 168 } } },
        { id: "L-12-3", name: "재난 및 산업안전 관련 교육프로그램 이수자 자격증 취득건수 (기준값: 25)", base: 25, unit: "건", years: { 1: { target: 25, current: 31 } } },
        { id: "L-12-4", name: "재난 및 산업안전 관련 교육프로그램 산업현장 적용 기업수 (기준값: 4)", base: 4, unit: "개", years: { 1: { target: 5, current: 5 } } }
      ]
    };
  }

  if (k.id === "L-13") {
    return {
      ...k,
      description: "스마트 제조 및 미래 신산업 전환을 대비한 지역 산업 연계 AI·DX 핵심 인재 양성 교육프로그램 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 70",
      subItems: [
        { id: "L-13-1", name: "AI·DX 관련 교육프로그램 개발 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 4 } } },
        { id: "L-13-2", name: "AI·DX 관련 교육프로그램 이수자 수", base: 300, unit: "명", years: { 1: { target: 300, current: 360 } } }
      ]
    };
  }

  if (k.id === "L-14") {
    return {
      ...k,
      name: "AI·DX 기술혁신 확산지수",
      description: "중소·중견 제조기업의 스마트화 지원을 위한 AI·DX 연계 밀착형 기술지도 및 융합컨설팅 지원 확산지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-14-1", name: "AI·DX 관련 기술지원 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } },
        { id: "L-14-2", name: "AI·DX 관련 자문·컨설팅 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 17 } } }
      ]
    };
  }

  if (k.id === "L-15") {
    return {
      ...k,
      description: "탄소중립 및 친환경 ESG 핵심 가치 확산을 위한 전공·비전공 학생 대상 ESG 전문 인력 육성 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-15-1", name: "ESG 전문인력 양성프로그램 이수자 수", base: 100, unit: "명", years: { 1: { target: 100, current: 146 } } },
        { id: "L-15-2", name: "ESG 경영개선 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } }
      ]
    };
  }

  if (k.id === "L-16") {
    return {
      ...k,
      description: "지역 중소기업의 저탄소 공정 전환 지원 및 친환경 탄소중립 실천 문화 정착 기여 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-16-1", name: "탄소중립 프로그램 운영 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 4 } } },
        { id: "L-16-2", name: "탄소배출 경영개선 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } }
      ]
    };
  }

  if (k.id === "L-17") {
    return {
      ...k,
      description: "지역 보건·의료 분야 정주 인력 확보를 위한 전공 학생 대상 전문 취업 역량 및 지역 정착 지원지수",
      formula: "1차년도 미개설 지표 (0%)",
      subItems: []
    };
  }

  if (k.id === "L-18") {
    return {
      ...k,
      description: "취약계층의 만성질환 예방 및 만성병 환자의 체계적 자가 관리를 돕는 디지털 모니터링 수혜지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-18-1", name: "사회적약자 의료케어를 위한 전문인력 양성 인원 수", base: 110, unit: "명", years: { 1: { target: 110, current: 208 } } },
        { id: "L-18-2", name: "사회적약자 건강모니터링 지원 인원 수", base: 70, unit: "명", years: { 1: { target: 70, current: 87 } } }
      ]
    };
  }

  if (k.id === "L-19") {
    return {
      ...k,
      name: "늘봄학교 및 온동네 돌봄 교사 양성 프로그램 운영성과 지수",
      description: "울산형 온동네 초등 돌봄 교사 및 방과후 프로그램 연수를 통한 아동 돌봄 전문 인력 공급 양성 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-19-1", name: "늘봄/방과후 교사 양성 프로그램 수", base: 5, unit: "건", years: { 1: { target: 5, current: 11 } } },
        { id: "L-19-2", name: "늘봄/방과후 교사 양성 수", base: 100, unit: "명", years: { 1: { target: 100, current: 134 } } }
      ]
    };
  }

  if (k.id === "L-20") {
    return {
      ...k,
      name: "돌봄 및 체험 프로그램 운영 활성화 지수",
      description: "지역 영유아 및 초등학생을 위한 창의 융합 체험 프로그램 다각화 및 이용 수혜 실적 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-20-1", name: "돌봄 및 체험 프로그램 수", base: 10, unit: "건", years: { 1: { target: 10, current: 14 } } },
        { id: "L-20-2", name: "돌봄 및 체험 프로그램 이용자 수", base: 40, unit: "명", years: { 1: { target: 40, current: 69 } } }
      ]
    };
  }

  if (k.id === "L-21") {
    return {
      ...k,
      description: "도시 쇠퇴지역 공간 혁신 및 청년 창작 생태계 기반 조성을 위한 공간 재생 및 거버넌스 구축 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-21-1", name: "도시공간 재생프로젝트 운영 건수", base: 2, unit: "건", years: { 1: { target: 2, current: 2 } } },
        { id: "L-21-2", name: "도시공간 재생프로젝트 네트워크 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-22") {
    return {
      ...k,
      description: "지역 고유 문화 자원 기반 청년 창작 콘텐츠 신규 개발 및 축제 활성화를 통한 관내 수혜 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-22-1", name: "문화 콘텐츠 개발 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 2 } } },
        { id: "L-22-2", name: "문화 콘텐츠 개발 프로젝트 참여 인원", base: 40, unit: "명", years: { 1: { target: 40, current: 60 } } }
      ]
    };
  }

  if (k.id === "L-23") {
    return {
      ...k,
      description: "대학의 글로벌 학술 평판 제고 및 국제 공동 연구·교류 활성화를 통한 해외 우수 기관과의 파트너십 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 20 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 50",
      subItems: [
        { id: "L-23-1", name: "국제공동 연구 건수", base: 0, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-23-2", name: "국제공동 협력 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 5 } } },
        { id: "L-23-3", name: "해외교류 프로그램 참여인원 수", base: 53, unit: "명", years: { 1: { target: 53, current: 100 } } }
      ]
    };
  }

  if (k.id === "L-24") {
    return {
      ...k,
      name: "글로벌 인재유치 및 정착 지원지수",
      description: "외국인 유학생 유치 다각화 및 안정적인 주거·학습·취업 전주기 밀착 케어 서비스 활성화 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 60 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 20 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20",
      subItems: [
        { id: "L-24-1", name: "국제학생 유치 인원수", base: 190, unit: "명", years: { 1: { target: 190, current: 295 } } },
        { id: "L-24-2", name: "국제학생 정착 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 2 } } },
        { id: "L-24-3", name: "외국인 근로자 정착 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 0 } } }
      ]
    };
  }

  return k;
};

// 월별 추진일정 상세 대조 렌더러
const renderTimelineDiff = (timelineStr) => {
  const parts = (timelineStr || "").split(",").map(p => p.trim());
  const months = ["25.3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", "26.1월", "2월"];

  const getStatusColor = (v) => {
    if (!v || typeof v !== "string") return "transparent";
    if (v.startsWith("P/D")) return "#1e3a8a";
    if (v.startsWith("D/C")) return "#064e3b";
    if (v.startsWith("C/A")) return "#78350f";
    if (v.startsWith("P")) return "#2563eb";
    if (v.startsWith("D")) return "#10b981";
    if (v.startsWith("C")) return "#f59e0b";
    if (v.startsWith("A")) return "#d946ef";
    return "transparent";
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.15rem", marginTop: "0.4rem", width: "100%", maxWidth: "360px" }}>
      {months.map((m, idx) => {
        const val = parts[idx] || "";
        const bg = getStatusColor(val);
        const hasValue = val && val !== "-";
        
        return (
          <div key={idx} style={{ textAlign: "center", minWidth: "25px" }}>
            {/* 윗줄: 월 표시 */}
            <div style={{ fontSize: "0.55rem", color: "var(--text-secondary)", marginBottom: "0.12rem", whiteSpace: "nowrap" }}>
              {m}
            </div>
            {/* 아랫줄: P, D, C, A 일정 표기 */}
            <div 
              style={{
                padding: "0.08rem 0",
                fontSize: "0.58rem",
                background: bg !== "transparent" ? bg : "rgba(255,255,255,0.02)",
                color: bg !== "transparent" ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "3px",
                fontWeight: bg !== "transparent" ? "800" : "normal",
                minHeight: "0.88rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {hasValue ? val : "-"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 비목별 예산 배정 상세 대조 렌더러
const renderBudgetCategoriesDiff = (categories) => {
  const validList = (categories || []).filter(c => c.category);
  if (validList.length === 0) {
    return <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>등록된 비목별 예산이 없습니다.</div>;
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem", marginTop: "0.3rem" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
          <th style={{ textAlign: "left", padding: "0.2rem" }}>비목명</th>
          <th style={{ textAlign: "right", padding: "0.2rem" }}>본예산</th>
          <th style={{ textAlign: "right", padding: "0.2rem" }}>이월예산</th>
        </tr>
      </thead>
      <tbody>
        {validList.map((c, idx) => (
          <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
            <td style={{ padding: "0.2rem", color: "var(--text-primary)" }}>{c.category}</td>
            <td style={{ textAlign: "right", padding: "0.2rem", color: "var(--text-primary)" }}>{c.budget ? (parseFloat(c.budget) / 1000000).toFixed(1) + "백만원" : "-"}</td>
            <td style={{ textAlign: "right", padding: "0.2rem", color: "var(--text-primary)" }}>{c.budget_carry ? (parseFloat(c.budget_carry) / 1000000).toFixed(1) + "백만원" : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function App() {
  // [이전 캐시 자동 청소 로직]
  // 구버전 캐시(v1~v19 등)가 쌓여 QuotaExceededError(용량 초과)를 내는 현상을 원천 방지하기 위해 v20 이외의 옛날 데이터를 즉시 제거합니다.
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("anchor_projects_data_") && key !== "anchor_projects_data_v20") {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("구버전 캐시 청소 실패:", e);
    }
  }, []);

  // [전역 자가 치유 에러 핸들러]
  // 캐시 오염 등으로 렌더링 에러가 날 경우, 화이트스크린 방지를 위해 로컬 세션을 비우고 클린 샌드박스로 자동 복원합니다.
  useEffect(() => {
    const handleGlobalError = (event) => {
      // 비동기 API 통신 오류(unhandledrejection)는 렌더링 화이트스크린 유발 주범이 아니므로 자가치유에서 전면 제외
      if (event.type === "unhandledrejection") {
        return;
      }

      const err = event.error;
      if (!err) return;
      
      const errMsg = String(err.message || err);
      
      // 렌더링을 완전히 멈추게 만드는 치명적인 자바스크립트 오류(TypeError, undefined/null 속성 에러 등)만 선별합니다.
      const isCriticalRenderError = 
        errMsg.includes("TypeError") || 
        errMsg.includes("Cannot read properties") || 
        errMsg.includes("undefined") || 
        errMsg.includes("null") ||
        errMsg.includes("is not a function");
        
      // Supabase 통신, DB 쿼리, RLS 정책, 네트워크 연결 실패 등의 에러 메시지는 자가치유 튕김 대상에서 완벽히 배제
      const isNetworkOrDbError =
        errMsg.includes("PostgrestError") ||
        errMsg.includes("supabase") ||
        errMsg.includes("FetchError") ||
        errMsg.includes("NetworkError") ||
        errMsg.includes("Failed to fetch") ||
        errMsg.includes("constraint") ||
        errMsg.includes("violation") ||
        errMsg.includes("violates") ||
        errMsg.includes("not-null") ||
        errMsg.includes("database") ||
        errMsg.includes("query") ||
        errMsg.includes("RLS") ||
        errMsg.includes("policy");

      if (!isCriticalRenderError || isNetworkOrDbError) {
        return; // API 요청 실패, CORS, 406 에러 등의 네트워크 지연/차단 오류는 자가치유 리로드를 타지 않고 넘어갑니다.
      }

      console.error("Critical rendering error caught by Self-Healing. Resetting cache:", errMsg);
      const lastReset = localStorage.getItem("anchor_last_self_healing_reset");
      const now = Date.now();
      if (lastReset && now - parseInt(lastReset, 10) < 3000) {
        return;
      }
      localStorage.setItem("anchor_last_self_healing_reset", String(now));
      // 로그인 세션(anchor_logged_in_user)은 리셋하지 않고 보존하여 튕김(로그아웃) 방지!
      localStorage.removeItem("anchor_projects_data_v25");
      localStorage.removeItem("anchor_selected_kpi");
      window.location.reload();
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleGlobalError);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleGlobalError);
    };
  }, []);

  const [isScrollRestored, setIsScrollRestored] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const sessionUser = localStorage.getItem("anchor_logged_in_user");
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed && parsed.role && typeof parsed.role === "object" && parsed.role.id) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const isSongDirector = currentUser && (
    (currentUser.name || "").includes("송경영") ||
    currentUser.role_key === "DIRECTOR" ||
    currentUser.role_key === "TEAM_LEADER" ||
    currentUser.role_key === "ADMIN" ||
    currentUser.role === "사업단장" ||
    currentUser.role === "운영팀장" ||
    currentUser.id === "director" ||
    currentUser.id === "manager"
  );

  const [menuVisibility, setMenuVisibility] = useState(() => {
    const cached = localStorage.getItem("anchor_menu_visibility");
    const defaultVisibility = {
      dashboard: true,
      progress: true,
      progress_status: true,
      major_programs: true,
      satisfaction_survey: true,
      projects: true,
      unit_status: true,
      unit_system: true,
      program_mgmt: true,
      kpis: true,
      kpi_status: true,
      kpi_self: true,
      kpi_focus: true,
      budget: true,
      settlement: true,
      execution: true,
      procurement: true,
      env_improvement: true,
      equipment_purchase: true,
      major_services: true,
      agreements: true,
      unified_certificates: true,
      schedule: true,
      monthly: true,
      events: true,
      meetings: true,
      committees: true,
      press: true,
      management: true,
      approvals: true,
      members: true,
      users: true,
      programs: true,
      org_chart: true,
      partners: true
    };

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // 캐시 오염 복구: 기존 캐시 객체 내에 projects 키가 없거나 false 일 시 강제로 true 복구 적용
        if (parsed.projects === undefined || parsed.projects === false) {
          parsed.projects = true;
          parsed.unit_status = true;
          parsed.unit_system = true;
          parsed.program_mgmt = true;
        }
        return { ...defaultVisibility, ...parsed };
      } catch (e) {
        return defaultVisibility;
      }
    }
    return defaultVisibility;
  });

  const handleSaveMenuVisibility = async (nextVisibility) => {
    setMenuVisibility(nextVisibility);
    localStorage.setItem("anchor_menu_visibility", JSON.stringify(nextVisibility));

    // Supabase DB에 설정 저장 동기화
    try {
      const { error } = await supabase
        .from("portal_configs")
        .upsert({
          key: "menu_visibility",
          value: nextVisibility,
          updated_at: new Date().toISOString()
        });
      if (error) {
        console.error("Failed to save portal config to DB:", error);
      }
    } catch (err) {
      console.error("DB save error:", err);
    }
  };

  // 로그인 성공 혹은 세션 로드 시 Supabase DB로부터 마스터 포털 노출 설정 수신
  useEffect(() => {
    const fetchPortalConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("portal_configs")
          .select("value")
          .eq("key", "menu_visibility")
          .maybeSingle();

        if (!error && data && data.value) {
          setMenuVisibility(data.value);
          localStorage.setItem("anchor_menu_visibility", JSON.stringify(data.value));
        }
      } catch (err) {
        console.error("Failed to fetch portal config from DB:", err);
      }
    };

    if (currentUser) {
      fetchPortalConfig();
    }
  }, [currentUser]);

  const [projects, setProjects] = useState(() => {
    // 2차년도 세부 프로그램 ID 및 예산 데이터를 PDF 실증 데이터로 정밀 동기화하기 위해 로컬스토리지 버전을 v29로 업그레이드합니다.
    const cached = localStorage.getItem("anchor_projects_data_v29");
    if (cached) {
      try {
        const loaded = migrateProgramIds(JSON.parse(cached));
        const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));
        // [자동 동기화] mockData.js의 initialProjectsData로부터 각 과제의 최신 프로그램 목록을 조회하여 캐시 데이터와 머지합니다.
        loaded.forEach((strategy) => {
          strategy.units.forEach((unit) => {
            const sourceUnit = multiYearInitialData
              ?.flatMap(s => s.units)
              ?.find(u => u.id === unit.id);
              
            if (sourceUnit && sourceUnit.programs) {
              const mergedPrograms = sourceUnit.programs.map((sourceProg) => {
                const cachedProg = unit.programs?.find(cp => cp.id === sourceProg.id);
                if (cachedProg) {
                  const updatedYears = { ...cachedProg.years };

                  // 5개년에 대한 예산 및 집행액 정합성 복원 루프
                  [1, 2, 3, 4, 5].forEach((yr) => {
                    if (updatedYears[yr]) {
                      // 소스에 해당 연도가 아예 기획되지 않은 프로그램이라면 캐시 오염을 막기 위해 제거
                      if (!sourceProg.years || !sourceProg.years[yr]) {
                        delete updatedYears[yr];
                        return;
                      }
                      const y = updatedYears[yr];
                      
                      // 1. 입력한 예산(세부 재원: 국고 + 시비)이 있는지 확인
                      const inputBudgetSum = (y.budget_national || 0) + (y.budget_city || 0);
                      
                      if (inputBudgetSum > 0) {
                        // 사용자가 세부 재원 예산을 하나라도 입력했다면, 그 합산을 본예산(budget_main)으로 동기화 (입력 예산 우선 원칙, 외부사업비 제외)
                        y.budget_main = inputBudgetSum;
                      } else {
                        // 입력된 세부 예산이 없는 경우, 기존 sourceProg를 기준으로 본예산 기본값을 계산
                        let defaultBudgetMain = 0;
                        let defaultNational = 0;
                        let defaultCity = 0;
                        let defaultExternal = 0;
                        
                        let defaultSpentMain = 0;
                        let defaultSpentNational = 0;
                        let defaultSpentCity = 0;
                        let defaultSpentExternal = 0;

                        if (sourceProg.years && sourceProg.years[yr]) {
                          const sy = sourceProg.years[yr];
                          defaultBudgetMain = (sy.budget_national || 0) + (sy.budget_city || 0);
                          defaultNational = sy.budget_national || 0;
                          defaultCity = sy.budget_city || 0;
                          defaultExternal = sy.budget_external || 0;
                          
                          defaultSpentMain = (sy.spent_national || 0) + (sy.spent_city || 0);
                          defaultSpentNational = sy.spent_national || 0;
                          defaultSpentCity = sy.spent_city || 0;
                          defaultSpentExternal = sy.spent_external || 0;
                        } else {
                          // 기존 fallback
                          const rawBudgetMain = yr === 2 ? (sourceProg.budget_2026 || 0) : yr === 1 ? Math.round((sourceProg.budget_2026 || 0) * 0.9) : Math.round((sourceProg.budget_2026 || 0) * (yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3));
                          const isExternalSub = sourceProg.id.endsWith("-2") || sourceProg.id.includes("위탁") || sourceProg.title.includes("위탁") || sourceProg.title.includes("협력");
                          if (isExternalSub) {
                            defaultExternal = rawBudgetMain;
                            defaultNational = 0;
                            defaultCity = 0;
                          } else {
                            defaultNational = Math.round(rawBudgetMain * 0.5);
                            defaultCity = rawBudgetMain - defaultNational;
                            defaultExternal = 0;
                          }
                          defaultBudgetMain = defaultNational + defaultCity;
                        }
                        
                        y.budget_main = defaultBudgetMain;
                        y.budget_national = defaultNational;
                        y.budget_city = defaultCity;
                        y.budget_external = defaultExternal;
                        
                        y.spent_main = defaultSpentMain;
                        y.spent_national = defaultSpentNational;
                        y.spent_city = defaultSpentCity;
                        y.spent_external = defaultSpentExternal;
                      }

                      // 2. 이월예산도 세부 이월예산(국고 + 시비)의 합산으로 동기화 (1차년도는 이월이 없으므로 강제 0원, 외부사업비 제외)
                      if (yr === 1) {
                        y.budget_carry_national = 0;
                        y.budget_carry_city = 0;
                        y.budget_carry_external = 0;
                        y.budget_carry = 0;
                      } else {
                        y.budget_carry = (y.budget_carry_national || 0) + (y.budget_carry_city || 0);
                      }

                      // 3. 본집행액도 세부 집행액(국고 + 시비)의 합으로 실시간 동기화 (외부사업비 제외)
                      y.spent_main = (y.spent_national || 0) + (y.spent_city || 0);

                      // 4. 이월집행액도 세부 이월집행액(국고 + 시비)의 합으로 동기화 (1차년도는 0원, 외부사업비 제외)
                      if (yr === 1) {
                        y.spent_carry_national = 0;
                        y.spent_carry_city = 0;
                        y.spent_carry_external = 0;
                        y.spent_carry = 0;
                      } else {
                        y.spent_carry = (y.spent_carry_national || 0) + (y.spent_carry_city || 0);
                      }

                      // 5. 비목 카테고리 예산 오버플로우 보정 (기존 복원 로직)
                      if (y.budget_categories && Array.isArray(y.budget_categories)) {
                        y.budget_categories.forEach((cat) => {
                          const catBudget = parseInt(String(cat.budget || "0").replace(/,/g, ""), 10) || 0;
                          if (catBudget > 10000000000) {
                            cat.budget = Math.round(catBudget / 1000);
                          }
                          const catCarry = parseInt(String(cat.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                          if (catCarry > 10000000000) {
                            cat.budget_carry = Math.round(catCarry / 1000);
                          }
                          const catSpent = parseInt(String(cat.spent || "0").replace(/,/g, ""), 10) || 0;
                          if (catSpent > 10000000000) {
                            cat.spent = Math.round(catSpent / 1000);
                          }
                          const catSpentCarry = parseInt(String(cat.spent_carry || "0").replace(/,/g, ""), 10) || 0;
                          if (catSpentCarry > 10000000000) {
                            cat.spent_carry = Math.round(catSpentCarry / 1000);
                          }
                        });
                      }
                    }
                  });

                  // 6. 프로그램 최상위 레거시 예산/집행 필드도 2차년도 기준으로 완벽하게 강제 동기화
                  const currentYearBudgetMain = updatedYears[2]?.budget_main || 0;
                  const currentYearBudgetCarry = updatedYears[2]?.budget_carry || 0;
                  const currentYearSpentMain = updatedYears[2]?.spent_main || 0;
                  const currentYearSpentCarry = updatedYears[2]?.spent_carry || 0;

                  return {
                    ...sourceProg,
                    pdca: cachedProg.pdca || sourceProg.pdca,
                    timeline: cachedProg.timeline || sourceProg.timeline,
                    actual_timeline: cachedProg.actual_timeline || sourceProg.actual_timeline,
                    actualFrequency: cachedProg.actualFrequency !== undefined ? cachedProg.actualFrequency : sourceProg.actualFrequency,
                    achieveRate: cachedProg.achieveRate !== undefined ? cachedProg.achieveRate : sourceProg.achieveRate,
                    targetAudience: cachedProg.targetAudience || sourceProg.targetAudience,
                    coopDept: cachedProg.coopDept || sourceProg.coopDept,
                    target_participants: cachedProg.target_participants !== undefined ? cachedProg.target_participants : sourceProg.target_participants,
                    target_developments: cachedProg.target_developments !== undefined ? cachedProg.target_developments : sourceProg.target_developments,
                    target_etc: cachedProg.target_etc !== undefined ? cachedProg.target_etc : sourceProg.target_etc,
                    target_participants_unit: cachedProg.target_participants_unit || sourceProg.target_participants_unit || "명",
                    target_developments_unit: cachedProg.target_developments_unit || sourceProg.target_developments_unit || "건",
                    target_etc_unit: cachedProg.target_etc_unit || sourceProg.target_etc_unit || "개",
                    target_participants_name: cachedProg.target_participants_name || sourceProg.target_participants_name || "참여인원",
                    target_developments_name: cachedProg.target_developments_name || sourceProg.target_developments_name || "개발수",
                    target_etc_name: cachedProg.target_etc_name || sourceProg.target_etc_name || "기타",
                    kpi_type: cachedProg.kpi_type || sourceProg.kpi_type,
                    kpi_link: cachedProg.kpi_link || sourceProg.kpi_link,
                    participants: cachedProg.participants !== undefined ? cachedProg.participants : sourceProg.participants,
                    satisfaction: (cachedProg.satisfaction && cachedProg.satisfaction > 0) ? cachedProg.satisfaction : sourceProg.satisfaction,
                    achievements: (cachedProg.achievements && cachedProg.achievements.trim() !== "") ? cachedProg.achievements : sourceProg.achievements,
                    evalType: (cachedProg.evalType && cachedProg.evalType.trim() !== "") ? cachedProg.evalType : sourceProg.evalType,
                    excellent: (cachedProg.excellent && cachedProg.excellent.trim() !== "") ? cachedProg.excellent : sourceProg.excellent,
                    improvePlan: (cachedProg.improvePlan && cachedProg.improvePlan.trim() !== "") ? cachedProg.improvePlan : sourceProg.improvePlan,
                    deficiency: cachedProg.deficiency || sourceProg.deficiency,
                    actionItem: cachedProg.actionItem || sourceProg.actionItem,
                    assignee: cachedProg.assignee !== undefined ? cachedProg.assignee : sourceProg.assignee,
                    
                    // 레거시 필드 롤업
                    budget_2026: currentYearBudgetMain,
                    budget_2025_carry: currentYearBudgetCarry,
                    budget: currentYearBudgetMain + currentYearBudgetCarry,
                    spent_2026: currentYearSpentMain,
                    spent_2025_carry: currentYearSpentCarry,
                    spent: currentYearSpentMain + currentYearSpentCarry,
                    years: updatedYears
                  };
                }
                return sourceProg;
              });
              unit.programs = mergedPrograms;
              unit.kpis = sourceUnit.kpis || []; // [성과 동기화] mockData.js의 1차년도 등 최신 KPI 실적 데이터를 캐시와 강제 동기화
              
              if (unit.id === "A1나" || unit.id === "A1가") {
                unit.budget = sourceUnit.budget;
                unit.spent = sourceUnit.spent;
                unit.budget_2026 = sourceUnit.budget_2026;
                unit.spent_2026 = sourceUnit.spent_2026;
                unit.budget_2025_carry = sourceUnit.budget_2025_carry || 0;
                unit.spent_2025_carry = sourceUnit.spent_2025_carry || 0;
              }
            }
          });
        });
        
        // 캐시 데이터가 존재해도 최신 5개년 프로그램 기획 예산을 단위과제 비목 및 통계로 강제 롤업 싱크
        loaded.forEach((p) => {
          p.units.forEach((u) => {
            if (u.budgetDetails) {
              [1, 2, 3, 4, 5].forEach((yr) => {
                const categorySums = {
                  "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
                };

                u.programs.forEach(prog => {
                  const py = prog.years?.[yr] || {};
                  const progTotalMain = py.budget_main || 0;
                  const progTotalCarry = py.budget_carry || 0;
                  const progTotalSpent = py.spent_main || 0;
                  const progTotalSpentCarry = py.spent_carry || 0;

                  let allocatedMain = 0;
                  let allocatedCarry = 0;
                  let allocatedSpent = 0;
                  let allocatedSpentCarry = 0;

                  if (py.budget_categories && Array.isArray(py.budget_categories)) {
                    py.budget_categories.forEach(catItem => {
                      const catName = catItem.category;
                      if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                        const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                        const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                        const spentVal = Math.round(catItem.spent || 0);
                        const spentCarryVal = Math.round(catItem.spent_carry || 0);

                        categorySums[catName].main += mainVal;
                        categorySums[catName].carry += carryVal;
                        categorySums[catName].spent_main += spentVal;
                        categorySums[catName].spent_carry += spentCarryVal;

                        allocatedMain += mainVal;
                        allocatedCarry += carryVal;
                        allocatedSpent += spentVal;
                        allocatedSpentCarry += spentCarryVal;
                      }
                    });
                  }

                  const remainMain = Math.max(0, progTotalMain - allocatedMain);
                  const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                  const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                  const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                  categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
                  categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
                  categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
                  categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
                });

                Object.keys(categorySums).forEach(catName => {
                  if (!u.budgetDetails[catName]) {
                    u.budgetDetails[catName] = { years: {} };
                  }
                  if (!u.budgetDetails[catName].years[yr]) {
                    u.budgetDetails[catName].years[yr] = {
                      budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                    };
                  }
                  const tgt = u.budgetDetails[catName].years[yr];
                  tgt.budget_main = categorySums[catName].main;
                  tgt.budget_carry = categorySums[catName].carry;
                  tgt.spent_main = categorySums[catName].spent_main;
                  tgt.spent_carry = categorySums[catName].spent_carry;
                });
              });

              Object.keys(u.budgetDetails).forEach(key => {
                recalculateCarryOver(u.budgetDetails[key].years);
              });
            }

            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 계산
            [1, 2, 3, 4, 5].forEach((yr) => {
              if (!u.years[yr]) u.years[yr] = {};
              u.years[yr].spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              u.years[yr].spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              u.years[yr].budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              u.years[yr].budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);
          });
        });
        return loaded;
      } catch (e) {
        console.error("Failed to parse cached projects data:", e);
      }
    }
    return formatDataToMultiYear(initialProjectsData);
  });
  const [activeTab, setActiveTab] = useState(() => {
    // 💡 URL 패스가 /sv/로 시작하면 설문 응답 모드로 즉시 기동 (SPA 라우터 폴백 대응)
    if (window.location.pathname.startsWith("/sv/")) {
      return "survey_respond";
    }
    return localStorage.getItem("anchor_active_tab") || "dashboard";
  });

  // 결재 변경 승인요청 상태 및 상세 보기 모달 제어용
  const [versionRequests, setVersionRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("anchor_dark_mode");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("anchor_active_tab", activeTab);
  }, [activeTab]);

  // 사업단 구성원 관리 및 서브탭 상태 (첫 기동 시 즉각 화면 출력을 보장하기 위해 로컬 캐시를 초기값으로 지탱)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("anchor_members");
    const initialList = INITIAL_MEMBERS.map((m) => ({
      ...m,
      startDate: m.startDate || m.hireDate || "2026-03-01",
      endDate: m.endDate || "",
      status: m.status || "참여중"
    }));

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 로컬스토리지에 홍진숙 교수(cshong@uc.ac.kr)가 존재할 경우 위치를 홍광표 교수(gphong@uc.ac.kr) 바로 다음으로 재정렬 이동
        const hongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "cshong@uc.ac.kr");
        if (hongIdx !== -1) {
          const hongObj = parsed[hongIdx];
          parsed.splice(hongIdx, 1);
          const gphongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "gphong@uc.ac.kr");
          if (gphongIdx !== -1) {
            parsed.splice(gphongIdx + 1, 0, hongObj);
          } else {
            parsed.push(hongObj);
          }
        } else {
          const hongObj = initialList.find(m => m.email === "cshong@uc.ac.kr");
          if (hongObj) {
            const gphongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "gphong@uc.ac.kr");
            if (gphongIdx !== -1) {
              parsed.splice(gphongIdx + 1, 0, hongObj);
            } else {
              parsed.push(hongObj);
            }
          }
        }

        return parsed.map((m) => {
          let currentGrade = m.grade || "연구원";
          if (currentGrade === "전임 교수") currentGrade = "정교수";
          if (currentGrade === "행정 부장") currentGrade = "부장";
          return {
            ...m,
            dept: m.dept === "미배정" ? "-" : m.dept,
            grade: currentGrade,
            startDate: m.startDate || m.hireDate || "2026-03-01",
            endDate: m.endDate || "",
            status: m.status === "재직중" ? "참여중" : (m.status === "퇴직" ? "미참여" : (m.status || "참여중"))
          };
        });
      } catch (e) {
        console.error("Failed to parse saved members:", e);
      }
    }
    return initialList;
  });

  // 선택된 연차(selectedYear) 및 계약 기간(startDate/endDate)을 고려한 실시간 참여 상태 계산 함수
  const getMemberStatusForYear = (m, year) => {
    if (!m) return "미참여";
    const sDate = m.startDate || m.hireDate || "2026-03-01";
    const eDate = m.endDate || "";

    let termStart = "2025-01-01";
    let termEnd = "2026-02-28";

    if (year === 2) {
      termStart = "2026-03-01";
      termEnd = "2027-02-28";
    } else if (year === 3) {
      termStart = "2027-03-01";
      termEnd = "2028-02-29";
    } else if (year === 4) {
      termStart = "2028-03-01";
      termEnd = "2029-02-28";
    } else if (year === 5) {
      termStart = "2029-03-01";
      termEnd = "2030-02-28";
    }

    // 시작일 조건: 해당 연차의 종료일(termEnd) 이전에 시작했어야 함
    const isStarted = sDate <= termEnd;
    // 종료일 조건: 종료일(endDate) 정보가 없거나, 혹은 해당 연차의 시작일(termStart)보다 크거나 같아야 함
    const isNotEnded = !eDate || eDate >= termStart;

    // 오로지 날짜 범위 조건(계약 기간)만을 기준으로 동적으로 판별함
    if (isStarted && isNotEnded) {
      return "참여중";
    }
    return "미참여";
  };

  // Supabase DB 저장 스키마 필드 전용 객체 정제(Sanitize) 함수
  // (PostgreSQL 테이블에 부재하는 'hireDate' 등의 컬럼이 전송되면 구문 오류가 나는 현상을 원천 방지)
  const sanitizeMemberForDb = (m) => {
    if (!m) return null;
    return {
      id: m.id,
      name: m.name || "",
      role: m.role || "연구원",
      grade: m.grade || "연구원",
      dept: m.dept || "-",
      phoneOffice: m.phoneOffice || null,
      phoneMobile: m.phoneMobile || null,
      email: m.email || null,
      room: m.room || null,
      startDate: m.startDate || m.hireDate || "2026-03-01",
      endDate: m.endDate || null,
      status: m.status === "재직중" ? "참여중" : (m.status === "퇴직" ? "미참여" : (m.status || "참여중"))
    };
  };

  // Supabase 원격 rise_members 테이블에서 구성원 주소록 실시간 동기화 및 자가 치유 시딩 로드
  useEffect(() => {
    // 비로그인 상태이거나 GUEST 권한일 때는 조회를 생략합니다. (401 RLS 방지)
    if (!currentUser || currentRole?.id === "GUEST") return;

    const fetchDbMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("rise_members")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // DB 테이블에 데이터가 정상 적재되어 있는 경우 최우선 동기화 적용
          // 기존 구버전 상태값("재직중", "퇴직")을 "참여중", "미참여"로 자가 보정 매핑 로드
          const formatted = data.map((m) => ({
            ...m,
            status: m.status === "재직중" ? "참여중" : (m.status === "퇴직" ? "미참여" : (m.status || "참여중"))
          }));
          setMembers(formatted);
        } else {
          // DB 테이블은 존재하나 데이터가 비어있을 시 최초 시드 업서트 기동
          console.log("Supabase members empty. Seeding initial data...");
          const cleanedSeed = INITIAL_MEMBERS.map((m) => sanitizeMemberForDb({
            ...m,
            startDate: m.startDate || m.hireDate || "2026-03-01",
            endDate: m.endDate || "",
            status: m.status || "참여중"
          }));

          const { error: seedError } = await supabase
            .from("rise_members")
            .upsert(cleanedSeed);

          if (!seedError) {
            setMembers(cleanedSeed);
          } else {
            console.error("Seeding initial members failed:", seedError);
          }
        }
      } catch (err) {
        console.error("Supabase rise_members table sync failed, fallback to localStorage cache:", err);
        const saved = localStorage.getItem("anchor_members");
        if (saved) {
          try {
            setMembers(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to restore members from localStorage:", e);
          }
        }
      }
    };

    fetchDbMembers();
  }, [currentUser]);

  // members 로컬 상태 갱신 시 로컬스토리지 보조 백업 (네트워크 지연 시 즉시 피드백 및 영속성 보장)
  useEffect(() => {
    localStorage.setItem("anchor_members", JSON.stringify(members));
  }, [members]);

  // 협약서 관리 상태 선언 및 로컬스토리지 영속 저장 연동
  const [agreements, setAgreements] = useState(() => {
    const cached = localStorage.getItem("anchor_agreements_data_v1");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return INITIAL_AGREEMENTS;
      }
    }
    return INITIAL_AGREEMENTS;
  });

  useEffect(() => {
    try {
      // 용량이 큰 fileData(Base64 파일 데이터)는 로컬스토리지 5MB Quota 초과 방지를 위해 캐싱 항목에서 배제합니다.
      // 인메모리 상에서는 새로고침 전까지 fileData가 온전히 유지됩니다.
      const agreementsForStorage = agreements.map((item) => {
        const { fileData, ...rest } = item;
        return rest;
      });
      localStorage.setItem("anchor_agreements_data_v1", JSON.stringify(agreementsForStorage));
    } catch (e) {
      console.error("Failed to save agreements to localStorage:", e);
    }
  }, [agreements]);

  // 협약∙발급 관리 서브탭 및 추가 데이터군(이수증, 상장) 상태 선언
  const [agreementsSubTab, setAgreementsSubTab] = useState(() => {
    return localStorage.getItem("anchor_agreements_sub_tab") || "agreements";
  });

  useEffect(() => {
    localStorage.setItem("anchor_agreements_sub_tab", agreementsSubTab);
  }, [agreementsSubTab]);

  const [unifiedCertificates, setUnifiedCertificates] = useState(() => {
    const cached = localStorage.getItem("anchor_unified_certificates_data_v1");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [scholarships, setScholarships] = useState(() => {
    const cached = localStorage.getItem("anchor_cache_scholarships_all");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      const unifiedCertsForStorage = unifiedCertificates.map((item) => {
        const { fileData, ...rest } = item;
        return rest;
      });
      localStorage.setItem("anchor_unified_certificates_data_v1", JSON.stringify(unifiedCertsForStorage));
    } catch (e) {
      console.error("Failed to save unified certificates to localStorage:", e);
    }
  }, [unifiedCertificates]);

  useEffect(() => {
    try {
      const clean = scholarships.map((item) => ({ ...item }));
      localStorage.setItem("anchor_cache_scholarships_all", JSON.stringify(clean));
    } catch (e) {
      console.error("Failed to save scholarships to localStorage:", e);
    }
  }, [scholarships]);

  const [assignFilterUnitId, setAssignFilterUnitId] = useState("all");
  
  // 프로그램 CRUD 상태
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({ unitId: "", id: "", title: "", dept: "사업운영팀" });
  const fileInputRef = React.useRef(null);
  const [mgmtSubTab, setMgmtSubTab] = useState(() => {
    return localStorage.getItem("anchor_mgmt_sub_tab") || "approvals";
  }); // "approvals", "members", "programs", "users"
  useEffect(() => {
    localStorage.setItem("anchor_mgmt_sub_tab", mgmtSubTab);
  }, [mgmtSubTab]);
  const [memberFilter, setMemberFilter] = useState("all"); // "all", "active", "retired"
  const [memberSortConfig, setMemberSortConfig] = useState({ key: null, direction: "asc" });

  const requestMemberSort = (key) => {
    let direction = "asc";
    if (memberSortConfig.key === key && memberSortConfig.direction === "asc") {
      direction = "desc";
    }
    setMemberSortConfig({ key, direction });
  };

  const getSortedMembers = () => {
    const filtered = (members || []).filter((m) => {
      const computedStatus = getMemberStatusForYear(m, selectedYear);
      if (memberFilter === "active") return computedStatus !== "미참여";
      if (memberFilter === "retired") return computedStatus === "미참여";
      return true;
    });

    const sorted = [...filtered];

    if (!memberSortConfig.key) {
      // 기본 정렬: 리더십 순서 -> 센터 부서 가중치 -> 연구원 가중치 -> ID 오름차순
      return sorted.sort((a, b) => {
        const roleRanks = {
          "사업단장": 1,
          "본부장": 2,
          "센터장": 3,
          "운영팀장": 4,
          "팀장교수": 4,
          "연구원": 5
        };
        const rankA = roleRanks[a.role] || 99;
        const rankB = roleRanks[b.role] || 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        if (a.role === "센터장" && b.role === "센터장") {
          const centerOrder = {
            "ECC센터": 1,
            "ICC센터": 2,
            "RCC센터": 3,
            "울산늘봄누리센터": 4,
            "신산업특화센터": 5
          };
          const oA = centerOrder[a.dept] || 99;
          const oB = centerOrder[b.dept] || 99;
          if (oA !== oB) return oA - oB;
        }

        if (a.role === "운영팀장" && b.role !== "운영팀장") return -1;
        if (a.role !== "운영팀장" && b.role === "운영팀장") return 1;

        if (a.role === "연구원" && b.role === "연구원") {
          const deptOrder = {
            "ECC센터": 1,
            "ICC센터": 2,
            "RCC센터": 3,
            "AID-X지원센터": 4,
            "울산늘봄누리센터": 5,
            "신산업특화센터": 6
          };
          const deptValA = deptOrder[a.dept] || 99;
          const deptValB = deptOrder[b.dept] || 99;
          if (deptValA !== deptValB) {
            return deptValA - deptValB;
          }

          const gradeOrder = {
            "책임연구원": 1,
            "선임연구원": 2,
            "연구원": 3
          };
          const gradeValA = gradeOrder[a.grade] || 99;
          const gradeValB = gradeOrder[b.grade] || 99;
          if (gradeValA !== gradeValB) {
            return gradeValA - gradeValB;
          }
        }

        return a.id.localeCompare(b.id, 'en');
      });
    }

    return sorted.sort((a, b) => {
      let valA = a[memberSortConfig.key] || "";
      let valB = b[memberSortConfig.key] || "";

      if (memberSortConfig.key === "startDate") {
        valA = a.startDate || a.hireDate || "";
        valB = b.startDate || b.hireDate || "";
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return memberSortConfig.direction === "asc"
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" })
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: "base" });
      }

      if (valA < valB) return memberSortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return memberSortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };
  // Supabase 실시간 동기화 상태 배지 및 로드 플래그
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced", "syncing", "error"

  // 구매용역 관리 DB 보존 상태
  const [envData, setEnvData] = useState([]);
  const [equipData, setEquipData] = useState([]);
  const [serviceData, setServiceData] = useState([]);

  // 일정관리 DB 보존 상태
  const [monthlySchedules, setMonthlySchedules] = useState([]);
  const [eventSchedules, setEventSchedules] = useState([]);
  const [meetingSchedules, setMeetingSchedules] = useState([]);
  const [pressReleases, setPressReleases] = useState([]);

  const [projectsSubTab, setProjectsSubTab] = useState(() => {
    return localStorage.getItem("anchor_projects_sub_tab") || "unit_status";
  }); // "unit_status" (단위과제 집행현황) 또는 "program_mgmt" (프로그램 관리)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // 추가/수정용 임시 객체

  // 개인정보 관리 (비밀번호 변경) 상태 및 핸들러
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmNewPw) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }
    
    // 비밀번호 복잡도 검증: 최소 8자 이상, 영문자, 숫자, 특수문자(@$!%*#?&) 각각 최소 1개 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPw)) {
      alert("새 비밀번호는 최소 8자 이상이어야 하며, 영문자, 숫자, 특수문자(@$!%*#?&)가 각각 최소 1개 이상 포함되어야 합니다.");
      return;
    }

    if (newPw !== confirmNewPw) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const hashedCurrent = CryptoJS.SHA256(currentPw).toString();

      // 1. Supabase에서 현재 사용자의 비밀번호 조회 및 검증
      const { data: user, error: fetchError } = await supabase
        .from("rise_users")
        .select("pw")
        .eq("id", currentUser.id)
        .single();

      if (fetchError || !user) {
        alert("사용자 정보를 조회할 수 없습니다.");
        return;
      }

      if (user.pw !== hashedCurrent) {
        alert("현재 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 2. Supabase Auth의 비밀번호도 동시에 업데이트 진행!
      const { error: authUpdateError } = await supabase.auth.updateUser({
        password: newPw
      });

      if (authUpdateError) {
        alert(`인증 비밀번호 변경 실패: ${authUpdateError.message}`);
        return;
      }

      // 3. 로컬 DB(rise_users) 비밀번호 필드도 동기화 업데이트
      const hashedNew = CryptoJS.SHA256(newPw).toString();
      const { error: updateError } = await supabase
        .from("rise_users")
        .update({ pw: hashedNew })
        .eq("id", currentUser.id);

      if (updateError) {
        alert("로컬 회원 DB 비밀번호 변경 처리 중 오류가 발생했습니다. (인증 비밀번호는 정상 변경됨)");
        return;
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setIsPasswordModalOpen(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmNewPw("");
    } catch (err) {
      console.error("Password change error:", err);
      alert("비밀번호 변경 중 통신 오류가 발생했습니다.");
    }
  };

  // Supabase 회원현황 목록 상태
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // 회원현황 목록 로드 함수
  const fetchRegisteredUsers = async () => {
    // 1. 기본 데모 계정들 정의
    const demoUsers = [
      { id: "admin", name: "시스템 관리자", role_key: "ADMIN", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "director", name: "송경영", role_key: "DIRECTOR", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "hq_head", name: "김현수", role_key: "HQ_HEAD", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "center_director", name: "이동은", role_key: "CENTER_ECC", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "team_leader", name: "심현미", role_key: "TEAM_LEADER", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "researcher", name: "이은주", role_key: "RESEARCHER", created_at: "2026-03-01T00:00:00.000Z" }
    ];

    try {
      // 2. Supabase DB에서 가입된 회원 로드
      const { data, error } = await supabase
        .from("rise_users")
        .select("id, name, role_key, created_at");
      const dbUsers = data || [];
      const dbMap = new Map(dbUsers.map(u => [u.id.trim().toLowerCase(), u]));

      // 3. 주소록(members)에서 참여중인 멤버들 로드 및 매핑 (이메일 및 임시 비밀번호 매핑 가이드라인 연동)
      const activeMembers = (members || [])
        .filter(m => m.status !== "미참여" && m.email)
        .map(m => {
          const emailId = m.email.trim().toLowerCase();
          
          // 역할 맵핑 규칙
          let autoRoleKey = "RESEARCHER";
          const mRole = m.role || "";
          const mDept = m.dept || "";
          if (emailId === "leegyu@uc.ac.kr") {
            autoRoleKey = "RESEARCH";
          } else if (mRole === "사업단장") {
            autoRoleKey = "DIRECTOR";
          } else if (mRole === "본부장") {
            autoRoleKey = "HQ_HEAD";
          } else if (mRole === "운영팀장") {
            autoRoleKey = "TEAM_LEADER";
          } else if (mRole === "팀장교수" || mRole === "팀장") {
            autoRoleKey = "TEAM_LEADER";
          } else if (mRole === "센터장") {
            if (mDept === "ECC센터") autoRoleKey = "CENTER_ECC";
            else if (mDept === "ICC센터") autoRoleKey = "CENTER_ICC";
            else if (mDept === "RCC센터") autoRoleKey = "CENTER_RCC";
            else if (mDept === "울산늘봄누리센터") autoRoleKey = "CENTER_NURI";
            else autoRoleKey = "CENTER_SPECIAL";
          }

          // DB에 비밀번호를 직접 변경한 이력이 존재하면 해당 가입일/이름 정보를 우선시함
          // cshong@uc.ac.kr 주소록과 DB 상의 special_head 계정 간의 예외 매핑을 함께 지원합니다.
          const dbUser = dbMap.get(emailId) || 
                         dbMap.get(emailId.split("@")[0]) || 
                         (emailId === "cshong@uc.ac.kr" ? dbMap.get("special_head") : null);
          return {
            id: emailId,
            name: dbUser ? dbUser.name : m.name,
            role_key: autoRoleKey,
            // 주소록(members)에 시작일이 수정 기입되어 있다면 그것을 우선 표출하고, 없으면 DB 생성일 또는 디폴트값을 사용합니다.
            created_at: m.startDate || m.hireDate || (dbUser ? dbUser.created_at : "2026-03-01T00:00:00.000Z")
          };
        });

      // 4. 데모 계정 + 주소록 액티브 계정 + DB 계정 우선순위 병합
      const finalUsersMap = new Map();
      
      // 데모 계정 주입
      demoUsers.forEach(u => finalUsersMap.set(u.id.toLowerCase(), u));
      // 주소록 재직중인 계정 주입
      activeMembers.forEach(u => finalUsersMap.set(u.id.toLowerCase(), u));
      // DB 실제 회원 계정 주입 (최종 우선순위 보장)
      dbUsers.forEach(u => {
        const idLower = u.id.trim().toLowerCase();
        if (idLower === "leegyu@uc.ac.kr") {
          u.role_key = "RESEARCH";
        }
        finalUsersMap.set(idLower, u);
      });

      // 주소록에 변경된 시작일이 있다면, DB 계정 정보가 덮어썼더라도 주소록에 명시된 시작일이 화면상 가입일/시작일로 우선 표출되게 최종 갱신 보장
      finalUsersMap.forEach((user, key) => {
        const matchedActive = activeMembers.find(am => am.id.trim().toLowerCase() === key);
        if (matchedActive) {
          user.created_at = matchedActive.created_at;
        }
      });

      // 직책별 가중치 순서 정의 (0순위 관리자 ~ 5순위 실무 연구원)
      const roleRanks = {
        ADMIN: 0,
        DIRECTOR: 1,
        HQ_HEAD: 2,
        CENTER_ECC: 3,
        CENTER_ICC: 3,
        CENTER_RCC: 3,
        CENTER_AID: 3,
        CENTER_NURI: 3,
        CENTER_NULBOM: 3,
        CENTER_SPECIAL: 3,
        TEAM_LEADER: 4,
        RESEARCHER: 5,
        RESEARCH: 5
      };

      const sortedUsers = Array.from(finalUsersMap.values()).sort((a, b) => {
        const rankA = roleRanks[a.role_key] !== undefined ? roleRanks[a.role_key] : 99;
        const rankB = roleRanks[b.role_key] !== undefined ? roleRanks[b.role_key] : 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        
        // 동일한 센터장 직급 내에서의 정렬 순서 적용 (이동은 -> 김기범 -> 현용환 -> 홍광표 -> 홍진숙)
        const isCenterA = a.role_key.startsWith("CENTER_");
        const isCenterB = b.role_key.startsWith("CENTER_");
        if (isCenterA && isCenterB) {
          const centerOrder = {
            CENTER_ECC: 1,
            CENTER_ICC: 2,
            CENTER_RCC: 3,
            CENTER_NURI: 4,
            CENTER_SPECIAL: 5
          };
          const orderA = centerOrder[a.role_key] || 99;
          const orderB = centerOrder[b.role_key] || 99;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
        }

        // 동일한 TEAM_LEADER 직급 내에서 운영팀장(심현미 부장)을 팀장교수진보다 우선 배치
        if (a.role_key === "TEAM_LEADER" && b.role_key === "TEAM_LEADER") {
          const isOpLeaderA = a.id.toLowerCase() === "hmsim@uc.ac.kr" || a.id.toLowerCase() === "team_leader";
          const isOpLeaderB = b.id.toLowerCase() === "hmsim@uc.ac.kr" || b.id.toLowerCase() === "team_leader";
          if (isOpLeaderA && !isOpLeaderB) return -1;
          if (!isOpLeaderA && isOpLeaderB) return 1;
        }

        // 동일한 RESEARCHER 직급 내에서의 정렬 순서 적용 (소속 부서 순서 -> 직급/직위 순서)
        if (a.role_key === "RESEARCHER" && b.role_key === "RESEARCHER") {
          const memberA = (members || []).find(m => m.email && m.email.trim().toLowerCase() === a.id.trim().toLowerCase());
          const memberB = (members || []).find(m => m.email && m.email.trim().toLowerCase() === b.id.trim().toLowerCase());
          
          if (memberA && memberB) {
            // 1. 소속부서 정렬 순서 (ECC, ICC, RCC, AID-X, 늘봄누리, 신산업)
            const deptOrder = {
              "ECC센터": 1,
              "ICC센터": 2,
              "RCC센터": 3,
              "AID-X지원센터": 4,
              "울산늘봄누리센터": 5,
              "신산업특화센터": 6
            };
            const deptValA = deptOrder[memberA.dept] || 99;
            const deptValB = deptOrder[memberB.dept] || 99;
            if (deptValA !== deptValB) {
              return deptValA - deptValB;
            }

            // 2. 직급/직위 정렬 순서 (책임연구원, 선임연구원, 연구원)
            const gradeOrder = {
              "책임연구원": 1,
              "선임연구원": 2,
              "연구원": 3
            };
            const gradeValA = gradeOrder[memberA.grade] || 99;
            const gradeValB = gradeOrder[memberB.grade] || 99;
            if (gradeValA !== gradeValB) {
              return gradeValA - gradeValB;
            }
          }
        }

        // 동일한 직급일 경우 ID 알파벳 순 정렬
        return a.id.localeCompare(b.id, 'en');
      });

      setRegisteredUsers(sortedUsers);
    } catch (err) {
      console.error("Fetch registered users error:", err);
      setRegisteredUsers(demoUsers);
    }
  };

  // 회원현황에서 사용자 계정 삭제 실행 함수
  const handleDeleteUser = async (userId) => {
    const demoIds = ["admin", "director", "hq_head", "center_director", "team_leader", "researcher"];
    if (demoIds.includes(userId.toLowerCase())) {
      alert("시스템 기본 데모 계정은 삭제할 수 없습니다.");
      return;
    }

    if (!window.confirm(`정말로 '${userId}' 계정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("rise_users")
        .delete()
        .eq("id", userId);
      
      if (error) {
        alert("계정 삭제 중 오류가 발생했습니다.");
      } else {
        alert("성공적으로 계정이 삭제되었습니다.");
        fetchRegisteredUsers(); // 목록 새로고침
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("삭제 처리 중 예기치 못한 에러가 발생했습니다.");
    }
  };

  // 관리자 탭 활성화 시 또는 주소록(members)이 변경되었을 때 대기 목록 로드 및 갱신
  useEffect(() => {
    if (activeTab === "management" && currentUser && currentUser.role?.rank <= 2) {
      fetchRegisteredUsers();
    }
  }, [activeTab, currentUser, members]);

  // 성과지표 상세 조회용 상태 및 다년도 성과관리 연도 선택 상태
  const [selectedKpi, setSelectedKpi] = useState(() => {
    const saved = localStorage.getItem("anchor_selected_kpi");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem("anchor_selected_year");
    return saved ? parseInt(saved, 10) : 2;
  });

  // 2인 공동배정 여부 로컬 상태 (프로그램 ID별 true/false)
  const [jointPrograms, setJointPrograms] = useState({});

  // projects 데이터 로딩 시 2명 이상으로 배정된 과제를 자동 스캔하여 체크 상태 설정
  useEffect(() => {
    if (!projects) return;
    const initialJoint = {};
    projects.forEach((p) => {
      p.units.forEach((u) => {
        u.programs.forEach((prog) => {
          const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
          if (currentVal.includes(",") || currentVal.includes("/")) {
            initialJoint[prog.id] = true;
          }
        });
      });
    });
    setJointPrograms((prev) => ({ ...initialJoint, ...prev }));
  }, [projects, selectedYear]);

  const [kpiSubTab, setKpiSubTab] = useState(() => {
    return localStorage.getItem("anchor_kpi_sub_tab") || "공통";
  });
  const [budgetSubTab, setBudgetSubTab] = useState(() => {
    return localStorage.getItem("anchor_budget_sub_tab") || "budget_categories";
  });
  const [procurementSubTab, setProcurementSubTab] = useState(() => {
    return localStorage.getItem("anchor_procurement_sub_tab") || "env_improvement";
  });
  const [scheduleSubTab, setScheduleSubTab] = useState(() => {
    return localStorage.getItem("anchor_schedule_sub_tab") || "monthly";
  });
  const [progressSubTab, setProgressSubTab] = useState(() => {
    return localStorage.getItem("anchor_progress_sub_tab") || "progress_status";
  });
  const [selectedUnitId, setSelectedUnitId] = useState(() => {
    return localStorage.getItem("anchor_selected_unit_id") || "A1가";
  });
  const [selectedProgId, setSelectedProgId] = useState(() => {
    return localStorage.getItem("anchor_selected_prog_id") || null;
  });


  useEffect(() => {
    if (selectedKpi) {
      localStorage.setItem("anchor_selected_kpi", JSON.stringify(selectedKpi));
    } else {
      localStorage.removeItem("anchor_selected_kpi");
    }
  }, [selectedKpi]);

  useEffect(() => {
    localStorage.setItem("anchor_selected_year", String(selectedYear));
  }, [selectedYear]);

  useEffect(() => {
    localStorage.setItem("anchor_kpi_sub_tab", kpiSubTab);
  }, [kpiSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_projects_sub_tab", projectsSubTab);
  }, [projectsSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_progress_sub_tab", progressSubTab);
  }, [progressSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_budget_sub_tab", budgetSubTab);
  }, [budgetSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_procurement_sub_tab", procurementSubTab);
  }, [procurementSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_schedule_sub_tab", scheduleSubTab);
  }, [scheduleSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_selected_unit_id", selectedUnitId);
  }, [selectedUnitId]);

  useEffect(() => {
    if (selectedProgId) {
      localStorage.setItem("anchor_selected_prog_id", selectedProgId);
    } else {
      localStorage.removeItem("anchor_selected_prog_id");
    }
  }, [selectedProgId]);

  const [pdcaViewMode, setPdcaViewMode] = useState(() => {
    return localStorage.getItem("anchor_pdca_view_mode") || "unit";
  });

  useEffect(() => {
    localStorage.setItem("anchor_pdca_view_mode", pdcaViewMode);
  }, [pdcaViewMode]);

  // ==========================================
  // Supabase DB 실시간 패칭 및 자동 동기화 훅
  // ==========================================

  // Supabase 원격 서버 데이터 fetch 완료 여부를 체크하는 이중 안전 잠금장치 State
  const [isFetchCompleted, setIsFetchCompleted] = useState(false);
  // 💡 데이터 불일치 보호망: 현재 화면에 로드된 데이터가 몇 차년도 데이터인지 명확하게 추적합니다.
  const [activeDataYear, setActiveDataYear] = useState(selectedYear);
  
  // 💡 Race Condition 방지: 원격에서 막 가져온 순수 데이터를 기억하여, 사용자가 직접 수정한 경우에만 Auto-save 동작하도록 보장
  const fetchedProjectsRef = useRef("");
  const fetchedAgreementsRef = useRef("");
  const fetchedUnifiedCertificatesRef = useRef("");
  const fetchedScholarshipsRef = useRef("");
  const fetchedEnvDataRef = useRef("");
  const fetchedEquipDataRef = useRef("");
  const fetchedServiceDataRef = useRef("");
  const fetchedMonthlySchedulesRef = useRef("");
  const fetchedEventSchedulesRef = useRef("");
  const fetchedMeetingSchedulesRef = useRef("");
  const fetchedPressReleasesRef = useRef("");

  // selectedYear가 변경될 때 fetch 완료 플래그를 false로 초기화
  useEffect(() => {
    setIsFetchCompleted(false);
  }, [selectedYear]);
  
  // 1) 최초 마운트 및 연차 변경 시 DB 데이터 Fetch 연동
  useEffect(() => {
    let active = true;
    const fetchAllDashboardData = async () => {
      try {
        // 0-0. Supabase schedule_meetings 및 schedule_events 테이블 연차(year) 과거 데이터 자가 보정 (일회성 자가 치료)
        (async () => {
          try {
            // 1) 회의록 연도 정합성 보정
            const { data: dbMeets } = await supabase.from("schedule_meetings").select("id, datetime, year");
            if (dbMeets && dbMeets.length > 0) {
              for (const m of dbMeets) {
                const correctYear = getCalculatedYearFromDate(m.datetime ? m.datetime.substring(0, 10) : null, m.year);
                if (Number(m.year) !== correctYear) {
                  await supabase.from("schedule_meetings").update({ year: correctYear }).eq("id", m.id);
                  console.log(`[DB보정] 회의록 id ${m.id}의 연도를 ${m.year} -> ${correctYear}로 자가 보정 완료`);
                }
              }
            }
            // 2) 행사 연도 정합성 보정
            const { data: dbEvents } = await supabase.from("schedule_events").select("id, datetime, year");
            if (dbEvents && dbEvents.length > 0) {
              for (const e of dbEvents) {
                const correctYear = getCalculatedYearFromDate(e.datetime ? e.datetime.substring(0, 10) : null, e.year);
                if (Number(e.year) !== correctYear) {
                  await supabase.from("schedule_events").update({ year: correctYear }).eq("id", e.id);
                  console.log(`[DB보정] 행사 id ${e.id}의 연도를 ${e.year} -> ${correctYear}로 자가 보정 완료`);
                }
              }
            }
          } catch (err) {
            console.error("DB 연차 정합성 자가 보정 중 실패:", err);
          }
        })();

        // 0-0. 원격 DB 040 고도화 컬럼 실존 여부 조용히 선제 노크 (콘솔 400 에러 원천 차단 목적)
        try {
          const { error: chkServErr } = await supabase.from("procurement_services").select("date_b").limit(1);
          if (!active) return;
          window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = !!chkServErr;

          const { error: chkEnvErr } = await supabase.from("procurement_env").select("date_b").limit(1);
          if (!active) return;
          window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = !!chkEnvErr;

          const { error: chkEquipErr } = await supabase.from("procurement_equipment").select("date_b").limit(1);
          if (!active) return;
          window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = !!chkEquipErr;
        } catch (e) {
          if (!active) return;
          window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = true;
          window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = true;
          window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = true;
        }

        // 0. 로컬 스토리지 캐시 데이터 선 로드 (깜빡임 방지 및 0초 반응)
        if (!active) return;
        const cachedProj = localStorage.getItem(`anchor_cache_proj_y${selectedYear}`);
        const cachedAgr = localStorage.getItem("anchor_cache_agreements_all");
        const cachedUnifiedCert = localStorage.getItem("anchor_cache_unified_certificates_all");
        const cachedScholarships = localStorage.getItem("anchor_cache_scholarships_all");
        const cachedEnv = localStorage.getItem(`anchor_cache_env_y${selectedYear}`);
        const cachedEquip = localStorage.getItem(`anchor_cache_equip_y${selectedYear}`);
        const cachedServ = localStorage.getItem(`anchor_cache_serv_y${selectedYear}`);
        const cachedMonth = localStorage.getItem(`anchor_cache_month_y${selectedYear}`);
        const cachedEvent = localStorage.getItem(`anchor_cache_event_y${selectedYear}`);
        const cachedMeet = localStorage.getItem(`anchor_cache_meet_y${selectedYear}`);
        const cachedPress = localStorage.getItem(`anchor_cache_press_y${selectedYear}`);

        if (cachedProj) setProjects(migrateProgramIds(JSON.parse(cachedProj)));
        if (cachedAgr) setAgreements(JSON.parse(cachedAgr));
        if (cachedUnifiedCert) setUnifiedCertificates(JSON.parse(cachedUnifiedCert));
        if (cachedScholarships) setScholarships(JSON.parse(cachedScholarships));
        if (cachedEnv) setEnvData(JSON.parse(cachedEnv));
        if (cachedEquip) setEquipData(JSON.parse(cachedEquip));
        if (cachedServ) setServiceData(JSON.parse(cachedServ));
        if (cachedMonth) setMonthlySchedules(JSON.parse(cachedMonth));
        if (cachedEvent) setEventSchedules(JSON.parse(cachedEvent));
        if (cachedMeet) setMeetingSchedules(JSON.parse(cachedMeet));
        if (cachedPress) setPressReleases(JSON.parse(cachedPress));

        if (cachedProj || cachedMonth) {
          setIsDbLoaded(true);
        } else {
          setIsDbLoaded(false);
        }

        // 1. Projects 복구
        const { data: projData } = await supabase
          .from("projects_data")
          .select("*")
          .eq("year", selectedYear)
          .single();
        
        if (!active) return;
        
        if (projData && projData.data) {
          // [성과 동기화] 원격 DB 데이터 로드 시점에도 mockData.js의 최신 KPI 구조(C-1~C-6 등)가 강제 유지되도록 동기화합니다.
          // [ID 마이그레이션] DB에서 읽어온 데이터 내의 프로그램 ID들을 5단계 위계 규정에 맞게 마이그레이션 적용합니다.
          const dbProjData = migrateProgramIds(projData.data);
          const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));
          dbProjData.forEach((strategy) => {
            strategy.units.forEach((unit) => {
              const sourceUnit = multiYearInitialData
                ?.flatMap(s => s.units)
                ?.find(u => u.id === unit.id);
              if (sourceUnit) {
                unit.kpis = sourceUnit.kpis || [];
              }
            });
          });
          setProjects(dbProjData);
          localStorage.setItem(`anchor_cache_proj_y${selectedYear}`, JSON.stringify(dbProjData));
          if (currentUser && currentRole?.id !== "GUEST") {
            await supabase.from("projects_data").upsert({ year: selectedYear, data: dbProjData }, { onConflict: "year" });
          }
        } else {
          const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));
          setProjects(multiYearInitialData);
          localStorage.setItem(`anchor_cache_proj_y${selectedYear}`, JSON.stringify(multiYearInitialData));
          if (currentUser && currentRole?.id !== "GUEST") {
            await supabase.from("projects_data").upsert({ year: selectedYear, data: multiYearInitialData }, { onConflict: "year" });
          }
        }

        // 2. Agreements 복구 (전체 연차 데이터를 한 번에 가져와 메모리에 유지)
        const { data: agrData, error: agrErr } = await supabase
          .from("agreements")
          .select("*");
        
        if (!active) return;
        if (agrErr) {
          console.error("Failed to fetch agreements:", agrErr);
        } else if (agrData && agrData.length > 0) {
          const formatted = agrData.map(a => ({
            id: Number(a.id),
            year: a.year,
            date: a.date,
            center: a.center,
            organizations: a.organizations,
            subjectUniversity: a.subject_univ,
            subjectOrganization: a.subject_org || "",
            unitId: a.unit_id,
            contents: a.contents,
            fileName: a.file_name,
            fileData: a.file_data,
            agreementType: a.agreement_type || "-"
          }));
          setAgreements(formatted);
          try {
            const clean = formatted.map(item => ({ ...item, fileData: null }));
            localStorage.setItem("anchor_cache_agreements_all", JSON.stringify(clean));
          } catch (e) {
            console.error("Failed to save agreements cache:", e);
          }
        } else {
          setAgreements([]);
        }

        // 2-2. Unified Certificates 복구 (전체 연차 데이터를 한 번에 가져와 메모리에 유지)
        const { data: unifiedCertData, error: unifiedCertErr } = await supabase
          .from("unified_certificates")
          .select("*");
        
        if (!active) return;
        if (unifiedCertErr) {
          console.error("Failed to fetch unified certificates:", unifiedCertErr);
        } else if (unifiedCertData && unifiedCertData.length > 0) {
          const formatted = unifiedCertData.map(c => ({
            id: Number(c.id),
            year: c.year,
            managerDept: c.manager_dept,
            managerName: c.manager_name,
            certNo: c.cert_no,
            certType: c.cert_type,
            awardType: c.award_type,
            note: c.note,
            teamName: c.team_name,
            recipientName: c.recipient_name,
            studentId: c.student_id,
            birthDate: c.birth_date,
            phone: c.phone,
            issueDate: c.issue_date,
            projectGroup: c.project_group,
            issuer: c.issuer,
            content: c.content,
            fileName: c.file_name,
            fileData: c.file_data
          }));
          setUnifiedCertificates(formatted);
          try {
            const clean = formatted.map(item => ({ ...item, fileData: null }));
            localStorage.setItem("anchor_cache_unified_certificates_all", JSON.stringify(clean));
          } catch (e) {
            console.error("Failed to save unified certificates cache:", e);
          }
        } else {
          setUnifiedCertificates([]);
        }

        // 2-3. Scholarships 복구
        const { data: scholarshipData, error: scholarshipError } = await supabase
          .from("scholarships_view")
          .select("*");
        
        if (!active) return;
        if (scholarshipError) {
          console.error("Failed to fetch scholarships:", scholarshipError);
        } else if (scholarshipData && scholarshipData.length > 0) {
          const formatted = scholarshipData.map(c => ({
            id: Number(c.id) || Date.now() + Math.random(),
            year: c.year,
            dept: c.dept,
            major: c.major,
            course: c.course,
            studentId: c.student_id,
            name: c.name,
            residentId: c.resident_id,
            grade: c.grade,
            enrollStatus: c.enroll_status,
            regStatus: c.reg_status,
            amount: c.amount,
            bankName: c.bank_name,
            accountNum: c.account_num,
            accountHolder: c.account_holder,
            approvalDate: c.approval_date
          }));
          setScholarships(formatted);
          try {
            const clean = formatted.map(item => ({ ...item }));
            localStorage.setItem("anchor_cache_scholarships_all", JSON.stringify(clean));
          } catch (e) {
            console.error("Failed to save scholarships cache:", e);
          }
        } else {
          setScholarships([]);
        }

        // 3. Procurement (환경개선, 기자재, 주요용역) 복구
        const { data: pEnv, error: pEnvError } = await supabase.from("procurement_env").select("*").eq("year", selectedYear);
        const { data: pEquip, error: pEquipError } = await supabase.from("procurement_equipment").select("*").eq("year", selectedYear);
        const { data: pServ, error: pServError } = await supabase.from("procurement_services").select("*").eq("year", selectedYear);
        
        if (!active) return;

        if (pEnvError) {
          console.error("Supabase procurement_env fetch error (using fallback cache):", pEnvError);
          const cachedEnv = localStorage.getItem(`anchor_cache_env_y${selectedYear}`);
          if (cachedEnv) {
            try {
              setEnvData(JSON.parse(cachedEnv));
            } catch (e) {
              console.error("Failed to parse cached env data:", e);
            }
          }
        } else if (pEnv && pEnv.length > 0) {
          const formatted = pEnv.map(x => ({ 
            ...x, 
            id: Number(x.id), 
            budgetPlan: Number(x.budget_plan), 
            budgetSpent: Number(x.budget_spent),
            deptName: x.dept_name || "",
            divisionName: x.division_name || "",
            dateP: x.date_p || "",
            dateA: x.date_a || "",
            dateB: x.date_b || "",
            datePr: x.date_pr || "",
            dateI: x.date_i || "",
            docPlan: x.doc_plan || "",
            docPurchase: x.doc_purchase || "",
            docBid: x.doc_bid || "",
            docPlanFileName: x.doc_plan_file_name || "",
            docPurchaseFileName: x.doc_purchase_file_name || "",
            docBidFileName: x.doc_bid_file_name || "",
            docPlanFileSize: Number(x.doc_plan_file_size) || 0,
            docPurchaseFileSize: Number(x.doc_purchase_file_size) || 0,
            docBidFileSize: Number(x.doc_bid_file_size) || 0,
            docPlanFileUrl: x.doc_plan_file_url || "",
            docPurchaseFileUrl: x.doc_purchase_file_url || "",
            docBidFileUrl: x.doc_bid_file_url || "",
            aiProposalData: x.ai_proposal_data || null,
            aiPurchaseData: x.ai_purchase_data || null,
            aiBidData: x.ai_bid_data || null,
            relatedDocs: x.related_docs || ""
          }));
          setEnvData(formatted);
          localStorage.setItem(`anchor_cache_env_y${selectedYear}`, JSON.stringify(formatted));
        }

        if (pEquipError) {
          console.error("Supabase procurement_equipment fetch error (using fallback cache):", pEquipError);
          const cachedEquip = localStorage.getItem(`anchor_cache_equip_y${selectedYear}`);
          if (cachedEquip) {
            try {
              setEquipData(JSON.parse(cachedEquip));
            } catch (e) {
              console.error("Failed to parse cached equip data:", e);
            }
          }
        } else if (pEquip && pEquip.length > 0) {
          const formatted = pEquip.map(x => {
            const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
            return {
              id: Number(x.id),
              year: Number(x.year),
              unit: x.unit || "A1",
              seq: Number(x.seq) || 1,
              deptName: x.dept_name || "",
              divisionName: x.division_name || "",
              itemName: x.item_name || "",
              unitPrice: Number(x.unit_price) || 0,
              quantity: Number(x.quantity) || 1,
              description: x.description || "",
              operation: x.operation || "교과목(정규)",
              password: x.password || "1234",
              relatedDocs: x.related_docs || "", // 관련문서 필드 로드 매핑
              docPlan: x.doc_plan || docParts[0] || "", // 기획문서 결재번호 (호환 처리)
              docPurchase: x.doc_purchase || docParts[1] || "", // 구매문서 결재번호 (호환 처리)
              docBid: x.doc_bid || docParts[2] || "", // 입찰문서 결재번호 (호환 처리)
              dateP: x.date_p || "",
              dateA: x.date_a || "",
              dateB: x.date_b || "",
              datePr: x.date_pr || "",
              dateI: x.date_i || ""
            };
          });
          setEquipData(formatted);
          localStorage.setItem(`anchor_cache_equip_y${selectedYear}`, JSON.stringify(formatted));
        } else {
          // DB가 비어있는 최초 구동 시: 기본 모의 데이터(defaultEquipmentsSeed)를 Supabase DB에 세팅(시딩)
          const initialSeed = defaultEquipmentsSeed.map(e => ({
            year: selectedYear,
            unit: e.unit,
            seq: e.seq,
            dept_name: e.deptName,
            division_name: e.divisionName,
            item_name: e.itemName,
            unit_price: e.unitPrice,
            quantity: e.quantity,
            description: e.description,
            operation: e.operation,
            password: e.password,
            related_docs: e.relatedDocs || "", // 관련문서 시드 매핑
            doc_plan: e.docPlan || "",
            doc_purchase: e.docPurchase || "",
            doc_bid: e.docBid || "",
            date_p: e.dateP || null,
            date_a: e.dateA || null,
            date_b: e.dateB || null,
            date_pr: e.datePr || null,
            date_i: e.dateI || null
          }));
          
          if (currentUser && currentRole?.id !== "GUEST") {
            const { error: seedErr } = await supabase.from("procurement_equipment").insert(initialSeed);
            if (!active) return;
            if (!seedErr) {
              // 시딩 성공 시 즉시 DB 재조회하여 프론트 데이터 갱신
              const { data: refetched } = await supabase.from("procurement_equipment").select("*").eq("year", selectedYear);
              if (!active) return;
              if (refetched) {
                const formatted = refetched.map(x => {
                  const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
                  return {
                    id: Number(x.id),
                    year: Number(x.year),
                    unit: x.unit || "A1",
                    seq: Number(x.seq) || 1,
                    deptName: x.dept_name || "",
                    divisionName: x.division_name || "",
                    itemName: x.item_name || "",
                    unitPrice: Number(x.unit_price) || 0,
                    quantity: Number(x.quantity) || 1,
                    description: x.description || "",
                    operation: x.operation || "교과목(정규)",
                    password: x.password || "1234",
                    relatedDocs: x.related_docs || "", // 관련문서 재조회 매핑
                    docPlan: x.doc_plan || docParts[0] || "",
                    docPurchase: x.doc_purchase || docParts[1] || "",
                    docBid: x.doc_bid || docParts[2] || "",
                    dateP: x.date_p || "",
                    dateA: x.date_a || "",
                    dateB: x.date_b || "",
                    datePr: x.date_pr || "",
                    dateI: x.date_i || ""
                  };
                });
                setEquipData(formatted);
                localStorage.setItem(`anchor_cache_equip_y${selectedYear}`, JSON.stringify(formatted));
              }
            } else {
              console.error("Failed to seed default equipments:", seedErr);
              setEquipData([]);
            }
          } else {
            // 비로그인 상태이거나 GUEST일 때는 모의 데이터를 메모리에만 로드
            setEquipData(defaultEquipmentsSeed);
          }
        }
        if (pServError) {
          console.error("Supabase procurement_services fetch error (using fallback cache):", pServError);
          const cachedServ = localStorage.getItem(`anchor_cache_serv_y${selectedYear}`);
          if (cachedServ) {
            try {
              const parsed = JSON.parse(cachedServ);
              // 자가 치유(Self-healing): 이전 스키마(스네이크케이스 등) 캐시 데이터 호환성 보장
              const healed = parsed.map(x => ({
                ...x,
                id: Number(x.id || Date.now()),
                year: Number(x.year || selectedYear),
                unit: x.unit || "A1",
                programId: x.programId || x.program_id || "",
                programName: x.programName || x.program_name || "",
                deptName: x.deptName || x.dept_name || "",
                divisionName: x.divisionName || x.division_name || "",
                password: x.password || "1234",
                title: x.title || "",
                purpose: x.purpose || "",
                providerQual: x.providerQual || x.provider_qual || "",
                step: Number(x.step) || 1,
                budgetPlan: Number(x.budgetPlan || x.budget_plan || 0),
                budgetSpent: Number(x.budgetSpent || x.budget_spent || 0),
                opResult: x.opResult || x.op_result || "",
                
                // 7대 날짜 복원
                datePp: x.datePp || x.date_pp || "",
                dateRfo: x.dateRfo || x.date_rfo || "",
                dateB: x.dateB || x.date_b || "",
                dateEs: x.dateEs || x.date_es || "",
                dateC: x.dateC || x.date_c || "",
                dateE: x.dateE || x.date_e || "",
                dateI: x.dateI || x.date_i || "",

                // 3종 문서
                docPlan: x.docPlan || x.doc_plan || "",
                docPurchase: x.docPurchase || x.doc_purchase || "",
                docBid: x.docBid || x.doc_bid || "",
                docPlanFileName: x.docPlanFileName || x.doc_plan_file_name || "",
                docPurchaseFileName: x.docPurchaseFileName || x.doc_purchase_file_name || "",
                docBidFileName: x.docBidFileName || x.doc_bid_file_name || "",
                docPlanFileSize: Number(x.docPlanFileSize || x.doc_plan_file_size || 0),
                docPurchaseFileSize: Number(x.docPurchaseFileSize || x.doc_purchase_file_size || 0),
                docBidFileSize: Number(x.docBidFileSize || x.doc_bid_file_size || 0),
                docPlanFileUrl: x.docPlanFileUrl || x.doc_plan_file_url || "",
                docPurchaseFileUrl: x.docPurchaseFileUrl || x.doc_purchase_file_url || "",
                docBidFileUrl: x.docBidFileUrl || "",
                aiProposalData: x.aiProposalData || x.ai_proposal_data || null,
                aiPurchaseData: x.aiPurchaseData || x.ai_purchase_data || null,
                aiBidData: x.aiBidData || x.ai_bid_data || null
              }));
              setServiceData(healed);
            } catch (e) {
              console.error("Failed to parse cached services data:", e);
            }
          }
        } else if (pServ && pServ.length > 0) {
          const formatted = pServ.map(x => {
            const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
            return {
              ...x,
              id: Number(x.id),
              year: Number(x.year),
              unit: x.unit || "A1",
              programId: x.program_id || "",
              programName: x.program_name || "",
              deptName: x.dept_name || "",
              divisionName: x.division_name || "",
              password: x.password || "1234",
              relatedDocs: x.related_docs || "",
              budgetPlan: Number(x.budget_plan),
              budgetSpent: Number(x.budget_spent),
              step: Number(x.step) || 1,
              opResult: x.op_result || "",
              // 7대 절차 날짜 맵핑
              datePp: x.date_pp || "",
              dateRfo: x.date_rfo || "",
              dateB: x.date_b || "",
              dateEs: x.date_es || "",
              dateC: x.date_c || "",
              dateE: x.date_e || "",
              dateI: x.date_i || "",
              // 3종 관련 문서 및 AI 데이터 맵핑
              docPlan: x.doc_plan || docParts[0] || "",
              docPurchase: x.doc_purchase || docParts[1] || "",
              docBid: x.doc_bid || docParts[2] || "",
              docPlanFileName: x.doc_plan_file_name || "",
              docPurchaseFileName: x.doc_purchase_file_name || "",
              docBidFileName: x.doc_bid_file_name || "",
              docPlanFileSize: Number(x.doc_plan_file_size) || 0,
              docPurchaseFileSize: Number(x.doc_purchase_file_size) || 0,
              docBidFileSize: Number(x.doc_bid_file_size) || 0,
              docPlanFileUrl: x.doc_plan_file_url || "",
              docPurchaseFileUrl: x.doc_purchase_file_url || "",
              docBidFileUrl: x.doc_bid_file_url || "",
              aiProposalData: x.ai_proposal_data || null,
              aiPurchaseData: x.ai_purchase_data || null,
              aiBidData: x.ai_bid_data || null
            };
          });
          setServiceData(formatted);
          localStorage.setItem(`anchor_cache_serv_y${selectedYear}`, JSON.stringify(formatted));
        }

        // 4. Schedule (월간일정, 행사일정, 회의일정) 복구
        const { data: sMonth } = await supabase.from("schedule_monthly").select("*").eq("year", selectedYear);
        const { data: sEvent } = await supabase.from("schedule_events").select("*").eq("year", selectedYear);
        const { data: sMeet } = await supabase.from("schedule_meetings").select("*").eq("year", selectedYear);
        
        if (!active) return;

        if (sMonth && sMonth.length > 0) {
          const formatted = sMonth.map(x => ({
            id: Number(x.id),
            year: x.year,
            title: x.title,
            type: x.type,
            dept: x.dept,
            startAt: x.start_at,
            endAt: x.end_at,
            location: x.location,
            isTask: x.is_task || false,
            isDeadline: x.is_deadline || false,
            completed: x.completed || false,
            attendees: x.attendees || ""
          }));
          setMonthlySchedules(formatted);
          localStorage.setItem(`anchor_cache_month_y${selectedYear}`, JSON.stringify(formatted));
        } else {
          setMonthlySchedules([]);
          localStorage.removeItem(`anchor_cache_month_y${selectedYear}`);
        }
        if (sEvent && sEvent.length > 0) {
          const formatted = sEvent.map(x => ({ ...x, id: Number(x.id), year: Number(x.year), month: Number(x.month) }));
          setEventSchedules(formatted);
          localStorage.setItem(`anchor_cache_event_y${selectedYear}`, JSON.stringify(formatted));
        } else {
          setEventSchedules([]);
          localStorage.removeItem(`anchor_cache_event_y${selectedYear}`);
        }
        if (sMeet && sMeet.length > 0) {
          const formatted = sMeet.map(x => ({
            ...x,
            id: Number(x.id),
            year: Number(x.year),
            month: Number(x.month),
            attendeesInternal: x.attendees_internal,
            attendeesExternal: x.attendees_external,
            audioUrl: x.audio_url,
            pdfUrl: x.pdf_url
          }));
          setMeetingSchedules(formatted);
          localStorage.setItem(`anchor_cache_meet_y${selectedYear}`, JSON.stringify(formatted));
        } else {
          setMeetingSchedules([]);
          localStorage.removeItem(`anchor_cache_meet_y${selectedYear}`);
        }


        // press_releases 복구 (year 칼럼 매핑 오류와 무관하게 실제 기사 발행일 범위 기준으로 정밀 분리 패치)
        const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
        const startDateStr = `${targetYearNum}-03-01T00:00:00+09:00`;
        const endDateStr = `${targetYearNum + 1}-03-01T00:00:00+09:00`;

        const { data: sPress, error: sPressErr } = await supabase
          .from("press_releases")
          .select("*")
          .gte("broadcast_date", startDateStr)
          .lt("broadcast_date", endDateStr);

        if (!active) return;

        if (sPressErr) {
          console.error("Failed to fetch press releases:", sPressErr);
        } else if (sPress && sPress.length > 0) {
          const formatted = sPress.map(x => ({
            id: Number(x.id),
            year: x.year,
            type: x.type,
            media: x.media,
            title: x.title,
            broadcastDate: x.broadcast_date,
            contentUrl: x.content_url,
            pressContent: x.press_content || ""
          }));
          setPressReleases(formatted);
          fetchedPressReleasesRef.current = JSON.stringify(formatted);
          localStorage.setItem(`anchor_cache_press_y${selectedYear}`, JSON.stringify(formatted));
        } else {
          setPressReleases([]);
          fetchedPressReleasesRef.current = "[]";
          localStorage.removeItem(`anchor_cache_press_y${selectedYear}`);
        }

        if (!active) return;
        setIsDbLoaded(true);
        setIsFetchCompleted(true);
        setActiveDataYear(selectedYear); // 💡 패치가 완전히 적용된 연차를 기록하여 동기화 혼선 차단
      } catch (e) {
        if (!active) return;
        console.error("Error loading dashboard data from Supabase:", e);
        setIsDbLoaded(true);
        setIsFetchCompleted(true);
      }
    };

    fetchAllDashboardData();
    return () => {
      active = false;
    };
  }, [selectedYear]);

  // 2) Projects 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_proj_y${selectedYear}`, JSON.stringify(projects));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("projects_data")
          .upsert({ year: selectedYear, data: projects, updated_at: new Date().toISOString() }, { onConflict: "year" });
        if (error) throw error;
        setSyncStatus("synced");
      } catch (e) {
        setSyncStatus("error");
      }
    }, 500); // 1.5초에서 0.5초로 변경
    return () => clearTimeout(timer);
  }, [projects, selectedYear, isDbLoaded, isFetchCompleted]);

  // 💡 DB 동기화 중(syncStatus === "syncing") 새로고침 및 페이지 탈출 방어 훅
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (syncStatus === "syncing") {
        e.preventDefault();
        e.returnValue = "현재 변경 사항을 데이터베이스에 저장하는 중입니다. 저장 완료 후 새로고침해주세요.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [syncStatus]);

  // 3) Agreements 자동 저장 디바운스 훅 (통합 캐시 사용 및 selectedYear 의존성 배제)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    // 💡 안전 가드: 데이터 로딩이 완료되지 않았거나 일시적 통신 지연 시 빈 배열([])이 원격 DB를 덮어쓰는 사고 방지
    if (!agreements || agreements.length === 0) return;
    try {
      const clean = agreements.map(item => ({ ...item, fileData: null }));
      localStorage.setItem("anchor_cache_agreements_all", JSON.stringify(clean));
    } catch (e) {
      console.warn("Failed to write agreements cache:", e);
    }
    setSyncStatus("syncing");
    const syncImmediate = async () => {
      try {
        const activeYears = Array.from(new Set([selectedYear, ...agreements.map(a => a.year)]));
        for (const yr of activeYears) {
          await supabase.from("agreements").delete().eq("year", yr);
          const filtered = agreements.filter(a => a.year === yr);
          if (filtered.length > 0) {
            const { error } = await supabase.from("agreements").insert(
              filtered.map(a => {
                // 💡 날짜 데이터가 깨져서(예: '610-98-81' 등) DB 400 에러를 유발하는 것을 방지하는 현장 정화 필터
                let rawDate = String(a.date || "").trim();
                let clean = rawDate.replace(/[^0-9-]/g, ""); // 숫자와 대시만 필터
                
                let finalDate = clean;
                // 정밀 YYYY-MM-DD 포맷 검증
                if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
                  // "2025.05.15" 이나 "2025/05/15" 형태 보정
                  const dottedMatch = rawDate.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
                  if (dottedMatch) {
                    const y = dottedMatch[1];
                    const m = dottedMatch[2].padStart(2, '0');
                    const d = dottedMatch[3].padStart(2, '0');
                    finalDate = `${y}-${m}-${d}`;
                  } else if (/^\d{8}$/.test(clean)) {
                    // "20250515" 형태 보정
                    finalDate = `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
                  } else if (/^\d{2}-\d{2}-\d{2}$/.test(clean)) {
                    // "25-05-15" 형태 보정
                    finalDate = `20${clean}`;
                  } else if (/^\d{6}$/.test(clean)) {
                    // "250515" 형태 보정
                    finalDate = `20${clean.substring(0, 2)}-${clean.substring(2, 4)}-${clean.substring(4, 6)}`;
                  } else {
                    // 완전히 깨진 포맷(예: "610-98-81") -> 연도별 기본 임시 날짜 강제 주입하여 400 방지
                    const baseYear = a.year === 1 ? 2025 : (a.year === 2 ? 2026 : (a.year === 3 ? 2027 : (a.year === 4 ? 2028 : 2029)));
                    finalDate = `${baseYear}-05-15`;
                  }
                }
                
                return {
                  year: a.year,
                  date: finalDate,
                  center: a.center,
                  organizations: a.organizations,
                  subject_univ: a.subjectUniversity || "",
                  subject_org: a.subjectOrganization || "",
                  unit_id: a.unitId || "",
                  contents: a.contents || [],
                  file_name: a.fileName || null,
                  file_data: a.fileData || null,
                  agreement_type: a.agreementType || "-"
                };
              })
            );
            if (error) throw error;
          }
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync agreements to Supabase:", e);
        setSyncStatus("error");
      }
    };
    syncImmediate();
  }, [agreements, isDbLoaded, isFetchCompleted]);

  // 10) Press Releases (언론보도) 자동 저장 디바운스 훅 (타 연차 기사 지능형 즉시 분배 저장 탑재)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;

    // 기사 날짜 기준 연차(1~5) 자동 계산 헬퍼
    const getCalculatedYearFromDate = (dateStr) => {
      if (!dateStr) return selectedYear;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return selectedYear;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      let calcYear = year;
      if (month < 3) {
        calcYear = year - 1;
      }
      return calcYear === 2025 ? 1 : calcYear === 2026 ? 2 : calcYear === 2027 ? 3 : calcYear === 2028 ? 4 : calcYear === 2029 ? 5 : selectedYear;
    };

    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;

    // 💡 철통 방어망: 현재 화면의 데이터가 속한 연차(activeDataYear)와 탭 연차(selectedYear)가 다르면 즉시 중단!
    // 이는 비동기 로딩 및 탭 전환 타이밍에 발생하는 치명적인 Race Condition 삭제 버그를 완벽히 막아줍니다.
    if (activeDataYear !== selectedYear) return;

    // 💡 Race Condition 방지: 방금 DB에서 가져온 상태 그대로라면(사용자 수정 없음) Auto-save를 수행하지 않음.
    // 이는 빈 배열([])일 때 isStaleState 가 실패하여 타 연차 DB를 싹 지워버리는 치명적인 버그를 완벽히 막아줍니다.
    if (JSON.stringify(pressReleases) === fetchedPressReleasesRef.current) {
      return;
    }

    // 💡 탭(연차) 전환 시, 데이터를 새로 패치하기 전의 과거 연차 상태(Stale State)에서 자동저장이 도는 것을 방지
    // 이 처리가 없으면 과거 연차 데이터가 '타 연차 기사'로 오인되어 이전 연차 DB에 계속 무한 중복 Insert 됨!
    const isStaleState = pressReleases.length > 0 && pressReleases.some(s => s.year !== selectedYear);
    if (isStaleState) {
      return; // DB 패치가 완료되어 s.year === selectedYear 로 맞춰질 때까지 대기
    }

    // 💡 타 연차에 해당하는 기사들 (사용자가 날짜를 다른 연차로 수정한 경우)
    const otherYearPress = pressReleases.filter(s => getCalculatedYearFromDate(s.broadcastDate) !== selectedYear);

    // 현재 선택된 연차에 속하는 기사들만 추출
    const currentYearPress = pressReleases.filter(s => getCalculatedYearFromDate(s.broadcastDate) === selectedYear);

    // 로컬스토리지에는 현재 연차 보도자료 저장
    localStorage.setItem(`anchor_cache_press_y${selectedYear}`, JSON.stringify(currentYearPress));
    setSyncStatus("syncing");

    const formatToPostgresTimestamp = (dateStr) => {
      if (!dateStr) return new Date().toISOString();
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return new Date().toISOString();
      
      const pad = (n) => String(n).padStart(2, "0");
      const yyyy = parsed.getFullYear();
      const mm = pad(parsed.getMonth() + 1);
      const dd = pad(parsed.getDate());
      const hh = pad(parsed.getHours());
      const mi = pad(parsed.getMinutes());
      const ss = pad(parsed.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}+09`;
    };
    
    const syncPressImmediate = async () => {
      try {
        // --- 1단계: 타 연차 기사가 발견되었을 경우 해당 연차 DB에 단독 Insert 및 청소 ---
        if (otherYearPress.length > 0) {
          let hasError = false;
          for (const item of otherYearPress) {
            const targetYear = getCalculatedYearFromDate(item.broadcastDate);
            console.log(`타 연차 기사 감지: ${item.title} -> ${targetYear}차년도 DB로 직접 저장합니다.`);
            
            let insertPayload = {
              year: targetYear,
              type: item.type || "기타",
              media: item.media || "미상",
              title: item.title || "새 보도자료",
              broadcast_date: formatToPostgresTimestamp(item.broadcastDate),
              content_url: item.contentUrl || "https://www.uc.ac.kr",
              press_content: item.pressContent || ""
            };

            let singleInsertErr = null;
            if (window.__HAS_NO_ADVANCED_PRESS_COLUMNS__) {
              const { press_content, ...rest } = insertPayload;
              const { error } = await supabase.from("press_releases").insert(rest);
              singleInsertErr = error;
            } else {
              const { error } = await supabase.from("press_releases").insert(insertPayload);
              singleInsertErr = error;
              if (singleInsertErr) {
                console.warn("DB에 press_releases 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", singleInsertErr);
                window.__HAS_NO_ADVANCED_PRESS_COLUMNS__ = true;
                const { press_content, ...rest } = insertPayload;
                const { error: fallbackErr } = await supabase.from("press_releases").insert(rest);
                singleInsertErr = fallbackErr;
              }
            }

            if (singleInsertErr) {
              console.error(`Failed to insert press release to year ${targetYear}:`, singleInsertErr);
              alert(`📡 타 연차 보도자료 DB 저장 중 오류가 발생했습니다.\n\n[오류 원인]: ${singleInsertErr.message || singleInsertErr}`);
              hasError = true;
            } else {
              // 💡 성공 시 해당 연차의 로컬 캐시도 즉시 업데이트하여 깜빡임 및 누락 예방
              try {
                const cachedPressStr = localStorage.getItem(`anchor_cache_press_y${targetYear}`);
                const cachedPressList = cachedPressStr ? JSON.parse(cachedPressStr) : [];
                if (!cachedPressList.some(p => p.title === item.title && p.broadcastDate === item.broadcastDate)) {
                  const updatedCache = [item, ...cachedPressList];
                  localStorage.setItem(`anchor_cache_press_y${targetYear}`, JSON.stringify(updatedCache));
                }
              } catch (cacheErr) {
                console.warn("Failed to update target year cache:", cacheErr);
              }
            }
          }

          if (!hasError) {
            // 성공했을 때만 현재 연차 상태에서 제거 (클로저 Race Condition 방지를 위해 ID 기반 필터링 적용)
            const otherIds = otherYearPress.map(item => item.id);
            setPressReleases(prev => prev.filter(s => !otherIds.includes(s.id)));
            // alert는 다른 화면(상장/이수증 등)을 보고 있을 때 방해되므로 제거하고 조용히 백그라운드 처리
            console.log(`[언론보도] 타 연차(${getCalculatedYearFromDate(otherYearPress[0].broadcastDate)}차년도)로 기사가 자동 이동되었습니다.`);
          }
          setSyncStatus(hasError ? "error" : "synced");
          return;
        }

        // --- 2단계: 원래 선택된 현재 연차 기사들의 정상 동기화 처리 ---
        const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
        const startDateStr = `${targetYearNum}-03-01T00:00:00+09:00`;
        const endDateStr = `${targetYearNum + 1}-03-01T00:00:00+09:00`;

        const { data: currentDbItems, error: fetchErr } = await supabase
          .from("press_releases")
          .select("id")
          .gte("broadcast_date", startDateStr)
          .lt("broadcast_date", endDateStr);
          
        if (fetchErr) {
          console.error("Failed to fetch current press releases to rollback backup:", fetchErr);
          setSyncStatus("error");
          return;
        }

        const oldIds = (currentDbItems || []).map(item => item.id);

        if (currentYearPress.length > 0) {
          const insertPayload = currentYearPress.map(s => ({
            year: selectedYear,
            type: s.type || "기타",
            media: s.media || "미상",
            title: s.title || "새 보도자료",
            broadcast_date: formatToPostgresTimestamp(s.broadcastDate),
            content_url: s.contentUrl || "https://www.uc.ac.kr",
            press_content: s.pressContent || ""
          }));

          let insertErr = null;
          if (window.__HAS_NO_ADVANCED_PRESS_COLUMNS__) {
            const safePayload = insertPayload.map(item => {
              const { press_content, ...rest } = item;
              return rest;
            });
            const { error } = await supabase.from("press_releases").insert(safePayload);
            insertErr = error;
          } else {
            const { error } = await supabase.from("press_releases").insert(insertPayload);
            insertErr = error;
            if (insertErr) {
              console.warn("DB에 press_releases 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", insertErr);
              window.__HAS_NO_ADVANCED_PRESS_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => {
                const { press_content, ...rest } = item;
                return rest;
              });
              const { error: fallbackErr } = await supabase.from("press_releases").insert(safePayload);
              insertErr = fallbackErr;
            }
          }

          if (insertErr) {
            console.error("Failed to insert new press releases:", insertErr);
            alert(`📡 데이터베이스 저장 오류가 검출되었습니다.\n\n[오류 원인]: ${insertErr.message || insertErr}\n\n데이터 유실 방지를 위해 기존 보도 대장은 안전하게 롤백/보존되었습니다.`);
            setSyncStatus("error");
            return;
          }
        }

        if (oldIds.length > 0) {
          const { error: deleteErr } = await supabase
            .from("press_releases")
            .delete()
            .in("id", oldIds);
            
          if (deleteErr) {
            console.error("Failed to clean up old press releases:", deleteErr);
          }
        }
        // 💡 성공적인 Sync 완료 후, 현재 화면의 상태를 "순수 상태"로 참조 업데이트하여 무한 루프 방지
        fetchedPressReleasesRef.current = JSON.stringify(pressReleases);
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync press releases:", e);
        setSyncStatus("error");
      }
    };
    syncPressImmediate();
  }, [pressReleases, selectedYear, isDbLoaded, isFetchCompleted]);

  // 3-2) Unified Certificates 자동 저장 디바운스 훅 (통합 캐시 사용 및 selectedYear 의존성 배제)
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    // 💡 안전 가드: 데이터 로딩이 완료되지 않았거나 일시적 통신 지연 시 빈 배열([])이 원격 DB를 덮어쓰는 사고 방지
    if (!unifiedCertificates || unifiedCertificates.length === 0) return;
    try {
      const clean = unifiedCertificates.map(item => ({ ...item, fileData: null }));
      localStorage.setItem("anchor_cache_unified_certificates_all", JSON.stringify(clean));
    } catch (e) {
      console.warn("Failed to write unified certificates cache:", e);
    }
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const activeYears = Array.from(new Set([selectedYear, ...unifiedCertificates.map(c => c.year)]));
        for (const yr of activeYears) {
          await supabase.from("unified_certificates").delete().eq("year", yr);
          const filtered = unifiedCertificates.filter(c => c.year === yr);
          if (filtered.length > 0) {
            const { error } = await supabase.from("unified_certificates").insert(
              filtered.map(c => ({
                year: c.year,
                manager_dept: c.managerDept,
                manager_name: c.managerName,
                cert_no: c.certNo,
                cert_type: c.certType,
                note: c.note,
                team_name: c.teamName,
                recipient_name: c.recipientName,
                student_id: c.studentId,
                birth_date: c.birthDate,
                phone: c.phone,
                issue_date: c.issueDate,
                project_group: c.projectGroup,
                issuer: c.issuer,
                content: c.content,
                award_type: c.awardType || null
              }))
            );
            if (error) throw error;
          }
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync unified certificates to Supabase:", e);
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [unifiedCertificates, isDbLoaded, isFetchCompleted]);

  // 3-3) Scholarships 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    // 💡 안전 가드: 데이터 로딩이 완료되지 않았거나 일시적 통신 지연 시 빈 배열([])이 원격 DB를 덮어쓰는 사고 방지
    if (!scholarships || scholarships.length === 0) return;
    try {
      const clean = scholarships.map(item => ({ ...item }));
      localStorage.setItem("anchor_cache_scholarships_all", JSON.stringify(clean));
    } catch (e) {
      console.warn("Failed to write scholarships cache:", e);
    }
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const activeYears = Array.from(new Set([selectedYear, ...scholarships.map(c => c.year)]));
        for (const yr of activeYears) {
          await supabase.from("scholarships_view").delete().eq("year", yr);
          const filtered = scholarships.filter(c => c.year === yr);
          if (filtered.length > 0) {
            const payload = filtered.map(item => ({
              year: item.year,
              dept: item.dept,
              major: item.major,
              course: item.course,
              student_id: item.studentId,
              name: item.name,
              resident_id: item.residentId,
              grade: item.grade,
              enroll_status: item.enrollStatus,
              reg_status: item.regStatus,
              amount: item.amount,
              bank_name: item.bankName,
              account_num: item.accountNum,
              account_holder: item.accountHolder,
              approval_date: item.approvalDate
            }));
            const { error } = await supabase.from("scholarships_view").insert(payload);
            if (error) throw error;
          }
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync scholarships to Supabase:", e);
        setSyncStatus("error");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [scholarships, isDbLoaded, isFetchCompleted]);

  // 4) Procurement Env 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_env_y${selectedYear}`, JSON.stringify(envData));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await supabase.from("procurement_env").delete().eq("year", selectedYear);
        if (envData.length > 0) {
          const insertPayload = envData.map(e => ({
            year: selectedYear,
            title: e.title,
            unit: e.unit,
            plan: e.plan,
            meeting_result: e.meetingResult,
            progress: e.progress,
            budget_plan: e.budgetPlan,
            budget_spent: e.budgetSpent,
            location: e.location,
            purpose: e.purpose,
            birdseye_view: e.birdseyeView,
            blueprints: e.blueprints,
            utilization: e.utilization,
            dept_name: e.deptName || "",
            division_name: e.divisionName || "",
            date_p: e.dateP || null,
            date_a: e.dateA || null,
            date_b: e.dateB || null,
            date_pr: e.datePr || null,
            date_i: e.dateI || null,
            doc_plan: e.docPlan || "",
            doc_purchase: e.docPurchase || "",
            doc_bid: e.docBid || "",
            doc_plan_file_name: e.docPlanFileName || "",
            doc_purchase_file_name: e.docPurchaseFileName || "",
            doc_bid_file_name: e.docBidFileName || "",
            doc_plan_file_size: Number(e.docPlanFileSize) || 0,
            doc_purchase_file_size: Number(e.docPurchaseFileSize) || 0,
            doc_bid_file_size: Number(e.docBidFileSize) || 0,
            doc_plan_file_url: e.docPlanFileUrl || "",
            doc_purchase_file_url: e.docPurchaseFileUrl || "",
            doc_bid_file_url: e.docBidFileUrl || "",
            ai_proposal_data: e.aiProposalData || null,
            ai_purchase_data: e.aiPurchaseData || null,
            ai_bid_data: e.aiBidData || null,
            related_docs: e.relatedDocs || ""
          }));

          let error = null;

          if (window.__HAS_NO_ADVANCED_ENV_COLUMNS__) {
            const safePayload = insertPayload.map(item => {
              const { 
                dept_name, division_name, date_p, date_a, date_b, date_pr, date_i,
                doc_plan, doc_purchase, doc_bid,
                doc_plan_file_name, doc_purchase_file_name, doc_bid_file_name,
                doc_plan_file_size, doc_purchase_file_size, doc_bid_file_size,
                doc_plan_file_url, doc_purchase_file_url, doc_bid_file_url,
                ai_proposal_data, ai_purchase_data, ai_bid_data, related_docs,
                ...rest 
              } = item;
              return rest;
            });
            const { error: retryErr } = await supabase.from("procurement_env").insert(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } = await supabase.from("procurement_env").insert(insertPayload);
            error = firstErr;

            if (error) {
              console.warn("DB에 procurement_env 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", error);
              window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => {
                const { 
                  dept_name, division_name, date_p, date_a, date_b, date_pr, date_i,
                  doc_plan, doc_purchase, doc_bid,
                  doc_plan_file_name, doc_purchase_file_name, doc_bid_file_name,
                  doc_plan_file_size, doc_purchase_file_size, doc_bid_file_size,
                  doc_plan_file_url, doc_purchase_file_url, doc_bid_file_url,
                  ai_proposal_data, ai_purchase_data, ai_bid_data, related_docs,
                  ...rest 
                } = item;
                return rest;
              });
              const { error: retryErr } = await supabase.from("procurement_env").insert(safePayload);
              error = retryErr;
            }
          }

          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (e) {
        setSyncStatus("error");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [envData, selectedYear, isDbLoaded, isFetchCompleted]);

  // 5) Procurement Equipment 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_equip_y${selectedYear}`, JSON.stringify(equipData));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await supabase.from("procurement_equipment").delete().eq("year", selectedYear);
        if (equipData.length > 0) {
          const insertPayload = equipData.map(e => ({
            year: selectedYear,
            unit: e.unit || "A1",
            seq: Number(e.seq) || 1,
            dept_name: e.deptName || "",
            division_name: e.divisionName || "",
            item_name: e.itemName || e.name || "",
            unit_price: Number(e.unitPrice) || 0,
            quantity: Number(e.quantity) || 1,
            description: e.description || "",
            operation: e.operation || "교과목(정규)",
            password: e.password || "1234",
            related_docs: e.relatedDocs || [e.docPlan, e.docPurchase, e.docBid].filter(Boolean).join(", "),
            doc_plan: e.docPlan || "",
            doc_purchase: e.docPurchase || "",
            doc_bid: e.docBid || "",
            date_p: e.dateP || null,
            date_a: e.dateA || null,
            date_b: e.dateB || null,
            date_pr: e.datePr || null,
            date_i: e.date_i || e.dateI || null
          }));

          let error = null;

          if (window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__) {
            const safePayload = insertPayload.map(item => {
              const { 
                date_p, date_a, date_b, date_pr, date_i,
                doc_plan, doc_purchase, doc_bid,
                ...rest 
              } = item;
              return rest;
            });
            const { error: retryErr } = await supabase.from("procurement_equipment").insert(safePayload);
            error = retryErr;
          } else {
            const { error: firstErr } = await supabase.from("procurement_equipment").insert(insertPayload);
            error = firstErr;

            if (error) {
              console.warn("DB에 procurement_equipment 신규 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", error);
              window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = true;
              const safePayload = insertPayload.map(item => {
                const { 
                  date_p, date_a, date_b, date_pr, date_i,
                  doc_plan, doc_purchase, doc_bid,
                  ...rest 
                } = item;
                return rest;
              });
              const { error: retryErr } = await supabase.from("procurement_equipment").insert(safePayload);
              error = retryErr;
            }
          }

          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync procurement_equipment:", e);
        setSyncStatus("error");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [equipData, selectedYear, isDbLoaded, isFetchCompleted]);

  // 6) Procurement Services 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_serv_y${selectedYear}`, JSON.stringify(serviceData));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await supabase.from("procurement_services").delete().eq("year", selectedYear);
        if (serviceData.length > 0) {
          const insertPayload = serviceData.map(s => ({
          year: selectedYear,
          unit: s.unit || "A1",
          program_id: s.programId || "",
          program_name: s.programName || "",
          dept_name: s.deptName || "",
          division_name: s.divisionName || "",
          password: s.password || "1234",
          related_docs: s.relatedDocs || "",
          title: s.title,
          purpose: s.purpose,
          provider_qual: s.providerQual,
          step: s.step || 1,
          budget_plan: s.budgetPlan,
          budget_spent: s.budgetSpent,
          op_result: s.opResult,
          // 7대 절차 날짜
          date_pp: s.datePp || null,
          date_rfo: s.dateRfo || null,
          date_b: s.dateB || null,
          date_es: s.dateEs || null,
          date_c: s.dateC || null,
          date_e: s.dateE || null,
          date_i: s.dateI || null,
          // 3종 관련 문서 및 AI 데이터
          doc_plan: s.docPlan || "",
          doc_purchase: s.docPurchase || "",
          doc_bid: s.doc_bid || s.docBid || "",
          doc_plan_file_name: s.docPlanFileName || "",
          doc_purchase_file_name: s.docPurchaseFileName || "",
          doc_bid_file_name: s.docBidFileName || "",
          doc_plan_file_size: Number(s.docPlanFileSize) || 0,
          doc_purchase_file_size: Number(s.docPurchaseFileSize) || 0,
          doc_bid_file_size: Number(s.docBidFileSize) || 0,
          doc_plan_file_url: s.docPlanFileUrl || "",
          doc_purchase_file_url: s.docPurchaseFileUrl || "",
          doc_bid_file_url: s.docBidFileUrl || "",
          ai_proposal_data: s.aiProposalData || null,
          ai_purchase_data: s.aiPurchaseData || null,
          ai_bid_data: s.aiBidData || null
        }));

        let error = null;

        if (window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__) {
          const safePayload = insertPayload.map(item => ({
            year: item.year,
            title: item.title,
            step: item.step,
            budget_plan: item.budget_plan,
            budget_spent: item.budget_spent,
            op_result: item.op_result
          }));
          const { error: retryErr } = await supabase.from("procurement_services").insert(safePayload);
          error = retryErr;
        } else {
          const { error: firstErr } = await supabase.from("procurement_services").insert(insertPayload);
          error = firstErr;

          if (error) {
            console.warn("DB에 procurement_services 고도화 컬럼이 식별되지 않아 안전 폴백 저장을 시도합니다.", error);
            window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = true;
            const safePayload = insertPayload.map(item => ({
              year: item.year,
              title: item.title,
              step: item.step,
              budget_plan: item.budget_plan,
              budget_spent: item.budget_spent,
              op_result: item.op_result
            }));
            const { error: retryErr } = await supabase.from("procurement_services").insert(safePayload);
            error = retryErr;
          }
        }

        if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (e) {
        setSyncStatus("error");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [serviceData, selectedYear, isDbLoaded, isFetchCompleted]);

  // 7) Schedule Monthly 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_month_y${selectedYear}`, JSON.stringify(monthlySchedules));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await supabase.from("schedule_monthly").delete().eq("year", selectedYear);
        if (monthlySchedules.length > 0) {
          const { error } = await supabase.from("schedule_monthly").insert(
            monthlySchedules.map(s => ({
              year: selectedYear,
              title: s.title,
              type: s.type || "기타",
              dept: s.dept || "사업운영팀",
              start_at: s.startAt,
              end_at: s.endAt,
              location: s.location || "",
              is_task: s.isTask || false,
              is_deadline: s.isDeadline || false,
              completed: s.completed || false,
              attendees: s.attendees || ""
            }))
          );
          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync monthly schedules:", e);
        setSyncStatus("error");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [monthlySchedules, selectedYear, isDbLoaded, isFetchCompleted]);

  // 8) Schedule Events 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_event_y${selectedYear}`, JSON.stringify(eventSchedules));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await supabase.from("schedule_events").delete().eq("year", selectedYear);
        if (eventSchedules.length > 0) {
          const { error } = await supabase.from("schedule_events").insert(
            eventSchedules.map(s => ({
              year: getCalculatedYearFromDate(s.datetime ? s.datetime.substring(0, 10) : null, selectedYear),
              month: s.month,
              title: s.title,
              department: s.department,
              location: s.location,
              attendees_internal: s.attendeesInternal,
              attendees_external: s.attendeesExternal,
              program: s.program,
              purpose: s.purpose,
              result: s.result,
              datetime: s.datetime
            }))
          );
          if (error) throw error;
        }
        setSyncStatus("synced");
      } catch (e) {
        setSyncStatus("error");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [eventSchedules, selectedYear, isDbLoaded, isFetchCompleted]);

  // 9) Schedule Meetings 자동 저장 디바운스 훅
  useEffect(() => {
    if (!isDbLoaded || !isFetchCompleted) return;
    if (!currentUser || currentRole?.id === "GUEST") return;
    localStorage.setItem(`anchor_cache_meet_y${selectedYear}`, JSON.stringify(meetingSchedules));
    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        await supabase.from("schedule_meetings").delete().eq("year", selectedYear);
        if (meetingSchedules.length > 0) {
          const { error } = await supabase.from("schedule_meetings").insert(
            meetingSchedules.map(s => ({
              year: getCalculatedYearFromDate(s.datetime ? s.datetime.substring(0, 10) : null, selectedYear),
              month: s.month,
              category: s.category,
              title: s.title,
              location: s.location,
              attendees_internal: s.attendeesInternal,
              attendees_external: s.attendeesExternal,
              agenda: s.agenda,
              result: s.result,
              datetime: s.datetime,
              audio_url: s.audioUrl,
              pdf_url: s.pdfUrl
            }))
          );
          if (error) {
            console.error("Failed to sync meeting schedules with database:", error);
            setSyncStatus("error");
            return;
          }
        }
        setSyncStatus("synced");
      } catch (e) {
        console.error("Failed to sync meeting schedules:", e);
        setSyncStatus("error");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [meetingSchedules, selectedYear, isDbLoaded, isFetchCompleted]);


  // 1차년도용 단위과제 필터링 및 이름/ID 변환
  const getNormalizedProjectsForRendering = (rawProjects, yr) => {
    if (!rawProjects) return [];
    
    const cloned = JSON.parse(JSON.stringify(rawProjects));
    
    if (yr !== 1) {
      // 2~5차년도에는 해당 연도의 프로그램만 필터링
      return cloned.map(p => {
        const newUnits = p.units.map(u => {
          return {
            ...u,
            programs: u.programs.filter(prog => prog.years && prog.years[yr])
          };
        });
        return { ...p, units: newUnits };
      });
    }

    // 1차년도에 A1나 및 공통 E는 필터링 제외
    const mapping = {
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

    return cloned.map(p => {
      if (p.id === "E") return null;

      const newUnits = p.units
        .filter(u => u.id !== "A1나")
        .map(u => {
          const mapInfo = mapping[u.id];
          const filteredPrograms = u.programs.filter(prog => prog.years && prog.years[1]);
          if (mapInfo) {
            return {
              ...u,
              id: mapInfo.id,
              title: mapInfo.title,
              programs: filteredPrograms
            };
          }
          return {
            ...u,
            programs: filteredPrograms
          };
        });

      return {
        ...p,
        units: newUnits
      };
    }).filter(Boolean);
  };

  const displayProjects = getNormalizedProjectsForRendering(projects, selectedYear);

  // 성과지표 subTab이 노출 여부 설정에 의해 가려졌을 때 활성화 탭을 자동으로 숨겨지지 않은 유효 탭으로 보정
  useEffect(() => {
    // 관리자(단장, 운영팀장, 본부장, ADMIN 등)는 숨겨진 탭도 직접 관리할 수 있도록 튕김 예외 처리
    if (isSongDirector) return;

    if (activeTab === "kpis" && menuVisibility) {
      const isStatusVisible = menuVisibility.kpi_status !== false;
      const isSelfVisible = menuVisibility.kpi_self !== false;
      const isFocusVisible = menuVisibility.kpi_focus !== false;

      if (kpiSubTab === "공통" && !isStatusVisible) {
        if (isSelfVisible) {
          setKpiSubTab("자율");
          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "자율");
          setSelectedKpi(first || null);
        } else if (isFocusVisible) {
          setKpiSubTab("중점");
          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "중점");
          setSelectedKpi(first || null);
        }
      } else if (kpiSubTab === "자율" && !isSelfVisible) {
        if (isStatusVisible) {
          setKpiSubTab("공통");
          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "공통");
          setSelectedKpi(first || null);
        } else if (isFocusVisible) {
          setKpiSubTab("중점");
          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "중점");
          setSelectedKpi(first || null);
        }
      } else if (kpiSubTab === "중점" && !isFocusVisible) {
        if (isStatusVisible) {
          setKpiSubTab("공통");
          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "공통");
          setSelectedKpi(first || null);
        } else if (isSelfVisible) {
          setKpiSubTab("자율");
          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "자율");
          setSelectedKpi(first || null);
        }
      }
    }
  }, [activeTab, menuVisibility, kpiSubTab, displayProjects]);


  // 새로고침 시 스크롤 위치 영속성 복원 훅 (.main-content 컨테이너 대상)
  useEffect(() => {
    const mainEl = document.querySelector(".main-content");
    if (!mainEl) {
      setIsScrollRestored(true);
      return;
    }

    // 의존성 변경에 따라 렌더링이 튈 때 임시로 투명도를 낮추어 스크롤 튐을 감춤
    setIsScrollRestored(false);

    // 1. 페이지를 벗어나거나 새로고침할 때 현재 메인 영역 스크롤 위치 저장
    const handleSaveScroll = () => {
      localStorage.setItem("anchor_scroll_y", String(mainEl.scrollTop));
    };

    // 2. 실시간 스크롤 움직임 추적 (디바운스 적용)
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (mainEl.scrollTop > 0) {
          localStorage.setItem("anchor_scroll_y", String(mainEl.scrollTop));
        }
      }, 150);
    };

    window.addEventListener("beforeunload", handleSaveScroll);
    mainEl.addEventListener("scroll", handleScroll);

    // 3. 마운트 완료 후 이전 스크롤 위치 복원 (지연 복원 보장)
    const savedScrollY = localStorage.getItem("anchor_scroll_y");
    let hasSavedScroll = false;
    
    if (savedScrollY) {
      const scrollY = parseInt(savedScrollY, 10);
      if (scrollY > 0) {
        hasSavedScroll = true;
        // 복원 및 페이드인 타이밍 정합성 통제
        setTimeout(() => {
          if (mainEl) mainEl.scrollTop = scrollY;
          setIsScrollRestored(true); // 첫 스크롤 복원 직후 투명도를 켜서 페이드인
        }, 120);
        setTimeout(() => {
          if (mainEl) mainEl.scrollTop = scrollY;
        }, 350);
        setTimeout(() => {
          if (mainEl) mainEl.scrollTop = scrollY;
        }, 600);
      }
    }

    // 복원할 스크롤 정보가 없으면 즉시 투명도 복원
    if (!hasSavedScroll) {
      setTimeout(() => {
        setIsScrollRestored(true);
      }, 50);
    }

    return () => {
      window.removeEventListener("beforeunload", handleSaveScroll);
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [currentUser, activeTab, projectsSubTab, selectedProgId]);

  // 로컬스토리지에서 세션 확인 및 테마 설정
  useEffect(() => {
    const sessionUser = localStorage.getItem("anchor_logged_in_user");
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed && parsed.role && typeof parsed.role === "object" && parsed.role.id) {
          setCurrentUser(parsed);
        } else {
          console.warn("Invalid session role structure detected. Clearing session to prevent crash.");
          localStorage.removeItem("anchor_logged_in_user");
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("Failed to parse logged in user session:", e);
        localStorage.removeItem("anchor_logged_in_user");
        setCurrentUser(null);
      }
    }
  }, []);

  // 다크모드 바인딩
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.documentElement.classList.add("light-mode");
    }
    localStorage.setItem("anchor_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  // 비활성화된 메뉴에 접근 시 대시보드로 자동 리다이렉트하는 가드 (총감독/단장 권한은 예외 허용)
  useEffect(() => {
    if (activeTab && activeTab !== "dashboard" && menuVisibility[activeTab] === false) {
      if (!isSongDirector) {
        setActiveTab("dashboard");
      }
    }
  }, [activeTab, menuVisibility, isSongDirector]);

  // projects 상태 변경 시 localStorage 자동 기입 (새로고침 휘발 방지 우회책)
  useEffect(() => {
    try {
      localStorage.setItem("anchor_projects_data_v29", JSON.stringify(projects));
    } catch (e) {
      const isQuotaError = e.name === "QuotaExceededError" || e.code === 22 || e.number === -2147024882;
      if (isQuotaError) {
        console.warn("로컬 스토리지 공간이 부족합니다. 이전 구버전 캐시를 청소하고 재시도합니다...");
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("anchor_projects_data_") && key !== "anchor_projects_data_v29") {
              localStorage.removeItem(key);
            }
          });
          localStorage.setItem("anchor_projects_data_v29", JSON.stringify(projects));
          console.log("이전 캐시 청소 및 데이터 재저장 성공");
        } catch (retryError) {
          console.error("이전 캐시 청소 후에도 로컬 스토리지 기입 실패:", retryError);
        }
      } else {
        console.error("로컬 스토리지 기입 중 알 수 없는 예외 발생:", e);
      }
    }
  }, [projects]);

  /* 
   * [성과지표 자동 연계 UX 로직]
   * 사용자가 성과지표 관리('kpis') 탭에 진입하거나, 
   * 성과지표 서브탭('자율' 또는 '중점')을 전환할 때 빈 화면을 보지 않도록 
   * 해당 서브탭 유형에 맞는 첫 번째 성과지표를 자동으로 찾아 상세 조회창(selectedKpi)에 설정합니다.
   */
  useEffect(() => {
    if (activeTab === "kpis") {
      // 모든 단위과제(units)의 성과지표(kpis) 중에서 현재 선택된 서브탭 유형('자율'/'중점')과 일치하는 첫 번째 지표를 검색합니다.
      const firstKpi = projects
        .flatMap((p) => p.units.flatMap((u) => u.kpis || []))
        .find((k) => k ? k.type === kpiSubTab : false);
      
      // 검색된 첫 번째 지표가 있으면 자동으로 조회 대상으로 설정하고, 없으면 null로 초기화합니다.
      setSelectedKpi(firstKpi || null);
    }
  }, [activeTab, kpiSubTab, projects]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("anchor_logged_in_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("anchor_logged_in_user");
  };

  // 엑셀 업로드로 데이터 실시간 갱신 (본사업비/이월비 구분 갱신 및 다년도 연쇄 이월 반영)
  const handleUpdateData = (excelJson, type) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));

      if (type === "BUDGET") {
        // 프로그램ID별로 행들을 그룹화
        const progRows = {};
        excelJson.forEach(row => {
          const pid = row["프로그램ID"];
          if (pid) {
            if (!progRows[pid]) progRows[pid] = [];
            progRows[pid].push(row);
          }
        });

        // 각 프로그램ID별로 본예산 행과 이월예산 행을 조합하여 롤업 업데이트 실행
        Object.keys(progRows).forEach(progId => {
          const rows = progRows[progId];
          const mainRow = rows.find(r => r["예산구분"] === "본예산") || {};
          const carryRow = rows.find(r => r["예산구분"] === "이월예산") || {};

          updated.forEach((p) => {
            p.units.forEach((u) => {
              u.programs.forEach((prog) => {
                if (prog.id === progId) {
                  const py = prog.years?.[selectedYear];
                  if (py) {
                    // 1. 재원별 본예산 및 이월예산 원화 단위(* 1,000,000)로 파싱하여 대입
                    const bNational = Math.round((parseFloat(mainRow["국고"]) || 0) * 1000000);
                    const bCity = Math.round((parseFloat(mainRow["지자체시비"]) || 0) * 1000000);
                    const bExternal = Math.round((parseFloat(mainRow["외부사업비"]) || 0) * 1000000);
                    
                    const bCarryNational = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["국고"]) || 0) * 1000000);
                    const bCarryCity = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["지자체시비"]) || 0) * 1000000);
                    const bCarryExternal = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["외부사업비"]) || 0) * 1000000);

                    py.budget_national = bNational;
                    py.budget_city = bCity;
                    py.budget_external = bExternal;
                    py.budget_main = bNational + bCity; // 본예산 입력 우선 합산 (외부사업비 제외)

                    py.budget_carry_national = bCarryNational;
                    py.budget_carry_city = bCarryCity;
                    py.budget_carry_external = bCarryExternal;
                    py.budget_carry = bCarryNational + bCarryCity; // 이월예산 입력 우선 합산 (외부사업비 제외)

                    // 2. 10대 비목별 요소 파싱 및 0원 초과 비목 필터링 롤업 (최대 4개 제한)
                    const standardCategories = [
                      { label: "인건비", dbCategory: "인건비" },
                      { label: "장학금", dbCategory: "장학금" },
                      { label: "프로그램개발운영비", dbCategory: "교육∙연구 프로그램 개발∙운영비" },
                      { label: "환경개선비", dbCategory: "교육∙연구 환경개선비" },
                      { label: "실험실습장비비", dbCategory: "실험∙실습장비 및 기자재 구입∙운영비" },
                      { label: "지역연계협업비", dbCategory: "지역 연계∙협업 지원비" },
                      { label: "기업지원협력비", dbCategory: "기업 지원∙협력 활동비" },
                      { label: "성과활용확산비", dbCategory: "성과 활용∙확산 지원비" },
                      { label: "기타사업운영경비", dbCategory: "그 밖의 사업운영경비" },
                      { label: "간접비", dbCategory: "간접비" }
                    ];

                    const cats = [];
                    standardCategories.forEach(cat => {
                      const budgetVal = parseFloat(mainRow[cat.label]) || 0;
                      const carryVal = parseFloat(carryRow[cat.label]) || 0;
                      
                      if (budgetVal > 0 || carryVal > 0) {
                        // 기존에 이미 등록되어 있던 비목이면 spent/spent_carry 집행액 정보를 보존
                        const existing = (py.budget_categories || []).find(c => c.category === cat.dbCategory) || {};
                        cats.push({
                          category: cat.dbCategory,
                          budget: Math.round(budgetVal * 1000000),
                          budget_carry: Math.round(carryVal * 1000000),
                          spent: existing.spent || 0,
                          spent_carry: existing.spent_carry || 0
                        });
                      }
                    });
                    
                    // UI 기획 슬롯 제약에 맞춰 금액이 0보다 큰 비목 중 선입된 최대 4개까지만 배정
                    py.budget_categories = cats.slice(0, 4);

                    // 3. 프로그램 최상위 레거시 예산/집행 필드도 현재 5개년 연도 정보 기준으로 롤업 일치화
                    if (selectedYear === 2) {
                      prog.budget_2026 = py.budget_main;
                      prog.budget_2025_carry = py.budget_carry;
                      prog.budget = prog.budget_2026 + prog.budget_2025_carry;
                    } else if (selectedYear === 1) {
                      prog.budget_2025_carry = 0;
                      prog.budget = py.budget_main;
                    } else {
                      prog.budget = py.budget_main + py.budget_carry;
                    }

                    // 프로그램의 5개년 이월 예산 및 집행액 재계산 연쇄 작동
                    recalculateCarryOver(prog.years);
                  }
                }
              });
              
              // 해당 단위과제에 소속된 세부 프로그램들의 비목별 배정계획을 10대 표준비목으로 쪼개서 실시간 롤업 동기화
              const categorySums = {
                "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
              };

              u.programs.forEach(prog => {
                const py = prog.years?.[selectedYear] || {};
                const progTotalMain = py.budget_main || 0;
                const progTotalCarry = py.budget_carry || 0;
                const progTotalSpent = py.spent_main || 0;
                const progTotalSpentCarry = py.spent_carry || 0;

                let allocatedMain = 0;
                let allocatedCarry = 0;
                let allocatedSpent = 0;
                let allocatedSpentCarry = 0;

                if (py.budget_categories && Array.isArray(py.budget_categories)) {
                  py.budget_categories.forEach(catItem => {
                    const catName = catItem.category;
                    if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                      const mainVal = catItem.budget || 0;
                      const carryVal = catItem.budget_carry || 0;
                      const spentVal = catItem.spent || 0;
                      const spentCarryVal = catItem.spent_carry || 0;

                      categorySums[catName].main += mainVal;
                      categorySums[catName].carry += carryVal;
                      categorySums[catName].spent_main += spentVal;
                      categorySums[catName].spent_carry += spentCarryVal;

                      allocatedMain += mainVal;
                      allocatedCarry += carryVal;
                      allocatedSpent += spentVal;
                      allocatedSpentCarry += spentCarryVal;
                    }
                  });
                }

                const remainMain = Math.max(0, progTotalMain - allocatedMain);
                const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
                categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
                categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
                categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
              });

              Object.keys(categorySums).forEach(catName => {
                if (!u.budgetDetails[catName]) {
                  u.budgetDetails[catName] = { years: {} };
                }
                if (!u.budgetDetails[catName].years[selectedYear]) {
                  u.budgetDetails[catName].years[selectedYear] = {
                    budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                  };
                }
                const tgt = u.budgetDetails[catName].years[selectedYear];
                tgt.budget_main = categorySums[catName].main;
                tgt.budget_carry = categorySums[catName].carry;
                tgt.spent_main = categorySums[catName].spent_main;
                tgt.spent_carry = categorySums[catName].spent_carry;
              });

              // 비목별 이월 재계산
              Object.keys(u.budgetDetails).forEach(key => {
                recalculateCarryOver(u.budgetDetails[key].years);
              });

              if (u.years[selectedYear]) {
                u.years[selectedYear].budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.budget_main || 0), 0);
                u.years[selectedYear].budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.budget_carry || 0), 0);
                u.years[selectedYear].spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.spent_main || 0), 0);
                u.years[selectedYear].spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.spent_carry || 0), 0);
              }
              
              // 단위과제 이월 재계산
              recalculateCarryOver(u.years);
            });
          });
        });
      } else if (type === "KPI") {
        excelJson.forEach((row) => {
          const subId = row["세부항목ID"];
          const currentVal = parseFloat(row["실적값(현재값)"]);
          
          if (subId && !isNaN(currentVal)) {
            updated.forEach((p) => {
              p.units.forEach((u) => {
                u.kpis.forEach((kpi) => {
                  let subItemFound = false;
                  kpi.subItems.forEach((sub) => {
                    if (sub.id === subId) {
                      if (!sub.years) sub.years = {};
                      if (!sub.years[selectedYear]) sub.years[selectedYear] = { target: 0, current: 0 };
                      sub.years[selectedYear].current = currentVal;
                      subItemFound = true;
                    }
                  });
                  if (subItemFound) {
                    const totalAchievement = kpi.subItems.reduce((sum, s) => {
                      const yData = s.years?.[selectedYear] || { target: 0, current: 0 };
                      const achievementRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                      return sum + achievementRate;
                    }, 0);
                    const avgAchievement = totalAchievement / kpi.subItems.length;
                    kpi.current = avgAchievement;
                    kpi.target = 100.0;
                  }
                });
              });
            });
          }
        });
      }

      return updated;
    });
  };

  // 결재 변경 승인요청 DB 조회 및 갱신 API 연동
  const fetchVersionRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("program_version_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      if (data) setVersionRequests(data);
    } catch (e) {
      console.error("Failed to fetch version requests:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "management" && mgmtSubTab === "approvals") {
      fetchVersionRequests();
    }
  }, [activeTab, mgmtSubTab]);

  const handleApproveRequest = async (req) => {
    try {
      const approverName = currentUser ? currentUser.name : "승인자";
      const { error: updateErr } = await supabase
        .from("program_version_requests")
        .update({
          status: "승인완료",
          approved_by: approverName,
          approved_at: new Date().toISOString()
        })
        .eq("id", req.id);
      
      if (updateErr) throw updateErr;

      // 실제 project_data에 적용 (changes.after 병합)
      const afterFields = req.changes.after;
      const targetUnitId = getRealUnitId(req.unit_id, selectedYear);
      
      setProjects((prevProjects) => {
        const updated = JSON.parse(JSON.stringify(prevProjects));
        let dataUpdated = false;

        updated.forEach((p) => {
          // p.year 매칭 확인
          const pYearVal = p.year === 2024 + selectedYear || p.year === selectedYear;
          if (pYearVal) {
            p.units.forEach((u) => {
              if (u.id === targetUnitId) {
                u.programs.forEach((prog) => {
                  if (String(prog.id) === String(req.program_id)) {
                    // 예산, 기획, 추진실적, 환류방안, KPI 등 changes.after의 정보를 전체 병합
                    Object.keys(afterFields).forEach((key) => {
                      if (key === "years" && afterFields.years) {
                        if (!prog.years) prog.years = {};
                        if (afterFields.years[selectedYear]) {
                          prog.years[selectedYear] = {
                            ...prog.years[selectedYear],
                            ...afterFields.years[selectedYear]
                          };
                        }
                      } else if (key === "pdca" && afterFields.pdca) {
                        prog.pdca = { ...prog.pdca, ...afterFields.pdca };
                      } else {
                        prog[key] = afterFields[key];
                      }
                    });
                    dataUpdated = true;
                  }
                });
              }
            });
            
            // Supabase 반영
            if (dataUpdated) {
              supabase.from("projects_data")
                .update({ data: p.data || p }) // p 통째로 갱신하여 JSON 트리 동기화
                .eq("year", 2024 + selectedYear)
                .then(({ error }) => {
                  if (error) console.error("Failed to sync project data after approval:", error);
                });
            }
          }
        });

        return updated;
      });

      alert("🎉 변경 사항 승인 완료! 프로그램 상세 기획 및 예산에 즉각 반영되었습니다.");
      setSelectedRequest(null);
      fetchVersionRequests();
    } catch (e) {
      console.error("Approve request error:", e);
      alert("승인 처리 도중 데이터베이스 오류가 발생했습니다.");
    }
  };

  const handleRejectRequest = async (req) => {
    try {
      const approverName = currentUser ? currentUser.name : "승인자";
      const { error } = await supabase
        .from("program_version_requests")
        .update({
          status: "반려",
          approved_by: approverName,
          approved_at: new Date().toISOString()
        })
        .eq("id", req.id);
      
      if (error) throw error;
      
      alert("🚨 변경 신청 반려 처리가 완료되었습니다.");
      setSelectedRequest(null);
      fetchVersionRequests();
    } catch (e) {
      console.error("Reject request error:", e);
      alert("반려 처리 도중 데이터베이스 오류가 발생했습니다.");
    }
  };

  const handleDeleteRequest = async (req) => {
    // 1) 권한 검사
    if (!isSongDirector) {
      alert("⚠️ 결재 내역 삭제 권한은 송경영 단장 및 관리자에게 있습니다.");
      return;
    }

    if (!window.confirm("정말 이 결재 내역을 삭제하시겠습니까?\n(승인 완료된 이력의 경우, 적용 이전 계획 상태로 프로그램 데이터가 강제 롤백됩니다.)")) {
      return;
    }

    try {
      // 2) DB에서 해당 결재 내역 삭제
      const { error: deleteErr } = await supabase
        .from("program_version_requests")
        .delete()
        .eq("id", req.id);
      
      if (deleteErr) throw deleteErr;

      // 3) 승인 완료된 이력인 경우 롤백(이전 계획 복원) 처리
      if (req.status === "승인완료") {
        const beforeFields = req.changes.before; // 이전 계획 데이터
        const targetUnitId = getRealUnitId(req.unit_id, selectedYear);

        setProjects((prevProjects) => {
          const updated = JSON.parse(JSON.stringify(prevProjects));
          let dataUpdated = false;

          updated.forEach((p) => {
            const pYearVal = p.year === 2024 + selectedYear || p.year === selectedYear;
            if (pYearVal) {
              p.units.forEach((u) => {
                if (u.id === targetUnitId) {
                  u.programs.forEach((prog) => {
                    if (String(prog.id) === String(req.program_id)) {
                      // 이전 계획 스냅샷(beforeFields)의 정보를 전체 병합
                      Object.keys(beforeFields).forEach((key) => {
                        if (key === "years" && beforeFields.years) {
                          if (!prog.years) prog.years = {};
                          if (beforeFields.years[selectedYear]) {
                            prog.years[selectedYear] = {
                              ...prog.years[selectedYear],
                              ...beforeFields.years[selectedYear]
                            };
                          }
                        } else if (key === "pdca" && beforeFields.pdca) {
                          prog.pdca = { ...prog.pdca, ...beforeFields.pdca };
                        } else {
                          prog[key] = beforeFields[key];
                        }
                      });
                      dataUpdated = true;
                    }
                  });
                }
              });

              // Supabase 반영
              if (dataUpdated) {
                supabase.from("projects_data")
                  .update({ data: p.data || p }) // p 통째로 갱신하여 JSON 트리 동기화
                  .eq("year", 2024 + selectedYear)
                  .then(({ error }) => {
                    if (error) console.error("Failed to sync project data after rollback deletion:", error);
                  });
              }
            }
          });

          return updated;
        });
      }

      alert("🗑️ 결재 내역이 성공적으로 삭제되었으며, 승인완료 건의 경우 이전 기획 상태로 안전하게 복원되었습니다.");
      setSelectedRequest(null);
      fetchVersionRequests();
    } catch (e) {
      console.error("Delete request error:", e);
      alert("결재 내역 삭제 도중 데이터베이스 오류가 발생했습니다.");
    }
  };

  // 실무진 수동 갱신 (프로그램 PDCA 및 실적 등록)
  const handleUpdateProgramDetails = (unitId, progId, updatedFields) => {
    const realUnitId = getRealUnitId(unitId, selectedYear);
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          if (u.id === realUnitId) {
            u.programs.forEach((prog) => {
              if (prog.id === progId) {
                // PDCA 상태 갱신
                if (updatedFields.pdca !== undefined) prog.pdca = updatedFields.pdca;
                if (updatedFields.participants !== undefined) prog.participants = updatedFields.participants;
                if (updatedFields.satisfaction !== undefined) prog.satisfaction = updatedFields.satisfaction;
                if (updatedFields.selfEval !== undefined) prog.selfEval = updatedFields.selfEval;
                
                // 실제 실적 타임라인 갱신 (수동 입력 지원)
                if (updatedFields.actual_timeline !== undefined) prog.actual_timeline = updatedFields.actual_timeline;
                
                // 신규 P단계 기획 필드 갱신
                if (updatedFields.timeline !== undefined) prog.timeline = updatedFields.timeline;
                if (updatedFields.targetAudience !== undefined) prog.targetAudience = updatedFields.targetAudience;
                if (updatedFields.coopDept !== undefined) prog.coopDept = updatedFields.coopDept;
                if (updatedFields.target_participants !== undefined) prog.target_participants = updatedFields.target_participants;
                if (updatedFields.target_developments !== undefined) prog.target_developments = updatedFields.target_developments;
                if (updatedFields.target_etc !== undefined) prog.target_etc = updatedFields.target_etc;
                if (updatedFields.target_participants_unit !== undefined) prog.target_participants_unit = updatedFields.target_participants_unit;
                if (updatedFields.target_developments_unit !== undefined) prog.target_developments_unit = updatedFields.target_developments_unit;
                if (updatedFields.target_etc_unit !== undefined) prog.target_etc_unit = updatedFields.target_etc_unit;
                if (updatedFields.target_participants_name !== undefined) prog.target_participants_name = updatedFields.target_participants_name;
                if (updatedFields.target_developments_name !== undefined) prog.target_developments_name = updatedFields.target_developments_name;
                if (updatedFields.target_etc_name !== undefined) prog.target_etc_name = updatedFields.target_etc_name;
                if (updatedFields.kpi_type !== undefined) prog.kpi_type = updatedFields.kpi_type;
                if (updatedFields.kpi_link !== undefined) prog.kpi_link = updatedFields.kpi_link;
                
                // 신규 A단계 2분할 환류 필드 갱신
                if (updatedFields.evalType !== undefined) prog.evalType = updatedFields.evalType;
                if (updatedFields.excellent !== undefined) prog.excellent = updatedFields.excellent;
                if (updatedFields.improvePlan !== undefined) prog.improvePlan = updatedFields.improvePlan;
                if (updatedFields.deficiency !== undefined) prog.deficiency = updatedFields.deficiency;
                if (updatedFields.actionItem !== undefined) prog.actionItem = updatedFields.actionItem;
                if (updatedFields.achievements !== undefined) prog.achievements = updatedFields.achievements;

                const py = prog.years?.[selectedYear];
                if (py) {
                  // P단계 예산 배정액 세부 재원 갱신 (본예산 및 이월예산 구분)
                  if (updatedFields.budget_national !== undefined) py.budget_national = updatedFields.budget_national;
                  if (updatedFields.budget_city !== undefined) py.budget_city = updatedFields.budget_city;
                  if (updatedFields.budget_external !== undefined) py.budget_external = updatedFields.budget_external;
                  
                  if (updatedFields.budget_carry_national !== undefined) py.budget_carry_national = updatedFields.budget_carry_national;
                  if (updatedFields.budget_carry_city !== undefined) py.budget_carry_city = updatedFields.budget_carry_city;
                  if (updatedFields.budget_carry_external !== undefined) py.budget_carry_external = updatedFields.budget_carry_external;

                  // 세부 재원 예산의 합으로 총 본예산(budget_main) 동기화 (외부사업비 제외)
                  py.budget_main = (py.budget_national || 0) + (py.budget_city || 0);

                  // 세부 재원 이월예산의 합으로 총 이월예산(budget_carry) 동기화 (1차년도 제외, 외부사업비 제외)
                  if (selectedYear === 1) {
                    py.budget_carry_national = 0;
                    py.budget_carry_city = 0;
                    py.budget_carry_external = 0;
                    py.budget_carry = 0;
                  } else {
                    py.budget_carry = (py.budget_carry_national || 0) + (py.budget_carry_city || 0);
                  }

                  // 프로그램 최상위 레거시 필드도 현재 5개년 연도 정보 기준으로 일치화 (P 단계 입력이 진짜)
                  if (selectedYear === 2) {
                    prog.budget_2026 = py.budget_main;
                    prog.budget_2025_carry = py.budget_carry;
                    prog.budget = prog.budget_2026 + prog.budget_2025_carry;
                  } else if (selectedYear === 1) {
                    prog.budget_2025_carry = 0;
                    prog.budget = py.budget_main;
                  } else {
                    prog.budget = py.budget_main + py.budget_carry;
                  }

                  // D단계 집행액 세부 재원 갱신
                  if (updatedFields.spent_national !== undefined) py.spent_national = Math.min(updatedFields.spent_national, py.budget_national || 0);
                  if (updatedFields.spent_city !== undefined) py.spent_city = Math.min(updatedFields.spent_city, py.budget_city || 0);
                  if (updatedFields.spent_external !== undefined) py.spent_external = Math.min(updatedFields.spent_external, py.budget_external || 0);
                  
                  // 세부 재원 집행액의 합으로 총 본집행액(spent_main) 동기화 (외부사업비 제외)
                  py.spent_main = (py.spent_national || 0) + (py.spent_city || 0);

                  // 프로그램 최상위 집행액 레거시 필드 동기화 (D 단계 입력이 진짜)
                  if (selectedYear === 2) {
                    prog.spent_2026 = py.spent_main;
                    prog.spent_2025_carry = py.spent_carry || 0;
                    prog.spent = prog.spent_2026 + prog.spent_2025_carry;
                  } else if (selectedYear === 1) {
                    prog.spent_2025_carry = 0;
                    prog.spent = py.spent_main;
                  } else {
                    prog.spent = py.spent_main + (py.spent_carry || 0);
                  }

                  // 비목별 이원화 예산 갱신
                  if (updatedFields.budget_categories !== undefined) {
                    py.budget_categories = updatedFields.budget_categories;
                  }
                }
                
                // 프로그램 5개년 이월 잔액 재계산
                recalculateCarryOver(prog.years);

                // 수동 이월 배정 기입이 포함되지 않은 경우에만 예산 이월비 자동 재조정
                if (updatedFields.budget_carry_national === undefined) {
                  [1, 2, 3, 4, 5].forEach((yr) => {
                    if (yr !== selectedYear) {
                      const y = prog.years?.[yr];
                      if (y) {
                        const isExternalSub = prog.id.endsWith("-2") || prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
                        if (isExternalSub) {
                          y.budget_carry_external = y.budget_carry || 0;
                          y.budget_carry_national = 0;
                          y.budget_carry_city = 0;
                        } else {
                          y.budget_carry_national = Math.round((y.budget_carry || 0) * 0.5);
                          y.budget_carry_city = (y.budget_carry || 0) - y.budget_carry_national;
                          y.budget_carry_external = 0;
                        }
                      }
                    }
                  });
                }
              }
            });
            
            // 해당 단위과제에 소속된 세부 프로그램들의 비목별 배정계획을 10대 표준비목으로 쪼개서 실시간 롤업 동기화
            const categorySums = {
              "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
            };

            u.programs.forEach(prog => {
              const py = prog.years?.[selectedYear] || {};
              const progTotalMain = py.budget_main || 0;
              const progTotalCarry = py.budget_carry || 0;
              const progTotalSpent = py.spent_main || 0;
              const progTotalSpentCarry = py.spent_carry || 0;

              let allocatedMain = 0;
              let allocatedCarry = 0;
              let allocatedSpent = 0;
              let allocatedSpentCarry = 0;

              if (py.budget_categories && Array.isArray(py.budget_categories)) {
                py.budget_categories.forEach(catItem => {
                  const catName = catItem.category;
                  if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                    const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                    const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                    const spentVal = Math.round(catItem.spent || 0);
                    const spentCarryVal = Math.round(catItem.spent_carry || 0);

                    categorySums[catName].main += mainVal;
                    categorySums[catName].carry += carryVal;
                    categorySums[catName].spent_main += spentVal;
                    categorySums[catName].spent_carry += spentCarryVal;

                    allocatedMain += mainVal;
                    allocatedCarry += carryVal;
                    allocatedSpent += spentVal;
                    allocatedSpentCarry += spentCarryVal;
                  }
                });
              }

              const remainMain = Math.max(0, progTotalMain - allocatedMain);
              const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
              const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
              const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

              categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
              categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
            });

            // 계산 결과를 u.budgetDetails 의 selectedYear 에 주입
            Object.keys(categorySums).forEach(catName => {
              if (!u.budgetDetails[catName]) {
                u.budgetDetails[catName] = { years: {} };
              }
              if (!u.budgetDetails[catName].years[selectedYear]) {
                u.budgetDetails[catName].years[selectedYear] = {
                  budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                };
              }
              const tgt = u.budgetDetails[catName].years[selectedYear];
              tgt.budget_main = categorySums[catName].main;
              tgt.budget_carry = categorySums[catName].carry;
              tgt.spent_main = categorySums[catName].spent_main;
              tgt.spent_carry = categorySums[catName].spent_carry;
            });
            
            // 모든 비목의 이월 잔액 재계산
            Object.keys(u.budgetDetails).forEach(key => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });
            
            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 연쇄 재계산
            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              uYear.spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);
            
            // 레거시/기타 UI 연동용 필드 동기화
            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });
        
        // 프로젝트 전체 집행액/예산 총합 갱신
        p.spent = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };

  // 프로그램 신규 추가 핸들러
  const handleAddProgram = (unitId, title, assignee, budget2026, carryBudget) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          if (u.id === unitId) {
            // 새 프로그램 ID 자동 연산
            let nextNum = 1;
            if (u.programs.length > 0) {
              const lastId = u.programs[u.programs.length - 1].id;
              const parts = lastId.split("-");
              const lastNum = parseInt(parts[parts.length - 1], 10);
              if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
            const newId = `${unitId}-${String(nextNum).padStart(2, '0')}`;

            const bMain = Math.round((parseFloat(budget2026) || 0) * 1000000);
            const bCarry = Math.round((parseFloat(carryBudget) || 0) * 1000000);

            const yearsObj = {};
            [1, 2, 3, 4, 5].forEach((yr) => {
              const baseMain = yr === 2 ? bMain : Math.round(bMain * (yr === 1 ? 0.9 : yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3));
              const baseCarry = yr === 2 ? bCarry : 0;
              yearsObj[yr] = {
                budget_main: baseMain,
                budget_carry: baseCarry,
                spent_main: 0,
                spent_carry: 0,
                budget_categories: [],
                budget_national: baseMain,
                budget_city: 0,
                budget_external: 0,
                budget_carry_national: baseCarry,
                budget_carry_city: 0,
                budget_carry_external: 0
              };
            });

            const newProg = {
              id: newId,
              title: title,
              assignee: assignee || "미지정",
              assignees: {
                [selectedYear]: assignee || "미지정"
              },
              budget_2026: bMain,
              budget_2025_carry: bCarry,
              budget: bMain + bCarry,
              spent_2026: 0,
              spent_2025_carry: 0,
              spent: 0,
              participants: 0,
              satisfaction: 0,
              selfEval: "",
              timeline: "",
              targetAudience: "",
              coopDept: "",
              pdca: { p: "대기", d: "대기", c: "대기", a: "대기" },
              years: yearsObj
            };

            u.programs.push(newProg);

            // 해당 단위과제 롤업 및 이월 재계산
            const categorySums = {
              "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
            };

            u.programs.forEach(prog => {
              const py = prog.years?.[selectedYear] || {};
              const progTotalMain = py.budget_main || 0;
              const progTotalCarry = py.budget_carry || 0;
              const progTotalSpent = py.spent_main || 0;
              const progTotalSpentCarry = py.spent_carry || 0;

              let allocatedMain = 0;
              let allocatedCarry = 0;
              let allocatedSpent = 0;
              let allocatedSpentCarry = 0;

              if (py.budget_categories && Array.isArray(py.budget_categories)) {
                py.budget_categories.forEach(catItem => {
                  const catName = catItem.category;
                  if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                    const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                    const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                    const spentVal = Math.round(catItem.spent || 0);
                    const spentCarryVal = Math.round(catItem.spent_carry || 0);

                    categorySums[catName].main += mainVal;
                    categorySums[catName].carry += carryVal;
                    categorySums[catName].spent_main += spentVal;
                    categorySums[catName].spent_carry += spentCarryVal;

                    allocatedMain += mainVal;
                    allocatedCarry += carryVal;
                    allocatedSpent += spentVal;
                    allocatedSpentCarry += spentCarryVal;
                  }
                });
              }

              const remainMain = Math.max(0, progTotalMain - allocatedMain);
              const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
              const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
              const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

              categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
              categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
            });

            Object.keys(categorySums).forEach(catName => {
              if (!u.budgetDetails[catName]) {
                u.budgetDetails[catName] = { years: {} };
              }
              if (!u.budgetDetails[catName].years[selectedYear]) {
                u.budgetDetails[catName].years[selectedYear] = {
                  budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                };
              }
              const tgt = u.budgetDetails[catName].years[selectedYear];
              tgt.budget_main = categorySums[catName].main;
              tgt.budget_carry = categorySums[catName].carry;
              tgt.spent_main = categorySums[catName].spent_main;
              tgt.spent_carry = categorySums[catName].spent_carry;
            });

            Object.keys(u.budgetDetails).forEach(key => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              uYear.spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);

            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });

        p.spent = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };

  // 협약서 신규 등록 핸들러
  const handleAddAgreement = (newAgr) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setAgreements((prev) => [
      ...prev,
      {
        ...newAgr,
        id: `agr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 난수 결합형 고유 ID 생성
      }
    ]);
  };

  // 협약서 수정 핸들러
  const handleUpdateAgreement = (id, updatedFields) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setAgreements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  // 협약서 삭제 핸들러
  const handleDeleteAgreement = (id) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setAgreements((prev) => prev.filter((a) => a.id !== id));
  };

  // 통합 상장/이수증 신규 등록 핸들러
  const handleAddUnifiedCertificate = (newCert) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setUnifiedCertificates((prev) => [
      ...prev,
      {
        ...newCert,
        id: `unified-y${newCert.year}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 연차 구분 및 난수 결합형 고유 ID
      }
    ]);
  };

  // 통합 상장/이수증 수정 핸들러
  const handleUpdateUnifiedCertificate = (id, updatedFields) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setUnifiedCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  // 통합 상장/이수증 삭제 핸들러
  const handleDeleteUnifiedCertificate = (id) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setUnifiedCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  // 성과지표 목표치/실적치 직접 수정 핸들러
  const handleUpdateKpiValue = (subItemId, field, value) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          u.kpis.forEach((k) => {
            if (k.subItems) {
              k.subItems.forEach((sub) => {
                if (sub.id === subItemId) {
                  if (!sub.years) sub.years = {};
                  if (!sub.years[selectedYear]) {
                    sub.years[selectedYear] = { target: 0, current: 0 };
                  }
                  sub.years[selectedYear][field] = value;
                }
              });
            }
          });
        });
      });
      return updated;
    });
  };

  // 비목 예산 세부 조율 갱신 핸들러 (5개년 연쇄 이월 계산 연계)
  const handleUpdateBudgetDetails = (unitId, updatedBudgetDetails) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const realUnitId = getRealUnitId(unitId, selectedYear);
    setProjects(prevProjects => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach(p => {
        p.units.forEach(u => {
          if (u.id === realUnitId) {
            // 비목 예산 배정 수정분 반영
            Object.keys(updatedBudgetDetails).forEach(key => {
              if (!u.budgetDetails[key]) {
                u.budgetDetails[key] = { years: {} };
              }
              const yearsUpdate = updatedBudgetDetails[key].years || {};
              Object.keys(yearsUpdate).forEach(yr => {
                if (!u.budgetDetails[key].years) {
                  u.budgetDetails[key].years = {};
                }
                const existing = u.budgetDetails[key].years[yr] || {};
                u.budgetDetails[key].years[yr] = {
                  ...existing,
                  ...yearsUpdate[yr]
                };
              });
            });

            // 모든 비목의 이월 잔액 5개년 연쇄 재계산
            Object.keys(u.budgetDetails).forEach(key => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 연쇄 재계산
            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              uYear.spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);

            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });
        
        p.spent = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };;;
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({ unitId: displayProjects[0]?.units[0]?.id || "", id: "", title: "", dept: "사업운영팀" });
    setShowProgramEditor(true);
  };

  const handleOpenEditProgram = (unitId, prog) => {
    setEditingProgram(prog);
    setProgramForm({ unitId, id: prog.id, title: prog.title, dept: prog.dept || "사업운영팀" });
    setShowProgramEditor(true);
  };

  const handleSaveProgram = () => {
    if (!programForm.unitId || !programForm.id || !programForm.title) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    setProjects((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const targetUnit = updated.flatMap(p => p.units).find(u => u.id === programForm.unitId);
      if (targetUnit) {
        if (editingProgram) {
          // Edit
          const prog = targetUnit.programs.find(p => p.id === editingProgram.id);
          if (prog) {
            prog.id = programForm.id;
            prog.title = programForm.title;
            // Dept might not be directly in prog originally, but we'll add it
            prog.dept = programForm.dept;
          }
        } else {
          // Add
          if (targetUnit.programs.some(p => p.id === programForm.id)) {
            alert("이미 존재하는 프로그램 ID입니다.");
            return updated;
          }
          targetUnit.programs.push({
            id: programForm.id,
            title: programForm.title,
            dept: programForm.dept,
            assignees: {},
            years: { [selectedYear]: {} },
            kpis: []
          });
        }
      }
      return updated;
    });
    setShowProgramEditor(false);
  };

  const handleDeleteProgram = (unitId, progId) => {
    if (!window.confirm("정말 이 프로그램을 삭제하시겠습니까? 관련 KPI 및 예산 내역이 있다면 함께 영향 받을 수 있습니다.")) return;
    setProjects((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const targetUnit = updated.flatMap(p => p.units).find(u => u.id === unitId);
      if (targetUnit) {
        targetUnit.programs = targetUnit.programs.filter(p => p.id !== progId);
      }
      return updated;
    });
  };

  const handleDownloadExcel = () => {
    const data = [];
    displayProjects.flatMap(p => p.units).forEach(u => {
      u.programs.forEach(prog => {
        data.push({
          "단위과제 ID": u.id,
          "단위과제명": u.title,
          "프로그램 ID": prog.id,
          "프로그램명": prog.title,
          "담당연구원": prog.assignees?.[selectedYear] || prog.assignee || ""
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "프로그램 배정");
    XLSX.writeFile(wb, `프로그램_배정_${selectedYear}차년도.xlsx`);
  };

  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      setProjects(prev => {
        const updated = JSON.parse(JSON.stringify(prev));
        data.forEach(row => {
          const unitId = row["단위과제 ID"];
          const progId = row["프로그램 ID"];
          const title = row["프로그램명"];
          const assignee = row["담당연구원"];

          const targetUnit = updated.flatMap(p => p.units).find(u => u.id === unitId);
          if (targetUnit) {
            let prog = targetUnit.programs.find(p => p.id === progId);
            if (!prog) {
              prog = { id: progId, title: title, assignees: {}, years: { [selectedYear]: {} }, kpis: [] };
              targetUnit.programs.push(prog);
            } else {
              prog.title = title;
            }
            if (!prog.assignees) prog.assignees = {};
            if (assignee !== undefined) {
              prog.assignees[selectedYear] = assignee;
              prog.assignee = assignee;
            }
          }
        });
        return updated;
      });
      alert("엑셀 데이터가 성공적으로 반영되었습니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  // 연구원 배정 핸들러
  const handleAssignChange = (unitId, progId, newAssignee) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const realUnitId = getRealUnitId(unitId, selectedYear);
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          if (u.id === realUnitId) {
            u.programs.forEach((prog) => {
              if (prog.id === progId) {
                if (!prog.assignees) {
                  prog.assignees = {};
                }
                prog.assignees[selectedYear] = newAssignee;
                // 하위 호환성을 위해 현재 선택된 년도의 배정을 단일 assignee 필드에도 업데이트
                prog.assignee = newAssignee;
              }
            });
          }
        });
      });
      return updated;
    });
    alert(`[${progId}] 프로그램의 ${selectedYear}차년도 담당연구원이 "${newAssignee || "미배정"}"(으)로 배정 및 저장되었습니다.`);
  };

  // 사용자 호칭 맵핑 웰컴 메시지 헬퍼 함수
  const getWelcomeMessage = () => {
    if (!currentUser) return "";
    
    // currentUser.id 또는 name 기준으로 members 데이터에서 정보 탐색
    const currentMember = members.find((m) => {
      if (!m.email) return false;
      const mId = m.email.trim().toLowerCase().split("@")[0];
      return mId === currentUser.id;
    }) || members.find((m) => {
      const cleanMName = m.name ? m.name.split(" ")[0].split("(")[0].trim() : "";
      const cleanCurrName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
      return cleanMName === cleanCurrName;
    });

    let cleanName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
    let roleOrPosition = "";

    if (currentMember) {
      const mRole = currentMember.role || "";
      const mPosition = currentMember.position || "";

      if (mRole === "연구원") {
        // 연구원의 경우에는 직급/직위(position)를 표시
        roleOrPosition = mPosition || "연구원";
      } else {
        // 그 외의 경우(사업단장, 본부장, 센터장, 운영팀장 등)는 직책(role)을 표시
        roleOrPosition = mRole;
      }
    } else {
      // 주소록에 매칭되지 않는 예외 및 테스트 계정 처리
      const roleId = currentUser.role?.id || "";
      if (roleId === "DIRECTOR") roleOrPosition = "단장";
      else if (roleId === "HQ_HEAD") roleOrPosition = "본부장";
      else if (roleId === "CENTER_LEADER") roleOrPosition = "센터장";
      else if (roleId === "OP_LEADER") roleOrPosition = "팀장";
      else roleOrPosition = "연구원";
    }

    return (
      <strong style={{ fontWeight: "800", color: "var(--text-primary)" }}>
        [{cleanName} {roleOrPosition}]
      </strong>
    );
  };

  // 💡 참여자 전용 설문조사 모바일 입력 폼 (로그인 우회)
  if (activeTab === "survey_respond") {
    return <SurveyResponder />;
  }

  if (!currentUser) {
    return <AuthManager onLoginSuccess={handleLoginSuccess} members={members} />;
  }

  const currentRole = currentUser.role;

  return (
    <div className="dashboard-container">
      {/* 사이드바 */}
      <Sidebar
        currentRole={currentRole}
        onChangeRole={() => {}}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSelectedKpi(null);
        }}
        projectsSubTab={projectsSubTab}
        onChangeProjectsSubTab={setProjectsSubTab}
        kpiSubTab={kpiSubTab}
        onChangeKpiSubTab={setKpiSubTab}
        mgmtSubTab={mgmtSubTab}
        onChangeMgmtSubTab={setMgmtSubTab}
        budgetSubTab={budgetSubTab}
        onChangeBudgetSubTab={setBudgetSubTab}
        procurementSubTab={procurementSubTab}
        onChangeProcurementSubTab={setProcurementSubTab}
        scheduleSubTab={scheduleSubTab}
        onChangeScheduleSubTab={setScheduleSubTab}
        agreementsSubTab={agreementsSubTab}
        onChangeAgreementsSubTab={setAgreementsSubTab}
        progressSubTab={progressSubTab}
        onChangeProgressSubTab={setProgressSubTab}
        menuVisibility={menuVisibility}
        isSongDirector={isSongDirector}
      />

      {/* 메인 뷰 */}
      <main key={`main-viewport-${darkMode}`} className="main-content" style={{ opacity: isScrollRestored ? 1 : 0, transition: "opacity 0.22s ease-in-out" }}>
        <header className="top-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="page-title">
            <h1>앵커사업 통합 IR 대시보드</h1>
            <p>울산과학대학교 앵커사업 {selectedYear}차년도 사업예산 및 성과관리 시스템</p>
          </div>

          {/* 전역 연도 선택 컨트롤러 */}
          <div style={{ display: "flex", gap: "0.2rem", background: "rgba(255, 255, 255, 0.03)", padding: "0.2rem", borderRadius: "2rem", border: "1px solid var(--border-color)" }}>
            {[1, 2, 3, 4, 5].map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  // 💡 탭 변경 즉시 비동기 로딩 플래그를 동기적으로 리셋하여 자동 저장 Race Condition을 완전히 원천 봉쇄
                  setIsFetchCompleted(false);
                  setIsDbLoaded(false);
                  
                  setSelectedYear(yr);
                  setSelectedKpi(null);
                  if (yr === 1) {
                    setSelectedUnitId("A1");
                  } else {
                    setSelectedUnitId("A1가");
                  }
                  setSelectedProgId(null);
                }}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.78rem",
                  borderRadius: "2rem",
                  border: "none",
                  background: selectedYear === yr ? "var(--accent-color)" : "transparent",
                  color: selectedYear === yr ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.2s"
                }}
              >
                {yr}차년도{yr === 2 ? "(현)" : ""}
              </button>
            ))}
          </div>

          <div className="controls-section" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {/* Supabase 실시간 동기화 상태 배지 */}
            <span 
              onClick={() => {
                if (syncStatus === "error") {
                  if (confirm("로컬 캐시 데이터 간 충돌이 감지되었습니다. 로컬 캐시를 초기화하고 안전하게 새로고침하시겠습니까? (이수증/상장 등의 임시 캐시가 초기화됩니다)")) {
                    localStorage.removeItem(`anchor_cache_cert_y${selectedYear}`);
                    localStorage.removeItem(`anchor_cache_award_y${selectedYear}`);
                    localStorage.removeItem(`anchor_cache_agr_y${selectedYear}`);
                    window.location.reload();
                  }
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                padding: "0.25rem 0.6rem",
                borderRadius: "4px",
                cursor: syncStatus === "error" ? "pointer" : "default",
                background: syncStatus === "synced" 
                  ? "rgba(16, 185, 129, 0.1)" 
                  : syncStatus === "syncing" 
                  ? "rgba(245, 158, 11, 0.1)" 
                  : "rgba(239, 68, 68, 0.1)",
                color: syncStatus === "synced" 
                  ? "#10B981" 
                  : syncStatus === "syncing" 
                  ? "#F59E0B" 
                  : "#EF4444",
                border: syncStatus === "synced" 
                  ? "1px solid rgba(16, 185, 129, 0.2)" 
                  : syncStatus === "syncing" 
                  ? "1px solid rgba(245, 158, 11, 0.2)" 
                  : "1px solid rgba(239, 68, 68, 0.2)",
                marginRight: "0.5rem",
                fontWeight: "700",
                textDecoration: syncStatus === "error" ? "underline" : "none"
              }}
              title={syncStatus === "error" ? "클릭하여 로컬 캐시 초기화" : ""}
            >
              {syncStatus === "synced" ? "☁️ DB 동기화 완료" : syncStatus === "syncing" ? "🔄 DB 저장 중..." : "⚠️ 동기화 실패 (클릭 시 복구)"}
            </span>

            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: "0.4rem" }}>
              {getWelcomeMessage()}
            </span>
            <button
              className="btn-primary"
              style={{
                padding: "0.4rem 0.8rem",
                fontSize: "0.75rem",
                background: "var(--input-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.375rem",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                cursor: "pointer",
                height: "34px"
              }}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <LockIcon size={14} />
              <span>개인정보 관리</span>
            </button>
            <button
              className="btn-primary"
              style={{
                padding: "0.4rem 0.8rem",
                fontSize: "0.75rem",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid var(--danger-color)",
                borderRadius: "0.375rem",
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                cursor: "pointer",
                height: "34px"
              }}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span>로그아웃</span>
            </button>
            <button className="theme-toggle-btn" style={{ padding: "0.4rem", borderRadius: "0.375rem", height: "34px", width: "34px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div>
            {/* 메인 대시보드 탭: 사용자의 요청에 따라 엑셀 업로더 영역을 제거하고 KPI 요약 카드만 노출합니다. */}
            <KPIOverview key={`kpi-${darkMode}-${selectedYear}`} projects={displayProjects} currentRole={currentRole} selectedYear={selectedYear} />
          </div>
        )}

        {activeTab === "projects" && (
          <>
            {/* 단위과제 및 프로그램 관리 탭: 전체 카드를 Fragment로 감싼 뒤 하단에 예산 전용 엑셀 업로더를 배치합니다. */}
            <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{selectedYear}차년도 단위과제 관리 및 프로그램 관리</h2>
            </div>

            {/* 서브탭 내비게이션 바 */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem", marginBottom: "1.2rem" }}>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_status")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: projectsSubTab === "unit_status" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "unit_status" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                단위과제 집행현황
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_system")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: projectsSubTab === "unit_system" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "unit_system" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                단위과제 체계
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("program_mgmt")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: projectsSubTab === "program_mgmt" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: projectsSubTab === "program_mgmt" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                프로그램 관리
              </button>
            </div>
            
            {projectsSubTab === "unit_status" && (
              <div className="table-panel">
                <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                      <th rowSpan={2} style={{ verticalAlign: "middle", borderBottom: "1px solid var(--border-color)", borderRight: "2px solid var(--border-color)" }}>과제/부서</th>
                      <th colSpan={selectedYear >= 2 ? 5 : 4} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "2px solid var(--border-color)", fontWeight: "800", color: "var(--accent-color)", background: "rgba(59, 130, 246, 0.08)", padding: "0.55rem 0" }}>
                        예산 배정 및 집행 (단위: 백만원)
                      </th>
                      <th colSpan={5} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "0.55rem 0" }}>
                        프로그램 현황 및 진행
                      </th>
                    </tr>
                    <tr>
                      <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>본예산</th>
                      {selectedYear >= 2 && <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>이월예산</th>}
                      <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>총 배정액</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>누적 집행</th>
                      <th style={{ fontSize: "0.75rem", borderRight: "2px solid var(--border-color)", textAlign: "right", paddingRight: "1rem" }}>집행률</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>총 개수</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>준비</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>진행</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>완료</th>
                      <th style={{ fontSize: "0.75rem" }}>진행률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProjects.flatMap((p) => p.units)
                      .sort((a, b) => {
                        if (a.id === "Common") return 1;
                        if (b.id === "Common") return -1;
                        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                      })
                      .map((u) => {
                        const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                        const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                        const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
                        const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
                        const totalSpent = (yData.spent_main || 0) + spentCarryVal;
                        const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

                        // 프로그램 현황 집계 변수들
                        const totalPrograms = u.programs?.length || 0;
                        let readyCount = 0;
                        let inProgressCount = 0;
                        let completedCount = 0;
                        let totalProgressSum = 0;

                        if (totalPrograms > 0) {
                          u.programs.forEach((prog) => {
                            const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
                            const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
                            const progProgress = (completedSteps / 4) * 100;
                            totalProgressSum += progProgress;

                            if (completedSteps === 0) {
                              readyCount++;
                            } else if (completedSteps === 4) {
                              completedCount++;
                            } else {
                              inProgressCount++;
                            }
                          });
                        }
                        const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;

                        return (
                          <tr 
                            key={u.id}
                            onClick={() => {
                              setSelectedUnitId(u.id);
                              setSelectedProgId(null);
                              setProjectsSubTab("program_mgmt"); // 단위과제 클릭 시 프로그램 관리 탭으로 연계 이동
                            }}
                            style={{
                              cursor: "pointer",
                              background: selectedUnitId === u.id ? "rgba(59, 130, 246, 0.15)" : "transparent",
                              transition: "background 0.2s"
                            }}
                          >
                            <td style={{ fontWeight: "700", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                              {u.id === "Common" ? "" : `${u.id}. `}{u.title}
                            </td>
                            <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                              {formatToMillionWon(yData.budget_main)}
                            </td>
                            {selectedYear >= 2 && (
                              <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                {formatToMillionWon(budgetCarryVal)}
                              </td>
                            )}
                            <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", textAlign: "right", paddingRight: "1rem" }}>
                              {formatToMillionWon(totalBudget)}
                            </td>
                            <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                              {formatToMillionWon(totalSpent)}
                            </td>
                            <td style={{ borderRight: "2px solid var(--border-color)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)" }}>{rate.toFixed(1)}%</span>
                              </div>
                            </td>
                            {u.id === "Common" ? (
                              <>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td>-</td>
                              </>
                            ) : (
                              <>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center" }}>
                                  {totalPrograms}개
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--text-secondary)" }}>
                                  {readyCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "#f59e0b" }}>
                                  {inProgressCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--success-color)", fontWeight: "700" }}>
                                  {completedCount}
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                      <div style={{ width: `${Math.min(progressRate, 100)}%`, height: "100%", background: "#10b981" }} />
                                    </div>
                                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", fontWeight: "700", color: "#10b981" }}>{progressRate.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            )}

            {projectsSubTab === "unit_system" && (
              <UnitSystemView key={`unit-system-${darkMode}-${selectedYear}`} selectedYear={selectedYear} />
            )}

            {projectsSubTab === "program_mgmt" && (
              <div id="pdca-manager-section">
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem" }}>프로그램 관리</h3>
                <PDCAManager
                  key={`pdca-${darkMode}-${selectedYear}`}
                  projects={displayProjects}
                  currentRole={currentRole}
                  onUpdateProgramDetails={handleUpdateProgramDetails}
                  onAddProgram={handleAddProgram}
                  selectedYear={selectedYear}
                  selectedUnitId={selectedUnitId}
                  setSelectedUnitId={setSelectedUnitId}
                  selectedProgId={selectedProgId}
                  setSelectedProgId={setSelectedProgId}
                  viewMode={pdcaViewMode}
                  setViewMode={setPdcaViewMode}
                  currentUser={currentUser}
                  supabase={supabase}
                />
              </div>
            )}
          </div>
        </>
        )}

        {activeTab === "management" && ["ADMIN", "DIRECTOR", "HQ_HEAD", "TEAM_LEADER"].includes(currentRole.id) && (
          <div className="glass-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.8rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>앵커사업단 관리</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                  울산과학대학교 라이즈(앵커) 사업단 구성원을 관리하고, 각 세부 프로그램의 실무 연구원을 매핑하는 통합 업무 공간입니다.
                </p>
              </div>

              {mgmtSubTab === "members" && currentRole.rank <= 2 && (
                <button
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", borderRadius: "0.4rem", padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700" }}
                  onClick={() => {
                    setEditingMember({
                      id: "",
                      name: "",
                      role: "연구원",
                      grade: "연구원",
                      dept: "ECC센터",
                      phoneOffice: "",
                      phoneMobile: "",
                      email: "",
                      room: "",
                      hireDate: "2026-03-01",
                      startDate: "2026-03-01",
                      endDate: "",
                      status: "참여중"
                    });
                    setIsMemberModalOpen(true);
                  }}
                >
                  구성원 추가
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem", marginBottom: "1.2rem" }}>
              {currentRole && (currentRole.id === "ADMIN" || currentRole.id === "DIRECTOR" || currentRole.id === "HQ_HEAD") && (
                <>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("approvals")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "approvals" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "approvals" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    승인처리
                  </button>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("members")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "members" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "members" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    구성원 관리
                  </button>
                  {currentRole.rank <= 2 && (
                    <button
                      type="button"
                      onClick={() => setMgmtSubTab("users")}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0.5rem 1rem",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        color: mgmtSubTab === "users" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: mgmtSubTab === "users" ? "2px solid var(--accent-color)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      회원현황
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("programs")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "programs" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "programs" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    프로그램 배정
                  </button>
                </>
              )}
              
              {/* 공용 sub-tab 버튼 (보안 정책에 따라 ADMIN, DIRECTOR, HQ_HEAD, TEAM_LEADER에만 노출) */}
              {currentRole && ["ADMIN", "DIRECTOR", "HQ_HEAD", "TEAM_LEADER"].includes(currentRole.id) && (
                <>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("org_chart")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "org_chart" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "org_chart" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    대학조직도
                  </button>
                  <button
                    type="button"
                    onClick={() => setMgmtSubTab("partners")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      color: mgmtSubTab === "partners" ? "var(--accent-color)" : "var(--text-secondary)",
                      borderBottom: mgmtSubTab === "partners" ? "2px solid var(--accent-color)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    파트너기관
                  </button>
                </>
              )}
              {isSongDirector && (
                <button
                  type="button"
                  onClick={() => setMgmtSubTab("portal_config")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    color: mgmtSubTab === "portal_config" ? "var(--accent-color)" : "var(--text-secondary)",
                    borderBottom: mgmtSubTab === "portal_config" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  앵커 포털 관리
                </button>
              )}
            </div>

            {mgmtSubTab === "members" && (
              <div>
                {/* 참여중 / 미참여 구분을 위한 삼분할 필터 바 */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <button
                    onClick={() => setMemberFilter("all")}
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      borderRadius: "0.25rem",
                      border: memberFilter === "all" ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                      background: memberFilter === "all" ? "rgba(59,130,246,0.15)" : "transparent",
                      color: memberFilter === "all" ? "var(--accent-color)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontWeight: "700",
                      transition: "all 0.2s"
                    }}
                  >
                    전체 ({members.length}명)
                  </button>
                  <button
                    onClick={() => setMemberFilter("active")}
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      borderRadius: "0.25rem",
                      border: memberFilter === "active" ? "1px solid var(--success-color)" : "1px solid var(--border-color)",
                      background: memberFilter === "active" ? "rgba(16,185,129,0.15)" : "transparent",
                      color: memberFilter === "active" ? "var(--success-color)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontWeight: "700",
                      transition: "all 0.2s"
                    }}
                  >
                    참여중 ({members.filter(m => getMemberStatusForYear(m, selectedYear) !== "미참여").length}명)
                  </button>
                  <button
                    onClick={() => setMemberFilter("retired")}
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      borderRadius: "0.25rem",
                      border: memberFilter === "retired" ? "1px solid #ef4444" : "1px solid var(--border-color)",
                      background: memberFilter === "retired" ? "rgba(239,68,68,0.15)" : "transparent",
                      color: memberFilter === "retired" ? "#ef4444" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontWeight: "700",
                      transition: "all 0.2s"
                    }}
                  >
                    미참여 ({members.filter(m => getMemberStatusForYear(m, selectedYear) === "미참여").length}명)
                  </button>
                </div>

                <div className="table-panel">
                  <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th 
                          onClick={() => requestMemberSort("dept")}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onMouseEnter={(e) => e.target.style.color = "var(--accent-color)"}
                          onMouseLeave={(e) => e.target.style.color = ""}
                        >
                          소속 부서 {memberSortConfig.key === "dept" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </th>
                        <th>성명</th>
                        <th 
                          onClick={() => requestMemberSort("role")}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onMouseEnter={(e) => e.target.style.color = "var(--accent-color)"}
                          onMouseLeave={(e) => e.target.style.color = ""}
                        >
                          직책 {memberSortConfig.key === "role" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </th>
                        <th>직급/직위</th>
                        <th>이메일</th>
                        <th>교내 전화</th>
                        <th>휴대전화</th>
                        <th 
                          onClick={() => requestMemberSort("startDate")}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onMouseEnter={(e) => e.target.style.color = "var(--accent-color)"}
                          onMouseLeave={(e) => e.target.style.color = ""}
                        >
                          시작일 {memberSortConfig.key === "startDate" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </th>
                        <th>종료일</th>
                        <th 
                          onClick={() => requestMemberSort("status")}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onMouseEnter={(e) => e.target.style.color = "var(--accent-color)"}
                          onMouseLeave={(e) => e.target.style.color = ""}
                        >
                          참여 여부 {memberSortConfig.key === "status" ? (memberSortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </th>
                        {currentRole.rank <= 2 && <th>관리</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedMembers().map((m) => {
                          const isRetired = getMemberStatusForYear(m, selectedYear) === "미참여";
                          return (
                            <tr 
                              key={m.id}
                              style={{
                                opacity: isRetired ? 0.45 : 1,
                                background: isRetired ? "rgba(255, 255, 255, 0.01)" : "transparent",
                                transition: "all 0.2s"
                              }}
                            >
                              <td style={{ fontWeight: "700" }}>{m.dept}</td>
                              <td style={{ fontWeight: "800", color: isRetired ? "var(--text-secondary)" : "var(--text-primary)" }}>{m.name}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    isRetired
                                      ? "badge-gray"
                                      : m.role === "사업단장" || m.role === "본부장"
                                      ? "badge-red"
                                      : m.role === "센터장"
                                      ? "badge-blue"
                                      : m.role === "팀장교수"
                                      ? "badge-green"
                                      : "badge-gray"
                                  }`}
                                  style={{ 
                                    fontSize: "0.65rem",
                                    background: isRetired ? "rgba(255, 255, 255, 0.08)" : undefined,
                                    color: isRetired ? "var(--text-secondary)" : undefined
                                  }}
                                >
                                  {m.role}
                                </span>
                              </td>
                              <td>{m.grade}</td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{m.email}</td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{m.phoneOffice || "-"}</td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{m.phoneMobile || "-"}</td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{m.startDate || m.hireDate || "-"}</td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{m.endDate || "-"}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    isRetired ? "badge-red" : "badge-green"
                                  }`}
                                  style={{ 
                                    fontSize: "0.65rem",
                                    background: isRetired ? "rgba(239, 68, 68, 0.15)" : undefined,
                                    color: isRetired ? "#f87171" : undefined
                                  }}
                                >
                                  {getMemberStatusForYear(m, selectedYear)}
                                </span>
                              </td>
                          {currentRole.rank <= 2 && (
                            <td>
                              <div style={{ display: "flex", gap: "0.3rem" }}>
                                <button
                                  className="btn-primary"
                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(59,130,246,0.15)", border: "1px solid var(--accent-color)", color: "#60a5fa" }}
                                  onClick={() => {
                                    setEditingMember(m);
                                    setIsMemberModalOpen(true);
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  className="btn-primary"
                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171" }}
                                  onClick={async () => {
                                    if (window.confirm(`정말 ${m.name} 구성원을 삭제하시겠습니까?`)) {
                                      setMembers(members.filter((item) => item.id !== m.id));
                                      try {
                                        const { error } = await supabase
                                          .from("rise_members")
                                          .delete()
                                          .eq("id", m.id);
                                        if (error) throw error;
                                      } catch (err) {
                                        console.error("Failed to delete member from DB:", err);
                                      }
                                    }
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mgmtSubTab === "programs" && (
              <div>
                <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)" }}>단위과제 필터:</span>
                    <select
                      className="user-selector"
                      value={assignFilterUnitId}
                      onChange={(e) => setAssignFilterUnitId(e.target.value)}
                      style={{
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.78rem",
                        borderRadius: "0.25rem",
                        background: "var(--panel-bg)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-primary)",
                        outline: "none"
                      }}
                    >
                      <option value="all" style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>전체 단위과제</option>
                      {displayProjects.flatMap((p) => p.units)
                        .sort((a, b) => {
                          if (a.id === "Common") return 1;
                          if (b.id === "Common") return -1;
                          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                        })
                        .map((u) => (
                          <option key={u.id} value={u.id} style={{ background: "var(--panel-bg)", color: "var(--text-primary)" }}>{u.id === "Common" ? "" : `${u.id}. `}{u.title}</option>
                        ))}
                    </select>
                  </div>
                  {currentRole.rank <= 2 && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <label className="btn-green-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", cursor: "pointer", margin: 0 }}>
                        엑셀 업로드
                        <input type="file" accept=".xlsx, .xls" style={{ display: "none" }} ref={fileInputRef} onChange={handleUploadExcel} />
                      </label>
                      <button onClick={handleDownloadExcel} className="btn-green-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>
                        엑셀 다운로드
                      </button>
                      <button onClick={handleOpenAddProgram} className="btn-green" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>
                        + 신규 프로그램
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  * 실무 연구원으로 등록된 구성원(직책: 연구원)만 프로그램 담당연구원 목록으로 매핑됩니다.
                </p>
                <div className="table-panel">
                  <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th rowSpan={2}>단위과제</th>
                        <th rowSpan={2}>프로그램 ID</th>
                        <th rowSpan={2}>프로그램명</th>
                        <th rowSpan={2}>담당부서</th>
                        <th rowSpan={2}>담당연구원</th>
                        <th colSpan={4} style={{ textAlign: "center" }}>진행 단계(PDCA)</th>
                        <th rowSpan={2}>작업</th>
                      </tr>
                      <tr>
                        <th style={{ textAlign: "center", width: "50px" }}>P</th>
                        <th style={{ textAlign: "center", width: "50px" }}>D</th>
                        <th style={{ textAlign: "center", width: "50px" }}>C</th>
                        <th style={{ textAlign: "center", width: "50px" }}>A</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayProjects.flatMap((p) => p.units)
                        .filter((u) => assignFilterUnitId === "all" || u.id === assignFilterUnitId)
                        .sort((a, b) => {
                          if (a.id === "Common") return 1;
                          if (b.id === "Common") return -1;
                          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                        })
                        .flatMap((u) => {
                          return u.programs.map((prog) => {
                            let dept = "사업운영팀";
                            if (selectedYear === 1) {
                              if (["A1", "A2", "D4"].includes(u.id)) dept = "ECC센터";
                              else if (["B1", "C1", "C3"].includes(u.id)) dept = "ICC센터";
                              else if (["B2", "B3", "D1", "D3"].includes(u.id)) dept = "RCC센터";
                              else if (u.id === "C2") dept = "AID-X지원센터";
                              else if (u.id === "D2") dept = "울산늘봄누리센터";
                            } else {
                              if (["A1가", "A2", "A3"].includes(u.id)) dept = "ECC센터";
                              else if (u.id === "A1나") dept = "신산업특화센터";
                              else if (["B1", "B3", "B4"].includes(u.id)) dept = "ICC센터";
                              else if (u.id === "B2") dept = "AID-X지원센터";
                              else if (u.id === "C2") dept = "울산늘봄누리센터";
                              else if (["C1", "D1", "D2", "D3"].includes(u.id)) dept = "RCC센터";
                            }

                            return (
                              <tr key={prog.id}>
                                <td style={{ fontWeight: "700" }}>{u.id === "Common" ? "공통경비" : `${u.id}. ${u.title}`}</td>
                                <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                                <td>{prog.title}</td>
                                <td style={{ color: "var(--accent-color)", fontWeight: "700" }}>{dept}</td>
                                 <td>
                                   {currentRole.rank <= 2 ? (
                                     <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                       {/* 공동배정 체크박스 */}
                                       <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                                         <input
                                           type="checkbox"
                                           checked={!!jointPrograms[prog.id]}
                                           onChange={(e) => {
                                             const isChecked = e.target.checked;
                                             setJointPrograms(prev => ({ ...prev, [prog.id]: isChecked }));
                                             
                                             // 체크 해제 시에는 단일 연구원으로 변경할 수 있도록 현재 값의 첫 번째 연구원을 기본값으로 넘김
                                             if (!isChecked) {
                                               const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                               const parts = currentVal.split(/[,\/]/).map(p => p.trim()).filter(Boolean);
                                               handleAssignChange(u.id, prog.id, parts[0] || "");
                                             }
                                           }}
                                         />
                                         2인 공동배정
                                       </label>
                                       
                                       {jointPrograms[prog.id] ? (
                                         <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                                           {/* 정 담당자 선택 */}
                                           <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                             <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "700" }}>정:</span>
                                             <select
                                               className="user-selector"
                                               style={{ width: "110px", padding: "0.15rem 0.3rem", fontSize: "0.7rem" }}
                                               value={(() => {
                                                 const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                 const parts = currentVal.split(/[,\/]/).map(p => p.trim()).filter(Boolean);
                                                 return parts[0] || "";
                                               })()}
                                               onChange={(e) => {
                                                 const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                 const parts = currentVal.split(/[,\/]/).map(p => p.trim()).filter(Boolean);
                                                 const first = e.target.value;
                                                 const second = parts[1] || "";
                                                 const combined = second ? `${first}, ${second}` : first;
                                                 handleAssignChange(u.id, prog.id, combined);
                                               }}
                                             >
                                               <option value="">선택</option>
                                               {members
                                                 .filter((m) => m.role === "연구원" && m.dept === dept)
                                                 .map((m) => (
                                                   <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                     {m.name} {m.grade}
                                                   </option>
                                                 ))}
                                             </select>
                                           </div>
                                           {/* 부 담당자 선택 */}
                                           <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                             <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "700" }}>부:</span>
                                             <select
                                               className="user-selector"
                                               style={{ width: "110px", padding: "0.15rem 0.3rem", fontSize: "0.7rem" }}
                                               value={(() => {
                                                 const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                 const parts = currentVal.split(/[,\/]/).map(p => p.trim()).filter(Boolean);
                                                 return parts[1] || "";
                                               })()}
                                               onChange={(e) => {
                                                 const currentVal = prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "");
                                                 const parts = currentVal.split(/[,\/]/).map(p => p.trim()).filter(Boolean);
                                                 const first = parts[0] || "";
                                                 const second = e.target.value;
                                                 const combined = second ? `${first}, ${second}` : first;
                                                 handleAssignChange(u.id, prog.id, combined);
                                               }}
                                             >
                                               <option value="">선택</option>
                                               {members
                                                 .filter((m) => m.role === "연구원" && m.dept === dept)
                                                 .map((m) => (
                                                   <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                     {m.name} {m.grade}
                                                   </option>
                                                 ))}
                                             </select>
                                           </div>
                                         </div>
                                       ) : (
                                         /* 단일 배정 드롭다운 */
                                         <select
                                           className="user-selector"
                                           style={{ width: "200px", padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                                           value={prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "")}
                                           onChange={(e) => handleAssignChange(u.id, prog.id, e.target.value)}
                                         >
                                           <option value="">미배정</option>
                                           {members
                                             .filter((m) => {
                                               if (m.role !== "연구원") return false;
                                               const currentAssignee = prog.assignees?.[selectedYear] || prog.assignee || "";
                                               const isCurrent = currentAssignee === `${m.name} ${m.grade}`;
                                               const isDeptMatch = m.dept === dept;
                                               if (!isCurrent && !isDeptMatch) return false;
                                               
                                               const startYear = 2024 + selectedYear;
                                               const endYear = 2025 + selectedYear;
                                               const yearStart = new Date(`${startYear}-03-01T00:00:00`);
                                               const yearEnd = new Date(`${endYear}-02-28T23:59:59`);
                                               
                                               const mStartStr = m.startDate || m.hireDate || "2025-03-01";
                                               const mStartDate = new Date(mStartStr);
                                               if (mStartDate > yearEnd) return false;
                                               
                                               if (m.endDate) {
                                                 const mEndDate = new Date(m.endDate);
                                                 if (mEndDate < yearStart) return false;
                                               }
                                               return true;
                                             })
                                             .map((m) => (
                                               <option key={m.id} value={`${m.name} ${m.grade}`}>
                                                 {m.name} {m.grade} ({m.dept})
                                               </option>
                                             ))}
                                         </select>
                                       )}
                                     </div>
                                   ) : (
                                     <span>{formatAssignee(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee)}</span>
                                   )}
                                 </td>
                                <td style={{ textAlign: "center", color: prog.pdca.p === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.p}</td>
                                <td style={{ textAlign: "center", color: prog.pdca.d === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.d}</td>
                                <td style={{ textAlign: "center", color: prog.pdca.c === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.c}</td>
                                <td style={{ textAlign: "center", color: prog.pdca.a === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.a}</td>
                                <td>
                                  {currentRole.rank <= 2 ? (
                                    <button
                                      className="btn-primary"
                                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", lineHeight: "1.2", whiteSpace: "normal" }}
                                      onClick={() => {
                                        setSelectedUnitId(u.id);
                                        setSelectedProgId(prog.id);
                                        setActiveTab("projects");
                                        setTimeout(() => {
                                          const el = document.getElementById("pdca-manager-section");
                                          if (el) el.scrollIntoView({ behavior: "smooth" });
                                        }, 100);
                                      }}
                                    >
                                      정보<br />등록
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>권한 없음</span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mgmtSubTab === "users" && currentRole.rank <= 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* 1. 시스템 고정 계정 목록 테이블 */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>시스템 고정 계정 현황</h3>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>관리자용 데모 및 시스템 고유 계정</span>
                  </div>
                  <div className="table-panel" style={{ maxHeight: "250px", overflowY: "auto" }}>
                    <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                      <thead>
                        <tr>
                          <th>아이디</th>
                          <th>이름</th>
                          <th>역할</th>
                          <th>역할키</th>
                          <th>시작일</th>
                          <th style={{ width: "100px", textAlign: "center" }}>속성</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.filter(u => ["admin", "director", "hq_head", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase())).length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>
                              등록된 고정 계정이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          registeredUsers
                            .filter(u => ["admin", "director", "hq_head", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase()))
                            .map((u) => {
                              const roleNames = {
                                ADMIN: "최고 관리자",
                                DIRECTOR: "사업단장",
                                HQ_HEAD: "본부장",
                                CENTER_ECC: "ECC센터장",
                                CENTER_SPECIAL: "신산업특화센터장",
                                CENTER_NURI: "늘봄누리센터장",
                                CENTER_ICC: "ICC센터장",
                                CENTER_RCC: "RCC센터장",
                                TEAM_LEADER: u.id.toLowerCase() === "team_leader" || u.id.toLowerCase() === "hmsim@uc.ac.kr"
                                  ? "운영팀장"
                                  : (members || []).find(m => m.email && m.email.trim().toLowerCase() === u.id.trim().toLowerCase())?.role || "팀장교수",
                                RESEARCHER: "실무 연구원",
                                RESEARCH: "연구원"
                              };
                              const cleanName = (u.name || "").split(" ")[0];
                              return (
                                <tr key={u.id}>
                                  <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                                  <td style={{ fontWeight: "700" }}>{cleanName}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        u.role_key === "ADMIN" || u.role_key === "DIRECTOR" || u.role_key === "HQ_HEAD"
                                          ? "badge-red"
                                          : u.role_key.startsWith("CENTER_")
                                          ? "badge-blue"
                                          : u.role_key === "TEAM_LEADER"
                                          ? "badge-green"
                                          : "badge-gray"
                                      }`}
                                      style={{ fontSize: "0.65rem" }}
                                    >
                                      {roleNames[u.role_key] || u.role_key}
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                                  <td style={{ fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                  <td style={{ textAlign: "center", color: "var(--text-secondary)", fontWeight: "700" }}>고정 계정</td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. 주소록 연동 회원 목록 테이블 */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>주소록 연동 회원 현황</h3>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>인사 주소록 기반 가입 계정</span>
                  </div>
                  <div className="table-panel" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                      <thead>
                        <tr>
                          <th>아이디</th>
                          <th>이름</th>
                          <th>역할</th>
                          <th>역할키</th>
                          <th>시작일</th>
                          <th style={{ width: "100px", textAlign: "center" }}>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.filter(u => !["admin", "director", "hq_head", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase())).length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
                              연동된 주소록 회원이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          registeredUsers
                            .filter(u => !["admin", "director", "hq_head", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase()))
                            .map((u) => {
                              const roleNames = {
                                ADMIN: "최고 관리자",
                                DIRECTOR: "사업단장",
                                HQ_HEAD: "본부장",
                                CENTER_ECC: "ECC센터장",
                                CENTER_SPECIAL: "신산업특화센터장",
                                CENTER_NURI: "늘봄누리센터장",
                                CENTER_ICC: "ICC센터장",
                                CENTER_RCC: "RCC센터장",
                                TEAM_LEADER: u.id.toLowerCase() === "team_leader" || u.id.toLowerCase() === "hmsim@uc.ac.kr"
                                  ? "운영팀장"
                                  : (members || []).find(m => m.email && m.email.trim().toLowerCase() === u.id.trim().toLowerCase())?.role || "팀장교수",
                                RESEARCHER: "실무 연구원",
                                RESEARCH: "연구원"
                              };
                              const cleanName = (u.name || "").split(" ")[0];
                              const isDirectoryUser = (members || []).some(m => m.email && m.email.trim().toLowerCase() === u.id.trim().toLowerCase() && m.status !== "미참여");

                              return (
                                <tr key={u.id}>
                                  <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                                  <td style={{ fontWeight: "700" }}>{cleanName}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        u.role_key === "ADMIN" || u.role_key === "DIRECTOR" || u.role_key === "HQ_HEAD"
                                          ? "badge-red"
                                          : u.role_key.startsWith("CENTER_")
                                          ? "badge-blue"
                                          : u.role_key === "TEAM_LEADER"
                                          ? "badge-green"
                                          : "badge-gray"
                                      }`}
                                      style={{ fontSize: "0.65rem" }}
                                    >
                                      {roleNames[u.role_key] || u.role_key}
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                                  <td style={{ fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                  <td style={{ textAlign: "center" }}>
                                    {!isDirectoryUser ? (
                                      <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="btn-primary"
                                        style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "var(--danger-color)", cursor: "pointer", border: "none" }}
                                      >
                                        삭제
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700" }}>주소록 회원</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {mgmtSubTab === "approvals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {(() => {
                  const approverNames = ["심현미", "김현수", "송경영"];
                  const isApprover = currentUser && approverNames.some(name => (currentUser.name || "").includes(name));

                  if (!isApprover) {
                    return (
                      <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
                        <Info size={40} style={{ marginBottom: "0.75rem", opacity: 0.4, color: "var(--accent-color)" }} />
                        <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem" }}>결재 승인 권한 없음</span>
                        <span>프로그램 기획 및 예산 변경 결재 권한은 <strong>심현미 운영팀장, 김현수 본부장, 송경영 단장</strong> 3인에게만 부여되어 있습니다.</span>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-color)", borderLeft: "3px solid var(--accent-color)", paddingLeft: "0.4rem" }}>프로그램 기획 및 예산 변경 결재함</h3>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>연구원들의 기획 리비전 신청 관리</span>
                      </div>
                      <div className="table-panel">
                        <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                          <thead>
                            <tr>
                              <th>결재번호</th>
                              <th>프로그램 ID</th>
                              <th>프로그램명</th>
                              <th>변경 차수</th>
                              <th>상태</th>
                              <th>신청자</th>
                              <th>신청 및 처리 일시</th>
                              <th style={{ textAlign: "center", width: "180px" }}>결재 처리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {versionRequests.length === 0 ? (
                              <tr>
                                <td colSpan="8" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2.5rem" }}>
                                  결재 대기 중이거나 처리된 변경 요청 문서가 없습니다.
                                </td>
                              </tr>
                            ) : (
                              versionRequests.map((req, idx) => {
                                const approvedRequests = versionRequests.filter(r => r.status === "승인완료");
                                const isApproved = req.status === "승인완료";
                                let displayNo = "-";
                                if (isApproved) {
                                  const approvedIdx = approvedRequests.findIndex(r => r.id === req.id);
                                  const seq = approvedIdx !== -1 ? (approvedRequests.length - approvedIdx) : 1;
                                  displayNo = `${2024 + req.year}-${req.unit_id}-${seq}`;
                                }

                                return (
                                  <tr key={req.id}>
                                    <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{displayNo}</td>
                                    <td>{req.program_id}</td>
                                    <td style={{ fontWeight: "700" }}>{req.program_title}</td>
                                    <td>
                                      <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>
                                        {req.version_name}
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <span className={`badge ${
                                          req.status === "승인완료" ? "badge-green" : (req.status === "반려" ? "badge-red" : "badge-gray")
                                        }`} style={{ fontSize: "0.65rem" }}>
                                          {req.status}
                                        </span>
                                        {(req.status === "승인완료" || req.status === "반려") && req.approved_by && (
                                          <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                            ({req.approved_by})
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td>{(req.requested_by || "").replace(/\s*\(.*?\)/g, "")}</td>
                                    <td style={{ fontFamily: "var(--font-data)", lineHeight: "1.4" }}>
                                      <div>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>신청: </span>
                                        {new Date(req.requested_at).toLocaleString("ko-KR")}
                                      </div>
                                      <div style={{ marginTop: "0.15rem" }}>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>처리: </span>
                                        {req.approved_at 
                                          ? new Date(req.approved_at).toLocaleString("ko-KR") 
                                          : <span style={{ color: "var(--text-secondary)" }}>대기 중</span>
                                        }
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                                        <button
                                          onClick={() => setSelectedRequest(req)}
                                          className="btn-primary"
                                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "var(--accent-color)", cursor: "pointer", border: "none", color: "white" }}
                                        >
                                          상세보기
                                        </button>
                                        {req.status === "승인대기" && (
                                          <>
                                            <button
                                              onClick={() => handleApproveRequest(req)}
                                              className="btn-primary"
                                              style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "#10B981", cursor: "pointer", border: "none", color: "white" }}
                                            >
                                              승인
                                            </button>
                                            <button
                                              onClick={() => handleRejectRequest(req)}
                                              className="btn-primary"
                                              style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white" }}
                                            >
                                              반려
                                            </button>
                                          </>
                                        )}
                                        {isSongDirector && (
                                          <button
                                            onClick={() => handleDeleteRequest(req)}
                                            className="btn-primary"
                                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "#EF4444", cursor: "pointer", border: "none", color: "white" }}
                                          >
                                            삭제
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {mgmtSubTab === "org_chart" && (
              <OrgChartManager key={`org-${darkMode}`} />
            )}

            {mgmtSubTab === "partners" && (
              <PartnerManager key={`partner-${darkMode}-${selectedYear}`} selectedYear={selectedYear} />
            )}

            {mgmtSubTab === "portal_config" && isSongDirector && (
              <PortalConfigManager 
                key={`config-${darkMode}`}
                initialVisibility={menuVisibility} 
                onSave={handleSaveMenuVisibility} 
              />
            )}
          </div>
        )}

        {/* 결재 상세 비교 Diff 모달 */}
        {selectedRequest && (() => {
          const approvedRequests = versionRequests.filter(r => r.status === "승인완료");
          const isApproved = selectedRequest.status === "승인완료";
          let displaySeq = "-";
          if (isApproved) {
            const approvedIdx = approvedRequests.findIndex(r => r.id === selectedRequest.id);
            const seq = approvedIdx !== -1 ? (approvedRequests.length - approvedIdx) : 1;
            displaySeq = `${2024 + selectedRequest.year}-${selectedRequest.unit_id}-${seq}`;
          }
          const changesAfter = selectedRequest.changes?.after || {};
          const showTarget1 = (changesAfter.target_participants && changesAfter.target_participants !== 0 && String(changesAfter.target_participants).trim() !== "" && String(changesAfter.target_participants).trim() !== "0") || (changesAfter.target_participants_name && changesAfter.target_participants_name.trim() !== "");
          const showTarget2 = (changesAfter.target_developments && changesAfter.target_developments !== 0 && String(changesAfter.target_developments).trim() !== "" && String(changesAfter.target_developments).trim() !== "0") || (changesAfter.target_developments_name && changesAfter.target_developments_name.trim() !== "");
          const showTarget3 = (changesAfter.target_etc && changesAfter.target_etc !== 0 && String(changesAfter.target_etc).trim() !== "" && String(changesAfter.target_etc).trim() !== "0") || (changesAfter.target_etc_name && changesAfter.target_etc_name.trim() !== "");
          let beforeVersion = "최초계획";
          let afterVersion = selectedRequest.version_name || "신청 계획";
          if (afterVersion.includes("차 수정")) {
            const numMatch = afterVersion.match(/(\d+)차/);
            if (numMatch) {
              const num = parseInt(numMatch[1], 10);
              if (num === 1) {
                beforeVersion = "최초계획";
              } else {
                beforeVersion = `${num - 1}차 수정`;
              }
            }
          } else if (afterVersion === "송경영 단장 직접 수정") {
            beforeVersion = "이전 계획";
          }

          return (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
              <div className="card" style={{ width: "950px", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    📄 [{selectedRequest.program_title}] 기획 변경 상세 대조표 ({selectedRequest.version_name})
                  </h3>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.78rem" }}>
                  {/* 1. 기본 기안 정보 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>결재번호:</span> <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-data)" }}>{displaySeq}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>신청자:</span> <strong style={{ color: "var(--text-primary)" }}>{(selectedRequest.requested_by || "").replace(/\s*\(.*?\)/g, "")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>신청 일시:</span> <strong style={{ color: "var(--text-primary)" }}>{new Date(selectedRequest.requested_at).toLocaleString("ko-KR")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>상태:</span> <strong style={{ color: selectedRequest.status === "승인완료" ? "#10B981" : (selectedRequest.status === "반려" ? "#EF4444" : "#FBBF24") }}>{selectedRequest.status}</strong>
                    </div>
                  </div>

                  {/* 2. 대조 비교 테이블 (이전 vs 신청) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    {/* 변경 전 (Before) */}
                    <div style={{ border: "1px solid rgba(239, 68, 68, 0.2)", padding: "1rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.015)" }}>
                      <h4 style={{ margin: "0 0 0.6rem 0", color: "#F87171", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid rgba(239, 68, 68, 0.1)", paddingBottom: "0.3rem" }}>
                        🔴 변경 전 ({beforeVersion})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>💰 재원별 예산 배정</span>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <tbody>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>국고 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_national || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.before.years?.[selectedYear]?.budget_carry_national || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>시비 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_city || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.before.years?.[selectedYear]?.budget_carry_city || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr><td style={{ padding: "0.15rem 0" }}>외부사업비</td><td style={{ textAlign: "right", fontWeight: "700", color: "#F87171" }}>{((selectedRequest.changes.before.years?.[selectedYear]?.budget_external || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>📁 비목별 예산 세부 배정</span>
                          {renderBudgetCategoriesDiff(selectedRequest.changes.before.years?.[selectedYear]?.budget_categories)}
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem" }}>📅 월별 추진 일정 (PDCA)</span>
                          {renderTimelineDiff(selectedRequest.changes.before.timeline)}
                        </div>

                        {(showTarget1 || showTarget2 || showTarget3) && (
                          <div>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>🎯 실적 목표치</span>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                              <tbody>
                                {showTarget1 && (
                                  <tr style={{ borderBottom: (showTarget2 || showTarget3) ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_participants_name || "참여인원"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_participants || 0} {selectedRequest.changes.before.target_participants_unit || "명"}</td></tr>
                                )}
                                {showTarget2 && (
                                  <tr style={{ borderBottom: showTarget3 ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_developments_name || "개발건수"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_developments || 0} {selectedRequest.changes.before.target_developments_unit || "건"}</td></tr>
                                )}
                                {showTarget3 && (
                                  <tr><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.before.target_etc_name || "기타"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.before.target_etc || 0} {selectedRequest.changes.before.target_etc_unit || "개"}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>👥 참여대상 및 부서</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>참여대상: {selectedRequest.changes.before.targetAudience || "미입력"} | 부서: {selectedRequest.changes.before.coopDept || "미입력"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 변경 후 (After) */}
                    <div style={{ border: "1px solid rgba(16, 185, 129, 0.2)", padding: "1rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.015)" }}>
                      <h4 style={{ margin: "0 0 0.6rem 0", color: "#34D399", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid rgba(16, 185, 129, 0.1)", paddingBottom: "0.3rem" }}>
                        🟢 변경 후 ({afterVersion})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>💰 재원별 예산 배정</span>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <tbody>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>국고 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_national || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.after.years?.[selectedYear]?.budget_carry_national || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}><td style={{ padding: "0.15rem 0" }}>시비 본예산 / 이월</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_city || 0) / 1000000).toFixed(1)} / {((selectedRequest.changes.after.years?.[selectedYear]?.budget_carry_city || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                              <tr><td style={{ padding: "0.15rem 0" }}>외부사업비</td><td style={{ textAlign: "right", fontWeight: "700", color: "#34D399" }}>{((selectedRequest.changes.after.years?.[selectedYear]?.budget_external || 0) / 1000000).toFixed(1)} 백만원</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>📁 비목별 예산 세부 배정</span>
                          {renderBudgetCategoriesDiff(selectedRequest.changes.after.years?.[selectedYear]?.budget_categories)}
                        </div>

                        <div>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem" }}>📅 월별 추진 일정 (PDCA)</span>
                          {renderTimelineDiff(selectedRequest.changes.after.timeline)}
                        </div>

                        {(showTarget1 || showTarget2 || showTarget3) && (
                          <div>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>🎯 실적 목표치</span>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                              <tbody>
                                {showTarget1 && (
                                  <tr style={{ borderBottom: (showTarget2 || showTarget3) ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_participants_name || "참여인원"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_participants || 0} {selectedRequest.changes.after.target_participants_unit || "명"}</td></tr>
                                )}
                                {showTarget2 && (
                                  <tr style={{ borderBottom: showTarget3 ? "1px solid rgba(255,255,255,0.02)" : "none" }}><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_developments_name || "개발건수"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_developments || 0} {selectedRequest.changes.after.target_developments_unit || "건"}</td></tr>
                                )}
                                {showTarget3 && (
                                  <tr><td style={{ padding: "0.15rem 0" }}>{selectedRequest.changes.after.target_etc_name || "기타"}</td><td style={{ textAlign: "right", fontWeight: "700" }}>{selectedRequest.changes.after.target_etc || 0} {selectedRequest.changes.after.target_etc_unit || "개"}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>👥 참여대상 및 부서</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-primary)" }}>참여대상: {selectedRequest.changes.after.targetAudience || "미입력"} | 부서: {selectedRequest.changes.after.coopDept || "미입력"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단 결재 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem" }}>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    style={{ padding: "0.45rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer", fontSize: "0.75rem" }}
                  >
                    닫기
                  </button>
                  {selectedRequest.status === "승인대기" && (
                    <>
                      <button 
                        onClick={() => handleApproveRequest(selectedRequest)}
                        style={{ padding: "0.45rem 1.5rem", borderRadius: "6px", background: "#10B981", border: "none", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "0.75rem" }}
                      >
                        승인 처리
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(selectedRequest)}
                        style={{ padding: "0.45rem 1.5rem", borderRadius: "6px", background: "#EF4444", border: "none", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "0.75rem" }}
                      >
                        반려 처리
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        );
      })()}

        {/* 탭 개편: 반응형 사이드 2분할 레이아웃 및 목표치/실적 미니 표 */}
        {activeTab === "kpis" && (
          <>
            {/* 성과지표 관리 탭: 전체 영역을 Fragment로 묶어 하단에 성과지표 전용 엑셀 업로더를 배치합니다. */}
            <div className="kpi-split-layout">
            {/* 좌측 성과지표 리스트 테이블 */}
            <div className="glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>성과지표(KPI) 통합 목록</h2>
                  {/* 자율 / 중점 성과지표 서브탭 제어기 */}
                  <div style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.25rem", borderRadius: "0.5rem", marginTop: "0.5rem", width: "fit-content" }}>
                    {(menuVisibility.kpi_status !== false || isSongDirector) && (
                      <button
                        onClick={() => {
                          setKpiSubTab("공통");
                          // 공통 탭에 해당하는 첫 번째 지표 자동 선택
                          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "공통");
                          setSelectedKpi(first || null);
                        }}
                        style={{
                          border: "none",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "0.35rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: kpiSubTab === "공통" ? "var(--accent-color)" : "transparent",
                          color: kpiSubTab === "공통" ? "white" : (menuVisibility.kpi_status === false ? "#EF4444" : "var(--text-secondary)"),
                          transition: "all 0.2s"
                        }}
                      >
                        (교육부)공통성과지표
                        {menuVisibility.kpi_status === false && (
                          <span style={{ fontSize: "0.6rem", color: "#EF4444", fontWeight: "800", marginLeft: "3px" }}>[숨김]</span>
                        )}
                      </button>
                    )}
                    {(menuVisibility.kpi_self !== false || isSongDirector) && (
                      <button
                        onClick={() => {
                          setKpiSubTab("자율");
                          // 자율 탭에 해당하는 첫 번째 지표 자동 선택
                          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "자율");
                          setSelectedKpi(first || null);
                        }}
                        style={{
                          border: "none",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "0.35rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: kpiSubTab === "자율" ? "var(--accent-color)" : "transparent",
                          color: kpiSubTab === "자율" ? "white" : (menuVisibility.kpi_self === false ? "#EF4444" : "var(--text-secondary)"),
                          transition: "all 0.2s"
                        }}
                      >
                        (지자체)자율성과지표
                        {menuVisibility.kpi_self === false && (
                          <span style={{ fontSize: "0.6rem", color: "#EF4444", fontWeight: "800", marginLeft: "3px" }}>[숨김]</span>
                        )}
                      </button>
                    )}
                    {(menuVisibility.kpi_focus !== false || isSongDirector) && (
                      <button
                        onClick={() => {
                          setKpiSubTab("중점");
                          // 중점 탭에 해당하는 첫 번째 지표 자동 선택
                          const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "중점");
                          setSelectedKpi(first || null);
                        }}
                        style={{
                          border: "none",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "0.35rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: kpiSubTab === "중점" ? "var(--accent-color)" : "transparent",
                          color: kpiSubTab === "중점" ? "white" : "var(--text-secondary)",
                          transition: "all 0.2s"
                        }}
                      >
                        (대학)중점관리지표
                      </button>
                    )}
                  </div>
                </div>
                

              </div>
              
              <div className="table-panel">
                <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>지표 ID</th>
                      <th>지표명</th>
                      <th>유형</th>
                      <th>현재달성도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const kpiMap = new Map();
                      displayProjects.forEach((p) => {
                        p.units.forEach((u) => {
                          u.kpis.forEach((k) => {
                            if (k.type === kpiSubTab) {
                              const nk = getNormalizedKpi(k, selectedYear);
                              kpiMap.set(nk.id, { k, nk });
                            }
                          });
                        });
                      });

                      const sortedKpis = Array.from(kpiMap.values()).sort((a, b) => {
                        const prefixA = a.nk.id.startsWith("C-") ? "C" : "L";
                        const prefixB = b.nk.id.startsWith("C-") ? "C" : "L";
                        if (prefixA !== prefixB) {
                          return prefixA.localeCompare(prefixB);
                        }
                        const numA = parseInt(a.nk.id.replace("L-", "").replace("C-", ""), 10) || 0;
                        const numB = parseInt(b.nk.id.replace("L-", "").replace("C-", ""), 10) || 0;
                        return numA - numB;
                      });

                      return sortedKpis.map(({ k, nk }) => {
                        let rate = 0;
                        if (selectedYear === 1 && nk.id === "L-1") {
                          rate = 111.9;
                        } else if (selectedYear === 1 && nk.id === "L-2") {
                          rate = 687.8;
                        } else if (selectedYear === 1 && nk.id === "L-3") {
                          rate = 138.6;
                        } else if (selectedYear === 1 && nk.id === "L-4") {
                          rate = 146.7;
                        } else if (selectedYear === 1 && nk.id === "L-5") {
                          rate = 81.8;
                        } else if (selectedYear === 1 && nk.id === "L-6") {
                          rate = 103.3;
                        } else if (selectedYear === 1 && nk.id === "L-7") {
                          rate = 321.3;
                        } else if (selectedYear === 1 && nk.id === "L-8") {
                          rate = 134.0;
                        } else if (selectedYear === 1 && nk.id === "L-9") {
                          rate = 106.0;
                        } else if (selectedYear === 1 && nk.id === "L-10") {
                          rate = 128.5;
                        } else if (selectedYear === 1 && nk.id === "L-11") {
                          rate = 160.0;
                        } else if (selectedYear === 1 && nk.id === "L-12") {
                          rate = 114.6;
                        } else if (selectedYear === 1 && nk.id === "L-13") {
                          rate = 108.0;
                        } else if (selectedYear === 1 && nk.id === "L-14") {
                          rate = 500.0;
                        } else if (selectedYear === 1 && nk.id === "L-15") {
                          rate = 132.2;
                        } else if (selectedYear === 1 && nk.id === "L-16") {
                          rate = 123.3;
                        } else if (selectedYear === 1 && nk.id === "L-17") {
                          rate = 0.0;
                        } else if (selectedYear === 1 && nk.id === "L-18") {
                          rate = 176.5;
                        } else if (selectedYear === 1 && nk.id === "L-19") {
                          rate = 244.0;
                        } else if (selectedYear === 1 && nk.id === "L-20") {
                          rate = 202.5;
                        } else if (selectedYear === 1 && nk.id === "L-21") {
                          rate = 100.0;
                        } else if (selectedYear === 1 && nk.id === "L-22") {
                          rate = 175.0;
                        } else if (selectedYear === 1 && nk.id === "L-23") {
                          rate = 144.3;
                        } else if (selectedYear === 1 && nk.id === "L-24") {
                          rate = 138.3;
                        } else if (nk.subItems && nk.subItems.length > 0) {
                          let sumRate = 0;
                          nk.subItems.forEach((sub) => {
                            const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                            sumRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                          });
                          rate = sumRate / nk.subItems.length;
                        } else {
                          rate = nk.target > 0 ? (nk.current / nk.target) * 100 : 0;
                        }
                        const isSelected = selectedKpi?.id === nk.id;
                        return (
                          <tr
                            key={nk.id}
                            onClick={() => setSelectedKpi(nk)}
                            style={{
                              cursor: "pointer",
                              background: isSelected ? "rgba(59,130,246,0.08)" : "inherit",
                              borderLeft: isSelected ? "4px solid var(--accent-color)" : "none",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{nk.id}</td>
                            <td style={{ fontWeight: isSelected ? "700" : "normal" }}>{nk.name}</td>
                            <td>
                              <span className={`badge ${nk.type === "공통" ? "badge-green" : nk.type === "자율" ? "badge-blue" : "badge-yellow"}`}>
                                {nk.type}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: "50px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                  <div style={{ width: `${Math.min(rate, 100)}%`, height: "100%", background: rate >= 100 ? "var(--success-color)" : "var(--warning-color)" }} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", color: rate >= 100 ? "var(--success-color)" : "inherit" }}>
                                  {rate.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 우측 성과지표 세부내용 상세 블록 (Sticky 고정 스크롤 효과) */}
            <div className="sticky-panel">
              <div className="glass-card" style={{ border: selectedKpi ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)", minHeight: "360px" }}>
                {selectedKpi ? (() => {
                  const nk = getNormalizedKpi(selectedKpi, selectedYear);
                  return (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.75rem" }}>
                        <span className="badge badge-blue" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                          {nk.id}
                        </span>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>{nk.name} 상세 명세</h3>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div>
                          <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold", display: "block" }}>지표 정의</span>
                          <p style={{ fontSize: "0.85rem", fontWeight: "700", marginTop: "0.2rem", lineHeight: "1.4" }}>
                            {nk.description}
                          </p>
                        </div>

                        {/* 세부지표 목푯값 및 실적값을 보여주는 미니 표 추가 */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold" }}>지표 구성 세부항목 목표 대비 실적 표</span>
                            <span className="badge badge-yellow" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>{selectedYear}차년도 세부지표</span>
                          </div>
                          <table className="mini-table" style={{ fontSize: "0.75rem" }}>
                            <thead>
                              <tr>
                                <th>세부 항목명</th>
                                <th style={{ textAlign: "right" }}>기준값</th>
                                <th style={{ textAlign: "right" }}>목푯값</th>
                                <th style={{ textAlign: "right" }}>현재실적</th>
                                <th style={{ textAlign: "right" }}>달성도</th>
                              </tr>
                            </thead>
                            <tbody>
                              {nk.subItems && nk.subItems.map((sub, index) => {
                                const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                const subRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                const canEditTarget = currentRole.rank <= 4;
                                const cleanName = sub.name.replace(/\s*\(기준값:\s*\d+\)/, "");
                                const letter = String.fromCharCode(65 + index); // 0 -> A, 1 -> B, 2 -> C ...
                                return (
                                  <tr key={sub.id}>
                                    <td style={{ fontWeight: "700" }}>{`[${letter}] ${cleanName}`}</td>
                                    <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>
                                      {sub.base !== undefined ? `${sub.base.toLocaleString()} ${sub.unit}` : "-"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                        <input
                                          type="number"
                                          step="any"
                                          className="user-selector"
                                          disabled={!canEditTarget}
                                          defaultValue={yData.target}
                                          onBlur={(e) => {
                                            if (!canEditTarget) return;
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) {
                                              handleUpdateKpiValue(sub.id, "target", val);
                                            }
                                          }}
                                          style={{
                                            width: "55px",
                                            textAlign: "right",
                                            fontSize: "0.75rem",
                                            padding: "0.1rem 0.2rem",
                                            background: !canEditTarget ? "rgba(128, 128, 128, 0.25)" : "rgb(128, 128, 128)",
                                            color: !canEditTarget ? "rgba(255, 255, 255, 0.4)" : "white",
                                            border: "1px solid var(--border-color)",
                                            borderRadius: "0.25rem",
                                            cursor: !canEditTarget ? "not-allowed" : "text"
                                          }}
                                        />
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{sub.unit}</span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                        <input
                                          type="number"
                                          step="any"
                                          className="user-selector"
                                          defaultValue={yData.current}
                                          onBlur={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) {
                                              handleUpdateKpiValue(sub.id, "current", val);
                                            }
                                          }}
                                          style={{
                                            width: "55px",
                                            textAlign: "right",
                                            fontSize: "0.75rem",
                                            padding: "0.1rem 0.2rem",
                                            background: "rgb(128, 128, 128)",
                                            color: "white",
                                            border: "1px solid var(--border-color)",
                                            borderRadius: "0.25rem"
                                          }}
                                        />
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{sub.unit}</span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "800", color: subRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                      {subRate.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })}
                              {(() => {
                                let totalKpiRate = 0;
                                if (selectedYear === 1 && nk.id === "L-1") {
                                  totalKpiRate = 111.9;
                                } else if (selectedYear === 1 && nk.id === "L-2") {
                                  totalKpiRate = 687.8;
                                } else if (selectedYear === 1 && nk.id === "L-3") {
                                  totalKpiRate = 138.6;
                                } else if (selectedYear === 1 && nk.id === "L-4") {
                                  totalKpiRate = 146.7;
                                } else if (selectedYear === 1 && nk.id === "L-5") {
                                  totalKpiRate = 81.8;
                                } else if (selectedYear === 1 && nk.id === "L-6") {
                                  totalKpiRate = 103.3;
                                } else if (selectedYear === 1 && nk.id === "L-7") {
                                  totalKpiRate = 321.3;
                                } else if (selectedYear === 1 && nk.id === "L-8") {
                                  totalKpiRate = 134.0;
                                } else if (selectedYear === 1 && nk.id === "L-9") {
                                  totalKpiRate = 106.0;
                                } else if (selectedYear === 1 && nk.id === "L-10") {
                                  totalKpiRate = 128.5;
                                } else if (selectedYear === 1 && nk.id === "L-11") {
                                  totalKpiRate = 160.0;
                                } else if (selectedYear === 1 && nk.id === "L-12") {
                                  totalKpiRate = 114.6;
                                } else if (selectedYear === 1 && nk.id === "L-13") {
                                  totalKpiRate = 108.0;
                                } else if (selectedYear === 1 && nk.id === "L-14") {
                                  totalKpiRate = 500.0;
                                } else if (selectedYear === 1 && nk.id === "L-15") {
                                  totalKpiRate = 132.2;
                                } else if (selectedYear === 1 && nk.id === "L-16") {
                                  totalKpiRate = 123.3;
                                } else if (selectedYear === 1 && nk.id === "L-17") {
                                  totalKpiRate = 0.0;
                                } else if (selectedYear === 1 && nk.id === "L-18") {
                                  totalKpiRate = 176.5;
                                } else if (selectedYear === 1 && nk.id === "L-19") {
                                  totalKpiRate = 244.0;
                                } else if (selectedYear === 1 && nk.id === "L-20") {
                                  totalKpiRate = 202.5;
                                } else if (selectedYear === 1 && nk.id === "L-21") {
                                  totalKpiRate = 100.0;
                                } else if (selectedYear === 1 && nk.id === "L-22") {
                                  totalKpiRate = 175.0;
                                } else if (selectedYear === 1 && nk.id === "L-23") {
                                  totalKpiRate = 144.3;
                                } else if (selectedYear === 1 && nk.id === "L-24") {
                                  totalKpiRate = 138.3;
                                } else if (nk.subItems && nk.subItems.length > 0) {
                                  let sumKpiRate = 0;
                                  nk.subItems.forEach((sub) => {
                                    const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                    sumKpiRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                  });
                                  totalKpiRate = sumKpiRate / nk.subItems.length;
                                }
                                const finalCapRate = Math.min(totalKpiRate, 100.0);
                                return (
                                  <tr style={{ background: "rgba(59,130,246,0.06)", borderTop: "1px solid var(--border-color-dark)" }}>
                                    <td colSpan={2} style={{ fontWeight: "800" }}>종합 지표 달성도 (Total)</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)" }}>100.0%</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)", color: "var(--accent-color)", fontWeight: "700" }}>{totalKpiRate.toFixed(1)}%</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "900", color: finalCapRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                      {finalCapRate.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })()}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ fontSize: "0.95rem", color: "rgb(36, 88, 108)", fontWeight: "bold", display: "block", marginBottom: "0.4rem" }}>성과지표 산출공식 및 세부산식 분석</span>
                          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", padding: "0.6rem 0.8rem", borderRadius: "0.375rem" }}>
                            <div style={{ marginBottom: "0.5rem" }}>
                              <RenderLatexFormula formula={nk.formula} />
                            </div>
                            {nk.type === "공통" && (
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                <p style={{ fontWeight: "800", color: "#60a5fa", marginBottom: "0.25rem" }}>💡 교육부 RISE 공통성과지표 상세 가이드</p>
                                <p>• <strong>평가 메커니즘</strong>: 단순 실적 달성도가 아닌, <strong>2024년 기준연도 대비 당해연도의 순 증가 비율(성장률)</strong>을 계산합니다.</p>
                                <p>• <strong>산식 세부 분석</strong>: 
                                  {nk.id === "C-1" && " 지자체 대표과제 성과 달성도 평균수식을 적용하여 각 대표과제의 개별 목표 달성률의 평균을 냅니다."}
                                  {nk.id === "C-2" && " 지산학연 연계 건수 및 연구 계약 체결 금액의 기준연도(24년) 총합 대비 성장 비율을 구합니다."}
                                  {nk.id === "C-3" && " 대학 평생직업교육 수료생 수 및 정원외 전형 입학생 수의 24년 모수 대비 증가율을 측정합니다."}
                                  {nk.id === "C-4" && " 졸업자 중 울산광역시 및 인접 관내 취업자의 절대 인원 증가 추이를 백분율로 추적합니다."}
                                  {nk.id === "C-5" && " RISE 지산학 협력체계 만족도 평점의 24년 기초 조사 평점 대비 성장 추이를 측정합니다."}
                                  {nk.id === "C-6" && " 대학 경제 영향력 평가(IMPACT) 모델에 따른 지역 경제 생산 유발 효과(억원)의 향상률을 계산합니다."}
                                </p>
                                <p style={{ marginTop: "0.25rem" }}>• <strong>지표 활용시기</strong>: {
                                  nk.id === "C-1" || nk.id === "C-2" || nk.id === "C-3"
                                    ? "2차년도 중간평가 및 5차년도 종합평가에 모두 활용됩니다."
                                    : "5차년도 최종 종합평가 시에만 활용되는 중장기 결과지표입니다."
                                }</p>
                              </div>
                            )}
                            {nk.type === "자율" && (
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                <p style={{ fontWeight: "800", color: "#ec4899", marginBottom: "0.25rem" }}>💡 지자체(울산) 자율성과지표 안내</p>
                                <p>• <strong>평가 메커니즘</strong>: 울산 RISE 비전 및 지역 주도 대학지원을 위해 시도와 대학이 합의하여 지정한 정량 지표입니다.</p>
                                <p>• <strong>활용 시기</strong>: 매년 실시되는 지자체 자체평가 및 교육부의 연차점검, 중간·종합평가 시 연차별 달성도가 전면 반영됩니다.</p>
                              </div>
                            )}
                            {nk.type === "중점" && (
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.5rem", lineHeight: "1.45" }}>
                                <p style={{ fontWeight: "800", color: "#f472b6", marginBottom: "0.25rem" }}>💡 대학 중점관리지표 안내</p>
                                <p>• <strong>평가 메커니즘</strong>: 대학 강점·특성화 분야 육성 및 경쟁력 제고를 목적으로 대학이 설정한 집중 관리 핵심성과지표입니다.</p>
                                <p>• <strong>활용 시기</strong>: 대학 자체 성과관리 환류 및 시도 컨설팅 환류 지표로 연중 활용됩니다.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem" }}>
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>주관 부서</span>
                            <p style={{ fontWeight: "700" }}>{nk.owner}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>측정 주기</span>
                            <p style={{ fontWeight: "700" }}>{nk.cycle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", color: "var(--text-secondary)", gap: "0.5rem" }}>
                    <HelpCircle size={32} style={{ color: "var(--accent-color)" }} />
                    <span style={{ fontSize: "0.8rem" }}>좌측 목록의 성과지표 행을 클릭하시면 상세 비교 정보가 나타납니다.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
        )}

        {activeTab === "agreements" && (
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            {/* 협약서 서브탭 활성화 시 협약서 단독 매니저 마운트 */}
            {agreementsSubTab === "agreements" && (
              <AgreementManager
                key={`agreement-${darkMode}-${selectedYear}`}
                projects={displayProjects}
                agreements={agreements}
                selectedYear={selectedYear}
                onAddAgreement={handleAddAgreement}
                onUpdateAgreement={handleUpdateAgreement}
                onDeleteAgreement={handleDeleteAgreement}
                setAgreements={setAgreements}
                currentRole={currentRole}
              />
            )}

            {/* 통합 상장/이수증 서브탭 활성화 시 통합 매니저 마운트 */}
            {agreementsSubTab === "unified_certificates" && (
              <UnifiedCertificateManager
                key={`unified-certificate-${darkMode}-${selectedYear}`}
                projects={displayProjects}
                certificates={unifiedCertificates}
                selectedYear={selectedYear}
                onAddCertificate={handleAddUnifiedCertificate}
                onUpdateCertificate={handleUpdateUnifiedCertificate}
                onDeleteCertificate={handleDeleteUnifiedCertificate}
                setCertificates={setUnifiedCertificates}
                currentRole={currentRole}
                members={members}
              />
            )}

            {/* 장학금 관리 서브탭 활성화 시 장학금 매니저 마운트 */}
            {agreementsSubTab === "scholarships" && (
              <ScholarshipManager
                key={`scholarship-${darkMode}-${selectedYear}`}
                scholarships={scholarships}
                setScholarships={setScholarships}
                selectedYear={selectedYear}
                currentRole={currentRole}
                members={members}
              />
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="progress-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 프로그램 진행 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setProgressSubTab("progress_status")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: progressSubTab === "progress_status" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: progressSubTab === "progress_status" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                프로그램 진행 상황
              </button>
              <button
                onClick={() => setProgressSubTab("major_programs")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: progressSubTab === "major_programs" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: progressSubTab === "major_programs" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                주요 프로그램
              </button>
              <button
                onClick={() => setProgressSubTab("satisfaction_survey")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: progressSubTab === "satisfaction_survey" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: progressSubTab === "satisfaction_survey" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                만족도 조사
              </button>
            </div>

            {/* 본문 콘텐츠 스위칭 */}
            {progressSubTab === "progress_status" ? (
              <ProgramProgressManager
                projects={displayProjects}
                selectedYear={selectedYear}
                onUpdateProgramDetails={handleUpdateProgramDetails}
                onSelectProgram={(unitId, progId) => {
                  setActiveTab("projects");
                  setProjectsSubTab("program_mgmt");
                  setSelectedUnitId(unitId);
                  setSelectedProgId(progId);
                }}
              />
            ) : progressSubTab === "major_programs" ? (
              <MajorProgramsManager
                key={`major-prog-${darkMode}-${selectedYear}`}
                selectedYear={selectedYear}
              />
            ) : (
              <SatisfactionManager
                key={`satisfaction-${darkMode}-${selectedYear}`}
                selectedYear={selectedYear}
              />
            )}
          </div>
        )}

        {activeTab === "budget" && (
          <div className="budget-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 예산 관리 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setBudgetSubTab("budget_categories")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: budgetSubTab === "budget_categories" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: budgetSubTab === "budget_categories" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                비목별 관리
              </button>
              <button
                onClick={() => setBudgetSubTab("execution_rate")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: budgetSubTab === "execution_rate" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: budgetSubTab === "execution_rate" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                집행률 관리
              </button>
            </div>

            {/* 본문 콘텐츠 스위칭 */}
            {budgetSubTab === "budget_categories" ? (
              <BudgetItemsManager
                key={`budget-items-${darkMode}-${selectedYear}`}
                projects={displayProjects}
                currentRole={currentRole}
                onUpdateBudgetDetails={handleUpdateBudgetDetails}
                selectedYear={selectedYear}
              />
            ) : (
              <BudgetExecutionManager
                key={`budget-exec-${darkMode}-${selectedYear}`}
                projects={displayProjects}
                currentRole={currentRole}
                selectedYear={selectedYear}
              />
            )}
          </div>
        )}

        {activeTab === "procurement" && (
          <div className="procurement-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 구매용역 관리 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setProcurementSubTab("env_improvement")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: procurementSubTab === "env_improvement" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: procurementSubTab === "env_improvement" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                환경개선
              </button>
              <button
                onClick={() => setProcurementSubTab("equipment_purchase")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: procurementSubTab === "equipment_purchase" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: procurementSubTab === "equipment_purchase" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                기자재 구입∙운영
              </button>
              <button
                onClick={() => setProcurementSubTab("major_services")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: procurementSubTab === "major_services" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: procurementSubTab === "major_services" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                주요 용역
              </button>
            </div>

            {/* 본문 콘텐츠 */}
            <ProcurementManager
              key={`procurement-${darkMode}-${selectedYear}`}
              currentRole={currentRole}
              currentUser={currentUser}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              subTab={procurementSubTab}
              onChangeSubTab={setProcurementSubTab}
              envData={envData}
              setEnvData={setEnvData}
              equipData={equipData}
              setEquipData={setEquipData}
              serviceData={serviceData}
              setServiceData={setServiceData}
              projects={displayProjects}
            />
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="schedule-management-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {/* 일정 관리 본문 가로 탭바 헤더 */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setScheduleSubTab("monthly")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "monthly" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "monthly" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                월간 일정
              </button>
              <button
                onClick={() => setScheduleSubTab("events")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "events" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "events" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                주요 행사
              </button>
              <button
                onClick={() => setScheduleSubTab("meetings")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "meetings" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "meetings" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                회의록 등록
              </button>
              <button
                onClick={() => setScheduleSubTab("committees")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "committees" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "committees" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                위원회 관리
              </button>
              <button
                onClick={() => setScheduleSubTab("press")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  color: scheduleSubTab === "press" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: scheduleSubTab === "press" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                언론보도
              </button>
            </div>

            {/* 본문 콘텐츠 */}
            <ScheduleManager
              key={`schedule-${darkMode}-${selectedYear}`}
              currentUser={currentUser}
              currentRole={currentRole}
              selectedYear={selectedYear}
              darkMode={darkMode}
              subTab={scheduleSubTab}
              onChangeSubTab={setScheduleSubTab}
              monthlySchedules={monthlySchedules}
              setMonthlySchedules={setMonthlySchedules}
              eventSchedules={eventSchedules}
              setEventSchedules={setEventSchedules}
              meetingSchedules={meetingSchedules}
              setMeetingSchedules={setMeetingSchedules}
              pressReleases={pressReleases}
              setPressReleases={setPressReleases}
              members={members}
            />
          </div>
        )}

        {activeTab === "llm_wiki" && (
          <LLMWiki selectedYear={selectedYear} darkMode={darkMode} />
        )}
      </main>

      {isMemberModalOpen && editingMember && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingMember.name || !editingMember.email) {
                alert("성명과 이메일은 필수 입력 사항입니다.");
                return;
              }
              const oldMembers = [...members];
              if (editingMember.id) {
                // 수정 처리
                const updatedList = members.map((m) => (m.id === editingMember.id ? editingMember : m));
                setMembers(updatedList);
                try {
                  const sanitized = sanitizeMemberForDb(editingMember);
                  const { error } = await supabase
                    .from("rise_members")
                    .upsert(sanitized);
                  if (error) throw error;
                } catch (err) {
                  console.error("Failed to update member in DB:", err);
                  alert(`DB 저장 중 오류가 발생했습니다. (테이블 생성 여부 확인 필요): ${err.message || err}`);
                  setMembers(oldMembers); // 롤백
                }
              } else {
                // 추가 처리
                const newMember = { 
                  ...editingMember, 
                  id: `m-${Date.now()}`,
                  startDate: editingMember.startDate || "2026-03-01",
                  status: editingMember.status || "참여중"
                };
                setMembers([...members, newMember]);
                try {
                  const sanitized = sanitizeMemberForDb(newMember);
                  const { error } = await supabase
                    .from("rise_members")
                    .insert(sanitized);
                  if (error) throw error;
                } catch (err) {
                  console.error("Failed to insert member into DB:", err);
                  alert(`DB 추가 중 오류가 발생했습니다. (테이블 생성 여부 확인 필요): ${err.message || err}`);
                  setMembers(oldMembers); // 롤백
                }
              }
              setIsMemberModalOpen(false);
              setEditingMember(null);
            }}
            className="glass-card"
            style={{ width: "480px", maxHeight: "85vh", overflowY: "auto", padding: "2rem", border: "1px solid var(--border-color)", background: "var(--bg-dark)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem" }}>
              {editingMember.id ? "구성원 정보 수정" : "신규 구성원 등록"}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>성명 *</label>
                  <input
                    type="text"
                    required
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "var(--text-primary)" }}
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>소속 부서</label>
                  <select
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem" }}
                    value={editingMember.dept}
                    onChange={(e) => setEditingMember({ ...editingMember, dept: e.target.value })}
                  >
                    <option value="-">-</option>
                    <option value="운영본부">운영본부</option>
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="RCC센터">RCC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>직책(역할)</label>
                  <select
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem" }}
                    value={editingMember.role}
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      let nextGrade = "연구원";
                      if (["사업단장", "본부장", "센터장", "팀장교수"].includes(nextRole)) {
                        nextGrade = "정교수";
                      } else if (nextRole === "운영팀장") {
                        nextGrade = "부장";
                      }
                      setEditingMember({ ...editingMember, role: nextRole, grade: nextGrade });
                    }}
                  >
                    <option value="사업단장">사업단장</option>
                    <option value="본부장">본부장</option>
                    <option value="센터장">센터장</option>
                    <option value="운영팀장">운영팀장</option>
                    <option value="팀장교수">팀장교수</option>
                    <option value="연구원">연구원</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>직급/직위</label>
                  <select
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem" }}
                    value={editingMember.grade}
                    onChange={(e) => setEditingMember({ ...editingMember, grade: e.target.value })}
                  >
                    {["사업단장", "본부장", "센터장", "팀장교수"].includes(editingMember.role) ? (
                      <>
                        <option value="정교수">정교수</option>
                        <option value="부교수">부교수</option>
                        <option value="조교수">조교수</option>
                      </>
                    ) : (
                      <>
                        <option value="부장">부장</option>
                        <option value="차장">차장</option>
                        <option value="과장">과장</option>
                        <option value="대리">대리</option>
                        <option value="사원">사원</option>
                        <option value="책임연구원">책임연구원</option>
                        <option value="선임연구원">선임연구원</option>
                        <option value="연구원">연구원</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>이메일 *</label>
                <input
                  type="email"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "var(--text-primary)" }}
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>교내 전화번호</label>
                  <input
                    type="text"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "var(--text-primary)" }}
                    placeholder="052-230-XXXX"
                    value={editingMember.phoneOffice}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneOffice: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>휴대전화번호</label>
                  <input
                    type="text"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "var(--text-primary)" }}
                    placeholder="010-XXXX-XXXX"
                    value={editingMember.phoneMobile}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneMobile: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingMember.status !== "미참여"}
                  onChange={(e) => {
                    const isActive = e.target.checked;
                    setEditingMember({
                      ...editingMember,
                      status: isActive ? "참여중" : "미참여",
                      endDate: isActive ? "" : (editingMember.endDate || "")
                    });
                  }}
                />
                <label htmlFor="is_active" style={{ fontWeight: "700", cursor: "pointer" }}>현재 사업단 참여중</label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>시작일</label>
                  <input
                    type="date"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "var(--text-primary)" }}
                    value={editingMember.startDate || editingMember.hireDate || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, startDate: e.target.value, hireDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>종료일</label>
                  <input
                    type="date"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "var(--text-primary)" }}
                    disabled={editingMember.status !== "미참여"}
                    value={editingMember.endDate || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMember(null);
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
              >
                저장
              </button>
            </div>
          </form>
        </div>
      )}

      {showProgramEditor && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "var(--bg-color)", padding: "1.5rem", borderRadius: "0.5rem",
            width: "400px", border: "1px solid var(--border-color)"
          }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {editingProgram ? "프로그램 수정" : "신규 프로그램 추가"}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>단위과제 *</label>
                <select
                  value={programForm.unitId}
                  onChange={(e) => setProgramForm({ ...programForm, unitId: e.target.value })}
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.25rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  disabled={!!editingProgram}
                >
                  <option value="">단위과제를 선택하세요</option>
                  {displayProjects.flatMap(p => p.units).map(u => (
                    <option key={u.id} value={u.id}>{u.id === "Common" ? "" : `${u.id}. `}{u.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>프로그램 ID *</label>
                <input
                  type="text"
                  value={programForm.id}
                  onChange={(e) => setProgramForm({ ...programForm, id: e.target.value })}
                  placeholder="예: 1-1, Common-1 등"
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.25rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", outline: "none" }}
                  disabled={!!editingProgram}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>프로그램명 *</label>
                <input
                  type="text"
                  value={programForm.title}
                  onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                  placeholder="프로그램명을 입력하세요"
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.25rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: "700" }}>담당부서</label>
                <select
                  value={programForm.dept}
                  onChange={(e) => setProgramForm({ ...programForm, dept: e.target.value })}
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", borderRadius: "0.25rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                >
                  <option value="사업운영팀">사업운영팀</option>
                  <option value="늘봄누리센터">늘봄누리센터</option>
                  <option value="신산업특화센터">신산업특화센터</option>
                  <option value="ECC">ECC</option>
                  <option value="ICC">ICC</option>
                  <option value="RCC">RCC</option>
                  <option value="AID-X">AID-X</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                className="btn-green-outline"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                onClick={() => setShowProgramEditor(false)}
              >
                취소
              </button>
              <button
                className="btn-green"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                onClick={handleSaveProgram}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form
            onSubmit={handlePasswordChange}
            className="glass-card"
            style={{ width: "400px", padding: "2rem", border: "1px solid var(--border-color)", background: "var(--bg-dark)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LockIcon size={20} style={{ color: "var(--accent-color)" }} />
              <span>개인정보 관리 (비밀번호 변경)</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700", color: "var(--text-secondary)" }}>아이디 (이메일)</label>
                <input
                  type="text"
                  disabled
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "rgba(255,255,255,0.85)", background: "var(--input-bg)", cursor: "not-allowed" }}
                  value={currentUser.id}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700", color: "var(--text-secondary)" }}>성명</label>
                <input
                  type="text"
                  disabled
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "rgba(255,255,255,0.85)", background: "var(--input-bg)", cursor: "not-allowed" }}
                  value={currentUser.name}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>현재 비밀번호 *</label>
                <input
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.45rem 0.6rem", color: "#f3f4f6", background: "#1f2937", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  placeholder="현재 비밀번호를 입력해 주세요"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>새 비밀번호 *</label>
                <input
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.45rem 0.6rem", color: "#f3f4f6", background: "#1f2937", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  placeholder="새 비밀번호를 입력해 주세요"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>새 비밀번호 확인 *</label>
                <input
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.45rem 0.6rem", color: "#f3f4f6", background: "#1f2937", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                  value={confirmNewPw}
                  onChange={(e) => setConfirmNewPw(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmNewPw("");
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
              >
                변경하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
