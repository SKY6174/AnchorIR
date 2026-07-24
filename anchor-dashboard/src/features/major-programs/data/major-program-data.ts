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
