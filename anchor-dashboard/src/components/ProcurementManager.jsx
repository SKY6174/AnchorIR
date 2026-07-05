import React, { useState } from "react";
import { Plus, Trash2, Info, ListFilter, ArrowUpDown, Edit } from "lucide-react";

// 1. 10대 기자재 초기 모의 데이터 정의 (4번 요건 및 삭제용 패스워드 "1234" 추가)
const defaultEquipments = [
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

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현 및 천단위 쉼표 추가)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 천원 단위 포맷팅 헬퍼 함수 (정수 표현 및 천단위 쉼표 추가)
const formatToThousandWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return (value / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
};

// 날짜 데이터를 기반으로 3월~2월 캘린더 구매단계(P, A, B, Pr, I) 매핑 헬퍼 함수 (4번 요건 대응)
const getMilestonesFromDates = (item, activeYear) => {
  const milestones = { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] };
  const baseYear = 2024 + Number(activeYear || 1); // 1차년도: 2025, 2차년도: 2026
  
  const checkAndAdd = (dateStr, phaseCode) => {
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const isCurrentYearPart = (month >= 3 && month <= 12 && year === baseYear);
    const isNextYearPart = ((month === 1 || month === 2) && year === baseYear + 1);
    
    if (isCurrentYearPart || isNextYearPart) {
      const monthKey = String(month);
      if (milestones[monthKey] && !milestones[monthKey].includes(phaseCode)) {
        milestones[monthKey].push(phaseCode);
      }
    }
  };
  
  checkAndAdd(item.dateP, "P");
  checkAndAdd(item.dateA, "A");
  checkAndAdd(item.dateB, "B");
  checkAndAdd(item.datePr, "Pr");
  checkAndAdd(item.dateI, "I");
  
  return milestones;
};

// 단계별 입력 일정 순차 및 사업연차 적합성 검증 헬퍼 함수 (연차-단계별 일자 연계)
const validateDatesChronological = (yearVal, dateP, dateA, dateB, datePr, dateI) => {
  const targetYear = Number(yearVal) || 1; // 1차년도 또는 2차년도
  
  // 1) 사업연차별 유효기간 논리 범위 정의
  // 1차년도: '25.3월 ~ '26.2월 -> 2025-03-01 ~ 2026-02-29
  // 2차년도: '26.3월 ~ '27.2월 -> 2026-03-01 ~ 2027-02-28
  const baseStart = targetYear === 1 ? new Date("2025-03-01") : new Date("2026-03-01");
  const baseEnd = targetYear === 1 ? new Date("2026-02-29") : new Date("2027-02-28");
  const periodStr = targetYear === 1 ? "'25.3월 ~ '26.2월" : "'26.3월 ~ '27.2월";

  const dates = [
    { name: "기획(P)", val: dateP },
    { name: "승인(A)", val: dateA },
    { name: "입찰(B)", val: dateB },
    { name: "구매(Pr)", val: datePr },
    { name: "검수(I)", val: dateI }
  ].filter(d => d.val); // 값이 채워진 것만 필터링

  // 2) 선택한 사업 연차 범위 내에 일자가 속하는지 검증
  for (let i = 0; i < dates.length; i++) {
    const dVal = new Date(dates[i].val);
    if (dVal < baseStart || dVal > baseEnd) {
      return {
        isValid: false,
        msg: `⚠️ 연차 일치 위배: ${targetYear}차년도 기자재의 ${dates[i].name} 단계 일자(${dates[i].val})는 ${targetYear}차년도 사업 기간(${periodStr}) 범위를 벗어납니다. 날짜를 확인해 주세요.`
      };
    }
  }

  // 3) 각 단계가 시간 순서상 순차적인지 검증
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i].val);
    const next = new Date(dates[i + 1].val);
    if (current > next) {
      return {
        isValid: false,
        msg: `⚠️ 일정 순서 위배: ${dates[i].name} 단계 일자(${dates[i].val})가 ${dates[i+1].name} 단계 일자(${dates[i+1].val})보다 늦을 수 없습니다. 일정을 순차적으로 기입해 주세요.`
      };
    }
  }
  return { isValid: true };
};



// 단위과제별 2차년도 사업계획서 요약 모의 데이터 (기획문서용)
const PROPOSAL_SUMMARIES = {
  "A1": {
    title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성",
    dept: "ECC센터 (교육혁신센터)",
    goals: ["조선 정밀 가공 실무 교육과정 수립", "하이퍼팩토리 리모델링 구축", "미래 핵심 신산업 주문식 교육 운영"],
    budget: "2,540백만원"
  },
  "A1가": {
    title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성",
    dept: "ECC센터 (교육혁신센터)",
    goals: ["교수학습 모델 전면 개편", "미래 모빌리티/보건 융합 주문식 교육과정 운영", "하이퍼 캠퍼스 온라인 실습 시스템 구축"],
    budget: "2,540백만원"
  },
  "A1나": {
    title: "신산업특화 전문기술인재 양성",
    dept: "신산업특화센터",
    goals: ["정밀 화학, 이차전지, 친환경 선박 가공 인재 육성", "신산업 이관 전담 실무 교육장비 가동", "선도 조선소 연계 맞춤형 글로벌 인턴십"],
    budget: "310백만원"
  },
  "A2": {
    title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성",
    dept: "창업창직교육센터 / SCOUT사업단 협력",
    goals: ["창업캠프 및 창업 아이디어 설명회 개최", "창업동아리 엑셀러레이팅 패키지 지원", "FAB Lab 구축 및 메이커스페이스 활성화"],
    budget: "512백만원"
  },
  "A3": {
    title: "지역산업 연계 글로벌 협력 거점 대학 육성",
    dept: "ECC센터 (교육혁신센터)",
    goals: ["해외 대학 및 글로벌 산업체 협력 네트워크 강화", "다국어 스마트 유학생 케어 앱 론칭 및 상담소 운영", "외국인 전용 특화 직무 단기 아카데미 개편"],
    budget: "1,115백만원"
  },
  "B1": {
    title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화",
    dept: "ICC (기업협업센터)",
    goals: ["공용 고가 정밀 분석 장비 실무 교육 및 지원", "주력 신산업 분야 지산학 융합 컨퍼런스 세미나", "전문기술석사 연계 연구실(Lab) 활성화 지원"],
    budget: "1,320백만원"
  },
  "B2": {
    title: "AID 역량강화 기반 지역산업 전환 지원",
    dept: "AID-X지원센터",
    goals: ["AID-X 지원실 구축 및 정밀 서버 장비 도입", "전 학부(과) 참여형 AI·DX 교육과정 개편", "중소기업 현장 실증형 AI 알고리즘 적용 프로젝트"],
    budget: "710백만원"
  },
  "B3": {
    title: "지･산･학 협력 탄소중립 실천 플랫폼 구축",
    dept: "ICC (기업협업센터)",
    goals: ["AI 기반 탄소중립 및 ESG 교육과정 개발 운영", "중소기업 탄소배출 진단 및 저탄소 플랫폼 지원", "캠퍼스 에코-리빙랩 탄소감축 실증"],
    budget: "915백만원"
  },
  "B4": {
    title: "복합재난 대응 산업안전·보건 통합 운영체계 구축",
    dept: "ICC (기업협업센터)",
    goals: ["VR 활용 복합 가상 대피/화재 재난 안전훈련", "산업군별 맞춤형 재난 기술지원 및 매뉴얼 안전 진단", "간호시뮬레이션 연계 재난 교육장 운영"],
    budget: "540백만원"
  },
  "C1": {
    title: "U-LIFE 평생직업교육 기반 취∙창업 연계모델 구축",
    dept: "RCC (지역협업센터)",
    goals: ["성인학습자 친화형 유연 학사 제도 설계 연구", "취약계층 취·창업 연계 직무교육 및 자격 과정", "평생학습 교육과정 및 평생교육 추진단 운영"],
    budget: "985백만원"
  },
  "C2": {
    title: "동남권과 함께 성장하는 돌봄생태계, 울산愛 구현",
    dept: "울산늘봄누리센터",
    goals: ["방과후/방학 늘봄 프로그램 표준모델 개발 및 시범운영", "동남권 유관기관 돌봄 거버넌스 및 파트너십 구축", "늘봄학교 모니터링 품질관리 체계 및 브랜딩"],
    budget: "760백만원"
  },
  "D1": {
    title: "지역문제해결을 위한 울산형 혁신 솔루션 구축",
    dept: "RCC (지역협업센터)",
    goals: ["대학 교수 및 연구원 참여 리빙랩 과제 설계", "주민 참여형 생활밀착 에코-리빙랩 운영", "지자체 요구 RISE 정책 연구 포럼 개최"],
    budget: "1,180백만원"
  },
  "D2": {
    title: "지속가능한 보건복지 특성화 및 인재양성 체계 구축",
    dept: "RCC (지역협업센터)",
    goals: ["지역사회 기반 보건복지 거버넌스 구축", "맞춤형 보건복지 인재 양성 및 복지케어 모니터링", "실버산업 맞춤형 요양 보호 기술 교육 강좌"],
    budget: "690백만원"
  },
  "D3": {
    title: "에코 컬처로 만드는 꿀잼도시 울산",
    dept: "RCC (지역협업센터)",
    goals: ["캠퍼스-로컬 연계 에코컬처 프로젝트 및 브랜드 디자인", "청년 중심 상업공간 재활성화 및 도시재생", "시민체험형 문화예술 프로그램 및 축제 연계"],
    budget: "865백만원"
  }
};

// 단일 문자열로 저장되어 있을 유스케이스 방어용 헬퍼 함수
const getMilestoneArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};

export default function ProcurementManager({
  currentRole,
  currentUser,
  selectedYear,
  setSelectedYear,
  subTab,
  onChangeSubTab,
  envData = [],
  setEnvData,
  equipData = [],
  setEquipData,
  serviceData = [],
  setServiceData
}) {
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("env"); // "env", "equip", "service"
  
  // 수정 모드 상태 추가 (2번 요건 대응)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // 기획문서 및 입찰문서 팝업용 상태 추가 (사용자 요건 3 대응)
  const [proposalModalData, setProposalModalData] = useState(null);
  const [bidModalData, setBidModalData] = useState(null);

  // 학과 및 부서 필터 이원화 및 정렬 상태 (3번 요건 대응)
  const [deptFilter, setDeptFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [sortField, setSortField] = useState("seq"); // 기본값 순번
  const [sortDirection, setSortDirection] = useState("asc"); // 기본값 오름차순

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // 환경개선 상세 팝업 상태
  const [selectedEnvItem, setSelectedEnvItem] = useState(null);

  // 기자재 탭 단위과제 필터 상태
  const [selectedEquipUnit, setSelectedEquipUnit] = useState("ALL");

  // 월별 마일스톤 멀티 체크 팝오버 상태
  const [activePopover, setActivePopover] = useState(null); // { equipId, month, x, y }

  // 4. 입력 폼 임시 State
  const [formData, setFormData] = useState({
    title: "",
    unit: "A1",
    plan: "",
    meetingResult: "",
    progress: "",
    budgetPlan: "",
    budgetSpent: "",
    location: "",
    purpose: "",
    birdseyeView: "",
    blueprints: "",
    utilization: "",
    // 기자재용 10대 필드 맵
    name: "",
    deptName: "",      // 학과 선택
    divisionName: "",  // 부서 선택
    unitPrice: "",
    quantity: "",
    description: "",
    step: "기획",
    operation: "교과목(정규)",
    mgrDept: "ECC",
    // 신규 추가 폼에서 월별 구매단계 다중 입력을 위한 milestones 상태
    milestones: { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] },
    // 용역용
    providerQual: "",
    opResult: ""
  });

  // 팝오버를 열기 위한 트리거 함수
  const handleMilestoneClick = (e, equipId, month) => {
    e.stopPropagation();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopover({
      equipId,
      month,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  // 다중 체크 시 해당 단계 배열 토글 함수
  const handleMilestoneMultiToggle = (equipId, month, stepName) => {
    // 신규 추가 폼 내 마일스톤 조작 대응
    if (equipId === "NEW_FORM") {
      setFormData(prev => {
        const currentMilestones = prev.milestones || {};
        const currentList = getMilestoneArray(currentMilestones[month]);
        let nextList;
        if (currentList.includes(stepName)) {
          nextList = currentList.filter(s => s !== stepName);
        } else {
          nextList = [...currentList, stepName];
        }
        return {
          ...prev,
          milestones: {
            ...currentMilestones,
            [month]: nextList
          }
        };
      });
      return;
    }

    const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
    const updated = activeEquipList.map(e => {
      if (e.id === equipId) {
        const currentMilestones = e.milestones || {};
        const currentList = getMilestoneArray(currentMilestones[month]);
        
        let nextList;
        if (currentList.includes(stepName)) {
          nextList = currentList.filter(s => s !== stepName);
        } else {
          nextList = [...currentList, stepName];
        }
        
        return {
          ...e,
          milestones: {
            ...currentMilestones,
            [month]: nextList
          }
        };
      }
      return e;
    });
    setEquipData(updated);
  };

  // 월별 PDCA 1줄 Gantt의 색상 및 텍스트를 다중 선택 상태에 맞춰 반환해 주는 헬퍼 스타일 함수
  const getMilestoneStyle = (stepList, monthNum) => {
    const list = getMilestoneArray(stepList);
    
    // 0개 선택
    if (list.length === 0) {
      return {
        bg: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        color: "rgba(255, 255, 255, 0.2)",
        text: monthNum,
        shadow: "none"
      };
    }
    
    // 각 단계별 텍스트 및 색상 매핑 (기획 P, 승인 A, 입찰 B, 구매 Pr, 검수 I 및 영문 약어 호환)
    const stepMeta = {
      "기획": { text: "P", color: "#f59e0b" },
      "승인": { text: "A", color: "#3b82f6" },
      "입찰": { text: "B", color: "#06b6d4" },
      "구매": { text: "Pr", color: "#a78bfa" },
      "검수": { text: "I", color: "#10b981" },
      "P": { text: "P", color: "#f59e0b" },
      "A": { text: "A", color: "#3b82f6" },
      "B": { text: "B", color: "#06b6d4" },
      "Pr": { text: "Pr", color: "#a78bfa" },
      "I": { text: "I", color: "#10b981" }
    };
    
    // 1개 선택 시
    if (list.length === 1) {
      const meta = stepMeta[list[0]] || { text: "?", color: "#6b7280" };
      return {
        bg: meta.color,
        border: `1px solid ${meta.color}`,
        color: "white",
        text: meta.text,
        shadow: `0 0 5px ${meta.color}80`
      };
    }
    
    // 2개 선택 시 (대각선 분할 그라데이션 적용)
    if (list.length === 2) {
      const meta1 = stepMeta[list[0]] || { text: "?", color: "#6b7280" };
      const meta2 = stepMeta[list[1]] || { text: "?", color: "#6b7280" };
      return {
        bg: `linear-gradient(135deg, ${meta1.color} 50%, ${meta2.color} 50%)`,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        text: `${meta1.text}/${meta2.text}`,
        shadow: `0 0 6px rgba(255, 255, 255, 0.3)`
      };
    }
    
    // 3개 이상 선택 시
    const firstMeta = stepMeta[list[0]] || { text: "?", color: "#6b7280" };
    return {
      bg: `linear-gradient(135deg, ${firstMeta.color} 30%, #374151 70%)`,
      border: "1px solid rgba(255, 255, 255, 0.4)",
      color: "white",
      text: `${firstMeta.text}+`,
      shadow: "0 0 6px rgba(255, 255, 255, 0.4)"
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") {
      const nextYear = Number(value);
      // 연차 변경 시 유효한 단위과제 기본값 매핑
      const nextUnit = nextYear === 1 ? "A1" : "A1가";
      setFormData(prev => ({
        ...prev,
        year: nextYear,
        unit: nextUnit
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    if (modalType === "env") {
      const newItem = {
        id: Date.now(),
        year: selectedYear,
        title: formData.title || "새 환경개선 항목",
        unit: formData.unit,
        plan: formData.plan || "-",
        meetingResult: formData.meetingResult || "-",
        progress: formData.progress || "-",
        budgetPlan: Number(formData.budgetPlan) || 0,
        budgetSpent: Number(formData.budgetSpent) || 0,
        location: formData.location || "-",
        purpose: formData.purpose || "-",
        birdseyeView: formData.birdseyeView || "공간 조감도 예시 프레임 적용",
        blueprints: formData.blueprints || "도면 정보 예시 프레임 적용",
        utilization: formData.utilization || "-"
      };
      setEnvData([newItem, ...envData]);
    } else if (modalType === "equip") {
      // 1) 단장님 조건: 학과 또는 부서 중 최소 하나는 반드시 선택되어야 함
      if (!formData.deptName && !formData.divisionName) {
        alert("⚠️ 학과 또는 부서 중 최소 한 곳은 반드시 지정하셔야 합니다.");
        return;
      }

      const targetYear = Number(formData.year) || Number(selectedYear);

      // 2) 요건 4: 단계별 입력 일정 순차 및 연차 범위 정합성 검증
      const dateCheck = validateDatesChronological(targetYear, formData.dateP, formData.dateA, formData.dateB, formData.datePr, formData.dateI);
      if (!dateCheck.isValid) {
        alert(dateCheck.msg);
        return;
      }

      const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;

      if (isEditMode && editingItemId) {
        // 수정 모드 분기 (요건 2 대응)
        const updated = activeEquipList.map(item => {
          if (item.id === editingItemId) {
            return {
              ...item,
              year: targetYear,
              unit: formData.unit,
              deptName: formData.deptName || "",
              divisionName: formData.divisionName || "",
              itemName: formData.name || "수정 기자재 항목",
              unitPrice: (Number(formData.unitPrice) * 1000) || 0,
              quantity: Number(formData.quantity) || 1,
              description: formData.description || "-",
              operation: formData.operation || "교과목(정규)",
              password: currentUser?.password || formData.password || item.password || "1234", // 현재 로그인 유저 비밀번호 연동
              relatedDocs: formData.relatedDocs || "", // 관련문서 기입 연동
              dateP: formData.dateP || "",
              dateA: formData.dateA || "",
              dateB: formData.dateB || "",
              datePr: formData.datePr || "",
              dateI: formData.dateI || ""
            };
          }
          return item;
        });
        setEquipData(updated);
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setEditingItemId(null);
        
        // 요건 6: 화면 연차 자동 전환
        if (setSelectedYear) {
          setSelectedYear(targetYear);
        }
        alert("🔬 기자재 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 등록 모드
        const nextSeq = activeEquipList.length + 1;
        const newItem = {
          id: Date.now(),
          year: targetYear,
          unit: formData.unit,
          seq: nextSeq,
          deptName: formData.deptName || "",
          divisionName: formData.divisionName || "",
          itemName: formData.name || "새 기자재 항목",
          unitPrice: (Number(formData.unitPrice) * 1000) || 0,
          quantity: Number(formData.quantity) || 1,
          description: formData.description || "-",
          operation: formData.operation || "교과목(정규)",
          mgrDept: formData.mgrDept || "ECC",
          password: currentUser?.password || formData.password || "1234", // 현재 로그인 유저 비밀번호 연동
          relatedDocs: formData.relatedDocs || "", // 관련문서 기입 연동
          dateP: formData.dateP || "",
          dateA: formData.dateA || "",
          dateB: formData.dateB || "",
          datePr: formData.datePr || "",
          dateI: formData.dateI || ""
        };
        setEquipData([...activeEquipList, newItem]);
        setIsAddModalOpen(false);
        
        // 요건 6: 화면 연차 자동 전환
        if (setSelectedYear) {
          setSelectedYear(targetYear);
        }
        alert(`🔬 새 기자재 항목이 ${targetYear}차년도 사업계획서에 성공적으로 등록되었습니다.`);
      }
    } else if (modalType === "service") {
      const newItem = {
        id: Date.now(),
        title: formData.title || "새 주요 용역 항목",
        purpose: formData.purpose || "-",
        providerQual: formData.providerQual || "-",
        step: Number(formData.step) || 1,
        budgetPlan: Number(formData.budgetPlan) || 0,
        budgetSpent: Number(formData.budgetSpent) || 0,
        opResult: formData.opResult || "-"
      };
      setServiceData([newItem, ...serviceData]);
    }

    // 모달 리셋
    setIsAddModalOpen(false);
    setFormData({
      title: "",
      unit: "A1",
      plan: "",
      meetingResult: "",
      progress: "",
      budgetPlan: "",
      budgetSpent: "",
      location: "",
      purpose: "",
      birdseyeView: "",
      blueprints: "",
      utilization: "",
      name: "",
      deptName: "",
      divisionName: "",
      unitPrice: "",
      quantity: "",
      description: "",
      step: "기획",
      operation: "교과목(정규)",
      mgrDept: "ECC",
      milestones: { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] },
      providerQual: "",
      opResult: ""
    });
  };

  const openAddModal = (type) => {
    setModalType(type);
    setIsEditMode(false);
    setEditingItemId(null);
    setFormData({
      year: selectedYear,
      unit: selectedYear === 1 ? "A1" : "A1가",
      title: "",
      plan: "",
      meetingResult: "",
      progress: "",
      budgetPlan: "",
      budgetSpent: "",
      location: "",
      purpose: "",
      birdseyeView: "",
      blueprints: "",
      utilization: "",
      name: "",
      deptName: "",
      divisionName: "",
      unitPrice: "",
      quantity: "",
      description: "",
      step: "기획",
      operation: "교과목(정규)",
      mgrDept: "ECC",
      dateP: "",
      dateA: "",
      dateB: "",
      datePr: "",
      dateI: "",
      password: "",
      relatedDocs: "", // 관련문서 초기화
      providerQual: "",
      opResult: ""
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (equip) => {
    setModalType("equip");
    setIsEditMode(true);
    setEditingItemId(equip.id);
    setFormData({
      year: equip.year,
      unit: equip.unit,
      name: equip.itemName || equip.name || "",
      deptName: equip.deptName || "",
      divisionName: equip.divisionName || "",
      unitPrice: equip.unitPrice ? (equip.unitPrice / 1000) : "", // 요건 2: 단가 단위 천원으로 모달에 바인딩
      quantity: equip.quantity || "",
      description: equip.description || "",
      operation: equip.operation || "교과목(정규)",
      password: equip.password || "1234",
      relatedDocs: equip.relatedDocs || "", // 관련문서 로드
      dateP: equip.dateP || "",
      dateA: equip.dateA || "",
      dateB: equip.dateB || "",
      datePr: equip.datePr || "",
      dateI: equip.dateI || ""
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="procurement-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. 환경개선 탭 본문 */}
      {subTab === "env_improvement" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 환경개선 헤더 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🛠️ 교육환경 개선 사업 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                지자체 라이즈 대학 특화 공간 및 스마트 첨단 강의실 구축 진행 현황
              </p>
            </div>
            {currentRole.id !== "GUEST" && (
              <button 
                className="btn btn-primary"
                onClick={() => openAddModal("env")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.4rem 1rem",
                  borderRadius: "6px",
                  background: "var(--accent-color)",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                <Plus size={16} />
                환경개선 항목 추가
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* 좌측 리스트 카드 */}
            <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                공간 구축 실적 및 현황 목록
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
                {envData.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedEnvItem(item)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "6px",
                      background: selectedEnvItem?.id === item.id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                      border: selectedEnvItem?.id === item.id ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "750", color: "white", fontSize: "0.85rem" }}>{item.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        단위과제: <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>{item.unit}</span> | 예산계획: {item.budgetPlan.toLocaleString()}원
                      </div>
                    </div>
                    {currentRole.id !== "GUEST" && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("해당 환경개선 건을 삭제하시겠습니까?")) {
                            setEnvData(envData.filter(x => x.id !== item.id));
                            if (selectedEnvItem?.id === item.id) setSelectedEnvItem(null);
                          }
                        }}
                        style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "0.25rem" }}
                        onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
                        onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 우측 상세 정보 조회 카드 */}
            <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", background: "rgba(255,255,255,0.01)" }}>
              {selectedEnvItem ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "white" }}>🔍 {selectedEnvItem.title} 상세 조회</span>
                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "var(--accent-color)", color: "white", fontWeight: "800", fontSize: "0.72rem" }}>{selectedEnvItem.unit} 과제</span>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>구축 위치</span>
                      <p style={{ margin: "0.2rem 0", fontWeight: "600" }}>{selectedEnvItem.location || "-"}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>주요 용도</span>
                      <p style={{ margin: "0.2rem 0", fontWeight: "600" }}>{selectedEnvItem.purpose || "-"}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>사업비 계획액</span>
                      <p style={{ margin: "0.2rem 0", fontWeight: "700", color: "white" }}>{selectedEnvItem.budgetPlan.toLocaleString()}원</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>실제 집행액</span>
                      <p style={{ margin: "0.2rem 0", fontWeight: "700", color: "#10B981" }}>{selectedEnvItem.budgetSpent.toLocaleString()}원</p>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>도면 정보 & 설계 내역</span>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
                      <span style={{ padding: "0.2rem 0.4rem", background: "rgba(255,255,255,0.05)", borderRadius: "4px", fontSize: "0.7rem", color: "var(--text-primary)" }}>🖼️ 조감도: {selectedEnvItem.birdseyeView}</span>
                      <span style={{ padding: "0.2rem 0.4rem", background: "rgba(255,255,255,0.05)", borderRadius: "4px", fontSize: "0.7rem", color: "var(--text-primary)" }}>📐 도면: {selectedEnvItem.blueprints}</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>구축 계획</span>
                      <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.plan || "-"}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>진행 상태</span>
                      <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.progress || "-"}</p>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>향후 활용 계획</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.utilization}</p>
                  </div>

                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary)", fontSize: "0.75rem", textAlign: "center" }}>
                  <Info size={32} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                  <span>왼쪽 목록에서 환경개선 건을 선택하시면<br />세부 구축 계획 및 설계 도면 명세서가 조회됩니다.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. 기자재 구입·운영 탭 본문 */}
      {subTab === "equipment_purchase" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 기자재 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🔬 기자재 구입 및 운영 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                단위과제별 교육/연구용 핵심 기자재의 계획·집행 및 실적 관리
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 (요건 1: 모달창과 동일한 고정 전체 학과 목록 맵핑) */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">학과 전체</option>
                  <option value="기계공학부">기계공학부</option>
                  <option value="전기전자공학부">전기전자공학부</option>
                  <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                  <option value="컴퓨터공학과">컴퓨터공학과</option>
                  <option value="화학공학과">화학공학과</option>
                  <option value="게임영상학과">게임영상학과</option>
                  <option value="실내건축디자인과">실내건축디자인과</option>
                  <option value="융합안전공학과">융합안전공학과</option>
                  <option value="인테리어시공학과">인테리어시공학과</option>
                  <option value="간호학부">간호학부</option>
                  <option value="물리치료학과">물리치료학과</option>
                  <option value="치위생학과">치위생학과</option>
                  <option value="식품영양학과">식품영양학과</option>
                  <option value="호텔조리제빵과">호텔조리제빵과</option>
                  <option value="스포츠재활학부">스포츠재활학부</option>
                  <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                  <option value="푸드케어학과">푸드케어학과</option>
                  <option value="골프산업과">골프산업과</option>
                  <option value="반려동물보건과">반려동물보건과</option>
                  <option value="사회복지학과">사회복지학과</option>
                  <option value="유아교육과">유아교육과</option>
                  <option value="세무회계학과">세무회계학과</option>
                  <option value="사회복지상담학과">사회복지상담학과</option>
                  <option value="국제학부">국제학부</option>
                  <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                  <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                  <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                </select>
              </div>

              {/* 부서 필터 (요건 1: 모달창과 동일한 고정 전체 본부/산단 하위 부서 목록 맵핑 및 사업단 최상단 배치) */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">부서 전체</option>
                  <optgroup label="앵커사업단 및 센터">
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="RCC센터">RCC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                  </optgroup>
                  <optgroup label="대학본부">
                    <option value="교무팀">교무팀</option>
                    <option value="교수학습지원센터">교수학습지원센터</option>
                    <option value="직업교육혁신센터">직업교육혁신센터</option>
                    <option value="교양교육혁신센터">교양교육혁신센터</option>
                    <option value="기획팀">기획팀</option>
                    <option value="대외협력실">대외협력실</option>
                    <option value="입학팀">입학팀</option>
                    <option value="진로진학지원센터">진로진학지원센터</option>
                    <option value="총무팀">총무팀</option>
                    <option value="재무회계팀">재무회계팀</option>
                    <option value="국제교류원운영팀">국제교류원운영팀</option>
                    <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                    <option value="IR센터">IR센터</option>
                  </optgroup>
                  <optgroup label="산학협력단">
                    <option value="산학기획팀">산학기획팀</option>
                    <option value="산학지원팀">산학지원팀</option>
                    <option value="창업창직교육센터">창업창직교육센터</option>
                    <option value="현장실습지원센터">현장실습지원센터</option>
                    <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="종합환경분석센터">종합환경분석센터</option>
                    <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                    <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                    <option value="이차전지연구소">이차전지연구소</option>
                    <option value="지산학혁신연구소">지산학혁신연구소</option>
                    <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                  </optgroup>
                </select>
              </div>

              {/* 단위과제 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={selectedEquipUnit}
                  onChange={(e) => setSelectedEquipUnit(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="ALL">전체 과제</option>
                  {Number(selectedYear) === 1 
                    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                  }
                </select>
              </div>

              {currentRole.id !== "GUEST" && (
                <button 
                  className="btn btn-primary"
                  onClick={() => openAddModal("equip")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "6px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  기자재 추가
                </button>
              )}
            </div>
          </div>

          {/* 기자재 리스트 (스프레드시트 스타일 표 뷰) */}
          <div className="glass-card" style={{ padding: "0.5rem", borderRadius: "10px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)", minWidth: "1200px" }}>
              <thead>
                {/* 1행: 대분류 헤더 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("seq")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "55px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="순번 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      순번
                      <ArrowUpDown size={12} style={{ opacity: sortField === "seq" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("unit")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="과제 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      과제
                      <ArrowUpDown size={12} style={{ opacity: sortField === "unit" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "130px", verticalAlign: "middle" }}>학과 / 부서</th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "180px", verticalAlign: "middle" }}>품명</th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("unitPrice")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "right", fontWeight: "800", width: "95px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="단가 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        단가
                        <ArrowUpDown size={12} style={{ opacity: sortField === "unitPrice" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary-dark)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px", verticalAlign: "middle" }}>수량</th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("total")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "right", fontWeight: "800", width: "105px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="금액 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        금액
                        <ArrowUpDown size={12} style={{ opacity: sortField === "total" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary-dark)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", verticalAlign: "middle" }}>구입목적 및 활용계획</th>
                  <th colSpan={12} style={{ padding: "0.5rem", textAlign: "center", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255, 255, 255, 0.01)", lineHeight: "1.3" }}>
                    구매단계<br />
                    <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "var(--text-secondary)" }}>(기획:P ➔ 승인:A ➔ 입찰:B ➔ 구매:Pr ➔ 검수:I)</span>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "145px", verticalAlign: "middle" }}>관련문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "45px", verticalAlign: "middle" }}>작업</th>
                  )}
                </tr>
                {/* 2행: 연도 분할 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th colSpan={10} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    {2024 + (Number(selectedYear) || 1)}년
                  </th>
                  <th colSpan={2} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)" }}>
                    {2024 + (Number(selectedYear) || 1) + 1}년
                  </th>
                </tr>
                {/* 3행: 월 리스트 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.01)", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
                  {["3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", "1월", "2월"].map((m, idx) => (
                    <th 
                      key={m} 
                      style={{ 
                        padding: "0.3rem 0.2rem", 
                        textAlign: "center", 
                        fontWeight: "800", 
                        fontSize: "0.72rem", 
                        color: "var(--text-secondary-dark)",
                        width: "28px",
                        borderRight: idx < 11 ? "1px solid rgba(255,255,255,0.03)" : "none"
                      }}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
                  
                  // 1) 과제 필터링
                  let filteredEquips = selectedEquipUnit === "ALL" 
                    ? activeEquipList 
                    : activeEquipList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터 이원화 적용 (요건 3 AND 연산 연계)
                  if (deptFilter) {
                    filteredEquips = filteredEquips.filter(e => {
                      const dName = e.deptName || "";
                      return dName.includes(deptFilter);
                    });
                  }
                  if (divisionFilter) {
                    filteredEquips = filteredEquips.filter(e => {
                      const divName = e.divisionName || "";
                      return divName.includes(divisionFilter);
                    });
                  }

                  // 3) 순번, 과제, 단가, 금액 정렬 적용 (사용자 요건 3 대응)
                  filteredEquips = [...filteredEquips].sort((a, b) => {
                    let aVal = a[sortField];
                    let bVal = b[sortField];
                    
                    if (sortField === "total") {
                      aVal = (Number(a.unitPrice) || 0) * (Number(a.quantity) || 1);
                      bVal = (Number(b.unitPrice) || 0) * (Number(b.quantity) || 1);
                    } else if (sortField === "unitPrice") {
                      aVal = Number(a.unitPrice) || 0;
                      bVal = Number(b.unitPrice) || 0;
                    } else if (sortField === "seq" || sortField === "id") {
                      aVal = Number(a.seq || a.id) || 0;
                      bVal = Number(b.seq || b.id) || 0;
                    } else {
                      aVal = String(aVal || "");
                      bVal = String(bVal || "");
                    }
                    
                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  });

                  if (filteredEquips.length > 0) {
                    return filteredEquips.map((equip, idx) => {
                      const price = Number(equip.unitPrice) || 0;
                      const qty = Number(equip.quantity) || 0;
                      const total = price * qty;

                      // 3월~2월 캘린더 월 인덱스 추출 헬퍼 (구간별 화살표 선 표현용)
                      const monthsOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"];
                      const getMonthIndexLocal = (dateStr) => {
                        if (!dateStr) return null;
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return null;
                        const baseYear = 2024 + Number(selectedYear || 1);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        const isCurrentYearPart = (month >= 3 && month <= 12 && year === baseYear);
                        const isNextYearPart = ((month === 1 || month === 2) && year === baseYear + 1);
                        if (isCurrentYearPart || isNextYearPart) {
                          return monthsOrder.indexOf(String(month));
                        }
                        return null;
                      };

                      const idxP = getMonthIndexLocal(equip.dateP);
                      const idxA = getMonthIndexLocal(equip.dateA);
                      const idxB = getMonthIndexLocal(equip.dateB);
                      const idxPr = getMonthIndexLocal(equip.datePr);
                      const idxI = getMonthIndexLocal(equip.dateI);

                      return (
                        <tr 
                          key={equip.id || idx} 
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s ease" }}
                        >
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "750", color: "var(--accent-color)" }}>
                            {equip.unit}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", fontWeight: "600" }}>
                            {(() => {
                              const dName = equip.deptName || "";
                              const divName = equip.divisionName || "";
                              if (dName && divName) {
                                return `${dName} / ${divName}`;
                              }
                              return dName || divName || "-";
                            })()}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", fontWeight: "700", color: "white" }}>
                            {equip.itemName || equip.name || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", color: "var(--text-secondary)", fontWeight: "600" }}>
                            {formatToMillionWon(price)}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "600" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                            {formatToMillionWon(total)}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={equip.description || equip.opPlan}>
                            {equip.description || equip.opPlan || "-"}
                          </td>
                          
                          {/* 12개월 개별 분리 격자 셀 Gantt 타임라인 (세로 경계선 없이 깨끗하게 칩 나열) */}
                          {monthsOrder.map((m, currIdx) => {
                            // 날짜 데이터를 분석해 해당 월의 마일스톤 단계를 계산합니다.
                            const dynamicMilestones = getMilestonesFromDates(equip, selectedYear);
                            const stepList = dynamicMilestones[m] || [];
                            const style = getMilestoneStyle(stepList, m);

                            // 구간별 반선 색상 추출 헬퍼 함수
                            const getSegmentColor = (isLeft) => {
                              // P -> A (Blue)
                              if (idxP !== null && idxA !== null && idxP < idxA) {
                                const inPA = isLeft 
                                  ? (currIdx > idxP && currIdx <= idxA)
                                  : (currIdx >= idxP && currIdx < idxA);
                                if (inPA) return "#60A5FA";
                              }
                              // A -> B (Purple)
                              if (idxA !== null && idxB !== null && idxA < idxB) {
                                const inAB = isLeft
                                  ? (currIdx > idxA && currIdx <= idxB)
                                  : (currIdx >= idxA && currIdx < idxB);
                                if (inAB) return "#A78BFA";
                              }
                              // B -> Pr (Amber)
                              if (idxB !== null && idxPr !== null && idxB < idxPr) {
                                const inBPr = isLeft
                                  ? (currIdx > idxB && currIdx <= idxPr)
                                  : (currIdx >= idxB && currIdx < idxPr);
                                if (inBPr) return "#FBBF24";
                              }
                              // Pr -> I (Green)
                              if (idxPr !== null && idxI !== null && idxPr < idxI) {
                                const inPrI = isLeft
                                  ? (currIdx > idxPr && currIdx <= idxI)
                                  : (currIdx >= idxPr && currIdx < idxI);
                                if (inPrI) return "#34D399";
                              }
                              return "rgba(255, 255, 255, 0.12)";
                            };

                            const leftColor = getSegmentColor(true);
                            const rightColor = getSegmentColor(false);

                            return (
                              <td 
                                key={m} 
                                style={{ 
                                  padding: "0.8rem 0", 
                                  textAlign: "center", 
                                  width: "28px",
                                  position: "relative",
                                  verticalAlign: "middle"
                                }}
                              >
                                {/* 가로 타임라인 왼쪽 연결 반선 */}
                                <div style={{
                                  position: "absolute",
                                  left: 0,
                                  right: "50%",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  height: "2px",
                                  background: leftColor,
                                  display: m === "3" ? "none" : "block", // 3월은 왼쪽 선 생략
                                  zIndex: 0
                                }} />

                                {/* 가로 타임라인 오른쪽 연결 반선 */}
                                <div style={{
                                  position: "absolute",
                                  left: "50%",
                                  right: 0,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  height: "2px",
                                  background: rightColor,
                                  display: m === "2" ? "none" : "block", // 2월은 오른쪽 선 생략
                                  zIndex: 0
                                }} />
                                
                                {/* 화살표 선 흐름 기호 (마일스톤 노드가 없는 빈 월에만 구간 유색 화살표 표시) */}
                                {stepList.length === 0 && (leftColor !== "rgba(255, 255, 255, 0.12)" || rightColor !== "rgba(255, 255, 255, 0.12)") && (
                                  <span style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    transform: "translate(-50%, -50%)",
                                    fontSize: "0.62rem",
                                    fontWeight: "bold",
                                    color: leftColor !== "rgba(255, 255, 255, 0.12)" ? leftColor : rightColor,
                                    opacity: 0.85,
                                    zIndex: 1,
                                    pointerEvents: "none"
                                  }}>
                                    ➔
                                  </span>
                                )}

                                {/* 캘린더 구매단계 점 (요건에 따라 P, A, B, Pr, I 마일스톤이 있는 달에만 마크 렌더링, 빈 달은 도트 점 제거) */}
                                <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                  {stepList.length > 0 && (
                                    <div 
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        background: style.bg,
                                        color: style.color,
                                        fontSize: "0.53rem", // 구매단계를 나타내는 글씨 font size 2pt 작게 반영
                                        fontWeight: "900",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: `0 0 8px ${style.bg}`,
                                        border: "1px solid rgba(255, 255, 255, 0.2)"
                                      }}
                                      title={`${m}월: ${stepList.join(", ")}`}
                                    >
                                      {style.text}
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
                              {(() => {
                                // 관련문서 번호 다중 파싱 (쉼표 구분)
                                const docList = equip.relatedDocs
                                  ? equip.relatedDocs.split(",").map(d => d.trim()).filter(Boolean)
                                  : [`UC-EQ-${equip.unit}-${String(equip.seq || equip.id).slice(-3).padStart(3, "0")}`];
                                
                                return docList.map((docNum, idx) => (
                                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", borderBottom: idx < docList.length - 1 ? "1px dashed rgba(255,255,255,0.08)" : "none", paddingBottom: idx < docList.length - 1 ? "0.4rem" : "0", width: "100%" }}>
                                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace", fontWeight: "700", color: "#FBBF24" }}>
                                      {docNum}
                                    </span>
                                    <div style={{ display: "flex", gap: "0.25rem" }}>
                                      <button
                                        onClick={() => setProposalModalData({ ...equip, selectedDoc: docNum })}
                                        style={{
                                          padding: "0.15rem 0.35rem",
                                          fontSize: "0.62rem",
                                          borderRadius: "4px",
                                          background: "rgba(59, 130, 246, 0.12)",
                                          color: "#60A5FA",
                                          border: "1px solid rgba(59, 130, 246, 0.25)",
                                          cursor: "pointer",
                                          transition: "background 0.2s"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.22)"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)"}
                                        title="기획 제안서 요약 보기"
                                      >
                                        기획문서
                                      </button>
                                      <button
                                        onClick={() => setBidModalData({ ...equip, selectedDoc: docNum })}
                                        style={{
                                          padding: "0.15rem 0.35rem",
                                          fontSize: "0.62rem",
                                          borderRadius: "4px",
                                          background: "rgba(16, 185, 129, 0.12)",
                                          color: "#34D399",
                                          border: "1px solid rgba(16, 185, 129, 0.25)",
                                          cursor: "pointer",
                                          transition: "background 0.2s"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.22)"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)"}
                                        title="입찰 규격 공고 보기"
                                      >
                                        입찰문서
                                      </button>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </td>
                          {currentRole.id !== "GUEST" && (
                            <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center" }}>
                                <button
                                  onClick={() => openEditModal(equip)}
                                  style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "4px",
                                    color: "rgba(255,255,255,0.8)",
                                    padding: "0.2rem 0.4rem",
                                    fontSize: "0.68rem",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    width: "48px",
                                    textAlign: "center"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                                    e.currentTarget.style.color = "#60A5FA";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                                  }}
                                  title="기자재 수정"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("🚨 이 작업은 되돌릴 수 없습니다. 해당 기자재 항목을 정말로 삭제하시겠습니까?")) {
                                      const inputPw = prompt("🔒 삭제 안전장치: 등록 시 설정한 비밀번호를 입력해 주세요.");
                                      const registeredPw = equip.password || "1234";
                                      
                                      if (inputPw === null) return; // 취소
                                      if (inputPw === registeredPw) {
                                        setEquipData(activeEquipList.filter(e => e.id !== equip.id));
                                        alert("🗑️ 기자재 항목이 안전하게 삭제되었습니다.");
                                      } else {
                                        alert("⚠️ 비밀번호가 일치하지 않습니다. 삭제 권한이 거부되었습니다.");
                                      }
                                    }
                                  }}
                                  style={{
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    borderRadius: "4px",
                                    color: "#FCA5A5",
                                    padding: "0.2rem 0.4rem",
                                    fontSize: "0.68rem",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    width: "48px",
                                    textAlign: "center"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                                    e.currentTarget.style.color = "#F87171";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                                    e.currentTarget.style.color = "#FCA5A5";
                                  }}
                                  title="기자재 삭제"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  } else {
                    return (
                      <tr>
                        <td colSpan={24} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          필터링된 기자재 내역이 존재하지 않습니다.
                        </td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. 주요 용역 탭 본문 */}
      {subTab === "major_services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                💼 주요 사업 운영 및 외주 용역 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                500만원 이상의 대행 및 전산 개발/기획 용역 진행 일정 및 예산 집행률 관리
              </p>
            </div>
            {currentRole.id !== "GUEST" && (
              <button 
                className="btn btn-primary"
                onClick={() => openAddModal("service")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.4rem 1rem",
                  borderRadius: "6px",
                  background: "var(--accent-color)",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                <Plus size={16} />
                용역 추가
              </button>
            )}
          </div>

          <div className="glass-card" style={{ padding: "0.5rem", borderRadius: "10px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)", minWidth: "960px" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px" }}>순번</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "220px" }}>용역 명칭 (500만원 이상)</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800" }}>추진 목적 (용역 요건)</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "180px" }}>수행기관 자격 기준</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "800", width: "100px" }}>계획액</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "800", width: "100px" }}>실집행액</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "160px" }}>현재 행정단계</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "180px" }}>최종 운영 결과</th>
                  {currentRole.id !== "GUEST" && (
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px" }}>작업</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {serviceData.length > 0 ? (
                  serviceData.map((item, index) => (
                    <tr 
                      key={item.id} 
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s ease" }}
                    >
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>{index + 1}</td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", fontWeight: "700", color: "white" }}>{item.title}</td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.purpose}>{item.purpose}</td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.providerQual}>{item.providerQual}</td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "600" }}>{item.budgetPlan.toLocaleString()}원</td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>{item.budgetSpent.toLocaleString()}원</td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "center" }}>
                        {item.step === 1 && <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>1단계: 결재완료</span>}
                        {item.step === 2 && <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59,130,246,0.15)", color: "#3b82f6", fontSize: "0.75rem", fontWeight: "700" }}>2단계: 구매 발주</span>}
                        {item.step === 3 && <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "0.75rem", fontWeight: "700" }}>3단계: 검수 완료</span>}
                      </td>
                      <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.opResult}>{item.opResult || "-"}</td>
                      {currentRole.id !== "GUEST" && (
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => {
                              if (confirm("해당 주요 용역을 삭제하시겠습니까?")) {
                                setServiceData(serviceData.filter(x => x.id !== item.id));
                              }
                            }}
                            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", transition: "color 0.15s" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
                            onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
                            title="삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                      등록된 주요 용역 내역이 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 추가 모달창 팝업 */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="glass-card" style={{ width: "500px", maxHeight: "85vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "white", fontWeight: "800", fontSize: "1.1rem" }}>
                {modalType === "env" && "🛠️ 신규 교육환경 개선 사업 등록"}
                {modalType === "equip" && (isEditMode ? "🔬 핵심 기자재 도입 정보 수정" : "🔬 신규 핵심 기자재 도입 등록")}
                {modalType === "service" && "💼 신규 주요 용역 계약 등록"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem", fontWeight: "bold", padding: "0.2rem" }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 환경개선용 입력 필드들 */}
              {modalType === "env" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업 공간 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 3층 RISE 바이오 메디컬 실습실 구축" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>연계 단위과제</label>
                      <select name="unit" value={formData.unit} onChange={handleInputChange} className="user-selector">
                        {["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                          <option key={u} value={u}>{u} 과제</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축 위치 (지정 호실)</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: 대학 본관 302호" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축 목적 (공간 용도)</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} required placeholder="특화 인력 양성을 위한 핵심 시너지 공간 용도 상세 기술" style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업 예산 계획액 (원)</label>
                      <input type="number" name="budgetPlan" value={formData.budgetPlan} onChange={handleInputChange} required placeholder="예: 50000000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>현재 실제 집행액 (원)</label>
                      <input type="number" name="budgetSpent" value={formData.budgetSpent} onChange={handleInputChange} placeholder="예: 0" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>세부 공간 구축 설계 계획</label>
                    <textarea name="plan" value={formData.plan} onChange={handleInputChange} required placeholder="예: 바닥 전선 몰딩, 방음벽 흡음 패널 시공 및 스마트 미러링 보드 마운팅 작업" style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>공사 진행 실적 현황</label>
                    <textarea name="progress" value={formData.progress} onChange={handleInputChange} required placeholder="현재 진행 실무 정보 기술" style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>조감도 파일 설명</label>
                    <input type="text" name="birdseyeView" value={formData.birdseyeView} onChange={handleInputChange} placeholder="예: 3D 실내 투시 조감도 파일 첨부" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>설계도 정보</label>
                    <input type="text" name="blueprints" value={formData.blueprints} onChange={handleInputChange} placeholder="예: 캐드 소방 배선 기계 덕트 설계 도면" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>향후 활용 계획</label>
                    <input type="text" name="utilization" value={formData.utilization} onChange={handleInputChange} placeholder="공간 연계 교육과정 활용 방식" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                </>
              )}

              {/* 기자재용 입력 필드들 */}
              {modalType === "equip" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>연계 단위과제</label>
                      <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%" }}
                      >
                        {Number(formData.year || selectedYear) === 1 
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업연차 선택</label>
                      <select 
                        name="year" 
                        value={formData.year || selectedYear} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%" }}
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange}
                        className="user-selector"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        {/* 1) 학과는 사업단관리 탭의 대학조직도에 나온 학부(과)를 기준으로 렌더링 */}
                        <option value="기계공학부">기계공학부</option>
                        <option value="전기전자공학부">전기전자공학부</option>
                        <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                        <option value="컴퓨터공학과">컴퓨터공학과</option>
                        <option value="화학공학과">화학공학과</option>
                        <option value="게임영상학과">게임영상학과</option>
                        <option value="실내건축디자인과">실내건축디자인과</option>
                        <option value="융합안전공학과">융합안전공학과</option>
                        <option value="인테리어시공학과">인테리어시공학과</option>
                        <option value="간호학부">간호학부</option>
                        <option value="물리치료학과">물리치료학과</option>
                        <option value="치위생학과">치위생학과</option>
                        <option value="식품영양학과">식품영양학과</option>
                        <option value="호텔조리제빵과">호텔조리제빵과</option>
                        <option value="스포츠재활학부">스포츠재활학부</option>
                        <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                        <option value="푸드케어학과">푸드케어학과</option>
                        <option value="골프산업과">골프산업과</option>
                        <option value="반려동물보건과">반려동물보건과</option>
                        <option value="사회복지학과">사회복지학과</option>
                        <option value="유아교육과">유아교육과</option>
                        <option value="세무회계학과">세무회계학과</option>
                        <option value="사회복지상담학과">사회복지상담학과</option>
                        <option value="국제학부">국제학부</option>
                        <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                        <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                        <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange}
                        className="user-selector"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        {/* 앵커사업단 및 센터 */}
                        <optgroup label="앵커사업단 및 센터">
                          <option value="사업운영팀">사업운영팀</option>
                          <option value="ECC센터">ECC센터</option>
                          <option value="ICC센터">ICC센터</option>
                          <option value="RCC센터">RCC센터</option>
                          <option value="AID-X지원센터">AID-X지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="신산업특화센터">신산업특화센터</option>
                        </optgroup>
                        {/* 대학본부 하위 조직 */}
                        <optgroup label="대학본부">
                          <option value="교무팀">교무팀</option>
                          <option value="교수학습지원센터">교수학습지원센터</option>
                          <option value="직업교육혁신센터">직업교육혁신센터</option>
                          <option value="교양교육혁신센터">교양교육혁신센터</option>
                          <option value="기획팀">기획팀</option>
                          <option value="대외협력실">대외협력실</option>
                          <option value="입학팀">입학팀</option>
                          <option value="진로진학지원센터">진로진학지원센터</option>
                          <option value="총무팀">총무팀</option>
                          <option value="재무회계팀">재무회계팀</option>
                          <option value="국제교류원운영팀">국제교류원운영팀</option>
                          <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                          <option value="IR센터">IR센터</option>
                        </optgroup>
                        {/* 산학협력단 하위 조직 */}
                        <optgroup label="산학협력단">
                          <option value="산학기획팀">산학기획팀</option>
                          <option value="산학지원팀">산학지원팀</option>
                          <option value="창업창직교육센터">창업창직교육센터</option>
                          <option value="현장실습지원센터">현장실습지원센터</option>
                          <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="종합환경분석센터">종합환경분석센터</option>
                          <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                          <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                          <option value="이차전지연구소">이차전지연구소</option>
                          <option value="지산학혁신연구소">지산학혁신연구소</option>
                          <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#fbbf24", display: "block", marginTop: "-0.5rem" }}>
                    * 학과 또는 부서 중 최소 한 곳은 필수로 지정되어야 합니다.
                  </span>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>품명</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="예: 임상 실습용 스마트 베드" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>단가 (천원)</label>
                      <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} required placeholder="예: 12000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>수량</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required placeholder="예: 2" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구입목적 및 활용계획</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required placeholder="기자재의 구입 목적, 핵심 활용 계획 및 예상 시너지 상세 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color-dark)" }}>
                    <span style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "white", marginBottom: "0.75rem" }}>
                      📅 단계별 이벤트 일자 입력 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>기획(P) 단계 일자</label>
                        <input type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.8rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>승인(A) 단계 일자</label>
                        <input type="date" name="dateA" value={formData.dateA || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.8rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>입찰(B) 단계 일자</label>
                        <input type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.8rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>구매(Pr) 단계 일자</label>
                        <input type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.8rem" }} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>검수(I) 단계 일자</label>
                        <input type="date" name="dateI" value={formData.dateI || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.8rem" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>운영 구분</label>
                      <select name="operation" value={formData.operation} onChange={handleInputChange} className="user-selector" style={{ width: "100%" }}>
                        <option value="교과목(정규)">교과목(정규)</option>
                        <option value="교과목(비정규)">교과목(비정규)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>
                        📄 관련문서 번호 (쉼표 구분 다중입력 가능)
                      </label>
                      <input 
                        type="text" 
                        name="relatedDocs" 
                        value={formData.relatedDocs || ""} 
                        onChange={handleInputChange} 
                        placeholder="예: UC-EQ-B1-260, UC-EQ-B1-261" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.85rem" }} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 용역용 입력 필드들 */}
              {modalType === "service" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>용역 명칭 (500만원 이상)</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 앵커 산학 네트워크 포럼 기획 운영 대행 용역" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>추진 목적 (용역 요건)</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="해당 용역이 해결하고자 하는 문제 및 목표" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>수행기관 자격 (규모, 실적 이력)</label>
                    <textarea name="providerQual" value={formData.providerQual} onChange={handleInputChange} placeholder="입찰 자격 기준 (예: 연 매출 1억 이상, 동종 용역 이력 3건 이상)" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업비 계획액 (원)</label>
                      <input type="number" name="budgetPlan" value={formData.budgetPlan} onChange={handleInputChange} placeholder="예: 25000000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>실제 집행액 (원)</label>
                      <input type="number" name="budgetSpent" value={formData.budgetSpent} onChange={handleInputChange} placeholder="예: 0" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>현재 행정 절차 단계</label>
                      <select name="step" value={formData.step} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        <option value={1}>1단계: 사업단 결재완료</option>
                        <option value={2}>2단계: 구매 발주 (총무팀 대행)</option>
                        <option value={3}>3단계: 준공 검수 완료</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>최종 운영 결과</label>
                    <textarea name="opResult" value={formData.opResult} onChange={handleInputChange} placeholder="검수 결과 및 산출물 내역 요약" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color-dark)", color: "white", cursor: "pointer" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
                >
                  새 항목 등록하기
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 월별 Gantt 단계 다중 선택 플로팅 팝오버 컴포넌트 */}
      {activePopover && (
        <>
          <div 
            onClick={() => setActivePopover(null)} 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, background: "transparent" }} 
          />
          <div 
            style={{
              position: "fixed",
              top: `${activePopover.y}px`,
              left: `${activePopover.x}px`,
              transform: "translate(-50%, -100%) translateY(-10px)",
              background: "#ffffff", // 완전히 밝은 흰색 배경으로 교체
              border: "1px solid #cbd5e1", // 밝고 고상한 실버 테두리
              borderRadius: "8px",
              padding: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.15)", // 자연스러운 음영 그림자
              zIndex: 1251,
              width: "160px",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", textAlign: "center" }}>
              {activePopover.month}월 단계 중복 선택
            </div>
            {[
              { label: "기획 (P)", val: "기획", color: "#ea580c" }, // 밝은 배경에 선명한 오렌지
              { label: "승인 (A)", val: "승인", color: "#1d4ed8" }, // 선명한 다크 블루
              { label: "입찰 (B)", val: "입찰", color: "#0e7490" }, // 진한 시안
              { label: "구매 (Pr)", val: "구매", color: "#6d28d9" }, // 선명한 퍼플
              { label: "검수 (I)", val: "검수", color: "#047857" }  // 진한 에메랄드 그린
            ].map((step) => {
              let isChecked = false;
              if (activePopover.equipId === "NEW_FORM") {
                const currentList = getMilestoneArray(formData.milestones?.[activePopover.month]);
                isChecked = currentList.includes(step.val);
              } else {
                const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
                const targetEquip = activeEquipList.find(e => e.id === activePopover.equipId);
                const currentList = targetEquip ? getMilestoneArray(targetEquip.milestones?.[activePopover.month]) : [];
                isChecked = currentList.includes(step.val);
              }

              return (
                <label 
                  key={step.val} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    fontSize: "0.75rem", 
                    color: "#0f172a", // 어두운 텍스트로 가독성 확보
                    cursor: "pointer", 
                    userSelect: "none",
                    padding: "0.2rem 0.35rem",
                    borderRadius: "4px",
                    transition: "background 0.1s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMilestoneMultiToggle(activePopover.equipId, activePopover.month, step.val)}
                    style={{ cursor: "pointer", accentColor: step.color }}
                  />
                  <span style={{ color: step.color, fontWeight: "800" }}>{step.label}</span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {/* 기획문서 팝업 모달 (사용자 요건 3 대응) */}
      {proposalModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
          <div className="glass-card" style={{ width: "500px", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#60A5FA" }}>
                📄 기획문서 (사업계획 제안서 요약)
              </h4>
              <button 
                onClick={() => setProposalModalData(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const summary = PROPOSAL_SUMMARIES[proposalModalData.unit] || {
                title: "알 수 없는 단위과제",
                dept: "미지정 센터",
                goals: ["상세 계획 확인 중"],
                budget: "0.0백만원"
              };
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>관련문서</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24" }}>
                      {proposalModalData.selectedDoc || proposalModalData.relatedDocs || `UC-EQ-${proposalModalData.unit}-${String(proposalModalData.seq || proposalModalData.id).slice(-3).padStart(3, "0")}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>단위과제</span>
                    <strong style={{ fontSize: "0.9rem" }}>{proposalModalData.unit} : {summary.title}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>주관 부서</span>
                    <span>{summary.dept}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>과제 배정 예산</span>
                    <strong style={{ color: "#3b82f6" }}>{summary.budget}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {summary.goals.map((goal, idx) => (
                        <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              <button 
                onClick={() => setProposalModalData(null)}
                style={{ padding: "0.4rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 입찰문서 팝업 모달 (사용자 요건 3 대응) */}
      {bidModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
          <div className="glass-card" style={{ width: "550px", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#10B981" }}>
                📜 입찰문서 (조달 규격 구매 공고서)
              </h4>
              <button 
                onClick={() => setBidModalData(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const price = Number(bidModalData.unitPrice) || 0;
              const qty = Number(bidModalData.quantity) || 0;
              const total = price * qty;
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.82rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>관련문서</span>
                      <strong style={{ fontFamily: "monospace", color: "#FBBF24" }}>
                        {bidModalData.selectedDoc || bidModalData.relatedDocs || `UC-EQ-${bidModalData.unit}-${String(bidModalData.seq || bidModalData.id).slice(-3).padStart(3, "0")}`}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>입찰 구분</span>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>제한경쟁입찰 (규격/가격 동시)</span>
                    </div>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700", width: "100px" }}>품명</td>
                        <td style={{ padding: "0.5rem", color: "white", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>구매 수량</td>
                        <td style={{ padding: "0.5rem" }}>{qty} 대(세트)</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>도입 단가</td>
                        <td style={{ padding: "0.5rem", fontWeight: "700", color: "#60A5FA" }}>{formatToMillionWon(price)} 백만원</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>소요 예산</td>
                        <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{formatToMillionWon(total)} 백만원 (부가가치세 포함)</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>납품 장소</td>
                        <td style={{ padding: "0.5rem" }}>울산과학대학교 지정 실습 공간 및 지정 교수연구실</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>요구 성능 규격</td>
                        <td style={{ padding: "0.5rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                          - 앵커 사업단 실무위원회 통과 규격서 준수<br />
                          - 무상 유지보수 기한 2년 이상 보장 조건<br />
                          - {bidModalData.description || "상세 사양서 별도 첨부 참조"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              <button 
                onClick={() => setBidModalData(null)}
                style={{ padding: "0.4rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
