import type { OrderlyCourse, PmProfessor } from "../major-program-types";

// 💡 주문식 교육과정 전체 54개 교과목 실 정산 데이터 정의
export const ORDERLY_COURSES: OrderlyCourse[] = [
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

// 💡 학과별 PM교수 데이터 정의 (각 학과/전공별 주문식 교육과정 운영 상세 정보 포함)
// 초보 개발자(교육자)용 설명:
// 이 데이터셋은 학과별 PM교수 매핑 정보와 함께 각 학과가 실제로 운영 중인 주문식 교육과정명(courses),
// 교육에 참여하는 총학생수(totalStudents), 중복 수강생을 제외한 순수 참여학생수(uniqueStudents),
// 그리고 해당 학과의 교육과정 특징을 기술한 비고(note) 정보까지 통합하여 담고 있습니다.
export const PM_PROFESSORS: PmProfessor[] = [
  {
    dept: "간호학부",
    name: "공경란",
    courses: "기본간호학 1, 통합간호학",
    totalStudents: 334,
    uniqueStudents: 310,
    note: "통합간호학(PBL) 및 기본간호학(AI) 연계"
  },
  {
    dept: "게임영상학과",
    name: "이재현",
    courses: "3D애니메이션 1, 커뮤니케이션디자인 1",
    totalStudents: 60,
    uniqueStudents: 55,
    note: "3D애니메이션 및 OJT 병행 운영"
  },
  {
    dept: "국제학부",
    name: "이연주",
    courses: "Smartwork 실무, 관광마케팅조실무, 호텔경영실무",
    totalStudents: 26,
    uniqueStudents: 22,
    note: "외국인 유학생 전용 주문식 과정 운영"
  },
  {
    dept: "글로벌비즈니스학과",
    name: "서용한",
    courses: "Smartwork 실무, 관광마케팅조사 실무, 호텔경영론",
    totalStudents: 50,
    uniqueStudents: 45,
    note: "유학생 관광마케팅 및 Smartwork 실무 연계"
  },
  {
    dept: "기계공학부 기계시스템전공",
    name: "이정준",
    courses: "전공종합설계, 챌린지프로젝트(종합설계및창업)(2), 기계품질데이터분석",
    totalStudents: 186,
    uniqueStudents: 165,
    note: "캡스톤디자인 중심 종합설계 교육"
  },
  {
    dept: "기계공학부 기계설비전공",
    name: "고형석",
    courses: "설비진단, 스마트제조실무",
    totalStudents: 50,
    uniqueStudents: 45,
    note: "설비진단 및 스마트제조 중심"
  },
  {
    dept: "물리치료학과",
    name: "김원호",
    courses: "신경계물리치료중재, 소아물리치료",
    totalStudents: 56,
    uniqueStudents: 50,
    note: "신경계 및 소아 물리치료 특화 PBL"
  },
  {
    dept: "사회복지학과",
    name: "이수경",
    courses: "청소년복지론, 노인상담",
    totalStudents: 65,
    uniqueStudents: 60,
    note: "청소년 및 노인복지 융합형 과정"
  },
  {
    dept: "세무회계학과",
    name: "천정애",
    courses: "재무제표론",
    totalStudents: 37,
    uniqueStudents: 37,
    note: "재무제표론 중심 세무 실무 교육"
  },
  {
    dept: "스포츠건강재활학과",
    name: "김원문",
    courses: "근골격계재활운동, 근육재활심화테크닉",
    totalStudents: 29,
    uniqueStudents: 25,
    note: "근골격계 재활 및 심화 테크닉 과정"
  },
  {
    dept: "스포츠재활학부 스포츠재활전공",
    name: "김원문",
    courses: "교정운동및실습(1), 근육재활심화테크닉(1), 스포츠의학개론, 스포츠심리학",
    totalStudents: 90,
    uniqueStudents: 80,
    note: "교정운동 및 스포츠의학 융합 과정"
  },
  {
    dept: "스포츠재활학부 스포츠지도전공",
    name: "서봉한",
    courses: "보디빌딩지도법, 스포츠윤리",
    totalStudents: 49,
    uniqueStudents: 45,
    note: "보디빌딩 및 스포츠윤리 지도 특화"
  },
  {
    dept: "식품영양학과",
    name: "김일낭",
    courses: "-",
    totalStudents: 0,
    uniqueStudents: 0,
    note: "3차년도 주문식 과정 개설 예정"
  },
  {
    dept: "실내건축디자인과",
    name: "김동욱",
    courses: "실내건축캡스톤디자인, 실내건축설계(1)",
    totalStudents: 34,
    uniqueStudents: 30,
    note: "실내건축 캡스톤디자인 연계"
  },
  {
    dept: "융합안전공학과",
    name: "한영진",
    courses: "통합안전진로탐색, 프로그래밍언어",
    totalStudents: 85,
    uniqueStudents: 78,
    note: "통합안전진로 및 프로그래밍 연계"
  },
  {
    dept: "전기전자공학부 스마트전자전공",
    name: "조영",
    courses: "캡스톤디자인(1), 파이썬프로그래밍",
    totalStudents: 35,
    uniqueStudents: 32,
    note: "스마트전자 캡스톤 및 파이썬 연계"
  },
  {
    dept: "조선해양시스템공학과",
    name: "양승호",
    courses: "배관시스템설계, 부유체안정성",
    totalStudents: 25,
    uniqueStudents: 22,
    note: "배관설계 및 부유체 안정성 실무"
  },
  {
    dept: "치위생학과",
    name: "이동은",
    courses: "구강미생물학, 임상전단계실습 1, 구강보건교육학및실습, 구강조직학, 구강생리학",
    totalStudents: 456,
    uniqueStudents: 410,
    note: "구강미생물학(PBL) 및 임상실습 융합"
  },
  {
    dept: "컴퓨터공학과",
    name: "김금석",
    courses: "종합설계, 컴퓨터구조, 객체지향프로그래밍(1)",
    totalStudents: 138,
    uniqueStudents: 125,
    note: "종합설계 및 컴퓨터구조 PBL 연계"
  },
  {
    dept: "호텔조리제빵과",
    name: "채영철",
    courses: "궁중요리실습, 에스프레소커피실습, Italian Cooking, AI-DX 초콜릿및케이크실습",
    totalStudents: 278,
    uniqueStudents: 250,
    note: "AI-DX 제빵 및 이탈리안 요리 융합"
  },
  {
    dept: "화학공학과",
    name: "송민석",
    courses: "챌린지프로젝트(종합설계및창업), 화학장치운전실무, 현장사례연구, GMP실무",
    totalStudents: 87,
    uniqueStudents: 80,
    note: "현장사례연구 및 GMP실무 특화"
  }
];

// 연차별 단위과제 및 주요 프로그램 데이터 명세
export const majorProgramsData = {
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
