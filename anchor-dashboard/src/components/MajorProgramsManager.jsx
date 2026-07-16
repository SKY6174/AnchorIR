import React, { useState, useEffect } from "react";
import { 
  Award, BookOpen, Layers, Settings, Compass, Share2, ShieldAlert, 
  Calendar, Activity, CheckCircle, Search, User, Users, Plus, Trash2, ArrowRight 
} from "lucide-react";

// 💡 주문식 교육과정 전체 54개 교과목 실 정산 데이터 정의
const ORDERLY_COURSES = [
  { id: "cap_1", type: "캡스톤디자인", dept: "기계공학부", name: "전공종합설계", professor: "이진우", students: 109, budget: 1440000, year: 2 },
  { id: "cap_2", type: "캡스톤디자인", dept: "기계공학부", name: "챌린지프로젝트 (종합설계및창업)(2)", professor: "김민갑", students: 40, budget: 4700000, year: 2 },
  { id: "cap_3", type: "캡스톤디자인", dept: "실내건축디자인과", name: "실내건축캡스톤디자인", professor: "김동욱", students: 15, budget: 3200000, year: 2 },
  { id: "cap_4", type: "캡스톤디자인", dept: "전기전자공학부", name: "캡스톤디자인(1)", professor: "조영", students: 9, budget: 2200000, year: 2 },
  { id: "cap_5", type: "캡스톤디자인", dept: "컴퓨터공학과", name: "종합설계", professor: "김금석", students: 16, budget: 3200000, year: 2 },
  { id: "cap_6", type: "캡스톤디자인", dept: "컴퓨터공학과", name: "종합설계", professor: "김성열", students: 18, budget: 2300000, year: 2 },
  { id: "cap_7", type: "캡스톤디자인", dept: "화학공학과", name: "챌린지프로젝트 (종합설계및창업)", professor: "유승민", students: 21, budget: 2900000, year: 2 },
  
  { id: "pbl_1", type: "기업형 PBL", dept: "간호학부", name: "통합간호학", professor: "김민경", students: 173, budget: 3600000, year: 2 },
  { id: "pbl_2", type: "기업형 PBL", dept: "물리치료학과", name: "신경계물리치료중재", professor: "김원호", students: 28, budget: 2200000, year: 2 },
  { id: "pbl_3", type: "기업형 PBL", dept: "물리치료학과", name: "소아물리치료", professor: "송주영", students: 28, budget: 2200000, year: 2 },
  { id: "pbl_4", type: "기업형 PBL", dept: "사회복지학과", name: "청소년복지론", professor: "이수경", students: 34, budget: 2480000, year: 2 },
  { id: "pbl_5", type: "기업형 PBL", dept: "스포츠건강재활학과", name: "근골격계재활운동", professor: "김원문", students: 10, budget: 1560000, year: 2 },
  { id: "pbl_6", type: "기업형 PBL", dept: "스포츠재활학부", name: "교정운동및실습(1)", professor: "김원문", students: 13, budget: 1500000, year: 2 },
  { id: "pbl_7", type: "기업형 PBL", dept: "치위생학과", name: "구강미생물학", professor: "이동은", students: 102, budget: 6060000, year: 2 },
  { id: "pbl_8", type: "기업형 PBL", dept: "치위생학과", name: "임상전단계실습 1", professor: "이가연", students: 82, budget: 5980000, year: 2 },
  { id: "pbl_9", type: "기업형 PBL", dept: "컴퓨터공학과", name: "컴퓨터구조", professor: "김성열", students: 60, budget: 4500000, year: 2 },
  { id: "pbl_10", type: "기업형 PBL", dept: "글로벌비즈니스학과", name: "관광마케팅조사 실무", professor: "서용한", students: 13, budget: 1200000, year: 2, isForeign: true },

  { id: "omn_1", type: "옴니버스", dept: "스포츠건강재활학과", name: "근육재활심화테크닉", professor: "김원문", students: 9, budget: 1200000, year: 2 },
  { id: "omn_2", type: "옴니버스", dept: "스포츠재활학부", name: "근육재활심화테크닉(1)", professor: "김원문", students: 13, budget: 900000, year: 2 },
  { id: "omn_3", type: "옴니버스", dept: "스포츠재활학부", name: "보디빌딩지도법", professor: "서봉한", students: 18, budget: 900000, year: 2 },
  { id: "omn_4", type: "옴니버스", dept: "융합안전공학과", name: "통합안전진로탐색", professor: "한영진", students: 66, budget: 2100000, year: 2 },
  { id: "omn_5", type: "옴니버스", dept: "치위생학과", name: "구강보건교육학및실습", professor: "유진실", students: 82, budget: 1200000, year: 2 },
  { id: "omn_6", type: "옴니버스", dept: "호텔조리제빵과", name: "궁중요리실습", professor: "서경화", students: 69, budget: 3000000, year: 2 },
  { id: "omn_7", type: "옴니버스", dept: "호텔조리제빵과", name: "에스프레소커피실습", professor: "전유명", students: 71, budget: 3000000, year: 2 },
  { id: "omn_8", type: "옴니버스", dept: "호텔조리제빵과", name: "Italian Cooking", professor: "전유명", students: 69, budget: 3000000, year: 2 },
  { id: "omn_9", type: "옴니버스", dept: "화학공학과", name: "화학장치운전실무", professor: "송성국", students: 20, budget: 1200000, year: 2 },
  { id: "omn_10", type: "옴니버스", dept: "국제학부", name: "관광마케팅조사실무", professor: "서용한", students: 6, budget: 1200000, year: 2, isForeign: true },
  { id: "omn_11", type: "옴니버스", dept: "국제학부", name: "호텔경영실무", professor: "이현찬", students: 16, budget: 600000, year: 2, isForeign: true },
  { id: "omn_12", type: "옴니버스", dept: "글로벌비즈니스학과", name: "호텔경영론", professor: "이연주", students: 6, budget: 1200000, year: 2, isForeign: true },

  { id: "ojt_1", type: "OJT 병행", dept: "게임영상학과", name: "커뮤니케이션디자인 1", professor: "이재현", students: 20, budget: 3500000, year: 2 },
  { id: "ojt_2", type: "OJT 병행", dept: "기계공학부", name: "설비진단", professor: "고형석", students: 35, budget: 3050000, year: 2 },
  { id: "ojt_3", type: "OJT 병행", dept: "화학공학과", name: "현장사례연구", professor: "송민석, 장광일", students: 2, budget: 1100000, year: 2 },

  { id: "ai_1", type: "AI 리터러시", dept: "간호학부", name: "기본간호학 1", professor: "공경란", students: 161, budget: 500000, year: 2 },
  { id: "ai_2", type: "AI 리터러시", dept: "게임영상학과", name: "3D애니메이션 1", professor: "김지수", students: 40, budget: 500000, year: 2 },
  { id: "ai_3", type: "AI 리터러시", dept: "기계공학부", name: "기계품질데이터분석", professor: "김기범", students: 37, budget: 500000, year: 2 },
  { id: "ai_4", type: "AI 리터러시", dept: "기계공학부", name: "스마트제조실무", professor: "고형석", students: 15, budget: 500000, year: 2 },
  { id: "ai_5", type: "AI 리터러시", dept: "사회복지학과", name: "노인상담", professor: "이수경", students: 31, budget: 500000, year: 2 },
  { id: "ai_6", type: "AI 리터러시", dept: "세무회계학과", name: "재무제표론", professor: "한정희", students: 37, budget: 500000, year: 2 },
  { id: "ai_7", type: "AI 리터러시", dept: "스포츠건강재활학과", name: "근골격계재활운동", professor: "김원문", students: 10, budget: 200000, year: 2 },
  { id: "ai_8", type: "AI 리터러시", dept: "스포츠재활학부", name: "스포츠의학개론", professor: "김원문", students: 38, budget: 500000, year: 2 },
  { id: "ai_9", type: "AI 리터러시", dept: "스포츠재활학부", name: "스포츠심리학", professor: "김기훈", students: 26, budget: 500000, year: 2 },
  { id: "ai_10", type: "AI 리터러시", dept: "스포츠재활학부", name: "스포츠윤리", professor: "서봉한", students: 31, budget: 500000, year: 2 },
  { id: "ai_11", type: "AI 리터러시", dept: "실내건축디자인과", name: "실내건축설계(1)", professor: "김동욱", students: 19, budget: 500000, year: 2 },
  { id: "ai_12", type: "AI 리터러시", dept: "융합안전공학과", name: "프로그래밍언어", professor: "정일한", students: 19, budget: 500000, year: 2 },
  { id: "ai_13", type: "AI 리터러시", dept: "전기전자공학부", name: "파이썬프로그래밍", professor: "장민호", students: 26, budget: 500000, year: 2 },
  { id: "ai_14", type: "AI 리터러시", dept: "조선해양시스템공학과", name: "배관시스템설계", professor: "양승호", students: 13, budget: 1200000, year: 2 },
  { id: "ai_15", type: "AI 리터러시", dept: "조선해양시스템공학과", name: "부유체안정성", professor: "양승호", students: 12, budget: 1200000, year: 2 },
  { id: "ai_16", type: "AI 리터러시", dept: "치위생학과", name: "구강조직학", professor: "이가연", students: 108, budget: 500000, year: 2 },
  { id: "ai_17", type: "AI 리터러시", dept: "치위생학과", name: "구강생리학", professor: "이동은", students: 82, budget: 500000, year: 2 },
  { id: "ai_18", type: "AI 리터러시", dept: "컴퓨터공학과", name: "객체지향프로그래밍(1)", professor: "김금석", students: 44, budget: 500000, year: 2 },
  { id: "ai_19", type: "AI 리터러시", dept: "호텔조리제빵과", name: "AI-DX 초콜릿및케이크실습", professor: "신언환", students: 69, budget: 7000000, year: 2 },
  { id: "ai_20", type: "AI 리터러시", dept: "화학공학과", name: "GMP실무", professor: "장광일", students: 44, budget: 500000, year: 2 },
  { id: "ai_21", type: "AI 리터러시", dept: "국제학부", name: "Smartwork 실무", professor: "서용한", students: 4, budget: 500000, year: 2, isForeign: true },
  { id: "ai_22", type: "AI 리터러시", dept: "글로벌비즈니스학과", name: "Smartwork 실무", professor: "서용한", students: 31, budget: 500000, year: 2, isForeign: true }
];

// 💡 학과별 PM교수 데이터 정의
const PM_PROFESSORS = [
  { dept: "간호학부", name: "공경란" },
  { dept: "게임영상학과", name: "이재현" },
  { dept: "국제학부", name: "이연주" },
  { dept: "글로벌비즈니스학과", name: "서용한" },
  { dept: "기계공학부 기계시스템전공", name: "이정준" },
  { dept: "기계공학부 기계설비전공", name: "고형석" },
  { dept: "물리치료학과", name: "김원호" },
  { dept: "사회복지학과", name: "이수경" },
  { dept: "세무회계학과", name: "천정애" },
  { dept: "스포츠건강재활학과", name: "김원문" },
  { dept: "스포츠재활학부 스포츠재활전공", name: "김원문" },
  { dept: "스포츠재활학부 스포츠지도전공", name: "서봉한" },
  { dept: "식품영양학과", name: "김일낭" },
  { dept: "실내건축디자인과", name: "김동욱" },
  { dept: "융합안전공학과", name: "한영진" },
  { dept: "전기전자공학부 (스마트전자)", name: "조영" },
  { dept: "조선해양시스템공학과", name: "양승호" },
  { dept: "치위생학과", name: "이동은" },
  { dept: "컴퓨터공학과", name: "김금석" },
  { dept: "호텔조리제빵과", name: "채영철" },
  { dept: "화학공학과", name: "송민석" }
];

// 연차별 단위과제 및 주요 프로그램 데이터 명세
const majorProgramsData = {
  1: { // 1차년도
    A1: {
      label: "A1. 지역과 미래를 만드는 UC-HYPER 전문기술인재 양성",
      programs: [
        { id: "A1_orderly", name: "주문식 교육과정", desc: "지역 산업체 수요 맞춤형 주문식 교육과정 개발 및 운영" }
      ]
    },
    A2: {
      label: "A2. 지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성",
      programs: [
        { id: "A2_urise_star", name: "U-RISE 스타", desc: "RISE 체계 기반 스타트업 육성 및 글로컬 창업동아리 활성화" }
      ]
    },
    A3: {
      label: "A3. 지역산업 연계 글로벌 협력 거점 대학 육성",
      programs: [
        { id: "D4_global", name: "글로벌 파트너십", desc: "글로벌 유수 대학 및 연구소 연계 국제 공동 연구 교류" }
      ]
    },
    B1: {
      label: "B1. 중소·중견기업 맞춤형 기술지원·공동연구 활성화",
      programs: [
        { id: "B1_tech_support", name: "기업 연계 R&BD", desc: "애로기술 해결 지도 및 현장 실증 공동 프로젝트" }
      ]
    },
    B2: {
      label: "B2. AID 역량강화 기반 지역산업 전환 지원",
      programs: [
        { id: "C2_aidx", name: "AIDX", desc: "재학생·재직자 AI/DX 공동 융합 교육 및 기술 실증" },
        { id: "C2_mani", name: "동남권-제주MANI", desc: "동남권 및 제주 지역 대학 간 초광역 앵커 협력 모델" }
      ]
    },
    B3: {
      label: "B3. 교육·산업·복지가 조화로운 지속가능한 탄소중립",
      programs: [
        { id: "C3_netzero", name: "탄소중립 그린캠퍼스", desc: "캠퍼스 내 친환경 그린인재 육성 및 모의 환경 정화 교실" }
      ]
    },
    B4: {
      label: "B4. 복합재난 대응 산업안전·보건 관리시스템 개발",
      programs: [
        { id: "C1_safety", name: "산업안전 보건교육", desc: "복합 재난안전 관리체계 수립 및 전문 안전 인력 교육" }
      ]
    },
    C1: {
      label: "C1. U-LIFE 평생직업교육 플랫폼 구축",
      programs: [
        { id: "B2_rbnd", name: "R&BD", desc: "지산학 연계 연구개발 및 평생 교육 기술 상용화 프로그램" }
      ]
    },
    C2: {
      label: "C2. 내일을 밝히는 '위드아이' 늘봄 생태계 조성",
      programs: [
        { id: "D2_care", name: "위드아이 늘봄", desc: "지역 아동 돌봄 생태계 조성 및 늘봄 복지 모델 운영" }
      ]
    },
    D1: {
      label: "D1. 지역을 키우는 지역문제 해결 협력 체계 구축",
      programs: [
        { id: "B3_local_collab", name: "지역 밀착 협업", desc: "지자체-대학-산업계 연계 지역 사회문제 해결 모델 구축" }
      ]
    },
    D2: {
      label: "D2. 통합형 인재양성 기반 포용적 보건복지서비스 구현",
      programs: [
        { id: "D1_welfare", name: "보건복지 서비스", desc: "물리치료 및 보건 복지 연계 포용적 지역 지원 아카데미" }
      ]
    },
    D3: {
      label: "D3. 에코 컬처로 만드는 꿀잼도시 울산",
      programs: [
        { id: "D3_culture", name: "로컬 컬처 콘텐츠", desc: "울산 해양/문화 관광 브랜드 콘텐츠 발굴 및 아카데미" }
      ]
    }
  },
  2: { // 2차년도
    "A1가": {
      label: "A1가. UC-HYPER 전문기술인재 양성",
      programs: [
        { id: "A1_orderly_y2", name: "주문식 교육과정", desc: "2차년도 고도화된 산업체 맞춤형 주문식 교육과정" },
        { id: "A1_seminar_y2", name: "지산학 이음 세미나", desc: "지역사회와 대학을 잇는 지산학 동반성장 세미나" }
      ]
    },
    "A1나": {
      label: "A1나. 신산업특화 전문기술인재 양성",
      programs: [
        { id: "A1_glocal_y2", name: "글로컬 앵커 교육과정 고도화", desc: "글로컬 앵커 맞춤형 미래 신산업 기술 교육" }
      ]
    },
    A2: {
      label: "A2. 글로컬 창업 문화 조성",
      programs: [
        { id: "A2_anchor_star_y2", name: "앵커 스타", desc: "2차년도 앵커 체계 기반 스타트업 고도화 및 투자 유치 지원" }
      ]
    },
    A3: {
      label: "A3. 글로벌 협력 거점 대학 육성",
      programs: [
        { id: "A3_global_y2", name: "글로벌 아카데미", desc: "해외 우수 교육 기관 연계 글로벌 교환 인력 및 연수" }
      ]
    },
    B1: {
      label: "B1. 주력·신산업 분야 산학협력 체계 구축",
      programs: [
        { id: "B1_tech_y2", name: "R&BD 고도화", desc: "애로 기술 상용화 연구 및 교내 고가 기자재 활용 지원" }
      ]
    },
    B2: {
      label: "B2. AID 역량강화 기반 지역산업 전환 지원",
      programs: [
        { id: "B2_aws_c3", name: "AWS C3 인증", desc: "AWS C3 클라우드 컴퓨팅 국제 자격증 취득 및 AI 연계 교육" },
        { id: "B2_ax_frontier", name: "AX프론티어 동아리", desc: "인공지능 전환(AX) 기술 기반 학생/기업 프론티어 동아리 활동 지원" }
      ]
    },
    B3: {
      label: "B3. 지·산·학 협력 탄소중립 실천 플랫폼 구축",
      programs: [
        { id: "B3_netzero_y2", name: "그린에너지 실증", desc: "캠퍼스 내 탄소 저감 기술 모의 실증 및 안전 교육과정" }
      ]
    },
    B4: {
      label: "B4. 복합재난 대응 산업안전·보건 통합 운영체계 구축",
      programs: [
        { id: "B4_disaster_y2", name: "디지털 재난안전", desc: "스마트 소방/안전 모니터링 실무 인력 양성 아카데미" }
      ]
    },
    C1: {
      label: "C1. U-LIFE 평생직업교육 기반 취·창업 연계모델 구축",
      programs: [
        { id: "C1_lifelong_y2", name: "성인 평생교육", desc: "지역 중소기업 재직자 기술 재교육 및 마이크로 디그리" }
      ]
    },
    C2: {
      label: "C2. 동남권과 함께 성장하는 돌봄생태계, 울산애(愛) 구현",
      programs: [
        { id: "C2_care_y2", name: "늘봄 아카데미", desc: "지자체-대학 협업형 에듀케어 교육 과정 개발 운영" }
      ]
    },
    D1: {
      label: "D1. 지역문제 해결을 위한 울산형 혁신 솔루션 구축",
      programs: [
        { id: "D1_livinglab_y2", name: "리빙랩 아카데미", desc: "지역 밀착형 복지 해결 및 사회 혁신 주체 양성 지원" }
      ]
    },
    D2: {
      label: "D2. 지속가능한 보건복지 특성화 및 인재양성 체계 구축",
      programs: [
        { id: "D2_wellness_y2", name: "웰니스 헬스케어", desc: "물리치료/간호 웰니스 지역 시니어 봉사 및 아카데미" }
      ]
    },
    D3: {
      label: "D3. 에코컬처 도시재생 및 문화혁신 모델 구축",
      programs: [
        { id: "D3_branding_y2", name: "로컬 브랜딩", desc: "울산 역사/에코 자원 기반 로컬 관광 상품 개발 기획" }
      ]
    }
  }
};

export default function MajorProgramsManager({ selectedYear }) {
  // 현재 연도에 해당하는 단위과제 목록 추출
  const yearData = majorProgramsData[selectedYear] || {};
  const unitKeys = Object.keys(yearData);

  // 현재 선택된 단위과제 상태 (첫 번째 항목을 디폴트로 설정)
  const [selectedUnit, setSelectedUnit] = useState("");
  // 현재 선택된 프로그램 상태
  const [selectedProg, setSelectedProg] = useState(null);

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

  // 💡 가상 이수학생 데이터 및 상태 관리 (교과목 ID별 학생 리스트)
  const [studentList, setStudentList] = useState({
    "cap_1": [
      { id: "202611001", name: "김민재", dept: "기계공학부", status: "이수완료" },
      { id: "202611002", name: "이지은", dept: "기계공학부", status: "진행중" },
      { id: "202611003", name: "박준서", dept: "기계공학부", status: "이수완료" },
      { id: "202611004", name: "윤도훈", dept: "기계공학부", status: "이수완료" },
      { id: "202611005", name: "한소희", dept: "기계공학부", status: "진행중" }
    ],
    "pbl_1": [
      { id: "202612041", name: "최주연", dept: "간호학부", status: "이수완료" },
      { id: "202612042", name: "황도현", dept: "간호학부", status: "진행중" },
      { id: "202612043", name: "안서연", dept: "간호학부", status: "이수완료" }
    ],
    "omn_1": [
      { id: "202613091", name: "민지선", dept: "스포츠건강재활학과", status: "이수완료" },
      { id: "202613092", name: "송지훈", dept: "스포츠건강재활학과", status: "진행중" }
    ]
  });

  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentDept, setNewStudentDept] = useState("");

  // 휠 스크롤 회전 제어를 위한 틱 제어 상태 및 Ref
  const containerRef = React.useRef(null);
  const [lastWheelTime, setLastWheelTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false); // 마우스 호버 추적용 상태 추가
  const activeIndex = unitKeys.indexOf(selectedUnit);

  // 연도가 변경되면 단위과제 선택 초기화
  useEffect(() => {
    if (unitKeys.length > 0) {
      setSelectedUnit(unitKeys[0]);
      // 디폴트 프로그램 설정
      const defaultProg = yearData[unitKeys[0]]?.programs[0] || null;
      setSelectedProg(defaultProg);
    } else {
      setSelectedUnit("");
      setSelectedProg(null);
    }
  }, [selectedYear]);

  // 💡 주문식 교육과정 탭 및 코스 선택 영구 복원 동기화 (새로고침 대응)
  useEffect(() => {
    localStorage.setItem("anchor_orderly_tab", orderlyTab);
  }, [orderlyTab]);

  useEffect(() => {
    localStorage.setItem("anchor_active_course_id", activeCourseId);
  }, [activeCourseId]);

  // 마우스 호버 상태에서 키보드 up/down 방향키 입력 시 단위과제 선택 회전 동기화
  useEffect(() => {
    if (!isHovered) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // 브라우저 기본 스크롤(페이지 전체 이동) 차단
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastWheelTime < 160) return; // 동일 스로틀 데드타임 적용

        if (e.key === "ArrowDown") {
          // 아래 방향키: 다음 단위과제
          const nextIndex = (activeIndex + 1) % unitKeys.length;
          handleUnitChange(unitKeys[nextIndex]);
          setLastWheelTime(now);
        } else if (e.key === "ArrowUp") {
          // 위 방향키: 이전 단위과제
          const prevIndex = (activeIndex - 1 + unitKeys.length) % unitKeys.length;
          handleUnitChange(unitKeys[prevIndex]);
          setLastWheelTime(now);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHovered, activeIndex, unitKeys, lastWheelTime]);

  // 마우스 휠 스크롤과 단위과제 선택 회전 동기화
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // 대시보드 전체 페이지 스크롤과 충돌 방지
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastWheelTime < 160) return; // 스로틀링 데드타임 적용

      if (e.deltaY > 0) {
        // 아래로 스크롤: 다음 단위과제로 순환
        const nextIndex = (activeIndex + 1) % unitKeys.length;
        handleUnitChange(unitKeys[nextIndex]);
        setLastWheelTime(now);
      } else if (e.deltaY < 0) {
        // 위로 스크롤: 이전 단위과제로 순환
        const prevIndex = (activeIndex - 1 + unitKeys.length) % unitKeys.length;
        handleUnitChange(unitKeys[prevIndex]);
        setLastWheelTime(now);
      }
    };

    // passive: false를 명시하여 e.preventDefault()가 브라우저 단에서 즉시 적용되도록 설정
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [activeIndex, unitKeys, lastWheelTime]);

  // 단위과제를 변경했을 때 프로그램 선택
  const handleUnitChange = (unit) => {
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
          좌측 3D 롤링 다이얼에서 마우스 휠 스크롤 또는 클릭으로 <strong>단위과제</strong>를 선택하여 현황을 확인하세요.
        </p>
      </div>

      {/* 2. 메인 워크스페이스 레이아웃 (좌측 단위과제 원형 리스트 / 우측 프로그램 정보) */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "2rem", position: "relative" }}>
        
        {/* 키보드 및 휠 조작 안내 말풍선 툴팁 */}
        <div style={{
          position: "absolute",
          top: "60px",
          left: "90px",
          width: "210px",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.5rem",
          fontSize: "0.72rem",
          color: "var(--text-primary)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.15)",
          zIndex: 100,
          pointerEvents: "none",
          opacity: isHovered ? 1 : 0,
          transform: `translateX(${isHovered ? 8 : -10}px)`,
          transition: "opacity 0.25s ease, transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          gap: "0.2rem",
          lineHeight: "1.35"
        }}>
          {/* 말풍선 꼬리 */}
          <div style={{
            position: "absolute",
            left: "-6px",
            top: "18px",
            width: "0",
            height: "0",
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: "6px solid rgba(15, 23, 42, 0.95)"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "800", color: "var(--accent-color)" }}>
            <span>💡 조작 가이드</span>
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            마우스를 이 영역에 올려놓고 <strong>휠 스크롤</strong> 또는 키보드 <strong>↑/↓ 방향키</strong>로 회전할 수 있습니다!
          </div>
        </div>

        {/* 좌측 단위과제 원형 버튼 세트 - 3D 회전 실린더 휠 다이얼 */}
        <div 
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            borderRight: "1px solid var(--border-color)", 
            paddingRight: "1.5rem",
            height: "400px", // 휠 회전 컨테이너의 최적 세로 높이
            overflow: "hidden",
            position: "relative",
            perspective: "800px",
            userSelect: "none"
          }}
        >
          <span style={{ 
            fontSize: "0.75rem", 
            fontWeight: "800", 
            color: "var(--text-secondary)", 
            textTransform: "uppercase", 
            letterSpacing: "1px", 
            marginBottom: "1rem",
            zIndex: 10,
            background: "var(--modal-bg)", // 배경 테마 가변 처리하여 융합
            padding: "0.2rem 0.5rem",
            borderRadius: "0.25rem",
            position: "absolute",
            top: "0"
          }}>
            과제 선택
          </span>

          {/* 상하단 입체 휠 페이드 마스킹 오버레이 */}
          <div style={{
            position: "absolute",
            top: 25,
            left: 0,
            right: 0,
            height: "55px",
            background: "linear-gradient(to bottom, var(--modal-bg) 15%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 5
          }} />
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55px",
            background: "linear-gradient(to top, var(--modal-bg) 15%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 5
          }} />

          {/* 3D 실린더 트랙 */}
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px", 
              alignItems: "center",
              transformStyle: "preserve-3d",
              transition: "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)", // 스크롤 전환 모션 0.65s로 속도감 튜닝
              // 활성화 버튼을 정확히 수직 중앙으로 정렬하는 트랜슬레이션 수식 적용
              // 높이 400px 중앙은 Y=200px. 버튼지름 56px, gap 12px -> 1개 높이 68px.
              // 오프셋 기점: 200 - 28 = 172px.
              transform: `translateY(${172 - activeIndex * 68}px)`,
              width: "100%",
              height: "100%",
              paddingTop: "24px"
            }}
          >
            {unitKeys.length > 0 ? (
              unitKeys.map((unit, index) => {
                const diff = index - activeIndex;
                // 중앙 활성화 항목 기준으로 상하 입체 궤도 곡률 적용
                const rotateX = diff * 22; 
                const translateZ = Math.abs(diff) * -12; 
                const translateY = diff * -2; 
                const scale = Math.max(0.68, 1 - Math.abs(diff) * 0.08); 
                const opacity = Math.max(0.22, 1 - Math.abs(diff) * 0.26); 

                return (
                  <button
                    key={unit}
                    onClick={() => handleUnitChange(unit)}
                    className={`unit-circle-btn ${selectedUnit === unit ? "active" : ""}`}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      fontSize: "1.1rem",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0, // flex 수축 방지하여 완벽한 원형 유지
                      transition: "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.65s, background 0.3s, border-color 0.3s", // 스크롤 전환 모션 0.65s로 속도감 튜닝
                      
                      // 3D Cylinder transform 공식 적용!
                      transform: `rotateX(${rotateX}deg) translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale})`,
                      opacity: opacity,

                      background: selectedUnit === unit 
                        ? "linear-gradient(135deg, var(--accent-color), #3b82f6)" 
                        : "rgba(255, 255, 255, 0.04)",
                      color: selectedUnit === unit ? "#fff" : "var(--text-secondary)",
                      boxShadow: selectedUnit === unit 
                        ? "0 4px 15px rgba(59, 130, 246, 0.35)" 
                        : "none",
                      border: selectedUnit === unit ? "2px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.06)",
                      backfaceVisibility: "hidden"
                    }}
                  >
                    {unit}
                  </button>
                );
              })
            ) : (
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>과제 없음</div>
            )}
          </div>
        </div>

        {/* 우측 프로그램 선택 및 개별 화면 */}
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
                      border: "none",
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
                      <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.02)", padding: "0.25rem", borderRadius: "30px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                        {[
                          { key: "plan", label: "운영 계획", icon: <Calendar size={13} /> },
                          { key: "process", label: "운영 과정", icon: <Activity size={13} /> },
                          { key: "result", label: "운영 결과 & 이수", icon: <CheckCircle size={13} /> }
                        ].map((subTab) => (
                          <button
                            key={subTab.key}
                            onClick={() => setOrderlyTab(subTab.key)}
                            style={{
                              border: "none",
                              padding: "0.5rem 1.1rem",
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: "800",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              background: orderlyTab === subTab.key ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                              color: orderlyTab === subTab.key ? "#fff" : "var(--text-secondary)",
                              boxShadow: orderlyTab === subTab.key ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
                              transform: orderlyTab === subTab.key ? "translateY(-1px)" : "none"
                            }}
                          >
                            {subTab.icon}
                            {subTab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 1. 운영 계획 탭 */}
                    {orderlyTab === "plan" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* 총괄 카드 세트 */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>총 소요 예산</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#10b981", marginTop: "0.25rem" }}>117.9 백만원</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>국고 지원금 100%</div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>대상 교과목</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--accent-color)", marginTop: "0.25rem" }}>54 개 과목</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>A1 정규 교육과정</div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>참여 학생수</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#eab308", marginTop: "0.25rem" }}>2,170 명</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>유학생 76명 포함</div>
                          </div>
                        </div>

                        {/* 학과별 PM교수 현황 테이블 */}
                        <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", background: "rgba(255,255,255,0.01)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                            <h5 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)" }}>학과별 PM교수 구성 현황</h5>
                            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "5px", padding: "0.25rem 0.5rem", width: "180px" }}>
                              <Search size={12} style={{ color: "var(--text-secondary)", marginRight: "0.25rem" }} />
                              <input 
                                type="text"
                                placeholder="학과명 검색..."
                                value={pmSearchQuery}
                                onChange={(e) => setPmSearchQuery(e.target.value)}
                                style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.75rem", width: "100%" }}
                              />
                            </div>
                          </div>

                          <div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.8rem" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                  <th style={{ padding: "0.4rem" }}>순번</th>
                                  <th style={{ padding: "0.4rem" }}>학과(전공)명</th>
                                  <th style={{ padding: "0.4rem" }}>PM교수</th>
                                  <th style={{ padding: "0.4rem" }}>역할</th>
                                </tr>
                              </thead>
                              <tbody>
                                {PM_PROFESSORS.filter(pm => pm.dept.includes(pmSearchQuery))
                                  .map((pm, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                      <td style={{ padding: "0.4rem" }}>{idx + 1}</td>
                                      <td style={{ padding: "0.4rem", fontWeight: "700" }}>{pm.dept}</td>
                                      <td style={{ padding: "0.4rem", color: "#10b981", fontWeight: "800" }}>{pm.name} 교수</td>
                                      <td style={{ padding: "0.4rem", color: "var(--text-secondary)", fontSize: "0.7rem" }}>교수학습 모델 시범 적용 및 과제 KPI 달성 관리</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. 운영 과정 탭 */}
                    {orderlyTab === "process" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* 필터 헤더 */}
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>학과 필터</label>
                            <select
                              value={selectedDeptFilter}
                              onChange={(e) => setSelectedDeptFilter(e.target.value)}
                              style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "#fff", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                            >
                              <option value="all">전체 학과</option>
                              {Array.from(new Set(ORDERLY_COURSES.map(c => c.dept))).map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>교육과정 유형</label>
                            <select
                              value={selectedTypeFilter}
                              onChange={(e) => setSelectedTypeFilter(e.target.value)}
                              style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "#fff", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                            >
                              <option value="all">전체 유형</option>
                              <option value="AI 리터러시">AI 리터러시</option>
                              <option value="옴니버스">옴니버스</option>
                              <option value="OJT 병행">OJT 병행</option>
                              <option value="캡스톤디자인">캡스톤디자인</option>
                              <option value="기업형 PBL">기업형 PBL</option>
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
                              {ORDERLY_COURSES.filter(c => {
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
                                >
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
                    {orderlyTab === "result" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", flexWrap: "wrap" }}>
                          
                          {/* 좌측: 타겟 교과 정보 */}
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>선택된 이수관리 교과목</span>
                              <h5 style={{ fontSize: "0.95rem", fontWeight: "900", color: "#10b981", marginTop: "0.2rem" }}>
                                {ORDERLY_COURSES.find(c => c.id === activeCourseId)?.name || "선택된 교과목 없음"}
                              </h5>
                              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                                {ORDERLY_COURSES.find(c => c.id === activeCourseId)?.dept} | {ORDERLY_COURSES.find(c => c.id === activeCourseId)?.professor} 교수
                              </p>
                            </div>

                            <div style={{ display: "flex", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                              <div>
                                <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>계획 총 참여생</span>
                                <div style={{ fontSize: "1.1rem", fontWeight: "800" }}>
                                  {ORDERLY_COURSES.find(c => c.id === activeCourseId)?.students || 0}명
                                </div>
                              </div>
                              <div>
                                <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>이수 완료</span>
                                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#10b981" }}>
                                  {studentList[activeCourseId]?.filter(s => s.status === "이수완료").length || 0}명
                                </div>
                              </div>
                              <div>
                                <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>진행중</span>
                                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#eab308" }}>
                                  {studentList[activeCourseId]?.filter(s => s.status === "진행중").length || 0}명
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 우측: 이수학생 추가 등록 폼 */}
                          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <h6 style={{ fontSize: "0.8rem", fontWeight: "800" }}>이수학생 개별 등록</h6>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
                              <input 
                                type="text"
                                placeholder="학번(9자리)"
                                value={newStudentId}
                                onChange={(e) => setNewStudentId(e.target.value)}
                                style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "#fff", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                              />
                              <input 
                                type="text"
                                placeholder="학생명"
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "#fff", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                              />
                              <input 
                                type="text"
                                placeholder="학과명"
                                value={newStudentDept}
                                onChange={(e) => setNewStudentDept(e.target.value)}
                                style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", color: "#fff", padding: "0.3rem", borderRadius: "5px", fontSize: "0.75rem", outline: "none" }}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (!newStudentId || !newStudentName) return;
                                const currentList = studentList[activeCourseId] || [];
                                const updated = [
                                  ...currentList,
                                  { id: newStudentId, name: newStudentName, dept: newStudentDept || "해당학과", status: "진행중" }
                                ];
                                setStudentList({
                                  ...studentList,
                                  [activeCourseId]: updated
                                });
                                setNewStudentId("");
                                setNewStudentName("");
                                setNewStudentDept("");
                              }}
                              style={{ 
                                background: "#10b981", 
                                color: "#fff", 
                                border: "none", 
                                padding: "0.35rem", 
                                borderRadius: "5px", 
                                fontSize: "0.75rem", 
                                cursor: "pointer", 
                                fontWeight: "800",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.2rem"
                              }}
                            >
                              <Plus size={12} />
                              학생 정보 신규 추가
                            </button>
                          </div>

                        </div>

                        {/* 상세 이수학생 리스트 테이블 */}
                        <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                            <thead>
                              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                                <th style={{ padding: "0.4rem 0.75rem" }}>학번</th>
                                <th style={{ padding: "0.4rem 0.75rem" }}>이름</th>
                                <th style={{ padding: "0.4rem 0.75rem" }}>소속 학과</th>
                                <th style={{ padding: "0.4rem 0.75rem" }}>이수 상태</th>
                                <th style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>상태 변경</th>
                                <th style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>제거</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(studentList[activeCourseId] || []).length > 0 ? (
                                (studentList[activeCourseId] || []).map((student, idx) => (
                                  <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                    <td style={{ padding: "0.4rem 0.75rem" }}>{student.id}</td>
                                    <td style={{ padding: "0.4rem 0.75rem", fontWeight: "700" }}>{student.name}</td>
                                    <td style={{ padding: "0.4rem 0.75rem", color: "var(--text-secondary)" }}>{student.dept}</td>
                                    <td style={{ padding: "0.4rem 0.75rem" }}>
                                      <span style={{ 
                                        fontSize: "0.65rem", 
                                        padding: "0.15rem 0.4rem", 
                                        borderRadius: "3px", 
                                        fontWeight: "800",
                                        background: student.status === "이수완료" ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.15)",
                                        color: student.status === "이수완료" ? "#10b981" : "#eab308"
                                      }}>
                                        {student.status}
                                      </span>
                                    </td>
                                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>
                                      <button 
                                        onClick={() => {
                                          const updatedList = studentList[activeCourseId].map(s => {
                                            if (s.id === student.id) {
                                              return { ...s, status: s.status === "이수완료" ? "진행중" : "이수완료" };
                                            }
                                            return s;
                                          });
                                          setStudentList({
                                            ...studentList,
                                            [activeCourseId]: updatedList
                                          });
                                        }}
                                        style={{ border: "none", background: "rgba(255,255,255,0.05)", color: "var(--text-primary)", fontSize: "0.68rem", padding: "0.15rem 0.4rem", borderRadius: "3px", cursor: "pointer" }}
                                      >
                                        상태 토글
                                      </button>
                                    </td>
                                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "center" }}>
                                      <button 
                                        onClick={() => {
                                          const updatedList = studentList[activeCourseId].filter(s => s.id !== student.id);
                                          setStudentList({
                                            ...studentList,
                                            [activeCourseId]: updatedList
                                          });
                                        }}
                                        style={{ border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.68rem", padding: "0.15rem 0.4rem", borderRadius: "3px", cursor: "pointer" }}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                    해당 교과목의 이수학생 대장이 비어있습니다. 우측 폼을 이용해 학생을 수동 등록하거나 [운영 과정] 탭에서 타 교과를 로드해 주세요.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
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
