import type { LegacyAppRecord } from "./app-types";

// 초기에 적재해 둘 기자재 목록 모의 데이터셋 (Supabase 최초 시딩용)
export const _defaultEquipmentsSeed = [
  {
    id: 1, unit: "A1", seq: 1, deptName: "간호학부", divisionName: "", itemName: "스마트 환자 시뮬레이터 (중환자 케어 실습 장비)", unitPrice: 120000000, quantity: 1, description: "글로벌 앵커 혁신 교육과정 임상 실습 고도화 핵심 기기", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-10", dateA: "2025-04-15", dateB: "2025-06-12", datePr: "2025-07-20", dateI: "2025-09-05"
  },
  {
    id: 2, unit: "A2", seq: 2, deptName: "화학공학과", divisionName: "", itemName: "정밀 화학 분석 크로마토그래피 시스템", unitPrice: 245000000, quantity: 1, description: "신산업 저탄소 에너지 트랙 화학 정밀 분석 실습 장비", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-15", dateA: "2025-04-20", dateB: "2025-06-18", datePr: "2025-07-25", dateI: "2025-09-10"
  },
  {
    id: 3, unit: "B1", seq: 3, deptName: "컴퓨터공학과", divisionName: "", itemName: "AI 알고리즘 모델링 연산용 고성능 GPU 워크스테이션", unitPrice: 15000000, quantity: 3, description: "RCC 특화산업 AI 융합 실감형 교육 센터 실무 교육 지원", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-12", dateA: "2025-04-18", dateB: "", datePr: "2025-06-25", dateI: "2025-08-14"
  },
  {
    id: 4, unit: "B2", seq: 4, deptName: "기계공학부", divisionName: "", itemName: "스마트 팩토리 모듈 제어 및 3D 정밀 프린팅 모듈", unitPrice: 38000000, quantity: 1, description: "지산학 연계 제조 혁신 엔지니어 교육 기자재", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-20", dateA: "2025-05-15", dateB: "2025-06-08", datePr: "2025-06-20", dateI: "2025-08-18"
  },
  {
    id: 5, unit: "B3", seq: 5, deptName: "전기전자공학부", divisionName: "", itemName: "반도체 임베디드 코딩 및 고정밀 계측 오실로스코프", unitPrice: 8500000, quantity: 4, description: "반도체 전공 대학 연계 실무 미러형 교육 설계용 장비", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-25", dateA: "2025-04-28", dateB: "2025-06-05", datePr: "2025-06-18", dateI: "2025-08-20"
  },
  {
    id: 6, unit: "B4", seq: 6, deptName: "유아교육과", divisionName: "", itemName: "늘봄 연계 창의 놀이 실증용 스마트 인터랙티브 디스플레이", unitPrice: 8500000, quantity: 2, description: "에듀테크 기반 창의적 교육 콘텐츠 제작 교육 과정 운영", operation: "교과목(비정규)", password: "1234",
    dateP: "2025-03-18", dateA: "2025-05-10", dateB: "", datePr: "2025-06-24", dateI: "2025-08-25"
  },
  {
    id: 7, unit: "C1", seq: 7, deptName: "컴퓨터공학과", divisionName: "", itemName: "다목적 6축 소형 스마트 교육용 협동 로봇 머니퓰레이터", unitPrice: 28000000, quantity: 1, description: "미래 지능형 로봇 운용/제어 교과목 현장 중심 실습", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-22", dateA: "2025-05-12", dateB: "2025-06-15", datePr: "2025-06-28", dateI: "2025-08-28"
  },
  {
    id: 8, unit: "C2", seq: 8, deptName: "반려동물보건과", divisionName: "", itemName: "동물 전용 디지털 초음파 진단 장치", unitPrice: 19000000, quantity: 1, description: "신설학과 실무 미러형 임상 실습실 조달 품목", operation: "교과목(정규)", password: "1234",
    dateP: "2025-04-10", dateA: "2025-05-20", dateB: "2025-06-18", datePr: "2025-07-15", dateI: "2025-09-12"
  },
  {
    id: 9, unit: "D1", seq: 9, deptName: "조선해양시스템공학과", divisionName: "", itemName: "미래 친환경선박 가상 운항 교육 시뮬레이터", unitPrice: 45000000, quantity: 1, description: "5극3특 가상 운항 실습 교육 과정 지원용 장비", operation: "교과목(정규)", password: "1234",
    dateP: "2025-03-08", dateA: "2025-05-08", dateB: "2025-07-10", datePr: "2025-08-20", dateI: "2025-11-15"
  },
  {
    id: 10, unit: "D2", seq: 10, deptName: "물리치료학과", divisionName: "", itemName: "메디컬 스킨케어 다기능 뷰티 디바이스", unitPrice: 6500000, quantity: 5, description: "웰니스 뷰티 케어 실습 및 지역 상생 뷰티 아카데미 활용", operation: "교과목(비정규)", password: "1234",
    dateP: "2025-03-14", dateA: "2025-04-24", dateB: "", datePr: "2025-06-22", dateI: "2025-08-29"
  }
];

// 초기에 적재해 둘 협약서 목록 모의 데이터셋 (1차년도 샘플 2개 제공)
export const INITIAL_AGREEMENTS = [
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
export const REVERSE_UNIT_MAPPING_Y1: Record<string, string> = {
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

export const PROGRAM_ID_MIGRATION_MAP: Record<string, Record<string, string>> = {
  "A1가": {
    // 1차 마이그레이션 (원본 ID ➡️ 신규 41개 프로그램 ID)
    "A1가-01": "A1가-S1T1-1", "A1가-02": "A1가-S1T2-1", "A1가-03": "A1가-S1T2-2", "A1가-04": "A1가-S1T2-3", "A1가-05": "A1가-S1T2-4",
    "A1가-06": "A1가-S1T2-5", "A1가-07": "A1가-S1T2-6", "A1가-08": "A1가-S1T3-1", "A1가-09": "A1가-S2T4-1", "A1가-10": "A1가-S3T5-1",
    "A1가-11": "A1가-S3T6-1", "A1가-12": "A1가-S3T6-2", "A1가-13": "A1가-S3T7-1", "A1가-14": "A1가-S3T8-1", "A1가-15": "A1가-S3T8-2",
    "A1가-16": "A1가-S3T8-3", "A1가-17": "A1가-S4T9-1", "A1가-18": "A1가-S4T9-2", "A1가-19": "A1가-S4T9-3", "A1가-20": "A1가-S4T9-4",
    "A1가-21": "A1가-S4T9-5", "A1가-22": "A1가-S4T9-6", "A1가-23": "A1가-S4T9-7", "A1가-24": "A1가-S4T9-8", "A1가-25": "A1가-S4T9-9",
    "A1가-26": "A1가-S4T9-10", "A1가-27": "A1가-S4T9-11", "A1가-28": "A1가-S4T9-12", "A1가-29": "A1가-S4T9-13", "A1가-30": "A1가-S4T10-1",
    "A1가-31": "A1가-S4T11-1", "A1가-32": "A1가-S4T11-2", "A1가-33": "A1가-S5T13-1", "A1가-34": "A1가-S5T13-2", "A1가-35": "A1가-S5T13-3",
    "A1가-36": "A1가-S5T13-4", "A1가-37": "A1가-S5T13-5", "A1가-38": "A1가-S5T13-6", "A1가-39": "A1가-S5T14-1", "A1가-40": "A1가-S5T15-1",
    "A1가-41": "A1가-S5T15-2",

    // 2차 구제 마이그레이션 (과거 잘못 저장된 v26 캐시 ID ➡️ 신규 41개 프로그램 ID)
    "A1가-S1T1-2": "A1가-S1T2-1", "A1가-S1T1-3": "A1가-S1T2-2", "A1가-S1T1-4": "A1가-S1T2-3", "A1가-S1T1-5": "A1가-S1T2-4",
    "A1가-S1T1-6": "A1가-S1T2-5", "A1가-S1T1-7": "A1가-S1T2-6", "A1가-S1T1-8": "A1가-S1T3-1", "A1가-S1T1-9": "A1가-S2T4-1",
    "A1가-S1T1-10": "A1가-S3T5-1", "A1가-S3T3-1": "A1가-S3T7-1", "A1가-S1T1-11": "A1가-S3T6-1", "A1가-S1T1-12": "A1가-S3T6-2",
    "A1가-S3T3-2": "A1가-S3T8-1", "A1가-S3T3-3": "A1가-S3T8-2", "A1가-S3T3-4": "A1가-S3T8-3", "A1가-S3T3-5": "A1가-S4T9-1",
    "A1가-S4T4-1": "A1가-S4T9-3", "A1가-S4T4-2": "A1가-S4T9-4", "A1가-S4T4-3": "A1가-S4T9-5", "A1가-S4T4-4": "A1가-S4T9-6",
    "A1가-S4T4-5": "A1가-S4T9-7", "A1가-S4T4-6": "A1가-S4T9-8", "A1가-S4T4-7": "A1가-S4T9-9", "A1가-S3T3-6": "A1가-S4T9-2",
    "A1가-S5T5-1": "A1가-S4T9-10", "A1가-S5T5-2": "A1가-S4T9-11", "A1가-S5T5-3": "A1가-S4T9-12", "A1가-S5T5-4": "A1가-S4T9-13",
    "A1가-S5T5-5": "A1가-S4T10-1", "A1가-S5T5-6": "A1가-S4T11-1", "A1가-S5T5-7": "A1가-S4T11-2",
    "A1가-S5T5-9": "A1가-S5T13-1", "A1가-S5T5-10": "A1가-S5T13-2", "A1가-S5T5-11": "A1가-S5T13-3", "A1가-S5T5-12": "A1가-S5T13-4",
    "A1가-S5T5-13": "A1가-S5T13-5", "A1가-S5T5-14": "A1가-S5T13-6", "A1가-S5T5-15": "A1가-S5T15-1", "A1가-S5T5-16": "A1가-S5T15-2",
    "A1가-S5T5-17": "A1가-S5T14-1",

    // 3차 구제 마이그레이션 (기존 35개 프로그램 ID ➡️ 신규 41개 프로그램 ID)
    "A1가-S2T5-1": "A1가-S2T4-1", "A1가-S3T6-1": "A1가-S3T5-1", "A1가-S3T7-1": "A1가-S3T6-1", "A1가-S3T7-2": "A1가-S3T6-2",
    "A1가-S3T8-1": "A1가-S3T7-1", "A1가-S3T9-1": "A1가-S3T8-1", "A1가-S3T9-2": "A1가-S3T8-2", "A1가-S3T9-3": "A1가-S3T8-3",
    "A1가-S4T10-1": "A1가-S4T9-1", "A1가-S4T10-2": "A1가-S4T9-2", "A1가-S4T10-3": "A1가-S4T9-3", "A1가-S4T10-4": "A1가-S4T9-4",
    "A1가-S4T11-1": "A1가-S4T10-1", "A1가-S4T12-1": "A1가-S4T11-1", "A1가-S4T12-2": "A1가-S4T11-2",
    "A1가-S5T13-7": "A1가-S5T15-1", "A1가-S5T13-8": "A1가-S5T15-2"
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

export const NEW_A1GA_SPEC_TITLES: Record<string, string> = {
  "A1가-S1T1-1": "UC-HYPER 교수법 개발(공학/비공학)",
  "A1가-S1T2-1": "주문식 교육과정 운영",
  "A1가-S1T2-2": "주문식(지역맞춤형) 교육과정 개발 및 개편 보고서",
  "A1가-S1T2-3": "주문식 교육과정 자체평가 보고서",
  "A1가-S1T2-4": "과정평가형 교육과정개발(3개 학과)",
  "A1가-S1T2-5": "학점교류 교과목 운영",
  "A1가-S1T2-6": "학과별 실험실습재료비 지원",
  "A1가-S1T3-1": "특화분야 자격증/전문가 과정 운영",
  "A1가-S2T4-1": "지산학 페스티벌 운영 창의설계 경진대회",
  "A1가-S3T5-1": "개방형설계센터 전문가활용교육 개발 및 운영",
  "A1가-S3T6-1": "울산형 데이터센터 기술인재 양성을 위한 자격증과정 운영",
  "A1가-S3T6-2": "울산형 데이터센터 기술인재 양성을 위한 마이크로디그리 개발",
  "A1가-S3T7-1": "표준형 현장실습 교과목 운영",
  "A1가-S3T8-1": "기업 PBL 문제해결 지원과제 운영",
  "A1가-S3T8-2": "전문기술석사 과정 워크숍",
  "A1가-S3T8-3": "전공심화 산학 PBL과제 운영",
  "A1가-S4T9-1": "교육환경개선",
  "A1가-S4T9-2": "생성형 AI 지원 플랫폼 구축",
  "A1가-S4T9-3": "실시간 쌍방향 소통 수업 플랫폼 구축",
  "A1가-S4T9-4": "기자재 및 실습장비 구축 (주문식 교과 기자재)",
  "A1가-S4T9-5": "기자재 및 실습장비 구축 (환경시료 측정 장비)",
  "A1가-S4T9-6": "기자재 및 실습장비 구축 (AI활용 빅데이터 분석)",
  "A1가-S4T9-7": "기자재 및 실습장비 구축 (조선 설계 교육용 SW)",
  "A1가-S4T9-8": "기자재 및 실습장비 구축 (Physical AI 데스크탑)",
  "A1가-S4T9-9": "기자재 및 실습장비 구축 (Physical AI 모니터)",
  "A1가-S4T9-10": "기자재 및 실습장비 구축 (Physical AI 매니풀레이터)",
  "A1가-S4T9-11": "기자재 및 실습장비 구축 (디지털트윈 제작 3D 카메라)",
  "A1가-S4T9-12": "기자재 및 실습장비 구축 (디지털트윈 SW 구독)",
  "A1가-S4T9-13": "기자재 및 실습장비 구축 (드론 시뮬레이터)",
  "A1가-S4T10-1": "ECC 플랫폼 구축(2단계)",
  "A1가-S4T11-1": "특화분야 온라인 교육 콘텐츠 개발",
  "A1가-S4T11-2": "AI리터러시 교과목 운영",
  "A1가-S5T13-1": "이전 공공기관 합동 채용설명회 및 취업 아카데미 운영",
  "A1가-S5T13-2": "산학협력 간담회",
  "A1가-S5T13-3": "정책연구과제 운영",
  "A1가-S5T13-4": "강소기업 현장견학 프로그램 운영",
  "A1가-S5T13-5": "학과 전공 맞춤형 모듈식 취업캠프",
  "A1가-S5T13-6": "시그니처 클래스 운영",
  "A1가-S5T14-1": "벤치마킹",
  "A1가-S5T15-1": "교직원 역량강화 프로그램 운영",
  "A1가-S5T15-2": "장학금 지급"
};

// 앵커 사업단 초기 구성원 주소록 명단 데이터셋
export const INITIAL_MEMBERS: LegacyAppRecord[] = [
  // 교수 및 리더진
  { id: "m-01", name: "송경영", role: "사업단장", grade: "정교수", dept: "-", phoneOffice: "052-279-3154", phoneMobile: "010-7627-7123", email: "kysong@uc.ac.kr", room: "교수연구실/E1-307", hireDate: "2026-03-01" },
  { id: "m-02", name: "김현수", role: "총괄본부장", grade: "정교수", dept: "운영본부", phoneOffice: "052-279-3122", phoneMobile: "010-4628-7963", email: "hskim3@uc.ac.kr", room: "교수연구실/E2-414", hireDate: "2026-03-01" },
  { id: "m-03", name: "심현미", role: "운영팀장", grade: "부장", dept: "사업운영팀", phoneOffice: "052-230-0441", phoneMobile: "010-6554-8359", email: "hmsim@uc.ac.kr", room: "산학협력단/S-203", hireDate: "2026-03-01" },
  { id: "m-04", name: "이동은", role: "센터장", grade: "부교수", dept: "ECC센터", phoneOffice: "052-230-0798", phoneMobile: "010-5171-7140", email: "delee@uc.ac.kr", room: "교수연구실/E2-201", hireDate: "2026-03-01" },
  { id: "m-05", name: "김기범", role: "센터장", grade: "부교수", dept: "ICC센터", phoneOffice: "052-279-3094", phoneMobile: "010-2243-9802", email: "kbkim@uc.ac.kr", room: "교수연구실/E2-301", hireDate: "2026-03-01" },
  { id: "m-06", name: "현용환", role: "센터장", grade: "조교수", dept: "RCC센터", phoneOffice: "052-230-0643", phoneMobile: "010-4299-3119", email: "yhhyun@uc.ac.kr", room: "교수연구실/E2-401", hireDate: "2026-03-01" },
  { id: "m-07", name: "홍광표", role: "센터장", grade: "조교수", dept: "울산늘봄누리센터", phoneOffice: "052-230-0724", phoneMobile: "010-2512-1233", email: "kphong@uc.ac.kr", room: "교수연구실/E2-501", hireDate: "2026-03-01" },
  { id: "m-07b", name: "홍진숙", role: "센터장", grade: "정교수", dept: "신산업특화센터", phoneOffice: "052-279-3134", phoneMobile: "010-9120-8583", email: "cshong@uc.ac.kr", room: "센터실/N-101", hireDate: "2026-06-01" },

  // 팀장교수
  { id: "m-08", name: "장광일", role: "팀장교수", grade: "조교수", dept: "ECC센터", phoneOffice: "052-230-0798", phoneMobile: "010-5204-4521", email: "kijang@uc.ac.kr", room: "교수연구실/E2-202", hireDate: "2026-03-01" },
  { id: "m-09", name: "고형석", role: "팀장교수", grade: "조교수", dept: "ECC센터", phoneOffice: "052-230-0798", phoneMobile: "010-4353-7720", email: "hsko@uc.ac.kr", room: "교수연구실/E2-203", hireDate: "2026-03-01" },
  { id: "m-10", name: "양승호", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-279-3138", phoneMobile: "010-8927-8740", email: "shyang@uc.ac.kr", room: "교수연구실/E2-204", hireDate: "2026-03-01" },
  { id: "m-11", name: "김산", role: "팀장교수", grade: "조교수", dept: "ICC센터", phoneOffice: "052-279-3123", phoneMobile: "010-9408-9672", email: "skim@uc.ac.kr", room: "교수연구실/E2-302", hireDate: "2026-03-01" },
  { id: "m-12", name: "한미라", role: "팀장교수", grade: "부교수", dept: "ICC센터", phoneOffice: "052-230-0738", phoneMobile: "010-5293-3915", email: "mrhan@uc.ac.kr", room: "교수연구실/E2-303", hireDate: "2026-03-01" },
  { id: "m-13", name: "김민경", role: "팀장교수", grade: "조교수", dept: "RCC센터", phoneOffice: "052-230-0663", phoneMobile: "010-9449-3310", email: "mkkim@uc.ac.kr", room: "교수연구실/E2-402", hireDate: "2026-03-01" },
  { id: "m-14", name: "이한도", role: "팀장교수", grade: "부교수", dept: "RCC센터", phoneOffice: "052-230-0786", phoneMobile: "010-3069-6996", email: "hdlee@uc.ac.kr", room: "교수연구실/E2-403", hireDate: "2026-03-01" },
  { id: "m-15", name: "이상현", role: "팀장교수", grade: "조교수", dept: "RCC센터", phoneOffice: "052-230-0756", phoneMobile: "010-7676-8938", email: "shlee@uc.ac.kr", room: "교수연구실/E2-404", hireDate: "2026-03-01" },
  { id: "m-15b", name: "박성혁", role: "팀장교수", grade: "조교수", dept: "RCC센터", phoneOffice: "052-230-0763", phoneMobile: "010-4132-0866", email: "shpark@uc.ac.kr", room: "교수연구실/E2-405", hireDate: "2026-03-01" },
  { id: "m-16", name: "이정준", role: "팀장교수", grade: "정교수", dept: "AID-X지원센터", phoneOffice: "052-279-3102", phoneMobile: "010-7651-7723", email: "jjlee@uc.ac.kr", room: "교수연구실/E2-502", hireDate: "2026-03-01" },

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
  { id: "m-42", name: "최주명", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0419", phoneMobile: "010-9385-5959", email: "jmchoi@uc.ac.kr", room: "연구원실/N-105", hireDate: "2026-03-01" },
  { id: "m-43", name: "김예담", role: "연구원", grade: "연구원", dept: "ICC센터", phoneOffice: "052-279-3308", phoneMobile: "010-5128-0993", email: "kimyd98@uc.ac.kr", room: "연구원실/I-104", hireDate: "2026-07-01" }
];
