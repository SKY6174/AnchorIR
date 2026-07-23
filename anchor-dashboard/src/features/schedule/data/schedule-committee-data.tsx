import React from "react";
import { Award, CheckCircle, FileText, Info, Layers, Users } from "lucide-react";

// 💡 [디자인 가드] 위원회 ID별 고유 Lucide 아이콘 리턴 (특색있는 디스플레이 구현)
export const getCommitteeIcon = (id: string): React.JSX.Element => {
  switch (id) {
    case "total": return <Award size={15} />;
    case "planning": return <Layers size={15} />;
    case "budget": return <FileText size={15} />;
    case "evaluation": return <CheckCircle size={15} />;
    case "advisory": return <Users size={15} />;
    default: return <Info size={15} />;
  }
};

// 💡 [임기 날짜 가드] YYYY.MM.DD 포맷을 YYYY-MM-DD 로 변환 (캘린더 input 용)
export const dotToDashDate = (dotDate?: string): string => {
  if (!dotDate) return "";
  const cleaned = dotDate.trim().replace(/\./g, "-");
  return cleaned.endsWith("-") ? cleaned.slice(0, -1) : cleaned;
};

// 💡 [임기 날짜 가드] YYYY-MM-DD 포맷을 YYYY.MM.DD. 로 변환 (DB 저장/화면 표출용)
export const dashToDotDate = (dashDate?: string): string => {
  if (!dashDate) return "";
  const parts = dashDate.split("-");
  if (parts.length !== 3) return dashDate;
  return `${parts[0]}.${parts[1]}.${parts[2]}.`;
};

// RISE 사업을 이끌어가는 5대 거버넌스 위원회 상세 정의 상수
export const COMMITTEES_DATA = [
  {
    id: "total",
    name: "앵커총괄위원회",
    fullName: "앵커총괄위원회 (구. RISE사업위원회)",
    badge: "최고의사결정",
    color: "linear-gradient(135deg, #ec4899 0%, #be123c 100%)",
    purpose: "앵커 사업 총괄 / 사업계획서 심의 / 교육환경 및 기자재 구축심의 / 예산변경안 최종승인 등",
    desc: "울산 지역 앵커 사업의 최고 의사 결정 기구로, 사업의 총괄 방향 설정, 주요 계획의 심의·의결, 성과 지표 평가 및 환류 체계 조율 등의 핵심 역할을 담당합니다. 본 대학 대학혁신위원회규정(UCS-D-314)에 의한 대학혁신위원회에서 그 기능을 대신합니다.",
    constitution: "내부 9인, 외부 2인을 포함한 11인 내외",
    cycle: "반기별 1회 개최 (필요 시 임시 위원회 소집)",
    functions: [
      "앵커 사업 총괄 및 연도별 사업계획서 심의·의결",
      "교육환경 개선 및 기자재 구축 심의·확정",
      "사업비 대규모 변경(예산변경안) 최종 승인 및 조율",
      "기타 앵커 사업 운영 상 최고 의사결정이 필요한 현안 해결"
    ],
    members: [
      { id: 1, type: "위원장", name: "조홍래", org: "울산과학대학교", dept: "-", rank: "총장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "김성철", org: "울산과학대학교", dept: "-", rank: "부총장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "변홍석", org: "울산과학대학교", dept: "교무처", rank: "처장", location: "교내", note: "" },
      { id: 4, type: "위원", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "인사발령으로 인한 변경" },
      { id: 5, type: "위원", name: "이주영", org: "울산과학대학교", dept: "학생취업처", rank: "처장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "박일현", org: "울산과학대학교", dept: "총무처", rank: "처장", location: "교내", note: "" },
      { id: 7, type: "위원", name: "송경영", org: "울산과학대학교", dept: "산학협력단(앵커)", rank: "단장", location: "교내", note: "" },
      { id: 8, type: "위원", name: "미지정", org: "울산과학대학교", dept: "직원노동조합", rank: "위원장", location: "교내", note: "" },
      { id: 9, type: "위원", name: "미지정", org: "울산과학대학교", dept: "총학생회", rank: "회장", location: "교내", note: "" },
      { id: 10, type: "위원", name: "정문호", org: "정테크", dept: "-", rank: "대표", location: "교외", note: "신규 추가" },
      { id: 11, type: "위원", name: "이경우", org: "울산발전연구원", dept: "경제산업연구실", rank: "실장", location: "교외", note: "신규 추가" },
      { id: 12, type: "간사", name: "고우근", org: "울산과학대학교", dept: "기획처", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "planning",
    name: "앵커기획위원회",
    fullName: "앵커기획위원회 (구. RISE사업추진위원회)",
    badge: "기획·실무조율",
    color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    purpose: "대학/지자체 발전계획에 의거한 앵커사업계획서 작성 및 타당성 검토 / 사업계획서 및 사업결과보고서 운영 등",
    desc: "세부 추진전략 수립 및 프로그램 기획을 실무적으로 조율하는 위원회로, 대학발전계획 및 울산광역시 발전계획에 근거하여 사업계획의 적합성과 타당성을 검토합니다. 위원장은 앵커사업단장과 기획처장이 공동으로 맡습니다.",
    constitution: "앵커사업단장 및 내부위원 11인, 외부위원 4인을 포함한 15인 내외",
    cycle: "분기별 1회 개최 (실무 단계 상시 협의)",
    functions: [
      "대학발전계획 및 울산광역시 기본계획 연계성 타당성 검토",
      "앵커 사업계획서 기획·작성 및 결과보고서 운영 검토",
      "추진전략(S) 및 프로그램(PG) 실무 심의 및 조율",
      "참여 대학 및 외부 대학/기관과의 협력 연계 프로세스 설계"
    ],
    members: [
      { id: 1, type: "위원장", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "" },
      { id: 2, type: "위원장", name: "송경영", org: "울산과학대학교", dept: "앵커사업단", rank: "사업단장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "김현수", org: "울산과학대학교", dept: "앵커사업단", rank: "총괄본부장", location: "교내", note: "" },
      { id: 4, type: "위원", name: "최윤아", org: "울산과학대학교", dept: "기획처", rank: "부처장", location: "교내", note: "신규 추가" },
      { id: 5, type: "위원", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "김기범", org: "울산과학대학교", dept: "기업협업센터(ICC)", rank: "센터장", location: "교내", note: "" },
      { id: 7, type: "위원", name: "현용환", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "센터장", location: "교내", note: "기존 센터장 교육파견으로 인한 신규 추가" },
      { id: 8, type: "위원", name: "홍광표", org: "울산과학대학교", dept: "울산늘봄누리센터", rank: "센터장", location: "교내", note: "" },
      { id: 9, type: "위원", name: "장광일", org: "울산과학대학교", dept: "화학공학과", rank: "교수", location: "교내", note: "신규 추가" },
      { id: 10, type: "위원", name: "이정준", org: "울산과학대학교", dept: "기계공학부", rank: "교수", location: "교내", note: "신규 추가" },
      { id: 11, type: "위원", name: "정가영", org: "울산과학대학교", dept: "총대의원회", rank: "의장", location: "교내", note: "26/11월 임기 기준 (간호학과 정가영/2319149)" },
      { id: 12, type: "위원", name: "정회걸", org: "울산정보산업진흥원", dept: "인재교육센터", rank: "센터장", location: "교외", note: "신규 추가" },
      { id: 13, type: "위원", name: "남기석", org: "영남이공대학교", dept: "물리치료학과", rank: "교수", location: "교외", note: "" },
      { id: 14, type: "위원", name: "이상희", org: "청강문화산업대학교", dept: "전략지원처", rank: "처장", location: "교외", note: "" },
      { id: 15, type: "위원", name: "황영국", org: "조선이공대학교", dept: "산학협력단", rank: "단장", location: "교외", note: "" },
      { id: 16, type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "budget",
    name: "앵커사업비관리위원회",
    fullName: "앵커사업비관리위원회",
    badge: "재정투명성",
    color: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
    purpose: "사업비 집행 가이드라인에 따라 사업 예산 집행 모니터링 / 집행률 점검 및 관리 / 사업비 조정 심의 등",
    desc: "사업 예산 집행의 규정 준수 여부를 모니터링하고 집행률을 극대화하기 위해 재정 건전성을 상시 관리·심의하는 특별 재정 관리 기구입니다.",
    constitution: "앵커사업단장을 포함하여 7인 내외 (내부 6인, 외부 1인)",
    cycle: "매 분기 정기 개최 (예산 변경 수시 심의 병행)",
    functions: [
      "국고 및 시비 매칭 자금 집행 가이드라인 점검 및 통제",
      "분기별 예산 집행률 분석 및 집행 촉진 대책 심의",
      "단위과제(UP) 간 대규모 예산 조정 및 재배분 심의",
      "사업비 정산 및 가이드 준수 여부 정밀 감독"
    ],
    members: [
      { id: 1, type: "위원장", name: "김성철", org: "울산과학대학교", dept: "-", rank: "부총장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "박일현", org: "울산과학대학교", dept: "총무처", rank: "처장", location: "교내", note: "" },
      { id: 4, type: "위원", name: "송경영", org: "울산과학대학교", dept: "앵커사업단", rank: "사업단장", location: "교내", note: "" },
      { id: 5, type: "위원", name: "김현수", org: "울산과학대학교", dept: "앵커사업단", rank: "총괄본부장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "고우근", org: "울산과학대학교", dept: "기획팀", rank: "팀장", location: "교내", note: "" },
      { id: 7, type: "위원", name: "강신욱", org: "인택스세무법인", dept: "세무팀", rank: "부대표", location: "교외", note: "" },
      { id: 8, type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "evaluation",
    name: "앵커사업자체평가위원회",
    fullName: "앵커사업자체평가위원회 (상임)",
    badge: "성과평가",
    color: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    purpose: "사업계획서 및 목표에 기반한 사업성과 평가 (중간평가/최종평가)",
    desc: "참여 부서 및 외부 협력 기관의 사업 실적을 공정하고 객관적으로 자체 평가하는 상임 위원회입니다. 위원장은 외부 위원 중에서 호선으로 선출하여 평가의 공정성과 전문성을 제고합니다.",
    constitution: "외부위원을 포함하여 내부 4인, 외부 5인을 포함한 9인 내외",
    cycle: "연 1회 정기 평가 (필요 시 중간/최종 평가 개최)",
    functions: [
      "성과목표 대비 달성도 및 사업 타당성 자체 평가",
      "중간 평가 및 최종 성과 분석을 통한 개선 조치 마련",
      "각 사업부서별 실적 검증 및 환류 평가 연계",
      "평가 결과에 의거한 차년도 예산 조정 방안 심의"
    ],
    members: [
      { id: 1, type: "위원장", name: "김영근", org: "대구보건대학교", dept: "경영부총장", rank: "부총장", location: "교외", note: "" },
      { id: 2, type: "위원", name: "변홍석", org: "울산과학대학교", dept: "교무처", rank: "처장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "이주영", org: "울산과학대학교", dept: "학생취업처", rank: "처장", location: "교내", note: "" },
      { id: 4, type: "위원", name: "서현영", org: "울산과학대학교", dept: "간호학부", rank: "학부장", location: "교내", note: "신규 추가" },
      { id: 5, type: "위원", name: "미지정", org: "울산과학대학교", dept: "총대의원회", rank: "의장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "김봉재", org: "HD한국조선해양", dept: "-", rank: "부장", location: "교외", note: "" },
      { id: 7, type: "위원", name: "한동호", org: "석원기공", dept: "-", rank: "대표이사", location: "교외", note: "" },
      { id: 8, type: "위원(자문겸직)", name: "류지호", org: "아주자동차대학교", dept: "교학처", rank: "처장", location: "교외", note: "" },
      { id: 9, type: "위원(자문겸직)", name: "박준", org: "광주보건대학교", dept: "글로벌혁신처", rank: "처장", location: "교외", note: "" },
      { id: 10, type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "advisory",
    name: "앵커사업자문회의",
    fullName: "앵커사업자문회의",
    badge: "외부전문가자문",
    color: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    purpose: "앵커 사업 정책 방향 및 지역 정주형 인재 양성을 위한 다변화 정책 자문",
    desc: "타 대학 혁신사업단 및 외부 전문기관의 전략적 자문을 구하고 지산학연 광역 네트워킹을 확대하기 위해 학계 및 행정계 전문가로 구성된 자문 기구입니다.",
    constitution: "외부전문가 중심 (교외 위원 7인 및 간사 교내 1인)",
    cycle: "반기별 1회 정기 회의 (현안에 따른 수시 자문 개최)",
    functions: [
      "울산 지역 혁신 인재 양성 및 정주 환경 조성을 위한 아이디어 제공",
      "타 대학(영남이공대, 거제대 등) 선도 사례 공유 및 연계 방안 수립",
      "지산학연 거버넌스 정책 동향 분석 및 전문 자문",
      "사업의 장기적 발전전략 및 핵심 프로그램 다각화 제언"
    ],
    members: [
      { id: 1, type: "위원", name: "남기석", org: "영남이공대학교", dept: "물리치료학과", rank: "교수", location: "교외", note: "" },
      { id: 2, type: "위원", name: "이상희", org: "청강문화산업대학교", dept: "혁신지원사업단", rank: "단장", location: "교외", note: "" },
      { id: 3, type: "위원", name: "황영국", org: "조선이공대학교", dept: "산학협력단", rank: "단장", location: "교외", note: "" },
      { id: 4, type: "위원", name: "이수경", org: "거제대학교", dept: "-", rank: "교수", location: "교외", note: "" },
      { id: 5, type: "위원", name: "최영오", org: "영남이공대학교", dept: "-", rank: "교수", location: "교외", note: "" },
      { id: 6, type: "위원", name: "남현욱", org: "춘해보건대학교", dept: "기획처", rank: "처장", location: "교외", note: "" },
      { id: 7, type: "위원", name: "이종향", org: "거제대학교", dept: "-", rank: "교수", location: "교외", note: "" },
      { id: 8, type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "ecc_op",
    name: "ECC센터운영위원회",
    fullName: "ECC센터운영위원회",
    badge: "지산학교육",
    color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    purpose: "지산학 연계 교육과정 공동 개발 및 학사운영 제도 개선 심의·운영",
    desc: "지산학교육센터(ECC)의 효율적 운영과 교육 프로그램의 질적 제고를 위해 학계, 산업계 실무 전문가들이 연계 교육과정의 타당성 및 제도를 자문·심의하는 위원회입니다.",
    constitution: "센터장, 내부 위원 및 협력 기관 위원 7인 내외",
    cycle: "매 학기별 1회 정기 개최 (수시 서면 자문 병행)",
    functions: [
      "지산학 융합 전공 및 주문식 교육과정 심의",
      "지산학 교육 콘텐츠 개발 및 질 관리 방안 마련",
      "참여 대학 간 학점 상호 인정 및 교육 자원 공유 촉진"
    ],
    members: [
      { id: 1, type: "위원장", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "최윤아", org: "울산과학대학교", dept: "기획처", rank: "부처장", location: "교내", note: "신규 추가" },
      { id: 3, type: "위원", name: "정문호", org: "정테크", dept: "-", rank: "대표", location: "교외", note: "" },
      { id: 4, type: "간사", name: "오영경", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "연구원", location: "교내", note: "" }
    ]
  },
  {
    id: "icc_op",
    name: "ICC센터운영위원회",
    fullName: "ICC센터운영위원회",
    badge: "지산학협력",
    color: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    purpose: "산학협력 공동 기술개발 및 기업 애로 기술 지도 과제 심의·운영",
    desc: "기업협업센터(ICC) 주관의 공동 기술개발 과제 공모, 특허 배분, 재직자 교육 등 산학협력 세부 액션플랜을 정밀 검토·심의하는 위원회입니다.",
    constitution: "센터장 및 가족기업 실무 리더, 내부 교수진 포함 7인 내외",
    cycle: "분기별 1회 개최 (기술개발 공모 시 수시 개최)",
    functions: [
      "산학공동 연구과제 심의 및 성과 검증",
      "대학 보유 기술의 사업화 및 기술이전 정책 검토",
      "산업계 재직자 단기 직무 연수 프로그램 심의"
    ],
    members: [
      { id: 1, type: "위원장", name: "김기범", org: "울산과학대학교", dept: "기업협업센터(ICC)", rank: "센터장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "정회걸", org: "울산정보산업진흥원", dept: "인재교육센터", rank: "센터장", location: "교외", note: "" },
      { id: 3, type: "위원", name: "한동호", org: "석원기공", dept: "-", rank: "대표이사", location: "교외", note: "" },
      { id: 4, type: "간사", name: "김인숙", org: "울산과학대학교", dept: "기업협업센터(ICC)", rank: "연구원", location: "교내", note: "" }
    ]
  },
  {
    id: "rcc_op",
    name: "RCC센터운영위원회",
    fullName: "RCC센터운영위원회",
    badge: "지역사회기여",
    color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    purpose: "지역사회 연계 공헌 프로그램 및 마일리지 장학금 수혜 기준 심의·확정",
    desc: "지역사회 공헌 및 지자체 협업 활성화를 위해 RCC 주관 프로그램 and 마일리지 장학 기준을 심의·평가하는 핵심 거버넌스 위원회입니다.",
    constitution: "센터장, 지자체 실무 오피서, 지역 사회 복지/문화 리더 포함 7인 내외",
    cycle: "학기별 1회 정기 개최",
    functions: [
      "지역사회 밀착형 협업 프로그램 기획 및 성과 평가",
      "지역 정주 활성화를 위한 로컬 크리에이터 양성 자문",
      "RCC 마일리지 장학금 지급 대상자 자격 및 실적 정밀 심사"
    ],
    members: [
      { id: 1, type: "위원장", name: "현용환", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "센터장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "이경우", org: "울산발전연구원", dept: "경제산업연구실", rank: "실장", location: "교외", note: "" },
      { id: 3, type: "위원", name: "남기석", org: "영남이공대학교", dept: "물리치료학과", rank: "교수", location: "교외", note: "" },
      { id: 4, type: "간사", name: "강수지", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "연구원", location: "교내", note: "" }
    ]
  },
  {
    id: "aidx_op",
    name: "AID-X지원센터운영위원회",
    fullName: "AID-X지원센터운영위원회",
    badge: "AI·DX혁신",
    color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    purpose: "학내 AI 교육 인프라 도입 및 디지털 전환(DX) 세부 과제 검토·조율",
    desc: "학내 전반의 인공지능(AI) 및 디지털 전환(DX) 교육 시스템 구축, 전공 장벽 완화, AI 도구 인프라 지원 정책을 기획·심의하는 첨단 인프라 조율 위원회입니다.",
    constitution: "센터장, 디지털 융합 전공 교수진, DX 인프라 전문가 포함 5인 내외",
    cycle: "반기별 1회 개최 (DX 인프라 신규 도입 시 상시 소집)",
    functions: [
      "AI 활용 교과 개발 지원비 지급 대상 심의",
      "디지털 전환 솔루션 도입에 따른 인프라 타당성 검토",
      "학내 메이커스페이스 및 디지털 인프라 장비 구축 협의"
    ],
    members: [
      { id: 1, type: "위원장", name: "김현수", org: "울산과학대학교", dept: "AID-X지원센터", rank: "센터장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "이정준", org: "울산과학대학교", dept: "기계공학부", rank: "교수", location: "교내", note: "" },
      { id: 3, type: "위원", name: "이상희", org: "청강문화산업대학교", dept: "혁신지원사업단", rank: "단장", location: "교외", note: "" },
      { id: 4, type: "간사", name: "민혜란", org: "울산과학대학교", dept: "AID-X지원센터", rank: "연구원", location: "교내", note: "" }
    ]
  },
  {
    id: "neulbom_op",
    name: "울산늘봄누리센터운영위원회",
    fullName: "울산늘봄누리센터운영위원회",
    badge: "교육늘봄기여",
    color: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    purpose: "울산형 늘봄학교 교육 콘텐츠 개발 및 강사 매칭 가이드 심의·확정",
    desc: "초등 교육 및 울산형 늘봄학교 연계 교육 프로그램의 표준화, 늘봄 강사 풀 선발 및 배치 가이드를 체계적으로 심의·조율하는 거버넌스입니다.",
    constitution: "센터장, 교육청 실무 오피서, 늘봄학교 연구교수 포함 5인 내외",
    cycle: "분기별 1회 정기 개최",
    functions: [
      "초등 맞춤형 늘봄 교육 교과 과정 공동 개발 심의",
      "우수 늘봄 강사 선발 요건 및 처우 기준 확정",
      "늘봄 교육 프로그램 만족도 평가 및 환류 검토"
    ],
    members: [
      { id: 1, type: "위원장", name: "홍광표", org: "울산과학대학교", dept: "울산늘봄누리센터", rank: "센터장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "서현영", org: "울산과학대학교", dept: "간호학부", rank: "학부장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "이수경", org: "거제대학교", dept: "-", rank: "교수", location: "교외", note: "" },
      { id: 4, type: "간사", name: "임서현", org: "울산과학대학교", dept: "울산늘봄누리센터", rank: "연구원", location: "교내", note: "" }
    ]
  },
  {
    id: "newind_op",
    name: "신산업특화센터운영위원회",
    fullName: "신산업특화센터운영위원회",
    badge: "신산업특화",
    color: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    purpose: "울산 특화 신산업(이차전지, 수소 등) 융합 교육과정 심의·확정",
    desc: "지역 핵심 먹거리인 신산업 특화 전공 개설 및 산업체 연계 기자재 공동 활용 방안을 정밀 심의·조율하는 첨단 신산업 조율 위원회입니다.",
    constitution: "센터장 및 신산업 특화 교원, 대기업/연구소 특화 전문가 포함 7인 내외",
    cycle: "반기별 1회 정기 개최",
    functions: [
      "이차전지 및 수소 등 첨단 특화 융합 마이크로디그리 교과 과정 심의",
      "신산업 특화 고가 장비 도입 및 구축 타당성 분석",
      "특화 분야 가족기업 협의체 구성 및 재직자 연수 교육과정 자문"
    ],
    members: [
      { id: 1, type: "위원장", name: "홍진숙", org: "울산과학대학교", dept: "신산업특화센터", rank: "센터장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "장광일", org: "울산과학대학교", dept: "화학공학과", rank: "교수", location: "교내", note: "" },
      { id: 3, type: "위원", name: "황영국", org: "조선이공대학교", dept: "산학협력단", rank: "단장", location: "교외", note: "" },
      { id: 4, type: "간사", name: "박지윤", org: "울산과학대학교", dept: "신산업특화센터", rank: "연구원", location: "교내", note: "" }
    ]
  }
];
